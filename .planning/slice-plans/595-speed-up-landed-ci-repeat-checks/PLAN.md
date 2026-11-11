# Speed up landed CI repeat checks

**Identity:** SEED-314#speed-up-landed-ci-repeat-checks
**Source:** [Story](../../seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks)

## Goal and scope

Maintainers get faster feedback from the twelve cases of
[landed-ci-automatic-repeat.spec.ts](../../../dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts)
and
[landed-ci-repeat-verdict.spec.ts](../../../dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts),
with the same verdict under the machine's usual load as in CI. Three real
journeys remain, one for each reply the provider can give to the rerun
request. The nine outcomes that provider facts decide after an accepted
request are read from saved accepted requests. The whole one-worker command
takes at least a quarter less wall time than the execution base, at most three
cases pay for a receipt-to-admission journey, and every case fits the default
30 s at local load 20–30 on 2 workers.

Included: the landed CI history fixture starting only the servers a case asks
for; provider facts for a run and its repeat stated per run; saved accepted
requests arranged through shared MakeMe; the measured comparison.

Excluded: product code; the cases and assertions of the admission, receipt
boundary, reconciliation and follow-up reading specs and of the two browser
journeys; first-in-worker origin preparation, which SEED-287 owns; the off
switch, card reads and request counts inside the three remaining journeys,
which stay as they are; the repository node suite's follow-up policy, reading
and ledger tests, which are credited with no replacement. No list under
`dashboard/longest-first*` names either spec, so no shard weight changes.

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the comparison and the result worth keeping to be set before the
measured run. The story's success measure sets both.

## Decision before Take

Terry decides who repairs the admission spec's 5 s observations, which miss
under load on main. Evidence: in the two two-worker runs of unchanged main at
load 19–23,
`landed-ci-repeat-admission.spec.ts:82` failed twice and `:11` once, each a
5 s poll for a collected history or card after the receipt. A scratch run
with slice 2's fixture change also failed `:58`, and once
`landed-ci-history-no-proof-recovery.spec.ts:36` at its 5 s history poll.

Under the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
these are defects to fix, and reproducing them on main is attribution, not an
exemption. They sit outside this story's two specs, and no story names them.

- Recommended: SEED-287. Its scope names 5 s observations at local load 20–30
  on 2 workers and waiting for persisted collector results, and tells its
  executor to inspect siblings that share a setup. Its named cases predate
  these specs. This plan then stands as written.
- Otherwise this story: one more Behavior slice through plan refinement,
  before slice 5, with those specs added to the load proof.

Until Terry routes them, the consumer selections in slices 2–4 are the proof
that this story's changes keep those specs behaving as on the base. A failure
there that the base does not show is this story's. One the base shows too is
the defect above, and the policy leaves it with the executing agent unless
another active execution owns that exact repair by then.

## Architecture and reuse

PFE, servers a case starts: the responsibility is "a boundary spec that starts
its own collecting servers starts only those". Its owner is
`dashboard/tests/support/landedCiHistoryTest.ts`, whose `startServer` 27 spec
files use. The page fixture in `dashboard/tests/dashboardTest.ts` resolves
`baseURL` from its `dashboard` server, and Playwright resolves `baseURL` for
every test, so each case starts that server whether or not it asks for it.
None of the 27 files opens a page; five ask for `dashboard` themselves. Change
the one owner so `baseURL` no longer depends on the page fixture's server
there. A spec that asks for `dashboard` still gets it. That server collects
nothing: a test server collects only with `collectingLandedCi` in its
environment.

PFE, a saved repeat request: the existing owners are `makeMe.aCiRepeatRequest`
and `makeMe.aCiFollowUpEntry` with `repeatLedgerFacts()` in
`tests/support/ciFollowUpLedgerFacts.mjs`, which the repository node suite's
ledger and reading tests use. Reuse them and state the facts that drive each
outcome at the call site: the original's run and seconds, the average, and an
accepted submission. No second representation of a request.

PFE, provider facts: the answerer inside `prepareRepeatScenario` in
`dashboard/tests/support/ciFollowUpScenario.ts` already serves an original run
and its repeat through the existing fake GitHub, for run 71 and one story
only, with `providerVerdict` for raw conclusion fields. Modularize it: the
facts for one original run and its repeat become one unit that the journey
scenario and the saved requests both state their runs to.
`ciFollowUpScenario.ts` is at 225 lines, so that unit takes its own module and
the scenario shrinks.

PFE, outcome policy below the dashboard boundary:
`tests/support/ci-follow-up-policy.test.mjs` owns the five-percent threshold
and full-repeat job rules, `ci-follow-up-reading.test.mjs` the reading of
failed, cancelled and verdictless repeats, and `ci-follow-up-ledger.test.mjs`
spending once and never resending. They stay as they are. Nothing below reads
provider facts into an outcome; `observeRepeat` in
`dashboard/server/ciFollowUpObservation.ts` does that only inside collection.
The saved-request cases therefore run real collection in a real server.

The product already promises what a saved-request case relies on:
`collectCiFollowUps` observes every held request that is not settled, with the
comment "Already spent requests stay observable after disablement and chart
pruning", whatever history the machine keeps.

Common rule for every slice: a case pays for a journey only for what that
journey alone can show, and an observation leaves only when a deliberate
product fault still fails a remaining check.

No file this plan expects to edit exceeds 250 lines: the automatic-repeat spec
150, the verdict spec 51, `ciFollowUpScenario.ts` 225,
`landedCiHistoryTest.ts` 47, `ciFollowUpLedgerFacts.mjs` 49.
`tests/support/ciMakeMe.mjs` is at 242 and is not edited: both builders
exist. No ADR, North Star topic or product documentation changes.

## Outside-in proof ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| A real journey for the accepted request with its whole lifecycle | 2–3: the lifecycle case is unchanged apart from its fixtures and passes; F1–F3 each fail it |
| A real journey each for the refused and the uncertain reply, from the provider's actual reply | 3: both stay in the journey loop with their assertions unchanged; F2 and F8 fail the refused journey, F9 the uncertain one |
| Recovered, failed, cancelled and partial proof read where the dashboard reads provider facts, without a journey of their own | 3: the saved-request case in the automatic-repeat spec; F4, F5, F6b and F7 each fail it and name the outcome |
| Absent and unknown conclusions read the same way | 4: the saved-request case in the verdict spec; F10 and F11 each fail it and name the conclusion |
| A case prepares only what its assertions use | 2: no family case's trace holds a `Fixture "dashboard"` step |
| Surviving proof before any removal | 3–4: a journey variant leaves only after its fault fails the saved-request case |
| Every credited replacement check and all preparation inside the measured selection | 3–5: the saved-request cases live in the family's two specs; the measured command is those two specs |
| Shared MakeMe and the existing provider fixture | 3–4: saved requests come from `aCiRepeatRequest` and `aCiFollowUpEntry`; provider facts from the fake GitHub |
| Exactly once is an exact count in a journey that waits for the request's arrival | 3: the three journeys keep `await submitted` and `toEqual([71])`. 4: the verdict spec's 5 s count poll leaves with its journeys; the saved-request cases expect no rerun request |
| Five prior builds behind every admission | 3: the three journeys keep `prepareRepeatScenario`'s five prior builds |
| The original and average stay beside each outcome; the saved original stays readable after follow-up is turned off | 3–4: the saved-request cases read each request's original and reference; the refused and uncertain journeys keep the off switch |
| Every case inside the default 30 s with its 5 s observations at load 20–30 on 2 workers; no allowance | 5: three consecutive two-worker runs in that load; no `test.setTimeout` or expectation timeout in the diff |
| A quarter less whole-command wall time; at most three journey cases | 5: alternating base and candidate runs, three passing observations each; the count of cases that ingest a receipt |
| Ordinary CI selection; no mocks, sleeps, retries, skips or runner modes | 5: same spec paths and command; diff review; hosted CI on the published revision |
| The other repeat specs and browser journeys keep passing as they do | 2: the 27-file consumer selection. 3–4: the specs that import `ciFollowUpScenario.ts`. Each compared with the base under [Decision before Take](#decision-before-take) |

## Decisive premises

Observed in this preparation's workspace at `f9ed9f52b` on 2026-11-11 after
`node scripts/setup-native.mjs npm`, `browser` and `check`, while other work
held the one-minute load between 12 and 34. One worker unless stated. Scratch
edits were reverted before recording.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The focused command runs the twelve cases in a worktree and records durations | Every slice's proof | `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file> npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1` | Settled for the route: 12 selected, twelve attempts with `durationMs`, `FAIL:` lines for failures. On main at load 18.8 → 25.3 it took 261 s; three verdict cases failed at `:26`, and the lifecycle case passed in 30.06 s |
| Each outcome case repeats the journey and differs in one provider answer | Slice 3 approach | Scratch timing laps in the outcome loop and in `prepareRepeatScenario`; `--reporter=list -g "collected repeat"` | Settled: 6 passed. Per case not first in its worker: prior builds 0.5–0.7 s, published story 1.3–1.6, server and switch 0.3–0.5, ingestion 0.6–1.2, wait for the rerun request 2.5–3.1, outcome poll 1.6–2.0, later reads and off switch 1.8–3.2; whole case 10.5–11.7 s at load 13–18 |
| A held accepted request alone reaches its outcome, with no prior builds, story or receipt on that machine | Slices 3–4 approach and sizing | Scratch case: real journey to an accepted request, its ledger file copied to a second `startOrigin` machine, `setRepeat({ seconds: 104 })`, a `recheckingLandedCi` boundary server started there, poll of the saved request's outcome | Settled: `kind: "recovered"`, `settled: true`, "CI timing returned to range" 1.3 s after server start at load 24–27; the second origin took 0.3 s; `repeatCalls` stayed `[71]`. Unverified: a request arranged through MakeMe instead of copied bytes, and several requests on one machine. The loop in `collectCiFollowUps` takes every held landing in turn; each slice's own case observes both |
| That machine shows no card | Slices 3–4 observation point | The same scratch case read `followUpSettings` on the second machine | Settled: `cards: []`. `completedFollowUps` selects a landing by its published completion, so the cases read the saved request with `readFollowUpLedger`, as the lifecycle case already does for intent and accepted |
| Every case starts a page-fixture server it never asks | Slice 2 target | `--trace=on --reporter=list`; `Fixture` steps in each case's `test.trace` | Settled: `Fixture "dashboard"` in all seven automatic-repeat cases, 0.8 s at load 13–15 and 2.0–3.6 s at load 22–27 |
| Without that server the automatic-repeat spec still passes | Slice 2 approach | Scratch `baseURL: undefined` in the spec's `test.use`; whole spec twice, and one traced case | Settled: 7 passed twice, at load 14.9 → 20.4 and 33.8 → 30.4; the traced case holds no `dashboard`, `codexProtocol` or `extraEnv` fixture step |
| The same change in `landedCiHistoryTest.ts` keeps its 27 consumers passing | Slice 2 owner choice | Scratch `baseURL` fixture there that uses `undefined`; the 27 files at `--workers=2 --reporter=list`; the three files with a failure rerun at one and at two workers, and on unchanged main at two | Settled with a remainder: 55 of 59 passed at load 18.9 → 19.9. The four failures were 5 s polls: admission `:58` and `:82`, verdict null, no-proof recovery `:36`. With the change those three files passed 11 of 11 at one worker and at two workers at load 11.7 → 13.5, and failed the five verdict cases at 13.5 → 19.7. Unchanged main at two workers failed admission `:82` and verdict neutral at load 19.2 → 20.4, and admission `:11` and `:82` and verdict undefined and null at 20.4 → 23.5. Unverified: no-proof recovery `:36` failed once in three two-worker runs with the change and in none of two on main; slice 2 compares it with the base |
| Main's fault owners | Slices 3–4 surviving proof | One scratch product edit per fault, the named case with `--reporter=list`, revert; the edits are in the fault table | Settled: F1 fails the lifecycle case by timeout, with no rerun request for 19.5 s after the receipt; F2 fails the lifecycle case at `:83` and the refused case at `:144` with `[71, 71]`, and the recovered case passes; F3 fails the lifecycle case at `:70`; F4, F5, F6b, F7, F8 and F9 each fail their outcome case at `:131` with the faulted explanation; F6a passes the cancelled case; F10 and F11 fail the verdict cases at `:33` |
| Main times out under load | Slice 5 load proof; the story's restriction | Whole-spec runs of unchanged main | Settled: at load 26.7 → 21.9 (traced) the lifecycle case took 31.1 s and recovered 31.0 s, over the default 30 s; at 20.4 → 33.8 they took 31.0 and 31.3 s; at 30.4 → 26.8 all seven passed in 83 s |
| Five prior builds are the product's minimum | Slice 3 keeps `prepareRepeatScenario`'s prior builds | Read `dashboard/src/ciPriorBuildReference.ts`: `included.length < 5` leaves `averageMs` undefined, and `repeatDecisionOf` admits nothing without an average | Settled by reading; the plan changes no prior build |
| Two-worker runs under burners are reachable and reported | Slice 5 load proof | `bash scripts/dashboard-repeat.sh 1 --load backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts` with Homebrew Bash first on `PATH` | Settled for the route: "Run 1 under burners: exit 1, 182 s, load 22.38 -> 40.25", eight `FAIL:` lines of twelve cases, and the kept directory. Other work already held the load at 22, so burners took it past the profile |
| The node tests that use `repeatLedgerFacts` run through the repository runner | Slice 3 consumer proof | `bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-reading.test.mjs` | Settled: exit 0 |
| No shard weight names either spec | Scope | `grep -rn` of both spec names under `dashboard/longest-first*` | Settled: no match |

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos);
on battery, plug in or start fully awake with the lid open under
`caffeinate -i` and read the sleep log afterwards. The
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every delegation and repair handoff.

Focused commands, from the repository root:

- Family: `npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1`,
  with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file>` for durations and no
  `--reporter`. Three consecutive passes after a change to a case or its
  support.
- Fixture steps: the same selection with `--trace=on --reporter=list`, read
  from each case's `test.trace` as in the premise row.
- Consumers of the landed CI history fixture: every spec that imports
  `landedCiHistoryTest.ts`, at `--workers=2`.
- Consumers of the repeat scenario: every spec that imports
  `ciFollowUpScenario.ts`, at `--workers=2`.
- A consumer failure is compared with the base worktree in the same load
  window, at two workers and at one. See
  [Decision before Take](#decision-before-take).
- Node consumers of the ledger facts:
  `bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-reading.test.mjs`
  with Homebrew Bash first on `PATH`.
- Fault controls: apply one scratch product edit from the table, run the
  named case with `--reporter=list`, record which case fails and at which
  expectation, and revert before the next.
- Under load: two workers at a one-minute load of 20–30. Below it,
  `bash scripts/dashboard-repeat.sh 1 --load` with the two spec paths and
  Homebrew Bash first on `PATH`; when other work already holds the load
  there, the same script without `--load`.

Typecheck and lint the affected paths through the ordinary commit hooks. No
whole local suite is required: the changed fixtures serve the two consumer
selections above. Hosted CI runs the whole suite on the published revision,
and its failures stay the executor's.

Record the base revision, literal commands, pass counts, wall times and the
one-minute load before and after each timed run.

Fault controls, each a scratch edit of product code that is reverted before
any commit. `observeRepeat` is in `dashboard/server/ciFollowUpObservation.ts`.

| Fault | Regression | Scratch edit | Owner on main | Owner after this plan |
| --- | --- | --- | --- | --- |
| F1 | An original at exactly 105 s is not admitted | `>=` becomes `>` in `reachesFollowUpThreshold`, `dashboard/src/ciFollowUpRule.ts` | Lifecycle case, by timeout | The same |
| F2 | A later collection pass sends a second request | Drop the `admitted.request !== undefined` guard in `collectCiFollowUps` and in `spendRepeat` | Lifecycle `:83` and refused `:144` | The same |
| F3 | A 106 s repeat is not slow | `slow` is always false in `observeRepeat` | Lifecycle `:70` | The same |
| F4 | A 104 s repeat stays slow | `slow` is always true | Recovered case | Saved-request case, recovered |
| F5 | A failed repeat is measured as a pass | `failure` passes the `conclusion !== "success"` branch | Failed case | Saved-request case, failed |
| F6a | A cancelled repeat reads as failed | The cancelled branch never matches and `cancelled` counts as failed | None: the case passes | None promised |
| F6b | A cancelled repeat is measured as a pass | The cancelled branch never matches and `cancelled` passes the `conclusion !== "success"` branch | Cancelled case | Saved-request case, cancelled |
| F7 | Carried-forward jobs count as a full repeat | `fullRepeatJobs` is not consulted | Partial case | Saved-request case, partial proof |
| F8 | A refusal is saved as accepted | A refused reply is treated as accepted in `collectCiFollowUps` | Refused case | Refused journey |
| F9 | A later passing repeat clears an uncertain acceptance | Drop the `submission.kind !== "accepted"` return after measurement | Uncertain case | Uncertain journey |
| F10 | A repeat with no verdict reads as failed | The absent-conclusion branch never matches and absent counts as failed | Verdict undefined and null, `:33` | Saved-request case, absent and null |
| F11 | An unknown conclusion reads as failed | `failed` is always true | Verdict neutral, skipped and future state, `:33` | Saved-request case, those three |

## Ordered slices

### 1. The execution base is on record
Type: Behavior
Status: planned
Proof: The plan records the base revision and whether these paths differ from
`f9ed9f52b`: both specs, `ciFollowUpScenario.ts`, `ciFollowUpPriors.ts`,
`ciFollowUpProviderVerdict.ts`, `landedCiHistoryTest.ts`, `dashboardTest.ts`,
`preparationPage.ts`, `fakeGitHub.ts`, `ciFollowUpLedgerFacts.mjs`, and
`ciFollowUpCollection.ts`, `ciFollowUpObservation.ts` and
`ciFollowUpAdmission.ts` under `dashboard/server/`. A detached worktree of the
base in a temporary directory outside the workspace, set up with
`setup-native`, stays runnable for slice 5 and is removed after it. On the
base: one proof record of the twelve cases. Where a listed path differs, the
premise rows that run through it are observed again, the fault owners among
them.

Behavior: Main as it is at Take → the probe runs → the base revision, the
twelve case identities with durations, and any reopened premise are recorded.
This is an authorized early probe: a premise that no longer holds revises the
slices that consume it before they start. It also records where
[Decision before Take](#decision-before-take) stands.

### 2. Landed CI history cases start only the servers they ask for
Type: Behavior
Status: planned
Proof: The family command passes three consecutive times. A traced run shows
no `Fixture "dashboard"` step in any family case, and shows one in a case of a
spec that asks for `dashboard`. The consumer selection of
`landedCiHistoryTest.ts` gives every case the result the base gives it in the
same load window; `landed-ci-history-no-proof-recovery.spec.ts:36` is compared
in three alternating two-worker runs of each. F1–F3 each still fail the
lifecycle case. The consumer-trace record gives every located consumer a
disposition.

Behavior: A boundary spec uses the landed CI history fixture and opens no page
→ its case runs → the only dashboard servers started are the ones the case
starts or asks for by name.

- Change `landedCiHistoryTest.ts`, the one owner. A consumer that turns out to
  need the page fixture's `baseURL` keeps it by asking for it there; do not
  move the change into individual specs.

### 3. Provider-decided outcomes are read from saved accepted requests
Type: Behavior
Status: planned
Proof: The automatic-repeat spec passes three consecutive times with four
cases: the lifecycle journey, the refused journey, the uncertain journey and
the saved-request case. F4, F5, F6b and F7 each fail the saved-request case at
an expectation that names the outcome. F2 and F8 still fail the refused
journey, F9 the uncertain journey, and F1–F3 the lifecycle journey. The
consumer selection of `ciFollowUpScenario.ts` gives every case the result the
base gives it, and the node consumers of the ledger facts pass. The
consumer-trace record gives every located consumer a disposition.

Behavior: A machine holds accepted repeat requests for originals of 120 s
against a 100 s average, and the provider has a repeat for each: a full 104 s
pass, a failure, a cancellation, and a pass whose jobs are carried forward → a
production dashboard starts there and collects → the saved requests read
recovered with "CI timing returned to range", unverified naming failed,
unverified naming cancelled, and "Full comparable repeat is unverified". Each
keeps its 120 s first attempt as the original and its 100 s average, and the
provider receives no rerun request.

- The saved requests come from `makeMe.aCiRepeatRequest` and
  `makeMe.aCiFollowUpEntry`, with run, seconds, average and the accepted
  submission stated at the call site. Extend `repeatLedgerFacts()` where it
  already states those facts; keep its node consumers passing.
- Provider facts for one original run and its repeat become one unit in its
  own support module, with the raw conclusion that `providerVerdict` supplies.
  `prepareRepeatScenario` states run 71 to it, and the saved-request case
  states its four runs.
- The machine needs no prior builds, published story or receipt. It needs the
  follow-up ledger file, the fake GitHub and a collecting production server.
- One expectation per outcome, in the order the ledger holds the requests. One
  collection pass reads them one after another, so a single 5 s poll over all
  of them would miss under load, and a failure must say which outcome
  regressed.
- The recovered, failed, cancelled and partial variants leave the journey loop
  only after their faults fail the saved-request case. Refused and uncertain
  stay in the loop with their assertions unchanged.
- A saved request that the product's schema refuses makes the ledger
  unreadable and the case fails; the builders are typed by the product's
  `RepeatRequest`. The uncertain journey still reads a product-written request
  through to a measured 104 s repeat, and the lifecycle journey through to
  slow.

### 4. Absent and unknown provider conclusions are read from saved accepted requests
Type: Behavior
Status: planned
Proof: The family command passes three consecutive times with five cases: the
four of slice 3 and one saved-request case in the verdict spec. F10 fails that
case at the absent or null conclusion, and F11 at neutral, skipped and the
unknown value, each by name. The verdict spec holds no poll of
`repeatCalls.length`. The consumer selection of `ciFollowUpScenario.ts` gives
every case the result the base gives it.

Behavior: A machine holds accepted repeat requests whose 106 s repeats
completed with a conclusion that is absent, null, neutral, skipped, or a value
the dashboard does not know → a production dashboard starts there and collects
→ the absent and null ones read "has no provider verdict" and the others "CI
reported" their value; each is unverified and none says failed. When the
provider then gives the absent and the null one a success conclusion, each
reads slow with its 106 s repeat. The provider receives no rerun request.

- The verdict spec keeps its file and its purpose, raw conclusion fields as
  the provider sends them. It reuses slice 3's saved requests and provider
  unit and adds only the conclusions.
- The five journey cases leave only after F10 and F11 fail the saved-request
  case.

### 5. The saving and the fit under load are measured and kept
Type: Behavior
Status: planned
Proof: Alternating base and candidate runs of the one-worker family command
under the same load, three passing observations each, with proof records. The
candidate's median whole-command wall time is at most 75% of the base's. At
most three cases ingest a receipt. Three consecutive two-worker candidate runs
at a one-minute load of 20–30 pass with every case inside the default 30 s; a
run whose load before or after falls outside that range is recorded and not
counted. The diff adds no `test.setTimeout`, expectation timeout, sleep,
retry, skip, mock or runner mode, and the spec paths are unchanged. Hosted CI
passes on the published revision.

Behavior: The base worktree and the finished candidate run under like
conditions → the comparison is recorded in this plan → the declared saving and
the fit under load are observed with every preparation and teardown paid.

A base that cannot give three passing observations in the load window is
recorded with its failures, and the comparison then uses the base runs that
passed, however many runs that takes. A miss is not rounded up. Record the
observations and stop for the coordinator's decision on keeping the smaller
gain or continuing. A candidate case that exceeds 30 s or misses a 5 s
observation in the load profile is a failing test under the policy above,
repaired before this slice is done.

## Current decisions

- Three journeys remain because the provider can reply to the rerun request in
  three ways, and only the real request shows how each reply is handled.
- The saved-request cases live in the family's two specs, so the measured
  command and the ordinary CI selection keep their paths.
- A saved-request case reads the saved request, not a card: a card needs the
  published completion that the case leaves out. Cards stay observed by the
  three journeys.
- The three journeys keep every assertion they have, including the off switch
  and both request counts. Their "no second request" count follows later reads
  today; removing steps around it would need a causal signal for a later
  collection pass first.
- Main does not tell a cancelled repeat from a failed one (F6a). A
  saved-request expectation may read the whole explanation; the story promises
  no more than main detects.
- F1 fails by timeout on main and still does. Naming it would change the
  lifecycle journey's wait, which this plan leaves as it is.
- The fixture change belongs to `landedCiHistoryTest.ts`. Its other consumers
  get faster as a side effect and are promised nothing.
- Story Branch Mode. No slice acts from trunk.
- Fault controls are scratch product edits in the execution workspace,
  reverted before any commit. Product code does not change.

## Plan concern assessment

Slice-plan refinement was not needed: five slices share one rule, each has one
proof loop, and the premise rows that can move before Take are bounded by the
early probe in slice 1. This review found no remaining slice-specific concern
inside the story's two specs. One human-owned decision is pending and is
recorded as the readiness reason:
[Decision before Take](#decision-before-take).

## Execution notes

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior gate.
- Shared `makeMe` arranges domain data. No sleeps, `test.slow()`, or suite,
  file, group or hook timeout overrides.
- Timed runs are relative. During preparation the same seven unchanged cases
  took between 83 and 205 s as other work moved the load between 13 and 34.
  Alternate base and candidate and record loads rather than waiting for an
  idle machine.
- Direct Playwright runs from an agent shell need
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
