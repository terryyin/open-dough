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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/299-background-ci-failure-delivery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a0d907f684a663c634c8f12656e09c14530caacdf43597ce0d8e4f429c13282b","plan":"69926f7cac9fc62afb9b323103a4cebeaa053ec6b63c362a6d87516e8e3a1b98"}}
```
**Slice plan:** [Background CI monitoring and failure delivery](../slice-plans/299-background-ci-failure-delivery/PLAN.md).

**Split:** Terry's 2026-10-11 decision split the original story at its
delivered boundary. Shared GitHub request admission was delivered first and
is described in [GitHub requests](../../dashboard/GITHUB-REQUESTS.md); its
closed story is recoverable at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/seeds/SEED-063-dashboard-owned-ci-monitoring.md`.
This story keeps the rest of the original outcome, refined again on
2026-10-11 against that delivery with no change to its promises.

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
| Claude Code | Dashboard background session; standalone interactive CLI session, including a session that exits after its turn | Original native session plus originating coordinator/child identity. Existing background resume/attach is a candidate; safe foreground continuation still needs proof. | Unobserved; slice 1 gate. |
| Codex | Dashboard App Server thread; standalone Codex CLI and desktop conversation | Actual native thread ID, coordinator identity and its verified continuation endpoint. Existing turn-start/history reconciliation is a candidate; arbitrary desktop/CLI binding is not established. | Unobserved; slice 1 gate. |
| Cursor | Dashboard runner-backed CLI; standalone Cursor agent CLI and IDE conversation | Original conversation and originating coordinator/generation where relevant. Existing terminal transport is a candidate for CLI; idle IDE delivery remains unestablished. | Unobserved; slice 1 gate. |

Other native forms are not acceptance commitments. A failed required-form
probe stops dependent work and returns the capability/scope choice to Terry;
it cannot silently remove that row, keep waiting, or claim a capability gap is
a fulfilled wakeup promise.

**Domain model:** These meanings are authoritative for this story. The plan
maps them to runtime owners rather than introducing a parallel dashboard model.

| Concept | Meaning and ownership |
| --- | --- |
| Session binding | Host-qualified native conversation, coordinator/child identity when relevant, verified continuation route, original workspace and delivery authorization generation. Before native launch, retained execution/start identity reserves the pending binding; only exact verified attachment enables delivery. Dashboard and standalone are origins of this same model. |
| Monitoring subscription | One execution owner's obligations referring to its binding, project/common-Git identity, authorized targets, provider configuration and durable runtime ownership. Repository matching is not ownership. |
| Accepted publication | Confirmed publication operation, exact repository/remote/target/full SHA and retained publication order. Recovery uses its receipt, not registration arrival order, sorted SHA filenames or today's target tip. |
| CI evidence | Provider/run/attempt/job identities, effective revision or applicability basis, lifecycle and verdict. Observation availability remains separate. |
| Failure delivery | One subscription's evidence, exact recipient, stable token, durable intent and native acceptance or explicit uncertainty/refusal. Acceptance does not prove handling. |
| Failure disposition | Owned diagnosis, coordination/attention decision, or linked repair and proof under existing authority. Unrelated later success is not disposition. |
| Completion boundary | Execution/review handoff or wrap-up closure naming acknowledged publications and its generation. Only the current boundary may settle; new owned repair work supersedes it. |
| Retirement request | Explicit closure resource authority and retained management context, settled through existing containment/ownership checks. Session Done alone grants none. |
| GitHub request admission | Delivered. One request owner per API host and login holds the allowance, concurrency, cooldown and recovery; the supervising runtime is its client. Acquisition sharing between subscriptions respects authorization context and request identity. |

**Integrity constraints:**

1. At most one fenced observation/delivery owner exists per subscription.
   Legacy transfer preserves registrations/unread evidence and confirms old
   ownership ended before replacement acquires it. Ambiguity retains a gap and
   resources; it starts no second watcher.
2. Registration acknowledgment follows durable storage. Lost responses retry
   the same operation; accepted Git publication is never repeated as recovery.
3. Completion evidence belongs to enrolled accepted publications and their
   proved applicability bases. Unpublished/rebased candidates and another
   writer's tip are excluded. Earlier accepted failures remain accountable.
4. Completion uses its explicit boundary, not whichever SHA is newest when CI
   responds. Stale reports cannot close repairs. No covered actionable failure,
   missing coverage, incomplete evidence or uncertain delivery disappears behind
   a green tip. Reserve a new generation before admitting repair work or
   renewed publication, so success cannot retire resources under an active
   writer. Existing documented failure dispositions remain applicable.
5. Persist delivery intent before calling the native port. Confirmed acceptance
   suppresses routine duplicates; possible acceptance followed by a crash needs
   reconciliation. If native evidence cannot settle it, expose uncertainty and
   do not blindly resend or promise exactly-once behavior.
6. All in-scope Open Dough GitHub requests obey the same admission owner.
   Cooldown refusal costs no upstream call. Restart cannot reset a hold or
   create another owner or leave uncounted upstream children alive. Changed
   authorization cannot reuse incompatible live acquisition answers; existing
   user-owned private immutable-content retention is unchanged. CI classification
   remains one implementation; `not_required` uses
   its actual basis, and incomplete never means success.
7. CI metadata is untrusted data and grants no extra repair, push, merge, stop
   or cleanup authority. Use existing
   [notification handling](../../src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification).
   Missing observation or delivery is visible, never success.
8. Retirement requires a current settled closure and existing creation,
   cleanliness, containment and ownership checks. Default and foreign checkouts
   remain; partial retirement recovers without repeating publication.

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

**Architecture:** Follow the revised
[North Star](../NORTH-STAR.md#background-ci-monitoring-and-session-delivery).
One installed runtime owns monitoring and request admission; dashboard and
standalone paths are adapters. Reuse publication receipts, durable mailbox
records, native session identity/continuation, machine-file persistence,
request admission/coalescing and installed retirement. Canonical CI lifecycle
instructions live once in the shared execution reference, linked by execution,
wrap-up and host adapters. Author sources under `src/skills/`; update managed
installed copies only from released payloads. Accepted ADRs
[0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[0004](../../docs/adrs/0004-client-installation-and-update-accepted.md) and
[0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
constrain cohesion, standalone dependencies and instruction ownership.

**Deferred promises:** Deployment, general messaging, refinement/ad hoc CI,
remote-machine supervision, controlling unrelated GitHub tools, and generic
scheduling/queue infrastructure. Trunk Mode `finish` retires the worktree and
branch only on a `success` receipt with confirmed shutdown, pinned by
[its completion gate journey](../../src/skills/dough-story-wrap-up/scripts/trunk-closure-completion-gate.test.mjs):
background closure settlement keeps that gate.

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
