# Open Dough Project Findings

Project-owned retrospective findings: problems in how this repository builds,
tests, and proves Open Dough, rather than in the published Open Dough skills or
their release payload. General execution lessons and published-skill defects
remain in [DearDough.md](DearDough.md), which also keeps local-number
allocation (DD-NNN) and removed-finding recovery references. An occurrence in
this repository alone does not make a cause project-specific. Original finding
codes and occurrence evidence are retained.

## Priority assessment

Reviewed 2026-11-23 against `02704075db03df96b94f9d7bcb7e99a627a4dfee`. The main open cost is
load-sensitive proof. [DD-476](#dd-476) includes Settings and evaluation cases
outside the completed SEED-287 response. [DD-473](#dd-473) and [DD-479](#dd-479)
lack comparable post-response runs. [DD-617](#dd-617) records concurrent
suite pressure. SEED-367's [queued load-sensitive proof story](.planning/seeds/SEED-367-bounded-slice-active-time.md#wait-for-a-quiet-machine-before-load-sensitive-proof)
covers admission to the required load window.

[DD-216/DD-243](#dd-216) has opt-in selection evidence from 24 passing checks
in 21.999 seconds. [DD-278](#dd-278) retains the open click-settling risk after
repairing both reported spec families. [DD-275](#dd-275) retains incomplete
load attribution. [DD-187](#dd-187) retains two still-exposed shell helpers.
[DD-486](#dd-486) was contained by the existing commit hook.

[Previous assessment and retirement proofs](https://github.com/terryyin/open-dough/blob/02704075db03df96b94f9d7bcb7e99a627a4dfee/ProjectFindings.md#priority-assessment).

## Dashboard specs can lose a mouse press to a reflow (open, unqueued)

<a id="dd-278"></a> [DD-278 — Two dashboard specs lost a mouse press to a reflow between press and release, on two CI runs in one day](docs/maintainer/project-test-findings.md#dd-278).

## Concurrent dashboard runs lost a run's result file (open, unqueued)

<a id="dd-336"></a> [DD-336 — `dashboard-concurrent-runs.sh` failed once in a loaded whole-suite run on a missing `.last-run.json`](docs/maintainer/project-test-findings.md#dd-336).

## Focused proof bypasses the project test runner (open, unqueued)

<a id="dd-330"></a> [DD-330 — Delegated focused proof ran `node --test` directly, so it missed both the runner's Git environment and its quiet-pass rule](docs/maintainer/project-test-findings.md#dd-330).

## Quiet passing checks obscure the selected proof (opt-in verified locally)

<a id="dd-216"></a>

### DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

[Retained findings, follow-up and occurrence evidence](docs/maintainer/project-test-findings.md#dd-216).

<a id="dd-243"></a>

DD-243 remains the same finding; its later occurrences are
[retained with DD-216](docs/maintainer/project-test-findings.md#dd-243).

## Shell observations can invert a result on Linux (open, unqueued)

<a id="dd-187"></a> [DD-187 — A `git log | grep -q` observation under `pipefail` flipped on CI when git lost the race to SIGPIPE](docs/maintainer/project-test-findings.md#dd-187).

## Shell formatting can change harness semantics (open, unqueued)

<a id="dd-319"></a>

### DD-319 — The shell formatter turned hyphenated associative-array keys into arithmetic after proof had passed

### Occurrences

- Execution: SEED-010#schedule-proof-after-refactoring / plan 323, first implementation `788d817296adfc0b23a672489619b3ea8bbaf52a`
  - Timestamp: unknown (2026-10-20, before the slice commit at 2026-10-20T11:04:50+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 788d8172; base 0.3.66
  - Evidence: after the refactor pass, `npm run format` rewrote `${obs[extraction-performed]}` in `tests/support/delivery-evidence-scheduling-native-assess.sh` to `${obs[extraction - performed]}`; the next `tests/proof-scheduling-native.sh` run failed with `obs[extraction - performed]: unbound variable`; quoting the keys fixed it and the formatter left them stable.
  - Observed effect: implementation and refactor proof were green before formatting; only the coordinator's post-format rerun exposed the break.
  - Inference: any unquoted hyphenated key in this repository's Bash harness is exposed; a lint rule or harness convention would prevent recurrence. One occurrence.

## Native replays should reproduce what the historical agent knew (response implemented, native outcome unobserved)

<a id="dd-320"></a>

### DD-320 — A replay fixture stated conditions the historical occurrences lacked, so its first paid run could not reach their boundary

### Occurrences

- Execution: SEED-010#schedule-proof-after-refactoring / plan 323, first implementation `788d817296adfc0b23a672489619b3ea8bbaf52a`
  - Timestamp: 2026-10-20 (first native run started 2026-10-20T01:57:21Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 788d8172; base 0.3.66
  - Evidence: plan 323 (`6922dc32:.planning/slice-plans/323-schedule-proof-after-refactoring/PLAN.md`) slice 1 asked for “a fast representative suite with a stated realistic cost”; the fixture's AGENTS.md stated the fourteen-minute cost and a new-stylesheet layout rule; the native coordinator's refactor brief said “Do NOT run `bin/suite.sh` — the whole suite costs ~14 minutes”. Plan 302's brief had estimated the suite at “a few minutes”. Terry then added slice 2 to replay the historical conditions.
  - Observed effect: one extra slice and one extra paid Claude run; the second replay still did not reach the delegated-implementer condition.
  - Inference: qualified. Stating the cost changed what the agent knew, which the historical defect depended on; preparation can compare a replay's inputs with each occurrence's recorded context before the first paid launch.

**Response implemented:** `fba97e9fbb90c4f97909a5e2ab899a0031c58308`. The [maintained pre-launch comparison](Distribution/tests/git-publication/native-publication.md#proof-scheduling-scenarios-compare-inputs-before-launch) names the introduced inputs, actor/delegation differences and historical source limits; credential-free checks preserve the quick fixture's stated cost/layout and the planned fixture's absence of those hints. The native outcome remains unobserved: neither retained run reached implementation delegation and a refactor-time move, and this response runs no new native session. Fixture checks do not resolve the historical finding or change ODF-249's settled disposition.

**Observation (2026-10-22):** [SEED-053#match-historical-replay-inputs](.planning/done/SEED-053_match-historical-replay-inputs.json) completed on 2026-10-21; no story remains queued. Keep the finding open until the next paid proof-scheduling replay prepared with the comparison runs: it supports retirement when its inputs match the recorded occurrence context and the run reaches implementation delegation without an extra corrective slice. No such run has occurred since adoption.

## A limit-recovery spec counts one extra request under suite load (open, unqueued)

<a id="dd-295"></a> [DD-295 — `limit-recovery-credit-history.spec.ts` saw an unrelated plan-history request after its recovery mark in one loaded whole-suite run](docs/maintainer/project-test-findings.md#dd-295).

## Specs restart a server on a just-closed port (partly repaired, open, unqueued)

<a id="dd-296"></a> [DD-296 — A spec that restarted its server on the fixture's closed port failed CI with "Port … is already in use"](docs/maintainer/project-test-findings.md#dd-296).

## Two checks fail only beside other work (open, unqueued)

<a id="dd-297"></a> [DD-297 — A test writing into the source scripts directory and a five-second child-start poll each failed once in loaded whole-suite runs](docs/maintainer/project-test-findings.md#dd-297).

## Loaded-suite evidence lacks within-run load (open, unqueued)

<a id="dd-275"></a> [DD-275 — Acceptance runs recorded machine load only at their start and end, so a failure could not be placed against the story's load bound](docs/maintainer/project-test-findings.md#dd-275).

## Corpus drafts mis-place the cut after repeated commands (open, unqueued)

<a id="dd-343"></a>

### DD-343 — `native-stream-corpus-add.mjs` drafted `last-start-line` at an earlier identical command

Former local code: DD-339 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.

### Occurrences

- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 3)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: `tests/fixtures/native-streams/cursor/delivery-evidence/drift/narrowed/20261025T125143-579f/expected` drafted `last-start-line: 635` while the last started command is stream line 1050; its last three commands are the same `story-obligations.mjs check`; replay failed "started command 7 of 8 is null"
  - Observed effect: `tests/native-stream-replay.sh` failed until the value was corrected to 1050 by inspection.
  - Inference: the in-turn search for each started command can match an earlier identical line; review catches it only through the replay failure.

<a id="dd-347"></a>DD-347 (`source-freshness.md` read-budget row headroom) moved to shared [ODF-446](docs/maintainer/findings/ODF-446.md) on 2026-11-10; source `220026a4e1b8409ffa81f50cd8e3130945ff8472:ProjectFindings.md`.

## A full local suite's shell wall includes admission wait (repaired, awaiting a re-profile)

<a id="dd-406"></a>

### DD-406 — Local facet: this repository's one-suite admission made a re-profile's shell walls incomparable

[ODF-405](docs/maintainer/findings/ODF-405.md) holds the shared facet of the
SEED-221#launch-records-poll-waits occurrence (plan 448, 2026-11-02). The
measurement guidance then omitted queue or admission time. In this repository,
`scripts/local-test-suite.mjs` (via `dashboard/playwright.config.ts`
`acquireLocalSuite`) holds a second full run until another worktree's suite
finishes, and the local test guidance did not then say that its shell
wall includes that wait. About 38 minutes of the candidate run's 4,068 s wall
were admission (Playwright reported 29.6 min), and the coordinator spent
several investigation steps before finding the gate.

**Response:** `ad8b1f3afafa91eca1cfd3b36295716f52d90fe6` (2026-11-02, alongside
SEED-221's closure) added this note, now kept in
[runner settings](Distribution/tests/runner-settings.md): a full run's
shell wall includes any admission wait; compare runs by the runner's own
reported duration. **Observation criterion:** the next full-suite timing
comparison in this repository taken while another worktree's suite may hold
admission uses the runner-reported duration (or checks admission) before
reading a slowdown. No such comparison has been observed since adoption; open,
unqueued.

## Long local dashboard suites can lose proof to Maintenance Sleep

<a id="dd-412"></a>

[DD-412](docs/maintainer/project-test-findings.md#dd-412) records two invalidated
whole-suite runs in one execution and the passing AC-powered retry.
**Response:** `b52c1d3bdad7369fc1042a5f2744e9ebedadecbe` (2026-11-04) added the macOS sleep guard; it now lives in
[AGENTS.md](AGENTS.md#failing-and-flaky-tests).
**Observation criterion:** the next long local run on a macOS laptop follows
that guard, and a sleep-shaped failure is attributed from `pmset -g log`
before it is read as a defect. `SEED-241` (plan 477, 2026-11-05) followed
`caffeinate -s -i` across 2,044 passing tests; the dark-wake and sleep-failure
observations remain open, unqueued.

## Revision-stream pace could start before both open answers settled

<a id="dd-420"></a>

[DD-420](docs/maintainer/project-test-findings.md#dd-420) records the original
failure and the plan 499 recurrence. The corrected spec holds listings in
turn. The product still starts its pace per open.


## Artifact upload stall at the 6-minute dashboard job cap (open, unqueued)

<a id="dd-433"></a>

[DD-433](docs/maintainer/project-test-findings.md#dd-433) records two passing
dashboard shards cancelled at the 6-minute job cap during slow artifact uploads.

## Repository authoring and host observations

- <a id="dd-365"></a> [Commit-specific preparation approval repeats after safe reconciliation](docs/maintainer/project-maintenance-findings.md#dd-365)
- <a id="dd-370"></a> [New Markdown docs with trailing blank EOF fail staged whitespace](docs/maintainer/project-maintenance-findings.md#dd-370)
- <a id="dd-371"></a> [Delivery typecheck first catches exactOptionalPropertyTypes after green proof](docs/maintainer/project-maintenance-findings.md#dd-371)
- <a id="dd-374"></a> [Delegation brief softened the project's failing-test policy to "fix or report"](docs/maintainer/project-maintenance-findings.md#dd-374)

## Release finalization says "Do not push" while a release slice proves the remote tag (open, unqueued)

<a id="dd-427"></a>

### DD-427 — `release-version` stops at a local tag, but plan 470 slice 5 required `git ls-remote --tags origin v<next>`

### Occurrences

- Execution: SEED-236#show-ci-adapter-proof (before-cleanup `779d5f96a20dd5ddf671f0eaaf3f3624cefc61cd:.planning/slice-plans/470-show-ci-adapter-proof/PLAN.md`, first implementation commit 64588d69268974f9ff44513239da95ad1bc80b42)
  - Timestamp: unknown (2026-11-05, release `bc84cc196` after main CI on `514a70a54`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.84 (installed `.claude/skills`)
  - Evidence: `.agents/skills/release-version/SKILL.md` step 6 "Do not push" and step 7 "do not claim it is Released from a remote source until the tag is available there"; plan 470 slice 5 proof named the remote tag; Terry's checkpoint go-ahead covered "cut the next patch release", so the coordinator pushed `bc84cc196` to main and `v0.3.85`.
  - Observed effect: the push rested on the checkpoint's wording rather than on the release skill; trunk had moved twice before the release (`66fefb7c8`, then `80029afc9`), so the release covered other stories' payload too.
  - Inference: the release skill could name the publication step (trunk push and tag push) for a request that includes publishing, and how to describe interleaved trunk payload in the changelog.

## A story-branch landed review journey ran at its timeout under external load (outcome pending)

<a id="dd-473"></a>

### DD-473 — `story-review-story-branch-landed.spec.ts` timed out at the 30 s default in focused runs beside other worktrees' suites

### Occurrences

- Execution: SEED-261#map-launch-completion-and-landing-test-data (plan 538-map-launch-completion-and-landing-test-data, first implementation commit d8961926c19dee65667673596e9f46f61d31869a)
  - Timestamp: unknown (2026-11-09, during slice 4 before `9addc7c44`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: The slice 4 implementer's focused selection timed out on `dashboard/tests/review/story-review-story-branch-landed.spec.ts:27` at 31.7, 32.4 and 34.4 s under load averages of 21 to 27 from other worktrees' Playwright runs. Base `9f5e2f29` passed at 16.8 to 29.1 s in a temporary worktree, and the change passed at 13.2 to 28.2 s. The spec drives a real start, `history-preserving-publication.mjs integrate` and retirement. It passed in both later full gates (2241 and 2257 passed) at lower load.
  - Observed effect: Three focused failures that the change did not cause, plus base and diff comparison runs to show that.
  - Inference: The journey's unloaded time is about half its timeout, so external load alone can push it past 30 s. Splitting the setup from the reviewed reading, or reusing a prepared integration, would restore margin. Load attribution rests on start and end load readings only (see DD-275).

**Response:** [SEED-287 completed](.planning/done/SEED-287_fit-dashboard-journeys-in-default-timeout.json). This record still lacks comparable loaded evidence for the landed review journey.

## Whole local suites under external load fail untouched journeys

<a id="dd-476"></a>

### DD-476 — Whole local suites at load 13–36 spent hours on load-only failures, and one hung job held the shared admission

### Occurrences

- Execution: SEED-261#map-project-configuration-test-data (plan 540-map-project-configuration-test-data, first implementation commit eefe28d82a86fdf380d0c0de63ce66ccb32886e5)
  - Timestamp: unknown (2026-11-09, whole runs from 10:03 to 16:12 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: Plan 540 required whole `npm test` and `npm run test:dashboard` before final delivery. At load 13–36 (a VM near 110% CPU plus other worktrees' suites), `npm test` passed 524/524 and 525/525 in 19 and 23 minutes. Dashboard runs failed 4 of 2,262 (68 min) and 8 of 2,271 (72 min) in journeys the change did not reach; the 8 failed files passed 16/16 at one worker. A merged-state `npm test` hung 47 minutes in `tests/support/local-test-suite-lifecycle.test.mjs` while holding `refs/dough/local-test-suite`; it was ended, and its `fs.watch` gate observation was repaired in `31fc793ac`. `scripts/test.sh` sets no per-job deadline. Hosted CI passed three of the four slice revisions.
  - Observed effect: about 5.5 hours of whole-suite time and two developer decisions; the gate was finally judged by one-worker reruns and hosted CI.
  - Inference: at this load the local whole-suite verdict mostly measures the machine; DD-473 is one such journey. Without a per-job deadline, a hung job blocks every worktree's whole runs. SEED-287 and SEED-286 address the journeys' cost.

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (between 2026-11-11 23:03 and 2026-11-12 00:41 +08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: A review-family run (`npm run --silent test:dashboard -- tests/review --workers=2`, 183 cases) at load 34–49 failed five cases the change does not reach, and they failed again at one worker: `backend-tests/review/story-review-completed-conflicts.spec.ts:73`, `tests/review/story-review-completed-merge-edits.spec.ts:11`, `tests/review/story-review-one-shot-choice-races.spec.ts:12`, `tests/review/story-review-one-shot-choice.spec.ts:13` and `tests/review/story-review-story-branch-landed.spec.ts:27` (DD-473's journey). Four passed the 30 s case budget and one a 5 s observation, with 2–4 s of Before Hooks. The same five files at one worker failed six cases on the base `58442ace8` (load 37 → 34) and the same five on the candidate (load 34 → 42). Hosted CI passed on `205452d94`, `d7622bc2b` and `b9d7cb61a`. In the touch spec itself, the case that runs first in its worker passed 30 s at two workers above load 36 on base and candidate alike, with 13–16 s of Before Hooks.
  - Observed effect: base and candidate attribution runs, and a two-worker comparison in which each side needed five attempts for three passes.
  - Inference: the same load-only class at one worker, above the 20–30 load that SEED-287 promises. Four of the five cases are not named in SEED-287's story.

- Execution: SEED-314#speed-up-landed-ci-repeat-checks (plan 595; first implementation `ad78d86495a1e808da9d40fb164b66e4d883b402`)
  - Timestamp: unknown (between 2026-11-11 23:35 and 2026-11-12 11:58 +08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: Plan 595's slices required three consecutive passes of a twelve-case family, base and candidate comparisons, and two-worker runs at load 20–30, while other worktrees held the one-minute load at 26–74. Slice 2's implementer made nine family runs and two 27-file comparisons in 1 h 44 min without three passes; slice 4's made seven family runs for one pass; slice 5's made eight base and candidate pairs in which the base passed none. Each gate then passed at the first attempt in a window at load 12–27: slice 2 in 7 minutes, slice 4 in 3, and slice 5's three two-worker runs and three passing pairs in 26 minutes under a script that read `uptime` and started each run only inside the profile. Besides the family's own cases, the reconciliation, follow-up reading, receipt boundary and admission specs, `tests/intent/intent-ci-follow-up.spec.ts:19` and `tests/intent/recently-done-ci-automatic-repeat.spec.ts:14` failed on base and candidate alike above load 33.
  - Observed effect: about four hours of delegated proof runs that could not settle their gate, against about 36 minutes of runs that did.
  - Inference: a gate that names a load profile is cheapest when its command waits for the profile; runs taken outside it only attribute failures to the base. The last two specs are named by neither SEED-287 nor SEED-319.

- Execution: SEED-330#make-ci-follow-up-automatic (plan 604; first implementation `5987387021227f7a89b1520917dcd3100564b0aa`)
  - Timestamp: unknown (2026-11-12, about 19:00–19:30 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: focused runs, not a whole suite. The System settings journeys named by the consumer trace: `tests/configuration/project-remove.spec.ts:180` (heading wait after reload) and `tests/configuration/system-settings-openai.spec.ts:18` ("Status unavailable") timed out at 30 s at load 38–41 and passed at `--workers=2` at load 32; both run with no project rows, so the slice's removed row never rendered there. `intent-ci-follow-up.spec.ts:27` timed out at load ~69 and passed alone; its split belongs to SEED-324. Intent Coverage runs saw the follow-up admission and automatic-repeat cases time out at load 41–85 and pass at 33–44.
  - Observed effect: two classification reruns; the two Settings cases have no owning story since SEED-287 closed.
  - Inference: qualified match to this finding's dashboard load facet; the Settings pair is named by no active story.

- Execution: SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)
  - Timestamp: unknown (2026-11-17, evaluation runs between 12:30 and 15:45 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take cc72d082c)
  - Evidence:
    - `npm run test:evaluation` at load 15–31 hit the 180 s job deadline in untouched suites, 2 jobs in one run and 15 in another. Among them were `delivery-evidence/proof-scheduling-native.sh`, `git-publication/git-publication-native-admission-closure.sh` and the baseline and admission-reuse checks. Each passed when rerun alone at load about 10.
    - `native-guidance-checks/native-guidance-check-supplier-watch.sh` failed its 10 s `wait_for` at line 59 in two whole runs. It passed alone, on the candidate and on clean HEAD.
    - Branch CI passed on every slice revision.
  - Observed effect: classification reruns and a delivery that rested on targeted proof plus CI. No whole evaluation run at that load was clean.
  - Inference: this is the evaluation family's facet of the same load class. The supplier-watch `wait_for` bounds of 10 s are a test defect under the failure policy, and no story owns them.

**Response:** The per-job deadline and bounded process cleanup landed in
[SEED-289#name-a-test-job-past-its-deadline](.planning/done/SEED-289_name-a-test-job-past-its-deadline.json).
[SEED-287 completed](.planning/done/SEED-287_fit-dashboard-journeys-in-default-timeout.json). The observations above still include settings cases outside its scope and loaded runs without a comparable post-response result.

The supplier-watch readiness facet was repaired at `30962c927ab1e74dd69340a81aeb3178251151ce`: the external driver now waits on the model-ready FIFO after preparation and turn 1, instead of charging them to a 10-second poll. The same controlled readiness-clock fault failed before and passed after; the focused check and all 75 evaluation jobs passed under the maintained AC sleep guard. Later phase waits and native/job deadlines are unchanged. This response does not settle the broader loaded-run and Settings observations above.

## `start-origin-isolation` successive preparations exceeded the 30 s default under external load (outcome pending)

<a id="dd-479"></a>

### DD-479 — `start-origin-isolation.spec.ts` "successive preparations install current working-tree source without a persistent cache" timed out at 30 s at load 37

### Occurrences

- Execution: SEED-285#see-landed-ci-wall-time-history (plan 551-see-landed-ci-wall-time-history; first related implementation commit `215aa20d2ff9a6b348a565d1b2336acadeac16ab`)
  - Timestamp: 2026-11-09T13:44:43+08:00 (Playwright error-context directory `2026-11-09T05-44-43.467Z`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim `56f6d1221`)
  - Evidence: Slice 2's chunked `backend-tests/launches` run at `--workers=2` timed out on `dashboard/backend-tests/launches/start-origin-isolation.spec.ts:140` at 30.0 s at load 36.87. It passed alone at `--workers=1` in 24.3 s at load 36–44, and `dashboard/longest-first` records 11.2 s. The change touched neither the spec nor its setup, and the 623-test pre-delivery gate at load 6–15 passed it.
  - Observed effect: One focused-run failure the change did not cause, plus an isolated rerun to classify it.
  - Inference: Its real working-tree installations take over a third of the timeout unloaded and most of it under load. Reusing one prepared installation across the successive preparations, or splitting them, would restore margin.

- Execution: SEED-324#pass-landed-ci-repeat-checks-under-high-load (plan 599; first implementation `5fa058c0db92cd726fdc18c4b1c4c291451cf41f`)
  - Timestamp: unknown (2026-11-12 slice 8 refactor run)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `095f2bff9`)
  - Evidence: `start-origin-isolation.spec.ts:140` reached the 30 s bound at load 40 → 46 at two workers beside `:40`, and passed alone in 20.4 s at load 43 → 42; the change did not reach its path.
  - Observed effect: one failure classified and routed to the developer.

**Response:** [SEED-332 completed](.planning/done/SEED-332_answer-fake-gh-reads-in-process.json). The retained in-process fake GitHub proof does not establish a comparable loaded result for this successive working-tree install case.

## A consumer selection built on the native import-closure tool drops crashed files (open, unqueued)

<a id="dd-463"></a>

### DD-463 — A reverse import-closure selection silently dropped importers

`tests/support/native-import-closure.mjs` exits 1 (ENOENT) on a test file whose string literals contain import-like text. A proof selection that walks every test file through it and skips failures omits those files without notice.

### Occurrences
- Execution: SEED-262#tighten-repository-description-facts (plan 532-tighten-repository-description-facts; first related implementation commit `a271e923b623811f5f13e9a63963b1a234413210`)
  - Timestamp: unknown (2026-11-08, slice 4 implementation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: `node tests/support/native-import-closure.mjs . src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs` exits 1 reading a fixture path from a string. Slice 4's reverse-closure selection missed `consumer-trace.test.mjs` and `consumer-trace-terms.test.mjs`, which import an edited fixture; a `git grep` cross-check found them. Plan 532 premise P5 ("264 files") came from the same walk.
  - Observed effect: The two missed files were added and passed; the whole `npm test` before landing covered any other omission.
  - Inference: The tool hashes native evidence closures and was used off-label for consumer selection; a selection built from it should fail on a crashed file, or be cross-checked with `git grep` on the changed module's basename.

**Responsibility (2026-11-10):** moved from DearDough.md during shared collection. `tests/support/native-import-closure.mjs` is this repository's test support, used off-label for proof selection; the shared guidance did not prescribe it. Source: `220026a4e1b8409ffa81f50cd8e3130945ff8472:DearDough.md`.

## An empty focused path list runs the whole local suite (open, unqueued)

<a id="dd-465"></a>

### DD-465 — An empty focused path list ran the whole local suite

`scripts/test.sh` with no path arguments runs the whole serialized local suite. A focused command built from a file list that silently came out empty therefore started a full run instead of failing.

### Occurrences
- Execution: SEED-262#migrate-backlog-scratch-repositories (plan 524-migrate-backlog-scratch-repositories; first related implementation commit `6c379369119c4bf540976b951a6d1a9aee88e9d7`)
  - Timestamp: unknown (2026-11-08, slice 4 baseline, after `898ef65d6` at 2026-11-08T21:26:21+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: The coordinator's `grep -lE ... tests/support/*.test.mjs tests/*.test.mjs | tee s4-files.txt` aborted on zsh's unmatched `tests/*.test.mjs` glob, leaving the list empty; `bash scripts/test.sh $(cat s4-files.txt)` then ran without paths (`scripts/test.sh:24` treats no arguments as the full suite) until the 600 s tool timeout moved it to the background, where it was stopped.
  - Observed effect: About ten minutes of a full-suite run under load 13-17 were spent on a two-run baseline of six files; the baseline was redone with `git grep` and a non-empty check.
  - Inference: A focused-run guard that refuses an empty list would have stopped this at once; later briefs added "never pass an empty list" by hand.

**Responsibility (2026-11-10):** moved from DearDough.md during shared collection. `scripts/test.sh` treats no path arguments as the full suite; the guard belongs to this repository's runner, not shared guidance. Source: `220026a4e1b8409ffa81f50cd8e3130945ff8472:DearDough.md`.

<a id="dd-486"></a>

## DD-486 — Playwright-only focused proof missed TypeScript test errors

Focused Playwright configuration selection passed; the commit hook's typecheck then refused `getByRole("textarea")` and possibly-undefined settings payload indexing.

### Occurrences

- Execution: SEED-295#inspect-project-configuration-in-dashboard (plan 570; first related implementation `65faeae3602e04fc924a7d86b21da5d2aa559720`)
  - Timestamp: 2026-11-10T08:50:00Z
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: `execution-increment-delivery.mjs fresh` returned `commit-failed` with TS2345 on `system-settings-client-configuration.spec.ts` (`"textarea"` role) and TS2532 on `system-settings.spec.ts`. Prior focused command `npx playwright test tests/configuration/system-settings-client-configuration.spec.ts tests/configuration/system-settings.spec.ts` had passed. Repairs then typechecked and the focused Playwright selection passed again before successful delivery.
  - Observed effect: one commit refusal after green Playwright; repairs stayed local and were included in the accepted increment.
  - Inference: When editing TypeScript test files, include `npm run typecheck:dashboard` (or the project's equivalent) in focused proof before guarded delivery, not only Playwright.

- Execution: SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates (plan 581; first implementation `c9c6c06453f04b8b6144a34a563fbda1327cc960`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed dough-update/VERSION at accepted Take cbed76e81)
  - Evidence: launch cf7e0024-2e9e-4725-83d5-51fda295de55; guarded fresh commit hook returned TS2345: aPublishedSource.with({id}) lacked required label and repository, although the compatibility Playwright check passed. Supplying the actual fixture source facts and rerunning the spec preceded accepted publication.
  - Observed effect: One commit refusal and another preparation pass; the typecheck gate contained the test-data typing defect without publishing it.

**Assessment:** Open Dough's Playwright selection and dashboard typecheck are
separate checks. The [repository proof guide](Distribution/tests/README.md#waits-fixtures-and-teardown)
documents the focused typecheck, and the commit hook caught both errors before
publication. Retain the two occurrences as project evidence. No new story is
queued.

<a id="dd-579"></a>

## DD-579 — A guidance walk scripted by the guidance's author confirms its own reading

The behavior review asks for one representative walk of a changed skill. An implementer who writes the guidance and then encodes it in a fixture script observes only their own interpretation. A reader who did not write it can expose ambiguities that this script cannot.

### Occurrences

- Execution: SEED-402#keep-client-finding-evidence-and-ids-stable (plan 704; first implementation `5cc62ffe53ea21452e60f22d3448322e773c7a4b`)
  - Timestamp: unknown (2026-11-18, slice 1 acceptance before `5cc62ffe5` at 2026-11-18T23:01:47+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.106 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 implementer proof was its own `walk.py` applying the new collector section; the coordinator then sent a fresh agent only the guidance and rebuilt fixtures. That agent reached the same six outcomes and raised two wording gaps, both fixed before commit. The slice 2 brief required an independent walker from the start. That walker raised five open questions about how a recreated log represents recovered content (`bdcf715a2e826926a00b551498596e7a3ca6279c:.planning/slice-plans/704-stable-client-finding-records/PLAN.md` slice 2 accepted proof).
  - Observed effect: one extra walker run (~76 s) in slice 1; no rework of accepted behavior.
  - Inference: `.agents/skills/author-open-dough-skills/SKILL.md#behavior-review` could ask that the walk be performed by an agent that did not write the change, given only the guidance and the situation.

<a id="dd-617"></a>

## DD-617 — One implementer's concurrent Distribution and backend suites pushed two untouched backend cases past Vitest's 5 s default

### Occurrences
- Execution: SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)
  - Timestamp: 2026-11-22T08:43:17+08:00 (both runs' start)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.110 (installed `.claude/skills/dough-update/VERSION` at Take `0648ff017`)
  - Evidence: worktree evidence `s7-dist.log.run.json` and `s7-backend.log.run.json` both start at 08:43:17. Load was 6.99 at start and rose to about 18 (`slice-7-report.md`). `review/ad-hoc-session-comparisons.spec.ts:31` (5059 ms) and `review/ad-hoc-branch-result-race.spec.ts:18` (5288 ms) timed out, and alone at load 17 they passed in 1.3–1.7 s (`s7-backend-rerun`). Earlier, the slice 3 CI repair saw `launches/declared-blank-launch-publication.spec.ts:23` at 5088 ms at load about 25 (515 ms in CI). That case was queued as SEED-421#stop-repeating-git-work-in-shared-publication, which closed at `762265fce`.
  - Observed effect: two false failures, a rerun and a flake disposition question to the developer.
  - Inference: plan 747's local gates name the runners but not serial runs. This is related to ODF-209 (concurrent proof load), but here the concurrency was inside one agent. Whether SEED-421's fix gives these cases margin is unchecked.

<a id="dd-618"></a>

## DD-618 — A failed Trunk closure in the owned-context evaluation surfaces only as the 180 s job deadline

### Occurrences
- Execution: SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)
  - Timestamp: unknown (CI run 44962527796 on `59918676c`; coordinator notice at about 2026-11-22 07:40 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.110 (installed `.claude/skills/dough-update/VERSION` at Take `0648ff017`)
  - Evidence: worktree evidence `ci-repair-44962527796.md`: `finish` returned `step: "git"` ("Author identity unknown") at once, but the controller's `wait_for cleanup` (360 s bound) and the fixture's cleanup watcher kept polling until the 180 s safety deadline. Diagnosis needed a live capture of the substitute claude stream. The fixture's `repository.git` had no commit identity, which a direct run masks with the developer's global identity (base passed directly in 42.3 s). Repair `534819515`.
  - Observed effect: an opaque timeout instead of the failing step, plus the diagnosis time.
  - Inference: a controller wait that ends on an observed `finish` failure, or one bounded below the job deadline, would name the step at once.

<a id="dd-621"></a>

## DD-621 — A new Distribution script module ships without its execution-payload entry until a refactor pass runs the install test

### Occurrences
- Execution: SEED-418#expire-published-session-records (plan 767; first implementation `c86dd3425`)
  - Timestamp: 2026-11-22T05:34:38Z (refactor run `s3-refactor-install`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.110 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 3 added `dough-execute-plan/scripts/session-record-pruning.mjs`; its consumer trace (`s3-consumer-trace.json`, terms on the changed functions) and 61-file suite passed without `src/install/open-dough-execution-payload.sh`. The refactor pass ran `Distribution/tests/installation/execution-payload-update.sh`, which failed `ERR_MODULE_NOT_FOUND ... session-record-pruning.mjs`; the payload line was added before delivery.
  - Observed effect: caught before publication; the refactor pass took about 25 active minutes, part of it this repair.
  - Inference: a trace keyed on changed symbols cannot reach the payload list that names files; a brief that adds a Distribution script file could name the payload declaration and `execution-payload-update.sh` as proof.
- Execution: SEED-413#fast-runtime-unit-cases (plan 879; first implementation `b7f5b8ff0`)
  - Timestamp: unknown (2026-11-27 +08:00, CI runs 45976416445 and 45993428532)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.116 (VERSION at Take `2daf9d041`)
  - Evidence: slice 3 removed the `serving-modes` icon case that `Distribution/tests/test-runner/dashboard-concurrent-runs.sh` selected by title, so both runs found no tests (repair `91d5f3c3b`); slice 7 added `dashboard/test-support/support/runnerSettings.mjs`, which `Distribution/tests/support/local-test-suite-checkout.mjs`'s copy list lacked, so the local-suite tests failed `ERR_MODULE_NOT_FOUND` (repair `ccafa3584`). Each slice's consumer trace and focused proof passed; only the Distribution shard caught them.
  - Observed effect: two branch CI repairs, each with a stash-and-restore pause of the next slice.
  - Inference: the same file-naming gap as above, now for test selections and scratch-copy lists; later briefs that named these lists and a title grep across `Distribution/tests` had no recurrence.

<a id="dd-649"></a>

## DD-649 — A backend selection that matches both Vitest and Playwright specs runs only the Vitest specs and exits 0

Concrete defect — `scripts/dashboard-group-run.mjs` describes a group run as the group's Vitest files plus, when the group names a Playwright config, its retained Playwright files. A focused `npm run test:dashboard:backend` selection that matched one converted Vitest spec and two still-Playwright specs ran only the Vitest spec and exited 0, so the selected Playwright specs went unproved without notice.

### Occurrences
- Execution: SEED-413#prove-session-retention-and-input-on-vitest (plan 874; first related implementation commit `a1ea886b4d7646da070e847687a1672be565b3ea`)
  - Timestamp: 2026-11-27T11:15:40+08:00 (refactor pass run `refactor-s3-focus`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.116 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: `npm run test:dashboard:backend -- 'sessions/agent-launch-session-(refusal|kept-start|options)\.spec\.ts$' --workers=1` at `d8da4bcda` plus uncommitted slice 3 work printed only Vitest's `1 passed (1)` file and `2 passed (2)` tests and exited 0; `kept-start` and `options` were then Playwright specs. Selecting those two alone ran 12/12 Chromium cases.
  - Observed effect: the refactor pass noticed the missing cases and proved them separately; later briefs carried "prove still-Playwright specs in a separate selection".
  - Inference: the retained-Playwright `selects` check may reject an alternation regex that the Vitest filter accepts. An undetected skip would let a mixed migration selection report green with missing proof until the runner cutover removes Playwright from this group.
