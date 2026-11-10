# Publish frontend test proof in CI

**Identity:** SEED-290#publish-frontend-test-proof

**Source:** [Refined story](../../seeds/SEED-290-publish-frontend-test-proof.md#publish-frontend-test-proof)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Developers can download a dedicated report of `dashboard/frontend-tests` from
the same GitHub Actions attempt that publishes the combined CI proof summary.
Show repository, checked revision, run ID and attempt, observed test-case
outcomes and recorded durations by file, totals, and missing or ambiguous
parts. Preserve reported zero versus missing evidence, measured zero versus
unreported timing, and failed versus other results. Explain other as skipped
or unfinished, without inventing finer outcomes the evidence cannot supply.

Use the current dashboard record → fragments → combined summary path. Report
generation runs no tests and changes no test verdict. Preserve the combined
summary's schema, artifact name, contents and existing consumers. No dashboard
UI, new collection, diagnostics, benchmark, timing threshold or reports for
other locations. Cancelled workflows keep their existing collection behavior;
recovering partial attempts from running shard records is outside this story.

## Direction and existing solutions

PFE examined collection, CI actions, Playwright reports, Intent readers and
the optimization leads command. The existing collector already owns attempt
and revision matching, units, counts, summed timings, per-file breakdowns and
parts gaps. Reuse its combined summary as the report's input; add no second
Playwright parser or gap classifier. `ci-proof-leads.mjs` ranks a bounded set
and asks CI to choose an attempt, so it cannot serve this exhaustive report of
the current attempt. The existing Playwright artifact mixes dashboard scopes
and shards; using it alone leaves the seed's extraction problem unchanged.

Add a small repository-local renderer under `scripts/` which reads the
validated combined summary and writes readable Markdown for the frontend
entry. Reuse `summaryProblems` and existing evidence meanings. This is an
additional presentation of the same evidence, not a new retained proof schema
or a change to published skill guidance. A dedicated renderer is justified
because neither current output produces this complete, scoped reading.

Extend the local `.github/actions/ci-proof-summary` action to optionally
generate and upload the frontend report, and enable that option in `ci.yml`.
Its other callers can still collect summaries without a frontend declaration.
Use an attempt-qualified artifact, `frontend-test-proof-attempt-<attempt>`,
containing `frontend-test-proof.md`; keep it alongside the existing summary
with its 30-day retention. Keep the renderer offline: it consumes the exact
summary just written, not a newly discovered or rerun attempt. Missing parts
produce an incomplete report even when every shard is missing. Invalid or
missing summary input is a reporting error, never an empty passing report.

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships):
missing or conflicting evidence differs from an explicit negative result.
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
keeps observed results distinct from maintained verification. This also follows
[One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
on shared attempt identity and interpretation, without changing Intent's UI or
collection lifecycle. The ADR index and relevant records agree on Accepted;
no exception, new ADR or North Star topic is needed.

## Outside-in proof ownership

All promises belong to slice 1. Add discriminating regressions before the new
report behavior; their first run must fail because the report is absent.

| Promise | Observable proof |
| --- | --- |
| Downloadable dedicated report beside the unchanged combined summary | Extend the CI action replay in `tests/support/ci-proof-actions.test.mjs`, or a cohesive sibling, to execute the actual report command from the action, then read the file named by its upload step. Check workflow opt-in, upload name/path, attempt qualification, retention and failure-safe collection with `ci-proof-declaration.test.mjs`. Confirm the actual artifact on the first published CI run. |
| Exact repository/revision/run/attempt; only frontend file rows and totals | Arrange frontend, browser and backend records with distinct counts/times; replay fragments and summary action, then assert the report independently. A later-attempt or wrong-revision fragment must not fill this attempt's gap. |
| Outcomes and summed recorded durations, including 0 ms versus untimed | Renderer CLI cases using shared MakeMe summary/evidence builders; include passed, failed, other, retries already summed by the collector, and an untimed file. Explain that duration is summed test execution, not job wall time. |
| Failure remains failure; incomplete or conflicting evidence cannot become pass | Replay a completed failed/unfinished selection record, a present empty shard, and an unusable running record. Assert failed/other file rows separately from missing/ambiguous parts, observed subtotal wording, and absence of an unsupported all-passed claim. Renderer cases include all parts missing and ambiguous parts. |
| Existing verdicts, combined summary and consumers remain valid; no test rerun | Retain combined-summary assertions in the action replay and its mixed-unit caller, run the collector/reader suites below, and inspect the workflow/action command path: only the existing dashboard suite executes tests. The report command reads the written summary. |

Arrange automated-test domain data through `makeMe.aThing.please()` under
[test data architecture](../../../tests/README.md#test-data-architecture).
Use existing summary, entry and evidence builders for renderer cases. The
older `locatedRecord` helper constructs records directly; add a shared MakeMe
dashboard proof-record builder for newly arranged action-replay cases rather
than copying record objects into tests. State phase, outcomes, paths and
timings that drive each case at its call site. Keep malformed exact input and
independent expected report text outside the builders.

The current action replay executes the first actual shell block, not an entire
GitHub runner. Keep report generation in that replayed block, or extend the
helper narrowly to execute the additional actual local command. A fixture
writing the expected report itself cannot prove generation. Upload wiring
checks and the live artifact observation cover the external transport.

## Slices

### 1. Download the frontend attempt's proof report

Type: Behavior
Status: done
Proof: every row of the outside-in table, with the action's real report file
as the primary local boundary and the first published run's artifact as the
hosted boundary.

Accepted local proof (2026-11-10): focused gate exit 0 for
`ci-proof-actions`, `ci-proof-action-units`, `ci-proof-declaration`,
`ci-proof-frontend-report`, `frontend-test-proof`, dashboard CI proof readers,
and collector summary/fragments/duration/breakdown suites; `npm run lint`
exit 0. Source-review commitments 1–11c and L1–L8 observed locally.

Accepted hosted proof (2026-11-10): CI run 42774494813 attempt 1 for
`85a494d276d277daeb205e9e7bfa0ea4a5a9c5c7` succeeded. Downloaded
`frontend-test-proof-attempt-1` (`frontend-test-proof.md`) beside
`ci-proof-summary-attempt-1`. Report names terryyin/open-dough,
revision 85a494d…, run 42774494813 attempt 1; frontend-only file rows and
totals (23 passed); present-zero parts retained; combined summary paths
unchanged.

Behavior: after the existing proof jobs settle for a run attempt, a developer
can download its frontend report alongside the combined summary. The report
names that attempt and revision, lists frontend files' observed outcomes and
recorded times, and distinguishes failures, other selections, present zero
and evidence gaps without executing additional tests. Partial evidence stays
partial; unavailable timings do not become zero.

Keep rendering, action wiring, shared test-data support, proof and local
cleanup in one Behavior slice. They establish one downloadable result; a
renderer-only increment would not yet satisfy the story. No preparatory
Structure slice or generic report framework is needed. Apply the installed
post-change refactoring workflow after edits and before tests. Update
`dashboard/tests/proof-record.md` to explain the artifact, its scope, duration
meaning and incomplete-evidence limits with the observed behavior.

## Consumer trace and verification gates

The summary action feeds Intent's artifact reader and the action replay's
mixed-unit caller. Preserve the existing combined artifact and summary
contract; the new report has its own name. The new optional input reaches
workflow opt-in and the replay's input environment. Trace those defaults and
the actual output file through the upload configuration, not just imports.
At execution run the installed consumer-trace script against the real diff;
add terms for the report filename, artifact name, input and exported helper
names, and assign every located consumer run/reused/excluded with a reason.

Focused local gate, adding the new renderer and replay test files:

```sh
bash scripts/test.sh \
  tests/support/ci-proof-actions.test.mjs \
  tests/support/ci-proof-action-units.test.mjs \
  tests/support/ci-proof-declaration.test.mjs \
  tests/support/dashboard-ci-proof-read.test.mjs \
  tests/support/dashboard-ci-proof-units-read.test.mjs \
  tests/support/dashboard-ci-proof-breakdown-read.test.mjs \
  src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs \
  src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs \
  src/skills/dough-test-optimization/scripts/ci-proof-duration.test.mjs \
  src/skills/dough-test-optimization/scripts/ci-proof-breakdown.test.mjs
```

These reader checks protect the preserved combined-summary boundary. Run
`npm run lint`; add other consumers' focused checks if the actual change
reaches them. No full browser suite is selected locally for an offline
Markdown report and Actions wiring. Follow [native setup](../../../tests/native-setup.md)
for Node 24.21.0 and newer Bash. Inspect host load and competing work before
expensive proof and choose economical concurrency while keeping coverage.

Local gate: start fully awake; on AC wrap long runs in `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Follow [AGENTS.md test automation](../../../AGENTS.md#test-automation).
Carry this project's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, by that link or verbatim, into every delegation brief and repair
handoff. It applies to local and published CI failures; attribution to an
earlier revision does not exclude repair. Preserve an exact active repair
owner's uncommitted files and report that owner and remaining gate.

Hosted acceptance belongs to slice 1 and execution's existing CI owner: after
publication observe the actual applicable attempt, list and download its
`frontend-test-proof-attempt-<attempt>` and combined artifacts, and inspect
identity, frontend scope and report contents. Do not call a local shell replay
proof of GitHub upload. A failed/incomplete-run report is proved through the
local action replay; do not introduce a deliberately failing shared CI run.
All failures on the published revision remain owned through applicable final
CI under the linked policy. Preparation starts no observer or test run.

## Decisive premises

Observed in this owned checkout on 2026-11-10 at
`914ea96e2653de11c86c1f7f329dfe76191afb78`, Node 24.21.0. Literal command:
`node /tmp/seed-290-proof-observation.mjs > /tmp/seed-290-proof-observation.out`.
The scratch probe imports the existing action replay and record helper,
executes the actual fragment and summary shell blocks with the workflow's
declarations, and reads the written summary. It changes no product file and
removes its temporary runner directories. The result below is sufficient to
reconstruct the observation; the scratch files are not execution inputs.

| Premise / consuming operation | Observed input and result | Remainder |
| --- | --- | --- |
| The real action path already carries frontend identity, outcomes and file durations | Completed part 1 has frontend pass 0 ms, fail 30 ms, unfinished untimed; browser 90 ms and backend 60 ms. Summary exits 0, schema 2, repository owner/repo, run 7 attempt 2, revision a×40. Frontend alone is 1 passed, 1 failed, 1 other, 30 ms, untimed 1; its three files retain those distinct figures. Other entries retain their own files/times. | New Markdown presentation and its discriminating regression remain slice-1 work. |
| Empty shard and unusable running evidence remain different at the consuming summary | Part 2's completed empty record creates present zero with a file breakdown; part 3's running record is refused by the fragment command (exit 1), even with a completed-looking attempt inside. Summary marks parts 3–12 missing and keeps parts 1–2's observations. | Report must display this incompleteness; it cannot recover part 3's discarded attempts from the summary. |
| Attempt/revision mismatch and conflicting parts cannot create passing evidence | `node /tmp/seed-290-proof-gaps-observation.mjs > /tmp/seed-290-proof-gaps-observation.out`, same checkout/date/Node: MakeMe fragments give part 1 revision b×40, part 2 attempt 1, and two matching part-3 records to the actual summary action for revision a×40/attempt 2. It exits 0 with exclusion notes; parts 1–2 are missing, part 3 ambiguous, and frontend counts all remain zero without a duration or file list. | Report those zero observed counts with gaps, not as an executed pass. |
| The report can reuse collection without changing test selection or rerunning | Same replay executes only the current fragment and summary Node commands and reads their file. Workflow read at this revision uses the dashboard record from the one existing suite invocation and collects after both matrices with `!cancelled()`. | New renderer is offline; hosted upload of its new artifact is acceptance work after authorized execution publication. |
| There is no current dedicated frontend artifact | Read-only inspection of the workflow and both local actions: only fragment artifacts, combined summary, times and per-shard Playwright reports are uploaded. | New upload declaration and hosted observation belong to slice 1. |

No claim is made that an existing test already proves the new report. Add new
discriminating proof at the actual command/file boundary. No cheap observation
of the existing data path is left open, and no paid or state-changing probe is
needed to select the approach.

## Current decisions and plan concern assessment

- Preparation records only; no Take, execution mode or implementation authority
  comes from this plan or its readiness assessment.
- The summary action is repository-local. Its report opt-in preserves callers
  declaring only other locations; do not require a frontend entry for those
  callers. Enabling the frontend report requires its declared entry.
- Expected existing edits are the 41-line summary action, 250-line workflow,
  179-line action helper, 140-line replay test, 116-line declaration test,
  226-line MakeMe entry point and 77-line proof-record guide. None is already
  over the 250-line check. Keep workflow orchestration small by putting report
  generation/upload in the composite action; consolidate its explanatory
  commentary there if needed. Keep new responsibilities in cohesive modules
  and recheck file sizes after edits rather than exceeding the maintained rule.
- Other Taken stories alter CI interpretation and timings. At execution inspect
  current source and active ownership before touching shared evidence helpers;
  reuse their published improvements. This report does not require their
  comparison or build-equivalence outcomes, so no blocking dependency is added.

Slice-plan refinement was not needed: one bounded Behavior owns one artifact
publication outcome and its proof loop, using the existing common evidence
model rather than successive special cases or speculative structure. No
remaining slice-specific design, proof-ownership or sizing concern was
identified. Actual hosted artifact delivery stays an explicit execution gate,
not a claim established by preparation.

## Execution complete

Product advice: no change. The downloadable frontend proof report meets the
story without a further product recommendation from this execution. Complementary
Intent presentation work under Taken SEED-281 stays separate.
