# Dashboard UX/UI North Star

**Status:** Temporary design direction for discussion and incremental development.
**Updated:** 2026-09-19.

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
- Observe one project, initially hardcoded in the Open Dough dashboard project.
  The repository to observe has not been identified by this guide. Do not assume
  that it is Open Dough or introduce project selection or registration.
- The observed project's Git repository owns authoritative state. No application
  or server database or separately persisted project-state authority. Disposable
  browser storage is optional; losing it must not lose project facts.
- Stories can exist outside the backlog. Expose recorded backlog membership,
  Taken, refinement, planning, assignment, execution mode, and slice completion
  without inventing missing metadata. Taken does not establish live activity.
- Story Branch Mode can locate published execution on its recorded origin
  branch; Trunk Mode publishes progress on trunk.
- Same-machine coordination and local evidence come later. Feature and
  structural perspectives are independent future possibilities, not initial
  implementation scope or required panes.

**Design hypotheses:** The interaction, ordering, wording, and visual choices
below are an initial design recommendation. Revise them when real use shows a
clearer or smaller solution; do not treat them as additional user commitments.

This direction follows [ADR 0001 — Ubiquitous language](adrs/0001-ubiquitous-language-accepted.md)
for story and slice meaning and [ADR 0002 — Software development lifecycle
principles](adrs/0002-software-development-lifecycle-principles-accepted.md) for
small valuable increments, clear domain concepts, and inexpensive change.
Under [ADR 0000](adrs/0000-use-adrs-accepted.md), this temporary guide cannot
override Accepted decisions. No exception is proposed.

## Questions the first experience should answer

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

## Information hierarchy and interaction

Start with one **Stories** view. Put the observed project and repository identity
in its header, followed by a compact “Published Git state” source summary and
Refresh action. Identity is context, not a project picker. Keep source problems
visible near this summary without displacing readable story information.

Use a compact list with clear story titles. Group Taken work first, followed by
other backlog stories in recorded priority order and stories outside the
backlog. Make all groups reachable in the same view; avoid duplicating a story
because its evidence appears on several branches. Preserve backlog position
where it is recorded, including on Taken items. These groups aid scanning;
they are not a newly prescribed lifecycle or a drag-and-drop board.

Give each row a title and concise facts: backlog/Taken, recorded developer,
mode, refinement/planning, and slice completion. Use secondary lines when a
wide table would obscure titles. Leave detailed branch names and evidence in
the drill-down. Add search or filtering only when the actual list justifies it;
filters must not silently exclude stories outside the backlog.

Selecting a story opens its detail with a clear way back to the same list
position. A page or expandable section is sufficient; a side panel is optional.
Do not require simultaneous panes. In detail, show:

1. Story title, recorded purpose, and link to its canonical story source.
2. Backlog membership/Taken and assignment, then refinement and planning facts.
3. Execution mode and publication location, followed by the recorded slices in
   plan order with their names and completion evidence.
4. Sources supporting these facts: relevant origin refs, inspected revisions,
   record locations, and retrieval information. Keep evidence next to an
   affected fact when it is missing or contradictory.

Illustrative content only; names, refs, and counts below are not project data:

```text
<Observed project> / Stories
Published Git state · Retrieved <time, zone>               [Refresh]

Taken
  <Story title>                                      [Open]
  Developer: Not recorded · Trunk Mode
  Refinement recorded · Plan recorded · 2 of 5 slices completed

Backlog                         Outside backlog
  <Story title> ...                <Story title> ...

Open → <Story title>                                  [Back]
       <Recorded purpose>                         [Story source]
       Taken · Developer: Not recorded · Trunk Mode
       Progress source: origin/<trunk>, revision <sha>
       Completed: <slice name>                      [Evidence]
       No completion recorded: <slice name>
```

The sketch expresses reading order and navigation, not a column or layout
requirement. Stack groups and facts when space is limited.

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
attention-grabbing animation. Text must carry every status conveyed by color.

Keep headings and lists/tables semantic, links and controls keyboard accessible,
focus visible, and navigation order consistent with the visual reading order.
Name source links meaningfully. Announce refresh completion or errors without
moving focus; return focus to the originating story after closing detail.
Meet normal text contrast of at least 4.5:1 and control/focus contrast of 3:1.
Do not hide essential meaning in hover-only tooltips.

On narrow screens and at zoom, stack labeled facts in the same priority order;
wrap long story titles and refs and retain a way to read full values. Avoid
page-wide horizontal scrolling. Keep touch controls comfortably sized and do
not require precise clicks on tiny status icons. Reading story progress must
work without motion, color perception, or a pointer.

## Focused review and revision

Review the first usable experience against these examples, using actual records
when available. These are design review criteria, not an executable slice plan:

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
