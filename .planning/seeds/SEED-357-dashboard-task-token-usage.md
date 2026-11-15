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

### Reuse unchanged usage pages on repeated writes

**Identity:** SEED-357#reuse-unchanged-usage-pages-on-repeated-writes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"93a61d38db6e17bbe4380a8ef6a99ecf0924d732cd29472e01ef7143da4cdd36","plan":"d198f7ba48665f89a6e5bef15bd1134014b4bff8c621cf27edb639e2aa69b074"}}
```

**Goal.** A retrospective correction of the completed story View token usage
for dashboard-launched Codex tasks
(`git show 103b321ea58cb461e91669658db184b24ba48ee3:.planning/seeds/SEED-357-dashboard-task-token-usage.md`), for
Terry, who refreshes Usage on a machine whose usage store already holds
gigabytes. Repeated usage writes over unchanged native evidence, by Refresh,
the offline import or both in turn, leave that evidence's stored bytes
unchanged. After one normalizing write, a further write publishes no new page
and leaves the manifest identical, so Refresh no longer grows the store by up to
about 1 GB per press. Usage's "Checked" time and checking indication also keep
the freshness promises of the corrected story.

**Scope.** Stable stored bytes for an unchanged response. A reread that first
learns a response's service tier records that tier on the existing
measurement, while a genuinely different tier stays competing evidence and
unpriced. A launch task stores its launch record's workflow in both the importer
and Refresh. "Checked" shows an offline import that wrote after the last
Refresh. Changing a filter during Refresh keeps the checking indication until
the Refresh ends. The usage fixture's recovered tasks record the skill of their
own workflow. Excluded, not rejected: reclaiming pages that no manifest
references (the existing orphans) and skipping untouched partitions for writer
latency. Both belong to separate writer-level work. Findings, preserved
promises and proof are in the [plan](../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md).
