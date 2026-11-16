# Read native rows that contain Unicode line separators

**Identity:** SEED-388#read-claude-rows-with-unicode-line-separators
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#read-claude-rows-with-unicode-line-separators)

## Goal and scope

The Usage index counts every response a launch's native transcripts record,
including rows whose text holds a raw U+2028 or U+2029. The native reader
frames rows on newline only, for both hosts and for import and Refresh alike;
a still-invalid row stays a `malformed-native-row` gap at its file line, and
reading stays bounded in memory. Existing stores gain the responses on their
next `import`. Excluded: automatic repair of stored history, any change to
lineage or reconciliation rules.

## Existing solution and architecture

PFE: `nativeUsageLines` in `dashboard/server/nativeUsageFiles.ts` is the one
reader both `codexUsage.ts` and `claudeUsage.ts` use; change it in place. Its
`readline` interface applies Unicode line-break rules that JSON Lines does not.
Other dashboard readers (`launchHistory.ts`, `incidentRecordFiles.ts`) read
small Open Dough-owned files whole and split on `"\n"`; whole-file reading
does not fit native transcripts. No new dependency, module or architectural
topic is needed; [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
is unaffected.

Direction: split the (decompressed) byte stream at `0x0A`, which never occurs
inside a UTF-8 multi-byte sequence, then decode each frame and drop one
trailing `\r`. Keep the existing gap codes, unreadable-source handling and
zstd pipeline.

## Proof ownership

| Source promise / example | Slice and outside-in observation |
| --- | --- |
| A Claude Code row with U+2028/U+2029 is read whole; later rows climb through it | 1: new case in `dashboard/backend-tests/usage-history/claude-usage.spec.ts` (or a cohesive sibling): MakeMe `aClaudeTranscript` launch input → assistant whose text holds both separators → assistant parented to it; `runImport` → task has 2 requests and no `malformed-native-row` gap |
| A Codex row with U+2029 is read whole | 1: same pattern with `aCodexRollout` in `codex-usage.spec.ts`; the response is counted, no gap |
| A truncated row stays a gap; independent responses survive | 1: existing `codex-coverage.spec.ts` "keeps independent responses through damaged files…" stays green |
| SEED-124's launch matches its transcript cost after one import | 1: back up `~/.open-dough/dashboard/launch-history/usage.json`, run `caffeinate -s -i node dashboard/server/importUsageHistory.ts import --since '2026-09-16T00:00:00+08:00'`, then derive the task summary and `tokenIndex` for SEED-124#save-pronunciations-as-note-properties → 15.42M; record the store's remaining `malformed-native-row` count (expected 0) and that no launch dropped |

## Decisive premises and preparation observations

Observed 2026-11-16 in this owned checkout at `43ae7f5be6ad3125386141646f879f85f2019806`,
Node v24.21.0. Scratch edits were reverted; scratch files lived in the job's
tmp directory.

| Premise / consuming operation | Result and limit |
| --- | --- |
| `readline` splits a valid row at U+2028; slice 1 | `createInterface({crlfDelay: Infinity})` over `{"a":"x<U+2028>y"}` yields two lines. |
| The separator is the only cause of stored `malformed-native-row` gaps; slice 1's real-store figure | Every row under `~/.claude/projects` (1.55M) and `~/.codex` (4.98M) parses when split on `\n` alone; no lone CR exists. 124 separator rows break into 3,320 unparseable pieces against the store's 3,316 gaps. |
| The new case discriminates; slice 1 | A scratch spec of the case above, run with `npx playwright test --config dashboard/backend.playwright.config.ts <spec> --reporter=list`, failed on the current reader (three `malformed-native-row` gaps) and passed with a scratch `0x0A` splitter, together with `codex-coverage.spec.ts` (both cases green). |
| Reader change alone restores SEED-124's 15.42M; slice 1 | Scratch `importUsageHistory.ts import` over a scratch home (copied launch records) and a copy of SEED-124's transcript directory, with only `nativeUsageFiles.ts` swapped by a module hook: session `6410f8b0…` 353 → 435 responses, index 12.74M → 15.42M, 30 → 0 `malformed-native-row` gaps; the other session unchanged at 6.16M. The real-store import remains the slice's proof. |

## Ordered slices

### 1. Count native rows that contain Unicode line separators
Type: Behavior
Status: planned
Proof: the new Claude Code and Codex cases and the whole
`dashboard/backend-tests/usage-history` directory; typecheck and lint; the
real-store import figure above.

Behavior: a native transcript row whose text holds raw U+2028 or U+2029 →
import or Refresh → the row is read whole, its response and the rows climbing
through it are counted, and no `malformed-native-row` gap is recorded; a
genuinely broken row stays a gap at its file line.

## Concerns and cumulative design

Slice-plan refinement was not needed: one reader change with one outside-in
proof loop. This review identified no remaining slice-specific concern or
human pre-Take decision.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Apply installed MakeMe selection before test edits. Keep default
timeouts and never `test.slow()`. Run specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`,
plus `npm run typecheck:dashboard` and `npm run lint`; full suites stay in
hosted CI. The real-store import took 611–940 s on 2026-11-16: local-gate
sleep guard [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
start fully awake and run it under `caffeinate -s -i` on AC power.

## Learnings

None beyond the preparation observations above.
