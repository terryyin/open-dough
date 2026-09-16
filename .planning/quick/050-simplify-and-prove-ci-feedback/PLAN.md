# Simplify and prove active-execution CI feedback

Status: executing.

## Source and outcome

[SEED-013 Story 1](../../seeds/SEED-013-minimize-and-prove-ci-watcher-ai-involvement.md#minimize-and-prove-ci-watcher-involvement).
On 2026-09-16 Terry confirmed reliable native feedback and lower AI ceremony/token
cost as joint values, and accepted one or several CI results still pending when
execution concludes. Preserve that gap; do not add waiting or late-result ownership.

Deliver a smaller AI-facing interaction with the existing observer and prove one
real native red-to-green journey. Exclude new providers, CI aggregation, deployment,
idle wakeup, generalized recovery machinery, lifecycle redesign, release/adoption,
and telemetry. Evidence of an irreducible action is acceptable; indiscriminately
hiding safeguards or moving equal ceremony to a different prompt is not improvement.
Final agent instructions must be extremely concise and effective: no substantial
net growth over the baseline, preferably shorter. Replace repetition rather than
append rules; justify any small increase by necessary behavior. Count required
linked guidance and inline code, and preserve clarity and safeguards.

## Planning and delivery context

Use the established `.planning/quick/NNN-description/PLAN.md` layout and
planned/done slice vocabulary. Existing history allocates through 049; 050 avoids
reusing a spent identity. No numeric slice target/hard limit or North Star topic
was found; no new timing policy or North Star is needed.

Execution identity (Story Branch Mode):

- originating checkout: `/Users/terryyin/git/open-dough` on `main`
- claim commit: `bc41b15610c651e8ff33f1782e828c4bfda1a290` (local-only; not pushed separately)
- execution checkout: `/Users/terryyin/git/open-dough/.worktrees/050-simplify-and-prove-ci-feedback`
- execution branch: `quick/050-simplify-and-prove-ci-feedback`
- caller/project integration target: `main`

Replanning permission: allowed (existing planning authority; no `--no-replan`).
ADR 0002 and 0005 constrain simplification and evidence. ADR 0007 remains Proposed;
this execution uses Story Branch Mode as the execute-plan default, not as an
ADR 0007 adoption. The isolated acceptance target below is test infrastructure,
not product delivery.

Apply existing execute-plan implementation proof, independent post-change refactor,
coordinator-owned formatting/commit/push, retrospective, and closure contracts when
execution is authorized. The current repository lint entry point is broad
`scripts/lint.mjs`; do not invent a selective command or assume a hook contract.
Resolve delivery preparation before its first mutation. No product checks are
claimed from this planning turn.

## Existing solutions and coherent direction

PFE inspection found:

- `src/skills/dough-execute-plan/scripts/ci-mailbox.mjs` already owns stream/start,
  push registration, and cooperative stop. The store/worker own identity,
  revision coverage, durable events, and termination. Reuse these responsibilities.
- `scripts/ci-observer-stream.mjs` (relative to that skill) already parses chunked
  receipts, events, and terminal records, but its current callers are tests.
  `references/ci-notify-codex.md` separately embeds an approximately 80-line host
  wrapper with inline parsing and lifecycle bookkeeping. This is a concrete
  duplication and model-context cost to address, not a reason for another watcher.
- `ci-codex-lifecycle.test.mjs` exercises process lifecycle through a replay;
  `ci-observer-stream.test.mjs` exercises stream parsing and fixture delivery.
  Neither proves a real Codex `notify` reaches the active coordinator. Keep that
  evidence useful but narrow.
- `ci-revision-coverage.test.mjs` covers exact pushed revisions using an installed
  fixture and real local Git; host-hook tests cover separate Cursor/Claude bridges.
  `references/wrap-up.md` registers the exact SHA only after confirmed push.
  Preserve registration unless a replacement proves that same ownership boundary;
  branch discovery alone is insufficient.

Prefer a small maintained Codex host adapter using existing parser/mailbox logic,
with only the irreducible host launch/notify/yield boundary exposed to the AI.
Do not assume a Node module can be imported into the host's JavaScript isolate.
First verify the actual loading/capability contract in the native host; keep a
small supported inline boundary if necessary. Do not change global permissions,
add dependencies, or introduce a daemon/registry to shorten a prompt.
The implementation representation is subordinate to this supported-host check.

Capture the pre-change candidate, relevant instruction bytes/lines, required AI
inputs/actions, retained handles, and one attributable available execution trace
before editing. Assess input reading and generated code as well as tool calls.
Use literal token totals only if available under comparable conditions. No new
measurement service or repeated baseline execution merely for statistics.
Use the same affected required-reading scope before and after, distinguishing
ordinary use from conditional recovery. Record a simple word/byte comparison (or
comparable tokens when available); line wrapping or moving required text into a
reference does not establish savings. No numeric growth allowance is invented.

## Ordered slices

### 1. Start one observer and deliver events through a smaller Codex interaction

Type: Behavior
Status: done

Behavior: Given verified checkout/repository/branch and an available Codex bridge,
the coordinator uses a compact maintained launch interaction; one observer starts
and its actionable events reach the owning host boundary without repeated AI
construction of parsing and stream-management code.

Begin with the pre-change evidence above and a bounded native capability check:
can the current host execute maintained adapter logic with its actual tool APIs?
Use a disposable local stream for this check, no remote push. Record the literal
host invocation and observed receipt/notification. This is a feasibility observation,
not acceptance of real CI. If unsupported, narrow to the smallest supported host
boundary before implementation; do not build around guessed imports or tools.

Consolidate actual production stream interpretation with the suitable existing
solution. Preserve chunk tails, initial events before yield, bounded unavailable
reports, exact owner/checkout binding, and one reader. Keep necessary runtime
inputs explicit. Update candidate payload declarations only if distribution paths
change; do not edit managed copies. Walk the changed guidance under AGENTS.md.

Proof: Extend tests at the production adapter boundary, using substitute host tools
only for deterministic transport cases. Assert events before/after yield, fragmented
output and actual launch count; retain the observer's existing same-attempt proof
rather than adding deduplication to the transport. Do not test a separate
reimplementation of the adapter. Run the focused existing baseline command below
plus any new production-boundary cases. Compare the supported new launch recipe
with the retained baseline and name eliminated AI work. Native acceptance remains
owned by slice 3.

Stopping point / sizing: One startup-and-delivery contract. Reuse mailbox acquisition
and coverage unchanged. Native loading is the uncertainty; if it needs a new host
integration mechanism, reassess this slice before adding machinery.

### 2. End observation with less bookkeeping and honest pending coverage

Type: Behavior
Status: planned

Behavior: Given the observer from slice 1 and multiple registered pushes still
pending, the coordinator ends execution through a compact shutdown interaction;
only its observer terminates, unread evidence survives, and outstanding CI is
reported unobserved without waiting for CI.

Reuse the exact retained owner and mailbox identity, cooperative stop and terminal
receipt, and the host's single-reader/reap contract. Move deterministic handle
management into maintained code where the verified host contract supports it.
Retain human/AI judgment for ambiguous identity and repair; do not remove handles
needed for recovery merely to shorten the report. Preserve already-delivered
failure handling. Reuse current recovery behavior, not a new recovery architecture.

Proof: Exercise the actual changed adapter with a real child observer, multiple
registered pending SHAs, and a second unrelated observer. Assert bounded local exit,
no waiting for CI completion, unchanged unrelated process, retained unread evidence,
and honest pending revision coverage. Include unavailable-bridge/failed-shutdown
reporting at the boundary actually changed. Compare startup plus shutdown context
burden with the baseline so ceremony is not merely displaced. Existing lifecycle,
mailbox, stream, and revision-coverage tests supply preserved behavior where their
setup and assertions match; extend only missing observations.

Stopping point / sizing: One shutdown contract, independent of provider or repair
changes. Deliver only after local process exit and preservation proof; cell exit
alone is insufficient. Ordinary outstanding CI is an accepted limit, not a defect.

### 3. Prove the simplified interaction on a real native failure-and-repair journey

Type: Behavior
Status: planned

Behavior: With the candidate in a disposable installed project and an active native
Codex coordinator, a controlled real CI failure reaches that coordinator once for
the selected failed attempt, is repaired using the ordinary protocol under the same
observer, and the exact repaired revision succeeds quietly before local shutdown.

Use the existing GitHub push workflow mechanism (`.github/workflows/ci.yml` observes
pushes) and a unique `codex/ci-feedback-proof-...` acceptance branch in a verified
permitted test target. Record repository, branch, candidate, installed content,
host/runtime, baseline green revision, and observer identity before inducing failure.
Use a disposable checkout with candidate payload supplied through the existing test
installation pattern; never overwrite the maintainer's installed roots. Isolate
acceptance mailbox and coordinator from the observer monitoring product delivery.

The planned failure mechanism is a disposable branch-only CI workflow with one
clearly named deterministic failing job, observed as the selected check. Push and
register the exact failing SHA through the normal delivery/observer boundary; repair
that fixture assertion and push/register the exact repaired SHA through the normal
repair flow. Never merge the deliberate failure into the integration target. This
controlled test input is not a failing product slice delivered as complete.
First exercise the same fixture workflow successfully on its baseline revision;
this distinguishes the intended assertion failure from an unusable runner, missing
permissions, or invalid workflow. The failure must have a distinctive assertion
diagnostic. Repair cannot be accepted merely because a different workflow went green.

Keep one coherent native run active for this acceptance mission. Observe asynchronous
native context delivery before direct run/mailbox inspection can reveal the failure
to the coordinator. It must contain the correct SHA/attempt and actionable bounded
evidence. Do not inject the expected notification, fabricate tool boundaries with
no-op calls, or use an AI polling loop. A bounded supported host wait may keep the
acceptance mission alive; if the bridge cannot deliver during it, record failure
instead of substituting direct CI inspection. Do not require wakeup after the
coordinator becomes idle.

After repair, a deterministic acceptance observer may await the exact CI success
and record the observation bound, run/attempt identities, and absence of actionable
success events. This checks the silent-green promise without inventing a green
notification or making ordinary execution wait. Failure of an acceptance prerequisite
or deadline leaves the proof incomplete; diagnose once before a targeted retry.
Reuse this same run to establish shutdown and the final AI-action comparison.
Do not split its red and green portions into separately complete slices.

Proof: Retain the literal native launch/prompt, pushed SHAs, run URLs and actual
conclusions, delivered native context, repair trace, unchanged observer identity,
and stop/exit evidence in the active plan/evidence location. Red CI, a mailbox file,
replay success, and quiet output alone cannot satisfy native acceptance. Complete
the ceremony comparison as a separate conclusion of this same journey.
Review final instructions against the recorded reading baseline: no substantial
growth, any small increase justified, and shorter where practical. Use this native
journey to assess effectiveness; shorter text that causes guessing, rereading, or
missed behavior fails the criterion. Edit redundant guidance before acceptance.

Assess Cursor/Claude impact against actual changed responsibilities. Reuse valid
native evidence only with identified candidate/mechanism compatibility; deterministic
host tests are regression evidence, not native proof. If shared changes invalidate
native proof, obtain the affected host's representative observation in this slice,
or retain its obligation explicitly incomplete. Do not claim all-host success from
Codex, and do not expand to every scenario on every tool.
Potential reusable locators include Quick 032's `evidence/claude-ci-watch/README.md`
and `evidence/cursor-claude-compatibility/README.md` (under its existing plan
directory). The latter supports native Cursor delivery/shutdown but explicitly
does not establish Claude compatibility-loader invocation; preserve that distinction.
These are evidence candidates to assess, not a current acceptance claim.

Stopping point / sizing: One end-to-end feedback loop, with unavoidable external CI
latency. No invented timing exception. Bound the run before starting from provider
and host limits, and record it. Always stop the exact test observer; if interrupted,
retain branch/commit/observer identity for recovery. Restore a green test target and
remove only owned temporary failure inputs before deleting an acceptance branch.
Missing credentials/target permissions block this proof only, not justify bypass.

## Proof ownership and commands

All paths below are repository-relative. Planned commands have not been run here.

| Promise | Owner and observable proof |
| --- | --- |
| Reduced startup code/context and deterministic mechanics | 1: attributable before/after interaction plus actual production adapter tests |
| Extremely concise, effective final instructions; no substantial net growth | 1 captures required-reading baseline; 2 includes shutdown/recovery text; 3 compares final length and native effectiveness |
| Native failure delivery, correct identity/evidence, no duplicate repair | 3: real CI and native context; 1 preserves stream/identity rules locally |
| Reuse one observer through repair and quiet actual green | 3: push/repair trace, observer identity, exact-SHA provider success |
| Less shutdown bookkeeping, pending pushes need no wait, exact exit | 2: process-boundary multiple-pending/unrelated-observer case; 3 real shutdown |
| No false coverage for unavailable bridge or unresolved stop | 1/2: affected error boundaries; report explicitly in 3 if encountered |
| Preserved other-host requirements and deployable candidate | Each changing slice: affected deterministic checks; 3 native reuse/observation assessment |

Focused starting checks (select only those affected; add newly owned cases):

```sh
node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage.test.mjs
```

If shared host behavior changes, inspect and run the affected
`ci-host-hook-process`, `ci-cursor-lifecycle`, `ci-claude-lifecycle`, and
`ci-custom-host-bridge` tests. For final affected runtime integration use
`bash tests/execution-ci-runtime.sh`; for changed payload paths use
`bash tests/execution-payload-update.sh` and `bash tests/install-ci-host-hooks.sh`
where their boundaries apply. Preserve AGENTS.md's shared-source behavior review.
Record actual literal commands, inspected setup/assertions, candidate and result
when proof is accepted, not merely the planned command.

## Current decisions and remaining concerns

- Joint value and pending-CI gap are settled; no product question blocks planning.
- Use existing mailbox/coverage/repair concepts and a minimal host boundary; do
  not replace them with a second observer architecture.
- Slice 1 native Codex isolate import remains unsupported in this Cursor
  execution; the documented inline host binding is the supported fallback.
  Slice 3 still owns real native delivery/timing.
- Cursor host-bridge readiness: probe printed `CI_OBSERVER` only; no
  `CI_MONITOR_READY` context. Product-delivery CI observation is unavailable for
  this session. Do not promise notifications or start an observer.

## Execution learning and accepted proof

- Learning: this Cursor session has no Codex `functions.exec` / `yield_control` /
  `notify` / `tools.exec_command` / `tools.write_stdin`. Node-module import into
  a Codex isolate is unproved; keep the irreducible launch/notify/yield cell
  inline. A disposable Node fixture stream can prove receipt/parser locally; it
  is not native notification.
- Slice 1 accepted (startup-and-delivery Codex cell):
  - Promise: compact documented cell starts one mailbox stream; events notify
    only after yield; fragments; one launch; bounded unavailable; finished-skip.
  - Boundary: fenced JS in `src/skills/dough-execute-plan/references/ci-notify-codex.md`
    evaluated as-is; `createObserverStreamParser` only for mailbox stream parsing.
  - Setup: substitute `tools`/`notify`/`yield_control`/`load`/`store`/`text` in
    `src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs`
    (`documentedCodexHostBinding` / `runDocumentedCodexHostBinding`).
  - Command:
    `node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs src/skills/dough-execute-plan/scripts/ci-notify-codex.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage.test.mjs`
  - Result: 17 pass, 0 fail.
  - Ceremony: `ci-notify-codex.md` 5979 B / 726 w → 5128 B / 634 w (−851 B / −92 w).
    Inline cell 1916 B / 71 lines → 1690 B / 41 lines. `ci-observer-stream.mjs` is
    not required launch reading. Isolate still copies consume/deliver.
  - Native Codex notify remains slice 3. Shutdown remaining in the same file is
    slice 2.

## Plan refinement assessment — 2026-09-16

Reassessed the three slices against the settled joint outcome. Retained all three;
no slice was replaced and no story resplit is indicated. Tightened slice 1 so
deduplication remains with the existing observer instead of becoming a second
transport rule. Tightened slice 3 with a green fixture baseline and a distinctive
failure diagnostic, and identified existing native evidence with its actual limits.

The cumulative model remains one observer/mailbox and the existing host adapters.
Slice 1 owns launch-to-delivery, slice 2 owns termination, and slice 3 owns the
indivisible real failure/repair acceptance loop. No preparatory framework or
standalone test-infrastructure slice is added. The failure and repair remain one
unfinished mission until its complete observation passes.

Remaining execution uncertainties are the supported native loading path in slice 1
and real notification/timing in slice 3. The former has a bounded first check and
supported-inline fallback; the latter is the actual acceptance question. This
assessment does not claim those observations passed or certify the full plan as
ready for direct execution. There is no supplied sizing exception or numeric
budget, and no further useful static subdivision was identified. If the native
check reveals a materially different integration need, refine the affected slice
before dependent implementation; do not expand story scope by default.
