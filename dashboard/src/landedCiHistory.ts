// Project Intent's CI wall time history as the local authenticated read
// boundary answers it (`../server/intentCiHistoryRead.ts`) and CI status
// shows it (`./IntentCiHistory.tsx`): each measured build of the project's
// dashboard-recorded trunk landings, oldest first, with its revision, how it
// measures its landing, the run attempt it was measured from, and that
// attempt's start and completion, from which its CI wall time is read
// (`./ciProofTimeWords.ts`). An answer crossed a process boundary, so the page
// checks it as external input; a run link is only ever a web address.

import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";
import { wallTimeMs } from "./ciProofTimeWords.ts";
import { commitIdSchema } from "./launchLanding.ts";

export const landedCiPointSchema = z.object({
  revision: commitIdSchema,
  // The landed revision's own completed build.
  provenance: z.literal("exact"),
  runUrl: z.url({ protocol: /^https?$/ }).optional(),
  ...runIdentityShape,
  startedAt: z.iso.datetime({ offset: true }),
  completedAt: z.iso.datetime({ offset: true }),
});

export type LandedCiPoint = z.infer<typeof landedCiPointSchema>;

export const landedCiHistorySchema = z.object({
  points: z.array(landedCiPointSchema),
});

export type LandedCiHistory = z.infer<typeof landedCiHistorySchema>;

// One point among the history's points: the build it measures, by its
// revision and the run attempt it was measured from.
export const landedCiPointKey = (point: LandedCiPoint): string =>
  [
    point.revision,
    point.runId,
    point.runAttempt,
    point.adapterAttempt?.attemptId,
  ].join("#");

// A point as CI status shows it: with the CI wall time its attempt's start
// and completion give, which every point the boundary answers has.
export type MeasuredPoint = LandedCiPoint & { readonly wallTimeMs: number };

export type MeasuredHistory = { readonly points: readonly MeasuredPoint[] };

// The history with each point's CI wall time; undefined when a point has
// none, as no answer of the boundary's does, so a time is never invented.
export function measuredHistoryOf(
  history: LandedCiHistory,
): MeasuredHistory | undefined {
  const points: MeasuredPoint[] = [];
  for (const point of history.points) {
    const ms = wallTimeMs(point.startedAt, point.completedAt);
    if (ms === undefined) return undefined;
    points.push({ ...point, wallTimeMs: ms });
  }
  return { points };
}
