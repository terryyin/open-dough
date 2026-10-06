# Open Dough story dashboard

A locally launched page that shows the selected project's published work: the
near-future direction, the **Backlog** in priority order, and the **Taken**
entries, as connected stages. **Start execution** and **Start refinement** on a
Backlog card ask Claude Code on this machine to execute or refine the story
(each launch dialog also offers a Model choice: Default, Fable, Opus, or Sonnet,
and a story's dialog [Session choices](LAUNCH-START.md#session-choices): One-shot
tracking, Default main with its existing changes, or Automatically land),
**Recently done** lists the stories recently done, from the done records
published beside the backlog, each holding this machine's launches for it,
with the other launches, newest first, the **Sessions**
sidebar lists every project's open sessions, those needing attention first, each one line of title and elapsed time, its button badged with how many need attention,
**Open terminal** shows a launch's session beside the page, and **Mark as
done** records Done intent, renames the native session where supported and
stops native work. Quiet automatic completion uses the same Done operation while
preserving its reporting sender for acknowledgment ([Agent launch](AGENT-LAUNCH.md)).
**Start session** on the project actions row starts an ad hoc session in the
selected project's folder, with no story, listed in Recently done and the
Sessions sidebar.

**Backlog**, **Taken**, and **Recently done** are three columns on one row.
A page at least 72rem wide shows all three side by side. A narrower page --
a narrow window, browser zoom, or the page beside an open Sessions sidebar or
side panel -- shows the whole columns that fit, two from 48rem and one below,
filling the page from Backlog. A slim edge control on a side with a hidden
column names the next one there and how many entries it holds, stays in sight
while the page scrolls, and moves the view one column with a brief slide (at
once when the system asks for reduced motion). Widening or narrowing the page
keeps the leftmost shown column where the width allows; the page never scrolls
sideways. Hidden columns stay in the reading and tab order: keyboard focus,
or a Sessions sidebar choice, landing in one moves the view to show it, while
starting a session leaves the view where it is. This browser keeps that position, as it keeps the side panel's
width: a project switch or a reload shows the same columns, and a first visit
starts at Backlog.

The pinned banner shows the selected project in a disclosure and keeps the configured
**Project** choices reachable while scrolling. The disclosure opens the repository/ref, full
source revision, retrieval time (not commit time), and publication warning.
Close that disclosure to return space to the work, especially at narrow widths
or high browser zoom.

**Near-future direction** starts collapsed below the banner, opposite the
**Preparation badge legend** help control. Click its title or use Enter/Space to read the complete published direction (or its no-direction
explanation), then activate it again to collapse. A new read of the same project
preserves this choice, including after a failed read; selecting another project
starts collapsed. Opening or closing it makes no source request.

The **?** control, named **Preparation badge legend**, opens the badge explanations
in a modal dialog. Card badges remain visible in the overview. Close or Escape
returns focus and the reading position to the help control; opening help makes
no source request. The dialog keeps Close reachable while its explanations scroll
at narrow widths or high browser zoom.

One project is observed at a time. Click its tab-shaped **Project** choice in the
banner; the selected project is highlighted. Keyboard users can Tab to the
selected choice and use arrow keys to switch projects.

Open **System settings → Projects** to add or remove projects and inspect their
repository and local checkout paths, including when the project list is empty.
[Project configuration](PROJECT-CONFIGURATION.md) describes validation, saved
order, environment-specific storage, removal and retained sessions.
**System settings → OpenAI** saves, replaces or removes general OpenAI access on
this machine. [OpenAI access](OPENAI-ACCESS.md) explains private storage, shared
development/production credentials and configured-versus-verified status.
**System settings → Terminal theme** chooses the colour theme for embedded terminals
(Default, Light, Solarized Dark or Solarized Light) and saves the choice at once
in `~/.open-dough/dashboard/terminal-theme.json`, which development and
production share on this machine. A failed save keeps the saved theme and offers
Retry; other open dashboard windows use a new choice after a reload.

The dashboard reads `.planning/PRODUCT-BACKLOG.md` from the selected project's
saved repository and ref, resolves that ref to one commit, and reads the backlog
at that commit. Every project -- public Open Dough and Doughnut as much as
private Pygardon -- is read the same way: through a small local
authenticated read boundary (`server/authenticatedRead.ts`, reached from the
browser through `src/authenticatedRead.ts`) that resolves the ref and reads
the backlog and the records it names through the local `gh` CLI's own
existing authentication. Each file arrives exactly as origin holds it at that
revision: the boundary asks for GitHub's raw media type, not a JSON-typed one
whose text `gh` would sanitize, rewriting control-character escapes such as a
literal `\u0002`. The browser never reads GitHub directly and never
receives a credential; there is no dashboard sign-in and no token-entry UI.
Reading a project needs only the `gh` access the launching person already
has -- the same access `gh api repos/terryyin/pygardon/commits/main` proves
from a terminal -- and works from the ordinary launch route:
`npm run dev:dashboard`, `npm run watch:dashboard`, or `npm run build:dashboard`
followed by `npm run preview:dashboard`. Development and built preview mount the
same local read boundary from their Vite configuration, so the watcher's
production preview needs no separate authentication setup.

Selecting a project replaces the whole view and reads that project afresh. It
reads once on opening, and reloading the page reads it again. While a snapshot
is shown and the page is visible, it also asks every 15 seconds whether the
project's configured ref still names the shown revision -- one conditional listing of
every published branch head, which GitHub answers with `304 Not Modified` when
no branch moved, so an unchanged ref reads no backlog or record and changes
neither the revision nor the retrieval time. When the configured ref names a new commit,
the page reads exactly that commit, so newly published work appears within
about 30 seconds. While the configured ref is unchanged, a story branch that a shown Taken
entry's Story Branch Mode profile records and that names a new head (or is no
longer published) has only that entry's plan and its last commit time read
again at the new head; any other branch moving reads nothing. A hidden page (another tab,
a minimized window) asks nothing and abandons a check under way; when it is
seen again it checks once at once, then resumes the 15-second pace. Each read
replaces the whole view with one revision. No local
checkout, unpushed change, or running agent is a source of what it shows:
Taken means recorded as taken, not that anyone is working now.

The branch-head listing (`matching-refs/heads/`) is one unpaginated answer, and
the local boundary accepts at most 1 MiB of `gh` output (`maxBuffer` in
`server/ghRead.ts`), about 2,700 branches. When that listing fails for any
reason but a rate limit -- GitHub gives up on it (for example with a `504`), or
it is larger than that -- that check asks only which commit the configured ref names
(`commits/<ref>`) and reports no branch heads: a move of the configured ref is still found,
but no story branch is seen to move until the next listing that succeeds, when
watching branches resumes.

A read that fails, finds a backlog the shared reader refuses, or waits more than
30 seconds for GitHub (`readWaitLimitMs` in `src/authenticatedReadRules.ts`, the
bound the local boundary shares) ends as a read problem, never as an empty or
partial backlog. The snapshot read earlier stays shown with its own revision and
retrieval time -- it is the last successful snapshot, not a claim that the configured ref
still names it -- the problem says what failed and when, and how the page
recovers: with a snapshot shown, automatic checks continue (or, after a rate
limit, the problem says when they resume); with nothing shown, reloading the
page reads again. A failed revision check, or a failed read
of a newly found commit's backlog, is reported the same way and keeps that
snapshot. While a snapshot is shown the page keeps checking, but only at the
15-second pace, never at once: a new commit whose backlog could not be read is
found again by the next check and read then. When GitHub answers a check with a
rate limit that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
once `X-RateLimit-Remaining` is `0`), the page asks nothing more until that time
-- even when the page is seen again -- and the problem says when checks resume.
The boundary passes on only the validated wait, at most one hour. A later check
or read that succeeds lifts any such wait and clears the problem, unless the
problem stands with its snapshot as described below. A record detail that
could not be read stays labeled on its card rather than borrowing an older one;
checks that find the configured ref unchanged never read it again, so reload the page to
read it again at the same revision. When the 30-second bound ends a read after the
new commit's backlog was shown, each detail still unread is shown as such a gap
on that snapshot, and the problem stands with it (a slice clock or credited
human still unread is only its own gap): a check that finds the configured ref unchanged
does not clear it, and only a later read that replaces that snapshot does.
Selecting another project stays available throughout: a failed or still-reading
project never blocks switching to another, and returning to a project starts a
fresh read rather than replaying the failure. Switching projects abandons the
previous project's read, detail reads, and revision check; a late answer from
any of them changes nothing, and only the newly selected project is checked from
then on.

If reading a project fails, the read problem names that project's repository
and what the local `gh` could establish -- for example that it is not logged
in, or GitHub's HTTP status -- never `gh`'s own output, and never that the
repository does not exist, since an inaccessible read is not proof of that.
Check `gh auth status`, then confirm, for example,
`gh api repos/terryyin/pygardon/commits/main` answers from a terminal; once it
does, reload the page (or, with a snapshot shown, let the next check find it).
The dashboard never logs in on its own.

Each story card is read at two levels. Its scan view leads with the title,
then the backlog priority and the assigned or preparing developer with its
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

Development and production keep separate project lists and share machine-local
launch/session records. Records survive production replacements and watcher shutdown.
Development testing can act on the same projects and records as production.

## Look and controls

The frame (banner, Sessions sidebar, terminal panel chrome, System settings,
dialogs, stage containers, and page states) draws on one shared foundation:
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
Text meets 4.5:1 contrast, and controls, icons, and focus outlines meet 3:1.
`tests/frameIconControl.ts` checks an icon-only control against all of this.

## Tests

`tests/` holds one Playwright suite that replaces only GitHub's answers to
`gh`; [its README](tests/README.md) describes the harness, its silence rule,
and how journeys step page time.

## GitHub requests

What each load and revision check asks GitHub, and so what the
dashboard costs the launching person's API allowance, is described in
[GitHub requests](GITHUB-REQUESTS.md).

## Blocking story dependencies

A story card with recorded dependencies offers an expandable **Dependencies**
section. Its summary shows the number blocking execution. Expand it in place to
read each supplier, sequencing reason, required implementation, completion
condition, and waiting, satisfied, or developer-decision state. Resolution links
open recoverable historical evidence; an unresolved decision shows its actual
question. Only the dependent card shows this relationship.

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
