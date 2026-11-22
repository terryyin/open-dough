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

**Goal:** A maintainer writing a Usage test about a Claude Code launch and its
developer replies describes the transcript through MakeMe builder steps,
rather than importing hand-written response, reply and worker-result data
helpers.

**Scope:** Replace the transcript data helpers in
`dashboard/test-support/usage-history/claudeReplyLaunch.ts` with
`ClaudeTranscriptBuilder` steps, after reorganizing that builder by
responsibility below the file-size limit. Its three consuming specs keep their
cases and expectations. No product change.

**Plan:** [Build Claude Code reply fixtures with MakeMe steps](../slice-plans/773-build-claude-reply-fixtures-with-makeme/PLAN.md)
