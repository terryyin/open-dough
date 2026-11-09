# Design and preparation evidence

[Executable plan and current status](PLAN.md).

The following planning and preparation records retain their original observations.
References to the commands above use the [plan verification gates](PLAN.md#verification-and-delivery-gates).

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
