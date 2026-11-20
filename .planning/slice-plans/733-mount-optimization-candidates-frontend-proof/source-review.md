# Source review

Launch: a fresh general-purpose reviewer (no conversation inheritance) received only
the story section's Goal, Scope, Key examples, Effort hypothesis and Evaluation
from `.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-optimization-candidates-frontend-proof`,
with the source-only review instructions; it read no files and changed nothing.
Ids and text below are as returned (8a's "file line" reads as the recorded file;
8b carries the case line).

Unnumbered context returned: today six specs arrange a whole dashboard with
project routes for 12 cases; exclusions to later families (general Intent
locations recovery, Gherkin settings, CI views, frontend runner retirement);
effort hypothesis M, six slices; the two-worker baseline comparison sets no
threshold.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A focused Vitest Chromium (mounted) run lets developers check Optimization Candidates reader output, where a recorded source opens, and how a failed record recovers, replacing a whole-dashboard arrangement with project routes (Goal; Scope: move record formats, field order, revision evidence links, tab layout and keyboard operation, record availability, opening files and cases, and candidate-read recovery) | slice 6 | |
| 2 | The CI status tab starts selected (Key examples; Scope tab layout) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates.spec.ts first test: CI status aria-selected, candidates not, locations visible, no record read |
| 3 | The Optimization Candidates tabs can be operated by keyboard (Scope: tab layout and keyboard operation) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates.spec.ts first test: ArrowRight/ArrowLeft move focus and selection between tabs |
| 4a | When the reader opens Optimization Candidates, they see the record for the shown revision, with fields in order (Key examples; Scope field order) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates.spec.ts first test: isRecordedAt(revision), reads==[revision], ordered headings and findingEntryFields labels |
| 4b | That record spans the full reading width (Key examples; Scope tab layout) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates.spec.ts first test: tabpanel x and width equal the Project Intent region |
| 5 | Revision evidence links are present and work for the shown record (Scope: revision evidence links) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates.spec.ts first test: evidence link href pinned to blob/<revision>; sha:path stays text |
| 6a | A live record shows its own fields (Key examples; Scope record formats) | slice 2 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates-live.spec.ts: five fact terms and definitions in order, source opens in Purpose; live None. reads as no live candidates without a failure |
| 6b | A profile-only mechanism shows its own fields (Key examples; Scope record formats) | slice 1 | observed: dashboard/frontend-tests/intent/intent-test-optimization-candidates-profile-only.spec.ts: section order, mechanism note and pinned link before its entry, no pass summary |
| 7a | An absent record has its own wording (Key examples; Scope record availability) | slice 3 | |
| 7b | An empty record has its own wording | slice 3 | |
| 7c | A mismatched record has its own wording | slice 3 | |
| 7d | An unreadable record has its own wording | slice 3 | |
| 7e | In each of those unavailable states, the locations remain usable | slice 3 | |
| 8a | A configured source opens in Purpose at its recorded file, with the tree selected (Key examples; Scope opening files and cases) | slice 4 | |
| 8b | A configured source opens in Purpose at its recorded case line, with the tree selected | slice 5 | |
| 9 | Returning focuses the entry and does not reread (Key examples) | slice 4 | |
| 10a | An ambiguous source explains what can be opened (Key examples) | slice 5 | |
| 10b | An out-of-scope source explains what can be opened (Key examples) | slice 5 | |
| 11 | A shorter backoff cannot bypass a standing GitHub wait (Key examples; Scope candidate-read recovery) | slice 6 | |
| 12a | A refusal needs manual Retry to recover (Key examples; Scope candidate-read recovery) | slice 6 | |
| 12b | A malformed response needs manual Retry to recover | slice 6 | |
| 13 | The moved proofs still use the real record-reading owner and the real Project Intent reading owner (Scope) | slice 6 | |
| 14a | The revision cases stay as proof at their current (typed-mount) boundary (Scope) | slice 6 | |
| 14b | The composed GitHub timeout journey stays as proof at its current boundary (Scope) | slice 6 | |
| 15 | Candidate-specific setup is removed once its last consumer moves (Scope; Evaluation: inspect the candidate-specific arrangements removed) | slice 6 | |
| 16 | The family passes on its own while the remaining frontend tests still use both engines (Evaluation) | slice 6 | |
