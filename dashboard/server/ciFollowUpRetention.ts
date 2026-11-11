// Frozen follow-up evidence outlives the bounded ordinary chart window.
import { leaveMachineJson } from "./machineJsonStore.ts";
import { buildKeyOf } from "../src/landedCiBuildKey.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import {
  changeFollowUps,
  readFollowUps,
  type RepeatRequest,
} from "./ciFollowUpStore.ts";

export async function updateRepeat(
  key: string,
  change: (request: RepeatRequest) => RepeatRequest,
): Promise<void> {
  await changeFollowUps((ledger) => {
    const landing = ledger.landings[key];
    if (landing?.request === undefined) return leaveMachineJson;
    return {
      ...ledger,
      landings: {
        ...ledger.landings,
        [key]: { ...landing, request: change(landing.request) },
      },
    };
  });
}

// Chart pruning can forget a build, but never select its requested faster
// attempt when the same original landing is represented again.
export async function withOriginalFollowUpSamples(
  project: string,
  history: ProjectHistory,
): Promise<ProjectHistory> {
  const read = await readFollowUps();
  if (read.kind !== "document") return history;
  const landings = { ...history.landings },
    builds = { ...history.builds };
  for (const landing of Object.values(read.document.landings)) {
    const original = landing.request?.original;
    if (landing.project !== project || original === undefined) continue;
    const key = buildKeyOf(original);
    for (const [receipt, retained] of Object.entries(landings)) {
      if (
        retained.revision !== landing.revision ||
        (retained.target !== undefined && retained.target !== landing.target)
      )
        continue;
      landings[receipt] = {
        ...retained,
        observed: { kind: "build", build: key, selection: "exact" },
      };
      builds[key] = original;
    }
  }
  return { ...history, landings, builds };
}

export async function retainRepeatAssessment(
  key: string,
  assessment: {
    original: RepeatRequest["original"];
    reference: RepeatRequest["reference"];
    explanation: string;
  },
): Promise<void> {
  await changeFollowUps((ledger) => {
    const landing = ledger.landings[key];
    if (
      landing === undefined ||
      landing.request !== undefined ||
      JSON.stringify(landing.assessment) === JSON.stringify(assessment)
    )
      return leaveMachineJson;
    return {
      ...ledger,
      landings: { ...ledger.landings, [key]: { ...landing, assessment } },
    };
  });
}

// Existing finalized subjects survive corruption, but rebuilding from a latest
// later attempt cannot establish whether it was selectively requested.
export async function originalSelectionWhenReadable(
  history: ProjectHistory,
  landing: { revision: string },
  kept: {
    observed: import("./landedCiObservation.ts").Observation;
    build?: readonly [string, import("./landedCiObservation.ts").KeptBuild];
  },
) {
  const build = kept.build?.[1];
  if (
    build === undefined ||
    build.adapterAttempt !== undefined ||
    (build.runAttempt ?? 1) <= 1
  )
    return kept;
  const read = await readFollowUps();
  if (
    read.kind === "document" ||
    Object.values(history.landings).some(
      (previous) =>
        previous.revision === landing.revision &&
        previous.observed.kind === "build" &&
        previous.observed.build === kept.build?.[0],
    )
  )
    return kept;
  return {
    observed: {
      kind: "gap" as const,
      reason: "identity" as const,
      explanation:
        "The original attempt selection is unavailable because automatic CI follow-up evidence is unreadable; a later attempt cannot replace its sample.",
      build: {
        revision: build.revision,
        provenance: "exact" as const,
        ...(build.runId === undefined ? {} : { runId: build.runId }),
        ...(build.runAttempt === undefined
          ? {}
          : { runAttempt: build.runAttempt }),
      },
    },
  };
}
