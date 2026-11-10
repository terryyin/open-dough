// Machine-local landed CI observations and their retained proof. Atomic
// updates preserve final resolutions, accepted attempt summaries, and the
// shared bounded cohort. References outlive launch records; unreadable bytes
// remain a public read failure and are preserved on background rebuild.

import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import type { CiProof } from "../src/ciProof.ts";
import {
  commitIdSchema,
  launchLandingSchema,
  type LaunchLanding,
} from "../src/launchLanding.ts";
import {
  keptBuildSchema,
  keptResolution,
  observationSchema,
  type LandedResolution,
} from "./landedCiObservation.ts";
export type {
  KeptBuild,
  Observation,
  LandedResolution,
  PendingResolution,
} from "./landedCiObservation.ts";
import { keepResolutionDecision } from "./landedCiKeepResolution.ts";
import { windowedHistory } from "./landedCiMeasuredBuilds.ts";
import { withAdapterIdentity } from "./landedCiHistoryIdentity.ts";
import type { CollectedProof } from "./landedCiCollectedProof.ts";
import { historyWithProof } from "./landedCiRetainedProof.ts";
import { machineDashboardPath } from "./machineHome.ts";
import {
  leaveMachineJson,
  readMachineJson,
  replaceMachineJson,
  type MachineJsonStore,
} from "./machineJsonStore.ts";

// A recorded landing's reference and what it resolved to, kept by its
// receipt.
const keptLandingSchema = z.object({
  revision: commitIdSchema,
  receivedAt: z.iso.datetime(),
  repository: z.string().min(1).optional(),
  identity: z.string().min(1).optional(),
  target: launchLandingSchema.shape.target.optional(),
  observed: observationSchema,
});

const projectHistorySchema = z.object({
  landings: z.record(z.string(), keptLandingSchema),
  builds: z.record(z.string(), keptBuildSchema),
  trunkOrder: z.array(commitIdSchema).optional(),
});

export type ProjectHistory = z.infer<typeof projectHistorySchema>;

const storeSchema = z.record(z.string(), projectHistorySchema);

export type StoredHistory = z.infer<typeof storeSchema>;

const historyStore = (): MachineJsonStore<StoredHistory> => ({
  file: machineDashboardPath("landed-ci-history.json"),
  schema: storeSchema,
  empty: {},
});

const noHistory: ProjectHistory = { landings: {}, builds: {} };

export function readStoredLandedCiHistory() {
  return readMachineJson(historyStore());
}

// An absent local document is empty; unreadable bytes remain a read failure.
// Compatibility is a read-only view. Shared pruning happens in atomic writes
// and public projection, preserving order evidence needed by collection.
export async function readLandedCiHistory(
  sourceId: string,
): Promise<ProjectHistory | undefined> {
  const read = await readStoredLandedCiHistory();
  return read.kind === "document"
    ? withAdapterIdentity(read.document[sourceId] ?? noHistory)
    : undefined;
}

// Background rebuilding retains its unreadable-store convention.
export async function keptLandedCiHistory(
  sourceId: string,
): Promise<ProjectHistory> {
  return (await readLandedCiHistory(sourceId)) ?? noHistory;
}

// A trunk landing as the history refers to it: by its receipt, with its
// landed revision, when the dashboard recorded it and the story it names.
export type LandingReference = Pick<
  LaunchLanding,
  "receipt" | "revision" | "receivedAt" | "identity"
> &
  Partial<Pick<LaunchLanding, "repository" | "target">>;

// The landings the history keeps a reference to, whether or not their launch
// records are still kept.
export function keptLandingReferences(
  history: ProjectHistory,
): LandingReference[] {
  return Object.entries(history.landings).map(
    ([receipt, { revision, receivedAt, identity, repository, target }]) => ({
      receipt,
      revision,
      receivedAt,
      ...(identity === undefined ? {} : { identity }),
      ...(repository === undefined ? {} : { repository }),
      ...(target === undefined ? {} : { target }),
    }),
  );
}

// Keep one observation per receipt and one proof-bearing build per full
// subject, using the same shared window as project and scoped readers.
// When `collected` is supplied, the first proof ask is retained in the same
// write so a history reader never observes the measured point while that ask
// is still outstanding.
export async function keepLandedCiResolution(
  sourceId: string,
  landing: LandingReference,
  resolution: LandedResolution,
  order?: readonly string[],
  collected?: CollectedProof,
): Promise<ProjectHistory> {
  let history = noHistory;
  await replaceMachineJson(historyStore(), (stored) => {
    const original = stored[sourceId] ?? noHistory;
    const compatible = withAdapterIdentity(original);
    const supplied =
      order !== undefined &&
      (compatible.trunkOrder ?? []).every((revision) =>
        order.includes(revision),
      )
        ? order
        : compatible.trunkOrder;
    const project =
      supplied === undefined
        ? compatible
        : { ...compatible, trunkOrder: [...supplied] };
    const held = project.landings[landing.receipt]?.observed;
    const decision = keepResolutionDecision(
      project,
      landing.revision,
      held,
      keptResolution(resolution),
    );
    if (decision.kind === "hold") {
      history = windowedHistory(project);
      return isDeepStrictEqual(history, original)
        ? leaveMachineJson
        : { ...stored, [sourceId]: history };
    }
    const { observed, build } = decision;
    history = windowedHistory({
      ...project,
      landings: {
        ...project.landings,
        [landing.receipt]: {
          revision: landing.revision,
          receivedAt: landing.receivedAt,
          ...(landing.repository === undefined
            ? {}
            : { repository: landing.repository }),
          ...(landing.identity === undefined
            ? {}
            : { identity: landing.identity }),
          ...(landing.target === undefined ? {} : { target: landing.target }),
          observed,
        },
      },
      builds:
        build === undefined
          ? project.builds
          : {
              ...project.builds,
              [build[0]]: project.builds[build[0]] ?? build[1],
            },
    });
    if (collected !== undefined && build !== undefined)
      history = historyWithProof(
        history,
        build[0],
        collected.proof,
        collected.pending,
      );
    return { ...stored, [sourceId]: history };
  });
  return history;
}

// Derived order survives explicit pin deletion/local object loss; stale
// partial snapshots cannot replace a concurrently newer retained cohort.
export async function keepLandedCiOrder(
  sourceId: string,
  order: readonly string[],
): Promise<void> {
  await replaceMachineJson(historyStore(), (stored) => {
    const original = stored[sourceId];
    if (original === undefined) return leaveMachineJson;
    const project = withAdapterIdentity(original);
    const revisions = new Set(
      Object.values(project.landings).map((landing) => landing.revision),
    );
    if ([...revisions].some((revision) => !order.includes(revision)))
      return leaveMachineJson;
    const trunkOrder = [
      ...new Set(order.filter((revision) => revisions.has(revision))),
    ];
    return {
      ...stored,
      [sourceId]: windowedHistory({ ...project, trunkOrder }),
    };
  });
}

// A concurrent collection cannot replace accepted proof or recreate a build
// outside the bounded shared cohort.
export async function keepLandedCiProof(
  sourceId: string,
  buildKey: string,
  proof: CiProof,
  pending?: boolean,
): Promise<ProjectHistory> {
  let history = noHistory;
  await replaceMachineJson(historyStore(), (stored) => {
    const original = stored[sourceId] ?? noHistory;
    history = historyWithProof(original, buildKey, proof, pending);
    return isDeepStrictEqual(history, original)
      ? leaveMachineJson
      : { ...stored, [sourceId]: history };
  });
  return history;
}
