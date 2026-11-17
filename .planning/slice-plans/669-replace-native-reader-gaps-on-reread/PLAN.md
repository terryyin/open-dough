# Replace native reader gaps when a session is read again

**Identity:** SEED-388#replace-native-reader-gaps-on-reread
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#replace-native-reader-gaps-on-reread)
**Source review:** [Independent promises](source-review.md)

## Execution context

- Story Branch Mode; owned execution checkout `/Users/terryyin/git/open-dough/.worktrees/replace-native-reader-gaps-when-a-session-is-rea`, branch `codex/replace-native-reader-gaps-when-a-session-is-rea`.
- Originating and integration checkout `/Users/terryyin/git/open-dough`; authorized remote `origin`, trunk `main`. Established workspace reused; starting revision `a8c858e41acd4f38068ec8a9595570c0df64ce7d`.
- Publisher `dashboard-territory.local-open-dough`, agent Anri-chan; published claim and candidate `bd2e79cd90df5d7481fcecc0dcf3703e55e82529`, confirmed on origin's execution branch. Claim CI: unobserved.
- Checkout setup: locked `npm ci` and `npm run typecheck:dashboard` passed. Check-only commit hook owns staged lint and typecheck; delivery performs selective formatting. No generation trigger.
- Replanning: preserve existing planning authority; no explicit overrun replanning option.
- CI: GitHub Actions `terryyin/open-dough`, execution branch, verified `ci.yml` / CI. Coordinator `anri-388`, directory `/tmp/dough-ci-501/watch-EAPS5a`, PID 46889, stream session 53315, yielded cell `g726:11`, runtime `.agents/skills/dough-execute-plan`; checkout as above.
- Removal check: replacement of stale session gaps has no later planned slice or conflicting source promise; host-less stored gaps remain excluded.

## Goal and scope

Import and Refresh replace a session's `malformed-native-row` and
`native-source-unreadable` gaps with the ones a reread still reports, for
Codex and Claude Code. Excluded: gaps already stored without a host (automatic
repair of stored history), any change to framing, lineage or reconciliation
rules.

## Provenance and current findings

Retrospective correction of SEED-388#read-claude-rows-with-unicode-line-separators,
reviewed commit `a3553a7ad` (story branch
`claude/read-claude-code-rows-that-contain-unicode-line`). The defect predates
that commit.

- `nativeUsageLines` in `dashboard/server/nativeUsageFiles.ts` pushes both gap
  codes with `source` only; every other Claude Code and Codex gap names its
  `host` (`claudeUsage.ts`, `codexUsage.ts`).
- `reconciledGaps` in `dashboard/server/usageGapReconciliation.ts` drops a
  stored gap only when `gapSessionKeys` finds a replaced session, and that
  returns nothing without `host`. So a host-less gap survives every reread,
  contrary to `dashboard/USAGE-HISTORY.md` ("with only the gaps it still
  reports").
- On 2026-11-16 the real-store import that restored SEED-124's responses left
  all 3,316 stored `malformed-native-row` gaps in place; the fixed reader reads
  all 79 of their files without a gap.

## Existing solution and architecture

PFE: the session-scoped replacement already exists (`reconciledGaps`,
`gapSessions`); the reader only has to name the host its callers already know.
`nativeUsageLines` has four callers: `codexUsage.ts` and `claudeUsage.ts`,
whose gaps reach the store, and `agentEffortClaudeWakes.ts` and
`agentEffortCodexWakes.ts`, which only test whether any gap occurred and keep
that behavior. No new module, dependency or ADR topic.

## Proof ownership

| Source promise / example | Slice and outside-in observation |
| --- | --- |
| A Claude Code row that was truncated at one import and complete at the next leaves no gap | 1: case in `dashboard/backend-tests/usage-history/native-line-separators.spec.ts` (or a cohesive sibling): MakeMe transcript with a truncated last row → `runImport` → one `malformed-native-row` naming `host: "claude"`; rewrite the file with the row complete → `runImport` → no `malformed-native-row`, the response counted |
| The same for a Codex rollout | 1: same pattern with `aCodexRollout` |
| Refresh replaces them the same way | 1: Refresh case beside `token-index-refresh-line-separators.spec.ts` |
| Host-less stored gaps stay | none: no code path changes them; stated exclusion |

## Decisive premises

Observed 2026-11-16 at `a3553a7ad`, Node v24.21.0.

| Premise / consuming operation | Result and limit |
| --- | --- |
| `nativeUsageLines` callers; slice 1 sizing | Four call sites, all in `dashboard/server`; the two agent-effort wake readers count gaps only, so naming the host changes nothing they observe. |
| A hosted reader gap resolves to its session; slice 1 | `gapSessions` with `host: "claude"` on a `…/<session>/subagents/agent-*.jsonl` path gives the session id; with `host: "codex"` on a `rollout-…-<thread>.jsonl.zst` path gives the thread id. Without a host, `gapSessionKeys` returns none. |

## Ordered slices

### 1. Name the host on native reader gaps
Type: Behavior
Status: done
Proof: the cases above, fail-first on `a3553a7ad`; the whole
`dashboard/backend-tests/usage-history` directory; typecheck and lint.

Behavior: a native file whose row was malformed or unreadable at one read →
import or Refresh reads its session again → only the gaps it still has remain.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Apply installed MakeMe selection before test edits. Keep default
timeouts and never `test.slow()`. Run
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`,
`npm run typecheck:dashboard` and `npm run lint`; full suites stay in hosted
CI. No long local run: sleep guard
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
applies only if one is added.

## Concerns

Refinement not needed: one Behavior slice with its proof cases named. This
review found no remaining slice-specific concern.

## Learnings

None yet.

## Accepted slice 1 proof

- Freshness: unchanged against trunk `4e92ca857857cc177e5387112b1652b08373e70c`; no named coordination sibling changed this slice's behavior.
- Original trigger: both hosts, each Import/Refresh, malformed final row or unreadable zstd. `native-reader-gaps.spec.ts` builds launch and transcript through MakeMe, imports an empty file, injects an explicit legacy gap without host, then writes damage. Initial persisted-gap assertion observes host and source; repeated reread observes still-reported damage retained once; repaired reread observes only the exact legacy gap remains, and taskUsage observes one restored request / 17 output tokens. Product assigns host at both nativeUsageLines gap sites and four callers; existing gapSessionKeys/reconciledGaps replaces only hosted session keys. All four source commitments observed.
- Fail-first on established baseline `bd2e79cd90df`: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/native-reader-gaps.spec.ts --reporter=list` — eight failures specifically missing host. This baseline still contained the reader defect identified at `a3553a7ad`.
- Same command after implementation and tightened empty-file bootstrap — 8 passed (12.0s).
- `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list` — 181 passed (2.9m). Only the new cases' bootstrap was tightened afterward; their focused rerun preserves earlier production and unchanged-test proof.
- All commands ran through slice-clock run. Logs and terminal exit files: `/tmp/native-reader-gaps-{red,green,recovery}.{log,exit}`. Implementation 4.2 active minutes; clock paused before acceptance.
- Consumer trace produced with installed consumer-trace.mjs at claim base, supplied terms nativeUsageLines, malformed-native-row, native-source-unreadable; annotated result `/tmp/native-reader-gaps-consumer-trace.md`. Inspected production purposes: usageScan/importUsageHistory/usageImport (CLI), usageRefresh/usageRefreshFiles (HTTP), usageGapReconciliation (persisted session replacement), agentEffortRequest/agentEffortReport/agentEffortWakes and both wake readers (passive effort classification). Import/Refresh matrix observes persisted replacement. Existing agent-effort-wakes scenarios assert request totals, classified/unclassified counts, clock/progress and storage bytes for both hosts; agent-effort-peaks missing-readable-row case asserts lower-bound peak and malformed-native-row. These all ran in the 181 cases. Other imports use unchanged objectOf/stringOf/timestampOf/nativeUsageFileName, lineage or task facts; the host parameter does not reach those exports. Broad PLAN.md/source-review and fixture-name matches are record references, outside the reader-gap contract. No runtime consumer left unproved.
- No test outside the slice subject was edited. No generation trigger, live action, expensive full-suite gate or unresolved proof gap. Staged lint/typecheck remain hook-owned.

- Independent refactor `/root/refactor_review`: production cohesive; test-only named session/operation/damage variants remove branches and one redundant pre-bootstrap zstd write. Same scenarios and observing assertions retained. Final focused command above: 8 passed (9.3s); prior whole-suite proof preserved for unchanged code/tests. Refactor consumer trace `/tmp/native-reader-gaps-refactor-consumer-trace.md`; local test helpers have no runtime consumers, planning matches excluded. `git diff --check` passed; `## REFACTOR COMPLETE`, no follow-ups. Coordinator inspected final setup/actions/assertions and accepted.

- Preparation caught ESLint unbound-method on refactor's returned refresh method before commit. Already-traced mechanical repair in that accepted test path retains the usage receiver in an arrow callback; same focused command passed all 8 in 7.3s. No representation, consumer or production change. Required formatting is retried for this repair.

## Retrospective

- Planned execution, unchanged source/plan at established claim. Related publications: claim `bd2e79cd90df5d7481fcecc0dcf3703e55e82529` (provenance), implementation `8e62635e227962d87359188b00f8a21f9c54aba1` (sole product change). Nearby preparation/claim commits for SEED-348, SEED-392 and SEED-393 are unrelated and excluded. No source amendment or scope change.
- Goal/scope satisfied: all four source commitments match inspected product and persisted Import/Refresh assertions. Reader host ownership reuses existing reconciliation; passive wake readers still consume only gap presence. No correction, architecture conflict, residue or supported test-cost cleanup. Dashboard local operational-state distinction under Accepted ADR 0008 is preserved; North Star has no Usage-specific unfinished direction realized here.
- Backend service tests drove development fail-first; no browser E2E added. CLI and HTTP exercise real readers, store and reconciliation within one service, so detailed cases belong at this unit boundary. Existing Usage/effort suite remains unchanged. Final revised assertions were rerun after refactor/receiver repair.
- Intent Coverage selection: enabled, but no protection risk. Existing tests/assertions/discovery untouched, only new cases refactored; all original faults observed fail-first. No important promise remains questioned. No automatic check requested; process therefore reviewed here, not deferred.
- Process reviewed from actual coordinator/tool/subagent record. DearDough.md adds this execution to ODF-264 (truncated broad reads) and ODF-329 (lint-first exposed unbound method after refactor); bounded ordinary write 444 to 460 physical lines, no retention. No process-rule edits or product follow-up authorized.
- CI for implementation remains pending on story branch observer `/tmp/dough-ci-501/watch-EAPS5a`; final result belongs to coordinator completion, not review. Review complete; planning unchanged, product advice no change, no unresolved attention.

## Execution complete

Product advice: no change.
