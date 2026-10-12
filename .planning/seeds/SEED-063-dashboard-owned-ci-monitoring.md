---
id: SEED-063
status: active
planted: 2026-09-30
planted_during: Terry's request to move dashboard-launched CI monitoring into the dashboard
trigger_when: Execution or wrap-up should end its turn while background CI monitoring can wake the owning session on failure
scope: story
---

# SEED-063: Background CI monitoring and failure delivery

## Why This Matters

A developer should not keep an agent waiting for CI after execution or wrap-up.
Background monitoring must retain responsibility for published work and wake
the same session when failure needs handling, whether the session began in
the dashboard or directly. Moving that responsibility must replace existing
watchers and coordinate GitHub demand with dashboard reads.

## Story

<a id="background-ci-failure-delivery"></a>

### Monitor CI in the background and wake execution or wrap-up sessions only on failure

**Identity:** SEED-063#background-ci-failure-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/299-background-ci-failure-delivery/PLAN.md","assessment":"not-ready","reasons":["Native slice 2 still lacks Claude live-CLI delivery and verified automatic unattached background stop safety.","Native slice 2 cannot deliver to the original Codex desktop writer or Cursor IDE conversation through the examined routes.","Native slice 2 still lacks restrictive Cursor post-wait delivery and applicable coordinator/child isolation proof."],"basis":{"document":"58b37571eeb59b789c1b81c5bc78130d515ad7074d2e68a7c1290cd3daf8714b","plan":"589cd1db8b3e25b79ac61451c67ff444b4ca4c6514847bb76ba6875ec5277205"}}
```
**Slice plan:** [Background CI monitoring and failure delivery](../slice-plans/299-background-ci-failure-delivery/PLAN.md).

**Split:** Terry split at the delivered request-admission boundary on 2026-10-11
([GitHub requests](../../dashboard/GITHUB-REQUESTS.md)). The closed story remains at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/seeds/SEED-063-dashboard-owned-ci-monitoring.md`.
The remaining original outcome was refined against that delivery on 2026-10-11.

**Human direction:** Terry's 2026-10-03 decision established failure-only
wakeup and visible gaps without fallback observation. His 2026-10-11 instruction
extends this to standalone execution and wrap-up, replaces existing watchers,
and requires shared GitHub throttling, reliable recovery, and one coherent
representation of behavior in code and instructions. Claude Code remains the
first native feasibility case; Codex and Cursor cannot retain final CI waits
as a silent standalone exception. Their affected delivery mechanisms need proof.
On 2026-10-11 Terry authorized the paid native feasibility probes and
confirmed two delivered choices: the request owner's endpoint stands under
`/tmp/dough-github-requests-<uid>`, and one request owner runs per API host
and login.

On 2026-10-12 Terry accepted idle-only Claude stop/resume as a candidate
continuation route: only a verified idle, unattached background process with no
pending approval or active work may be stopped. Continuation must preserve the
original session ID, workspace, model and permission policy; automatic race
handling still requires proof. He retained every required native form and
authorized continuing bounded native feasibility work. This selects no
unproved form as supported and defers none of the current scope.

**Design choice:** One installed background runtime serves both origins and
runs independently of the dashboard browser and server. Background closure
settlement may retire resources through the existing operation; an execution
handoff alone never authorizes retirement. This replaces the earlier inference
that any quiet session Done retires its resources.

**Goal:** Execution and wrap-up publish their work, durably hand off its CI
obligations, and end the agent turn without polling or awaiting CI. Monitoring
continues and sends a follow-up to the owning native session only for an
actionable failure. Dashboard and standalone status show the same evidence.
Monitoring asks GitHub only through the delivered request owner it shares with
dashboard reads.

**Scope:**

- **One background path.** Dashboard starts and direct skill invocations enroll
  with the same installed runtime. Standalone monitoring and wakeup need no
  running dashboard server. No `--external-ci` policy choice preserves waiting
  standalone behavior. The runtime establishes the sole observation owner;
  neither old detached watchers nor Codex yielded observer streams run alongside
  it. Installation and mixed-version startup must preserve one runtime owner.
- **Accepted publications.** Register claims, slices, repairs, execution records,
  wrap-up closures and integration publications with their confirmed target and
  full SHA. A claim published before native launch is registered against its
  retained execution/start identity with delivery pending binding; later binding
  verifies the exact recipient. Failed or uncertain launch retains an observable
  undeliverable obligation. Durable acknowledgment precedes any promise of coverage. An accepted
  push with lost registration acknowledgment is recovered without another push
  and remains a visible gap until reconciled.
- **No CI wait.** Ordinary slices already continue without waiting. Execution
  and wrap-up now use the same nonblocking completion handoff instead of
  `complete-revision`, including standalone Story Branch and Trunk Mode
  `finish`. Pending CI ends the turn with a truthful pending receipt. Known
  failures still enter existing handling at a safe boundary. Pending or success
  never creates a new agent turn. Local proof and publication authority remain.
- **Failure delivery.** Deliver to the exact enrolled coordinator. Busy sessions
  receive input at a verified safe boundary; waiting for it is runtime work.
  Continuation preserves conversation, workspace, permission policy and repair
  authority. A native form lacking a proved delivery route has a named gap,
  never a waiting or duplicate-watcher fallback. It remains unmet acceptance,
  rather than being called supported.
- **Late failures.** An earlier slice's failure can arrive during later work or
  after the turn ends. New publication or green CI does not dismiss it. Diagnose
  at current owned work under existing repair guidance; report disposition and
  any linked repair publication so delivery, handling and repair success remain
  distinct. No reset to the old revision is implied.
- **GitHub requests.** Monitoring asks GitHub only through the delivered
  request owner of its own login, which already shares cooldown, concurrency
  and recovery with dashboard reads. Add no poller per commit.
  Publication-triggered checks obey cooldown. The supervising runtime is a
  client of that owner; request owners stay on demand, one per API host and
  login.
- **Request owner on real hosts.** Carried from the delivered story: an
  observer on a sandboxed host that cannot reach the owner's endpoint, mixed
  installed versions and an owner started before an update, login changes that
  rewrite no gh configuration, an owner that has stopped but still accepts
  connections, and the paid native fixtures' gh stand-ins are proved here.
  Each stays a named gap or a visible failure until then, never a second
  allowance.
- **Recovery.** Reuse the installed non-AI observer and provider classification.
  Reconcile every unsettled registered publication after restart, including runs
  completed while offline and applicable ancestor attempts. Throttling suspends
  acquisition visibly; it is neither CI failure, success nor automatic loss of
  coverage. Lifetime expiry, refusal, missing runs and failed recovery are gaps.
- **Completion.** A boundary names exact accepted publication evidence and the
  obligations it covers. Settlement requires effective success and resolution
  of covered failures and gaps. Repair invalidates the earlier boundary.
  Dashboard quiet Done additionally retains existing explicit-completion and
  attention rules. Execution handoff, CI settlement, session Done, published
  story state and resource retirement are separate facts.
- **Retirement.** Only an explicit wrap-up closure with resource authority may
  retire after settlement, using existing checks. Pending, incomplete,
  unobserved or uncertain work retains resources, as does a retirement hold.
  Ordinary Land/one-shot landing without a CI obligation retains its behavior.
- **Targets.** Story Branch wrap-up retains unsettled branch coverage and
  separately registers the accepted trunk integration. Late trunk failure is
  repaired in owned work and published to its authorized trunk target. Branch
  green cannot satisfy trunk completion; a later writer's trunk tip cannot
  replace the owner's accepted integration receipt.
- **Lifecycle and visibility.** Obligations outlive browser, attachment and
  agent turn. Mark as done or explicit stop revokes delivery, retaining
  observation and resources. Durable revocation prevents subsequent dispatch;
  a previously in-flight or accepted native input cannot be recalled and is
  reconciled rather than resent. Deleting the
  enrolled session ends only its subscriptions, without ending shared
  acquisition needed by another session or deleting Git resources. Record
  retention cannot erase active obligations. Cards and the installed status
  operation project CI, observation, delivery, completion and retirement facts
  separately, including throttling, uncertain delivery and holds. The retained
  launcher restarts a failed runtime owner with fenced recovery. Machine reboot
  or loss of the launcher is recovered by the next installed/dashboard/status
  entry; the interrupted interval is explicit missing coverage, not success.

**Required native coverage:** This is the delivery scope; the acceptance home
records mechanism-specific evidence against these rows. A narrower convenient
form cannot substitute for a required standalone form. Direct invocation means
an installed skill in the owning session, without a dashboard launch.

| Host | Required native form | Recipient and candidate route | Proof state |
| --- | --- | --- | --- |
| Claude Code | Dashboard background session; standalone interactive CLI session, including a session that exits after its turn | Original native session plus originating coordinator/child identity. Existing background resume/attach is a candidate; safe foreground continuation still needs proof. | Partial feasibility, plan 299 native slice 2 (formerly slice 1) (2026-10-12): exited CLI with explicit retained mode and controlled unattached stop/resume preserved ID, context and policy. Automatic unattached/race safety and still-open CLI delivery remain open; no integration acceptance. |
| Codex | Dashboard App Server thread; standalone Codex CLI and desktop conversation | Actual native thread ID, coordinator identity and its verified continuation endpoint. Existing turn-start/history reconciliation is a candidate; arbitrary desktop/CLI binding is not established. | Partial feasibility, plan 299 native slice 2 (formerly slice 1): original App Server and exited/still-open CLI delivery observed; pending requests stayed distinct and lost acknowledgment reconciled. Effective-policy drift on fresh resume requires explicit policy-safe binding. Genuine desktop fixture/readable history did not establish delivery: resume refused its active writer and direct start refused the thread. Desktop continuation and restrictive request-owner proof remain open. |
| Cursor | Dashboard runner-backed CLI; standalone Cursor agent CLI and IDE conversation | Original conversation and originating coordinator/generation where relevant. Existing terminal transport is a candidate for CLI; idle IDE delivery remains unestablished. | Partial feasibility, plan 299 native slice 2 (formerly slice 1): original runner/CLI idle, held-busy and lost-ack delivery observed with unrestricted policy. Restrictive post-wait delivery and original IDE continuation remain open; verified IDE identity did not make ACP/CLI resume a valid route. |

Other native forms are not acceptance commitments. A failed required-form
probe stops dependent work and returns the capability/scope choice to Terry;
it cannot silently remove that row, keep waiting, or claim a capability gap is
a fulfilled wakeup promise.

**Domain, integrity and architecture:** The authoritative
[story contract](SEED-063-background-ci-contract.md) defines these meanings and
constraints; the slice plan maps them to runtime responsibilities.
Changed authorization cannot reuse incompatible live acquisition answers.
Missing observation or delivery is visible, never success.

**Key examples:**

1. Dashboard and standalone executions publish slice 1 and continue on slice 2.
   Both use the same runtime, with separate subscription owners and no legacy
   observer. Slice 1's failure arriving during slice 3 is handled at a safe
   boundary against current owned work.
2. With no dashboard running, standalone execution publishes its execution
   record, acknowledges its completion boundary, reports CI pending and ends
   the turn. Failure later wakes the same session. Authorized repair registers
   a new publication and boundary. Success creates no turn; execution completion
   retains the worktree.
3. Standalone Trunk Mode wrap-up and dashboard Story Branch wrap-up register
   their final authorized trunk publication and end their turns. Branch
   obligations remain accounted for. Late trunk failure wakes the owner to
   repair on trunk; settled closure success permits retirement.
4. A newer publication is green while an earlier owned failure awaits delivery
   or disposition. Automatic completion and retirement remain withheld. A stale
   completion report cannot close a repair.
5. Push succeeds but registration acknowledgment is lost. Resume recovers the
   exact accepted SHA and retries its registration token without another push
   or observer. Restart also finds an older failure completed during downtime.
6. Native input is accepted, then the runtime crashes before saving the receipt.
   Restart reconciles the delivery token and recipient against native evidence;
   accepted input is not repeated. Unreconcilable delivery remains uncertain.
7. Two dashboard processes and standalone monitoring use one GitHub allowance
   scope. Identical pending acquisition costs once. A rate-limit response holds
   every consumer; new registration cannot bypass it. Restart retains the hold;
   one recovery request starts after expiry. Coverage stays session-specific.
8. Mark as done while CI is pending: later failure is recorded without wakeup.
   Deleting that session stops only its obligations; another subscriber sharing
   acquisition continues.
9. Missing native delivery, unreadable state, expired budget, dirty worktree or
   another owner's checkout remains a named gap or hold. No replacement session,
   waiting fallback or cleanup hides it.

Deferred boundaries remain in the [story contract](SEED-063-background-ci-contract.md).

**Delivery and acceptance:** Deterministic proofs cover mixed enrollment,
request accounting, faults at durable boundaries, owner transfer, restart,
stale completion, late failure, authorized repair and retirement. Native
feasibility and acceptance on Claude Code, Codex and Cursor remain separate in
[SEED-053](SEED-053-native-guidance-acceptance.md#background-ci-failure-wakeup)
under [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Record native forms explicitly; documentation or fake processes do not prove
idle wakeup. Paid native runs require explicit native-check authority and are
outside this planning request and routine CI.

<a id="request-owner-says-why"></a>

### A GitHub request or failed log that could not be read says why

**Identity:** SEED-063#request-owner-says-why
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/300-request-owner-says-why/PLAN.md"}
```
**Slice plan:** [Request owner says why](../slice-plans/300-request-owner-says-why/PLAN.md).

**Goal:** A developer or agent whose GitHub request never reached `gh`, or
whose failed-job log could not be read, is told the actual cause instead of
"gh failed" or an unbounded retry instruction. This bounded correction comes
from the retrospective of shared GitHub request admission, whose closed
story is recoverable at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/seeds/SEED-063-dashboard-owned-ci-monitoring.md`.

**Scope:** The request owner's unreachable-owner causes and the diagnostic
entry's unavailable-log causes, with the guidance that names them; one shared
reading of the process table for the request owner and the CI mailbox; and
removal of request-rule proofs repeated across test layers. No new feature
promise.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard launch](../../dashboard/AGENT-LAUNCH.md) and
  [completion reporting](../../dashboard/AGENT-LAUNCH-COMPLETION.md).
- [GitHub request ownership and costs](../../dashboard/GITHUB-REQUESTS.md).
- [CI observation](../../src/skills/dough-execute-plan/references/ci-monitor.md),
  [completion mechanics](../../src/skills/dough-execute-plan/references/ci-completion-wait.md),
  and [wrap-up closure](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md).
