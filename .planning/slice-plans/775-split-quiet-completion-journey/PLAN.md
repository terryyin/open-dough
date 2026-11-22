# Keep the quiet completion journey within its timeout under load

**Identity:** SEED-341#split-quiet-completion-journey
**Source:** [Keep the quiet completion journey within its timeout under load](../../seeds/SEED-341-simplify-session-tests.md#split-quiet-completion-journey)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Developers should get the same `e2e/sessions/agent-completion-quiet.spec.ts`
result locally and in CI at any machine load. The work splits the three-case
journey (Land, Story Branch Wrap Up, Trunk Wrap Up) into two owners:

- **Closure and reporting** keeps the three cases in the existing spec
  without the `page` fixture. A worker that runs only this spec launches no
  browser.
- **Page** is a new spec that composes a record that is already retired and
  quietly reported, then reads it in Recently done. It runs no launch, no
  installed closure, and no installed reporting.

Every current observation moves to one of those owners, or is removed only
when the overlap check in Slice 1 finds another test that already proves the
same rule. The work keeps the default timeout and adds no override.

Exclusions:
- The other completion specs (`-attention`, `-cursor`, `-execution`,
  `-quiet-claude`) do not change.
- Fixture cost does not move out of the test budget. The developer rejected
  that lever.
- No dashboard behavior changes.

## Decisive premises and preparation observations

All observations ran in this workspace at `9a7abeef7` on 2026-11-22 with Node
24.21.0 after `npm ci`, and with `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset. The command was
`npx playwright test --config e2e/playwright.config.ts --reporter=list <specs>`.
`--reporter=list` was used only for this throwaway scratch observation. The
scratch spec `e2e/sessions/scratch-quiet-nopage.spec.ts` was the current spec
with `page` dropped from the fixtures and the page phase cut, from
`publishCommittedOrigin` to the end of the callback. It was deleted before
this record. Afterwards, `git status --short` showed only the seed.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| The page phase is a small share of a case's serial work | `--trace=on` at load 4.8, 2 workers. The cases took 5.3, 6.0 and 4.3 s. In the first case of a worker: before-hooks took 3.4 s (`dashboardServerInputsReady` 1.85, origin 0.57, dashboard 0.51, browser 0.27, page 0.18); launch ran to 4.9 s; the closure ran to 7.05 s; reporting ran to 7.29 s; the page phase ran 7.29 → 7.92 s. | Launch and closure, about 3.7 s, stay in each closure case. |
| Dropping the browser cuts work under load (consumed by Slice 2's sizing) | Alternating A/B runs with 46 CPU burners, 1-minute load 35 → 71. Current spec: 17.2/19.8/14.1 s and 15.0/18.2/15.2 s. Scratch: 11.7/15.2/14.0 s and 11.7/14.4/12.0 s. A second pair added 40 burners and ran the four sibling completion specs on `--workers 4` at load 52 → 59. Current spec: 17.3/21.4/20.6 s. Scratch: 15.5/17.8/14.6 s. This is a reduction of about 17–25% under the same load. | Proxy: the timeout did not reproduce (the current spec passed 9/9). In the diagnosis, `3a1ba5ca6` E4 timed out alone at load 34 → 49 from other executions; about 20% less work would bring that 31–33 s case to about 25–27 s. The real external load cannot be reproduced on demand. Slice 2 therefore proves the cut relatively and through the load-independent fact that no browser launches. |
| A retired, quietly reported Codex record can be composed without a real closure (consumed by Slice 1) | `dashboard/test-support/support/retainedReport.ts` `retained()` already composes a retired Codex record with a kept final report for `session-workspace-retirement*` and `agent-completion-attention`. `makeMe.aCompletionReport` (`Distribution/tests/support/completionReportTestData.mjs`) builds the receipt, outcome and `receivedAt`. | Slice 1 still has to compose `doneAt`, the `doneProblem` for a refused rename, and the native "still working" observation. Its proof observes the Recently done entry. |
| The parked observer-stop patch applies and reaches its path in a green run (consumed by Slice 2) | Not observed. The patch is `git show 3a1ba5ca6:.planning/slice-plans/768-make-launch-proof-orthogonal/diagnosis-agent-completion-quiet-observer-stop.patch`. It moves the `result.json` status assertion onto the success path, which the Story Branch and Trunk cases reach. | Slice 2 applies it, runs the spec once and keeps the patch only if it is green. Otherwise Slice 2 drops it and records why. |

Observation beyond scope: under the burners plus `--workers 4`,
`agent-completion-attention.spec.ts` ("installed attention report stays open…")
timed out at 30 s once. That spec has the same shape of serial work and stays
outside this story.

## Outside-in proof ownership

| Key example | Owner and signal |
| --- | --- |
| At load about 50 on 16 cores, each case passes inside 30 s | Slice 2: alternating runs, three of each, of `git show origin/main:e2e/sessions/agent-completion-quiet.spec.ts` (saved as a scratch copy) against the split specs under the same load. Record the loads, the per-case durations and the ratio. The closure-and-reporting worker launches no browser (trace shows no `Fixture "browser"`). The page spec runs no launch and no closure. |
| Story Branch: a failed write, then a retry that records; a duplicate returns the same receipt with no native call and no Git | Closure-and-reporting spec, unchanged assertions. |
| Trunk: a refused rename is recorded as a done problem; the entry offers Mark as done; a retried submission clears the problem with exactly one rename | Refusal recorded, retry clears it, no second rename: closure-and-reporting spec, through the HTTP retries. Refusal text and Mark as done on the entry: page spec, from a composed `doneProblem`. |
| A quiet completion shows Done and "Native session is still working", no Startup recovery and no attention message, reads the final report "Done.", and still shows Done after a reload | Page spec. |

## Local gate

Run from an awake machine on AC power, under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
`caffeinate -s -i`. Unset `NO_COLOR`, `FORCE_COLOR` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES`, keep the default reporter and the default
timeouts, and follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

- `npx playwright test --config e2e/playwright.config.ts e2e/sessions/agent-completion-quiet.spec.ts <new page spec>`
- `npm run typecheck:dashboard` and `npm run --silent lint`

## Slices

### 1. Recently done proves a quiet completion from a composed record

Type: Behavior
Status: done
Proof: the new page spec passes. Discrimination check: a scratch edit that
drops the composed `doneAt` makes the Done assertion fail, and a scratch
`doneProblem` removal makes the Mark as done assertion fail. Revert both.

Behavior: a Codex launch record that is already retired, with a quiet
completion receipt, is stored → the page opens Recently done → the entry
shows Done and "Native session is still working", no Startup recovery and no
`.session-attention-message`. It reads the native final report "Done." through
`thread/read` with turns, and still shows Done after a reload. A second case
composes the refused-rename `doneProblem`; its entry shows "Native rename
refused." and offers Mark as done. Build the record with MakeMe and the
existing `retainedReport.ts` composition, and drive the page through the
existing page objects (`parts`, `readFinalReport`, `sessionAction`). Before
writing each case, check `session-workspace-retirement-done.spec.ts` and the
other Recently done specs. Where one already proves an observation for a
Codex quiet completion, cite it in the spec's owner comment and do not repeat
it.

Accepted proof: `e2e/sessions/agent-completion-quiet-done.spec.ts` passes
(final structure, run `r1-refactor-quiet-done`, exit 0). Discrimination held
before the refactor's step restructure, which kept setup and assertions:
without `doneAt` the entry is not found; without `doneProblem` Mark as done
fails. Learnings: a composed `doneAt` must be recent or the store's retention
drops the record; a Done session reaches Recently done only once its story is
completed, so the spec shows `journey.completed` from the story-columns
journey; the entry is found with `sessionEntryShowing`, because filtering
articles by thread matches the done-story article too. No existing spec
already proved these observations for a quiet Codex completion. `retained()`
still makes one dashboard launch request against the fake Codex; it runs no
installed launch, closure or reporting.

### 2. Installed closure and quiet reporting run without a browser

Type: Behavior
Status: planned
Proof: the gate's quiet spec passes 3/3 with no `page` fixture. Apply the
parked observer-stop patch, run the spec once green, and keep the patch, or
drop it and record the reason here. Then run the paired load comparison from
the proof table and record its loads, durations and ratio here.

Behavior: for each closure, the real installed closure retires accepted work
→ installed quiet reporting records the receipt and `doneAt` with no native
interruption, and the rename follows the receipt. The Story Branch duplicate
and the Trunk rename-refusal retry keep their HTTP assertions. Remove
`publishCommittedOrigin`, the page reads and the `page` fixture from
`agent-completion-quiet.spec.ts`. Name the page spec as the owner of the
Recently done observations.

## Concerns

Refinement was not needed: the plan has two slices, one per owner, and
neither depends on deferred design. The remaining load risk is limited to
what the proxy observation records. The real failing load cannot be
reproduced on demand, so the absolute 30 s claim at load about 50 rests on
the relative cut and on no browser launching. Hosted CI and later loaded
local runs remain the ongoing check under the failure policy.

## Story obligations
