# Close the assessor counterexample discipline's remaining gaps

## Source and authority

- **Identity:** SEED-055#assessor-counterexample-gaps
- **Source:** [story](../../seeds/SEED-055-trustworthy-project-proof.md#assessor-counterexample-gaps),
  a bounded correction from the execution retrospective of
  SEED-055#assessor-counterexample-discipline
  (plan 165 at `e2ffbea5:.planning/slice-plans/165-assessor-counterexample-discipline/PLAN.md`, reviewed
  commits `a53aa489..c6440780`: `84b4f28f`, `efcc802d`, `17ed1929`,
  `8819a380`, `00cc1b62`, `66f96e34`, `63429452`, `abf2fc4f`, `c6440780` on
  `claude/assessor-counterexample-discipline`). It adds no feature promise.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

The maintainer paying for native acceptance runs can trust that plan 165's
discipline holds where it claimed to. The guard catches the remaining ways a
test can expect a rejection outside the helper. The preparation assessor is
proved to refuse a response that only claims setup. Every CI completion
scenario has a passing base and rejected cases, including a skipped gate for
`ready`. The publication assessor reads fields regardless of their order. The
re-observed suites state their cases in one helper form.

### Current findings (re-observed while planning)

1. **Guard false negatives.** `tests/support/native-assessor-counterexample-guard.sh`
   passes a probe suite that holds each of these after an assessor call:
   - a bare `[[ ${git_publication_assess_status} != pass ]]`;
   - `x_assess obs && {` with `FAIL` on the following lines;
   - `x_assess obs || rc=$?; [[ ${rc} -ne 0 ]]`;
   - `if ! x_assess obs; then :; else FAIL; fi`;
   - verdict wrappers not named `expect*` (`assert_status fail …`,
     `check_verdict inconclusive …`).

   In the tree, `assert_status` in `tests/native-journey-state.sh:45-63` and
   `tests/native-adr-behavior.sh:35-50` accept any expected verdict. Today
   their callers pass only `pass`.
2. **Preparation self-report is unproved.** Plan 165 slice 3 dropped
   `self-report`. It held that no one-signal case exists. There is one: from
   `fresh-pass.json` with a setup-claiming `responseText`, only the
   `preparation-gate` fields change, and the assessor rejects the result. ADR
   0005 §4: do not accept self-report.
3. **CI completion covers only `pending`.** `ci_completion_assess` also
   judges the paid `ready`, `failure`, and `skip-retro` scenarios
   (`tests/git-publication-native.sh` usage). Only `pending` has a free
   passing base and rejected cases. The story promises a gate-skipped case
   for every assessor whose journey publishes a gate.
4. **Field order changes a publication verdict.**
   `git_publication_assess_field` (`tests/support/git-publication-native-assess.sh:18-27`)
   matches `*key: *` anywhere in a line. It then strips the prefix only on a
   start match, so `remote-sha` placed after `trunk-remote-sha` reads the
   whole `trunk-remote-sha: …` line. `native_assessor_rejects_fields` appends
   replaced fields at the end, and the field diff ignores order.
5. **Contradictory duplicate.** CI completion's `forced-stop` case sets
   `forced-stop: true` alone. The comment on its own signal says a fixture
   forced stop always records `product-shutdown: false`.
   `fixture-masked-shutdown` is the realistic coupled case.
6. **Residue.**
   - Three wrapper pairs differ only in the observer command:
     `owned_context_passes/_rejects`
     (`git-publication-native-owned-context-suite.sh:56-67`),
     `one_shot_passes/_rejects` (`-one-shot-counterexamples.sh:21-33`), and
     `escalation_passes/_rejects` (`-one-shot-escalation.sh:128-140`).
   - Signals for `git_publication_assess_admission_closure` and
     `_correction` are declared at the dispatcher
     (`git-publication-native-admission.sh:100-121`). The queued one-shot
     closure's signals are declared at `git_publication_assess_one_shot`
     (`git-publication-native-one-shot.sh:125-135`). Those assessors'
     headers do not say where their signals live.

### Preserved promises and constraints

- Every rejected case changes one declared signal of a passing observation
  of the same assessor (story, plan 165).
- The helper and guard run only in the free suite. No gate is added to the
  paid native runner. No new paid runs.
- `tests/git-publication-native.sh` stays under `per-job-seconds=71`
  (`tests/time-budget`).
- Files stay under 250 lines. `execution-worktree-prep-native-assess.mjs` is
  at 246 lines and gains nothing here.
- Existing cases keep their verdicts, except where a finding repairs one.

### Excluded

Out of scope; homed at wrap-up:

- `trunk_closure_assess` never reads `response-completion-result`.
- `native_journey_state_assess` never reads
  `other-tool-root-claude-preserved`.
- The prose `inconclusive` path has no rejected case.
- `git_publication_assess_print_fields` is dead.

Also out of scope: detecting mechanically that a change loosens an assessor.
Plan 165 excluded that too.

Considered and left out: moving admission and queued closure signals into the
sub-assessors' files. The helper reads signals from the one file a suite
names, and each suite names the dispatching assessor. Moving the signals would
make the helper read several files for no behavioral gain. Each sub-assessor's
header states where its signals live instead.

## Current decisions

- **Anchor, don't reorder.** `git_publication_assess_field` matches
  `"${key}: "*` at line start, as `delivery_evidence_obs_get` does. Indented
  response lines then can never stand in for a field.
- **One re-observed helper form.** The helper gains one form that runs an
  observer command into the candidate and then calls `native_assessor_rejects`,
  for example `native_assessor_rejects_observed CASE SIGNAL CANDIDATE OBSERVER...
  [-- STATUS [FRAGMENT]]`. The git-publication suite support gains its pass
  counterpart, which re-observes, assesses, and requires a pass with a reason
  fragment. The three suites keep a one-line local observer function and call
  the shared forms.
- **Generic wrapper rule.** Joining backslash continuations first, the guard
  flags any command, other than echo, printf, an assignment, `local`, or
  `return`, that has an argument word equal to `fail`, `inconclusive`, or
  `pending`, bare or wholly quoted. Commands named `native_assessor_rejects*`
  are the exception. After slice 1, only those helper forms pass verdict
  literals (read-only survey while planning). A quoted phrase such as
  `'a stop pending resolution'` is not a verdict word.
- **Pass-only local wrappers.** Both `assert_status` functions lose their
  expected-verdict parameter and become pass-only, for example renamed
  `assert_passes`.
- **Second preparation base.** The self-report case uses its own passing base
  derived from `fresh-pass.json` with a setup-claiming `responseText`, so the
  existing cases keep their base. A comment beside the case says the
  `self-reported-only` branch (`execution-worktree-prep-native-assess.mjs:63-68`)
  needs the `preparation-gate` and `outcome` signals changed together, so it
  has no one-signal case.
- **CI completion signals.** Add `completion-marker completion-marker` and
  `failure-report failure-reported`. Each scenario's base mirrors the fields
  `ci-completion-native-run.sh` writes.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Guard misses the finding-1 shapes | Probe suite under the job tmp with a bare `[[ status != pass ]]`, `assess && {…FAIL…}`, `assess \|\| rc=$?; [[ rc -ne 0 ]]`, `if ! assess; then :; else FAIL`, `assert_status fail`, and `check_verdict inconclusive`, read by `native_assessor_counterexample_guard` | exit 0: none flagged |
| `assert_status` is called only with `pass` | `grep -rn assert_status tests` | 3 calls in journey-state and 5 in ADR behavior, all `pass` |
| Only helper wrappers pass verdict literals today | grep over the guard's file list for a command with a bare `fail/inconclusive/pending` argument | Only the `escalation_rejects` calls (and the `one_shot_rejects` and `owned_context_rejects` bodies calling `native_assessor_rejects`), plus the quoted phrase in `dough-adr-awareness-delivery-to-use.sh:223` |
| Guard check pins exact flagged lines | `tests/native-assessor-counterexample-guard.sh` `expect_guard_fails` compares the full `FILE:LINE what` list | Yes: the stray fixture's new lines must be added to that list |
| A claim-bearing preparation base passes | `fresh-pass.json` with `responseText` "I ran npm ci and prepared the worktree, then ran npm run prove.", flattened and assessed with `--flat-observation` | `pass / setup then project command before delegation` |
| Its one-signal self-report case is rejected | That base with only `commands`, `traces`, `invocations`, and `executionOwnsInstall` changed (the `preparation-gate` fields, 4 lines differ) | `fail / missing setup or project-command trace` |
| `self-reported-only` needs two signals | `assessNativePreparation:63-68` requires no setup evidence and `!hasFsOutcome`, which needs `greeting` absent too | Two signals: `preparation-gate` plus `outcome` |
| CI completion bases and cases for the other scenarios | Probe observations assessed with `ci_completion_assess`: `ready` base; `ready` with `review-complete` before `coverage-terminal`; `failure` base; `failure-reported: false`; `completion-marker: 1`; `skip-retro` base; `review-started: true` | Bases pass; each candidate returns 1. No assessor repair expected. |
| Real observer fields | `ci-completion-native-run.sh:50-67` | Writes the same field list as the `pending` base writer |
| Field order changes a publication verdict | `git_publication_suite_obs` passing observation, then `remote-sha` moved last | `pass` becomes `fail / remote tip does not accept the candidate` |
| Anchoring changes no existing verdict | `git archive HEAD` copy with the match anchored; `bash scripts/test.sh tests/git-publication-native.sh tests/git-publication-native-owned-context.sh tests/git-publication-native-one-shot.sh tests/native-assessor-counterexamples.sh tests/native-assessor-counterexample-guard.sh` | exit 0. Times: 54.1 s, 20.5 s, 15.6 s, 0.3 s, 0.2 s. The reordered observation passes. |
| `git_publication_assess_field` callers | `grep -rln git_publication_assess_field tests` | 12 files under `tests/support/git-publication-native-*`, all exercised by the three jobs above |
| Wrapper pairs differ only in observer | Read the three pairs | Yes. Escalation also passes its verdict through, and owned-context writes `${obs}.$1`. |
| Signal placement | Read the admission dispatcher (`:90-121`), the closure and correction headers, and `git-publication-native-one-shot.sh:122-135` plus the queued header | Dispatcher comments name the branches; sub-assessor headers do not |
| Budget and sizes | `tests/time-budget` 71 s. `wc -l`: the helper 200, guard 137, stray 54, guard check 71, CI completion assess 112, preparation cheap 228, owned-context suite 234, escalation 203, one-shot counterexamples 135, suites 103 | Headroom about 17 s on the publication job; every target file has room |

## Promise → proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Re-observed cases use one helper form; dispatched assessors name where their signals live | 1 | `tests/git-publication-native-owned-context.sh`, `tests/git-publication-native-one-shot.sh`, and `tests/git-publication-native.sh` green with unchanged cases |
| Publication fields read in any order (finding 4) | 2 | A reordered passing observation passes in `tests/git-publication-native.sh` (fails before the change); the three publication jobs stay green |
| Self-report alone is rejected (finding 2) | 3 | `tests/execution-worktree-preparation-native.sh`: claim-bearing base passes, `self-report` (signal `preparation-gate`) rejected with `missing setup or project-command trace` |
| Every CI completion scenario has a base and rejected cases; `ready` has a gate-skipped case (finding 3) | 4 | `tests/git-publication-native.sh`: `ready`, `failure`, and `skip-retro` bases pass, and their cases are rejected through the helper |
| No contradictory forced-stop case (finding 5) | 4 | `forced-stop` removed; `fixture-masked-shutdown` stays rejected |
| Guard names the finding-1 shapes and generic verdict wrappers; local wrappers are pass-only (finding 1) | 5 | `tests/native-assessor-counterexample-guard.sh`: tree green, and the extended stray fixture flagged on exactly its listed lines; `tests/native-journey-state.sh` and `tests/native-adr-behavior.sh` green |
| Publication job within budget | 2, 4 | Job time from the slice run against 71 s |

## Slices

### 1. Re-observed rejected cases share one helper form
Type: Structure
Status: planned
Proof: `bash scripts/test.sh tests/git-publication-native-owned-context.sh tests/git-publication-native-one-shot.sh tests/git-publication-native.sh tests/native-assessor-counterexample-guard.sh`
green, with the same case names.

Internal change: the helper gains the re-observed rejection form, and
`tests/support/git-publication-native-suites.sh` gains its pass counterpart.
The owned-context, one-shot, and escalation suites replace their wrapper pairs
with these forms and keep only their observer command. The headers of
`git-publication-native-admission-closure.sh`,
`git-publication-native-admission-correction.sh`, and
`git-publication-native-one-shot-queued.sh` say that their rejected-case
signals are declared beside the dispatching assessor, which the suite names
to the helper. This removes the duplicated test-suite wrappers (finding 6) and
leaves slice 5's guard only helper-named commands that pass verdict literals.

### 2. The publication assessor reads fields in any order
Type: Behavior
Status: planned
Proof: `bash scripts/test.sh tests/git-publication-native.sh tests/git-publication-native-owned-context.sh tests/git-publication-native-one-shot.sh`
green, with the new case, which fails before the change.

Behavior: given a passing publication observation with `remote-sha` moved
after `trunk-remote-sha` → `git_publication_assess` → pass, with the same
reason as the original order. `git_publication_assess_field` matches the key
at line start. The case sits beside the publication counterexamples as a
required pass. Every existing case keeps its verdict and fragment.

### 3. A preparation response that only claims setup is rejected
Type: Behavior
Status: planned
Proof: `bash scripts/test.sh tests/execution-worktree-preparation-native.sh tests/native-assessor-counterexample-guard.sh`
green.

Behavior: given a passing preparation observation whose response claims
`npm ci` and a prepared worktree → the `self-report` case changes only the
`preparation-gate` fields → the assessor rejects it with `missing setup or
project-command trace`. The claim-bearing base is its own passing base. The
comment beside the case says `self-reported-only` needs the gate and the
outcome changed together.

### 4. Every CI completion scenario has a passing base and rejected cases
Type: Behavior
Status: planned
Proof: `bash scripts/test.sh tests/git-publication-native.sh tests/native-evidence-identity.sh tests/native-assessor-counterexample-guard.sh`
green, with the publication job under 71 s.

Behavior: `ready`, `failure`, and `skip-retro` passing observations pass
`ci_completion_assess`. Through the helper:

- `ready` with `review-complete` before `coverage-terminal` is rejected
  (signal `control-order`), the gate-skipped case.
- `failure` with `failure-reported: false` is rejected (signal
  `failure-report`).
- `failure` with `completion-marker: 1` is rejected (signal
  `completion-marker`).
- `skip-retro` with `review-started: true` is rejected (signal
  `review-started`).

The lone `forced-stop` case is removed, and `fixture-masked-shutdown` stays.
If a case passes, repair the assessor in this slice and name the repair.

### 5. The guard names every remaining rejection shape
Type: Behavior
Status: planned
Proof: `bash scripts/test.sh tests/native-assessor-counterexample-guard.sh tests/native-journey-state.sh tests/native-adr-behavior.sh tests/native-assessor-counterexamples.sh`
green.

Behavior: the stray fixture gains each finding-1 shape and a generic wrapper
call with a verdict literal. The guard check then requires exactly those
added lines to be flagged, beside the existing eight, and allowed shapes stay
unflagged. The allowed shapes include a required-pass `if [[ status != pass ]];
then FAIL`, `native_assessor_rejects* … fail`, and a quoted phrase containing
"pending". Both `assert_status` functions become pass-only. The guard over the
tree stays green.

## Local gates

- Run changed checks through `scripts/test.sh` with Bash 5 first on PATH
  (`tests/README.md`; macOS system Bash hides `set -e` assertion failures).
  Also run the guard and awk-based helper checks with mawk as `awk`, as plan
  165 did.
- Run `dough-post-change-refactor` before each commit, as this repository's
  practice requires.
- Judge `tests/git-publication-native.sh` against `per-job-seconds=71` at
  slices 2 and 4.
