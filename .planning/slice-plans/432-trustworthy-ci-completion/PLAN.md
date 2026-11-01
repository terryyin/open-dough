# Restore trustworthy CI completion

**Identity:** SEED-208#trustworthy-ci-completion
**Source:** [Canonical story and complete retrospective](../../seeds/SEED-208-trustworthy-ci-completion.md#trustworthy-ci-completion)

## Goal and scope

Make execution completion trustworthy: complete failure evidence reaches its
owner; diagnosed defects are repaired without losing their proof; final
applicable CI and affected review conclusions describe the accepted state.
The story owns examples, constraints, all historical details and the evidence
archive. This is preparation only: every slice remains planned.

Terry selected this one improvement story and authorized publishing it first
on main. The five slices follow one completion/repair workflow, with the
concrete test defects kept inside its scope. Each delivers a safe useful
increment; no slice intentionally publishes a red or flaky intermediate state.

## Existing solutions and architecture

- Reuse project AGENTS for Open Dough policy, and the shared execution,
  planning, proof and retrospective references for reusable workflow behavior.
  Edit src/skills, with the authoring review in AGENTS.md; never update managed
  installed copies by hand. Keep host discovery adaptation thin.
- Reuse ci-github-diagnostic.mjs and its GitHubActions source, failure
  classification, bounded log handling, attempt identity and existing
  instrumented-gh fixtures. Extend evidence completeness rather than adding a
  competing provider path or unbounded raw logs in coordinator context.
- Reuse tapWhereShown, clippedEdges, native touch and the current layout/read
  settling seams; change the existing responsibility, not a parallel helper.
- Reuse sessionsGets, pausePageClockAt, controlled Codex options and the real
  sessions-read lifecycle in agent-launch-host-switch-fresh.spec.ts.
- Reuse consumer-trace, completion receipts and review continuation. No new
  completion registry, scheduler or global synchronization protocol.
- Follow Accepted ADRs 0002, 0008 and 0010 in docs/adrs. ADR 0009 remains
  Proposed. Preserve current .planning/NORTH-STAR.md direction; this correction
  protects meaningful proof for the existing product-intent review direction.

## Outside-in proof ownership

| Story examples | Slice | Decisive observation |
| --- | --- | --- |
| 1, 2, 10: failure responsibility and real exceptions | 1 | Same failing-publication scenario reaches repair; active other owner is preserved; no unnecessary fix-or-waive request |
| 3, 4: complete evidence, mixed and late failures | 2 | Diagnostic CLI exposes earlier/later identities and all failed jobs; partial/unavailable evidence is explicit |
| 5: moving native target | 3 | Controlled movement exposes current silent miss; repaired helper either taps the intended validated point or refuses clearly; native journeys survive |
| 6: fresh response then actual ordinary poll | 4 | Option B renders after Host switch; after the fresh read settles, an observed later poll is unmarked |
| 7, 8, 9: cause-complete repair and final handoff | 5 | Full affected lifecycle and revised proof are accepted on repaired state; earlier actionable failure cannot be erased by a green tip; branch and trunk gates remain distinct |

## Ordered slices

### 1. Every host carries the project's actual failing-test policy
Type: Behavior
Status: planned
Proof: Walk the failed-publication, known-active-other-owner and explicit
exception scenarios through project guidance and actual planning/delegation
entry points. Use existing owned native replay facilities if applicable;
conventional wording changes require AGENTS.md's representative behavior
review, not a routine paid per-host discovery exercise.

Behavior: A coordinator prepares or delegates work with a known baseline
failure -> it preserves attribution separately from repair responsibility,
carries Open Dough's policy without softening it to fix-or-report, and owns
failures on its publication through repair and final CI. An active other
owner's repair stays untouched; an explicitly authorized exception stays
bounded and truthfully reported. Update contradictory prepared wording only
where it remains active; historical records stay historical.

Reuse the existing failure-policy and delegation references. Make effects
clear in descriptions, examples, headings and linked instructions for Codex,
Cursor and Claude Code. Keep project policy in project guidance; reusable
skills consume the established project's policy rather than imposing ours.

### 2. A repair owner receives the whole failed-test inventory
Type: Behavior
Status: planned
Proof: Extend the existing instrumented diagnostic CLI cases for an early
FAIL followed by a long log and a later FAIL, more than ten failed jobs,
mixed npm/assertion failures, unavailable or held logs, and a later sibling
failure. Run npm test -- src/skills/dough-execute-plan/scripts/ci-github-diagnostic.test.mjs
src/skills/dough-execute-plan/scripts/ci-github-diagnostic-logs.test.mjs,
then every reached diagnostic/acquisition consumer from consumer-trace.

Behavior: Failure evidence is requested -> every available failed job/test
identity remains discoverable, bounded details remain bounded, and partial
logs or a still-changing attempt cannot be mistaken for a complete
infrastructure disposition. Keep existing request concurrency, safe causes,
numeric held waits, exit behavior and same-source provider acquisition.

Do not hard-code one reporter as universal. Recognize the project's known
formats while exposing unrecognized or unavailable inventory honestly; do
not claim extraction completeness where evidence cannot establish it.
Accept repair scope only after all failed jobs/attempts are accounted for.
Replay the full diagnosed cause and nearby lifecycle, not just its last line.

### 3. Native touch proof checks the point it actually uses
Type: Behavior
Status: planned
Proof: Add a deterministic real-browser moving-target regression at the
existing touch-helper boundary; prove failure on predecessor and pass after
repair. Cover stable target, movement and obstruction while keeping actual
native touch. Run the existing story-review-touch, agent-terminal-touch,
sessions-sidebar-touch and final-report-touch specs and reached helper
consumers, choosing representative variants without removing meaningful proof.

Behavior: A target moves between sampling and activation -> the helper
cannot pass a new-center hit check and silently tap its old center. It
observes the actual chosen point and either reaches the intended control or
fails clearly for the relevant unsettled/obstructed condition. Settle the
affected journey's actual transition where necessary. Keep clipping, target
size, real scrolling, focus, rotation and short-screen coverage intact.

Do not label every historic touch failure the same cause. Inspect the
sessions-sidebar/final-report evidence before including either as an instance.

### 4. Fresh Host-switch proof observes the subsequent ordinary poll
Type: Behavior
Status: planned
Proof: Repair agent-launch-host-switch-fresh.spec.ts using real controlled
responses and paused clock. Await the fresh read's settled result before
advancing to an actual regular poll. Run that spec plus the existing
held-revision-after-action and sessions freshness/sharing boundary consumers.

Behavior: The page read A, configuration changes to B, Host changes -> the
fresh response renders B in the Start session dialog. A later observed
regular poll remains unmarked. Capture the relevant response/settled state,
not only request launch; prove that suppressing or marking that subsequent
poll makes the regression fail. Retain the story-launch journey's B proof.

The current implementation is not assumed broken merely because its test
lost an assertion. Change product code only if discriminating proof reveals
a real defect; otherwise restore the test's observation without expanding
freshness to new actions or changing the one-second sharing contract.

### 5. A repaired publication is reviewed and completed on its actual proof
Type: Behavior
Status: planned
Proof: Walk/replay a provisional review followed by a CI repair, a repair
that changes a shared lifecycle, and a later green tip with an earlier unread
failure. Use existing CI completion/coverage fixtures and actual test
boundaries; do not add an implementation-mirroring test for every prose rule.
Run affected completion/late-failure tests and the native behavioral path
when changes reach host delivery, installation or observation semantics.

Behavior: Repair changes reviewed code or proof -> reconsider its affected
outcome and proof conclusions, including whether a distinguishing assertion
was deleted. Verify the complete high-zoom/focus/read lifecycle where the
cause reaches it. A passing retry or final tip cannot waive known flakiness.
Only the applicable accepted target/revision with all known failures
accounted for and confirmed observer shutdown permits successful closure.

Retain the existing ability to review while CI is pending; avoid repeating
the whole retrospective for unchanged conclusions. Preserve a real
incomplete/coordination stop, explicit exception and bounded background handoff.
Record evidence against ODF-150/DD-377/DD-378 and reconcile DD-368/DD-373's
same diagnostic cause with former-code traceability through existing bounded
maintenance. Update DD-376's hosted observation from actual outcomes rather
than reimplementing its delivered setup fix. No shared feedback cycle or
release/client rollout is implied by this story.

## Decisive premises and observations

Preparation basis: main ae6479d3. Project AGENTS, the cited ADRs, diagnostic,
touch helper and freshness journey are unchanged from reviewed aef7858b.
No product code was modified during these observations.

1. Diagnostic omission reproduced by importing failedLogExcerpt and
   diagnoseFailedAttempt from the current source: an early failure + 120
   detail lines + later failure + exit marker loses the early identity;
   eleven failed jobs return ten plus omittedFailedJobs=1. Both omissions
   are observed, not inferred merely from file presence.
2. Real Chromium touch probe imported the current helper. A Locator proxy
   sampled the target box at x=20 then moved the actual DOM button to x=300
   before later evaluations. Both reachability checks passed; native tap
   produced zero intended clicks. Reuse this shape for slice 3's permanent
   failing-before/passing-after regression, not a fake click implementation.
3. Literal route prefix: npm run test:dashboard -- --list --reporter=list
   dashboard/tests/agent-launch-host-switch-fresh.spec.ts
   dashboard/tests/story-review-touch.spec.ts
   dashboard/tests/agent-terminal-touch.spec.ts
   dashboard/tests/sessions-sidebar-touch.spec.ts
   dashboard/tests/final-report-touch.spec.ts
   selected nine tests in five files. This is selection evidence only.
4. Current agentLaunches.ts arms its 15,000 ms sessions timer after the read
   settles; the current Start session test observes pre-switch requests but
   advances no post-fresh clock. Historical failed repairs 51070fa2 and
   256c30f4 identify the specific missing observation. Slice 4 owns the
   future discriminating test; no product freshness failure is claimed.
5. Both project guidance and the generic completion lifecycle already have
   suitable owners. Use the project's policy plus existing receipts; the
   retrospective provides concrete violations, not a need for a new ledger.

## Execution and verification constraints

Use the story's evidence archive and complete retained report, not temporary
host files, for reconstruction. Refresh current truth before each changed
boundary; preserve current SEED-207 ownership and reconcile overlapping work.

Each implementer owns required proof to its terminal result, with literal
commands, setup, assertions and meaningful failed-before/passed-after result.
Inspect named focused proof and changed effects into shared consumers; use
the covering surface's suite when it fits the established feedback budget.
Carry causal neighboring failures into one repair; no known failure is waived
because it predates the story. Preserve the project's normal independent
refactor, selective formatter, commit, publication and asynchronous CI gates.

Before expensive proof, inspect the actual target host's load/memory and
known competing owners; sequence owned heavy work or reduce concurrency
without reducing required coverage. Keep its owner through terminal result.
Do not impose an invented duration target or global serialization policy.

At final publication obtain applicable CI for this story's accepted revision,
and required trunk proof during wrap-up, through the existing observer.
Preserve known unread failures even if the latest run passes. If later CI
changes code, reopen only the affected review/proof obligations. Do not
repair another agent's active tree or stop unrelated sessions.

## Plan review

- Refinement: not needed; five cohesive Behavior slices follow responsibility,
  evidence, the two concrete proof defects, and repaired-state completion.
- One selected outcome: trustworthy execution completion. Safe increments
  improve that outcome without requiring a red intermediate state.
- Reuse decisions and accepted architecture support the approach; no new ADR,
  publication protocol, native delivery mechanism or framework is selected.
- Remaining slice-specific concerns: none at this preparation boundary.
  Current implementation hypotheses are explicitly tested by the owning slice;
  native/installation observations become required if those semantics change.
- Preparation records are not execution permission. All slices are planned;
  no execution-complete section is written during preparation.
