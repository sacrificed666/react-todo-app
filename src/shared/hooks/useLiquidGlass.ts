import { useLayoutEffect, type RefObject } from "react";

import { attachRefraction, isRefractionSupported, type RefractionOptions } from "../lib/refraction";

export const useLiquidGlass = (ref: RefObject<HTMLElement | null>, { bezel, scale }: RefractionOptions = {}) => {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !isRefractionSupported()) return;
    return attachRefraction(element, { bezel, scale });
  }, [ref, bezel, scale]);
};
