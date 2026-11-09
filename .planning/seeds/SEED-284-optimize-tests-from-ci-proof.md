---
id: SEED-284
status: active
planted: 2026-11-09
scope: story
---

# Optimize tests from existing CI proof

<a id="optimize-tests-from-ci-proof"></a>

### Optimize tests from existing CI proof

**Identity:** SEED-284#optimize-tests-from-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/552-optimize-tests-from-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1b51401d511a87361080e21f1ecd8f418d3244de3ef019a5e831f588039f507d","plan":"951c6a74aa7e2f7e49e1c7651248bb184b29169248be6cb9ef4275a2097c15c7"}}
```

**Goal.** A developer can ask Dough to optimize tests in ordinary language and
promptly get either a worthwhile reduction in the wait for trustworthy local
test results, with behavioral coverage and confidence preserved, or an
evidenced explanation of why no worthwhile saving could be established. The
skill chooses how to proceed from evidence the project already retains and
brings the developer only consequential questions. Today every pass starts
with an admitted story and a full local profiling run.

**Scope.**

Start from retained evidence:

- Read retained CI test proof for the requested scope through the project's
  configured GitHub Actions workflow or CI adapter. Prefer a complete,
  successful attempt at the relevant revision, and name its repository,
  revision, attempt, and selection. When only an earlier compatible attempt is
  available, label its revision and use it as a lead within the parts that
  still apply. Use failed or incomplete proof to diagnose problems and report
  its gaps; missing, ambiguous, and untimed parts stay gaps.
- When the summary lacks the timing detail a lead needs, such as a file
  breakdown that an adapter answer omits or hook, scenario, or worker timing,
  use the project's retained full summary or runner output for that attempt.
  When the evidence still runs out, state the gap and stop the dependent
  investigation.
- A fresh profiling run, meaning a run of the requested scope to discover or
  rank costs, starts only on an explicit request, which can be given in
  ordinary language. When a gap blocks a decision that could pay off,
  recommend such a run with its expected cost and leave the choice to the
  developer. Timing a chosen lead's family before and after its experiment is
  not a profiling run.

Rank removable causes:

- Start with a short ranked list of leads, roughly 10–20 when useful, at the
  granularity the evidence supports, ranked by estimated removable cost.
  Before experimenting, state the smallest saving worth keeping for the scope
  and why, from its evidence or a target the developer supplied. The agent
  chooses the shortlist, evidence source, and investigation depth without
  asking the developer for percentages, batch sizes, or modes.
- Examine individually material files, families, and fixtures in detail.
  Group the many small costs by shared cause, such as per-case setup, process
  starts, waits, or a worker tail, so a cost that no single file shows can
  still lead. Follow related tests when they share the cost or protect
  behavior a change could affect. File totals and case counts guide
  discovery; runner reports and job evidence separate shared setup, parallel
  work, queue time, and the work that controls elapsed time.
- Pick the most promising avoidable cost and make the smallest meaningful
  experiment. Rank again after a kept change. Stop when the remaining credible
  opportunities fall below the stated saving, cannot justify the effort, or
  cannot plausibly reach the agreed target.

Commit administration when the evidence warrants it:

- Discovery reads retained evidence and related test code, and may time
  unmodified tests of a chosen lead. It finishes before a published
  assignment, and a supported stop at discovery reports its evidence without
  admitting any work.
- The first experiment edit is admitted and runs as one bounded planless
  execution under the ordinary request's authority, through the project's
  existing delivery. Use a full plan when the evidence calls for dependent
  experiments, a shared harness redesign, or a consequential change in where
  behavior is proved.
- Keep the CI proof publishing recipe available for requests to set up a
  proof producer.

Prove and report:

- Establish replacement proof before narrowing or removing coverage. Run the
  project's ordinary verification for the affected behavior and reuse
  comparable proof from CI produced by normal delivery.
- Report the scope of any measured gain, the protection retained, and any
  unresolved measurement. A CI case or file sum, a CI job or workflow wall
  time, and the developer's wait including suite admission are distinct
  measures. A claim about local elapsed time requires comparable local
  evidence. Compare like selections and runner conditions, including
  replacement proof and shared setup where measured. Follow the project's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests).

Keep live candidates in the record and accepted costs beside the test:

- The Test Optimization Candidates record holds only live candidates:
  material costs that still need deeper developer analysis **and** protect
  valuable behavior that the agent cannot safely simplify, downgrade, or
  remove. Each live entry names the affected test or fixture, observed cost
  and conditions, unique protection, alternatives tried, and the remaining
  decision or evidence needed. Resolve clear opportunities during normal
  optimization. A candidate that is fixed, accepted, or moved to a named story
  leaves the live record with its evidence recoverable from history, so the
  live decision has one home.
- Put accepted necessary cost beside the owning test, scenario, or shared
  fixture, at the narrowest scope that owns it, as a project-native tag,
  annotation, or short source comment explaining why that cost is warranted.
  The indicator guides lead selection while the cost still counts in timing
  and the test keeps its normal selection, execution, and verdict. Revisit the
  accepted cost when it grows materially, its justification changes, or new
  evidence identifies cheaper equivalent proof. An accepted cost in one case
  leaves other cases and avoidable setup open to improvement.
- Existing execution tags keep their own meaning. Read existing profile-only
  markers by their actual semantics; neither becomes an accepted-cost decision
  by inference.

Roll out:

- The skill and Intent read both the current published four-section record,
  with or without a leading pass summary and with the note naming the
  profile-only mechanism that the published format asks for, and the live
  record. A project's record converts when a pass first writes it:
  substantiated accepted costs move to source with their rationale, and fixed
  or transferred entries leave the live list.
- Open Dough adopts the change in this story. Its record converts, its
  substantiated accepted costs move beside their tests, and Intent shows its
  live candidates while still reading Pygardon's and Doughnut's four-section
  records.
- Reuse the candidate reader and the existing CI proof contract, including its
  attempt identity, timing units, and gap reporting, and the explicit test
  case and test file units that
  SEED-281 (released in 0.3.93; see `src/skills/dough-test-optimization/references/ci-proof-summary.md`)
  adds wherever a summary carries them.
- Pilot the new default on one ordinary Pygardon pytest pass, in a subordinate
  Pygardon workspace of this execution that reads the guidance from this
  repository's source. Fix the evaluation basis before the observed run: time
  to a credible keep-or-stop decision, full-run cost, and any verified change
  in the developer's ordinary wait with the required protection, compared
  with Pygardon's recorded passes. A kept change publishes under Pygardon's
  own rules. A timely, evidenced stop is a useful result when the available
  opportunities do not pay for the work.

Restrictions:

- No fresh profiling run of the requested scope without an explicit request.
  Six recorded Open Dough passes spent about 146 minutes on baseline and
  final suite runs, and one more waited about 38 minutes for suite admission.
- An accepted-cost indicator changes no selection, execution, timeout, or
  verdict, because normal verification and CI must keep proving the behavior
  it protects.
- A timing claim stays within its evidence; an unsupported comparison stays
  open rather than borrowing a different measure.

Not in this story: changing CI producers to retain more timing detail, since
existing retained artifacts are sufficient to start; converting other
projects' records beyond what the Pygardon pilot pass writes; showing
accepted-cost indicators in Intent; and reading the landed CI timing history
that [SEED-285](SEED-285-landed-ci-timing-history.md) collects.

**Architecture.** Agents take on a responsibility that only Intent has today:
reading retained CI proof. They read it through Intent's installed-runtime
acquisition and collector-contract validation, with a deterministic reader that
prints a bounded ranked table, because Open Dough's summary alone is 174 KB.
The [North Star](../NORTH-STAR.md#test-optimization-reads-the-ci-evidence-intent-reads)
holds this direction. The candidate record keeps one format owner and one
Intent reader for both versions. An accepted-cost indicator belongs to the
maintained verification procedure, distinct from the observed CI result and the
published workflow record
([ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)).
The admission timing rule changes only in its single home
([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)),
and new scripts stay Proposed until declared in the payload
([ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)). No
Accepted ADR conflicts with this story.

**Key examples.**

- **Pygardon pytest pass.** Pygardon's adapter answers `proof` with totals
  only, to stay within 64 KiB, while its CI service retains the full 172 KB
  summary with 1,213 timed pytest files. The newest successful main attempt,
  `993fe414` at `3cb29aaf9`, predates 52 changed files. The attempt that
  matches current code ran beside another and took 505 s of pytest against
  320 s. The agent labels that identity and comparability, reads the full
  summary, and ranks leads; the top file,
  `data_source/test_jobs_live_commands_sharadar`, takes 60.5 s for 2 cases. It
  follows one promising cost into a bounded change, or reports a supported
  stop, with zero fresh profiling runs and no request to pick a percentile or
  mode.
- **Flat costs.** Open Dough's run 42550972063 times 1,343 files for 11,142 s,
  and the top 20 hold 9.8% of it. One dashboard shard's retained Playwright
  report spends 26% of its test time in per-test hooks. The leads include that
  shared setup, read from the runner report, not only the top files. Once the
  report's 7-day retention has passed, the gap is stated and the file leads
  rest on the summary alone.
- **Evidence gaps.** A proof artifact is missing, untimed, partial, or belongs
  to a different attempt or selection. The agent exposes the gap, uses
  compatible retained evidence at its actual scope, and leaves an unsupported
  timing claim open. An explicit request for fresh profiling runs the
  appropriate project command.
- **Accepted cost beside the test.** Pygardon's minimal real H.264 round trip
  carries its accepted codec cost in source; the record's path for it went
  stale when the file moved on 2026-11-08. The worker-stall test explains its
  real 10 s exit timeout while the other 11 cases of its 30.4 s file remain
  eligible. A Doughnut scenario tag applies to its scenario even when CI
  reports an aggregate for the whole feature; the retained job log times each
  scenario. Pygardon's `slow`, `host_docker`, and profile-only markers and
  Doughnut's profile-only tag keep their own meanings.
- **Open Dough migration.** The rate-limit test stays a live candidate while
  its valuable directed-time proof still needs a developer decision about a
  controllable clock in the released request owner. Its three accepted costs
  move beside their tests and leave the live list, as does the fixed setup
  entry. Intent reads Open Dough's live record and Pygardon's and Doughnut's
  four-section records with their leading pass summaries. Today Intent shows
  Open Dough's record as mismatched, because one entry has an extra field, and
  Doughnut's too, because of its profile-only mechanism note.
- **No administration for a stop.** Discovery finds no lead above the stated
  saving and reports why, with no story, Taken entry, or wrap-up. A lead worth
  trying is admitted at its first edit and delivered as one bounded
  experiment; a dependent sequence gets a plan.

**Evidence and evaluation.** The old project skills offered literal runner
commands and ranked the slowest 10%, so agents had a clear first action.
Rank-based batches also caused repeat visits to the same files. The shared
skill kept useful family and coverage analysis, dropped the explicit shortlist,
and later added admission before profiling. Recover a bounded starting point
and defer the administrative commitment until the evidence warrants it.
[Old Doughnut guidance](https://github.com/nerds-odd-e/doughnut/blob/47df168656/.agents/skills/test-optimization/SKILL.md#L107),
[extraction record](https://github.com/terryyin/open-dough/blob/dcd3d5fb3b939fba76e80a90e840bf6e512ec186/src/skills/dough-test-optimization/RECOGNITION.md),
[admission change](https://github.com/terryyin/open-dough/commit/bd387824c).

- **Pygardon.** The older pytest pass went from 63.37s to 53.70s. A frontend
  pass after extraction went from 21.2s to 15.5s across interleaved runs. More
  recently, the Git fixture pass reduced focused wall time from 45.86s to
  29.78s. The later reranked pass found a focused gain from 20.03s to 12.66s,
  while heavy and changing load made the ordinary suite comparison
  inconclusive. A bounded fixture pass also had a 25,094-token startup read
  truncate. Every recent successful attempt retains 1,213 timed pytest file
  rows in its full summary, served by Pygardon's CI service; the adapter's
  `proof` answer drops file breakdowns to stay within 64 KiB, and no JUnit or
  per-test timing is retained.
  [Older pytest pass](https://github.com/terryyin/pygardon/commit/c6b27a19e),
  [post-extraction frontend pass](https://github.com/terryyin/pygardon/commit/101d3aafa),
  [Git fixture pass](https://github.com/terryyin/pygardon/blob/22e3c9e1e/.planning/slice-plans/453-python-unit-test-feedback/PLAN.md#ordinary-selection-re-profile),
  [reranked pass](https://github.com/terryyin/pygardon/blob/1cff6dd65/.planning/TEST-OPTIMIZATION-CANDIDATES.md#latest-pass),
  [startup finding](../../docs/maintainer/findings/ODF-264.md#odf-264),
  [hosted proof](https://github.com/terryyin/pygardon/commit/b455885c2).
- **Doughnut.** An earlier E2E pass went from 23m46s to 18m34s after cutting
  repeated setup and overlapping scenarios. A recent merge saved about 0.2s
  focused with no demonstrated full frontend gain. Two record-only refactors
  in that pass reported 106,673 tokens for two wording edits. The v0.3.84
  records-only disposition already addresses that example. Existing CI proof
  ranks EPUB at 53.79s across 21 cases, and its job logs, kept 90 days, time
  each scenario. The existing profile-only slowness tag is distinct from
  ordinary selection tags and has no execution effect.
  [Earlier E2E pass](https://github.com/nerds-odd-e/doughnut/commit/10b3217797),
  [recent measurements](https://github.com/nerds-odd-e/doughnut/blob/9d95965cfb/.planning/TEST-OPTIMIZATION-CANDIDATES.md#latest-pass),
  [refactor finding and released response](../../docs/maintainer/findings/ODF-141.md#odf-141),
  [CI proof](https://github.com/nerds-odd-e/doughnut/actions/runs/42498952903),
  [tag guidance](https://github.com/nerds-odd-e/doughnut/blob/c3c463656a/.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling).
- **Open Dough.** One ordinary dashboard pass went from 630s to 589s after
  replacing repeated browser variants with cheaper boundary proof. Six later
  passes spent about 146 minutes on recorded baseline and final suite runs.
  Another candidate command spent about 38 minutes waiting for suite admission.
  In a retained CI run, a watcher file had 65s of case time and 195s including
  shared hooks. A different shard held up CI. The CI proof summary is kept 30
  days and the per-shard Playwright reports 7 days.
  [Ordinary gain](https://github.com/terryyin/open-dough/commit/f5d22bce4),
  [local pass records](../../docs/maintainer/dashboard-local-test-timings.md),
  [final pass](../../docs/maintainer/dashboard-test-timings.md#local-npm-run-testdashboard-pass-seed-197-2026-10-31),
  [admission finding](../../docs/maintainer/findings/ODF-405.md#odf-405),
  [CI attempt](https://github.com/terryyin/open-dough/actions/runs/42548844204).

Judge the pilot under [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md),
with its basis fixed before the observed run.

<a id="read-distinct-attempts-and-hidden-waits"></a>

### Read distinct attempts, an adapter's selection, and waits a mean hides

**Identity:** SEED-284#read-distinct-attempts-and-hidden-waits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/558-read-distinct-attempts-and-hidden-waits/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a27428e4521cba6b3a9b2928c0afe6b48f64b3cd02ce2fd167d9f9dd896103c9","plan":"439502f44c9a4d574b73d65efaa34d3c55bfbf878df04b5e13ccedf66d2d2837"}}
```

**Goal.** A developer whose project asks this skill to optimize tests gets a
saving worth keeping that rests on distinct CI attempts, the test selection
named even when the project reads CI through an adapter, and leads that a
per-case mean does not hide. The correction is bounded to the retrospective
findings for SEED-284#optimize-tests-from-ci-proof, which the Pygardon pilot
exposed.

**Scope.** In `src/skills/dough-test-optimization/references/evidence-and-leads.md`:
the variation behind the saving worth keeping comes from reader tables that
name different attempts, reached through the revision before the previous
table's attempt; the selection behind a CI adapter is traced from the adapter
command the table's Source line names to the CI job and test command it
reports; and a lead's mean per case is not taken as each case's cost before
its cases' own waits or timings are read. The reader, the record formats and
Intent stay unchanged. Plan:
[558](../slice-plans/558-read-distinct-attempts-and-hidden-waits/PLAN.md).
