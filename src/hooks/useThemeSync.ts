import { useEffect } from "react";

import { applyTheme } from "@/lib/theme";
import { useAppSelector } from "@/store/hooks";
import { selectSettings } from "@/store/selectors";

export const useThemeSync = () => {
  const settings = useAppSelector(selectSettings);

  useEffect(() => {
    applyTheme(settings);
    const media = globalThis.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => applyTheme(settings);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [settings]);
};
