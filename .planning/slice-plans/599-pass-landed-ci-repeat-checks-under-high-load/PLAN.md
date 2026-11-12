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
  with [intent-ci-follow-up-proof.spec.ts](../../../dashboard/tests/intent/intent-ci-follow-up-proof.spec.ts)
  and [intent-ci-follow-up-return.spec.ts](../../../dashboard/tests/intent/intent-ci-follow-up-return.spec.ts),
  the files its cases divide into (slice 5)

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
| C4 | The accepted request is saved after the reply | Lifecycle journey | The journey | F8b |
| C5 | A repeated acceptance and a second dashboard on the machine send nothing more | Lifecycle journey | The journey keeps the repeated acceptance; the second dashboard is `tests/support/ci-follow-up-ledger.test.mjs` "two independent processes serialize spend", which F12 fails (slice 3) | F2, F12 |
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

- Selection: `npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/intent-ci-follow-up-proof.spec.ts tests/intent/intent-ci-follow-up-return.spec.ts tests/intent/intent-project-scope-timing-refresh.spec.ts`,
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
| F8b | An accepted reply is not saved | `updateRepeat` is skipped when the reply is accepted (slice 3: F8 cannot fail a journey whose provider accepts) |
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
Status: done
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

#### Slice 3 record

Observed on 2026-11-12, Node 24.21.0. Logs:
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice3/`.

- **The division.** The lifecycle case is two cases. The journey stays in
  `landed-ci-automatic-repeat.spec.ts` and is the one case there that calls
  `scenario.ingest`. The accepted request's later reads are
  `dashboard/backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts`:
  both in one file would pass 250 lines, and the new file holds what a
  dashboard reads after an accepted request for a published completion. The
  [Verification](#verification) selection includes it. No shard weight or CI
  configuration names either spec.
- **The journey's prior builds.** `keepRecordedPriorsMeasured(origin,
  revisions, seconds)` in `ciFollowUpKeptPriors.ts` keeps the landings the
  machine's launch records hold at `prepareRepeatPriors`' trunk commits as
  measured, through the same `keptPriors` that serves the kept landing;
  `keptPriors` takes its landings, and `landingsNoRepositoryHolds(count)` are
  the ones at revisions no repository holds. `prepareRepeatPriors` and its
  return are unchanged.
- **The stage.** `"accepted request"` joins `"eligible receipt"` in
  `ciFollowUpRepeatStage.ts`, where `heldAt` now lives: the request as
  collection saves it after an accepted reply, through
  `makeMe.aCiRepeatRequest`, naming the kept original build, its job and the
  reference `keptPriors(...).referenceFor` freezes (five included rows, the
  selected row, sample count, median, average, from and to; no `difference`).
  `keepRepeatLanding(origin, github, { stage: "accepted request", run: 71,
  seconds: 105, averageSeconds: 100 })` is the whole arrangement.
- **A whole pass.** Every collection pass reads an unsettled accepted
  request's run once before it spends receipts. `aWholePass` waits for the
  second read of the run of a waiting request no pass can spend on: another
  landing's accepted request for run 72 (`heldRequest`), which no story
  published and the history keeps no build of. The journey, the
  accepted-request case and the refused case each keep it and then count
  rerun requests. The journey keeps it with `saveRepeatRequests` before the
  server starts and serves the scenario's provider again over it
  (`scenario.serve()`). The landing's own run 71 does not mark a pass: under
  F2 a pass reads it (`actions-current-run`), asks for the workflow, reads it
  again while preparing the request, reads the attempt and its jobs, and only
  then sends, so its second read came before the rerun request. On the
  correct product the waiting request adds one provider call a pass: the
  journey went from 13 calls to 18 and the accepted-request case from 9 to
  15, with case times unchanged at load 4–5 (4.0–4.4 s and 2.9–3.1 s).
  The accepted-request case starts with the repeat not begun: with the repeat
  already at attempt 2 the product prepares no request, and F2 passed.
- **C5 and F12.** F12, `admitted.request !== undefined` dropped from
  `spendRepeat`'s guard, fails
  `tests/support/ci-follow-up-ledger.test.mjs` "two independent processes
  serialize spend" with `[true, true]` for `[false, true]`, and
  "interruption after durable spend". The second dashboard leaves the
  journey; that node test owns it, unchanged. The journey keeps the repeated
  acceptance.
- **Faults**, one worker, both specs, each reverted before the next; `git
  diff --stat -- dashboard/server dashboard/src` empty afterwards. Load
  3–27.

  | Fault | Scratch edit | Fails |
  | --- | --- | --- |
  | F1 | `>=` becomes `>` in `reachesFollowUpThreshold` | The journey, at the 30 s bound, waiting for the held request |
  | F8 | A refused reply saved as `accepted` | The refused case, "saved reply". Not the journey: its provider accepts |
  | F8, the journey's | An accepted reply is not saved (`updateRepeat` skipped when the reply is accepted) | The journey, "accepted saved after the reply": `intent` for `accepted` |
  | F14 | `spendRepeat` moved after `repeatGitHubWorkflow` | The journey, "intent saved before the request is sent": `nothing saved` |
  | F15 | `completedFollowUps` selects no landing that holds a request | The journey, "accepted request's card"; also the refused, uncertain and accepted-request cases at their cards |
  | F3 | `slow` always false in `observeRepeat` | The accepted-request case, "slow card" |
  | F16 | The in-progress branch answers `unverified` | The accepted-request case, "progress read": `unverified` for `progress` |
  | F17 | `withOriginalFollowUpSamples` takes `request.outcome.repeat` before `request.original` | The accepted-request case, "original kept" |
  | F2 | Both `admitted.request !== undefined` guards dropped | The accepted-request case, "no second request": `[71]` for `[]`; the journey and the refused case, "rerun requests"; each in three of three runs, load 3.9–4.7 |
  | F9 | The `submission.kind !== "accepted"` return never taken | The uncertain case, "stays unverified" |
  | F18 | Turning off deletes entries that hold a request | The refused and uncertain cases, "follow-up off" |

  F17 as named, collection keeping the repeat's attempt, has no single edit:
  a kept landing's build is not collected again, on the base journey
  either. The edit above is the nearest that makes history select the
  repeat. F4, F5, F6b and F7 stay settled by citation: the saved-request
  case and `keepRepeats` are unchanged.
- **Three consecutive passes**, both specs, two workers: load 3.5 → 3.7,
  3.7 → 3.9, 3.9 → 5.0; 5 of 5 each. Journey 4.0, 4.0 and 4.3 s,
  accepted-request case 2.8, 3.4 and 3.4 s. An earlier form passed at load
  14.7 → 19.5 with the journey at 11.7 s and the accepted-request case at
  8.0 s. With the waiting request as the marker, both specs and the verdict
  spec, two workers: load 4.8 → 5.2, 5.2 → 5.0, 5.0 → 5.4; 6 of 6 each.
  Journey 4.1, 4.0 and 4.4 s, accepted-request case 2.9, 2.9 and 3.1 s. Not
  run at a load of 30–50.
- **Consumers.** The eight specs that import `ciFollowUpScenario.ts`, base
  `095f2bff9` then candidate with the new spec, back to back:

  | Workers | Base | Candidate |
  | --- | --- | --- |
  | 2 | 20 of 20, 40 s, load 4.9 → 6.3 | 21 of 21, 40 s, load 6.3 → 5.5 |
  | 1 | 20 of 20, 73 s, load 5.5 → 4.4 | 21 of 21, 74 s, load 4.4 → 4.3 |

  The node consumers passed (exit 0).
- **Consumer trace**, `--base 5fa058c0d` with the changed exports as terms
  (`slice3/consumer-trace.md`). Run: `landed-ci-automatic-repeat.spec.ts`,
  `landed-ci-repeat-accepted-request.spec.ts`,
  `landed-ci-repeat-verdict.spec.ts`. Reused, run in the comparison: the six
  other specs that call `prepareRepeatScenario`, none of which called
  `refuse`; `ciFollowUpLedgerFacts.mjs` and the three node tests. Excluded,
  the effect does not reach them: files that import the unchanged
  `landedCiHistory.ts`; files that match a field name the product already
  has, a `refuse(` or `heldAt` of their own, or the card's words; planning
  records and evidence that name the spec's path or its former title.
- **SEED-287's branch**, `codex/make-dashboard-journeys-fit-the-default-timeout`
  at `061775e97`, changes `ciFollowUpScenario.ts` and `ciFollowUpPriors.ts`
  since the merge base `caf48c6fa` and none of this slice's other paths.
  `git merge-file` of this slice's `ciFollowUpScenario.ts`, with
  `scenario.refuse` removed, against theirs: no conflict, `collectPriors`
  kept. `ciFollowUpPriors.ts` is unchanged here.
- For slice 4: a page case states `stage: "accepted request"`; the kept
  landing serves the provider through `serveRepeatRuns`, which still has no
  fallback answerer. `repeatCards(server)` reads the cards.

#### Slice 3 acceptance

- Accepted: F8 keeps its owner in the refused case; the journey's C4 is
  caught by F8b. The accepted-request case starts with the repeat not begun,
  waits a whole pass and expects no rerun, then reads progress and the 106 s
  repeat: with the repeat already in progress at start, F2 could not fail it.
- A fresh server on the kept accepted request is the restart the story names
  "from a saved accepted request".
- SEED-287 landed on trunk during this slice (`c744f46d1`, on trunk at
  `474669608`). Its change to `ciFollowUpScenario.ts` and
  `ciFollowUpPriors.ts` adds `collectPriors` and `untilCollected` and leaves
  what `prepareRepeatScenario` arranges as it was; `git merge-file` of this
  slice's two files against it is clean. Trunk is merged into the story
  branch after this slice, before slice 4, and the selection and the
  scenario's consumers run again on the merged state. Slice 6's base is then
  the merged trunk revision, in a new base worktree.
- For slice 5: the kept reference has no excluded outlier row and no
  `difference` yet.

#### Trunk merged after slice 3

Trunk at `8aa440077` (with SEED-287's `c744f46d1`) is merged into the story
branch as `fb3c669d6`, through the backlog merge adapter, with no conflict.
On the merged state: `typecheck:dashboard` clean; the nine specs that import
the repeat scenario or the kept-landing owner passed 21 of 21 at two workers
(load 4.2 → 11.3) and at one (11.3 → 9.3); the three node consumers passed.
The base worktree at `095f2bff9` no longer matches what the branch contains:
slice 6 compares against trunk at the revision last merged, in a new base
worktree.

### 4. The machine setting and the phone warning are read without a journey
Type: Behavior
Status: done
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

#### Slice 4 record

Observed on 2026-11-12, Node 24.21.0. Logs:
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice4/`.

- **The two cases.** `recently-done-ci-automatic-repeat.spec.ts` (107 lines)
  holds the settings case and the warning case, both at a 390 × 844
  viewport. Neither calls `scenario.ingest` and the spec holds no
  `repeatCalls`. The settings case arranges nothing: the row needs no
  request. The warning case is `publishCommittedOrigin` at the origin's
  `main`, followed, then `keepRepeatLanding(origin, github, { stage:
  "accepted request", run: 71, seconds: 105, averageSeconds: 100, otherwise:
  "as served before" })`.
- **Serving over an answerer.** `serveRepeatRuns` takes `otherwise`:
  `"published main"` (the default, as before) or `"as served before"`, which
  keeps the answerer `github.serve` returned for every request no run and no
  trunk Actions read answers. `keepRepeats` and `keepRepeatLanding` pass it
  on. It is stated, not automatic: the journey serves the scenario's
  provider over the kept waiting request's, and an automatic fallback there
  would send each answerer to the other. The committed origin is published
  before the story completes; it follows `main`, so the page reads the
  completion once it lands.
- **Writing while a server runs.** `keepRepeats` serves the provider first
  and then keeps the ledger through `keepMachineDocument`, so a running
  dashboard never reads an accepted request whose run nothing answers, nor a
  ledger written outside the lock. It is async; `saveRepeatRequests` is
  async with it and its three callers await it. Arranging before the server
  starts was not chosen: the `dashboard` fixture starts before the case
  body, and a fixture of this case's own would be a second arrangement. The
  launch records are still appended in place (`keepMoreLaunchRecords`), as
  page specs that keep records beside a running dashboard do
  (`recentlyDoneSessionsSidebarPage.ts`); no expectation reads them.
- **Waits.** After each provider change the case waits for the saved
  request: "progress saved" (`outcome.kind`), then "repeat saved"
  (`outcome.settled`), read from the ledger file. The page then reads its
  cards again under the controlled clock (`page.clock.runFor(15000)`).
- **On a phone.** With the viewport at 390 from the start the Board shows
  one column and Recently done lies outside the window (its warning at
  x 742–1048). The base's resize at the end left it there: `toBeVisible`
  and `expectNoSidewaysScrollIn(page, card)` pass on a clipped column. The
  case pages to the column (`showColumn(page, "Recently done")`) and expects
  the warning whole in the viewport (`toBeInViewport({ ratio: 1 })`) beside
  the sideways-scroll check.
- **Three consecutive passes**, two workers, each case first in its worker:
  load 15.6 → 19.5, 19.5 → 21.2, 21.2 → 23.7; 2 of 2 each. Settings 10.3,
  9.1 and 10.8 s; warning 16.6, 14.5 and 16.9 s. One worker, load
  23.7 → 22.2: settings 10.4 s first, warning 8.0 s second. At load 6–12
  before the column paging: warning 7.4–11.7 s.
- **In the profile**, one pass with 16 burners, two workers, proof record
  `slice4/loaded2-proof.json`, load 39.2 → 38.5: settings 14.2 s, warning
  21.3 s, each first in its worker. Not counted: one pass with 48 burners,
  load 33.2 → 51.6, where the warning case reached the 30 s bound in
  `showColumn` with 21.5 s in `Before Hooks` (`origin` 9.5 s, `dashboard`
  11.1 s) and 8.9 s of its body run; the settings case passed in 25.7 s. The
  warning case second in its worker is not measured in the profile.
- **Faults**, one worker, on the spec's final form, each reverted before the
  next; `git diff --stat -- dashboard/server dashboard/src` empty
  afterwards. Each failed at the named expectation, none at the case bound.
  Logs `slice4/final-F13.log`, `-F3`, `-F16`, `-F19`, `-FW`.

  | Fault | Scratch edit | Fails | Load |
  | --- | --- | --- | --- |
  | F13 | `enabled: setting?.enabled ?? true` in `ciFollowUpBoundary.ts` | The settings case, "off until enabled": the row reads "Automatic CI follow-up: On" | 34.0 → 27.9 |
  | F3 | `slow` always false in `observeRepeat` | The warning case, "slow card": "CI timing returned to range" | 27.0 → 26.7 |
  | F16 | The in-progress branch answers `unverified` | The warning case, "progress saved": `unverified` for `progress` | 26.7 → 31.5 |
  | F19 | `card.kind === "slow"` never matches before the caution in `CiFollowUpViews.tsx` | The warning case, "caution": the warning ends at its review link | 26.6 → 31.8 |
  | Wide warning | `.ci-follow-up-slow` gains `min-width: 480px` | The warning case, "warning whole on the phone": viewport ratio 0.64. Before the column paging the case passed under it | 27.0 → 24.3 |

  On an earlier form of the spec, before the column paging and the
  refactor pass, load 11–18:

  | Fault | Scratch edit | Fails |
  | --- | --- | --- |
  | F19, the colour | The card's class names `unverified` for a slow card | The warning case, "red warning": `rgb(29, 29, 27)` |
  | F2 | Both `admitted.request !== undefined` guards dropped | The journey and the refused case, "rerun requests"; the accepted-request case, "no second request". Not the warning case: its repeat has begun before a pass can prepare a request |
- **Consumers.** The nine specs that import the repeat scenario, the kept
  landing, the saved requests or the provider's run, two workers, load
  11.5 → 19.0: 22 of 22 in 1.8 min, with `intent-ci-follow-up.spec.ts`
  unchanged.
- **Consumer trace**, `--base fb3c669d6` with `keepRepeats`,
  `serveRepeatRuns`, `keepRepeatLanding`, `saveRepeatRequests` and
  `OtherAnswers` as terms (`slice4/consumer-trace.md`). Run:
  `landed-ci-automatic-repeat.spec.ts`, `landed-ci-repeat-verdict.spec.ts`,
  `landed-ci-repeat-accepted-request.spec.ts`,
  `recently-done-ci-automatic-repeat.spec.ts`. Reused, run in the nine:
  `ciFollowUpScenario.ts` (imports `json` and `storyLandingRun`, unchanged)
  with `intent-ci-follow-up.spec.ts` and the four other specs that import
  it; `ciFollowUpKeptPriors.ts` and `ciFollowUpRepeatStage.ts`, unchanged.
  Excluded, the effect does not reach them: files that match `realHistory`
  or `averageSeconds` as their own option or field, `committedOrigin.ts`
  among them, which is unchanged; files that match only `PLAN.md`; planning
  records, evidence and findings that name a spec's path.
- For slice 5: a reader case publishes the committed origin first and states
  `otherwise: "as served before"` to the kept landing; a settled stage is a
  third `RepeatStage`. The phone reading there needs the same look: a
  column the Board has paged away passes `toBeVisible`.
- For slice 6: first-in-worker preparation was 21.5 s of the one uncounted
  failure; the warning case took 8.0 s second in its worker at load 23.

#### Slice 4 acceptance and refactor

- Accepted with the five fault controls rerun on the spec's final form. The
  refactor pass changed one arrangement line (`originMain`).
- The base's phone check passed on a Board column the phone had paged away;
  the warning case now shows the column and expects the whole warning in the
  viewport.
- Open, owned by slice 6 (G1): in the refactor pass's three reruns at load
  27 → 49 from other work, with both cases first in their workers, the cases
  took 15.0–29.0 s and 28.2–29.7 s and the warning case failed once at the
  30 s bound in "progress saved". Before Hooks took 25.8 s in that run
  (`origin` 9.8 s, `dashboard` 14.6 s). SEED-287 has landed and closed, at
  load 20–30, so no active execution owns first-in-worker preparation now.

### 5. The Intent reading starts from a settled request
Type: Behavior
Status: done
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

#### Slice 5 record

Observed on 2026-11-12, Node 24.21.0. Logs:
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice5/`.

- **The division.** Three cases in three files, each one page journey from
  the same arrangement, on a 390 × 844 viewport from the start:
  `intent-ci-follow-up.spec.ts` (143 lines) the reading (C18, C22, first
  render of C19); `intent-ci-follow-up-proof.spec.ts` (65) the proof
  navigation (C20); `intent-ci-follow-up-return.spec.ts` (88) refresh,
  reload, revisit and the Development selection (C19, C21). One file would
  have passed 250 lines. None calls `scenario.ingest`, sets
  `recheckingLandedCi` or starts a collecting server; across the selection
  one case calls `scenario.ingest`
  (`landed-ci-automatic-repeat.spec.ts:75`). No shard weight or CI
  configuration names the spec.
- **The arrangement.** `keepSettledRepeat(page, origin, github, facts)` in
  `dashboard/tests/support/ciFollowUpSettledReading.ts`: Intent's trunk, the
  committed origin following `main`, then `keepRepeatLanding(...,
  { stage: "settled request", otherwise: "as served before" })`. The module's
  `test` replaces the `dashboard` fixture with
  `startLandedCiReader({ github }, origin, "preview")`, whose parameter is
  narrowed to the provider and an optional build. Each case states run 71,
  120 s, the 100 s repeat and the 100 s average; the reading case states the
  excluded prior (`{ seconds: 116, reason: "Slow outlier: more than 15% above
  the median" }`) and the proof case the proof entry it reads
  (`makeMe.aCiProofEntry.at("dashboard/tests").counting(2092, "case")`).
- **The stage.** `"settled request"` is the third `RepeatStage`: `heldAt`
  saves the request as recovered by the repeat build, with what collection
  observed of attempt 2. `keptAttempt` (`ciFollowUpRepeatRun.ts`) is the
  build a machine keeps of an attempt as the provider has it, used for the
  original and the repeat. `keptPriors` takes an excluded last prior, and
  `referenceFor` now freezes the excluded row, the count and dates of the
  builds used, and `difference` in the product's words (`timeChangeOf`,
  `executionTimeDifferenceWords`), for every stage. The machine keeps the
  history, launch records and follow-up enabled as at the other stages; the
  reader reads the same with them (slice 1 saw it with the ledger alone).
- **On a phone.** `shownCiFollowUpCard` pages the Board to Recently done
  before the card is used, here and in the warning case. `toBeInViewport({
  ratio: 1 })` failed on the repeat attempt at ratio 0.9987: scrolled to, its
  bottom lay 0.4 px below the window (y 539.30 + 305.11 against 844), with
  its sides inside. `expectWholeOnPhone` therefore expects the part shown
  and both its sides inside the window, then no sideways scroll; the warning
  case uses it too and keeps its card check. `refreshCiFollowUp` waits for
  the dashboard's answer to the read the refresh sends: without it F21 showed
  one request at "no CI request from refresh", the refresh's own read not yet
  sent.
- **Same comparison.** The return case reads the comparison's whole text at
  first render and expects exactly that text after refresh, reload and
  revisit.
- **Three consecutive passes**, the three specs, two workers, load
  10.6 → 10.2, 10.2 → 12.9, 12.9 → 11.0; 3 of 3 each. Proof 6.6, 12.5 and
  7.8 s and return 10.3, 14.5 and 7.8 s, each first in its worker; reading
  6.6, 6.8 and 3.7 s, second in a worker.
- **In the profile**, one pass under 32 burners, two workers, traced, load
  30.8 → 35.9: proof 13.3 s and return 17.3 s, each first in its worker with
  7.2–7.3 s of Before Hooks (`origin` 3.1 s, `dashboard` 3.9–4.0 s); reading
  8.3 s second in a worker (Before Hooks 1.2 s). Under 16 burners, load
  25.9 → 25.3: 9.8, 13.7 and 6.8 s.
- **The reader fixture first in a worker.** Four workers, every spec first
  in its worker, traced, load 14.4 → 13.0: the reader cases and the
  collecting settings case each `origin` 2.3 s, `dashboard` 2.0 s, Before
  Hooks 4.4–4.5 s. The reader fixture's preparation does not differ from the
  collecting fixture's.
- **Faults**, one worker, the three specs, each reverted before the next;
  `git diff --stat -- dashboard/server dashboard/src` empty afterwards. None
  failed at the case bound. Logs `fault-<name>.log`.

  | Fault | Scratch edit | Fails | Load |
  | --- | --- | --- | --- |
  | F20 | `reference: { ...request.reference, evidence: [] }` in `retainedFollowUpOf` | The reading case, "evidence rows": 0 for 7; the return case, "evidence rows on first render": 0 for 6 | 10.8 → 8.5 |
  | F21 | The reading route awaits `exactRepeatRun` for the original before it answers (`ciFollowUpBoundary.ts`) | The reading case, "no CI request from first render": `["actions-run-attempt"]`; the proof case, "no CI request from proof navigation"; the return case, "no CI request from refresh": two requests | 10.5 → 12.8 |
  | F22 | `scopeEvidenceOf` takes `reading.repeat ?? reading.original` (`IntentScopeEvidence.tsx`) | The proof case, "the original's proof in Summary": no link to attempt 1 | 12.8 → 10.3 |
  | F23 | `FollowUpSelection` no longer navigates away on another selection (`ciFollowUpNavigation.tsx`) | The return case, "the selection leaves the comparison's address": `SEED-A#a` | 8.9 → 9.5 |
  | F24 | `tabIndex={run.runAttempt === 2 ? -1 : undefined}` on `HistoryRunAttempt`'s link | The reading case, "Tab reaches the repeat's link": inactive | 9.5 → 9.6 |
  | Wide comparison | `.ci-follow-up section { min-width: 480px; }` | The reading case, "original whole on the phone": right side 480 for at most 390.5 | 9.6 → 9.5 |
  | Wide warning (slice 4's) | `.ci-follow-up-slow` gains `min-width: 480px` | The warning case, "warning whole on the phone": right side 544.6 | 9.5 → 11.8 |

  F21 and F24 as named have no line to change: the reading route reads no
  provider, and the attempt link has no `tabindex`. The edits above are the
  nearest that produce the regression. `expectOriginalProofNavigation`'s
  expectations now carry labels; none changed.
  F2 again, because every stage's kept reference and original build changed
  form (one worker, load 12.1 → 10.5): the journey and the refused case,
  "rerun requests", and the accepted-request case, "no second request":
  `[71, 71]` for `[]`.
- **The base's assertions** (`git show 095f2bff9:dashboard/tests/intent/intent-ci-follow-up.spec.ts`).
  The rerun request after ingestion (`:62`) and the recovered card collection
  saves (`:64`–`:77`): the journey (C2) and the saved-request case's
  recovered outcome (C14). Follow-up turned off before the reader (`:78`):
  the eligible-receipt cases (C13). The card, both attempts with revision,
  workflow, start, wall time, difference and completeness, the rule, "5 prior
  builds used", the seven rows with Included, Selected, Excluded, the reason,
  `run/6/1` and `run/71/1`, both exact links, the tab order through every
  evidence link, no sideways scroll (`:98`–`:153`): the reading case. The
  proof navigation (`:155`–`:164`): the proof case. Refresh, reload, revisit
  and "2 min" on return (`:166`–`:175`), the Development selection and
  project Intent (`:179`–`:196`): the return case. The Actions counts
  (`:154`, `:165`, `:170`, `:176`) and no second rerun (`:177`): each case's
  count, which holds every Actions kind, the rerun request among them. One
  promise changes owner outside these cases: that the reference the product
  freezes at a real admission excludes the 116 s prior. The kept reference
  states it here; `landed-ci-follow-up-reading.spec.ts` "saved samples,
  exclusions and workflow survive window eviction…" (a real ingestion of
  `[100, 100, 100, 100, 100, 116]`) and
  `tests/support/ci-prior-build-reference.test.mjs` "one exact upper filter
  includes 115, excludes 116…" own it, unchanged. The return case counts
  through the revisit; after the Development selection normal Intent reads
  as it does elsewhere, and the base counted none there either.
- **Consumers.** The 40 specs that import the kept landing, the repeat
  scenario, the saved requests, the provider's run, the reading page object
  or the reader (`slice5/consumer-specs.txt`), two workers, load
  10.8 → 26.7: 61 of 62 in 5.1 min. Failed:
  `intent-project-scope-timing-refresh.spec.ts:126`, at the 30 s bound in
  `passTimeUntilChecked`, its other case passing in 30.4 s. That spec, its
  fixture and `autoRefreshJourney.ts` are unchanged since `095f2bff9` and
  reach this slice only through `startLandedCiReader`'s parameter type.
  Rerun alone, two workers: both cases failed at the bound at load
  22.9 → 28.5 (30.7 s each) and passed at 28.5 → 25.7 (25.8 and 27.0 s); at
  load 18.0 → 16.9 the base worktree took 12.9 and 13.3 s and this checkout,
  next, 12.1 and 14.5 s. Open: these two cases reach the bound at a load of
  23–28 on the base as here; no active execution owning them was found, and
  the spec is outside this story's four.
- **Consumer trace**, `--base 95bda2675` with the changed and new exports as
  terms (`slice5/consumer-trace.md`). Run: the three Intent follow-up specs,
  `recently-done-ci-automatic-repeat.spec.ts`,
  `landed-ci-automatic-repeat.spec.ts`,
  `landed-ci-repeat-accepted-request.spec.ts`,
  `landed-ci-repeat-verdict.spec.ts`, and the 30 specs that reach
  `startLandedCiReader` or `restartAsLandedCiReader`, directly or through
  `landedCiHistory.ts`, `projectScopeHistoryFixture.ts` and
  `scopeHistoryCollectedOrder.ts`. Reused, run in the 40:
  `ciFollowUpScenario.ts` and `ciFollowUpSavedRequests.ts` (unchanged) with
  the admission, reconciliation and receipt boundary specs that import them. Excluded, the effect does not reach them: files
  that match only a module this slice's specs import or stopped importing
  (`boardPage.ts`, `storyCardSelection.ts`, `intentModePage.ts`,
  `intentStoryWorktree.ts`, `intentStoryPage.ts`, `priorBuildReferencePage.ts`),
  all unchanged; files that match a field name the product already has
  (`runBranch`, `timingBasis`, `proofPending`, `sampleCount`, `medianMs`,
  `workflowId`, `averageMs`, `originalMs`, `repeatMs`, `realHistory`) or a
  literal of their own; the MakeMe builders and node tests under
  `tests/support` and `src/skills`, unchanged and not importing the changed
  modules; documents, planning records and evidence that name a spec's path
  or the product's words.
- For slice 6: the selection is seven spec files, the Verification line's
  six and `landed-ci-repeat-accepted-request.spec.ts`.
  The return case is the longest of the three, 17.3 s first in its worker in
  the profile with 7.3 s of preparation; its Development selection begins at
  a viewport change, the navigation boundary to divide at should it exceed
  15 s away from first in a worker.

#### Slice 5 acceptance and refactor

- Accepted. The refactor pass gave "a kept landing beneath a page" one home,
  `keepRepeatLandingForPage` in `ciFollowUpPageLanding.ts` (37 lines), used
  by `keepSettledRepeat` (`ciFollowUpSettledReading.ts`, now 50 lines) and
  the warning case; no case states `otherwise`. `repeatSeconds` belongs to
  the settled stage (`AtStage`). Expectations are unchanged and the kept
  ledger, history and provider content are the same, so the fault results of
  the Slice 5 record stand. The six specs that keep a landing passed 10 of 10
  three consecutive times at two workers, load 22.5 → 28.0 from other work:
  proof 15.6–23.1 s, return 17.3–24.8 s, reading 10.7–18.6 s, warning
  9.6–17.3 s.
- C18's outlier: that the reference the product freezes at a real admission
  excludes the 116 s prior stays with `landed-ci-follow-up-reading.spec.ts`
  "saved samples, exclusions and workflow survive window eviction…" and
  `tests/support/ci-prior-build-reference.test.mjs`, unchanged; the reading
  case owns that the kept exclusion and its reason are read.
- Open defect outside the selection, kept by this execution:
  `tests/intent/intent-project-scope-timing-refresh.spec.ts` reached the
  30 s bound at load 23–28 in the consumer run (61 of 62) and alone; at load
  17 the base and this branch take the same 12–14 s. Its files are unchanged
  since `095f2bff9` and no story names it. Diagnosis follows this slice.

#### Diagnosis of `intent-project-scope-timing-refresh.spec.ts`, after slice 5

Three traced runs of the unedited spec alone at two workers (evidence in
`/Users/terryyin/.claude/jobs/296b888d/tmp/scope-timing/`): pass 23.0 s at
load 18.2 → 22.8, pass 28.7 s at 12.9 → 26.0, fail 31.1 s at 16.0 → 32.6. No
wait is stuck: 16–23.5 s goes to arrangement before the case's own first
step (a collecting server, `publishSummaryComparisonStory`, collection of
three proofs, a second cold reader, the Done comparison settling), and the
7–9 s journey then has no room. Local trims save 3–4 s and leave no margin.
The repair that gives margin starts the refresh case from kept history in
one non-collecting server, in its own file, and its other case (28.7 s at
load 33) needs the same or a shared published-story template used by about
17 specs. That changes what those cases prove and is story-sized, outside
this story's four specs: it goes to Terry with a recommendation at the
execution handoff. The base worktree at the merged trunk revision is
`/Users/terryyin/.claude/jobs/296b888d/tmp/base-merged` (`8aa440077`).

#### First measured run, 2026-11-12, before the amendment

Run as slice 6 of the plan as it then stood, on `109d87f44` against the
merged-trunk base `8aa440077`. Both figures missed; Terry then widened the
story (see [Current decisions](#current-decisions)) and slices 6–10 replace
that slice.

Observed on 2026-11-12, 17:16–17:37 local, Node 24.21.0, candidate
`109d87f44`, base worktree `base-merged` at `8aa440077`. Logs, proof records
and traces: `/Users/terryyin/.claude/jobs/296b888d/tmp/slice6/`. The machine
ran on battery (24% falling to 14%), so `caffeinate -s` was inert; the sleep
log holds no sleep or wake since 2026-11-07. Not done: key examples 1 and 8
both miss, and the measuring stopped there for the coordinator.

- **Key example 1 misses.** Two counted two-worker runs, both in the profile,
  both failed; there are no three consecutive passes. `scripts/dashboard-repeat.sh 1
  <seven specs> --workers=2 --trace=on` with a proof record, started by
  `slice6/profile.sh` once the load was inside 30–50. "First" is the first
  case of the run in its worker; "first page" is the first page case of the
  run in its worker, the one that asks for the run's app build.

  | Case | Run 1, 24 burners, load 30.6 → 40.6 | Run 2, natural load, no burner, 35.9 → 44.2 |
  | --- | --- | --- |
  | Journey | 16.2 s, first, Before Hooks 7.7 s (`origin` 7.6) | timed out 33.3 s, first, Before Hooks 24.2 s (`origin` 23.9) |
  | Refused | 16.0 s, first, Before Hooks 7.6 s (`origin` 7.6) | timed out 31.1 s, first, Before Hooks 23.7 s (`origin` 23.6) |
  | Uncertain | 9.5 s | timed out 30.7 s at `:166`, Before Hooks 2.1 s, 15.5 s from there to its first wait |
  | Saved-request outcomes | 2.7 s | 13.6 s |
  | Accepted request | 12.6 s | 26.8 s, Before Hooks 2.0 s, 11.6 s from there to its first wait |
  | Verdict | 6.4 s | 7.7 s |
  | Intent proof | 31.2 s passed, first page, Before Hooks 15.2 s (`origin` 1.2, `dashboard` 13.6) | timed out 33.5 s in `expectOriginalProofNavigation` (`ciFollowUpReadingPage.ts:112`), first page, Before Hooks 16.3 s (`origin` 1.1, `dashboard` 14.2) |
  | Intent return | timed out 31.5 s at "same after reload" (`:55`), first page, Before Hooks 15.0 s (`origin` 0.9, `dashboard` 13.6) | timed out 32.0 s at "same after reload", first page, Before Hooks 11.4 s (`origin` 0.9, `dashboard` 9.5) |
  | Intent reading | 15.3 s, Before Hooks 3.4 s (`origin` 0.8, `dashboard` 2.4) | 18.5 s, Before Hooks 2.0 s |
  | Settings | 6.6 s, Before Hooks 4.2 s | 4.2 s, Before Hooks 2.0 s |
  | Warning | 10.1 s, Before Hooks 2.6 s | 20.0 s, Before Hooks 2.3 s |
  | Result | 10 of 11, exit 1, 96 s | 6 of 11, exit 1, 169 s |

  Run 1's burners were 16 from the script and 8 added when the load settled
  at 28.5; other work held 11 before them. Run 2's load was other worktrees'
  work alone (Playwright suites, `nix develop`, a JVM, another checkout's
  burners). Slowest per position: first, 16.2 s under burners and over the
  30 s bound under natural load; first page, 31.5 s and 33.5 s; any other
  position, 15.3 s and 30.7 s. No uncounted profile run.
- **Where the time is.**
  - The run's first two cases pay `origin`: 7.6 s under burners, 23.6–23.9 s
    under natural load, against 0.5–2.0 s for every later case, a worker
    started after a timeout included. Under natural load that alone is the
    journey's and the refused case's failure.
  - The first page case in each worker waits in its `dashboard` fixture for
    the run's app build (`sharedDashboardBuild`, asked for by the first
    preview server): 13.6 s under burners, 9.5 and 14.2 s under natural
    load, against 1.1–2.7 s later.
  - That is not the whole excess. A settled-reading case that pays neither
    took 15.3 and 18.5 s: 3.0–5 s of arrangement, then `goto`, the Board
    paged to Recently done (3–4 s) and the card opened (1.7–2.7 s) before its
    first observation. The return case had reached `:55` of 88 lines at the
    bound in both runs. Under natural load the backend cases' arrangement and
    server start took 11.6–15.5 s before their first wait.
  - No wait rode a collection pass to its 5 s: the longest was "saved reply"
    3.9 s (uncertain case, run 2) and "a whole pass" 1.9 s and 2.9 s; the
    others 0.0–1.9 s (`slice6/polls.py` over the traces).
- **Key example 2 holds.** One case calls `scenario.ingest` in the seven
  specs (`landed-ci-automatic-repeat.spec.ts:75`); five do in the base's four
  (`:49`, `:122` in a loop of two outcomes, the phone journey `:47`, the
  Intent journey `:60`).
- **Key example 8 misses.** Paired one-worker runs, base then candidate back
  to back, `slice6/one.sh`, wall time of the whole command, every case
  passing in all six:

  | Pair | Base, 7 cases | Candidate, 11 cases |
  | --- | --- | --- |
  | 1 | 30.5 s, load 5.7 → 4.7 | 34.3 s, load 4.7 → 4.3 |
  | 2 | 40.5 s, load 4.3 → 11.0 | 42.2 s, load 11.0 → 9.4 |
  | 3 | 33.9 s, load 9.4 → 10.1 | 49.0 s, load 10.1 → 11.6 |
  | Median | 33.9 s | 42.2 s |

  The candidate's median is 1.24 of the base's; two-thirds would be 22.6 s.
  In pair 1 the base's cases sum to 24.9 s (journey 4.6, refused 2.4,
  uncertain 2.6, Intent journey 9.0, phone journey 4.3) and the candidate's
  to 32.8 s: its five page cases take 19.8 s against the base's two at
  13.3 s, its six backend cases 13.0 s against 11.6 s. At a load this low a
  journey's provider calls cost little and each added case pays its own
  arrangement. Not measured: pairs at a load of 30–50.
- **Supporting count, not clean.** Fake `gh` calls counted by a scratch
  preload (`slice6/count-gh.mjs`, every POST to a fake GitHub's root in a
  worker), one one-worker run each: base 238, candidate 154. Other work
  raised the load during them and both runs failed, so neither count is of a
  passing run: base 5 of 7 in 116.7 s at load 10.5 → 40.7 (the Intent and
  phone journeys at the bound), candidate 9 of 11 in 178.8 s at
  40.7 → 38.2 (the return and reading cases at the bound; proof 19.2 s,
  settings 17.7 s, warning 18.6 s).
- **Diff review**, `git diff 8aa440077...HEAD -- dashboard tests`: no added
  `test.setTimeout`, expectation `timeout:`, `test.slow`, sleep or
  `waitForTimeout`, retry, skip, fixme, only or runner mode; nothing outside
  `dashboard/backend-tests/intent`, `dashboard/tests/intent` and
  `dashboard/tests/support` changed besides planning records;
  `git diff --stat 8aa440077...HEAD -- dashboard/server dashboard/src` is
  empty; no file under `dashboard/longest-first*` names any of the seven
  specs. The verdict spec differs from `095f2bff9` by `await
  saveRepeatRequests` and `rerunRuns` only, so F10 and F11 stand by the
  "Faults F1–F11" premise row.
- **Waits after a provider change**, each on the default 5 s expectation:
  the journey awaits the held request's arrival, then polls the saved
  request ("accepted saved after the reply"), then `aWholePass`, the
  provider's answer to the second read of run 72; the refused and uncertain
  cases poll the saved request ("saved reply", "repeat read") and the
  refused case `aWholePass`; the saved-request and verdict cases poll each
  saved outcome; the accepted-request case `aWholePass`, then the saved
  request ("progress read", "repeat read"); the warning case the saved
  request ("progress saved", "repeat saved"), then its page under the
  controlled clock. The Intent cases change no provider fact;
  `refreshCiFollowUp` awaits the dashboard's answer to the refresh's read.
  Every one of these events arrives with a collection pass over kept state,
  `aWholePass` with up to two; none polls a call count or a card.
- **G1 is not met and is wider than reported.** At natural load 36 → 44 the
  first case of the run in each worker spends 23.6–23.9 s in `origin`
  alone, and under either kind of load the first page case in each worker
  9.5–14.2 s waiting for the app build. Those shares are shared preparation
  this story does not change. The page cases and, under natural load, the
  backend cases also exceed their figures away from those positions, which
  is theirs to repair: nothing was changed in this slice, because the repair
  is no division of one case. It has to shorten what every kept-landing
  case pays before its first observation.
- For the coordinator: no tracked file changed but this plan; both base
  worktrees stay; kept failure directories are under each worktree's ignored
  `dashboard/test-results/`.

### 6. The shared costs and their kept forms are on record
Type: Behavior
Status: done
Proof: The plan records, each from a traced run with its command and load:
what the `origin` fixture does on its first use in a worker and which part
of it later uses skip; where the run's app build is requested and what
producing it before the first case would change; what a kept-landing case
spends between its first line and its first observation, by step
(`completedPublishedStory`, the server start, the kept files); and the same
for the two cases of `intent-project-scope-timing-refresh.spec.ts`. For each
of the four it records one scratch arrangement that removes the cost and the
seconds it saved in a run at load 30–50 or under burners, and names the
specs that use the fixture it would change. Scratch code is deleted.

Behavior: The branch as slice 5 left it → the probe runs → each fixed cost
has a measured cause and a measured kept form, and any of slices 7–9 a false
premise reaches is revised before it starts.

This is an authorized early probe. Four premises, each as one scratch
arrangement:

- **The origin's first use.** The run's first case in each worker paid
  7.6 s under burners and 23.6–23.9 s under natural load in `origin`, later
  cases 0.5–2.0 s → find what the first use builds (a template repository,
  installed CLI, clones) and whether it can be produced once before cases
  start, or kept between runs.
- **The app build.** The first page case in each worker waited 9.5–14.2 s in
  `dashboard` for `sharedDashboardBuild` → produce it before any case starts
  (the runner's own setup) and observe the first page case's `Before Hooks`.
- **A kept published story.** A kept-landing case spent 11.6–15.5 s before
  its first wait under natural load → copy a story published once per worker
  for each case, as `queuedOriginRepository` copies its origin, and find what
  holds an absolute path (remotes, launch records, the capture's repository).
- **Kept history for the refresh cases.** Both refresh cases start from
  `keepLandedCiHistory` in one non-collecting server → the endpoint move, the
  three rows and the return to the selected landing still read; find which
  of its observations need a collected proof and which fault each one fails
  under.

A premise that does not hold stops the slice that consumes it and returns to
the coordinator with what it would take.

#### Slice 6 record

Observed on 2026-11-12, 17:54–18:10 local, on `d231348ce`, Node 24.21.0, AC
power throughout (battery 11%, charging). Every run was started by
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice6b/run.sh` only at a
one-minute load of 30–50, under natural load: this probe started no burner
(other worktrees' suites and another checkout's `yes` burners held the load).
Command of every run, from the repository root:
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=<slice6b>/artifacts-<label>.jsonl [ZZ_SCRATCH_599_EAGER=app,server-bundle,start-origin-claude-queued] npm run --silent test:dashboard -- <specs> --workers=<n> --trace=on --reporter=list`.
Logs `<label>.log`, traces `traces-<label>/`, artifact traces and the scratch
code (`scratch/`) are in that directory, with `steps.py` (trace steps by
depth) and `importers.py` (spec files that import a module, transitively, by
family). "Selection" is the seven repeat specs and the refresh spec. Scratch
code is deleted from the repository.

| Label | Specs, workers | Load before → after | Result |
| --- | --- | --- | --- |
| `kept1` | scratch `backend-tests/intent/zz-scratch-599-s6-kept.spec.ts`, 2 | 48.0 → 70.2, ended outside the profile | 6 passed, 66 s |
| `kept2` | the same, 1 | 49.7 → 38.7 | 6 passed, 64 s |
| `pagebase` | `intent-ci-follow-up-return`, `-proof`, `landed-ci-repeat-accepted-request`, `landed-ci-repeat-verdict`, 2 | 36.0 → 36.0 | 4 passed, 35 s |
| `pageeager` | the same with `ZZ_SCRATCH_599_EAGER`, 2 | 35.0 → 36.3 | 4 passed, 29 s |
| `refresh1` | the refresh spec and scratch `tests/intent/zz-scratch-599-s6-refresh.spec.ts`, 2 | 37.0 → 34.6 | 4 passed, 41 s |
| `selbase` | the selection, unchanged, 2 | 30.3 → 49.0 | 11 of 13, exit 1, 139 s: both refresh cases at the 30 s bound |
| `seleager` | the selection with `ZZ_SCRATCH_599_EAGER`, 2 | 49.0 → 48.3, 58.9 seen during the run | 12 of 13, exit 1, 168 s: the refresh case at `:126` at the bound |
| `refresh2` | as `refresh1`, 2 | 44.4 → 39.0 | 4 passed, 66 s |

The refresh failures are this story's known loaded failures, recorded here;
slices 7–10 own their repair.

**1. The origin's first use.**

- Cause. `startOrigin` → `initializeStartOrigin` → `preparedStartOrigin`
  asks the runner for the run artifact `start-origin-claude-queued`
  (`startOriginPreparation.ts`, `runArtifacts.ts`). The runner builds it on
  the first request of the run: `prepareStartOrigin` materializes the queued
  repository with the five installed skills read from `src/skills` into its
  first commit, then `git clone --bare --no-local`, removes the remote and
  sets `maintenance.auto`. Artifact trace, start to complete: 4.6 s
  (`kept1`), 4.6 s (`pagebase`), 4.0 s (`selbase`). Both workers' first
  cases wait on that one build: `origin` 4.9 and 5.0 s (`kept1`,
  `pagebase`). Later uses skip the build and pay only the per-case part:
  `cpSync` of the prepared bare origin, `git clone --no-hardlinks` into the
  project and two config calls, 0.3–0.6 s, 1.1–1.5 s when the load is at
  48–59. No template is kept between runs; the artifact is removed with the
  run. The first backend case also asks for the `server-bundle` artifact
  (esbuild of the server entries): 0.8 s in each of the three runs.
- What SEED-287 and its predecessors already did here: `8c55a30c5` prepared
  origins once and copied them per case; `52d5f8339`, `019b0e250` and
  `944355f3a` made the origin, the app build and the server bundle
  on-demand run artifacts, with
  `backend-tests/launches/start-origin-demand.spec.ts` and
  `backend-tests/runtime/dashboard-artifact-demand.spec.ts` asserting which
  requests start which preparation; `08d208fd0` starts the story-columns
  prefix in global setup without awaiting it; `9739dd6eb` added the
  worker-scoped fixtures `dashboardPreviewReady`, `queuedClaudePreviewReady`,
  `queuedCodexPreviewReady` and `queuedCodexOriginReady`
  (`dashboard/tests/support/pageTest.ts`, `preparePreviewInputs`), which
  request the origin, app and bundle before a test starts. 19 spec files opt
  in through `queuedClaudePreviewTest` or `queuedCodexPreviewTest`; the
  refresh spec is one. The seven repeat specs use the plain `test` of
  `preparationPage.ts`, `landedCiHistoryTest.ts` and
  `ciFollowUpSettledReading.ts` and so pay inside the case. A worker fixture
  has its own time: in `refresh1` the unedited refresh cases, each first in
  its worker, spent 4.6 and 4.7 s in `queuedClaudePreviewReady`; their
  traces run 18.1 and 19.7 s and their reported durations are 13.6 and
  15.3 s.
- Scratch arrangement. Global setup awaits the three artifacts before
  workers start (`scratch/globalSetup-eager.patch.txt`). `pagebase` →
  `pageeager`, natural load 35–36: the first backend cases' `origin` fell
  from 4.9 and 5.0 s to under 0.5 s (no step of 0.5 s in either trace), the
  verdict case from 9.1 to 2.8 s and the accepted-request case from 14.4 to
  6.7 s; global setup built the three in 4.7 s side by side against
  4.6 + 0.8 + 4.6 s on demand, and the run took 29 s against 35 s. In
  `seleager` at load 49–59 the same preparation took 17.3 s before any case
  and the first cases' `origin` was 1.3–1.5 s.
- Consumers and what holds it back. `startOriginPreparation.ts`,
  `dashboardBuild.ts`, `runArtifacts.ts` and `pageTest.ts` reach every
  dashboard spec file through the shared fixtures; `startOrigin.ts` is
  imported, directly or not, by 487 spec files (`tests/intent` 97,
  `tests/sessions` 76, `tests/launches` 65, `backend-tests/launches` 45,
  `tests/review` 43, `backend-tests/intent` 42, `backend-tests/review` 31,
  `tests/navigation` 27, `tests/terminals` 19, `backend-tests/sessions` 15,
  `frontend-tests` 14, `tests/stories` 9, three other families 4).
  Awaiting in global setup reverses the on-demand decision of `52d5f8339`
  and `019b0e250`: a selection that opens no page would build the app, a
  Codex-only selection the Claude origin, and the two demand specs count
  requests and starts per artifact, so an unconditional request fails them.
  On hosted CI each shard is its own runner and already builds what its
  cases ask for; an awaited build moves that time ahead of the shard's
  first case and adds it where a shard asks for none. The worker fixture
  has none of these costs: the first case still waits, outside its own
  time. It needs a boundary-server variant (origin and bundle, no app) for
  the specs of `landedCiHistoryTest.ts` (28 files).

**2. The app build.**

- Cause. The `app` run artifact is `npm run build:dashboard -- --outDir
  <temporary>` (`buildDashboardTo`), started by the first
  `sharedDashboardBuild()` of the run, which the first preview server calls
  (`fixtureServerMode`, `startLandedCiReader`). Artifact trace, start to
  complete: 4.6 s (`pagebase`), 3.4 s (`selbase`). The first page case's
  `dashboard` fixture took 5.7 s (`pagebase`) and 5.5 and 4.7 s (`selbase`,
  both workers' first page cases waiting on the one build), against 1.2–1.8 s
  for a later case.
- Scratch arrangement: the same awaited request in global setup. `pagebase`
  → `pageeager`: the first page case's `Before Hooks` fell from 6.4 to
  1.7 s, its `dashboard` from 5.7 to 0.9 s, and the case from 14.7 to
  10.3 s.
- Consumers and what holds it back: as for the origin. Every preview server
  of the suite reads `sharedDashboardBuild` (`dashboardBuild.ts` has 8 direct
  importers, `dashboardServer.ts` among them). A backend-only
  selection must still build no app; `dashboardPreviewReady` and
  `queuedClaudePreviewReady` are the existing owners of "ready before the
  case".

**3. A kept published story.**

- Cause, by step, from the scratch spec (the accepted-request case with
  `keepRepeatLanding`'s steps named, `scratch/zzScratch599Kept.ts`). A case
  that is not first, one worker, load 49.7 → 38.7 (`kept2`): `origin`
  0.5 s; `completedPublishedStory` 1.8 s (`publishTake` 0.8 s: the declared
  Take committed and pushed, `git worktree add`, three config calls; the
  implementation commit 0.4 s; the installed `product-backlog.mjs complete`,
  commit, `rev-parse` and push 0.7 s; about 20 `git` and `node` subprocesses,
  counted by reading); the
  history, launch records, ledger and provider 0.1 s; `startServer` 1.3 s;
  first wait reached at 3.7 s and answered at 4.6 s; the case 7.5 s. Two
  workers, load 48 → 70 (`kept1`): publication 1.7–1.8 s, `startServer`
  2.7–3.2 s. In `seleager` at load 49–59 the refused, uncertain and
  accepted-request cases reached their first wait 9.5, 8.3 and about 8 s
  after `Before Hooks`. The first measured run's 11.6–15.5 s are these same
  steps under a heavier machine at a lower load figure: the publication is
  35–55% of the time between `Before Hooks` and the first wait (1.8 of
  3.2 s in `kept2`, 1.8 of 4.6–5.1 s in `kept1`) and the server start the
  rest.
- Scratch arrangement. A declared completed history in place of the CLI
  completion: `queuedReadyRepository()` with three more revisions,
  `takeRevision` (Yui, Trunk Mode, publisher `another-publisher`), the
  implementation authored by the agent, and a completion that removes the
  agent profile, leaves Story B queued and adds `makeMe.aDoneRecord`
  (`scratch/zz-scratch-599-s6-kept.spec.ts`), given to the `origin` fixture
  as `originRepository`; the completion is `git rev-parse main`. The
  product accepts it: the accepted-request case's assertions pass
  unchanged, six of six in both runs, so `landingCompletesStory` and
  `completedFollowUps` are satisfied. Two forms:
  - Prepared once per process and copied (first revision not the run-wide
    one): the case that is not first took 5.1 s against 7.5 s, saving
    2.4 s; it reached its first wait at 2.0 s against 3.7 s and its answer
    at 2.9 s against 4.6 s (`kept2`). The first case in each worker pays
    the private preparation: 6.7 s with one worker, 13.7 and 15.5 s with
    two workers preparing at once at load 48 → 70.
  - Later revisions committed per case onto the run-wide queued origin
    (what `initializeStartOrigin` does when the first revision is shared):
    `origin` 1.4–1.5 s and no publication, 7.3 s against 7.5 s. No first
    use.
- What the product reads of the completion: `git` in the project folder
  only. `completedFollowUps` → `publishedStoryEndpoints` fetches `origin`,
  reads the done record at `origin/main`, the commit that added it and the
  claim history; `landingCompletesStory` checks ancestry of the capture's
  base, that the base lacks the done record, and the same completion
  endpoints in `capture.repository`. So the commits must exist in the
  project and its origin; no cheaper form than real commits serves.
- Absolute paths and identity. A per-case copy made by the `origin` fixture
  holds none from its template: the prepared origin is a bare clone with no
  remote, the project is cloned per case with its own `insteadOf` origin,
  and `commonGitDir(origin.project)`, the machine home, the launch records,
  ledger and history are written per case after the copy. A copy of a
  finished project checkout would break: its `origin` remote and
  `url.<origin>.insteadOf`, the `.worktrees/completed-a` worktree's
  administrative paths (`retainWorkspace: true` keeps it; no kept-landing
  case reads it), and `extensions.worktreeConfig`. The declared form has no
  worktree. The done record's `completedAt` is the time of declaration:
  per process it is recent enough for Recently done; an artifact kept
  between runs would age out of it.
- Consumers. `ciFollowUpKeptLanding.ts`: 7 spec files (`backend-tests/intent`
  3, `tests/intent` 4), which are this story's. `completedPublishedStory.ts`:
  84 spec files (`tests/intent` 52, `backend-tests/intent` 12,
  `backend-tests/review` 11, `tests/sessions` 4, `backend-tests/sessions` 3,
  `tests/review` 2), unchanged if the kept form is a repository description
  beside it. A run-wide third description in `startOriginPreparation.ts`
  touches the file every origin consumer imports and the artifact list the
  demand specs read. Holding back: the per-process form costs each worker
  6.7–15.5 s once, more than it saves in a selection of seven cases on two
  workers, so the kept story must be a run artifact or the per-case commits;
  hosted shards are fresh processes and pay it once each.

**4. Kept history for the refresh cases.**

- Cause, unedited spec. Each case: `queuedClaudePreviewReady` (worker
  fixture, outside the case's time) 4.6–4.7 s when first; `origin` and the
  collecting boundary `dashboard` 1.2 s; then
  `publishSummaryComparisonStory`, the recorded landings, the served runs
  and the second, reading server, about 6 s at load 37 → 35 (`refresh1`),
  12.8–13.2 s at 44 → 39 (`refresh2`), 16.5 and 21.7 s when both cases ran
  at once late in `selbase`; then `openCollectedHistoryStory` with the
  collection of three proofs beside it, 3–7 s; the journey itself 2.6–4.1 s.
- Scratch arrangement (`scratch/zz-scratch-599-s6-refresh.spec.ts`): the
  `dashboard` fixture is `startLandedCiReader({ github }, origin,
  "preview")`, the only server; `publishSummaryComparisonStory`,
  `recordScopeHistoryLandings` and `serveCollectedScopeFileRuns` as today;
  the history through `makeMe.aLandedCiHistory.inTrunkOrder(<first-parent
  order of the project>)` with one `measuredLanding` and one
  `proofFor(<run>, makeMe.aCiProof…)` per landing (runs 101, 103, 104, the
  case and file units of `folder/a.spec.ts`), kept with
  `keepLandedCiHistory`. Both cases' bodies are unchanged and pass, twice:
  the endpoint moves to the new head with "no matching collected
  observation", CI evidence stays at the latest revision, three run rows
  remain, the endpoint datetime changes, no acquisition of artifacts
  1001–1003, the return to the selected landing reads two rows, and the
  first case's Project visit, return, selected file, Proof tab and reading
  place. The premise holds.
- Seconds. `refresh1`, load 37 → 35: 13.6 and 14.9 s against 13.6 and
  15.3 s, a saving of 0–0.4 s: publication 4.5–4.8 s, kept history
  0.9–1.1 s, opening the story 3.7–4.3 s. `refresh2`, load 44 → 39: 21.0
  and 21.9 s against 27.3 and 30.1 s, a saving of 6.3–8.2 s, the unedited
  cases first in their workers and the scratch cases not: publication
  6.4–6.8 s, kept history 1.4–2.2 s, opening the story 5.3–6.1 s. Kept
  history removes the second server and the wait for collection; it does
  not remove the publication, which is the larger share, and the scratch
  cases stay over 15 s at load 39–44.
- Which observations need a collected proof or
  `publishSummaryComparisonStory`, and the single fault for each (not run;
  slice 9 runs them):

  | Observation | Needs | Fault that would fail it |
  | --- | --- | --- |
  | Done history reads "Selected landing", two rows 8.0 s and 11.0 s, and not the latest revision | The published story's commits and the kept builds; no collection | The scope history route ignores `through` and answers every kept landing |
  | Project history reads "Observed trunk endpoint main" at the latest revision with three rows, the third 9.0 s | The kept history; the published trunk head | The Project scope history stops at the selected landing |
  | After the head moves: the endpoint names the new head with "no matching collected observation" and three run rows remain | The origin's real head and the page's revision check; no collection | A head without a kept build drops the kept rows |
  | CI evidence stays at the latest revision's run | A live acquisition of run 104's proof through the provider (`serveCollectedScopeFileRuns`), not kept history | The Project proof follows the uncollected head |
  | The endpoint datetime changes | The page's observation of the new head | The endpoint keeps its first observation time |
  | No acquisition of the three earlier artifacts | The provider's call record | History navigation reacquires a build's artifact |
  | Return to the story restores the selected file, Proof tab and reading place (first case), and two rows (both) | The published story's changed files (`publishSummaryComparisonStory`'s Intent sources) | Returning from Project Intent resets the story's file selection |

  What leaves real collection: that a collecting dashboard turns three
  recorded landings and their served summaries into those kept builds. Its
  candidate owner is `intent-project-scope-timing-history.spec.ts`, to be
  shown by the fault "collection keeps no proof for a measured build".
- Consumers. `projectScopeHistoryFixture.ts`: the refresh spec only.
  `intentSummaryStoryComparisonFixture.ts`: 22 spec files, all
  `tests/intent`. A declared comparison story already has an owner,
  `materializeDeclaredSummaryComparisonRepository` with
  `intentSummarySortTest.ts` (one spec); it builds no start origin, so the
  refresh cases' `origin.originGit` and `origin.project` uses would need it
  joined to the `origin` fixture. Not scratched.

**Premises.**

- Origin first use: holds. One run artifact built on first request; producible
  before cases start. Two owners are possible and they differ: awaiting in
  global setup (measured) reverses the on-demand decision and its two
  specs; the existing worker fixture keeps it. Slice 7's proof reads the
  same under either.
- App build: holds, with the same choice.
- Kept published story: holds as a declared history, not as a copied
  checkout. It removes 1.7–1.8 s of a 7.5 s case at load 39–50, 46% of the
  time to the first wait and 37% of the time to its answer. Slice 8's "at
  most half the time slice 6 recorded" is not met by this alone: the
  server start (1.3 s, 2.7–3.2 s on two workers) remains.
- Kept history for the refresh cases: holds for what reads. It does not by
  itself bring either case under 15 s; the publication remains.

**Projection.**

- Key example 1, no case over 15 s and 25 s first in its worker, at load
  30–50 on two workers: not plausible from slices 7–9 as written. With the
  origin, app and bundle already prepared (`seleager`, natural load 49–59)
  the cases took: journey 22.5 s, refused 21.8 s, uncertain 23.9 s,
  accepted request 20.1 s, proof 19.3 s, return 26.4 s, reading 17.0 s,
  refresh 26.4 s and over 30 s; only saved outcomes 6.4 s, verdict 8.0 s,
  settings 6.4 s and warning 11.3 s fit. Slice 8 takes at most the
  publication from seven of them, 35–55% of 8–9.5 s, about 3–5 s:
  uncertain about 19–21 s, accepted request about 15–17 s, return about
  21–23 s. At the lighter `selbase` (30 → 49) the cases that pay no first
  use were already over: reading 16.7 s, warning 26.1 s, return 20.8 s
  with 4.7 s of build wait. What remains after 7–9 is every case's own
  server start (1.3–5.7 s), three collection-pass waits of 0.9–2.9 s each
  in a backend case, and in a page case `goto`, the Board paged to
  Recently done and the card (4–7 s) before the first observation, with
  1–2.3 s of teardown counted in the duration. The same load figure also
  does not fix the cost: publication took 1.8 s at load 39–50 today and
  the same steps 11.6–15.5 s at 36–44 in the first measured run. Reaching
  the figure needs a decision outside these slices: a bound stated against
  a reference case of the same run instead of seconds, or page cases that
  open the comparison without the Board, or shorter cases still.
- Key example 8, candidate median at most two-thirds of the base at one
  worker: not plausible. At load 4–12 the base's seven cases ran in 33.9 s
  and the candidate's eleven in 42.2 s. The refresh spec adds about 24 s
  to both (12–14 s a case at load 17). Base about 58 s; two-thirds is
  about 38.6 s. Candidate: 42.2 s, less 2–4 s if preparation runs side by
  side in global setup (none under the worker fixture), less 2–3 s for
  seven kept stories (about 0.6 s each at that load, less one
  preparation), plus about 23.5 s of refresh with kept history, or about
  20.5 s with a declared story as well: 57–61 s, a ratio of 0.98–1.05.
  The gap is about 20 s. At a low load a journey's provider calls cost
  little and each of the six added cases pays its own origin, server and
  page; the division that serves key example 1 works against key example
  8. Changing the comparison (under load, or by fake `gh` calls, 238
  against 154) is a seed edit.

Gaps: no run under burners (the natural load stayed in the profile); the
worker-fixture form for the repeat specs was observed on the refresh spec
and not scratched for them; a run-wide kept-story artifact and a declared
comparison story joined to the `origin` fixture were not scratched; the
faults of the table above were not run; hosted CI was not consulted.

#### Slice 6 acceptance, and the stop it brings

Accepted as a probe: each of the four costs has a measured cause and a
scratch form that removes it. Its projection stops slices 7–10 for the
developer: with origin, app build and bundle prepared, a kept story, and the
refresh cases on kept history, the measured cases still take 17–26 s at
natural load 49–59 and about 15–23 s after slice 8, so key example 1's 15 s
figure is out of reach; and at one worker the candidate projects to 0.98–1.05
of the merged-trunk base once the refresh spec is counted on both sides, so
key example 8's two-thirds is out of reach. What remains per case is the
server start, the collection passes, entering the page through the Board and
teardown, none of which these slices remove. Slices 7–9 stay `planned` and
unstarted until the story's figures are decided. For slice 7 the probe
favours the worker fixtures SEED-287 added in `pageTest.ts` over an awaited
global setup, which would fail the two on-demand artifact specs; slice 8's
"half the time" would read 37–46%.

### 7. A worker's first case starts from prepared origin and app build
Type: Behavior
Status: done
Proof: The named specs' first case in each worker spends no more in `origin`
than a later case does, and the first page case no more in `dashboard`, each
within 3 s, in two traced two-worker runs at load 30–50 or under burners;
the preparation is the worker's, outside any case's time. The three specs of
`start-origin-demand`, `dashboard-artifact-demand` and every other consumer
the trace names keep their cases and assertions and pass; the named specs
pass three consecutive times at two workers. The consumer-trace record gives
every located consumer a disposition. Hosted CI passes on the published
revision.

Behavior: A two-worker run of the named specs starts under load → each
worker's first backend case and first page case start → neither waits in its
own time for the queued origin, the server bundle or the app build.

- Owner: the worker fixtures SEED-287 added in `dashboard/tests/pageTest.ts`
  (`queuedClaudePreviewReady` and its siblings; 19 spec files opt in). The
  named specs opt in; `landedCiHistoryTest.ts`'s backend cases get the
  boundary variant (origin and server bundle, no app build) from the same
  owner. No awaited global setup: slice 6 found it fails the two on-demand
  artifact specs and builds the app for backend-only selections.
- A file already over 250 lines is not edited without its reorganization
  settled first; return it.

#### Slice 7 record

Observed on 2026-11-12, 18:20–18:36 local, on `a445b7854` with this slice's
uncommitted change, Node 24.21.0, AC power throughout. Logs, traces, artifact
traces and the scratch scripts (`run.sh`, `steps.py`, `fixtures.py`) are in
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice7/`; nothing scratch entered
the repository. Not committed, not published: hosted CI is not yet observed.

**Design.** The owner stays `dashboard/tests/support/pageTest.ts`. Its
`preparePreviewInputs` became `prepareServerInputs(host, "preview" |
"boundary")`; the three existing worker fixtures request the same artifacts
as before, and one sibling is added, `queuedClaudeBoundaryReady` (queued
Claude origin and server bundle, no app build): no sibling requested that
set (`queuedCodexOriginReady` asks for the Codex origin alone). Opt-in
follows SEED-287's form, a test whose `originRepository` waits on the worker
fixture:

- `landedCiHistoryTest.ts` exports `queuedClaudeBoundaryTest` beside its
  unchanged `test`; the three backend repeat specs import it as `test`.
- `ciFollowUpSettledReading.ts` extends `queuedClaudePreviewTest` instead of
  `test` of `preparationPage.ts`; its three specs are the Intent follow-up
  specs and nothing else imports it.
- `recently-done-ci-automatic-repeat.spec.ts` imports
  `queuedClaudePreviewTest` as the opted-in specs do.

Narrow over wide: `landedCiHistoryTest.ts`'s own `test` was left as it is.
Opting the whole module in would move the first-use time of 25 other specs'
cases; the per-spec opt-in is the form the existing opted-in specs use, and no
named spec needs more. All worker-scoped fixtures stay declared in
`pageTest.ts`, so the worker population is one. Line counts: `pageTest.ts`
184, `landedCiHistoryTest.ts` 68, `ciFollowUpSettledReading.ts` 50, the four
spec files 237, 74, 86 and 95. No product code, timeout, sleep, retry or
skip.

**Runs of the seven specs**, each
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=<file> npm run --silent test:dashboard -- <the seven specs> --workers=2 --trace=on --reporter=list`,
started by `run.sh` only at a one-minute load of 30–50. Thirty `yes`
burners held the load (the natural load was 5.6 when the slice started);
the last run had none.

| Label | Load before → after | Result | Slowest case |
| --- | --- | --- | --- |
| `traced1` | 30.8 → 48.1, burners | 11 passed, 78 s | return 17.7 s |
| `traced2` | 31.6 → 42.1, burners | 11 passed, 53 s | return 13.8 s |
| `pass1` | 42.1 → 52.9, burners, ended outside the profile | 11 passed, 99 s | reading 25.3 s |
| `pass2` | 45.7 → 67.9, burners, ended outside the profile | 11 passed, 136 s | return 26.4 s |
| `pass3` | 48.7 → 31.3, no burner, the figure decaying from `pass2` | 11 passed, 30 s | return 9.3 s |

Five consecutive passes at two workers. Seconds from the traces, by
position; the worker fixture's time is in the trace and outside the case's
reported duration (journey, `traced1`: trace 14.4 s, reported 10.7 s, worker
fixture 3.7 s):

| Run | Position | Worker fixture | `origin` | `dashboard` |
| --- | --- | --- | --- | --- |
| `traced1` | first backend case, each worker | 3.7, 3.7 (`queuedClaudeBoundaryReady`) | 0.3, 0.5 | none |
| `traced1` | later backend cases (4) | 0 | 0.3–0.7 | none |
| `traced1` | first page case, each worker | 6.0, 4.0 (`queuedClaudePreviewReady`) | 0.3, 0.3 | 1.8, 1.7 |
| `traced1` | later page cases (3) | 0 | 0.4–0.5 | 1.3–1.6 |
| `traced2` | first backend case, each worker | 2.1, 2.1 | 0.2, 0.2 | none |
| `traced2` | later backend cases (4) | 0 | 0.3–1.1 | none |
| `traced2` | first page case, each worker | 4.0, 2.8 | 0.2, 0.2 | 1.0, 1.1 |
| `traced2` | later page cases (3) | 0 | 0.3–0.5 | 1.0–2.6 |

In `pass2`, at load 46 → 68, the worker fixtures took 13.5 and 13.1 s
(backend) and 11.1 and 8.3 s (page), still outside the cases: first
`origin` 0.9 and 0.8 s against 0.3–1.1 s later, first `dashboard` 2.7 and
2.8 s against 2.2–2.9 s later. The artifact trace of `traced1` shows the
origin and bundle started by the first backend cases' worker fixture and
the app build started only when the first page case's worker fixture asked
for it (6.0 s), so a backend-only selection still builds no app.

Reported durations, seconds:

| Case | `traced1` | `traced2` | `pass1` | `pass2` | `pass3` |
| --- | --- | --- | --- | --- | --- |
| journey (`landed-ci-automatic-repeat:42`) | 10.7 | 6.0 | 15.3 | 16.0 | 3.4 |
| refused (`:115`) | 10.4 | 4.7 | 15.6 | 14.7 | 3.0 |
| uncertain (`:142`) | 12.2 | 6.8 | 7.8 | 11.1 | 3.6 |
| saved outcomes (`:174`) | 3.4 | 2.2 | 3.5 | 4.8 | 1.4 |
| accepted request | 11.1 | 5.4 | 5.5 | 11.3 | 3.3 |
| verdict | 4.8 | 3.0 | 2.7 | 3.6 | 1.7 |
| proof | 13.3 | 9.1 | 12.6 | 21.2 | 5.6 |
| return | 17.7 | 13.8 | 20.3 | 26.4 | 9.3 |
| reading | 11.5 | 11.3 | 25.3 | 16.0 | 7.2 |
| settings | 4.0 | 3.2 | 11.5 | 5.9 | 2.3 |
| warning | 12.1 | 11.1 | 21.0 | 16.6 | 6.3 |

Two cases passed above 25 s, both in runs that ended above load 50: the
reading case at 25.3 s (`pass1`: `dashboard` 2.1 s, 4.7 s of arrangement
before `goto`, the Board and the card 9 s, the comparison 3.5 s) and the
return case at 26.4 s (`pass2`: `dashboard` 2.8 s, arrangement and the
Board about 10 s, three readings of the comparison). Neither spent time in
this slice's preparation; the arrangement is slice 8's and the profile
verdict slice 10's.

**Consumers.** `consumer-trace.mjs --checkout "$PWD" --base a445b7854`
(output kept as `consumer-trace.md` beside the logs), by group:

| Consumers | Disposition |
| --- | --- |
| The three backend repeat specs, `recently-done-ci-automatic-repeat.spec.ts`, the three Intent follow-up specs (through `ciFollowUpSettledReading.ts`) | run: the five runs above |
| The 25 other specs that import `landedCiHistoryTest.ts` | run: all 28 importers once at two workers, candidate 52 passed (load 13.8 → 9.3), then the 27 that exist on `8aa440077` in the base worktree, 51 passed (load 8.9 → 9.0); per-spec passing counts are equal, the one difference being `landed-ci-repeat-accepted-request.spec.ts`, which slice 3 added. Their files are unchanged |
| `start-origin-demand.spec.ts`, `dashboard-artifact-demand.spec.ts` | run: 1 and 5 cases passed, unchanged files |
| Takers of the three worker fixtures whose shared function changed: `queuedClaudePreviewReady` (`intent-project-scope-timing-refresh.spec.ts`, and the other specs through `queuedClaudePreviewTest`), `queuedCodexPreviewReady` (`tests/launches/agent-launch-preparation-codex.spec.ts`), `dashboardPreviewReady` (`intent-summary-story-comparison-sort.spec.ts` through `intentSummarySortTest.ts`), and `queuedCodexOriginReady`, unchanged (`backend-tests/launches/agent-launch-preparation-codex-retry.spec.ts`) | run: one spec for each fixture with the two demand specs, two workers, 20 passed (load 25.4 → 15.1). The other `queuedClaudePreviewTest` specs: reused, the same fixture and artifact keys the refresh spec and the four named page specs exercised |
| Every other importer of `pageTest.ts` (372 files name it; every dashboard spec reaches it) | excluded: they take none of the changed fixtures; a worker fixture nobody asks for is not set up, and the added one is declared for every pool alike, so no worker population splits. Hosted CI runs them |
| `originRepository` matches: `startOrigin.ts`, `preparationPage.ts`, `responsiveStart.ts`, `keptStartJourney.ts`, `storyDependencyFixture.ts`, `codexStart.ts`, `cursorStart.ts`, `startOriginTest.ts`, `storedReviewChoices.ts`, the specs that set it with `test.use`, and the `dough-test-optimization` scripts' own `originRepository` | excluded: the fixture's contract is unchanged; the new test wraps it as `queuedClaudePreviewTest` does, and no named spec sets it. The scripts' function is another symbol |
| `eslint.config.mjs`, `processGroup.ts`, `voiceRecovery.ts`, `launchJourney.ts`, `pageRequestNoting.ts`, `page-teardown-drain.spec.ts`, the READMEs, `writing-journeys.md`, `project-test-findings.md`, `tests/ci-test-data.md`, `ciMakeMe.mjs` | excluded: they name `pageTest.ts` or `landedCiHistoryTestData.mjs` by path or in prose; nothing they state changed |
| `.planning/` records, evidence and seeds, `ProjectFindings.md`, plan 582's mention of `preparePreviewInputs` | excluded: history; this record states the rename |

`npm run --silent typecheck:dashboard`, `npx eslint` and
`npx prettier --check` on the seven changed files: exit 0 each.

Gaps: hosted CI on a published revision is not observed (nothing is
committed); no traced run under natural load, the machine offered 5–14
without burners; the other `queuedClaudePreviewTest` specs and the whole
suite were not run locally.

### 8. Kept landings start from a kept published story
Type: Behavior
Status: done
Proof: The seven repeat specs pass three consecutive times at two workers.
A kept-landing case reaches its first wait at least a third sooner than
slice 6 recorded for it (3.7 s at one worker, load 39–50), position and load
matched in a paired traced run. The journey still publishes and
completes its story for real. Faults F2, F8, F9, F15, F18, F3, F16, F17,
F19 and F20–F24 each still fail their owner, rerun for every case whose
arrangement path changed.

Behavior: A machine keeps a landing at a stage of its repeat for a published
completion → a case starts → the published story it reads was published once
and kept, and the case pays for its own landing and server only.

- The kept story has one owner beside `completedPublishedStory`, used by
  `keepRepeatLanding`; no second arrangement of a landing. Slice 6's working
  form: a declared completed history (`queuedReadyRepository`, the take, the
  implementation and the completion with `makeMe.aDoneRecord`) prepared once
  per worker and copied per case by the `origin` fixture. A copied finished
  checkout breaks on its remote and retained worktree, and `completedAt`
  ages, so nothing is kept between runs.
- What only a real completion shows stays with the journey and with
  `completedPublishedStory`'s own checks.

#### Slice 8 record

Observed on 2026-11-12, 18:41–20:10 local, on `e5ba5af6f` with this slice's
uncommitted change, Node 24.21.0, AC power throughout. Logs, traces and the
scratch scripts (`run.sh`, `pair2.sh`, `firstwait.py`, `fixtures.py`,
`steps.py`, `fault.py`, `importers.py`) are in
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice8/`; nothing scratch entered
the repository. Not committed, not published. Other worktrees' suites, a
virtual machine and another project's tests loaded the machine throughout:
the natural one-minute load moved between 15 and 85 within minutes.

**Design.** `dashboard/tests/support/keptPublishedStory.ts` (145 lines) is
the kept story's owner, beside `completedPublishedStory.ts`, which is
unchanged with its 84 specs:

- The story is slice 6's declared history: `queuedReadyRepository()`,
  `takeRevision` (Yui, Trunk Mode, publisher `another-publisher`), her
  implementation, and her completion, which removes the agent profile,
  leaves Story B queued and adds `makeMe.aDoneRecord`. A second trunk,
  `"intent"`, puts Intent's settings and sources before the Take, where
  `publishIntentTrunk` put them: `intentStoryWorktree.ts` now exports that
  commit as `intentTrunkRevision` and `publishIntentTrunk` writes the same
  files and message from it.
- Preparation is the worker's. `pageTest.ts` declares two more worker
  fixtures, `keptStory` and `keptIntentStory`; each calls
  `prepareKeptStory(trunk)` once and answers the description it prepared.
  `prepareKeptStory` declares the story completed now, starts one origin from
  that description through `startOrigin` (the run's queued origin with the
  later revisions committed and pushed, the existing path) and keeps a copy
  of its bare origin with `keepStartedOrigin` in `startOriginPreparation.ts`,
  in the per-process map private preparations already use.
  `preparedStartOrigin` looks there first, so the `origin` fixture of a case
  given that description as `originRepository` copies an origin that already
  holds every revision and pushes nothing. No second cache and no second
  preparation path. Slice 6's own form, a private materialization of the
  whole description, was tried first: it cost a worker 7.5–12.9 s per trunk
  with two workers at load 22 → 38, because it writes and commits the
  installed skills again. Starting from the run's queued origin costs
  1.3–4.9 s (table below).
- Opt-in is the `queued…Test` form: `startingFromKeptStory` and
  `startingFromKeptIntentStory` are `originRepository` fixtures a test extends
  itself with; each first resolves the test's own `originRepository`, which
  waits on `queuedClaudeBoundaryReady` or `queuedClaudePreviewReady`. The
  refused, uncertain and warning cases are declared with a
  `keptStoryTest = test.extend(startingFromKeptStory)` beside their file's
  `test`; the accepted-request spec's `test` is extended; the three Intent
  follow-up specs get theirs from `ciFollowUpSettledReading.ts`.
- `keepRepeatLanding` reads the completion with `keptStoryCompletion(origin)`
  (the revision that added Story A's done record on `main`) and no longer
  calls `completedPublishedStory`; an origin that holds no kept story stops
  with a message naming the opt-in. `keepSettledRepeat` no longer calls
  `publishIntentTrunk`. The journey still publishes and completes its story
  through `prepareRepeatScenario`; `saveRepeatRequests` is unchanged.
- The server start of each case is not removed by this slice.

Changed files and line counts: `keptPublishedStory.ts` 145 (new),
`startOriginPreparation.ts` 249, `pageTest.ts` 207,
`ciFollowUpKeptLanding.ts` 226, `ciFollowUpSettledReading.ts` 49,
`ciFollowUpPageLanding.ts` 37 (comment), `intentStoryWorktree.ts` 112,
`landed-ci-automatic-repeat.spec.ts` 247,
`landed-ci-repeat-accepted-request.spec.ts` 78,
`recently-done-ci-automatic-repeat.spec.ts` 96, and
`dashboard/tests/fixture-origins.md`. The three cases declared with
`keptStoryTest` are reindented by Prettier, which keeps the hugged form for
`test(` only; their statements and expectations are the same
(`git diff -w`). No product code, timeout, sleep, retry or skip.

**The paired first wait.** `pair2.sh` started the base (a detached worktree
of `e5ba5af6f` at `slice8/before`, set up with `setup-native.mjs npm`,
`browser`, `check`) and the candidate at the same moment, so both saw the
same load, each
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts --workers=1 --trace=on --reporter=list`.
A round started only at a one-minute load of 39–50. Back-to-back runs were
tried first and dropped: the load moved from 38 to 60 inside one run.
Seconds from the trace, from the case's start to its first wait, to that
wait's answer, and to the case's end, worker fixtures taken out
(`firstwait.py`). The accepted-request case is the fifth of five in its
worker on both sides, the case slice 6 traced; the candidate's kept story was
prepared by the refused case's worker fixture (2.2, 1.7 and 4.8 s).

| Round | Load start → end | Case | Base: first wait / answer / case | Candidate | First wait sooner by |
| --- | --- | --- | --- | --- | --- |
| 1 | 48.0 → 40.7, natural | accepted request | 2.3 / 3.2 / 5.7 | 1.2 / 3.0 / 4.9 | 48% |
| 1 | | refused | 4.5 / 6.4 / 9.3 | 1.5 / 3.4 / 5.9 | 67% |
| 1 | | uncertain | 2.7 / 3.6 / 5.7 | 1.1 / 1.9 / 3.9 | 59% |
| 2 | 40.7 → 32.1, natural, ended below the window | accepted request | 2.6 / 4.5 / 9.3 | 1.7 / 3.6 / 8.2 | 35% |
| 2 | | refused | 4.1 / 5.9 / 9.7 | 1.9 / 3.8 / 7.6 | 54% |
| 2 | | uncertain | 4.6 / 6.4 / 12.0 | 2.4 / 4.3 / 7.8 | 48% |
| 3 | 41.5 → 53.9, 30 burners, ended above the window | accepted request | 11.7 / 12.6 / 21.2 | 7.2 / 8.0 / 15.8 | 38% |
| 3 | | refused | 13.0 / 14.9 / 24.8 | 9.1 / 12.0 / 19.7 | 30% |
| 3 | | uncertain | 9.8 / 11.6 / 19.0 | 6.5 / 9.3 / 16.2 | 34% |

The accepted-request case reached its first wait 35–48% sooner in the three
rounds; the refused case 30% sooner in the round that ended above the
window, under a third. Against slice 6's 3.7 s for the same case and
position at load 39–50: 1.2 and 1.7 s in the two rounds inside or below
that load, 7.2 s in the round that left it at 53.9. What remains before the
first wait is the `origin` copy (0.3–1.5 s) and the server start.

**Runs of the seven specs at two workers**, each
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=<file> npm run --silent test:dashboard -- <the seven specs> --workers=2 --trace=on --reporter=list`,
natural load, no burner:

| Label | Load before → after | Result |
| --- | --- | --- |
| `second` | 31.7 → 34.0 | 11 passed, 44 s |
| `pass1` | 47.3 → 35.8 | 11 passed, 152 s |
| `pass2` | 34.6 → 28.5 | 11 passed, 92 s |
| `pass3` | 28.5 → 27.4 | 11 passed, 78 s |

Four consecutive passes; between `second` and `pass2` only a comment in
`keptPublishedStory.ts` changed. Reported durations, seconds:

| Case | `second` | `pass1` | `pass2` | `pass3` |
| --- | --- | --- | --- | --- |
| journey | 7.5 | 18.1 | 10.6 | 13.2 |
| refused | 5.7 | 13.5 | 7.7 | 9.2 |
| uncertain | 5.5 | 17.1 | 11.2 | 7.3 |
| saved outcomes | 2.5 | 7.1 | 5.1 | 2.7 |
| accepted request | 5.0 | 16.2 | 10.0 | 7.8 |
| verdict | 2.3 | 8.4 | 6.4 | 5.1 |
| proof | 6.4 | 22.2 | 20.8 | 10.9 |
| return | 10.0 | 31.8 | 25.6 | 16.9 |
| reading | 5.5 | 18.0 | 8.7 | 12.2 |
| settings | 2.4 | 6.3 | 3.6 | 4.8 |
| warning | 5.3 | 16.3 | 6.9 | 11.6 |

Worker fixtures, seconds, each outside its case's reported duration:

| Run | `queuedClaudeBoundaryReady` | `keptStory` | `queuedClaudePreviewReady` | `keptIntentStory` |
| --- | --- | --- | --- | --- |
| `second` | 3.6, 3.6 | 1.3, 1.5 | 2.3, 0.4 | 1.3, 1.3 |
| `pass1` | 12.0, 12.1 | 3.0, 3.4 | 10.6, 8.0 | 3.7, 3.9 |
| `pass2` | 5.5, 5.5 | 2.3, 2.7 | 8.9, 8.2 | 4.9, 4.9 |
| `pass3` | 3.8, 3.8 | 2.4, 1.9 | 5.5, 3.6 | 2.2, 2.1 |

Toward slice 10's verdict: the return case passed above 25 s twice, 31.8 s
in `pass1` and 25.6 s in `pass2`. Its trace in `pass1`: `origin` 0.8 s,
`dashboard` 2.2 s, the Board paged to Recently done and the card about 8 s,
then five readings of the comparison of 1.7–3.5 s each and 3.2 s of
teardown; in `pass2` `origin` 1.6 s, `dashboard` 2.9 s, the Board about 8 s.
None of it is the story's publication. One more two-worker pair, base and
candidate at once under 24 burners, drove the load from 32.2 to 120–125:
the same four page cases (proof, return, reading, warning) reached the 30 s
bound on both sides. It is outside the profile and counted for neither.

**Fault controls.** `fault.py <name>`: one scratch edit, the owning specs at
one worker with `--reporter=list`, the file's bytes restored, then
`git diff --stat -- dashboard/server dashboard/src`, empty after each and at
the end. Edits are those of slices 2–5. Each failed at the labelled
expectation, none at the 30 s bound:

| Fault | Edit | Case, expectation, received | Load |
| --- | --- | --- | --- |
| F2 | Both `admitted.request !== undefined` guards dropped | Refused, "rerun requests": `[71, 71, 71]` for `[71]`; accepted request, "no second request": `[71, 71]` for `[]`; the journey, "rerun requests" | 37.7 → 31.4 |
| F8 | A refused reply saved as `accepted` | Refused, "saved reply": `accepted` for `refused` | 31.4 → 26.0 |
| F9 | The `submission.kind !== "accepted"` return never taken | Uncertain, "stays unverified": `recovered`, "CI timing returned to range" | 26.0 → 28.2 |
| F18 | Turning off deletes entries that hold a request | Refused and uncertain, "follow-up off": no card | 28.2 → 23.9 |
| F3 | `slow` always false in `observeRepeat` | Accepted request, "slow card": `recovered`; warning, "slow card": "CI timing returned to range" | 23.9 → 23.8 |
| F16 | The in-progress branch answers `unverified` | Accepted request, "progress read", and warning, "progress saved": `unverified` for `progress` | 23.8 → 24.4 |
| F17 | `withOriginalFollowUpSamples` takes `request.outcome.repeat` first | Accepted request, "original kept": `run/71/2`, 106000 for `run/71/1`, 105000 | 24.4 → 22.6 |
| F15 | `completedFollowUps` selects no landing that holds a request | The journey, "accepted request's card"; refused, "refused card"; uncertain, "stays unverified"; accepted request, "progress card": no card each | 22.6 → 24.5 |
| F19 | `card.kind === "slow"` never matches before the caution | Warning, "caution": the warning reads no caution | 20.3 → 19.0 |
| F19, the colour | The card's class names `unverified` for a slow card | Warning, "red warning": `rgb(29, 29, 27)` | 19.0 → 15.6 |
| Wide warning | `.ci-follow-up-slow` gains `min-width: 480px` | Warning, "warning whole on the phone": 544.6 for at most 390.5 | 15.6 → 19.1 |
| F20 | `reference: { ...request.reference, evidence: [] }` | Reading, "evidence rows": 0 for 7; return, "evidence rows on first render": 0 for 6 | 19.1 → 27.7 |
| F21 | The reading route awaits `exactRepeatRun` before it answers | Reading, "no CI request from first render"; proof, "no CI request from proof navigation"; return, "no CI request from refresh" | 28.3 → 31.5 |
| F22 | `scopeEvidenceOf` takes `reading.repeat ?? reading.original` | Proof, "the original's proof in Summary": no link to attempt 1 | 31.5 → 36.4 |
| F23 | `FollowUpSelection` no longer navigates away on another selection | Return, "the selection leaves the comparison's address": `SEED-A#a` | 36.4 → 31.1 |
| F24 | `tabIndex` −1 on the repeat attempt's link | Reading, "Tab reaches the repeat's link": inactive | 31.1 → 29.2 |

Under F2 the uncertain case passed, as in slice 2, where F2 is read on the
refused owner. Six of the sixteen ran above load 27 at their start or end;
each still failed at its expectation.

**Kept state the product refuses (key example 7).** One scratch edit of
`keepRepeatLanding`, the story's entry with `eligible: "yes"`: the refused
and uncertain cases fail at "saved reply" with no request saved
(`undefined` for `refused` and for `uncertain`), load 24.5 → 20.3. Reverted.

**Consumers.** `consumer-trace.mjs --checkout "$PWD" --base e5ba5af6f --term
keepStartedOrigin --term preparedStartOrigin --term intentTrunkRevision
--term publishIntentTrunk --term keepRepeatLanding --term keepSettledRepeat
--term keepRepeatLandingForPage --term startingFromKeptStory --term
keptStoryCompletion`, no scratch file in the tree (output kept as
`consumer-trace.md` beside the logs), by group:

| Consumers | Disposition |
| --- | --- |
| The three backend repeat specs, `recently-done-ci-automatic-repeat.spec.ts`, the three Intent follow-up specs (through `ciFollowUpSettledReading.ts` and `ciFollowUpPageLanding.ts`): every importer of `ciFollowUpKeptLanding.ts` and `keptPublishedStory.ts` | run: the four passes and every fault above |
| `start-origin-demand.spec.ts`, `dashboard-artifact-demand.spec.ts`, `start-origin-isolation.spec.ts` (preparation, the explicit override, private preparation), `story-reference-navigation.spec.ts` (a description whose later revisions each case still pushes), and one taker of each other worker fixture: `intent-project-scope-timing-refresh.spec.ts`, `tests/launches/agent-launch-preparation-codex.spec.ts`, `intent-summary-story-comparison-sort.spec.ts`, `backend-tests/launches/agent-launch-preparation-codex-retry.spec.ts` | run: `consumersA`, two workers, load 25.2 → 37.2, 24 passed and 2 at the 30 s bound, running side by side: the refresh case `:126`, this story's known loaded failure (slice 9), and the sort case `:72` at `openSummary`'s click. Those two specs again, two workers: candidate 3 passed, load 31.5 → 34.0, sort 20.9 s; base 2 passed with refresh `:126` at the bound, 34.0 → 35.4, sort 21.1 s. The sort case takes `dashboardPreviewReady` and no origin; its trace is the same on both sides (`comparisonRepository` 4.5 and 3.7 s, the journey 15 s) |
| The 12 specs that call `publishIntentTrunk` themselves | run, base and candidate at the same moment, one worker each. Ten specs, 18 cases, load 28.7 → 47.9: the same result case by case, 17 passed and `intent-story-changes-landed-run.spec.ts:75` at the bound on both (32.2 and 31.9 s). Four specs, load 46.1 → 31.1 (two of the twelve, `intent-done-default-answer-selection` again and `intent-done-landed-review-mode`): 3 passed and `intent-done-default-answer-selection.spec.ts:42` at the bound on both (33.4 and 32.0 s) |
| The other specs that import `intentStoryWorktree.ts`, 80 in all with the ten above (77 through `intentStoryPage.ts`, the rest through `retainedIntentCompletion.ts`, `retainedIntentLanding.ts`, `intentCompletedStory.ts` and `intentSummaryStoryComparisonShared.ts`) | excluded: the module's other exports are unchanged, and `publishIntentTrunk` publishes the same tree and message from the base's module and the candidate's (`neutral/check.mjs`: tree `267db82e7a6e1fec8abfab8df21fc25f68a8a692`, "intent locations and tests", clean checkout, both). Partly run on the candidate, two workers, while the natural load passed the profile: the first 21 of them 30 passed and 8 at the bound, load 39.9 → 70.0; the next run stopped at 3 passed and 8 at the bound, load 39.5 → 48; a first attempt of all stopped at load 85. Not counted |
| Every other importer of `pageTest.ts` and `startOriginPreparation.ts` (every dashboard spec reaches them), `startOrigin.ts`, `startOriginInitialization.ts`, `startOriginTakes.ts`, `globalSetup.ts`, the `artifact-demand` fixtures | excluded: they take neither added worker fixture, which is set up only for a test that names it and is declared for every pool alike; `preparedStartOrigin` answers as before for a description no worker kept; the run artifact list is unchanged. Hosted CI runs them |
| `originRepository` matches (`preparationPage.ts`, `landedCiHistoryTest.ts`, `codexStart.ts`, `cursorStart.ts`, `startOriginTest.ts`, `storedReviewChoices.ts`, the specs that set it with `test.use`, the `dough-test-optimization` scripts' own `originRepository`) | excluded: the fixture's contract is unchanged; the new fixtures wrap it as `queuedClaudePreviewTest` does |
| `completedPublishedStory.ts` and its importers, matched by the import `ciFollowUpKeptLanding.ts` dropped; `ciFollowUpScenario.ts`, `ciFollowUpSavedRequests.ts`, `ciFollowUpKeptPriors.ts`, `ciFollowUpRepeatRun.ts`, `ciFollowUpRepeatStage.ts`, which name `ciFollowUpKeptLanding.ts` | excluded: unchanged files; `keepRepeats` and the exported types are as they were |
| Matches of `claimant`, `repeatMs`, `averageSeconds`, `keptStory` (`keptStoryAMark`) in product code, skills and other support | excluded: other symbols of the same spelling |
| `dashboard/tests/fixture-origins.md` | changed: it now says a worker may keep a started origin |
| `eslint.config.mjs`, `processGroup.ts`, `voiceRecovery.ts`, the READMEs, `docs/maintainer/`, `ProjectFindings.md`, `.planning/` records, evidence and seeds | excluded: they name a changed file by path or in prose; nothing they state changed |

`npm run --silent typecheck:dashboard`, `npx eslint` and
`npx prettier --check` on the ten changed source files and
`fixture-origins.md`: exit 0 each.

Source-review commitments. S8.3, "and the published story and server each
case arranges, through a kept published-story arrangement that cases
share": used for the published story only, as above; every case still
starts its own server. S8.4, "Every spec that uses a changed fixture keeps
its cases and assertions and gives the result it gave before": the diff
changes no expectation in the seven specs and no file of any other spec;
the seven pass as before, each fault above still fails its owner at the
same expectation, and the consumer runs are in the table.

Gaps: hosted CI on a published revision is not observed (nothing is
committed). The first wait is a third sooner for the traced case in every
round, and under a third (30%) for the refused case in the one round that
ended above load 50. No run of the seven specs stayed inside load 30–50
under burners: the natural load supplied the profile and left it without
notice. Six fault runs started or ended above load 27. Of the 80 specs that
import `intentStoryWorktree.ts`, 12 have a counted paired run; the rest
rest on the equal tree and the uncounted partial runs. Cases outside this
story reached the 30 s bound at natural load 37–70 on base and candidate
alike (`intent-summary-story-comparison-sort.spec.ts:72`,
`intent-story-changes-landed-run.spec.ts:75`,
`intent-done-default-answer-selection.spec.ts:42`, and the sixteen in the
uncounted partial runs); this slice changes none of them and repairs none.
The kept story's implementation is one declared file of its own, not the
two files `writeCompletedStoryImplementation` writes: no kept-landing case
reads it, and sharing them would edit `completedStoryInput.ts` under
`completedPublishedStory.ts`'s 84 specs.

#### Slice 8 acceptance and refactor

- The implementing agent stopped on a usage limit after writing the record
  above; nothing was committed or pushed. Its logs back every claim, and on
  the actual files the seven specs passed 11 of 11 at two workers (load
  19.5 → 14.3), with typecheck, eslint and prettier clean. Accepted.
- The refactor pass removed a lookup in `startOriginPreparation.ts` that the
  slice made unreachable (now 248 lines; its seam if it grows: the origins
  one process holds, about 75 lines), wrote the kept story's claimant once,
  and reflowed comments. Private preparation, demand and isolation specs and
  the accepted-request case passed, except
  `start-origin-isolation.spec.ts:140` at the 30 s bound at load 40 → 46
  beside `:40`; alone it passed in 20.4 s at load 43 → 42. That is DD-479,
  recorded before this story; SEED-287, which covered it, has closed.
- Loaded failures outside this story's named specs, on trunk and this branch
  alike, go to the developer at the handoff: `start-origin-isolation:140`,
  `intent-summary-story-comparison-sort:72`,
  `intent-story-changes-landed-run:75` and
  `intent-done-default-answer-selection:42`, at load 37–70.
- For slice 10: the return case took 31.8 s at load 47 → 36, in the profile;
  its time is the Board paged to Recently done (about 8 s) and five readings
  of the comparison, not preparation.

### 9. The project scope timing refresh cases start from kept history
Type: Behavior
Status: done
Proof: `intent-project-scope-timing-refresh.spec.ts`, and any file its cases
divide into, pass three consecutive times at two workers; neither case
starts a collecting server or publishes a comparison story it does not read.
Each observation the cases keep (the endpoint moves to the new head with "no
matching collected observation", CI evidence stays at the latest revision,
three run rows remain, the endpoint datetime changes, no acquisition, the
return to the selected landing with two rows, and the first case's return
and restore) fails under one deliberate product fault. Each observation that
left real collection has a named owner among maintained checks, shown by its
fault failing that owner.

Behavior: A machine keeps the history of three builds and their landings →
a non-collecting dashboard opens Project Intent, a revision check moves the
endpoint, and the reader returns to the selected landing → the same rows and
evidence read as today, with no collection and one server.

- Reuse `keepLandedCiHistory` and `makeMe.aLandedCiHistory` as the
  neighbouring scope-history specs do.
- Collected history through an uncollected trunk head stays with
  `intent-project-scope-timing-history.spec.ts`; credit it only where a
  fault shows it catches the observation.

#### Slice 9 record

Observed on 2026-11-12, 20:32–21:14 local, on `20d63a685` with this slice's
uncommitted change, Node 24.21.0, AC power throughout; natural load until
21:14, then 24 `yes` burners started and stopped by `run.sh` for `b1`–`b3`
when the natural load fell to 4–6. Logs, traces, fault logs and the scratch scripts
(`run.sh`, `fault.py`, `cons.sh`, `steps.py`, `fixtures.py`, `summ.sh`) are in
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice9/`; nothing scratch entered
the repository. Not committed, not published.

**Design.** Both cases now start from what a machine keeps and read it in one
dashboard that collects nothing; the cases read the published comparison
story (its Changed tests, Summary and file Proof, and the Done comparison
whose reads `acquisitions()` waits out), so the story stays, kept instead of
published:

- The story is the declared comparison history that sort already
  materializes. `intentSummaryStoryComparisonRepository.ts` now exports that
  description (`declaredSummaryComparisonHistory`) and its endpoints in a
  checkout started from it (`declaredSummaryComparisonEndpointsIn`, each named
  revision the commit whose message is its name);
  `materializeDeclaredSummaryComparisonRepository` builds from the same two,
  so sort reads what it read before. No third arrangement.
- Slice 8's owner keeps it: `KeptStoryTrunk` gains `"summary comparison"`,
  `pageTest.ts` a worker fixture `keptSummaryComparisonStory`, and
  `keptPublishedStory.ts` the opt-in `startingFromKeptSummaryComparisonStory`.
  The declared history has merges (the story branch's integration and the
  landing), so `initializeStartOrigin` now commits a shared description's
  later revisions with the parents they name, as `materializeRepository`
  does; no start-origin description had `parents` before, so every other
  description commits as it did. `fixture-origins.md` says so. The declared
  form was chosen over `materializeDeclaredSummaryComparisonRepository` per
  case because that form builds no start origin (the case needs
  `origin.originGit` and `origin.project` to move the head) and cost
  3.7–4.5 s per case in sort's trace (slice 8), as much as the publication.
- `projectScopeHistoryFixture.ts` (140 lines) owns the rest: its `test` is
  `queuedClaudePreviewTest` started from the kept story with the `dashboard`
  fixture as `startLandedCiReader`, the only server; `readKeptProjectHistory`
  serves the story (`serveSummaryComparisonStory`) and the runs live
  (`serveCollectedScopeFileRuns`, kept for run 104's live proof), keeps the
  history of the three landings through `makeMe.aLandedCiHistory`
  (`inTrunkOrder` of the project's first-parent order, `measuredLanding` and
  `proofFor` with the case and file units of each run's files), and opens the
  Done story. No launch record is kept: they fed collection only.
- `serveSummaryComparisonStory` takes the proofs it serves first as an
  optional `proofs`, defaulting to the breakdown proofs it served before, so
  its other callers are unchanged. The fixture passes none: the collected
  summaries it serves next replaced them before any read, and producing them
  spawned the real CLI producer three times per case (about 1.2–1.6 s at load
  30–38).
- The spec (206 lines) keeps both cases in one file: no `test.use` remains and
  neither file nears 250 lines. Its diff (`git diff -w`) changes the imports,
  the arrangement call and its facts (`workflow`, `title`, `retainedRunIds`
  dropped), and drops the `try`/`finally` that closed the second reader; no
  expectation changed. Lines 151–160 (return, reopen Project, Proof tab,
  endpoint, three rows; the diagnosis's 160–169) stay: the
  Project-side restore fault below fails `:118` there and `:52` passes.

Line counts: the spec 206, `projectScopeHistoryFixture.ts` 142,
`intentSummaryStoryComparisonServing.ts` 58,
`intentSummaryStoryComparisonRepository.ts` 184, `keptPublishedStory.ts` 168,
`pageTest.ts` 217, `startOriginInitialization.ts` 98, `fixture-origins.md`
27. `autoRefreshJourney.ts` unchanged. No product code, timeout, sleep,
retry or skip. `grep` of the spec and its fixture finds no
`recheckingLandedCi`, `collectingLandedCi`, `serverMode`, boundary mode,
`publishSummaryComparisonStory`, `completedPublishedStory` or
`startDashboardServer`.

**Runs at two workers**, each
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=<file> npm run --silent test:dashboard -- tests/intent/intent-project-scope-timing-refresh.spec.ts --workers=2 --trace=on --reporter=list`,
started by `run.sh` only at a load of 30–50. Both cases are first in their
workers in every run. The worker fixtures are outside the reported durations.

| Label | Code | Load before → after | `:52` | `:118` | `keptSummaryComparisonStory` | Comparison settles |
| --- | --- | --- | --- | --- | --- | --- |
| `before` | unedited spec | 33.6 → 38.0 | 21.6 s | 22.4 s | none | 3.2–3.3 s |
| `t2` | this change | 31.1 → 38.3 | 17.5 s | 19.9 s | 5.8, 5.7 s | 4.0, 4.3 s |
| `t3` | with timing steps only | 30.5 → 30.9 | 22.1 s | 26.0 s | 5.0, 4.8 s | 6.0, 5.8 s |
| `p2` | this change | 30.1 → 34.1 | 12.8 s | 14.2 s | 3.9, 3.8 s | 3.5, 3.4 s |
| `p3` | this change | 34.1 → 35.5 | 11.8 s | 13.5 s | 4.2, 4.0 s | 2.9, 2.8 s |
| `p4` | this change | 34.8 → 35.3 | 12.7 s | 14.7 s | 4.2, 4.0 s | 3.4, 3.4 s |
| `b1` | final, 24 burners | 30.8 → 39.4 | 20.2 s | 22.3 s | 5.1, 4.9 s | 3.5, 3.6 s |
| `b2` | final, 24 burners | 39.4 → 43.6 | 20.1 s | 22.2 s | 4.9, 4.6 s | 5.7, 5.1 s |
| `b3` | final, 24 burners | 43.6 → 43.0 | 13.4 s | 14.8 s | 5.9, 5.4 s | 3.0, 2.4 s |

`b1`–`b3` are three consecutive passes of the final code, under burners;
`p2`–`p4` three consecutive passes before the `proofs` change (with `t2` and
`t3`, five); a `p1` waited five minutes below load 30 and started no run.
Serving the story and runs took 1.0–2.5 s in `b1`–`b3` against 3.0–4.3 s
before the `proofs` change. A first attempt (`try1`, untraced, load 35.7 → 46.3)
failed both cases at the 30 s bound with every observation still ahead or
passing: the two workers prepared the kept story at once (8.2 s each) and the
Done comparison took 10.9 s to answer (`ci-comparison` read). `t3` passed
`:118` at 26.0 s, over the 25 s figure, at a load figure of 30.5 → 30.9:
in its trace `origin` 0.4 s, `dashboard` 0.8 s, serving the story and runs
3.2 s (`serveSummaryComparisonStory` 1.6 s, `serveCollectedScopeFileRuns`
1.6 s: seven spawns of the real CLI producer, three of them for the proofs
the `proofs` change no longer produces), the Board to Recently done 3.1 s, the comparison
5.8 s, then the journey 10 s. What remains in a case is that serving, the
server start, the Board, the comparison's 30 provider calls and the journey;
the publication, the collecting server, collection and the second reader are
gone. The verdict is slice 10's.

**Faults**, `fault.py <name>`: one scratch edit, the refresh spec at one
worker with `--reporter=list`, the file's bytes restored; `git diff --stat --
dashboard/server dashboard/src` empty after each and at the end. They ran
before the `proofs` change, which changes no answer a page reads.

| Observation | Edit | Case, expectation, received | Load |
| --- | --- | --- | --- |
| Endpoint moves to the new head | `useObservedTrunkEndpoint` (`src/IntentCiEvidence.tsx`) changes its endpoint only while it has none | `:118` at `:182` "Observed trunk endpoint main `<next>`": the latest's sha; `:52` passed | 29.1 → 29.7 |
| … with "no matching collected observation" | `historyEndpointOf` (`server/ciHistoryEndpoint.ts`) answers `retained` for `uncollected` | `:118` at `:191`: the note absent | 29.7 → 25.6 |
| CI evidence stays at `Revision <latest>` | the judged scope evidence (`src/IntentScopeEvidence.tsx`) names the observed trunk endpoint's revision as its run's | `:118` at `:190`: `Revision <next>` with "Tree at `<latest>`" | 28.1 → 35.4 |
| Three `Run N` rows remain | `historyEndpointOf` keeps no cohort when no landing is at the endpoint | `:118` at `:192`: 0 for 3 | 24.9 → 27.0 |
| The endpoint datetime changes | `useObservedTrunkEndpoint` keeps its first `at` when the head changes | `:118` at `:193`: the same datetime | 27.0 → 25.2 |
| No acquisition of artifacts 1001–1003 | each history read (`server/intentCiHistoryRead.ts`) starts acquiring every kept build's artifact with a fresh `ciProofArtifactReader()`, not awaited | `:52` at `:115`: 19 for 9; `:118` at `:197`: 19 for 5 | 35.4 → 32.8 |
| Return to `Selected landing <completion>` with two rows | `historyEndpointOf` takes every positioned landing, not those through the selected one | `:52` at `:73` and `:118` at `:205` (the return): 3 for 2 | 20.3 → 15.7 |
| First case's return and restore | the story scope's `selection` is kept in a fresh map (`useKeptReading`, `src/pageIntentReading.tsx`) | `:52` at `:100`: `aria-pressed` "false"; `:118` passed | 15.7 → 18.1 |
| Project-side restore, lines 151–160 | the Project scope's `selection` is kept in a fresh map | `:118` at `:153`: no Proof tab; `:52` passed | 18.1 → 26.8 |

Edits tried that did not produce their regression, recorded and not used:
`revisionLabel(revision)` in `EvidenceNamed` (the Project tree stays at the
latest revision, so both revisions are equal; 2 passed, 25.6 → 24.9);
judging only the head commit in `judgeBranchCi` (2 passed, 26.6 → 33.8, not
pursued); `readCiProofArtifact` remembering no summary and the comparison
reader remembering no answer (2 passed each, 25.2 → 20.3 and 39.7 → 33.1: no
proof or comparison is read again after counting starts); the history
acquisition awaited (`:52` at `:115`, 15 for 8; `:118` at the 30 s bound,
the serial acquisitions slowing every read; 33.8 → 39.7). Five of the
recorded fault runs started or ended above load 27; each failed at its
expectation.

**What left real collection and its owner.** Collection turning three recorded
landings and their served summaries into measured kept builds with proofs.
Owner: `intent-project-scope-timing-history.spec.ts:42` (collected history
through an uncollected trunk head). Fault: `needsCollectedProof`
(`server/landedCiCollectedProof.ts`) is always false. The owner fails at `:89`,
the retained proof of run 101 `undefined` for `"summary"`; both refresh cases
pass, as they no longer depend on collection. Load 26.8 → 27.1. Every other
observation of the refresh cases is still read from the product's history
store and route, now from kept history, and is caught there by the faults
above.

**Consumers.** `consumer-trace.mjs --checkout "$PWD" --base 20d63a685 --term
declaredSummaryComparisonHistory --term declaredSummaryComparisonEndpointsIn
--term materializeDeclaredSummaryComparisonRepository --term KeptStoryTrunk
--term prepareKeptStory --term startingFromKeptSummaryComparisonStory --term
keptSummaryComparisonStory --term initializeStartOrigin --term
readCollectedProjectHistory --term readKeptProjectHistory --term
serveSummaryComparisonStory`, no scratch file in the tree (`consumer-trace.md`
beside the logs), by group:

| Consumers | Disposition |
| --- | --- |
| `intent-summary-story-comparison-sort.spec.ts` through `intentSummarySortTest.ts` (`materializeDeclaredSummaryComparisonRepository`) | run: candidate then base worktree (`8aa440077`) back to back, two workers: 1 passed in 15.8 s (load 33.2 → 32.9) and 1 passed in 17.7 s (32.9 → 32.3) |
| The importers of `keptPublishedStory.ts` (the seven repeat specs, through `ciFollowUpKeptLanding.ts` and `ciFollowUpSettledReading.ts`), `startOrigin.ts`'s `initializeStartOrigin` as the kept stories and the run-wide origins use it (`start-origin-demand`, `start-origin-isolation`, `dashboard-artifact-demand`, `story-reference-navigation`, whose later revisions each case pushes), and the collection owner `intent-project-scope-timing-history.spec.ts` | run: one two-worker run, 24 passed, load 33.0 → 25.3, 86 s; slice 8 recorded the same cases passing |
| `serveSummaryComparisonStory`'s other callers: sort, and `publishSummaryComparisonStory` (`intentSummaryStoryComparisonFixture.ts`) with its 18 spec files | run: sort, `intent-scope-prior-build-states.spec.ts` and `intent-project-scope-timing-history.spec.ts`, two workers, candidate then base back to back: 3 passed (load 39.9 → 30.2) and 3 passed (30.2 → 24.0); the rest reused: they pass no `proofs` and get the same breakdown proofs |
| `projectScopeHistoryFixture.ts`, `autoRefreshJourney.ts` | the refresh spec is the fixture's only importer (the runs above); `autoRefreshJourney.ts` unchanged |
| Every other importer of `pageTest.ts` (371) and of `startOrigin.ts` | excluded: the added worker fixture is set up only for a test that names it and is declared for every pool alike; no other start-origin description names `parents`, so `initializeStartOrigin` commits theirs as before. Hosted CI runs them |
| Matches of `branchSide`, `laterWithoutBuild`, `claimant`, `EndpointName`, `originRepository`, `../support/landedCiHistory.ts`, `./intentSummaryStoryComparisonFixture.ts` | excluded: other uses of the same names, or imports the refresh files dropped from modules that did not change |
| `.planning/` records, `dashboard/tests/fixture-origins.md` | the plan and this record; the fixture document changed as above |

`npm run --silent typecheck:dashboard`, `npx eslint` and `npx prettier
--check` on the seven changed source files, `fixture-origins.md` and this
plan: exit 0 each.

Source-review commitments. S9.1: the spec joins the named specs in the
[Verification](#verification) selection line, and it stays one file. S9.3:
the collection that left the refresh cases keeps its owner,
`intent-project-scope-timing-history.spec.ts`, which the collection fault fails
at `:89`.

Gaps: no run above load 44; `t3` passed one case at 26.0 s before the
`proofs` change; after this slice the share of `try1`'s failures that remains
is the product's comparison read and the Board, slice 10's to measure in the
profile; hosted CI is not observed.

#### Slice 9 acceptance and refactor

- Accepted. The refactor pass gave resolving a declared revision's parents
  one home (`declaredParents` in `tests/support/repository-revision-commit.mjs`,
  used by `repository-history.mjs` and `startOriginInitialization.ts`) and
  the kept scope proof one home (`keptScopeFileProof` in
  `scopeHistoryProofs.ts`, used by the refresh fixture and
  `scopePriorReferenceHistory.ts`); the built proofs and histories are the
  same, and no expectation changed. The repository node tests, the refresh,
  prior-build, sort, start-origin and scope-proof consumers passed at load
  12–20.

### 10. The fit under load and the saving are measured and kept
Type: Behavior
Status: done
Proof: Three consecutive counted two-worker runs of the selection (the seven
repeat specs and the refresh spec with any file it divided into) at a
one-minute load of 30–50 pass, at least one under natural load when the
machine offers it; from their proof records no case exceeds 25 s. One case calls `scenario.ingest` across the
repeat specs, against five on the base. Paired one-worker runs of the base
(`8aa440077`, its four repeat specs and the refresh spec) and the candidate,
three passing observations each: the candidate's median wall time is no more
than 10% above the base's, and fake `gh` calls summed over one passing
one-worker run are fewer on the candidate than on the base. The diff adds no `test.setTimeout`,
expectation timeout, `test.slow`, sleep, retry, skip or runner mode, and no
shard weight names the specs. Hosted CI passes on the published revision.

Behavior: The base worktree and the finished candidate run under like
conditions → the comparison is recorded in this plan → the fit in the profile
and the saving are observed with every preparation and teardown paid.

- The machine is on AC power and fully awake under `caffeinate -s -i`; a run
  on battery is not counted.
- No load guarantees a passing base. Take the pairs in a window where it
  passes; a base that gives no three passing observations is recorded with
  its failures, the comparison uses the base runs that passed, and a miss is
  not rounded up: record and stop for the coordinator's decision.
- A candidate case that fails or exceeds its figure in the profile is a
  failing test under the policy above, repaired before this slice is done.
  Shared preparation is this story's since the amendment.

#### Slice 10 record

Observed on 2026-11-12, 21:40–22:50 local, on `3e29132d4` with this slice's
uncommitted repairs, Node 24.21.0, AC power throughout (`pmset` read before
every timed run; battery 80%, AC attached). Logs, proof records, traces and
the scratch scripts (`run.sh`, `summ.py`, `fixtures.py`, `lines.py`,
`one.sh`, `pairs.sh`, `fault.py`, `fault-intent.py`) are in
`/Users/terryyin/.claude/jobs/296b888d/tmp/slice10/`; nothing scratch entered
the repository. Not committed, not published. The base is the worktree
`base-merged` at `8aa440077`, unmodified. Other worktrees' suites, a JVM and
`gh` loaded the machine throughout; one of them drove the one-minute load
from 32 to 141 during `c1`.

Every profile run was started by `run.sh <label> <burners> 2` only at a
one-minute load of 30–50 and only on AC power, with the command
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<label>-proof.json caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard -- <the eight spec files of the Verification selection line> --workers=2 --trace=on`
(no `--reporter`, so the configured reporter wrote the proof record).
Durations below are the proof record's; positions are inferred from start
and end times per worker (`summ.py`) and agree with the traces (`fixtures.py`).

**Repairs (G1).** The first counted run failed the figure and a later counted
run failed outright, so three cases were repaired, each by doing less:

- `r1` (load 30.4 → 46.2, 16 burners, counted): 13 of 13 passed, but
  `intent-project-scope-timing-refresh.spec.ts:118` took 25.9 s. Its trace:
  3.8 s between the fixtures and `goto` with no page step, which was
  `serveCollectedScopeFileRuns` spawning the real summary producer eight
  times (a fragment and a summary per run, `spawnSync`). Repair in
  `projectScopeHistoryFixture.ts` (119 lines): the provider serves each run's
  summary as `JSON.stringify` of the proof the machine keeps for that run
  (`keptScopeFileProof`, the same builder its history uses) through
  `serveCollectedScopeProofs`; no case spawns the producer, whose output stays
  with collection's own specs. After it the same gap was 0.2 s (`fx1`, load
  29.9 → 28.1). The nine refresh faults of the Slice 9 record, rerun
  (`fault.py`, one worker, load 24.3 → 32.3), each failed at the same
  expectation as in slice 9, none at the bound: ENDPOINT `:118` at `:182`;
  NOTE `:191`; EVIDENCE3 `:190`; ROWS `:192` (0 for 3); DATETIME `:193`;
  HISTACQ2 `:52` at `:115` (19 for 9) and `:118` at `:197` (19 for 5);
  THROUGH `:52` at `:73` and `:118` at `:205` (3 for 2); RESTORE `:52` at
  `:100`; PROJECTRESTORE `:118` at `:153`. Three consecutive passes of the
  spec at two workers (`ref1`–`ref3`, load 18.6 → 15.3): 8.0–9.8 s.
- `c3` (load 30.6 → 42.2, 18 burners, counted, failed): the return case
  failed at "same after reload" (`:55`, the comparison not yet rendered 5 s
  after `page.reload()`, at 30.0 s), `:52` timed out at `:92`, and proof
  (30.8 s) and reading (28.1 s) passed over 25 s. The traces put 8.8–9.6 s of
  each Intent case in paging the phone Board to Recently done and 3.2 s in
  the first comparison read; `:52` was first in a new worker
  (`keptSummaryComparisonStory` 16.6 s, outside its duration) and spent
  16.5 s from `goto` to the settled Done comparison. Repairs:
  - `ciFollowUpReadingPage.ts` (182 lines): `gotoCiFollowUp` opens a
    comparison at its own address (`?project=open-dough&perspective=intent&followUp=<identity>&landing=<revision>`,
    what the card's link leaves and a reload reads) and `reloadCiFollowUp`
    reloads it, each waiting for the dashboard's answer to the page's read
    of the retained comparison, the event `refreshCiFollowUp` already waited
    for (now one `comparisonAnswered`).
  - `intent-ci-follow-up-proof.spec.ts` (69 lines): the proof case opens the
    comparison at its address; the card that opens it stays the reading
    case's (C18).
  - `intent-ci-follow-up-return.spec.ts` (114 lines): divided at the
    navigation boundary into two cases over one arrangement. `:39`, opened at
    its address on the phone: evidence rows on first render, refresh and
    reload read the same comparison, no CI request from refresh or reload
    (C19 first render, refresh, reload). `:66`, opened from the card on the
    phone: a revisit from the card reads the same comparison with no CI
    request, then the Development selection, normal Intent, the card
    reopening it and project Intent at 1440 px (C19 revisit, C21). The
    expectations and their labels are the old case's, plus "evidence rows
    opened from the card" before `:66` reads the comparison's text.
  Faults rerun (`fault-intent.py`, one worker, the three Intent specs, load
  13.3 → 11.3), each at its labelled expectation, none at the bound: F20 the
  return `:39` "evidence rows on first render" and `:66` "evidence rows
  opened from the card" (0 for 6), the reading "evidence rows" (0 for 7);
  F21 proof "no CI request from proof navigation", return `:39` "no CI
  request from refresh", `:66` "no CI request from revisit", reading "no CI
  request from first render"; F22 proof "the original's proof in Summary";
  F23 return `:66` "the selection leaves the comparison's address"
  (`SEED-A#a`); F24 reading "Tab reaches the repeat's link". Three
  consecutive passes of the three specs at two workers (`int1`–`int3`, load
  11.5 → 24.6): 4 of 4 each, 6.4–17.6 s.

`git diff --stat -- dashboard/server dashboard/src` was empty after every
fault and at the end. `npm run --silent typecheck:dashboard`, `npx eslint`
and `npx prettier --check` on the four changed files: exit 0. No changed
file nears 250 lines; `ciMakeMe.mjs` is untouched; no `test.setTimeout`,
expectation timeout, `test.slow`, sleep, retry or skip was added.

Consumers, `consumer-trace.mjs --checkout "$PWD" --base 3e29132d4 --term
serveCollectedScopeProofs --term keptScopeFileProof --term
readKeptProjectHistory --term refreshCiFollowUp --term reloadCiFollowUp
--term gotoCiFollowUp` (`consumer-trace.md` beside the logs):

| Consumers | Disposition |
| --- | --- |
| The refresh spec (the fixture's only importer), the three Intent follow-up specs, `recently-done-ci-automatic-repeat.spec.ts` (imports `ciFollowUpReadingPage.ts`; its helpers are unchanged) | run: the profile runs below |
| `intent-scope-collected-file-timing-gaps.spec.ts`, `scopeHistoryCollection.ts`, `scopeHistoryProofs.ts`, `scopePriorReferenceHistory.ts` | excluded: they match `serveCollectedScopeProofs` or `keptScopeFileProof`, which did not change; only the fixture calls them differently |
| The backend repeat specs and `ciFollowUpKeptLanding.ts`, `ciFollowUpRepeatStage.ts`, `ciFollowUpSavedRequests.ts`, `ciFollowUpSettledReading.ts`, `ciFollowUpLedgerFacts.mjs` | excluded: they match the field names `averageSeconds` and `repeatSeconds`, unchanged |
| `SEED-300` seed, this plan | excluded: prose naming a changed file |

**Key example 1.** Profile runs, two workers, each case's duration in
seconds; "first" is the first case of its worker process:

| Label | Load before → after | Load source | Counted | Result |
| --- | --- | --- | --- | --- |
| `r1` | 30.40 → 46.24 | 16 burners | yes, failed the figure | 13 passed, 109 s; `:118` 25.9 s |
| `c1` | 31.96 → 141.12 | 20 burners, then other work | no: after above 50 | 9 of 13, 303 s; return, `:52`, `:118` at the bound |
| `c2` | 48.33 → 30.43 | natural, the figure decaying from a spike of 124 | yes, passed (refresh repair only) | 13 passed, 63 s; max 13.4 s |
| `c3` | 30.64 → 42.15 | 18 burners | yes, failed | 10 of 13, 166 s (above) |
| `c4` | 30.06 → 42.06 | 16 burners | yes, passed | 14 passed, 83 s; max 16.6 s |
| `c5` | 37.31 → 45.53 | 12 burners | yes, passed | 14 passed, 91 s; max 18.3 s |
| `c6` | 41.06 → 34.96 | 10 burners | yes, passed | 14 passed, 82 s; max 15.8 s |

`c4`, `c5` and `c6` are three consecutive counted passes of the repaired
selection, with no failing counted run between; `c5` and `c6` each started
12 s after the previous run's end, and each run's burners were stopped at its end
(`pgrep -x yes` empty). The natural-load counted pass, `c2`, preceded the
Intent repairs and `c3`'s failure, so it is not one of the three.

| Case | `c4` | `c5` | `c6` |
| --- | --- | --- | --- |
| journey (`landed-ci-automatic-repeat:45`), first | 6.8 | 8.0 | 8.8 |
| refused (`:118`), first | 4.7 | 6.2 | 7.0 |
| uncertain (`:147`) | 6.3 | 6.6 | 5.2 |
| saved outcomes (`:184`) | 2.5 | 2.4 | 2.1 |
| accepted request | 5.6 | 6.3 | 6.1 |
| verdict | 3.3 | 3.3 | 3.6 |
| proof, the worker's first page case | 7.1 | 6.1 | 7.5 |
| return refresh and reload (`:39`), the worker's first page case | 6.7 | 6.3 | 7.9 |
| return revisit and selection (`:66`) | 11.0 | 11.9 | 12.0 |
| reading | 8.3 | 9.7 | 10.1 |
| refresh `:52` | 15.5 | 15.4 | 13.2 |
| refresh `:118` | 16.6 | 18.3 | 15.8 |
| settings | 3.3 | 4.9 | 3.5 |
| warning | 8.8 | 9.2 | 8.4 |

The worker fixtures are outside these durations: the first backend cases'
`queuedClaudeBoundaryReady` 3.5–5.4 s, `keptStory` 1.1–1.5 s, the first page
cases' `queuedClaudePreviewReady` 1.9–4.1 s and `keptIntentStory` 1.6–2.0 s,
each refresh case's `keptSummaryComparisonStory` 5.2–6.3 s. With them, every
case's trace span, from its first fixture to its teardown, is at most 24.2 s
(`c5` `:118`; 22.9 s in `c4`, 21.1 s in `c6`). No wait after a provider
change took more than 1.9 s in these runs (`slice6/polls.py` over the
traces).

**Key example 2.** One case calls `scenario.ingest` across the candidate's
repeat specs (`landed-ci-automatic-repeat.spec.ts:81`); five do in the base's
four (`landed-ci-automatic-repeat.spec.ts:49`, `:122` in its loop of two
outcomes, `recently-done-ci-automatic-repeat.spec.ts:47`,
`intent-ci-follow-up.spec.ts:60`). The refresh spec calls none on either side.

**Key example 8.** `pairs.sh pair 3`: `one.sh base` then `one.sh cand`, back
to back, one worker, natural load, the wall time of the whole command, a
proof record and `slice6/count-gh.mjs` preloaded (`NODE_OPTIONS=--import`)
in every run. Base: the four repeat specs and the refresh spec, 9 cases;
candidate: the eight files, 14 cases. All six runs passed every case.

| Pair | Base | Candidate | Fake `gh` calls, base / candidate |
| --- | --- | --- | --- |
| 1 | 77.1 s, load 27.90 → 20.08 | 58.5 s, 20.08 → 13.64 | 337 / 253 |
| 2 | 73.5 s, 13.64 → 14.41 | 68.8 s, 14.41 → 12.14 | 350 / 250 |
| 3 | 81.5 s, 12.14 → 14.23 | 73.9 s, 14.23 → 21.28 | 345 / 257 |
| Median | 77.1 s | 68.8 s | |

The candidate's median is 0.892 of the base's (68.8 / 77.1), inside the
1.10 figure. Each passing candidate run made fewer fake `gh` calls than each
passing base run (250–257 against 337–350).

**Diff review**, `git diff 8aa440077...HEAD -- dashboard tests` and this
slice's uncommitted change: no added `test.setTimeout`, expectation
`timeout:`, `test.slow`, sleep or `waitForTimeout`, retry, `skip`, `fixme`,
`only` or runner mode (`describe.configure`, `repeatEach`); no Playwright
configuration, `.github` or script outside the test trees changed. `git diff
--stat 8aa440077...HEAD -- dashboard/server dashboard/src` is empty. `grep
-rn` of each of the eight spec names under `dashboard/longest-first*` finds
nothing. One expectation timeout reached the selection without being added:
`openCollectedHistoryStory` (`scopeHistoryCollectedPage.ts:31`–`:37`,
`readWaitLimitMs + 15_000`), unchanged since before `8aa440077` and used by
the refresh fixture and five other scope-history specs. The correction below
(obligation G2) removes it; no expectation or `waitForResponse` timeout
remains in the selection's path.

Waits that follow a provider change, each the default 5 s expectation or
the test's own bound:

- journey: the held rerun request's arrival (`holdSubmission`, `await
  submitted`); the saved request changing to accepted ("accepted saved
  after the reply"); the provider's answer to the second read of run 72
  (`aWholePass`).
- refused: the saved request changing ("saved reply"), then `aWholePass`.
- uncertain: "saved reply", then after the 104 s repeat the saved request
  settling ("repeat read").
- saved outcomes and verdict: each saved outcome changing; in the verdict
  case again after the verdicts become success.
- accepted request: `aWholePass`, then "progress read" and "repeat read" on
  the saved request.
- warning: "progress saved" and "repeat saved" on the saved request; the
  page's own card read after `page.clock.runFor(15000)`.
- Intent cases change no provider fact; `gotoCiFollowUp`,
  `refreshCiFollowUp` and `reloadCiFollowUp` wait for the dashboard's answer
  to the comparison read. The refresh cases move the trunk head, not a
  provider fact, and wait on `passTimeUntilCheckedAfterSettled` and
  `untilPageReadsAnswered`.

The collecting servers recheck every 200 ms (`recheckingLandedCi`), so no
bare 5 s observation rides one collection pass: the longest poll in `c4`–`c6`
was 1.9 s.

**Source-review commitments.**

- G1, E1.1–E1.4, S1.1, S1.2: `c4`–`c6` above, under burners; after the G2
  correction, `e2`, `e4` and `e5` below, under natural load. G1's obligation
  can close on the latter.
- G2, G3, R1–R7, E9.2: the diff review. G3: the inherited expectation
  timeout named above is gone after the G2 correction below; every case of
  the selection runs on the default 5 s expectations.
- G4: the slowest case 18.3 s against the 25 s figure and the 30 s bound;
  24.2 s with its worker fixtures.
- G5, L5: one journey (key example 2); 250–257 fake `gh` calls against
  337–350 for the same specs; the refresh cases no longer spawn the
  producer, the proof case no longer pages the Board.
- S1.3: the 30–50 range and the figures are the preparation's reading,
  unchanged here.
- S2.1, E2.1: key example 2.
- S4.5: SEED-314's F1–F11 keep their owners by the plan's "Faults F1–F11"
  premise row and the Slice 2–8 records (F2, F8, F9 rerun in slice 8). The
  verdict spec differs from `095f2bff9` only by its imports,
  `queuedClaudeBoundaryTest`, `await saveRepeatRequests` and `rerunRuns`,
  so F10 and F11 stand by citation and were not rerun.
- S6.1, S6.2: the wait list above.
- S9.2, E1.8, E8.7: the refresh spec's two cases are in every profile run and
  both pairs' selections; 13.2–18.3 s in `c4`–`c6`.
- E1.5: no case over 25 s in `c4`–`c6`. E1.6, E1.7: `c1` recorded and not
  counted.
- E8.1–E8.6: the base is `8aa440077`. For the corrected candidate the
  comparison is the simultaneous pairs below: 0.943 of the base's median
  with fewer fake `gh` calls. The back-to-back pairs 4–6, under unequal
  loads, are kept as measured.
- L1: no product change; faults reverted, product diff empty.
- L2: first-in-worker preparation is in every case's trace span (at most
  24.2 s), and outside the proof record's duration by slice 7's worker
  fixtures.
- L4: `count-gh.mjs` counts, it changes no call; the fake `gh` is unchanged.
- E9.1, R8: hosted CI is the coordinator's to observe; nothing is published.

Gaps: no counted pass of the repaired selection under natural load. After
`c6`, `c7` waited 22:37–22:48 for the natural load to reach 30 and started
no run (it stayed at 15–22); the one natural-load counted run, `c2`, passed
before the Intent repairs. The reported durations exclude worker
fixtures, so the 25 s figure was read on them and the spans are given
beside; hosted CI is not observed. The natural-load gap is closed by the
correction's runs below.

##### Correction for obligation G2, the refresh cases' expectation timeout

Observed on 2026-11-12, 22:50–00:00 local, same checkout and conditions, logs
in the same directory (`g2*`, `d*`, `e*`, `pair4-*`, `pair5-*`). `c4`–`c6`
above are the runs before this correction.

- **Owner choice.** `openCollectedHistoryStory` itself, for all its users.
  Its contract is "finish the story's existing comparison reads before a case
  counts history navigation", and that is one event for every user: every
  read the page sent answered and leading to no further read, which
  `untilPageReadsAnswered` (`../pageRequestNotes.ts`) already waits for in
  every page of `pageTest.ts` (it notes reads in every context). A refresh-only
  open would have left the same override under the five other scope-history
  specs and given the contract two forms. `scopeHistoryCollectedPage.ts`
  (45 lines) now expects the panel visible, waits on
  `untilPageReadsAnswered`, then expects no reading status and the entry
  table, each on the default 5 s; `readWaitLimitMs` is no longer imported.
- **A counted failure after it, and its repair (G1).** `d2` (natural load
  48.91 → 46.45, counted): 14 passed, but refresh `:52` took 26.4 s and
  `:118` 31.0 s; `d1` before it (natural, 38.07 → 61.11, not counted) timed
  out `:118`. In both traces the open's wait for the comparison and endpoint
  proof reads took 7.1–10.4 s, the product's Done comparison read over the
  fake provider. The refresh cases read nothing of that panel: they count
  acquisitions only after their own `untilPageReadsAnswered` (`:84`,
  `:136`). So the open was divided at its seam: `openDoneStoryIntent` selects
  the Done story's card and opens its Intent, `openCollectedHistoryStory`
  calls it and then waits the comparison out as above, and the refresh
  fixture (`projectScopeHistoryFixture.ts`, 123 lines) calls
  `openDoneStoryIntent` and chooses Changed tests while the comparison's reads
  go on. One owner of the open, one of the wait; nothing copied. First run of
  it, natural load 44.47 → 42.34: `:52` 11.2 s, `:118` 14.1 s.
- **Faults**, the nine refresh faults of the Slice 9 record, after each of
  the two changes (`g2faults/`, load 32.3 → 34.2 with one ENDPOINT run at
  the bound while failing `:182` at load 28 → 34, rerun at 35.4 → 37.3 and
  failing at `:182` alone; `g2faults2/`, load 38.3 → 28.5): each failed at
  the same line as in slice 9 and none at the bound. HISTACQ2 `:52` at `:115`
  (19 for 9) and `:118` at `:197` (19 for 5); ENDPOINT `:182`; NOTE `:191`;
  EVIDENCE3 `:190`; ROWS `:192` (0 for 3); DATETIME `:193`; THROUGH `:73` and
  `:205` (3 for 2); RESTORE `:100`; PROJECTRESTORE `:153`. Product diff empty
  after each.
- **The other users of the open**, the five scope-history specs
  (`intent-scope-collected-file-timing-gaps`, `-file-timing-history`,
  `-collected-timing-history`, `intent-scope-prior-build-states`,
  `-prior-build-average`), two workers, candidate then the base worktree back
  to back: at load 21.10 → 27.46 the candidate passed 5 of 5 (13.5–23.4 s)
  and at 27.03 → 36.41 the base 5 of 5 (18.9–23.8 s). An earlier pair at a
  higher load failed on both sides: candidate 3 of 5 at 23.71 → 31.86
  (`prior-build-average` at the Board's "the row rests", before the open's
  changed lines; `prior-build-states` at the entry table after the
  comparison read answered "could not be reached"), base 0 of 5 at 31.86 →
  34.63. Three of the five set `test.setTimeout(60_000)` themselves; they are
  outside this story's named specs and their loaded failures on the base
  are for the developer, with the four already routed. After the seam split
  `openCollectedHistoryStory` makes the same calls in the same order.
- **Profile runs**, natural load, no burner, `run.sh <label> 0 2`:

  | Label | Load before → after | Counted | Result |
  | --- | --- | --- | --- |
  | `d1` | 38.07 → 61.11 | no: after above 50 | 13 of 14; `:118` at the bound, `:52` 31.4 s |
  | `d2` | 48.91 → 46.45 | yes, failed the figure | 14 passed; `:52` 26.4 s, `:118` 31.0 s |
  | `e1` | 30.69 → 51.50 | no: after above 50 | 14 passed, max 16.4 s |
  | **`e2`** | 49.96 → 39.17 | yes | 14 passed, max 18.1 s |
  | `e3` | 36.33 → 28.32 | no: after below 30 | 14 passed, max 19.7 s |
  | **`e4`** | 31.19 → 45.19 | yes | 14 passed, max 15.0 s |
  | **`e5`** | 45.26 → 42.15 | yes | 14 passed, max 15.3 s |

  `e2`, `e4` and `e5` are three consecutive counted passes, all under
  natural load, with no failing counted run between (`e3` was not counted).
  Each was started within 30 s of the previous run's end, so each run's load
  figure includes the previous run's decaying share beside other work's.

  | Case | `e2` | `e4` | `e5` |
  | --- | --- | --- | --- |
  | journey, first | 11.7 | 9.7 | 10.6 |
  | refused, first | 7.6 | 6.5 | 7.2 |
  | uncertain | 7.7 | 6.1 | 8.8 |
  | saved outcomes | 3.8 | 3.0 | 3.5 |
  | accepted request | 6.2 | 4.6 | 9.4 |
  | verdict | 4.5 | 3.5 | 5.3 |
  | proof, the worker's first page case | 9.3 | 8.4 | 7.0 |
  | return `:39`, the worker's first page case | 9.8 | 8.6 | 7.7 |
  | return `:66` | 14.2 | 15.0 | 11.1 |
  | reading | 10.6 | 11.4 | 9.2 |
  | refresh `:52` | 13.4 | 11.4 | 12.0 |
  | refresh `:118` | 18.1 | 14.3 | 15.3 |
  | settings | 4.9 | 4.0 | 3.6 |
  | warning | 11.1 | 10.1 | 9.3 |

  Trace spans with worker fixtures and teardown: at most 24.1 s (`e2`
  `:118`), 19.7 s (`e4`) and 20.3 s (`e5`). Worker fixtures, outside the
  durations: `queuedClaudeBoundaryReady` 5.0–11.0 s, `keptStory` 1.8–2.5 s,
  `queuedClaudePreviewReady` 2.7–9.2 s, `keptIntentStory` 2.7–3.5 s,
  `keptSummaryComparisonStory` 5.0–6.6 s. The longest wait after a provider
  change was 2.0 s.
- **Key example 8 after the correction.** The change shortens the
  candidate's refresh cases only; the base's selection is untouched (the
  base worktree has its own helper). The candidate's refresh cases changed
  by more than a second, so more pairs were taken with `pairs.sh`, base then
  candidate back to back, one worker, the same command as above:

  | Pair | Base | Candidate | Fake `gh` calls, base / candidate |
  | --- | --- | --- | --- |
  | `pair4-1` | 164.7 s, load 35.60 → 47.15, failed: its refresh `:126` at the bound (31.3 s) | 155.4 s, 47.15 → 38.88, passed | 343 / 250 |
  | `pair5-1` | 129.4 s, 27.38 → 34.65, passed | 155.0 s, 34.65 → 29.26, passed | 353 / 255 |
  | `pair6-1` | 132.8 s, 25.60 → 25.42, passed | 119.4 s, 25.42 → 27.79, passed | 349 / 251 |

  In `pair5-1` the candidate took 1.198 of the base (155.0 / 129.4), over the
  1.10 figure; in `pair6-1` 0.899 (119.4 / 132.8). Over these three pairs
  the candidate's median is 155.0 s and the median of the base's two passing
  runs 131.1 s, a ratio of 1.182: a miss at load 25–47, where pairs 1–3 at
  load 12–28 gave 0.892. The candidate's cases themselves sum to less than the
  base's in both passing pairs (103.0 against 119.8 s, 93.3 against
  121.0 s); its excess is wall time outside its cases, 52.0 s in `pair5-1`
  and 26.1 s in `pair6-1` against the base's 9.6 and 11.8 s: the worker
  fixtures that prepare the kept stories and the preview inputs before the
  first case that takes each, which grow with the load. Fewer fake `gh`
  calls holds in every pair. Recorded as measured and returned to the
  coordinator; not repaired here.
- The five other users of the open again after the seam split, candidate,
  two workers, load 23.17 → 18.16: 5 of 5, 10.7–14.5 s.
- `npm run --silent typecheck:dashboard`, `npx eslint` and `npx prettier
  --check` on `scopeHistoryCollectedPage.ts` and
  `projectScopeHistoryFixture.ts`: exit 0. No timeout override was added
  anywhere.

##### Key example 8 on the corrected candidate, simultaneous pairs

Observed on 2026-11-13, 00:04–00:14 local, on the corrected candidate (this
slice's uncommitted change with the G2 correction), natural load, no burner,
AC power throughout. These pairs are the key example 8 comparison for the
corrected candidate. Pairs 1–6 above stay as they were: pairs 1–3 measured
the candidate before the G2 correction, and in pairs 4–6 base and candidate
ran back to back under different loads.

`simpairs.sh sim 6` started `one.sh base simN` (the `base-merged` worktree at
`8aa440077`, its four repeat specs and the refresh spec, 9 cases) and
`one.sh cand simN` (the eight files, 14 cases) at the same moment, as slice
8's `pair2.sh` did, so both saw the same load. Each ran one worker under
`caffeinate -s -i` with a proof record and `slice6/count-gh.mjs` preloaded.
Pairs continued until three pairs had passed on both sides. "Case time" is
the sum of the proof record's case durations; "outside" is the wall time
less that sum (worker fixtures, worker start and teardown).

| Pair | Load at start | Base: wall, case, outside, end load | Candidate: wall, case, outside, end load | Fake `gh` calls, base / candidate |
| --- | --- | --- | --- | --- |
| `sim1` | 22.71 | 133.1 s, 126.8, 6.3, 34.03; passed | 125.5 s, 101.8, 23.7, 28.99; passed | 345 / 252 |
| `sim2` | 34.03 | 160.1 s, 155.1, 5.0, 28.52; passed | 145.5 s, 121.7, 23.8, 29.19; passed | 345 / 257 |
| `sim3` | 28.52 | 147.0 s, 136.4, 10.6, 33.72; failed: `intent-ci-follow-up.spec.ts:27` at the bound (30.8 s) | 141.2 s, 109.5, 31.7, 35.78; passed | 350 / 257 |
| `sim4` | 33.72 | 129.4 s, 123.5, 5.9, 34.08; passed | 122.4 s, 99.7, 22.7, 35.20; passed | 344 / 252 |

The comparison uses `sim1`, `sim2` and `sim4`, where both sides passed. The
base's median is 133.1 s and the candidate's 125.5 s, a ratio of 0.943
(125.5 / 133.1), inside the 1.10 figure. Each of those passing candidate
runs made fewer fake `gh` calls than each passing base run (252–257 against
344–345). `sim3` is recorded and not used: its base failed on its Intent
journey at the 30 s bound. The candidate's cases take less time than the
base's in every pair (99.7–121.7 s against 123.5–155.1 s). Its time outside
cases is larger (22.7–31.7 s against 5.0–10.6 s): the worker fixtures that
prepare the three kept stories and the preview inputs. Under the same load
that difference is smaller than what the cases save.

#### Slice 10 acceptance and refactor

- Accepted with obligations G1 and G2 proved. The refactor pass gave the
  comparison read's answer one wait in `ciFollowUpReadingPage.ts`
  (`untilComparisonAnswered`, used by open, reload and refresh), built each
  kept scope proof once in the refresh fixture, and corrected comments that
  the split and kept proofs had made untrue. No expectation changed; the
  proof, return and refresh specs passed 5 of 5 at load 27.5.

#### CI repair of run 43258029149, after slice 10

Hosted CI failed on `681a187da` in `dashboard/tests/sessions/agent-completion-quiet.spec.ts:37`
(Story Branch Wrap Up): the "Startup recovery" region leaves the page header
while "Read final report" is pressed, the layout shifts and the release lands
elsewhere, so no click reaches the button. The same assertion failed the same
way on other branches. The repair waits for that region to leave before the
press (`parts(page).startupRecovery`, now the one locator `recoveryOf` uses);
a press held across the region's removal failed as in CI before the wait and
passed after it; the spec passed 3 in a row and 9 of 9 at load 26 → 45.
Trunk landed a different fix for the same race (`694c8dceb`: a retried open
and a 60 s case timeout) after this branch's base.

## Story obligations

### G1. Page cases first in their worker reach the bound at load 27–49
Reported: slice 4 — "With both cases first in their workers at load 27 → 49 the warning case took 28.2–29.7 s and failed once at the 30 s bound; Before Hooks took 25.8 s."
Story clause: "every case passes each time; no case takes more than 25 s"
Disposition: proved by slice 10: PLAN.md Slice 10 record, correction for G2, counted runs e2, e4 and e5 at natural load 31–50: 14 of 14 each, none over 18.1 s, trace spans with worker fixtures at most 24.1 s


### G2. The refresh cases wait with an expectation timeout of readWaitLimitMs + 15 s
Reported: slice 10 — "openCollectedHistoryStory, which the refresh fixture uses, expects the comparison panel, its readings and its entry table with { timeout: readWaitLimitMs + 15_000 }"
Story clause: "the default 5 s expectations"
Disposition: proved by slice 10: PLAN.md Slice 10 record, correction for G2: openCollectedHistoryStory waits on untilPageReadsAnswered with default expectations; the refresh fixture opens through openDoneStoryIntent; no timeout override in the selection's path
Commitment: G3
## Current decisions

- **Amended by Terry on 2026-11-12, after the first measured run missed key
  examples 1 and 8.** The story may change shared preparation (the `origin`
  fixture's first use, the app build's timing, a kept published-story
  arrangement), the comparison base is trunk as merged (`8aa440077`), and
  `intent-project-scope-timing-refresh.spec.ts` joins the named specs. The
  seed carries the amendment; slices 6–10 replace the former slice 6. No
  measured run starts on battery.
- **Amended by Terry on 2026-11-12, after slice 6's projection.** Key example
  1 is every case passing three consecutive two-worker runs at load 30–50
  with none over 25 s; key example 8 is a one-worker median no more than 10%
  above merged trunk with fewer provider calls. Slices 7–10 carry these
  figures; the earlier 15 s and two-thirds figures in this plan's records
  are history.

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
