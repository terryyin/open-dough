// Refresh owns its checking state through filter reads and its current-cohort reread.
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsageSource } from "../../src/usageSource.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

const oldCheck = "2026-11-15T09:00:00.000Z";
const nextCheck = "2026-11-15T10:00:00.000Z";
const tenthTask = "2026-11-10T12:00:00.000Z";
const executions = () =>
  makeMe.aTokenIndexAnswer
    .with({
      indexes: [
        1_000, 1_100, 1_200, 1_300, 1_400, 1_500, 1_600, 1_700, 1_800, 1_900,
      ],
    })
    .withTrend([{ at: tenthTask, value: 1_450 }])
    .checkedAt(oldCheck)
    .please();
const refinements = (at: string, extra = 0) =>
  makeMe.aTokenIndexAnswer
    .inWorkflow("refinement")
    .with({
      indexes: [
        2_000, 2_100, 2_200, 2_300, 2_400, 2_500, 2_600, 2_700, 2_800, 2_900,
      ].map((value) => value + extra),
    })
    .withTrend([{ at: tenthTask, value: 2_450 + extra }])
    .checkedAt(at)
    .please();

test("checking survives a selected cohort read and waits for Refresh's selected-cohort reread", async () => {
  let refreshStarted = false;
  let releaseRefresh!: () => void;
  const refreshHeld = new Promise<void>((resolve) => {
    releaseRefresh = resolve;
  });
  let releaseSelection!: () => void;
  const selectionHeld = new Promise<void>((resolve) => {
    releaseSelection = resolve;
  });
  let releaseReread!: () => void;
  const rereadHeld = new Promise<void>((resolve) => {
    releaseReread = resolve;
  });
  let selectedReads = 0;
  const source: UsageSource = {
    read: async (cohort) => {
      if (cohort.workflow !== "refinement") {
        return executions();
      }
      selectedReads += 1;
      if (selectedReads === 1) {
        await selectionHeld;
        return refinements(oldCheck);
      }
      await rereadHeld;
      return refinements(nextCheck, 1_000);
    },
    refresh: () => {
      refreshStarted = true;
      return refreshHeld;
    },
  };

  const usage = await mountUsage(source);
  await usage.showsMedian("1,450");
  await usage.refresh();
  await expect.poll(() => refreshStarted).toBe(true);
  await usage.showsChecking();
  await usage.choose("Launch workflow", "Refinement");
  await expect.poll(() => selectedReads).toBe(1);
  await usage.showsChecking();
  releaseSelection();
  await usage.showsMedian("2,450");
  await usage.showsChecking();
  releaseRefresh();
  await expect.poll(() => selectedReads).toBe(2);
  await usage.showsChecking();
  await usage.showsMedian("2,450");
  releaseReread();
  await usage.showsMedian("3,450");
  await usage.showsCheckedAt(nextCheck);
  await usage.showsChecked();
});

test("a failed Refresh after a filter change retains the selected chart and time beside its error", async () => {
  let refreshStarted = false;
  let rejectRefresh!: (reason: Error) => void;
  const refreshHeld = new Promise<void>((...[, reject]) => {
    rejectRefresh = reject;
  });
  const selectedCheck = "2026-11-15T09:30:00.000Z";
  const source: UsageSource = {
    read: (cohort) =>
      Promise.resolve(
        cohort.workflow === "refinement"
          ? refinements(selectedCheck)
          : executions(),
      ),
    refresh: () => {
      refreshStarted = true;
      return refreshHeld;
    },
  };

  const usage = await mountUsage(source);
  await usage.showsMedian("1,450");
  await usage.refresh();
  await expect.poll(() => refreshStarted).toBe(true);
  await usage.choose("Launch workflow", "Refinement");
  await usage.showsMedian("2,450");
  await usage.showsCheckedAt(selectedCheck);
  await usage.showsChecking();
  rejectRefresh(
    new Error("Usage could not be refreshed: rollouts unavailable."),
  );
  await usage.showsProblem(
    "Usage could not be refreshed: rollouts unavailable.",
  );
  await usage.showsMedian("2,450");
  await usage.showsCheckedAt(selectedCheck);
  await usage.showsChecked();
});
