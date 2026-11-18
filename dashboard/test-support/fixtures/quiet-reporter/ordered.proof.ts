import { expect, test } from "@playwright/test";

test("finishes before the stopped test", () => {
  expect(1 + 1).toBe(2);
});

// Stopped by the run's deadline or a signal within its default case timeout.
test("is still running when stopped", async () => {
  await new Promise(() => {});
});
