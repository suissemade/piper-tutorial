// app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutorPrompt";

// add near the top of the file (below imports)
type InMsg = { role: "system" | "user" | "assistant"; content: string };

// later, after you build fullMessages:
const mapped = (fullMessages as InMsg[]).map(m => ({
  role: m.role,           // now narrowed to the exact union
  content: m.content,
}));


export const runtime = "edge"; // Faster on Vercel and locally.

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // make sure this is in .env.local
});

export async function POST(req: NextRequest) {
  // Messages come from the browser (your chat UI)
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
  };

  // Always prepend our tutor rules
  const fullMessages = [
    { role: "system", content: TUTOR_SYSTEM_PROMPT },
    ...messages,
  ];

  // Ask OpenAI and enable streaming so text appears as it's generated
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini", // you can change to another chat model on your account
    temperature: 0.4,     // smaller = more focused / consistent
    stream: true,
    messages: mapped,
  });

  // Convert the stream to a web ReadableStream for the browser
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
