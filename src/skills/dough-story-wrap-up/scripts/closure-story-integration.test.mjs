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
import {
  advanceOriginFromAnotherWriter,
  ancestorOf,
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  createClosureObserver,
  executionBranch,
  git,
  lsRemoteSha,
  messageCount,
  plantHumanEdit,
  remoteCommitCount,
  revParse,
  trunkTarget,
} from "./closure-publication-fixtures.mjs";

const ancestorBacklog = backlogOf([itemA, itemB], [itemC]);
const storyBacklog = backlogOf([itemB], [itemC]);
const siblingBacklog = backlogOf([itemA], [itemC]);
const combinedBacklog = backlogOf([], [itemC]);

async function writeBacklog(workspace, body) {
  mkdirSync(join(workspace, ".planning"), { recursive: true });
  writeFileSync(join(workspace, backlogPath), body);
}

test("a racing trunk advance publishes one history-preserving candidate and retries do not publish again", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;

  await writeBacklog(integration, ancestorBacklog);
  await git(integration, "add", backlogPath);
  await git(integration, "commit", "-m", "ancestor backlog");
  await git(integration, "push", "origin", "main");
  await git(execution, "rebase", "origin/main");
  await writeBacklog(execution, storyBacklog);
  writeFileSync(join(execution, "closure.txt"), "story closure\n");
  await git(execution, "add", backlogPath, "closure.txt");
  await git(execution, "commit", "-m", "story closure");
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  assert.equal(
    await lsRemoteSha(origin, `refs/heads/${executionBranch}`),
    closureSha,
  );

  const siblingSha = await advanceOriginBacklog(
    origin,
    siblingBacklog,
    "sibling backlog",
  );
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const observer = createClosureObserver(execution);
  const commitsBefore = await remoteCommitCount(origin);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
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
    beforePush: async () => {
      await advanceOriginFromAnotherWriter(origin, {
        file: "racing.txt",
        body: "racing trunk\n",
        message: "racing trunk advance",
      });
    },
    register: (receipt) => observer.register(receipt.sha, receipt.target),
  });

  assert.equal(published.classification, "published");
  assert.equal(published.pushCount, 1);
  assert.equal(published.rejectedPushCount, 1);
  assert.equal(published.mergeCount, 2);
  assert.deepEqual(published.adapterStatuses, ["accepted", "accepted"]);
  assert.equal(published.receipt.target, trunkTarget);
  assert.equal(published.receipt.sha, await lsRemoteSha(origin, trunkTarget));
  assert.notEqual(published.receipt.sha, closureSha);
  assert.notEqual(published.receipt.sha, published.supersededSha);
  assert.equal(await ancestorOf(execution, closureSha, "origin/main"), true);
  assert.equal(
    await ancestorOf(execution, published.supersededSha, "origin/main"),
    false,
  );
  assert.equal(await ancestorOf(execution, siblingSha, "origin/main"), true);
  const parents = (
    await git(execution, "rev-parse", `${published.receipt.sha}^@`)
  ).stdout
    .trim()
    .split("\n");
  assert.equal(parents.includes(closureSha), true);
  assert.equal(
    (await git(execution, "show", `${published.receipt.sha}:${backlogPath}`))
      .stdout,
    combinedBacklog,
  );
  assert.equal(
    (await git(execution, "show", `${published.receipt.sha}:closure.txt`))
      .stdout,
    "story closure\n",
  );
  assert.equal(
    (await git(execution, "show", `${published.receipt.sha}:racing.txt`))
      .stdout,
    "racing trunk\n",
  );
  assert.equal(
    (await git(execution, "show", `${published.receipt.sha}:trunk.txt`)).stdout,
    "base\n",
  );
  const publishedTree = (
    await git(origin, "ls-tree", "-r", "--name-only", trunkTarget)
  ).stdout;
  assert.equal(publishedTree.includes("unrelated.txt"), false);
  assert.equal(publishedTree.includes("human-staged.txt"), false);
  assert.equal(publishedTree.includes("human-unstaged.txt"), false);
  assert.equal(await messageCount(origin, trunkTarget, "story closure"), 1);
  assert.equal(
    observer.receipts.some(
      (receipt) => receipt.sha === published.supersededSha,
    ),
    false,
  );
  assert.deepEqual(observer.receipts, [published.receipt]);
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

  const commitsAfter = await remoteCommitCount(origin);
  assert.notEqual(commitsAfter, commitsBefore);
  const retry = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
    register: (receipt) => observer.register(receipt.sha, receipt.target),
  });
  assert.equal(retry.classification, "already-accepted");
  assert.equal(retry.mergeCount, 0);
  assert.equal(retry.pushCount, 0);
  assert.equal(retry.rejectedPushCount, 0);
  assert.equal(await remoteCommitCount(origin), commitsAfter);
  assert.equal(await lsRemoteSha(origin, trunkTarget), published.receipt.sha);
  assert.equal(observer.receipts.length, 1);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );
});

test("a fast-forward story tip is the trunk receipt and a later retry does not publish", async (t) => {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { origin, integration, execution } = fixture;
  const closureSha = await revParse(execution, "HEAD");
  await git(execution, "push", "origin", `HEAD:refs/heads/${executionBranch}`);
  writeFileSync(join(integration, "unrelated.txt"), "unrelated checkout\n");
  await git(integration, "add", "unrelated.txt");
  await git(integration, "commit", "-m", "unrelated integration commit");
  await plantHumanEdit(integration);
  const integrationBefore = await captureCheckout(integration);
  const commitsBefore = await remoteCommitCount(origin);

  const published = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });
  assert.equal(published.classification, "published");
  assert.equal(published.mergeCount, 1);
  assert.equal(published.pushCount, 1);
  assert.equal(published.rejectedPushCount, 0);
  assert.deepEqual(published.adapterStatuses, []);
  assert.equal(published.supersededSha, null);
  assert.equal(published.receipt.sha, closureSha);
  assert.equal(published.receipt.target, trunkTarget);
  assert.equal(await lsRemoteSha(origin, trunkTarget), closureSha);
  assert.equal(await ancestorOf(execution, closureSha, "origin/main"), true);
  const publishedTree = (
    await git(origin, "ls-tree", "-r", "--name-only", trunkTarget)
  ).stdout;
  assert.equal(publishedTree.includes("unrelated.txt"), false);
  assert.equal(publishedTree.includes("human-staged.txt"), false);
  assert.equal(publishedTree.includes("increment.txt"), true);
  assert.notEqual(await revParse(integration, "HEAD"), closureSha);
  assertCheckoutUnchanged(
    integrationBefore,
    await captureCheckout(integration),
  );

  const retry = await publishHistoryPreservingCandidate({
    ownedWorkspace: execution,
    publishedTip: closureSha,
    branch: executionBranch,
  });
  assert.equal(retry.classification, "already-accepted");
  assert.equal(retry.mergeCount, 0);
  assert.equal(retry.pushCount, 0);
  assert.equal(await remoteCommitCount(origin), commitsBefore + 1);
  assert.equal(await lsRemoteSha(origin, trunkTarget), closureSha);
});
