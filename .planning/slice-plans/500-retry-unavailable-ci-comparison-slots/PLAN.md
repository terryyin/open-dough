# Retry unavailable CI comparison slots

**Identity:** SEED-118#retry-unavailable-ci-comparison-slots
**Source:** [Retry unavailable CI comparison slots](../../seeds/SEED-118-dashboard-reading-reliability.md#retry-unavailable-ci-comparison-slots)
**Source review:** [source review](source-review.md)

## Goal and scope

A developer reviewing a done story in Intent recovers its CI timing
comparison with **Check again** after a temporary read failure left
Baseline, Branch, Landed, or the whole comparison unavailable, without
restarting the dashboard process, while final answers keep costing no further
GitHub requests.

Included scope, preserved behavior and scope limits are the seed's. In short,
excluded: automatic or timed retry, per-slot memory that keeps final slots
while re-reading only the failed one, persisting comparison answers across
processes, and any change to gap wording, the read bound, or rate-limit
cooldown and demand admission.

## Outside-in proof and ownership

| Promise (seed) | Owner | Proof |
| --- | --- | --- |
| An answer with an `unavailable` slot or an `unavailable` whole answer is not final; any other done answer still is (finality rule; examples 3, 4 rule part, 5) | Slice 1 | Unit proof in `tests/support/dashboard-later-trunk-landed.test.mjs` (or a sibling unit test beside it) of `isFinalCiComparisonAnswer`: each of Baseline, Branch and Landed `unavailable` → false, whole-answer `unavailable` → false, a final `none`/`not-applicable` answer → true, existing running and awaiting cases unchanged |
| A failed first listing recovers on the next read of the same process; a final answer is reused with no further listings (examples 1 read part, 2) | Slice 1 | New Playwright spec `dashboard/tests/intent/intent-ci-comparison-retry.spec.ts`: Baseline `head_sha` listing answers `noConnection` once, then a run; the first selection shows Baseline unavailable with its reason; a reload of the page shows the Baseline build; a further reload makes no further Baseline listing (counted in the answerer) |
| **Check again** on a done comparison, worded and placed as the judged branch's, disabled while reading; re-reads the comparison and the endpoint proofs it shows; also present after a whole-answer unavailable and after a failed read (examples 1, 2 Check again part, 4 UI part, 5) | Slice 2 | Same spec: after the failed first read, **Check again** (by role and name) shows the Baseline build and the before → after summary without a reload; **Check again** on the now final answer adds no Baseline listing; while the listing keeps failing each **Check again** shows the unavailable reason again; the existing unrecoverable-history journey in `intent-ci-comparison.spec.ts` sees **Check again** beside the whole-answer explanation |
| Request accounting and Intent documentation describe the rule truthfully | Slice 1 (accounting), slice 2 (Check again wording) | [GitHub request accounting](../../../dashboard/GITHUB-REQUESTS.md) CI timing comparison paragraph and [CI timing comparison](../../../docs/dashboard-development-intent-ci-comparison.md) reread against the shipped behavior at each slice |

The new spec sets no test, file or group timeout and uses no `test.slow()`
(AGENTS.md test automation); it waits through `selectDoneStoryForCiComparison`'s
expectation bounds and observable panel states only.

Consumers of the changed rule, found by searching
`isFinalCiComparisonAnswer`, `rememberCiComparisonAnswer` and
`useIntentCiComparison`: `dashboard/server/intentCiComparisonRead.ts`,
`dashboard/src/IntentCiEvidence.tsx`, `dashboard/src/IntentCiStatus.tsx`,
`dashboard/src/IntentCiComparison.tsx`, and
`tests/support/dashboard-later-trunk-landed.test.mjs`. Header comments in
`intentCiComparisonAnswers.ts`, `intentCiComparisonRead.ts`,
`useIntentCiComparison.ts` and `IntentCiEvidence.tsx` that say a done
comparison is "read once" are updated with the slice that changes it.

Local gates at each slice boundary: the Intent CI comparison family
(`dashboard/tests/intent/*ci-comparison*.spec.ts`, 12 specs today, plus the
new spec) and the unit test above through `bash scripts/test.sh`,
`npm run typecheck:dashboard` and `npm run lint`. Run Playwright as
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`
with `/opt/homebrew/bin` first on `PATH`, under the maintained macOS sleep
guard ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
`caffeinate -s -i` on observed AC power, or the lid-open `caffeinate -i`
procedure on battery with sleep-log inspection. The change stays inside the
done-comparison read and its panel, so the family is the suite covering the
changed surface; hosted CI runs the rest.

Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A failed first endpoint listing is remembered and a later read in the same process does not recover it; the done comparison has no **Check again** | Slices 1–2 (the symptom) | 2026-11-07 at `ab156df67`, this worktree after `node scripts/setup-native.mjs npm`, `browser`, `check`: a scratch spec built like the Trunk Mode journey in `intent-ci-comparison-gaps.spec.ts`, its `serveActions` answerer returning `noConnection` for the first Baseline `head_sha` listing, run with the Local gates command; selected, counted **Check again** buttons, reselected after `page.goto("/")` | Baseline showed "… runs?head_sha=… failed: GitHub is unreachable"; 0 **Check again** buttons; after reload Baseline still unavailable and the Baseline listing count stayed 1 |
| Treating `unavailable` slots and whole answers as not final makes the next read list afresh and recover | Slice 1 | Same spec and revision with a scratch edit of `isFinalCiComparisonAnswer` (whole-answer → false; `slot.kind !== "unavailable"` added), then reverted | After reload Baseline showed run 200 passed; Baseline listing count rose to 3. The scratch spec and edit were removed; `git status` showed only the seed |
| The fixture can fail and restore one endpoint's listing within one test | Slices 1–2 proof | Same observation: `CommittedOrigin.serveActions` answerer with `noConnection` from `dashboard/tests/originAnswers.ts` | Confirmed |
| `useIntentCiComparison` re-reads when its `check` counter changes, so a Check again can reuse it | Slice 2 | Code read at `ab156df67`: the effect depends on `[source, identity, check]`; `check` is bumped only on a Taken head change today | Confirmed by code; slice 2's spec is the behavior proof |
| The Intent CI comparison family and the rule's unit test pass locally as the proof route | Every slice's gate | 2026-11-07 21:28, this worktree at `ab156df67`: the Local gates Playwright command over `dashboard/tests/intent/*ci-comparison*.spec.ts` under `caffeinate -s -i` on AC power; `bash scripts/test.sh tests/support/dashboard-later-trunk-landed.test.mjs` | 42 passed in 2.7 min (load 5–10, 2 workers); unit test quiet pass, exit 0 |

No premise is left open.

## Current decisions

- One finality rule owns remembering: `isFinalCiComparisonAnswer` in
  `dashboard/server/intentCiComparisonAnswers.ts` returns false for any
  `unavailable` slot and for the whole-answer `unavailable`; no separate
  retry cache or per-slot memory is added.
- **Check again** for the done comparison follows the judged branch's button
  (`IntentCiJudgedBranch.tsx`): same name, a paragraph below the panel's
  content, disabled while reading. It bumps `useIntentCiComparison`'s
  existing `check` counter through a `checkAgain` the reading exposes,
  rather than a second read path. Endpoint proofs follow the re-read answer
  as they already follow a changed answer.

## Ordered slices

### 1. An unavailable comparison is read again
Type: Behavior
Status: done
Proof: as mapped above for the finality rule and the reload journey.

Behavior: a done story whose Baseline (or Branch, Landed, or whole
comparison) read failed in this dashboard process → the comparison is read
again (reselecting the story or reloading the page) → the endpoint is listed
afresh and its build shows once the listing succeeds; once every slot is
final, reading again asks GitHub nothing. GitHub request accounting states
which answers are not remembered and what they cost again.

### 2. Check again recovers a done comparison
Type: Behavior
Status: done
Proof: as mapped above for **Check again**.

Behavior: Intent's CI status shows a done story's comparison (with an
unavailable slot, a whole-answer unavailable, a failed read, or a final
answer) → the developer selects **Check again** → the comparison and the
endpoint proofs it shows are read again, the button disabled meanwhile; a
recovered slot shows its build, a final answer returns with no further
GitHub requests, and a still-failing read shows its reason again. Intent's
CI timing comparison documentation names the button and when it reads.

## Execution complete

Product advice: no change. The delivered rule and **Check again** meet the
story's goal; SEED-118 has no further queued story, and the default-timeout
cleanup this execution touched (one `test.slow()` removed with the moved
journey) is already the leading backlog story SEED-260. Proof limits kept
for wrap-up: Branch and Landed recovery rest on the shared rule's unit proof
rather than their own browser journeys, and whole-answer recovery is observed
through a fail-once 502 and an unreadable-then-readable history, not an
expired read bound.

## Accepted proof

- Slice 1 (2026-11-07): `bash scripts/test.sh tests/support/dashboard-later-trunk-landed.test.mjs`
  ("an answer with anything unavailable is read again; a final gap is
  remembered") passed; new `intent-ci-comparison-retry.spec.ts` passed and
  failed at the second read against the old rule; the Intent CI comparison
  family passed 43/43 in 2.9 min under `caffeinate -s -i` on AC power;
  `npm run typecheck:dashboard` and `npm run lint` passed. Refactor renamed
  the rule to `isFinalCiComparisonAnswer` (unit test, typecheck and lint
  rerun). Branch/Landed and whole-answer recovery rest on the shared rule's
  unit proof; slice 2's whole-answer journey adds a browser observation.

- Slice 2 (2026-11-07): `intent-ci-comparison-retry.spec.ts` Check again
  journeys (Story Branch Baseline recovery with before → after summary and no
  further Actions requests; endpoint proof re-read; still-failing listing with
  the button disabled while held; whole read 502 once; unrecoverable history
  recovered after unshallow) passed; the Intent CI comparison family passed
  47/47 (3.6 min, after refactor) and CI status consumers 21/21 under
  `caffeinate -s -i` on AC power; typecheck and lint passed. Refactor shared
  `CheckAgain` from `IntentCiJudgedBranch.tsx`, moved the unrecoverable-history
  journey into the retry spec without its `test.slow()`, and split comparison
  test support below 250 lines. E4's read-bound cause is not reproduced;
  whole-answer recovery is observed through a fail-once 502 and an unreadable
  then readable history.

## Learnings

- `selectDoneStoryForCiComparison` starts with `page.goto("/")`, so calling
  it again is the reload; the retry journey runs in about 8 s within the
  default timeout.
- Endpoint proofs are keyed by build subject, so an unchanged final answer
  never re-read them; Check again keys them on answered Check again reads
  (`checkedAgain`) so Taken head re-reads cost what they did.
- `tests/support/ghRequest.ts` `parseRequest` recognises Actions requests in
  specs; prefer it to new route regexes.
- GITHUB-REQUESTS.md already names **Check again** among the comparison's
  re-read triggers; slice 2 makes that true for a done comparison.

## Refinement review

Slice-plan refinement was not needed: two slices each own one observable
outcome with its proof loop, the first being the server rule a reload
observes and the second the button that triggers it in place; they share one
rule owner and one read hook rather than accumulating special cases. No
remaining slice-specific concern was identified.
