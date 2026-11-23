# Wait for Codex workers with fewer model wakeups

**Identity:** SEED-345#wait-for-codex-workers-with-fewer-model-wakeups
**Source:** [Wait for Codex workers with fewer model wakeups](../../seeds/SEED-345-session-token-efficiency.md#wait-for-codex-workers-with-fewer-model-wakeups)

## Goal and scope

Qualify a deadline-bounded wait for a native Codex worker. Compare it with
the current short `wait_agent` cadence through independent acceptance of the
same delegated work. Keep the worker, proof, CI and recovery responsibilities
in both arms. Retain a recommendation for the tested profile, then update
the shared delegation reference only if the candidate meets the adoption
criteria. A hosted release, cross-host qualification and changes to the host,
shell wait, CI observer or supplier watcher are outside this trial.

Use the Dashboard-launched Codex app-server profile that produced the
historical exposure, with the executable, client identity, native tool and
instructions, model, effort, tier, guidance revision and cache settings
recorded before launch. Prefer the audited Codex 0.171.0 profile if it remains
available. A candidate must use the same profile as its control and honor
that profile's own instructions. Native evidence cannot be transferred from a
different profile based on a shared tool name.

Local gate: preparation checks the story/plan links and recorder. During
execution, run the qualification probe and any applicable case proofs. For
long local runs, start fully awake under `caffeinate -s -i` on AC. On battery,
use `caffeinate -i` for an attended lid-open run and inspect the sleep log
afterward. Follow the [maintained macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
in the plan, delegation briefs and repair handoffs.

## Outside-in proof

The qualification gate compares the historical short-wait exposure with
the coordinator's actual instructions on the same native profile. Only
a compliant longer window would permit the later observations of timely
worker handback, an earlier due action, and early return or deadline
recovery. With no qualified candidate, the matched pair has no comparator,
so the plan stops at the native gate and records the unmeasured outcomes.

## Ordered slices

### 1. Qualify a worker wait and its due actions
Type: Behavior
Status: done
Proof: The app-server accepted and completed a native coordinator turn
under the audited Dashboard profile. The coordinator applied the
60-second instruction and stopped before dispatch. Its rollout shows no
worker or wait call. The retained receipts and scope of the verdict are
below.

Behavior: Under explicit authorization for the bounded probe, use the
isolated native profile and follow its instructions. If they permit a
meaningfully longer wait, exercise the original quiet proof, handback,
due check and deadline handling. If they preclude the candidate, record the
limitation and end dependent execution, as prescribed in the original
plan.

## Qualification result

- The authorized probe reused the Dashboard app-server RPC client in a
  disposable clone at `ebc5cae2ef4b822417c88559aa000ef706d29a3a`.
  It matched Codex `0.171.0`, `open_dough_dashboard`, `vscode`,
  `gpt-6.2-sol` at `high` effort, and the base-instructions hash
  `fe5b2de478b7122e403f936d5994a8bb08e104281c9604ac5cd3391f4886cea5`.
  The trial and the execution checkout both reported the default tier
  and no top-level cache configuration overrides. The native turn
  context left the tier unset, as in both historical roots.
- The retained `seed345-native-qualification.wffrP5` directory in the
  worktree's Git evidence holds the literal command, launch and terminal
  statuses in `probe.log.run.json` and `app-server.jsonl`, and the
  `brief.txt` and coordinator's `report.md`. The driver exit was 0.
  Native turn `01a207ec-bb4a-7393-941a-2969d8230d59` completed.
  Rollout `01a207ec-b5ab-7ce1-a323-3b5fd8e59303` records the profile at
  lines 1 and 10, the coordinator's limitation at line 32, and
  coordinator response usage at lines 21, 30 and 34.
- The matched historical roots `01a1fe3b-3b21-74b1-b7d0-8331302465f4`
  and `01a1febb-12ce-7db1-bb21-fcc4efd744c0` contain 153 joined timeout
  receipts for 60,000 ms requests. Call-to-receipt time was
  59.992–60.407 seconds. That is historical exposure.
- **Verdict: unavailable on the tested profile.** The coordinator
  applied the direction to avoid blocking waits longer than 60 seconds
  and stopped before spawning a worker. The tool's runtime maximum,
  worker handback, early return, deadline recovery and comparative cost
  remain unmeasured. The planned matched refactor comparison, effort
  accounting and conditional guidance change have no qualified candidate.
  Retain the current native wait guidance.

## Current decisions

Keep this result profile-bounded. The trial followed [ADR 0005 on native
validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
by using the actual Dashboard client profile, and [ADR 0010 on
improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
by requiring equivalent proof and lower combined effort before adoption.
The records-only increment carries the negative qualification and the
disposition of the dependent slices.

## Execution context

- Koharu-chan owns this Story Branch execution under publisher ID
  `dashboard-territory.local-open-dough`. The selected worktree is
  `.worktrees/wait-for-codex-workers-with-fewer-model-wakeups` under the
  Open Dough checkout. The branch is
  `codex/wait-for-codex-workers-with-fewer-model-wakeups`. The start revision
  was `2a75ec2abc9fb2f316843ac53f342d6bfe487237`. The Take and branch base
  `ebc5cae2ef4b822417c88559aa000ef706d29a3a` were confirmed on `origin/main`
  and the remote execution branch. Locked npm setup and the Codex case
  listing succeeded in the worktree.
- The first observer stopped before publication on the approval pause.
  The resumed GitHub Actions `ci.yml` observer for the execution branch
  is `codex-seed345-2fb1f6ff`, `/tmp/dough-ci-501/watch-rdrMH2`.

## Plan review

The initial review found no need for refinement. The original four slices bound native
qualification, matched capture, decision and conditional delivery. Each
has one observation boundary and fits the 15 active-minute slice budget
with the existing fixtures and command time excluded. The remaining
native-surface and evidence premises belong to the early probe. The review
identified no other slice-specific concern.
