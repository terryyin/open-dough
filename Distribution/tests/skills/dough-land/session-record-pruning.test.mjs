// A session close's record commit removes the expired session records beside
// the backlog, also when resumed after a refused commit, keeps every live or
// unreadable one, leaves earlier snapshots intact, and keeps a concurrent
// writer's live record through a rebase.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  publishSessionClose,
  resumeSessionClose,
} from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  cloneAsAnotherWriter,
  git,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  closedAt,
  closingStory,
  nativeSession,
  targetRef,
} from "./session-close-test-fixtures.mjs";
import { refusingCommits } from "./session-close-faults.mjs";

const sessions = ".planning/sessions";
const recordFile = (record) => [
  `${sessions}/${record.sessionId}.json`,
  `${JSON.stringify(record, null, 2)}\n`,
];
const expired = makeMe.aSessionRecord
  .closedAt("2026-10-01T10:00:00.000Z")
  .please();
const live = makeMe.aSessionRecord
  .closedAt("2026-11-10T10:00:00.000Z")
  .please();
const malformedPath = `${sessions}/${globalThis.crypto.randomUUID()}.json`;
const elsewhere = makeMe.aSessionRecord
  .closedAt("2026-10-01T10:00:00.000Z")
  .please();
const elsewherePath = `${sessions}/${globalThis.crypto.randomUUID()}.json`;
const unreadableClose = {
  ...makeMe.aSessionRecord.please(),
  closedAt: "not a time",
};

const trunkWithRecords = makeMe.aRepository
  .withRevision("trunk", {
    files: Object.fromEntries([
      recordFile(expired),
      recordFile(live),
      recordFile(unreadableClose),
      [malformedPath, "not a record\n"],
      [elsewherePath, `${JSON.stringify(elsewhere)}\n`],
    ]),
  })
  .withWorkspace("land/ad-hoc", { from: "trunk" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

const publication = { workspace: undefined, branch: "land/ad-hoc", targetRef };

async function closing(t, before = async () => {}) {
  const fixture = await materializeRepository(trunkWithRecords);
  t.after(fixture.cleanup);
  await before(fixture);
  const closed = await publishSessionClose({
    ...makeMe.anIncrementPublication
      .with({ ...publication, previouslyPublishedBase: fixture.trunkSha })
      .please(),
    now: () => closedAt,
    workspace: fixture.execution,
    session: {
      workflow: "ad-hoc",
      story: closingStory,
      sessionId: nativeSession,
    },
  });
  return { fixture, closed };
}

const sessionFiles = async (repo, ref = "main") =>
  (await git(repo, "ls-tree", "--name-only", ref, `${sessions}/`)).stdout
    .split("\n")
    .filter(Boolean)
    .sort();

const keptFiles = (...more) =>
  [
    `${sessions}/${live.sessionId}.json`,
    `${sessions}/${unreadableClose.sessionId}.json`,
    `${sessions}/${nativeSession}.json`,
    malformedPath,
    elsewherePath,
    ...more,
  ].sort();

test("the record commit removes expired records, keeps live and unreadable ones, and the commit before still holds them", async (t) => {
  const { fixture, closed } = await closing(t);

  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  assert.deepEqual(await sessionFiles(fixture.origin), keptFiles());
  assert.ok(
    (await sessionFiles(fixture.origin, "main^")).includes(
      `${sessions}/${expired.sessionId}.json`,
    ),
  );

  const rerun = await resumeSessionClose({
    ...publication,
    workspace: fixture.execution,
    now: () => closedAt,
    record: closed.record.record,
  });
  assert.equal(rerun.record.status, "published");
  assert.equal(
    (await git(fixture.execution, "status", "--porcelain")).stdout,
    "",
  );
  assert.deepEqual(await sessionFiles(fixture.origin), keptFiles());
});

test("a record commit refused once and resumed still removes the expired record and leaves a clean workspace", async (t) => {
  let allowCommits;
  const { fixture, closed } = await closing(t, async (fixture) => {
    allowCommits = await refusingCommits(t, fixture);
  });
  assert.equal(closed.record.status, "stopped", JSON.stringify(closed));
  await allowCommits();

  const resumed = await resumeSessionClose({
    ...publication,
    workspace: fixture.execution,
    now: () => closedAt,
    record: closed.record.record,
  });

  assert.equal(resumed.record.status, "published", JSON.stringify(resumed));
  assert.ok(
    !(await sessionFiles(fixture.origin)).includes(
      `${sessions}/${expired.sessionId}.json`,
    ),
  );
  assert.equal(
    (await git(fixture.execution, "status", "--porcelain")).stdout,
    "",
  );
});

const theirs = makeMe.aSessionRecord
  .closedAt("2026-11-19T10:00:00.000Z")
  .please();

// Another writer publishes its own live record and prunes the same expired
// file while this close's record push is refused.
async function anotherWriterPrunes(origin) {
  const checkout = await mkdtemp(join(tmpdir(), "another-writer-"));
  try {
    await cloneAsAnotherWriter(origin, checkout);
    const [path, bytes] = recordFile(theirs);
    writeFileSync(join(checkout, path), bytes);
    await git(checkout, "add", path);
    await git(checkout, "rm", "-q", `${sessions}/${expired.sessionId}.json`);
    await git(checkout, "commit", "-q", "-m", "their record");
    await git(checkout, "push", "-q", "origin", "main");
  } finally {
    await rm(checkout, { recursive: true, force: true });
  }
}
test("a rebased record commit keeps a concurrent writer's live record that pruned the same expired file", async (t) => {
  const { fixture, closed } = await closing(t, async ({ origin }) => {
    const hook = join(origin, "hooks", "pre-receive");
    writeFileSync(
      hook,
      `#!/bin/sh\nwhile read old new ref; do\n  if [ -e "$GIT_DIR/refuse-records" ] && git diff --name-only "$old" "$new" | grep -q '^.planning/sessions/${nativeSession}'; then exit 1; fi\ndone\n`,
      { mode: 0o755 },
    );
    writeFileSync(join(origin, "refuse-records"), "");
  });
  assert.equal(closed.record.status, "stopped", JSON.stringify(closed));
  await rm(join(fixture.origin, "refuse-records"));
  await anotherWriterPrunes(fixture.origin);

  const resume = (validatedCandidate) =>
    resumeSessionClose({
      ...publication,
      workspace: fixture.execution,
      now: () => closedAt,
      record: closed.record.record,
      validatedCandidate,
    });
  const rebased = (await resume()).record;
  assert.equal(rebased.publication.status, "needs-validation");
  const resumed = (await resume(rebased.publication.candidate)).record;

  assert.equal(resumed.status, "published", JSON.stringify(resumed));
  assert.deepEqual(
    await sessionFiles(fixture.origin),
    keptFiles(`${sessions}/${theirs.sessionId}.json`),
  );
});
