// What the Recently done journeys (recently-done-stories.spec.ts and
// recently-done-story-sessions.spec.ts) publish: a backlog with one queued
// story, and done records beside it spelled by the shared done-record renderer
// at times before the journey starts, with the done catalog completion
// publishes beside them (./doneCatalogAnswers.ts). What this machine keeps for
// them is ./recentlyDoneSessions.ts.
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { basename } from "node:path";
import { withDoneCatalog } from "./doneCatalogAnswers.ts";

export const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
export const revision = "d0".repeat(20);
// Another revision, whose reads the local boundary has not yet remembered.
export const otherRevision = "d1".repeat(20);

export const queuedTitle = "Prepare stories in a clear workspace";
export const queuedIdentity = "SEED-008#planning-workspace-procedure";

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
  // story done last week's session launched yesterday; and the retained closed session
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

// The time `before` `now`.
export const at = (now: number, before: number) =>
  new Date(now - before).toISOString();

// Where `complete` publishes a story's done record.
export const doneRecordAt = (identity: string) =>
  `.planning/${doneRecordPath(identity)}`;

// Where `complete` publishes done records and their catalog.
export const doneDirectory = ".planning/done";

// The done records beside the backlog, as `complete` would have published
// them, completed `placed` before `now`, with no catalog yet.
function recordFiles(now: number): Record<string, string> {
  return {
    [doneRecordAt(executed.identity)]: renderDoneRecord({
      ...executed,
      completedAt: at(now, placed.executedDone),
      developer: "Terry Yin",
      agent: "Yui-chan",
      host: "claude",
      model: "claude-opus-5-5",
    }),
    // A queued story removed with no execution agent profile.
    [doneRecordAt(removedQueued.identity)]: renderDoneRecord({
      ...removedQueued,
      completedAt: at(now, placed.queuedRemovedDone),
      developer: "Terry Yin",
    }),
    [doneRecordAt(expired.identity)]: renderDoneRecord({
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

// The done records, with the catalog completion publishes beside them.
export function doneRecordFiles(now: number): Record<string, string> {
  return withDoneCatalog(recordFiles(now), doneDirectory);
}

// The done records, with the story done last week's beside them.
export function withLastWeekRecordFiles(now: number): Record<string, string> {
  return withDoneCatalog(
    {
      ...recordFiles(now),
      [doneRecordAt(lastWeek.identity)]: renderDoneRecord({
        ...lastWeek,
        completedAt: at(now, placed.lastWeekDone),
        developer: "Terry Yin",
      }),
    },
    doneDirectory,
  );
}

// The published files at `revision`: the backlog, and the done records when
// given.
export function publishedFiles(
  records: Readonly<Record<string, string>> = {},
): Record<string, string> {
  return { [backlogPath]: backlog, ...records };
}

// The done catalog, listed among the done records, whose read fails.
export const unanswered = `${doneDirectory}/.catalog.json`;

// Another revision, whose done records are published without a catalog, as
// a writer from before catalogs would leave them.
export const uncataloguedRevision = "d3".repeat(20);

// Another revision still, whose reads the local boundary has not remembered.
export const malformedRevision = "d2".repeat(20);

// Done record files the shared reader refuses, by file name: one in a later
// format, and one whose text names another identity than its file.
const futureFormat = "SEED-050#future-format";
const misnamed = "SEED-051#misnamed";
export const futureFormatFile = basename(doneRecordPath(futureFormat));
export const misnamedFile = basename(doneRecordPath(misnamed));

// The done records with the refused ones beside them.
export function withMalformedRecordFiles(now: number): Record<string, string> {
  return withDoneCatalog(
    {
      ...recordFiles(now),
      [doneRecordAt(futureFormat)]: `${JSON.stringify({
        schemaVersion: 2,
        identity: futureFormat,
        title: "Written in a later format",
        completedAt: at(now, placed.executedDone),
      })}\n`,
      [doneRecordAt(misnamed)]: renderDoneRecord({
        identity: "SEED-052#named-inside",
        title: "Named for another identity",
        completedAt: at(now, placed.executedDone),
        developer: "Terry Yin",
      }),
    },
    doneDirectory,
  );
}
