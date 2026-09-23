# Open Dough story dashboard

A locally launched page that shows the work Open Dough has published: the
near-future direction, the **Backlog** in priority order, and the **Taken**
entries, as connected stages.

The pinned **Open Dough** banner keeps the three **Project** choices and SVG **Refresh**
control reachable while scrolling. Its repository/ref disclosure opens the full
source revision, retrieval time (not commit time), and publication warning.
Close that disclosure to return space to the work, especially at narrow widths
or high browser zoom. The icon is named **Retry** after a failed read.

**Near-future direction** starts collapsed below the banner. Click its title or
use Enter/Space to read the complete published direction (or its no-direction
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
project's `main` still names the shown revision -- a conditional request that GitHub answers
with `304 Not Modified` when nothing moved, so an unchanged `main` reads no
backlog or record and changes neither the revision nor the retrieval time.
When `main` names a new commit, the page reads exactly that commit, so newly
published work appears within about 30 seconds. A hidden page (another tab,
a minimized window) asks nothing and abandons a check under way; when it is
seen again it checks once at once, then resumes the 15-second pace. Each read
replaces the whole view with one revision. No local
checkout, unpushed change, or running agent is a source of what it shows:
Taken means recorded as taken, not that anyone is working now.

A read that fails, finds a backlog the shared reader refuses, or waits more
than 30 seconds for GitHub (`readWaitLimitMs` in `src/publishedWork.ts`) ends
as a read problem, never as an empty or partial backlog. The snapshot read
earlier stays shown with its own revision and retrieval time -- it is the last
successful snapshot, not a claim that `main` still names it -- the problem says
what failed and when, and the read control is named **Retry** until a read
succeeds. A failed revision check, or a failed read of a newly found commit's
backlog, is reported the same way and keeps that snapshot. While a snapshot is
shown the page keeps checking, but only at the 15-second pace, never at once:
a new commit whose backlog could not be read is found again by the next check
and read then. When GitHub answers a check with a rate limit that says when to
ask again (`Retry-After`, or `X-RateLimit-Reset` once `X-RateLimit-Remaining`
is `0`), the page asks nothing more until that time -- even when the page is
seen again -- and the problem says when checks resume. The boundary passes on
only the validated wait, at most one hour. A later check or read that succeeds
clears the problem and any such wait. **Retry** reads the project's `main`
afresh at once, whenever it is pressed. A record detail that could not be read
stays labeled on its card rather than borrowing an older one; checks that find
`main` unchanged never read it again, so press **Refresh** to retry it at the
same revision. Selecting another project stays available
throughout: a failed or still-reading project never blocks switching to
another, and returning to a project starts a fresh read rather than replaying
the failure. Switching projects abandons the previous project's read, detail
reads, and revision check; a late answer from any of them changes nothing, and
only the newly selected project is checked from then on.

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
revision for preparation and detail; they count against the launching person's own GitHub API
allowance. Each revision check is one more `gh` request (at most four a
minute per visible page, none while it is hidden, and none before a rate
limit's directed time). GitHub documents an unchanged `304` as not counting
against the primary allowance, but that has not been confirmed here, so count
each check as a request. A newly published commit then costs one backlog read
plus its records, without resolving `main` again.
