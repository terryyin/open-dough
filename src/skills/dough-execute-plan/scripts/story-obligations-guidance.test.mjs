import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { readStoryObligations } from "./story-obligations.mjs";
import { fixture, slicePlan } from "./story-obligations-test-fixtures.mjs";
import { check, list, refuses } from "./story-obligations-test-cli.mjs";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

const reference = (name) =>
  readFileSync(new URL(`../references/${name}`, import.meta.url), "utf8");
const obligations = reference("story-obligations.md");
const example = /```markdown\n([\s\S]*?)\n```/.exec(obligations)?.[1];
assert.ok(example, "the record format has an executable Markdown example");
const entries = example.replace(/^## Story obligations\s*/, "");
const documentedStory = {
  story: "Each result names its source, so the owner can inspect its basis.",
  clause: "Each result names its source",
  reported: "The results panel renders results without their source.",
  reportedSlice: 4,
};

// These checks cover the documented format and boundary wiring. Native host
// follow-through is the separate developer-run replay, not phrase presence.
test("the documented obligation is read, listed, and blocks commit until proved", (t) => {
  const { plan, writePlan } = fixture(t, documentedStory);
  writePlan(slicePlan(entries));
  const parsed = readStoryObligations(readFileSync(plan, "utf8"));
  assert.deepEqual(parsed.problems, []);
  assert.deepEqual(parsed.entries, [
    {
      id: "G1",
      title: "Results panel omits the source",
      reportedSlice: 4,
      reported: documentedStory.reported,
      storyClause: documentedStory.clause,
      disposition: { type: "return", open: true },
    },
  ]);
  assert.deepEqual(list(plan, "--slice", "4").entries, parsed.entries);
  refuses(check(plan, "--slice", "4"), "open-obligation");
  refuses(check(plan, "--completion"), "open-obligation");
  writePlan(
    slicePlan(
      entries.replace(
        "Disposition: return",
        "Disposition: proved by slice 4: result-source.test.mjs",
      ),
      { done: [4] },
    ),
  );
  assert.equal(check(plan, "--slice", "4").ok, true);
  assert.equal(check(plan, "--completion").ok, true);
});

test("delegation carries the installed listing as slice promises before assignment", () => {
  const delegation = reference("delegation.md");
  const beforeAssignment = delegation.slice(
    0,
    delegation.indexOf("Give the agent:"),
  );
  assert.match(
    beforeAssignment,
    /story-obligations\.mjs' list --plan '<PLAN\.md>' --slice N/,
  );
  assert.match(beforeAssignment, /refusal blocks delegation/);
  assert.match(
    beforeAssignment,
    /full listing as slice\s+promises[\s\S]+required observations/,
  );
  assert.match(
    beforeAssignment,
    /returns, receiving\s+obligations, and open interims/,
  );
});

test("proof acceptance uses the structured record and delivery checks before done or commit", () => {
  const wrapUp = reference("wrap-up.md");
  const acceptance = markdownSection(wrapUp, "## Accept proof");
  assert.match(
    acceptance,
    /every named gap, loss, limitation, or interim\s+behavior[\s\S]+structured \[story obligation\]/,
  );
  assert.match(
    acceptance,
    /story's goal, key examples, and exclusions[\s\S]+before choosing/,
  );
  assert.match(
    acceptance,
    /open\s+interim[\s\S]+return\s+owned by this slice[\s\S]+text and provenance/,
  );
  assert.match(
    acceptance,
    /quick\s+execution[\s\S]+same-slice rule without creating a plan/,
  );
  const delivery = markdownSection(wrapUp, "## Deliver the change");
  const update = delivery.slice(
    delivery.indexOf("5. For planned execution"),
    delivery.indexOf("6. Stage"),
  );
  assert.match(
    update,
    /Before marking the slice done or committing[\s\S]+story-obligations\.mjs' check --plan '<PLAN\.md>' --slice N/,
  );
  assert.match(update, /refusal blocks the done transition and commit/);
});

test("completion checks all obligations before writing the execution-complete record", () => {
  const record = markdownSection(
    reference("finish-or-stop.md"),
    "## Record execution completion",
  );
  assert.match(
    record,
    /story-obligations\.mjs' check --plan '<PLAN\.md>' --completion/,
  );
  assert.match(
    record,
    /refusal blocks the execution-complete record[\s\S]+every open return,\s+receiving, or interim[\s\S]+Then add this record/,
  );
  assert.ok(record.indexOf("--completion") < record.indexOf("```markdown"));
});

test("planning retains one record format and carries obligations across replanning", () => {
  const planning = readFileSync(
    new URL(
      "../../dough-story-refinement/references/planning.md",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    planning,
    /`## Story obligations`[\s\S]+story-obligations\.md#record-format/,
  );
  assert.match(
    planning,
    /removing or renumbering slices[\s\S]+move receiving and interim obligations[\s\S]+remaining owners[\s\S]+preserve reported text and provenance/,
  );
  assert.match(
    reference("oversized-slice.md"),
    /Carry every reported gap, loss, limitation, and\s+interim behavior[\s\S]+new plan's structured\s+\[story obligations\][\s\S]+remaining-slice ownership/,
  );
  assert.match(
    obligations,
    /update that number to the current slice[\s\S]+original reporting\s+slice in the entry title/,
  );
  assert.match(
    obligations,
    /Until such a return[\s\S]+retains its\s+reporting origin/,
  );
});
