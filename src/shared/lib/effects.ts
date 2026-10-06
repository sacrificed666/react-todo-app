export type EffectsLevel = "full" | "reduced";

const listeners = new Set<() => void>();
let current: EffectsLevel = "reduced";

// The effects level in use
export const getEffectsLevel = () => current;

// Changes the effects level and tells every subscriber
export const setEffectsLevel = (level: EffectsLevel) => {
  if (level === current) return;
  current = level;
  for (const listener of listeners) listener();
};

// Registers a listener for effects changes
export const subscribeToEffects = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Full effects only on Apple devices with eight or more cores
export const prefersRichEffects = (
  userAgent = globalThis.navigator.userAgent,
  cores = globalThis.navigator.hardwareConcurrency,
) => /Mac|iPhone|iPad|iPod/.test(userAgent) && cores >= 8;
