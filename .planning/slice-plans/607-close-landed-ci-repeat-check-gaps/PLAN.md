# Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps

**Source:** [Close the landed CI repeat checks' coverage gaps and tidy their support](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)

## Provenance

Execution retrospective of
[Make landed CI repeat checks pass under moderately high load](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load)
(SEED-324#pass-landed-ci-repeat-checks-under-high-load, plan 599). Manifest:
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
- Trunk's `readReportUntilText` retry and `test.setTimeout(60_000)` in
  `agent-completion-quiet.spec.ts` belong to their owning story. The
  developer receives them separately.
- Product code under `dashboard/server` and `dashboard/src` does not change.
  Faults are scratch edits, reverted before any commit.
- The cases and assertions of the admission, reconciliation, follow-up
  reading and adapter-repeat specs stay as they are. Slice 4 changes only
  how they read the rerun count, from `scenario.repeatCalls` to
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
  is held at a preparation read of run 71, after its pre-check. Meanwhile
  the test writes that landing's accepted request into the ledger, through
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
- **Kept scope proof (finding 8).** Collection's kept proof is the truth. If
  `keptScopeFileProof` differs from it, the builder changes to match, and
  the refresh and prior-build specs keep their figures.
- **Start origins (findings 6 and 7).** The fix seeds the parent map with the
  first revision's name → the project checkout's `HEAD`. A run-wide
  description has exactly one revision (`runWideKeys` matches
  `{ revisions: [first] }`), so `HEAD` is that commit. The origins one
  process holds move to their own module, and `preparedStartOrigin` keeps
  its answers.
- Story Branch Mode. No slice acts from trunk.

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
| F4 | A 104 s repeat stays slow | `slow` always true in `observeRepeat` |
| F8 | A refusal is saved as accepted | A refused reply is treated as accepted in `collectCiFollowUps` |
| F9 | A later passing repeat clears an uncertain acceptance | Drop the `submission.kind !== "accepted"` return after measurement |
| F12 | Two dashboards both spend | `spendRepeat` returns true without the ledger's guard |
| F14 | The request is sent before the intent is saved | `spendRepeat` moves after the provider's submit |
| F25 | Collection sends although another writer spent first | `ciFollowUpCollection.ts:90` ignores `spendRepeat`'s answer (calls it, then continues to submit) |
| F26 | A comparison line outside the attempts and evidence scrolls sideways | `white-space: nowrap; overflow-x: auto` on the comparison's published-landing line (the executor picks the nearest single product edit with this effect and records it) |
| F27 | A queued repeat is not read as progress | `"queued"` removed from the progress statuses at `ciFollowUpObservation.ts:86` |
| F28 | The kept scope proof drifts from collection | `keptScopeFileProof` omits its file-unit evidence (a test-support scratch edit) |

## Decisive premises

Planning ran no observations. The coordinator settles each open premise with
the named observation before recording `ready`. Otherwise these premises are
the `not-ready` reasons.

| Premise | Consuming slice | Settling observation | State |
| --- | --- | --- | --- |
| P1. A collecting boundary server that keeps an unspent eligible receipt reaches a preparation read of run 71 after its ledger pre-check. A ledger write made while that read is held makes `spendRepeat` answer false, and F12 and F25 each make it send | 5 | Scratch case in the execution workspace: `keepRepeatLanding(…, { stage: "eligible receipt", run: 71, seconds: 120, averageSeconds: 100, beside: [waiting] })`, an answerer that holds `actions-attempt-jobs` for run 71 (or the first preparation read the server makes, as recorded), `startServer()`, wait for the held read, `keepFollowUpEntries` with that entry's accepted request, release, `aWholePass`, then `rerunRuns(github)`; run with `--workers=1 --reporter=list`, then with F12 and with F25 | Open. Code read supports it (`ciFollowUpCollection.ts:54–90`, `ciFollowUpAdmission.ts:52–74`); reading is not settling |
| P2. For the completion spec's facts (`runId: 63`, three files including `["folder/zero.spec.ts", 0, 0]`), the kept proof equals `keptScopeFileProof({ revision, runId: 63 }, files)` | 6 | Scratch expectation in `landed-ci-scope-proof-completion.spec.ts`, one worker | Open. If they differ, slice 6 also changes the builder, and the refresh and prior-build specs must keep their figures. That changes sizing, not approach |
| P3. The current comparison at 390 px passes `expectNoSidewaysScrollIn(page, comparison)`, and F26 fails only that expectation | 1 | Add the expectation, run the spec, then F26 | Partly settled. Plan 599's slice 1 premise row saw no sideways scroll at 390 px at `7cf81190b`, but product paths have moved since (SEED-330 merge), so that is a proxy |
| P4. A repeat at `status: "queued"` reads "CI rerun in progress" on the phone card, and F27 fails it | 2 | Change the status, run the spec, then F27 | Open. Code read only (`ciFollowUpObservation.ts:86`) |
| P5. A description from `makeMe.aRepository`, whose later revision names the first revision as a parent, throws `Unknown parent` through `startOrigin` in a dashboard run (the shared path) today | 7 | The slice's new case on the current tree, `--workers=1 --reporter=list` | Open. This is the symptom to reproduce before the fix |

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
  `tests/intent/intent-ci-follow-up-custom.spec.ts`, at `--workers=2`. Before
  committing a support move, apply one scratch `throw` at the top of each
  moved or removed export, run these, and confirm that only these files fail.
  Revert the throw.
- **Ledger node tests:** `bash scripts/test.sh
  tests/support/ci-follow-up-ledger.test.mjs`.
- **Fault controls:** one scratch edit, the named case with `--workers=1
  --reporter=list`; record which case fails and at which expectation, and
  revert before the next. Run them at a one-minute load of about 27 or
  less.
- **Load profile, once after the last slice:** one counted two-worker run of
  the selection through `bash scripts/dashboard-repeat.sh 1 <selection
  specs>`, started only while the one-minute load is 30–50. Add `--load`
  when the natural load is below 30. Every case passes and none takes more
  than 25 s, read from `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file>`; that run
  passes no `--reporter`. A run whose load before or after lies outside
  30–50 is recorded and not counted.
- Typecheck and lint through the ordinary commit hooks. No whole local
  suite: every changed file's consumers are named above. Hosted CI runs the
  whole suite on each published revision, and its failures stay the
  executor's.

## Ordered slices

### 1. The Intent phone reading checks its whole comparison for sideways scroll
Type: Behavior
Status: planned
Proof: `tests/intent/intent-ci-follow-up.spec.ts` passes three consecutive
times at two workers with `expectNoSidewaysScrollIn(page, comparison)` after
the three `expectWholeOnPhone` checks. F26 fails it at "scrolls sideways
inside" on the comparison, and the three part checks pass under F26 (P3).

Behavior: a settled request's comparison is open on a 390 px phone → any
line of the comparison scrolls sideways inside itself → the reading case
fails, as the base case did.

### 2. A queued repeat reads "CI rerun in progress" on a phone
Type: Behavior
Status: planned
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
F2 fails the refused case with `[71, 71]`, F8 the refused case at "saved
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

### 4. One owner answers, holds and counts rerun requests, and arrangements layer one way
Type: Structure
Status: planned
Proof: the selection and the follow-up support consumers pass three
consecutive times at two workers, each case with its base result. A scratch
`throw` in `repeatCalls`' former readers finds no remaining consumer. The
journey calls no `scenario.serve()`. F2 fails the journey and the refused
case with `[71, 71]`, F14 fails the journey at "intent saved before the
request is sent" through the moved hold, and F8 fails the refused case.

Correction (finding 4), enabling slice 5:

- `providerRepeatRun` answers its run's rerun request with its reply status.
  It also holds any named request of its run until released: the rerun for
  the journey, and a preparation read for slice 5.
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
held at a preparation read of run 71. The test writes that landing's
accepted request into the ledger, standing in for another dashboard's spend,
and then releases the read. After a whole pass, the provider has received
no rerun request, and the saved request is the one the other writer saved.

### 6. The kept scope proof is what collection keeps
Type: Structure
Status: planned
Proof: `backend-tests/intent/landed-ci-scope-proof-completion.spec.ts`
passes three consecutive times at two workers with an added expectation.
For the same run and files, the kept proof equals `keptScopeFileProof({
revision, runId: 63 }, files)`. F28 fails it at that expectation (P2). If
the builder changes, `intent-project-scope-timing-refresh.spec.ts`,
`intent-scope-prior-build-states.spec.ts` and
`intent-scope-prior-build-average.spec.ts` also pass three consecutive times
with unchanged figures.

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
commit. On the current tree it fails with `Unknown parent` (P5). After the
fix it passes three consecutive times. `start-origin-isolation.spec.ts`,
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
two workers. A scratch `throw` in each moved export finds no consumer
outside those files, `keptPublishedStory.ts`, `pageTest.ts` and
`startOriginPreparation.ts`. Then the load-profile run of
[Verification](#verification) is counted.

Correction (finding 6): `privatelyPrepared`, `privateDirectories` and their
exit cleanup, `keepStartedOrigin` and `preparedPrivately` move to a module
named for origins a process holds. `startOriginPreparation.ts` keeps the
run-wide origins and the installation layer. `preparedStartOrigin` keeps its
answers. `keptPublishedStory.ts`, `pageTest.ts` and
`dashboard/tests/fixture-origins.md` name the new home.

## Plan concern assessment

Slice-plan refinement was not needed. Each slice has one proof loop and one
finding. Slice 4 is placed immediately before slice 5, the Behavior it
enables. No later slice depends on an earlier slice's unsettled premise,
except slice 5 on P1.

Remaining concerns:

- **Slice 5, P1:** the approach depends on holding a preparation read after
  the pre-check. If P1 is false, slice 5 stops and returns to the
  coordinator. It does not fall back to a timing-dependent two-server check.
- **Slice 6, P2:** if the builder differs from collection, the slice also
  changes the builder. The refresh and prior-build specs must then keep
  their figures, which widens the slice's consumers.
- **Slices 1, 2 and 7, P3–P5:** each is settled by the slice's first run.
  Until observed, these premises are the `not-ready` reasons.
