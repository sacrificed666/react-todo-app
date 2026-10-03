import { useLayoutEffect, type RefObject } from "react";

import { attachRefraction, isRefractionSupported, type RefractionOptions } from "../lib/refraction";
import { useEffectsLevel } from "./useEffectsLevel";

export const useRefraction = (ref: RefObject<HTMLElement | null>, { bezel, scale }: RefractionOptions = {}) => {
  const level = useEffectsLevel();

  useLayoutEffect(() => {
    const element = ref.current;
    if (level !== "full" || !element || !isRefractionSupported()) return;
    return attachRefraction(element, { bezel, scale });
  }, [ref, bezel, scale, level]);
};
