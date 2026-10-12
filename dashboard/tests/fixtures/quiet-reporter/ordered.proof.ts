import { expect, test } from "@playwright/test";

test("finishes before the stopped test", () => {
  expect(1 + 1).toBe(2);
});

test("is still running when stopped", async () => {
  test.setTimeout(0);
  await new Promise(() => {});
});
