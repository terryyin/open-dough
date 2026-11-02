# Read Doughnut's last successful Cypress-Cucumber proof

**Identity:** SEED-192#read-cypress-cucumber-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof).
**Source review:** [independent source-only commitments](source-review.md)

## Goal and scope

A Doughnut developer reviewing a selected feature in Intent sees each scenario
and outline row's last successful committed Cypress-Cucumber proof beside Purpose.
Doughnut's ordinary Cypress runs record the compact Cucumber proof format;
Intent reads it the same way it already reads Pygardon.

Exclusions, from the story: CI corroboration (story 7), folder Proof, committing
Messages ndjson or media as Proof, features outside the declared Gherkin
location, changing Cypress tags/isolation/CI selection, a shared Open Dough
Cypress recorder package, and other Doughnut runners. Ordinary Cypress retries
for successful proof stay in scope (2026-11-02).

Required restrictions: a focused run never claims a full green suite; never key
by generated IDs; never present missing/empty/unreadable proof as a pass.

## Existing solutions and decisions

PFE:

- **Intent reader (reuse).** Open Dough already parses version-1 compact proof,
  reduces to last successful proof, and shows it in Intent
  (`dashboard/src/cucumberProof.ts`, `dashboard/server/intentProofRead.ts`,
  `dashboard/src/IntentProof.tsx`,
  [Cucumber proof reference](../../../src/skills/dough-test-optimization/references/cucumber-proof.md)).
  No second schema. Expect no Open Dough product change unless a Cypress
  observation forces a format-compatible fix.
- **Pygardon recorder (adapt mapping, not the plugin host).**
  `e2e_test/plugins/cucumberProof.mts` maps Cucumber.js Messages envelopes to
  the same compact fields (source identity, last finished attempt, atomic
  per-run file). Doughnut cannot load that plugin: it runs
  `@badeball/cypress-cucumber-preprocessor`, not Cucumber.js.
- **Cypress Messages path (extend Doughnut).** Preprocessor 28.0.1 accumulates
  Messages and can write `cucumber-messages.ndjson` when `messages.enabled`.
  Doughnut already composes multiple `after:run` handlers
  (`e2e_test/config/composeCypressPluginEvents.mjs`) after
  `addCucumberPreprocessorPlugin` in `e2e_test/config/common.ts`. Add a
  Doughnut-owned after:run consumer that maps those Messages into compact proof
  under a declared `proof` directory on the Gherkin Intent location.
Accepted decisions:
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
— proof files are Doughnut repository records; Intent reads published facts.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) — one Proof
meaning via the compact format.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
— reuse the format and reader; no generic adapter framework.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) —
Terry evaluates against Cypress output + editor.
[Initial Intent / Proof](../../../docs/dashboard-development-intent.md) already
describes Gherkin proof reading; no North Star rewrite is warranted.

Implementation homes: Doughnut checkout for the recorder, config, and committed
proof; Open Dough for Intent verification only if a reader defect appears.

## Domain rule

One mapping from a Cypress Cucumber run's Messages to compact observations:

- identity = feature path from repo root + Gherkin scenario name + outline
  example cells when present;
- record only the last finished attempt that actually ran
  (`willBeRetried` false; skip dry/filtered non-runs): a pass records proof
  with all retry attempts, while an unsuccessful final attempt removes that
  identity's earlier proof without recording a failure;
- one uniquely named version-1 file per run under the location's `proof`
  directory; latest successful `finishedAt` wins across files in Intent.
  For legacy files, select latest results before retaining passes. Terry's
  2026-11-02 amendment owns this meaning; historical baseline observations below
  retain their provenance.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Intent shows last-successful compact proof for a Gherkin location with `proof` declared, and distinguishes absent / empty / malformed | Playwright Intent proof journeys | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts` in this preparation checkout after `npm ci` | 7 passed (2026-11-02) |
| Open Dough's parser accepts a real committed Pygardon proof file | `parseProofFile` / `latestObservations` on `pygardon/e2e_test/proof/*.json` | Node import of `dashboard/src/cucumberProof.ts` against Pygardon at `d62f58fb9` | 1 file, 3 observations parsed; latest identities = 3 |
| Doughnut's composed `after:run` still runs every registered handler | `node --test e2e_test/config/composeCypressPluginEvents.test.mjs` in Doughnut at `1581250a75` | 2 passed | Composed completion handlers await each registration |
| Preprocessor can emit Messages ndjson, sets `willBeRetried`, discards intermediate retry messages, and omits reports on hook failures | Read `plugin-event-handlers.js` / `browser-runtime.js` / `preprocessor-configuration.js` in preprocessor 28.0.1 | Source contains writes to `cucumber-messages.ndjson`, retry discard, hook-failure warning | Mechanism present; **live envelope contents from a Doughnut Cypress run remain unbound** → early probe slice 2 |
| `cucumber-messages.ndjson` is not gitignored in Doughnut today | `git check-ignore -v cucumber-messages.ndjson` | NOT ignored | Wiring must gitignore (or otherwise keep) the Messages side file out of committed Proof |

## Outside-in proof

| Story example | Observable signal |
| --- | --- |
| 1 ordinary / focused Cypress selection records without changing exit or diagnostics | Doughnut: same command exit and stdout/stderr shape with recorder on vs off; successful scenarios produce one new compact `.json` under the declared proof directory |
| 2 Intent at a published revision with those observations | Intent on project Doughnut: selected feature shows last successful proof, times, commits, file-version match; a scenario without success reads No successful proof |
| 3 later focused run replaces only its cases | A pass records new successful proof; a final failure clears that identity's earlier proof. Intent keeps the other scenario's earlier success |
| 4 outline row | Observation and Intent row use Gherkin outline name + example cells |
| 5 retry-assisted pass | Intent shows passed-after-retry with attempt count |
| 6 no `proof` declaration | Intent absent-proof copy naming the Cucumber proof reference (already covered by Open Dough absent journey; reconfirm after Doughnut config change only if the undeclared path regresses) |
| 7 record failure / no Messages | Prior committed proof unchanged; Cypress exit unchanged |

Local gates: Doughnut unit tests for the mapper while iterating; one focused
Cypress selection for slice 2; Intent Playwright proof journeys in Open Dough
when verifying published Doughnut proof (or an equivalent published-revision
fixture that uses real recorder output). Before publishing Open Dough changes
(if any), run the focused Intent proof specs above. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Doughnut Cypress command (representative):
`pnpm cy:run --spec '<one feature path>'` (or the project's documented focused
equivalent), with SUT prerequisites the existing runner already requires.

## Ordered slices

### 1. Map Cypress Cucumber Messages to compact proof
Type: Structure
Status: done
Proof: Satisfied outside this checkout by Doughnut SEED-096#cucumber-proof
(`e87c86c692` and close `09e6779e24` on Doughnut `origin/main`): Doughnut-owned
Messages→compact mapper/recorder under `e2e_test/config/cucumberProof*.mjs`
with focused Node tests. Developer authorized (2026-11-02) not to reimplement
here.

Internal change: none in Open Dough.

### 2. Record compact proof from ordinary Doughnut Cypress runs
Type: Behavior
Status: done
Proof: Satisfied by the same Doughnut landing: `.planning/open-dough.json`
declares `proof: "e2e_test/proof"` on `e2e_test/features`; committed run file
`e2e_test/proof/20261102T030305438Z-d4182692-ae90-4ae0-981d-a993fec40c59.json`
(9 passed observations for `note_creation.feature`). Developer authorized
resume at slice 3 only.

Behavior: Doughnut ordinary Cypress profiles record compact proof (owned by
SEED-096).

### 3. Intent shows Doughnut's last successful Cypress-Cucumber proof
Type: Behavior
Status: done
Proof: Accepted 2026-11-02. Live Intent read of Doughnut published proof
(example 2 + No successful proof) plus regressions
`intent-doughnut-cucumber-proof.spec.ts` (note_creation, outline, retry).
Outline proof on Doughnut main (PR #1651). Retry-assisted pass on Doughnut main
(PR #1652, `attempts: 2`). Example 3 owner-changed to SEED-220 successful-only.
G3 proved via recorder/runner silence tests. Terry confirmed usefulness
2026-11-02. Focused Playwright:
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-doughnut-cucumber-proof.spec.ts` → 3 passed.

Behavior: Selecting a Doughnut feature in Intent shows each scenario/outline
row's last successful committed proof beside Purpose.

## Current decisions

- CI corroboration stays out of this plan (story 7).
- Prefer in-process `after:run` mapping of preprocessor Messages over a
  separate post-`cy:run` script so ordinary profiles cannot skip recording.
- Do not ship a Cypress recorder from Open Dough in this story.
- **2026-11-02 developer choice:** Do not implement Doughnut slices 1–2 in this
  Open Dough execution. Doughnut SEED-096#cucumber-proof owns that recorder.
  Wait until it lands on Doughnut `origin/main` with committed compact proof,
  then resume at slice 3 only.
- **2026-11-02 resume:** Developer reported SEED-096 ready. Confirmed closed on
  Doughnut `origin/main` (`SEED-096_cucumber-proof` in done catalog;
  `e87c86c692` proof commit; `proof` declared; one committed proof file).
  Slices 1–2 marked done by that landing; continue at slice 3.
- **2026-11-02 product direction / usefulness / slice 3:** Keep SEED-220
  successful-only; absorb trunk last-successful wording; retries stay in scope.
  Terry confirmed Intent Doughnut Proof useful beside Cypress + editor. Live
  Intent at Doughnut `6c045cc` showed example 2 for `note_creation` and explicit
  absence (`Not observed`) for `note_deletion`; no reader defect. Exact copy
  `No successful proof` remains SEED-220. Outline (`account_control`, PR #1651)
  and retry (`cypress_retry` attempts:2, PR #1652) proof on Doughnut main;
  Open Dough regressions pin those bytes under
  `dashboard/tests/fixtures/doughnut-cucumber-proof/`. Dispositions below.

## Story obligations

### G1. Outline row not in published Doughnut proof
Reported: slice 3 — "Doughnut 1be2689d21 on main publishes account_control outline rows; Intent regression asserts Example cells."
Story clause: "A Scenario Outline row is observed: Intent names the outline's Gherkin scenario name and that row's example cells, distinct from other rows."
Disposition: proved by slice 3: Doughnut e2e_test/proof/20261102T064803493Z-e248a161-1d96-4341-b228-5e2723cdd0d3.json on origin/main + intent-doughnut-cucumber-proof.spec.ts outline Intent test

### G2. Later focused run failure replace vs Doughnut successful-only store
Reported: slice 3 — "Developer amended example 3 to successful-only clear (SEED-220); do not show Failed as latest."
Story clause: "A later focused run re-runs only one scenario and it fails. After commit, its earlier proof is removed, Intent shows No successful proof for that scenario, and the other scenario keeps its earlier success. A later pass restores successful proof; a mixed-result run retains its passing scenarios."
Disposition: owner changed "A later focused run re-runs only one scenario and it fails. After commit, its earlier proof is removed, Intent shows No successful proof for that scenario, and the other scenario keeps its earlier success."
Commitment: 12e, E3a, E3b, E3c

### G3. Cannot-record / no-Messages path not exercised against prior Doughnut proof
Reported: slice 3 — "Recorder/runner tests cover silent cannot-record; note_creation proof still Intent-readable."
Story clause: "A run outside Git, or a spec whose hook failure yields no Messages contribution, leaves prior committed proof unchanged and does not fail Cypress for that reason."
Disposition: proved by slice 3: cucumberProofRecorder.test.mjs silent missing-Git/write; cucumberProofRunner.test.mjs hook-failure exit preserved; note_creation proof still Intent-readable

### G4. Retry-assisted pass not in published Doughnut proof
Reported: slice 3 — "Doughnut PR #1652 publishes cypress_retry attempts:2 passed; Intent shows Passed after retry (2 attempts)."
Story clause: "A scenario passes on a Cypress retry: Intent shows a retry-assisted pass with attempt count, not a clean single-attempt pass."
Disposition: proved by slice 3: Doughnut e2e_test/proof/20261102T070001761Z-49dd375b-a1e7-46d9-a5b1-5a67b567e939.json on origin/main + intent-doughnut-cucumber-proof.spec.ts retry Intent test

### G5. Intent copy still says Not observed for no-success rows
Reported: slice 3 — "Absorbed trunk example 2 wording requires No successful proof; product still shows Not observed until SEED-220."
Story clause: "a scenario without success reads No successful proof."
Disposition: owner changed "a scenario without success reads No successful proof."
Commitment: E2

### X1. CI corroboration deferred
Reported: slice 3 — "CI corroboration deferred to story 7."
Story clause: "CI corroboration of Doughnut's local observations (story 7 owns the first comparison policy"
Disposition: excluded "CI corroboration of Doughnut's local observations (story 7 owns the first comparison policy"
Commitment: X1

### X2. Folder-level Proof deferred
Reported: slice 3 — "Folder-level Proof summaries deferred."
Story clause: "Folder-level Proof summaries (story 9)."
Disposition: excluded "Folder-level Proof summaries (story 9)."
Commitment: X2

### X3. Bulky Messages/media as Proof deferred
Reported: slice 3 — "Bulky Messages and media as Proof deferred."
Story clause: "Committing Messages ndjson, screenshots, videos, traces or step logs as Proof."
Disposition: excluded "Committing Messages ndjson, screenshots, videos, traces or step logs as Proof."
Commitment: X3

### X4. Outside Gherkin location deferred
Reported: slice 3 — "Outside declared Gherkin location recording deferred."
Story clause: "Recording features outside the declared Gherkin Intent location, including throwaway specs."
Disposition: excluded "Recording features outside the declared Gherkin Intent location, including throwaway specs."
Commitment: X4

### X5. Cypress tags/isolation/CI selection deferred
Reported: slice 3 — "Cypress tags/isolation/CI selection changes deferred; retries enablement authorized for G4."
Story clause: "Changing Doughnut's Cypress tags, isolation, or CI selection."
Disposition: excluded "Changing Doughnut's Cypress tags, isolation, or CI selection."
Commitment: X5

### X6. Shared recorder / second format deferred
Reported: slice 3 — "Shared Open Dough Cypress recorder package deferred."
Story clause: "A shared Open Dough-shipped Cypress recorder package, or teaching Intent a second proof format."
Disposition: excluded "A shared Open Dough-shipped Cypress recorder package, or teaching Intent a second proof format."
Commitment: X6, X7

### X7. Non-Cypress Doughnut families deferred
Reported: slice 3 — "Non-Cypress Doughnut families deferred."
Story clause: "Vitest, Node, Playwright or other Doughnut non-Cypress families."
Disposition: excluded "Vitest, Node, Playwright or other Doughnut non-Cypress families."
Commitment: X8

## Concern evidence

No slice-plan refinement: three slices, one Messages→compact rule, one early
probe for live Cypress Messages/exit. That probe's failure stops slice 3.

## Execution complete

Product advice: Keep SEED-220#last-successful-intent-proof as the owner for
successful-only clear and exact `No successful proof` copy; no new backlog
item from this story—second Cypress-Cucumber producer validated the shared
Intent proof path (Terry useful 2026-11-02), with CI corroboration still owned
by SEED-192#check-cucumber-proof-in-ci.
