# Prove working-tree preparation origins hold no released installation

**Identity:** SEED-334#prove-working-tree-origins-hold-no-release
**Source:** [Story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#prove-working-tree-origins-hold-no-release)

## Source and provenance

Dough Intent Coverage at SEED-334#observe-tagged-install-and-read-e2e-proof's
completed revision `fda707f32f03b027d91fdfd04dbe5f3ceb3ea667` (plan 891 at
`a2bb00d21f1db0f364c437d0e4b33d15d88d0ef0:.planning/slice-plans/891-observe-tagged-install-and-read-e2e-proof/PLAN.md`) reported **Confirmed
missing test path** for the promise "tagged and working-tree prepared origins
never share a cache identity".

## Current findings

- Fault: in `dashboard/test-support/support/startOriginPreparation.ts`,
  `startOriginArtifactKey` dropping the `-release-<tag>` suffix registers
  `start-origin-codex-queued` twice; the global setups'
  `new Map([...])` (`e2eGlobalSetup.ts`, `backendGlobalSetup.ts`) keeps the
  released entry, so every working-tree Codex queued journey starts from the
  v0.3.97 origin.
- Under that fault all maintained checks still passed:
  `launches/released-installation-preparation.spec.ts`, the six
  `launches/agent-launch-preparation-*` journeys, and backend
  `launches/start-origin-isolation.spec.ts` (whose "concurrent installed
  starts…" case itself received the released origin) and
  `launches/released-installation-tag.spec.ts`.
- A scratch witness on the `preparationPage` `origin` fixture with
  `preparationHost: "codex"` and no release, asserting
  `<origin.project>/.agents/skills/dough-update/VERSION` is absent, failed
  under the fault and passed on the baseline. Only the released installer
  writes that file; the working-tree layer installs the five start skills.
- The reverse transition (tagged journey given the working-tree origin) is
  caught by the tagged journey's provenance `toEqual`. The `privateKey` tag
  component has the same probable gap, unverified.

## Preserved promises and constraints

- The prepared-origin seam, its artifact keys and the tagged journey's
  behavior stay unchanged; this adds proof only.
- Plain Vitest outside `e2e/` (North Star "Plain Vitest for unit tests;
  Playwright only for E2E"); no new wrapper in `dashboard/test-support`.
- Keep default timeouts; never `test.slow()`. Carry the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written into every delegation and repair handoff.

## Ordered slices

### 1. Observe that a working-tree prepared origin holds no released installation
Type: Behavior
Status: planned
Proof: one maintained assertion beside `start-origin-isolation` (backend) or
in a working-tree Codex preparation journey that the working-tree Codex queued
origin holds the working-tree installation and no `dough-update/VERSION`;
with the key-suffix fault above applied on a scratch copy it fails, and
without it it passes. Run the changed spec through its npm runner plus
`launches/released-installation-preparation.spec.ts`, `npm run lint` and
`npm run typecheck:dashboard`.

Behavior: a working-tree preparation journey's origin → the maintained check
observes this run's skills and no released installation.
