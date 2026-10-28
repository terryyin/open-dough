# Check stalled delegated verification before observation coverage lapses

**Identity:** SEED-157#check-stalled-delegated-verification
**Source:** [Selected story](../../seeds/SEED-157-check-stalled-delegated-verification.md#check-stalled-delegated-verification)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Give the coordinator a bounded liveness decision when delegated verification
outlasts its expected proof window, before waiting exhausts applicable CI
observation or needs a developer status request. Preserve command ownership,
real terminal proof, healthy long-running work, unrelated processes and truthful
CI coverage. All five source examples belong to the one behavior below.

Change shared execution guidance at its existing delegation boundary. Do not
implement Pygardon's separate runner containment, a process supervisor, host
adapter, persistent registry, universal timeout or replacement CI lifecycle.
A slow command triggers inspection, not automatic interruption or failure.
Unknown duration or coverage must lead to a bounded next observation with its
uncertainty retained. Existing authority decides recovery and any human action.
This plan authorizes no execution, release or installed-copy edits by itself.

## Existing solution and architectural direction

PFE inspected the whole-product responsibilities through the source execution
entry point, delegation, proof policy, CI monitoring/runtime and interrupted
recovery, plus the retained finding. Change the existing coordinator wait in
[src/skills/dough-execute-plan/references/delegation.md](../../../src/skills/dough-execute-plan/references/delegation.md):
it already owns supported waits, permits bounded state retrieval, assigns the
command owner through terminal observation, retires only owned command watches,
and handles interrupted agents. Extend that coherent ownership rule rather than
adding another liveness owner or supervisor. Keep discovery on the await
handoff; place the detailed overdue rule in
[overdue-delegated-verification.md](../../../src/skills/dough-execute-plan/references/overdue-delegated-verification.md)
beside it (file-size cohesive split). Interrupted recovery stays reachable from
the same delegation boundary via
[interrupted-delegation.md](../../../src/skills/dough-execute-plan/references/interrupted-delegation.md).

Reuse [expensive-proof policy](../../../src/skills/dough-story-refinement/references/executable-proof.md#choose-expensive-proof-before-launch)
for workload evidence and reconsideration, and
[CI monitoring](../../../src/skills/dough-execute-plan/references/ci-monitor.md)
for observer identity, unavailable coverage and recovery. The CI worker's own
liveness machinery has a different responsibility: it cannot tell whether a
delegated local proof command is making progress. Do not repurpose it as a
second command supervisor. No code/API or North Star change is warranted by
this guidance correction; existing North Star topics concern other boundaries.

Follow [AGENTS.md](../../../AGENTS.md),
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The ADR index and these records agree on Accepted; no supersession or conflict
was found. Author runtime guidance in `src/skills/`, addressing the executing
agent's project. Keep this repository's installed copies release-managed.
Keep one shared rule for Codex, Cursor and Claude Code without assuming another
host's wait API. No installation/discovery change is selected.

## Observed premises and proof limits

Preparation inspected revision `05b9c2748c362e0d86c6308fec5af697589697fa` in
`/Users/terryyin/git/open-dough/.worktrees/check-stalled-delegated-verification-before-obse`.

- Baseline guidance walkthrough: follow the selected story's stopped-progress
  example through delegation's terminal-result ownership and coordinator wait.
  The owner must await a terminal result and bounded retrieval is permitted,
  but neither section requires the coordinator to inspect when the expected
  window expires. Thus an indefinitely pending notification can leave that
  wait without a liveness decision. This is a guidance gap, not a reproduced
  32-hour runtime incident. The concrete historical incident remains
  [ODF-369](../../../docs/maintainer/findings/ODF-369.md), including its limits.
- The proposed change depends on no new runner, host API, or CI behavior.
  `runtime-setup.md` documents an eight-hour default observer budget and
  `ci-monitor.md` distinguishes `CI_MONITOR_UNAVAILABLE` from CI success.
  Read the active observer's actual bound when executing; do not turn its
  default into a verification timeout or assume the observer is still alive.
- Existing regression route, executed in the named checkout:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs`
  returned exit 0. The first attempt without that PATH used system Bash 3.2 and
  refused before selection; the available Homebrew Bash resolves the runner
  prerequisite. These checks read source guidance and protect interrupted
  recovery/completion boundaries. They do not prove the new liveness behavior
  or any native agent's adherence. No existing automated proof is claimed to
  discriminate the proposed rule.

A conventional guidance change uses AGENTS.md's representative behavior review.
The controlled rehearsal below is the actual new proof obligation; it does not
assume the historical project or a paid/native-host automation route is available.
No outstanding infrastructure premise or human-owned decision blocks this plan.

## Outside-in proof

All promises map to slice 1. At execution, retain setup, literal commands or
review steps, actor/host/revision, observations and limits in this plan's accepted
proof. Use temporary owned fixtures, never a production test run or another
session's process. Start with the maintained finding's recorded baseline and
set the rehearsal's expectation and observer window before seeing its result.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Detect and diagnose a stalled wait without a human status request | Controlled non-yielding child command, with an independently bounded fixture lifetime: the coordinator follows the new guidance, inspects after the declared expected proof window, and retains a diagnosis/recovery or unfinished handoff before the declared observation window ends. Record trigger time, first useful check, command/actor/process or handle, last progress, and CI coverage evidence. Fixture windows are scaled test conditions, not runtime defaults. |
| Preserve healthy slow work and real terminal proof | A progressing child outlasts the same expected window and yields a supported continuation handle: check once justified, continue that exact command through its terminal result, and show no restart or duplicate command. Progress alone cannot produce completion. |
| Distinguish queued, yielded, stuck and inaccessible states | Walk examples 2–4 with the candidate guidance: queued work has queue evidence but no process; a yielded handle uses its supported continuation; suspected busy-spin has process/progress evidence; inaccessible inspection ends with known state, missing proof and the recovery owner. Do not infer stuck from silence or CPU use alone. |
| Respect ownership and observer coverage | Include an unrelated live sentinel and an ended-observer case in the controlled review. Sentinel remains untouched. Inspect/recover only the fixture's identified command, or explicitly hand off if controls/ownership are unavailable. Report ended CI coverage separately from local proof, with no invented observer restart or success. |
| Keep the useful gain proportionate | Record liveness-check calls/effort and time to diagnosis versus the declared no-check baseline, human interruptions and any needless restarts. Label time avoided in the bounded comparison separately from a prediction about DD-371. A useful result detects the stall in time and preserves the healthy result without an owner prompt. |
| Retain response and follow-up evidence | Update ODF-369 with actual response revision(s), proof and limits, unreleased/first-containing-release fact as known, and an ordinary-use request naming the next delegated long verification, evidence to retain, evaluator and when to review. Do not mark the finding resolved from rehearsal or delivery alone. |

The executing coordinator and command owner are the subjects of the rehearsal:
do not supply a scripted liveness decision and count it as observed guidance
use. A harness may provide only known command/observer starting conditions.
Explicitly label a guided rehearsal versus independent native acceptance; do
not count transcript replay or passing static assertions as native evidence.
Review invocation context, required project inputs and useful outcome under
AGENTS.md. Because no integration mechanism changes, do not add a routine
three-host discovery matrix. If execution introduces a new host dependency,
stop the dependent claim and reassess its proof/ADR 0005 obligations.

## Ordered slices

### 1. Diagnose an overdue delegated proof while keeping ownership and coverage truthful
Type: Behavior
Status: done
Proof: The controlled stalled/healthy rehearsal and boundary walkthrough in the
mapping above, plus affected existing delegation/CI guidance regression checks.

Behavior: A coordinator has pending delegated verification → its expected proof
window is exceeded or remaining applicable observation coverage calls for a check
→ the coordinator obtains bounded liveness evidence, keeps healthy proof under
its existing owner, and returns an owned recovery or exact unfinished handoff
without fabricated results, unowned termination or silently lost CI coverage.

Extend the existing wait/verification handoff with the trigger, evidence and
bounded next-action rule. Keep queue state, live progress, supported yield and
suspected stall as observations informing the same decision, not independent
handlers or hard-coded duration tiers. Use existing project bounds and controls;
when missing, retain the gap and bound the next observation rather than inventing
an external timeout policy. Keep the CI lifecycle and interrupted-writer rules
linked to their current owners.

Run the representative use and controlled proof before treating the guidance as
ready, then perform the independent post-change refactor and normal delivery
under dough-execute-plan. Trace changed guidance consumers before choosing
regressions; begin with the literal focused runner command above and extend
only when the actual change reaches additional promises. The repository's
pre-commit hook owns staged lint (and dashboard typecheck only for staged
scripts); hosted CI is not a requirement to rerun every local suite for this
Markdown change. Preserve every required failed verdict until resolved.

Retain ODF-369's response/evaluation/ordinary-use request as part of this same
outcome. After the response commit exists, record its actual SHA through normal
completion bookkeeping; never insert a guessed future revision. If no release
contains it yet, record that honestly and leave first-release observation with
the existing release/finding maintenance lifecycle. This story does not authorize
releasing, updating other projects or claiming an ordinary-use result in advance.

Sizing: one cohesive guidance decision and proof loop, including review,
focused checks and cleanup; no preparatory Structure slice or speculative
machinery. No numeric slice budget is supplied here. Honor any budget supplied
at execution; an unavailable controlled observation leaves its promise open.

## Current decisions and concern review

- One authoritative coordinator liveness rule, using existing command ownership
  and CI lifecycle; no new process supervisor or fixed runtime timeout.
- Baseline and evaluation limits remain explicit. A guided reconstructed result
  is not sustained ordinary-use improvement or native acceptance on every host.
- Refinement was not needed: the one Behavior slice owns the complete outcome,
  its proof, and finding evidence without fragmenting them into activities.
- No remaining slice-specific concern was identified in this preparation.
  There is no pre-Take human decision or blocking supplier dependency.

## Learnings

The focused runner needs Bash 5+ on this machine; putting the available
Homebrew tools first on PATH reaches the actual checks. Homebrew `timeout` /
`gtimeout` may be absent — use an owned sleep+kill bound for short fixture
lifetime. Prefer detached sentinels when the shell harness reaps background
jobs with the parent. File-size refactor moved the overdue rule to
`overdue-delegated-verification.md` and interrupted recovery to
`interrupted-delegation.md`, with thin discovery stubs on `delegation.md` and
payload declarations in `install.sh`.

## Accepted proof (slice 1)

```text
proof:
  command: PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-execute-plan/scripts/interrupted-delegation-guidance.test.mjs src/skills/dough-execute-plan/scripts/overdue-delegated-verification-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs tests/payload-declaration-links.sh
  covers: overdue liveness rule; interrupted recovery stub+rule; CI completion ownership; payload declares new references
  boundary: dough-execute-plan delegation wait / verification ownership / CI lifecycle / install payload
  observations:
    - overdue-delegated-verification-guidance.test.mjs: trigger, bounded evidence, healthy/queued/inaccessible, expensive-proof+CI reuse
    - interrupted-delegation-guidance.test.mjs: interrupted recovery + recoverable stub anchor
    - ci-completion-lifecycle-guidance.test.mjs: CI completion ownership unchanged
    - tests/payload-declaration-links.sh: new references declared
  setup: Homebrew Bash 5+ first on PATH; after post-change refactor split
  result: pass (15 node guidance tests under node --test; payload check green)
```

Guided controlled rehearsal (scaled windows; not native acceptance): stalled
busy-spin diagnosed ~3s with owned recovery; healthy progressing child kept to
terminal DONE; queued/inaccessible/ended-observer walked; sentinel ownership
retry passed. Evidence retained in ODF-369 Delivered response. Response commit
SHA filled after delivery.

## Execution complete

Product advice: No further product change from this execution; close the
ODF-369 loop with release/install and the recorded ordinary-use observation.
Leave backlog priorities unchanged.
