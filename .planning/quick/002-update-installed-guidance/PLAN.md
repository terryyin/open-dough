# Apply latest Open Dough guidance in Codex

Status: executing — slice 1 delivered; GitHub self-use and repeat remain.
Source: [SEED-001, Story 2](../../seeds/SEED-001-install-and-update-open-dough.md#update-after-source-change), the first unfinished [backlog item](../../PRODUCT-BACKLOG.md).

## Goal and scope

Let the maintainer invoke the installed `dough-update` skill with a supplied
repository URL, apply its latest default-branch skill, and use a pushed
improvement in a fresh Codex session. Learn from this one self-update loop.

Refresh only `.agents/skills/dough-update/SKILL.md` in the target project.
Assume its installed copy has no local edits. Preserve distributable source,
unrelated project files, and home-level guidance. Every invocation fetches and
applies latest, including repeats with unchanged upstream content.

Exclude additional skills, rules distribution, other platforms, remembered
source configuration, version records/checks, releases, notifications, edit
detection, conflict policy, backups, merging, migrations, retired-file cleanup,
and comprehensive edge-case testing.

## Current decisions and execution context

- Keep the update procedure in `src/skills/dough-update/SKILL.md`. Reuse the
  README's supplied-URL clone flow and the fetched checkout's existing
  `install.sh --target <project> --force`. No new installer framework or
  preparatory Structure slice is needed.
- Use the supplied URL's default branch; do not substitute the target project's
  remote, local working-tree content, a hard-coded branch, or a release.
  Open Dough's demonstration URL is `https://github.com/terryyin/open-dough.git`.
- Capture the target project before fetching into temporary storage. Installed
  guidance stays project-local. Success is reported only after installation
  succeeds; do not add a recovery subsystem.
- The placeholder cannot bootstrap itself. Use an explicit forced reinstall
  once to acquire the real updater, then exercise the installed skill. Never
  hand-edit installed copies to make a demonstration pass.
- Keep README installation and update usage aligned with delivered behavior.
  Preserve ordinary reinstall protection and the existing explicit override.
- `tests/install.sh` already proves copying, ordinary repeat protection,
  forced replacement, and preservation of an unrelated skill. Use native Codex
  invocation for the new skill workflow; avoid a test that merely duplicates
  the skill's shell instructions. The previous installation story established
  a working fresh-session demonstration using the desktop-bundled Codex CLI.
- Follow Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).
  No consequential architecture change is proposed; ADR 0001 remains Proposed.

## Outside-in proof

The evaluator is the maintainer, observing a fresh Codex invocation and the
resulting installed file. Record concise command/session evidence under the
owning slice during execution.

| Selected promise | Owner | Observable evidence |
| --- | --- | --- |
| Explicit reinstall obtains an invocable real updater | 1, repeated against GitHub in 2 | Bootstrap through the installer, then invoke the installed skill in a fresh session |
| Supplied URL and its latest default branch determine installed content | 1 | Isolated source fixture on a non-`main` default branch; installed bytes match its committed payload |
| Pushed improvement becomes usable in Open Dough | 2 | Before/after installed content and a fresh session demonstrating the changed wording |
| Source, unrelated project files, and home guidance are preserved | 1, checked in 2 | Compare source and unrelated-file sentinels before/after; inspect executed commands for project-local writes and absence of home-configuration writes |
| No version infrastructure, release, or unpushed source is needed | 1 and 2 | Fetch/install trace has no version gate; unpushed fixture edit is absent from installed output; GitHub proof uses ordinary `main` commits |
| Repeat still fetches and applies latest | 3 | Fresh fetch/install trace despite identical installed and upstream content |

## Ordered slices

### 1. Invoke the installed skill to apply the supplied source

Type: Behavior
Status: done — 2026-09-06
Behavior: Given an unedited project installation bootstrapped with the real
updater, invoking `$dough-update` with a supplied URL replaces its installed
skill with that source's latest default-branch content.
Proof: One fresh Codex invocation against a disposable source/target fixture
performs the update and leaves the expected installed payload.

- Replace the distributable placeholder with the short fetch-and-install
  procedure above and update README usage in the same slice.
- For the proof, create a local Git source fixture with a non-`main` default
  branch. Force install the real updater into a disposable target, then commit
  a small wording improvement in the fixture. Leave a different source edit
  uncommitted. Invoke the installed skill using the fixture's cloneable URL.
- Compare installed output with committed source, verify the uncommitted edit
  was not copied, and check source/unrelated sentinels and command write scope.
  Keep fixture construction local to this focused demonstration.
- Run `bash tests/install.sh` for the reused installation contract. A failure
  leaves the slice unfinished; do not commit broken intermediate behavior.

Evidence (2026-09-06; delivered in `261302e`):

- Forced the real updater over a fixture placeholder with the existing installer.
  Fresh bundled Codex CLI 0.153.4 session
  `01a07473-f26f-7553-8df4-5636df99c24d` invoked
  `$dough-update file:///tmp/open-dough-update-proof.mDDqwh/source`.
- Trace showed `git clone --depth 1` and the fetched installer with `--force`.
  Clone default branch was `guidance`, committed revision `2d11748`.
  `cmp` matched installed bytes to committed source; the uncommitted marker
  was absent. The source hash and both unrelated target sentinels were unchanged.
- All 101 snapshotted home guidance files were unchanged. The separate Codex
  runtime config changed during execution; no updater command wrote it.
  Command trace wrote only the temporary clone and target skill.
- `bash tests/install.sh`, `npm run lint`, and `npm test` passed. Independent
  post-change-refactor returned clean with no edits; coordinator formatting
  passed. Raw disposable proof: `/tmp/open-dough-update-proof.mDDqwh/fixture.jsonl`.

Sizing: about five minutes of work, moderate confidence; the execution path is
the existing clone/install flow. Fresh-session test runtime may add elapsed time.
Safe stopping point: the updater is usable with an explicit source URL.

### 2. Bring a pushed improvement into Open Dough itself

Type: Behavior
Status: executing — GitHub bootstrap obtained revision `261302e`; wording ready to push
Behavior: Given the real updater installed in Open Dough and a further wording
improvement pushed to `main`, invoking the installed updater brings that
improvement into use in a fresh Codex session.
Proof: One GitHub-to-Codex self-use demonstration, including installation of the
real updater through the existing explicit bootstrap flow.

- Once slice 1 is delivered to the default branch, force reinstall from the
  demonstration URL into Open Dough. Keep its installed copy unedited.
- Make one useful, observable wording improvement in the distributable skill
  and deliver it to `main`. Preserve the updater procedure; no extra skill is
  needed for the demonstration.
- Invoke the installed updater with the same URL. Compare the installed file
  with fetched source and confirm source/unrelated work is preserved. Start a
  fresh Codex session and demonstrate the changed wording from that skill.
- Record the source revision and observed wording here as demonstration
  evidence, not as installed-version metadata.

Sizing: about five minutes of work, moderate confidence; delivery and native
Codex test runtime may add elapsed time. Depends on slice 1 being available on
the source default branch and the existing working Codex invocation route.
Safe stopping point: the requested self-improvement loop has been observed.

### 3. Reapply latest when upstream is unchanged

Type: Behavior
Status: planned
Behavior: Given identical installed and upstream content after slice 2, another
update invocation with the same URL still fetches and applies latest.
Proof: Observe an actual fetch and successful installer run in the invocation
trace; confirm the installed file still matches upstream. An unchanged diff
alone does not prove an update ran.

This is a separate boundary example of the same procedure. If already green,
record the evidence without inventing another implementation change.

Sizing: about five minutes including focused verification, high confidence.
Safe stopping point: all selected story examples have evidence.

## Execution and completion

Each slice has one proof journey and a cohesive execution path; no initial
refinement trigger remains. Estimates are hypotheses, not time guarantees.
At five minutes reassess scope; at ten minutes preserve attempt-owned work and
use Donut's slice-plan-refinement unless focused test runtime explains the delay.

During execution, apply Donut's slice review and delivery gates, keep status and
evidence here, and run repository lint and tests for the final changed content.
Do not mark the GitHub demonstration done based only on a local fixture.
After completion, record enduring usage in README, reduce the home story to
goal/scope, and move its backlog link to Recently done. Planning alone changes
no feature code or installed guidance.

## Learnings

The existing installer was sufficient. Native fixture invocation demonstrated
default-branch selection without adding a scripted imitation of skill behavior.
Home guidance remained unchanged; the running Codex host changed its separate
runtime config, which is outside updater command writes.
