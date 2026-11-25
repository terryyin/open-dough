// A measure-naming project history read answers its prior-build reference from
// kept CI time without runner waits (../../server/intentCiHistoryRead.ts);
// Done and default project reads keep wall time
// (SEED-364#chart-ci-time-without-runner-waits example 2).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { pendingWaitWords } from "../../src/ciHistoryGapWords.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";

const source = makeMe.aPublishedSource.openDough.please();
const revisionOf = (n: number) => n.toString(16).padStart(40, "0");
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("a measure-naming project read averages five priors at 5 min against a 4 min landing; without the measure a prior is excluded; Done and default stay wall time", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-project-measure-reference-"));
  const wallMs = 6 * 60_000;
  const fiveMin = 5 * 60_000;
  const fourMin = 4 * 60_000;
  const order = [1, 2, 3, 4, 5, 6, 7].map(revisionOf);
  const builder = makeMe.aLandedCiHistory.inTrunkOrder(order);
  for (const [index, revision] of order.entries()) {
    const startedAt = `2026-11-${String(index + 1).padStart(2, "0")}T10:00:00Z`;
    const runId = index + 1;
    const measureMs = index === 6 ? fourMin : fiveMin;
    builder.measuredLanding({
      receipt: String(index),
      revision,
      runId,
      receivedAt: startedAt,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + wallMs).toISOString(),
      ...(index === 2
        ? { timeWithoutRunnerWaits: undefined }
        : { timeWithoutRunnerWaits: { milliseconds: measureMs } }),
    });
    builder.proofFor(
      `run/${runId}/1`,
      makeMe.aCiProof
        .forRun({ revision, runId })
        .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
        .please(),
    );
  }
  await keepLandedCiHistory(home, builder.please());
  const projectRead = async (measure?: typeof historyMeasure.value) => {
    const query = new URLSearchParams({
      source: "open-dough",
      intent: "ci-history",
      ...(measure === undefined ? {} : { [historyMeasure.name]: measure }),
    });
    const named = parseIntentCiHistoryRead(query);
    expect(named).toMatchObject({ kind: "intent-ci-history" });
    if (named?.kind !== "intent-ci-history")
      throw new Error("expected intent-ci-history read");
    const outcome = await performIntentCiHistoryRead(source, named, { home });
    expect(outcome).toMatchObject({ kind: "answered" });
    if (outcome.kind !== "answered")
      throw new Error("expected answered history");
    return landedCiHistorySchema.parse(outcome.answer);
  };
  const named = await projectRead(historyMeasure.value);
  expect(named.reference).toMatchObject({
    endpoint: revisionOf(7),
    selected: { key: "run/7/1", ms: fourMin },
    sampleCount: 5,
    averageMs: fiveMin,
    difference: { changeMs: -60_000, relative: -0.2, text: "−1 min" },
  });
  expect(
    named.reference?.evidence.find((sample) => sample.key === "run/3/1"),
  ).toMatchObject({
    status: "excluded",
    reason: pendingWaitWords[historyMeasure.value],
  });
  const defaultRead = await projectRead();
  expect(defaultRead.reference).toMatchObject({
    selected: { key: "run/7/1", ms: wallMs },
    sampleCount: 6,
    averageMs: wallMs,
  });
  const doneQuery = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    revision: revisionOf(7),
    through: "2026-11-07T10:00:00Z",
  });
  const doneNamed = parseIntentCiHistoryRead(doneQuery);
  expect(doneNamed).toMatchObject({ kind: "intent-ci-history" });
  if (doneNamed?.kind !== "intent-ci-history")
    throw new Error("expected intent-ci-history read");
  const doneOutcome = await performIntentCiHistoryRead(source, doneNamed, {
    home,
  });
  expect(doneOutcome).toMatchObject({
    kind: "answered",
    answer: {
      selectedRevision: revisionOf(7),
      reference: {
        selected: { key: "run/7/1", ms: wallMs },
        sampleCount: 6,
        averageMs: wallMs,
      },
    },
  });
});
