// A Dashboard-launched Land publishes a portable session record under the
// launch's reference, with a comparison the published repository can diff;
// unaccepted work or an unclear identity publishes no record.
import assert from "node:assert/strict";
import { chmod, writeFile } from "node:fs/promises";
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
const closedAt = new Date("2026-11-20T10:00:00.000Z");

const oneUnpublishedEdit = makeMe.aRepository
  .withRevision("trunk")
  .withWorkspace("land/ad-hoc", { from: "trunk" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

async function landed(t, session, publication = {}, before = async () => {}) {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  await before(fixture);
  const closed = await publishSessionClose({
    now: () => closedAt,
    workspace: fixture.execution,
    session: { workflow: "ad-hoc", ...session },
    ...makeMe.anIncrementPublication
      .with({
        branch: "land/ad-hoc",
        previouslyPublishedBase: fixture.trunkSha,
        targetRef,
      })
      .please(),
    ...publication,
  });
  return { fixture, closed };
}

async function aLaunchLandingContext(t) {
  const receiver = await landingReceiver(t);
  return landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
}

test("a Dashboard-launched Land publishes the session record of its accepted comparison under the launch reference", async (t) => {
  const { fixture, closed } = await landed(
    t,
    {},
    { landingContext: await aLaunchLandingContext(t) },
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));

  const published = (args) => git(fixture.origin, ...args);
  const record = JSON.parse(
    (
      await published([
        "show",
        `main:.planning/sessions/${reportingReference}.json`,
      ])
    ).stdout,
  );
  assert.deepEqual(record, {
    version: 1,
    sessionId: reportingReference,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    ranges: [{ base: fixture.trunkSha, candidate: closed.work.receipt.sha }],
  });
  const [{ base, candidate }] = record.ranges;
  assert.match((await published(["diff", base, candidate])).stdout, /\+edit/);
  assert.equal(
    (await published(["diff", "--name-only", base, candidate])).stdout,
    "edited.txt\n",
  );
});

test("a retained session id that conflicts with the launch reference publishes nothing", async (t) => {
  const { fixture, closed } = await landed(
    t,
    { sessionId: "0b5c2f1e-6a3d-4c8e-9f21-7d4e5a6b8c90" },
    { landingContext: await aLaunchLandingContext(t) },
  );
  assert.equal(closed.work.status, "session-identity-conflict");
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

test("a close with no kept session identity publishes nothing", async (t) => {
  const { fixture, closed } = await landed(t, {});
  assert.equal(closed.work.status, "session-identity-missing");
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

async function refusingPushes({ origin }) {
  const hook = join(origin, "hooks", "pre-receive");
  await writeFile(hook, "#!/bin/sh\necho refused >&2\nexit 1\n");
  await chmod(hook, 0o755);
}

test("work the remote refuses publishes no session record", async (t) => {
  const { fixture, closed } = await landed(
    t,
    { sessionId: "0b5c2f1e-6a3d-4c8e-9f21-7d4e5a6b8c90" },
    {},
    refusingPushes,
  );
  assert.notEqual(closed.work.ok, true);
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});
