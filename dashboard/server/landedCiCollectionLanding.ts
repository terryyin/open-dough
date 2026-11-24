// One landing's resolve, retain, and optional proof or measure backfill during
// a collection pass (`./landedCiCollection.ts`): reopenable retained no-proof
// skips and pending observations resolve again; measured builds may backfill
// proof or CI time without runner waits when the same write did not already
// retain them.

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  collectedProofOf,
  needsCollectedProof,
  proofRetainedWith,
  type ProofRead,
} from "./landedCiCollectedProof.ts";
import {
  keepLandedCiResolution,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import { keepLandedCiCollectedEvidence } from "./landedCiKeepEvidence.ts";
import { hasLandingOrder, measuredBuildOf } from "./landedCiMeasuredBuilds.ts";
import { reopenableRetainedNoProofSkip } from "./landedCiNoProofReopen.ts";
import { landingResolution } from "./landedCiResolution.ts";
import { collectRetainedAttemptTiming } from "./landedCiAttemptTiming.ts";
import {
  answeredCollectedMeasureOf,
  collectRetainedMeasure,
} from "./landedCiRetainedMeasure.ts";
import { needsCollectedMeasure } from "./landedCiCollectedMeasure.ts";

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
  // The machine whose history this pass keeps; absent, this one.
  home?: string;
  readProof?: ProofRead;
  // The clock bounding the wait for a landing's own run.
  now: () => number;
}): Promise<CollectLandingOutcome> {
  const { source, landing, order, read, proofSignal, ended, home, readProof } =
    args;
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
        { home },
      );
      return { kind: "continue", history };
    }
    const resolved = await landingResolution(source, landing, read, args.now);
    // A read the end of collection cut short says nothing of its CI.
    if (ended()) return { kind: "ended", history };
    const collected = await proofRetainedWith(
      source,
      resolved,
      proofSignal,
      readProof,
    );
    if (ended()) return { kind: "ended", history };
    const measure =
      resolved.kind === "build"
        ? await answeredCollectedMeasureOf(resolved, read)
        : undefined;
    if (ended()) return { kind: "ended", history };
    retainedProofWithResolution = collected !== undefined;
    const evidence =
      collected === undefined && measure === undefined
        ? undefined
        : {
            ...(collected === undefined
              ? {}
              : { proof: collected.proof, pending: collected.pending }),
            ...(measure === undefined
              ? {}
              : { timeWithoutRunnerWaits: measure }),
          };
    history = await keepLandedCiResolution(
      source.id,
      landing,
      resolved,
      order,
      { collected: evidence, home },
    );
    // CI that cannot be read now is asked again at the next pass; a CI
    // proof that cannot be read is this landing's alone.
    if (resolved.kind === "pending" && resolved.waitsFor === "read")
      return { kind: "stop-project", history };
  }
  const observed = history.landings[landing.receipt]?.observed;
  // Already-held builds still backfill proof and the measure; a just-retained
  // ask does not re-read proof.
  if (observed?.kind === "build") {
    const retained = history.builds[observed.build];
    if (
      retained !== undefined &&
      !retainedProofWithResolution &&
      needsCollectedProof(retained)
    ) {
      const { proof, pending } = await collectedProofOf(
        source,
        retained,
        proofSignal,
        readProof,
      );
      const measure = needsCollectedMeasure(retained)
        ? await answeredCollectedMeasureOf(retained, read)
        : undefined;
      if (ended()) return { kind: "ended", history };
      history = await keepLandedCiCollectedEvidence(
        source.id,
        observed.build,
        {
          proof,
          pending,
          ...(measure === undefined ? {} : { timeWithoutRunnerWaits: measure }),
        },
        home,
      );
    } else {
      history = await collectRetainedMeasure({
        ...args,
        history,
      });
      if (ended()) return { kind: "ended", history };
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
