---
id: SEED-422
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a top-priority Usage correction after the November execution-token audit
trigger_when: Selected from the product backlog for refinement
scope: one story
---

# SEED-422 — Correct stale Dashboard token totals

## Why this matters

Developers use the Usage trend to decide where execution efficiency needs
attention. The Dashboard can pick up a task's completion while still showing
an earlier, incomplete usage total as measured. Those totals enter the
rolling median and can distort comparisons long after the task finishes.

<a id="build-claude-reply-fixtures-with-makeme"></a>

### Build Claude Code reply fixtures with MakeMe steps

**Identity:** SEED-422#build-claude-reply-fixtures-with-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/773-build-claude-reply-fixtures-with-makeme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"46abd3b00e05a25b229560ae3188809e42986dc1f116e890ca5ca2a2f1d232b5","plan":"131679c54c28dadf88db541474362dd5f4dc2ecf1e795bc13ee6187b05eacfea"}}
```

**Goal:** A maintainer writing a Usage test about a Claude Code launch and its
developer replies describes the transcript through MakeMe builder steps,
rather than importing hand-written response, reply and worker-result data
helpers.

**Scope:** Replace the transcript data helpers in
`dashboard/test-support/usage-history/claudeReplyLaunch.ts` —
`response`, `repliedSession`, and `workerResult` — with
`ClaudeTranscriptBuilder` steps, after reorganizing that builder by
responsibility below the file-size limit. Its three consuming specs
(`token-index-developer-reply`, `token-index-refresh-developer-reply`,
`token-index-provisional`) keep their cases and expectations. Launch records,
home writes, import and Refresh harness calls stay as test support. Existing
builder consumers keep their import path and behavior. No product change.

**Key examples:**

- A Usage case needs a counted Opus assistant row with N output tokens → it
  uses a `ClaudeTranscriptBuilder` step that produces that row; it does not
  import `response(uuid, N)` from `claudeReplyLaunch.ts`.
- A case needs the launch session after a developer "Resume" reply answered
  with 300 output tokens → it uses a builder named example or step chain; it
  does not import `repliedSession()`.
- A case attaches the session input that returns worker `writeWorker` → it uses
  a builder step for that user row; it does not import the `workerResult`
  object.
- After the change, `claudeReplyLaunch.ts` still exports launch, write, import
  and Refresh helpers, and exports no transcript row data; the three specs
  still expect the same index values (1,950 / 4,900 / 6,850 / 10,900), coverage
  kinds and medians.
