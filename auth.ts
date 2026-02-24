import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, role: user.role, balance: user.balance } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role;
        token.balance = (user as any).balance;
      } else if (token?.uid) {
        // refresh balance tiap login/refresh token (simple)
        const dbUser = await prisma.user.findUnique({ where: { id: String(token.uid) } });
        if (dbUser) token.balance = dbUser.balance;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = token.uid;
      (session as any).user.role = token.role;
      (session as any).user.balance = token.balance;
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
};