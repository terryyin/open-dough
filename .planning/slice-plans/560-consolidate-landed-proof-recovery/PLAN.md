# Consolidate the landed proof recovery journey

**Source:** [Minimal retrospective correction](../../seeds/SEED-289-landed-proof-recovery-correction.md#consolidate-landed-proof-recovery)
**Source review:** [source-review.md](./source-review.md)

**Identity:** SEED-289#consolidate-landed-proof-recovery

## Goal, scope and provenance

Give maintainers one complete integration journey for pending landed-CI recovery
through stop, launch-record expiry and two collectors, with every meaningful
observation preserved. This removes parallel fixture/assertion ownership; it
adds no product behavior or guaranteed performance saving.

The product retrospective of original story
`SEED-285#trace-landed-proof-timing` reviewed exactly these own published commits:

- `d4130605530aa4aed22c3d2be0e7ff5ff89ad968`
- `6dd3948b12681f72480e1135f2c02eeadc13734a`
- `65e40e9d64b71db19955b49be68160baea07a104`

Recover the original ready source contract with
`git show 8554eb19e1b0944f7261120ff38af38de5f40ab0:.planning/slice-plans/554-trace-landed-proof-timing/PLAN.md`.
The original source identity and reviewed manifest above remain usable after
its seed section and plan are removed; this correction does not depend on them.
Supplier commits are context, not attributed changes in that reviewed set.

The new pending case in
`dashboard/backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts:147`
repeats the real recovery journey already owned by
`dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts:54`.
The newer case adds actual retained validated V2 summary/by-file evidence,
public scoped measurement and an OFF-reader restart. The older case owns
initially expired capture exclusion, mixed point/gap ancestry order, the exact
public wall-time answer, shared-store concurrency and development no-acquisition.

Include strengthening that older journey before removing only the duplicated
pending case. Keep both final-build backfill variants in the newer file.
Exclude production changes, unrelated cases, a new feature/performance promise,
profiling, suite-wide optimization, and injected DTO/unit-only replacement proof.

## Architecture and reuse

PFE chooses the existing `landed-ci-history-lifecycle.spec.ts` recovery owner;
the final-build-without-proof and legacy-unreadable-proof cases own different
starting conditions and stay separate. Reuse `serveCollectedTrunkRuns`,
`collectedScopeFileSummary`, `collectedScopeHistory` and
`restartAsLandedCiReader`; keep real Git, actual CLI summary bytes, artifact
acquisition, atomic storage and authenticated public read boundaries.

Follow [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus)
and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
One recovery concept has one integration owner; collected local evidence stays
separate from published workflow authority. The existing North Star topic
[One Intent workspace with landed CI evidence](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence)
supports retained proof and local reading. No architectural choice, ADR conflict,
new direction or North Star update is needed.
Maintained promises remain in
[CI comparison and scope history](../../../docs/dashboard-development-intent-ci-comparison.md)
and [CI status and collection](../../../docs/dashboard-development-intent-ci-status.md).

## Outside-in proof ownership

All rows belong to slice 1 and the strengthened older integration journey,
except the two explicitly retained final-build variants.

| Preserved promise / key example                                | Observable proof                                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Initially expired captures are excluded                        | Original expired landing remains absent from kept/public history.                                                                           |
| First pass sees prior point, no-build gap and pending run      | Existing exact public pending answer and receipt observations stay.                                                                         |
| Stop, expire launches, complete CI, start two collectors       | Recovered attempt appears once; original mixed ancestry order and exact public wall-time answer stay.                                       |
| Actual validated V2 summary and per-file evidence survive      | Retained recovered build proof equals the actual CLI-produced summary, with original build keys and retained landing set.                   |
| Both collectors read the same scoped evidence                  | Recovered entry totals `500 case / 50 file`, folder `200 / 20`, and zero-file `0 / 0` are independently expected through public reads.      |
| Reader restart acquires no CI data                             | Close the other collector, restart the surviving one with collection OFF, repeat all scope reads and compare unchanged GitHub-call count.   |
| Development reads shared collected history without acquisition | Preserve the older journey's separate development GitHub and zero Actions requests before and after recovery.                               |
| Final build backfills without reopening resolution             | Keep both newer-file variants, their exact artifact-request counts, retained landings/build dedup and entry/folder/zero restart assertions. |

Entry and zero-file assertions currently live in the retained final-build
variants. Adding them to the older pending journey completes its scoped proof;
they are not described as existing assertions in the removed pending case.

## Decisive premises and preparation evidence

Preparation reused the invoking execution's owned checkout at
`65e40e9d64b71db19955b49be68160baea07a104`, branch
`codex/trace-a-done-story-s-timing-history-into-test-pr`; no new workspace,
assignment or Take was created. This is planning only; implementation and
publication remain outside this delegation.

| Consuming operation / premise                                                  | Observed form, profile, result and remainder                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing real recovery journey reaches public history                          | Retained terminal `/tmp/trace-proof-285-slice3-backend-consumers.json`, 2026-11-09 13:25 UTC, same checkout, Playwright boundary profile: 26 selected cases via `backend-tests/intent/landed-ci --grep-invert <new-case-titles> --workers=1`; exact argv is in the record. The older journey passed, 2917 ms, no retry.                    |
| Actual scoped recovery and distinct backfills run through the proposed support | `/tmp/trace-proof-285-slice3-lifecycle-proof.json`, 13:21 UTC, same checkout/profile, `backend-tests/intent/landed-ci-scope-proof backend-tests/intent/landed-ci-scope-retained-window.spec.ts --workers=1`: nine passed; duplicate pending case 3730 ms, both backfills passed, no retry.                                                 |
| Post-refactor support still serves actual scoped recovery                      | `/tmp/trace-proof-285-slice3-refactor-playwright.json`, 13:35 UTC, same checkout/profile: nine selected recovery/identity cases passed, including all three lifecycle cases; no skip/retry. Records retain literal Playwright argv.                                                                                                        |
| New identity and plan allocation are unused                                    | Installed `identity-evidence --identity SEED-289#consolidate-landed-proof-recovery` at HEAD reports unlisted, highest SEED-288, no gaps. Read-only origin/main tree at `f73ae69b60375c090319709fc77db6647168f114` has no later seed; highest allocated plan is 559. Local and published candidate paths were rechecked before writing 560. |

The current proof route was listed at 2026-11-09 14:01 UTC in the same checkout:
`/tmp/trace-proof-285-correction-plan-selection.json` records the focused command
below with `--list`, selecting exactly four cases: the older journey, duplicate
pending case and both final-build variants. This listing ran no tests.

Source/assertion inspection confirms the two journeys share pending → stop →
expiry → concurrent collection while carrying the distinct observations above.
The retained runs are concrete observations, not a forecast of time saved.
No unresolved behavior/engine premise remains for planning; the combined
stronger journey is execution work and must be green before deletion. Reuse
retained baselines only while relevant inputs/profile remain unchanged.

## Ordered slices

### 1. Give pending landed-CI recovery one complete integration proof

Type: Structure
Status: done
Proof: The strengthened older lifecycle journey and both separate final-build
backfill variants pass through the existing real boundaries and independent
expected values; every proof row above remains owned.

Internal change: remove the duplicated recovery scenario, keeping one cohesive
journey that proves both wall-time and scope-proof retention. This directly
owns the evidenced retrospective correction; external behavior is unchanged.

1. Before edits, settle the pre-change baseline with the focused command below
   or matching retained evidence. Confirm four selected cases and their actual
   assertions; diagnose every failure under the policy below before continuing.
2. Strengthen the older journey using the actual collected summary for its
   recovered run. Preserve its original expected history, expired exclusion,
   mixed order, build keys, concurrency and separate development reader. Arrange
   explicit file timings through shared MakeMe-backed support. Add exact
   retained-summary and entry/folder/zero public-read assertions for both
   collectors, then a collection-OFF reader restart and repeated no-acquisition
   reads. Close the second collector before counting reader-only calls.
3. Run the strengthened older journey while the newer duplicate still exists.
   Review the assertion mapping against both originals. Only after equivalent
   proof is green, remove the newer pending/two-collector case and its now-unused
   imports; retain both final-build backfill variants and every unrelated case.
4. Re-run the focused selection (three cases after consolidation), perform
   independent post-change refactoring and trace changed consumers through the
   installed execution workflow, then run the affected mechanical checks.

Safe stopping point: a green, behavior-preserving consolidated suite. Do not
publish deletion before the surviving journey owns every preserved observation.

Sizing: one Structure outcome, one proof loop and two existing spec files;
fixture support already exists. No independent second outcome or speculative
abstraction is required. No numeric slice target was supplied; implementation,
focused verification and cleanup are included in this bounded hypothesis.

## Verification and current decisions

Focused pre/post command from the repository root:

```sh
npm run test:dashboard -- backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts --workers=1
```

Local gate: that focused selection, `npm run typecheck:dashboard`, and the
checkout's applicable lint/format hooks for changed files. This follows
[project test automation guidance](../../../AGENTS.md#test-automation) and the
Structure preservation boundary; no production/shared harness contract changes
are planned, so no full-suite baseline is required. If execution changes shared
support, extend the consumer trace and proof to its actual consumers.

Start long runs fully awake. The maintained macOS sleep guard is
`caffeinate -s -i` on AC; on battery plug in, or keep the lid open under
`caffeinate -i` and read the sleep log afterwards, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Inspect current host load/memory and competing runs before expensive checks;
retain coverage when sequencing or reducing workers.

Carry [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written into execution and every repair handoff. Keep default timeouts,
observable events/controlled clocks, MakeMe arrangement, dedup/concurrency and
no-acquisition counts. Do not add sleeps, `test.slow()`, skips or retry-based fixes.

No blocking start dependency is needed: this follows the original feature's
publication; original work and this correction may be published together.
The supplied reviewed commits are the actual source provenance; no future
landing SHA or reconciliation is assumed. This plan does not change priorities
or queue the correction; original-story wrap-up owns its adoption.

## Plan concern review

Refinement was not needed: one cohesive Structure correction has a stable
outside-in owner, explicit assertion transfer and a green-before-removal stop.
No remaining slice-specific boundary, cumulative-design, sizing or proof concern
was identified. Readiness is recorded separately through the installed
product-backlog recorder; it grants no execution authority.

## Learnings

Scoped multi-landing history returns prior builds as proof gaps beside the
recovered selected point; entry/folder/zero assertions target `run/43/1` within
that full response rather than expecting a single-entry array as in the removed
one-landing duplicate. Post-change refactor extracted `expectCollectedScopePoints`
and public wall-time history answer builders so the strengthened journey stays
under the 250-line file-size check.

## Accepted proof (slice 1)

Focused command green after consolidation and after refactor (3 cases):

```sh
caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-history-lifecycle.spec.ts backend-tests/intent/landed-ci-scope-proof-lifecycle.spec.ts --workers=1 --reporter=list
```

Also `npm run typecheck:dashboard`. Strengthened older journey owns retained
validated summary, dual-collector then OFF-reader scoped reads, expired
exclusion, mixed order, exact wall-time, concurrency, and development
no-acquisition; both final-build backfill variants remain in the newer file.

## Execution complete

Product advice: no change
