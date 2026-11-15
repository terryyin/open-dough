# Faithful watch reproducer: controlled preparation decision

Status: native preparation implemented; focused controlled renewal passed. Native
intervals and six-journey cap are approved. No supplier-watch native journey,
repeated native model behavior or saving was observed. Slice 3 is incomplete.

## Responsibility and PFE

Deliver supplier publications while the consumer's genuine watch turn is
active; retain the watch's actual host receipts, proof and exact resource
ownership. The goal is to distinguish repeated empty model re-entry from a
clean hold or passive watch without instructing the model to poll.

Searched the comparison runner, supplier cases, native supervision/retention,
CI completion journeys, owned-process helpers, native stream/session readers,
and dashboard native launch/control support. These are the decisive candidates:

| Existing owner | Evidence and disposition |
| --- | --- |
| `Distribution/tests/support/native-comparison-run.sh` | `native_comparison_turn` synchronously owns one CLI turn; `case_events` advance only after it returns. Scheduling belongs here, but the current after-turn loop cannot deliver the missing condition. Change this owner rather than add another journey runner. |
| `Distribution/tests/support/ci-completion-native-fixture.sh` | `ci_completion_controller` independently waits for review/CI operations and releases fixture producers during native execution; the generated adapter waits with `fs.watch`. Reuse this observable-barrier pattern conceptually. Its review/CI markers do not exist in the supplier domain and must not be imported as a requirement. |
| `Distribution/tests/support/ci-completion-native-run.sh` | Starts the controller before the native call and joins it afterward. This establishes the in-flight scheduling precedent, but is insufficient for this case's failure contract: a controller failure must stop an active owned native run promptly. Do not copy its lifecycle as proof of that property. |
| `Distribution/tests/support/native-comparison-supplier.sh` | Already owns isolated remote/checkout materialization, paused supplier facts, nonqualifying/qualifying Git publications, partial-work observation, integrations/filings and proof. Reuse it, with a narrowly selected pre-correction starting overlay. Keep the existing cases unchanged. |
| `Distribution/tests/support/native-run-supervise.sh`, `scripts/owned-process-group.bash` | Own native process groups, bounded deadlines, watchdog and TERM/KILL/reaping. Add any needed controlled-controller ownership through this lifecycle; do not create a second process supervisor or use a PID guessed from the agent's text. |
| `Distribution/tests/support/native-host-stream.mjs`, `native-host-stream-codex-session.mjs` | The maintained host boundary owns stream decoding and session ownership/usage. Its saved-session adapter presently exposes command receipts but drops direct `write_stdin` calls and receipt session IDs. Extend this boundary only if the chosen observation needs them; do not add a parallel JSONL parser. |
| `Distribution/tests/support/native-comparison-retain.sh`, `native-comparison-pair.sh` | Own input hashes, local raw session/worker retention, frozen payloads and matched conditions. New case/controller/observation files must participate in these identities. The pair currently derives turn count from `case_events`; an in-flight event must not silently become an extra forced model turn. |
| `dashboard/server/hosts/codex/`, `dashboard/tests/support/watcherNativeCodex.ts`, `dashboard/AGENT-LAUNCH-HOSTS.md` | Own persistent production conversations, native RPC interruption and an isolated vendor daemon. They are a different lifecycle from the comparison CLI journey. Importing them would expand the host adapter/daemon scope and change the experimental surface; reject for this bounded case. |
| `Distribution/tests/helpers/wait-for.bash`, watchdog FIFO | Bounded waits for an observable event, including controllable safety-deadline expiry. Neither supplies an unchanged-condition observation interval independent of model activity. A safety deadline must not be relabeled as a supplier's qualification event. |

Choice: the comparison journey remains the scheduling authority, supplier
helpers remain the domain fixture, supervision remains the resource owner,
and the shared reader remains the only host decoder. No product daemon,
notification delivery, enrollment, general state/context protocol or new host
adapter is justified. If implementation grows the 212-line journey runner past
250 lines, extract turn execution into a focused sibling helper; keep the
journey API and scheduling owner stable and include the helper in evidence hashes.

## Proposed case inputs

Use a separate `supplier-watch` case so the paused forced-wake and ordinary
unblocked cases remain preservation/continuation regressions. Reuse their
small real Node project, isolated Git remote and proof. The new initial seed
omits the post-correction `dough-story-dependencies` waiting block; preserve
its ad-hoc supplier ownership and exact unmet acceptance condition in the plan
and execution-state record. Never erase a dependency block the agent creates.
The supplier is paused, no proof producer runs, its clean diagnostic is not
stability evidence, and the consumer's partial slice 3 remains uncommitted.

Proposed first instruction, preserving the existing execution authority:

> Use this project's installed Open Dough execution guidance to continue the
> Story Branch execution described in .planning/execution-state.txt as its
> execution coordinator. You may commit on the execution branch, but do not
> push or publish, and do not start slice 4. Treat installed guidance and
> project files as task inputs; do not inspect parent processes or external
> test-harness source.

After that ordinary turn completes and the observer records its actual state,
submit one actual new user message in the same native conversation:

> You watch it: watch for SEED-332's publication and continue this execution
> when its required outcome is available.

Do not add the old "end your response" cue, automatic wake messages, a command
to construct a particular helper, a session number, or the expected hold/poll
answer. The agent may hold, formalize the agreement, or choose its own watch.
Genuine session/process handles must originate from the host, never fixtures.
A canonical-waiting-agreement variant is an input control, not a replacement
for this pre-correction profile or a second mandatory paid probe.

## Approved native observation schedule

Terry's latest 2026-11-15 "approved" accepts the scoped exception and total
six-journey cap. The supplier-watch case may use two fixed 180-second unchanged
windows. The first begins at the watch-request turn's start and releases a
nonqualifying publication; the second releases qualifying publication. Releases
are independent of model polling. Scripted checks still advance a controlled
clock; this native-only exception does not change AGENTS.md's general rule.

A passive watcher may emit no intermediate receipt, so release after N empty
polls would bias the experiment and strand efficient behavior. Fixed intervals
avoid that dependency. Turn start is not actual watch exposure: setup may consume
the window. Retain authentic handle timing and report insufficient/unknown
exposure rather than infer a fix. A bounded window cannot disprove a later loop.

Do not launch the native route until authentic observation and compact replay
checks pass and root freezes the reviewed source. No new host adapter, daemon
or event-delivery product is authorized.

## Frozen observations and proof before native launch

Freeze the case, inputs, intervals, source payload, host/version, settings,
authority and the following verdict before any native launch:

- Report initial hold, watch-request start/end, producer publications and
  native completion as separate events. Retain exact raw stream/session
  locators and event order. If the watch turn already ended before release,
  record that fact as not reproducing an active repeated-wait path; do not
  fabricate an in-flight turn or resume automatically.
- The initial unchanged window ends at the nonqualifying publication. The
  second ends at qualification. Count unique owned native responses in each
  window through the shared reader, keeping copied history and workers
  separately attributable. Complete-task cost still includes every turn,
  worker, recovery and intervention; a window subtotal is diagnostic only.
- The frozen decisive signal is at least two empty nonterminal wait
  receipts on the same owned supplier-watch candidate, each followed by a distinct
  owned model response before any supplier fact changed. Preserve call/receipt/session,
  native turn/response and order identities; one bounded liveness check or
  necessary state-change response does not meet that signal. If the host
  cannot expose those identities reliably, record unknown, not zero.
- Empty re-entry is the reproduction signal, separate from behavioral
  quality. A passive watch or clean hold with no such signal is
  not-reproduced, not proof that the hypothesis is false or fixed generally.
  A short window can miss a later loop; no statistical claim follows.
- Snapshot partial files, supplier reader, dependency state and integration/
  filing counts before publication and after the nonqualifying publication,
  without modifying the agent's checkout or requiring a model response.
  Qualification must result in one integration/filing and owned plus
  independent passing proof. Do not require a preinstalled canonical block.
- Do not keep an ended native process alive merely so publication appears
  in-flight. Do not skip unresolved quality failures to obtain a favorable
  cost result. Retain unknown accounting and event-order failures truthfully.

The implemented controller lifecycle is described below. Domain publications
never run from cleanup or after controller failure. Controller files remain
outside the task workspace; installed task inputs stay matched across arms.

Credential-free proof must first observe nonqualifying and qualifying Git
publications while a scripted host turn remains active, then exact
continuation/proof and final owned-resource absence. Advance the controller's
clock explicitly; no wall-clock delay. Exercise a passive host that emits no
polls, a busy host, model early exit, failed publication/controller, host
failure, timeout and interruption. A failed controller must terminate an
otherwise active model and cannot manufacture a qualifying result. Compare
observed partial-work state at the nonqualifying barrier and final exactly-once
proof. Reject fake/stale sessions, premature continuation, lost/rerouted work,
duplicate filing and missing proof through the existing counterexample owner.

Before authoring, select `native-comparison-supplier-watch.sh` and
`native-comparison-inflight.sh` (already resolved MakeMe true, pageObjects false)
and every additional test source. Build domain facts through shared MakeMe;
retain exact native wire encoding only in its approved emitter/reader owner.
Both selected checks were authored using those conventions; the project overlay
constructs its preserved supplier agreement through shared MakeMe.

Required focused proof for this implementation: both new checks, native stream replay,
assessor counterexample guard, existing paused/unblocked journeys, affected
retention/pair/evidence-identity consumers and supervision/ownership checks.
Use `env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <paths>`; inspect
load/memory/AC and use the maintained macOS sleep guard for long runs. Apply
[AGENTS.md's failure policy](../../../AGENTS.md#failing-and-flaky-tests) as written.
Substitutes establish harness behavior only, per
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).

## Implemented controlled boundary

`native-comparison-turn.sh` retains the journey's existing turn API.
`case_prepare_run` refuses before a model starts; `case_prepare_turn` supplies
an optional `native_run_controller_command`; `case_observe_stopped` retains an
ended attempt without inventing a completed watch. Existing cases have no
callbacks. `native-run-owned.sh` belongs to the existing supervisor: it
owns both detached groups, the established safety watchdog, failure propagation,
TERM/KILL and waits. It starts no product daemon and has no timing policy.

The separate `supplier-watch` case selects fixed native release deadlines at
180 and 360 seconds from the watch-request turn's start. Only exact canonical
substitute bytes may instead select an external FIFO clock. Native elapsed
waiting is confined to this case-owned clock. Clock failure closes its publisher
FIFO; publisher failure retires the clock. Either failure stops the active model. Early
completion, host failure, interruption and safety expiry retire both groups,
including clock descendants. Domain publications never run during cleanup.

The first turn has no final-response cue; the second is the actual new watch
request above. The overlay preserves the supplier facts and later agent-authored
planning state. The controller snapshots before the first publication and after
its nonqualifying publication, with ordered event/commit/time scalar receipts.
Numeric `turn-2-before-*` and `turn-2-hold-*` facts survive export/reassessment;
only actual completed native turns enter `evidence.turns`. Pair matching includes
the fixed producer schedule and publication order, not differing arrival times.

`native-host-stream-codex-session.mjs` keeps lifecycle/usage/session ownership;
its focused `native-host-stream-codex-tools.mjs` sibling decodes direct calls and
literal sequential wrappers. It never evaluates recorded JavaScript or parses
stdout as a receipt. A live handle must originate in an owned command receipt.
Copied history, stale/cross-thread handles, terminal/missing/truncated receipts,
ambiguous wrappers and missing response identities cannot prove empty re-entry.
Every retained wait carries paired call/receipt, turn/response, raw row and time
identities. Unsupported evidence stays unknown. Reader hashes include the new
sibling, invalidate old baseline reuse and never rewrite prior provenance.

Case-specific `evidence.mjs` derives compact hashed handle/wait/response facts
through that single reader. Archive replay derives decisive observation fields
from retained facts rather than trusting invented scalar claims. Per-window
response counts and confirmed candidate-live spans are diagnostic lower bounds;
a generic handle
is not automatically the genuine supplier watch. Unobserved exposure stays
unknown. Root must review the private
launch/resource locator before accepting the frozen decisive signal. No word
classifier or fabricated native turn establishes resource identity.

Original O10427/O10435 session 92199 calibrates against one launch; O13960
session 83718 against its later launch. Exact IDs remain in the private bounded
calibration. Original vscode 0.167.2 and current exec 0.169.0 supply paired empty
receipts; retained calibration proves reader behavior, not new native results.

Release-begin receipts precede snapshot/publication work; completion receipts
remain separate. Unchanged windows are [turn-start, begin-1) and [complete-1,
begin-2). Missing/invalid bounds keep the signal unknown, even with repeated waits.
Frozen before new native results: three 55-second waits need 165 seconds, leaving
only 15 of 180 for setup/reasoning; two detects repetition and one is insufficient.
One wrapper may launch several handles; live spans require matching session ID
and launch call, and retain terminal bounds. Mocked-clock proof exercises the
actual native scheduler: no early emission, releases at turn-start+180/+360,
and late first release never resets the second deadline.

A clean ended hold records `turn-2-watch-result: ended-before-publication` and a
not-reproduced reason. Continuation remains unobserved and cannot pass matched
quality. No automatic resume or fabricated active process is permitted. The
controlled host stays genuinely active during release, first without activity,
then with command output; neither activity nor model polls drive publication.
The existing emitter performs integration/stage proof once. Counterexamples
retain rejection of early integration, lost work, duplicate filing and absent
proof. Exact native wire shapes stay in the approved codec fixture and tests.

## Controlled acceptance

Renewed CLI self-check, reader/accounting/proof, supplier/controller, archive,
identity/retention and FIFO-driven supervision checks passed. Final receipt/supplier/replay
renewal passed after bounding exposure by authentic live receipts.

Earlier controlled acceptance and its repaired recovery/runtime-closure defects
remain valid: repeated same-path/hash is supported, conflicting hashes refused,
retained bytes intact; MakeMe's runtime closure rejects dirty imports before start.

## Remaining native obligations and budget

G2 remains open with receiving promises A012/A022/A023/A024/A025/A078/A092/A101:
no faithful fresh native baseline, repeated owned native activity or frozen new
capture exists. A015–A020 retain the existing agreement/preservation/continuation
cases. A079/A080 separate controlled proof from native behavior; A120 retains
two used journeys. A129–A139 govern the scoped windows, polling independence,
controlled cheap checks and truthful exposure. A140–A146 preserve retained/
controlled proof first, full allocation reservation and the stop before any
optimization on non-reproduction or no worthwhile removal.

Budget: 2/6 journeys used, four reserved for fresh blocked and unblocked pairs.
Invalid attempts and automatic baseline reacquisition count. Freeze reviewed
source and full allocation before native launch; no favorable rerun or silent
extension is authorized. Non-reproduction supports an evidenced stop or a
specific next investigation, never a speculative optimization.
