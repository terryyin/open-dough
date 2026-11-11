# Intent proof strategy and settled premises

## Proof ownership and baseline

Each slice owns its finding's disposition, sibling-call-site sweep, before/after
example, implementation, cleanup and preserved regression proof in one loop.
Record affected specs, shared owner, distinguishing independent assertions and
literal verification command in this plan as execution learns them. An exact
contract or measurement retained directly is a supported disposition, not an
unresolved finding. Samples demonstrate readability; every affected caller
still needs a disposition and sufficient proof.

| Original finding / final promise | Owning slices and observable evidence |
| --- | --- |
| Comparison and Summary metrics/rows | 1: integrated/rendered rows, units, cardinality, order and unsupported comparisons with caller expectations |
| Sorting and relative presentation | 2: actual live keyboard activation/sort transitions; independently configured static presentation |
| CI status and Proof | 3: retained old answer, outstanding read and replacement, scope/gap/unit rows |
| Timing history | 4: build samples/reference; 5: selected scope sample/reference, gaps and recovery |
| Locations, source and recovery | 6: selected source/target line; 7: revision and failure/retention sequence |
| Story/perspective changes | 8: chosen story/file/view and kept reading, narrow layout, focus and Files sidebar |
| Retained CI follow-up | 9: Done entry, original/repeat/reference, links/keyboard and no new acquisition |
| One control owner with worthwhile cost | Every slice: all affected callers use the suitable owner; compare edit sites, call-site meaning and helper cost against `7eab3d6ca` and the execution base |
| Every distinct behavior and tier survives | Every slice: inspect assertions/setup and run changed specs plus transitive consumers; final Intent/frontend selection covers the aggregate change |

The source audit at `7eab3d6ca` is historical. At preparation base
`9779b93c12250fa7a6acafedcd661f7bbc468888`, the sampled helpers and fixtures
retain the documented seams; 158 dashboard test/support files changed since
the audit. Reconcile each current caller, rather than treating historical
counts or unchanged representative specs as complete coverage.

## Decisive premises

| Premise and consuming operation | Observation in this checkout / result / remainder |
| --- | --- |
| Integrated and static cases can use the existing comparison reader | Preparation selection includes adapter, mounted legacy and mounted units; all 32 selected cases passed at `9779b93c1` on 2026-11-11. The reader takes caller rows, not production-derived expectations. |
| Static and live sort proofs must retain distinct operations | `comparisonRendering.ts` inserts SSR markup without handlers; `comparisonMountPage.ts` mounts a live component. Selection includes mounted-sort and integrated Summary sort; all 32 selected cases passed at `9779b93c1` on 2026-11-11. Static `sort`/`showPercent` remain inputs. |
| Shared recovery observations can cross frontend/integrated setup | Selection includes integrated read-recovery and frontend candidate recovery under their existing separate fixtures; all 32 selected cases passed at `9779b93c1` on 2026-11-11. |
| Remaining reading examples reach real observable boundaries | Selection includes kept CI answer, wall/scope history, source browse, Purpose target line, story changes, reading place and retained follow-up; all 32 selected cases passed at `9779b93c1` on 2026-11-11. This establishes existing boundaries, not an unimplemented helper's benefit. |
| The local proof route can start integrated servers | Initial run failed because this worktree lacked `node_modules`, though parent tooling ran static cases. `npm ci` installed the lockfile locally; native setup check passed (Chromium 153.0.8010.12), and the repaired 32-case selection passed. No failure was waived. |

Before accepting any replacement proof, observe discrimination with one
plausible scratch fault at its real boundary and restore it. Unimplemented API
designs are proposals, not settled runtime facts. An unchanged existing proof
keeps its boundary; changing it reopens its corresponding premise.

## Focused commands

Use `npm run test:dashboard -- <selection> --workers=1` initially. These are
starting cohorts, not exclusions. Add every consumer found by the implementation
trace, including callers outside these names; run a whole affected family when
that is cheaper and sufficient. Existing proof is retained unless changed.

| Slice | Initial selection arguments |
| --- | --- |
| 1 | `'tests/intent/intent-ci-comparison' 'tests/intent/intent-summary'` |
| 2 | `'tests/intent/intent-ci-comparison.*(sort\|relative\|presentation)' 'tests/intent/intent-summary.*(sort\|relative\|presentation)' 'tests/intent/intent-ci-status-sort.spec.ts'` |
| 3 | `'tests/intent/intent-ci-status' 'tests/intent/intent-ci-proof'` |
| 4 | `'tests/intent/intent-ci-wall-time-history' 'tests/intent/intent-ci-prior-build-average.spec.ts'` |
| 5 | `'tests/intent/intent-scope' 'frontend-tests/intent-scope' 'frontend-tests/intent-project-scope-history' 'tests/intent/intent-project-scope'` |
| 6 | `'tests/intent/intent-code-browse' 'tests/intent/intent-gherkin' 'tests/intent/intent-purpose' 'tests/intent/intent-test-optimization-candidates-case.spec.ts'` |
| 7 | `'tests/intent/intent-revision-notice.spec.ts' 'tests/intent/intent-read-recovery.spec.ts' 'tests/intent/intent-test-optimization-candidates' 'frontend-tests/intent-candidates-read-recovery.spec.ts'` |
| 8 | `'tests/intent/intent-story-changes' 'tests/intent/intent-done-project-refresh-reading.spec.ts' 'tests/intent/intent-project-visit' 'tests/intent/intent-reading-place.spec.ts' 'tests/intent/intent-sidebar-toggle.spec.ts' 'tests/intent/intent-story-views-narrow.spec.ts'` |
| 9 | `'tests/intent/intent-ci-follow-up.spec.ts' 'tests/intent/recently-done-ci-automatic-repeat.spec.ts'` |

## Execution gates and learnings

- Run changed specs and transitive consumers, plus `npm run typecheck:dashboard`
  for shared TypeScript changes. Use the installed consumer-trace procedure
  during implementation. The final local selection covers Intent plus affected
  frontend/cross-family consumers; broaden to the dashboard suite only when
  actual changed shared fixtures or consumers justify it. CI configuration
  alone does not add a mandatory local full-suite gate.
- For long macOS runs start fully awake; on AC use `caffeinate -s -i`. On
  battery plug in, or use `caffeinate -i` with lid open and inspect sleep logs.
  See [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. A failure in the base
  or elsewhere is attribution, never an exemption. Keep MakeMe, causal waits
  and default timeouts. Apply independent post-change refactoring before commit.
- The missing-dependency failure was repaired by installing this worktree's
  lockfile and validating native prerequisites; all 32 selected cases passed.
  The separate restored sample passed after its intended local host profile
  was restored. Recheck host headroom before another expensive attempt.

## Accepted slice evidence

- Slice 1: [comparison and Summary acceptance](slice-1-evidence.md).
- Slice 2: [sort and presentation acceptance](slice-2-evidence.md).

- Slice 3: [CI status and Proof acceptance](slice-3-evidence.md).

- Slice 4: [build history and reference acceptance](slice-4-evidence.md).

- Slice 5: [current scope history, recovery and readiness acceptance](slice-5-current-evidence.md).

- Slice 6: [source locations and target-line acceptance](slice-6-evidence.md).

- Slice 7: [retained source and recovery acceptance](slice-7-evidence.md).

- Slice 8: [story and perspective reading acceptance](slice-8-evidence.md).

- Slice 9: [retained CI evidence and cross-tier acceptance](slice-9-evidence.md).
