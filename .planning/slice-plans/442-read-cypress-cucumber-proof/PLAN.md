# Read the latest Doughnut Cypress-Cucumber proof

**Identity:** SEED-192#read-cypress-cucumber-proof
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#read-cypress-cucumber-proof).

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
| 3 later focused run replaces only its cases | Second run file; Intent shows the new outcome for the re-run scenario and keeps the earlier observation for the other |
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
Status: planned
Proof: Doughnut unit tests feed synthetic Messages envelopes (plain scenario,
outline row cells, `willBeRetried` then final attempt, feature outside the
configured location, no-Git / unwritable destination) and assert compact JSON
matching the Cucumber proof reference; a failing scenario's run exit meaning is
unchanged when the mapper throws (caught / best-effort).

Internal change: Add a Doughnut-owned pure Messages→observations mapper and
atomic run-file writer beside the e2e config, modeled on Pygardon's field rules
but independent of Cucumber.js plugin loading. No Cypress wiring yet.
Enables slice 2.

### 2. Record compact proof from ordinary Doughnut Cypress runs
Type: Behavior
Status: planned
Proof: Early probe — enable Messages for the recorder's use (gitignored side
file, not Proof); register an `after:run` handler after
`addCucumberPreprocessorPlugin` so it runs after Messages flush; declare
`proof` on `e2e_test/features` in `.planning/open-dough.json`. Run one focused
Cypress selection twice (recorder off vs on): exit codes and non-proof
diagnostics match; with recorder on, exactly one new compact proof file lists
only the observed identities. If live Messages lack fields the mapper needs,
or recording changes exit/diagnostics, stop and revise the plan before slice 3.

Behavior: Doughnut's ordinary feature-running Cypress profiles record compact
proof for in-scope finished scenarios without changing runner meaning.

### 3. Intent shows Doughnut's latest Cypress-Cucumber observations
Type: Behavior
Status: planned
Proof: Commit real recorder output from slice 2 (or a follow-up focused run that
includes an outline row and, when Cypress retries are available in that
selection, a retry-assisted pass). At that published Doughnut revision, Intent
shows examples 2–5 (and 7 if exercised). Prefer the live Doughnut project in
the dashboard; an Open Dough Playwright fixture may pin the same committed
proof bytes only as a regression guard, not as a substitute for the first live
read. Terry's usefulness judgment vs Cypress output + editor closes the story
evaluation.

Behavior: Selecting a Doughnut feature in Intent shows each scenario/outline
row's latest committed observation beside Purpose.

## Current decisions

- CI corroboration stays out of this plan (story 7).
- Prefer in-process `after:run` mapping of preprocessor Messages over a
  separate post-`cy:run` script so ordinary profiles cannot skip recording.
- Do not ship a Cypress recorder from Open Dough in this story.

## Concern evidence

Slice-plan refinement was not needed: three slices, one coherent Messages→compact
mapping rule, one early probe bounding the only unsettled live-run premise, and
no independent second outcome or duplicated domain rules across slices.

Remaining slice-specific concerns: none beyond the authorized early probe in
slice 2 (live Cypress Messages shape and exit/diagnostics preservation), whose
failure stops slice 3 and revises the plan.
