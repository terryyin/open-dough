import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { readStoryObligations } from "./story-obligations.mjs";
import {
  fixture,
  holdings,
  obligation,
  reviewed,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  refuses,
  refusesCommitment,
} from "./story-obligations-test-cli.mjs";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

const reference = (name) =>
  readFileSync(new URL(`../references/${name}`, import.meta.url), "utf8");
const obligations = reference("story-obligations.md");
const example = /```markdown\n([\s\S]*?)\n```/.exec(obligations)?.[1];
assert.ok(example, "the record format has an executable Markdown example");
const entries = example.replace(/^## Story obligations\s*/, "");
// Slice by H2 anchors: the Commitments example fences a `##` line, so
// markdownSection would end the source-review body early.
const sourceReview = obligations.slice(
  obligations.indexOf("## Record the source review"),
  obligations.indexOf("## Use the record at execution boundaries"),
);
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

test("guidance documents record under the source review and list/check at boundaries", () => {
  assert.match(
    sourceReview,
    /Settle a commitment's slice allocation, lifecycle owner, `observed:` location/,
  );
  assert.match(
    sourceReview,
    /story-obligations\.mjs' record --plan '<PLAN\.md>' --commitment/,
  );

  const boundaries = obligations.slice(
    obligations.indexOf("## Use the record at execution boundaries"),
  );
  const listCheckCommands = boundaries.slice(
    boundaries.indexOf("```sh"),
    boundaries.indexOf("```", boundaries.indexOf("```sh") + 4),
  );
  assert.match(listCheckCommands, /story-obligations\.mjs' list --plan/);
  assert.match(listCheckCommands, /story-obligations\.mjs' check --plan/);
  assert.match(
    boundaries,
    /`record` under \[the source review\]\(#record-the-source-review\)/,
  );
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

test("acceptance links the obligation owner and delivery includes its precommit check", () => {
  const wrapUp = reference("wrap-up.md");
  const acceptance = markdownSection(wrapUp, "## Accept proof");
  // This checks navigation to the executable record, not prose completeness or
  // follow-through. Original-source acceptance is assessed in native journeys.
  assert.match(acceptance, /\]\(story-obligations\.md(?:#[^)]+)?\)/);
  const delivery = markdownSection(
    reference("deliver-the-change.md"),
    "## Deliver the change",
  );
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

test("the documented Commitments table allocates a lifecycle owner that checks list unobserved", (t) => {
  const table = /```markdown\n(## Commitments[\s\S]*?)\n```/.exec(
    obligations,
  )?.[1];
  assert.ok(table, "the source review has an executable Commitments example");
  const { plan, writePlan } = reviewed(t, []);
  const done = [1, 2, 3, 4, 5, 6];
  const g2 = obligation(holdings, "receiving slice 8", "G2");
  writePlan(
    slicePlan(g2, { done, indices: [1, 2, 3, 4, 5, 6, 7, 8], review: true }),
  );
  const writeTable = (source) =>
    writeFileSync(
      join(dirname(plan), "source-review.md"),
      `# Source review\n\n${source}\n`,
    );
  writeTable(table);
  // Slice 7 is about to finish: its own row needs an observation, the
  // target CI row does not and is listed as pending lifecycle.
  const result = check(plan, "--slice", "7");
  refusesCommitment(result, "unobserved-commitment", "7", { slice: 7 });
  assert.equal(result.problems.length, 1, JSON.stringify(result));
  assert.deepEqual(result.pendingLifecycle, [
    { id: "8", text: "Final target CI is settled", owner: "target CI" },
  ]);
  writeTable(
    table.replace(
      "| target CI | |",
      "| target CI | observed: branch CI run 42 |",
    ),
  );
  refusesCommitment(
    check(plan, "--slice", "6"),
    "observed-lifecycle-commitment",
    "8",
    { owner: "target CI" },
  );
});

test("guidance allocates post-execution commitments to their owners and never observes them in the plan", () => {
  assert.match(
    sourceReview,
    /only an operation after\s+execution completion can observe[\s\S]+`landing`[\s\S]+`target CI`[\s\S]+`reporting`[\s\S]+No other owner exists; another value is malformed/,
  );
  assert.match(
    sourceReview,
    /A commitment a slice's output owes stays with that\s+slice/,
  );
  assert.match(
    sourceReview,
    /Never record it as observed\s+from a pending gate, current branch CI or other branch evidence, or the\s+enforcing check itself/,
  );
  assert.match(sourceReview, /--lifecycle '<landing\|target CI\|reporting>'/);
  const boundaries = obligations.slice(
    obligations.indexOf("## Use the record at execution boundaries"),
  );
  assert.match(
    boundaries,
    /A lifecycle row needs no\s+observation here; each result lists it in `pendingLifecycle` with its `id`,\s+`text` and `owner`/,
  );
  assert.match(boundaries, /still owed to that owner/);
});
