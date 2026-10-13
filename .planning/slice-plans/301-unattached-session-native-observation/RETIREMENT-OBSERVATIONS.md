# Retirement correction evidence

Source: [plan 301](PLAN.md), slices 1 and 3.

## Retirement correction re-observation

Observed 2026-10-14 under plan 304: released `0.3.61` installed byte-for-byte in
both Lizard roots (251 files each), installation `6463d42`, dashboard
`1de2986ca45a-wypYFW`. Fresh blank isolated/auto-land sessions received only the
one-shot fixture invocation, without an explicit `--auto-land` input.

- Claude Code `2.1.296`, default `claude-opus-5-5`: launch
  `c8f08604-1940-4be1-aa6f-1744a598232f`, native `122d6dd3-4fc6-4dcc-97fc-f1faca40e484`,
  fixture `SEED-001#standalone-script-wording`, accepted `a4c4db393e0c7ff86ca73d8793029f2757325ed5`.
- Cursor `2026.10.01-e373342`, default Auto: launch
  `19786396-a8de-4a65-afbc-5ccb780386f6`, native `394bd615-a31f-4f0a-a34a-9fb2af6c405b`,
  fixture `SEED-001#warning-limits-wording`, accepted `34c50f0d3140307cf4db96a893a9c138741dc448`.

Both reused the established workspace (`prepared`, `created: false`,
`landing: auto-land`), landed fixture and closure, then passed
`--created-for-work --contained <accepted SHA>` to retirement. Both receipts
reported worktree/branch `removed`; independent Git proved filesystem,
registration, local and remote branches absent and trunk containment. This
closes discrepancy 1 only. Codex's earlier flag path and runtime are unchanged.

Both installed CI completion receipts remained `observation_unavailable`
(`ci.yml`/404), with confirmed shutdown. Claude checked actual Python CI green
(run `38478718455`) and pytest 1545 passed / 7 skipped. Cursor retired without
native CI-green verification or a pytest result; the operator later found run
`38480094290` green. Those initial receipts are not passing native completion receipts; The later [Cursor trust correction](AUTO-LAND-OBSERVATIONS.md#cursor-trust-correction-re-observation) supplies trust evidence. A deleted Cursor
attempt's stale startup state required reversible archival/clearing before the
fresh launch; its future product disposition remains a separate candidate.
Exact commands, paired results, archives and Git checks:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed066-cursor-prerequisite-wnhqomzj/summary.json`.
Same-chat CI recovery then passed exact-SHA completion with confirmed shutdown:
Claude `38478718455`/2 (one exact-run rerun), Cursor `38480094290`/1. Mailboxes
`watch-zLUNxl` and `watch-KlvZLj`; paired `*-ci-recovery-evidence.json` records
are beside original proof. No publication or resource recreation. This recovers
current coverage; initial retirement-before-observer-green ordering remains
unproved. Slices 1 and 3 retain that ordering limitation; the later Cursor
trust correction is judged separately. Claude recovery also received no `CI_MONITOR_READY` hook context;
its green proof is the exact completion command, not notification readiness.
No broader all-expectations pass is claimed.
