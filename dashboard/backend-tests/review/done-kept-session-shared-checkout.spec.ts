// Done identifies other kept sessions that overlapped in the same checkout.
import { mkdtempSync, rmSync } from "node:fs";
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
const baseHistory = () =>
  makeMe.aRepository.withRevision("base", {
    backlog: null,
    committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
  });

async function checkoutAtBase(history = baseHistory()) {
  const repository = await materializeLocalCheckout(
    undefined,
    history.please(),
  );
  onTestFinished(repository.cleanup);
  return repository;
}

function keep(...records: LaunchRecord[]) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-shared-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: records });
}

function defaultLaunch(
  repository: Awaited<ReturnType<typeof checkoutAtBase>>,
  sessionId: string,
  title: string,
  launchedAt: string,
) {
  return makeMe.aLaunchRecord
    .adHoc({ title })
    .startingInDefaultCheckout({
      workspace: repository.integration,
      startingRevision: repository.revisions.base,
      repository: path.join(repository.integration, ".git"),
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt)
    .please();
}

async function review(sessionId: string) {
  return storyReview(
    makeMe.aSessionReviewRead
      .ofSession(sessionId)
      .keeping(await keptRecords(source))
      .please(),
    new AbortController().signal,
  );
}

test("two default launches open in one checkout both commit: either one's review holds the commits made while it was open and says the checkout was shared", async () => {
  const now = Date.now();
  const repository = await checkoutAtBase();
  const first = defaultLaunch(
    repository,
    "fix-typo",
    "Fix the typo",
    minutesBefore(now, 70),
  );
  const second = defaultLaunch(
    repository,
    "fix-link",
    "Fix the link",
    minutesBefore(now, 60),
  );
  keep(first, second);
  const { last } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("typo", {
        at: minutesBefore(now, 40),
        message: "Fix the typo",
        files: { "typo.txt": "typo corrected\n" },
      })
      .committing("last", {
        at: minutesBefore(now, 30),
        message: "Fix the link",
        files: { "link.txt": "link corrected\n" },
      })
      .please(),
  );
  const sharedReview = {
    kind: "session-commits",
    commitRuns: [{ commits: 2 }],
    baseline: repository.revisions.base,
    tree: last,
    session: { shared: true },
  };

  await setRecordDoneAt(source, first.session, minutesBefore(now, 15));

  expect(await review(first.session.sessionId)).toMatchObject(sharedReview);

  await setRecordDoneAt(source, second.session, minutesBefore(now, 10));

  expect(await review(second.session.sessionId)).toMatchObject(sharedReview);
});

test("a session open meanwhile in an isolated workspace of the project does not share the Default main checkout", async () => {
  const now = Date.now();
  const repository = await checkoutAtBase(
    baseHistory().withWorkspace("isolated", { from: "base" }),
  );
  const workspace = repository.execution;
  if (workspace === undefined) throw new Error("Missing isolated worktree");
  const isolated = makeMe.aLaunchRecord
    .adHoc({ title: "Isolated meanwhile" })
    .inIsolatedWorkspace({ workspace, branch: "isolated" })
    .inClaudeSession({ sessionId: "isolated-meanwhile" })
    .launchedAt(minutesBefore(now, 70))
    .please();
  const record = defaultLaunch(
    repository,
    "fix-typo",
    "Fix the typo",
    minutesBefore(now, 60),
  );
  keep(isolated, record);
  const { committed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("committed", {
        at: minutesBefore(now, 30),
        message: "Fix the typo",
        files: { "typo.txt": "typo corrected\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const answer = await review(record.session.sessionId);
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});

test("a session done in the Default main checkout before this one launched does not share it", async () => {
  const now = Date.now();
  const repository = await checkoutAtBase();
  const earlier = makeMe.aLaunchRecord
    .adHoc({ title: "Done before" })
    .inDefaultCheckout({
      workspace: repository.integration,
      landing: "review",
      revision: repository.revisions.base,
    })
    .inClaudeSession({ sessionId: "done-before" })
    .launchedAt(minutesBefore(now, 90))
    .markedDoneAt(minutesBefore(now, 70))
    .please();
  const record = defaultLaunch(
    repository,
    "fix-typo",
    "Fix the typo",
    minutesBefore(now, 60),
  );
  keep(earlier, record);
  const { committed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("committed", {
        at: minutesBefore(now, 30),
        message: "Fix the typo",
        files: { "typo.txt": "typo corrected\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, minutesBefore(now, 10));

  const answer = await review(record.session.sessionId);
  expect(answer).toMatchObject({ kind: "session-commits", tree: committed });
  expect(answer).not.toHaveProperty("session.shared");
});
