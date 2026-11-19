# Open Dough story dashboard

A locally launched page for one selected project's published work. It lives in
this repository only and is not installed into client projects.

## Commands

Run `npm run dev:dashboard` for development at `http://127.0.0.1:43127/` and
`npm run watch:dashboard` for production at `http://127.0.0.1:4173/`, built in a
separate checkout from qualifying commits published on origin's `main`.
Development edits and hot reload never refresh or restart production.

Development and production keep separate project lists but share machine-local
launch and session records.

macOS session alerts use Open Dough's notification sender. Set it up with
`npm run setup-notifier:dashboard -- --test` and choose Allow when macOS asks.
It needs a separately installed `terminal-notifier` 3.1 or newer
(`brew install terminal-notifier`). Its permission is
**System Settings → Notifications → Open Dough**. Restart the dashboard after
setting the sender up.
