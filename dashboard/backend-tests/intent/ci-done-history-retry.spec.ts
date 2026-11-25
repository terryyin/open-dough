// Corrupt and retry the actual local history reader; neither contacts Actions.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { withBrokenCollectedHistory } from "../../test-support/support/collectedScopeHistory.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";

const source = makeMe.aPublishedSource.openDough.please();
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("a failed local Done history refresh and its restored retry ask Actions nothing", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-done-history-retry-"));
  await keepLandedCiHistory(home, makeMe.aLandedCiHistory.please());
  const query = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    revision: "c".repeat(40),
    through: "2026-11-09T00:00:00Z",
    "gap-reasons": "timing-basis",
    history: "glance",
  });
  const read = parseIntentCiHistoryRead(query);
  expect(read).toMatchObject({ kind: "intent-ci-history" });
  if (read?.kind !== "intent-ci-history") return;
  await withBrokenCollectedHistory(home, async (restore) => {
    const failed = await performIntentCiHistoryRead(source, read, { home });
    expect(failed).toMatchObject({
      kind: "failed",
      message:
        "The collected CI history could not be read. Retry the local history read.",
    });
    restore();
    const retried = await performIntentCiHistoryRead(source, read, { home });
    expect(retried).toMatchObject({
      kind: "answered",
      answer: { selectedRevision: "c".repeat(40) },
    });
  });
});
