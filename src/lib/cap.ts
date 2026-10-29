export const isBrowser = typeof window !== "undefined";

export const getPlatform = () => {
  if (!isBrowser) return "web";
  const { Capacitor } = (window as any).Capacitor || {};
  return Capacitor?.getPlatform?.() ?? "web";
};

export const isNative = () => {
  const p = getPlatform();
  return p === "ios" || p === "android";
};

export const safeCap = async <T = any>(pluginName: string): Promise<T | null> => {
  if (!isNative()) return null;
  const { Capacitor } = (window as any).Capacitor || {};
  if (Capacitor?.isPluginAvailable?.(pluginName)) {
    const mod = await import(`@capacitor/${pluginName.toLowerCase()}`);
    return (mod?.default || mod) as T;
  }
  return null;
};
