I'll follow the project's Open Dough guidance for this one-shot rename. Reading the execute-plan and land skills first.Reading one-shot and startup references next.Checking the start-script usage and locating `notesDir` in the project.Inspecting tests and project conventions — the rename may be larger than one-shot.Released settings already use both keys — renaming collides and needs a maintainer decision. Starting the one-shot workspace, then escalating if that holds.Workspace prepared (`startingRevision` retained; integration refresh deferred for pending edits). Running setup, then probing the rename collision.Probing the rename in the owned workspace to confirm the released-settings collision.Applying a naive rename to prove the collision, then escalating.Naive rename fails: released 1.0 already uses `notesDirectory` as an extension field (`archive-notes`) while `notesDir` holds the active notes path. Escalating into tracked admission.Checking both checkouts separately — the status mix looks wrong.States look correct. Escalating the one-shot attempt into admission with `--carry`.**Outcome: one-shot escalated — rename not published.**

### What happened
1. **One-shot prepared** at `native-one-shot` on `exec/native-one-shot` (`startingRevision` `c881d6f`, `created: true`). Integration refresh was **deferred** (`pending-edit`).
2. **Naive rename attempted** (`notesDir` → `notesDirectory` in settings, notes consumer, and docs). Focused test failed: released 1.0 already stores both keys with different meanings (`notesDir: "active-notes"`, `notesDirectory: "archive-notes"`), so the rename treated the extension field as the active notes directory.
3. **Escalated to admission** (docs require a maintainer decision when a new core meaning collides with a saved value). Claim published to `origin/main` as `69be20d` — agent **Yui-chan**, identity **SEED-C#notes-directory-rename**.

### Current state
| Item | Status |
| --- | --- |
| Remote trunk | Taken: *Rename notesDir to notesDirectory* (`SEED-C#notes-directory-rename`) |
| Workspace | Uncommitted naive-rename edits restored (`carried.restored: true`) |
| Integration local changes | Preserved (`human-staged.txt`, `trunk.txt`, `human-unstaged.txt`); refresh still deferred |
| Approach | `unselected` / `not-ready` — blocked on maintainer decision |

### Blocker
How to represent **both** meanings after the rename: released active notes (`notesDir`) and the existing extension value (`notesDirectory: "archive-notes"`). Implementation and planning stop until that decision.

Workspace path: `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.PvsYvYrOSu/one-shot-escalation.1wFQSj/workspace-claim-uVB78a/native-one-shot`
