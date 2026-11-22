// A Dashboard-launched Land publishes a portable session record under the
// launch's reference, with a comparison the published repository can diff;
// unaccepted work or an unclear identity publishes no record.
import assert from "node:assert/strict";
import { chmod, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import {
  git,
  lsRemoteSha,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";
import { sharedCheckoutNotePathBeside } from "../../../src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";
import {
  aLaunchLandingContext,
  closedAt,
  landed,
  nativeSession,
  publishedRecord,
  pulledBeforeOneUnpublishedEdit,
  targetRef,
} from "./session-close-test-fixtures.mjs";

const publishedRecordOf = async (fixture) =>
  JSON.parse(await publishedRecord(fixture, reportingReference));

test("a Dashboard-launched Land publishes the session record of its accepted comparison under the launch reference", async (t) => {
  const { fixture, closed } = await landed(
    t,
    {},
    { landingContext: await aLaunchLandingContext(t) },
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));

  const published = (args) => git(fixture.origin, ...args);
  const record = await publishedRecordOf(fixture);
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

test("a close noted as sharing its checkout publishes its range marked, with a commit pulled before the work below its base", async (t) => {
  const { fixture, closed } = await landed(
    t,
    {},
    {
      landingContext: await aLaunchLandingContext(
        t,
        new Date(closedAt.getTime() - 60_000),
      ),
    },
    async () => {},
    pulledBeforeOneUnpublishedEdit,
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));

  const record = await publishedRecordOf(fixture);
  assert.deepEqual(record, {
    version: 1,
    sessionId: reportingReference,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    ranges: [
      {
        base: fixture.trunkSha,
        candidate: closed.work.receipt.sha,
        uncertainty: "shared-checkout",
      },
    ],
  });
  const [{ base, candidate }] = record.ranges;
  assert.equal(
    (await git(fixture.origin, "diff", "--name-only", base, candidate)).stdout,
    "edited.txt\n",
  );
  assert.equal(
    (await git(fixture.origin, "show", `${base}:pulled.txt`)).stdout,
    "pulled\n",
  );
});

test("a close noted as sharing its checkout only after its acceptance publishes its range unmarked", async (t) => {
  const { fixture, closed } = await landed(
    t,
    {},
    {
      landingContext: await aLaunchLandingContext(
        t,
        new Date(closedAt.getTime() + 60_000),
      ),
    },
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  assert.deepEqual((await publishedRecordOf(fixture)).ranges, [
    { base: fixture.trunkSha, candidate: closed.work.receipt.sha },
  ]);
});

for (const [note, text] of [
  ["is torn", '{"since":'],
  ["names no valid start", '{"since":"soon"}'],
]) {
  test(`a close whose shared-checkout note ${note} publishes its range marked`, async (t) => {
    const landingContext = await aLaunchLandingContext(t);
    await writeFile(sharedCheckoutNotePathBeside(landingContext), text);
    const { fixture, closed } = await landed(t, {}, { landingContext });
    assert.equal(closed.record.status, "published", JSON.stringify(closed));
    assert.deepEqual((await publishedRecordOf(fixture)).ranges, [
      {
        base: fixture.trunkSha,
        candidate: closed.work.receipt.sha,
        uncertainty: "shared-checkout",
      },
    ]);
  });
}

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
