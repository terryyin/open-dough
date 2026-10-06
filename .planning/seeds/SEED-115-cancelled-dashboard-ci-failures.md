---
id: SEED-115
status: active
planted: 2026-10-06
planted_during: Terry's request to investigate the unexplained cancelled dashboard CI run
trigger_when: Dashboard CI reports failures before cancellation without a demonstrated cause
scope: unknown
---

# SEED-115: Explain cancelled dashboard CI failures

## Why This Matters

A maintainer needs to distinguish a remaining defect from failures already
repaired when deciding whether dashboard CI needs further work. Run
37420000326, attempt 1, on `9baca4db8d9509dd20d6ba8869202eb641836c4b`
reported thirteen test failures before its six-minute job limit. The preceding
execution did not establish their cause. Its shard trace upload was skipped,
and later passing runs establish current proof without explaining this run.

## Story Decomposition

<a id="explain-cancelled-ci-failures"></a>

### Determine whether the cancelled dashboard CI failures need repair

**Identity:** SEED-115#explain-cancelled-ci-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Investigate the thirteen preceding failures and return an
evidence-backed judgment about whether a remaining bug is worth fixing.

**Expected behavior:** Dashboard tests provide reliable feedback about the
promised behavior. A test failure is explained by a demonstrated product or
test defect, an already demonstrated repair, or affirmative infrastructure
evidence; cancellation alone establishes none of these.

**Observed behavior:** Run 37420000326, attempt 1, was cancelled after a job
reached its six-minute limit. Thirteen preceding failures remain unexplained
in the closed execution's evidence.

**Scope:** Bounded diagnosis of the run, its available logs and artifacts, the
affected tests, landed repairs, and relevant current behavior. Temporary
reproduction harnesses are investigation evidence. This instruction does not
authorize a product repair or a change to execution guidance.

**Key examples:** An affected test whose original failure is reproduced and
removed by an existing repair is accounted for by that proof. A mismatch
reproduced on current code establishes remaining work. Missing historical
evidence remains explicit rather than being cleared by a green rerun.

**Evaluation:** Account for each reported failure, identify any demonstrated
common cause, and report confirmed defects, likely size, and remaining gaps.
Avoid a full dashboard-suite rerun or speculative repairs.

**Open decisions:** Whether a remaining product, test, or CI diagnostic defect
is confirmed and merits repair.

**Depends on:** No blocking story prerequisite. Preserve the active observer
sharing story and its checkout.

## Breadcrumbs

- [Cancelled CI run](https://github.com/terryyin/open-dough/actions/runs/37420000326).
- [Closed execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
- Landed test-race repair `7da9f1533316187860cb318dcac81238a6a538b6`.
- Terry's request in this conversation, 2026-10-06.
