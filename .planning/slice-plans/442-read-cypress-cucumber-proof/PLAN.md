# Read the latest Doughnut Cypress-Cucumber proof

**Identity:** SEED-192#read-cypress-cucumber-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof).
**Source review:** [independent source-only commitments](source-review.md)

## Goal and scope

A Doughnut developer reviewing a selected feature in Intent sees each scenario
and outline row's latest committed Cypress-Cucumber observation beside Purpose.
Doughnut's ordinary Cypress runs record the compact Cucumber proof format;
Intent reads it the same way it already reads Pygardon.

Exclusions, from the story: CI corroboration (story 7), folder Proof, committing
Messages ndjson or media as Proof, features outside the declared Gherkin
location, changing Cypress tags/isolation/retries/CI selection, a shared
Open Dough Cypress recorder package, and other Doughnut runners.

Required restrictions: a focused run never claims a full green suite; never key
by generated IDs; never present missing/empty/unreadable proof as a pass.

## Existing solutions and decisions

PFE:

- **Intent reader (reuse).** Open Dough already parses version-1 compact proof,
  reduces to latest observations, and shows them in Intent
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
- **Gap.** No Doughnut proof directory, no Cypress→compact recorder, no
  committed Doughnut proof files.

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
  (`willBeRetried` false; skip dry/filtered non-runs);
- one uniquely named version-1 file per run under the location's `proof`
  directory; latest `finishedAt` wins across files in Intent.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Intent shows latest compact proof for a Gherkin location with `proof` declared, and distinguishes absent / empty / malformed | Playwright Intent proof journeys | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/intent-cucumber-proof.spec.ts dashboard/tests/intent-cucumber-proof-absent.spec.ts` in this preparation checkout after `npm ci` | 7 passed (2026-11-02) |
| Open Dough's parser accepts a real committed Pygardon proof file | `parseProofFile` / `latestObservations` on `pygardon/e2e_test/proof/*.json` | Node import of `dashboard/src/cucumberProof.ts` against Pygardon at `d62f58fb9` | 1 file, 3 observations parsed; latest identities = 3 |
| Doughnut's composed `after:run` still runs every registered handler | `node --test e2e_test/config/composeCypressPluginEvents.test.mjs` in Doughnut at `1581250a75` | 2 passed | Composed completion handlers await each registration |
| Preprocessor can emit Messages ndjson, sets `willBeRetried`, discards intermediate retry messages, and omits reports on hook failures | Read `plugin-event-handlers.js` / `browser-runtime.js` / `preprocessor-configuration.js` in preprocessor 28.0.1 | Source contains writes to `cucumber-messages.ndjson`, retry discard, hook-failure warning | Mechanism present; **live envelope contents from a Doughnut Cypress run remain unbound** → early probe slice 2 |
| `cucumber-messages.ndjson` is not gitignored in Doughnut today | `git check-ignore -v cucumber-messages.ndjson` | NOT ignored | Wiring must gitignore (or otherwise keep) the Messages side file out of committed Proof |

## Outside-in proof

| Story example | Observable signal |
| --- | --- |
| 1 ordinary / focused Cypress selection records without changing exit or diagnostics | Doughnut: same command exit and stdout/stderr shape with recorder on vs off; one new compact `.json` under the declared proof directory listing only the scenarios that ran |
| 2 Intent at a published revision with those observations | Intent on project Doughnut: selected feature shows those scenarios' latest outcomes, times, commits, file-version match; an unobserved scenario reads Not observed |
| 3 later focused run fails a previously passed case (successful-only) | Failure clears that identity; Intent shows Not observed for it and keeps the other scenario's earlier pass (SEED-220) |
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

### 3. Intent shows Doughnut's latest Cypress-Cucumber observations
Type: Behavior
Status: planned
Proof: At published Doughnut revision carrying that proof (at least
`e87c86c692` / current `origin/main`), Intent shows examples 2–5 (and 7 if
exercised). Prefer the live Doughnut project in the dashboard; an Open Dough
Playwright fixture may pin the same committed proof bytes only as a regression
guard, not as a substitute for the first live read. Landed SEED-096 proof today
covers plain passed scenarios on one feature (example 2 path); outline rows and
retry-assisted passes are not in that committed file — obtain them via a
Doughnut follow-up focused run if still required, or record the gap. Terry's
usefulness judgment vs Cypress output + editor closes the story evaluation.

Behavior: Selecting a Doughnut feature in Intent shows each scenario/outline
row's latest committed observation beside Purpose.

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
- **2026-11-02 slice 3 learning:** Live Intent on registered project Doughnut
  at published `6c045cc` shows example 2 for `note_creation.feature` (9
  passed, commit `d648487`, This file version) and Not observed for
  `note_deletion.feature`. No Open Dough reader defect. Landed proof still
  lacks a second run file, outline `example` cells, and `attempts > 1`; a
  Doughnut follow-up focused Cypress publish would own those bytes — not
  obtained in this Open Dough checkout. Playwright regression pins the same
  committed proof bytes under `dashboard/tests/fixtures/doughnut-cucumber-proof/`.
- **2026-11-02 Doughnut follow-up (authorized `pnpm cy:run` + commit):** On
  Doughnut worktree `cursor/cypress-cucumber-proof-followup` from
  `origin/main` `796b350c`, focused
  `./scripts/run.sh pnpm cy:run --spec e2e_test/features/users/account_control.feature`
  recorded three outline rows with `example` cells; committed and pushed as
  `e2e_test/proof/20261102T064803493Z-e248a161-1d96-4341-b228-5e2723cdd0d3.json`
  at Doughnut SHA `1be2689d21` (branch `origin/cursor/cypress-cucumber-proof-followup`;
  not yet on `origin/main`). Open Dough fixtures/regression pin those bytes
  plus `account_control.feature`. Prior note_creation proof file unchanged
  beside it. Slice 3 stays planned; Story obligations stay open for
  coordinator acceptance. Terry usefulness (commitment 32) unobserved.

### Proposed dispositions (coordinator acceptance pending)

- **G1 → observed:** Outline rows published; Intent regression shows
  outline name + `Example: …` cells for three distinct rows.
- **G2 → owner-changed (2026-11-02):** Story example 3 amended to SEED-220
  successful-only clear (Not observed for failed identity; keep other pass;
  do not show Failed). Doughnut store already matches.
- **G3 → observed (cite existing tests + prior proof):** Recorder test
  `proof failures and a missing Git checkout remain silent and harmless`
  (`cucumberProofRecorder.test.mjs`); runner fixture preserves Cypress exit
  with hook failures and scopes proof to executed Messages cases
  (`cucumberProofRunner.test.mjs`). Prior committed note_creation proof still
  present and Intent regression still reads it; no destructive live outside-Git
  run required.
- **G4 → proved (2026-11-02):** Ordinary `retries.runMode: 1`; Doughnut PR
  #1652 publishes `cypress_retry` proof with `attempts: 2` passed; Intent
  regression shows Passed after retry (2 attempts).

## Story obligations

### G1. Outline row not in published Doughnut proof
Reported: slice 3 — "Doughnut 1be2689d21 on main publishes account_control outline rows; Intent regression asserts Example cells."
Story clause: "A Scenario Outline row is observed: Intent names the outline's Gherkin scenario name and that row's example cells, distinct from other rows."
Disposition: proved by slice 3: Doughnut e2e_test/proof/20261102T064803493Z-e248a161-1d96-4341-b228-5e2723cdd0d3.json on origin/main + intent-doughnut-cucumber-proof.spec.ts outline Intent test

### G2. Later focused run failure replace vs Doughnut successful-only store
Reported: slice 3 — "Developer amended example 3 to successful-only clear (SEED-220); do not show Failed as latest."
Story clause: "A later focused run re-runs only one previously passed scenario and it fails. After commit, that identity has no successful proof in Intent (Not observed / cleared), while another scenario's earlier pass remains — same successful-only meaning as SEED-220 (2026-11-02 developer choice; do not show Failed as latest observation)."
Disposition: owner changed "A later focused run re-runs only one previously passed scenario and it fails. After commit, that identity has no successful proof in Intent (Not observed / cleared), while another scenario's earlier pass remains — same successful-only meaning as SEED-220 (2026-11-02 developer choice; do not show Failed as latest observation)."
Commitment: 38

### G3. Cannot-record / no-Messages path not exercised against prior Doughnut proof
Reported: slice 3 — "Recorder/runner tests cover silent cannot-record; note_creation proof still Intent-readable."
Story clause: "A run outside Git, or a spec whose hook failure yields no Messages contribution, leaves prior committed proof unchanged and does not fail Cypress for that reason."
Disposition: proved by slice 3: cucumberProofRecorder.test.mjs silent missing-Git/write; cucumberProofRunner.test.mjs hook-failure exit preserved; note_creation proof still Intent-readable

### G4. Retry-assisted pass not in published Doughnut proof
Reported: slice 3 — "Doughnut PR #1652 publishes cypress_retry attempts:2 passed; Intent shows Passed after retry (2 attempts)."
Story clause: "A scenario passes on a Cypress retry: Intent shows a retry-assisted pass with attempt count, not a clean single-attempt pass."
Disposition: proved by slice 3: Doughnut e2e_test/proof/20261102T070001761Z-49dd375b-a1e7-46d9-a5b1-5a67b567e939.json on origin/main + intent-doughnut-cucumber-proof.spec.ts retry Intent test

### X1. CI corroboration deferred
Reported: slice 3 — "CI corroboration deferred to story 7."
Story clause: "CI corroboration of Doughnut's local observations (story 7 owns the first comparison policy"
Disposition: excluded "CI corroboration of Doughnut's local observations (story 7 owns the first comparison policy"
Commitment: 43

### X2. Folder-level Proof deferred
Reported: slice 3 — "Folder-level Proof summaries deferred."
Story clause: "Folder-level Proof summaries (story 9)."
Disposition: excluded "Folder-level Proof summaries (story 9)."
Commitment: 44

### X3. Bulky Messages/media as Proof deferred
Reported: slice 3 — "Bulky Messages and media as Proof deferred."
Story clause: "Committing Messages ndjson, screenshots, videos, traces or step logs as Proof."
Disposition: excluded "Committing Messages ndjson, screenshots, videos, traces or step logs as Proof."
Commitment: 45, 46, 47, 48, 49

### X4. Outside Gherkin location deferred
Reported: slice 3 — "Outside declared Gherkin location recording deferred."
Story clause: "Recording features outside the declared Gherkin Intent location, including throwaway specs."
Disposition: excluded "Recording features outside the declared Gherkin Intent location, including throwaway specs."
Commitment: 50

### X5. Cypress tags/isolation/CI selection deferred
Reported: slice 3 — "Cypress tags/isolation/CI selection changes deferred; retries enablement authorized for G4."
Story clause: "Changing Doughnut's Cypress tags, isolation, or CI selection."
Disposition: excluded "Changing Doughnut's Cypress tags, isolation, or CI selection."
Commitment: 51, 52, 53

### X6. Shared recorder / second format deferred
Reported: slice 3 — "Shared Open Dough Cypress recorder package deferred."
Story clause: "A shared Open Dough-shipped Cypress recorder package, or teaching Intent a second proof format."
Disposition: excluded "A shared Open Dough-shipped Cypress recorder package, or teaching Intent a second proof format."
Commitment: 54, 55

### X7. Non-Cypress Doughnut families deferred
Reported: slice 3 — "Non-Cypress Doughnut families deferred."
Story clause: "Vitest, Node, Playwright or other Doughnut non-Cypress families."
Disposition: excluded "Vitest, Node, Playwright or other Doughnut non-Cypress families."
Commitment: 56

## Concern evidence

Slice-plan refinement was not needed: three slices, one coherent Messages→compact
mapping rule, one early probe bounding the only unsettled live-run premise, and
no independent second outcome or duplicated domain rules across slices.

Remaining slice-specific concerns: none beyond the authorized early probe in
slice 2 (live Cypress Messages shape and exit/diagnostics preservation), whose
failure stops slice 3 and revises the plan.
