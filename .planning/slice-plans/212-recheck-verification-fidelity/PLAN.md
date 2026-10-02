# Recheck verifies only what its host can list, and trusts a launch's own record

**Identity:** SEED-072#recheck-verification-fidelity
**Source:** [bounded correction story](../../seeds/SEED-072-responsive-session-start-reconciliation.md#recheck-verification-fidelity)
**Authority:** Planning only; no Take, implementation, commit, or publication.
The invoking execution commits these records.
**Preparation:** Written in the invoking execution's owned checkout
`/Users/terryyin/git/open-dough/.worktrees/keep-reconciled-startups-settled-under-one-unres`,
branch `claude/keep-reconciled-startups-settled-under-one-unres`, remote
`origin`, target `main`. A retrospective follow-up, not a queued story; no
preparation assignment.

## Source and provenance

- Reviewed execution: `SEED-072#durable-startup-reconciliation` through
  plan 206 (recoverable at `62bb5cbd:.planning/slice-plans/206-durable-startup-reconciliation/PLAN.md`), commits
  `3d82d365`, `a6fa2461`, `f7dbab51`, `1414d5c8` (`2e28c114` is an unrelated
  cherry-picked test fix).
- Current findings from that execution's retrospective, re-observed at
  `1414d5c8` below:
  1. Drift: `launchVerifiable` (`dashboard/src/launchOutcome.ts`) does not
     consider host capability, so Recheck of an uncertain Codex story attempt
     calls `requestLaunchVerification` (`dashboard/src/startupRecoveries.ts`)
     and the server `verifyLaunch` (`dashboard/server/launchVerification.ts`)
     answers unresolved “This host offers no session listing to recheck the
     launch against…”, which the page shows as the item's answer. This
     contradicts `dashboard/AGENT-LAUNCH.md` (“Codex and ad hoc starts are
     rechecked as before”) and plan 206's exclusion (Codex keeps its `recover`).
  2. Bug (low likelihood): on success `verifyLaunch` keeps the launch record and
     removes the kept start before `verifyAttempt`
     (`dashboard/server/launchAttemptVerification.ts`) writes the outcome. If
     that write fails, the attempt stays uncertain with its kept start gone; a
     later Recheck falls back to the project folder and, finding no candidate,
     settles `failed`/`not-listed` although its own launch record holds the
     session. The same happens when an own record exists but its session is no
     longer listed: the own-record check runs only after a candidate is found.
     Impact: “not launched” while the card lists the session; protection lifts
     and Start could duplicate it.
  3. Architecture residue: `verifyLaunch` re-derives where a story launch
     started (kept start workspace, versus `launchClaude`'s
     `established?.workspace ?? folder` fed by `startChoice`/`keptChoice` in
     `dashboard/server/startLaunch.ts`), the recorded request policy
     (`withStartPolicy(requested, policyOf(kept))` versus `start.policy` in
     `dashboard/server/launchRun.ts`) and the launch record's shape. Drift
     between launch and verification would mis-settle `not-listed`; finding 2
     is one symptom.

## Goal and scope

A developer who presses Recheck on an uncertain story start sees an answer
true to that start. Recheck asks for native verification only through a host
whose local service offers a session listing; a Codex start is rechecked as
before. An attempt whose own launch record already holds a session settles as
launched before any listing or folder matching. Launch and verification share
one rule for where a story launch started and what record it keeps.

Included:

- The host capability reaches the page as a fact from the local boundary, the
  way `attach` and `stop` already do (`hostOperations`), and the one shared
  `launchVerifiable` rule uses it on both page and server.
- Verification reads this machine's launch records first: the attempt's own
  record (same story, workflow and project, launched since acceptance, as
  `ownRecord` already defines) settles it as launched with that record's
  session, with no listing read and no record written.
- One server rule, from a story's kept start, names the folder its launch
  starts in, the policy its record carries and the facts its record keeps;
  the launch path and verification both use it.

Material exclusions:

- Native verification for Codex or ad hoc starts; Codex keeps its `recover`
  and plain Recheck.
- No new feature promise, host, endpoint, answer kind, retry or retention
  change. The normal launch path's own ordering of record keep and outcome note
  is unchanged.

Assumptions: an own record is a confirmation of this attempt's session, since
the shared unresolved-attempt rule refuses any other start of the story while
the attempt is unresolved; when several own records exist (a continuation that
duplicated), the latest one names the session.

## Preserved promises and constraints

- All plan 206 accepted proof stays green (its per-slice “Accepted proof”),
  especially `agent-launch-claude-verification.spec.ts` and
  `responsive-session-recovery-verification.spec.ts`, plus
  `agent-launch-uncertain-continuation.spec.ts` and the Codex recovery specs.
- Recheck never launches a session; an unreadable listing or several
  candidates keep the attempt unresolved with the reason.
- `dashboard/src/sessionCapabilities.ts`: native operation availability is
  supplied by the local boundary, never inferred from a host name.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one authoritative home per fact. The launch record is the authoritative
  evidence of a launched session; verification consults it before re-deriving.
  Feature-local design stays in `dashboard/AGENT-LAUNCH.md`. No North Star
  topic is added.

## Architecture and PFE decisions

| Existing responsibility and evidence | Decision |
| --- | --- |
| `hostOperations()` (`server/launchHosts.ts`) projects each runtime's real operations (`attach`, `stop`) into the sessions answer (`hostOperationsSchema`); pages read them via `usePageSessions`/`agentLaunches.ts` | Add the session-listing capability (`launchedSessions !== undefined`) there. `launchVerifiable` takes the operations; `useStartupRecovery` receives them through `useLaunchAttempts` from `agentLaunches.ts` (which already holds `sessions.hostOperations`); `verifyAttempt` passes the server's `hostOperations()`. No host-name check, no new endpoint. |
| `verifyLaunch` reads records only after listing, and only to exclude held sessions and recognise an own candidate | Read records first; an own record settles as launched with its session. Unreadable records keep today's unresolved answer. The listing path is unchanged otherwise. |
| `startChoice`/`keptChoice` + `policyOf(kept)` (launch), `attemptRun`'s `withStartPolicy`, `launchRun`'s record, and `verifyLaunch`'s copies | One server rule from the kept start (folder, recorded policy, record facts) used by both; record formation shared between `launchRun` and `verifyLaunch`. Host launch functions keep `established?.workspace ?? folder`. |

## Observed premises

Observed at `1414d5c8` in this checkout with local fixtures only (fake
`claude`, Codex protocol double, bare origin); no paid call. Both temporary
observation specs were deleted after running.

| Premise / consuming slice | Literal observation and result |
| --- | --- |
| Codex story Recheck currently posts `/verify` and shows its unresolved answer (slice 1 reproduces this first). | Temporary spec on `./support/codexLaunch.ts`: `openTakenBacklog`, `codexProtocol.refuseInput = true`, `launch(dashboard, {...refinementRequest, host: "codex", identity: notRefinedIdentity, title: notRefinedStory})` → `uncertain`/`unconfirmed`, publication `none`; click `Recheck …` in Startup recovery while recording `/verify` responses. Result: one `/verify` answer `{"kind":"unresolved","explanation":"This host offers no session listing to recheck the launch against, …"}` and the item then showed “Launch uncertain: This host offers no session listing…”. Reproduced. |
| An own record whose session is not listed settles `not-listed` (slice 2 reproduces this first). | Temporary spec built from `agent-launch-claude-verification.spec.ts` helpers: `claudeScenario("hang")`, `uncertainLaunch`, then wrote an own record (`storyRequest`, unlisted session id, `launchedAt` now) to `agent-launches.json`, clicked Recheck. Result: outcome `{"kind":"failed","reason":"not-listed","explanation":"Claude Code lists no session this launch started in ~/git/open-dough, so none was launched."}`, recovery item gone, the card still listed “Execution started in Claude Code / Session unavailable”. Reproduced. |
| The page can receive host capability without a new endpoint (slice 1). | Read `sessionCapabilities.ts` (`hostOperationsSchema` `{attach, stop}`, “never inferred from a host name”), `launchHosts.ts` `hostOperations()`, `agentLaunchPlugin.ts:147`, `agentLaunches.ts:117,197` (`useLaunchAttempts` called where `sessions.hostOperations` is held), `launchAttempts.ts:184` (`useStartupRecovery`). The `sessions` answer (`agentLaunchPlugin.ts:139-158`) carries `attempts` and `hostOperations` together, so no recovery item exists before the capability is known. |
| Callers of what changes are dashboard code only. | `grep -rn "verifyLaunch\|launchVerifiable\|hostOperations" dashboard/src dashboard/server dashboard/tests scripts src`: `launchOutcome.ts`, `startupRecoveries.ts`, `launchAttemptVerification.ts`, `agentLaunches.ts` (server and page), `agentLaunchResponse.ts`, `agentLaunchPlugin.ts`, `launchHosts.ts`, `sessionCapabilities.ts` and page readers of `hostOperations`; no test, script or feature asserts `hostOperations` or calls these directly. `startChoice`/`keptChoice` callers: `executionStart.ts`, `preparationStart.ts`, `startLaunch.ts`. |
| Launch and verification derive the same facts in two places (slice 3). | Read `launchRun.ts` (`withStartPolicy(requested, start.policy)`, record `{request, session, ...start.handoff.established, launchedAt}`, then `removeLaunchedStart`), `launchStart.ts` `started` (`planned.policy`, `planned.workspace`), `startLaunch.ts` `startChoice` (`keptChoice` → `startWorkspaceFolder(project, kept.workspace)`, `policyOf(kept)`), `hosts/claude/launch.ts:143`, and `launchVerification.ts:94-109,154-162`. |
| Preserved specs are green before change. | `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts dashboard/tests/agent-launch-uncertain-continuation.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts --workers=2 --reporter=line`: 8 passed. No existing spec clicks Recheck on a Codex story start. |

## Proof ownership and execution gates

| Promise / key example | Owning slice and observable boundary |
| --- | --- |
| Uncertain Codex story start: Recheck posts no `/verify`, shows no “offers no session listing” answer, and rereads evidence as before (item and Continue stay) | 1: new Codex page check (Recheck in Startup recovery) |
| A direct `/verify` for that Codex attempt is answered `unverifiable`, attempt unchanged | 1: HTTP check in the same spec |
| Claude Recheck behaviour unchanged | 1–3: `agent-launch-claude-verification.spec.ts`, `responsive-session-recovery-verification.spec.ts` |
| Own record whose session is unlisted, or whose kept start is gone → Recheck settles launched with that record's session, card actions back, no recovery item, no `claude --bg`, no second record | 2: page journey extending `agent-launch-claude-verification.spec.ts` |
| Verified record equals what launch keeps: start facts and policy of the kept start, kept start removed | 3: assertion added to `responsive-session-recovery-verification.spec.ts` |
| Launch path unchanged | 3: `agent-launch-session-kept-start.spec.ts`, `agent-launch-start-resume.spec.ts`, `agent-launch-preparation-resume.spec.ts`, `responsive-session-recovery.spec.ts` |

Focused command per slice, with the specs it owns plus the preserved ones it
touches, then type checking:

```sh
env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <specs> --workers=2 --reporter=line
npm run typecheck:dashboard
```

Before delivery, run the whole dashboard suite once
(`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=4 --reporter=line`,
about 4.5 minutes): slice 1 changes the sessions answer every page reads and
slice 3 changes the launch path most launch specs run. Execution follows the
installed execute-plan acceptance, post-change refactoring and delivery
contract; `.githooks/pre-commit` runs check-only lint. No numeric slice target
or hard limit was supplied: each slice is one outcome and proof loop including
cleanup. No paid calls; fixtures only.

## Ordered slices

### 1. Recheck asks for native verification only through a host that lists sessions
Type: Behavior
Status: done
Proof: Fail first with a new Codex page check (e.g.
`agent-launch-codex-recheck.spec.ts`, on `./support/codexLaunch.ts` with
`refuseInput`, as observed): Recheck sends no `/verify`, the item shows no
“offers no session listing” answer, keeps its Continue, and the attempt is
unchanged; a raw `/verify` for it answers unresolved `unverifiable`. Keep
`agent-launch-claude-verification.spec.ts`,
`responsive-session-recovery-verification.spec.ts`,
`agent-launch-codex-reconciliation.spec.ts`, `agent-launch-codex-recovery.spec.ts`
green; `npm run typecheck:dashboard`.

Behavior: Given an uncertain story attempt whose host's local service offers
no session listing → the developer presses Recheck → the page rereads
evidence and published state as before, with no verification request or
answer; the server refuses verification of it the same way. A host that
offers a listing (Claude Code) is verified as today. Align the
`AGENT-LAUNCH.md` sentence with the capability wording.
Safe stop: Codex Recheck behaves as before; Claude unchanged.

### 2. An attempt's own launch record settles it as launched
Type: Behavior
Status: done
Proof: Fail first, as observed, in `agent-launch-claude-verification.spec.ts`:
after an uncertain launch, keep an own record whose session the listing does
not name; Recheck settles `launched` with that record's session, the recovery
item goes, the card keeps one session and its actions, one `claude --bg`, and
the record store gains no record. Variant in
`responsive-session-recovery-verification.spec.ts` (the failed-outcome-write
case): an own record of the established start is kept and the kept start is
removed, the session listed only in its workspace; Recheck settles launched
with that session, not `not-listed`. Keep the
existing verification tests (held-by-another, decoys, unreadable, two
candidates) and `responsive-session-recovery-verification.spec.ts` green;
`npm run typecheck:dashboard`.

Behavior: Given an uncertain story attempt and a readable launch record of the
same story, workflow and project launched since its acceptance → Recheck →
the attempt settles as launched with that record's session (the latest when
several), before any listing read; otherwise verification proceeds as today.
Update the `AGENT-LAUNCH.md` rule.
Safe stop: no own-record attempt is settled “not launched”.

### 3. Launch and verification share one rule for a story launch's start and record
Type: Structure
Status: done
Proof: Add to `responsive-session-recovery-verification.spec.ts` that the
verified launch record carries the kept start's established facts and policy
and that the kept start is removed, as a confirmed launch's record does. Keep
green `agent-launch-claude-verification.spec.ts`,
`agent-launch-session-kept-start.spec.ts`, `agent-launch-start-resume.spec.ts`,
`agent-launch-preparation-resume.spec.ts`, `responsive-session-recovery.spec.ts`;
`npm run typecheck:dashboard`; then the whole dashboard suite before delivery.

Structure: Removes finding 3's duplicated derivation (retrospective correction
owned directly): one server function names, from a story's kept start, its
launch folder, recorded policy and record facts, and one forms the kept launch
record; `startChoice`/`attemptRun`/`launchRun` and `verifyLaunch` use them.
External behaviour unchanged.
Safe stop: correction complete.

## Current decisions

- Capability travels as a `hostOperations` fact, not a host name or a new
  answer kind; the shared `launchVerifiable` takes it on page and server.
- An own record wins before listing; the latest own record names the session.
- Cumulative review: two Behavior slices over one verification model (who may
  be verified, and what evidence settles first) and one correction-owned
  Structure slice; no host-specific special case and no new representation.
  Slices are independent; 3 is last so its refactor runs under 1–2's proof.

## Execution context

- Established execution: `SEED-072#recheck-verification-fidelity`, publisher
  `dashboard-territory.local-open-dough`, agent `viktor-chan`.
- Owned execution checkout: `/Users/terryyin/git/open-dough/.worktrees/recheck-verifies-only-what-its-host-can-list-and`;
  branch `codex/recheck-verifies-only-what-its-host-can-list-and`, Story Branch Mode.
- Claim published to `origin/main`: `4f36666f06d595905574543cc495bc064231a770`;
  execution branch also starts there. Starting revision: `9197ed9284608a44092d70c884934a8358f56893`.
- Setup: `npm ci` and `npm run typecheck:dashboard` succeeded in this checkout.
- Existing planning authority retained; no numeric slice budget supplied.
- Claim CI coverage: unobserved; ordinary delivery observes the execution branch.

## Slice 1 accepted proof

- Fail first: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-recheck.spec.ts --workers=2 --reporter=line`
  failed both intended assertions: page sent `/verify`; raw verify gave unsupported-listing answer.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-recheck.spec.ts dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-codex-recovery.spec.ts --workers=2 --reporter=line`: 10 passed.
- `npm run typecheck:dashboard`: passed.
- Inspected new Codex spec: uncertain raw launch is the precondition; page Recheck observes evidence/published rereads, no verification, enabled Continue, unchanged attempt and one native launch. Raw HTTP verification observes existing unverifiable answer and unchanged attempt. Existing Claude/Codex verification and recovery journeys preserved.
- Shared consumers: both predicate callers, sole recovery-hook callers, sessions response/schema, existing attach/stop readers; no test-support object callers.
- Independent post-change refactor: none — already clean; `## REFACTOR COMPLETE`. No proof invalidated.
- Formatter initially found parameter mutation in the new fixture; local alias now follows existing Codex test convention. `npm run format` retry passed; semantics and assertions unchanged.
- Whole dashboard command: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=4 --reporter=line`: 765 passed (5.2m).
- Slice 1 accepted publication: `d04999c9a5ceffa00baea867fef7d5f84f46db86` on `origin/codex/recheck-verifies-only-what-its-host-can-list-and`.
- Managed delivery reported CI unobserved: Codex yielded-cell bridge unavailable. No observer or shutdown handle was created. Managed delivery's detached start supplies no supported attachment of the Codex yielded stream; a separate stream start is excluded by ordinary managed-delivery guidance. Publication acceptance stands.

## Slice 2 accepted proof

- Fail first: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts --grep 'trusts' --workers=2 --reporter=line`: three intended failures (unreadable listing kept own-record attempts unresolved; removed kept start produced `not-listed`).
- Implementation proof: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts --workers=2 --reporter=line`: 7 passed (23.8s).
- Independent refactor split the expanded Claude spec at cohesive listing/own-record proof boundaries, sharing only uncertain-launch setup in `claudeVerification.ts`; each spec keeps an isolated origin. No production edits.
- Replacement proof: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/agent-launch-claude-own-record-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts --workers=2 --reporter=line`: same 7 cases passed (25.9s). `npm run typecheck:dashboard`: passed.
- Inspected setup/assertions: actual uncertain page launch then persisted own record(s), or persisted own established record with its kept start removed. Recheck observes launched outcome/latest session, recovery removed, actions restored, unchanged record bytes, no verification `agents` call at project cwd and one native launch. The failed-outcome-write state is supplied, rather than injecting that write failure.
- Existing one-candidate, decoy/held, unreadable listing, ambiguous candidates and established-workspace journeys preserved. Sole verifier caller and record-store/listing consumers inspected.
- Independent refactor returned `## REFACTOR COMPLETE`; selected proof accounts for both moved own-record cases.
- Formatter caught an unused fixture callback parameter; record indexes now explicitly select the same one/two inputs. `npm run format` retry passed; observed setup unchanged.
- Slice 2 accepted publication: `af244145189c3ba0e47f864d0c8432f00b7a4658` on the established execution branch. Managed CI remains unobserved with the same bridge limitation; no observer created.

## CI repair — 36963675618, attempt 1

- Observer startup discovered owned `c6c5a4a0` failure in `dashboard (3/9)`, `agent-launch-duplicate.spec.ts:240`: first concurrent held Claude launch uncertain rather than launched. Managed resume confirmed remote acceptance with zero pushes and recovered observer `/tmp/dough-ci-501/watch-V5539N`.
- Cause: fixture `fake-claude` atomically replaces its listing but concurrent read/change/write operations overwrite sessions. Deterministic disposable subprocess proof `node /tmp/recheck-212-fake-race.mjs` (preload `/tmp/recheck-212-fake-race.cjs`) forced both readers before replacement: two reported launches, one listed session (red); serialized fixture mutations preserved both sessions (green).
- Repair touches only synthetic fixture launch/stop/rename listing mutations. Existing simultaneous-launch test observes both actual launched answers and two kept records; done/terminal tests observe typed rename, native stop and listed state.
- Independent refactor consolidated atomic replacement under the mutation lock, preserving a self-contained 249-line fixture; `## REFACTOR COMPLETE`. Replacement race command passed.
- `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-duplicate.spec.ts dashboard/tests/agent-launch-done.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-terminal-done.spec.ts`: passed. Initial focused invocation's color-variable warning was removed with the explicit environment wrapper; this was independent of the proven listing race.
- `npm run format`: passed. Product implementation and its accepted assertions unchanged; no repeated full-suite run required for this fixture repair. Completion records saved under the installed CI stash protocol before repair; restored only after publication.

## Slice 3 accepted proof

- Shared `launchStartContext` owns workspace, policy and established facts; `launchRecord` owns record formation across normal confirmation, verification and durable native input recording. Normal keep/remove ordering and original timestamps/input evidence preserved.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-claude-verification.spec.ts dashboard/tests/agent-launch-claude-own-record-verification.spec.ts dashboard/tests/responsive-session-recovery-verification.spec.ts dashboard/tests/agent-launch-session-kept-start.spec.ts dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts dashboard/tests/responsive-session-recovery.spec.ts --workers=2 --reporter=line`: 19 passed (48.2s).
- Proof review found default normalized policy could pass on omitted policy. Added an actual one-shot dialog/start variant, without mutating fixture policy. `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/responsive-session-recovery-verification.spec.ts --workers=2 --reporter=line`: 3 passed (14.4s). `npm run typecheck:dashboard`: passed.
- Inspected parameterized Recheck journey: installed start and native uncertain launch provide precondition; persisted kept facts observed before Recheck, same-name project-folder decoy supplied. Actual written record equals kept facts/policy, including nondefault policy; one record/native launch, corresponding kept start removed, workspace session/cards restored.
- Consumers traced: execution/preparation choices, established start handoff, run confirmation, verification, native recording creation/update and host adapters. Whole suite still required for Codex durable recording consumer.
- Independent refactor: none — already clean; `## REFACTOR COMPLETE`. All accepted implementation/setup/assertion boundaries unchanged.
- `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=4 --reporter=line`: 769 passed (4.8m), including native Codex durable recording consumers. `npm run format`: passed.
