import { cookies } from "next/headers";

import { getTenant } from "@/tenants/config";
import { TenantProvider } from "@/providers/TenantProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import RefineProvider from "@/providers/RefineProvider";

export default async function SignedApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const customer =
    cookieStore.get("demo-tenant")?.value ?? "printxpert";

  const tenant = getTenant(customer);

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider>
        <RefineProvider>{children}</RefineProvider>
      </ThemeProvider>
    </TenantProvider>
  );
}