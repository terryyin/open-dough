# Use and update Open Dough in Cursor and Claude Code

Status: closed — C1–C5, A1–A5, and final closure verification complete, 2026-09-06.
Source: [SEED-001, Story 3](../../seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation), recorded in [Recently done](../../PRODUCT-BACKLOG.md).

## Outcome and scope

One shared `dough-update` skill supports Codex, Cursor, and Claude Code.
`install.sh --target <project> [--platform <codex|cursor|claude>] [--force]`
installs only the selected tool's copy; omission preserves Codex's existing
behavior. Ordinary repeat installation stops; explicit force replaces that
copy. Native updates fetch and reapply the supplied URL's default branch,
including unchanged content, while preserving other installed copies, source,
unrelated project files, and home guidance.

Cursor and Claude Code separately demonstrated installing, invoking, and using
a pushed source improvement. The shared installer tests cover all three tools.
Enduring usage is in [README](../../../README.md), and installer behavior is in
[tests/install.sh](../../../tests/install.sh).

Routine updates assume unedited installed copies. Additional skills, rules
distribution, global installs, version tracking, releases, source persistence,
conflict handling, migrations, and cross-tool synchronization remain excluded.
Accepted ADR 0000 was followed; ADRs 0001 and 0002 remain Proposed.

## Completed Cursor slices

### C1. Install a usable updater for Cursor
Type: Behavior
Status: done — 2026-09-06; implementation in `3bc1580`.
Behavior: Given a project without Cursor's installation, installing supplied
source with `--platform cursor` makes `dough-update` discoverable and invocable
in a fresh Cursor session, targeting Cursor's copy.
Proof: Native invocation applies the same supplied payload to the Cursor path;
Codex/unrelated sentinels survive. Capture native selection in the mixed project.

- Installer gained optional `--platform` (`codex` default, `cursor` writes
  `.cursor/skills/dough-update/SKILL.md`). Unsupported values, including
  `claude`, are rejected before any writes. Shared skill now has a running-tool
  table; README documents Cursor install/update.
- `bash tests/install.sh` passed for Codex default install, unsupported-selector
  rejection, Cursor install, and preservation of Codex/Claude/unrelated
  sentinels. `npm test`, `npm run lint`, and `git diff --check` passed.
- This Cursor 3.19.13 session loaded
  `.agents/skills/dough-update/SKILL.md` (Codex compatibility path) before any
  Cursor install existed.
- Local fixture `file:///Users/terryyin/git/open-dough` at `3bc1580` was
  installed with `--platform cursor`. Fresh spawned Cursor session
  `9cb00650-7eb6-4ac5-90d1-4384dd19a2c9` invoked
  `/dough-update file:///Users/terryyin/git/open-dough`.
- It listed both same-name skills, cloned into
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.Vc9QFeGZ0C`
  (`git rev-parse HEAD` = `3bc1580ec140b355010f8238fa8fe4bcb4ac4cef`), inspected
  the fetched installer/skill, and ran
  `bash "<clone>/install.sh" --target "/Users/terryyin/git/open-dough" --platform cursor --force`.
- `cmp` matched Cursor installed bytes to fetched source. Codex
  `.agents/skills/dough-update/SKILL.md` was unchanged. Home skill-file hashes
  under `~/.cursor/skills`, `~/.agents/skills`, `~/.claude/skills`, and
  `~/.codex/skills` were unchanged; no home `dough-update` appeared.

### C2. Protect an existing Cursor installation from ordinary reinstall
Type: Behavior
Status: done — 2026-09-06; covered by `tests/install.sh` with `3bc1580`.
Behavior: Given an existing, locally edited Cursor skill, ordinary installation
for Cursor warns and exits nonzero without changing that copy.
Proof: Focused real-installer test checks warning, failure, and preserved bytes.

- After a Cursor install, the test overwrites that `SKILL.md` with
  `Keep my Cursor edits.`, reruns `--platform cursor` without `--force`, and
  requires a `Warning:` / `--force` message, nonzero exit, preserved edit
  bytes, and unchanged Codex plus Claude sentinels.

### C3. Replace Cursor's installation when explicitly forced
Type: Behavior
Status: done — 2026-09-06; covered by `tests/install.sh` with `3bc1580`.
Behavior: Given the edited copy from C2, explicit `--platform cursor --force`
reinstall replaces only Cursor's skill with the supplied source.
Proof: Focused installer comparison plus unchanged Codex/unrelated sentinels.

- The same focused test then runs `--platform cursor --force`, `cmp`s the
  Cursor copy to source, and checks that Codex, unrelated, Claude sentinel,
  and project-file bytes are unchanged.

### C4. Use a pushed source improvement in Cursor
Type: Behavior
Status: done — 2026-09-06.
Behavior: Given an unedited real Cursor updater and a later shared wording
improvement on `main`, native update brings that improvement into use in Cursor.
Proof: Perform the GitHub demonstration above; fresh Cursor session demonstrates
the new wording and the invocation changed only Cursor's installed copy.

- Pushed installer support as `3bc1580` and `cc27294`. Bootstrapped Cursor from
  a fresh clone of `https://github.com/terryyin/open-dough.git` (`cc27294` on
  `main`) with that clone's
  `install.sh --target /Users/terryyin/git/open-dough --platform cursor --force`.
- Pushed wording improvement `5a48878`: success guidance now names
  `/dough-update` in Cursor and `$dough-update` in Codex. Did not hand-refresh
  the installed Cursor copy between that push and invocation.
- Fresh session `98c5a683-1853-4dd8-9bb7-553962d0bbaa` invoked
  `/dough-update https://github.com/terryyin/open-dough.git`, cloned into
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.EXkzltSx8W/open-dough`
  (`5a488787cfd5a2625d3aa8cb9caa6a9407c827ac`), and ran
  `bash "<clone>/install.sh" --target "/Users/terryyin/git/open-dough" --platform cursor --force`.
- Cursor installed bytes then matched fetched source and contained the new
  invocation wording. Codex `.agents/skills/dough-update/SKILL.md` was
  unchanged. Fresh session `811425dc-a7a8-4f01-80ae-c5d35bffa6db` (C5) loaded
  and quoted that wording.

### C5. Reapply unchanged source in Cursor
Type: Behavior
Status: done — 2026-09-06; no additional implementation change needed.
Behavior: Given identical installed/upstream content, native Cursor update
still freshly fetches and reapplies that content.
Proof: Observe another clone and successful platform-selected installer run,
matching installed bytes and preserved other copies. An empty diff is not proof.

- Fresh session `811425dc-a7a8-4f01-80ae-c5d35bffa6db` invoked
  `/dough-update https://github.com/terryyin/open-dough.git` again, quoted the
  C4 invocation wording from
  `.cursor/skills/dough-update/SKILL.md`, and cloned into a new directory
  `/tmp/dough-update.kCNhBb/open-dough` at `5a48878`.
- Trace used
  `bash "/tmp/dough-update.kCNhBb/open-dough/install.sh" --target "/Users/terryyin/git/open-dough" --platform cursor --force`.
  `cmp` reported identical Cursor installed and fetched source bytes. Codex
  copy unchanged. Final `npm test`, `npm run lint`, and `git diff --check`
  passed. CI succeeded for `cc27294` and `5a48878`.


## Completed Claude Code slices

### A1. Install a usable updater for Claude Code
Type: Behavior
Status: done — 2026-09-06; implementation in `4ee6293`.
Behavior: Given the delivered Cursor implementation and a project without
Claude's installation, `--platform claude` installs a skill discoverable and
invocable in fresh Claude Code, targeting Claude's copy.
Proof: Native invocation applies the supplied payload to the Claude path while
Cursor/Codex sentinels survive; confirm which native skill loaded.

- Installer gained `claude` as a third `--platform` value, writing
  `.claude/skills/dough-update/SKILL.md`. Unsupported values are rejected
  before any writes (`tests/install.sh` now uses `windsurf` for that case,
  since `claude` is supported). Shared skill's running-tool table gained a
  Claude Code row; success wording now names `/dough-update` for both Cursor
  and Claude Code. README documents Claude Code install/update.
- `bash tests/install.sh` passed: Codex default install, unsupported-selector
  rejection, Cursor install, Claude install, repeat-protection and forced
  replacement for all three platforms, and preservation of the other
  platforms' copies and an unrelated `.claude/skills/other-skill` sentinel
  throughout. `npm test`, `npm run lint`, and `git diff --check` passed.
- Unlike Cursor, Claude Code does not read a Codex/Cursor compatibility
  directory: a fresh Claude Code session in this repository, queried before
  any Claude installation existed, did not list `dough-update` among its
  available skills. A first-time Claude installation therefore needs one
  manual bootstrap install (as Codex's own README already documents for its
  placeholder-to-real transition), after which the skill becomes natively
  discoverable. This is recorded as a real platform difference, not a defect.
- Bootstrapped this repository itself (a project without Claude's
  installation) using local fixture `file:///Users/terryyin/git/open-dough` at
  `4ee6293e211220b562728c112210e30bf7d5a2bc`: cloned to a temporary directory
  and ran `bash <clone>/install.sh --target /Users/terryyin/git/open-dough
  --platform claude`, creating `.claude/skills/dough-update/SKILL.md`
  matching source; Codex/Cursor copies and home skill directories were
  unchanged.
- Claude Code CLI 2.1.261. Fresh non-interactive session (`claude -p`, no
  special permission flags) `fbe0e72b-f9e8-4712-80d2-4576fe12c74d` then listed
  `dough-update` among its available skills alongside `dataviz`,
  `update-config`, `code-review`, etc.
- A second fresh session `b49320ad-288e-4f63-b782-5922e185f8a4` invoked
  `/dough-update file:///Users/terryyin/git/open-dough`. Its transcript shows
  it inspected the target (`git remote -v`, located `install.sh` and the
  source skill), cloned to
  `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.LD7JGvFXXa`, inspected
  the fetched installer/skill, and ran `bash "<clone>/install.sh" --target
  "/Users/terryyin/git/open-dough" --platform claude --force`, then `diff`-ed
  the installed file against the clone's source (`MATCH`) before deleting the
  clone. It reported "Updated Open Dough guidance from
  file:///Users/terryyin/git/open-dough. Installed at
  `.claude/skills/dough-update/SKILL.md`."
- After both runs, `.claude/skills/dough-update/SKILL.md` matched
  `src/skills/dough-update/SKILL.md` byte-for-byte; `.agents/skills/dough-update/SKILL.md`
  and `.cursor/skills/dough-update/SKILL.md` hashes were unchanged from before
  the bootstrap. No `dough-update` appeared under `~/.cursor/skills`,
  `~/.agents/skills`, `~/.claude/skills`, or `~/.codex/skills`. An unrelated,
  pre-existing uncommitted edit to `docs/adrs/0002-software-development-lifecycle-principles.md`
  (not made by this work) was observed and left untouched.

### A2. Protect an existing Claude installation from ordinary reinstall
Type: Behavior
Status: done — 2026-09-06; covered by `tests/install.sh` with `4ee6293`.
Behavior: Given a locally edited Claude skill, ordinary installation for Claude
warns and exits nonzero without changing it.
Proof: Focused real-installer test checks warning, failure, and preserved bytes.

- After a Claude install, the test overwrites that `SKILL.md` with
  `Keep my Claude edits.`, reruns `--platform claude` without `--force`, and
  requires a `Warning:` / `--force` message, nonzero exit, preserved edit
  bytes, and unchanged Codex/Cursor/unrelated `.claude` sentinels.

### A3. Replace Claude's installation when explicitly forced
Type: Behavior
Status: done — 2026-09-06; covered by `tests/install.sh` with `4ee6293`.
Behavior: Given the edited copy from A2, explicit `--platform claude --force`
reinstall replaces only Claude's skill with supplied source.
Proof: Focused comparison plus unchanged Cursor/Codex/unrelated sentinels.

- The same focused test then runs `--platform claude --force`, `cmp`s the
  Claude copy to source, and checks that Codex, Cursor, unrelated, and
  project-file bytes are unchanged.

### A4. Use a pushed source improvement in Claude Code
Type: Behavior
Status: done — 2026-09-06.
Behavior: Given an unedited real Claude updater and a later shared wording
improvement on `main`, native update brings that improvement into use in Claude.
Proof: GitHub demonstration and fresh Claude session show the changed wording;
only Claude's installed copy changes in a project containing all integrations.

- Pushed A1's installer/skill/test/README support as `4ee6293` and its native
  installed-copy evidence as `d97dd69` to `main`; CI run 34008028315 succeeded.
- Bootstrapped this repository's Claude copy from a fresh clone of
  `https://github.com/terryyin/open-dough.git` (`d97dd69` on `main`) with that
  clone's `install.sh --target /Users/terryyin/git/open-dough --platform
  claude --force`, matching source.
- Pushed shared wording improvement `200939e`: the success report must now
  name the running tool (Codex, Cursor, or Claude Code) alongside the
  installed path, so a project with more than one integration can tell which
  copy changed. Did not hand-refresh the installed Claude copy between that
  push and invocation.
- Fresh session `ca5a299d-e77c-43d0-b39d-2bc3cd76f05e` invoked
  `/dough-update https://github.com/terryyin/open-dough.git`. Its transcript
  shows `git clone --depth 1 https://github.com/terryyin/open-dough.git
  /tmp/dough-update-clone/open-dough` (resolved HEAD `200939e`), then `bash
  "/tmp/dough-update-clone/open-dough/install.sh" --target
  "/Users/terryyin/git/open-dough" --platform claude --force`, then a `diff`
  confirming an identical file and a `git status --porcelain` scoped to only
  the Claude path. It reported "Updated Open Dough guidance from
  https://github.com/terryyin/open-dough.git. Tool: Claude Code. Installed
  path: `.claude/skills/dough-update/SKILL.md`." — demonstrating the new
  wording (naming the tool) already in use in its own report.
- `.claude/skills/dough-update/SKILL.md` then matched the new source
  byte-for-byte. `.agents/skills/dough-update/SKILL.md` and
  `.cursor/skills/dough-update/SKILL.md` hashes were unchanged throughout.

### A5. Reapply unchanged source in Claude Code
Type: Behavior
Status: done — 2026-09-06; no additional implementation change needed.
Behavior: Given identical installed/upstream content, native Claude update
still freshly fetches and reapplies it.
Proof: Another clone/selected installer trace, matching bytes, and preserved
Cursor/Codex copies. Reuse green code; do not invent a change for this example.

- Fresh session `a6f6b45a-f94c-4b30-a685-14e30b8f01a6` invoked
  `/dough-update https://github.com/terryyin/open-dough.git` again, with the
  installed Claude copy already identical to source from A4. Its transcript
  shows a new `mktemp -d` clone (`/tmp.Em7k4ohKOi`, distinct from A4's
  directory), `bash <clone>/install.sh --target
  "/Users/terryyin/git/open-dough" --platform claude --force`, a `diff`
  confirming `MATCH`, and cleanup (`rm -rf` the clone).
- `.claude/skills/dough-update/SKILL.md` still matched source byte-for-byte;
  `.agents/skills/dough-update/SKILL.md` and
  `.cursor/skills/dough-update/SKILL.md` hashes were unchanged. `git status`
  showed no change to the Claude file (it was already current), confirming
  reapplication rather than a skipped no-op — the trace itself, not the empty
  diff alone, is the proof of a fresh fetch and reinstall.
- Final `npm test`, `npm run lint`, and `git diff --check` passed on `c58f02a`.
  CI succeeded for `4ee6293`/`d97dd69` (run 34008028315), `200939e` (run
  34008085697), and `c58f02a` (run 34008162619).


## Final closure verification

- Reviewed the final implementation at `c9d365c` against both host handoffs.
  Claude's changes add a platform mapping and success wording; the existing
  Codex/Cursor installer paths remain intact.
- `npm run lint` and `npm test` passed on 2026-09-06. The installer tests cover
  all three platforms, unsupported selectors, repeat protection, forced
  replacement, and preservation of other installed copies and unrelated files.
- Final native Cursor check passed with all three installed copies present.
  In Cursor IDE conversation “Repository acceptance requirements”, selected
  `/dough-update` from the native slash-command menu and supplied
  `https://github.com/terryyin/open-dough.git`. Cursor reported loading
  `.cursor/skills/dough-update/SKILL.md`, fetched default-branch revision
  `c9d365ca87072166f86b6e7ed9c048d2e3bc4576`, and executed:
  `bash /tmp/open-dough-update.6QLIR8/install.sh --target
  "/Users/terryyin/git/open-dough" --platform cursor --force`.
  Native output reported `MATCH`; an independent comparison confirmed the
  Cursor copy equals current shared source. Before/after hashes preserved all
  other snapshotted project files, including both other installed copies and
  the new internal guard. The closing coordinator's plan edits were the only
  additional file change. This closes the earlier same-name discovery concern
  after adding the Claude installation.
- Prior CI evidence: Cursor runs `34007035454` / `34007054167`; Claude runs
  `34008028315` / `34008085697` / `34008162619`, recorded passing by their owners.
  Closure-only edits have not been pushed or observed in CI.
- No remaining story work. The completed seed and backlog entry were already
  correct. Removed obsolete execution directions and refinement warnings while
  preserving all ten slice records and their native evidence.

## Internal acceptance guard follow-up

The owner subsequently requested an always-on internal acceptance rule.
[AGENTS.md](../../../AGENTS.md) is the single concise source;
[CLAUDE.md](../../../CLAUDE.md) imports it. The installer does not distribute it.
Native loading follows the documented [Codex instruction chain](https://developers.openai.com/codex/guides/agents-md),
[Cursor root instructions](https://cursor.com/docs/rules#agentsmd), and
[Claude Code import](https://code.claude.com/docs/en/memory#agentsmd).

On 2026-09-06, fresh sessions were asked to state the already-loaded acceptance
requirement without reading files or using tools. All three identified the
three-platform native-evidence requirement and the rule that missing proof
stays pending:

- Codex session `01a074b9-be49-7680-8199-b062efceb91c` named root `AGENTS.md`.
- Cursor IDE conversation “Repository acceptance requirements” named
  `AGENTS.md` and also stated that the guard must not be distributed.
- Claude Code session `8dd02ad4-ab61-4c2e-9f33-89cf6bc2623d` named
  `CLAUDE.md` → `@AGENTS.md`; tools were disabled for this probe.

## Learnings

- Cursor can discover the same skill through multiple tool directories.
  Native selection and actual write destination need evidence; directory
  separation alone is insufficient.
- Claude Code's tested installation loaded its `.claude/skills` copy; a fresh
  session before that installation did not discover `dough-update`.
- This environment's Cursor CLI requires separate authentication; Cursor IDE
  provides the working native test route. Codex/Claude read-only probes needed
  their normal runtime/keychain access outside the parent shell sandbox.
- Installed copies may intentionally differ until their respective tools run
  update. Refreshing one must not silently refresh the others.
