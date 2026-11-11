# Source-only review

Fresh reviewer `/root/source_review`, launched with `fork_turns: none` during
this execution, received only the selected story's Goal, Scope, Evidence,
Assumptions and Key examples from
[SEED-305](../../seeds/SEED-305-ci-wall-time-history-across-dashboard-updates.md#keep-ci-wall-time-history-readable-across-dashboard-updates).
The launch instructed it to read no files, change nothing, separate individual
source commitments, and derive no slice ownership or acceptance. The actual
launch/input and returned report remain in this execution's agent history.
The reviewer confirmed that it read and changed no project files.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The prior deployed frontend, still open across the deployment, can read the updated server’s history response, including when the server would otherwise emit a new final gap reason. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: default project and selected Done HTTP answers parsed by frozen 49367c2e4 whole-response schema without reload |
| C2 | Already-collected measured builds remain visible in that older frontend. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: previousMeasuredHistoryOf retains measured revision with wallTimeMs 120000; existing history browser renders measured evidence |
| C3 | Every gap has an understandable reason in each frontend version covered by this story. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: all current final reasons parse and have prior gap words; current reason words stay specific; existing pending/gap browser proofs |
| C4 | The older frontend presents an understandable gap for each landing unmeasurable because of the newly introduced reason. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: timing-basis landing retained as not-recorded with exact prior wording CI wall time not recorded |
| C5 | The newly loaded frontend can display the specific new reason for those gaps in the same collected history. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: production project and Done frontend readers request gap-reasons=timing-basis and show specific current wording with unchanged points |
| C6 | Automated coverage exercises the previous frontend reader with the updated server’s history answer. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts and dashboard/tests/support/previousCiHistoryReader/: actual frozen reader/schema and words parse real updated-server default HTTP responses |
| C7 | The regression check detects compatibility failure caused by a later new reason; reintroducing whole-response rejection fails the check. | slice 1 | observed: dashboard/backend-tests/intent/ci-history-reader-compatibility.spec.ts: iterates all current finalGapReasons, frozen schema accepts default and rejects expanded current answer |

## Qualifications returned

- Q1 — Boundary: local authenticated `intent=ci-history` between the dashboard
  server and Open Dough’s own frontend readers.
- Q2 — Older reader: the prior deployed frontend that can remain open after
  the update introducing the reason.
- Q3 — Deployment journey: C1–C4 cover a frontend loaded before deployment,
  reading history afterward.
- Q4 — Newer-reader journey: C5 covers a frontend loaded after deployment.
- Q5 — `timing-basis` is an example, not the only reason covered by compatibility.
- Q6 — The smallest sufficient mechanism is allowed; projection plus opt-in
  is an example, not a mandated design.
- Q7 — Whole-response rejection must fail the regression check; the older
  reader need not reject unfamiliar gaps.

## Trigger and journey examples returned

- J1: Prior deployed CI status is open; the server begins emitting
  `timing-basis` gaps for retained landings; the tab reads `intent=ci-history`.
  C1, C2 and C4 hold instead of a response-shape error blanking history.
- J2: The developer loads the deployed frontend against the same collected
  history and reads `intent=ci-history`. C5 holds.
- J3: Coverage pins the previous reader; the updated server answers with
  history containing the new reason. C6 exercises the pairing, the previous
  reader accepts a compatible answer under C1, and whole-response rejection
  fails the check under C7.

## Exclusions returned

- X1: Compatibility does not require a reload.
- X2: Acquiring the deployed reader by reload is not the remedy for the open tab.
- X3: A general dashboard API versioning framework is outside scope.
- X4: Changing landing collection is outside scope.
- X5: Changing which landings are measured is outside scope.
- X6: Compatibility with every historical revision is not promised.
- X7: Remote CI adapters are outside the contract.
- X8: Non-dashboard clients are outside the contract.

## Evidence and assumptions returned

- E1: PyArtem's 12 measured builds and 12 `timing-basis` gaps, rejected by
  reader `49367c2e4` and accepted by reader `5a5f5e922fab`, describe the
  incident rather than mandatory regression cardinalities.
- A1: Zod rejecting an unknown reason and discarding the whole answer is an
  assumed mechanism, not a required implementation.
- A2: The proposed projection and opt-in design remains optional.
