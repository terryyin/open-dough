# Independent source review

Fresh reviewer general-purpose agent `025b369f-e8d0-4d31-ae56-c9247ece47c3`,
received only the selected story Goal, Scope, key examples, and exclusions
pasted in its launch. It was instructed to read no files, change nothing, and
derive individual source clauses without plan, product, proof, or slice
context. Its numbered commitments are allocated below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Shorten the wait for trustworthy local dashboard test results | slice 4 | observed: full-suite durationMs 679.6s → 657.2s at /tmp/SEED-194-optimize-dashboard-test-feedback/after-proof.json |
| 2 | Preserve behavioral coverage and confidence | slice 2 | observed: agent-launch-model.spec.ts retains layout/Default/dismiss/Tab/refuse; boundary/agent-launch-model-boundary.spec.ts passed |
| 3 | A demonstrated absence of worthwhile improvement, with that evidence recorded, satisfies the story | slice 4 | observed: not applicable — measured gain retained; alternative path unused |
| 4 | Run measured test optimization against the ordinary local command npm run test:dashboard | slice 1 | observed: /tmp/SEED-194-optimize-dashboard-test-feedback/baseline-proof.json strictStatus passed |
| 4a.1 | Optimization covers browser journeys | slice 1 | observed: baseline selectedCount 1750 includes journey specs |
| 4a.2 | Optimization covers boundary tests | slice 1 | observed: baseline times include boundary/* specs |
| 4a.3 | Optimization covers their shared setup | slice 1 | observed: baseline-times.tsv includes hook-weighted file costs |
| 5 | Profile before choosing experiments | slice 1 | observed: PLAN.md slice 1 baseline and dominant-cost analysis before slices 2–3 |
| 6 | Investigate related test families | slice 1 | observed: PLAN.md family analysis for Claude/Codex model matrices |
| 7 | Retain only changes supported by comparable wall-time measurements under like runner conditions | slice 2 | observed: /tmp/SEED-194-optimize-dashboard-test-feedback/slice2 before 13.3–16.4s / after 10.0–11.7s over three passes |
| 8 | Follow the project's dashboard test guidance when simplifying tests or moving proof between tiers | slice 2 | observed: kind-matrix argv left to boundary; one offers-Model and one Default journey retained |
| 9 | Establish replacement proof before removing or narrowing cases | slice 2 | observed: boundary/agent-launch-model-boundary.spec.ts covers story and ad-hoc --model / no-model before journey narrow |
| 10 | After experiments, re-run the same local command under comparable conditions | slice 4 | observed: after-proof.json same npm run test:dashboard; load recorded in after-meta.txt |
| 11 | Report the outcome of the pass | slice 4 | observed: TEST-OPTIMIZATION-CANDIDATES.md Latest pass and dashboard-test-timings.md SEED-194 section |
| 11a.1 | Report before/after wall time | slice 4 | observed: 679.6s → 657.2s durationMs in Latest pass |
| 11a.2 | Report executed case count | slice 4 | observed: 1,750 → 1,746 in Latest pass |
| 11a.3 | Report retained behavioral proof | slice 4 | observed: Latest pass names surviving Claude model journeys and unchanged boundary |
| 11a.4 | Report rejected experiments | slice 4 | observed: Latest pass and pending codex-discovered-model-story-workflow-collapse |
| 11a.5 | Report remaining candidates | slice 4 | observed: Pending candidates section updated |
| 12 | Update .planning/TEST-OPTIMIZATION-CANDIDATES.md with the latest-pass summary and current candidate state | slice 4 | observed: .planning/TEST-OPTIMIZATION-CANDIDATES.md rewritten Latest pass |
| 12a.1 | Remove any transferred obligation whose receiving story has already closed with its work done | slice 4 | observed: Transferred obligations remains None. |
| 13 | Preserve accepted necessary costs unless new evidence supports reopening them | slice 2 | observed: agent-launch-poles and long-integrated-journeys untouched in slice 2 diff |
| E1 | Baseline then retained experiments finish sooner under comparable conditions with coverage preserved | slice 4 | observed: 679.6s → 657.2s with focused family evidence and −4 kind-matrix cases |
| E2 | An experiment that fails to improve wall time or weakens coverage is undone or left out and reported | slice 3 | observed: Codex workflow collapse undone; slice3 before/after proofs show no focused wall gain |
| E3 | No worthwhile saving leaves the suite unchanged with measurements recorded | slice 4 | observed: not applicable — measured gain path taken |
| E4 | A journey that only repeats a boundary-answerable variant is moved or dropped per guidance with surviving cheaper proof | slice 2 | observed: agent-launch-model.spec.ts kind matrix collapsed; boundary argv coverage retained |
| X1 | Do not change product behavior to make tests faster | slice 2 | observed: diff touches only dashboard/tests/agent-launch-model.spec.ts and planning records |
| X2 | Do not expand into non-dashboard suites | slice 2 | observed: only npm run test:dashboard scope |
| X3.1 | Do not claim speedup from fewer cases or lines alone | slice 4 | observed: Latest pass cites wall and focused timings, not case count alone |
| X3.2 | Do not claim speedup from focused timings without a comparable full local re-run | slice 4 | observed: full after-proof.json re-run recorded beside focused evidence |
| X3.3 | Do not claim speedup from CI-only allocation changes that leave the selected local wait unchanged | slice 4 | observed: no CI allocation change in this pass |
