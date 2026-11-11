# Show trunk test scope timing history

**Identity:** SEED-310#show-trunk-test-scope-timing-history

**Source:** [Refined story](../../seeds/SEED-310-trunk-test-scope-timing-history.md#show-trunk-test-scope-timing-history)

**Source review:** [Source-only commitments](source-review.md)

## Goal and scope

Show dated cumulative test execution time in Project Intent's entry/folder
Summary and file Proof, with no selected story required. Use the last observed
configured-trunk head as the endpoint and expose its observation freshness and
any collection gap. Preserve a Done story's exact published endpoint and its
reading context across Project Intent visits. Follow the source's six examples.

Reuse retained evidence and the common scope/endpoint calculations, chart and
read lifecycle. Keep declared units, owning entry/path identity, segments,
provenance, build links, prior-build references, measured zero and missing-data
explanations intact. Local reads and retry acquire no historical CI proof.
No collector, store, retention, statistical rule, rename inference, regression
alert, benchmark or Taken-story history is added. No execution is authorized by
this preparation.

## Existing solution and architectural direction

- PFE: `intentCiHistoryRead.ts` already accepts safe scope + pinned revision/date
  without story identity; `ciScopeHistory.ts` owns totals, units, compatibility,
  deduplication and references. `ciHistoryEndpoint.ts` owns the ancestry cohort
  and unavailable endpoint states. Reuse these directly rather than add a
  Project-specific read path or projector.
- `IntentScopeProof.tsx` and `IntentFileProof.tsx` already mount the same
  `IntentScopeTimingHistory`. Change its Done-only admission and shared context
  wording. `useIntentCiScopeHistory` delegates to `useIntentCiEndpointHistory`,
  which owns cancellation, key isolation, matching retained answers and retry.
  Its existing `checkedAgain` input is the seam for same-endpoint refresh.
- `IntentPerspective.tsx` already separates project and story evidence owners.
  The project owner receives `selectedIdentity={undefined}`. `intentCiTarget.ts`
  selects `source.ref` and observed `work.revision`; `work.retrievedAt` supplies
  observation time. Never substitute `judged.shown.revision`: CI can describe an
  older measured ancestor. Name history's endpoint beside its evidence even
  while the source browser retains an older reading behind **Show latest**.
- Supply endpoint/context meaning once to the common view, unit chart and
  evidence rows. Keep Done wording and exact landing semantics unchanged. The
  context controls endpoint and labels; it does not own timing arithmetic.
- Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
  [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
  and [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  constrain distinct project/story/evidence meanings and one coherent domain
  representation. The ADR index agrees with record statuses; no relevant
  supersession or conflict was found. The [architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  supports reuse of the local authenticated boundary. The [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md#one-intent-workspace-from-project-to-file)
  already distinguishes the project's published revision from the Done landing.
  No new North Star topic or ADR is needed.

## Outside-in proof ownership

| Source promise | Owner and observable proof |
| --- | --- |
| Entry, nested folder and file histories without a story; configured trunk | 1: integrated Project Intent navigation using real collection, exact scope values, branch/revision labels, dates and build links; a focused non-main configuration variant. |
| Shared units, zero, gaps, identity, provenance and references; no historical acquisition | 1: preserve existing scope history rule/journey checks; new Project journey observes complete values and a gap, with historical proof-call counts unchanged after navigation and retry. |
| Empty/read failure/retry with other Proof usable | 1: Project UI recovery check plus real collected-store corruption/recovery pattern. Distinguish absent store from unreadable store. |
| Freshness on show, new head and Check again; no time-only reads; stale replies cannot cross keys | 2: controlled-clock/event-driven browser scenario counts local reads, holds/releases responses, changes collected evidence at the same head, then advances observed trunk. |
| Project visit while Done selected, return to exact landing and reading context | 2: real collected history with a middle Done endpoint and later trunk observation; visit/return preserves selected test and reading place, with newer observations only in Project Intent. |
| Current CI wall time and Done prior-build behavior preserved | 1 and 2: existing affected scope-reference and project CI lifecycle consumers; no change to statistical or wall-time rules. |

## Decisive premises and observations

Observations are from this owned checkout at `cc684f84ee3578df05bbd0c6fdcd2d6dfa119854`
on 2026-11-11. Preparation scratch edits are reverted before recording.

| Premise and consuming operation | Observation/result and remainder |
| --- | --- |
| Pinned scope reads accept a project endpoint and remain local | `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/dashboard-ci-scope-history-read.test.mjs tests/support/intent-ci-scope-history-cohort.test.mjs` passed through the maintained runner (1.51 s). Actual request parsing, response identity/refusal and local reads under upstream rate limit were exercised; no story identity is required. |
| An uncollected endpoint retains only independently evidenced preceding observations | Same command passed the missing/empty/evicted/order cases. Scratch predicate `<= end` → `>= 0` in `ciHistoryEndpoint.ts` caused all three cohort checks to fail; one result wrongly included `[100,200,300]` instead of `[100,200]`. Restoring it passed 3/3. Diagnostic command: `node --experimental-transform-types --test tests/support/intent-ci-scope-history-cohort.test.mjs`. |
| The normal browser proof route reaches collector-acquired timing in Summary | `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts --workers=1` passed after documented local prerequisite setup. A scratch `return null` in `IntentScopeTimingHistory` failed the same check at `scopeHistoryCollectedPage.ts:56`, missing the history region/selected landing. Exact restoration passed the same strict command, exit 0; the source diff was empty. This observes current Done integration; the new Project scenarios remain implementation proof owned by the slices. |
| Configured trunk and observed head are available without a new source | A read-only `node --experimental-transform-types --input-type=module` observation invoked real `ciTargetOf` with `makeMe.aPublishedSource.with({ref: 'trunk'})`, `aPublishedWork` revision `a` × 40 and retrievedAt `2026-11-11T07:00:00Z`, and no selected identity. It returned `{kind:'judged',branch:'trunk',head:'aaaa…'}` and preserved the exact observation timestamp. `caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-project-visit-ci.spec.ts --workers=1` passed. Scratch project-target `head: work?.revision` → `head: undefined` failed at line 74: expected three trunk CI requests after observed advancement, got none. Exact restoration passed the same command, exit 0, with empty source diff. This reaches the separate provider → target → judgment consumer; new history use remains slice proof. |
| Native runner prerequisites are available in this checkout | `node scripts/setup-native.mjs npm` and `node scripts/setup-native.mjs check` passed, with Chromium 153.0.8010.12. Node checks require the documented Bash 5 PATH; unprefixed macOS Bash 3.2 refused before checks. No lockfile change. |

## Ordered slices

### 1. Read Project Intent scope history at its observed trunk endpoint
Type: Behavior
Status: done

Behavior: Project Intent has observed a configured-trunk revision and retained
build evidence → the developer opens entry/nested folder Summary or file Proof
with no story selected → the common history displays the right scope, dated
values/units and links through that endpoint, explicitly identifying gaps and
endpoint freshness. Empty or failed local reads preserve other Proof and offer
applicable retry. Browsing/retry performs no historical proof acquisition.

Extend the existing evidence owner, scope view and endpoint lifecycle with the
project endpoint and common context wording. Keep existing Done endpoint,
references and labels. Reuse MakeMe domain builders (`aPublishedSource`,
`aPublishedWork`, `aCiProof`, `aCiProofEntry`, `aLaunchLanding`, `aLaunchRecord`,
`aCiRun`, `aCiScopeHistory`) and real collection helpers; do not inject projected
history into the integrated collection proof. Use frontend-only or boundary
proof for detailed formatting/refusal variants. Avoid copying charts per scope.

Proof: add `dashboard/tests/intent/intent-project-scope-timing-history.spec.ts`
with real collection → Project Intent entry/folder/file navigation and dated
values (the file example is 8 s, 11 s, 9 s). Include an uncollected endpoint,
missing/partial evidence, a measured zero and explicit branch/revision coverage
at the cheapest sufficient boundaries. Keep keyboard/phone evidence readable.
Run that spec, the existing collected timing/file/gap specs and the affected
`intent-scope-timing-history-*` / `intent-scope-prior-build-*` specs through
`npm run test:dashboard -- <explicit paths> --workers=1`, plus the named Node
reader/cohort command above. Record exact final paths in accepted proof.

Interim behavior: explicit history retry and endpoint-key changes work; complete
same-head **Check again**/visit lifecycle proof belongs to slice 2. It is not a
remaining source-scope decision or an execution-complete claim.

### 2. Keep project history fresh and separate from the selected Done story
Type: Behavior
Status: done

Behavior: A Done story ends at a middle landing while newer trunk evidence is
collected → the developer visits Project Intent and returns → project history
uses its observed trunk endpoint and returning restores the exact Done series,
selected test and reading place. With Project Intent showing, **Check again**
can reveal newly collected evidence at the same head, a new observed head changes
its endpoint, and advancing only a controlled clock issues no history read.
Failed refreshes and late replies cannot relabel older/other-key answers as
fresh current evidence.

Reuse project CI judgment rounds for local scope refresh where the lifecycle
matches. Extend the existing endpoint read lifecycle, rather than add polling or
an upstream refresh mechanism. Preserve Done readiness/retained-route behavior
and the CI wall-time read's current meaning and cadence. Update the lasting
scope-history contract for Project Intent.
Keep endpoint observation time stable for an unchanged revision: a periodic
snapshot's newer retrieval timestamp must not manufacture a new endpoint/read.
Keep trunk observation freshness distinct from when local history last answered;
**Check again** refreshes the latter even if the endpoint key is unchanged.

Proof: add `dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts`
for the visit/return and event/controlled-clock transitions. Assert request
endpoint identities, exact cohort differences and same-head evidence refresh;
include a held old response and failed matching refresh at the cheaper frontend
boundary if that avoids repeating real collection. Run it with slice 1's new
Project journey, `intent-project-visit-ci.spec.ts`,
`intent-ci-wall-time-history-pending.spec.ts` and
`intent-ci-done-endpoint-readiness.spec.ts`. Include remaining consumers identified
by the actual diff's consumer trace, especially whole-summary text and request
counts that now include Project scope history.

## Gates and current decisions

- Follow [the project's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written, including failures on base and published CI. Another active exact
  repair owner is a coordination boundary; preserve that owner's files.
- Run proof through the maintained runners per [tests/README](../../../tests/README.md)
  and [Dashboard tests](../../../dashboard/tests/README.md). Use shared MakeMe
  for domain arrangements; no sleeps, `test.slow()`, or suite/hook timeout
  overrides. Retain only essential existing individual timeout exceptions.
- Local gate: use the [maintained macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
  start fully awake; on AC wrap long runs with `caffeinate -s -i`. On battery
  plug in, or keep the lid open under `caffeinate -i` and inspect sleep logs.
  Choose one worker for focused browser checks on this shared host; recheck
  load/memory and competing work before expensive proof. Preparation observed
  AC/100%, 16 logical CPUs, load 12.08/8.02/8.10 with another busy Node process;
  this is historical evidence, not headroom authority for execution.
- Trace changed output/contracts through unchanged consumers and run the
  [consumer-trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for the actual implementation diff. Preserve adequate current proof; no full
  suite is prescribed locally merely because CI has one.
- After each slice apply independent post-change refactoring, focused tests,
  typecheck/lint for affected code, agent commit and managed delivery/CI repair
  under Execute Plan. Expected edited owners are currently below 250 lines:
  evidence provider 238, perspective 245, scope view 116, unit view 105,
  evidence rows 77, reader 182 and projector 195. Existing collected entry/file
  specs are 236/230; add cohesive new Project specs rather than enlarge those
  indiscriminately. If a changed owner crosses 250, split its implicated
  responsibility coherently; context/retained-provider vs live reading is a
  candidate seam, with existing callers and Done proof preserved in slice 1.
- Slice sizing uses one observable proof loop per slice, including cleanup and
  focused verification. No project-specific numeric target/hard limit was found;
  apply the [shared sizing/escalation rule](../../../.agents/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices).
  Both slices extend one endpoint/context rule; no preparatory framework or
  separate entry/folder/file implementations are justified.
- Preserve source Goal/Scope and this plan until retrospective and Story Wrap
  Up. Preparation landing neither Takes this queued story nor starts execution.

## Story obligations

### G1. Complete same-endpoint freshness and visit/return lifecycle
Reported: slice 1 — "Full same-head refresh/stable timestamp/visit-return remains slice2."
Story clause: "Follow the existing CI-status observation lifecycle: showing Project Intent, observing a new trunk head, and Check again can refresh the local history; elapsed time alone does not."
Disposition: proved by slice 2: slice-2-proof.md frontend refresh/remount and actual Project/Done visit/return observations

### G2. Preserve recovery and all-gap proof under the default timeout
Reported: slice 1 — "Two existing supplemental UI specs exceed default30s before their history assertion because each constructs/publishes a full Done Git history and acquires comparison proofs."
Story clause: "A failed history read offers its own Retry history while other Proof stays usable. An empty collection explains what is absent."
Disposition: proved by slice 1: slice-1-proof.md preserves original failed verdicts, diagnosed setup/event causes and final passing moved frontend history/default consumer commands

### G3. Preserve separate-unit proof under the default timeout
Reported: slice 1 — "Units exhausted30s during unrelated Recently done Board navigation. All share expensive real Done publication for synthetic UI-only history."
Story clause: "Preserve declared test-case and test-file units separately"
Disposition: proved by slice 1: slice-1-proof.md preserves original failed verdicts, diagnosed setup/event causes and final passing moved frontend history/default consumer commands

### G4. Repair direct default reference consumers
Reported: slice 1 — "intent-ci-done-prior-build timed out30s before CI entry comparison table line87; intent-ci-follow-up failed its5s poll for scenario.repeatCalls after ingestion line42."
Story clause: "CI status continues to describe CI wall time."
Disposition: proved by slice 1: slice-1-proof.md preserves original failed verdicts, diagnosed setup/event causes and final passing moved frontend history/default consumer commands

### G5. Observe retained-answer isolation after the old reply settles
Reported: slice 2 — "Coordinator inspection found late-reply assertions can pass before the released old handler fulfills; scope/project isolation also needs an observing boundary for the changed retained hook."
Story clause: "another project, scope or endpoint's answer never appears as the current one."
Disposition: proved by slice 2: slice-2-proof.md awaited late replies and scope/project/configuration failure observations; paired real collector default-timeout repair proof

### G6. Keep the Project collection journey stable under the default timeout
Reported: slice 2 — "The new remount case and other seven current Project lifecycle/isolation paths passed, but slice1’s existing Project collector journey hit default30s during nested history rows under host load23. Its setup still launches/lands an extra native session and starts a preview collector before restarting preview."
Story clause: "With no selected story, a developer opens entry Summary, nested folder Summary and file Proof"
Disposition: proved by slice 2: slice-2-proof.md awaited late replies and scope/project/configuration failure observations; paired real collector default-timeout repair proof

## Execution context



[Checkout, preparation, observation and proof decisions](execution-context.md).

## Slice 1 acceptance

[Literal commands, setup, observations and repair evidence](slice-1-proof.md).
Source freshness unchanged at trunk `8299f4e64f49939e1d6120390ebd0b44a0532328`;
no named sibling coordination references. Product, MakeMe setup and observing
assertions inspected; original failure verdicts retained, repaired cases proved
under default timeout. G1 remains with slice 2. Independent refactor completed; affected proof passed.

## Slice 2 acceptance

[Commands, observations, lifetime rationale and repairs](slice-2-proof.md). Source
freshness unchanged at `31f14719b1ab8330680ee2e7fefdf9742b242746`; no named
sibling coordination references. Source commitments and actual assertions inspected;
G1/G5/G6 settled. Independent refactor completed; affected proof passed.

## Plan review and learnings

Slice-plan refinement was not needed: two cohesive Behavior slices separate the
initial readable history/recovery outcome from its refresh/context-transition
proof loop, using one shared model. No remaining slice-specific concern was
identified in this construction review. New Project behavior is future slice
proof, not a claim made by the preparation's baseline observations.
