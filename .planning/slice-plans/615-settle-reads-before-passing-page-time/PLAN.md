# Settle detail reads by default before passing page time to a check

**Identity:** SEED-344#settle-reads-before-passing-page-time
**Source:** [Settle detail reads by default before passing page time to a check](../../seeds/SEED-344-settle-reads-before-passing-page-time.md#settle-reads-before-passing-page-time)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

Maintainers stop getting revision-check timeouts caused by page time passing
over an in-flight detail read. The ordinary "pass time until the next check"
step settles outstanding page reads first; a journey that deliberately keeps a
read held asks for that through a variant whose name says so.

Included: make `passTimeUntilChecked` settle outstanding page reads before
advancing page time (comment states why); remove `passTimeUntilCheckedAfterSettled`
once the default does the same; give callers that must pass page time while a
read stays held an explicitly named variant; keep existing journey observations
and assertions on the default case timeout. Excluded: product auto-refresh
behavior, raising or overriding timeouts, `test.slow()`, waits on wall-clock
time, and rewriting other active executions' uncommitted work (SEED-324,
SEED-332, SEED-334 — reconcile call sites when merging). This plan authorizes
no implementation by itself.

## Architecture and PFE

Reuse the existing settle-then-check behavior already owned by
`passTimeUntilCheckedAfterSettled` in `dashboard/tests/autoRefreshJourney.ts`
(it calls `untilPageReadsAnswered` then the plain check step). Change that
file's default `passTimeUntilChecked` to own the settle-first rule; do not add
a second helper family or move the responsibility out of the auto-refresh
journey module. No product code, ADR, or North Star topic is implicated: this
is test-journey pacing only. Helper file is under 250 lines; call-site edits
are import and name changes. Re-run `wc -l` on every actual edit.

## Decisive premises

Observed at `071db1eaf` in this workspace (AC power; `caffeinate -s -i`).

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Settling before the check is what AfterSettled already does | Slice 1 helper change | `passTimeUntilCheckedAfterSettled` calls `untilPageReadsAnswered` then `passTimeUntilChecked` (`autoRefreshJourney.ts`) | Settled |
| Making settle the default keeps direction-disclosure and held-before-check journeys green | Slice 1 proof | Scratch: `passTimeUntilChecked` called `untilPageReadsAnswered` first; AfterSettled aliased to it; then `caffeinate -s -i -- npx playwright test` on `direction-disclosure`, `steady-refresh`, `auto-refresh-detail-recovery`, `auto-refresh`, `story-readiness-accessible` → 12 passed in 38.0s; scratch reverted | Settled: hold-then-check callers that start the held read from that check do not hang |
| AfterSettled call sites are rename-only once the default settles | Slice 1 caller update | At HEAD, 43 `passTimeUntilCheckedAfterSettled` name refs outside the helper; 97 plain `passTimeUntilChecked` name refs | Settled |
| Plain settle-first prevents the CI flake class | Slice 1 rationale | Seed evidence: 11 one-off switches to AfterSettled, last `4ffa3df4f` for `direction-disclosure.spec.ts` (CI run 43394751685, dashboard shard 6/13); Terry chose correcting the default | Settled as retained evidence |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| Default step settles outstanding reads, then the check arrives on steady pace without arming detail recovery | 1 | `dashboard/tests/stories/direction-disclosure.spec.ts` (same-project refresh through loading / replacement / failure) |
| Journeys that hold a detail before the check that starts that read keep their mid-read observations | 1 | `dashboard/tests/observation/steady-refresh.spec.ts`, `auto-refresh-detail-recovery.spec.ts`, `auto-refresh.spec.ts` (held backlog / claims shapes), and `story-readiness-accessible.spec.ts` (queued plan focus while a seed is held) |
| AfterSettled name is gone; former callers use the default | 1 | `rg passTimeUntilCheckedAfterSettled dashboard/tests` empty; former callers import `passTimeUntilChecked` |
| Callers that must pass page time while a read stays outstanding use the named held variant | 1 | Variant exported with a name that says reads stay open; any such caller (audit during the slice) uses it and shows why the read is held; scratch found none among the held-before-check shapes above |

## Ordered slices

### 1. Settle reads by default before passing page time to a check

Type: Behavior
Status: done
Proof: focused dashboard specs and call-site grep above; consumer trace over
`autoRefreshJourney.ts` exports; `npm run typecheck:dashboard` and full
check-only `npm run lint`

Behavior: a dashboard journey asks for the next revision check through the
ordinary helper → outstanding page reads settle first → page time advances to
the check on its steady pace → detail recovery is not armed by that step. The
helper comment states that reason. `passTimeUntilCheckedAfterSettled` is
removed; its callers use the default. A second export, named so it is clear
reads stay open (recommended: `passTimeUntilCheckedWhileReadsOutstanding`),
keeps the former plain "advance without settling" behavior for a journey that
must pass page time while a held read is already outstanding; its call sites
show why the read is held. Callers that pass with the default need no other
change. Reconcile with SEED-324 / SEED-332 / SEED-334 call sites only when
merging; do not rewrite their uncommitted work.

## Local gates

Slice 1 runs the proof specs above with `caffeinate -s -i` on AC power (on
battery: lid open, `caffeinate -i`, then read `pmset -g log`), per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos),
plus any further consumer the export trace names, `npm run typecheck:dashboard`,
the full check-only `npm run lint`, and `npm run --silent format`. Hosted CI
(`ci.yml`, push) is the integrated completion check. Apply the project's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Resolve test paths through the installed MakeMe and page-object
skills (`dashboard/tests`: both). Never sleep in tests, use `test.slow()`, or
raise suite, file, group, or hook timeouts.

## Plan review

Refinement not needed: one Behavior slice, one proof loop, settle-first already
owned by AfterSettled, scratch showed no hung held-before-check callers.
Remaining slice-specific concern: none.

## Current decisions

- Held-variant name: `passTimeUntilCheckedWhileReadsOutstanding` unless a
  clearer existing journey term appears during the slice; the name must say
  that outstanding reads are left open.
- Hold-then-check callers that only start the held read from that check stay
  on the default; switch only callers that must advance page time while a read
  is already outstanding.

## Learnings

## Execution context

- Mode: story-branch. Owned linked worktree: `/Users/terryyin/git/open-dough/.worktrees/settle-detail-reads-by-default-before-passing-pa`; branch `codex/settle-detail-reads-by-default-before-passing-pa`. Originating and execution checkout are this worktree; default/integration checkout: `/Users/terryyin/git/open-dough`.
- Publisher: `dashboard-territory.local-open-dough`; agent: `YeongSheng-chan`; authorized remote: `origin` (`terryyin/open-dough`); final target: `main`. Accepted Take on trunk and execution branch: `50b59da0bf7a83e633c67077e5de4e61b3351816`; starting revision: `e6e615bdd08e8e13337c8ea25770eefc5e6e52b0`; initial candidate matches Take. Claim CI: unobserved.
- Checkout preparation: `npm ci` with unchanged locked metadata, then passing `npm run typecheck:dashboard` on Node v24.21.0. Hook is check-only staged lint/typecheck; selective formatter is `npm run --silent format`.
- CI: GitHub Actions, verified `ci.yml` / `CI` / workflow 351271804. Story observer coordinator `seed344-codex`, directory `/tmp/dough-ci-501/watch-maUSNv`, PID 51833, stream session 9474, yielded cell `g34:11`; checkout as above; target execution branch.
- Replanning: preserve existing planning authority; no explicit overrun option. No numeric slice target or hard limit supplied; one coherent Behavior slice and proof loop.
- Proof decision (local macOS host): AC power; 48 GiB RAM, 39% system-wide memory free, load 5.40/7.13/10.60, no active heavy proof identified in process snapshot. Run focused/consumer browser proof at two workers with `caffeinate -s -i`; source promises all journeys locally, so a full dashboard run may be required after consumer audit, under shared suite admission. Keep unrelated active work untouched. Implementation agent owns commands through terminal results; reconsider on failure/contention or changed workload.

## Accepted slice 1 proof

Source-review IDs were compared to the unchanged source, implementation and concrete observations, then recorded with the installed obligations tool. No uncovered slice promise remains. Final hosted CI and incoming sibling reconciliation retain their target CI and landing lifecycle owners.

Default ordering: direction-disclosure starts a second check with B still held, observes unchanged page time, loading and no problem, releases B, observes the next check at 15–15.25 seconds and ordinary failed-check continuation. Held-read variant: Intent source-target recovery keeps a source read held across a check and asserts previous source/revision before release; its original focus, offset and eventual new-content assertions remain.

Consumer audit: 53 whole direct/indirect browser spec files, 104 cases, terminal success under default timeouts. Exact command:

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-comparison-taken.spec.ts dashboard/tests/intent/intent-ci-status-kept.spec.ts dashboard/tests/intent/intent-ci-status-story.spec.ts dashboard/tests/intent/intent-ci-wall-time-history-pending.spec.ts dashboard/tests/intent/intent-done-project-refresh-proof.spec.ts dashboard/tests/intent/intent-done-project-refresh-reading.spec.ts dashboard/tests/intent/intent-done-project-refresh.spec.ts dashboard/tests/intent/intent-home-activation.spec.ts dashboard/tests/intent/intent-project-scope-timing-refresh.spec.ts dashboard/tests/intent/intent-project-visit-ci.spec.ts dashboard/tests/intent/intent-revision-notice.spec.ts dashboard/tests/intent/intent-revision-planning-only.spec.ts dashboard/tests/intent/intent-revision-settings-update.spec.ts dashboard/tests/intent/intent-revision-update-boundaries.spec.ts dashboard/tests/intent/intent-revision-update-outcomes.spec.ts dashboard/tests/intent/intent-source-target-recovery.spec.ts dashboard/tests/intent/intent-story-becomes-done.spec.ts dashboard/tests/intent/intent-story-changes-only.spec.ts dashboard/tests/intent/intent-test-optimization-candidates-revision.spec.ts dashboard/tests/launches/responsive-session-reconciliation.spec.ts dashboard/tests/launches/start-eligibility.spec.ts dashboard/tests/navigation/accessible-board-keyboard.spec.ts dashboard/tests/navigation/accessible-board.spec.ts dashboard/tests/navigation/frame-board-look.spec.ts dashboard/tests/navigation/story-reference-done-recovery.spec.ts dashboard/tests/navigation/story-reference-done.spec.ts dashboard/tests/navigation/story-reference-navigation.spec.ts dashboard/tests/observation/auto-refresh-branches.spec.ts dashboard/tests/observation/auto-refresh-detail-recovery.spec.ts dashboard/tests/observation/auto-refresh-project-isolation.spec.ts dashboard/tests/observation/auto-refresh-rate-limit.spec.ts dashboard/tests/observation/auto-refresh-recovery.spec.ts dashboard/tests/observation/auto-refresh-unusable-branch.spec.ts dashboard/tests/observation/auto-refresh-visibility.spec.ts dashboard/tests/observation/auto-refresh.spec.ts dashboard/tests/observation/limit-recovery-check.spec.ts dashboard/tests/observation/owner-replacement-recovery.spec.ts dashboard/tests/observation/project-read-recovery.spec.ts dashboard/tests/observation/published-facts-isolation.spec.ts dashboard/tests/observation/shared-observer-check-reuse.spec.ts dashboard/tests/observation/steady-refresh-bound.spec.ts dashboard/tests/observation/steady-refresh-carry.spec.ts dashboard/tests/observation/steady-refresh-inspection.spec.ts dashboard/tests/observation/steady-refresh.spec.ts dashboard/tests/observation/story-cards-before-comparison.spec.ts dashboard/tests/observation/unchanged-assignment-credit.spec.ts dashboard/tests/observation/unchanged-records-refresh.spec.ts dashboard/tests/stories/branch-progress-reading.spec.ts dashboard/tests/stories/direction-disclosure.spec.ts dashboard/tests/stories/recently-done-progressive-failed-read-refresh.spec.ts dashboard/tests/stories/story-dependencies.spec.ts dashboard/tests/stories/story-readiness-accessible.spec.ts dashboard/tests/stories/story-readiness-gaps.spec.ts
```

Additional terminal passes: named six-file focused proof (including Intent variant), strengthened direction-disclosure alone, `npm run typecheck:dashboard`, `git diff --check`; old helper code search empty. Detailed setup/assertion mapping: `/tmp/seed344-implementation-evidence.md`; recursive installed-script consumer trace with every listed disposition: `/tmp/seed344-consumer-trace.md`; actual selected list: `/tmp/seed344-selected-test-list.txt`.

Freshness at acceptance: unchanged at trunk/base `50b59da0bf7a83e633c67077e5de4e61b3351816`. Named SEED-324, SEED-332 and SEED-334 remain Taken, with no incoming commits; no accepted sibling change affects this slice.

Independent refactor `/root/refactor_slice`: `none — already clean`, `## REFACTOR COMPLETE`; no edits, tests skipped, accepted proof unchanged. All checked files under 250 lines (largest test source 241). Delivery freshness repeated unchanged at Take; named siblings still Taken, no incoming accepted change.

## Retrospective

Planned execution recovered from published Take `50b59da0bf7a83e633c67077e5de4e61b3351816`, prepared by `e6e615bdd`; attributable implementation is `7da9700a3a07b653062bfc1a3bb4366eefbc7fb5`, accepted on the execution branch with suffix base at Take. No intervening unrelated revision. All ordered slices delivered; branch CI pending on the retained observer.

Outcome/product review complete: compared unchanged seed and source-review commitments against aggregate committed helper, migrated callers, deterministic default and held-variant observations, 104-case consumer proof, typecheck and full lint. Existing shared journey owner and three-tier test strategy remain coherent; no product subsystem, architectural choice or ADR change. Existing E2E journeys supplied the regression boundary; two strengthened observations retain integration value without a new test family or redundant suite. No unsupported residue, obsolete code, promise gap or bounded correction identified. Direction alignment: improves stable automated proof of the existing product; no product/backlog change recommended.

Process selected by `skipProcessRetrospective: false`, deferred under the installed deferred-process-review rule until wrap-up supplies Intent Coverage and dispositions (`intentCoverage: true`). Current conversation/tool results provide process history. This pending closure duty does not limit completed product/proof review.

## Execution complete

Product advice: no change. Test-journey pacing now has the safe default and a deliberate outstanding-read alternative; relevant existing journeys retain their observations. No new product work is justified.

## Wrap-up inputs

Intent Coverage at `254a06c8cbf03bbf3e364315226f1fda7de46b5c`: Caught, faulted next check took 28,250ms versus 15,250ms maximum; baseline/restored passed, scratch removed. Verbatim report and no-follow-up disposition retained in `/tmp/seed344-intent-coverage-disposed.txt`, to persist through the Done record. Checked helper/test remain unchanged.

Deferred process review completed from coordinator conversation/tool results and coverage report/disposition: isolated locked setup, terminal proof ownership, scratch restoration and cleanup succeeded; no new supported process finding or correction. Product/proof review reused unchanged. Lasting test-journey rule assimilated into `dashboard/tests/writing-journeys.md` (247 lines); no temporary North Star topic or unique rule remains only in spent records.
