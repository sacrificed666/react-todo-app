import { describe, expect, it } from "vitest";

import { displacementAt, isRefractionSupported } from "./refraction";

describe("displacementAt", () => {
  const size = [200, 60, 30, 20] as const;

  it("keeps the center of the surface undistorted", () => {
    expect(displacementAt(100, 30, ...size)).toEqual([128, 128]);
  });

  it("pulls samples inward along each edge", () => {
    const [leftRed, leftGreen] = displacementAt(80, 0, ...size);
    const [rightRed] = displacementAt(199, 30, ...size);
    const [, bottomGreen] = displacementAt(100, 59, ...size);

    expect(leftGreen).toBeGreaterThan(200);
    expect(leftRed).toBe(128);
    expect(rightRed).toBeLessThan(60);
    expect(bottomGreen).toBeLessThan(60);
  });

  it("bends diagonally in rounded corners", () => {
    const [red, green] = displacementAt(4, 4, ...size);
    expect(red).toBeGreaterThan(128);
    expect(green).toBeGreaterThan(128);
  });
});

describe("isRefractionSupported", () => {
  it("is disabled outside Chromium", () => {
    expect(isRefractionSupported()).toBe(false);
  });
});
