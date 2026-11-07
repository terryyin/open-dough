# Review and allocate source commitments before delegating the first slice

**Identity:** SEED-010#review-source-promises-before-first-slice
**Source:** [Review and allocate source commitments before delegating the first Behavior slice](../../seeds/SEED-010-learn-from-execution-retrospectives.md#review-source-promises-before-first-slice)
**Source review:** [source review](source-review.md)

## Goal and scope

In planned execution, the coordinator obtains the source-only review, retains
and links `source-review.md`, and allocates every id before the first
implementation delegation, so `story-obligations.mjs list --slice 1` carries
slice 1's commitments into its first brief. Acceptance reuses the retained
review while the source is unchanged (no second reviewer launch), still
obtains one when an execution reaches acceptance without it, and keeps its
comparison, observation, and allocation-correction duties. A human story
amendment is re-reviewed and reallocated before the next delegation. A
missing reviewer or its evidence before the first delegation stops that
delegation.

Exclusions (deferred, not rejected): quick (planless) execution keeps its
current review timing; obtaining the review during slice planning; letting a
leading Structure slice start before the review. No script change: the
existing `record` / `list` / `check` behavior already supports up-front
allocation (premise below).

## Existing solution and decisions

- Reuse the source-only review rules now in
  `src/skills/dough-execute-plan/references/obtain-source-review.md`, the
  record form in `references/story-obligations.md#record-the-source-review`,
  and the pre-delegation listing in `references/delegation.md`. Keep one
  statement of the reviewer's isolation and input rules (do not duplicate it
  in two references); delegation and acceptance link to that home.
- Update the sentence in
  `src/skills/dough-story-refinement/references/planning.md` (plan element 7)
  that says acceptance adds and allocates the review, and the
  "Before first implementation delegation" row of
  `src/skills/dough-execute-plan/SKILL.md`'s step table so it links the
  source review.
- Guidance addresses the executing agent
  ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md));
  edit only `src/skills/`, not installed copies, and release under
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
  A guidance walk is the behavior review; no native paid run is required
  ([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
  No ADR exception or North Star topic is warranted.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| The obligations script lists slice-1 commitments before any slice runs and does not refuse later slices' unobserved rows | Scratch plan with `**Source review:**` link and four rows (two `slice 1`, one `slice 2`, one `target CI`), both slices `planned`, in the job tmp dir; `node src/skills/dough-execute-plan/scripts/story-obligations.mjs list --plan <scratch>/PLAN.md --slice 1`, then `check --slice 1` before and after `record --observed` for the slice-1 ids, at `de0a1b9e7` | `list` exit 0 with `commitments` 2.4 and 3.3; `check --slice 1` refused only `unobserved-commitment` for 2.4 and 3.3 (slice 2's row not refused), then exit 0 with `pendingLifecycle` [8] after recording. Settled: guidance-only change. |
| The guidance test that pins the moved wording passes at baseline | `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs` at `de0a1b9e7` | Exit 0, quiet pass. Its `## Accept proof` assertion (allocation before the next listing) and delegation assertion will need updating with the moved text. No other non-Markdown file pins the moved sentences (grep at `de0a1b9e7`). |
| The evaluation walk's records are recoverable | `git show e350e2aa5:.planning/slice-plans/477-load-intent-without-disruption/source-review.md` (Open Dough); `~/git/lizard` `c4c81a132:.planning/slice-plans/019-compact-callback-report/` (PLAN.md and source-review.md); `~/git/pygardon` commit `169385d4dc4da8267433435e7b6a3ba312330e3d` (plan 423) | All present; plan 477 row `S6.1` is allocated to slice 4 with its observation there. |

## Outside-in proof and ownership

- **Slice 1** owns every key example of the story.
- **Local gates**: `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-source-review-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs` plus `npm run --silent format` and `npm run lint` on the changed files. No full local suite: only guidance Markdown and its guidance test change. None of these runs long enough to need the [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos) guard; if a broader suite is run, use it as written there (`caffeinate -s -i` on observed AC power).
- **Failure policy**: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) applies as written.

## Ordered slices

### 1. Obtain and allocate the source review before the first delegation
Type: Behavior
Status: done
Proof: Focused guidance tests pass:
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-source-review-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-source-review-lifecycle.test.mjs`.
`story-obligations-source-review-guidance.test.mjs` pins
`obtain-source-review.md#before-planned-delegation` (obtain/retain/link/allocate
before the first listing; stop when unavailable) and
`#at-acceptance` (reuse without a second reviewer; obtain when none retained);
`planning.md` no longer assigns the review to acceptance. Guidance walk against
Open Dough plan 477 (`S6.1`), Lizard plan 019 (`S9.3`–`S9.7`, `K3`) and
Pygardon plan 423: revised sequence puts slice-1 ids in `list --slice 1` before
the first delegation; unchanged-source acceptance reuses `source-review.md`;
key examples 4–7 hold. Source review retained as `source-review.md` with all
ids allocated to slice 1 and observed.

Behavior: A coordinator following the revised execute-plan guidance on a plan
without a source review → finishes start and reaches the first delegation →
launches the source-only reviewer, retains, links, and allocates its return,
and the slice-1 listing carries the allocated commitments into the first
brief; acceptance of an unchanged source reuses that review.

## Current decisions

- Refactor extracted obtain/retain/allocate into
  `references/obtain-source-review.md`, Deliver into
  `references/deliver-the-change.md`, and retire-owned-watches into its own
  reference so file-size and read-budget limits hold without duplicating
  isolation rules.

## Learnings

- Anchoring full obtain text into the SKILL first-delegation row and linking
  full `delegation.md` double-counted past the 30KB read budget; linking the
  source-review record (and keeping obtain in its own reference) keeps the
  budget while still naming the source review.

## Refinement review

Refinement was not needed: one cohesive guidance move across the delegation
and acceptance references with one proof loop (guidance test plus walk); no
remaining slice-specific concern.
