# Finish opted-in stories with an Intent Coverage report

**Identity:** SEED-258#finish-opted-in-stories-with-intent-coverage
**Source:** [Refined story](../../seeds/SEED-258-dough-intent-coverage.md#finish-opted-in-stories-with-intent-coverage)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

An opted-in feature story closes with its returned Intent Coverage report and
an evidenced disposition for every actionable finding visible in Done. Allow
independent wrap-up work during the check, but join before destructive cleanup,
Done publication or retirement can lose the evidence or its recovery context.
Worker failure or an applicable deadline without a report leaves closure
unfinished and resumable; a returned Insufficient evidence report counts.

Reuse the report and settled dispositions on resume. Merge a compatible gap into
the existing retrospective correction and proof, otherwise reuse queued work or
queue a separate correction. Preserve the retrospective follow-up's default
priority, with justified dependency/material-risk exceptions. Routine authorized
test strengthening is quiet; unresolved delivered defects, disputed proof and
human-owned judgment stop their dependent closure path.

Retain ordinary retrospective selection: product/proof review before wrap-up;
only an already-selected process review is deferred until report/disposition.
Remove Wrap Up's separate process flag while preserving Dough Land's flag.

Excluded: new opt-in policy, checker verdict/handoff changes, routine-benefit
measurement, dashboard/schema redesign, historical Done migration, a generic
worker service, installation, release and rollout. Coordinate with
[the opt-in rule](../../../src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage)
at the existing selection owner; preserve its enabled/off behavior on integration.
Shared code and a linked product outcome create no cannot-start dependency:
common direction and reconciliation suffice under ADR 0002.

## Existing solution and architectural decisions

PFE responsibility: do not close before a selected check's evidence and actions
have a durable home. Existing owners fit:

- `src/skills/dough-story-wrap-up/SKILL.md#assess-intent-coverage` owns the
  request, join and recoverable closure. Keep worker/revision/report location,
  dispositions and deferred-review state in existing execution/closure context.
- `src/skills/dough-intent-coverage/SKILL.md` owns the scratch check and its
  restoration. Reuse it; do not move fault injection into wrap-up.
- `src/skills/dough-story-wrap-up/references/follow-up-disposition.md` owns
  canonical homes, queue priority, repeat recognition and recoverable provenance.
  Extend this owner for compatible coverage amendments and justified priority
  exceptions, including its reconciliation rule; do not create a parallel queue.
- Completion's existing report string and `dashboard/src/IntentStoryCoverage.tsx`
  already preserve/render the whole text. Keep the worker report verbatim,
  append a clearly identified wrap-up disposition section with evidence, revision,
  decision and canonical follow-up links, then use `complete --intent-coverage`.
- Execute Plan's `references/finish-or-stop.md` owns retrospective handoff;
  Execution Retrospective's `Select reviews` owns selection. Carry the original
  process selection through postponement instead of representing it as a skip.
- Existing lifecycle commitments demonstrate retaining context until its owner
  returns evidence. Reuse that principle, not its restricted owner enumeration
  or the publication-CI observer implementation: those have other domain meanings.

Keep parallel checking with a closure join. A wholly serial check is simpler
but delays independent work; late Done enrichment misses the finished-report
promise. Manufacturing's quality hold supplies the useful analogy: identified
lot/revision, inspection/report, rework/disposition, then handover/closure. A
single targeted check is not comprehensive inspection or proof of all intent.

Relevant Accepted decisions:

- [ADR 0002 — Lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one coherent owner per responsibility, reuse and independent reconciliation.
- [ADR 0006 — Executing-agent guidance](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  runtime context belongs to the established project; callers link to owners.
- [ADR 0008 — Dashboard architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
  published Done evidence belongs in the repository, independent of scratch files.
- [ADR 0003 — Release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  edit `src/skills/`; leave installed managed copies and release metadata alone.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  conventional guidance uses the representative behavior review in
  [maintainer guidance](../../../AGENTS.md#behavior-review); structural assertions
  are not native host behavior evidence.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md):
  evidence preservation is evaluable; this does not establish routine probe value.

Index/in-file status agrees; no supersession, conflict or exception was found.
The existing `.planning/NORTH-STAR.md` adds no direction needed for this change.
No new ADR, North Star topic or worker infrastructure is warranted.

## Outside-in proof ownership

Use the candidate instructions as the behavior under review. For each row,
walk invocation, required context and useful outcome, recording selected actions,
stop/continuation and resulting report/follow-up. These are authoring reviews,
not claims of observed native execution. Do not add exact-wording tests to
stand in for that review. Existing structural tests still need coherent updates.

| Source promise / example | Owner and distinguishing observation |
| --- | --- |
| Opted-in planned or planless feature; delayed report | Slice 1: independent assimilation proceeds; cleanup/Done/retirement remain pending; returned report reaches completion input and Done after dispositions. |
| Returned Insufficient evidence versus no report | Slice 1: accept the former as evidence; worker failure/deadline cannot become Done through an unavailable reason. Keep ordinary scratch-restoration and cleanup gates. |
| Interrupted closure, report already returned for revision A | Slice 1: resume retained worker/report and settled actions without a second check or duplicate queued identity. An already-published historical result is preserved without migration. |
| Repair changes checked promise at revision B | Slice 1: retain A evidence; establish applicability/current evidence before claiming completed-revision coverage. Record-only closure commits do not alone invalidate the implementation probe. |
| Compatible retrospective gap | Slice 1: amend its canonical plan/proof within the existing outcome, record preparation reassessment through the established workflow, keep one queue entry and evidence link. |
| Separate gap and an existing matching queued correction | Slice 1: reuse it; otherwise create an understood correction with evidence, rationale and one canonical home. Repeat adds no duplicate. |
| Dependency/material-risk priority exception | Slice 1: explain precedence relative to retrospective work, retain it on reconciliation, and surface material judgment. Default remains after the retrospective follow-up. |
| Routine strengthening versus delivered defect/disputed proof | Slice 1: quietly queue authorized strengthening; settle actual delivered defects and human-owned decisions before dependent closure. A deliberate scratch fault is not itself a delivered defect. |
| Selected ordinary process review with automatic checking | Slice 2: product/proof review and product advice precede wrap-up; one process review consumes returned report, dispositions, history and costs before deleting needed context. Findings enter closure publication. |
| Skipped process, `--skip-retro`, coverage off, ineligible work, or direct wrap-up without a pending review | Slice 2: preserve original selection/omissions; no invented second review or new coverage wait. |
| Flag removal | Slice 2: no Wrap Up invocation/description/docs select its old flag; Dough Land's flag and review remain usable. |

Storage regression, slice 1:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  tests/support/product-backlog-complete-intent-coverage.test.mjs
```

Affected instruction-contract regressions, slice 2:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  src/skills/dough-land/scripts/process-retrospective-guidance.test.mjs \
  src/skills/dough-execute-plan/scripts/planned-wrap-up-continuation-guidance.test.mjs \
  src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs \
  src/skills/dough-execution-retrospective/scripts/completion-guidance.test.mjs
```

Run `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh`
if changed runtime links need dependency-closure validation. No installer behavior
changes are expected. Storage/rendering remain unchanged, so their existing
coverage is reused; no dashboard suite is needed solely for changed report prose.
If executable orchestration becomes necessary, replan its real lifecycle proof:
controlled events must observe owner failure, retained state and cleanup. A
mere awaited exception or text assertion cannot prove that added responsibility.

## Decisive premises and observations

Observed on 2026-11-10 at `f8dcc87a7d1c0029361d3b2075a2d00f02b85793`
in this owned preparation checkout. All scratch edits were restored before writes.

| Premise / consumer | Consuming form and observed result | Remainder |
| --- | --- | --- |
| Wrap-up loses late evidence | Read completed-feature/no-result flow in `src/skills/dough-story-wrap-up/SKILL.md`, from check request through `complete`: it explicitly continues closure without waiting or retrying. Audit's linked Done record in the source corroborates the reported outcome. | Guidance symptom established; no native execution of candidate guidance claimed. |
| Completion stores a returned report and preserves repeat results | Ran the literal slice-1 command: pass. Temporarily removed the `intentCoverage` spread in `product-backlog-done-record.mjs`; same command failed on saved-report assertions at test lines 62, 116 and 161. Restored exact bytes, reran: pass; file diff clean. | Real CLI/storage proof discriminates persistence, including inconclusive reports. No storage change needed. |
| Existing reading can show dispositions without new fields | Traced `complete --intent-coverage` through record parsing to `IntentStoryCoverage.tsx` lines 47–61: it renders the entire report string. Slice 1 changes the saved text, not its schema/rendering. | Disposition is part of the same string already observed by the CLI regression; native layout is unchanged. |
| Ordinary review currently blocks continuation until all selected reviews finish | Walked `finish-or-stop.md` review, execution-complete record and continuation into Wrap Up; no deferred-process exception exists. Read retrospective selection and shared process-review caller contract. | Slice 2 must explicitly carry selected/deferred/done state and amend affected structural assertions. |
| Existing follow-up rules conflict with new authorized disposition | Walked `follow-up-disposition.md`: it forbids replanning and keeps retrospective work first even after reconciliation. | Change both rules narrowly for this story's compatible amendments and justified priority exceptions. No human-owned story change is needed. |
| Focused local proof route is available | The slice-1 command reached real completion with Bash 5 selected via `/opt/homebrew/bin`; baseline and restored run exited 0. | Use this maintained runner profile, per `tests/native-setup.md`. |

## Ordered slices

### 1. Close with returned evidence and settled findings

Type: Behavior
Status: done
Proof: Slice-1 walkthrough rows, real completion regression, and representative
skill behavior review under [maintainer guidance](../../../AGENTS.md#behavior-review).

Behavior: Given an eligible opted-in completed feature story, when wrap-up runs
its targeted check, independent closure preparation may proceed, but Done is
published only after the report and actionable findings have their durable
disposition. A failed/missing report preserves active sources and recovery;
resume recognizes the checked revision and previously completed actions.

- Change the coverage section and existing follow-up disposition owner together.
  Join before deletion/Done/retirement, retain enough existing continuation
  context, and route gaps through canonical backlog/plan procedures. Do not
  manufacture report content or silently treat failure as inconclusive evidence.
- Save the unchanged worker report with a separated disposition addendum using
  existing completion storage. Keep defect handling and decision ownership
  explicit. Reuse report evidence only when applicable to the completed promise.
- Keep the runtime rule concise in existing files; the follow-up reference owns
  detailed routing and priority. No new payload file or installer edit is needed
  by this design. Preserve concurrent opt-in selection on integration.
- Trace consumers with the installed consumer-trace tool, including changed
  effects `without waiting or retrying`, `intentCoverage`, `follow-up first`,
  and report/disposition text. Give each located consumer a proof disposition.
- Apply post-change refactoring, mapped proof and ordinary execution delivery.

This is one report-to-disposition closure result. Splitting the join from gap
handling would leave the same report unusable for closure, so keep one proof loop.
No interim behavior or Structure slice is needed.

### 2. Review the selected execution process with the coverage outcome

Type: Behavior
Status: planned
Proof: Slice-2 walkthrough rows and affected instruction-contract checks above,
retaining the first slice's report/disposition observations.

Behavior: Given automatic checking and an already-selected ordinary process
review, execution settles product/proof review first and carries only process
review into wrap-up. After report and disposition, review that process once
using available history/costs, then preserve findings through closure publication.
Explicit skips remain skips; direct wrap-up invents no process review.

- Update execution completion/continuation and retrospective selection handoff
  coherently: postponement is neither `--skip-process` nor a fresh include-process
  override. Obtain automatic-check selection from Wrap Up's existing owner;
  create no parallel selector. A pending process review is an allowed closure duty, not a
  context error that blocks entering its owner. Preserve all CI completion gates.
- Run the deferred review before deleting its needed sources; retain partial
  review state on interruption and resume without repeating product/proof review
  or settled dispositions. Later findings enter the normal closure commit.
- Remove Wrap Up's flag, post-cleanup extra review and human documentation at
  `docs/installation-and-updates.md`; narrow `process-review-of-a-run.md` to its
  remaining Dough Land caller without changing Land's flag selection.
- Align the named existing structural tests with the new lifecycle; preserve
  their remaining guarantees. Trace consumers of `--process-retrospective`,
  selected review completion and execution-complete recording, including tests,
  examples and unchanged helper callers. Run additional affected checks if found.
- Refactor and deliver through ordinary execution; no release/trunk-only step.

## Gates and current decisions

- Execution in progress (Story Branch). Slice 1 accepted proof: storage suite
  `tests/support/product-backlog-complete-intent-coverage.test.mjs` and structural
  `planned-wrap-up-continuation-guidance.test.mjs` pass under
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh`; guidance behavior review
  under AGENTS.md for join/disposition. Source review retained and slice-1
  commitments observed. Refactor complete (whitespace residue only).
- Learning: keep join concise in wrap-up; route gap/priority detail through
  `follow-up-disposition.md` to stay under the 250-line check.
- Expected runtime edits currently fit the 250-line check: Wrap Up 250,
  retrospective 246, finish-or-stop 219, follow-up disposition 59 and shared
  process-review reference 25. Replace obsolete sections and keep cohesive
  responsibilities in existing references; inspect sizes after edits. Expected
  docs/tests are below 250. `install.sh` is 342 lines but is not an expected edit.
  If that scope changes, settle its cohesive reorganization before editing.
- Local gates: mapped behavior review, focused affected checks above, discovered
  consumer proof and ordinary commit hooks. No mandatory full suite for this
  conventional guidance change. For long runs start fully awake; on AC use
  `caffeinate -s -i`; on battery plug in or keep the lid open under `caffeinate -i`
  and inspect logs per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every plan delegation and local/CI repair handoff.
  Use shared `makeMe` for test domain data; no wall-clock sleeps, `test.slow()`
  or suite/hook timeout overrides. Existing focused-test fault observations are
  restored calibration evidence, not outstanding failing tests.
- Execution owns required post-change refactoring, delivery and applicable CI
  repair through its final verdict. Source-only authoring leaves managed copies,
  opt-in configuration, release metadata and publication mechanisms unchanged.

## Plan concern assessment

Slice-plan refinement was not needed: two cohesive Behavior outcomes own report
closure and selected-review timing, with one authoritative lifecycle and mapped
proof. This review identified no remaining slice-specific concern or cheaply
observable decisive premise left unobserved. The targeted probe's limited scope
and unestablished routine benefit are explicit boundaries, not readiness claims.
