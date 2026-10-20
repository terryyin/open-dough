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
| `npm run setup-notifier:dashboard` | Prepare Open Dough's own macOS notification sender; `-- --test` posts a test notification. |

Before browser checks, `node scripts/setup-native.mjs check` validates the
selected Node, installed Playwright and its headless Chromium. A changed
lockfile requires npm and browser setup again; ordinary test runs acquire nothing.

Keep `npm run watch:dashboard` running while using production. At startup it
selects the commit origin's `main` names, installs that commit's locked
dependencies and builds it in a separate checkout under
`~/.open-dough/dashboard/deployments/`, then serves exactly that commit. It
starts this machine's Cursor runner when none is already accepting
connections (start-if-absent: an accepting runner is left alone at
startup, however old its code; new Cursor work reuses an accepting
runner only when it proves it runs the current runner build, and
replaces a stale one first). Local
commits and edits in the development checkout, and its hot reload, leave that
production app and server unchanged. Before each build, the watcher copies local
WebP cartoons from `dashboard/public/agent-avatars/odd-e-nerds/cartoon/` in the
development checkout into the isolated checkout. These avatars remain git-ignored;
raw source photos and other files are excluded. A missing cartoon folder is fine:
agents without an avatar show their name alone. Changing local cartoons takes
effect on the next production build, including a watcher restart.

Each start establishes current published
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
baseline; a later check picks up any newer commit. Before replacement, the
running server closes start admission and waits for accepted starts to finish
publishing their assignments, receive their native launch outcome, and keep that
outcome durably. New starts and continuations answer that the dashboard is
updating. If the running server cannot confirm this handshake, including an old
server without the protocol, the watcher keeps it running and reports why.
When every change is
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
and remove its deployment and inspection checkouts. Stopping the command does
not stop the Cursor runner or the Cursor clients it holds. Independently
started development remains available. Both environments retain the same real-project
catalog and shared machine-local launch/session records; testing development
can affect those same projects and records. The watcher never removes those records.

For a different loopback production port, use
`npm run watch:dashboard -- --port 4174` (never development's 43127). An occupied
port fails rather than silently choosing another URL. `build:dashboard` and
`preview:dashboard` remain available for manually previewing the current
checkout; use the watcher for production from published `main`.

Every serving mode shows the dashboard's browser tab, bookmarks and touch icon
as Open Dough: `index.html` declares `/favicon.ico`, `/icon-16.png`,
`/icon-32.png` and the 180-pixel `/icon-180.png` touch icon, with no web
manifest. `server/brandAssetPlugin.ts` serves every supplied export in
`assets/brand/favicon/` at `/<file name>` from that one source: the dev server
answers from the files, and each build, production deployments included, writes
the same unrenamed bytes beside `index.html`.

`npm run setup-notifier:dashboard` is an explicit, one-time macOS setup for
alerts sent as **Open Dough**. It needs separately installed `terminal-notifier`
3.1 or newer (tested 3.1.0, Homebrew, macOS 26.6.2) and the system's own
`sips`, `iconutil`, `plutil`, `codesign` and `lsregister`; it downloads
nothing. It copies the installed helper's app, which it only reads, to
`~/.open-dough/dashboard/notifier/Open Dough.app`, outside every checkout and
deployment. The copy keeps the `terminal-notifier` executable and protocol,
takes its icon from `assets/brand/opendough-icon.png`, is named **Open Dough**
with bundle identifier `dev.opendough.dashboard-notifier`, is signed ad hoc and
registered with Launch Services. The command prints the app path and the
permission entry, **System Settings → Notifications → Open Dough**, and then
checks only that app's own permission: it posts nothing and asks for nothing.
The installed helper's permission does not count for Open Dough.
`npm run setup-notifier:dashboard -- --test` also posts one notification titled
Open Dough, “Test notification from Open Dough notification setup.”, with the
Glass sound. The first one makes macOS ask whether Open Dough may send
notifications; choose Allow, and leave the command running until it is
answered. After Don't Allow, or when the test is not accepted, turn on Allow
notifications in that settings entry and run the test again. Running setup
again replaces the app at the same location with the same identity, which keeps
its permission. Dashboard alerts are sent from this app; without it, or without
its permission, the open Sessions sidebar says **Alerts unavailable** and why.

To dictate startup instructions, open System settings → OpenAI and explicitly
save an API key. It configures general OpenAI access on this machine; saving
makes no paid validation request. Development and production share the private
`~/.open-dough/dashboard/credentials/openai.json` store. Replace or remove the
key in settings; saved reads show status only. No environment key is imported
or used as a fallback.

In a launch dialog, Record requests microphone permission and Stop recording
sends the completed clip for transcription. Review or edit the appended text,
then explicitly Start. Audio stays transient, with a 24,000,000-byte upload
bound and a 60-second request wait; there is no fixed recording duration limit.
Cancel or Escape ends capture and pending transcription. A failed operation
leaves the exact draft editable without reopening the dialog. Permission or
browser failures explain microphone/format recovery; saved-key failures point
to System settings. Authentication refusal and usage limits explain API access
recovery, while connection, timeout and unusable-reply failures allow another
explicit recording or typing. No failed request is retried automatically.
Cancellation may occur after a paid
request has already reached OpenAI.

Instructions have a 4,000-character limit, including the blank line between
existing text and a transcript. If a transcript does not fit, the original
stays intact and the complete transcript appears for editing. Shorten it until
Add transcript is available, or choose Discard transcript. Start and Record
remain unavailable until that review is resolved; neither draft is truncated.
