---
id: SEED-004
status: active
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: A real task benefits from reusable project guidance
scope: medium
---

# SEED-004: Extract useful guidance and use it on real work

## Goal

Turn one useful project practice into shared guidance, then use it on an actual
task. Keep source review and project-specific fixes manual. Shared skill behavior
follows the established Codex, Cursor, and Claude Code conventions.

## Stories

<a id="continue-test-optimization-plans"></a>

### 24. Continue test optimization plans into execution or the backlog

**Status:** Captured; unrefined.

**Goal:** A developer who asks Open Dough to optimize tests gets durable forward
progress after profiling and planning: the optimization plan either proceeds
directly into authorized execution or becomes the next explicitly queued work,
rather than being left as an inactive planning artifact.

**Scope candidate:** Clarify the shared `dough-test-optimization` lifecycle at
the point where its executable plan is complete. When the original request and
resolved project context authorize implementation, continue through
`dough-execute-plan` without requiring a second request merely to begin the
planned optimization. When execution is not authorized or cannot start, use
`dough-product-backlog` to queue the planned work before ending. Link the plan
directly when it is the canonical active home for a bounded correction; when an
existing feature story owns the work, queue that story and preserve its plan
link according to the backlog contract.

Preserve explicit profile-only requests, which produce findings rather than an
executable optimization plan. Do not treat creating a plan as starting
execution, move work to **Taken** before execution actually starts, invent a
backlog when the project has none, or silently discard a plan whose execution
prerequisites are missing.

**Key examples:**

- Given a developer asks to optimize a selected test scope and the resulting
  plan is authorized and executable, test optimization invokes
  `dough-execute-plan` and continues the work instead of stopping after writing
  the plan.
- Given the invocation authorizes planning but not implementation, test
  optimization adds the planned work as the highest-priority queued item using
  the project's canonical story or bounded-correction identity, and reports
  that handoff.
- Given a profile-only request, test optimization reports its findings and does
  not manufacture a plan or backlog entry solely to satisfy the lifecycle
  handoff.

**Evaluation:** Representative default and planning-only invocations leave each
created optimization plan in exactly one actionable state: execution has
started through `dough-execute-plan`, or the work appears once in the product
backlog with a valid canonical link. A profile-only invocation remains
unchanged, and neither route duplicates the work across **Taken** and **Backlog
list**.

**Depends on:** None. Existing executable-plan, execution, and product-backlog
contracts supply the two handoff destinations.

**Safe stopping point:** Every created optimization plan is either being
executed or is recoverable as explicitly prioritized product work; existing
profile-only behavior and backlog ownership rules remain intact.

<a id="proudly-found-elsewhere-design"></a>

### 19. Strengthen architectural review after using the lightweight guidance

**Status:** Decomposed; deferred and not refined.

**Goal:** A developer gets useful architectural corrections and maintained
direction from normal review after the initial PFE and North Star guidance has
been used, without accumulating duplicate review work or stale instructions.

**Scope candidate:** Carry the remaining broader architecture-review work here:
review PFE use, whole-product domain cohesion, and North Star alignment in
post-change refactoring and execution retrospective; propose evidence-backed
corrections or direction updates; refine lifecycle handling where actual use
shows the minimal flow insufficient. Consider broader refactoring-authorization
alignment only for a demonstrated obstacle. Basic planning, execution stops,
coordinator updates, and ordinary retirement are already delivered by the
lightweight guidance. Do not assume every candidate extension is worth
implementing.

**Evaluation:** From actual use of the lightweight guidance, identify a concrete
missed architectural issue or unnecessary process step; refine this story around
a review result or simplification the developer can evaluate. Existing review
that already supplies the outcome is evidence to drop that extension.
**Depends on:** Evidence from using the delivered lightweight guidance. Its
completed source contract and plan are recoverable at
`7f672bf:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
`7f672bf:.planning/quick/044-lightweight-pfe-and-direction/PLAN.md`.
**Safe stopping point:** Any selected review improvement delivers its own useful
correction or reduced burden; no further process rollout is required.
**Effort hypothesis:** Uncertain until a concrete review gap is observed; no
S/M/L estimate without repository definitions and a refined outcome.
**Deferred decisions:** Which remaining extensions are justified, their concrete
examples, and the final bounded delivery scope. Tracking machinery, mandatory
per-story documents, partial wrap-up, and early termination remain excluded.

<a id="require-current-proof-before-live-transitions"></a>

### 25. Require current regression proof before live transitions

**Identity:** SEED-004#require-current-proof-before-live-transitions

**Status:** Refined and planned 2026-09-21; remains queued, execution not started.

**Plan:** [Current proof before live transitions](../quick/067-current-proof-before-live-transitions/PLAN.md).

**Goal:** A developer whose agent changes a live installation can rely on the
active plan's required regression evidence applying to the actual candidate and
relevant conditions before the dependent action, including after concurrent work.

**Why now:** Two recorded executions omitted or reused invalidated named proof.
Parallel trunk work makes an earlier pass vulnerable to another execution's
relevant changes. This bounded reliability response is not a dashboard prerequisite;
its priority does not justify building general deployment or evidence machinery.
The existing proof-reuse rule is appropriate; the missing application is the live
action boundary, including actions performed within a delegated slice.

**Scope:** Planned live changes with already-established proof obligations.
A live transition changes an installation, such as a restart, configuration change,
upgrade, migration, or updater enrollment; read-only checks alone do not qualify.
Reuse matching evidence; obtain missing observations when implementation, candidate,
tests, dependencies, configuration, or relevant conditions invalidate the pass.
Unknown correspondence requires proof or stopping the dependent action. A different
commit alone does not invalidate unchanged covered behavior. Operational checks
prove their own observations and cannot replace regression prerequisites.

Missing, failed, or unavailable required proof leaves only the dependent action
stopped, with the exact gap reported. Preserve existing action authority and
project-owned commands/CI exclusions. Resolve stale-test versus product failures
through existing diagnosis; do not dismiss an obligation because CI is green.
Post-transition observations keep their proper timing. No atomic deployment
coordination guarantee is promised.

**Key examples:**

- Named regression never ran, operational check passes → live action reached →
  run the named command first; failure/unavailability leaves the action unperformed.
  A subsequent valid pass permits the already-authorized action.
- Regression passed for candidate A, concurrent integration changes relevant
  behavior in B → later live action on B → reassess and run the applicable test,
  exposing failure even if CI excludes it; leave the action stopped.
- Only documentation changed and covered implementation/setup still match →
  later live action → reuse the retained pass without a redundant suite run.
- A pass belongs to another candidate/checkout without demonstrated correspondence
  → action reached → establish applicable proof or report the gap and stop it.

**Deferred promises:** Discovering obligations for planless changes; full-suite
reruns by default; new approvals, deployment locks, rollback, evidence databases,
CI-observer repair, and dashboard work. These are delivery exclusions, not rejection
rules for naturally supported behavior. No production exercise is needed for proof.

**Supporting finding:** [ODF-080](../../docs/maintainer/finding-names.md#odf-080--live-transitions-proceed-without-current-named-regression-proof).
The record does not establish that omitted proof caused the reported outage.

**Completion:** Demonstrate the examples in disposable state through representative
behavior review, preserving the distinction between walkthrough, native proof, and
field effectiveness. Record the actual response, implementation commit, recoverable
story locator, and first containing release or explicitly pending release in ODF-080.
Shipping guidance alone does not establish effectiveness.

**Depends on:** None; reuse existing proof ownership and execution boundaries.

**Safe stopping point:** The dependent action has applicable proof or remains
stopped with recoverable work; unrelated authorized work can continue.

<a id="keep-ci-observation-truthful"></a>

### 26. Keep registered CI revisions truthfully observed

**Identity:** SEED-004#keep-ci-observation-truthful

**Status:** Queued; unrefined.

**For / why:** A developer running parallel executions needs truthful CI coverage
for each registered revision, so a missed or dead observer cannot conceal a failing
revision behind an attachment message or an early unavailable result.

**Scope:** Bound this response to observation after successful startup: registered
revisions whose runs appear late, and a worker that stops while execution continues.
Establish the cause of the observed terminal-result miss before selecting a repair;
the current coverage loop can already revisit uncovered revisions. Surface actual
coverage loss promptly and retain the ability to report a later discovered verdict
while observation is active. Preserve asynchronous execution and exact revision
ownership. Runtime-path discovery, unsupported workflow targets, provider deployment,
and a new integration scheduler are outside this story.

**Evaluation:** Through the existing observer and host delivery boundaries, a
registered run appears after the initial discovery window and later fails; its
failure reaches the owning coordinator and final coverage names the real verdict.
A second scenario kills the observing worker while receipt writes remain possible;
the next ordinary coordinator interaction exposes lost observation instead of
claiming healthy attachment. Include an honestly unavailable case and preserve
unread evidence and unrelated observers. Use controlled disposable observations;
do not require live production failures or synchronous waiting for CI.

**Supporting findings:** [ODF-065](../../docs/maintainer/finding-names.md#odf-065--dead-ci-workers-remain-reported-as-attached)
and [ODF-069](../../docs/maintainer/finding-names.md#odf-069--ci-discovery-gaps-obscure-later-terminal-results).
These are distinct mechanisms supporting one trustworthy-coverage outcome; evidence
and frequency remain in the catalog.

**Completion:** Demonstrate the outcomes above and update both addressed findings
with the actual response, implementation commits, recoverable story locator, and
first containing release (or explicitly pending release). Preserve uncertainty
about inferred causes until diagnosed, and start no effectiveness watch from the
release date alone.

**Depends on:** None. Reuse the current observer and host-delivery contracts.

**Safe stopping point:** The coordinator receives a real verdict or an explicit
coverage limitation for each registered revision without blocking unrelated work.
