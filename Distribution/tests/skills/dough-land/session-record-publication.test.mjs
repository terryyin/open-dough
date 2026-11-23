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

test("a Dashboard-launched Land publishes the launch's Done story and its originating comparison", async (t) => {
  const title = "Rework the launch review";
  const story = `ad-hoc#${reportingReference}`;
  const { fixture, closed } = await landed(
    t,
    {},
    { landingContext: await aLaunchLandingContext(t, undefined, title) },
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));

  const published = (args) => git(fixture.origin, ...args);
  const record = await publishedRecordOf(fixture);
  assert.deepEqual(record, {
    version: 1,
    sessionId: reportingReference,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    story,
    title,
    ranges: [{ base: fixture.trunkSha, candidate: closed.work.receipt.sha }],
  });
  const donePath = `.planning/done/ad-hoc_${reportingReference}.json`;
  const catalogPath = ".planning/done/.catalog.json";
  const changed = await published([
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    "main",
  ]);
  assert.deepEqual(changed.stdout.trim().split("\n"), [
    catalogPath,
    donePath,
    `.planning/sessions/${reportingReference}.json`,
  ]);
  assert.deepEqual(
    JSON.parse((await published(["show", `main:${donePath}`])).stdout),
    { schemaVersion: 1, identity: story, title, completedAt: record.closedAt },
  );
  assert.deepEqual(
    JSON.parse((await published(["show", `main:${catalogPath}`])).stdout)
      .records,
    [
      {
        fileName: `ad-hoc_${reportingReference}.json`,
        identity: story,
        completedAt: record.closedAt,
        blob: (
          await published(["rev-parse", `main:${donePath}`])
        ).stdout.trim(),
      },
    ],
  );
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

test("a titled follow-up keeps its existing story and publishes no additional Done record", async (t) => {
  const story = "SEED-42#review";
  const { fixture, closed } = await landed(t, {
    sessionId: nativeSession,
    story,
    title: "Review the attachment",
  });
  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  assert.equal(JSON.parse(await publishedRecord(fixture)).story, story);
  const done = await git(
    fixture.origin,
    "ls-tree",
    "-r",
    "main",
    ".planning/done",
  );
  assert.equal(done.stdout, "");
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
