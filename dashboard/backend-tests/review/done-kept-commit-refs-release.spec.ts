// A Default main session's Done keeps only its comparison pair in Git.
// Replacing the capture or deleting the kept record releases its refs.
import { renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deleteRecord, keptSession } from "../../server/launchRecordStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  keep,
  markDone,
  minutesAgo,
  source,
  undoDone,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

const prefix = "refs/open-dough/session-commits/claude/default-launch/";
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

// A default launch kept with one commit at 40 minutes ago.
async function keptWithCommit() {
  const {
    checkout,
    work: { notes },
    records: { "default-launch": record },
  } = await aDoneCaptureCase()
    .withWork((at) => makeMe.aCheckoutWork.committing("notes", { at: at(40) }))
    .withDefaultMainLaunch("default-launch", { launched: 60 })
    .please();
  return { checkout, home: keep(record), record, notes };
}

// Done at 30 minutes ago, read then, and later undone.
async function doneAndUndone(record: LaunchRecord) {
  vi.setSystemTime(minutesAgo(30));
  expect(await markDone(record, minutesAgo(30))).toMatchObject({
    sessionCommits: { readAt: minutesAgo(30) },
  });
  vi.useRealTimers();
  expect((await undoDone(record))?.doneAt).toBeUndefined();
}

test("Done pins only the comparison pair and deleting the record releases it", async () => {
  const { checkout, record, notes } = await keptWithCommit();
  const beforeDone = await refs(checkout.integration);

  await markDone(record);

  expect(await refs(checkout.integration)).toEqual(
    [...beforeDone, ...pairRefs(checkout.base, notes)].sort(),
  );
  expect(await deleteRecord(source, record.session)).toBe(true);
  expect(await refs(checkout.integration)).toEqual(beforeDone);
});

test("a later Done with an unreadable log releases the earlier capture", async () => {
  const { checkout, record } = await keptWithCommit();
  await doneAndUndone(record);
  // Git still reads and mutates the refs even though its logs are gone.
  rmSync(path.join(checkout.integration, ".git", "logs"), { recursive: true });

  await markDone(record);

  const saved = await keptSession(source, record.session);
  expect(saved).toMatchObject({ sessionCommitsFailedAt: minutesAgo(10) });
  expect(saved?.sessionCommits).toBeUndefined();
  expect(await refs(checkout.integration, prefix)).toEqual([]);
});

test("a later Done keeps its pair when the repository is also reachable through the old path", async () => {
  const { checkout, performWork, at } = await aDoneCaptureCase().please();
  const previous = path.join(checkout.fixture, "original-git-directory");
  const moved = path.join(checkout.fixture, "moved-git-directory");
  await git(checkout.integration, "init", "--separate-git-dir", previous);
  // The separate Git directory is no repository-builder fact, so this case
  // keeps its launch by hand.
  const record = makeMe.aLaunchRecord
    .startedOnMainOf({ ...checkout, gitDirectory: previous })
    .launchedAt(at(60))
    .please();
  keep(record);
  await performWork(makeMe.aCheckoutWork.committing("notes", { at: at(40) }));
  await doneAndUndone(record);
  renameSync(previous, moved);
  symlinkSync(moved, previous);
  writeFileSync(path.join(checkout.integration, ".git"), `gitdir: ${moved}\n`);
  const { later } = await performWork(
    makeMe.aCheckoutWork.committing("later", { at: at(20) }),
  );

  await markDone(record);

  expect(await refs(moved, prefix)).toEqual(pairRefs(checkout.base, later));
  expect(await refs(previous, prefix)).toEqual(pairRefs(checkout.base, later));
});

test("deleting a record from an older failed capture releases refs its earlier Done created", async () => {
  const { checkout, home, record, notes } = await keptWithCommit();
  await markDone(record);
  // An older reader left Done without a comparison and kept its Git refs.
  keepLaunchStore(home, { [source]: [{ ...record, doneAt: minutesAgo(10) }] });
  const saved = await keptSession(source, record.session);
  expect(saved).toMatchObject({ doneAt: minutesAgo(10) });
  expect(saved?.sessionCommits).toBeUndefined();
  expect(await refs(checkout.integration, prefix)).toEqual(
    pairRefs(checkout.base, notes),
  );

  expect(await deleteRecord(source, record.session)).toBe(true);

  expect(await refs(checkout.integration, prefix)).toEqual([]);
});
