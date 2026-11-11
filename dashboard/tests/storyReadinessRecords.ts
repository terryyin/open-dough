// Story identities and published record bodies for the readiness journey.
// Builders in storyReadinessFixture.ts record these through the real CLI.

import { makeMe } from "../../tests/support/makeMe.mjs";
import { renderStorySection } from "../../tests/support/published-seed.mjs";

export const seedRelative = "seeds/SEED-075-readiness.md";

export const unrefined = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#unrefined-story",
    href: `${seedRelative}#unrefined-story`,
    title: "Unrefined queued story",
  })
  .please();

export const plannedBlocked = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#planned-blocked",
    href: `${seedRelative}#planned-blocked`,
    title: "Planned story with a blocking concern",
  })
  .please();

export const plannedReady = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#planned-ready",
    href: `${seedRelative}#planned-ready`,
    title: "Ready planned story",
  })
  .please();

export const threeStorySeed = `---
id: SEED-075
---

# Readiness fixture seed

Shared scope for three stories in one seed.

${renderStorySection(unrefined, {
  body: `**Status:** Captured, still free-form.

Goal and examples are still open.`,
})}
${renderStorySection(plannedBlocked, {
  body: `**Status:** Refined with a remaining decision.

Goal, scope, and examples for the blocked story.`,
})}
${renderStorySection(plannedReady, {
  body: `**Status:** Ready for a later execution request.

**Goal:** Show recorded slice progress for a Taken story without inventing
completion or treating a prospective proof recipe as a passed result.

Goal, scope, and examples for the ready story.`,
})}`;

export const planless = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#planless-ready",
    href: "seeds/SEED-075-planless.md#planless-ready",
    title: "Explicit planless ready story",
  })
  .please();

export const legacy = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#legacy-story",
    href: "seeds/SEED-075-legacy.md#legacy-story",
    title: "Legacy story without structured state",
  })
  .please();

export const malformed = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#malformed-state",
    href: "seeds/SEED-075-malformed.md#malformed-state",
    title: "Story with a malformed state block",
  })
  .please();

export const externalPlan = makeMe.aBacklogEntry
  .with({
    identity: "SEED-075#external-plan-link",
    href: "seeds/SEED-075-external.md#external-plan-link",
    title: "Story whose backlog plan is external only",
    plan: {
      label: "plan",
      target: "https://example.com/plans/external-only.md",
    },
  })
  .please();

export const planlessSeed = `---
id: SEED-075-planless
---

# Planless fixture

${renderStorySection(planless, {
  body: `**Status:** Understood; skip planning authorized.

Goal, scope, and examples for planless execution.`,
})}`;

export const legacySeed = `---
id: SEED-075-legacy
---

# Legacy fixture

${renderStorySection(legacy, {
  body: `**Status:** Captured in free-form prose only.

Older record without a story-state block.`,
})}`;

export const malformedSeed = `---
id: SEED-075-malformed
---

# Malformed fixture

${renderStorySection(malformed, {
  body: `**Status:** Has a fence that is not valid JSON.

\`\`\`json dough-story-state
{not valid json
\`\`\``,
})}`;

export const externalPlanSeed = `---
id: SEED-075-external
---

# External plan link fixture

${renderStorySection(externalPlan, {
  body: "**Status:** Refined with an external backlog plan link only.",
})}`;
