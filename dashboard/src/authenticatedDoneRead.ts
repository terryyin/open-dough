// The done records published beside the backlog, read through the local
// authenticated read boundary (`../server/authenticatedRead.ts`) with
// `done=records` at a revision already resolved: every record file the
// revision's listing of their directory names, as the agent profiles are read
// (`./authenticatedProfileRead.ts`). What each says is left to the shared
// done-record module (`./doneStories.ts`).

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  publishedFile,
  unexpectedAnswer,
  type PublishedFile,
} from "./authenticatedGet.ts";
import type { PublishedSource } from "./publishedSource.ts";

const okDoneRecords = z.object({
  revision: commitSha,
  records: z.array(publishedFile),
});

// The done records published at `revision`, by repository path and raw text
// (none when the revision has no done-record directory).
export async function readDoneRecordsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<readonly PublishedFile[]> {
  const reading = `the done records of ${source.repository} at ${revision}`;
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&done=records`,
    reading,
    signal,
  );
  const parsed = okDoneRecords.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.records;
}
