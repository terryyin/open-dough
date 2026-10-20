import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const finish = read("dough-execute-plan/references/finish-or-stop.md");
const mechanics = read("dough-execute-plan/references/ci-completion-wait.md");
const reportingInstruction = read(
  "../../dashboard/server/reportingInstruction.ts",
);

test("reviewed and skipped planned completion apply shared quiet or actionable judgment after the operation", () => {
  assert.match(
    finish,
    /both reviewed and skipped planned completion, apply the shared\s+\[completion attention\]\(\.\.\/\.\.\/dough-land\/references\/completion-attention\.md\)/,
  );
  assert.match(finish, /judgment after completion handling/);
  assert.match(
    finish,
    /when settled, give no\s+success message, or only the minimum native response/,
  );
  assert.match(
    finish,
    /add no slice, proof, advice,\s+CI or shutdown recap or execution-completion banner/,
  );
  assert.doesNotMatch(finish, /PLAN EXECUTION COMPLETE/);
  assert.match(
    finish,
    /attention remains, begin\s+with `DEVELOPER ATTENTION REQUIRED`[\s\S]+issue, consequence, next action\s+or decision, responsible owner[\s\S]+evidence or recovery links/,
  );
  assert.match(
    finish,
    /Keep an explicit review\/retain stop\s+and provide explicitly requested details/,
  );
});

test("one current attention set survives unrelated success and preserves its evidence", () => {
  assert.match(
    finish,
    /Consume the retrospective's current unresolved\s+attention[\s\S]+one combined\s+handoff/,
  );
  assert.match(
    finish,
    /Combine overlapping review items once; neither a later successful check\s+nor `Product advice: no change` settles an unresolved item/,
  );
  assert.match(
    finish,
    /Remove an item only\s+after its evidenced, authorized disposition/,
  );
  assert.match(
    finish,
    /Preserve that evidence in its\s+existing records and receipts/,
  );
  assert.match(
    finish,
    /Retain the completed plan, proof decisions, execution checkout, branch, and\s+worktree for story wrap-up; do not invoke it here/,
  );
});

test("partial review, missing history, failed completion and background state remain actionable", () => {
  assert.match(
    finish,
    /context\s+stop[\s\S]+partial review, observer, applicable target\/revision[\s\S]+writes no execution-complete record/,
  );
  assert.match(
    finish,
    /process history is unavailable, report the review limitation and continue/,
  );
  assert.match(
    finish,
    /failed delivery\/shutdown[\s\S]+required decision\/recovery action/,
  );
  assert.match(
    finish,
    /planned work[\s\S]+begin with `DEVELOPER ATTENTION REQUIRED`[\s\S]+actual gap and\s+required recovery/,
  );
  assert.match(
    finish,
    /background alternative[\s\S]+report its CI pending receipt and retained session,\s+observer and resources instead of a successful shutdown/,
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
    /`Product advice: retrospective skipped`[\s\S]+completion operation[\s\S]+handle its receipt[\s\S]+select the planned response below/,
  );
  assert.match(
    finish,
    /review returns[\s\S]+completion operation, handle its receipt, and select the planned response below/,
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

test("integrated-state evidence stays accurate without requiring a routine recap", () => {
  assert.match(
    mechanics,
    /`accepted` keeps its own\s+state[\s\S]+`validated`: SHA, run, attempt, URL, check, context/,
  );
  assert.match(mechanics, /Retain both\s+revisions as evidence/);
  assert.match(
    mechanics,
    /When details are requested or needed for an action, say/,
  );
  assert.match(
    mechanics,
    /never that the accepted revision passed[\s\S]+requires no routine\s+success recap/,
  );
  assert.match(mechanics, /Keep the accepted SHA as the publication receipt/);
});
