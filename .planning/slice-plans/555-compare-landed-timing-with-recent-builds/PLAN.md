# Compare landed timing with a filtered moving average

**Source:** [selected story](../../seeds/SEED-285-landed-ci-timing-history.md#compare-landed-timing-with-recent-builds)

**Source review:** [Source-only commitments](source-review.md)

**Identity:** SEED-285#compare-landed-timing-with-recent-builds

## Goal and scope

A developer can compare the latest recorded landing, a Done story's landed wall
time, or a selected entry/folder/file's test execution time with an explainable
prior-build average. The story's Scope and Key examples own the product rule.
Calculate from retained local observations only, show observed values and
exclusions, and preserve the current Intent reading and CI lifecycle.

The initial calibration uses up to 20 retained prior distinct measured builds,
with the selected attempt and any measured revision at/after the represented
endpoint excluded. Compute the median once, exclude values strictly above
115% of it, then arithmetic-mean at least five remaining samples. Keep complete
fast values and zeros. Do not round before filtering or calculation. This is
an inspectable reference, not causal attribution or statistical confidence.

The delivered store retains 20 measured builds in total, not 20 predecessors
per Done story. A retained selected build therefore has at most 19 prior
samples, fewer for an older retained endpoint or after exclusions. This may
span about a day on Open Dough; the actual count/span and insufficient-history
state own that limitation. Do not extend retention to satisfy the minimum.

Exclude reruns, slowdown flags, configurable thresholds/windows, more retention
or backfill, historical rename inference, a separate Done wall-time chart and
new CI acquisition. Planning authorizes no implementation or Take.

## Architecture and PFE

See [retained preparation context](context.md).

## Outside-in proof ownership

Every new capability needs failing-first proof; existing helper observations
below prove reusable meanings, not this comparison. Integrated scenarios use
real retained landing/attempt/proof inputs from supplier fixtures and consume
the normal authenticated local-history path. A fixture-supplied finished average
would bypass the selection, filtering and no-acquisition promises.

| Source promise | Owning slice and observable proof |
| --- | --- |
| Project wall-time reference, exact 15% boundary, one median pass, five-sample minimum, fast values, zeros and counts/span | Slice 1: project CI status journey plus focused reference contract checks. Independently expect 100,100,100,100,115,116 → median 100, mean 103 over five; selected 120 → +17 and percentage from 17/103. Keep the excluded 116 point and linked reason visible. Include even median, unrounded boundary, four after filtering, fast complete and zero-median/zero-average cases. |
| Window, gaps, complete declared proof versus measured test durations, no replacement from outside retention | Slice 1: retained 20-build fixture including endpoint gives at most 19 prior samples; distinct incomplete/failed/pending/missing reasons; entry-only untimed but present proof qualifies wall time. Reject missing/ambiguous/empty proof, not zero. Assert no provider request caused by opening/refreshing the reference. |
| Exact selected Done endpoint, same-build exclusion, future proxy rejection, equivalent/later provenance and old endpoint unavailable | Slice 2: Done result with multiple publications of one story identity, a shared equivalent attempt, and earlier cancelled landing resolving beyond the endpoint. Assert the exact candidate identities, selected value/provenance, count, average and difference. Add later unrelated history while retaining its preceding samples and verify the Done reference unchanged; separately evict prior samples and observe the changed reference or insufficient-history state. Selected cancellation keeps its labelled later result without leaking it into baseline. |
| Entry/folder/file measure and matching, hidden-tree contributor, complete fast/zero, changed entry/unit, no breakdown, partial/missing selected timing | Slice 3: drill entry Summary → folder Summary → file Proof through collected scope history, assert independent sums/reference and specific excluded reasons. Unrelated-entry gap does not reject complete scope. Prior reference can remain when selected timing cannot support a difference but its entry/path/unit identity is evidenced; missing terminal identity plus changed historical units/owners keeps labelled segments without a combined reference. |
| Existing Baseline/Branch/Landed, Purpose/Proof, history failure/retry and selection survive | Slices 2–3: enclosing comparison assertions plus navigation and fail/retry of history only; original comparison and selected Done endpoint remain. |
| Local-only reading, including refresh/revisit/restart; same evidence by keyboard/phone/screen reader | Every slice: settle/account for independent existing live reads, then count provider operations around reference browsing. Reuse supplier persistence proof, adding comparison after isolated server/store restart. Observe words/marks, usable links and focus at narrow width; no colour-only exclusion. |

Arrange every automated test's domain data through shared MakeMe builders
([test data architecture](../../../tests/README.md#test-data-architecture)).
Reuse/extend landing, run/attempt, proof-entry and retained-history builders;
expose case-driving facts at call sites. Inputs whose exact form is under test,
actions and independently calculated expectations stay outside builders.

## Ordered slices

### 1. Read an explainable prior-build average in project CI status

Type: Behavior
Status: done
Proof: New project-history browser journey through retained observations and
normal local read, plus focused deterministic cohort/eligibility/filter checks.

Behavior: Given collected complete successful wall times, open project CI status
→ see the latest represented landing's value, prior-build average, signed time
and percentage, sample count/span, and the reference line beside unchanged
observed points/gaps. Evidence names which attempts were used or excluded and
why, including the median/15% rule. Four post-filter samples show insufficient
history; five suffice. Measured zero remains valid and a zero reference has no
percentage. A selected measurement without usable proof retains any usable prior
reference with an unavailable difference. No older evidence is fetched to fill
the reference and no upstream read starts on browsing.

First reconcile the delivered project-history owner and plan 554's proof
extension for completeness and endpoint order; use the current owner.
Build the common selection and reference rule within that reading domain,
not a new persistence or provider path. Include
all safety boundaries from the start: selected-attempt exclusion, no measured
revision at/after endpoint, one attempt once, single-pass median filter, exact
threshold, complete fast observations and separate wall-proof eligibility.
Keep accessible evidence and local-read retry usable with no average.

### 2. Compare a Done landing against its own historical reference

Type: Behavior
Status: planned
Proof: New selected-Done wall-time comparison journey through the actual endpoint
and retained-history reader; affected existing story comparison journeys.

Behavior: Given one story's preparation, execution and later publication, select
the execution's Done result → the existing CI timing comparison also shows its
wall-time reference using only prior retained attempts before that exact
published endpoint. Later builds never enter that reference; it stays unchanged
while the preceding retained samples stay unchanged. Eviction may change or
remove the reference and must update its count/span or insufficient-history
reason. An equivalent
selected build never enters its own baseline through an earlier landing; an
older cancellation's future measured build never becomes prior evidence. A
selected cancelled landing can still show its labelled later result. Outside
retention or unavailable selected proof is explained beside available timings.

Reuse slice 1's reference rule and the supplier's endpoint context. Show compact
metrics labelled Prior-build average beside the current comparison, retaining
Baseline/Branch/Landed and their links. Do not add a separate Done wall chart.
Exercise local-history failure and retry without replacing current evidence or
selection, and show the same comparison from retained evidence after restart.

### 3. Follow the reference through entry, folder and file timing

Type: Behavior
Status: planned
Proof: New entry → folder → file Done-story history journey through validated
retained proof and normal scope projection, plus focused matching/completeness
checks and the affected enclosing Summary/Proof journeys.

Behavior: Given collected proof for the selected Done landing and prior builds,
open entry Summary, a folder, then file Proof → each shows its own comparable
execution-time reference, elapsed difference and percentage with included and
excluded evidence. An entry can use complete entry-only totals; folder/file
needs complete breakdown. Include published contributors outside the visible
tree. Preserve supported path/entry/unit matching and observed folder membership;
unsupported identity, missing breakdown or partial timing is explained and
excluded. Complete fast readings and measured zero stay eligible. Another
entry's gap cannot suppress this scope's complete measurement. When the selected
scope is unmeasured but its entry/path/unit signature is evidenced, an earlier
matching reference remains and its difference has a reason rather than a lower
bound or invented zero. If terminal identity is unavailable, keep supported
historical segments but explain that no comparable reference can be established;
never pool distinct units/owners or obtain identity from current trunk.

Apply the same selection/filter rule to the supplier's complete scope readings;
reuse precise duration formatting. Existing Purpose/Proof navigation and story
selection survive. Prove keyboard/narrow-width evidence and independently retry
history. Browsing and revisiting scopes, including after restart, uses local
collected data without provider acquisition.

## Verification and delivery gates

See the [required gates and preservation commands](context.md#verification-and-delivery-gates).
Local gate: focused journeys/contracts, affected consumers, dashboard typecheck,
and the check-only hooks. Start fully awake; on AC use `caffeinate -s -i`;
on battery plug in or use `caffeinate -i` with lid open and inspect the sleep log,
per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Use Homebrew Bash 5 first on PATH. The [failure policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Decisive premises and observed results

See [retained preparation context](context.md).

## Current decisions and learnings

- The initial rule is the refinement's stated calibration, not a decision to
  enable the later story's automatic rerun or its separate 5% hypothesis.
- The existing retained cohort bounds prior candidates. Exclusions do not cause
  acquisition or backfill, and missing/partial values never become zeros.
  The delivered 20-build total permits at most 19 prior samples for a retained
  measured endpoint; older Done results may have too few or no retained samples.
- Read the selected represented endpoint separately from its measured attempt;
  shared equivalent and later-trunk sources require both identities.
- A horizontal average reference belongs to the displayed endpoint. A whole
  curve of historical moving averages is outside this increment.
- All planned proof is still owed. Preparation observations establish current
  reusable behavior and route availability, not execution completion.
- SEED-288 pending refresh and proof-free adapter equivalent timing were already
  delivered in the Take base (closures `2d0564ff` and `9743bf1a`; product
  revisions `3322a6fd` and `eb2bfebe`). Current supplier/adapter/provenance
  proof consumes them; proof-free wall-time points remain ineligible for this
  reference. At pinned trunk `6894595d`, no dashboard change arrived since Take.

## Delivered-history amendment — 2026-11-09

Terry's follow-up reconciles this plan with the delivered 20-build store and
plan 554's proof-retention responsibility. Retain all three Behavior slices,
their existing proof maps and calibration. No larger window, slice replacement,
sizing exception, resplit or execution is introduced. Reassess against the
actual published proof extension before dependent integration.

## Execution resume context

- Established execution: `SEED-285#compare-landed-timing-with-recent-builds`,
  publisher `dashboard-territory.local-open-dough`, agent `ebacky-chan`.
- Story Branch Mode in
  `/Users/terryyin/git/open-dough/.worktrees/compare-landed-timing-with-a-filtered-moving-ave`,
  branch `codex/compare-landed-timing-with-a-filtered-moving-ave`; reused owned
  linked worktree. No integration checkout was supplied; authorized remote trunk
  is `origin/main`. Starting revision `bcca33e08de6f9e1850a2e479ea8210acc74576c`.
- Accepted Take and previously published branch base:
  `dd628ef6d9028c2544538b4b664a413d17c308c2`; remote branch confirmed at that SHA.
  Claim CI is unobserved. Retain Changed since readiness review; no renewal.
- Checkout setup: `npm ci` and `npm run typecheck:dashboard` passed 2026-11-10.
  Selective formatter is `npm run format`; `.githooks/pre-commit` is check-only
  staged lint plus dashboard typecheck when scripts are staged.
- Replanning retains the existing planned authority; no hard slice limit or
  override supplied. Relevant Accepted ADRs 0001, 0002, 0008 agree with the
  catalog; preserve shared domain meanings and derive from existing local data.
- Observer: GitHub Actions `terryyin/open-dough`, verified `ci.yml` / `CI`, target
  `codex/compare-landed-timing-with-a-filtered-moving-ave`, coordinator
  `seed285-execution`, directory `/tmp/dough-ci-501/watch-TlDu0P`, PID `99182`,
  stream session `33700`, yielded cell `g807:11`, checkout as above. Runtime is
  this checkout's `.agents/skills/dough-execute-plan`; default 100 startup / 20
  later discovery bounds. Managed delivery must use this observer identity.

Plan record structure: retain the ordered behavior/proof and execution state in
this plan; unchanged architecture/PFE and premise observations are linked in
`context.md`. This separates preparation context from active execution without
changing scope, proof ownership, or retained source readiness.

Slice 1 semantic proof accepted 2026-11-10; delivery remains pending independent
refactoring. Original setup → expected reference → actual assertions are mapped
per id in source-review.md, with exact commands/setup/observations and causal
failure repairs in /tmp/seed285-slice1-return.md. Accepted: 12 reference/date
contracts, retained proof/order/scope contracts, 25 chart observations (24 reused
plus repaired provenance), 37 supplier observations (34 reused plus 3 precise
matcher repairs), 19 enclosing observations (12 reused plus all 7 repaired
journeys), isolated restart/local-only/phone/keyboard/provenance, and final
TypeScript check. Broad failed runs retain their verdicts; every failed case has
causal correction and current passing proof. No observation remains deferred.
Freshness unchanged at trunk 6894595d; no incoming named-sibling product effect.
The source-only review is unchanged; this accepts proof without renewing Ready.


Independent refactor accepted: common rule solely owns ordering; prepared-reading
fixture name and used canonical builder are coherent. Twelve contracts, real
local-order API and both relative journeys, typecheck and whitespace passed.
Correspondence/trace: `/tmp/seed285-refactor1-return.md`; unchanged proof reused.

Typing/fixture lint repair accepted after guarded formatting refusal, before any
commit or push. Explicit measured-value/median/ISO/fixture guards preserve facts;
12 contracts and typecheck passed; browser observations reused. See refactor
report addendum and `/tmp/seed285-refactor1-typing-consumer-trace.md`.

## Story obligations

### G1. Invalid reference dates could hide retained gaps
Reported: slice 1 — "An invalid kept startedAt was copied into reference evidence.date and buildDateWords could throw, hiding the existing gap."
Story clause: "Keep observed points and existing gaps visible."
Disposition: proved by slice 1: tests/support/ci-prior-build-boundaries.test.mjs invalid measured dates; tests/support/ci-prior-build-reference-schema.test.mjs malformed date paths; dashboard/tests/intent/intent-ci-prior-build-states.spec.ts invalid measured start normal-reader gap/average/reason/date/link. Literal passing commands are retained in /tmp/seed285-slice1-return.md.
Commitment: C84
