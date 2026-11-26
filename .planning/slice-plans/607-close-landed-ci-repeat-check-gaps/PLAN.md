# Close the landed CI repeat checks' coverage gaps and tidy their support

**Identity:** SEED-324#close-landed-ci-repeat-check-gaps
**Source:** [canonical story](../../seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)
**Disposition:** unfinished. Terry authorized the early return to the backlog on 2026-11-14.
**Next slice:** 3. Slices 1–2 are delivered. Slices 3–8 were realigned on
2026-11-27 to typed handlers on plain Node Vitest, as the story's approved
scope extension of 2026-11-19 requires.

## Early-return handoff

The early return released darren-chan without completing the story. A
future execution starts from the queued item. Do not revive the old watchers
or repeat slices 1–2.

The full pre-return record is recoverable from
`1e7e6f98153870b4ce04fb347d882dc79ece1975:.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md`,
including fault recipes F1–F28, P1–P5 and the partial slice-3 implementation.
It was reconciled with main7a100c396 in merge694219d0b. Historical observer
commands and elapsed-time logs are evidence, not instructions. Use this plan
and [handoff evidence](handoff-evidence.md).

The supplier dependency on SEED-332#answer-fake-gh-reads-in-process is
satisfied (accepted at `c5a700892`). The story's dependency block is
authoritative.

## Preserved work and qualified proof

- Delivered on trunk from the partial slice 3: stage-file split, shared
  waitingRequest/aWholePass, adapter prior-state readiness, pending
  server-start ownership and origin-owned standalone collector teardown. The
  realigned slices retire the HTTP and scenario parts of this support. They
  keep the product changes.
- Approved product repair: completion/claim-history reuse scoped to one
  reader. Mutable reads stay live, and abort/error and shallow-history
  semantics are kept. The real-Git
  [history semantics cases](../../../dashboard/backend-tests/intent/published-story-history-semantics.spec.ts)
  already run on Node Vitest and stay as they are.
- Isolated historical proof and the supplier's diagnostics are observations,
  not acceptance of this correction.

## Scope and execution limits

Prove each stage by [calling its typed handler](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
with the state and services that stage uses, in a spec that imports `test`
from `vitest`, as the
[backend test README](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
describes. Follow the [North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
Add nothing to `dashboard/test-support/` except MakeMe builders. Delete
support that loses its last consumer. A case needs no started server, no
mounted boundary, no fake `gh` binary and no native collector process.
GitHub is substituted only at the typed `gh` seam that `createGitHubActions`
already accepts, using the shared `githubApi`/`scriptedGithub` fixtures in
`Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs`.
The project's CI adapter is substituted only at its typed command-reader
contract, as [`landed-ci-scope-adapter-identity.spec.ts`](../../../dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts)
does with `ciAdapterProofReader`.

Production code may be reshaped for testability without changing behavior
(story extension, 2026-11-19). That covers threading typed inputs and
exporting handlers from their adapters. It does not authorize new product
behavior, a cross-request cache, a transport redesign or a weakened bound.

Keep every scenario fact, expected answer and observation of the moved cases:
the request count, the saved intent before submission, accepted/refused/
uncertain kinds, card fields and the ledger evidence. Each fault in the
checkpoint's F1–F28 table moves with its case and must fail its new owner.
A fault whose code is in deleted support goes with that support, and the
slice that deletes the support records this. F1 now fails at the receipt
journey's request expectation instead of a case timeout.

Keep the runner's default timeouts. Use no sleeps, retries, skips,
`test.slow()` or timeout overrides. Apply the selected MakeMe and
page-object conventions. The phone E2E journeys from slices 1–2 and the
other E2E paths in [proof-selection.txt](proof-selection.txt) stay on
Playwright, unchanged except for imports of retired support.

The [repository failure policy](../../../AGENTS.md#failing-and-flaky-tests)
applies to every slice, delegation and repair handoff. Attribution to
earlier commits never exempts a failure. Each attempt is bounded. After a
failure, diagnose it before running again. When a required host window or
human decision is missing, return a precise handoff. Never leave an
open-ended watcher running.

Exclusions:

- `landed-ci-server-lifetime.spec.ts` proves the shared `dashboardServer`
  fixture, not product behavior. It stays on its current runner. Runner
  cutover (SEED-413#retire-legacy-dashboard-backend-runner) owns it along
  with the other test-infrastructure specs. Slice 5 still proves G4 with it.
- Process-held start origins stay in `startOriginPreparation.ts`. That module
  already owns them, and about 45 Node Vitest launch specs reach them only
  through `keepStartedOrigin`. A separate module would grow test support,
  which the North Star forbids. The earlier "process-held origins module"
  slice is dropped for this reason.
- SEED-319#hold-landed-ci-follow-up-observations-under-load stays separate.
  It may retire once these cases leave HTTP.

## Verification

Run local gates on a fully awake Mac on AC power under `caffeinate -s -i`. On
battery, keep the lid open, run under `caffeinate -i` and audit sleep. Put
Homebrew Bash first on PATH. For direct dashboard tests, unset NO_COLOR,
FORCE_COLOR and GIT_ALTERNATE_OBJECT_DIRECTORIES. Run focused backend specs
with `npm run test:dashboard:backend -- <specs>`, which runs Node Vitest files
in place, and E2E specs with `npm run test:e2e -- <specs>`. Before running,
list the current selection, because Playwright silently ignores absent paths.
Accepting a changed case or support change needs three consecutive passes.
E2E runs use two workers.

For each support removal or contract change, run the
[consumer trace](../../../.claude/skills/dough-execute-plan/scripts/consumer-trace.mjs)
against the actual change base, with the retired exports and call forms as
terms. Give every caller a `run`, `reused` or `excluded` disposition.

Run each fault singly as a scratch edit and observe its named failure.
Restore the edit before committing. Ledger serialization stays with
`bash scripts/test.sh tests/support/ci-follow-up-ledger.test.mjs`. Lint and
typecheck remain the commit-hook gates.

Final acceptance runs once, after slice 8. Run the first nine entries of
[proof-selection.txt](proof-selection.txt), plus
`e2e/intent/intent-ci-follow-up-custom.spec.ts` for G3, through
`bash scripts/dashboard-repeat.sh 1 <group command> <specs>`, once for each
group they span (`test:dashboard:backend`, `test:e2e`). Use two workers, no
reporter override, and each group's proof record
(`OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`, `OPEN_DOUGH_E2E_PROOF_RECORD`).
Start only in a natural, CPU-bound window where the one-minute load is 30–50,
and require the load to stay in range before and after. Every case must pass
within 25 s. Burner-induced load and quiet passes do not count; Terry has not
waived this. If no window occurs, stop and report the missing proof instead of
waiting. Then finish through ordinary Story Branch wrap-up, confirm the
accepted landing receipt, and require a successful hosted CI completion for the
final trunk revision with the observer confirmed stopped.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A real-Git completed-story follow-up runs in Node Vitest through a typed handler | Slices 3–6 call follow-up handlers over real Git | `npm run test:dashboard:backend -- dashboard/backend-tests/intent/landed-ci-follow-up-reading.spec.ts` at `f2405f76b`, 2026-11-27, load about 10 | 2/2 passed, 1.2 s and 0.9 s |
| A typed adapter reader substitutes the CI adapter in Node Vitest | Slice 6 | `npm run test:dashboard:backend -- dashboard/backend-tests/intent/landed-ci-scope-adapter-identity.spec.ts` at `f2405f76b`, 2026-11-27 | 1/1 passed, 270 ms |
| Follow-up collection cannot be called with typed state today | Slice 3's contract change | Read at `f2405f76b`: `collectCiFollowUps` reads `projectEnvironment()`, `readFollowUps()`, the checkout's `ciConfiguration` and `configuredRepeatProvider`. `githubRepeatProvider` reaches GitHub through `readGitHubActions`, `exactRepeatRun` and the shared `repeatGitHubWorkflow` request owner, with no seam. The card answer `followUpAnswer` is private behind `answerCiFollowUp`. | Confirmed. Slice 3 narrows these contracts |
| The receipt stage is reachable without HTTP | Slice 5 | Read at `f2405f76b`: `deliverLanding` → `pinNewLanding` → `registerFollowUpReceipt`. `landed-ci-scope-proof-completion.spec.ts` already calls `deliverLanding` on Node Vitest | Confirmed |
| A later start-origin revision naming the first revision as parent fails with "Unknown parent" | Slice 8 | Scratch Vitest in the job directory at `f2405f76b`: `prepareStartOrigin` with first revision `first`, `OPEN_DOUGH_START_ORIGIN_PREPARATION` set to it, then `initializeStartOrigin(..., "claude", first → second → third{parents:[first]})` | **False.** The origin's `main` has `third`'s parent equal to `first`'s commit. Slice 8 adds the missing regression check only; no fixture repair |
| A natural one-minute load of 30–50 occurs during execution | Final acceptance | `uptime` at 07:22 and 07:25 on 2026-11-27: 8.6 and 10.7. Earlier executions saw natural loads of 30.9–38.9, 34.9 and 67.8, but never on demand | **Open host condition.** See the remaining concern |

## Remaining preparation concern

Slice-plan refinement ran as part of this realignment. Slices 3–8 were
replaced and the count stays at eight. No concern was found about slice
boundaries, cumulative design or proof ownership in slices 3–7.

Slice 8 has a sizing concern. G3 and G6 were E2E timeouts under natural load
with no causal diagnosis, and these slices do not change those journeys. If
the final window reproduces either one, slice 8 needs a repair of unknown
size.

A further concern blocks readiness. The final acceptance needs a natural 30–50
one-minute load window, and no bounded way to obtain one exists. The plan
stops and reports rather than waiting. Until Terry decides how the window is
obtained, completion depends on a host condition outside the execution's
control.

## Cumulative design

One rule applies to every stage: collection's follow-up pass is a typed
handler over the ledger file, kept history, a completion check and a repeat
provider, and each provider reaches its CI service through a typed seam.
Slice 3 establishes this. Slices 4–6 add cases on the same contract without
new recognizers. The receipt stage enters through the existing typed
`deliverLanding`. Cards are read through one exported typed card handler.
The kept proof (slice 7) and ancestry (slice 8) cases use contracts that
already exist.

## Ordered slices

### 1. The Intent phone reading checks its whole comparison for sideways scroll
Type: Behavior
Status: done
Proof: Keep `expectNoSidewaysScrollIn(page, comparison)` beyond the three part
checks. Renew proof if affected shared UI changes.
Accepted: [Phone comparison](../../../e2e/intent/intent-ci-follow-up.spec.ts)
passed three times at two workers, published as
`1c04004870edef23d1628a70a06e79e83fee2db7`. F26/P3 made the published-landing
line scroll inside itself. The three part checks passed and the whole-comparison
assertion caught the overflow.

### 2. A queued repeat reads "CI rerun in progress" on a phone
Type: Behavior
Status: done
Proof: Keep the finished-warning observation in the same phone journey. The
accepted-request case retains `in_progress` and its F16 owner.
Accepted: [Queued-repeat phone journey](../../../e2e/intent/recently-done-ci-automatic-repeat.spec.ts)
passed three times at two workers, published as
`7348487b92dd963babcf946e3dc163ae0f3e2d0a`. It read queued progress and then
the warning for the 106-second finished repeat. F27/P4 failed at "progress saved".

### 3. Kept-receipt and saved-request stages are checked by calling typed collection
Type: Structure
Status: planned
Proof: The converted cases pass three times. F2, F8, F9, F4 and F16 each fail
their case. The consumer trace covers `collectCiFollowUps`,
`githubRepeatProvider`, `configuredRepeatProvider`, `answerCiFollowUp` and the
retired support exports. The E2E journeys in proof-selection.txt that read
cards pass three times at two workers, because they observe the production
adapter wiring.

Weakness removed: the stage cases start a boundary server, a fake `gh`
binary and HTTP card reads to reach logic one process can call. Under load
30–50 this caused the G1–G6 failures.

Change:

- `collectCiFollowUps` takes typed input: source, kept history, ledger home,
  the configured and retained provider resolvers, a completion check and the
  signal. Its caller in `landedCiCollection.ts` resolves the environment,
  checkout configuration, `landingCompletesStory` and the providers.
- `githubRepeatProvider` takes a typed GitHub seam (`gh` reads and the
  repeat submission). Production passes `readGitHubActions` and
  `repeatGitHubWorkflow`.
- Export the card answer as a typed handler over source and ledger.
  `answerCiFollowUp` keeps request admission.
- Convert `landed-ci-repeat-eligible-receipt` (refused, uncertain),
  `landed-ci-repeat-accepted-request` and `landed-ci-repeat-verdict` in place
  to Node Vitest. Arrange kept state with a private ledger home and MakeMe
  ledger and history entries, script GitHub through `githubApi`, and read
  cards through the typed handler.
- Delete the support these specs alone used.

Next Behavior enabled: slice 4's race case.

### 4. A dashboard sends no rerun request for a landing another dashboard spent during its preparation
Type: Behavior
Status: planned
Proof: The new eligible-receipt case passes three times. F12 and F25 each fail
it on rerun requests. The ledger test "two independent processes serialize
spend" stays green.

Behavior: run 71's kept eligible receipt has passed the ledger pre-check, and
its first GitHub preparation read is held at the `gh` seam. Another writer
then saves an accepted request through the real ledger lock. When the read
is released and collection finishes, no rerun is sent, and the other
writer's accepted reference and submission are preserved.

### 5. Receipt, admission and reconciliation stages are checked by calling typed handlers
Type: Structure
Status: planned
Proof: The converted cases pass three times. F1, F14 and F15 fail the receipt
journey, and the admission and reconciliation faults fail their cases. The
consumer trace covers the retired GitHub scenario support. G2 and G4 are
proved as their entries require. `landed-ci-server-lifetime` passes three
times.

Change:

- Convert `landed-ci-automatic-repeat` to deliver the 105-second Done
  receipt through `deliverLanding` with real Git and five kept measured
  priors, then call typed collection. Observe the intent saved before the
  held submission, one run-71 request, accepted after release, and the card.
- Convert `landed-ci-repeat-admission` (three cases) and
  `landed-ci-repeat-reconciliation` in place on the same contract.
- Delete the GitHub scenario support that no remaining consumer uses,
  including `prepareRepeatScenario`, `serve()`, OtherAnswers,
  `ciFollowUpRepeatRun`, `ciFollowUpRepeatStage` and the HTTP card reader.
  Rerun answering and counting then belong to each case's scripted `gh`
  seam, and provider layering disappears. E2E imports such as
  `keepFollowUpEntries` and `savedRepeatRequest` stay until their last
  consumer goes.

### 6. Adapter repeat stages are checked by calling typed collection
Type: Structure
Status: planned
Proof: The converted cases pass three times. The interruption case observes
retained intent with no resend after abort. The consumer trace covers
`ciFollowUpAdapterScenario`, `ciFollowUpCollectionCommands`,
`ciFollowUpAdapterAssertions` and the collector-lifetime spec. G1 and G5 are
proved as their entries require.

Change:

- `adapterRepeatProvider` takes typed adapter operations (discovery, rebuild
  request and proof read). The configured adapter command supplies them in
  production.
- Convert `landed-ci-adapter-repeat`, `-rejections` and `-comparability` in
  place on the slice-3 contract. Each card is read once through the typed
  handler.
- Delete the native standalone collector support and
  `landed-ci-collector-lifetime.spec.ts` once nothing starts that collector.
  G9's process-lifetime purpose goes with it, and this slice records that.

### 7. The kept scope proof is what collection keeps
Type: Structure
Status: planned
Proof: The completion spec passes three times. F28 fails it.
Change: in `landed-ci-scope-proof-completion.spec.ts` on Node Vitest, compare
the complete proof collected for run 63 directly with `keptScopeFileProof` for
the same revision and files, including zero-duration file evidence. Do not
rewrap it.

### 8. A later start-origin revision keeps the first revision as its declared parent
Type: Structure
Status: planned
Proof: The new Node Vitest case passes three times. It fails when
`declaredParents` is dropped from `initializeStartOrigin`'s later-revision
commit, as a scratch edit.
Change: call `prepareStartOrigin` and `initializeStartOrigin` with real Git
on the shared-preparation path. Use a description whose later revision names
the first revision as a parent, and assert the origin `main` ancestry. The
fixture already preserves this ancestry (see premise row), so this slice adds
the regression check only. Run the final acceptance after this slice.

G3 and G6 are E2E journeys under load that no earlier slice changes. Prove
them in the final load window: `intent-ci-follow-up-custom` (G3) joins that
run, and `intent-project-scope-timing-refresh` (G6) is already in it. If
either fails there, diagnose it from a `--trace=on` run before any repair.

## Story obligations

### G1. Adapter-comparability failures during slice 3 proof
Reported: slice 3 — "The first focused family run, launched at natural load 67.80, has observed adapter-comparability polls timing out with stale accepted/intent explanations instead of the expected mismatch or incomplete-proof verdict. Terminal inventory and causal diagnosis remain outstanding."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: receiving slice 6

### G2. Reconciliation submission observation can precede its prerequisites
Reported: slice 3 — "The second renewed family run failed multiple-attempt reconciliation: after receipt ingestion the five-second initial rerun-count poll still read zero, at observed natural load 34.94. That is within the promised range; diagnosis and repair remain owed."
Story clause: "Moving the support owners preserves the existing receipt journey and stage checks."
Disposition: receiving slice 5

### G3. Custom comparison reading exceeds its case budget
Reported: slice 3 — "The second renewed family run timed out at 30 seconds while the recovered custom comparison still read Reading retained CI follow-up, after the same case’s slow-outcome navigation. Existing bounds remain unchanged; diagnosis and repair remain owed."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: receiving slice 8

### G4. Teardown can lose a server whose startup is pending
Reported: slice 3 — "The real pending-start regression failed on the old fixture with the late server still running after teardown. The original refusal timeout also reached origin cleanup while a restarted server was still starting, producing ENOTEMPTY."
Story clause: "finds one owner for each support responsibility"
Disposition: receiving slice 5

### G5. A second fresh card read assumes continued history availability
Reported: slice 3 — "Malformed-JSON rejection first observed its matching card, but a second fresh endpoint read supplied no card. Each read independently resolves published completion history; the first successful read does not establish the second read’s availability."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: receiving slice 6

### G6. Refresh proof exhausts its case budget on unrelated comparison reads
Reported: slice 3 — "The third renewed family run had 54 passes and one refresh-case timeout at 30 seconds, with natural load 30.89 to 38.90. Trace shows an initial CI comparison read taking 9.249 seconds, later revision checking taking 5.83 seconds, and another read drain at the deadline; kept worker preparation is outside that case budget."
Story clause: "Every check still passes at load 30–50 within the default timeouts."
Disposition: receiving slice 8

### G7. A shallow negative ancestry result can change after deepening
Reported: slice 3 — "A real Git shallow boundary makes ancestry return false/exit 1 before deepening and true after removal. The prototype retained the rejected exit-1 query and incorrectly kept returning false in the same reader; the new regression reproduced this mismatch."
Story clause: "No product behavior changes, and no new product promise."
Disposition: proved by slice 3: [negative ancestry deepening case](../../../dashboard/backend-tests/intent/published-story-history-semantics.spec.ts) matches real Git before and after deepening on the same reader. The preceding prototype failed and the corrected reader passed the isolated [history proof](history-read-prototype-coordination.md#existing-discriminating-proof-and-limits).

### G8. Successful walks can still describe incomplete shallow history
Reported: slice 3 — "Real Git differentials showed ordered commits, authored commits, merges and profile-path walks change after a shallow boundary is removed, while the prototype reused their incomplete lists for the same full commit IDs. Full object names alone do not establish complete graph knowledge."
Story clause: "No product behavior changes, and no new product promise."
Disposition: proved by slice 3: [successful graph walks case](../../../dashboard/backend-tests/intent/published-story-history-semantics.spec.ts) matches all four independent Git walks before and after deepening. The isolated [history proof](history-read-prototype-coordination.md#existing-discriminating-proof-and-limits) passed twelve cases plus a final graph-only check.

### G9. A standalone follow-up collector can outlive its test
Reported: slice 3 — "Supplier full proof52807 reached the correct queued-rejection card and ledger after restart, then its final native collectFollowUps call continued past the case deadline. The native collector is started by ciFollowUpAdapterScenario through promisified execFile without fixture ownership; later continuation read adapter-requests.jsonl after origin cleanup. The pending-server-start registry does not own this separate collector child."
Story clause: "finds one owner for each support responsibility"
Disposition: proved by slice 3: [native collector lifetime case](../../../dashboard/backend-tests/intent/landed-ci-collector-lifetime.spec.ts) observes the collector and held adapter exiting before origin removal. The isolated [lifetime proof](adapter-recovery-coordination.md#g9-native-collector-lifetime-delta-offered) records native red/green, seven final focused caller/lifetime cases and typecheck. G1–G6, full family/load and delivery remain open.
