// What the Recently done journeys (recently-done-stories.spec.ts and
// recently-done-story-sessions.spec.ts) publish and keep: a backlog with one
// queued story, done records beside it spelled by the shared done-record
// renderer at times before the journey starts, and this machine's session
// records of an ad hoc session and of the queued story, and, for the done
// cards' sessions, of done stories, each listed by the synthetic `claude`.
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
  // The done stories' sessions: Card shows avatar's execution, marked done,
  // and its refinement, still open, both launched before it was done; the
  // story done last week's session launched yesterday; and the open session
  // of the story done 31 days before.
  executedDoneSessionLaunched: 5 * hour,
  executedDoneSessionMarked: 3 * hour,
  executedOpenSessionLaunched: 4 * hour,
  lastWeekDone: 7 * day,
  lastWeekSessionLaunched: 20 * hour,
  expiredSessionLaunched: 32 * day,
};

export const executed = {
  identity: "SEED-038#card-shows-avatar",
  title: "Card shows avatar",
};
export const removedQueued = {
  identity: "SEED-042#queued-and-removed",
  title: "Remove a story nobody executed",
};
export const lastWeek = {
  identity: "SEED-039#done-last-week",
  title: "Finish something last week",
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

// The done records, with the story done last week's beside them.
export function withLastWeekRecordFiles(now: number): Record<string, string> {
  return {
    ...doneRecordFiles(now),
    [`.planning/${doneRecordPath(lastWeek.identity)}`]: renderDoneRecord({
      ...lastWeek,
      completedAt: at(now, placed.lastWeekDone),
      developer: "Terry Yin",
    }),
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

const session = (sessionId: string, name: string) => ({
  host: "claude" as const,
  sessionId,
  shortId: sessionId.slice(0, 8),
  name,
});

// A story's session record, launched `before` `now`.
const storySession = (
  now: number,
  story: { readonly identity: string; readonly title: string },
  workflow: "execution" | "refinement",
  sessionId: string,
  before: number,
): LaunchRecord => ({
  request: { source: "open-dough", ...story, workflow, host: "claude" },
  session: session(sessionId, story.title),
  launchedAt: at(now, before),
});

// This machine's sessions of the done stories, oldest first, of the sessions
// the synthetic `claude` lists by these ids: Card shows avatar's execution
// marked done and its open refinement, the story done last week's execution
// launched yesterday, and the 31-day-old story's open execution.
export function doneStorySessions(
  now: number,
  sessionIds: {
    readonly executedDone: string;
    readonly executedOpen: string;
    readonly lastWeek: string;
    readonly expired: string;
  },
): LaunchRecord[] {
  return [
    storySession(
      now,
      expired,
      "execution",
      sessionIds.expired,
      placed.expiredSessionLaunched,
    ),
    {
      ...storySession(
        now,
        executed,
        "execution",
        sessionIds.executedDone,
        placed.executedDoneSessionLaunched,
      ),
      doneAt: at(now, placed.executedDoneSessionMarked),
    },
    storySession(
      now,
      executed,
      "refinement",
      sessionIds.executedOpen,
      placed.executedOpenSessionLaunched,
    ),
    storySession(
      now,
      lastWeek,
      "execution",
      sessionIds.lastWeek,
      placed.lastWeekSessionLaunched,
    ),
  ];
}

// This machine's sessions for the project, each launched `placed` before
// `now`, of the sessions the synthetic `claude` lists by these ids.
export function keptSessions(
  now: number,
  sessionIds: { readonly adHoc: string; readonly queued: string },
): LaunchRecord[] {
  return [
    storySession(
      now,
      { identity: queuedIdentity, title: queuedTitle },
      "execution",
      sessionIds.queued,
      placed.queuedLaunched,
    ),
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
