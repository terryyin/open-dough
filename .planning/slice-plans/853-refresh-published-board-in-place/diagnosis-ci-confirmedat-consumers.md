# Diagnosis: ci-confirmedat-consumers

## Failure
- CI run 45985813983 attempt 1 on a58ebe3 (slice 4).
- "dashboard-backend / shard 2/3": `authenticated-read-retained-answers.spec.ts:62`, `:167`; `authenticated-read-retained-answers-moved.spec.ts:92`, `:164` (two cases); `authenticated-read-retained-answers-bounded.spec.ts:130`. `toEqual` of the two processes' answers differs only in the membership answer's `confirmedAt`.
- "dashboard-frontend": `accessible-board-keyboard.spec.ts:43`. Tab reached the new Refresh button where the expected order had the first card's Start refinement.

## Reading of the evidence
- Retained answers: slice 4 put `confirmedAt` on the open's (membership) answer. Each process confirms origin again and gets its own time. That is intended: each verified check records a new `confirmedAt`. Retention (`dashboard/server/retainedAnswers*`) keys and budgets pinned reads by revision and path. It never sees the membership answer's times, so no retention or byte-budget behavior changed. The moved spec compares against a first visit that runs later, so "the later process's time is not earlier" cannot be asserted uniformly. The journey helper already drops `askedAt` from the membership answer for the same reason.
- Keyboard: DOM order is Start session, legend, Refresh, then cards. Refresh shows visible focus (the order check also asserts `:focus-visible` and an outline). This is not a defect: the expected order was missing the new stop.
- Both failed at HEAD locally with the CI signature: `ci-ca-backend-before.log` (6 failures, `confirmedAt` only) and `ci-ca-kbd-before.log`.

## Fix (test-only)
- `dashboard/test-support/retainedAnswersJourney.ts`: the membership answer leaves out `confirmedAt` beside `askedAt`. Revision, backlog and every other answer are still compared as before.
- `dashboard/frontend-tests/navigation/accessible-board-keyboard.spec.ts`: Refresh comes after the Preparation badge legend in the expected order (22 → 23 stops).

## Proof
- Keyboard spec passes (`ci-ca-kbd-after.log`).
- The backend specs in the slice-4 trace plus the 3 retained-answers specs: 121/121 strict pass (`ci-ca-backend-trace.json`).
- The 48 frontend spec files in the slice-4 trace: 119/119 pass (`ci-ca-frontend-trace.log`).
- The 27 E2E specs in the slice-4 trace: 49/49 strict pass (`ci-ca-e2e-trace.json`, load ~28).
- `typecheck:dashboard` exits 0. `scripts/lint.mjs` exits 0.
- Consumer trace of this repair (base HEAD), in `ci-ca-consumer-trace.txt`:
  - The 3 retained-answers specs ran.
  - `e2e/observation/authenticated-read-retained-answers-reload.spec.ts` ran and passed (`ci-ca-e2e-reload.json`).
  - `dashboard/test-support/revisionReuseCalls.ts` is excluded: it is named only in a comment.

## Round summary
Round 1 took about 5 active minutes. Both causes are slice 4's expected new wire field and focus stop, so the fix is in the tests. Every spec the slice-4 trace selected now passes. No product defect found.
