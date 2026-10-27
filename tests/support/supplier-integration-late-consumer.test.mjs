import assert from "node:assert/strict";
import { test } from "node:test";
import {
  git,
  readDependencies,
  revParse,
  run,
  supplier,
} from "./supplier-dependency-fixture.mjs";
import {
  branchedSupplier,
  executionBranch,
  identities,
  integrate,
  publishConsumers,
  recordJudgment,
  remoteMain,
  satisfied,
  selected,
} from "./supplier-integration-visit-fixture.mjs";
import { retireWorktree } from "../../src/skills/dough-land/scripts/worktree-retirement.mjs";

test("a completed selected story whose branch shows no consumer still visits the late trunk consumer", async (t) => {
  const setup = await branchedSupplier(t, { consumerBeforeBranch: false });
  const onBranch = await run(setup.owned, [
    "discover-consumers",
    "--supplier-identity",
    supplier.identity,
  ]);
  assert.equal(onBranch.code, 0, onBranch.stderr);
  assert.deepEqual(JSON.parse(onBranch.stdout).consumers, []);

  const integrated = await integrate(setup, selected);
  assert.equal(integrated.code, 0, integrated.stderr);
  const { visit, acceptedSha } = integrated.json;
  assert.equal(integrated.json.classification, "published");
  assert.equal(visit.status, "visited");
  assert.deepEqual(identities(visit), [setup.sibling.identity]);
  assert.deepEqual(visit.problems, []);
  assert.equal(visit.checkout.revision, acceptedSha);

  const [late] = visit.consumers;
  const judged = await recordJudgment(
    setup,
    late,
    acceptedSha,
    satisfied(setup, acceptedSha),
  );
  assert.equal(judged.code, 0, judged.stderr);
  const final = await publishConsumers(setup, "resolve the late consumer");
  assert.equal(await remoteMain(setup), final);
  await git(setup.workspace, "merge-base", "--is-ancestor", acceptedSha, final);
  const resolved = await readDependencies(setup.owned, setup.sibling);
  assert.equal(resolved.blocking.length, 0);
  assert.equal(resolved.dependencies[0].resolution.revision, setup.evidence);
  assert.equal(await revParse(setup.workspace, "HEAD"), final);

  const retired = await retireWorktree({
    repository: setup.trunk.integration,
    worktree: setup.workspace,
    branch: executionBranch,
    createdForWork: true,
    remoteBranch: executionBranch,
    contained: [acceptedSha, final],
  });
  assert.equal(retired.removed, true, JSON.stringify(retired));
});
