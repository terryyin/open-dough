# Proportion the fresh refactor pass for records-only increments and small repairs

**Identity:** SEED-010#proportionate-refactor-for-records-and-repairs
**Source:** [story 20](../../seeds/SEED-010-learn-from-execution-retrospectives.md#proportionate-refactor-for-records-and-repairs)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

One explicit delivery rule: a records-only increment, or an owned repair that
stays within the concepts a slice's accepted refactor return already traced,
delivers with a recorded coordinator disposition instead of a fresh full
refactor agent. Every other delivery, and every uncertain case, keeps the
fresh pass. A triggered pass keeps its whole-product reach (Terry,
2026-11-04): the rule governs only the trigger, never where a pass may look
or edit. The story's Scope lists the required behavior, the two
restrictions, and the scope limits; this plan adds none.

Exclusions: no change to the refactor checks, file-size policy,
cross-subsystem gate, proof acceptance, or the execution retrospective; no
measurement tooling or new script; records-only citation correctness stays
with the coordinator's acceptance review.

Assumptions: the delivery contract lives in released skill prose, so the
rule is prose plus guidance proof under ADR 0005 section 2 (meaning-bearing
phrases, not exact sentences). Executions of this plan still follow the
installed, released guidance, so their own deliveries pay the fresh pass as
today; the rule reaches coordinators through release and update
(ADR 0003, ADR 0004).

## Existing solutions carried in (PFE)

- The delivery boundary retained in the execution conversation
  (wrap-up, "Deliver the change") and the plan's slice record that retains
  accepted proof for reuse (wrap-up step 5) are the disposition's homes; no
  new record kind.
- The accepted refactor return's reported changed paths and
  consumer-trace record (refactor skill, "Return control") are the basis an
  already-traced repair names; no new trace.
- The refactor skill's discovery already traces an implicated concept
  through untouched representations across the product and stops at the
  cross-subsystem gate; the supplied dispositions become one more input to
  that discovery, not a narrower scope.
- The execution retrospective's residue assessment over the aggregate
  commits remains the whole-product backstop for dispositions after the last
  fresh pass; it is unchanged.

## Outside-in proof

- Guidance proof: a new
  `src/skills/dough-execute-plan/scripts/refactor-disposition-guidance.test.mjs`
  run through `bash scripts/test.sh <path>` (Homebrew Bash 5 first on PATH;
  a passing run prints nothing), asserting meaning-bearing phrases in the
  delivery sequence, the refactor skill's discovery, and each delivery path.
  The existing `one-shot-guidance.test.mjs` and
  `consumer-trace-guidance.test.mjs` stay green; the former expects the
  auto-land sentence to keep "verification passes … refactor pass …
  decision" in that order.
- Behavior review (AGENTS.md): for each slice, walk one representative use
  from the story's key examples and confirm invocation context, required
  context, and useful outcome.
- Evaluation replay: the rule applied to the retained diffs, recorded as a
  table in this plan's Learnings and as the response record at ODF-141 and
  ODF-276.

Apply the repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written: a failing or flaky test is a defect to fix, reproducing on main is
attribution not exemption, CI failing on a published revision is the
publisher's to repair through to final CI, never rerun-until-green, stop only
for product, design or credential judgment, and preserve another active
owner's uncommitted repair.

## Decisive premises (settled in this worktree at `33a52589` + this draft)

1. **The pass is required unconditionally today.** Consuming operation: a
   coordinator reading delivery guidance. Observed by reading:
   `src/skills/dough-execute-plan/references/wrap-up.md` "Deliver the
   change" steps 1–2 (spawn a fresh agent; require `## REFACTOR COMPLETE`),
   `references/ci-monitor.md` step 4 (a new repair runs wrap-up),
   `references/one-shot.md` "Verify and retain the result" and "Land
   automatically when selected" (run the pass; land only once it is done),
   and `src/skills/dough-bug-fixing/SKILL.md` step 6 (defers to execute-plan
   delivery). Result: no exception exists anywhere; bug fixing inherits
   whatever delivery says.
2. **No script or test asserts the step wording or the marker.**
   `grep -rln "REFACTOR COMPLETE\|Spawn a fresh agent to run" src tests
   scripts --include='*.mjs' --include='*.sh' --include='*.ts'
   --include='*.js'` lists only
   `tests/support/delivery-evidence-amended-native-scenario-content.sh`,
   which prints a scenario line and asserts nothing about guidance. Result:
   the prose change breaks no existing proof.
3. **The related guidance tests pass at the base.**
   `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
   src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs
   src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs`
   exited 0 with no output (quiet pass).
4. **The replay inputs are readable from this machine.** `gh api` resolved
   `nerds-odd-e/doughnut` `0d343fdc2a`, `terryyin/pygardon`
   `60b7a10a4066b0181e3c1ca1d62cac8b8a66a2b0`, and `terryyin/clipboard`
   `c086e20` and `43ee728` to full SHAs. Result: slice 3 can read the
   retained diffs without a paid or owner-held step.

## Ordered slices

### 1. Delivery records a disposition instead of a fresh pass for records-only and already-traced changes
Type: Behavior
Status: done
Proof: the new guidance test asserts that wrap-up's "Deliver the change"
names the two classifications (records-only; already-traced repair naming
the accepted return it relies on), the disposition's homes (beside the slice
in the plan for planned execution; the delivery boundary in the conversation
for quick execution), that the commit check accepts the disposition in place
of `## REFACTOR COMPLETE` for those cases only, that an unclassifiable case
gets the fresh pass, that a triggered pass keeps its whole-product reach, and
that the next fresh pass's handoff lists the dispositions since the last
pass; and that the refactor skill's "Discover scope" takes those supplied
dispositions into its discovery. Behavior review walks the plan-only waiver
slice and the few-line repair inside a traced spec.

Behavior: an accepted slice's diff touches only `PLAN.md` → the coordinator
delivers → `records-only` is recorded beside the slice, no agent is spawned,
and the commit and publication proceed; an owned repair's every changed
concept lies within the slice's accepted return → the disposition names that
return and delivery proceeds without an agent; a repair adds a helper the
return never traced → the fresh full pass runs with its whole-product reach.

Edits: `src/skills/dough-execute-plan/references/wrap-up.md` (steps 1–2 and
the retained delivery boundary list, which gains the refactor disposition);
`src/skills/dough-post-change-refactor/SKILL.md` "Discover scope" (supplied
dispositions since the last pass are part of the change under review).

### 2. Every delivery path follows the one rule
Type: Behavior
Status: done
Proof: the guidance test asserts that the CI repair sequence
(`ci-monitor.md` step 4), one-shot execution (`one-shot.md`, both places)
and bug fixing (`SKILL.md` step 6 and its "Repaired" line) refer to the
delivery rule rather than an unconditional pass; `one-shot-guidance.test.mjs`
stays green. Behavior review walks a one-shot records-only refinement result
and a bug repair (product-changing, so the fresh pass runs).

Behavior: a coordinator delivering an owned CI repair, a one-shot result, or
a bug repair → reads that path's guidance → reaches the same
classification, disposition, and whole-product pass as slice delivery, with
no separate exception.

### 3. The retained cases replay against the rule and the findings record the response
Type: Behavior
Status: planned
Proof: this plan's Learnings holds a replay table, one row per retained
case, with the diff read (repository, SHA, paths), the classification the
rule as written yields, whether that matches the retained outcome
(no-op pass avoided, or pass still required), and the turns and tokens or
minutes the retained record reports with their limits (agent estimates, not
measured totals). Cases: Doughnut plan 080 slices 1–2 (`0d343fdc2a`,
`4ae0329ed8`), Pygardon plan 482 slices 6–8 (`8e6796d4`, `e11cb7fa`,
`de0e9085`), Clipboard SEED-001#portable-text repairs (`c086e20`,
`43ee728`), and at least one pass that found residue: Pygardon plan 431
slice 2, or Open Dough plan 200 slice 4 as the records-only trade-off.
ODF-141 and ODF-276 each gain a Follow-up line naming the response revision
(the slice 1–2 commits) and `unreleased` until a release contains it.
`tests/install-omits-internal.sh` stays green.

Behavior: a maintainer reads ODF-141 or ODF-276 → sees the delivered
response, its revision, its release status, and the replay evidence with its
limits → later ordinary use remains a separate observation.

## Current decisions

- Whole-product reach is a required restriction (Terry, 2026-11-04): slices
  1–2 change trigger text only; the refactor skill's discovery, checks and
  cross-subsystem gate stay as they are, apart from taking supplied
  dispositions as input.
- The records-only citation trade-off (Open Dough plan 200 slice 4) is
  accepted and named in the story; slice 3 reports it in the replay rather
  than carving an exception.
- Bug fixing inherits the rule through execute-plan delivery; slice 2 edits
  it only where its wording implies an unconditional pass.

## Learnings

- Slice 1 (accepted 2026-11-04): the execute-plan "Before delivery…" read
  row was at 29942 of `read-budget-guidance.test.mjs`'s 30000 bytes, so the
  rule could land only after compacting wrap-up step 8 and the delivery intro.
  The removed sentences remain in `fresh-increment.md` and
  `trunk-publication.md` (checked by the refactor pass); the row is now about
  29885 bytes. Slice 2 must measure its edits against the rows that read
  `ci-monitor.md` and `one-shot.md`; "Before finishing or stopping" sits at
  exactly 30000 at the base.
- Slice 1 accepted proof, reusable while its boundary holds:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
  src/skills/dough-execute-plan/scripts/*guidance*.test.mjs
  src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs
  tests/delivery-evidence-amended.sh tests/delivery-evidence-native-routing.sh
  tests/install-omits-internal.sh` (quiet pass). Refactor disposition: fresh
  pass ran (`## REFACTOR COMPLETE`): clarified "retain the disposition" and
  reduced the new test to meaning-bearing phrases.
- Slice 2 (accepted 2026-11-04): each path now names "wrap-up's refactor
  step". The one-shot "Verify and retain" link carries no
  `#deliver-the-change` anchor because `one-shot-guidance.test.mjs` forbids
  "deliver" in that section. Read rows that include `ci-monitor.md` grew 32
  bytes and stay under budget. Accepted proof adds
  `src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs`,
  `src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs` and
  `tests/payload-declaration-links.sh` to slice 1's command (quiet pass).
  Refactor disposition: fresh pass ran (`## REFACTOR COMPLETE`, no edits).

## Concern evidence

Slice-plan refinement was not needed: three slices, each with one bounded
outcome and one proof loop, no hidden preparation, and no accumulating
special cases (one classification rule applied by every path). No remaining
slice-specific concern was identified.
