# Source review — SEED-353#declare-git-test-state-through-makeme

Obtained 2026-11-15 before the first implementation delegation from a fresh
general-purpose reviewer (no inherited context) whose only input was the
story's Goal, Scope, Key examples and Safe stopping point (seed section
`declare-git-test-state-through-makeme` at `e89fd11be`), with instructions to
read no other file, change nothing, and return numbered commitments, examples
and exclusions without slicing. Its exclusions: other cases' completed-history
arrangement migrates under receiving stories; no speedup claim; no open human
decision; 12.1 and 12.2 are independent alternatives; 14's edit, publish and
clean are alternative example actions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: a developer understands the landed-file admission setup from three things in the scenario | slice 3 | |
| 1.1 | its comparison | slice 3 | |
| 1.2 | its two-line file | slice 3 | |
| 1.3 | its related launch | slice 3 | |
| 2 | Routine Git wiring is removed from the scenario | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…': no write/commit/push or rev-parse; base/tree from origin.revision |
| 3 | Routine UUID wiring is removed from the scenario | slice 3 | |
| 4 | The landed-run success case in `dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts` is migrated (state declared through MakeMe) | slice 3 | |
| 5 | Named base/tip results are exposed through prepared/private origins | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts shared-prefix, private and kept tests compare revision(name) with independent rev-parse |
| 6 | Builders derive references | slice 3 | |
| 6.1 | the launch reference | slice 2 | |
| 6.2 | the landing reference | slice 2 | |
| 6.3 | the file reference | slice 3 | |
| 7 | No spec-level UUID handling | slice 3 | |
| 7.1 | no spec-level UUID creation | slice 3 | |
| 7.2 | no spec-level UUID extraction | slice 3 | |
| 7.3 | no spec-level UUID passing | slice 3 | |
| 8 | Preserved properties | slice 3 | |
| 8.1 | meaningful/real reporting contexts | slice 2 | |
| 8.2 | deferred, harness-owned construction | slice 1 | observed: dashboard/tests/support/startOriginInitialization.ts returns materializer map carried from preparation; no builder Git |
| 8.3 | sharing | slice 1 | observed: launches/start-origin-isolation.spec.ts prepared-snapshot equality and dashboard/backend-tests/launches/start-origin-private.spec.ts prefix test pass with prepared copies |
| 8.4 | isolation | slice 1 | observed: launches/start-origin-isolation.spec.ts (3) and dashboard/backend-tests/launches/start-origin-private.spec.ts publish/cleanup leaves peer and later copy unchanged |
| 9 | The architecture guide is updated | slice 3 | |
| 10 | Other cases in the spec are retained, and their independent assertions still run here | slice 3 | |
| 11 | Key example, success: a named `base` → `delivered` comparison adds exactly `line one\nline two\n` in `delivered.txt` | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' test.use originRepository withRevision delivered.txt 'line one\nline two\n' |
| 11.1 | Building that comparison's launch, landing and line-2 new-side follow-up derives one reporting reference | slice 3 | |
| 11.2 | The HTTP action admits that comparison | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' expect(launched.kind).toBe('launched') |
| 11.3 | The HTTP action names that comparison in the launched instruction | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' input toContain Path, 'Landed run base → tree', Line 2, Side new |
| 12 | Key example, refusal: admission is refused when either | slice 3 | |
| 12.1 | line 2 is removed, or | slice 1 | observed: slice 1 scratch fault: one-line declaration refused 'The line or side does not belong to this comparison.' |
| 12.2 | the follow-up refers to an unrelated launch | slice 3 | |
| 13 | The existing refusals still start no host | slice 3 | |
| 13.1 | absent path | slice 3 | |
| 13.2 | absent side | slice 3 | |
| 13.3 | out-of-range line | slice 3 | |
| 13.4 | supplied context | slice 3 | |
| 14 | Isolation example: two callers of the same description may edit, publish or clean one private copy | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts 'origins extending the run-wide prefix…' and kept-copy test: one copy publishes and is cleaned |
| 14.1 | without changing the other caller's starting state | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts peer second main^/main unchanged after first publishes and cleans |
| 14.2 | without changing a later caller's baseline | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts later caller revision('base') equals recorded prefix and its own main^/main |
| 15 | Safe stopping point: one readable admission example | slice 3 | |
| 16 | Safe stopping point: reusable construction | slice 3 | |
| 17 | The stopping point does not depend on later migration | slice 3 | |
| 18 | No open human decision is left at the stopping point | slice 3 | |
