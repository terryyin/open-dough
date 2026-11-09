# Refresh Done comparisons while Landed evidence is pending

**Identity:** SEED-288#refresh-pending-landed-evidence

**Source:** [Keep Done CI comparisons refreshable while landed evidence is pending](../../seeds/SEED-288-landed-ci-evidence-follow-ups.md#refresh-pending-landed-evidence)

**Source review:** [Independent source commitments](source-review.md)

**Execution evidence:** [Resume context and accepted proof](source-review.md#execution-resume-context).

## Goal and boundary

A developer can use Check again or select a Done story again, in the same
dashboard process, to recover Landed evidence that CI had not answered yet.
History and comparison share the judgment of whether that evidence is final.
Retain final-answer/proof reuse, Taken freshness and all existing selection
and provenance rules. Missing evidence stays explained and never becomes zero.

Cover unanswered equivalent/later-build proof, running equivalent builds,
cancelled landings awaiting later builds, unread CI and missing push runs.
Use the existing no-run wait: CI running at or building past the requested
revision, the existing first-parent walk limit, or one hour after the matching
recorded landing settles it. Receipt age is optional local observation, never
a prerequisite for reading the published story. Unknown age does not prove
expiry; do not substitute completion/commit time or start a fresh age on reads.

No cache TTL, timed UI polling, second resolver, new adapter protocol, broader
cancelled reuse or adapter wall-time-without-proof feature. Trunk Mode retains
its completion ancestor walk; Story Branch Mode retains exact, confirmed
equivalent and bounded later-trunk selection. This plan is preparation only.

## Existing solutions and architectural direction

PFE: reuse the Landed rules already present, rather than introducing another
selection or caching policy:

- `dashboard/server/landedCiResolution.ts` owns the extra pending judgment
  (`stillAwaited`) after `lookupResultBuild`: unanswered proof, a running
  ancestor and the bounded no-run wait. Expose the applicable judgment for
  comparison as well as history, keeping acquisition at existing boundaries.
- `unusableBuild.ts` preserves the provider distinction as `proofUnanswered`;
  `ciProofArtifact.ts` distinguishes unanswered requests from answered missing,
  expired or unusable archives. Reuse that classification, not string matching.
- `intentCiComparisonResolve.ts` selects Done endpoints; `asComparisonSlot`
  drops the internal proof/finality detail; `intentCiComparisonAnswers.ts`
  then calls `finalSlot` on the projected answer. Carry the shared judgment
  to the memory decision before that information is lost. Keep Baseline and
  Branch's existing finality and selection responsibilities.
- `launchRecordStore.ts` and `landedCiHistoryStore.ts` already retain landing
  references and `receivedAt`. `storyCompletionEndpoints.ts` supplies the
  published identity and landed revision, but no landing receipt time. Join
  available evidence to those facts without making local observation the
  authority for published completion or choosing another landing's age.
- `observationClock.ts`, MakeMe and existing controlled run/proof fixtures
  provide deadline and provider transitions without wall-clock sleeps.

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
Git owns published story facts; machine-local evidence supplements them;
comparison memory and history are disposable derived views. No new durable
workflow record or database is needed. The existing
[North Star: published facts and collected evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
already separates landing, measured attempt and provenance, and keeps browsing
history local while explicit CI refresh owns acquisition. Sharing judgment
must not make a history read fetch CI or couple Check again to the collection
timer. No ADR exception or new North Star topic is required.

## Outside-in proof ownership

| Promise | Observable proof owner |
| --- | --- |
| An unanswered equivalent/later proof recovers in the same process | Real comparison read and memory with controlled provider answers and counted upstream requests; at least one real Check again journey from Branch fallback to Landed, including provenance |
| Pending history and comparison agree | Feed matching landing/run/proof facts through their actual entry points; assert pending/re-read versus final/reused, not merely equality of a shared helper |
| Terminal artifact gaps and completed timing reasons stay final | Answer missing/expired/invalid/unopenable artifacts, repeat comparison reads and assert unchanged explanation and no further provider requests; contrast with unanswered requests of the same apparent unreadable reason |
| A run not created yet becomes its exact build | Same-process first read with no run, queued/running transition, then completed exact build; both Check again and reselection reach the production reader |
| No-run waiting has a fixed, correct bound | Controlled clock immediately before/at the matching receipt's one-hour deadline; a later first-parent run and the walk limit settle it independently; unrelated/missing capture cannot invent age |
| Existing modes, selection and reuse remain valid | Focused skipped/cancelled/fast-forward/Taken and retry consumers below; exact/equivalent/later revision and attempt identity, Baseline/Branch bounds, final reuse and Taken freshness remain asserted |

Extend existing production-boundary fixtures and MakeMe domain builders.
Do not mock internal rule collaborators. Preserve independent expected values
outside builders. Prefer the fast real read/memory boundary established by
SEED-286 if delivered when execution starts; retain unique full-app transport
and control proof. Tests arranged with a final response alone cannot prove
upstream finality, receipt matching or same-process cache recovery.

## Ordered slices

### 1. Recover Landed when its build or proof is still awaited

Type: Behavior
Status: done
Proof: Same-process production comparison read/memory with counted provider
operations, matching history resolution, and the real Check again transition.

Given a confirmed skip resting on a running build or an equivalent/later build
whose proof request is unanswered, another comparison read can recover its
Landed endpoint once the build/proof answers. Queued/running, unavailable CI
and cancelled-awaiting-later results remain refreshable. A repeated final
Done read reuses the answer and valid proof; Taken stays live.

Share the existing pending/final judgment with the comparison memory path,
preserving it across slot projection. Keep the provider's unanswered marker
distinct from an answered unusable artifact, including transient failure,
directed wait and malformed artifact listing versus missing, expired, invalid
or unopenable archive. Preserve the selected revision, run/attempt and
equivalent/later provenance, including the hour-independent proof wait.
Do not replace Trunk Mode's selection with history's exact resolver.

Add discriminating recovery and terminal-reuse cases together: a policy that
never remembers any gap is insufficient. Cover the running equivalent case
and later-build proof recovery at the real resolver/read boundary. Keep one
full-app Check again case that changes Branch fallback to Landed and observes
the displayed source. Update the maintained comparison/history documentation
for this shared judgment. Missing-run age remains the next slice's obligation.

### 2. Recover missing push runs using the landing's actual observation

Type: Behavior
Status: done
Proof: Comparison read plus real Check again/reselection with controlled runs;
matching history cases and controlled observation-clock deadline/bound cases.

Given a published Done landing read before CI creates its run, the comparison
stays refreshable until an existing finality condition applies. Once CI creates
and finishes its run, another read shows its exact build in the same process.
With no run, it becomes final No build at the known one-hour receipt deadline,
when CI has built past it, or at the existing first-parent walk limit.

Supply available recorded landing time to the shared judgment. Match project,
target, story and the resolved landed revision; include a competing preparation
receipt and another execution revision so selecting by story alone fails.
Reuse retained history references when they still identify the same landing;
do not require retained launch-list membership. Missing/unreadable local
capture cannot hide published comparison or prove the deadline expired.
Without known age, use the remaining CI/walk evidence and keep an unsettled
no-run answer refreshable. Keep the deadline fixed across repeated reads.

Prove before/at one hour with the controlled observation clock, no-run → queued
→ completed exact recovery, and later-run/walk-bound finality. Check receipt
absence and mismatches, and a repeated terminal answer's provider accounting.
Retain Trunk Mode's completion ancestor behavior and Story Branch Mode's
merge/fast-forward identity; absence of a recoverable published landing remains
its existing explained historical gap, not an invented revision. Assimilate
receipt and refresh semantics into the maintained comparison/history docs.

## Verification and execution gates

Follow [the project's failing and flaky test policy as written](../../../AGENTS.md#failing-and-flaky-tests)
in every slice, delegation brief and repair handoff.

Use the [shared MakeMe API and test data architecture](../../../tests/README.md#test-data-architecture).
Wait for observable operations or advance the controlled clock; no sleeps,
`test.slow()` or suite/file/group/hook timeout overrides. The installed
execution workflow owns source review, independent post-change refactoring,
agent commits, delivery, retrospective and asynchronous CI repair.

Local gate: each slice's new focused proof, affected comparison/history
consumers and dashboard typecheck; applicable commit hooks run normally.
Run the consumer trace after edits and disposition every affected caller,
fixture and journey, including consumers outside the initial selection.
The initial regression selection is:

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-retry.spec.ts tests/intent/intent-ci-comparison-skipped.spec.ts tests/intent/intent-ci-comparison-cancelled-landing.spec.ts tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts tests/intent/intent-ci-comparison-fast-forward.spec.ts tests/intent/intent-ci-comparison-taken.spec.ts backend-tests/intent/landed-ci-history-pending.spec.ts backend-tests/intent/landed-ci-history-pending-proof.spec.ts backend-tests/intent/landed-ci-history-pending-sources.spec.ts backend-tests/intent/landed-ci-history-gaps.spec.ts backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts backend-tests/intent/intent-ci-comparison-answer-memory.spec.ts tests/intent/intent-ci-comparison-pending-proof.spec.ts backend-tests/intent/intent-ci-comparison-missing-run.spec.ts backend-tests/intent/intent-ci-comparison-receipt.spec.ts backend-tests/intent/landed-ci-history-comparison-run.spec.ts tests/intent/intent-ci-comparison-missing-run.spec.ts
npm run typecheck:dashboard
```

Add new focused specs to that literal selection; if SEED-286 has moved these
owners, use its delivered replacement paths and keep their observed promises.
Inspect the actual existing assertions before replacing any. Run adapter,
history lifecycle/collection and proof-reader consumers when changed contracts
reach them. A shared MakeMe change also needs its owning builder/Node tests and
typecheck because TypeScript consumes the JavaScript builders. Full suites are
not a routine local gate for this bounded change.

Before long verification inspect this host's power, load, memory, competing
work and expected cost; leave other executions with their owners. Start fully
awake. On AC use `caffeinate -s -i`; on battery plug in or use `caffeinate -i`
with the lid open and inspect the sleep log, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use Homebrew Bash 5 first on PATH for repository shell checks. No numeric slice
target or hard limit is configured; each slice owns one recovery outcome and
its proof/preservation loop. Reassess a disproved integration premise before
expanding an attempt.

## Decisive premises and preparation observations

Observed in this owned checkout at
`a2b8dc3bcfde032bfb78b0fb609a23b0265d0f9d`, 2026-11-09. Dependencies were
installed with `npm ci --ignore-scripts --no-audit --no-fund`. Scratch changes
were all removed and `git diff --exit-code` passed before the seed write.

| Premise / consuming operation | Form/profile and observed result | Remaining acceptance work |
| --- | --- | --- |
| The reported negatives become stale through the actual read/memory/UI path | `caffeinate -s -i npm run test:dashboard -- tests/intent/scratch-pending-comparison-preparation.spec.ts --workers=1` exited 0 for two observation cases. Real published Story Branch fixtures, synthetic GitHub and the actual Check again control returned `landed.kind: none` again after run 103 became available or equivalent run 201's failed proof listing could answer. Upstream listing counters did not increase; the visible active comparison stayed Branch. | Permanent regression assertions must require recovery, not preserve this symptom. |
| Re-reading can reach the available exact/equivalent result through that same consumer | Temporarily bypassed memory only for `landed.kind: none`, then ran `caffeinate -s -i npm run test:dashboard -- tests/intent/scratch-pending-comparison-preparation.spec.ts backend-tests/intent/landed-ci-history-pending-proof.spec.ts backend-tests/intent/landed-ci-history-pending.spec.ts --workers=1`. Exit 0: the two recovery variants returned build, the equivalent selection stayed equivalent, provider counters increased and Check again displayed Landed. | The shortcut is deliberately insufficient: it forfeits terminal-gap reuse. Both slices must implement shared classification and prove final reuse. No shortcut was retained. |
| History already executes the desired unanswered-proof and no-run clock rules | The same strict run passed the five existing history cases: no-run hour expiry, unread CI recovery, missing → queued → completed run, proof still unanswered hours later while older collection proceeds, and eventual equivalent-proof recovery for a two-hour-old landing. Actual boundary servers, captured records, synthetic provider and controlled observation clock were used. | Execute matching facts through both history and comparison after sharing the rule; extend later-run/receipt discrimination where needed. |
| Receipt propagation is required; completion time is a different fact | The exercised comparison fixtures recover published endpoints without local landing captures. `PublishedStoryEndpointFacts` carries completedAt and merge/branchSide, whereas the actual captured-record/history path exercised above carries receivedAt. The current Done resolver never supplies that age to `stillAwaited`; `asComparisonSlot` also drops proofUnanswered. | Implement the exact join and preserve absence/mismatch behavior in slice 2. This is new wiring, not a claim of an existing working receipt join. |

Scratch sources were retained outside Git at
`/tmp/seed288-comparison-observation.spec.ts` and
`/tmp/seed288-comparison-recovery.spec.ts`; the observations above are the
durable result and require neither file for execution. The temporary memory
edit was restored byte-for-byte. These are preparation observations, not
implementation acceptance or completed-slice evidence.

Before the focused runs this Mac was on AC with load 7.17/5.47/4.33; preparation
chose one worker, the maintained sleep guard and no full suite. No exclusive
machine ownership or CI headroom is claimed; recheck conditions for execution.

## Current decisions and coordination

- One shared Landed finality judgment with each consumer's existing build
  selection and acquisition lifecycle. Finality is evidence-derived, not an
  age-based cache policy; no repeated resolver for each exceptional example.
- Unknown receipt age cannot mean expired. Preserve published-only reads and
  use known CI/walk facts; do not fabricate a landing time from completion.
- SEED-286#fast-intent-ci-comparison-tests is Taken and may change the same
  proof owners. Its faster test boundary is useful but its outcome is not a
  prerequisite. Read its delivered code before execution; preserve another
  execution's files and coordinate actual conflicting edits or repair ownership.
- The adapter-equivalent-timing sibling remains separate and unchanged. Keep
  its terminal no-proof gaps final under the current delivered semantics.

## Preparation review

Slice-plan refinement was not needed: two cohesive Behavior slices own distinct proof-availability and missing-run recovery loops, sharing one finality model. Each includes implementation, discriminating proof, regression preservation, documentation and cleanup. No Structure-only preparation, new architectural direction, human decision, blocking dependency or slice-specific concern was identified. Both reported symptoms and a bounded recovery route were observed; terminal-reuse and receipt-join proof are implementation obligations, not claims that preparation has delivered them. No Take or execution authority is granted.

## Story obligations

### G1. Provider-held proof recovery observed
Reported: slice 1 — "Acceptance inspection of the new pending-proof matrix found transient and malformed responses but no held-request transition."
Story clause: "has a proof request held, transiently failed or not answered with a valid artifact listing."
Disposition: proved by slice 1: dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts, equivalent and later provider-directed wait tests use the real request owner, advance its controlled clock, and recover the same revision/run/attempt/provenance with two proof listings.


### G2. Final-reuse fixture supplies a final no-run condition
Reported: slice 1 — "Preservation retry test expected cached reuse although its Trunk fixture had no completion run, later run, or receipt age; its Baseline was listed again on the third read."
Story clause: "completed answers retain final-answer reuse"
Disposition: proved by slice 1: storyCiComparisonRetry.ts supplies a real later trunk run; intent-ci-comparison-retry.spec.ts retains the Baseline retry/final request assertions and additionally observes Landed stays No build and never selects that later revision. The expanded 99-case regression passed after this correction.

### G3. One comparison read already uses a consistent run listing
Reported: slice 1 — "Implementation self-review found a run could appear between selecting no build and the shared judgment checking for its own run, making a stale negative look final."
Story clause: "Pending evidence must not become a permanently remembered negative answer."
Disposition: no user cost "Pending evidence must not become a permanently remembered negative answer.": baseCiGithubRevisionLookup.ts runsAt retains successful per-revision listing promises for the whole comparison; baseCiAdapterRevisionLookup.ts indexes one discovered snapshot. A newly appeared run cannot mix into either ongoing read. Failed GitHub listings produce unavailable and remain refreshable; existing selected regressions exercise that recovery. No duplicate wrapper or test is needed for this unreachable mixed-snapshot state.
