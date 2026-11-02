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
is not published". A `ciAdapter` project's story branch counts trunk results
of shared commits as a `ciWorkflow` project's does, and the maintained Intent
doc describes when trunk runs count for a story branch as the dashboard
actually judges them. Maintainers
get one plain parameter for the judged branch and no overlapping end-to-end
tests. This corrects the CI status tab (SEED-219#intent-ci-status-tab, recoverable
as `56c47e8e:.planning/seeds/SEED-219-intent-ci-status-tab.md#intent-ci-status-tab`)
after its execution retrospective.

**Scope:** The configured ref is never marked no longer published; an unread
trunk judgment keeps its reason visible. A story branch absent on GitHub
still says so by name. For a story branch of a `ciAdapter` project, the
dashboard also asks the adapter's discover for the configured trunk and counts
only the selected check's results for commits actually in that branch's
history, naming the run's branch honestly (for example "run on `main`"). A
nearer or newer applicable failure or running result still decides the
judgment, and unreadable evidence stays **Could not be read**, never passed.
The Intent doc states this rule for both `ciWorkflow` and `ciAdapter`
projects. The `ci-status`
read names its judged branch with its own parameter instead of the shared
`branch` read parameter. Overlapping CI status end-to-end tests move to
unit tests or are removed with their surviving coverage named. Amended
2026-11-02: Terry approved `ciAdapter` trunk parity in the CI status
recommendation chat, replacing the earlier docs-only adapter restriction.

**Key example:** GitHub answers HTTP 404 for `main`'s commit history (for
example after the repository is renamed). CI status names `main`, says
**Could not be read**, and shows the 404 reason.

**Key example:** A `ciAdapter` project's story branch `codex/x` has no result
of its own at its head; the adapter's discover for `main` returns a passed
result for a commit in `codex/x`'s history. CI status reads Passed at that
commit, "run on `main`". A `main` result for a commit not in `codex/x`'s
history is not counted, and a failed `codex/x` result nearer the head still
reads Failed.

**Plan:** [448-ci-status-review-corrections](../slice-plans/448-ci-status-review-corrections/PLAN.md)
