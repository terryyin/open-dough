// Instruction contracts only. Native agent continuation and genuine stops have
// separate acceptance; these checks must not be reported as native behavior.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const finish = read("dough-execute-plan/references/finish-or-stop.md");
const continuationHeading = "## Continue settled planned work into wrap-up";
const continuation = section(finish, continuationHeading);
const completion = finish.slice(0, finish.indexOf(continuationHeading));
const wrapUp = read("dough-story-wrap-up/SKILL.md");
const followUp = read(
  "dough-story-wrap-up/references/follow-up-disposition.md",
);

test("reviewed and skipped branches reach continuation after the published record and completion receipt", () => {
  const branches = completion.split("Otherwise invoke");
  assert.equal(branches.length, 2);
  for (const branch of branches) {
    const record = branch.indexOf("[execution-complete record]");
    const operation = branch.indexOf("completion operation", record);
    const receipt = branch.indexOf("handle its receipt", operation);
    const onward = branch.indexOf(
      "[planned continuation](#continue-settled-planned-work-into-wrap-up)",
      receipt,
    );
    assert.ok(record >= 0 && operation > record && receipt > operation);
    assert.ok(onward > receipt, "missing onward transition after completion");
  }
  assert.match(continuation, /both reviewed and skipped planned completion/);
  assert.match(
    continuation,
    /quick attempt[\s\S]+continued into planned execution/,
  );
  assert.match(continuation, /selected review or explicit skip/);
  assert.match(
    continuation,
    /record publication[\s\S]+completion operation are settled/,
  );
});

test("settled planned execution invokes its existing closure owner without another instruction", () => {
  assert.match(
    continuation,
    /When no such stop remains, invoke\s+\[dough-story-wrap-up\]\(\.\.\/\.\.\/dough-story-wrap-up\/SKILL\.md\)[\s\S]+same session\s+and execution checkout/,
  );
  assert.match(
    continuation,
    /no second worktree, Take, review,[\s\S]+confirmation or separate wrap-up instruction/,
  );
  assert.doesNotMatch(finish, /do not invoke it here/);
  assert.match(
    wrapUp,
    /coordinator invokes wrap-up explicitly or through Execute[\s\S]+authorized \[planned continuation\]/,
  );
  assert.match(wrapUp, /same execution context and publication authority/);
});

test("continuation carries closure context and preserves the selected publication authority", () => {
  for (const context of [
    /story\/source, plan and approved\s+changes/,
    /proof decisions, review results and authorized dispositions/,
    /execution\s+identity, mode, checkout\/branch management context/,
    /publication target and\s+receipts, CI\/shutdown state/,
    /supplied dashboard launch\/reporting\/landing\s+context/,
  ])
    assert.match(continuation, context);
  assert.match(
    continuation,
    /missing required input[\s\S]+stop before the affected action/,
  );
  assert.match(continuation, /Preserve local-only\/no-push\s+authority/);
  assert.match(continuation, /no additional publication permission/);
  assert.match(wrapUp, /Local-only closure[\s\S]+does not push/);
});

test("settled findings defer disposition to wrap-up rather than creating approval or execution authority", () => {
  assert.match(continuation, /recorded process finding alone is no stop/);
  assert.match(
    continuation,
    /valid retrospective correction[\s\S]+authorized default disposition[\s\S]+\[follow-up disposition\]\(\.\.\/\.\.\/dough-story-wrap-up\/references\/follow-up-disposition\.md\)/,
  );
  assert.match(
    continuation,
    /Let wrap-up apply it once; do not require queueing before invoking its owner/,
  );
  assert.match(
    continuation,
    /duplicate its disposition rules, or execute the correction/,
  );
  assert.match(
    continuation,
    /Product changes[\s\S]+existing delegated authority or explicit human direction/,
  );
  assert.match(
    continuation,
    /recommendation alone grants no[\s\S]+adoption or drop authority/,
  );
  assert.match(followUp, /No further approval is needed/);
  assert.match(followUp, /Do not refine, replan, or execute it/);
  assert.match(followUp, /Repeating wrap-up[\s\S]+must[\s\S]+not duplicate/);
});

test("human choices and explicit stops still block the dependent continuation", () => {
  for (const stop of [
    /human-owned product, constraint, ownership or permission decision/,
    /missing[\s\S]+required context[\s\S]+incomplete correction input/,
    /unfinished required[\s\S]+review/,
    /failed\/unconfirmed required operation stops the dependent path/,
    /Keep an explicit review\/retain\/stop instruction/,
  ])
    assert.match(continuation, stop);
  assert.match(
    continuation,
    /Confidence, silence, a ready assessment or green CI cannot settle/,
  );
  assert.match(
    continuation,
    /skipped optional review creates no new[\s\S]+question/,
  );
  assert.match(
    continuation,
    /requested details without inventing a review[\s\S]+stop/,
  );
  assert.match(continuation, /terminal continuation[\s\S]+needed to resume/);
  assert.match(
    continuation,
    /`DEVELOPER ATTENTION REQUIRED`[\s\S]+issue, consequence, next action/,
  );
});

test("eligible continuation reaches closure reporting without a premature response or dashboard submission", () => {
  assert.match(
    continuation,
    /no final execution response, routine recap or quiet dashboard report[\s\S]+between workflows/,
  );
  assert.match(
    continuation,
    /Execution success alone does not[\s\S]+declare the story or session Done/,
  );
  assert.match(
    continuation,
    /Wrap-up owns assimilation[\s\S]+publication\/integration,[\s\S]+CI\/shutdown and safe retirement/,
  );
  assert.match(
    continuation,
    /dashboard operation and matching receipt follow those closure gates/,
  );
  assert.match(continuation, /Direct use makes no dashboard contact/);
  const report = section(wrapUp, "## Report");
  assert.match(
    report,
    /\[final dashboard operation\][\s\S]+after either closure path has settled/,
  );
  const dashboard = read("dough-land/references/dashboard-completion.md");
  assert.match(
    dashboard,
    /publication, observation\/shutdown, refresh, and retirement have settled/,
  );
  assert.match(
    dashboard,
    /final operation[\s\S]+`--outcome completed`[\s\S]+no message file/,
  );
  assert.match(dashboard, /Wait for a matching receipt/);
});

test("whole-journey recovery resumes unfinished closure without repeating accepted work or losing resources", () => {
  assert.match(
    continuation,
    /closure fails or is held, preserve the workspace, resumable session, proof and[\s\S]+active records/,
  );
  assert.match(
    continuation,
    /Successful execution is not successful[\s\S]+closure/,
  );
  assert.match(
    continuation,
    /first unfinished operation without repeating accepted[\s\S]+publication, completed review or settled dispositions/,
  );
  assert.match(continuation, /already[\s\S]+queued canonical correction/);
  assert.match(
    continuation,
    /retirement cannot erase resources needed by an unresolved[\s\S]+choice/,
  );
  assert.match(
    continuation,
    /execution-branch CI receipt never[\s\S]+substitutes for required trunk-integration observation/,
  );
});

test("wholly planless and explicit background journeys retain their own handoffs", () => {
  const other = section(finish, "## Other completion and stop paths");
  assert.match(
    other,
    /Wholly planless completion[\s\S]+`## QUICK EXECUTION COMPLETE`/,
  );
  assert.match(
    other,
    /without automatic retrospective or automatic planned continuation/,
  );
  assert.match(other, /invokes wrap-up separately/);
  assert.match(
    completion,
    /explicit background[\s\S]+CI\/shutdown remains pending[\s\S]+do not[\s\S]+automatically continue into wrap-up/,
  );
  const fixture = read("../../tests/support/ci-completion-native-fixture.sh");
  assert.match(
    fixture,
    /Do not implement new product behavior or invoke story wrap-up/,
  );
});
