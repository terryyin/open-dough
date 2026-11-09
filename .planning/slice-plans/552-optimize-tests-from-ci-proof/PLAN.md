# Optimize tests from existing CI proof

**Identity:** SEED-284#optimize-tests-from-ci-proof

**Source:** [Refined story](../../seeds/SEED-284-optimize-tests-from-ci-proof.md#optimize-tests-from-ci-proof)

## Goal and scope

An ordinary "optimize tests" request starts from CI evidence the project
already retains. The agent ranks removable causes, states the smallest saving
worth keeping, and reaches a keep or a supported stop without a fresh
profiling run. It admits work only at the first experiment edit and reports
gains within the scope of their evidence. The candidate record keeps only
live candidates; accepted necessary cost moves beside its test. Intent reads
both record versions. Open Dough adopts the change, and one ordinary Pygardon
pytest pass pilots it.

Material exclusions (from the story): no CI producer changes; other projects'
record conversion except what the pilot pass itself writes; no accepted-cost
display in Intent; no landed timing history
([SEED-285](../../seeds/SEED-285-landed-ci-timing-history.md)); no release.
The installed copies under `.agents/skills/` and `.claude/skills/` change
only from a released payload, so the pilot reads guidance from this
repository's `src/skills/`, as plan 459 did.

Assumptions: Pygardon's publication follows Pygardon's own guidance, and the
coordinator resolves Pygardon's authorized publication before delivering
there, as plans 446 and 459 did. SEED-281 (explicit test case and test file
units) and SEED-261#map-intent-and-ci-proof-test-data (candidate record
builder) are Taken; build on whatever they have landed when this story
executes, and never duplicate them.

## Existing solution and architectural direction

PFE, by responsibility:

- **CI configuration and acquisition.** Reuse
  `src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs`
  (`ciAdapter`/`ciWorkflow`), `ci-github-actions.mjs` (`createGitHubActions`
  run listing; `readGitHubActions` and `askGitHubArchive` through the shared
  request owner), and `ci-command-adapter.mjs` (`readCommandProof`).
- **Validation.** Reuse the collector contract
  (`src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs`:
  `summaryProblems`, `summaryArtifactName`, `SUMMARY_READ_LIMIT_BYTES`) and
  any unit model SEED-281 adds there.
- **Modularize.** Artifact selection by name and run, archive-entry
  extraction (`dashboard/server/zipEntry.ts`) and identity matching
  (`mismatchOf` in `dashboard/server/ciProofArtifact.ts` and
  `ciAdapterProof.ts`) are dashboard-private today. Move them into one payload
  module beside the contract. The dashboard keeps its remembered answers,
  timeouts and view mapping (`CiProof`). Slice 2.
- **New.** Ranking leads (pure function) and its bounded CLI. No existing
  solution ranks; Intent's scope figures serve a different view. Slice 3.
- **Candidate record.** Extend the one Intent parser
  (`dashboard/src/testOptimizationCandidates.ts`) to a second version. The
  format owner stays `references/candidate-record.md`. Slice 5.

Follow the
[North Star topic](../../NORTH-STAR.md#test-optimization-reads-the-ci-evidence-intent-reads)
this story added. Retire it at wrap-up once code explains it.
[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
and [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
separate maintained verification procedures (accepted-cost indicators in
source) from observed results (CI proof) and workflow records (the candidate
record). Missing or conflicting evidence stays a gap.
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one home per rule: the admission timing change lives in
`dough-execute-plan/references/admit-accepted-work.md`, and the optimization
skill links to it. Guidance addresses the executing project.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
new runtime scripts join `install.sh` `managed_files`. Do not hand-edit
installed copies. [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
governs the pilot's evaluation, not runtime guidance. No Accepted ADR
conflicts.

## Outside-in proof ownership

| Story promise | Owner | Observable proof |
| --- | --- | --- |
| Intent's CI proof reads behave exactly as before through the shared read path | 2 | Intent reasons and proof journeys for both transports stay green. New payload unit tests at the moved boundary fail when identity, expiry, size, ambiguity or archive checks are broken. |
| Retained evidence is read with identity, a compatibility label, and gaps; an adapter answer without a breakdown or a refused route becomes a stated gap with a remedy | 3 | Reader tests on MakeMe summaries and literal wire fixtures: requested and earlier attempts, missing, ambiguous and untimed parts, no breakdown, refused GitHub, `--summary` input, and identity mismatch refusal. One real read of Open Dough's retained proof is recorded. |
| Leads are ranked by removable cost with a grouped tail, per-case means, explicit units, and bounded output | 3 | Ranking tests: ordering, cap, folder aggregation, tail summary, mixed units kept apart, byte bound. Real Open Dough read: the top rows and the tail match the summary. |
| Evidence first; fresh profiling only on explicit request, with a recommendation when a gap blocks a decision | 4, 7 | Behavior review walking Open Dough's retained proof to a ranked list, a stated saving, and a chosen lead or supported stop, with no edits and no profiling run. The pilot records zero fresh profiling runs. |
| Discovery admits nothing; the first experiment edit is admitted as one bounded planless execution; dependent work gets a plan | 4, 7 | `admit-accepted-work.md` and the skill state one rule. Behavior review of both paths. Pilot: no admission before its first edit, or none at all for a stop. |
| Replacement proof precedes narrowing; measures stay distinct; local claims need comparable local evidence | 4, 7 | Behavior review against the measurement text. The pilot report separates the CI sum, CI wall, focused local before and after, and any full local claim. |
| Intent reads the four-section record, with a leading pass summary and the profile-only mechanism note, and the live record | 5 | Intent candidate journeys and parser tests for a live record, a four-section record with a mechanism note and a leading pass summary, and a mismatched record. The real Pygardon and Doughnut records parse. |
| Live entries carry the five live facts; `--resolve` and writing follow the live format | 5 | Format reference and `--resolve` reference reviewed against key example 5. A builder-made live record renders all five facts in Intent. |
| Accepted cost lives beside its test at the narrowest scope and changes no selection, execution, timeout or verdict; tags and markers keep their meaning | 6 | Guidance review against key example 4. Open Dough's source indicators are comments only: the diff shows no selection, timeout or assertion change, and the affected specs still run. |
| Open Dough's record converts and Intent shows its live candidates | 6 | The converted file parses as live with the expected slugs. An Intent journey or local dashboard reading at the published revision shows them. |
| The pilot is judged against a basis fixed before it runs | 1, 7 | Slice 1 confirms the route and the basis below. Slice 7 records the measures and the keep or stop, plus Pygardon CI for a kept change. |

## Slices

### 1. Confirm the Pygardon pilot route

Type: Behavior
Status: planned
Owner: executor; early probe, no product implementation.
Proof: the route observations recorded in Learnings.

Behavior: at fetched Pygardon main → the executor prepares a subordinate
Pygardon workspace as plan 459 did, reads the adapter's `discover` and
`proof` answers and the full retained summary for the newest successful
attempt and for the attempt matching current code, and runs one unmodified
focused pytest selection with Pygardon's ordinary local command → the plan
records the attempt identities, summary sizes, breakdown presence, the
command, and its result. Make no edits and rank nothing; the pilot's clock
has not started.

A failure here stops slice 7 only. Decide a different pilot route or project
with Terry, and record it before slice 7.

### 2. Share one CI proof read between Intent and agents

Type: Structure
Status: planned
Proof: ownership row 1. Before the move, run
`npm run test:dashboard -- tests/intent/intent-ci-proof-reasons.spec.ts tests/intent/intent-ci-proof-adapter-reasons.spec.ts tests/intent/intent-ci-proof.spec.ts tests/intent/intent-ci-proof-adapter.spec.ts tests/intent/intent-summary-ci-proof.spec.ts --workers=2`,
then again after it, plus `bash scripts/test.sh` on the four
`tests/support/dashboard-ci-*` tests and the new payload unit tests. Also
run `npm run typecheck:dashboard` and `npm run lint`. Use the installed
consumer trace for moved symbols.

Internal change: artifact selection, archive extraction within the read limit,
the adapter `proof` request, contract validation and identity matching move
into one payload module beside the collector contract. `ciProofArtifact.ts`
and `ciAdapterProof.ts` call it and keep their remembered answers, wording and
`CiProof` mapping. External behavior is unchanged. Enables slice 3.

### 3. Rank optimization leads from retained CI proof

Type: Behavior
Status: planned
Proof: ownership rows 2 and 3. The new reader tests and CLI tests, then
`tests/install-public-payload.sh`, `tests/update-adds-new-payload-skill.sh`
and `bash scripts/check-self-installation.sh` for the payload declaration.
Record one real run against this repository's latest main attempt in
Learnings.

Behavior: a project with configured CI and a retained summary → the agent
runs the installed reader with a scope (Intent locations or paths) and a
revision (default `HEAD`), or with `--summary <file>` → it prints a bounded
table:

- the attempt's repository, run and attempt or `attemptId`, revision and
  selection;
- compatibility, meaning the attempt revision against the requested one and
  the in-scope paths changed between them when Git has both;
- gaps, with a remedy for an absent breakdown or refused route;
- per-unit scope totals;
- up to about 20 leads ranked by summed time, each with cases, mean per case
  and share;
- folder aggregates and the remaining tail (count, summed time, mean per
  case).

An identity mismatch refuses the summary. Declare the new script in
`managed_files`.

### 4. Start optimization from retained evidence

Type: Behavior
Status: planned
Proof: ownership rows 4–6. Record an AGENTS.md behavior review in Learnings.
It walks this repository's retained proof through the reader to a ranked
list, a stated saving, and a chosen lead or supported stop, with no edits.
It also walks the experiment path's admission and plan escalation on paper.
Run `node --test src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs`,
whose test requires the skill to keep routing delivery to the increment and
repair owner. Check that the links resolve.

Behavior: an ordinary optimization request in a project with retained CI
proof → the skill directs the agent to:

- read evidence through the reader, and runner output by bounded extraction;
- state the saving worth keeping, examine material causes, and group the
  tail;
- finish discovery unadmitted;
- admit at the first experiment edit and run one bounded planless execution,
  or plan dependent work;
- measure like for like, and report each measure's scope;
- run fresh profiling only on explicit request, recommending a run only when
  a gap blocks a decision that could pay off.

Update the description frontmatter, `SKILL.md`, a focused evidence-and-leads
reference, and the mission rule in `admit-accepted-work.md`. Interim: until
slice 5, passes still write the four-section record.

### 5. Read live candidate records beside four-section records

Type: Behavior
Status: planned
Proof: ownership rows 7 and 8. Run
`npm run test:dashboard -- tests/intent/intent-test-optimization-candidates*.spec.ts backend-tests/intent/authenticated-read-intent-candidates.spec.ts frontend-tests/intent-candidates-read-recovery.spec.ts --workers=2`,
the parser unit tests, and `npm run typecheck:dashboard`. Also parse the real
Pygardon and Doughnut records read-only.

Behavior: a project publishes a live record, or a four-section record with a
leading pass summary and a profile-only mechanism note → Intent's
Optimization Candidates shows its entries. The live record shows its five
facts. The four-section record shows its sections as today. A record of
neither shape stays mismatched. Change `candidate-record.md` to the live
format with the read-both rule, and `resolving-candidates.md` to the live
outcomes. Extend the MakeMe record builder for live records.

### 6. Keep accepted costs beside their tests; Open Dough adopts

Type: Behavior
Status: planned
Proof: ownership rows 9 and 10. Before the conversion, read this repository's
current retained proof for each entry's files. Check that the source edits
are comments only. Then run the affected dashboard specs once with
`--workers=2`, `npm run lint`, the parser on the converted file, and an Intent
reading of the live record.

Behavior: Open Dough's four-section record → this repository adopts the
change:

- the rate-limit, pinned-build and hosted-margin entries become live entries
  when they still need a developer decision or named evidence;
- each substantiated accepted cost gets a short comment beside its owning
  test or shared step, covering the integrated journeys, the agent-launch
  poles and the completed-review tail, then leaves the record;
- the fixed setup entry leaves the record;
- Intent shows the live record.

Add the guidance: the indicator rule, the revisit triggers, the meaning of
existing tags and markers, and conversion on first write.

### 7. Pilot one ordinary Pygardon pytest pass

Type: Behavior
Status: planned
Proof: ownership row 11 and the evaluation basis below, recorded in
Learnings. A kept change also has replacement proof, its focused before and
after, and Pygardon CI on the published revision.

Behavior: an ordinary request to optimize Pygardon's pytest suite, in the
subordinate workspace with guidance read from this repository's `src/skills/`
→ the pass reaches a credible keep or stop from retained evidence. It runs no
fresh profiling run and asks no percentile or mode question. A kept change
publishes under Pygardon's rules. Pygardon's record converts only if the pass
writes it.

## Evaluation basis for the pilot

Fixed before the observed run
([ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)).
This is one exploratory observation; bound conclusions to it.

- **Beneficiary and gain.** A Pygardon developer asking for an ordinary
  pytest optimization gets a credible keep or stop sooner and at lower
  full-run cost than recorded passes, with protection retained.
- **Comparison.** Plan 453, the Git fixture pass, ran ordinary-selection full
  runs of 522.57 s and 485.22 s with `-n 4`. Its plan was committed at 21:48,
  its first kept change landed at 21:57, and its result was recorded at 22:10
  on 2026-10-29. Plan 470, the reranked pass, ran about 963 s and about 485 s
  under heavy load, and its measurement was marked incomplete. Its plan was
  committed at 08:51, its first kept change landed at 09:10, and it was
  re-profiled at 09:48 on 2026-10-31. Neither pass recorded when it was
  requested, and each profiled before planning. Time comparison is therefore
  limited to those visible spans plus their full-run cost.
- **Record.** The request time, the decision time, the evidence reads, and
  every local run with its command, wall time and load. For a keep, also
  record the focused before and after under paired load, and a full local
  claim only with a comparable before and after.
- **Worth keeping.** A credible keep or stop with zero fresh profiling runs
  and the request-to-decision time recorded. A timely, evidenced stop counts.

## Proof and delivery gates

Arrange automated domain data through
[MakeMe](../../../tests/README.md#test-data-architecture), with case-driving
facts visible at call sites. Keep literal wire inputs and independent
expectations outside builders when their exact form is under test. Use
controlled events and clocks. Use no wall-clock waits, no `test.slow()`, and
no suite or hook timeout overrides. Follow
[native setup](../../../tests/native-setup.md). Direct Playwright runs unset
`NO_COLOR`, `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES`.

Run each slice's focused proof at its boundary. Before delivering slice 2,
run `npm run test:dashboard -- tests/intent --workers=2`. The Intent suite is
the maintained consumer boundary of the shared proof read. Run no unrelated
full suite locally solely because CI runs it.

Local gate: start fully awake. On AC, guard long runs with
`caffeinate -s -i`; `-s` is honored only on AC. On battery, plug in, or start
fully awake with the lid open under `caffeinate -i` and inspect the sleep log
afterwards, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. It applies to local and
published CI failures, including pre-existing failures, and attribution is no
exemption. In Pygardon, Pygardon's guidance also applies. Post-change
refactoring and execution's normal delivery and CI gates apply. Before an
expensive run, inspect host load, memory and competing owned work. Reduce
concurrency or sequence work without dropping proof.

## Decisive premises

Observed in this preparation workspace at `dcd7f0e3b` on 2026-11-09, unless a
row says otherwise.

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| Slice 3 can acquire this repository's summary through the shared request owner | A scratch module imported `readGitHubActions` and `askGitHubArchive` from `src/skills/dough-execute-plan/scripts/ci-github-actions.mjs`. Listing `repos/terryyin/open-dough/actions/runs/42550972063/artifacts?name=ci-proof-summary-attempt-1` returned artifact 13645811172 (17,473 bytes, not expired) in 551 ms. The archive returned 17,473 zip bytes at 2.1 s. | None for this repository. |
| A refused GitHub route must become a gap, with `--summary` as the remedy | The same listing for `nerds-odd-e/doughnut` run 42498952903 failed `GitHubAcquisitionFailed … HTTP 403`. The `gh` on `PATH` is the dashboard's wrapper. A delegated probe downloaded the same artifact with `gh run download`. | Doughnut is outside the pilot. The refusal is this machine's token policy and is not this story's to repair. |
| Pygardon's adapter answer lacks the breakdown, and the full summary is retrievable | Delegated probe, 2026-11-09: the adapter `proof` for attempt `993fe414-14da-41fc-b490-ac32bedf7d27` returned 32,081 bytes with `tests` totals only, because `scripts/pygardon-ci-attempt-evidence.mjs` drops breakdowns over 64 KiB. `curl` of the CI service's `/api/ci/attempts/<id>/diagnostics/ci-proof-summary.json` returned 171,882 bytes with 1,213 timed files. | Slice 1 rechecks at the pilot's revision. |
| Retained summaries carry per-file `durationMs` at the needed scale | Open Dough run 42550972063: 1,343 timed files and 11,142 s summed; the top 20 hold 9.8%; the summary is 173,945 bytes. Doughnut run 42498952903: 1,076 timed files. Pygardon `993fe414`: 1,213. One shard's Playwright report (`dashboard-playwright-report-5`, kept 7 days) put 26.4% of 926 s in before and after hooks. | None. |
| Intent's parser and today's records | Node 24 imported `dashboard/src/testOptimizationCandidates.ts` and parsed the real files. A live-shape sample is `mismatched`. Open Dough's record is `mismatched` because of the `Repository baseline` label added in `0eb86657b`. Doughnut's is `mismatched` because of the mechanism paragraph under Profile-only exclusions. Pygardon's parses, with pending `None.`, 4 accepted, 1 profile-only and 23 transferred. | Slice 5 makes the mechanism note readable. Slice 6's conversion removes Open Dough's extra label. |
| Slice 2's proof discriminates the moved identity checks | Baseline: the two reasons specs passed 5 in 33.8 s with `--workers=2`. With the revision checks scratch-disabled in both server modules, 2 failed at the adapter and GitHub revision steps and 3 passed. Reverted. `tests/support/dashboard-ci-proof-read.test.mjs` and `dashboard-ci-adapter-proof.test.mjs` stayed green under the same break. | Slice 2 adds discriminating payload unit tests at the new boundary. |
| Skill-text consumers | `execution-increment-delivery.test.mjs` requires `dough-test-optimization/SKILL.md` to route to the increment and repair owner. `tests/update-adds-new-payload-skill.sh` lists the skill's payload files. The payload fixture reads `install.sh` `managed_files` directly. | Slices 3–6 run them. |
| Open Dough's recorded candidates still cost what slice 6 judges | Run 42550972063: the production-watcher files take 115.3 s/10, 65.9 s/7 and 52.7 s/6 cases; second-server 15.7 s/1; ad-hoc terminal 18.9 s/3; completed review 8.3 s/1; completion attention 13.4 s/1; rate limit 26.4 s/1; pinned build 29.7 s/5. | Slice 6 rereads the current retained proof. |
| The pilot route works in a subordinate Pygardon workspace | Plan 459 slice 4, retained at `5135735ff`: on 2026-11-04, a subordinate worktree at Pygardon `ac093aea6` collected 6,537 cases and the adapter check passed. Pygardon moved test files on 2026-11-08. | Bounded by early probe slice 1. |
| Pygardon's ordinary local command and selection | Delegated probe: `AGENTS.md:24-28` names `nix develop -c scripts/check-worktree.sh pytest`, which runs serially. CI runs `-m "not slow and not host_docker"` with `-n auto`, and `-m` on the command line replaces `addopts`. | Slice 1 confirms the selection the pilot measures. |

## Current decisions

- Use Story Branch Mode. No step acts from this repository's trunk. The pilot
  publishes to Pygardon under Pygardon's rules from its subordinate
  workspace. Preparation grants no execution authority.
- The reader reuses the shared request owner and the adapter command. It
  takes `--summary` for a summary retained elsewhere. No CI producer changes.
- Intent keeps one candidate parser that accepts two versions.
  `candidate-record.md` stays the format owner. Records convert when a pass
  first writes them.
- Discovery is unadmitted. The first experiment edit is admitted as one
  bounded planless execution under the ordinary request. Dependent
  experiments, a harness redesign, or a moved proof boundary get a plan.

## Learnings

None yet.

## Preparation review

Plan refinement was not needed. Each slice has its own evaluator boundary:
the route probe, the unchanged shared read, the reader's output, the agent's
default path, Intent's record reading, Open Dough's adoption, and the pilot.
Slice 2 is the Structure that slice 3 needs. Slice 4's interim four-section
writing is replaced by slice 5. No slice-specific concern remains. The pilot
route's remaining uncertainty is bounded by early probe slice 1.
