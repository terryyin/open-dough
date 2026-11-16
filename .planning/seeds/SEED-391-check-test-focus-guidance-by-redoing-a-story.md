---
id: SEED-391
status: active
planted: 2026-11-16
planted_during: Terry asked for an A/B check of the unreleased test-focus and refactoring guidance before the next release
trigger_when: selected from the backlog, before the release that would carry the guidance
scope: one story
---

# SEED-391 — Check the test-focus guidance by redoing a story

<a id="redo-the-effort-story-under-the-test-focus-guidance"></a>

### Redo the effort story under the test-focus guidance

**Identity:** SEED-391#redo-the-effort-story-under-the-test-focus-guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

An Open Dough maintainer can decide whether the guidance in `321e622c6`
("Guide tests to observe only their own subject") is ready to release, from
what it changes when the same story is executed again.

**A, the delivered run.** SEED-388#show-the-effort-a-launch-runs-with ran under
the released guidance from its Take `4b75c2888` to `eda73008b`. It changed 43
files, 31 of them tests, about 23 of which were not about effort: they compared
whole `claude` command lines, fixed positions and counts. Its repair added new
positional assertions and a looped test that branches on its case. The slice 1
refactor pass saw the repeated expectations, accepted them under the
shotgun-surgery check, and made two comment-only edits. Nothing is rerun for A.

**B, the rerun.** In a scratch workspace at `3b1479996`, the revision before
that Take, replace the installed skills with `Distribution/src/skills` as of
`321e622c6`, then execute the story's plan
`.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md` again.
Publish nothing from the scratch workspace to trunk.

Compare B with A on:

- tests edited that are not about effort, and whether each was loosened or had
  its value updated;
- positional, count, whole-list and whole-object assertions the run adds;
- parameterized tests whose body branches on the case;
- whether the refactor pass acts on the test churn or returns it as a named
  follow-up, and what the coordinator's brief told it;
- active time and cost of the run beside A's.

The plan was written under the released guidance, so this rerun does not show
whether refinement now plans the observation repair ahead of the change. Say
so in the result, or rerun the planning as well when that question matters for
the release.

Record a keep, revise or remove recommendation for each guidance edit in the
story's plan. Terry revises the guidance from that result before the next
release.
