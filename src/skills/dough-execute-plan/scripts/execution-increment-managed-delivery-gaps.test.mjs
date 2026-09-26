// Managed delivery authority, coverage-gap, and racing-remote cases.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  advanceOriginFromAnotherWriter,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import { deliverThroughCli } from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const repo = "owner/project";

test("an unavailable host bridge reports unobserved coverage and preserves acceptance", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    session: null,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(delivered.ok, true);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(delivered.observation.pendingCi, "unobserved");
  assert.equal(delivered.observation.directory, undefined);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(existsSync(fixture.storage), false);
});

test("a Claude delivery with neither explicit nor ambient session identity reports an actionable gap and keeps publication truthful", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  // Deliberately remove any session identity inherited from the test runner.
  const env = { ...fixture.env };
  delete env.CLAUDE_CODE_SESSION_ID;

  const local = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    extra: ["--authority", "local-only"],
    env,
  });
  assert.equal(local.delivered.publication, "pending");
  assert.equal(local.delivered.report, "local-only");
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );

  const { delivered } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env,
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(delivered.observation.pendingCi, "unobserved");
  assert.match(delivered.observation.reason, /CLAUDE_CODE_SESSION_ID is unset/);
  assert.match(delivered.observation.reason, /--session-json/);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(existsSync(fixture.storage), false);
});

test("a Claude delivery whose hook does not confirm readiness reports an unavailable bridge and keeps acceptance", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  // An installed hook that answers without delivering (as when disabled).
  writeFileSync(
    join(fixture.skill, "scripts/ci-host-hook.mjs"),
    'process.stdout.write("{}\\n");\n',
  );

  const { delivered } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env: { ...fixture.env, CLAUDE_CODE_SESSION_ID: "claude-coordinator" },
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "unobserved");
  assert.equal(
    delivered.observation.reason,
    "host bridge did not confirm CI_MONITOR_READY",
  );
  assert.equal(delivered.observation.directory, undefined);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
});

test("local-only authority does not push", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const before = await lsRemoteSha(fixture.origin, trunkTarget);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    authority: "local-only",
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(delivered.publication, "pending");
  assert.equal(delivered.receipt, null);
  assert.equal(delivered.observation, null);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), before);
  assert.equal(existsSync(fixture.storage), false);
});

test("managed delivery returns needs-validation when a racing remote tip changes the candidate", async (t) => {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);

  const disjointSha = await advanceOriginFromAnotherWriter(fixture.origin);
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(delivered.ok, false);
  assert.equal(delivered.publication, "reconciled");
  assert.equal(delivered.status, "needs-validation");
  assert.equal(delivered.remoteTip, disjointSha);
  assert.notEqual(delivered.candidate, fixture.candidateSha);
  assert.equal(await lsRemoteSha(fixture.origin, trunkTarget), disjointSha);
  assert.equal(
    (
      await git(
        fixture.execution,
        "log",
        "--format=%P",
        "-1",
        delivered.candidate,
      )
    ).stdout.trim(),
    disjointSha,
  );
});
