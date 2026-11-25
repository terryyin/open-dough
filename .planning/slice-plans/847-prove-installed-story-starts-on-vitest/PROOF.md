# Installed story start proof

## Decisive premises

Observed in the owned preparation checkout at `cfd4a150c` on 26 November
2026 with Node 24.21.0, one worker, locked dependencies installed by
`scripts/setup-native.mjs`, and macOS on AC under `caffeinate -s -i`. Other
work was running (load average 6–10). Use these runs for behavioral
evidence and take a comparable pair for the execution's performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained backend selector reaches all 15 legacy specs | The baseline command below passed all 48 Chromium cases on the first attempt, 98.994 s summed and 114.24 s wall, 131–5,836 ms per case, none at or below 100 ms. Per file: start-resume 5 cases 23.680 s, preparation-codex-retry 10 cases 16.310 s, preparation-resume 5 cases 13.077 s, the other twelve files 1–4 cases and 2.0–6.3 s each. |
| The installed starts publish from Node Vitest with no Dashboard server | A scratch Vitest spec under `backend-tests/launches/`, run through `npm run test:dashboard:backend -- '<scratch>' --workers=1`, built `startOrigin(queuedReadyRepository())`, pointed `HOME` at its machine and called `beginStart` and `beginPreparation` with a `StartProgress().for(workflow)` view. Both attempts returned `established`. Origin held the Take profile (`host: claude`, `mode: story-branch`) and, separately, the Preparing profile (`activity: preparation`) with the workspace under `.worktrees/`. The cases took 1,307 ms and 1,130 ms. The scratch spec was removed. Slice 1 replaces the `HOME` assignment with the typed inputs above. |
| Retained E2E journeys observe dispatch in the workspace, kept offers and Codex recovery | The E2E command below passed all seven Chromium cases on the first attempt, 50.007 s summed and 55.70 s wall (load rose to 17.8). Claude execution and Codex refinement traversed the real installed start, publication and native launch phases. The Taken card and the kept-preparation Backlog card each opened one session in the kept workspace with no second claim or profile. The Codex retry dialog surfaced the refusal once. Codex recovery resumed the uncertain first input across a restart in two cases. |

## Proof ownership and local gate

Files in the following map are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-start.spec.ts` | Take on origin before establishment, kept start, catalog refusal, not-applicable start |
| 2 | `agent-launch-start-refusal.spec.ts`, `agent-launch-start-taken-refused.spec.ts`, `agent-launch-start-duplicate.spec.ts` | Refusal wording, no additional publication, correct kept-start disposition, one claim and workspace under overlap |
| 3 | `agent-launch-start-resume.spec.ts`, `agent-launch-start-codex-recovery.spec.ts` | Same claim and workspace after slow, stopped, lost and Codex-acknowledgment cases |
| 4 | `agent-launch-preparation-start.spec.ts`, `agent-launch-preparation-stops.spec.ts` | Preparing on origin, kept preparation, stops with nothing kept |
| 5 | `agent-launch-preparation-resume.spec.ts`, `agent-launch-preparation-continuation-refusal.spec.ts`, `agent-launch-preparation-store-failure.spec.ts` | One profile across slow, stopped, interrupted and refused starts; store failure preserves preparation |
| 6 | `agent-launch-preparation-codex-continuation.spec.ts`, `agent-launch-preparation-codex-retry.spec.ts` | Git-verified continuation, refused damaged retry, origin unchanged |
| 7 | `agent-launch-incomplete-reporting-settlement.spec.ts`, `agent-launch-update-worktree-retry.spec.ts` | Missing helper refused before dispatch, updater apply resumes once |

For the first and final comparisons, use fresh absolute proof paths from
the repo root and one worker. Repeat the baseline at the execution base if
affected paths or the measurement conditions changed. If a replacement moves
to a new filename, add its exact selector to the candidate run and record
its proof owner. Confirm discrimination for any legacy assertion retired as
redundant.

```sh
selection='launches/agent-launch-(start(-refusal|-taken-refused|-duplicate|-resume|-codex-recovery)?|preparation-(start|stops|resume|continuation-refusal|store-failure|codex-continuation|codex-retry)|incomplete-reporting-settlement|update-worktree-retry)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/launches/agent-launch-(start-(phases|taken)|preparation-(phases|kept|codex-retry)|codex-recovery)\.spec\.ts$' --workers=1
```

Run affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and `npm run typecheck:dashboard` for the changed start signatures. Record
engine and case counts, per-case time against roughly 100 ms, summed case
time, elapsed selection time, and the separate cost of proof retained in
E2E. Account for every scoped legacy case before accepting zero Playwright
selections for this boundary.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Execution evidence

The execution-base backend baseline (Node 24.21.0, Chromium, one worker, AC
under `caffeinate -s -i`) passed all 48 cases in the 15 files on the first
attempt. It took 183.711 s summed and 203.37 s elapsed, with cases at
265–7,725 ms and none at or below 100 ms. The host's load average was
12–17 before the run and 16–23 after it. The case record and literal command
are in the checkout's Git evidence directory as `847-legacy-baseline.json`
and `847-legacy-baseline.log.run.json`.

### Slice 1

Accepted proof: the same four cases select Node Vitest, publishing against
the private origin and comparing the returned handoff with the typed kept
record. All four passed (4.157 s summed, 4.746 s elapsed, 607–1,467 ms).
The affected backend selection passed 69 cases (62 Chromium and seven Node),
the native E2E selection passed 15 Chromium cases, the installed formatter
contract passed four checks, and Dashboard typechecking passed. The literal
commands, observing assertions and consumer dispositions are in
`847-s1-return.md` in the checkout's Git evidence directory.
The independent refactor removed redundant store writers and verified the
typed API with 12 backend cases, two kept-start E2E journeys and typechecking.
The changed observations are in `847-s1-refactor-return.md`.
Under higher local load a per-case origin build pushed one Git case past
the default timeout. The existing prepared-origin cache now holds an
immutable queued origin and each case copies it into a private origin.
The focused confirmation passed all four cases at 189–1,889 ms
(3.824 s summed, 7.068 s total including preparation) at load 16–19.
See `847-s1-warmed-origin-focus.log.run.json` and its case record.
Published as `bed7650074825e21554b2bf893895857b0edb04c` on
`origin/codex/prove-installed-execution-and-refinement-starts`, above
`52544c358a47df9019c163d45dcb0625b47b9271`. The publication receipt reports
CI coverage as unobserved after the stream ended.

### Slice 2

All seven refusal and overlap cases passed in Node Vitest at default
timeouts (13.733 s summed, 21.56 s elapsed), with zero Chromium selections
in the three migrated specs. The final typed refusal checks, Dashboard
typecheck, and existing native overlap/admission check passed. The unchanged
Taken-card E2E owns native refusal and one successful retry in the kept
workspace. Per-case preparation precedes timed behavior, and overlap cases
always release their held push and drain pending starts before cleanup.
The confirmation started at load 16.18, after a run at load 34.35 timed out.
The commands, coverage map, and proof are in `847-s2-return.md`.

The diff changed only the three migrated specs and this proof record. A
review of their existing Git barrier, refusal wording and kept-start
consumers found no additional refactor needed for delivery.
