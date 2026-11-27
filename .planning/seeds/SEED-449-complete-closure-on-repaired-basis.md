---
id: SEED-449
status: active
planted: 2026-11-27
planted_during: Wrap-up of SEED-413#intent-story-cases-at-component-speed, whose Trunk Mode closure could not retire its worktree after trunk turned green
trigger_when: selected from the product backlog
scope: one story
---

# SEED-449 — Complete a closure whose failed CI basis trunk has since repaired

<a id="complete-closure-on-repaired-basis"></a>

### Complete a planning-only closure once trunk repairs its failed basis

**Identity:** SEED-449#complete-closure-on-repaired-basis
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Trunk Mode wrap-up whose closure changes only CI-ignored paths can
finish, publish its session record and retire its worktree once trunk proves
the integrated state green, even when the CI run its closure borrowed as a
basis failed because of another writer's commit.

- **Problem.** On 2026-11-27 the closure `0bd73b1` of
  SEED-413#intent-story-cases-at-component-speed changed only `.planning/`
  files, so its completion took `not_required_basis` from `8f6a3bc`. That
  commit, by another writer, broke four landing-recording backend specs (run
  45950473041). Trunk repaired them, and run 45961498530 on `383b328`, which
  contains the closure, passed every job. `trunk-closure.mjs finish` still
  returned `step: "completion"`, `verdict: "failure"`. `integrated_state`
  replaces only a basis whose attempt was replaced or is still pending, and
  no command records a delivered failure as repaired by its owner or
  explicitly excepted. Retiring outside `finish` would leave the sealed
  session record unpublished. The worktree
  `.worktrees/a-problem-with-this-new-additional-foundry-unit` is kept until
  this lands.
- **Direction.** Settle a failed basis that is not this execution's, once a
  later successful snapshot that contains the closure validates it, or offer
  an explicit recorded exception that still runs the record and retirement
  stages. Keep a failure on the execution's own registered revision binding.
