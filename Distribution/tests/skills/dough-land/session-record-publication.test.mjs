// A standalone Land publishes a portable session record a second clone can
// resolve by UUID and diff; refused work publishes no record.
import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { publishSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  git,
  lsRemoteSha,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";

const targetRef = "refs/heads/main";
const sessionId = "0b5c2f1e-6a3d-4c8e-9f21-7d4e5a6b8c90";
const recordPath = `.planning/sessions/${sessionId}.json`;
const closedAt = new Date("2026-11-20T10:00:00.000Z");

const oneUnpublishedEdit = makeMe.aRepository
  .withRevision("trunk")
  .withWorkspace("land/standalone", { from: "trunk" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

function standaloneLand(fixture, publication = {}) {
  return {
    now: () => closedAt,
    workspace: fixture.execution,
    ...makeMe.anIncrementPublication
      .with({
        branch: "land/standalone",
        previouslyPublishedBase: fixture.trunkSha,
        targetRef,
      })
      .please(),
    ...publication,
  };
}

async function cloneOrigin(t, origin) {
  const dir = await mkdtemp(join(tmpdir(), "second-machine-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await git(dir, "clone", "--no-local", "--single-branch", origin, "clone");
  return join(dir, "clone");
}

test("a standalone Land publishes a session record whose pair a second clone can diff", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const closed = await publishSessionClose(
    standaloneLand(fixture, { session: { sessionId, workflow: "standalone" } }),
  );
  assert.equal(closed.record.status, "published");

  const clone = await cloneOrigin(t, fixture.origin);
  const record = JSON.parse(await readFile(join(clone, recordPath), "utf8"));
  assert.deepEqual(record, {
    version: 1,
    sessionId,
    workflow: "standalone",
    closedAt: closedAt.toISOString(),
    ranges: [{ base: fixture.trunkSha, candidate: closed.work.receipt.sha }],
  });
  const [{ base, candidate }] = record.ranges;
  assert.equal(
    (await git(clone, "diff", base, candidate)).stdout.includes("+edit"),
    true,
  );
  assert.equal(
    (await git(clone, "diff", "--name-only", base, candidate)).stdout,
    "edited.txt\n",
  );
});

test("local-only work publishes no session record", async (t) => {
  const fixture = await materializeRepository(
    makeMe.aRepository
      .withRevision("trunk")
      .withWorkspace("land/standalone", { from: "trunk" })
      .withUnpublishedRevision("local-only", { files: { "local.txt": "x\n" } })
      .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
      .please(),
  );
  t.after(fixture.cleanup);
  const localOnlyBase = (
    await git(fixture.execution, "rev-parse", "land/standalone~1")
  ).stdout.trim();
  const closed = await publishSessionClose(
    standaloneLand(fixture, {
      session: { sessionId, workflow: "standalone" },
      previouslyPublishedBase: localOnlyBase,
    }),
  );
  assert.equal(closed.work.status, "unpublished-base");
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

test("a Dashboard launch's landing reference is the published session UUID", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const receiver = await landingReceiver(t);
  const landingContext = await landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
  const closed = await publishSessionClose(
    standaloneLand(fixture, {
      session: { workflow: "standalone" },
      landingContext,
    }),
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  const clone = await cloneOrigin(t, fixture.origin);
  const record = JSON.parse(
    await readFile(
      join(clone, `.planning/sessions/${reportingReference}.json`),
      "utf8",
    ),
  );
  assert.equal(record.sessionId, reportingReference);
});

test("a retained session id that conflicts with the launch reference publishes nothing", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const receiver = await landingReceiver(t);
  const landingContext = await landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
  const closed = await publishSessionClose(
    standaloneLand(fixture, {
      session: { sessionId, workflow: "standalone" },
      landingContext,
    }),
  );
  assert.equal(closed.work.status, "session-identity-conflict");
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

test("a close with no kept session identity publishes nothing", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const closed = await publishSessionClose(
    standaloneLand(fixture, { session: { workflow: "standalone" } }),
  );
  assert.equal(closed.work.status, "session-identity-missing");
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

test("work the remote refuses publishes no session record", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const hook = join(fixture.origin, "hooks", "pre-receive");
  await writeFile(hook, "#!/bin/sh\necho refused >&2\nexit 1\n");
  await chmod(hook, 0o755);
  const closed = await publishSessionClose(
    standaloneLand(fixture, { session: { sessionId, workflow: "standalone" } }),
  );
  assert.notEqual(closed.work.ok, true);
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
  const clone = await cloneOrigin(t, fixture.origin);
  await assert.rejects(readFile(join(clone, recordPath), "utf8"), {
    code: "ENOENT",
  });
});
