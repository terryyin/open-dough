# DearDough Process Findings

## DD-001 — CI observer bound to the worktree instead of the coordinator checkout

A plan executed in a Git worktree launched the execute-plan CI mailbox from that worktree's skill path. Checkout identity is derived from the skill scripts, so the mailbox bound to the worktree instead of the coordinator's main checkout. The observer had to be stopped and restarted from the main checkout.

### Occurrences

- Execution: `.planning/quick/039-native-wrap-up-acceptance/PLAN.md` at `65349b5`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `8ab5e80`; base `0.3.6`
  - Evidence: execution conversation recorded an earlier mailbox (`/tmp/dough-ci-501/watch-gQuTau`) stopped as worktree-bound; replacement `/tmp/dough-ci-501/watch-IgmJt1` `request.json` has `"root":"/Users/terryyin/git/open-dough/"`; `dough-execute-plan` runtime-setup derives checkout identity four levels above `scripts/`
  - Observed effect: first observer discarded; a second observer started from the main checkout before slice delivery
  - Inference: worktree execution plus launching the mailbox via the worktree skill path can silently bind the wrong checkout. Cost is a discarded observer plus a relaunch, not lost slice work.

## DD-002 — Native wrap-up journeys found skill gaps that one identified retry closed

Codex, Cursor, and Claude native wrap-up sessions used the skill and independent filesystem/Git checks. Three first attempts failed on promised wrap-up behavior; each closed after one fixture or source clarification and a single retry. Deterministic helpers did not catch those gaps beforehand.

### Occurrences

- Execution: `.planning/quick/039-native-wrap-up-acceptance/PLAN.md` at `65349b5`
  - Tool: Cursor
  - Model: Cursor Grok 4.6
  - Open Dough release: modified; revision `8ab5e80`; base `0.3.6`
  - Evidence: PLAN.md learnings and `evidence/slice-1/`, `evidence/slice-2/`, `evidence/slice-3/` — Codex README assimilation retry; Claude unfinished-retrospective treated DearDough as a finished review; Claude closure kept the spent plan after fixture “retain at completion” wording
  - Observed effect: native skill-use plus independent state checks exposed three wrap-up instruction gaps; each owning slice used its one-retry budget and then passed
  - Inference: useful practice for wrap-up-style Markdown skills — treat a native first-attempt failure as a product or fixture defect, correct it, and retry once. This record does not claim the same gaps recur on later executions.
