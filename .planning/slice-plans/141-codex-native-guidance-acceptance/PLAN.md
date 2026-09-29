# Accept existing guidance natively on Codex

## Source and scope

- Story: [Accept existing guidance natively on Codex](../../seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex).
- **Identity:** SEED-044#native-premise-acceptance-codex-cursor
- The seed's Scope, Key examples, constraints, exclusions and completion criteria govern this Codex-specific acceptance and bounded recommendation; no general reliability claim.
- Preparation originally authorized refinement/planning only. Execution/publication is now authorized by the maintainer's execute-plan instruction and subsequent resume after the dependency landed.
- Preparation workspace: `/Users/terryyin/.codex/worktrees/codex-native-acceptance/open-dough`, branch `codex/codex-native-acceptance`, from `686487ea745dabfeff0cc88358ffc554f7d4346c`; integration `/Users/terryyin/git/open-dough`, target `origin/main`. Preparing agent Koharu-chan; allocation/publication `9cc7fe05ddb96f48faea101aa23acba533a33ff7`.
- Full preparation history is recoverable from `f52139814624ee3b72ff06257edeba4e9e4788cb`. The draft followed 139 and landed as 141 when origin allocated 140 to remote-history workflows.
- Original-run candidate guidance was pinned to `v0.3.45` (`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`); planning baseline is `2c5ff71^` (`6882aeb3b0ea969cba34d00c9f6a98d034905be4`). Use separate isolated source checkouts; never substitute latest/current bytes. Keep host/model conditions equivalent.
- Reuse applicable Codex proof first. Claude Code proof supplies representative expectations and fixture feasibility, not Codex acceptance. Bounded fixture/adapter/assessment repairs belong to their slice; identify harness separately from installed guidance. If the installation seam cannot preserve that distinction, stop to revise the approach before spending a run. Guidance defects need a separate correction decision.
- Seven independent Behavior cases plus one bounded Structure repair; partial case acceptance remains useful. No architecture change or new framework. No sizing target, effort hard limit or exceptions supplied; each slice owns one case, applicable comparison and focused diagnosis. Process deadlines do not bound total slice effort.

## Existing solutions and decisions

PFE responsibility: isolate, launch, supervise and judge these cases through existing owners.

- Reuse `tests/git-publication-native.sh --native codex --case ...`, its fixtures/prompts/observers/assessors, `tests/support/native-codex.sh`, `native-run-supervise.sh` and `native-run-stream.sh`.
- Planning fixtures reuse plan 115 at `874f9a8`; `rg -n 'premise|Doughnut|Pygardon' tests src/skills/dough-slice-planning` found no fitting maintained planning harness. Use the existing adapter/supervisor for these one-off sessions.
- Independently inspect installed-guidance use and transcripts. `git-publication-native-one-shot.sh`'s assessor does not require its recorded `one-shot-start-observed`; automated state success alone is insufficient.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): native interfaces, non-leading prompts, justified reuse, independent assessment, bounded runs and current-work artifact cleanup; no full tool/case matrix.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md): immutable guidance identity; release exceptions in CHANGELOG are not proof.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): disposable target is the session's project; separately authorized guidance repairs belong in `src/skills/`, never installed copies.
- `.planning/NORTH-STAR.md`, "One admission path for accepted work": one-shot growth converges on ordinary admission with the same owned edits; no second publisher/tracking domain.

## Decisive preparation observations

| Premise | Literal observation | Result |
| --- | --- | --- |
| Released premise checking/one-shot | `git show v0.3.45:src/skills/dough-slice-planning/SKILL.md`; CHANGELOG 0.3.43–0.3.45 | Shipped; native requirements pending. |
| Doughnut test/story | `git -C /Users/terryyin/git/doughnut cat-file -e 20efa7ec81^:scripts/test/quality_changed.test`; `git ... diff-tree --no-commit-id --name-only -r 20efa7ec81 -- .planning` | Test exists; SEED-043#story-1. |
| Pygardon caller chain | `git -C /Users/terryyin/git/pygardon grep -n -E 'seed.*strateg|strateg.*seed|seed_live|seed_strategy' b2ad7c394^ -- e2e_test`; old plan 196 | `live_strategies_steps.ts` launches `seed_named_genome_live_strategy_pair.py`; old proof wrongly chose `strategy_verify.feature`. |
| Control input/comparison | `git diff-tree --no-commit-id --name-only -r e7107e5 -- .planning`; `git show e7107e5:.planning/seeds/SEED-042-rename-slice-plan-folder-references.md` | Recoverable story and plan 111 burden comparison. |
| Publication harness | `rg -n 'publication/one-shot|admission-investigation' tests/support/git-publication-native-host.sh`; fixture/prompt/assessor reads | Three cases supported at preparation; escalation resolved below. |
| Substitute proof | `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/git-publication-native.sh` | Passed installed startup/delivery/CI/cleanup and counterexamples; harness proof only. |
| CLI/Bash | `command -v codex`; `codex --version`; `codex exec --help`; `codex --help`; `/opt/homebrew/bin/bash --version` | Codex `/Users/terryyin/.local/bin/codex` 0.157.0 supports adapter arguments; Bash 5.3.20 versus system 3.2.57. Put `/opt/homebrew/bin` first. |
| Planning setup | Protocol below with separate local clones, release install and installed recorder reset | All three preparation setups passed; disposable roots removed without native sessions. |

Before launch, repeat only invalidated observations; recheck historical repositories, CLI and pinned snapshots. First bounded live attempt owns authentication, isolation, skill-use and stream compatibility. A stopped setup/runtime attempt blocks dependent launches without implying behavior failure.

## Proof and run protocol

Native sessions are authorized manual opt-ins, once per case per guidance version; none enters `npm test`, CI or default wrappers. Diagnose fixture/adapter failures before at most one corrective retry; second failure stops for human judgment. Do not rerun a behavioral failure to seek a pass. Keep compared guidance fixed.

Each accepted/reused result stays in this plan with requirement, literal command/prompt, guidance/harness revisions, CLI/model (unknown if unavailable), fixture, observation, verdict and limitations. Baseline success establishes compatibility with weak improvement attribution; a single success is no reliability estimate.

Prepare baseline and candidate independently:

| Case | Local repository | Pre-plan checkout | Restore seed from | Story link |
| --- | --- | --- | --- | --- |
| Doughnut | `/Users/terryyin/git/doughnut` | `20efa7ec81^` | `20efa7ec81` | `seeds/SEED-043-commit-gate-checks-committed-changes.md#story-1` |
| Pygardon | `/Users/terryyin/git/pygardon` | `b2ad7c394^` | `b2ad7c394` | `seeds/SEED-047-tfdc-search-and-verify-simplification.md#story-tfdc-dead-behavior-removal` |
| Control | Open Dough repository | `e7107e5^` | `e7107e5` | `seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references` |

Use `git clone --shared --no-checkout`, `git checkout --detach <pre-plan-parent>`, `git remote remove origin`, and `git show` to restore only the refined seed (Pygardon backlog entry from `b2ad7c394` when needed). Install with `bash <source>/install.sh --target <fixture> --source <source> --platform codex --force`; installed `product-backlog.mjs record-state --refinement refined --approach unselected` clears old plan/readiness. Supply the clone as owned preparation checkout, with no commit/push/publication authority.

Exact planning prompt template; substitute only story and fixture:

> Use this project's installed Open Dough guidance to make a slice plan for
> `<story link>`. This disposable checkout at `<fixture>` is the supplied owned
> preparation workspace. Use the project's story and decisions. This request
> is planning only: do not implement, commit, push or publish. Write the plan,
> record its preparation assessment and report the result.

The prompt supplies no faulty premise, desired test or verdict. Retain JSON events and resulting plan/state for actual installed-skill-read and decisive-observation review. Use modern Bash and existing adapter/supervisor:

```bash
source "$harness/tests/support/native-run-supervise.sh"
source "$harness/tests/support/native-codex.sh"
native_case_deadline=900
native_case_grace=15
native_codex_prepare "$results" "$harness"
native_codex_build_command "$fixture" "$results/response.md" "$prompt" "$results/events.jsonl"
native_run_owned_or_fail "$results/events.jsonl" "$results/stderr.log" '' "${native_codex_command[@]}"
native_run_classify_stream codex "$results/events.jsonl"
```

Each attempt gets a new disposable result directory outside maintained source. Baseline/candidate use equivalent recorded resolved settings; no model switch to seek a pass. Publication wrapper has the same 900-second deadline/15-second grace.

Pass requires complete session, installed-guidance use and observable outcome. Confirmed behavior failure stays failed; runtime unavailable, invalid setup, missing skill-use evidence or incomplete stream is inconclusive. Stop before paid launch if inexpensive setup fails. Do not treat unrelated replay-plan defects as acceptance failures or silently repair the target product.

Delete raw artifacts after judgment; retain compact proof/outstanding requirements here until ordinary wrap-up. Failed output survives only while diagnosis needs it. Changed input invalidates only applicable proof.

## Ordered slices

### 1. Codex finds the existing commit-gate test before planning

Type: Behavior
Status: done
Proof: Doughnut baseline/candidate written plans, state and complete native traces, or justified equivalent Codex reuse.
Behavior: pre-plan refined Doughnut story → installed-guidance planning → candidate names `scripts/test/quality_changed.test`, records its relevant inspection and selects it as proof rather than asserting no gate test. This first paid probe owns runtime/isolation/skill-use/stream compatibility. Setup/runtime failure blocks later paid sessions pending diagnosis; behavior failure stops this requirement for correction judgment. Baseline success limits attribution. Accepted result below.

### 2. Sound premises reach readiness without unnecessary planning work

Type: Behavior
Status: done
Proof: control baseline/candidate plans/state against historical plan 111; independently judge observation breadth and added gates.
Behavior: historical folder-reference story with sound premises → installed-guidance planning → brief relevant decisive observations and `ready`, without unjustified probe, approval or additional full-suite run. Equivalent proof/slice boundaries are allowed; plan 111 compares burden. Run early to expose over-observation cost.

### 3. Codex chooses proof that actually executes the moved seeding

Type: Behavior
Status: done
Proof: Pygardon baseline/candidate plans and observed caller chain; `live_strategies.feature` or equivalent traced proof owns moved seeding.
Behavior: named-genome/live-strategy removal story → planning observes executable chain → selected proof runs `seed_named_genome_live_strategy_pair.py`, not `strategy_verify.feature` alone. Baseline success limits attribution. Full target E2E suite need not run for this planning-only acceptance.

### 4. An accepted investigation becomes visible before substantive action

Type: Behavior
Status: done
Proof: `bash tests/git-publication-native.sh --native codex --case publication/admission-investigation --results-dir <results>` from evaluated source; independent admission ordering and skill-use review.
Behavior: unlisted accepted investigation without one-shot selection → installed entry guidance → origin accepts Taken before substantive probe; human edits survive. Assess push receipt against investigation marker and native trace; receipt alone is insufficient. This is ordinary tracking control.

### 5. Explicit unlisted one-shot work publishes only its verified result

Type: Behavior
Status: done
Proof: slice 4 wrapper with `--case publication/one-shot-result`; native trace, requested content, accepted history and cleanup.
Behavior: explicitly selected trivial unlisted edit → installed one-shot startup, focused verification/delivery → one result commit on origin, no planning records/Taken published, preserved human edits, retired owned workspace/branch. Verify requested line, not just result-changed assessor field; recorded one-shot-start and transcript must establish use.

### 6. A queued one-shot result closes its story while preserving siblings

Type: Behavior
Status: done
Proof: same wrapper with `--case publication/one-shot-queued`; push history, requested content, closure/sibling observations and native trace.
Behavior: queued trivial story B with one-slice plan and unfinished sibling → explicit one-shot completion → one accepted commit with requested result/closure, no accepted Taken push, spent story section/plan removed, sibling identity/position preserved, human edits preserved, owned workspace retired. Reuse fixture/assessor; no broader ownership-race journey.

### R. Establish a genuine escalation fixture before its paid run

Type: Structure
Status: blocked — growth premise disproved
Proof required before a paid run: generated unchanged product passes its applicable command; owned rename edits reveal an obligation requiring a genuinely separate outcome; existing deterministic carry/admission counterexamples remain valid. The stopped proposal proves a compatibility failure, but its passing small alias repair does not establish the required growth.
Original repair approach: remove the upfront migration solution from ordinary source inspection while retaining opaque released data and the compatibility failure. This approach is stopped by the feasibility evidence below. Inspect all fixture consumers. Do not lead the native prompt, change evaluated guidance, supply carried edits, or weaken after-edit acceptance. If a truthful fixture cannot support this boundary, stop this requirement before a paid run and report the limitation.

### 7. A grown one-shot attempt enters ordinary tracking with its edits intact

Type: Behavior
Status: blocked — depends on a genuine growth fixture
Proof: `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native codex --case publication/one-shot-escalation --results-dir <results>` using the repaired maintained harness from slice R, pinned separately from `v0.3.46` guidance. Independently inspect native trace, accepted claim, carried edits and assessor.
Behavior: eligible one-shot starts, owned edits expose growth → before further edits ordinary admission with carry → origin records claim, edits remain uncommitted in same workspace, continuation stays within original authority. Fixture withholds planning, so stop after admission is valid. Up-front admission is safe but inconclusive; untracked grown result or unnecessary approval stop fails.
Historical precondition assessment — 2026-09-28: `git ls-tree -r --name-only f7a7637c tests/support`, runner `--help` and `native_case_known` show the escalation dispatch through `git-publication-native-one-shot-escalation.sh`. `d05d9937` accepted its non-leading Claude fixture; `133b4f9d` assimilated SEED-028 proof against `23563ee0`: carry after edits, uncommitted restoration, no trunk result, stop before planning. This removed the missing-dispatch concern and supplied a Claude transition observation, not Codex acceptance. Slice R's later counterexample reopens the fixture's genuine-growth premise; it does not erase that historical observation.
The released-settings check exposes a compatibility failure, while migration documentation/test source prescribes a separate outcome before edits. Neither establishes necessary growth, as the stopped probe below shows. Counterexamples cover untracked results, missing admission, missing/committed edits, admission before editing and changed human edits. Use disposable harness copy redirecting only existing fixture-install source to release checkout; keep harness/guidance distinct and never edit evaluated guidance for acceptance.

## Resume preparation — 2026-09-29

- Terry explicitly authorized execution, including the bounded fixture repair. Startup initially refused the published not-ready assessment before taking the story; no product work began. This refinement resolves the release choice and bounds the remaining fixture premise by first slice R, rather than claiming the paid case already passes.
- New guidance pin: `v0.3.46`, `dc544c604bc5ffdb49889e98c178a6539e5dcd3d`; ancestry contains correction `8cafa49d` and escalation harness `f7a7637c`. `git diff v0.3.45 v0.3.46 -- src/skills/dough-slice-planning/SKILL.md` shows the explicit local-proof/hosted-CI distinction. Rerun only slice 2 on this changed guidance; retain its original baseline and failure.
- Applicability review: planning cases 1 and 3 keep their original revision-specific passes. The added local-gate rule does not change their required test discovery or traced proof selection. Publication cases 4–6 keep original v0.3.45 evidence for the observed journeys; v0.3.46 changes remote-source startup and default-checkout maintenance, so those older sessions do not accept the changed startup implementation on the new release. No claim of whole-release acceptance or unchanged internals is made. The story's remaining requirements are covered by requirement-specific evaluated revisions, not a single-version reliability claim.
- Adapter/supervisor/stream source is unchanged between release pins. Codex `0.157.0`, Bash `5.3.20`, actual model unknown; retain default adapter settings and 900/15 bounds. New fixture/harness input invalidates slice 7's old inconclusive result only as a current input; retain that observation as history.
- First slice R has one deterministic proof loop and a stop before paid spending; slice 2 remains one planning observation; slice 7 remains one native carry observation after repair. Cumulative design is supported, eight slices, no supplied size exceptions or resplit recommendation. Goal, scope and key examples are unchanged.
- Owned workspace `/Users/terryyin/.codex/worktrees/plan-141-resume/open-dough`, branch `codex/plan-141-resume`, initial checkout `29f9bc6ccf18167b44af2745c34c54650b08872c`; integration `/Users/terryyin/git/open-dough`, origin/main, intended execution publisher `codex-plan-141-20260929`. Preparation assignment Nana-chan `1200f33d30e3013b22e143e1ad934490636bc502`. Readiness describes the bounded repaired plan, not an already accepted native transition.

## Historical proof

[Original execution, accepted slices 1 and 3–6, slice 2 failure and slice 7 inconclusive observation](HISTORY.md) are preserved without changing their revisions or verdicts. Git also retains the original plan through landed `b065a8b9`.

<a id="slice-2-observation-and-execution-stop-2026-09-28"></a>
The original [slice 2 failure](HISTORY.md#slice-2-observation-and-execution-stop-2026-09-28) remains historical evidence; the [changed-guidance rerun](#accepted-proof--slice-2-rerun-2026-09-29) is accepted below.

## Resumed execution context

Story Branch Mode; Honoka-chan, publisher `codex-plan-141-20260929`. Take `7387165f5a5119f0e8e6c19de65a348ca5106baf` accepted on origin/main; increments target origin/refs/heads/codex/plan-141-resume. Owned path/branch above, reused from this session’s preparation; starting revision `1b3fc6dd2cd1a4194f3450144aaf6ded72c48541`. Exact-checkout locked `PATH="/opt/homebrew/bin:$PATH" npm ci` passed with unchanged dependency metadata; the native runner help command passed after Take. No commit hook; coordinator uses selective `npm run format`. Trunk claim CI remains unobserved.

CI observer: GitHub Actions `ci.yml`, display name `CI`, verified by `gh run list`; target `terryyin/open-dough:codex/plan-141-resume`. Exact owned-checkout runtime `.agents/skills/dough-execute-plan`; coordinator `codex-plan-141-20260929`, cell `38`, session `98048`, directory `/tmp/dough-ci-501/watch-sxEzBB`, PID `13734`. Managed deliveries reuse this identity.

## Fixture feasibility probe — slice R (2026-09-29)

Verdict: the proposed visibility repair is insufficient; no paid escalation run. The generated released-settings check exposes data loss after a literal rename, but a two-line fallback/output alias preserves that saved value and passes with settingsVersion still 1. This does not establish a necessary second outcome outside one-shot eligibility. The old diagnostic prescribed a separate migration, but the surviving executable compatibility behavior does not establish that necessity; removing the prescription alone cannot repair the case's premise. Do not penalize a legitimate small compatibility repair as failed tracking.

The stopped path remains inside this story: establish a truthful, nonleading initially eligible task whose owned edits reveal a genuine separate outcome, then rerun slice 7. Preserve its original safe-early-admission observation. No guidance defect or new paid result is claimed. The proposed harness edits are withheld; existing release/harness bytes remain unchanged. Terry's continuing execution authority permits independent slice 2 now; the remaining plan is reordered accordingly, with no change to the after-edit carry promise.

Inspected setup/observations: maintained `writeEscalationProduct`, generated `test/released-settings.test.mjs` decompressing saved release 1.0 and comparing each loaded value, `scripts/command.js` executing it, and the literal renamed/legacy-alias settings variants. Disposable integration `/private/tmp/plan141-slice-r.1aYeKm/workspace-claim-E5ZnPK/integration`; each variant ran `node scripts/command.js` to terminal 0/1/0 respectively. Proposed source/consumer changes passed `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/git-publication-native.sh tests/git-publication-native-one-shot.sh` to exit 0; this is harness counterexample proof, not native acceptance. Current maintained fixture restored to original blob `d28b6c1074bfedae81f1f5b85da14f2f55463b87`; proposal and exact observations retained outside source for review and then removed after compact evidence publication. No framework, assessor weakening, prompt change, guidance repair or paid retry.

## Accepted proof — slice 2 rerun (2026-09-29)

Verdict: pass for the single corrected-release planning control; original failed v0.3.45 session and mixed baseline remain historical evidence. The new plan records six relevant decisive premise rows and one Behavior slice, reaches ready, and adds no probe/approval or unconditional hosted-CI gate. No reliability or causal-improvement claim.

- Guidance `v0.3.46`/`dc544c604bc5ffdb49889e98c178a6539e5dcd3d`; separate harness `ae6675769c6988061aca839e139667f0848667db`; fixture `f2b974afb5367b7f8cbe3a2b5ebd246ec166bf02`, SEED-042 restored from `e7107e5000f2df7b2f0cde33ad5919522a90571b`. Independent shared clones, detached pins, origins removed, release installation and installed refined/unselected reset supply only preconditions. Literal setup `/opt/homebrew/bin/bash /private/tmp/plan141-slice2-resume.KrINrk/setup.sh > /private/tmp/plan141-slice2-resume.KrINrk/setup.log 2>&1` passed.
- Literal one launch `/opt/homebrew/bin/bash /private/tmp/plan141-slice2-resume.KrINrk/run.sh`; exact nonleading protocol prompt above, substituting only control story and fixture `/private/tmp/plan141-slice2-resume.KrINrk/candidate-open-dough`. Existing adapter/supervisor/classifier, 900/15 bounds, Codex 0.157.0/Bash 5.3.20, unchanged ephemeral/ignore-user-config defaults and isolated state/logs; actual model unknown. Session 32840 exited 0, native turn.completed and independently classified complete, 00:40:18Z–00:44:45Z. No paid retry.
- Inspected actual installed planning read item_1, preparation references item_4, story/proof reads item_5, plan write item_21, interpreted single planned Behavior slice plus missingLinkedFiles=[] item_25, and ready recording item_26. Item_23 heredoc creation was denied although its trailing command returned 0; corrected item_25 is the accepted successful observation.
- Written `.planning/slice-plans/111-rename-slice-plan-folder-references/PLAN.md` lines 61–69 map the premises; 111–126 select real CLI operations, installed payload fixture consumers and full dashboard journeys. The dashboard group is explicitly justified by affected fixtures across readiness/navigation/refresh/progress/branch/authenticated-read/accessibility, independently matched to the historical footprint. Lines 129–133 reject blanket local CI gates; prior unconditional npm test/lint/typecheck/separate build gates are absent. Prospective checks were not run as implementation proof. Historical plan 111 supports focused owners without requiring identical plan boundaries.
- Coordinator inspected written plan, source/adapter pins, actual trace output and matching ready bases: document `963aa5061b43594238046f3770e3b780d6218c60b07cc7f8786c5c4e0b09decc`, plan `f0e17a2221b2a601392af9027527d113896eaf27e1cc321c657efe5de7d6b63e`. All 180 declared Codex payload files match pinned release bytes; source/harness clean, fixture HEAD unchanged/no origin. Before/after comparison contains only selected preparation-block update and new plan, no product implementation/publication. Raw artifacts remain for acceptance/refactoring and are deleted after compact proof publication under ADR 0005.
