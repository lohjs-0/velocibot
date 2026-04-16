import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function rateLimit(ip: string) {
  const key = `rate:${ip}`;
  const requests = await redis.incr(key);
  if (requests === 1) {
    await redis.expire(key, 60);
  }
  return requests <= 10;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = process.env.INTERNAL_API_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Token não configurado" },
        { status: 500 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    if (!(await rateLimit(ip))) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    if (!body?.message || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Mensagem inválida" },
        { status: 400 }
      );
    }

    if (body.message.length > 8000) {
      return NextResponse.json(
        { error: "Mensagem muito grande" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://velocibot-production.up.railway.app/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-token": token,
        },
        body: JSON.stringify({
          prompt: body.message,
          image: body.image || null,
          history: body.history || [],
          memory: body.memory || "",
        }),
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("❌ erro route.ts:", error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}