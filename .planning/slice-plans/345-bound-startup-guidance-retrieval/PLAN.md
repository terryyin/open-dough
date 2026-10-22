# Retrieve startup guidance within the response budget

**Identity:** SEED-010#bound-startup-guidance-retrieval
**Source:** [Story 13](../../seeds/SEED-010-learn-from-execution-retrospectives.md#bound-startup-guidance-retrieval)

## Goal and scope

An executing agent obtains the guidance passages it needs at startup without
truncated tool results, so it stops re-reading references before its first
delegation. The response changes the shape of the execute-plan skill's
reading instructions: every boundary names its reads in one place, each
boundary's reads fit the smallest supported host's single tool result, and a
repository check keeps them there.

Included: the startup and later-boundary reading instructions in
`src/skills/dough-execute-plan/SKILL.md`; headings or anchors a reference
needs so a boundary can name a passage rather than a whole file; the read
budget check and its constants; the before-and-after measurement recorded
here for ODF-264.

Excluded (story): a startup digest restating guidance; host output settings;
startup reads of other skills; per-host savings in ordinary executions, which
Evaluation observes after release; ODF-158's full concern, beyond recording
which reads leave startup; project-content reads (plan, seed, backlog). Also
excluded: a retrieval script that prints passages, considered below and not
selected; shortening or rewriting reference prose, since every boundary's
reads already fit once named per boundary.

Assumptions: the installed managed copies under `.agents/skills/` and
`.claude/skills/` change only through a release, so this delivery edits
`src/skills/` and measures there; the native-run harnesses that copy
`references/ci-monitor.md` into fixtures keep working because no file is
renamed or split.

## Preparation observations and decisive premises

Observed on 2026-10-22 in this checkout at `85897eeb`. No product file was
changed; no paid or native host run took place. Sizes are bytes of the
current source files.

| Premise and consuming operation | Literal observation | Result |
| --- | --- | --- |
| Codex truncates one tool result near 10,000 tokens, so a batch above that loses passages. | `gh search code "truncation_policy" --repo openai/codex`: `core/src/tools/handlers/unified_exec_tests.rs` `TruncationPolicy::Tokens(10_000)`; fallback model policy `TruncationPolicyConfig::bytes(10_000)` in `protocol/src/openai_models.rs`. ODF-264's smallest truncated startup result: 10,205 original tokens (SEED-010#check-shared-host-proof-headroom). | Settled: 10,000 tokens per tool result; 10,000 bytes for an unrecognized model slug. |
| Claude Code's Bash tool replaces a result above 30,000 characters with a saved file and a 2KB preview. | Retained Claude streams under `tests/fixtures/native-streams/claude`: largest ordinary Bash result 29,784 characters; six results of 33.5KB to 36.7KB read "Output too large … Preview (first 2KB)". ODF-264: 30.5KB and 32.2KB batches (SEED-075#story-1). | Settled: 30,000 characters per Bash result. The smallest supported budget. |
| On Codex the skill body is itself a tool result; on Claude Code the Skill tool loads it. | Retained Codex stream `codex/publication/startup-resume/20260923T063055-65d4`: first command `sed -n '1,240p' .agents/skills/dough-execute-plan/SKILL.md` (14,446 bytes then; 17,750 now). This session received the skill through the Skill tool, not a Bash result. | Settled: the skill body is its own read on Codex and counts toward no other row. |
| Each boundary's reads, named per boundary, fit 30,000 bytes without rewriting prose. | Sections measured with `awk` from `## ` heading to the next: established-start 2,922; execution-location 10,029 (+ runtime-setup 8,761 when CI setup applies: 18,790); Codex arming at start: ci-monitor "Own one observer" 4,561 + ci-notify-codex 7,750 + runtime-setup 8,761 = 21,072; first delegation: delegation 14,601 + execution-decisions "Reassess before extending work" 3,321 + "Stop for human judgment" 1,089 + "Choose replanning permission" 406 + disposable-research 1,297 = 20,714; return acceptance: wrap-up "Accept proof" 8,544; delivery: wrap-up "Deliver the change" 9,248 + trunk-publication 15,269 = 24,517; arming on other hosts: ci-monitor 18,382 + ci-notify-hosts 9,081 = 27,463; notification: ci-monitor "Handle a notification" 10,062 + adapter; finish: finish-or-stop 13,523 + ci-monitor "Await the applicable revision at completion" 2,619 = 16,142. | Settled: every row fits; the largest (27,463) leaves little headroom, which is why the check exists. |
| Today's startup wording names about 110KB at adjacent boundaries, which agents batch. | `SKILL.md` lines 86–99 name, in one paragraph: delegation, execution-decisions sections, proof acceptance, delivery, CI observation plus adapter, execution-location, trunk publication, targeted retrieval. Sum of the named files and sections: 33,665 before the first delegation, 107,381 across the paragraph; 125,131 with the skill body on Codex. The retained batches of 16,000 to 31,000 tokens match. | Settled: the before measurement. |
| Link anchors match heading slugs, so a check can resolve `file.md#anchor` to a section. | `references/wrap-up.md#accept-proof` ↔ `## Accept proof`; `execution-decisions.md#choose-replanning-permission` ↔ `## Choose replanning permission`; `ci-monitor.md#own-one-observer` ↔ `## Own one observer`. `tests/support/markdown-section.mjs` already reads one `## ` section by exact heading. | Settled for `## ` headings; the check adds slug matching and ends a section at the next heading of the same or higher level. |
| A new `node --test` file beside the skill's scripts runs in the suite. | `tests/node-test-files`: `src/skills/*/scripts/*.test.mjs`; ten existing `*-guidance.test.mjs` files there read `SKILL.md` and references through that helper. | Settled. |
| Changing the startup paragraph breaks no existing guidance test. | `grep` for "Before first implementation delegation", "Before arming observation", "before delivery, read", "Before accepting a return" across `src/skills/*/scripts/*.test.mjs`, `tests/support`, `tests/*.sh`: no match. | Settled; the slice still runs the skill's test files. |
| Every installed file is declared, so no new file is needed. | `install.sh` `managed_files` lists each reference (lines 129, 132); `tests/payload-declaration-links.sh` checks links against it. | Settled: the slice adds no file to the payload, only a test file outside it. |

No premise needs a paid, credentialed, or owner-held observation.

## Existing solutions and architectural direction

PFE across the repository:

- The skill already ties reads to boundaries in prose and already has
  [targeted retrieval](../../../src/skills/dough-execute-plan/references/disposable-research.md)
  for a truncated passage. What is missing is one place that lists each
  boundary's reads and says what one tool result holds. The response makes
  that list the instruction; it adds no second retrieval rule.
- `tests/support/markdown-section.mjs` and the `*-guidance.test.mjs`
  pattern are the home for a check that reads the skill's own text. The
  check reads the table in `SKILL.md`, so the skill stays the single source;
  no manifest duplicates it.
- A retrieval script printing a boundary's passages was considered and not
  selected: it would be payload code for a reading problem, agents could
  still batch two of its calls into one result, and the table plus budget
  check give the same bound without it. The story allows it; nothing here
  needs it.
- Splitting `delegation.md` or `execution-location.md` was considered and
  not selected: every row fits as named. Adding a heading to a reference is
  slice-local when a row needs a passage rather than the file.

ADR 0005 keeps deterministic payload checks in CI and native behavioral
evidence separate: the check proves the bound, not agent behavior; Story 13's
Evaluation observes behavior after release. ADR 0006 keeps the table written
for the executing agent in its project. No North Star topic is needed.

## Outside-in proof

| Promise | Owner and proof |
| --- | --- |
| Every boundary's reads are named in one table, with the reading shape: one row per tool result, read at that boundary and not earlier, the skill body as its own read on hosts that read it. | Slice 1: guidance test asserts the table's presence, its row order (skill body, established start, setup, Codex arming, first delegation, return, delivery, arming on other hosts, notification, finish), and that every link in it resolves to an existing file or heading. |
| Each row fits the smallest supported host budget, so a batch of one row is never truncated on Codex (10,000 tokens) or Claude Code (30,000 characters). | Slice 1: the same test sums each row's bytes (whole file, or the section a `#anchor` names, ending at the next heading of the same or higher level) and asserts the sum is at most 30,000 bytes, which also keeps it under 10,000 tokens at the 3.5 bytes per token the check documents; a failing row is named with its overflow (key example 4). |
| The startup prose names nothing a row omits: the references the paragraph names today all appear in a row, so no passage an execution needs is lost (key examples 3 and 5). | Slice 1: the test asserts every reference file under `references/` that the current paragraph names is linked from some row; the executor reviews the rewritten prose against the former paragraph. |
| The before-and-after measurement is recorded. | Slice 1: Learnings here record the before figures above and the after figures the test prints; wrap-up carries them to ODF-264. |
| Nothing else in the skill changes meaning. | Slice 1: the skill's existing `*.test.mjs` files, `tests/payload-declaration-links.sh`, and `npm run lint` stay green. |

Consumers of the changed text, traced for this plan: the ten guidance tests
beside the skill (none match the rewritten paragraph); `install.sh`'s
declaration and the link check (no file added or renamed); the native-run
harnesses that copy references by path (unchanged paths); the installed
managed copies (updated only by release). Local checks for the slice: the
skill's `node --test` files, `bash tests/payload-declaration-links.sh`, and
`npm run lint`. Hosted CI runs the rest after publication.

## Ordered slices

### 1. Each execute-plan boundary names reads that fit one tool result
Type: Behavior
Status: done
Proof: new `src/skills/dough-execute-plan/scripts/read-budget-guidance.test.mjs`: (a) `SKILL.md` has one boundary-reads table under a heading the test names, whose rows are in execution order and whose first row is the skill body for hosts that read it; (b) every link in the table resolves to a file under the skill or a heading in it; (c) each row's bytes, summed over whole files and anchored sections, is at most 30,000, with the constant's two sources (Codex `TruncationPolicy::Tokens(10_000)` at 3.5 bytes per token; Claude Code Bash 30,000 characters) in a comment, and a failure message naming the row and its overflow; (d) every reference the former startup paragraph named appears in some row; (e) the test prints each row's size so the after measurement is in the run's output. Before the change, (a) fails for want of the table; a scratch row holding today's paragraph as one row fails (c) at 107,381 bytes, the before figure. Then the skill's `node --test` files, `bash tests/payload-declaration-links.sh`, and `npm run lint`.

Behavior: a coordinator reaches a boundary of planned or quick execution under the installed skill → it reads that boundary's row from the table, one row per tool result, at that boundary and not before → the result arrives complete within the smallest supported host budget, and no passage the former wording named is unreachable. `SKILL.md` replaces the startup paragraph (lines 86–99) with the table and its reading shape: one row per tool result; read a row when its boundary is reached, never earlier or combined with another row; on a host that reads the skill body as a tool result, the body is its own read; a truncated or absent passage follows targeted retrieval of that passage alone. Rows name sections by anchor where a file's later sections belong to a later row (execution-decisions, wrap-up, ci-monitor); a reference that needs a heading for that gets one, with its links updated. The rows the measurement above lists are the starting content; the executor adjusts a row only to keep its boundary complete or within budget. Learnings record the after figures.

## Current decisions

- The table in `SKILL.md` is the single source of each boundary's reads; the
  check reads it. No manifest, digest, or retrieval script.
- The budget constant is 30,000 bytes per row, the smaller of the two settled
  budgets, with the Codex token policy documented beside it. The check
  estimates tokens at 3.5 bytes per token; tool output counts are not billed
  tokens.
- Rows name passages by anchor only where a file's other sections belong to a
  later row; a whole file that fits stays a whole-file read, since prose
  rewriting is excluded.
- Codex's arming at execution start is its own row before first delegation,
  so the Codex startup is three bounded reads after the skill body, not one
  batch.

## Learnings

- After measurement (slice 1, `read-budget-guidance.test.mjs` diagnostics,
  bytes per row against the 30,000 budget): skill body 19,090; established
  start 2,922; execution workspace 18,790; Codex arming at start 21,071; first
  delegation 20,711; accepting a return 8,543; delivery 24,517; arming on other
  hosts 27,463; CI notification 26,892 (both adapters summed as the upper
  bound, though only the current host's is read); finish 16,141. Before: the
  former paragraph's set as one row measures 106,894 bytes with the check's
  section rule (exceeds by 76,894), against the preparation's 107,381 by `awk`.
  The skill body grew 1,340 bytes with the table.
- Estimated tokens (bytes ÷ 4, the story's estimate; the check's 3.5 bytes
  per token is stricter): before, about 8,400 tokens named before the first
  delegation and about 26,800 across the former paragraph (31,300 with the
  skill body on Codex). After, per row: skill body 4,800; established start
  700; execution workspace 4,700; Codex arming 5,300; first delegation 5,200;
  accepting a return 2,100; delivery 6,100; arming on other hosts 6,900; CI
  notification 6,700; finish 4,000. No row reaches 7,500 tokens.
- Reads that left startup (for ODF-158): before the first delegation the
  skill now names only established start, execution location (with runtime
  setup when CI setup applies), on Codex the observer arming row, and the
  first-delegation row. Proof acceptance, delivery, trunk publication, CI
  observation beyond "Own one observer", the Cursor and Claude Code adapter,
  notification handling, and finish or stop move to their own boundaries.
- One consumer the preparation grep missed:
  `execution-worktree-preparation.test.mjs` asserted the former "Before
  creating the execution workspace, read … execution-location" wording; it now
  asserts the table row.
- The runner's quiet-pass rule (`scripts/test.sh`, `tests/README.md`: a
  passing job must write nothing) replaced proof item (e)'s printed sizes:
  CI run 39712519878 failed the test for its `t.diagnostic` lines, so the test
  now reports sizes only in an overflow's failure message; the after figures
  above stay the record.

## Concern evidence

Slice-plan refinement was not needed: one bounded outcome, one proof loop,
and no preparatory Structure, since every row fits without restructuring. The
one slice touches a single skill file, at most a heading in a reference, and
one new test. No remaining slice-specific concern was identified. The
arming-on-other-hosts row's 27,463 bytes is the closest to the bound; the
check's failure message makes any later overflow visible, which is an
accepted trade-off, not a concern.
