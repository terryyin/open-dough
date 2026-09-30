# Reassess the native test architecture

## Source and authority

- **Identity:** SEED-055#reassess-native-test-architecture
- **Source:** [refined story](../../seeds/SEED-055-trustworthy-project-proof.md#reassess-native-test-architecture)
  (Goal, Scope, Key examples).
- **Authority:** planning only. This plan grants no Take, implementation, paid
  native run, or publication beyond landing the preparation.

## Goal and scope

Every native family is built from the same few layers with one owner per
responsibility, and no native file is over 250 lines. The story's seed states
Goal, Scope (preserved: entry-point command lines, retained-results contract,
every assessor verdict and counterexample expectation; not committed: new
native cases, changed native checks, paid runs, non-native suites,
`tests/README.md`) and key examples; they apply unchanged.

Correction to the seed's premise, observed 2026-09-30: two native files are over
the bound, not one: `tests/support/story-branch-closure-native-assess.sh` (266)
and `tests/support/git-publication-native-owned-context-suite.sh` (260). Both are
covered below.

## Target layering

One vocabulary, named in slice 10 where the next family author finds it:

| Layer | Owns | Never holds |
| --- | --- | --- |
| fixture | builds the project, remote and mailbox state | judgment |
| run | drives the host or substitute, retains the attempt, writes the evidence identity | field extraction |
| observe | turns state and stream into `observations.txt` fields | verdicts |
| assess | judges `observations.txt`; declares `# assessor-signal:` lines | reading live state |
| counterexamples | a passing observation plus declared signals, through `native-assessor-counterexample.sh` | fixture building |
| shared helpers | cross-family field reading, harness detection, completion counts, response text, failure-evidence cleanup | family journeys |

Each layer is its own file per family, except where a family has too little to
fill a file.

## Direction followed

[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) stands:
replay and counterexamples prove the harness, never native behavior, and no
paid run is added. No other Accepted ADR constrains test layout. No North Star
topic applies.

## PFE: what is reused

Reused and extended, not replaced: `native-completion-observation.sh` (call,
await, stop, shutdown and control-order helpers), `native-response-field.sh`,
`native-assessor-counterexample.sh` (the only place a rejected case is stated,
guarded by `native-assessor-counterexample-guard.sh`), `native-harness-observation.sh`
and `native-host-stream.sh`. Duplication these do not yet cover, each observed:

- the complete/await/stop/product-shutdown/forced-stop field block, written out
  in `ci-completion-native-run.sh`, `trunk-closure-native-assess.sh` and twice in
  `story-branch-closure-native-assess.sh`;
- reading one observation field with `awk '/^key:/{print $2}'`, 31 copies across
  the ci-completion, trunk and story-branch assessors, beside
  `native_journey_state_field`, a second reader of the same shape;
- `harness-inspected` detection, seven copies (four delivery-evidence observers,
  `delivery-evidence-native-run.sh`, trunk and story-branch), differing only in a
  pattern;
- the preserve-evidence-on-failure cleanup, five copies in the product-backlog
  guard (three hosts), take and use scripts.

## Current decisions

- Structure slices only. Behavior stays as it is, so the story's proof is the
  unchanged free suites, not a new behavior.
- Field names, field order and values in `observations.txt` do not change: the
  stream replay corpus retains paid observations and replays their verdict.
- `assessor-identity` keeps naming each family's assess file, and its
  `# assessor-signal:` declarations stay in that file, because
  `native_assessor_counterexamples` reads signals from the file it is given.
- Every file added, moved or renamed is added to its family's evidence-identity
  hash list in the same slice (`story_closure_write_evidence_identity`,
  `trunk_closure_write_evidence_identity`, the ci-completion list in
  `git-publication-native-evidence.sh`, the delivery-evidence list). No free
  check enforces completeness of these hand-kept lists; each slice diffs the
  files the family sources against its list. A completeness check is not added:
  it would be new proof beyond this story's scope.
- Slice 1 adds free observer counterexamples for two observers no free check
  runs today (see premises). This is the only new proof; it is a harness
  counterexample in the existing observer-counterexample style, not a native
  case, and does not change what a native run checks. The maintainer may veto
  it, which leaves slices 4 and 6 without proof of their observe moves.
- Execution may stop after any slice: each leaves every family working.

## Planning premises observed (2026-09-30)

Baseline command for the table: `PATH=/opt/homebrew/bin:$PATH npm test -- <paths>`
(macOS system Bash 3.2 is refused by the runner).

| Premise | Consumer | Observation reaching it | Result |
| --- | --- | --- | --- |
| Only two native files are over 250 lines | Goal, slice 4 and 8 | `find tests \( -name '*native*' -o -name '*.sh' -o -name '*.mjs' \) \| xargs wc -l \| awk '$1>250'` | 266 (`story-branch-closure-native-assess.sh`) and 260 (`git-publication-native-owned-context-suite.sh`); nothing else; seven files sit at 247-250. |
| The free verdict proof passes today | Every slice's proof | `npm test -- tests/git-publication-native.sh tests/native-assessor-counterexamples.sh tests/native-assessor-counterexample-guard.sh tests/native-stream-replay.sh tests/native-runner-failures.sh` | Exit 0 in 59 s. |
| The three closure/ci assessors' counterexamples are reached by that proof | Slices 4-6 | `git grep -n "run_.*_assessor_counterexamples" tests/git-publication-native.sh` | Lines 133-135 call trunk, story-branch and ci-completion counterexamples in the default (credential-free) mode. |
| `story_closure_observe` and `ci_completion_observe` are run by no free check | Slices 3, 4, 6 | Temporary `echo` at function entry, run `npm test -- tests/git-publication-native.sh` (the entry itself, `run_story_closure_assessor_counterexamples`, marked as a control, wrote its mark; observers wrote none); then `git checkout tests` | Not called. Their only caller is the paid run path (`story_closure_run_journey`, `ci_completion_run_journey` via `git-publication-native-host.sh`). |
| `trunk_closure_observe` is run by a free check | Slices 3, 5 | Same marker, `npm test -- tests/git-publication-native-owned-context.sh tests/git-publication-native-one-shot.sh` | Called once (owned-context substitute). |
| A fixture-only observation of both unproven observers is producible without a host | Slice 1 | Sourced `story-branch-closure-native-run.sh` and `ci-completion-native-run.sh` in a scratch script, called `*_create_fixture`, then `story_closure_observe` and `ci_completion_observe` (scenarios `pending`, `ready`) on an empty transcript and response, then `native_harness_stop_observers` and cleanup | Both exit 0 and print every field (story-branch: 35 lines; ci-completion: 14). Story-branch values include per-run SHAs and temporary paths (`remote-sha`, `branch-sha`, `trunk-before-sha`, `branch-mailbox`); ci-completion values are stable. Slice 1 pins field names and order and normalizes those four values. |
| Callers of the moved story-branch functions | Slice 4 | `git grep -l story_closure_ -- . ':!tests/fixtures'` | `story_closure_observe`: assess file and run file; `story_closure_assess`: `git-publication-native.sh`, `native-assessor-counterexample-stray-suite.sh`, assess, response, run files; `run_story_closure_assessor_counterexamples`: `git-publication-native.sh` and assess. No `.feature` or other script reaches them. |
| Callers of the moved trunk and ci-completion functions | Slices 5, 6 | `git grep -l` for each function name | Trunk: `git-publication-native.sh`, `git-publication-native-owned-context-suite.sh`, `trunk-closure-native-owned-context.sh`, stray-suite, run file. ci-completion: `git-publication-native.sh`, stray-suite, run and assess files. |
| Evidence identity names the files being moved | Slices 4-7 | Read `story_closure_write_evidence_identity` and `git-publication-native-evidence.sh` lines 49-60; `tests/native-evidence-identity.sh` | Each family lists its files by path; `assessor-identity:` names the assess file; the check covers the shared supervision list, not each family's own files. |
| The owned-context suite has one caller and one guard entry | Slice 8 | `git grep -n` for its five functions and its path; read `native-stream-guard.mjs` lines 40-100 | Only `git-publication-native-owned-context.sh` sources it; `native-stream-guard.mjs` lists it by path (line 65) as a host-literal writer; no other file this plan moves is listed. `git-publication-native-run.sh` has three functions, one concern. |
| The product-backlog guard, take and use scripts share one cleanup | Slice 9 | `git grep -n "PRESERVED" tests` | Five copies in `product-backlog-native-guard-{claude,codex,cursor}.sh`, `-take.sh`, `-use.sh`; the same text but for the case name. |
| `execution-worktree-prep` already has fixture, observe, assess, run and cheap-counterexample files | Slice 10 | `ls`; function lists of its `.mjs` and `.sh` files | It does; no file exceeds 250; nothing to move beyond naming it in slice 10. |

## Outside-in proof and verification

Free proof, run after every slice with the same command (the last five are
the story's stated proof):

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- \
  tests/git-publication-native.sh tests/git-publication-native-owned-context.sh \
  tests/git-publication-native-one-shot.sh tests/native-evidence-identity.sh \
  tests/native-assessor-counterexamples.sh tests/native-assessor-counterexample-guard.sh \
  tests/native-stream-replay.sh tests/native-runner-failures.sh
```

Plus `npm run lint` (shellcheck) and `find tests -type f \( -name '*.sh' -o -name '*.mjs' \) | xargs wc -l | awk '$1>250'`
printing nothing once slices 4 and 8 are done. Slice 9 adds
`tests/product-backlog-native.sh`. No paid native run: a verdict that a change
would alter stops the work and goes to the maintainer.

Mapping of key examples: example 1 (266-line assessor) is slice 4 with slice 1's
proof; example 2 (shared field or response helper) is slices 2 and 3; example 3
(new family follows the layering) is slice 10; example 4 is the verification
command above.

## Slices

### 1. Pin the two unproven observers with free counterexamples
Type: Structure
Status: done
Proof: a fixture-only observation of the story-branch closure and of the
ci-completion journey (scenarios `pending` and `ready`) passes through the new counterexamples with the field list
recorded from the unchanged code; `git-publication-native.sh` runs them.

Done: `story-branch-closure-native-observer-counterexamples.sh` (states
`fresh`, `integrated`) and `ci-completion-native-observer-counterexamples.sh`
(`pending`, `ready`) diff the normalized observation against the recorded field
list; the free proof command and lint pass. Learning: the counterexample guard
flags a bare `pending` or `ready` argument, so the story states are named
`fresh` and `integrated`; later observer counterexamples take state names from
a variable or use other names.

Enables slices 4 and 6: the observe move is judged against a recorded
observation rather than by reading. Pin field names and order and normalize the per-run SHAs and paths, using the
observation recorded in the premises. Each observer counterexample goes in its
own new file, sourced by the family's run file and added to its identity list.

### 2. One reader for observation fields and harness detection
Type: Structure
Status: done
Proof: the free proof command; the counterexamples of the ci-completion, trunk
and story-branch assessors unchanged.

Done: `native-observation.sh` is sourced from `native-completion-observation.sh`
and listed in the three families' identity lists. `native_journey_state_field`
stays: it reads a variable, matches anywhere in a line and keeps spaces, so it is
not the same reader. Free proof and lint pass.

Behavior kept: `native_observation_field FILE KEY` replaces the 31 `awk` copies
and `native_journey_state_field`'s twin in those three assessors;
`native_harness_inspected PATTERN FILE...` replaces the trunk and story-branch
copies. Home: a new `native-observation.sh`, used by slice 3 and 7.

### 3. One writer for the completion field block
Type: Structure
Status: planned
Proof: the free proof command; slice 1's observation recorded for the story and
ci observers identical; the trunk observation in the owned-context check
unchanged.

The complete, await, stop, product-shutdown and forced-stop fields are written by
one helper in `native-completion-observation.sh` taking a label prefix, used by
`ci-completion-native-run.sh`, `trunk-closure-native-assess.sh` and
`story-branch-closure-native-assess.sh`. Field names and order do not change.

### 4. Story Branch closure in fixture, observe, assess and counterexample files
Type: Structure
Status: planned
Proof: the free proof command; slice 1's observation identical; no file over 250.

`story-branch-closure-native-assess.sh` keeps `story_closure_assess` and its
signal lines; observation and `story_closure_retire_seen` move to
`-native-observe.sh`; `story_closure_write_assessor_observation`, the assessor
and retire counterexamples move to `-native-counterexamples.sh`. The response
file stays. Identity list and `story_closure_assess_file` updated.

### 5. Trunk Mode closure in the same layers
Type: Structure
Status: planned
Proof: the free proof command; owned-context check's trunk observation
unchanged.

Same split for `trunk-closure-native-assess.sh` (238 lines, below the bound but
mixing three layers); `trunk-closure-native-owned-context.sh` keeps its own
observe and assess pair and follows the same naming.

### 6. Completion journey in the same layers
Type: Structure
Status: planned
Proof: the free proof command; slice 1's ci observation identical.

`ci_completion_observe` leaves `ci-completion-native-run.sh` for an observe
file; the run file keeps launch, retention and identity.

### 7. Delivery-evidence observers use the shared vocabulary
Type: Structure
Status: planned
Proof: the free proof command, including the delivery-evidence assessor and
observer counterexamples in `git-publication-native.sh`.

The four `harness-inspected` copies and field reads adopt slice 2's helpers, each
family passing only its pattern. The two observers at 249 lines drop below it as a
side effect, not a goal.

### 8. Git-publication owned-context suite under the bound by concern
Type: Structure
Status: planned
Proof: the free proof command (it runs `git-publication-native-owned-context.sh`
and `native-stream-replay.sh`, which runs `native-stream-guard.mjs`); no file
over 250.

`git-publication-native-owned-context-suite.sh` (260) holds three concerns.
Keep the journeys with `owned_context_observe`, `owned_context_append_started`
and the trunk owned-context substitute (lines 10-74 and 245-end) in it; move
`run_startup_owned_context_counterexamples` (75-143) and
`run_preparation_land_counterexamples` with its retirement cases (144-244) to
their own files, named like the family's existing `-startup-counterexamples.sh`.
The suite sources them; `git-publication-native-owned-context.sh` is the only
caller. The stream guard lists the suite by path as a shape writer holding host
literals: after the move, the guard must list exactly the files that hold them
(it fails a listed file with no literal and an unlisted file with one).
`git-publication-native-run.sh` (241) holds one concern (launch, install, journey)
and stays.

### 9. Product-backlog native cases share one failure-evidence cleanup
Type: Structure
Status: planned
Proof: `tests/product-backlog-native.sh` default mode; a credential-free check
of the shared helper's two outcomes (success removes the directory, failure
prints `PRESERVED:` and keeps it), since no free check reaches the failure path
today.

One helper replaces the five copies; each case passes its label and evidence file
prefix.

### 10. State the layering where a new family author looks
Type: Structure
Status: planned
Proof: read the result against the layering table and this plan's mapping; every
current family is placed, and no other test file changes.

Add a short "Native family layers" section to `tests/native-publication.md`
(not `tests/README.md`): the six layers, the shared helpers to reuse, and each
family's files. Records that `execution-worktree-prep` and the closure, delivery
and git-publication families already follow it.

## Considered and excluded

- Splitting `story-branch-closure-native-assess.sh` alone: meets the bound and
  leaves the mixed-layer design (seed Scope).
- A check that each family's identity list covers the files it sources:
  useful, but new proof beyond the story.
- Converting the shell families to Node or unifying the Node and shell
  families: changes no verdict-relevant design and enlarges the story.
- Renaming any entry point under `tests/`: violates the preserved command lines.
