"use server";

import { cookies } from "next/headers";

export async function serverLogin(login: string, password: string , tenantid: any) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password, tenantid }),
    });

    if (!res.ok) {
      const body = await res.text(); // or .json() if your API returns JSON errors
      console.log("Login failed:", res.status, body);
      return { ok: false as const, message: "Credenciais invalidas" };
    }

    const data = await res.json() as { token: string; name: string };

    // Next.js cookies() expects maxAge in SECONDS, not ms
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    const cookieStore = await cookies();

  cookieStore.set("session", data.token, {
    maxAge,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
    return { ok: true as const };
  } catch (err) {
    console.log("Login error:", err);
    return { ok: false as const, message: "Login error" };
  }
}

