# Finish retires the worktree only on a success verdict

**Identity:** SEED-121#finish-retirement-without-verdict
**Source:** [story](../../seeds/SEED-121-execution-observer-ownership.md#finish-retirement-without-verdict).
Planning only; this plan grants no Take, execution, or publication.

## Goal and boundaries

A developer whose coordinator's `finish` ends a Trunk Mode closure without a CI
verdict for the final closure keeps the execution worktree and branch and is
told why. Retirement follows only a completion receipt that holds
`verdict: "success"` with `shutdown.status: "confirmed"`; the product states
that rule where coordinators read it and a journey through the installed
`finish` pins it.

Included: the retirement predicate in `trunk-closure.mjs` and its `completion`
stop's recovery wording for the unresolved case; the rule's statement in
`wrap-up-closure-publication.md` (the `finish` description, the `completion`
result row, and the Story Branch retirement gate) and in story wrap-up's
"Remove execution resources safely"; the guidance test that pins that wording;
the installed-`finish` journey for a live observer that records no verdict.

Excluded (the story's deferred promises): keeping the observer alive after an
unresolved completion; any change to `awaitRevision`, `completeRevision`, or
`finish`'s ended-observer selection; background settlement, dashboard-owned
monitoring, and automatic retirement (SEED-063); Dough Land's own landing,
which has no CI obligation; Story Branch Mode script changes, since its gate
is guidance the coordinator applies.

Assumptions: Dough Land's retirement core keeps its containment and creation
gates unchanged after the receipt gate; the fixture's observer budget is the
practical way to reach an unresolved receipt in a test, and the ten-minute
deadline is the same rule, not a separate case; SEED-063's slice 11 later
rewrites this path for its background contract with the same rule, positive
settlement, and its plan records that it neither removes nor completes this
story, so neither story blocks the other.

## Architecture

Established structure supports the work; no North Star topic or ADR change.
PFE: the rule already exists once, in `receiptPermitsRetirement`, with the
shared completion rule stated in `ci-monitor.md` ("a successful receipt with
confirmed shutdown satisfies this observation"); this story tightens that one
predicate to match and aligns the two guidance homes that paraphrase it. No
second predicate, settlement store, or retirement path is added. Accepted ADRs
0002 and 0006 apply as the seed records: one shared behavioral source under
`src/skills/`, written for the executing coordinator.

## Observed premises

Observed on 2026-10-11 in this preparation worktree at `4f9827ae` with the
installed closure test fixture; the scratch test lived in the wrap-up scripts
directory and was removed before this record.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Today the installed `finish` retires on a receipt with no verdict once the live observer's observation ends with confirmed shutdown | Slice 1's first example and its proof's pre-change failure | Scratch `node --test` beside `trunk-closure.test.mjs`: `createTrunkClosureFixture`, `deliverThroughCli` for the before-cleanup commit, `commitFinalClosure`, `releaseCi` for the before-cleanup SHA only, `finishThroughCli` with `--created-for-work --default-checkout` | After 62 s: `ok: true`, `step: "done"`, exit 0; `completion.unresolvedReason: "observation_unavailable"`, `detail: "monitor_unavailable"` ("Execution observation budget expired after 60000 ms."), no `verdict`, `shutdown.status: "confirmed"`; `cleanup.worktree` and `cleanup.branch` `removed`; worktree absent, branch gone, trunk at the final closure |
| A `failure` verdict and a `success` with retained shutdown already stop at `completion` with resources kept | Slice 1's unchanged examples | Existing cases in `trunk-closure.test.mjs` ("a failed CI receipt…", "a success receipt with retained shutdown…") | Present and asserting `step: "completion"`, `cleanup: "not-performed"`, worktree present |
| The fixture's observer budget is settable, so the journey need not wait ten minutes | Slice 1's proof sizing | `deliverThroughCli` passes `--max-duration-ms` to the installed `deliver`; `createManagedFixture` sets 60 000 ms | The journey ran in 62 s with the fixture default; a shorter budget through the same flag keeps the proof within seconds |
| Guidance wording is pinned by a test that must change with it | Slice 1's consumers | `grep` of `shutdown|retire` in `ci-completion-lifecycle-guidance.test.mjs` | Lines 122, 187, 204, 208, and 212 assert the current "shutdown is confirmed" phrasing of the three guidance homes |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| A live observer that records no verdict for the final closure stops `finish` at `completion`, `ok: false`, exit 1, receipt in the result, `cleanup: "not-performed"`, worktree and branch kept, trunk holding the closure | Slice 1, new case in `trunk-closure.test.mjs` through the installed `finish` with a short observer budget; it fails today with `ok: true` and removal |
| `success` with confirmed shutdown still retires; `failure` and retained shutdown still stop | Slice 1, the existing `trunk-closure.test.mjs` cases stay green |
| The unresolved stop's `recovery` names the rerun and the lost-coverage report | Slice 1, the same new case asserts `recovery` |
| Guidance names a `success` receipt with confirmed shutdown as the gate for both modes, once per home | Slice 1, `ci-completion-lifecycle-guidance.test.mjs` updated to the new wording and rerun; `observer-owner-guidance.test.mjs` stays green |
| Everything the closure contract already proves | `node --test src/skills/dough-story-wrap-up/scripts/*.test.mjs` and the two guidance tests; `npm run lint` |

Local gates: `npm run lint` is the project's hook for every commit; the
focused `node --test` files above are the slice's proof. The wrap-up closure
suite runs as a whole because the changed predicate reaches every `finish`
case in it.

## Ordered slices

### 1. `finish` keeps the worktree and branch unless the closure's receipt is a success
Type: Behavior
Status: done
Proof: the new `trunk-closure.test.mjs` case and the updated guidance test in
the proof table; the wrap-up closure suite stays green.

Behavior: the final closure is accepted on trunk and registered on the
coordinator's live observer; CI reports nothing for it and the observer's
observation ends → `finish` → `ok: false`, exit 1, `step: "completion"`,
`completion` carrying `unresolvedReason` and no `verdict`, `cleanup:
"not-performed"`, `recovery` naming a rerun of `finish` on this coordinator's
observer or a lost-coverage report; the worktree exists, the branch points at
the final closure, trunk holds it. A `success` receipt with confirmed shutdown
retires as today; `failure` and retained shutdown stop as today.

Change: `receiptPermitsRetirement` requires `verdict === "success"` beside
confirmed shutdown, and the header and predicate comments say so; the
`completion` recovery text covers the unresolved receipt. In
`wrap-up-closure-publication.md`, the `finish` description reads "only after a
`success` receipt whose shutdown is confirmed", the `completion` row adds the
unresolved receipt to what keeps the worktree and branch, and the Story Branch
paragraph's gate becomes a `success` receipt with confirmed shutdown. In
`dough-story-wrap-up/SKILL.md` "Remove execution resources safely", both
modes' gates name a `success` receipt with confirmed shutdown. Update the
pinned regexes in `ci-completion-lifecycle-guidance.test.mjs` to the new
wording, keeping its one-retirement-description check. The new test gives the
observer a short `--max-duration-ms` through `deliverThroughCli` (add the
option to that fixture if its budget is fixed), releases CI only for the
before-cleanup commit, and asserts the stop, the kept resources, and trunk.
Run the wrap-up closure suite and both guidance tests; run `npm run lint`.

Safe stopping point: the story is complete; nothing interim remains.

Accepted proof: `node --test src/skills/dough-story-wrap-up/scripts/*.test.mjs`
(56 pass). The no-verdict journey is "a receipt with no CI verdict for the
final closure stops at completion, …" in
`trunk-closure-completion-gate.test.mjs`, which also holds the failure and
retained-shutdown stops; it failed before the predicate change with exit 0 and
`step: "done"`. `node --test` of `ci-completion-lifecycle-guidance.test.mjs`
and `observer-owner-guidance.test.mjs` (7 pass), and of the other
`deliverThroughCli` consumers (81 pass).

Learnings: the observer rechecks its budget only after its fixed 30 s poll
pause, so the journey takes about 34 s whatever short budget it is given; it
lives in its own test file so it runs beside the other closure cases, and
`tests/longest-first` lists it. `docs/maintainer/execution-publication-design.md`
paraphrased the gate in its Closure row and now names `success` too.

## Execution complete

Product advice: no backlog change. This repository's own closures run the
installed `finish`, which keeps the earlier gate until a release carries this
change, so the next release is what puts the rule in force here. The
no-verdict journey's 34 s comes from the observer's fixed 30 s poll pause;
SEED-063's rewrite of this path is the place to make an ended observation
quick to reach in a test.

## Current decisions

- Retirement requires `verdict: "success"` with confirmed shutdown, the rule
  the seed records with its basis; no unresolved receipt retires.
- The shared completion operation keeps stopping the observer on an unresolved
  receipt; the rerun's recovery through `deliver` is existing behavior and is
  cited, not changed.

## Story obligations

### G1. Only one unresolved reason runs through finish
Reported: slice 1 — "Only `observation_unavailable` / `monitor_unavailable` is exercised through `finish`. The other unresolved reasons rely on the same predicate, as the plan assumes."
Story clause: "The fixture's observer budget is the practical way to reach an unresolved receipt in a test; the ten-minute deadline is the same rule, not a separate case."
Disposition: excluded "The fixture's observer budget is the practical way to reach an unresolved receipt in a test; the ten-minute deadline is the same rule, not a separate case."

### G2. Rerun after the unresolved stop is not run in the new journey
Reported: slice 1 — "A rerun of `finish` after the unresolved stop is not exercised; the plan treats it as existing behaviour."
Story clause: "the ended observer holds no verdict, so `step: "observation"` names the existing recovery"
Disposition: proved by slice 1: `trunk-closure-owner-gaps.test.mjs` "finish whose coordinator's ended observers each registered the final closure reports them ended with the deliver step; its rerun after that deliver completes on the new observer and retires…" and `trunk-closure-observer-ended-selection.test.mjs` "closure selects its coordinator's one ended observer that registered the final closure when its record holds a verdict, and none while it holds nothing or only a cancelled attempt", both green in the slice's wrap-up closure suite run

### G3. The no-verdict journey takes about 34 seconds
Reported: slice 1 — "the new test takes about 34 s, not a few seconds"
Story clause: "by a rule the product states and tests"
Disposition: no user cost "by a rule the product states and tests": the rule is tested through the installed finish; the duration is the observer's fixed 30 s poll pause, which this story leaves unchanged, and the case runs in its own file beside the other closure cases
