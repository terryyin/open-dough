# Resume blocked execution on a qualifying change

**Source:** [refined story](../../seeds/SEED-345-session-token-efficiency.md#resume-when-blocked-work-can-advance)
**Source review:** [independent source commitments](source-review.md)
**Identity:** SEED-345#resume-when-blocked-work-can-advance

## Goal and scope

Let a developer leave authorized execution blocked on a paused supplier or host
usage hold, without recurring model checks or reconstructing the execution.
Resume that same work once when its condition qualifies and delivery is supported;
otherwise preserve it and give actionable attention. Terry selected this boundary
on 2026-11-14. A successful automatic Codex journey is required; declaring every
host unsupported cannot fulfill it.

Retain ownership, workspace/branch, accepted proof and revision, unfinished work,
exact condition, supported continuation and next observation/recovery owner.
Keep execution authority, supplier-condition judgment, CI receipt/recovery and
overdue-verification rules. No automatic recovery after host/session exit or
quota resets is promised. Running-verification efficiency, general measurement
tooling, compaction, release and rollout remain outside this increment. These
limits require no rejection of cases the chosen simple mechanism naturally handles.

## Existing solution and architecture

One held execution keeps its owner and exact condition. Its owner judges
observed evidence and native acceptance; event deduplication alone establishes
neither semantic satisfaction nor exactly-once execution.

- `delegation.md` and `overdue-delegated-verification.md` own waiting/liveness;
  their linked `blocked-execution.md` is the shared supplier-hold rule. Running
  verification keeps its existing lifecycle.
- `dough-product-backlog/references/supplier-dependencies.md` owns canonical
  agreements. A supplier publication/completion invites reassessment, not success.
- Reuse Codex identity/acceptance boundaries. Slice 2 exposes the shared Node-only
  daemon connection; the dashboard keeps its lifecycle wrapper. Installed runtime
  imports no dashboard TypeScript and needs no running dashboard/npm dependency.
- Existing CI notify/handoff/completion-recovery references keep their meanings;
  do not add a second supervisor or retarget another owner's observer.

Current Accepted decisions: [0002 — cohesion/reuse](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[0003 — source/release lifecycle](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[0005 — native validation/A/B](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[0006 — executing-agent audience](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
[0008 — repository/local evidence](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[0010 — useful outcome/total cost](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The [North Star session boundary](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment) applies;
0007/0009 remain Proposed. No conflict or new ADR/topic is identified.

## Outside-in proof and decisive premises

The [seed's preparation evidence](../../seeds/SEED-345-session-token-efficiency.md#resume-when-blocked-work-can-advance)
retains the original basis. Reconstruct paused SEED-324 in isolated fixtures;
live SEED-332 is evidence, never a test resource. Linked Slice 1/2 assessments
retain native delivery, command enrollment/replay and CI-recovery observations,
including their limits. [Slice 3](slice3-assessment.md) retains historical Claude
notices, current supported reset research and explicit missing-signal fallback.
Elapsed hours prove no reset; observer termination proves no CI receipt.

| Source example / final promise | Owner | Required observation |
| --- | --- | --- |
| 1: paused work remains recoverable with no model checks of unchanged state | Slice 2 | Start through the workflow entry, retain partial work and accepted proof, enroll the condition, drive unchanged/relevant/unrelated fixture events, and inspect request/continuation counts and retained state. |
| 2: a qualifying change continues the right authorized execution once | Slices 1, 2 | Native Codex re-entry without typed resume, then maintained command-level lifecycle proof. Verify owner, checkout, revision, authority and condition; a publication with insufficient proof leaves the condition blocked. |
| 3: repetition or uncertain acceptance creates no duplicate writer/submission | Slice 2 | Repeat/race the same event, change between initial read and enrollment, and lose acknowledgment after submission. Reconcile native history; retain uncertainty and actionable recovery without blind resend. |
| 4: meaningful deadline or lost signal/CI observation gives actionable status | Slice 3 | Controlled-clock expiry, unavailable/ended delivery and ended CI observation retain local proof, name recovery/owner and preserve the applicable CI receipt requirement. Keep genuine running-command overdue checks intact. |
| 5: host usage hold has an evidenced condition or explicit missing-signal fallback | Slice 3 | Observed limit input plus supported reset evidence or its absence yields the corresponding continuation/attention. No model switch, purchase, guessed reset or new execution authority. |
| Shared behavior and worthwhile improvement | Slice 4 | Representative Codex comparison, shared behavior review and risk-selected affected-host checks; explicit evidence limits; same publication/proof decisions, fewer idle requests, no extra rescue, and total implementation/evaluation cost disclosed. |

## Ordered slices

### 1. Observe automatic Codex continuation across a blocked turn
Type: Behavior
Status: done
Proof: [native held-thread assessment](native-probe-assessment.md) and raw event/acceptance records.

The assessment retains the disposable probe/diagnostic, same-owner delivery and
native settings, failed CLI route and replay gap. G1 required the actual Slice 2
handler observation; no further probe or weakened criterion is authorized here.

### 2. Hold and resume the same execution on relevant supplier evidence
Type: Behavior
Status: done
Proof: Workflow-command lifecycle scenarios plus the selected native Codex path.

After Slice 1 succeeds, implement the smallest coherent retained-hold and delivery
path at the existing execution boundary. Give the developer recoverable work
while the supplier is unchanged and automatic continuation when the exact
condition qualifies. Retain the fields in scope, enroll/reconcile without a
lost-change window, and suppress repeat delivery to an already-handled execution.
Revalidate owner/authority and current supplier evidence before continuing.
Uncertain acceptance stays explicit and recoverable; never launch a replacement
writer or blindly resend. Naturally general condition handling needs no fixture
count limits or separate handlers for every example.

Keep shared policy in one runtime home with only necessary host bindings.
Update delegation callers and documentation together; retain the existing
running-verification route. Use command-level fixtures with real retained files
and native transport substitutes for deterministic errors/races, observing through
the workflow entry rather than supplying the promised state in test setup.

### 3. Give actionable attention when blocked execution cannot safely resume
Type: Behavior
Status: done
Proof: Controlled events/clock through the same held-execution entry and output.

Extend that same lifecycle for meaningful deadlines, unavailable/lost signaling,
and usage holds. State the attention route and its supported lifetime when
enrolling. If no live route can deliver, report the limitation before yielding;
never promise a spontaneous alert after all relevant hosts/processes have exited.
Retain the condition, known state, accepted local proof, outstanding CI proof,
exact recovery and owner. Use the existing expected proof window/CI coverage
rules; invent no universal duration or new command timeout.

Check supported read-only host reset evidence without inducing a real usage
limit. Absence takes the agreed attention fallback. A fixture-provided reset
tests handling only; it does not prove a real host publishes that signal.
Exercise repeated attention/recovery and CI coverage loss; reuse SEED-343 managed
completion recovery rather than rearming observers or manufacturing CI success.
An unavailable native route stays visibly unavailable on that host.

### 4. Verify useful behavior and effort on representative native journeys
Type: Behavior
Status: planned
Proof: Retained native comparison, required host-specific observations and review. New assay tests also require hosted CI stability proof before acceptance.

Run the complete supported Codex supplier-pause journey from workflow invocation
through hold, qualifying evidence, resumed work and the same publication/proof
decision as a stated baseline. Reuse the research interval as historical problem
evidence; it is not a matched runtime baseline. Establish a bounded prospective
baseline/candidate with the same fixture, host/configuration, proof and relevant
events. Pin the payload source revision and installed content in each isolated
arm, varying only the blocked-wait behavior. Keep the smallest runnable example
with its real-work origin, workflow/problem and host/environment traits; do not
build the general comparison tooling owned by SEED-346. Record coordinator plus
worker requests/tokens where native history
provides them, idle-only requests, rescues, and tool/evaluation/maintenance effort.
Success requires zero recurring model requests solely for unchanged blocked
state, one accepted continuation and no extra developer rescue. Claim observed
improvement only for the comparable result actually obtained.

Review shared guidance's invocation, required context and useful outcome under
AGENTS.md for Cursor and Claude, including executing-project audience and the
fallback's truthful status. Reuse evidence only when behavior, integration and
runtime conditions still match. Select additional native cases for a new or
materially changed host integration or consequential acceptance risk, recording
why that host needs the observation; conventional guidance alone adds no routine
per-host native gate. Keep unobserved paths explicit and withhold release until
the required native evidence exists under current ADR 0005. Judge run artifacts
now, remove spent artifacts at wrap-up, and retain reusable examples and lasting
findings. No full host-by-scenario matrix is required.

## Current decisions and local gates

- This plan grants no authority itself; execution uses the established start
  below. No blocking story dependency: SEED-343 is delivered; SEED-332 and the
  effort-accounting sibling are not prerequisites. Follow Terry's 2026-11-14
  ADR 0005 update, incorporated by preparation at `9900b8d21922c8cd97ffc9e872e76a0ff59af489`.
- Follow [AGENTS.md's failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for local/published failures, including base failures; only an
  exact active repair owner provides a coordination boundary.
- Resolve test-source MakeMe/PageObjects selection before edits. Use observable
  events or controlled clocks; no sleeps, `test.slow()` or suite/hook timeouts.
- Local gates: affected command/runtime tests and retained CI-recovery tests,
  native probe/comparison, payload/reference checks when changed, applicable
  lint/typecheck and required refactoring/reviews before commit. Full-suite work
  follows [local resource admission](../../../Distribution/tests/local-test-resources.md).
  On fully awake macOS use `caffeinate -s -i` for long/full runs on AC power;
  on battery plug in, or use the maintained lid-open `caffeinate -i` alternative
  and inspect the sleep log. Hosted CI is still owned through the applicable
  final revision; configuration alone adds no unrelated local full-suite gate.
- Keep implicated files <=250 lines through cohesive seams; no caller omnibus.
  No numeric slice target or overrun override was supplied. Preserve existing
  replanning authority and bounded observation loops; do not widen after probe failure.

## Accepted evidence and current refactor decisions

- [Slice 1 assessment](native-probe-assessment.md) and `native-probe-run/record.json`
  retain native identities/settings/commands and the failed proxy/CLI route.
  Client closure leaves the writer loaded; use same-daemon `turn/start` after
  exact-history reconciliation.
- [Slice 2 proof/refactor](slice2-assessment.md), [native records](slice2-native-run/record.json),
  and [trace](slice2-consumer-trace.md.gz) retain accepted CLI/race/native proof;
  G1 replay and G4 terminal retention are proved, with independent refactoring complete.
- [Slice 3 proof](slice3-assessment.md) retains inspected attention/loss/usage,
  full CI recovery context, host research and G5's reproduced/corrected duplicate.
  Command proof and independent refactoring are complete.
- [Distribution integration](distribution-integration.md) adopts Terry's published
  layout; SEED-334's affected backend/integrated/e2e group proofs passed.
  Main `55da0eecf` brings SEED-346's comparison/session tools: [Slice 4's trace](slice4-consumer-trace.md)
  reconciles their reuse; full-workflow comparison and native attention remain open.
- Slice 3 refactoring is complete; assessments retain all proof and identities.
- [Slice 4 assessment](slice4-assessment.md) records incomplete native comparisons; progress publication keeps Slice 4 planned while CI tests the new observer/FS counterexamples.

## Execution context

- Identity `SEED-345#resume-when-blocked-work-can-advance`; publisher
  `dashboard-territory.local-open-dough`; agent `terry-chan`; mode story-branch.
- Owned checkout `/Users/terryyin/git/open-dough/.worktrees/resume-blocked-work-when-it-can-advance`;
  branch `codex/resume-blocked-work-when-it-can-advance`. Originating/default
  `/Users/terryyin/git/open-dough` is separate, not an edit target.
- Remote `origin` (`terryyin/open-dough`), integration `main`; increments publish
  `refs/heads/codex/resume-blocked-work-when-it-can-advance`.
- Start `3458a36c6393683827f5ba0e9bd038dbfded8605`; Take
  `8f88bf2ca6d4e7fb7aabc704070be4c549397675` confirmed on trunk/branch; no second claim.
  Accepted: Slice 1 `58f1eb1ad8ef04cb59f8eb06a90881335d5ccec6`; Slice 2 `174c6d2b9a0ebb4989ad84cfb2a83e6d762c656b`; Slice 3 `2a01f9603a64a87f8b1ae646218efad16848d5e6`.
  Latest accepted base `0bc39b172c9a99bf8b627c0a1d527e3c8983ee61` integrates main91f (suffix `071122f6bd04602427934d3d526e317062b15ef4`), registered on the same observer.
- Setup: locked `npm ci` and dashboard typecheck passed here; `.githooks/pre-commit`
  owns staged lint/script typecheck and `npm run format` owns selective formatting.
  Assessments retain prior admission/costs; reconsider headroom before long proof.
- CI: GitHub Actions `ci.yml` / `CI`, workflow 351271804; Take on `main` unobserved.
  Execution observer coordinator `seed345-resume`, directory `/tmp/dough-ci-501/watch-sAay9N`,
  PID `76767`, session `79549`, yielded cell `g153:12`, key
  `ci-watch-execution:terryyin/open-dough:codex/resume-blocked-work-when-it-can-advance:seed345-resume`.
  Runtime/working directory bind to the owned checkout.
- Dashboard launch `ec85a3ea-f7ec-4e3f-94d7-4152850d8d4f`: retain the supplied
  reporting command and landing-context path through closure. First trunk
  publication captures that context; later trunk repairs do not.

## Story obligations

### G1. Drive replay through the successful workflow handler
Reported: slice 1 — "The post-RPC replay was an evidence/history reread with a hardcoded count; actual duplicate events reached only the refused CLI route."
Story clause: "no competing writer or blind duplicate submission is started."
Disposition: proved by slice 2: blocked-execution.test.mjs live-handler replay and slice2-native-run native-accepted/native-completed/history records, one accepted turn after actual replay
Commitment: C50

### G2. Actionable deadline, unavailable delivery, usage and CI-loss attention
Reported: slice 2 — "Deadline/CI-loss/usage handling stays with Slice 3."
Story clause: "with actionable status for an unavailable signal, missed deadline or lost required CI observation."
Disposition: proved by slice 3: inspected CLI attention/loss/usage tests, full retained CI recovery context, controlled clocks and explicit host-evidence limits in slice3-assessment.md

### G3. Full workflow invocation and comparative proof
Reported: slice 2 — "full skill invocation and comparative judgment stay with Slice 4."
Story clause: "Initial comparative proof in Codex"
Disposition: receiving slice 4

### G4. Preserve a terminal event across failed live rearm
Reported: slice 2 — "Independent refactor found terminal(turn) drops completion while rearming; if rearm fails, the completed turn is never reapplied and the worker can remain accepted indefinitely."
Story clause: "When the recorded condition changes, the correct execution resumes or gives actionable attention, preserving its ownership, work and outstanding proof."
Disposition: proved by slice 2: blocked-execution-races.test.mjs failed-live-rearm completion regression; pre-fix53781 failed accepted≠continued and repaired2121 passed, retaining one submission, original generation/proof and ended worker

### G5. Recovery must preserve a settled continuation
Reported: slice 3 — "Coordinator source review found generic recover reenrolls the original input after continued, so stale observed evidence can submit already-completed work again."
Story clause: "no competing writer or blind duplicate submission is started."
Disposition: proved by slice 3: blocked-execution-loss.test.mjs reconcile-to-continued-to-two-recover regression reproduced accepted≠continued, then retained settled generation/proof and one submission after correction

### G6. Observe native attention handling
Reported: slice 3 — "New attention semantics have deterministic command proof, not a new paid native observation."
Story clause: "When the recorded condition changes, the correct execution resumes or gives actionable attention, preserving its ownership, work and outstanding proof."
Disposition: receiving slice 4
