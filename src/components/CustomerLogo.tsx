"use client";

import Image from "next/image";
import { useTenant } from "@/providers/TenantProvider";

export function CustomerLogo() {
  const tenant = useTenant();

  return (
    <Image
      src={tenant.logo}
      alt={tenant.name}
      width={tenant.logoWidth}
      height={tenant.logoHeight}
      style={{ objectFit: "contain" }}
       loading="eager"
    />
  );
}