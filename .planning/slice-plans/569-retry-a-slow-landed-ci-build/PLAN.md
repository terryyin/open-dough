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

The canonical dependency agreement waits for
`SEED-285#compare-landed-timing-with-recent-builds`. Execution must consume its
published project/Done comparison and sample/exclusion facts, not implement a
second average. Preparation and readiness can finish while that supplier is
Taken. After it lands, inspect its actual API and proof before implementation;
no unimplemented supplier function name is prescribed here.

## Architecture and reuse

[Architecture and existing-solution evidence](execution-evidence.md#architecture-and-reuse).

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Same timing basis for originals, repeats and reference; unmatched retained evidence explained | 1: real normalization/collection/history response with differing creation/start times, plus focused reference eligibility checks after supplier integration |
| Only an explicit full rerun at the original run/revision; generic reads remain read-only | 2: actual command/owner boundary against synthetic GitHub captures method and route, accepts only the narrow operation, and preserves GET behavior |
| Default-off, project/production authority, new receipts only, disable prevents new requests | 3: actual settings boundary and collector, with an old receipt before enablement and new one afterwards; mutation-call count and settings UI |
| At least 5%, sufficient positive complete reference, exact successful landing only | 3: new capability-named boundary spec invokes normal collection using shared MakeMe facts; 104/105-second boundary, insufficient/zero reference and unavailable/wrong provenance produce no mutation |
| One request despite duplicate Done, restart, competing processes or ambiguity | 3: actual receipt ingestion and two production servers share an isolated machine; gate provider reply on observed durable write, interrupt/restart, then count exactly one POST; a pre-send interruption may result in zero POSTs but never a resend |
| Progress, possible slowdown, recovery, refusal/failure/cancellation/incomplete/uncertain explanations; Done unchanged | 3: Recently done browser journey plus focused classification cases, observing actual collected outcomes rather than preloading the result under test |
| Both attempts, same saved reference and actual selected landing remain reviewable without acquisition | 4: Done card → selected Intent wall comparison → revisit/restart; assert timings, rule, sample/exclusions, links and unchanged provider-call count |
| Original remains the later-average sample once; current window changes cannot rewrite follow-up | 3: preserve and discriminate original selection from first repeat admission, including a changed workflow setting; 4: next-landing comparison after recovery and reference-window advancement, inspecting original sample identity and saved follow-up separately |
| Accessible outcome/evidence and unsupported-provider explanation | 3–4: text as well as red marking, keyboard route and phone-width review; adapter continues reading and makes no mutation |

Extend `makeMe.aCiRun`, `aLandedCiHistory`, proof/landing builders and the shared
MakeMe API for new follow-up facts. State driving times, attempt identities,
project enablement and receipt order at each call site. Keep actions and
independent expectations outside builders. Extend synthetic `gh` parsing to
include method as well as route; a route match alone cannot prove a POST.
Wait for observable requests/store transitions or advance the controlled
observation clock; do not wait for elapsed wall-clock time.

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
Status: planned
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
Status: planned
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
Status: planned
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

Starting command shapes (add the new capability-named specs and actual supplier
consumers as each slice becomes concrete):

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/dashboard-ci-revision-nearest.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-history-pending.spec.ts --workers=1
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-wall-time-history.spec.ts tests/intent/intent-ci-comparison.spec.ts --workers=1
npm run typecheck:dashboard
```

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
