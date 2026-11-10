# Accepted CI repair — slice 1

Coordinator inspected the one-file diff, maintained test-data architecture,
independent test-model example, both native journey setups/assertions and the
consumer trace. Expected: builders return current timing data while native
identity stays closed under tests/ and src/. Observed: removing the dashboard
runtime dependency restores both whole native journeys; typed wire defaults
and all explicit overrides are unchanged. No source promise is weakened.
Freshness unchanged at `3d3c17e2a155f7a3b5a504b70ab908fe053395ef`; incoming
changes are other work's guidance/preparation, with no named comparison supplier
behavior affecting this repair. No implementation gap remains.

Slice 2 is paused with no edits/commands. Coordinator metadata remains in
installed stash record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-BBQYaF/record.json`, OID `fbf12d01c6a061c0a2e5f715dc4896a07dc3b725`.
Publish the repair before restoring that exact record and resuming slice 2.
The observer remains `/tmp/dough-ci-501/watch-S6j7xi`, same coordinator.

## Inspected repair return

# CI repair return — 42800107133 / attempt 1

Current HEAD / failed published SHA: `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`.
One owned uncommitted path: `tests/support/landedCiHistoryTestData.mjs` (204 lines).
No planning records, stash, installed copies, production files or fixture copy
rules were changed. No active command, commit, push, formatter, hook-owned lint
or independent refactor pass remains under this agent's ownership.

## Cause and disposition

The slice 1 independent refactor imported the production timing constant into
MakeMe's shared history builder. It missed the explicit maintained constraint
in `tests/test-data-architecture.md` lines16–22: builder modules must have no
runtime imports from dashboard modules; native evidence deliberately traces
MakeMe's runtime closure under tests/ and src/. The native scratch source
materializer correctly did not copy dashboard code. Both identity checks
therefore failed at their first evidence capture, with ENOENT for
`identity-source/dashboard/src/ciAttemptTiming.ts` from
`tests/support/native-import-closure.mjs:137`.

The initial copy-expansion hypothesis was rejected before any copy edit after
reading that constraint. Parent explicitly confirmed the selected correction.
The repair removes the runtime import and keeps the canonical wire token once
as a test-model default, typed with `NonNullable<KeptBuild["timingBasis"]>`.
Both existing builder defaults still use it; explicit legacy/unknown facts
still override it. Returned domain bytes remain identical. This is independent
test input data, not a second production timing rule. The runtime closure is
restored without weakening identity, missing-input or sensitivity assertions.

Known CI inventory: root's latest diagnostic
`/tmp/seed285-ci-42800107133-1-final.json` still listed exactly the two native
failures. Root retains the unfinished dashboard(1/12) job and will triage any
further notification; this return does not claim complete attempt inventory.

## Failing-first observation

`PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh`

Terminal exit1, session11545, before edits. Both exact CI failures reproduced
with the same missing dashboard/src/ciAttemptTiming.ts in their separate
identity-source snapshots. This is the defect observation, not attribution as
an exemption. No rerun-until-green or assertion relaxation was used.

## Passing proof

1. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh tests/support/native-import-closure.test.mjs tests/support/ci-attempt-wall-time-basis.test.mjs tests/support/ci-prior-build-reference.test.mjs tests/support/ci-prior-build-boundaries.test.mjs tests/support/landed-ci-history-order.test.mjs tests/support/landed-ci-history-proof-finality.test.mjs`

   Terminal exit0, session33134, eight files. The two full native checks now
   complete their actual scratch-copy -> real evidence-writer -> transitive
   runtime closure -> per-file hash journeys. Their sensitivity, deliberate
   missing-input, no-partial-identity, and retained-record/artifact assertions
   remain unchanged. `git-publication-fixture-identity.sh` also exercises all
   startup/admission/one-shot/owned-context families and retained journey failure
   handling; `native-evidence-identity.sh` exercises its25 listed writer calls,
   supervision-list propagation, command import/spawn closure coverage, and
   content-hash changes. These are credential-free identity journeys; no live
   native host or provider mutation was performed.

   The direct wall-basis tests still distinguish first/repeat and missing
   start, unknown/other basis, and preserved450ms scope execution. Reference
   tests preserve five-sample minimum, outlier filtering, selected/proxy sample
   handling, zero/missing proof/bounds and provenance. Ordered retained-history
   and proof-finality tests preserve canonical builder values. Shared MakeMe
   calls supply domain setup; source/module bytes in the closure parser tests
   are exact inputs under test. No setup supplies a repaired identity result.

2. `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-scope-prior-build-read.test.mjs tests/support/ci-scope-prior-build-reference.test.mjs`

   Terminal exit0, session19679. These are the scope-reference consumers found
   through scopePriorReferenceTestData's exported helpers. Their real retained
   projection/calculation/schema assertions remain unchanged, including
   completeness, per-scope samples and unavailable/provenance states.

3. `npm run typecheck:dashboard`

   Terminal exit0, session54482. This checks the builder's production-type-only
   annotation and both Node/TypeScript consumers. No runtime import is needed
   for that type checking.

4. `git diff --check`: exit0, including after the final comment-only whitespace
   cleanup. No semantic edit followed the passing proof above.

## Consumer trace and reuse

Installed command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term 'attemptTimingBasis' --term 'native-identity-source.mjs' --term 'makeMe.aLandedCiHistory' --term 'native-import-closure' --term 'keepDoneWallProvenanceHistory' --term 'doneWallReferenceHistory' --term 'retainedTrunkProofs' --term 'scopePriorReferenceHistory' --term 'scopeReferenceReading' --term 'scopeReferenceOf' --term 'scopeReferenceEntry'`

Record: `/tmp/seed285-ci1-consumer-trace.md`,68 located consumers, all disposed:
17run,43reused,8excluded. Fixture helper exports were followed to their actual
browser/Node callers. Reused slice1 proof in `slice-1-proof.md` commands3/4/6
remains sufficient for browser histories and reference consumers: the returned
attempt-start token and explicit override behavior are byte-for-byte unchanged;
consumer setup/assertions, product code and read/collection paths are unchanged.
The new focused scope-reference replay covers its two additional Node callers.
Independent production constant/encoder paths are excluded because they do not
import test data and are unchanged. Record/guidance matches have no runtime
change. Native take's unchanged evidence wrapper uses the same complete
MakeMe closure/hash algorithm exercised by the two full identity checks;
its live native launch is not altered by this dependency repair.

## Resource and ownership evidence

Before reproduction/proof, this macOS host was awake on AC power, load
4.23/5.79/10.80,50%free memory. Root confirmed no competing owned heavy proof;
unrelated sessions were left with their owners. Finite focused runner commands
used PATH=/opt/homebrew/bin and `caffeinate -s -i`; typecheck followed the first
gate. All sessions11545,33134,54482,19679 and trace sessions84448,95248,8921
reached terminal results. No waits for wall-clock time, test.slow, timeout
relaxations, coverage changes, real project enablement or CI action were added.

No unresolved implementation gap, contradictory source/ADR decision, new
responsibility, oversized file or human judgment is needed. Parent owns the
remaining CI inventory, independent acceptance/refactor and repair publication,
then restoration of the recorded root-owned metadata and slice2 resume.

## Delivery acceptance

Fresh independent refactor `/root/refactor_ci1`: none, already clean; no edits
or tests. Inspected independent test-model constraint, both identical defaults,
explicit overrides and 68-consumer trace; accepted proof remains valid.
`## REFACTOR COMPLETE` received. File204lines, whitespace check passed.
Final CI diagnostic `/tmp/seed285-ci-42800107133-1-terminal.json` has complete
inventory: exactly the two repaired native failures, no gaps. Final source
freshness unchanged at3d3c17e2a155f7a3b5a504b70ab908fe053395ef.
