// Retained builds without a kept measure are supplied from their same recorded
// attempt by a landed CI collection pass (../../server/landedCiPass.ts); a
// measure-naming history read (../../server/intentCiHistoryRead.ts) answers
// a kept time as a point, a kept reason as a final gap naming its build, and
// an unanswered or not-yet-asked build as a pending gap that the next pass
// asks again (SEED-364#chart-ci-time-without-runner-waits). The adapter's
// job-graph reasons are in
// ../../../Distribution/tests/support/dashboard-ci-adapter-revision-lookup.test.mjs.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { timeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import { unansweredTimeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaitsAnswer.ts";
import { gapReasonWords } from "../../src/ciHistoryGapWords.ts";
import { historyMeasure } from "../../src/ciHistoryMeasureCapability.ts";
import {
  historyEntries,
  keepWallTimeBuilds,
  landedCiPassInputs,
  machineHome,
  measuredHistoryEntries,
} from "../support/landedCiPassInputs.ts";

const checkWorkflow = "on: push\njobs:\n  check:\n    runs-on: ubuntu-latest\n";
const start = "2026-11-05T10:00:00.000Z";
const end = "2026-11-05T10:02:00.000Z";
const check = (times: { started_at?: string; completed_at?: string }) =>
  makeMe.aGitHubJob.withFacts({ name: "check", ...times }).please();

test("an answered reason is a final gap naming its build; an unanswered jobs read stays pending and is asked again", async () => {
  const [supplied, invalid, unread] = [
    "1".repeat(40),
    "2".repeat(40),
    "3".repeat(40),
  ] as const;
  const home = machineHome();
  const records = await keepWallTimeBuilds(
    home,
    [supplied, invalid, unread].map((revision, index) => ({
      revision,
      runId: 41 + index,
      runAttempt: 1,
      startedAt: start,
      completedAt: end,
    })),
  );
  const read = () => measuredHistoryEntries(home);

  const beforeCollection = await read();
  expect(
    beforeCollection.map((entry) =>
      entry.kind === "gap" ? gapReasonWords(entry) : entry,
    ),
  ).toEqual(
    Array(3).fill("Pending · CI time without runner waits not read yet"),
  );
  expect((await historyEntries(home)).map((entry) => entry.kind)).toEqual([
    "point",
    "point",
    "point",
  ]);

  let jobsReadable = false;
  const asked: (number | undefined)[] = [];
  const pass = landedCiPassInputs(
    [supplied, invalid, unread],
    {
      runs: () => [],
      records: () => records,
      measureOf: ({ runId }) => {
        asked.push(runId);
        if (runId === 43 && !jobsReadable)
          return unansweredTimeWithoutRunnerWaits(
            "The build's attempt jobs could not be read.",
          );
        return timeWithoutRunnerWaits(
          checkWorkflow,
          [check(runId === 42 ? {} : { started_at: start, completed_at: end })],
          false,
        );
      },
    },
    home,
  );

  await pass.collect();
  await pass.collect();
  expect(asked.toSorted()).toEqual([41, 42, 43, 43]);
  expect(await read()).toMatchObject([
    { kind: "point", runId: 41, timeMs: 120_000 },
    {
      kind: "gap",
      reason: historyMeasure.value,
      revision: invalid,
      explanation: "Job “check” has no valid start and completion times.",
      build: {
        revision: invalid,
        provenance: "exact",
        runId: 42,
        runAttempt: 1,
      },
    },
    {
      kind: "gap",
      reason: "pending",
      waitsFor: historyMeasure.value,
      revision: unread,
      runId: 43,
    },
  ]);

  jobsReadable = true;
  await pass.collect();
  expect((await read()).map((entry) => entry.kind)).toEqual([
    "point",
    "gap",
    "point",
  ]);
});
