# Keep the converted navigation proof whole and time-independent

**Identity:** SEED-334#keep-navigation-conversion-proof-whole
**Source:** [Converted navigation proof correction](../../seeds/SEED-334-product-wide-end-to-end-tests.md#keep-navigation-conversion-proof-whole)
**Source review:** [source-review.md](source-review.md)

## Correction input

**Provenance:** retrospective of SEED-334#move-navigation-checks-and-retire-integrated-ui-test
(plan 648, story branch `claude/move-board-frame-and-project-navigation-checks-o`),
range `161830d70..40bba4d8e`: slice commits `54dfebff2`, `c3249d594`,
`e10d6698f`, `a480fc9de`, `5f02e37ef`, `b0b2ec166`, `373ff581d` and CI repairs
`d69851c43`, `40bba4d8e`. Its source promised that every distinct interim
assertion, including non-eager read counts and held/failed recovery, keeps a
named home at its real boundary.

**Current findings** (rechecked at `8d4b66d32`, 2026-11-18; observations in
[decisive premises](#decisive-premises-and-observations)):

1. `dashboard/frontend-tests/navigation/dashboard-header.spec.ts` pins read
   counts that change with time, in both of its journeys.
   - Layout journeys pin `openDoughReads()` at 20 after settling and after the
     Shift+Tab walk. 17 of the 20 are story-record reads that
     `publishLargeBacklog` (`files: {}`) leaves unpublished, which the
     substitute answers `404` with `recovery: "transient"`.
     `dashboard/src/transientRecovery.ts` then asks the whole read again 15 s
     after settling: the count becomes 40, and "reads nothing again" rests on
     failure answers.
   - With every record answered the page instead asks its revision check
     (`source` + `at`, `checkIntervalMs` 15 s). The project-switch journey's
     "6 and 6" already counts each project's first check, which
     `untilPageReadsAnswered` leaves alone, and the selected project's count
     becomes 7 after 15 s.
2. The interim `board-paging-side-panel` journey's last step — paged back to
   Backlog/Taken beside the panel, a session started from a Backlog card stays
   on its card, the right control keeps "Recently done 0 entries" and the view
   stays — has no home. Plan 648 slice 3 named
   `frontend-tests/sessions/recently-done-active-story-sessions.spec.ts`, which
   checks only an arranged state at 54rem.
3. `e2e/observation/project-read-isolation.spec.ts:204` cites the deleted
   `../../dashboard/tests/navigation/project-selection.spec.ts`; its home is
   `../../dashboard/frontend-tests/navigation/project-selection.spec.ts`.
4. `dashboard/frontend-tests/navigation/project-keyboard-navigation-focus.spec.ts`
   checks "no Doughnut story" and an unchanged Doughnut read count right after
   `heldDoughnut.release()`. The page has already cancelled that read when it
   left Doughnut, so release brings no answer back and no late answer exists
   for these checks to refuse; a page that keeps the read alive fails the
   earlier isolation step instead.

**Preserved promises and constraints:** every assertion the converted specs
make today stays; no product code change; default timeouts, no `test.slow()`;
files ≤250 lines; MakeMe and page-object conventions (Frontend paths select
both). The interim group, its shards and the sibling story's specs are
untouched.

## Proof gates

Each slice: rerun the installed test-entry selector for its paths, apply its
scratch breaks (reverted by editing back), run the changed specs with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts <paths> --workers=2`
(`--repeat-each=2` for slice 1), `npm run lint`,
`npm run --silent typecheck:dashboard`, and consumers from the consumer trace
of any changed support. Local gate: use `caffeinate -s -i` on awake macOS on AC
power; on battery use the maintained open-lid `caffeinate -i` procedure and
inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written and carry that link into every delegation and repair handoff.

## Current decisions

- The header counts cover reads of published work, with the page's
  time-paced revision check (`at`) left out, over an arrangement whose story
  records are all published. The real page clock stays: a paused clock keeps
  the failure answers. Publishing the records alone, or narrowing the count alone, leaves a read
  that time adds (P2).
- The project-switch pin becomes 5 and 5: the same assertion, restated without
  each project's first revision check.
- The substitute's `recovery: "transient"` answer for an unpublished path
  (`dashboard/tests/support/frontendAuthenticatedReadSubstitute.ts`) stays as
  it is; this correction arranges its own journeys.
- The focus spec keeps both post-release checks, sequenced after
  `untilPageReadsAnswered`, with a comment that says what they hold.
- The restored paging step starts its session from the Backlog card, as the
  interim journey did. A session arranged only in the machine answer reaches
  an open page at its next 15 s machine read, beyond the default expect
  timeout (P4).

## Ordered slices

### 1. Make the converted read counts independent of time
Type: Structure
Status: done
Proof: `dashboard-header.spec.ts` (four layout journeys and project switch)
and `project-keyboard-navigation-focus.spec.ts`. Scratch breaks: one extra
published-work read during the walk fails the layout count, and one extra on
switching fails the switch count. A scratch 17 s `page.waitForTimeout` before
each final count leaves every count unchanged, where today's spec gives 40
and 7.

Change: the large backlog publishes each of its 17 story records (an
arrangement beside `publishLargeBacklog` in `dashboard/tests/accessibleBoard.ts`,
through the MakeMe step the selected convention prefers), and both header
journeys count the project's reads other than its revision check, 20 and
5 + 5. In the focus spec, wait `untilPageReadsAnswered` after
`heldDoughnut.release()` and reword the closing comment to finding 4.

Behavior: a slow or fast journey → the same pinned read counts.

Accepted proof: both specs `--repeat-each=2` passed; breaks (a) and (b) failed
21 and 6; break (c), 17 s before the walk and switch counts, held 20 and 5/5;
the 23 traced consumer specs and the refactor's 10 board consumers passed.
`publishLargeBacklogWithRecords` and `countProjectWorkReads` (excluding
`revisionStreamAtParameter`) carry the arrangement. Follow-up named by the
refactor, outside this correction: `intent-project-scope-history-refresh.spec.ts:33`
still matches the literal `"at"`.

### 2. Restore the paging step beside a newly started session and the stale link
Type: Structure
Status: done
Proof: `board-paging-side-panel.spec.ts` gains its final step: paged back to
Backlog beside the open panel, Start execution on the ready Backlog card and
the attempt launching its session (`frontendAttempt` keeping the Taken
story's working session in its machine answer, `installFrontendLaunchBoundary`,
`backlogLaunchers`); the card shows one session, the right control still
reads "Recently done 0 entries", and
`expectShown(["Backlog","Taken"], ["Recently done 0 entries"])` holds. Scratch
breaks: a paging reset on session arrival, and a session counted into Recently
done, each fail it. Repoint the `project-read-isolation.spec.ts` comment, and
correct this spec's header comment about where the session check lives.

Behavior: a session started while the Board is paged beside the panel → the
same view and counts.

Accepted proof: the refactor gave the step its own test beside the paging
test, sharing `takenStoryWorking()` from `frontendCardSessions.ts`; it and the
side-panel-width consumers passed, and break (b), a session counted into
Recently done, failed at "Recently done 1 entry". Learning on
break (a): Backlog is the Board's first position, so a paging reset there is
no change; a forward move in the same render as the session's arrival still
left Backlog/Taken shown, and only a move timed after the page's requests
settle escapes the step, as in the interim journey. No settled
"session arrival processed" signal exists to assert after.

## Decisive premises and observations

All observed in this plan's workspace at `8d4b66d32`, 2026-11-18, with the
proof-gate command (one worker) on scratch copies of the named specs, since
removed.

| Premise and consuming operation | Result and remainder |
| --- | --- |
| P1. The layout count changes with time (slice 1 symptom). | The 1280 journey's arrangement, settled then `waitForTimeout(17000)`: 20 reads at settling, 40 after; 17 of each 20 answered 404. |
| P2. Published records plus a count without `at` hold over time (slice 1 remedy). | 1280 layout journey with the 17 records published as empty text and the count excluding `at`: 20 after settling and 20 after the walk plus 17 s; no failed answer. Records published and `at` counted: 21, then 22. Layouts differ only in viewport and font. |
| P3. The switch count changes with time and holds without `at` (slice 1). | Project-switch journey: 6 and 6 settled, 6 and 7 after 17 s; the only later read is `source=doughnut&at=…`. Every other read answered 200, five per project. |
| P4. A session started from a Backlog card while paged keeps the view (slice 2). | The paging spec with the step as slice 2 describes it passed; the session showed 0.5 s after Start. With the session only in a later machine answer the step also held, 12.6 s after the answer. |
| P5. The focus spec's post-release checks have no late answer to refuse (slice 1). | The held Doughnut request failed `net::ERR_ABORTED` 267 ms after the hold, before release at 302 ms; the count stayed 1. With `reading.abort()` removed from `dashboard/src/observationRecoveryWait.ts`, the spec failed at its pre-release revision check, with and without the added wait. |

Refinement: not needed; two Structure slices, each in its own specs.

Remaining slice-specific concerns: none identified in this review.
