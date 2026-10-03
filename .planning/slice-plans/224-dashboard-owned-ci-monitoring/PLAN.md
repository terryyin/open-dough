# Dashboard-owned CI monitoring for Claude Code execution sessions

**Identity:** SEED-063#dashboard-owned-ci-monitoring
**Source:** [refined story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#dashboard-owned-ci-monitoring).
**Prepared:** 2026-10-03. Planning only, in the established preparation workspace.

## Goal and boundaries

A Claude Code execution session started from the dashboard no longer waits on
CI. The dashboard observes every revision the session registers, shows each
one's CI state on the session card, completes the session quietly once the
last accepted revision succeeds, and wakes the session with one follow-up per
actionable failure. In that mode the skill starts no observer, runs no
completion wait, and never claims CI success.

Scope, decisions, and key examples are those of the source story. Material
exclusions:

- Codex and Cursor delivery.
- Refinement and ad hoc sessions.
- Deployment.
- General dashboard-to-agent messaging.
- Any change to standalone observation, the hook bridge, or
  `complete-revision`.
- Any fallback from lost dashboard coverage to the skill's own observer.

## Direction and PFE

Follow the [North Star](../../NORTH-STAR.md) topics “Explicit skill completion
and retained attention messages” and “Dashboard-owned CI observation and
session delivery” (added with this plan). Accepted ADRs apply as follows:

- [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): one
  meaning and owner per fact (CI coverage, session Done, story completion).
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

- **Registration and receipts.** Reuse plan 220's launch context,
  launch-scoped session reference, loopback request/receipt boundary, and
  installed reporting CLI. A CI registration is another report kind on that
  same boundary and is stored in the same machine-local launch record
  (`launchRecordStore.ts`, `machineJsonStore.ts`). Add no second channel,
  registry, daemon, or MCP tool.
- **Observation engine.** Reuse `ci-mailbox.mjs` (`start --execution`,
  `register-push`, mailbox events, `stop`) from the session workspace's
  installed runtime, which already embodies discovery, `not_required` basis,
  incomplete, and deduplication rules. The dashboard reads mailbox events
  directly; it does not reimplement GitHub or project-command discovery and
  does not use the host hooks.
- **Mailbox isolation.** The dashboard runs its observers under its own
  `DOUGH_CI_MAILBOX_ROOT` (under `~/.open-dough/dashboard/`). The default
  `/tmp/dough-ci-$UID` root is shared with standalone sessions, and
  `findLiveMatchingMailbox` reuses any live mailbox for the same
  repository/branch. A standalone session's hook would then claim the
  dashboard's mailbox through its unowned `owner` file.
- **Skill external mode.** It is one branch in managed delivery
  (`execution-increment-delivery.mjs`, which today calls
  `establishObservation` and then `registerPushedRevision`). It also covers
  the explicit registration paths and the completion operation in
  `ci-monitor.md`. All of these are written once in shared guidance; there is
  no per-host copy.
- **Session delivery.** It becomes a new optional `deliver` operation on
  `LaunchHost` (`launchHosts.ts`) beside `attach` and `stop`, projected as a
  `deliver` fact in `hostOperationsSchema` (`sessionCapabilities.ts`). That
  fact alone decides whether `--external-ci` is added to the launch
  arguments (`launchRequest.ts`).
- **Claude delivery.** A session whose process has exited is continued with
  `claude --bg --resume <sessionId> <message>`. A loaded session receives the
  message as terminal input through the existing attachment path
  (`terminalAttachments.ts`), because resuming a running session starts a
  copy.
- **Card presentation.** It reuses the session card and the attention-message
  surface from plan 220. The four card states share one per-revision CI
  model; there are no per-state components.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Plan 220 supplies the launch context, session reference, report boundary, and installed reporting CLI that slices 2–5 extend | `git fetch origin main`; `git show origin/main:.planning/slice-plans/220-quiet-dashboard-session-completion/PLAN.md`: every slice `Status: planned`. **Not yet delivered.** Slice 1 rechecks this before any dependent work. |
| Managed delivery is the single place the skill establishes observation and registers ordinary increments and repairs | `grep -rln establishObservation src/skills/dough-execute-plan/scripts` → only `execution-increment-delivery.mjs` and `execution-increment-observation.mjs`. Reading `deliverExecutionIncrement` shows `establishObservation` before publication and `registerPushedRevision(observation.directory, sha)` after it. Claim and wrap-up closure paths are explicit guidance in `ci-monitor.md` ("Own one observer") and `wrap-up-closure-publication.md`. |
| The observer engine can be started and fed revisions without any host bridge | `ci-mailbox.mjs` CLI: `start --execution OWNER/REPO BRANCH [BUDGET_MS]` spawns a detached worker and prints a `CI_OBSERVER` receipt, and `register-push DIRECTORY SHA` registers. The probe and hook binding are performed only by `establishObservation`, not by `start`. |
| A dashboard mailbox in the shared default root could be taken over by a standalone session | `establishObservation` calls `findLiveMatchingMailbox({repo, branch, root, storage})` before starting. `ci-host-hook.mjs` claims a mailbox from a Bash receipt with `writeFileSync(join(directory,"owner"), owner, {flag:"wx"})`. Hence the separate mailbox root decision. |
| CI can be simulated deterministically in fixtures | `runtime-setup.md`: a nonempty `ciAdapter` in `.planning/open-dough.json` selects a project command. Existing `ci-command-adapter*.test.mjs` fixtures exercise it without `gh`. |
| Claude finished sessions have no process; running ones report busy/idle | Read-only `claude agents --json --all` (2.1.288) gave 675 entries with these state/status counts: `done/None` 648, `stopped/None` 23, `working/busy` 2, `working/idle` 1, `blocked/idle` 1. `claude --help`: `--bg` with `--resume <session-id>` "continues that session in the background under the same ID, or starts a copy and says so when the session is already running." |
| Claude delivery to a live session can reuse terminal input | `AGENT-LAUNCH-TERMINALS.md`: input from any joined socket reaches the same attachment client, with bounded input and rendered readiness. Whether typed input mid-turn is queued and processed exactly once is **not observed**: it needs a paid native run (slice 1). |
| Launch flags are assembled in one place | `dashboard/src/launchRequest.ts` `launchArguments` = identity, `sessionPolicyFlags`, selected options. It is used by `StartLaunch.tsx` and the host input builders (for example `hosts/cursor/prompt.ts`). |
| Dashboard journeys can run a synthetic Claude Code | `dashboard/tests/fixtures/fake-claude` emulates `--bg` launch and the `agents` listing. It has no `--resume` continuation yet; slice 4 extends it. |
| Next free plan number | `git ls-tree origin/main .planning/slice-plans/` ends at `223-quiet-refinement-outcomes`; local ends at 222. Allocated 224. |

## Ordered slices

### 1. Confirm the reporting boundary and native Claude delivery
Type: Behavior
Status: planned
Proof: (a) Read origin/main and confirm that plan 220 slices 1–2 are done:
the launch context, report request/receipt, and installed reporting CLI exist
on trunk, and slice 1 recorded Claude feasibility. (b) Make one isolated,
bounded native Claude Code observation against a private fixture project and
inspect the native transcript and listing rather than a self-report. A
session listed `done` receives a `--bg --resume` message under the same
session ID and acts on it once. A loaded session (`working/busy`) receives
the same text as terminal input once, and it is processed after the current
tool call, not lost or duplicated.

Behavior: A maintainer sends a delivery message to an idle and to a running
Claude background session. Each session receives it exactly once, as a new
user input, under its original session ID.

If (a) fails, stop slices 2–5. Do not build a second report channel; report
the dependency instead. If (b) shows a copy, a lost message, or a duplicated
message, stop slices 4–5 and revise delivery before dependent implementation.
Paid native runs are manual: they need the execution instruction's explicit
authority and are tracked in linked native-acceptance work under ADR 0005.
This slice delivers evidence, not shipping behavior.

### 2. Register a dashboard session's publications and show their CI on its card
Type: Behavior
Status: planned
Proof: A new focused Playwright journey goes through the real preview-server
boundary. It launches a Claude execution with the synthetic `fake-claude`
(its first input carries `--external-ci`). It then runs the candidate
installed `execution-increment-delivery.mjs` against a real local Git fixture
and remote, with a `ciAdapter` project command whose verdict the test
controls. The card shows that revision as pending and then success, and in a
second run as failure. Assertions:

- No mailbox exists under the default root for that repository/branch.
- A dashboard mailbox exists under the dashboard root.
- The registration survives page reload.

Focused node tests on managed delivery cover the remaining cases:

- With the option, delivery calls neither `establishObservation` nor
  `register-push`; it calls the reporting CLI.
- With the receiver unavailable, one coverage gap is reported and no
  observer starts.
- Without the option, the existing `execution-increment-managed-delivery*`
  tests still pass unchanged.

The launch-argument unit tests add `--external-ci` only for Claude execution
starts with the `deliver` fact. Codex, Cursor, refinement, and ad hoc starts
are unchanged.

Behavior: A Claude execution session started from the dashboard publishes an
increment (example 1). The skill registers the target, full SHA, and session
through the installed reporting CLI and starts no observer. The dashboard
acknowledges only after storing the registration, observes the revision with
the workspace's installed observer engine under its own mailbox root, and
shows pending, then success or failure, on that session's card. Example 7's
launch side holds: other hosts and workflows get no option. Example 5's first
half holds: an unreachable dashboard is reported once and no observer starts.

Deliver these together:

- the `deliver` host-operation fact (Claude's operation may be a stub that is
  replaced in slice 4, named here as interim);
- the launch flag;
- the registration report kind, with its refusals (wrong session, unknown
  reference, malformed SHA or target);
- dashboard-side observer start, reuse per repository/branch, `register-push`,
  and event reading;
- the per-revision CI model and its card rendering;
- the managed-delivery branch;
- the external-mode wording in `ci-monitor.md` and `trunk-publication.md`
  for registration and the explicit claim and closure registration paths.

Repeated registration of the same SHA is idempotent. Classification follows
the observer's own records (`not_required` follows its basis; incomplete is
not success). Update `dashboard/AGENT-LAUNCH.md` (or its linked
history/terminal page) and the installed payload declarations for any new
script dependency in this slice.

### 3. End the turn at completion and finish the session quietly on success
Type: Behavior
Status: planned
Proof: Two kinds of proof.

- A skill behavior review under AGENTS.md of the changed guidance: completion
  under `--external-ci` publishes the execution-complete record, reports "CI
  pending under dashboard observation", and ends without `complete-revision`.
  Without the option, the existing `ci-completion-lifecycle-guidance.test.mjs`
  and `execution-completion-record-guidance.test.mjs` assertions stay green,
  updated only where they assert wording that now has an external branch.
- A Playwright journey with the synthetic session: it sends plan 220's
  completion report while CI is pending, and the card shows "Waiting for CI"
  with the session open. When the controlled verdict becomes success for the
  last accepted revision, the session becomes Done through the existing quiet
  disposition. The journey also covers a completion that carries an attention
  message (stays open) and a failure verdict (stays open, shows failure).
  Assert that no native stop or rename reaches the session.

Behavior: Example 2. The session reaches its completion boundary with CI
pending, publishes as today, reports pending CI, and ends its turn. The card
shows "Waiting for CI". Success of the last accepted revision completes the
session quietly, and the agent receives no message.

Change `ci-monitor.md` ("Await the applicable revision at completion") and
`ci-completion-wait.md` with one external-mode branch that covers all three
boundaries: execution/review handoff, wrap-up closure, and Story Branch trunk
integration. Automatic retrospective still starts while CI is pending. Plan
220's completion rule gains exactly one condition: a dashboard session that
has registered revisions becomes Done only after success for its last
accepted registered revision. A completion report without registrations
behaves as plan 220 defines.

### 4. Wake the session with one follow-up per CI failure
Type: Behavior
Status: planned
Proof: Playwright journeys with `fake-claude` extended to record
`--bg --resume` continuations and attached-terminal input:

- A failure verdict for an exited session produces exactly one continuation
  under the same session ID, carrying the revision, target, run/attempt, and
  failed jobs, plus the handling line.
- A failure for a loaded session produces exactly one terminal input.
- A repeated failure event or a dashboard reload sends nothing new.
- The card shows "failure delivered".
- A registered repair SHA (registered again by the stand-in) is observed, and
  its success completes the session as in slice 3.

The skill behavior review covers the delivered-result guidance:

- The result is accepted only for a SHA this session registered.
- Results for another session, an older superseded publication, or an
  unregistered SHA are not completion evidence and are not repaired as its
  own (example 4).
- An owned failure enters the existing "Handle a notification" steps
  unchanged, and the repair revision is registered as in slice 2.

The dashboard-side attribution test registers the same SHA from two sessions
and shows that each card's evidence stays its own. Native acceptance of real
wake-up reuses slice 1's observation path.

Behavior: Example 3. CI fails for the session's registered revision while
the session is idle or busy. The dashboard sends one follow-up and the
session acts on it at its next input boundary. It repairs, publishes, and
registers the repair SHA, and that revision's success completes the session.
The same failure is never resent.

Implement Claude's `deliver` (replacing the slice 2 interim), the per-failure
delivery record (keyed by repository, run, attempt, and job when present),
and the message text. CI text is untrusted data and is quoted, never treated
as an instruction. A busy session's message reaches it at the next input
boundary; this slice adds no interruption. Update the terminal/host
documentation for the new operation.

### 5. Keep observation through restarts and make every gap visible
Type: Behavior
Status: planned
Proof: Playwright fault journeys plus focused store tests, inspecting stored
records, mailboxes, and native calls:

- Dashboard server restart while a revision is pending: observation resumes
  from the stored registration and the mailbox, and the verdict then arrives
  and is acted on.
- An observer whose worker was lost, or whose mailbox is unreadable after
  restart: "CI not observed", session stays open, no success.
- Mark as done, then a failure: "not delivered", no native call.
- A delivery refused by the host: "not delivered", retained, no retry storm.
- Deleting the session record stops its dashboard observers through
  `ci-mailbox.mjs stop`, and the exact mailbox is confirmed ended.
- A revision with a recorded verdict that needs no delivery ends its
  observation; a shared repository/branch observer stops only when no
  session still needs it.

Behavior: Examples 5 (second half) and 6. Dashboard restarts, lost
observation, a session that is done or stopped, and refused delivery each
leave an explicit card state and never become success. Observation ends
when its verdict is recorded and delivered as required, or when its session
record is deleted.

Name the lifecycle owner, which is the dashboard server's observation module
started with the server, and prove it observes worker loss and cleans up on
server shutdown under the observer's own terminal-result contract. Do not
add a background retry scheduler or a generic message queue. The observer's
existing lifetime budget bounds any orphaned worker.

## Proof ownership and acceptance

| Source promise | Owner and decisive signal |
| --- | --- |
| Option only for hosts with a delivery operation; other hosts, workflows, and direct invocation unchanged (example 7) | 2 launch-argument tests plus unchanged managed-delivery suites; 3 unchanged completion guidance checks |
| Skill registers every accepted publication, starts no observer, acknowledgment after storage (example 1) | 2 real CLI → boundary → store journey and managed-delivery node tests |
| Dashboard observes with the existing engine, isolated from standalone mailboxes | 2 mailbox-root assertions and controlled project-CI verdicts |
| Card CI states: pending, success, failure delivered, not observed, not delivered | 2 (pending/success/failure), 4 (failure delivered), 5 (not observed, not delivered) |
| Completion ends the turn, "Waiting for CI", quiet Done on last success, attention message stays open (example 2) | 3 browser journey plus skill behavior review |
| One follow-up per actionable failure, wakes idle or busy session, repair registered and completes (example 3) | 4 fake-claude journeys; 1 plus native acceptance for real Claude delivery |
| Foreign, superseded, or unregistered results never satisfy completion (example 4) | 4 skill review plus dashboard attribution test |
| Unreachable dashboard, lost observation, restart, refused or undeliverable delivery never become success; no fallback observer (examples 5, 6) | 2 (unreachable at registration), 5 fault journeys |
| Lifecycle: observation ends on verdict or record deletion; Done/stop ends delivery only | 5 |
| Self-contained installed dependencies, payload declarations | 2 `tests/payload-declaration-links.sh` plus the existing install/update journey for any new dependency |

Local focused verification: `npm run test:dashboard -- <affected specs>`,
`npm run typecheck:dashboard`, and `npm test -- <affected node checks>`
(managed delivery, completion guidance, mailbox). Broaden only for a newly
affected consumer or an unresolved failure. Usual execution publication,
slice-local refactoring, review, and CI gates apply when execution is
authorized; planning invokes none.

Native acceptance (ADR 0005, manual and paid): slice 1's delivery
observation, plus one end-to-end Claude Code journey after slice 4 in which a
real execution session registers, ends its turn at completion, is woken by a
real failure, repairs, and completes quietly. Static guidance, synthetic
executables, and exit codes do not establish native acceptance.

## Current decisions

- The option is spelled `--external-ci`. The agent-facing wording is
  "externally observed CI"; there is no dashboard vocabulary in runtime
  guidance.
- The dashboard mailbox root is separate from the standalone default.
- No fallback to the skill's own observer when dashboard coverage is lost.

## Learnings

None yet.
