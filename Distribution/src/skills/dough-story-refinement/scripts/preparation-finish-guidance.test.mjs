// Preparation finish guidance: after the landing or other disposition
// settles, the whole preparation finishes under one attention judgment,
// reporting only what needs a response, was requested, or a caller needs to
// continue, with the dashboard completion report last.
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
const disposition = read("references/preparation-disposition.md");
const end = section(journey, "## Land at the end of preparation");

test("the journey finishes under one attention judgment: quiet when settled, useful when a response is needed", () => {
  const finish = section(journey, "## Finish with only what needs a response");
  assert.doesNotMatch(journey, /## Report once at the end/);
  assert.match(
    end,
    /the session then ends under \[finish with only what needs a response\]\(#finish-with-only-what-needs-a-response\)/,
  );
  assert.match(
    finish,
    /One attention judgment covers the whole preparation, whichever of the three skills began it/,
  );
  assert.match(
    finish,
    /Each settled step hands on to the next without a message of its own\./,
  );
  assert.match(
    finish,
    /\[completion attention\]\(\.\.\/\.\.\/dough-land\/references\/completion-attention\.md\) to the preparation as a whole/,
  );
  assert.match(
    finish,
    /A preparation that landed with nothing requiring attention ends there\./,
  );
  assert.match(finish, /adds no summary of them or the story's next step/);
  assert.match(
    finish,
    /Where the host requires a response, give its minimal native one\./,
  );
  // The old final recap stays retired.
  assert.doesNotMatch(
    finish,
    /final report is|landed commit, the story's next step|carries the story's refinement outcome/,
  );
});

test("a response gives its expected response, consequence, continuation, and owner for each case that needs one", () => {
  const finish = section(journey, "## Finish with only what needs a response");
  assert.match(
    finish,
    /These need a response, each with its expected response, its consequence, what continues once it is given, and who can give it when known, without recapping settled work:/,
  );
  assert.match(
    finish,
    /an \[open coordinator question\]\(#land-at-the-end-of-preparation\) or a landing stop/,
  );
  assert.match(
    finish,
    /a result held at a selected boundary: the refine-only result, the opt-out's retained result, an unpublished result, or a one-shot result kept for review\. Give the draft's workspace and branch, whether others still see the story as Preparing, and the concrete next action, such as slice planning in that workspace or an explicit keep;/,
  );
  assert.match(
    finish,
    /a landed plan that names a decision a person must make before the story is Taken: name the decision and its owner, and that execution waits for it/,
  );
  assert.match(
    finish,
    /a concern, reminder, or unfinished step that completion attention reports for the landing/,
  );
});

test("requested details and a caller's needed return survive quiet finishing", () => {
  const finish = section(journey, "## Finish with only what needs a response");
  assert.match(
    finish,
    /When the developer explicitly asks for details, such as the plan, its slices, or architecture findings, or selected an option or focus whose instruction reports its findings, give them\./,
  );
  assert.match(
    finish,
    /A parent agent or invoking workflow that delegated a step of this preparation receives what it needs to continue, such as the plan path, the recorded assessment and its evidence, the result's location, or the decision it must make, as that step's return\./,
  );
});

test("with supplied dashboard context, quiet success reports completed with no message and stops report unfinished; direct use makes no contact", () => {
  const finish = section(journey, "## Finish with only what needs a response");
  assert.match(
    finish,
    /With supplied dashboard reporting context, the completion report under \[dashboard completion\]\(\.\.\/\.\.\/dough-land\/references\/dashboard-completion\.md\) is the session's final operation, after the landing or other disposition settles\./,
  );
  assert.match(
    finish,
    /A landed preparation with nothing requiring attention reports `completed` with no message and waits for its receipt\./,
  );
  assert.match(
    finish,
    /A retained or stopped result reports `unfinished` with the exact response above\./,
  );
  assert.match(finish, /Without that context, make no dashboard contact\./);
});

test("the keep reports its landing results under Dough Land's completion attention, and the recorder leaves reporting to its caller", () => {
  assert.match(
    section(disposition, "## Keep and publish the retained result"),
    /Its publication, refresh, and cleanup results are the keep's results, reported under its \[completion attention\]\(\.\.\/\.\.\/dough-land\/references\/completion-attention\.md\)\./,
  );
  const recorder = read(
    "../dough-product-backlog/references/record-preparation.md",
  ).replace(/\s+/g, " ");
  assert.doesNotMatch(recorder, /Report the recorder's result/);
  assert.match(
    recorder,
    /The caller reports the recorder's result only as needed\. A refusal leaves the home unchanged; report it and do not hand-edit a substitute assessment\./,
  );
});
