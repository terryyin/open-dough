# Report a publication made during judgment

**Identity:** SEED-368#report-a-publication-made-during-supplier-judgment
**Source:** [story](../../seeds/SEED-368-third-blocked-execution-attempt.md#report-a-publication-made-during-supplier-judgment)

## Source and provenance

Retrospective correction of
SEED-368#reduce-model-work-during-prolonged-supplier-waiting, whose story and
plan are recoverable at
`4381215e106efd9513652b478bdf302f2424433c:.planning/seeds/SEED-368-third-blocked-execution-attempt.md`
and
`4381215e106efd9513652b478bdf302f2424433c:.planning/slice-plans/635-wait-silently-for-a-paused-supplier/PLAN.md`,
delivered on the story branch as
`c97db6b3d` (wait command), `0dca3a999` (watch guidance and `REF[:PATH]`) and
`4734da29f` (findings). That story's promises stand: one silent wait, a
publication ends it once, a nonqualifying publication keeps the hold and "the
watch continues to the same deadline", a qualifying publication "continues
the execution once".

## Current finding

- [`wait-for-publication.mjs`](../../../Distribution/src/skills/dough-execute-plan/scripts/wait-for-publication.mjs)
  compares each run against its own first observation.
- [Watch a paused supplier](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier)
  tells the coordinator, when the hold stays, to "start the command again"
  after judging.
- A publication made after the coordinator read the supplier for its judgment
  and before the rerun's first observation is therefore in the rerun's
  baseline and never reported. The judgment is at least one model turn. A
  supplier that pushes a slice and then its completion within that time leaves
  the watch silent to its deadline, where the execution stops although the
  supplier qualified. Plan 635 recorded this as obligation G3 and closed it on
  a window estimated in seconds.

Evidence is by inspection of the two files above; no run observed it.

## Goal and scope

A continued watch reports every publication the judgment did not read.

Included: the order of judgment and rerun in the watch guidance, and the
findings' check where it describes a rerun.

Exclusions: the command's flags, result lines and exit codes; the deadline and
its stop; host rules; any paid or native run.

## Direction

Start the rerun before judging. The rerun's baseline is then taken before the
judgment reads the supplier, so every publication is either read by the
judgment or reported by the rerun; one made in between is both, which costs one
extra judgment. When the judgment lifts the hold, the coordinator stops that
wait and continues. No command change is needed. A baseline flag on the
command was considered and set aside: it adds a contract for the model to carry
between calls.

## Preserved promises and constraints

- The guidance states no deadline number and adds or copies no host rule.
- The addition stays within the few sentences the behavior needs
  ([author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md));
  `execution-decisions.md` is at the 250-line limit and is not edited.
- No watch request and a supplier that qualifies at entry start no wait.

## Outside-in proof ownership

| Example | Owner |
| --- | --- |
| Nonqualifying publication, then a qualifying one during the judgment → the continued watch ends on it | Slice 1 behavior review |
| Nonqualifying publication, nothing further → the watch continues silently to the same deadline | Slice 1 behavior review |
| Qualifying publication → the execution continues once and no wait is left running | Slice 1 behavior review |

## Ordered slices

### 1. A continued watch starts before the publication is judged
Type: Behavior
Status: planned
Proof: [behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) walking the three examples above and plan 635's six key examples against the changed text; `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`.

Behavior: a watched hold receives a `publication` result → the coordinator
starts the command again with the same refs and the returned deadline, then
judges the supplier against the exact agreement → when the hold lifts it stops
that wait and continues the execution once; when the hold stays it awaits the
wait already running.

Change the `publication` bullet of "Watch a paused supplier" in
`wait-for-proof.md`, and in
`docs/maintainer/blocked-execution-experiment-findings.md` the check's
description of a rerun and of which requests count as re-entries, so a
judgment made while the rerun runs is not counted against the unchanged wait.

## Current decisions, verification and concern review

- No paid or native run, as Terry decided for the reviewed story on
  2026-11-15.
- Local gate: the slice's focused proof; hosted CI runs the full suite after
  publication. Long local gates follow the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- [Failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  applies as written, in every delegation brief and repair handoff.
- Remaining concern: whether hosts let a coordinator stop a wait it started
  (Claude Code background task stop, Codex session interrupt) is assumed from
  the long proof run wait's host rules and is checked in the slice's behavior
  review before the text is accepted.
