# Observe a tagged installed workflow and read E2E proof in Intent

**Identity:** SEED-334#observe-tagged-install-and-read-e2e-proof
**Source:** [Story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#observe-tagged-install-and-read-e2e-proof)

## Goal and scope

One E2E journey runs released Open Dough, installed by its real installer from
pinned tag `v0.3.97`, through a dashboard preparation start to the published
assignment at the project's bare origin, and records the release it ran.
Intent names CI entries by their configured label (**E2E Test** for `e2e`),
opens case-registering helpers, and keeps old `dashboard/tests` evidence as a
distinct, plain-text scope. Excluded: a new release, native agent acceptance,
speed work, other E2E journeys, and any change to the comparison or history
rules, which already treat the migration correctly (premise P5).

## Current decisions

- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  the journey reads the pinned tag's immutable content and verifies its peeled
  commit against the recorded `d2d303b6215e3c707a75a8a257b98dc257e1bc7b`; a
  missing, unfetchable or mismatched tag fails naming the tag, with no branch
  or working-tree fallback.
  [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  the installation is the tag's own `install.sh --target <project> --source
  https://github.com/terryyin/open-dough --platform <host>`, complete, not a
  skill subset. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  the synthetic Codex protocol and GitHub stay deterministic substitutes.
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  path stays entry identity; labels come from the locations the view already
  reads, never invented for an unmatched historical path.
- Tag source: the checkout's own `refs/tags/v0.3.97` when present, otherwise
  `git fetch --depth 1 origin tag v0.3.97` (CI's E2E checkout is depth 1 with
  no tags, `.github/workflows/browser-test-group.yml`).
- Reuse the prepared-origin seam
  (`dashboard/test-support/support/startOriginPreparation.ts`,
  `startOriginInstallation.ts`): the installation layer becomes either this
  run's working-tree skills (unchanged default) or one tagged installation's
  files, keyed into its own run artifact so tagged and working-tree origins
  never share a cache identity. The tagged artifact is prepared only on
  demand by the tagged journey. Add no new fixture registry or runner.
- Provenance (tag, peeled revision, installed `VERSION`, installed command
  path) is asserted by the case and attached to it with `test.info().attach`;
  CI keeps the E2E HTML report with attachments on every non-cancelled run
  (`browser-test-group.yml`, "Keep browser failure output"). The proof-record
  schema does not change.
- Intent reading proof runs in plain Vitest with embedded Chromium on the
  owning components (`IntentCiEntryLink`, `IntentCiProof`,
  `IntentCiEntryComparison`) from typed proof data, under the North Star's
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e);
  add no wrapper to `dashboard/test-support`.
- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written; carry this link into every delegation and repair handoff.

## Decisive premises

Observed 2026-11-28 at `a3a96818c` in this workspace (Node 24.21.0, macOS on
AC, load 7–11).

| Premise / consuming operation | Observation and result |
| --- | --- |
| P1. The current dashboard's Codex preparation journey runs against a complete `v0.3.97` installation (slice 1) | Scratch setup ran the tag's `install.sh` (from `git archive` of the peeled commit) for `codex` and `claude` into an empty project: 22 skills, installed `VERSION` 0.3.97, 4.35 s at load 10.7. Its files joined the queued description's first revision and a packed bare `codex` origin with `revisions.json`. `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_START_ORIGIN_PREPARATION=<prepared> OPEN_DOUGH_E2E_PROOF_RECORD=<file> npm run test:e2e -- launches/agent-launch-preparation-codex.spec.ts --workers=1` passed 1/1 (7.125 s case, strict passed). The same command with an empty override directory failed `ENOENT … /codex`, so the run consumed the tagged origin. No newer tag is needed. |
| P2. A depth-1 checkout without tags can obtain the pinned tag (slice 1, CI profile) | `git clone --depth 1 https://github.com/terryyin/open-dough`: no local tag; `git fetch --depth 1 origin tag v0.3.97` then peeled to `d2d303b6…` and `git archive` listed its skills; `… tag v0.0.999` failed `couldn't find remote ref refs/tags/v0.0.999`. Proxy: macOS instead of the ubuntu runner. Git's fetch semantics are identical; the runner already reaches the same public origin for its checkout with `persist-credentials: false`, so the difference cannot change the outcome. The hosted E2E run at slice 1 confirms it. |
| P3. CI entry names render the path today; labels are already in the view's locations (slice 2) | `IntentCiEntryLink` renders `<ScopePath path>` and links only when a location matches; `IntentCiProof.tsx:59` and `IntentCiEntryComparison.tsx:38` are its only entry-name callers. `IntentLocation` carries optional `label` (`authenticatedIntentRead.ts`), and Done stories read locations at their completion revision (`intent-ci-comparison-locations.spec.ts`). |
| P4. The registering helpers are not selected by the `e2e` location, and selection alone gates Purpose and Proof (slice 3) | `locationSelectsRepositoryPath("e2e/sessions/cursorSessionsSidebarRoomFitCases.ts", …)` returned `false` for the current `["**/*.spec.ts"]` and `true` with `"**/*Cases.ts"` added. Purpose shows any listed file's published source (`IntentFileReading.tsx`); Proof attributes cases to their declared file. Only `e2e/sessions/cursorSessionsSidebarRoomFitCases.ts` and `cursorSessionsSidebarFormerHeightCases.ts` match in `e2e/`. |
| P5. A comparison spanning `dashboard/tests` → `e2e` already shows removed and added scopes without timing deltas (slice 2 proof, no rule change) | Scratch `node --test` calling `comparisonEntriesOf` with base `dashboard/tests` 900 ms + `dashboard/frontend-tests` 100 ms and candidate `e2e` 500 ms + `dashboard/frontend-tests` 120 ms: `e2e` baseline "added", `dashboard/tests` branch "removed", both cues none, frontend `+0 s` (`changeMs` 20). |

## Ordered slices

### 1. Observe a complete tagged installed preparation workflow
Type: Behavior
Status: done
Proof: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:e2e -- launches/released-installation-preparation.spec.ts --workers=1`
passes with the provenance attachment; a focused Dashboard Backend Test
(Node Vitest) on the tag source shows a missing tag in a local bare origin
fails naming the tag and leaves no installation; the existing working-tree
preparation specs (`launches/agent-launch-preparation-*.spec.ts`) still pass.
Hosted E2E shard 1 passes on the slice's revision.

Behavior: an isolated queued project whose bare origin holds the complete
`v0.3.97` installation → the developer starts Story A's preparation from the
dashboard in Codex → the installed preparation command publishes the
assignment at that origin; the case asserts and attaches tag, peeled revision,
installed `VERSION` 0.3.97 and the installed command path. The spec header
names its added real boundary (the tagged installer and installation) beside
the [shared set](../../../e2e/README.md#real-and-substituted); the README names
the journey and its tag. Story example 2 (missing tag) is proved at the tag
source's own boundary.

Accepted local proof (2026-11-28): `released-installation-preparation.spec.ts`
1/1 with the provenance attachment; backend
`launches/released-installation-tag.spec.ts` (missing tag, empty `TMPDIR`);
`launches/` 154/154 on a quiet rerun. An earlier run lost 5 existing
`agent-launch-*` cases to 5 s waits at load ~47 from the implementer's own
concurrent runs; those 4 files passed 14/14 alone, so the hosted run is the
verdict. The spec matches no listed shard pattern, so its hosted proof is the
E2E shard that selects it rather than shard 1. Hosted proof: CI run
46091584691 attempt 1 on `2a64fe65` succeeded; E2E shard 6/6 ran
`launches/released-installation-preparation.spec.ts` (10.2 s, `e2e-times-6`)
through the depth-1 tag fetch, and all `launches/agent-*` shard 1 cases passed. Refactor follow-up candidates:
one shared reader of the preparation assignment (6 files) and
`startRefinementInCodex` in the existing Codex preparation specs.

### 2. Name CI entries by their configured label
Type: Behavior
Status: planned
Proof: Dashboard Frontend Test (Vitest + embedded Chromium) cases on Project
Intent CI Proof and a Done story's CI comparison: `e2e` labelled
**E2E Test** opens its location with its path still shown as context; a
location without a label shows its path; a comparison with base
`dashboard/tests` + `dashboard/frontend-tests` and candidate `e2e` +
`dashboard/frontend-tests` shows `dashboard/tests` removed as plain text,
**E2E Test** added, neither with a timing delta, and the frontend row numeric.
Run with `npm run test:dashboard:frontend -- <changed specs>` and the
existing `intent-ci-*` frontend specs.

Behavior: a developer reads CI Proof or a story's CI comparison → each entry a
read location labels shows that label, opens that location, and keeps its path
reachable; an unmatched historical path stays plain text.

### 3. Open registering helpers from Proof and Purpose
Type: Behavior
Status: planned
Proof: installed `test-entry-rules.mjs` on both helper paths reports the `e2e`
location; a headless Playwright observation of this checkout's dashboard
Project Intent (worktree Chromium) selects
`e2e/sessions/cursorSessionsSidebarRoomFitCases.ts`, shows its source in
Purpose and, with published CI proof, its case in Proof.

Behavior: the `e2e` Intent location in `.planning/open-dough.json` also selects
`**/*Cases.ts` → the helpers appear under **E2E Test** in Project Intent →
Purpose opens their source and Proof lists their declared cases.

## Verification and delivery gates

- Before test edits run installed `test-entry-rules.mjs` on exact paths and
  apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) and, for
  browser tests, [`dough-page-objects`](../../../.agents/skills/dough-page-objects/SKILL.md).
- Local gates per [AGENTS.md](../../../AGENTS.md): the focused proofs above,
  `npm run lint`, `npm run typecheck:dashboard`. Slice 1 changes the shared
  prepared-origin seam that every preparation journey loads, so it also runs
  `npm run test:e2e -- launches/` before delivery. Run long macOS checks from
  a fully awake machine on AC power under `caffeinate -s -i`.
- Keep the default test timeout; never `test.slow()`.

## Plan concern assessment

Refinement not needed: three slices, each one outcome with its own proof
loop, no shared special-case rule. No remaining slice-specific concern; the
CI runner profile of P2 is a proxy with recorded reasoning and is confirmed by
slice 1's hosted run.

## Story obligations
