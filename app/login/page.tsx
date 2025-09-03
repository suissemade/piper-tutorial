"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit() {
    setErr("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) router.push("/");
    else setErr("Wrong code. Try again.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Let me in already!</h1>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
          placeholder="Your passcode"
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <button
          onClick={submit}
          className="w-full rounded-lg bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition"
        >
          Continue
        </button>

        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>
    </main>
  );
}
