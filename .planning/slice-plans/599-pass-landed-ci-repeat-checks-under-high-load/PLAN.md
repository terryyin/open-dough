# Make landed CI repeat checks pass under moderately high load

**Identity:** SEED-324#pass-landed-ci-repeat-checks-under-high-load
**Source:** [Story](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers get a passing verdict from four specs while other work holds the
one-minute load at 30–50, on two workers, with the default 30 s case timeout
and 5 s expectations:

- [landed-ci-automatic-repeat.spec.ts](../../../dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts)
- [landed-ci-repeat-verdict.spec.ts](../../../dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts)
- [recently-done-ci-automatic-repeat.spec.ts](../../../dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts)
- [intent-ci-follow-up.spec.ts](../../../dashboard/tests/intent/intent-ci-follow-up.spec.ts)

One case keeps the real receipt-to-request journey. Every other case starts
from the state that journey leaves on a machine. No case takes more than 15 s,
or 25 s when it runs first in its worker.

Included: the cases of those four specs; their support modules under
`dashboard/tests/support/`; the saved-state arrangement and its use of shared
MakeMe; the coverage map and fault controls; the measured comparison.

Excluded: product code under `dashboard/server` and `dashboard/src`; the cases
and assertions of the admission, reconciliation, follow-up reading and receipt
boundary specs; first-in-worker preparation (start origin and the shared app
build), which SEED-287 owns and is executing; the cost of one fake `gh` call;
the repository node suite's follow-up policy, reading and ledger tests, which
are credited only where the coverage map names them.

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the comparison and the result worth keeping before the measured run.
The story's key examples 1, 2 and 8 set both. No North Star topic governs this
work and none is added.

## Architecture and reuse

One model carries every case: **a landing the machine keeps, at a stage of its
repeat**. The product moves a repeat from stage to stage through three files
only, the follow-up ledger, the landed CI history and the launch records, read
against the story's published completion. A case arranges the stage it starts
from and runs real collection and reading in a real server.

| Stage the machine keeps | What the case then observes | Cases |
| --- | --- | --- |
| Five measured prior builds, nothing of the landing | Real receipt ingestion, admission, the rerun request, the saved request, its card | The one journey |
| The landing measured, with its unspent eligible receipt | The real rerun request and what each provider reply saves | Refused, uncertain |
| An accepted request for a published completion | What later passes and a fresh server read: in progress, slow, the original kept, no second request | Lifecycle outcomes, the phone warning |
| Accepted requests for landings no story published | The outcome the provider's facts decide | The two existing saved-request cases, unchanged |
| A settled request with its frozen reference | Reading in a server that collects nothing | The Intent reading |

PFE, the saved-state owner: `saveRepeatRequests` in
`dashboard/tests/support/ciFollowUpSavedRequests.ts` (129 lines) already saves
the fourth stage through `makeMe.aCiFollowUpEntry`, `makeMe.aCiRepeatRequest`
and `repeatLedgerFacts()` in `tests/support/ciFollowUpLedgerFacts.mjs`.
Decision: change that owner so it arranges the other stages too. No second
arrangement beside it. When it would pass 250 lines, the stage arrangement
takes its own module beside it and `saveRepeatRequests` states its stage to
it.

PFE, kept history and records: `makeMe.aLandedCiHistory`
(`tests/support/landedCiHistoryTestData.mjs`), `keepLandedCiHistory` and
`landedRecord` in `dashboard/tests/support/landedCiHistory.ts`, and
`keepMoreLaunchRecords` are used by the landed CI history specs today. Reuse.
`tests/support/ciMakeMe.mjs` is at 242 lines and is not edited:
`aCiFollowUpEntry` and `aCiRepeatRequest` take every field of the product's
types.

PFE, provider facts: `providerRepeatRun` and `serveRepeatRuns` in
`dashboard/tests/support/ciFollowUpRepeatRun.ts`. Reuse. `github.serve` keeps
one answerer per repository, so a page case serves the provider after
`publishCommittedOrigin` with the replaced answerer as its fallback, as
`scenario.serve()` does; `serveRepeatRuns` gains that fallback when slice 4
or 5 needs it (slice 1).

PFE, the published completion: `completedPublishedStory` (real CLI completion,
0.5–3.1 s observed). Reuse; a card is selected by it
(`dashboard/server/completedCiFollowUps.ts`).

PFE, the journey's arrangement: `prepareRepeatScenario` stays for the one
journey and for the eight specs that import it. SEED-287's branch adds
`collectPriors` to its return and changes `prepareRepeatPriors`' return; keep
this plan's edits of `ciFollowUpScenario.ts` and `ciFollowUpPriors.ts` away
from those lines so the two merge.

PFE, the reader: `restartAsLandedCiReader` and `startLandedCiReader`
(`dashboard/tests/support/landedCiReader.ts`). Reuse `startLandedCiReader`
directly where no collecting server ran first; it uses only the server's
`github` and `outDir`, so slice 5 narrows that parameter instead of casting.

Common rule for every slice: a case pays for a journey only for what the
journey alone can show, and an observation leaves a journey only after a
deliberate product fault fails the check that takes it over.

Files this plan expects to edit, none over 250 lines: the automatic-repeat
spec 214, the verdict spec 83 (unchanged unless its support moves), the
recently-done spec 77, the Intent follow-up spec 200,
`ciFollowUpSavedRequests.ts` 129, `ciFollowUpScenario.ts` 162,
`ciFollowUpReadingPage.ts` 97, `ciFollowUpLedgerFacts.mjs` 74.

## Coverage map

Every promise the seven current cases protect, with its owner on the base and
after this plan. "Fault" names the control in [Verification](#verification).

| # | Promise | Owner on the base | Owner after | Fault |
| --- | --- | --- | --- | --- |
| C1 | Follow-up is off until the machine enables it | Lifecycle journey; phone journey (settings row) | The journey (settings read); the phone settings case | F13 |
| C2 | A Done receipt at exactly 105 s against five 100 s builds gets one rerun request for run 71 | Lifecycle journey | The journey | F1 |
| C3 | The intent is saved before the request is sent | Lifecycle journey (held submission) | The journey | F14 |
| C4 | The accepted request is saved after the reply | Lifecycle journey | The journey | F8 |
| C5 | A repeated acceptance and a second dashboard on the machine send nothing more | Lifecycle journey | The journey keeps the repeated acceptance; the second dashboard moves to `tests/support/ci-follow-up-ledger.test.mjs` "two independent processes serialize spend" only if F12 fails it, otherwise it stays in the journey | F2, F12 |
| C6 | The request the product wrote reads as a card | Lifecycle journey (progress, slow) | The journey (the accepted card) | F15 |
| C7 | An in-progress repeat reads "CI rerun in progress" | Lifecycle journey; phone journey | Accepted-request case; phone warning case | F16 |
| C8 | A 106 s repeat reads slow with 105 s, 106 s and the 100 s average | Lifecycle journey; phone journey | Accepted-request case; phone warning case | F3 |
| C9 | History still selects the 105 s original after the repeat | Lifecycle journey | Accepted-request case | F17 |
| C10 | A fresh server reads the same card and sends nothing | Lifecycle journey (restart) | Every kept-state case starts a fresh server; accepted-request case counts requests | F2 |
| C11 | A refused reply is saved as refused, with the original and average, and no second request | Refused journey | Eligible-receipt case, 403 | F2, F8 |
| C12 | An uncertain reply stays unverified after a 104 s passing repeat and shows it | Uncertain journey | Eligible-receipt case, 503 | F9 |
| C13 | Turning follow-up off keeps the saved original readable | Refused and uncertain journeys | Eligible-receipt cases | F18 |
| C14 | Recovered, failed, cancelled, partial proof | Saved-request case | Unchanged | F4, F5, F6b, F7 |
| C15 | Absent and unknown conclusions | Verdict saved-request case | Unchanged | F10, F11 |
| C16 | The settings row turns follow-up on and names the provisional rule | Phone journey | Phone settings case | F13 |
| C17 | The slow card is a red textual Done warning with its three totals and its caution, without sideways scroll on a phone | Phone journey | Phone warning case | F19 |
| C18 | The card opens both attempts, their links, timings and completeness, the saved rule and the reference evidence with the outlier excluded | Intent journey | Intent reading case | F20 |
| C19 | First render, refresh, reload and revisit acquire no CI | Intent journey | Intent reading cases | F21 |
| C20 | The original's proof is navigable from Changed tests and the repeat's is not offered | Intent journey | Intent proof case | F22 |
| C21 | A new selection in Development yields to normal Intent, and the card reopens the comparison | Intent journey | Intent selection case | F23 |
| C22 | Keyboard order reaches both attempt links, the reference disclosure and each evidence link | Intent journey | Intent reading case | F24 |

## Outside-in proof ownership

| Story promise | Owning slice and observable proof |
| --- | --- |
| Key example 1, the profile passes with margin | 6: three consecutive counted two-worker runs at load 30–50; slowest case per position from the proof records |
| Key example 2, one journey | 3–5 lower the count; 6: one case calls `scenario.ingest` across the four specs |
| Key example 3, a provider reply without a journey | 2: the eligible-receipt cases; F2, F8, F9, F18 fail them |
| Key example 4, the warning without a journey | 4: the phone warning case; F3, F16, F19 fail it |
| Key example 5, the reading without acquiring CI | 5: the Intent reading cases; F20–F24 fail them |
| Key example 6, each promise has a catching check | 2–5: every coverage row's fault fails its "owner after" before the base owner's observation leaves |
| Key example 7, kept state the product would refuse | 2: a scratch saved entry that breaks the ledger schema fails its case |
| Key example 8, much faster | 6: paired one-worker runs, candidate median at most two-thirds of the base's |
| Key example 9, hosted CI | 6: hosted CI on the published revision; diff review |
| Kept state stays the product's | 2–5: builders typed by the product's types; 3: the journey's card read (C6) |
| Waits name their event | 2–5: no expectation after a provider change without a preceding wait on the provider's answer or the saved request; diff review in 6 |
| Shared fixtures keep their other consumers | 2–3: the specs that import `ciFollowUpScenario.ts`, compared with the base in the same load window |

## Decisive premises

Observed in this preparation's workspace at `7cf81190b` on 2026-11-12, Node
24.21.0, after `node scripts/setup-native.mjs npm`, `browser` and `check`,
while other work held the one-minute load at 18–51. Scratch specs were removed
before recording. Direct runs used
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- <spec> --workers=<n> --reporter=list`.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The four specs fail under load on the base | The story; slice 6's comparison | The four specs, `--workers=2 --trace=on`, load 25.1 → 30.0 | Settled: 5 of 7 passed in 107 s. Intent journey 31.8 s, at the bound in its keyboard tab loop, page first opened at 22.2 s. Phone journey 31.5 s, at the bound in its progress poll (`:52`) after a 4.9 s rerun-count poll and a 13.2 s `dashboard` fixture. Lifecycle 29.6 s and refused 27.4 s, each first in its worker with 8.9 s of `origin` fixture; uncertain 16.7 s; saved-request cases 4.8 and 6.4 s |
| A journey's time is provider calls | Every slice's approach | Scratch spec with laps and `github.calls` by kind, one worker, load 27.4 → 51.1 | Settled: 30 calls by the first outcome: 16 for five prior builds (3.9–4.9 s), 9 from receipt to rerun request (3.4–4.2 s with priors already kept, 8.6 s without), 5 for the outcome pass (4.6–5.3 s after the provider changed). Scenario 3.1–5.5 s; server and switch 2.0–2.9 s, 7.4 s for the run's first case |
| An unspent eligible receipt admits without ingestion | Slice 2 approach and sizing | Slice 1 scratch case `backend-tests/intent/zz-scratch-599-p1.spec.ts` (`startServer` of `landedCiHistoryTest.ts`), all before any server: `completedPublishedStory(origin, "trunk", …, { interleaved: false, retainWorkspace: true })`; the capture through `makeMe.aLaunchLanding.capturedFrom({ repository: commonGitDir(origin.project), identity: queuedIdentity }).forLaunch(…).deliveredAs({ delivery, receipt }).comparing({ base: <completion>^, revision: completion }).receivedAt(now)`; the history through `makeMe.aLandedCiHistory`: five `.measuredLanding({ receipt, revision, receivedAt, target: "refs/heads/main", runId, startedAt, completedAt })` at revisions no repository holds (`"0…01"`–`"0…05"`), each with `.proofFor(key, { kind: "summary", summary: usableProofOf(run).summary })`, then `.recording(capture, "run/71/1", makeMe.aKeptBuild.with({ revision, state: "pass", runUrl, runId: 71, runAttempt: 1, runBranch: "main", startedAt, completedAt, proof, proofPending: false }))` and `.inTrunkOrder([...priors, completion])`, kept with `keepLandedCiHistory(machineHome(origin.machine), …)`; the ledger written to `followUpFile({ home })` as `{ projects: { "open-dough": { enabled: true, authority: hostname() } }, landings: { [followUpKey("open-dough", capture)]: makeMe.aCiFollowUpEntry.with({ project: "open-dough", revision, target, identity: queuedIdentity, receipts: [receipt], eligible: true, capture }) } }`; the provider as `providerRepeatRun(completion, 71, { ...passedFrom("2026-11-10T06:00:00.000Z", 120000), workflowId: 7001, url, headBranch: "main" })` under one answerer that answers `actions-workflow-rerun` with 403, then `provider.answer`, then `trunkActions([provider.latest()], provider.proofs())`, then `publishes`. Then `startServer()`. Command `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- backend-tests/intent/zz-scratch-599-p1.spec.ts --workers=1 --reporter=list`. Load 32.2 → 36.5, and again 11.2 → 9.7 | Settled: one rerun request for run 71, 1.9 s after the server started (0.9 s at load 11), after exactly 5 calls (`actions-workflow`, `-current-run`, `-run-attempt`, `-attempt-jobs`, `-workflow-rerun`); refused card 0.5 s later with `originalMs: 120000`, `averageMs: 100000`, `kind: "unverified"`; the saved request `refused` with the product's own reference (`sampleCount: 5`, six evidence rows); the original still read after follow-up was turned off; no second request. Case 14.6 s first in its worker at load 32–36, 6.0 s at load 11. No launch record and no launch attempt is kept; the prior builds need no commit, because the kept `trunkOrder` already places the landing. A kept build without `proof` would be asked for its proof and excluded from the average (`needsCollectedProof`, `wallTimeReadingOf`; read, not run). Not run: the 503 reply and its later 104 s repeat from this stage |
| A card needs a published completion and a saved request, no journey | Slices 3–4 approach | Scratch case: `completedPublishedStory`, one accepted request for its completion through `repeatLedgerFacts()` and `aCiFollowUpEntry` with `identity`, `serveRepeatRuns`, `setRepeat({ seconds: 106 })`, `startServer()`, poll `followUpSettings` | Settled: slow card with `originalMs`, `averageMs`, `repeatMs: 106000` 3.5 s after the server started, 5 calls, case 10.0 s at load 39.7 → 50.2 |
| A page-fixture server already running observes a request saved later | Slice 4 approach | Slice 1 scratch case `tests/intent/zz-scratch-599-p3.spec.ts`, `test` of `preparationPage.ts` with `extraEnv: recheckingLandedCi`, the `dashboard` fixture already running: the kept landing of the "unspent eligible receipt" row at 105 s with the accepted request added to its ledger entry (`makeMe.aCiRepeatRequest.with({ repository: "terryyin/open-dough", workflow: "ci.yml", workflowId: 7001, original: <the kept build>, reference: <frozen: endpoint, selected, evidence, sampleCount, medianMs, averageMs, from, to, difference>, rule, originalJobs: [makeMe.aGitHubJob…], requestedAt, submission: { kind: "accepted", explanation }, outcome: { kind: "unverified", explanation } })`), no launch record; then `publishCommittedOrigin(page, { repoDir: origin.origin, revision: completion, repository, follows: true, realHistory: true })`; then the provider's answerer served over it, keeping the answerer `github.serve` returned as its fallback (what `scenario.serve()` does); `setRepeat({ status: "in_progress" })`, poll `followUpSettings(dashboard)` for `progress`, `page.clock.install()`, `page.goto`, the card; `setRepeat({ seconds: 106 })`, poll for `slow`, `page.clock.runFor(15000)`, the card. Command `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- tests/intent/zz-scratch-599-p3.spec.ts --workers=1 --reporter=list`. Load 39.4 → 29.6, and again 11.2 → 9.7 | Settled: the Recently done card of Story A reads "CI rerun in progress", then "Possible CI slowdown" with the red warning (`rgb(220, 38, 38)`), "Original 1 min 45 s", "Repeat 1 min 46 s", "Saved average 1 min 40 s" and Done; no rerun request. Case 7.4 s at load 39 → 30, 5.8 s at load 11; progress read 0.7–0.8 s after the save, each card within 1.0 s of its read. The same with a Done launch record (`makeMe.aLaunchRecord.executing(…).launchedAt(…).landedAt(completion, { receipt, identity }).markedDoneAt(…)`) also renders the card: the record is not needed. Why a slow card stayed away: `github.serve` keeps one answerer for the repository, and `publishCommittedOrigin` and `serveRepeatRuns` each replace it. Committed origin after the provider: 32 `actions-current-run` calls, none answered by the provider, the request stays "The requested repeat could not be observed; timing is unverified", 5.1 s. `serveRepeatRuns` after the committed origin: collection reads `slow` in 0.8–1.4 s and the page lists no article at all, because the page's `content` and `listing` reads fall to `publishes`. Not reproduced: a pass that makes no provider call at all; the earlier arrangements are not on record. Not run: the phone viewport, the sideways-scroll check and the caution text. The ledger was written in place while the server collected; `keepMachineDocument` holds the lock a running server's writers hold |
| Five prior builds kept, not collected, admit a new receipt | Slice 3 sizing (the journey inside 15 s) | Slice 1 scratch cases in `backend-tests/intent/zz-scratch-599-p2.spec.ts`. First: `prepareRepeatScenario(origin, github)` unchanged, then, before any server, its priors kept through `makeMe.aLandedCiHistory`: for `scenario.prior[index]`, `.measuredLanding({ receipt: "bbbbbbbb-0000-4000-8000-0000000000NN" with NN = prior.length - index, revision: run.headSha, receivedAt: minutesAgo(NN), target: "refs/heads/main", runId: run.id, startedAt, completedAt })` with `.proofFor("run/<id>/1", { kind: "summary", summary: usableProofOf(run).summary })`, `.inTrunkOrder(prior revisions)`, `keepLandedCiHistory`; then `startServer()`, `followUpSettings(server, true)`, `scenario.ingest(server)`, wait on `holdSubmission`. Second: the same five builds kept at revisions no repository holds, the story published, the same ingestion. Command `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- backend-tests/intent/zz-scratch-599-p2.spec.ts --workers=1 --reporter=list`. Load 38.0 → 38.2, and again 11.2 → 9.7 | Settled for prior builds whose commits are on trunk: no call before ingestion, 9 calls from receipt to rerun request (`actions-workflow`, `-runs`, `-run-artifacts`, `-artifact-zip`, `-workflow`, `-current-run`, `-run-attempt`, `-attempt-jobs`, `-workflow-rerun`), receipt to request 1.7 s at load 38 and 1.2 s at load 11, the saved reference with `sampleCount: 5`, `averageMs: 100000`; case 9.6 s first in its worker at load 38. Beside it, a journey that collects its priors made 28 calls to the request with six priors (`journey-bytes/calls.json`) and 25 with five (16 + 9, the "provider calls" row). False for prior builds at revisions no repository holds: the ingested landing is kept `{ kind: "pending", waitsFor: "order" }` and no request is sent. `readLandingOrder` must find the new landing and every measured prior in one local repository; the kept `trunkOrder` cannot place a landing it does not hold. So the journey keeps `landedTrunk`'s real commits (`prepareRepeatPriors`) and replaces only their collection. Enabling follow-up after the history is kept writes each prior an `eligible: false` ledger entry, as the journey does today. Not run: the 105 s threshold, the held submission and the second dashboard over kept priors |
| A settled request with its reference and kept proof reads in a non-collecting server with no journey | Slice 5 approach | Slice 1 scratch case `tests/intent/zz-scratch-599-p4.spec.ts`: `test` of `preparationPage.ts` with its `dashboard` fixture replaced by `startLandedCiReader({ github }, origin, "preview")`, so no collecting server ever runs; `publishIntentTrunk(origin.project)`; the published story; the ledger alone, with `projects: { "open-dough": { enabled: false, authority: hostname() } }` and the entry of the "unspent eligible receipt" row whose request is `submission: accepted`, `original` the 120 s kept build with its `proof`, `reference` frozen with six priors (five `included`, `run/6/1` at 116 s `excluded` with `reason: "Slow outlier: more than 15% above the median"`, `run/71/1` `selected`, `sampleCount: 5`), and `outcome: { settled: true, kind: "recovered", explanation: "CI timing returned to range", observed: { runId: 71, runAttempt: 2, revision, workflowId: 7001, status, conclusion, runUrl, startedAt, completedAt }, repeat: <attempt 2 kept build, 100 s, with its proof> }`; no history file, no launch record; `publishCommittedOrigin` then the provider over it. Command `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- tests/intent/zz-scratch-599-p4.spec.ts --workers=1 --reporter=list`. Load 10.6 → 11.2, and again 11.2 → 9.7 | Settled: the card reads "CI timing returned to range" and Done; the comparison reads both attempts with revision, workflow, start times, wall times, differences and completeness, both exact attempt links, the saved rule, "5 prior builds used", seven evidence rows with the outlier's reason, focus from attempt 1 to attempt 2 to the reference disclosure, no sideways scroll at 390 px; `expectOriginalProofNavigation` passes unchanged ("2092 passed test cases", the original's link, no repeat link); refresh, reload and back return the same comparison. Actions calls 0 before and 0 after; 13 `gh` calls in all, of kinds `ref`, `content`, `listing`, `tree`. Case 16.0 s first in its worker (8.4 s from arrangement to the last expectation), 7.2 s after another case. The reading and the proof navigation read the ledger entry only: `original.proof` and `outcome.repeat.proof` are the proof (`dashboard/server/ciFollowUpReading.ts`). Not run: the tab loop over the evidence links, the Development selection and return (C21), and the same case with the history file kept |
| Faults F1–F11 fail their named owners | Coverage rows C2, C5, C8, C11, C12, C14, C15 | Retained: SEED-314's plan 595 at `165d803c`, slices 3–4 accepted proof; `git diff --stat 165d803c HEAD` is empty for both backend specs, `dashboard/tests/support/ciFollowUp{Scenario,SavedRequests,RepeatRun,Priors,ProviderVerdict}.ts`, `dashboard/server/ciFollowUp*`, `dashboard/src/ciFollowUp*` and `ciFollowUpLedgerFacts.mjs` | Settled by citation: F1 lifecycle by the bound; F2 lifecycle and refused with `[71, 71]`; F3 lifecycle; F4, F5, F6b, F7 the saved-request case by outcome; F8 refused; F9 uncertain; F10, F11 the verdict case by conclusion. Above load 40 F2 on the lifecycle journey passed once; read it on the refused owner |
| No shard weight names the four specs | Slice 6 | `grep -rn` of the four spec names under `dashboard/longest-first*` | Settled: no match |
| The repeat script reports load and runs at two workers | Slice 6 route | Read `scripts/dashboard-repeat.sh` header: local default worker count, load before and after per run, `--load` burners; plan 595 ran it with these spec paths | Settled for the route by citation (plan 595, "Run 1 under burners: exit 1, 182 s, load 22.38 -> 40.25") |

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos);
on battery, plug in or start fully awake with the lid open under
`caffeinate -i` and read the sleep log afterwards. The
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every delegation and repair handoff.

Commands, from the repository root, with Homebrew Bash first on `PATH`:

- Selection: `npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts tests/intent/intent-ci-follow-up.spec.ts`,
  plus any spec file a slice adds for a divided case, with `--workers=1` or
  `--workers=2` and `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file>` for durations.
  A run that writes a proof record passes no `--reporter`: `--reporter=list`
  replaces the configured reporter that writes it.
  Three consecutive passes after a change to a case or its support.
- From an agent shell, prefix direct runs with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
- Consumers of the repeat scenario: every spec that imports
  `ciFollowUpScenario.ts`, at `--workers=2`, compared with the base worktree
  in the same load window, at two workers and at one.
- Node consumers of the ledger facts:
  `bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-reading.test.mjs tests/support/ci-follow-up-policy.test.mjs`.
- Fault controls: one scratch product edit, the named case with
  `--reporter=list`, record which case fails and at which expectation, revert
  before the next. Run them at a one-minute load of about 27 or less, where a
  single case attributes.
- Profile runs: two workers at a one-minute load of 30–50 before and after. A
  scratch loop in the job's temporary directory reads `uptime` and starts
  `bash scripts/dashboard-repeat.sh 1 <specs>` only inside the profile; below
  30 it adds `--load`. A run outside the profile is recorded and not counted.

Typecheck and lint through the ordinary commit hooks. No whole local suite is
required: the changed support serves the selection and the scenario's
consumers. Hosted CI runs the whole suite on the published revision, and its
failures stay the executor's.

Fault controls, each a scratch product edit reverted before any commit.
F1–F11 are plan 595's, in `dashboard/server/ciFollowUpObservation.ts`,
`ciFollowUpCollection.ts`, `ciFollowUpAdmission.ts` and
`dashboard/src/ciFollowUpRule.ts`:

| Fault | Regression | Scratch edit |
| --- | --- | --- |
| F1 | An original at exactly 105 s is not admitted | `>=` becomes `>` in `reachesFollowUpThreshold` |
| F2 | A later pass sends a second request | Drop the `admitted.request !== undefined` guard in `collectCiFollowUps` and in `spendRepeat` |
| F3 | A 106 s repeat is not slow | `slow` is always false in `observeRepeat` |
| F4 | A 104 s repeat stays slow | `slow` is always true |
| F5 | A failed repeat is measured as a pass | `failure` passes the `conclusion !== "success"` branch |
| F6b | A cancelled repeat is measured as a pass | The cancelled branch never matches and `cancelled` passes |
| F7 | Carried-forward jobs count as a full repeat | `fullRepeatJobs` is not consulted |
| F8 | A refusal is saved as accepted | A refused reply is treated as accepted in `collectCiFollowUps` |
| F9 | A later passing repeat clears an uncertain acceptance | Drop the `submission.kind !== "accepted"` return after measurement |
| F10 | A repeat with no verdict reads as failed | The absent-conclusion branch counts as failed |
| F11 | An unknown conclusion reads as failed | `failed` is always true |
| F12 | Two dashboards both spend | `spendRepeat` returns true without the ledger's guard |
| F13 | Follow-up starts enabled | The settings read answers `enabled: true` with no saved setting |
| F14 | The request is sent before the intent is saved | `spendRepeat` moves after `repeatGitHubWorkflow` |
| F15 | A request with a published completion shows no card | `completedFollowUps` selects nothing |
| F16 | An in-progress repeat is not read as progress | The progress kind is never produced in `observeRepeat` |
| F17 | The repeat replaces the original in history | Collection keeps the repeat's attempt as the landing's build |
| F18 | Turning follow-up off drops the saved request | `saveFollowUpSetting` deletes entries that hold a request |
| F19 | The slow card renders without its warning | The warning's kind test never matches in the card component |
| F20 | The comparison drops the reference evidence | The reading omits `reference.evidence` |
| F21 | Opening the comparison asks CI | The reading route starts an Actions read |
| F22 | The repeat's proof is offered as the original's | The proof link uses the repeat attempt |
| F23 | A new Development selection keeps `followUp` in the address | The selection handler leaves the parameter |
| F24 | An attempt link leaves the tab order | `tabindex="-1"` on the repeat's link |

For F12–F24 the executing slice locates the exact line; where the named edit
does not exist as described, it chooses the nearest single edit that produces
the named regression and records it.

## Ordered slices

### 1. The base and the kept-state premises are on record
Type: Behavior
Status: done
Proof: The plan records the base revision, whether the paths named in
[Architecture and reuse](#architecture-and-reuse) differ from `7cf81190b`,
whether the base holds SEED-287's `collectPriors`, and one proof record of the
seven cases on the base. For each of the four unverified premise rows it
records a scratch case, its command, the load and the result. A detached base
worktree outside the workspace, set up with `setup-native`, stays runnable for
slices 2, 3 and 6 and is removed after slice 6.

Behavior: Main as it is at Take → the probe runs → the base, the seven case
durations and the four premise results are recorded, and any slice a false
premise reaches is revised before it starts.

This is an authorized early probe. The four premises, each as one scratch case
that is deleted afterwards:

- **Eligible receipt through MakeMe.** A published completion, a kept history
  of five 100 s builds and the landing's 120 s build, their launch records,
  and a ledger entry with `eligible: true`, its `capture`, `receipts` and
  `identity`, follow-up enabled and no request, all arranged with no server
  running → a collecting server starts → one rerun request arrives.
- **Kept prior builds admit a receipt.** The same kept history without the
  landing → a server starts, follow-up is enabled, the real receipt is
  ingested → one rerun request arrives; record the receipt-to-request time and
  call count beside the base's.
- **The card in the page.** An accepted request for a published completion
  and its Done launch record → the Recently done card renders "Possible CI
  slowdown" in the page. Find why `publishCommittedOrigin` before the save
  left collection silent, and record the arrangement that works.
- **The settled reading.** A settled recovered request with its frozen
  reference and repeat build, and whatever kept files the original's proof
  navigation reads → `startLandedCiReader` → the comparison, the reference
  evidence and the proof navigation read with no Actions call.

A premise that does not hold stops the slices that consume it. Where the
state can only come from a journey's own bytes, record that and stop for the
coordinator: the story's "at most one journey" would no longer be reachable
for that case.

#### Slice 1 record

Observed on 2026-11-12, Node 24.21.0, while other work held the one-minute
load at 9–39.

- **Base.** Main at Take, `095f2bff9`. `git diff --stat 7cf81190b 095f2bff9`
  is empty for the four specs, `dashboard/tests/support`, `tests/support`,
  `dashboard/server` and `dashboard/src`: every path named in
  [Architecture and reuse](#architecture-and-reuse) is as the preparation
  read it, at the line counts named there. The base does not hold SEED-287's
  `collectPriors` (`git grep collectPriors 095f2bff9 -- dashboard tests`: no
  match).
- **Base worktree.** `/Users/terryyin/.claude/jobs/296b888d/tmp/base-599`,
  detached at `095f2bff9`; `node scripts/setup-native.mjs npm`, `browser` and
  `check` each exited 0 ("npm acquisition complete", Chromium 158.0.8127.18).
  It stays for slices 2, 3 and 6.
- **The seven cases on the base, two workers.** A proof record needs the
  configured reporter: `--reporter=list` replaces it and no record is written.

  | Case | With `--reporter=list`, load 15.5 → 25.3 | Proof record, load 21.1 → 18.5 |
  | --- | --- | --- |
  | Lifecycle journey | passed, 29.8 s | passed, 24.1 s |
  | Refused journey | passed, 27.1 s | passed, 22.6 s |
  | Uncertain journey | passed, 16.3 s | passed, 11.7 s |
  | Saved-request outcomes | passed, 4.8 s | passed, 3.5 s |
  | Verdict saved requests | passed, 6.1 s | passed, 3.9 s |
  | Intent journey | failed at the 30 s bound, 31.5 s, in `refresh.click()` (`intent-ci-follow-up.spec.ts:166`) | passed, 19.4 s |
  | Phone journey | failed at the 30 s bound, 31.1 s, in `warning.scrollIntoViewIfNeeded()` (`recently-done-ci-automatic-repeat.spec.ts:73`) | passed, 14.8 s |

  First run: 5 of 7 passed in 1.5 min, exit 1, log
  `/Users/terryyin/.claude/jobs/296b888d/tmp/base-599-run-w2.log`. Second
  run: 7 of 7 in 56.2 s, exit 0, record
  `/Users/terryyin/.claude/jobs/296b888d/tmp/base-599-proof-w2.json`. The
  base failed two cases below a load of 30, and passed one minute later at a
  like load: slice 6 cannot count on a load under 30 for a passing base.
- **The four premises.** Each row of
  [Decisive premises](#decisive-premises) now holds its scratch case, command,
  load and result. Three hold as planned. The fourth holds for prior builds
  whose commits are on trunk and is false for prior builds at revisions no
  repository holds; slice 3's journey keeps real trunk commits, so no slice
  stops. Every case passed twice. The scratch specs are deleted from the
  workspace.
- **One arrangement served all four.** A kept landing at a stage (prior
  builds only, eligible receipt, accepted request, settled request) is the
  history file, the ledger file and the provider's answerer, written before
  or after a server starts. No launch record, launch attempt or journey is
  needed at any stage, and the settled reading needs no history file.
  Scratch copy, not repository code:
  `/Users/terryyin/.claude/jobs/296b888d/tmp/slice1-scratch/` (`README.txt`,
  `specs/zzScratch599.ts`, the four specs, `laps.jsonl`, and
  `journey-bytes/`, the files a real journey left).
- **Orderings later slices keep.** In a page case `publishCommittedOrigin`
  comes first and the provider's answerer is served over it with the replaced
  answerer as its fallback. The ledger's project entry names
  `authority: hostname()`. The capture's `repository` is the origin project's
  common Git directory and its `base` the completion's parent, which
  `landingCompletesStory` reads. Every kept build carries its proof summary.

### 2. Provider replies are read from a kept eligible receipt
Type: Behavior
Status: done
Proof: The automatic-repeat spec passes three consecutive times with the
refused and uncertain cases starting from a kept eligible receipt; neither
calls `scenario.ingest`. F2 and F8 fail the refused case and F9 the uncertain
case, each at an expectation that names the promise; F18 fails the off-switch
read. A scratch saved entry that breaks the ledger schema fails its case. The
consumers of `ciFollowUpScenario.ts` give every case the base's result, and
the node consumers pass. The consumer-trace record gives every located
consumer a disposition.

Behavior: A machine keeps five measured 100 s prior builds, a Done landing
whose first attempt took 120 s for a published completion, and that landing's
unspent eligible receipt; the provider answers the rerun request with 403, or
with 503 and later a 104 s passing repeat → a production dashboard starts
there → the provider receives exactly one rerun request for run 71; the card
reads refused, or stays unverified and shows the 104 s repeat; each keeps the
120 s original and the 100 s average, also after follow-up is turned off; a
later pass sends nothing more.

- Extend the saved-state owner with the stage, under
  [Architecture and reuse](#architecture-and-reuse). State at the call site
  the facts that drive the case: the original's seconds, the average, the
  stage, the provider's reply.
- "A later pass sends nothing more" waits for an event: the provider's answer
  to a read made after the reply, then the exact count.
- The two journey variants leave only after their faults fail the new cases.

#### Slice 2 record

Observed on 2026-11-12, Node 24.21.0. Logs:
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice2/`.

- **The stage owner.** `keepRepeatLanding(origin, github, { stage, run,
  seconds, averageSeconds, beside })` in
  `dashboard/tests/support/ciFollowUpKeptLanding.ts` keeps Story A's landing
  at a stage; `"eligible receipt"` is the one stage so far, and a later stage
  adds what its ledger entry holds in `heldAt`. `keepRepeats` in the same
  module is the one writer of the ledger and the one place the provider is
  served; `saveRepeatRequests` states its landings to it through
  `heldRequest`. The prior builds are `ciFollowUpKeptPriors.ts`. The owner
  would have passed 250 lines in place, so the arrangement took these two
  modules. The provider's reply to the rerun request is
  `providerRepeatRun(...).replyToRerun(status)`.
- **Kept state.** History: five prior landings at revisions no repository
  holds, each with its build and CI proof, the story's landing recorded from
  its capture, and the trunk order. Ledger: follow-up enabled by this host,
  the five priors without eligibility, the story's entry eligible with its
  capture. Launch records: the five priors' and the story's, whose landing is
  the capture. The journey also leaves a launch attempt and the record's
  reporting context, which name a server's address; they are not kept. No
  expectation depends on the launch records: a collection pass and the
  off-switch read them, and slice 1 saw the same result without them.
- **A later pass after a refusal.** After a refused reply the product reads
  the provider no more, and after an uncertain reply only until the repeat
  settles the request, so no read marks a later pass. The refused case keeps
  a second landing's accepted request beside the story's (`heldRequest`, run
  72, repeat not started): every pass reads run 72 before it spends receipts,
  and the second such read after the saved reply shows a whole pass ended.
- **Three consecutive passes**, the automatic-repeat spec, two workers: load
  18.7 → 28.9, 28.9 → 32.8, 32.8 → 34.1; 4 of 4 each. Refused 16.4, 14.5 and
  11.0 s (first in its worker in the first two), uncertain 8.7, 9.6 and
  7.9 s. At load 4–5: refused 3.4–5.4 s, uncertain 2.6–3.6 s. One case of the
  spec calls `scenario.ingest`.
- **Faults**, one worker, load 4.4–6.5, each reverted before the next:

  | Fault | Scratch edit | Fails |
  | --- | --- | --- |
  | F2 | Both `admitted.request !== undefined` guards dropped | Refused case, "rerun requests": `[71, 71, 71, 71]` for `[71]` |
  | F8 | `submission.kind` saved as `accepted` when the reply is refused | Refused case, "saved reply": `accepted` for `refused` |
  | F9 | The `submission.kind !== "accepted"` return never taken | Uncertain case, "stays unverified": `recovered`, "CI timing returned to range" |
  | F18 | `saveFollowUpSetting`, turning off, deletes this project's entries that hold a request | Both cases, "follow-up off": no card |

- **Kept state the product refuses.** The story's entry with `eligible:
  "yes"`: both cases fail at "saved reply" with no request saved. A held
  request with `workflowId: "7"`: the refused case fails at "saved reply" and
  the saved-request case at "recovered".
- **Consumers.** The eight specs that import `ciFollowUpScenario.ts`, base
  `095f2bff9` then candidate, back to back:

  | Workers | Base | Candidate |
  | --- | --- | --- |
  | 2 | 20 of 20, 46 s, load 6.2 → 7.4 | 20 of 20, 42 s, load 7.4 → 7.0 |
  | 1 | 20 of 20, 79 s, load 6.0 → 5.0 | 20 of 20, 77 s, load 5.0 → 5.4 |

  The node consumers passed (exit 0). Not compared at a load of 30–50.
- **Consumer trace**, `--base ccc7ea6e6` with the exports of the changed
  modules as terms (`slice2/consumer-trace.md`). Run:
  `landed-ci-automatic-repeat.spec.ts`, `landed-ci-repeat-verdict.spec.ts`
  (`saveRepeatRequests` and its readers). Reused, with their eight importing
  specs run in the comparison: `ciFollowUpScenario.ts` (`providerRepeatRun`,
  whose rerun reply it answers itself before asking the provider), and
  `ciFollowUpLedgerFacts.mjs` with the three node tests. Excluded, the effect
  does not reach them: every other listed file matches only a field name the
  product already has (`workflowId`, `headBranch`, `runBranch`, `averageMs`,
  `originalMs`, `repeatMs`, `proofPending`, `heldAt`) or imports
  `machineLaunchRecords.ts`, which is unchanged; planning records and
  evidence name the spec's path only.

#### Slice 2 acceptance and refactor

- Accepted: the refused case marks "a whole later pass" by the second read of
  a waiting accepted request's run 72 after the saved refusal, because the
  product reads the provider no more after a refusal.
- The refactor pass gave the story landing's run facts one home
  (`storyLandingRun` in `ciFollowUpRepeatRun.ts`, used by
  `prepareRepeatScenario` at its provider construction only) and one reader of
  rerun requests (`rerunRuns`; `rerunRequests` is gone, the verdict spec uses
  `rerunRuns`). The eight specs importing `ciFollowUpScenario.ts` passed 20 of
  20 afterwards at two workers, load 4.2 → 6.6.
- For slice 3: `scenario.refuse` has no caller left and leaves with the
  journey's edit; `keptPriors` takes real trunk revisions for the journey; the
  automatic-repeat spec is at 246 lines, so the accepted-request case needs
  the lifecycle case smaller or its own file.

### 3. One journey, and an accepted request's later reads from kept state
Type: Behavior
Status: planned
Proof: The automatic-repeat spec passes three consecutive times. One case in
it calls `scenario.ingest`. F1, F8, F14 and F15 fail the journey; F3, F16,
F17 and F2 fail the accepted-request case, each by promise. F12's result
decides C5's second dashboard and is recorded. No expectation in either case
follows a provider change without a wait on the provider's answer or the saved
request. Consumers of `ciFollowUpScenario.ts` give the base's results.

Behavior, the journey: A machine keeps five measured 100 s prior builds and
follow-up is off → the machine enables it and a Done receipt for a 105 s
landing is ingested → the intent is saved while the request is held, exactly
one rerun request for run 71 arrives, a repeated acceptance sends nothing, the
accepted request is saved after the reply, and its card is read.

Behavior, later reads: A machine keeps an accepted request for a published
completion, 105 s against 100 s, with its kept history → a production
dashboard starts and the provider's repeat is in progress, then passes in
106 s → the card reads "CI rerun in progress", then "Possible CI slowdown"
with 105 s, 106 s and 100 s; history still selects `run/71/1` at 105 s; the
provider receives no rerun request.

- Both behaviors are one proof loop: the lifecycle case divides into them, and
  nothing leaves the journey before its fault fails the accepted-request case.
- The journey's prior builds are kept, not collected: slice 1 settled that
  for prior builds at `prepareRepeatPriors`' real trunk commits (9 calls from
  receipt to request against 25) and found it false at revisions no
  repository holds. Keep those commits and replace only their collection.

### 4. The machine setting and the phone warning are read without a journey
Type: Behavior
Status: planned
Proof: The recently-done spec passes three consecutive times with two cases
and no `scenario.ingest`. F13 fails the settings case; F3, F16 and F19 fail
the warning case. The spec holds no poll of `repeatCalls.length`.

Behavior, the setting: Open Dough's row in Settings → the user enables
automatic CI follow-up → the row reads Off, then On with "Provisional rule:
repeat once at or above 5%".

Behavior, the warning: Story A is published as completed and the machine
keeps an accepted request for it, 105 s against 100 s → the provider's repeat
is in progress, then passes in 106 s, and the Recently done card is read on a
phone → "CI rerun in progress", then a red textual warning with Original
1 min 45 s, Repeat 1 min 46 s, Saved average 1 min 40 s and "does not prove a
regression or its cause", Done, without sideways scroll.

- Reuse slice 3's accepted-request stage and slice 1's working page
  arrangement.
- The page's own refresh keeps the controlled clock the case has today.

### 5. The Intent reading starts from a settled request
Type: Behavior
Status: planned
Proof: The Intent follow-up cases pass three consecutive times; none calls
`scenario.ingest` or starts a collecting server. F20, F21, F22, F23 and F24
each fail the case the coverage map names. Every case counts Actions calls
before and after and expects no change.

Behavior: A machine keeps a settled recovered request for a published
completion, 120 s then 100 s, with its frozen reference of five prior builds
used and one 116 s outlier excluded → a dashboard that collects nothing opens
the card on a phone →
- reading: both attempts with their revision, workflow, times, completeness
  and exact links, the saved rule, seven evidence rows with the outlier's
  reason, keyboard order, no sideways scroll (C18, C22);
- proof: the original's proof is navigable from Changed tests and the
  repeat's is not offered (C20);
- return: refresh, reload and revisit show the same comparison (C19), and a
  new selection in Development yields to normal Intent while the card reopens
  the comparison (C21).

- Three cases over one arrangement, each with one page journey. A case that
  still exceeds 15 s away from first-in-worker in slice 6 divides again at a
  navigation boundary.
- When the spec would pass 250 lines, the cases divide into files by the
  three groups above.

### 6. The fit under load and the saving are measured and kept
Type: Behavior
Status: planned
Proof: Three consecutive counted two-worker runs of the selection at a
one-minute load of 30–50 pass; from their proof records and traces no case
exceeds 15 s, or 25 s when first in its worker. One case calls
`scenario.ingest` across the selection, against five on the base. Paired
one-worker base and candidate runs, three passing observations each: the
candidate's median wall time is at most two-thirds of the base's. Supporting
count: fake `gh` calls summed over one one-worker run, base and candidate. The
diff adds no `test.setTimeout`, expectation timeout, `test.slow`, sleep,
retry, skip or runner mode, and no shard weight names the specs. Hosted CI
passes on the published revision.

Behavior: The base worktree and the finished candidate run under like
conditions → the comparison is recorded in this plan → the fit in the profile
and the saving are observed with every preparation and teardown paid.

- Slice 1 saw the base fail two cases at load 15.5 → 25.3 and pass a minute
  later at 21.1 → 18.5, so no load guarantees a passing base. Take the
  pairs in a window where it passes; a base that gives no three passing
  observations is recorded with its failures, the comparison uses the base
  runs that passed, and a miss is not rounded up: record and stop for the
  coordinator's decision.
- A candidate case that fails or exceeds its figure in the profile is a
  failing test under the policy above, repaired before this slice is done.
  Where the excess is first-in-worker preparation alone, measured from the
  case's `Before Hooks` step, SEED-287's active execution owns that repair:
  preserve its files, write no duplicate, and report that owner and the
  remaining gate as the coordination boundary.

## Current decisions

- One model, a kept landing at a stage, serves every non-journey case. No
  per-case fixture.
- The journey ends at the accepted request's card. Everything a later pass
  does is read from an accepted request.
- Provider replies keep the real rerun request. They start from a kept
  eligible receipt, not from ingestion.
- The two existing saved-request cases and the verdict spec stay as they are.
- F1 still fails by the 30 s bound, as on main.
- The 15 s and 25 s figures and the 30–50 profile are this preparation's
  reading of "moderately high" and "wide margin"; changing them is a seed
  edit.
- Story Branch Mode. No slice acts from trunk.
- Fault controls are scratch product edits in the execution workspace,
  reverted before any commit. Product code does not change.

## Plan concern assessment

Slice-plan refinement was not needed: six slices exercise one model, each has
one proof loop, and the four premises still open are bounded by the early
probe in slice 1. This review found no remaining slice-specific concern
outside that probe and one named boundary:

- Slices 2–5 start from kept state arranged through MakeMe, observed so far
  only from a journey's own bytes or through the settings read, and slice 5's
  reader route is unobserved. Slice 1 settles each before its consumer starts
  and stops the consumer when a premise fails.
- Slice 6's 25 s first-in-worker figure includes preparation that SEED-287
  owns and is executing. The slice measures that share and names the
  coordination boundary.

## Execution notes

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior gate.
- Shared `makeMe` arranges domain data. No sleeps, `test.slow()`, or suite,
  file, group or hook timeout overrides.
- Timed runs are relative. Record the one-minute load before and after every
  timed run; attribute cost per phase with laps or `test.trace` steps rather
  than waiting for an idle machine.
