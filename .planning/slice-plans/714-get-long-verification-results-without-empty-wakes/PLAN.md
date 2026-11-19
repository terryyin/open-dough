# Get long verification results without empty wakes

**Identity:** SEED-345#get-long-verification-results-without-empty-wakes
**Source:** [Selected story, scope and examples](../../seeds/SEED-345-session-token-efficiency.md#get-long-verification-results-without-empty-wakes)

## Goal and scope

A developer gets the same timely proof decision with less total wait effort.
Compare the current workflow with one change to how the host waits. Codex
leads. Claude Code has a distinct cost when a large worker resumes cold.
Keep the original command owner, proof artifacts, user intervention, overdue
checks and CI completion for the accepted revision. Cursor keeps its existing
fallback. Supplier publication, changing cache lifetimes, building a monitor
or extending Dashboard measurement are outside this trial.

## Current decisions

- Use the existing [coordinator wait](../../../Distribution/src/skills/dough-execute-plan/references/delegation.md#await-delegated-results-without-empty-calls)
  for the choice of wake and the [command wait](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  for the host continuation. The slice-clock run record, exit file and log
  already identify the command and its result. The separate
  [overdue check](../../../Distribution/src/skills/dough-execute-plan/references/overdue-delegated-verification.md)
  owns liveness, and [CI completion](../../../Distribution/src/skills/dough-execute-plan/references/ci-completion-wait.md)
  owns the receipt. A shorter control loop in any one of these places can
  transfer cost to another. Keep a single authority for each decision.
  [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Select the proof and its expected window before looking for empty returns.
  Freeze the current source payload in each control, including the existing
  Codex foreground-wait change. Install each arm in an isolated checkout.
  Hold workload, revision, proof owner except for planned Claude placement,
  host, model, effort, speed, cache policy, input context, load and due checks
  comparable. Keep the prompt neutral. Record actual settings and mismatches.
  Use matching retained evidence first. Fresh paid native runs require a human
  request under [native guidance checks](../../../Distribution/evaluation/guidance-checks.md).
  This preparation ran no such session. Each probe can proceed independently.
  If an authorized matching observation is unavailable, record the missing
  evidence and hold the affected trial and guidance change.
- Judge exact proof and response to due events first. For the quiet candidate
  require zero model requests whose only observation is that work is still
  running. Count unavoidable tool handbacks, genuine liveness checks and
  interventions separately. Compare coordinator **and** worker effort through
  proof acceptance, including handoffs, retries, rebuilds and human rescues.
  Use one versioned rate card for both arms of each host comparison. Keep the
  candidate only with preserved decisions and lower combined effort. Retain
  current guidance on a regression or absent gain. Incomplete attribution
  that could reverse the result leaves the comparison inconclusive.
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  and [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises and proof routes

Observations on 2026-11-19 at preparation revision `63997576d`:

| Operation | Observed result and remaining question |
| --- | --- |
| Read the actual Codex wait and worker result | In root rollout `01a1ef2f-03bc-7f72-b131-aa967975fa9f`, 225 paired `wait_agent` calls returned 166 timeouts, 58 completions and one interruption for new input. Of 225 calls, 154 asked for 55 seconds. Joining each complete, timeout-only batch to its next distinct response in the same turn, excluding intervening worker, user or developer messages, reproduced **165**. In worker `01a1ef33-a824-7a51-8490-d1903d398c28`, shell session 15565 returned the successful `s1-backend-proof` run record at 15:22:28 UTC. During that proof the root produced two timeout-following responses at 15:21:20 and 15:22:29. A separate worker return included the passing proof. The whole-session count includes other work. |
| Measure both agents through the retained effort entry point | Ran `node dashboard/server/compareAgentEffort.ts --host codex --home /var/empty --family <root> --codex-file <root-rollout> --codex-file <worker-rollout> --from 2026-11-18T15:20:27Z --until 2026-11-18T15:22:40Z --json` with the two IDs above, under `~/.codex/sessions/2026/11/18/`. It attributed 5 coordinator and 6 worker requests, coverage partial. Its idle-wake value was unavailable for this wire shape. Use the raw paired calls and response IDs for the wait count, classify empty subprocess continuations separately, and preserve unknown or mixed batches. Use the [effort report](../../../dashboard/AGENT-EFFORT.md) for combined totals and coverage. |
| Determine what the historical comparison could establish | At the source task's base `fc73813d6` and in preparation, the installed release was 0.3.106. Its Codex command-wait text is blob `852575ef2447`. Current Distribution source has `604dee835f34`, with the later outer-cell wait. The historical task establishes exposure. A current control must establish what still happens after that change. |
| Observe a Claude worker across cache expiry | Family `47460e10-ccb0-41b1-abd2-286a85d35572`, worker `a060cb29e175aa014`, under `~/.claude/projects/`: background whole-group proof at 19:00:13 UTC, monitor armed, notification at 19:07:22. The next request recorded 0 cache-read and 67,327 cache-creation input tokens. A second resume at 19:14:03 wrote 68,407 with 0 read. The worker read the exit evidence. The effort CLI with both files and window 19:01:01–19:14:04 UTC found 1 coordinator and 4 worker requests (partial). Notifications can resume an expired context. Whether assigning a separable command differently saves total effort needs a matched Claude observation. |
| Recover exact terminal evidence | In a temporary Git checkout, the installed `slice-clock.mjs start` and `run --log … --exit-file … -- node -e …` recorded 0 and 7 for controlled exits 0 and 7. In both cases the process result, run record and exit file agreed and the named log retained the diagnostic. This establishes the proof oracle only. |
| Find the native trial route | The unpaid `native-guidance-check.sh --list` catalog has no running delegated-proof case. Its pair runner supports Codex only. Local Codex 0.170.0 and Claude Code 2.1.328 exposed their CLI options. Neither discovery nor a substituted host demonstrates native delegation, notification or cancellation in the selected profile. Slices 1 and 2 probe that boundary before their candidate is adopted. |

## Ordered slices and outside-in proof

### 1. A Codex control exposes the wait on a running proof
Type: Behavior
Status: planned
Proof: a trace-bounded baseline connects the worker's command, both agents'
requests, terminal evidence and the next genuine deadline to the same run.

Use the backend verification phase identified above as the extraction source.
In an isolated native replay, give the worker one known proof, its evidence
location and its expected window. A small controlled check may stand in for
the expensive suite if it keeps the original launch, silence, duration,
result and receipt boundaries. Keep enough quiet time to expose short waits.
Qualify a success and a controlled assertion failure against their actual exit
files, including one still live at the first due check. Capture the control
before changing guidance. For the intervention examples, retain the original
timing and disposition of an early user stop and of an applicable CI event.
Reuse matching native observations where available. Show the assessor refuses
a launch-only handback and a missing failure witness. If current guidance already meets the criteria,
retain that result. If delegation, steering or proof cannot be observed, stop
the Codex comparison at its missing observation.

### 2. A Claude Code control exposes the cost of resuming the proof owner
Type: Behavior
Status: planned
Proof: a real worker's proof crosses the existing five-minute cache lifetime.
Its terminal evidence, receiving agent, idle interval, cache reads and writes
and combined effort are recoverable on the actual Claude Code host.

Use the whole-group trace above to select a separable verification with the
same checkout and artifacts accessible to an eligible owner before launch.
Use the native Claude workflow directly. Record the settings and existing
authority of each possible owner, the cache state at launch and the actual
resume usage. Retain the baseline failure evidence and due-check timing used
for the comparison. If the run never crosses the cache window or the receiving
context cannot be attributed, keep the observation and stop this comparison.

### 3. Codex delivers the worker's proof at the next meaningful event
Type: Behavior
Status: planned
Proof: compare with slice 1 on the same cases. The quiet run returns the
original status once with zero empty wakes. A failure returns its exact exit,
assertion and log. When the agreed check falls due first, timely liveness
evidence leads back to the same command or to an explicit unfinished recovery.

Trial a supported interruptible coordinator wait bounded by the next actual
check and host limit. Keep the worker on its original command using the
existing foreground wait. Exercise an earlier user stop and a CI event under
their respective controls. Observe delivery at the supported boundary, action by
the authorized owner, quiescence or the named recovery state, and the
applicable revision's independent CI receipt or outstanding coverage.
Compare the quiet and exception traces to the control. Count both sides
through acceptance. Keep only the supported guidance that earns the gain.

### 4. Claude Code delivers a cache-crossing result at lower total effort
Type: Behavior
Status: planned
Proof: compare the slice 2 command and duration with the candidate. Record
which context was resumed, its cache reads and writes, and combined effort
from assignment through terminal proof. Apply the same outcome-first decision.

Where the proof is separable, trial assigning its original launch to an
already-authorized longer-lived owner and using its native completion
notification. A worker that has already launched proof keeps it. Exercise the
same failure evidence and due-check rule with the chosen owner. A cheaper
worker resume offset by coordinator work fails the cost criterion. Record the
host-specific decision and its limits, retaining any measured improvement in
the existing shared guidance with the smallest necessary host adaptation.

## Local gates and concern review

Each slice has one host observation or comparison and a 15-active-minute
budget. Run long commands through the slice clock. Walk a representative
use through the changed guidance and run focused checks for its actual
consumers. Start long local runs fully awake on AC under `caffeinate -s -i`.
On battery, plug in or keep the lid open under `caffeinate -i` and inspect
the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Carry the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
into every delegation and repair. Use normal independent refactoring, review
and publication gates for any guidance change.

Slice-plan refinement was unnecessary. Each host has one control and one
decision based on that control. The two probes bound the unobserved native
premises. Review found no further slice-specific concern.
