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
import { sourceReview } from "./story-obligations-test-fixtures.mjs";

// The recorded plan 412 drift, rebuilt from the controlled delivery-evidence
// fixtures: the verbatim story section, the narrowed plan whose Current
// decision keeps held and ordered symbols in history (slices 1-3 done), and
// the reviewer's numbered return with commitment 21's six filters as items.
const fixtures = new URL(
  "../../../../tests/fixtures/delivery-evidence/",
  import.meta.url,
);
const fixtureText = (name) => readFileSync(new URL(name, fixtures), "utf8");
export const currentDecision =
  "The excluded list carries filter outcomes; held and ordered symbols stay in history with their existing reasons.";
export const amendmentQuote =
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

export function obligation(
  id,
  reportedSlice,
  clause,
  disposition,
  commitments,
) {
  return `### ${id}. Returned commitment ${commitments.join(", ")}
Reported: slice ${reportedSlice} — "Source review commitments ${commitments.join(", ")} have no observation."
Story clause: "${clause}"
Disposition: ${disposition}
Commitment: ${commitments.join(", ")}`;
}

export function replay(t) {
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
