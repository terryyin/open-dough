# Dashboard UX/UI North Star

**Status:** Temporary design direction for discussion and incremental development. **Updated:** 2026-09-30, for Start execution establishing its claim and workspace first.

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

1. Which stories are recorded, which are selected in the backlog, and which are Taken?
2. What is each story trying to achieve, and what refinement, planning, and
   slice completion have been published?
3. Who is assigned, if recorded, and where does this execution mode publish work?
4. What evidence supports this view, when was it retrieved, and what is unknown?

Do not require readers to interpret raw Git history to answer the ordinary questions.
Make the underlying records available when they need to verify an answer. Keep the
interaction observational: browse, inspect, refresh, and follow source links. A Backlog
card's **Start execution** and **Start refinement** ask Claude Code on this machine to
execute or refine the story and change no published fact. Assignment and reprioritization
stay outside this design. Zoom must not invent facts to answer these questions.

## Connected stages and spatial navigation

The [dashboard navigation guidance](dashboard-navigation.md) describes the pinned
banner, supporting disclosures, connected stages, and progressive spatial navigation.
It is part of this temporary design direction and carries the same authority.

## Animation explains change

When spatial navigation is introduced, animate viewport movement when focusing
work or returning to the overview, using short, interruptible transitions to
help preserve orientation. After a successful explicit refresh, motion can
explain observed placement or order changes for the same identity between the
previous and new snapshots. Start with a small transition if it clarifies that
change; continuous card travel between stages and an animation engine are not
first-story acceptance criteria. Apply the new facts as one coherent snapshot;
the transition illustrates that change, not an intermediate authoritative state.
Source links and controls remain usable.

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
| Developer | Recorded assignment, potentially an agent's rotating name. Missing assignment is “Not recorded,” not an inferred commit author. A queued story's published preparation assignment shows “Preparing” with its developer on the backlog card: an undertaking, not live activity, a stage, or readiness; unreadable or conflicting assignments stay visibly uncertain. |
| Agent roster / Assignment | The roster shows every agent of the rotation with the assignment its published profile records at the shown revision, opened from a card's portrait and left with “Back to stories”: one more view of the same snapshot, not a presence list. “Assignment” is the one term on cards, roster, and detail for what a published agent profile records: its task, activity, and recorded host and model. A read directory without the agent's profile shows “No assignment recorded”; an unread one, “Assignment unknown” with its reason; an unreadable profile, “Assignment uncertain.” Conflicting preparation assignments are named as conflicting records, never resolved by picking one. |
| Credited human / Human avatar | “Human developer: Name” is the committer of the commit that added the profile's current assignment, never a later commit author. Otherwise say “Human developer unknown” with why. It credits the assignment, not presence. Its avatar, or the name's initials, is decorative beside the name and never implies that the person or agent is online or working now. |
| Refinement / Slice plan | Separate facts, not obligatory sequential gates. Show “Refinement recorded” or “Plan recorded” only with evidence; otherwise distinguish absence from unreadable evidence. |
| Story Branch Mode | Show the recorded origin execution branch, not a guessed branch or the branch it was created from. Missing branch metadata is “Execution branch not recorded.” |
| Trunk Mode | Show the observed project's trunk ref. Absence of a story branch is expected, not an error. Missing mode is “Mode not recorded”; do not infer it from branch absence. |
| Completed slices | Use “2 of 5 slices recorded complete” on cards and detail alike, only for a known plan and supported completion records. Counts describe slices, not effort, elapsed time, or percentage of the story outcome achieved. |
| Current slice clock | Use “Current slice started 12 min ago”: time since the later of the last recorded plan update and the Take, not evidence that an agent is active. Avoid “running.” |
| Launch actions / Card sessions / Recent sessions / Sessions sidebar | Every Backlog card offers “Start execution” and then “Start refinement”, each opening a dialog headed “Start <workflow> in Claude Code” with an optional instruction and a Model choice (Default, Fable, Opus, or Sonnet, opening on Default each time, nothing remembered); Taken cards offer neither. A card not marked Ready for execution says “Not marked Ready for execution” beside Start execution, and a card already Preparing says “Being prepared” beside Start refinement. A confirmed launch lists its session on the story's card beside both actions, which stay, and the keyboard lands on that entry. Every Backlog and Taken card lists each of its story's sessions not marked done, newest first, whatever its stage, session state, or age; a Taken card lists them without offering a launch. A card entry is shown as a Recent sessions entry is, without the story's title and identity. A launch that did not start says “Launch failed” with why; one that may or may not have started says “Launch uncertain” and advises checking `claude agents`. The project actions row, under the banner, also offers “Start session” for the selected project, opening a dialog headed “Start a session in <Project> in Claude Code” with an optional, focused field “What would you like to talk about? (optional)” and the same Model choice; Start sends it, and Cancel or Escape sends nothing. A confirmed launch opens its session in the terminal at once, and a polite status says “Ad hoc session started”. It is not a card workflow: its session is listed as “<Project> · Ad hoc”, as an entry “Ad hoc session started in Claude Code” in Recent sessions and the Sessions sidebar, never on a card, with no story title or identity and no story fact changed. An unused session reads “Needs input”, as any blocked session does. Below the stages, “Recent sessions” lists launches newest first, including those marked done and those whose story is in no list. An entry whose launch chose a model also reads “Model: <Name> (requested)”, what was asked and not what runs, and nothing for Default. Each entry, except an ad hoc session's, names its story's title and identity, “<Workflow> started in Claude Code” with its launch time, its session id, and “Open terminal”, marked “Local: launched from this dashboard on this machine.” An entry, on a card or in Recent sessions, is local evidence of a launch, not a story fact, stage, or Take. Its session's state reads, from Claude Code's own state, “Needs input” with what it waits for when Claude Code says, “Ready for review” for a finished turn, “Session failed”, or “Session stopped”, each of which needs the developer and gives the entry a solid, heavier edge, without color alone or animation; or, needing nothing, “Working” (busy or idle between steps), “Session unavailable” without “Open terminal”, or “State unknown” with “Claude Code's session list could not be read”, which also offers a quiet “Delete record…” on a card or Recent sessions entry, never in the sidebar. Opening or closing a terminal leaves that attention in place; a later state that no longer asks for the developer, or marking the session done, clears it. A card whose listed sessions include any that need attention says “1 session needs attention” or “<N> sessions need attention” above them, in quiet text without color alone or animation, counting only its own project's unclosed sessions by that same reading and not unavailable or unknown ones; with none, it says nothing, and it never changes the card's stage, position, or facts. A session marked done reads “Done”, or “Working” while Claude Code says so, and needs no attention while it stays marked. Until the page first reads the machine's sessions, Recent sessions says “Reading sessions…”; with none kept, it says “No sessions launched from this dashboard are kept.” A “Sessions” button at the start of the pinned banner, before the project name, opens and closes the Sessions sidebar, as Command+B does page-wide, also from the terminal, where Ctrl+B still reaches the session, but not inside an open dialog; toggling leaves the keyboard where it is, except that closing with the keyboard inside the sidebar returns it to the button. The sidebar starts closed and stays as left across project switches, the agent roster, the terminal, and reloads, starting closed when the browser cannot keep it: on a wide window a fixed-width column left of the page, as tall as the window and scrolling on its own, with the terminal still on the right; on a narrow window it lies over the page from the left. It lists every session not marked done from every project, whichever is selected, newest launch first by launch time alone, so a state change never moves an entry; each names its story's title in at most two lines, “<Project> · <Workflow>”, “Launched” with its time, and its state in a card entry's words with the same heavier edge. Its heading “Sessions” says “1 session needs attention” or “<N> sessions need attention” across all projects by the card's rule, and nothing when none do; the closed button shows the same count as text. It says “Reading sessions…” before the first read, “No sessions launched from this dashboard are kept.” with none kept, and “No sessions launched from this dashboard are open.” when all are marked done; a session marked done leaves it. Each entry is one control named by its title, project, and workflow; opening it shows that project's stories (from the agent roster too, as one history entry that browser Back undoes), opens its session in the terminal as “Open terminal” does, with the keyboard there (an entry already shown there is not attached again; a “Session unavailable” entry opens none), and, once those stories are read, scrolls its story's card into view, or its Recent sessions entry when no card lists it, without animation under reduced motion. While the terminal shows a session, its card is outlined in the page's selection accent, its card and Recent sessions entries say “Shown in terminal”, and its sidebar entry is current; the marks move with the terminal's session and clear when it closes, and “Close” returns the keyboard to the entry, or to “Sessions” on a narrow window. On a wide window the sidebar stays open; on a narrow window opening an entry also closes it. Toggling it or opening an entry changes no story fact, stage, card position, or session. “Open terminal” shows that session in the page's one terminal: the page splits into two columns, the page on the left and the terminal panel on the right (above the page on a narrow window), whose toolbar names the story title, workflow, and session id and holds “Mark as done” and “Close”. What is typed there goes to the session, and the terminal's size follows the panel. Opening another session takes the panel's place and detaches the first, which keeps running; “Close” removes the panel and detaches only, so the session keeps running and still offers “Open terminal”. Switching projects keeps the terminal open on its session, and a reload closes it. When the connection drops, as when the dashboard server restarts, the panel says “Disconnected from the session” and offers “Reconnect”; when the attached CLI exits on its own, it says “The terminal ended” and offers “Open again”. Either attaches to the same session again, beside “Close”. “Mark as done”, in the panel and on each card entry, says “Marking as done…” in the panel, renames the session “done-<name>” in Claude Code when it can, stops it if Claude Code lists it or cannot read its list, and closes a panel showing it, or says “The session could not be marked done.”; the session leaves its card, and its Recent sessions entry shows “Done” with “Named done-<name>”. “Open terminal” on a Done entry reopens the session: once the terminal attaches, it is back on its card with its state and attention and no longer “Done”, until marked done again. “Delete record…” asks in place “Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.” with “Delete record” and “Keep”, the keyboard on “Keep”; Keep or Escape keeps the record and returns the keyboard to “Delete record…”. Confirming deletes only the dashboard's record: nothing is stopped, renamed, or marked done, and the conversation and any running session are untouched. The server reads the session's state again first and, when it is now known, keeps the record and the entry says “This session's state is now known”; a record that could not be deleted says “The session record could not be deleted.” with why, and leaves the question and the keyboard where they were. A deleted record leaves every list, also a Recent sessions entry, and a read of the sessions asked before cannot bring it back; a polite status says “Session record deleted”, the keyboard goes to the next entry in the list it was in, else to its card or Recent sessions, and a terminal showing the session closes. Opening or closing a terminal, or marking a session done or deleting its record, never changes a story fact. [Agent launch](../dashboard/AGENT-LAUNCH.md) owns which sessions a card, Recent sessions, and the Sessions sidebar list. |
| Start (claim and workspace) | Pressing **Start** in the execution dialog first establishes the story's Take and workspace, then starts the session in that workspace. The dialog, its Model choice and every existing word stay, and its description adds that Start also publishes the story's Take to the project's trunk on origin and creates a workspace under the project folder's `.worktrees/`: pressing Start is the developer's authorization of that push. A project whose installed `dough-execute-plan` cannot continue from an established start starts as it did before, with no Take, workspace, or extra sentence. The card's action reads “Preparing execution…” while the claim and workspace are established, then “Starting execution in Claude Code…”; a second page or reload shows the same while the server is still starting it. This is local progress: the card stays in Backlog until origin shows it Taken, and shows no “Taken” or agent until then. A start that could not be established says “Launch failed:” and why, with the story's owner when another agent holds it (“Taken by <Agent>”). A claim that may or may not be published says “Launch uncertain:” and the workspace and branch kept, and **Start execution** on the card resumes that same start. A claim published but no session started says “Launch failed:” and “Taken by <Agent>; no session started. Workspace <folder>.” Because origin then shows the story Taken, that Taken card offers **Start execution** with the note “Started here, no session yet” for as long as this machine holds that start, and no other Taken card offers one; **Start** there opens the session in the kept workspace, never a second claim. A confirmed launch lists its session as before, and the entry's “Local: launched from this dashboard on this machine.” line also says “Workspace <folder>”. Nothing here is a story fact. |
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
above; the one decorative exception is an agent portrait's single hover gesture
in its enlargement, which never loops, implies presence, or carries meaning. Text must carry every status conveyed by color.

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
