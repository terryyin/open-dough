# Prove assessors on the verdicts they newly admit

## Source and authority

- **Identity:** SEED-055#assessor-counterexample-discipline
- **Source:** [story](../../seeds/SEED-055-trustworthy-project-proof.md#assessor-counterexample-discipline),
  refined with Terry on 2026-09-29. He chose a shared helper with a guard, a
  widening rule plus permanent bad outputs, and a gate-skipped case for every
  gated journey. Findings:
  [ProjectFindings.md](../../../ProjectFindings.md#native-acceptance-harness-observations-that-do-not-match-what-the-native-agent-did-first-priority)
  (DD-160, DD-175, ODF-087's harness facet).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

Every native assessor's rejected cases go through one helper. The helper builds
each case from a passing case of the same assessor plus a change to one
declared signal, and it refuses anything else. Each suite covers its journey's
published gates with a gate-skipped, outcome-correct case. A guard keeps new
rejected cases in the helper, and `tests/native-publication.md` states the
widening rule.

Key examples (from the story):

1. DD-160: the escalation passing case with the `--one-shot` start and the
   carried edits both removed → the helper refuses it, naming both signals.
   Split into single-signal cases, each one is accepted by the helper and
   rejected by the assessor.
2. Coupled fields: `missing-remote` changes `remote-accepted` and `remote-sha`,
   both declared under one signal → accepted as one signal.
3. Guard: a new suite that calls a rejection primitive on a hand-written
   observation → the free suite fails, naming that file.
4. DD-175: the closure response rows, including "Trunk CI passed. The watcher
   failed to start.", are rejected cases under the response signal. A widened
   response check that accepts one fails the free suite.
5. ODF-087: a preparation observation with the greeting written but no setup
   or project command → the assessor rejects it, as a gate-skipped case.

Excluded (story): mechanically detecting that a change loosens an assessor;
new paid runs; replay of real host output (plan 163). The helper and guard
run only in the free suite; nothing gates the paid native runner.

Considered and left out:

- Product-backlog native `use`/`take` assert inline in live runs and have no
  assessor function or free rejected case (`product-backlog-native-use.sh:138-216`,
  `-take.sh:102-220`), so the helper has nothing to wrap there.
- Native delivery updated-use substitutes assert `assessment-status: not-run`.
  That is a runner outcome, not an assessor rejection; its assessor,
  `native_journey_state_assess`, is migrated in slice 3.
- Two assessor weaknesses the survey found that are outside counterexample
  discipline are reported, not fixed. `trunk_closure_assess` never reads the
  `response-completion-result` it observes. The git-publication prose check's
  `inconclusive` path has no rejected case.

## Current decisions

- **One rule for every kind of case.** A rejected case is `(assessor,
  passing observation, candidate observation, signal)`. The helper assesses
  the passing observation once per suite and requires a pass. It computes the
  fields that differ between the two observations, including added and
  deleted fields. It requires that set to be non-empty and within the named
  signal's fields. It then requires the assessor not to pass the candidate,
  and checks an expected status and reason fragment when the case gives them.
  How the candidate was produced does not matter: overrides, a `sed` edit, or
  a mutated real fixture that is re-observed. That keeps real-state suites
  such as the escalation suite under the same rule.
- **Signals are declared beside the assessor.** Each assessor file carries
  lines such as `# assessor-signal: remote-acceptance remote-accepted remote-sha`.
  For `.mjs`, the comment is `// assessor-signal:`. The helper reads them from
  the file named in the call. A changed field that no signal declares is
  refused, and the refusal names that field. `response` is a signal field: a
  response-text case supplies its response as the candidate's `response`
  field, against the passing observation.
- **Shell and awk, not Node, for the diff.** `tests/support/native-assessor-counterexample.sh`
  holds the helper. An awk field diff costs about 1.5 ms, while a Node start
  costs about 20 ms. With about 150 cases, a Node diff would add seconds to
  `tests/git-publication-native.sh`, which is the job nearest the budget. The
  JSON preparation observations are flattened once per file to `key: <json>`
  lines by a small Node step in their own suite.
- **Multi-field cases are split or declared, never waved through.** Coupled
  fields that express one fact (for example workspace plus branch, or
  `control-order` lines) become one declared signal. Independent fields split
  into separate cases. If a split case passes the assessor, the assessor has
  a DD-160-shaped defect: repair it in that slice and name the repair. If one
  signal alone is legitimately acceptable, that case stops being a rejected
  case. A missing-fields case deletes one required field instead of several.
- **Old primitives go.** Once every suite is migrated,
  `git_publication_suite_expect_rejected`, `expect_assess fail|inconclusive`,
  `assert_not_pass`, and `if <assessor> …; then FAIL` loops are removed. The
  guard is a scan in the helper's own check. It fails any `tests/` file
  outside the helper that negates or `if`-tests an assessor call, calls a
  removed primitive, or expects a `fail`, `inconclusive`, or `pending`
  verdict. It names the file and line.
- **Placement.** The helper's self-proof and the guard go in a new free check,
  `tests/native-assessor-counterexamples.sh`. Migrated cases stay in their
  current jobs.
- **Evidence identity follows.** Retained-run identities that hash assessor
  files, such as `trunk-closure-native-run.sh:19-27`, change when signal lines
  are added. That is intended, because the assessor's declared contract
  changed. It creates no new paid run.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Rejected-case styles and counts per assessor | Read-only survey of `tests/` for `_expect_rejected`, `expect_assess fail`, `if …assess…; then`, `assert_not_pass`, and JSON cases | About 150 cases across: publication counterexamples (26), admission trio (28), substitute suite (8), trunk closure (11), owned-context closure (4), story-branch closure (11) plus 7 response rows, startup owned context and preparation-land (18, real-state), one-shot result and queued (25, real-state), escalation (7, real-state), preparation JSON (3), journey state (4), ADR prose (7), delivery evidence (27) |
| Multi-signal cases exist beyond DD-160 | Same survey, field diffs against nearest passing case | Independent: escalation up-front (start and carried), preparation-land raw-git append (`raw-git-retirement` and `retire-command`), claims `unsupported-accept`, consumers `accept-unaligned`, and 3-field gaps/claims/consumers cases. No passing baseline: `claim-race-foreign-accepted`, `single-marker`. Missing-fields cases delete 2–6 fields. |
| Owned-context closure already rejects a skipped gate | `trunk-closure-native-owned-context.sh:92-100`, `trunk-closure-native-assess.sh:95-114` | Yes: `finish-count` must be 1, and `finish-count: 0` is a rejected case (since `9c672fc9`). The story was corrected. |
| Preparation assessor rejects a skipped gate with a correct greeting | `assessNativePreparation` on `fresh-pass.json` with setup and command roles, `traces`, and `invocations` removed | `fail / missing setup or project-command trace`. Only the case is missing. |
| Gated journeys without a gate-skipped case | Survey section 4 | Preparation (setup absent), story-branch closure (no `control-order` reorder case), CI completion (no free case at all) |
| CI completion can be assessed free | `ci_completion_assess` (`ci-completion-native-run.sh:69`) reads only an observation file, and the file is sourced by `tests/git-publication-native.sh:41` | Yes |
| The helper's cost fits the budget | 100 awk diffs: 0.15 s. 20 `node -e 0`: 0.41 s. | Shell helper adds about 0.5 s per job |
| Budget headroom | `tests/time-budget` | `per-job-seconds=71`. The publication job was 40.0–51.4 s recently (seed story 2). |

## Promise → proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Helper refuses a two-signal case and names both (ex. 1) | 1 | `tests/native-assessor-counterexamples.sh` self-cases; the escalation up-front case split and green |
| Helper accepts coupled fields under one signal (ex. 2) | 1, 5 | Self-case, then `missing-remote` through the helper |
| Helper refuses a non-passing base, undeclared field, or no change | 1 | Self-cases, each naming the case |
| Every existing suite goes through the helper | 1–7 | Each job stays green after migration; the guard (slice 8) finds nothing |
| Response rows are single-signal rejected cases (ex. 4) | 2 | Story-branch response rows through the helper; one row flipped to pass fails the job |
| Gate-skipped cases for gated journeys (ex. 5) | 2, 3, 4 | Story-branch `control-order` reorder, preparation setup absent, CI completion review skipped: each rejected |
| Guard names a stray rejected case (ex. 3) | 8 | A counterexample file using a removed primitive fails, naming it |
| Widening rule stated | 8 | `tests/native-publication.md` section |

## Execution learnings

- **Slice 1 (done).** `tests/support/native-assessor-counterexample.sh` holds
  `native_assessor_counterexamples FILE PASSING [--verdict STATUS REASON] -- COMMAND`
  and `native_assessor_rejects CASE SIGNAL CANDIDATE [STATUS [FRAGMENT]]`.
  `git_publication_suite_counterexamples FILE PASSING` in
  `tests/support/git-publication-native-suites.sh` wraps it for
  `git_publication_assess`; closure suites reuse it. Proof:
  `bash scripts/test.sh tests/native-assessor-counterexamples.sh tests/git-publication-native-one-shot.sh`,
  green with BSD awk and with mawk as `awk`. The combined up-front case is
  refused naming `carried-edits, one-shot-start`; split, both halves are
  rejected with no assessor repair.
- **A field may belong to several signals.** Derived fields such as
  `remote-sha`, `trunk-commit-count`, and `workspace-on-claim` move with every
  change to trunk, so each trunk-changing signal declares them. A change is
  still refused when any changed field lies outside the named signal, and the
  refusal names every signal declaring such a field.
- **Observation field syntax.** A field starts at a line `key: ` or `key:`
  (`[A-Za-z0-9_.-]` keys); repeated keys join into one field; other lines
  continue the previous field. A response-text case must keep its response
  lines from looking like `word: text` (indent or escape them) so they stay
  in the `response` field.
- **Cost.** About 2 ms per case; the one-shot job moved from about 21 s to
  22–23 s, within noise.
- `git_publication_assess_field` matches `key: ` anywhere in a line, so
  `remote-sha` can match `trunk-remote-sha:`. Reported, not in scope.

## Slices

### 1. The helper refuses a counterexample that changes two signals
Type: Behavior
Status: done
Proof: new `tests/native-assessor-counterexamples.sh` (helper self-cases on a
toy assessor with declared signals) plus `tests/git-publication-native-one-shot.sh`
green.

Behavior: given a declared toy assessor → a case changing two signals is
refused, naming both. The helper also refuses a case whose base does not
pass, one that changes an undeclared field, and one that changes nothing. A
coupled-field case is accepted, and a case the assessor passes fails, naming
it. The one-shot job's three real-state suites (escalation, result, queued)
declare signals and move to the helper. The escalation up-front case is
refused, then split into "no one-shot start" and the existing "admitted
before editing" (example 1). Workspace plus branch becomes one signal.

### 2. Closure suites reject a reversed control order and failure reports
Type: Behavior
Status: planned
Proof: `tests/git-publication-native.sh` and `tests/git-publication-native-owned-context.sh` green.

Behavior: trunk, owned-context, and story-branch closure cases go through the
helper, with `control-order` declared as one signal. The story-branch
response rows become rejected cases under `response` (example 4). A
story-branch observation whose `control-order` has CI release before
registration, with every other field passing, is rejected. It is the gate
case this journey lacked. Flipping one response row to pass fails the job.

### 3. Standalone assessors, and a skipped preparation is rejected
Type: Behavior
Status: planned
Proof: `tests/native-journey-state.sh`, `tests/native-adr-behavior.sh`, and
`tests/execution-worktree-preparation-native.sh` green.

Behavior: journey-state, ADR prose, and preparation JSON cases go through the
helper. JSON is flattened once per file, and ADR responses use the `response`
signal. `delegate-before-setup` and `self-report` are rebased on
`fresh-pass` with one signal each. A new case removes the setup and command
roles, traces, and invocations from `fresh-pass`, and the assessor rejects it
with `missing setup or project-command trace` (example 5, ODF-087).

### 4. CI completion is rejected when review never started
Type: Behavior
Status: planned
Proof: `tests/git-publication-native.sh` green.

Behavior: `ci_completion_assess` gains free cases for the first time: a
passing `pending` observation, and rejected cases through the helper for
`review-started: false`, a `control-order` with `complete-start` before
`review-start`, and `forced-stop: true`. The paid-only masked-shutdown case
moves onto the helper.

### 5. Publication and admission suites through the helper
Type: Structure
Status: planned
Proof: `tests/git-publication-native.sh` green, and `tests/native-assessor-counterexamples.sh` green.

Internal change: the publication counterexamples, the admission trio, and the
substitute suite declare signals and use the helper. `missing-remote` is one
signal (example 2). `claim-race-foreign-accepted` gains a passing claim-race
base. `single-marker` gets its base from the passing fixture observation. The
substitute suite's whole-run switches compare a normal substitute run's
observation with the switched run's observation. No verdict changes, except
repairs named per the split decision. With slices 6 and 7, this prepares
for slice 8's guard.

### 6. Delivery-evidence suites through the helper
Type: Structure
Status: planned
Proof: `tests/git-publication-native.sh` green.

Internal change: the claims, consumers, gaps, and selection suites declare
signals and use the helper. The independent multi-field cases
(`unsupported-accept`, `accept-unaligned`, and the 3-field gaps, claims, and
consumers cases) split or are declared coupled, with the reason recorded
beside the declaration. Missing-fields cases delete one field. Any split case
the assessor passes is repaired in this slice.

### 7. Owned-context real-state suites through the helper
Type: Structure
Status: planned
Proof: `tests/git-publication-native-owned-context.sh` green.

Internal change: the startup owned-context and preparation-land suites
(`owned_context_reassess`) use the helper on re-observed state. The raw-git
append case splits into `raw-git-retirement` and a missing `retire-command`.
The stale announcement, outside-story, and worktree re-added cases are
declared coupled signals.

### 8. The free suite refuses rejected cases outside the helper
Type: Behavior
Status: planned
Proof: `tests/native-assessor-counterexamples.sh` guard, green on the tree,
plus a counterexample fixture file.

Behavior: the old rejection primitives are deleted → the guard finds no
negated or `if`-tested assessor call, no removed primitive, and no
expected-rejection verdict outside the helper → pass. A fixture suite that
calls `git_publication_suite_expect_rejected` → fails, naming the file and
line (example 3). `tests/native-publication.md` gains a short section. Every
rejected case goes through the helper with one signal. A change that widens
what an assessor accepts adds paraphrased failure reports on the newly
admitted side as rejected cases in the same change. Recorded bad outputs from
paid runs and reviews stay as rejected cases.

## Local gates

- Run changed checks through `scripts/test.sh` with Bash 5 first on PATH
  (`tests/README.md`; macOS system Bash hides `set -e` assertion failures).
- Run `dough-post-change-refactor` before each commit, as this repository's
  practice requires.
- `tests/git-publication-native.sh` is nearest `per-job-seconds=71`. Slices
  2 and 4–6 judge it with the story-2 command when it exists, otherwise
  against recent trunk CI timings. The helper's self-proof stays in its own
  job.
- Plan 163 (Taken) edits observers in the same families. Rebase before each
  slice. Where its reader changed an observation field, re-observe the
  passing case rather than copying old field lists.
