// Done keeps its timestamp even when a Default main session has no readable run.
import { mkdtempSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeLocalCheckout,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();
const notCaptured = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session's changes were not captured.",
};

async function checkoutAtBase() {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
      })
      .please(),
  );
  onTestFinished(repository.cleanup);
  return repository;
}

function keep(record: LaunchRecord) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-unavailable-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: [record] });
}

async function keepEstablished(sessionId: string, launchedAt: string) {
  const repository = await checkoutAtBase();
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
  keep(record);
  return { repository, record };
}

const review = (sessionId: string, records: readonly LaunchRecord[]) =>
  storyReview(
    makeMe.aSessionReviewRead.ofSession(sessionId).keeping(records).please(),
    new AbortController().signal,
  );

test("a blank default launch that edited files and committed nothing says it made no commits in the Default main checkout", async () => {
  const now = Date.now();
  const repository = await checkoutAtBase();
  const sessionId = "blank-default-launch";
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Blank launch" })
    .startingInDefaultCheckout({
      workspace: repository.integration,
      startingRevision: repository.revisions.base,
      repository: path.join(repository.integration, ".git"),
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(minutesBefore(now, 60))
    .please();
  keep(record);
  await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .editing("edit", {
        at: minutesBefore(now, 30),
        files: { "edited.txt": "uncommitted\n" },
      })
      .please(),
  );

  const doneAt = minutesBefore(now, 10);
  await setRecordDoneAt(source, record.session, doneAt);

  const records = await keptRecords(source);
  expect(records).toMatchObject([{ doneAt }]);
  expect(await review(sessionId, records)).toEqual({
    kind: "landing-unavailable",
    comparison: "session-commits",
    explanation: "This session made no commits in the Default main checkout.",
  });
});

test("a session whose only commit stays on another branch says its changes were not captured", async () => {
  const now = Date.now();
  const sessionId = "side-branch";
  const { repository, record } = await keepEstablished(
    sessionId,
    minutesBefore(now, 60),
  );
  await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committingOnBranch("side", {
        at: minutesBefore(now, 30),
        branch: "side",
        message: "Add side.txt",
        files: { "side.txt": "work on the side\n" },
      })
      .please(),
  );

  const doneAt = minutesBefore(now, 10);
  await setRecordDoneAt(source, record.session, doneAt);

  const records = await keptRecords(source);
  expect(records).toMatchObject([{ doneAt }]);
  expect(await review(sessionId, records)).toEqual(notCaptured);
});

for (const { when, earlierFiles } of [
  { when: "on its own", earlierFiles: [] },
  { when: "after a retained commit", earlierFiles: ["first.txt"] },
]) {
  test(`a session commit reworded ${when} leaves changes not captured`, async () => {
    const now = Date.now();
    const sessionId = "reworded";
    const { repository, record } = await keepEstablished(
      sessionId,
      minutesBefore(now, 60),
    );
    for (const file of earlierFiles) {
      await performCheckoutWork(
        repository,
        makeMe.aCheckoutWork
          .committing("earlier", {
            at: minutesBefore(now, 40),
            message: `Add ${file}`,
            files: { [file]: "earlier work\n" },
          })
          .please(),
      );
    }
    await performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .committing("notes", {
          at: minutesBefore(now, 35),
          message: "Add notes.txt",
          files: { "notes.txt": "session notes\n" },
        })
        .rewordingTip("reworded", {
          at: minutesBefore(now, 30),
          message: "Clarify session notes",
        })
        .please(),
    );

    const doneAt = minutesBefore(now, 10);
    await setRecordDoneAt(source, record.session, doneAt);

    const records = await keptRecords(source);
    expect(records).toMatchObject([{ doneAt }]);
    expect(await review(sessionId, records)).toEqual(notCaptured);
  });
}

test("a session whose checkout log cannot be read at Done is done and says its changes were not captured", async () => {
  const now = Date.now();
  const sessionId = "unreadable-at-done";
  const { repository, record } = await keepEstablished(
    sessionId,
    minutesBefore(now, 60),
  );
  await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("typo", {
        at: minutesBefore(now, 30),
        message: "Add typo.txt",
        files: { "typo.txt": "session work\n" },
      })
      .please(),
  );
  renameSync(
    path.join(repository.integration, ".git"),
    path.join(repository.integration, ".git-away"),
  );

  const doneAt = minutesBefore(now, 10);
  expect((await setRecordDoneAt(source, record.session, doneAt))?.doneAt).toBe(
    doneAt,
  );

  const records = await keptRecords(source);
  expect(records).toMatchObject([{ doneAt }]);
  expect(records[0]?.sessionCommits).toBeUndefined();
  expect(await review(sessionId, records)).toEqual(notCaptured);
});

test("a session whose checkout log holds no entry at Done is done and says its changes were not captured", async () => {
  const now = Date.now();
  const sessionId = "log-removed-at-done";
  const { repository, record } = await keepEstablished(
    sessionId,
    minutesBefore(now, 60),
  );
  // Git still reads the checkout. Remove all logs so it cannot fall back to the branch log.
  rmSync(path.join(repository.integration, ".git", "logs"), {
    recursive: true,
  });

  const doneAt = minutesBefore(now, 10);
  expect((await setRecordDoneAt(source, record.session, doneAt))?.doneAt).toBe(
    doneAt,
  );

  const records = await keptRecords(source);
  expect(records).toMatchObject([{ doneAt }]);
  expect(records[0]?.sessionCommits).toBeUndefined();
  expect(await review(sessionId, records)).toEqual(notCaptured);
});
