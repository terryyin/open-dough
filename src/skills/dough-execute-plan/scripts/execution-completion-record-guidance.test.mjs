import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const finish = read("dough-execute-plan/references/finish-or-stop.md");
const monitor = read("dough-execute-plan/references/ci-monitor.md");
const planning = read("dough-story-refinement/references/planning.md");
const retrospective = read("dough-execution-retrospective/SKILL.md");
const wrapUp = read("dough-story-wrap-up/SKILL.md");

// A section runs from its heading to the next `## ` heading.
const section = (text, heading) => {
  const lines = text.split("\n");
  const start = lines.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading}`);
  const next = lines.findIndex(
    (line, index) => index > start && line.startsWith("## "),
  );
  return lines.slice(start + 1, next === -1 ? undefined : next).join("\n");
};

// The documented record is the section's fenced Markdown example; the prose
// around it is the guidance.
const recordHeading = "## Record execution completion";
const recordStart = finish.indexOf(`\n${recordHeading}\n`);
assert.notEqual(recordStart, -1, `missing ${recordHeading}`);
const example = /\n```markdown\n(?<body>[\s\S]*?)\n```\n/.exec(
  finish.slice(recordStart),
);
assert.ok(example, `missing fenced record example under ${recordHeading}`);
const recordExample = example.groups.body;
const record = section(finish.replace(example[0], "\n"), recordHeading);

const recordLink =
  /\[execution-complete record\]\([^)]*#record-execution-completion\)/;

test("finish-or-stop's documented record is read by the plan reader as the plan's product advice", () => {
  const advice = "Queue a follow-up story for card wording.";
  assert.match(recordExample, /<advice>/, "record example has no advice slot");
  const plan = readPlanSlices(`# Plan

## Ordered slices

### 1. Only outcome
Type: Behavior
Status: done

${recordExample.replace("<advice>", advice)}
`);
  assert.equal(plan.status, "interpreted");
  assert.equal(plan.slices.length, 1);
  assert.deepEqual(plan.completion, { advice });
});

test("execution completion writes the record after review returns or is skipped", () => {
  assert.match(
    record,
    /retrospective returns[\s\S]+skipped[\s\S]+record[\s\S]+after[\s\S]+ordered slices/,
  );
  assert.match(record, /review's product advice[\s\S]+no-change/);
  assert.match(record, /continue[\s\S]+until the next `## ` heading/);
  assert.match(
    finish,
    new RegExp(
      `review returns[\\s\\S]+publish[\\s\\S]+${recordLink.source}[\\s\\S]+completion\\s+operation`,
    ),
  );
});

test("the record and the retrospective's records form one published commit before the wait", () => {
  assert.match(
    record,
    /[Cc]ommit[\s\S]+record[\s\S]+retrospective's records[\s\S]+execution\s+checkout[\s\S]+correction story and plan[\s\S]+`DearDough\.md`[\s\S]+one commit/,
  );
  assert.match(
    record,
    /[Pp]ublish[\s\S]+\]\(trunk-publication\.md#publish-an-execution-increment-or-repair\)[\s\S]+before the completion operation[\s\S]+not start\s+another CI or publication path/,
  );
  assert.match(
    monitor,
    new RegExp(
      `publish[\\s\\S]+${recordLink.source}[\\s\\S]+exactly one completion action`,
    ),
  );
  assert.match(
    finish,
    /correction stories\s+and plans[\s\S]+this execution's changes[\s\S]+completion commit/,
  );
  assert.doesNotMatch(finish, /for wrap-up to commit/);
});

test("skips record their reason and a context stop writes no record", () => {
  assert.match(
    finish,
    new RegExp(
      `skipped, publish[\\s\\S]+${recordLink.source}[\\s\\S]+\`Product advice: retrospective skipped\`[\\s\\S]+completion operation`,
    ),
  );
  assert.match(
    record,
    /`retrospective skipped`[\s\S]+skipped the retrospective[\s\S]+`product review skipped`[\s\S]+`--skip-product`/,
  );
  assert.match(
    finish,
    /context\s+stop[\s\S]+claiming review completion[\s\S]+writes no execution-complete record/,
  );
});

test("the final handoff reports the recorded product advice", () => {
  assert.match(
    finish,
    /skipped[\s\S]+report[\s\S]+recorded product advice[\s\S]+CI verdict[\s\S]+`## PLAN EXECUTION COMPLETE`/,
  );
  assert.match(
    finish,
    /review returns[\s\S]+report completion[\s\S]+recorded product advice[\s\S]+CI verdict[\s\S]+`## PLAN EXECUTION COMPLETE`[\s\S]+final execution\/review handoff/,
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
    /execution completion[\s\S]+after the\s+ordered slices[\s\S]+\]\(\.\.\/\.\.\/dough-execute-plan\/references\/finish-or-stop\.md#record-execution-completion\)[\s\S]+`## Execution complete`[\s\S]+`Product advice:`[\s\S]+required[\s\S]+not write it while planning/,
  );
  assert.match(plan, /not a\s+plan-level status line[\s\S]+plans define none/);
});

test("the invoking execution, not wrap-up, commits the retrospective's records", () => {
  assert.match(
    retrospective,
    /that execution commits those records[\s\S]+completion commit/,
  );
  assert.doesNotMatch(retrospective, /wrap-up commits those records/);
  assert.match(
    retrospective,
    /do not implement, commit, push, or change the backlog/,
  );
});

test("wrap-up takes the plan's recorded product advice as input", () => {
  assert.match(
    section(wrapUp, "## Resolve this project's context"),
    new RegExp(`product advice[\\s\\S]+${recordLink.source}`),
  );
});

test("wrap-up applies the recorded advice when the conversation has none, and human input wins", () => {
  const apply = section(wrapUp, "## Apply product-review decisions");
  assert.match(apply, /apply only authorized[\s\S]+compatible backlog/);
  assert.match(
    apply,
    /Without retrospective advice[\s\S]+conversation[\s\S]+recorded product advice/,
  );
  assert.match(apply, /human input wins/);
});

test("wrap-up does not recommit the completion commit's records and still deletes the plan", () => {
  const commit = section(
    wrapUp,
    "## Commit closure inputs and preserve Git recovery",
  );
  assert.match(
    commit,
    /Commit all uncommitted owned review and closure-input changes/,
  );
  assert.match(
    commit,
    /already committed[\s\S]+\]\(\.\.\/dough-execute-plan\/references\/finish-or-stop\.md#record-execution-completion\)[\s\S]+no second commit/,
  );
  assert.match(
    section(wrapUp, "## Delete spent history, including shared records"),
    /executable plan[\s\S]+even\s+when the plan was retained or carries its execution-complete record/,
  );
});
