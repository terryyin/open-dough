// Current pending-attempt facts explain progress without validating success.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import {
  accepted,
  assertPendingProgress,
  currentAttempt,
  judgeHistory,
  judgePoll,
  listedRun,
  policy,
  unreadable,
} from "./ci-integrated-state-judge-test-fixtures.mjs";

const { writer, b, c } = judgeHistory({ after });

test("a locally containing pending attempt supplies progress only from compatible authoritative current facts", async () => {
  const run = listedRun(c, { status: "in_progress", conclusion: null });
  const good = judgePoll({
    repoDir: writer,
    runs: [run],
    read: (listed) => currentAttempt(listed, { jobs: [] }),
  });
  const judged = (await good.judge(accepted(b))).integrated;
  assert.equal(judged.state, "unresolved");
  assert.equal(judged.validated, undefined);
  assertPendingProgress(judged.progress, b, c, policy);
  assert.equal(judged.progress.attempt, run.attempt);
  for (const facts of [
    { databaseId: "different" },
    { headSha: "e".repeat(40) },
    { attempt: 2 },
    { contradicted: true },
    { headBranch: "other" },
    { check: "other" },
    { context: "other" },
    { status: "completed", conclusion: "failure" },
    { status: "completed", conclusion: "success" },
  ]) {
    const poll = judgePoll({
      repoDir: writer,
      runs: [run],
      read: (listed) => currentAttempt(listed, facts),
    });
    const rejected = (await poll.judge(accepted(b))).integrated;
    assert.equal(rejected.state, "unresolved", JSON.stringify(facts));
    assert.equal(rejected.progress, undefined, JSON.stringify(facts));
  }
  const unavailable = judgePoll({
    repoDir: writer,
    runs: [run],
    read: unreadable,
  });
  assert.equal(
    (await unavailable.judge(accepted(b))).integrated.progress,
    undefined,
  );
});
