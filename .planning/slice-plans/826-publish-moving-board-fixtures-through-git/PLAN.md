# Publish moving Board test fixtures through real Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#publish-moving-board-fixtures-through-git)

**Identity:** SEED-430#publish-moving-board-fixtures-through-git

**State:** Awaiting story refinement. These mapped slices need realignment before execution.

## Goal and scope

A maintainer can drive a test publication from one real trunk commit to
another and see the same change through the Board, scheduled checks and
the fixture's pinned detail answers. This plan covers the browser
publishers that move, and preserves deliberate scheduled and detail failures.
[Configured projects and direct HTTP read fixtures](../827-qualify-board-fixture-routing-and-request-boundaries/PLAN.md)
own the request boundary and fixtures that launch or configure projects.

## Premises and proof

[The audit inventory](../827-qualify-board-fixture-routing-and-request-boundaries/fixture-audit.md)
groups browser mismatches by registered answerer. A scratch real A/B trunk
in `auto-refresh-branches.spec.ts` retained the conditional listing,
displayed pin and scheduled backlog request. An independent A/B conversion
in `auto-refresh-rate-limit.spec.ts` reached its 429, 403 reset and recovery
with a held owner. Each consumer's scratch conversion took about one active
minute once traced. On `2d6b55306`, those two migrated cases and the phone
Board passed in 32.2 seconds with the scratch Git membership dispatch
described in [the cutover plan](../828-open-and-refresh-board-at-verified-trunk/PLAN.md).
On `9dc3e801e`, a second scratch sample used one MakeMe history
publisher to materialize the named commits, move the real trunk and
advance the existing REST answerer together. The rate-limit case used
A/B and the direction case exercised A/B/A. Both passed in 5.8 seconds
through scratch Git membership and the live scheduled REST path under
`env -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npm run test:e2e -- e2e/stories/direction-disclosure.spec.ts e2e/observation/auto-refresh-rate-limit.spec.ts --grep 'same-project refresh|auto refresh rate limit' --workers=1 --reporter=line`.
The shared helper and two seam adaptations were a few active minutes,
before refactor, delivery or expansion to other answer families. Keep
the broader case counts separate from this sample.

Use the existing MakeMe history materializer or movable real origin.
Preserve each still-live REST endpoint's history, comparisons and failure
inputs. A move or rewind must point Git and the fake REST trunk at the
same real commit. Keep earlier reachable commits and explicit branch/detail
answers for their current consumers. Follow the pins from publication
through the assertions that name them.

## Provisional ordered slices

### 1. Move raw backlog observations through real commits

Type: Structure
Status: planned
Change: Start with the common raw moving origin and the branch/steady
observation journeys that reuse it. Keep deliberate synthetic branch
answers for scheduled reads.
Proof: Observe a real initial pin, exact trunk move, and the scheduled
read on the new pin in both transports. Measure remaining raw-origin
edit sites before fixing the next boundary.

### 2. Keep scheduled throttles and recovery at their owner

Type: Structure
Status: planned
Change: Migrate moving rate-limit, transient and read-turn scenarios with
raw publications. Stimulate the still-live scheduled or detail request at
its boundary. Keep genuine membership-only cases with the cutover.
Proof: Exercise holder, competing waiter, and recovery at the new real
revision. Preserve each scenario's distinct wait or error.

### 3. Move directions and story navigation across real pins

Type: Structure
Status: planned
Change: Migrate remaining raw moving Board/navigation publishers, including
direction, project changes and rewinds.
Proof: Run each affected project/navigation transition and observe both
trunk pins and the retained detail request.

### 4. Move browser session publications through named history

Type: Structure
Status: planned
Change: Migrate raw publishers shared by browser session navigation,
sidebar and Recently done reset cases. The actual agent launch and
reconciliation controls belong to configured projects qualification.
Proof: Check the prior and current pins, session state and view
navigation with the live details kept at their published pin.

### 5. Move published work records without replacing pinned history

Type: Structure
Status: planned
Change: Migrate moving file publications used by profiles, assignment
credit, branch progress, and unchanged-record readers.
Proof: Run these journeys through the move, reopen and restart where
present. Check prior pin and the exact comparison and record reuse
assertions.

### 6. Move Intent CI histories through real trunk

Type: Structure
Status: planned
Change: Migrate moving file publications in Intent CI, keeping the existing
verdict, returned history and event relationships.
Proof: Show CI evidence and its intended revision before and after a
real trunk move using the affected Intent journeys.

### 7. Move Recently done and session histories through real trunk

Type: Structure
Status: planned
Change: Migrate moving Done and session publications, including the
queued/re-Taken/Done sequence.
Proof: Run the reached sessions and Recently done journeys with the
same event sequence and real pins.

### 8. Publish remaining browser record overrides at their real trunk pins

Type: Structure
Status: planned
Change: Route custom result and error answerers for observation stories
that bypass the common publishers. Keep overrides at their still-live
scheduled or detail request.
Proof: Repeat the audited cases at their original failure and recovery
boundary. Record every moving fixture group for the final routing audit.

## Refinement condition

Use the shared moving-history sample for raw callers with the same shape.
Group the 51 raw-origin and 27 moving-file spec hits by the first shared
setup that can own a real pin. Count the residual moves and assertions,
and measure the distinct moving-file comparison path before accepting its
boundary. Select smaller
outcomes if their retained independent proofs require more than eight slices.

## Local gate

Run focused checks and Dashboard typecheck for each changed boundary.
Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
