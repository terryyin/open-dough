// One commit's record, remembered under the key the memo names for that
// commit (`./pinnedMemo.ts`): who committed it and every file it changed.
// A commit never changes, so whichever path or read asks, `read` runs once.
// The memo's `read` defaults to GitHub (`./ghCommit.ts`).

import type { CommitRecord } from "./ghCommit.ts";
import { type RevisionMemo, recalledAsJson } from "./revisionMemo.ts";

export function readRememberedCommit(
  memo: RevisionMemo,
  key: string,
  retained: boolean,
  read: () => Promise<CommitRecord>,
): Promise<CommitRecord> {
  return recalledAsJson((text) => memo.recalled(key, retained, text), read);
}
