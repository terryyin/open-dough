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
| 1 | Goal: a developer understands the landed-file admission setup from three things in the scenario | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' reads named comparison, declared two-line file, launch, aFileFollowUp.onLandedRunOf(record) |
| 1.1 | its comparison | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' origin.revision('base'/'delivered') and .comparing({ base, revision: tree }) |
| 1.2 | its two-line file | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' test.use originRepository delivered.txt 'line one\nline two\n' |
| 1.3 | its related launch | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' storyALaunch().reportingThrough(...).withLanding(builder); file .onLandedRunOf(record) |
| 2 | Routine Git wiring is removed from the scenario | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…': no write/commit/push or rev-parse; base/tree from origin.revision |
| 3 | Routine UUID wiring is removed from the scenario | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' contains no randomUUID or reference token |
| 4 | The landed-run success case in `dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts` is migrated (state declared through MakeMe) | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' state declared through makeMe/queuedReadyRepository; admission 5/5 passed |
| 5 | Named base/tip results are exposed through prepared/private origins | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts shared-prefix, private and kept tests compare revision(name) with independent rev-parse |
| 6 | Builders derive references | slice 3 | observed: Distribution/tests/support/launchReportingTestData.mjs and followUpFileTestData.mjs derive reporting, landing and file references |
| 6.1 | the launch reference | slice 2 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts reportingThrough without reference admits; fault: mismatched launch reference refused 'This story has no landed run with that reference.' |
| 6.2 | the landing reference | slice 2 | observed: dashboard/backend-tests/sessions/completed-story-association.spec.ts 'a storyless ad hoc record links only…' via adHocCompletedAssociation withLanding(builder); fault (please instead of pleaseFor) answered absent |
| 6.3 | the file reference | slice 3 | observed: Distribution/tests/support/followUpFileTestData.mjs please() takes reference from the record's reporting |
| 7 | No spec-level UUID handling | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' no reference token (grep empty) |
| 7.1 | no spec-level UUID creation | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' no randomUUID import or call |
| 7.2 | no spec-level UUID extraction | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' no record.request.reporting read |
| 7.3 | no spec-level UUID passing | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' no reference passed to reportingThrough, forLaunch or file facts |
| 8 | Preserved properties | slice 3 | observed: slices 1–2 observations 8.1–8.4 unchanged; slice 3 builder does no Git or I/O |
| 8.1 | meaningful/real reporting contexts | slice 2 | observed: Distribution/tests/support/launchReportingTestData.mjs keeps stated/malformed references and absent reporting; 159 reached backend, 18 E2E, 4 integrated, 89 Distribution node consumers passed |
| 8.2 | deferred, harness-owned construction | slice 1 | observed: dashboard/tests/support/startOriginInitialization.ts returns materializer map carried from preparation; no builder Git |
| 8.3 | sharing | slice 1 | observed: launches/start-origin-isolation.spec.ts prepared-snapshot equality and dashboard/backend-tests/launches/start-origin-private.spec.ts prefix test pass with prepared copies |
| 8.4 | isolation | slice 1 | observed: launches/start-origin-isolation.spec.ts (3) and dashboard/backend-tests/launches/start-origin-private.spec.ts publish/cleanup leaves peer and later copy unchanged |
| 9 | The architecture guide is updated | slice 3 | observed: Distribution/tests/test-data-architecture.md origin.revision, reporting allocation, withLanding(builder), aFileFollowUp paragraph |
| 10 | Other cases in the spec are retained, and their independent assertions still run here | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts four refusal cases unchanged; 5/5 passed |
| 11 | Key example, success: a named `base` → `delivered` comparison adds exactly `line one\nline two\n` in `delivered.txt` | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' test.use originRepository withRevision delivered.txt 'line one\nline two\n' |
| 11.1 | Building that comparison's launch, landing and line-2 new-side follow-up derives one reporting reference | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' admission matches the file's derived reference to the launch's landed run; fault b refused an unrelated launch |
| 11.2 | The HTTP action admits that comparison | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' expect(launched.kind).toBe('launched') |
| 11.3 | The HTTP action names that comparison in the launched instruction | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a landed-run file follow-up admits…' input toContain Path, 'Landed run base → tree', Line 2, Side new |
| 12 | Key example, refusal: admission is refused when either | slice 3 | observed: slice 1 fault (one-line file) and slice 3 faults a and b both refused admission |
| 12.1 | line 2 is removed, or | slice 1 | observed: slice 1 scratch fault: one-line declaration refused 'The line or side does not belong to this comparison.' |
| 12.2 | the follow-up refers to an unrelated launch | slice 3 | observed: slice 3 fault b: onLandedRunOf(unkept launch) refused 'This story has no landed run with that reference.' |
| 13 | The existing refusals still start no host | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts refusal cases assert no claude calls and empty store |
| 13.1 | absent path | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts refusal case (13.1) passed: 409/400, no claude calls |
| 13.2 | absent side | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts refusal case (13.2) passed: 409/400, no claude calls |
| 13.3 | out-of-range line | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts refusal case (13.3) passed: 409/400, no claude calls |
| 13.4 | supplied context | slice 3 | observed: agent-launch-follow-up-file-admission.spec.ts refusal case (13.4) passed: 409/400, no claude calls |
| 14 | Isolation example: two callers of the same description may edit, publish or clean one private copy | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts 'origins extending the run-wide prefix…' and kept-copy test: one copy publishes and is cleaned |
| 14.1 | without changing the other caller's starting state | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts peer second main^/main unchanged after first publishes and cleans |
| 14.2 | without changing a later caller's baseline | slice 1 | observed: dashboard/backend-tests/launches/start-origin-private.spec.ts later caller revision('base') equals recorded prefix and its own main^/main |
| 15 | Safe stopping point: one readable admission example | slice 3 | observed: dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts 'a file follow-up on a launch's landed run admits…' 142-line spec; case reads as declared comparison, launch and file anchor |
| 16 | Safe stopping point: reusable construction | slice 3 | observed: makeMe.aFileFollowUp, LaunchReportingBuilder and StartOrigin.revision documented in test-data-architecture.md |
| 17 | The stopping point does not depend on later migration | slice 3 | observed: no deferred sibling migrated; refusal arrangement unchanged |
| 18 | No open human decision is left at the stopping point | slice 3 | observed: no open human decision in plan or returns |
