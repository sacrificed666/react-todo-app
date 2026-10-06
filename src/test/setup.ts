import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { loadMessages } from "@/features/i18n/model/catalog";
import { LOCALES } from "@/features/i18n/model/locales";

import { installDialogPolyfill } from "./dialog";
import { installPopoverPolyfill } from "./popover";

// A media query stub that only matches reduced motion
const matchMedia = (query: string): MediaQueryList => ({
  matches: query.includes("prefers-reduced-motion"),
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
});

Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: matchMedia });

installPopoverPolyfill();
installDialogPolyfill();

Object.assign(Element.prototype, {
  scrollIntoView() {},
  setPointerCapture() {},
  releasePointerCapture() {},
  hasPointerCapture: () => false,
});

await Promise.all(LOCALES.map(loadMessages));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
