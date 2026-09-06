# Use and update Open Dough in Cursor and Claude Code

Status: Cursor C1–C5 done. Stop for Claude Code Part A.
Source: [SEED-001, Story 3](../../seeds/SEED-001-install-and-update-open-dough.md#cursor-project-installation), the first unfinished [backlog item](../../PRODUCT-BACKLOG.md).

## Start here: execution ownership and stopping points

The owner will leave the planning conversation, give this plan to Cursor, then
give the updated plan to Claude Code. This file is the execution and resume
record. Do not rely on that conversation or automatically execute both parts.

1. **Cursor:** own C1–C5 and the first shared installer/skill changes needed for
   Cursor. Complete the Cursor handoff below, then **stop**. Leave A1–A5 planned;
   do not implement, launch, or delegate Claude Code's part. **This Cursor part
   is complete; stop here.**
2. **Claude Code:** read Cursor's handoff and current code first. Own A1–A5,
   extend Cursor's implementation, and preserve completed Cursor/Codex behavior.
   Do not restart or revert Cursor's work. If its handoff is incomplete, record
   the specific dependency rather than silently claiming it complete.
3. These are sequential contributions to shared files in the same repository,
   not independent branches to implement concurrently. A host may resume its
   part over multiple sessions. Always start from its next unfinished leaf.
4. Record changes, proof, failures, and the next step here before every pause.
   Only mark the whole story done after both host parts have evidence.

## Goal and scope

A developer can install the existing `dough-update` skill into a project for
Cursor or Claude Code, invoke it there, and use a pushed source improvement
after updating. Demonstrate the same small loop separately in each tool.

- One shared distributable updater; only discovery, invocation, target path,
  and tool-specific usage need adaptation. Codex keeps working.
- Installation selects one tool. An update refreshes the invoking tool's copy
  only. Separate installations can coexist and need not be synchronized.
- Use the supplied cloneable source URL, fetching its default branch afresh
  on every update, including unchanged-content updates. No version gate.
- Preserve repeat-install protection. Only explicit `--force` reinstall
  replaces installed edits. Routine update examples use unedited copies;
  this does not establish a customization/conflict policy.
- Preserve distributable source, unrelated project files, other tools'
  separate installations, and home-level guidance.
- Exclude new skills, rules, global installation, version tracking, releases,
  remembered source URLs, automatic installation-platform discovery, cross-tool
  synchronization, migrations, conflict handling, backups, and a broad edge
  suite. The separate multi-agent collaboration seed is not part of this work.

## Repository context that must survive the handoff

Paths below are relative to this repository's root, not the temporary source
checkout or the sibling Donut repository.

| File | Current behavior / execution use |
| --- | --- |
| `install.sh` | Bash installer; accepts `--target <project> [--force]`; copies only `src/skills/dough-update/SKILL.md` to `.agents/skills/dough-update/SKILL.md`; repeat directory stops unless forced |
| `src/skills/dough-update/SKILL.md` | Canonical distributable source; currently hard-codes Codex's destination, installer invocation, inspection restriction, and fresh-session wording |
| `.agents/skills/dough-update/SKILL.md` | Installed Codex copy; change through installation/update, never hand-edit to make proof pass |
| `tests/install.sh` | Real installer test with a temporary target containing spaces; proves copy, repeat rejection, forced replacement of edits, unrelated-file preservation |
| `scripts/test.sh` / `package.json` | `npm test` or `bash scripts/test.sh` discovers all shell tests under `tests/`; no npm dependencies needed for shell tests |
| `scripts/lint.mjs` | `npm run lint`; `npm run format` fixes formatting and reruns checks |
| `README.md` | Keep installation and native invocation examples accurate as each host becomes supported |
| `.planning/quick/002-update-installed-guidance/PLAN.md` | Completed Codex proof: supplied URL, non-`main` default branch, unpushed edit excluded, GitHub self-update and unchanged repeat |
| `docs/adrs/README.md` | ADR index; 0000 Accepted, 0001 Proposed. Do not promote ADR status through implementation |

At planning time HEAD was `988429b`. The refined Story 3 was an existing
uncommitted change. Preserve it and any subsequent unrelated work. Read current
Git status and history on entry; this snapshot is not a reset target.

## Current implementation decisions

- Extend the existing installer with a single optional `--platform` selector.
  Keep omission equivalent to `codex`, preserving existing commands and the
  currently installed Codex updater. Support `cursor` in Part C, and add
  `claude` in Part A. Reject unsupported values before writing anything.
- Invocation shape after the relevant part is implemented:
  `bash <source-checkout>/install.sh --target <absolute-project> --platform <tool> [--force]`.
  Keep paths quoted. Do not add an `all` mode, interactive wizard, or manifest.
- Planned destinations are `.agents/skills/dough-update/SKILL.md` for Codex,
  `.cursor/skills/dough-update/SKILL.md` for Cursor, and
  `.claude/skills/dough-update/SKILL.md` for Claude Code.
- Keep a single canonical skill procedure. Prefer copying identical shared
  content with a small platform/destination table and explicit running-tool
  context. An update must pass its platform to the fetched installer. Do not
  infer the running tool from which directories happen to exist or from a
  compatibility directory that a different host also reads.
- Replace every Codex-only assumption in the shared procedure together:
  allowed destination during fetched-code inspection, installer arguments,
  installed-file comparison, and fresh-session instructions. Preserve capture
  of the target before fetching, source inspection, failure reporting, and
  success only after the selected installed file matches source.
- No preparatory framework is needed. Cursor introduces only the concrete
  selector and shared behavior it needs; Claude extends that same path later.
  Installed files are outputs of the installer; no hand-maintained per-tool
  workflow copies or direct edits to installed proof targets.

### Native discovery: verify on the actual host

Official docs checked 2026-09-06:

- [Cursor skills](https://cursor.com/docs/skills): project skills can live under
  `.cursor/skills`; invoke through `/` and select the skill. Cursor also reads
  `.agents/skills` and compatibility directories including `.claude/skills`.
- [Claude Code skills](https://code.claude.com/docs/en/skills): project skills
  live under `.claude/skills/<name>/SKILL.md` and can be invoked with `/name`.
  A personal skill of the same name can override a project skill.

Start with `/dough-update <source-url>` in each host and confirm the native
skill actually loaded. Do not substitute pasted instructions, a file read, or
manually running the install command for native invocation proof.

The same-name discovery/selection behavior in a mixed-tool project is not yet
observed. Check it early in C1/A1, then again with the completed installations
during update proof. Record the selected skill path and actual write target.
Do not assume that separate directories alone guarantee isolation, remove
another tool's skill, or change home settings to manufacture a passing result.
If native selection cannot satisfy the story, preserve the finding here and
refine the affected leaf before continuing dependent work.

## Proof and delivery conventions for both parts

- Use a disposable project for focused installer tests, including an unrelated
  file and sentinels at the other tool destinations. Extend the existing test
  directly; avoid a framework or copying shell instructions into a fake skill
  invocation test. Repeat protection and forced replacement are separate leaves
  even if both already pass through reuse and require only recorded proof.
- Native install/update proof runs in the assigned host. Use fresh sessions
  after installation and after updating; record host version, selected skill
  path, source URL/revision, exact invocation, observed output, and installed
  path. A file comparison alone does not prove native discovery or use.
- For pushed-source proof, use `https://github.com/terryyin/open-dough.git`
  and its default branch `main`. First deliver the host's installer/skill
  support there, then bootstrap that host through the fetched installer.
  Make and push a further small useful wording change in canonical source.
  The installed updater must fetch that change; do not manually refresh the
  installed copy between the source change and invocation.
- Cursor records its wording improvement and source commits. Claude can install
  a recorded older, Claude-capable payload to demonstrate a later already-pushed
  shared improvement, or make one further small source wording improvement.
  Do not use an old source that lacks that host's installer support. No tag,
  release, or installed-version file is needed.
- Across update invocations, compare selected installed bytes to fetched source,
  snapshot the other installed copies/source/unrelated files, and inspect the
  executed commands for absence of home-guidance writes. No automatic update
  of another tool's installed copy is allowed, including a stale copy.
- Run focused tests at each leaf. Before each host handoff, run `npm run lint`,
  `npm test`, and `git diff --check` on the resulting shared implementation.
  Tooling: Bash/Git; Node 20.19+, 22.13+, or 24+; `npm ci` if dependencies are
  missing; ShellCheck 0.11+ and shfmt 3.14+ on PATH. Do not apply Donut's Nix,
  application test commands, or CI infrastructure to this repository.
- Review/refactor each cohesive change, selectively format, update this plan,
  and commit/deliver verified work through the existing repository workflow.
  Record commit and CI status. Default-branch availability is a real dependency
  of GitHub proof: a local commit or feature-branch push is insufficient.
  Do not force-push, reset others' work, or mark unavailable native proof done.

## Part C — Cursor only

Cursor owns the shared files above as needed for C1–C5 and the Cursor installed
output. Leave Claude behavior and its native proof to Part A.

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
Safe stop: Cursor has a usable installer and updater; Claude is not claimed.

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
Safe stop: existing Cursor installation is protected.

### C3. Replace Cursor's installation when explicitly forced
Type: Behavior
Status: done — 2026-09-06; covered by `tests/install.sh` with `3bc1580`.
Behavior: Given the edited copy from C2, explicit `--platform cursor --force`
reinstall replaces only Cursor's skill with the supplied source.
Proof: Focused installer comparison plus unchanged Codex/unrelated sentinels.

- The same focused test then runs `--platform cursor --force`, `cmp`s the
  Cursor copy to source, and checks that Codex, unrelated, Claude sentinel,
  and project-file bytes are unchanged.
Safe stop: maintainer can explicitly refresh or replace the Cursor copy.

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
Safe stop: Cursor's complete source-to-use loop is observed.

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
Safe stop: complete Cursor handoff below and STOP before A1.

## Cursor handoff — fill before leaving Cursor

- Part status: C1–C5 complete. STOP before A1.
- Last completed leaf / next Cursor leaf: C5 / none. Next work is Claude Code A1.
- Implementation and published source commits: `3bc1580` (installer/platform),
  `cc27294` (Cursor installed copy + C1–C3 evidence), `5a48878` (wording
  improvement) on `main`.
- Exact supported installer syntax and shared-skill adaptation:
  `bash <source-checkout>/install.sh --target <absolute-project> [--platform <codex|cursor>] [--force]`.
  Omitting `--platform` is `codex`. Shared skill is identical across
  destinations, with a running-tool table. Cursor update must pass
  `--platform cursor`. Claude is still rejected as unsupported.
- Cursor version, native invocation, selected skill path, and evidence:
  Cursor IDE 3.19.13; CLI 2026.04.13-a9d7fb5. Parent session loaded
  `.agents/skills/dough-update/SKILL.md`. After Cursor install, fresh sessions
  `9cb00650-7eb6-4ac5-90d1-4384dd19a2c9`,
  `98c5a683-1853-4dd8-9bb7-553962d0bbaa`, and
  `811425dc-a7a8-4f01-80ae-c5d35bffa6db` saw both same-name paths and followed
  `.cursor/skills/dough-update/SKILL.md`.
- Bootstrap revision → improvement revision and observed wording:
  GitHub bootstrap `cc27294` → improvement `5a48878`. Observed wording:
  “then invoke `/dough-update` in Cursor or `$dough-update` in Codex”.
- Installer tests / lint / CI results and revisions: `npm test`, `npm run lint`,
  and `git diff --check` passed. CI success for `cc27294` (run 34007035454)
  and `5a48878` (run 34007054167).
- Native-selection/coexistence findings, remaining risks, uncommitted work:
  Cursor lists both `.agents/skills` and `.cursor/skills` copies. Codex copy
  is still the pre-platform skill and was never written by Cursor updates.
  Isolation is running-tool context plus `--platform`, not directories.
  Unrelated uncommitted ADR 0002 / `docs/adrs/README.md` preserved. No Claude
  installer mapping. `cursor-agent -p` needs a Cursor API key.
- Ready for Claude Code: yes. Extend the existing `--platform` selector and
  shared table; do not restart or revert Cursor/Codex behavior.

Leave this story in Unfinished stories and retain its refinement. Do not mark
the whole story complete when only Cursor works. Deliver this plan alongside
the code so Claude receives the evidence, not the original empty checklist.

## Part A — Claude Code only, after the Cursor handoff

Claude owns A1–A5 and the Claude installed output. Extend the current selector,
shared skill, tests, and README. Keep Cursor's tests and delivered behavior.

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
Safe stop: Claude has a usable updater alongside the completed Cursor support.

### A2. Protect an existing Claude installation from ordinary reinstall
Type: Behavior
Status: planned
Behavior: Given a locally edited Claude skill, ordinary installation for Claude
warns and exits nonzero without changing it.
Proof: Focused real-installer test checks warning, failure, and preserved bytes.
Safe stop: existing Claude installation is protected.

### A3. Replace Claude's installation when explicitly forced
Type: Behavior
Status: planned
Behavior: Given the edited copy from A2, explicit `--platform claude --force`
reinstall replaces only Claude's skill with supplied source.
Proof: Focused comparison plus unchanged Cursor/Codex/unrelated sentinels.
Safe stop: maintainer can explicitly refresh or replace the Claude copy.

### A4. Use a pushed source improvement in Claude Code
Type: Behavior
Status: planned
Behavior: Given an unedited real Claude updater and a later shared wording
improvement on `main`, native update brings that improvement into use in Claude.
Proof: GitHub demonstration and fresh Claude session show the changed wording;
only Claude's installed copy changes in a project containing all integrations.
Safe stop: both tools have demonstrated the shared source-to-use loop.

### A5. Reapply unchanged source in Claude Code
Type: Behavior
Status: planned
Behavior: Given identical installed/upstream content, native Claude update
still freshly fetches and reapplies it.
Proof: Another clone/selected installer trace, matching bytes, and preserved
Cursor/Codex copies. Reuse green code; do not invent a change for this example.
Safe stop: complete the final handoff and story completion checks below.

## Contract coverage and completion

| Promise | Owning proof |
| --- | --- |
| Install/discover/invoke in each actual tool | C1, A1 |
| Preserve existing Codex commands and isolate the selected installation | C1, A1; sentinels in C3/C4 and A3/A4 |
| Warn/stop ordinary repeats | C2, A2 |
| Explicit force overwrites selected installed edits | C3, A3 |
| Supplied URL/default branch brings a pushed shared improvement into use | C4, A4 |
| Reapply unconditionally, no version/release machinery | C5, A5 and source/trace review in C4/A4 |
| Preserve source, unrelated content, other installed copies, and home guidance | C1/C4, A1/A4 write-scope and snapshot checks |
| One shared workflow, honest failure/success reporting, native usage guidance | C1/A1 source review and native traces; README in each handoff |

Claude's final handoff must record its completed leaves, published revisions,
native version/invocation/path, observed wording, tests/lint/CI, remaining work,
and whether final shared changes invalidate any of Cursor's earlier evidence.
Repeat affected regression checks when needed. If a new same-name skill or
shared change leaves Cursor's native selection uncertain, record that proof as
pending for Cursor; do not manufacture it from a Claude-only invocation.

When both parts and required regressions are verified, reduce the home story
to Goal and Scope, record completion and this plan link, and move its existing
backlog link to Recently done. Keep enduring behavior in tests and README.

## Sizing and readiness

Target about five minutes per leaf, including focused verification. C2/C3/C5
and A2/A3/A5 have high sizing confidence because they reuse the same installer
path; passing proof may require no new product code. C4/A4 have moderate
confidence with native-session and delivery runtime recorded separately.

**Refinement recommended: C1 and A1.** Each has one end-to-end outcome, but
native selection with coexisting same-name skills remains unobserved. The
assigned host should perform the narrow native-selection check first and
update this plan's leaf/sizing before implementation if that boundary or the
selector/skill change requires separable beats. This is not a request to
broaden the story or rerun product refinement.

At five minutes reassess an unconverged leaf; at ten minutes preserve only
attempt-owned WIP and refine that leaf on this plan unless a focused test's
runtime explains the overrun. Keep completed evidence and the host stopping
boundary intact. Never leave failing shared tests as a completed stopping point.

## Learnings

- Planning found that native discovery can cross tool directories. Isolation
  therefore needs native invocation/write-target evidence, not only paths.
- Confirmed: Cursor 3.19.13 presents both same-name `dough-update` skills when
  Codex (`.agents/skills`) and Cursor (`.cursor/skills`) copies exist. The
  parent session, before Cursor install, loaded only the Codex compatibility
  path. Write-target isolation held when the Cursor copy's running-tool table
  was followed; a stale Codex copy still lacks that table until Codex is
  updated separately. Do not treat directory separation as selection.
- `cursor-agent -p` required a Cursor API key even when `agent status` reported
  login; native proof used a spawned Cursor session in this workspace instead.
