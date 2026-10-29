"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import type { TenantBranding } from "@/tenants/types";

// Create the context
const TenantContext = createContext<TenantBranding | null>(null);

// Provider component
export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantBranding;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={tenant}>
      {children}
    </TenantContext.Provider>
  );
}

// Custom hook to access tenant anywhere
export function useTenant(): TenantBranding {
  const tenant = useContext(TenantContext);

  if (!tenant) {
    throw new Error(
      "useTenant must be used inside TenantProvider"
    );
  }

  return tenant;
}