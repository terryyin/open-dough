# Slice Delegation

Use a fresh general-purpose sub-agent (or GSD `gsd-executor` when inside
`/gsd-execute-phase`). Keep wrap-up coordinator-owned; do not rely on
`gsd-executor` to run local dough-post-change-refactor.

The implementer prompt must include:

1. Plan path, current slice, and its mapped promises/observations from across
   the selected contract under [planning](../../dough-story-refinement/references/planning.md)'s Proof decisions (including
   applicable replacement/lifecycle obligations). Omit full history/Jidoka lists.
2. A Jidoka stop for value/design forks, missing credentials, undiagnosed
   unrelated failures, or ambiguity.
3. [slice decomposition](../../dough-story-decomposition/references/problem-decomposition.md), [planning](../../dough-story-refinement/references/planning.md), and the client workflow precedence rules,
   including the client slice target / hard limit and permitted exceptions, relevant-test
   proof, no commit on red, no deliberately broken CI, and capability naming.
   Do not run a broader suite unless the slice's proof names that suite.
4. A hard stop before wrap-up: do not commit, push, mark the plan done, run
   dough-post-change-refactor, run the selective formatting command, or independently run the hook-owned lint command.
   Leave relevant tests green and the tree uncommitted.
5. `revert_and_refine` when the slice is too big; the coordinator will invoke
   **dough-slice-plan-refinement** on the existing PLAN.
6. The client tooling wrapper, literal focused commands, and Git convention.
7. A short return: ready for wrap-up with one or more compact proof blocks,
   Jidoka stop, or reverted and ready for refinement. Do not claim the slice is
   done in Git terms. Use this repeatable shape for every green focused command:

   ```text
   proof:
     command: <exact focused test command>
     covers: <behavior or paths this command covers>
     result: pass
   ```

   Connect the returned evidence to those mapped promises; report uncovered
   behavior as incomplete implementation, not refactor work.
   The command must be literal and complete. A placeholder, abbreviation, or
   paraphrase is missing or ambiguous proof.
8. Cooperate with coordinator CI pauses: stop editing, finish or terminate
   write-capable commands, and return `## PAUSED FOR CI` with current slice,
   changed/untracked paths, exact completed proof, incomplete commands, and
   next action. Stay idle until explicitly resumed. After resume, reread files
   affected by the repair and rerun only invalidated proof. Other agents share
   the checkout; never revert their work.

Resume context remains in the plan on disk.
