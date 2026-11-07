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

Exclusions: implementing test changes that decisions call for, including the
Branch and Landed test follow-up.
Also excluded: a new skill,
script, or dashboard view, seeded-fault calibration, rerunning the
retrospective, Cursor-hosted cases, and statistical estimates of total gaps.
No product code changes.

Assumptions: assessment agents run as subagents inside the executing session,
not as paid native host runs. Break checks are scratch edits in a blinded
store outside every shared checkout, and they are reverted before any record
is written.

## Confirmed comparison basis

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision)
requires the basis to be set before the observed run. Terry confirmed the
basis below on 2026-11-07. A later change requires his decision and is
disclosed in the comparison.

| Element | Confirmed basis |
| --- | --- |
| Cases | SEED-254#use-later-ci-proof-for-cancelled-landings (Claude Code), SEED-256#compare-ci-time-without-runner-waits and SEED-257#compare-story-ci-through-adapters (Codex). SEED-254 has a known defect in the story's behavior. The other two retrospectives advised no change. The evidence concerns Open Dough CI comparisons. |
| Ordinary-review source | The recorded execution retrospective for each case, including its product advice, any planned correction, and its source review. Record SEED-254's known running-after-proofless defect and its pre-existing unavailable-slot retry issue. Keep the retry issue outside the story-attributable comparison counts and credit its discovery to ordinary review. |
| Assessment budget | 10 minutes of end-to-end wall-clock time per case, including setup, the focused test run, at most one break check, and report writing. Stop work at the limit and return the evidence gathered so far, including any gaps left unassessed. |
| Terry's budget | 10 minutes per case to read both reviews and verify findings, for 30 minutes in total. Time reading and verification separately. Mark claims left unchecked at the limit as unverified and keep them out of the verified findings. |
| Proceed | Within the budgets, the assessment adds a verified consequential decision that justifies its extra effort, or reaches equivalent useful decisions at demonstrably lower total effort. The assessment has no consequential miss and at most one unsupported claim per case. The lower-effort route requires comparable cost evidence. |
| Narrow | A technique such as break checks or a particular type of case adds verified value within its cost, while the evidence falls short of Proceed. This includes useful findings alongside a consequential miss. Terry names the scope worth pursuing. |
| Stop | Neither the full method nor a narrower use shows verified value worth the effort. |

A verified match identifies the same specific failure path and supports a
decision. An unknown verdict remains unresolved. If the other review
verified a consequential finding on that path, record the consequential
miss as well. Keep unsupported claims, unknown verdicts, and findings left
unverified at the time limit distinct.

## Case checkpoints

Each assessment runs at the checkpoint immediately before its
execution-complete record. The base is the parent of the story's Take.
The execution-complete object must be unavailable from the blinded store.

| Case | Base | Checkpoint | Execution-complete record | Ordinary review at |
| --- | --- | --- | --- | --- |
| SEED-254 cancelled landings | `93fe559deda21cb9004608e5026a6a9b9247ac82` | `1359d6fb76b8ff2b4295e2b4febe0e467ec72be1` | `068d13a02892fb5aede5b6f3b427d3414a3492bc` | `8296c54b1:.planning/slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md` and its `source-review.md` |
| SEED-256 CI time | `c90e30dd1d1202de96facbc3f2bdb30e88051a7a` | `6f6d27f0ad119fd1a645b787b28e1c41b066e86e` | `46d2ea4a40607fb9085ced0bb5087fe4066a0d03` | the plan 492 execution-complete section at `1aa1ddd47^` |
| SEED-257 adapters | `577b9e62135166386212d9041af1953e2eaf5f28` | `47190ebc009ceedfe4f7a882c941b2645f0a309e` | `76565b1c29fa2370a868fbe7c97e46bfbd4d95cf` | the plan 495 execution-complete section at `8b03f3974^` |

The coordinator uses the ordinary-review records to identify the story's
attributable implementation changes, then gives the assessor a neutral list
of changed paths or patches without the findings. For SEED-254 use
`85946790e` and `1359d6fb7`. For SEED-256 use `10fa0a78c`, `8f92cfc2`,
and `6f6d27f0a`. For SEED-257 use `8dcf704f6`, `c7432cf14`, and
`ef486f0ff`. The review records distinguish intervening trunk changes and
the separate Cursor runner repair. The assessor judges protection at the
full checkpoint, using the attributed changes to scope the review.

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A blinded store resolves the base and checkpoint, while the execution-complete commit is unavailable | Slice 2 store setup | 2026-11-07, three temporary stores. With `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset throughout, run `git init`, then `git fetch --no-tags --depth=1 <project file URL> <base>:refs/heads/case-base <checkpoint>:refs/heads/case-checkpoint` with the full SHAs above. Check both commits, the checkpoint's original plan, and the later object with `git cat-file`. | In all three stores, both commits and the original plan were readable, exactly two commits were reachable, and the execution-complete object was unavailable. The fresh assessor's brief confines it to the supplied inputs. |
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
  returned result. For the assessment, that covers preparing the attributed
  context and store, test runs, and writing the report. For the ordinary
  review, it is the retrospective's span in its host session.
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
| Union of findings, Terry's verified decisions, misses, unsupported claims, unknowns, and effort with reading and verification kept separate | Slice 3 | `comparison.md` holds the union table, with unverified findings and pre-existing observations marked separately, Terry's timed reading and verification figures, and the totals |
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
  `assessment-<case>.md`). Before wrap-up removes them and the pilot section,
  carry Terry's decision and a pinned comparison link into the surviving
  seed context or the next story's dependency resolution.
- The assessment brief is written in slice 2 and kept with the reports. It is
  the method the next story would generalize.

## Ordered slices

### 1. Record the ordinary review's findings and effort for each case
Type: Behavior
Status: planned
Proof: `comparison.md` ordinary-review section, as in the table above.

Behavior: the retrospective result for each case is recoverable from Git →
extract its findings and the review's wall-clock span and agent time from
the host session → the comparison lists each finding with its source,
marks pre-existing findings outside the comparison counts, and labels
each figure measured, estimated, or unavailable. When historical timing
is unavailable, assess any added value against its observed cost and leave
time savings undetermined. This happens before any assessment runs and is
kept separate from the assessors' brief.

### 2. Run the blinded short assessment for each case
Type: Behavior
Status: planned
Proof: three `assessment-<case>.md` reports, each with its store check.

Behavior: a fresh store holds the checkpoint and the story's base, with
alternates cleared and the execution-complete commit verified unavailable →
a fresh subagent receives the store path, neutral attributed-change
context, and the budget, then traces the promises in the checkpoint's plan
and seed to production paths
and maintained tests. Within the full per-case budget it runs focused tests
and at most one break check, reverts the check, and writes the report →
the report gives each assessed promise a verdict
(protected, protected and break-checked, gap, or unknown) with its source.
A probe that did not reach the intended path is marked as such. The report
also shows the effort figures with labels and identifies promises left
unassessed at the limit. A store that still resolves the later commit stops
that case's assessment until it is rebuilt.

### 3. Let Terry verify and decide from the comparison
Type: Behavior
Status: planned
Proof: the comparison's union table and effort totals, and Terry's decision
in the seed.

Behavior: Terry reads both reviews for each case and verifies their findings
within his time budget, timing reading and verification separately → each
distinct finding gets one entry, with the reviews that found it, the
evidence, and Terry's decision → the comparison shows verified decisions,
consequential misses, and unsupported claims for each review, with unknowns,
unverified findings and pre-existing observations identified separately.
It shows each labelled effort figure and Terry's separate reading and
verification times. Terry applies the confirmed basis and records his
proceed, narrow, or stop decision with reasons in the seed.

This is a developer-operated observation. One request to Terry carries
everything for all three cases: both reviews per case, and an instruction to
time his reading and verification separately within the budget, and report
both figures or mark them unavailable. He records his verified decisions and
the overall decision. Any unchecked entries are marked unverified.

## Refinement review

The updated comparison basis fits the existing three slices. Baseline
classification belongs to slice 1, the capped assessment reports to slice 2,
and verification and the decision to slice 3. No remaining slice-specific
concern was identified.
