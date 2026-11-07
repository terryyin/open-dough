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

## Correction

<a id="explain-running-after-proofless-later-build"></a>

### Explain a running later build after a proofless one

**Identity:** SEED-254#explain-running-after-proofless-later-build
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/497-explain-running-after-proofless-later-build/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"680bdefc9b55738bec98212f2d14eecc71fa1344f9c4f77d65ace8d8b31fd42e","plan":"7c4176febcb0a0d763dbff6ac1a3a18b0597fa090c956c8c8809101dd205672e"}}
```

**Goal.** A developer reviewing a done story's Landed CI proof in Intent sees
a true explanation when a cancelled landing's forward walk passes a later
trunk build whose proof is unavailable and then reaches a build that is still
running: Landed says why that nearest later build's proof is unavailable and
that a later build is still running, and it does not say no later trunk build
has finished. This corrects the delivered
[Use a later trunk build's CI proof for cancelled landings](https://github.com/terryyin/open-dough/blob/8296c54b10b76a6cb654fe565da24a5557bc6025/.planning/seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-later-ci-proof-for-cancelled-landings)
story's "No later proof" explanation; it adds no new promise.

**Scope.** The running stop of the cancelled-landing forward walk and its
Landed explanation, with focused proof. The answer stays not final. Plan:
[497-explain-running-after-proofless-later-build](../slice-plans/497-explain-running-after-proofless-later-build/PLAN.md).
