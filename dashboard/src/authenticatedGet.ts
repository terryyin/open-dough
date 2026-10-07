// The one request the browser makes to the local authenticated read boundary
// (`../server/authenticatedRead.ts`), shared by every published-state read
// (`./authenticatedRead.ts`, `./authenticatedBranchRead.ts`): an ordinary
// same-origin `fetch` whose refusal or failure becomes a `ReadProblem` naming
// what was being read. It keeps the page's record of GitHub's rate limit
// (`./readingLimit.ts`). What it answers crossed a process/HTTP boundary, so
// each reader checks it as external input.

import { z } from "zod";
import {
  authenticatedReadEndpoint,
  commitShaPattern,
  longestDirectedWaitSeconds,
  notAskedOfGitHub,
} from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";
import { noteLimit, noteWithheld, standingLimit } from "./readingLimit.ts";

export const commitSha = z.string().regex(commitShaPattern);

// A file published at a pinned revision: its repository path and raw text.
export const publishedFile = z.object({
  path: z.string().min(1),
  text: z.string(),
});
export type PublishedFile = z.infer<typeof publishedFile>;

const errorAnswer = z.object({
  error: z.string().min(1),
  retryAfterSeconds: z
    .number()
    .int()
    .min(0)
    .max(longestDirectedWaitSeconds)
    .optional(),
});

// While the page's limit stands (`./readingLimit.ts`), a read is answered as
// limited here, never asked; a limited answer from the boundary sets or
// extends that limit. Either limited problem carries `reading` and when
// reading resumes.
export async function authenticatedGet(
  query: string,
  reading: string,
  signal: AbortSignal,
): Promise<unknown> {
  const standing = standingLimit();
  if (standing !== undefined) {
    noteWithheld();
    throw new ReadProblem(notAskedOfGitHub(reading), {
      reading,
      resumesAt: standing,
    });
  }
  let response: Response;
  try {
    response = await fetch(`${authenticatedReadEndpoint}?${query}`, {
      signal,
    });
  } catch (error) {
    if (signal.aborted) {
      throw error;
    }
    throw new ReadProblem(
      `The local authenticated read could not be reached while reading ${reading}.`,
    );
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const reported = errorAnswer.safeParse(body);
    if (!reported.success) {
      throw new ReadProblem(
        `The local authenticated read answered HTTP ${response.status} while reading ${reading}.`,
      );
    }
    const { error, retryAfterSeconds } = reported.data;
    // An answer the page no longer waits for teaches it nothing.
    if (retryAfterSeconds !== undefined && !signal.aborted) {
      noteLimit(retryAfterSeconds);
    }
    const resumesAt =
      retryAfterSeconds === undefined ? undefined : standingLimit();
    throw new ReadProblem(
      error,
      resumesAt === undefined ? undefined : { reading, resumesAt },
    );
  }
  return body;
}

// An answer whose shape this dashboard does not understand.
export function unexpectedAnswer(reading: string): ReadProblem {
  return new ReadProblem(
    `The local authenticated read answered in a shape this dashboard does not understand while reading ${reading}.`,
  );
}
