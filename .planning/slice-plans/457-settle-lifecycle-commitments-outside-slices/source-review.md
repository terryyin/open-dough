# Source review

Launch: fresh general-purpose sub-agent with no conversation inheritance, at
slice 1 acceptance (2026-11-03). Input: only the selected story's Goal, Scope
and Key examples from
[story 19](../../seeds/SEED-010-learn-from-execution-retrospectives.md#settle-lifecycle-commitments-outside-slices),
with instructions to read no project files and change nothing. The Evidence
paragraph was named but not supplied; nothing derives from it.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A coordinator executing a Story Branch plan can complete every slice when the story or its source review also promises landing, final target CI, a release from trunk or completion reporting | slice 3 | |
| 2 | Each commitment that only a later operation can observe has that operation as its owner | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "each lifecycle owner allocates a row that every check passes unobserved and reports as pending" |
| 3 | Such a commitment stays mandatory and unobserved until it is observed | slice 2 | |
| 4 | A slice that must act from trunk has its retained landing named in the plan | slice 3 | |
| 5 | That named retained landing is covered by the checkpoint that authorizes the step | slice 3 | |
| 6 | The developer gets no human stop whose only purpose is to break a circular gate | slice 3 | |
| 7 | No record calls a commitment observed while it still waits on a gate | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "an observation on a lifecycle row is refused by every check"; story-obligations.md "Leave a lifecycle row's last cell empty" |
| 8 | Planned execution keeps moving without weakening the evidence that closure rests on | slice 3 | |
| 9 | A source-review commitment that only an operation after execution completion can observe is allocated to that owner instead of to a slice | slice 1 | observed: story-obligations.md "Allocate to a lifecycle owner"; wrap-up.md source-review retention; src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "record --lifecycle allocates each owner, clears earlier state, and refuses observations" |
| 10.1 | Owner: landing or Story Branch integration (the accepted integration receipt) | slice 1 | observed: lifecycleOwners "landing" in story-obligation-source-review.mjs; story-obligations.md owner list; src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test |
| 10.2 | Owner: final target CI (the success completion receipt for the final accepted SHA with confirmed shutdown) | slice 1 | observed: lifecycleOwners "target CI"; story-obligations.md owner list; src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test |
| 10.3 | Owner: completion reporting (the final dashboard operation) | slice 1 | observed: lifecycleOwners "reporting"; story-obligations.md owner list; src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test |
| 11.1 | Slice acceptance does not refuse such a row for lacking an observation | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test, check --slice deepEqual ok |
| 11.2 | The execution-complete check does not refuse such a row for lacking an observation | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test, check --completion deepEqual ok; finish-or-stop.md "Record execution completion" |
| 11.3 | Dough Land's planned-completion check does not refuse such a row for lacking an observation | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs "planned completion passes unobserved lifecycle rows and names each with its owner"; dough-land/SKILL.md planned-completion paragraph |
| 12 | Those checks still refuse an unallocated row | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "an unknown owner or an obligation on a lifecycle row is malformed; unallocated rows stay refused" |
| 13 | Those checks still refuse a lifecycle row whose owner is not one of these operations | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs same test, malformed-commitment for release and Target CI |
| 14 | Wrap-up carries every lifecycle-owned row past deletion of the spent plan and source review | slice 2 | |
| 15 | Closure does not report success while any lifecycle-owned row lacks its owner's observation | slice 2 | |
| 16 | Closure's report names each such unobserved commitment and its owner | slice 2 | |
| 17.1 | Slice planning gives a Story Branch slice that must act from trunk a named retained landing (Dough Land --keep-worktree) before the step, inside the human checkpoint that authorizes it | slice 3 | |
| 17.2 | Or slice planning chooses Trunk Mode for it | slice 3 | |
| 18 | Execution performs that named landing under the checkpoint's go-ahead without a separate stop | slice 3 | |
| 19 | The plan naming the retained landing is the explicit retained-landing choice | slice 3 | |
| 20 | Dough Land still never infers a retained landing from a bare request to land | slice 3 | |
| 21.1 | A lifecycle-owned row is never recorded as observed from a pending gate | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "an observation on a lifecycle row is refused by every check" (any observed: refused); story-obligations.md "Leave a lifecycle row's last cell empty" |
| 21.2 | A lifecycle-owned row is never recorded as observed from current branch evidence | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs same test; record --observed refusal in record test; story-obligations.md same bullet |
| 21.3 | A lifecycle-owned row is never recorded as observed from the enforcing check itself | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs same test; story-obligations.md same bullet |
| 22 | Commitments that a slice's output owes stay with that slice | slice 1 | observed: story-obligations.md "Allocate to a lifecycle owner" split rule; src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test keeps slice row in list --slice 4 |
| 23 | Reuse current planning, source-review allocation, Story obligations, completion and wrap-up | slice 3 | |
| 24 | Add no second promise registry | slice 3 | |
| 25.1 | Do not weaken the CI gate | slice 3 | |
| 25.2 | Do not weaken the landing gate | slice 3 | |
| 25.3 | Do not weaken the release gate | slice 3 | |
| 25.4 | Do not weaken the retirement gate | slice 3 | |
| 26 | Do not change the ODF-267/270 vocabularies | slice 3 | |
| 27 | Do not alter release procedure | slice 3 | |
| 28 | Trunk Mode plans need no change | slice 3 | |
| 29.1 | "Final target CI is settled" is allocated to final target CI | slice 1 | observed: story-obligations.md Commitments example row 8; story-obligations-guidance.test.mjs "the documented Commitments table allocates a lifecycle owner that checks list unobserved" |
| 29.2 | The last slice completes | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs each-owner test check --slice; src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs planned-completion test |
| 29.3 | The execution-complete record proceeds | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs check --completion ok; planned-completion-guidance.test.mjs "the execution-complete record leaves lifecycle commitments unobserved for their owners" |
| 29.4 | An ordinary Dough Land proceeds | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-completion.test.mjs planned-completion test ok with pendingLifecycle; dough-land/SKILL.md paragraph pinned by dough-land-guidance.test.mjs |
| 29.5 | Closure still refuses success until the final accepted SHA's CI success receipt holds | slice 2 | |
| 30.1 | The plan names the retained landing before slice 4, inside its release checkpoint | slice 3 | |
| 30.2 | One go-ahead covers both landing and release | slice 3 | |
| 30.3 | There is no mid-slice landing question | slice 3 | |
| 31.1 | Integration refused at wrap-up: closure does not report success | slice 2 | |
| 31.2 | It names the landing-owned commitment and Story Branch integration as its owner | slice 2 | |
| 31.3 | It keeps the resources as today | slice 2 | |
| 32.1 | "The dialog lists the source" stays with the slice that renders the dialog | slice 1 | observed: story-obligations.md "Allocate to a lifecycle owner" split example |
| 32.2 | "The work is landed normally" goes to landing | slice 1 | observed: story-obligations.md split example; Pygardon 484 replay, record --lifecycle landing on 52 |
| 32.3 | The last slice no longer waits for landing evidence | slice 1 | observed: Pygardon 484 replay (f144646a), check --slice 5 and --planned-completion ok with pendingLifecycle |
| 33.1 | A row allocated to final target CI marked observed: with the current branch CI run is refused by the check | slice 1 | observed: src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs "an observation on a lifecycle row is refused by every check"; Open Dough 432 replay, K2 record --observed refused |
| 33.2 | Branch CI is not the final target CI | slice 1 | observed: story-obligations.md "Leave a lifecycle row's last cell empty" |
