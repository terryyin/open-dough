---
id: SEED-072
status: active
planted: 2026-10-01
planted_during: Terry's request for responsive dashboard session startup and reconciled story state
scope: story
---

# SEED-072: Keep the dashboard responsive while session startup settles

## Why This Matters

A developer starting refinement, execution, or an unattached startup session
needs immediate feedback that Start has taken effect, without being able to
cancel work that has already begun. Launch processing should let the developer
continue using the dashboard while protecting the affected story from further
actions until its temporary local state and published state agree.

## Story

<a id="responsive-session-start-reconciliation"></a>

### Keep the dashboard responsive while session startup settles

**Identity:** SEED-072#responsive-session-start-reconciliation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer launching work from the dashboard can continue
  using it and understand which story is temporarily unavailable while startup
  settles, without issuing conflicting actions or mistaking a local transition
  for authoritative published state.
- **Goal:** Make session startup responsive and visibly in progress, then
  restore the affected story's normal actions according to its reconciled state.
- **Scope:**
  - Apply the launch interaction to refinement, execution, and unattached Start
    session. Once Start initiates launch, immediately disable Cancel while the
    dialog remains visible; cancellation is no longer offered for that launch.
    Prevent repeat submission in the same interval.
  - Close the dialog once launch has been handed off safely to background
    processing. Restore dashboard interaction without waiting for every startup
    operation or remote refresh to finish.
  - For a story-associated launch, immediately make the affected story frame
    read-only: none of its action buttons can be activated while the transition
    is unresolved. Unrelated stories and dashboard controls remain operable.
  - Visually distinguish that frame and show an animated processing indication
    throughout the unresolved transition. Refine the actual UI/UX treatment
    (such as border styling and animation) with clear status text, accessibility,
    and reduced-motion behavior; no specific visual design is selected here.
  - Reconcile the dashboard's temporary launch state with authoritative story
    state published on `origin/main`. A stale remote snapshot must not prematurely
    clear the pending indication or enable conflicting actions. Local launch
    evidence must not be presented as an already published story transition.
  - Once the launch outcome and authoritative story state are settled and
    reconciled, clear the temporary treatment and restore the actions appropriate
    to the resulting state. This waits for startup/state reconciliation, not for
    the agent's entire refinement or execution session to finish.
- **Key examples / evaluation:**
  - Start refinement or execution with slow startup operations: Cancel disables
    immediately, repeat Start cannot create another launch, and the dialog
    closes after safe handoff while processing continues in the background.
  - While that story is pending, its frame visibly indicates processing and
    none of its action buttons work; the developer can navigate and operate
    unrelated dashboard controls and other stories.
  - An older `origin/main` snapshot arrives while launch is pending: the story
    retains its pending protection. Once fresh authoritative evidence and the
    launch outcome reconcile, the frame displays the resulting state and its
    eligible actions become available, even if the agent session continues.
  - Launch fails or authoritative state changes concurrently: reconcile the
    actual outcome, show a useful failure or changed-state explanation, and
    restore only valid actions. Do not leave a permanently animated, locked
    frame or falsely show a successful published transition.
  - Start an unattached session: the same immediate cancellation cutoff and
    background handoff apply, without inventing a story frame or durable story
    state for an unattached conversation.
- **Boundary:** This is a startup interaction and transient-state story. It
  does not redefine durable story lifecycle, session completion, workspace or
  landing choices, or the terminal/session panel controls. Preserve required
  pre-launch warnings and confirmations: cancelling before launch is initiated
  still starts nothing. Re-enabling a reconciled card does not override normal
  restrictions imposed by its authoritative state.
- **Refinement still needed:** Define the safe background-handoff boundary,
  the evidence that settles each launch mode, and the failure/recovery behavior
  when publication or refresh is interrupted. Design the pending frame and
  accessible status indication around those semantics; do not settle solely
  by a timer or the disappearance of the dialog.
- **Dependencies:** No new prerequisite is established by this capture. Follow
  the existing launch and published-state contracts, including the independently
  evolving session options in SEED-066; do not duplicate their implementation.
- **Effort hypothesis:** Unestimated. Captured for later refinement and approach
  selection; no executable plan or readiness assessment is claimed.

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: capture this UX/UI improvement
  first in the product backlog, directly on main, then commit and sync with
  origin. Disable Cancel immediately on launch, move startup to the background,
  show the story as read-only and processing, and recover its actions only after
  temporary dashboard state reconciles with authoritative `origin/main` state.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
- [Composable session options](SEED-066-composable-lightweight-session-options.md).
- [Session panel header controls](SEED-071-session-panel-header-controls.md).
