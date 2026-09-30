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

For developers choosing work in the Open Dough dashboard, selecting a story
should lead directly to an appropriately instructed agent session, without
repeatedly transferring context and coordinating startup. Published story facts
remain authoritative in origin. Local launch and session facts make the
interaction usable without pretending that an intended change is already
published.

The maintainer interview on 2026-09-28 established two benefits: convenient
launch and interaction, and reduced AI usage and uncertainty for mechanical
setup. Launch can deliver value first using the agent's existing workflow;
scripted preparation can follow incrementally. Execution of an existing plan
comes first because it is less likely than refinement to need immediate answers.
This decomposition selects a future direction, not immediate implementation or
a change to global backlog priority.

## Alternatives and Decision

- **Continue starting work manually in the CLI:** remains supported and usable,
  but requires the developer to carry the selected story and workflow context
  out of the dashboard. It does not deliver the desired starting experience.
- **Provide a prompt to copy:** cheaper than session launch and a possible
  fallback, but still makes the developer open and initiate the session. The
  user explicitly selected actual background launch as the first useful result.
- **Launch and let the agent perform its existing setup:** selected first. It
  tests whether dashboard initiation is useful without first relocating the
  entire coordination workflow.
- **Prepare everything in the dashboard before launching:** remains a later
  direction where tool and workspace constraints allow it. Requiring it first
  delays useful launch and interaction unnecessarily.
- **Defer the epic:** compatible with the existing smaller-work priority. There
  is no deadline or instruction to start execution from this interview.

## Agreed Boundaries

- Claude Code CLI first; develop the experience substantially there before
  adding Codex and Cursor. No graphical-app integration is required.
- Each target project already has a usable local project folder and an installed,
  authenticated tool. Installation and authentication flows are outside the
  first stories. Resolving which configured folder belongs to the selected
  project is part of launch refinement.
- The launch dialog selects an applicable skill and tool, uses the configured
  default model, and permits an optional custom prompt, normally empty.
  Relevant unavailable actions have an explanation. Introduce actual launch
  choices as their stories deliver them; the first story needs only planned
  execution and Claude Code.
- The first launch delegates all existing setup, workspace selection, claiming,
  bookkeeping, publication, and execution to the agent's normal workflow.
  Direct IDE/CLI instructions retain that complete path after scripting grows.
- Tool conventions govern workspaces. Prefer deterministic operations where
  possible, but do not prescribe dashboard worktree creation or require all
  preparation to precede tool launch.
- Initially launch and forget: report the dashboard's launch operation, then
  derive story progress from origin. No session monitoring, automatic question
  detection, or completion notification is required for that initial delivery.
  Story 3 adds a developer's explicit Mark as done, with its done-prefix name.
  Story 4 subsequently adds attention indicators from reported local session
  state; it does not establish story completion.
- Later embedded interaction exposes the ordinary CLI, opened manually.
  An embedded terminal (xterm.js was suggested) is the leading interaction
  direction, not a selected implementation dependency.
- Recent sessions initially include only dashboard-launched sessions. Preserve
  navigation independently of Backlog, Taken, and Recently done membership.
  A session may have no story in any of those views.
- Origin establishes published story outcomes. A stopped session or an absent
  story does not prove completion. If completion indicators are later added,
  criteria are workflow-specific: for example landed preparation or wrapped-up
  execution. Story Branch Mode's published branch evidence remains distinct
  from final integration on origin's trunk.

## Epic Reference

<a id="start-agent-work-from-dashboard"></a>

### Start agent work from the Open Dough dashboard

**Identity:** SEED-052#start-agent-work-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

The original identity remains a historical parent reference, covering the
child stories below. On 2026-09-28 the maintainer replaced its backlog
entry with these children at priorities 4–11, in their listed order. The parent
is no longer separately queued and is not redefined as the first child.

## Story Decomposition

The developer using the dashboard evaluates each story through its visible
journey. All effort bands remain unassigned: the repository supplies no S/M/L
definitions. Each story records its principal sizing uncertainty instead of
inventing a scale. These are candidates for refinement, not executable plans
or claims of readiness.

<a id="mac-human-attention-alert"></a>

### Alert the developer on Mac when a session needs human attention

**Identity:** SEED-052#mac-human-attention-alert
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/174-mac-human-attention-alert/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2513a95a6301ea31aef483484fde779ae3d50c8181876b269d2de4cd7ddfb573","plan":"b87713b1cf7f140dde9b3426cb45217c2e51f4c032ad450f4ac9ff86e727dc66"}}
```

- **Goal:** A developer using the dashboard on a Mac, working in another
  window or away from the screen, is told by the Mac itself that one of their
  sessions has stopped working and needs a look, and can tell which session,
  so they return promptly instead of watching the dashboard.
- **Scope:**
  - **Delivery.** When a session starts needing attention, the dashboard
    server on the developer's Mac raises a macOS system notification with a
    sound (`osascript` `display notification` with a sound name). The
    notification names the project and the session's title, as the dashboard
    does, and what it needs: the entry's label, with what a blocked session
    waits for when Claude Code says. It works while the dashboard server runs,
    with the page's tab in the background or closed, and does not depend on the
    page's own refreshing. Clicking the notification does not return the
    developer to the session; they find it in the dashboard.
  - **Which sessions alert.** Every session the dashboard recorded that is not
    marked done, on entering any reading other than Working: Needs input,
    Ready for review, Session failed, Session stopped, Session unavailable, State
    unknown, and a state the dashboard does not recognise. Terry's decision on
    2026-09-30: the host's state cannot yet tell "needs an answer" from "finished
    its turn" or "cannot be read", so all are worth an alert. A session marked
    done never alerts. The existing "needs attention" count on cards is unchanged
    and is not the alert rule.
  - **No repeats.** A session alerts once when it enters a reading and not
    again while it stays in that reading, or on a page reload or server restart
    that finds it still there. It alerts again after it returns to Working and
    then leaves it. A changed `waitingFor` under the same reading does not
    alert again.
  - **First observation.** Sessions already needing attention when the server
    starts, or first sees them, do not alert: the alert reports a change the
    developer has not yet been told of.
  - **Availability.** Only on macOS. Where it cannot alert (another operating
    system, `osascript` missing, or macOS refusing notifications), the
    dashboard says "Alerts unavailable" with the reason, quietly, near the
    Sessions list, and everything else works as before. A muted Mac or a
    Focus mode that hides the notification is the developer's setting and is
    not detected. Other operating systems are outside this story.
  - **Not included:** an on/off control for alerts, click-to-open, a
    reminder after some minutes, Web Notifications from the page,
    `terminal-notifier`, alerts for sessions the dashboard did not start, and a
    signal telling an unused idle session, a finished turn, and a question apart.
    An alert does not establish story completion or change any story, card or
    published fact.
- **Key examples:**
  - A story session is working, and the developer is in another app. It asks a
    question and Claude Code lists it `blocked` → a notification with a sound
    says "Open Dough · <session title> — Needs input" with what it waits for.
  - It stays blocked for ten minutes and the developer reloads the page →
    nothing more sounds.
  - The developer answers, it works, then blocks again → a second alert.
  - A session finishes its turn and Claude Code lists it `done` → "Ready for
    review" alerts once.
  - A session fails or is stopped → "Session failed" or "Session stopped"
    alerts once.
  - Claude Code's listing cannot be read → one alert per session not already
    in that reading, each "State unknown". When it is readable again and a
    session is Working, then the listing fails again, they alert again.
  - The developer marks a session done and its process ends → no alert for
    "Session unavailable".
  - A session started with no text is idle, listed `blocked` → it alerts
    "Needs input" once, as the existing reading says of it.
  - The server starts and finds a session already blocked → no alert; it is
    shown as Needs input as before.
  - The dashboard runs on Linux, or macOS refuses notifications → no alert
    and "Alerts unavailable" with why.
- **Open questions:** None blocking. Proposed: a failed listing alerts once
  per affected session, so many sessions produce many notifications; a single
  combined notification would be a later refinement if it proves noisy. Terry
  may decide otherwise.
- **Depends on:** Existing dashboard session-state observation, which the page
  drives today by its own refreshing; the alert needs the server to observe
  session state itself, which planning decides how to do. No other story.
- **Capture:** Terry requested this as a queued story on 2026-09-30, extending
  the earlier notification deferral; it does not authorize implementation. On
  the same day he chose a macOS notification with a sound fired by the
  dashboard server, once per entry into a reading, and, because the host's
  state cannot yet distinguish the cases, alerts for every reading other than
  Working, plus an "Alerts unavailable" note; an on/off control is deferred.

<a id="start-ad-hoc-project-session"></a>

### Start an ad hoc session in a project from the dashboard

**Identity:** SEED-052#start-ad-hoc-project-session
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/172-start-ad-hoc-project-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84aa483829eb30e6c5339e2215d2217c270e7e6381c6fb42b3782319b8b3b5f2","plan":"dcc602f1065b55485e3dddc65ebdbd2f54609b8cc229d6a4f916f2a614bebc2a"}}
```

- **Goal:** A developer looking at a project in the dashboard can start a
  general conversation or task with Claude Code in that project's folder in one
  step, without choosing a story or skill, and is talking to it at once. The
  session stays findable afterwards without a story.
- **Scope:**
  - **Where it starts.** A "Start session" button on the project actions row:
    the line under the banner that holds Near-future direction and the ? help,
    at its opposite end. It belongs to the selected project, is visible without
    scrolling, and changes with the project choice. It is offered on every
    project, always, unlike story actions, which need a story. Story cards and
    their Start execution and Start refinement are unchanged.
  - **Dialog.** Pressing it opens a modal dialog headed "Start a session in
    <Project> in Claude Code", built like the story launch dialogs (Escape or
    Cancel sends nothing, the keyboard starts in the text field, "Starting…"
    while it waits, the same length limit). It says Claude Code starts a
    background session on this machine, in this project's folder, with no story
    or skill. Its one field is "What would you like to talk about? (optional)",
    with Start enabled when it is empty. The dashboard chooses no model, as for
    story launches.
  - **What runs.** `claude --bg --name "<Project> · Ad hoc · <label>"` in the
    project's folder, with the developer's text as the instruction exactly as
    typed, and no skill command or story identity. With no text it passes no
    instruction: observed on 2026-09-30, Claude Code starts an idle session
    ("idle — send a prompt to start") and lists it `blocked`. It confirms the
    session in Claude Code's listing as story launches do.
  - **Name.** `<label>` is the text's opening, whitespace collapsed to one
    line and cut at about 40 characters with an ellipsis; with no text, or one
    holding a control character, it is the launch time, such as "30 Sep, 14:32".
    Mark as done's `done-<name>` rename works from that name unchanged.
  - **After a confirmed launch.** The session opens in the page's terminal at
    once, with the keyboard there, because the developer started it to talk;
    a polite status says "Ad hoc session started". Nothing scrolls the page.
  - **Launch problems.** A failed launch says "Launch failed" with why, and an
    uncertain one "Launch uncertain" with the advice to check `claude agents`,
    both beside the Start session button, which stays. The dialog closes and
    the keyboard returns to that button.
  - **Finding it again.** No story card lists it. It appears in Recent sessions
    and the Sessions sidebar, newest first like every entry. Its title line is
    its `<label>`; there is no story identity line; its workflow line reads
    "Ad hoc session started in Claude Code" (sidebar: "<Project> · Ad hoc").
    State, attention, Open terminal, Mark as done, Done marking, reopening,
    Delete record, and reload persistence work as for any entry. Opening its
    sidebar entry shows its project, opens it in the terminal, and scrolls its
    Recent sessions entry into view, as for a session whose story is in no list.
  - **Unused sessions.** A session started with no text is idle and Claude
    Code lists it `blocked`, which the dashboard reads as "Needs input". The
    intent was that a still-unused session not count as needing attention.
    Observed live on 2026-09-30 (Claude Code 2.1.285): its listing entry is
    `status: "idle"`, `state: "blocked"`, no `waitingFor`, no turn count,
    the same as a session blocked on a question, so nothing readable tells
    them apart. The existing reading therefore applies and the documents say
    so; adding a signal to do better is a decision for Terry, not part of
    this story.
  - **Not included:** choosing a model (SEED-052#choose-session-model adds it to
    this dialog later), choosing a skill or tool, attaching the session to a
    story afterwards, renaming it, starting one from a story card, several
    sessions at once beyond what launches already allow, and any session the
    dashboard did not start. No story fact, stage, card position or published
    record changes.
- **Key examples:**
  - Open Dough is selected, and the developer presses "Start session", types
    "why is the CI slow on main?" and presses Start → Claude Code starts
    "Open Dough · Ad hoc · why is the CI slow on main?" in `~/git/open-dough`
    with that text as its first message → the terminal panel opens on it with
    the keyboard in it, and the status says "Ad hoc session started".
  - The same with the field empty → an idle session named "Open Dough · Ad hoc
    · 30 Sep, 14:32" opens in the terminal, ready for the first message.
  - The developer switches to Pygardon, and presses "Start session" → the
    dialog names Pygardon and the session starts in `~/git/pygardon`.
  - Later, on the page with the terminal closed → Recent sessions lists
    "why is the CI slow on main?" with "Ad hoc session started in Claude Code",
    its launch time, session id and Open terminal, and the Sessions sidebar
    lists it under "Open Dough · Ad hoc"; no card lists it, and no Backlog or
    Taken card changes.
  - The developer opens its sidebar entry while another project is selected →
    that project's page shows, the terminal opens on the session, and its
    Recent sessions entry is scrolled into view.
  - The developer marks it done → it leaves the sidebar, and its Recent
    sessions entry reads "Done" with "Named done-<name>", as for any session.
  - Escape or Cancel in the dialog → nothing starts, and the keyboard returns
    to "Start session".
  - `claude` is not installed, or the folder is untrusted → "Launch failed"
    with why, beside the button; no entry appears.
  - A text of only spaces → no instruction is sent and the label is the
    launch time; a text with a line break → the label reads its opening
    across the break as one line, and the whole text is sent as typed.
- **UI:** The button is an ordinary, quiet button labelled "Start session" with
  the selected project in its accessible name ("Start session in <Project>"),
  large enough to match the launch controls' size, focus and contrast, and
  never animated. The dialog reuses the story launch dialog's layout and styles,
  one text field, "Start" and "Cancel", the keyboard on the field. The terminal
  panel's toolbar names the session by its label, "Ad hoc", and its session id,
  where story sessions name a title and workflow. Under reduced motion, and
  without it, nothing animates. On a narrow window the row wraps beneath the
  direction disclosure and the button keeps full touch size.
- **Open questions:** None blocking. Terry's decision: accept "Needs input"
  for an unused empty session (see Unused sessions), or ask for a signal.
- **Depends on:** The existing dashboard session launch and interaction;
  choosing a model is a separate outcome, not a prerequisite.
- **Capture:** Terry requested this as the first queued story on 2026-09-30,
  and on the same day chose the project actions row, an optional prompt with
  the terminal opening at once, and "Ad hoc" plus the prompt's opening as the
  name. Update the [North Star](../../docs/dashboard-ux-ui-north-star.md) and
  [Agent launch](../../dashboard/AGENT-LAUNCH.md) when this delivers.

<a id="choose-session-model"></a>

### Choose the model when starting a session

**Identity:** SEED-052#choose-session-model
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/173-choose-session-model/PLAN.md","assessment":"not-ready","reasons":["Decisive premise 1 is unsettled: the ad hoc story's launchSubject, request union and shared LaunchDialog, which slices 1-4 build on, are not on trunk yet (SEED-052#start-ad-hoc-project-session is Taken, unpublished). Re-read those files once it lands, then record ready."],"basis":{"document":"b772daa37e833248ca89c32e8123fb5561168fd524da6b96886aa73281bf95d2","plan":"b1086138c6fa85dad4bd5f8be1494c9cec17458d48d54f9511f159352a5e2c81"}}
```

- **Goal:** A developer starting a Claude Code session from the dashboard can
  choose the model that suits the work at launch time, and later see which
  model they asked for, instead of accepting whatever their Claude Code
  settings default to or changing it after the session has begun.
- **Scope:**
  - **Where.** Every launch dialog: "Start execution", "Start refinement" and
    the project's "Start session". Each gains one labelled choice, "Model",
    placed after the instruction field and before Start, in the dialogs' shared
    layout and styles. The keyboard still starts in the text field.
  - **Choices.** "Default (your Claude Code setting)", then Fable, Opus and
    Sonnet, in that order after Default. They are Claude Code's aliases
    (`fable`, `opus`, `sonnet`), which follow the latest model of each family,
    so the list needs no upkeep as models change. The dashboard offers no
    free-text model name and no Haiku.
  - **Default.** Each dialog opens on Default, every time: the dashboard
    remembers no earlier choice. Default passes no model, so the command is
    exactly today's and the developer's own Claude Code settings apply.
  - **What runs.** A chosen model adds `--model <alias>` to the same
    `claude --bg --name ...` command. Nothing else about the command, name,
    instruction, project folder or confirmation changes. Effort, permission and
    other options stay unchosen.
  - **Seeing the choice.** The launch record keeps the requested alias. A
    session entry, wherever it is listed (story card, Recent sessions,
    Sessions sidebar), shows "Model: Opus (requested)" when a model was chosen
    and nothing when Default was used, because Default requests nothing. It
    states what was asked, not what Claude Code is running: Claude Code's
    session listing reports no model. The choice survives reload and dashboard
    restart like the rest of the record.
  - **Problems.** A refused, failed or uncertain launch is explained as launches
    already are, beside its own action, and no model line appears for a session
    that was not listed. If Claude Code rejects the model, the failure says so.
    Selecting a model does not check availability beforehand.
  - **Not included:** free-text or full model names, Haiku or any other
    alias, effort or permission choices, changing a running session's model,
    remembering the last choice, showing the model Claude Code actually runs,
    model choice for Codex or Cursor, models for sessions the dashboard did not
    start, and any story fact, stage or published record.
- **Key examples:**
  - Start refinement on a story, choose Opus, press Start → the session starts
    with `claude --bg --name "<Project> · Refinement · <title>" --model opus`
    and the instruction as before; the story's card entry reads "Model: Opus
    (requested)" beside its workflow line.
  - The same with Default left unchanged → the command has no `--model`, and
    the entry shows no model line.
  - Start session (ad hoc) with Sonnet and no text → an idle session opens in
    the terminal as before, and its Recent sessions entry reads "Model: Sonnet
    (requested)".
  - Choose Fable in a dialog, press Cancel or Escape, then open any dialog →
    nothing starts, and that dialog shows Default.
  - Start execution with Opus, then start execution again without changing the
    dialog → the second dialog opens on Default; the two entries read "Model:
    Opus (requested)" and no model line.
  - Choose Opus, launch, reload the page → the entry still reads "Model: Opus
    (requested)".
  - Claude Code refuses the model (for example, one the account cannot use)
    → "Launch failed" with why, beside the action; no entry appears.
  - Manual observation, once at delivery: launch with Opus and confirm in the
    session's own terminal (`/status` or the model shown by Claude Code) that
    it is running Opus.
- **UI:** The dialogs gain one native single-choice control, labelled "Model",
  reachable by keyboard in the dialogs' tab order after the instruction field,
  large enough to match the other launch controls' size, focus and contrast,
  and never animated. Each choice is named in words. The entry line is quiet
  secondary text in the entry's existing metadata style. Wording follows the
  dashboard's existing terms.
- **Open questions:** None blocking. Not yet observed: exactly how
  `claude --bg --model <alias>` reports an unavailable model (rejects at launch
  or fails after the session starts). Observing it starts a paid session, so
  it is a manual check at planning or delivery; if the rejection is not
  visible at launch, the entry's honest "(requested)" wording already covers it.
- **Architecture:** The three dialogs differ only in their words and subject;
  they share one launch domain (subject, host, launch options, record) and the
  model belongs to it once, not to each dialog. The design is recorded in the
  [North Star](../../docs/dashboard-ux-ui-north-star.md#launch-domain-design-not-yet-built),
  not an ADR: it is dashboard-internal and no Accepted ADR constrains it. This
  story delivers it: if the ad hoc story's `launchSubject`, request union or
  shared dialog do not yet give those seams cleanly, the plan begins with
  Structure slices that make them so, proven by unchanged behavior, before the
  model Behavior slices. Copying the option into each dialog, or structure
  that leaves the launch domain less cohesive than the North Star describes,
  is a defect of this story's delivery.
  On delivery, remove that section from the North Star, since the code then
  explains it; write a design document only for a decision the code cannot
  explain.
- **Depends on:** Existing dashboard session launch, and the ad hoc project
  session (SEED-052#start-ad-hoc-project-session), which is Taken and not yet
  on trunk: its `launchSubject`, request union and shared dialog are this
  story's foundation. Plan and start this story only after that one has landed
  on trunk, and re-read those files then rather than trusting this design's
  names. Update [Agent launch](../../dashboard/AGENT-LAUNCH.md), which says
  launches pass no model, and the
  [North Star](../../docs/dashboard-ux-ui-north-star.md) when this delivers.
- **Capture:** Terry requested this as the second queued story on 2026-09-30.
  This selects model choice for future work, extending the earlier default-model
  boundary and deferral recorded above; it does not authorize implementation.
  On 2026-09-30 Terry chose Default plus Fable, Opus and Sonnet aliases, all
  three dialogs, a "requested" display on session entries, and no remembered
  choice, and asked that the three dialogs' overlap be one clear launch
  domain with the architecture mapping to it directly, strengthened by this
  story rather than copied into.


<a id="announce-record-deletion-first-time"></a>

### Announce a deleted session record to screen readers the first time

**Identity:** SEED-052#announce-record-deletion-first-time
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using a screen reader hears "Session record
  deleted" after the first deletion in a page visit, not only after later ones.
- **Evaluation:** With a screen reader, open the dashboard, delete a session
  record whose state is unknown, and hear the status; the page keeps exactly
  one polite status region its keyboard and overview specs can rely on.
- **Boundary:** Applies to the status the delete announces today, which appears
  only after the first deletion and so may go unspoken. Routing it into the
  page's existing always-present polite region needs that region's state lifted
  and the single-region locators in `accessible-overview-keyboard.spec.ts` and
  `dashboard/tests/dashboardPage.ts` changed with it. Other announcements stay
  as they are.
- **Depends on:** None; the delete is delivered.
- **Capture:** Terry asked on 2026-09-30 to queue the follow-up recorded by the
  delete's execution retrospective.

<a id="split-session-entry-and-terminal-split"></a>

### Split the session entry and terminal split files along their operations

**Identity:** SEED-052#split-session-entry-and-terminal-split
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A maintainer changing session entries or the terminal panel
  works in files small enough to read whole, one concern each.
- **Evaluation:** `dashboard/src/SessionEntry.tsx` (about 300 lines) and
  `dashboard/src/TerminalSplit.tsx` (about 275 lines) each hold one clear
  concern after the change, with every dashboard spec passing unchanged and no
  behavior differing.
- **Boundary:** Structure only, along the seams the delete work exposed
  (Mark as done, Delete record, the shared status line, and the panel's session
  operations). No new behavior, wording or styling.
- **Depends on:** None.
- **Capture:** Terry asked on 2026-09-30 to queue the follow-up recorded by the
  delete's execution retrospective.

<a id="script-execution-preparation"></a>

### 5. Start execution with mechanical preparation already handled

**Identity:** SEED-052#script-execution-preparation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer launching planned execution spends less agent time
  and usage on routine coordination, with a predictable handoff.
- **Evaluation:** Start execution; deterministic tooling performs the applicable
  preparation and published claim steps, and the agent continues using their
  established results without creating duplicate claims or workspaces. Starting
  the equivalent task directly in the CLI still performs the whole workflow.
- **Boundary:** Respect tool workspace conventions; place scripted steps where
  the chosen workspace is known rather than requiring all setup before launch.
  Show local preparation/publishing progress alongside the last published facts.
  A failed or uncertain preparation/launch leaves an understandable recoverable
  result and must not be represented as successful execution. Concurrent starts
  must respect existing ownership.
- **Value / learning:** Tests actual reduction in agent setup and uncertainty
  without creating two competing startup workflows.
- **Effort hypothesis:** Unestimated; handoff, ownership, publication recovery,
  and tool-selected workspace ordering are consequential uncertainties.
- **Depends on:** The dashboard launch and existing shared execution coordination tooling;
  stories 2–4 are ordering preferences, not technical prerequisites.
- **Safe stopping point:** Planned execution has deterministic preparation while
  refinement and direct CLI startup continue through their existing paths.

<a id="script-refinement-preparation"></a>

### 6. Start refinement with mechanical preparation already handled

**Identity:** SEED-052#script-refinement-preparation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer beginning refinement avoids repeated agent-led
  workspace and preparation-assignment bookkeeping.
- **Evaluation:** Launch refinement; deterministic tooling establishes the
  applicable preparation facts and hands them to the agent, which starts useful
  investigation and discussion without repeating setup. Direct CLI refinement
  still prepares itself.
- **Boundary:** Preparation remains distinct from Taken and human acceptance.
  The dashboard shows pending local operations without asserting publication;
  failure and retry preserve ownership and avoid duplicate assignments. Workspace
  handling follows the tool. Do not automate refinement judgments or acceptance.
- **Value / learning:** Extends the setup benefit to conversational work while
  testing its different lifecycle rather than treating refinement as execution.
- **Effort hypothesis:** Unestimated; preparation handoff and recovery are the
  main uncertainties; reuse execution's proven common behavior where applicable.
- **Depends on:** The dashboard's refinement launch
  ([Agent launch](../../dashboard/AGENT-LAUNCH.md)) and existing preparation
  tooling. Story 5 offers reuse
  and learning but is not established as a required product prerequisite.
- **Safe stopping point:** Both selected workflows reduce setup overhead without
  requiring completion monitoring or support for another tool.

<a id="use-codex-from-dashboard"></a>

### 7. Use Codex for the established dashboard workflows

**Identity:** SEED-052#use-codex-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who prefers Codex can use the dashboard launch,
  return, and interaction experience already established with Claude Code.
- **Evaluation:** Choose Codex and its default model for a supported workflow;
  start it, find its session later, and interact through its CLI in the dashboard.
  Applicable scripted preparation is consumed without duplicate setup; direct
  CLI work remains possible.
- **Boundary:** Verify actual Codex behavior rather than infer parity from Claude
  Code. No desktop-app connection, model picker, or non-dashboard session discovery.
- **Value / learning:** Makes tool choice real for Codex users and tests how much
  of the established experience transfers.
- **Effort hypothesis:** Unestimated; launch/attach continuity and workspace
  conventions require a feasibility observation before planning or further split.
- **Known from launch:** The browser still spells out Claude Code specifics:
  `claude attach`, the uncertain launch's `claude agents` advice,
  `/dough-execute-plan`, and the host label. It also interprets Claude Code's
  session `state` and optional `waitingFor` in one reading
  (`dashboard/src/sessionShown.ts` `sessionShown`), and the page reads the host's listing again every 15 seconds; Claude Code's answered
  in about 0.16 s with 469 sessions. A second host moves these behind the host
  module and observes whether its listing is as quick and tells running from
  exited sessions. Claude Code's server code now spans `claudeCode.ts` (every
  `claude` argument array) and `claudeLaunch.ts` (session name, instruction,
  and reading `--bg`'s output), so the North Star's "one module per host"
  needs Terry's decision before a second host is refined.
- **Depends on:** The chosen Claude Code experience; no dependency on Cursor.
- **Safe stopping point:** Claude Code and Codex remain independently usable.

<a id="use-cursor-from-dashboard"></a>

### 8. Use Cursor for the established dashboard workflows

**Identity:** SEED-052#use-cursor-from-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who prefers Cursor can use the established dashboard
  workflows with its CLI and configured default model.
- **Evaluation:** Choose Cursor for a supported workflow, launch, find the session
  later, and interact through the embedded CLI with the correct project context
  and applicable preparation handoff.
- **Boundary:** Prove Cursor launch, persistence, attachment, and workspace behavior
  independently. Preserve direct CLI startup; no graphical-app integration.
- **Value / learning:** Completes the intended three-tool choice without claiming
  one tool's integration proves another's.
- **Effort hypothesis:** Unestimated; the same end-to-end feasibility question as
  Codex must be observed on Cursor before planning or further split.
- **Known from launch:** The same Claude Code specifics as story 7 live in the
  browser, including its session-state vocabulary and the 15-second listing
  read.
- **Depends on:** The chosen Claude Code experience; no dependency on story 7.
- **Safe stopping point:** Each delivered tool remains usable if later parity
  enhancements are dropped.

<a id="reconcile-recently-done-and-sessions"></a>

### Review recently done stories alongside their available sessions

**Identity:** SEED-052#reconcile-recently-done-and-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer can understand recent completed product work and
  revisit its conversations without losing sessions outside visible story lists.
- **Evaluation:** A story with published completion evidence becomes reachable
  in Recently done with its supporting evidence and any known dashboard-launched
  sessions. Recent sessions remains independently accessible, including sessions
  whose stories are in none of Backlog, Taken, or Recently done. One story can
  link multiple sessions. Mere disappearance from the backlog proves nothing.
- **Boundary:** Separate published story facts from local session facts. Session
  stopping does not establish completion. No discovery of externally started
  sessions is included. The completion evidence and meaning of recent require
  refinement before this candidate can be selected for execution planning.
- **Value / learning:** Tests a reconciled view while preserving both histories
  and their different coverage.
- **Effort hypothesis:** Unestimated; reconstructing or recording authoritative
  completion and defining the recent window are unresolved.
- **Depends on:** Published story completion evidence and story 2 for session
  links; not a prerequisite for launch, Recent sessions, or embedded interaction.
- **Safe stopping point:** Recent completed work and available conversations are
  reviewable even without automatic attention notifications.

This related outcome was explicitly valued in the interview but its priority
relative to the launch epic was not selected. It stays here as one canonical
unqueued candidate rather than disappearing from the discussion or being
silently added to the launch critical path.

## Ordering and Scope Reduction

Stories 2 and 3 make return and interaction useful; refinement launch and
embedded answers are already available. Story 4 now adds attention indicators
so the developer can notice when to return, after story-session links support
the same signal on cards.
Recent-session navigation can be delivered alongside terminal interaction if
refinement shows that separate delivery adds no useful stopping point; neither
requires the Recently done view.

Interaction has a slight, explicitly provisional priority over scripted setup.
Stories 5 and 6 may interleave with stories 2–4 when use reveals more value in
reducing setup overhead. The user authorized going far with Claude Code first.
Stories 7 and 8 follow that learning, with their mutual order unselected; each
is a separate user outcome, not a generic adapter task. Reassess their breadth
once the Claude experience and each tool's feasibility are known.

For scope reduction, defer tool expansion first, then further scripted setup;
retain launch and useful interaction in Claude Code. If embedded interaction is
too costly, retain launch and recent-session access through the external CLI,
which the dashboard's refinement launch already provides. Story 4 selects
local attention indicators; completion callbacks, notifications, state-aware
skill selection, model selection, other skills, externally started sessions,
and full project/tool setup remain deferred.
Recently done is related work with its own value and priority decision.

## Open Decisions Before Refinement or Planning

- Define project S/M/L bands before assigning comparative estimates; none were
  found, so there is no defensible numerical or band distribution yet.
- Observe real attachment/reconnection for the embedded terminal; decide its
  smallest usable presentation then, without requiring question detection.
- Select the next story after the first launch from real use. Interaction's
  priority and the order of Codex versus Cursor are not fixed commitments.
- Refine authoritative completion evidence and the recent window separately for
  Recently done; do not infer completion from an absent backlog entry.

## When to Surface

The maintainer selected the eight child stories for backlog priorities 4–11
on 2026-09-28, replacing the original epic entry. The related Recently done
candidate remains unqueued. This selection does not Take any story or authorize
implementation; refinement and executable planning are later selections.

## Breadcrumbs

- Maintainer interview in this chat, 2026-09-28: Claude Code first, launch before
  setup relocation, default model, optional prompt, manual native terminal
  interaction, slight priority for interaction, independent recent sessions and
  recently done stories, and existing local project/tool setup assumed.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current dashboard behavior](../../dashboard/README.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [Dashboard UX/UI direction](../../docs/dashboard-ux-ui-north-star.md).
