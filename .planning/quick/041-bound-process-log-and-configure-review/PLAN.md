# Bound the process log and configure process review

## Source and goal

[SEED-010 Story 8](../../seeds/SEED-010-learn-from-execution-retrospectives.md#respond-when-deardough-reaches-500-lines).
Status: executing, 2026-09-11.

Keep useful process learning within 1,000 lines, warn from 500 existing lines,
and let a project persist its choice to skip process retrospectives. The human
explicitly included configuration in this story despite its loose relationship
to retention. Execution authorized 2026-09-11 on
`worktree-quick-041-bound-process-log-and-configure-review`.

## Scope and decisions

The refined story owns the full behavior contract and examples. Implement the
500-line pre-write warning, 1,000-line final-size ceiling, evidence-based priority
replacement, recoverable removal, stable issue/execution identity after pruning,
and truthful omission reporting. Preserve ordinary supported-finding requirements,
review independence, and no-op rereviews. No supported finding means no log
maintenance; skipped process review means no log access.

Use the optional project-owned `open-dough.json` in the established planning
directory, default `.planning`, with boolean `skipProcessRetrospective` default
`false`. Explicit invocation selection wins; `--skip-process` always skips.
An explicit include-process request overrides stored `true` without new flag
syntax. Invalid/unreadable config leaves process selection unresolved unless
explicitly resolved, and does not block independent reviews. Unknown keys are
ignored and preserved. Missing files are not created implicitly.

Keep configuration outside managed payload ownership. Install and update preserve
its bytes and absence. Document the setting with the executing project's location
and perspective. No global or per-tool layers, schema versions, config framework,
extra settings, configurable thresholds, automatic summarization, automatic
commits for retention, backup collection, remote storage, release, or adoption.

Current Accepted ADRs constraining this work:

- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  edit shared source; changes are Proposed until reviewed and released. Do not
  edit installed managed copies or promote files as part of authoring.
- [ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  real deterministic installation/preservation checks belong here; host behavior
  acceptance remains explicitly pending in SEED-010 Story 2 before release.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one authoritative rule per concept, direct runtime instructions, maintainer
  judgments in recognition records. The current index has no existing JSON
  customization contract. These implementation choices conflict with no current
  Accepted decision and do not change ADR status.

## Existing seams and cumulative model

`src/skills/dough-execution-retrospective/SKILL.md` selects reviews before
focus-specific context, then records findings using local issue IDs and execution
identities. It currently forbids deleting entries, counts occurrence rows, and
allocates IDs from visible headings. Replace those unconditional assumptions only
as required by authorized bounded retention; retain ordinary conservative edits.

Use one selection rule before process analysis and one candidate-write flow:
construct supported edits, measure final size, select justified retention changes
only if needed, verify recovery and identity, validate the complete result, then
write and report. Occurrence and whole-issue removal are choices within this rule,
not separate storage systems. Preserve the file on failed validation or write;
do not truncate first and reconstruct afterward.

A compact retention note preserves the allocation high-water mark, partial-history
meaning, and a usable recovery reference. Recovery must contain the actual removed
content, including relevant uncommitted edits; do not assume HEAD suffices. Consult
history only to resolve a consequential identity/match, not on every review.
If the project lacks safe recovery, report the new finding without destructive
replacement. All notes count toward the ceiling.

Primary guidance surface: the retrospective source skill, with focused references
if needed to keep conditional retention detail out of its main flow. Maintain
one definition of the JSON contract, linked from runtime guidance and installation
documentation as appropriate. Inspect `docs/installation-and-updates.md`,
`install.sh`, and `src/install/` only where needed for configuration preservation.
No installer writer is required: optional absence and project-owned bytes are
already the intended ownership model. Add functional coverage at existing shell
fixture seams such as `tests/install.sh`, `tests/update-when-needed.sh`, and
`tests/helpers/release-fixture.bash`; choose the narrowest maintained seam during
execution. Add helpers only for concrete repeated logic, not to mechanize agent
priority judgment.

## Ordered slices

### 1. Persist a project's process-review selection
Type: Behavior
Status: done
Evidence: RECOGNITION.md Quick 041 Slice 1 walkthrough (variants 1–11 plus
invalid/unreadable, missing-key, skill-adjacent, and skip-product combinations);
`evidence/slice-1/checksums.fixtures`; `git diff --check`. Delivered on
`worktree-quick-041-bound-process-log-and-configure-review`. CI observer:
`/tmp/dough-ci-501/watch-aQKXo5`, workflow `ci.yml` / `CI`.

Behavior: Given an ordinary retrospective and optional project configuration,
resolve whether process review runs before any process/log access, while keeping
implementation and product review independent.

Implement and document location, true/false/default behavior, explicit instruction
precedence, unknown-key tolerance, and invalid/unreadable-config handling. Preserve
`--skip-product` independence. Do not create or repair configuration as a side
effect of a retrospective. Resolve the target project, not the skill directory.

Proof: Walk the actual source guidance from retrospective invocation with absent,
true, false, and invalid configuration. Observe selected reviews and absence of
log reads/writes when skipped or unresolved. Vary explicit skip/include, unknown
keys, a differently established planning directory, and a misleading config beside
the installed skill. Verify default-on and independent reviews from the same
selection rule. Record decisive authoring observations in the recognition record.

Safe stopping point: projects can select process review consistently; existing
logging continues when enabled. Sizing: high confidence, one selection boundary
and its variants; implementation, review, and local cleanup are one proof loop.

### 2. Warn and prevent writes beyond the ceiling
Type: Behavior
Status: planned

Behavior: Given supported findings with process review enabled, recording warns
when the existing log has at least 500 lines and never writes a result over 1,000.

Check the complete candidate including blank lines, metadata, and an unterminated
last line. In this interim slice, refuse an overflowing candidate and return the
supported finding without mutation; slice 3 adds priority replacement. Existing
oversized files stay unchanged with an explicit violation report until a safe
bounded candidate can be formed. No findings and identical rereviews stay no-op;
no proactive log inspection occurs when process is skipped.

Proof: One recording walkthrough with precisely measured fixture files at 499,
500, 999, 1,000, and 1,020 lines. Observe no warning for 499→507, warnings on
supported writes starting at 500+, acceptance of a 1,000-line candidate, and
byte-identical refusal at 1,001. Include blank lines and final unterminated text.
Inspect resulting bytes with a line-count command, not the agent's self-report.
Reuse slice 1's selection proof; demonstrate skipped process bypasses this path.

Safe stopping point: size pressure is visible and writes obey the ceiling; full
logs may temporarily omit valuable findings until slice 3. Sizing: high confidence,
one size/write boundary with clear deterministic observations.

### 3. Retain higher-value learning without losing recoverable identity
Type: Behavior
Status: planned

Behavior: Given an overflowing candidate with higher-priority new information,
replace enough recoverable lower-priority material to record it within 1,000
lines, while preserving interpretable evidence, identity, and truthful history.

Apply supported impact, recurrence likelihood, actionability, and evidence quality
without numeric scores. Permit occurrence-detail and whole-issue removal, including
an entry at the top; prefer retaining more useful learning. Preserve allocation
high-water and partial-history/recovery metadata within the same limit. Matching
and deduplication remain evidence-based after removal. Verify recovery before
writing, and report removals, rationale, final size, and reference. A low-priority
new finding, insufficient room, ambiguous identity, unavailable recovery, or
failed write leaves the original file unchanged and returns a limitation.

Proof: One retention journey in an isolated Git fixture: a 995-line committed
log plus a severe finding needs space. Walk the skill's selection, verify removed
content is recoverable, final log is at most 1,000 lines, and retained IDs/evidence
are intact. Exercise occurrence removal and whole-issue removal as data variants
of that same candidate-write flow. Continue with rereview of a pruned execution,
a genuine new recurrence, a decisively matched removed issue, and allocation after
removal of the highest code. Observe no ID reuse, resurrection, or inflated count.
Vary low-value incoming material, an oversized input, uncommitted removed content
absent from recovery, ambiguous recovery, and write failure; refusal must preserve
bytes and independent review completion. Priority reasoning receives manual
behavior review; byte count and history checks alone cannot prove good selection.

Safe stopping point: the final bounded recording policy is usable and honest about
missing history. Sizing: medium confidence, one complete retention transaction;
recovery and identity checks are essential to that same outcome. No retention
engine or new archive is assumed. Escalate an actual need for new storage rather
than silently expanding this story.

### 4. Preserve the project preference through installation and update
Type: Behavior
Status: planned

Behavior: Given an absent or existing project configuration, ordinary installation
and update preserve its absence or exact bytes so subsequent review selection
uses the same project preference.

Document optional project ownership and setup with the single JSON example.
Add focused functional assertions using existing installation/release fixtures.
Cover shared Codex/Cursor ownership and Claude installation paths, ordinary update
and supported force replacement, with true and unknown keys intact. Do not add
configuration to managed file lists or introduce installer prompts/default files.
Avoid changing installer behavior unless a real preservation failure requires it.

Proof: Execute real installer/updater fixture operations and compare config bytes
or absence before/after for the supported destinations. Use retained configuration
as input to the slice 1 selection walkthrough to verify its meaning stays true.
Run the affected existing installation/update checks. This deterministic journey
establishes preservation; fresh native use on each host remains pending Story 2.

Safe stopping point: documented project customization survives normal distribution
operations. Sizing: high confidence using existing fixture machinery; no new
platform adaptation or configuration writer is expected.

## Proof ownership and gates

| Final promise | Owning slice / observation |
| --- | --- |
| Config location, default, precedence, invalid types, unknown keys | 1 / selected review set and untouched config |
| No process/log access when skipped; other reviews independent | 1 / invocation walkthrough; 2 bypass regression |
| 500 existing-line warning, 1,000 final-line cap, counting boundaries | 2 / measured fixture bytes and recording result |
| Priority-based occurrence or whole-finding replacement | 3 / reasoned selection and bounded final content |
| Recoverability, honest partial history, IDs and rereview deduplication | 3 / recovery inspection and continued recording journey |
| Unsafe replacement/write refuses without loss; existing oversize explicit | 2–3 / unchanged bytes and truthful report |
| Optional project config survives install/update across tool roots | 4 / actual operations and byte/absence checks |
| Native behavior proof before release | SEED-010 Story 2 / pending, not claimed here |

For every guidance slice, apply AGENTS.md's invocation, required-context, and
useful-outcome review; inspect descriptions, examples, and linked references for
ADR 0006 perspective. Record relevant evidence and limitations in
`src/skills/dough-execution-retrospective/RECOGNITION.md`. No prose-matching tests
or routine per-tool discovery matrix. Deterministic retention observations may
use small fixture commands; do not build a general assessment framework.

Use `git diff --check` and applicable focused checks. `npm run format` and
`npm run lint` are repository entry points; select changed script/config files
for formatting and avoid unrelated rewrites. Full installer/runtime suites are
not required for prose alone; slice 4 must run actual applicable preservation
checks. No shared or production storage experiment is needed: Git recovery is
proved only in the isolated slice 3 fixture.

Native cases assigned to Story 2 cover configured/default/explicit selection,
warning and ceiling, priority replacement and safe refusal, retained identity,
and fresh use after update on Codex, Cursor, and Claude Code. Reuse delivery
mechanism evidence only with a stated applicability judgment; each affected
requirement needs evidence or justified reuse for each host before release.

## Execution context and assessment

Plan layout: `.planning/quick/NNN-<slug>/PLAN.md`; statuses planned, in-progress,
and done. Execution is on `worktree-quick-041-bound-process-log-and-configure-review`
with Story 8 in Taken. No numeric slice target, hard limit, or repeated-overrun
threshold was supplied; the log's 1,000-line limit is a product constraint,
not an execution budget. CI observer `/tmp/dough-ci-501/watch-aQKXo5`,
workflow `ci.yml` / `CI`. Authorized push destination: this worktree branch on
`origin`.

Cumulative assessment: selection and retention each have one authoritative rule;
installation preserves the configuration outside managed ownership. No speculative
Structure slice is required. Slice 3's recovery/identity continuation is one
proof loop for safe retention rather than independent features. The four slices
are bounded with the noted sizing assumptions. No remaining slice-specific or
cumulative-design concern was identified in this assessment; no separate
slice-plan refinement pass was invoked.

## Learnings

Slice 1: one selection rule in `Select reviews` is enough; recording links to it.
A worktree needs `npm ci` before `npm run format` because node_modules is not
shared from the main checkout.
