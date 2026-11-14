# Run native A/B comparisons on examples from real work

**Source:** [refined story](../../seeds/SEED-346-native-ab-comparisons.md#run-native-ab-comparisons-on-real-work)
**Source review:** [source-only review](source-review.md)
**Identity:** SEED-346#run-native-ab-comparisons-on-real-work

## Goal and scope

Give an Open Dough maintainer two selectable, reusable real-work examples and
an on-demand comparison of fresh baseline/candidate sessions. Show observed
outcome and decisive proof before available agent effort, with missing evidence
explicit. Terry selected Codex first on 2026-11-14: both initial cases require
native Codex qualification and comparison. Cursor/Claude native qualification,
dashboard UI/services, scheduling, general accounting, rollout, quota/invoice
attribution and general savings claims remain outside this increment.

Retain the SEED-324 paused-supplier decision and Doughnut SEED-122 calibration,
their origin/project revision, smallest faithful setup, neutral task, separate
assessment, selection tags and measured preparation/native duration. Preserve
case/project and independently frozen payload identities, matched conditions,
arm/session associations and recoverable bases across case refresh. Keep incomplete
results visible; measure useful repeated-run cost without an invented numeric target.

Preparation only; this plan grants no execution, Take, source review or completion record.

## Existing solution and architectural direction

Follow the [North Star's versioned native comparison cases](../../NORTH-STAR.md#versioned-native-comparison-cases).
The common rule is one versioned case with separate setup/task and assessment;
each pair freezes one case/project basis and applies independently identified
payloads to fresh arms under recorded runtime conditions. Assess observations,
then connect available effort to that outcome. Refresh changes the case version,
never an earlier report's basis. Keep a small maintainer command/catalog and
ordinary Git recovery; no registry, generic benchmark framework or new daemon.

PFE found these existing owners; expose suitable parts rather than copy them or
make the comparison inherit an unrelated family's lifecycle:

- `tests/native-family-layers.md` separates fixture, run, observe, assess,
  rejected cases and shared helpers. Keep expectations outside the agent's
  workspace; normal product requirements/tests remain available to it.
- `tests/support/delivery-evidence-native-payload.sh` installs an independently
  selected payload revision into a generated project. Reuse/expose that narrow
  responsibility with truthful frozen identity; `candidate` alone is not a pin.
- `native-run-supervise.sh`, `native-run-stream.sh`, `native-host-stream.{sh,mjs}`
  and native result/evidence helpers already own host supervision, stream views
  and retained attempts. Preserve existing callers when exposing a seam.
- The Codex dashboard host has actual thread identity and uncertain-start
  semantics, but `LaunchHost` also owns workflow/launch-record responsibilities.
  Reuse a narrow supported host operation if needed, not that whole lifecycle.
- [SEED-345 accounting](../../seeds/SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
  owns reusable history accounting. Supply host-qualified parent/worker session
  inputs to it when available; do not duplicate its token/role attribution.
  Its absence permits an explicitly incomplete measurement, not invented totals.

Follow Accepted ADRs
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one cohesive responsibility and reuse),
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(truthful payload/release identities),
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(maintainer material outside installed payload),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(deterministic counterexamples, actual native evidence, separate assessment and
spent-evidence cleanup), and
[0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
(predeclared quality/gain, whole effort and bounded conclusions).
No Accepted conflict was found; 0007 and 0009 remain Proposed.

## Outside-in proof and decisive premises

Preparation observations: owned checkout `bdb4d096eb6c3b3bf955516f4ed13268034bc41e`,
2026-11-14; scratch setup was removed.
Source/CLI discovery does not establish new case behavior or a native result.

| Premise and consuming operation | Observation, profile and result; unverified remainder |
| --- | --- |
| A payload can be installed independently of a disposable example project | Under Bash 5, sourced `tests/support/delivery-evidence-native-run.sh`, selected `delivery_evidence_payload_revision=9900b8d21922c8cd97ffc9e872e76a0ff59af489`, and invoked `delivery_evidence_create_fixture scheduling "$PWD" codex planned-extraction "$tmp"` in an owned scratch parent. In 1.8s, the generated project commit was `b6165c7ce55486e8f35c91a21eaba582f356ea89`, the selected payload installed, its proof entry was executable and the assessor was absent from the agent workspace. This settles the reusable setup operation only; new case fidelity/paired isolation remain Slices 1–3. |
| The supplier case's original decision is recoverable | The audit and retained handoff at `7fb42349225d05cc2231b6ea20a6c4b36786cc5f` distinguish accepted isolated proof/partial consumer work from missing current-family/natural-load acceptance and a paused supplier with nothing running. The seed cites the original source. Extraction and native continuation remain Slice 1's state-changing probe. |
| Codex can run the case through a supported native entry with identifiable conditions | `codex --version` returned 0.169.0; `codex exec --help` and `codex app-server --help` exited 0, exposing model/configuration and JSON/native transport inputs. Existing one-command launch is not proof of same-session continuation or complete settings/history. Slice 1 observes the actual native boundary, settings and session identity before dependent work. |
| The Doughnut calibration source and proof recipe are recoverable | Read-only `git show` at local Doughnut revision `e257b144d1e9120528922da0f5dc045acb6c9d6d` found the title/alias resolver and maintained six-form destination-ID assertion. Recovered original probe recipes/logs contain the mutation, independent witness and baseline/fault/restored results. `scripts/run.sh` enters a per-worktree Nix profile and project setup/proof is stateful; preparation stopped before building that environment or running project proof. Slice 2 must materialize durable inputs and observe that exact consuming profile. |
| Short cases preserve judgment/proof and repeatable cost | Unobserved. The historical replay's 6m55s wait and original probe times describe other observations, not these extracted cases. Slices 1–2 are permitted early native/stateful probes and measure preparation/run duration; failure stops dependent orchestration and triggers an in-scope replan or human scope decision. |

Only native/stateful observations can settle the remaining case hypotheses.
Each is bounded by its early qualification slice; do not assume success to size
later work. No developer-operated instrument is currently required. A native
trust/credential decision, if encountered, retains its ordinary human owner.

| Source example / final promise | Owning slice and observable proof |
| --- | --- |
| Two real cases retain origin, smallest faithful context and separate acceptance | 1–2: materialize from durable inputs in fresh projects; actual Codex task decisions and proof, plus wrong-decision assessor counterexamples. |
| Exact paused-supplier decision and proof survive controlled events | 1: unchanged/nonqualifying evidence preserves consumer state; qualifying evidence reaches the same owner, with one observed correct continuation or an explicitly failed arm. |
| Real calibration catches fault and passes restored proof | 2: maintained destination-ID failure, six-form controller witness, restored pass and source restoration in the named project profile. |
| Selection tags, independent payload/project pins, matched fresh native runs | 3: maintainer entry selects either case, records criteria/settings, runs both isolated arms and exposes their exact inputs/results. |
| Outcome/proof before total available effort, unknown measurements explicit | 3: complete Codex comparisons of both cases; counterexample with fewer requests but missing proof cannot produce an equivalent-success/improvement verdict. Include preparation, recovery and human intervention. |
| Refresh and recover the earlier case/comparison basis | 4: change setup/assessment, rerun, recover the old basis from Git and show neither report is relabeled; unavailable old environment stays explicit. |
| Invalid inputs, interrupted arms and unavailable evidence are truthful | 5: preflight prevents a paid launch on invalid inputs; command-level interruption/missing-stream/missing-measurement cases retain per-arm facts and unknowns. |
| Deterministic CI, on-demand native behavior, retained examples and ADR review | 3–5: deterministic runner/assessor entry remains unpaid by default; actual native observations stay separate; maintained usage/cleanup guidance and evidence-based ADR 0005 review. |

## Ordered slices

### 1. Qualify the paused-supplier decision in a native Codex case
Type: Behavior
Status: done
Proof: One isolated native qualification journey and discriminating assessor cases.

Extract the original consumer/supplier situation into durable maintenance case
inputs. Retain partial consumer work, accepted proof and the exact missing
supplier outcome. Drive controlled unchanged, nonqualifying and qualifying
evidence after observable case states; never reproduce an overnight wall wait.
Give the agent a neutral task that leaves its decision to it. The external
observer/assessor must distinguish a diagnostic pass or publication from genuine
requirement satisfaction, and check preserved work/proof plus correct ownership.

Use the smallest supported Codex route and existing helpers to observe actual
hold/event/continuation, settings and session association. The controller supplies
environment evidence, not the correct decision or missing product resume logic.
At least one qualified path must show the intended decision and continuation;
a baseline's wrong task outcome can later remain a valid comparison result.
Do not implement the separate resume story here. If no available route/payload
can expose the required journey, stop dependent work and revisit the approach
or necessary supplier agreement rather than declaring a stub native proof.

Bound qualification to this journey and its cheapest diagnostic follow-up.
Show a plausible premature-resume/wrong-proof decision fails assessment, using
the existing declared-signal counterexample convention. Record source/extraction
identity, prerequisites, tags, preparation and native duration, actual conditions
and limits. Failure to preserve judgment, associate the owner or avoid duplicate
continuation stops the dependent runner design; preserve evidence and replan.

### 2. Qualify the real Doughnut verification calibration
Type: Behavior
Status: done
Proof: Native Codex decision with the maintained failure, independent witness and restored pass.

Materialize the pinned Doughnut source/required environment from durable case
inputs; extract required recipes from temporary original evidence so runtime
depends on neither a personal checkout nor a `/tmp` directory. Retain the real
title-before-alias resolver/controller seam and six authored forms. Run through
the project's recorded environment/setup and proof entry; isolate per-arm writes,
database/cache ownership and cleanup as that project requires.

Start from `./scripts/run.sh pnpm backend:test_only`: observe baseline proof,
the real union fault's destination-ID failure, independent six-form witness,
restored passing proof and byte-identical source restoration. Any shorter setup
or proof needs qualification against those observations; do not replace them
with an assessor accepting the agent's report alone. Leave verification judgment
in the neutral task instead of handing the agent the expected answer.

This is the early stateful/native probe for calibration fidelity and cost.
Bound it to one qualification journey and cheapest diagnostic follow-up; missing
environment, a green faulted assertion, lost witness or unavailable restored
proof stops dependent calibration use. Retain actionable evidence, replan and
seek human direction only for a changed promise or required authority. Record
project/case identity, prerequisites, tags and measured preparation/native times.

### 3. Run a selected matched pair and judge its outcome before effort
Type: Behavior
Status: done
Proof: Maintainer command-level journey plus actual complete Codex pairs for both cases.

Expose an on-demand case listing/selection and paired-run entry over the qualified
cases. Freeze one case/project/task/event basis for the pair, materialize fresh
arms, install each independently identified payload and explicitly select/record
matched host/model/effort/relevant settings. Predeclare factor, expected gain and
quality criteria; retain actual differences/unknown conditions. Use neutral agent
paths and keep assessor expectations outside both workspaces.

Capture host-qualified coordinator/worker associations and recoverable native
evidence. Assess each arm from observations and decisive artifacts, then present
outcomes/proof and available effort, including preparation/recovery/interventions.
Integrate existing accounting if available; otherwise show supported workflow
counts and unavailable fields without duplicating native token attribution.
One pair supports its observed comparison, not general savings or quota claims.

Prove isolation/provenance through the public command: distinct frozen payloads
on one project basis, mutation in one arm leaves the other unchanged, a complete
result carries exact case/project/payload/settings/session identities, and a
cheaper arm with missing decisive proof cannot count as equivalent success.
Run actual Codex pairs for both cases; substitutes prove deterministic plumbing
only. Reuse/expose shared helper seams and preserve their existing consumers.

### 4. Refresh a case and recover its earlier comparison basis
Type: Behavior
Status: done
Proof: Version-change/recovery journey through the same maintainer entry.

Revise one case's setup or assessment, run the new version, and recover the
earlier case/project/payload basis and report from retained Git identities.
Preserve the old result even when environmental drift prevents its rerun; state
that limit rather than rewrite the observation. Do not create a second revision
registry or lifecycle alongside ordinary Git evidence.

### 5. Retain truthful results when a comparison cannot finish
Type: Behavior
Status: planned
Proof: Invalid-input and interrupted-evidence journeys through the same maintainer entry.

Exercise invalid/unrecoverable inputs before any native launch, an interrupted
arm, absent/stale native stream and unavailable effort evidence. Retain per-arm
observations and the comparison basis, name missing results/measurements, and
give actionable recovery without manufacturing proof or resubmitting uncertain
native work blindly. Expected task/fault outcomes are data; a broken or flaky
runner, assessor or harness test remains a defect under the project policy.

Document selecting/running both cases, supported Codex conditions, case refresh,
evidence retention/cleanup and measurement limits in maintained maintenance
guidance. Keep routine CI/local proof deterministic and native runs opt-in.
Review ADR 0005's provisional A/B guidance against the complete observations:
record whether it fits and any evidence-backed change recommendation; humans
own amendment/acceptance. Revisit the cited North Star during normal wrap-up.

## Current decisions, verification and concern review

- No blocking dependency is assumed. The accounting story owns its collector;
  the resume story owns missing product behavior. Early probes establish what
  the cases can actually exercise before a new dependency is justified.
- Follow [the project's failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written for every local and published failure and every delegation/repair
  handoff. Base attribution is no exemption; preserve an exact active repair
  owner's files and identify that remaining gate instead of duplicating it.
- Before changing tests, resolve their source paths through installed
  dough-makeme and, for browser tests, dough-page-objects and `intent.locations`.
  Prefer existing command/runtime boundaries; no browser test is currently
  needed. Wait on observable events or controlled clocks, never wall sleeps;
  no `test.slow()` or suite/hook timeout overrides.
- Local gates: affected command/helper consumers and native assessor
  counterexamples, focused case proof, required native qualification/pairs,
  applicable lint/typecheck and normal refactoring/review before commit.
  Exposure of shared helpers includes their existing fixture-family consumers.
  Full runs follow [resource admission](../../../Distribution/tests/local-test-resources.md).
  On fully awake macOS use `caffeinate -s -i` for long/full runs on AC power;
  on battery plug in, or use the maintained lid-open `caffeinate -i` alternative
  and inspect the sleep log. Own published CI through the applicable final
  revision; CI configuration alone adds no unrelated local full-suite gate.
- Candidate reuse seams at preparation: payload helper 30 lines, host stream
  reader 223, delivery-evidence runner 229, native supervisor 235, publication
  native runner 250. Keep new case orchestration outside unrelated runners.
  If an edit implicates a file over the 250-line refactor check, settle its
  cohesive reorganization and consumers in that slice before implementing.
- Slice-plan refinement retained Slices 1–3 and split the former final slice
  into independent refresh/recovery and incomplete-result outcomes: five
  Behavior slices, no sizing exception or resplit recommendation. The model
  stays one versioned case and pair, without per-case orchestration copies.
- No remaining slice-boundary or cumulative-design concern was identified.
  Native/stateful premises remain unproved, bounded by permitted early probes
  in Slices 1–2; their failure stops dependent work rather than weakening proof.

## Learnings

- **Slice 1 accepted (2026-11-14).** Case `tests/native-comparison/paused-supplier/`
  (provenance, overlays, neutral `task.txt`/`wake.txt`, `case.bash`, `assess.bash`),
  case-agnostic runner `tests/support/native-comparison-run.sh` and unpaid entry
  `tests/native-comparison.sh` (`--native codex --case NAME` for a paid run). Focused
  proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/native-comparison.sh
  tests/native-assessor-counterexample-guard.sh tests/native-stream-replay.sh
  tests/support/native-host-stream.test.mjs tests/native-evidence-identity.sh` (rc 0
  after refactor); consumers of the changed `native-codex.sh`/stream reader (34 files) passed.
- **Native qualification observed.** One paid Codex 0.169.0 journey, `codex exec` then
  `codex exec resume`, one thread over four turns, `gpt-6.1-sol`/`xhigh`, sandbox
  `danger-full-access`, approval `never`, user config ignored. The agent held through
  the diagnostic pass, an unchanged wake and an early publication ("Early publication
  does not satisfy the recorded dependency"), then integrated the qualifying supplier
  once, filed slice 3 and passed proof. Preparation 0.8s; turns 139.8/67.4/63.0/1021.8s
  (total 21.6 min, load ~4, AC power). Same-session continuation premise settled.
- **Observer corrections re-derived, not observed live.** The run-time agent-proof field
  matched command output text and the `once` fields (G1) were added after the run; both
  were re-derived from the retained streams/final state and reassessed (pass). The
  retained record's case-file hashes therefore predate the committed case; agent-facing
  inputs are unchanged. A repeated wake after continuation is not exercised.
- **For Slices 2–5.** `--ignore-user-config` drops the configured model, so pairs must pass
  model and effort explicitly. Token usage sits in retained streams/rollouts for SEED-345;
  the retained `codex-session.jsonl` holds account ids and stays local. Payload identity is
  currently an installed-file digest plus `candidate`/revision (`source-dirty` recorded);
  Slice 3 owns frozen independent pins. Fixed Git dates make basis SHAs deterministic
  across materializations. Substitute mode still lets `native-codex-session.mjs` search the
  real `~/.codex/sessions` (no match possible); isolate it when Slice 3 touches the reader.
  `tests/native-family-layers.md` does not yet list this family (Slice 5 guidance).
- **Slice 2 accepted (2026-11-14).** Case `tests/native-comparison/doughnut-title-precedence/`
  materializes Doughnut `e257b144` from the public upstream into a detached arm worktree
  with its own Gradle home, pnpm store, temp dirs and a per-arm database, then runs
  `./scripts/run.sh pnpm backend:test_only`. Unpaid proof
  `tests/native-comparison-doughnut-title-precedence.sh`; the runner gained optional
  `case_cleanup`/`wake.txt`, stop-on-failed-materialize and `case-evidence` retention;
  `delivery_evidence_install_payload` now returns the installer status.
- **Doughnut qualification observed.** Unpaid reference run: preparation 57.0s, baseline
  3,111 pass (139s), union fault six maintained failures incl. `every item is <490>` with
  six-form witness `destination=null` (121s), restored 3,111 pass (100s), source hash
  unchanged; total 421.7s. Paid Codex journey 2 (diagnostic follow-up after run 1 could
  not start Nix from a `/var/folders` arm): the agent found the assertion, wrote its own
  witness and ran baseline/fault/restore, verdict "Caught"; preparation 66.5s, turn
  764.9s at load ~14. Its live verdict failed only on a harness detector matching the arm
  path; re-derived with the neutral path it passes (no harness source read). Raw
  per-test records of that run were not retained.
- **For Slices 3–5.** Arms that run Nix must live outside `/var/folders` (`mktemp -d`
  ignores TMPDIR on macOS); arm paths must not contain `native-comparison`. Java, zsh
  here-documents and JVM attach write outside TMPDIR (case exports them; Codex sandbox
  allows the attach files). A Doughnut arm is ~4 GB and ~1 min to prepare. G2: arms use the
  developer's MySQL on `127.0.0.1:3309`; Slice 3 owns arm isolation from live projects.
- **Trunk test-shares (heads-up from SEED-334 follow-up).** Trunk now runs `npm test` in
  four CI shares and refreshed `tests/longest-first`. Before integrating, after taking in
  trunk, preview new `tests/native-comparison*.sh` jobs with
  `node scripts/test-shares.mjs preview --split-count 4` (`tests/test-shares.md`).
- **Slice 3 accepted (2026-11-14).** `tests/native-comparison.sh` is the maintainer entry
  (`--list`/`--where` catalog from case.md traits, single journey, pair mode with
  `--baseline`/`--candidate` frozen commits and predeclared `--factor/--gain/--quality`);
  pair orchestration, verdict judge and catalog live in `tests/support/native-comparison-{pair,verdict,catalog}.sh`.
  Compact tracked records `tests/native-comparison/*/comparisons/20261114T045440-*.txt`
  hash every case input plus the pair and verdict modules: keep those bytes until a
  refresh deliberately reruns, and recover earlier bases through Git (Slice 4).
- **Actual pairs (concurrent arms, release v0.3.98 `ad7aa7d` vs trunk `91f32d39`, Codex
  0.169.0 gpt-6.1-sol/xhigh).** Paused-supplier: preserved (both pass; candidate −10
  commands, +66.4s; 3 workers per arm). Doughnut: improved — the baseline arm ran full
  suites and reported Caught but instrumented production code during its fault run, so
  its witness was not independent and the assessor failed it per the skill's "introduce
  one fault"; the candidate passed with focused proof (7 tests). `dough-intent-coverage`
  is identical in both payloads, so that verdict is one stochastic observation, not
  attributable to the factor. Tokens/cost unavailable until SEED-345 accounting.
- **G2 settled.** Doughnut arms clone a fresh primary checkout and run an arm-owned
  mysqld via the project's own `mysql_nix_shared.sh`; the sandbox denies TCP 3309/6380.
  A unix-socket connection to the live server is not denied.
- **Trunk taken in after Slice 3.** Trunk `e54f80318` (951f66a76 moved `tests/` and
  `src/` under `Distribution/`) was merged into the branch. The family now lives under
  `Distribution/tests/` with repo-root `source_dir`; earlier plan/source-review paths
  `tests/...` mean `Distribution/tests/...`. Path retargeting edited hash-bound runner,
  pair, case and helper files, so the Slice 3 records' bases are recoverable at
  `9c20a808` rather than from the current tree (Slice 4 demonstrates this). Focused
  family proof and both helper-consumer sets passed on the merged state; the test-share
  preview keeps ~193s headroom per share with four unrecorded jobs.
- **Branch CI repair for the merge (run 43562552359).** `Distribution Tests (2/4)` failed
  at `native-comparison.sh:184`: the substitute-rule commit still wrote to
  `payloads/src/skills/...`, absent after the move. The pre-commit merge proof passed only
  because the substitute pair fixture clones the checkout's committed HEAD for payloads,
  which was still the old layout; prove a merge after committing it. The repair
  (`Distribution/src/skills/...`) rides with Slice 4's delivery, since no writer was live
  and the fix sits inside Slice 4's moved pair fixture.
- **Slice 4 accepted (2026-11-14).** Pairs now refuse an uncommitted case or harness input
  before payloads freeze, and records name `case-basis-revision`. `native-comparison.sh
  --recover RECORD` follows the record's Git history, verifies or searches the revision
  whose inputs match the recorded hashes, states payload/tag/host drift as `rerun-limit`
  without rerunning, and prints the report unchanged. The real Slice 3 records recover to
  `9c20a808` (their named `e4c7cbe3` lacks inputs). The paused-supplier assessment was
  refreshed to fail rerouting the partial slice around the supplier's reader; H1–H5 were
  applied. No paid run: no agent-facing input changed. Recovery does not check the project
  basis or its services.
- **Follow-up outside this story.** About 12 test-support `.mjs` entries compare
  `process.argv[1]` with `fileURLToPath(import.meta.url)` and print nothing when run
  through a symlinked path (macOS `/var` → `/private/var`); the pair fixture uses
  physical paths. A shared real-path "is main module" helper is unrelated cleanup.
- **Branch CI repair (run 43566074090, on Slice 4's `ff3ce589`).** `e2e / shard 2/6`
  received two `compare` calls in `unchanged-assignment-credit.spec.ts`: a dashboard read
  arriving between the compare answer and the commit answer of `PinnedMemo`'s
  touched-files lookup asked compare again. The lookup now shares one outstanding read
  per key through the existing `OutstandingReads` helper; a held-commit backend test
  failed 10/10 before the fix. Unrelated to this story's family; repaired under the
  failure policy.
- **Deferred hash-bound cleanups for Slice 4's refresh rerun.** The records also hash the
  runner, `native-codex.sh` and `native-codex-session.mjs`. The Slice 3 refactor left:
  H1 duplicated load sampling in the runner; H2 source revision/dirty logic repeated in
  runner and pair; H3 the arm verdict file layout read twice in the pair module; H4 a
  condition loop variable named `arm` (pair line ~161); H5 a stale runner header comment
  about who installs the substitute.


## Story obligations

### G1. Assessor does not observe a single continuation
Reported: slice 1 — "Coordinator acceptance of slice 1 found assess.bash checks turn-4 reader/slice3/proof fields but counts no merges or slice-3 commits, so a duplicate continuation in turn 4 would pass"
Story clause: "On a qualifying change it observes whether the right work continues once with its proof"
Disposition: proved by slice 1: assess.bash `once` signal requires turn-4-supplier-integrations and turn-4-slice3-filings of 1; tests/native-comparison-paused-supplier.sh duplicate substitute journey fails with filings 2 and rejected cases integrated-twice/filed-twice; retained native run re-derived 1/1 and still passes
Commitment: E2d


### G2. Doughnut arms write into the developer running MySQL (first reported in slice 2)
Reported: slice 2 — "Slice 2 return: Doughnut arms create and drop per-arm doughnut_wt_<id>_test databases on the developer running MySQL at 127.0.0.1:3309, whose datadir is inside a personal Doughnut checkout; the case refuses without that server"
Story clause: "isolate arm writes from each other and live projects to prevent contamination"
Disposition: proved by slice 3: doughnut case.bash starts an arm-owned mysqld under the arm root on free ports via the project's mysql_nix_shared.sh, arm-database.gradle injects its URL, the Codex sandbox denies TCP 3309/6380; unpaid reference run g2ref reproduced Slice 2's baseline/six failures/witness/restored pass with LIVE_DENIED 3309/6380, and both paid Doughnut arms printed cleanup: database-server-stopped. Not denied: a deliberate unix-socket connection to the live server
Commitment: 11b