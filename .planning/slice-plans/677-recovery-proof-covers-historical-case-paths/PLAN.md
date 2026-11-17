# Recovery proof covers historical case paths

**Identity:** SEED-393#recovery-proof-covers-historical-case-paths
**Source:** [Recovery proof covers historical case paths](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#recovery-proof-covers-historical-case-paths)
**Source review:** [Independent source commitments](source-review.md)

## Execution context

- Story Branch Mode; owned established workspace
  `/Users/terryyin/git/open-dough/.worktrees/recovery-proof-covers-historical-case-paths`,
  branch `codex/recovery-proof-covers-historical-case-paths`; integration checkout
  `/Users/terryyin/git/open-dough`; authorized target `origin/main`.
- Identity `SEED-393#recovery-proof-covers-historical-case-paths`, publisher
  `dashboard-territory.local-open-dough`, agent Shunka-chan.
  Starting revision `1c7709ca7a4f8e998a177bcbf40d1f374b5fb4a3`;
  accepted claim and candidate `1081555ef6e339ab4a5d4d8b1ec78031bcff3475`.
- Established start reports Changed since readiness review. The source and
  single test slice align; the recorded Ready assessment remains unchanged.
  Existing planning authority is retained; no explicit overrun option supplied.
- Checkout setup: locked npm and browser acquisition, then
  `PATH="/opt/homebrew/bin:$PATH" node scripts/setup-native.mjs check` passed
  with Node 24.21.0 and Chromium 158.0.8127.18. Bash 5 is selected through
  `/opt/homebrew/bin` for proof commands. Commit hook is check-only; selective
  formatting uses `npm run format`.
- CI: GitHub Actions `ci.yml` (CI, workflow 351271804), push-triggered;
  observer target `terryyin/open-dough`,
  `codex/recovery-proof-covers-historical-case-paths`, coordinator
  `shunka-seed393-recovery`, directory `/tmp/dough-ci-501/watch-UDVaEO`,
  PID 95739, session 30804, yielded cell `g794:15`, bound to this checkout.
  The startup claim on trunk has `pendingCi: unobserved`.

## Provenance and findings

This is an Intent Coverage finding on SEED-393#repeat-native-guidance-checks-on-real-story-examples,
checked at revision `4d50a0a39412906f6ce8fddd659d88ba1318dae0`. Verdict:
confirmed missing test path, bounded to the examined check.

- Fault: `native_comparison_basis_observe` in
  `Distribution/evaluation/src/native-comparison-basis.sh` lost its
  historical case-directory forms (`native-comparison/<case>/`,
  `cases/comparison/<case>/`).
- Independent witness:
  `Distribution/evaluation/src/native-guidance-check.sh --recover Distribution/evaluation/cases/guidance-checks/paused-supplier/comparisons/20261114T102744-1921.txt`.
  Under the fault it reported `recovery: fail` with "no case directory
  recorded".
- Examined check:
  `Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh`.
  It passed under the fault, because its fixture records are saved only under
  `cases/guidance-checks/<case>/`.

## Preserved promises and constraints

Recovery of kept records still reaches their original inputs, and those
records stay byte-identical. Make no product change unless the new proof
exposes a defect. Keep the default timeouts.

## Slices

### 1. Recovery test covers a record saved under a historical path
Type: Behavior
Status: done

Behavior: the maintained refresh and recovery test recovers a record whose
inputs were saved under a historical case-directory form. It asserts
`recovery: pass`, the historical `case-basis-directory` and an unchanged
report.

Proof: the test fails with the fault above applied and passes once it is
restored, run through `bash scripts/test.sh`.

Shape: a kept record names, besides its case files, harness inputs outside
the case directory. The commit holding the case at its historical directory
must also hold those inputs at their recorded paths, so the test moves the
case to the historical form and back before the harness move, and keeps
that record afterwards. Recovery then searches past the named revision.

## Decisive premises

Observed at `03301978d` in this preparation's workspace, scratch edits
reverted afterwards.

| Premise | Consuming operation and form | Result |
| --- | --- | --- |
| The current test misses the fault | Fault applied (line 165 keeps only `cases/guidance-checks/`); `bash scripts/test.sh Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh` | Exit 0 under the fault |
| The witness still exposes the fault | Same fault; `Distribution/evaluation/src/native-guidance-check.sh --recover Distribution/evaluation/cases/guidance-checks/paused-supplier/comparisons/20261114T102744-1921.txt` | `recovery: fail`, "no case directory recorded" |
| The planned shape discriminates | Scratch addition of the shape above (case under `Distribution/evaluation/cases/comparison/paused-supplier`, record from the refreshed comparison with case paths rewritten); `bash Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh` | Restored: exit 0, `recovery: pass`, historical `case-basis-directory`, report unchanged. Faulted: exit 1, `recovery: fail` |

The `native-comparison/<case>/` form takes the same route and was not run
separately; covering one historical form is the slice's promise.
Refinement was not needed: one Behavior slice, no slice-boundary or sizing
concern identified.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Local gate: the changed test through `bash scripts/test.sh`, then
`npm run test:evaluation` under `caffeinate -s -i` on AC.

## Slice 1 acceptance

- Source review commitment 1: the regression in historical collection-path
  recovery must fail the maintained test. The test now commits the case at
  `Distribution/evaluation/cases/comparison/paused-supplier`, returns it to
  the current collection, keeps the refreshed record with historical case
  paths and its older named revision, then moves the harness. The historical
  recovery assertions require the matching historical basis revision and
  directory, `recovery: pass`, unchanged emitted bytes (`report_is`) and
  unchanged stored bytes (`cmp`). No product change was needed.
- Focused proof passed:
  `PATH="/opt/homebrew/bin:$PATH" node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed393-recovery-focused.log --exit-file /tmp/seed393-recovery-focused.exit -- bash scripts/test.sh Distribution/evaluation/tests/native-guidance-checks/native-comparison-refresh.sh`.
- Isolated fault/restoration proof passed:
  `PATH="/opt/homebrew/bin:$PATH" node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed393-recovery-mutation.log --exit-file /tmp/seed393-recovery-mutation.exit -- bash /tmp/seed393-recovery-mutation.sh`.
  The script clones the published source, copies the changed test and removes
  both historical forms from `native_comparison_basis_observe`. The named
  runner exits 1 with `recovery: fail` and `no case directory recorded`;
  restoring the exact basis source makes that same named runner exit 0.
  Temporary clone removed; scratch fault was never applied to this checkout.
- Broader gate passed:
  `PATH="/opt/homebrew/bin:$PATH" node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed393-recovery-evaluation.log --exit-file /tmp/seed393-recovery-evaluation.exit -- env OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm run test:evaluation`.
  Actual macOS host was on AC, load 22.81/28.41/27.24, memory 59% free;
  two workers bounded pressure from other unowned work. No competing owned
  heavy verification. The run advanced normally and exited 0. Reconsider
  this choice after contention, a failure or changed workload.
- Freshness before acceptance: unchanged at trunk
  `1081555ef6e339ab4a5d4d8b1ec78031bcff3475`; no incoming commits since the
  claim, so no newly landed named sibling can affect inherited behavior.
- Consumer trace: supplied terms `historical_case`, `case-basis-directory`,
  `native-comparison-refresh`; real maintainer entry and basis implementation
  are observed through focused recovery. Credential-free guidance still
  names this test. Other matches are planning references or retained evidence,
  with no changed runtime contract. Inspectable scratch trace:
  `/tmp/seed393-recovery-consumers.md`.
- Implementation returned uncommitted at 3 active minutes; no overrun and no
  source promise or required proof left uncovered. Test file is 216 lines.
- Independent refactor `/root/refactor_recovery_test`: none — already clean;
  `## REFACTOR COMPLETE`, no edits or tests. Accepted boundaries, setup,
  observations and consumer trace remain unchanged.
- Delivery freshness: unchanged at pinned trunk
  `9b033247c70d52c56136f6ed21c78f22797cd44f`. Incoming sibling
  `SEED-393#guidance-check-participants-run-owning-proof` is attributed to
  implementation `80ecc810a` and closure `465b6acef`. Its launch-command-tests
  environment changes do not affect the paused-supplier case, recovery entry
  or historical-basis implementation exercised here. No renewed proof needed.

## Retrospective

- Attributable delivered implementation: `53514937cb16611a4befa4cdcfcc5d9ed92c6220`,
  accepted on `origin/codex/recovery-proof-covers-historical-case-paths`,
  suffix base `1081555ef6e339ab4a5d4d8b1ec78031bcff3475` (claim provenance).
  Nearby participant-proof commits belong to the sibling, not this execution.
- Original test-only correction and preserved bytes are met. The historical
  record forces Git search beyond its named revision, and the observed fault
  fails this exact test. This directly supports the near-future direction of
  protecting intent with understandable, discriminating proof. No architectural
  choice or ADR conflict introduced; no product behavior changed.
- E2E tests did not drive this test correction. The maintained command-boundary
  check exercises real recovery and Git with a substitute native host; browser
  workflows and real host execution are outside its proof claim. No redundant
  case, private-helper substitution, residue or worthwhile cleanup identified.
- Process reviewed from this session's conversation and tool results; enabled
  by `skipProcessRetrospective: false`, not deferred because this correction
  requests no automatic Intent Coverage check. Bounded implementation, isolated
  fault/restoration and reused proof held their contracts; no new supported
  process finding or follow-up. No DearDough write needed.
- Product advice: no change. Planning unchanged; no correction or queue change.
  CI remains pending on the retained story-branch observer until the completion
  operation settles its accepted revision. No other unresolved attention.

## Execution complete

Product advice: no change.
