// What the Recently done journeys (recently-done-stories.spec.ts and
// recently-done-story-sessions.spec.ts) publish: a backlog with one queued
// story, and done records beside it at times before the journey starts, with
// the done catalog completion publishes beside them. What this machine keeps
// for them is ./recentlyDoneSessions.ts.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";
import { catalogFile } from "../../Distribution/tests/support/revision-done-catalog.mjs";
import {
  doneRecordPath,
  renderDoneRecord,
} from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { basename } from "node:path";
import {
  backlogApart,
  describedBacklog,
  describedRevision,
  publishedFile,
} from "./describedRevisions.ts";

export const repository = "terryyin/open-dough";
export const revision = "d0".repeat(20);
// Another revision, whose reads the local boundary has not yet remembered.
export const otherRevision = "d1".repeat(20);

export const queuedTitle = "Prepare stories in a clear workspace";
export const queuedIdentity = "SEED-008#planning-workspace-procedure";
// The workspace story these journeys queue, or record in Taken
// (./localTakenSessions.ts).
export const workspaceEntry = makeMe.aBacklogEntry
  .with({
    identity: queuedIdentity,
    title: queuedTitle,
    href: "seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure",
  })
  .please();
const queuedBacklog = { queued: [workspaceEntry] };

export const backlog = describedBacklog(
  makeMe.aRepository
    .withRevision("queued", { backlog: queuedBacklog })
    .please(),
);

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

// The done records `complete` published, completed `placed` before `now`.
function doneRecords(now: number) {
  return [
    makeMe.aDoneRecord
      .with({
        ...executed,
        completedAt: at(now, placed.executedDone),
        developer: "Terry Yin",
        agent: "Yui-chan",
        host: "claude",
        model: "claude-opus-5-5",
      })
      .please(),
    // A queued story removed with no execution agent profile.
    makeMe.aDoneRecord
      .with({
        ...removedQueued,
        completedAt: at(now, placed.queuedRemovedDone),
        developer: "Terry Yin",
      })
      .please(),
    makeMe.aDoneRecord
      .with({
        ...expired,
        completedAt: at(now, placed.expiredDone),
        developer: "Terry Yin",
        agent: "Akiho-chan",
        host: "codex",
      })
      .please(),
  ];
}

// The story done last week's record.
const lastWeekRecord = (now: number) =>
  makeMe.aDoneRecord
    .with({
      ...lastWeek,
      completedAt: at(now, placed.lastWeekDone),
      developer: "Terry Yin",
    })
    .please();

// Not a done record by its name, so never read.
const notARecord = { [`${doneDirectory}/README.md`]: "Not a done record.\n" };

// The published revision `revision`: the backlog queuing the workspace story,
// and the given facts beside it.
const publishedAt = (facts: RevisionFacts) =>
  describedRevision(
    makeMe.aRepository
      .withRevision("published", { backlog: queuedBacklog, ...facts })
      .please(),
    revision,
  );

// The files published at `revision`.
export const publishedFiles = (facts: RevisionFacts = {}) =>
  publishedAt(facts).files;

// The done records, beside the catalog completion rebuilds from them.
export const doneRecordFacts = (now: number): RevisionFacts => ({
  doneRecords: doneRecords(now),
  files: notARecord,
});

// The done records and their catalog alone, for a journey with its own backlog.
export const doneRecordFiles = (now: number) =>
  backlogApart(publishedAt(doneRecordFacts(now))).files;

// The done records, with the story done last week's beside them.
export const withLastWeekRecord = (now: number): RevisionFacts => ({
  doneRecords: [...doneRecords(now), lastWeekRecord(now)],
  files: notARecord,
});

// The done catalog, listed among the done records, whose read fails.
export const unanswered = catalogFile;

// Another revision, whose done records are published without a catalog, as
// a writer from before catalogs would leave them.
export const uncataloguedRevision = "d3".repeat(20);

// Another revision still, whose reads the local boundary has not remembered.
export const malformedRevision = "d2".repeat(20);

// Another revision, whose catalog was published before the story done last
// week's record was added beside it, as a merge outside the backlog's Git
// adapters would leave it.
export const staleCatalogRevision = "d5".repeat(20);
export const uncataloguedFile = basename(doneRecordPath(lastWeek.identity));

// The done records published without their catalog.
export const withoutCatalog = (now: number): RevisionFacts => ({
  ...doneRecordFacts(now),
  remove: [catalogFile],
});

// The done records with the story done last week's beside them, and the
// catalog of the others alone.
export const withUncataloguedRecord = (now: number): RevisionFacts => ({
  doneRecords: [...doneRecords(now), lastWeekRecord(now)],
  files: {
    ...notARecord,
    [catalogFile]: publishedFile(
      publishedAt(doneRecordFacts(now)),
      catalogFile,
    ),
  },
});

// Done record files the shared reader refuses, by file name: one in a later
// format, and one whose text names another identity than its file. Their
// exact bytes are what the column's problems name.
const futureFormat = "SEED-050#future-format";
const misnamed = "SEED-051#misnamed";
export const futureFormatFile = basename(doneRecordPath(futureFormat));
export const misnamedFile = basename(doneRecordPath(misnamed));

// The done records with the refused ones beside them, all catalogued.
export const withMalformedRecords = (now: number): RevisionFacts => ({
  doneRecords: doneRecords(now),
  files: {
    ...notARecord,
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
});
