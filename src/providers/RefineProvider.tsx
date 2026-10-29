"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import type { ReactNode } from "react";

import AppShell from "@/components/AppShell";

export default function RefineProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Refine
      routerProvider={routerProvider}
      resources={[
        {
          name: "dashboard",
          list: "/signed/dashboard",
        },
        {
          name: "produtos",
          list: "/signed/produtos",
        },
        {
          name: "os",
          list: "/signed/os",
        },
      ]}
      options={{
        syncWithLocation: true,
      }}
    >
      <AppShell>{children}</AppShell>
    </Refine>
  );
}