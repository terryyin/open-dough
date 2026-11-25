// A project history page opened before the measure capability existed keeps
// reading wall-time points, while a read that names the measure answers each
// build's kept CI time without runner waits
// (../../src/ciHistoryMeasureCapability.ts).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import {
  landedCiHistorySchema,
  measuredHistoryOf,
} from "../../src/landedCiHistory.ts";
import {
  parseIntentCiHistoryRead,
  performIntentCiHistoryRead,
} from "../../server/intentCiHistoryRead.ts";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";
import {
  landedCiHistorySchema as previousHistorySchema,
  measuredHistoryOf as previousMeasuredHistoryOf,
} from "../../test-support/support/previousCiHistoryReader/landedCiHistory.ts";

const source = makeMe.aPublishedSource.openDough.please();
let home = "";

afterEach(() => {
  if (home !== "") rmSync(home, { recursive: true, force: true });
  home = "";
});

test("a project read that names the measure answers kept CI time without runner waits; the previous reader keeps wall time by default", async () => {
  home = mkdtempSync(path.join(tmpdir(), "ci-history-measure-compatibility-"));
  const measured = {
    receipt: "30500000-0000-4000-8000-000000000099",
    revision: "f".repeat(40),
    receivedAt: "2026-11-05T10:00:00Z",
    runId: 399,
    startedAt: "2026-11-05T10:00:00Z",
    completedAt: "2026-11-05T10:06:30Z",
    timeWithoutRunnerWaits: { milliseconds: 5 * 60_000 },
  };
  await keepLandedCiHistory(
    home,
    makeMe.aLandedCiHistory
      .measuredLanding(measured)
      .inTrunkOrder([measured.revision])
      .please(),
  );
  const projectAnswer = async (measure?: typeof historyMeasure.value) => {
    const query = new URLSearchParams({
      source: source.id,
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
    return outcome.answer;
  };
  const previous = previousMeasuredHistoryOf(
    previousHistorySchema.parse(await projectAnswer()),
  );
  expect(previous?.entries.filter((entry) => entry.kind === "point")).toEqual([
    expect.objectContaining({
      revision: measured.revision,
      wallTimeMs: 6.5 * 60_000,
    }),
  ]);
  const named = measuredHistoryOf(
    landedCiHistorySchema.parse(await projectAnswer(historyMeasure.value)),
  );
  expect(named?.entries.filter((entry) => entry.kind === "point")).toEqual([
    expect.objectContaining({
      revision: measured.revision,
      timeMs: 5 * 60_000,
    }),
  ]);
});
