# Keep the converted navigation proof whole and time-independent

**Identity:** SEED-334#keep-navigation-conversion-proof-whole
**Source:** [Converted navigation proof correction](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-navigation-conversion-proof-whole)

## Correction input

**Provenance:** retrospective of SEED-334#move-navigation-checks-and-retire-integrated-ui-test
(plan 648, story branch `claude/move-board-frame-and-project-navigation-checks-o`),
range `161830d70..40bba4d8e`: slice commits `54dfebff2`, `c3249d594`,
`e10d6698f`, `a480fc9de`, `5f02e37ef`, `b0b2ec166`, `373ff581d` and CI repairs
`d69851c43`, `40bba4d8e`. Its source promised that every distinct interim
assertion, including non-eager read counts and held/failed recovery, keeps a
named home at its real boundary.

**Current findings** (read-only review at `373ff581d`; recheck at the current
revision before changing):

1. `dashboard/frontend-tests/navigation/dashboard-header.spec.ts` pins
   `openDoughReads()` at 20 after settling and again after the 10-step
   Shift+Tab walk. Most of the 20 are story-record reads that
   `putFrontendBacklog` (`files: {}`) answers as transient 404s, and
   `dashboard/src/transientRecovery.ts` asks those again 15 s after settling;
   the page clock is not paused. A journey slower than 15 s (local load ~40 has
   been seen) counts 21+, so the check depends on time, and its "reads nothing
   again" claim rests partly on failure answers rather than settled reads.
2. The interim `board-paging-side-panel` journey's last step — while paged to
   Backlog/Taken beside the panel, a session arriving on a Backlog card stays
   on its card, keeps "Recently done 0 entries" and keeps the view — has no
   home. Plan 648 slice 3 named
   `frontend-tests/sessions/recently-done-active-story-sessions.spec.ts`, which
   checks only an arranged state at 54rem, never a session arriving while the
   view is paged.
3. `e2e/observation/project-read-isolation.spec.ts:204` cites the deleted
   `../../dashboard/tests/navigation/project-selection.spec.ts`; its home is
   `../../dashboard/frontend-tests/navigation/project-selection.spec.ts`.
4. `dashboard/frontend-tests/navigation/project-keyboard-navigation-focus.spec.ts`
   checks "no Doughnut story" and an unchanged Doughnut read count right after
   `heldDoughnut.release()`, before the released answer could arrive, so those
   two checks cannot fail. The isolation step before release does fail on a
   break (plan 648 slice 7 scratch break).

**Preserved promises and constraints:** every assertion the converted specs
make today stays; no product code change; default timeouts, no `test.slow()`;
files ≤250 lines; MakeMe and page-object conventions (Frontend paths select
both). The interim group, its shards and the sibling story's specs are
untouched.

## Proof gates

Each slice: rerun the installed test-entry selector for its paths, apply its
scratch breaks (reverted by editing back), run the changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -i npx playwright test --config dashboard/frontend.playwright.config.ts <paths> --reporter=list --workers=2`
(`--repeat-each=2` for slice 1), `npm run --silent typecheck:dashboard`, and
consumers from the consumer trace of any changed support. Local gate: use
`caffeinate -s -i` on awake macOS on AC power; on battery use the maintained
open-lid `caffeinate -i` procedure and inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

## Ordered slices

### 1. Make the converted read counts independent of time
Type: Structure
Status: planned
Proof: `dashboard-header.spec.ts` layout journeys and project switch, and
`project-keyboard-navigation-focus.spec.ts`. Settle the header's reads so the
count is not fed by transient 404s (publish the large backlog's story records,
or pause the page clock before `goto` as `answerBoardOnPausedPageTime` does),
and count only the reads the rule is about. In the focus spec, wait for the
released held answer (`untilPageReadsAnswered`) before the post-release checks.
Scratch breaks: an extra read per published read still fails the header counts;
dropping the late-answer guard in `src/requestedRead.ts` fails the post-release
check, or the plan records why this boundary cannot observe it. Show the
header count unchanged across a walk longer than 15 s of page time (advance the
paused clock), which today's spec would fail.

Behavior: a slow or fast journey → the same pinned read counts.

### 2. Restore the paging step beside an arriving session and the stale link
Type: Structure
Status: planned
Proof: `board-paging-side-panel.spec.ts` gains its final step: paged back to
Backlog beside the open panel, the machine answer observes a new working
session on a Backlog card (the `frontendCardSessions` pattern); the card shows
its session, the right control still reads "Recently done 0 entries", and
`expectShown(["Backlog","Taken"], …)` holds. Scratch break: a paging reset on
session arrival or a session counted into Recently done fails it. Repoint the
`project-read-isolation.spec.ts` comment.

Behavior: a session arriving while the Board is paged beside the panel → the
same view and counts.

## Decisive premises and observations

None beyond the findings above; each slice rechecks its finding first.
