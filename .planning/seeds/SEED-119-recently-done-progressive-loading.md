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

<a id="done-catalog-currency-correction"></a>

### Done catalog stays current through Git integration and failed reads recover on refresh

**Identity:** SEED-119#done-catalog-currency-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/276-done-catalog-currency-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ca0701927d17a81cdc9f20c07c0558a78aee1b853e17a51a7f60fc4712094030","plan":"5c109ae33fdbb37c438c77f554c4b09fba5013dbc590cd320d99373608be93a9"}}
```

**Goal:** A developer whose project integrates done records through Git keeps
a done catalog that describes them, without a manual rebuild step, and a
developer reading Recently done is told how to repair a catalog that does not,
and sees a done record whose read failed asked again when a newer revision of
the same project is shown. This corrects the Recently done progressive loading
delivery (SEED-119#recently-done-progressive-loading, commits
`62238f21..742e6b9a`); it adds no feature promise.

**Scope:** The product backlog's Git merge, rebase, and cherry-pick
operations, and the publication paths that route record-changing integration
through them, leave a catalog matching the final record files, and a
conflict in the derived catalog alone no longer stops them. The Recently done
gap for a catalog that does not describe the published records names the
`catalog-done` repair. A same-project refresh to a new revision asks again for
done records whose read failed, while reusing records already read. A stale
description of the retired eager done read goes. Every promise of the
original story is preserved. Still open and Terry's: whether the dashboard
keeps strict catalog mode or adds a compatibility path for projects without a
current catalog, and the release ordering between the producer and the
dashboard; until a release is installed, this repository's installed producer
copies cannot rebuild the catalog. Automatic timed recovery stays with
[temporary reading recovery](../../dashboard/PUBLISHED-OBSERVATION.md).

**Plan:** [276-done-catalog-currency-correction](../slice-plans/276-done-catalog-currency-correction/PLAN.md)

## Breadcrumbs

- [Dashboard reading and navigation](../../dashboard/README.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
