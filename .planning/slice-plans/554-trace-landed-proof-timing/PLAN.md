# Trace a Done story's timing history into test Proof

**Source:** [Trace a Done story's timing history into test Proof](../../seeds/SEED-285-landed-ci-timing-history.md#trace-landed-proof-timing)

**Identity:** SEED-285#trace-landed-proof-timing

## Goal and scope

A developer reviewing a Done story can inspect the collected test execution
time of an entry, folder or file over the retained landing history through that
story's landing. Keep the selected landing, measured attempt, supported scope
and gaps explicit. These are observations of builds, not timing attributed to
the story or a fixed historical set of tests.

The source's Scope and Key examples are authoritative. Retain validated attempt
proof during background collection, derive scope readings from it, and show a
dated line with readable evidence beside the existing Summary or file Proof.
Browsing uses local evidence only. Preserve the selected story, current
comparison, Purpose/Proof reading and existing CI refresh lifecycle.

Exclude moving averages, historical reference differences, outlier handling,
automatic reruns, case-level history, inferred rename chains, a new window
selector, recovery of evicted history, and a separate story-level wall-time
chart. Do not change sibling story scope. Planning authorizes no execution.

## Architecture and PFE

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
and [ADR 0002 — whole-product focus and reuse](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
The [ADR index](../../../docs/adrs/README.md) agrees with the relevant in-file
Accepted statuses; none has a successor or conflict for this work. Story design
belongs here under [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).
The [existing North Star](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
already covers the consequential collection/reading and provenance choices; no
new topic or ADR is needed.

PFE originally observed at `ecd07dc8a` on 2026-11-09; delivered-history
contracts reconciled at `0c32a9335` later that day:

- **Landing history owner.** [The delivered landed CI history](../../../docs/dashboard-development-intent-ci-status.md)
  owns landing-to-build resolution, background collection, the bounded
  machine-local store and its project history read. Extend that owner with
  attempt proof; do not create another collector, store or Landed rule. Its
  delivered payload is wall-time evidence, not retained proof summaries. At
  `0c32a9335`, `landedCiCollection.ts`, `landedCiHistoryStore.ts`,
  `landedCiObservation.ts` and `intentCiHistoryRead.ts` own those boundaries.
  `landedCiMeasuredBuilds.ts` retains the newest 20 distinct measured builds,
  gaps among/after them and older landings sharing a retained build. This is a
  build-count window, not a guaranteed number of days or the 30-day Done list;
  the closing report observed about a day of Open Dough landings. Keep that
  existing bound and explain an evicted Done endpoint rather than promising
  deeper history. Retain proof and prune it with the same cohort.
  Collection currently skips final landing resolutions and the store refuses
  to replace them. Add proof acquisition/backfill for retained build attempts
  independently of that final wall-time resolution: an already-final build
  still needs its summary or an explicit proof gap. Keep one shared collector
  and store, with proof pending/finality separate from landing finality.
- **Validated proof acquisition.** `performIntentCiProofRead` dispatches to
  `readCiProofArtifact` or `readCiAdapterProof`. These already enforce summary
  contract and repository/run/attempt/revision identity. Reuse their acquisition
  responsibility from the collector, through the shared request owner; never
  download or accept arbitrary historical summary payloads in the browser.
  Both currently remember successful proof only in process memory. Persist the
  validated summary or explicit absence with the history observation instead
  of treating that memo or the evictable retained-answer cache as the store.
- **Scope meaning.** `owningEntryOf`, `scopeFiguresOf`, `entryTimingOf` and
  `scopeTimingOf` already own longest-entry containment, all published files
  under a path, complete/partial/untimed classification and measured zero.
  Reuse these rules, exposing their domain-correct part if a comparison-shaped
  wrapper would otherwise couple history to Baseline/Branch/Landed state.
  `scopeEndpointTimingOf` demonstrates the same entry-versus-breakdown rule.
  History needs an explicit match against the selected scope's entry/path/unit;
  changing unit or ownership must not silently compare unlike scope evidence.
- **Existing presentation.** Extend `IntentScopeProof.tsx` and
  `IntentFileProof.tsx` within the current Intent evidence owner. Reuse the
  delivered `IntentCiHistory.tsx` presentation and its shared chart/evidence
  owners for dated measured points, gaps and accessible build evidence, as
  [Intent CI status](../../../docs/dashboard-development-intent-ci-status.md)
  describes. Use precise execution-time wording for the scoped measure; omit
  average/difference/follow-up elements. The spent plan's mockup was removed
  during wrap-up and is no longer an active design input.
- **Historical source context.** [Intent for a selected story](../../../docs/dashboard-development-intent-story.md)
  describes Done-story source/tree pinning. Use the captured landing and existing
  source context, keeping the measured build revision separate. No current
  trunk fallback and no new historical source subsystem belong here.
- **Specific Done endpoint.** `publishedStoryEndpoints.ts` supplies completion
  and the Story Branch owning landing; `performDoneComparison` uses that
  landing's `merge`, or Trunk Mode's `completion`, as its requested result.
  Reuse those shared facts to name the represented revision in history, then
  join the project/authorized target and exact represented revision to retained
  landing receipts (and launch key where available). A story identity alone
  cannot distinguish preparation, execution and later publications. The
  current client comparison answer carries completion and measured build
  revision, but not a separate requested Story Branch landing revision: carry
  the shared endpoint fact through the established reading context as needed,
  rather than treating either measured revision or newest launch as the anchor.
  A launch has one immutable captured landing, which may be an earlier Trunk
  Mode increment. If the Done endpoint has no matching retained observation,
  keep its explicit collection gap and earlier retained history; do not
  manufacture a captured landing or acquire the missing endpoint on browsing.

No start-blocking dependency is recorded: independent scope/proof work can
start under this shared direction, and published owners can be reconciled at
integration. Shared files and delivery ordering alone do not establish that
the consumer cannot start before supplier completion. This does not authorize
duplicate work or writes over another active owner's changes.

The common rule is one measured attempt with one validated proof summary (or
gap), projected onto an evidenced scope. Entry, folder and file are selections
of that rule; provenance and completeness are states of it. Do not store a
competing series for every scope or add a historical file-identity framework.

## Outside-in proof ownership

New history behavior needs new failing-first proof. The existing checks below
establish reusable parsing/classification, not the new story journey. An
end-to-end fixture must submit the landing/Done inputs and serve real collected
summary bytes through FakeGitHub or the adapter; injecting a ready-made history
answer cannot prove collection, retention or the no-acquisition promise.

| Source promise | Owner and observable proof |
| --- | --- |
| Entry history through the selected landing, measured count/span, measured zero, links and selected marker; omit later unrelated landings | Slice 1: new integrated Done-story entry-history journey, using at least three distinguishable landings/times and selecting the middle one. Include preparation/execution/later-publication receipts sharing the same story identity and assert the published Done endpoint is the anchor, not identity/newest receipt. Assert rendered dates/values and source links. |
| Background acquisition of validated summaries/reasons without Intent open; use one shared collection/store owner | Slice 1: submit Done with the view closed; await the stored proof observation at the real boundary before opening. Reject a mismatched proof identity and display its gap. |
| Compatible historical segments with missing terminal proof or changed entry/unit | Slice 1 owns the common rule at entry scope: keep earlier supported observations and a labelled terminal gap; name units and never join incompatible signatures. Slice 2 reuses and proves the rule at folder/file scope. |
| Folder/file history, all published files, matching entry/path/unit, measured/partial/no-breakdown/absent scope distinctions | Slice 2: real artifact-to-Summary-to-file journey and focused projection checks; assert known independent sums, a hidden-in-tree contributor, zero and named gaps. With selected proof absent, earlier supported segments stay readable with named units and no join across incompatible units/owners. |
| Retain existing comparison, Purpose/Proof, story/reading context and independent local-read failure/retry | Slices 1–2: exercise enclosing comparison text/rows, change scope, visit Purpose and return, then fail/retry history alone; other proof and selection survive. |
| Exact/equivalent/later-build provenance; one attempt once; selected cancelled landing can have a later terminal measurement | Slice 1: real shared-build collection and scoped read, with unrelated later landing excluded. Assert represented and measured revisions/date, later-changes wording and one point; reuse supplier proof for unchanged resolution. |
| Validated adapter proof; retained-window/expired/unavailable/failed/empty states | Slice 1: acquisition/projection boundary cases exercise the same retained-attempt rule; observe an adapter payload and its shown entry reading. No browser fetch substitutes for missed collection. |
| Restart/duplicate Done/pending resume and existing-landings backfill | Slice 3: isolated store/server lifecycle with observable collection completion and independent expected records. The persisted proof payload, not merely the wall-time record, survives and is read by a scope. |
| Delivered final wall-time records acquire proof; retention stays at 20 measured builds | Slices 1 and 3: begin with an existing final build lacking stored proof and acquire its validated summary without re-resolving the landing. At the 21st distinct measured build, proof and landing references evict together; an evicted Done endpoint explains unavailable history. Shared attempts count once and gaps do not spend build slots. |
| Browsing/revisiting/restart history acquires no upstream evidence; keyboard/phone/colour-independent evidence | All slices: finish or explicitly account for enclosing comparison/endpoint reads first; then count FakeGitHub/adapter operations while opening/changing/revisiting history. Repeat that boundary after restart while allowing unchanged live comparison recovery. Assert readable evidence and keyboard navigation at narrow width; no colour-only meaning. |

Test data uses the shared MakeMe API
([test data architecture](../../../tests/README.md#test-data-architecture)).
Extend `makeMe.aCiProofEntry` for canonical file breakdown, missing parts and
untimed results; keep case-driving facts explicit at call sites. Reuse landing,
launch, CI run and adapter-attempt builders and shared scenario builders rather
than adding test-local parallel domain factories. Keep actions, independent
expected sums and bytes whose exact format is under test outside the builder.

## Ordered slices

### 1. Read collected entry timing through a Done story's landing

Type: Behavior
Status: planned
Proof: An integrated Done-story entry-history journey through the real
collector/store, authenticated read and rendered Summary, plus focused
identity/read contract checks.

Behavior: Given complete exact-build proof for three recorded landings and a
Done story at the middle one, background collection with Intent closed retains
each validated attempt summary. Opening the story's entry Summary shows the
retained readings through that landing, the selected marker, actual count/span
and linked build evidence, beside the existing comparison. An entry-only
summary can supply its entry total. Zero remains measured. Missing or invalid
proof is already an explained gap; no misleading interim number is delivered.
Opening/revisiting the history adds no provider call. A local read failure and
retry preserve the comparison and story and affect only the history.

Anchor to the published Done endpoint and exact matching retained landing,
including when several receipts share a story identity. If the endpoint was
not collected, mark that gap beside available preceding history. Reused
equivalent builds share a point; a cancelled selected landing may end at its
labelled later measured build/date while omitting subsequent unrelated landing
points. Include the common validated CI adapter reader and failed/expired/
outside-retention/empty boundaries in this same acquisition-to-projection loop.
All apply the supplier's existing resolution, not a new history resolver.

The selected source pins the scope path; each retained summary supplies its
owning proof entry and observed unit. Show compatible contiguous entry/path/unit
segments with their units named, breaking at unsupported changes. Missing
terminal proof remains a gap beside earlier supported entry observations; it
does not require discarding them or choosing an identity from current trunk.
Own this common rule here before slice 2 applies it to folders and files.

Extend the existing collection/store and authenticated history owner with
attempt proof, then derive entry readings from retained observations. Its
current `intent=ci-history` response carries project wall-time entries only;
extend that owner for the selected endpoint and scoped local reading rather
than assuming it already carries retained proof. Acquire missing proof for
already-final retained build attempts as well as newly resolved ones. Do not
reopen or overwrite a final landing resolution to attach proof. Keep retention
bounded by the newest 20 measured builds, including shared-build references
and intervening/trailing gaps. Do not change the live proof reader's freshness
contract. Include the readable evidence list and keyboard/narrow presentation
in this same vertical slice.

### 2. Follow that history into a folder and file's Proof

Type: Behavior
Status: planned
Proof: An artifact-to-folder-to-file browser journey, a partial/no-breakdown
variation, and focused evidenced-scope matching checks.

Behavior: Given the retained attempt summaries from slice 1, opening a folder
Summary or file Proof shows that scope's cumulative execution times without
another CI read. A folder includes every published descendant's contribution,
including files the visible tree omits. A complete zero appears as 0 ms. Missing
parts, untimed results, no breakdown, no matching path and changed entry/unit
show distinct gaps with no plotted partial lower bound. Unsupported former
paths stay gaps; a folder's changing membership is an observed scope at each
build. The developer can move between Summary, file Proof and Purpose and back
without replacing the selected story, source context or existing comparison.

Use the same timing projection rather than adding independent folder/file
series. Existing baseline rename mapping remains limited to that comparison;
the history gains no inferred rename chain. Retain proof's independent
unavailability feedback and existing live CI recovery.

The selected source pins the scope path. Each summary supplies its owning proof
entry and observed unit; contiguous supported entry/path/unit segments can be shown with
that unit named. When selected proof has no usable unit, preserve those earlier
segments and the terminal gap without choosing a unit from current trunk.
Break the line at unsupported ownership/unit changes rather than silently
joining different scope signatures. Existing evidence for the terminal point
does not become a prerequisite for reading earlier valid observations.

### 3. Resume collected scope proof after interruption or restart

Type: Behavior
Status: planned
Proof: Isolated collector/server restart, pending-resume, backfill and
duplicate-report journeys read the persisted proof back through the public
history boundary and shown scope.

Behavior: Given retained landings while CI/proof is pending or temporarily
unavailable, collection can resume after restart and duplicate Done delivery
without duplicating the measured attempt. Previously recorded landings,
including final wall-time observations created before proof retention existed,
acquire available proof through background rebuilding; interrupted proof
acquisition resumes or records its actual unavailable reason. After restart,
the history reads the retained proof, not only its wall time, without acquiring
it during browsing.
Available observations remain readable beside gaps. Compare operation counts
only after separately establishing/accounting for unchanged live comparison
reads so their legitimate recovery cannot mask or violate this boundary.

Exercise the supplier's existing store locking and lifecycle with
the added proof payload rather than creating special resolution paths. Confirm
one summary per measured attempt, independent scope completeness, and bounded
retention of proof and represented landing references together. Exercise the
21st distinct measured build evicting the oldest proof and its unshared
landing, while several landings on one retained attempt keep one summary.
Show an older selected Done story as outside retained history, with no fetch
to extend its span. Reuse already
sufficient supplier proof for unchanged resolution behavior; add observations
for the proof payload and scoped-history effect.

## Verification and delivery gates

Use the installed execution workflow for source review, independent post-change
refactoring, affected-consumer trace, focused proof, agent commits and CI repair.
New proofs fail with history behavior disabled before their implementation is
accepted. Inspect enclosing UI assertions, accessibility names, aggregate text,
shared evidence providers, authenticated-read rules and fixture consumers when
their contract changes. Run their affected suites when the focused-check cost
permits; add consumers outside those suites. Update maintained Intent/CI
documentation with the shipped behavior.

Local gate: focused new history boundary/journey specs and the affected existing
scope/comparison and proof-reader checks, then `npm run typecheck:dashboard` and
the checkout's applicable lint/format hooks. Start long runs fully awake; on AC
use `caffeinate -s -i`; on battery plug in or use `caffeinate -i` with lid open
and inspect the sleep log, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use Homebrew Bash 5 first on PATH for shell checks. A full repository/dashboard
run is not a routine local gate for this bounded change; hosted CI remains
owned through the applicable final result. Inspect host load/memory and
competing work before expensive verification, sequence heavy work or reduce
workers while preserving coverage, and reconsider after contention/failure.

Focused commands, extending paths with the new capability-named specs:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/dashboard-ci-proof-read.test.mjs tests/support/dashboard-ci-proof-breakdown-read.test.mjs tests/support/dashboard-ci-proof-parse.test.mjs tests/support/dashboard-ci-comparison-entries.test.mjs tests/support/intent-ci-proof-timing.test.mjs tests/support/intent-scope-proof.test.mjs
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts --workers=1
npm run typecheck:dashboard
```

The first command preserves parsing/classification consumers, and the second
preserves the enclosing comparison/scoped reading journeys; neither replaces
the new collector-to-rendered-history proof. Select additional provenance,
adapter and read-lifecycle suites from actual changed consumers at execution.

Follow [the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every failing or flaky test and published CI. This includes failures on the
base, preserving another active repair owner's files, and the exact scope of
human exceptions. Never rerun until green as a fix. Use controlled clocks or
observable events, never sleeps or `test.slow()`. Keep default timeouts; any
essential override belongs only in its individual test.

## Decisive premises and observed results

Observed in this owned worktree at `ecd07dc8ae0467f51b9fe28d0001d6558804428e`
on 2026-11-09. `npm ci --ignore-scripts --no-audit --no-fund` succeeded.

| Premise / consuming operation | Observation in the consuming form/profile | Result and remainder |
| --- | --- | --- |
| Existing timing rules consume complete, partial and zero proof at entry/folder/file scopes | The MakeMe-based `node --input-type=module` probe below, in this checkout | Complete entry/folder 1200 ms; zero file measured 0; missing part partial; entry-only file no-breakdown; absent and former path absent. No history or cross-build matching is claimed by this observation. |
| Artifact contract and current scope consumers execute locally | The named shell commands above, run as a four-file proof-read/comparison group and a two-file timing/scope group | Both exit 0 under the quiet-pass rule. They establish current parsing/aggregation behavior, not discrimination of new history behavior; every new journey owns failing-first proof. |
| Selected Done story and scoped reading have an available isolated proof route | `npm run test:dashboard -- --list tests/intent/intent-summary-story-comparison.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-ci-proof-gaps.spec.ts` in this checkout | Exit 0. This settles runner selection/imports only. Existing `dashboardTest.ts` uses loopback FakeGitHub and isolated server/store profiles; actual new history journeys remain slice work, not accepted preparation proof. |
| Current retained cache could supply historical summaries across restart | Read-only JSON-envelope scan of `~/.open-dough/dashboard/retained-answers` and trace of `performIntentCiProofRead` through the artifact/adapter consumers | False: 8,449 envelopes, zero proof-summary payloads; readers remember summaries in process only. Slices 1 and 3 own retention rather than assuming it exists. Production store was not changed. |
| History/Done-source integration can reuse delivered owners | Initial preparation read plans 551/550; amendment at `0c32a9335` read maintained Intent CI status/story docs and the delivered collector, store, observation schema, window and local reader | Delivered wall-time owner exists; `measuredWindow` is 20, stored builds have no proof payload, and final landing resolution suppresses subsequent resolution. Slices 1/3 must add independent attempt-proof backfill for retained final builds. This is a source/contract observation, not execution proof of the extension. |

Consuming timing probe (base entry/file facts came from shared MakeMe; its
current builder lacks breakdown/partial setters, which permanent tests extend):

```sh
node --input-type=module <<'NODE'
import { makeMe } from './tests/support/makeMe.mjs';
import { entryTimingOf, scopeTimingOf } from './dashboard/src/ciProofTiming.ts';
import { owningEntryOf, scopeFiguresOf } from './dashboard/src/ciScopeProof.ts';
import { scopeEndpointTimingOf } from './dashboard/src/ciScopeComparisonTiming.ts';
const entry = makeMe.aCiProofEntry.at('tests').counting(2).timed(1200).please();
const complete = {...entry, parts:entry.parts.map(part=>({...part,breakdown:true})), files:[{...makeMe.aCiProofEntry.at('tests/folder/a.sh').counting(1).timed(1200).please(),durationMs:1200},{...makeMe.aCiProofEntry.at('tests/folder/zero.sh').counting(1).timed(0).please(),durationMs:0}]};
const partial={...complete,parts:[...complete.parts,{part:2,status:'missing'}]};
const noBreakdown=makeMe.aCiProofEntry.at('tests').counting(2).timed(1200).please();
const endpoint=of=>({kind:'summary',entries:[of]});
console.log(JSON.stringify({completeEntry:entryTimingOf(complete),completeFolder:scopeTimingOf(complete,scopeFiguresOf(complete,'tests/folder')),measuredZero:scopeEndpointTimingOf(endpoint(complete),'tests/folder/zero.sh'),partial:scopeEndpointTimingOf(endpoint(partial),'tests/folder/a.sh'),noBreakdown:scopeEndpointTimingOf(endpoint(noBreakdown),'tests/folder/a.sh'),absent:scopeEndpointTimingOf(endpoint(complete),'tests/folder/absent.sh'),renamedOldPath:scopeEndpointTimingOf(endpoint(complete),'tests/old/a.sh'),owning:owningEntryOf([complete],'tests/folder')?.path},null,2));
NODE
```

All observations were read-only or isolated execution in this owned checkout;
no product scratch edits remain. The host was on AC with 48 GiB physical memory
and load averages about 35/24/19 at 11:28 local time. Only focused shell checks
and list-only browser selection ran; no full suite or live CI acquisition was
launched. Recheck current headroom before actual browser journeys.

## Current decisions

- Keep the delivered newest-20-measured-build cohort through the selected landing;
  it may span only about a day on this project, not the Done list's 30 days.
  A cancelled landing's later measured build is the labelled endpoint exception,
  not a reason to include subsequent unrelated landings. Older evicted history is
  explicitly unavailable; no new retention/window promise is added.
- Keep represented landing identity separate from measured revision/attempt.
  Share equivalent measurements once and expose later-build provenance.
- Match supported entry/path/unit evidence. Do not infer rename continuity or
  causal attribution. Folder timing is its observed membership at each build.
- Collect validated proof once per measured attempt through existing readers;
  backfill retained final builds independently of landing resolution, and
  project bounded retention applies to proof too. History reads never acquire
  upstream data. Do not change live proof refresh/recovery semantics.
- Source pinning and project wall-time history keep their established owners;
  this story owns retaining and presenting test-scope history.
- `SEED-288#refresh-pending-landed-evidence` queues sharing the history's
  pending/final judgment with Done comparison; `SEED-288#reuse-adapter-equivalent-timing`
  queues adapter skip wall-time reuse without test proof. Neither is assumed
  delivered here, and neither supplies missing scoped proof. Reconcile their
  published outcomes if they land before integration; no start dependency is
  created by this amendment.

## Preparation review

Slice-plan refinement ran in place after independent review. Retain slices 1
and 2; split the third boundary's independent concerns by moving provenance,
provider and window cases into slice 1's acquisition/projection loop, leaving
slice 3 solely proof-retention resumption. Clarify exact Done endpoint matching,
usable historical segments with missing terminal proof, and the no-acquisition
observation boundary. Three Behavior slices remain, with no sizing exception
or story-resplit recommendation. Each includes implementation, proof and local
cleanup, with
usable preceding behavior and no CI-breaking interim state. They exercise one
attempt/scope model rather than accumulating recognizers; no speculative
Structure slice is needed. No numeric slice target or hard limit is configured;
boundedness follows these proof loops and the existing collector/read owners.
No remaining slice-specific concern was identified within this reviewed source
and the explicitly planned supplier contracts. A changed delivered owner or
unsupported continuity claim requires reassessment before dependent work.
Execution, Take and release publication are not authorized by this plan.

### Delivered-history amendment — 2026-11-09

Terry requested this follow-up directly on main. Reconcile the delivered
history at `0c32a9335`, replace removed design links, and keep all three
Behavior slices and existing proof ownership. The 20-build window is explicit;
this amendment adds no larger-retention promise. Slice 1 owns proof acquisition
for final retained builds; slice 3 owns its backfill/restart/eviction proof.
Retain all three boundaries: each still closes its existing reading or recovery
loop. No slice replacement, sizing exception or resplit is needed. Execution
remains with the existing Taken owner; this maintenance does not implement it.
