# Source-only review

Launch: Codex `collaboration.spawn_agent`, `/root/source_review`,
`fork_turns: none`, 2026-11-16. The actual launch/input and numbered return
are retained in the executing conversation. The input supplied only the
selected source's Goal, Scope, five edits, key examples, limits and direction
context, with the instruction to read no files, change nothing and derive
independently observable promises rather than slice ownership or acceptance.
It supplied no plan, product, implementation return or suspected omission.
Source: [SEED-391](../../seeds/SEED-391-check-test-focus-guidance-by-redoing-a-story.md#redo-the-effort-story-under-the-test-focus-guidance)
at Take `72c22dfe813bf250426c9032cfae75e3e8663459`, unchanged at review.

Reviewer qualification: the promised outcome is evidence and a recommendation
for each edit, not a promise that every edit works. For commitments 3–12,
the common reporting requirement is an observed moment quoted from B's or P's
brief, return, diff or plan, then keep, revise or remove with a reason; revise
names the wording that failed. Recommendations remain per original edit,
including where an edit has several independently observable results.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | B produces execution evidence from the specified historical plan. Scope B: one fresh session executes `.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md` as it stood at A's Take `4b75c2888` through its execution-complete record. Key-example qualification: if an unrelated failure stops B, failure policy governs, the result records how far reached, and later moments are not exercised. |  | G1 |
| 2 | P produces a planning result that is read without execution. At `0e6b0f3dc`, plan removed and same patch applied, one fresh session slice-plans the story; resulting plan read and not executed. | slice 4 |  |
| 3 | Evaluate whether shotgun-surgery acceptance excludes tests whose subject is not the concept (`refactor-checks.md`, edit 1), when slice 1 refactoring meets tests edited for effort that are not about effort. Accepting those edits as clean or concept tests yields revise with the sentence relied on; if the implementer already narrows them away, not exercised. | slice 5 |  |
| 4 | Evaluate whether a test asserts what its name promises (`refactor-checks.md` via `test-entry-rules.md`, edit 2), when slice 1 implementation/refactoring edits or adds launch assertions. Judge newly written assertions and the refactor pass; the plan's exact-argv value updates alone do not establish failure. | slice 5 |  |
| 5 | Evaluate the one-reader guidance in test support (edit 2), at the same implementer/refactor moments and source paths as commitment 4. | slice 5 |  |
| 6 | Evaluate whether a parameterized test whose body branches on its case becomes separate tests (edit 2), at the same implementer/refactor moments and paths as commitment 4. | slice 5 |  |
| 7 | Evaluate whether an oversized refactor candidate is returned as a named follow-up (`dough-post-change-refactor/SKILL.md` and `deliver-the-change.md`, edit 3), at slice 1 refactor return. A successful return names smell, concept, file count and representative files. Returning none after accepting outside-subject edits yields revise; if those edits are narrowed away first, not exercised. | slice 5 |  |
| 8 | Evaluate whether that named follow-up reaches the plan's execution-completion learnings (edit 3's carried-into-wrap-up promise). Quote the returned follow-up and its carried learning. | slice 5 |  |
| 9 | Evaluate whether the coordinator's slice 1 refactor brief states facts (`deliver-the-change.md`, edit 4). | slice 5 |  |
| 10 | Evaluate whether that brief includes the count of tests edited outside the subject (edit 4). Key example: outside-subject count and no remedy yields keep. | slice 5 |  |
| 11 | Evaluate whether that brief leaves remedies to the refactor pass (edit 4). Naming a remedy such as “extract a helper for the argv” yields revise with the quote. | slice 5 |  |
| 12 | Evaluate whether P places a Structure slice before changing an effect causing many unrelated consumers to fail (`executable-proof.md`, edit 5). Mechanical slice-1 consumer updates again yield revise; opening with a Structure slice narrowing consumers yields keep. | slice 5 |  |
| 13 | Distinguish an absent evaluation moment (not exercised) from an observed moment that changed nothing. | slice 5 |  |
| 14 | Inventory outside-subject test edits and classify each as loosening or value update. Values updated under the nine-spec instruction are listed as following the plan. | slice 2 |  |
| 15 | Inventory new positional, count, whole-list and whole-object assertions. | slice 2 |  |
| 16 | Inventory parameterized tests whose bodies branch on their cases. | slice 2 |  |
| 17 | Present B's active time and cost beside A's using the same transcript measurement method. | slice 3 |  |
| 18 | Identify observed moments that today's memory or the intervening `focused-proof-through-test-runner` change could explain. | slice 5 |  |

## Unnumbered source context returned by the reviewer

- Settled A baseline: released `0.3.102`, Take `4b75c2888` through
  `eda73008b`, completion `c741f265f`; 43 non-planning files, 31 tests,
  26 in slice 1, about 23 outside effort. Recorded repair/refactor behavior,
  session/model/effort and transcript provenance are evidence, not a rerun.
- Controlled B: only patch `934a51a30` on the installed skill copies at the
  historical Take; history ends there; A's instruction with scratch
  substitutions, A's model/effort, no comparison knowledge, dashboard context,
  publication authority, this seed, A's outcome or later repair `0724558d6`.
- Containment/stopping: scratch remote only; no real remote/trunk/backlog/
  dashboard changes from B, no hosted CI or added paid native-host run;
  local gates from the plan; no B wrap-up, retrospective or landing.
- Interpretive limits: the plan budgets nine specs' exact-command updates,
  so value updates alone do not count against guidance; loosening shows it
  prevailing. One B and one P cannot separate guidance from variation;
  counts/time/cost support no effect size. Local-only B differs from A's
  branch publication and CI observation. Today's memory differs from A's.
- Deferred: execution of P, repeated B or A variance runs, refactor-only replay.
- Direction rationale: patched B plus read-only P exposes the five stated
  moments with one variable; alternatives and historical file differences
  explain that choice rather than adding promised outcomes.
