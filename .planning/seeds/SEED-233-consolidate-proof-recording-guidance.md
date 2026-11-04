---
id: SEED-233
status: active
planted: 2026-11-04
planted_during: Follow-up to the Playwright proof reference review
trigger_when: A developer looks up how to record local test proof for a supported runner
scope: story
---

# SEED-233: Consolidate proof recording guidance

<a id="consolidate-proof-recording-guidance"></a>

### Consolidate proof recording guidance

**Identity:** SEED-233#consolidate-proof-recording-guidance
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-233#consolidate-proof-recording-guidance","dependencies":[{"supplier":{"identity":"SEED-192#read-node-test-proof","href":"seeds/SEED-192-review-product-intent.md#read-node-test-proof"},"implementation":"Plan 467 delivers the node:test proof reference.","rationale":"The consolidation needs the landed node:test instructions to distinguish common rules from runner details. The plan describes proposed guidance and the landed page supplies the wording to consolidate.","condition":"The node:test proof reference exists on trunk and is listed in the installer payload.","state":"waiting"},{"supplier":{"identity":"SEED-192#read-playwright-proof","href":"seeds/SEED-192-review-product-intent.md#read-playwright-proof"},"implementation":"Plan 468 delivers the Playwright proof reference.","rationale":"The consolidation needs the landed Playwright instructions to distinguish common rules from runner details. The plan describes proposed guidance and the landed page supplies the wording to consolidate.","condition":"The Playwright proof reference exists on trunk and is listed in the installer payload.","state":"satisfied","resolution":{"revision":"d1f9ccdadf33171caf324facdf9d7d6535d371a8","path":".planning/seeds/SEED-192-review-product-intent.md#read-playwright-proof","summary":"Directly satisfied. At accepted integration 18a7df4e7b3ae8003a45a0c40f6ac9e232d904a3 on origin/refs/heads/main, src/skills/dough-test-optimization/references/playwright-proof.md exists on trunk and install.sh lists dough-test-optimization/references/playwright-proof.md in the installer payload (alongside cucumber, pytest, and vitest proof pages). Recoverable before-cleanup evidence is at d1f9ccdad with plan slice-plans/468-read-playwright-proof/PLAN.md.\nCondition satisfied: The Playwright proof reference exists on trunk and is listed in the installer payload.\nAccepted integration: 18a7df4e7b3ae8003a45a0c40f6ac9e232d904a3 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer setting up or refreshing local test proof can follow one shared
recording reference from any of the five runner pages. The shared reference
owns the common rules for opting in, retaining successful observations,
refreshing snapshots, and committing proof. Each runner page keeps its setup,
commands, result interpretation, and format details.

Evaluate from the installed Cucumber, pytest, Vitest, `node:test`, and
Playwright pages. From each page, follow the link to the same installed
reference, then use the runner page to identify how to run a focused recording
and interpret its results. The shared rules appear in one place and the
instructions preserve each runner's current recording behavior.
