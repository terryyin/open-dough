import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const finish = read("dough-execute-plan/references/finish-or-stop.md");
const monitor = read("dough-execute-plan/references/ci-monitor.md");
const planning = read("dough-story-refinement/references/planning.md");
const retrospective = read("dough-execution-retrospective/SKILL.md");

// A section ends at the next `## ` heading outside a fenced example.
const section = (text, heading) => {
  const lines = text.split("\n");
  const start = lines.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading}`);
  let fenced = false;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("```")) fenced = !fenced;
    if (!fenced && line.startsWith("## ")) break;
    body.push(line);
  }
  return body.join("\n");
};
const record = section(finish, "## Record execution completion");

test("execution completion writes the record after review returns or is skipped", () => {
  assert.match(
    record,
    /After the retrospective returns, or is skipped, add this record to the plan\s+after its ordered slices/,
  );
  assert.match(
    record,
    /```markdown\n## Execution complete\n\nProduct advice: /,
  );
  assert.match(
    record,
    /advice from the review's product advice or reasoned no-change[\s\S]+until the next `## ` heading/,
  );
  assert.match(
    finish,
    /When review returns, publish the\s+\[execution-complete record\]\(#record-execution-completion\), invoke the\s+completion operation/,
  );
});

test("the record and the retrospective's records form one published commit before the wait", () => {
  assert.match(
    record,
    /Commit\s+the record together with the retrospective's records written in the execution\s+checkout — a correction plan, `DearDough\.md` process findings — as one commit/,
  );
  assert.match(
    record,
    /Publish it through\s+\[increment delivery\]\(trunk-publication\.md#publish-an-execution-increment-or-repair\)\s+before the completion operation, so the completion wait covers it; do not start\s+another CI or publication path/,
  );
  assert.match(
    monitor,
    /publish\s+the\s+plan's\s+\[execution-complete record\]\(finish-or-stop\.md#record-execution-completion\),\s+then invoke exactly one completion action/,
  );
  assert.match(
    finish,
    /correction plans stay\s+with this execution's changes and enter its completion commit/,
  );
  assert.doesNotMatch(finish, /for wrap-up to commit/);
});

test("skips record their reason and a context stop writes no record", () => {
  assert.match(
    finish,
    /When skipped, publish the\s+\[execution-complete record\]\(#record-execution-completion\) with\s+`Product advice: retrospective skipped`, then invoke the completion operation/,
  );
  assert.match(
    record,
    /Write `retrospective skipped` when this execution skipped the retrospective,\s+and `product review skipped` when the review ran with `--skip-product`/,
  );
  assert.match(
    finish,
    /retrospective context\s+stop[\s\S]+claiming review completion\. It writes no execution-complete record\./,
  );
});

test("the final handoff reports the recorded product advice", () => {
  assert.match(
    finish,
    /report the recorded product advice and the CI verdict[\s\S]+`## PLAN EXECUTION COMPLETE`/,
  );
  assert.match(
    finish,
    /report completion, judged proof,\s+the recorded product advice, CI verdict or limitation[\s\S]+`## PLAN EXECUTION COMPLETE` as the final execution\/review handoff/,
  );
});

test("wholly planless completion keeps its record-free handoff", () => {
  assert.match(
    finish,
    /Wholly planless completion[\s\S]+`## QUICK EXECUTION COMPLETE`[\s\S]+without automatic retrospective/,
  );
});

test("planning names the execution-complete record and its form", () => {
  const plan = section(planning, "## Write an executable plan");
  assert.match(
    plan,
    /At execution completion, the executing agent adds one more element after the\s+ordered slices: the\s+\[execution-complete record\]\(\.\.\/\.\.\/dough-execute-plan\/references\/finish-or-stop\.md#record-execution-completion\),\s+a `## Execution complete` section whose `Product advice:` entry is required\.\s+Do not write it while planning\./,
  );
  assert.match(plan, /not a\s+plan-level status line;\s+plans define none/);
});

test("the invoking execution, not wrap-up, commits the retrospective's records", () => {
  assert.match(
    retrospective,
    /write there; that execution commits those records in its\s+completion commit/,
  );
  assert.doesNotMatch(retrospective, /wrap-up commits those records/);
  assert.match(
    retrospective,
    /do not implement, commit, push, or change the backlog/,
  );
});
