// Done keeps the work a Default main session made, with Git references that
// let the typed review read it after the checkout's branches move away.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeLocalCheckout,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();
const baseHistory = () =>
  makeMe.aRepository.withRevision("base", {
    backlog: null,
    committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
  });

// These two cases exercise the persisted launch store in a private machine home.
function usePrivateLaunchStore() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-kept-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  return home;
}

test("a Default main launch's commit kept at Done remains reviewable after trunk advances and every branch leaves it", async () => {
  const now = Math.floor(Date.now() / 1000) * 1000;
  const launchedAt = minutesBefore(now, 60);
  const committedAt = minutesBefore(now, 30);
  const doneAt = minutesBefore(now, 10);
  const repository = await materializeRepository(baseHistory().please());
  onTestFinished(repository.cleanup);
  const { integration: checkout, revisions } = repository;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Fix the typo" })
    .startingInDefaultCheckout({
      workspace: checkout,
      startingRevision: revisions.base,
      repository: path.join(checkout, ".git"),
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId: "default-main-typo" })
    .launchedAt(launchedAt)
    .please();
  keepLaunchStore(usePrivateLaunchStore(), { [source]: [record] });

  const { pulled, committed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .fastForwardingToTrunkWork("pulled", {
        at: minutesBefore(now, 40),
        message: "Advance trunk",
        files: { "pulled.txt": "other developer's work\n" },
      })
      .committing("committed", {
        at: committedAt,
        message: "Add typo.txt",
        files: { "typo.txt": "session work\n" },
      })
      .pushingToTrunk("pushed", { at: minutesBefore(now, 20) })
      .please(),
  );

  await setRecordDoneAt(source, record.session, doneAt);

  const read = async () =>
    storyReview(
      makeMe.aSessionReviewRead
        .ofSession(record.session.sessionId)
        .keeping(await keptRecords(source))
        .please(),
      new AbortController().signal,
    );
  const expected = {
    kind: "session-commits",
    session: { launchedAt, doneAt },
    commitRuns: [
      {
        commits: 1,
        subject: "Add typo.txt",
        committedAt,
        baseline: pulled,
        tree: committed,
      },
    ],
    commitRun: 0,
    baseline: pulled,
    tree: committed,
    files: [expect.objectContaining({ path: "typo.txt", kind: "added" })],
  };
  // The first read uses the fixed pair while the commit is still on the branch.
  const [whileOnTrunk] = await Promise.all([
    read(),
    performCheckoutWork(
      repository,
      makeMe.aCheckoutWork
        .committing("later", {
          at: minutesBefore(now, 8),
          message: "Advance trunk again",
          files: { "later-trunk.txt": "new trunk work\n" },
        })
        .pushingToTrunk("advanced", { at: minutesBefore(now, 5) })
        .please(),
    ),
  ]);
  expect(whileOnTrunk).toEqual(expected);
  await git(checkout, "reset", "--quiet", "--hard", revisions.base);
  await git(checkout, "update-ref", "refs/remotes/origin/main", revisions.base);
  expect(
    (await git(checkout, "branch", "-a", "--contains", committed)).stdout,
  ).toBe("");
  // Expire the reflogs before pruning the checkout's loose objects.
  await git(checkout, "reflog", "expire", "--expire=now", "--all");
  await git(checkout, "prune", "--expire=now");
  const indexPath = path.join(checkout, ".git", "index");
  const index = readFileSync(indexPath);

  expect(await read()).toEqual(expected);
  expect((await git(checkout, "rev-parse", "HEAD")).stdout.trim()).toBe(
    revisions.base,
  );
  expect(readFileSync(indexPath)).toEqual(index);
});

test("Done stores and pins the commit of an established Default main session and its review answers the kept run", async () => {
  const now = Math.floor(Date.now() / 1000) * 1000;
  const launchedAt = minutesBefore(now, 60);
  const committedAt = minutesBefore(now, 30);
  const doneAt = minutesBefore(now, 10);
  const repository = await materializeLocalCheckout(
    undefined,
    baseHistory().please(),
  );
  onTestFinished(repository.cleanup);
  const {
    integration: workspace,
    revisions: { base },
  } = repository;
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Established in Default main" })
    .inDefaultCheckout({ workspace, landing: "review", revision: base })
    .inClaudeSession({ sessionId: "established-default-main" })
    .launchedAt(launchedAt)
    .please();
  keepLaunchStore(usePrivateLaunchStore(), { [source]: [record] });
  const { committed } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("committed", {
        at: committedAt,
        message: "Add typo.txt",
        files: { "typo.txt": "session work\n" },
      })
      .please(),
  );

  await setRecordDoneAt(source, record.session, doneAt);

  const records = await keptRecords(source);
  expect(records).toMatchObject([
    { doneAt, sessionCommits: { runs: [{ base, revision: committed }] } },
  ]);
  const refPrefix =
    "refs/open-dough/session-commits/claude/established-default-main/0";
  const refs = await git(
    workspace,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    refPrefix,
  );
  expect(refs.stdout.trim().split("\n")).toEqual([
    `${refPrefix}/base ${base}`,
    `${refPrefix}/revision ${committed}`,
  ]);
  const read = makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId)
    .keeping(records)
    .please();
  expect(await storyReview(read, new AbortController().signal)).toMatchObject({
    kind: "session-commits",
    session: { launchedAt, doneAt },
    commitRuns: [
      {
        commits: 1,
        subject: "Add typo.txt",
        committedAt,
        baseline: base,
        tree: committed,
      },
    ],
    commitRun: 0,
    baseline: base,
    tree: committed,
  });
});
