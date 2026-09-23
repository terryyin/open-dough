// Managed delivery: bare local remote, real worker, controlled CI results,
// and host-bridge transport. Registration receipts are product outcomes, not
// injected fixtures.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import { deliverHostBoundary } from "./ci-host-bridge.mjs";
import { readRevisionCoverage, readWorkerIdentity } from "./ci-mailbox.mjs";
import {
  createManagedFixture,
  git,
  waitForFailureEvent,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const storyTarget = "refs/heads/cursor/story-execution";
const repo = "owner/project";

test("Trunk Mode managed delivery establishes observation, attaches the accepted SHA, and delivers a delayed failure", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;

  assert.equal(delivered.ok, true);
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "attached");
  assert.equal(delivered.receipt.target, trunkTarget);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    delivered.receipt.sha,
  );
  assert.equal(await lsRemoteSha(fixture.origin, "refs/heads/exec/story"), "");
  const coverage = readRevisionCoverage(delivered.observation.directory);
  assert.equal(coverage.length, 1);
  assert.equal(coverage[0].sha, delivered.receipt.sha.toLowerCase());
  const identity = readWorkerIdentity(delivered.observation.directory);
  assert.equal(Number.isSafeInteger(identity.pid) && identity.pid > 0, true);

  fixture.releaseFailure(delivered.receipt.sha, "main");
  await waitForFailureEvent(delivered.observation.directory);
  const boundary = await deliverHostBoundary({
    host: "cursor",
    session: fixture.session,
    workspace: fixture.execution,
    hookPath: join(fixture.skill, "scripts/ci-host-hook.mjs"),
    env: fixture.env,
  });
  const context =
    boundary.additional_context ??
    boundary.hookSpecificOutput?.additionalContext ??
    "";
  assert.match(context, /CI_FAILURE/);
  assert.match(context, new RegExp(delivered.receipt.sha, "i"));
});

test("Story Branch managed delivery observes the recorded execution branch target", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    host: "claude",
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: storyTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;

  assert.equal(delivered.observation.state, "attached");
  assert.equal(delivered.receipt.sha, fixture.candidateSha);
  assert.equal(
    await lsRemoteSha(fixture.origin, storyTarget),
    fixture.candidateSha,
  );
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.trunkSha,
  );
  assert.equal(
    readRevisionCoverage(delivered.observation.directory)[0].sha,
    fixture.candidateSha.toLowerCase(),
  );
});

test("a second managed delivery reuses the matching live observer", async (t) => {
  const fixture = await createManagedFixture();
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const first = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = first.observation.directory;
  assert.equal(first.observation.state, "attached");

  writeFileSync(join(fixture.execution, "second.txt"), "second increment\n");
  await git(fixture.execution, "add", "second.txt");
  await git(fixture.execution, "commit", "-m", "second verified increment");
  const secondBase = first.receipt.sha;

  const second = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: secondBase,
    targetRef: trunkTarget,
    repo,
  });

  assert.equal(second.observation.state, "reused");
  assert.equal(second.observation.directory, first.observation.directory);
  assert.equal(second.observation.reused, true);
  const coverage = readRevisionCoverage(second.observation.directory);
  assert.equal(coverage.length, 2);
  assert.equal(
    coverage.some((entry) => entry.sha === second.receipt.sha.toLowerCase()),
    true,
  );
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    second.receipt.sha,
  );
});

test("missing host alias still resolves a usable checkout runtime", async (t) => {
  const fixture = await createManagedFixture({ platforms: [".agents"] });
  t.after(async () => {
    await fixture.stopObserver(fixture.observerDirectory);
    fixture.cleanup();
  });

  const runtime = fixture.resolveCheckoutRuntime(fixture.execution, {
    host: "claude",
    preferredAlias: ".claude",
  });
  assert.equal(runtime.alias, ".agents");
  assert.match(runtime.entrypoint, /\.agents\/skills\/dough-execute-plan/);

  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    host: "claude",
    preferredAlias: ".claude",
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: fixture.trunkSha,
    targetRef: trunkTarget,
    repo,
  });
  fixture.observerDirectory = delivered.observation.directory;
  assert.equal(delivered.observation.state, "attached");
  assert.equal(delivered.runtime.alias, ".agents");
});
