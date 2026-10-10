// Preparation landing guidance: a queued story's completed preparation lands
// through disposition's keep sequence at the journey's end unless an open
// coordinator question or an opt-out remains; the recorded assessment does not
// gate it; the session reports once, with the dashboard completion report
// last; and slice planning and plan refinement link to that one policy.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

// A section as one line, so a pin does not depend on where the prose wraps.
const section = (text, heading) =>
  markdownSection(text, heading).replace(/\s+/g, " ");

const skill = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(skill, path), "utf8");
const skillText = read("SKILL.md");
const journey = read("references/preparation-journey.md");
const disposition = read("references/preparation-disposition.md");
const END = "## Land at the end of preparation";
const end = section(journey, END);
const keepSequence =
  /\[Keep and publish the retained result\]\(preparation-disposition\.md#keep-and-publish-the-retained-result\)/;

test("completed preparation with no question or opt-out lands as one snapshot through the keep sequence", () => {
  assert.match(
    end,
    /queued story with an announced Preparing assignment ends when slice planning records its readiness assessment/,
  );
  assert.match(
    end,
    /whether planning followed refinement in this session or began it/,
  );
  assert.match(
    end,
    /slice-plan refinement invoked directly on that story's plan records its reassessment/,
  );
  assert.match(
    end,
    /At that end, with no open coordinator question and no opt-out, land the result\./,
  );
  assert.match(end, /advance keep instruction for its completed result/);
  assert.match(end, keepSequence);
  assert.match(end, /stage `release` and land through Dough Land/);
  assert.match(
    end,
    /Seed, plan, recorded facts, and the assignment's end publish in one snapshot/,
  );
  assert.match(
    end,
    /`--push-authorized`\) covers landing to the same remote target/,
  );
});

test("plan refinement inside planning adds no approval step or second report", () => {
  assert.match(end, /with any slice-plan refinement it invoked/);
  assert.match(
    end,
    /adds nothing before landing: no approval step and no second report/,
  );
});

test("the recorded assessment does not gate landing", () => {
  assert.match(end, /The recorded assessment does not gate landing\./);
  assert.match(
    end,
    /A `ready` or `not-ready` plan whose reasons, early probe slices, or pre-Take decisions the plan already names is a complete result/,
  );
});

test("an open coordinator question retains the draft and assignment until it is answered", () => {
  assert.match(
    end,
    /An open coordinator question is a response the preparation needs before its result is complete:/,
  );
  for (const question of [
    /- a Needs human engagement refinement outcome;/,
    /- missing required context;/,
    /- a disputed constraint or an Escalate finding;/,
    /- a story-resplit recommendation; or/,
    /- a stopped write or recording\./,
  ]) {
    assert.match(end, question);
  }
  assert.match(
    end,
    /Any of these stops landing: report the expected response, keep the draft and its Preparing assignment in the workspace, and say what continues once it is given/,
  );
  assert.match(
    end,
    /answers in the same session and no question remains, finish preparation and land/,
  );
});

test("the end names its opt-out and the no-publish instruction", () => {
  assert.match(
    end,
    /The opt-out is `--retain` from \[refinement options\]\(refinement-options\.json\), or an ordinary-language instruction to leave landing for later/,
  );
  assert.match(
    end,
    /leave landing for later: finish preparation and record the assessment, then keep the result with its Preparing assignment for an explicit keep/,
  );
  assert.match(
    end,
    /explicit instruction not to publish, which already prevents the announcement, also disables landing/,
  );
});

test("the landing validates the workspace first and its stops keep disposition's handling", () => {
  assert.match(
    end,
    /\[Validate a keep instruction before acting\]\(preparation-disposition\.md#validate-a-keep-instruction-before-acting\), which confirms the workspace holds only this preparation's result, with every scratch observation edit reverted, then \[Keep and publish/,
  );
  assert.match(
    section(disposition, "## Validate a keep instruction before acting"),
    /disposable reproduction changes — stops the keep\. Name that content/,
  );
  assert.match(
    end,
    /A landing stop keeps the handling of \[Keep and publish the retained result\]\(preparation-disposition\.md#keep-and-publish-the-retained-result\): `story-left-queue` or `release-conflict` from the release, other content in the workspace, a publication conflict, a second rejection, or an unclear push ends with the draft retained and nothing more pushed\. Report the receipt with the decision or rerun that continues\./,
  );
  assert.match(
    section(disposition, "## Keep and publish the retained result"),
    /`story-left-queue`[\s\S]+do not land, retry, or reinterpret the story's new state/,
  );
  assert.match(
    end,
    /Other written results, such as a decomposition seed, a session that ends at the refinement result, or a record with no announced assignment, follow \[Decide what happens to the written result\]/,
  );
});

test("disposition names four keep sources, each with its candidate check", () => {
  const decide = section(
    disposition,
    "## Decide what happens to the written result",
  );
  assert.match(
    decide,
    /Four sources supply a keep instruction, each with the candidate check its landing runs:/,
  );
  assert.match(
    decide,
    /- an explicit instruction to keep the result\. Candidate check: `release` staging when this session announced an assignment, or `recheck` for a one-shot result;/,
  );
  assert.match(
    decide,
    /- the preparation journey's default, \[land at the end of preparation\]\(preparation-journey\.md#land-at-the-end-of-preparation\), for a queued story's announced preparation that ends with no open coordinator question and no opt-out\. Candidate check: `release` staging;/,
  );
  assert.match(
    decide,
    /- one-shot refinement's selected \[automatic landing\]\(one-shot-refinement\.md#land-automatically-when-selected\) \(`--auto-land`\)\. Candidate check: `recheck`, with no assignment to release;/,
  );
  assert.match(
    decide,
    /- the execution handoff, \[hand off to execution in the same session\]\(preparation-journey\.md#hand-off-to-execution-in-the-same-session\), for an execution instruction in the session that holds the story's Preparing workspace with unlanded preparation\. Candidate check: `release` staging\./,
  );
  assert.match(
    decide,
    /Continuing discussion, pausing for more review, or silence is never a keep decision/,
  );
  assert.match(decide, /for the developer's review by default/);
  assert.match(
    section(disposition, "## Keep and publish the retained result"),
    /After a validated keep instruction, when this session announced a preparation assignment, first stage its release/,
  );
  // The sequence has one home: the journey links to it and copies no step.
  assert.doesNotMatch(journey, /preparation-assignment\.mjs release/);
  assert.doesNotMatch(end, /A keep is \*\*confirmed\*\*/);
});

test("landing leaves the story queued and grants no execution authority", () => {
  assert.match(
    end,
    /neither Takes it, starts execution, nor completes it, and grants no execution authority/,
  );
  assert.match(end, /The story stays queued with the recorder's facts/);
});

test("the one final report carries the landing result, and the dashboard completion report runs last", () => {
  const report = section(journey, "## Report once at the end");
  assert.match(report, /final report is slice planning's report/);
  assert.match(
    report,
    /or the plan refinement's when that skill was invoked directly, given once after the landing settles/,
  );
  assert.match(report, /refinement outcome/);
  assert.match(report, /plan path/);
  assert.match(report, /recorded readiness assessment/);
  assert.match(
    report,
    /the landing result: the landed commit, the story's next step, and Dough Land's publication, refresh, and retirement results/,
  );
  assert.match(
    report,
    /For a retained or stopped result it carries the draft's workspace, the Preparing assignment others still see, and the expected response, which for a result the opt-out retained is an explicit keep\./,
  );
  assert.match(
    report,
    /With supplied dashboard reporting context, the completion report under \[dashboard completion\]\(\.\.\/\.\.\/dough-land\/references\/dashboard-completion\.md\) is the session's final operation, after the landing settles/,
  );
  assert.match(
    report,
    /A retained or stopped result reports `unfinished` with the expected response/,
  );
});

test("slice planning and plan refinement end by linking to the journey's end, and no preparation skill carries disposition text", () => {
  const sibling =
    /When this session ends, follow \[land at the end of preparation\]\(\.\.\/dough-story-refinement\/references\/preparation-journey\.md#land-at-the-end-of-preparation\), then close or retain the workspace under \[preparation workspace\]\(\.\.\/dough-story-refinement\/references\/preparation-workspace\.md#close-or-retain-the-workspace\)\./;
  const planning = read("../dough-slice-planning/SKILL.md");
  const planRefinement = read("../dough-slice-plan-refinement/SKILL.md");
  assert.match(
    section(planning, "## Stay within the triggering instruction"),
    sibling,
  );
  assert.match(planRefinement.replace(/\s+/g, " "), sibling);
  assert.ok(
    planRefinement.indexOf("When this session ends") >
      planRefinement.indexOf("readiness reassessment"),
  );
  for (const text of [skillText, planning, planRefinement]) {
    assert.doesNotMatch(text, /keep or\s+discard decision/);
    assert.doesNotMatch(text, /preparation-disposition\.md/);
    assert.doesNotMatch(text, /preparation-assignment\.mjs release/);
  }
});
