// A Dashboard-launched Land publishes a portable session record under the
// launch's reference, with a comparison the published repository can diff;
// unaccepted work or an unclear identity publishes no record.
import assert from "node:assert/strict";
import { chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import {
  git,
  lsRemoteSha,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";
import {
  closedAt,
  landed,
  nativeSession,
  targetRef,
} from "./session-close-test-fixtures.mjs";

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
    { sessionId: nativeSession },
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
    { sessionId: nativeSession },
    {},
    refusingPushes,
  );
  assert.notEqual(closed.work.ok, true);
  assert.equal(closed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});
