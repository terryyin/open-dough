// Story branch heads the local authenticated read boundary
// (`./authenticatedRead.ts`) verified at origin and observed locally.
// A read at a branch head is answered only for a head remembered here for
// that branch, so the browser can never name a commit of its own choosing:
// every head it may read at is one this boundary found the branch naming.

import type { PublishedSource } from "../src/publishedSource.ts";

// In memory, per launched server, and bounded: a head found once stays
// readable while a page still shows it, even after the branch moves on.
const rememberedHeadLimit = 500;

export class BranchHeads {
  private readonly heads = new Set<string>();

  private static key(source: PublishedSource, branch: string, head: string) {
    return `${source.repository}\0${branch}\0${head}`;
  }

  // Remembers the head reported from a verified Board observation.
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
