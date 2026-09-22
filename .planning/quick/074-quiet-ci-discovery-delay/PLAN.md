# Stop waking the agent for CI runs that have not been discovered yet

Status: taken; slice 1 delivered; slice 2 next.

## Execution

- Mode: Story Branch. Replanning allowed.
- Originating and integration checkout: `/Users/terryyin/git/open-dough` on `main`.
- Execution checkout: `/Users/terryyin/.cursor-worktrees/open-dough/074-quiet-ci-discovery-delay`, branch `cursor/074-quiet-ci-discovery-delay`, created this session from `f48b8569d97210eae8a6ada951dda9954ec5c28c`.
- Published revisions: `a604ebe8a03edf6a3f63e06e0fa117c505cd1c71` accepted on `origin/main` (queue claim). Claim coverage is unobserved; the story-branch observer covers the execution branch, not this trunk claim.
- Default-checkout refresh: advanced to that claim SHA.
- CI observer: `/tmp/dough-ci-501/watch-DIUxCS`, GitHub Actions `ci.yml` / `CI`, target branch `cursor/074-quiet-ci-discovery-delay`.

## Source and outcome

Identity: SEED-008#quiet-ci-discovery-delay

Source: [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#quiet-ci-discovery-delay),
story A of the 2026-09-22 split of the retired
`SEED-008#reduce-ci-observer-overhead`. Terry confirmed the split, chose
"at most one advisory per execution" over "never mid-run" and over a wider poll
count, and asked for refinement followed by a slice plan on 2026-09-22. This
authorizes planning, not implementation.

Outcome: an agent executing a plan with frequent publications is no longer
interrupted by discovery delay. A registered revision whose CI run has not yet
appeared is a quiet provisional state inside the observer. The coordinator
hears from the observer only for actionable events, plus at most one advisory
per observer lifetime when nothing has been discovered for a long time, and the
observer's terminal report still tells the truth about every registered
revision.

Goal served: token efficiency of executing agents (the split's goal). On a
green run today `CI_COVERAGE_UNAVAILABLE` is the only observer message the
coordinator ever receives, and on Claude Code it can arrive as a Stop-time
block that forces another turn.

Evidence: [ODF-069](../../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results)
(two executions; 4 of 5 pushes in one produced the diagnostic while all runs
were green minutes later), ODF-034 (the same diagnostic repeated on every push),
and Terry's Pygardon report in the seed. `5630b28` (released in 0.3.28) proved
that a late failure still reaches its owner and did not change the threshold.

## Scope and current decisions

Required behavior, from the seed's key examples:

1. Seven pushes whose runs appear two to five minutes after each push and pass:
   the coordinator receives zero observer messages; the terminal report lists
   seven verdicts.
2. A run appears four minutes after its push and fails: exactly one message,
   `CI_FAILURE`, and nothing before it.
3. No run ever appears for any registered revision: after the wall-clock bound
   one advisory names the affected revisions and arrives as ordinary context;
   later undiscovered revisions add no further advisory; the terminal report
   lists each as no run discovered.
4. An advisory becomes due while the coordinator is ending its turn: the turn
   ends normally; the advisory waits for the next ordinary delivery and is lost
   if the session ends first.
5. Observation ends with one run in progress and another never discovered: the
   terminal report shows the two states differently, neither as a verdict.

Current decisions constraining the slices:

- One coverage model, as today, with a revised state vocabulary: a registered
  revision is `undiscovered` (no matching run yet; replaces both `unchecked` and
  `uncovered`), `pending` (run in progress), or terminal (`success`, `failure`,
  `incomplete`). A later discovery still replaces `undiscovered` exactly as
  `observeRevisionCoverage` already replaces `uncovered`. `missingPolls` and
  `missingRevisionPollLimit` go away; a registration records when it happened.
- The advisory is a new event type with its own name (execution names it; for
  example `CI_DISCOVERY_DELAYED`), never a reuse of `CI_COVERAGE_UNAVAILABLE`,
  whose meaning was "coverage lost". It is emitted at most once per observer
  lifetime, when at least one `undiscovered` revision has been registered for
  longer than the bound, and it lists every currently `undiscovered` revision.
  Record "advisory emitted" in the mailbox next to coverage, not in worker
  memory, so the terminal report and any restart see the same fact.
- Bound: 10 minutes of wall-clock time, measured entirely with the worker
  loop's existing injectable `now`: the worker stamps a registration the first
  time it observes it, so the `register-push` CLI process needs no clock and
  tests control one clock only. The recorded occurrences show real runs
  appearing within a few minutes of a push; 10 minutes leaves room for
  queueing on a busy shared repository without waiting the whole budget. This
  is one constant in the coverage module, not configuration.
- Host delivery classification lives in `ci-host-hook.mjs` only. On Claude's
  `Stop` and Cursor's `stop`, undelivered records that are advisories alone
  produce an empty selection and remain undelivered and unacknowledged;
  failure-class events keep today's blocking/follow-up behavior and carry any
  advisory along with them. On `PostToolUse` (and Cursor's non-stop events) an
  advisory is delivered as additional context like any other event. Codex
  receives every event line through its stream at the next coordinator
  boundary, unchanged.
- The terminal report keeps its shape: `coverage.unproved` lists
  `{ sha, state }` with `state` in `pending`, `undiscovered`, or `incomplete`;
  `pendingCi: "unobserved"` and the lost-worker terminal result are unchanged.
- Guidance: replace the provisional-notice paragraph in
  `references/ci-monitor.md` (lines 120–128 at `319d58f`) and the three-poll
  sentences in `manuals/custom-ci.md` (lines 190–193) with the advisory and
  terminal-report semantics above. No new guidance section; the reading of the
  stop report stays as short as it is now.

Excluded (deferred promises from the seed): who arms, registers, or stops the
observer (stories B and C); the bounded run-listing gap in `ci-runs.mjs`;
Pygardon adapter behavior; poll interval and budget; custom-adapter changes
beyond inheriting the shared coverage module; delivery after the owning
session ended; any host-hook installation change; release/version bump and
installed managed-copy edits. These exclusions do not prohibit a naturally
general implementation.

Assumptions: the custom command adapter reaches coverage through the same
`observeRevisionCoverage` call, so it inherits the policy without adapter
work; mailboxes are ephemeral under `/tmp`, so the state rename needs no
migration; the hook's existing output shapes for block, follow-up, and
additional context are already natively proven, and this story changes only
which records select them.

## Existing solutions and architecture

PFE inspection at `319d58f` supports changing existing owners; nothing new is
added beyond one event type, one timestamp, and one marker file:

- `scripts/ci-mailbox-revision-coverage.mjs` owns registration
  (`registerPushedRevision`, writes `{ sha, state, missingPolls }`), reading, and
  `observeRevisionCoverage`, which already revisits non-terminal rows every poll
  and is the only producer of `CI_COVERAGE_UNAVAILABLE`. The policy change is
  local to this module plus a `now` parameter from its caller.
- `scripts/watch-ci-execution.mjs` calls `observeCoverage(matching)` once per
  poll and already owns an injectable `now` and `sleep`; the loop needs no
  structural change.
- `scripts/ci-mailbox-store.mjs` owns the terminal result
  (`terminalResult`, `recordLostTerminalResult`) and the
  `unresolvedRevisionStates` list that decides what `unproved` shows; the
  vocabulary change lands there.
- `scripts/ci-host-hook.mjs` (`selectCiEvents`) owns which records reach the
  coordinator and how; today it treats every record alike and blocks on Stop
  whenever context exists. Classification by event type belongs there and
  nowhere else.
- Proof harness: `ci-revision-coverage.test.mjs` (custom adapter, delayed
  success, currently asserts the three-poll `uncovered` transition),
  `ci-revision-coverage-late-github-failure.test.mjs` with its fixtures
  (fake `gh` transport, controllable sleep, real worker and records),
  `ci-host-hook.test.mjs` and `ci-host-hook-test-fixtures.mjs` (Claude and
  Cursor Stop/stop delivery), `ci-observer-stream.test.mjs` (Codex line
  parsing). All run through `bash tests/execution-ci-runtime.sh`.
- Dashboard readers, backlog scripts, publication modules, and wrap-up guidance
  own different facts and need no change.

Common rule: a registered revision has one state that only evidence from the
owned observer advances; the observer speaks to the coordinator only when there
is something to act on. Host differences concern delivery timing, not the
coverage model. No Structure slice is justified.

The [North Star](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
keeps CI coverage as "observation of a specific published revision on a
particular target, owned by the existing observer"; this plan follows that row
without changing it. No Accepted ADR conflict identified. Follow
[AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).

## Proof strategy and execution gates

Drive the real worker, records, and host hook; supply only provider responses
through the existing fake `gh` / fake command seams and control time through
the existing `now`/`sleep` seams. Never inject the expected event to prove its
production or absence. Assert absence by observing the mailbox event log and
the hook's output over a whole timeline, not by a single poll. Test timing is
not a new product timeout.

Each slice owns focused red/green proof, guidance alignment where named, and
slice-local cleanup. Commands below are execution commands, not runs performed
during planning. Edit runtime source under `src/skills/`; do not synchronize
installed copies. At story completion run `bash tests/execution-ci-runtime.sh`
and `git diff --check`; existing CI owns `npm run lint` and `npm test`
(Bash 4+). Runtime dependency declarations are not expected to change.

Native evidence under ADR 0005: the hook's block, follow-up, and additional
context shapes are unchanged and already natively proven for Claude and
Cursor; Codex's stream contract is unchanged. Execution assesses that existing
evidence against slice 4's changed selection rule; if it judges the Stop-time
contract invalidated, obtain one bounded fresh native journey per affected
host observing that an advisory-only Stop does not interrupt, without supplying
the expected answer in the prompt. A missing observation stays pending.

## Ordered slices

### 1. A registered revision without a discovered run stays quiet

Type: Behavior
Status: done
Proof: `ci-revision-coverage.test.mjs` timeline — register several revisions,
let the fake provider return no matching run for many polls, then return
verdicts; assert the mailbox event log contains no coverage event across the
whole timeline and each revision ends in its verdict. Extend the late-failure
test to assert that the `CI_FAILURE` for the late run is the first and only
event for that revision.

Behavior: revisions registered with the observer and no matching run for any
number of polls → the worker keeps polling → no per-revision event is emitted,
each revision stays `undiscovered` until a run is discovered, and a later
verdict (including failure) replaces it and is delivered exactly as today.
Removes `missingPolls`/`missingRevisionPollLimit` and the
`CI_COVERAGE_UNAVAILABLE` producer; `unchecked`/`uncovered` become
`undiscovered` in the coverage module and `unresolvedRevisionStates`. Replace
the `ci-monitor.md` provisional-notice paragraph with one sentence: a revision
without a discovered run is quiet until its verdict arrives or observation
ends. Covers examples 1 and 2.

### 2. The terminal report separates in-progress from never-discovered

Type: Behavior
Status: planned
Proof: worker test that registers two revisions, lets the provider show one
run in progress and none for the other, requests stop, and asserts
`result.json` `coverage.unproved` shows `pending` for the first and
`undiscovered` for the second, with `pendingCi: "unobserved"`; the
lost-worker terminal result test still passes with the new vocabulary.

Behavior: observation is stopped while one registered run is in progress and
another was never discovered → `stop` completes without waiting → the terminal
report lists the two revisions under distinct states, neither as a verdict,
and the `stop` receipt shows them. Align `manuals/custom-ci.md` lines 190–193
with the vocabulary. Covers example 5.

### 3. One advisory per observer after a long discovery gap

Type: Behavior
Status: planned
Proof: worker test with controlled `now` — register three revisions with no
matching runs; advance past the bound; assert exactly one advisory event
naming all three; register a fourth, advance far past the bound again; assert
no second advisory and that the marker is present in the mailbox; a
registration whose run appears before the bound produces nothing.

Behavior: at least one `undiscovered` revision has been registered for longer
than 10 minutes of observer wall-clock and this observer has emitted no
advisory → the next poll → one advisory event listing every currently
`undiscovered` revision is published, a marker is recorded beside coverage,
and no further advisory is ever produced by this observer. The worker stamps
each registration when it first observes it; `observeRevisionCoverage`
receives `now` from the loop.
Extend the `ci-monitor.md` sentence from slice 1 with the advisory's meaning
(informational; observation continues). Covers example 3's emission.

### 4. An advisory never interrupts a host stop

Type: Behavior
Status: planned
Proof: `ci-host-hook.test.mjs` for Claude and Cursor — with only an advisory
undelivered, a `Stop`/`stop` input yields an empty selection and the record
stays undelivered; a following `PostToolUse` (Cursor non-stop event) delivers
it as additional context and acknowledges it; with an advisory and a
`CI_FAILURE` both undelivered, `Stop`/`stop` blocks (follow-up on Cursor) with
both in the message. `ci-observer-stream.test.mjs` confirms the advisory line
parses as an event for Codex.

Behavior: an advisory is the only undelivered record when the host asks the
hook at Stop → the hook returns nothing and acknowledges nothing → the
coordinator's turn ends normally and the advisory is delivered at the next
ordinary delivery, or not at all if the session ends. Covers examples 3
(delivery as context) and 4.

## Proof ownership

| Promise (seed) | Slice | Observation |
| --- | --- | --- |
| No per-revision discovery event; late verdict still replaces provisional state | 1 | event log over timeline; late-failure test |
| Failure delivery unchanged | 1 | late-failure test first/only event |
| Terminal report distinguishes pending vs never discovered; lost-worker unchanged | 2 | `result.json` states; existing lost tests |
| At most one advisory per observer, after the bound, naming affected revisions | 3 | single event + marker under controlled clock |
| Advisory is context, never a Stop block or follow-up | 4 | hook outputs on Claude/Cursor; Codex line parse |
| Guidance reads the new semantics, nothing longer | 1, 2, 3 | `ci-monitor.md`, `custom-ci.md` diffs reviewed under AGENTS.md behavior review |

## Learnings

Slice 1: accepted quiet-timeline proof in `ci-revision-coverage.test.mjs` (three registrations, polls with no run, empty event log, later successes) and late-failure first/only `CI_FAILURE` in `ci-revision-coverage-late-github-failure.test.mjs`. Harness lives in `ci-revision-coverage-test-fixtures.mjs`. `observeRevisionCoverage` still takes `request` for the later advisory.
