# Accept existing guidance natively on Codex

## Source

- Story: [Accept existing guidance natively on Codex](../../seeds/SEED-053-native-guidance-acceptance.md#native-acceptance-codex).
- **Identity:** SEED-044#native-premise-acceptance-codex-cursor
- Authority: story refinement and slice planning only. All slices remain
  planned; no paid native session or product implementation was authorized by
  this preparation request.
- Preparation workspace: `/Users/terryyin/.codex/worktrees/codex-native-acceptance/open-dough`,
  branch `codex/codex-native-acceptance`, created by this session from
  `686487ea745dabfeff0cc88358ffc554f7d4346c`. Originating/integration checkout:
  `/Users/terryyin/git/open-dough`. Preparation target: `origin/main`.
  Preparing assignment: Koharu-chan, allocation/publication
  `9cc7fe05ddb96f48faea101aa23acba533a33ff7`.

## Goal and scope

Establish Codex-specific acceptance of the selected planning and work-tracking
behaviors already available to developers. The seed's Scope, Key examples,
constraints, exclusions and completion criteria apply. This evaluates behavior
and supports a bounded recommendation; it makes no general reliability claim.

Evaluate guidance from `v0.3.45` (`f3f75d0b9f4dccd2d887c43b71d8234f6499c65e`)
first. Use an isolated source checkout at that tag for installation and the
available publication harness. For planning baselines use `2c5ff71^`
(`6882aeb3b0ea969cba34d00c9f6a98d034905be4`) in a separate source checkout.
Keep baseline and candidate host/model conditions equivalent. Do not silently
substitute the latest tag or current source bytes for either revision.

Reuse applicable Codex proof before launching fresh sessions. Existing Claude
Code proof defines representative expectations, not Codex success. Necessary
bounded fixture/adapter/assessment repairs stay with their affected slice;
keep the installed guidance revision identifiable independently of repaired
harness code. If that cannot be done with the existing installation seam,
stop to revise that slice's approach before spending a native run. Guidance
defects require a separate correction decision rather than changing this
story into implementation.

All seven slices are Behavior slices with independent observable outcomes.
The first six can establish partial acceptance. Slice 7 uses the inherited
Claude Code escalation fixture, now accepted on 2026-09-28 and recoverable from
`d05d9937`; host-specific Codex proof remains required. No Structure slice, architecture change or new framework is needed.

## Existing solutions and decisions

PFE responsibility: isolate, launch, supervise and judge the selected Codex
cases without another execution or evidence mechanism.

- Reuse `tests/git-publication-native.sh --native codex --case ...` and its
  admission/one-shot fixtures, prompts, observers and state assessors.
  `tests/support/native-codex.sh` owns the native adapter; supervision and
  stream classification already live in `native-run-supervise.sh` and
  `native-run-stream.sh`. These owners match the responsibility.
- Reuse the manually prepared planning cases recovered from plan 115 at
  `874f9a8`. No fitting maintained planning harness was found through
  `rg -n 'premise|Doughnut|Pygardon' tests src/skills/dough-slice-planning`;
  use the existing adapter and supervisor for these one-off sessions.
- Inspect `tests/support/git-publication-native-one-shot.sh` observations and
  the transcript together: the state assessor does not require its recorded
  `one-shot-start-observed` field. Manual installed-guidance-use review is
  mandatory for acceptance. Do not treat an automated state pass as the verdict.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): native
  interface, non-leading prompts, justified reuse, independent assessment,
  bounded runs and current-work evidence cleanup. No full tool/case matrix.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  immutable release identity. Release exceptions in CHANGELOG do not supply
  acceptance proof.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  the disposable target is the session's project. Repair published guidance,
  if separately authorized, in `src/skills/`; do not hand-edit installed copies.
- `.planning/NORTH-STAR.md`, "One admission path for accepted work": one-shot
  growth converges on ordinary admission and the same owned edits. This plan
  tests that direction and creates no second publisher or tracking domain.

## Decisive premises observed during preparation

| Premise | Literal observation | Result |
| --- | --- | --- |
| The selected released guidance includes premise checking and one-shot | `git show v0.3.45:src/skills/dough-slice-planning/SKILL.md`; CHANGELOG 0.3.43–0.3.45 | Premise observation is required; both behaviors shipped with native requirements pending. |
| Doughnut's old test and refined story are recoverable | `git -C /Users/terryyin/git/doughnut cat-file -e 20efa7ec81^:scripts/test/quality_changed.test`; `git ... diff-tree --no-commit-id --name-only -r 20efa7ec81 -- .planning` | Test exists; seed is SEED-043, anchor `story-1`. |
| Pygardon's proof traces the moved seeding | `git -C /Users/terryyin/git/pygardon grep -n -E 'seed.*strateg|strateg.*seed|seed_live|seed_strategy' b2ad7c394^ -- e2e_test`; old plan 196 | `e2e_test/step_definitions/live_strategies_steps.ts` launches `seed_named_genome_live_strategy_pair.py`; old plan incorrectly selected `strategy_verify.feature`. |
| The control's input and comparison are recoverable | `git diff-tree --no-commit-id --name-only -r e7107e5 -- .planning`; `git show e7107e5:.planning/seeds/SEED-042-rename-slice-plan-folder-references.md` | SEED-042, anchor `rename-slice-plan-folder-references`; plan 111 supplies the comparison. |
| Selected publication journeys are supported | `rg -n 'publication/one-shot|admission-investigation' tests/support/git-publication-native-host.sh`; reads of runner, fixture, prompt and assessor files | Three available cases dispatch to real fixture/install/observation paths; no native escalation case exists yet. |
| Existing substitute proof reaches the consuming operations | `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/git-publication-native.sh` | Passed during preparation, through installed startup, delivery, CI, cleanup and state counterexamples. This proves the harness path, not native agent behavior. |
| The installed CLI supports the adapter arguments | `command -v codex`; `codex --version`; `codex exec --help`; `codex --help` | `/Users/terryyin/.local/bin/codex`, 0.157.0; ephemeral/config-isolation, JSON, directory, output and sandbox arguments are present. Authentication and actual skill use remain live-session questions. |
| Modern Bash is available | `/opt/homebrew/bin/bash --version` | Bash 5.3.20; `/bin/bash` is 3.2.57. Put `/opt/homebrew/bin` first for checks. |
| The three planning setups work with the selected release | Disposable local clones: `git clone --shared --no-checkout`, `git checkout --detach <pre-plan-parent>`, `git remote remove origin`, seed restoration with `git show`, `bash <v0.3.45-source>/install.sh --target <clone> --source <v0.3.45-source> --platform codex --force`, installed `product-backlog.mjs record-state --refinement refined --approach unselected` for each named story | All three setup/install/state-reset journeys passed during preparation; their disposable roots were removed. No native session ran. |
| No earlier active Codex plan is allocated | Current planning records and all-ref plan history; other owned preparation directories | No active Codex acceptance plan was found. Initial allocation followed 139; landing renamed the draft to 141 after origin allocated 140 to remote-history workflows. |

Before paid execution, repeat only observations invalidated by changed inputs.
Recheck the availability of the historical repositories, CLI and evaluated
source snapshots. Authentication, native stream compatibility and agent
behavior require the first bounded live attempt; a stopped attempt blocks its
dependent runs without implying a behavioral failure.

## Proof and run protocol

Execution requires its own instruction. Native launches are manual opt-ins,
once per case per evaluated guidance version, after the executing instruction
authorizes them. No paid session enters `npm test`, CI or a default wrapper.
For a diagnosed fixture/adapter failure, allow at most one corrective retry of
that case; a second failure stops for human judgment. Do not repeat a behavioral
failure until it passes. Keep source/guidance fixed while comparing results.

Inspect applicable proof recoverable from Git first. Each accepted/reused result
records its requirement, literal command and prompt, guidance and harness
revisions, Codex version/model (unknown when unavailable), relevant fixture
input, decisive observation, verdict and limitations in this active plan.
Baseline success is valid compatibility evidence with weak improvement
attribution. One success is one observed success, not a reliability estimate.

Planning fixture setup, performed independently for each baseline/candidate:

| Case | Local repository | Pre-plan checkout | Restore seed from | Story link |
| --- | --- | --- | --- | --- |
| Doughnut | `/Users/terryyin/git/doughnut` | `20efa7ec81^` | `20efa7ec81` | `seeds/SEED-043-commit-gate-checks-committed-changes.md#story-1` |
| Pygardon | `/Users/terryyin/git/pygardon` | `b2ad7c394^` | `b2ad7c394` | `seeds/SEED-047-tfdc-search-and-verify-simplification.md#story-tfdc-dead-behavior-removal` |
| Control | Open Dough repository | `e7107e5^` | `e7107e5` | `seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references` |

Clone under a disposable root, remove `origin`, restore only the selected
refined seed, and reset its selected state with the installed recorder to
`refined`/`unselected`, clearing old plan/readiness. Pygardon's selected backlog
entry is restored from `b2ad7c394` when needed. Install using
`bash <source>/install.sh --target <fixture> --source <source> --platform codex --force`.
Supply the clone as the already owned preparation checkout in the prompt, with
explicit no-commit/no-push authority, so no new preparation publication occurs.

Planning prompt template (substitute only fixture and story):

> Use this project's installed Open Dough guidance to make a slice plan for
> `<story link>`. This disposable checkout at `<fixture>` is the supplied owned
> preparation workspace. Use the project's story and decisions. This request
> is planning only: do not implement, commit, push or publish. Write the plan,
> record its preparation assessment and report the result.

The prompt does not name the faulty premise, desired test or verdict. Retain
JSON events and the resulting plan/state; review actual installed-skill reads
and decisive observations. Use the existing adapter/supervisor in modern Bash:

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

Each result path is a new disposable attempt. Use equivalent resolved model
settings for baseline/candidate and record them; do not change models to seek a
pass. The existing publication wrapper uses a 900-second deadline and 15-second
grace too. Keep temporary result directories outside maintained source.

Verdicts: pass needs a complete native session, installed-guidance use, and the
case's observable result. Confirmed behavior failure remains failed; unavailable
runtime, invalid setup, missing skill-use evidence or incomplete stream is
inconclusive for behavior. Diagnose before retrying. If inexpensive setup
already fails, stop before the paid launch. Do not judge unrelated replay-plan
defects as this story's failure or silently fix the target product.

Delete raw artifacts after judgment, keeping the compact accepted proof or
outstanding requirement in this active plan until ordinary wrap-up. Retain
failed output only while needed for current diagnosis. A changed revision or
fixture invalidates only the proof whose applicability it actually changes.

## Ordered slices

### 1. Codex finds the existing commit-gate test before planning

Type: Behavior
Status: planned
Proof: the Doughnut baseline/candidate sessions, or justified equivalent Codex
reuse, are judged from their written plans, state and complete native traces.

Behavior: a disposable pre-plan Doughnut checkout with its refined story →
Codex plans that story using the selected guidance → the candidate plan names
`scripts/test/quality_changed.test`, records the inspection establishing its
relevance, and uses it as proof instead of claiming the gate has no test.
Run this first as the paid-only probe of native launch, isolation, skill use and
stream compatibility. A setup/runtime failure stops later paid sessions until
diagnosed; a behavioral failure stops this requirement and is reported for
correction judgment. If the baseline passes too, record limited attribution.

### 2. Sound premises reach readiness without unnecessary planning work

Type: Behavior
Status: planned
Proof: control baseline/candidate written plans and state assessed against
historical plan 111, with observation breadth and added gates explicitly judged.

Behavior: the historical Open Dough folder-reference story with sound premises
→ Codex plans it using installed guidance → decisive premises have brief
relevant observations, the plan reaches `ready`, and no unjustified probe,
approval or additional full-suite run is added. Equivalent current proof or
slice boundaries are allowed; plan 111 is a burden comparison. Judge this early
to expose an over-observation cost before expanding the acceptance effort.

### 3. Codex chooses proof that actually executes the moved seeding

Type: Behavior
Status: planned
Proof: Pygardon baseline/candidate plans plus the observed caller chain;
`live_strategies.feature` or an equivalent traced proof owns moved seeding.

Behavior: the historical removal story affects named-genome/live-strategy
seeding → Codex plans the story → it observes the executable caller chain and
assigns proof that runs `seed_named_genome_live_strategy_pair.py`, rather than
using `strategy_verify.feature` alone. Record weak improvement attribution if
the baseline already meets the same requirement. The full target E2E suite
need not run during this planning-only acceptance.

### 4. An accepted investigation becomes visible before substantive action

Type: Behavior
Status: planned
Proof: manually selected `bash tests/git-publication-native.sh --native codex
--case publication/admission-investigation --results-dir <results>` from the
evaluated source; independent admission ordering and skill-use review.

Behavior: an unlisted accepted investigation without one-shot selection →
Codex follows installed entry guidance → origin accepts its Taken claim before
the substantive probe, and planted human edits survive. This is the ordinary
tracking control. A fixture push receipt alone is insufficient: judge its
relationship to the investigation marker and native command trace.

### 5. Explicit unlisted one-shot work publishes only its verified result

Type: Behavior
Status: planned
Proof: the same wrapper with `--case publication/one-shot-result`, plus the
native trace, requested file content, accepted Git history and cleanup state.

Behavior: an explicitly selected trivial unlisted edit → Codex uses installed
one-shot startup, focused verification and delivery → origin gains one result
commit, no planning records or Taken claim are published, human edits survive,
and the owned workspace/branch retire after completion. Confirm that the
requested line actually exists; the automated result-changed field alone does
not establish it. A recorded one-shot-start signal and transcript establish
use, rather than an unexamined assessor pass.

### 6. A queued one-shot result closes its story while preserving siblings

Type: Behavior
Status: planned
Proof: the wrapper with `--case publication/one-shot-queued`; accepted push
history, requested file content, closure/sibling observations and native trace.

Behavior: queued trivial story B with a one-slice plan and unfinished sibling
→ Codex completes explicitly selected one-shot work → one accepted commit
contains its requested result and closure, no accepted push lists it Taken,
its spent section/plan disappear, the sibling retains its identity and position,
human edits survive, and the owned workspace retires. Reuse the existing queued
fixture and assessor; add no broader ownership-race journey.

### 7. A grown one-shot attempt enters ordinary tracking with its edits intact

Type: Behavior
Status: planned
Proof: `PATH="/opt/homebrew/bin:$PATH" bash tests/git-publication-native.sh
--native codex --case publication/one-shot-escalation --results-dir <results>`
from the inherited harness at `f7a7637c`, installing the pinned `v0.3.45`
guidance through the existing fixture-install function seam. Inspect the native
trace, accepted origin claim, carried edits and assessor verdict independently.

Precondition resolved: `d05d9937` accepted the non-leading fixture on Claude
Code, and `133b4f9d` assimilated its result in SEED-028. The maintained runner
now dispatches this case through
`tests/support/git-publication-native-one-shot-escalation.sh`; its fixture hides
the growth until the released-settings check. Its state counterexamples cover
untracked results, missing admission, missing/committed edits, admission before
editing and changed human edits. The fixture permits publication but withholds
planning, so the prescribed stop after carrying the edits is valid. Keep the
harness revision distinct from installed guidance; use a disposable harness
copy with only its fixture-install source redirected to the release checkout.
Do not modify the evaluated guidance to obtain acceptance.

Behavior: Codex starts eligible one-shot work, makes owned edits and discovers
growth → before further edits it selects ordinary admission with carry →
origin records the claim, the edits survive uncommitted in that same workspace,
and execution continues only within the original authority. If the inherited
fixture withholds planning authority, its prescribed stop after admission is
valid. An up-front admission is safe but inconclusive for this transition;
an untracked grown result or an unnecessary approval stop fails the case.

## Review, stopping points and open questions

Seven independent proof loops support the same acceptance outcome without new
production responsibilities. Splitting the three planning cases preserves
case-local diagnosis; the sound control remains its own burden assessment.
The three publication cases retain different tracking/completion postconditions.
No sizing target or execution-time hard limit was supplied; each slice is
bounded to one case, its applicable comparison and focused diagnosis. The native
deadline bounds a process, not a promise of slice effort.

Six available cases are a useful stopping point with escalation explicitly
pending. Actual Codex exposure remains a priority question, not an invented
execution prerequisite. Scope and examples are established; applicable reuse
and live outcomes are execution questions. The inherited dependency is now available: the accepted Claude Code observation
at `d05d9937`, current SEED-028 record and maintained fixture/runner establish
its feasibility, invocation and rubric. Its availability removes the recorded
blocking concern; all seven slices remain cohesive, separately judged Behavior
proof loops. No scope, slice boundaries, PFE decision or guidance revision
changes. Readiness is reassessed against these observations, while the first
bounded Codex run still owns authentication, isolation and stream compatibility.

## Dependency reassessment (2026-09-28)

- Observation: `git ls-tree -r --name-only f7a7637c tests/support` lists the
  escalation fixture and support file; `tests/git-publication-native.sh --help`
  and `native_case_known` dispatch `publication/one-shot-escalation`.
- Accepted upstream proof: SEED-028 records the Claude Code run against
  `23563ee0`, admission with carry after owned edits, uncommitted restoration,
  no result on trunk and the stop before planning. This establishes fixture
  feasibility, not Codex acceptance.
- Consequence: the missing-fixture assumption is invalidated. Retain all seven
  promises and run bounds; replace only slice 7's unavailable command path.
- Publication and execution are authorized by the maintainer's execute-plan
  instruction and subsequent request to resume after the dependency landed.
