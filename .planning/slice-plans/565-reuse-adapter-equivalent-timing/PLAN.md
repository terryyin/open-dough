# Reuse equivalent CI adapter build timing for a skipped landing

**Source:** [selected story](../../seeds/SEED-288-landed-ci-evidence-follow-ups.md#reuse-adapter-equivalent-timing)
**Source review:** [source-review.md](source-review.md)

**Identity:** SEED-288#reuse-adapter-equivalent-timing

## Goal and scope

A developer using a CI adapter sees a confirmed skipped landing's CI wall time
from its equivalent first-parent build in project history and Done-story CI
comparison, even when that build publishes no CI proof summary. Missing proof
stays explicit for proof-dependent figures and never becomes zero or invented
test evidence. Retained final `No CI proof summary` gaps for such skips recover
under the new rule through ordinary collection and Done comparison recovery.
Cancelled-landing reuse, adapter protocol changes, a larger history window,
browse-time acquisition, and
[SEED-285#compare-landed-timing-with-recent-builds](../../seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)
complete-proof eligibility stay out of scope. The story's Goal, Scope and Key
examples own the product rule.

## Architecture and PFE

Apply [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — whole-product focus and reuse](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The [ADR index](../../../docs/adrs/README.md) and relevant Accepted statuses
agree; no successor, conflict or exception applies. Follow the existing
[North Star](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
shared Landed interpretation; no new topic is warranted.

PFE in this owned checkout on 2026-11-10 at
`d8c088e51ced412ec71a0c1e9ce1e3e440dafd74`:

- Change the shared confirmed-skip owner
  `dashboard/server/exactSkippedEquivalent.ts`, which both Story Branch Landed
  comparison (`intentCiComparisonResolve.ts` → `lookupResultBuild`) and
  landed-history collection (`landedCiResolution.ts`) already use. Do not add a
  second adapter-only equivalence path.
- Keep first-parent nearest-earlier equivalence, adapter attempt identity
  (`landedCiHistoryIdentity.ts`, maintained adapter fixtures), and the existing
  wall-time definition (`historyWallTimeMs` / `wallTimeMs`). Ambiguous or
  unestablishable adapter identities stay gaps.
- Preserve proof as a separate concern: active entry comparison still requires
  a Landed proof summary (`activeComparisonOf`); proof-less wall time must not
  invent counts or scoped proof rows.
- Reuse collection retention (`landedCiHistoryStore.ts`) and Done comparison
  memory/recovery (`intentCiComparisonAnswers.ts`, **Check again**). Final
  `no-proof` observations are currently never re-resolved; reopen only those
  the new rule would measure. Do not broaden cancelled-landing later-build
  reuse or walking usable-proof gates for Baseline/Branch.

## Outside-in proof ownership

| Promise / key example | Owner | Observable proof |
| --- | --- | --- |
| Timed adapter skip becomes a reused-equivalent point; shared attempt is one point; untimed/cancelled/no-equivalent stay gaps | Project CI wall time history (adapter journey) | Extend `dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts` (and supporting store/collection expectations) so S joins P's point; Q/U/T keep their gap reasons |
| Done comparison shows Landed wall time with equivalent provenance while proof-dependent figures stay unavailable | Done CI comparison | Adapter planning-only / equivalent no-proof journeys: Landed wall time present; entry comparison stays Branch or otherwise explicit missing-proof; update GHA no-proof skip expectation that currently asserts wall `—` |
| Retained final `No CI proof summary` recovers to the measured equivalent point | History collection + Done recovery | Seed a final `no-proof` equivalent gap, run the next collection pass (and Done **Check again** / same-process recovery) → landing joins the timed equivalent point; old final gap is not left as the lasting answer |

## Ordered slices

### 1. Confirmed skips reuse equivalent wall time without proof

Type: Behavior
Status: done
Proof: Adapter wall-time history journey and Done comparison journeys above;
focused updates to the shared Landed skip path and maintained wording/docs.

Behavior: Given a confirmed skip whose nearest earlier first-parent build
passed with valid start and completion, and whose attempt publishes no CI proof
summary → project history measures that attempt as a reused-equivalent point
(sharing one point when several landings resolve to it) and Done comparison
shows that Landed wall time with equivalent provenance, while proof-dependent
figures stay explicitly unavailable. Untimed, failed/running, cancelled and
no-equivalent cases keep their existing gaps. Changing only live resolution
for new observations is in scope here; retained final gaps are slice 2.

### 2. Retained final no-proof skip gaps recover under the new rule

Type: Behavior
Status: done
Proof: Seeded final `no-proof` history recovery and Done **Check again** /
same-process recovery journeys from the ownership table.

Behavior: Given a retained final `No CI proof summary` observation for a
confirmed skip that slice 1's rule would now measure → the next collection
pass re-resolves it into the reused-equivalent measured point, and Done
comparison recovery replaces the remembered unused/no-proof Landed answer with
that wall time. Other final gap reasons stay final. Restart alone without
re-resolution is not the recovery mechanism.

## Execution complete

Product advice: no change

## Decisive premises and preparation observations

Observed in this owned checkout at `d8c088e51ced412ec71a0c1e9ce1e3e440dafd74`
on 2026-11-10 after `npm install`. Scratch edits were reverted before recording.

| Premise / consuming operation | Observation in the consuming form/profile | Result and remainder |
| --- | --- | --- |
| Returning a timed successful equivalent from `exactSkippedEquivalentSlot` without a proof summary makes adapter planning-only S a reused-equivalent point on P | Scratch: allow `asSlot(equivalent)` when `state === "pass"` and start/completion exist even if `proof.kind !== "summary"`; then `npx playwright test dashboard/tests/intent/intent-ci-wall-time-history-adapter.spec.ts --reporter=line`; revert | Test fails on the old `no-proof` expectation. Received entries: one `point` for P with landings exact P and equivalent S; Q cancelled; U not-recorded; T no-equivalent. Settles the shared history measurement path for examples 1–4's live rule. Presentation words and Done comparison remain slice 1 proof. |
| Final stored observations are not re-resolved today, so retained `no-proof` gaps need an explicit reopen | Read `keepLandedCiResolution` in `landedCiHistoryStore.ts`: non-pending held observations are left unchanged; collection comments state a final resolution is never resolved again | Premise settled as current store contract. Slice 2 must reopen eligible final `no-proof` skip gaps; no claim that live-rule change alone recovers retained history. |
| Active entry comparison still requires Landed proof after wall-time reuse | Read `activeComparisonOf` in `storyCiComparisonWording.ts`: Landed active title only when `proofs.landed.kind === "summary"` (or checking with prior summary) | Settles that proof-less Landed wall time does not by itself activate Landed entry comparison. Slice 1 must keep missing-proof explicit for counts/rows. |

## Concern evidence

Refinement decision: not needed — two Behavior slices, one shared Landed rule,
clear proof ownership, and no cumulative special-case or sizing concern beyond
the settled reopen of retained `no-proof` gaps.

Remaining slice-specific concerns: none identified.

## Local gates and delivery

- Follow [AGENTS.md — Test automation](../../../AGENTS.md#test-automation):
  shared MakeMe data, observable events or a controlled clock, default test
  timeout, and no `test.slow()`.
- Local gate: focused dashboard proofs that own the changed Landed skip and
  recovery journeys above. Apply the maintained macOS sleep guard and power
  condition in
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  begin fully awake; on AC use `caffeinate -s -i` around long dashboard runs.
- Carry this project's
  [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff.
- Preparation grants no execution authority.

## Current decisions and learnings

- One shared confirmed-skip rule separates usable attempt wall time from proof
  availability; adapters are the ordinary beneficiary because they never publish
  proof summaries, and GitHub Actions equivalent-without-proof cases follow the
  same wall-time reuse while proof stays unavailable.
- Do not relax moving-average complete-published-proof eligibility.
- Cancelled-landing later-build reuse without proof stays deferred.
- Slice 1 accepted live resolution: `exactSkippedEquivalentSlot` returns a timed
  successful equivalent as a measured build when proof is settled unavailable
  `none`; unanswered/expired/unreadable stay gaps/pending; `activeComparisonOf`
  still requires a Landed proof summary. Scope history remains proof-gated and
  does not invent scope timings for proofless wall points.
- Slice 1 focused proof (pre-refactor paths; planning-skip and Landed no-proof
  journeys later moved by refactor extract): adapter wall-time history (S joins
  P; Q/U/T gaps), provenance R4→X, Done GHA/adapter no-proof Landed wall with
  Branch+missing-proof, answer-memory and landed-history gaps. Refactor
  replacement proof: `intent-ci-comparison-adapter-planning-skip.spec.ts` and
  `intent-ci-comparison-skipped-landed.spec.ts` (-g reuses equivalent wall time).
- Slice 2 still owns reopening retained final `no-proof` skip gaps.
- CI repair on `dfc059a11`: retain first proof ask with a new measured pass;
  treat settled missing proof summaries as final (`proofPending: false`) so
  history/scope re-reads do not re-ask GitHub after collection.
- CI repair on `16f5990d` (from failed ancestor `9a6fd5e2`): restore collectability/pending for settled GitHub `none` so exact attempts recover to a later summary; keep same-write first proof ask retention.
- Slice 2: reopen eligible retained equivalent `no-proof` gaps via
  `reopenableRetainedNoProofSkip` / `reuseSettled`; Done memory treats unused
  equivalent no-proof Landed answers like pending for same-process / Check
  again recovery. Restart without collection does not recover history.
  Focused proof: `landed-ci-history-no-proof-recovery.spec.ts` +
  `intent-ci-comparison-answer-memory.spec.ts` (+ collection after merge).

## Story obligations

### G1. Adapter protocol changes deferred
Reported: slice 1 — "Deferred promise: adapter protocol changes."
Story clause: "adapter protocol changes"
Disposition: excluded "adapter protocol changes"
Commitment: 14.1

### G2. Broader cancelled-landing reuse without proof deferred
Reported: slice 1 — "Deferred promise: broader cancelled-landing reuse without proof."
Story clause: "broader cancelled-landing reuse without proof"
Disposition: excluded "broader cancelled-landing reuse without proof"
Commitment: 14.2

### G3. New history window deferred
Reported: slice 1 — "Deferred promise: a new history window."
Story clause: "a new history window"
Disposition: excluded "a new history window"
Commitment: 14.3

### G4. Upstream acquisition during browsing deferred
Reported: slice 1 — "Deferred promise: upstream acquisition during browsing."
Story clause: "upstream acquisition during browsing"
Disposition: excluded "upstream acquisition during browsing"
Commitment: 14.4

### G5. Moving-average complete-proof eligibility not relaxed
Reported: slice 1 — "Deferred promise: relaxing SEED-285 complete-published-proof eligibility for moving-average candidates."
Story clause: "relaxing
[SEED-285#compare-landed-timing-with-recent-builds](SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)
complete-published-proof eligibility for moving-average candidates"
Disposition: excluded "relaxing
[SEED-285#compare-landed-timing-with-recent-builds](SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)
complete-published-proof eligibility for moving-average candidates"
Commitment: 14.5
