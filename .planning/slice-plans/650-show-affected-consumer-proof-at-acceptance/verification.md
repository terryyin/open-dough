# Slice 1 verification and effort

Implementation author: `/root/implement_slice`, 2026-11-15. All commands ran in
the established execution checkout at the claim revision plus uncommitted edits.
No test sources, scripts, schemas, installed copies or archived product were
changed. No commit, formatting pass, refactor or publication was performed here.

## R1 — semantic behavior review

[The frozen inputs](replay-inputs.md) precede candidate-guidance replay.
[Decisions](replay-decisions.md) inspect actual old overload/caller, request-set,
retention, previous-reader, status and enclosing-page observers. Those decisions
are the manual observation signals for this guidance change. The walkthrough
names initial rejection, supplied outcome and applicable reuse; a historical
failure never becomes a green missing-only case. No native-host equivalence or
compelled future agent behavior is claimed.

The four shared owners use one common rule in executable-proof's
`Record the consumer trace`, with linked calls from the implementation return,
acceptance and refactor return. Missing input, unsupported exclusion, another
unproved mode and mixed independent proof were exercised in the decisions.

## V1 — deterministic discovery and unchanged orchestration contracts

Literal command:

```sh
node --test Distribution/tests/skills/dough-execute-plan/consumer-trace.test.mjs Distribution/tests/skills/dough-execute-plan/consumer-trace-terms.test.mjs Distribution/tests/skills/dough-execute-plan/ci-supported-host-contract.test.mjs Distribution/tests/skills/dough-execute-plan/execution-increment-delivery.test.mjs
```

Terminal result: 12 passed, zero failed/skipped, 4.708 s. The first two files
contain nine cases. `consumer-trace.test.mjs`'s shared-text case uses a temporary
Git repository populated by `consumer-trace-test-fixtures.mjs:repository`, runs
the real CLI, observes all kinds and explicit empty kinds, ignores ignored
files, includes untracked readers, and asserts `Disposition`. The terms cases
exercise base/index derivation and imports/removed literals. These preserve
lexical discovery, not semantic acceptance. The additional three cases read the
actual guidance: `ci-supported-host-contract.test.mjs` checks one execution
observer; `execution-increment-delivery.test.mjs` checks entry routes and each
mode's delivery target. They observe unchanged orchestration contracts only.
No filter was used; all cases in those four files were selected.

## V2 — payload link delivery

First command `bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh`
exited before tests: `/bin/bash` was 3.2, while the runner requires Bash 5.
This is an observed command-resolution error, corrected by selecting the
installed Homebrew Bash; not a green retry without diagnosis.

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh
```

Terminal result: exit 0. The shell case reads the real assembled managed-file
declaration and every declared Markdown relative target; its altered temporary
copy proves an undeclared linked dependency fails without running the installer.
No new payload dependency was necessary. Observations: `check_declared_links`
and the deliberate undeclared-target counterexample in that named shell file.

## V3 — evidence preservation, links and size

A one-off Python audit compared the original ODF-150 at
`65fcf1bafe89d591f3b387c2cefd361c72f7b510` with the canonical file plus three
new project evidence companions, excluding the unchanged earlier-evidence file:

- All 40 `- Execution:` rows preserved; zero omitted rows.
- All 21 original source URLs preserved with multiplicity; zero omitted URLs.
- All 389 backtick evidence items preserved with multiplicity; zero omitted items.
- Every moved source section's body was found byte-for-byte in its companion.
  Canonical response/watch/assessment bodies and `odf-150`/`odf-240` remain.
- All 84 relative link targets in the changed guidance/finding files and seed
  exist. No source Markdown retains the moved four-case section's old incoming
  link. That seed link now names its project companion.
- Source/finding files are within 250 lines: common proof 242, delegation 246,
  acceptance 130, refactor 162; finding 145, project companions 187/156/44.

This audit supplies only preservation and target/size proof. R1 supplies the
new acceptance behavior. Its full executed Python command and terminal counts
are retained in this implementation agent's tool result; no reusable test or
new checker is introduced for a one-off prose reorganization.

```sh
git diff --check
```

Terminal result: exit 0 after all guidance, replay and finding edits.

## Full discovery record and explicit disposition membership

Literal command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/see-affected-consumer-proof-before-accepting-a-s --base 65fcf1bafe89d591f3b387c2cefd361c72f7b510 --term 'consumer-trace record' --term 'proof type' --term 'ODF-150.md' > /tmp/seed376-consumer-trace.md
```

Terminal result: exit 0. Full output is retained at
`/tmp/seed376-consumer-trace.md` (2,073 lines). It keeps every term, match and
first-line location, with 1,643 explicit file rows. Each row names one disposition
id below, making membership inspectable without copying the full trace into a
second record. Plan/source and moved-history basenames and retired quoted
literals yield many lexical matches; no runtime symbol or contract was changed.
The final trace includes replay-decision/verification prose. One evidence-only
regeneration repaired a 29-row annotation mistake; its full discovery text was
restored from the CLI, and only final disposition cells were then changed.

| Disposition | Explicit membership | Reached boundary and proof or exclusion reason |
| --- | --- | --- |
| run: R1 | 64 file rows marked R1 | Shared source guidance linking to the existing proof/return/acceptance responsibility. Representative common-rule walkthrough plus V2 linked-payload proof; this is no claim of fresh native execution of each caller. |
| run: V1 | 3 file rows marked V1 | Actual guidance contract/discovery test readers selected in V1. The fourth selected test file does not appear as a consumer in this trace. |
| run: V2 | 5 file rows marked V2 | Installer/declaration/link-delivery consumers, covered by the real declaration and altered-copy assertions in V2. |
| excluded: E1 | 211 file rows marked E1 | Installed or internal matching text/runtime remains unchanged. This source revision is not installed by this story; matching a quoted symbol does not alter installed execution. |
| excluded: E2 | 457 file rows marked E2 | Matching historical/planning prose is not an execution of the new rule. Canonical anchors are retained and moved evidence links/preservation are checked in V3. |
| excluded: E3 | 903 file rows marked E3 | Runtime/test symbol or literal is quoted or relocated in guidance/evidence only. No code, data, fixture or callable contract at that boundary changes. |

All 1,643 rows have a disposition; the total equals the original complete
record's file count. Proof type and purpose differ: R1 is semantic review,
V1 preserves discovery/orchestration, V2 assembles links, V3 preserves evidence.
None substitutes for another. No additional affected purpose remains unverified
in this implementation return; coordinator acceptance remains separate.

## New work and comparison limits

Clock observations: 15:04:03 UTC during source/observer inspection, 15:06:24
before final replay evidence drafting, 15:07:59 after it, and 15:09:15 after V3.
These bound a 5m12s observed preparation/review/evaluation window; initial
reading preceded the first clock and final reporting followed it. Total active
implementation estimate at final return is about ten minutes, excluding commands. The
breakdown is not a stopwatch attribution to individual replay decisions.
V1 took 4.708 s; full current trace took about 10 s; the V3 audit tool took
0.35 s. V2 terminal elapsed time was not measured end-to-end and stays unknown.
One plan-path recovery, one Bash resolution recovery and the trace annotation
repair are included costs. Coordinator acceptance added independent source,
observer/setup and preservation inspection; that review's marginal time is
unmeasured and not a saving.
Historical marginal human/agent preparation, review and recovery durations are
unknown. The retained control run's 41.2 s is separate historical product proof.
The comparison claims no causal saving, sustained benefit or missed-check rate.

## Independent refactor

`/root/refactor_slice` corrected three canonical ODF-150 navigation references
left pointing “above” after execution rows moved to companions. The response,
watch, evidence content and shared proof rule are unchanged. R1, V1 and V2 keep
their inspected boundaries and results; V3's preservation evidence also applies.
The new NAV observation follows two section links to the four evidence companions;
all targets resolve and canonical incoming paths/anchors remain. Its full trace
is `/tmp/seed376-refactor-consumer-trace.md`: 18 consumers, 14 inspected navigation
references and four supported historical/independent-text exclusions.
`git diff --check` passed after these edits. No test rerun was needed.

Delivery preparation caught extra blank lines at EOF in the two new Doughnut
and Open Dough companions when staged whitespace checking included untracked
files. Removed only those blank lines, retaining content and all accepted
proof; guarded fresh preparation was retried without a separate commit.
