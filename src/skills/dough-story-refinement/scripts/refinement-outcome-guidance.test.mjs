// Refinement outcome guidance: each refined story ends with exactly one of
// three outcomes; ready outcomes give a link, workspace, and next step without
// a question; engagement lists each expected response; the reported outcome
// records nothing and grants no planless authority.
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

test("a ready outcome gives link, workspace, and one next step without a recap or question", () => {
  assert.match(outcome, /story link/);
  assert.match(outcome, /workspace holding the\s+uncommitted draft/);
  assert.match(outcome, /one concrete next step/);
  assert.match(outcome, /explicit instruction to skip\s+slice planning/);
  assert.match(
    outcome,
    /next step\s+uses that plan instead of creating another/,
  );
  assert.match(
    outcome,
    /Preparing assignment as information, not as a request to keep/,
  );
  assert.match(outcome, /Do not\s+recap/);
  assert.match(outcome, /without a question or approval request/);
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
