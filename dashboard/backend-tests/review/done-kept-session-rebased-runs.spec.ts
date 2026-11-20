// Done keeps a session's rebased commits as they ended. A replayed commit
// authored before the launch remains outside the session.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
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
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const sessionId = "established-default-main";
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

async function repositoryAtBase() {
  const repository = await materializeRepository(
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

function keepEstablishedSession(
  workspace: string,
  revision: string,
  launchedAt: string,
) {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Established in Default main" })
    .inDefaultCheckout({ workspace, landing: "review", revision })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt)
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-rebased-runs-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: [record] });
  return record;
}

test("two commits, the second amended, rebased onto pulled trunk and pushed are one run of the two as pushed", async () => {
  const now = Date.now();
  const repository = await repositoryAtBase();
  const record = keepEstablishedSession(
    repository.integration,
    repository.revisions.base,
    minutesBefore(now, 60),
  );
  const { pulled, pushed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("first", {
        at: minutesBefore(now, 45),
        message: "Add first.txt",
        files: { "first.txt": "session's first work\n" },
      })
      .committing("second", {
        at: minutesBefore(now, 40),
        message: "Add second.txt",
        files: { "second.txt": "session's second work\n" },
      })
      .amending("amended", {
        at: minutesBefore(now, 35),
        files: { "amended.txt": "added to second commit\n" },
      })
      .rebasingOntoTrunkWork("pulled", {
        at: minutesBefore(now, 25),
        message: "Add story.txt",
        files: { "story.txt": "trunk's work\n" },
      })
      .pushingToTrunk("pushed", { at: minutesBefore(now, 20) })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const input = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source))
    .please();
  const [answer, published] = await Promise.all([
    storyReview(input, new AbortController().signal),
    git(repository.origin, "rev-parse", "main"),
  ]);
  expect(published.stdout.trim()).toBe(pushed);
  expect(answer).toMatchObject({
    kind: "session-commits",
    commitRuns: [
      { commits: 2, subject: "Add second.txt", baseline: pulled, tree: pushed },
    ],
    commitRun: 0,
    baseline: pulled,
    tree: pushed,
  });
  expect("files" in answer && answer.files.map(({ path }) => path)).toEqual([
    "amended.txt",
    "first.txt",
    "second.txt",
  ]);
});

test("a commit rebased onto fetched trunk and pushed, as a publication from the checkout does, is kept as its rebased commit", async () => {
  const now = Date.now();
  const repository = await repositoryAtBase();
  const record = keepEstablishedSession(
    repository.integration,
    repository.revisions.base,
    minutesBefore(now, 60),
  );
  const { made, fetched, pushed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("made", {
        at: minutesBefore(now, 45),
        message: "Add landed.txt",
        files: { "landed.txt": "session's work\n" },
      })
      .rebasingTipOntoFetchedTrunkWork("fetched", {
        at: minutesBefore(now, 25),
        message: "Add story.txt",
        files: { "story.txt": "trunk's work\n" },
      })
      .pushingToTrunk("pushed", { at: minutesBefore(now, 20) })
      .please(),
  );
  expect(pushed).not.toBe(made);

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const input = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source))
    .please();
  const [answer, published] = await Promise.all([
    storyReview(input, new AbortController().signal),
    git(repository.origin, "rev-parse", "main"),
  ]);
  expect(published.stdout.trim()).toBe(pushed);
  expect(answer).toMatchObject({
    kind: "session-commits",
    commitRuns: [{ commits: 1, subject: "Add landed.txt" }],
    baseline: fetched,
    tree: pushed,
  });
  expect("files" in answer && answer.files.map(({ path }) => path)).toEqual([
    "landed.txt",
  ]);
});

test("a commit made before the session and rebased during it is not kept", async () => {
  const now = Date.now();
  const repository = await repositoryAtBase();
  const { earlier } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("earlier", {
        at: minutesBefore(now, 75),
        message: "Add earlier.txt",
        files: { "earlier.txt": "work before the session\n" },
      })
      .please(),
  );
  const record = keepEstablishedSession(
    repository.integration,
    earlier,
    minutesBefore(now, 60),
  );
  await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .rebasingOntoTrunkWork("pulled", {
        at: minutesBefore(now, 25),
        message: "Add story.txt",
        files: { "story.txt": "trunk's work\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const input = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source))
    .please();
  expect(await storyReview(input, new AbortController().signal)).toMatchObject({
    kind: "landing-unavailable",
    explanation: "This session made no commits in the Default main checkout.",
  });
});
