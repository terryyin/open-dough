# Intent Coverage: project change cancels an unanswered done-catalog check

**Verdict: Confirmed missing test path** (within the four selection specs examined).

**Next step:** add a journey test for this case. While a linked row's done-catalog check is unanswered, the developer picks another project. After the held catalog read is released, the test should assert that the reader stays on that project with no Selected story.

**Matches an existing plan.** This is not a new repair decision. Plan 529 (`SEED-272#prove-recently-done-check-supersession`, `.planning/slice-plans/529-prove-recently-done-check-supersession/PLAN.md`) finding 1 already says that dropping this line breaks no test, and its "Project change and Open supersede an unanswered check" test row covers this transition. The probe adds a faulted observation behind that finding. It does not test the plan's separate explicit-Open case.

## What was checked
- **Story:** `.planning/seeds/SEED-272-select-recently-done-sessions.md#select-recently-done-sessions`. The promise: "While the link is unresolved, the developer can … keep reading where they are". The module comment adds: "another project chosen meanwhile supersedes an unanswered check."
- **Revision:** `1935f49a58e35557e2026500baf61113351e691e`, in the isolated detached worktree `.../trial/arms/A2-recently-done-candidate/scratch`.
  - Before the probe, it already had changes to six trial-skill files. I saved its status and diff before starting.
- **Fault:** in `useRecentlyDoneSelection` in `dashboard/src/recentlyDoneSelection.ts`, I deleted `useLayoutEffect(supersede, [stories.selected, supersede]);`. It was the only match, and fixtures and assertions were left alone.
- **Changes to the suggested approach:**
  - **Assertion:** the suggested one does not cover this path. The `expectProjectChoice(page, "Open Dough")` / `data-selected-story` absence check in `recently-done-sessions-select-check.spec.ts` only runs after the check is replaced by choosing *another row*. In that case, `select()` itself calls `abandonCheck()`, so the deleted effect is never needed. Another row in Development (`select-development.spec.ts`) goes the same way.
  - **Command:** widened to the nearest relevant checks, `npm run test:dashboard -- tests/sessions/recently-done-sessions-select --workers=1 --reporter=line`. That is 8 tests in the check, development, touch and base selection specs.
  - **Fixture:** used as suggested: `openSelectionPage` with folders open-dough, doughnut and pygardon, plus `holdPygardonCatalog`.

## What the runs showed
1. **Baseline:** 8 passed (1.1m). The scratch witness also passed on baseline. It holds Pygardon's catalog in Intent, chooses the linked row, waits for the held read, then picks Doughnut with `chooseProject` and releases the read. It recorded `catalogRead=aborted project=doughnut selectedStory=null linkedPressed=false`. So the check did reach the project-change transition and was cancelled.
2. **Fault:** the same 8 still passed (47.2s). The scratch witness failed and recorded `catalogRead=answered project=pygardon selectedStory=SEED-501#finished-in-pygardon linkedPressed=true`.
   - So the late linked answer moved the Intent reader from Doughnut, the project they chose, to Pygardon and set the Selected story. That breaks the promise.
   - None of the maintained specs changes project while a check is in flight, so none of them followed this path.
3. **Restore:** the original file was copied back by a trap. Its sha1 `64b7aef37c2be1d15c6839f5ebd34c36d5ae6ff6` matches the pre-probe copy, and I deleted the scratch witness spec.
   - `git status --porcelain` and `git diff` match the pre-probe records exactly, so the trial-skill changes are kept.
   - The same command then passed 8/8 (44.2s).
   - The witness's failure artifacts are left in the git-ignored `dashboard/test-results/`.

## Cost
- **Test runtime (measured, Playwright's reported wall time per run):**
  - Family: baseline 1.1m, fault 47.2s, restored 44.2s.
  - Witness: baseline 13.6s; the fault run's time was not captured in the filtered output.
  - About 2.9 min of focused runs in total, not counting npm and Playwright startup.
- **Human effort:** unavailable. No person took part during this run and there is no separate measure.
- **Agent effort:** unavailable as a measured figure because no token or turn meter was available to the agent. Estimated at about 12 tool calls, one agent session.

- **Invocation-to-report elapsed.** 415738 ms (measured), from 1794305378088 to 1794305793826 in Unix epoch ms. The end clock was sampled after writing the prepared report body.
