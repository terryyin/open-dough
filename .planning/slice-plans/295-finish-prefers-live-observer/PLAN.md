# Finish prefers its coordinator's live observer over an ended one

**Identity:** SEED-121#finish-prefers-live-observer
**Source:** [story](../../seeds/SEED-121-execution-observer-ownership.md#finish-prefers-live-observer),
refined 2026-10-11 from the decisions the developer made on 2026-10-10 under
plan 292 (`SEED-121#recovery-holds-after-reuse-and-rerun`, recoverable at
`bfd40e765ab`: `.planning/slice-plans/292-recovery-holds-after-reuse-and-rerun/PLAN.md`,
"Decisions for the developer"). Planning only; this plan grants no Take,
execution, or publication.

## Goal and boundaries

A coordinator whose `finish` holds a live observer of its own completes the
final closure on that observer and stops it before retiring the worktree,
instead of retiring on an ended observer's record while its live observer runs
on to its budget. With none live, one ended observer that registered the
closure settles it only through a recorded CI verdict, as several already do.

Preserved, from plans 280, 288, 291, and 292: owner-first selection with no
owner-free fallback; another coordinator's observer is never registered on,
completed, or stopped; `ambiguous` means several live observers; a live
observer that covers the closure is reused; among several ended observers the
first whose record holds a verdict, when every recorded verdict agrees; the
`ended` gap when none holds one or they differ; the ambient rerun after
retirement on the caller's one live observer; the existing CLI forms, receipt
shapes, and recovery steps. The observer selection of `deliver` and `resume`
is untouched.

Excluded: a new record field, owner model, or CLI flag; the closure assessor's
native signals, which stay under the story's Pending native evidence; stopping
any observer other than the one `finish` completes on.

## Current findings

Reviewed at `5ef5f881` in this plan's workspace; product files equal
`b4315821`.

| Finding | Evidence | Impact |
| --- | --- | --- |
| The only covering observer outranks the owner's live one | `ownedObservers.select` in `trunk-closure-observer.mjs` tries, in order, a covering live observer, the only covering observer, the live observer, then `completedObserver` among several ended ones | One ended observer that registered the closure beside a live one that did not is selected, whatever its record holds |
| An ended observer's cancelled attempt retires the worktree | `completeRevision` on such a record returns `unresolvedReason: "observation_cancelled"` with `shutdown.status: "confirmed"`; `receiptPermitsRetirement` in `trunk-closure.mjs` requires only no `failure` verdict and confirmed shutdown | `finish` retires with no CI verdict for the closure, alone or beside a live observer |
| Nothing stops the live observer `finish` did not select | `finish` completes and stops only `observation.directory` | After retirement the coordinator's live observer keeps running to its eight-hour budget, with the closure registered nowhere live |
| The `ended` gap names registered observers only when several | `ownerGapReason` in `execution-increment-observation-gaps.mjs` adds the "N of its observers each registered this revision" clause for `registered.length > 1` | One ended observer that registered the closure without a verdict would be reported only as ended, not as having registered it |
| Guidance describes the several-ended rule only | `wrap-up-closure-publication.md`: the `step: "observation"` row and the rerun paragraph ("completion is repeated on this coordinator's observer that covers it"; "Among several ended observers…") | The one-ended case and the live preference are unstated |

PFE: the selection already lives in one place, `ownedObservers.select`, and
`completedObserver` already holds the verdict rule for several ended
observers. The correction removes the sole-covering special case from that
rule rather than adding a recognizer; no responsibility moves.

## Observed premises

Observed on 2026-10-11 at `5ef5f881` in this plan's workspace with a scratch
journey test beside `trunk-closure-owner.test.mjs`, deleted before this plan
was written; no product file changed. Each journey is `closureBesideSibling`
on Claude Code: `acceptedIncrement`, `commitFinalClosure`, then the owner's
`deliver`, which registered the final closure on the publisher's observer.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| One ended observer with a recorded `success` beside the owner's live observer retires on the ended record | Slice 1 | `releaseCi` success, `completeThroughCli(publisher, final)` (verdict `success`, shutdown confirmed), a second observer started from the execution worktree and claimed for the owner through the installed hook, then the installed `finish --created-for-work` | `code 0`, `step: "done"`, `observation.directory` = publisher, `state: "recovered"`, completion `success`/`confirmed`, `cleanup.worktree: "removed"`; the second observer's coverage stayed `[]` and its worker `alive` |
| The same with the ended record holding only a cancelled attempt | Slice 1 | `fixture.stopObserver(publisher)` before CI released, the second observer as above, `releaseCi`, `finish` | `code 0`, `step: "done"`, `observation.directory` = publisher, completion `unresolvedReason: "observation_cancelled"`, no verdict, shutdown `confirmed`, worktree removed; second observer `alive` |
| A sole ended observer whose record holds only a cancelled attempt retires, none live | Slice 2 | `fixture.stopObserver(publisher)` before CI released, `releaseCi`, `finish` | `code 0`, `step: "done"`, completion `observation_cancelled`, worktree removed |
| An owner's observer armed from the default checkout is listed and selected live by `finish` | Slice 1 journey setup | `trunk-closure-owner.test.mjs` "an ambient rerun after worktree removal…" run alone in this workspace | Passes: `finish` registers, completes, and stops that observer |
| Fixture teardown cannot stop a live observer armed from a retired execution worktree | Slice 1 journey setup | The two scratch journeys above ended with `spawn … /execution/.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs stop` `ENOENT` at teardown | The journey arms the owner's second observer from the default checkout (`startObserver("sibling")` claimed for the owner), as `rerunArming` already does for Claude Code, so teardown reaches it however `finish` ends |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| `finish` registers the closure on the owner's live observer, completes it there, stops it, and retires, beside one ended observer that registered the closure, whatever that record holds | Slice 1: a journey through the installed `finish` in `trunk-closure-owner.test.mjs` for both ended records; `trunk-closure-observer-selection.test.mjs` for the selection beside one ended covering observer |
| With none live, a sole ended observer settles the closure only by a recorded verdict; a cancelled attempt reports the `ended` gap naming it, with the `deliver` step and resources kept; after that `deliver` the rerun completes and retires | Slice 2: a journey through the installed `finish` in `trunk-closure-owner-gaps.test.mjs`; the selection suite for the sole ended record; `execution-increment-observation-gaps.test.mjs` for the one-registered clause |
| A sole ended observer with a recorded `success` still completes, before and after retirement | Existing: `trunk-closure-owner.test.mjs` "a rerun from the management context after retirement reuses that ended observer for its owner only", kept green by both slices |
| The sibling's live observer is untouched | Each journey's `assertSiblingUntouched` |
| Guidance states the rule `finish` applies | Slice 1 and 2 edits of `wrap-up-closure-publication.md`; `observer-owner-guidance.test.mjs` and `ci-completion-lifecycle-guidance.test.mjs` stay green |

## Ordered slices

### 1. The owner's live observer settles the closure before any ended one
Type: Behavior
Status: planned
Proof: A new journey in `trunk-closure-owner.test.mjs`, run for both ended
records: the owner's observer that registered the final closure ended, with a
recorded `success` (completed through `completeThroughCli`) in one run and
with only a cancelled attempt (`stopObserver` before CI released) in the
other; the owner's second observer, armed from the default checkout and
claimed through the installed hook, never registered it. The installed
`finish --created-for-work` reports `observation.directory` as the live
observer with `state: "recovered"`, coverage of that observer `[final]`,
`assertCompletedAndStopped` on it, `cleanup.worktree: "removed"`, the ended
observer's coverage record unchanged, and the sibling untouched. In the
selection suite, one ended covering observer beside a claimed live one selects
the live one, for a verdict record and for a cancelled-attempt record.

Behavior: One of the coordinator's observers registered the final closure and
ended; another of its observers is live and did not → `finish` → the closure
is registered on the live observer, completed there with CI's verdict, that
observer's shutdown is confirmed, and only then is the worktree retired; the
ended record settles nothing.

Start from the journey as the failing test: today it selects the ended
observer and leaves the live one running, as observed above. Move the live
observer ahead of the sole covering observer in `ownedObservers.select`, and
state the preference in the `step: "observation"` row and the rerun paragraph
of `wrap-up-closure-publication.md`: completion is repeated on this
coordinator's live observer, else on the ended one by its recorded verdict.

Safe stopping point: the story's goal holds; a sole ended observer with a
cancelled attempt still retires, as today, until slice 2.

### 2. A sole ended observer settles the closure only by its recorded verdict
Type: Behavior
Status: planned
Proof: A new journey in `trunk-closure-owner-gaps.test.mjs`: the owner's one
observer registered the final closure and was stopped before CI released;
`finish` is asserted through `assertUnresolvedCoverage` with
`ownership: "ended"` and a reason naming that observer, that it registered the
closure without a CI verdict, and the `deliver` step; then the owner's
`deliver` establishes a new observer, `releaseCi` succeeds, and the rerun
completes on it with `cleanup.worktree: "removed"`, the sibling untouched. In
the selection suite, a sole ended covering observer whose record holds only a
cancelled attempt selects none, and one whose record holds a verdict is
selected. `execution-increment-observation-gaps.test.mjs` proves the
one-registered clause beside the existing several clause, through
`classifyObservers` as that suite reads its kinds.

Behavior: None of the coordinator's observers is live, the one that
registered the closure holds only a cancelled attempt, and the execution
worktree exists → `finish` → `step: "observation"`, `ownership: "ended"`,
nothing retired; after the next `deliver` establishes the coordinator's own
observer, the rerun completes on it and retires.

Delete the sole-covering candidate from `ownedObservers.select`, so the ended
candidates are `completedObserver` for one as for several. Extend
`ownerGapReason`'s registered clause to one observer without changing the
several wording the existing tests pin, and keep the gap table's proof
derived from the classifier. State the rule in the `step: "observation"` row:
an ended observer settles the closure only by a recorded verdict, one as
several.

Safe stopping point: the whole story holds.

## Current decisions

- The developer's decisions of 2026-10-10 stand as the story records them; no
  decision is open.
- The one-registered clause of the `ended` gap names the observer and that
  its record holds no CI verdict for the closure; its exact words are
  execution's, the several clause stays as pinned.

## Verification and gates

Run focused suites through `npm test -- <paths>` with the Node in
`.node-version` and Bash 5 first on `PATH`, per
[tests/README.md](../../../tests/README.md). Consumers of the changed rule
and wording run green at each slice: the `trunk-closure*` and `closure-*`
suites under `src/skills/dough-story-wrap-up/scripts/`,
`execution-increment-observation-gaps.test.mjs`,
`observer-owner-guidance.test.mjs`, and
`ci-completion-lifecycle-guidance.test.mjs`. `trunk-closure-observer.mjs` is
hashed into the trunk-closure and git-publication evidence identities, so
`tests/native-evidence-identity.sh` and `tests/git-publication-native.sh` run
without `--native`; paid native runs are manual only and stay under the
story's Pending native evidence. Each slice includes proof acceptance,
independent post-change refactoring, and coordinator-owned formatting and
delivery.

## Pending native evidence

Carried in the story's
[Pending native evidence](../../seeds/SEED-121-execution-observer-ownership.md#finish-prefers-live-observer),
including the retained trunk-closure and git-publication evidence identities
that change with the hashed modules, and the closure assessor's signals for an
absent `--session-json` and for `notifies` when the next paid run is
authorized.
