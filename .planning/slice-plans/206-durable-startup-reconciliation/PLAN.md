# Keep reconciled startups settled under one unresolved-attempt rule

**Identity:** SEED-072#durable-startup-reconciliation
**Source:** [bounded correction story](../../seeds/SEED-072-responsive-session-start-reconciliation.md#durable-startup-reconciliation)
**Authority:** Planning only; no Take, implementation, commit, or publication.
The invoking execution commits these records.
**Preparation:** Written in the invoking execution's owned checkout
`/Users/terryyin/git/open-dough/.worktrees/keep-the-dashboard-responsive-while-session-star`,
branch `claude/keep-the-dashboard-responsive-while-session-star`, remote
`origin`, target `main`, integration checkout `/Users/terryyin/git/open-dough`.
Queued 2026-10-01 at Terry's direction; no preparation assignment.

## Source and provenance

- Reviewed execution: `SEED-072#responsive-session-start-reconciliation`
  through plan 192 (closed; recoverable at
  `4cdf6120:.planning/slice-plans/192-responsive-session-start-reconciliation/PLAN.md`),
  claim `d686dc59`, commits `109fd76b`, `b68b1c7b`, `191721a0`, `f787fc6c`,
  `0cc4f307`.
- Current findings from the retrospective outcome review, re-observed below:
  1. Reconciliation is page memory only (`reconciledIds` in
     `dashboard/src/startupReconciliation.ts`), while settled attempts are kept
     for `launchRetentionDays` (30, `dashboard/src/launchRecord.ts`,
     `dashboard/server/launchAttemptStore.ts`). Every page open re-judges each
     story's latest settled publishing attempt; at a later trunk revision it
     asks a GitHub compare and protects the card until it answers, persistently
     under rate limits. A story that leaves the snapshot after reconciling
     leaves a permanent “Waiting for published story state: … no longer lists
     this story” item in Startup recovery that Recheck cannot clear.
  3. Service admission (`conflictWith` in `dashboard/server/launchAttemptOwner.ts`,
     `conflicting` in `dashboard/server/launchAttemptConflicts.ts`) refuses a
     fresh start only for kept attempts with no outcome, while the page protects
     a story whose latest attempt `needsReconciliation`
     (`dashboard/src/launchOutcome.ts`), including settled uncertain and unknown
     publication. `dashboard/AGENT-LAUNCH.md` “Startup handoff and
     reconciliation” claims the stronger rule.
  4. Startup recovery rewrites answer prose by substring (`forContinuation` in
     `dashboard/src/StartupRecovery.tsx`), so its words depend on phrasing
     formed elsewhere.
  2. A Claude Code launch whose native outcome is uncertain keeps its story
     protected: Recheck only re-reads attempt evidence (`needsReconciliation`
     is a pure function of the kept record) and Continue relaunches, which may
     create a duplicate session.
- Terry's decision, 2026-10-01: Recheck verifies such a launch through
  `claude agents`.

## Goal and scope

A developer who reopens, reloads, or restarts the dashboard after a startup
reconciled sees that story's normal actions and no stale recovery item. The
service and the page refuse or protect exactly the same unresolved attempts.
Recovery wording reads correctly where it is shown because it is formed where
the answer is formed. Recheck settles an uncertain Claude Code launch from
Claude Code's own session listing instead of leaving Continue as the only exit.

Included:

- A reconciled settled attempt stays reconciled across pages, reloads, project
  switches and server restarts on this machine, kept as attempt evidence in
  `launch-attempts.json`, never as a story fact or browser storage.
- The same reconciliation rule settles a definitively settled publishing attempt
  whose story is no longer listed when the shown revision contains its accepted
  revision (the seed's “reconcile that change rather than wait for the old
  assignment to reappear”).
- One shared “unresolved attempt of a story” rule used by service admission and
  by the page's story protection.
- Answers that can reach Startup recovery are worded at their source so they
  name no control the place showing them does not offer; the page shows them
  verbatim.

- Recheck of a story attempt whose Claude Code outcome is uncertain reads
  `claude agents` and settles the attempt from it: exactly one listed session
  with the attempt's launch name, started in its start folder (project folder
  or established workspace) at or after the attempt was accepted, and held by
  no other launch record, is recorded as that attempt's launched session; a
  readable listing with no such session settles it as not launched. An
  unreadable listing or more than one candidate leaves it unresolved with that
  reason. Continue stays available while it is unresolved.

Material exclusions:

- A developer-asserted “found it” resolution, and native verification for
  Codex (which keeps its existing `recover`) or ad hoc launches.
- Ad hoc launches keep their current admission and Start session behavior; the
  shared rule is story-scoped, as today.
- No new feature promise, launch mode, host, endpoint semantics beyond the one
  reconciliation note, retry policy, or retention change.

Assumptions: the browser stays the judge of reconciliation (it already holds
the snapshot, pinned reads and containment answers); the service keeps the
judged result with the attempt it owns.

## Preserved promises and constraints

- All plan-192 accepted proof stays green (its slice “Accepted proof” lines),
  notably stale or out-of-order snapshot protection and containment proof
  (`responsive-session-reconciliation*.spec.ts`,
  `authenticated-read-containment.spec.ts`), removed-story recovery while an
  attempt genuinely needs reconciliation
  (`responsive-session-recovery-restart.spec.ts`), continuation and its refusals
  (`agent-launch-continuation.spec.ts`), and access/focus
  (`responsive-session-access.spec.ts`).
- A reconciliation is recorded only after the existing rule reconciled the
  attempt: an older or unrelated snapshot, a failed compare, or elapsed time
  never records one. An attempt that needs reconciliation is never marked.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one authoritative home per fact and published derivation of views. The note is
  machine-local launch evidence about an attempt, beside its receipt and outcome;
  published story facts still come only from origin. ADR 0000 keeps this
  feature-local design in `dashboard/AGENT-LAUNCH.md`.
- The UX/UI North Star keeps deferring startup handoff to `AGENT-LAUNCH.md`; no
  North Star topic is added.
- A published start whose session was refused keeps its Taken card's kept-start
  continuation (settled, published, not unresolved).

## Architecture and PFE decisions

| Existing responsibility and evidence | Decision |
| --- | --- |
| `LaunchAttemptOwner` owns attempt state; `attempts()` answers kept records first, then owned memory; `note` writes whole records through `keepAttempt` | Record reconciliation through the owner (memory and store together) as an optional attempt field, through one validated route beside accept/continue. The owner refuses it for an unknown attempt or one that needs reconciliation and treats repeats as no change. Continuation rebuilds an attempt only from needs-reconciliation attempts, which are never marked, so no mark is lost. |
| `useStartupReconciliation` judges reconciliation; `latestSettled` / `laterAttempt` select a story's latest attempt | Keep the judge. Skip attempts already marked; report newly reconciled ones once. Drop the “story is listed” condition on asking containment, so a removed story's settled publishing attempt reconciles when the shown revision contains it. |
| Claude host: `claudeSessions` parses `claude agents --json --all`; launch confirmation matches the printed short id; session names are `<project> · <kind> · <title>` (`claudeSessionName`) | Add native verification to the Claude host adapter, reusing its listing and name, used by the owner when Recheck asks about an uncertain Claude story attempt. The verified outcome is noted through the owner like any outcome and keeps a launch record as confirmation does. No new host-generic platform. |
| `needsReconciliation` (shared, no Node import) and `storyStartup`; server `conflicting` with its own unsettled-only filter | Move the latest-attempt selection beside `needsReconciliation` and add one shared rule naming a story's unresolved attempt; `storyStartup` and `conflicting`/`notContinued` both use it. Continuation is refused only when the unresolved attempt is a different one. |
| Answer prose formed in hosts, start results, the owner and the page client; `forContinuation` rewrites it | Remove the rewrite. Each forming site words its direction so it is true wherever its answer is shown (state what is known and what to check; leave pressing a control to the control beside it, which already carries its own guidance, such as `NativeCheck`). |

The shared rule is where the verified native outcome takes effect: once noted,
the attempt is no longer unresolved for admission or protection.

## Observed premises

Observed at `0cc4f307` in this checkout with local fixtures only (bare origin,
fake GitHub, native doubles); no paid call, real GitHub or publication. The two
temporary observation specs were deleted after running.

| Premise / consuming slice | Literal observation and result |
| --- | --- |
| Reconciliation is page memory and a reload at a later trunk revision re-protects a reconciled Taken card while its compare fails (slice 1 reproduces this first). | Read `startupReconciliation.ts` (`useState` `reconciledIds`, containment asked when shown revision ≠ accepted). Temporary spec: start execution through `openStories`/`startExecution`, wait until the Taken card had no disabled buttons, move origin `main` to a descendant (`commitOn` + `update-ref`), answer `compare` with `rateLimitedAnswer()`, reload. Result: the Taken card had 4 disabled buttons and said “Waiting for published story state … GitHub limited the rate … while reading whether <later> contains <accepted>”. Reproduced. |
| A story removed after reconciliation leaves a permanent waiting item Recheck cannot clear (slice 1). | Same temporary spec file, second test: reconciled Take, `removeQueuedStory(origin)`, reload. Result: Startup recovery listed “Story A (SEED-A#a) · execution start in Claude Code — Waiting for published story state: the published snapshot shown no longer lists this story. … published at revision 73abde6. Its session started.”; after clicking Recheck the same item remained. Reproduced. `startupReconciliation.ts` asks no containment for an unlisted story, so `judged` stays `waiting`. |
| Settled attempts survive in the store for 30 days and are returned to every page (slice 1 relies on reading a stored note back). | Read `launchAttemptStore.ts` retention filter (`settledAt` + `launchRetentionDays`), `LaunchAttemptOwner.attempts()` (kept first, then owned memory), `attemptObservationSchema` extending `launchAttemptSchema` (an added optional field reaches pages). |
| The service accepts a fresh start while the story's latest attempt is settled uncertain (slice 2 reproduces this first). | Read `conflictWith` filtering `attempt.outcome === undefined`. Temporary spec with `startTimeoutMs: 3_000` and held push: execution attempt settled `uncertain`, publication `unknown`, no start running, card statically protected; raw `accept(dashboard, {...launchRequest, identity: queuedIdentity, title: "Story A", workflow: "refinement"})`. Result: HTTP 200 `{"kind":"accepted",...}`, attempts became `[execution unknown/uncertain, refinement unknown/(running)]`. Reproduced. |
| Callers of the rules slice 2 changes are only dashboard code and specs. | `grep -rn "laterAttempt\|needsReconciliation(\|conflicting(\|notContinued(" dashboard/src dashboard/server dashboard/tests scripts src`: `storyStartup.ts`, `startupRecoveries.ts`, `startupReconciliation.ts`, `launchOutcome.ts`, `launchAttemptOwner.ts`, `launchAttemptConflicts.ts`; no script or feature caller. Specs reach them only through the HTTP boundary and pages. |
| Rewritten wording reaches Startup recovery through three places (slice 3). | Read `StartupRecovery.tsx`: `forContinuation` applies to `KnownFacts` outcome explanations, a lost answer's `problem`, and a refused continuation's answer. `grep -rn -i -E "start(ing)? again" dashboard/server dashboard/src` lists the forming sites: `startWorkflows.ts` (3), `startResult.ts`, `preparationResult.ts`, `launchAttemptOwner.ts` (unexpected end), `agentLaunches.ts` (unreadable evidence), `launchRun.ts:111`, `hosts/claude/launch.ts` (4), `hosts/codex/launch.ts` (3), `agentLaunchClient.ts` (lost answer), `launchCreation.ts`, `pageAttempt.ts`. |
| The cited garbled examples (slice 3 scope). | Partly false as stated. `hosts/codex/launch.ts:78` is Codex first-input evidence shown verbatim by `LaunchSession.tsx` on the session entry, never through `forContinuation`; there “before starting again” reads correctly. `launchRun.ts:111` does garble to “Continue the recorded conversation before continuing.”, but it is reached only for a kept record with unconfirmed first-input evidence on a host without `recover`; `hosts/claude/launch.ts` writes no first-input evidence, so only legacy or hand-edited store content reaches it. A reachable mismatch exists: a lost answer's item (`unacknowledged`) offers no Continue, yet its rewritten problem says “… before continuing”. The structural weakness (page correctness depending on substrings formed elsewhere) is the evidenced correction. |
| Existing recovery wording assertions slice 3 must update. | `grep -rn -E "continuing resumes|before continuing|then continue|Start again resumes|before starting again|then start again" dashboard/tests`: `responsive-session-recovery.spec.ts:61`, `agent-launch-card-problems.spec.ts:104`, `agent-launch-ad-hoc-problems.spec.ts:38,43,124`, `agent-launch-start-refusal.spec.ts:93`, `agent-launch-codex-creation.spec.ts:86`, `agent-launch-start-resume.spec.ts:78,117`, `agent-launch-preparation-resume.spec.ts:121,149`, `agent-launch-codex-confirmation.spec.ts:59`, `execution-start-result.spec.ts:117-138`. |

| `claude agents --json --all` exposes enough to match an uncertain launch (slice 4). | Ran read-only in `/Users/terryyin/git/open-dough` on 2026-10-01 (local listing, no model call): exit 0, 668 entries, fields `cwd, id, kind, name, pid, sessionId, startedAt, state, status`; `startedAt` is epoch milliseconds. `runtime.ts` `listedSession` currently keeps `id, sessionId, name, state, status, waitingFor`, so `cwd` and `startedAt` must be added to the private parse. The synthetic `claude` double in dashboard fixtures must answer them too. |

Observation command (both temporary specs, passed as observations):

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/<temporary-spec>.spec.ts --workers=2 --reporter=line
```

## Proof ownership and execution gates

| Promise / key example | Owning slice and observable boundary |
| --- | --- |
| Reload after a reconciled Take at a later trunk revision: card actions enabled, no recovery item, no compare asked after reload, even with compare rate-limited | 1: page journey extending `responsive-session-reconciliation.spec.ts` |
| Same after a second page and a server restart on the same machine | 1: page journey with `restartAfterPush`-style restart (`responsiveRecovery.ts`) |
| Story removed after reconciliation: no Startup recovery item after reload or restart; Recheck not needed | 1: page journey with `removeQueuedStory` |
| Story removed before this page reconciled, shown revision contains the accepted one: one compare, then reconciled, no item | 1: page journey with the page closed during publication |
| Stale/unrelated snapshot or failed compare records nothing; needs-reconciliation attempt refused by the note route | 1: existing reconciliation specs stay green; HTTP check in `agent-launch-continuation.spec.ts` |
| Raw HTTP accept refused for a story whose latest attempt is settled uncertain or of unknown publication, from any workflow; continuation of that attempt still accepted; failed-but-published kept-start continuation still accepted | 2: HTTP boundary in `agent-launch-continuation.spec.ts` plus existing `responsive-session-recovery.spec.ts`, `responsive-session-reconciliation-refusals.spec.ts` |
| Page protection unchanged and decided by the same rule | 2: existing recovery/restart/reconciliation specs |
| Recovery shows answers verbatim; a lost answer's item names no Continue; kept-start unknown publication and Claude timed-out answers read correctly in recovery and beside Start | 3: `responsive-session-recovery.spec.ts`, `responsive-session-recovery-reads.spec.ts`, `agent-launch-card-problems.spec.ts`, `agent-launch-ad-hoc-problems.spec.ts` |
| `launchRun.ts:111` answer reads correctly where shown | 3: focused check with a forged pending record, as `agent-launch-codex-confirmation.spec.ts` forges legacy evidence |
| Recheck settles an uncertain Claude story launch: one matching listed session → launched with its session on the card and actions back; readable listing without one → not launched, protection lifts, Continue gone; unreadable or two candidates → still protected with that reason; no `claude --bg` call during Recheck | 4: page journey extending `responsive-session-recovery.spec.ts` / `agent-launch-card-problems.spec.ts` with the synthetic `claude` listing |
| Start/preparation result wording consumers | 3: `execution-start-result.spec.ts`, `agent-launch-start-resume.spec.ts`, `agent-launch-preparation-resume.spec.ts`, `agent-launch-start-refusal.spec.ts`, `agent-launch-codex-creation.spec.ts` |

Focused command form, per slice, with the specs it owns plus the preserved
reconciliation/recovery specs it touches:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <specs> --workers=2 --reporter=line
npm run typecheck:dashboard
```

Type checking is needed for the changed shared schema and rule. No full
repository suite is a routine local gate for this dashboard-only change; hosted
CI still runs after publication. Execution follows the installed execute-plan
acceptance, post-change refactoring and delivery contract; the local
`.githooks/pre-commit` runs check-only lint on staged files. No numeric slice
target or hard limit was supplied: bound each slice by one outcome and proof
loop including cleanup. Use existing fixtures (`responsiveStart.ts`,
`responsiveRecovery.ts`, `committedOrigin.ts` with `follows: true`,
`startOrigin` `holdPushes`), no paid calls and no real GitHub.

## Ordered slices

### 1. A reconciled startup stays reconciled across pages, reloads and restarts
Type: Behavior
Status: done
Proof: First turn the premise observation into failing page proof: extend the
first `responsive-session-reconciliation.spec.ts` journey so that, after its
descendant read, compare answers are rate-limited and the page reloads; the
Taken card keeps every action enabled, Startup recovery is absent, and
`published.compares` gains no entry. Add a journey (reconciliation or
recovery-restart spec) where the reconciled story is then removed and the page
reloads and the server restarts on the same machine: no Startup recovery item,
other cards unaffected. Add the removed-before-reconciled case: the accepting
page is gone while the Take publishes and the story is then removed; a new page
asks one compare and shows no item. An HTTP check refuses the note for an
unknown attempt and for one that needs reconciliation, leaving it unchanged.
Keep `responsive-session-reconciliation*.spec.ts`,
`authenticated-read-containment.spec.ts` and
`responsive-session-recovery-restart.spec.ts` green, then run
`npm run typecheck:dashboard`.

Behavior: Given a settled attempt the existing rule reconciled on any page →
a later page, reload, project switch or server restart reads it from this
machine's attempts → that story shows its current published actions with no
startup status, no recovery item and no new compare. A settled publishing
attempt whose story the shown snapshot no longer lists reconciles when the shown
revision is or contains its accepted revision; otherwise it keeps waiting as
today. Attempts that need reconciliation are unaffected. Update
`dashboard/AGENT-LAUNCH.md` “Startup handoff and reconciliation” to say a
reconciled start stays so on this machine.
Safe stop: reconciliation persists; admission and wording unchanged.

Accepted proof: `reconciledAt` on the kept attempt, written only through
`POST /__agent-launch/reconciled` (`launchAttemptReconciliation.ts`), which
refuses unknown, other-project, unsettled and needs-reconciliation attempts;
the page judge skips marked attempts and asks containment for unlisted stories.
Observed (fail-first, then green) by `responsive-session-reconciliation.spec.ts`
first journey (reload with compare rate-limited: no disabled buttons, no
recovery, no new compare), `responsive-session-reconciliation-kept.spec.ts`
(removed after reconciling: no recovery after Refresh, reload, restart, second
page; removed before reconciling: one compare on a new page), and the note
assertions in `agent-launch-continuation.spec.ts`. Command:
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/responsive-session-reconciliation.spec.ts dashboard/tests/responsive-session-reconciliation-kept.spec.ts dashboard/tests/responsive-session-reconciliation-refusals.spec.ts dashboard/tests/authenticated-read-containment.spec.ts dashboard/tests/responsive-session-recovery-restart.spec.ts dashboard/tests/agent-launch-continuation.spec.ts --workers=2 --reporter=line`
(15 passed after refactor) and `npm run typecheck:dashboard`. Project switch
shares the reload's machine read and has no separate journey.
Learning: tests poll the stored `reconciledAt` before reloading so the note
POST cannot race the reload; compare lists are asserted against the list at
reconciliation, which includes the page's first ordinary compare.

### 2. Service admission and story protection follow one unresolved-attempt rule
Type: Behavior
Status: planned
Proof: Extend `agent-launch-continuation.spec.ts` at the HTTP boundary: with a
story's latest attempt settled `uncertain` (and one with publication `unknown`),
a raw accept from either workflow is refused with nothing started and the
attempts unchanged; continuing that attempt is still accepted once. Keep green
`responsive-session-recovery.spec.ts` (refused while its start runs, resumed
once), `responsive-session-recovery-restart.spec.ts` (fresh accept refused after
restart), `responsive-session-reconciliation-refusals.spec.ts` (published Take
with refused session still continues from its Taken card),
`agent-launch-acceptance.spec.ts`, then `npm run typecheck:dashboard`.

Behavior: Given a story whose unresolved attempt (running, unsettled with no
server running it, or latest settled while its session or publication may or
may not exist) is kept on this machine → any fresh start of that story arrives
at the service or the page → the service refuses it, pointing to Startup
recovery, and the page keeps the story protected; only that attempt's
continuation proceeds. One shared rule in the browser-safe launch outcome module
decides it for both; `storyStartup` and the server conflict checks use it.
Correct `dashboard/AGENT-LAUNCH.md` only where its wording differs from the
delivered rule.
Safe stop: the raw-HTTP gap is closed; recovery wording unchanged.

### 3. Recovery wording is formed where each answer is formed
Type: Behavior
Status: planned
Proof: Remove `forContinuation`; Startup recovery renders answers verbatim.
Update the recovery assertions to the source wording: kept-start unknown
publication in `responsive-session-recovery.spec.ts` reads correctly with no
“Start again”; the Claude timed-out answer in `agent-launch-card-problems.spec.ts`
reads correctly in recovery; a lost answer's item in
`responsive-session-recovery-reads.spec.ts` names no Continue it does not offer;
ad hoc answers beside Start session (`agent-launch-ad-hoc-problems.spec.ts`) and
in recovery agree. Add a focused check that a forged pending record reaching
`launchRun.ts`'s unconfirmed branch yields readable wording. Update the start
and preparation result consumers listed under premises, then run them and
`npm run typecheck:dashboard`.

Behavior: Given an answer that can be shown in Startup recovery, beside a card
or beside Start session → it is shown → it states what is known and what to
check, and names a control only where every place showing it offers that
control; Startup recovery adds only its own guidance (`NativeCheck`) and buttons.
With slice 2, an unresolved attempt is resumed only by continuation, so no
answer for one directs to pressing Start. Card-only refusals may keep naming
Start where only the card shows them.
Safe stop: the correction outcome is complete; all earlier proof still green.

### 4. Recheck settles an uncertain Claude Code launch from `claude agents`
Type: Behavior
Status: planned
Proof: Page journey with the synthetic `claude` double: a story launch times
out (uncertain) after `claude --bg` started a session; Recheck in Startup
recovery records it as launched, lists the session on the card, restores the
card's actions and removes the recovery item, with exactly one `claude --bg`
call. Variants: listing readable with no matching session (wrong name, other
folder, started before acceptance, or already held by another record) settles
as not launched and lifts protection; an unreadable listing and two candidates
keep the story protected with a reason naming why. Raw HTTP: a fresh accept is
refused before and accepted after a settling Recheck. Keep plan-192 Claude
specs and slices 1–3 proof green; `npm run typecheck:dashboard`.

Behavior: Given a story attempt whose Claude Code launch is uncertain → the
developer presses Recheck → the service reads `claude agents` once and settles
the attempt only from an unambiguous answer, as above; otherwise it keeps the
attempt unresolved and says why. Continue remains the developer's explicit
choice while unresolved. Document the rule in `dashboard/AGENT-LAUNCH.md`.
Safe stop: uncertain Claude launches have a non-duplicating exit.

## Current decisions

- The reconciliation note lives with the attempt in `launch-attempts.json`,
  written through `LaunchAttemptOwner`, and expires with the attempt; browser
  storage and server-side re-judging were considered and rejected (per-browser
  only; would duplicate the browser's judge).
- The note is recorded only by the existing reconciliation rule and is refused
  for attempts that need reconciliation.
- One shared unresolved-attempt rule; a continued attempt conflicts only with a
  different unresolved attempt of its story.
- Finding 2 is included by Terry's decision (2026-10-01): Recheck verifies via
  `claude agents`; Continue's native behavior is unchanged.
- Cumulative review: three slices, each one externally observable outcome with
  its own proof loop (page persistence, HTTP admission, recovery text) over one
  attempt-evidence model; no host-, workflow- or file-split slice and no
  accumulating special case. Slice 3 depends on slice 2's rule for its wording
  direction; slices 1 and 2 are independent. Slice 4 adds one native-evidence
  outcome on the same model and depends on slice 2's shared rule.
