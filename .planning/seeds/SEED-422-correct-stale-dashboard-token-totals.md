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

<a id="correct-stale-token-totals"></a>

### Correct stale token totals for completed Dashboard tasks

**Identity:** SEED-422#correct-stale-token-totals
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/764-correct-stale-token-totals/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a14cbda9f7a580ac3750be08c3a658847bb099568d6beaa4b1eabd0825bfb3a4","plan":"429fedf0f58ad6ef7f17303eec7bd27adeb6e5bf443931087a4b226d0e7ad080"}}
```

**Goal:** A developer who reads the Usage trend to decide where execution
efficiency needs attention sees, after Refresh, each finished Dashboard
task's full attributable Codex or Claude Code usage, and a rolling median
built only from totals that are complete. Today a task sampled while running
can keep an early fraction of its usage as if measured, and that point skews
comparisons long after the task finishes.

**Scope:**

- Trace why the totals stayed stale, reproducing the production case where a
  later Usage check had already advanced past the omitted responses, before
  selecting the correction.
- Refresh brings in every attributable native response of a finished task
  that the store is missing, whether written before or after the previous
  check, for both hosts, and counts each response once however often Refresh
  runs.
- A finished task whose usage may still be incomplete, because native
  evidence written for it has not yet been read or because that evidence is
  missing, shows that state on its point and stays out of the rolling median
  until it qualifies. Partial coverage already shows and is already excluded;
  this adds the provisional state, which clears on the Refresh that reads the
  task's evidence through its end.
- Reconcile the accumulated production usage history against retained native
  evidence. If stale totals remain once Refresh is corrected, rehearse a
  one-time repair on a copy, then apply it to production
  (`~/.open-dough/dashboard/launch-history/usage.json`, its check record and
  the derived task summary) after a recoverable backup. Check affected totals and medians against the source evidence,
  preserve history that cannot be rebuilt, and surface its gaps on those
  tasks. Rerunning the repair changes nothing.
- Limits: no change to the index formula, tariffs, cohort filters or median
  window; no recovery of evidence that is no longer on disk, which stays
  partial; no new Usage view beyond the provisional state on existing points.

**Key examples:**

- A Claude Code task is sampled by Refresh at 28 responses while running.
  The developer then replies `Resume` in the same session, the session writes
  832 more responses, and the task is marked done. A later Usage check has
  already passed the earlier read → the next Refresh shows all 860
  responses, the point and trend update, and two further Refreshes leave the
  total unchanged.
- The same sequence on Codex, with a spawned worker writing part of the
  later responses → the worker's responses count once toward the task.
- A task is marked done after the last Usage check → its point shows
  provisional and is not in the median; the next Refresh reads it and the
  point becomes measured and eligible.
- A finished task whose native transcript is missing a file it cites → the
  point shows partial with that gap and stays out of the median, as today.
- Production: `SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed`
  shows 0.38M from 28 responses before the repair → after it, 12.64M from
  860 responses, and the opening Claude Code median moves from 3.28M to
  4.09M, matching the manual recount; the earlier short Codex totals also
  match their retained responses; a second repair run changes nothing.

**Evidence.** In the November 22 07:35 Singapore-time snapshot, Claude Code
execution `SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed`
showed 0.38M index units from 28 responses. A native recount found 12.64M
across 860 attributable responses. Correcting the earlier totals moved the
opening Claude Code median from 3.28M to 4.09M. Earlier Codex totals also
missed retained responses, though those tasks did not change the opening
median. The [task point](../../dashboard/server/tokenIndexTask.ts),
[refresh](../../dashboard/server/usageRefresh.ts),
[check record](../../dashboard/server/usageCheck.ts) and
[history import](../../dashboard/server/usageImport.ts) are starting points.

**Effort.** Medium, low confidence until the stale ingestion path is traced.
A manual recount validates the repair.

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
