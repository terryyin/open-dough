import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { TokenIndexAnswer } from "../../src/usageTokenIndex.ts";
import { mountUsage } from "./system-settings-usage-page.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-15T12:00:00.000Z"));
});
afterEach(() => {
  vi.useRealTimers();
});

function readingUsage(answer: () => TokenIndexAnswer) {
  return mountUsage(
    {
      read: () => Promise.resolve(answer()),
      refresh: () => Promise.resolve(),
    },
    { width: 1280, height: 720 },
  );
}

test("large tasks keep actual values and dates without flattening ordinary points", async () => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000_000, 2_000_000] })
    .please();
  const usage = await readingUsage(() => answer);
  const { chart } = usage;
  await usage.showsPointCount(2);
  const separation = await chart.ordinarySeparation();
  expect(separation).toBeGreaterThan(40);
  answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [1_000_000, 2_000_000, 65_000_000] })
    .withTask(2, { endedAt: "2026-11-02T12:00:00.000Z" })
    .please();
  await usage.chooseDays("7");
  await usage.showsPointCount(3);
  expect(await chart.ordinarySeparation()).toBeCloseTo(separation, 1);
  await chart.showsLarge(
    ["Nov 2 · Codex · 65,000,000 · Large task above 50 million"],
    ["65,000,000"],
  );
  await chart.sameDateAsLastOrdinary();
  await chart.showsNote(
    "× Large task above 50 million; labels show actual values. Partial and provisional coverage remain marked.",
  );
  await usage.selectPoint(
    "Nov 2 · Codex · 65,000,000 · Large task above 50 million",
    "pointer",
  );
  await usage.showsFact("Token index", "65,000,000");
});

test("coincident large tasks remain separate by pointer touch and keyboard with partial details and focus return", async () => {
  const answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [65_000_000, 70_000_000] })
    .withTask(1, {
      endedAt: "2026-11-01T12:00:00.000Z",
      coverage: { kind: "partial", gaps: ["missing-worker-evidence"] },
    })
    .please();
  const usage = await readingUsage(() => answer);
  const { chart } = usage;
  const readouts = [
    "Nov 1 · Codex · 65,000,000 · Large task above 50 million",
    "Nov 1 · Codex · 70,000,000 · Partial · Large task above 50 million",
  ];
  await chart.showsLarge(readouts, ["65,000,000", "70,000,000 · Partial"]);
  const [first, second] = await chart.markCentres(readouts);
  if (!first || !second)
    throw new Error("Both large marks must be positioned.");
  expect(first.x).toBe(second.x);
  expect(Math.abs(first.y - second.y)).toBeGreaterThanOrEqual(40);
  await chart.hasAxis(["0", "25M", "50M"]);
  await chart.showsNote(
    "No ordinary task points in this period; every priced task is above 50 million.",
  );
  for (const by of ["pointer", "touch", "keyboard"] as const) {
    for (const [at, readout] of readouts.entries()) {
      await usage.selectPoint(readout, by);
      await usage.showsFact(
        "Token index",
        at === 0 ? "65,000,000" : "70,000,000",
      );
      await usage.showsFact(
        "Coverage",
        at === 0 ? "No known gaps" : "Partial · Worker usage missing",
      );
      await usage.closeDetail(readout);
    }
  }
});

test("exactly fifty million remains ordinary and measured zero keeps an honest scale", async () => {
  let answer = makeMe.aTokenIndexAnswer
    .with({ indexes: [0, 50_000_000, 50_000_001] })
    .please();
  const usage = await readingUsage(() => answer);
  const { chart } = usage;
  await usage.showsPointCount(3);
  await chart.showsOrdinary(2);
  await chart.showsLarge(
    ["Nov 3 · Codex · 50,000,001 · Large task above 50 million"],
    ["50,000,001"],
  );
  answer = makeMe.aTokenIndexAnswer.with({ indexes: [0, 0] }).please();
  await usage.chooseDays("1");
  await usage.showsPointCount(2);
  await chart.showsOrdinary(2);
  await chart.hasAxis(["0", "0.5", "1"]);
});
