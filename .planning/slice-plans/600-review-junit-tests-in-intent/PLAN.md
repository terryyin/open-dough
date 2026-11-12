# Review JUnit tests in Intent

**Identity:** SEED-325#review-junit-tests-in-intent
**Source:** [Review JUnit tests in Intent](../../seeds/SEED-325-junit-tests-in-intent.md#review-junit-tests-in-intent)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

A developer can browse configured Java/JUnit source alongside other supported
test source and read it in the existing Purpose view. Honor `kind: "java"`
as `.java` membership with optional include patterns, and use the existing Java
syntax-hint route for both kind and explicit-source declarations.

Preserve exact published text, line numbers, pinned reading revisions,
Purpose/Proof meaning, mixed-source browsing, source-read recovery, story
placement and independent MakeMe/page-object opt-ins. Listing respects each
location; safe source-read admission is the union of declared selections.
No framework-specific browser, JUnit semantic discovery, Java execution, JUnit
XML ingestion, client configuration edit, or release rollout is promised.
Selected helpers and unfamiliar Java test names remain naturally supported.

## Architecture and PFE

The product already owns this flow. Extend the existing kind table in
`src/skills/dough-makeme/scripts/intent-location-selection.mjs`; its dashboard
re-export feeds listing, source admission and story overlays, while test-entry
guidance imports that same rule. Keep the Java grammar in
`dashboard/src/sourceHighlight.ts`, consumed by the shared source-lines view.
No second selector or JUnit adapter is warranted. Edit source payload files,
not this repository's installed managed skill copies.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps Purpose separate from observed CI Proof and published Git as the reading
authority. [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent representation of a conceptual solution; [ADR 0001 —
Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
keeps existing Purpose/Proof vocabulary. The ADR index and these records agree;
no conflict or exception was found. The existing
[North Star: One backlog interpretation, separate observation and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and [Intent interaction guidance](../../../docs/dashboard-development-intent.md)
already support this direction; no new topic or navigation design is needed.

Expected production owners are 78 and 121 lines respectively. Inspected
existing fixtures and tests to edit are below 250 lines; use a focused Java
backend spec rather than growing the 244-line selection spec. The 247-line
Intent guide needs a replacement of affected prose, not an appended feature
report. Preserve cohesive seams and the 250-line check during execution.

## Outside-in proof ownership

All final promises belong to slice 1. New regressions are work to create;
their future passing result is not claimed by this preparation.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Doughnut-shaped Java location lists nested JUnit source and opens it in Purpose | New focused browser journey publishes settings and Git source through `publishIntentProject`, not a fabricated locations response. Expand the package tree, select `CalculatorTest.java`, assert independently supplied exact source, line numbers, reading revision and Java keyword/string styling. |
| Kind/include and explicit sources have one membership rule | Backend authenticated listing and file-at regression uses `kind: java` with `**/*Test.java`, without include, and explicit patterns selecting an unusually named `.java` file. Assert eligible files and exact pinned text; unmatched files are absent and return 404 when no other location selects them. Keep existing overlap admission. |
| Java and existing tests share review controls and source display | The browser journey opens Java and an existing type in one project and checks the same Purpose/Proof controls. Keep Purpose readable with no CI evidence; retain existing Proof gap meaning rather than adding a Java result reader. |
| Shared selection reaches changed-file placement and independent guidance opt-ins | Add one focused Java overlay case to `backend-tests/intent/intent-story-overlay.spec.ts` and Java membership/flag expectations to `tests/support/test-entry-rules.test.mjs`. Preserve existing moves/deletions and installed selection contracts. |
| Java styling works for kind and syntax hint while unknown syntax stays readable | The Java journey covers kind styling; adapt the explicit-sources journey to exercise Java styling and retain a separate genuinely unknown hint for plain text. Update `backend-tests/intent/intent-location-syntax.spec.ts`, which currently treats Java as an unknown grammar, to cover supported Java and a genuinely unknown hint. Verify light/dark token colors using existing page-color helpers; retain the system-appearance test. |
| Unsupported kinds and normal recovery remain usable | Replace Java as the deliberately unsupported fixture kind with a still-unknown value in both backend and browser fixtures/assertions. Run their complete existing group/unusable journeys, including failure and retry, and existing mixed-kind browsing. |

## Ordered slices

### 1. Browse and read configured Java tests through the shared Intent flow
Type: Behavior
Status: done
Proof: All rows above; focused commands below. Start the new listing/opening
regression against the unsupported current kind and observe its failure before
enabling Java. Do not publish a red intermediate state.

Behavior: A project publishes Java test locations and another supported source
type → a developer expands their folders and opens the selected tests → the
same Intent browser lists eligible files and Purpose reads exact published
source, with its appropriate syntax and existing proof/recovery semantics.

- Add the Java extension mapping and grammar to their existing owners. Reuse
  current source membership, reading, tree, tabs, highlighting and fallback.
  Consolidate equivalent behavior if the implementation finds duplication;
  add no general adapter framework for deferred test types.
- Arrange settings, locations, repository publications and story changes with
  the shared MakeMe API. Keep Java text, exact configurations under test,
  actions, expected paths/text and color assertions explicit at the call site.
- Update unknown-kind and unknown-hint examples wherever Java currently stands
  for unsupported behavior. Search the enclosing consumer assertions, not only
  Java literals. Keep a real unknown case; do not delete the fallback promise.
- Update `dashboard/PROJECT-CONFIGURATION.md` and the affected Intent guidance
  for Java kind/syntax support and configured membership, including absence of
  JUnit annotation discovery. Run slice-local refactoring before final proof.

This is one cohesive behavior/proof loop. Source recognition without opening,
or a separate JUnit UI, would leave the promised review incomplete. Shared
flow already exists; no preparatory Structure slice is needed. The endpoint
is useful independently of later Java CI-result support. No numeric slice
target was supplied; boundedness includes the focused checks and cleanup.

## Consumer trace and local gates

The selector's affected consumers are `intentLocationsRead.ts` (inventory),
`intentLocationSelection.ts` (safe read admission), `intentStoryOverlay.ts`
(changed-test placement), `IntentBrowser.tsx` (syntax selection), and
`test-entry-rules-selection.mjs` (independent conventions). Syntax changes
reach `SourceLines.tsx` and its enclosing Purpose/diff views. Inspect each
actual assertion and setup and retain the generated consumer-trace record
during execution; add newly discovered affected journeys to these gates.

Baseline focused selections:

```sh
node --test tests/support/test-entry-rules*.test.mjs
npm run typecheck:dashboard
npm run test:dashboard -- --workers=1 'tests/intent/intent-code-browse' 'tests/intent/intent-gherkin-(groups|unusable)' 'backend-tests/intent/authenticated-read-intent-(locations|selection|java)' 'backend-tests/intent/intent-(story-overlay|location-syntax).spec.ts' 'tests/intent/intent-story-changes' 'frontend-tests/dashboard-system-appearance.spec.ts'
```

Use the code-browse prefix for the new Java browser spec and the Java backend
prefix for its new boundary spec. Existing selections cover complete files,
not handpicked assertions. The source-level Node cohort also protects the
distributed selector's installed callers; no native host probe or installation
behavior change is implied. Typechecking is appropriate for changed grammar
imports and TypeScript test fixtures. Build is exercised by browser proof.
Use the repository's staged lint hook for changed Markdown/JS/TS. A full local
suite is not required solely by hosted CI configuration; broaden for an
evidenced consumer or project requirement. Published CI failures remain owned.

**Local gate:** prepare locked dependencies in the execution checkout with
`npm ci`, then run these applicable commands there. Before a long macOS run,
start fully awake; on AC wrap it in `caffeinate -s -i`. On battery plug in or
keep the lid open under `caffeinate -i` and inspect sleep logs, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Inspect current host load and memory before expensive proof. The preparation
used one worker on AC because neighboring work was active; this is not a
standing concurrency or timing policy. Never sleep, use `test.slow()`, or add
suite/hook timeout overrides; keep the default timeout.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and must accompany every delegation and repair handoff.

## Decisive premises and observations

Observed on 2026-11-12 in this preparation's owned workspace at
`98deed0f2283a2d5678940cfa055c528b352fa2a`, unless stated otherwise.

| Premise / consuming operation | Form, profile and result | Unverified remainder |
| --- | --- | --- |
| Report has a matching configured Java location | `git -C /Users/terryyin/git/doughnut show origin/main:.planning/open-dough.json` and `ls-tree -r --name-only origin/main backend/src/test/java` at `9554a2837d106757ec647791f6cc3903d0aa45b4`: Java kind, `**/*Test.java`, nested test paths. A read of that published profile, not a local settings edit. | Identified matching project; does not establish that every reported project has this configuration. |
| Current server rejects Java kind but existing shared route can list/read Java source | `node --experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module` with the probe described below: Java kind yields HTTP 200 empty inventory/unsupported-kind and file-at 404; explicit sources yields HTTP 200 nested test inventory and exact pinned source, unmatched helper 404. Exit 0 in 6.7 s. | The kind probe omitted include; this cannot change its unsupported result because kind lookup returns before patterns. New Java behavior remains to implement/prove. |
| Java grammar can use current Shiki engine/themes without changing source | `node --input-type=module` imported `shiki/core`, `shiki/engine/javascript`, `@shikijs/langs/java`, github-light and github-dark. `codeToTokensWithThemes` on a package/import/Jupiter test preserved exact text; keyword colors were `#D73A49`/`#F97583`, string colors `#032F62`/`#9ECBFF`. | Application wiring and browser styling are slice 1 proof, not claimed complete. |
| Existing mixed-source browser consumes real listing/read and preserves Java plain source | `caffeinate -s -i npm run test:dashboard -- --workers=1 'tests/intent/intent-code-browse-sources.spec.ts'` after checkout-local `npm ci`: exit 0. The complete case listed/opened Bash and Node with styling, Java with unknown hint as exact plain text, and unhinted source. | New Java-kind browser regression and grammar wiring remain slice 1 work. |
| Focused runner route is available in this checkout | `npm run test:dashboard -- --list --reporter=list` with the existing browser/backend selections above before the new specs: 26 tests in 15 files selected, exit 0. This is selection evidence only. | No pass or fault discrimination is inferred from listing. |

The consuming-boundary probe used representative local fixtures, no actual
GitHub requests, and no product edits. Literal observation command:

```sh
node --experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module <<'JS'
import { developmentBoundary, startDashboardServer } from './dashboard/tests/support/dashboardServer.ts';
import { everyRepository, publishes } from './dashboard/tests/support/fakeGitHub.ts';
import { rawRequest } from './dashboard/tests/support/rawHttp.ts';
import { describedRevision } from './dashboard/tests/describedRevisions.ts';
import { intentSettingsText } from './dashboard/tests/support/intentSettingsFile.ts';
import { makeMe } from './tests/support/makeMe.mjs';
const root = 'backend/src/test/java';
const testPath = root + '/com/example/CalculatorTest.java';
const helperPath = root + '/com/example/Fixture.java';
const java = 'package com.example;\nimport org.junit.jupiter.api.Test;\nclass CalculatorTest { @Test void adds() {} }\n';
const kinds = [
  ['java-kind', makeMe.anIntentLocation.at(root).ofKind('java').please()],
  ['explicit-sources', makeMe.anIntentLocation.at(root).withSources({include:['**/*Test.java'], syntax:'java'}).please()],
];
const server = await startDashboardServer({...developmentBoundary, cursorRunner:'stand-in'});
try {
  for (const [index, [name, location]] of kinds.entries()) {
    const revision = (index ? 'a8' : 'a7').repeat(20);
    const at = describedRevision(makeMe.aRepository.withRevision('pinned', {files:{
      '.planning/open-dough.json':intentSettingsText(makeMe.intentSettings.withLocations(location).please()),
      [testPath]:java,
      [helperPath]:'package com.example; class Fixture {}\n',
    }}).please(), revision);
    server.github.serve(everyRepository, publishes(at));
    const listing = await rawRequest({url: `${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&intent=locations`,headers:{Origin:server.origin}});
    const file = await rawRequest({url:`${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&path=${encodeURIComponent(testPath)}`,headers:{Origin:server.origin}});
    const helper = await rawRequest({url:`${server.baseURL}/__authenticated-read?source=open-dough&revision=${revision}&path=${encodeURIComponent(helperPath)}`,headers:{Origin:server.origin}});
    console.log(JSON.stringify({name,listing:{status:listing.status,answer:JSON.parse(listing.body)},file:{status:file.status,answer:JSON.parse(file.body)},helper:{status:helper.status,answer:JSON.parse(helper.body)}}));
  }
} finally {await server.close();}
JS
```

## Current decisions and preparation review

- Follow the existing configured-source goal and the observed Java-kind gap.
  Java source support is the working direction; semantic JUnit discovery is a
  deferred capability, not a hidden filter on what users may read.
- Proof confirms reading, not test execution. Source availability cannot imply
  JUnit CI results. Preserve the existing no-result state and pinned revision.
- No blocking dependency or trunk-only action was identified. Execution mode
  and implementation authority remain with the later execution instruction.
- Slice-plan refinement was not needed: one bounded behavior uses existing
  owners and one integrated proof loop; no fragmented boundaries, extra
  structure or remaining slice-specific concern was identified.

### Preparation browser observation

The focused current-behavior check passed after `npm ci`. Its first attempt
stopped before browser assertions: this new worktree lacked local dependencies,
so server-bundle creation could not make its directory under `node_modules`.
Checkout-local locked setup corrected that environment failure; no test
expectation was changed. Both observations belong to this owned workspace.

## Execution context

- Established Story Branch execution in `/Users/terryyin/git/open-dough/.worktrees/review-junit-tests-in-intent`, branch `codex/review-junit-tests-in-intent`; originating and execution checkout are this workspace. Optional default checkout: `/Users/terryyin/git/open-dough`, preserved.
- Identity `SEED-325#review-junit-tests-in-intent`; publisher `dashboard-territory.local-open-dough`; agent `aki-chan`; starting revision `caf48c6fa41b6a45dcdad4eac35cda9a858b2047`. Accepted claim and initial published base/candidate: `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea` on `origin/main`; increments target `origin/codex/review-junit-tests-in-intent`. Claim CI: unobserved on trunk. No second start.
- Checkout-local `npm ci` succeeded with unchanged lockfile; `npm run typecheck:dashboard` succeeded. The pre-commit hook is understood and check-only: staged lint, then dashboard typecheck for staged scripts. Selective formatter: `npm run format`.
- CI source: GitHub Actions `ci.yml` (verified active workflow `CI`, ID 351271804), push-triggered. Installed runtime belongs to this exact checkout. Codex observer coordinator `seed325-aki`, directory `/tmp/dough-ci-501/watch-Bw2hP0`, PID 3144, stream session 22735, yielded cell `g42:10`, target `terryyin/open-dough:codex/review-junit-tests-in-intent`.
- Replanning retains the existing planned-work authority; no numeric slice hard limit or target was supplied. This remains one bounded proof loop.
- Test-entry selection resolved intended Java browser/backend specs and existing implicated specs with both per-entry flags false. Repository AGENTS still requires shared MakeMe arrangements. New paths must be checked before authoring.
- Expensive proof decision: local macOS host, AC power, load 3.54/3.62/6.72 with reclaimable memory and background indexing. Other active SEED-287/326 worktrees may share capacity; no overlapping heavy suite was observed in the bounded process inspection. Run only the named focused cohort with one worker under `caffeinate -s -i`; implementation agent owns each command through its terminal result. Reconsider on contention or failures; do not relax timeouts or reduce promised coverage.
- ADR index and relevant Accepted ADRs 0001, 0002 and 0008 agree with the shared-owner approach; no conflict or exception.

## Slice 1 acceptance

- Original source and source-only review compared with the actual product, MakeMe setup and observing assertions. Every returned id is observed in the linked source review; no source promise was narrowed and no gap remains. Named sibling coordination: none in the selected source/plan (SEED-287/326 are capacity context only). Freshness returned unchanged at trunk `095f2bff9ce186a48c94f94a39810f8b82767eae`, base `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`.
- Expected pre-change red: the real-publication Java browser journey failed because CalculatorTest.java was absent; evidence `dashboard/test-results/2026-11-12T05-53-38.727Z-93047`. Subsequent new-test expectation/setup and generated-runtime failures were corrected; final required proof is passing, with no running commands.
- Accepted proof: `node --test tests/support/test-entry-rules*.test.mjs` (19 passed); `npm run typecheck:dashboard` (pass); `caffeinate -s -i npm run test:dashboard -- --workers=1 'tests/intent/intent-code-browse' 'tests/intent/intent-gherkin-(groups|unusable)' 'backend-tests/intent/authenticated-read-intent-(locations|selection|java)' 'backend-tests/intent/intent-(story-overlay|location-syntax).spec.ts' 'tests/intent/intent-story-changes' 'frontend-tests/dashboard-system-appearance.spec.ts'` (40 tests in 19 files, pass); `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/makeme-payload.test.mjs` (pass); `git diff --check` (pass). Commands ran in this checkout; setup/assertion locations and consumer dispositions are retained in source-review.md and consumer-trace.md.
- Generated standalone test-entry runtime updated through `node scripts/build-test-entry-rules.mjs`; installed copies untouched. Product, setup, assertions and literal command selections inspected; generated runtime regeneration check and legacy payload checks passed. Expensive-proof decision remained one worker on AC under the sleep guard, reconsidered by the implementation owner.

- Independent dough-post-change-refactor return: none — already clean; no edits and no behavioral reruns, all accepted boundaries/setup/assertions unchanged, git diff --check passed, REFACTOR COMPLETE received. Final pre-delivery freshness again unchanged at trunk 095f2bff9ce186a48c94f94a39810f8b82767eae; no named coordination sibling affects this work.

## Retrospective

Related published implementation: `4980feb6d2aabb7fafc087942c1e28c8c2b86e04`, following our claim `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`. Earlier/intervening sibling claims are excluded. Receipt accepted the implementation on `origin/codex/review-junit-tests-in-intent`, suffix base `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`, observer `/tmp/dough-ci-501/watch-Bw2hP0` reused. Applicable CI is pending, not claimed passing.

Outcome/proof review: original source, ready plan, aggregate committed diff, shared untouched consumers and selected proof agree. The new published-source browser journey drove a red regression before implementation. Detailed membership variants stay at the authenticated boundary; one mixed Java/shell journey and a grammar-failure journey retain integrated Purpose/Proof and recovery proof. Node checks protect independent conventions and generated/installed callers. Existing selectors, safe-path union admission, reading revisions, tabs, overlays and SourceLines own the shared behavior; no duplicate domain rule, speculative framework, weakened constraint or refactor residue was found. Relevant Accepted ADRs 0001/0002/0008 remain satisfied. No corrective plan is needed.

Direction and product advice: configured Java reading advances the backlog’s focus on reviewable test intent. No evidence supports expanding this story into semantic JUnit discovery, execution or result ingestion. Existing future work stays ordered; no new recommendation or product decision requires adoption.

Process review remains selected by `skipProcessRetrospective: false` and deferred under the shared rule because `intentCoverage: true` will request one feature-story check at wrap-up. Complete it once with the report/dispositions and available execution history before cleanup; do not repeat product/proof review.

## Execution complete

Product advice: no change — the configured Java source outcome is delivered and its focused proof is sufficient; no correction or queue change is supported. Process review remains selected and deferred into wrap-up after Intent Coverage.
