// Plan associations and recorded progress for the readiness fixture.

import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderSlicePlan } from "../../tests/support/published-plan.mjs";

export const planBlockedRelative = "../slice-plans/075-blocked/PLAN.md";
export const planReadyRelative = "../slice-plans/075-ready/PLAN.md";
export const planBlockedPath = "slice-plans/075-blocked/PLAN.md";
export const planReadyPath = "slice-plans/075-ready/PLAN.md";

export const planBlockedBody = renderSlicePlan(
  makeMe.aSlicePlan
    .with({
      slices: [
        makeMe.aPlanSlice
          .with({
            index: 1,
            name: "Decide the remaining concern",
            proof: "Resolve the blocking decision in the plan.",
          })
          .please(),
      ],
    })
    .please(),
  { preamble: "# Blocked plan" },
);

// One ordered-slices list for the ready Taken story. The planned and two-done
// plan bodies share these definitions; only recorded completion differs.
const readyPlanSlices = [
  {
    index: 1,
    name: "Establish shared plan reading",
    type: "Structure",
    proof: "Shared reader interprets ordered slices without filesystem access.",
    accepted:
      "Shared plan reader unit checks passed for interpreted slices and uninterpretable layout.",
  },
  {
    index: 2,
    name: "Show recorded completion in detail",
    type: "Behavior",
    proof:
      "Detail lists slice names, status, and accepted evidence when present.",
    accepted:
      "Dashboard detail shows two of five recorded complete with accepted evidence text from this plan.",
  },
  {
    index: 3,
    name: "Keep readiness distinct from completion",
    type: "Behavior",
    proof: "Taken and ready remain separate from recorded slice completion.",
  },
  {
    index: 4,
    name: "Preserve unsupported plan layout",
    type: "Behavior",
    proof: "Unsupported layout stays uninterpretable rather than zero slices.",
  },
  {
    index: 5,
    name: "Pin source links beside progress",
    type: "Behavior",
    proof: "Detail offers pinned canonical and plan links only.",
  },
];

function readyPlanBody(doneThrough: number): string {
  const slices = readyPlanSlices.map(({ accepted, ...slice }) => {
    const done = slice.index <= doneThrough;
    return makeMe.aPlanSlice
      .with({
        ...slice,
        status: done ? "done" : "planned",
        ...(done && accepted !== undefined && { accepted }),
      })
      .please();
  });
  // `gh` would print a JSON-typed answer's literal `\u0002` as `^B`, so the
  // card stays ready only while this plan is read exactly as published.
  return renderSlicePlan(makeMe.aSlicePlan.with({ slices }).please(), {
    preamble: `# Ready plan

Ctrl+B then Enter records a line holding \`\\u0002\`.`,
  });
}

export const planReadyBody = readyPlanBody(0);
export const planReadyTwoDoneBody = readyPlanBody(2);
