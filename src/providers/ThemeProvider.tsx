"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import { useTenant } from "./TenantProvider";
import type { ReactNode, CSSProperties } from "react";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const tenant = useTenant();

  const cssVariables = {
    "--tenant-primary": tenant.colors.primary,
    "--tenant-background": tenant.colors.background,
    "--tenant-surface": tenant.colors.surface,
    "--tenant-text": tenant.colors.text,
    "--tenant-radius": `${tenant.borderRadius}px`,
  } as CSSProperties;

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,

        token: {
          colorPrimary: tenant.colors.primary,
          colorBgBase: tenant.colors.background,
          colorTextBase: tenant.colors.text,
          borderRadius: tenant.borderRadius,
        },

        components: {
          Layout: {
            bodyBg: tenant.colors.background,
            headerBg: tenant.colors.surface,
            siderBg: tenant.colors.surface,
          },

          Card: {
            colorBgContainer: tenant.colors.surface,
          },

          Button: {
            primaryShadow: "none",
          },
        },
      }}
    >
      <div
        style={{
          ...cssVariables,
          minHeight: "100vh",
          background: tenant.colors.background,
          color: tenant.colors.text,
        }}
      >
        {children}
      </div>
    </ConfigProvider>
  );
}
