# Build Claude Code reply fixtures with MakeMe steps

**Identity:** SEED-422#build-claude-reply-fixtures-with-makeme
**Source:** [Build Claude Code reply fixtures with MakeMe steps](../../seeds/SEED-422-correct-stale-dashboard-token-totals.md#build-claude-reply-fixtures-with-makeme)
**Source review:** [source-review.md](source-review.md)

## Provenance and findings

Retrospective correction of SEED-422#correct-stale-token-totals (plan 764,
commits `05428907e`–`bb1056672`). Slice 1's refactor moved the reply spec's
inline helpers into `dashboard/test-support/usage-history/claudeReplyLaunch.ts`,
which now exports about ten values. Three specs import them:
`token-index-developer-reply.spec.ts`, `token-index-refresh-developer-reply.spec.ts`
and `token-index-provisional.spec.ts`. Three of those exports are transcript
data written beside the builder rather than through it:
- `response(uuid, output)`, an assistant row with Opus usage counters;
- `repliedSession()`, a developer reply plus its answer;
- `workerResult`, the input returning a worker.

They are the MakeMe smell of many imported data helpers. The builder they
belong on, `Distribution/tests/support/claudeTranscriptTestData.mjs`
(`ClaudeTranscriptBuilder`), is already 274 lines, over the 250-line limit, so
the refactor pass could not add the steps. The other exports (launch records,
home writes, import and Refresh harness calls) are setup operations, not
transcript data. They may stay as test support.

## Goal and scope

Maintainer Usage tests about a Claude Code launch and its developer replies
describe transcript rows through `ClaudeTranscriptBuilder` steps instead of
importing `response`, `repliedSession`, and `workerResult` from
`claudeReplyLaunch.ts`. Reorganize that builder by responsibility below the
250-line limit first. The three consuming specs keep their cases and
expectations. Launch/write/import/Refresh helpers stay as test support.
Existing builder consumers keep their import path and behavior. No product
change.

## Outside-in proof

- Counted Opus assistant with N output tokens → builder step; no imported
  `response(uuid, N)`.
- Launch session after a developer "Resume" reply (300 output tokens) →
  builder named example or step chain; no imported `repliedSession()`.
- Session input returning worker `writeWorker` → builder step; no imported
  `workerResult`.
- After the change, `claudeReplyLaunch.ts` exports no transcript row data;
  the three specs still expect 1,950 / 4,900 / 6,850 / 10,900, coverage kinds
  and medians.

Observable signals: the three Usage specs pass unchanged; a consumer search
for `response|repliedSession|workerResult` from `claudeReplyLaunch` finds no
transcript-row imports; `claudeTranscriptTestData` consumers keep passing;
each reorganized file is under 250 lines.

## Preserved promises and constraints

- Every case in the three specs keeps its scenario and expected values (index
  1,950 / 4,900 / 6,850 / 10,900, coverage kinds, medians).
- The Distribution and e2e consumers of `ClaudeTranscriptBuilder` keep their
  behavior; its public steps keep their names and outputs.
- MakeMe convention: `.agents/skills/dough-makeme/SKILL.md`; test-entry
  selection `makeMe: true` for these specs.
- Import path `Distribution/tests/support/claudeTranscriptTestData.mjs` and
  `makeMe.aClaudeTranscript` stay stable for existing consumers.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| `claudeTranscriptTestData.mjs` is over the 250-line limit | Slice 1 split; `wc -l` after | `wc -l Distribution/tests/support/claudeTranscriptTestData.mjs` at preparation → 274 | Open for split; size claim settled |
| `response`, `repliedSession`, `workerResult` are the only transcript-row exports in `claudeReplyLaunch.ts` | Slice 2 removal | Read `claudeReplyLaunch.ts` at preparation: those three are row data; remaining exports are launch/write/import/Refresh | Settled |
| Existing consumers import the builder module path or `makeMe.aClaudeTranscript`, not private file layout | Slice 1 keep export path | Trace: `usageMakeMe.mjs` re-exports `ClaudeTranscriptBuilder`; dashboard Usage specs and `e2e/configuration/system-settings-usage-tools.spec.ts` go through MakeMe | Settled for path-stable split |

## Current decisions

- Split `claudeTranscriptTestData.mjs` by responsibility, for example row
  shapes versus the fluent builder, without changing its exports' import
  path for existing consumers.
- Add steps for the counted Opus response, the developer reply turn, and the
  worker result, reusing `withCountedAssistant` and `withUser` where they
  already express the row.

## Local gate

Run from an awake machine on AC with `caffeinate -s -i`, the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`. Keep
default test timeouts and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

- `npm run --silent test:dashboard:backend -- dashboard/backend-tests/usage-history --workers=2`
- `e2e/configuration/system-settings-usage-tools.spec.ts` when the builder
  export shape changes (only Claude-transcript e2e consumer the trace finds)
- `npm run typecheck:dashboard`

## Slices

### 1. Reorganize the Claude transcript builder below the size limit

Type: Structure
Status: done
Proof: every consumer the trace finds for `claudeTranscriptTestData` /
`makeMe.aClaudeTranscript` passes unchanged, and the files are each under
250 lines.

Internal change: split `claudeTranscriptTestData.mjs` by responsibility while
keeping the same module export path. Enables slice 2 to add reply fixture
steps without growing past the limit.

### 2. Reply fixtures use builder steps

Type: Structure
Status: done
Proof: the three Usage specs pass with the same expectations, and
`claudeReplyLaunch.ts` exports no transcript row data.

Internal change: add builder steps (and any named example) for the counted
Opus response, developer-reply turn, and worker-result row; rewrite
`claudeReplyLaunch.ts` and the three specs to use them. Owns the
correction outcome directly.

CI repair (run 45009209667): the native-stream guard refused the
`tool_result` literal in `withWorkerResult`; the content moved to
`claudeTranscriptRows.mjs`, now a listed shape writer. Local proof had not
run the Distribution native-harness tests that guard Distribution/tests.

## Execution complete

Product advice: no change. The reply fixtures now read as builder steps and
the neighbouring Claude refresh and coverage specs share them; no product
learning alters current priorities.

## Concern evidence

Slice-plan refinement was not needed: two Structure slices under the limit,
slice 1 solely enables slice 2, proof maps to the seed's key examples, and
no remaining slice-specific concern.

## Story obligations
