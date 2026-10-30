// utils/normalizeResources.tsx
"use client";
import React from "react";
import type { ResourceProps } from "@refinedev/core";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BankOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ToolOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const ICON_MAP: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  BankOutlined: <BankOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  TagsOutlined: <TagsOutlined />,
  ToolOutlined: <ToolOutlined />,
  FormOutlined: <FormOutlined />,
  CheckCircleOutlined: <CheckCircleOutlined />,
  CloseCircleOutlined: <CloseCircleOutlined />,
};

// Accepts "<TeamOutlined />", "TeamOutlined", or undefined
function parseIcon(raw?: string): React.ReactNode | undefined {
  if (!raw) return undefined;
  const match = String(raw).match(
    /([A-Za-z]+Outlined|DashboardOutlined|AppstoreOutlined|FormOutlined|TagsOutlined|ToolOutlined|CheckCircleOutlined|CloseCircleOutlined|BankOutlined|UserOutlined|TeamOutlined)/
  );
  return match ? ICON_MAP[match[1]] : undefined;
}

// Simple labelizer for auto-created parents
function toTitle(name: string) {
  return name
    .split(/[\/_-]+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function normalizeResources(apiResources: any[]): ResourceProps[] {
  // 1) map icons (root "icon" or meta.icon string -> ReactNode)
  const mapped: ResourceProps[] = apiResources.map((r: any) => ({
    ...r,
    meta: {
      ...(r.meta ?? {}),
      icon: parseIcon(r.icon ?? r.meta?.icon),
      // label/parent are kept as-is
    },
  }));

  // 2) ensure all parents exist
  const names = new Set(mapped.map((r) => r.name));
  const missingParents = new Set<string>();
  for (const r of mapped) {
    const parent = r.meta?.parent as string | undefined;
    if (parent && !names.has(parent)) missingParents.add(parent);
  }

  const parentStubs: ResourceProps[] = Array.from(missingParents).map((name) => ({
    name,
    meta: { label: toTitle(name) },
  }));

  return [...parentStubs, ...mapped];
}
