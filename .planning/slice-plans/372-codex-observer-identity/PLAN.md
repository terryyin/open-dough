# Expose Codex observer identity

**Identity:** SEED-010#expose-codex-observer-identity
**Story:** [bounded correction](../../seeds/SEED-010-learn-from-execution-retrospectives.md#expose-codex-observer-identity)
**Source:** [selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#expose-codex-observer-identity), ODF-376 and the developer's instruction to implement its investigated
fix and verification, land it, and preserve investigation evidence in the commit.
**Source review:** [independent commitments](source-review.md)

## Goal, current findings and preserved promises

The coordinator must receive the exact stream identity while it is live even
when initial tool output is empty. Investigation at the originating checkout
`/Users/terryyin/git/open-dough` reproduced late/split receipts being parsed but
not exposed; seven current binding/parser tests pass. Their process host waits
for stdout instead of representing a timed empty first yield. Lizard's original
coordinators 01a17b69-3805-7020-b344-977bb1ca0c6e and
01a17cb1-7277-7ce3-8519-72e167742370 report missing identity after 1/10 seconds;
all three recorded Lizard start bindings equal release 0.3.71 and current source.
Plain-pipe replacement succeeded, but PTY corruption was not established.

PFE: change the existing documented Codex host binding and its existing extracted
cell/process fixtures. Reuse the established owned-stream checks and delivery
APIs; add no observer store, discovery path, parser module or launch service.
The producer already writes claimed identity before provider discovery.

ADRs 0003 and 0006 preserve source-only authoring and executing-agent language.
No architecture boundary or accepted decision changes. Existing CI ownership
and acknowledgment remain authoritative. The correction implements the current
near-future direction's bounded response/evaluation loop. No new North Star topic.
No release/install, transport retry, unrelated host behavior or finding retirement.

## Ordered slices

### 1. Receive and use late observer identity

Type: Behavior
Status: done

Precondition: The coordinator launches its one owned Codex stream; initial output
may be empty or hold only part of its receipt.
Trigger: Complete identity arrives initially or in a later chunk.
Postconditions:

- Expose key, coordinator, session, directory and PID once while the stream is
  live; a late notification reaches the coordinator independently of completion.
- Startup without identity remains starting. Early terminal/exit reports actual
  stopped/finished/lost semantics and never advertises a usable observer.
- Use plain pipes for the machine stream; keep fragmented JSON/CRLF handling,
  single launch, owner isolation, notification ordering and durable acknowledgment.
- The received identity is sufficient for increment and repair managed delivery
  to reuse the same stream, with no manual owner lookup or replacement.
- Preserve ODF-376 investigation and supported verification in the commit; record
  actual delivered response and outstanding release/ordinary-use observation at
  the finding owner without claiming resolution or a watch start.

Proof owner: implementation agent for automated red/green and real-process
integration; coordinator for current native Codex transport of the modified
source binding against a disposable real stream with controlled late receipt.
Exercise immediate, empty first yield, split late receipt, CRLF, duplicate receipt,
early ended and missing-terminal cases in the extracted documented cell.
Extend the existing real-process fixture to model an empty timed yield without
sleep-driven flakiness, and observe readiness plus exact-stream managed increment
and repair reuse. Preserve the failure/repair acknowledgment and unread-failure
completion tests, owner-gap and observation-loss coverage. Record the new late
identity assertion failing before changing the binding and passing afterward.

Focused commands: node --test over ci-notify-codex.test.mjs,
ci-observer-stream.test.mjs, ci-codex-delivery-acknowledgment.test.mjs,
execution-increment-managed-delivery-codex.test.mjs, its owner-gaps companion,
ci-codex-observation-loss-lifecycle.test.mjs and ci-notify-codex-stop.test.mjs in
src/skills/dough-execute-plan/scripts/. Trace changed consumers before accepting
that selection. Run npm run typecheck:dashboard and changed-file lint required
by the check-only commit hook; no unrelated full application suite locally.
Native proof uses this checkout's source binding explicitly, not a hand-edited
installed payload. Retain exact command/result and orderly local shutdown.

One cohesive behavior slice includes implementation, proof, documentation and
independent refactoring. No numeric slice limit supplied. Stop and replan on
unbounded scope, contradictory behavior or required extra outcomes. No assumption
that increasing timeout fixes readiness, or that PTY corruption is established.

## Preparation review

Slice-plan refinement not needed: one outcome has one owning behavior/proof loop.
No remaining slice-boundary concern; native transport remains a named execution
proof obligation, not an unobserved design premise. Preserve all existing source,
backlog and worktree ownership. Coordinator alone commits and publishes.

## Execution context

Story Branch Mode; created owned checkout
`/Users/terryyin/git/open-dough/.worktrees/odf376-observer-identity`, branch
`codex/odf376-observer-identity`; originating/integration checkout
`/Users/terryyin/git/open-dough`. Publisher odf376-20261029-codex, agent viktor-chan.
Starting revision d368b1d7691cbc34a204680615723ca91f548442; accepted Take
68014eebcf717ecac6330fb813a613b42a4fb947 on origin/main and execution branch.
Default checkout refresh deferred for this session's preparation drafts.

Checkout setup: Node 24.21.0; all three setup-native npm/browser/check stages
succeeded, Chromium 153.0.8010.12; npm run typecheck:dashboard passed.
GitHub source verified: ci.yml, workflow 351271804, display name CI, active.
Coordinator odf376-20261029; one installed-runtime stream of execution target,
yielded cell 58, terminal session 79059, mailbox /tmp/dough-ci-501/watch-KPDrLp,
PID 73872. Initial receipt confirms watching; the Take's trunk target is
unobserved. Replanning remains authorized within the bounded correction.

## Accepted proof and native observation

Implementation returned 39 passing focused tests, then 11 readiness/binding/real
stop tests after stronger immediate/early-terminal assertions; typecheck passed.
Consumer trace and per-row dispositions: /tmp/odf376-implementation-consumer-trace.md.
Source-review.md records the source-only launch/input and inspected commitments.

Native observation under dough-manual-testing, bounded to one controlled real
stream with 60s startup gate and private storage, source binding used explicitly.
Cell72 extracts and evaluates the actual documented JS fence with normal task
placeholder substitution; only its producer command is replaced by a disposable
fixture calling the real streamMailboxWorker with a fake provider event. Actual
Codex exec_command/write_stdin/text/notify/yield_control carry output. Initial
text: starting, session80523, no identity. After gate release, exactly one
CI_OBSERVER_READY names coordinator native-odf376, session80523, directory
/tmp/odf376-native-l3y_xokh/mailboxes/watch-IpcBlf, PID70429, status watching;
CI_FAILURE run376 follows it. Exact retained-stream validation reports live,
durable delivery reaches1, cooperative stop confirms stopped/recorded1/delivered1/
unread0, cell finishes and retained terminal is stopped. No ordinary-use or
release-effect claim. Initial native setup attempts failed before readiness due
to an unexported fixture-helper import and an undersized temporary Node command
for process-title verification; both were diagnosed and corrected in the owned
temporary fixture. The binding accurately reported lost; no product proof was
claimed from those attempts.

Independent refactoring completed (/root/refactor_odf376): only the existing
armDocumentedStream fixture comment changed to distinguish immediate paused
from delayed continuing output. No runtime change; automated and native proof
remain applicable. Whitespace passed; no redundant tests rerun for that comment.
