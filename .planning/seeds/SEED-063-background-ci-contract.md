# Background CI story domain and integrity contract

Authoritative supporting contract of
[SEED-063#background-ci-failure-delivery](SEED-063-dashboard-owned-ci-monitoring.md#background-ci-failure-delivery).
This extraction preserves the selected story outcome; its goal, scope, examples
and required native forms remain in the canonical story.

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
