# Near-term watch list

Reviewed 2026-10-09 against the current Open Dough, Pygardon and Doughnut logs,
in Asia/Tokyo. Only verified relevant use starts a seven-day watch. Released
responses and successful use are not guarantees against recurrence. Occurrences
are counted once per project/execution. Failed and unexercised responses remain
in [the active catalog](finding-names.md). Codes remain allocated in Git history.

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers
Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

- **Follow-up:** released in 0.3.57: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [open-dough](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs), [open-dough](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-150--shared-readiness-caller-analysis-missed-queued-escalation-continuation), [pygardon](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-150--focused-slice-proof-missed-consumers-of-a-changed-shared-default-caught-only-by-coordinator-run-wider-suites), [doughnut](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).
- **Response / limit:** First released in 0.3.57: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: more than ten Open Dough, five Doughnut and one Pygardon executions, latest 0.3.54, about one failed CI run and repair per execution. Reports continue after f0f355c / 0.3.33 and fcc29fad / 0.3.48; a same-cause match with either is not established. Rows once filed under ODF-003 (plans 113, 140) and ODF-100 (plan 181) are this mechanism.

- **Additional report:** Open Dough plan 244 / 2d9347c1, 2026-10-04T21:09:46+08:00, Claude Code, execution release unknown (installed VERSION 0.3.56): focused card proof missed three page-wide consumers; slice 3 ran 1,036 specs and repaired them. The execution predates 0.3.57; it does not establish failure of the released consumer-selection response.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for cca9bff4 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-150 — Slice proof chosen by the changed components missed page-wide invariant specs](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-150--slice-proof-chosen-by-the-changed-components-missed-page-wide-invariant-specs).

Former local code: DD-177.

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.



- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002` - Timestamp: 2026-09-29T17:36:06+08:00 (CI run 36550218994 on `08f217af`) - Tool: Claude Code; Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: slice 2 delegation's spec list; the failure at `accessible-overview-keyboard.spec.ts:72` (expected 5, received 6); repair `76e6dce3`. Slice 1's list had included that spec. - Evidence (recurrence in the same execution): slice 3's retention sentence put "done" in Recent sessions' always-shown intro; `published-work.spec.ts:151` forbids completion words anywhere on a page without sessions and failed only in CI run 36551022132 on `32e554d5`; the full dashboard suite (286 tests, 46 s) then passed locally with the repair. - Observed effect: two failed CI runs, two repair commits, and two extra refactor agents. - Inference: Qualified. Selecting proof by the names of changed components misses specs that assert a whole-page property. The whole dashboard suite takes under a minute locally, so running it before delivering a page change costs less than one CI repair.
- Execution: `SEED-052#start-ad-hoc-project-session` / plan 172, first related implementation commit `689970f7` - Timestamp: 2026-09-30T10:29:14+08:00 (slice 5, commit `5c09cc85`; CI run 36660072699) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: slice 5 added an always-rendered `role="status"` line in `StartSession.tsx`; its delegated proof ran only the ad hoc, terminal, sidebar and card specs; CI failed on `getByRole('status')` matching two elements in six page-wide specs (`accessible-overview-keyboard`, `auto-refresh`, `auto-refresh-recovery`, `published-work`, `read-failure`, `refresh`). `aria-live="polite"` also collided with `dashboardPage.ts`'s `notice` locator, so the repair `ed7e1aa1` uses `role="log"`. From slice 6 the whole suite (351 tests, about 1 min) ran before delivery. - Observed effect: one failed CI run, one repair commit, one repair agent, and a stash and restore of slice 6's unfinished work. - Inference: Qualified. The cause recurred in a new execution; slice 4's implementer had run the whole suite once, slice 5's delegation named a spec list instead.
- Execution: `SEED-052#script-execution-preparation` / plan 178, first related implementation commit `821cd555` - Timestamp: 2026-09-30T15:12:54+08:00 (repair `f9927f40`; later `66cb5a25`, 2026-09-30T16:01:20+08:00) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: plan 178's outside-in proof said to run only the new focused specs locally ("the whole suite is CI's"). Slice 2 made every launch run a start first, so the launch became slower; `agent-launch-card-delete.spec.ts` (`f9927f40`) and, one slice later, `agent-launch-recent-delete.spec.ts` (`66cb5a25`) each changed session states while the last launch was still writing the fake listing (lost update). Further unreproduced load-sensitive local failures followed (`agent-launch-card-problems.spec.ts:82`, an ad hoc launch spec). - Observed effect: two repair commits, one found by CI and one later locally, for one root cause discovered one spec at a time. - Inference: Qualified. The changed operation (launch) has a whole family of `agent-launch-*` callers, and the earlier row here records the whole dashboard suite at about a minute; the plan's focused-files-only instruction repeated the changed-area proof selection.
- Execution: `SEED-052#use-cursor-from-dashboard` / plan 210, first related implementation commit `71764841` - Timestamp: 2026-10-02T09:27:33+08:00 (CI run 36950863895 `updatedAt` 2026-10-02T01:27:33Z) - Tool: Cursor - Open Dough release: modified; revision `0ae15498`; base 0.3.52 - Evidence: slice 1's proof named `agent-launch-start-cursor.spec.ts`, `agent-launch-start.spec.ts`, and `agent-launch-start-codex.spec.ts`. Job `dashboard (3/9)` on `71764841` failed four tests that still expected HTTP 400 for `host: "cursor"` in `agent-launch-refusal.spec.ts` and `agent-launch-ad-hoc-boundary.spec.ts`. Repair `2f21a7be`. - Observed effect: one failed CI run and one repair commit before slice 2. - Inference: Qualified. Offering Cursor invalidated the old unoffered-host rows; the slice proof followed the new start specs and missed those consumers.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (slice 2 publication and CI repair)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance; product guidance edited separately)
  - Evidence: run 36997893525/attempt 1 on `29bd2aa` failed keyboard/page-wide and cross-project launch fixtures; focused slice 2 proof omitted those callers. Repair `a049909` supplied the existing canonical Doughnut fixture and traversed enabled actions, retaining the production guard. Recovery `4dc3860a587ec3f95ee590134b88fb5d5d10a8a7:.planning/slice-plans/216-blocking-story-dependencies/CONTEXT.md` records six affected browser files and independent fixture consolidation proof.
  - Observed effect: two owned CI repair cycles with independent refactors, including a pause/stash/restore of slice 3's draft. Completion also exposed direct keyboard focus before canonical availability in run 37003387678; the passing repair observes enabled execution and canceled-dialog removal without changing production guards.
  - Inference: qualified recurrence of changed-operation caller selection; unavailable dependency facts now affect every new execution action, including legacy fixture callers. No full-suite timing or generalized cost measured.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 CI failures)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed at published start `db6b0da`; unchanged throughout execution)
  - Evidence: published slice 5 `9c5b4fd`, PLAN accepted 15-spec proof plus startup/restoration refactor proof. Runs 36997568980/1 and 36998319791/1 failed accessible-overview-keyboard (Remove missing from exact tab order), agent-launch-codex-options (two service starts expected, three observed), and agent-launch-codex-observation (expected no service preparation after records arrived). Full affected specs reproduced four failures locally; tests-only alignment and shared observation refactor passed the complete affected/startup/restoration selection and typecheck. Trunk integration 46b0431/run37001581515/1 additionally exposed production-watcher and production-watcher-updates development journeys without configured-project preconditions. Both original journeys reproduced red; four lines reuse configureDevelopmentProjects in isolated HOME. Complete watcher/configuration specs and typecheck passed, preserving real releases/HMR/records/boundaries/shutdown and genuine empty development; independent review needed no edits.
  - Observed effect: three failed CI runs and two additional implementation/refactor pairs; completion receipts retained observation instead of permitting handoff.
  - Inference: proof followed the new behavior and selected neighbors, but missed existing whole-page keyboard and native-lifecycle consumers. This matches ODF-150; no full-suite duration or universal test-selection rule is inferred.

- Execution: `SEED-008#installed-story-branch-integration` / plan 220, first related implementation commit `d213f1efec373b098bddd4e83030db2c08693571`
  - Timestamp: unknown (2026-10-02–03 execution; failed run 37021271369/attempt 1)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at established claim `418e5e52`; managed copies unchanged)
  - Evidence: slices 2–4 changed shared launch reporting input, attempt evidence and completion guidance. Focused proof missed existing model/preparation/one-shot/acceptance and lifecycle consumers; CI on `4ef5e2e` failed seven dashboard jobs and test (2/3). Repair `41fee026` aligned those consumers with an independent input oracle, preserving native grammar/settings and chmod-fault assertions; the latter exposed reporting bootstrap outside launch-progress cleanup finally. Final literal red/green commands and 42-test consumer selection live in plan 220 at `41fee026`.
  - Observed effect: one failed CI attempt and owned pause/repair/refactor cycle; the preserved fault scenario found and fixed a real stale launching-progress defect.
  - Inference: qualified match to changed-operation caller-flow selection, rather than a file-type premise. Select proof from the shared contract's current consumers, including test-support callers; retain independent observations. No guidance change or full-suite mandate is authorized here.

- Execution: `SEED-098#story-card-actions-read-at-a-glance` / plan 244, recoverable at `aa7a3eec7d5f48f3ac84d1c3afce18b0e0939ed3:.planning/slice-plans/244-story-card-actions-read-at-a-glance/PLAN.md`; first related implementation commit `2d9347c1b1fd90372afd9c6a51ac9af734fbbef5`
  - Timestamp: 2026-10-04T21:09:46+08:00 (CI run 37204384263 `updatedAt` on `4ed30458`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.56, last updated by `b0bc3a08`
  - Evidence: plan 244's Current decisions set the local gate to "the focused Playwright specs named per slice". Slice 2 (`4ed30458`) ran 24 note- and tooltip-reading specs. CI failed `accessible-overview.spec.ts:190` (Inspect story under the sticky stage heading; `.card button` lacked `scroll-margin-top`), `agent-launch-attention.spec.ts:79` (snapshot before the credited human slice 1 added to the scan line loaded), and `agent-launch-ad-hoc-sessions.spec.ts:215` (shorter cards let Recent sessions into the 720px window). Slice 3's implementer ran the full dashboard suite (1036 passed, about 6 min) and repaired all three in `670e776f`.
  - Observed effect: one failed CI run; no separate repair cycle, because the next slice found and fixed them before its own delivery.
  - Inference: Qualified recurrence. Shorter cards and a new scan-line fact changed page-wide layout and loading, which the selected specs did not exercise. The planner wrote the focused-only gate while the ODF-150 follow-up was still unreleased.

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: 2026-10-05T22:37:47Z (CI run 37383488386 jobs test (2/3) and test (3/3) on `0f334e41`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: slice 1 made `product-backlog complete` write an untracked `.planning/done/<id>.json`. Its return listed the node script tests that run `complete` as consumers and updated three of them; the installed `executable-proof.md` already names stand-ins. The shell substitute `native_one_shot_close_story` (`tests/support/native-agent-one-shot.sh`) committed with `commit -qam`, so `tests/git-publication-native-one-shot-results.sh` and `-workspaces.sh` failed on a dirty workspace. Repair `0b669ed2`.
  - Observed effect: one failed CI run and one pause/repair/refactor cycle; slice 2's uncommitted work was saved and restored around it.
  - Inference: Qualified recurrence with the stand-in rule installed: the consumer search followed `.mjs` callers and missed shell stand-ins of the same contract.

**Source:** [open-dough / ODF-150 — Shared readiness caller analysis missed queued escalation continuation](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-150--shared-readiness-caller-analysis-missed-queued-escalation-continuation).

Former local code: DD-212.

Changing the shared readiness reader aligned its normal startup consumers but left a queued one-shot escalation test asserting refusal on historical digest mismatch. The implementation report excluded one-shot starts as lacking the assessment fact; that exclusion did not account for the normal continuation invoked after escalation. The focused proof selected startup publication cases, not this reached continuation caller, and the coordinator accepted the exclusion.



### Occurrences

- Execution: `SEED-080#readiness-change-indicator` / plan 209, first related implementation commit `dc1f5e0dd0ebeef5ceff0ee80de35a411f72036c`
  - Timestamp: 2026-10-02T00:49:32Z (CI failure log)
  - Tool: Codex
  - Open Dough release: 0.3.52
  - Evidence: original implementation return stated admission/one-shot starts lack the assessment fact. CI run `36947799549`, attempt 1, `test (3/3)` at integrated `e0f41806` failed `one-shot-escalation-queued.test.mjs:107`: expected `source-refused`, actual `existing` with `changedSinceReview: true`. The focused runner reproduced that exact failure; updated assertions passed with the queued and startup-refusal suites.
  - Observed effect: trunk CI caught an affected consuming assertion omitted from accepted focused proof. Repair changed only the test; Ready continuation, ownership, genuine Not ready refusal and authorization safeguards stayed intact.
  - Inference: a mode-level exemption hid a reached shared consumer. The green initial startup suites were valid evidence for their boundaries, not for this additional continuation path.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-150 — Focused slice proof missed consumers of a changed shared default, caught only by coordinator-run wider suites](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-150--focused-slice-proof-missed-consumers-of-a-changed-shared-default-caught-only-by-coordinator-run-wider-suites).

Former local code: DD-209.



When a slice changed a rule every caller shares (caps default on in `VerifyCommon`), the implementation agents' focused commands passed while E2E features and other modules were unrun, and several existing tests had silently become vacuous (passing on an empty universe).

### Occurrences
- Execution: `SEED-069#story-consistent-classification` (`.planning/slice-plans/299-sharadar-classification/PLAN.md`, removed at wrap-up, recoverable at `c7c3544ac`; Take `5dce13078`; first implementation commit `650f1623e`)
  - Timestamp: unknown (2026-10-03, slices 4 and 5, about 13:00 to 13:15 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: slice 4's agent reported E2E "not run"; the coordinator ran eight affected features (47 scenarios). Slice 5's agent reported 102 focused tests passing; the coordinator's `pytest -n 2 tests/search_run tests/strategies tests/test_live_strateg*.py` found `test_every_calculation_read_goes_through_the_run_environment` at 0 trades; the follow-up instrumented sweep found `test_search_run_cli_workers_evals_a_generation_in_a_pool_with_single_worker_verify` and `test_tfdc_verify_enforce_industries_reads_from_db` passing on empty universes. The retrospective later found `label_every_daily_bar_symbol` also masked a product gap (labels never reach bars-only symbols).
  - Observed effect: one broken test and two vacuous tests caught before delivery; one masked product gap reached the retrospective.
  - Inference: useful practice — after a shared-default change, the coordinator's bounded wider run caught what focused proof could not; asking agents for a vacuity check (assert scanned counts) when a default narrows the universe would make it explicit. Generality to other stories is unassessed.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-150 — An implementer's slice proof ran only the specs it chose, missing consumers of the store method it changed](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-150--an-implementers-slice-proof-ran-only-the-specs-it-chose-missing-consumers-of-the-store-method-it-changed).

Former local code: DD-136.

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.



- Execution: SEED-047#story-1 / `edfd7ba92a:.planning/slice-plans/014-continue-to-neighboring-note-after-deletion/PLAN.md` / a41b1e0507; Timestamp: unknown (before slice 1 commit 2026-09-27T10:59:16+08:00); Tool: Claude Code; Open Dough release: 0.3.42 (VERSION in the execution checkout). - Evidence: coordinator summary to the retrospective (subagent transcripts not supplied): coordinator consumer check found 2 failing tests in `NoteMoreOptionsForm.trashNote.spec.ts`; fixed by an empty listing mock in `tests/notes/noteMoreOptionsTrashTestSupport.ts` (in a41b1e0507), then `tests/notes tests/store tests/toolbars` 353/353. - Observed effect: one coordinator repair before commit; no defect shipped. - Inference: a `grep` for callers of the changed method across `tests/` when choosing slice proof would have included the spec.
- Execution: SEED-059#story-16 / `dfec19ca03:.planning/slice-plans/058-current-block-same-in-pdf-and-epub/PLAN.md` / d3eec9db16; Timestamp: 2026-09-30T00:01:40Z (CI job log time of the failure); Tool: Claude Code; Model: claude-sonnet-5-5; Open Dough release: unknown. - Evidence: slice 2 removed the 40-point landing padding; its delegation named `book_browsing.feature` and `reading_record.feature`, and the report ran only those. CI run 36647846005 attempt 1 failed `phone_reading.feature` "Choosing a book block closes the book layout and moves the book there" (`expected ... to contain '2 /'`); the slice 3 agent ran `phone_reading` (7/7 locally at 390*844); the repair agent reproduced the failure only at 390*900 and repaired in 5206b08370. - Observed effect: one failed published E2E job, a paused slice 3 (stash, repair agent about 10 min, restore) and one test repair. - Inference: `phone_reading.feature` also chooses PDF blocks, so a search of `e2e_test/features/book_reading/` for scenarios that choose a block would have listed it. Same root cause as the entries above (proof chosen by edited area); the actor was the coordinator's delegation. The failure itself needed a taller-than-stock window, so local runs could not have shown it.
- Earlier occurrence details: 2 additional recorded rows in `8830c682704aac3bbb34bf9b1204da8feba042ca:DearDough.md`; these are historical evidence, not new occurrences.
- Execution: SEED-063#story-1 / slice-plans/007-track-property-values-separately / 8eaaf2b720; Timestamp: 2026-09-30T21:39:52+08:00 (slice 8 commit eead7350eb; failure reported after publication); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.50. - Evidence: slice 8 changed reduce from writing a suffixed `key 2` to appending a value; its delegation and plan named only backend tests (`RelationControllerReduce*`, `*Relation*`, ...). CI run 36723317159 attempt 1 failed `e2e_test/features/relationships/relationship_edit_and_remove.feature` "Reducing to source property uses a suffixed key when the property already exists" (expected the list content to include `a part of 2: '[[Mars]]'`); repaired in f07ff79425. - Observed effect: one failed published E2E job; slice 9 paused (repair stash, repair agent, refactor agent, restore). - Inference: a search of `e2e_test/features/` for the retired behavior (`suffixed`, `a part of 2`) when planning or delegating slice 8 would have listed the scenario; the plan's "Tests to extend" list covered unit and controller tests only.

- **Watch start:** 2026-10-07 (date-only, Asia/Tokyo; the locator dates the use, not its exact observation time); Open Dough plan 267 / `ed9a306e`, Claude Code / 0.3.57: the coordinator ran five reached specs before the slice 1 publication, 15 passed. Later type-only refactor misclassification is separately active as ODF-217; the coordinator reran and rejected that change before publication. This establishes consumer-gate use, not correct refactor judgments.
- **Review after:** 2026-10-14.
- **Last assessed:** 2026-10-09, Asia/Tokyo; all three current logs and their retained execution locators checked. No supported recurrence of this exact fixed mechanism. Coverage is limited to the named real use; installation dates are not the start.

<a id="odf-200"></a>

## ODF-200 — Undocumented delivery target-ref form
Managed delivery accepts only `refs/heads/<branch>` for `--target-ref`, but its usage text and the step guidance say only `REF`, so coordinators read the script or have a first call refused.

- **Follow-up:** released in 0.3.57: SEED-008#story-branch-delivery-target (story and plan recoverable at `b413d0fe:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` and `b413d0fe:.planning/slice-plans/256-story-branch-delivery-target/PLAN.md`). **Evidence:** [open-dough](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-200--story-branch-deliverys---target-ref-value-had-to-be-read-from-the-script), [pygardon](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-200--managed-deliverys-usage-text-does-not-say-that---target-ref-must-be-a-full-branch-ref), [doughnut](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-200--managed-increment-delivery-rejected-a-remote-tracking-target-ref-the-accepted-form-is-not-shown-next-to-the-step).
- **Response / limit:** First released in 0.3.57: `9a9e0a6e` makes `deliver` require `--mode trunk|story-branch`, names `--target-ref refs/heads/<branch>` in its usage, and refuses a Story Branch target other than `refs/heads/<execution branch>` before any fetch, push, or observation; one-shot landings declare `--tracking one-shot`. `a1bcad0d` puts the literal command with each mode's target in "Publish the candidate". Before it: plan 250 / `1be19216`, 2026-10-05T14:48:39+09:00, Claude Code / 0.3.56, passed `refs/heads/main` from the established start and published an unreviewed Story Branch increment to trunk. Related lookup/refusal reports in all three projects on 0.3.56 predate the response.

- **Evidence correction:** The plan 245 / `d754256c` target-ref lookup row was moved from ODF-059 to ODF-200 without counting another execution.
- **Frequency:** 36 distinct retained project/executions: 22 Open Dough, eight Pygardon and six Doughnut, deduplicated by their implementation identities. Most report lookup or refusal friction; plan 250 is the one demonstrated unreviewed trunk publication. No severity or recurrence score is inferred from the number alone.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for 9a9e0a6e and a1bcad0d is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-200 — Story Branch delivery's `--target-ref` value had to be read from the script](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-200--story-branch-deliverys---target-ref-value-had-to-be-read-from-the-script).

Former local code: DD-196.

The delivery references name an "authorized target ref" and say Story Branch Mode pushes to the remote execution branch, but do not say that `deliver --target-ref` then takes `refs/heads/<execution branch>` rather than the trunk the established start names as `target`.



### Occurrences

- Execution: `SEED-065#warning-free-lint` / plan 187, first related implementation commit `96838533`
  - Timestamp: 2026-09-30T20:07:39+08:00 (commit time of `96838533`; the lookup followed it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.50
  - Evidence: before delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef`, read its lines 60–120, and read `targetBranchName` in `publication-git.mjs`, then invoked `deliver --target-ref refs/heads/claude/make-npm-run-lint-report-no-warnings-or-errors-c`; the established start listed `target: main`.
  - Observed effect: four extra tool calls; delivery was accepted on the first attempt with observation attached.
  - Inference: Qualified. Passing `refs/heads/main` from the established start's `target` was a plausible mistake; whether the script would refuse it was not checked.
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5` - Timestamp: 2026-10-01T09:36:12+08:00 (commit time of `ef745cb5`; the lookup preceded its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `0d565a9e`; base 0.3.51 - Evidence: before the first delivery the coordinator grepped the delivery references and script for `--target-ref` and `targetRef`, finding `refs/heads/<branch>` only in `wrap-up-closure-publication.md:39`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement as the earlier row.
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: 2026-10-01T18:04:21+08:00 (commit time of `47ef4368`; the refusal followed it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: first `deliver` passed `--target-ref claude/review-dashboard-architecture-before-adding-more` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted.
  - Observed effect: one refused call; no state change.
  - Inference: Qualified. The refusal message made the fix obvious, so this occurrence cost less than the earlier lookups.
- Execution: `SEED-072#responsive-session-start-reconciliation` / plan 192, first related implementation commit `109fd76b` - Timestamp: 2026-10-01T17:50:33+08:00 (commit time of `109fd76b`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: unknown; installed guidance last updated by `e6a7106c` (base v0.3.51) - Evidence: the coordinator passed `--target-ref origin/claude/keep-the-dashboard-responsive-while-session-star` and `deliver` refused with "authorized target must be a branch ref"; the retry with `refs/heads/<execution branch>` was accepted with observation attached. - Observed effect: one refused delivery call and one retry; no state changed. - Inference: Qualified. The script refuses the wrong form, so the cost stays small; the guidance still does not name the expected form.
- Execution: `SEED-072#durable-startup-reconciliation` / plan 206, first related implementation commit `3d82d365` - Timestamp: 2026-10-02T08:16:29+08:00 (commit time of `3d82d365`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at claim `76a298b1`) - Evidence: first `deliver` passed `--target-ref origin/claude/keep-reconciled-startups-settled-under-one-unres` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; the same coordinator mistake as the plan 192 row, one day later, on the same story.
- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56` - Timestamp: 2026-10-02T14:13:42+08:00 (commit time of `f84a7a56`; the lookup followed it) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, then read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; the same missing statement, now on Cursor with 0.3.54.
- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62` - Timestamp: 2026-10-02T16:42:11+08:00 (commit time of `7053bc62`; the lookup followed it) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: two extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce` - Timestamp: 2026-10-03T17:53:24+08:00 (commit time of `7b6ddcce`; the lookup followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in it and in `execution-increment-publication.mjs`, then passed `refs/heads/<execution branch>`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6` - Timestamp: 2026-10-03T15:31:33+08:00 (commit time of `fdcc45f6`; the lookup preceded its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-094#observe-ci-on-codex-and-cursor` / plan 235, first related implementation commit `c02158fc` - Timestamp: unknown (before `c02158fc` committed 2026-10-03T18:33:40+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help` and inferred `refs/heads/<execution branch>` from Story Branch wording; the established start listed `target: main`. - Observed effect: one bundled read; delivery accepted first time. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-052#unread-report-apart-from-engagement` / plan 238, first related implementation commit `f1221461` - Timestamp: unknown (between the slice 1 commit at 2026-10-03T19:49:17+08:00 and its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-091#frame-look-checks-one-rule` / plan 236, first related implementation commit `03c9316c` - Timestamp: unknown (delivery of `03c9316c`, after its commit on 2026-10-03) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref main` from the established start's `target` and was refused with "authorized target must be a branch ref: main"; the coordinator then grepped the script and read its lines 60–110 before retrying with `refs/heads/<execution branch>`, which was accepted with observation attached. `publish-the-candidate.md:12-13` does name `refs/heads/<target-branch>`, but the coordinator had read only `trunk-publication.md`'s delivery sections. - Observed effect: one refused call and two lookup calls; no state change. - Inference: Qualified; the same missing statement in the references the delivery path directs a coordinator to read.
- Execution: `SEED-052#mark-report-read-keeps-session-state` / plan 239, first related implementation commit `46340f4a` - Timestamp: unknown (before the first delivery, after `46340f4a` committed 2026-10-03T22:05:42+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help` and inferred `refs/heads/<execution branch>` from Story Branch wording; the established start listed `target: main`. - Observed effect: one extra call; delivery accepted first time. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-091#story-card-information-radiator` / plan 231, first related implementation commit `c58dc07d` - Timestamp: unknown (before the delivery of `c58dc07d`, committed 2026-10-03T21:36:52+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: while slice 1 ran, the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; both deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-104#confirm-mark-as-done` / plan 246, first related implementation commit `0ae01bd4` - Timestamp: unknown (while slice 1's agent ran, before `0ae01bd4` committed 2026-10-05T08:33:04+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; all five deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-102#full-height-review-changes` / plan 247, first related implementation commit `2b983fd0` - Timestamp: unknown (delivery of `2b983fd0`, after its commit at 2026-10-05T13:51:45+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref origin/claude/review-changes-in-a-full-height-panel-with-compa` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-105#land-and-wrap-up-process-retrospective` / plan 250, first related implementation commit `1be19216` - Timestamp: 2026-10-05T14:48:39+09:00 (commit time of `1be19216`; its delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator read `trunk-publication.md` ("Story Branch Mode pushes that candidate to the recorded remote execution branch") and `deliver --help`, then passed `--target-ref refs/heads/main` from the established start's `target: main`; `deliver` accepted it with receipt target `refs/heads/main`, and `git ls-remote` then showed `main` at `1be19216` with the execution branch still at the claim `4aea12b4`. Slice 2 used `refs/heads/<execution branch>`. - Observed effect: a Story Branch increment was fast-forwarded onto remote trunk before review or integration; not reverted (no force push), and a second CI observer was attached for trunk. - Inference: Qualified. This answers the first row's open question: `deliver` takes no mode and does not refuse a trunk target, so the missing statement can publish to trunk rather than costing only lookups.
- Execution: `SEED-100#dashboard-specs-pass-unchanged-code` / plan 251, first related implementation commit `3a0ff700` - Timestamp: 2026-10-05T19:19:01+09:00 (commit time of `3a0ff700`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref claude/dashboard-specs-pass-ci-on-a-revision-that-chang` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; same missing statement.
- Execution: `SEED-088#review-changes-since-last-review` / plan 245, first related implementation commit `d754256c` - Timestamp: unknown (while slice 1's agent ran, before `d754256c` committed 2026-10-05T13:43:51+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator printed the `deliver` usage in `execution-increment-delivery.mjs`, grepped `targetRef` across the scripts, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; all six deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-106#paged-dashboard-columns` / plan 225, first related implementation commit `a5e9e772` - Timestamp: 2026-10-06T07:36:58+09:00 (commit time of `a5e9e772`; the refusal followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the first `deliver` passed `--target-ref claude/dashboard-columns-page-horizontally-instead-of-w` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; the queued follow-up has not reached this installed release.
- Execution: `SEED-113#share-repeated-observer-reads` / plan 261, first related implementation commit `a1c593a9` - Timestamp: 2026-10-06T17:24:05+09:00 (commit time of `a1c593a9`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the first `deliver` passed `--target-ref claude/share-repeated-reads-across-dashboard-observers` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached, and later deliveries used that form. - Observed effect: one refused call; no state change. - Inference: Qualified; the delivered follow-up has not reached this installed release.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde` - Timestamp: unknown (before the first delivery of `a2d43dde`, committed 2026-10-07T07:51:11+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION` at claim `0edabd1c`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. After main (0.3.57) was merged at `fefab16d`, the next `deliver` was refused for the missing `--mode` and retried with `--mode story-branch`. - Observed effect: two extra lookup calls and one refused call; every delivery was accepted. - Inference: Qualified; the released response now refuses a missing mode, which surfaced mid-execution when the merge updated the installed scripts.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-200 — Managed delivery's usage text does not say that `--target-ref` must be a full branch ref](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-200--managed-deliverys-usage-text-does-not-say-that---target-ref-must-be-a-full-branch-ref).

Former local code: DD-207.

`execution-increment-delivery.mjs deliver` requires `--target-ref refs/heads/<branch>`. Its usage line and the trunk-publication reference say only "authorized target ref".

### Occurrences
- Execution: `SEED-078#story-search-identity-limitations` (`.planning/slice-plans/298-search-identity-limitations/PLAN.md`, removed at wrap-up, recoverable at `9fca8cd4a`; Take `c61858b6b`; first implementation commit `4f693bfa9`)
  - Timestamp: unknown (first delivery of `4f693bfa9`, 2026-10-03 before 12:49 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: before the first `deliver`, the coordinator ran `--help` and then grepped `publication-git.mjs:targetBranchName` to learn the `refs/heads/` requirement.
  - Observed effect: two extra lookup calls; no failed delivery.
  - Inference: minor, and likely to recur for each new coordinator. Naming the form in the usage text would remove the lookup.
- Execution: `SEED-083#story-force-exit-hang` (`.planning/slice-plans/304-force-exit-hang/PLAN.md`, removed at wrap-up, recoverable at `2730f4345`; Take `f870be233`; first implementation commit `288f3cc67`)
  - Timestamp: unknown (first delivery of `288f3cc67`, 2026-10-03).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: the coordinator's first `deliver` passed `--target-ref claude/find-and-fix-why-a-second-ctrl-c-sometimes-does` and was refused with `authorized target must be a branch ref`; the retry with `refs/heads/...` was accepted.
  - Observed effect: one refused delivery call, with no publication side effect.
  - Inference: this recurred even though ODF-200 is already recorded, because a new coordinator does not read the process log. Only the usage text or the reference wording would prevent it.
- Execution: `SEED-085#story-ci-capacity-holders-correction` (`.planning/slice-plans/309-ci-capacity-holders-correction/PLAN.md`, removed at wrap-up, recoverable at `f5ffa5edf`; Take `c20639354`; first implementation commit `cda42fabf`)
  - Timestamp: unknown (first delivery of `cda42fabf`, 2026-10-03).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: before the first `deliver`, the coordinator ran `--help`, then grepped `execution-increment-delivery.mjs` and `publication-git.mjs:targetBranchName` to learn the `refs/heads/` form.
  - Observed effect: two extra lookup calls; the first delivery was accepted.
  - Inference: a third recurrence for a new coordinator; usage text naming the form would remove it.
- Execution: `SEED-078#story-auto-trading-same-basis` (`.planning/slice-plans/303-auto-trading-same-basis/PLAN.md`, removed at wrap-up, recoverable at `a4673f7b6`; Take `e6b1c08c4`; first implementation commit `74d86dc20`)
  - Timestamp: unknown (2026-10-03, before the first delivery of `74d86dc20`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence: before the first `deliver`, the coordinator read the `--help` usage, then grepped `execution-increment-delivery.mjs` and `publication-git.mjs:targetBranchName` to learn the `refs/heads/` form.
  - Observed effect: three extra lookup calls; no refused delivery.
  - Inference: same cause as the earlier rows; it still recurs on release 0.3.56.
- Execution: `SEED-078#story-holdings-exit-source-correction` (`.planning/slice-plans/311-holdings-exit-source-correction/PLAN.md`, removed at wrap-up, recoverable at `283925819`; Take `ce0c44ba9`; first implementation commit `d9fb70a14`)
  - Timestamp: unknown (first delivery of `d9fb70a14`, 2026-10-03 before 21:52 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: the coordinator's first `deliver` passed `--target-ref main` and was refused with `authorized target must be a branch ref: main`; it then read `execution-increment-delivery.mjs` and retried with `refs/heads/claude/correction-the-holdings-page-exit-settings-name`, which was accepted.
  - Observed effect: one refused delivery call and one source lookup; no publication side effect.
  - Inference: the wording "authorized target" also left unclear that Story Branch Mode targets the execution branch, not trunk.
- Execution: `SEED-088#story-slice-proof-covers-wide-reach` (`.planning/slice-plans/313-slice-proof-covers-wide-reach/PLAN.md`, removed at wrap-up, recoverable at `f01d6c42b`; Take `40ecdd0f4`; first implementation commit `f4ed72bc1`)
  - Timestamp: unknown (first delivery of `f4ed72bc1`, 2026-10-04).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence: the coordinator ran `--help`, whose usage says only `--target-ref REF`. Its first `deliver` passed `--target-ref claude/slices-that-touch-wide-reach-parts-of-pygardon-p` and was refused with `authorized target must be a branch ref`. The retry with `refs/heads/...` was accepted.
  - Observed effect: one refused delivery call, with no publication side effect.
  - Inference: the fifth recurrence on 0.3.54–0.3.56. The usage text is still the only place a new coordinator would learn the form.
- Execution: SEED-094#story-production-observations-without-round-trips (`.planning/slice-plans/315-production-observations-without-round-trips/PLAN.md`, removed at wrap-up, recoverable at `8c16de57e`; Take `2451f59c7`; first implementation commit `b33a4bd4f`)
  - Timestamp: unknown (first delivery attempt of `b33a4bd4f`, 2026-10-05).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence: the first `deliver` passed `--target-ref claude/executions-read-the-production-facts-they-need-w` and was refused with `authorized target must be a branch ref`.
  - Observed effect: one refused delivery call, with no publication side effect.
  - Inference: the sixth recurrence on 0.3.54–0.3.56.
- Execution: `SEED-089#story-frontend-tests-wait-on-events` (`.planning/slice-plans/314-frontend-tests-wait-on-events/PLAN.md`, removed at wrap-up, recoverable at `f9dc615`; Take `3499bae08`; first implementation commit `a7f8d4fe6`)
  - Timestamp: unknown (first delivery of `a7f8d4fe6`, 2026-10-06).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: the first `deliver` passed `--target-ref origin/claude/frontend-tests-wait-on-what-the-page-shows-not-o` and was refused with `authorized target must be a branch ref`; the retry with `refs/heads/...` was accepted.
  - Observed effect: one refused delivery call, no publication side effect.
  - Inference: a fourth recurrence; a new coordinator still guesses the ref form.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-200 — Managed increment delivery rejected a remote-tracking target ref; the accepted form is not shown next to the step](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-200--managed-increment-delivery-rejected-a-remote-tracking-target-ref-the-accepted-form-is-not-shown-next-to-the-step).

Former local code: DD-175.

Recurrence of former DD-172 (`99fa1b9835e3dff2473837ba2a1f8b11967d5938:DearDough.md`, pruned from this log). `execution-increment-delivery.mjs deliver` accepts only a full branch ref (`refs/heads/<branch>`); trunk-publication.md asks for an "authorized target ref" without giving that form.



- Execution: SEED-059#story-18 / slice-plans/060-panel-after-one-paragraph-epub-block / d439c05234; Timestamp: 2026-09-30, ~10:25+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-sonnet-5-5; Open Dough release: unknown. - Evidence: `deliver --target-ref origin/story/SEED-059-story-18` exited with "authorized target must be a branch ref: origin/story/SEED-059-story-18"; retry with `refs/heads/story/SEED-059-story-18` was accepted (sha d439c05234). - Observed effect: one rejected delivery call, nothing published. - Inference: a second coordinator made the same first-try mistake, so the form is not discoverable from trunk-publication.md alone.
- Execution: SEED-062#story-1 / slice-plans/006-reify-property / 508d4909b5; Timestamp: unknown (slice 1 delivery on 2026-09-30, about 18:50 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.50. - Evidence: `deliver --target-ref claude/reify-a-property` exited with "authorized target must be a branch ref: claude/reify-a-property"; retry with `refs/heads/claude/reify-a-property` accepted 508d4909b5. - Observed effect: one rejected call, nothing published. - Inference: a bare branch name is as natural a first guess as a remote-tracking ref; the form still is not shown next to the step.
- Execution: SEED-066#author-controlled-titles / slice-plans/002-keep-titles-under-author-control / aa093fffeb; Timestamp: unknown (slice 1 delivery on 2026-10-03, shortly after 14:55 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. - Evidence: `deliver --target-ref claude/keep-note-titles-under-the-author-s-control` exited with "authorized target must be a branch ref"; retry with `refs/heads/...` accepted aa093fffeb. - Observed effect: one rejected call, nothing published. - Inference: third occurrence; the coordinator had read the `--help` usage, which also says only `--target-ref REF`.
- Execution: SEED-067#stacks-survive-other-builds / slice-plans/005-stacks-survive-other-builds / 4122c07c06; Timestamp: 2026-10-03, ~18:45+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. - Evidence: after `--help` showed only `--target-ref REF`, the coordinator read `execution-increment-delivery.mjs` and `publication-git.mjs` (`targetBranchName` requires `refs/heads/`) and also had to infer that Story Branch Mode targets the execution branch, not `main`; first call with `refs/heads/claude/start-and-keep-local-app-stacks-on-current-backe` was accepted. - Observed effect: no rejected call, but three extra source-reading calls before delivery. - Inference: fourth occurrence; avoiding the rejection still cost source reading, so the form and the story-branch target belong next to the step.
- Execution: SEED-066#keep-every-transcribed-sentence / slice-plans/008-keep-every-transcribed-sentence / d68937a0d2; Timestamp: 2026-10-04 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. - Evidence: coordinator ran `deliver --help` (only `--target-ref REF`), then read `execution-increment-delivery.mjs` and grepped `publication-git.mjs` `targetBranchName` before the first accepted call with `refs/heads/claude/keep-every-transcribed-sentence-when-dictated-te`. - Observed effect: no rejected call; two extra source-reading calls. - Inference: fifth occurrence; same as the fourth.
- Execution: SEED-069#observe-branch-code-against-real-services / slice-plans/004-hold-worktree-e2e-stack / ee414fbdf1; Timestamp: 2026-10-05, ~12:16+09:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. - Evidence: coordinator ran `deliver --help` (only `--target-ref REF`), then grepped `targetBranchName` in `publication-git.mjs` before the first accepted call with `refs/heads/claude/observe-unmerged-branch-code-against-real-servic`. - Observed effect: no rejected call; two extra lookup calls. - Inference: sixth occurrence; same as the fourth and fifth.

- **Watch start:** 2026-10-07 (date-only, Asia/Tokyo; the locator dates the use, not its exact observation time); Open Dough plan 264 merge `fefab16d` installed 0.3.57 during execution; the next delivery refused missing `--mode` and the explicit Story Branch retry was accepted. Earlier lookup/refusal reports predate the fixed scripts. No later unreviewed trunk publication is evidenced.
- **Review after:** 2026-10-14.
- **Last assessed:** 2026-10-09, Asia/Tokyo; all three current logs and their retained execution locators checked. No supported recurrence of this exact fixed mechanism. Coverage is limited to the named real use; installation dates are not the start.

<a id="odf-202"></a>

## ODF-202 — Managed Codex delivery lacks observer attachment
Managed delivery under Codex has no supported binding to the yielded stream observer, and guidance forbids the separate stream start that would cover it, so publications go unobserved.

- **Follow-up:** released in 0.3.57: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-202--managed-codex-delivery-and-yielded-stream-have-no-documented-attachment-seam), [pygardon](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-202--managed-codex-delivery-has-no-attachment-for-its-detached-observer), [doughnut](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-202--managed-codex-delivery-left-ci-unobserved-without-a-retained-stream-binding).
- **Response / limit:** First released in 0.3.57: a Codex execution arms its yielded stream at execution start, `deliver --host codex` reuses it, and without one the receipt names that step; `--codex-bridge-available` is removed. Native Codex evaluation (paid, manual) not yet run. Before it: Thirteen Open Dough, six Pygardon (releases unknown) and one Doughnut Codex executions, latest 0.3.54. Arming the yielded stream before first delivery worked in Open Dough plans 203 and 204.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for abeb79f9 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-202 — Managed Codex delivery and yielded stream have no documented attachment seam](https://github.com/terryyin/open-dough/blob/e904c1f589516a2595023ce1dfe7dd0e7193a3de/DearDough.md#odf-202--managed-codex-delivery-and-yielded-stream-have-no-documented-attachment-seam).

Former local code: DD-201.

Managed increment delivery can create a detached observer and say Codex binding is retained by the caller. The documented yielded-cell stream command instead creates its own mailbox; it accepts no existing directory. The coordinator could not establish that those two paths deliver notifications from the same observer without starting another observer or inventing an adapter.



### Occurrences

- Execution: `SEED-067#pin-older-preparation-command-proof` / plan 195, first related implementation commit `94d87f23428d092f9b7885598315f71a018ca39d`
  - Timestamp: unknown (2026-10-01, first increment delivery before review at 15:07+08:00)
  - Tool: Codex
  - Open Dough release: 0.3.51 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: installed `execution-increment-observation.mjs` calls `startExecutionMailbox`; `ci-host-bridge.mjs` Codex binding says caller retains stream binding. `ci-mailbox.mjs stream` calls `streamMailboxWorker`, which creates a new mailbox; its CLI takes repository/branch rather than an existing mailbox directory. `trunk-publication.md` forbids a separate ordinary-increment observer start. Retained delivery receipt for `94d87f23` accepted the branch publication with `observation.state: unobserved`, reason `Codex yielded-cell bridge is unavailable`; no mailbox was started.
  - Observed effect: local proof and publication succeeded; automatic CI notification and completion coverage remained unavailable for this execution.
  - Inference: A missing documented connection, rather than missing host primitives, prevented the coordinator from truthfully asserting a live bridge. An independently verified attachment seam could change this judgment.

- Execution: `SEED-066#dough-land-kept-one-shot-ownership` / plan 199, first related implementation commit `df9fb909aba363fc1d5c025070d9dcee1becdc74`
  - Timestamp: unknown (2026-10-01, first increment delivery)
  - Tool: Codex
  - Open Dough release: 0.3.51 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: `29abd1fa92e8fff1d3bb1575da8d17895100af7e:.planning/slice-plans/199-dough-land-kept-one-shot-ownership/PLAN.md` Delivery state retains accepted branch SHA and unobserved receipt. Installed `execution-increment-observation.mjs` starts a detached mailbox; `ci-host-bridge.mjs` says Codex binding is caller-retained. `ci-mailbox.mjs stream` creates another mailbox, with no existing-directory argument; ordinary managed delivery forbids a separate observer start. No verified connection was available, so delivery omitted the bridge-available assertion and started no observer.
  - Observed effect: focused proof, all eight native re-acceptance runs, and branch publication passed; automatic CI notification/completion coverage remained unobserved.
  - Inference: same missing attachment contract as the first occurrence. Exposed host primitives alone do not establish delivery from the managed observer; no runtime or guidance repair is authorized here.

- Execution: `SEED-075#host-neutral-session-meaning` / plan 203, first related delivery commit `4ef487ec5ac683d6cecd9ff1f4618a45b76dbecf`
  - Timestamp: unknown (2026-10-01, observer setup before first branch increment)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `cee792a`; unchanged on authorized repair resume)
  - Evidence: `675c2a86f10a6775dbd7dcb1e4e145515a1594b1:.planning/slice-plans/203-host-neutral-session-meaning/PLAN.md` retains documented yielded stream `watch-LkPomH` (cell 26, PTY 44395, PID 24803), armed before managed delivery. Receipts for `4ef487ec`, `56f8681f`, `7e5d273e`, `1a027123`, `cef712aa` reused that exact observer. Installed managed detached-start and new-mailbox stream paths still expose no existing-directory attach argument. Human ownership stop confirmed local shutdown; authorized resume armed `watch-4v8x7b`, reused by repair publication `bee36261`.
  - Observed effect: startup/reuse provided one observer per active execution period without a detached second worker. Delivered CI assertion evidence led to an ownership question and Terry's bounded repair assignment; notification coverage was not inferred from tool presence alone.
  - Inference: matches the successful plan-204 route, limiting claims of unavailable Codex primitives. The managed-versus-stream guidance ambiguity still required coordinator investigation; document that single supported startup/reuse route. No guidance/runtime edit is authorized by this review.

- Execution: `SEED-080#readiness-change-indicator` / plan 209, first related implementation commit `dc1f5e0dd0ebeef5ceff0ee80de35a411f72036c`
  - Timestamp: unknown (2026-10-02 branch delivery; immediate review clock 08:40:01+08:00)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: managed delivery accepted `dc1f5e0d` on `refs/heads/codex/show-changes-since-readiness-review-without-bloc`, with `observation.state: unobserved`, reason `Codex yielded-cell bridge is unavailable`, and `startReceipt: null`. Installed `execution-increment-observation.mjs` starts a detached mailbox; `ci-host-bridge.mjs` assumes caller-retained Codex binding; `ci-mailbox.mjs stream` creates a new mailbox rather than attaching the existing one. Ordinary increment guidance forbids a separate observer start.
  - Observed effect: focused CLI, startup and dashboard proof, typecheck, refactoring, formatting and publication passed; CI notifications/completion coverage remained unavailable. No observer was started.
  - Inference: the documented attachment gap recurred despite available host primitives. No runtime or guidance change is authorized by this occurrence.

- Execution: `SEED-072#recheck-verification-fidelity` / plan 212, first related implementation commit `d04999c9a5ceffa00baea867fef7d5f84f46db86`; source/proof recovery: `f4693027055bd262d08f7bbdf60ffee9700a1296:.planning/slice-plans/212-recheck-verification-fidelity/PLAN.md`
  - Timestamp: unknown (2026-10-02 branch deliveries and automatic review)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `4f36666f`; unchanged during execution)
  - Evidence: managed receipts for `d04999c9`, `af244145` and `c6c5a4a0` accepted branch publications with `observation.state: unobserved`, no mailbox. The coordinator inspected the detached-start/new-stream split and omitted the unsupported bridge assertion. Automatic review then read this finding's successful plan-204/205 startup evidence and armed the documented yielded stream `/tmp/dough-ci-501/watch-V5539N` (cell 80, session 48031, PID 43597) before completion publication.
  - Observed effect: all slices passed local proof and publication, including 769 dashboard tests; initial automatic notification coverage was absent. Managed resume registered the prior implementation without another push; the same observer delivered its concurrent-Claude-fixture failure. Repair `6d063776` corrected the proven lost listing update and reused that observer. Final CI/shutdown evidence belongs to the retained plan.
  - Inference: the ambiguity and delayed consultation of existing successful evidence caused another initial coverage gap. This limits the earlier claim that available Codex primitives cannot provide coverage. Keep the existing proposal for one explicit startup/reuse contract; no guidance/runtime change is authorized here.
- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: three accepted managed deliveries (`bcaabd99`, `0a701c84`, `9c0d6bb4`) reported unobserved CI/no mailbox because no yielded binding was armed. Retrospective consulted the earlier successful ODF-202 occurrences, verified `ci.yml` push selection/runtime, and started the documented single yielded stream `watch-x4nPTj` before completion publication. Managed resume accepted `9c0d6bb4` without another push and recovered that owner; repair `4a50e086` reused it.
  - Observed effect: initial notification coverage was absent; recovered observation delivered owned retry-assertion failures and enabled a bounded red/green repair before handoff. Completion CI remains pending at this record write.
  - Inference: the startup/reuse route works with available primitives; the initial interpretation of managed-versus-stream guidance was too restrictive. Document one clear route and consult successful existing evidence before declaring coverage unavailable. No guidance/runtime change is authorized here.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 four slice publications and automatic review)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: managed receipts for `4e076e11`, `0a018138`, `ea031d5b` and `e5fe8a7c` accepted story-branch publication with CI unobserved and no mailbox. Review consulted ODF-202's successful startup/reuse occurrences, verified `ci.yml` push selection/runtime, then execution recovery armed the documented yielded stream `watch-HB2kLV` (cell105/session35081/PID79031). Managed resume recovered that owner, registered `e5fe8a7c` without another push and delivered its existing startup-test teardown failure. Repair `0e88f016` reused the observer.
  - Observed effect: initial notification coverage was absent. Recovered observation enabled a deterministic red/green repair before completion; no runtime or guidance edit was required.
  - Inference: prior successful evidence limits the coordinator's initial conclusion that the attachment seam prevents coverage. The ordinary-increment prohibition and startup/reuse wording remain ambiguous; keep the existing proposal for one explicit supported route. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (slice 3 delivery)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance)
  - Evidence: original yielded stream `/tmp/dough-ci-501/watch-7PZYuD` recorded `CI_MONITOR_UNAVAILABLE` for a GitHub TLS handshake timeout and terminal `finished`. Managed delivery of `186ef150` started detached mailbox `/tmp/dough-ci-501/watch-cWrqJu`, reported `attached`, and reused it for `ce8b9df`. Installed Codex binding assumes a caller-retained stream; documented `stream` creates a mailbox rather than attaching this directory.
  - Observed effect: the replacement worker observes registered revisions, but live Codex notifications were reported unavailable; coordinator retained that mailbox for final completion rather than creating another observer.
  - Inference: recurrence of the attachment-seam gap after a valid initial stream ends. The replacement later ended after an API connection failure. Completion returned observation_unavailable and retained an unread owned failure; its diagnosis and repair continued. No CI success or guidance/runtime repair is claimed here.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 execution)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at published start `db6b0da`; unchanged throughout this execution)
  - Evidence: `9c5b4fd8bb26e7f9bda1739199260d8c47928204:.planning/slice-plans/215-persistent-dashboard-project-configuration/PLAN.md`, CI observation recovery. CkhcLI finished after provider failure; later Xvrcwc was lost with PID absent. Managed deliveries started detached BIxa8G and qaIDit. The documented Codex stream command creates a mailbox rather than attaching to either directory. Coordinator accounted for their unread evidence, stopped those exact observers, and armed EQYhvD; installed resume then registered ecab73d with zero pushes and later deliveries reused EQYhvD.
  - Observed effect: Recovery required separate observer accounting, stopping, rearming, and managed resume before publication and native notification shared a live observer again.
  - Inference: The missing attachment seam complicated recovery; the cause of Xvrcwc worker loss is unknown. Normal reuse of an already-live yielded observer succeeded.

- Execution: `SEED-008#installed-story-branch-integration` / plan 220, first related implementation commit `d213f1efec373b098bddd4e83030db2c08693571`
  - Timestamp: unknown (2026-10-02–03 initial deliveries and observation recovery)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at established claim `418e5e52`; managed copies unchanged)
  - Evidence: managed deliveries through `4ef5e2e` reported CI unobserved with no yielded binding. During slice 5, the coordinator consulted this finding's successful startup/reuse occurrences, verified `ci.yml`/CI selection and checkout-bound runtime, and armed the documented yielded stream `watch-YbJYkk` (cell116/session1277/PID34317). Managed resume registered `4ef5e2e` without another push, delivered run37021271369/attempt1 failure, and repairs/final slice `41fee026`/`817594d8` reused that exact observer. Sequence1 was durably acknowledged after repair; completion coverage remains pending at this record write.
  - Observed effect: initial notification coverage was absent; supported recovery enabled the owned CI repair before final handoff without a second observer or runtime/guidance edit.
  - Inference: the coordinator's initial interpretation was too restrictive. Existing successful evidence establishes a startup/reuse route with available primitives; keep the existing proposal for one explicit supported contract and consult that evidence before declaring coverage unavailable.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-202 — Managed Codex delivery has no attachment for its detached observer](https://github.com/terryyin/pygardon/blob/00fed21223e3558332d2db3a5c166972c25d373d/DearDough.md#odf-202--managed-codex-delivery-has-no-attachment-for-its-detached-observer).

Former local code: DD-195.



Managed delivery starts a detached mailbox but the documented Codex yielded-cell
adapter only starts a new foreground stream; the installed runtime exposes no
attachment command for the existing mailbox. Claiming the bridge ready would
leave detached events undelivered; starting another stream conflicts with the
single-observer and managed-delivery instructions.

### Occurrences
- Execution: `SEED-079#story-dashboard-session-startup` (plan recoverable at `2fbd32568af3f64809fcc09b87ffeac43c62781a:.planning/slice-plans/292-fast-python-env-preparation/PLAN.md`; first implementation `3836e5c6da92ccbd29bd07db579159bf01dfb396`).
  - Timestamp: unknown (2026-10-01).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: `execution-increment-observation.mjs` calls `startExecutionMailbox`; `ci-host-bridge.mjs` Codex binding reports caller-retained stream; `ci-mailbox.mjs` CLI stream always creates a mailbox; `references/ci-notify-codex.md` starts that stream, while `references/trunk-publication.md` forbids separate ordinary observer starts. Managed receipts for `3836e5c6` and `76e40b35` report unobserved coverage.
  - Observed effect: live CI target preflight passed, both publications were accepted, but no notification bridge/observer was claimed or started and CI remains unobserved.
  - Inference: an attachment path or a managed foreground-stream delivery path is needed before Codex can truthfully claim asynchronous coverage under this contract.

- Execution: `SEED-078#story-sharadar-caps-labels` (plan recoverable at `5df1517af3eebb90b80d1d73cc92e473524d345c:.planning/slice-plans/294-sharadar-cap-classifications/PLAN.md`; first implementation `9d1f4cb2d1ce0258a6a34104b552aa3c443e564f`).
  - Timestamp: unknown (2026-10-01, before the first increment publication).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: coordinator yielded cell 15 ran the documented foreground stream after real target preflight; mailbox `/tmp/dough-ci-501/watch-F65zqO`, PID 1495. Managed receipts for `9d1f4cb2`, `e308c03e`, `10741367` and `88d753d8` reused that observer rather than starting a detached one.
  - Observed effect: actual asynchronous coverage was retained, but required a separate startup before ordinary managed delivery, contrary to its no-separate-start instruction.
  - Inference: prearming the existing Codex stream avoids the detached attachment gap operationally; it does not reconcile the guidance or provide a managed attachment path.

- Execution: `SEED-078#story-real-strategies-both-sources` (plan recoverable at `8570e3e9701c0b87e8f8f0f9ec1c4d5f7b7f3b0a:.planning/slice-plans/295-atr-source-sensitivity/PLAN.md`; Take `6e5820f07030a2ca3a26a9ee2680af881e066643`; first input checkpoint `f53fb835cae15eaf9930f676333e65ad0f1e282a`).
  - Timestamp: unknown (2026-10-01–02, managed increment delivery).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: coordinator delivery receipts through `90209e44d9e1327f4711cfa308e959d8190c592d` report observation `unobserved`, reason `Codex yielded-cell bridge is unavailable`, with null start receipts after successful real adapter target preflight.
  - Observed effect: increments were published, but no observer was launched and no applicable CI verdict was observed.
  - Inference: this is another instance of unavailable managed Codex notification coverage; these receipts alone do not establish that detached-observer attachment was the specific cause. A supported host bridge is needed before claiming coverage.

- Execution: `SEED-078#story-delisted-reach-engine` (plan recoverable at `e3ce1aab5b30d30b9d16d2b12d6d30d3ec7d345e:.planning/slice-plans/296-delisted-evaluation/PLAN.md`; first implementation `619b40f037f45ef1c477df7385259f2d25e31346`).
  - Timestamp: unknown (2026-10-02, increment delivery).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: real adapter target preflight passed; managed receipts for the five implementation publications through `4cc546f2b0c24ad73441ff46dcdd467c127df722` reported `unobserved`, reason `Codex yielded-cell bridge is unavailable`, with no start receipt. Inspection confirmed the same detached-mailbox/new-stream attachment gap described above.
  - Observed effect: all five increments were accepted, but no observer or mailbox was started; CI and its completion verdict remain unobserved.
  - Inference: the existing guidance/runtime mismatch prevents claiming managed asynchronous coverage; this execution did not use the contrary separate-start workaround.


- Execution: `SEED-078#story-sharadar-update-on-demand` (plan recoverable at `b569b98711141afaadc52385de7e732d6ee3eaa0:.planning/slice-plans/296-sharadar-update-on-demand/PLAN.md`; first implementation `d92e39c7de55c5e060bccce1307150b7dfc77f5a`).
  - Timestamp: unknown (2026-10-02, increment delivery).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: real adapter target preflight passed; managed receipts for all four implementation publications through `e393e914a346184872fded7322ebd22f88d19c93` report `unobserved`, reason `Codex yielded-cell bridge is unavailable`, and null start receipts. Coordinator inspected the same managed detached-mailbox/new-stream attachment mismatch.
  - Observed effect: all increments were accepted, but no observer/mailbox started; no applicable CI verdict is available at completion.
  - Inference: the existing runtime/guidance gap prevents managed asynchronous coverage. A supported attachment or managed foreground stream remains needed; no separate-start workaround was used.
  - Wrap-up evidence: its explicit trunk-observation procedure permitted a foreground Codex stream after the live `main` preflight. That stream surfaced the owned candidate's TS2322 upload-narrowing failure, reproduced and repaired at `b569b98711141afaadc52385de7e732d6ee3eaa0`; static typecheck and seven mounted tests passed. This does not establish ordinary managed-increment bridge support.

- Execution: `SEED-078#story-search-on-sharadar-source` (plan `.planning/slice-plans/295-sharadar-search/PLAN.md`, removed at wrap-up, recoverable at `1ec7854f6937be58eb29fd4ce35f49c175f08f6b`; first implementation `a50404ae884fe5b228829aba6193de766df0193c`).
  - Timestamp: unknown (2026-10-03, managed increment delivery).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: real adapter target preflight passed; accepted increment receipts through `d7fcc290d5500fb850c7b7fe3df8da420525ec65` report `unobserved`, reason `Codex yielded-cell bridge is unavailable`, and null start receipts. Retained runtime inspection found no attachment path for a managed detached observer.
  - Observed effect: all implementation increments were published, but no observer/mailbox started and no applicable CI verdict is available; no separate-start workaround was used.
  - Inference: another occurrence of the existing managed Codex coverage gap; local proof and accepted publication do not establish CI success.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-202 — Managed Codex delivery left CI unobserved without a retained stream binding](https://github.com/nerds-odd-e/doughnut/blob/b009b6cb5b048e02ee55927447857e50e233bddd/DearDough.md#odf-202--managed-codex-delivery-left-ci-unobserved-without-a-retained-stream-binding).

Former local code: DD-201.



The managed delivery CLI can declare the Codex bridge ready, while the documented yielded adapter launches its own stream observer. This execution did not establish a supported binding between those paths and published without observation.

### Occurrences
- Execution: SEED-066#preserve-existing-content / `979cac31fc19f756bdfc480d9b24f1ab7dfeec34:.planning/slice-plans/001-preserve-existing-content/PLAN.md` / 64173ad25fbbe7457705aeea972a959d9d3f8dd4
  - Timestamp: unknown (2026-10-03, slice 1 and 2 managed delivery)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged execution-checkout VERSION)
  - Evidence: coordinator had functions.exec/notify/yield_control and exec/write_stdin available, but invoked deliver without `--codex-bridge-available`; both receipts reported unobserved. `ci-host-bridge.mjs` tests that flag and describes binding as retained by caller; `ci-mailbox.mjs stream` creates a mailbox. Guidance prohibits a separate observer start for managed ordinary increments.
  - Observed effect: commits 64173ad25f and 6c2ed996f7 were accepted without a live observer, failure notifications, or a CI completion verdict. Local proof passed; remote CI success was never claimed.
  - Inference: the unavailable receipt reflects the omitted flag, not proof that host tools were unavailable. Clarify or provide one supported managed-delivery-to-yielded-stream binding before treating that flag as notification readiness. This is a process/integration gap, not a product defect; no workaround or guidance edit was made here.

- **Watch start:** 2026-10-08 (date-only, Asia/Tokyo; the locator dates the use, not its exact observation time); Open Dough plan 277 / `18a159ee`, Codex / 0.3.57: retained yielded cell 8, session 81005, `watch-XlowzV`; published increments reuse that exact observer (`9d4034ce^:.../277-review-selected-commits/PLAN.md` and CONTEXT.md). Matching route exercised; failure acknowledgment and replacement after loss are not established by this evidence.
- **Review after:** 2026-10-15.
- **Last assessed:** 2026-10-09, Asia/Tokyo; all three current logs and their retained execution locators checked. No supported recurrence of this exact fixed mechanism. Coverage is limited to the named real use; installation dates are not the start.
