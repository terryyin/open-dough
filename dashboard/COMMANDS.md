# Dashboard commands

Run these from the repository root after the [native setup](../tests/native-setup.md).

| Command                       | Purpose                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev:dashboard`       | Launch the dashboard locally at `http://127.0.0.1:43127/`.                                 |
| `npm run watch:dashboard`     | Build and serve origin's published `main` commit at `http://127.0.0.1:4173/`, and follow later qualifying commits. |
| `npm run typecheck:dashboard` | Strict TypeScript check of the application, the browser tests, and the tool configuration. |
| `npm run test:dashboard`      | Build the production app, serve it, and run the Playwright suite against it in Chromium.   |
| `npm run build:dashboard`     | Write production assets to `dashboard/dist/`.                                              |
| `npm run preview:dashboard`   | Serve the production assets that `build:dashboard` wrote.                                  |

Before browser checks, `node scripts/setup-native.mjs check` validates the
selected Node, installed Playwright and its headless Chromium. A changed
lockfile requires npm and browser setup again; ordinary test runs acquire nothing.

Keep `npm run watch:dashboard` running while using production. At startup it
selects the commit origin's `main` names, installs that commit's locked
dependencies and builds it in a separate checkout under
`~/.open-dough/dashboard/deployments/`, then serves exactly that commit. Local
commits and edits in the development checkout, and its hot reload, leave that
production app and server unchanged. Each start establishes current published
`main` as the running baseline; an origin without a published `main` stops the
command with that reason.

The watcher checks published `main` every 30 seconds and compares it with the
running commit, its baseline. It reads the push `paths-ignore` exclusions from
`.github/workflows/ci.yml` at the newly published commit and examines every
path changed since the baseline, deleted and renamed paths included, in a
temporary checkout under `~/.open-dough/dashboard/inspections/`. When any
changed path lies outside those exclusions, or the workflow lists no push
exclusions, that commit is pinned for its build and startup, even if `main`
moves on meanwhile, and then replaces production at the same URL as the new
baseline; a later check picks up any newer commit. When every change is
excluded, the log reports the skipped commit and the running server stays in
place, as it does for an unchanged `main`; later changes are still compared
with the running commit. The log names each selected and running commit. A
workflow at the published commit that cannot be read or uses an unsupported
`paths-ignore` form, a failed origin check, or a failed candidate build keeps
the running commit and its baseline. A failed candidate startup restores the
running commit's retained build at the same URL. Each failure reports its
reason and the selected commit; a later check retries after the cause clears or
a newer commit is published. If restoring the previous server also fails, or
the running server ends unexpectedly, the command reports the reason and exits;
resolve the reported cause and start it again.

Ctrl-C, SIGTERM and SIGHUP stop the watcher's checks and owned child processes
and remove its deployment and inspection checkouts. Independently started
development remains available. Both environments retain the same real-project
catalog and shared machine-local launch/session records; testing development
can affect those same projects and records. The watcher never removes those records.

For a different loopback production port, use
`npm run watch:dashboard -- --port 4174` (never development's 43127). An occupied
port fails rather than silently choosing another URL. `build:dashboard` and
`preview:dashboard` remain available for manually previewing the current
checkout; use the watcher for production from published `main`.
