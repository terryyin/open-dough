// Background-only repair of legacy wall bounds. Re-read the same recorded
// attempt, never rerun selection or replace the original with a newer attempt.
import type { PublishedSource } from "../src/publishedSource.ts";
import { attemptTimesOf } from "../src/baseCiConfirmation.ts";
import { hasAttemptTiming } from "../src/ciAttemptTiming.ts";
import { judgeAttempt } from "./baseCiRevisionAttempt.ts";
import { runLinkOf } from "./baseCiRevisionNearest.ts";
import { buildKeyOf } from "./landedCiObservation.ts";
import {
  keepLandedCiResolution,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import type { landingResolution } from "./landedCiResolution.ts";

export async function collectRetainedAttemptTiming(args: {
  source: PublishedSource;
  landing: LandingReference;
  history: ProjectHistory;
  order: readonly string[] | undefined;
  read: Parameters<typeof landingResolution>[2];
  ended: () => boolean;
}): Promise<ProjectHistory> {
  const { source, landing, history, read, order, ended } = args;
  const observed = history.landings[landing.receipt]?.observed;
  if (observed?.kind !== "build") return history;
  const build = history.builds[observed.build];
  if (build === undefined || hasAttemptTiming(build)) return history;
  try {
    const evidence = await read();
    if (evidence.kind !== "read" || ended()) return history;
    const run = await evidence.builds.lookup.attemptOf?.(build);
    if (
      run === undefined ||
      ended() ||
      run.headSha !== build.revision ||
      run.adapterAttempt?.ambiguous === true ||
      judgeAttempt(run.status, run.conclusion) !== build.state ||
      buildKeyOf({
        revision: run.headSha,
        runId: run.databaseId,
        runAttempt: run.attempt,
        adapterAttempt: run.adapterAttempt,
      }) !== observed.build
    )
      return history;
    // Only authoritative optional bounds are supplied: an absent start
    // cannot fall back to the legacy workflow-creation value.
    return await keepLandedCiResolution(
      source.id,
      landing,
      {
        revision: build.revision,
        state: build.state,
        ...runLinkOf(run),
        ...attemptTimesOf(run),
        kind: "build",
        subject: "Retained CI attempt",
        selection: observed.selection,
        laterWithoutResult: 0,
      },
      order,
    );
  } catch {
    // Unavailable authoritative bounds leave an explained excluded sample.
    return history;
  }
}
