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

const deliveryPath = "dough-execute-plan/references/deliver-the-change.md";
const settlementLink = "#settle-freshness-before-dependent-work";

test("planned Story Branch returns settle freshness before acceptance and refactoring", () => {
  const skill = read("dough-execute-plan/SKILL.md");
  const returnRow = skill
    .split("\n")
    .find((line) => line.startsWith("| Before accepting a return"));
  assert.ok(returnRow.includes(settlementLink));
  assert.ok(returnRow.includes("#check-named-siblings"));
  assert.ok(
    returnRow.indexOf(settlementLink) < returnRow.indexOf("#accept-proof"),
  );
  const returning = skill.slice(
    skill.indexOf("4. On return"),
    skill.indexOf("5. Run [delivery]"),
  );
  assert.ok(returning.includes(settlementLink));
  assert.ok(
    returning.indexOf(settlementLink) < returning.indexOf("#accept-proof"),
  );
  assert.match(returning, /planned Story Branch/);
  const acceptance = section(
    read("dough-execute-plan/references/wrap-up.md"),
    "## Accept proof",
  );
  assert.ok(acceptance.includes(settlementLink));
  assert.ok(
    acceptance.indexOf(settlementLink) < acceptance.indexOf("proof ownership"),
  );
});

test("settlement requires inspected terminal results before dependent operations", () => {
  const settlement = section(
    read(deliveryPath),
    "## Settle freshness before dependent work",
  );
  gatesBefore(settlement, "On `unchanged`", /\]\(source-freshness\.md\)/);
  const flat = settlement.replace(/\s+/g, " ");
  for (const pattern of [
    /implementation returns.*before proof acceptance.*refactor pass.*expensive boundary.*whole-suite/,
    /Receive and inspect the terminal result in a separate tool-result boundary before launching dependent work/,
    /shell chain.*parallel check and delivery.*sequential awaited calls.*uninspected orchestration/,
    /`amended`, `conflict` or refusal.*source freshness/,
    /absorb amendments or reconcile conflicts.*promises and source review.*recheck until `unchanged` or stop as directed/,
    /Receive and inspect that result before dependent work too/,
    /affected sibling holds refactoring and expensive proof, as well as delivery.*reconciliation.*renewed proof/,
    /unchanged check adds no full run/,
    /Renew only proof affected/,
  ])
    assert.match(flat, pattern);
});

test("delivery rechecks settlement before guarded done, commit and publication", () => {
  const delivery = section(read(deliveryPath), "## Deliver the change");
  const update = delivery
    .slice(
      delivery.indexOf("5. For planned execution"),
      delivery.indexOf("6. Stage"),
    )
    .replace(/\s+/g, " ");
  assert.ok(update.includes(settlementLink));
  assert.ok(
    update.indexOf(settlementLink) <
      update.indexOf(
        "story-obligations.mjs' check --plan '<PLAN.md>' --slice N",
      ),
  );
  assert.match(update, /repeat \[freshness settlement\]/);
  assert.match(update, /inspect its results before guarded fresh delivery/);
  const settlement = section(
    read(deliveryPath),
    "## Settle freshness before dependent work",
  ).replace(/\s+/g, " ");
  assert.match(
    settlement,
    /Repeat this settlement at delivery step 5 before the done mark, commit or publication/,
  );
  assert.match(
    settlement,
    /early check does not reserve trunk or cover later movement/,
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

test("the reference names the trunk revision used as each record's base", () => {
  const reference = read("dough-execute-plan/references/source-freshness.md");
  const flat = (text) => text.replace(/\s+/g, " ");
  assert.ok(
    flat(section(reference, "## Run the check")).includes(
      "from its `from` base: the newest trunk revision since the Take whose text the branch copy contains, or the Take",
    ),
    "names the base each record is compared from",
  );
});

test("conflicts allow compatible branch edits and hold unresolved decisions", () => {
  const reference = read("dough-execute-plan/references/source-freshness.md");
  const resolution = section(reference, "## Resolve a conflict").replace(
    /\s+/g,
    " ",
  );
  for (const pattern of [
    /Reconcile in the branch copy when you can carry trunk's amendment and preserve the agreed requirements and their accepted proof/,
    /move a branch proof note away from the trunk edit/,
    /changed or removed `done` slice.*proof still covers the agreed behavior or reopen it under plan refinement when already authorized/,
    /When scope, expected behavior, or what counts as done still needs a developer decision, record `awaiting story review` or `awaiting correction review`/,
    /decision keeps trunk's text, apply it to the branch copy/,
    /keeps the branch's text, the developer changes trunk/,
    /Rerun `check` at the blocked boundary on the reconciled working copy with its proof in place\. Continue only on `unchanged`/,
  ])
    assert.match(resolution, pattern);
  assert.match(
    section(reference, "## At wrap-up's deletion").replace(/\s+/g, " "),
    /On `amended` or `conflict`, wrap-up deletes nothing.*handle the conflict.*deletes only on `unchanged`/,
  );
});
