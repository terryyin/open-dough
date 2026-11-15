---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched Codex tasks

<a id="keep-usage-history-within-a-small-disk-budget"></a>

### Keep usage history within a small disk budget

**Identity:** SEED-357#keep-usage-history-within-a-small-disk-budget

#### Goal

Terry, who views token usage on a machine with months of agent history, gets
the Usage view from a usage history that takes very little disk space. Usage
shows a few numbers per finished task, so what the dashboard keeps for it is
sized by the number of tasks, in megabytes at most, and stays that size however
often usage is checked.

#### Scope

Measured on Terry's machine on 2026-11-15, read-only:
`~/.open-dough/dashboard/launch-history/usage.json.pages` holds 4.4 GB in
6,053 files. 2.8 GB of that (3,737 files) is referenced by nothing. The
1.6 GB in use is 1.05 GB of per-response observations and 0.55 GB of
per-response associations for 1,623,461 responses, against 17 MB for 5,400
tasks and 6 MB of gaps. Each stored row also carries its own content twice, as
a key string and as an object. One import report beside the store takes
another 42 MB. The native evidence these rows were read from stays in the
hosts' own session files and is not the dashboard's to keep a second time.

- Keep only what the Usage view and its refresh need: per-task usage totals
  by model and speed tier, the task's attribution and coverage facts, and the
  smallest per-source checkpoint that lets a reread of changed native files
  replace their earlier contribution without counting a response twice.
  Per-response rows are kept only where refinement shows a displayed number
  or a correctness promise cannot be met without them, and then in a compact
  form.
- A task whose native evidence has since been removed keeps its stored totals.
- After the first check with this story's dashboard, the existing store on a
  machine like Terry's shrinks to the budget: superseded and unreferenced
  files are removed, not left beside the new ones. Import reports follow the
  same budget.
- A check that finds nothing new writes nothing and finishes in about the time
  it takes to see that nothing changed, in place of the 12–16 s the current
  writer spends.
- The same budget holds for every host whose usage this history records,
  including Claude Code usage from
  [SEED-359](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage).
- Usage keeps showing the same tasks, Token index values, filters and
  "Outcome unknown" detail as before for the same native evidence.

Refinement settles the budget as a measured number. The starting expectation
is under 20 MB in total for Terry's present history (513 dashboard-launched
Codex tasks, 2,786 rollouts), growth of a few kilobytes per new task, and no
growth from repeated checks.

This story runs ahead of
[Reuse unchanged usage pages on repeated writes](#reuse-unchanged-usage-pages-on-repeated-writes).
Refinement of this story decides which of that story's promises remain once
the history is small (its "Checked" time, checking indication, service tier
and launch workflow promises do not depend on storage size) and amends or
drops its page-reuse scope accordingly.

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
