// Preparation journey guidance: a ready refinement continues into slice
// planning in the same workspace, branch, session, and assignment, with no
// intermediate report; an open coordinator question or an explicit refine-only
// instruction stops it. The journey's end is pinned in
// preparation-landing-guidance.test.mjs and its finish in
// preparation-finish-guidance.test.mjs.
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
const journeyLink = /\(references\/preparation-journey\.md\)/;

test("refinement's workflow sends a ready story into slice planning", () => {
  const report = section(skillText, "## Refine and continue");
  assert.match(report, journeyLink);
  assert.match(report, /continue a ready story into slice planning/);
  assert.match(
    section(skillText, "## Resolve required context"),
    /slice-planning workflow for the continuation/,
  );
});

test("a refinement invocation authorizes planning and landing, never execution", () => {
  assert.doesNotMatch(skillText, /does not authorize planning/);
  assert.doesNotMatch(skillText, /only for a requested handoff/);
  const workflow = section(skillText, "## Choose the workflow");
  assert.match(
    workflow,
    /A refinement invocation authorizes slice planning of its story and landing the completed preparation under \[preparation journey\]\(references\/preparation-journey\.md\); it authorizes no execution\./,
  );
});

test("the journey continues both ready outcomes for the story the invocation names", () => {
  const next = section(journey, "## Continue into slice planning");
  assert.match(next, /no question to the coordinator remains/);
  assert.match(
    next,
    /no question to the coordinator remains, invoke \[dough-slice-planning\]/,
  );
  assert.doesNotMatch(next, /\breport|announce|recap/i);
  assert.match(next, /in the same session/);
  assert.match(next, /\(\.\.\/SKILL\.md#judge-the-refinement-outcome\)/);
  assert.match(next, /\(\.\.\/\.\.\/dough-slice-planning\/SKILL\.md\)/);
  assert.match(next, /Both ready outcomes continue/);
  assert.match(next, /Ready for slice planning and Flawless/);
  assert.match(next, /one-slice plan/);
  assert.match(next, /explicit skip-planning instruction/);
  assert.match(next, /the story the invocation names/);
  assert.match(next, /sibling[\s\S]+ends at its own refinement result/);
});

test("planning continues the same workspace, branch, session, and assignment", () => {
  const same = section(journey, "## Carry the same preparation");
  assert.match(same, /same workspace, branch, and session/);
  assert.match(same, /same Preparing assignment/);
  assert.match(same, /`start`[\s\S]+returns `continued`/);
  assert.match(
    same,
    /no second Established preparation block, announcement, workspace, or branch/,
  );
});

test("an open coordinator question or a refine-only instruction stops before planning", () => {
  const stops = section(journey, "## Stop before planning");
  assert.match(stops, /An open coordinator question/);
  assert.match(stops, /Needs human engagement/);
  assert.match(stops, /no plan is written/);
  assert.match(
    stops,
    /answers in the same session and no question remains, finish refinement and continue/,
  );
  assert.match(stops, /An explicit refine-only instruction/);
  assert.match(stops, /`--refine-only`/);
  assert.match(stops, /\(refinement-options\.json\)/);
  assert.match(stops, /ordinary-language instruction/);
  assert.match(stops, /composes with every option and focus/);
  assert.match(
    stops,
    /end with where the refined story waits and slice planning in that workspace as the next step/,
  );
  assert.match(stops, /\(one-shot-refinement\.md\)/);
});

test("the options file defines refine-only once among the options", () => {
  const definition = JSON.parse(read("references/refinement-options.json"));
  const flagged = (entries) =>
    entries.filter(({ flag }) => flag === "--refine-only");
  const [refineOnly, ...others] = flagged(definition.options);
  assert.equal(others.length, 0);
  assert.equal(flagged(definition.focuses).length, 0);
  assert.equal(refineOnly.label, "Refine only");
  assert.match(refineOnly.summary, /leave slice planning for a later step/);
  assert.match(
    refineOnly.instruction,
    /End with where the refined story waits and slice planning in that workspace as the next step/,
  );
  assert.match(
    definition.selection,
    /Refine only composes with every option and focus/,
  );
});

test("the options file defines retain once as an ungrouped option after refine-only", () => {
  const definition = JSON.parse(read("references/refinement-options.json"));
  const flags = definition.options.map(({ flag }) => flag);
  const at = flags.indexOf("--retain");
  assert.equal(at, flags.indexOf("--refine-only") + 1);
  assert.equal(flags.lastIndexOf("--retain"), at);
  assert.ok(definition.focuses.every(({ flag }) => flag !== "--retain"));
  const { label, summary, instruction } = definition.options[at];
  assert.equal(label, "Retain for review");
  assert.match(summary, /Finish preparation[^.]+for an explicit keep\.$/);
  assert.match(
    instruction,
    /^Finish the authorized preparation as usual, applying every other selected option and focus, and record its readiness assessment\. Then retain the result in its workspace with its Preparing assignment/,
  );
  assert.match(
    instruction,
    /Report where the result is and an explicit keep as the next step, and say that others still see the story as Preparing\.$/,
  );
  assert.ok(
    (definition.groups ?? []).every(({ flags }) => !flags.includes("--retain")),
  );
  assert.match(
    definition.selection,
    /Retain for review composes with every option and focus: finish the preparation the others select, then retain its result\. With Refine only, the invocation ends at the refinement result, which waits in its workspace for slice planning\./,
  );
});

test("slice planning keeps the continuation's facts in the plan and record and finishes under the journey's attention rule, while a parent still receives its return", () => {
  const planning = read("../dough-slice-planning/SKILL.md");
  const stay = section(planning, "## Stay within the triggering instruction");
  assert.match(
    stay,
    /- Planning-only request, or a continuation from story refinement: do not implement and do not invoke execution\. The plan and the story's record hold the slices, exclusions, refinement decision, concerns, and assessment; the session finishes under the preparation journey's \[finish with only what needs a response\]\(\.\.\/dough-story-refinement\/references\/preparation-journey\.md#finish-with-only-what-needs-a-response\)\. - Parent-agent delegation/,
  );
  assert.match(
    stay,
    /Parent-agent delegation that asks only for slice planning: return the plan path, the refinement decision and concerns, and the recorded readiness assessment to the parent/,
  );
  const record = section(
    planning,
    "## Record concern evidence and assess readiness",
  );
  assert.match(record, /none, the plan says so narrowly/);
  assert.match(
    record,
    /A missing input, disputed constraint, or human-owned decision that refinement cannot resolve needs a response: report the expected response, who can give it when known, and what waits for it\./,
  );
  assert.match(record, /authorized early probe slice needs none/);
  for (const text of [
    planning,
    read("../dough-slice-plan-refinement/SKILL.md"),
  ]) {
    assert.doesNotMatch(text, /SLICE PLAN (?:WRITTEN|REFINED)/);
    assert.doesNotMatch(
      text,
      /no-concerns finding|reporting the plan|after reporting/,
    );
    assert.doesNotMatch(text, /\bReport the plan path/);
  }
});

test("plan refinement records its reassessment, returns its facts to an invoking workflow, and reports only what needs a response", () => {
  const planRefinement = read(
    "../dough-slice-plan-refinement/SKILL.md",
  ).replace(/\s+/g, " ");
  assert.match(
    planRefinement,
    /Return the plan path, replaced slices, resulting slice count, sizing exceptions, any resplit recommendation, whether execution can resume, and the reassessment to an invoking workflow/,
  );
  assert.match(
    planRefinement,
    /A resplit recommendation, an Escalate finding, or another decision a person must make needs a response: report it with the expected response, who can give it when known, and what waits for it\./,
  );
  assert.match(
    planRefinement,
    /report `story resplit recommended: <count> slices; use dough-resplit-story`/,
  );
  assert.match(
    planRefinement,
    /A session that invoked this skill directly finishes under \[finish with only what needs a response\]\(\.\.\/dough-story-refinement\/references\/preparation-journey\.md#finish-with-only-what-needs-a-response\)/,
  );
});

test("one-shot refinement keeps its own journey with no plan", () => {
  const oneShot = read("references/one-shot-refinement.md");
  const introduction = oneShot
    .slice(0, oneShot.indexOf("\n## "))
    .replace(/\s+/g, " ");
  assert.match(introduction, /no plan follows it/);
  assert.match(introduction, /\(preparation-journey\.md\)/);
});
