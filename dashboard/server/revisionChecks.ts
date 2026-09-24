// Revision-only checks for the local authenticated read boundary
// (`./authenticatedRead.ts`): which commit a catalog source's ref, and every
// other published branch head, names now, asked of GitHub in one conditional
// listing (`./ghRevision.ts`) so unchanged heads cost a `304 Not Modified`
// rather than a fresh answer.

import type { PublishedSource } from "../src/publishedSource";
import { checkHeadsViaGh, type HeadsAnswer } from "./ghRevision";
import { GhFailure } from "./ghRead";

// What one check found: the commit the source's ref names, and the head of
// every published branch.
export type CheckedHeads = {
  readonly revision: string;
  readonly heads: ReadonlyMap<string, string>;
};

// The last answer per catalog source, kept only as a hint for the next
// conditional request: in memory, per launched server, bounded by the
// catalog, and never a source of what a project published -- a `304` only
// repeats heads GitHub itself listed for this same source, and every other
// answer replaces the hint.
export class RevisionChecks {
  private readonly answers = new Map<string, HeadsAnswer>();

  async check(
    source: PublishedSource,
    signal: AbortSignal,
  ): Promise<CheckedHeads> {
    const answer = await checkHeadsViaGh(
      source.repository,
      this.answers.get(source.id),
      signal,
    );
    if (answer.etag === undefined) {
      this.answers.delete(source.id);
    } else {
      this.answers.set(source.id, answer);
    }
    const revision = answer.heads.get(source.ref);
    if (revision === undefined) {
      // The listing does not name the source's ref: it names no commit.
      throw new GhFailure({ kind: "no-commit" });
    }
    return { revision, heads: answer.heads };
  }
}
