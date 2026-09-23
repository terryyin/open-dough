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
that commit. Open Dough and Doughnut are public and read straight from the
browser, without credentials. Pygardon is private and is read instead through
a small local authenticated read boundary (`server/privateRead.ts`, reached
from the browser through `src/privateRead.ts`) that resolves the ref and
reads the backlog through the local `gh` CLI's own existing authentication:
there is no dashboard sign-in and no token-entry UI. Reading Pygardon needs
only the `gh` access the launching person already has -- the same access
`gh api repos/terryyin/pygardon/commits/main` proves from a terminal -- and
works from the ordinary launch route: `npm run dev:dashboard`, or
`npm run build:dashboard` followed by `npm run preview:dashboard`. Both modes
mount the identical local read boundary from the same Vite configuration, so
a built preview needs no separate setup to read Pygardon.

Selecting a project replaces the whole view and reads that project afresh. It
reads once on opening and again only when **Refresh** is pressed; nothing is
polled, and each read replaces the whole view with one revision. No local
checkout, unpushed change, or running agent is a source of what it shows:
Taken means recorded as taken, not that anyone is working now.

A read that fails, finds a backlog the shared reader refuses, or waits more
than 30 seconds for GitHub (`readWaitLimitMs` in `src/publishedWork.ts`) ends
as a read problem, never as an empty or partial backlog. The snapshot read
earlier stays shown with its own revision and retrieval time, the problem says
when the attempt failed, and the read control is named **Retry** until a read
succeeds. Nothing retries by itself. Selecting another project stays available
throughout: a failed or still-reading Pygardon never blocks switching to Open
Dough or Doughnut, and returning to Pygardon starts a fresh read rather than
replaying the failure.

If reading Pygardon fails, the read problem reports only that the read did not
complete -- never that the repository does not exist, since an inaccessible
read is not proof of that. Check `gh auth status`, then confirm
`gh api repos/terryyin/pygardon/commits/main` answers from a terminal; once it
does, press **Retry**. There is no dashboard sign-in, no token-entry UI, and no
automatic retry or login: the dashboard only reuses whatever access the
launching person's own `gh` already has.

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

`tests/` holds one Playwright suite. For the public projects, it replaces
only GitHub's raw HTTP answers for the ref and the backlog file
(`tests/githubOrigin.ts`); reading, the shared backlog interpretation, and
the page are the real ones. For Pygardon, dedicated specs
(`tests/private-read-boundary.spec.ts`,
`tests/private-read-subprocess-lifecycle.spec.ts`,
`tests/private-project-overview.spec.ts`) start their own isolated dev and
built-preview servers with a synthetic `gh` on PATH
(`tests/fixtures/fake-gh`), so nothing here ever calls the real `gh` CLI or
reaches the real Pygardon repository. The suite never contacts GitHub, and
every run rebuilds the app before serving it. Select one journey with, for
example, `npm run test:dashboard -- --grep 'published overview'` or
`npm run test:dashboard -- --grep 'private project overview'`.

GitHub allows 60 unauthenticated API requests per hour from one address; each
load of the dashboard, and each Refresh, uses two.
