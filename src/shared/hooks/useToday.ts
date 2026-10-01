import { useSyncExternalStore } from "react";

import { toDateKey } from "../lib/date";

const REFRESH_INTERVAL = 60_000;
const listeners = new Set<() => void>();
let timer = 0;

const notify = () => {
  for (const listener of listeners) listener();
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (listeners.size === 1) timer = window.setInterval(notify, REFRESH_INTERVAL);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.clearInterval(timer);
  };
};

const getSnapshot = () => toDateKey(new Date());

export const useToday = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
