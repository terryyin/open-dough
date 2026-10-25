import { expect, test } from "@playwright/test";
import { registerCases } from "./cases.ts";

// One own test plus the two from the case module: the times file records
// their sum (at least 0.5 from the imported waits alone) under this file's
// label, and no line for `nested/cases.ts`.
test("own test", () => {
  expect(1 + 1).toBe(2);
});

registerCases();
