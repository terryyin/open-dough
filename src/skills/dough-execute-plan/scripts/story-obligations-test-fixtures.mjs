import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Decisive excerpts copied locally; tests never load the source repositories.
// ODF-139: pygardon a4673f7b6, SEED-078-maintained-sharadar-daily-source.md
// #story-auto-trading-same-basis and plan 303's slice 4 acceptance. The omitted
// panel is recorded in the plan. Its scope excuse is absent from the seed.
export const holdings = {
  story:
    "Each signal and exit row names that source, so the owner can\nsee that live entries, stops and caps rest on the same basis as the backtest.",
  clause: "Each signal and exit row names that source",
  reported:
    "The Holdings page panel (`HoldingsExitSettingsResults.tsx`) does not show the source; the plan asks only for the Auto Trading Holdings section.",
  reportedSlice: 4,
};

// ODF-185: pygardon 30c05783e, SEED-067-tfdc-evaluation-confidence.md
// #story-owner-journey-proof and plan 280's Learnings. These preserve the actual
// seed promise and recorded omission, rather than inventing an exclusion.
export const searchProjection = {
  story:
    "The owner can trust that an eligible completed Search\ncandidate remains the same configuration through persistence, composition,\nVerify, Save and explicit Auto Trading selection, reaching a real generated\nsignal and an inspectable order intent.",
  clause:
    "candidate remains the same configuration through persistence, composition, Verify, Save and explicit Auto Trading selection",
  reported:
    "`compose_tfdc_live_strategy` does not carry the `benchmark_weight` gene; the saved strategy uses the default benchmark weight.",
  reportedSlice: 1,
};

// Constructed preserved-behavior example from SEED-125 example 5, not a claim
// that an archived execution already recorded a structured obligation.
export const exclusion = {
  story:
    "The release installs its declared files. This story excludes the release cache budget remedy.",
  clause: "The release installs its declared files.",
  reported: "release cache budget not enforced",
  reportedSlice: 1,
};

export function obligation(example, disposition = "return", id = "G1") {
  return `### ${id}. Reported gap
Reported: slice ${example.reportedSlice} — "${example.reported}"
Story clause: "${example.clause}"
Disposition: ${disposition}`;
}

export function slicePlan(entries, { done = [], indices = [1, 2, 3, 4] } = {}) {
  return `# Replay plan

**Source:** [selected story](story.md#selected).

## Ordered slices
${indices.map((index) => `### ${index}. Work ${index}\nType: Behavior\nStatus: ${done.includes(index) ? "done" : "planned"}`).join("\n\n")}

## Story obligations
${entries}
`;
}

export function fixture(
  t,
  example = holdings,
  disposition = "return",
  options = {},
) {
  const directory = mkdtempSync(join(tmpdir(), "dough-obligations-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const plan = join(directory, "PLAN.md");
  const story = join(directory, "story.md");
  writeFileSync(
    story,
    `# Replay stories\n\n<a id="selected"></a>\n\n### Selected story\n\n${example.story}\n\n<a id="sibling"></a>\n\n### Sibling story\n\nA sibling exclusion has no authority over the selected story.\n`,
  );
  const writePlan = (text) => writeFileSync(plan, text);
  writePlan(slicePlan(obligation(example, disposition), options));
  return { plan, story, writePlan };
}
