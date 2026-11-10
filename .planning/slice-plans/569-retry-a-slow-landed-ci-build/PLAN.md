# Repeat a slow landed CI build once and flag a persistent slowdown

**Identity:** SEED-285#retry-a-slow-landed-ci-build
**Source:** [Refined story](../../seeds/SEED-285-landed-ci-timing-history.md#retry-a-slow-landed-ci-build)
**Source review:** [Independent commitments](source-review.md)
**Preparation:** owned workspace `codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`,
starting revision `7ff9a21f86addd3d3bbe47e0b0007f019dbffaba`; Terry accepted the
four recommended decisions on 2026-11-10. This plan authorizes no execution.

## Execution context

[Execution identity, setup and observer](execution-evidence.md#execution-context).

## Goal and scope

An explicitly enabled project's new Done landing can receive one full GitHub
Actions repeat when its complete successful exact measurement is at least 5%
slower than its sufficient positive prior-build average. A developer sees
progress, recovery, possible slowdown or a particular unverified outcome,
with the original, repeat and fixed reference reviewable. The story stays Done.

Use provider-reported attempt start through completion for the original,
repeat and all reference samples. It is not a promise to measure every queue
phase. Keep the original in later averages under the existing comparison's
eligibility/filter rule; repeats are separate observations. Freeze the actual
reference, exclusions and rule used for the follow-up so changes to current
history cannot rewrite its decision.

Default off, explicit project enablement on one designated production dashboard
machine, newly recorded landing receipts only. Atomically spend one allowance
before submission; never automatically send it again after an uncertain reply
or an interruption, including a crash before the command actually ran. Two
processes on that machine share the cap. Old receipts, duplicate reports,
development mode, other projects and unsupported providers do not acquire
authority from browsing or restart. Disabling stops new requests, while already
requested outcomes remain observable and reviewable.

Defer calibrated confidence, causal attribution, adaptive repeats, configurable
thresholds, cross-machine coordination, generic adapter mutation and new
historical backfill. Preserve providers' existing reading behavior. Refusal or
unavailable evidence remains an explanation, never a synthetic recovered value.

The canonical supplier `SEED-285#compare-landed-timing-with-recent-builds` is
satisfied. Consume its accepted project/Done comparison and sample/exclusion
facts; [execution evidence](execution-evidence.md) records the inspected API.

## Architecture and reuse

[Architecture and existing-solution evidence](execution-evidence.md#architecture-and-reuse).

## Outside-in proof ownership

[Proof ownership and test-data foundations](proof-ownership.md) retain the
observable promises, owning slices and required boundary observations.

## Ordered slices

### 1. Compare attempts using one reported wall-time basis

Type: Behavior
Status: done
Acceptance: [Inspected slice 1 proof](slice-1-proof.md); [CI repair 1](ci-repair-1.md); [CI repair 2](ci-repair-2.md).
Proof: New focused normalization/retention cases, affected timing comparison
consumers, and a real collector-to-history boundary scenario.

Behavior: Given creation time different from attempt start for original and
later attempts, collect/read them → every compared wall value uses attempt
start through completion. Reuse the supplier's single reference rule. Old
retained measurements with another/unknown basis are recomputed from
authoritative attempt bounds when available through background collection,
or explicitly excluded until comparable; browsing does not acquire them.
Keep source/basis provenance sufficient to prevent mixing or silently using
creation as an attempt start. Missing bounds remain unavailable. Test execution
time and the separate time-without-runner-waits measure retain their meaning.

Trace the shared selector's effect through Base/Branch/Landed comparisons,
project history and retained proof, including exact/equivalent/later and
adapter reading. Update the maintained timing definition and affected
expectations to the accepted rule, preserving their independent promises.
This slice is useful on its own and enables a meaningful repeat decision.

### 2. Expose one narrow full-workflow repeat capability

Type: Structure
Status: done
Acceptance: [Inspected slice 2 proof](slice-2-proof.md).
Proof: Focused action-owner/transport contract through the real synthetic
`gh` boundary, with existing read-owner behavior preserved.

Internal change: Add an explicit authorized GitHub full-workflow-rerun
operation to the existing CI boundary, preserving fixed argument arrays,
repository/authentication scope and request bounds. It accepts the selected
original run identity, uses the full-rerun POST, and reports accepted,
definitively refused or uncertain submission without automatic mutation retry.
No failed-job-only rerun, workflow dispatch on current trunk, arbitrary route,
or shell command substitutes for this measurement. No collector invokes this
capability yet; external behavior remains unchanged until slice 3.

The immediate next Behavior is slice 3. Isolating the action boundary makes
hidden retries, read caching and method validation reviewable before autonomous
admission uses it. Keep provider-age/permission refusals as provider facts;
do not infer write access from a successful read. No production rerun is needed
to exercise the automated contract, and preparation enables no project.

### 3. Give an enabled new landing one durable repeat and an honest card outcome

Type: Behavior
Status: done
Acceptance: [Inspected slice 3 proof](slice-3-proof.md).
Proof: New project-setting/collector lifecycle boundary specs and a Recently
done journey through actual collection and synthetic provider responses.

Behavior: Enable one project on the designated production machine, then record
an eligible Done landing → consume its allowance atomically, freeze the
comparison and request one full repeat. Show **CI rerun in progress** when CI
is observed queued/running; request-recorded/uncertain progress must not claim
that CI has started. Observe the exact subsequent attempt and complete proof:
still at/above the saved 5% threshold gives **Possible CI slowdown**, below
gives returned-to-range, and refusal/failure/cancellation/incomplete or
unattributable evidence gives its specific unverified explanation. Show the
two timings and saved average on the card; story membership remains Done.
From the first autonomous request, preserve the original as the landing's
ordinary historical sample. Prove that observing a faster repeat neither
replaces that original nor adds a sample before slice 4's richer reading exists.

Extend existing machine-local project settings with default-off enablement and
a durable new-receipt boundary; old retained receipts are still readable but
cannot form an enabling-time batch. Duplicate receipt delivery/references
share one allowance for the original landing. Freeze the workflow/run in the
request payload; changing the selected workflow later grants no second
allowance for that landing. Do not derive freshness
from a later recollection timestamp. Disabled/development/other projects and
unsupported providers request nothing. Disabling stops new admission while
already requested outcomes may still be observed.

The durability proof belongs in this slice, not a later hardening pass:
two collecting processes, restart after spending, lost acceptance reply,
interruption before send, history pruning, and unreadable settings/allowance
bytes must never grant another request. Refuse admission on unreadable state;
preserve recoverable bytes and explain the problem. After corruption refusal,
perform ordinary observer/settings updates and restart: those later writes
must preserve refusal rather than reset allowance evidence to empty and admit
a request on the next pass. Reconcile observed
attempts without equating an attempt increment with this dashboard's full
repeat. Concurrent/manual partial reruns that cannot establish complete
comparable confirmation stay unverified. Keep original and repeat separately.

Safe interim behavior: the complete outcome and comparison totals are already
visible on the Done card. Detailed sample/exclusion navigation is added in
slice 4; do not offer a dead comparison link before that path exists.

### 4. Review both measurements against their saved reference in Intent

Type: Behavior
Status: done
Acceptance: [Inspected slice 4 proof](slice-4-proof.md).
Proof: New card-to-Intent browser journey, retained-history/reference boundary
case and focused original-attempt selection check.

Behavior: Follow the Done card's comparison route → the selected exact landing
shows original and repeat with run/attempt links, their attempt wall times,
saved average/rule, signed differences and actual reference sample/exclusions.
New landings, moving-window changes and restart do not rewrite that decision.
The next landing's ordinary average still considers the original once under
the common completeness/outlier rule; the repeat neither replaces it nor adds
a second sample. Preserve current story selection and existing scoped proof
navigation, which continue to describe the original selected landing.

Finish collection, restart as a reader, open/revisit/reload the card and Intent
and navigate by keyboard at phone width → the same retained follow-up is
readable with no provider acquisition or action. Text accompanies color and
all evidence links are reachable. No new repeat-specific scoped-proof browser
or separate chart is promised. Update maintained follow-up/configuration and
timing docs with the delivered authority boundary and limitations.

## Decisive premises and observations

[Decisive preparation observations](execution-evidence.md#decisive-premises-and-observations).

## Verification and delivery gates

Use the installed execution workflow for source review, independent post-change
refactoring, consumer trace, focused verification, agent commits and applicable
final CI diagnosis/repair. The reusable fixtures are foundations, not proof of
the new action; assertions must discriminate its method, target and call count.
Inspect actual supplier output and affected tests after its accepted landing.

Local gate: the slice's new focused contracts/journeys and affected existing
timing, collection, settings and enclosing Done/Intent consumers;
`npm run typecheck:dashboard`; applicable lint/format hooks. The shared timing
change reaches comparison consumers beyond the history tests, so use the
consumer trace and their actual assertions to select those suites. Shared
transport changes also preserve its source/installed command consumers.
No full repository/dashboard suite is a routine local gate for this bounded
change; every published CI failure remains owned.

[Starting command shapes](execution-evidence.md#focused-verification-commands)
remain inputs alongside each slice's concrete proof and consumer selection.

Local sleep guard: start fully awake; on AC use `caffeinate -s -i`, whose `-s`
requires AC power. On battery, plug in or use `caffeinate -i` with lid open and
inspect the sleep log, per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Before expensive proof inspect current host load/memory, competing work and
expected scope/cost, then sequence owned heavy work or reduce workers while
preserving coverage. Do not infer another runner's headroom from this machine.

[The project's failing and flaky test policy applies as written](../../../AGENTS.md#failing-and-flaky-tests)
to every slice, delegation and repair, including base failures, published CI,
other active repair ownership and human exceptions. Never rerun until green
as a fix. Never sleep, use `test.slow()`, or override suite/file/group/hook
timeouts; any essential override belongs inside the individual test.

## Concern review and current decisions

[Concern review and preparation decisions](execution-evidence.md#concern-review-and-current-decisions).


## Story obligations

### G1. Resolve the selected completed landing on the card
Reported: slice 3 — "Multiple retained records for one identity show ambiguity rather than selecting an arbitrary first historical result."
Story clause: "A developer reviewing Recently done can distinguish a slow landed CI measurement that returned to range on one full repeat from one that still needs investigation."
Disposition: proved by slice 4: slice-4-proof.md#current-proof
Commitment: C001
### G2. Finish retained comparison navigation and documentation
Reported: slice 3 — "Detailed Intent sample/link navigation and maintained docs are deliberately slice4, as planned."
Story clause: "Done-card and Intent presentation read the same follow-up evidence."
Disposition: proved by slice 4: slice-4-proof.md#current-proof
Commitment: C087
### G3. Keep observed original-attempt links exact
Reported: slice 4 — "Existing ordinary scope-history links retain mutable run URLs."
Story clause: "Preserve the original and repeat as distinct attempts with their revision, workflow/run identity, timing, proof completeness and build links."
Disposition: proved by slice 4: slice-4-proof.md#current-proof
Commitment: C008
