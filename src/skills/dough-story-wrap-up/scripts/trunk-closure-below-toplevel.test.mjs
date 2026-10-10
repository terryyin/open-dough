// Trunk Mode closure for a project in a directory below its execution
// worktree's Git toplevel computes its observer owner as that project's
// delivery does: the installed `deliver` and `finish`, the observer `deliver`
// claimed, real workers, a bare remote, and a controlled CI provider.
// Retirement refuses this layout, so the worktree stays for every rerun.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { deliverThroughCli } from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-cli-test-fixtures.mjs";
import {
  countPushes,
  coverage,
  revisions,
} from "../../dough-execute-plan/scripts/execution-increment-managed-delivery-owner-test-fixtures.mjs";
import { closureBelowToplevel } from "./trunk-closure-owner-test-fixtures.mjs";
import {
  commitFinalClosure,
  releaseCi,
} from "./trunk-closure-test-fixtures.mjs";

test("a finish rerun on an accepted closure for a project below its Git toplevel reports the observer its deliver claimed and stops at retirement as the first finish does", async (t) => {
  const { fixture, project, env, finish } = await closureBelowToplevel(t);
  const { delivered } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    env,
    workspace: project,
  });
  assert.equal(delivered.publication, "accepted");
  assert.equal(delivered.observation.state, "attached");
  const observer = delivered.observation.directory;
  const beforeCleanup = delivered.receipt.sha;
  const final = await commitFinalClosure(fixture);
  releaseCi(fixture, { [beforeCleanup]: "success", [final]: "success" });
  const pushes = await countPushes(fixture);
  const closure = { beforeCleanup, final, extra: ["--created-for-work"] };

  const first = await finish(closure);

  assert.equal(first.code, 1);
  assert.equal(pushes(), 1);
  assert.equal(first.result.acceptedSha, final);
  assert.equal(first.result.observation.state, "reused");
  assert.equal(first.result.observation.directory, observer);
  assert.equal(first.result.completion.shutdown.status, "confirmed");
  assert.equal(first.result.step, "retire");
  assert.equal(first.result.cleanup.reason, "ambiguous checkout");

  const again = await finish(closure);

  assert.equal(again.code, 1);
  assert.equal(pushes(), 1);
  assert.equal(again.result.acceptedSha, final);
  assert.deepEqual(again.result.observation, {
    state: "recovered",
    directory: observer,
    reused: true,
  });
  assert.deepEqual(coverage(observer), revisions(beforeCleanup, final));
  assert.equal(again.result.completion.requestedSha, final);
  assert.equal(again.result.completion.shutdown.status, "confirmed");
  assert.equal(again.result.step, "retire");
  assert.equal(again.result.cleanup.reason, "ambiguous checkout");
  assert.equal(existsSync(project), true);
});
