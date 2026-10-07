import { test } from "@playwright/test";

// Never finishes on its own, so only the run's deadline ends it.
test("waits past the deadline", async () => {
  test.setTimeout(0);
  await new Promise(() => {});
});
