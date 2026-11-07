# Review how well a story's intent is protected

**Identity:** SEED-192#assess-story-intent-protection

**Source:** [Selected story](../../seeds/SEED-192-review-product-intent.md#assess-story-intent-protection)

**Source review:** [Source-only review](source-review.md)

## Goal and boundaries

Trial Dough Intent Coverage on three recent Open Dough stories. Terry receives
a durable report for each case and can decide from the findings and review
cost whether to pursue the method. Run the assessment as part of this story
using the executing AI host, the project's existing test commands, and Git.
Keep public skill authoring, cross-project generalization, and an automatic
wrap-up hook in [the follow-up](../../seeds/SEED-258-dough-intent-coverage.md#dough-intent-coverage). Trial changes consist of reports, the link and
learning in the memorandum, and any expressly agreed backlog decisions.

## Trial cases

Use the completion checkpoints below, with their original story section and
applicable plan examples. They are reachable from trunk, and both the intent
records and relevant test sources were recovered there during preparation.
The report uses the full revision and original paths. Add directly relevant
existing tests where the initial selection leaves a promise unexamined. Use
the merge and current trunk only in the subsequent comparison.

| Case and completion checkpoint | Intent recovered from | Initial proof selection |
| --- | --- | --- |
| SEED-192#review-story-intent-impact at `7c71049b` (2026-11-02) | SEED-192, plan 441 | Story intent changes, completed story, card selection and review tree Playwright specs named below |
| SEED-248#compare-story-proof-through-merge-resolutions at `d03cf60f1` (2026-11-06) | SEED-248, plan 485 | Intent CI comparison and merge or fast-forward landing journeys, plus the completed story Review boundary specs named in the plan |
| SEED-250#hide-client-project-from-dashboard at `22fa90aef` (2026-11-07) | SEED-250, plan 476 | Project hide and session journeys and project configuration boundary specs named in the plan |

The first case calibrates against two already known retrospective gaps. Give
the assessor only the original goal, promises, restrictions, and examples,
and access to the corresponding implementation, tests, and support code. Keep
retrospectives, correction records, later refs, and this coordinating plan out
of its brief. Start a fresh subagent with those inputs for each case. Confirm
the host can supply that isolation at the start of slice 1. If it cannot, stop
the initial assessment until an independent session can take the same bounded
brief. Record how the separation was achieved and any limits of the host's
isolation.

## Execution context

- Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
  `yilv-chan`, workspace
  `/Users/terryyin/git/open-dough/.worktrees/review-how-well-a-story-s-intent-is-protected`,
  branch `codex/review-how-well-a-story-s-intent-is-protected`.
- Authorized remote `origin`, integration target `refs/heads/main`. The
  separate default checkout is `/Users/terryyin/git/open-dough`. The
  dashboard established the worktree, with starting revision
  `45db12b34ffe4d88ed0e9ae381259e001a25454c`. The published claim and initial
  candidate `81e8948778517d3d81c6bdeb75800a5dd10b6aa2` were confirmed on both
  trunk and the story branch. No second claim was made. Claim CI was unobserved.
- Setup used `caffeinate -s -i node scripts/setup-native.mjs npm` on AC and
  `npm run --silent lint -- --staged` from the execution checkout. The
  selective formatter is `npm run format`; the installed pre-commit hook
  checks staged files and typechecks staged scripts. The workspace author is
  configured for agent commits. No replanning option was supplied.
- GitHub Actions `ci.yml` verified as workflow 351271804. The Codex observer
  watches the remote story branch as coordinator `intent-coverage-192`,
  mailbox `/tmp/dough-ci-501/watch-mpuEx5`, PID 71950, shell session 38944
  and yielded cell `g15:10`.
- Slice 1 assessor `/root/assessor_192` was launched with `fork_turns=none`.
  The launch linked only the extracted original story and plan examples and
  a detached shallow checkpoint with one reachable commit and no remote. Its
  working tree omitted planning, documentation, and finding records. The
  assessor verified that boundary before reading implementation. This bounds
  the prompt and supplied Git context. The host shares filesystem access,
  so the brief also excluded other checkouts and historical planning objects.

## Evidence and local gate

- **Existing routes.** Use the done records and Git to recover story context,
  the checkpoint's Playwright runner for execution evidence, and the existing
  retrospective or completion records for comparison after the first pass.
  The [product intent memorandum](../../../docs/product-intent-review-memorandum.md#discovering-what-intent-protection-means)
  provides the assessment direction.
- **Baseline and break checks.** Use a detached scratch checkout for each case.
  Prepare it with that revision's `node scripts/setup-native.mjs npm` and
  `browser` stages. Run its focused specs with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts <specs> --reporter=list`.
  Record the baseline and any failure to obtain evidence. Select an uncertain
  protected claim in each of at least two different cases. Change only the
  production behavior needed to reproduce the fault, rerun the named test
  against that change, and record the outcome. A build failure supplies no
  behavioral evidence. If the test passes, verify that the intended fault was
  reached before treating it as a gap. Revert the fault and remove the scratch
  checkout after collecting its evidence.
- **Failure policy.** Follow this project's
  [failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) policy as
  written. Distinguish failures caused by the deliberate fault from a baseline
  test failure. Investigate baseline failures and environment assumptions. Any
  evidence still unavailable at a historical revision is recorded as unknown.
- **Local gate.** Verify report paths, source citations, commands and recorded
  results, and confirm the committed reports survive removal of the spent plan.
  Run `git diff --check` and the staged lint gate before committing. A broader
  local suite is unnecessary for the Markdown deliverables. Start long test
  runs fully awake under `caffeinate -s -i` on AC power, following the
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)
  guidance for battery operation.

### Decisive premises

| Premise | Observation and result | Consuming slice |
| --- | --- | --- |
| Calibration case tests and break check have a working route | On 2026-11-05, the dashboard runner above at `7c71049b` passed 11 tests in 52.3 s across `intent-story-changes{,-gaps,-moves,-only}.spec.ts`, `intent-story-completed.spec.ts`, `story-card-selection.spec.ts` and `story-review-tree.spec.ts`. Dropping the changed-file overlay in `overlayFilesByPath` made `intent-story-changes.spec.ts:133` fail on its expected file assertion. The passing baseline and known fault are calibration evidence. The assessor records its own focused run and chooses its probes independently. | 1 |
| The two newer cases have focused proof at their checkpoints | Plan 485 at `d03cf60f1` records 20/20 for its initial merge-resolution and Review boundary selection, plus focused passing landing-gap and fast-forward runs. Plan 476 at `22fa90aef` records passing hide, session, navigation, and configuration-boundary selections. The paths and checkout setup scripts were verified at each checkpoint. Fresh trial runs determine which evidence supports verdicts. A failed setup or baseline is itself a reportable limitation. | 2–3 |
| A fresh assessor can receive a limited brief on the execution host | The execution host is selected when the trial starts. Slice 1 first checks that a fresh assessor can run with the historical inputs before any verdicts are written. | 1 |

## Slices

### 1. Assess the original calibration story

Type: Behavior
Status: done
Proof: `docs/intent-coverage-trial/SEED-192-review-story-intent-impact.md`
contains one sourced verdict per promise or restriction, fresh test evidence,
clarity notes, and any break-check result. The execution records how the
assessor was kept unaware of the later review.

Start with the scoped fresh-assessor check above. Have the assessor inspect the
promises, delivered behavior, test assertions, and support at `7c71049b`.
Label each protected verdict *break-checked* or *reasoned-only* and name the
uncovered case or missing evidence on other applicable verdicts. Pass the
project failure policy to the assessor by link. Include a break check on an
uncertain protected claim. Publish the report as its own reviewable result
before comparing it with the known gaps.

### 2. Assess story CI proof through merge resolutions

Type: Behavior
Status: planned
Proof: `docs/intent-coverage-trial/SEED-248-compare-story-proof-through-merge-resolutions.md`
contains the same evidence for `d03cf60f1`, including the relevant browser and
Review boundary assertions.

Apply the same assessment to the merge and landing comparison behavior,
including its fallback and refusal restrictions. Use the original tests,
support, and implementation at the checkpoint. Attempt the second case's
break check here. If no suitable claim is found, record the reason and do
the second check in slice 3.

### 3. Assess dashboard project visibility

Type: Behavior
Status: planned
Proof: `docs/intent-coverage-trial/SEED-250-hide-client-project-from-dashboard.md`
contains the same evidence for `22fa90aef`, including coverage of visibility,
persistence, and maintained inventory. At least two of the three case reports
now carry an observed break check.

Assess the visible behavior and the promises about persisted configuration and
maintenance using the relevant existing tests and implementation. Record any
part of a promise that the test setup or assertion does not exercise. Complete
the second case's break check here if slice 2 could not. If two cases cannot
support the required checks, record the limitation for Terry's evaluation.
Finish the initial report before exposing the assessor to the later review.

### 4. Compare the three reports and check findings on trunk

Type: Behavior
Status: planned
Proof: `docs/intent-coverage-trial/README.md` links the three reports and
records which known findings were recovered, which claims were unsupported,
and which gaps still apply on a named trunk revision.

Compare the calibration report with the two known findings in plan 448
(`168c04473^`), then use the other completion reviews as comparison where
available. Check at least five cited claims across the three reports, with
at least one from each. Recheck any candidate live gaps against trunk source
or relevant specs. Keep the historical verdict separate from its current
status. Record assessment effort and test runtime per case.

### 5. Record Terry's evaluation and the trial decision

Type: Behavior
Status: planned
Proof: The summary records Terry's decisions, useful new findings,
unsupported claims and review cost, and the memorandum links to the durable
reports and outcome.

Give Terry the committed report links and wait for his evaluation. Record
which findings merit retaining, clarifying or strengthening the tests, any
agreed backlog follow-ups, and whether the method merits public skill work.
Judge the result against ordinary review, including the calibration gaps,
additional useful findings, and the work needed to read and check claims,
following [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The trial can close with a positive, negative, or inconclusive decision.
Use that decision and the published reports when visiting the follow-up's
recorded dependency at closure. When the trial section is removed, update the
follow-up's prose link to point to the durable summary.
Wrap-up removes the spent planning records and retains the three reports and
summary. The separate follow-up owns decomposition and any public skill or
automatic invocation.

## Concern evidence

Each report has its own slice and proof, followed by cross-case comparison and
Terry's evaluation. Further slice-plan refinement was unnecessary. The
execution host's assessor setup is bounded by the first slice's entry check.
The review found no remaining slice-specific concern outside that check.

## Accepted evidence

### Slice 1

The [calibration report](../../../docs/intent-coverage-trial/SEED-192-review-story-intent-impact.md)
records the historical fixture, exact commands and results, verdicts and
the mutation's separate reachability observation. The baseline passed 11
tests in 33.6 s, followed by 16 passing supplemental checks. The original
card selection test passed with the completed-card button out of the Tab
order. The trace showed the fault in rendered markup, and Chromium skipped
it in sequential focus. The assessment took 7 min 19 s. The fault was
restored and the detached worktree retired after verifying clean Git diffs.
The initial report contains no comparison with the later review.

Refactor disposition is records-only. Consumer trace used `--base HEAD` and
the report path as the supplied term, then the report alone with `--path`.
The report has no inbound consumers until the summary links it. The selected
seed and Taken entry retain the same plan link. The live plan's obligations
consumer was run. Generic plan and source-review filename matches elsewhere
refer to their own records or generic behavior and are outside this effect.
