// A Story Branch session's record, published after history-preserving
// integration and read from a default-branch-only clone once the execution
// branch is deleted, keeps the original branch pairs and the separately
// accepted continuation once each, under the launch reference, and holds no
// intervening trunk work or the enclosing merge pair.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { promisify } from "node:util";
import { makeMe } from "../../support/makeMe.mjs";
import { reportingReference } from "../../support/launchLandingTestData.mjs";
import { beginNativeSession } from "../../../src/skills/dough-execute-plan/scripts/execution-session-evidence.mjs";
import { publishHistoryPreservingCandidate } from "../../../src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs";
import { sessionRecordPathBeside } from "../../../src/skills/dough-execute-plan/scripts/session-record.mjs";
import { ignoreInstalledSkills } from "../dough-execute-plan/ci-installed-checkouts-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { createManagedFixture } from "../dough-execute-plan/execution-increment-managed-delivery-test-fixtures.mjs";
import {
  advanceOriginFromAnotherWriter,
  git,
  revParse,
} from "../dough-execute-plan/publication-test-fixtures.mjs";
import { runRetirementCommand } from "../dough-story-refinement/dough-land-test-fixtures.mjs";

const branch = "exec/story";
const storyTarget = `refs/heads/${branch}`;
const wrapUpSource = fileURLToPath(
  new URL("../../../src/skills/dough-story-wrap-up/", import.meta.url),
);

// Delivers HEAD to the execution branch through managed Story Branch delivery.
async function deliverToBranch(fixture, previouslyPublishedBase) {
  const delivered = await fixture.deliverManagedExecutionIncrement({
    ...fixture.requestBase,
    mode: "story-branch",
    host: "claude",
    workspace: fixture.execution,
    branch,
    previouslyPublishedBase,
    targetRef: storyTarget,
    repo: "owner/project",
  });
  assert.equal(delivered.ok, true, JSON.stringify(delivered));
  // Its observer stops before retirement removes the launcher it runs from.
  await fixture.stopObserver(delivered.observation.directory);
  return delivered.receipt.sha;
}

// Branch increment, intervening trunk change, accepted continuation, then
// history-preserving integration under `landingContext`.
async function integrateStoryBranch(t, { landingContext } = {}) {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;
  await ignoreInstalledSkills(execution);
  cpSync(wrapUpSource, join(execution, ".agents/skills/dough-story-wrap-up"), {
    recursive: true,
  });
  const { sessionId: nativeId } = beginNativeSession(execution);
  const trunk = fixture.trunkSha;
  const increment = await deliverToBranch(fixture, trunk);
  await advanceOriginFromAnotherWriter(origin, {
    file: "unrelated.txt",
  });
  writeFileSync(join(execution, "continuation.txt"), "continued\n");
  await git(execution, "add", "continuation.txt");
  await git(execution, "commit", "-m", "continuation");
  const continuation = await deliverToBranch(fixture, increment);
  const integrated = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    ...makeMe.aPublishedIntegration
      .with({ publishedTip: continuation, branch })
      .please(),
    ...(landingContext ? { landingContext } : {}),
  });
  assert.equal(integrated.classification, "published");
  return {
    fixture,
    origin,
    execution,
    nativeId,
    trunk,
    increment,
    continuation,
    integrated,
    landingContext,
  };
}

// The record stage as story-branch-integration.md has the agent run it.
async function recordThroughCli(s) {
  const args = [
    join(
      s.execution,
      ".agents/skills/dough-story-wrap-up/scripts/story-branch-session-record.mjs",
    ),
    "record",
    "--workspace",
    s.execution,
    "--published-tip",
    s.continuation,
    "--integrated-sha",
    s.integrated.acceptedSha,
    "--branch",
    branch,
    ...(s.landingContext ? ["--landing-context", s.landingContext] : []),
  ];
  const run = await promisify(execFile)(process.execPath, args, {
    cwd: s.execution,
    env: s.fixture.env,
  }).catch((error) => error);
  return {
    code: run.code ?? 0,
    result: JSON.parse(run.stdout.trim().split("\n").at(-1)),
  };
}

// Dough Land's installed retirement with the guidance's containment.
const retire = (s, contained) =>
  runRetirementCommand({
    repository: s.fixture.integration,
    worktree: s.execution,
    branch,
    createdForWork: true,
    remoteBranch: branch,
    contained: [s.integrated.acceptedSha, ...contained],
  });

async function defaultBranchClone(t, origin) {
  const parent = mkdtempSync(join(tmpdir(), "story-record-reader-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const clone = join(parent, "clone");
  await promisify(execFile)("git", [
    "clone",
    "--quiet",
    "--no-local",
    "--single-branch",
    origin,
    clone,
  ]);
  return async (...args) => (await git(clone, ...args)).stdout.trim();
}

async function retireAndClone(t, s, recordSha) {
  const retired = await retire(s, [recordSha]);
  assert.equal(retired.code, 0, JSON.stringify(retired.result));
  assert.equal(retired.result.remoteBranch, "removed");
  return defaultBranchClone(t, s.origin);
}

test("a launched story-branch session's record keeps its branch pairs once under the launch reference after integration and branch deletion", async (t) => {
  const receiver = await landingReceiver(t);
  const landingContext = await landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
  const s = await integrateStoryBranch(t, { landingContext });
  const { code, result } = await recordThroughCli(s);
  assert.equal(code, 0, JSON.stringify(result));
  const { record } = result;
  const read = await retireAndClone(t, s, record.sha);

  assert.equal(await read("rev-parse", "HEAD"), record.sha);
  assert.equal(await read("rev-parse", "HEAD^"), s.integrated.acceptedSha);
  const path = sessionRecordPathBeside(
    ".planning/PRODUCT-BACKLOG.md",
    reportingReference,
  );
  assert.deepEqual(
    (await read("show", "--name-only", "--format=", "HEAD")).split("\n"),
    [path],
  );
  const published = JSON.parse(await read("show", `HEAD:${path}`));
  assert.equal(published.sessionId, reportingReference);
  assert.deepEqual(published.ranges, [
    { base: s.trunk, candidate: s.increment },
    { base: s.increment, candidate: s.continuation },
  ]);
  for (const { base, candidate } of published.ranges)
    for (const sha of [base, candidate])
      await read("cat-file", "-e", `${sha}^{commit}`);
});

test("a refused record push stops at the record stage, holds retirement, and the rerun publishes one record", async (t) => {
  const s = await integrateStoryBranch(t);
  const armed = join(s.origin, "refuse-records");
  writeFileSync(armed, "");
  writeFileSync(
    join(s.origin, "hooks", "pre-receive"),
    `#!/bin/sh\n[ -e "${armed}" ] && exit 1\nexit 0\n`,
    { mode: 0o755 },
  );

  const stopped = await recordThroughCli(s);
  assert.equal(stopped.code, 1);
  assert.equal(stopped.result.stopped, "record", JSON.stringify(stopped));
  assert.match(stopped.result.recovery, /rerun the same record command/);
  const held = await retire(s, [await revParse(s.execution, "HEAD")]);
  assert.notEqual(held.result.worktree, "removed", JSON.stringify(held.result));
  assert.equal(held.result.reason, "unique unpublished work");

  rmSync(armed);
  const rerun = await recordThroughCli(s);
  assert.equal(rerun.code, 0, JSON.stringify(rerun.result));
  const read = await retireAndClone(t, s, rerun.result.record.sha);
  const added = await read(
    "log",
    "--diff-filter=A",
    "--name-only",
    "--format=",
    "--",
    ".planning/sessions",
  );
  assert.deepEqual(added.split("\n"), [
    sessionRecordPathBeside(".planning/PRODUCT-BACKLOG.md", s.nativeId),
  ]);
});
