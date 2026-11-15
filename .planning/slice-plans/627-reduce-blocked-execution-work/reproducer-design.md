# Faithful watch reproducer: controlled preparation decision

Status: controlled scaffolding implemented; native observation timing remains
open. No native journey started and no model behavior or saving was observed.
The controlled proof below covers delivery/ownership only. Slice 3 is incomplete.

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

## The unresolved experimental choice

The required unchanged observation window has no independent release event
in this domain: the producer is intentionally paused and nothing can finish
its missing proof. An efficient watcher may remain in one host-owned wait
until qualifying publication; it need not emit an intermediate model receipt.
A window released only after N empty polls therefore biases the experiment
and can strand the very efficient behavior being compared. Releasing as soon
as the watch starts removes the time in which empty re-entry could occur.

The current project rule is exact: [AGENTS.md](../../../AGENTS.md#test-automation)
says **"Never sleep or wait for wall-clock time to pass. Wait for an observable
event or advance a controlled clock."** A controlled clock can drive a cheap
scripted host/controller check, but it cannot advance a real native host's
55-second command wait without a new host adapter or changing the agent's
watch. No existing PFE candidate provides that native clock control.

Two concrete paths remain:

1. **Use a scoped native observation interval.** Permit a fixed 180-second
   unchanged interval beginning at the native watch-request turn's start,
   followed by a nonqualifying publication; permit a second fixed 180-second
   interval followed by qualifying publication. Producer releases occur
   independently of model polls and even when the agent waits passively.
   Keep a separate existing safety deadline and use controlled clock advances
   for all cheap controller tests. The deliberate native elapsed-time waits
   need an explicit, narrowly scoped exception to the quoted project rule.
   These values are proposed before any paid probe, not yet accepted settings.
   Turn start is not watch exposure: setup may consume the interval. Retain
   authentic handle timing and report insufficient/unknown exposure rather
   than infer a fix when the watch was never observed long enough.
2. **Keep the project rule without an exception.** Prepare only observable
   in-flight delivery/cleanup checks with a scripted host and external release
   barriers. Report that they prove controller behavior but provide no
   trigger-matching native observation window. Stop the native reproducer
   path until an independent real event with justified timing is identified
   or a broader host-clock capability is explicitly selected.

The first path is the smallest experimental change; the second is the current
allowed stopping boundary. A deterministic supplier workload would be a new
running producer and would not preserve the intentionally paused condition;
its duration would also depend on load. A human choosing release time after
seeing a bad loop is not a predeclared matched schedule. Neither is a valid
silent substitute. No native timer was added. A strictly substitute-only controller seam now
accepts external release barriers; it cannot start a real-native journey.

## Proposed observations and proof if the first path is selected

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
- A proposed decisive signal is at least three empty nonterminal wait
  receipts on the same live watch, each followed by another owned model
  response before any supplier fact changed. Preserve call/receipt/session,
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

The separate `supplier-watch` case requires an explicit external FIFO clock
and the exact canonical supplier substitute bytes. The real-native route and
any other executable are refused, even if a clock is supplied. Its first turn
has no final-response cue; the second is the actual new watch request above.
The overlay preserves the exact supplier facts as prose and never erases later
agent-authored planning state. Nonqualifying/qualifying release records and
mid-watch snapshots stay in retained `case-evidence/`. Case-owned host modules
and explicit shared modules use the existing native import-closure owner;
project overlays remain data until materialization.

The controlled host emits no polls and stays in a real owned blocked command
while both publications arrive. It resumes only after the controller has ended.
The existing emitter runs the actual integration/stage proof. Assertions cover
held partial work, one integration/filing, independent and executed passing
proof, one continued native turn, retained raw events, and absence of owned
model/controller processes. Rejected quality observations use the shared
counterexample helper. Changed imported agreement construction refuses frozen
capture before a session starts.

A clean ended hold records `watch-result: ended-before-publication` and a
not-reproduced reason; continuation remains unobserved and cannot pass full
matched quality. Supervisor early-exit diagnostics remain retained. There is no
automatic resume or fabricated active process. Watch exposure remains explicitly
unknown: turn start and this scripted barrier are not a native watch handle.
Authentic wait/response decoding and a finalized native interval are still owed.
The current compact baseline exporter supports numeric turn snapshots; the new
mid-watch evidence is retained locally but is not yet a supported paid comparison
archive. No old archive or provenance was rewritten.
The next cheap boundary can reuse `native-comparison-archive-evidence.mjs`
`safeObservations`: numeric-prefix phase facts such as `turn-2-hold-*` and
separate scalar publication receipts can survive without inventing turns.
Repeated `watch-event` keys currently collapse in `parseFields`; replay must
retain both ordered publications and every assessor input before native use.

## Controlled acceptance

The initial 22-check run passed 20 and exposed two repaired defects. A five-check
renewal passed supplier-watch, in-flight lifecycle, owned worker proof, stream
replay and the assessor guard. Final refresh, matched-pair and standalone-baseline
renewal passed. Recovery now validates repeated path/hash rows against the same
Git blob, while a conflicting hash remains refused; retained bytes stay intact.
The source fixture copies MakeMe's computed runtime closure, including source
contracts, so dirty imported construction refuses before a session starts.

## Remaining native obligations and budget

S011/S020/S021/S073/S089/S098 remain unproved: no faithful current baseline,
unwanted repeated native activity, frozen new baseline or new capture exists.
S074/S131 have controlled implementation/proof; native obligations stay open. Existing correctness cases remain untouched (S014–S016).
S018/S019 still require the eventual real host path; this design is no proxy.
S075's boundary is explicit: no native or token-saving inference from scripts.

The budget remains 2/5 native journeys used, three unspent. A fresh blocked
pair plus unblocked pair needs four; neither this design nor a scoped timing
exception resolves that allocation. Prepare/review the controlled case first,
then settle the timing choice and full evaluation allocation before any paid
probe. A baseline that does not reproduce supports an evidenced stop or a
specific next investigation, never an optimization chosen on speculation.
