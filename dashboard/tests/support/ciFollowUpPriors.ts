// Published predecessor facts for the repeat scenario's actual collector.
import type { StartOrigin } from "./startOrigin.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { retainedHistory } from "./collectedScopeHistory.ts";
import { expect } from "./pageTest.ts";
import {
  landedTrunk,
  recordedOnTrunk,
  trunkRun,
  passedFrom,
  usableProofOf,
} from "./landedCiTrunk.ts";

export function prepareRepeatPriors(
  origin: StartOrigin,
  github: FakeGitHub,
  seconds: readonly number[],
) {
  const names = Array.from(seconds.keys(), (index) => `prior-${index + 1}`);
  const trunk = landedTrunk(
    origin,
    [
      { title: "ci", kind: "ci-workflow" },
      ...names.map((title) => ({ title, kind: "code" as const })),
    ],
    names,
  );
  const prior = names.map((name, index) =>
    trunkRun(
      trunk.revision(name),
      index + 1,
      passedFrom(
        `2026-11-10T0${index}:00:00.000Z`,
        (seconds[index] ?? 100) * 1000,
      ),
    ),
  );
  recordedOnTrunk(
    origin,
    github,
    trunk.landings,
    () => prior,
    () =>
      Object.fromEntries(prior.map((run) => [run.id ?? 0, usableProofOf(run)])),
  );
  return {
    runs: prior,
    // A defined observation may still be pending. Establish each actual
    // complete predecessor before the current receipt observation starts.
    async untilCollected(home: string) {
      const newestFirst = trunk.landings
        .map((landing, index) => ({ landing, run: prior[index] }))
        .reverse();
      for (const { landing, run } of newestFirst) {
        if (run?.id === undefined) throw new Error("Missing predecessor run");
        const key = `run/${String(run.id)}/1`;
        await expect
          .poll(() => retainedHistory(home))
          .toMatchObject({
            landings: {
              [landing.receipt]: {
                observed: { kind: "build", build: key, selection: "exact" },
              },
            },
            builds: {
              [key]: {
                revision: run.headSha,
                state: "pass",
                startedAt: run.startedAt,
                completedAt: run.completedAt,
                proof: { kind: "summary" },
              },
            },
          });
      }
    },
  };
}
