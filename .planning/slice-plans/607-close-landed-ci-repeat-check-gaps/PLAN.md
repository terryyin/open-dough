# Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps

**Source:** [Close the landed CI repeat checks' coverage gaps and tidy their support](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)

**Source review:** [Independent source commitments](source-review.md)

## Provenance

Execution retrospective of
Make landed CI repeat checks pass under moderately high load
(SEED-324#pass-landed-ci-repeat-checks-under-high-load, plan 599; story and plan
recoverable at `854a1ae30:.planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md`
and `854a1ae30:.planning/slice-plans/599-pass-landed-ci-repeat-checks-under-high-load/PLAN.md`). Manifest:
story-branch commits `095f2bff9..4e3c2235e` on the first parent of
`claude/make-landed-ci-repeat-checks-pass-under-moderate`, including trunk
merges `fb3c669d6` and `937da2b35` (SEED-330's no-setting product) and CI
repair `6753ad5a0`. The comparison base for removed observations is trunk
as merged, `8aa440077`.

The contracts the findings touch, from that story's Scope:

- "Every promise the seven current cases protect keeps an owner among
  maintained checks. The plan holds a coverage map of those promises and one
  deliberate product fault per promise."
- "Kept state stays the product's. … a difference between what the product
  writes and what the builders arrange still fails a check."

Plan 599's coverage rows that this correction reopens, kept here because
wrap-up removes that plan:

| # | Promise | Owner after plan 599 | Gap |
| --- | --- | --- | --- |
| C5 | A repeated acceptance and a second dashboard on the machine send nothing more | The journey keeps the repeated acceptance; the second dashboard is `tests/support/ci-follow-up-ledger.test.mjs` "two independent processes serialize spend", which F12 fails | Finding 3 |
| C7 | An in-progress repeat reads "CI rerun in progress" | Accepted-request case; phone warning case | Finding 2 |
| C18 | The card opens both attempts … on a phone, without sideways scroll | Intent reading case | Finding 1 |
| Kept state | The kept scope proof the refresh cases read is what collection keeps | Nothing | Finding 8 |

## Current findings

Each was rechecked against `4e3c2235e`. None was dropped.

1. **The Intent phone reading no longer checks the whole comparison for
   sideways scroll.** The base case ended with
   `expectNoSidewaysScrollIn(page, comparison)`
   (`git show 8aa440077:dashboard/tests/intent/intent-ci-follow-up.spec.ts`,
   line 153). Now only the original, the repeat and the reference evidence are
   checked, through `expectWholeOnPhone`
   (`dashboard/tests/intent/intent-ci-follow-up.spec.ts:137–139`). That helper
   checks page-level sideways scroll and anything inside each part
   (`dashboard/tests/support/ciFollowUpReadingPage.ts:36–47`). An element of
   the comparison outside those three parts that scrolls sideways inside
   itself, such as the published-landing line or the saved rule, fails no
   check.
2. **A `queued` repeat is no longer shown to read "CI rerun in progress".**
   The base phone journey set `scenario.setRepeat({ status: "queued" })`
   (`8aa440077`, `recently-done-ci-automatic-repeat.spec.ts:49`). Both owners
   now set `in_progress`
   (`dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts:44`,
   `dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts:53`).
   `observeRepeat` reads `["queued", "in_progress", "waiting", "pending",
   "requested"]` as progress (`dashboard/server/ciFollowUpObservation.ts:86`).
   No follow-up check sets any status other than `in_progress`, so dropping
   `queued` from that list passes every check.
3. **No dashboard check shows that collection honors another dashboard's
   spend.** The base lifecycle journey ran `first` and `second` servers
   together (`8aa440077`, `landed-ci-automatic-repeat.spec.ts:28,48`). Now no
   follow-up spec runs two servers at once. The reconciliation spec, the
   admission spec and trunk's SEED-330 adapter specs
   (`landed-ci-adapter-repeat*.spec.ts`) only restart a server one at a time.
   The SEED-330 merge `937da2b35` did not change this. The ledger node test
   owns `spendRepeat`'s guard (F12). Collection spends at
   `dashboard/server/ciFollowUpCollection.ts:90`
   (`if (!(await spendRepeat(…))) continue;`) after a pre-check of the ledger
   read when its pass began (`:54–62`). If collection ignores `spendRepeat`'s
   answer, every check passes: a single server's next pass skips at the
   pre-check, and nothing else writes the ledger between that pre-check and
   the spend.
4. **Rerun requests have two answer-and-count owners, and provider answers
   have two layerings.** `prepareRepeatScenario` answers
   `actions-workflow-rerun` itself, holds it and counts `repeatCalls`
   (`dashboard/tests/support/ciFollowUpScenario.ts:68–77`).
   `providerRepeatRun` answers the same request with `replyToRerun`
   (`dashboard/tests/support/ciFollowUpRepeatRun.ts:84–93`), and
   `rerunRuns(github)` counts from the fake's calls
   (`ciFollowUpSavedRequests.ts:104`). Kept arrangements are layered by
   `scenario.serve()`'s `fallback` and by `serveRepeatRuns(…, "as served
   before")` (`ciFollowUpRepeatRun.ts:174–202`). The journey works only
   because it calls `scenario.serve()` again after `saveRepeatRequests`
   replaced the scenario's answerer (`landed-ci-automatic-repeat.spec.ts:57–60`).
   Consumers of `repeatCalls`: the reconciliation, follow-up reading,
   admission and adapter-repeat specs, and `ciFollowUpAdapterAssertions.ts`.
5. **`landed-ci-automatic-repeat.spec.ts` (240 lines) mixes three stages,
   and the waiting request is declared twice.** The file holds the journey,
   the two eligible-receipt cases and the saved-accepted-requests case.
   `landed-ci-repeat-accepted-request.spec.ts:34–39` declares the run-72
   waiting request again. `aWholePass` is correct only for that request, and
   only a comment says so (`ciFollowUpSavedRequests.ts:108–117`).
6. **`dashboard/tests/support/startOriginPreparation.ts` (248 lines) holds
   three responsibilities.** It holds run-wide prepared origins, the
   installation layer, and the origins one process holds: `privatelyPrepared`,
   `privateDirectories` with their exit cleanup, `keepStartedOrigin` and
   `preparedPrivately` (`:176–220`). The third is plan 599 slice 8's addition
   (`20d63a685`).
7. **Latent: on the shared path, a later revision cannot name the first
   revision as its parent.** `initializeStartOrigin` maps only later
   revisions (`dashboard/tests/support/startOriginInitialization.ts:75–88`,
   plan 599 slice 9, `3e29132d4`). `declaredParents` throws `Unknown parent
   <first> for <revision>` (`tests/support/repository-revision-commit.mjs:45–51`)
   where materialization maps every revision
   (`tests/support/repository-history.mjs:166–178`). No current description
   names the first revision (`base` by default) as a parent.
   `dashboard/tests/fixture-origins.md:9–12` says later revisions go "each on
   the parents it names".
8. **Nothing ties `keptScopeFileProof` to what collection keeps.**
   `keptScopeFileProof` (`dashboard/tests/support/scopeHistoryProofs.ts:73–114`,
   added at `3e29132d4` and `681a187da`) builds the proof
   that the refresh fixture keeps and serves as the run's summary
   (`projectScopeHistoryFixture.ts:76–90`). `scopePriorReferenceHistory.ts:56`
   keeps it too. Collection keeps the produced summary verbatim
   (`landed-ci-scope-proof-completion.spec.ts:54–56`). No check compares the
   two for the same facts. Plan 599's slice 9 refactor note says they were
   "the same", but no maintained check holds that.

## Goal and scope

A maintainer changing automatic CI follow-up or the checks' shared support
gets a failing check for each regression above. Each support responsibility
has one owner.

Included: the cases and support modules named in the findings; one added
expectation in `landed-ci-scope-proof-completion.spec.ts`; one new start
origin case; `dashboard/tests/fixture-origins.md` where it names moved code.

Excluded, with reasons:

- F1 fails by the 30 s case bound rather than at a labelled expectation.
  This was a recorded plan 599 decision ("F1 still fails by the 30 s bound,
  as on main"), and the journey still catches it.
- Product code stays unchanged except the bounded immutable completion/claim-
  history read optimization Terry approved on 2026-11-13. It preserves all
  functional, mutable-ref, error/abort and acceptance behavior. No transport
  redesign is included. Faults remain scratch edits, reverted before commit.
- The scenario facts and expected answers of the admission, reconciliation,
  follow-up reading and adapter-repeat specs stay as they are. The project's
  mandatory failure policy also owns defects discovered in their proof:
  slice 3 repairs cold preparation, pending-start teardown, missing measured
  prerequisites and an unsupported second-read availability assumption, as
  recorded in Execution learning and G1–G5. Those changes preserve the cases'
  intended observations and independent restart/ledger evidence. Slice 4
  changes their rerun-count reader from `scenario.repeatCalls` to
  `rerunRuns(github)`.

## Preserved promises and constraints

- Every SEED-324#pass-landed-ci-repeat-checks-under-high-load promise stays
  delivered. This covers one receipt journey across the named specs, kept
  state through the product's types, waits that name their event, shared
  fixtures keeping their other consumers, and plan 599's coverage rows and
  faults F1–F11 and F14–F24 with their owners.
- The load profile (SEED-324 key example 1): the selection passes on two
  workers at a one-minute load of 30–50, with no case over 25 s. The default
  30 s case timeout and 5 s expectations apply.
- [Test automation](../../../AGENTS.md#test-automation): domain data through
  shared MakeMe; no sleeps, `test.slow()`, retries, skips or timeout
  overrides; wait for an observable event.
- [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  apply as written to every slice, delegation and repair handoff.

## Current decisions

- **Second dashboard (finding 3): use kept state, not a second server in
  the journey.** One collecting server keeps an unspent eligible receipt and
  is held at its first `actions-current-run` read of run 71, after its
  pre-check. Meanwhile the test writes that landing's accepted request into the ledger, through
  the machine-document lock a second dashboard's writer holds. Releasing the
  read must produce no rerun request. This is deterministic and needs one
  server. The reviewer's option of a second `startServer()` beside the
  journey's ingestion would catch a race only when the timing allowed it,
  and the fake provider cannot tell two servers' calls apart
  (`fakeGitHub.ts`, `GhCall` has only `argv` and `request`). Two processes
  serializing spend stay with the ledger node test (F12).
- **One rerun owner (finding 4).** `providerRepeatRun` answers, replies to
  and holds requests of its run. `rerunRuns(github)` is the only count. The
  scenario's own rerun branch and `repeatCalls` go.
- **One layering (finding 4).** Every arrangement that serves the
  repository answers its own facts first. It passes everything else to what
  answered before, and then to the published `main`. `scenario.serve()` and
  `OtherAnswers` go when nothing needs them.
- **Filing by stage (finding 5).** The journey keeps
  `landed-ci-automatic-repeat.spec.ts`. The refused and uncertain cases move
  to a new `landed-ci-repeat-eligible-receipt.spec.ts`, and slice 5's case
  joins them there. The saved-accepted-requests outcome case moves into
  `landed-ci-repeat-verdict.spec.ts`, beside the verdict case of the same
  stage. `ciFollowUpSavedRequests.ts` exports one `waitingRequest`, and
  `aWholePass` reads that request's run instead of a parameter.
- **Kept scope proof (finding 8).** Collection's kept proof is the truth.
  P2 confirms `keptScopeFileProof` matches it, so slice 6 adds the missing
  equality check without changing either representation.
- **Start origins (findings 6 and 7).** The fix seeds the parent map with the
  first revision's name → the project checkout's `HEAD`. A run-wide
  description has exactly one revision (`runWideKeys` matches
  `{ revisions: [first] }`), so `HEAD` is that commit. The origins one
  process holds move to their own module, and `preparedStartOrigin` keeps
  its answers.
- Story Branch Mode. No slice acts from trunk.

## Existing solutions and architectural fit

PFE review at `2a607e93b` keeps the existing owners:

- `ciFollowUpRepeatRun.ts` already answers a run and its rerun request;
  `ciFollowUpSavedRequests.ts` already counts actual provider calls. Slice 4
  removes the scenario's competing answer/count path and keeps one fallback
  composition through `serveRepeatRuns`. Reuse `holding` / `holdingAnswer`
  from `heldGitHubAnswer.ts` for held replies rather than adding another
  general hold mechanism.
- `keepFollowUpEntries` already writes through the machine-document lock.
  Slice 5 uses it for the second writer and holds `actions-current-run` for
  run 71, the observed preparation boundary. The ledger node test remains
  the owner of two-process serialization.
- `scopeHistoryProofs.ts` owns both native summary production and the kept
  proof representation. P2 confirms they agree; slice 6 adds the missing
  comparison without changing the builder.
- `repository-revision-commit.mjs` already resolves declared parents. Slice
  7 supplies its missing first-commit map entry. Slice 8 moves only the
  process-held origins; run-wide preparation and installation retain their
  existing owners. This is a module move, not a new cache lifecycle.

This follows Accepted [ADR 0002, whole-product cohesion and one representation](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus)
and [ADR 0008, project and machine-local state boundaries](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
The existing `.planning/NORTH-STAR.md` direction needs no new topic.
Expected implementation edits are currently below 250 lines: automatic-repeat
spec 240, start-origin preparation 248, repeat-run support 202, scenario 159,
saved requests 130, initialization 94, completion spec 151 and verdict spec 86.
Slices 3 and 8 reorganize the two near-limit files along the identified stages
and origin lifetimes; additions still obey the file-size check.

## Outside-in proof ownership

| Finding | Slice | Observable check and fault |
| --- | --- | --- |
| 1 | 1 | `intent-ci-follow-up.spec.ts` checks the whole comparison; F26 fails it at the comparison's sideways-scroll expectation while the three part checks pass |
| 2 | 2 | The phone warning case reads progress from `queued`; F27 fails it at "progress saved" |
| 5 | 3 | Same case titles and expectations at their new homes; F2, F4, F8, F9 still fail their cases |
| 4 | 4 | Every consumer passes unchanged; the journey calls no `scenario.serve()`; F2, F8 and F14 still fail their owners |
| 3 | 5 | New eligible-receipt case: another writer's spend during preparation → no rerun request; F12 and F25 each fail it at "rerun requests" |
| 8 | 6 | `landed-ci-scope-proof-completion.spec.ts` expects the kept proof to equal `keptScopeFileProof` for the same facts; F28 fails it |
| 7 | 7 | New start-origin case fails with `Unknown parent` on the current tree and passes after the fix |
| 6 | 8 | The start-origin and kept-story consumers pass unchanged; `startOriginPreparation.ts` holds no process-held origin |

Faults, each a scratch edit reverted before any commit (F2, F4, F8, F9, F12,
F14 as plan 599 defines them):

| Fault | Regression | Scratch edit |
| --- | --- | --- |
| F2 | A later pass sends a second request | Drop the `admitted.request !== undefined` guard in `collectCiFollowUps` and in `spendRepeat` |
| F4 | A 104 s repeat stays slow | `slow` always true in `repeatTimingVerdict` (`ciFollowUpVerdict.ts`, called by `observeRepeat`) |
| F8 | A refusal is saved as accepted | A refused reply is treated as accepted in `collectCiFollowUps` |
| F9 | A later passing repeat clears an uncertain acceptance | Drop the `submission.kind !== "accepted"` return after measurement |
| F12 | Two dashboards both spend | Remove `admitted.request !== undefined` from `spendRepeat`'s locked guard, allowing it to save and return true for an already-spent entry |
| F14 | The request is sent before the intent is saved | `spendRepeat` moves after the provider's submit |
| F25 | Collection sends although another writer spent first | `ciFollowUpCollection.ts:90` ignores `spendRepeat`'s answer (calls it, then continues to submit) |
| F26 | A comparison line outside the attempts and evidence scrolls sideways | In `IntentCiFollowUp.tsx`, add `style={{ whiteSpace: "nowrap", overflowX: "auto" }}` to the `<p>` holding "Published Done landing" |
| F27 | A queued repeat is not read as progress | `"queued"` removed from the progress statuses at `ciFollowUpObservation.ts:86` |
| F28 | The kept scope proof drifts from collection | `keptScopeFileProof` omits its file-unit evidence (a test-support scratch edit) |

## Decisive premises

Preparation observed these premises on 2026-11-13 at `2a607e93b` in this
story's owned workspace, on the local AC macOS machine under `caffeinate -s -i`.
All probes used one worker, the default case and expectation bounds, locked
dependencies installed by `npm ci --no-audit --no-fund`, and natural competing
work (other worktrees' dashboard checks and other projects' tests). There were
no burners. Initial load was 43.04; `vm_stat` showed 48,585 free pages.
One worker bounded the extra workload. No probe changes are retained.

| Premise | Consuming slice | Settling observation | State |
| --- | --- | --- | --- |
| P1. Another writer's spend during preparation suppresses collection's request, and F12 and F25 each break that observation | 5 | Scratch eligible-receipt case: arrange the same Story A landing as accepted and retain its ledger entries, reset it to eligible beside run 72, hold the first `actions-current-run` for 71, start the boundary server, await the held read, write the accepted entries through `keepFollowUpEntries`, release, then `aWholePass(github, 72, callsAtRelease)` and `rerunRuns(github)` | Settled: baseline passes (5.0 s), sends `[]`, retains accepted submission. Each fault fails "rerun requests" with `[71]`: F12 at natural load 39.62 → 38.67; F25 at 37.31 → 35.38. This refreshes the earlier F25-only observation at `7bd9f5ccf` |
| P2. The completion spec's kept proof equals `keptScopeFileProof` for the same facts, including the zero-duration file; F28 breaks equality | 6 | Add direct equality between `retainedHistory(home)?.builds["run/63/1"]?.proof` and `keptScopeFileProof({ revision, runId: 63 }, [["folder/a.spec.ts", 300, 30], ["folder/zero.spec.ts", 0, 0], ["root.spec.ts", 200, 20]])` | Settled: baseline passes (7.3 s). The builder already returns the complete `{ kind: "summary", summary }` proof. F28 (default units only `case`) fails that equality with the missing file evidence; natural load 49.96 → 47.00. No builder correction is needed |
| P3. The current 390 px comparison fits, and F26 fails the whole-comparison check while its three part checks pass | 1 | Add `expectNoSidewaysScrollIn(page, comparison)` after the three `expectWholeOnPhone` calls; run unchanged product, then F26 | Settled: baseline passes (11.2 s). F26 passes the three part checks, then fails the new expectation at "scrolls sideways inside" with `["P"]`; natural load 34.39 → 48.25 |
| P4. A queued repeat reads progress on the phone; F27 breaks it | 2 | Change the phone case's `setRepeat` status to `queued`; run unchanged product, then F27 | Settled: baseline passes its progress card and later 106 s warning (12.3 s). F27 fails "progress saved": expected `progress`, received `unverified`; natural load 47.35 → 50.80 |
| P5. A later revision naming the first as parent reproduces `Unknown parent` through shared `startOrigin` | 7 | New scratch parents case uses `makeMe.aRepository.withRevision("base").withRevision("child", { parents: ["base"], files: { "child.txt": "child\n" } }).please()`, then `startOrigin(description)` | Settled: the case fails with `Unknown parent base for child` from `declaredParents` through `initializeStartOrigin`, before its ancestry assertion. This is the defect slice 7 repairs, not a passing remedy claim |

Literal probe commands from the workspace root, in an environment with Homebrew
Bash first on `PATH` and `NO_COLOR`, `FORCE_COLOR`, and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset:

```sh
caffeinate -s -i npm run --silent test:dashboard -- tests/intent/intent-ci-follow-up.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-scope-proof-completion.spec.ts backend-tests/intent/landed-ci-repeat-eligible-receipt.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- backend-tests/intent/landed-ci-scope-proof-completion.spec.ts backend-tests/intent/landed-ci-repeat-eligible-receipt.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- backend-tests/intent/landed-ci-repeat-eligible-receipt.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- tests/intent/intent-ci-follow-up.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- backend-tests/intent/landed-ci-scope-proof-completion.spec.ts --workers=1 --reporter=list
caffeinate -s -i npm run --silent test:dashboard -- tests/intent/intent-ci-follow-up.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-scope-proof-completion.spec.ts backend-tests/launches/start-origin-parents.spec.ts --workers=1 --reporter=list
```

The first command observed P3/P4 passing; its P2 probe initially double-wrapped
the builder's proof. Correcting that scratch expectation gave the second
command's two passes (P1/P2). The third command was run separately under F12
and F25; the next three under F26, F27 and F28 respectively. The last command
reproduced P5; its other cases initially could not build because this new
worktree lacked local dependencies, resolved by `npm ci` before the later runs.
Each fault was applied alone and reverted before the next. The differing
natural load does not invalidate these value/layout discrimination results:
baseline checks reached their promised observations, and each fault failed
at its specific changed value or geometry, without a case timeout. These are
premise observations, not the final two-worker load-profile acceptance run.

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos).
On battery, plug in, or start fully awake with the lid open under
`caffeinate -i` and read the sleep log afterwards. The
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every slice, delegation and repair handoff.

Commands, from the repository root, with Homebrew Bash first on `PATH`.
From an agent shell, prefix direct runs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`:

- **Selection:** `npm run --silent test:dashboard --
  backend-tests/intent/landed-ci-automatic-repeat.spec.ts
  backend-tests/intent/landed-ci-repeat-eligible-receipt.spec.ts
  backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts
  backend-tests/intent/landed-ci-repeat-verdict.spec.ts
  tests/intent/recently-done-ci-automatic-repeat.spec.ts
  tests/intent/intent-ci-follow-up.spec.ts
  tests/intent/intent-ci-follow-up-proof.spec.ts
  tests/intent/intent-ci-follow-up-return.spec.ts
  tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2`.
  The eligible-receipt file exists from slice 3. A changed case or support
  module needs three consecutive passes; record the load before and after.
- **Follow-up support consumers** (slices 3–5): the selection plus
  `backend-tests/intent/landed-ci-adapter-repeat.spec.ts`,
  `landed-ci-adapter-repeat-rejections.spec.ts`,
  `landed-ci-adapter-repeat-comparability.spec.ts`,
  `landed-ci-follow-up-reading.spec.ts`, `landed-ci-repeat-admission.spec.ts`,
  `landed-ci-repeat-reconciliation.spec.ts` and
  `tests/intent/intent-ci-follow-up-custom.spec.ts`, at `--workers=2`.
  The current family also includes native fixture regressions
  `backend-tests/intent/landed-ci-server-lifetime.spec.ts` and
  `backend-tests/intent/landed-ci-collector-lifetime.spec.ts`; the current
  retained selection is 18 files/56 cases, not the earlier 17/55.
- **Consumer trace for support moves:** before accepting slices 3, 4 and 8,
  run the installed `dough-execute-plan/scripts/consumer-trace.mjs` with
  `--checkout <this execution workspace> --base HEAD`, adding the retired
  export names and changed effects as `--term`. Follow helper and fixture
  callers to their observing journeys. Give every consumer a `run`,
  `reused`, or reasoned `excluded` disposition. The named selections are
  the starting proof, not an assertion that no other consumer exists.
  In particular, `pageTest.ts` brings origin preparation to other browser
  journeys: the private-origin module move preserves its contract and
  lifetime, with isolation and demand checks observing that shared boundary.
  Run any consumer whose distinct behavior the move reaches and those
  checks do not cover; do not infer absence from a filtered test run.
- **Ledger node tests:** `bash scripts/test.sh
  tests/support/ci-follow-up-ledger.test.mjs`.
- **Fault controls:** one scratch edit, the named case with `--workers=1
  --reporter=list`; record which case fails and at which expectation, and
  revert before the next. Run them at a one-minute load of about 27 or
  less.
- **Load profile, once after the last slice:** one counted two-worker run of
  the selection through `bash scripts/dashboard-repeat.sh 1 <selection
  specs>`, started only while the natural one-minute load is 30–50. Under
  [load while measuring](../../../tests/local-test-resources.md#load-while-measuring),
  `--load` burners provide diagnostic evidence and cannot stand in for that
  natural-load observation. Every case passes and none takes more
  than 25 s, read from `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file>`; that run
  passes no `--reporter`. A run whose load before or after lies outside
  30–50 is recorded and not counted.
- Typecheck and lint through the ordinary commit hooks. No whole local
  suite is prescribed: use the focused selections and consumer trace above.
  Hosted CI runs the whole suite on each published revision, and its failures stay the
  executor's.

## Ordered slices

### 1. The Intent phone reading checks its whole comparison for sideways scroll
Type: Behavior
Status: done
Proof: `tests/intent/intent-ci-follow-up.spec.ts` passes three consecutive
times at two workers with `expectNoSidewaysScrollIn(page, comparison)` after
the three `expectWholeOnPhone` checks. F26 fails it at "scrolls sideways
inside" on the comparison, and the three part checks pass under F26 (P3).

Behavior: a settled request's comparison is open on a 390 px phone → any
line of the comparison scrolls sideways inside itself → the reading case
fails, as the base case did.

### 2. A queued repeat reads "CI rerun in progress" on a phone
Type: Behavior
Status: done
Proof: `tests/intent/recently-done-ci-automatic-repeat.spec.ts` passes three
consecutive times at two workers with `setRepeat({ status: "queued" })`. F27
fails it at "progress saved" (P4). `landed-ci-repeat-accepted-request.spec.ts`
keeps `in_progress`, so both statuses stay owned, and F16 still fails that
case at "progress read".

Behavior: a kept accepted request whose repeat the provider has queued →
the phone reads Recently done → the card reads "CI rerun in progress" under
the provisional rule.

### 3. The automatic-repeat checks are filed by the stage they start from
Type: Structure
Status: planned
Proof: the selection and the follow-up support consumers pass three
consecutive times at two workers. The case count across the selection is
unchanged. Every moved case keeps its title and expectations (diff review).
F2 fails the refused case with duplicate run-71 requests, F8 the refused case at "saved
reply", F9 the uncertain case, and F4 the saved-requests case at its new
home in the verdict spec.

Correction (finding 5): `landed-ci-automatic-repeat.spec.ts` keeps only the
journey. The refused and uncertain cases move to
`landed-ci-repeat-eligible-receipt.spec.ts`. The saved-accepted-requests
outcome case moves into `landed-ci-repeat-verdict.spec.ts`.
`ciFollowUpSavedRequests.ts` exports `waitingRequest` (run 72, 120 s against
100 s, accepted). `aWholePass(github, after?)` reads that request's run, and
every declaration of the run-72 request uses the export. Each file's header
names the stage its cases start from. No file over 250 lines.

Mandatory proof also owns the discovered defects G1–G6. Terry’s approved
bounded product-history repair belongs to this unfinished slice before its
acceptance: one read-scoped owner reuses repeated immutable completion/claim
history queries, preserving functional results, mutable-ref reads, failure and
abort semantics. It adds a meaningful real-history regression proof plus the
existing published-endpoint/review consumer checks. Compare the focused
refresh/phone request cost and native command counts against retained Trace2
before another expensive family loop; require measured benefit. The full
three-consecutive family selection and final natural-load/25-second profile
remain unchanged. No numeric slice limit exists; the disproved assumption was
that stage moves needed no product correction to retain the existing load
promise. Necessary failure repairs do not start slices 4–8 early.

### 4. One owner answers, holds and counts rerun requests, and arrangements layer one way
Type: Structure
Status: planned
Proof: the selection and the follow-up support consumers pass three
consecutive times at two workers, each case with its base result. The
consumer trace accounts for every former `repeatCalls` reader and fallback
caller; searches find no remaining retired export or call form. The
journey calls no `scenario.serve()`. F2 fails the journey and the refused
case with duplicate run-71 requests, F14 fails the journey at "intent saved before the
request is sent" through the moved hold, and F8 fails the refused case.

Correction (finding 4), enabling slice 5:

- `providerRepeatRun` answers its run's rerun request with its reply status.
  It also holds any named request of its run until released: the rerun for
  the journey, and a preparation read for slice 5. Compose the existing
  held-answer mechanism, keeping the held event and release visible to tests.
- `prepareRepeatScenario` answers through it and drops its own
  `actions-workflow-rerun` branch and `repeatCalls`.
- Every consumer reads `rerunRuns(github)`. This includes the
  reconciliation, follow-up reading, admission and adapter-repeat specs and
  `ciFollowUpAdapterAssertions.ts`.
- One layering function in `ciFollowUpRepeatRun.ts` serves the repository so
  that what answered before stays the fallback.
  `prepareRepeatScenario`, `serveRepeatRuns` and the page landing use it, and
  `scenario.serve()` and `OtherAnswers` go.

### 5. A dashboard sends no rerun request for a landing another dashboard spent during its preparation
Type: Behavior
Status: planned
Proof: a new case in `landed-ci-repeat-eligible-receipt.spec.ts` passes
three consecutive times at two workers. F12 and F25 each fail it at "rerun
requests" with `[71]` for `[]` (P1). The ledger node tests still pass.
Coverage row C5 then has a dashboard owner beside the node test.

Behavior: the machine keeps Story A's unspent eligible receipt (run 71,
120 s against 100 s) beside the waiting request. A collecting dashboard is
held at its first `actions-current-run` preparation read of run 71. The test
writes that landing's accepted request into the ledger, standing in for another dashboard's spend,
and then releases the read. After a whole pass, the provider has received
no rerun request, and the request retains the other writer's original,
frozen reference and accepted submission. Later observation may update its
outcome normally.

### 6. The kept scope proof is what collection keeps
Type: Structure
Status: planned
Proof: `backend-tests/intent/landed-ci-scope-proof-completion.spec.ts`
passes three consecutive times at two workers with an added expectation.
For the same run and files, the kept proof equals `keptScopeFileProof({
revision, runId: 63 }, files)`. Compare the complete proof directly, without
wrapping it again in `{ kind: "summary", summary }`. F28 fails it at that
expectation (P2). The observed builder already agrees; its refresh and
prior-build consumers therefore need no builder-change verification.

Correction (finding 8): the builder the refresh fixture and the prior-build
history keep is tied to the product's own kept form, under the story's
"Kept state stays the product's" contract.

### 7. A later start-origin revision may name the first revision as its parent
Type: Structure
Status: planned
Proof: a new case in a new `backend-tests/launches/start-origin-parents.spec.ts`
starts an origin through `startOrigin` from a `makeMe.aRepository`
description. Its later revision names the first revision as a parent. The
case expects that revision's parent in the origin's `main` to be the first
commit. Preparation reproduced `Unknown parent` on the current tree (P5).
After the fix it passes three consecutive times. `start-origin-isolation.spec.ts`,
`start-origin-demand.spec.ts` and the refresh spec (whose kept summary
comparison story declares parents) pass.

Correction (finding 7): `initializeStartOrigin` maps the first revision's
name to the project checkout's `HEAD` before committing later revisions.
This makes `fixture-origins.md`'s "each on the parents it names" true for
every revision.

### 8. The origins one process holds have their own module
Type: Structure
Status: planned
Proof: `start-origin-isolation.spec.ts`, `start-origin-demand.spec.ts`,
`backend-tests/sessions/completed-story-association-ambiguous.spec.ts`, the
new parents case, and the kept-story consumers
(`landed-ci-repeat-eligible-receipt.spec.ts`,
`landed-ci-repeat-accepted-request.spec.ts`,
`recently-done-ci-automatic-repeat.spec.ts`) pass three consecutive times at
two workers. The consumer trace follows the moved exports through
`keptPublishedStory.ts`, `pageTest.ts`, `startOriginPreparation.ts` and
`startOriginInitialization.ts`, with the dispositions required by Verification.
Then the load-profile run of
[Verification](#verification) is counted.

Correction (finding 6): `privatelyPrepared`, `privateDirectories` and their
exit cleanup, `keepStartedOrigin` and `preparedPrivately` move to a module
named for origins a process holds. `startOriginPreparation.ts` keeps the
run-wide origins and the installation layer. `preparedStartOrigin` keeps its
answers. `keptPublishedStory.ts`, `pageTest.ts` and
`dashboard/tests/fixture-origins.md` name the new home.

## Plan concern assessment

Slice-plan refinement ran on 2026-11-13. All eight boundaries are retained:
1 and 2 each restore one discriminating observation; 3 owns stage filing;
4 establishes one provider-answer path immediately before 5 uses it to
observe a second writer's spend; 6 ties the kept representation to collection;
7 repairs the reproduced ancestry defect; 8 separates origin lifetimes.
Each Structure slice directly owns an evidenced retrospective correction,
with unchanged external behavior owned by its named proof. No numeric
slice target or hard limit is supplied, and no sizing exception is needed.

The refinement replaces the unsupported claim that a filtered scratch-failure
run proves there are no other consumers with effect tracing and explicit
consumer dispositions. It also removes slice 6's now-disproved builder-drift
contingency. The cumulative design keeps one run answerer, one actual-call
count, one fallback composition and one owner per origin lifetime; it adds no
per-scenario production rules or speculative framework.

No remaining slice-specific concern was identified in this review. P1–P5
are settled above. All slices remain planned: the probes are preparation
evidence, not delivered checks or implementation. Execution retains the
required loaded selection and the project's failing/flaky-test policy.

## Execution context

Established story-branch execution, owned workspace
`/Users/terryyin/git/open-dough/.worktrees/close-the-landed-ci-repeat-checks-coverage-gaps`,
branch `codex/close-the-landed-ci-repeat-checks-coverage-gaps`, publisher
`dashboard-territory.local-open-dough`, agent `darren-chan`. Accepted claim
`36df77116cbcf8779eaa7ff6700ab647c39d8fdf` on `origin/main`; the remote
execution branch holds the same claim. Starting revision
`7aeca218b046dc685cab8587662f85d8669b0b19`. Integration/default checkout
is `/Users/terryyin/git/open-dough`; execution never writes its carried changes.
Claim CI is unobserved on trunk. Replanning retains the existing plan’s
planning authority; no new scope or slice limit is introduced.

Checkout setup: locked `npm ci --no-audit --no-fund` succeeded; applicable
command is `npm run --silent typecheck:dashboard`. Check-only commit hook
owns staged lint and dashboard typecheck. Selective formatting is
`npm run --silent format`; no generation or project-summary mutation is
triggered by these test/support edits.

Expensive-proof decision: this local AC macOS host initially has natural load
69–76 and about 3,600 free pages, with other worktrees running browser
checks. Sequence our own work, retain default bounds, and use only bounded
focused proof until lower natural load supports the prescribed two-worker
repetitions. Fault controls require load about 27 or lower; the counted final
load profile requires natural 30–50 before and after. Each implementation
owner rechecks before launching/repeating and returns missing proof without
weakening it. No unrelated host workload is stopped. Long proof uses
`caffeinate -s -i` while on AC as required by
[the maintained sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Observer: GitHub Actions `terryyin/open-dough`, execution branch
`codex/close-the-landed-ci-repeat-checks-coverage-gaps`, verified active selector
`ci.yml` (workflow 351271804, display name CI). Codex coordinator
`darren-seed324`, yielded cell `g264:18`, session `32283`, PID `27121`,
directory `/tmp/dough-ci-501/watch-pye7Ih`; runtime is the exact execution
checkout’s `.agents/skills/dough-execute-plan`. Checkout typecheck succeeded.

### Slice 1 accepted proof

The 390 px settled reading keeps all three part checks and now measures every
descendant of the whole comparison with the existing `expectNoSidewaysScrollIn`.
Setup is `keepSettledRepeat`; the actual rendered comparison comes from
`retainedCiFollowUpReading`. Three consecutive runs of
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run --silent test:dashboard -- tests/intent/intent-ci-follow-up.spec.ts --workers=2 --reporter=list`
selected one case and passed (10.3, 8.1, 11.5 s). Natural load was
60.84 → 41.42, 41.42 → 44.31, and 44.31 → 46.25.

P3’s F26 discrimination is reused: unchanged product, fixture, helper and locked
dependencies between `2a607e93b` and this claim (only unrelated
`intent-project-visit-ci.spec.ts` changed); the added assertion is identical.
P3 observed three part checks pass then the whole comparison fail with `["P"]`
at “scrolls sideways inside.” No fault edit is retained. Consumer trace
`/tmp/seed324-slice1-effect-trace.md` accounts for all six matches: unchanged
product/locator owner, comment-only sibling links and historical records have
no changed runtime boundary. The added local assertion exports no operation.
Root inspected the setup and helper’s browser measurements. Source freshness
was unchanged at trunk `a0490eb7a66a3a337723d087a088812ac7c95ec0`; incoming
guidance/preparation commits change no named sibling product behavior.

Slice 1 independent refactor returned `none — already clean`, no edits or
test reruns. Delivery accepted `1c04004870edef23d1628a70a06e79e83fee2db7`
on the recorded remote execution branch, suffix base
`36df77116cbcf8779eaa7ff6700ab647c39d8fdf`; the existing observer was reused.

### Slice 2 accepted proof

The phone’s kept accepted request now receives `queued`. The unchanged
“progress saved” poll observes collection, the 390 px card reads “CI rerun
in progress,” and its controlled-clock continuation reads the finished
106-second repeat and red textual warning. Three consecutive
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run --silent test:dashboard -- tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=2 --reporter=list`
runs passed one case each in 4.7, 7.4, 11.2 s; natural loads
26.41 → 23.97, 23.97 → 27.97, 27.97 → 42.41.
P4/F27 discrimination is reused with unchanged product/helper/fixture/locked
dependencies since `2a607e93b` and identical queued edit. F16 remains owned
by the unchanged backend accepted-request case (`in_progress`), with its
“progress read” failure and final replay retained in plan 599 at `854a1ae30`.
Root inspected the phone progression and backend owner. The ten-file focused
consumer trace `/tmp/seed324-slice2-effect-trace.md` accounts for the unchanged
status mapper, separate adapter contract, backend owner and record references;
the changed test input exports no runtime effect. Source freshness remains
unchanged at trunk `a0490eb7a66a3a337723d087a088812ac7c95ec0`.

Slice 2 independent refactor: `none — already clean`, no edits/tests. Delivery
accepted `7348487b92dd963babcf946e3dc163ae0f3e2d0a` on the execution branch,
suffix base `1c04004870edef23d1628a70a06e79e83fee2db7`, same observer reused.

CI disposition: run `43334430240` attempt 1 at slice 1 SHA `1c04004870ed`
was cancelled after slice 2’s accepted push to the same execution branch.
The checked-in workflow’s branch concurrency cancels superseded runs.
`ci-github-diagnostic.mjs failure terryyin/open-dough 43334430240 1`
returned a complete inventory, zero failed jobs and no gaps. This is proven
supersession, not a test failure; final CI remains owed at the final accepted
revision through the retained observer.

Slice 3 scratch-site clarification: the current provider observation delegates
its timing decision to `repeatTimingVerdict` in `ciFollowUpVerdict.ts`. F4
therefore sets that decision’s `slow` to true. This is the same regression
(a 104 s repeat stays slow), with no changed fault outcome or product scope.

## Execution learning

F2 evidence clarification: retained plan-599 fault proof observed
`[71, 71, 71]` against the maintained `[71]` assertion (an earlier plan-595
probe observed `[71, 71]`). The promise is that any duplicate fails, not an
exact scheduling-dependent duplicate count. Slice 3 reuses that result with
unchanged run-72 whole-pass facts and exact moved case bodies, mapped in
`/tmp/seed324-slice3-fault-correspondence.md`; it claims no new scratch count.

Slice 3 reassessment: lower load alone is insufficient; the second renewed
family run failed reconciliation at sampled natural load 34.94 and a custom
comparison at the default case bound. The smallest supported response uses
existing owners: await actual prior collection before receipt ingestion;
select worker preparation for unchanged queued boundary/preview inputs;
track pending server starts in the current fixture; and assert related fields
from one actual matching card response while keeping restart and ledger reads
independent. No new event framework, synthetic outcome, timeout, product
behavior, or test exclusion is authorized. The original 54 title multiset
stays unchanged; the real pending-start regression is additional repair proof.
G1–G3 stay open until diagnosis, final code and the renewed required proof
settle them. A failed family run resets its consecutive-pass count.

PFE reassessment of G6: `publishedStoryHistory` owns raw completion/claim
history. `storyCompletionEndpoints` and `completedStoryClaimEvidence`
currently create repeated instances during one recovery. Existing
`landedCiResolution.listingOnce` and `githubRevisionLookup.runListings`
show per-read Promise reuse keyed by fixed revision. They are analogous
lifetime patterns, not the same domain solution to import wholesale. The
smallest candidate is one history-read owner through completion recovery,
reusing repeated immutable ancestry/profile/history queries within that
read. Mutable ref lookup, fetching, current worktree config, error/abort
behavior and later trunk advances must keep their current meaning. No
cross-request cache or transport redesign is selected. Product changes are
limited to the bounded history-read extension Terry subsequently approved.

## Historical scope hold (resolved by approval)

Slice 1 is done/published at `1c04004870edef23d1628a70a06e79e83fee2db7`;
slice 2 is done/published at current HEAD
`7348487b92dd963babcf946e3dc163ae0f3e2d0a`, on the recorded execution
branch. Slice 3 remains planned, with uncommitted stage/fixture repairs and
the new lifetime regression preserved. At that hold no files were staged and no test or
implementation command was running. Slices 4–8 have not started.

Final-code family run (the latest failed run):

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-eligible-receipt.spec.ts backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/intent-ci-follow-up-proof.spec.ts tests/intent/intent-ci-follow-up-return.spec.ts tests/intent/intent-project-scope-timing-refresh.spec.ts backend-tests/intent/landed-ci-adapter-repeat.spec.ts backend-tests/intent/landed-ci-adapter-repeat-rejections.spec.ts backend-tests/intent/landed-ci-adapter-repeat-comparability.spec.ts backend-tests/intent/landed-ci-follow-up-reading.spec.ts backend-tests/intent/landed-ci-repeat-admission.spec.ts backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts tests/intent/intent-ci-follow-up-custom.spec.ts backend-tests/intent/landed-ci-server-lifetime.spec.ts --workers=2 --reporter=list
```

Homebrew Bash is first on PATH. It selected the original 54 titles plus one
new lifetime regression. Latest result: 54 passed, one scope-refresh case
timed out at 30 seconds, 6.5 min total, natural load 30.89 → 38.90.
The failed family resets the consecutive-pass count; three complete passes
remain owed. Artifact directory:
`dashboard/test-results/2026-11-13T00-54-55.232Z-32428`; full log
`/tmp/seed324-slice3-renewed3.log`.

A separate healthy Trace2 observation selected both refresh cases and the
phone case at two workers: 10.5, 13.4 and 6.6 s, load 7.23 → 8.98. It does
not settle G6 or count as the final profile. Its initial comparison still
took 3.57–3.62 s. In an overlapping comparison window, 256 native Git starts
include 187 product completion/claim-history reads and 57 fixture-origin
reads. Repeated pinned ancestry pairs occur up to eight times per checkout.
Fixture-origin mutable `main` reads must keep following the declared move.
Only four duplicate excess pinned/listed fixture reads were found; no
fixture-only correction with enough demonstrated saving is supported.
Grouped `cat-file --batch` argv alone does not establish identical input;
any proposed reuse must include complete semantic inputs and preserve
abort/error behavior. Evidence: `/tmp/seed324-slice3-git-cost-summary.txt`,
`/tmp/seed324-slice3-git-argv-window.txt`, and browser artifacts
`dashboard/test-results/2026-11-13T01-14-10.163Z-72091`.

That hold requested authority to extend the correction to bounded existing
product completion-history read optimization. Terry explicitly approved it;
see the accepted scope decision below. No authority was inferred from silence.
A supported candidate is read-scoped reuse in the existing history owner;
its benefit is unproved. Required bounds, natural-load profile and proof
remain unchanged. The independent source/cost reassessment and implementation
owner both reached this boundary; neither a new readiness alias, direct
Changed-tests entry nor a transport redesign is supported by the evidence.

Consumer/fault evidence is retained in
`/tmp/seed324-slice3-effect-trace.md` (65 dispositions),
`/tmp/seed324-slice3-consumer-trace.md` (572 dispositions), and
`/tmp/seed324-slice3-fault-correspondence.md`. G1–G5 have targeted correction
observations but remain subject to coordinator acceptance and the required
family proof; G6 remains unresolved. No refactor/delivery, execution-complete
record, retrospective or wrap-up has been claimed for slice 3.

The exact Codex observer `/tmp/dough-ci-501/watch-pye7Ih` was stopped for this
human-judgment boundary: terminal status `stopped`, unread events zero,
coverage ended and `pendingCi: unobserved`. PID 27121 is absent (finite `ps`
check exit 1). Keep the stopped note and prior stream cell `g264:18` as history;
resume observation under the host adapter only after the scope decision and
verified stopped-process recovery. Current source freshness is unchanged at
trunk `a9ddb54a786d7d64d2bf63500f93cec1c9c5952d`. The workspace and branch
remain owned and retained; do not repeat startup, Take, or prior publications.

Dashboard launch retained for continuation: project `open-dough`, host
`codex`, reference `44d25d41-157a-43c1-a387-53e8ac0ffe1e`. Reporting command:

```sh
node /Users/terryyin/.open-dough/dashboard/reporting/44d25d41-157a-43c1-a387-53e8ac0ffe1e/dashboard-completion.mjs --origin http://127.0.0.1:4173 --source open-dough --host codex --reference 44d25d41-157a-43c1-a387-53e8ac0ffe1e
```

The first future publication of this launch’s work to trunk must carry
`--landing-context /Users/terryyin/.open-dough/dashboard/reporting/44d25d41-157a-43c1-a387-53e8ac0ffe1e/landing-context.json`
(or the API's `landingContext`). No such publication has occurred in this
execution; later accepted trunk repairs omit that context. Preserve its exact
retained landing retry input if capture fails; never repeat Git to retry
reporting. The historical hold received its unfinished attention receipt. Final closure
after resumed work keeps its normal receipt/reporting obligations.

## Scope decision accepted and execution resumed

Terry answered “OK” to the explicit bounded product history-read optimization
request on 2026-11-13. The canonical seed now records that extension. The
prior held/unfinished report and stopped observer remain historical evidence;
execution resumes at unfinished slice 3 without a second Take, branch or
publication. Read-scoped reuse of repeated immutable history queries is the
selected candidate; its correctness and measured benefit must be proved before
claiming G6 settled. Mutable lookups, later trunk advances and error/abort
semantics remain unchanged. No transport redesign or test relaxation is
introduced. A fresh source-only review is required for this amendment.

Resume readiness: same checkout/branch/HEAD and locked metadata were verified;
`npm run --silent typecheck:dashboard` succeeded. Source freshness is unchanged
at trunk `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec`. The prior stopped observer’s
request/result match the exact checkout, repository and branch. Re-armed Codex
observer: coordinator `darren-seed324`, directory
`/tmp/dough-ci-501/watch-q2Ntam`, PID `51646`, session `16250`, cell `g328:4`.
Its runtime remains this checkout’s installed execution skill. Future delivery
uses this live stream and the retained published base `7348487b92dd963babcf946e3dc163ae0f3e2d0a`.

## Current coordination and prototype proof

The bounded history prototype has real-Git red/green query-reuse proof,
endpoint/Review/raw consumer passes and typecheck, but does not settle G6:
both refresh cases again hit 30 s at observed load 36.84 → 37.76. Native
query work is reduced; provider/acquisition and scheduling intervals remain.
The prototype is uncommitted and unaccepted as a complete slice. Its first
report is `/tmp/seed324-history-repair-report.md`; the ancestry shallow-edge
correction supersedes its retained-negative description in
`/tmp/seed324-history-shallow-follow-up.md`. G7 records that actual regression.
Graph-walk completeness was corrected and its real-Git observations accepted
as described below; no other-owner transport code is changed.

SEED-332#answer-fake-gh-reads-in-process is Taken by `philip-chan` on
`codex/answer-fake-github-reads-without-a-process-per-c`, workspace
`/Users/terryyin/git/open-dough/.worktrees/answer-fake-github-reads-without-a-process-per-c`.
Its opt-in transport increment is published at
`92613de41c977d5c82cfd7ce7093005b0150eb6f`; the ordinary-default rollout and
its named loaded selection remain in progress and uncommitted. This is a
known owner of the remaining transport work, not an exemption for G6.
The Codex task-message service failed with an HTTP transport error on two
bounded attempts, so no handoff was delivered and no notification is promised.

A coordinator-owned, read-only Git event wait observes the supplier’s eventual
published done record on `origin/main`: `/tmp/seed324-supplier-watch.cjs`,
PID 62235, session 45204, yielded cell `g328:27`, 15-minute bound. It reacts
only to relevant local Git ref events, never polls CI or controls the supplier.
It closes its file watchers on publication or expiry. Account for its result
and retire it before a stop; it is separate from the live CI observer.

The wait reached its bounded terminal result without supplier publication:
`SUPPLIER_WAIT_RESULT status:pending`, reason `bounded observable-publication
wait ended`; cell `g328:27` completed and PID 62235 is absent. Its watchers
closed. No supplier completion or automatic-resume notification is inferred.

The product prototype’s current functional proof is preserved separately from
G6: seven real-Git cases plus endpoint rule/acquisition consumers passed in a
12-case selection; the final assertion-only graph budget case passed again;
typecheck passed. Current graph completeness repair and proof layout are in
`/tmp/seed324-history-graph-follow-up.md`, superseding prior cache/negative
and timing descriptions. Formatted previews: recovery149, semantics245,
shared fixture36, history237, endpoints220, claims199 lines. No completed
family or final-load-profile credit is taken. A review/coordination snapshot
of just these six owned prototype paths is
`/tmp/seed324-history-read-prototype.patch`, SHA-256
`1ecedb47776b9e87c3844e9ad4b50245d2f4fdd43533019b1489af2365bcae02`; it is uncommitted and not an accepted G6 fix.

Coordinator accepts the isolated immutable-history functional observations,
not G6 completion: real native facts and query reuse, mutable refs/config,
restored/missing objects, warm/active abort, shallow negative ancestry and
all four graph walks are directly inspected in the two current specs and
production owner. G7/G8 are closed by their discriminating real-Git proofs.
The earlier endpoint/Review/raw consumer observations retain unchanged
functional boundaries; no current runtime-speed or whole-family acceptance
is inferred from them. G1–G6 and the required three full passes remain open.

### Coordination hold, 2026-11-13 03:29 UTC

The final source-freshness result is unchanged at pinned trunk
`9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec`. No accepted sibling change has
been integrated. Philip Chan still owns SEED-332's ordinary-default transport
rollout and its named loaded proof. Its current slice-2 evidence reports 31
passes and two strict timeouts in the first 33-case repetition (origin
preparation and Done default-answer selection); no passing repetition, full
suite, default-rollout publication or final CI is established. Its active
implementation owner is repairing those failures. The evidence was inspected
read-only at the supplier's plan-610 `slice-2-evidence.md`; its files and
processes remain untouched. This is the coordination boundary for the next
supported combined check, not proof that the transport change resolves G6 or
an exemption from this project's [failure policy](../../../AGENTS.md#failing-and-flaky-tests).

Later slices cannot start before slice 3's required proof and delivery. The
slice-3 obligation check correctly refuses G1–G6 and its remaining family/load
commitments. No done mark, commit, push, refactor, execution-complete record,
retrospective or wrap-up is claimed. All owned stage, fixture and approved
history changes remain uncommitted in this checkout at HEAD
`7348487b92dd963babcf946e3dc163ae0f3e2d0a`; the isolated history proof and
six-path patch above remain available. Current `git diff --check` passes.

The current CI stream `/tmp/dough-ci-501/watch-q2Ntam` was stopped through the
Codex adapter. Its matching terminal receipt reports `stopped`, unread 0 and
pending CI `unobserved`; yielded cell `g328:4` completed and PID 51646 is absent.
There are no live owned test/typecheck commands or supplier watches. Retain the
worktree and branch. On resume, reconcile the supplier's accepted publication
without rewriting this published branch, rearm observation only after this
confirmed stop, and continue slice 3 with the required three complete family
passes and unchanged load/deadline gates. Renew only proof affected by that
reconciliation. No further approval is needed for the already approved bounded
history scope.

### Explicit watch continuation, 2026-11-13 03:46 UTC

Terry instructed "you watch it", so this coordinator continues observing the
supplier rather than handing the dependency back. Identity, HEAD and owned
uncommitted paths are unchanged. Freshness remains unchanged at new pinned
trunk `f0dd36f7f59b4deb1b09616edc422c012af3dad5`; the intervening SEED-300
publication is not SEED-332's transport rollout. The supplier's latest record
now reports a human-judgment stop awaiting its own scope decision, not active
repair progress. Its last published increment remains `92613de41`.

The owned read-only event watch is
`/tmp/seed324-supplier-continuation-watch.cjs`, PID 17019, session 15834,
started 03:46:11 UTC. It observes supplier planning-file changes and shared
Git-ref events, with a one-hour liveness-check boundary; the boundary does
not cancel supplier work. Inspect emitted progress/publication and retire
this exact watch when no longer needed. No other execution's files or
processes are controlled. The task-message service remains unavailable.
The CI observer's confirmed stopped state above remains accurate while no
new local proof or publication is started; rearm at dependent continuation.

At 03:54 UTC the watch emitted supplier seed/plan/evidence changes. Read-only
inspection confirms Terry authorized its targeted fixture/Git optimization;
its canonical scope is amended and execution resumed. Its default rollout,
G1/G2 repairs and required local/hosted proof remain unfinished. Supplier
local merge `258e5cfda7284036755718c436644f45c31eb854` preserves its published
increment and incoming SEED-300 history; it has not been published. Continue
watching, retaining both executions' ownership boundaries.

The 04:02 UTC bounded liveness check found fresh amended source-review/plan
bytes at 03:58 and `startOriginPreparation.ts` implementation at 04:01.
The planning-directory watch had missed the later replacement events, so
only this owned watch was retired (PID 17019, exit 143, confirmed absent)
after its output and current progress were accounted for. Replacement watches
the supplier's stable `.planning` parent recursively and keeps an interactive
retirement handle: same script, PID 79745, session 40999, ready at 04:03:09
UTC with a one-hour liveness-check boundary. Its initial trunk is `14a670355`;
the intervening SEED-321 preparation announcement is unrelated. Supplier
publication remains `92613de41`. No supplier files/processes were changed.

At 04:05 UTC supplier execution evidence records its post-trunk native/default
selection passing 65/65; required loaded/default-rollout/full/hosted gates
remain with that execution. Our own CI observation was rearmed after the
confirmed prior stop, bound to this unchanged checkout and execution branch:
coordinator `darren-seed324`, `/tmp/dough-ci-501/watch-woUDNJ`, PID 87861,
session 5822, yielded cell `g375:35`. Managed resume using the retained
accepted `7348487b92dd963babcf946e3dc163ae0f3e2d0a` and suffix base
`1c04004870edef23d1628a70a06e79e83fee2db7` recovered that live owner and
reattached accepted-revision observation. It confirmed `already-published`
with zero pushes; no new candidate or commit was created. Its internal
publication-identity classification was repeated once before inspection of
the owner confirmed its accepted-revision registration contract. This is
observation recovery, not a completion wait or final CI acceptance.

The 04:16 UTC bounded read-only liveness check found supplier full verification
running: wrapper PID 36001 (`/tmp/seed332-repeat-suite.mjs --workers=2`,
output `/private/tmp/seed332-full-corrected.log`) and Playwright PID 36703,
with active workers and fresh artifact directory
`dashboard/test-results/2026-11-13T04-12-30.674Z-36703`. They remain under
the supplier's verification owner; no verdict, stall, or repair is inferred
from elapsed time. Planning evidence was last updated 04:05 and preparation
source 04:01. Continue event observation and bounded progress checks; never
duplicate or terminate this other execution's command.

### Watch recovery after daemon restart, 2026-11-13 04:30 UTC

The supplier full proof `/tmp/seed332-full-corrected/proof-36001.json`
records terminal `runnerStatus: interrupted`, `strictStatus: failed`,
selectedCount 2756, duration 932911 ms, finished 04:28:03 UTC. Both retained
processes 36001/36703 are absent. Earlier in that run its owner recorded G3
for two production-update preparation timeouts. Treat the interrupted run,
its observed defects and unfinished proof separately; do not infer a full
passing verdict or the reason for interruption before the owner accounts for
it. The daemon restart subsequently interrupted this coordinator's tool wait.

Identity/HEAD/owned changes are unchanged. Publication refs still name supplier
`92613de41` and trunk `57e9ddcda`; no supplier landing was missed. The owned
publication watcher PID 79745 ended during the restart and is confirmed
absent, without a retained terminal receipt. Current refs and supplier records
were inspected before replacement. Its replacement uses the same script:
PID 54385, session 9096, ready 04:30:23 UTC, with the same one-hour liveness
boundary. Terry's explicit watch instruction remains in effect.

CI worker 87861 remained alive but its native notification bridge was lost.
Its exact retained request matched root/repo/branch; the host adapter stopped
`watch-woUDNJ`, confirming stopped/unread0/pendingCi unobserved, and PID 87861
is absent. Current live CI identity is coordinator `darren-seed324`, directory
`/tmp/dough-ci-501/watch-rQ7nCv`, PID 48819, session 99208, cell `g2:4`.
Managed resume recovered observation of accepted `7348487b9` with the retained
suffix base and zero pushes. Reuse this current stream for later delivery.
The task-message namespace was removed on restart; no cross-task message or
automatic supplier notification is claimed. Observation continues through
read-only Git/planning events and bounded liveness checks.

At 04:33 UTC supplier records accounted for a deliberate full-run stop after
eight genuine failures: two production-watcher preparation timeouts and six
adapter restart cases. Its G3/G4 and loaded/full/CI proof remain open. G1's
targeted correction passed 4/4 and its after-change diagnostic passed 2/2,
observing 15 fewer Git processes and three fewer repository copies; this is
not its required loaded acceptance. The adapter failures overlap this slice's
existing repair area. [Adapter recovery coordination](adapter-recovery-coordination.md)
exports the six-path existing candidate with provenance and proof limits;
read-only apply-check against the supplier succeeded. Nothing was applied or
sent to that execution, and no recipient acknowledgment is claimed. Retain
the common repair owner and renew proof on an actual combined candidate.

At 04:50 UTC the supplier's new composition receipt acknowledged the exact
offered six-path patch and hash, reviewed it and applied it unstaged only in
its own checkout. Its G4 remains open. The supplier owns the next combined
three-file adapter plus native lifetime proof after its current watcher
diagnostic; gaps return to this same existing repair owner. This resolves the
earlier lack of recipient acknowledgment, without claiming combined proof or
publication. Our checkout/index and isolated product-history prototype remain
unchanged. The linked coordination record retains both sides' receipt paths.

The 04:58 bounded check found fresh supplier watcher-fixture changes and
focused Playwright PID 2331 (three production watcher/deployment specs), plus
the recipient's 04:56 combined adapter/lifetime result: 32/32 passed with
default budgets at quiet load 6.35 to 14.60. Exact proof/limits are retained
in the linked coordination record; no full/load credit is taken. Its new G5
also records three existing named journeys using 60-second overrides whose
earlier 31–49-second passes do not satisfy its promised default budget.

The event filter had missed later planning replacements/coalesced directory
events, which bounded checks caught. Only the owned publication watch PID
54385 was retired through its interactive handle, receipt `retired`, exit0,
confirmed absent. The filter now admits relevant ancestor-directory events
as well as leaf paths. Current publication watch: same script, PID 67739,
session 6378, ready 04:59:01 UTC, one-hour liveness boundary. It still reports
supplier `92613de41` and trunk `57e9ddcda`. Bounded checks remain necessary;
no event-only guarantee is claimed. Current CI stream remains `watch-rQ7nCv`.

Supplier `correction-evidence.md` at 05:12 UTC now accounts for all focused
corrections. Its independent refactor extracted matching-response polling into
`ciFollowUpAdapterAssertions.unverifiedCards`; renewed adapter proof passed
31/31, while unchanged native lifetime proof reuses the initial 32-case result.
The default-budget/native selection passed 4/4 after removing the three 60s
overrides. Gate proof passed 2/2 and watcher/deployment proof 20/20 after actual
marker/hold event repair. These are qualified quiet observations, not CPU-bound
30–50 or full acceptance. The supplier keeps G1–G5, full/repeated/hosted and
remaining consumer obligations open. Our separate history prototype remains
excluded. Await its actual published candidate; do not copy its evolving
refactor into this checkout or reuse pre-refactor observation locations as
current. The exact original shared patch remains frozen for provenance.

At 05:20 UTC the bounded read-only check found a renewed supplier full run:
wrapper PID 51647 (`/tmp/seed332-repeat-suite.mjs --workers=2`), Playwright
PID 52362, active workers, output `/private/tmp/seed332-full-renewed.log`.
Elapsed seven minutes is progress, not a terminal result. The supplier owns
this command and any failures; do not signal it or start a duplicate full run.
Publication remains pending. Own current resources stay publication watch
PID 67739/session 6378 and CI `watch-rQ7nCv`/PID 48819/cell `g2:4`.

At 05:31 UTC its renewed full proof is terminal: phase completed,
runner interrupted/strict failed, selected 2759, duration 740746 ms,
finished 05:25:26; PIDs 51647/52362 are absent. Three reported failures are
`production-watcher-failures.spec.ts:76` (gated working commit),
`production-watcher-updates.spec.ts:33` (unchanged-main repeated checks) and
`production-watcher.spec.ts:54` (Cursor runner activation), all timeouts.
Proof `/tmp/seed332-full-renewed/proof-51647.json` retains interrupted/unrun
work separately. This is no full passing verdict; the supplier owns its
diagnosis and remaining full/load/hosted gates. Continue the explicit watch.

The publication watch reached `bounded-check-due` at 05:59:01 UTC, exit0;
PID 67739 is absent. Freshness fetched pinned trunk `3e44d62a6921fc375ed11205e632630758322d54`
and returned unchanged for this source. Its only new commit since `57e9ddcda`
is compatible source-freshness guidance; no supplier product landing or done
record exists, and supplier branch remains `92613de41`. Current CI PID 48819
is still live. Terry's watch instruction continues across this liveness
boundary. Replacement publication watch is the same script, PID 2284,
session 97479, ready 06:00:12 UTC with another one-hour check boundary.

Supplier correction evidence at 05:59 now accounts for the renewed failures,
a failed intermediate 33-case lifetime family, and subsequent targeted
development/runtime fixture corrections. The final combined watcher proof is
34/34 passed (`/tmp/seed332-watcher-combined-proof.json`); real production
installs/builds/previews and all observations remain. These are quiet focused
observations. Its final independent fixture refactor, full suite, qualifying
load repetitions and final hosted proof remain open. Its load selection is
now 24 files/65 cases including the composed adapters/native lifetime case;
our unpublished stage-moved files and product-history prototype remain here.
No current whole-family/profile credit is taken by this execution.

Trunk event at 06:01 advanced to `d11f1c74a9c0456339d8a67f424a724df76545c1`:
queued SSE/history-transfer/traffic observation work and an Accepted ADR 0008
clarification preferring SSE status, WebSocket terminal I/O and direct domain
mapping. The current immutable-history prototype changes no wire/domain
representation or delivery transport, so this architectural delta introduces
no conflict. SEED-337 concerns smaller session/CI-history transfers and lazy
detail inspection, distinct from completion/claim Git query reuse. No
SEED-332 product publication is in that event. Future dependent work still
requires its own fresh source/sibling settlement on the then-current trunk.

At 06:12 UTC a new supplier full run is active after its final fixture edits:
wrapper PID 52807, Playwright PID 53101, two workers, started about 06:09:29,
output `/private/tmp/seed332-full-after-fixtures.log`. Fresh worker activity
is observed, not a terminal verdict. Supplier documentation/source last
changed 06:03. This run remains under Philip's verification ownership; no
duplicate or signal is authorized. Publication watch remains PID 2284,
session 97479; own CI stream remains `watch-rQ7nCv`. The intervening trunk
`22bb416f1` is only SEED-336 preparation announcement, not the dependency.

At 06:26 the full runner was still active and reported additional adapter
polls (zero rebuild requests or accepted-with-no-later-attempt explanations)
and two scope-evidence failures. The existing fixture repair remains with
its original owner; no competing repair is created. The bounded product
candidate Terry already approved is now explicitly offered for joint proof
in [history-read prototype coordination](history-read-prototype-coordination.md).
Its frozen six-path patch/hash and read-only apply-check were reverified;
current diff check passes. No patch was applied to the other checkout and
no recipient acknowledgment is claimed yet. The offer requires quiescence,
fresh affected proof and independent whole-product refactor; existing failed
load results remain failed. Native task messaging remains unavailable, so
the linked maintained handoff is the coordination surface. Own source/index,
both current watches and publication state otherwise remain unchanged.

At the supplier's 06:49 receiving handoff, its diagnosis isolated a standalone
native collector lifetime hole from the remaining 5s/30s cost failures. Our
freshness result is unchanged at trunk `ab57fc6ae`; named supplier product is
still unlanded. G9 is now returned to slice 3. Full promises were listed into
`/tmp/seed324-collector-lifetime-promises.json` and passed to fresh agent
`/root/collector_lifetime_repair`, editing only this checkout's implicated
fixture/collector owners and native proof. Existing scenario/expected answers,
both explicit collections, pending-server fix, restart and ledger evidence
remain. New/affected backend paths select MakeMe true/pageObjects false;
custom browser consumer selects both. The 226-line scenario may extract its
existing native command into one cohesive owner before exceeding 250 lines.
No unrelated production/transport/staging repair or claim is authorized.

At 14:56 local the host was awake on AC100%, natural load15.56–17.44,
CPU42.78%idle and memory_pressure44%free. Known competing supplier full remains
two workers. A bounded native lifecycle regression/necessary caller proof may
use two workers under the maintained guard after a resource recheck; no full
or repeated 55-case loop is delegated now. The implementation agent owns its
commands through terminal result; coordinator retains records, CI, acceptance,
refactor and delivery. Supplier's separate production-staging scope/proof
decision is pending in its own session; current history permission does not
settle it. The explicit publication watch remains active throughout.

The publication watch reached `bounded-check-due` at 07:00:13 UTC, exit0;
PID 2284 is absent. User watch authority continues. Current replacement is
the same script, PID 64635, session 25291, ready 07:02:19 UTC, one-hour
liveness boundary. Its initial trunk is `ab57fc6ae`, supplier branch still
`92613de41`. Own CI remains live at PID 48819/`watch-rQ7nCv`/cell `g2:4`.

Supplier full proof52807 is now confirmed terminal: selected2763, runner
interrupted/strict failed, finished 06:44:56 UTC, duration2124939ms; PIDs
52807/53101 absent. No stop was sent by this coordinator. Its failed full
does not count as acceptance. The bounded G9 agent was notified that this
specific competing heavy window has ended, retaining its resource recheck,
native proof and no-full-loop limits. Its chosen seam is an origin-fixture-
owned native collection command, registered before use and retired before
HOME cleanup, with late acquisition rejected and caller abort preserved.
No implementation or proof acceptance is claimed yet.

G9's final focused return is now inspected and accepted for that lifetime
obligation only. The native red reproduced an unsettled collector after HOME
removal; a first correction exposed a surviving TERM-ignoring descendant.
Local `spawn(detached:true)` supplies a real collector-owned process group,
unlike `execFile`'s ignored detached option. The origin wrapper retires and
drains it before inherited cleanup and rejects late acquisition. The shared
group helper changes types only; no runtime statement or product source
changes. Its seven final focused cases passed28.4s, including both native
lifetimes, queued/restart, stdin interruption, comparable explicit collection,
default/supplied history and development no-trigger. Typecheck and diff check
passed; no owned process/watch remains from the agent. Source freshness is
unchanged at `075cc1549`; no accepted named-supplier product is present.

The coordinator read the five changed source paths, concrete assertions and
all113 narrow consumer dispositions; full846-row dispositions retain unrelated
coordinator effects separately. Exact proof and limits are in
`/tmp/seed324-collector-lifetime-return.md`. Five-path incremental export
`/tmp/seed324-collector-lifetime.patch`, SHA-256
`bd755e5a56c573dc56913816a51d2354627a639ce3ac2f329e5964edc4827a17`,
uses `/tmp/seed324-collector-lifetime-before/` snapshots so it applies cleanly
to the already-composed supplier fixture without replacing its independent
assertion refactor. The linked adapter coordination record offers it for
receiving proof and required independent refactoring; no recipient application
or acknowledgment is claimed yet. G1–G6, whole-family/profile, refactor and
delivery remain open. The future retained family is now18files/56cases and
its existing command JSON includes the new native collector regression.

At 07:42 UTC bounded supplier inspection found its plan updated at 07:39:
Terry has now authorized production staging performance there, preserving
stock build/preview scripts, locked dependencies, private deployments, all
assertions, default30s and selected published inputs. Its previous human
scope hold is resolved. This is SEED-332's separate authority, not an
additional scope amendment here. Supplier G1–G6/full/load/hosted gates remain
open; accepted branch is still `92613de41`. Continue watching for its resumed
repair/publication and receipt of our separately offered G9/history candidates.

At 07:47 UTC the supplier's receipt acknowledged and applied the exact G9
five-path delta unstaged only in its own checkout, retaining darren-chan
credit and its `unverifiedCards` refactor. Receiving native/caller proof and
independent refactoring remain required there. The separately offered history
prototype is explicitly still uncomposed. Its staged-production PFE now owns
the approved install-cost work; the two scope acquisition failures remain
distinct from the prototype's proven call path.

The completed G9 agent now has a read-only continuation assessing the remaining
adapter progress boundaries, using full exact promises in
`/tmp/seed324-adapter-progress-promises.json`. It may read source/artifacts and
write `/tmp/seed324-adapter-progress-assessment.md`, but no source edits/tests,
other-owner control or new workspace/observer. It must separate semantic
prerequisites from cost and avoid masking the initial automatic trigger with
a manual collection. This advances the existing G1–G6 owner while the
publication watch continues; no new implementation or proof is inferred.

The read-only adapter assessment is complete at
`/tmp/seed324-adapter-progress-assessment.md`. It confirms direct prototype
reach through first-rebuild admission and card recovery, while the current
adapter cost saving is unmeasured. In-place answer rewrites are a source-level
race opportunity after publication, but do not explain the three zero-first-
rebuild failures as a common cause. No new fix or manual collection was
selected. The same agent is preparing a bounded `/tmp` observer/review for
the existing missing-completion/missing-start cases, with native/API/kept-state
snapshots and unchanged automatic trigger/assertions. No tests or source
changes are authorized in that preparation; parent reviews before launch.

The watch reached `bounded-check-due` at 08:02:20 UTC, exit0; PID64635 is
absent. At 08:08 remote `ls-remote` verified supplier remains `92613de41`,
main `92d1d426d`; source freshness returned unchanged for this execution.
The incoming commit is only SEED-341 mission admission. Native CI PID48819
remains live. Current replacement publication watch: PID14046, session95647,
same script, ready08:09:05 UTC, one-hour liveness boundary. Subsequent bounded
checks verify authoritative remote heads as well as local event/file evidence,
because isolated publication can leave an execution's tracking refs stale.
This is Git dependency observation, never AI polling of CI.

The temporary two-case observer is reviewed: only Node builtins, no source/
argv/env/clock/answer changes, no replacement of execFile/promisify, bounded
native stream/file observations, real store snapshots and explicit capture
limits. Syntax and four tiny native validation children passed; no Playwright
was launched by preparation. Observer hash is
`3cf33a1428cf2b714a2ab62c7e1ea31f8cd803eff09bea89ff35a5c016271aad`;
review `/tmp/seed324-adapter-progress-observer-review.md` records propagation,
HTTP/FileHandle/semantic-marker gaps and observation overhead. Parent clarified
that event/log caps silently stop recording and must be treated as gaps.

Before the bounded diagnostic, freshness returned unchanged at trunk
`e06bdfb8c` (SEED-342 planning only), with no accepted named-supplier product;
all nine review source fingerprints match. At16:24 local the AC100% host had
load22.70–23.12, CPU52.71%idle, memory_pressure43%free. Known competing
SEED-334 full e2e PID92688 had two active workers. A single two-case/two-worker
diagnostic is proportionate; no full/family repetition, burns or budget change
is selected. Recheck current load/power before launch; reconsider on resource
or source/ownership change, missing propagation or capture limits. Parent owns
the command to terminal and keeps publication/CI watches independent.

Fresh `/tmp/seed324-adapter-progress-run1/launch-context.json` retains exact
source/observer hashes, starting resources and CLI+prototype+G9 basis. The
selected cases preserve the automatic receipt trigger and both existing
post-close passes. Instrumented results are causal/functional observations,
not an uninstrumented speedup, profile acceptance or a fix for the failed full.

The bounded observer command is terminal0 in parent session63871: both existing
missing-start/completion cases passed12.1/12.3s, runner18.9s, with normal30s/5s
bounds. `/tmp/seed324-adapter-progress-run1/command.log` and native/file/Trace2
artifacts retain this instrumented successful path; no proof-record JSON was
emitted by this direct command. This is not a controlled speedup or full/load
acceptance. Its captured states/native dispatch are under bounded read-only
assessment; no fix or retry is selected from the passing result alone.

The supplier separately composed the offered approved history candidate and G9.
Its receiving receipt and actual proof-41970 were inspected:45/45 strictpassed,
256.060s, terminal0, default30s/two workers/no retries or skips. The three adapter
files, both native lifetimes, seven history and five endpoint/integration cases
are covered. Load7.71→60.85/CPU53–56%idle excludes qualifying profile credit;
maximum25.228s is not our under25s acceptance. Independent receiving refactoring,
full/load/CI remain outstanding. This checkout/index and G1–G6 stay unchanged.
Watch event de4da5c4a is SEED-342's Take only, not the named supplier landing.

Parent inspected completed bounded assessment
`/tmp/seed324-adapter-progress-observation.md` and terminal-check JSON. Automatic
admission follows the first zero poll by740/741ms; changed answers settle260/275ms
after publication. All22actual answer reads are intact. Both explicit completed
passes per case remain, all four collectors exit0/close before origin removal,
and independent first/restart card/ledger checks pass. No capture cap or blob
integrity gap appears. Git native time, parent notification and listener-dispatch
time are separated; these success paths do not diagnose the failed full.
Two runner close records are absent after server-parent exit; finite ps at08:42
found both PIDs absent and all captured homes removed. Exact exit timing remains
unknown; no survivor repair is indicated.24no-PID Git ENOENT attempts have error/
close brackets and are not unclosed children; their fallback meaning is unknown.
Prepared08:27resource sample was load23.69/free36%; last prelaunch16:33local
sample was load20.67/23.42/23.88, AC100%, not an exact launch/post-run profile.
The existing receiving owner has these artifacts through the coordination file;
no manual collection, new wait, timeout change, retry or accepted fix is inferred.

At09:04UTC the bounded authoritative check still names supplier92613de41c and
trunk07407e12b (project findings triage after SEED-342 Take), not a new supplier
publication. The live record now acknowledges local/CI scheduling red/green2,
34real watcher/native passes and independent post-dispatch refactoring. Parent
read `/tmp/seed332-post-dispatch-refactor-return.md`: receiving four-path delta
centralizes isAncestor error policy through optional read operation, forwards
the existing collector environment default, and shares its lifetime observer;
15focused cases plus native/in-memory history parity pass. That is unpublished
receiving evidence; none of its source is copied here, and its4path changes must
be reconciled after accepted publication. Original offered hashes stay retained.
The supplier now selects25files/66cases, then queues its required full through
shared admission with targeted G4/G6 diagnostics. SEED-334's full owner77030
holds admission since08:56UTC and is preserved. Numeric load35.86/CPU47%idle at
17:01local does not establish the required CPU-bound profile. Its G1–G6,
full/threequalified/hosted gates remain open. Both our watches remain live;
the current publication watch's one-hour resource checkpoint remains09:09UTC.

Publication watch14046/session95647 ended normally09:09:08UTC at its one-hour
checkpoint, terminal0; finite ps confirmed it absent. Authoritative remote refs
remain supplier92613de41c/trunk07407e12b. Own branch/HEAD7348487 and CI watcher
48819 are unchanged. The user's watch instruction persists, so the same bounded
helper was renewed once at09:09:36: PID3551/session18594, checkpoint10:09:36UTC.
Its initial main/branch observations match the authoritative refs. No completion
or handoff report was submitted and no other owner's process/source was touched.

Supplier progress at09:23UTC records four failures in its current66-case
proof14041: prior-build-average/states31.187/31.427s, landed Review31.600s and
summary-sort31.343s. Their G7–G9 are returned, no full or next repetition was
launched. The first pair already has exact active SEED-334 plan608 G8 ownership;
preserve that repair rather than duplicating it. Review/sort diagnosis remains
SEED-332-owned under its existing fixture/Git scope. The supplier's G1–G6 and
all acceptance gates also remain open. Its active records have not yet supplied
the complete proof14041 path/count/resource report; no unlisted passing result
is inferred. The09:24remote check still names supplier92613de41c; our watches
continue, with no completion, CI repair transfer or new source change claimed.

After the09:24UTC remote checkpoint, source-freshness check68692 is terminal0/unchanged at pinned
`f258e463b8f310a094e346125595cf456d059897`, base36df771; story and plan both
unchanged. Its result was inspected before the separate named-sibling judgment.
SEED-331 has now actually landed: first-parent integration743adc47f against
d59c87b0d introduces its canonical done record and product. Attribution is the
integrated4ffa3df4 branch, specifically3157545ad (Done comparison/history and
follow-up evidence) and45e6965fa (explicit-endpoint reference dead guards),
not merely the broad branch diff or closure. f258 only records SEED-338's
satisfied prerequisite after that landing.

Confirmed overlap: IntentCiFollowUp now passes medianMs into evidence rows;
PriorBuildReferenceEvidenceList and prior-build page helpers changed. Our
delivered slice1 whole-comparison overflow/tab/evidence assertions inherited
the earlier rendering, so their current-baseline proof needs renewal after
reconciliation. Slice2's queued observation branch in ciFollowUpObservation is
unchanged, but its phone warning and shared family still need current-baseline
observation. IntentCiComparison/Content now move a history chart among reading/
gap/shown states, and the family project-scope refresh source changed. Server
ciFollowUpDecision removes dead guards because an explicit endpoint always
returns a reference; wallTimeReference's type/failed wording changes are also
reached by admission/history. No change to our selected outcome is inferred.

HEAD7348487, published branch and all pending owned files remain preserved.
Slice3 done/commit/push, independent refactoring and expensive gates stay held
until these attributed changes and the still-unpublished SEED-332 dependency
are reconciled, then applicable whole-family/phone/history proof is renewed.
No source conflict or consequential product decision is established by this
overlap; it adds no permission question and does not require a duplicate repair.
The watch continues. Historical slice1/2 evidence remains historical evidence,
not a current merged-baseline pass.

The supplier's09:32UTC detailed report supersedes the earlier partial failure
list. Actual `/tmp/seed332-current-family/proof-14041.json` is inspected:
58passed/2failed/6timedOut of66, terminalfailed,633.847s, no retries/skips or
operator interruption. All backend repeat/adapter/lifetime and source-isolation
cases passed;8UI cases failed (Done selection,3scope-history,2prior-build,
landedReview,summarysort). This is combined functional evidence for the changed
adapter/lifetime boundaries only; it closes neither their full-run observation
nor our3current-family passes or profile. Launchload28.68/runstart29.91 to49.67,
CPU46–52%idle, AC100% and excluded sleep do not waive defects or qualifyCPUbound.

Its fresh read-only current_family_failure_diagnosis owner is examining the UI
failures and possible incoming-POST observer perturbation. That is a hypothesis,
not a cause or product repair. Further repetitions/full remain withheld; its
future full observer omits incoming-body listeners but has notrun. Preserve its
scope and SEED-334's exact prior-build repair; no duplicate diagnosis/repair or
new source change is selected here. Our native/file-only two-case observer had
no HTTP interception and remains separate, differently based passing evidence.
The watch continues while the active owners settle these returned gates.

The subsequent daemon restart interrupted the publication-stream read, not any
test or Git operation. Recovery verified own checkout/branch/HEAD7348487 and
the same pending owned paths/index. Publication watch3551 is absent. Orphaned
CI worker48819 remained under PID1; its exact request root/repo/branch/execution
mode and codexStreamOwner(darren-seed324) claim matched. Installed stop of
watch-rQ7nCv confirmed stopped/coverageended/pendingCiunobserved, recorded0/
delivered0/unread0, then finite ps confirmed48819 absent. No CI success or
terminal finished status is inferred from that stop.

Runtime canonicalization again matches this execution checkout, Node24.21 and
the installed entry; absent ciAdapter selects GitHub. Native diagnostic confirms
active ci.yml/workflow351271804/CI. One replacement standard Codex binding is
live: coordinator darren-seed324, directory `/tmp/dough-ci-501/watch-CD5mVp`,
PID90157, session34386, cell `g5:9`, same repository/execution-branch target.
Use this exact stream for managed registration/delivery. Recover existing
accepted7348487 with retained suffix1c040048 through managed resume; repeat no
Take/commit. The user still requires the watch; no stop/handoff report is sent.

Managed resume1195 is terminal0: existing7348487 accepted/already-published,
pushCount0, retained suffix1c040048, observationrecovered/reused on CD5mVp.
No Git publication, Take or test was repeated. The post-restart authoritative
refs remain supplier92613de41c/trunkf258e463b. Supplier proof14041's58pass/8UI
fail and active read-only diagnosis remain current; no later full/repetition
has been reported. After confirming prior publication/CI PIDs3551/48819 absent,
the publication helper was armed once at09:39:55UTC: PID56918/session57901,
one-hour checkpoint10:39:55UTC. Startup refs match the authoritative check.
Current resources are this publication watch and CI CD5mVp/PID90157/cellg5:9;
old watch identifiers above are historical. Continue the user-authorized watch,
preserving all other owners' files/processes and the named331 reconciliation hold.

The next post-restart authoritative check still names supplier92613de41c and
trunk0280118bc. Intervening38d70c3ca only Takes SEED-331's wording follow-up;
0280118bc retargets SEED-332's deleted prior-average spec to the accepted
intent-scope-glance journey at92574ccd3 and queues SEED-344. No new supplier
runtime publication is present. The receiving working plan now contains that
retarget; historical proof14041 still exercised its old actual selection and
is not a passing replacement-spec observation. Own selected source remains
unchanged; named331/current332 reconciliation and renewed listing/proof still
precede dependent acceptance. Both current watches continue.

The supplier's10:00/10:08UTC continuation is inspected. Its read-only diagnosis
did not establish incoming-POST corruption; file proofs existed before browser
navigation, while the entry-history actual land returned only at30.997s before
its first collection poll. Four replacement consumers generated unused default
proofs (nine native producer calls/1.3–1.7s); this alone did not prove a complete
repair. Supplier reconciled accepted331/pinned028 via unpublished local merge
063cb678ed4044ca05ae71bfae0e838b08351bef, preserving six dirty overlaps and all
73pending paths/indexempty; post-merge typecheck passed. No source was copied here.

Its fresh implementation forwards the existing publisher proof choice and opts
out only at three actual replacement collectors. Native publishing, their own
raw-report CLI and every assertion remain; other callers retain defaults. Actual
`/tmp/seed332-post-331-fixture-proof.json` is inspected:9/9strictpassed80.960s,
default30s/two workers/no retries/skips, covering the8retargeted UI files and
both landed Review cases. Durations10.396–20.819s renew that receiving UI boundary,
not our source or loaded/full proof. Load6.39→20.25/CPU47–76%idle excludes profile
credit; no isolated speedup is claimed. An optional16path unused-head cleanup
was deferred; no new supplier/cache/native producer API redesign is selected.
Independent refactoring is next; all supplierG1–G9/full/threequalified/hosted
gates remain open. Current manifest25files replaces deleted prior-average with
scope-glance; future listing/proof must use that actual selection. Trunkb8a709a17
is SEED-342's references/card work, not the still-unpublished SEED-332 correction.
The publication/CI watch continues under the same current identities.

At10:16/10:21UTC the supplier records incomplete independent options refactor:
eight paths migrate variant/later/proofs positional arguments to one cohesive
options object. Actual current proof is `/tmp/seed332-replaced-proofs-refactor-proof.json`,
9selected/7pass/2timeouts95.817s: filegaps31.801s recurs asG5; relative-drilldown
32.075s addsG10. No retry/full/next repetition follows. Excluded worker readiness
5.5s is not charged preparation; charged hooks2.73/2.98s do not justify a budget
change. Final drilldown settled-wait overlaps real review/file metadata5.240s;
no-reread equality remains unproved. Sleep excluded, load22.03→10.58/CPUidle56–60%,
AC100% gives no profile credit. A type-only optional-undefined correction now
typechecks; it is no performance repair. Fresh read-only cold_fixture_budget_diagnosis
owns causal attribution; repeated real history reads remain a measured seam and
this existing owner boundary, not a selected new cache fix. Our prototype stays
frozen, with no claim for cross-request reuse or broader scope. All supplier
G1–G10/full/load/hosted gates and our own pending gates remain open. New trunk
50b59da0b only Takes SEED-344; it is not a supplier runtime publication.

Supplier10:38UTC native-pair attribution (`/tmp/seed332-native-pair-cost-return.md`)
records quiet2/2pass13.292s with no source change, load3.65→6.82/no sleep/AC. It
does not reproduce or close G5/G10; stock passing browser traces were deleted
and no unchanged rerun followed late trace-on authority. Actual final drill
native chains are55Gitcalls/0.309s and58/0.311s; additional same-reader reuse
into attribution saves only~17ms. No product reader/cache extension is selected.
The current run instead reaches49discarded fixture main resolutions (588.3ms
summed native busy, not wall saving). Existing owner remove_unused_actions_head
has the bounded16path correction, preserving all actual live/default/ref/main
validation and native producer/publication behavior. Our candidate stays frozen.

Publication watch56918/session57901 ended normally at10:39:56UTC, terminal0;
finite ps confirms it absent. Own branch/HEAD7348487 and empty index match;
CI90157/CD5mVp/cellg5:9 remains live. Authoritative refs are supplier92613de41c/
trunk50b59da0b. The same user-authorized watch was renewed once at10:40:36UTC:
PID45232/session36451, one-hour checkpoint11:40:36UTC, matching startup refs.
No report/Take/commit/publication/test was repeated and no other owner's process
was touched. The separate native CI stream is retained through this checkpoint.

Supplier's unused-Actions-head return is accepted there for focused proof:
17paths (16argument-only updates plus106line native contract) remove discard-only
lookups while actual runs(main)/live defaults/ref validation remain. Parent
inspected actual `/tmp/seed332-unused-actions-head-proof.json`:34/34strictpassed,
86.337s, G5filegaps8.322s/G10relative10.098s with no-reread; supplement forwarders
proof2/2strictpassed4.886s reaches both previously missed forwarding paths.
Required live-head controls observe0extra calls for explicit overrides and+1/+1
after actual default decline/restore with changed native SHA. Corrected initial
contract URL setup error and all failed records remain disclosed. No wall-speed
or loaded/full acceptance is claimed. Quietload4.85→8.40 excludes natural-range
profile credit. New independent unused_head_independent_refactor reviews this
concept and incomplete options refactor; supplierG1–G10/full/hosted remain open.

Its temporary interval-CPU measurement audit clarifies that top endpoint samples
do not establish or disprove whole-run contention. No arbitrary idle threshold
or retrospective acceptance is added. Future event-bound native counters and
process cumulative-time evidence can describe the actual run; they change no
test/runner/answer/clock or existing failure disposition. Our natural30–50 and
under25s final-profile requirements remain unchanged.

The next authoritative check names trunk43ae713c4/supplier92613de41c. Attributed
accepted SEED-344 product7da9700a3 (parent50b59da0b), then closure43ae713c4,
changes autoRefreshJourney's default to settle reads before virtual-time advance,
adds explicit WhileReadsOutstanding and removes AfterSettled. Own family project
scope refresh uses the removed export; its canonical rename preserves the prior
explicit-settled meaning. intentRevisionJourney/intentDoneProjectRefresh also
change. Parent inspected exact diffs/call sites, preserving our checkout; no
claim is made for currentG5/G10, which use direct final read settlement. Reconcile
this accepted helper API with331 and the eventual332 publication before affected
gates. Current watches remain publication45232/session36451 and CI90157/CD5mVp.

Supplier's11:13UTC full-gate decision completes independent Actions/options
refactoring without new edits/tests and validates the verbatim64line doc-owner
catalog relocation (anchors/10links/14docconsumers). It adopts accepted344/342
through unpublished ordinary merge d8bb903baf075c2fcb5a21dccf9f8b0dbec03fd6,
preserving95pending hashes except the authorized guide split;96paths/indexempty.
Freshness is unchanged at43ae713c/base43ae713c, typecheck/diffcheck pass, refreshed
13share preview1043jobs is only a prediction. Required naturally contended3family
runs are not established; endpointCPU snapshots confer no whole-run conclusion.

No shared full-suite admission owner remained. Root selected one current full
dashboard run at ordinary2workers/localproductioncap1 instead of3known
out-of-profile repetitions; it owns failures and further decisions. Actual
`/tmp/seed332-full-after-head/proof-17024.json` is now observed running:2794selected,
runnerPID17691, started11:14:09.873UTC, first snapshot205passed/2in-flight/no
terminal result. Log `/tmp/seed332-full-after-head.log`; temporary profiled wrapper
retains event-bound CPU/provenance, not test-body hooks. No code is copied here,
no full result/profile/CI success is inferred, and no other owner's command is
signaled or duplicated. ExistingG1–G10/full/threequalified/hosted gates remain
open pending actual observations. Our watch continues under the same identities.

At11:29:54UTC the same actual full proof17024 remains running:1022passed/
2in-flight, no unexpected/flaky executions and no terminal result. Its31/31
adapter-repeat cases and2/2previous scope-acquisition cases have now passed;
production-watchers are21passed of26selected. This is partial observed progress,
not overall full/profile/CI acceptance. The owner continues its existing run;
no source mutation, duplicate repair or status/delivery transition is made here.

The11:41:06UTC full snapshot is running with1527passed/2in-flight, no unexpected
executions and one expected skip. Parent inspected its exact source: Sessions
replay is an opt-in measurement (`DOUGH_SESSIONS_REPLAY=1`) and declares skipped
when not requested; it is not an observed failing application test or newly
disabled check. No optional benchmark result is claimed. Full terminal verdict,
profile and CI remain unobserved.

Publication watch45232/session36451 ended normally11:40:40UTC at its checkpoint,
terminal0; finite ps confirms it absent. Own branch/HEAD7348487 and empty index
remain, native CI90157/CD5mVp/cellg5:9 is live. Authoritative refs still name
supplier92613de41c/trunk43ae713c4. The same user-authorized helper was armed once
at11:42:07UTC: PID69877/session69431, checkpoint12:42:07UTC, startup refs match.
No other owner's process, source or Git state was changed. Continue watching
the existing full run and publication; this checkpoint is no completion/handoff.

The12:36:35UTC actual full snapshot has two unexpected late terminal-UI failures:
`tests/terminals/agent-terminal-maximize.spec.ts:63` timedOut33.592s and
`agent-terminal-touch-keys.spec.ts:53` failed32.118s. It is still running with
2745passed/1expected benchmark skip/2active, not a passing full verdict. We
preserve the run/source and select no duplicate repair or unchanged repeat.
No exact matching repair reference was found in SEED-334's maintained planning
or pinned canonical planning; this limited search is not proof of no other
owner. The receiving full owner SEED-332 must diagnose/route these defects
under the failure policy, distinguishing them from its already-observed31adapter,
2scope-acquisition and26production-watcher passes. No history/cache cause is
inferred. Its conditional family launch required healthy source/full progress;
these failures require reassessment before any later attempt.

Pinned new trunkec7ec98a0 consists only of343Take/010preparation metadata after
earlier343planning; no new supplier runtime publication is present. Our current
resources remain publication69877/session69431 and CI90157/CD5mVp/cellg5:9.
The user-authorized watch continues; no completion/handoff report is sent.

The actual full proof17024 is now terminal: runnerfailed/strictfailed,
finished12:38:29.994UTC, reported duration5066929.087ms,2791passed/1expected
opt-in benchmark skip/2unexpected terminal-UI failures. Maximize63 timedOut
33.592s; touch-keys53 failed32.118s at its later swipe/visible-row poll. At the
finite post-result check, runner17691 and wrapper17024 are absent; log and
retained failing traces remain. No rerun, causal fix or overall green result is
inferred. The receiving owner must diagnose/route the new defects; our approved
history candidate stays frozen and our pending gates stay open.

Publication watch69877/session69431 ended normally12:42:07UTC, terminal0;
finite ps confirmed it absent. Own branch/HEAD7348487 and empty index remain;
CI90157/CD5mVp/cellg5:9 remains live. Authoritative checkpoint refs were supplier
92613de41c/trunkec7ec98a0. The same helper renewed once at12:44:36UTC:
PID4784/session60224, checkpoint13:44:36UTC; startup sees newer42396695a,
attributed solely to010source-review preparation, with supplier unchanged.
No other owner's source/process/Git state was touched and no completion or
handoff report was sent. Continue the user's watch through the receiving repair.

Supplier now records the terminal result asG11 and assigns fresh read-only
terminal_full_failure_diagnosis. Its actual traces show the UI operations
continuing during teardown after cumulative30s exhaustion; not a selected cause
or timeout waiver. Sleep audit excludesSleep/Wake/DarkWake over the full window,
own AC guard held84m29s. Preserved V1CPU raw ticks yield46.284%aggregatebusy over
approximateUTC5059.440s, with invalid cross-process0.153440selapsed rejected;
actualstartload11.19/end28.06 do not qualify30–50family. No family/newfull or
publication followed. SEED-334's newer active repository-suite admission9b4/
PID78319 and separately pending pageTest preparation remain protected; that
does not establish exact ownership of the Terminal defects. Root332 owns their
diagnosis and must coordinate before any shared pageTest overlap.

Accepted new trunk8843e914d integrates SEED-331's failed-status/wording correction:
first parent42396695a, branch3d1e3a890, actual product1f7d11a7c. Parent inspected
the wallTimeReading/isKnownFailed diff: failed:true accompanies known failed
state and one ciFailedBuild owner supplies failed/no-timing wording/status.
Shared wallTimeReference/history/scoped fixtures and tests change; our cache and
native collector contracts are not expanded. This accepted sibling correction
must be reconciled before affected merged phone/history/family proof, along
with the prior331/344 changes and still-unpublished332. No Terminal cause is
inferred, no own source is overwritten, and the same watch continues.

Supplier13:15UTC Terminal probe report is3/3strictpassed13.818s at quiet
load8.31→7.20, default30s/realPTY; native answer/duplicate costs do not justify a
fixture/Git repair. Reporter onExit removed passing traces despite trace:on;
its initial retention claim was corrected and no second unchanged probe follows.
No implementation, split, assertion, timeout or caching change is selected.
Uncertainty beyond cumulative case-budget exhaustion remainsG11. Its installed
diagnose-failed-proof rule required human judgment; it stopped its exact CI
30339/hc3Y4F with stopped/coverageended/unread0 and confirmed PID absent.

Terry then explicitly authorized one broader synchronized full diagnostic in
that execution: native/ready/browser attribution with reporter-safe target
trace retention, current workload/defaults/assertions preserved, no new repair
or repeated-until-green loop. Existing root332 identity/HEADa81de849/pending96
remains; sourcefreshness unchanged8843/base8843. Fresh terminal_full_probe_preparation
owns only temporary observer/retention validation, not a test launch. Root332
owns review/resources/admission/the one full result and rearming its observer;
no Take/publication/retirement is repeated. Our user's watch remains active and
our own native CI90157/CD5mVp is unaffected. No extra cache or product authority
is inferred for this checkout, and no handoff/completion report is submitted.

Supplier accepted the diagnostic-only preparation after actual Node24/Playwright
ESM/reporting/copy selfchecks. Its gated transform applies before compiler cache
hashing, touches no physical source, and targets only the3Terminal cases for
trace/phase/native logging; a broader unconditional fs-read hook was removed
before launch. Actual input/diagnostic hashes match the manifest. This is not a
repair, timeout/action/assertion change, or profile acceptance.

The authorized broader full is now actually running: rootcommand79290,
wrapper8651/runner8725, `/tmp/seed332-terminal-full-diagnostic/proof-8651.json`,
2794selected, started13:41:04.568UTC. At13:45:30UTC it has534passed/2active/no
unexpected executions and no terminal result. Log/input/provenance remain under
that temporary directory and root332's control. Actual wrapper launch load10.877
does not inherit the earlier36.74 decision sample or qualify3family runs. No
source/test/helper edits occur during this full; planning evidence alone may
change. Existing failures/G1–G11/full/profile/hosted gates remain open.

Publication watch4784/session60224 ended normally13:44:37UTC, terminal0, then
finite ps confirmed it absent. Own branch/HEAD7348487 and empty index match;
CI90157/CD5mVp/cellg5:9 is live. Authoritative refs are supplier92613de41c/
trunk8843e914d. Same helper renewed once13:45:29UTC: PID78026/session44512,
checkpoint14:45:29UTC, matching startup refs. No other owner's work or process
was changed, and no completion/handoff report was submitted. Continue the watch.

The broader diagnostic is not green. At14:03:07UTC proof8651 remains running
with1055passed/3failed/15timedOut/1expectedSkipped/2active. Initial unexpected
failures are revision-reuse-failures91 (82ms), run-processes97/104 (17.167/
15.557s), and one-shot-landing-capture-admission26 (32.712s). More landing/
recovery/artifact-demand timeouts follow; exact identities remain in actual
proof/log/traces. These observations do not establish instrumentation or product
causality and cannot be treated as passing acceptance.

Receiving owner records G12–G15 and read-only attribution. G12 diagnosis supports
a narrow synchronization correction (poll current pair and await existing
refused marker before releasing held comparison), not yet implemented while
the full stays frozen. Inner5s process probes miss intended phases; other cost
causes remain unproved. Its retained resource change records natural load190.80,
later145.39/58.783%busy over only2.201s, no Sleep/Wake and AC guard; those facts
neither prove saturation nor waive prior failures. It continues the one approved
full for pending Terminal evidence at2workers, no extraheavy work/burners or
source changes. All G1–G15/full/profile/hosted gates remain open. We preserve
its control and select no duplicate repair, repeat, cache extension or handoff.

Authoritative14:13UTC refs remain supplier92613de41c/trunk8843e914d; own
publication watch78026 and CI90157 remain live. Receiving G16 records three
distinct parameterized artifact-demand timeouts; G17 production/publication
preparation belongs to the exact active SEED-334 repair. Its grouped reference
assigning landing-capture×3 to our G2 does not match our reconciliation gap.
[Owner-home clarification](repair-ownership-clarification.md) records the exact
G2/G4/G9 scope and unresolved handoff, preserving all other source/processes.
The receiving run also serially skipped a required rate-limit case after G12;
only sessions-replay is the expected opt-in skip. No required proof is waived.
No new implementation, repeat, delivery, reporting handoff or source acceptance
follows from that running snapshot.

At14:37:56UTC the broader diagnostic proof8651 is completed:2794selected,
2772passed/3failed/17timedOut/2skipped. The two skips retain their distinct
expected-benchmark versus serially-unobserved meanings. All three targeted
Terminal cases passed6456/7511/1516ms, retry0, default30; this does not explain
or repair the earlier full failures. Preserved target traces exist separately.
Wrapper host record has exitCode1/signalnull; finite ps confirms8651/8725 absent.
The log additionally reports two runnerMain processes77387/86014 survived
their workers and were ended by the run guard. That is a separate unresolved
lifetime failure, not included in the20failed case count and not attributed
to our collector ownership without causal evidence. Receiving owner retains
diagnosis/repair disposition; no new run, publication or waived gate follows.
The user-requested supplier publication/continuation watch remains active.

Supplier's terminal audit retains56m47.339s/exit1 and three byte-matched target
trace ZIPs. Trace is worker-scoped: forcing it on created separate pools/late
placement, so the three passes do not reproduce prior worker age/order. The
server-side `/api/` observer also misses actual`/__agent-launch`; browser
network/phone raw HTTP remain available, not an invented direct server span.
Supplier selects only evidenced G12 pair-arrival/refused-marker synchronization;
other cost repairs/G11remain unselected and full/load/hosted gates remain open.

Own watch78026/session44512 ended normally14:45:29UTC, terminal0, then finite ps
confirmed it absent. Own HEAD7348487/branch/workspace match;29pending paths and
empty index remain preserved, CI90157/CD5mVp/cellg5:9 is live. Authoritative
refs still supplier92613de41c/trunk8843e914d. The same helper renewed once
14:45:49UTC, PID46619/session89092, checkpoint15:45:49UTC, matching startuprefs.
No other owner's files/processes, Git publication or completion reporting changed.

Authoritative14:59:37UTC remote refs remain supplier92613de41c/trunk8843e914d;
own46619/CI90157 are live and diffcheckpassed. At15:06UTC supplier records
accepted G12 revision-read synchronization: exact pair/refused marker, unchanged
assertions/product semantics,23/23 across5files/default30/2workers/retry0/no skips,
7.822s, independent no-edit refactor and typecheckpassed. The formerly serially
skipped RetryAfter case is now observed in that focused proof. This is not our
receipt-reconciliation G2 and does not erase the failed full verdict. Other16
receiving returns and full/load/hosted remain open; no publication occurred.

Supplier's exact observerMMEMqQ/32039 is now stopped/unread0/confirmedabsent
for post-diagnostic human judgment. Its normal-pool retention preparation is
temporary/scratch-only; another real diagnostic lacks authority. The terminal
analysis confirms target workers were fresh(~0.6s old), low point load~5.2,
with native Gitanswerwork~89/87/47ms and zero ghAPI subprocesses; none explains
the original G11 failures or selects a new cache/repair. Keep these limits.
User's instruction to watch the supplier remains in force; our own observer
and publication watch continue, without approving another execution's run,
duplicating repairs, publishing, handing off, or reporting completion.

Supplier's15:24UTC [normal-pool evidence](../../../../answer-fake-github-reads-without-a-process-per-c/.planning/slice-plans/610-answer-fake-gh-reads-in-process/normal-pool-evidence.md)
records Terry's next ok for exactly one corrected full diagnostic. Its fresh
standard observerurrrie/PID19953/session31984/cellg103:3 replaces stoppedMMEMqQ;
no Take/publication repeats. Corrected scratch proves baseline worker-fixture
digest unchanged and retention after assignment, preserving normal traceoption
and actual launch-route metadata. Real proof32192 nowrunning2794selected from
15:25:20.133UTC, runner33216, directory`/tmp/seed332-normal-pool-full-diagnostic`,
log`/tmp/seed332-normal-pool-full-diagnostic.log`; initial15passes/2active.
Same default30/two workers/localproductioncap1, no source changes duringrun.
This is the supplier's approved diagnosis, not ours to signal/repeat or accept
as a repair in advance; our watch and all unresolved proof obligations continue.

Supplier's15:36UTC normal-pool record accepts our owner-home clarification and
retains G15 diagnosis unless exact evidence matches a separately offered owned
defect; [clarification disposition](repair-ownership-clarification.md) updated.
Current full32192 passes all4revision-reuse-failures cases (including repaired
burst139ms/previously skipped RetryAfter149ms) and all4run-processes probes;
the two earlier process-probe causes remain unproved. At15:45:51UTC it has
1243passes/2active/no failures, not a terminal/full/profile verdict.

Own publication watch46619/session89092 ended normally15:45:50UTC/terminal0;
finite ps confirmedabsent. Own workspace/branch/HEAD7348487,29pendingpaths and
empty index match; CI90157/CD5mVp/cellg5:9 remains live. Authoritative remote
refs still supplier92613de41c/trunk8843e914d, and supplier32192/33216 are live.
Same helper renewed once15:46:09UTC, PID88115/session92199, checkpoint16:46:09UTC,
matching startuprefs. No publication, source acceptance, other-owner mutation,
completion report or handoff follows; continue the user's watch instruction.

At16:29:40UTC corrected normal-pool proof32192 is completed:2793passed and one
expected opt-in Sessions benchmark skip of2794selected; no casefailure, timeout,
retry or required serial skip. Host terminal record exitCode0/signalnull; log has
only proofrecord, no outside-test process error, and finite ps confirms32192/
33216 absent. Target Maximize/phone/desktop pass9967/11153/2619ms, default30,
ordinaryworker-fixturedigest. This is an actual passing full diagnostic, not a
causal repair claim for older G11/G13–G17 failures, three qualifying natural-load
family passes, final hosted13-shard proof or publication. Supplier owns final
sleep/liveness/phase audit and dispositions; no new correction is assigned here.
At16:30UTC authoritative remote refs still supplier92613de41c/trunk8843e914d;
own88115watch/CI90157 remain live. Continue the user-requested publication watch.

Direct owner-record reading confirms its subsequent incomplete human-judgment
handoff: normal-pool terminal analysis retains substantial ordinary worker
history and complete unchanged PTY/browser observations, but no supported causal
correction. Audit reports272observedPIDsabsent, source/diagnostic hashes intact,
no sleep, AC100%; whole-command3864.978s/44.9207%busy includesproofandotherwork,
not matched target contention. Actual00:35+08 load2.52/7.32/14.64 lacks the planned
30–50 busy window. Supplier leaves16returns and loaded/hosted gates unproved,
selects no further full, and stops urrrie/19953 with matched ended/unread0 receipt
and finitepsabsence. Its98pendingpaths/HEADa81/indexempty remain preserved.

The recursive planning notification missed this final-record update, so retain
bounded direct record reads alongside authoritative refs. Disposable helper now
also watches the exact plan directory; node--checkpassed, no product/test change.
Old88115/session92199 ended normally16:46:09UTC/terminal0 and finitepsconfirmed
absent. Ownbranch/HEAD7348487,29pendingpaths/emptyindex match; CI90157/CD5mVp/
cellg5:9 live at7h08. Authoritative refs still supplier92613de41c/trunk8843e914d.
Updated helper renewed once16:46:24UTC, PID83009/session57219, checkpoint17:46:24UTC,
matching startuprefs. No other owner's source/process, publication, completion
report or handoff changed; continue the user's watch. Own CI's8h bound approaches
17:38UTC: resolve its exact installed maintenance/recovery boundary before then.

At16:54:40UTC the watch observes accepted trunk7a100c396cda55bdc9fa9a03313b1a56f58a06a1,
firstparent8843e914d, integrating899724deb: SEED-343 completion-observation recovery.
Parent inspected its done record, diff inventory, new recovery guide and sole
shared fixture change: serverBundle explicitly sets codeSplitting:false so
dynamic imports remain one file per configured output.file. The other runtime
changes are source guidance/CI recovery and closure mechanics, not our history
prototype or an offered additional repair. Installed managed copies did not
change in this landing; preserve the current installed observer contract and
adopt released guidance through its maintained path. No runtime hand-copy or
extra publication follows. Reconcile this attributed shared setup before any
affected merged proof; the just-passed normal full predates this landing.
Supplier branch remains92613de41c; no SEED-332 completion or publication observed.

At17:16UTC direct supplier record still names its paused human-judgment handoff;
authoritative refs match92613de41c/7a100c396. Our installed CI adapter/runtime
remains unchanged by unreleased source guidance. To retain observation during
the user's continuing watch before the old8h transport bound(~17:38UTC), parent
read installed Codex/one-observer guidance and verified CD5mVp's exact
codexStreamOwner(root,darren-seed324), requestroot/repo/branch/execution/commonGit
identity, PID90157 and28800000ms budget. Installed stop returned matched
stopped/coverageended/pendingCiunobserved/recorded0/delivered0/unread0; result.json
agrees and finite ps confirms90157absent. No process was signaled or completion
operation invoked. This is owned observation maintenance, not a story stop.

Current own CI note supersedes CD5mVp/g5:9: coordinator`darren-seed324`, standard
Codex binding yielded cell`g5:495`, session53158, directory`/tmp/dough-ci-501/watch-cc4BPq`,
PID41702, samekey`ci-watch-execution:terryyin/open-dough:codex/close-the-landed-ci-repeat-checks-coverage-gaps:darren-seed324`.
Initial watching identity and new owner/request match; request written
17:18:43.863UTC,8h bound approximately2026-11-14T01:18:43UTC. Node24.21.0 and
checkout-bound installed .agents runtime verified. Never wait/poll/write_stdin
this CI stream; retain it for future managed delivery and eventual completion.

Managed resume6658 terminal0 retained candidate7348487/suffix1c040/ownbranch:
accepted/already-published,pushCount0,record-published-identity, observationrecovered/
reusedcc4BPq; registrationnot-this-obligation is not an extra registration failure.
No Git publication/Take or tests repeat and no CI-success claim follows. Source
publication watch83009/session57219/checkpoint17:46:24UTC remains the distinct
owned resource; supplier remains paused/unpublished. Continue the user's watch.

At17:46:24UTC publication watch83009/session57219 ended0 and finitepsconfirms
absence. Ownworkspace/branch/HEAD7348487/29pending/emptyindex match; current
CI41702/cc4BPq/g5:495 remains live. Authoritative refs92613de41c/7a100c396 and
supplier's direct paused-handoff record remain unchanged. Same updated helper
renewed once17:46:43UTC, PID59546/session83126, checkpoint18:46:43UTC, matching
startuprefs. No publication, completion, source acceptance or handoff follows.

At18:46:43UTC watch59546/session83126 ended0/confirmedabsent. Ownidentity/
HEAD7348487/29pending/emptyindex match; CI41702/cc4BPq/g5:495 remains live.
Authoritative refs92613de41c/7a100c396 and direct supplier paused record are
unchanged. Same helper renewed18:47:01UTC, PID96456/session55338,
checkpoint19:47:01UTC, matching startuprefs. Continue the user's watch;
no source change, publication, completion report or handoff follows.

At19:47:01UTC watch96456/session55338 ended0/confirmedabsent. Ownidentity/
HEAD7348487/29pending/emptyindex match; CI41702/cc4BPq/g5:495 remains live.
Refs92613de41c/7a100c396 and direct supplier paused record are unchanged.
Same helper renewed19:47:24UTC, PID33648/session98870, checkpoint20:47:24UTC,
matching startuprefs. Continue the user's watch; no source change, publication,
completion report or handoff follows.

At20:47:24UTC watch33648/session98870 ended0/confirmedabsent. Ownidentity/
HEAD7348487/29pending/emptyindex match; CI41702/cc4BPq/g5:495 remains live.
Refs92613de41c/7a100c396 and direct supplier paused record are unchanged.
Same helper renewed20:47:55UTC, PID69085/session58107, checkpoint21:47:55UTC,
matching startuprefs. Continue the user's watch; no source change, publication,
completion report or handoff follows.

At21:47:55UTC watch69085/session58107 ended0/confirmedabsent. Ownidentity/
HEAD7348487/29pending/emptyindex match; CI41702/cc4BPq/g5:495 remains live.
Refs92613de41c/7a100c396 and direct supplier paused record are unchanged.
Same helper renewed21:48:27UTC, PID3107/session42550, checkpoint22:48:27UTC,
matching startuprefs. Continue the user's watch; no source change, publication,
completion report or handoff follows.

At22:48:27UTC watch3107/session42550 ended0/confirmedabsent. Ownidentity/
HEAD7348487/29pending/emptyindex match; CI41702/cc4BPq/g5:495 remains live.
Refs92613de41c/7a100c396 and direct supplier paused record are unchanged.
Same helper renewed22:48:48UTC, PID36509/session83718, checkpoint23:48:48UTC,
matching startuprefs. Continue the user's watch; no source change, publication,
completion report or handoff follows.

## Human-judgment stop after impractical waiting

Terry asks why this execution has waited nearly24hours and says the wait is not
practical. The coordinator stops the open-ended watch: the supplier's ordinary
full has already passed, but its owner is paused on prior stability questions
and a missing natural30–50window. Passive observation cannot settle those
decisions. Treating that inactive dependency as a job to keep waiting for was
the coordinator's mistake; no test or scope requirement is silently waived.

Publication watch36509/session83718 accepts its owned stdin stop and returns
retired/exit0 at23:19:23UTC. The pending publication-read cellg5:891 completed.
CIcc4BPq's exact codexStreamOwner(root,darren-seed324), requestroot/repo/branch/
execution/commonGitidentity and PID41702 matched before installed stop. Its
receipt and result.json agree: stopped/coverageended/pendingCiunobserved,
recorded0/delivered0/unread0. Finite ps confirms both36509/41702 absent. Current
CIcellg5:495 is stopped; no observer or publication watch is left running and
none is automatically rearmed at this handoff. Other owners' resources stay
untouched.

Final source-freshness check85935 terminal0 is unchanged at trunk7a100c396,
base36df771; story and canonical published plan unchanged. OwnHEAD7348487,
emptyindex and29pendingpaths preserve all slice3/history/collector/source-review
work. Slices1–2 remain delivered, slice3 next/planned with its required current
family proof still owed, and4–8 unstarted. No execution-complete record, further
publication, retrospective, wrap-up or retirement is claimed.

Resume needs a bounded handoff of the particular supplier fixture changes and
an explicit load/stability-proof decision, then the first remaining slice3
proof/delivery obligation. Do not resume another indefinite wait or repeat Take.
Recover this stopped CI note and arm only after its confirmed exit if execution
is authorized to resume. Exact unfinished attention response is retained in
`/tmp/seed324-watch-stop-attention.md` for the supplied dashboard reporter.

## Story obligations

### G1. Adapter-comparability failures during slice 3 proof
Reported: slice 3 — "The first focused family run, launched at natural load 67.80, has observed adapter-comparability polls timing out with stale accepted/intent explanations instead of the expected mismatch or incomplete-proof verdict. Terminal inventory and causal diagnosis remain outstanding."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G2. Reconciliation submission observation can precede its prerequisites
Reported: slice 3 — "The second renewed family run failed multiple-attempt reconciliation: after receipt ingestion the five-second initial rerun-count poll still read zero, at observed natural load 34.94. That is within the promised range; diagnosis and repair remain owed."
Story clause: "Moving the support owners preserves the existing receipt journey and stage checks."
Disposition: return

### G3. Custom comparison reading exceeds its case budget
Reported: slice 3 — "The second renewed family run timed out at 30 seconds while the recovered custom comparison still read Reading retained CI follow-up, after the same case’s slow-outcome navigation. Existing bounds remain unchanged; diagnosis and repair remain owed."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G4. Teardown can lose a server whose startup is pending
Reported: slice 3 — "The real pending-start regression failed on the old fixture with the late server still running after teardown. The original refusal timeout also reached origin cleanup while a restarted server was still starting, producing ENOTEMPTY."
Story clause: "finds one owner for each support responsibility"
Disposition: return

### G5. A second fresh card read assumes continued history availability
Reported: slice 3 — "Malformed-JSON rejection first observed its matching card, but a second fresh endpoint read supplied no card. Each read independently resolves published completion history; the first successful read does not establish the second read’s availability."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G6. Refresh proof exhausts its case budget on unrelated comparison reads
Reported: slice 3 — "The third renewed family run had 54 passes and one refresh-case timeout at 30 seconds, with natural load 30.89 to 38.90. Trace shows an initial CI comparison read taking 9.249 seconds, later revision checking taking 5.83 seconds, and another read drain at the deadline; kept worker preparation is outside that case budget."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: return

### G7. A shallow negative ancestry result can change after deepening
Reported: slice 3 — "A real Git shallow boundary makes ancestry return false/exit 1 before deepening and true after removal. The prototype retained the rejected exit-1 query and incorrectly kept returning false in the same reader; the new regression reproduced this mismatch."
Story clause: "Functional behavior, mutable-ref observation, error/abort handling and every existing test gate remain unchanged."
Disposition: proved by slice 3: dashboard/backend-tests/intent/published-story-history-semantics.spec.ts negative ancestry deepening; real red then green, /tmp/seed324-history-shallow-follow-up.md and current graph follow-up

### G8. Successful walks can still describe incomplete shallow history
Reported: slice 3 — "Real Git differentials showed ordered commits, authored commits, merges and profile-path walks change after a shallow boundary is removed, while the prototype reused their incomplete lists for the same full commit IDs. Full object names alone do not establish complete graph knowledge."
Story clause: "Functional behavior, mutable-ref observation, error/abort handling and every existing test gate remain unchanged."
Disposition: proved by slice 3: dashboard/backend-tests/intent/published-story-history-semantics.spec.ts all four successful graph walks versus independent Git before/after deepening; /tmp/seed324-history-graph-follow-up.md, twelve-case pass plus final graph pass

### G9. A standalone follow-up collector can outlive its test
Reported: slice 3 — "Supplier full proof52807 reached the correct queued-rejection card and ledger after restart, then its final native collectFollowUps call continued past the case deadline. The native collector is started by ciFollowUpAdapterScenario through promisified execFile without fixture ownership; later continuation read adapter-requests.jsonl after origin cleanup. The pending-server-start registry does not own this separate collector child."
Story clause: "finds one owner for each support responsibility"
Disposition: proved by slice 3: landed-ci-collector-lifetime.spec.ts native red/green plus seven final focused caller/lifetime cases and typecheck; /tmp/seed324-collector-lifetime-return.md. G1–G6, full family/load and delivery remain open.
