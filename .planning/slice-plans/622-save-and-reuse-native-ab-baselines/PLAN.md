# Save and reuse native A/B baselines

**Identity:** SEED-346#reuse-native-comparison-baselines
**Source:** [selected story](../../seeds/SEED-346-native-ab-comparisons.md#reuse-native-comparison-baselines)
**Source review:** [independent commitments](source-review.md)

## Execution context

- Established execution on 2026-11-14 supersedes this preparation record's
  historical preparation-only authority. The user invoked Execute Plan for all
  four slices, including the requested single native Codex capture in slice 4.
- Identity `SEED-346#reuse-native-comparison-baselines`; publisher
  `dashboard-territory.local-open-dough`; agent `chaifeng-chan`.
- Reused owned checkout
  `/Users/terryyin/git/open-dough/.worktrees/save-and-reuse-native-a-b-baselines`,
  branch `codex/save-and-reuse-native-a-b-baselines`, Story Branch Mode.
  Default/integration checkout `/Users/terryyin/git/open-dough` is separate.
- Authorized remote `origin` (`terryyin/open-dough`), trunk `main`;
  increment target `refs/heads/codex/save-and-reuse-native-a-b-baselines`.
  Starting revision `3dc8ce8abf384f96861b3710d0b83f95698b6a31`;
  accepted claim and current candidate
  `d87004f11c06a9fc2c1e3d5f7dbdeab79a09b8be`. Claim trunk CI is unobserved.
- Checkout setup: `npm ci` succeeded against the current lockfile; subsequent
  `PATH=/opt/homebrew/bin:$PATH bash Distribution/tests/native-comparison.sh`
  succeeded. Commit hook is understood and check-only (staged lint and
  dashboard typecheck for script edits). Selective formatting is `npm run format`.
- No numeric slice target or hard limit is supplied. Preserve existing active-plan
  refinement authority; no scope changes are authorized by replanning.
- CI source GitHub Actions, verified active `ci.yml` / `CI` (351271804),
  push-triggered on the execution branch. Coordinator `seed346-baselines`;
  yielded cell `g255:11`, session `82275`, PID `29040`, observer
  `/tmp/dough-ci-501/watch-Ya4z4O`, bound to this exact checkout and branch.
  Reuse it for every execution increment and repair.

## Goal and scope

Compare successive candidates against sufficient matching historical baseline
evidence without another baseline session. Keep durable account-free outcome,
proof, conditions and available effort facts; use a fresh baseline when the
saved observation cannot answer the comparison. Retain the existing forced-turn
evidence and add one representative unblocked execution baseline on Codex.

Terry accepted the narrower boundary on 2026-11-14. Event-driven case delivery,
skipped-wake assessment and its baseline belong to
[SEED-356](../../seeds/SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution),
which selects the actual delivery path. Automatic archive discovery, additional
native hosts and general effort-accounting tooling are deferred. No new rejection
rule follows merely from those delivery boundaries. This is preparation only:
no product implementation or paid session is authorized by this invocation.

## Design and existing owners

- Extend the maintainer comparison entry and its frozen-arm, retention,
  basis/recovery, observer and outcome-first judge responsibilities. One
  applicability rule determines whether the explicitly supplied baseline is
  sufficient; known misses use the ordinary fresh path. Avoid a parallel judge
  or a repository-wide archive registry.
- Retain compact observations and decisive assessment inputs, rather than
  trusting a prior verdict. Keep original capture provenance immutable;
  corrections are traceable derived assessments. Use the existing
  `comparisons/` exclusion so adding evidence does not change case identity.
- Preserve full provenance separately from applicability. Match resolved
  baseline payload, agent-facing task/events/setup/project basis and material
  runtime/settings. A changed observer or assessor is not silent equivalence:
  replay only when the retained evidence supports the current criteria and
  explain the derived assessment. Otherwise obtain fresh evidence. Verify
  actual candidate settings before claiming comparability.
- A match remains one historical stochastic observation. Disclose dates,
  load, scheduling and other variable measurement limits; no concurrent-pair
  interpretation follows from reuse. Unknown proof/usage stays unknown.
- PFE: the admission family's `native-admission-reuse.md` separates capture,
  current assessment and applicability. Reuse that distinction and suitable
  shared native readers, not its admission-specific protocol. Available Codex
  usage is kept with native ownership/turn attribution; do not build a general
  cross-host accounting platform or sum duplicated history/cumulative prefixes.
- Applicable Accepted decisions:
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (matching evidence, native qualification, outcome/proof first),
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  (declared criteria and bounded conclusions), and
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one coherent responsibility and minimum complexity).
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this design in
  intent documentation. Index/statuses agree; no conflict or successor was
  found. The existing North Star concerns dashboard responsibilities and adds
  no constraint here; no new temporary direction is warranted.

## Outside-in proof ownership

| Story promise | Owner and observable proof |
| --- | --- |
| Compact baseline survives raw cleanup with its outcome, proof, conditions and available effort | Slice 1: export a real controlled attempt, remove raw sources, replay assessment and inspect retained evidence; account-bearing fields do not escape. |
| Same baseline/input/runtime with a new candidate launches only the candidate | Slice 2: entry-level substitute journey observes actual payload/session launches and cites the retained source in its verdict. |
| Material change, missing/incomplete/insufficient evidence or requested fresh pair obtains fresh baseline | Slice 2: actual new baseline launch and new observation; previous archive bytes remain unchanged. |
| A complete observed failure is reusable, an unjudged interruption is not | Slices 1–2: current assessor replay and the same outcome-first judge distinguish failure from incomplete evidence. |
| Original assessments stay traceable through a correction; unknown usage is not zero | Slices 1–2: derived assessment retains its source; missing worker/measurement evidence prevents claims requiring it. |
| One ordinary unblocked execution reaches final proof without event wakes | Slice 3: already-completed supplier on remote, still-partial consumer, one integration/filing and passing independent plus agent/owned-worker proof. |
| Case qualification, traits/duration and fresh frozen unblocked native baseline; retained forced-turn limits | Slice 4: one native journey, rejected plausible shortcut, case-local account-free baseline and honest historical evidence labels. |

## Decisive premises and observations

Observed on 2026-11-14 in this preparation checkout at product source
`f8624a1332d52ed850b69003d96169a0867ddd3b`; subsequent edits before this plan
were planning records only. Disposable observations changed no product files.

| Premise / consuming operation | Form, observed result and remainder |
| --- | --- |
| Existing retained provenance can be recovered | `PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh --recover Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt` returned 0, recovered 49 inputs at `764c4e0…`, found both payloads and `codex-cli 0.169.0`. This establishes provenance, not proof sufficiency. |
| An old summary alone is not replayable proof | Bash 5: source `native-observation.sh` and `paused-supplier/assess.bash`; `case_assess …/comparisons/20261114T102744-1921.txt` gave `fail`, `turn 1 did not complete (): the session did not yield`. The exporter must retain assessor inputs and their decisive support, not wrap the summary as a reusable pass. |
| The existing journey/observer can exercise the forced-turn case | Bash 5.3.20, existing `native-agent-paused-supplier.sh` first on PATH, `NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case paused-supplier "$source_dir" "$work/run" "$work/results"`, deadline 120 and grace 5: pass, four completed turns, preserved work and one qualifying integration/filing with passing proof. This is substitute evidence only. |
| Publishing the supplier before turn 1 leaves the consumer's real task intact | Source the same runner/case; `case_materialize "$root" "$source_dir" codex`; `case_apply_event "$root" nonqualifying "$controller"`; `case_apply_event "$root" qualifying "$controller"`. Remote contained the completed supplier/done record; consumer reader remained absent, partial files present and integration/filing counts zero. One existing substitute turn plus `case_observe` produced preserved work, completed reader, one integration/filing, both proofs passed and unchanged remote. Substitute dependency stayed `waiting`: it does not qualify the new native behavior. Slice 3 corrects stale setup narration; Slice 4 observes real judgment. |
| Usage with coordinator/worker attribution is available historically | Replayed tracked `20261114T102744-1921-usage.jsonl.gz` by own `(threadId,responseId)` and root-turn ownership: 174 responses, baseline 80 / 8,386,947 tokens, candidate 94 / 13,434,290 across four native threads each. This agrees with the retained `…-tokens.md` method. It settles available historical counters, not every future runtime wire shape; missing future fields remain unknown. |
| This checkout reaches the native proof route's unpaid prefix | Bash 5 `native_comparison_preflight codex paused-supplier "$PWD" "$scratch"` passed; runtime `/Users/terryyin/.local/bin/codex`, `codex-cli 0.169.0`, jq and Node present. No session started. Authentication, native one-turn unblocked judgment and current usage completeness remain paid/native premises bounded by Slice 4. Recheck conditions there. |
| A single frozen baseline needs implementation | Current single-journey entry uses the working-tree payload; only pairs freeze requested commits. This is observed command selection in `native-comparison.sh`/`native-comparison-pair.sh`, not a claim that standalone frozen capture already works. Slice 1 adds it and proves installed payload content. |

## Ordered slices

### 1. Keep a frozen baseline after raw evidence is removed
Type: Behavior
Status: done
Proof: New `Distribution/tests/native-comparison-baselines.sh` drives capture/export through supported maintainer commands, deletes its controlled raw attempt, and reassesses the retained evidence.

Behavior: a resolved baseline revision and completed native journey or retained
pair arm → save a baseline → a new immutable compact observation remains usable
without raw session files. Provide a standalone frozen-baseline capture so no
candidate is needed yet, and export of sufficient existing retained attempts.
Store payload/case/project/host/settings identities, observation time, outcome,
decisive proof, available effort and explicit unknowns. Keep capture and any
derived assessment traceable. Complete failures can be saved; stopped/unjudged
attempts remain incomplete and cannot masquerade as reusable observations.

Use a cohesive archive helper for export/validation rather than adding storage
logic to pair orchestration. Retain only account-free assessment/measurement
facts from the shared native readers. Preserve owned-worker proof attribution
and known response identity/turn ownership; raw sessions and account identities
stay local. Missing fields do not become zeros. Update the command/retention
documentation with the chosen flags and the historical-evidence distinction.

Regression proof: actual frozen installed content, archive reassessment after
raw removal, a complete observed failure, malformed/truncated evidence, missing
owned proof, and a deliberate account-bearing marker that must not be exported.
Refuse overwriting an existing observation; preserve original records exactly.
The substitute is only the external model boundary; use real Git, installation,
retention, assessor and filesystem cleanup. Do not assert builder internals.

### 2. Obtain a sufficient baseline from saved or fresh evidence
Type: Behavior
Status: done
Proof: The same baseline journey observes actual arm launches for a match, miss, insufficient evidence and explicitly fresh comparison; existing pair/refresh/incomplete journeys remain green.

Behavior: an authorized comparison with an explicitly supplied saved baseline
→ apply one sufficiency/matching rule → launch only the candidate for a match,
otherwise run and save a fresh baseline while preserving prior observations.
An explicitly requested fresh pair observes both arms together. Declare factor,
gain and quality criteria before acquisition. Replay sufficient proof through
the current assessor; use the existing outcome-first judge. A saved baseline
that failed its task can still answer a comparison when complete.

Match the requested resolved baseline, case/project inputs and relevant runtime
conditions; preserve provenance hashes. Known misses choose fresh acquisition
before launch. Validate the actual candidate conditions before reporting a
match; a mismatch/unavailable condition never receives a comparable verdict or
effort delta. Obtain fresh matching evidence under the authorized request, or
report not-comparable if the conditions cannot be established. Do not silently
rerun stopped turns or invent a zero-cost successful observation.

Proof distinguishes launch behavior using substitute payload/session markers,
not merely record labels. Exercise changed payload/model/effort/case input,
missing or incomplete saved evidence, criteria needing absent facts, complete
baseline failure, actual-applied-settings mismatch, and fresh-pair override.
Assert source/date/conditions and historical limits appear in the verdict, old
archives stay byte-identical, and quality failure cannot become an effort gain.
Keep matching and fresh fallback together: they are the two outcomes of the
same baseline-acquisition rule, not separate lookup and retry policies.

### 3. Run the same execution task with no supplier wait
Type: Behavior
Status: planned
Proof: New `Distribution/tests/native-comparison-unblocked-supplier.sh` exercises the case's setup and one-turn assessment, with rejected shortcuts and the existing blocked case still passing.

Behavior: the supplier's completed outcome is already on the remote before
the first session, while the consumer owns the original partial slice → run
the ordinary execution task once → discover the completed supplier, integrate
it once, file the remaining stage once and show passing final proof, with no
event wakes. Preserve ownership, partial work, publication restrictions and
the independent/owned-worker proof contract. The setup must truthfully describe
supplier completion instead of saying its agent is still Taken.

Reuse the original case's extraction provenance and smallest runnable project.
Share the fixture and observation knowledge with the blocked case through a
cohesive common helper if needed; include that helper in both case identities.
Keep their scheduling and assessment distinct. Avoid copying the 229-line
fixture or teaching the controller to decide event-driven scheduling. A new
case entry, neutral task and assessor stay outside the agent's expected answers.
Record environment/behavior traits and pending native qualification honestly.

Proof observes remote completion alongside still-partial consumer preconditions,
then one-turn completion at the case boundary. Reject lost/rerouted work,
missing independent or agent/owned-worker proof and duplicate continuation.
The substitute's terminal-looking response alone must not supply the decision.
Keep old forced-turn observations and timings labelled for their own conditions.

### 4. Qualify and retain the unblocked native baseline
Type: Behavior
Status: planned
Proof: One requested real Codex journey under a frozen payload, its current assessment and rejected plausible wrong decision, with a retained account-free baseline after raw cleanup and case traits/duration updated.

This is the early native probe for the unblocked capability and future wire
shape, before claiming qualification or relying on that case in SEED-356.
Slices 1–2 deliver independent reusable-comparison value; Slice 3's controlled
proof does not settle native judgment. Run no comparison candidate or full paid
pair until the actual baseline observation supports that decision.

Use the documented native entry on a pinned commit after the case/assessor and
archive implementation are committed. The execution instruction must authorize
this requested native capture under `native-comparison.md`; preparation does
not. Use Codex 0.169.0 with `gpt-6.1-sol`, effort `xhigh` when still available,
or record the actual new conditions rather than claiming the old profile.
Start with one unblocked turn and the existing 2400-second deadline; no paid
retry without diagnosing the cause. Recheck runtime/authentication, resources
and competing work before launch. Failure stops native qualification and any
dependent efficiency claim; preserve evidence and repair an evaluation defect
or return a product/host decision to Terry, rather than forcing a pass.

Record payload/input/host/settings identities, outcome and decisive proof,
preparation/native duration, developer interventions and available coordinator
and worker requests/cached/uncached input/output usage through final proof.
Unknown worker usage stays unknown. Show a plausible shortcut is rejected by
the assessor; a cheap controlled counterexample suffices for the assessor rule.
Retain the smallest account-free proof/measurement inputs and their provenance,
then remove spent raw artifacts at wrap-up under the retention policy.

Keep original forced-turn records and corrected assessment/usage evidence
unchanged. Export a derived reusable observation only when sufficient supporting
evidence is actually recoverable; otherwise label the old observation historical
and insufficient for the unsupported criteria. Do not pay merely to convert
its format. A later authorized comparison needing missing evidence uses Slice
2's fresh path. Neither forced-turn nor unblocked observations demonstrate
suppressed wakes or event-driven savings.

## Verification, sizing and concern review

### Slice 2 accepted proof

- Slice 1 was accepted on the execution branch at
  `1f224d6641d73832725b8845f516a9ba2123d516`, suffix base
  `d87004f11c06a9fc2c1e3d5f7dbdeab79a09b8be`, with the retained observer attached.
- Supported pair acquisition now uses `--reuse-baseline FILE`, `--fresh-pair`
  and explicit `--require-usage`. `native-comparison-baseline-reuse.sh` observes
  actual session counts: one candidate for sufficient matching or complete
  failed baselines, two for explicit fresh pairs. Its assertions inspect
  source/date/conditions/historical limits, current assessor derivation and
  immutable original bytes. A cheaper bad candidate is regressed, never a gain.
- `native-comparison-baseline-misses.sh` observes two sessions for changed
  payload/model/effort/task and missing/truncated evidence, then reuses the newly
  saved changed-payload observation with one session. Required absent usage
  obtains fresh evidence and remains not-comparable if still unavailable.
  `native-comparison-baseline-conditions.sh` observes fresh acquisition for
  missing decisive assessor inputs, candidate-only acquisition followed by
  not-comparable/no delta for an actual applied-model mismatch, and complete
  own native-response usage without summing CLI cumulative counters.
- Applied settings that are unavailable retain the old precise unknown result;
  only observed differences override it. Criteria sufficiency has its own
  condition, separate from settings. Assessor/retention provenance can differ while sufficient current replay
  establishes applicability; the overbroad reader exemption was corrected by G2; the mixed
  setup/observer file's uncertainty is disposed in G1 below.
- Terminal passing commands:
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh Distribution/tests/native-stream-replay.sh`;
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-baseline-reuse.sh Distribution/tests/native-comparison-baseline-conditions.sh`;
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baseline-misses.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh`.
  Setup and observing assertions were inspected in those three new supported
  entry journeys. Consumer dispositions: `/tmp/seed346-slice2-effects.md` and
  `/tmp/seed346-slice2-consumers.md`; all reached comparison/case/reader callers
  ran, historical planning/reference matches are unrelated and untouched.
- Resource admission on this Mac: AC, awake, 16 cores, initially load
  4.01/3.69/3.42 with about 3 GB free and 14 GB inactive; bounded recheck under
  two named runs load 6.20/6.18/4.82 with 4 GB free and 14 GB inactive supported
  continued focused concurrency. Guarded commands all ended. One unchanged
  selection was repeated solely to get a clean whole-command report; this was
  unnecessary and is retained as a process deviation, not additional proof need.
- Source freshness unchanged at `c596ec840e95ad6518597369766a83fb63f37d18`;
  new incoming commits concern dashboard launch-history preparation/Take and
  other usage seeds. Named siblings and this source are unchanged.
  `PATH=/opt/homebrew/bin:$PATH node scripts/test-shares.mjs preview --split-count 3`
  passed: 657 jobs, predicted 740.9/740.8/740.8 under 926. The six unrecorded
  jobs include these new journeys; this is not measured CI cost.

### Slice 1 accepted proof

- Supported entry capture freezes and installs the requested payload; the new
  `native-comparison-baselines.sh` journey observes its quiet commands despite
  the working payload's shortcut, saves within the copied case's `comparisons/`,
  and subsequently runs a pair without changing case identity. It exports from
  retained session copies after original home removal, rejects overwrite,
  missing owned proof, empty independent exit receipts, malformed archives and
  stopped streams, and retains complete task failures. Its final block removes
  raw attempts and reassesses both direct and owned-worker proof with unchanged
  archive bytes. Usage is deduplicated by own thread/response and missing facts
  remain unknown. The literal native wire in that test protects ownership and
  accounting; it is substitute evidence, never native qualification.
- `native-comparison-doughnut-title-precedence.sh` retains an original failed
  assessment and green-fault summary while current assessment derives pass
  from normalized decisive test-run facts. Separate reassessment after raw
  cleanup names the immutable source and leaves its hash unchanged.
- Terminal passing commands (all from this checkout):
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh Distribution/tests/support/native-codex-owned-proof.test.mjs Distribution/tests/support/native-codex-session.test.mjs`;
  after the additive shared-reader change,
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh Distribution/tests/support/native-codex-owned-proof.test.mjs Distribution/tests/support/native-host-stream.test.mjs Distribution/tests/native-stream-replay.sh Distribution/tests/native-evidence-identity.sh`;
  after the case-local test strengthening,
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh`.
- Shared consumer trace and dispositions:
  `/tmp/seed346-slice1-effect-consumers.md` (full base trace
  `/tmp/seed346-slice1-consumer-trace.md`). The reached entry, retention,
  observers, saved-session reader, owned proof and old case journeys ran above;
  documentation was inspected. Other planning/history matches are unrelated.
- `PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh --recover Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt > /tmp/seed346-slice1-recovery.txt`
  passed: unchanged original record, recovered basis
  `764c4e0fe0ce9f478750323de6a9f30c76a7e61a`. Old records were not modified.
- Resource admission: this Mac fully awake on AC, 16 cores, observed load
  2.44/2.38/2.52, free/inactive memory available, no known competing owned heavy
  work. Focused checks ran under `caffeinate -s -i`; no full suite or paid
  session ran. Reconsider on contention/failure or changed workload.
- Source freshness unchanged against pinned trunk `b0fd5c16ff04083686aeac4ed41bc887117f9c66`;
  incoming commits concern other seeds/dashboard usage research. Named sibling
  behavior and this slice's source are unchanged.
- `PATH=/opt/homebrew/bin:$PATH node scripts/test-shares.mjs preview --split-count 3`
  passed: 654 jobs, predicted totals 739.5/739.4/739.4 under ceiling 926;
  the new baseline job is unrecorded, so this is allocation evidence, not a
  measured CI cost claim.
- Independent `dough-post-change-refactor` completed (`/root/refactor1`):
  current assessment and usage aggregation have cohesive owners, the existing
  proof owner supplies coordinator selection, and the focused baseline guide
  remains linked from the main guide. Formatted previews are below the 250-line
  limit. Exporter/current-assessment provenance covers the extracted owners.
  Consumer dispositions are `/tmp/seed346-refactor1-effects.md` and
  `/tmp/seed346-refactor1-consumers.md`.
  Renewed proof passed:
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh Distribution/tests/support/native-codex-owned-proof.test.mjs`;
  then logging-isolation preservation passed
  `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/support/native-codex-owned-proof.test.mjs`.
  Earlier shared-reader/replay/identity proof remains valid because those owners
  were unchanged by this refactor. `git diff --check` passed. Resource recheck:
  AC, fully awake, load 1.95/2.48/2.87, ample free/inactive memory, no competing
  test commands; named checks under sleep guard only. No remaining gap.

- Follow [AGENTS.md's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written, including in every delegation brief and repair handoff.
- Test-entry selection on 2026-11-14 resolved MakeMe enabled and page objects
  disabled for the two intended new shell tests and existing pair, refresh,
  incomplete and paused-supplier tests. Follow the installed `dough-makeme`
  convention through the existing comparison fixture/builder boundary; keep
  scenario facts and assertions at the consuming test. Recheck new/changed
  paths before authoring. No browser test is planned. Never sleep, use
  `test.slow()` or add suite/file/group/hook timeout overrides.
- Unit proof starts at the supported maintainer command with real local
  collaborators and only the model host substituted. Native qualification is
  a separate observation, not an inference from substitute success. Existing
  tests preserve unchanged boundaries; new assertions must catch a named
  behavioral regression, not restate settings or fixture construction.
- Focused command as tests are added:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison-unblocked-supplier.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh`.
  Omit not-yet-created tests until their owning slice. Trace shared native
  reader/runner changes through the installed consumer-trace script and run
  affected consumers beyond these cases. Reuse the original kept records and
  `--recover` to verify their immutable recovery after hash-bound edits.
- Run lint/formatting and preview new test-job shares with
  `node scripts/test-shares.mjs preview` at CI's current split count. New jobs
  affect this shared CI allocation; that justifies the preview, not a routine
  full-suite local run. Apply independent refactoring, commit/delivery and
  asynchronous CI repair through Execute Plan when execution is authorized.
- Local gate: focused checks above; no full-suite run is prescribed. Any long
  or full local run uses the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC power use `caffeinate -s -i`; on battery plug in, or start fully awake
  with lid open under `caffeinate -i` and inspect the sleep log afterwards.
  Apply the same resource-admission guidance to expensive/native proof.
- Expected code edits are currently below 250 lines: entry 182, pair 200,
  retention 95, observer 90, basis 184, verdict 203, session extractor 128,
  shared Codex stream decoder 113, paused-supplier fixture 229. Keep new
  archive durability separate from pair orchestration and share fixture
  knowledge at its cohesive setup/observation seams. Recheck current sizes
  before editing and settle a cohesive reorganization before any changed
  checked file would exceed 250; no mechanical line split or size exception.
- Four Behavior slices each own one outcome/proof loop. The acquisition slice
  uses one sufficient-evidence rule for saved and fresh sources. The case
  changes initial supplier availability, not the execution task or outcome;
  separate assessment follows that real condition difference. No preparatory
  Structure or future-host/event-delivery framework is needed.
- Slice-plan refinement was not needed: the cumulative design has one archive,
  one applicability rule and the existing comparison judge, with bounded
  case/native proof. No remaining slice-specific concern was identified.
  Paid-only premises remain bounded by Slice 4 with failure stopping its
  dependent qualification/claims; no unresolved human scope decision remains.


Independent slice 2 refactoring (`/root/refactor2`) completed before delivery:
one applied/requested settings owner serves export, acquisition and the existing
pair observer, and one machine formatter serves capture/acquisition/pair records.
New settings interpretation remains hash-bound in pair provenance and exporter
metadata. `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison-baseline-reuse.sh Distribution/tests/native-comparison-baseline-conditions.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-refresh.sh`
passed. These assertions renewed capture, projection, actual/unknown settings,
fresh pairing and recovery; unchanged miss-policy and shared-reader proof remains
accepted. Consumer dispositions: `/tmp/seed346-refactor2-effects.md`. Tracked and
untracked whitespace passed; formatted code previews stay under 250 lines.
Resource recheck: AC, load 2.25/3.07/3.83, ample memory, no competing test commands.
No semantic edit followed verification; no remaining gap. Delivery freshness
remains unchanged at `c596ec840e95ad6518597369766a83fb63f37d18`.

### Owned acquisition correction before slice 3

- Slice 2 was accepted at `b12ea4cc6e177f10f146a62d2a2386416861f7e3`,
  suffix base `1f224d6641d73832725b8845f516a9ba2123d516`, observer reused.
- G2 was found during continuing coordinator inspection before any supplier-case
  edit. The initial nonexistent-reader probe was invalid attribution. The actual
  manifest-listed stream adapter then reproduced one session where two fresh
  arms were required. The minimal applicability repair makes stream/session
  readers and discovery material when old normalized observations cannot replay
  their original inputs; supported assessor/retention replay stays available.
- `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh Distribution/tests/native-comparison-baseline-readers.sh Distribution/tests/native-comparison-baseline-reuse.sh`
  passed to terminal. The new journey changes real stream/discovery reader files,
  observes fresh session creation, new usable archives and byte-identical old
  observations. Existing reuse assertions preserve candidate-only matching and
  current assessor/retention replay. Consumer dispositions:
  `/tmp/seed346-g2-effects.md`; unchanged non-reader-varying acquisition and judge
  observations remain accepted. No reader implementation or raw retention changed.
- Resource recheck: AC, 16 cores, load 3.44/4.19/4.19, available memory, no competing
  tests, sleep guard active; all commands ended. `git diff --check` passed.
- Source freshness unchanged at `f5c1adff32830a9f4e4992913fd7b8a9f72cfc83`. Incoming
  dashboard launch-history implementation/closure has no shared comparison effect;
  named siblings remain unchanged. This repair is delivered separately before
  the planned unblocked case starts.

- Independent refactor `/root/refactor_g2`: none — already clean; no edits or
  tests, accepted boundaries and consumer dispositions unchanged. Tracked and
  untracked whitespace passed, no remaining gap.
- Three-share preview passed at 658 jobs, predicted 740.9/742.2/740.8 under 926;
  new jobs remain unrecorded, so no measured CI cost is claimed.

## Story obligations

### G1. Setup equivalence is unknown after a mixed setup/observer change
Reported: slice 2 — "Changed case.bash requires fresh acquisition because its hash currently combines setup and observation."
Story clause: "Run a fresh baseline when the requested baseline or a material condition changes, or when saved evidence is missing, incomplete or insufficient for the comparison."
Disposition: proved by slice 2: native-comparison-baseline-applicability.mjs preserves full provenance but compares only material inputs. A changed mixed case.bash cannot establish identical setup, so its saved evidence is insufficient and fresh acquisition follows the same rule. The inspected entry/acquisition/finish paths retain the old archive and save the fresh usable observation; baseline-misses.sh observes changed material input, two sessions, new baseline and later one-session reuse. Derived-only retention/assessor changes are separately observed to reuse sufficient evidence in baseline-reuse.sh. This records an applicability uncertainty, not a new case or delivery rejection rule.


### G2. Changed reader cannot replay all retained metric inputs (discovered before slice 3)
Reported: slice 2 — "Coordinator review before slice 3 implementation: baselineApplicability excludes stream/session readers, but the archive keeps scalar command counts and a stream hash rather than all executed calls and discovery inputs; changed interpretation cannot be re-established after raw cleanup. Deliver the bounded acquisition repair separately before starting the new case."
Story clause: "when a current criterion needs evidence the saved observation lacks, obtain fresh evidence."
Disposition: proved by slice 2: native-comparison-baseline-readers.sh changes the real manifest-listed native-host-stream-adapters.mjs and native-codex-session.mjs, observes two fresh sessions and a usable new archive while previous bytes stay identical. The delivered predicate first failed at the real stream-reader session count (one instead of two); the repaired predicate and existing baseline-reuse.sh both pass, retaining supported assessor/retention replay. The nonexistent-filename probe was invalid attribution and discarded. Entry/applicability/acquisition/finish paths were inspected; absent original reader inputs now select fresh evidence before launch.
Commitment: 22
