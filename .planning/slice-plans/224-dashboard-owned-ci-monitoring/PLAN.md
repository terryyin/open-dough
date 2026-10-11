# Dashboard-owned CI monitoring for Claude Code execution sessions

**Identity:** SEED-063#dashboard-owned-ci-monitoring
**Source:** [refined story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring).
**Prepared:** 2026-10-03; replanned 2026-10-11 after plan 220 landed, in the
established preparation workspace. Planning only.

## Goal and boundaries

A Claude Code execution session started from the dashboard no longer waits on
CI. The dashboard observes every revision the session registers, shows each
one's CI state on the session card, completes the session quietly once the
last accepted revision succeeds, retires its execution resources then, and
wakes the session with one follow-up per actionable failure. In that mode the
skill starts no observer, runs no completion wait, and never claims CI
success.

Scope, decisions, and key examples are those of the source story. Material
exclusions:

- Codex and Cursor delivery.
- Refinement and ad hoc sessions.
- Deployment.
- General dashboard-to-agent messaging.
- Any change to standalone observation, the hook bridge, `complete-revision`,
  or Trunk Mode `finish`, which the dashboard never starts.
- Any fallback from lost dashboard coverage to the skill's own observer.

## Direction and PFE

Follow the [North Star](../../NORTH-STAR.md) topic “Dashboard-owned CI
observation and session delivery”, revised with this replanning. Accepted ADRs
apply as follows:

- [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): one
  meaning and owner per fact (CI coverage, session Done, story completion,
  resource retirement).
- [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  small, verifiable increments.
- [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
  [0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  self-contained installed dependencies.
- [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): native
  acceptance kept separate from deterministic proof.
- [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one shared skill source written for the executing agent.

PFE findings and choices:

- **The option is a session-policy choice.** `session-policy.mjs` owns policy
  spelling: three choices, each a flag the dashboard and every host spell the
  same way (`launchArguments` in `dashboard/src/launchRequest.ts`). External
  observation becomes the fourth choice, `observation: own | external`, flag
  `--external-ci`, selected by the dashboard from the host's `deliver` fact,
  never offered in the dialog. The recorded policy then says how a session
  was observed.
- **Registration reuses the reporting channel.** Explicit completion
  (`dashboard/AGENT-LAUNCH-COMPLETION.md`) delivered the loopback
  request/receipt boundary, the launch reference, the installed CLI copied to
  `~/.open-dough/dashboard/reporting/<attempt>/` with `ci-direct-entry.mjs`,
  and the launch's context file (`landing-context.json`: origin, source,
  host, reference, identity, remote, target). A CI registration is a second
  request on that boundary, sent by a sibling installed script from the same
  copied directory and the same context file. No second channel, registry,
  daemon, or MCP tool.
- **The dashboard is the coordinator.** The Codex adapter already lets an
  external coordinator own the observer: `ci-mailbox.mjs stream --execution
  OWNER/REPO BRANCH --coordinator VALUE` records the owner at creation, and
  managed delivery registers on that owner's directory
  (`--coordinator`/`--observer-directory`, verified by
  `execution-increment-observation.mjs`). The dashboard arms one observer per
  launch and target with `--coordinator <launch reference>` under its own
  mailbox root (`DOUGH_CI_MAILBOX_ROOT` under the machine dashboard
  directory), reads the mailbox's durable records, and acknowledges delivered
  sequences, as the Codex binding does. Standalone hooks never see that root,
  so they never claim those mailboxes. The dashboard never uses the stream's
  stdout as its store, so a server restart re-reads the mailbox.
- **Skill external mode.** It is one branch where `deliverManagedExecutionIncrement`
  today calls `establishObservation` and then `registerPushedRevision`, plus
  the same branch in `execution-increment-resume.mjs` and the integrated-SHA
  registration of Story Branch wrap-up. The branch registers with the launch
  and reports `observation.state: "external"` with the receipt, or the
  existing gap vocabulary when unacknowledged. Shared guidance in
  `ci-monitor.md`, `trunk-publication.md`, `ci-completion-wait.md`, and
  `wrap-up-closure-publication.md` gains the external branch once.
- **Session delivery** becomes a new optional `deliver` operation on
  `LaunchHost` (`dashboard/server/launchHosts.ts`) beside `attach` and `stop`,
  projected as a `deliver` fact in `hostOperationsSchema`
  (`dashboard/src/sessionCapabilities.ts`). Claude's operation continues an
  exited session with `claude --bg --resume <sessionId> <message>`
  (`hosts/claude/runtime.ts`) and types into a loaded idle session through the
  attachment path the done rename already uses (`hosts/claude/rename.ts`:
  `waitForIdle`, `withAttachment`, `claudePromptReady`). Cursor's Recover
  continuation is the other existing typed delivery; both inform the shape.
- **Completion and Done.** `deliverCompletion` (`dashboard/server/completionDelivery.ts`)
  decides a quiet report's Done (`doneSessionRecord`, `doneMarks.reported`).
  It gains one condition: registered revisions without a success verdict for
  the last accepted one defer Done. The later verdict applies the same Done
  operation.
- **Retirement** reuses `dough-land/scripts/worktree-retirement.mjs retire`
  with `--remote-branch` and `--contained`, run from the project folder's
  installed skills (`installedSkillPath`), which outlive the worktree. The
  established start supplies workspace, branch, remote, target, and identity.
- **Test support** already simulates CI: `dashboard/tests/support/completionCi.ts`
  gives a synthetic `gh` provider with a controllable release and its own
  `DOUGH_CI_MAILBOX_ROOT`; `installedCompletionClosure.ts` runs the real
  installed closure and retirement against a local origin; `fake-claude`
  emulates `--bg` launch and listing (no `--resume` yet).

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The reporting channel, launch reference, context file, and copied installed CLI exist on trunk and reach Done for a quiet Claude report | `git ls-tree origin/main` lists `dashboard/AGENT-LAUNCH-COMPLETION.md`, `dashboard/server/completionReporting.ts`, `completionDelivery.ts`, `src/skills/dough-execute-plan/scripts/dashboard-completion.mjs`. In this workspace at `86cf795d`: `npm run test:dashboard -- agent-completion-quiet-claude.spec.ts` → exit 0 (real reporting CLI → boundary → store → fake Claude rename). `~/.open-dough/dashboard/reporting/<attempt>/` of this very launch holds `dashboard-completion.mjs`, `dashboard-landing.mjs`, `ci-direct-entry.mjs`, `landing-context.json`. **Settled.** |
| An external coordinator's stream is a working observer owner for managed delivery | `npm test -- src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex.test.mjs` → exit 0. `ci-mailbox.mjs` `takeCoordinator` applies to `stream` only; `start` records no coordinator (slice 2 adds it). **Settled for stream; `start` gap recorded.** |
| Project-command CI verdicts can be controlled in fixtures without `gh` | `npm test -- src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs` → exit 0; `completionCi.ts` also fakes `gh run list/view` with a release file. **Settled.** |
| Managed delivery is the single place the skill establishes observation and registers ordinary increments and repairs | `execution-increment-delivery.mjs`: `establishObservation` before publication, `registerPushedRevision(observation.directory, sha)` after. Resume and Story Branch integration are the other registration paths named in `wrap-up-closure-publication.md`. Read, consistent with the codex test above. |
| Dashboard execution starts are Story Branch Mode or one-shot | `dashboard/server/executionStart.ts` builds `mode: "story-branch"` only; `claimedStartSchema.mode` is the literal `story-branch`. Trunk Mode `finish` is therefore outside this plan. |
| A standalone session's hook could claim a dashboard mailbox in the shared root | `establishObservation` calls `findLiveMatchingMailbox` before starting; `ci-host-hook.mjs` claims with `owner` written `wx`. Hence the separate root decision. |
| Claude exited sessions can be continued under the same ID; running ones must not be resumed | `claude --version` → `2.1.296`; `claude --help`: `--bg` with `--resume <session-id>` “continues that session in the background under the same ID, or starts a copy and says so when the session is already running”. Presence only; **slice 1 observes it.** |
| Typing into a loaded Claude session is processed once | `hosts/claude/rename.ts` types only after `waitForIdle`; whether input typed during a turn is queued, lost, or duplicated is **not observed**: slice 1. |
| Host operations today | `hostOperations()` projects `attach`, `stop`, `launchedSessions`; Claude's boundary has `attach` and `stop`. Read. |
| `fake-claude` has no `--resume` continuation | Fixture header lists launch, listing, stop, rm, attach. Slice 6 extends it. |
| Next free plan number | This plan keeps 224; `origin/main` plans end at 297. |

## Ordered slices

### 1. Observe native Claude delivery once
Type: Behavior
Status: planned
Proof: One isolated, bounded native Claude Code observation against a private
fixture project, inspecting the native transcript and `claude agents --json
--all` rather than a self-report. (a) A session listed `done` receives a
`--bg --resume <id> <message>` and acts on it once under the same session ID,
and the listing shows that ID again, with the short id and name the dashboard
recorded still identifying it. (b) A loaded idle session receives the same
text as terminal input once. (c) Text typed while a turn runs: record whether
it is queued and processed after the current tool call, lost, or duplicated.

Behavior: A maintainer sends a delivery message to an idle, an exited, and a
running Claude background session. Each session receives it exactly once, as
a new user input, under its original session ID.

If (a) shows a copy or a new ID, slice 6 continues an exited session through
the host's recorded means instead and the card says so; revise slice 6
before building it. If (c) shows loss or duplication, slice 6 delivers only
to an idle session and waits for idle, as the rename does. Paid native runs
are manual: they need the execution instruction's explicit authority and are
tracked in linked native-acceptance work under ADR 0005. This slice delivers
evidence, not shipping behavior; it does not block slices 2–5.

### 2. The skill registers externally observed publications instead of observing
Type: Behavior
Status: planned
Proof: Focused node tests beside `execution-increment-managed-delivery*.test.mjs`
with a local HTTP receiver standing in for the dashboard:

- With `--external-ci` and a launch context file, `deliver` and `resume`
  call neither `establishObservation` nor `register-push`; they publish, then
  send one registration (source, host, reference, repo, target, full SHA) and
  report `observation.state: "external"` with the receipt.
- With the receiver unavailable, the receipt reports one coverage gap in the
  existing gap vocabulary, publication acceptance stands, and no observer
  starts.
- `--external-ci` without a context file, or a receiver refusal (unknown
  reference, malformed SHA or target), is the same gap, named.
- Without the option, the existing managed-delivery suites pass unchanged.
- `session-policy.mjs` tests: the fourth choice round-trips through
  `sessionPolicy`, `sessionPolicyFlags`, and `launchArguments`; the dialog's
  policy line and one-shot-only rule are unchanged.
- `ci-mailbox.mjs start --execution ... --coordinator VALUE` records the
  owner as `stream` does (small Structure within this slice).

Behavior: Example 1's skill half and example 5's first half. A dashboard
session's `deliver` registers the accepted SHA with the launch through the
installed registration client and starts no observer, probe, or hook
binding. Guidance in `trunk-publication.md` and `ci-monitor.md` gains the
external branch once: “externally observed CI” and a registration receipt,
no dashboard vocabulary.

Deliver the registration client as a sibling of `dashboard-completion.mjs`
that shares its request code, so `completionReporting.ts` copies it beside
the completion script. Declare it in the installed payload.

### 3. The dashboard observes registered revisions and shows CI per revision
Type: Behavior
Status: planned
Proof: A new focused Playwright journey through the real preview-server
boundary. It launches a Claude execution with `fake-claude` (the first input
carries `--external-ci`), then runs the real installed `deliver` from slice 2
against a local Git fixture and remote with `completionCi`'s provider. The
card shows the revision pending, then success after the release; a second
registration whose provider answers failure shows failure. Assertions:

- The registration receipt arrives only after the launch record holds it,
  and a page reload still shows it.
- No mailbox exists under the default root for that repository/branch; one
  exists under the dashboard root with the launch reference as owner.
- Repeated registration of the same SHA is idempotent.
- Launch-argument unit tests: `--external-ci` only for Claude execution
  starts with the `deliver` fact; Codex, Cursor, refinement, ad hoc, and the
  dialog's own policy line are unchanged. Claude's `deliver` is an interim
  stub that slice 6 replaces.
- Classification follows the observer's records: a `not_required` revision
  shows its basis's state; incomplete is not success.

Behavior: Examples 1 and 7's dashboard halves. The dashboard acknowledges a
registration after storing it, arms or reuses its own observer for that
launch and target, registers the SHA on it, reads the mailbox's records, and
shows pending, success, or failure on the session card.

Deliver the `deliver` host fact and its projection, the registration
endpoint and refusals, the dashboard observation module (observer per launch
and target, mailbox reading and acknowledgment), the per-revision CI model
with one card rendering for all states, and `dashboard/AGENT-LAUNCH-CI.md`
linked from `AGENT-LAUNCH.md`.

### 4. Completion ends the turn and finishes quietly on the last success
Type: Behavior
Status: planned
Proof: Two kinds.

- Skill behavior review under AGENTS.md of the changed guidance: completion
  under `--external-ci` publishes the execution-complete record, reports “CI
  pending under external observation”, and ends without `complete-revision`;
  the existing `ci-completion-lifecycle-guidance.test.mjs` and
  `execution-completion-record-guidance.test.mjs` stay green, updated only
  where they assert wording that now has an external branch.
- Playwright: the slice 3 journey continues with the real installed
  `dashboard-completion.mjs --outcome completed` while a registered revision
  is pending. The card shows “Waiting for CI” and the session stays open with
  no rename. After the release, the session becomes Done through the existing
  quiet disposition (`fake-claude` records exactly one rename). Variants: a
  completion with an attention message stays open after success; a failure
  verdict keeps the session open and shows failure; a completion report with
  no registrations behaves as today (existing quiet specs unchanged).

Behavior: Example 2. The agent ends its turn with CI pending; success of the
last accepted registered revision completes the session quietly, and the
agent receives no message.

Change `ci-monitor.md` (“Await the applicable revision at completion”) and
`ci-completion-wait.md` with one external branch for the execution/review
handoff and wrap-up boundaries. Automatic retrospective still starts while
CI is pending. `deliverCompletion` and the verdict handler share one Done
decision.

### 5. Retire the launch's execution resources after the integration succeeds
Type: Behavior
Status: planned
Proof: Playwright with `installedCompletionClosure`'s Story Branch Wrap Up
path under `--external-ci`: the real installed integration publishes onto the
fixture trunk with the landing context, registers the integrated SHA, and
ends without completion or retirement; the worktree, branch, and remote
execution branch exist and the card says “Waiting for CI”. After the release,
the session is Done and all three are gone, the card shows the retirement
result, and `fake-claude` shows no extra call. Variants: a dirty worktree is
kept with the hold named on the card; Mark as done before the verdict leaves
the resources in place after success; a failure leaves them in place and
shows failure.

Behavior: Example 8 and the retirement half of example 6. Quiet Done through
the last registered revision's success retires the execution worktree,
branch, and remote execution branch with wrap-up's checks unchanged.

Change `wrap-up-closure-publication.md` (“Observe Story Branch integration”)
and `dough-story-wrap-up`'s resource section with the external branch:
register the integrated SHA, report pending, keep resources. The dashboard
runs `worktree-retirement.mjs retire` from the project folder's installed
skills with the established start's facts and `--contained <integrated SHA>`.
One-shot sessions keep today's retirement, without a CI gate.

### 6. Wake the session with one follow-up per CI failure
Type: Behavior
Status: planned
Proof: Playwright journeys with `fake-claude` extended to record
`--bg --resume` continuations and typed attachment input:

- A failure for an exited session produces exactly one continuation under
  the same session ID carrying revision, target, run/attempt, failed jobs,
  and the handling line.
- A failure for a loaded idle session produces exactly one typed input; a
  loaded busy session gets it once idle (or as slice 1 decided).
- A repeated failure event or a dashboard restart sends nothing new; the card
  shows “failure delivered”.
- A registered repair SHA is observed and its success completes the session
  as in slice 4.
- Two sessions registering the same SHA each keep their own evidence.

The skill behavior review covers the delivered-result guidance: accepted
only for a SHA this session registered; results for another session, an
older superseded publication, or an unregistered SHA are neither completion
evidence nor its repair (example 4); an owned failure enters “Handle a
notification” unchanged and the repair is registered as in slice 2.

Behavior: Example 3. CI fails for a registered revision while the session is
idle or busy. The dashboard sends one follow-up, the session acts on it at
its next input boundary, repairs, publishes, registers the repair, and that
revision's success completes the session. The same failure is never resent.

Implement Claude's `deliver` (replacing slice 3's stub), the per-failure
delivery record keyed by repository, run, attempt, and job when present, and
the message text. CI text is quoted as data, never as an instruction. Update
the terminal/host documentation for the new operation.

### 7. Keep observation through restarts and make every gap visible
Type: Behavior
Status: planned
Proof: Playwright fault journeys plus focused store tests, inspecting stored
records, mailboxes, and `fake-claude` calls:

- Server restart while a revision is pending: observation resumes from the
  stored registration and mailbox; the verdict then arrives and is acted on.
- A worker lost or a mailbox unreadable after restart: “CI not observed”, the
  session stays open, no success, no retirement.
- Mark as done, then a failure: “not delivered”, no native call.
- A delivery the host refuses: “not delivered”, retained, no retry storm.
- Deleting the session record stops its observers through `ci-mailbox.mjs
  stop` and confirms the exact mailboxes ended.
- A revision with a recorded verdict that needs no delivery ends its
  observation; a launch's observer stops when none of its revisions is
  pending.

Behavior: Examples 5 (second half) and 6. Restarts, lost observation, a done
or stopped session, and refused delivery each leave an explicit card state
and never become success. Observation ends when its verdict is recorded and
delivered as required, or when the session record is deleted.

Name the lifecycle owner, the dashboard server's observation module started
with the server, and prove it observes worker loss and cleans up on server
shutdown under the observer's terminal-result contract. No background retry
scheduler or generic message queue; the observer's lifetime budget bounds
orphaned workers.

## Proof ownership and acceptance

| Source promise | Owner and decisive signal |
| --- | --- |
| Option only for hosts with a delivery operation; other hosts, workflows, and direct invocation unchanged (example 7) | 2 policy tests, 3 launch-argument tests, unchanged managed-delivery and completion guidance suites |
| Skill registers every accepted publication, starts no observer, acknowledgment after storage (examples 1, 5) | 2 node tests with the stand-in receiver; 3 real CLI → boundary → store journey |
| Dashboard observes with the existing engine, isolated from standalone mailboxes | 3 mailbox-root and owner assertions, controlled provider verdicts |
| Card CI states: pending, success, failure delivered, not observed, not delivered | 3 (pending/success/failure), 6 (failure delivered), 7 (not observed, not delivered) |
| Completion ends the turn, “Waiting for CI”, quiet Done on last success, attention stays open (example 2) | 4 journey plus skill behavior review |
| Retirement after success, holds kept and named, Mark as done keeps resources (examples 6, 8) | 5 |
| One follow-up per actionable failure, wakes idle or busy session, repair registered and completes (example 3) | 6 journeys; 1 plus native acceptance for real delivery |
| Foreign, superseded, or unregistered results never satisfy completion (example 4) | 6 skill review plus attribution test |
| Restart, lost observation, refused or undeliverable delivery never become success; no fallback observer (examples 5, 6) | 2 (unreachable at registration), 7 fault journeys |
| Lifecycle: observation ends on verdict or record deletion; Done/stop ends delivery only | 7 |
| Self-contained installed dependencies, payload declarations | 2 and 3 `tests/payload-declaration-links.sh` plus the existing install/update journey for the new script |

Local focused verification: `npm run test:dashboard -- <affected specs>`,
`npm run typecheck:dashboard`, and `npm test -- <affected node checks>`
(managed delivery, session policy, completion guidance, mailbox). Broaden
only for a newly affected consumer or an unresolved failure. Usual execution
publication, slice-local refactoring, review, and CI gates apply when
execution is authorized; planning invokes none.

Native acceptance (ADR 0005, manual and paid): slice 1's observation, plus
one end-to-end Claude Code journey after slice 6 in which a real execution
session registers, ends its turn at completion, is woken by a real failure,
repairs, completes quietly, and has its resources retired. Static guidance,
synthetic executables, and exit codes do not establish native acceptance.

## Current decisions

- The option is the fourth session-policy choice, spelled `--external-ci`,
  set by the dashboard from the `deliver` host fact and never shown in the
  dialog. Agent-facing wording is “externally observed CI”.
- The dashboard is the observer coordinator, one observer per launch and
  target under its own mailbox root; registration goes through the reporting
  channel with the launch's existing context file.
- The dashboard retires Story Branch execution resources on quiet Done after
  the last registered revision succeeds; Mark as done, failure, and holds
  keep them.
- No fallback to the skill's own observer when dashboard coverage is lost.

## Learnings

- 2026-10-11: plan 220 is delivered, so the former blocking dependency is
  gone. Dashboard execution starts are Story Branch Mode or one-shot, so Trunk
  Mode `finish` needs no external branch. The Codex coordinator stream is the
  precedent for an externally owned observer; registration reuses its owner
  model rather than a new one.
