import "dotenv/config";
import express from "express";
import cors from "cors";
import { Octokit } from "@octokit/rest";

import {
  generateIssueComment,
  generatePRComment,
  generateStaleComment,
  generateThanksResponse,
} from "./src/velocibot.js";

import {
  VELOCIBOT_SYSTEM,
  buildChatMessages,
} from "./src/ai.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "10mb" }));

app.use(
  cors({
    origin: [
      "https://velocibot.vercel.app",
      "http://localhost:3000",
    ],
  })
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY não definida");
  process.exit(1);
}

if (!INTERNAL_API_TOKEN) {
  console.error("❌ INTERNAL_API_TOKEN não definido");
  process.exit(1);
}

const octokit = process.env.GITHUB_TOKEN
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : null;

const requests = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function rateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const windowTime = Number(process.env.RATE_LIMIT_WINDOW) || 60000;
  const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 20;

  if (!requests.has(ip)) {
    requests.set(ip, []);
  }

  const timestamps = requests
    .get(ip)
    .filter((t) => now - t < windowTime);

  timestamps.push(now);
  requests.set(ip, timestamps);

  return timestamps.length <= maxRequests;
}

function validateInternalToken(req) {
  const token = req.headers["x-internal-token"];
  return token && token === INTERNAL_API_TOKEN;
}

function sanitizeMemory(memory) {
  if (!memory || typeof memory !== "string") return "";
  // Trunca pra evitar injeção de contexto gigante
  const truncated = memory.slice(0, 500);
  // Remove padrões comuns de prompt injection
  return truncated
    .replace(/ignore\s+(todas?\s+)?(as\s+)?instru[çc][oõ]es/gi, "")
    .replace(/system\s*prompt/gi, "")
    .replace(/\[SYSTEM\]/gi, "")
    .replace(/\[INSTRUÇÃO\]/gi, "")
    .replace(/você agora é/gi, "")
    .replace(/novo papel/gi, "");
}

function validateImage(image) {
  if (!image || typeof image !== "string") return false;
  // Aceita base64 de imagem ou URL http(s)
  const isBase64Image = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(image);
  const isHttpUrl = /^https?:\/\/.+/.test(image);
  return isBase64Image || isHttpUrl;
}

async function imageUrlToPart(url) {
  if (!url || typeof url !== "string") return null;

  if (url.startsWith("data:image/")) {
    const match = url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2],
      },
    };
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const response = await fetch(url);
    if (!response.ok) return null;
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      inlineData: {
        mimeType: mimeType.split(";")[0],
        data: buffer.toString("base64"),
      },
    };
  }

  return null;
}

async function contentToParts(content) {
  if (typeof content === "string") {
    return [{ text: content }];
  }

  if (!Array.isArray(content)) {
    return [{ text: String(content ?? "") }];
  }

  const parts = [];
  for (const item of content) {
    if (item?.type === "text") {
      parts.push({ text: item.text || "" });
    } else if (item?.type === "image_url") {
      const imageUrl = typeof item.image_url === "string"
        ? item.image_url
        : item.image_url?.url;
      const imagePart = await imageUrlToPart(imageUrl);
      if (imagePart) parts.push(imagePart);
    }
  }
  return parts.length ? parts : [{ text: "" }];
}

async function runAI(messages) {
  try {
    const systemMessage = messages.find((message) => message.role === "system");
    const contents = [];

    for (const message of messages.filter((message) => message.role !== "system")) {
      contents.push({
        role: message.role === "assistant" ? "model" : "user",
        parts: await contentToParts(message.content),
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(systemMessage
            ? { systemInstruction: { parts: [{ text: systemMessage.content }] } }
            : {}),
          contents,
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ erro Gemini:", data);
      return null;
    }

    return data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || null;
  } catch (error) {
    console.error("❌ erro IA:", error.message);
    return null;
  }
}
app.get("/", (_, res) => {
  res.send("🦖 VelociBot ativo e protegido");
});

app.post("/analyze", async (req, res) => {
  if (!validateInternalToken(req)) {
    return res.status(401).json({ error: "unauthorized" });
  }

  if (!rateLimit(req)) {
    return res.status(429).json({ error: "too many requests" });
  }

  const { prompt, image, history = [], memory = "" } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "prompt inválido" });
  }

  if (prompt.length > 8000) {
    return res.status(400).json({ error: "prompt muito grande" });
  }

  // Valida imagem se enviada
  if (image && !validateImage(image)) {
    return res.status(400).json({ error: "imagem inválida" });
  }

  try {
    let messages;

    // Sanitiza memória antes de injetar no system prompt
    const cleanMemory = sanitizeMemory(memory);
    const systemWithMemory = cleanMemory
      ? `${VELOCIBOT_SYSTEM}\n\n[MEMÓRIA DO USUÁRIO - use isso para personalizar suas respostas]:\n${cleanMemory}`
      : VELOCIBOT_SYSTEM;

    if (image) {
      const historyMessages = history.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

      messages = [
        { role: "system", content: systemWithMemory },
        ...historyMessages,
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: image },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ];
    } else {
      const formattedHistory = history.map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

      messages = buildChatMessages(systemWithMemory, formattedHistory, prompt);
    }

    const aiResponse = await runAI(messages);

    return res.json({
      response: aiResponse || "não consegui analisar isso direito",
    });
  } catch (err) {
    console.error("❌ erro /analyze:", err);
    return res.status(500).json({ error: "erro interno" });
  }
});

app.listen(PORT, () => {
  console.log(`🦖 VelociBot rodando na porta ${PORT}`);
});
