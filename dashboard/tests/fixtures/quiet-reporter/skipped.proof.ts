import { test } from "@playwright/test";

test.skip("does not execute an assertion", () => {
  throw new Error("a skipped assertion must not run");
});
