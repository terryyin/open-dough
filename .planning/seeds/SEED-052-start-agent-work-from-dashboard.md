---
id: SEED-052
status: active
planted: 2026-09-27
planted_during: Maintainer direction for dashboard-initiated agent work
trigger_when: Current smaller backlog items have been cleared and the next product direction is considered
scope: epic
---

# SEED-052: Start agent work from the Open Dough dashboard

## Why This Matters

Developers should be able to act on the stories they see in the Open Dough
dashboard: select a story and start an agent service to refine it, or select a
refined or planned story and take it into execution. Routine coordination
should be performed deterministically by the dashboard and its supporting
tooling, reducing AI work and uncertainty before the agent begins useful work.

## Stories

<a id="start-agent-work-from-dashboard"></a>

### Start agent work from the Open Dough dashboard

**Identity:** SEED-052#start-agent-work-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers using the Open Dough dashboard to choose and start
work on their product's stories.

**Goal:** Start the appropriate agent workflow directly from a selected story
in the dashboard, with routine bookkeeping and workspace preparation already
handled and explicit context handed to the agent.

**Direction to explore:**

- Select a story and launch an agent to refine it.
- Select a refined or planned story and launch the appropriate path into
  execution, respecting any preparation or planning still required.
- Let the dashboard and supporting tooling perform mechanical work such as
  moving a story into Taken when execution starts, recording applicable state
  transitions, and preparing the worktree or branch for the agent.
- Tell the agent exactly which prepared workspace and story to use, so it can
  continue without repeating setup or guessing what has already happened.
- Preserve the agent's ability to carry out the same coordination and setup
  itself when the developer starts work directly from an IDE.

**Evaluation examples for later refinement:** A developer starts refinement
from a dashboard story and the agent receives that story and refinement intent.
A developer starts execution from an eligible story and the agent uses the
prepared worktree or branch and existing claim without duplicating them. The
equivalent IDE instruction still works without prior dashboard setup.

**Consideration and decomposition still needed:** Define the agent-service
launch and handoff contract; distinguish deterministic state changes from
judgments that still need an agent or human; consider workspace ownership,
concurrent starts, failed launches, and resuming work. Decide how dashboard and
IDE entry points share the same coordination behavior. Decompose this broad
direction into evaluable stories before implementation planning; these notes
do not select an architecture or commit to an implementation sequence.

**Priority:** Keep this epic at the bottom of the product backlog while the
current smaller items are cleaned up. It captures the next product direction
for later consideration, rather than starting that work now.
