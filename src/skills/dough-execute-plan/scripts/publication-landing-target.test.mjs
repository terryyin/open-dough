// An implicit first-trunk comparison belongs only to its publication target.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import {
  landingContextFile,
  landingReceiver,
} from "./dashboard-landing-test-fixtures.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { openFirstLandingExpectation } from "./first-landing-expectation.mjs";
import { managementContext } from "./publication-git.mjs";
import {
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
} from "./publication-test-fixtures.mjs";

for (const trunkTarget of ["refs/heads/main", "refs/heads/master"]) {
  test(`story publication preserves the pending ${trunkTarget} landing until matching trunk publication`, async (t) => {
    const { origin: dashboard, requests } = await landingReceiver(t);
    const { origin, execution, trunkSha, candidateSha, cleanup } =
      await createCleanTrunkFixture();
    t.after(cleanup);
    if (trunkTarget !== "refs/heads/main")
      await git(execution, "push", "origin", `${trunkSha}:${trunkTarget}`);
    const branch = "exec/story";
    const expectation = {
      repository: await managementContext(execution),
      workspace: execution,
      branch,
    };
    const contextFile = await landingContextFile(
      t,
      dashboard,
      "SEED-1#story",
      expectation,
    );
    const context = JSON.parse(await readFile(contextFile, "utf8"));
    await writeFile(
      contextFile,
      JSON.stringify({ ...context, target: trunkTarget }),
    );
    const originalExpectation = await openFirstLandingExpectation(expectation);
    const storyTarget = "refs/heads/cursor/story-execution";

    const story = await publishExecutionIncrement({
      workspace: execution,
      branch,
      previouslyPublishedBase: trunkSha,
      targetRef: storyTarget,
    });

    assert.equal(story.publication, "accepted");
    assert.equal(story.receipt.sha, candidateSha);
    assert.equal(await lsRemoteSha(origin, storyTarget), candidateSha);
    assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
    assert.deepEqual(
      await openFirstLandingExpectation(expectation),
      originalExpectation,
    );
    assert.deepEqual(requests, []);

    const trunk = await publishExecutionIncrement({
      workspace: execution,
      branch,
      previouslyPublishedBase: trunkSha,
      targetRef: trunkTarget,
    });

    assert.equal(trunk.ok, true);
    assert.equal(trunk.receipt.sha, candidateSha);
    assert.equal(trunk.landing.state, "recorded");
    assert.equal(await lsRemoteSha(origin, trunkTarget), candidateSha);
    assert.equal(await openFirstLandingExpectation(expectation), undefined);
    const capture = requests.find(({ url }) => url.endsWith("/landing"));
    assert.equal(capture.report.base, trunkSha);
    assert.equal(capture.report.revision, candidateSha);
    assert.equal(capture.report.reference, context.reference);
    assert.equal(capture.report.target, trunkTarget);
  });
}

test("an explicit incompatible landing context refuses story publication without consuming its expectation", async (t) => {
  const { origin: dashboard, requests } = await landingReceiver(t);
  const { origin, execution, trunkSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);
  const branch = "exec/story";
  const expectation = {
    repository: await managementContext(execution),
    workspace: execution,
    branch,
  };
  const landingContext = await landingContextFile(
    t,
    dashboard,
    "SEED-1#story",
    expectation,
  );
  const originalExpectation = await openFirstLandingExpectation(expectation);
  const targetRef = "refs/heads/cursor/story-execution";
  await assert.rejects(
    publishExecutionIncrement({
      workspace: execution,
      branch,
      previouslyPublishedBase: trunkSha,
      targetRef,
      landingContext,
    }),
    /Publication does not match the supplied landing context\./,
  );
  assert.equal(await lsRemoteSha(origin, targetRef), "");
  assert.equal(await lsRemoteSha(origin, "refs/heads/main"), trunkSha);
  assert.deepEqual(
    await openFirstLandingExpectation(expectation),
    originalExpectation,
  );
  assert.deepEqual(requests, []);
});
