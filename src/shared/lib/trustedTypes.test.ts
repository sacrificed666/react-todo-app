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

    expect(installScriptUrlPolicy(["/tasks/sw.js"])).toBe(true);
    expect(policy.createScriptURL?.("/tasks/sw.js")).toBe(`${location.origin}/tasks/sw.js`);
    expect(() => policy.createScriptURL?.("/tasks/evil.js")).toThrow(TypeError);
    expect(() => policy.createScriptURL?.("https://example.com/tasks/sw.js")).toThrow(TypeError);
  });
});
