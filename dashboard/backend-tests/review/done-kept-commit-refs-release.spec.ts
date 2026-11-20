// A Default main session's Done keeps only its comparison pair in Git.
// Replacing the capture or deleting the kept record releases its refs.
import {
  mkdtempSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeLocalCheckout,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import {
  deleteRecord,
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

const source = "open-dough";
const sessionId = "default-main-notes";
const prefix = `refs/open-dough/session-commits/claude/${sessionId}/`;
const minutesBefore = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

async function checkout() {
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

async function keepSessionWithCommit(
  repository: Awaited<ReturnType<typeof checkout>>,
  now: number,
  gitDirectory = path.join(repository.integration, ".git"),
) {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Edit session notes" })
    .startingInDefaultCheckout({
      workspace: repository.integration,
      startingRevision: repository.revisions.base,
      repository: gitDirectory,
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(minutesBefore(now, 60))
    .please();
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-refs-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: [record] });
  const { revision } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("revision", {
        at: minutesBefore(now, 40),
        message: "Add notes.txt",
        files: { "notes.txt": "Session notes\n" },
      })
      .please(),
  );
  return { home, record, revision };
}

const pairRefs = (base: string, revision: string) => [
  `${prefix}0/base ${base}`,
  `${prefix}0/revision ${revision}`,
];

async function refs(repository: string, under = "refs/") {
  const { stdout } = await git(
    repository,
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    under,
  );
  return stdout.split("\n").filter(Boolean);
}

async function review() {
  const input = makeMe.aSessionReviewRead
    .ofSession(sessionId)
    .keeping(await keptRecords(source))
    .please();
  return storyReview(input, new AbortController().signal);
}

const unavailable = {
  kind: "landing-unavailable",
  explanation: "This session's changes were not captured.",
};

test("Done pins only the comparison pair and deleting the record releases it", async () => {
  const now = Date.now();
  const repository = await checkout();
  const {
    integration,
    revisions: { base },
  } = repository;
  const { record, revision } = await keepSessionWithCommit(repository, now);
  const beforeDone = await refs(integration);
  const doneAt = minutesBefore(now, 30);

  expect((await setRecordDoneAt(source, record.session, doneAt))?.doneAt).toBe(
    doneAt,
  );
  expect(await refs(integration)).toEqual(
    [...beforeDone, ...pairRefs(base, revision)].sort(),
  );

  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(await keptRecords(source)).toEqual([]);
  expect(await refs(integration)).toEqual(beforeDone);
});

test("a later Done with an unreadable log releases the earlier capture", async () => {
  const now = Date.now();
  const repository = await checkout();
  const {
    integration,
    revisions: { base },
  } = repository;
  const { record, revision } = await keepSessionWithCommit(repository, now);
  const firstDoneAt = minutesBefore(now, 30);
  // The first capture's read time must precede the later Done.
  vi.setSystemTime(firstDoneAt);
  expect(
    await setRecordDoneAt(source, record.session, firstDoneAt),
  ).toMatchObject({
    doneAt: firstDoneAt,
    sessionCommits: { readAt: firstDoneAt },
  });
  vi.useRealTimers();
  expect(await refs(integration, prefix)).toEqual(pairRefs(base, revision));
  expect(
    (await setRecordDoneAt(source, record.session, undefined))?.doneAt,
  ).toBeUndefined();
  // Git still reads and mutates the refs even though its logs are gone.
  rmSync(path.join(integration, ".git", "logs"), { recursive: true });

  const laterDoneAt = minutesBefore(now, 10);
  expect(
    (await setRecordDoneAt(source, record.session, laterDoneAt))?.doneAt,
  ).toBe(laterDoneAt);

  expect(await review()).toMatchObject(unavailable);
  expect(await refs(integration, prefix)).toEqual([]);
  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(await refs(integration, prefix)).toEqual([]);
});

test("a later Done keeps its pair when the repository is also reachable through the old path", async () => {
  const now = Date.now();
  const repository = await checkout();
  const {
    integration,
    fixture,
    revisions: { base },
  } = repository;
  const previous = path.join(fixture, "original-git-directory");
  const moved = path.join(fixture, "moved-git-directory");
  await git(integration, "init", "--separate-git-dir", previous);
  const { record, revision } = await keepSessionWithCommit(
    repository,
    now,
    previous,
  );
  const firstDoneAt = minutesBefore(now, 30);
  vi.setSystemTime(firstDoneAt);
  expect(
    await setRecordDoneAt(source, record.session, firstDoneAt),
  ).toMatchObject({
    doneAt: firstDoneAt,
    sessionCommits: { readAt: firstDoneAt, repository: previous },
  });
  vi.useRealTimers();
  expect(await refs(previous, prefix)).toEqual(pairRefs(base, revision));
  expect(
    (await setRecordDoneAt(source, record.session, undefined))?.doneAt,
  ).toBeUndefined();

  renameSync(previous, moved);
  symlinkSync(moved, previous);
  writeFileSync(path.join(integration, ".git"), `gitdir: ${moved}\n`);
  const { later } = await performCheckoutWork(
    repository,
    makeMe.aCheckoutWork
      .committing("later", {
        at: minutesBefore(now, 20),
        message: "Add more-notes.txt",
        files: { "more-notes.txt": "More notes\n" },
      })
      .please(),
  );
  const laterDoneAt = minutesBefore(now, 10);
  expect(
    (await setRecordDoneAt(source, record.session, laterDoneAt))?.doneAt,
  ).toBe(laterDoneAt);

  expect(await refs(moved, prefix)).toEqual(pairRefs(base, later));
  expect(await refs(previous, prefix)).toEqual(pairRefs(base, later));
});

test("deleting a record from an older failed capture releases refs its earlier Done created", async () => {
  const now = Date.now();
  const repository = await checkout();
  const {
    integration,
    revisions: { base },
  } = repository;
  const { home, record, revision } = await keepSessionWithCommit(
    repository,
    now,
  );
  const doneAt = minutesBefore(now, 30);
  expect((await setRecordDoneAt(source, record.session, doneAt))?.doneAt).toBe(
    doneAt,
  );
  // An older reader left Done without a comparison and kept its Git refs.
  keepLaunchStore(home, { [source]: [{ ...record, doneAt }] });
  expect(await review()).toMatchObject(unavailable);
  expect(await refs(integration, prefix)).toEqual(pairRefs(base, revision));

  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(await refs(integration, prefix)).toEqual([]);
});
