// Reads one published backlog revision into the snapshot the dashboard shows
// (`./publishedWork.ts`). Settled question outcomes for the active observation
// (`./observationOutcomes.ts`) are recorded as each detail validates its
// answer or projects a typed gap.

import type { PublishedWork, PublishedWorkProgress } from "./publishedWork.ts";
import { interpretPublishedBacklog } from "./publishedBacklog.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import {
  trackSettledAsk,
  type ObservationOutcomes,
} from "./observationOutcomes.ts";
import { ReadProblem } from "./readProblem.ts";
import { unansweredWithinReadWait, withinReadWait } from "./readWaitBound.ts";
import { awaitingOwners } from "./assignmentPlacement.ts";
import { readPublishedDetails } from "./publishedWorkDetails.ts";

// Reads the source's ref afresh, or an already resolved revision. When the
// wait bound ends after membership, unfinished details become gaps. Humans
// and clocks share one addition read per agent profile. At the same revision
// as `shown`, successful facts stay projected rather than returning to
// loading while eligible unanswered questions are asked again.
export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  onPartial?: PublishedWorkProgress,
  knownRevision?: string,
  shown?: PublishedWork,
): Promise<PublishedWork> {
  return withinReadWait(signal, async (untilEither, bound) => {
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
        readPublishedSnapshot(source, untilEither, knownRevision),
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
      const { revision, backlog: markdown, askedAt } = snapshot;
      outcomes.pinRevision(revision);
      const sameRevision = shown !== undefined && shown.revision === revision;
      // Membership first, then preparation enrichment through the same
      // boundary's reachability-checked path reads at that revision. Same-
      // revision recovery keeps already shown facts instead of loading.
      const work: PublishedWork = sameRevision
        ? {
            ...shown,
            retrievedAt: new Date(),
            ...(askedAt === undefined ? {} : { refAskedAt: askedAt }),
          }
        : awaitingOwners({
            source,
            revision,
            retrievedAt: new Date(),
            ...(askedAt === undefined ? {} : { refAskedAt: askedAt }),
            ...interpretPublishedBacklog(markdown, revision, source),
            done: { status: "loading" },
          });
      return await readPublishedDetails(
        work,
        sameRevision,
        untilEither,
        bound,
        signal,
        outcomes,
        onPartial,
      );
    } catch (error) {
      // The browser-owned wait bound, not caller departure: eligible for
      // project-local transient recovery. Departure keeps its abort reason.
      if (bound.aborted && !signal.aborted) {
        throw new ReadProblem(
          `${unansweredWithinReadWait}, so the read was given up.`,
          undefined,
          "transient",
        );
      }
      throw error;
    }
  });
}
