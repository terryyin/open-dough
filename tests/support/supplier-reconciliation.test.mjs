import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { startCliResult } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { readState } from "./story-state-fixture.mjs";
import {
  consumer,
  discover,
  resolveConsumer,
  readDependencies,
  git,
  supplierPlan,
  publish,
  revParse,
} from "./supplier-dependency-fixture.mjs";
import {
  reconciliationFixture,
  boundedAssumption,
  verifiedAssumption,
  boundedIntent,
  unrelatedReason,
  decision,
  implementation,
  question,
  waitingCondition,
  textAt,
  writeAt,
  outcome,
  startArgs,
} from "./supplier-reconciliation-fixture.mjs";

test("supplier visit reconciles settled assumptions independently and retains evidenced choices after cleanup", async (t) => {
  const f = await reconciliationFixture(t);
  const discovered = await discover(f);
  assert.deepEqual(discovered.problems, []);
  assert.deepEqual(
    discovered.consumers.map((entry) => entry.identity).sort(),
    [
      consumer.identity,
      f.sibling.identity,
      decision.identity,
      implementation.identity,
    ].sort(),
  );
  assert.equal(existsSync(`${f.integration}/.planning/seeds/B.md`), false);
  const originalGoal = textAt(f, ".planning/seeds/A.md");
  assert.ok(originalGoal.includes(boundedIntent));
  assert.ok(textAt(f, f.late.planPath).includes(boundedAssumption));
  const contract = await git(
    f.integration,
    "show",
    `${f.evidence}:${supplierPlan}`,
  );
  assert.match(
    contract.stdout,
    /retry interval is in seconds; legacy requests are rejected/,
  );

  // This explicit edit represents the bounded agent judgment, not a text-matching
  // inference by the command. Existing seconds intent settles the contract unit.
  writeAt(
    f,
    f.late.planPath,
    textAt(f, f.late.planPath).replace(boundedAssumption, verifiedAssumption),
  );
  assert.equal(
    textAt(f, f.late.planPath),
    `# Retry plan\n\n${verifiedAssumption}\n`,
  );
  assert.equal(textAt(f, ".planning/seeds/A.md"), originalGoal);
  const summaries = new Map([
    [
      consumer,
      "The completed integrated seconds endpoint directly proves this unchanged contract condition.",
    ],
    [
      f.sibling,
      `Verified ${f.late.planPath} seconds assumption against the completed endpoint proof and unchanged consumer seconds goal; no implementation was required by this condition.`,
    ],
    [
      decision,
      ".planning/seeds/decision.md leaves compatibility unspecified; the supplier rejects legacy requests. Supporting legacy requests or refusing them remains a developer choice. Next action: developer settles that promise.",
    ],
    [
      implementation,
      ".planning/seeds/implementation.md requires implemented retry UI. No consumer implementation is authorized or present. Next action: obtain separate consumer execution authorization; failed fulfillment verification leaves the condition waiting.",
    ],
  ]);
  for (const [story, summary] of summaries) {
    const state =
      story === decision
        ? "decision-needed"
        : story === implementation
          ? "waiting"
          : "satisfied";
    const result = await resolveConsumer(
      f,
      story,
      f.evidence,
      f.accepted,
      outcome(
        f,
        state,
        summary,
        story === decision ? { decision: question } : {},
      ),
    );
    assert.equal(result.code, 0, result.stderr);
  }
  const direct = await readDependencies(f.project, consumer);
  assert.equal(direct.dependencies[0].state, "satisfied");
  assert.deepEqual(
    direct.blocking.map((entry) => entry.supplier.identity),
    [f.third.identity],
  );
  assert.equal(
    (await readDependencies(f.project, f.sibling)).blocking.length,
    0,
  );
  const preserved = await readState(f.project, f.sibling);
  assert.equal(preserved.assessment.status, "not-ready");
  assert.deepEqual(preserved.assessment.reasons, [unrelatedReason]);
  assert.equal(preserved.assessment.changedSinceReview, true);
  const choice = await readDependencies(f.project, decision);
  assert.equal(choice.blocking[0].state, "decision-needed");
  assert.equal(choice.blocking[0].decision, question);
  assert.match(
    choice.blocking[0].resolution.summary,
    /Condition remains unresolved/,
  );
  assert.doesNotMatch(
    choice.blocking[0].resolution.summary,
    /Condition satisfied:/,
  );
  const required = await readDependencies(f.project, implementation);
  assert.equal(required.blocking[0].state, "waiting");
  assert.equal(required.blocking[0].condition, waitingCondition);
  assert.match(
    required.blocking[0].resolution.summary,
    /separate consumer execution authorization/,
  );

  const beforeRetry = new Map(
    [decision, implementation, f.sibling].map((story) => [
      story,
      textAt(f, `.planning/${story.link.split("#")[0]}`),
    ]),
  );
  for (const story of beforeRetry.keys()) {
    const held = (await readDependencies(f.project, story)).dependencies[0];
    const result = await resolveConsumer(
      f,
      story,
      f.evidence,
      f.accepted,
      held,
    );
    assert.equal(result.code, 0, result.stderr);
  }
  for (const [story, bytes] of beforeRetry)
    assert.equal(textAt(f, `.planning/${story.link.split("#")[0]}`), bytes);
  await publish(f, "publish independent consumer outcomes");
  const remoteBefore = await revParse(f.origin, "refs/heads/main");
  for (const story of [decision, implementation, f.sibling]) {
    const started = await startCliResult(
      f,
      "story-branch",
      story === f.sibling ? [] : startArgs(story),
      {
        identity: story.identity,
        name: story.identity.replace(/[^a-z]/gi, "-"),
      },
    );
    assert.equal(started.code, 1, JSON.stringify({ story, started }));
    assert.equal(existsSync(started.workspace), false);
    if (story === f.sibling) {
      assert.match(started.receipt.error, /preparation is not-ready/);
      assert.doesNotMatch(started.receipt.error, /execution is blocked/);
    } else {
      assert.match(started.receipt.error, /execution is blocked/);
      assert.ok(
        started.receipt.error.includes(
          story === decision ? question : waitingCondition,
        ),
      );
    }
  }
  assert.equal(await revParse(f.origin, "refs/heads/main"), remoteBefore);
});
