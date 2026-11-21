# Source review

Launched on 2026-11-21 as a fresh general-purpose reviewer with no conversation
inheritance. Input: the story section of
[SEED-413#speed-intent-ci-comparison-proof](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-comparison-proof)
(Goal, Scope, Key examples, Evaluation) and the referenced
"Acceptance shared by the eight stories" text, with no plan, product or proof.

Unnumbered context returned: scope ownership of `intent-ci-comparison-*.spec.ts`
and the five registration modules; Summary evidence rules and timing history
belong to the next story; test-method guidance (smallest production owner,
frontend guidance, North Star, ADR 0010, MakeMe, colocated page objects);
case-reduction techniques; campaign one-minute target belongs to the final
story; separate owners of recovery/late-styling and renamed-diff work; SEED-341
coordination; backend and E2E groups keep their own runner and coverage.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The comparison names the right builds, timing, test results and limits (Goal) | slice 2 | observed: intent-ci-comparison-endpoints, -adapter-proof, -overall-metrics (slice 1) and -landed-fallback, -timing-gaps (slice 2) specs |
| 2 | Landed proof unavailable → Branch fallback with the real reason and measured figures | slice 2 | observed: intent-ci-comparison-landed-fallback.spec.ts "unavailable Landed proof retains the Branch counts, time and exact adapter reason" and "running Landed retains Branch fallback…" |
| 3 | Check again recovers Landed | slice 3 | observed: intent-ci-comparison-check-again.spec.ts "Check again reads all endpoint proofs afresh and replaces Branch fallback with recovered Landed proof" (held reply disables Check again; release shows Landed) |
| 4 | A previous selection's held result cannot replace the current comparison | slice 3 | observed: intent-ci-comparison-selection.spec.ts: old comparison and attempt-proof reads aborted and released late leave the current story ddddddd and 10 → 4 test cases (−6) shown |
| 5 | Cross-scope observations reuse the same preference, fallback or held evidence | slice 4 | |
| 6a | Legacy, case and file units with partially missing evidence: comparison and drill-down preserve the available figures | slice 5 | |
| 6b | Units stay separate | slice 6 | |
| 6c | Disclose why a difference cannot be claimed | slice 5 | |
| 7 | Sorting uses the signed changes with gaps last | slice 7 | |
| 8 | Native headers work by keyboard | slice 7 | |
| 9 | Show % keeps the geometry and order | slice 8 | |
| 10 | Show % follows the reader between relevant scopes | slice 4 | |
| 11 | All 69 legacy cases have a traceable disposition | slice 8 | |
| 12 | The unit proof runs on plain Vitest | slice 8 | |
| 13 | Direct logic proof for presentation rules that need no DOM | slice 8 | |
| 14 | Preserve representative authenticated and real composition boundaries in E2E | slice 8 | |
| 15 | Preserve exact wording, accessibility, input distinctions, races and error/retry boundaries; distinct risks stay separately named | slice 8 | |
| 16 | Fewer maintained cases, reporting why repeated cases were consolidated or kept | slice 8 | |
| 17 | Before/after two-worker comparison with elapsed time incl. preparation, counts by engine and destination, slow cases and E2E cost | slice 8 | |
| 18 | Retire actSettled, React act wrapping and IS_REACT_ACT_ENVIRONMENT; remove spent support | slice 8 | |
| 19 | Each completed slice's faster proof is usable before the next slice lands | slice 8 | |
