// Prepared retained passed builds with wall time and no kept measure, plus
// GitHub answers that supply a valid measure, an answered invalid-job reason,
// or an initially unanswered jobs read for the newest build.

import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { keepLandedCiHistory } from "./landedCiHistory.ts";
import {
  landedTrunk,
  recordedOnTrunk,
  trunkActions,
  trunkRun,
  usableProofOf,
} from "./landedCiTrunk.ts";
import { publishes } from "./publishedRepository.ts";
import { notFoundAnswer } from "../originAnswers.ts";
import type { StartOrigin } from "./startOrigin.ts";

const jobJson = (jobs: unknown[]) => ({
  status: 200,
  contentType: "application/json; charset=utf-8",
  body: JSON.stringify({ jobs, total_count: jobs.length }),
});

const checkJob = (startedAt?: string, completedAt?: string) =>
  makeMe.aGitHubJob
    .withFacts({
      name: "check",
      ...(startedAt === undefined ? {} : { started_at: startedAt }),
      ...(completedAt === undefined ? {} : { completed_at: completedAt }),
    })
    .please();

export const retainedMeasureGapCases = [
  {
    name: "supplied" as const,
    runId: 41,
    start: "2026-11-05T10:00:00Z",
    end: "2026-11-05T10:02:00Z",
    jobs: () => [checkJob("2026-11-05T10:00:00Z", "2026-11-05T10:02:00Z")],
  },
  {
    name: "invalid" as const,
    runId: 42,
    start: "2026-11-05T11:00:00Z",
    end: "2026-11-05T11:02:00Z",
    jobs: () => [checkJob()],
  },
  {
    name: "unread" as const,
    runId: 43,
    start: "2026-11-05T12:00:00Z",
    end: "2026-11-05T12:02:00Z",
    jobs: () => [checkJob("2026-11-05T12:00:00Z", "2026-11-05T12:02:00Z")],
  },
] as const;

export async function keepRetainedMeasureGapHistory(
  origin: StartOrigin,
  github: FakeGitHub,
) {
  const trunk = landedTrunk(
    origin,
    [
      { title: "ci", kind: "ci-workflow" },
      { title: "supplied", kind: "code" },
      { title: "invalid", kind: "code" },
      { title: "unread", kind: "code" },
    ],
    ["supplied", "invalid", "unread"],
  );
  const prepared = retainedMeasureGapCases.map((entry) => {
    const landing = trunk.landing(entry.name);
    const run = trunkRun(landing.revision, entry.runId, {
      createdAt: entry.start,
      startedAt: entry.start,
      completedAt: entry.end,
    });
    return { entry, landing, run, proof: usableProofOf(run) };
  });
  const [supplied, invalid, unread] = prepared;
  if (supplied === undefined || invalid === undefined || unread === undefined)
    throw new Error("Retained measure-gap setup needs three builds");
  const landings = {
    supplied: supplied.landing,
    invalid: invalid.landing,
    unread: unread.landing,
  };
  const control = { jobsReadable: false };
  const newestFirst = prepared.map(({ run }) => run).reverse();
  const proofs = Object.fromEntries(
    prepared.map(({ entry, proof }) => [entry.runId, proof]),
  );
  recordedOnTrunk(origin, github, trunk.landings, () => newestFirst);
  github.serve("terryyin/open-dough", async (call) => {
    const route =
      call.argv.find((argument) => argument.startsWith("repos/")) ?? "";
    const listedJobs = /\/actions\/runs\/(\d+)\/attempts\/(\d+)\/jobs/.exec(
      route,
    );
    if (listedJobs?.[1] !== undefined) {
      const runId = Number(listedJobs[1]);
      if (runId === 43 && !control.jobsReadable) return notFoundAnswer();
      const entry = retainedMeasureGapCases.find(
        (candidate) => candidate.runId === runId,
      );
      if (entry !== undefined) return jobJson(entry.jobs());
    }
    return (
      trunkActions(newestFirst, proofs)(call.argv) ??
      publishes({ revision: trunk.revision("unread") })(call)
    );
  });
  const history = makeMe.aLandedCiHistory.inTrunkOrder([
    trunk.revision("ci"),
    ...prepared.map(({ landing }) => landing.revision),
  ]);
  for (const { entry, landing } of prepared) {
    history.recording(
      makeMe.aLaunchLanding
        .comparing({
          base: trunk.revision("ci"),
          revision: landing.revision,
        })
        .deliveredAs({ delivery: "legacy", receipt: landing.receipt })
        .receivedAt(landing.at)
        .please(),
      `run/${String(entry.runId)}/1`,
      makeMe.aKeptBuild
        .with({
          revision: landing.revision,
          state: "pass",
          runId: entry.runId,
          runAttempt: 1,
          runUrl: `https://ci.invalid/runs/${String(entry.runId)}`,
          startedAt: entry.start,
          completedAt: entry.end,
          // Retained without the measure so collection supplies it.
          timeWithoutRunnerWaits: undefined,
        })
        .please(),
    );
  }
  await keepLandedCiHistory(
    path.join(origin.machine, "home"),
    history.please(),
  );
  return { landings, control };
}
