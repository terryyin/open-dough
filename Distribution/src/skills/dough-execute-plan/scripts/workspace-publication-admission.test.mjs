// Admission of accepted work that no backlog list holds yet, driven through
// the real startup CLI against a local bare remote: the canonical story (and
// a declared plan), its Taken entry and the agent profile reach remote trunk
// in one commit whose parent never listed the work.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  readyStoryState,
  storyB,
  storySeed,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";
import { ownedWorktreeOnly } from "./default-checkout-test-fixtures.mjs";
import {
  admitArgs,
  changedPaths,
  listed,
  neverQueued,
  remoteText,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import { readStoryState } from "../../dough-product-backlog/scripts/product-backlog-story-state.mjs";

test("a new seed's unselected investigation is admitted to Taken with its story and agent in one commit", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const identity = "SEED-N#slow-start";
  const link = "seeds/N.md#slow-start";
  const seed = withFacts(
    `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("slow-start", identity, "Investigate slow start", "Find why startup is slow.")}`,
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, ".planning/seeds/N.md", seed);
  writeFileSync(join(trunk.integration, "unrelated.txt"), "pending\n");
  const { receipt, workspace } = await startCliResult(
    trunk,
    "story-branch",
    admitArgs(identity, link, "Investigate slow start"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.admitted, [".planning/seeds/N.md"]);
  const sha = receipt.publishedSha;
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), sha);
  assert.equal(await revParse(trunk.origin, `${sha}^`), trunk.trunkSha);
  assert.equal(
    (await listed(trunk, `${sha}^`)).some((e) => e.identity === identity),
    false,
  );
  await neverQueued(trunk, sha, identity);
  assert.deepEqual(await changedPaths(trunk, sha), [
    "A\t.planning/agents/yui-chan.json",
    "A\t.planning/seeds/N.md",
    "M\t.planning/PRODUCT-BACKLOG.md",
  ]);
  assert.match(
    (await git(trunk.origin, "log", "-1", "--format=%s", sha)).stdout,
    /^Admit accepted work: SEED-N#slow-start/,
  );
  const taken = (await listed(trunk, sha)).filter((e) => e.list === "Taken");
  assert.deepEqual(
    taken.map((e) => [e.identity, e.title, e.href, e.plan]),
    [[identity, "Investigate slow start", link, undefined]],
  );
  const published = await remoteText(trunk, sha, ".planning/seeds/N.md");
  assert.equal(published, seed);
  const state = readStoryState(published, link);
  assert.equal(state.approach.kind, "unselected");
  assert.equal(state.assessment.status, "absent");
  const profile = JSON.parse(
    await remoteText(trunk, sha, ".planning/agents/yui-chan.json"),
  );
  assert.deepEqual(
    [profile.identity, profile.mode, profile.branch],
    [identity, "story-branch", "exec/story-branch"],
  );
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/exec/story-branch"),
    sha,
  );
  // Only the redundant draft is withdrawn; unrelated edits defer refresh.
  assert.deepEqual(receipt.maintenance, {
    result: "deferred",
    reason: "pending-edit",
  });
  assert.equal(
    existsSync(join(trunk.integration, ".planning/seeds/N.md")),
    false,
  );
  assert.equal(
    readFileSync(join(trunk.integration, "unrelated.txt"), "utf8"),
    "pending\n",
  );
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(await revParse(workspace, "HEAD"), sha);
});

test("admitting a new seed from an otherwise clean default checkout refreshes it without a draft", async (t) => {
  const trunk = await materializeRepository(queuedReadyRepository().please());
  t.after(trunk.cleanup);
  const identity = "SEED-N#slow";
  const link = "seeds/N.md#slow";
  const path = ".planning/seeds/N.md";
  const seed = withFacts(
    storySection("slow", identity, "Slow tests", "Speed up tests."),
    link,
    identity,
    "unselected",
  );
  writeDraft(trunk, path, seed);
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Slow tests"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.maintenance, { result: "advanced" });
  assert.equal(
    (await git(trunk.integration, "status", "--porcelain")).stdout,
    "",
  );
  assert.equal(readFileSync(join(trunk.integration, path), "utf8"), seed);
});

const tidy = makeMe.aBacklogEntry
  .with({ identity: "SEED-B#tidy", href: "seeds/B.md#tidy", title: "Tidy B" })
  .please();
const tidyAdmission = admitArgs(tidy.identity, tidy.href, tidy.title);
const unlistedTidyRepository = queuedReadyRepository()
  .withRevision("unlisted-tidy", {
    message: "story tidy",
    files: {
      ".planning/seeds/B.md": `${storySeed(storyB, "Execute B.")}\n${storySection("tidy", tidy.identity, tidy.title, "Tidy the B wording.")}`,
    },
    storyStates: [
      readyStoryState(storyB),
      {
        identity: tidy.identity,
        href: tidy.href,
        ...makeMe.aStoryPreparation
          .with({ refinement: "refined", approach: "planless" })
          .please(),
      },
    ],
  })
  .please();
const claimOnly = [
  "A\t.planning/agents/yui-chan.json",
  "M\t.planning/PRODUCT-BACKLOG.md",
];

test("an already published, unlisted planless story is admitted without rewriting its home", async (t) => {
  const trunk = await materializeRepository(unlistedTidyRepository);
  t.after(trunk.cleanup);
  const base = trunk.revisions["unlisted-tidy"];
  const { receipt } = await startCliResult(trunk, "trunk", tidyAdmission);
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.admitted, []);
  assert.equal(await revParse(trunk.origin, `${receipt.publishedSha}^`), base);
  assert.deepEqual(await changedPaths(trunk, receipt.publishedSha), claimOnly);
  assert.deepEqual(receipt.maintenance, { result: "advanced" });
});

test("without a default checkout, an owned worktree admits only the published story", async (t) => {
  const trunk = await materializeRepository(unlistedTidyRepository);
  t.after(trunk.cleanup);
  const base = trunk.revisions["unlisted-tidy"];
  const owned = await ownedWorktreeOnly(trunk, "owned-tidy", "exec/owned-tidy");
  const { receipt, stdout } = await startCliResult(
    trunk,
    "story-branch",
    tidyAdmission,
    { integration: null, workspace: owned.workspace, branch: owned.branch },
  );
  assert.equal(receipt.status, "published", stdout);
  assert.deepEqual(receipt.admitted, []);
  const sha = receipt.publishedSha;
  assert.equal(await revParse(trunk.origin, `${sha}^`), base);
  assert.deepEqual(await changedPaths(trunk, sha), claimOnly);
  assert.deepEqual(receipt.maintenance, { result: "not applicable" });
  assert.equal(
    await lsRemoteSha(trunk.origin, `refs/heads/${owned.branch}`),
    sha,
  );
});
