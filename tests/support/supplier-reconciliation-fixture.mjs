// Consumer intent is starting input; real commands own outcome records.
import assert from "node:assert/strict";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { admitArgs } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs";
import { readState, recordArgs } from "./story-state-fixture.mjs";
import {
  fixture,
  consumer,
  supplier,
  dependency,
  updateDependency,
  supplierPlan,
  plan,
  publish,
  run,
} from "./supplier-dependency-fixture.mjs";

export const question =
  "Which endpoint compatibility behavior does the consumer promise?";
export const decision = {
  identity: "RECON-DECISION",
  link: "seeds/decision.md",
  goal: "Show retry intervals; compatibility behavior is unspecified.",
};
export const implementation = {
  identity: "RECON-IMPLEMENTATION",
  link: "seeds/implementation.md",
  goal: "Show retry intervals in the implemented consumer UI.",
};
export const waitingCondition =
  "The supplier endpoint is integrated and this consumer retry UI is implemented and verified.";
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
  for (const story of [decision, implementation]) {
    writeAt(
      f,
      `.planning/${story.link}`,
      `# Consumer\n\n**Identity:** ${story.identity}\n\n**Goal:** ${story.goal}\n`,
    );
    const result = await updateDependency(
      f.project,
      story,
      dependency(supplier, {
        ...(story === implementation && { condition: waitingCondition }),
      }),
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
      expectDocument: state.basis.document,
      expectPlan: state.basis.plan,
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
    f.sibling.link,
    "--position",
    "last",
  ]);
  assert.equal(queued.code, 0, queued.stderr);
  writeAt(
    f,
    supplierPlan,
    `${plan("done")}\nContract proof: retry interval is in seconds; legacy requests are rejected.\n`,
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
  admitArgs(story.identity, story.link, story.identity);
