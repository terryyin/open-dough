# Near-term watch list

```json dough-feedback-review
{"schemaVersion":1,"reviewed":"2026-11-10","reviewAfter":"2026-11-17"}
```

Reviewed 2026-11-10 (Asia/Singapore). Five production projects supplied post-local
shared sources: Open Dough, Doughnut, Pygardon, Lizard and Clipboard. Terry Talks
skips process review. One encountered execution is a qualified scope-watch
candidate; none established an ordinary restriction decision under the
independent-reason check.

<a id="scope-limits-and-required-restrictions"></a>

## Scope limits mistaken for required restrictions

- **Problem / evidence:** A scope limit or inherited implementation limit becomes
  a required restriction without an independent product reason. Doughnut's
  [E2E story](https://github.com/nerds-odd-e/doughnut/blob/65193fefdfb9c024bd76cfa4f6cfd08ac43d40dd/.planning/seeds/SEED-015-concurrent-worktree-environments.md#L535)
  promised several supported specs, but the inherited single-spec gate survived
  until [correction 9d2cccbfef](https://github.com/nerds-odd-e/doughnut/commit/9d2cccbfefa7f8a88446a17139012470c564dd24).
  Pygardon's [no-work/no-broker-request clause](https://github.com/terryyin/pygardon/blob/769c482446d3b93df32730a332e34978c40d6fca/.planning/slice-plans/437-holding-protection-observation/PLAN.md#L211)
  is a qualified candidate, not a proven instance; its original authorized-round
  boundary had independent command-safety concerns.
- **Assumption:** Agents recognize explicit rejections but can miss prerequisites,
  filters and suppressed operations, or treat existing code/tests as authority
  when preserving behavior. This is a working explanation, not an established
  cause of every narrow implementation.
- **Fix:** `30d29640c14711c106ce244db0b61f7db9ff74f6` strengthens the shared
  [planning rule](../../src/skills/dough-story-refinement/references/planning.md#examples-and-constraints)
  and its existing [dispute trigger](../../src/skills/dough-execute-plan/references/execution-decisions.md#resolve-a-disputed-plan-restriction).
  Required restrictions need an independent reason; unsupported capabilities and
  guards for actual safety/correctness risks remain valid. The terminology was
  accepted in [ADR 0001](../adrs/0001-ubiquitous-language-accepted.md).
- **Validation / status:** Independent authoring walkthrough covered approved-spec
  batching, the qualified polling case and a justified implementation guard;
  whitespace and commit-hook lint checks passed. First containing release
  `v0.3.75` (`0aa2b32d83f26b0a2a7956d50c2f4cc4935e50dc`) published
  2026-10-29; Open Dough, Doughnut, Pygardon, Terry Talks and Lizard adopted it
  in both native roots the same day. Installation does not establish native
  effectiveness or qualifying use.
- **Watch start:** Pending first verified relevant use. Record the containing
  release and installation/execution evidence, or the exact modified-guidance
  revision used; the source commit date does not start the watch.
- **Observe:** For each encountered relevant execution, retain project/story,
  guidance provenance, restriction, independent reason, decision and evidence.
  Scope/examples/inherited tests alone justifying a restriction is recurrence.
  Avoiding or questioning that restriction is useful only if required safety,
  correctness and delivery commitments remain intact; forced broader support or
  removal of a justified guard is a contrary effect. Count executions, not symptoms.
- **Qualified candidate (2026-11-10):** Open Dough SEED-262#migrate-clean-trunk-fixtures
  (plan 514, Claude Code, 0.3.91, which contains the v0.3.75 response). The plan
  kept the inherited `createCleanTrunkFixture` taking a description, while Key
  example 6 says no non-native test calls it. The source-only review allocated that
  commitment to slice 5, the brief stated that the source outranks the plan, and
  slice 5 deleted the helper (`git grep createCleanTrunkFixture -- ':!.planning'`
  is empty). Source: [Open Dough DD-462](https://github.com/terryyin/open-dough/blob/220026a4e1b8409ffa81f50cd8e3130945ff8472/DearDough.md),
  pruned from the log as practice. Missing fact: whether the plan treated the
  inherited signature as a required restriction or simply omitted the example.
  The watch does not start from it.
- **Review after:** 2026-11-17 for release/use status at the next shared review;
  assess effects seven calendar days after verified watch start. Without relevant
  use, keep the watch unexercised.
- **Last assessed:** 2026-11-10 (Asia/Singapore). Five eligible sources and
  relevant execution locators checked. First qualifying use remains pending.
