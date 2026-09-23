# Dashboard UX/UI North Star

**Status:** Temporary design direction for discussion and incremental development.
**Updated:** 2026-09-23.

Help a developer understand the project's published story progress, then inspect
the evidence behind it. The first useful experience should be small enough to
use and revise before expanding the dashboard's scope.

## Authority and scope

The [project visibility requirements](project-visibility-requirements.md) supply
the product direction. [ADR 0008](adrs/0008-project-dashboard-domain-and-architecture.md)
describes proposed domain and architecture; it remains **Proposed**. This guide
does not accept that ADR, define a workflow state schema, or authorize execution.

**Firm user direction**, including the latest discussion constraints:

- Begin with stories using only committed state published to Git origin,
  including relevant remote branches and history. No developer clone, unpushed
  changes, local locks, or live agent sessions are required sources.
- Observe one project at a time from the delivered fixed catalog: Open Dough,
  Doughnut, or Pygardon. Keep the existing selector and local launch. Do not
  introduce project registration.
- The observed project's Git repository owns authoritative state. No application
  or server database or separately persisted project-state authority. Disposable
  browser storage is optional; losing it must not lose project facts.
- Stories can exist outside the backlog. Expose recorded backlog membership,
  Taken, refinement, planning, assignment, execution mode, and slice completion
  without inventing missing metadata. Taken does not establish live activity.
- The primary experience is an animated spatial stage with connected stages
  of work, not just a list or table. Zoom out to understand the whole and zoom
  in to inspect a story. Canvas is optional; this is an experience direction,
  not a rendering-technology choice.
- Apply this direction just in time: each interaction must serve the selected
  story's goal and available evidence. The visual ambition does not require a
  complete navigation or animation system in the first increment.
- Story Branch Mode can locate published execution on its recorded origin
  branch; Trunk Mode publishes progress on trunk.
- Same-machine coordination and local evidence come later. Feature and
  structural perspectives are independent future possibilities, not initial
  implementation scope or required panes.

**Design hypotheses:** The interaction, ordering, wording, and visual choices
below are an initial design recommendation. Revise them when real use shows a
clearer or smaller solution; do not treat them as additional user commitments.

[The first overview](../dashboard/README.md)
selects the published direction, connected Backlog and Taken stages, readable
entry facts, source links, and refresh/read states.
It omits fetched story/plan detail, outside-backlog discovery, and
owner/mode/readiness/slice facts. A connected spatial overview belongs in this
story. General pan/zoom, multiple detail levels, and animated card travel are
not prerequisites: add the smallest navigation or motion only when it solves
a reading or orientation problem in this scope. A readable stage with ordinary
scrolling and source links is a valid first increment of this direction.

This direction follows [ADR 0001 — Ubiquitous language](adrs/0001-ubiquitous-language-accepted.md)
for story and slice meaning and [ADR 0002 — Software development lifecycle
principles](adrs/0002-software-development-lifecycle-principles-accepted.md) for
small valuable increments, clear domain concepts, and inexpensive change.
Under [ADR 0000](adrs/0000-use-adrs-accepted.md), this temporary guide cannot
override Accepted decisions. No exception is proposed.

## Questions the story perspective should answer

1. Which stories are recorded, which are selected in the backlog, and which are
   Taken?
2. What is each story trying to achieve, and what refinement, planning, and
   slice completion have been published?
3. Who is assigned, if recorded, and where does this execution mode publish work?
4. What evidence supports this view, when was it retrieved, and what is unknown?

Do not require readers to interpret raw Git history to answer the ordinary
questions. Make the underlying records available when they need to verify an
answer. Keep the initial interaction observational: browse, inspect, refresh,
and follow source links. Assignment, reprioritization, and agent controls are
outside this initial design.

The first story answers the backlog/Taken and source questions. The other
questions guide later increments; zoom must not invent facts to answer them.

## Connected stages and spatial navigation

Keep one story overview with an always-visible banner pinned to the viewport top.
Use **OpenDO** as the dashboard brand, distinct from the observed project's name.
Move the existing project selector, compact project/repository and ref information,
and manual refresh control into this banner. Keep full source revision and
retrieval time accessible in its source context. Render refresh as an SVG icon
with the accessible name Refresh, changing to Retry after a failed read; preserve
its focus and guarded behavior during reads. Keep readable loading and source
problems near the source context. Make the header wrap without covering focused
content or consuming the usable reading area at narrow widths or browser zoom.

Below the banner, show **Near-future direction** as an initially collapsed
disclosure. Activation reveals its full published text or the existing
no-direction explanation; activation again collapses it. Preserve the choice
across same-project refreshes and start collapsed on project changes. Replace
the expanded **Preparation badges** legend with a compact question-mark help
control beside the work overview, named Preparation badge legend. Open the
existing legend in a titled modal above the banner; provide a visible Close
control and Escape, contain focus inside, and return focus to the launcher.
Keep the actual story badges and their textual meanings visible on cards.
Direction and help are transient UI state and cause no source read. Keep
direction, evidence, refresh, and view controls outside any zooming surface.

This direction follows Terry's 2026-09-23 review: keep common controls in reach
and reclaim reading space from supporting explanations. It replaces the older
single-project header hypothesis; it does not change source or preparation meaning.

Use one navigable stage containing connected regions for work stages. Initially,
show **Backlog → Taken**, with work cards placed inside their recorded region.
The connector means “work can be taken from the backlog,” not a dependency
between stories, a required sequence of all lifecycle steps, or evidence that
a particular story moved during this observation. Label that relationship.
Taken includes claimed work, not a claim of live execution. These visual stages
are separate from the two delivery stages in the requirements.

Use stable story identity to preserve orientation across refreshes. Preserve
source order within each region, with visible backlog priority; do not sort by
title, owner, or inferred activity. Do not add Refined, Planned, Running, or
Done stages to fill out a pipeline before their meaning and evidence are
selected. Later refinement and planning facts may be independent annotations,
not exclusive destinations. A missing entry is not proof of completion.

The initial layout hypothesis is a left-to-right flow with a visible connector,
clear region boundaries, and story cards that stay attached to their stage as
the user navigates. Reflow to a vertical connection on narrow screens if useful.
The relationship between stages should be apparent, rather than presenting
unrelated lists. A movable viewport is a later option when ordinary layout and
scrolling stop serving the work. Exact geometry and styling can evolve.

As density or richer evidence justifies zoom, support two useful levels of
reading from the same snapshot:

- **Overview:** fit the connected stages, their names, and entry counts into
  view. Work remains visibly distributed across the stages; compact cards or
  marks may stand in for full titles when fitting every title would be illegible.
  Counts describe recorded entries, not completion percentages.
- **Focused work:** selecting a work item brings it into readable view and
  reveals its full title, identity, group/priority, and existing source links.
  Zoom reveals existing information; it does not fetch new story or plan facts
  in the first story. Keep the containing stage apparent and provide a clear
  route back to the overview.

When zoom is introduced, include named Zoom in, Zoom out, and Fit overview
controls, with bounded zoom and pan so work cannot be lost indefinitely
offscreen. Provide pointer pan on
the background and a keyboard-equivalent way to reach offscreen work; keyboard
focus brings a work card into view. Focused reading and Fit overview must also
work on touch screens without precise gestures. Preserve browser page zoom and
normal page scrolling; gestures may supplement, not replace, explicit controls.
Do not require a minimap, physics simulation, freely draggable cards, or custom
graph editor. Panning changes the view, never backlog order or membership.

Illustrative compact overview; placeholders are not observed project data:

```text
┌──────────────── pinned viewport-top banner ──────────────┐
│ OpenDO   Project [<selection> v]   <repository/ref>  [↻]  │
│ Published Git state · <revision> · Retrieved <time, zone> │
└──────────────────────────────────────────────────────────┘
Published work
▸ Near-future direction                                [?]

┌──────────────────── connected stage ──────────────────────┐
│  BACKLOG                         TAKEN                    │
│  ┌──────────────────┐            ┌───────────────────┐    │
│  │ 1 · <work card>  │ ── take ─▶ │ <work card>       │    │
│  │ 2 · <work card>  │            │ <work card>       │    │
│  │ …               │            │                   │    │
│  └──────────────────┘            └───────────────────┘    │
└──────────────────────────────────────────────────────────┘

Each work card → readable title, identity, stage/priority, source links
```

Do not hide already-readable entry information just to create a zoom interaction.
The first story can use ordinary layout, wrapping, and scrolling; if a small
focus or fit control materially helps, add it within that reading journey.
Do not prebuild a viewport framework for future feature or structural views.

As later stories deliver richer evidence, focused work can expose purpose,
assignment/mode, independent refinement/planning facts, and named slices with
completion evidence. Source revision and uncertainty stay attached to each
fact. A readable anchored panel is an option for dense detail; it complements
the stage rather than replacing spatial navigation with a list-and-detail app.
Stories outside the backlog must become reachable when their discovery is in
scope. Search or filtering can follow actual navigation needs.

## Animation explains change

When spatial navigation is introduced, animate viewport movement when focusing
work or returning to the overview, using short, interruptible transitions to
help preserve orientation. After a
successful explicit refresh, motion can explain observed placement or order
changes for the same identity between the previous and new snapshots. Start
with a small transition if it clarifies that change; continuous card travel
between stages and an animation engine are not first-story acceptance criteria.
Apply the new facts as one coherent snapshot; the transition illustrates that
change, not an
intermediate authoritative state. Source links and controls remain usable.

Do not animate a story traversing stages it was never observed in, infer a
completion from disappearance, or show looping motion, pulsing agents, or
continuous progress between refreshes. An unchanged snapshot should settle.
New entries appear in their recorded place; removed entries leave the view
without an invented destination. Preserve the user's viewport/focus where
possible; if a focused entry disappears, return focus to a useful stage control
and announce the change rather than resetting the whole scene silently.

Honor reduced-motion preferences with immediate placement and focus changes.
All meaning and navigation must remain available without animation. Exact
durations and easing are implementation choices to tune through use, not a
reason to introduce an animation engine now.

## Meaning and terminology

| Display concept | Rule for interpretation and wording |
| --- | --- |
| Story | An intended change or learning possibility. Show its recorded title; never replace its identity with a developer name or branch. |
| Backlog / Outside backlog | Membership in selected work. “Outside backlog” requires sufficient membership evidence; a failed backlog read means membership is unknown. |
| Taken | Recorded claim for execution. Avoid “Running,” “Online,” or an animated activity dot. |
| Developer | Recorded assignment, potentially an agent's rotating name. Missing assignment is “Not recorded,” not an inferred commit author. |
| Refinement / Slice plan | Separate facts, not obligatory sequential gates. Show “Refinement recorded” or “Plan recorded” only with evidence; otherwise distinguish absence from unreadable evidence. |
| Story Branch Mode | Show the recorded origin execution branch, not a guessed branch or the branch it was created from. Missing branch metadata is “Execution branch not recorded.” |
| Trunk Mode | Show the observed project's trunk ref. Absence of a story branch is expected, not an error. Missing mode is “Mode not recorded”; do not infer it from branch absence. |
| Completed slices | Use “2 of 5 slices completed” only for a known plan and supported completion records. Counts describe slices, not effort, elapsed time, or percentage of the story outcome achieved. |

When no plan is recorded, say so instead of “0%” or “0 of 0.” If planless
execution is explicitly recorded, name it without treating it as missing work.
A slice without completion evidence has “No completion recorded,” not an inferred
running or failed status. All slices completed does not itself establish story
closure or that the intended user outcome was achieved.

## Evidence, freshness, and uncertainty

Always distinguish **when the source was retrieved** from **when its contents
were committed**. A successful refresh of an old commit is fresh retrieval of
unchanged published evidence; it is not proof of inactivity. Do not claim to
know when a commit was pushed unless that evidence is actually available.

Keep the global source summary short. Expose ref/revision and record links in
detail so a user can trace each material fact to the inspected content. Facts
from trunk and an execution branch may reflect different revisions; do not
present their combination as an atomic snapshot. Associate branch-specific
retrieval failures with the affected stories instead of implying full coverage.

Use consistent distinctions:

- **Not recorded:** Relevant records were read, but this field or evidence was
  absent. Do not turn absence into “No,” “Idle,” or “Not started.”
- **Unavailable:** A required source could not be read. Name the affected source
  and consequence; offer Retry where another retrieval may help.
- **Conflicting records:** Sources disagree. Show the differing facts and their
  sources without choosing a winner by commit recency alone. Canonical source
  resolution belongs to the repository's defined record semantics.
- **Previously retrieved:** If earlier data remains available after refresh
  failure, keep it visibly dated and label it as such. Never silently present
  cached evidence as a successful current fetch.

State once, near the source summary or its explanation: “Only published changes
are visible. Current agent activity is unknown.” Avoid repetitive warnings on
every story. A missing or deleted branch, a removed plan, or an old commit does
not by itself prove completion, abandonment, failure, or stopped execution.
History can explain a record's removal; show a historical fact as historical.

## Empty, loading, and error states

| Situation | Intended response |
| --- | --- |
| Initial retrieval | “Reading published story records…” with a stable page structure. Do not briefly show zero stories. |
| Successful read finds no stories | “No story records found in the inspected sources.” Identify those sources; avoid claiming that the project has no work. |
| No Taken work or an empty backlog | Say that no Taken entries or backlog entries were recorded. Keep other discovered stories visible. |
| A filter has no matches | “No stories match this filter” and a clear reset action. |
| Some sources fail or records cannot be interpreted | Retain readable facts, identify the gap beside affected content, and provide the source link when available. Do not silently drop the story or convert unreadable data to empty data. |
| Initial source access fails | Explain the observed failure in plain language, identify the repository/ref when known, and offer Retry. Do not imply the user needs to create stories. |
| Observed repository is not configured | Explain that the dashboard's observed repository must be configured. Do not substitute a guessed repository or introduce registration UI. |

## Visual and accessibility direction

Use quiet surfaces, readable typography, generous enough spacing for scanning,
and one restrained accent for links and selection. Story titles carry the most
weight; metadata is secondary but remains legible. Reserve warning/error styling
for evidence or retrieval problems, not unknown ownership or old timestamps.
Avoid decorative charts, percentage rings, avatars implying presence, and
unrelated looping animation. Use motion for the navigation and observed changes
above. Text must carry every status conveyed by color.

Keep stage headings and work groups semantic, links and controls keyboard accessible,
focus visible, and navigation order consistent with the visual reading order.
Name source links meaningfully. Announce refresh completion or errors without
moving focus; return focus to the originating story after closing detail.
Meet normal text contrast of at least 4.5:1 and control/focus contrast of 3:1.
Do not hide essential meaning in hover-only tooltips.

On narrow screens, keep controls and source status reachable and reflow the
connected stages when that is sufficient. If a viewport is introduced, let it
pan to focused work. In readable work content, wrap
long titles/refs and labeled facts; browser page zoom must not make controls
unreachable. Avoid page-wide horizontal scrolling: panning is contained within
the stage. Keep touch controls comfortably sized and do not require precise
clicks on tiny marks. Semantic reading order follows the groups and source order
regardless of card coordinates. Canvas, if selected, still owes equivalent
accessible work content and controls. Reading progress must work without
motion, color perception, or a pointer.

## Focused review and revision

Review the first usable experience against these examples, using actual records
when available. These are design review criteria, not an executable slice plan:

- The first story opens connected Backlog and Taken stages. A reader can
  understand their relationship, read each entry and follow its source links.
  Normal scrolling or reflow is enough until a real navigation need appears.
- A published queue-to-Taken change places that one card correctly on successful
  refresh, with no duplicate or invented live status. Any animation clarifies
  this result and respects reduced motion. Failed refresh leaves membership intact.
- Keyboard, narrow-screen use, and browser page zoom preserve readable work and
  access to evidence and refresh. If zoom/focus is added, a reader can return
  to an overview without losing orientation.

As later stories add the relevant facts, also review:

- A reader locates a Taken story, explains its intended outcome, identifies the
  recorded developer/mode, and reaches evidence for a completed slice.
- A story outside the backlog remains discoverable. Refinement and planning can
  differ independently; a planless story does not look broken.
- A Trunk Mode story and a Story Branch Mode story lead to the correct published
  sources. Missing assignment or branch metadata stays visibly unknown.
- A branch retrieval failure and an old but freshly retrieved commit communicate
  different situations. Neither produces an invented live status.
- Partial, conflicting, and empty evidence remain distinguishable. A reader
  understands the limits of the view without reconstructing Git history.
- Keyboard and narrow-screen use preserve the overview-to-detail path and source
  access. Decoration does not compete with story understanding.

Defer local worktree/lock activity, agent communication and takeover, feature
and structural views, and a recently finished stories view. Features would mean
maintained, test-protected external behavior; structure would map domain
organization to code. Neither is a one-to-one story mapping. A finished view
would first explore Git history rather than restore a maintained completion
list. Do not reserve disabled navigation or empty panes for these possibilities.

Revisit this guide during development when a real record, prototype review, or
user observation changes a design assumption. Update the relevant hypothesis
in place and record the reason briefly; avoid accumulating competing designs.
Keep firm requirements in the requirements document and durable architectural
constraints in human-owned ADRs. Retire or reduce this guide once its useful
direction is embodied in the product and maintained checks, or no longer helps
the next increment. It is not a permanent parallel specification.
