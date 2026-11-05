// The CI status judgment of a ciAdapter story branch over its trunk
// (`../../dashboard/server/baseCiJudgment.ts` `judgeCommandAdapter`), from a
// fake adapter's discover answers; a GitHub Actions project's is in
// ./dashboard-story-branch-ci.test.mjs.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { judgeCommandAdapter } from "../../dashboard/server/baseCiJudgment.ts";

const commit = (sha, subject, parent) => ({
  sha,
  commit: { message: `${subject}\n\nbody` },
  parents: parent === undefined ? [] : [{ sha: parent }],
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
    adapterAttempt: { runId: "1-main", attemptId: "1" },
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
    adapterAttempt: { runId: "1-main", attemptId: "1" },
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

test("a ciAdapter result keeps its attempt's identity apart from a GitHub run, and says when another attempt shares its attemptId at its revision", async () => {
  const numeric = {
    ...attempt("3", "main", "success", "2026-11-02T00:00:00Z"),
    runId: 7,
    attemptId: 1,
  };
  const { judgment } = await judgeWithAdapter("codex/x", {
    // The same attempt, discovered for both branches, is one attempt.
    main: [numeric],
    "codex/x": [numeric],
  });
  assert.deepEqual(judgment.adapterAttempt, { runId: 7, attemptId: 1 });
  assert.equal(judgment.runId, undefined);
  assert.equal(judgment.runAttempt, undefined);
  const shared = await judgeWithAdapter("main", {
    main: [
      { ...numeric, check: "unit" },
      { ...numeric, runId: 8, check: "lint" },
    ],
  });
  assert.equal(shared.judgment.adapterAttempt?.ambiguous, true);
});
