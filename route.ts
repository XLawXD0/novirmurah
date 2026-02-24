import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || "").toLowerCase().trim();
  const password = String(body?.password || "");

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ ok: false, message: "Email/password invalid (min 6 char)" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ ok: false, message: "Email sudah terdaftar" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash }
  });

  return NextResponse.json({ ok: true });
}