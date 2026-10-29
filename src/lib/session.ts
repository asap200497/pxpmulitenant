import "server-only";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import type { SessionPayload } from "@/interfaces/Session"
const secret = process.env.JWT_SECRET;

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("session")?.value;

  if (!token || !secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: ["HS256"],
      }
    );

    if (
      typeof payload.sub !== "string" ||
      typeof payload.tenantid !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      tenantid: payload.tenantid,
      name: payload.name,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}