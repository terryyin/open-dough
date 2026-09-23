// Revision-only checks for the local authenticated read boundary
// (`./authenticatedRead.ts`): which commit a catalog source's ref names now,
// asked of GitHub conditionally (`./ghRead.ts`) so an unchanged ref costs a
// `304 Not Modified` rather than a fresh answer.

import type { PublishedSource } from "../src/publishedSource";
import { checkRevisionViaGh, type RevisionAnswer } from "./ghRead";

// The last answer per catalog source, kept only as a hint for the next
// conditional request: in memory, per launched server, bounded by the
// catalog, and never a source of what a project published -- a `304` only
// repeats a commit GitHub itself named for this same source, and every other
// answer replaces the hint.
export class RevisionChecks {
  private readonly answers = new Map<string, RevisionAnswer>();

  async check(source: PublishedSource, signal: AbortSignal): Promise<string> {
    const answer = await checkRevisionViaGh(
      source.repository,
      source.ref,
      this.answers.get(source.id),
      signal,
    );
    if (answer.etag === undefined) {
      this.answers.delete(source.id);
    } else {
      this.answers.set(source.id, answer);
    }
    return answer.revision;
  }
}
