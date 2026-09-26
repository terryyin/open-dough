// Admission of a story no backlog list held survives interrupted, uncertain
// and racing publication through the same startup recovery as queued work:
// remote trunk ends with one canonical story and one owned Taken claim, or
// the start stops with its candidate preserved.
import assert from "node:assert/strict";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { createQueuedTrunk } from "./workspace-publication-fixtures.mjs";
import {
  appendSiblingElsewhere,
  assertAdmittedOnce,
  draftLateStory,
  pushFromElsewhere,
  storySection,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  assertPublishedAgent,
  holdFirstPush,
  interruptFirstPush,
  lostPushResponse,
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

test("an interrupted admission resumes its preserved candidate onto trunk that gained a sibling story", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const story = draftLateStory(trunk);
  await interruptFirstPush(trunk);
  const interrupted = await startProcess(trunk, "a", story.identity, story.args)
    .result;
  assert.equal(interrupted.receipt.status, "unpublished");
  const { recovery } = interrupted.receipt;
  assert.equal(
    recovery.candidateSha,
    await revParse(interrupted.workspace, "HEAD"),
  );
  // Later drafting stays local; resume publishes the preserved candidate.
  writeDraft(trunk, story.planPath, "# Late plan\n\nRedrafted.\n");
  const sibling = await appendSiblingElsewhere(trunk, story.seedPath, "next");
  const resumed = await startProcess(trunk, "a", story.identity, [
    ...story.args,
    ...resumeArgs(recovery),
  ]).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  const sha = resumed.receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  assert.equal(await revParse(trunk.origin, `${sha}^`), sibling);
  await assertAdmittedOnce(trunk, sha, story, "publisher-a");
  assert.match(
    (await git(trunk.origin, "show", `${sha}:${story.seedPath}`)).stdout,
    /<a id="next"><\/a>/,
  );
  assert.deepEqual(resumed.receipt.admitted, [story.seedPath, story.planPath]);
  assert.equal(resumed.receipt.agent, "Yui-chan");
  await git(resumed.workspace, "fetch", "origin");
  await assertPublishedAgent(resumed.workspace, "Yui", story.identity);
});

test("an admission accepted behind a lost response resumes as owned without another claim", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const story = draftLateStory(trunk);
  const first = await startProcess(
    trunk,
    "a",
    story.identity,
    story.args,
    lostPushResponse(trunk),
  ).result;
  assert.equal(first.receipt.status, "resumed", JSON.stringify(first));
  const accepted = first.receipt.publishedSha;
  const descendant = await pushFromElsewhere(trunk, "trunk.txt", (text) =>
    text.concat("later\n"),
  );
  const resumed = await startProcess(trunk, "a", story.identity, [
    ...story.args,
    ...resumeArgs(first.receipt),
  ]).result;
  assert.equal(resumed.receipt.status, "resumed", JSON.stringify(resumed));
  assert.equal(resumed.receipt.publishedSha, accepted);
  assert.equal(resumed.receipt.plan, "slice-plans/late/PLAN.md");
  assert.equal(resumed.receipt.agent, "Yui-chan");
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), descendant);
  await assertAdmittedOnce(trunk, descendant, story, "publisher-a");
});

// Holds startup "a" admitting the late story at its first push while
// `rival` publishes, then returns a's result, what the rival published and
// the remote trunk tip.
async function admitDuringRival(trunk, story, rival) {
  const barrier = await holdFirstPush(trunk);
  const a = startProcess(trunk, "a", story.identity, story.args);
  await barrier.awaitArrival(a);
  const rivalSha = await rival();
  barrier.release();
  const result = await a.result;
  const tip = await lsRemoteSha(trunk.origin, "refs/heads/main");
  return { result, rivalSha, tip };
}

test("an admission racing a sibling story on trunk is reconciled onto it", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const story = draftLateStory(trunk);
  const { result, rivalSha, tip } = await admitDuringRival(trunk, story, () =>
    appendSiblingElsewhere(trunk, story.seedPath, "next"),
  );
  assert.equal(result.receipt.ok, true, JSON.stringify(result));
  assert.equal(result.receipt.publishedSha, tip);
  assert.equal(await revParse(trunk.origin, `${tip}^`), rivalSha);
  assert.match(
    (await git(trunk.origin, "show", `${tip}:${story.seedPath}`)).stdout,
    /<a id="next"><\/a>/,
  );
  await assertAdmittedOnce(trunk, tip, story, "publisher-a");
});

// Races the late story's admission with `rival`, asserts that the start
// stopped with its candidate preserved, the rival's trunk unchanged and the
// drafts untouched, and returns the stop's receipt and that trunk tip.
async function admissionStoppedBy(t, rival) {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const story = draftLateStory(trunk);
  const drafted = await git(trunk.integration, "status", "--porcelain");
  const { result, rivalSha, tip } = await admitDuringRival(trunk, story, () =>
    rival(trunk, story),
  );
  const { receipt } = result;
  assert.equal(tip, rivalSha);
  assert.equal(
    await revParse(result.workspace, "HEAD"),
    receipt.recovery.candidateSha,
  );
  assert.equal(
    (await git(trunk.integration, "status", "--porcelain")).stdout,
    drafted.stdout,
  );
  return { trunk, story, receipt, tip };
}

test("a rival admission of the same story stops the admission with its candidate preserved", async (t) => {
  const { trunk, story, receipt, tip } = await admissionStoppedBy(
    t,
    async (trunk, story) =>
      (await startProcess(trunk, "b", story.identity, story.args).result)
        .receipt.publishedSha,
  );
  assert.equal(receipt.status, "conflict", JSON.stringify(receipt));
  assert.equal(receipt.ownership, "other");
  await assertAdmittedOnce(trunk, tip, story, "publisher-b");
});

test("trunk drafting the same story differently stops the admission with its candidate preserved", async (t) => {
  const { trunk, story, receipt, tip } = await admissionStoppedBy(
    t,
    (trunk, story) =>
      pushFromElsewhere(
        trunk,
        story.seedPath,
        (text) =>
          `${text}\n${storySection("late", story.identity, "Late story", "Another goal.")}`,
      ),
  );
  assert.equal(receipt.status, "source-conflict", JSON.stringify(receipt));
  assert.equal(receipt.path, story.seedPath);
  assert.match(
    (await git(trunk.origin, "show", `${tip}:${story.seedPath}`)).stdout,
    /Another goal\./,
  );
});
