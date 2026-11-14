// Guarded progress publication: commit unfinished-slice source while receiving
// proof stays pending, without marking done or inventing a second publisher.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";
import {
  acceptedProof,
  freshApi,
  localFixture,
  planned,
} from "./execution-increment-fresh-test-fixtures.mjs";
import {
  git,
  lsRemoteSha,
  revParse,
  remoteHeads,
} from "./publication-test-fixtures.mjs";
import {
  obligation,
  searchProjection,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import { configureAgentAuthorship } from "./workspace-agent-authorship.mjs";

const statuses = (f) =>
  readPlanSlices(readFileSync(join(f.workspace, "PLAN.md"), "utf8")).slices.map(
    ({ status }) => status,
  );

const openReceiving = () =>
  slicePlan(obligation(searchProjection, "receiving slice 4"), {
    done: [1],
  });

async function plannedProgress(f, plan = openReceiving()) {
  writeFileSync(
    join(f.workspace, "story.md"),
    `# Story\n\n<a id="selected"></a>\n\n### Selected\n${searchProjection.story}\n`,
  );
  const p = await planned(f, plan);
  p.progress = true;
  return p;
}

test("progress publication commits while receiving proof is pending without marking the slice done", async (t) => {
  const f = await localFixture(t);
  const plan = openReceiving();
  const p = await plannedProgress(f, plan);
  p.generation = f.logged("generation");
  p.formatting = f.logged("formatting");
  p.summary = f.logged("summary");
  const before = readFileSync(join(f.workspace, "PLAN.md"), "utf8");
  const { code, result } = await f.fresh(p);
  assert.equal(code, 0, JSON.stringify(result));
  assert.equal(result.ok, true);
  assert.equal(result.report, "committed-pending-publication");
  assert.equal(result.publication, "pending");
  assert.equal(result.commit.sha, await revParse(f.workspace, "HEAD"));
  assert.notEqual(result.commit.sha, f.before);
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "planned"]);
  assert.equal(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    before,
    "progress must not mutate selected-slice status",
  );
  assert.match(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    /Disposition: receiving slice 4/,
  );
  assert.equal(
    readFileSync(f.operations, "utf8"),
    "generation\nformatting\nsummary\n",
  );
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.equal(await remoteHeads(f.origin), f.refs);
  assert.equal(existsSync(f.storage), false);
});

test("failed formatting on a progress attempt publishes nothing and leaves the plan unfinished", async (t) => {
  const f = await localFixture(t);
  const plan = openReceiving();
  const p = await plannedProgress(f, plan);
  const beforePlan = readFileSync(join(f.workspace, "PLAN.md"), "utf8");
  p.formatting = f.logged("formatting", "process.exit(7);");
  const { code, result } = await f.fresh(p);
  assert.equal(code, 1);
  assert.equal(result.ok, false);
  assert.equal(result.operation, "formatting");
  assert.equal(result.code, 7);
  assert.equal(readFileSync(join(f.workspace, "PLAN.md"), "utf8"), beforePlan);
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "planned"]);
  assert.equal((await git(f.workspace, "diff", "--cached")).stdout, "");
  await f.withheld();
});

test("ordinary fresh marks done after accepted observation and still refuses while it is missing", async (t) => {
  const f = await localFixture(t);
  writeFileSync(
    join(f.workspace, "story.md"),
    `# Story\n\n<a id="selected"></a>\n\n### Selected\n${searchProjection.story}\n`,
  );
  const open = openReceiving();
  const ordinary = await planned(f, open);
  const refused = await f.fresh(ordinary);
  assert.equal(refused.code, 1);
  assert.equal(refused.result.operation, "story obligations");
  assert.equal(
    refused.result.details.problems.some(
      ({ reason }) => reason === "open-obligation",
    ),
    true,
  );
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "planned"]);
  await f.withheld();

  const proved = slicePlan(
    obligation(searchProjection, "proved by slice 4: hosted-ci.receipt"),
    { done: [1] },
  );
  writeFileSync(join(f.workspace, "PLAN.md"), `${proved}${acceptedProof}`);
  const completed = await f.fresh({
    ...ordinary,
    progress: undefined,
  });
  assert.equal(completed.code, 0, JSON.stringify(completed.result));
  assert.equal(completed.result.report, "committed-pending-publication");
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "done"]);
  assert.match(
    (await git(f.workspace, "show", "HEAD:PLAN.md")).stdout,
    /proved by slice 4: hosted-ci\.receipt/,
  );
});

test("progress uses the same agent commit and exact-candidate resume without a second preparation", async (t) => {
  const f = await localFixture(t);
  await git(f.workspace, "config", "user.name", "Dana Developer");
  await git(f.workspace, "config", "user.email", "dana@example.test");
  await configureAgentAuthorship(f.workspace, {
    agent: "Yui-chan",
    email: "yui-chan@example.org",
  });
  const p = await plannedProgress(f);
  p.commit = "agent";
  const interrupted = await freshApi(
    f,
    { preparation: p, message: "Progress candidate\n" },
    async (request) => {
      assert.equal(
        request.validatedCandidate,
        await revParse(f.workspace, "HEAD"),
      );
      throw new Error("interrupted before transport");
    },
  );
  assert.equal(interrupted.status, "delivery-interrupted");
  assert.equal(interrupted.commit.agent, "Yui-chan");
  assert.equal(interrupted.recovery.candidateSha, interrupted.commit.sha);
  assert.equal(interrupted.recovery.suffixBase, f.trunkSha);
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "planned"]);
  const head = await revParse(f.workspace, "HEAD");
  assert.equal(await lsRemoteSha(f.origin, "refs/heads/main"), f.trunkSha);
  const resumed = await f.resumeManagedExecutionIncrement({
    ...f.requestBase,
    ...interrupted.recovery,
  });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.receipt.sha, head);
  assert.equal(resumed.pushCount, 1);
  assert.equal(await revParse(f.workspace, "HEAD"), head);
  assert.equal(await lsRemoteSha(f.origin, "refs/heads/main"), head);
  assert.equal(readFileSync(f.hookLog, "utf8"), "commit\n");
  assert.deepEqual(statuses(f), ["done", "planned", "planned", "planned"]);
});

test("invalid or quick progress declarations refuse as context before project commands", async (t) => {
  const f = await localFixture(t);
  for (const preparation of [
    { ...f.preparation, progress: false },
    { ...f.preparation, progress: true },
    {
      ...(await planned(f)),
      progress: "yes",
    },
  ]) {
    const { code, result } = await f.fresh(preparation);
    assert.equal(code, 1);
    assert.equal(result.operation, "context");
    await f.withheld();
  }
  assert.equal(existsSync(f.operations), false);
});
