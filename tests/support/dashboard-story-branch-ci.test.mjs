// The story-branch rule and the CI status judgment of a story branch over
// its trunk from GitHub Actions runs; a ciAdapter project's is in
// ./dashboard-story-branch-ci-adapter.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { judgeNearest } from "../../dashboard/server/baseCiNearest.ts";
import { storyBranchOf } from "../../dashboard/src/storyBranch.ts";

const owner = (mode, branch, profilePath = ".planning/agents/a.json") => ({
  profilePath,
  name: "a",
  agent: "A",
  host: undefined,
  model: undefined,
  human: { status: "loading" },
  mode,
  branch,
});

const recorded = (...assignments) => ({ status: "recorded", assignments });

test("the story-branch rule names each gap and the branch", () => {
  assert.deepEqual(storyBranchOf(undefined), { kind: "unknown" });
  assert.deepEqual(storyBranchOf({ status: "loading" }), { kind: "unknown" });
  assert.deepEqual(storyBranchOf({ status: "not-recorded" }), {
    kind: "not-recorded",
  });
  assert.deepEqual(
    storyBranchOf({ status: "unavailable", problem: "unreadable" }),
    { kind: "profiles-unreadable" },
  );
  assert.deepEqual(
    storyBranchOf(
      recorded(owner("story-branch", "a/x"), owner("story-branch", "b/x")),
    ),
    { kind: "conflicting" },
  );
  assert.deepEqual(storyBranchOf(recorded()), { kind: "conflicting" });
  assert.deepEqual(storyBranchOf(recorded(owner("trunk", "main"))), {
    kind: "trunk",
    profilePath: ".planning/agents/a.json",
  });
  assert.deepEqual(storyBranchOf(recorded(owner("story-branch", "a..b"))), {
    kind: "unsafe",
    branch: "a..b",
    profilePath: ".planning/agents/a.json",
  });
  assert.deepEqual(
    storyBranchOf(recorded(owner("story-branch", "codex/story"))),
    {
      kind: "branch",
      branch: "codex/story",
      profilePath: ".planning/agents/a.json",
    },
  );
});

const commit = (sha, subject, parent) => ({
  sha,
  commit: { message: `${subject}\n\nbody` },
  parents: parent === undefined ? [] : [{ sha: parent }],
});

// A story branch of two planning commits over a trunk commit, which has
// trunk runs only.
const history = [
  commit("c3", "Plan slice 2", "c2"),
  commit("c2", "Plan slice 1", "c1"),
  commit("c1", "Shared trunk commit", "c0"),
  commit("c0", "Older trunk commit"),
];

const run = (headSha, branch, status, conclusion, createdAt) => ({
  headSha,
  branch,
  status,
  conclusion,
  createdAt,
  url: `https://github.com/o/r/actions/runs/${headSha}-${branch}`,
});

test("a shared ancestor's trunk run is the story branch's nearest result, named by its branch", () => {
  assert.deepEqual(
    judgeNearest(history, [
      run("c1", "main", "completed", "success", "2026-11-01T00:00:00Z"),
    ]),
    {
      state: "pass",
      revision: "c1",
      subject: "Shared trunk commit",
      laterWithoutResult: 2,
      runUrl: "https://github.com/o/r/actions/runs/c1-main",
      runBranch: "main",
    },
  );
});

test("a cancelled or timed-out run is Failed, never passed", () => {
  for (const conclusion of ["cancelled", "timed_out"]) {
    const judgment = judgeNearest(history, [
      run("c3", "main", "completed", conclusion, "2026-11-02T00:00:00Z"),
    ]);
    assert.equal(judgment.state, "failed", conclusion);
    assert.equal(judgment.revision, "c3", conclusion);
  }
});

test("the branch's own run is judged with its branch, and a running head's completed ancestor carries the trunk", () => {
  const trunkPass = run(
    "c1",
    "main",
    "completed",
    "success",
    "2026-11-01T00:00:00Z",
  );
  assert.deepEqual(
    judgeNearest(history, [
      trunkPass,
      run("c3", "codex/story", "completed", "failure", "2026-11-02T00:00:00Z"),
    ]),
    {
      state: "failed",
      revision: "c3",
      subject: "Plan slice 2",
      laterWithoutResult: 0,
      runUrl: "https://github.com/o/r/actions/runs/c3-codex/story",
      runBranch: "codex/story",
    },
  );
  assert.deepEqual(
    judgeNearest(history, [
      trunkPass,
      run("c3", "codex/story", "in_progress", null, "2026-11-02T00:00:00Z"),
    ]).completedAncestor,
    {
      revision: "c1",
      subject: "Shared trunk commit",
      state: "pass",
      runUrl: "https://github.com/o/r/actions/runs/c1-main",
      runBranch: "main",
    },
  );
});

test("of one commit's runs on both branches, the newest is judged; at equal times the later listed", () => {
  const at = "2026-11-02T00:00:00Z";
  const trunk = run("c1", "main", "completed", "failure", at);
  const own = run("c1", "codex/story", "completed", "success", at);
  assert.equal(judgeNearest(history, [trunk, own]).runBranch, "codex/story");
  assert.equal(
    judgeNearest(history, [
      run("c1", "main", "completed", "failure", "2026-11-03T00:00:00Z"),
      own,
    ]).runBranch,
    "main",
  );
});
