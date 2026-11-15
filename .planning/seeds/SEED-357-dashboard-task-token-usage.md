---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched Codex tasks

<a id="reuse-unchanged-usage-pages-on-repeated-writes"></a>

### Keep usage task facts and freshness consistent across writers

**Identity:** SEED-357#reuse-unchanged-usage-pages-on-repeated-writes
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-357#reuse-unchanged-usage-pages-on-repeated-writes","dependencies":[{"supplier":{"identity":"SEED-357#keep-usage-history-within-a-small-disk-budget","href":"seeds/SEED-357-dashboard-task-token-usage.md#keep-usage-history-within-a-small-disk-budget"},"implementation":"This correction consumes the supplier's canonical session-contribution history through the importer, writeUsageHistory and Token index boundary; it adds launch workflow precedence and proves alternating-writer byte stability without restoring per-response storage.","rationale":"The final repeated-writer proof requires the canonical single-document writer. Starting against the paged writer would require duplicating the supplier's normalization and conversion work; shared direction and reconciliation cannot deliver that missing storage behavior. The existing queued scope already follows this supplier.","condition":"Publish the canonical usage-history-v2 document of tasks, sessions and gaps, preserving existing task totals and the writeUsageHistory batch/importer/Token index entry points, with repeated unchanged writes by the same writer leaving history bytes unchanged.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1131bcf144bd98567a4149ff0f37af5f1c2410e74c7e9072093554263d20a3a1","plan":"894eaa9834267b0fcaf734e59fd1363c7a43e43d413e7d3768d0859519984c11"}}
```

**Goal.** A retrospective correction of the completed story View token usage
for dashboard-launched Codex tasks
(`git show 103b321ea58cb461e91669658db184b24ba48ee3:.planning/seeds/SEED-357-dashboard-task-token-usage.md`), for
Terry, who refreshes Usage and sometimes runs the offline import. A launch
task stores one workflow whichever writer wrote it last, so an import and a
Refresh in turn over unchanged evidence leave the usage history unchanged.
Usage's "Checked" time and checking indication also keep the freshness
promises of the corrected story.

**Scope.** A launch task stores its launch record's workflow in both the
importer and Refresh; recovered evidence fills a missing launch workflow,
and recovered-only tasks keep their skill. After one normalizing write,
alternating writers over unchanged evidence leave the small history's bytes
and task totals unchanged. "Checked" shows an offline import that wrote after
the last Refresh, and a subsequent unchanged Refresh shows its own check
time. Changing a filter during Refresh keeps the checking indication until
the Refresh and its selected-cohort reread settle, or shows its failure beside
the previous chart and check time. The usage fixture's recovered tasks record
the skill of their own workflow.

The [plan](../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md) holds the
correction's examples, findings and proof. Execution follows publication of
Keep usage history within a small disk budget: its canonical session-contribution document and unchanged
same-writer writes supply the storage contract this correction consumes.
Page stability, tier-on-reread reconciliation, conversion, disk reclamation
and writer latency belong to that supplier. This correction adds no tariff,
import CLI, chart or storage-format change.
