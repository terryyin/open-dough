# Count a repeated adapter attempt ID as ambiguous

**Identity:** SEED-236#count-repeated-adapter-attempt-ids
**Source:** [correction story](../../seeds/SEED-236-show-ci-adapter-proof.md#count-repeated-adapter-attempt-ids),
from the execution retrospective of `SEED-236#show-ci-adapter-proof` on
2026-11-05.
**Source review:** [source-review.md](source-review.md)

## Provenance and findings

The reviewed story promised that the tab shows a summary only when "no other
discovered attempt has that same `attemptId` and revision", and otherwise says
the attempt is ambiguous at its revision; its deferral reads "proof for an
adapter whose attempt IDs repeat across runs at one revision (shown as
ambiguous)". Reviewed commits: `64588d692`, `1df738da4`, `261261eb1`,
`9e8075f07`, landed in `4a8129838`. The reviewed story section and plan are
recoverable from before-cleanup `779d5f96a20dd5ddf671f0eaaf3f3624cefc61cd`.

Current finding (read-only check on `2fd857370`): `asAdapterAttempts` in
`dashboard/server/baseCiAdapterAttempts.ts` counts shared `attemptId`s over
`discoverAncestorCandidates()`, which returns `retained =
latestCommandAttempts(attempts)` (`src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs`,
`ci-command-attempts.mjs`): only the newest attempt per SHA, check and
context. A scratch adapter answering run r2 attempt "1" and run r1 attempt
"1" for one check at one revision returned only r2/1, so the shown attempt was
not ambiguous and the tab would ask for, and could show, a summary keyed only
by `attemptId` and revision. The spec
`dashboard/tests/intent-ci-proof-adapter-reasons.spec.ts` ambiguity test and
`tests/support/dashboard-story-branch-ci-adapter.test.mjs` use different
`check` names, the remainder the reviewed plan's premise table left open
(before-cleanup `779d5f96a20dd5ddf671f0eaaf3f3624cefc61cd:.planning/slice-plans/470-show-ci-adapter-proof/PLAN.md`).
`src/skills/dough-execute-plan/manuals/custom-ci.md` "## CI proof reads" and
`docs/dashboard-development-intent.md` state the unpruned rule.

## Preserved promises and constraints

- The verdict, the shown attempt (newest per check) and every other proof
  reason are unchanged; an ambiguous attempt asks no adapter.
- `discoverAncestorCandidates()` keeps returning the newest attempts per
  check to its other consumers (`ci-runs.mjs`,
  `ci-mailbox-revision-coverage.mjs`); the execution observer never asks
  `proof`.
- The GitHub Actions proof path is untouched (ADR 0008: ambiguous evidence is
  never a negative result).

## Outside-in proof

`dashboard/tests/intent-ci-proof-adapter-reasons.spec.ts` gains a same-check
case: two runs both with attempt `1` for one check at `R`, newest shown,
Proof says the attempt is ambiguous at its revision, no counts, no `proof`
request. `tests/support/dashboard-story-branch-ci-adapter.test.mjs` asserts
the judged `adapterAttempt.ambiguous` for that shape. Existing adapter,
observer and CI status tests stay green.

## Slices

### 1. A repeated attempt ID of one check is ambiguous
Type: Behavior
Status: done
Proof: Playwright `dashboard/tests/intent-ci-proof-adapter-reasons.spec.ts` and `intent-ci-proof-adapter.spec.ts`; `bash scripts/test.sh tests/support/dashboard-story-branch-ci-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-command-attempts.test.mjs`; `npm run typecheck:dashboard`

Behavior: given an adapter whose `discover` answers run r2 attempt `1`
(newer) and run r1 attempt `1` for the same check at `R`, the CI status
verdict and shown attempt are r2's as before, and Proof says the attempt is
ambiguous at its revision with no counts and no adapter `proof` request.
The ambiguity count uses the attempts `discover` answered at that revision
(for example exposed beside the retained candidates by the adapter
acquisition), not only the retained newest ones. `custom-ci.md` and
`docs/dashboard-development-intent.md` describe the rule as built.

## Current decisions

- One slice; Story Branch or Trunk Mode is the executing session's choice. No
  release is part of this correction: `custom-ci.md` / `custom-ci-proof.md` are
  payload guidance and stay Proposed until the next release.
- Ambiguity counts `discoverAnsweredAttempts` (pre-retention); verdict still
  uses `discoverAncestorCandidates` (newest per check).

## Accepted proof (slice 1)

- Playwright: `caffeinate -s -i npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent-ci-proof-adapter-reasons.spec.ts dashboard/tests/intent-ci-proof-adapter.spec.ts --reporter=list` — 6 passed (same-check ambiguous, no `proof` request; other reasons unchanged).
- Node: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh tests/support/dashboard-story-branch-ci-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-command-attempts.test.mjs` — pass (`adapterAttempt.ambiguous` for same-check; answered vs retained).
- `npm run typecheck:dashboard` — pass.

## Refactor disposition (slice 1)

Interrupted refactor agent split `## CI proof reads` into
`manuals/custom-ci-proof.md` and renamed `asAdapterAttempts` params to
`retained`/`answered`. Coordinator finished recovery: file-size ≤250 for
`custom-ci.md`, updated `ci-proof-summary.md` link, re-proved Playwright and
node suites. Outcome: clean (file-size + doc seam).

## Concern evidence

- Slice-plan refinement was not needed: one outcome, one proof loop.
- No remaining slice-specific concern was identified.
