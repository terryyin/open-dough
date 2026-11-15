---
id: SEED-369
status: active
planted: 2026-11-15
planted_during: Terry requested a day-count filter and a clearer token usage chart
trigger_when: selected from the product backlog
scope: story
---

# SEED-369 — Make recent token usage easier to read

<a id="make-recent-token-usage-easier-to-read"></a>

### Make recent token usage easier to read

**Identity:** SEED-369#make-recent-token-usage-easier-to-read
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/634-recent-token-usage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bb83af59ef76c1023df0fc68966c06b612c90a42fcae51de4bab7a1dfebe5979","plan":"131e5a91db18bb43087180514e51a40867be33859836df6026ff1095a2539235"}}
```

#### Goal

A developer reviewing [System settings → Usage](../../dashboard/src/SystemSettingsUsage.tsx)
can focus on a recent period and see the trend and differences between ordinary
tasks even when a few tasks use far more tokens.

#### Scope

- Choose a positive whole number of days with **Last N days**, initially 30.
  Use the developer's local calendar: today and the preceding N−1 days,
  including the first day's midnight and excluding tomorrow's midnight.
  Keep that choice when changing cohort filters or refreshing usage. The
  visible tasks, partial/unpriced counts, and empty-state wording describe
  that period within the existing cohort.
- Keep the true trailing **10-task moving average** of eligible tasks
  (priced and measured without known gaps). Earlier eligible tasks in the
  same cohort contribute before the visible period; tasks above 50 million
  remain eligible. Changing the period does not change the average at a
  date retained in both views. Show only average observations dated within
  the selected period, and identify insufficient history honestly.
- Draw the moving average in a distinct color above the task dots. Scale
  the ordinary y-axis from visible task values at or below 50 million,
  independently of the average. Explicitly identify an average above that
  scale at its date and make its actual value readable; a clipped trace
  must not imply that the scale ceiling is the actual average.
- Show tasks whose Token index **exceeds 50 million** as red × marks at
  the top of the chart. Keep each mark aligned to its task's date, label
  it with its actual value, and retain selection into task details. Those
  values do not determine the ordinary y-axis. Exactly 50 million stays an
  ordinary point. Partial coverage remains visible in marks/readouts and
  detail, including for large tasks.

These are display changes to existing Token index observations, not changes
to tariffs, task attribution, or the meaning of a task's Token index. This
increment adds no arbitrary date interval, saved date preference, additional
host support, or alternative statistical measure.

#### Key examples

1. With tasks today, six days ago, seven days ago, and twenty days ago,
   changing 30 to 7 days retains the first two and removes the latter two.
   A task exactly at the first included local midnight remains visible;
   one just before it does not. One day includes today's tasks.
2. Nine eligible tasks precede the seven-day period and the tenth is
   inside it → view seven days → the tenth task's average still uses all
   ten. Expanding to 30 days leaves that average unchanged. Partial and
   unpriced tasks do not fill the eligible window.
3. Nine measured tasks at 1 million each and a measured task at 65 million
   → view their period → the true average is 7.4 million. The ordinary
   points determine the scale, the 65 million task is a labeled red ×,
   and the above-scale average is explicitly identified as 7.4 million.
   A task at exactly 50 million remains on the ordinary scale.
4. Two large tasks finish at the same time → inspect/select either mark
   by pointer, touch, or keyboard → each task's actual value and details
   remain individually reachable. Closing details returns focus to its
   mark. Narrowing the period removes a selection that is no longer shown.
5. No task falls in the period → show an informative empty period. If
   every priced task exceeds 50 million, retain every labeled/selectable
   × and distinguish that situation from no tasks or zero usage.

#### UI

The developer chooses the period alongside the current cohort filters, reads
the ordinary-task differences and true average, then selects a task to
understand its usage. Explain that × means above 50 million rather than a
failed task, and identify average overflow separately. Keep essential values
available without hovering; color alone carries no meaning. The control,
overflow labels, and task actions remain usable on a narrow screen and at
200% zoom. Invalid day input explains the positive-whole-day requirement
while keeping the last valid view recoverable. Existing loading and Refresh
failure feedback still preserves the last successful result where it does
today.

#### Architecture

The interaction separates **which dates are visible** from **which eligible
tasks contribute to a true historical average**. Terry selected historical
contribution and retaining outliers in the average in refinement on
2026-11-15. The system must calculate the average before restricting its
display period; display overflow must never rewrite task or average values.
Recent-period counts also need dated unpriced tasks before aggregation.

Reuse the existing Usage summary/cohort boundary and shared history chart,
keeping Usage's 50-million rule out of CI and scope-timing policy. This
follows [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation of a concept and direct domain mapping) and
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(derived presentation distinct from recorded evidence). No Accepted ADR
conflict or new product-wide architectural decision was found.

#### Slice plan

[Make recent token usage easier to read](../slice-plans/634-recent-token-usage/PLAN.md)
