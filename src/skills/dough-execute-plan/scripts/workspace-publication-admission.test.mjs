// Admission of accepted work that no backlog list holds yet, driven through
// the real startup CLI against a local bare remote: the canonical story (and
// a declared plan), its Taken entry and the agent profile reach remote trunk
// in one commit whose parent never listed the work.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha, revParse } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
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
  const trunk = await createQueuedTrunk();
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
  // The default checkout keeps its draft and other edits; refresh defers.
  assert.deepEqual(receipt.maintenance, {
    result: "deferred",
    reason: "pending-edit",
  });
  assert.equal(
    readFileSync(join(trunk.integration, ".planning/seeds/N.md"), "utf8"),
    seed,
  );
  assert.equal(
    readFileSync(join(trunk.integration, "unrelated.txt"), "utf8"),
    "pending\n",
  );
  assert.equal(await revParse(trunk.integration, "HEAD"), trunk.trunkSha);
  assert.equal(await revParse(workspace, "HEAD"), sha);
});

test("an already published, unlisted planless story is admitted without rewriting its home", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-B#tidy";
  const link = "seeds/B.md#tidy";
  const seedPath = ".planning/seeds/B.md";
  const seed = withFacts(
    `${readFileSync(join(trunk.integration, seedPath), "utf8")}\n${storySection("tidy", identity, "Tidy B", "Tidy the B wording.")}`,
    link,
    identity,
    "planless",
  );
  writeFileSync(join(trunk.integration, seedPath), seed);
  await git(trunk.integration, "commit", "-qam", "story tidy");
  await git(trunk.integration, "push", "-q", "origin", "main");
  const base = await revParse(trunk.integration, "HEAD");
  const { receipt } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Tidy B"),
  );
  assert.equal(receipt.status, "published", JSON.stringify(receipt));
  assert.deepEqual(receipt.admitted, []);
  assert.equal(await revParse(trunk.origin, `${receipt.publishedSha}^`), base);
  assert.deepEqual(await changedPaths(trunk, receipt.publishedSha), [
    "A\t.planning/agents/yui-chan.json",
    "M\t.planning/PRODUCT-BACKLOG.md",
  ]);
  assert.deepEqual(receipt.maintenance, { result: "advanced" });
});
