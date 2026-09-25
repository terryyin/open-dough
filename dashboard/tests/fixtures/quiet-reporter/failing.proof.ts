import { expect, test } from "@playwright/test";

test("compares the wrong sum", () => {
  expect(1 + 1, "the substitute's deliberate mismatch").toBe(3);
});
