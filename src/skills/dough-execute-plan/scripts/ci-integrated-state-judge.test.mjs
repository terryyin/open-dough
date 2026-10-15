// Integrated-state evidence judged at its domain contract: one poll's
// `integratedStateJudge` over a real local history, with only the provider's
// candidate listing and current-attempt reads stubbed. Each reason a green
// descendant C cannot validate accepted B is reported per candidate.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { integratedStateJudge } from "./ci-integrated-state.mjs";
import {
  accepted,
  currentAttempt,
  judgeHistory,
  judgePoll,
  listedRun,
  policy,
  unreadable,
  unresolved,
  validated,
} from "./ci-integrated-state-judge-test-fixtures.mjs";

// Read-only here: every case judges against the writer's full history.
const { writer, b, c, other } = judgeHistory({ after });

test("a descendant's current green of the declared check validates B's integrated state beside B's own state", async () => {
  const run = listedRun(c);
  const { judge, reads } = judgePoll({ repoDir: writer, runs: [run] });
  const judged = await judge(accepted(b));
  assert.deepEqual(judged, {
    ...accepted(b),
    integrated: validated(b, c, run),
  });
  assert.deepEqual(reads, [
    { runId: run.databaseId, options: { jobs: ["covered"] } },
  ]);
});

test("B itself, another branch, another named check and non-descendants are no candidate", async () => {
  const { judge } = judgePoll({
    repoDir: writer,
    runs: [
      listedRun(b),
      listedRun(other),
      listedRun(other, { conclusion: "failure" }),
      listedRun("a".repeat(40), { headBranch: "elsewhere" }),
      listedRun("b".repeat(40), { check: "release.yml" }),
    ],
  });
  assert.deepEqual((await judge(accepted(b))).integrated, {
    state: "unresolved",
    policy,
    reason: "no_candidate",
  });
});

const ineligibleReads = [
  ["another run's facts", { databaseId: 1 }, "facts_mismatch"],
  ["another SHA's facts", { headSha: "d".repeat(40) }, "facts_mismatch"],
  ["a newer attempt", { attempt: 2 }, "attempt_changed"],
  ["a read contradicted mid-read", { contradicted: true }, "attempt_changed"],
  ["another target branch", { headBranch: "release" }, "different_target"],
  ["another check", { check: "release.yml" }, "context_incompatible"],
  ["another context", { context: "workflow_dispatch" }, "context_incompatible"],
  [
    "a current attempt still running",
    { status: "in_progress", conclusion: null },
    "not_current_success",
  ],
  ["no declared job", { jobs: [] }, "missing_check"],
  [
    "the declared job twice",
    {
      jobs: [
        { name: "covered", status: "completed", conclusion: "success" },
        { name: "covered", status: "completed", conclusion: "success" },
      ],
    },
    "missing_check",
  ],
  [
    "the declared job failed",
    { jobs: [{ name: "covered", status: "completed", conclusion: "failure" }] },
    "check_not_successful",
  ],
];

for (const [name, facts, reason] of ineligibleReads)
  test(`C's listed green whose current read shows ${name} is ${reason}`, async () => {
    const { judge } = judgePoll({
      repoDir: writer,
      runs: [listedRun(c)],
      read: (run) => currentAttempt(run, facts),
    });
    assert.deepEqual(
      (await judge(accepted(b))).integrated,
      unresolved([{ sha: c, reason }]),
    );
  });

test("a listing that shows C's run rerunning keeps B unresolved even when the read still shows the older green", async () => {
  const green = listedRun(c);
  const rerun = {
    ...green,
    attempt: 2,
    status: "in_progress",
    conclusion: null,
  };
  const { judge, reads } = judgePoll({
    repoDir: writer,
    runs: [green, rerun],
    read: () => currentAttempt(green),
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([{ sha: c, reason: "not_current_success" }]),
  );
  assert.deepEqual(reads, []);
});

test("every run of C must be a current success, and the first verified run is reported", async () => {
  const first = listedRun(c);
  const second = listedRun(c);
  const changed = judgePoll({
    repoDir: writer,
    runs: [first, second],
    read: (run) => currentAttempt(run, run === second ? { attempt: 2 } : {}),
  });
  assert.deepEqual(
    (await changed.judge(accepted(b))).integrated,
    unresolved([{ sha: c, reason: "attempt_changed" }]),
  );
  assert.deepEqual(
    changed.reads.map(({ runId }) => runId),
    [first.databaseId, second.databaseId],
  );
  const current = judgePoll({ repoDir: writer, runs: [first, second] });
  assert.deepEqual(
    (await current.judge(accepted(b))).integrated,
    validated(b, c, first),
  );
});

test("an unreadable current attempt, or no reader or checkout, is current_attempt_unavailable", async () => {
  const { judge } = judgePoll({
    repoDir: writer,
    runs: [listedRun(c)],
    read: unreadable,
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([{ sha: c, reason: "current_attempt_unavailable" }]),
  );
  for (const missing of [{ readCurrentAttempt: undefined }, { repoDir: "" }])
    assert.deepEqual(
      (
        await judgePoll({
          repoDir: writer,
          runs: [listedRun(c)],
          ...missing,
        }).judge(accepted(b))
      ).integrated,
      { state: "unresolved", policy, reason: "current_attempt_unavailable" },
    );
});

test("a failed candidate listing is candidate_lookup_unavailable", async () => {
  const { judge } = judgePoll({
    repoDir: writer,
    runs: () => {
      throw new Error("listing failed");
    },
  });
  assert.deepEqual((await judge(accepted(b))).integrated, {
    state: "unresolved",
    policy,
    reason: "candidate_lookup_unavailable",
    detail: "Error: listing failed",
  });
});

test("integrated evidence is judged only under a policy for an eligible own state, and replaces any recorded one", async () => {
  const run = listedRun(c);
  const recorded = { ...accepted(b), integrated: validated(b, c, run) };
  const noPolicy = integratedStateJudge(undefined, {
    branch: "main",
    repoDir: writer,
    listCandidates: async () => [run],
    readCurrentAttempt: async (listed) => currentAttempt(listed),
  });
  assert.deepEqual(await noPolicy(recorded), accepted(b));
  const { judge, listings } = judgePoll({ repoDir: writer, runs: [run] });
  for (const state of ["pending", "success", "failure"])
    assert.deepEqual(await judge({ ...recorded, state }), accepted(b, state));
  // An ignored-only B is judged only while its applicable ancestor's attempt
  // has no verdict; a proved or unresolved basis keeps its own rule.
  const ignoredOnly = (basisState) => ({
    ...accepted(b, "not_required"),
    basis: { sha: "a".repeat(40), state: basisState },
  });
  for (const basisState of ["success", "failure", undefined])
    assert.deepEqual(
      await judge({ ...recorded, ...ignoredOnly(basisState) }),
      ignoredOnly(basisState),
    );
  assert.equal(listings(), 0);
  assert.deepEqual(
    (await judge({ ...recorded, state: "incomplete" })).integrated,
    validated(b, c, run),
  );
  for (const basisState of ["incomplete", "pending"])
    assert.deepEqual(await judge(ignoredOnly(basisState)), {
      ...ignoredOnly(basisState),
      integrated: validated(b, c, run),
    });
  const unavailable = judgePoll({
    repoDir: writer,
    runs: [run],
    read: unreadable,
  });
  assert.deepEqual(
    (await unavailable.judge(recorded)).integrated,
    unresolved([{ sha: c, reason: "current_attempt_unavailable" }]),
  );
});
