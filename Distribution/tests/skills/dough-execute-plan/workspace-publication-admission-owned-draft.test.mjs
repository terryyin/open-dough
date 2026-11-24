import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { queuedReadyRepository } from "../../support/queued-repository.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { readStoryState } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import {
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  draftLateStory,
  listed,
  neverQueued,
  pushFromElsewhere,
  remoteText,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  assertPublishedAgent,
  holdFirstPush,
  interruptFirstPush,
  lostPushResponse,
  resumeArgs,
  startProcess,
} from "./workspace-publication-startup-test-fixtures.mjs";

const startCli = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/execution-start.mjs",
    import.meta.url,
  ),
);
const remoteTip = (trunk) => lsRemoteSha(trunk.origin, "refs/heads/main");
const retainedArgs = ({ link, title, ownedDraft }, repository) => [
  "--admit",
  "--link",
  link,
  "--title",
  title,
  "--owned-draft",
  JSON.stringify(ownedDraft),
  "--integration",
  "",
  "--repository",
  repository,
];
const seedPathOf = ({ link }) => `.planning/${link.split("#")[0]}`;

async function draft(trunk, title, goal) {
  const { stdout } = await exec(process.execPath, [
    startCli,
    "draft",
    "--repository",
    trunk.integration,
    "--remote",
    "origin",
    "--target",
    "main",
    "--title",
    title,
    "--goal",
    goal,
  ]);
  return JSON.parse(stdout);
}

async function assertOwnedAdmission(trunk, sha, story) {
  const seed = await remoteText(trunk, sha, seedPathOf(story));
  assert.equal(seed.split("**Identity:**").length, 2);
  assert.ok(seed.includes(`**Identity:** ${story.identity}`));
  assert.ok(seed.includes(`**Goal:** ${story.ownedDraft.goal}`));
  const preparation = readStoryState(seed, story.link);
  assert.equal(preparation.identity, story.identity);
  assert.equal(preparation.approach.kind, "unselected");
  assert.equal(preparation.refinement, "not-refined");
  assert.equal(preparation.assessment.status, "absent");
  const entries = (await listed(trunk, sha)).filter(
    ({ identity }) => identity === story.identity,
  );
  assert.deepEqual(
    entries.map(({ list, href, title }) => [list, href, title]),
    [["Taken", story.link, story.title]],
  );
  await neverQueued(trunk, sha, story.identity);
}

const queueAt = async (trunk, sha) =>
  (await listed(trunk, sha))
    .filter(({ list }) => list === "Backlog list")
    .map(({ identity }) => identity);

async function fixture(t) {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  return trunk;
}

test("a published owned draft survives a lost admission response beside an untouched default checkout", async (t) => {
  const trunk = await fixture(t);
  const retired = ".planning/seeds/SEED-008-past.md";
  await pushFromElsewhere(trunk, retired, () => "---\nid: SEED-008\n---\n");
  const elsewhere = join(trunk.fixture, "elsewhere");
  await git(elsewhere, "rm", retired);
  await git(elsewhere, "commit", "-qm", "Retire seed eight");
  await git(elsewhere, "push", "-q", "origin", "HEAD:main");
  const base = await remoteTip(trunk);
  const initialHead = await revParse(trunk.integration, "HEAD");
  writeFileSync(join(trunk.integration, "trunk.txt"), "staged draft\n");
  await git(trunk.integration, "add", "trunk.txt");
  writeFileSync(join(trunk.integration, "trunk.txt"), "unstaged draft\n");
  writeFileSync(join(trunk.integration, "notes.txt"), "private notes\n");
  const initialStatus = await git(trunk.integration, "status", "--porcelain");
  const story = await draft(
    trunk,
    "Improve the preview",
    "Make the preview clear.",
  );
  assert.equal(story.status, "drafted");
  assert.equal(story.ownedDraft.basis, base);
  assert.equal(story.identity, "SEED-009#ad-hoc-work");
  assert.equal(await remoteTip(trunk), base);
  assert.equal(await remoteText(trunk, base, seedPathOf(story)), null);
  const args = retainedArgs(story, trunk.integration);
  const first = await startProcess(
    trunk,
    "a",
    story.identity,
    args,
    lostPushResponse(trunk),
  ).result;
  assert.equal(first.receipt.status, "resumed", JSON.stringify(first));
  await assertOwnedAdmission(trunk, first.receipt.publishedSha, story);
  assert.deepEqual(
    await queueAt(trunk, first.receipt.publishedSha),
    await queueAt(trunk, base),
  );
  await assertPublishedAgent(first.workspace, "Yui", story.identity);
  assert.equal(
    await remoteText(trunk, first.receipt.publishedSha, "notes.txt"),
    null,
  );
  assert.equal(
    await remoteText(trunk, first.receipt.publishedSha, "trunk.txt"),
    await remoteText(trunk, base, "trunk.txt"),
  );
  const retried = await startProcess(trunk, "a", story.identity, [
    ...args,
    ...resumeArgs(first.receipt),
  ]).result;
  assert.equal(retried.receipt.status, "resumed", JSON.stringify(retried));
  assert.equal(retried.receipt.publishedSha, first.receipt.publishedSha);
  assert.equal(await remoteTip(trunk), first.receipt.publishedSha);
  assert.equal(await revParse(trunk.integration, "HEAD"), initialHead);
  assert.deepEqual(
    await git(trunk.integration, "status", "--porcelain"),
    initialStatus,
  );
});

test("an interrupted admission publishes neither the draft nor Taken and resumes its candidate across an unrelated trunk edit", async (t) => {
  const trunk = await fixture(t);
  const base = await remoteTip(trunk);
  const story = await draft(
    trunk,
    "Keep the draft",
    "Resume exactly this work.",
  );
  const args = retainedArgs(story, trunk.integration);
  await interruptFirstPush(trunk);
  const first = await startProcess(trunk, "a", story.identity, args).result;
  assert.equal(first.receipt.status, "unpublished", JSON.stringify(first));
  assert.equal(await remoteTip(trunk), base);
  assert.equal(await remoteText(trunk, base, seedPathOf(story)), null);
  assert.ok(
    !(await listed(trunk, base)).some(
      ({ identity }) => identity === story.identity,
    ),
  );
  const newer = await pushFromElsewhere(trunk, "trunk.txt", (text) =>
    text.concat("newer\n"),
  );
  const changedArgs = retainedArgs(
    { ...story, ownedDraft: { ...story.ownedDraft, goal: "Different work." } },
    trunk.integration,
  );
  const rejected = await startProcess(trunk, "a", story.identity, [
    ...changedArgs,
    ...resumeArgs(first.receipt.recovery),
  ]).result;
  assert.equal(
    rejected.receipt.status,
    "source-refused",
    JSON.stringify(rejected),
  );
  assert.match(
    rejected.receipt.error,
    /disagrees with the retained admission candidate/,
  );
  assert.equal(await remoteTip(trunk), newer);
  assert.equal(
    await revParse(first.workspace, "HEAD"),
    first.receipt.recovery.candidateSha,
  );
  const resumed = await startProcess(trunk, "a", story.identity, [
    ...args,
    ...resumeArgs(first.receipt.recovery),
  ]).result;
  assert.equal(resumed.receipt.ok, true, JSON.stringify(resumed));
  const accepted = await remoteTip(trunk);
  assert.equal(await revParse(trunk.origin, `${accepted}^`), newer);
  await assertOwnedAdmission(trunk, accepted, story);
});

test("an owned admission preserves an independently admitted sibling and its assignment", async (t) => {
  const trunk = await fixture(t);
  const base = await remoteTip(trunk);
  const story = await draft(trunk, "Independent work", "Keep both admissions.");
  const sibling = draftLateStory(trunk);
  const barrier = await holdFirstPush(trunk);
  const attempt = startProcess(
    trunk,
    "a",
    story.identity,
    retainedArgs(story, trunk.integration),
  );
  await barrier.awaitArrival(attempt);
  const other = await startProcess(trunk, "b", sibling.identity, sibling.args)
    .result;
  assert.equal(other.receipt.ok, true, JSON.stringify(other));
  barrier.release();
  const admitted = await attempt.result;
  assert.equal(admitted.receipt.ok, true, JSON.stringify(admitted));
  const accepted = await remoteTip(trunk);
  assert.equal(
    await revParse(trunk.origin, `${accepted}^`),
    other.receipt.publishedSha,
  );
  await assertOwnedAdmission(trunk, accepted, story);
  assert.deepEqual(await queueAt(trunk, accepted), await queueAt(trunk, base));
  assert.ok(
    (await listed(trunk, accepted)).some(
      ({ identity, list }) => identity === sibling.identity && list === "Taken",
    ),
  );
  await assertPublishedAgent(admitted.workspace, "Yui", sibling.identity);
  assert.ok(admitted.receipt.agent !== other.receipt.agent);
});

test("a published use of the selected seed number refuses a fresh admission without creating a workspace", async (t) => {
  const trunk = await fixture(t);
  const story = await draft(
    trunk,
    "Retain my identity",
    "Keep the allocation on conflict.",
  );
  const seed = story.identity.split("#")[0];
  const occupied = await pushFromElsewhere(
    trunk,
    `.planning/seeds/${seed}-elsewhere.md`,
    () => `---\nid: ${seed}\n---\n\n# Rival seed\n`,
  );
  const attempted = await startProcess(
    trunk,
    "a",
    story.identity,
    retainedArgs(story, trunk.integration),
  ).result;
  assert.equal(
    attempted.receipt.status,
    "source-refused",
    JSON.stringify(attempted),
  );
  assert.match(attempted.receipt.error, /already been used/);
  assert.ok(!existsSync(attempted.workspace));
  assert.equal(await remoteTip(trunk), occupied);
  assert.equal(await remoteText(trunk, occupied, seedPathOf(story)), null);
  assert.ok(
    !(await listed(trunk, occupied)).some(
      ({ identity }) => identity === story.identity,
    ),
  );
});

test("the losing attempt at the same draft allocation cannot resume the winning claim", async (t) => {
  const trunk = await fixture(t);
  const first = await draft(
    trunk,
    "First admission",
    "Admit the first request.",
  );
  const second = await draft(
    trunk,
    "Second admission",
    "Admit the second request.",
  );
  assert.equal(first.identity, second.identity);
  const barrier = await holdFirstPush(trunk);
  const args = retainedArgs(first, trunk.integration);
  const contender = startProcess(trunk, "a", first.identity, args);
  await barrier.awaitArrival(contender);
  const winner = await startProcess(
    trunk,
    "b",
    second.identity,
    retainedArgs(second, trunk.integration),
  ).result;
  assert.equal(winner.receipt.ok, true, JSON.stringify(winner));
  barrier.release();
  const lost = await contender.result;
  assert.equal(lost.receipt.status, "conflict", JSON.stringify(lost));
  assert.equal(lost.receipt.ownership, "other");
  const retried = await startProcess(trunk, "a", first.identity, [
    ...args,
    ...resumeArgs(lost.receipt.recovery),
  ]).result;
  assert.equal(retried.receipt.status, "conflict", JSON.stringify(retried));
  assert.equal(retried.receipt.ownership, "other");
  assert.equal(await remoteTip(trunk), winner.receipt.publishedSha);
  await assertOwnedAdmission(trunk, winner.receipt.publishedSha, second);
  const next = await draft(trunk, first.title, first.ownedDraft.goal);
  assert.notEqual(next.identity, first.identity);
  assert.equal(next.ownedDraft.basis, winner.receipt.publishedSha);
});
