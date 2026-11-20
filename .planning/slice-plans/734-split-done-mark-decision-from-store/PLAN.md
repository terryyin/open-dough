# Mark Done through a typed decision and compose Done state in review cases

**Identity:** SEED-413#split-done-mark-decision-from-store
**Source:** [Mark Done through a typed decision and compose Done state in review cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store)

## Goal and scope

Dashboard maintainers can prove Done capture and the review of Done sessions
without a machine home. `setRecordDoneAt` (`dashboard/server/recordDoneAt.ts`)
becomes a store adapter over a pure Done transition and a Git-only branch
capture. Review-topic cases in the 28 specs that import
`dashboard/backend-tests/support/doneCaptureCase.ts` start from composed Done
records.

Included:

- the pure Done transition, the branch capture as the adapter's typed
  collaborator in place of `readAncestry`, and Default main commit
  attribution (`madeSince`, run grouping) over typed log entries;
- a MakeMe branch-result step and `doneCaptureReview.ts` taking kept records;
- moving review-topic cases, including the delivery observation and
  publication cases where Done is a precondition, onto composed Done records.

Excluded: branch entry, its pin-ref query and `identifyBranch`
([branch entry story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store));
`captureObservedLandings` and `handleLanding` reading the stores
([delivery observation](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#observe-done-deliveries-over-typed-records),
[landing reports](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#decide-landings-over-typed-attempts-and-records)),
so observation cases still keep their composed record in the store; and folding
launch flavors into MakeMe
([launch flavors](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme)).
`doneMarks.ts` (250 lines) and the other `setRecordDoneAt` callers keep the
adapter's signature and are not edited.

## Key examples and proof

| Example | Observable proof and owner |
| --- | --- |
| The Done transition refuses a stale expected Done time and ignores an automatic Done the record no longer allows, as plain values | Typed transition cases with no store, Git or HOME (slice 1). |
| A held capture still loses to a newer Done | One adapter case whose branch capture collaborator holds until released (slice 2). |
| Commit attribution places made, replayed and moved entries and groups runs | Typed-log cases; one real-Git case keeps the reflog read (slice 3). |
| A review case of a Done isolated branch builds its record with a MakeMe branch result and real Git commits, then reads the typed review, with no HOME stub and no `markDone` | Composed Done cases for Default main (slices 4–5), isolated branches (slice 6), and observation and publication (slice 7). |

Each replaced case keeps its assertions. When a case asserts both a capture
decision and how the review shows it, the decision moves to its typed case and
the review half composes that decision's result and asserts the same review
output.

## Current decisions

- Follow the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  production gets the seams; test support only loses procedures, apart from the
  MakeMe step.
- **Transition.** A pure function from record, Done time, `now` and options
  (`expectedDoneAt`, `automatic`, `doneProblem`, and the capture's candidate
  for the branch-review guard) to the next record, or the same record when it
  refuses. `setRecordDoneAt` applies it inside `changeSessionRecord`.
- **Capture.** The adapter takes the branch capture (the read that
  `readBranchResult` does now) as an optional typed collaborator, defaulting to
  production's. The `readAncestry` option and parameter go. `aHeldDone`
  supplies a capture that awaits release before answering the real capture's
  result. Pinning, `keepManualLanding` and the write stay in the adapter.
  Default main capture already reads Git apart from the store
  (`readSessionCommits`); `doneCapture.ts` stays its adapter.
- **Attribution.** Export the decision over `LogEntry[]`: placement (today's
  `madeSince`) and run grouping from each entry's first parent, replacing
  `runsOf`'s `rev-parse` per commit. `headLog`, the ancestry check and the
  repository read stay Git.
- **Composition.** Compose with `markedDoneAt`, `keptSessionCommits` and
  `sessionCommitsFailedAt`, and add a branch-result step (with
  `branchResultFailedAt`). State a result from the work's known revisions.
  When it is Git-derived, such as a working-tree snapshot or an attribution
  gap, take it from the production Git-only capture. Do not re-derive it in
  test code.
- **Pins.** A composed record has no capture pins. A case that retires its
  branch after Done (`retireAdHocBranch` expires reflogs and prunes) or prunes
  itself is proving the kept evidence survives, so it keeps the real Done
  adapter. This applies in `ad-hoc-branch-result`, `ad-hoc-branch-worktree-result`,
  `ad-hoc-manual-landing(-observation)`, `done-kept-session-commits`,
  `ad-hoc-session-comparisons` and the declared publication specs, wherever
  retirement follows Done.
- **Topic rule.** `markDone`, `undoDone` and `keep` stay only in cases that
  prove the capture (attribution, manual delivery comparison, worktree read),
  the transition rules or the adapter (pins, release, supersession, deletion
  during capture, completion delivery in `ad-hoc-session-commits*`). Remove a
  `doneCaptureCase.ts` export in the slice that moves its last caller.
- **Review support.** `doneCaptureReview.ts` takes the kept records. Cases
  whose topic is the store pass `await keptRecords(source)` explicitly.
- **Builder size.** `Distribution/tests/support/launchOutcomeTestData.mjs`
  (235 lines) cannot take the branch-result step under the 250-line
  [file-size check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
  Slice 4 moves the Done capture evidence steps (`keptSessionCommits`,
  `sessionCommitsFailedAt`, the new branch-result steps and their facts) into
  their own builder module, inserted in the existing
  `LaunchRecordBuilder → LaunchReportingBuilder → LaunchOutcomeBuilder`
  chain. Callers keep the same `makeMe.aLaunchRecord` steps.
  `kept-session-commits-review.spec.ts` and the other builder users prove it is
  preserved. Keep `sessionBranchCapture.ts` (228) and `sessionCommitsCapture.ts`
  (207) at 250 lines or fewer by giving any extracted decision its own module.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| The typed review answers a composed Done record without a machine home (slices 4–7) | At `39edd4c9a` on 2026-11-20, a scratch spec in `dashboard/backend-tests/review/` ran under `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- zz-scratch-composed-review` (load ~6.8). It marked a Default main and an isolated-branch session Done, deleted every `refs/open-dough` pin, set HOME to an empty directory, and passed the kept record to `storyReview` through `makeMe.aSessionReviewRead.keeping([record])`. Both results equalled the stored review. 2/2 passed (0.66 s, 0.86 s). Scratch removed. |
| A composed record lacks pins, so cases retiring the branch after Done need the real adapter (Pins decision) | Same revision and command. In `ad-hoc-manual-landing-observation.spec.ts`, deleting the three session-branch pins after `markDone` made the first case's review after `retireAdHocBranch` answer `unavailable`: "The saved branch comparison objects are missing or unreadable." The second case passed. Scratch reverted. |
| Composed review cases can take the existing MakeMe Done steps (slices 4–5) | `kept-session-commits-review.spec.ts` already builds `keptSessionCommits(...).markedDone()` records and passes them to `storyReview`. `launchOutcomeTestData.mjs` has no branch-result step (read at `39edd4c9a`). |
| The transition rules have no typed proof today (slice 1) | At `39edd4c9a`, `grep -rln "expectedDoneAt\|automatic: true" dashboard/backend-tests` matches nothing. The rules are reached only through `doneMarks.ts` and completion delivery. |

No other premise is left unobserved. Slice 1 records the measurement baseline
before any change.

## Ordered slices

### 1. The Done transition decides a record's next state as plain values

Type: Structure
Status: planned

Record the [evaluation baseline](#local-gates) first. Then extract the
transition and make `setRecordDoneAt` apply it. Add typed cases for marking
(Done time, disposition time from the supplied `now`, `doneProblem`), undo,
a stale `expectedDoneAt` (no change), an automatic Done that
`doneAutomatically` refuses (no change), finishing an expected Done (keeps
disposition), and a branch-review record changed since the candidate (no
change).

**Proof.** The new transition spec passes with no HOME stub, store or Git.
Disabling the expected-time rule in a scratch edit fails its case. The
existing Done capture family, `sessions/agent-completion-identity.spec.ts`
and the `ad-hoc-session-commits*` specs pass unchanged. Enables slice 2.

### 2. The adapter takes its branch capture as a typed collaborator

Type: Structure
Status: planned

Replace `readAncestry` with the capture collaborator. Rewrite `aHeldDone`
over it. `ad-hoc-branch-result-supersession` ("a newer Done wins over a held
stale capture with only its pins", "deleting a record while its Done capture
is reading leaves no pins") and `ad-hoc-branch-worktree-result` keep their
assertions as the adapter's race cases.

**Proof.** Those specs and the isolated-branch family pass. Making the
adapter skip the candidate guard in a scratch edit fails the newer-Done case.
`rg readAncestry dashboard` finds nothing. Enables slice 6's use of the
Git-only capture.

### 3. Default main commit attribution decides over typed log entries

Type: Structure
Status: planned

Extract placement and run grouping over `LogEntry[]`. Add typed-log cases for
the run decisions in `done-kept-session-commit-runs`, `-rebased-runs` and
`-rewrites`: two runs either side of a pull, the merge, the amended merge,
rebased and amended pushes, a continued cherry-pick, a pre-session commit
rebased during the session, an unplaceable entry and an empty log. Keep one
real-Git case of the reflog read (the first `done-kept-session-commits`
case).

**Proof.** The typed-log cases pass without Git. Reversing the
replay-fingerprint check in a scratch edit fails the cherry-pick and rebase
cases. The three specs, still on real Git until slice 4, and
`done-kept-session-unavailable` pass.

### 4. Default main run reviews read composed Done records

Type: Structure
Status: planned

Make `doneCaptureReview.ts` take kept records. Reorganize the builder as
decided and add the branch-result steps. Move the review halves of the three
run specs onto composed `keptSessionCommits` runs over real commits, so they
assert the same files and diffs. Their run decisions are now proved by slice 3,
so retire their `markDone`, `keep` and `aKeptSession`. Update the Done capture
family paragraph in `dashboard/backend-tests/README.md`: compose Done state;
mark Done only where the capture, transition or adapter is the topic.

**Proof.** The three specs pass without HOME stubs and keep every file and
diff assertion. `kept-session-commits-review.spec.ts` and the other
`makeMe.aLaunchRecord` users that slice 4's consumer trace finds pass.
`npm run typecheck:dashboard` passes.

### 5. Other Default main review cases start from composed Done records

Type: Structure
Status: planned

Move the review-topic cases in `done-kept-session-shared-checkout`,
`done-kept-session-unavailable` and `ad-hoc-session-commits-pending-done`.
Compose shared and unshared runs, `sessionCommitsFailedAt`, no-commit
results, and a pending Done newer than its capture. Each capture failure
reason (no entry, commit on another branch, unreadable log) keeps a capture
case through the slice 3 decision or `readSessionCommits`. If
`checkoutSharedMeanwhile` decides sharing in the shared-checkout cases, prove
it with typed records.

**Proof.** The moved cases keep their review assertions and explanation text
(`notCaptured`, `noCommits`) without HOME stubs. Breaking the shared rule in a
scratch edit fails its typed case.

### 6. Isolated branch review cases start from composed Done records

Type: Structure
Status: planned

Move the remaining isolated review-topic cases onto composed branch results,
for example "reopening keeps the branch evidence and refuses the old file
pair" and the Done-review cases of `ad-hoc-session-branch-entry`. Branch entry
stays arranged as it is today. Take Git-derived results from the Git-only
capture. Cases that retire after Done keep the adapter. Remove `aHeldDone` or
`undoDone` from support only if no caller is left.

**Proof.** Moved cases keep their assertions. Each isolated spec in the family
passes. The moved specs contain no `keep(` or `markDone(` call.

### 7. Delivery observation and publication cases compose their Done precondition

Type: Structure
Status: planned

Compose the Done records in `twoDoneBranchesMergedByHand`,
`ad-hoc-prepared-landing-done`, `ad-hoc-manual-landing-revision-observation`,
the observation retry and lifecycle cases, and the declared publication
specs. Keep each composed record in the store, because the observation and
landing handlers still read it. Cases that retire after Done keep the
adapter. Measure the evaluation.

**Proof.** The observation, publication and lifecycle specs keep their
assertions. The whole Done capture family and `dashboard/backend-tests/launches/`
pass. The evaluation table is recorded under [Local gates](#local-gates).

## Local gates

- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before
  editing tests or builders. Keep default test timeouts. Never use
  `test.slow()`.
- On AC power, run tests under `caffeinate -s -i`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes, with `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
  Each slice runs `npm run --silent test:dashboard:backend -- <its specs>`,
  then `npm run typecheck:dashboard` and `npm run lint`. Slice 4 also runs the
  [consumer trace](../../../.claude/skills/dough-execute-plan/scripts/consumer-trace.mjs)
  for the builder move and the trace's `Distribution/tests` readers. The family
  gate is `npm run --silent test:dashboard:backend -- backend-tests/review backend-tests/launches backend-tests/sessions`.
- Evaluate under
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Before slice 1, at the execution base, record the following for the 28
  specs: `doneCaptureCase.ts` importers, calls of `markDone`, `keep`,
  `aHeldDone`, `undoDone` and `keptRecordOf`, `vi.stubEnv("HOME"` reach
  (cases calling `keep`), and summed and median per-case time from the
  Vitest JSON report. After slice 7, record the same at comparable load
  (`uptime`), using three interleaved runs of the family on the base and
  candidate. Cases count unchanged or higher, with every assertion kept.

## Plan review

Slice-plan refinement was not needed. Every slice preserves one group's
assertions at a single owner: transition, capture collaborator, attribution,
then three moves to composed review by kind. Slices 1–3 add the production
seams that slices 4–7 use, and each move slice keeps its own proof loop. The
scratch observations bound the one design limit, pins after retirement, with a
topic rule. This review found no remaining slice-specific concern.
