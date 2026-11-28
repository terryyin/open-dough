---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="observe-tagged-install-and-read-e2e-proof"></a>

### Observe a tagged installed workflow and read E2E proof in Intent

**Identity:** SEED-334#observe-tagged-install-and-read-e2e-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/891-observe-tagged-install-and-read-e2e-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bbadacf0ed9689b74a4409e14b0f64609d8c4e02214a9e9ac467de37206d5fb2","plan":"0fea7c75539de96043efc627bf87baf3768e7ee4e45591e45592a59386001fbe"}}
```

#### Goal

A developer sees one representative product workflow run released Open Dough
commands in an installed project, and reads **E2E Test** proof in Intent under
its own name without false continuity from the retired `dashboard/tests`
evidence. This completes the installed and Intent-reading promises of
SEED-334#run-and-observe-product-wide-end-to-end-tests (Scope 3, 4, 7 and 8,
Key examples 1 and 5, plan 608 slices 5 and 6, recoverable at
`d21a0ebc5ee0426f9898d10725c9e7765f49bc8e`) on the runners SEED-334 delivered.

#### Scope

**Required behavior**

1. **Tagged installed preparation journey.** One `e2e/` journey
   (`@playwright/test`) installs complete Open Dough with its real installer
   from an explicitly pinned published numeric tag, `v0.3.97` (peels to
   `d2d303b6215e3c707a75a8a257b98dc257e1bc7b`), into an isolated queued
   project with a bare origin; starts story preparation from the dashboard;
   and observes the installed preparation command publish the assignment at
   that origin. The case proof records the tag, resolved revision, installed
   `VERSION` and the installed command path it ran. A newer published tag
   replaces `v0.3.97` only when a diagnosed incompatibility with the current
   dashboard requires it. Tagged and working-tree installations never share a
   cache identity; the existing working-tree preparation journeys stay.
2. **Boundaries named.** The journey's header names what it adds to the
   [E2E Test shared boundary set](../../e2e/README.md#real-and-substituted):
   the real tagged installation and installer; the synthetic GitHub and native
   host stand-ins remain deterministic substitutes, not native skill-use
   acceptance ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
3. **E2E Test named in Intent.** Wherever Project Intent, Purpose, Proof, story
   CI comparison and history name a CI entry whose path is a configured Intent
   location, they show its configured label (**E2E Test** for `e2e`) and keep
   the path reachable as source context; the path remains the entry's identity.
   The label comes from the Intent locations the view already reads (current
   settings for Project Intent, the completion revision's for a Done story);
   an entry those locations do not label keeps its path.
4. **Registering helpers open.** A case declared in a registering helper
   (today `e2e/sessions/cursorSessionsSidebarRoomFitCases.ts` and
   `cursorSessionsSidebarFormerHeightCases.ts`) opens that source from Proof
   and Purpose.
5. **Historical scopes stay distinct.** Old `dashboard/tests` evidence keeps
   its recorded path and stays readable at its revision as plain text when no
   current location matches, never relabeled **E2E Test** nor linked to a
   dead location. A comparison or history spanning the migration shows the
   absent and added scopes explicitly with no numeric timing comparison between
   them; matched focused scopes keep their numeric comparisons.

**Required restrictions**

- A missing, unfetchable or unverifiable pinned tag fails the journey clearly,
  naming the tag; it never falls back to a branch or working-tree bytes
  ([ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
- Evidence keeps unknown, missing and changed scope distinctions
  ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).

**Scope limits**

No new release, native agent acceptance, speed work or other E2E journey.
Intent naming, history and absent/changed-scope reading rules are proved in
plain Node Vitest on strongly typed backend handlers and plain Vitest with
embedded headless Chromium on the narrow owning Intent UI components, rendering
from typed proof data without an installed workflow or agent launch
([Intent reading contract](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability));
no wrappers are added to `dashboard/test-support`
([Architectural North Star](../NORTH-STAR.md)).

**Safe stopping point.** The tagged journey (1, 2) alone, or the Intent naming
and history (3–5) alone, is complete on its own.

#### Key examples

1. An isolated queued project has Open Dough installed from `v0.3.97` → the
   developer runs `npm run test:e2e` on the tagged journey and starts
   preparation from the dashboard → the bare origin holds the published
   assignment, and the proof names `v0.3.97`, `d2d303b6`, version `0.3.97` and
   the installed command path.
2. The pinned tag is absent from the source repository and unreachable → the
   journey fails before installing, naming the tag, with no branch fallback.
3. Project Intent's CI proof lists the `e2e` entry → it reads **E2E Test**,
   opens the `e2e` location, and a case declared in
   `cursorSessionsSidebarRoomFitCases.ts` opens that helper.
4. A story comparison's base has `dashboard/tests` and `dashboard/frontend-tests`
   entries; its candidate has `e2e` and `dashboard/frontend-tests` → `dashboard/tests`
   shows as a removed scope in plain text, **E2E Test** as added, neither with a
   timing delta, and Dashboard Frontend Test keeps its numeric comparison.

<a id="keep-one-browser-test-group-roster"></a>

### Keep one browser test group roster and current placement guidance

**Identity:** SEED-334#keep-one-browser-test-group-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"not-ready","reasons":["Realign plan 617 after SEED-413 moves frontend-tests and backend-tests to plain Vitest, leaving e2e/ as the sole Playwright suite and adding zero wrappers to test-support."],"basis":{"document":"5198aca92522fae45d523c976cfa8c3e154b40aa21d6344478d5c714c75e93e8","plan":"dc206c39c926524881b89f375f08c92d806852b72598afc26e240ac0e4ad0900"}}
```

#### Goal

A maintainer who adds, removes or reads the browser test groups delivered by
SEED-334#run-and-observe-product-wide-end-to-end-tests (recoverable at
`125c45649fa587c78ed7445deff35db87604489d`)
changes the group set in one place, finds helpers named for the groups they
run, has each CI producer's setup bounds guarded on their own, and reads
placement guidance that matches the independent groups.

#### Scope

Bounded retrospective correction of that execution's residue, updated on
2026-11-19 after `cfa20d7a6` delivered `browserTestGroups.mjs` and
[`SEED-413`](SEED-413-renovate-dashboard-unit-tests.md) set both
`dashboard/frontend-tests/` (plain Vitest + embedded Chromium) and
`dashboard/backend-tests/` (plain Node Vitest) moving off `@playwright/test`,
leaving **`e2e/` as the sole Playwright suite**. Sequence after `SEED-413`
retires `frontend.playwright.config.ts` and `backend.playwright.config.ts`:
retire obsolete multi-Playwright-group wrappers from `dashboard/test-support/`
(adding no new wrappers to `test-support` under the
[Architectural North Star](../NORTH-STAR.md)), check each CI workflow's Node,
npm and browser acquisition bounds per file, and align live placement wording
(`Distribution/tests/test-environment.md`, `Distribution/tests/ci/ci-container.md`).
Historical records keep their recorded names.

Use the [Project Intent revision family](https://github.com/terryyin/open-dough/blob/2294ce3f9f4fa243024941f689e862ee01b7d0bf/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#project-intent-revision-family-example)
as a concrete placement example. Its browser component cases use frontend
Vitest, and the composed revision-apply journey belongs to the E2E group.

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md) (realign during refinement after `cfa20d7a6` and backend runner renovation)

