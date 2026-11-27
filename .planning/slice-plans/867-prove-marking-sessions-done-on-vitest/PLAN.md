# Prove marking sessions done, stopping, deleting and reopening in Node Vitest

**Identity:** SEED-413#prove-native-session-and-terminal-lifecycle-on-vitest

**Source:** [Prove marking sessions done, stopping, deleting and reopening in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-session-and-terminal-lifecycle-on-vitest)

## Execution context

- Story Branch Mode in `.worktrees/prove-marking-sessions-done-stopping-deleting-an`, branch `codex/prove-marking-sessions-done-stopping-deleting-an`. The integration checkout is `/Users/terryyin/git/open-dough` and the integration target is `origin/main`.
- Publisher `dashboard-territory.local-open-dough`, agent Rina-chan, starting revision `604f6388be7656b86698d32d329d1d0fdd910304`. The established claim `6e0e357049abe45803e713db9f6801a5e8d15572` was accepted on trunk and the story branch. This execution's CI observer covers the story branch.
- Locked `npm ci` and `npm run typecheck:dashboard` passed in the execution checkout with Node 24.21.0. No overrun replanning was requested.
- CI source `terryyin/open-dough`, `ci.yml` (CI). Codex observer `codex-seed413-native-b8ed378a`, directory `/tmp/dough-ci-501/watch-AsT9Qs`, PID `68371`, shell session `20325`, cell `g651:7`.

- Slice 1 accepted on the story branch at `bdc37046e17fd70b846bd1711d68f8ef655da7df`.

- CI repair accepted at `0ababc6ed7b054062072a420500d552a25c4c733`. [The repair record](diagnosis-done-listing-retention.md) retains the failing and passing browser observations.

- Slice 2 accepted at `0a78f6038f543ce3d8e7ec0f72ed29b1e780c702`.

- Slice 3 accepted at `41ca3f16a6808c5db39c8e11f440b3c247687626`.

- Slice 4 accepted at `7b8b2fd3ebe6eb8a6c5c9e232a032310c92b70f8`.

- Slice 5 accepted at `8c1ab566db493f0f6d5d616118fc619a6403549c`.

- Slice 6 accepted at `241bd5b577d36fd150b97ffbfd631e71f8406367`.

## Goal and scope

Give Dashboard maintainers fast, typed Node Vitest proof of how the
Dashboard ends a kept session. The proof covers Mark as done by what the host
lists, the native rename through an open or private terminal and its waits,
the takeover of a reported Done, Codex Done and its races with late native
answers, record deletion, reopening through the terminal, and the Mark as done
question. Move the 14 legacy specs (58 cases) off backend Playwright and
account for each observation. Product behavior is unchanged. Completion
reporting, observation, terminal attach, the Cursor runner and retention
belong to their sibling stories in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- PFE: Done already has a typed chain these cases need.
  [`NativeDoneMarks`](../../../dashboard/server/doneMarks.ts) takes its
  `DoneTerminals`, `hostFor` and reporting folder as collaborators, and
  [`finishNativeDone`](../../../dashboard/server/finishNativeDone.ts) takes
  `DoneLaunches` for the session state. [`admittedDone`](../../../dashboard/server/sessionAdmission.ts)
  admits a Done from its parsed body. [`launch-records-across-processes`](../../../dashboard/backend-tests/launches/launch-records-across-processes.spec.ts)
  and [`agent-launch-codex-lifetime`](../../../dashboard/backend-tests/launches/agent-launch-codex-lifetime.spec.ts)
  already build `NativeDoneMarks` and `AgentLaunches` on plain Vitest over a
  private HOME and a fake host. Reuse that composition. Use the real
  `launchHost` for Claude Code and Codex, and the fake `claude` and `codex`
  fixtures with their file controls (`fakeClaudeControls`,
  `fakeClaudeListing`, `installFakeCodex`). Their state is the native
  observation. Start no Dashboard server and send no HTTP request for the
  Node cases.
- Observe a rename typed into an open terminal at the `DoneTerminals`
  collaborator: the typed keys and the ended attachment. Prove the private
  attachment, its composer wait and shutdown with the real
  [`AgentTerminals`](../../../dashboard/server/agentTerminals.ts) constructed
  without an HTTP server (`new AgentTerminals(null, …)`) over the fake
  `claude attach` PTY. Prove reopening at
  [`JoinedSockets`](../../../dashboard/server/joinedSockets.ts) with the
  socket stand-in that [`joined-sockets-replay`](../../../dashboard/backend-tests/terminals/joined-sockets-replay.spec.ts)
  uses, and the upgrade refusal at
  [`attachableSession`](../../../dashboard/server/terminalAdmission.ts).
- Deletion's request admission (`deleteRequest`) reads the HTTP body, and its
  answer (`deleted` in [`launchBoundaryAnswer.ts`](../../../dashboard/server/launchBoundaryAnswer.ts))
  is private. Slice 7 gives deletion a body-level admission beside
  `admittedDone` and exports its answer from the deletion module. The HTTP
  route keeps calling both.
- Origin refusal is one check in `admitted()` before any route.
  [`agent-launch-refusal`](../../../dashboard/backend-tests/launches/agent-launch-refusal.spec.ts)
  owns it on Vitest (premise 4). The legacy "from another site" Done and
  delete cases are therefore retired as duplicates and not converted.
- Real sockets, the page and a real reload stay with the retained E2E
  journeys:
  [`agent-terminal-done`](../../../e2e/sessions/agent-terminal-done.spec.ts),
  [`agent-terminal-done-reopen`](../../../e2e/sessions/agent-terminal-done-reopen.spec.ts),
  [`agent-terminal-done-codex-page`](../../../e2e/sessions/agent-terminal-done-codex-page.spec.ts)
  and [`agent-launch-recent-delete`](../../../e2e/sessions/agent-launch-recent-delete.spec.ts).
  This plan adds no E2E case.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for records,
  listing rows and sources, and keep malformed wire inputs visible. Add zero
  test-support wrappers. Remove `agentLaunchBoundary.ts`,
  `agentTerminalBoundary.ts`, `openStorySessionSetup.ts`, `support/markDone.ts` and
  `machineLaunchRecords.ts` exports, or the files, when this plan removes
  their last caller. First trace the sibling stories' legacy specs and the
  E2E journeys that import them.

## Decisive premises

Observed in the owned preparation checkout at `23c09d6e4` on 27 November 2026
with Node 24.21.0, one worker, locked dependencies linked from the integration
checkout, and macOS on AC under `caffeinate -s -i`. Load average was 9–13
from other work. Trunk `a9c1f64b5`, the plan's base, changes no `dashboard/`,
`e2e/` or `Distribution/` path since then. Use these runs for behavioral
evidence and take a comparable pair for the execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| 1. The maintained selector reaches all 58 legacy cases | The local-gate selection below passed 58 Chromium cases on the first attempt, with zero retries, in 87.13 s wall. Summed case time is 68.4 s and excludes each spec's server start. By spec: `agent-completion-quiet-rename` 3 cases 15.6 s, `agent-launch-delete` 7 2.9 s, `-done-close` 2 4.3 s, `-done-codex-intent` 3 4.8 s, `-done-codex-races` 6 7.3 s, `-done-codex` 8 9.3 s, `-done-prompt` 4 7.3 s, `-done-refusal` 5 1.8 s, `-done-rename-wait` 2 5.6 s, `-done-stop` 5 2.6 s, `-done` 3 3.3 s, `agent-terminal-done-codex-boundary` 1 1.2 s, `agent-terminal-reopen` 2 2.3 s, `done-question-rule` 7 0.0 s. |
| 2. The real Claude Code host's Done runs on Vitest with no server | A scratch Vitest spec (since removed) was run through `npm run test:dashboard:backend -- 'sessions/zz-scratch-done-probe\.spec\.ts$' --workers=1`. It used a private HOME with `installFakeClaude`, a record kept with `bindRecord`, `NativeDoneMarks({ terminals: new AgentTerminals(null, …), hostFor: launchHost, … })` and `AgentLaunches` for `stateOf`. A session listed `done-exited` was marked Done and `claude rm <shortId>` ran in the project folder, with no stop and no rename, in 140 ms. A session listed `working-idle` was renamed through one private `claude attach` and listed as `done-Probe idle`. It was stopped once, with no Done problem, in 916 ms, which the host's 300 ms key pauses dominate. A first run left the default `working` listing and answered "still working when the wait ended", which confirms that the listing controls drive the wait. |
| 3. The fake Codex host and the joined-socket stand-in run on Vitest | `npm run test:dashboard:backend -- '(launches/agent-launch-codex-lifetime\|terminals/joined-sockets-replay)\.spec\.ts$' --workers=1` passed all 6 Node cases on the first attempt in 14.22 s. The four Codex cases run `installFakeCodex` with `NativeDoneMarks` and `AgentLaunches` (2.3–2.9 s each, mostly from their real Git origin, which the Codex Done slices do not need). The two `JoinedSockets` cases take 2 and 64 ms. |
| 4. One Vitest owner proves origin refusal for every launch-boundary route | With `verifyLocalOrigin(req)` disabled at the start of `admitted()` in a scratch edit (since reverted), `npm run test:dashboard:backend -- 'launches/agent-launch-refusal\.spec\.ts$' --workers=1` failed its from-another-site, missing-Origin, cross-site and foreign-Host cases. Done and delete are admitted after that same check. |
| 5. Reopening writes the record through the store that Done writes | `JoinedSockets.attach` calls `setRecordDoneAt(sourceId, session, undefined)` for a session admitted as `markedDone` (`joinedSockets.ts` lines 70–76). This is the same store write premise 2 observed under a private HOME. Read at `23c09d6e4`. Slice 8 observes the cleared Done time in a fresh `keptRecords` read. |

## Ordered slices

### 1. Mark a Claude Code session Done by what Claude Code lists, or refuse it

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With a private HOME, a kept MakeMe record and the fake `claude`,
`NativeDoneMarks.markDone` with the real host marks the session Done in these
cases:

- A session Claude Code no longer lists keeps Done with the rename cause, and
  nothing is attached, stopped or removed.
- A session listed as exited is removed with `claude rm` in the project
  folder, without rename or stop.
- A failed removal keeps Done with its cause and none of the native
  diagnostic. A second Mark as done retries the removal and clears the cause,
  as it also clears an earlier stored stop failure.
- When the listing cannot be read, the session is still stopped.

Each case observes the fake's call record and a fresh `keptRecords` read.
`admittedDone` refuses an unrecorded session, another project's session, a
missing execution checkout and a malformed body, each before `claude` runs.
Convert `agent-launch-done-stop.spec.ts` and the non-origin cases of
`agent-launch-done-refusal.spec.ts`. Convert `done-question-rule.spec.ts` to
Vitest in place.

Accepted proof: the maintained backend selector with
`'sessions/(agent-launch-done-(stop|refusal)|done-question-rule)\.spec\.ts$' --workers=1`
ran 16 Node cases, zero Chromium cases, zero retries, 1.063 s summed case time
and 3.484 s runner elapsed. The listing tests observe the fresh store and the
fake's native trace. The four admission cases cover five refused inputs and keep
the record unmarked and the native session busy. All seven question outputs
remain covered. Origin refusal reuses premise 4. `npm run typecheck:dashboard`
and `git diff --check` passed. See `slice1-return.md` and its run receipts in
the checkout's Git evidence directory.
The same selection passed again after six Vitest matchers were typed for lint
(`slice1-typed-matchers.json`).

Use a canonical temporary root when asserting the cwd recorded by a native
process. The initial proof reported Darwin's `/var` and `/private/var` alias
as a mismatch. The corrected fixture kept the exact cwd assertion.

The slice edits only its subject specs. Inspection found existing fixture and
production seams reused, with no new support API or refactor candidate.

### 2. Rename through the open or a private terminal, and name why a rename did not settle

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With an open attachment stood in at `DoneTerminals`, Mark as done types
the `/rename done-…` keys once, ends the attachment, stops the session, and a
fresh read still holds the mark. A title holding a control character types
nothing and keeps the `done-` name cause. With no attachment open, the real
`AgentTerminals` renames through a private `claude attach` and hangs it up. A
rename the fake never lists (`claudeRenamesIgnored`) and a session still
working when the wait ends each name their cause and are still stopped, and
the later Mark as done renames them once they are idle. Convert
`agent-launch-done.spec.ts` and `agent-launch-done-rename-wait.spec.ts`. Use
`DOUGH_DONE_RENAME_WAIT_MS` as the legacy server did.

Accepted proof: `npm run test:dashboard:backend -- 'sessions/agent-launch-done(-rename-wait)?\.spec\.ts$' --workers=1` ran five Node cases, zero Chromium cases and zero retries. Summed case time was 7.028 s versus 9.306 s at the legacy baseline. Native key pauses and deliberate waits account for cases above 100 ms. Assertions cover the open attachment's exact keys and end, the private PTY's rename and hang-up, the stored control-character and timeout causes, and settling on a later idle attempt. The Dashboard typecheck and `git diff --check` passed. See `slice2-return.md` and its receipts in the Git evidence directory.

Only the two subject specs changed. The typed terminal and fake host boundaries supply the existing observations, with no new support API or refactor candidate. The separate browser fixture repair did not invalidate this proof.

The open-attachment spec passed again after its mock's unused parameter was omitted (`slice2-tuple.json`).

### 3. Wait for a private composer, and abandon a rename when the server closes

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With the real `AgentTerminals` and the fake PTY's composer delay and
silence controls, Mark as done waits for the private composer after its
banner before typing. A composer arriving after the wait, a client exiting
before its composer, and an attachment that never opens each type nothing and
hang up. `NativeDoneMarks.close()` during manual Done's wait for a working
session keeps the rename cause and still stops it. Closing before the
private composer abandons the rename without typing. Convert
`agent-launch-done-prompt.spec.ts` and `agent-launch-done-close.spec.ts`.

Accepted proof: `caffeinate -s -i npm run test:dashboard:backend -- 'sessions/agent-launch-done-(prompt|close)\.spec\.ts$' --workers=1` ran six Node cases with zero Chromium cases or retries. Summed case time was 7.487 s versus 11.591 s in the legacy baseline. The terminal's screen and typed-key probe distinguish banner from composer. The fake's native trace and kept-record reads verify no late typing, hang-up, retained causes and stop on close. Dashboard typecheck and whitespace check passed. See `slice3-return.md` and terminal receipts in the Git evidence directory.

Only the two subject specs changed. Review found the existing typed terminal, fake host and store owners sufficient, with no changes to shared support.

### 4. Let the developer's Done take over a reported rename

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: A quiet completion report enters `NativeDoneMarks.reported` for a kept
session that outlasts the rename wait. The developer's `markDone` during that
wait takes it over: one rename runs and the reported write is dropped. A turn
that outlasts a short wait keeps the local mark, names that cause, and a later
Mark as done renames it once idle. `close()` during the wait leaves the
pending mark and hangs up its attachment. Convert
`agent-completion-quiet-rename.spec.ts` from its started origin and server to
a kept record with its completion receipt. Premise 2's manual Done ran its
default branch capture over a plain folder with no Git and recorded no
problem, so the slice needs no origin. The legacy 15.6 s is mostly that
setup.

Accepted proof: `caffeinate -s -i npm run test:dashboard:backend -- 'sessions/agent-completion-quiet-rename\.spec\.ts$' --workers=1` ran three Node cases with zero Chromium cases and zero retries. Summed case time fell from 17.213 s to 3.436 s. The real kept record and forwarding store spy establish the retained manual time and absence of an automatic write. The fake PTY establishes the single rename and clean hang-up, or no typed keys on closing. The timeout case retains its cause until the later manual retry. Dashboard typecheck and whitespace check passed. See `slice4-return.md` and its receipts in the Git evidence directory.

Only the subject spec changed. The test uses the existing reporting, store, host and PTY boundaries, with no new shared API or refactor candidate.

### 5. Mark a Codex session Done and end only its attachments

Type: Behavior
Status: done
Estimate: 14–15 active minutes.

Proof: With `installFakeCodex` and a kept Codex record, Mark as done of each
listed conversation state, attached or not, sends the native rename and
interruption the legacy cases observe. It ends every Codex attachment while a
Claude session with the same ID keeps its attachment, mark and current work.
An unrecorded request is refused before any native read or write. A missing
saved endpoint keeps local intent, closes attachments and reports the
operations it could not confirm. A late failed interruption cannot restore
intent after native readiness. A native lifecycle callback keeps Done intent
and a diagnostic before an unknown record is deleted. A failed Done returning
after deletion does not recreate the record. Convert
`agent-launch-done-codex.spec.ts` (all eight cases; its combined refusal
case keeps the unrecorded half), `agent-launch-done-codex-intent.spec.ts` and
`agent-terminal-done-codex-boundary.spec.ts`.

Accepted proof: `caffeinate -s -i npm run test:dashboard:backend -- 'sessions/(agent-launch-done-codex(-intent)?|agent-terminal-done-codex-boundary)\.spec\.ts$' --workers=1` ran 12 Node cases with zero Chromium cases or retries. Summed case time fell from 13.163 s to 1.132 s. Real Done, native traces and fresh reads cover the state matrix, exact turn, missing endpoint and late replies. Real attachments and stand-in sockets distinguish isolation by host and automatic reopening. The surviving unrecorded case and premise 4 account for the old combined refusal. Dashboard typecheck and whitespace check passed. See `slice5-return.md` and final run receipts.

Codex-only fixtures create the full checkout path recursively and register teardown before that setup can fail. The typed attachment PID guard and separate endpoint diagnostics passed the same selection. Only the subject specs changed. Review found no new shared support or refactor candidate.

### 6. Keep Codex Done intent through late native answers

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With the fake Codex conversation controls, each native refusal keeps
local intent and the actual working or interrupted outcome. A turn finishing
during interruption never redirects the request to a newer turn. Active
metadata followed by a completed latest turn invents no interrupt target. An
unreadable active-turn identity stays unknown rather than a guessed stop. A
shared Claude Code stop failure keeps intent and current Working without raw
subprocess errors. Convert `agent-launch-done-codex-races.spec.ts`.

Accepted proof: `caffeinate -s -i npm run test:dashboard:backend -- 'sessions/agent-launch-done-codex-races\.spec\.ts$' --workers=1` ran six Node cases, zero Chromium cases and zero retries. Summed case time fell from 6.723 s to 1.827 s. The vendor trace and state read distinguish a failed rename from a failed stop, identify the originally observed turn without touching the newer turn, and show no interrupt with completed or unreadable latest-turn data. The real Claude subprocess failure verifies the safe diagnostic and kept Done mark. Dashboard typecheck and whitespace check passed. See `slice6-return.md` and receipts in Git evidence.

Only the subject spec changed. Acceptance narrowed the newer-turn assertion to the native work that must remain in progress, preserving the exact single interrupt for the old turn and bringing the projected formatted spec within 250 lines. The same selection passed once after the adjustment (`slice6-distinct-turn.json`). Inspection found no further refactor candidate.

### 7. Delete only a record whose session is gone, or refuse

Type: Behavior
Status: done
Estimate: 14–15 active minutes.

Proof: Give deletion a body-level admission beside `admittedDone` and export
its answer from `launchRecordDeletion.ts`. The launch-boundary route keeps
calling both, and existing callers stay green. Then, with a private HOME and
the fake `claude`, deleting removes only the record of a session whose
listing cannot be read, or that Claude Code no longer lists and is not Done.
It stops and renames nothing, and a fresh read no longer holds the record. A
known session keeps its record and the answer carries its state. An
unrecorded session and another project's session are refused before `claude`
runs. A record file that cannot be written answers why and keeps the record.
Convert `agent-launch-delete.spec.ts`, except its origin case.

Accepted proof: the six migrated deletion cases ran on Node in 0.213 s of summed case time versus 3.817 s for those observations on Chromium. They exercise `admittedDelete` and `deleted` through private kept records and the real Claude host, with no stop or rename. Fresh reads establish removal for gone or unreadable sessions and preservation for known, refused or unwritable cases. The shared origin owner ran in the focused suite.

The consumer trace and receipts (`slice7-return.md`, `slice7-refactor-return.md` in Git evidence) cover 46 backend cases and eight affected Chromium journeys. Backend coverage includes HTTP 500 serialization, deleted answers, Cursor cleanup and Codex late results. The first six-case browser selection passed with a terminal exit receipt; individual timings were unavailable there. Two additional deletion journeys passed with recorded timings. Dashboard typecheck and whitespace check passed.

The independent refactor kept the host cleanup import inside successful post-delete handling to preserve the record store's existing load boundary. It renewed the 46-case backend selection and Dashboard typecheck. Existing browser observations remain applicable, and slice 8 reruns the retained combined browser selection.

### 8. Reopen a Done session through its terminal, and retire the legacy setup

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: A Done session is admitted by `attachableSession` as `markedDone` and
attached to `JoinedSockets` with the socket stand-in. Once the attach starts,
a fresh `keptRecords` read holds no Done time, so the record is reopened in
the store a restart reads. A session Claude Code no longer lists has its
upgrade refused at `attachableSession` and stays Done. Convert
`agent-terminal-reopen.spec.ts`. Delete the retired legacy specs. Remove the
test-support exports or files that lost their last caller. Run the final
comparison and the retained E2E journeys.

## Proof ownership and local gate

The execution baseline at `6e0e357049abe45803e713db9f6801a5e8d15572` ran the
backend command below on the awake macOS host on AC, with the locked install
and one worker. All 58 Chromium cases passed on their first attempt. Wall
time was 90.37 s, summed case time was 69.661 s, and 51 cases exceeded
100 ms. The raw record is `baseline.json` in the checkout's Git evidence
directory. Load was comparable to preparation (about 12 at the run).

Files in the following map are relative to `dashboard/backend-tests/sessions/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-done-stop` (5), `agent-launch-done-refusal` (4 of 5), `done-question-rule` (7) | Done by listing, `claude rm` and retry, stop on unreadable listing, refusals before `claude` |
| 2 | `agent-launch-done` (3), `agent-launch-done-rename-wait` (2) | Keys typed once, attachment ended, control-character refusal, private rename, waits named |
| 3 | `agent-launch-done-prompt` (4), `agent-launch-done-close` (2) | Composer wait, nothing typed late, hang-up, shutdown abandonment |
| 4 | `agent-completion-quiet-rename` (3) | One rename on takeover, dropped reported write, pending mark on close |
| 5 | `agent-launch-done-codex` (8, the cross-origin half of one retired), `agent-launch-done-codex-intent` (3), `agent-terminal-done-codex-boundary` (1) | Codex rename and interruption, attachments by host, kept intent and no recreation |
| 6 | `agent-launch-done-codex-races` (6) | Intent and actual outcome kept under late answers |
| 7 | `agent-launch-delete` (6 of 7) | Only gone sessions deleted, refusals, unwritable file |
| 8 | `agent-terminal-reopen` (2) | Done time cleared on attach, refused upgrade stays Done |
| — | The origin cases in `agent-launch-done-refusal` and `agent-launch-delete`, and the cross-origin half of the `agent-launch-done-codex` refusal case | Retired as duplicates of `launches/agent-launch-refusal.spec.ts` (premise 4) |

For the first and final comparisons, use fresh absolute proof paths from the
repo root and one worker. Repeat the baseline at the execution base if
affected paths or the measurement conditions changed. Account for all 58
legacy cases before accepting zero Playwright selections for these 14 files.
If a replacement moves to a new filename, add its exact selector to the
candidate run and record the matching proof owner.

```sh
selection='sessions/(agent-launch-done(-close|-codex|-codex-intent|-codex-races|-prompt|-refusal|-rename-wait|-stop)?|agent-launch-delete|agent-terminal-done-codex-boundary|agent-terminal-reopen|done-question-rule|agent-completion-quiet-rename)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/sessions/(agent-terminal-done(-reopen|-codex-page)?|agent-launch-recent-delete)\.spec\.ts$' --workers=1
```

Run the affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace),
including the launch-boundary specs that reach deletion's admission and
answer in slice 7. Run `npm run typecheck:dashboard` for changed typed
contracts. Record engine and case counts, per-case time against roughly
100 ms, summed case time, elapsed selection time, and the separate cost of the
retained E2E journeys.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Plan review

Slice-plan refinement was not needed. Each Behavior slice owns one Done
family, converts and removes its own legacy cases, and reuses the same
typed composition. Slice 7's small admission and answer change is the only
structure, and it serves only its own Behavior. Slices 5 and 7 are near the
15-minute limit: slice 5 converts 12 Codex cases and slice 7 adds the
deletion seam. Slice 5's estimate assumes Codex Done needs no real Git origin. The
four legacy Codex Done specs import neither `startOrigin` nor a queued
repository, so they never had one. This review found
no other slice-specific concern.
