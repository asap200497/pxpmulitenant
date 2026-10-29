
import { Suspense } from "react";

import { getTenant } from "@/tenants/config";
import { TenantProvider } from "@/providers/TenantProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { CustomerLogo } from "@/components/CustomerLogo";
import { LoginPanel } from "@/components/LoginPanel";

type HomeProps = {
  searchParams: Promise<{
    customer?: string | string[];
  }>;
};

// Inner component: reads URL parameters
async function HomeContent({ searchParams }: HomeProps) {
  const params = await searchParams;

  const customer =
    typeof params.customer === "string"
      ? params.customer
      : undefined;

  const tenant = getTenant(customer);

  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ width: 400, maxWidth: "100%" }}>
            <CustomerLogo />
            <LoginPanel />
          </div>
        </main>
      </ThemeProvider>
    </TenantProvider>
  );
}

// Outer component: establishes the Suspense boundary
export default function Home({ searchParams }: HomeProps) {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}