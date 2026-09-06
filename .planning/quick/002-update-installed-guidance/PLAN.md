# Apply latest Open Dough guidance in Codex

Status: complete — all three slices verified and delivered.
Source: [SEED-001, Story 2](../../seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change).

## Outcome and scope

The installed `dough-update` skill fetches the supplied repository URL's latest
default branch and runs its existing installer with `--force`, refreshing only
`.agents/skills/dough-update/SKILL.md` in the captured target project. Every
invocation fetches and reapplies latest, even when upstream content is unchanged.
README records installation, the one-time placeholder bootstrap, and update usage.

The installed copy was changed only through the installer and native updater
invocations. Distributable source, unrelated project files, and home guidance
are outside updater writes. This story assumes an unedited installed copy.
Additional skills, rules, platforms, remembered sources, versions, releases,
conflict handling, backups, merging, migrations, cleanup, and notifications
remain excluded. Accepted ADR 0000 was followed; ADR 0001 remains Proposed.

## Completed slices and proof

### 1. Invoke the installed skill to apply the supplied source

Type: Behavior
Status: done — 2026-09-06; implementation delivered in `261302e`.

- Created a disposable source on default branch `guidance`, installed the
  placeholder, then bootstrapped the real updater using the existing forced
  installer. Committed a wording improvement as `2d11748` and left another
  source edit uncommitted.
- Fresh bundled Codex CLI 0.153.4 session
  `01a07473-f26f-7553-8df4-5636df99c24d` invoked
  `$dough-update file:///tmp/open-dough-update-proof.mDDqwh/source`.
- Its trace showed `git clone --depth 1` and the fetched installer with
  `--target '/private/tmp/open-dough-update-proof.mDDqwh/target project' --force`.
  The clone selected `guidance`. `cmp` matched installed bytes to committed
  source; the uncommitted marker was absent. Source hash and unrelated skill
  and project-file sentinels remained unchanged.
- All 101 snapshotted home guidance files were unchanged. The separate Codex
  runtime config changed during execution; no updater command wrote it.
- `bash tests/install.sh` passed for copying, ordinary repeat protection,
  forced replacement, and preservation of unrelated content. Repository lint,
  tests, and coordinator formatting passed. Independent refactor review was
  clean with no edits.

### 2. Bring a pushed improvement into Open Dough itself

Type: Behavior
Status: done — 2026-09-06.

- Cloned `https://github.com/terryyin/open-dough.git` at `261302e` and ran that
  clone's `install.sh --target /Users/terryyin/git/open-dough --force`.
  This explicit bootstrap replaced the placeholder with the real updater.
- Changed the distributable success wording to identify the actual supplied
  URL, preserving the procedure. Installer tests and independent refactor
  review passed; pushed the improvement to `main` as
  `896637f0e921bceeae44ff1c56c8a64b40b957d1`.
- Fresh session `01a07477-14b2-7de2-b133-62666a6eb625` invoked
  `$dough-update https://github.com/terryyin/open-dough.git`.
  It freshly cloned GitHub into `/tmp/dough-update.coyDIg/upstream`, inspected
  the fetched installer and skill, ran the installer with the captured project
  and `--force`, and checked installed bytes with `cmp`.
- Installed content matched fetched revision `896637f` and differed from the
  saved bootstrap copy. Every other tracked project file and all snapshotted
  home guidance files were unchanged across this invocation.
- The subsequent fresh session in slice 3 loaded the changed installed wording
  and reported: “Updated Open Dough guidance from
  https://github.com/terryyin/open-dough.git.” No release, version record,
  version comparison, or unpushed source was needed.

### 3. Reapply latest when upstream is unchanged

Type: Behavior
Status: done — 2026-09-06; no additional implementation change needed.

- With installed and upstream skill bytes identical, fresh session
  `01a07477-e277-73b2-a77d-904c38befdb2` invoked
  `$dough-update https://github.com/terryyin/open-dough.git` again.
- Trace showed a new `git clone --depth 1` into
  `/tmp/dough-update.lFyvFQ/upstream`, inspection of the fetched files, and
  `bash '/tmp/dough-update.lFyvFQ/upstream/install.sh' --target
  '/Users/terryyin/git/open-dough' --force`. Clone revision was again `896637f`.
  Installer and `cmp` both exited zero. The final message used the improved
  source-URL wording, proving its fresh-session use.
- Installed bytes still matched source. All snapshotted home guidance stayed
  unchanged. Concurrent external commit `c6ff216` changed only an unrelated
  planning seed during this proof; updater commands did not touch it, and
  execution preserved that work. Other tracked-file hashes matched.
- Independent final refactor review was clean with no edits. Final repository
  lint and tests passed. CI passed for `261302e` and `896637f`; completion-push
  CI is observed asynchronously and is not a prerequisite for routine delivery.

## Evidence and learnings

Raw disposable JSONL traces are retained at
`/tmp/open-dough-update-proof.mDDqwh/{fixture,github-update,github-repeat}.jsonl`;
source snapshots and preservation hashes are alongside them. The native CLI
ran with the session's existing unrestricted filesystem/never-approval policy.

The existing installer was sufficient; no updater framework or imitation shell
workflow test was necessary. Native session runtime accounted for most of the
proof time. Home guidance preservation should be checked separately from
runtime-owned Codex config, and concurrent project changes require attribution
from command traces and Git history rather than assuming every hash change
came from the updater.
