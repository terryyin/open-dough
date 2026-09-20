# Open Dough story dashboard

A locally launched page that shows the work Open Dough has published: the
near-future direction, the **Backlog** in priority order, and the **Taken**
entries, as connected stages.

It reads `.planning/PRODUCT-BACKLOG.md` from `main` of the public
`terryyin/open-dough` repository on GitHub, in the browser and without
credentials. It resolves `main` to one commit and reads the backlog at that
commit. It reads once on opening and again only when **Refresh** is pressed;
nothing is polled, and each read replaces the whole view with one revision.
No local checkout, unpushed change, or running agent is a source of
what it shows: Taken means recorded as taken, not that anyone is working now.
The observed project is fixed in `src/publishedSource.ts`.

A read that fails, finds a backlog the shared reader refuses, or waits more
than 30 seconds for GitHub (`readWaitLimitMs` in `src/publishedWork.ts`) ends
as a read problem, never as an empty or partial backlog. The snapshot read
earlier stays shown with its own revision and retrieval time, the problem says
when the attempt failed, and the read control is named **Retry** until a read
succeeds. Nothing retries by itself.

Each card offers the entry's recorded canonical link and, when recorded, its
plan link. A repository-relative target resolves against the backlog file's
directory (a leading `/` starts at the repository root) into GitHub source
pinned to the inspected commit, keeping its anchor. An `http(s)` address stays
an external reference that is not tied to the revision. Anything else stays
readable as text with the reason it is not offered as a link: another scheme,
a path that climbs out of the repository, or a target whose last segment names
no file, such as an anchor alone. Titles, direction, and targets are always
rendered as text. No story or plan content is fetched.

Keyboard focus follows a work item across a refresh by its identity. Reading,
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

`tests/` holds one Playwright suite. It replaces only GitHub's raw HTTP answers
for the ref and the backlog file (`tests/githubOrigin.ts`); reading, the shared
backlog interpretation, and the page are the real ones. The suite never
contacts GitHub, and every run rebuilds the app before serving it. Select one
journey with, for example,
`npm run test:dashboard -- --grep 'published overview'`.

GitHub allows 60 unauthenticated API requests per hour from one address; each
load of the dashboard, and each Refresh, uses two.
