# Build Claude Code reply fixtures with MakeMe steps

**Identity:** SEED-422#build-claude-reply-fixtures-with-makeme
**Source:** [Build Claude Code reply fixtures with MakeMe steps](../../seeds/SEED-422-correct-stale-dashboard-token-totals.md#build-claude-reply-fixtures-with-makeme)

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

## Preserved promises and constraints

- Every case in the three specs keeps its scenario and expected values (index
  1,950 / 4,900 / 6,850 / 10,900, coverage kinds, medians).
- The Distribution and e2e consumers of `ClaudeTranscriptBuilder` keep their
  behavior; its public steps keep their names and outputs.
- MakeMe convention: `.agents/skills/dough-makeme/SKILL.md`; test-entry
  selection `makeMe: true` for these specs.

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
- the Distribution and e2e specs the consumer trace finds for
  `ClaudeTranscriptBuilder` and `claudeTranscriptTestData`
- `npm run typecheck:dashboard`

## Slices

### 1. Reorganize the Claude transcript builder below the size limit

Type: Structure
Status: planned
Proof: every consumer the trace finds for `claudeTranscriptTestData` passes
unchanged, and the files are each under 250 lines.

### 2. Reply fixtures use builder steps

Type: Structure
Status: planned
Proof: the three Usage specs pass with the same expectations, and
`claudeReplyLaunch.ts` exports no transcript row data.

## Story obligations
