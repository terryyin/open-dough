// One poll's integrated-state judge stays bounded: candidates this checkout
// lacks are fetched from its real local remote (objects only, at most three
// per poll), at most three candidates are read, and each run is read once per
// poll whichever revisions it is judged for. A directed wait or the end of
// observation is no evidence and ends the judgement.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { GitHubAcquisitionHeld } from "./ci-github-actions.mjs";
import {
  accepted,
  judgeHistory,
  judgePoll,
  listedRun,
  unreadable,
  unresolved,
  validated,
} from "./ci-integrated-state-judge-test-fixtures.mjs";

const refs = (repoDir) =>
  execFileSync("git", ["-C", repoDir, "for-each-ref"], { encoding: "utf8" });

test("a green C this checkout lacks is fetched, objects only, and validates B", async (t) => {
  const history = judgeHistory(t);
  const { observer, b, c } = history;
  const before = refs(observer);
  assert.equal(history.holds(observer, c), false);
  const run = listedRun(c);
  const { judge } = judgePoll({ repoDir: observer, runs: [run] });
  assert.deepEqual((await judge(accepted(b))).integrated, validated(b, c, run));
  assert.equal(history.holds(observer, c), true);
  assert.equal(refs(observer), before);
  assert.equal(existsSync(join(observer, ".git/FETCH_HEAD")), false);
});

test("pending and failed candidates this checkout lacks are never fetched; a green one still is", async (t) => {
  const history = judgeHistory(t, { siblings: 2 });
  const { observer, b, c, descendants } = history;
  const [failed, green] = descendants;
  const { judge } = judgePoll({
    repoDir: observer,
    runs: [
      listedRun(c, { status: "in_progress", conclusion: null }),
      listedRun(failed, { conclusion: "failure" }),
      listedRun(green),
    ],
    read: unreadable,
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([
      { sha: c, reason: "not_current_success" },
      { sha: failed, reason: "not_current_success" },
      { sha: green, reason: "current_attempt_unavailable" },
    ]),
  );
  assert.deepEqual(
    [c, failed, green].map((sha) => history.holds(observer, sha)),
    [false, false, true],
  );
});

test("a candidate the remote cannot serve stays ancestry_unknown", async (t) => {
  const { observer, b } = judgeHistory(t);
  const unknown = "e".repeat(40);
  const { judge, reads } = judgePoll({
    repoDir: observer,
    runs: [listedRun(unknown)],
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([{ sha: unknown, reason: "ancestry_unknown" }]),
  );
  assert.deepEqual(reads, []);
});

test("at most three lacking candidates are fetched per poll; the next stays ancestry_unknown", async (t) => {
  const history = judgeHistory(t, { siblings: 4 });
  const { observer, b, descendants } = history;
  const { judge } = judgePoll({
    repoDir: observer,
    runs: descendants.map((sha) => listedRun(sha)),
    read: unreadable,
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([
      ...descendants
        .slice(0, 3)
        .map((sha) => ({ sha, reason: "current_attempt_unavailable" })),
      { sha: descendants[3], reason: "ancestry_unknown" },
    ]),
  );
  assert.deepEqual(
    descendants.map((sha) => history.holds(observer, sha)),
    [true, true, true, false],
  );
});

test("at most three candidates are read per poll; the next is verification_bound", async (t) => {
  const { writer, b, descendants } = judgeHistory(t, { siblings: 4 });
  const runs = descendants.map((sha) => listedRun(sha));
  const { judge, reads } = judgePoll({
    repoDir: writer,
    runs,
    read: unreadable,
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    unresolved([
      ...descendants
        .slice(0, 3)
        .map((sha) => ({ sha, reason: "current_attempt_unavailable" })),
      { sha: descendants[3], reason: "verification_bound" },
    ]),
  );
  assert.deepEqual(
    reads.map(({ runId }) => runId),
    runs.slice(0, 3).map(({ databaseId }) => databaseId),
  );
});

test("pending descendants cannot consume a successful candidate's verification opportunity", async (t) => {
  const { writer, b, descendants } = judgeHistory(t, { siblings: 4 });
  const pending = descendants
    .slice(0, 3)
    .map((sha) => listedRun(sha, { status: "in_progress", conclusion: null }));
  const green = listedRun(descendants[3]);
  const { judge, reads } = judgePoll({
    repoDir: writer,
    runs: [...pending, green],
  });
  assert.deepEqual(
    (await judge(accepted(b))).integrated,
    validated(b, descendants[3], green),
  );
  assert.deepEqual(
    reads.map(({ runId }) => runId),
    [green.databaseId],
  );
});

test("each run is read once per poll for every revision it is judged for, and afresh the next poll", async (t) => {
  const { writer, b, c } = judgeHistory(t);
  const base = execFileSync("git", ["-C", writer, "rev-parse", `${b}^`], {
    encoding: "utf8",
  }).trim();
  const run = listedRun(c);
  const poll = judgePoll({ repoDir: writer, runs: [run] });
  assert.deepEqual(
    (await poll.judge(accepted(b))).integrated,
    validated(b, c, run),
  );
  assert.deepEqual(
    (await poll.judge(accepted(base, "incomplete"))).integrated,
    validated(base, c, run),
  );
  assert.equal(poll.reads.length, 1);
  const failed = judgePoll({ repoDir: writer, runs: [run], read: unreadable });
  for (const sha of [b, base])
    assert.deepEqual(
      (await failed.judge(accepted(sha))).integrated,
      unresolved([{ sha: c, reason: "current_attempt_unavailable" }]),
    );
  assert.equal(failed.reads.length, 1);
});

test("a directed wait or the end of observation ends the judgement without evidence", async (t) => {
  const { writer, b, c } = judgeHistory(t);
  const held = new GitHubAcquisitionHeld(60);
  const listing = judgePoll({
    repoDir: writer,
    runs: () => {
      throw held;
    },
  });
  await assert.rejects(listing.judge(accepted(b)), held);
  const reading = judgePoll({
    repoDir: writer,
    runs: [listedRun(c)],
    read: () => {
      throw held;
    },
  });
  await assert.rejects(reading.judge(accepted(b)), held);
  const observation = new AbortController();
  const stop = new Error("stop");
  const stopped = judgePoll({
    repoDir: writer,
    runs: [listedRun(c)],
    signal: observation.signal,
    read: () => {
      observation.abort(stop);
      throw stop;
    },
  });
  await assert.rejects(stopped.judge(accepted(b)), stop);
});
