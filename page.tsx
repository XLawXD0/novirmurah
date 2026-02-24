"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    const r = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setMsg(j?.message || "Gagal register");

    setMsg("Register sukses. Silakan login.");
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Register</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="password (min 6)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Buat akun</button>
      </form>
      {msg ? <p>{msg}</p> : null}
      <p style={{ marginTop: 12 }}>
        Sudah punya akun? <a href="/login">Login</a>
      </p>
    </div>
  );
}