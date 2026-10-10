// Preparation journey guidance: a ready refinement continues into slice
// planning in the same workspace, branch, session, and assignment; an open
// coordinator question or an explicit refine-only instruction stops it. The
// journey's end is pinned in preparation-landing-guidance.test.mjs.
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
  const report = section(skillText, "## Refine and report");
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
  assert.match(next, /report the story's refinement outcome/);
  assert.match(next, /in the same session/);
  assert.match(next, /\(\.\.\/\.\.\/dough-slice-planning\/SKILL\.md\)/);
  assert.match(next, /Both ready outcomes continue/);
  assert.match(next, /Ready for slice planning and Flawless/);
  assert.match(next, /one-slice plan/);
  assert.match(next, /explicit skip-planning instruction/);
  assert.match(next, /the story the invocation names/);
  assert.match(next, /sibling[\s\S]+its own refinement outcome/);
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
  assert.match(stops, /slice planning in that workspace as the next step/);
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
    /slice planning in that workspace as the next step/,
  );
  assert.match(
    definition.selection,
    /Refine only composes with every option and focus/,
  );
});

test("slice planning treats the continuation as a planning-only request whose report is the journey's one final report", () => {
  const stay = section(
    read("../dough-slice-planning/SKILL.md"),
    "## Stay within the triggering instruction",
  );
  assert.match(
    stay,
    /- Planning-only request, or a continuation from story refinement: do not implement and do not invoke execution\. The report carries the plan path[^:]+recorded readiness assessment, given under the preparation journey's \[report once at the end\]\(\.\.\/dough-story-refinement\/references\/preparation-journey\.md#report-once-at-the-end\)\. - Parent-agent delegation/,
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
