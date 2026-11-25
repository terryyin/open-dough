# Qualify Board fixture routing and request boundaries

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#qualify-board-fixture-routing-and-request-boundaries)

**Identity:** SEED-430#qualify-board-fixture-routing-and-request-boundaries

**State:** Awaiting story refinement. These mapped slices need realignment before execution.

## Goal and scope

A maintainer can open the Board for configured, added, or relaunched test
projects against their real origins. The relevant direct backend calls still
prove their admission, pinning, sharing, and recovery. This story owns the
full pre-cutover fixture gate after the fixed and moving browser families land.
The product cutover switches membership after the fixture gate lands.

## Decisions and proof gaps

- Use the [fixture audit inventory](fixture-audit.md) as the discovery list.
  The old diagnostic probes a successful fake REST ref through the first
  served HOME. It cannot prove absent trunk, interrupted transport, or
  the ordering of a moving ref. Check each relevant HOME and the real
  reference exactly when the case establishes it.
- The launch journeys that already push before `advanceTo` may supply
  the origin directly. Audit registration at `publishCommittedOrigin`
  also found mismatches for launch cases that need inspection. A real
  commit in the fixture is insufficient if the HOME routes to another
  origin or origin `main` has yet to move.
- The existing `publishes()` and committed origins supply a real pin.
  Preserve the route across wrappers and republication. Maintain the
  precedence of a route the HOME fixture itself supplied. See the prior
  [cutover probes](../828-open-and-refresh-board-at-verified-trunk/PLAN.md#preparation-probes-on-2026-11-25).
- The scratch migration in `authenticated-read-cooldown.spec.ts` restored
  all three directed-wait cases by stimulating an explicit scheduled
  `since` read and holding `matching-refs`. It removed the membership-only
  matrix assertion. Keep read-turn, sharing and failure tests at the live
  REST operation they prove. Move membership-specific assertions together
  with the cutover.

## Provisional ordered slices

### 1. Route added and configured projects at their own publication

Type: Structure
Status: planned
Change: Use the serve hook for named committed origins and configure the
real origin behind Add Project and configuration scenarios.
Proof: Check republication uses the newest origin, a route installed by the
HOME wins, seeded defaults work, an added project reaches its own origin
and an unserved repository fails locally. Run the reached add/configuration
cases. The previous Intent Coverage check at `4baf31b4f` found the
republication assertion missing from maintained proof.

### 2. Keep launch publications and served refs in step

Type: Structure
Status: planned
Change: Trace launch and session-reconciliation cases that register an
already committed fixture. Include the base-CI, Codex and phase variants
and the feedback-maintenance launch cases from the raw publisher audit.
Advance real trunk at the same transition that advertises the new pin.
Proof: Check available HOME routes at initial open and at the eligible
launch and reconciliation transitions. Run the reached launch journeys.

### 3. Route session reconciliation to the fixture's published commit

Type: Structure
Status: planned
Change: Qualify multi-HOME session reconciliation, launch completion,
terminal and one-shot Review fixtures separately from launch admission.
Proof: Check the origin at initial Board open and the actual publication
reconciliation. If the test already pushes before `advanceTo`, observe
that exact route at the reconciliation.

### 4. Publish real origins behind authenticated read admission

Type: Structure
Status: planned
Change: Migrate direct backend authenticated-read fixtures whose setup
opens a Board or reads membership before exercising a second operation.
Keep explicit-revision admission inputs and deliberately invalid requests.
Proof: These tests establish the exact origin-backed membership before
proving admission and reachability at the same pin.

### 5. Keep backend retained-answer evidence at its live read

Type: Structure
Status: planned
Change: Migrate retained-answer backend fixtures and their pinned detail
answers. Keep explicit content/listing failures at that operation.
Proof: Show the retained view or exact detail error through the existing
consumer after the fixture ref is backed by a real origin.

### 6. Stimulate ownership and sharing through scheduled and detail reads

Type: Structure
Status: planned
Change: Retarget REST cooldown and cross-operation ownership cases whose
promise continues to the live `since` check or detail read. When a test
merely uses membership to warm a memo, qualify the warm-up independently
of its owner assertion. Keep sole membership proofs for the cutover.
Proof: Both projects and competing directed waits still reach the intended
REST owner. Run cooldown, read-turn and shared-read cases with their
existing independent detail results.

### 7. Qualify the fixture suites before product cutover

Type: Structure
Status: planned
Change: Reconcile the diagnostic inventory with the completed fixture
migrations. Record each legitimate mismatch by operation and time, and
require zero unexplained mismatches. A new independent migration returns to
its owning boundary. Reverse the scratch instrumentation and retire the
temporary patch when the fixture gate has its recorded result.
Proof: Apply [the audit](ref-audit.patch.b64) from the root with
`base64 -D -i <plan-dir>/ref-audit.patch.b64 | git apply -`.
Run Dashboard Backend Test and E2E Test. Keep a maintained real-ref
assertion at the fixture routing boundary. The product cutover reruns both
suites against the new dispatch.

## Refinement condition

Recheck affected requests and both HOMEs in launch/session fixtures.
Measure the remaining shared backend edits and the launch route exceptions
before settling the 15-active-minute boundaries.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
