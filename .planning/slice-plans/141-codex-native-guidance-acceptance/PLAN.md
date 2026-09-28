# Accept existing guidance natively on Codex

## Source and scope

- Story: [Accept existing guidance natively on Codex](../../seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex).
- **Identity:** SEED-044#native-premise-acceptance-codex-cursor
- The seed's Scope, Key examples, constraints, exclusions and completion criteria govern this Codex-specific acceptance and bounded recommendation; no general reliability claim.
- Preparation originally authorized refinement/planning only. Execution/publication is now authorized by the maintainer's execute-plan instruction and subsequent resume after the dependency landed.
- Preparation workspace: `/Users/terryyin/.codex/worktrees/codex-native-acceptance/open-dough`, branch `codex/codex-native-acceptance`, from `686487ea745dabfeff0cc88358ffc554f7d4346c`; integration `/Users/terryyin/git/open-dough`, target `origin/main`. Preparing agent Koharu-chan; allocation/publication `9cc7fe05ddb96f48faea101aa23acba533a33ff7`.
- Full preparation history is recoverable from `f52139814624ee3b72ff06257edeba4e9e4788cb`. The draft followed 139 and landed as 141 when origin allocated 140 to remote-history workflows.
- Candidate guidance is pinned to `v0.3.45` (`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`); planning baseline is `2c5ff71^` (`6882aeb3b0ea969cba34d00c9f6a98d034905be4`). Use separate isolated source checkouts; never substitute latest/current bytes. Keep host/model conditions equivalent.
- Reuse applicable Codex proof first. Claude Code proof supplies representative expectations and fixture feasibility, not Codex acceptance. Bounded fixture/adapter/assessment repairs belong to their slice; identify harness separately from installed guidance. If the installation seam cannot preserve that distinction, stop to revise the approach before spending a run. Guidance defects need a separate correction decision.
- Seven independent Behavior slices; first six can establish partial acceptance. No Structure slice, architecture change or new framework. No sizing target, effort hard limit or exceptions supplied; each slice owns one case, applicable comparison and focused diagnosis. Process deadlines do not bound total slice effort.

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
Status: planned
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

### 7. A grown one-shot attempt enters ordinary tracking with its edits intact

Type: Behavior
Status: planned
Proof: `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native codex --case publication/one-shot-escalation --results-dir <results>` using inherited harness `f7a7637c` and pinned `v0.3.45` guidance. Independently inspect native trace, accepted claim, carried edits and assessor.
Behavior: eligible one-shot starts, owned edits expose growth → before further edits ordinary admission with carry → origin records claim, edits remain uncommitted in same workspace, continuation stays within original authority. Fixture withholds planning, so stop after admission is valid. Up-front admission is safe but inconclusive; untracked grown result or unnecessary approval stop fails.
Precondition resolved 2026-09-28: `git ls-tree -r --name-only f7a7637c tests/support`, runner `--help` and `native_case_known` show the escalation dispatch through `git-publication-native-one-shot-escalation.sh`. `d05d9937` accepted its non-leading Claude fixture; `133b4f9d` assimilated SEED-028 proof against `23563ee0`: carry after edits, uncommitted restoration, no trunk result, stop before planning. This proves fixture feasibility, not Codex acceptance, and removes missing-fixture concern without changing scope/bounds/PFE/revisions.
Fixture exposes growth through the released-settings check; migration documentation/test source also reveals it before edits, as observed below. Counterexamples cover untracked results, missing admission, missing/committed edits, admission before editing and changed human edits. Use disposable harness copy redirecting only existing fixture-install source to release checkout; keep harness/guidance distinct and never edit evaluated guidance for acceptance.

## Execution context

- Story Branch Mode; integration `/Users/terryyin/git/open-dough`. Managed owned workspace `/Users/terryyin/.codex/worktrees/plan-141-execution/open-dough`, branch `codex/plan-141-execution`, starting revision `f52139814624ee3b72ff06257edeba4e9e4788cb`.
- Publisher `codex-plan-141-20260928`; agent Sola-chan. Claim accepted on `origin/refs/heads/main`: `b5a6017a966d088c7fbb700ce17833ae8e3b5eda`. Increments target `origin/refs/heads/codex/plan-141-execution`.
- Exact-checkout setup passed: locked `PATH="/opt/homebrew/bin:$PATH" npm ci` and `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --help`. No commit hook; Markdown needs no formatter, whitespace checked before staging.
- No applicable earlier Codex acceptance proof found in retained records/Git; Claude evidence is fixture reference only. Keep established in-scope plan-refinement authority; no hard limit/exceptions. All runs retain 900/15-second bounds.
- Host thread limit rejected further fresh-agent creation after slice 3. Continue through separate bounded turns of existing agents, with an independent reviewer distinct from the current implementation agent; disclose this delegation limitation without weakening native proof.
- Default checkout refresh deferred for pending dashboard edits. Preparation update accepted as starting revision above; claim's trunk CI unobserved.
- CI observer: GitHub Actions, selector `ci.yml` verified by `gh run list`, target `codex/plan-141-execution` in `terryyin/open-dough`; exact-checkout runtime `.agents/skills/dough-execute-plan`. Original cell `28`/session `55077`, directory `/tmp/dough-ci-501/watch-2OeRvN`, PID `2304` stopped with unobserved coverage for `8373b163`/`b765473f`, shutdown confirmed. Resumed observer cell `72`, session `17764`, directory `/tmp/dough-ci-501/watch-M7dAHE`, PID `23794`, coordinator `codex-plan-141-20260928`; managed deliveries reuse it. Unobserved trunk claim CI is not registered on this branch observer.
- CI `36394508899` attempt 1, registered `6b6074ae`: dashboard job `108837614825` failed `project-keyboard-navigation-focus.spec.ts:100` (expected one Doughnut `main` read; got two). Assertion failure, not infrastructure or a native acceptance verdict. Read-only comparison and chat `Add terry-talks to dashboard` (`01a0e6c5-b7ad-7ce3-905a-fe712559ff2f`) establish another execution's ownership of the dashboard changes imported from `d5d9d1a9`; this execution's authored increments change planning records only. No duplicate repair, stash, CI rerun or claim of green; leave dashboard diagnosis with that owner and continue independent acceptance under the CI non-owner rule.

## Accepted proof — slice 1 (2026-09-28)

Verdict: pass for candidate and baseline; present-behavior acceptance only. Both sessions read the installed planning skill and existing `scripts/test/quality_changed.test`, accurately described routing-stub limits, and selected that test as executable regression proof. Both wrote a plan and recorded planned/ready state with matching reviewed digests. Baseline success limits improvement attribution; neither run proves implementation correctness or statistical reliability.

- Guidance: candidate `f3f75d0b9f4dccd2d887c43b71d8234f6499c65e` (`v0.3.45`); baseline `6882aeb3b0ea969cba34d00c9f6a98d034905be4` (`0.3.42`). Installed planning SKILL.md matched each source byte-for-byte.
- Harness: `b5a6017a966d088c7fbb700ce17833ae8e3b5eda`, existing `tests/support/native-codex.sh`, `native-run-supervise.sh` and `native-run-stream.sh`. CLI `0.157.0`; actual model unknown. Identical defaults and `--ignore-user-config`; no model switch or retry.
- Setup command: `/opt/homebrew/bin/bash /tmp/plan141-slice1-setup.sh`. Disposable shared clones of Doughnut at `0d92ca6c226fc0d755a9b159e2cb3259a68f009f` (`20efa7ec81^`); selected refined seed restored from `20efa7ec81`, origin removed, separate pinned source clones, release installation and installed recorder reset to refined/unselected. Setup supplies preconditions, not the accepted behavior.
- Literal native launches: `/opt/homebrew/bin/bash /private/tmp/plan141-slice1.KTBlZf/run.sh candidate` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice1.KTBlZf/run.sh baseline`. This temporary script applied the protocol above via the existing adapter: `codex exec --ephemeral --ignore-user-config -c sqlite_home=<isolated-state> -c log_dir=<isolated-state> --skip-git-repo-check --sandbox danger-full-access --json -C <fixture> -o <response> <prompt>`, wrapped by the adapter's protected sandbox-exec profile and supervisor deadline/grace 900/15 seconds.
- Exact candidate prompt: "Use this project's installed Open Dough guidance to make a slice plan for seeds/SEED-043-commit-gate-checks-committed-changes.md#story-1. This disposable checkout at /private/tmp/plan141-slice1.KTBlZf/candidate-doughnut is the supplied owned preparation workspace. Use the project's story and decisions. This request is planning only: do not implement, commit, push or publish. Write the plan, record its preparation assessment and report the result." Baseline substituted only the fixture path's `candidate-doughnut` with `baseline-doughnut`.
- Inspected boundary: installed guidance → actual test inspection → written proof selection → preparation recording. Candidate completed command item_0 reads installed skills; item_9 reads the test (exit 0). Its `.planning/quick/043-commit-gate-checks-committed-content/PLAN.md` line 76 records the literal inspection, line 125 selects the test at the public `scripts/lint_changed.sh` boundary. Baseline item_1 reads the planning skill; item_12 reads the test (exit 0). Its same relative plan lines 33–37 identify reusable test foundations and lines 120–121 select the focused commands.
- Each native process exited 0 with terminal `turn.completed` and classified stream `complete`. The coordinator independently inspected those plans, command items, outcome files, preparation state and candidate source identity. Expected protected config/plugin-write warnings continued in memory; authentication and isolation permitted the complete sessions. Candidate's separate dependency-isolation probe does not change this test-selection acceptance claim. No target product implementation was performed.
- Raw plans, state, command argv, exact prompts and JSON traces at `/private/tmp/plan141-slice1.KTBlZf` were judged for this active decision and are deleted after this slice's proof record is published under ADR 0005.

Slice 1 delivered: `8373b163be94f2b6244c7c0c0e1e8e501877afa6` accepted on the recorded execution-branch target; observer reused and exact revision registered. Raw slice-1 artifacts were deleted after judgment/publication. This supplied slice 2's previously published base.


## Slice 2 observation and execution stop (2026-09-28)

Verdict: candidate failed the proportionate control; baseline is mixed/limited,
not a clean historical-plan-111 burden match. Slice 2 remains planned and
unaccepted. Terry subsequently authorized continuing independent slices 3–7 and
queuing the [local-verification correction](../../seeds/SEED-053-native-guidance-acceptance.md#proportionate-local-verification)
first with known evidence for later decisions; accepted on `origin/main` at
`e78a7618fb29d223eaa014aefb9dae5243fb3d1b`. No guidance fix or unchanged retry.
The story remains Taken and whole-plan acceptance remains incomplete.

- Guidance is unchanged: candidate `v0.3.45`/`f3f75d0b`, baseline `6882aeb3`; harness `8373b163be94f2b6244c7c0c0e1e8e501877afa6`, CLI `0.157.0`, same default/ignore-user-config settings, actual model unknown. Relevant installed skill bytes matched each pinned source.
- Setup command: `/opt/homebrew/bin/bash /tmp/plan141-slice2-setup.sh`; two independent shared Open Dough clones at `f2b974afb5367b7f8cbe3a2b5ebd246ec166bf02` (`e7107e5^`), selected refined SEED-042 restored from `e7107e5`, origin removed, separate pinned guidance installation and installed recorder reset to refined/unselected. Both setup journeys passed before launch; no product implementation.
- Literal launches: `/opt/homebrew/bin/bash /private/tmp/plan141-slice2.7YSVP3/run.sh candidate` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice2.7YSVP3/run.sh baseline`, using the same adapter/supervisor protocol with deadline/grace 900/15 seconds. Exact planning prompt is the template above with story `seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references` and fixture `/private/tmp/plan141-slice2.7YSVP3/candidate-open-dough` or `/private/tmp/plan141-slice2.7YSVP3/baseline-open-dough`, respectively.
- Both native processes exited 0, ended with `turn.completed` and classified `complete`. Each item_1 actually reads the installed planning skill; each wrote one Behavior plan and recorded planned/ready with matching digests. Candidate ran one focused plan-reader check (10 tests); neither native session ran a full suite, made product edits or published.
- The observed failure is in the resulting prospective plan, not runtime: candidate `.planning/slice-plans/111-rename-slice-plan-folder-references/PLAN.md` lines 119–125 unconditionally require `npm test`, `npm run lint`, `npm run typecheck:dashboard`, `npm run build:dashboard` and the full `npm run test:dashboard` as existing delivery checks, beyond its focused proof. Its seven premise observations are relevant but heavier than brief.
- Historical plan 111's proof table and final verification paragraph prescribe focused reader/navigation checks plus existing repository requirements. Historical AGENTS representative behavior review, README and contributor test instructions supply no every-change full-suite mandate; hosted `ci.yml` lists those five checks. Candidate installed wrap-up line 86 says not to run full CI before commit unless explicitly required. Hosted checks do not alone establish that local mandate. These source observations leave the added unconditional burden unjustified.
- Baseline plan lines 116–124 also adds full `npm test` for distributed fixture consumers, but conditions full dashboard testing on affected reach and omits candidate's build/typecheck additions. This provides limited comparison, not acceptance of the candidate or a causal improvement claim.
- Coordinator independently inspected final plans, skill-read command items, terminal outcomes, matching preparation states and requirement sources. Raw root `/private/tmp/plan141-slice2.7YSVP3` was deleted after publication of `b765473fda8c544c135458dbbb9ed75990b5f64c`. Native acceptance and this plan remain incomplete; do not retry the same candidate to obtain a pass.

## Accepted proof — slice 3 (2026-09-28)

Verdict: candidate pass for deliberate executable proof selection; baseline final proof is compatible but its mapped seeding proof is limited. No causal improvement or reliability claim.

- Guidance remains candidate `v0.3.45`/`f3f75d0b`, baseline `6882aeb3`; harness `b765473fda8c544c135458dbbb9ed75990b5f64c` (adapter/supervisor/stream bytes unchanged after trunk merge), Codex `0.157.0`, equivalent default/ignore-user-config settings, actual model unknown, deadline/grace 900/15. Each installed planning skill matched its pinned source.
- Setup: `/opt/homebrew/bin/bash /tmp/plan141-slice3-setup.sh`; independent shared Pygardon clones at `546df0d94e84d7107d5e0f8a611fd0e9f5da6d76` (`b2ad7c394^`), selected refined seed/backlog restored from `b2ad7c394`, origin removed, separate pinned installs and refined/unselected recorder reset; passed before paid launch.
- Literal launches: `/opt/homebrew/bin/bash /private/tmp/plan141-slice3.B0i1N9/run.sh candidate` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice3.B0i1N9/run.sh baseline`. Exact prompt uses the protocol template with story `seeds/SEED-047-tfdc-search-and-verify-simplification.md#story-tfdc-dead-behavior-removal` and fixture `/private/tmp/plan141-slice3.B0i1N9/candidate-pygardon` or `/private/tmp/plan141-slice3.B0i1N9/baseline-pygardon`; no desired proof supplied. No retry or implementation/E2E suite run.
- Candidate actual planning-skill read item_1 and E2E consumer inspection item_9 exited 0. Its `.planning/quick/179-tfdc-dead-behavior-removal/PLAN.md:171–175` explicitly updates `e2e_test/support/seed_named_genome_live_strategy_pair.py` and selects `nix develop -c scripts/check-worktree.sh pnpm exec cucumber-js e2e_test/features/live_strategies.feature` for moved test-genome proof. Independent chain inspection: feature scenario at lines 94–97 invokes the Given in `live_strategies_steps.ts:19–33`, which runs that helper. Native did not explicitly read every TS caller hop; claim stays at correct proof selection and observed E2E consumer.
- Baseline actual skill read item_1 exited 0; its same-relative plan's seeding slice 7 at lines 236–244 maps only Python proof and omits that helper. Final verification at line 347 nevertheless includes `live_strategies.feature`, so it will execute the helper eventually; no clean deliberate caller-trace acceptance for baseline and no established regression/improvement attribution.
- Both original supervised native commands exited 0 with `turn.completed`; independently classified `complete` through existing `native_run_classify_stream` without a pipe (the run script's tee output was empty because classification is a shell variable, not stdout). Both final planned/ready states matched current document/plan digests; coordinator independently inspected plans, items, state and executable chain. Raw root `/private/tmp/plan141-slice3.B0i1N9` was deleted after publication of `1bab40d409c1bb09fb640f207a074de8d9adea22` under ADR 0005.

## Accepted proof — slice 4 (2026-09-28)

Verdict: pass for investigation admission ordering and human-edit preservation; the fixture's startup-cause diagnosis is not accepted by this case.

- Guidance and harness `v0.3.45`/`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`; Codex `0.157.0`, unchanged adapter/defaults/ignore-user-config, actual model unknown, deadline/grace 900/15. Installed execution SKILL and admission reference matched pinned source; no harness repair or paid retry.
- Setup passed: `/opt/homebrew/bin/bash /tmp/plan141-slice4-prepare.sh` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice4.HLSmkP/preflight.sh`, separately constructing/installing a fixture before native launch. Existing substitute runner/assessor proof remains applicable.
- Literal launch: `PATH="/opt/homebrew/bin:$PATH" TMPDIR=/private/tmp/plan141-slice4.HLSmkP/runtime GIT_PUBLICATION_KEEP=1 native_case_deadline=900 native_case_grace=15 /opt/homebrew/bin/bash /private/tmp/plan141-slice4.HLSmkP/evaluated-source/tests/git-publication-native.sh --native codex --case publication/admission-investigation --results-dir /private/tmp/plan141-slice4.HLSmkP/results`.
- Exact prompt is existing `git_publication_admission_prompt`'s investigation-only request: installed guidance, accepted unlisted slow-startup investigation via `node scripts/probe.js`, authorized owned checkout/branch, Trunk Mode/local fixture origin and publisher, preserve human edits, no product fix. Prompt hash `f822c2d9a66e0b620947ba3fdcd65951d1746e293f85e05ae5c817caa15a1618`; no admission command or expected verdict supplied. Actual fixture `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.PxWj42jovt/admission-investigation.ZdRCFR/workspace-claim-Ya0Ys0`, local branch `exec/native-admission`, publisher `native-admission-investigation`.
- Result `/private/tmp/plan141-slice4.HLSmkP/results/codex/publication/admission-investigation/20260928T081558-52d6`: native session 7261 exited 0 with terminal `turn.completed`, stream complete, runner/assessor pass. Actual skill reads item_1 and admission/publication references item_2. Startup item_8 refused full target `refs/heads/main`; item_9 diagnosed and item_10 accepted bare `main` within the same session before any probe.
- Coordinator independently inspected remote `4c189b690465991df461dbc05d3d9aa8b8be977a` after base `eef8c36b98b2838719118dff03b6b8d47b454d63`: exactly one Taken `STARTUP-INVESTIGATION#startup`, seed/profile, unselected approach, no plan/assessment/product change, queued A/B preserved. `claim-accepted` mtime `1790583320447008573` precedes `.probe-ran` `1790583330470092565`; accepted receipt item_10 precedes actual `node scripts/probe.js` item_13. Human `human-staged.txt`/`trunk.txt`/`human-unstaged.txt` retain contents and staged/tracked/untracked statuses; installed guidance use, ordering and state inspected beyond the assessor receipt.
- Self-declared agent-profile `--model gpt-6` does not identify native runtime model. Fixture claim CI remained unobserved; no impact on admission ordering. Raw result/source/preflight root HLSmkP and macOS artifact root `tmp.PxWj42jovt` deleted after judgment/publication of `a145978fafaed37dceb4cae58636f071bf3681a4` under ADR 0005.

## Accepted proof — slice 5 (2026-09-28)

Verdict: pass for explicit unlisted one-shot result, preservation and retirement in one observed session; no reliability claim.

- Guidance/harness pinned `v0.3.45`/`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`; installed execution SKILL/one-shot reference matched source. Codex `0.157.0`, unchanged default adapter/ephemeral/ignore-user-config with isolated state/logs, actual model unknown, deadline/grace 900/15. Setup `/opt/homebrew/bin/bash /tmp/plan141-slice5-setup.sh` passed help, separate fixture/install and human-edit checks; prior substitute prerequisite reused.
- Literal launch: `PATH="/opt/homebrew/bin:$PATH" GIT_PUBLICATION_KEEP=1 native_case_deadline=900 native_case_grace=15 bash /private/tmp/plan141-slice5.sxnabf/source/tests/git-publication-native.sh --native codex --case publication/one-shot-result --results-dir /private/tmp/plan141-slice5.sxnabf/results`. Session 64130 exited 0; native `turn.completed`, independently classified complete, assessor pass. One paid attempt; rejected heredoc/invalid initial CI repository argument corrected within the session, no guidance/harness modification or native rerun.
- Exact reused prompt function `git_publication_one_shot_prompt` asks to append `One-shot line` as one-shot work with installed guidance, supplied owned checkout/branch/local origin/publisher, publication authority and human-edit preservation; no expected verdict or startup command supplied. Retained/reconstructed prompt hash `71f54d472976d9077af93b6df6591537be9541299a31da1579c0bc926d4f21e4` matched observed argv/record. Fixture `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.ntNcJ6KLy8/one-shot-result.1RL6CE/workspace-claim-xRtV8i`.
- Coordinator inspected actual skill read item_1 and one-shot reference item_2, successful `execution-start.mjs ... --one-shot` item_7, exact append verification item_13, terminal stream, origin and cleanup. Local fixture origin accepted `4efcbcab96911fee5ee6c4339610cf176fdfde7b` after `1ab3f5cea83be876152aa97aa4ba919e3d98cacf`: one commit, only `notes.txt`, exactly `Release notes\nOne-shot line\n`, one accepted trunk push, no Taken/planning/profile changes. Human staged/tracked/untracked content/status preserved. Item_22 verifies containment and retires owned workspace/branch; independent filesystem/worktree/local+remote refs confirm absence beyond assessor flags.
- Fixture CI item_20 reports exact-revision success/shutdown using its deliberately successful adapter, not hosted CI; self-declared profile model is not runtime model. Actual execution-branch CI remains failed on basis `6b6074ae`; subsequent ignored-only planning records follow that failure.
- Result `/private/tmp/plan141-slice5.sxnabf/results/codex/publication/one-shot-result/20260928T082500-6b27`, source/preflight root sxnabf and macOS artifact root `tmp.ntNcJ6KLy8` were deleted after judgment/publication of `86ea2379bc70ea798d242299844e8464c8699baa` under ADR 0005.

## Accepted proof — slice 6 (2026-09-28)

Verdict: pass for queued one-shot result/closure, sibling preservation and retirement in this session; no reliability claim.

- Guidance/harness `v0.3.45`/`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`, installed SKILL bytes matched; Codex `0.157.0`, unchanged default/ephemeral/ignore-user-config adapter, actual model unknown, bounds 900/15. Setup `/opt/homebrew/bin/bash /tmp/plan141-slice6-prepare.sh` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice6.Zt4Las/preflight.sh` passed pinned help, separate queued-fixture install/state/human-edit preconditions before paid launch; substitute prerequisite reused.
- Literal launch: `PATH="/opt/homebrew/bin:$PATH" TMPDIR=/private/tmp/plan141-slice6.Zt4Las/runtime GIT_PUBLICATION_KEEP=1 native_case_deadline=900 native_case_grace=15 /opt/homebrew/bin/bash /private/tmp/plan141-slice6.Zt4Las/evaluated-source/tests/git-publication-native.sh --native codex --case publication/one-shot-queued --results-dir /private/tmp/plan141-slice6.Zt4Las/results`. Runner session 88886 exited 0; native exit 0, terminal `turn.completed`, complete stream, assessor pass. No paid retry or guidance/harness repair.
- Exact unchanged `git_publication_one_shot_prompt` requests queued Story B (`SEED-B#b`) completion as one-shot with supplied owned checkout/branch/local origin, publication authority and human-edit preservation, no expected verdict/startup command. Reconstructed prompt hash `e35b8a9a7d8a8ea9953fa9030c8fa81726d646da51129dae263c00d4cde38798` matched record/argv; fixture `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.pK0QnDMNh7/one-shot-queued.PDbhjg/workspace-claim-L2FzD4`.
- Actual skill reads item_1/one-shot references item_2; successful installed `execution-start.mjs ... --identity SEED-B#b ... --one-shot` item_6, exact append item_12, closure item_14, delivery item_23 and containment/retirement item_27. Coordinator independently inspected trace, remote diff/history, backlog/seed/plan, human files/status and worktree/refs beyond the assessor; `python3 /private/tmp/plan141-slice6.Zt4Las/inspect.py` also passed those assertions.
- Local origin accepted exactly one commit/push `5b74ba7320ccb774bf2554c93d5eebd87225b635` after `4c8ae74e35f2f09a54c56b94af1e6956b9a2ac96`: exact `Release notes\nStory B line\n`, only Story B row/section/plan removed, no accepted Taken claim or other planning change. Story A seed and B2 section byte-identical; remaining identities/queue order preserved. Planted staged/tracked/untracked human contents/status exact; owned workspace/local+remote branch/registration absent.
- Native delegation failed before launching an agent, so it used the installed single-interactive-slice allowance locally; protected heredoc and initial absolute CI repo argument were corrected within this same session. Fixture CI is deliberately synthetic success; hosted CI remains separately owned/failed, self-declared model is only profile metadata. These process limits do not imply general guidance acceptance.
- Result `/private/tmp/plan141-slice6.Zt4Las/results/codex/publication/one-shot-queued/20260928T083546-05c5`, source/preflight root Zt4Las and actual macOS root `tmp.pK0QnDMNh7` were deleted after judgment/publication of `461cca54d1920d8cea51115c1c557cd8d6052611` under ADR 0005.

## Outstanding proof — slice 7 (2026-09-28)

Verdict: inconclusive, not a behavior failure; safe admission happened before product edits, so after-edit carry remains unproved and slice 7 stays planned.

- Separate harness `f7a7637c04d66e5540f901ff56b4a4e49d3ebec2` and guidance `v0.3.45`/`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`. Only disposable harness adaptation: existing `git_publication_fixture_install_skills` source selection changes `local source_dir=$1` to `local source_dir=${PLAN141_GUIDANCE_SOURCE:?}`. Installer/payload come from the pinned release; prompt/fixture/adapter/supervisor/assessor remain inherited. Coordinator independently matched 181 installed files to release bytes (generated VERSION to release VERSION); release clone stayed clean. No maintained product/guidance edit.
- Setup `/opt/homebrew/bin/bash /tmp/plan141-slice7-setup.sh` passed case recognition/help, separate fixture installation, unchanged released-settings check and human preconditions before paid launch; inherited counterexample prerequisite reused. Codex `0.157.0`, unchanged default/ephemeral/ignore-user-config adapter, actual model unknown, bounds 900/15.
- Literal single launch: `PATH="/opt/homebrew/bin:$PATH" PLAN141_GUIDANCE_SOURCE=/private/tmp/plan141-slice7.101szk/guidance GIT_PUBLICATION_KEEP=1 native_case_deadline=900 native_case_grace=15 bash /private/tmp/plan141-slice7.101szk/harness/tests/git-publication-native.sh --native codex --case publication/one-shot-escalation --results-dir /private/tmp/plan141-slice7.101szk/results`. Runner session 88824 exited 1 for inconclusive assessment; native exited 0, terminal `turn.completed`, independently classified complete. No new paid attempt or evaluated-guidance repair.
- Existing nonleading `git_publication_one_shot_prompt` requests `notesDir` to `notesDirectory` rename with installed guidance, owned checkout/branch/local origin, publication authority and preservation; planning authority withheld. Exact argv prompt hash `8a5d6079d5f2e49f2f127a34e56dba2a2332d96fe0f6b7059ec1bb197637b564` matches retained prompt after removing its file newline. Actual fixture `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.6mVkPGvvYN/one-shot-escalation.3W2cnA/workspace-claim-YvHeAg`.
- Actual installed skill reads items 2/3; migration documentation/released-settings test reads 4/6 preceded any product edit. Message 5 explicitly checks one-shot eligibility before changing the key. Item 8 successfully starts `--one-shot`; system-temp EPERM in item 10 is recovered with `TMPDIR="$PWD" node scripts/command.js` item 11, which passes unchanged baseline. Message 14 identifies the separate versioned migration before editing. This recovered environment issue did not cause the inconclusive verdict.
- Item 18 ordinary `--admit --carry` accepts `e694484a624698bd9b81410660dfc5e27d24eace` after base `401ca1a70d50ac3ba2e13c2081d65a41bdf95c90`; receipt reports `carried.restored: false`. Coordinator independently inspected trace/remote history: exactly one claim commit, only backlog/seed/profile paths, one Taken `SEED-NOTES-DIRECTORY#rename`, queued A/B preserved, no product result published. Same owned workspace is clean on the claim; no staged or unstaged product edits to restore. Human staged/tracked/untracked bytes/statuses remain intact. Stop before planning respects fixture authority; claim CI unobserved, self-declared model only profile metadata.
- The assessor agrees with inspected state, but successful safe admission cannot substitute for edits-before-growth and uncommitted restoration. Migration obligations were visible in documentation/test source before editing; consider fixture observability when deciding how to obtain missing proof. No unchanged behavioral rerun and no general reliability claim.
- Raw result `/private/tmp/plan141-slice7.101szk/results/codex/publication/one-shot-escalation/20260928T084527-4021`, source/preflight root 101szk and macOS artifact root `tmp.6mVkPGvvYN` will be deleted after compact evidence publication under ADR 0005.

## Incomplete execution boundary

Cases 1 and 3–6 accepted; case 2 remains failed/unaccepted and case 7 inconclusive. The first backlog correction `SEED-053#proportionate-local-verification` retains case 2's evidence and decision options; its implementation is deferred by the maintainer. Future decisions must address that correction and adequate after-edit carry proof, without weakening this plan's promises or repeating unchanged paid runs. Preserve this Taken identity, plan and owned worktree; no completion marker, automatic retrospective or wrap-up. Publish this evidence, then stop the exact observer under the host's human-judgment-stop contract without waiting for CI; the separately owned dashboard assertion failure remains a CI limitation.
