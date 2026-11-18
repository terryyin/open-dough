import { test } from "@playwright/test";

// Never finishes on its own. The run's deadline or a signal stops it well
// within its own default case timeout, which only bounds a run whose stop
// never comes.
test("waits past the deadline", async () => {
  await new Promise(() => {});
});
