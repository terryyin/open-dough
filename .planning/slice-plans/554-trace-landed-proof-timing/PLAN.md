# Trace a Done story's timing history into test Proof

**Source:** [Trace a Done story's timing history into test Proof](../../seeds/SEED-285-landed-ci-timing-history.md#trace-landed-proof-timing)

**Source review:** [Independent source commitments](source-review.md)

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

## Architecture and proof context

Use the existing collection/store, validated proof readers, scoped timing rules
and published Done endpoint owners. Keep one attempt/proof model and one
shared scoped projection. The [architecture/PFE and outside-in proof allocation](design-and-preparation.md)
retain the applicable Accepted ADRs, owner boundaries and preparation evidence.

## Ordered slices

### 1. Read collected entry timing through a Done story's landing

Type: Behavior
Status: done
Proof: An integrated Done-story entry-history journey through the real
collector/store, authenticated read and rendered Summary, plus focused
identity/read contract checks.

Behavior: Acquire missing proof for final retained attempts without reopening
landing resolution; retain validated proof and show timing through the exact
published Done endpoint. Keep the bounded shared cohort, one point per build,
exact/equivalent/later provenance, compatible entry/path/unit segments, zero and
explicit gaps. Local history reading and retry preserve story, comparison and
live-proof lifecycle, with readable keyboard/narrow evidence and no acquisition.
Keep declared case/file readings separate on one build observation; never sum or
prefer a unit. [Published unit-contract reconciliation](trunk-reconciliation.md)
governs the changed input contract and renewal of affected proof.

### 2. Follow that history into a folder and file's Proof

Type: Behavior
Status: planned
Proof: An artifact-to-folder-to-file browser journey, a partial/no-breakdown
variation, and focused evidenced-scope matching checks.

Behavior: Reuse the common projection for folder Summary and file Proof. Count
all published descendants, including hidden files; preserve zero, distinct gaps,
entry/path/unit matching and earlier supported segments without inferred rename
continuity. Scope and Purpose/Proof navigation retain story/source/comparison
and acquire no CI evidence.

### 3. Resume collected scope proof after interruption or restart

Type: Behavior
Status: planned
Proof: Isolated collector/server restart, pending-resume, backfill and
duplicate-report journeys read the persisted proof back through the public
history boundary and shown scope.

Behavior: Resume pending or temporarily unavailable proof after interruption,
restart and duplicate Done delivery; backfill retained landings while evidence
remains available. Retain one summary/attempt and bounded proof/references using
the existing lifecycle. Scope reading after restart uses persisted proof and
adds no acquisition; separately account for unchanged live comparison reads.

## Verification and delivery gates

Use the installed execution workflow, independent refactor, consumer trace,
focused proof and agent commits. New proofs must fail with history disabled.
Cover enclosing UI, shared providers and read rules after contract changes;
update maintained Intent/CI documentation.

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

Follow [the project's failure policy as written](../../../AGENTS.md#failing-and-flaky-tests)
for every failing or flaky test and published CI. This includes failures on the
base, preserving another active repair owner's files, and the exact scope of
human exceptions. Never rerun until green as a fix. Use controlled clocks or
observable events, never sleeps or `test.slow()`. Keep default timeouts; any
essential override belongs only in its individual test.

## Current decisions

- Keep newest20distinct measured builds through the selected landing, potentially
  about one day rather than the Done list’s30days. Label a cancelled landing’s
  later build; omit unrelated later landings and explain evicted history.
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
- [Queued evidence follow-ups](trunk-reconciliation.md#queued-evidence-follow-ups)
  supply no missing proof or dependency; reconcile their published outcomes.

## Execution evidence

- [Execution identity, supplier integrations, CI observer and final reporting](execution-context.md).
- [Slice 1 acceptance, reconciliation and ordering correction](slice-1-acceptance.md).
- [Complete slice designs and next-slice proof routes](slice-design.md).
- [Final independent refactor and mechanical gates](refactor-slice-1-final.md).
- [Latest supplier reconciliation and proof](consumer-trace-slice-1-supplier-final.md).
- [Approved source-link resolution](source-conflict.md); [resume context](resume-handoff.md).
- Consumer records: [initial](consumer-trace-slice-1.md), [reconciliation](consumer-trace-slice-1-reconciliation.md), [G10](consumer-trace-slice-1-g10.md), [G11](consumer-trace-slice-1-g11.md).

## Story obligations

### G1. Pending collection must not become a permanent no-build gap
Reported: slice 1 — "Independent technical review found that integrated supplier 551 keeps a no-build none result as final; a Done nudge before CI exists can prevent later measurement. Supplier 551 slice 2 explicitly owns that correction."
Story clause: "They break the line and show no numeric substitute or partial lower bound."
Disposition: proved by slice 1: dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts pending attempt 51/2 and delivered landed-ci-history-pending.spec.ts three lifecycle cases; intent-scope-timing-history-reading.spec.ts pending run link, zero measured builds, no ms/build label, keyboard and comparison retention

### G2. Reconcile supplier provenance and bounded retention before acceptance
Reported: slice 1 — "Independent technical review found integrated supplier 551 supports exact-only points and has no bounded store pruning; its remaining slices own gaps/provenance and retention. Scope history must consume their delivered contract rather than duplicate the resolver/window lifecycle."
Story clause: "Reuse the project history's Landed resolution and one-point-per-build rule."
Disposition: proved by slice 1: consumer-trace-slice-1-final-reconciliation.md — published supplier6f5 reconciled in shared owners; actual21st atomic retention/public same-cohort/outside-retention, mixed legacy read/write, current native equivalent/later provenance and one-point rules observed

### G3. Exercise later publication with the same identity through the rendered journey
Reported: slice 1 — "Acceptance inspected intent-scope-collected-timing-history.spec.ts and found same-identity preparation and execution, followed only by an unrelated landing. Pure projection receives an endpoint directly, so that setup cannot catch UI anchoring to the newest same-identity receipt."
Story clause: "another preparation, execution or later publication with the same story identity is not its substitute."
Disposition: proved by slice 1: dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts — same-identity P/E/R, reversed receipts, selected E and R exclusion

### G4. Local history must remain readable during an upstream rate limit
Reported: slice 1 — "Implementation inspection found authenticatedGet's global standingLimit guard refuses even a purely local collected-history request before fetch. Coordinator accepted extension of that existing transport with an explicit local-read option for scope and project history, preserving the live-read guard; focused isolation proof is required."
Story clause: "Opening, drilling into or revisiting history reads only collected local evidence, including after restart."
Disposition: proved by slice 1: tests/support/dashboard-ci-scope-history-read.test.mjs — controlled upstream limit preserves live guard and permits both local history reads

### G5. Resume temporarily unavailable retained proof
Reported: slice 1 — "Coordinator inspected collection's retained.proof === undefined guard: a temporarily missing or unreadable proof becomes a retained gap and is not retried, although keepLandedCiProof permits replacing a non-summary. Slice 3 must distinguish transient from permanent unavailable reasons and prove background resumption without browsing acquisition."
Story clause: "Older retained builds can acquire proof while it remains available, including builds whose wall-time resolution is already final; expired or missed evidence is a gap, not an invented reconstruction."
Disposition: receiving slice 3

### G6. Use evidenced trunk order rather than receipt preparation time
Reported: slice 1 — "Independent acceptance found scopeHistoryOf orders and cuts off by receivedAt. launchLandingReservation.ts assigns that time while preparing before publication and retains it on acceptance, so preparation order can differ from accepted trunk order: later unrelated landings can enter the selected cohort and earlier ones disappear. Require local/collected ancestry evidence and a reversed-preparation-order discrimination; no browsing acquisition or measured-date substitution."
Story clause: "Read the retained dashboard-recorded landing cohort through the selected story's landing, omitting subsequent unrelated landings."
Disposition: proved by slice 1: tests/support/landed-ci-history-order.test.mjs and real collected-timing-history journey — reversed receipts, unknown exclusion, public Git-unavailable persisted-order fallback and stale partial refusal

### G7. Preserve provenance for every represented landing of a shared build
Reported: slice 1 — "Independent acceptance found duplicate-attempt projection keeps only the first or selected landing's provenance. Exact A and unselected equivalent P followed by selected distinct E therefore read Exact build Represents A,P without P's reused-equivalent qualification. Preserve the mixed represented roles and prove this shape while retaining one numeric point per attempt."
Story clause: "Identify the represented landing separately from the measured revision and attempt."
Disposition: proved by slice 1: tests/support/intent-ci-scope-history.test.mjs unselected equivalent receipt and intent-scope-timing-history-reading.spec.ts mixed represented roles — one numeric attempt with each role labelled

### G8. Expose actual unreadable local history separately from empty history
Reported: slice 1 — "Independent acceptance traced readMachineJson unreadable (I/O, permissions, JSON or schema failure) through keptLandedCiHistory's noHistory fallback into HTTP 200 empty history. Existing route-503 proof covers transport only. Preserve absent-file empty behavior, expose an actual unreadable-store read through public history feedback/retry, and prove recovery without browsing acquisition."
Story clause: "A failed local read has its own feedback and retry without replacing the selected story or other available proof."
Disposition: proved by slice 1: dashboard/tests/intent/intent-scope-collected-timing-history.spec.ts actual corrupt-store 502, own Retry, restored bytes, unchanged comparison/story and CI operation count

Reassessment: slice 1 still owns the dated collected-entry journey through the
published landing. Corrections extend shared transport, store, ordering and
presentation owners. Folder/file and restart journeys remain in slices 2/3;
story scope and Accepted ADRs are unchanged.

### G9. Retain local ordering when upstream CI cannot be read
Reported: slice 1 — "Integration inspection found delivered pending/waitsFor:read early return in collect() bypasses the added independent local order persistence block after the pending observation is stored. Preserve the supplier stop-after-unread decision but persist available local first-parent evidence; prove actual collector retains trunkOrder even when upstream CI is unreadable."
Story clause: "Opening, drilling into or revisiting history reads only collected local evidence, including after restart."
Disposition: proved by slice 1: dashboard/backend-tests/intent/landed-ci-scope-pending-proof.spec.ts unread CI landing — persisted pending/read then independently evidenced trunkOrder, red before return-to-break and green after; existing real public Git-unavailable persisted-order fallback

### G10. Include earlier accepted trunk landings on non-first-parent paths
Reported: slice 1 — "Targeted PFE found our new uncommitted first-parent cohort walk can omit valid earlier trunk P when accepted C=merge(B,P) has P as its second parent. verifyLanding accepts any-parent ancestry and existing published endpoint recovery explicitly supports story-first tips and changed first-parent paths. Read the original retained cohort promise: use ancestry filtered to recorded landing revisions, prove P/C plus later R and private B exclusion, and correct the unsupported implementation wording. The confirmed-skip resolver's source-owned first-parent rule is separate and unchanged."
Story clause: "Read the retained dashboard-recorded landing cohort through the selected story's landing, omitting subsequent unrelated landings."
Disposition: proved by slice 1: tests/support/landed-ci-history-order.test.mjs real story-first C=merge(B,P) graph, recorded order P/C/R and projected P/C only; private B and later R excluded; renewed real Done journey and three fast-forward comparison cases

### G11. Preserve full contextual adapter attempt identity
Reported: slice 1 — "Coordinator and independent identity review found the adapter store key retains only attemptId, although valid attempt identity includes runId and revision. Actual collection of run-a/revision-A followed by run-b/revision-B with a reused opaque attempt ID retained the first summary and skipped the second proof request. New full identities must stay distinct, repeated references to one actual attempt must stay one point, and legacy associations without sufficient identity evidence must remain gaps rather than borrowing another attempt's proof."
Story clause: "never substitute current trunk's scopes or another attempt's proof for unavailable historical evidence, join unsupported identities"
Disposition: proved by slice 1: consumer-trace-slice-1-final-reconciliation.md — current extracted owner passes actual distinct/shared adapter acquisition, six identity/legacy store cases, matching-proof and immutability checks; unsupported associations remain explicit gaps

### G12. Apply the shared retained window in evidenced trunk order
Reported: slice 1 — "Independent review of published supplier6f5 found the shared newest-20 window prunes by receipt preparation time despite its source promising trunk order. With21 distinct recorded trunk landings and reversed receipt times, it can evict the newest selected landing while retaining the oldest. G6/G10 ancestry projection cannot recover an endpoint already pruned by that window."
Story clause: "Read the retained dashboard-recorded landing cohort through the selected story's landing, omitting subsequent unrelated landings."
Disposition: proved by slice 1: consumer-trace-slice-1-final-reconciliation.md — real21st collection evicts oldest trunk despite reversed receipts, unknown order defers/resumes with20 proofs intact, public project/scope share the cohort, interleaved/grouped ancestry and actual min/max dates observed

### G13. Observe an adapter attempt in the scoped entry reading
Reported: slice 1 — "Coordinator acceptance found actual adapter acquisition/public scope proof and generic native-run rendering, but no adapterAttempt payload in the scoped browser cases. The planned provider boundary explicitly owes observing an adapter payload and its shown entry reading; add the small missing rendering observation without claiming mocked UI data proves collection."
Story clause: "A CI adapter's validated proof follows the same history rules."
Disposition: proved by slice 1: consumer-trace-slice-1-final-reconciliation.md — targeted57982 adapter1200ms/opaque identity/link/keyboard reading beside selected native zero, Retry/comparison and390px preserved; actual collection/public payload separately observed by renewed backend adapter cases

### G14. Keep optional invalid run links from hiding valid evidence
Reported: slice 1 — "Coordinator reproduced a scopeHistoryOf answer with a retained100ms summary and runUrl https://: the numeric point survived server projection but failed the browser response schema because the build link guard checks only a prefix. Pending projection also drops the entire run identity when only its optional URL is invalid. Existing project history already preserves run words while omitting unusable links."
Story clause: "readable dates, measured values or reasons, provenance and build links provide the same evidence"
Disposition: proved by slice 1: consumer-trace-slice-1-final-reconciliation.md — links8 black-box cases preserve client-schema-valid100ms or pending identity while dropping only malformed/nonweb URLs, reusing the existing full URL/identity projection

### G15. Reconcile the published case/file proof contract
Reported: slice 1 — "Source-freshness recovery reached published trunk's schemaVersion2 proof contract: entries hold separate case/file/legacy evidence, old entry.unit/parts/files access is obsolete, and retained v1 summaries need the shared local conversion before current schema validation. Existing views show declared units separately; legacy labels cannot establish comparable units."
Story clause: "Each point is cumulative test execution time from that attempt's proof, using the existing entry and scope timing rules."
Disposition: proved by slice 1: consumer-trace-slice-1-v2-reconciliation.md — validated V2 native/adapter acquisition, independent case/file readings, mixed storedV1 local conversion, unique build counts and per-unit gaps/segments; 36 ownNode,24 backend,37 browser and7 primaryNode file jobs have passing observations

### G16. Preserve the maintainer’s delivered-history amendment
Reported: slice 1 — "Main e623ab143 clarifies newest20distinct builds, final retained-attempt acquisition, co-eviction and shared presentation; source-only amendment review is retained separately."
Story clause: "same bounded retained cohort as the project history: the newest 20 distinct measured builds"
Disposition: proved by slice 1: consumer-trace-slice-1-supplier-final.md — publishedff104 reconciled; actual collection, shared20-build co-retention/order, named nonnumeric gaps and reused dated presentation renewed by37Node/27backend/28browser; final-build backfill proof remains3

### G17. Prove amended final-build backfill and bounded payload recovery
Reported: slice 1 — "Main e623ab143 makes final wall-time observations and proof/build co-eviction explicit; existing slice3 already owns their restart/backfill proof."
Story clause: "including builds whose wall-time resolution is already final"
Disposition: receiving slice 3
