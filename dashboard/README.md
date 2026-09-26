# Open Dough story dashboard

A locally launched page that shows the selected project's published work: the
near-future direction, the **Backlog** in priority order, and the **Taken**
entries, as connected stages.

The pinned banner shows the selected project in a disclosure and keeps the three
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
`src/publishedSource.ts` is the one catalog of the three observable projects
(Open Dough, Doughnut, and Pygardon) and what each one needs to be read. It
reads `.planning/PRODUCT-BACKLOG.md` from `main` of the selected project's
GitHub repository, resolves `main` to one commit, and reads the backlog at
that commit. Every project -- public Open Dough and Doughnut as much as
private Pygardon -- is read the same way: through a small local
authenticated read boundary (`server/authenticatedRead.ts`, reached from the
browser through `src/authenticatedRead.ts`) that resolves the ref and reads
the backlog and the records it names through the local `gh` CLI's own
existing authentication. The browser never reads GitHub directly and never
receives a credential; there is no dashboard sign-in and no token-entry UI.
Reading a project needs only the `gh` access the launching person already
has -- the same access `gh api repos/terryyin/pygardon/commits/main` proves
from a terminal -- and works from the ordinary launch route:
`npm run dev:dashboard`, or `npm run build:dashboard` followed by
`npm run preview:dashboard`. Both modes mount the identical local read
boundary from the same Vite configuration, so a built preview needs no
separate setup.

Selecting a project replaces the whole view and reads that project afresh. It
reads once on opening and again when **Refresh** is pressed. While a snapshot
is shown and the page is visible, it also asks every 15 seconds whether the
project's `main` still names the shown revision -- one conditional listing of
every published branch head, which GitHub answers with `304 Not Modified` when
no branch moved, so an unchanged `main` reads no backlog or record and changes
neither the revision nor the retrieval time. When `main` names a new commit,
the page reads exactly that commit, so newly published work appears within
about 30 seconds. While `main` is unchanged, a story branch that a shown Taken
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
it is larger than that -- that check asks only which commit `main` names
(`commits/main`) and reports no branch heads: a move of `main` is still found,
but no story branch is seen to move until the next listing that succeeds, when
watching branches resumes.

A read that fails, finds a backlog the shared reader refuses, or waits more
than 30 seconds for GitHub (`readWaitLimitMs` in
`src/authenticatedReadRules.ts`, the bound the local boundary shares) ends as a
read problem, never as an empty or partial backlog. The snapshot read earlier
stays shown with its own revision and retrieval time -- it is the last
successful snapshot, not a claim that `main` still names it -- the problem says
what failed and when, and the read control is named **Retry** until a read
succeeds. A failed revision check, or a failed read of a newly found commit's
backlog, is reported the same way and keeps that snapshot. While a snapshot is
shown the page keeps checking, but only at the 15-second pace, never at once: a
new commit whose backlog could not be read is found again by the next check and
read then. When GitHub answers a check with a rate limit that says when to ask
again (`Retry-After`, or `X-RateLimit-Reset` once `X-RateLimit-Remaining` is
`0`), the page asks nothing more until that time -- even when the page is seen
again -- and the problem says when checks resume. The boundary passes on only
the validated wait, at most one hour. A later check or read that succeeds lifts
any such wait and clears the problem, unless the problem stands with its
snapshot as described below. **Retry** reads the project's `main` afresh at
once, whenever it is pressed. A record detail that could not be read stays
labeled on its card rather than borrowing an older one; checks that find `main`
unchanged never read it again, so press **Refresh** to retry it at the same
revision. When the 30-second bound ends a read after the new commit's backlog
was shown, each detail still unread is shown as such a gap on that snapshot,
and the problem stands with it: a check that finds `main` unchanged does not
clear it, and only a later read that replaces that snapshot does. Selecting
another project stays available throughout: a failed or still-reading project
never blocks switching to another, and returning to a project starts a fresh
read rather than replaying the failure. Switching projects abandons the
previous project's read, detail reads, and revision check; a late answer from
any of them changes nothing, and only the newly selected project is checked
from then on.

If reading a project fails, the read problem names that project's repository
and what the local `gh` could establish -- for example that it is not logged
in, or GitHub's HTTP status -- never `gh`'s own output, and never that the
repository does not exist, since an inaccessible read is not proof of that.
Check `gh auth status`, then confirm, for example,
`gh api repos/terryyin/pygardon/commits/main` answers from a terminal; once it
does, press **Retry** (or, with a snapshot shown, let the next check find it).
There is no dashboard sign-in, no token-entry UI, and no automatic login: the
dashboard only reuses whatever access the launching person's own `gh` already
has.

Each **Taken** card shows who holds that work, from the agent profile
published beside the backlog (`.planning/agents/<name>-chan.json`) at the same
revision, for example "Akiho-chan · Trunk Mode · Claude Code · <model>". A
Story Branch Mode profile's branch is shown as branch context, never as work
on trunk. A host or model the profile does not record is shown as not
recorded, and a Taken entry without a profile shows "Owner not recorded". A
profile the shared profile reader cannot read is listed with the Taken stage
as unreadable and is not matched to any entry. A revision without a profile
directory simply has no profiles. What a profile means is decided by the
shared profile module under `src/skills/dough-product-backlog/scripts/`.

A queued card named by a published preparation assignment shows **Preparing**
and that developer, keeping its priority and badges; it is never a Taken owner.
It disappears when preparation lands or is abandoned. Unreadable profiles show
"Preparation assignment unknown"; two assignments show as conflicting records.

Each Taken card with a readable plan also shows its recorded slice progress: a
bar with one segment per slice, filled for each slice recorded complete, and
"N of M slices recorded complete". It counts recorded statuses, not how much
of the story is done. The shared plan reader decides what a plan's slices are
(under `## Ordered slices` or `## Slices`); a missing, unreadable, or
uninterpretable plan is shown as that gap instead of a count. Beside the bar,
"Current slice started N min ago" measures from the later of the plan's last
commit and the Take (the commit that added the entry's agent profile), and
advances with page time without asking GitHub again. It is time since the last
recorded update, not evidence that an agent is active. A Taken entry without a
profile measures from the plan commit and says so.

Progress comes from where the story's work is published. A single Trunk Mode
profile reads the plan at the shown revision of `main`. A single Story Branch
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
preparation and detail; opening detail requires no additional fetch.

An `http(s)` address stays an external reference that is not tied to the
revision. Unsafe schemes, repository escapes, and targets naming no file stay
readable as text with the reason they cannot be opened. Titles, direction, and
targets are always rendered as text.

Keyboard focus follows a work item across a refresh by its identity. When a
derived plan link arrives after the backlog, focus returns to that link only
if the user has not moved focus elsewhere. Reading,
the read result, and a work item that is no longer listed are announced through
live regions that stay in the page; a read problem is announced as an alert.
The page reflows to a single column and needs no sideways scrolling down to a
320 px wide window, which is also 400% browser zoom.

What the backlog means is decided by the shared backlog reader under
`src/skills/dough-product-backlog/scripts/`; the dashboard holds no Markdown
parsing of its own. The dashboard is not part of the installed Open Dough
guidance.

## Commands

Run these from the repository root after `npm ci`.

| Command                       | Purpose                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev:dashboard`       | Launch the dashboard locally; open the URL Vite prints (normally `http://localhost:5173`). |
| `npm run typecheck:dashboard` | Strict TypeScript check of the application, the browser tests, and the tool configuration. |
| `npm run test:dashboard`      | Build the production app, serve it, and run the Playwright suite against it in Chromium.   |
| `npm run build:dashboard`     | Write production assets to `dashboard/dist/`.                                              |
| `npm run preview:dashboard`   | Serve the production assets that `build:dashboard` wrote.                                  |

The browser suite needs Chromium once per machine:
`npx playwright install chromium`.

## Tests

`tests/` holds one Playwright suite. Every run builds the app once; each page
journey (`tests/dashboardTest.ts`) then serves that build from its own
preview server with a synthetic `gh` on its PATH (`tests/fixtures/fake-gh`)
that answers from the test's own fake GitHub (`tests/support/fakeGitHub.ts`,
published through `tests/publishedOrigin.ts` or
`tests/committedOrigin.ts`), which can also fail, hold, or rate-limit an
answer. Only GitHub's answers to `gh` are replaced; the
local read boundary, the `gh` invocation, reading, the shared backlog
interpretation, and the page are the real ones, and a browser request to
GitHub itself fails the test. The boundary specs
(`tests/authenticated-read-*.spec.ts`) and
`tests/authenticated-project-overview.spec.ts` also start their own dev and
built-preview servers. Nothing here ever calls the real `gh` CLI or contacts
GitHub. Select one journey with, for example,
`npm run test:dashboard -- --grep 'published overview'` or
`npm run test:dashboard -- --grep 'authenticated project overview'`.

A passing run prints nothing (`tests/support/quietReporter.ts`). A failing
spec is shown with its error, output, and retained trace; a passing spec that
writes output, or output from the run itself such as global setup, fails the
run and is shown. Keep specs and their helpers silent.

The automatic-freshness journeys (`tests/auto-refresh*.spec.ts`) pause the
page's clock and step it with the helpers in `tests/autoRefreshJourney.ts`, so
the 15-second pace, the 30-second target, hidden-page pauses, and a rate
limit's directed wait are observed in page time; they read the fake GitHub's
`gh` call log to prove what was and was not asked. Assert that no `gh` call
was made only after real network turns (`checksAskedWhilePassing`, or
`expect.poll`), and give each scenario its own revisions: the boundary answers
a repeated pinned revision from memory without calling `gh`.

Each load of the dashboard, and each Refresh, makes two authenticated `gh`
requests for membership, plus one per record not already read at that
revision for preparation and detail, and, once per revision, one listing of
the agent profile directory plus one per profile listed there. Each Taken
entry with a counted plan adds one last-commit-time request for its plan and
one for its agent profile, and each Story Branch Mode entry adds one branch
head request and one plan read on that branch. These count against the
launching person's own GitHub API allowance. Each revision check is one more
`gh` request, whatever the number of branches, or two when the listing fails
and `main` is asked alone (at most four a minute per visible page, none while
it is hidden, and none before a rate limit's directed time). GitHub documents an unchanged `304` as not counting
against the primary allowance, but that has not been confirmed here, so count
each check as a request. A newly published commit then costs one backlog read
plus its records, without resolving `main` again; a recorded story branch
that moved costs one read of its plan and one of its last commit time at the
new head.
