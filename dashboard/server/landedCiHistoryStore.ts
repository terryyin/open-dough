// This machine's landed CI history, which background collection fills
// (`./landedCiCollection.ts`) and Intent's CI status reads
// (`./intentCiHistoryRead.ts`): for each project, what each trunk landing the
// dashboard recorded resolved to under the CI timing comparison's Landed rule
// (`./baseCiRevisionLookup.ts`) -- one build, one gap with its reason, or,
// while that is not final, what the landing still waits for -- kept by the
// landing's receipt with the landing's own reference, beside each build kept
// once by its run and attempt, in
// `~/.open-dough/dashboard/landed-ci-history.json`, resolved through `HOME`.
// A final resolution is never replaced; a pending one is replaced by what the
// landing resolves to next, so however many collections, restarts or
// processes resolve a landing, it has one observation and each build one
// entry. It keeps its landing references itself, so the history does not end
// with the launch records' retention, and collection resolves a pending
// landing from that reference once its record is gone. Which kept builds are
// points of CI wall time is `./landedCiMeasuredBuilds.ts`'s. Derived local
// evidence, never a story fact: rebuildable from recorded landings and CI, so
// losing it loses only requests and expired evidence. Every process on this
// machine reads the same file; it is read, replaced atomically, and moved
// aside when unreadable as `./machineJsonStore.ts` describes.

import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { runIdentityShape } from "../src/baseCiConfirmation.ts";
import { pendingWaits } from "../src/landedCiHistory.ts";
import { commitIdSchema, type LaunchLanding } from "../src/launchLanding.ts";
import {
  buildSelectionSchema,
  requestedRevisionCiStatusSchema,
} from "../src/storyCiComparison.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  leaveMachineJson,
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";
import type { FinalSlot, RevisionBuildSlot } from "./revisionBuildSlot.ts";

// One completed build as its CI read named it.
const keptBuildSchema = z.object({
  revision: commitIdSchema,
  state: z.enum(["pass", "failed"]),
  runUrl: z.string().min(1).optional(),
  ...runIdentityShape,
  startedAt: z.string().min(1).optional(),
  completedAt: z.string().min(1).optional(),
});

// The run attempt a pending landing waits on, as its CI read named it.
const awaitedRunSchema = z.object({
  runUrl: z.string().min(1).optional(),
  ...runIdentityShape,
});

// What one landing resolved to: a build, and how that build was selected for
// it, or a gap with why; or, while neither is final, what it waits for.
const observationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("build"),
    build: z.string().min(1),
    selection: buildSelectionSchema,
  }),
  z.object({
    kind: z.literal("gap"),
    explanation: z.string().min(1),
    requestedStatus: requestedRevisionCiStatusSchema.optional(),
  }),
  z.object({
    kind: z.literal("pending"),
    waitsFor: z.enum(pendingWaits),
    run: awaitedRunSchema.optional(),
  }),
]);

export type Observation = z.infer<typeof observationSchema>;

// A recorded landing's reference and what it resolved to, kept by its
// receipt.
const keptLandingSchema = z.object({
  revision: commitIdSchema,
  receivedAt: z.iso.datetime(),
  identity: z.string().min(1).optional(),
  observed: observationSchema,
});

const projectHistorySchema = z.object({
  landings: z.record(z.string(), keptLandingSchema),
  builds: z.record(z.string(), keptBuildSchema),
});

export type ProjectHistory = z.infer<typeof projectHistorySchema>;

const storeSchema = z.record(z.string(), projectHistorySchema);

type StoredHistory = z.infer<typeof storeSchema>;

const historyStore = (): MachineJsonStore<StoredHistory> => ({
  file: machineDashboardPath("landed-ci-history.json"),
  schema: storeSchema,
  empty: {},
});

const noHistory: ProjectHistory = { landings: {}, builds: {} };

// The project's history as kept now: none when nothing is kept for it, or
// when the file is unreadable, which the next write moves aside.
export async function keptLandedCiHistory(
  sourceId: string,
): Promise<ProjectHistory> {
  const read = await readMachineJson(historyStore());
  return read.kind === "document"
    ? (read.document[sourceId] ?? noHistory)
    : noHistory;
}

// A trunk landing as the history refers to it: by its receipt, with its
// landed revision, when the dashboard recorded it and the story it names.
export type LandingReference = Pick<
  LaunchLanding,
  "receipt" | "revision" | "receivedAt" | "identity"
>;

// The landings the history keeps a reference to, whether or not their launch
// records are still kept.
export function keptLandingReferences(
  history: ProjectHistory,
): LandingReference[] {
  return Object.entries(history.landings).map(
    ([receipt, { revision, receivedAt, identity }]) => ({
      receipt,
      revision,
      receivedAt,
      ...(identity === undefined ? {} : { identity }),
    }),
  );
}

// What a landing finally resolved to under the Landed rule: a completed
// build, or a gap that no later read changes (`finalSlot`).
type FinalResolution = FinalSlot<RevisionBuildSlot>;

// What a landing waits for while its resolution is not final.
export type PendingResolution = Extract<Observation, { kind: "pending" }>;

// What a landing resolved to now: final, or pending.
export type LandedResolution = FinalResolution | PendingResolution;

// One build's key: its run and attempt, a CI adapter's attempt, or, for a
// build its CI read named neither of, its revision.
function buildKeyOf(build: Extract<FinalResolution, { kind: "build" }>) {
  if (build.adapterAttempt !== undefined)
    return `attempt/${String(build.adapterAttempt.attemptId)}`;
  if (build.runId !== undefined && build.runAttempt !== undefined)
    return `run/${String(build.runId)}/${String(build.runAttempt)}`;
  return `revision/${build.revision}`;
}

function kept(resolution: LandedResolution): {
  readonly observed: Observation;
  readonly build?: readonly [string, z.infer<typeof keptBuildSchema>];
} {
  if (resolution.kind === "pending") return { observed: resolution };
  if (resolution.kind !== "build")
    return {
      observed: {
        kind: "gap",
        explanation: resolution.explanation,
        ...(resolution.requestedStatus === undefined
          ? {}
          : { requestedStatus: resolution.requestedStatus }),
      },
    };
  const key = buildKeyOf(resolution);
  const {
    revision,
    state,
    runUrl,
    runId,
    runAttempt,
    adapterAttempt,
    startedAt,
    completedAt,
  } = resolution;
  return {
    observed: { kind: "build", build: key, selection: resolution.selection },
    build: [
      key,
      {
        revision,
        state,
        ...(runUrl === undefined ? {} : { runUrl }),
        ...(runId === undefined ? {} : { runId }),
        ...(runAttempt === undefined ? {} : { runAttempt }),
        ...(adapterAttempt === undefined ? {} : { adapterAttempt }),
        ...(startedAt === undefined ? {} : { startedAt }),
        ...(completedAt === undefined ? {} : { completedAt }),
      },
    ],
  };
}

// Keeps what `landing` resolved to, unless the history already holds a final
// resolution of it, as another collection may have kept meanwhile, or holds
// it pending for the same; answers the project's history as it is then kept.
export async function keepLandedCiResolution(
  sourceId: string,
  landing: LandingReference,
  resolution: LandedResolution,
): Promise<ProjectHistory> {
  let history = noHistory;
  await replaceMachineJson(historyStore(), (stored) => {
    const project = stored[sourceId] ?? noHistory;
    const held = project.landings[landing.receipt]?.observed;
    const { observed, build } = kept(resolution);
    if (
      held !== undefined &&
      (held.kind !== "pending" || isDeepStrictEqual(held, observed))
    ) {
      history = project;
      return leaveMachineJson;
    }
    history = {
      landings: {
        ...project.landings,
        [landing.receipt]: {
          revision: landing.revision,
          receivedAt: landing.receivedAt,
          ...(landing.identity === undefined
            ? {}
            : { identity: landing.identity }),
          observed,
        },
      },
      builds:
        build === undefined
          ? project.builds
          : { ...project.builds, [build[0]]: build[1] },
    };
    return { ...stored, [sourceId]: history };
  });
  return history;
}
