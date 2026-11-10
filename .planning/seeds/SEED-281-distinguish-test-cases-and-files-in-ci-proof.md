---
id: SEED-281
status: active
planted: 2026-11-09
scope: story
---

# Distinguish test cases and test files in Intent CI proof

<a id="no-count-difference-across-gaps"></a>

### Show no count difference across a missing or ambiguous part

**Identity:** SEED-281#no-count-difference-across-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** Developers comparing CI builds in Intent do not read a lost shard as
added or removed tests: a count difference and its cue appear only when the
unit's parts are complete at both compared builds.

**Scope.** Treat a unit with a missing or ambiguous part at either endpoint the
way partial timing is already treated: show both totals with the gap, and no
signed count difference or count cue, in compared rows, the overall Counts
words and the count cue. Complete units keep their differences.

**Key examples.**

- Baseline counts 1,000 test cases with part 2 of 2 missing; Landed counts
  1,090, complete. The row reads both totals with Baseline's gap and no
  `(+90)`, and takes no "more" cue.
- A folder whose results sat in Landed's missing part shows that gap rather
  than `removed`.
- Both builds complete: `1,000 → 1,090 test cases (+90)` with its cue, as now.
