import { useSyncExternalStore } from "react";

import { toDateKey } from "../lib/date";

const REFRESH_INTERVAL = 60_000;

const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, REFRESH_INTERVAL);
  return () => clearInterval(timer);
};

const getSnapshot = () => toDateKey(new Date());

export const useToday = () => useSyncExternalStore(subscribe, getSnapshot);
