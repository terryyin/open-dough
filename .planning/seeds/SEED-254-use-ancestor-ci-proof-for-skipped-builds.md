---
id: SEED-254
status: active
planted: 2026-11-07
scope: story
---

# CI proof for skipped builds

Intent's **CI timing comparison** names a Baseline, Branch and Landed build for
a selected story ([Intent design](../../docs/dashboard-development-intent.md)).
In this repository many of those revisions never build. On GitHub, a push
whose changes the workflow's `paths-ignore` excludes creates no run and no
check runs, so a skip appears only as an absent run. A superseded run is a
real run whose conclusion is `cancelled`.
[CI workflow](../../.github/workflows/ci.yml),
[skipped workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs).

Observed on 2026-11-07 against `origin/main`:

- Recent `.planning/`-only trunk commits (`cb4ed7eda`, `4d2adeff6`,
  `07f54554c`) have no workflow run and zero check runs.
- Of the 60 latest first-parent trunk merges, 1 was ignored-only with no
  run, 9 had a cancelled push run, 1 changed code but had no run (it was
  not the head of its push, `199a61b8d`), 5 failed and the rest passed.

## Stories

<a id="use-later-ci-proof-for-cancelled-landings"></a>

### Use a later trunk build's CI proof for cancelled landings

**Identity:** SEED-254#use-later-ci-proof-for-cancelled-landings
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing a done story's Landed CI proof in
Intent.

**Goal:** When a newer trunk push cancelled the landing's own run, Landed
can show proof from the nearest later trunk build that contains the landing.
The landing still shows as **Cancelled**, and the reviewer can see the later
build and that it includes changes after the landing.

**Scope:** To be refined. Starting points: the descendant build must contain
the landing, the changes between them stay visible, and the rule must keep a
cancellation distinguishable from a skip. 9 of the 60 latest trunk landing
merges were cancelled (see above).
