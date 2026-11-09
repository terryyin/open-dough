# Current incoming-finality proof scope

Supporting PFE and early-probe specification for active PLAN slice7. The
execution instruction owns authority; this research creates no separate Take.

# PFE: fast incoming Landed finality through actual raw evidence

Authoritative PFE choice for SEED-286 active-plan refinement only; no execution authority.
Incoming semantics are accepted-main SEED-288 at `9f88f44d95f13b52ab3677e7d1b47401b021f569`.
Retain the existing raw published/build/history direction and all completed SEED-286 proof.
Failure policy applies exactly through [AGENTS.md#failing-and-flaky-tests](/Users/terryyin/git/open-dough/.worktrees/make-the-intent-ci-comparison-tests-sub-second/AGENTS.md#failing-and-flaky-tests).
Read installed dough-pfe, architectural-thinking, actual relevant product code and current
Accepted ADR0002/0008/0010. Established `.planning/NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence`
already supports one interpretation and a Done story pinned to published landing.
No new direction topic, ADR, public API field, cache/TTL, client state or product decision is needed.
No repository edit/merge/formatter/Git mutation, test/list/proof, CI/provider or observer call made.

## Responsibility and authoritative choice

**Modularize the existing incoming receipt reader at its acquisition boundary.** Keep
`landedCiReceipt.ts@9f88::landedReceiptTime` as the sole actual project/target/story/resolved
landed-revision/earliest-time matcher. Supply raw launch and retained-history documents;
never substitute an already selected receivedAt or a pending/final boolean for this rule.
Reuse one actual incoming `landedSlotResolution`, adapted to current ComparisonBuildSource,
for both collection and comparison; private Done `{answer,landedPending}` gates memory.

Existing suitable producers and transformations:

- `launchRecordStore.readableRecordsByProject()` already supplies
  `ReadonlyMap<sourceId,readonly LaunchRecord[]> | undefined`, preserving unreadability.
- `landedCiHistoryStore` already reads a single `StoredHistory` project-keyed document
  through readMachineJson; modularize that existing read into a narrow
  `readStoredLandedCiHistory()` returning its existing StoreRead<StoredHistory>.
  Existing readLandedCiHistory(id) reuses it and retains withAdapterIdentity/noHistory
  behavior. This is one existing read exposed for its second production consumer,
  not another document/service or matching algorithm.
- Reuse `keptLandingReferences` for actual canonical retained references, including
  incoming optional target. Keep legacy missing-target semantics and target persistence.
- `ComparisonBuildSource` already supplies lookup, history.firstParents/laterTrunk,
  workflow/proofOf. Shared finality consumes it, preserving actual rule code without Git.
- `observationClock.observationNow` already owns production observation time. Pass it
  as the default clock fact, permitting a controlled epoch-ms callback at this external
  boundary. No timer/TTL framework, Date patch, environment override or wall wait is needed.

Chosen **private** source contract, naming types by their existing canonical shape:

```ts
type LandingReceiptFacts = {
  readonly launchesByProject:
    ReadonlyMap<string, readonly LaunchRecord[]> | undefined;
  readonly retained: StoreRead<Readonly<Record<string, ProjectHistory>>>;
};

// Add to existing StoryCiComparisonSource, retaining every current member:
readonly project: Pick<PublishedSource, "id" | "ref">;
readonly landingReceipts: () => Promise<LandingReceiptFacts>;
readonly observationNow: () => number; // epoch milliseconds, read when needed
```

The actual production story source factory wires the existing launch-map producer,
newly exposed existing history-document read and observationNow. The fast source
harness supplies canonical raw maps/read outcomes and a controlled clock only.
The actual receipt matcher selects `source.id` inside BOTH raw documents, then matches
`refs/heads/${source.ref}`, identity and the actual published landed revision, and takes
minimum receivedAt across all eligible launch/history references. Wrong namespaces
must remain in the raw fixture map so real selection excludes them. Empty/missing and
unreadable outcomes stay explicit; do not prefilter to a matching receipt in the fixture.
Retained history conversion/compatibility remains its existing owner.

The shared judge receives actual internal RevisionBuildSlot before public projection
loses proofUnanswered/unusableBuild. Its clock defaults to actual observationNow;
comparison passes its source clock and collection retains the same production default.
No public comparison fields or endpoint/provenance selection change. Already-final
memory reuse still performs no acquisition; unknown-age no-run at the head stays live.

## Other existing solutions assessed

`landedCiCollection.trunkLandings` is not the receipt matcher: it builds a collection
cohort, filters target for live captures and overwrites/deduplicates by receipt. It
neither owns story/resolved-revision/earliest-time selection nor the exact legacy guard.
Reusing its cohort result would silently import different semantics. `ownLaunchRecord`
chooses a latest accepted workflow launch; `matchesPreparation` checks checkout/start;
`scopeHistoryOf` selects historical cohorts. None means earliest matching landing age.
Keep these responsibilities intact; do not introduce a generalized matching registry.

## Actual unanswered-artifact capability already exists

`ciProofArtifact.ts:143` already exports `ciProofArtifactReader({listing,archive})`.
It consumes true external JSON/ZIP/error answers through actual readGitHubActionsSummary,
artifact selection/validation, proof memory and private unanswered WeakSet (:53-67).
Use that real factory in the canonical raw ComparisonBuildSource.proofOf harness.
Existing `ci-proof-memory-github*.spec.ts`, `makeMe.aCiProofArtifact`, `aCiProofSummary`
and `ciProofArtifacts.zipOf` supply suitable raw artifact/summary construction.
`unreadableBy(actual GitHubAcquisitionFailed/Held)` is also an existing production mapping.
Do not clone its branded returned proof, fabricate proofUnanswered, or use a plain
makeMe.aCiProof.unavailable("unreadable") to stand for an unanswered acquisition.
Malformed listings must run the actual reader; answered invalid/unopenable data must
remain distinguishable even when both public reasons say unreadable. No new artifact seam.

## Bounded early consuming pilot is credible, not yet proved

Three cases are an adequate initial capability gate before24-case migration:

1. **Unknown age:** canonical raw history/provider facts and both empty/unreadable local
   namespaces reach actual comparison read/Done resolver/shared judge. Repeat at a far
   future controlled observation time still reacquires; a subsequently appearing run
   can reach queued/running/exact completion, after which repeat acquires nothing.
2. **Matching receipt deadline:** raw maps include wrong project/target/story and
   preparation/execution revisions, targetless legacy data and reversed duplicate
   captures from launch/history. Real matcher chooses earliest eligible age. At hour−1ms
   a repeat remains live; at exact hour the explained gap is final and repeated reads
   acquire nothing. Public gap alone is insufficient; observe these independent deltas.
3. **Unanswered proof:** actual artifact-reader factory consumes malformed listing or
   actual failed/held transport outcome, then a valid raw archive. Internal brand reaches
   actual shared judge and memory gate despite receipt hour/walk having elapsed;
   recovery retains exact/equivalent/later identity/provenance and final reuse. Do not
   inspect a prepared pending boolean or infer pending solely from public gap wording.

These consume production comparison/receipt/finality/artifact owners through the same
canonical raw history/provider approach already used successfully by earlier slices.
They avoid actual Git/worktree/Node-server setup; a useful cost margin is plausible,
but no new duration, whole-feedback gain or sub-second result has been observed here.
Measure complete case setup/actions/assertions/cleanup in ordinary mode; separate only
actual immutable worker startup. If this pilot cannot preserve a promise or cost target,
return before migrating24 cases and reassess the boundary instead of masking it.

A raw Held response proves consumption of an external directed-wait fact. It cannot
prove real request-owner admission, zero upstream calls during its wait or same owner PID.
The incoming equivalent/later controlled-owner cases retain those transport oracles,
including different initial none/unavailable behavior while the later walk continues.
Their integration cost remains explicit; advance the controlled owner clock, never sleep.

## Surviving real connections and full migration gate

Keep explicit unique production connections until equivalent proof is established:
actual default factory/project store acquisition (including malformed launch/history
fallback), the2 incoming history/comparison collection/persistence/target/receipt-lifetime
connections, controlled provider owner wait/admission/PID connections, and3 actual
Check-again/reselection UI journeys with source/time/count/final reuse observations.
Existing store/parser tests can share lower-level responsibility where their actual
implementation/setup/oracles correspond; raw unreadable outcomes alone do not prove parsing
or wiring. Do not fix an arbitrary integration count or relabel the24 slow arrangements.

Before predecessor retirement, map every original24 rule oracle to its actual fast
owner and every retained acquisition/persistence/control signal to its real connection.
All6 receipt classes must execute actual namespace/matching/minimum-time logic; malformed
byte parsing and producer-to-consumer fallback require their genuine boundary proof too.
Keep canonical MakeMe facts explicit at each case; exact malformed JSON/ZIP/query/error
inputs under test and independent expectations remain outside builders.

See [receipt evidence](/tmp/seed286-execution-20261109/incoming-finality-pfe-receipts.md) for
canonical builder APIs/producer details and [all27 identities/oracles](/tmp/seed286-execution-20261109/slice6-main-9f88-test-oracles.md).
The existing fast final-no-build memory case needs genuinely final input facts; preserve
its legitimate memory oracle while adopting main's unknown-age semantics.

PFE finding supports an ordinary bounded remaining server-finality slice with this early
pilot as an execution gate, then complete preservation/measurement before extending to
client lifecycle/whole-family acceptance. No Take/readiness/execution permission is granted
by this research. Shared-source wiring, pilot correctness/fault detection,24-case mapping,
local/load/CI cost and actual factory/persistence/control observations remain unproved.
