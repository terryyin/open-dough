// Revision-only checks for the local authenticated read boundary
// (`./authenticatedRead.ts`): which commit a catalog source's ref, and every
// other published branch head, names now, asked of GitHub in one conditional
// listing (`./ghRevision.ts`) so unchanged heads cost a `304 Not Modified`
// rather than a fresh answer. When that listing fails for any reason but a
// rate limit -- it is one unpaginated answer, which a repository with
// thousands of branches may exceed or GitHub may give up on -- that check
// asks only which commit the ref names, and says nothing of branch heads.

import type { PublishedSource } from "../src/publishedSource.ts";
import {
  checkHeadsViaGh,
  resolveRevisionViaGh,
  type HeadsAnswer,
} from "./ghRevision.ts";
import { GhFailure } from "./ghRead.ts";

// What one check found: the commit the source's ref names, and the head of
// every published branch, or undefined when the listing could not say.
export type CheckedHeads = {
  readonly revision: string;
  readonly heads: ReadonlyMap<string, string> | undefined;
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
    let answer: HeadsAnswer;
    try {
      answer = await checkHeadsViaGh(
        source.repository,
        this.answers.get(source.id),
        signal,
      );
    } catch (error) {
      if (
        signal.aborted ||
        !(error instanceof GhFailure) ||
        error.reason.kind === "rate-limited"
      ) {
        throw error;
      }
      // The earlier answer stays the hint, so watching branch heads resumes
      // with the next listing that succeeds.
      return {
        revision: await resolveRevisionViaGh(
          source.repository,
          source.ref,
          signal,
        ),
        heads: undefined,
      };
    }
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
