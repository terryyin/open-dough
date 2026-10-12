# Near-term watch list

Reviewed 2026-10-12 against the current Open Dough, Pygardon and Doughnut logs,
in Asia/Tokyo. Only verified relevant use starts a seven-day watch. Released
responses and successful use are not guarantees against recurrence. Occurrences
are counted once per project/execution. Failed and unexercised responses remain
in [the active catalog](finding-names.md). Codes remain allocated in Git history.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story

A named gap contradicts the story goal, but acceptance judges it against the plan's narrower scope and delivers it.

- **Sources:** Doughnut / DD-132 (historical evidence at `9ab3ca6e:docs/maintainer/finding-names.md`); [Pygardon / DD-214](https://github.com/terryyin/pygardon/blob/9751952fe19dc48ead34987157c9909e9ff9a10c/DearDough.md#odf-139--a-hand-back-gap-was-accepted-as-plan-scoped-without-checking-it-against-the-storys-scope).
- **Follow-up:** released in 0.3.58; under observation, not resolved.
- **Response:** `b7930baf`, first released in 0.3.48, adds the story-goal and named-gap check to `wrap-up.md` Accept proof. The same rule remains at `9de43de4`; no demonstrated intervening correction of agent follow-through warrants a new identity.
- **Later response (2026-10-10):** `43ef3b9b304b2ffb7ac64238f8c7c6d46ca676a3` introduces structured obligations and story-section quote checks; `9ab257c12fc4abfe0f8586fdbf00e5d53d5a3aaa` carries ownership across slices; `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b` wires delegation, acceptance, delivery and completion gates into the released payload declaration. Free CLI tests refuse the plan-only exclusion. Native proof recorded in `4ec755976033b4265f4a3e39c0c3f3aec7e94906` observes the 303 coordinator retaining a return, a refusing slice gate and a correction handoff. [Proof and limits](https://github.com/terryyin/open-dough/blob/5bd862746d2789e9c34d05276a507f908d141bc7/.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md#4-a-native-host-coordinator-keeps-the-three-replayed-gaps-owned-developer-run). First containing release verified on 2026-10-12: 0.3.58. See the current watch assessment below. Earlier failed-watch evidence stays retained.
- **Post-fix evidence:** Pygardon SEED-078#story-auto-trading-same-basis, plan 303 / `74d86dc20` (Take `e6b1c08c4`, recoverable at `a4673f7b6`), 2026-10-03 date-only, Claude Code / claude-opus-5-5 / 0.3.56. Slice 4 reported that `HoldingsExitSettingsResults.tsx` omitted the source; the story said each signal and exit row names it. Acceptance filed this as outside the plan's ask; retrospective correction plan 311 was required. Qualified inference: acceptance used the plan instead of the story. This is a supported failure after the 0.3.48 response, so its prior watch does not pass.
- **Provenance-limited report:** Pygardon SEED-085#story-ci-capacity-kept-free, plan 308 / `cc959dab8` (Take `b77d4e9ff`, recoverable at `33c3283d2`), 2026-10-03 date-only, Claude Code / claude-opus-5-5, guidance release unknown. Acceptance called missing build cache and container holders plan-scoped despite the story's Scope; correction plan 309 followed. This is the same false-scope mechanism; its unknown release cannot establish post-fix recurrence.
- **Frequency:** Three distinct supported executions including the original Doughnut plan 006 on 0.3.41. The two Pygardon retrospectives do not count as extra executions. ODF-185 is separately active again after its failed learning-only acceptance watch.

- **Release verification (2026-10-12):** Relevant implementation/guidance diffs and first-containing tags checked for `43ef3b9b`, `9ab257c1`, `ce0aaa3c`: `v0.3.58` (`c879707a`, 2026-10-10T17:30:32+09:00). All three projects adopted it on 2026-10-10: Open Dough `af8ab03d`, Pygardon `0556f9d69`, Doughnut `e95c90d37a`. Adoption alone does not establish effectiveness.

- **Watch start:** 2026-10-11 (date-only, Asia/Tokyo), release 0.3.58. Pygardon plan 327, first implementation `212333b6d`; the positive-use evidence below and `7cbf44c49:.planning/slice-plans/327-retry-ci/PLAN.md` obligation G4 show a named story gap returned and proved within the same slice.
- **Review after:** 2026-10-18.
- **Last assessed:** 2026-10-12; Open Dough, Pygardon and Doughnut current logs and the named execution records checked. This watches the plan-scope exclusion mechanism only; the distinct unsupported judgment in ODF-223 remains active. Native replay limits and the failed 0.3.48 response remain recorded. No supported same-mechanism recurrence established; this is not proof the issue cannot recur.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-139 — A hand-back gap was accepted as "plan-scoped" without checking it against the story's scope](https://github.com/terryyin/pygardon/blob/9751952fe19dc48ead34987157c9909e9ff9a10c/DearDough.md#odf-139--a-hand-back-gap-was-accepted-as-plan-scoped-without-checking-it-against-the-storys-scope).

Former local code: DD-214.

The coordinator accepted an implementer's named gap on the implementer's own claim that the plan scoped it out. It did not read the gap against the story's Scope, which listed the omitted holders.

### Occurrences
- Execution: `SEED-085#story-ci-capacity-kept-free` (`.planning/slice-plans/308-ci-capacity-shortage-seen-before-start/PLAN.md`, removed at wrap-up, recoverable at `33c3283d2`; Take `b77d4e9ff`; first implementation commit `cc959dab8`)
  - Timestamp: unknown (2026-10-03, slice 1 acceptance).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: the slice 1 hand-back said "Holders cover images and volumes only … as the plan scoped". The story's Scope names "the engine's other build cache … and anything else". Plan 308 excluded only the release cache budget remedy. Proof acceptance asks for each named gap to be read against the story's goal and scope.
  - Observed effect: the retrospective found the omitted build cache and containers and wrote correction plan 309.
  - Inference: reading the seed's Scope at acceptance would have returned the gap within the same slice, at about one extra implementation round.

- Execution: `SEED-078#story-auto-trading-same-basis` (`.planning/slice-plans/303-auto-trading-same-basis/PLAN.md`, removed at wrap-up, recoverable at `a4673f7b6`; Take `e6b1c08c4`; first implementation commit `74d86dc20`)
  - Timestamp: unknown (2026-10-03, acceptance of slice 4 before commit `e3a7ea2fc`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence:
    - Slice 4's return listed under Gaps: "The Holdings page panel (`HoldingsExitSettingsResults.tsx`) renders the same response but does not show the source. … The slice only asked for the Auto Trading Holdings section."
    - The story goal says "Each signal and exit row names that source".
    - The coordinator recorded the gap in the plan as out of the plan's ask.
    - The retrospective then planned correction `311-holdings-exit-source-correction`.
  - Observed effect: a one-slice correction story and plan instead of a one-file change inside slice 4.
  - Inference:
    - The plan narrowed "Holdings exit settings" to one component, and the coordinator checked the gap against the plan rather than the goal.
    - `wrap-up.md#accept-proof` already says a gap contradicting the goal returns to implementation in the same slice.


### Positive use retained from Pygardon (2026-10-12)

- Execution: SEED-101#story-watcher-setup-error-no-verdict (plan 327, first related commit `212333b6d`) Timestamp: unknown Tool: Claude Code Model: claude-opus-5-5 Open Dough release: 0.3.58 Evidence: 2026-10-11; slice 1 return "No test drives the real watcher end to end with a `setup_error` attempt", closed by the two cases added to `tests/pygardon-ci-path-coverage.test.mjs` in `212333b6d`; slice 3 return "an observation poll's `try_admit` can start an observed tip before the retry", closed by `offer_queued_retry` in `ci_session_admission.try_admit` and `test_observed_tip_arriving_while_idle_waits_behind_the_queued_retry` in `7cbf44c49` (plan 327 obligation G4) Observed effect: Both slices' named proof commands had passed; each return to the same agent took one further round and was delivered in the same slice commit. Inference: A practice worth keeping. The plan's proof for key examples 4 and 7 stopped at the session's happy path and the adapter, which is where the gaps sat.

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation
A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Follow-up:** released in 0.3.58; under observation, not resolved.
- **Earlier limit:** No response before the later response below. Second project: Pygardon plan 296 (0.3.54) delivered a story promise incomplete and needed a correction plan.
- **Later response (2026-10-10):** `43ef3b9b304b2ffb7ac64238f8c7c6d46ca676a3`, `9ab257c12fc4abfe0f8586fdbf00e5d53d5a3aaa` and `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b` add structured ownership, receiving-slice listing/refusals and mandatory delegation/completion boundaries. Free CLI tests own the receiving-slice refusal. Native proof recorded in `4ec755976033b4265f4a3e39c0c3f3aec7e94906` observes retained slice-8 ownership, completion refusal and the full live-fault/next-daily handoff; no implementation agent or native slice-8 acceptance was observed. [Proof and fixture limits](https://github.com/terryyin/open-dough/blob/5bd862746d2789e9c34d05276a507f908d141bc7/.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md#4-a-native-host-coordinator-keeps-the-three-replayed-gaps-owned-developer-run). First containing release verified on 2026-10-12: 0.3.58. The replay alone does not resolve the finding; see the later ordinary-use assessment below.

- **Release verification (2026-10-12):** Relevant implementation/guidance diffs and first-containing tags checked for `43ef3b9b`, `9ab257c1`, `ce0aaa3c`: `v0.3.58` (`c879707a`, 2026-10-10T17:30:32+09:00). All three projects adopted it on 2026-10-10: Open Dough `af8ab03d`, Pygardon `0556f9d69`, Doughnut `e95c90d37a`. Adoption alone does not establish effectiveness.

- **Watch start:** 2026-10-11 (date-only, Asia/Tokyo), release 0.3.58. Pygardon plan 327: `3194119c1:.planning/slice-plans/327-retry-ci/PLAN.md` records G1–G3 as receiving slice 3; `7cbf44c49` carries them into slice 3 and records all three proved with named retry and storage-readiness regressions.
- **Review after:** 2026-10-18.
- **Last assessed:** 2026-10-12; Open Dough, Pygardon and Doughnut current logs and the named execution records checked. One real receiving-obligation exercise, not all hosts or arbitrary judgment. No supported same-mechanism recurrence established; this is not proof the issue cannot recur.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-156 — A slice-acceptance obligation recorded as a plan learning never reached the next delegation](https://github.com/terryyin/open-dough/blob/c76322764499936acd42328b5ef4f66f4df6bcf8/DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation).

Former local code: DD-126.

A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.



- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; slice 3 delegated after `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 Learnings at `d0101737`; `dough-bug-fixing/SKILL.md:98` still forces `--no-replan` and its closure steps still route through wrap-up at `70f6cde1` - Observed effect: the retrospective found contradictory closure guidance and planned a correction - Inference: Qualified. Learnings are free text; nothing ties an acceptance obligation to the slice that must satisfy it



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-156 — A gap deferred to a later slice was not carried into that slice's delegation](https://github.com/terryyin/pygardon/blob/9751952fe19dc48ead34987157c9909e9ff9a10c/DearDough.md#odf-156--a-gap-deferred-to-a-later-slice-was-not-carried-into-that-slices-delegation).

Former local code: DD-205.

Slice 6 accepted that non-Sharadar action faults propagate and leave the run `running`, noting "slice 8"; slice 8's delegation covered restart interruption only, so the live-fault case was never implemented and the retrospective found it.

### Occurrences
- Execution: `SEED-078#story-sharadar-daily-update` (`.planning/slice-plans/296-sharadar-daily-update/PLAN.md`, removed at wrap-up, recoverable at `f93f2014b`; Take `bc246ad45`; first implementation commit `fed1b745b`)
  - Timestamp: unknown (slice 6 acceptance 2026-10-03 about 08:50 +08:00; retrospective about 11:00 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: plan 296 slice 6 accepted-proof note "other exceptions propagate leaving `running` (slice 8)"; slice 8 delegation and proof addressed restart recovery and recording faults; retrospective finding F1 and correction plan `297-sharadar-daily-update-fault-recovery`.
  - Observed effect: a story promise ("a failure … ends that run … the next daily occurrence can try normally") was delivered incomplete and needs a correction story.
  - Inference: a deferral recorded in an accepted note should be copied into the receiving slice's text (as was done for slice 5's waiting gap into slice 7) before that slice is delegated.

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


- **Last assessed:** 2026-10-12; all three current logs checked. No supported recurrence of this exact mechanism. Later terminal transport loss is retained under ODF-121; unknown execution releases do not establish a failed response. The original watch dates remain; seven days have not elapsed.

<a id="odf-201"></a>

## ODF-201 — Codex stream leaves delivered failures unacknowledged
The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

- **Follow-up:** released in 0.3.57; under observation, not resolved.
- **Response / limit:** First released in 0.3.57: the documented Codex binding acknowledges each notified batch through `ci-mailbox.mjs acknowledge`; a record never notified still retains shutdown. Native Codex evaluation (paid, manual) not yet run. Before it: nine Open Dough Codex executions, latest 0.3.54.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for 8ac67735 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.
- **New report:** Open Dough / DD-242, plan 262, describes the same missing durable acknowledgment, but execution release and modified revision are unknown. Inspection of the released binding shows the acknowledgment added by `8ac67735`; the report describes the old no-ack binding. Retain the report without inferring post-0.3.57 failure.

- **Watch start:** 2026-10-10 (date-only, Asia/Tokyo), release 0.3.57. Open Dough plan 281, first implementation `652036be`; `88fed85b:.planning/slice-plans/281-review-merged-one-shot-change/CI-REPAIR.md` records the matching Codex observer `watch-lAm58a` with `delivery.json` acknowledged through sequence 7, including owned failure records 1–6.
- **Review after:** 2026-10-17.
- **Last assessed:** 2026-10-12; Open Dough, Pygardon and Doughnut current logs and the named execution records checked. Durable acknowledgment evidenced; raw original notify history/timing unavailable; later terminal transport loss belongs to ODF-121. No supported same-mechanism recurrence established; this is not proof the issue cannot recur.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-201 — Codex stream notifications leave handled failures unread at completion](https://github.com/terryyin/open-dough/blob/c76322764499936acd42328b5ef4f66f4df6bcf8/DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).

Former local code: DD-200.

Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding delivered failure notifications, but neither its consumer nor the stream worker advanced the mailbox's durable delivery cursor. After both failures were repaired, completion returned green CI while retaining shutdown for those same unread events. The worker was live and the stale events were actual repaired CI failures.



### Occurrences

- Execution: `SEED-052#start-codex-refinement-from-dashboard` / plan 189, first related implementation commit `05f3e4a9fa018eba5be122b729f5b78f0e4cce70`
  - Timestamp: unknown (2026-10-01 execution completion)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-kA6yM3`, cell5. `complete-revision` for `cca873af2766128d3409db6c47c1a8beea39a7f6` returned exact success (run36793490950/attempt1) and shutdown retained/unread_actionable_failure for runs36750057215 and36790537801. Installed `readDeliveryProgress` returned deliveredThrough0; only sequences1/2 existed, matching those handled failures and published repairs a8c8d27/3fdae6f. `ci-notify-codex.md` consumer calls notify; `streamMailboxWorker` prints records; neither calls recordDeliveryProgress. Coordinator verified identity/event tuples and acknowledged exactly1/2 through the installed export.
  - Observed effect: Completion could not confirm shutdown despite green CI and previously accepted repairs; another records/recovery boundary was needed.
  - Inference: Durable delivery acknowledgment is missing in this adapter path. CI provider health and product behavior did not cause this retained shutdown.

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: unknown (2026-10-01 human-judgment stop and authorized resume)
  - Tool: Codex
  - Open Dough release: unknown; coordinator installed VERSION 0.3.51
  - Evidence: observer watch-kaShmz, cell19/session4531/PID3443, stopped receipt recordedThrough2/deliveredThrough0/unread2. Sequence2 was own run36813260082/attempt1 on slice4 8020eb2, already corrected by slice5 ca12038b; trace tied the timeout to raw HTTP awaiting a WebSocket upgrade. Root inspected both events and used installed recordDeliveryProgress to acknowledge exactly2 after the clean CI-repair save/restore returned resumed. [Execution account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/NATIVE.md#resumed-observer).
  - Observed effect: delivered historical failure still required durable acknowledgment after shutdown; no new repair was manufactured. The same binding was rearmed only after old PID exit.
  - Inference: this second execution reproduces the adapter cursor gap. Notification arrival timing alone does not establish a separate provider defect.

- Execution: `SEED-066#align-one-shot-callers-with-review-default` / plan 196, first related implementation commit `e4902583ce1e737a19f26ecd18bc437e3b68a751`
  - Timestamp: unknown (2026-10-01 execution)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-JOgwzs`, cell14/session82933/PID52346 delivered sequences1/2: run36839722302/attempt1 on bfec4af and run36841489154/attempt1 on 76969a1c. Repairs 76969a1c/6726e8c were accepted. Installed readDeliveryProgress still returned deliveredThrough0; readMailbox/readMailboxEvents confirmed exact checkout/repo/branch and only those two event tuples. Coordinator used installed recordDeliveryProgress after verifying both handled events; acknowledgment returned sequences1/2 and deliveredThrough2.
  - Observed effect: proactive recovery required an explicit durable acknowledgment before completion; no blocked completion or additional product repair is claimed in this occurrence.
  - Inference: the notification adapter's same cursor gap recurred; message delivery alone did not persist acknowledgment.

- Execution: `SEED-076#session-after-workspace-retirement` / plan 201, first related implementation commit `33eb0b69afbca8db3cc860f5d6ca2d9dd74aa17f`
  - Timestamp: unknown (2026-10-01 execution, three CI repair boundaries)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-qG1qAV`, cell42/session72248/PID16942 delivered sequences1–4: run36861023410/attempt1 on34fd7257, run36862248330/attempt1 on130e8a6d, run36865996491/attempt1 on84b26724 and run36866430369/attempt1 on9b982761. Repairs130e8a6d/bc98c4ac were accepted; the last two attempts had the same verified startup-fixture framing cause. The installed Codex binding extracts record.event and calls notify, without retaining sequence or advancing delivery progress. Root used installed readMailboxEvents/readDeliveryProgress to match the handled event tuples and recordDeliveryProgress to acknowledge exactly1, then2, then3/4; final deliveredThrough4, remaining[]. [Execution proof](https://github.com/terryyin/open-dough/blob/74b5f149edc174ba641e721b2b21d061d07ba891/.planning/slice-plans/201-session-after-workspace-retirement/PLAN.md) retains the diagnosed repairs.
  - Observed effect: each delivered, handled failure required explicit durable acknowledgment before completion. No blocked completion or additional product repair is claimed for this occurrence.
  - Inference: the same adapter cursor gap recurred. Process proposal remains ODF-201's existing unqueued acknowledgment-contract follow-up; this review does not change guidance.

- Execution: `SEED-077#ci-independent-of-package-mirror-stalls` / plan 207, first related implementation commit `e98441593f71e722b032ab08203c43b43a4c1d56` - Timestamp: unknown (2026-10-02 completion operation) - Tool: Codex - Open Dough release: unknown - Evidence: retained observer `/tmp/dough-ci-501/watch-Mcfmhh`, cell14/session97439/PID47835; exact-revision completion for `43226774216f8d4eb3de0ec516a898d86212749e` returned success (run36947886626/attempt1) but retained shutdown for unread sequence1, run36942598744/attempt1 on `e9844159`. That event's attention-journey synchronization failure was already repaired by `7ab0732b` with deterministic red/green proof and passing run36943286746. Installed readMailbox/readMailboxEvents/readDeliveryProgress confirmed exact checkout/repo/branch and only this handled tuple; coordinator used recordDeliveryProgress to acknowledge sequence1, deliveredThrough1. - Observed effect: one completion receipt retained shutdown and required explicit durable acknowledgment, then repetition of the completion operation. No new product repair was needed. - Inference: the installed yielded Codex adapter's documented binding notifies record.event without persisting the delivery cursor, reproducing ODF-201. Keep its existing unqueued contract proposal; this execution changes no guidance.

- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-x4nPTj`, cell19/session35356/PID69697 delivered sequence1, run36962208003/attempt1 on `9c0d6bb4`. After focused red/green repair and accepted `4a50e086`, installed readMailbox/readMailboxEvents verified checkout/repository/branch and that exact tuple; readDeliveryProgress still returned deliveredThrough0. Coordinator acknowledged only sequence1 through recordDeliveryProgress, then read back deliveredThrough1.
  - Observed effect: one explicit durable acknowledgment was necessary after notification handling; retained shutdown was avoided before completion. No unseen evidence was cleared.
  - Inference: the notification/cursor gap matches ODF-201. This occurrence does not claim a failed shutdown receipt; existing contract follow-up remains unqueued and guidance unchanged.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 CI repair and execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-HB2kLV`, cell105/session35081/PID79031 delivered sequence1, run36978829120/attempt1 on `e5fe8a7c`. A fresh agent reproduced the startup test's disposed-response race and repair `0e88f0162b06f151444dd3588345d08279df6c62` passed held red/green, both original tests and typecheck; managed delivery reused the observer. Installed readMailbox/readMailboxEvents verified exact checkout/repository/branch and event identity; readDeliveryProgress remained deliveredThrough0. Coordinator acknowledged exactly sequence1 through recordDeliveryProgress and read back deliveredThrough1, remaining[].
  - Observed effect: one explicit durable acknowledgment was necessary after handling the delivered failure. No failed shutdown receipt is claimed. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
  - Inference: matches ODF-201's notification/cursor gap. Keep the existing unqueued contract proposal; this review changes no guidance.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (CI repair after slice 2)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance)
  - Evidence: `/tmp/dough-ci-501/watch-7PZYuD` delivered sequences 1–3 for run 36997893525/attempt 1 on `29bd2aa`; the Codex stream binding notified event payloads without advancing durable delivery. Coordinator inspected the exact SHA/run/attempt/job tuples and used installed `recordDeliveryProgress` to acknowledge only those handled notifications; repair `a049909` was published. Completion later retained sequence 1 in `watch-cWrqJu`, run 37003387678/attempt 1 on `ce8b9df`, job 110825968667; the coordinator inspected the responsive keyboard failure and acknowledged exactly that delivered sequence while its passing repair underwent independent review.
  - Observed effect: explicit durable acknowledgment was needed beyond stream delivery. No unseen failure was discarded.
  - Inference: same adapter acknowledgment gap; keep the existing unqueued proposal. Internal delegated reasoning is unavailable, so no broader process-cost claim is made.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 execution)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at published start `db6b0da`; unchanged throughout this execution)
  - Evidence: `9c5b4fd8bb26e7f9bda1739199260d8c47928204:.planning/slice-plans/215-persistent-dashboard-project-configuration/PLAN.md`, Slice 4. Native observer `/tmp/dough-ci-501/watch-EQYhvD` notified sequences 1–2 for runs 36989187526/1 and 36993027579/1; installed readDeliveryProgress still returned deliveredThrough0. Coordinator inspected both exact identities and acknowledged only that handled prefix through recordDeliveryProgress; unseen events remained unread. Later inspected events 3–6 covered the same diagnosed failures on 9c5/dc8; after focused red/green repair and independent review, the installed export advanced only through sequence6. Wrap-up trunk observer lRHJqz later notified sequences1/2 for run37001581515/1 on 46b0431; readDeliveryProgress still returned0. After inspecting both failed-job identities and accepting focused repair/independent review, the installed export acknowledged only that handled prefix through2.
  - Observed effect: Delivered and handled failures still required separate durable acknowledgment before completion. No retained-shutdown failure is claimed for this occurrence.
  - Inference: The same notification/acknowledgment gap recurred; the installed export provided bounded recovery without changing guidance.

- Execution: `SEED-113#show-available-facts-promptly` / plan 260, first related implementation commit `cba2dedfe40de7bf9c7956e974b2021c279cd5fe`
  - Timestamp: unknown (2026-10-06 execution/CI handoff)
  - Tool: Codex
  - Open Dough release: 0.3.56 (installed guidance unchanged since accepted Take `ead6c3a6`)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-5B7G8A`, cell138/session91572/PID66922. Completion for `f62292cd5748681bd54514e0c3fed49ddfe29024` used successful basis `eaa279dc026764cdb96d5abe54d7d8533163af08`, but retained shutdown/unread_actionable_failure for sequences1/3, runs37418870176/1 and37421684885/1, jobs112123517311/112132216439. Installed readMailbox/readMailboxEvents verified exact checkout/repo/branch and deliveredThrough0; the documented binding notifies record.event without retaining its sequence or recording delivery progress. Fresh diagnosis, independent refactor and deterministic proof produced accepted repair `7da9f1533316187860cb318dcac81238a6a538b6`; the clean repair restore returned resumed. Coordinator acknowledged only handled sequence1 through installed recordDeliveryProgress; deliveredThrough1 leaves sequences2/3 unread. Sequence2, cancelled run37420000326/1 on9baca4db, has thirteen unexplained preceding failures without a retained shard trace; its disposition remains open. [Execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
  - Observed effect: one successful-CI receipt retained shutdown and required diagnosis, repair and explicit durable acknowledgment. The first receipt did not establish that historical failures were already repaired. No final execution/CI completion is claimed.
  - Inference: same adapter cursor gap as ODF-201. This does not establish notification-arrival timing, worker loss, or a common CI-provider cause; internal delegated reasoning remains unavailable. Existing delivered/unreleased follow-up and guidance are unchanged.

**Source:** [open-dough / ODF-201 — The Codex observer binding has no durable failure acknowledgment step](https://github.com/terryyin/open-dough/blob/c76322764499936acd42328b5ef4f66f4df6bcf8/DearDough.md#odf-201--the-codex-observer-binding-has-no-durable-failure-acknowledgment-step).

Former local code: DD-242.

The prescribed yielded-stream binding forwards events with `notify` but never updates the mailbox's delivery progress. Completion separately treats unacknowledged failure events as actionable, even after a coordinator has classified and repaired them.



### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (after completion's failed receipt for `70b6f62a`, before its CI repair)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-XLyt1z` had seven CI_FAILURE events for attempts `37427204231/1`, `37431359551/1`, `37432066761/1` and no `delivery.json`. The installed `ci-notify-codex.md` binding calls `notify` without `recordDeliveryProgress`; `ci-mailbox-complete.mjs` gates shutdown on `unreadActionableFailures`. After bounded log classification of all attempts, the coordinator used the installed exported store API to acknowledge exactly those seven events, preserving later events and the live repair observer.
  - Observed effect: one additional mailbox/source inspection and explicit acknowledgment outside the prescribed Codex binding. The first completion receipt itself correctly retained the observer for the failed revision.
  - Inference: Qualified. Source inspection shows that a later green completion would still retain this mailbox for unread failures without acknowledgment. That later refusal was prevented, not observed; absence of progress does not by itself establish that a notification was delivered to the model.

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

- **Last assessed:** 2026-10-12; all three current logs checked. No supported recurrence of this exact mechanism. Later terminal transport loss is retained under ODF-121; unknown execution releases do not establish a failed response. The original watch dates remain; seven days have not elapsed.
