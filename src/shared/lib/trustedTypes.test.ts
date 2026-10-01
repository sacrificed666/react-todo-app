import { describe, expect, it, vi } from "vitest";

import { installScriptUrlPolicy } from "./trustedTypes";

type CreateScriptUrl = (input: string) => string;

describe("installScriptUrlPolicy", () => {
  it("does nothing without Trusted Types support", () => {
    expect(installScriptUrlPolicy(["/sw.js"])).toBe(false);
  });

  it("allows only same-origin scripts from the allow list", () => {
    const policy: { createScriptURL?: CreateScriptUrl } = {};
    vi.stubGlobal("trustedTypes", {
      createPolicy: (_name: string, options: { createScriptURL: CreateScriptUrl }) => {
        policy.createScriptURL = options.createScriptURL;
      },
    });

    expect(installScriptUrlPolicy(["/react-todo-app/sw.js"])).toBe(true);
    expect(policy.createScriptURL?.("/react-todo-app/sw.js")).toBe(`${location.origin}/react-todo-app/sw.js`);
    expect(() => policy.createScriptURL?.("/react-todo-app/evil.js")).toThrow(TypeError);
    expect(() => policy.createScriptURL?.("https://example.com/react-todo-app/sw.js")).toThrow(TypeError);
  });
});
