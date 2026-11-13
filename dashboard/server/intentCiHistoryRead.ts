// Local collected project/scoped history. The shared retained window and
// accepted landing ancestry determine its cohort; browsing acquires no CI.

import {
  readingCiHistoryOf,
  readingCiScopeHistoryOf,
} from "../src/authenticatedReadRules.ts";
import { z } from "zod";
import { parseSafeRepositoryPath } from "./reachablePaths.ts";
import { isPinnedRevision } from "./refusedParameters.ts";
import { historyEndpointOf } from "./ciHistoryEndpoint.ts";
import { scopeHistoryOf } from "./ciScopeHistory.ts";
import { readLandingOrder } from "./launchLandingGit.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { wallTimeReferenceOf } from "./ciWallTimeReference.ts";
import { historyEntries } from "./landedCiHistoryEntries.ts";
import { readableHistoryEntries } from "./ciHistoryGapVocabulary.ts";
import {
  readLandedCiHistory,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import {
  mostCompleteLandingOrder,
  windowedHistory,
} from "./landedCiMeasuredBuilds.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";

export type IntentCiHistoryRead =
  | {
      readonly kind: "intent-ci-history";
      readonly gapReasons?: "timing-basis";
      readonly scope?: never;
      readonly revision?: never;
      readonly through?: never;
    }
  | {
      readonly kind: "intent-ci-history";
      readonly gapReasons?: "timing-basis";
      readonly scope?: string;
      readonly revision: string;
      readonly through: string;
    };

const historyRefusal =
  "A CI wall time history read names only the Intent request.";

// The CI wall time history read a request names, undefined when it names
// none.
export function parseIntentCiHistoryRead(
  params: URLSearchParams,
): IntentCiHistoryRead | RefusedParameters | undefined {
  if (params.get("intent") !== "ci-history") return undefined;
  const gapReasons = params.get("gap-reasons");
  if (
    params.has("gap-reasons") &&
    (params.getAll("gap-reasons").length !== 1 ||
      gapReasons !== "timing-basis" ||
      params.has("scope"))
  )
    return refused(historyRefusal);
  const vocabulary =
    gapReasons === "timing-basis" ? ({ gapReasons } as const) : {};
  if (params.has("scope") || params.has("revision") || params.has("through")) {
    const names = [
      "intent",
      "revision",
      "through",
      ...(params.has("gap-reasons") ? ["gap-reasons"] : []),
      ...(params.has("scope") ? ["scope"] : []),
    ];
    const scope = params.has("scope")
      ? parseSafeRepositoryPath(params.get("scope") ?? "")
      : undefined;
    const revision = params.get("revision");
    const through = params.get("through");
    if (
      names.some((name) => params.getAll(name).length !== 1) ||
      [...params.keys()].some(
        (name) => name !== "source" && !names.includes(name),
      ) ||
      (params.has("scope") && scope === undefined) ||
      !isPinnedRevision(revision) ||
      !z.iso.datetime({ offset: true }).safeParse(through).success ||
      through === null
    )
      return refused(
        "A selected CI history read names one published landing revision and date, and optionally one repository scope.",
      );
    return {
      kind: "intent-ci-history",
      ...vocabulary,
      ...(scope === undefined ? {} : { scope }),
      revision,
      through,
    };
  }
  if (
    params.getAll("intent").length !== 1 ||
    [...params.keys()].some(
      (name) =>
        name !== "source" && name !== "intent" && name !== "gap-reasons",
    )
  ) {
    return refused(historyRefusal);
  }
  return { kind: "intent-ci-history", ...vocabulary };
}

// What a CI wall time history read names as being read.
export function readingIntentCiHistoryOf(
  source: PublishedSource,
  read?: IntentCiHistoryRead,
): string {
  return read?.scope === undefined
    ? readingCiHistoryOf(source.repository)
    : readingCiScopeHistoryOf(source.repository, read.scope, read.revision);
}

// The wall-time history at an exact Done endpoint: its availability there,
// the readable entries, and the prior-build reference through it.
export function doneWallTimeHistoryOf(
  history: ProjectHistory,
  revision: string,
  order: readonly string[] | undefined,
  gapReasons?: "timing-basis",
) {
  const { availability } = historyEndpointOf(history, revision, order);
  return {
    selectedRevision: revision,
    availability,
    entries: readableHistoryEntries(historyEntries(history), gapReasons),
    reference: wallTimeReferenceOf(history, revision, order),
  };
}

export async function performIntentCiHistoryRead(
  source: PublishedSource,
  read?: IntentCiHistoryRead,
  signal?: AbortSignal,
  localRepository?: string,
): Promise<Outcome> {
  const stored = await readLandedCiHistory(source.id);
  if (stored === undefined)
    return {
      kind: "failed",
      message:
        "The collected CI history could not be read. Retry the local history read.",
      retryAfterSeconds: undefined,
      recovery: undefined,
    };
  const retained = Object.values(stored.landings);
  const localOrder = await readLandingOrder(
    [
      ...retained.flatMap((landing) =>
        landing.repository === undefined ? [] : [landing.repository],
      ),
      ...(localRepository === undefined ? [] : [localRepository]),
    ],
    [
      ...retained.map((landing) => landing.revision),
      ...Object.values(stored.builds).map((build) => build.revision),
    ],
    read?.revision,
    signal,
  );
  const order =
    mostCompleteLandingOrder(
      retained,
      [localOrder, stored.trunkOrder],
      read?.revision,
    ) ??
    localOrder ??
    stored.trunkOrder;
  const history =
    order === undefined
      ? stored
      : windowedHistory({ ...stored, trunkOrder: [...order] });
  if (read?.scope !== undefined) {
    return answered(
      scopeHistoryOf(
        history,
        read.scope,
        { revision: read.revision, at: read.through },
        order,
      ),
    );
  }
  if (read?.revision !== undefined)
    return answered(
      doneWallTimeHistoryOf(history, read.revision, order, read.gapReasons),
    );
  return answered({
    entries: readableHistoryEntries(historyEntries(history), read?.gapReasons),
    reference: wallTimeReferenceOf(history, undefined, order),
  });
}
