// Whether a story's settled launch attempt (`./launchAttempts.ts`) agrees with
// the published snapshot the page shows (`./publishedObservation.ts`). An
// attempt whose start published at a known revision is reconciled by a fully
// read snapshot of that revision or of one GitHub confirms contains it
// (`./publicationContainment.ts`): a changed revision alone, an older snapshot
// arriving later, or elapsed time never is. An attempt that published
// nothing, or published at no named revision, is reconciled by a fully read
// snapshot whose read was asked after it settled. Either is reconciled
// whether or not the snapshot still lists its story. Whether an attempt that
// may or may not have published did is not told here. Once reconciled, an
// attempt stays so on this page and is noted with the local service, so every
// page on this machine reads it so (`reconciledAt`); while it waits, a page
// whose snapshot was asked before the attempt settled asks once for a fresh
// read.

import { useEffect, useRef, useState } from "react";
import {
  laterAttempt,
  storyOf,
  type AttemptObservation,
} from "./agentLaunch.ts";
import { noteAttemptReconciled } from "./agentLaunchClient.ts";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  usePublicationContainment,
  type ContainmentQuestion,
} from "./publicationContainment.ts";

// What the page shows of the selected project: its revision, the stories it
// lists, when the local server asked for the ref its read resolved, by the
// clock attempts settle by (0 when a revision check resolved it), and whether
// every detail of it is read.
export type ShownSnapshot = {
  readonly sourceId: string;
  readonly revision: string;
  readonly identities: readonly string[];
  readonly askedAt: number;
  readonly complete: boolean;
};

export function shownSnapshotOf(
  work: PublishedWork,
  complete: boolean,
): ShownSnapshot {
  return {
    sourceId: work.source.id,
    revision: work.revision,
    identities: [...work.taken, ...work.backlog].map((entry) => entry.identity),
    askedAt: Date.parse(work.refAskedAt ?? "") || 0,
    complete,
  };
}

// What the page shows of published work, for settled attempts to reconcile
// with: the snapshot, whether a read of it is under way, why the latest read
// failed, if it did, and asking a fresh read of it.
export type PublishedShown = {
  readonly shown: ShownSnapshot | undefined;
  readonly reading: boolean;
  readonly failure?: string | undefined;
  readonly readAfresh: () => void;
};

// A settled attempt against what is shown: reconciled, waiting for published
// state (with why the last check of it failed, if it did), or unconfirmed
// because its start may or may not have published.
export type Reconciliation =
  | { readonly kind: "reconciled" }
  | { readonly kind: "waiting"; readonly problem?: string }
  | { readonly kind: "unconfirmed" };

// The latest attempt of each story, when it is settled.
function latestSettled(
  known: readonly AttemptObservation[],
): readonly AttemptObservation[] {
  const latest = new Map<string, AttemptObservation>();
  for (const attempt of known) {
    const identity = storyOf(attempt.request);
    if (identity === undefined) continue;
    const key = JSON.stringify([attempt.request.source, identity]);
    latest.set(key, laterAttempt(latest.get(key), attempt));
  }
  return [...latest.values()].filter(
    (attempt) => attempt.outcome !== undefined,
  );
}

// The accepted revision an attempt's publication names, when usable.
function acceptedRevision(attempt: AttemptObservation): string | undefined {
  const { publication } = attempt;
  return publication.kind === "published" &&
    publication.revision !== undefined &&
    commitShaPattern.test(publication.revision)
    ? publication.revision
    : undefined;
}

const askedAfterSettling = (
  attempt: AttemptObservation,
  shown: ShownSnapshot,
) => shown.askedAt > Date.parse(attempt.settledAt ?? "");

export function useStartupReconciliation({
  known,
  shown,
  reading,
  failure,
  readAfresh,
}: {
  readonly known: readonly AttemptObservation[];
} & PublishedShown): (attempt: AttemptObservation) => Reconciliation {
  const [reconciledIds, setReconciledIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  // Reconciled on this machine, or found so on this page.
  const alreadyReconciled = (attempt: AttemptObservation) =>
    attempt.reconciledAt !== undefined || reconciledIds.has(attempt.id);
  const settled = latestSettled(known).filter(
    (attempt) =>
      !alreadyReconciled(attempt) && attempt.request.source === shown?.sourceId,
  );
  const questions: ContainmentQuestion[] = settled.flatMap((attempt) => {
    const accepted = acceptedRevision(attempt);
    return shown === undefined ||
      accepted === undefined ||
      accepted === shown.revision
      ? []
      : [{ sourceId: shown.sourceId, accepted, revision: shown.revision }];
  });
  const containment = usePublicationContainment(questions, shown?.askedAt ?? 0);

  // A waiting attempt says why the latest read failed, when it did and
  // nothing more particular failed.
  const judged = (attempt: AttemptObservation): Reconciliation => {
    const judgement = judgedNow(attempt);
    return judgement.kind === "waiting" &&
      judgement.problem === undefined &&
      failure !== undefined
      ? {
          kind: "waiting",
          problem: `The latest read of published work failed: ${failure}`,
        }
      : judgement;
  };

  const judgedNow = (attempt: AttemptObservation): Reconciliation => {
    if (alreadyReconciled(attempt)) return { kind: "reconciled" };
    if (attempt.publication.kind === "unknown") return { kind: "unconfirmed" };
    if (
      shown === undefined ||
      shown.sourceId !== attempt.request.source ||
      !shown.complete
    )
      return { kind: "waiting" };
    const { publication } = attempt;
    if (publication.kind !== "published" || publication.revision === undefined)
      return askedAfterSettling(attempt, shown)
        ? { kind: "reconciled" }
        : { kind: "waiting" };
    const accepted = acceptedRevision(attempt);
    if (accepted === shown.revision) return { kind: "reconciled" };
    if (accepted === undefined) return { kind: "waiting" };
    const question = {
      sourceId: shown.sourceId,
      accepted,
      revision: shown.revision,
    };
    if (containment.contained(question) === true) return { kind: "reconciled" };
    const problem = containment.problem(question);
    return problem === undefined
      ? { kind: "waiting" }
      : { kind: "waiting", problem };
  };

  // Each newly reconciled attempt is noted once from this page.
  const newlyReconciled = settled.filter(
    (attempt) => judged(attempt).kind === "reconciled",
  );
  const newlyReconciledNow = useRef(newlyReconciled);
  newlyReconciledNow.current = newlyReconciled;
  const nowReconciled = newlyReconciled.map((attempt) => attempt.id).join(" ");
  useEffect(() => {
    if (nowReconciled === "") return;
    setReconciledIds((ids) => new Set([...ids, ...nowReconciled.split(" ")]));
    for (const attempt of newlyReconciledNow.current)
      void noteAttemptReconciled(attempt);
  }, [nowReconciled]);

  // One fresh read for each waiting attempt whose shown snapshot was asked
  // before it settled.
  const freshlyAsked = useRef(new Set<string>());
  const readAfreshNow = useRef(readAfresh);
  readAfreshNow.current = readAfresh;
  const stale = settled
    .filter(
      (attempt) =>
        shown !== undefined &&
        attempt.publication.kind !== "unknown" &&
        !askedAfterSettling(attempt, shown) &&
        judged(attempt).kind === "waiting" &&
        !freshlyAsked.current.has(attempt.id),
    )
    .map((attempt) => attempt.id)
    .join(" ");
  useEffect(() => {
    if (stale === "" || reading) return;
    for (const id of stale.split(" ")) freshlyAsked.current.add(id);
    readAfreshNow.current();
  }, [stale, reading]);

  return judged;
}
