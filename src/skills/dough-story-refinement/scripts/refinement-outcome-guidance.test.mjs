// Refinement outcome guidance: each refined story ends with exactly one of
// three outcomes; ready outcomes give a link and workspace, then continue into
// slice planning, or give a next step when the invocation ends at refinement;
// engagement lists each expected response; the reported outcome records
// nothing and grants no planless authority.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");
const skillText = read("SKILL.md");
const outcome = section(skillText, "## Report the refinement outcome");

test("refinement reports through the outcome section and keeps its disposition step", () => {
  assert.match(
    skillText,
    /Report each selected story under\s+\[report the refinement outcome\]\(#report-the-refinement-outcome\)/,
  );
  assert.match(
    skillText,
    /keep or discard decision, then close or retain the workspace/,
  );
  assert.doesNotMatch(skillText, /unresolved decisions/);
});

test("each story ends with exactly one of three outcomes, judged independently", () => {
  assert.match(outcome, /exactly one outcome/);
  assert.match(outcome, /\*\*Ready for slice planning\*\*/);
  assert.match(outcome, /\*\*Flawless — ready for execution\*\*/);
  assert.match(outcome, /\*\*Needs human engagement\*\*/);
  assert.match(outcome, /judge each independently/);
  assert.match(outcome, /open decision stays with that story/);
});

test("flawless is defined only by existing sizing, premise, and authority rules", () => {
  assert.match(outcome, /problem-decomposition\.md#size-and-escalate-slices/);
  assert.match(outcome, /one\s+planless slice/);
  assert.match(outcome, /dough-slice-planning\/SKILL\.md#write-the-plan/);
  assert.match(outcome, /no decisive premise/);
  assert.match(outcome, /record-preparation\.md#planless-authority/);
  assert.match(outcome, /Flawless grants no/);
});

test("a ready outcome gives link and workspace, then continues into slice planning without a recap or question", () => {
  assert.match(outcome, /story link/);
  assert.match(
    outcome,
    /where the draft is \(its\s+workspace, and its result commit once committed\)/,
  );
  assert.match(outcome, /Do not recap/);
  assert.match(
    outcome,
    /continue into slice planning under\s+\[preparation journey\]\(references\/preparation-journey\.md\) without a question or\s+approval request/,
  );
});

test("an invocation that ends at refinement gives one next step without a question", () => {
  assert.match(
    outcome,
    /ends at the refinement result, on an explicit refine-only\s+instruction \(`--refine-only`\) or under\s+\[one-shot refinement\]\(references\/one-shot-refinement\.md\)/,
  );
  assert.match(outcome, /one concrete next step/);
  assert.match(outcome, /slice planning in that workspace/);
  assert.match(outcome, /explicit instruction to skip\s+slice planning/);
  assert.match(
    outcome,
    /next step uses that plan instead\s+of creating another/,
  );
  assert.match(
    outcome,
    /Preparing assignment as\s+information, not as a request to keep/,
  );
  assert.match(outcome, /end without a question or\s+approval request/);
});

test("needs human engagement lists each expected response and its causes", () => {
  assert.match(outcome, /each expected response separately/);
  assert.match(outcome, /who decides/);
  assert.match(outcome, /recommended answer when you have one/);
  assert.match(outcome, /what continues once it is given/);
  assert.match(outcome, /goal, scope, or\s+constraint decision/);
  assert.match(outcome, /splitting, merging, or dropping/);
  assert.match(outcome, /missing required context/);
  assert.match(outcome, /stopped write, recording, or\s+landing/);
  assert.match(outcome, /Claim no readiness/);
  assert.match(outcome, /who can supply it/);
  assert.match(outcome, /do not claim that refinement was recorded/);
});

test("the reported outcome leaves recorded facts and readiness assessment unchanged", () => {
  assert.match(outcome, /reported, not recorded/);
  assert.match(outcome, /`refined`/);
  assert.match(
    outcome,
    /existing selected approach and plan association,\s+otherwise an unselected approach/,
  );
  assert.match(outcome, /neither creates nor renews `ready`/);
  assert.match(outcome, /never selects `planless`/);
  assert.match(
    outcome,
    /record-preparation\.md#assess-readiness-at-preparation-completion/,
  );
});

const oneShot = read("references/one-shot-refinement.md");
const outcomeLink = /\.\.\/SKILL\.md#report-the-refinement-outcome/;

test("one-shot review reports the outcome with its committed result for review", () => {
  const review = section(oneShot, "## Stop for review");
  assert.match(review, outcomeLink);
  assert.match(review, /workspace path and branch/);
  assert.match(review, /`startingRevision`/);
  assert.match(review, /result commit for review/);
  assert.match(review, /recorded refinement, approach, and\s+assessment/);
  assert.match(review, /cannot see this refinement\s+until it lands/);
  assert.doesNotMatch(oneShot, /unresolved decisions/);
});

test("one-shot automatic landing lands only a ready outcome and reports every stop as engagement", () => {
  const auto = section(oneShot, "## Land automatically when selected");
  assert.match(auto, /Land only on a ready outcome/);
  assert.match(auto, outcomeLink);
  assert.match(auto, /ready outcome as landed, with its next step/);
  assert.match(auto, /Needs human engagement/);
  assert.match(auto, /listing the open decision or what stopped the landing/);
  assert.match(auto, /result\s+committed and unlanded/);
  assert.doesNotMatch(auto, /\*\*Ready for slice planning\*\*/);
});
