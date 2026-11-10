// One landing's resolve, retain, and optional proof backfill during a
// collection pass (`./landedCiCollection.ts`): reopenable retained no-proof
// skips and pending observations resolve again; measured builds may backfill
// proof when the same write did not already retain it.

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  collectedProofOf,
  needsCollectedProof,
  proofRetainedWith,
} from "./landedCiCollectedProof.ts";
import {
  keepLandedCiProof,
  keepLandedCiResolution,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import { hasLandingOrder, measuredBuildOf } from "./landedCiMeasuredBuilds.ts";
import { reopenableRetainedNoProofSkip } from "./landedCiNoProofReopen.ts";
import { landingResolution } from "./landedCiResolution.ts";
import { collectRetainedAttemptTiming } from "./landedCiAttemptTiming.ts";

export type CollectLandingOutcome =
  | { kind: "ended"; history: ProjectHistory }
  | {
      kind: "continue";
      history: ProjectHistory;
      measuredBuild?: string;
    }
  | { kind: "stop-project"; history: ProjectHistory };

export async function collectLandingResolution(args: {
  source: PublishedSource;
  landing: LandingReference;
  history: ProjectHistory;
  order: readonly string[] | undefined;
  read: Parameters<typeof landingResolution>[2];
  proofSignal: AbortSignal;
  ended: () => boolean;
}): Promise<CollectLandingOutcome> {
  const { source, landing, order, read, proofSignal, ended } = args;
  let history = await collectRetainedAttemptTiming(args);
  if (ended()) return { kind: "ended", history };
  const held = history.landings[landing.receipt]?.observed;
  let retainedProofWithResolution = false;
  if (
    held === undefined ||
    held.kind === "pending" ||
    reopenableRetainedNoProofSkip(held)
  ) {
    if (!hasLandingOrder(history, landing.revision, order)) {
      history = await keepLandedCiResolution(
        source.id,
        landing,
        { kind: "pending", waitsFor: "order" },
        order,
      );
      return { kind: "continue", history };
    }
    const resolved = await landingResolution(source, landing, read);
    // A read the end of collection cut short says nothing of its CI.
    if (ended()) return { kind: "ended", history };
    const collected = await proofRetainedWith(source, resolved, proofSignal);
    if (ended()) return { kind: "ended", history };
    retainedProofWithResolution = collected !== undefined;
    history = await keepLandedCiResolution(
      source.id,
      landing,
      resolved,
      order,
      collected,
    );
    // CI that cannot be read now is asked again at the next pass; a CI
    // proof that cannot be read is this landing's alone.
    if (resolved.kind === "pending" && resolved.waitsFor === "read")
      return { kind: "stop-project", history };
  }
  const observed = history.landings[landing.receipt]?.observed;
  // Already-held builds still backfill proof; a just-retained ask does not.
  if (!retainedProofWithResolution && observed?.kind === "build") {
    const retained = history.builds[observed.build];
    if (retained !== undefined && needsCollectedProof(retained)) {
      const { proof, pending } = await collectedProofOf(
        source,
        retained,
        proofSignal,
      );
      history = await keepLandedCiProof(
        source.id,
        observed.build,
        proof,
        pending,
      );
    }
  }
  const build =
    observed === undefined ? undefined : measuredBuildOf(history, observed);
  return {
    kind: "continue",
    history,
    ...(build === undefined ? {} : { measuredBuild: build }),
  };
}
