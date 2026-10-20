import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";
import { readPlanSlices } from "../../dough-product-backlog/scripts/product-backlog-plan-reader.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const finish = read("dough-execute-plan/references/finish-or-stop.md");
const monitor = read("dough-execute-plan/references/ci-monitor.md");
const planning = read("dough-story-refinement/references/planning.md");
const retrospective = read("dough-execution-retrospective/SKILL.md");
const wrapUp = read("dough-story-wrap-up/SKILL.md");
const reportingInstruction = read(
  "../../dashboard/server/reportingInstruction.ts",
);

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

test("the execution-complete handoff reports attention only when a supplied dashboard context needs the developer", () => {
  const handoff = section(
    finish,
    "## Report attention at the execution-complete handoff",
  );
  // Conditional on the launch-supplied context, named for the executing agent.
  assert.match(
    handoff,
    /only when the launch supplied a dashboard reporting context[\s\S]+project, host, launch reference, and reporting command/,
  );
  assert.match(
    handoff,
    /Without\s+that context, make no dashboard report at this handoff/,
  );
  // After the record and the completion operation receipts, before Land/Wrap Up.
  assert.match(
    handoff,
    /before Dough Land\s+or Story Wrap Up\. For a completed handoff it is after the[\s\S]+execution-complete record[\s\S]+published and\s+the completion operation's receipts are handled/,
  );
  assert.match(
    finish,
    /`Product advice: retrospective skipped`[\s\S]+completion operation[\s\S]+apply\s+\[report attention at the execution-complete handoff\]\(#report-attention-at-the-execution-complete-handoff\)/,
  );
  assert.match(
    finish,
    /review returns[\s\S]+completion operation, handle its receipt, apply\s+\[report attention at the execution-complete handoff\]\(#report-attention-at-the-execution-complete-handoff\)/,
  );
  // Exact response, outcome per result, receipt awaited before giving it.
  assert.match(
    handoff,
    /finished with a reminder, write that exact response to a message file,\s+append `--outcome completed --message-file <file>`[\s\S]+wait for its matching receipt before giving exactly that\s+response/,
  );
  assert.match(
    handoff,
    /incomplete, failed, cancelled, or human-judgment stop[\s\S]+settle the exact stop response[\s\S]+`--outcome unfinished --message-file <file>`[\s\S]+wait for its matching receipt before giving\s+exactly that response/,
  );
  assert.match(
    finish,
    /For incomplete work, failed delivery\/shutdown, cancellation, or a human-judgment stop, report[\s\S]+apply\s+\[report attention at the execution-complete handoff\]\(#report-attention-at-the-execution-complete-handoff\)\s+as an unfinished report/,
  );
  // Quiet success submits nothing at the handoff; Land/Wrap Up stays final.
  assert.match(
    handoff,
    /nothing at the handoff requires attention, submit nothing there, so a\s+plain completed report at Dough Land or Story Wrap Up stays the quiet final\s+operation/,
  );
  assert.match(
    handoff,
    /handoff report is attention-only: it does not stop the session,\s+declare the story complete, or invoke Dough Land or Story Wrap Up/,
  );
});

test("the launch-supplied dashboard reporting context names the same execution-complete handoff", () => {
  for (const rule of [
    /execution-complete handoff, before Dough Land or Story Wrap Up, submit that handoff[\s\S]+--outcome completed when it finished with a reminder, or --outcome unfinished when it is unfinished[\s\S]+--message-file <file containing your exact response>, and wait for its receipt/,
    /nothing at that handoff requires attention, submit nothing there/,
    /handoff submission is not the final operation: Dough Land or Story Wrap Up remains the final operation, with quiet --outcome completed/,
    /For Dough Land or Story Wrap Up, after all required operations and final wording settle, append --outcome completed with no message file/,
  ])
    assert.match(reportingInstruction, rule);
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
