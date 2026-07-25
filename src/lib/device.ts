/**
 * Capability hints used to decide whether to run the interactive 3D hero or
 * fall back to a static image. Deliberately conservative: a single low-poly
 * cube is cheap, so only genuinely weak devices (or a reduced-motion request)
 * skip it — everything else gets the real thing, with `PerformanceMonitor`
 * dialing quality at runtime.
 */
export type DeviceHints = {
  reducedMotion: boolean;
  /** `navigator.hardwareConcurrency`, if exposed. */
  hardwareConcurrency?: number;
  /** `navigator.deviceMemory` in GB (Chromium-only), if exposed. */
  deviceMemory?: number;
};

/** Whether to prefer the static cube over the interactive WebGL one. */
export const prefersStaticCube = ({
  reducedMotion,
  hardwareConcurrency,
  deviceMemory,
}: DeviceHints): boolean => {
  if (reducedMotion) return true;
  if (typeof deviceMemory === "number" && deviceMemory <= 2) return true;
  if (typeof hardwareConcurrency === "number" && hardwareConcurrency <= 2)
    return true;
  return false;
};
