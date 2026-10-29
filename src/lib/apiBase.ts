export function resolveApiBase() {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";
  const { Capacitor } = (window as any);
  if (Capacitor?.getPlatform?.() === "android") {
    return process.env.NEXT_PUBLIC_API_ANDROID ?? "http://10.0.2.2:3000";
  }
  return process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:3000";
}
