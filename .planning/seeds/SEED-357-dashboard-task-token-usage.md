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
{"schemaVersion":1,"identity":"SEED-357#reuse-unchanged-usage-pages-on-repeated-writes","dependencies":[{"supplier":{"identity":"SEED-357#keep-usage-history-within-a-small-disk-budget","href":"seeds/SEED-357-dashboard-task-token-usage.md#keep-usage-history-within-a-small-disk-budget"},"implementation":"This correction consumes the supplier's canonical session-contribution history through the importer, writeUsageHistory and Token index boundary; it adds launch workflow precedence and proves alternating-writer byte stability without restoring per-response storage.","rationale":"The final repeated-writer proof requires the canonical single-document writer. Starting against the paged writer would require duplicating the supplier's normalization and conversion work; shared direction and reconciliation cannot deliver that missing storage behavior. The existing queued scope already follows this supplier.","condition":"Publish the canonical usage-history-v2 document of tasks, sessions and gaps, preserving existing task totals and the writeUsageHistory batch/importer/Token index entry points, with repeated unchanged writes by the same writer leaving history bytes unchanged.","state":"satisfied","resolution":{"revision":"c4f182d405ede6dc387908bc9692df5890348006","path":".planning/seeds/SEED-357-dashboard-task-token-usage.md#keep-usage-history-within-a-small-disk-budget","summary":"Directly satisfied. writeUsageHistory stores one usage-history-v2 document of tasks, sessions and gaps (dashboard/backend-tests/usage-history/session-contributions.spec.ts, first case); a paged store converts with tasks, gaps and task totals equal (earlier-store-conversion.spec.ts; real clone: 2,925 tasks byte-equal, per-task totals identical); the UsageBatch write API, the importer CLI and the Token index summary are unchanged entry points (token-index specs and the usage e2e spec pass); an import repeated and a Refresh repeated over unchanged evidence leave the document's bytes, inode and mtime unchanged (repeated-checks.spec.ts). The plan at that revision has all five slices done.\nCondition satisfied: Publish the canonical usage-history-v2 document of tasks, sessions and gaps, preserving existing task totals and the writeUsageHistory batch/importer/Token index entry points, with repeated unchanged writes by the same writer leaving history bytes unchanged.\nAccepted integration: 03a69f1988ebab8c596a20dec52a333cc10ab48e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bfc8997cb35645173bcd26da988983507f11d4b73740d13ba42391e727392ac5","plan":"39604ad06138bda02141456fdea2328d86637bd7e982b6d6368fc27002a5f012"}}
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
correction's examples, findings and proof. The delivered Keep usage history
within a small disk budget supplies the storage contract this correction
consumes: its canonical session-contribution document and unchanged
same-writer writes.
Page stability, tier-on-reread reconciliation, conversion, disk reclamation
and writer latency belong to that supplier. This correction adds no tariff,
import CLI, chart or storage-format change.
