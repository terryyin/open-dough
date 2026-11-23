// Recovery of a titled ad hoc close uses its sealed facts and first published
// association, including when another writer wins between fetch and push.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  publishSessionClose,
  resumeSessionClose,
} from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  cloneAsAnotherWriter,
  git,
  lsRemoteSha,
  revParse,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  acceptedPushes,
  recordingPushes,
  refusingCommits,
} from "./session-close-faults.mjs";
import {
  closedAt,
  landed,
  nativeSession,
  oneUnpublishedEdit,
  publishedRecord,
  targetRef,
} from "./session-close-test-fixtures.mjs";

const story = `ad-hoc#${nativeSession}`;
const title = "Keep the original close";
const donePath = `.planning/done/ad-hoc_${nativeSession}.json`;
const catalogPath = ".planning/done/.catalog.json";
const anotherTime = "2026-11-21T10:00:00.000Z";

const readTrunk = async ({ origin }, path) =>
  JSON.parse((await git(origin, "show", `main:${path}`)).stdout);

const resume = (workspace, branch, record, options = {}) =>
  resumeSessionClose({ workspace, branch, record, targetRef, ...options });

async function stoppedAfterLanding(t) {
  let allowCommits;
  const { fixture, closed } = await landed(
    t,
    { sessionId: nativeSession, title },
    {},
    async (checkout) => {
      await recordingPushes(checkout);
      allowCommits = await refusingCommits(t, checkout);
    },
  );
  assert.equal(closed.work.ok, true, JSON.stringify(closed.work));
  assert.equal(closed.record.status, "stopped", JSON.stringify(closed.record));
  await allowCommits();
  return {
    fixture,
    retained: JSON.parse(JSON.stringify(closed.record.record)),
  };
}

async function anotherWriter(t, fixture) {
  const clone = await mkdtemp(join(tmpdir(), "competing-close-"));
  t.after(() => rm(clone, { recursive: true, force: true }));
  await cloneAsAnotherWriter(fixture.origin, clone);
  return clone;
}

test("a native Land resumes a stopped close with the original title and completion time, then repeats without pushing", async (t) => {
  const { fixture, retained } = await stoppedAfterLanding(t);
  const { execution, origin } = fixture;
  const first = await resume(execution, "land/ad-hoc", retained, {
    now: () => new Date(anotherTime),
  });
  assert.equal(first.record.status, "published", JSON.stringify(first));
  assert.deepEqual(await readTrunk(fixture, donePath), {
    schemaVersion: 1,
    identity: story,
    title,
    completedAt: closedAt.toISOString(),
  });
  assert.deepEqual(JSON.parse(await publishedRecord(fixture)), retained);
  const tip = await lsRemoteSha(origin, targetRef);

  const retry = await resume(execution, "land/ad-hoc", retained);
  assert.equal(retry.record.status, "published");
  assert.equal(retry.record.publication.pushCount, 0);
  assert.deepEqual(await acceptedPushes(fixture), [
    retained.ranges[0].candidate,
    tip,
  ]);
});

test("an accepted work push with a lost response retains the native title for recovery", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const workspace = fixture.execution;
  const branch = "land/ad-hoc";
  const session = { sessionId: nativeSession, workflow: "ad-hoc", title };
  await assert.rejects(
    publishSessionClose({
      workspace,
      branch,
      previouslyPublishedBase: fixture.trunkSha,
      targetRef,
      session,
      beforePush: async ({ candidate }) => {
        await git(workspace, "push", "origin", `${candidate}:${targetRef}`);
        throw new Error("work push result lost");
      },
    }),
    /work push result lost/,
  );
  const accepted = await lsRemoteSha(fixture.origin, targetRef);
  const result = await resumeSessionClose({
    workspace,
    branch,
    targetRef,
    now: () => closedAt,
    session: { ...session, title: "A changed native title" },
  });

  assert.equal(result.work.pushCount, 0);
  assert.equal(result.record.status, "published", JSON.stringify(result));
  assert.deepEqual(JSON.parse(await publishedRecord(fixture)).ranges, [
    { base: fixture.trunkSha, candidate: accepted },
  ]);
  assert.equal((await readTrunk(fixture, donePath)).title, title);
});

test("the close retains both catalog entries when another Done story publishes first", async (t) => {
  const { fixture, retained } = await stoppedAfterLanding(t);
  const { execution } = fixture;
  const editor = await anotherWriter(t, fixture);
  const otherSession = "18320b5c-8a0c-4a32-94f9-9dba6366e06a";
  const otherStory = `ad-hoc#${otherSession}`;
  const other = makeMe.aSessionRecord
    .forSession(otherSession)
    .underStory(otherStory)
    .titled("Competing catalog entry")
    .closedAt(anotherTime)
    .closing(retained.ranges[0])
    .please();
  const rebased = await resume(execution, "land/ad-hoc", retained, {
    beforePush: async () => {
      const publication = await resume(editor, "main", other);
      assert.equal(
        publication.record.status,
        "published",
        JSON.stringify(publication),
      );
    },
  });
  assert.equal(
    rebased.record.publication.status,
    "needs-validation",
    JSON.stringify(rebased),
  );
  const result = await resume(execution, "land/ad-hoc", retained, {
    validatedCandidate: rebased.record.publication.candidate,
  });

  assert.equal(result.record.status, "published", JSON.stringify(result));
  assert.deepEqual(JSON.parse(await publishedRecord(fixture)), retained);
  const catalog = await readTrunk(fixture, catalogPath);
  assert.deepEqual(
    catalog.records.map((entry) => entry.identity),
    [otherStory, story],
  );
  for (const { fileName, blob } of catalog.records) {
    assert.equal(
      await revParse(fixture.origin, `main:.planning/done/${fileName}`),
      blob,
    );
  }
});

async function racedClose(t, association) {
  const { fixture, retained } = await stoppedAfterLanding(t);
  const { execution, origin } = fixture;
  const editor = await anotherWriter(t, fixture);
  const winner = makeMe.aSessionRecord
    .forSession(nativeSession)
    .underStory(association)
    .titled("First published title")
    .closedAt(anotherTime)
    .closing(retained.ranges[0])
    .please();
  let winnerTip;
  let keptCandidate;
  const { record } = await resume(execution, "land/ad-hoc", retained, {
    beforePush: async ({ candidate }) => {
      keptCandidate = candidate;
      const publication = await resume(editor, "main", winner);
      assert.equal(
        publication.record.status,
        "published",
        JSON.stringify(publication),
      );
      winnerTip = await lsRemoteSha(origin, targetRef);
    },
  });
  return { fixture, retained, winner, winnerTip, keptCandidate, record };
}

async function assertWinnerPreserved(race) {
  const { fixture, retained, winner, winnerTip, keptCandidate, record } = race;
  assert.equal(record.publication.pushCount, 0);
  assert.deepEqual(JSON.parse(await publishedRecord(fixture)), winner);
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), winnerTip);
  assert.equal(await revParse(fixture.execution, "HEAD"), keptCandidate);
  assert.deepEqual(await acceptedPushes(fixture), [
    retained.ranges[0].candidate,
    winnerTip,
  ]);
}

test("a competing close of the originating session preserves the first published Done story", async (t) => {
  const race = await racedClose(t, story);
  assert.equal(race.record.status, "published", JSON.stringify(race.record));
  assert.deepEqual(race.record.record, race.winner);
  assert.deepEqual(await readTrunk(race.fixture, donePath), {
    schemaVersion: 1,
    identity: story,
    title: "First published title",
    completedAt: anotherTime,
  });
  await assertWinnerPreserved(race);
});

test("a competing close under a different story reports the association conflict", async (t) => {
  const race = await racedClose(t, "SEED-42#review");
  assert.equal(
    race.record.status,
    "session-record-conflict",
    JSON.stringify(race.record),
  );
  const files = await git(
    race.fixture.origin,
    "ls-tree",
    "-r",
    "main",
    ".planning/done",
  );
  assert.equal(files.stdout, "");
  await assertWinnerPreserved(race);
});
