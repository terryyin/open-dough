---
id: SEED-066
status: active
planted: 2026-10-01
planted_during: Maintainer request to capture composable lightweight session options
trigger_when: A developer wants lightweight refinement or execution with explicit workspace and landing choices
scope: story
---

# SEED-066: Composable lightweight session options

## Why This Matters

A developer doing trivial reassessment currently starts dashboard refinement,
including worktree setup and a published Preparing announcement. Static
inspection reported four fetches, an announcement push, remote confirmation,
local worktree creation, and agent launch in a typical fresh setup. Network
delay is a candidate explanation for friction, not a measured timing result.

Existing one-shot behavior is execution-only: preparation-only requests are
excluded, Taken and agent assignment are skipped, work starts in an owned
workspace, and the verified result normally publishes when finished. Extend
that lightweight experience to refinement and execution while allowing the
developer to choose workspace location and landing policy independently.

## Story

<a id="composable-lightweight-session-options"></a>

### Choose workspace and automatic landing independently for lightweight refinement and execution

**Identity:** SEED-066#composable-lightweight-session-options
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Developers performing small refinement or execution work can
  avoid unnecessary setup and choose whether a verified result waits for their
  review or lands automatically.
- **Goal:** Extend existing one-shot behavior in shared skill guidance/runtime
  and dashboard starter-session dialogs, explicitly covering both refinement
  and execution, with two independent, composable choices: work directly in
  the default main checkout instead of an isolated worktree/temporary local
  branch; and opt into automatic landing after successful verification with
  no open issue or coordinator/human decision remaining.
- **Proposed default:** An isolated owned workspace and stop for review.
  Automatic landing is opt-in. This proposes a change to today's one-shot
  publication behavior; it is not a settled runtime contract.
- **Evaluation:** A developer can choose neither option, either option alone,
  or both for lightweight refinement and execution through skill invocation
  and dashboard launch. Default and review-waiting outcomes retain a
  recoverable local result until an explicit land instruction. With auto-land
  selected, successful verification and resolved decisions allow landing;
  an unresolved issue or coordinator/human decision stops automatic landing.
  Refinement can publish updated preparation/readiness records through its
  authorized landing choice while leaving the selected story queued, without
  completing it or Taking it. Execution retains its applicable completion and
  closure obligations.
- **Scope:** Capture one coordinated change across skill guidance, supporting
  runtime, and dashboard starter-session dialogs. The request seeks options
  on every starter-session dialog: refinement, execution, and the unattached
  ad hoc Start session. Applicability and presentation in that third dialog
  remain open; this capture does not promise identical controls there.
- **Boundary:** Workspace choice and publication policy are independent of
  whether a session has a selected task. An unattached conversation must not
  silently become tracked execution merely because one-shot is disabled. No
  new flags, full state model, or admission/assignment policy is selected here.
- **Value / learning:** Reduces friction for small reassessment and execution
  while making review and publication intent explicit; tests whether setup
  costs can be avoided without losing recoverability or decision ownership.
- **Effort hypothesis:** Unestimated; refine preparation disposition, safe
  default-checkout use, landing boundaries, and dialog applicability first.
- **Depends on:** Existing one-shot, preparation, landing, and dashboard launch
  behavior. No new unfinished product prerequisite is established by capture.
- **Capture:** Append one item without reprioritizing existing work. This is
  outcome capture only, not refinement, implementation, or slice planning.

## Examples for Future Refinement

- Default lightweight reassessment uses an isolated owned workspace and leaves
  the updated preparation records locally reviewable.
- Default-main only performs the requested small refinement or execution in
  that checkout and waits for review with a recoverable local result.
- Auto-land only works in isolation and lands after verification succeeds and
  every blocking issue and decision is resolved.
- Both options work in default main and auto-land under the same conditions.
- Verification succeeds but a domain decision remains: automatic landing
  stops and the local result remains recoverable for the human/coordinator.
- Lightweight refinement updates preparation/readiness evidence without
  implying story completion or moving the selected story to Taken.

## Existing Behavior and Constraints to Reconcile

- [Current one-shot guidance](../../src/skills/dough-execute-plan/references/one-shot.md)
  excludes preparation, skips Taken and agent profiles, and normally publishes
  its verified execution result. Extending it must reconcile these facts with
  refinement's publication of preparation/readiness records and proposed
  review-by-default behavior, rather than importing execution closure into
  preparation.
- [Ad hoc launch documentation](../../dashboard/AGENT-LAUNCH.md) and
  [launch runtime](../../dashboard/server/agentLaunches.ts) show that Start
  session bypasses workflow startup. The
  [host launcher](../../dashboard/server/claudeLaunch.ts) opens it in the
  configured project folder with only the user's instruction, without a
  selected story or skill. This supports no automatic tracked-work setup;
  it does not establish that the folder is always default main or enforce
  review-before-publication. The user's belief that it already uses default
  main and waits for review needs qualification on that evidence.
- [Dough Land](../../src/skills/dough-land/SKILL.md) supports local never-pushed
  temporary branches and a dirty default-main checkout. It lands ALL checkout
  changes and local unpublished commits, not selected refinement paths. It
  publishes and cleans up Git; it does not itself close backlog work or
  release agent assignment profiles. The calling workflow must prepare any
  required closure and assignment release before landing.

## Open Decisions

- How should lightweight refinement avoid unnecessary setup/announcements
  while preserving ownership, preparation disposition, content-basis checks,
  and truthful readiness? How does publication leave the selected story queued
  without completing or Taking it?
- What are the names and precise contracts of the two independent options,
  and how do they relate to the existing one-shot selection and eligibility?
- How is safe default-main use established when the checkout already contains
  unrelated edits or unpublished commits, given that Dough Land lands all of
  them? What makes a review-waiting result recoverable there?
- Which verification and issue/decision evidence permits automatic landing,
  and how are stops, explicit land instructions, closure, and assignment
  release coordinated without extending authority silently?
- Should and how can both options be offered in the unattached Start session
  dialog, which currently supplies no selected story, skill, or assignment?
  Keep workspace/publication policy separate from task selection. The third
  dialog may later warrant a separate story, but none has been selected; do
  not assume disabling one-shot admits or assigns a story.
- What measured setup evidence would confirm whether network delay explains
  the reported trivial-reassessment friction?

## Breadcrumbs

- Maintainer capture request on 2026-10-01; retain one queued item and open
  design questions, without changing runtime guidance or settling flags.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Preparation disposition](../../src/skills/dough-story-refinement/references/preparation-disposition.md).
