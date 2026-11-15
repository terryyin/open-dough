// A project history page opened before the measure capability existed keeps
// reading wall-time points through the real local authenticated boundary,
// while a read that names the measure answers each build's kept CI time
// without runner waits (../../src/ciHistoryMeasureCapability.ts).
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import {
  landedCiHistorySchema,
  measuredHistoryOf,
} from "../../src/landedCiHistory.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import {
  keepLandedCiHistory,
  landedCiHistory,
} from "../../tests/support/landedCiHistory.ts";
import {
  landedCiHistorySchema as previousHistorySchema,
  measuredHistoryOf as previousMeasuredHistoryOf,
} from "../../tests/support/previousCiHistoryReader/landedCiHistory.ts";

test.use({ serverMode: "boundary" });

test("a project read that names the measure answers kept CI time without runner waits; the previous reader keeps wall time by default", async ({
  dashboard,
  github,
}) => {
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
    dashboard.home,
    makeMe.aLandedCiHistory
      .measuredLanding(measured)
      .inTrunkOrder([measured.revision])
      .please(),
  );
  const before = github.calls.length;
  const previous = previousMeasuredHistoryOf(
    previousHistorySchema.parse((await landedCiHistory(dashboard)).body),
  );
  expect(previous?.entries.filter((entry) => entry.kind === "point")).toEqual([
    expect.objectContaining({
      revision: measured.revision,
      wallTimeMs: 6.5 * 60_000,
    }),
  ]);
  const named = measuredHistoryOf(
    landedCiHistorySchema.parse(
      (await landedCiHistory(dashboard, undefined, historyMeasure.value)).body,
    ),
  );
  expect(named?.entries.filter((entry) => entry.kind === "point")).toEqual([
    expect.objectContaining({
      revision: measured.revision,
      timeMs: 5 * 60_000,
    }),
  ]);
  expect(github.calls).toHaveLength(before);
});
