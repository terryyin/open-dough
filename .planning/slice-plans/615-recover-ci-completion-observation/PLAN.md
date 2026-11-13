# Recover CI completion after the observer expires

**Identity:** SEED-343#recover-ci-completion-observation
**Source:** [Story](../../seeds/SEED-343-recover-ci-completion-observation.md#recover-ci-completion-observation)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A coordinator whose execution observer ended before the final accepted SHA has
a completion receipt runs one managed recovery. The expiry notice and the
completion guidance name it. The recovery re-establishes this coordinator's
observation of that SHA on its authorized target and ends in the ordinary
`CI_OBSERVER` completion receipt. The story's Scope and Key examples 1–7 are
the source. This plan adds no promise.

Included: a structured cause on the unavailable event and on the completion
receipt; one recovery operation that Claude Code and Cursor run directly and
Codex runs after arming a fresh stream; a completion deadline carried from an
ended observer into its replacement; Trunk Mode `finish` and Story Branch
integration reaching the same operation; ignored-only merge landings on GitHub
Actions and a command adapter.

Exclusions, as the story records: no budget change or per-slice renewal; no
transport retry (ODF-121); `completion_expired` stays closed; no read-only
verdict command, because no caller in this plan needs one; no paid native host
runs. The ODF-259/298/334 completion evidence is recorded at wrap-up, once the
containing release is known (see [Wrap-up obligation](#wrap-up-obligation)).

## Architecture and PFE

Existing owners, reused:

- **Observer establishment.** `establishObservation`
  (`src/skills/dough-execute-plan/scripts/execution-increment-observation.mjs:203-233`)
  already classifies an ended Claude Code or Cursor observer (`ci-mailbox-match.mjs:141-160`)
  and starts and binds a new one for `deliver`. On Codex it reports a rearm gap
  (`:140-151`).
- **Registration.** `resume`
  (`execution-increment-resume.mjs`) registers an accepted SHA on a live observer
  it recovers. It starts none.
- **Completion.** `completeRevision` (`ci-mailbox-complete.mjs`) and the
  completion state (`ci-mailbox-completion-state.mjs:9,36-53`) own the
  foreground bound, the sixty-minute deadline, the receipt and shutdown. The
  deadline lives at `<mailbox>/completion/<sha>.json`, so today a replacement
  mailbox starts a fresh one.
- **Applicability.** `classifyUndiscoveredRevision`
  (`ci-revision-applicability-classification.mjs:45-74`) and the classifier
  (`ci-path-applicability.mjs:139-186`) already choose the nearest attempted
  ancestor by `merge-base --is-ancestor` and `rev-list --count`, across both
  parents of a merge. Candidates come from `discoverAncestorCandidates`
  (`ci-mailbox-revision-coverage.mjs:84-99,154-163`). On GitHub Actions they
  include one repository-wide listing of 100 push runs (`ci-runs.mjs:98-112`).
  On a command adapter they include target-branch and branchless attempts
  (`ci-command-adapter.mjs:65-87`, `ci-command-attempts.mjs:7-12`).
- **Trunk Mode closure.** `finish` (`dough-story-wrap-up/scripts/trunk-closure.mjs`,
  `trunk-closure-observer.mjs:57-98`) chooses a live observer, then an ended one
  that holds a verdict. Otherwise it returns `step: "observation"` with a
  "run `deliver`, then rerun `finish`" reason
  (`execution-increment-observation-gaps.mjs:14-15,31-35,68-79`).
- **Story Branch integration.** Integration observation exists only as guidance
  (`wrap-up-closure-publication.md:150-191`) using the hand-run
  `ci-mailbox.mjs start` / `register-push` / `complete-revision`. No script
  observes it.

Gap and decision (PFE: change, not replace). Add one completion recovery
operation to the managed delivery family, beside `deliver` and `resume`. It
composes the three owners above and adds no new receipt or classifier:

1. It recovers this coordinator's live observer for the target. If the
   coordinator's observers have all ended, or none exists for that target, it
   establishes a replacement through `establishObservation`. The replacement
   records its ended predecessors.
2. It registers the accepted SHA when the observer lacks it.
3. It runs `completeRevision` and prints that one `CI_OBSERVER` receipt.

Working name: `execution-completion-recovery.mjs complete --workspace --accepted-sha
--target-ref --repo --host [owner input]`. It takes the same owner input as
`resume`. The completion deadline is found through the predecessor chain, so a
replacement keeps the first completion start for that SHA. Trunk `finish`
calls the same operation instead of returning the deliver-and-rerun gap.
Story Branch integration guidance names it for both its branch-target and
trunk-target completion. No North Star topic: the decision is local to the
existing CI observation owner and follows
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one authoritative home per rule).

**Codex.** The yielded stream is armed with host tools, so the operation cannot
arm it. `ci-notify-codex.md:163-164` forbids restarting a terminal `finished`
observer, and that conflict is ODF-298. The recovery arms a **new** stream for
the same target and coordinator; it never restarts the old directory. It then
passes that stream to the same operation as `--coordinator --observer-directory`.
The guidance states the permission narrowly: a fresh stream, at completion
recovery, for a finished observer. The old receipt is preserved.

### Oversized and near-limit files

`src/skills/dough-execute-plan/references/ci-monitor.md` has 251 lines and must
change, because line 156-157 says to report lost coverage and continue.
Cohesive reorganization, owned by slice 1: move `## Await the applicable
revision at completion` (policy: when completion is required and what its
outcome means) into `ci-completion-wait.md` (103 lines, mechanics). One
completion reference then owns both when and how. `ci-monitor.md` keeps
observer ownership, notification handling and the writer pause. Affected
callers: 11 links to `ci-monitor.md#await-the-applicable-revision-at-completion`,
the guidance tests that read these files (`ci-completion-lifecycle-guidance`,
`ci-not-required-guidance`, `observer-owner-guidance`,
`planned-completion-guidance` and others located by the consumer trace), and
the installed-payload link checks.

`trunk-publication.md` (254) is not expected to change. The operation's
command template belongs in the completion reference. Near-limit files are
`ci-mailbox.mjs` (250), `ci-mailbox-await.mjs` (248), `watch-ci-execution.mjs`
(247) and `trunk-closure.mjs` (228). Any growth past 250 moves a cohesive
responsibility out, for example the unavailable-detail mapping into
`ci-mailbox-completion-state.mjs`. It is never squeezed or excepted.

## Decisive premises and preparation observations

| Premise and consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| `complete-revision` on an observer whose budget expired returns `observation_unavailable` / `monitor_unavailable` with confirmed shutdown and no recovery (slices 2–3). | `scripts/test.sh src/skills/dough-execute-plan/scripts/ci-mailbox-completion-unavailable.test.mjs` passed quietly at `604823250` on 2026-11-13, and the receipt path was read at `ci-mailbox-await.mjs:109-119,179-183` and `ci-mailbox-complete.mjs:157-195`. | — |
| Budget expiry can be produced through product code without wall-clock waiting (proof route for slices 2–6). | `watch-ci-execution-wake.test.mjs` "registrations cannot extend observation past its budget" (controlled `now`/`sleep`, `maxDurationMs: 5000`) passed at `604823250`, emitting `Execution observation budget expired after 5000 ms.`. Slices drive a real mailbox through `runMailboxWorker(dir, { observe: (r) => watchCiExecution({ ...r, now, sleep }) })`, as `ci-command-adapter-history-coverage.test.mjs` does, and then run the recovery CLI as a process against that mailbox. | A real worker process has no clock override; process-only expiry is not used. |
| A Claude Code or Cursor coordinator whose observer ended gets a new bound observer from `establishObservation`, and completion succeeds on it (slices 3, 5). | `src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-ended-record.test.mjs` passed at `604823250`: `finish` reports the deliver step, and after `deliver` the rerun completes on the new observer and retires. | Proves the deliver route only; the new operation reuses `establishObservation` without a publication. |
| A command-adapter observer on the target uses an older branchless completed attempt as `not_required` basis while a newer unrelated attempt exists (slice 4). | `ci-command-adapter-history-coverage.test.mjs` passed at `604823250` (linear history, observer on `main`). Pygardon's adapter omits `branch` for attempts outside the requested branch (`~/git/pygardon/scripts/pygardon-ci-discovery.mjs:115-119`, read-only at Pygardon `ae1ac4ac9`), so a story-side ancestor reaches this path. | Each step is observed in the form slice 4 consumes: adapter answers reach the observer branchless; older completed attempts stay ancestor candidates (this test); and the classifier chooses across merge parents (next row, real repository). The fixture builder declares merge parents (`parents:` through `declaredParents`, `tests/support/repository-revision-commit.mjs:45`, used by `publication-test-fixtures.mjs`). The real Pygardon `/api/ci` retention of `3855ca648` is owner-held and no slice consumes it. |
| The classifier picks story-side basis `3855ca648` for Pygardon merge `a5ceb3881`, not main's `9ae9897a6` (slice 4). | ODF-259 current assessment, 2026-11-13: the shared classifier run against `a5ceb3881` with the retained candidates returned `not_required`, `basis.sha = 3855ca648…`. | Fixture merge reproduces the shape (slice 4). |
| Codex `deliver` never arms a stream, and Codex guidance forbids restarting a finished observer (slice 6). | Read `execution-increment-observation.mjs:140-151` and `ci-notify-codex.md:163-164` at `604823250`. Slice 6 proves the replacement stream through `ci-codex-lifecycle-test-fixtures.mjs`. | — |

## Outside-in proof and consumer trace

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| Cause stays visible (7) | 2 | Budget expiry and transport loss, each through `watchCiExecution` with a controlled clock and a failing fake `gh`. The event's `cause` and the completion receipt's `observation` detail differ. Hook and Codex notification text names the cause. |
| Named recovery and ordinary receipt (1) | 3 | The expiry notice and receipt name the recovery command. A Story Branch GitHub fake: `S` is registered, then the budget expires, then `S` is green. The recovery CLI process returns `verdict: success`, effective evidence for `S`'s run and `shutdown: confirmed`. The ended mailbox's events and result are byte-identical before and after. |
| Bounded and idempotent (6) | 3 | Rerunning the CLI, and running it after SIGINT, leaves one live observer bound to the coordinator and one receipt. A completion started on the ended mailbox keeps its deadline: a controlled `now` past that deadline yields `completion_expired`, not a fresh hour. |
| Preserved failure (story Scope) | 3 | An unread `CI_FAILURE` on the ended mailbox stays unread. The recovered receipt keeps `shutdown.status: "retained"`, `reason: "unread_actionable_failure"`. |
| Merge basis on a command adapter (2, 4, 5) | 4 | A fixture merge `L` = `T` + `C` whose story-side `B` passed and is branchless in the adapter answer, and whose old `M` is on `main`. Recovery on `L` gives `not_required` basis `B` and success. `B` failing gives failure with the observer retained. `B` pending gives `pending` with the original deadline. Without `B` the receipt is unresolved and resources are retained. |
| Same shape on GitHub Actions (3) | 4 | A fake `gh` with `B` only in the repository-wide listing and `paths-ignore` for `.planning/` and `docs/` gives the same receipt fields. |
| Trunk Mode `finish` reaches the same owner (story Architecture) | 5 | `trunk-closure-owner-ended-record.test.mjs` changes from "deliver then rerun" to one `finish` that completes on the replacement and retires. A second `finish` repeats the receipt with no third observer. |
| Codex recovery (cross-tool) | 6 | A Codex lifecycle fixture: the stream's budget expires, guidance arms a fresh stream, and the operation with `--coordinator --observer-directory` completes. The old `finished` directory is unchanged. |
| Story Branch integration names the recovery (story Scope) | 4 (guidance), 3 (operation) | Guidance tests read `wrap-up-closure-publication.md` and `story-branch-integration.md` and assert that the recovery step is named for both targets and that hand polling is not offered. |

Consumer trace: run `consumer-trace.mjs --base HEAD` at every slice boundary.
For slices 2–3, add `--term 'CI_MONITOR_UNAVAILABLE' --term 'monitor_unavailable'
--term 'observation_unavailable' --term 'budget expired'`. Sixteen test files
currently assert these events or details; additive fields must keep their
exact-shape assertions honest. For slice 1, add `--term 'await-the-applicable-revision-at-completion'`.
For slice 5, add `--term 'establishes its own, and rerunning this finish'`.
Every listed consumer gets `run`, `reused` or `excluded: <reason>`.

## Ordered slices

### 1. One completion reference owns when and how to complete
Type: Structure
Status: done
Proof: Guidance and link tests that read `ci-monitor.md` and `ci-completion-wait.md`,
including the installed-payload link check, pass unchanged in meaning. The 11
anchor links resolve. `ci-monitor.md` ends at 250 lines or fewer.

Internal change: move ci-monitor's completion section into `ci-completion-wait.md`,
retarget its links, and reword both headers so that one file owns completion.
External behavior is unchanged. This enables slice 3's named recovery in the
completion owner without growing an oversized file.

### 2. Budget expiry reads differently from transport loss
Type: Behavior
Status: done
Proof: Example 7. `watch-ci-execution` tests with a controlled clock assert
`cause: "budget_expired"` with the budget, and transport failure asserts
`cause: "observation_error"`. A completion receipt on each kind of ended
mailbox carries the cause in `observation`/`detail`. Host-hook and Codex
notification text tests name the cause. The consumer-trace consumers run.

Behavior: an observer that ends by budget, or by three consecutive provider
errors → its `CI_MONITOR_UNAVAILABLE` event, its terminal record, and any
`complete-revision` receipt on it name which, keeping the reason text.

### 3. Recover completion on a replacement observer
Type: Behavior
Status: done
Proof: Examples 1 and 6 and preserved failure, through the recovery CLI
process against a mailbox ended in-process (see the premise rows) with a fake
`gh`. The receipt identity, the ended mailbox's unchanged records, one live
bound observer after a rerun and after SIGINT, the carried deadline
(`completion_expired` at the original deadline under controlled `now`), and
the retained unread failure are all asserted. The expiry notice and
`ci-completion-wait.md` name the command. Guidance tests assert it.

Behavior: a Claude Code or Cursor coordinator whose observer for target `X`
ended with accepted `S` uncompleted runs the recovery → one replacement
observer for `X` owned by the same coordinator, recording its predecessor, is
established; `S` is registered once; completion uses the earliest completion
start for `S` in the chain; the ordinary receipt is printed. With a live
observer the operation reuses it and only registers and completes.

### 4. Recover an ignored-only merge landing through either provider
Type: Behavior
Status: done
Proof: Examples 2–5 on a fixture merge built with `makeMe.aRepository` and
`materializeRepository`. The command adapter uses a fixture `discover` script
that lists `B` branchless and `M` on `main`. GitHub uses a fake `gh` whose
repository-wide listing alone holds `B`. Receipts are asserted per outcome.
Story Branch integration guidance (`wrap-up-closure-publication.md`
"Observe Story Branch integration" and `story-branch-integration.md`) names
the recovery for the branch tip and the integrated SHA. Guidance tests assert
this.

Behavior: an accepted integrated merge `L` with no exact attempt, whose
nearest attempted ancestor `B` across either parent differs only in ignored
paths, and no live trunk observer → recovery on the trunk target returns
`not_required` with basis `B` in `B`'s actual state (success, failure retained,
pending with the original deadline). It never uses `M` and never waits for an
attempt on `L`. With no attempted ancestor the receipt is unresolved and
resources are retained. If slice 4's first test shows the command adapter
drops `B` on the merge shape, broaden only the ancestor-candidate read, as the
GitHub repository-wide listing does. Exact coverage keeps its target-branch
rule.

### 5. Trunk Mode closure completes on the same recovery
Type: Behavior
Status: planned
Proof: The updated `trunk-closure-owner-ended-record.test.mjs` and
`trunk-closure-observer-ended-selection.test.mjs`. One `finish` after the
coordinator's observers ended completes the final closure on a replacement and
retires. A rerun repeats the receipt without another observer. An ended
observer that holds the closure's verdict still settles as today. With the
worktree gone, the reported lost coverage is unchanged.

Behavior: `finish` with no usable live or verdict-holding ended observer,
while the execution worktree exists → it calls the slice 3 operation instead
of returning the deliver-and-rerun `step: "observation"`. The
`wrap-up-closure-publication.md` table row is updated to match.

### 6. Codex coordinators recover through a fresh stream
Type: Behavior
Status: planned
Proof: A Codex lifecycle fixture (`ci-codex-lifecycle-test-fixtures.mjs`): a
stream ends by budget, the operation without a live stream returns the
arm-a-fresh-stream step, and after arming, the operation with `--coordinator
--observer-directory` completes. The old directory's records are unchanged. A
`ci-notify-codex.md` guidance test asserts the narrow permission, and that
`stopped`/`lost` rearm and ordinary resume rules remain.

Behavior: a Codex coordinator at completion whose stream `finished` by budget
→ the recovery names arming a new stream for the same target and
coordinator, then completes on it, ending ODF-298's conflict without
restarting the finished stream.

## Verification and gates

Apply [AGENTS.md test automation](../../../AGENTS.md#test-automation): before
test changes, resolve installed `dough-makeme` against
`.planning/open-dough.json` for `src/skills/**/scripts` tests. No browser tests
are expected. Build fixtures with `makeMe` and `materializeRepository`. Expire
budgets with controlled `now`/`sleep`; wait for observable events. No
wall-clock sleep, no `test.slow()`, no timeout overrides. Each new test must
fail with its behavior disabled: no cause field, a fresh deadline, a first
parent basis, or the old `finish` gap.

Local gates per slice: `bash scripts/test.sh <affected test files>` with
Homebrew Bash first on `PATH` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset.
Also run the consumer-trace consumers, `npm run --silent format`, and the
staged lint. The changed scripts are installed payload loaded by every
host's observer and closure. Before landing, run one full local suite under
[the maintained macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
awake on AC with `caffeinate -s -i`; on battery, lid open with `caffeinate -i`
and the sleep logs inspected afterwards. Check host load and competing runs
first, under
[expensive proof](../../../.claude/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch).

Follow [the project's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written for every local and CI failure. Reproducing on base is attribution,
not exemption, and rerunning until green is no repair. An exact active repair
owner is a coordination boundary whose files must be preserved. Failures on
revisions you published stay yours through the applicable final CI.

## Wrap-up obligation

At wrap-up, record at [ODF-259](../../../docs/maintainer/findings/ODF-259.md)
the delivered recovery, its containing release, and the GitHub Actions and
command-adapter proof outcomes from slices 3–4. Link the outcome from
[ODF-298](../../../docs/maintainer/findings/ODF-298.md) (slices 5–6) and
[ODF-334](../../../docs/maintainer/findings/ODF-334.md) (slice 4).

## Current decisions and readiness review

- One recovery operation composes `establishObservation`, registration and
  `completeRevision`. It adds no receipt format, classifier or read-only
  verdict command. Its name may change in execution; its composition may not.
- The completion deadline is carried through a recorded predecessor chain.
  This is per coordinator and target, never across coordinators.
- Codex arms a fresh stream. It never restarts a finished one.
- Execution mode is Story Branch (default). No trunk-only step and no human
  checkpoint are needed. Preparation authorizes no implementation or Take.
- Slice-plan refinement was not needed. Each slice has one proof loop. Slice 1
  is the reorganization that the oversized `ci-monitor.md` requires before
  slice 3 edits it. Slices 3–6 apply one operation to its four entry contexts
  without per-provider recognizers. Slice 4's adapter broadening is
  conditional on its own discriminating test.
- Remaining slice-specific concern: none identified within the inspected
  boundaries. Slice 4's conditional broadening of the ancestor-candidate read
  is a safeguard. The premise rows show the merge-shaped path already reaches
  basis `B`.

## Learnings

- Slice 1: after moving when-policy to `ci-completion-wait.md` H1, links that
  mean receipt mechanics must target `#completion-command-and-receipt-mechanics`,
  not the file root. The finish-row keeps one unanchored link to that file to
  avoid read-budget double-counting the same completion home.
- Slice 2: terminal finished cause and await observation must share one
  last-unavailable event reader. Stub mailbox workers need stop-file polling;
  `fs.watch` alone can miss the stop on this host, and `process.title` is not a
  reliable `ps` stand-in for unknown liveness.
- CI repair on `79238f1` (run 43442318159/1): Rolldown server-bundle must set
  `output.codeSplitting: false` with `output.file` when the graph has dynamic
  imports; that harness defect failed every dashboard shard and concurrent-runs.
- Slice 3: record predecessors before the first `completeRevision` or the
  exclusive deadline claim is fresh; in-process budget end needs a config-free
  observe root with a controlled clock, not the fixture command-adapter root.
- CI repair on `7f906b8` (run 43450433756/1): named recovery lives in
  `ci-completion-recovery.md` so the finish-row read of `ci-completion-wait.md`
  stays under the 30KB tool-result budget.
- Slice 4: keep dist(B,L) < dist(M,L) in fixtures or branch-listed M wins on equal distance; fold merge gh into instrumented GitHub fixture.


## Story obligations

### X1. No eight-hour budget change
Reported: slice 1 — "source review — scope limit: no change to the eight-hour budget"
Story clause: "No change to the eight-hour budget or renewal of observation at each slice publication."
Disposition: excluded "No change to the eight-hour budget or renewal of observation at each slice publication."
Commitment: 47, 48


### X2. Mid-story reattach already exists
Reported: slice 1 — "source review — mid-story expiry already reattaches; completion recovery closes remaining gap"
Story clause: "Mid-story expiry already reattaches at the next delivery, and the completion recovery closes the remaining gap."
Disposition: excluded "Mid-story expiry already reattaches at the next delivery, and the completion recovery closes the remaining gap."
Commitment: 49

### X3. No transport retry policy
Reported: slice 1 — "source review — no retry policy for transient transport errors (ODF-121)"
Story clause: "No retry policy for transient transport errors (ODF-121)."
Disposition: excluded "No retry policy for transient transport errors (ODF-121)."
Commitment: 50

### X4. Budget-expiry path verified
Reported: slice 1 — "source review — transport-loss recovery allowed but story verifies budget-expiry path"
Story clause: "An observer that ended by transport loss may use the same recovery at completion, but this story verifies the budget-expiry path."
Disposition: excluded "An observer that ended by transport loss may use the same recovery at completion, but this story verifies the budget-expiry path."
Commitment: 51

### X5. completion_expired stays closed
Reported: slice 1 — "source review — completion_expired stays closed as it is today"
Story clause: "`completion_expired` stays closed as it is today."
Disposition: excluded "`completion_expired` stays closed as it is today."
Commitment: 52

### X6. No new read-only verdict command
Reported: slice 1 — "source review — no new read-only effective-verdict command unless needed"
Story clause: "No new read-only effective-verdict command unless the recovery design needs another caller to read the verdict; any such entry point exposes the same calculation."
Disposition: excluded "No new read-only effective-verdict command unless the recovery design needs another caller to read the verdict; any such entry point exposes the same calculation."
Commitment: 53, 54

### X7. Pygardon admission stays elsewhere
Reported: slice 1 — "source review — Pygardon production release admission stays in its own owner"
Story clause: "Pygardon's production release admission stays in its own owner."
Disposition: excluded "Pygardon's production release admission stays in its own owner."
Commitment: 55

### X8. No paid native host runs
Reported: slice 1 — "source review — no paid native host runs; fixtures substitute both providers"
Story clause: "No paid native host runs; fixtures substitute both providers."
Disposition: excluded "No paid native host runs; fixtures substitute both providers."
Commitment: 56