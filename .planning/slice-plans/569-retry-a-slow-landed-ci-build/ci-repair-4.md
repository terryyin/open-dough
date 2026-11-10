# CI repair 4: private renderer cache and an unresolved shard deadline

Historical diagnosis through2b88d2d; the [approved implementation and proof](ci-repair-4-approved-proof.md) now own the current outcome.

## Outcome and ownership

Diagnosed both failed jobs of registered GitHub run `42848754719`, attempt `1`, published revision `d74d5a970263e926922718b52bde2421271e0cb3`. Failure inventory is now accounted for; diagnostic's `no-recognized-failure` gap was the shard deadline, not missing logs and not infrastructure. No attempt was rerun or dismissed.

The coordinator integrated accepted main `34853dbe8874fdb501ec1d8d2072c25a128b9dc3` history-preservingly, yielding unpublished combined HEAD `ed662ce8ae18e73dc297ed1b728ea632f14f0482` (parents d74d5a970 and 34853dbe8). I did not integrate, commit, push, format, lint, edit planning/DearDough, or read/poll/ack the coordinator's observer. Execution checkout remains clean. No implementation file changes are owned by this agent. The shared stash and all competing worktrees were left untouched.

Failure policy applies as written: [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests). Base attribution is no exemption; passing local proof is not final CI, and elapsed approval time is not authorization.

## Job dispositions

### Dashboard 7/12, job 129943288293

The only printed failure was `tests/intent/intent-ci-comparison-mounted-units.spec.ts:78`: the test passed but Vite emitted ENOTEMPTY renaming shared `node_modules/.vite/deps_temp_*` to `node_modules/.vite/deps`. This is the exact fault addressed by accepted main commit `8f49026999b4b84284b3da8d01821896fda76384`, “Give comparison renderers a private Vite optimizer cache.” I inspected its implementation and regression before requesting foundation integration; no duplicate repair was authored.

`createComparisonRenderer` now supplies each compiler a distinct mkdtemp cache and removes it after compiler close, including creation/SSR failure. Its regression creates two renderers concurrently, checks distinct existing temporary caches outside the default, closes both, and observes both removed. Combined-head proof also ran every directly traced renderer spec and the original failed mounted-units case. Disposition: existing accepted fix reused and locally proved; applicable new hosted CI remains coordinator-owned.

### Dashboard 9/12, job 129943287964

Full job log: `/tmp/seed285-shard9.log`. Finalized report artifact `13778509269` and timings/proof fragments are retained under `/tmp/seed285-run42848754719`; parsed HTML data is `report-data/report.json`. The initial artifact API listing was paginated, not evidence of a missing report; `gh run download ... -n dashboard-playwright-report-9` recovered it.

The report records **216 cases = 209 passed + 7 deadline-skipped**, zero unexpected or flaky case outcomes, four actual workers. The two run-level errors were suite and teardown timeout at 301.047 seconds, after prerequisite setup had used about 19 seconds of the unchanged 320-second budget. Quiet report contains only these two errors. No disconnected runner or outage is evidenced.

Four started cases were interrupted by the deadline:

- `tests/sessions/sessions-sidebar.spec.ts:56`, “lists every project's open sessions with the ones needing attention first, and sits left of the page or over it”; started 15:56:42.868Z.
- `tests/stories/preparation-legend.spec.ts:83`, desktop modal help; started 15:57:00.850Z.
- Same spec/line, 320px / 400% zoom / reduced motion modal help; started 15:57:01.677Z.
- Same spec:239, absent help without preparation facts; started 15:57:03.246Z.

Three cases never started:

- `tests/stories/recently-done-progressive-added-project.spec.ts:82`, held post-addition sessions read gates new project's Done records.
- Same spec:109, failed post-addition sessions read permits only the ten visible stories.
- `tests/stories/taken-slice-progress.spec.ts:129`, recorded slice progress and unreadable/missing-plan gaps.

All other 209 completed cases passed, including both new `backend-tests/intent/landed-ci-follow-up-reading.spec.ts` cases (19.929 summed case seconds). Proof fragments report 84 backend passes and 125 journey passes, plus 7 other/unfinished journey cases. Completed case timing sums 1,076.620 seconds; per-spec timing artifact sums 1,107.5 seconds including recorded shared hooks. The recorded weights for those completed files sum 1,003.6 seconds (unrecorded reading spec at assumed 9.6); this is about 1.10× observed cost, plus unfinished work. These failed/partial measurements are diagnostic evidence, **not a timing baseline** and were not used to refresh lists.

Workers remained busy across the deadline. Retained report step aggregation shows 285.606 before-hook + 51.708 after-hook seconds, including 238.209 seconds in dashboard fixture setup. Dominant completed files were cursor-session-scope-continuation 58.4, published-facts-isolation 52.0, project-remove 42.0, launch-options-exclusive 38.2 and responsive-session-reconciliation 38.0 seconds. There is no single evidenced hung assertion to repair.

Bounded twelve-way investigation: comparison-renderer cold setup totaled 16.009 aggregate seconds across three workers, offering at most roughly four wall seconds even if eliminated. Prewarming this graph cannot establish sufficient headroom. Replacing Vite server lifetimes across 139 setups or relocating whole journey families would require a broader measured harness/proof redesign. No such speculative change was made. SEED-287's active closure work and planned shared recovery/runtime work were preserved; broad adjacency is not treated as exemption from this owned deadline.

## Focused proof at combined HEAD

Resource decision before proof: macOS host has 16 CPUs and 48 GiB, AC 100%, fully awake system assertions, 65% free memory, load 7.97/8.54/7.53. Installation/native setup worktree was running native checks and a dashboard run with four workers. This agent sequenced its browser work at one worker, wrapped long checks in maintained `caffeinate -s -i` on AC; no full suite was launched. Later load 9.60/9.12/7.99 with 65% free memory did not justify broader concurrency. All started command handles reached terminal exit 0; no watch or process is retained by this agent.

### Cache and renderer consumers

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/runtime/comparison-renderer-vite-cache.spec.ts tests/intent/intent-ci-comparison-mounted-entries.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts tests/intent/intent-ci-comparison-mounted-relative.spec.ts tests/intent/intent-ci-comparison-mounted-sort.spec.ts tests/intent/intent-ci-comparison-mounted-units.spec.ts tests/intent/intent-ci-comparison-mounted-wording.spec.ts tests/intent/intent-ci-cues-dark-contrast.spec.ts tests/intent/intent-summary-story-comparison-mounted-fallback.spec.ts tests/intent/intent-summary-story-comparison-mounted-file.spec.ts tests/intent/intent-summary-story-comparison-mounted-gaps.spec.ts tests/intent/intent-summary-story-comparison-mounted-outside.spec.ts tests/intent/intent-summary-story-comparison-mounted-relative.spec.ts tests/intent/intent-summary-story-comparison-mounted-signed-sort.spec.ts tests/intent/intent-summary-story-comparison-mounted-sort.spec.ts tests/intent/intent-summary-story-comparison-mounted.spec.ts --workers=1 --reporter=list
```

Result: **85 passed, 29.8s**, log `/tmp/seed285-ci-repair4-cache-proof.log`, no Vite output or errors. The complete files were selected, without grep. Regression setup and assertions are described under job 7. The other 84 cases invoke production SSR content and actual app CSS, including unit-specific counts and children, labels, sorting, gaps, legacy endpoints, source cues, imported adapter/cancelled/taken cases and dark-contrast cues. Named observable assertions in these specs check rendered text/rows/cues; no substitute markup supplies the tested output. All test facts remain existing shared MakeMe arrangements.

Full effect trace: `/tmp/seed285-ci-repair4-cache-consumers.md`, made with installed consumer-trace using changed cache helper/regression paths and effect terms `createComparisonRenderer`, `comparisonRenderer`. Every located consumer has a disposition. Fifteen renderer-consuming specs run directly; `render.tsx` runs as the real SSR graph; five imported case modules execute through mounted-wording; pageTest owns setup/close. No production consumer of this test-only cache was found.

### Current story compatibility after main foundation

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-follow-up.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-follow-up-reading.spec.ts --workers=1 --reporter=list
```

Result: **4 passed, 54.7s**, log `/tmp/seed285-ci-repair4-combined-proof.log`. The reader cases took 10.1/10.3s, retained comparison modal phone journey 20.3s, and automatic-repeat setting/Done warning phone journey 12.3s.

Setup is real published priors, actual completed story and landing receipt ingestion, with synthetic external GitHub/provider facts. The first reading assertion observes original 120-second sample excluded under the shared reference, never repeat 100-second sample; the second restarts the real local reader after eviction/newer same-identity inputs, observing original saved workflow/sample/exclusion identities and no provider acquisition. Phone journeys observe saved attempts/frozen reference across first render/revisit/reload with no acquisition, plus defaults-off, real collected full repeat, red textual Done warning and saved totals. Existing strict phone-touch repair was preserved.

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run typecheck:dashboard
```

Result: exit 0; `/tmp/seed285-ci-repair4-typecheck.log`.

### Existing native allocation/action checks

From execution checkout, unchanged twelve-way source:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/dashboard-test-files.test.mjs tests/support/ci-proof-declaration.test.mjs tests/support/ci-proof-actions.test.mjs
```

Result: three named check files pass, terminal exit 0; `/tmp/seed285-ci-repair4-thirteen-proposal/twelve-baseline-native-proof.log`. The same initial three checks passed on the original four-path external proposal, but that partial proof is superseded by the complete candidate gate below.

## Concrete thirteen-way proposal — not applied

Complete packet: `/tmp/seed285-ci-repair4-thirteen-proposal/README.md`. User-facing patch `proposal.patch` is the completed eight-path candidate, replaced atomically after checks. Original four-path draft retained as `proposal-v1.patch`; complete draft also retained as `proposal-v2.candidate.patch`.

Eight paths: `.github/workflows/ci.yml`, `dashboard/tests/shards.md`, `dashboard/backend-tests/README.md`, `dashboard/frontend-tests/README.md`, `tests/support/dashboard-test-files.test.mjs`, `tests/support/ci-proof-actions.test.mjs`, `tests/support/ci-proof-frontend-report-support.mjs`, `tests/support/ci-proof-frontend-report.test.mjs`. Each remains <=250 lines. Only matrix count, proof-part counts, documentation and dependent exact assertions change. Four-worker hosted default, 320-second shard and six-minute job ceilings, test bodies and retry policy are unchanged.

Combined source has 977 specs, 960 recorded and 17 unrecorded at assumed 9.6s. Twelve-way preview predicts 1,026.5–1,036.1 job-seconds per shard; thirteen predicts 948.3–957.9. Maximum assigned sum falls a predicted 7.5%; this is not observed wall-time improvement. One extra job/setup consumes additional runner capacity. `selection-proof.json` confirms all 977 specs exactly once in both deals and unchanged native project identities (3 deployment specs, 974 ordinary). No duration list was edited.

Candidate proof used an external archive of combined HEAD under `/tmp/seed285-ci-repair4-thirteen-proposal/checkout`, overlaid only the eight proposed files and linked existing node_modules read-only. From that directory:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/dashboard-test-files.test.mjs tests/support/ci-proof-declaration.test.mjs tests/support/ci-proof-actions.test.mjs tests/support/ci-proof-frontend-report.test.mjs
```

Result: **four named check files pass, exit 0**; `native-proof-complete.log`. They observe actual spec exact-once partition/native project dispatch, summary declaration equality to actual matrix length, actual actions emitting every missing part through 13, and frontend report's present-zero/missing/failed/unfinished cases. Existing domain facts remain shared MakeMe arrangements. The final manually arranged wrong-revision frontend case intentionally retains twelve explicit parts because it is independent of workflow count.

`consumer-trace.md` carries supplied split/count/proof effect terms and dispositions for every 26 located consumers. Count-generic cleanup/synthetic split/readers are excluded with concrete reasons; current count-bearing docs and actual producer replays are updated. Historical timing evidence and installed generic guidance are preserved.

Preview commands:

```sh
node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard
node scripts/test-shares.mjs preview --split-count 13 --spec-dir dashboard
```

Outputs retained as `preview-twelve.txt`, `preview-thirteen.txt`. No-test-loss check iterates `dashboardTestProjects` for each split at both counts, matches discovered spec paths, rejects duplicate/omitted paths, and compares sorted `(project,file)` identities; full result is `selection-proof.json`.

## Remaining gates and proof preservation

No new implementation is left uncommitted. Existing main cache fix is delivered only into the coordinator's unpublished local foundation, with passing affected local proof. Existing story behavior conclusions retain their unchanged source and were reinforced by combined reader/phone proof. Cache/race conclusions are newly proved; the deadline cannot be claimed fixed on twelve shards by unrelated green local tests.

Explicit developer choice is pending for thirteen because maintained `docs/maintainer/dashboard-weight-timings.md#decision-boundary-and-evidence` requires future scheduling/overhead experiments to preserve twelve shards and four workers, and the session has no exception. Proposal application, managed delivery and applicable hosted CI remain root-owned after that choice; no passing rerun settles the failed deadline. With no authorization, preserve twelve and retain the unresolved gate. No hosted thirteen-way proof, full local suite or cross-tool native probe is claimed.

All owned command handles (9697, 5808, 92943, 18820, 64328, 50040, 35244) are terminal. Shared checkout, observer and stash state were not mutated by this repair agent. Full return is complete for cache reuse, diagnosis, compatibility proof and a concrete pending proposal; whole execution completion is not claimed.

## Additional twelve-way optimization experiment — rejected

At the coordinator's explicit follow-up, used installed dough-test-optimization guidance and read the current candidate record (existing real-rate-limit candidate preserved). Saving worth keeping was a hypothesis of 20–30 hosted wall seconds while preserving every case, all private process lifetimes, twelve shards, four hosted workers, 320 seconds and six minutes. No hosted saving is inferred from local phases.

The lead reader correctly refused to use the failed run as a baseline. Successful retained baseline was then read with:

```sh
node .agents/skills/dough-test-optimization/scripts/ci-proof-leads.mjs --revision fa1cb8d8dabb05e1cc2102cb39ccdbb0cf1363fa --scope dashboard/tests
```

It named run 42817360705 attempt 1, success, all twelve parts present, no gaps, 1,302 journey cases / 8,930.1 seconds. Its workflow runs `npm run test:dashboard` under the same twelve duration splits and CPU-derived workers. Ranked fixtures include the same Cursor-scope, published-facts and project-remove families. Output: `/tmp/seed285-ci-repair4-startup-leads.txt`.

Read-only phase probe used real global run artifacts and four fresh private previews; each closed before the next started. Only child spawn/address events were observed; no collaborator was replaced. The 311.8–419.8ms start had 304.9–413.8ms inside Vite spawn-to-own-address, leaving 5–10ms for fake-host/GitHub/config assembly. The isolated Vite CPU profile showed substantial ESM instantiation/resolve/compile plumbing, not a material React-plugin cost. Probe/profile commands:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node --experimental-transform-types --disable-warning=ExperimentalWarning /tmp/seed285-ci-repair4-startup-phases.mjs
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i node --experimental-transform-types --disable-warning=ExperimentalWarning /tmp/seed285-ci-repair4-startup-cpu.mjs
```

Both reached exit 0. The CPU script wraps only the Vite command with Node's `--cpu-prof` flags; raw profile lives in `/tmp/seed285-ci-repair4-vite-cpu/preview.cpuprofile`. Phase scripts and JSON/logs stay outside the checkout.

The coordinator authorized one external-only mechanism: inline/tree-shake Zod through the existing run-owned Rolldown server bundle instead of externalizing that pure-JS graph in every Vite/server/real Cursor process. Other dependencies, source metadata, native processes, mock boundaries and lifetimes stayed unchanged. Candidate was a fresh archive of exact combined HEAD under `/tmp/seed285-ci-repair4-zod-probe/checkout`; its only source difference was the external predicate in `serverBundle.ts`. No execution-workspace edit occurred.

Paired command, baseline A1 → candidate B1 → candidate B2 → baseline A2, four fresh sequential preview lifecycles in each process:

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i python3 /tmp/seed285-ci-repair4-zod-probe/run-paired.py
```

The orchestration launches the following exact underlying command from each named cwd, with task-specific `SEED285_PHASE_OUTPUT=/tmp/seed285-ci-repair4-zod-probe/<name>.json`:

```sh
node --experimental-transform-types --disable-warning=ExperimentalWarning /tmp/seed285-ci-repair4-zod-probe/measure.mjs
```

All four processes exited 0. Baseline cwd is the execution checkout, candidate cwd is the external archive. Node 24.21.0, one sequential native workload, same linked node_modules and cache policy, AC 100%/awake, 65–66% free memory; observed load 9.68–10.89 with the known installation/native worktree still active. Every sampled real Cursor runner was alive before server close and absent after; global artifact/process cleanup passed. No test timeout was changed and no new sleep was added.

| Local phase measure | Baseline (mean of two runs) | Candidate (mean of two runs) |
| --- | ---: | ---: |
| Run-median private preview startup | 492.37ms | 485.51ms |
| Cold global/artifact preparation | 1,914.87ms | 2,506.06ms |
| Cold prep + four starts and closes | 4,170.65ms | 4,776.99ms |

The apparent 6.86ms / 1.4% startup gain is buried in a 387–592ms sample range; cold-inclusive local measurement costs 606.34ms more. Source-path/file-assessment/cache and host variation further limit causal comparison. This does not demonstrate the worthwhile gain and cannot establish 20–30 seconds of hosted benefit. **Reject and stop this mechanism.** No broader behavioral gate or unchanged timing repetition was launched because no candidate is being kept. The pure performance probe supplies no new product behavior claim.

Original candidate is recoverable as `/tmp/seed285-ci-repair4-zod-probe/rejected.patch`; its sole external source edit was restored to exact combined-head bytes. `paired-runs.json` and `phase-comparison.json` retain every sample/cold/lifetime observation and literal orchestration remains available. No candidate record or planning file was edited; no new live candidate was asserted. Handles 14220 (expected failed-summary refusal), 51195, 71909, 83671 and 76496 are terminal. All implementation, native proof and experiment commands are now terminal; execution checkout remains clean at ed662ce8. Deadline repair and thirteen-way approval remain coordinator-owned unresolved gates.


## Coordinator acceptance and boundary

Accepted the exact existing-main cache repair, full85-case renderer proof,
combined4-case retained reader/phone proof, typecheck and independent return
`/tmp/seed285-refactor-ci4-return.md`: none — already clean,23 dispositions,
no edits or invalidated proof. This accepts the cache fix only, not the deadline.
The published d74 failure has both jobs accounted for, including all seven
unfinished cases. No rerun can substitute for an evidenced deadline repair.

The one Zod experiment is rejected/restored; its measured cold-plus-startup
regression invalidates the proposed startup strategy for the20–30s target.
Completed safe cache work is delivered independently under Execute Plan's
human-judgment path. Keep twelve shards until an explicit developer decision.
The exact eight-path alternative is retained as [proposal input](thirteen-shards-proposal.json),
as the exact JSON `patch` string, with its four-file native gate and exact-once977-spec checks above. It is not
applied. The developer question remains pending; elapsed time is no approval.
Story Branch integration, target CI, wrap-up and retirement are not complete.
