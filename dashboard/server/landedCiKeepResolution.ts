// Decide which observation and optional build `keepLandedCiResolution`
// writes: pending-order demotion when a would-measure build lacks order,
// reopen marking after a retained no-proof skip, and whether a held final
// stays or a pending / reopenable gap may replace.

import { isDeepStrictEqual } from "node:util";
import { withRefreshedAttemptTiming } from "./landedCiTimingBasis.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { hasLandingOrder, measuredBuildOf } from "./landedCiMeasuredBuilds.ts";
import {
  observationAfterNoProofReopen,
  reopenableRetainedNoProofSkip,
} from "./landedCiNoProofReopen.ts";
import type { KeptBuild, Observation } from "./landedCiObservation.ts";

export type KeepResolutionDecision =
  | { kind: "hold" }
  | {
      kind: "replace";
      observed: Observation;
      build?: readonly [string, KeptBuild];
    };

export function keepResolutionDecision(
  project: ProjectHistory,
  landingRevision: string,
  held: Observation | undefined,
  kept: {
    readonly observed: Observation;
    readonly build?: readonly [string, KeptBuild];
  },
): KeepResolutionDecision {
  if (held?.kind === "build" && kept.build?.[0] === held.build) {
    const previous = project.builds[held.build];
    const refreshed = withRefreshedAttemptTiming(previous, kept.build[1]);
    if (previous !== undefined && refreshed !== previous)
      return {
        kind: "replace",
        observed: held,
        build: [held.build, refreshed],
      };
  }
  const wouldMeasure =
    kept.build !== undefined &&
    measuredBuildOf(
      {
        ...project,
        builds: { ...project.builds, [kept.build[0]]: kept.build[1] },
      },
      kept.observed,
    ) !== undefined;
  const { observed: resolvedObserved, build } =
    wouldMeasure && !hasLandingOrder(project, landingRevision)
      ? {
          observed: { kind: "pending" as const, waitsFor: "order" as const },
          build: undefined,
        }
      : kept;
  const observed = observationAfterNoProofReopen(held, resolvedObserved);
  // Pending and reopenable retained equivalent `no-proof` gaps may change;
  // other held finals stay as they were.
  if (
    held !== undefined &&
    !reopenableRetainedNoProofSkip(held) &&
    (held.kind !== "pending" || isDeepStrictEqual(held, observed))
  )
    return { kind: "hold" };
  return build === undefined
    ? { kind: "replace", observed }
    : { kind: "replace", observed, build };
}
