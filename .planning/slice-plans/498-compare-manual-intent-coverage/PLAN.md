# Compare a short manual intent assessment with ordinary review

**Identity:** SEED-258#compare-manual-intent-coverage
**Source:** [Compare a short manual intent assessment with ordinary review](../../seeds/SEED-258-dough-intent-coverage.md#compare-manual-intent-coverage)

## Goal and scope

Terry decides whether to proceed with, narrow, or stop a public
intent-coverage skill from a measured comparison of three completed stories.
Each story is reviewed two ways: by the execution retrospective that already
ran (the ordinary review) and by a fresh, blinded, time-boxed AI intent
assessment. The result is verified decisions, consequential misses,
unsupported claims, and effort for each review, with Terry's decision
recorded in the story.

Exclusions: implementing test changes that decisions call for, and further
SEED-258 test follow-ups (queued separately). Also excluded: a new skill,
script, or dashboard view, seeded-fault calibration, rerunning the
retrospective, Cursor-hosted cases, and statistical estimates of total gaps.
No product code changes.

Assumptions: assessment agents run as subagents inside the executing session,
not as paid native host runs. Break checks are scratch edits in a blinded
store outside every shared checkout, and they are reverted before any record
is written.

## Pre-Take decision: the comparison basis

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision)
requires the basis to be set before the observed run. Terry confirms or
changes it before Take. Execution changes no basis element without his
decision, and a later change is disclosed in the comparison.

| Element | Recommendation |
| --- | --- |
| Cases | SEED-254#use-later-ci-proof-for-cancelled-landings (Claude Code; the retrospective found the running-after-proofless defect, now correction 497). SEED-256#compare-ci-time-without-runner-waits and SEED-257#compare-story-ci-through-adapters (Codex; the retrospectives advised no change). These are a mix of one known ordinary finding and two "no change" results, with host sessions on this machine. |
| Ordinary-review source | The recorded execution retrospective for each case: the product advice in its execution-complete section, any correction it planned, and its source review. |
| Assessment budget | 10 minutes of agent wall-clock time per case, at most one break check per case, and one set of focused tests. When the budget runs out, the assessment returns what it has, and the overrun is reported rather than extended. |
| Terry's budget | 10 minutes per case to read both reviews and verify their findings, so 30 minutes in total. |
| Proceed | Across the three cases, the assessment adds at least one verified, consequential decision that the ordinary review missed. It has no more than one unsupported claim per case. Its added wall-clock time stays within the budgets above. |
| Narrow | Value is concentrated in one part, such as break checks or one kind of story, or it only holds at a lower cost. Terry names the part to generalize. |
| Stop | No verified decision unique to the assessment, or its unsupported claims and verification cost outweigh what it adds. |

## Case checkpoints

Each assessment runs at the last implementation revision on the
retrospective's manifest, which is the parent of the execution-complete
record. A later object must be unavailable to the assessment.

| Case | Checkpoint | Execution-complete record (must be unavailable) | Ordinary review at |
| --- | --- | --- | --- |
| SEED-254 cancelled landings | `1359d6fb7` | `068d13a02` | `8296c54b1:.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md` and its `source-review.md` |
| SEED-256 CI time | `6f6d27f0a` | `46d2ea4a4` | the plan 492 execution-complete section at `1aa1ddd47^` |
| SEED-257 adapters | `47190ebc0` | `76565b1c2` | the plan 495 execution-complete section at `8b03f3974^` |

The story's base revision is fetched the same way, so the assessor can diff
the story's own changes. Fetching ancestors keeps later objects unavailable.

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A blinded store resolves the checkpoint with inherited alternates cleared, while the execution-complete commit is unavailable | Slice 2 store setup | 2026-11-07, job tmp dir: `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES git init`, then `git fetch --depth=1 file:///Users/terryyin/git/open-dough <full 1359d6fb7 sha>`, `git cat-file -t` and `git cat-file -e <full 068d13a02 sha>` | The checkpoint resolved as a commit and the later commit was unavailable (78 MB store). An abbreviated SHA is refused, so use full SHAs. This host does set `GIT_ALTERNATE_OBJECT_DIRECTORIES`. |
| Each case's ordinary-review output is recoverable from Git | Slice 1 | 2026-11-07: `git show <wrap-up>^:<plan>` for plans 496, 495 and 492 | All three execution-complete sections were read. Plan 496 names correction 497. Plans 492 and 495 advise no change. |
| Retrospective host sessions exist locally | Slice 1 timing | 2026-11-07: transcript directory for the SEED-254 worktree under `~/.claude/projects` (with subagent `.jsonl` files), and `grep -l` of the Codex rollouts under `~/.codex/sessions/2026/11/07` for both story slugs plus `dough-execution-retrospective` | Present only. Exact retrospective start and end times are not yet extracted. That is not decisive, because an unextractable figure is reported as unavailable, which the story allows. |
| Focused tests run at a historical checkpoint | Slice 2 | Not observed | Not decisive: a test that cannot run gives an **unknown** verdict, which is a recorded outcome of the story. |

## Effort figures

This follows the
[North Star's cost evidence](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost).
Every assessment report and the comparison show these figures per case and
per review, each with its unit and basis. Each figure is labelled
**measured** (timestamps or timers) or **estimated** (with its basis). A
figure that cannot be observed is shown as **unavailable**, not omitted and
not zero. Elapsed time and effort are separate figures, because the work can
overlap.

- **End-to-end wall-clock time**, measured from the review's start to its
  returned result, including setup and test runs. For the assessment, that
  is from store setup to the returned report. For the ordinary review, it is
  the retrospective's span in its host session.
- **Test runtime** on its own, from the test runner's reported durations.
- **Agent effort** where there is evidence, such as agent elapsed time and
  tokens when the host records them.
- **Human effort** where there is evidence. In the comparison, Terry's
  **reading** time and **verification** time are separate figures for each
  review, apart from the assessment's own runtime.

## Outside-in proof and ownership

| Promise | Owner | Proof |
| --- | --- | --- |
| Ordinary-review findings and effort per case, labelled | Slice 1 | `comparison.md` lists each case's retrospective findings with source links, its wall-clock and agent figures with labels, and unavailable figures shown as such |
| Blinded assessment per case with sourced findings, verdicts, at most one break check, and the effort figures above | Slice 2 | `assessment-<case>.md` for each case, plus a store check recorded before the assessment starts: the checkpoint resolves, the later commit is unavailable, and alternates are cleared |
| Union of findings, Terry's verified decisions, misses, unsupported claims, and effort with reading and verification kept separate | Slice 3 | `comparison.md` holds the union table, Terry's timed reading and verification figures, and the totals |
| Terry's proceed, narrow, or stop decision recorded where the next story's dependency can read it | Slice 3 | The seed's story section states the decision, its reasons, and a link to `comparison.md` |

Local gates: no product code changes, so lint and the test suites are not
gates. Run `npm run --silent format` for the planning records. A focused test
inside a blinded store runs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`, under
the maintained macOS sleep guard
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written. A baseline test that fails at a historical checkpoint is
recorded as evidence for that case's verdict; it does not change current
trunk.

## Current decisions

- The comparison records live in this plan's directory (`comparison.md` and
  `assessment-<case>.md`). Wrap-up removes them with Git recovery. Terry's
  decision and a revision link to the comparison stay in the seed.
- The assessment brief is written in slice 2 and kept with the reports. It is
  the method the next story would generalize.

## Ordered slices

### 1. Record the ordinary review's findings and effort for each case
Type: Behavior
Status: planned
Proof: `comparison.md` ordinary-review section, as in the table above.

Behavior: the retrospective result for each case is recoverable from Git →
extract its findings and the review's wall-clock span and agent time from
the host session → the comparison lists each finding with its source, and
each figure as measured, estimated, or unavailable. This happens before any
assessment runs and is not shared with the assessors.

### 2. Run the blinded short assessment for each case
Type: Behavior
Status: planned
Proof: three `assessment-<case>.md` reports, each with its store check.

Behavior: a fresh store holds only the checkpoint and the story's base, with
alternates cleared and the execution-complete commit verified unavailable →
a fresh subagent, given only the brief, the store path and the budget,
traces the promises in the checkpoint's plan and seed to production paths
and maintained tests. It runs the focused tests and at most one break check,
then reverts the break check → the report gives each promise a verdict
(protected, protected and break-checked, gap, or unknown) with its source.
A probe that did not reach the intended path is marked as such. The report
also shows the effort figures with labels. A store that still resolves the
later commit stops that case's assessment until it is rebuilt.

### 3. Let Terry verify and decide from the comparison
Type: Behavior
Status: planned
Proof: the comparison's union table and effort totals, and Terry's decision
in the seed.

Behavior: Terry reads each review for each case, timed, then verifies its
findings, timed separately → each finding from either review is one entry,
marked found by both, only ordinary, or only assessment, with Terry's
decision (retain, clarify or strengthen a test, accept the gap, or reject as
unsupported) → the comparison shows counts of verified decisions,
consequential misses, and unsupported claims for each review. It shows each
effort figure with its label, and Terry's reading and verification as
separate figures. Terry records proceed, narrow, or stop with reasons in the
seed.

This is a developer-operated observation. One request to Terry carries
everything for all three cases: both reviews per case, and an instruction to
time his reading and his verification separately and report both, or to say
he did not time them so they are recorded as unavailable. He then records a
decision for each entry and his overall decision.

## Refinement review

Slice-plan refinement was not needed. The three slices follow the
evaluation's natural order of data sources, and each owns one record. No
remaining slice-specific concern was identified.
