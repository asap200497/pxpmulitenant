import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { tenants } from "@/tenants/config";

import { TenantProvider } from "@/providers/TenantProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import RefineProvider from "@/providers/RefineProvider";

export default async function SignedApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const tenant = tenants[session.tenantid];

  if (!tenant) {
    redirect("/");
  }

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider>
        <RefineProvider>{children}</RefineProvider>
      </ThemeProvider>
    </TenantProvider>
  );
}