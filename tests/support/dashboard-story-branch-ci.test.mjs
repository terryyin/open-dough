import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { judgeCommandAdapter } from "../../dashboard/server/baseCiJudgment.ts";
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

// A ciAdapter story branch `codex/x` over trunk `main` (SEED-219
// #ci-status-review-corrections, second key example): the fake adapter
// answers each discover from `answers` by the asked branch (an exit failure
// for "fail") and logs each asked branch.
const sha = (digit) => digit.repeat(40);
const adapterHistory = [
  commit(sha("3"), "Plan slice 2", sha("2")),
  commit(sha("2"), "Plan slice 1", sha("1")),
  commit(sha("1"), "Shared trunk commit", sha("0")),
  commit(sha("0"), "Older trunk commit"),
];
const source = {
  id: "open-dough",
  label: "Open Dough",
  repository: "o/r",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};
const attempt = (digit, branch, outcome, time) => ({
  runId: `${digit}-${branch}`,
  attemptId: "1",
  sha: sha(digit),
  branch,
  outcome,
  url: `https://ci.invalid/${digit}-${branch}`,
  time,
});

async function judgeWithAdapter(branch, answers, delayMs = 0) {
  const root = mkdtempSync(path.join(tmpdir(), "story-branch-ci-adapter-"));
  try {
    const log = path.join(root, "asked.log");
    const script = path.join(root, "adapter.mjs");
    writeFileSync(
      script,
      `import { appendFileSync } from "node:fs";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const { operation, check } = JSON.parse(input);
if (operation !== "discover") process.exit(1);
appendFileSync(${JSON.stringify(log)}, "start " + check.branch + "\\n");
const answer = ${JSON.stringify(answers)}[check.branch] ?? [];
if (answer === "fail") {
  process.stderr.write("discover of " + check.branch + " failed");
  process.exit(1);
}
await new Promise((resolve) => setTimeout(resolve, ${delayMs}));
appendFileSync(${JSON.stringify(log)}, "end " + check.branch + "\\n");
process.stdout.write(JSON.stringify({ attempts: answer }));
`,
    );
    const judgment = await judgeCommandAdapter(
      adapterHistory,
      source,
      branch,
      root,
      [process.execPath, script],
      AbortSignal.timeout(20_000),
    );
    const events = readFileSync(log, "utf8").trim().split("\n");
    return {
      judgment,
      events,
      asked: events
        .filter((event) => event.startsWith("start "))
        .map((event) => event.slice("start ".length)),
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("a ciAdapter story branch counts main's result for a commit in its history, run on main", async () => {
  const { judgment, asked } = await judgeWithAdapter("codex/x", {
    main: [
      // On main only, not in codex/x's history: never counted.
      attempt("9", "main", "failure", "2026-11-02T00:00:00Z"),
      attempt("1", "main", "success", "2026-11-01T00:00:00Z"),
    ],
  });
  assert.deepEqual(judgment, {
    state: "pass",
    revision: sha("1"),
    subject: "Shared trunk commit",
    laterWithoutResult: 2,
    runUrl: "https://ci.invalid/1-main",
    runBranch: "main",
  });
  assert.deepEqual(asked.sort(), ["codex/x", "main"]);
});

test("a ciAdapter story branch's nearer own failed or running result still decides", async () => {
  const trunkPass = attempt("1", "main", "success", "2026-11-01T00:00:00Z");
  const failed = await judgeWithAdapter("codex/x", {
    main: [trunkPass],
    "codex/x": [attempt("2", "codex/x", "failure", "2026-11-02T00:00:00Z")],
  });
  assert.equal(failed.judgment.state, "failed");
  assert.equal(failed.judgment.revision, sha("2"));
  assert.equal(failed.judgment.runBranch, "codex/x");
  const running = await judgeWithAdapter("codex/x", {
    main: [trunkPass],
    "codex/x": [attempt("3", "codex/x", "pending", "2026-11-02T00:00:00Z")],
  });
  assert.equal(running.judgment.state, "running");
  assert.equal(running.judgment.revision, sha("3"));
  assert.deepEqual(running.judgment.completedAncestor, {
    revision: sha("1"),
    subject: "Shared trunk commit",
    state: "pass",
    runUrl: "https://ci.invalid/1-main",
    runBranch: "main",
  });
  // Of one commit's results on both branches, the newer decides; at equal
  // times the branch's own, as with a ciWorkflow.
  const at = "2026-11-02T00:00:00Z";
  const equal = await judgeWithAdapter("codex/x", {
    main: [attempt("1", "main", "failure", at)],
    "codex/x": [attempt("1", "codex/x", "success", at)],
  });
  assert.equal(equal.judgment.runBranch, "codex/x");
  const newer = await judgeWithAdapter("codex/x", {
    main: [attempt("1", "main", "failure", "2026-11-03T00:00:00Z")],
    "codex/x": [attempt("1", "codex/x", "success", at)],
  });
  assert.equal(newer.judgment.state, "failed");
  assert.equal(newer.judgment.runBranch, "main");
});

test("a ciAdapter story branch whose main discover fails is unread with its reason, never passed, without waiting for its own", async () => {
  const started = Date.now();
  const { judgment, events } = await judgeWithAdapter(
    "codex/x",
    {
      main: "fail",
      "codex/x": [attempt("3", "codex/x", "success", "2026-11-02T00:00:00Z")],
    },
    5_000,
  );
  assert.equal(judgment.state, "unread");
  assert.match(judgment.reason, /discover of main failed/);
  // The branch's own discover is ended, not waited for.
  assert.ok(Date.now() - started < 4_000);
  assert.ok(!events.includes("end codex/x"));
});

test("the ciAdapter trunk asks one discover, for main", async () => {
  const { judgment, asked } = await judgeWithAdapter("main", {
    main: [attempt("3", "main", "success", "2026-11-02T00:00:00Z")],
  });
  assert.equal(judgment.state, "pass");
  assert.equal(judgment.runBranch, "main");
  assert.deepEqual(asked, ["main"]);
});

test("a ciAdapter story branch asks its own and main's discovers at once", async () => {
  const { judgment, events } = await judgeWithAdapter(
    "codex/x",
    { main: [attempt("1", "main", "success", "2026-11-01T00:00:00Z")] },
    1_000,
  );
  assert.equal(judgment.state, "pass");
  // Both discovers start before either ends.
  assert.deepEqual(
    events.slice(0, 2).map((event) => event.split(" ")[0]),
    ["start", "start"],
  );
});
