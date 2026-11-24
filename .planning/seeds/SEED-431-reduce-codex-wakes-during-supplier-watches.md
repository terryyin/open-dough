---
id: SEED-431
status: active
planted: 2026-11-24
planted_during: Wrap-up of the released Codex supplier-watch evaluation
trigger_when: selected from the product backlog
scope: one story
---

# SEED-431 — Reduce Codex wakes during supplier watches

<a id="reduce-codex-wakes-during-supplier-watches"></a>

### Reduce Codex wakes during supplier watches

**Identity:** SEED-431#reduce-codex-wakes-during-supplier-watches
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer can leave a Codex coordinator monitoring a named
blocking supplier with at most one model request per started five unchanged
minutes and at least 90% cached input when requests occur. The coordinator
acts on the supplier's publication or deadline and keeps the original deadline
when it resumes a hold after an intermediate result.

**Scope.** Address early returns from Codex cell waits and empty shell polls
that hand back a running process. Preserve the shared command's silent
publication and deadline receipts and Claude Code's existing wait behavior.
Check a publication that arrives while the coordinator judges an intermediate
result. Keep evidence of request attribution and terminal handling together.

**Starting evidence.** The released evaluation observed three Codex 0.171.0
executions in the SEED-413 workstream with Open Dough 0.3.109. At least 94
wait-only requests exceeded an allowance of 19 across five intervals. All five
publication results were handled, and both reruns kept the original deadline.
Natural deadline handling and realized savings remain unmeasured.
[Evaluation and raw trace locators](https://github.com/terryyin/open-dough/blob/034822b01088941dd0b306874bc608e12c11be38/.planning/slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md#measured-watches-and-recommendation)
