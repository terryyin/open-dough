// Story identities and published record bodies for the readiness journey.
// Builders in storyReadinessFixture.ts record these through the real CLI.

export const seedRelative = "seeds/SEED-075-readiness.md";

export const unrefined = {
  identity: "SEED-075#unrefined-story",
  link: `${seedRelative}#unrefined-story`,
  title: "Unrefined queued story",
};

export const plannedBlocked = {
  identity: "SEED-075#planned-blocked",
  link: `${seedRelative}#planned-blocked`,
  title: "Planned story with a blocking concern",
};

export const plannedReady = {
  identity: "SEED-075#planned-ready",
  link: `${seedRelative}#planned-ready`,
  title: "Ready planned story",
};

export const planBlockedRelative = "../quick/075-blocked/PLAN.md";
export const planReadyRelative = "../quick/075-ready/PLAN.md";
export const planBlockedPath = "quick/075-blocked/PLAN.md";
export const planReadyPath = "quick/075-ready/PLAN.md";

export const threeStorySeed = `---
id: SEED-075
---

# Readiness fixture seed

Shared scope for three stories in one seed.

<a id="unrefined-story"></a>

### Unrefined queued story

**Identity:** ${unrefined.identity}

**Status:** Captured, still free-form.

Goal and examples are still open.

<a id="planned-blocked"></a>

### Planned story with a blocking concern

**Identity:** ${plannedBlocked.identity}

**Status:** Refined with a remaining decision.

Goal, scope, and examples for the blocked story.

<a id="planned-ready"></a>

### Ready planned story

**Identity:** ${plannedReady.identity}

**Status:** Ready for a later execution request.

**Goal:** Show recorded slice progress for a Taken story without inventing
completion or treating a prospective proof recipe as a passed result.

Goal, scope, and examples for the ready story.
`;

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

function readyPlanBody(
  doneThrough: number,
  slicesHeading = "Ordered slices",
): string {
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
  return `# Ready plan

## ${slicesHeading}

${slices}`;
}

export const planReadyBody = readyPlanBody(0);
export const planReadyTwoDoneBody = readyPlanBody(2);
export const planReadyTwoDoneSlicesHeadingBody = readyPlanBody(2, "Slices");

export const planless = {
  identity: "SEED-075#planless-ready",
  link: "seeds/SEED-075-planless.md#planless-ready",
  title: "Explicit planless ready story",
};

export const legacy = {
  identity: "SEED-075#legacy-story",
  link: "seeds/SEED-075-legacy.md#legacy-story",
  title: "Legacy story without structured state",
};

export const malformed = {
  identity: "SEED-075#malformed-state",
  link: "seeds/SEED-075-malformed.md#malformed-state",
  title: "Story with a malformed state block",
};

export const externalPlan = {
  identity: "SEED-075#external-plan-link",
  link: "seeds/SEED-075-external.md#external-plan-link",
  title: "Story whose backlog plan is external only",
};

export const externalPlanUrl = "https://example.com/plans/external-only.md";

export const planlessSeed = `---
id: SEED-075-planless
---

# Planless fixture

<a id="planless-ready"></a>

### Explicit planless ready story

**Identity:** ${planless.identity}

**Status:** Understood; skip planning authorized.

Goal, scope, and examples for planless execution.
`;

export const legacySeed = `---
id: SEED-075-legacy
---

# Legacy fixture

<a id="legacy-story"></a>

### Legacy story without structured state

**Identity:** ${legacy.identity}

**Status:** Captured in free-form prose only.

Older record without a story-state block.
`;

export const malformedSeed = `---
id: SEED-075-malformed
---

# Malformed fixture

<a id="malformed-state"></a>

### Story with a malformed state block

**Identity:** ${malformed.identity}

**Status:** Has a fence that is not valid JSON.

\`\`\`json dough-story-state
{not valid json
\`\`\`
`;

export const externalPlanSeed = `---
id: SEED-075-external
---

# External plan link fixture

<a id="external-plan-link"></a>

### Story whose backlog plan is external only

**Identity:** ${externalPlan.identity}

**Status:** Refined with an external backlog plan link only.
`;
