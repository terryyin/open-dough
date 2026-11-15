# Slice 8 independent refactor

Reviewed final slice8 at HEAD9007a576291c with the installed post-change refactor checks, selected MakeMe/page-object conventions, the four original sources, assertion/helper maps, inventory and individual consumer dispositions. Root-owned PLAN/context/source-review were preserved. Whole-concept reach includes published source/revision answers, candidates, selected-story visits, browser request observations, held reads and runner registration. No production responsibility or architectural choice changed.

## Decision and edit

`dashboard/tests/support/frontendIntentReuseAnswers.ts` now calls existing `putFrontendCandidates` from `frontendServiceState.ts` instead of repeating its generic state assignment. The identical revision/record answer remains caller-supplied. This reuses the established candidate-state owner; no new family, API or abstraction was needed. Its Jobs/source/revision/stream/CI setup and all four test files are unchanged by this pass. Four publication rows in `slice-8-helper-invocations.md` now describe their actual controlled setup rather than claiming unrelated `openStoryIntent` observations: the original publisher supplies data and contains no browser assertions. Assertion maps and helper calls are unchanged.

No further candidate justified edits: browser observers retain independent request arrays and transient label observations, exact negative promises and measured scroll; selected-story continuation uses the existing whole-app owner and real Backend/E2E judgment remains separate. No file was renamed, extracted, split or deleted by refactoring. No production subsystem changed.

## Accepted proof correspondence

- `/tmp/s8-new-restored.json`: the candidate reuse setup is the only inspected setup changed by this pass; its whole-app entry, return, visible record/mode and exact record/locations1 assertions remain at `dashboard/frontend-tests/intent/intent-read-reuse.spec.ts:104`. Renewed below. The other15 selected observations remain unchanged, including Jobs cache/no-reading-moment, selected-story tree/diff/reading, project visits/reset, sidebar and revision notice.
- `/tmp/s8-backend.json`: reused12. Client global-fetch sharedRead7 and runner-ownership5 setup, implementation and observations are unchanged. They retain their stated client/runner limits and establish no server/GitHub claim.
- `/tmp/s8-e2e.json`: reused3. Real code acquisition/include/revision bytes, native Taken tree/Review equality and exact recorded Purpose GitHub content1 boundaries and observing sources are unchanged.
- Original baseline/fault/restored records and the maintained cache-fault discrimination remain unchanged: no production/cache edit was made. Listings/inventory establish registration only. Earlier accepted source1–7 observation boundaries are unchanged.

## Focused verification

Literal command:

`caffeinate -s -i env OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/s8-refactor-candidates.json npm run test:dashboard:frontend -- frontend-tests/intent/intent-read-reuse.spec.ts --grep 'the Test Optimization Candidates record is read once across leaving Intent and returning' --workers=1`

Exit0; `/tmp/s8-refactor-candidates.json`, run `0a5fbbd8-41cc-436e-a5c4-005e378f974c`; `frontend.playwright.config.ts`, phase `completed`, selected1, strict `passed`. Actual selected case: “the Test Optimization Candidates record is read once across leaving Intent and returning”; retry0 `passed`,3416ms; terminal `2026-11-15T19:16:02.635Z`. Native browser mode/record assertions and both exact count1 observations execute after the unchanged return sequence. This renews the sole changed setup while retaining the independent browser request observer.

`npm run typecheck:dashboard` exited0. `git diff --check` passed; untracked helper whitespace check emitted no errors (`git diff --no-index --check` returns1 for the added-file difference). All existing and proposed changed files remain at most250 project-formatted lines; `.planning/` is excluded by the project formatter, so PLAN's actual242 lines govern. No generated source was affected. Root owns final formatter/hook lint.

Before launch the actual macOS target was awake on AC100%, load6.06/7.04/6.68,54658 free and1031990 inactive16KiB pages; supplied handoff reported no competing owned proof. One narrow browser case, one worker and `caffeinate -s -i` were retained. Unrelated VM/bash work was left with its owners. Terminal results were owned; no observation is deferred to CI, no timeout override and no full suite. Reconsider on failure/contention. [Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md) applies as written.

## Consumer trace

Installed script record follows with every located path disposed. Incoming slice trace/dispositions remain in `slice-8-consumers-1..5.md` and `slice-8-consumer-delta.md`; this narrower trace covers this pass's helper reuse. Approximate active refactor time:13 minutes. No uncovered consumer or unresolved contradiction.


`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --path dashboard/tests/support/frontendIntentReuseAnswers.ts --path .planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-helper-invocations.md --path .planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-refactor.md --term prepareFrontendReuseJobs --term prepareFrontendReuseCandidates --term putFrontendCandidates` exited0. Raw `/tmp/s8-refactor-consumers-final-raw.md`.

# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-helper-invocations.md` | changed path |
| `slice-8-helper-invocations.md` | basename of `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-helper-invocations.md` |
| `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-refactor.md` | changed path |
| `slice-8-refactor.md` | basename of `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-refactor.md` |
| `dashboard/tests/support/frontendIntentReuseAnswers.ts` | changed path |
| `frontendIntentReuseAnswers.ts` | basename of `dashboard/tests/support/frontendIntentReuseAnswers.ts` |
| `prepareFrontendReuseJobs` | supplied |
| `prepareFrontendReuseCandidates` | supplied |
| `putFrontendCandidates` | supplied |

## Scope

Whole checkout at `9007a576291c`, including uncommitted and untracked files: 6896 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-helper-invocations.md`, `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-refactor.md`, `dashboard/tests/support/frontendIntentReuseAnswers.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

none found

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/frontend-tests/intent-candidates-read-recovery.spec.ts` | `putFrontendCandidates` | 19: `putFrontendCandidates,` | excluded: inspected standing-limit, refusal/malformed and manual Retry cases use the unchanged putFrontendCandidates API directly; the new reuse-helper caller cannot reach their setup or observations |
| `dashboard/frontend-tests/intent/intent-read-reuse.spec.ts` | `frontendIntentReuseAnswers.ts`, `prepareFrontendReuseJobs`, `prepareFrontendReuseCandidates` | 1: `import { prepareFrontendReuseJobs, prepareFrontendReuseCandidates } from "../../tests/support/frontendIntentReuseAnswers.ts";` | run: candidate leave/return case renewed above; reused: Jobs reopening/cache/transient-reading case from accepted Frontend16 because its setup function and independent observations are unchanged |
| `dashboard/frontend-tests/intent/intent-selection-reads.spec.ts` | `frontendIntentReuseAnswers.ts`, `prepareFrontendReuseJobs` | 1: `import { prepareFrontendReuseJobs } from "../../tests/support/frontendIntentReuseAnswers.ts";` | reused: both held-read/startup-selection cases in accepted Frontend16; only prepareFrontendReuseJobs is consumed here and its setup, request holds and label/count observations are unchanged |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/tests/support/frontendServiceState.ts` | `putFrontendCandidates` | 168: `export function putFrontendCandidates(` | run: putFrontendCandidates owner reached by renewed candidate case; existing function and answer contract unchanged; other callers excluded from the new caller effect |

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/647-move-intent-reading-and-review-checks/slice-8-proof.md` | `slice-8-helper-invocations.md`, `prepareFrontendReuseJobs`, `prepareFrontendReuseCandidates` | 7: `[Reuse](slice-8-read-reuse-assertions.md), [story reuse](slice-8-read-reuse-story-assertions.md), [reading place](slice-8-reading-place-assertions.md), [select…` | excluded: retained incoming proof/command reference; no runtime boundary and no source identity retired by this pass |
