// Reads one published backlog revision into the snapshot the dashboard shows
// (`./publishedWork.ts`). Settled question outcomes for the active observation
// (`./observationOutcomes.ts`) are recorded as each detail validates its
// answer or projects a typed gap.

import {
  shownAtRevision,
  type PublishedWork,
  type PublishedWorkProgress,
} from "./publishedWork.ts";
import { interpretPublishedBacklog } from "./publishedBacklog.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedObservationReadSource } from "./publishedObservationReadSource.ts";
import {
  trackSettledAsk,
  type ObservationOutcomes,
} from "./observationOutcomes.ts";
import { readingRefOf } from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";
import { unansweredWithinReadWait, withinReadWait } from "./readWaitBound.ts";
import { awaitingOwners } from "./assignmentPlacement.ts";
import { readPublishedDetails } from "./publishedWorkDetails.ts";
import type { RevisionConfirmation } from "./revisionCheckRead.ts";

// Reads the source's ref afresh, or an already resolved revision. When the
// wait bound ends after membership, unfinished details become gaps. Humans
// and clocks share one addition read per agent profile. At the same revision
// as `shown`, successful facts stay projected rather than returning to
// loading while eligible unanswered questions are asked again.
export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  onPartial: PublishedWorkProgress | undefined,
  knownRevision: string | undefined,
  shown: PublishedWork | undefined,
  reads: PublishedObservationReadSource,
  fresh = false,
  confirmation?: RevisionConfirmation,
): Promise<PublishedWork> {
  return withinReadWait(signal, async (untilEither, bound) => {
    let confirmationFailure: ReadProblem | undefined;
    try {
      // Every catalog source is read through the one local authenticated
      // boundary: one resolved revision and its raw backlog text first.
      const membershipQuestion =
        knownRevision === undefined
          ? { sourceId: source.id, operation: "ref" as const }
          : {
              sourceId: source.id,
              revision: knownRevision,
              operation: "backlog" as const,
              path: source.backlogPath,
            };
      const snapshot = await trackSettledAsk(
        outcomes,
        reads.readSnapshot(source, untilEither, knownRevision, fresh),
        {
          question: membershipQuestion,
          of: (read) => ({
            kind: "answered",
            question: {
              sourceId: source.id,
              revision: read.revision,
              operation: knownRevision === undefined ? "ref" : "backlog",
              ...(knownRevision === undefined
                ? {}
                : { path: source.backlogPath }),
            },
          }),
          untilEither,
          bound,
          reading:
            knownRevision === undefined
              ? `${source.ref} of ${source.repository}`
              : source.backlogPath,
          unreadable: "Published work could not be read.",
        },
      );
      const { revision, backlog: markdown } = snapshot;
      const { askedAt, confirmedAt } = confirmation ?? snapshot;
      const previous = shown?.source.id === source.id ? shown : undefined;
      if (snapshot.unrecorded) {
        confirmationFailure = new ReadProblem(
          `The check of ${readingRefOf(source)} could not be saved.`,
        );
        // Keep the current view. On open, show the former confirmation
        // through the normal progress reports before reporting the failure.
        if (previous !== undefined) throw confirmationFailure;
      }
      const resolved = {
        ...(askedAt === undefined ? {} : { refAskedAt: askedAt }),
        ...(confirmedAt === undefined ? {} : { confirmedAt }),
      };
      outcomes.pinRevision(revision);
      const kept = shownAtRevision(previous, { source, revision });
      const sameRevision = kept !== undefined;
      const retrievedAt = new Date();
      // Membership first, then preparation enrichment through the same
      // boundary's reachability-checked path reads at that revision. Same-
      // revision recovery keeps already shown facts instead of loading.
      const work: PublishedWork = sameRevision
        ? {
            ...kept,
            retrievedAt,
            ...resolved,
          }
        : awaitingOwners({
            source,
            revision,
            retrievedAt,
            ...resolved,
            ...interpretPublishedBacklog(markdown, revision, source),
            done: { status: "loading" },
          });
      // A new revision of the shown project carries the shown facts until
      // its own answers replace them; another project starts afresh.
      const carriedFrom = sameRevision ? undefined : previous;
      const details = await readPublishedDetails(
        reads,
        work,
        sameRevision,
        carriedFrom,
        untilEither,
        bound,
        signal,
        outcomes,
        onPartial,
      );
      if (confirmationFailure !== undefined) throw confirmationFailure;
      return details;
    } catch (error) {
      // The browser-owned wait bound, not caller departure: eligible for
      // project-local transient recovery. Departure keeps its abort reason.
      if (bound.aborted && !signal.aborted) {
        throw (
          confirmationFailure ??
          new ReadProblem(
            `${unansweredWithinReadWait}, so the read was given up.`,
            undefined,
            "transient",
          )
        );
      }
      throw error;
    }
  });
}
