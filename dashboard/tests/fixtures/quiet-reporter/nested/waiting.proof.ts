import { expect, test } from "@playwright/test";

// Two waits in one file under a subdirectory: its recorded seconds are their
// sum (at least 1.2), not the longer one, under the label `nested/…`.
test("waits longer", async () => {
  await new Promise((resolve) => setTimeout(resolve, 700));
  expect(1 + 1).toBe(2);
});

test("waits", async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(1 + 1).toBe(2);
});
