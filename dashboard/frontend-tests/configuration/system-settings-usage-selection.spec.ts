// Each selection shows only its own current read: a failure lasts until that
// selection is read again, and an answer for a selection already left never
// joins the one now shown.
import { afterEach, beforeEach, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { UsageSource } from "../../src/usageSource.ts";
import type { TokenIndexAnswer, UsageTool } from "../../src/usageTokenIndex.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

const answerFor = (tool: UsageTool) =>
  makeMe.aTokenIndexAnswer
    .with({ indexes: tool === "claude" ? [3_000] : [1_000, 2_000] })
    .forCohort({ tool })
    .please();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

test("a failure leaves once its selection is read again", async () => {
  let claudeRead = (): Promise<TokenIndexAnswer> =>
    Promise.reject(new Error("Usage could not be read."));
  const source: UsageSource = {
    read: (cohort) =>
      cohort.tool === "claude"
        ? claudeRead()
        : Promise.resolve(answerFor(cohort.tool)),
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showTool("Claude Code", true);
  await usage.showsProblem("Claude Code: Usage could not be read.");

  let releaseRetry!: () => void;
  const retryHeld = new Promise<void>((resolve) => {
    releaseRetry = resolve;
  });
  claudeRead = async () => {
    await retryHeld;
    return answerFor("claude");
  };
  await usage.showTool("Claude Code", false);
  await usage.showsPointCount(2);
  await usage.showTool("Claude Code", true);
  await usage.showsLoading();
  await usage.showsNoProblem();
  releaseRetry();
  await usage.showsToolSummaries(["Codex", "Claude Code"]);
  await usage.showsPointCount(3);
  await usage.showsNoProblem();
});

test("a failure leaves once a day round trip reads its period again", async () => {
  let claudeRead = (): Promise<TokenIndexAnswer> =>
    Promise.reject(new Error("Usage could not be read."));
  const source: UsageSource = {
    read: (cohort) =>
      cohort.tool === "claude"
        ? claudeRead()
        : Promise.resolve(answerFor(cohort.tool)),
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showTool("Claude Code", true);
  await usage.showsProblem("Claude Code: Usage could not be read.");

  claudeRead = () => Promise.resolve(answerFor("claude"));
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  await usage.showsNoProblem();

  let releaseRoundTrip!: () => void;
  const roundTripHeld = new Promise<void>((resolve) => {
    releaseRoundTrip = resolve;
  });
  claudeRead = async () => {
    await roundTripHeld;
    return answerFor("claude");
  };
  await usage.chooseDays("30");
  await usage.showsLoading();
  await usage.showsNoProblem();
  releaseRoundTrip();
  await usage.showsPointCount(3);
  await usage.showsNoProblem();
});

test("an answer for a selection already left never joins the one shown", async () => {
  let releaseLate!: () => void;
  const lateHeld = new Promise<void>((resolve) => {
    releaseLate = resolve;
  });
  const source: UsageSource = {
    read: async (cohort) => {
      if (cohort.tool === "claude") {
        await lateHeld;
      }
      return answerFor(cohort.tool);
    },
    refresh: () => Promise.resolve(),
  };

  const usage = await mountUsage(source);
  await usage.showsPointCount(2);
  await usage.showTool("Claude Code", true);
  await usage.showsLoading();
  await usage.showTool("Claude Code", false);
  await usage.showsPointCount(2);
  releaseLate();
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      setTimeout(resolve, 0);
    }, 0);
  });
  await usage.showsToolSummaries(["Codex"]);
  await usage.showsPointCount(2);
  await usage.showsNoProblem();
});
