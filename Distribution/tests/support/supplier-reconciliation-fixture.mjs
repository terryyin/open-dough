// Consumer intent is starting input; real commands own outcome records.
import { makeMe } from "./makeMe.mjs";
import { identityLine } from "../../src/skills/dough-product-backlog/scripts/product-backlog-identity.mjs";
import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { admitArgs } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { readState, recordArgs } from "./story-state-fixture.mjs";
import {
  fixture,
  consumer,
  supplier,
  updateDependency,
  supplierPlan,
  plan,
  publish,
  run,
} from "./supplier-dependency-fixture.mjs";

export const question =
  "Which endpoint compatibility behavior does the consumer promise?";
export const decision = makeMe.aBacklogEntry
  .with({
    identity: "RECON-DECISION",
    href: "seeds/decision.md",
    title: "Decision consumer",
  })
  .please();
export const decisionGoal =
  "Show retry intervals; compatibility behavior is unspecified.";
export const missingCapability = makeMe.aBacklogEntry
  .with({
    identity: "RECON-MISSING-CAPABILITY",
    href: "seeds/missing-capability.md",
    title: "Missing-capability consumer",
  })
  .please();
export const missingCapabilityGoal =
  "Show fractional-second retry intervals in the consumer UI.";
export const supplierCondition =
  "The integrated supplier endpoint supports fractional-second retry intervals.";
export const boundedAssumption = "Retry intervals use milliseconds.";
export const verifiedAssumption = "Retry intervals use seconds.";
export const boundedIntent =
  "Show retry intervals in seconds. Scope: update existing contract assumptions only.";
export const unrelatedReason = "Consumer layout choice remains unresolved.";

export const textAt = (f, path) =>
  readFileSync(join(f.integration, path), "utf8");
export const writeAt = (f, path, text) =>
  writeFileSync(join(f.integration, path), text);

export async function reconciliationFixture(t) {
  const f = await fixture(t);
  const home = ".planning/seeds/A.md";
  writeAt(
    f,
    home,
    textAt(f, home)
      .replace(
        `**Identity:** ${consumer.identity}`,
        `**Identity:** ${consumer.identity}\n\n**Scope:** Consume the completed seconds contract unchanged.`,
      )
      .replace("**Goal:** Deliver late work.", `**Goal:** ${boundedIntent}`),
  );
  writeAt(f, f.late.planPath, `# Retry plan\n\n${boundedAssumption}\n`);
  for (const { entry, goal } of [
    { entry: decision, goal: decisionGoal },
    { entry: missingCapability, goal: missingCapabilityGoal },
  ]) {
    // Whole-document homes share identity from MakeMe; purpose stays explicit.
    writeAt(
      f,
      `.planning/${entry.href}`,
      `# Consumer\n\n${identityLine(entry.identity)}\n\n**Goal:** ${goal}\n`,
    );
    const result = await updateDependency(
      f.project,
      entry,
      makeMe.aSupplierAgreement
        .with({
          supplier,
          state: "waiting",
          ...(entry === missingCapability && { condition: supplierCondition }),
        })
        .please(),
    );
    assert.equal(result.code, 0, result.stderr);
  }
  const state = await readState(f.project, f.sibling);
  const prepared = await run(
    f.project,
    recordArgs(f.sibling, {
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/late/PLAN.md",
      assessment: "not-ready",
      reasons: [unrelatedReason],
      expectedBasis: state.basis,
    }),
  );
  assert.equal(prepared.code, 0, prepared.stderr);
  const queued = await run(f.project, [
    "add",
    "--identity",
    f.sibling.identity,
    "--title",
    "Retry consumer",
    "--link",
    f.sibling.href,
    "--position",
    "last",
  ]);
  assert.equal(queued.code, 0, queued.stderr);
  writeAt(
    f,
    supplierPlan,
    `${plan("done")}\nContract proof: retry interval is in seconds; legacy requests are rejected; fractional-second intervals are rejected.\n`,
  );
  const evidence = await publish(
    f,
    "completed seconds endpoint and consumer intentions",
  );
  const closed = await run(f.project, [
    "complete",
    "--identity",
    supplier.identity,
  ]);
  assert.equal(closed.code, 0, closed.stderr);
  rmSync(join(f.integration, ".planning/seeds/B.md"));
  rmSync(join(f.integration, supplierPlan));
  const accepted = await publish(f, "supplier integrated and cleaned up");
  return { ...f, evidence, accepted };
}

export function outcome(f, state, summary, extra = {}) {
  return {
    state,
    resolution: {
      revision: f.evidence,
      path: ".planning/seeds/B.md#b",
      summary,
    },
    ...extra,
  };
}

export const startArgs = (story) =>
  admitArgs(story.identity, story.href, story.identity);
