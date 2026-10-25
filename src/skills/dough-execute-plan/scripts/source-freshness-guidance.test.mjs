// Guidance navigation (not proof an agent follows the text): each Story Branch
// gate runs the freshness check before the boundary it guards and links the
// reference that handles its result. Native follow-through is the separate
// developer-run replay.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const check = "source-freshness.mjs' check";

// `text` contains the freshness check before `later`, and links the reference.
function gatesBefore(text, later, referenceLink) {
  const gate = text.indexOf(check);
  assert.notEqual(gate, -1, `runs ${check}`);
  const guarded = text.indexOf(later);
  assert.notEqual(guarded, -1, `still names ${later}`);
  assert.ok(gate < guarded, `${check} comes before ${later}`);
  assert.match(text, referenceLink);
}

test("slice delivery checks freshness before the obligations check", () => {
  const delivery = section(
    read("dough-execute-plan/references/wrap-up.md"),
    "## Deliver the change",
  );
  const update = delivery.slice(
    delivery.indexOf("5. For planned execution"),
    delivery.indexOf("6. Stage"),
  );
  gatesBefore(
    update,
    "story-obligations.mjs' check --plan '<PLAN.md>' --slice N",
    /\]\(source-freshness\.md(?:#[^)]+)?\)/,
  );
});

test("the execution-complete record checks freshness before the completion check", () => {
  const record = section(
    read("dough-execute-plan/references/finish-or-stop.md"),
    "## Record execution completion",
  );
  gatesBefore(
    record,
    "check --plan '<PLAN.md>' --completion",
    /\]\(source-freshness\.md(?:#[^)]+)?\)/,
  );
});

test("wrap-up checks freshness before deleting spent history", () => {
  const deletion = section(
    read("dough-story-wrap-up/SKILL.md"),
    "## Delete spent history, including shared records",
  );
  gatesBefore(
    deletion,
    "- its executable plan",
    /\]\(\.\.\/dough-execute-plan\/references\/source-freshness\.md(?:#[^)]+)?\)/,
  );
  assert.match(
    deletion,
    /In Story Branch Mode, for selected work with a \*\*Taken\*\* entry, first run/,
  );
  assert.match(deletion, /or for work without a Taken entry, delete:/);
});

test("the reference names the records each source compares", () => {
  const run = section(
    read("dough-execute-plan/references/source-freshness.md"),
    "## Run the check",
  );
  for (const term of [
    "with a plan link, the story section and the linked plan",
    "for a plan-homed correction, its plan",
    "otherwise the story section alone, as for a quick story or a plan linked only on the branch",
  ])
    assert.ok(run.replace(/\s+/g, " ").includes(term), `names ${term}`);
  assert.doesNotMatch(run, /missing plan link/);
});

test("the reference names the results, absorb, and the conflict stop", () => {
  const reference = read("dough-execute-plan/references/source-freshness.md");
  for (const term of [
    "`unchanged`",
    "`amended`",
    "`conflict`",
    "`absorb`",
    "`awaiting story review`",
  ])
    assert.ok(reference.includes(term), `names ${term}`);
  assert.match(
    reference,
    /node '<installed-execute-plan>\/scripts\/source-freshness\.mjs' check/,
  );
});
