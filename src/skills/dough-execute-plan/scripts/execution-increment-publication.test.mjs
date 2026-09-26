// Git mechanics (not guidance-following): a validated increment or owned
// repair is published to the mode's authorized target. The receipt is the
// accepted SHA and that target. A repair pauses unfinished work through the
// CI repair stash CLI around that same publication. Native agent behavior is not this file.
import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { restoreRepairStash, saveRepairStash } from "./ci-repair-stash.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const recordedStoryBranch = "refs/heads/cursor/story-execution";

function receiptsOf() {
  const receipts = [];
  return {
    receipts,
    register(receipt) {
      receipts.push(receipt);
    },
  };
}

test("Story Branch Mode increment publishes to the recorded remote execution branch and leaves remote trunk unchanged", async (t) => {
  const { origin, integration, execution, trunkSha, candidateSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const before = await captureCheckout(integration);
  const observer = receiptsOf();

  const published = await publishExecutionIncrement({
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: recordedStoryBranch,
    register: observer.register,
  });

  assert.equal(published.receipt.sha, candidateSha);
  assert.deepEqual(observer.receipts, [
    { sha: candidateSha, target: recordedStoryBranch },
  ]);
  assert.equal(await lsRemoteSha(origin, recordedStoryBranch), candidateSha);
  assert.equal(await lsRemoteSha(origin, trunkTarget), trunkSha);
  assert.equal(await lsRemoteSha(origin, "refs/heads/exec/story"), "");
  assert.equal(await revParse(execution, "exec/story"), candidateSha);
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("an owned repair publishes without unfinished work and restores that work afterwards", async (t) => {
  const { origin, execution, trunkSha, cleanup } =
    await createCleanTrunkFixture();
  t.after(cleanup);

  const unfinished = "owned unfinished edit\n";
  writeFileSync(join(execution, "increment.txt"), `increment\n${unfinished}`);
  writeFileSync(
    join(execution, "unfinished-staged.txt"),
    "staged unfinished\n",
  );
  await git(execution, "add", "unfinished-staged.txt");
  writeFileSync(
    join(execution, "unfinished-untracked.txt"),
    "untracked unfinished\n",
  );

  const saved = await saveRepairStash({
    checkout: execution,
    label: "dough-execute-plan CI repair RUN_ID/ATTEMPT",
  });
  t.after(() =>
    rmSync(dirname(saved.record), { recursive: true, force: true }),
  );
  assert.equal(saved.status, "stashed");
  assert.equal(
    readFileSync(join(execution, "increment.txt"), "utf8"),
    "increment\n",
  );

  writeFileSync(join(execution, "repair.txt"), "owned repair\n");
  await git(execution, "add", "repair.txt");
  await git(execution, "commit", "-m", "owned repair");
  const repairSha = await revParse(execution, "HEAD");
  const observer = receiptsOf();

  const published = await publishExecutionIncrement({
    workspace: execution,
    branch: "exec/story",
    previouslyPublishedBase: trunkSha,
    targetRef: trunkTarget,
    register: observer.register,
  });

  assert.equal(published.receipt.sha, repairSha);
  assert.deepEqual(observer.receipts, [
    { sha: repairSha, target: trunkTarget },
  ]);
  assert.equal(await lsRemoteSha(origin, trunkTarget), repairSha);
  assert.equal(
    (await git(execution, "show", `${repairSha}:repair.txt`)).stdout,
    "owned repair\n",
  );
  assert.equal(
    (await git(execution, "show", `${repairSha}:increment.txt`)).stdout,
    "increment\n",
  );
  await assert.rejects(
    git(execution, "cat-file", "-e", `${repairSha}:unfinished-staged.txt`),
  );
  await assert.rejects(
    git(execution, "cat-file", "-e", `${repairSha}:unfinished-untracked.txt`),
  );

  const restored = await restoreRepairStash({ record: saved.record });
  assert.equal(restored.status, "resumed");
  assert.equal(
    readFileSync(join(execution, "increment.txt"), "utf8"),
    `increment\n${unfinished}`,
  );
  assert.equal(await revParse(execution, "HEAD"), repairSha);
  await assert.rejects(revParse(execution, "refs/stash"));
});
