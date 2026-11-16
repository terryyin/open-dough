---
id: SEED-383
status: active
planted: 2026-11-16
planted_during: Terry asked to compare dashboard token usage for Codex and Claude Code
trigger_when: selected from the product backlog
scope: story
---

# SEED-383 — Compare Codex and Claude Code token usage

<a id="compare-codex-and-claude-code-token-usage"></a>

### Compare Codex and Claude Code token usage

**Identity:** SEED-383#compare-codex-and-claude-code-token-usage

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/658-compare-codex-and-claude-code-token-usage/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"902a2956fb94ebc4d27f2e8d6279095580879b3d435091bf4abd8522d5bdc765","plan":"15e182775e308c02e59553d478669cb0243975a222818eb660137c0c0011ede1"}}
```

#### Goal

A developer can compare the token index of finished dashboard-launched Codex
and Claude Code tasks in [System settings → Usage](../../dashboard/src/SystemSettingsUsage.tsx).
They can see when usage occurred and give closely timed tasks equal room on the
chart when comparing individual tasks.

#### Scope

- Show Codex, Claude Code, or both together, retaining an independently
  calculated rolling median for each selected tool. Keep launch workflow,
  model, effort and recent local calendar-day filtering available.
- Offer the union of models available from the selected tools. Preserve a
  selected model while any selected tool offers it; otherwise use All models.
- Switch between a shared completion-time axis and one chronological sequence
  with equal room for every visible task across the selected tools. Spacing
  changes placement, not task values, filtering or median membership.
- Keep tool identity, coverage, unpriced counts, tariff meaning and actual
  completion times understandable. Preserve task inspection by pointer,
  keyboard and touch, including closing detail back to its mark. Tool choices
  and the spacing control remain usable on narrow screens.
- Retain each tool's existing token-index calculation on a shared numeric
  vertical scale. Identify both reference units explicitly: GPT-6.1 Sol
  input-token equivalents for Codex and Claude Opus 5.5 input-token equivalents
  for Claude Code. The comparison does not assert identical units, common cost
  or tool efficiency. Terry selected this interpretation on 2026-11-16.

This increment does not promise matched workloads, a tool efficiency ranking,
billing totals, a new usage collector, Cursor support, or changed tariffs.
Those are delivery boundaries, not reasons to reject naturally supported data.

#### Key examples

- Replace the single Tool dropdown with a selection that lets a developer show
  Codex, Claude Code, or both. With both selected, their task points and
  rolling medians overlap on one chart with distinct, labeled colors and a
  common numeric scale with each tool's reference unit labeled. Deselecting one tool hides its series. Both
  choices and the spacing control stay visible and usable on narrow screens.
- The Model dropdown offers the models available from the selected tools and
  one **All models** option that covers all selected tools. Turning off a tool
  removes models offered only by that tool. Keep the chosen model if it is still
  available, or return to **All models** when it is no longer offered.
- In the time view, both series use the same completion-time axis over the
  selected period. Tasks finished at the same time share a horizontal position,
  and gaps between tasks are proportional to elapsed time.
- Turning on equal task spacing gives each visible task one equal-width slot
  in a single chronological sequence across the selected tools. The axis shows
  task order, and selecting a point still shows the task's actual completion
  time and token index. Turning the option off restores the shared time axis.

#### Evidence, alternatives and challenge

The existing workaround is to switch the Tool dropdown and compare separate
charts from memory. It cannot show both series against the same horizontal
positions. Separate simultaneous charts would reduce that memory burden, but
would not deliver the seed's chosen overlay. The overlay is the selected
interaction. Terry selected retention of the existing tool-relative indices
with explicit reference-unit labels, rather than raw tokens or a new cost
conversion, on 2026-11-16.

Equal spacing adapts the ordered-sample mechanism used in process charts:
observations become tasks, sample order becomes completion order, and each
sample slot becomes one visible task's horizontal position. Unlike equally
timed samples, these slots do not represent elapsed time. Keep the real time
in the task detail and explicitly identify the axis as task order.

Investigation on 2026-11-16 at `b4cf6dde4335b965c6dc8421266015ca99444bb5`
found separate reference units in
[`usageTariffs.ts`](../../dashboard/server/usageTariffs.ts), as documented in
the current [Usage contract](../../dashboard/USAGE-TOKEN-INDEX.md): Codex uses
GPT-6.1 Sol input-token equivalents; Claude Code uses Claude Opus 5.5
input-token equivalents. The cards also price cache writes differently.
An unpaid local invocation of the real `tokenIndex` operation with identical
counters (1,000 uncached input, 10,000 cache reads, 2,000 one-hour cache writes,
100 output) returned 4,000 for Codex and 6,000 for Claude Code, using each
card's reference model. These are observations of the stored tariffs, not a
verification of current vendor prices or an exchange rate between them.

The strongest doubt is that an overlay can meet the visual examples while
suggesting equal units or tool efficiency that the underlying data does not
establish. Tasks are also not matched for scope or delivered outcome. Preserve
the distinction between observed usage and improvement; see
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

#### UI and architecture

The developer reads one combined plot, identifies each tool through labeled
series rather than color alone, changes shared filters, chooses a horizontal
spacing mode, and opens a task to inspect its actual time, model and coverage.
Each tool's median remains its own ten eligible tasks, even when tasks from
both tools are interleaved. A model selection may legitimately leave the
other selected tool with no matching tasks; that absence is not zero usage.

The selected vertical measure reuses both versioned tariffs with explicit
tool-relative unit labels. Raw tokens would change the metric; a common cost
equivalent would require an agreed conversion and source. Those alternatives
are deferred, rather than implementation obligations for this increment.

[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps this a derived observation rather than a new authority for project
state. [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports extending the existing Usage and shared history-chart responsibilities
rather than adding a parallel chart or usage store. No conflict with these
Accepted decisions was found. Terry's metric decision preserves the existing
calculation responsibility and requires no new shared store or North Star topic.

No goal, scope or metric decision remains open.
