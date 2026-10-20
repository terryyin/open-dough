I didn't accept slice 3 for delivery. Three of its promises hold up, but one goes against the story, even though the return says everything is covered. Nothing was committed. The outcome is in `.planning/acceptance-outcome.md`.

**Accepted:**
- **A current review after the supplier resolves:** "Changed since readiness review" stays off and the story is still eligible. The test fixture only changes the dependency's state and resolution text, and the `readinessView` code produces the result itself (`lib/readiness.mjs:13-17`).
- **An unchanged legacy record:** no indication is shown.
- **Edits to the goal or the dependency agreement:** the indication still shows, for both current and legacy records.

**Incomplete: a legacy record where only the supplier's resolution changed.** The story says this record should show no "Changed since readiness review" (the last key example, plus the Scope line "a supplier's resolution leaves … off"). The code still compares the whole dependency for legacy records, including its state, so it shows the indication (`lib/readiness.mjs:15-17`). The test at `tests/readiness.test.mjs:31-36` asserts `true`, which locks in the wrong behaviour rather than proving the promise. I'm sending this back to slice 3 to fix.

**Decision for you:** the implementation followed the plan, and the plan is what's wrong. PLAN.md's design section and slice 3's Proof both say a legacy record "reads `true` once its dependency state changes", which contradicts the story's example. Either the plan needs correcting to match the story, or the story's owner changes the example. That should happen before slice 3 goes back to implementation; I haven't edited either file.

**What I checked:**
- The uncommitted diff of `lib/readiness.mjs`.
- The test and fixture setup and assertions for each claimed observation.
- The story's scope, examples and exclusions.
- Other callers of the changed functions: only the tests use them, and the signature didn't change.
- A rerun of `node --test tests/readiness.test.mjs`: all 4 claimed tests ran and passed, matching the recorded proof. The incomplete promise fails because the test asserts the wrong behaviour, not because a test was skipped.
