import { expect, test } from "@playwright/test";

// A case module: tests registered from a module the spec imports. Their
// `location.file` is this module; Playwright places them under the importing
// spec's file suite, whose label the times file carries (support/specTimes.ts).
export function registerCases(): void {
  test("imported case waits longer", async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(1 + 1).toBe(2);
  });

  test("imported case waits", async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(1 + 1).toBe(2);
  });
}
