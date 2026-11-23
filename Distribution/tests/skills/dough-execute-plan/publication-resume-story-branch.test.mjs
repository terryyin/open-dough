// Git mechanics (not guidance-following): interrupted publication resumes
// against the recorded remote execution branch. Already-published work is
// not pushed again. An unpublished candidate is pushed only to that ref.
// Native agent recovery is not this file.
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../support/makeMe.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "./dashboard-landing-test-fixtures.mjs";
import { openFirstLandingExpectation } from "../../../src/skills/dough-execute-plan/scripts/first-landing-expectation.mjs";
import { managementContext } from "../../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { resumeInterruptedPublication } from "../../../src/skills/dough-execute-plan/scripts/publication-resume.mjs";
import {
  git,
  lsRemoteSha,
  pushExactRef,
  revParse,
} from "./publication-test-fixtures.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { trunkWithOneUnpublishedIncrement } from "./publication-clean-trunk-fixtures.mjs";

const storyTarget = "refs/heads/cursor/story-execution";

test("a retained Story Branch candidate already on that remote stays published and does not push trunk", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await materializeRepository(trunkWithOneUnpublishedIncrement);
  t.after(cleanup);
  const { origin: dashboard, requests } = await landingReceiver(t);
  const expectation = {
    repository: await managementContext(execution),
    workspace: execution,
    branch: "exec/story",
  };
  await landingContextFile(
    t,
    makeMe.aLandingContext
      .reportingTo(dashboard)
      .namingStory("SEED-1#story")
      .please(),
    expectation,
  );
  const originalExpectation = await openFirstLandingExpectation(expectation);

  await git(execution, "checkout", "-b", "other-story", trunkSha);
  writeFileSync(join(execution, "story-writer.txt"), "their story work\n");
  await git(execution, "add", "story-writer.txt");
  await git(execution, "commit", "-m", "another story increment");
  const storyBase = await revParse(execution, "HEAD");
  await pushExactRef(execution, storyBase, storyTarget);
  await git(execution, "checkout", "exec/story");
  await git(execution, "rebase", "--onto", storyBase, trunkSha, "exec/story");
  const rewrittenSha = await revParse(execution, "exec/story");
  assert.notEqual(rewrittenSha, candidateSha);
  await pushExactRef(execution, rewrittenSha, storyTarget);
  const comparison = makeMe.aRetainedComparison
    .with({ candidateSha: rewrittenSha, suffixBase: trunkSha })
    .please();

  const resumed = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    branch: "exec/story",
    ...comparison,
    defaultCheckout: integration,
    supersededShas: [candidateSha],
    targetRef: storyTarget,
  });

  assert.equal(resumed.classification, "already-published");
  assert.equal(resumed.pushCount, 0);
  assert.equal(resumed.acceptedSha, rewrittenSha);
  assert.equal(await lsRemoteSha(origin, storyTarget), rewrittenSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.deepEqual(
    await openFirstLandingExpectation(expectation),
    originalExpectation,
  );
  assert.deepEqual(requests, []);
  let preRebaseOnRemote = true;
  try {
    await git(
      execution,
      "merge-base",
      "--is-ancestor",
      candidateSha,
      "origin/cursor/story-execution",
    );
  } catch (error) {
    preRebaseOnRemote = false;
    assert.equal(error.code, 1);
  }
  assert.equal(preRebaseOnRemote, false);
});

test("an unpublished Story Branch candidate is pushed only to the recorded remote ref", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await materializeRepository(trunkWithOneUnpublishedIncrement);
  t.after(cleanup);
  const { origin: dashboard, requests } = await landingReceiver(t);
  const expectation = {
    repository: await managementContext(execution),
    workspace: execution,
    branch: "exec/story",
  };
  await landingContextFile(
    t,
    makeMe.aLandingContext
      .reportingTo(dashboard)
      .namingStory("SEED-1#story")
      .please(),
    expectation,
  );
  const originalExpectation = await openFirstLandingExpectation(expectation);
  const comparison = makeMe.aRetainedComparison
    .with({ candidateSha, suffixBase: trunkSha })
    .please();

  const published = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    branch: "exec/story",
    ...comparison,
    defaultCheckout: integration,
    targetRef: storyTarget,
  });

  assert.equal(published.classification, "not-on-remote");
  assert.equal(published.pushCount, 1);
  assert.equal(published.acceptedSha, candidateSha);
  assert.equal(await lsRemoteSha(origin, storyTarget), candidateSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.deepEqual(
    await openFirstLandingExpectation(expectation),
    originalExpectation,
  );
  assert.deepEqual(requests, []);
  assert.equal(await lsRemoteSha(origin, "refs/heads/exec/story"), "");

  const landed = await resumeInterruptedPublication({
    ownedWorkspace: execution,
    branch: "exec/story",
    ...comparison,
    targetRef: "refs/heads/main",
  });
  assert.equal(landed.acceptedSha, candidateSha);
  assert.equal(landed.landing.state, "recorded");
  assert.equal(await openFirstLandingExpectation(expectation), undefined);
  const capture = requests.find(({ url }) => url.endsWith("/landing"));
  assert.equal(capture.report.base, trunkSha);
  assert.equal(capture.report.revision, candidateSha);
});
