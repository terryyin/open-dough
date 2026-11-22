# Source review

Launch: fresh general-purpose reviewer (no conversation inheritance), given only
the story's Goal, Scope and Key examples from
[SEED-422#build-claude-reply-fixtures-with-makeme](../../seeds/SEED-422-correct-stale-dashboard-token-totals.md#build-claude-reply-fixtures-with-makeme),
told to read no files and change nothing.

Unnumbered context: the Goal's motivation (describe transcripts through MakeMe
steps rather than hand-written helpers); launch records, home writes, import and
Refresh harness calls stay as test support; example values (N, 300 tokens,
`writeWorker`, "Resume") illustrate conditions; "does not import X" is the
negative form of promises 1–3.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A Usage case needing a counted Opus assistant row with N output tokens gets it from a `ClaudeTranscriptBuilder` step; it does not import `response(uuid, N)` from `claudeReplyLaunch.ts` (Key example 1; Goal; Scope) | slice 2 | observed: ClaudeTranscriptBuilder.withCountedOpusResponse used in token-index-provisional session() and token-index-developer-reply rows; no response import (passing in s2 backend proof record) |
| 2 | A case needing the launch session after a developer "Resume" reply answered with 300 output tokens gets it from a builder named example or step chain; it does not import `repliedSession()` (Key example 2; Goal; Scope) | slice 2 | observed: ClaudeTranscriptBuilder.withDeveloperReply ("Resume" + 300 output) via claudeSession().withDeveloperReply() in developer-reply, refresh-developer-reply and provisional rolling-median cases; all pass |
| 3 | A case attaching the session input returning worker `writeWorker` uses a builder step for that user row; it does not import `workerResult` (Key example 3; Goal; Scope) | slice 2 | observed: ClaudeTranscriptBuilder.withWorkerResult({ agentId: "worker" }) in developer-reply worker, refresh reply-read-late and provisional partial cases; all pass |
| 4 | After the change `claudeReplyLaunch.ts` still exports launch, write, import and Refresh helpers and exports no transcript row data; `response`, `repliedSession`, `workerResult` are gone (Key example 4; Scope) | slice 2 | observed: claudeReplyLaunch.ts exports reference, launchIn, claudeLaunch, claudeSession (launch session builder), writeLaunchSession, writeWorker, importClaude, refreshedClaudeIndex; response/repliedSession/workerResult removed |
| 5 | The three specs (`token-index-developer-reply`, `token-index-refresh-developer-reply`, `token-index-provisional`) keep their cases and still expect 1,950 / 4,900 / 6,850 / 10,900, the same coverage kinds and medians (Key example 4; Scope) | slice 2 | observed: git diff of the specs changes no test title or expect line; all cases passed after refactor in refactor-s2-backend-proof.json (208/208, strict passed) |
| 6 | `ClaudeTranscriptBuilder` is reorganized by responsibility below the file-size limit (Scope) | slice 1 | observed: wc -l: claudeTranscriptTestData.mjs 183, claudeTranscriptRows.mjs 150 (row shapes vs fluent builder) |
| 7 | Existing builder consumers keep their import path and behavior (Scope) | slice 1 | observed: usageMakeMe.mjs import path unchanged; old/new builder JSON identical over every step; usage-history backend suite, system-settings-usage-tools e2e, typecheck pass (evidence s1-*.run.json) |
| 8 | No product change (Scope) | slice 2 | observed: git diff --stat -- dashboard/server dashboard/src Distribution/src is empty |
