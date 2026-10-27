# Open Dough story dashboard

A locally launched page that shows the selected project's published work: the
near-future direction, the **Backlog** in priority order, and the **Taken**
stories and this machine's other open sessions, as connected Columns. **Start execution** and **Start refinement** on a
Backlog card ask Claude Code on this machine to execute or refine the story
(each launch dialog also offers a Model choice: Default, Fable, Opus, or Sonnet,
and a story's dialog [Session choices](LAUNCH-START.md#session-choices): One-shot
tracking, Default main with its existing changes, or Automatically land),
**Recently done** lists the stories recently done, from the done catalog and
records published beside the backlog, each holding this machine's marked-done
sessions for it, with the other marked-done sessions, newest first: the latest
ten, with older entries ten at a time on request and **Show latest 10** to
return ([session history](AGENT-LAUNCH-HISTORY.md#recently-done-range)). Open sessions whose
story is in Backlog or Taken appear only inside its card; all other open
sessions appear in Taken after the published stories. The **Sessions**
sidebar lists every project's open sessions, those needing attention first,
with compact title/elapsed rows on desktop and a separate **Session details**
disclosure for touch reading of the full title and session context. Its button
is badged with how many need attention.
**Open terminal** shows a launch's session beside the page, and **Mark as
done** records Done intent, renames the native session where supported and
stops native work. Quiet automatic completion follows the [published closure rule](AGENT-LAUNCH-COMPLETION.md)
for tracked execution, then uses the same Done operation while
preserving its reporting sender for acknowledgment ([Agent launch](AGENT-LAUNCH.md)).
**Start session** on the project actions row starts an ad hoc session in the
selected project's folder, with no story, listed in Taken and the Sessions
sidebar while open. Marking it done moves it to Recently done. Local session
operations preserve published story membership.

**Backlog**, **Taken**, and **Recently done** are three columns on one row.
A page at least 72rem wide shows all three side by side. A narrower page --
a narrow window, browser zoom, or the page beside an open Sessions sidebar or
side panel -- shows the whole columns that fit, two from 48rem and one below,
filling the page from Backlog. A slim Column paging control on a side with a hidden
column names the next one there and how many entries it holds ("Entry count
incomplete" while that column's entries are still being read), stays in sight
while the page scrolls, and moves the view one column with a brief slide (at
once when the system asks for reduced motion). Widening or narrowing the page
keeps the leftmost shown column where the width allows; the page never scrolls
sideways. Hidden columns stay in the reading and tab order: keyboard focus,
or a Sessions sidebar choice, landing in one moves the view to show it, while
starting a session leaves the view where it is. What counts is the column that
holds the item in the page, so a dialog opened from a card belongs to that
card's column wherever the window shows it; the focused item or chosen
card is brought into sight once its column has its full length again. This browser keeps that position, as it keeps the side panel's
width: a project switch or a reload shows the same columns, and a first visit
starts at Backlog. The page is only as long as the columns it shows, with its
ordinary framing and the Column paging controls' room: a taller hidden column adds no
blank stretch, and showing it makes all of it reachable again. Paging keeps
the vertical position while the newly shown columns reach it; where they are
shorter, the page stops at their bottom instead, without returning to the top.

The pinned banner keeps **Project** choices reachable while scrolling. Its selected
project disclosure shows repository/ref, full source revision, retrieval time
(not commit time), and publication warning. Close it to return room to the work,
especially at narrow widths or high browser zoom.

**Near-future direction** starts collapsed below the banner, opposite the
**Preparation badge legend** help control. Click its title or use Enter/Space to read the complete published direction (or its no-direction
explanation) beneath the whole row, under Start session and the help, which
stay in place; activate it again to collapse. A new read of the same project
preserves this choice, including after a failed read; selecting another project
starts collapsed. Opening or closing it makes no source request. What **Start
session** answers (a started session, startup progress, or **Launch failed** or
**Launch uncertain** with why) reads beside it on the row. Where the page shows
one column, as on a phone in portrait, the answer reads whole beneath **Start
session** and the help instead, above the opened direction, and the title keeps
its whole words.

The **?** control, named **Preparation badge legend**, opens the badge explanations
in a modal dialog. Card badges remain visible in the overview. Close or Escape
returns focus and the reading position to the help control; opening help makes
no source request. The dialog keeps Close reachable while its explanations scroll
at narrow widths or high browser zoom.

Observe one project at a time using the banner's tab-shaped **Project** choices.
The selected choice is highlighted; Tab reaches it and arrow keys switch projects.

Open **System settings → Projects** to add or remove projects and inspect their
repository and local checkout paths, including when the project list is empty.
[Project configuration](PROJECT-CONFIGURATION.md) describes validation, saved
order, environment-specific storage, removal and retained sessions.
**System settings → OpenAI** saves, replaces, or removes this machine's general
OpenAI access. [OpenAI access](OPENAI-ACCESS.md) covers private storage, shared
development/production credentials, and configured-versus-verified status.
**System settings → Terminal theme** chooses the colour theme for embedded terminals
(Default, Light, Solarized Dark or Solarized Light) and saves the choice at once
in `~/.open-dough/dashboard/terminal-theme.json`, which development and
production share on this machine. A failed save keeps the saved theme and offers
Retry; other open dashboard windows use a new choice after a reload.
**System settings → Feedback maintenance** turns on or off this machine's
standing authorization for the feedback maintenance cycle and chooses its host
and model. [Feedback maintenance](FEEDBACK-MAINTENANCE.md) explains its storage,
endpoints and what it does today.

On phone and tablet touch views, **Back to dashboard** remains reachable while
you scroll through the settings groups. Project dialogs keep their actions in
view while fields scroll; changing orientation or reducing visible height
preserves the form draft. Failed writes retain their existing explicit retry
and saved-setting behavior. Local checkout paths, credentials and theme choices
refer to the dashboard host machine. These local browser viewport checks do
not claim physical iOS keyboard or remote-connectivity validation.

[Published dashboard observation](PUBLISHED-OBSERVATION.md) describes local
`gh` authentication, pinned revisions, independent fact arrivals, automatic
refresh, bounded read gaps, recovery, and project switching. Only published
changes supply story facts; Taken records a claim, not current agent activity.

Each story card has scan and detail views. The scan starts with title, backlog
priority, and the assigned or preparing developer with its
credited human, tool and model, preparation and readiness badges, dependencies
and evidence warnings, a Taken story's slice count with its clock or
completion and a short source qualification, its launch group, its sessions, and its inspection group. The launch group holds
**Start execution** and **Start refinement**, each with any launch answer beside
it and any note in its tooltip; the inspection group holds **Inspect story** and, when
offered, **Review changes**. Each group's actions share a line when the card is
wide enough and wrap in reading order when it is not. Each action leads with a
decorative icon that says what it does: a play glyph for **Start execution**
and a pencil for **Start refinement**, noted or disabled alike; a chevron for
**Inspect story** that points right and turns down while the detail is open;
and a compare glyph for **Review changes**, which also ends with an arrow
toward the side panel. **Inspect story** opens
its detail from facts already read: full identity, purpose, what the
assignment records with its mode and branch context, preparation
explanations, the exact progress branch and revision, slice evidence, product advice, and source links; **Hide detail**
returns focus to the card. The dependency explanation opens in place from the
card's **Dependencies** summary (see
[Blocking story dependencies](#blocking-story-dependencies)).

[Agent assignments and roster](AGENT-ASSIGNMENTS.md) describes who holds or
prepares each story, the agent roster, and the credited human developer.

[Story preparation and progress](STORY-PREPARATION.md) describes readiness,
review changes, published slice progress, record navigation and accessible detail.

## Commands

See [dashboard commands and native prerequisites](COMMANDS.md).

Run `npm run dev:dashboard` for development at `http://127.0.0.1:43127/` and
`npm run watch:dashboard` for production at `http://127.0.0.1:4173/`, built in a
separate checkout from qualifying commits published on origin's `main`.
Development edits and hot reload never refresh or restart production. The
commands guide describes CI path filtering, failures, restoration and shutdown.

Development and production keep separate project lists but share machine-local
launch/session records, which survive production replacements and watcher shutdown.
Development testing can act on production's projects and records.

macOS session alerts come from Open Dough's own notification sender, which
shows the Open Dough icon and name. Set it up with
`npm run setup-notifier:dashboard -- --test` and choose Allow when macOS asks;
it needs a separately installed `terminal-notifier` 3.1 or newer (tested with
Homebrew 3.1.0 on macOS 26.6.2, `brew install terminal-notifier`), and
[Dashboard commands](COMMANDS.md) describes the setup. Its permission is
**System Settings → Notifications → Open Dough**. Restart the dashboard after
setting the sender up. The dashboard never sets it up or asks for permission.
A missing sender, unsupported helper, or refused delivery shows **Alerts unavailable**
in the open Sessions sidebar; sessions stay usable. Successful notification clears it.

Clicking a session alert opens this running dashboard in the default browser,
reusing and foregrounding an existing dashboard tab in Safari or Google Chrome.
If none matches this address, it opens a tab in an existing window, or opens a
window when needed. Allow browser control through the first click's macOS
prompt, or enable your default Safari or Google Chrome browser under
**System Settings → Privacy & Security → Automation → Open Dough**.
If access is refused, a dialog explains recovery. Open the dashboard manually;
after granting access, future notifications can reuse its tab.
The click selects its project and reveals/focuses the story by stable identity,
including after a cold open or reload. Receipt and dismissal do not navigate. The click
starts no agent work and opens no terminal. Ad hoc alerts open their project
without a story target. A stale target explains its absence; a stopped server
leaves the browser's connection failure. See [session alert behavior and
destinations](AGENT-LAUNCH-HISTORY.md) and [navigation](../docs/dashboard-navigation.md).

## Look and controls

The frame (banner, Sessions sidebar, terminal chrome, System settings,
dialogs, Column containers, and page states) draws on one shared foundation:
colour, type, spacing, radius, elevation, and control-size tokens on `:root` in
`src/styles.css`; `Icon` and `IconButton` in `src/Icon.tsx`, which wrap the
bundled `lucide-react` glyphs at one size and stroke and hide them from
assistive technology; and the frame button, field, and disclosure classes in
`src/frame-controls.css`. Extend these rather than adding another token set or
a component library. Light theme only.

Icon-only controls are kept for familiar frame actions (sessions, help,
settings, panel controls). Each keeps its accessible name and shows it, with
its shortcut where it has one, in a styled tooltip on hover and on keyboard
focus; the tooltip is hidden from assistive technology so the name is
announced once. A labelled button can show its accessible description in the
same tooltip (`FrameTooltip`), as a noted Start shows its note. Labelled
actions keep their text and may add a leading icon; a button that opens and
closes content in place (`aria-expanded`) leads with the frame disclosure's
chevron, turned while expanded.
Text meets 4.5:1 contrast; controls, icons, and focus outlines meet 3:1, checked
with the other icon-only requirements by `tests/frameIconControl.ts`.

## Open Dough identity

The accepted raw-dough mark (`assets/brand/`) identifies Open Dough, never a
project: as the browser tab, bookmark and touch icon (`index.html`, served by
`server/brandAssetPlugin.ts`); on macOS session alerts, through the sender in
[Commands](#commands); and as `ProductMark` (`src/ProductMark.tsx`, checked by
`tests/productMark.ts`), a passive image named “Open Dough” leading the
banner, the no-projects banner, and System settings, whichever project is
selected. The selected project's name, even Open Dough's, stays that project's
heading and source evidence. There is no web manifest or installable app.
Action glyphs, execution-mode symbols, host avatars, and human and agent
portraits keep their own concepts; prose-only documentation adds no artwork.

## Tests

`tests/` holds one Playwright suite that replaces only GitHub's answers to `gh`.
[Its README](tests/README.md) indexes the strategy, two tiers, check placement,
real and replaced boundaries, silence rule, and guides to journeys, synthetic
hosts, and proof records.

## GitHub requests

[GitHub requests](GITHUB-REQUESTS.md) lists each load and revision check's
requests and their cost to the launching person's API allowance.

## Blocking story dependencies

A story card with recorded dependencies offers an expandable **Dependencies**
section. Its summary shows the number blocking execution. Expand it in place to
read each supplier, sequencing reason, required implementation, completion
condition, and waiting, satisfied, or developer-decision state. Resolution links
open recoverable historical evidence; an unresolved decision shows its actual
question. Only the dependent card shows this relationship.

On a Backlog or Taken card the green **Ready for execution** badge means
start eligibility: the recorded readiness assessment is ready and no dependency is
unsatisfied. While dependencies block, "Blocked by N dependencies" takes its
place; a Not ready assessment stays visible beside it.

**Start execution** stays unavailable while any dependency is unresolved or its
canonical facts are loading or unreadable, with the reason beside the action.
Inspection and refinement stay available. Clearing one dependency leaves the
others visible; clearing all removes this block without overriding other start
requirements. An already accepted execution can continue. Expansion and refresh
preserve keyboard access, card position, and backlog order. The dashboard reads
published outcomes at the pinned revision; the actual start command checks
current canonical facts again before starting.

See the [dependency requirements](../docs/project-visibility-requirements.md#blocking-story-dependencies)
for meaning and lifecycle.
