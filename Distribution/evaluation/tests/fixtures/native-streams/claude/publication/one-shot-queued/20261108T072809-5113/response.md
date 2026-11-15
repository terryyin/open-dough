Story B (SEED-B#b) is done and on remote `main` as commit `d1a6998`. CI passed for that exact commit.

**What changed:** one commit that does the story and closes it.
- `notes.txt` now ends with the line `Story B line`, which is the story's proof. I checked it before committing.
- Story B is removed from the backlog list, its section is removed from `seeds/B.md`, and its plan `slice-plans/B/PLAN.md` is deleted.
- It is recorded as finished in `.planning/done/SEED-B_b.json`, and the list of finished stories (`done/.catalog.json`) was rebuilt.
- Story A and Story B2 are untouched and still in the backlog, so remote trunk never showed Story B as in progress.

**How it ran:**
- **Workspace:** I created `native-one-shot` on branch `exec/native-one-shot` from trunk at `4cf99ed`. The project's setup and command (`node scripts/setup.js`, `node scripts/command.js`) both succeeded there before I made the change.
- **Landing:** the commit went straight onto remote `main` with no rebase needed. The CI check reported success and its watcher shut down cleanly.
- **Cleanup:** I removed the workspace and deleted its local branch after confirming `main` contains the commit.

**Your integration checkout:** your local changes are as you left them: `human-staged.txt` still staged, `trunk.txt` still modified, `human-unstaged.txt` still untracked. Because of those pending edits, local `main` was not fast-forwarded and is still at `4cf99ed`, one commit behind `origin/main`. Pull when you're ready to bring in `d1a6998`.

The intent-coverage check was not run, and the done record notes that.
