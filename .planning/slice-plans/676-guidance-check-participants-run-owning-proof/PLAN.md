# Guidance-check participants can run their owning proof

**Identity:** SEED-393#guidance-check-participants-run-owning-proof
**Source:** [Guidance-check participants can run their owning proof](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#guidance-check-participants-run-owning-proof)

## Provenance and findings

Retrospective correction of SEED-393#repeat-native-guidance-checks-on-real-story-examples
(plan 674; commits `d178ed635`, `cdad2c608`, `88cef0957`, `de03ea470`,
`b37f1932c`). Its frozen Codex capture
`Distribution/evaluation/cases/guidance-checks/launch-command-tests/comparisons/20261117-codex-baseline.json`
passed the assessment. The kept report
(`20261117-codex-baseline-response.md`) says the participant's own proof
did not run. The excerpts below come from the raw session, which plan 674's
wrap-up disposes.

- The participant's backend runs failed in teardown at
  `dashboard/tests/support/processGroup.ts:185`. There
  `spawnSync("ps", ["-axo", "pid=,pgid=,stat="])` returned undefined
  `stdout`, so `ps` did not run inside the participant's `codex exec`
  commands (sandbox `danger-full-access`).
- The participant's E2E run failed before launch: the GitHub-owner socket
  path was too long. The workspace sits under
  `$HOME/tmp/native-guidance-checks/tmp.<random>/nc.<random>/workspace`.
- The observer ran the same specs outside the session and they passed:
  backend 31/0, E2E 4/0.

Impact: the case asks the participant to "run the proof that owns what you
change". The assessor judges only observer runs, so a participant cannot
show the executed proof the guidance under test asks for. Repeats cannot
tell a participant that skips proof from one that the environment blocks.

## Preserved promises and constraints

- Keep the case's task, overlay, observer, probes, assessor and committed
  baseline unchanged. Changed hash-bound inputs start a future basis and
  leave the 2026-11-17 observation unchanged.
- Never give the participant assessor material.
- Make no paid native session in this correction. A later repeat needs its
  own explicit authorization.

## Current decisions

- Diagnose before changing anything. Both causes are unconfirmed. Use an
  unpaid reproduction: run commands through the installed Codex CLI's
  sandbox/exec environment without a model, if it offers that, or under the
  same environment the runner gives `codex exec`, with the same arm path
  depth. If no unpaid reproduction exists, stop and return that limit.
- Prefer a shorter arm root and an environment fix in the shared runner
  only when the cause is shared. Otherwise fix the case's own setup.

## Slices

### 1. Participants' owning proof runs in the case environment
Type: Behavior
Status: planned

Behavior: from the case's materialized arm, with the participant's
inherited environment, `ps` runs and the owning backend specs and E2E
consumer start, run and tear down.

Proof: an unpaid reproduction shows both failures before the change and
passing proof after it, through the case's real materialization. The case's
credential-free tests and `npm run test:evaluation` stay green. Record the
cause and remaining limits in the case's `case.md`.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate: the case's tests through `bash scripts/test.sh`, then
`npm run test:evaluation` under the maintained
[macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
(`caffeinate -s -i`, on AC).
