---
id: SEED-106
status: active
planted: 2026-10-06
planted_during: Terry's request to stop the dashboard's main columns wrapping on narrower screens
trigger_when: A developer views the dashboard in a window too narrow to show the Backlog, Taken, and Recently done columns side by side
scope: story
---

# SEED-106: Dashboard paged columns

## Why This Matters

Backlog, Taken, and Recently done page horizontally in a page too narrow to
show all three ([dashboard README](../../dashboard/README.md)). The stories
below correct and extend that paging.

## Stories

<a id="paged-columns-reveal-and-count-correction"></a>

### Paged dashboard columns reveal by structure and count only what is read

**Identity:** SEED-106#paged-columns-reveal-and-count-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/259-paged-columns-reveal-and-count-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"eb85a668db886807b805cb5c53b59cf7131ae5b9c4b080a3a8c0e2b87a560068","plan":"8428c5d8297e4faf0910cf2e771302dd0f40a0e9d6e472c8d16ebc0bcceb8558"}}
```

**Goal:** A developer paging the dashboard columns keeps the view they chose
when a launch dialog opens from a shown card, and an edge control never
states a Recently done count before the sessions are read. This corrects
the paged dashboard columns delivery (SEED-106#paged-dashboard-columns,
`be7125e4:.planning/seeds/SEED-106-dashboard-paged-columns.md`); it adds no
feature promise.

**Scope:** Focus and `keepInView` reveals move to the column that holds the
element in the page, not to where it appears on screen; the Recently done
edge control names the column without a count until the sessions are read;
the column summary has one home with the dashboard columns; the
reduced-motion rule that can no longer apply goes. Every promise of the
paged dashboard columns story is preserved.

**Plan:** [259-paged-columns-reveal-and-count-correction](../slice-plans/259-paged-columns-reveal-and-count-correction/PLAN.md)
