// Each fast store rule owns its machine home, including arrangement and cleanup.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base } from "./pageTest.ts";
import { withRestoredEnv } from "./testEnv.ts";
import { keptRecords } from "../../server/launchRecordStore.ts";
import {
  preferredReviewRun,
  reviewLandedRunsOf,
  reviewRunKey,
} from "../../src/storyReviewLandedRun.ts";

export { expect } from "./pageTest.ts";
export const test = base.extend<{ recordHome: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  recordHome: async ({}, use) => {
    const recordHome = mkdtempSync(
      path.join(tmpdir(), "dough-review-records-"),
    );
    const restore = withRestoredEnv({ HOME: recordHome });
    try {
      await use(recordHome);
    } finally {
      restore();
      rmSync(recordHome, { recursive: true, force: true });
    }
  },
});

export const storedReviewRuns = async () =>
  reviewLandedRunsOf(
    await keptRecords("open-dough"),
    "open-dough",
    "SEED-A#a",
    () => true,
  );

export function preferredReviewKey(
  runs: Awaited<ReturnType<typeof storedReviewRuns>>,
) {
  const chosen = preferredReviewRun(runs, ({ record }) => record.landing);
  return chosen === undefined ? undefined : reviewRunKey(chosen.record);
}
