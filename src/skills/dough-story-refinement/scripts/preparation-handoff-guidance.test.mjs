// Execution handoff guidance: an execution instruction that reaches the session
// holding a story's unlanded preparation resolves the start first, lands
// through disposition's keep sequence without retirement or a completion
// report, then starts execution in the same workspace and branch; disposition
// names it as the fourth keep source, and the skills that can meet the
// instruction link to that one section.
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
const journey = read("references/preparation-journey.md");
const HANDOFF = "## Hand off to execution in the same session";
const handoff = section(journey, HANDOFF);
const takeLink =
  /\[Take or admit work\]\(\.\.\/\.\.\/dough-execute-plan\/SKILL\.md#take-or-admit-work\)/;

test("the handoff follows the landing default in the journey", () => {
  const headings = journey.split("\n").filter((line) => line.startsWith("## "));
  assert.equal(
    headings[headings.indexOf("## Land at the end of preparation") + 1],
    HANDOFF,
  );
});

test("an execution instruction in the session holding unlanded preparation triggers the handoff, and nothing unlanded or a retired worktree means the ordinary start", () => {
  assert.match(
    handoff,
    /An execution instruction for the prepared story, with its mode, may reach the session that holds that story's Preparing assignment while its workspace holds unlanded preparation: a result the opt-out retained, a draft an answered question left, or preparation that has not yet reached its landing\./,
  );
  assert.match(
    handoff,
    /lands that preparation and starts execution in the same workspace and branch, with no second worktree, branch, landing, or Take\./,
  );
  assert.match(
    handoff,
    /With nothing unlanded, or with the worktree already retired, the ordinary start under \[Take or admit work\]\(\.\.\/\.\.\/dough-execute-plan\/SKILL\.md#take-or-admit-work\) applies and this section adds nothing\./,
  );
});

test("the start is resolved before landing, with a recorded ready assessment and planless only under skip-planning authority", () => {
  assert.match(
    handoff,
    /Resolve the start before landing, because the start reads the landed result from the remote target and refuses one it cannot execute:/,
  );
  assert.match(
    handoff,
    /- the execution source and authority under \[Establish execution context\]\(\.\.\/\.\.\/dough-execute-plan\/SKILL\.md#establish-execution-context\);/,
  );
  assert.match(
    handoff,
    /- the mode, the \[publication preconditions\]\(\.\.\/\.\.\/dough-execute-plan\/references\/trunk-publication\.md#preconditions\), and every input the start needs: workspace path and branch, identity, publisher ID, remote, target, and host; and/,
  );
  assert.match(
    handoff,
    /- a recorded `ready` assessment on the result: planning's own, or planless only under an explicit skip-planning instruction, through the recorder's \[planless authority\]\(\.\.\/\.\.\/dough-product-backlog\/references\/record-preparation\.md#planless-authority\)\./,
  );
  assert.ok(
    handoff.indexOf("Resolve the start before landing") <
      handoff.indexOf("[Keep and publish the retained result]"),
  );
});

test("a stop before landing retains the draft and assignment, and an open coordinator question lands and claims nothing", () => {
  assert.match(
    handoff,
    /Any stop here retains the draft and its Preparing assignment and lands nothing\./,
  );
  assert.match(
    handoff,
    /A refinement result with neither a plan nor that instruction has no execution source and stops, with slice planning as the next step\./,
  );
  assert.match(
    handoff,
    /An \[open coordinator question\]\(#land-at-the-end-of-preparation\) is reported with its expected response; nothing is landed or claimed\./,
  );
  assert.match(
    section(journey, "## Land at the end of preparation"),
    /An open coordinator question is a response the preparation needs/,
  );
});

test("the handoff enters the shared keep sequence with release staged, after the validation that stops on a scratch edit", () => {
  assert.match(
    handoff,
    /The execution instruction is then the keep instruction for this preparation's result\./,
  );
  assert.match(
    handoff,
    /Enter \[Validate a keep instruction before acting\]\(preparation-disposition\.md#validate-a-keep-instruction-before-acting\), which stops on an unreverted scratch observation edit as on any other content, then \[Keep and publish the retained result\]\(preparation-disposition\.md#keep-and-publish-the-retained-result\) with `release` staged, as the landing above does\. Two things differ:/,
  );
  // The sequence has one home: the handoff links to it and copies no step.
  assert.doesNotMatch(handoff, /preparation-assignment\.mjs release/);
  assert.doesNotMatch(handoff, /A keep is \*\*confirmed\*\*/);
});

test("the handoff's landing retires nothing", () => {
  assert.match(
    handoff,
    /- \*\*No retirement\.\*\* The workspace continues as the execution workspace, so Dough Land's \[retire step\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\) does not run and the worktree stays at the landed commit\./,
  );
});

test("the handoff's landing gives no completion report of its own", () => {
  assert.match(
    handoff,
    /- \*\*No completion report\.\*\* The session continues, so this landing gives no final report and no dashboard completion report of its own\./,
  );
  assert.match(
    handoff,
    /The announcement's publication authority covers this landing; the execution instruction's authority covers the claim\./,
  );
});

test("the start is the ordinary installed start with the same workspace path and branch, and its receipt is the execution identity", () => {
  assert.match(
    handoff,
    /Once the keep is confirmed, run the ordinary installed `execution-start\.mjs start` under \[Take or admit work\]\(\.\.\/\.\.\/dough-execute-plan\/SKILL\.md#take-or-admit-work\) with this preparation's workspace path and branch, the selected mode, and the recorded integration checkout, remote, and target\./,
  );
  assert.match(
    handoff,
    /It reuses the workspace at fetched trunk and publishes the Take\./,
  );
  assert.match(
    handoff,
    /In Story Branch Mode the branch becomes the story branch, published at the Take; in Trunk Mode it stays the temporary execution branch\./,
  );
  assert.match(
    handoff,
    /Retain the receipt as your execution identity, then continue at checkout-bound setup and the first slice\./,
  );
  assert.match(
    handoff,
    /The story identity, plan path, mode, integration checkout, dashboard reporting context, and the execution instruction carry over\./,
  );
  assert.match(
    read("../dough-execute-plan/SKILL.md"),
    /`scripts\/execution-start\.mjs start` once/,
  );
});

test("recovery repeats neither an accepted landing nor a claim, and keep-sequence stops keep that sequence's handling", () => {
  assert.match(
    handoff,
    /Recovery repeats neither an accepted landing nor a claim\./,
  );
  assert.match(
    handoff,
    /A stop in the keep sequence, such as `story-left-queue`, keeps that sequence's handling: the draft is retained, nothing more is pushed, execution has not started, and the report carries the receipt with the decision or rerun that continues\./,
  );
  assert.match(
    handoff,
    /After a landing stop or a refused or interrupted start, rerun `release` and the same landing, which push nothing already accepted, then the same start with the same workspace path, branch, and publisher ID, which answers `published`, `existing`, or `resumed`\./,
  );
  assert.match(
    handoff,
    /A start that names this branch with another workspace path is refused `setup-failed`, because the branch already exists\./,
  );
});

test("wrap-up owns retirement through the unchanged creation record, and execution's finish owns reporting", () => {
  assert.match(
    handoff,
    /Retirement belongs to \[story wrap-up\]\(\.\.\/\.\.\/dough-story-wrap-up\/SKILL\.md#remove-execution-resources-safely\), which retires the worktree and branch through the creation record this preparation's start wrote; nothing rewrites that record\./,
  );
  assert.match(
    handoff,
    /Reporting belongs to execution's \[finish or stop\]\(\.\.\/\.\.\/dough-execute-plan\/references\/finish-or-stop\.md\)\./,
  );
});

test("disposition names the execution handoff as its fourth keep source, with release staging, no retirement, and no final operation", () => {
  const decide = section(
    read("references/preparation-disposition.md"),
    "## Decide what happens to the written result",
  );
  assert.match(
    decide,
    /Four sources supply a keep instruction, each with the candidate check its landing runs:/,
  );
  assert.equal(decide.match(/Candidate check:/g).length, 4);
  assert.match(
    decide,
    /\(`--auto-land`\)\. Candidate check: `recheck`, with no assignment to release; - the execution handoff, \[hand off to execution in the same session\]\(preparation-journey\.md#hand-off-to-execution-in-the-same-session\), for an execution instruction in the session that holds the story's Preparing workspace with unlanded preparation\. Candidate check: `release` staging\. The workspace is not retired and the landing has no final operation of its own: execution continues there\./,
  );
});

test("the execute-plan skill sends a session holding unlanded preparation to the handoff before its start command", () => {
  const take = section(
    read("../dough-execute-plan/SKILL.md"),
    "## Take or admit work",
  );
  const pointer =
    /When your session holds this story's Preparing workspace with unlanded preparation, first follow \[hand off to execution in the same session\]\(\.\.\/dough-story-refinement\/references\/preparation-journey\.md#hand-off-to-execution-in-the-same-session\) before that command\./;
  assert.match(take, pointer);
  assert.ok(
    take.search(pointer) < take.indexOf("`scripts/execution-start.mjs start`"),
  );
  assert.match(handoff, takeLink);
});

test("the preparation skills and the established preparation name the handoff as another way the session continues", () => {
  const link = (prefix) =>
    new RegExp(
      `An execution instruction for this story that arrives while its preparation is unlanded follows \\[hand off to execution in the same session\\]\\(${prefix}references/preparation-journey\\.md#hand-off-to-execution-in-the-same-session\\) instead\\.`,
    );
  const flat = (path) => read(path).replace(/\s+/g, " ");
  assert.match(flat("SKILL.md"), link(""));
  for (const path of [
    "../dough-slice-planning/SKILL.md",
    "../dough-slice-plan-refinement/SKILL.md",
  ]) {
    assert.match(flat(path), link("\\.\\./dough-story-refinement/"));
  }
  assert.match(
    flat("references/established-preparation.md"),
    /The session may instead end through \[hand off to execution in the same session\]\(preparation-journey\.md#hand-off-to-execution-in-the-same-session\) when an execution instruction for this story arrives before that landing\./,
  );
});
