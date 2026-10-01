export type EffectsLevel = "full" | "lite";

const listeners = new Set<() => void>();
let current: EffectsLevel = "lite";

export const getEffectsLevel = () => current;

export const setEffectsLevel = (level: EffectsLevel) => {
  if (level === current) return;
  current = level;
  for (const listener of listeners) listener();
};

export const subscribeToEffects = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const prefersRichEffects = (
  userAgent = globalThis.navigator.userAgent,
  cores = globalThis.navigator.hardwareConcurrency,
) => /Mac|iPhone|iPad|iPod/.test(userAgent) && cores >= 8;
