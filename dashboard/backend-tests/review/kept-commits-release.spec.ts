// What a launch record keeps in its saved repository is released with the
// record: the references holding its session's kept commit runs and its
// landing's comparison exist while the record is kept, and leave when the
// record is deleted or expires after retention, while another kept record's
// references in the same repository stay. Over raw HTTP at the boundary
// server, on a real project checkout (../../tests/support/startOrigin.ts);
// the write that drops an expired record is an ordinary launch, as
// ../sessions/agent-launch-retention-scope.spec.ts drops one. Pin cleanup
// that fails and retries is ./one-shot-landing-recovery-deletion.spec.ts.

import { randomUUID } from "node:crypto";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deleteRecord } from "../../tests/agentLaunchBoundary.ts";
import { daysAgo, retainedDoneAt } from "../../tests/machineLaunchRecords.ts";
import { launchDefaultMainSession } from "../../tests/support/adHocReview.ts";
import {
  keepLaunchRecords,
  keptLaunchRecords,
} from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { commitInCheckout } from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const committedAt = "2099-01-02T12:05:00Z";

// A Done session of the Default main checkout whose record keeps one run of
// session commits in `repository`.
interface KeptIn {
  workspace: string;
  repository: string;
}
interface Pair {
  base: string;
  revision: string;
}

const aRecordKeepingRun = (
  sessionId: string,
  doneAt: string,
  kept: KeptIn,
  pair: Pair,
) =>
  makeMe.aLaunchRecord
    .adHoc({ title: `Session ${sessionId}` })
    .inDefaultCheckout({
      workspace: kept.workspace,
      landing: "review",
      revision: pair.base,
    })
    .inClaudeSession({ sessionId })
    .keptSessionCommits({ repository: kept.repository, runs: [pair] })
    .markedDoneAt(doneAt);

// That record also keeping a landing of the same comparison there.
const recordKeeping = (
  sessionId: string,
  doneAt: string,
  kept: KeptIn,
  pair: Pair,
) =>
  aRecordKeepingRun(sessionId, doneAt, kept, pair)
    .withCapturedLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: kept.repository })
        .forLaunch(randomUUID())
        .comparing(pair)
        .please(),
    )
    .please();

type KeepingRecord = ReturnType<typeof recordKeeping>;

const sessionRunRefs = (record: KeepingRecord) =>
  `refs/open-dough/session-commits/claude/${record.session.sessionId}/`;
const landingRefs = (record: KeepingRecord) =>
  `refs/open-dough/one-shot/${String(record.landing?.reference)}/`;

// Holds the record's run and landing in its saved repository, as their
// captures leave them.
function holdKeptCommits(record: KeepingRecord): void {
  const landing = record.landing;
  const run = record.sessionCommits?.runs[0];
  if (landing === undefined || run === undefined)
    throw new Error("The record keeps no run or landing.");
  const hold = (prefix: string, pair: Pair) => {
    git(landing.repository, "update-ref", `${prefix}base`, pair.base);
    git(landing.repository, "update-ref", `${prefix}revision`, pair.revision);
  };
  hold(`${sessionRunRefs(record)}0/`, run);
  hold(`${landingRefs(record)}${landing.delivery}/`, landing);
}

const refsUnder = (repository: string, prefix: string) =>
  git(repository, "for-each-ref", "--format=%(refname)", prefix)
    .split("\n")
    .filter(Boolean);

const keptSessionIds = (home: Parameters<typeof keptLaunchRecords>[0]) =>
  keptLaunchRecords(home).flatMap((record) =>
    "session" in record ? [record.session.sessionId] : [],
  );

// Two records keeping commits in the project's repository: one leaving, Done
// at `leavingDoneAt`, and another freshly Done.
async function twoRecordsKeepingCommits(
  origin: { project: string },
  leavingDoneAt: string,
) {
  const base = git(origin.project, "rev-parse", "HEAD");
  const revision = await commitInCheckout(
    origin.project,
    committedAt,
    "kept.txt",
  );
  const repository = git(
    origin.project,
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  );
  const kept = { workspace: origin.project, repository };
  const pair = { base, revision };
  const leaving = recordKeeping("leaving", leavingDoneAt, kept, pair);
  const other = recordKeeping("other-kept", retainedDoneAt(), kept, pair);
  holdKeptCommits(leaving);
  holdKeptCommits(other);
  return { repository, leaving, other };
}

const runRefs = (record: KeepingRecord) => [
  `${sessionRunRefs(record)}0/base`,
  `${sessionRunRefs(record)}0/revision`,
];

test("deleting a record removes its session-run and landing references and leaves another kept record's", async ({
  dashboard,
  origin,
}) => {
  const { repository, leaving, other } = await twoRecordsKeepingCommits(
    origin,
    retainedDoneAt(),
  );
  keepLaunchRecords(dashboard, [leaving, other]);
  const otherLanding = refsUnder(repository, landingRefs(other));
  expect(refsUnder(repository, sessionRunRefs(leaving))).toEqual(
    runRefs(leaving),
  );
  expect(refsUnder(repository, landingRefs(leaving))).toHaveLength(2);
  expect(otherLanding).toHaveLength(2);
  // A Done session's record is deletable while its session cannot be observed.
  dashboard.claudeListingFails(true);

  const response = await deleteRecord(dashboard, {
    source: "open-dough",
    session: leaving.session.sessionId,
  });

  expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
  expect(keptSessionIds(dashboard)).toEqual(["other-kept"]);
  expect(refsUnder(repository, sessionRunRefs(leaving))).toEqual([]);
  expect(refsUnder(repository, landingRefs(leaving))).toEqual([]);
  expect(refsUnder(repository, sessionRunRefs(other))).toEqual(runRefs(other));
  expect(refsUnder(repository, landingRefs(other))).toEqual(otherLanding);
});

test("a record expiring after retention removes its session-run and landing references and leaves another kept record's", async ({
  dashboard,
  origin,
}) => {
  const { repository, leaving, other } = await twoRecordsKeepingCommits(
    origin,
    daysAgo(31),
  );
  keepLaunchRecords(dashboard, [leaving, other]);
  const otherLanding = refsUnder(repository, landingRefs(other));
  expect(refsUnder(repository, sessionRunRefs(leaving))).toEqual(
    runRefs(leaving),
  );
  expect(refsUnder(repository, landingRefs(leaving))).toHaveLength(2);
  const headsBefore = refsUnder(repository, "refs/heads/");

  const launched = await launchDefaultMainSession(dashboard);

  expect(keptSessionIds(dashboard)).toEqual([
    "other-kept",
    launched.session.sessionId,
  ]);
  expect(refsUnder(repository, sessionRunRefs(leaving))).toEqual([]);
  expect(refsUnder(repository, landingRefs(leaving))).toEqual([]);
  expect(refsUnder(repository, sessionRunRefs(other))).toEqual(runRefs(other));
  expect(refsUnder(repository, landingRefs(other))).toEqual(otherLanding);
  expect(refsUnder(repository, "refs/heads/")).toEqual(headsBefore);
});

// A record keeping a run in a saved repository that is no longer there.
function recordWhoseRepositoryIsGone(
  origin: { machine: string },
  sessionId: string,
  doneAt: string,
) {
  const gone = path.join(origin.machine, "repository-that-is-gone");
  return aRecordKeepingRun(
    sessionId,
    doneAt,
    { workspace: gone, repository: gone },
    { base: "a1".repeat(20), revision: "b2".repeat(20) },
  ).please();
}

test("a record whose saved repository is gone still expires", async ({
  dashboard,
  origin,
}) => {
  keepLaunchRecords(dashboard, [
    recordWhoseRepositoryIsGone(origin, "expired", daysAgo(31)),
  ]);

  const launched = await launchDefaultMainSession(dashboard);

  expect(keptSessionIds(dashboard)).toEqual([launched.session.sessionId]);
});

test("a record whose saved repository is gone still deletes", async ({
  dashboard,
  origin,
}) => {
  keepLaunchRecords(dashboard, [
    recordWhoseRepositoryIsGone(origin, "deleted", retainedDoneAt()),
  ]);
  dashboard.claudeListingFails(true);

  const response = await deleteRecord(dashboard, {
    source: "open-dough",
    session: "deleted",
  });

  expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
  expect(keptSessionIds(dashboard)).toEqual([]);
});
