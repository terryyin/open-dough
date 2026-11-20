// The typed review reads Done's ordered runs around changes brought in from trunk.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { reviewedFileDiff } from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const sessionId = "established-default-main";
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

async function keepSession(launchedAt: string) {
  const repository = await materializeRepository(
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
      })
      .please(),
  );
  onTestFinished(repository.cleanup);
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Established in Default main" })
    .inDefaultCheckout({
      workspace: repository.integration,
      landing: "review",
      revision: repository.revisions.base,
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt)
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-runs-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: [record] });
  return { repository, record };
}

const numbered = (first: string, last: string) =>
  [first, "two", "three", "four", "five", "six", "seven", last, ""].join("\n");
const signal = () => new AbortController().signal;

async function readBothRuns() {
  const input = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source))
    .please();
  return Promise.all([
    storyReview(input, signal()),
    storyReview({ ...input, read: { ...input.read, run: "1" } }, signal()),
  ]);
}

test("commits either side of a pulled story landing are two runs, oldest first, each without the story's changes to a file the session also changed", async () => {
  const now = Math.floor(Date.now() / 1000) * 1000;
  const firstAt = minutesBefore(now, 45);
  const thirdAt = minutesBefore(now, 25);
  const { repository, record } = await keepSession(minutesBefore(now, 60));
  const start = repository.revisions.base;
  const { first, pulled, second } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("first", {
        at: firstAt,
        message: "Add notes.txt",
        files: { "notes.txt": numbered("one", "eight") },
      })
      .pushingToTrunk("published", { at: minutesBefore(now, 40) })
      .fastForwardingToTrunkWork("pulled", {
        at: minutesBefore(now, 35),
        message: "Add notes.txt",
        files: { "notes.txt": numbered("one", "story's eight") },
      })
      .committing("second", {
        at: thirdAt,
        message: "Add notes.txt",
        files: { "notes.txt": numbered("session's one", "story's eight") },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const review = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source));
  const input = review.please();
  const read = (baseline: string, tree: string) =>
    reviewedFileDiff(
      review.readingFile({ baseline, tree, path: "notes.txt" }).please(),
      signal(),
    );
  const [opened, next, firstDiff, secondDiff] = await Promise.all([
    storyReview(input, signal()),
    storyReview({ ...input, read: { ...input.read, run: "1" } }, signal()),
    read(start, first),
    read(pulled, second),
  ]);
  const commitRuns = [
    {
      commits: 1,
      subject: "Add notes.txt",
      committedAt: firstAt,
      baseline: start,
      tree: first,
    },
    {
      commits: 1,
      subject: "Add notes.txt",
      committedAt: thirdAt,
      baseline: pulled,
      tree: second,
    },
  ];
  expect(opened).toMatchObject({
    kind: "session-commits",
    commitRuns,
    commitRun: 0,
    baseline: start,
    tree: first,
    files: [{ path: "notes.txt", kind: "added" }],
  });
  expect(next).toMatchObject({
    kind: "session-commits",
    commitRuns,
    commitRun: 1,
    baseline: pulled,
    tree: second,
    files: [{ path: "notes.txt", kind: "modified" }],
  });
  const sessionChange: unknown = expect.stringContaining("+session's one");
  expect(secondDiff).toEqual({ kind: "diff", printed: sessionChange });
  expect(JSON.stringify(secondDiff)).not.toContain("story's eight");
  expect(JSON.stringify(firstDiff)).not.toContain("story's");
});

test("commits either side of merged trunk work are two runs without the merge or its work", async () => {
  const now = Date.now();
  const { repository, record } = await keepSession(minutesBefore(now, 60));
  const start = repository.revisions.base;
  const { first, merge, second } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("first", {
        at: minutesBefore(now, 45),
        message: "Add first.txt",
        files: { "first.txt": "session's first work\n" },
      })
      .mergingTrunkWork("merge", {
        at: minutesBefore(now, 35),
        message: "Add story.txt",
        files: { "story.txt": "trunk's work\n" },
      })
      .committing("second", {
        at: minutesBefore(now, 25),
        message: "Add second.txt",
        files: { "second.txt": "session's second work\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const [opened, next] = await readBothRuns();
  expect(opened).toMatchObject({
    kind: "session-commits",
    commitRuns: [
      { commits: 1, baseline: start, tree: first },
      { commits: 1, baseline: merge, tree: second },
    ],
    commitRun: 0,
    baseline: start,
    tree: first,
    files: [{ path: "first.txt" }],
  });
  expect(next).toMatchObject({
    commitRun: 1,
    baseline: merge,
    tree: second,
    files: [{ path: "second.txt" }],
  });
});

test("commits either side of an amended merge stay separate without the merge's files", async () => {
  const now = Date.now();
  const { repository, record } = await keepSession(minutesBefore(now, 60));
  const start = repository.revisions.base;
  const { first, amended, second } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("first", {
        at: minutesBefore(now, 45),
        message: "Add first.txt",
        files: { "first.txt": "session's first work\n" },
      })
      .mergingTrunkWork("merge", {
        at: minutesBefore(now, 40),
        message: "Add story.txt",
        files: { "story.txt": "trunk's work\n" },
      })
      .amending("amended", {
        at: minutesBefore(now, 35),
        files: { "amended.txt": "added to the merge\n" },
      })
      .committing("second", {
        at: minutesBefore(now, 25),
        message: "Add second.txt",
        files: { "second.txt": "session's second work\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const [opened, next] = await readBothRuns();
  expect(opened).toMatchObject({
    kind: "session-commits",
    commitRuns: [
      { commits: 1, baseline: start, tree: first },
      { commits: 1, baseline: amended, tree: second },
    ],
    baseline: start,
    tree: first,
    files: [{ path: "first.txt" }],
  });
  expect(next).toMatchObject({
    baseline: amended,
    tree: second,
    files: [{ path: "second.txt" }],
  });
});
