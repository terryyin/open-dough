# Near-term watch list

```json dough-feedback-review
{ "schemaVersion": 1, "reviewed": "2026-11-13", "reviewAfter": "2026-11-20" }
```

Reviewed 2026-11-13 (Asia/Singapore): Open Dough, Doughnut, Pygardon, Lizard
and Clipboard supplied shared logs. Terry Talks has process retrospective off.
The examined executions supplied no verified qualifying scope-restriction use.
The watch remains pending.

<a id="scope-limits-and-required-restrictions"></a>

## Scope limits mistaken for required restrictions

- **Evidence.** Doughnut's [E2E story](https://github.com/nerds-odd-e/doughnut/blob/65193fefdfb9c024bd76cfa4f6cfd08ac43d40dd/.planning/seeds/SEED-015-concurrent-worktree-environments.md#L535)
  promised multiple specs, but the inherited single-spec gate survived until the
  [correction](https://github.com/nerds-odd-e/doughnut/commit/9d2cccbfefa7f8a88446a17139012470c564dd24).
  Pygardon's [no-broker-request clause](https://github.com/terryyin/pygardon/blob/769c482446d3b93df32730a332e34978c40d6fca/.planning/slice-plans/437-holding-protection-observation/PLAN.md#L211)
  remains qualified because the authorized round had independent safety concerns.
- **Response.** `30d29640c` requires an independent reason for a restriction in
  [planning](../../src/skills/dough-story-refinement/references/planning.md#examples-and-constraints)
  and [execution](../../src/skills/dough-execute-plan/references/execution-decisions.md#resolve-a-disputed-plan-restriction).
  It first shipped in `v0.3.75` on 2026-10-29. The prior review records the
  [walkthrough, adoption and five-source coverage](https://github.com/terryyin/open-dough/blob/5afe6fee8fe34322752e9e44911d72eb31dd4991/docs/maintainer/near-term-watch-list.md).
- **Watch start.** Pending first verified relevant use. Open Dough's
  [SEED-262 / DD-462](https://github.com/terryyin/open-dough/blob/220026a4e1b8409ffa81f50cd8e3130945ff8472/DearDough.md)
  used 0.3.91 and deleted the inherited helper as the story required. The plan
  leaves it unclear whether the helper signature was treated as a restriction.
- **Observe.** Record the execution and guidance revision, the restriction,
  its independent reason, and the decision and effect. A restriction justified
  by scope or inherited behavior alone is recurrence. Preserve justified safety,
  correctness and delivery guards. Review effects seven days after verified use.
