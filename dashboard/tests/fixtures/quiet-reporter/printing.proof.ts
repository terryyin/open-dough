import { expect, test } from "@playwright/test";

test("passes but chatters", () => {
  console.log("stray chatter from a passing spec");
  expect(1 + 1).toBe(2);
});
