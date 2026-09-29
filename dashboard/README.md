# Open Dough story dashboard

A locally launched page that shows the selected project's published work: the
near-future direction, the **Backlog** in priority order, and the **Taken**
entries, as connected stages. **Start execution** and **Start refinement** on a
Backlog card ask Claude Code on this machine to execute or refine the story,
**Recent sessions** lists those launches, newest first, the **Sessions**
sidebar lists every project's open sessions and how many need attention,
**Open terminal** shows a launch's session beside the page, and **Mark as
done** there stops it ([Agent launch](AGENT-LAUNCH.md)).

The pinned banner shows the selected project in a disclosure and keeps the four
**Project** choices and SVG **Refresh** control reachable while scrolling. The disclosure opens the repository/ref, full
source revision, retrieval time (not commit time), and publication warning.
Close that disclosure to return space to the work, especially at narrow widths
or high browser zoom. The icon is named **Retry** after a failed read.

**Near-future direction** starts collapsed below the banner, opposite the **?**
help control. Click its title or use Enter/Space to read the complete published direction (or its no-direction
explanation), then activate it again to collapse. Refreshing the same project
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
`src/publishedSource.ts` is the one catalog of the four observable projects
(Open Dough, Doughnut, Pygardon, and Terry Talks) and what each one needs to be read. It
reads `.planning/PRODUCT-BACKLOG.md` from the selected project's
GitHub repository (`master` for Terry Talks, `main` for the others), resolves that ref to one commit, and reads the backlog at
that commit. Every project -- public Open Dough and Doughnut as much as
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
`npm run dev:dashboard`, or `npm run build:dashboard` followed by
`npm run preview:dashboard`. Both modes mount the identical local read boundary
from the same Vite configuration, so a built preview needs no separate setup.

Selecting a project replaces the whole view and reads that project afresh. It
reads once on opening and again when **Refresh** is pressed. While a snapshot
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
still names it -- the problem says what failed and when, and the read control is
named **Retry** until a read succeeds. A failed revision check, or a failed read
of a newly found commit's backlog, is reported the same way and keeps that
snapshot. While a snapshot is shown the page keeps checking, but only at the
15-second pace, never at once: a new commit whose backlog could not be read is
found again by the next check and read then. When GitHub answers a check with a
rate limit that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
once `X-RateLimit-Remaining` is `0`), the page asks nothing more until that time
-- even when the page is seen again -- and the problem says when checks resume.
The boundary passes on only the validated wait, at most one hour. A later check
or read that succeeds lifts any such wait and clears the problem, unless the
problem stands with its snapshot as described below. **Retry** reads the
project's configured ref afresh at once, whenever it is pressed. A record detail that
could not be read stays labeled on its card rather than borrowing an older one;
checks that find the configured ref unchanged never read it again, so press **Refresh** to
retry it at the same revision. When the 30-second bound ends a read after the
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
does, press **Retry** (or, with a snapshot shown, let the next check find it).
The dashboard never logs in on its own.

Each **Taken** card shows who holds that work, from the agent profile published
beside the backlog (`.planning/agents/<name>-chan.json`) at the same revision,
for example "Akiho-chan · Trunk Mode · Claude Code · <model>". A Story Branch
Mode profile's branch is shown as branch context, never as work on trunk. A host
or model the profile does not record is shown as not recorded, and a Taken entry
without a profile shows "Owner not recorded". A profile the shared reader cannot
read, or one naming another agent than its file, is listed with the Taken stage
as unreadable and matched to no entry. A revision without a profile directory
simply has no profiles. What a profile means is decided by the shared profile
module under `src/skills/dough-product-backlog/scripts/`.

A queued card named by a published preparation assignment shows **Preparing**
and that developer, keeping its priority and badges; it is never a Taken owner.
It disappears when preparation lands or is abandoned. Unreadable profiles show
"Preparation assignment unknown"; two assignments show as conflicting records.

Each agent portrait on a Taken or Preparing card opens the selected project's
**Agent roster**: all 29 agents with portraits and assignments recorded at the
shown revision (Taken or Preparing, task title/identity, mode, host, model, or
"No assignment recorded"). Work not in the backlog keeps identity with a title
gap; an unreadable profile leaves its agent uncertain, and a failed snapshot or
profile read leaves every assignment unknown. It comes from the same snapshot as
cards, with no read of its own; selecting another project replaces its source.
Stories and roster views have project-aware URLs (`/?project=<id>` and
`/?project=<id>&view=roster`, with default stories at `/`). Browser
Back/Forward and **Back to stories** keep the URL, selected project, view, and
focus coherent; direct roster visits focus the roster heading. An invalid
project URL resolves to the default project's stories and normalizes the URL.

Each assignment, on its Taken or Preparing card and in the roster, names the
**human developer** credited for it: the Git committer of the commit that
added its profile's current allocation. The local boundary lists that
profile's history at the shown revision (its ten latest changes) and walks it
back until the change that added the file, so a later modification of the
profile names nobody, and a removal ends the walk before an older allocation of
the same rotating name. When no addition is found, the adding commit names no
usable committer, or the history cannot be read, the card and roster say the
human developer is unknown and why, never guessing from another commit.
Beside a credited name is the avatar of the GitHub account GitHub matched to
that committer. The local boundary fetches it from the avatar address GitHub
named for that account (only https on GitHub's avatar host, bounded in size,
time, and image type) and keeps it in the running process by that address, so
each avatar version is read from GitHub once however often it is shown, and a
changed one is read afresh; the page names only a profile and revision to the
local boundary. Without a matched account or a usable, fetched avatar, the
name keeps its initials. Neither name nor avatar says anyone is working now.

Each Taken card with a readable plan also shows its recorded slice progress: a
bar with one segment per slice, filled for each slice recorded complete, and "N
of M slices recorded complete". It counts recorded statuses, not how much of the
story is done. The shared plan reader decides what a plan's slices are (under
`## Ordered slices` or `## Slices`); a missing, unreadable, or uninterpretable
plan is shown as that gap instead of a count. Beside the bar, "Current slice
started N min ago" measures from the later of the plan's last commit and the
Take (the commit that added the entry's agent profile; none found is a gap),
shows once its own reads end, and advances with page time without asking GitHub
again. It is time since the last recorded update, not evidence that an agent is
active. A Taken entry without a profile measures from the plan commit and says
so.

Progress comes from where the story's work is published. A single Trunk Mode
profile reads the plan at the shown revision of the configured ref. A single Story Branch
Mode profile reads the same plan path at the recorded branch's head and labels
the card "From branch <branch> at <short revision>; not in trunk." Without a
profile, or when profiles cannot be read, the card shows trunk's plan labelled
as the trunk copy with the execution branch not recorded or unknown, and reads
no branch. More than one profile naming the story, a recorded branch that is no
longer published, a recorded branch whose name this dashboard cannot use (it
is then never read or watched), and a plan missing or uninterpretable on that
branch are each shown as that gap, never as trunk's count. The detail view
shows the same source. When the plan carries an `## Execution complete` record,
the detail shows "Execution complete" and its `Product advice:` as recorded,
in plain text, or the record's gap when it has no readable advice; the shared
plan reader decides both. The Taken card then says "Execution complete,
awaiting wrap-up" and "Completed N min ago", measured from the plan's last
commit where its progress is read, in place of the current slice clock, or
shows the record's gap. Queued cards show no progress, complete or not.

Each card and expanded detail offers the canonical record and a **Slice plan**
link when its association is recorded in the canonical story-state or explicitly
in the backlog. Story-state paths resolve beside the canonical file; backlog
links resolve beside the backlog file (a leading `/` starts at the repository
root). Repository navigation is pinned to the inspected commit and keeps an
explicit anchor. Agreeing references produce one plan action; conflicting
references are qualified as disputed evidence without choosing a plan.
Navigation does not require readiness or successfully read plan contents.
Canonical and associated plan contents are read at the same revision for
preparation and detail; opening detail requires no additional fetch. Following
a repository file or ordinary external reference opens in a new tab
(`target="_blank"`, `rel="noopener noreferrer"`), leaving the dashboard tab,
selected project, and open detail in place. An `http(s)` address stays an
external reference not tied to the revision. Unsafe schemes, repository escapes,
and unusable targets stay text with the reason; titles and targets stay text.

Keyboard focus follows a work item across a refresh by its identity. When a
derived plan link arrives after the backlog, focus returns to that link only if
the user has not moved focus elsewhere. Reading, the read result, and a work
item that is no longer listed are announced through live regions that stay in
the page; a read problem is announced as an alert. The page reflows to a single
column and needs no sideways scrolling down to a 320 px wide window, which is
also 400% browser zoom.

What the backlog means is decided by the shared backlog reader under
`src/skills/dough-product-backlog/scripts/`; the dashboard holds no Markdown
parsing of its own. The dashboard is not part of the installed Open Dough
guidance.

## Commands

Run these from the repository root after `npm ci`.

| Command                       | Purpose                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev:dashboard`       | Launch the dashboard locally at `http://127.0.0.1:43127/`.                                 |
| `npm run typecheck:dashboard` | Strict TypeScript check of the application, the browser tests, and the tool configuration. |
| `npm run test:dashboard`      | Build the production app, serve it, and run the Playwright suite against it in Chromium.   |
| `npm run build:dashboard`     | Write production assets to `dashboard/dist/`.                                              |
| `npm run preview:dashboard`   | Serve the production assets that `build:dashboard` wrote.                                  |

The browser suite needs Chromium once per machine:
`npx playwright install chromium`.

## Tests

`tests/` holds one Playwright suite that replaces only GitHub's answers to
`gh`; [its README](tests/README.md) describes the harness, its silence rule,
and how journeys step page time.

## GitHub requests

What each load, Refresh, and revision check asks GitHub, and so what the
dashboard costs the launching person's API allowance, is described in
[GitHub requests](GITHUB-REQUESTS.md).
