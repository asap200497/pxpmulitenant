import type { TenantBranding } from "./types";

export const tenants: Record<string, TenantBranding> = {
  printxpert: {
    id: "printxpert",
    name: "PrintXPert",
    logo: "/logos/PrintXpert-Logo.png",
    logoWidth: 220,
    logoHeight: 170,
    colors: {
      primary: "#1677ff",
      background: "#f5f5f5",
      surface: "#ffffff",
      text: "#222222",
    },
    borderRadius: 8,
  },

  passaporte: {
    id: "passaporte",
    name: "Passaporte",
    logo: "/logos/passaportelogo.png",
    logoWidth: 220,
    logoHeight: 80,
    colors: {
      primary: "#18794e",
      background: "#edf7f1",
      surface: "#ffffff",
      text: "#183b2a",
    },
    borderRadius: 12,
  },
};

export function getTenant(id?: string | null): TenantBranding {
  return tenants[id ?? ""] ?? tenants.printxpert;
}