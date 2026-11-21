// The sessions the project published close records for, at the snapshot's
// revision: the local boundary's published-session listing
// (`../server/publishedSessionsRead.ts`, `sessions=published`) read beside the
// done catalog (`./publishedWorkDetails.ts`). Loading until it answers; a
// failed read is a gap, never an empty set.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { publishedSessionsRead } from "./authenticatedReadRules.ts";
import {
  publishedSessionRecordSchema,
  type PublishedSessionRecord,
} from "./publishedSessionRecord.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  headedGapCause,
  unavailableGap,
  type UnavailableGap,
} from "./readWaitBound.ts";

export type PublishedSessions =
  | { readonly status: "loading" }
  | UnavailableGap
  | {
      readonly status: "listed";
      readonly revision: string;
      readonly sessions: readonly PublishedSessionRecord[];
    };

// Lists the records published at a revision, or throws when it cannot.
export type PublishedSessionsListing = (
  revision: string,
  signal: AbortSignal,
) => Promise<readonly PublishedSessionRecord[]>;

const okListing = z.object({
  revision: commitSha,
  sessions: z.array(publishedSessionRecordSchema),
});

// The listing of `source` through the local authenticated read boundary.
export function boundaryPublishedSessions(
  source: PublishedSource,
): PublishedSessionsListing {
  return async (revision, signal) => {
    const reading = `the published sessions of ${source.repository} at ${revision}`;
    const { parameter, value } = publishedSessionsRead;
    const body = await authenticatedGet(
      `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&${parameter}=${value}`,
      reading,
      signal,
    );
    const parsed = okListing.safeParse(body);
    if (!parsed.success || parsed.data.revision !== revision)
      throw unexpectedAnswer(reading);
    return parsed.data.sessions;
  };
}

const unreadProblem = "Published sessions could not be read.";

// The published sessions at `revision`, or the gap that keeps them unknown.
export async function readPublishedSessions(
  listing: PublishedSessionsListing,
  revision: string,
  untilEither: AbortSignal,
  bound: AbortSignal,
): Promise<PublishedSessions> {
  try {
    const sessions = await listing(revision, untilEither);
    return { status: "listed", revision, sessions };
  } catch (error) {
    return unavailableGap(
      headedGapCause(
        unreadProblem,
        error,
        untilEither,
        bound,
        "the published sessions",
      ),
    );
  }
}
