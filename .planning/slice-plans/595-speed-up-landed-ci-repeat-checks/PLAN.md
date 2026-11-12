# Speed up landed CI repeat checks

**Identity:** SEED-314#speed-up-landed-ci-repeat-checks
**Source:** [Story](../../seeds/SEED-314-landed-ci-repeat-checks.md#speed-up-landed-ci-repeat-checks)
**Source review:** [source-review.md](source-review.md)

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

## Admission misses owned by SEED-287

Terry routed the admission spec's 5 s observations, which miss under load on
main, to
[SEED-287](../../seeds/SEED-287-dashboard-journeys-within-default-timeout.md#fit-dashboard-journeys-in-default-timeout)
on 2026-11-11. Its scope names the cases. That story was Taken and in
execution on `codex/make-dashboard-journeys-fit-the-default-timeout` that day.

Evidence: in the two two-worker runs of unchanged main at load 19–23,
`landed-ci-repeat-admission.spec.ts:82` failed twice and `:11` once, each a
5 s poll for a collected history or card after the receipt. A scratch run
with slice 2's fixture change also failed `:58`, and once
`landed-ci-history-no-proof-recovery.spec.ts:36` at its 5 s history poll.

The consumer selections in slices 2–4 are the proof that this story's changes
keep those specs behaving as on the base. A failure there that the base does
not show is this story's. One the base shows too is the defect SEED-287 owns,
and the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies to it as written: reproducing it on the base is attribution, not an
exemption. While SEED-287's execution owns that exact repair, preserve its
files, write no duplicate repair, and report that owner and the remaining
gate as the coordination boundary. With no such active owner, the repair is
the executing agent's.

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
only with `collectingLandedCi` in its environment, which one consumer that
leaves `dashboard` alone set on the base:
`landed-ci-scope-pending-order.spec.ts`.

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
| The other repeat specs and browser journeys keep passing as they do | 2: the 27-file consumer selection. 3–4: the specs that import `ciFollowUpScenario.ts`. Each compared with the base under [Admission misses owned by SEED-287](#admission-misses-owned-by-seed-287) |

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

## Execution base

Recorded by slice 1 on 2026-11-11.

Base revision: `629548d2c371b102df54f0d582f8903d2fc49107`, main before the
Take. The Take commit `e151b007e` adds only `.planning/PRODUCT-BACKLOG.md` and
`.planning/agents/ivan-chan.json` to it. `f9ed9f52b` is an ancestor of the
base, 24 commits behind.

Base worktree: `/Users/terryyin/.claude/jobs/7b8897aa/tmp/base-595`, detached
at the base, with `node scripts/setup-native.mjs npm`, `browser` and `check`
each exiting 0 on Node 24.21.0. It stays for slice 5.

Listed paths, `git diff f9ed9f52b 629548d2c -- <path>`:

| Path | Versus `f9ed9f52b` |
| --- | --- |
| `dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts` | same |
| `dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts` | same |
| `dashboard/tests/support/ciFollowUpScenario.ts` | same |
| `dashboard/tests/support/ciFollowUpPriors.ts` | same |
| `dashboard/tests/support/ciFollowUpProviderVerdict.ts` | same |
| `dashboard/tests/support/landedCiHistoryTest.ts` | same |
| `dashboard/tests/dashboardTest.ts` | same |
| `dashboard/tests/support/preparationPage.ts` | same |
| `dashboard/tests/support/fakeGitHub.ts` | same |
| `tests/support/ciFollowUpLedgerFacts.mjs` | same |
| `dashboard/server/ciFollowUpCollection.ts` | same |
| `dashboard/server/ciFollowUpObservation.ts` | same |
| `dashboard/server/ciFollowUpAdmission.ts` | same |

Reopened premises: none. Every listed path is the same, so the rows of
[Decisive premises](#decisive-premises) stand as settled, the fault owners
among them, and were not repeated.

Proof record on the base, one worker, under `caffeinate -s -i` on AC power
with Homebrew Bash first on `PATH`:

`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/Users/terryyin/.claude/jobs/7b8897aa/tmp/slice1/base-run1.proof.json npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1`

Exit 0: 12 selected, 12 passed, twelve attempts with `durationMs`, no retry.
Wall time 215 s; the record's own run duration is 211.9 s and the twelve
cases sum to 200.2 s. One-minute load 39.88 → 33.66.

| Case | Title | `durationMs` | Status |
| --- | --- | ---: | --- |
| `landed-ci-automatic-repeat.spec.ts:14` | new Done receipt at exactly105 seconds gets one full POST after sufficient prior collection, then106 seconds shows possible slowdown | 24848 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat recovered retains the original and its particular honest outcome | 17460 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat failed retains the original and its particular honest outcome | 21484 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat cancelled retains the original and its particular honest outcome | 18500 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat partial retains the original and its particular honest outcome | 15950 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat refused retains the original and its particular honest outcome | 12244 | passed |
| `landed-ci-automatic-repeat.spec.ts:102` | collected repeat uncertain retains the original and its particular honest outcome | 15713 | passed |
| `landed-ci-repeat-verdict.spec.ts:17` | completed repeat verdict undefined is never invented as a failure or success | 17793 | passed |
| `landed-ci-repeat-verdict.spec.ts:17` | completed repeat verdict null is never invented as a failure or success | 16269 | passed |
| `landed-ci-repeat-verdict.spec.ts:17` | completed repeat verdict neutral is never invented as a failure or success | 13724 | passed |
| `landed-ci-repeat-verdict.spec.ts:17` | completed repeat verdict skipped is never invented as a failure or success | 13976 | passed |
| `landed-ci-repeat-verdict.spec.ts:17` | completed repeat verdict provider-future-state is never invented as a failure or success | 12233 | passed |

SEED-287's repair of the
[admission misses](#admission-misses-owned-by-seed-287): the base is without
it. `landed-ci-repeat-admission.spec.ts` and
`landed-ci-history-no-proof-recovery.spec.ts` are the same on the base as at
`f9ed9f52b`; the cases at `:11`, `:58`, `:82` and `:36` keep their 5 s polls
after the receipt. The story is Taken, and its branch
`codex/make-dashboard-journeys-fit-the-default-timeout` is unmerged on origin
at `9739dd6eb`, 30 commits beside the base from merge base `b57936969`, with
no landed CI spec among its committed changes. Its execution worktree is
active: a merge of main `467ab91fe` is in progress there, with uncommitted
edits that add `await scenario.collectPriors(server)` before the receipt in
four admission cases, a `collectPriors` member in `ciFollowUpScenario.ts`, and
`{ runs, untilCollected }` as the return of `prepareRepeatPriors` in
`ciFollowUpPriors.ts`. SEED-287's execution therefore owns that exact repair,
and its edits meet slice 3 in `ciFollowUpScenario.ts`.

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
  [Admission misses owned by SEED-287](#admission-misses-owned-by-seed-287).
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
Status: done
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
slices that consume it before they start. It also records whether the base
holds SEED-287's repair of the
[admission misses](#admission-misses-owned-by-seed-287).

### 2. Landed CI history cases start only the servers they ask for
Type: Behavior
Status: done
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

Accepted proof, 2026-11-12, candidate `c39dbd98` plus the `baseURL` fixture in
`landedCiHistoryTest.ts`; records and logs under
`/Users/terryyin/.claude/jobs/7b8897aa/tmp/slice2/`:

- Family, one worker, three consecutive passes of 12 at load 17.7 → 20.1,
  20.1 → 12.3 and 12.3 → 22.6: 146, 102 and 153 s
  (`cand-family-gate-{1,2,3}`). Six earlier candidate runs and three base runs
  at load 26–62 each missed the verdict spec's 5 s count poll at `:26`, and
  above load 35 some automatic-repeat cases passed 30 s on both sides.
- Traces: no `Fixture "dashboard"` step in any of the twelve family cases
  (`cand-family-traced.fixtures.txt`); one in
  `landed-ci-scope-proof-adapter-recovery.spec.ts:24`, which asks for
  `dashboard` (`cand-asker-traced.fixtures.txt`). On the base all five verdict
  cases hold the step, at 0.86–1.93 s each.
- Consumers, the 27 specs and 59 cases at two workers: 59 passed on the
  candidate at load 14.8 → 20.2 (`reach-consumers-w2`). In one window at load
  33–39 the candidate passed 48 and the base 35; at one worker on the six
  files with a candidate failure the candidate passed 12 of 22 and the base 5.
  Every case that failed on the candidate also failed on the base in that
  window or in the one-worker rerun, at a 5 s poll or the 30 s case bound
  (`consumers-w2.compare.txt`, `failed6-w1.compare.txt`).
- `landed-ci-history-no-proof-recovery.spec.ts`, three alternating two-worker
  runs at load 39.0 → 34.3: base passed three and candidate three. The base
  failed `:36` at `:163` once inside the 27-file run.
- F1 fails the lifecycle case by the 30 s bound with no rerun request for
  24 s after the receipt; F2 fails it at `:83` with `[71, 71]`, twice; F3 at
  `:70` with "CI timing returned to range". Each at load 21–27.
- The fixture's other effect: a case that leaves `dashboard` alone is also
  without that fixture's `serveOriginBaseCi` answerer. In the 59 cases no call
  reaches the `github` fixture's every-repository answerer or the scenario's
  last-resort answer; a control spec shows the observation reports both
  (`reach-control`). `prepareRepeatScenario`'s `fallback` is the trunk-runs
  answerer from `serveTrunkRuns` on base and candidate.
- `landed-ci-scope-pending-order.spec.ts` set `extraEnv: collectingLandedCi`
  and leaves `dashboard` alone, so on the base its page-fixture server also
  collected on that machine. The case observes only the server it starts and
  passed on both. The refactor pass removed the option, which nothing reads
  there now; the case passes alone at load 20.8 → 19.7 with no
  `Fixture "dashboard"` step (`refactor-pending-order`).

Learnings for the remaining slices:

- A single-case fault control attributes on this machine at a one-minute load
  of about 27 or less. Above 40 the lifecycle case reaches the 30 s bound
  before the faulted expectation, and F2 passed once. Run fault controls in
  such a window, and for F2 read the refused journey too.
- Base failures at load 33–39, two workers, outside this family: the
  follow-up reading, reconciliation, receipt boundary, history pending proof,
  pending sources and comparison run specs, each at a 5 s poll or the 30 s
  bound, and `intent-ci-comparison-pending-proof.spec.ts:31`. All 59 cases
  pass on the candidate at load 15–20. SEED-287's scope covers 5 s history
  observations and their siblings at load 20–30, and SEED-286 owns the Intent
  CI comparison family; the consumer comparisons of slices 3–4 run in the
  20–30 profile.

### 3. Provider-decided outcomes are read from saved accepted requests
Type: Behavior
Status: done
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
- SEED-287's uncommitted repair edits the prior-build lines of
  `prepareRepeatScenario`, adds a `collectPriors` member to its return, and
  changes the return of `prepareRepeatPriors` (see
  [Execution base](#execution-base)). Keep this slice's edit of
  `ciFollowUpScenario.ts` to the provider answerer and leave those lines and
  `ciFollowUpPriors.ts` as they are, so the two changes merge.
- A saved request that the product's schema refuses makes the ledger
  unreadable and the case fails; the builders are typed by the product's
  `RepeatRequest`. The uncertain journey still reads a product-written request
  through to a measured 104 s repeat, and the lifecycle journey through to
  slow.

Accepted proof, 2026-11-12, candidate `ad78d864` plus this slice's change;
records and logs under `/Users/terryyin/.claude/jobs/7b8897aa/tmp/slice3/`:

- The automatic-repeat spec holds four cases; three ingest a receipt. One
  worker, three consecutive passes of 4 at load 23.3 → 17.3, 14.6 → 17.4 and
  17.4 → 18.2: 36, 39 and 41 s (`cand-auto-final`, `-2`, `-3`), and three more
  at load 30–42 in 57–62 s. Lifecycle 13.7–14.6 s, refused 7.4–10.8 s,
  uncertain 8.0–11.2 s, saved requests 1.9–2.3 s. The family passed 9 of 9 in
  117 s at load 28.7 → 24.8.
- The lifecycle journey is unchanged apart from imports. The refused and
  uncertain journeys keep every assertion; the card's expected kind is the
  literal `"unverified"` both share.
- Premise remainders: requests arranged through MakeMe reach their outcomes,
  and four on one machine are each observed, with no prior build, story or
  receipt there. A request the schema refuses (`rule.percent: 6`) leaves the
  case failing at its first expectation.
- Fault controls against the saved-request case, before the variants left the
  loop: F4 fails "recovered", F5 "failed", F6b "cancelled", F7 "partial
  proof", each reading slow; F6a passes. On the journeys: F8 fails refused at
  `:129`, F9 uncertain at `:129`, F2 refused at `:142` and lifecycle at `:90`
  with `[71, 71]`, F3 lifecycle at `:77`, F1 lifecycle by the 30 s bound with
  no rerun request. F2 on the lifecycle journey passed twice and reached the
  bound once in four further runs at load 29–43; the refused journey carries
  it.
- Consumers, the eight specs that import `ciFollowUpScenario.ts`, two
  workers: candidate 24 of 24 at load 20.9 → 20.3, base 27 of 27 at
  32.4 → 22.5. At load 24–35 the reconciliation spec's 5 s count polls
  (`:26`, `:57`, `:92`) and `dashboard/tests/intent/intent-ci-follow-up.spec.ts:19`
  at the 30 s bound failed on candidate and base alike in a paired window, and
  both passed 5 of 5 at one worker.
- `bash scripts/test.sh` on the ledger, reading and policy node tests exits 0;
  `typecheck:dashboard` is clean.
- The refactor pass put each saved request's run, provider fact and expected
  outcome in one `repeats` table (the case is at `:150-220`), keyed the saved
  ledger with the product's `followUpKey`, and left one `json` answer helper.
  After it the family passed 9 of 9 in 104 s at load 18.5 → 33.1, and F4, F5,
  F6b and F7 failed the saved-request case by name again at load 25–31.
- SEED-287 committed its repair as `730543328` on its branch; `git merge-file`
  of this slice's `ciFollowUpScenario.ts` against it reports no conflict.

Learnings for the remaining slices:

- Slice 4 states its requests with `saveRepeatRequests`, sets each run's
  provider facts with `provider(run).setRepeat` and
  `provider(run).providerVerdict`, and reads with `savedRepeatRequest`. A
  saved accepted request starts with the explanation "accepted", so an
  expectation waits for collection. A later pass observing an unsettled saved
  request again (absent or null, then success) is slice 4's to show.
- Compare consumers in paired candidate and base runs; a two-worker run with
  the browser journeys ends about ten load points above its start.
- Trunk queued SEED-319 on 2026-11-12 for the reconciliation, follow-up
  reading, receipt boundary and comparison-run observations under load, to
  start after SEED-287 lands. `intent-ci-follow-up.spec.ts:19` takes 22–23 s
  at load 20–25 on base and candidate and is named by neither story.

### 4. Absent and unknown provider conclusions are read from saved accepted requests
Type: Behavior
Status: done
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

Accepted proof, 2026-11-12, candidate `9ee2e451` plus this slice's change;
records and logs under `/Users/terryyin/.claude/jobs/7b8897aa/tmp/slice4/`:

- The verdict spec holds one case, "saved accepted requests never invent a
  failure or a success from an absent or unknown completed repeat verdict",
  with no `repeatCalls` in the file. The family holds five cases; three
  ingest a receipt.
- Family, one worker, three consecutive passes of 5 at load 14.5 → 31.9,
  31.9 → 34.2 and 34.2 → 26.6: 55, 56 and 54 s (`cand-family-gate-{4,5,6}`).
  Ten earlier runs at load 26–48 passed 2: the lifecycle journey reached the
  30 s bound in seven, and the refused or uncertain journey missed `:129` or
  the bound in four. The verdict case passed in every run. The three journeys
  took 17–29 s at load 30–48 and 8–15 s at load 15–23.
- A later collection pass observes an unsettled saved request again: the
  absent and the null one read "has no provider verdict", then slow with a
  106 s repeat once the provider reports success, 2.0–3.0 s after the change
  at load 30–35.
- Fault controls against the verdict case, with the journey cases still in
  the file: F10 fails "conclusion absent" reading "The observed repeat failed
  (undefined)", and narrowed to null it fails "conclusion null"; F11 fails
  "conclusion neutral", and narrowed it fails "conclusion skipped" and
  "conclusion provider-future-state"; F3 fails "conclusion absent, then
  success", and narrowed "conclusion null, then success". F10 and F3 failed
  it again after the refactor pass.
- The refactor pass gave both saved-request cases `savedRepeatComparison` for
  the original and average and `rerunRequests` for the count; a scratch
  `originalMs: 121000` fails the comparison. `prepareRepeatScenario` is
  without its `providerVerdict` member, which no spec used; `git merge-file`
  against SEED-287's `730543328` still reports no conflict.
  `typecheck:dashboard` is clean.
- Consumers, the eight specs that import `ciFollowUpScenario.ts`, two
  workers. No window at load 20–30 held for a pair: at load 26.6 → 40.4 the
  candidate passed 9 of 20, and at 40.4 → 44.8 the base passed 13 of 27, each
  failing 5 s observations after the receipt in the follow-up reading,
  admission, receipt boundary and reconciliation specs and the 30 s bound in
  `intent-ci-follow-up.spec.ts:19`. The base also failed four automatic-repeat
  and three verdict cases. The candidate alone failed
  `dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts:14` at its
  5 s poll of the rerun count (`:44`), the same wait the base verdict cases
  miss; it passed on the candidate at load 20.9 → 20.3 in slice 3. Slice 5's
  load window repeats this pair.

A removed journey case read the card for an absent or unknown conclusion. The
saved-request case reads the saved request, as
[Current decisions](#current-decisions) records; cards stay with the three
journeys.

### 5. The saving and the fit under load are measured and kept
Type: Behavior
Status: done
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

#### Measured comparison, 2026-11-12

Base `629548d2c` in `/Users/terryyin/.claude/jobs/7b8897aa/tmp/base-595`;
candidate `165d803c`, clean. Records, logs and proof records under
`/Users/terryyin/.claude/jobs/7b8897aa/tmp/slice5/`, one command at a time,
10:28–11:22, while other sessions' suites held the one-minute load at 33–74.

One worker, each side from its own root, base then candidate back to back
(`pair.sh <n>`):

`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<label>.proof.json npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts --workers=1`

| Side | Label | Load before → after | Wall s | Passed | Failures |
| --- | --- | --- | ---: | --- | --- |
| base | `base-w1-1` | 42.3 → 33.0 | 233 | 10 of 12 | verdict `:26` twice |
| candidate | `cand-w1-1` | 33.0 → 37.5 | 92 | 5 of 5 | |
| base | `base-w1-2` | 43.4 → 46.6 | 219 | 9 of 12 | verdict `:26` three times |
| candidate | `cand-w1-2` | 46.6 → 43.8 | 84 | 5 of 5 | |
| base | `base-w1-3` | 43.8 → 34.3 | 307 | 5 of 12 | verdict `:26` five times; lifecycle at the 30 s bound (`:90`); recovered and refused `:131` |
| candidate | `cand-w1-3` | 35.7 → 33.3 | 100 | 4 of 5 | lifecycle at the 30 s bound (`:78`) |
| base | `base-w1-4` | 40.6 → 38.5 | 249 | 6 of 12 | verdict `:26` five times; lifecycle at the bound (`:70`) |
| candidate | `cand-w1-4` | 36.6 → 58.0 | 122 | 3 of 5 | lifecycle at the bound (`:70`); refused at the bound (`:145`) |
| base | `base-w1-5` | 58.0 → 46.3 | 308 | 5 of 12 | verdict `:26` five times; lifecycle and failed at the bound; recovered `:131` |
| candidate | `cand-w1-5` | 46.3 → 37.3 | 77 | 5 of 5 | |
| base | `base-w1-6` | 56.8 → 51.1 | 236 | 7 of 12 | verdict `:26` five times |
| candidate | `cand-w1-6` | 55.7 → 49.1 | 126 | 3 of 5 | lifecycle at the bound (`:70`); uncertain at the bound |
| base | `base-w1-7` | 50.0 → 58.1 | 319 | 4 of 12 | verdict `:26` five times; lifecycle, refused (`:146`) and uncertain at the bound; recovered `:131` |
| candidate | `cand-w1-7` | 58.1 → 37.2 | 97 | 4 of 5 | lifecycle at the bound (`:98`) |
| base | `base-w1-8` | 37.2 → 46.5 | 255 | 7 of 12 | verdict `:26` five times |
| candidate | `cand-w1-8` | 46.5 → 74.4 | 142 | 2 of 5 | lifecycle at the bound (`:70`); refused and uncertain `:130` |

Each pair shares a load window to within 10 points at the handover; the load
moved up to 28 points inside a run.

Verdict against the 75% bound: unmet as declared. The candidate gave three
passing observations, 92, 84 and 77 s, median 84 s. The base gave none in
eight runs at load 33–58: every run missed the verdict spec's 5 s count poll
at `:26`, so the declared comparison has no base median. Indications only:
the eight base runs took 219–319 s, median 252 s, and the candidate's eight
77–142 s, median 98.5 s; the candidate took 25–56% of its paired base run in
every pair; the one passing base run on record, slice 1's 215 s at load
39.9 → 33.7, puts the candidate median at 39%. Next condition: base and
candidate pairs at a one-minute load where the base passes, which it did at
12–23 in slice 2 and once at 39.9 → 33.7; or the coordinator's decision on
the comparison.

Receipt-ingesting cases on the candidate: three of five, the lifecycle,
refused and uncertain journeys (`prepareRepeatScenario` and
`scenario.ingest`); the two saved-request cases ingest none. Twelve of twelve
on the base.

Two workers, candidate, the same command with `--workers=2`:

| Label | Method | Load before → after | Wall s | Passed | Slowest case | Counted |
| --- | --- | --- | ---: | --- | --- | --- |
| `cand-w2-1` | natural load | 73.4 → 63.3 | 78 | 2 of 5 | lifecycle 31.4 s, at the bound; refused at the bound; uncertain `:130` | No: load outside 20–30 |

The fit under load is unobserved: no counted run. The load stayed at 33–74
for the whole window, above the profile, and burners only raise it. Next
condition: three consecutive two-worker candidate runs whose load before and
after lies in 20–30.

Candidate case durations over the eight one-worker runs at load 33–74:
lifecycle 21.4–31.1 s, passing in three at 21.4–30.0 s; refused 15.8–31.0 s;
uncertain 20.5–30.8 s; saved requests in the automatic-repeat spec
3.7–9.5 s; saved requests in the verdict spec 4.8–12.2 s. Both saved-request
cases passed in all nine candidate runs.

Where the lifecycle journey's time goes, one traced run alone at load
52.0 → 65.3, passing in 27.8 s (`cand-lifecycle-traced-1.trace.zip`):
first-in-worker origin 5.8 s; prior builds, published story and first server
5.0 s; second server and receipt 1.9 s; receipt to the rerun request 4.3 s;
progress card on the second server 3.0 s; slow card 3.1 s; closing both
servers, restart and card read 3.0 s; teardown 1.4 s. Every part is an
admission, a collection pass the journey waits for, or SEED-287's origin
preparation.

Diff review, `git diff 629548d2c..165d803c -- dashboard tests`: eight files,
two of them new support modules (`ciFollowUpRepeatRun.ts`,
`ciFollowUpSavedRequests.ts`). No added line holds `setTimeout`, `timeout`,
`test.slow`, a sleep, a retry, `skip`, `fixme`, `only`, a mock, or a worker
or mode setting; `test.use({ serverMode: "boundary" })` in the verdict spec
is the base's own line. `git diff --stat 629548d2c..165d803c -- dashboard/server dashboard/src`
is empty. Both family specs are modified in place; no spec is added, renamed
or deleted. No list under `dashboard/longest-first*` names either spec. The
Playwright configuration, `package.json` and the workflows are unchanged, so
the maintained selection holds what it held.

Hosted CI on `165d803c`, run 43141514350: failure. Job `dashboard (9/13)`
failed `landed-ci-repeat-reconciliation.spec.ts:78` at `:147`: the 5 s poll
for `averageMs: 300000` after the case rewrites the kept history read
`100000`. The spec is the same on base and candidate, and slice 4's change to
`ciFollowUpScenario.ts` removes one unused member. Runs on `9ee2e451` and
`ad78d864` succeeded. Diagnosis and repair are open under the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).

Those three gates were open at 11:22 and settled by 11:58, once the load
fell (`gates.sh`, same directory):

Hosted CI repair. Trunk's `ecaf8385e` keeps a test's landed CI history under
the machine write lock, the repair of exactly this lost rewrite. The branch
merged trunk `658d1fef8` as `e68e37496`; on the merged state
`typecheck:dashboard` is clean and the reconciliation, pending-order, kept
history and family specs passed at one worker at load 39.4 → 33.8
(`merged-focused`). Hosted CI on `e68e37496` succeeded.

Fit under load, two workers, the merged candidate `e68e37496`, natural load
and no burners, three consecutive attempts, all counted:

| Label | Load before → after | Wall s | Passed | Slowest case |
| --- | --- | ---: | --- | ---: |
| `w2-gate-1` | 26.4 → 24.4 | 12 | 5 of 5 | 5.9 s |
| `w2-gate-2` | 24.4 → 25.6 | 19 | 5 of 5 | 9.5 s |
| `w2-gate-3` | 25.6 → 25.4 | 23 | 5 of 5 | 14.3 s |

One-worker pairs continued, base `629548d2c` then the pre-merge candidate
`165d803c` in its own worktree (`cand-595`), so both sides keep the base's
dependencies:

| Side | Label | Load before → after | Wall s | Passed | Failures |
| --- | --- | --- | ---: | --- | --- |
| base | `base-w1-g1` | 25.4 → 32.6 | 173 | 9 of 12 | verdict `:26` three times |
| candidate | `cand-w1-g1` | 32.6 → 45.1 | 102 | 4 of 5 | lifecycle at the 30 s bound, 30.5 s |
| base | `base-w1-g2` | 24.8 → 19.2 | 131 | 12 of 12 | |
| candidate | `cand-w1-g2` | 19.2 → 24.3 | 35 | 5 of 5 | |
| base | `base-w1-g3` | 24.3 → 17.4 | 110 | 12 of 12 | |
| candidate | `cand-w1-g3` | 17.4 → 24.0 | 38 | 5 of 5 | |
| base | `base-w1-g4` | 24.0 → 18.4 | 111 | 12 of 12 | |
| candidate | `cand-w1-g4` | 18.4 → 19.2 | 35 | 5 of 5 | |

Verdict against the 75% bound: met. In the three pairs where both sides
passed, at load 17–25, the base took 131, 110 and 111 s, median 111 s, and
the candidate 35, 38 and 35 s, median 35 s: 32% of the base. Over every
passing observation on record the candidate's median is 57.5 s (six runs:
92, 84, 77, 35, 38, 35) against the base's 111 s, 52%.

Outside the profile the three journeys still reach the 30 s bound: at a
one-minute load above about 33 the lifecycle journey did in six of nine
candidate runs here, as it does on the base. Their time is admission,
collection passes the journey waits for, and first-in-worker origin
preparation.

## Execution complete

Product advice: no change to this story's outcome. Two checks that share the
family's scenario miss their bounds under load on base and candidate alike and
are named by no story: `dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts:14`
polls the rerun count for 5 s after the receipt (`:44`), the wait this story
replaced in its own specs with the request's arrival, and
`dashboard/tests/intent/intent-ci-follow-up.spec.ts:19` takes 22–23 s at load
20–25 and reaches the 30 s bound above about 33. Recommend adding both to
SEED-319's scope when it is refined. The three remaining journeys fit the
default 30 s at load 20–30 and still reach it above about 33, where
first-in-worker origin preparation (SEED-287) and the waits for collection
passes hold their time.

## Story obligations

### G1. No case shows a card for an absent or unknown conclusion
Reported: slice 4 — "No remaining case shows a card for an absent or unknown conclusion; cards stay with the three journeys."
Story clause: "Each repeat outcome keeps a check that catches its own regression."
Disposition: no user cost "Each repeat outcome keeps a check that catches its own regression.": the card shows the saved request's outcome, which the verdict case reads where collection saves it and F10, F11 and F3 fail by conclusion; the lifecycle, refused and uncertain journeys still read a card from a saved outcome, and the story's success measure places these outcomes at the saved request because that machine shows no card.

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
inside the story's two specs. The admission spec's misses under load are
SEED-287's by Terry's routing on 2026-11-11:
[Admission misses owned by SEED-287](#admission-misses-owned-by-seed-287).

## Execution record

Story Branch Mode in
`/Users/terryyin/git/open-dough/.worktrees/speed-up-landed-ci-repeat-checks`
on `claude/speed-up-landed-ci-repeat-checks`, publishing to that branch on
`origin`; trunk is `main`. The Take `e151b007e2f3728a8010315f01d94301a7fe38cb`
was accepted on `origin/main` and is the first increment's published base.
Overrun replanning keeps the plan's existing authority.

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
