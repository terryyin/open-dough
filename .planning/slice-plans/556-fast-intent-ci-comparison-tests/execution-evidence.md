# Fast Intent CI comparison execution evidence

[Active plan](PLAN.md) · [Proof strategy](proof-strategy.md)

### Slice 1 accepted proof

Current correction: `PublishedStoryHistory` owns raw authored/parent/profile,
ordered/merge/ancestry and live-author reads. The existing production claim,
ownership, side, landing and completion algorithms consume it. Default factories
retain the original Git flags/batching/order/errors; canonical MakeMe facts
replace acquisition in four fast history rules. The one new declared
`ci-comparison-history-integration.spec.ts` observes actual raw Git data and
UTF-8/missing profile parsing → those same algorithms. This replaces the three
slow rules with fast fault-equivalent proof plus a genuine acquisition owner;
the obsolete comparison-prefix artifact plumbing was removed.

Current ordinary after-profile, normal two workers/default trace, passed
**90/90 strictly**, runner 277,629.766 ms / wall **278.26 s**. All fourteen
in-process rules took 0–15 ms; the four history replacements 2/0/0/0 ms. The
declared acquisition integration took 2,472 ms including setup/cleanup.
Literal after-profile command:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/raw-history-family-after.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/raw-history-family-after-artifacts.jsonl npm run test:dashboard -- 'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary-story-comparison' tests/review/story-review-one-shot-choice-refresh.spec.ts backend-tests/intent/ci-comparison
```

Load 3.11/4.75/6.62 → 4.70/6.21/6.91,
memory 57% → 56%, awake AC. Shared story-columns/app/server/origin preparation
was 1,129/1,888/337/2,617+1,260 ms. The 269.01 s baseline versus 278.26 s after
does not establish aggregate gain with UI predecessors still present; G1 stays.

`raw-history-default-consumers.json` passed 38/38 strictly (61,526.587 ms),
covering actual default Review/comparison factories and completed/merge/live
consumers. Raw acquisition parity, typecheck and whitespace passed. Two actual
worker records in the applied no-acquisition control observed zero child calls
except allowed infrastructure `ps`; the initial unarmed control is non-evidence.
Six scratch faults failed the intended exact endpoint assertions and restored
source bytes after each (`raw-fault-controls-summary.json`). The updated
`raw-history-proof-map.md` and completed 1,406-row consumer trace retain the
full mapping under `/tmp/seed286-execution-20261109/`. G2's per-rule I/O cause is
resolved; a fresh independent history refactor is completing before delivery.

The final independent history refactor completed: only completed attribution's
duplicate merge/ordered queries now use `PublishedStoryHistory`; flags, all
parents, errors and attribution semantics stay unchanged. The focused command
below passed strictly 39/39 (150,756.267 ms), followed by typecheck and whitespace:

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/history-refactor-completion-consumers.json npm run test:dashboard -- backend-tests/review/story-review-completed tests/review/story-review-completed.spec.ts tests/review/story-review-completed-merge-edits.spec.ts tests/intent/intent-story-completed.spec.ts tests/intent/intent-summary-story-comparison-file.spec.ts tests/intent/intent-summary-story-comparison.spec.ts --workers=1
```

This replaces affected completed Review/Intent overlay/Summary/file proof in
the earlier records; raw fourteen/acquisition/fault evidence is unchanged.
`history-refactor-handoff.md` and its 93-row, zero-blank consumer trace retain
the inspected paths/observations. No required local proof remains deferred.

Delivery's formatter found seven mechanical fixture findings; promise stubs
now return explicit resolved promises and the history loop uses a local cursor.
The affected fourteen rules and real/described history parity passed again
(`slice1-mechanical-repair.json`, strict 14/14). No production behavior changed.

Independent fixture/doc refactoring completed, with no production edits;
`/tmp/seed286-execution-20261109/refactor-handoff.md` records all paths and
literal commands. The ten pure rules moved intact into endpoint, selection and
Taken specs, with `comparisonRead.ts`; the graph assertion moved intact into
`repository-graph.test.mjs`. Expanded proof must include those paths. Focused
Node ownership/native identity, backend 14/14, relocated 10/10, typecheck,
whitespace and 20 documentation links passed. Production/integration proof
remains accepted; G2 still blocks delivery and returns implementation work.

The real comparison read now consumes concrete Git/history, provider and proof
acquisition through `storyCiComparisonSource.ts` and `comparisonBuildSource.ts`.
The production factories retain actual Git and artifact reads. Done/Taken,
bounded selection, requested-status classification and equivalent/later rules
remain the production operations exercised by the fast tests. No endpoint
semantics or durable state authority changed (ADRs 0002 and 0008).

`ci-comparison-endpoints.spec.ts` observes both phases/modes, exact versus
ancestor endpoints, excluded later revisions, the story-start bound, nearer
proofless Baseline, path/provider skips, equivalent proof, opaque adapter
identity/jobs and a completed provisional ancestor beneath a running tip.
`ci-comparison-published-endpoints.spec.ts` observes actual Git claim/owning
evidence → landing, story-first tip selection, and original completion pinning.
The recorded pre-narrowing map at
`/tmp/seed286-execution-20261109/endpoint-proof-map.md` explains Trunk equivalence:
completion selection precedes mode recovery; claim recognition uses mode
presence; the earlier landing lies outside the later completion search range.
Independent exact revision/parent assertions detect wrong endpoints.

Retained core integration owners are the clean GitHub comparison journey
(`intent-ci-comparison.spec.ts`, including historical workflow and carried jobs),
the merged adapter journey (`intent-ci-comparison-adapter.spec.ts`, discovery,
opaque IDs, addressed proof/jobs and no Actions reads), Taken publication/refresh
(`intent-ci-comparison-taken.spec.ts`), and later-history full-reader composition
(`intent-ci-comparison-fast-forward.spec.ts`). Other browser predecessors still
own UI assertions pending slice 4; G1 owns their retirement and final measurement.

Proof (all terminal exit 0):

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice1-family.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/slice1-family-artifacts.jsonl npm run test:dashboard -- 'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary-story-comparison' tests/review/story-review-one-shot-choice-refresh.spec.ts backend-tests/intent/ci-comparison-endpoints.spec.ts backend-tests/intent/ci-comparison-published-endpoints.spec.ts
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/slice1-global-artifact-consumers.json npm run test:dashboard -- backend-tests/launches/start-origin-demand.spec.ts backend-tests/runtime/dashboard-artifact-demand.spec.ts
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash scripts/test.sh tests/support/dashboard-later-trunk-build.test.mjs tests/support/dashboard-later-trunk-landed.test.mjs tests/support/requested-revision-ci-status.test.mjs tests/support/repository-history-reads.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/repository-description.test.mjs tests/support/repository-fixture.test.mjs tests/support/repository-revision-files.test.mjs tests/support/repository-snapshot.test.mjs tests/support/repository-snapshot-isolation.test.mjs
npm run typecheck:dashboard
```

The whole family passed strictly **88/88**, runner 246,917.065 ms / wall
247.47 s. All 13 new rules took 0–498 ms including case setup and cleanup;
actual Git cases 442/301/498 ms. Common endpoint prefix 292 ms, story-columns
766 ms, app 1,063 ms, server bundle 76 ms and origin layouts 1,172/1,544 ms
are separate shared preparation costs. Load before 4.50/5.65/6.80, after
7.51/6.40/6.79; memory 56% → 57%, AC. The baseline's 269.01 s is not a
controlled speedup comparison while predecessors remain. The six nested global
setup consumers passed strictly in 7,945.636 ms, observing failed-origin peer
isolation and app/server completion, failure, interruption and cleanup.

The canonical graph fixture test asserts actual ordered parents, first-parent
tree inheritance, renderer parity and private-origin isolation. The described
history test compares acquisition with an independent real Git graph. The
completed consumer trace (1,027 rows, zero blank dispositions) is retained at
`/tmp/seed286-execution-20261109/slice1-final-consumer-trace.txt`; all affected
consumers have passing proof or a traced unaffected disposition. A scratch
removal of the story-start guard made Landed incorrectly become a build and
failed the intended assertion; original bytes were restored, with no diff in
`baseCiRevisionNearest.ts` (`slice1-bound-negative-applied.json`). No local
proof command remains running. Independent refactoring and delivery remain.

### Slice 1 checkpoint: real-Git ownership proof

Later loaded observation: the independent refactor's one-worker functional
check passed all 14 selected cases, but at load about 27 the three actual-Git
rules took 2,305/1,811/2,136 ms, versus 1–10 ms for the ten in-process rules.
The ordinary lower-load result remains an observation, not environment
independence. This invalidates relying on reduced real-Git setup alone for the
rule-test threshold under observed contention. G2 blocks slice 1 delivery.
Before another dependent implementation experiment, investigate the smallest
concrete raw-history acquisition seam in the existing published evidence,
landing and completion owners. Reuse MakeMe's canonical graph facts and actual
rule algorithms; preserve raw-profile/author/ancestry meanings and an explicitly
mapped real Git acquisition connection. New fast rule proof must detect the same
wrong endpoint faults before any predecessor is retired. Merely relabeling the
three slow cases as integration is not selected. The observed 1–10 ms in-process
rules support this within-scope strategy; the target and confidence remain.

The first five real-Git endpoint-reader cases passed strictly at load 9.84,
but took 2,036–3,512 ms each including setup/read/cleanup (runner 9,971 ms).
This invalidates the assumption that removing the browser alone makes history
derivation variants sub-second. The new in-process comparison cases already
take 0–11 ms; they cannot replace real owning-merge/fast-forward derivation.
Browser predecessors remain retained, pending their actual replacement proof.

Within the unchanged target and scope, measure the Git case's setup versus
read cost, then use the existing local-checkout materializer and the reader's
existing pinned-completion entry where that removes incidental remote setup.
Keep actual Git ownership rules and representative fetch/provider/render wiring.
If reads themselves dominate, reassess the concrete history acquisition boundary
before another implementation experiment. Do not relabel the measured slow
rule variants as integration or claim the target met. The remaining fixture
and acquisition cost is still plausibly removable; no target change is authorized.

The cost split then measured the reader alone at 985–1,492 ms; warm
materialization was 148 ms plus a 1,020 ms read, cold materialization
1,218–1,659 ms, and actions plus read 1,470–2,432 ms. Skipping a single fetch
cannot plausibly close this gap. Stop that fixture-only experiment. The next
bounded investigation uses PFE to assess repeated published agent/evidence
reads between completion and claim/landing derivation: prefer one read-scoped
evidence acquisition reused by the existing real rules, with the existing
immutable repository prefix for common cold preparation. Measure the removable
call cost before another edit. A mini-Git implementation, per-example command
recognizers, weaker ownership proof and post-measurement integration labels are
not selected. Independent consumer proof can continue during this investigation.

PFE measured 29 real Git executions totaling 980.105 ms, with ten exact
duplicates costing 340.800 ms. Read reuse alone predicts roughly 640 ms plus
150 ms copying and 550–940 ms history actions, so it cannot credibly make
these full-reader variants sub-second. Do not add a history cache for this
experiment. Select the smaller existing public responsibilities instead:
`publishedStoryEvidence` plus `landingOf` for owning/foreign merge and
fast-forward rules, and `deliveredCompletion` for preserved earlier completion.
Retain representative full-reader → comparison composition. Pilot actual Git
cases with minimal MakeMe facts and shared immutable common-prefix preparation
through existing snapshot/run-artifact support; account for its startup cost
separately and keep case-specific setup in each case. Estimated domain-read
cost is 180–350 ms, to verify before migration. This changes the proof boundary,
not its expected endpoint or the timing target. Each predecessor's actual
distinguishing fault still needs an explicit surviving-proof map.

The alternate pilot passed strictly in **495 ms** per case including its
unique four-commit real-Git graph and cleanup. It exercised actual
`publishedStoryEvidence` → `landingOf` for owning versus foreign-resolution
selection. Runner 1,732 ms; common immutable comparison prefix 330 ms measured
separately (existing story-columns prefix 508 ms overlaps). This supports
continuing fast-forward and earlier-completion proof at those existing public
boundaries. No history cache or production endpoint-reader change was needed.
Ordinary affected-group, loaded and CI measurements remain acceptance work.

### Execution context and baseline

- Established execution: `SEED-286#fast-intent-ci-comparison-tests`, publisher
  `dashboard-territory.local-open-dough`, agent `ealden-chan`; Story Branch Mode,
  owned workspace `/Users/terryyin/git/open-dough/.worktrees/make-the-intent-ci-comparison-tests-sub-second`,
  branch `codex/make-the-intent-ci-comparison-tests-sub-second`, remote `origin`,
  integration target `main`. Start revision `79eeb72a017642389fce73d459743997130f28f9`;
  accepted claim and initial candidate `4275164b426c1eb9668891b8bc37f99ad2eee141`.
  Remote branch and main both confirmed at the claim. No default checkout supplied.
- Exact-checkout `npm ci` and `npm run typecheck:dashboard` passed. Hooks are
  check-only staged lint plus dashboard typecheck for scripts. No numeric slice
  budget is configured; retain existing in-place planning authority.
- Before implementation, the literal baseline command from Verification and
  execution gates, with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/baseline.json`,
  passed all 75 cases (73 comparison + two review Refresh), ordinary two workers,
  default tracing, no retries. Strict runner duration **268,095.894 ms**,
  shell wall **269.01 s** on
  Node v24.21.0 / macOS arm64, 2026-11-09. Raw transcript/log remain outside Git
  at `/tmp/seed286-execution-20261109/`. Per-case times ranged 3,664–17,292 ms.
- Territory.local was fully awake on AC under `caffeinate -s -i`; before load
  2.95/4.50/7.92, memory free 62%; after load 10.47/7.74/8.36, memory free 59%. No competing suite
  was observed at launch. Focused proof may proceed after the baseline; its
  owner rechecks headroom before long or repeated verification. Full suites are
  not a routine gate for this story. The baseline includes runner/build/worker
  overhead in wall time; summed case time is not wall time.
- Unchanged launch/capture integration preservation: `caffeinate -s -i env
  OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/launch-capture-preservation.json
  npm run test:dashboard -- tests/review/story-review-one-shot.spec.ts
  tests/review/recently-done-one-shot-review.spec.ts` strictly passed all three
  cases, runner 21,137.961 ms / wall 21.69 s. Actual launch, captured fixed pair,
  retirement/restart and published-done review observations remain available
  for slice 5 while their implementation/setup boundaries stay unchanged.
- CI source is GitHub Actions `ci.yml`, push-triggered. After the directed
  request hold, the workflow diagnostic succeeded at 09:12Z: selector `ci.yml`,
  workflow ID `351271804`, display name `CI`, active. The initial trunk claim
  retains `pendingCi: unobserved`; it is not registered on the branch observer.
- Exact-checkout Codex observer is armed for `terryyin/open-dough`, target
  `codex/make-the-intent-ci-comparison-tests-sub-second`, coordinator
  `seed286-codex`, directory `/tmp/dough-ci-501/watch-YYQZ9S`, PID `5375`,
  stream session `32919`, yielded cell `g186:51`. Its key is
  `ci-watch-execution:terryyin/open-dough:codex/make-the-intent-ci-comparison-tests-sub-second:seed286-codex`.
  Pass this coordinator and exact directory to every branch delivery. Do not
  start a duplicate or manually poll its stream; normal completion owns shutdown.
