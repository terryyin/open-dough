---
id: SEED-219
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for a CI status tab in Intent
trigger_when: Developers review CI status in Intent with or without a selected story
scope: story
---

# Show CI status in an Intent tab

<a id="ci-status-review-corrections"></a>

### 1a. Keep CI status unread failures readable and its read contract plain

**Identity:** SEED-219#ci-status-review-corrections
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/448-ci-status-review-corrections/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a1234012b3ee14c515dc27cc1657390027bdd38db26cfac63f37ef86497bab6d","plan":"bb24e198d67bc0cf3218b192fffddf196a19394d6bdb106d5ce0b1078102966c"}}
```

**Goal:** A developer reading Intent's CI status when GitHub cannot list the
trunk's history sees **Could not be read** with GitHub's reason, never "main
is not published", and the maintained Intent doc describes when trunk runs
count for a story branch as the dashboard actually judges them. Maintainers
get one plain parameter for the judged branch and no overlapping end-to-end
tests. This corrects the CI status tab (SEED-219#intent-ci-status-tab, recoverable
as `56c47e8e:.planning/seeds/SEED-219-intent-ci-status-tab.md#intent-ci-status-tab`)
after its execution retrospective.

**Scope:** The configured ref is never marked no longer published; an unread
trunk judgment keeps its reason visible. A story branch absent on GitHub
still says so by name. The Intent doc states that a `ciAdapter` project
judges a story branch from its own discover answer only. The `ci-status`
read names its judged branch with its own parameter instead of the shared
`branch` read parameter. Overlapping CI status end-to-end tests move to
unit tests or are removed with their surviving coverage named. Whether
`ciAdapter` projects should also count trunk runs is not part of this
correction.

**Key example:** GitHub answers HTTP 404 for `main`'s commit history (for
example after the repository is renamed). CI status names `main`, says
**Could not be read**, and shows the 404 reason.

**Plan:** [448-ci-status-review-corrections](../slice-plans/448-ci-status-review-corrections/PLAN.md)

<a id="investigate-ci-completion-timeout"></a>

### Explain the CI completion timeout for an already successful run

**Identity:** SEED-219#investigate-ci-completion-timeout
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Explain why completion observation for `db511594b1935968e01df4b22f4931bcb5843994`
returned `unresolvedReason: "timeout"` and stopped its observer although
GitHub Actions run `41436051947` succeeded, and identify an evidence-backed
disposition or bounded repair proposal.

**Scope:** Inspect the original session and mailbox evidence, registration,
provider timestamps, and the applicable observer implementation. Distinguish
expected bounded shutdown from missed or inapplicable success evidence. Keep
this investigation independent of correction 448 and its existing owner.
Investigation is authorized; implementation is not part of this mission.

**Known expectations:** A completed applicable success observed within the
completion budget returns success. Timeout alone establishes no CI verdict.
Later success at `d0abfe47` does not explain the earlier observation gap.
Preserve original evidence, identify its limits, and recommend a deterministic
regression case if a defect is established. Tests and any repair handoff follow
[AGENTS.md — Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests).
