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

Goal, scope, and examples for the ready story.
`;

export const planBlockedBody = `# Blocked plan

### 1. Decide the remaining concern
Type: Behavior
Status: planned
`;

export const planReadyBody = `# Ready plan

### 1. Deliver the ready outcome
Type: Behavior
Status: planned
`;

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
