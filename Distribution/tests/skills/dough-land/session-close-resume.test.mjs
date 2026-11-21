// A close whose record stage was refused or threw, or whose work or record
// acknowledgement was lost, resumes from its first unfinished step: the work is
// published once and the record keeps its original bytes under the same UUID.
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { resumeSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  lsRemoteSha,
  revParse,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  closedAt,
  landed,
  nativeSession,
  oneUnpublishedEdit,
  targetRef,
} from "./session-close-test-fixtures.mjs";

// The origin logs each accepted push and refuses record pushes while the
// `refuse-records` marker exists.
async function recordingPushes({ origin }) {
  const hook = (name, body) =>
    writeFile(join(origin, "hooks", name), `#!/bin/sh\n${body}`, {
      mode: 0o755,
    });
  await hook(
    "pre-receive",
    `while read old new ref; do
  if [ -e "$GIT_DIR/refuse-records" ] && git diff --name-only "$old" "$new" | grep -q '^.planning/sessions/'; then
    echo record refused >&2; exit 1
  fi
done
`,
  );
  await hook("post-receive", `cut -d' ' -f2 >> "$GIT_DIR/pushes.log"\n`);
}

const acceptedPushes = async ({ origin }) =>
  (await readFile(join(origin, "pushes.log"), "utf8").catch(() => ""))
    .split("\n")
    .filter(Boolean);

const sessionFiles = async ({ origin }) =>
  (await git(origin, "ls-tree", "--name-only", "main", ".planning/sessions/"))
    .stdout;

const resumeFor = async (fixture, record, validatedCandidate) =>
  (
    await resumeSessionClose({
      record,
      validatedCandidate,
      workspace: fixture.execution,
      branch: "land/ad-hoc",
      targetRef,
    })
  ).record;

const isOnTrunk = ({ origin }, sha) =>
  git(origin, "merge-base", "--is-ancestor", sha, "main").then(
    () => true,
    () => false,
  );

const publishedRecord = async ({ origin }) =>
  (await git(origin, "show", `main:.planning/sessions/${nativeSession}.json`))
    .stdout;

// The workspace refuses its next commit, so the record stage throws after the
// work is accepted.
async function refusingCommits(t, { execution }) {
  const hooks = await mkdtemp(join(tmpdir(), "refusing-hooks-"));
  t.after(() => rm(hooks, { recursive: true, force: true }));
  await writeFile(join(hooks, "pre-commit"), "#!/bin/sh\nexit 1\n", {
    mode: 0o755,
  });
  await git(execution, "config", "core.hooksPath", hooks);
  return () => git(execution, "config", "--unset", "core.hooksPath");
}

test("a record stage that throws after work acceptance returns the sealed record, and resuming it publishes the work once", async (t) => {
  let allowCommits;
  const { fixture, closed } = await landed(
    t,
    { sessionId: nativeSession },
    {},
    async (fixture) => {
      await recordingPushes(fixture);
      allowCommits = await refusingCommits(t, fixture);
    },
  );
  assert.equal(closed.work.ok, true, JSON.stringify(closed.work));
  assert.equal(closed.record.status, "stopped");
  assert.match(closed.record.error, /commit/);
  await allowCommits();

  const resumed = await resumeFor(fixture, closed.record.record);

  assert.equal(resumed.status, "published", JSON.stringify(resumed));
  assert.deepEqual(await acceptedPushes(fixture), [
    closed.work.receipt.sha,
    await lsRemoteSha(fixture.origin, targetRef),
  ]);
  assert.equal(
    await publishedRecord(fixture),
    `${JSON.stringify(closed.record.record, null, 2)}\n`,
  );
  assert.equal(
    await sessionFiles(fixture),
    `.planning/sessions/${nativeSession}.json\n`,
  );
});

test("a close whose accepted work push lost its result resumes from the retained work and publishes the record once", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  await recordingPushes(fixture);
  const workSha = await revParse(fixture.execution, "HEAD");
  await git(
    fixture.execution,
    "push",
    "--quiet",
    "origin",
    `${workSha}:${targetRef}`,
  );

  const resumed = await resumeSessionClose({
    session: { sessionId: nativeSession, workflow: "ad-hoc" },
    candidateSha: workSha,
    suffixBase: fixture.trunkSha,
    now: () => closedAt,
    workspace: fixture.execution,
    branch: "land/ad-hoc",
    targetRef,
  });

  assert.equal(resumed.work.pushCount, 0, JSON.stringify(resumed.work));
  assert.equal(resumed.record.status, "published", JSON.stringify(resumed));
  assert.deepEqual(await acceptedPushes(fixture), [
    workSha,
    await lsRemoteSha(fixture.origin, targetRef),
  ]);
  assert.deepEqual(JSON.parse(await publishedRecord(fixture)), {
    version: 1,
    sessionId: nativeSession,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    ranges: [{ base: fixture.trunkSha, candidate: workSha }],
  });
});

test("a lost work result with no kept session identity resumes nothing", async (t) => {
  const fixture = await materializeRepository(oneUnpublishedEdit);
  t.after(fixture.cleanup);
  const workSha = await revParse(fixture.execution, "HEAD");

  const resumed = await resumeSessionClose({
    session: { workflow: "ad-hoc" },
    candidateSha: workSha,
    suffixBase: fixture.trunkSha,
    workspace: fixture.execution,
    branch: "land/ad-hoc",
    targetRef,
  });

  assert.equal(resumed.work.status, "session-identity-missing");
  assert.equal(resumed.record.status, "not-published");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), fixture.trunkSha);
});

test("a refused record push resumes after trunk advances with the original record and one work publication", async (t) => {
  const { fixture, closed } = await landed(
    t,
    { sessionId: nativeSession },
    {},
    async (fixture) => {
      await recordingPushes(fixture);
      await writeFile(join(fixture.origin, "refuse-records"), "");
    },
  );
  assert.equal(closed.work.ok, true, JSON.stringify(closed.work));
  assert.equal(closed.record.status, "stopped");
  const workSha = closed.work.receipt.sha;
  await rm(join(fixture.origin, "refuse-records"));
  const intervening = await advanceOriginFromAnotherWriter(fixture.origin);

  const retained = JSON.parse(JSON.stringify(closed.record.record));
  const rebased = await resumeFor(fixture, retained);
  assert.equal(rebased.publication.status, "needs-validation");
  const resumed = await resumeFor(
    fixture,
    retained,
    rebased.publication.candidate,
  );

  assert.equal(resumed.status, "published", JSON.stringify(resumed));
  const recordSha = await lsRemoteSha(fixture.origin, targetRef);
  assert.deepEqual(await acceptedPushes(fixture), [
    workSha,
    intervening,
    recordSha,
  ]);
  const published = await publishedRecord(fixture);
  assert.equal(published, `${JSON.stringify(closed.record.record, null, 2)}\n`);
  assert.deepEqual(JSON.parse(published), {
    version: 1,
    sessionId: nativeSession,
    workflow: "ad-hoc",
    closedAt: closedAt.toISOString(),
    ranges: [{ base: fixture.trunkSha, candidate: workSha }],
  });
  assert.equal(
    await sessionFiles(fixture),
    `.planning/sessions/${nativeSession}.json\n`,
  );
});

test("a close whose record acknowledgement was lost settles on rerun under the same native UUID without pushing", async (t) => {
  const { fixture, closed } = await landed(
    t,
    { sessionId: nativeSession },
    {},
    recordingPushes,
  );
  assert.equal(closed.record.status, "published", JSON.stringify(closed));
  const pushes = await acceptedPushes(fixture);
  const tip = await lsRemoteSha(fixture.origin, targetRef);

  const resumed = await resumeFor(fixture, closed.record.record);

  assert.equal(resumed.status, "published");
  assert.equal(resumed.path, `.planning/sessions/${nativeSession}.json`);
  assert.equal(pushes.length, 2);
  assert.deepEqual(await acceptedPushes(fixture), pushes);
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), tip);
  assert.equal(
    await sessionFiles(fixture),
    `.planning/sessions/${nativeSession}.json\n`,
  );
});

test("a different record at the same UUID is reported as a conflict with the accepted work intact", async (t) => {
  const { fixture, closed } = await landed(t, { sessionId: nativeSession });
  const tip = await lsRemoteSha(fixture.origin, targetRef);

  const resumed = await resumeFor(fixture, {
    ...closed.record.record,
    closedAt: "2026-11-21T10:00:00.000Z",
  });

  assert.equal(resumed.status, "session-record-conflict");
  assert.equal(await lsRemoteSha(fixture.origin, targetRef), tip);
  assert.equal(await isOnTrunk(fixture, closed.work.receipt.sha), true);
});
