# Dashboard UX/UI North Star

**Status:** Temporary design direction for discussion and incremental development. **Updated:** 2026-10-30, for Development, Product intent, and Structure.

Help a developer understand Development, the project's ongoing effort to shape
the product, and inspect the evidence behind it. The current dashboard combines
published story progress with separate local-session capabilities. Further
design relates Development to Product intent and Structure.

## Authority and scope

The [project visibility requirements](project-visibility-requirements.md#three-perspectives)
own the detailed three-perspective direction, Product intent's Purpose and
Proof, and open choices. [Accepted ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
defines the dashboard domain, UI concepts, and architectural boundaries. This
guide follows those definitions and supplies temporary interface direction;
it does not define a workflow state schema or authorize execution.

**Firm user direction**, including the latest discussion constraints:

- Keep published story progress readable from committed state on Git origin,
  including relevant remote branches and history. A developer clone, unpushed
  changes, local locks, and live agent sessions are not required sources for
  those published facts. Local session evidence supplements them separately.
- Observe one configured project at a time. Keep the existing selector and local
  launch. Add and remove projects through **System settings → Projects** using a GitHub URL and
  local checkout path, saved separately for built production and live development
  on this machine (Terry's decision of 2026-10-02). Project configuration is
  machine-local settings; it does not own the observed repository's state.
- The observed project's Git repository owns authoritative state. No application
  or server database or separately persisted project-state authority. Disposable
  browser storage is optional; losing it must not lose project facts.
- Stories can exist outside the backlog. Expose recorded backlog membership,
  Taken, refinement, planning, assignment, execution mode, and slice completion
  without inventing missing metadata. Taken does not establish live activity.
- The primary experience is an animated Board with connected Columns
  of work, not just a list or table. Zoom out to understand the whole and zoom
  in to inspect a story. Canvas is optional; this is an experience direction,
  not a rendering-technology choice.
- Apply this direction just in time: each interaction must serve the selected
  story's goal and available evidence. The visual ambition does not require a
  complete navigation or animation system in the first increment.
- Story Branch Mode can locate published execution on its recorded origin
  branch; Trunk Mode publishes progress on trunk.
- The current dashboard presents Development through story planning, execution
  progress, and local-session capabilities. Additional Product intent and
  Structure perspectives remain design direction. Their presentation and
  UX/UI are left for a separate discussion.

**Design hypotheses:** The interaction, ordering, wording, and visual choices
below remain revisable guidance alongside the linked implemented contracts.
Revise them when real use shows a clearer or smaller solution; do not treat them as additional user commitments.

The [current dashboard](../dashboard/README.md) provides Backlog, Taken, and
Recently done, story and assignment detail, recorded slice progress, and local
session navigation. The [agent launch contract](../dashboard/AGENT-LAUNCH.md)
and linked session guidance own its current operations. Existing navigation
and interactions remain applicable. Broader spatial and animation hypotheses
still need a concrete reading or orientation benefit before further implementation.

The Development perspective encompasses exploration, decomposition, refinement,
planning, execution, verification, integration, and learning. Story is its
planning unit. Lasting results are assimilated into product intents and
structure, while learning guides subsequent attempts. Existing Story cards and
workflow controls present the work and evidence supported by the current
dashboard.

The Product intent perspective concerns the enduring, maintained definition of
intended behavior: what the current product is meant to do and why. Each
Product intent contains Purpose, its expected behavior and reason, and Proof,
its executable verification and supporting evidence. Maintained verification
procedures are distinct from observations of particular runs. Follow the
[shared vocabulary](adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
and detailed requirements. Proof fields, interactions, layouts, and presentation
states for the additional perspectives remain future UX/UI design work.

This direction follows [ADR 0001 — Ubiquitous language](adrs/0001-ubiquitous-language-accepted.md)
for Development, Story, and Slice meaning and
[ADR 0002 — Software development lifecycle principles](adrs/0002-software-development-lifecycle-principles-accepted.md) for
small valuable increments, clear domain concepts, and inexpensive change.
Under [ADR 0000](adrs/0000-use-adrs-accepted.md), this temporary guide cannot
override Accepted decisions. No exception is proposed.

## Questions the Development perspective should answer

The current dashboard answers these questions through stories and their
recorded development work:

1. Which stories are recorded, which are selected in the backlog, and which are Taken?
2. What is each story trying to achieve, and what refinement, planning, and
   slice completion have been published?
3. Who is assigned, if recorded, and where does this execution mode publish work?
4. What evidence supports this view, when was it retrieved, and what is unknown?

Do not require readers to interpret raw Git history to answer the ordinary questions.
Make the underlying records available when they need to verify an answer. Keep the
reading experience grounded in observed evidence: browse, inspect, and follow
source links. Local launch actions start the selected agent workflow under the
[launch contract](../dashboard/AGENT-LAUNCH.md), including its explicit Take and
workspace handoff where supported. Session presence never establishes published
story progress by itself. Zoom must not invent facts to answer these questions.

## Board and spatial navigation

The [dashboard navigation guidance](dashboard-navigation.md) describes the pinned
banner, supporting disclosures, connected Columns, and progressive spatial navigation.
It is part of this temporary design direction and carries the same authority.

## Animation explains change

When spatial navigation is introduced, animate viewport movement when focusing
work or returning to the whole Board, using short, interruptible transitions to
help preserve orientation. When an automatic check reads a new snapshot,
motion can explain observed placement or order changes for the same identity between the
previous and new snapshots. Start with a small transition if it clarifies that
change; continuous card travel between Columns and an animation engine are not
prerequisites for further useful story reading. Apply the new facts as one
coherent snapshot; the transition illustrates that change, not an intermediate authoritative state.
Source links and controls remain usable.

Do not animate a story traversing Columns it was never observed in, infer a
completion from disappearance, or show looping motion, pulsing agents, or
continuous progress between refreshes. An unchanged snapshot should settle.
New entries appear in their recorded place; removed entries leave the view
without an invented destination. Preserve the user's viewport/focus where
possible; if a focused entry disappears, return focus to a useful Board control
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
| Taken | Published stories record claims for execution. Local open sessions without an active story card also appear here; their presence establishes only local session state. Avoid “Running,” “Online,” or an animated activity dot. |
| Developer | Recorded assignment, potentially an agent's rotating name. Missing assignment is “Not recorded,” not an inferred commit author. A queued story's published preparation assignment shows “Preparing” with its developer on the backlog card: an undertaking, not live activity, a Column, or readiness; unreadable or conflicting assignments stay visibly uncertain. |
| Agent roster / Assignment | The roster shows every agent of the rotation with the assignment its published profile records at the shown revision, opened from a card's portrait and left with “Back to stories”: one more view of the same snapshot, not a presence list. “Assignment” is the one term on cards, roster, and detail for what a published agent profile records: its task, activity, and recorded host and model. A read directory without the agent's profile shows “No assignment recorded”; an unread one, “Assignment unknown” with its reason; an unreadable profile, “Assignment uncertain.” Conflicting preparation assignments are named as conflicting records, never resolved by picking one. |
| Credited human / Human avatar | “Human developer: Name” is the committer of the commit that added the profile's current assignment, never a later commit author. Otherwise say “Human developer unknown” with why. It credits the assignment, not presence. Its avatar, or the name's initials, is decorative beside the name and never implies that the person or agent is online or working now. |
| Refinement / Slice plan | Separate facts, not obligatory sequential gates. Show “Refinement recorded” or “Plan recorded” only with evidence; otherwise distinguish absence from unreadable evidence. |
| Story Branch Mode | Show the recorded origin execution branch, not a guessed branch or the branch it was created from. Missing branch metadata is “Execution branch not recorded.” |
| Trunk Mode | Show the observed project's trunk ref. Absence of a story branch is expected, not an error. Missing mode is “Mode not recorded”; do not infer it from branch absence. |
| Completed slices | Use “2 of 5 slices recorded complete” on cards and detail alike, only for a known plan and supported completion records. Counts describe slices, not effort, elapsed time, or percentage of the story outcome achieved. |
| Current slice clock | Use “Current slice started 12 min ago”: time since the later of the last recorded plan update and the Take, not evidence that an agent is active. Avoid “running.” |
| Launch actions / Card sessions / Local Taken sessions / Recently done / Sessions sidebar | Follow the maintained [agent launch contract](../dashboard/AGENT-LAUNCH.md), [session history and navigation](../dashboard/AGENT-LAUNCH-HISTORY.md), and [terminal/local record actions](../dashboard/AGENT-LAUNCH-TERMINALS.md). Backlog cards offer execution and refinement; the project row offers an unattached session. Card sessions, local Taken sessions, Recently done, and the cross-project Sessions sidebar expose local launch and native-state evidence separately from published story facts; Recently done's done-story cards are published facts, read from the project's done records, that hold only this machine's marked-done sessions for that story. Open sessions stay inside their active Backlog/Taken card, or appear once as local Taken entries after published stories. Saved Done selects Recently done; native activity and Mark as read retain their separate meanings. The open Sessions sidebar also offers **Recently done sessions** and **Running Cursor sessions** as optional sections below its open session list, each collapsed on page load. Recently done sessions lists retained Done records across configured projects by newest completion, shows completion age (distinct from open-list launch age), and initially shows up to the newest 20. Running Cursor sessions says whether the Cursor runner is running, and each session it holds, as working, waiting for an answer, or at the follow-up prompt; choosing one opens that terminal. When the runner is down or unreachable, that list says so, shows nothing, and does not start an agent — live process status, not story progress. Expanded optional sections share one room owner with the open list: each preferred section keeps a disposable height the developer resizes within usable bounds, lists scroll independently, collapsing returns its room, expansion lasts across project/view changes and sidebar toggles within the page, and this browser keeps preferred sizes, not expansion, as disposable preferences across reloads, starting from an equal share where it keeps none or an unusable one. Keep attention visible without implying story completion or reordering entries when their state changes, except that the Sessions sidebar keeps sessions needing attention first, so an entry moves between those groups when its session starts or stops needing the developer; an unread report shows by its own mark and never moves an entry. Selection connects the session, story card, and the page's side panel: one multi-purpose region holding a single item at a time, a terminal, a Codex session's native final report, or a story's review ([story review](../dashboard/AGENT-LAUNCH-REVIEW.md)). Preserve keyboard focus and narrow-screen access. Closing a terminal detaches it; marking done and deleting a local record follow their distinct documented effects. Requested host/model/options describe intent, not observed execution. Startup and recovery follow the launch contract; these controls never establish published story state by themselves. |
| Refinement options | In the refinement dialog only, **Options** offer what the project's installed refinement skill defines: each option is named by its label, with its flag in code text and its one-line summary; options and focuses read as one list. An exclusive group is a set of radios with a first “No <group>” choice. The instruction hint “Sent after /dough-story-refinement <identity>” adds the selected flags in definition order. A project without usable options says why in one quiet line (“Reading options…” before the first sessions read), and Start still launches default refinement. Nothing is remembered, except that a refused launch's selection returns when the dialog reopens. A launch that selected options says “Options: --explore --borrow (requested)” on card and standalone session entries beside “Model: … (requested)”, what was asked and not what ran, and nothing when none were selected. [Agent launch](../dashboard/AGENT-LAUNCH.md) owns the rules. |
| Start (claim and workspace) | Pressing **Start** in the execution dialog first establishes the story's Take and workspace, then starts the session in that workspace. The dialog, its Model choice and every existing word stay, and its description adds that Start also publishes the story's Take to the project's trunk on origin and creates a workspace under the project folder's `.worktrees/`: pressing Start is the developer's authorization of that push. A project whose installed `dough-execute-plan` cannot continue from an established start starts as it did before, with no Take, workspace, or extra sentence. Its progress, and a claim that may or may not be published, follow [startup handoff](../dashboard/AGENT-LAUNCH.md#startup-handoff-and-reconciliation); the card stays in Backlog until origin shows it Taken. A start that could not be established says “Launch failed:” and why, with the story's owner when another agent holds it (“Taken by <Agent>”). A claim published but no session started says “Launch failed:” and “Taken by <Agent>; no session started. Workspace <folder>.” Because origin then shows the story Taken, that Taken card offers **Start execution** with the note “Started here, no session yet” for as long as this machine holds that start, and no other Taken card offers one; **Start** there opens the session in the kept workspace, never a second claim. A confirmed launch lists its session as before, and the entry's “Local: launched from this dashboard on this machine.” line also says “Workspace <folder>”. Nothing here is a story fact. |
| Execution complete | When the plan records its execution as complete with product advice, a Taken card uses “Execution complete, awaiting wrap-up” and “Completed 40 min ago” (time since the plan's last commit where its progress is read, the completion commit) in place of the current slice clock. A record without readable advice is shown as that gap, not as complete. It is not story closure. |

When no plan is recorded, say so instead of “0%” or “0 of 0.” If planless
execution is explicitly recorded, name it without treating it as missing work.
A slice without completion evidence has “No completion recorded,” not an inferred
running or failed status. All slices recorded complete does not itself establish story
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

For published story progress, explain once near its source summary that only
published changes are visible and those records do not establish current agent
activity. Qualify local session observations by their own source and meaning,
as the launch and session contracts describe. Avoid repetitive warnings on
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
| Initial source access fails | Explain the observed failure in plain language, identify the repository/ref when known, and direct the user to reload the page once access is restored. Do not imply the user needs to create stories. |
| No projects configured | Explain that no projects are configured and direct to System settings → Projects to add the first project. Keep settings reachable after the last removal. Do not substitute a guessed repository. |

## Visual and accessibility direction

Use quiet surfaces, readable typography, generous enough spacing for scanning,
and one restrained accent for links and selection. Story titles carry the most
weight; metadata is secondary but remains legible. Reserve warning/error styling
for evidence or retrieval problems, not unknown ownership or old timestamps.
Avoid decorative charts, percentage rings, avatars implying presence, and
unrelated looping animation. Use motion for the navigation and observed changes
above; the one decorative exception is an agent portrait's single hover gesture
in its enlargement, which never loops, implies presence, or carries meaning. Text must carry every status conveyed by color.

Keep Column headings and work groups semantic, links and controls keyboard accessible,
focus visible, and navigation order consistent with the visual reading order.
Name source links meaningfully. Announce refresh completion or errors without
moving focus; return focus to the originating story after closing detail.
Meet normal text contrast of at least 4.5:1 and control/focus contrast of 3:1.
Do not hide essential meaning in hover-only tooltips.

On narrow screens, keep controls and source status reachable. Keep the main
columns on one row and show the whole columns that fit; let the view pan to
focused work. In readable work content, wrap
long titles/refs and labeled facts; browser page zoom must not make controls
unreachable. Avoid page-wide horizontal scrolling: panning is contained within
the Board. Keep touch controls comfortably sized and do not require precise
clicks on tiny marks. Semantic reading order follows the groups and source order
regardless of card coordinates. Canvas, if selected, still owes equivalent
accessible work content and controls. Reading progress must work without
motion, color perception, or a pointer.

## Focused review and revision

Follow the [dashboard design review criteria](dashboard-design-review.md) for
review examples and the revision and retirement of this temporary guide.

## Launch dialog information hierarchy

The story launch dialogs now keep instruction, host/model, the Session group,
an always-visible effects line, and refinement options and Command details in
disclosures; `dashboard/AGENT-LAUNCH.md` and `dashboard/LAUNCH-START.md`
describe them. For the queued unattached Start session, follow the same
hierarchy and the same existing-changes confirmation rather than a second
dialog design, and validate it with long-title, narrow, and 200% zoom screens
before accepting implementation. Retire this topic when that dialog is
delivered.
