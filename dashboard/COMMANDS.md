# Dashboard commands

Run these from the repository root after the [native setup](../tests/native-setup.md).

| Command                       | Purpose                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run dev:dashboard`       | Launch the dashboard locally at `http://127.0.0.1:43127/`.                                 |
| `npm run watch:dashboard`     | Build and serve the highest numeric release on origin at `http://127.0.0.1:4173/`, and watch for newer releases. |
| `npm run typecheck:dashboard` | Strict TypeScript check of the application, the browser tests, and the tool configuration. |
| `npm run test:dashboard`      | Build the production app, serve it, and run the Playwright suite against it in Chromium.   |
| `npm run build:dashboard`     | Write production assets to `dashboard/dist/`.                                              |
| `npm run preview:dashboard`   | Serve the production assets that `build:dashboard` wrote.                                  |

Before browser checks, `node scripts/setup-native.mjs check` validates the
selected Node, installed Playwright and its headless Chromium. A changed
lockfile requires npm and browser setup again; ordinary test runs acquire nothing.

Keep `npm run watch:dashboard` running while using production. It installs the
tagged lockfile and builds in a separate release directory under
`~/.open-dough/dashboard/releases/`; development edits and hot reload leave that
production app and server unchanged. The origin's highest numeric
`vMAJOR.MINOR.PATCH` tag supplies the pinned commit and matching `VERSION`.
Branches, prereleases and lower numeric tags never replace production. No
qualifying tag at startup is an error; it never serves development instead.

The watcher checks every 30 seconds. A failed origin check or candidate build
keeps the current release. A failed candidate startup restores its retained
working build at the same URL. Each failure reports its reason and tag when
known; a later check retries after the cause clears. Published tags must remain
immutable. If restoring the previous server also fails, the command reports
both failures and exits; resolve the reported cause and start it again.

Ctrl-C, SIGTERM and SIGHUP stop the watcher's checks and owned child processes
and remove its release directories. Independently started development remains
available. Both environments retain the same real-project catalog and shared
machine-local launch/session records; testing development can affect those same
projects and records. The watcher never removes those records.

For a different loopback production port, use
`npm run watch:dashboard -- --port 4174` (never development's 43127). An occupied
port fails rather than silently choosing another URL. `build:dashboard` and
`preview:dashboard` remain available for manually previewing the current
checkout; use the watcher for production from published releases.

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
leaves typing and explicit retry available. Cancellation may occur after a paid
request has already reached OpenAI.
