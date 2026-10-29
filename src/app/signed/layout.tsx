// src/app/signed/layout.tsx

import SignedApp from "@/components/SignedApp";

export default function SignedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SignedApp>{children}</SignedApp>;
}