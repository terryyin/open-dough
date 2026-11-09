// Project Intent's CI wall time history as the local authenticated read
// boundary answers it (`../server/intentCiHistoryRead.ts`) and CI status
// shows it (`./IntentCiHistory.tsx`): the project's dashboard-recorded trunk
// landings as one ordered list, oldest first, of points and gaps. A point is
// a measured build, with its revision, how it measures its landing, the run
// attempt it was measured from, and that attempt's start and completion, from
// which its CI wall time is read (`./ciProofTimeWords.ts`). A gap is a
// landing not measured yet: its landed revision, when the dashboard recorded
// it, what it waits for, and the run attempt it waits on when there is one.
// An answer crossed a process boundary, so the page checks it as external
// input; a run link is only ever a web address.

import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";
import { wallTimeMs } from "./ciProofTimeWords.ts";
import { commitIdSchema } from "./launchLanding.ts";

// A run link the page may follow.
const runUrlSchema = z.url({ protocol: /^https?$/ });

export const landedCiPointSchema = z.object({
  kind: z.literal("point"),
  revision: commitIdSchema,
  // The landed revision's own completed build.
  provenance: z.literal("exact"),
  runUrl: runUrlSchema.optional(),
  ...runIdentityShape,
  startedAt: z.iso.datetime({ offset: true }),
  completedAt: z.iso.datetime({ offset: true }),
});

export type LandedCiPoint = z.infer<typeof landedCiPointSchema>;

// What a landing not measured yet waits for: a run of its own at the landed
// revision (`run`), a build that is queued or running (`build`), a later
// trunk build after its own was cancelled (`later-build`), or CI that could
// not be read when collection last asked (`read`).
export const pendingWaits = ["run", "build", "later-build", "read"] as const;

export type PendingWait = (typeof pendingWaits)[number];

export const landedCiGapSchema = z.object({
  kind: z.literal("gap"),
  // Not measured yet; collection asks again until it is final.
  reason: z.literal("pending"),
  waitsFor: z.enum(pendingWaits),
  // The landed revision, and when the dashboard recorded the landing.
  revision: commitIdSchema,
  receivedAt: z.iso.datetime({ offset: true }),
  // The run attempt it waits on, when there is one.
  runUrl: runUrlSchema.optional(),
  ...runIdentityShape,
});

export type LandedCiGap = z.infer<typeof landedCiGapSchema>;

export const landedCiHistorySchema = z.object({
  entries: z.array(
    z.discriminatedUnion("kind", [landedCiPointSchema, landedCiGapSchema]),
  ),
});

export type LandedCiHistory = z.infer<typeof landedCiHistorySchema>;

export type LandedCiEntry = LandedCiHistory["entries"][number];

// When an entry stands in the history: a point at its build's start, a gap
// when the dashboard recorded its landing.
export const entryDate = (entry: LandedCiEntry): string =>
  entry.kind === "point" ? entry.startedAt : entry.receivedAt;

// One entry among the history's entries: a point by the build it measures,
// its revision and the run attempt it was measured from; a gap by its landed
// revision and when that landing was recorded.
export const landedCiEntryKey = (entry: LandedCiEntry): string =>
  entry.kind === "point"
    ? [
        "point",
        entry.revision,
        entry.runId,
        entry.runAttempt,
        entry.adapterAttempt?.attemptId,
      ].join("#")
    : ["gap", entry.revision, entry.receivedAt].join("#");

// A point as CI status shows it: with the CI wall time its attempt's start
// and completion give, which every point the boundary answers has.
export type MeasuredPoint = LandedCiPoint & { readonly wallTimeMs: number };

export type MeasuredEntry = MeasuredPoint | LandedCiGap;

export type MeasuredHistory = { readonly entries: readonly MeasuredEntry[] };

export const isPoint = (entry: MeasuredEntry): entry is MeasuredPoint =>
  entry.kind === "point";

// The history with each point's CI wall time; undefined when a point has
// none, as no answer of the boundary's does, so a time is never invented.
export function measuredHistoryOf(
  history: LandedCiHistory,
): MeasuredHistory | undefined {
  const entries: MeasuredEntry[] = [];
  for (const entry of history.entries) {
    if (entry.kind === "gap") {
      entries.push(entry);
      continue;
    }
    const ms = wallTimeMs(entry.startedAt, entry.completedAt);
    if (ms === undefined) return undefined;
    entries.push({ ...entry, wallTimeMs: ms });
  }
  return { entries };
}
