// Plan associations and recorded progress for the readiness fixture.

export const planBlockedRelative = "../slice-plans/075-blocked/PLAN.md";
export const planReadyRelative = "../slice-plans/075-ready/PLAN.md";
export const planBlockedPath = "slice-plans/075-blocked/PLAN.md";
export const planReadyPath = "slice-plans/075-ready/PLAN.md";

export const planBlockedBody = `# Blocked plan

## Ordered slices

### 1. Decide the remaining concern
Type: Behavior
Status: planned
Proof: Resolve the blocking decision in the plan.
`;

type ReadyPlanSlice = {
  readonly index: number;
  readonly name: string;
  readonly type: string;
  readonly proof: string;
  readonly accepted?: string;
};

// One ordered-slices list for the ready Taken story. The planned and two-done
// plan bodies share these definitions; only recorded completion differs.
const readyPlanSlices: readonly ReadyPlanSlice[] = [
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
  const slices = readyPlanSlices
    .map((slice) => {
      const done = slice.index <= doneThrough;
      const accepted =
        done && slice.accepted !== undefined
          ? `Accepted: ${slice.accepted}\n`
          : "";
      return `### ${slice.index}. ${slice.name}
Type: ${slice.type}
Status: ${done ? "done" : "planned"}
Proof: ${slice.proof}
${accepted}`;
    })
    .join("\n");
  // `gh` would print a JSON-typed answer's literal `\u0002` as `^B`, so the
  // card stays ready only while this plan is read exactly as published.
  return `# Ready plan

Ctrl+B then Enter records a line holding \`\\u0002\`.

## Ordered slices

${slices}`;
}

export const planReadyBody = readyPlanBody(0);
export const planReadyTwoDoneBody = readyPlanBody(2);
