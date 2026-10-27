# SEED-138: Execution readiness from current preparation and dependency facts

### Compute story readiness from preparation and dependency facts

**Identity:** SEED-138#compute-execution-readiness
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/311-compute-execution-readiness/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"adc18b8ead461c2722d3a9918d495c90d835d80261d888c419f38e9a6507b1f4","plan":"146d507cddcd4e9233e48280a76130f507f2c6ca490aa543e2b0368188e47ef4"}}
```

**Beneficiary:** Developers choosing the next story on the dashboard, and
agents starting it, after prerequisite work is integrated.

**Goal:** A prepared story becomes startable the moment its last recorded
prerequisite is published as satisfied, with no further readiness write, and the
dashboard and the start command answer "can this start?" the same way. The
preparing agent's assessment stays the one record of preparation readiness, as
[ADR 0002, principle 5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires; whether a story may start is derived from that record and the
dependency agreement, never stored again.

**Scope:**

Required behavior:

- **One derived start eligibility.** The shared story-state reader exposes
  whether a story may start: eligible when the recorded assessment is `ready`
  and no dependency is unsatisfied; otherwise it names what blocks: the
  assessment (with its reasons), each unsatisfied dependency (waiting or
  decision needed), or a gap (absent, unreadable, or malformed preparation or
  dependency facts). The start command and the dashboard consume this one
  meaning instead of combining the facts separately; the start command's
  refusal text names the same blockers the dashboard shows.
- **Dependency blockers are represented once.** The dependency agreement is
  the only record of a prerequisite. Readiness criteria and slice planning
  guidance state that a recorded dependency is not a readiness concern: the
  preparing agent assesses goal, scope, examples, plan, proof, and decisive
  premises, and records `ready` for a story that waits only on its suppliers.
- **A satisfied dependency does not invalidate the review.** The readiness
  basis covers the dependency agreement (supplier, implementation, rationale,
  condition) but not its state, resolution evidence, or decision text, so a
  supplier's resolution leaves "Changed since readiness review" off. Records
  assessed before this change keep an accurate indication.
- **Existing duplicated reasons are reassessed by judgment.** During the
  supplier's wrap-up visit, the agent that rereads a consumer and satisfies its
  condition also rereads the consumer's `not-ready` reasons. When it judges a
  reason to state only the now-satisfied condition, it records a fresh
  assessment through the ordinary recorder with that reason removed, keeping
  every other reason; it never matches reason text in code and never records
  `ready` for a consumer whose other reasons remain.
- **Dashboard presentation.** The card's badge row shows the derived meaning: a
  story blocked by a dependency shows its blocking count in place of the green
  badge, not beside it. The recorded assessment, its reasons, and review-change
  indication remain visible on the card and in the detail with shared wording,
  and the badge legend explains the derived badge. The Start action's
  availability and reason follow the same derived meaning, including the note
  shown when the assessment alone blocks.

Rejection constraints:

- Readiness is never inferred from reason text, queue membership, a supplier's
  disappearance, or an increment; only a published `satisfied` resolution
  counts (dependency lifecycle in the
  [visibility requirements](../../docs/project-visibility-requirements.md#blocking-story-dependencies)).
- Becoming eligible grants no execution permission and launches nothing
  (ADR 0002, principle 5).

Deferred:

- Informational dependencies that allow parallel execution.
- Continuation of an owned Taken execution keeps its existing handling; the
  derived eligibility describes new execution.
- Reassessing a legacy duplicated reason whose supplier already wrapped up
  before this story lands: the dashboard still shows `Not ready` with zero
  blocking dependencies and the review-change indication, and a preparing agent
  re-reviews it on request.

**Key examples / evaluation:**

- A is prepared with assessment `ready` and one dependency on B, `waiting`. Card:
  blocked by 1 dependency, no green badge; Start unavailable naming B. B's
  wrap-up publishes A's condition as `satisfied`. Card: "Ready for execution",
  no "Changed since readiness review"; Start available; the start command
  admits A with no readiness write in between.
- A has assessment `not-ready` with the single reason "Waiting for B" recorded
  before this story. B's wrap-up agent verifies A's condition, publishes
  `satisfied`, judges the sole reason to be that condition, and records
  `ready` for A with current digests. A is eligible on the dashboard and at the
  start command. Had A also carried "Acceptance examples for the retry path
  are unresolved", the agent records `not-ready` with that reason alone, and A
  stays blocked until it is genuinely resolved.
- A depends on B and C, both `waiting`, assessment `ready`. B satisfied: card
  shows 1 blocking dependency, Start unavailable naming C. C satisfied: A is
  eligible. Had A's assessment been `not-ready` for its own reasons, satisfying
  both leaves A blocked by that assessment, named as such.
- B is closed, but A's condition needs a developer decision: A's dependency is
  `decision-needed` with the actual question. A is blocked by that dependency
  on the dashboard and at the start command; nothing reads B's closure as
  fulfillment.
- The preparing agent's slice plan for A notes that A waits on B and still
  records `ready` because goal, scope, proof, and premises are settled. The
  dependency agreement alone blocks A's start.
- A's dependency block is malformed. The card shows the dependency gap and no
  green badge; the start command refuses with that gap. The same holds for an
  absent or unreadable preparation record.
- A has assessment `ready`, basis recorded before this story. Nothing but B's
  resolution changed. Card: no "Changed since readiness review". Had A's goal
  text been edited since, the indication shows as today.

**Architecture:** Two authoritative records, the readiness assessment and the
dependency agreement, stay distinct domain facts under
[ADR 0002, principle 5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(Accepted): "readiness" keeps the ADR's meaning, the preparing agent's recorded
assessment, and the derived start eligibility carries a distinct name in code,
start output, and dashboard wording so neither layer redefines the other. The
derivation lives in the shared story-state reader that the CLI and the dashboard
already import, giving the "can this start?" rule exactly one representation
(ADR 0002, principle 2). Moving the dependency's fulfillment state out of the
readiness basis is a change to what "Changed since readiness review" means:
story and plan text and the agreement itself, not the supplier's evidence.
Records assessed before this change need a compatible comparison so they do not
all read as changed. The supplier wrap-up's consumer visit gains a judged
reassessment step through the existing recorder; the recorder's rules are
unchanged. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
is Proposed and informs this without binding it. No Accepted decision conflicts
with this story.

**Safe stopping point:** Published prerequisite resolutions are reflected in
the consumer's eligibility consistently across display and startup, while
genuine preparation concerns and unresolved conditions remain visible and
enforceable.
