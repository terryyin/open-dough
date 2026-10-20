// Instruction contracts only. These checks do not establish native agent behavior.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const retrospective = read("dough-execution-retrospective/SKILL.md");
const report = section(retrospective, "## Report");

test("standalone review uses shared judgment for quiet completion or actionable attention", () => {
  assert.match(
    report,
    /\[completion attention\]\(\.\.\/dough-land\/references\/completion-attention\.md\)/,
  );
  assert.match(report, /standalone review owns its response/);
  assert.match(report, /finish\s+quietly when settled/);
  assert.match(
    report,
    /without a routine success\/no-findings recap or completion\s+banner/,
  );
  assert.match(report, /attention phrase before\s+the actionable issue/);
  assert.match(
    report,
    /consequence, next action or decision, owner when known/,
  );
  assert.match(report, /relevant evidence\/record links/);
  assert.match(
    report,
    /draft awaiting keep or\s+disposition requires attention/,
  );
  assert.match(report, /already settled record does not/);
  assert.doesNotMatch(retrospective, /EXECUTION RETROSPECTIVE COMPLETE/);
});

test("requested detail and unavailable review inputs preserve actionable limits", () => {
  assert.match(
    report,
    /Requested\s+details or an explicit review\/retain stop[\s\S]+needed review evidence/,
  );
  assert.match(
    report,
    /missing attribution, proof, requested process history or failed recording/,
  );
  assert.match(report, /limit completion claims to the supported review/);
  assert.match(
    report,
    /preserve partial conclusions[\s\S]+input\/action needed to continue/,
  );
  assert.match(
    retrospective,
    /Missing decision-relevant context stops that path with a named gap/,
  );
  assert.match(
    retrospective,
    /required history\s+is unavailable[\s\S]+continue\s+independently supported reviews/,
  );
  assert.match(
    retrospective,
    /`--skip-process` and `--skip-product` omit their analysis/,
  );
});

test("automatic review returns evidence and current attention to execution without a separate report", () => {
  assert.match(
    report,
    /invoked automatically[\s\S]+return\s+immediately[\s\S]+completion operation/,
  );
  assert.match(
    report,
    /without a separate visible\s+final report or confirmation/,
  );
  assert.match(report, /completion or partial state/);
  assert.match(
    report,
    /retained evidence and record links, product advice\/skip reasons/,
  );
  assert.match(report, /current\s+unresolved attention/);
  assert.match(
    report,
    /return completes review, not the execution's final CI\s+handoff/,
  );
  assert.match(report, /invoking execution owns its combined final response/);
  assert.match(
    report,
    /each currently unresolved item once[\s\S]+current disposition and designated writer/,
  );
  assert.match(report, /successful check cannot\s+settle a finding/);
  assert.match(
    report,
    /resume\s+only the affected conclusions using the retained review state/,
  );
  assert.match(
    retrospective,
    /Do\s+not invoke the CI wait, stop or replace its observer, acknowledge its events/,
  );
});

test("quiet output preserves existing evidence, writer, recording and disposition ownership", () => {
  assert.match(
    report,
    /identity\/completion, provenance, manifest\/boundary, judged proof/,
  );
  assert.match(
    report,
    /recording results, and product\s+advice\/reasoned no-change/,
  );
  assert.match(report, /pending CI target\/revision as pending/);
  assert.match(
    report,
    /no\s+separate report artifact or persistent attention ledger/,
  );
  assert.match(
    retrospective,
    /do not implement, commit, push, or change the backlog/,
  );
  assert.match(retrospective, /Only the designated writer changes the plan/);
  assert.match(
    retrospective,
    /writing the follow-up neither queues nor\s+authorizes it/,
  );
  assert.match(
    retrospective,
    /report the written result's pending disposition/,
  );

  const recording = read(
    "dough-execution-retrospective/references/process-finding-recording.md",
  );
  const bounded = read(
    "dough-execution-retrospective/references/bounded-process-log.md",
  );
  for (const guidance of [recording, bounded]) {
    assert.match(guidance, /\(\.\.\/SKILL\.md#report\)/);
  }
  assert.match(
    recording,
    /Retain and return[\s\S]+required size\/retention warnings or refusal/,
  );
  assert.match(recording, /unresolved warning or refusal remains actionable/);
  assert.match(bounded, /calling review as evidence/);
  assert.match(bounded, /500-line\s+warning when step 5 applies/);
  assert.match(bounded, /Never describe those cases as successful writes/);
});
