// What the Recently done stories journey (recently-done-stories.spec.ts)
// publishes and keeps: a backlog with one queued story, done records beside
// it spelled by the shared done-record renderer at times before the journey
// starts, and this machine's session records of an ad hoc session and of the
// queued story, each listed by the synthetic `claude`.

import {
  doneRecordPath,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../src/agentLaunch.ts";

export const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const revision = "d0".repeat(20);
// Another revision, whose reads the local boundary has not yet remembered.
export const otherRevision = "d1".repeat(20);

export const queuedTitle = "Prepare stories in a clear workspace";
const queuedIdentity = "SEED-008#planning-workspace-procedure";

export const backlog = `# Product backlog

## Taken

## Backlog list

- [${queuedTitle}](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — ${queuedIdentity}
`;

const hour = 60 * 60 * 1000;
const day = 24 * hour;

// Times before `now` the journey's records are placed at: with "now" past
// 11:00, an ad hoc session launched at 11:00, a story done at 10:00, and the
// queued story's session launched at 09:00.
export const placed = {
  adHocLaunched: hour,
  executedDone: 2 * hour,
  queuedLaunched: 3 * hour,
  queuedRemovedDone: day,
  expiredDone: 31 * day,
};

export const executed = {
  identity: "SEED-038#card-shows-avatar",
  title: "Card shows avatar",
};
export const removedQueued = {
  identity: "SEED-042#queued-and-removed",
  title: "Remove a story nobody executed",
};
export const expired = {
  identity: "SEED-011#done-long-ago",
  title: "Finish something a month ago",
};

const at = (now: number, before: number) =>
  new Date(now - before).toISOString();

// The done records beside the backlog, as `complete` would have published
// them, completed `placed` before `now`.
export function doneRecordFiles(now: number): Record<string, string> {
  const file = (identity: string) => `.planning/${doneRecordPath(identity)}`;
  return {
    [file(executed.identity)]: renderDoneRecord({
      ...executed,
      completedAt: at(now, placed.executedDone),
      developer: "Terry Yin",
      agent: "Yui-chan",
      host: "claude",
      model: "claude-opus-5-5",
    }),
    // A queued story removed with no execution agent profile.
    [file(removedQueued.identity)]: renderDoneRecord({
      ...removedQueued,
      completedAt: at(now, placed.queuedRemovedDone),
      developer: "Terry Yin",
    }),
    [file(expired.identity)]: renderDoneRecord({
      ...expired,
      completedAt: at(now, placed.expiredDone),
      developer: "Terry Yin",
      agent: "Akiho-chan",
      host: "codex",
    }),
    // Not a done record by its name, so never read.
    ".planning/done/README.md": "Not a done record.\n",
  };
}

// The published files at `revision`: the backlog, and the done records when
// given.
export function publishedFiles(
  records: Readonly<Record<string, string>> = {},
): Record<string, string> {
  return { [backlogPath]: backlog, ...records };
}

// A done record whose read fails, listed in the done-record directory.
export const unanswered = `.planning/${doneRecordPath(executed.identity)}`;

// This machine's sessions for the project, each launched `placed` before
// `now`, of the sessions the synthetic `claude` lists by these ids.
export function keptSessions(
  now: number,
  sessionIds: { readonly adHoc: string; readonly queued: string },
): LaunchRecord[] {
  const session = (sessionId: string, name: string) => ({
    host: "claude" as const,
    sessionId,
    shortId: sessionId.slice(0, 8),
    name,
  });
  return [
    {
      request: {
        source: "open-dough",
        identity: queuedIdentity,
        title: queuedTitle,
        workflow: "execution",
        host: "claude",
      },
      session: session(sessionIds.queued, queuedTitle),
      launchedAt: at(now, placed.queuedLaunched),
    },
    {
      request: {
        source: "open-dough",
        workflow: "ad-hoc",
        title: "Open Dough session",
        host: "claude",
      },
      session: session(sessionIds.adHoc, "Open Dough session"),
      launchedAt: at(now, placed.adHocLaunched),
    },
  ];
}
