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

- Selection: `npm run --silent test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-accepted-request.spec.ts backend-tests/intent/landed-ci-repeat-verdict.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/intent-ci-follow-up-proof.spec.ts tests/intent/intent-ci-follow-up-return.spec.ts`,
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

#### Slice 6 record

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

## Stopped for the developer's decision, 2026-11-12

Slice 6 is not done and stays `planned`. Slices 1–5 are delivered on the
story branch only; nothing is on trunk. Key examples 1 and 8 miss as
measured in the Slice 6 record, and the plan's rule for a miss is to record
it and stop:

- Key example 1: two counted two-worker runs in the profile failed (10 of 11
  under burners, 6 of 11 under natural load). The run's first case in each
  worker pays 7.6–23.9 s in the `origin` fixture and the first page case in
  each worker 9.5–14.2 s waiting for the app build; apart from that, a case
  pays 11–15 s of arrangement and server start before its first observation
  under natural load.
- Key example 8: at one worker the candidate's median is 42.2 s against the
  merged-trunk base's 33.9 s, a ratio of 1.24 where two-thirds was the result
  worth keeping. The base already holds SEED-287's faster journeys, and the
  candidate has 11 cases, each paying its own arrangement, where the base
  has 7.
- G1 stays open with slice 6.

The decision needed is the story's: whether its scope may take in the shared
preparation it excludes (the `origin` fixture's first use, the app build's
timing, and a kept published-story arrangement that every case pays for),
whether its figures change, or whether the branch is not worth keeping under
ADR 0010. No further measured run was started: the machine was on battery.

## Story obligations

### G1. Page cases first in their worker reach the bound at load 27–49
Reported: slice 4 — "With both cases first in their workers at load 27 → 49 the warning case took 28.2–29.7 s and failed once at the 30 s bound; Before Hooks took 25.8 s."
Story clause: "every case passes each time; no case takes more than 15 s, or 25 s when it runs first in its worker"
Disposition: receiving slice 6

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
