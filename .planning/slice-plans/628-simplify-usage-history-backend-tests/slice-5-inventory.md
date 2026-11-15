## Slice 5 inventory (import-report group and family totals)

Trunk merge first (`origin/main` into this branch at `3ab557e62`). No new
usage-history family specs on trunk since Take (**16**); the 28-file set is
unchanged. Native evidence identity path after regroup:
`Distribution/tests/native-harness/native-evidence-identity.sh`.

Starting size for this group (before slice 5 edits): 2 specs, 286 lines, 2
tests. No consolidation between the two — distinct setups (native import report
vs persisted-window activity).

| Starting test | Distinct behaviors (as assertions observe) | Surviving test |
| --- | --- | --- |
| `import-report`: reports configured in-window work separately from retained old launches, unknown projects and unassigned usage | Configured (hidden) project + historical title/identity; in-window Claude+Codex configured work vs outside-window retained launch; unknown-project and unassigned observations; unrelated project excluded; private input stripped; import idempotence; earliest/first-in-window times | same title |
| `import-report-window`: counts recorded in-window activity without attributed counters and keeps undated tasks unresolved | Persisted in-window activity without counters; undated → unresolved; early launched → outside window; firstInWindowActivity | same title |

No scratch-break: assertions stay on the same setups after builder migration.

### Slice 5 concision (import-report group)

| Metric | Before | After |
| --- | --- | --- |
| Spec files | 2 | 2 |
| Lines (`wc -l`) | 286 | 291 (builder chains; net family still under story baseline) |
| Tests (Playwright list) | 2 | 2 |
| `at` imports from harness in group | yes | none (asserted times use `usageHistoryDefaultAt`) |
| `nativeFile(` in group | 6 | 1 (`orphan` missing `session_meta` under proof) |
| `meta`/`context`/`response` helpers | yes | none |

### Family final counts (story baseline 47 tests / 4,481 lines)

| Metric | Story baseline | After slice 5 |
| --- | --- | --- |
| Spec files | 28 | 28 |
| Lines (`cat … \| wc -l`) | 4,481 | 4,445 |
| Tests (Playwright list) | 47 | 46 |
| Harness `at` export | yes | none |
| Family imports of harness `at` | 18 specs at baseline | **0** |
| `nativeFile(` in family | 74 at baseline | 6, all layout / missing-meta under proof |
| `export const meta\|context\|response` | temporary helpers | **0** |
| Largest family/helper `.ts` | ≤250 | ≤250 (PLAN.md 240) |

Family focused run: **46 passed** (42.0 s). Local gate: `npm run lint`,
`npm run typecheck:dashboard`, and
`bash scripts/test.sh Distribution/tests/native-harness/native-evidence-identity.sh`
green. MakeMe true for both import-report specs.

### Greps (proof locations for G1 / G2 / measured result)

```text
# harness at export — none
rg 'export const at\b' dashboard/tests/usage-history → (none)

# family at imports from harness — none
rg '^\s*at,' dashboard/backend-tests/usage-history → (none)

# temporary row helpers — none
rg 'export const (meta|context|response)\b' dashboard/tests/usage-history → (none)

# nativeFile — layout / missing-meta only
codex-usage.spec.ts: archive `.zst` path
codex-coverage.spec.ts: partial path; empty broken file
claude-usage.spec.ts: `subagents/` worker path
claude-coverage.spec.ts: workers orphan layout
import-report.spec.ts: orphan without session_meta
```

Guide and builder comment: `Distribution/tests/test-data-architecture.md`
names `aCodexRollout` / `aClaudeTranscript` / `aUsageTask` and the import
harness writers; `usageHistoryTestData.mjs` points native wire rows at those
builders.
