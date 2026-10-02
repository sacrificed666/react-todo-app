import { useEffect, useEffectEvent, useRef } from "react";

import { isRecord } from "@/shared/lib/guards";

const MARKER = "todoOverlay";

const currentMarker = () => {
  const state: unknown = globalThis.history.state;
  return isRecord(state) ? state[MARKER] : undefined;
};

export const useBackToClose = (open: boolean, onBack: () => void) => {
  const marker = useRef<string | null>(null);
  const handleBack = useEffectEvent(onBack);

  useEffect(() => {
    if (open && marker.current === null) {
      const id = crypto.randomUUID();
      const state: unknown = globalThis.history.state;
      globalThis.history.pushState({ ...(isRecord(state) ? state : {}), [MARKER]: id }, "");
      marker.current = id;
    } else if (!open && marker.current !== null) {
      const id = marker.current;
      marker.current = null;
      if (currentMarker() === id) globalThis.history.back();
    }
  }, [open]);

  useEffect(() => {
    const handlePopState = () => {
      if (marker.current === null || currentMarker() === marker.current) return;
      marker.current = null;
      handleBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
};
