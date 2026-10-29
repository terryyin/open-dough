// First trunk history-preserving publication resolves an open first-landing
// expectation when landingContext is omitted; later publish after clear takes
// none; no expectation stays a silent no-landing publish.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  landingContextFile,
  landingReceiver,
} from "./dashboard-landing-test-fixtures.mjs";
import { openFirstLandingExpectation } from "./first-landing-expectation.mjs";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { managementContext } from "./publication-git.mjs";
import {
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const executionBranch = "exec/story";

test("omitted landingContext retains landing from an open expectation, and a later publish after clear takes none", async (t) => {
  const { origin: dashboard, requests } = await landingReceiver(t);
  const { origin, execution, cleanup } = await createCleanTrunkFixture();
  t.after(cleanup);
  const publishedTip = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const repository = await managementContext(execution);
  const expectation = {
    repository,
    workspace: execution,
    branch: executionBranch,
  };
  await landingContextFile(t, dashboard, "SEED-1#story", expectation);
  const originalExpectation = await openFirstLandingExpectation(expectation);
  const intermediate = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip,
    branch: executionBranch,
    targetRef: `refs/heads/${executionBranch}`,
  });
  assert.equal("landing" in intermediate, false);
  assert.deepEqual(requests, []);
  assert.deepEqual(
    await openFirstLandingExpectation(expectation),
    originalExpectation,
  );

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip,
    branch: executionBranch,
  });
  assert.equal(published.classification, "published");
  assert.equal(published.landing.state, "recorded");
  assert.equal(await openFirstLandingExpectation(expectation), undefined);
  assert.equal(
    requests.some(({ url }) => url.endsWith("/landing")),
    true,
  );

  writeFileSync(join(execution, "repair.txt"), "repair\n");
  await git(execution, "add", "repair.txt");
  await git(execution, "commit", "-m", "repair");
  const repairTip = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  const requestsBefore = requests.length;

  const later = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: repairTip,
    branch: executionBranch,
  });
  assert.equal(later.classification, "published");
  assert.equal("landing" in later, false);
  assert.equal(requests.length, requestsBefore);
  assert.equal(await lsRemoteSha(origin, trunkTarget), later.receipt.sha);
});

test("history-preserving publish without an open expectation still takes no landing", async (t) => {
  const { origin: dashboard, requests } = await landingReceiver(t);
  const { execution, cleanup } = await createCleanTrunkFixture();
  t.after(cleanup);
  const publishedTip = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  // Prepared context exists but no expectation was planted for this workspace.
  await landingContextFile(t, dashboard, "SEED-1#story");

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip,
    branch: executionBranch,
  });
  assert.equal(published.classification, "published");
  assert.equal("landing" in published, false);
  assert.deepEqual(requests, []);
});
