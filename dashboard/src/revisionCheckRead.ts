// Revision-check answers from the local authenticated read boundary
// (`../server/authenticatedRead.ts`): a `since` fetch, or a stream `data`
// event opened with `at`. Both shapes become the page's `RevisionCheck` and
// share the same watched-branch query. Snapshot, file, and commit-time reads
// stay in `./authenticatedRead.ts`.

import { z } from "zod";
import type { StoryBranchHeads } from "./authenticatedBranchRead.ts";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import {
  authenticatedReadEndpoint,
  longestDirectedWaitSeconds,
  readingRefOf,
  revisionStreamAtParameter,
} from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { ReadProblem } from "./readProblem.ts";
import { noteLimit, standingLimit } from "./readingLimit.ts";

const okCheck = z.object({
  revision: commitSha,
  changed: z.boolean(),
  branches: z
    .array(z.object({ branch: z.string().min(1), head: commitSha.nullable() }))
    .optional(),
});

const streamErrorAnswer = z.object({
  error: z.string().min(1),
  retryAfterSeconds: z
    .number()
    .int()
    .min(0)
    .max(longestDirectedWaitSeconds)
    .optional(),
  recovery: z.literal("transient").optional(),
});

// Whether the source's ref still names the revision shown, or which commit it
// names now. While it does, the check also says which head each watched story
// branch names now, undefined when it is no longer published; it names none
// when the boundary could not list branch heads this time. Nothing of the
// backlog or its records is read.
export type RevisionCheck =
  | {
      readonly changed: false;
      readonly heads: StoryBranchHeads;
    }
  | { readonly changed: true; readonly revision: string };

function watchedBranchesQuery(watched: readonly string[]): string {
  return watched
    .map((branch) => `&watch=${encodeURIComponent(branch)}`)
    .join("");
}

// Interprets one revision-check answer body — from a `since` fetch or a
// stream `data` event — into the page's `RevisionCheck`.
export function revisionCheckFromAnswer(
  body: unknown,
  shown: string,
  watched: readonly string[],
  reading: string,
): RevisionCheck {
  const parsed = okCheck.safeParse(body);
  // Undefined when the boundary could not list branch heads for this check.
  const branches = parsed.data?.branches;
  if (
    !parsed.success ||
    parsed.data.changed !== (parsed.data.revision !== shown) ||
    (branches !== undefined &&
      (branches.length !== watched.length ||
        branches.some(({ branch }, at) => branch !== watched[at])))
  ) {
    throw new ReadProblem(
      `The local authenticated read answered in a shape this dashboard does not understand while checking ${reading}.`,
    );
  }
  return parsed.data.changed
    ? { changed: true, revision: parsed.data.revision }
    : {
        changed: false,
        heads: new Map(
          (branches ?? []).map(({ branch, head }) => [
            branch,
            head ?? undefined,
          ]),
        ),
      };
}

// A stream `data` event that carries today's failure or limited shape, or a
// success answer. Limited answers update the page's rate-limit record.
export function revisionCheckFromStreamData(
  data: string,
  shown: string,
  watched: readonly string[],
  reading: string,
): RevisionCheck {
  let body: unknown;
  try {
    body = JSON.parse(data) as unknown;
  } catch {
    throw unexpectedAnswer(reading);
  }
  const failed = streamErrorAnswer.safeParse(body);
  if (failed.success) {
    const { error, retryAfterSeconds, recovery } = failed.data;
    if (retryAfterSeconds !== undefined) {
      noteLimit(retryAfterSeconds);
    }
    const resumesAt =
      retryAfterSeconds === undefined ? undefined : standingLimit();
    throw new ReadProblem(
      error,
      resumesAt === undefined ? undefined : { reading, resumesAt },
      recovery,
    );
  }
  return revisionCheckFromAnswer(body, shown, watched, reading);
}

// The EventSource URL for one source's revision stream at the shown revision
// and watched branches (`at`, not `since`).
export function revisionStreamUrl(
  source: PublishedSource,
  shown: string,
  watched: readonly string[],
): string {
  return `${authenticatedReadEndpoint}?source=${encodeURIComponent(source.id)}&${revisionStreamAtParameter}=${encodeURIComponent(shown)}${watchedBranchesQuery(watched)}`;
}

// Checks the source's ref, and the heads of `watched`: story branches Taken
// entries' profiles record at the revision shown, which the local boundary
// confirms from that revision's records before answering.
export async function checkPublishedRevision(
  source: PublishedSource,
  shown: string,
  watched: readonly string[],
  signal: AbortSignal,
): Promise<RevisionCheck> {
  const reading = readingRefOf(source);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&since=${encodeURIComponent(shown)}${watchedBranchesQuery(watched)}`,
    reading,
    signal,
  );
  return revisionCheckFromAnswer(body, shown, watched, reading);
}
