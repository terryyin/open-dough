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
| 3 | `agent-launch-start-resume.spec.ts`, `agent-launch-start-codex-recovery.spec.ts` | Same claim and workspace after slow, stopped, lost and Codex acknowledgment cases. Three stopped or lost-workspace cases select `agent-launch-start-lost.spec.ts` on the candidate. |
| 4 | `agent-launch-preparation-start.spec.ts`, `agent-launch-preparation-stops.spec.ts` | Preparing on origin, kept preparation, stops with nothing kept |
| 5 | `agent-launch-preparation-resume.spec.ts`, `agent-launch-preparation-continuation-refusal.spec.ts`, `agent-launch-preparation-store-failure.spec.ts` | One profile across slow, stopped, interrupted and refused starts. Store failure preserves preparation. Unannounced cases select `agent-launch-preparation-unannounced.spec.ts` on the candidate. |
| 6 | `agent-launch-preparation-codex-continuation.spec.ts`, `agent-launch-preparation-codex-retry.spec.ts` | Git-verified continuation, refused damaged retry, origin unchanged. Missing-workspace cases select `agent-launch-preparation-codex-lost-workspace.spec.ts` on the candidate. |
| 7 | `agent-launch-incomplete-reporting-settlement.spec.ts`, `agent-launch-update-worktree-retry.spec.ts` | Missing helper refused before dispatch, updater apply resumes once |

For the first and final comparisons, use fresh absolute proof paths from
the repo root and one worker. Repeat the baseline at the execution base if
affected paths or the measurement conditions changed. If a replacement moves
to a new filename, add its exact selector to the candidate run and record
its proof owner. Confirm discrimination for any legacy assertion retired as
redundant.

```sh
selection='launches/agent-launch-(start(-refusal|-taken-refused|-duplicate|-resume|-lost|-codex-recovery)?|preparation-(start|stops|resume|unannounced|continuation-refusal|store-failure|codex-continuation|codex-retry|codex-lost-workspace)|incomplete-reporting-settlement|update-worktree-retry)\.spec\.ts$'
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
Published as `249048a5a74c4527e911a736329c08c8eb03f019` on the story branch,
above `bed7650074825e21554b2bf893895857b0edb04c`, with CI unobserved.

### Slice 3

The six execution recovery cases passed in Node across three files, at
default timeouts, with zero Chromium selections. The held-origin case
observes a warning and an unfinished Take before releasing its push. Git
and the typed store agree on the candidate, workspace and single claim
after recovery. The added execution Codex E2E and two retained refinement
variants prove one native input across restart. Three Chromium consumers
of the existing Dashboard warning and recording settings passed, and
typechecking passed. At load 39–43, the Node results were 44.523 s summed
and 64.61 s elapsed. Those conditions differ from the execution baseline.
See `847-s3-return.md` for the observations and literal commands.
The independent refactor retired the unused settlement helper and
three shared fixture exports. Typechecking and whitespace checks passed.
`847-s3-refactor-return.md` records why the behavioral evidence still applies.
Published as `657324f08e8a00f1cae1f270b67532c87bfe65ea` on the story branch,
above `249048a5a74c4527e911a736329c08c8eb03f019`, with CI unobserved.

### Slice 4

Six Preparing publication and refusal cases passed on their first Node
run, with no Chromium selections in the two specs. The private origin
and typed store verify the named and default Preparing handoffs. The
three refusal cases prove unchanged origin, no kept assignment or owned
workspace, and cleared progress. Existing E2E covers native refinement
dispatch, handoff and model selection. Dashboard typechecking passed.
The Node selection took 13.320 s summed and 23.90 s elapsed at load 35–38.
That run shows the coverage move, with timing under different load from
the Chromium baseline. See `847-s4-return.md`.
The independent refactor retired the last unused preparation test reader
and its re-export. Typechecking passed after removal.
See `847-s4-refactor-return.md`.
The final model cases have explicit display names. All three preparation
start cases passed in `847-s4-exact-model-cases.json`.
Published as `4686067b120630730e3bdbdf11e326b84328957f` on the story branch,
above `657324f08e8a00f1cae1f270b67532c87bfe65ea`, with CI unobserved.

### Slice 5

All eight cases passed in Node across four specs with zero Chromium
selections (21.814 s summed, 31.04 s elapsed), and typechecking passed.
The typed store failure observes the real origin revision at the rejected
write. The returned handoff and retained draft survive, and the next
start ties the same workspace and profile to that revision without a new
publication. Interrupted precommit, retained refusal and unannounced
retry check their own retained dispositions. The existing Backlog-card
E2E supplies native refusal and same-workspace retry. See `847-s5-return.md`.
The independent refactor removed the legacy preparation fixture after its
last callers moved. The accepted checks still apply.
See `847-s5-refactor-return.md`.
Published as `069b26a068c7342d9db96168e9d9fe68303fec53` on the story branch,
above `4686067b120630730e3bdbdf11e326b84328957f`, with CI unobserved.

### Slice 6

All 12 Codex continuation and retained damage cases passed in Node across
three specs, with no Chromium selections (18.295 s summed, 22.71 s
elapsed). Git verifies the same allocation for legacy SHA omission and lost
results. Each refusal preserves the damaged local evidence and original
publication, including the older installed script and lost workspace case.
The retained Codex native continuation E2E and Dashboard typecheck also
passed. See `847-s6-return.md` for the mapping to native refusal and retry.
The three changed specs use the existing private-origin and typed store
boundaries. The product and shared fixture search found no refactor needed.
All eight damaged retries passed after the final setup cleanup in
`847-s6-damage-setup.json`.
Published as `419e10dc658e13406c4b7fa7b27c51a5097eb000` on the story branch,
above `069b26a068c7342d9db96168e9d9fe68303fec53`, with CI unobserved.

### Slice 7

All five reporting and updater cases passed in Node with zero Chromium
selections (12.552 s summed, 16.91 s elapsed). Dashboard typechecking
passed. A known incomplete worktree refuses before dispatch, a fresh
incomplete worktree refuses after the real Take, and an older compatible
installation prepares reporting for its typed dispatch. The updater must
target the exact kept worktree without force. Its success resumes one
original attempt and dispatch, and its refusal preserves origin and the
kept state with no dispatch. See `847-s7-return.md`.
The independent refactor removed the unused HTTP retry and kept-start
test exports after tracing their last callers. See `847-s7-refactor-return.md`.
Published as `daa4334d4f2f994a6936ec06433621f110740863` on the story branch,
above `419e10dc658e13406c4b7fa7b27c51a5097eb000`, with CI unobserved.

## Final local gate

Both runs used Node 24.21.0, one worker and awake macOS on AC. The focused
backend gate passed all 48 cases on the first attempt in Node Vitest
across 18 specs, with zero backend Chromium selections. The three extra
files carry cases split out of the original 15 specs. The slice reports
map their individual legacy observations to Node or to the retained native
boundaries. No default timeout changed.

| Selection | Engine and cases | Summed case time | Elapsed | Case range | At or below 100 ms |
| --- | --- | ---: | ---: | ---: | ---: |
| Execution-base backend | Chromium, 48 | 183.711 s | 203.37 s | 265–7,725 ms | 0 |
| Final backend | Node, 48 | 85.993 s | 110.52 s | 236–4,502 ms | 0 |
| Retained E2E | Chromium, 8 | 29.949 s | 33.76 s | 2,167–4,934 ms | 0 |

The backend elapsed time fell 46% in these runs. Load was 11–15 during the
candidate backend gate and 12–23 around the execution-base run. The
preparation baseline at load 6–10 was 114.24 s elapsed and 98.994 s
summed. Those load differences limit the timing comparison. Every Git
case remained above the 100 ms reference.
The separate E2E gate passed the seven retained cases and the added
Codex execution restart. See the case and command records in the checkout's
Git evidence directory under `847-final-backend` and `847-final-e2e`.

The retrospective reproduced a focused selector defect in the execution
model cases. The runner looked for a literal parameter placeholder and
skipped both. The two cases now register with their literal display names
and share the same assertion body. The case filter passed two Node cases,
and the full file passed all four in `847-review-literal-names.json` and
`847-review-full-file-repaired.json`. Their assertions and the scope of the
campaign gate are unchanged.
Published the focused selector repair as
`64018ca4590afbec200848fc082fd83b50a43797` on the story branch.

## Retrospective

Reviewed the ready plan at the established Take and the eight published
implementation commits recorded here. The tracked source and plan on trunk
were unchanged at the review boundary. The scoped migration covers the
published assignment, kept start and reporting contracts using existing
test support. Typed tests drove the migration. The added E2E
case protects the actual Codex input and session across a Dashboard restart.
The existing backend runner retirement story still owns the cutover after
its prerequisite migrations are integrated.

The product review settled the focused selector defect described above.
Applicable CI remains unobserved. Process review is enabled and deferred
until Story Wrap Up obtains an Intent Coverage result for the rewritten
proof. That closure carries the original selection, run records and settled
product review.
