"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";

export interface UserSession {
 // id: string;
  name: string;
  //login: string;
  tenantid: string;
 // grupos?: string[];
}

const SessionContext = createContext<UserSession | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: UserSession;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);

  if (!session) {
    throw new Error("useSession requires SessionProvider");
  }

  return session;
}