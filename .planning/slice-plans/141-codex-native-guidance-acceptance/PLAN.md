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
Status: planned
Proof: Pygardon baseline/candidate plans and observed caller chain; `live_strategies.feature` or equivalent traced proof owns moved seeding.
Behavior: named-genome/live-strategy removal story → planning observes executable chain → selected proof runs `seed_named_genome_live_strategy_pair.py`, not `strategy_verify.feature` alone. Baseline success limits attribution. Full target E2E suite need not run for this planning-only acceptance.

### 4. An accepted investigation becomes visible before substantive action

Type: Behavior
Status: planned
Proof: `bash tests/git-publication-native.sh --native codex --case publication/admission-investigation --results-dir <results>` from evaluated source; independent admission ordering and skill-use review.
Behavior: unlisted accepted investigation without one-shot selection → installed entry guidance → origin accepts Taken before substantive probe; human edits survive. Assess push receipt against investigation marker and native trace; receipt alone is insufficient. This is ordinary tracking control.

### 5. Explicit unlisted one-shot work publishes only its verified result

Type: Behavior
Status: planned
Proof: slice 4 wrapper with `--case publication/one-shot-result`; native trace, requested content, accepted history and cleanup.
Behavior: explicitly selected trivial unlisted edit → installed one-shot startup, focused verification/delivery → one result commit on origin, no planning records/Taken published, preserved human edits, retired owned workspace/branch. Verify requested line, not just result-changed assessor field; recorded one-shot-start and transcript must establish use.

### 6. A queued one-shot result closes its story while preserving siblings

Type: Behavior
Status: planned
Proof: same wrapper with `--case publication/one-shot-queued`; push history, requested content, closure/sibling observations and native trace.
Behavior: queued trivial story B with one-slice plan and unfinished sibling → explicit one-shot completion → one accepted commit with requested result/closure, no accepted Taken push, spent story section/plan removed, sibling identity/position preserved, human edits preserved, owned workspace retired. Reuse fixture/assessor; no broader ownership-race journey.

### 7. A grown one-shot attempt enters ordinary tracking with its edits intact

Type: Behavior
Status: planned
Proof: `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --native codex --case publication/one-shot-escalation --results-dir <results>` using inherited harness `f7a7637c` and pinned `v0.3.45` guidance. Independently inspect native trace, accepted claim, carried edits and assessor.
Behavior: eligible one-shot starts, owned edits expose growth → before further edits ordinary admission with carry → origin records claim, edits remain uncommitted in same workspace, continuation stays within original authority. Fixture withholds planning, so stop after admission is valid. Up-front admission is safe but inconclusive; untracked grown result or unnecessary approval stop fails.
Precondition resolved 2026-09-28: `git ls-tree -r --name-only f7a7637c tests/support`, runner `--help` and `native_case_known` show the escalation dispatch through `git-publication-native-one-shot-escalation.sh`. `d05d9937` accepted its non-leading Claude fixture; `133b4f9d` assimilated SEED-028 proof against `23563ee0`: carry after edits, uncommitted restoration, no trunk result, stop before planning. This proves fixture feasibility, not Codex acceptance, and removes missing-fixture concern without changing scope/bounds/PFE/revisions.
Fixture hides growth until released-settings check; counterexamples cover untracked results, missing admission, missing/committed edits, admission before editing and changed human edits. Use disposable harness copy redirecting only existing fixture-install source to release checkout; keep harness/guidance distinct and never edit evaluated guidance for acceptance.

## Execution context

- Story Branch Mode; integration `/Users/terryyin/git/open-dough`. Managed owned workspace `/Users/terryyin/.codex/worktrees/plan-141-execution/open-dough`, branch `codex/plan-141-execution`, starting revision `f52139814624ee3b72ff06257edeba4e9e4788cb`.
- Publisher `codex-plan-141-20260928`; agent Sola-chan. Claim accepted on `origin/refs/heads/main`: `b5a6017a966d088c7fbb700ce17833ae8e3b5eda`. Increments target `origin/refs/heads/codex/plan-141-execution`.
- Exact-checkout setup passed: locked `PATH="/opt/homebrew/bin:$PATH" npm ci` and `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh --help`. No commit hook; Markdown needs no formatter, whitespace checked before staging.
- No applicable earlier Codex acceptance proof found in retained records/Git; Claude evidence is fixture reference only. Keep established in-scope plan-refinement authority; no hard limit/exceptions. All runs retain 900/15-second bounds.
- Default checkout refresh deferred for pending dashboard edits. Preparation update accepted as starting revision above; claim's trunk CI unobserved.
- CI observer: GitHub Actions, selector `ci.yml` verified by `gh run list` (no branch push run yet), target `codex/plan-141-execution` in `terryyin/open-dough`; runtime `.agents/skills/dough-execute-plan` in this exact checkout. Codex yielded cell `28`, session `55077`, directory `/tmp/dough-ci-501/watch-2OeRvN`, PID `2304`, coordinator `codex-plan-141-20260928`. Managed deliveries reuse this live observer; unobserved trunk claim CI is not registered on it.

## Accepted proof — slice 1 (2026-09-28)

Verdict: pass for candidate and baseline; present-behavior acceptance only.
Both sessions read the installed planning skill and existing
`scripts/test/quality_changed.test`, accurately described routing-stub limits,
and selected that test as executable regression proof. Both wrote a plan and
recorded planned/ready state with matching reviewed digests. Baseline success
limits improvement attribution; neither run proves implementation correctness
or statistical reliability.

- Guidance: candidate `f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`
  (`v0.3.45`); baseline `6882aeb3b0ea969cba34d00c9f6a98d034905be4`
  (`0.3.42`). Installed planning SKILL.md matched each source byte-for-byte.
- Harness: `b5a6017a966d088c7fbb700ce17833ae8e3b5eda`, existing
  `tests/support/native-codex.sh`, `native-run-supervise.sh` and
  `native-run-stream.sh`. CLI `0.157.0`; actual model unknown. Identical
  defaults and `--ignore-user-config`; no model switch or retry.
- Setup command: `/opt/homebrew/bin/bash /tmp/plan141-slice1-setup.sh`.
  Disposable shared clones of Doughnut at
  `0d92ca6c226fc0d755a9b159e2cb3259a68f009f` (`20efa7ec81^`); selected
  refined seed restored from `20efa7ec81`, origin removed, separate pinned
  source clones, release installation and installed recorder reset to
  refined/unselected. Setup supplies preconditions, not the accepted behavior.
- Literal native launches:
  `/opt/homebrew/bin/bash /private/tmp/plan141-slice1.KTBlZf/run.sh candidate`
  and `/opt/homebrew/bin/bash /private/tmp/plan141-slice1.KTBlZf/run.sh baseline`.
  This temporary script applied the protocol above via the existing adapter:
  `codex exec --ephemeral --ignore-user-config -c sqlite_home=<isolated-state>
  -c log_dir=<isolated-state> --skip-git-repo-check --sandbox danger-full-access
  --json -C <fixture> -o <response> <prompt>`, wrapped by the adapter's
  protected sandbox-exec profile and supervisor deadline/grace 900/15 seconds.
- Exact candidate prompt: "Use this project's installed Open Dough guidance
  to make a slice plan for
  seeds/SEED-043-commit-gate-checks-committed-changes.md#story-1. This disposable
  checkout at /private/tmp/plan141-slice1.KTBlZf/candidate-doughnut is the
  supplied owned preparation workspace. Use the project's story and decisions.
  This request is planning only: do not implement, commit, push or publish.
  Write the plan, record its preparation assessment and report the result."
  Baseline substituted only the fixture path's `candidate-doughnut` with
  `baseline-doughnut`.
- Inspected boundary: installed guidance → actual test inspection → written
  proof selection → preparation recording. Candidate completed command item_0
  reads installed skills; item_9 reads the test (exit 0). Its
  `.planning/quick/043-commit-gate-checks-committed-content/PLAN.md` line 76
  records the literal inspection, line 125 selects the test at the public
  `scripts/lint_changed.sh` boundary. Baseline item_1 reads the planning skill;
  item_12 reads the test (exit 0). Its same relative plan lines 33–37 identify
  reusable test foundations and lines 120–121 select the focused commands.
- Each native process exited 0 with terminal `turn.completed` and classified
  stream `complete`. The coordinator independently inspected those plans,
  command items, outcome files, preparation state and candidate source identity.
  Expected protected config/plugin-write warnings continued in memory;
  authentication and isolation permitted the complete sessions. Candidate's
  separate dependency-isolation probe does not change this test-selection
  acceptance claim. No target product implementation was performed.
- Raw plans, state, command argv, exact prompts and JSON traces at
  `/private/tmp/plan141-slice1.KTBlZf` were judged for this active decision and
  are deleted after this slice's proof record is published under ADR 0005.

Slice 1 delivered: `8373b163be94f2b6244c7c0c0e1e8e501877afa6` accepted on the recorded execution-branch target; observer reused and exact revision registered. Raw slice-1 artifacts were deleted after judgment/publication. This is the next increment's previously published base.

## Slice 2 observation and execution stop (2026-09-28)

Verdict: candidate failed the proportionate control; baseline is mixed/limited,
not a clean historical-plan-111 burden match. Slice 2 remains planned and
unaccepted; slices 3–7 were not launched. No guidance fix, candidate retry,
retrospective, readiness renewal or completion claim is authorized by this
result. The story remains Taken; a separate correction decision is needed.

- Guidance is unchanged: candidate `v0.3.45`/`f3f75d0b`, baseline `6882aeb3`; harness `8373b163be94f2b6244c7c0c0e1e8e501877afa6`, CLI `0.157.0`, same default/ignore-user-config settings, actual model unknown. Relevant installed skill bytes matched each pinned source.
- Setup command: `/opt/homebrew/bin/bash /tmp/plan141-slice2-setup.sh`; two independent shared Open Dough clones at `f2b974afb5367b7f8cbe3a2b5ebd246ec166bf02` (`e7107e5^`), selected refined SEED-042 restored from `e7107e5`, origin removed, separate pinned guidance installation and installed recorder reset to refined/unselected. Both setup journeys passed before launch; no product implementation.
- Literal launches: `/opt/homebrew/bin/bash /private/tmp/plan141-slice2.7YSVP3/run.sh candidate` and `/opt/homebrew/bin/bash /private/tmp/plan141-slice2.7YSVP3/run.sh baseline`, using the same adapter/supervisor protocol with deadline/grace 900/15 seconds. Exact planning prompt is the template above with story `seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references` and fixture `/private/tmp/plan141-slice2.7YSVP3/candidate-open-dough` or `/private/tmp/plan141-slice2.7YSVP3/baseline-open-dough`, respectively.
- Both native processes exited 0, ended with `turn.completed` and classified `complete`. Each item_1 actually reads the installed planning skill; each wrote one Behavior plan and recorded planned/ready with matching digests. Candidate ran one focused plan-reader check (10 tests); neither native session ran a full suite, made product edits or published.
- The observed failure is in the resulting prospective plan, not runtime: candidate `.planning/slice-plans/111-rename-slice-plan-folder-references/PLAN.md` lines 119–125 unconditionally require `npm test`, `npm run lint`, `npm run typecheck:dashboard`, `npm run build:dashboard` and the full `npm run test:dashboard` as existing delivery checks, beyond its focused proof. Its seven premise observations are relevant but heavier than brief.
- Historical plan 111's proof table and final verification paragraph prescribe focused reader/navigation checks plus existing repository requirements. Historical AGENTS representative behavior review, README and contributor test instructions supply no every-change full-suite mandate; hosted `ci.yml` lists those five checks. Candidate installed wrap-up line 86 says not to run full CI before commit unless explicitly required. Hosted checks do not alone establish that local mandate. These source observations leave the added unconditional burden unjustified.
- Baseline plan lines 116–124 also adds full `npm test` for distributed fixture consumers, but conditions full dashboard testing on affected reach and omits candidate's build/typecheck additions. This provides limited comparison, not acceptance of the candidate or a causal improvement claim.
- Coordinator independently inspected final plans, skill-read command items, terminal outcomes, matching preparation states and requirement sources. Raw root `/private/tmp/plan141-slice2.7YSVP3` has been judged and will be removed after publishing this compact failed/outstanding record. Native acceptance and this plan remain incomplete; do not retry the same candidate to obtain a pass.
