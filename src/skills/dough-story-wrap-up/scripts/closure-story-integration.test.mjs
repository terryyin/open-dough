// Git mechanics (not guidance-following), not proof an agent follows guidance.
// Story Branch closure publishes a history-preserving candidate from the owned
// workspace. The integration checkout's tip is not the published trunk commit.
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "../../dough-execute-plan/scripts/history-preserving-publication.mjs";
import {
  advanceOriginBacklog,
  backlogPath,
  itemA,
  itemB,
  itemC,
} from "../../dough-execute-plan/scripts/publication-racing-suffix-fixtures.mjs";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import { remoteHeads } from "../../dough-execute-plan/scripts/publication-test-fixtures.mjs";
import { isAncestor } from "../../dough-execute-plan/scripts/workspace-publication-ownership.mjs";
import {
  advanceOriginFromAnotherWriter,
  assertCheckoutUnchanged,
  authorizedRemote,
  captureCheckout,
  createCleanTrunkFixture,
  executionBranch,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  remoteCommitCount,
  revParse,
} from "./closure-git-fixtures.mjs";

import {
  prepareClosureDependencies,
  observeClosureDependency,
} from "./closure-dependency-test-fixtures.mjs";

import "./closure-story-fast-forward-cases.mjs";

const ancestorBacklog = backlogOf([itemA, itemB], [itemC]);
const storyBacklog = backlogOf([itemB], [itemC]);
const siblingBacklog = backlogOf([itemA], [itemC]);
const combinedBacklog = backlogOf([], [itemC]);

async function writeBacklog(workspace, body) {
  mkdirSync(join(workspace, ".planning"), { recursive: true });
  writeFileSync(join(workspace, backlogPath), body);
}

// The authorized remote and target: origin's main, or a named non-default
// remote and branch, which leaves origin untouched.
for (const [remote, branch] of [
  ["origin", "main"],
  ["upstream", "trunk"],
]) {
  test(`a racing advance of ${remote}/${branch} publishes one history-preserving candidate there and retries do not publish again`, async (t) => {
    const fixture = await createCleanTrunkFixture();
    t.after(fixture.cleanup);
    const { integration, execution } = fixture;
    const target = `refs/heads/${branch}`;
    const tracking = `${remote}/${branch}`;
    const remoteUrl = await authorizedRemote(fixture, remote, branch);
    const originHeads = await remoteHeads(fixture.origin);

    await writeBacklog(integration, ancestorBacklog);
    await git(integration, "add", backlogPath);
    await git(integration, "commit", "-m", "ancestor backlog");
    await git(integration, "push", remote, `HEAD:${target}`);
    await git(execution, "rebase", tracking);
    const dependencies = await prepareClosureDependencies(fixture);
    await writeBacklog(execution, storyBacklog);
    writeFileSync(join(execution, "closure.txt"), "story closure\n");
    await git(execution, "add", ".planning", "closure.txt");
    await git(execution, "commit", "-m", "story closure");
    const closureSha = await revParse(execution, "HEAD");
    await git(execution, "push", remote, `HEAD:refs/heads/${executionBranch}`);
    assert.equal(
      await lsRemoteSha(remoteUrl, `refs/heads/${executionBranch}`),
      closureSha,
    );

    const siblingSha = await advanceOriginBacklog(
      remoteUrl,
      siblingBacklog,
      "sibling backlog",
      branch,
    );
    writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
    await git(integration, "add", "unrelated.txt");
    await git(integration, "commit", "-m", "unrelated integration commit");
    await plantHumanEdit(integration);
    const integrationBefore = await captureCheckout(integration);
    const registered = [];
    const prepared = [];
    let racingSha;
    const commitsBefore = await remoteCommitCount(remoteUrl, target);
    const publish = (options) =>
      publishHistoryPreservingCandidate({
        ownedWorkspace: execution,
        publishedTip: closureSha,
        branch: executionBranch,
        remote,
        targetRef: target,
        register: (receipt) => registered.push(receipt),
        ...options,
      });

    const published = await publish({
      affectedCheck: async (sha) => {
        assert.equal(
          (await git(execution, "show", `${sha}:${backlogPath}`)).stdout,
          combinedBacklog,
        );
        assert.equal(
          (await git(execution, "show", `${sha}:closure.txt`)).stdout,
          "story closure\n",
        );
      },
      // Each attempt hands over its candidate and the fetched tip it was
      // built on before its push; another writer wins the first push.
      beforePush: async (comparison) => {
        prepared.push(comparison);
        if (comparison.attempt !== 0) return;
        racingSha = await advanceOriginFromAnotherWriter(remoteUrl, {
          file: "racing.txt",
          body: "racing trunk\n",
          message: "racing trunk advance",
          branch,
        });
      },
    });

    assert.equal(published.classification, "published");
    assert.equal(published.pushCount, 1);
    assert.equal(published.rejectedPushCount, 1);
    assert.equal(published.mergeCount, 2);
    assert.deepEqual(published.adapterStatuses, ["accepted", "accepted"]);
    assert.equal(published.receipt.target, target);
    assert.equal(published.receipt.sha, await lsRemoteSha(remoteUrl, target));
    assert.notEqual(published.receipt.sha, closureSha);
    assert.notEqual(published.receipt.sha, published.supersededSha);
    assert.deepEqual(prepared, [
      {
        attempt: 0,
        candidate: published.supersededSha,
        suffixBase: siblingSha,
      },
      { attempt: 1, candidate: published.receipt.sha, suffixBase: racingSha },
    ]);
    assert.equal("landing" in published, false);
    assert.equal(await isAncestor(execution, closureSha, tracking), true);
    assert.equal(
      await isAncestor(execution, published.supersededSha, tracking),
      false,
    );
    assert.equal(await isAncestor(execution, siblingSha, tracking), true);
    const parents = (
      await git(execution, "rev-parse", `${published.receipt.sha}^@`)
    ).stdout
      .trim()
      .split("\n");
    assert.equal(parents.includes(closureSha), true);
    const shown = async (path) =>
      (await git(execution, "show", `${published.receipt.sha}:${path}`)).stdout;
    assert.equal(await shown(backlogPath), combinedBacklog);
    assert.equal(await shown("closure.txt"), "story closure\n");
    assert.equal(await shown("racing.txt"), "racing trunk\n");
    assert.equal(await shown("trunk.txt"), "base\n");
    const publishedTree = (
      await git(remoteUrl, "ls-tree", "-r", "--name-only", target)
    ).stdout;
    assert.equal(publishedTree.includes("unrelated.txt"), false);
    assert.equal(publishedTree.includes("human-staged.txt"), false);
    assert.equal(publishedTree.includes("human-unstaged.txt"), false);
    assert.equal(await messageCount(remoteUrl, target, "story closure"), 1);
    assert.deepEqual(registered, [published.receipt]);
    assert.notEqual(await revParse(integration, "HEAD"), published.receipt.sha);
    assertCheckoutUnchanged(
      integrationBefore,
      await captureCheckout(integration),
    );
    assert.match(
      (await git(execution, "check-attr", "merge", "--", backlogPath)).stdout,
      /merge: dough-product-backlog/,
    );
    assert.equal(
      (await git(execution, "branch", "--show-current")).stdout.trim(),
      executionBranch,
    );

    const resolved = await observeClosureDependency(
      fixture,
      dependencies,
      published.receipt,
      remote,
      branch,
    );
    const commitsAfter = await remoteCommitCount(remoteUrl, target);
    assert.notEqual(commitsAfter, commitsBefore);
    const retry = await publish({});
    assert.deepEqual(
      await observeClosureDependency(
        fixture,
        dependencies,
        published.receipt,
        remote,
        branch,
      ),
      resolved,
    );
    assert.equal(retry.classification, "already-accepted");
    assert.equal(retry.mergeCount, 0);
    assert.equal(retry.pushCount, 0);
    assert.equal(retry.rejectedPushCount, 0);
    assert.equal(await remoteCommitCount(remoteUrl, target), commitsAfter);
    assert.equal(await lsRemoteSha(remoteUrl, target), published.receipt.sha);
    assert.equal(registered.length, 1);
    assertCheckoutUnchanged(
      integrationBefore,
      await captureCheckout(integration),
    );
    if (remote !== "origin") {
      assert.deepEqual(await remoteHeads(fixture.origin), originHeads);
    }
  });
}
