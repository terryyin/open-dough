# Source review

Launch: fresh general-purpose reviewer, no conversation inheritance, given only
the story section text of SEED-334#observe-no-stale-candidate-failure-after-show-latest
(Goal, Scope, Key example, Provenance) with the standard source-only instructions;
read no project files, changed nothing. Returned 2026-11-18.

Unnumbered context: "no product change" is a scope limit; Provenance (Intent
Coverage at `309dacb410f71134bc1ff76b668bed907d541f4d`, faulted case passed 4 of 4,
MutationObserver witness saw the failure state) is baseline and reason; removing
only one condition is an equivalent mutant (proof-method note); the Goal's
maintainer-learns wording is the reason, covered by S1 and S2.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| S1 | With both `!controller.signal.aborted && readId === activeRead.current` guards in `dashboard/src/IntentCandidatesRecord.tsx` removed, the departed old-revision read briefly shows "could not be read at this revision" with Retry between Show latest and the new record; the strengthened case "a held answer for the old revision cannot replace the record Show latest selected" fails on that | slice 1 | observed: intent-test-optimization-candidates-revision.spec.ts "a held answer…" window asserts (reading text, no alert) after Show latest; both guards faulted to if (true): failed at line 122 toContainText, received "…could not be read at this revision. Retry", reverted (git diff dashboard/src empty) |
| S2 | Restored (current product guards), the strengthened case passes | slice 1 | observed: restored product: focused command --repeat-each=3, 6 passed (held-answer case 3/3) |
| S3 | The case keeps its existing assertions (a held old-revision answer cannot replace the record Show latest selected) | slice 1 | observed: spec diff only adds hold/window steps; existing expectIntentModeChosen, expectCandidatesRevision, entry visibility and late-answer assertions unchanged and passing |
