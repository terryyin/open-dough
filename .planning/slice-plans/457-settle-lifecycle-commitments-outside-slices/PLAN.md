# Settle post-execution lifecycle commitments outside slice acceptance

**Identity:** SEED-010#settle-lifecycle-commitments-outside-slices
**Source:** [story 19](../../seeds/SEED-010-learn-from-execution-retrospectives.md#settle-lifecycle-commitments-outside-slices),
evidence at [ODF-333](../../../docs/maintainer/findings/ODF-333.md).
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A coordinator can complete every slice of a Story Branch plan whose story or
source review also promises landing, final target CI, a release from trunk or
completion reporting. Commitments that only a post-execution operation can
observe are allocated to that operation, stay unobserved and mandatory, and
are observed by wrap-up's existing receipts. A trunk-acting slice in a Story
Branch plan names its retained landing inside the checkpoint that authorizes
it. The story's Scope lists required behavior, restrictions and limits.

Excluded: weakening CI, landing, release or retirement gates; the
ODF-267/270 vocabularies; release procedure; Trunk Mode publication; a second
promise registry.

## Existing solutions and decisions

- `story-obligation-source-review.mjs` `readSourceReview` accepts only
  `slice N` or an empty Slice cell; `commitmentProblems` refuses unobserved
  rows at `check --slice N`, `--completion` and `--planned-completion`
  (`story-obligations.mjs`). `record` (`story-obligation-source-review-record.mjs`)
  writes the cells. Lifecycle owners extend this table and these readers; no
  new file or registry.
- Wrap-up deletes the spent plan and `source-review.md` before Story Branch
  integration and the final completion receipt
  (`dough-story-wrap-up/SKILL.md`, "Delete spent history" precedes "Integrate
  committed Story Branch Mode closure"). Lifecycle rows therefore cannot be
  marked observed in the plan; wrap-up must read them before deletion and judge
  them against the receipts it already requires (accepted integration receipt;
  `success` completion receipt for the final accepted SHA with confirmed
  shutdown; final dashboard operation).
- Dough Land runs `check --planned-completion` before any Git change
  (`dough-land/SKILL.md`, "Establish completion before landing") and never
  infers `--keep-worktree` from a request to land. A plan-named retained landing
  authorized at its checkpoint is an explicit choice, not an inference.

### Decisive premises (settled 2026-11-03 in this checkout)

Replays of the current script on recovered plans, extracted with
`git archive` into a scratch directory, run with
`node src/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan <PLAN.md> --planned-completion`:

| Case | Recovered at | Result today |
| --- | --- | --- |
| Pygardon plan 484 (commitment 52) | Pygardon `f144646a` | refuses `pending-slice` 5 and `open-obligation` G2 holding commitments 52, 53, 55, 63–66 — the circular gate |
| Doughnut plan 079 | Doughnut `e87c86c6` | `ok`, only because G3 disposes 18 landing/CI/reporting rows as `no user cost` while calling them mandatory |
| Open Dough plan 432 | `d0bd00eda^` | `ok`, only because rows 1.1, 4f.1, 4f.3, E9, V3, K2 are `observed:` the enforcing gate or branch CI |

Focused proof route: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <test paths>`
exited 0 for `story-obligations-source-review.test.mjs` and
`planned-completion-guidance.test.mjs`.

## Outside-in proof

| Example | Signal |
| --- | --- |
| "final target CI is settled" allocated to target CI; last slice done | `check --slice N`, `--completion` and `--planned-completion` pass with the row unobserved and report it as pending lifecycle; wrap-up guidance refuses success until the final SHA's success receipt |
| lifecycle row marked `observed:` with branch CI | every check refuses it |
| Pygardon commitment 52 / Doughnut G3 / Open Dough 432 rows reallocated to their owners | replay passes with no `no user cost` or gate observation; listing names each row and owner |
| integration refused at wrap-up | closure report names the landing-owned commitment and its owner; resources kept |
| Story Branch slice releasing from trunk | plan names the retained landing inside the release checkpoint; execution lands it under that go-ahead; Dough Land treats it as explicit |

Local gates: these are shared runtime-path scripts and guidance used by every
execution, so run the focused tests per slice and the full `npm test`
(Homebrew Bash 5 first on PATH, under `caffeinate -s -i`) on the final state
before publishing. The dashboard does not read these files; no dashboard suite
is required. Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests) as
written.

## Ordered slices

### 1. Lifecycle-owned commitments pass execution checks unobserved
Type: Behavior
Status: done
Proof: script tests in `story-obligations-source-review*.test.mjs` and
`story-obligations-completion.test.mjs` for: each owner accepted in the Slice
cell and by `record --lifecycle <owner>`; unobserved lifecycle rows passing
`check --slice N`, `--completion` and `--planned-completion` and reported in
their result; `observed:` on a lifecycle row refused; an unknown owner refused
as malformed. Replay Pygardon 484 and Open Dough 432 with their lifecycle rows
reallocated (432's gate observations removed): no circular refusal, and 432's
original `observed:` cells are refused. Update `story-obligations.md`
(allocation and boundaries), execute-plan `wrap-up.md` (allocate at source
review retention), `finish-or-stop.md` and Dough Land's planned-completion
paragraph, with their guidance tests.

Behavior: a source review with a commitment only a post-execution operation can
observe → the coordinator allocates it to that owner and finishes the last
slice → every execution check passes with the row still unobserved, and names
it as pending lifecycle.

Interim: until slice 2, closure relies on wrap-up's existing receipt gates
without naming the lifecycle rows; nothing lands from this story branch before
wrap-up.

Accepted (slice 1): owners are spelled `landing`, `target CI`, `reporting`
(case-sensitive, unprefixed in Slice). Every check returns
`pendingLifecycle: [{id, text, owner}]` in table order, also on refusals,
absent when no lifecycle row exists; `observed:` on a lifecycle row refuses
`observed-lifecycle-commitment`. Proof:
`story-obligations-source-review-lifecycle.test.mjs`, the completion and
guidance tests, and replays of Pygardon 484 (`f144646a`, 52/53/55/63–66
reallocated: `ok` with seven pending rows) and Open Dough 432 (`d0bd00eda^`:
six original `observed:` cells refused; cleared: `ok`).
Learning for slices 2–3: `read-budget-guidance.test.mjs` leaves almost no
headroom in execute-plan's "Before delivery" and "Before finishing or
stopping" read sets; put closure detail in `dough-story-wrap-up` files.

### 2. Wrap-up carries lifecycle commitments to closure
Type: Behavior
Status: planned
Proof: wrap-up guidance reads the pending lifecycle rows from
`check --planned-completion` at "Establish execution completion", retains them
in closure evidence before deleting the plan, and reports success only when
each owner's existing receipt holds, otherwise naming the commitment and its
owner. Guidance test pins this. Replay Doughnut 079 with G3's 18 rows
reallocated and G3 removed: the listing names all 18 with owners. Walk the
refused-integration example through `dough-story-wrap-up/SKILL.md` and
`story-branch-integration.md`.

Behavior: a completed Story Branch execution with lifecycle rows → wrap-up runs
→ closure succeeds only after landing, final target CI and reporting are
observed, else names each unobserved row and owner.

### 3. Story Branch plans name the retained landing for trunk steps
Type: Behavior
Status: planned
Proof: slice-planning guidance (slice planning `SKILL.md` "Write the plan" or
the executable-plan section of `planning.md`) requires a Story Branch slice
that acts from trunk to name a Dough Land `--keep-worktree` landing inside its
authorizing checkpoint, or to choose Trunk Mode; execute-plan guidance performs
that named landing under the checkpoint's go-ahead; Dough Land's
`--keep-worktree` paragraph accepts a plan-named landing as the explicit choice
and still refuses inference from a bare request. Guidance tests pin each.
Behavior review walks Open Dough plan 439 slice 4 (recoverable at `2d2d6a2f`)
and Pygardon plan 389: one go-ahead covers landing and release.

Behavior: a Story Branch plan whose slice releases from trunk → planning and
execution follow the changed guidance → one checkpoint go-ahead covers the
retained landing and the release, with no mid-slice landing question.

## Story obligations

### G1. Wrap-up does not yet name lifecycle rows at closure
Reported: slice 1 — "Wrap-up does not yet consume `pendingLifecycle` or refuse closure on it."
Story clause: "Closure does not report success while any of them lacks its owner's observation, and its report names each such commitment and its owner."
Disposition: interim until slices 2

## Current decisions

- Lifecycle owners form a closed set matching existing operations: `landing`
  (accepted integration or landing receipt), `target CI` (success completion
  receipt for the final accepted SHA with confirmed shutdown), `reporting`
  (final dashboard operation). Exact cell spelling may change in slice 1 if
  tests show a clearer form; the set does not grow without a story change.
- A lifecycle row never carries `observed:` in the plan; its owner observes it
  after the plan is deleted.
- A release from trunk is a slice action, not a lifecycle owner.
- At closure, record the response revision and first containing release (or
  unreleased status) at ODF-333, with the replay effort and limits.

## Concern evidence

Refinement not needed: three slices with independent proof loops (checks,
closure, planning/execution guidance), each tied to story key examples;
decisive premises settled above. Slice 1's interim is named with its replacing
slice. No slice-specific concern remains.
