"use client";
import api from "@/services/api"
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { normalizeResources } from "./normalizeResource"
import { getCookieClient } from '@/lib/cookieClient'
import { getCookieServer } from '@/lib/cookieServer'
import { dataProviderServerside } from "@/providers/data-provider/dataProviderServerside";
import { dataProvider } from "@/providers/data-provider/index";
import { authProvider } from "@/providers/auth-provider"
import { useNotificationProvider } from "@refinedev/antd";

import { useEffect, useState,ReactNode } from "react"

import AppShell from "@/components/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultMode =  "light";

const [configmenu, setConfigmenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  async function fetchMenu() {
    try {
      
      const token = await getCookieClient();

      const response = await api.get("/menuacesso", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConfigmenu(response.data);

      setLoading(false);
    } catch (error) {
      window.location.href = "/";

    }
  }

  fetchMenu();
}, []);
  if (loading) return <div>Loading menu...</div>;
  const resources = normalizeResources(configmenu);

  console.log(resources)

  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProviderServerside}
      authProvider={authProvider}
      notificationProvider={useNotificationProvider}
      resources={resources} 
      options={{
        syncWithLocation: true,
      }}
    >
      <AppShell>{children}</AppShell>
    </Refine>
  );
}