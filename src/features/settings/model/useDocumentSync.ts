import { useEffect } from "react";

import { useAppSelector } from "@/app/hooks";

import { selectSettings } from "./selectors";
import { applySettings } from "./settings";

export const useDocumentSync = () => {
  const settings = useAppSelector(selectSettings);

  useEffect(() => {
    applySettings(settings);
    const media = globalThis.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => applySettings(settings);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [settings]);
};
