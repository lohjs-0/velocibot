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

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

if (!MISTRAL_API_KEY) {
  console.error("❌ MISTRAL_API_KEY não definida");
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

async function runAI(messages, hasImage = false) {
  try {
    const model = hasImage ? "pixtral-12b-2409" : "mistral-small-latest";

    const res = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [...messages],
          max_tokens: 4096,
          temperature: 0.9,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ erro Mistral:", data);
      return null;
    }

    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("❌ erro IA:", err.message);
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

    const aiResponse = await runAI(messages, !!image);

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