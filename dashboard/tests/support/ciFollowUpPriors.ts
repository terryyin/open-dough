// Published predecessor facts for the repeat scenario's actual collector.
import type { StartOrigin } from "./startOrigin.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
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
  return prior;
}
