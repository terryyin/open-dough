// Background supply of CI time without runner waits for retained measured
// builds: ask the same recorded attempt, keep an answered time or reason,
// and leave an unanswered read for the next pass.
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  collectedMeasureOf,
  needsCollectedMeasure,
} from "./landedCiCollectedMeasure.ts";
import { isUnansweredTimeWithoutRunnerWaits } from "./ciTimeWithoutRunnerWaitsAnswer.ts";
import { keepLandedCiCollectedEvidence } from "./landedCiKeepEvidence.ts";
import type {
  LandingReference,
  ProjectHistory,
} from "./landedCiHistoryStore.ts";
import type { landingResolution } from "./landedCiResolution.ts";
import type { CiTimeWithoutRunnerWaits } from "../src/storyCiComparison.ts";

export async function answeredCollectedMeasureOf(
  build: Parameters<typeof collectedMeasureOf>[0],
  read: Parameters<typeof landingResolution>[2],
): Promise<CiTimeWithoutRunnerWaits | undefined> {
  const measure = await collectedMeasureOf(build, read);
  if (measure === undefined || isUnansweredTimeWithoutRunnerWaits(measure))
    return undefined;
  return measure;
}

export async function collectRetainedMeasure(args: {
  source: PublishedSource;
  landing: LandingReference;
  history: ProjectHistory;
  read: Parameters<typeof landingResolution>[2];
  ended: () => boolean;
  home?: string;
}): Promise<ProjectHistory> {
  const { source, landing, history, read, ended, home } = args;
  const observed = history.landings[landing.receipt]?.observed;
  if (observed?.kind !== "build") return history;
  const retained = history.builds[observed.build];
  if (retained === undefined || !needsCollectedMeasure(retained))
    return history;
  const measure = await answeredCollectedMeasureOf(retained, read);
  if (ended() || measure === undefined) return history;
  return keepLandedCiCollectedEvidence(
    source.id,
    observed.build,
    { timeWithoutRunnerWaits: measure },
    home,
  );
}
