// What the Recently done journeys (e2e/stories/recently-done-stories.spec.ts,
// frontend-tests/sessions/recently-done-story-sessions.spec.ts, and
// e2e/sessions/recently-done-story-sessions-expired.spec.ts) publish: a backlog
// with one queued story, and done records beside it at times before the journey
// starts, with the done catalog completion publishes beside them. `doneStories`
// names each story and publishes that scenario. Catalog and malformed
// publications of the same records are ./recentlyDoneReadFailures.ts.
// What this machine keeps for the journeys is ./recentlyDoneSessions.ts.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { RevisionFacts } from "../../Distribution/tests/support/repositoryTestData.mjs";
import { catalogFile } from "../../Distribution/tests/support/revision-done-catalog.mjs";
import { doneRecordPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { basename } from "node:path";
import {
  backlogApart,
  describedBacklog,
  describedRevision,
} from "./describedRevisions.ts";

export const repository = "terryyin/open-dough";
export const revision = "d0".repeat(20);

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
const developer = "Terry Yin";

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

// Who completed each story, and the title and identity the cards name.
const cardShowsAvatar = {
  identity: "SEED-038#card-shows-avatar",
  title: "Card shows avatar",
  developer,
  agent: "Yui-chan",
  host: "claude" as const,
  model: "claude-opus-5-5",
};
const queuedThenRemoved = {
  identity: "SEED-042#queued-and-removed",
  title: "Remove a story nobody executed",
  developer,
};
const finishedLastWeek = {
  identity: "SEED-039#done-last-week",
  title: "Finish something last week",
  developer,
};
const finishedLongAgo = {
  identity: "SEED-011#done-long-ago",
  title: "Finish something a month ago",
  developer,
  agent: "Akiho-chan",
  host: "codex" as const,
};

export const executed = {
  identity: cardShowsAvatar.identity,
  title: cardShowsAvatar.title,
};
export const removedQueued = {
  identity: queuedThenRemoved.identity,
  title: queuedThenRemoved.title,
};
export const lastWeek = {
  identity: finishedLastWeek.identity,
  title: finishedLastWeek.title,
};
export const expired = {
  identity: finishedLongAgo.identity,
  title: finishedLongAgo.title,
};

// The time `before` `now`.
export const at = (now: number, before: number) =>
  new Date(now - before).toISOString();

// Where `complete` publishes a story's done record.
export const doneRecordAt = (identity: string) =>
  `.planning/${doneRecordPath(identity)}`;

// Where `complete` publishes done records and their catalog.
export const doneDirectory = ".planning/done";

const recordFile = (identity: string) => basename(doneRecordPath(identity));

type RecordedStory = {
  readonly identity: string;
  readonly title: string;
  readonly developer: string;
  readonly agent?: string;
  readonly host?: "claude" | "codex";
  readonly model?: string;
};

// One done record of `story`, completed `before` `now`.
function doneRecord(now: number, story: RecordedStory, before: number) {
  return makeMe.aDoneRecord
    .with({
      identity: story.identity,
      title: story.title,
      completedAt: at(now, before),
      developer: story.developer,
      ...(story.agent === undefined
        ? {}
        : {
            agent: story.agent,
            ...(story.host === undefined ? {} : { host: story.host }),
            ...(story.model === undefined ? {} : { model: story.model }),
          }),
    })
    .please();
}

// The done records `complete` published, completed `placed` before `now`.
function doneRecords(now: number) {
  return [
    doneRecord(now, cardShowsAvatar, placed.executedDone),
    // A queued story removed with no execution agent profile.
    doneRecord(now, queuedThenRemoved, placed.queuedRemovedDone),
    doneRecord(now, finishedLongAgo, placed.expiredDone),
  ];
}

// The story done last week's record.
const lastWeekRecord = (now: number) =>
  doneRecord(now, finishedLastWeek, placed.lastWeekDone);

// Done records for story-card nesting journeys: today's cards plus last week's.
export const recentlyDoneNestingRecords = (now: number) => [
  ...doneRecords(now),
  lastWeekRecord(now),
];

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
function doneRecordFacts(now: number): RevisionFacts {
  return {
    doneRecords: doneRecords(now),
    files: notARecord,
  };
}

// The done records and their catalog alone, for a journey with its own backlog.
export const doneRecordFiles = (now: number) =>
  backlogApart(publishedAt(doneRecordFacts(now))).files;

// The done records, with the story done last week's beside them.
function withLastWeekRecord(now: number): RevisionFacts {
  return {
    doneRecords: recentlyDoneNestingRecords(now),
    files: notARecord,
  };
}

export const doneStoryPublication = (
  revisionId: string,
  facts?: RevisionFacts,
  unanswered?: readonly string[],
) => ({
  repository,
  revision: revisionId,
  files: publishedFiles(facts),
  ...(unanswered === undefined ? {} : { unanswered }),
});

export const doneStoryRevisionFacts = (now: number) => doneRecordFacts(now);

export const doneStories = {
  queued: { identity: queuedIdentity, title: queuedTitle },
  executed: {
    ...cardShowsAvatar,
    completedBefore: placed.executedDone,
    recordPath: doneRecordAt(cardShowsAvatar.identity),
    openSessionBefore: placed.executedOpenSessionLaunched,
  },
  removed: {
    ...queuedThenRemoved,
    recordPath: doneRecordAt(queuedThenRemoved.identity),
  },
  lastWeek: {
    ...finishedLastWeek,
    file: recordFile(finishedLastWeek.identity),
    sessionBefore: placed.lastWeekSessionLaunched,
  },
  expired: {
    ...finishedLongAgo,
    sessionBefore: placed.expiredSessionLaunched,
  },
  doneDirectory,
  catalogPath: catalogFile,
  published: (now: number) =>
    doneStoryPublication(revision, doneRecordFacts(now)),
  publishedWithLastWeek: (now: number) =>
    doneStoryPublication(revision, withLastWeekRecord(now)),
  publishedWithoutRecords: () => doneStoryPublication(revision),
};
