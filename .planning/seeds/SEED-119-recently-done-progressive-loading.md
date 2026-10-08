---
id: SEED-119
status: active
planted: 2026-10-07
planted_during: Terry's request to limit Recently done to the latest 10 items and reveal older items on demand
trigger_when: A developer reads a long Recently done list or an existing journey, such as Mark as done, lands on an older done entry
scope: story
---

# SEED-119: Recently done progressive loading

## Why This Matters

A developer following completed work needs a short initial Recently done list
without losing access to older items. Hiding older cards alone does not save
the cost of reading their detailed content. An existing journey that lands on
a done entry, such as marking a session done, must still reach it even when it
lies outside the initial list.

## Story

<a id="done-catalog-adapter-edge-results-correction"></a>

### Backlog Git adapters end edge outcomes in an actionable result

**Identity:** SEED-119#done-catalog-adapter-edge-results-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/279-done-catalog-adapter-edge-results/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ba13d3677c8591a8b010327a7a81a8634660474b6de9ef5288d00bb77d2f7928","plan":"c9c6dd2efde086c0cf1466f8d542d02d4282b31069436d4b28932545a980f482"}}
```

**Goal:** A developer or agent integrating backlog and done-record changes
through the product backlog's Git adapters gets a structured, actionable
result at their edge outcomes instead of a crash or a misleading resume path:
merging a ref the current branch already contains stops with a report saying
so, and publication guidance resumes an adapter stop through that adapter and
treats a finished replay whose rebuilt done catalog is staged but not
committed as a commit to make, not a conflict to continue. This corrects the
done catalog currency delivery
(SEED-119#done-catalog-currency-correction, commits `24fb8d48..e634f974`); it
adds no feature promise.

**Scope:** The merge adapter's already-contained ref and the publication
guidance for adapter stops, including done-record conflicts and the
`catalog-uncommitted` result. Every promise of the done catalog currency
correction and the original Recently done story is preserved. Still open and
Terry's: strict catalog mode, release ordering between the producer and the
dashboard, and whether an already-contained merge should instead report
success with nothing to merge.

**Plan:** [279-done-catalog-adapter-edge-results](../slice-plans/279-done-catalog-adapter-edge-results/PLAN.md)

## Breadcrumbs

- [Dashboard reading and navigation](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
