import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

import { installPopoverPolyfill } from "./popover";

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

afterEach(() => {
  cleanup();
  localStorage.clear();
});
