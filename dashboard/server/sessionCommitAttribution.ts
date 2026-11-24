// Decides which entries of an execution checkout's `HEAD` log are commits a
// session made there, and groups them into runs. The entries are plain values
// read from Git by `sessionCommitsCapture.ts`; this decision reads no Git.

import type { SessionCommitRun } from "../src/sessionCommits.ts";

// One `HEAD` log entry: the commit and its parents, the log time, the action
// that wrote it, and the commit's author time and subject.
export interface LogEntry {
  readonly commit: string;
  readonly parents: readonly string[];
  readonly at: number;
  readonly action: string;
  readonly authoredAt: number;
  readonly subject: string;
}

// A commit the session made, with its first parent.
export interface MadeCommit {
  readonly commit: string;
  readonly parent: string;
}

const committing =
  /^(?:commit(?: \((?:amend|cherry-pick)\))?|cherry-pick|revert): /;
const replaying =
  /^(?:rebase|pull)\b[^:]* \((?:pick|continue|fixup|squash)\): /;
const moving =
  /^(?:checkout: moving from |reset: moving to |(?:merge|pull)\b[^:]*: Fast-forward\b|(?:rebase|pull)\b[^:]* \((?:start|finish|abort)\): )/;

// Place each entry of a newest-first log as work made here, movement or a
// merge, or a replay of older work. The log can settle an empty result only
// if every entry fits.
export function madeSince(
  log: readonly LogEntry[],
  since: number,
): MadeCommit[] {
  const made = new Map<string, string>();
  const fingerprints = new Set<string>();
  for (const entry of log.filter(({ at }) => at >= since).reverse()) {
    const { action, parents, commit, authoredAt, subject } = entry;
    if (parents.length > 1 || moving.test(action)) continue;
    const fingerprint = `${String(authoredAt)} ${subject}`;
    const [parent] = parents;
    if (parent !== undefined && committing.test(action)) {
      fingerprints.add(fingerprint);
      made.set(commit, parent);
      continue;
    }
    if (parent !== undefined && replaying.test(action)) {
      if (fingerprints.has(fingerprint)) {
        made.set(commit, parent);
        continue;
      }
      if (authoredAt < since) continue;
    }
    throw new Error("The checkout's log has a commit that cannot be placed.");
  }
  return [...made].map(([commit, parent]) => ({ commit, parent }));
}

// A run grows while a session commit's first parent is the previous session
// commit; its pair is the first commit's first parent and its last commit.
export function runsOf(made: readonly MadeCommit[]): SessionCommitRun[] {
  const runs: SessionCommitRun[] = [];
  for (const { commit, parent } of made) {
    const last = runs.at(-1);
    if (last !== undefined && last.revision === parent)
      runs[runs.length - 1] = { base: last.base, revision: commit };
    else runs.push({ base: parent, revision: commit });
  }
  return runs;
}
