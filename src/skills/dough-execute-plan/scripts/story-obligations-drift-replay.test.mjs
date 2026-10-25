import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { sourceReview } from "./story-obligations-test-fixtures.mjs";
import {
  check,
  list,
  problemCommitments,
  refuses,
} from "./story-obligations-test-cli.mjs";

// The recorded plan 412 drift, rebuilt from the controlled delivery-evidence
// fixtures: the verbatim story section, the narrowed plan whose Current
// decision keeps held and ordered symbols in history (slices 1-3 done), and
// the reviewer's numbered return with commitment 21's six filters as items.
const fixtures = new URL(
  "../../../../tests/fixtures/delivery-evidence/",
  import.meta.url,
);
const fixtureText = (name) => readFileSync(new URL(name, fixtures), "utf8");
const currentDecision =
  "The excluded list carries filter outcomes; held and ordered symbols stay in history with their existing reasons.";
const amendmentQuote =
  "The owner defers the already-held and already-ordered exclusion reasons to the history page story.";

const filters = [
  ["21.1", "outside the Area"],
  ["21.2", "relative-strength gate"],
  ["21.3", "missing sector or industry label"],
  ["21.4", "excluded instrument"],
  ["21.5", "already held"],
  ["21.6", "already ordered"],
];
const observedAtFour = {
  21.1: "observed: python3 entry/decision.py lists DDD/outside_area",
  21.2: "observed: python3 entry/decision.py lists CCC/relative_strength_gate",
  21.3: "observed: test_excluded_list_keeps_existing_reasons_in_order (EEE/sector, GGG/industry)",
  21.4: "observed: test_excluded_list_keeps_existing_reasons_in_order (FFF/excluded_instrument)",
  20: "observed: test_filtered_setups_appear_with_their_reason",
  22: "observed: test_candidates_without_a_setup_are_not_listed (NNN absent)",
};

function rows(states = {}) {
  return [
    [
      "5",
      "Candidate coverage: supplied, evaluated, not evaluated",
      "slice 2",
      "observed: slice 2 proof, entry/inputs.json scan outcomes",
    ],
    [
      "20",
      "Every candidate with a setup inside the alive window but not ranked is listed",
      "slice 4",
      "",
    ],
    ...filters.map(([id, text]) => [
      id,
      `Listed with the filter that removed it: ${text}`,
      "slice 4",
      "",
    ]),
    ["22", "Candidates with no setup are not listed", "slice 4", ""],
    ["40", "Each decision has an identity", "slice 7", ""],
  ].map((row) => {
    const [id] = row;
    const state = states[id] ?? observedAtFour[id];
    if (state === undefined) return row;
    const [allocation, value] = Array.isArray(state) ? state : [row[2], state];
    return [row[0], row[1], allocation, value];
  });
}

function obligation(id, reportedSlice, clause, disposition, commitments) {
  return `### ${id}. Returned commitment ${commitments.join(", ")}
Reported: slice ${reportedSlice} — "Source review commitments ${commitments.join(", ")} have no observation."
Story clause: "${clause}"
Disposition: ${disposition}
Commitment: ${commitments.join(", ")}`;
}

function replay(t) {
  const root = mkdtempSync(join(tmpdir(), "dough-drift-replay-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const seeds = join(root, ".planning/seeds");
  const planDir = join(
    root,
    ".planning/slice-plans/412-reviewable-entry-decision",
  );
  mkdirSync(seeds, { recursive: true });
  mkdirSync(planDir, { recursive: true });
  const story = join(seeds, "SEED-145-entry-autonomation.md");
  const plan = join(planDir, "PLAN.md");
  const writeStory = (amended = false) =>
    writeFileSync(
      story,
      fixtureText("drift-original-story.md") +
        (amended ? fixtureText("drift-human-amendment.md") : ""),
    );
  const writeRecord = (states = {}, entries = []) => {
    const text = fixtureText("drift-narrowed-plan.md").replace(
      /^(\*\*Source:\*\*.*)$/m,
      "$1\n**Source review:** [source review](source-review.md)",
    );
    assert.ok(text.includes(currentDecision.slice(0, 40)));
    writeFileSync(
      plan,
      `${text}\n## Story obligations\n\n${entries.join("\n\n")}\n`,
    );
    writeFileSync(
      join(planDir, "source-review.md"),
      sourceReview(rows(states)),
    );
  };
  writeStory();
  return { plan, writeStory, writeRecord };
}

function refusedCommitmentIds(result, reason) {
  return (result.problems ?? [])
    .filter((item) => item.reason === reason)
    .map((item) => item.commitment)
    .sort();
}

test("slice 4 is refused for the held and ordered items until they are returned", (t) => {
  const { plan, writeRecord } = replay(t);
  writeRecord();
  const narrowed = check(plan, "--slice", "4");
  assert.equal(narrowed.ok, false);
  assert.deepEqual(
    narrowed.problems.map((item) => item.reason),
    ["unobserved-commitment", "unobserved-commitment"],
  );
  assert.deepEqual(refusedCommitmentIds(narrowed, "unobserved-commitment"), [
    "21.5",
    "21.6",
  ]);

  // Returned to slice 4: the gate stays closed while the return is open.
  const returned = obligation(
    "G1",
    4,
    "already held, already ordered",
    "return",
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [returned]);
  refuses(check(plan, "--slice", "4"), "open-obligation");

  writeRecord({
    21.5: "observed: python3 entry/decision.py lists HHH/already_held",
    21.6: "observed: python3 entry/decision.py lists OOO/already_ordered",
  });
  assert.deepEqual(check(plan, "--slice", "4"), {
    ok: true,
    entryCount: 0,
    commitmentCount: 10,
  });
});

test("a named later receiver accepts slice 4 and refuses its own slice while open", (t) => {
  const { plan, writeRecord } = replay(t);
  const received = obligation(
    "G1",
    4,
    "already held, already ordered",
    "receiving slice 7",
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [received]);
  assert.equal(check(plan, "--slice", "4").ok, true);
  refuses(check(plan, "--slice", "7"), "open-obligation");

  // A false later-slice allocation is caught at that slice, before completion.
  writeRecord({ 21.5: ["slice 7", ""], 21.6: ["slice 7", ""] });
  assert.equal(check(plan, "--slice", "4").ok, true);
  assert.deepEqual(
    refusedCommitmentIds(check(plan, "--slice", "7"), "unobserved-commitment"),
    ["21.5", "21.6", "40"],
  );
});

test("the traceability commitment is received at slice 1 and blocks slice 7 while open", (t) => {
  const { plan, writeRecord } = replay(t);
  const traceability = obligation(
    "G2",
    1,
    "Each decision has an identity.",
    "receiving slice 7",
    ["40"],
  );
  writeRecord(
    {
      21.5: "observed: HHH/already_held",
      21.6: "observed: OOO/already_ordered",
      40: ["", "G2"],
    },
    [traceability],
  );
  assert.equal(check(plan, "--slice", "1").ok, true);
  assert.equal(check(plan, "--slice", "4").ok, true);
  const atSeven = check(plan, "--slice", "7");
  refuses(atSeven, "open-obligation", "G2");
  assert.deepEqual(problemCommitments(atSeven, "open-obligation"), ["40"]);
});

test("the plan's Current decision is no exclusion for the returned items", (t) => {
  const { plan, writeRecord } = replay(t);
  const planScoped = obligation(
    "G1",
    4,
    "already held, already ordered",
    `excluded "${currentDecision}"`,
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [planScoped]);
  const result = check(plan, "--slice", "4");
  refuses(result, "quote-not-in-story", "G1", "Disposition");
  assert.deepEqual(problemCommitments(result, "quote-not-in-story"), [
    "21.5",
    "21.6",
  ]);
});

test("the amended control excludes the items with the quoted human amendment", (t) => {
  const { plan, writeStory, writeRecord } = replay(t);
  writeStory(true);
  const amended = obligation(
    "G1",
    4,
    "already held, already ordered",
    `excluded "${amendmentQuote}"`,
    ["21.5", "21.6"],
  );
  writeRecord({ 21.5: "G1", 21.6: "G1" }, [amended]);
  assert.deepEqual(check(plan, "--slice", "4"), {
    ok: true,
    entryCount: 1,
    commitmentCount: 10,
  });
  writeStory(false);
  refuses(
    check(plan, "--slice", "4"),
    "quote-not-in-story",
    "G1",
    "Disposition",
  );
});

test("a commitment observed at slice 2 needs nothing at slice 4", (t) => {
  const { plan, writeRecord } = replay(t);
  writeRecord();
  const atFour = check(plan, "--slice", "4");
  assert.ok(!atFour.problems.some((item) => item.commitment === "5"));
  // Before slice 4's delegation its allocated ids, observed or not, are carried.
  const listed = list(plan, "--slice", "4");
  assert.equal(listed.ok, true);
  assert.deepEqual(
    listed.commitments.map((item) => [item.id, item.observed !== undefined]),
    [
      ["20", true],
      ["21.1", true],
      ["21.2", true],
      ["21.3", true],
      ["21.4", true],
      ["21.5", false],
      ["21.6", false],
      ["22", true],
    ],
  );
  assert.deepEqual(
    list(plan, "--slice", "2").commitments.map((item) => [
      item.id,
      item.observed,
    ]),
    [["5", "slice 2 proof, entry/inputs.json scan outcomes"]],
  );
});
