// Story branch heads the local authenticated read boundary
// (`./authenticatedRead.ts`) resolved itself, through `gh` (`./ghRevision.ts`),
// one at a time or in a revision check's listing of every head.
// A read at a branch head is answered only for a head remembered here for
// that branch, so the browser can never name a commit of its own choosing:
// every head it may read at is one this boundary found the branch naming.

import type { PublishedSource } from "../src/publishedSource.ts";
import { resolveBranchHeadViaGh } from "./ghRevision.ts";

// In memory, per launched server, and bounded: a head found once stays
// readable while a page still shows it, even after the branch moves on.
const rememberedHeadLimit = 500;

export class BranchHeads {
  private readonly heads = new Set<string>();

  private static key(source: PublishedSource, branch: string, head: string) {
    return `${source.repository}\0${branch}\0${head}`;
  }

  // Which commit `branch` names now, remembered as resolved; undefined when
  // the branch is no longer published.
  async resolve(
    source: PublishedSource,
    branch: string,
    signal: AbortSignal,
  ): Promise<string | undefined> {
    const head = await resolveBranchHeadViaGh(
      source.repository,
      branch,
      signal,
    );
    if (head !== undefined) {
      this.remember(source, branch, head);
    }
    return head;
  }

  // Remembers that this boundary found `branch` naming `head`, as a revision
  // check listing every published head does (`./revisionChecks.ts`).
  remember(source: PublishedSource, branch: string, head: string): void {
    const key = BranchHeads.key(source, branch, head);
    this.heads.delete(key);
    this.heads.add(key);
    while (this.heads.size > rememberedHeadLimit) {
      const oldest = this.heads.values().next().value;
      if (oldest === undefined) {
        break;
      }
      this.heads.delete(oldest);
    }
  }

  // Whether this boundary found `branch` naming `head`.
  resolved(source: PublishedSource, branch: string, head: string): boolean {
    return this.heads.has(BranchHeads.key(source, branch, head));
  }
}
