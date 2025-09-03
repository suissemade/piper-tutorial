// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutorPrompt";

export const runtime = "edge";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Narrow the message type so the OpenAI SDK is happy
type InMsg = { role: "system" | "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: InMsg[] };

  // Prepend our Socratic tutor rules
  const fullMessages: InMsg[] = [
    { role: "system", content: TUTOR_SYSTEM_PROMPT },
    ...messages,
  ];

  // Ensure the union type matches the SDK's expected shape
  const mapped = fullMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    stream: true,
    messages: mapped,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content ?? "";
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
