# Complete hook-registration corrections and deferred Claude Code acceptance

## Source and scope

Execution retrospective of [Quick 031](../031-register-ci-host-hooks/PLAN.md),
implementing [SEED-001 Story 8](../../seeds/SEED-001-install-and-update-open-dough.md#register-ci-host-hooks-consistently).
Review date: 2026-09-09. Quick 031 now has all 13 slices done; release and ordinary
adoption of `0.3.4` are recorded through `623c3ce`. This is a follow-up correction
of its existing conflict-refusal promise, not a reopening of its completed slices.
At Terry Yin's direction on 2026-09-09, this follow-up also owns the deferred
Claude-related acceptance and evidence-driven tuning, for execution by Claude
Code. This explicit scope extension includes
[SEED-007 Story 3](../../seeds/SEED-007-cross-tool-validation.md#accept-standalone-client-workflow)
and Quick 031's unresolved R5; preserve their separate proof outcomes below.

Goal: a project with an edited invocation of a known managed hook receives
`conflicting-managed-hooks` before install/update writes, instead of acquiring a
second invocation. Preserve exact manual registration and unrelated handlers.
Also establish that Claude Code can ordinarily update and use installed guidance,
operate its native CI watch correctly, and coexist with Cursor's compatibility
loader without duplicate delivery.

Include bounded recognition of command suffixes at the known fragment command
boundary and outside-in refusal proof; real Claude update/use and CI-watch
acceptance; Cursor-to-Claude compatibility acceptance; and targeted adapter,
runtime, registration, fixture, or guidance fixes justified by reproduced defects
at those boundaries. Exclude general shell parsing, arbitrary command equivalence,
observer redesign, host configuration redesign, speculative tuning, unbounded
native retries, process retrospective, release publication, and self-adoption.
No new release version is selected; do not modify the immutable `v0.3.4` tag or
hand-synchronize installed copies.

## Review provenance and finding

Recovered original execution-ready plan: `b63b9da`. Reviewed aggregate:
`git diff b63b9da 623c3ce`. The following contiguous commits belong to execution;
planning and evidence changes are provenance rather than product defects.

| Commit | Inclusion reason |
| --- | --- |
| `7e11605` | Initial installer registration and Slice 1 proof |
| `34c59f4` | Shared-settings merge policy and Slice 2 proof |
| `a56e7ab` | Installer fixture/module and Node dependency repairs |
| `5ed978d` | Ordinary release-update integration |
| `17470ce` | Equal-version registration repair |
| `d545318` | Affected force-update proof and updater guidance |
| `4dfe340` | Readiness-only observation guidance |
| `2b09e3f` | Force-update assertion diagnostics and execution evidence |
| `672fc1a` | Force-apply failure diagnostics |
| `f2c96bf` | Force-update failure tracing |
| `7318812` | Hook-message distinction and apply failure handling |
| `dc6e1bb` | Invalid-release refusal and temporary-work cleanup |
| `26a4eb7` | Installer-created Cursor native evidence |
| `1e7ea5a` | Update-created Claude evidence and Codex reuse |
| `e1bb809` | Merge only; same product tree as `1e7ea5a` |
| `6db4720` | Dangling destination refusal, prior R1 |
| `24b0389` | Managed command, duplicate, and wrapper refusal, prior R2 |
| `31fb9f7` | Semantic no-op correction, prior R3 |
| `3674645` | Portable repair assertion correction |
| `8ebbd45` | Repeat-install completeness, prior R4 |
| `e06a924` | Retained negative compatibility evidence, prior R5 |
| `aedaa7a` | Release 0.3.4 under the recorded human exception |
| `623c3ce` | Ordinary release adoption, tracked hooks, story completion |

The pre-execution source perspective changes and backlog work are outside this
implementation boundary. Their released installed copies appear in `623c3ce`
because ordinary adoption installs the entire selected payload; this is not new
source-scope drift. No intervening unrelated commit or later fix was found.
Working tree was clean at review start.

**R6 — P2: command variants still bypass managed-hook conflict refusal.**
`src/install/open-dough-register-hooks-merge.mjs:72–86` recognizes only the exact
command or its literal-space suffix. The same command followed by a tab and
`--local`, or by `; true`, is classified as unrelated. `finishManagedEvent`
then appends an exact handler while preserving the edited one. Installation
reports success and leaves two invocations of the same managed script for one
event, bypassing the project's conflict decision. This is an incomplete R2 fix,
not a request for a general shell interpreter.

Focused reproductions at `623c3ce`:

- Loaded each authoritative fragment and edited only Cursor `stop[0].command`
  or Claude `Stop[0].hooks[0].command`. Direct `mergeDocument` returns
  `conflicting-managed-hooks` for suffix ` --local`, but two entries and no
  conflict for suffixes `\t--local` and `; true`.
- Wrote each edited fragment into its host settings path in a disposable target.
  Ran `bash install.sh --target <target> --source <repository>`: both hosts
  returned 0 and retained two event entries for the tab variant.
- Repeated the real-installer check for `; true`, both ordinarily and with
  `--force`: all four cases returned 0 and retained two event entries. This
  suffix still invokes the known script before the following shell command.
- All disposable targets were removed. No native hooks were executed by these
  reproductions; the demonstrated defect is registration, not observed duplicate
  notification delivery.

Existing focused checks both passed during this review:
`bash tests/install-ci-host-hooks.sh` and `bash tests/update-skip-verified.sh`.
Their passing normal-space variant and semantic-repair cases do not cover R6.
No broad suite or native host session was run.

Prior R1, R3, and R4 corrections remain represented in code and focused proof.
R2's exact-duplicate and matcher-scope corrections remain useful; only command
variant recognition needs this follow-up. R5 remains pending under the explicit
one-release exception, as does the separately owned SEED-007 native Claude
updated-use outcome. Neither is relabeled as passing. The subsequent human scope
extension assigns fresh proof to Slices 2 and 4; it does not alter the historical
release exception. Claude hook-update delivery already passed in Quick 031;
Slice 3 is the requested native CI-watch verification and targeted tuning, not a
claim that the earlier Claude delivery test was skipped or failed.

Aggregate refactoring review covered duplication, naming, callers, fixture
inventories, interim restrictions, test overlap, and current documentation.
The temporary nonempty-map restriction is gone; fragment-free historical fixture
support and failure diagnostics still have current callers/purposes. No additional
consequential standalone refactor or story drift was established. No repository
file-size limit was found or imported from the external skill's project.

## Execution context and decisions

- Planning only in this task. Claude Code is the intended executing coordinator;
  do not launch it or execute, commit, or push while updating this plan.
- Use this new quick PLAN because the reviewed execution is complete. Keep
  statuses `planned`, `in-progress`, `done`; preserve Quick 031's evidence.
- Carry forward Quick 031's explicit human direction excluding numeric slice
  budgets and timing-policy changes. Each slice owns one observable outcome and
  focused proof loop; no numeric sizing readiness or timing guarantee is claimed.
  Native host/permission and compatibility-loader feasibility remain uncertain.
  Record a bounded diagnosis before implementation when one of those blocks proof.
- Follow the project's execution, independent post-change refactor, selective
  formatting, owned-file delivery, and CI repair gates when execution is requested.
  Resolve that execution's checkout and push destination then.
- Claude Code should use its normal native Bash/hook boundary to test its own
  observer. A CLI launched from another host is native evidence only when its
  actual hooks, coordinator context, and resulting state are observable. Self-
  report or direct helper invocation alone cannot establish delivery. Verify the
  execution coordinator's own readiness separately from disposable acceptance
  sessions; keep their observer handles and ownership distinct.
- Inspect current host versions and applicable official hook documentation at
  execution time. Preserve permissions and trust. The older Claude delivery
  harness contains a supplied-source invocation, permissive launch flags, and
  cleanup that removes successful evidence: do not blindly reuse it as proof of
  an ordinary remembered-source update. Prefer the SEED-007 ordinary permitted
  session and retain decisive artifacts before cleanup.
- For native proof, start with one bounded run per case. After a failure, retain
  evidence, identify the cause, and retry only after a concrete setup/product
  change or newly supported diagnostic hypothesis; do not repeat unchanged runs.
  Missing credentials, denied Bash, or a loader that does not invoke the hook
  keeps that acceptance pending. Stop only dependent work and continue independent
  slices when useful. Never mark a pending requirement done to complete this plan.
- Keep one shared recognition policy in the existing merge helper, used by both
  hosts and by install/update. Recognize bounded suffix delimiters following the
  exact known command; refuse edited managed invocations, do not normalize them
  into accepted registrations. Preserve genuinely different script names.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  keeps release identity immutable. Publication of the correction needs a later
  maintainer-selected release; source correction alone does not update clients.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  places this merge/refusal boundary in deterministic installer checks. Existing
  native delivery evidence remains reusable if adapter and layout are unchanged.
  The earlier one-release exception is not blanket approval for a future release.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  retains one behavioral source and source-owned guidance. No installed skill
  edits or ADR changes belong to this correction. Record any changed acceptance
  judgment in the owning seed/evidence when executing, without rewriting history.

## Ordered slices

### 1. Refuse edited known commands across supported suffix delimiters
Type: Behavior
Status: done

Behavior: Given an existing managed command with a tab-separated argument or a
shell separator immediately after its known command, install/update refuses with
`conflicting-managed-hooks` before target mutation. It does not append an exact
second registration or treat `--force` as permission to bypass the conflict.

Proof: Extend `bash tests/install-ci-host-hooks.sh` using the existing real
installer and whole-target snapshot refusal helpers. Cover the reproduced tab
and semicolon variants for both hosts under ordinary and force installation.
Keep exact adoption, literal-space edits, duplicate entries, matcher-scope refusal,
and unrelated-handler preservation green. Add a genuinely different script-name
suffix counterexample to prevent overbroad prefix ownership. Extend the existing
conflict case in `bash tests/update-skip-verified.sh` with one representative
delimiter variant to demonstrate the same no-write decision at equal version;
reuse the installer matrix rather than duplicating it at each update route.

Implementation boundary: repair the shared classifier and its directly affected
fixture helpers. Consider only delimiters at the end of the exact known command;
do not attempt arbitrary quoting, executable aliases, reordered arguments, or
shell AST interpretation. No new module, parser dependency, or settings registry
is needed. Include tests and local refactoring within this Behavior.

Safe stopping point: all focused refusal/preservation proof is green, source
correction is reviewable, and the old release remains unchanged. Any newly
discovered requirement for general shell parsing returns for scope judgment.

Outcome: done. Fixed `isManagedCommandOrArgumentVariant` in
`src/install/open-dough-register-hooks-merge.mjs` to recognize a bounded set of
boundary delimiters (space, tab, newline, `;`, `&`, `|`) immediately following
the exact known command, refusing both reproduced R6 variants (tab-separated
argument, `; true`) while still treating a suffix that merely continues a
different script name (no delimiter, e.g. `-extra`) as unrelated. Both hosts
share the fix through the existing `classifyManagedCommand`/
`isManagedCommandOrArgumentVariant` seam; no new module or parser was added.
Extended `tests/install-ci-host-hooks.sh` (tab and semicolon suffix conflicts
for both hosts under ordinary and force install, plus the similarly-named
counterexample) and `tests/update-skip-verified.sh` (one representative
tab-suffix conflict at equal-version update). `npm run lint`,
`bash tests/install-ci-host-hooks.sh`, `bash tests/update-skip-verified.sh`,
and `bash tests/install-all-tools.sh` all pass. Delivered on branch
`worktree-quick-032-hook-conflict-refusal`, merged to `main`, worktree/branch
removed. Human direction (2026-09-09): stop after this slice; Slices 2–4 need
capabilities this coordinator session does not have (a permitted native
Claude Code update session against a disposable release source; real GitHub
Actions CI via `gh`; and a real Cursor desktop session, which has no available
automation tool here) and remain `planned` for a session with that access.

### 2. Complete an ordinary Claude Code update and installed ADR use
Type: Behavior
Status: planned

Behavior: Given a disposable project with a verified older installation and
remembered SOURCE, a permitted native Claude Code session updates through the
installed dough-update workflow without a source override or force, then a fresh
session uses the updated ADR guidance to produce an actionable result grounded
in that project's own decision context.

Proof: Reuse SEED-007's concrete ADR case and the existing alternate-layout
fixture, reviewing its current expectations before use. Select and record the
current candidate commit after Slice 1; use tagged disposable release sources
for candidate changes, never move a public tag. Keep update and subsequent use
as one retained journey. Record Claude version, source/tag/commit, literal native
commands and prompts, both installed version/payload baselines, and before/after
settings and project snapshots. The ADR result must cite the fixture's actual
decision conflict, stop the conflicting implementation, and leave the decision
with its human owner. Do not provide the expected answer in the task prompt.

Repair only reproduced updater, installed-guidance, or native-session integration
defects needed for this outcome. Reuse deterministic fixtures and run their
affected focused checks if changed; a deterministic pass does not replace native
use. Save evidence under this plan's `evidence/claude-update-use/`, update SEED-007's
status only when its full outcome passes, and retain the updated committed fixture
for Slice 3. No successful hook-only run can close this slice.

### 3. Verify and tune Claude Code's native CI watch
Type: Behavior
Status: planned

Behavior: Given the candidate's installer/update-created hooks in a fresh Claude
Code session, the owning coordinator receives a controlled CI failure through
the native hook exactly once and can stop its observer cleanly without changing
host settings. Missing readiness produces explicit unavailable coverage.

Proof: Reuse Slice 2's updated fixture, or independently create a committed
installer-created fixture if Slice 2 is blocked on ADR use. Inspect Quick 031's
Claude evidence before selecting only the missing or invalidated checks. Follow
the installed `ci-notify-hosts.md` and `ci-monitor.md` contracts:

- Run `node <installed-skill>/scripts/ci-mailbox.mjs probe` through native Bash;
  retain the receipt and separately injected `CI_MONITOR_READY` context.
- Start one observer with the fixture's controlled GitHub source, retaining its
  mailbox and separate coordinator-attachment context. Reuse Quick 031's controlled
  `gh` fixture with an unpredictable failure label absent from the prompt. Continue
  useful coordinator work; do not replace hook delivery with model polling.
- Observe the owning coordinator receiving the label at a tool/stop boundary;
  verify delivery progress and a subsequent boundary without duplicate delivery.
  Keep pending/success boundaries quiet and reuse the observer across a later
  selected push. Reuse unchanged deterministic proof for child-agent isolation;
  if ownership handling changes, exercise that native boundary too.
- Stop the exact mailbox using `ci-mailbox.mjs stop <recorded-mailbox>`. Retain
  terminal result and recorded/delivered/unread counts, report pending CI as
  unobserved, and compare both settings files before/after including retained hooks.
- In a separate disposable unavailable-hook case, prove missing readiness is
  reported without settings rewrites or a monitoring promise.

Fix demonstrated defects in the smallest implicated source seam; tune only where
observed behavior violates these contracts. Add focused regression proof, using
`node --test src/skills/dough-execute-plan/scripts/ci-host-hook.test.mjs
src/skills/dough-execute-plan/scripts/ci-host-hook-process.test.mjs
src/skills/dough-execute-plan/scripts/ci-claude-lifecycle.test.mjs` as applicable.
If candidate source changes, install/update a newly tagged disposable candidate
and rerun affected native proof; do not patch installed copies as final evidence.
Save transcripts, candidate identity, snapshots, mailbox results, and fixes under
`evidence/claude-ci-watch/`. Do not add idle-session wakeups or change shared
notification timing policy under the name of tuning.

### 4. Establish Cursor-to-Claude hook compatibility without duplicate delivery
Type: Behavior
Status: planned

Behavior: Given a fresh Cursor session with both installer-created configurations
and Claude compatibility explicitly active, the actual compatibility invocation
is handled safely while one native CI failure reaches the owning coordinator
once. Shutdown preserves both settings files.

Proof: Claude Code coordinates this check, but it must run through real Cursor.
Review Quick 031's retained `cursor-compatibility-diagnostic/README.md` and its
three negative diagnostics first; file presence and successful Claude-native
delivery do not resolve R5. Record current Cursor version, active compatibility
setting, actual Claude-hook invocation/input, guard outcome, one unpredictable
failure delivery, exact mailbox shutdown, and unchanged settings. The current
guard expects `cursor_version`; inspect actual host input before deciding whether
the guard or registration needs a targeted correction.

Any temporary tracing belongs only to the disposable diagnostic fixture and must
be distinguished from installer output. After a fix, rerun with real installer-
created candidate configuration; retain actual boundary evidence without treating
manual fragment edits or scripted replay as native acceptance. If Cursor still
does not invoke the compatibility handler, record that limitation and leave R5
pending rather than deleting the check or inferring that the guard passed.
Resolve only a reproduced integration defect; a change to the supported host
contract needs an explicit human decision. Save evidence under
`evidence/cursor-claude-compatibility/`.

## Proof ownership and completion

| Promise | Owner |
| --- | --- |
| Edited managed command refuses without duplicate hooks or writes | Slice 1 |
| Deferred remembered-source Claude update and installed ADR use | Slice 2; SEED-007 |
| Native Claude CI watch, targeted fixes, and exact shutdown | Slice 3 |
| Deferred real Cursor-to-Claude compatibility invocation and guard | Slice 4; Quick 031 R5 |

Slices 2–4 may share fixture setup and applicable evidence, but each retains its
own verdict. At completion, summarize exact candidate identities and each verdict
here, link results to the owning acceptance records, and identify remaining
release work. No release or adoption is included, and the 0.3.4 exception does
not waive these planned checks.

## Review outcome and requested extension

One unresolved repository finding plus the human-requested Claude acceptance and
tuning scope, organized as four planned Behaviors. Learning: a normal-space
argument fixture does not prove recognition at other shell token boundaries;
native Claude delivery does not prove installed ADR use or Cursor compatibility.

Updated in place, not executed. Process retrospective explicitly skipped. The external
execution-retrospective skill's `.cursor/agent-map.md` and Cursor planning rules
are absent here; repository AGENTS.md, the original plan, and installed Dough
planning/refactor guidance supplied the applicable context. No separate
retrospective artifact, product edit, commit, or push was made.
