# Recheck Cursor workarounds

**Identity:** SEED-440#recheck-cursor-workarounds

**Source:** [Recheck Cursor workarounds](../../seeds/SEED-440-recheck-cursor-workarounds.md#recheck-cursor-workarounds)

## Goal and scope

Maintainers can decide which Cursor-specific Distribution workarounds to keep,
simplify, or retire from native Cursor evidence. Cover the four Cursor entries
in the [tool workaround register](../../../docs/maintainer/tool-workarounds.md)
and the interrupted-delegation boundary from
[ODF-229](../../../docs/maintainer/findings/ODF-229.md). Update the register
with build, surface, payload, evidence, disposition, and next review trigger.
Queue concrete follow-ups for any remaining product change. Do not implement
retire or simplify patches in this story. Leave Codex and Claude Code register
entries unchanged. Inconclusive is a valid disposition when evidence is missing.

## Current decisions

- **PFE.** Reuse the tool workaround register as the only durable home for
  dispositions and review triggers. Reuse the existing Cursor patches under
  review: the [exit-file wait](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host),
  the [CI generation bridge](../../../Distribution/src/skills/dough-execute-plan/scripts/ci-host-hook.mjs),
  the `cursor_version` skips in the CI, backlog-guard, and slice-clock hooks,
  the [empty-`cwd` fallback](../../../Distribution/src/skills/dough-execute-plan/scripts/slice-clock-hook.mjs),
  and [interrupted-delegation recovery](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md).
  Add no parallel review ledger or product mechanism for tracking these checks.
- **[ADR 0005 — Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)**
  §6 owns the review order and retirement bar. Prefer this Cursor session's
  native surface for each case; record the agent CLI build and any distinct
  IDE build when both matter.
- North Star dashboard and test-boundary topics do not bear on this maintainer
  register review; leave them uncited.
- Disable each workaround for its Still-necessary check with a temporary,
  reverted edit or a pinned payload that omits that patch, and name any hidden
  substitute that would invalidate the verdict. Do not leave disabled guidance
  committed.

## Decisive premises and baseline

| Premise | Observation in the consuming route | Remaining observation |
| --- | --- | --- |
| The four Cursor register entries and ODF-229 boundary are the review subjects named in the seed. | At `9a71be623`, `docs/maintainer/tool-workarounds.md` holds the four Cursor sections with Recheck procedures; ODF-229 remains open with pending native proof. | None for subject selection. |
| The cited Distribution patches still implement those workarounds. | At `9a71be623`, `wait-for-proof.md#by-host` has the Cursor exit-file loop; `ci-host-hook.mjs` has the managed-generation adopt path and `cursor_version` Claude skip; `slice-clock-hook.mjs` uses `cwd \|\| workspace_roots?.[0]` and the Claude `cursor_version` skip. | None before the reviews. |
| This host can run the Cursor-native checks. | On 2026-11-25 in this workspace, `agent --version` reported `2026.11.22-e9042b2` and `cursor --version` reported IDE `3.31.15` (`3eb8c133…`, arm64). This session is a Cursor agent with Shell and AwaitShell. | Each slice records the build and surface it actually used. |

## Ordered slices

### 1. Recheck Cursor exit-file proof wait

Type: Behavior
Status: done
Estimate: 12–15 active minutes, excluding instrumented waits.

**Behavior.** On the recorded Cursor build and surface, with the Distribution
payload pinned and the exit-file loop disabled without a hidden substitute, a
proof command that crosses the foreground window exits nonzero, and a second
command reaches the deadline. Native waiting either delivers each real result
once within the deadline without needless model wakes, or fails that bar. The
register's exit-file entry records Right problem, Still necessary, Right
solution, evidence locations, disposition, and next review trigger.

**Proof.** Read the updated register entry. Evidence names the builds, the
disabled-workaround method, the tool calls or receipts for the nonzero and
deadline runs, and the wake or early-return observation that supports the
disposition. Missing native evidence records inconclusive.

### 2. Recheck Cursor CI generation identity

Type: Behavior
Status: done
Estimate: 12–15 active minutes, excluding instrumented waits.

**Behavior.** On the recorded Cursor build, compare the identifiers Shell and
hooks expose for a parent and a child, including across a new prompt. Judge
whether a common native identity can deliver a CI failure once to the correct
agent without the temporary managed-generation bridge. Update the register's
generation-identity entry with the three-answer review, evidence, disposition,
and next trigger; name any follow-up product change without implementing it.

**Proof.** The register entry cites the observed Shell and hook identifier
fields (or their absence) and the delivery or dual-claim outcome that supports
keep, simplify, retire, or inconclusive.

### 3. Recheck Cursor import of Claude Code hooks

Type: Behavior
Status: planned
Estimate: 10–15 active minutes, excluding install waits.

**Behavior.** With both Cursor and Claude Code hook sets installed and imports
enabled, observe which handlers receive each relevant event and which can
produce effects. Judge whether native dispatch or scoped configuration already
ensures one effective handler for each intended action without the
`cursor_version` skip. Update that register entry with the three-answer review,
evidence, disposition, and next trigger.

**Proof.** The register entry cites the install state, observed receivers, and
effect ownership that support the disposition. Dual effective handlers without
a simpler native guard keep the skip.

### 4. Recheck Cursor empty-`cwd` slice-clock fallback

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

**Behavior.** Capture slice-clock (or equivalent tool-hook) input from the
coordinator and a subagent in a linked worktree, including a multi-root case
when available. Judge whether the native event reliably identifies the
command's own checkout without falling back through `workspace_roots[0]`.
Update that register entry with the three-answer review, evidence, disposition,
and next trigger.

**Proof.** The register entry cites the captured `cwd` and `workspace_roots`
values (or equivalent) for coordinator and subagent calls and the disposition
they support.

### 5. Check interrupted-delegation boundary and queue follow-ups

Type: Behavior
Status: planned
Estimate: 10–12 active minutes.

**Behavior.** Starting from ODF-229, check whether any Cursor-specific
cancellation or proof-return gap remains beyond the general interrupted-
delegation recovery practice. Record that boundary finding with build and
evidence; do not close ODF-229 unless the evidence warrants a separate
follow-up that says so. Ensure every simplify or retire disposition from
slices 1–4 has a concrete queued follow-up for the remaining product change,
and that inconclusive cases name what evidence would finish them.

**Proof.** The register or linked finding notes the boundary result. The
product backlog (or seed follow-up links) shows a concrete next story or
correction for each remaining product change; cases with no product change
need no new queue entry.

## Concern evidence

Slice-plan refinement was unnecessary. Each register case is one independent
outside-in proof loop matching one key example; the boundary check does not
share a product model with those entries. No unbounded slice concern remains.

## Execution context

- Workspace: `/Users/terryyin/git/open-dough/.worktrees/recheck-cursor-workarounds`
- Branch: `cursor/recheck-cursor-workarounds`
- Mode: story-branch; remote `origin`; target `main`
- publishedSha (claim / first-increment base): `76e8e0651496d17394f1f8fe4ae5b12797234599`
- Agent: Honoka-chan
- Replanning permission: preserve existing planning authority
- Builds at slice 1: agent CLI `2026.11.22-e9042b2`; Cursor IDE `3.31.15` (`3eb8c133…`, arm64)
- Refactor disposition (slice 1): skipped — change edits only the maintainer tool-workaround register

## Learnings

- Slice 1: on Cursor agent + AwaitShell (`2026.11.22-e9042b2` / IDE `3.31.15`), with the exit-file loop disabled and no hidden substitute, native waiting met the Still-necessary bar (nonzero exit 42 once; usable still-running observation at a 25s wait budget). Register disposition **retire**; product removal of the Cursor exit-file loop is a slice-5 follow-up. Evidence under the worktree `open-dough/evidence/` (`slice1-full-report.md` and receipts).
- Slice 2: Shell still lacks `generation_id`; disabling the managed-generation adopt path misses delivery on the owning real hook; parent mailbox generation ≠ conversation. Register disposition **keep** (no product follow-up). Evidence: `slice2-full-report.md`. beforeSubmitPrompt / live parent hook stdin remain a next-review gap.

## Verification and delivery

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use the [maintained macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  for long local runs from a fully awake machine. Use `caffeinate -s -i` on AC
  power. On battery use `caffeinate -i` with the lid open and inspect the sleep
  log afterwards. Keep default test timeouts.
- Prefer native Cursor observation as the proof of each disposition. Deterministic
  Distribution checks are not required unless a follow-up product change later
  adds them. Revert every temporary disable of a workaround before commit.
- Use the existing selective commit checks, independent refactoring, and
  delivery gates. Hosted CI retains ownership of its usual checks.
