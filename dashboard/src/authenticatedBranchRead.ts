// Reads of a story branch through the local authenticated read boundary
// (`../server/authenticatedRead.ts`): with `branch`, which commit a story
// branch recorded at a revision already shown names now, and with its `head`
// one recorded plan, or its last commit (`./authenticatedRead.ts`), at that
// head. The boundary decides from the shown revision's records whether the
// branch and plan may be read at all.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet";
import { readingBranchHeadOf, readingPathAt } from "./authenticatedReadRules";
import type { PublishedSource } from "./publishedSource";

// A story branch a Taken entry's profile records at a revision already
// shown, and the head the local boundary found it naming.
export type BranchHead = { readonly branch: string; readonly head: string };

export function onBranchQuery(onBranch: BranchHead | undefined): string {
  return onBranch === undefined
    ? ""
    : `&branch=${encodeURIComponent(onBranch.branch)}&head=${encodeURIComponent(onBranch.head)}`;
}

const okBranchHead = z.object({
  revision: commitSha,
  branch: z.string().min(1),
  head: commitSha.nullable(),
});

// Which commit `branch`, recorded by a Taken entry's profile at `revision`,
// names now; undefined when it is no longer published.
export async function readBranchHeadAt(
  source: PublishedSource,
  revision: string,
  branch: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  const reading = readingBranchHeadOf(branch, source.repository);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&branch=${encodeURIComponent(branch)}`,
    reading,
    signal,
  );
  const parsed = okBranchHead.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.revision !== revision ||
    parsed.data.branch !== branch
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.head ?? undefined;
}

const okFileOnBranch = z.object({
  revision: commitSha,
  path: z.string().min(1),
  text: z.string().nullable(),
});

// The recorded plan at a branch head the local boundary resolved; undefined
// when that head does not have it.
export async function readFileOnBranch(
  source: PublishedSource,
  repositoryPath: string,
  revision: string,
  onBranch: BranchHead,
  signal: AbortSignal,
): Promise<string | undefined> {
  const reading = readingPathAt(repositoryPath, onBranch.head);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}${onBranchQuery(onBranch)}&path=${encodeURIComponent(repositoryPath)}`,
    reading,
    signal,
  );
  const parsed = okFileOnBranch.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.path !== repositoryPath ||
    parsed.data.revision !== onBranch.head
  ) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.text ?? undefined;
}
