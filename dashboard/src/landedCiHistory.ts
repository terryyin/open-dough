// Project Intent's CI wall time history as the local authenticated read
// boundary answers it (`../server/intentCiHistoryRead.ts`) and CI status
// shows it (`./IntentCiHistory.tsx`): the window of the project's
// dashboard-recorded trunk landings as one ordered list, oldest first, of
// points and gaps. A point is one measured build: its revision, the run
// attempt it was measured from, that attempt's start and completion, from
// which its CI wall time is read, and the landings it measures, each with
// how -- its own landed revision's build (exact), a confirmed skip's reused
// equivalent build (equivalent), or the later trunk build a cancelled
// landing joins (later). A gap is one landing with no CI wall time, and why:
// pending, not measured yet, with what it waits for and the run attempt it
// waits on; or, finally, the build that measures it failed, its own build was
// cancelled with no later trunk build to stand for it, CI did not build it,
// a skip's equivalent build has no timing, the CI proof of the build that
// would stand for it expired or could not be read, or its build's attempt
// named no CI wall time -- with that build and how it stands for the landing
// when the gap names one. An answer crossed a process boundary, so the page
// checks it as external input; a run link is only ever a web address.

import { z } from "zod";
import { runIdentityShape } from "./baseCiConfirmation.ts";
import { commitIdSchema } from "./launchLanding.ts";

// A run link the page may follow.
export const runUrlSchema = z.url({ protocol: /^https?$/ });

// A moment as a CI read or the dashboard named it.
const instantSchema = z.iso.datetime({ offset: true });

// The CI wall time of an attempt that started at `startedAt` and completed
// at `completedAt`; undefined unless both are moments and the completion is
// after the start, so the history never shows a zero or invented time.
export function historyWallTimeMs(
  startedAt: string | undefined,
  completedAt: string | undefined,
): number | undefined {
  if (
    !instantSchema.safeParse(startedAt).success ||
    !instantSchema.safeParse(completedAt).success
  )
    return undefined;
  const ms = Date.parse(completedAt ?? "") - Date.parse(startedAt ?? "");
  return ms > 0 ? ms : undefined;
}

// How a build measures, or stands for, a landing: the landed revision's own
// build, a confirmed skip's reused equivalent build, or the later trunk build
// a cancelled landing joins.
export const provenances = ["exact", "equivalent", "later"] as const;

export type Provenance = (typeof provenances)[number];

// A recorded trunk landing: its landed revision, when the dashboard recorded
// it, and the story it landed for, when it names one.
const landingShape = {
  revision: commitIdSchema,
  receivedAt: instantSchema,
  identity: z.string().min(1).optional(),
};

const measuredLandingSchema = z.object({
  ...landingShape,
  provenance: z.enum(provenances),
});

export type MeasuredLanding = z.infer<typeof measuredLandingSchema>;

// A run attempt the history names, and its link.
const runShape = {
  runUrl: runUrlSchema.optional(),
  ...runIdentityShape,
};

export const landedCiPointSchema = z.object({
  kind: z.literal("point"),
  // The measured build's revision.
  revision: commitIdSchema,
  ...runShape,
  startedAt: instantSchema,
  completedAt: instantSchema,
  // The landings it measures, oldest first.
  landings: z.array(measuredLandingSchema).min(1),
});

export type LandedCiPoint = z.infer<typeof landedCiPointSchema>;

// What a landing not measured yet waits for: a run of its own at the landed
// revision (`run`), a build that is queued or running (`build`), a later
// trunk build after its own was cancelled (`later-build`), or CI that could
// not be read when collection last asked (`read`).
export const pendingWaits = ["run", "build", "later-build", "read"] as const;

export type PendingWait = (typeof pendingWaits)[number];

// Why a landing will not be measured: the build that measures it failed; its
// own build was cancelled or timed out with no later trunk build to stand for
// it; CI did not build it; a confirmed skip has no equivalent build with
// timing; the CI proof of the build that would stand for it expired, or could
// not be read or used; or its build's attempt named no CI wall time.
export const finalGapReasons = [
  "failed",
  "cancelled",
  "no-build",
  "no-equivalent",
  "expired",
  "unreadable",
  "not-recorded",
] as const;

export type FinalGapReason = (typeof finalGapReasons)[number];

const pendingGapSchema = z.object({
  kind: z.literal("gap"),
  // Not measured yet; collection asks again until it is final.
  reason: z.literal("pending"),
  waitsFor: z.enum(pendingWaits),
  ...landingShape,
  // The run attempt it waits on, when there is one.
  ...runShape,
});

export type PendingGap = z.infer<typeof pendingGapSchema>;

const finalGapSchema = z.object({
  kind: z.literal("gap"),
  reason: z.enum(finalGapReasons),
  ...landingShape,
  // The build that failed or named no CI wall time, and how it stands for
  // the landing; none for a gap that names no build.
  build: z
    .object({
      revision: commitIdSchema,
      provenance: z.enum(provenances),
      ...runShape,
    })
    .optional(),
});

export type FinalGap = z.infer<typeof finalGapSchema>;

export type LandedCiGap = PendingGap | FinalGap;

export const landedCiHistorySchema = z.object({
  entries: z.array(
    z.union([landedCiPointSchema, pendingGapSchema, finalGapSchema]),
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
    const ms = historyWallTimeMs(entry.startedAt, entry.completedAt);
    if (ms === undefined) return undefined;
    entries.push({ ...entry, wallTimeMs: ms });
  }
  return { entries };
}
