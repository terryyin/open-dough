---
id: SEED-428
status: active
planted: 2026-11-24
planted_during: Developer decision to separate Review repository adoption from published-only review
trigger_when: selected from the product backlog after published-only review lands
scope: one story
---

# SEED-428 — Read published reviews from the Review repository

<a id="read-review-files-without-fetching"></a>

### Read review files without fetching and answer failed syncs from the last sync

**Identity:** SEED-428#read-review-files-without-fetching
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/816-read-review-files-without-fetching/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"43db7450ffa2d064563badfb8a863657264f0809a6627744f2bda6b280fa17c1","plan":"63613d216f7a3609cffd89de51ff1839324d0ab9d8447594fd768839aa95d5f8"}}
```

**Goal.** A developer reviewing published work in **Review changes** gets what
[Read published reviews from the Review repository](#read-reviews-from-the-review-repository)
already promised for every comparison kind. File switches in landed runs,
recorded landings, Done completions, and published sessions make no remote
request. A failed or hanging sync answers from the last sync with the sync
notice, or names the failed sync when nothing synced earlier can answer,
instead of timing out or reading as an unknown session. This is a
bounded retrospective correction of that story's execution and adds no new
product promise.

**Scope.**

- Required behavior: the corrections, current findings, proof, and slices are
  in [plan 816](../slice-plans/816-read-review-files-without-fetching/PLAN.md).
- Scope limits: a stale ref for a branch deleted on origin and the shared,
  non-atomic sync record stay with
  [SEED-430](SEED-430-read-published-project-data-from-local-git.md#read-published-project-data-from-local-git).
