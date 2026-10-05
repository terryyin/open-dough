# Four intermittently failing dashboard specs pass deterministically

**Identity:** SEED-100#dashboard-specs-deterministic
**Source:** [refined story](../../seeds/SEED-100-project-checks-trustworthy.md#dashboard-specs-deterministic).
**Prepared:** 2026-10-06. Planning only, in the established preparation workspace.

## Goal and boundaries

Each of the four specs fails only when the behavior it covers is broken.
Scope, constraints, and key examples are those of the source story. Material
exclusions:

- Other dashboard specs, apart from the two Cursor start specs that share the
  ad hoc Cursor spec's exact wait (slice 2). Codex start specs that check
  "First input accepted" with the default timeout were not surveyed; report
  any that the slice 2 helper obviously fits, but do not change them here.
- The product gap where a Cursor confirmation that arrives after the server's
  launch wait has expired reaches the page only on the 15 s poll
  (`server/hosts/cursor/launch.ts:178-195`). No observed failure depends on
  it.
- Any retry, sleep, skip, quarantine, weakened assertion, or wait longer than
  the awaited operation's own bound.

## Direction and PFE

Established structure supports the work. No North Star topic governs it and
none is added; no Accepted ADR constrains it. Reuse:

- `expectSettledPage` (`dashboard/tests/dashboardPage.ts:140`) as the one
  owner of "the page has read what changes its layout".
- `launchWaitMs` (`dashboard/tests/support/launchWait.ts`), whose documented
  rule is that a page waiting on a start's answer waits as long as the start
  itself may. `agent-launch-start-cursor.spec.ts:58-63` and its siblings
  already follow it.
- The fake Cursor's `FAKE_CURSOR_PAINT_DELAY_MS`
  (`tests/fixtures/fake-cursor:207`), already plumbed as
  `installFakeCursor({ paintDelayMs })`, for reproduction.
- `scripts/ci-repeat.sh` (plan 251) for the repeated CI run.

## Current findings (observed 2026-10-06 at a2cb672c)

All four CI failures ran on revisions from 2026-10-04. No `main` CI run since
2026-10-05 13:07Z has failed any of them (`gh run list --branch main --limit
60`, failed runs read with `gh run view --log-failed`).

| Spec | CI cause | State at HEAD |
| --- | --- | --- |
| `agent-launch-acceptance.spec.ts` | Product race: the served attempt gained `reporting` in memory before the kept file was renamed (run 37169060163 at `8cb57afc`). | Fixed by `3589f469` (keep, then assign, in `launchRun.ts:73-76`). It is not in the failing run's ancestry. `agent-launch-acceptance-kept-first.spec.ts` holds that rename and proves the order. No slice. |
| `side-panel-width.spec.ts` | Test budget: CI's trace shows `expectStillHolds`' `toPass` (line 81) taking 16.6 s of the 30 s budget, one wheel step per backed-off try. | Fixed by `7e5c4a0a` (ten wheel steps per try at a fixed 100 ms), which names run 37239925415. No slice; slice 3 re-observes it. |
| `agent-launch-ad-hoc-cursor.spec.ts` | Product race: the launch wait settled before a pasted instruction's chip was submitted, so the page read the record while it was still uncertain (run 37207067477 at `0cc8895c`). | Fixed by `48c9bbc7` and `759f9134`; `agent-launch-ad-hoc-cursor-split-screen.spec.ts` forces that order. The remaining exposure is slice 2. |
| `story-review-action.spec.ts` | Test race: `expectOnOneLine([inspect, action])` measures Inspect story at once and Review changes only once it appears, after the machine's sessions are read. That same read inserts the card's session panel and moves the group. | Still open: slice 1. |

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| story-review-action still fails at HEAD, through the sessions read | Slice 1 | Baseline: `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts side-panel-width.spec.ts agent-launch-ad-hoc-cursor.spec.ts story-review-action.spec.ts agent-launch-acceptance.spec.ts` on a loaded machine. Then a temporary `page.route("**/__agent-launch", …1500 ms…)` before `openBacklog` in the spec, reverted afterwards. | Baseline: only story-review-action failed (`expectOnOneLine`, `partArrangement.ts:44`). The trace frames show "Reading sessions…" before Review changes and a "Session unavailable" panel above the group after it. With the delay: fails every time at spec line 59, offset 200 px. |
| "Reading sessions…" is the page's only sessions-unread signal, and no `expectSettledPage` caller holds the sessions read | Slice 1 | `grep -rn "Reading sessions" dashboard/src`; grepped the 17 files that use `expectSettledPage` for `__agent-launch`, held sessions, or "Reading sessions". | One source, `src/SessionEntry.tsx:185`. No caller holds the read; the two specs that hold it (`agent-launch-recent-sessions`, `session-sidebar-reading`) do not use the helper. |
| The ad hoc Cursor spec gives the start's answer only the default 5 s | Slice 2 | Temporary `FAKE_CURSOR_PAINT_DELAY_MS: "6000"` in `cursorStart.ts` `extraEnv`, then ran `-g "why is the CI slow"`, reverted. | Fails at spec line 69 (`toHaveCount(1)`, 0 entries after 5 s). The page lists the session only after the start answers. Since `759f9134` that answer follows the kept confirmation. |
| The two other Cursor "Start session" specs wait on the same answer the same way | Slice 2 | Read `agent-launch-ad-hoc-cursor-split-screen.spec.ts:42-45` and `agent-terminal-cursor-launch-page.spec.ts:37-44`. | Split-screen: default `toHaveCount(1)` then "First input accepted". Terminal page: a 20 s wait on the "Ad hoc session started" log, then the same checks. |

## Outside-in proof

| Promise | Slice | Proof |
| --- | --- | --- |
| story-review-action reads its layout only after everything that changes card height has been read | 1 | With the 1500 ms sessions delay (temporary, reverted): fails before the change, passes after. Without it: passes. |
| A genuinely wrapped inspection group still fails | 1 | Unchanged `expectOnOneLine` assertion. The delayed run passes only because the wait now covers the read. |
| The ad hoc Cursor start specs wait for the start's answer within the start's own bound | 2 | With `paintDelayMs: 6000` (temporary, reverted): the ad hoc spec and the split-screen spec fail before the change and pass after. Without it: they pass. |
| A first prompt Cursor never confirms still shows uncertain | 2 | Unchanged "not.toContainText(\"First input acceptance uncertain\")" and the kept `firstInput.state` assertions. |
| The four specs pass deterministically | 3 | Locally under current load: `--repeat-each 5` on the four specs. On CI: `bash scripts/ci-repeat.sh 5` on the story branch, which reports no failing location among the four. |

## Slices

### 1. A story card's layout is read once its sessions are read too
Type: Behavior
Status: planned
Proof: the 1500 ms reproduction above fails at spec line 59 before the
change and passes after. `story-review-action.spec.ts` passes without the
delay, and every spec using `expectSettledPage` passes.

Behavior: the machine's sessions are read after the cards' preparation → a
spec waits for the page to settle and measures the inspection group → it
measures only after "Reading sessions…" is gone. Inspect story and Review
changes therefore come from one layout, and a real wrap still fails.

Extend `expectSettledPage` so a settled page has also read the machine's
sessions, alongside "Reading preparation…". Update the comment in the
story-review-action spec header ("Each layout is read once…") to name both
reads. If a caller turns out to need the sessions unread at that point, keep
the wait in story-review-action's own settled step instead, and record why.

### 2. A Cursor start's session entry is awaited for as long as the start may take
Type: Behavior
Status: planned
Proof: the `paintDelayMs: 6000` reproduction above fails the ad hoc
("why is the CI slow?") and split-screen specs before the change and passes
them after. All three specs pass without the delay.

Behavior: a Cursor "Start session" whose answer takes longer than 5 s → the
spec waits for the Recent sessions entry → it waits up to `launchWaitMs`, then
asserts "First input accepted" (or, for a blank start, "Opened without an
instruction") from the one read that follows the answer.

Give the wait one owner: a helper beside `parts(page).recentSessions` (or in
`launchCardPage.ts`, next to `startSessionField`) that returns the started
entry once it is listed within `launchWaitMs`. Use it in
`agent-launch-ad-hoc-cursor.spec.ts`,
`agent-launch-ad-hoc-cursor-split-screen.spec.ts`, and
`agent-terminal-cursor-launch-page.spec.ts`; the last replaces its 20 s wait
on the start log. Remove the reproduction's `paintDelayMs` afterwards; no
spec keeps it.

### 3. The four specs hold under repetition, locally and on CI
Type: Behavior
Status: planned
Proof: `env -u NODE_ENV npx playwright test --config
dashboard/playwright.config.ts side-panel-width.spec.ts
agent-launch-ad-hoc-cursor.spec.ts story-review-action.spec.ts
agent-launch-acceptance.spec.ts --repeat-each 5` passes on this machine
under its current load (record the load average). After the story branch is
pushed, `bash scripts/ci-repeat.sh 5` names none of the four specs.

Behavior: the delivered specs at the story branch's head → repeated runs
locally and on CI's runners → no failure of the four specs. A failure here
is a new finding for that spec: reproduce it as slices 1 and 2 did, and
replan before changing anything.

## Current decisions

- `side-panel-width.spec.ts` and `agent-launch-acceptance.spec.ts` need no
  change. Their CI failures predate the fixes named above; slice 3 is their
  proof.
- `launchWaitMs` bounds a wait on a start's answer. It is that operation's
  own bound, so using it is consistent with the story's constraint against
  longer timeouts.
- The local gate is the focused specs above, plus every spec using
  `expectSettledPage`, since slice 1 changes that shared helper. Repository
  guidance does not require the whole suite locally; CI runs it after
  publication.

Run Node commands with `NODE_ENV` unset: sessions the dashboard launches
inherit `NODE_ENV=production`, under which `npm ci` skips dev dependencies.
