// The revisions of each source's repository that GitHub named to this
// dashboard process in this run -- as the configured ref or a branch's head --
// which alone may be answered from what other processes retained
// (`./pinnedMemo.ts`). Kept in memory only, at most `heardLimit`, letting the
// one heard longest ago go first.

import type { PublishedSource } from "../src/publishedSource.ts";

// Far more than one run's commits; one forgotten only asks GitHub again.
const heardLimit = 500;

export class HeardRevisions {
  private readonly heard = new Set<string>();

  private static key(source: PublishedSource, revision: string) {
    return `${source.repository}\0${revision}`;
  }

  named(source: PublishedSource, revision: string): void {
    const key = HeardRevisions.key(source, revision);
    this.heard.delete(key);
    this.heard.add(key);
    while (this.heard.size > heardLimit) {
      const oldest = this.heard.values().next().value;
      if (oldest === undefined) {
        break;
      }
      this.heard.delete(oldest);
    }
  }

  has(source: PublishedSource, revision: string): boolean {
    return this.heard.has(HeardRevisions.key(source, revision));
  }
}
