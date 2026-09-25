// The one request the browser makes to the local authenticated read boundary
// (`../server/authenticatedRead.ts`), shared by every published-state read
// (`./authenticatedRead.ts`, `./authenticatedBranchRead.ts`): an ordinary
// same-origin `fetch` whose refusal or failure becomes a `ReadProblem` naming
// what was being read. What it answers crossed a process/HTTP boundary, so
// each reader checks it as external input.

import { z } from "zod";
import {
  authenticatedReadEndpoint,
  commitShaPattern,
  longestDirectedWaitSeconds,
} from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";

export const commitSha = z.string().regex(commitShaPattern);

const errorAnswer = z.object({
  error: z.string().min(1),
  retryAfterSeconds: z
    .number()
    .int()
    .min(0)
    .max(longestDirectedWaitSeconds)
    .optional(),
});

export async function authenticatedGet(
  query: string,
  reading: string,
  signal: AbortSignal,
): Promise<unknown> {
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
    throw reported.success
      ? new ReadProblem(reported.data.error, reported.data.retryAfterSeconds)
      : new ReadProblem(
          `The local authenticated read answered HTTP ${response.status} while reading ${reading}.`,
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
