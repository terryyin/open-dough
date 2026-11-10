# Dough Intent Coverage — SEED-272#select-recently-done-sessions

**Verdict: Confirmed missing test path.** This holds for the four specs I examined, listed below.

The promise is that while a linked row's done-catalog check is unanswered, choosing another project keeps the developer reading where they are. I broke that and the eight maintained tests stayed green, but a scratch test saw the reader moved to the wrong project.

**Next proof action:** add a journey test for this sequence:
1. In Intent, select a linked row and hold its done-catalog read.
2. Choose another project.
3. Release the late answer.

The test should check that the project, the Intent story and the reading stay where the developer went.

**This gap was already known (I'm not proposing a new repair):** finding 1 in the planned follow-up `SEED-272#prove-recently-done-check-supersession` (`.planning/slice-plans/529-prove-recently-done-check-supersession/PLAN.md`) says no test fails if this supersession is dropped. This probe backs that finding with an observed failure. Whether and how to repair it is your call.

## What I checked
- **Story:** `.planning/seeds/SEED-272-select-recently-done-sessions.md#select-recently-done-sessions`. **Plan:** `.planning/slice-plans/527-select-recently-done-sessions/PLAN.md`.
- **Revision:** `1935f49a58e35557e2026500baf61113351e691e`, in the detached worktree `…/trial/arms/A1-recently-done-current/scratch`.
- **Existing changes:** 6 SKILL.md files under `.agents/`, `.claude/` and `src/skills/` were already modified before the probe. I recorded them and left them as they were.
- **Promise:** "While the link is unresolved, the developer can still … keep reading where they are." Plan 527 adds: "Ignore answers superseded by a later choice or navigation."
- **Expected behavior:** a developer in Intent selects a linked row whose catalog hasn't been read yet, then chooses another project. The page stays on the project they chose and no story becomes selected.

## The fault
- **Where:** `dashboard/src/recentlyDoneSelection.ts:151`.
- **Change:** commented out `useLayoutEffect(supersede, [stories.selected, supersede]);`. Without it, choosing a project no longer cancels the unanswered check.
- No fixtures or assertions were edited.

## Maintained tests examined
- `dashboard/tests/sessions/recently-done-sessions-select.spec.ts` (2 tests)
- `dashboard/tests/sessions/recently-done-sessions-select-check.spec.ts` (1 test; it only covers a check being cancelled by choosing another row)
- `dashboard/tests/sessions/recently-done-sessions-select-development.spec.ts` (3 tests)
- `dashboard/tests/sessions/recently-done-sessions-select-touch.spec.ts` (2 tests)

None of them changes project while a check is held, so none reaches the broken path.

## Scratch test (independent witness)
I wrote `dashboard/tests/sessions/zz-intent-coverage-witness.spec.ts` for the probe and deleted it afterwards. It uses the existing `openSelectionPage` fixture and `holdPygardonCatalog`:
- In Intent it selects "Pygardon finished story" and waits until the catalog read is held.
- It chooses "Doughnut" with `chooseProject`, then releases the read.
- It logs whether the read was cancelled or answered, the selected project, and Intent's `data-selected-story`.
- It asserts that the project is `doughnut` and no story is selected.

## Runs
Every run used the same command: `npm run test:dashboard -- <4 specs> tests/sessions/zz-intent-coverage-witness.spec.ts --workers=1 --reporter=line`, on Chromium. The fault and restored runs added `--retries=0`.

| Run | Result | Scratch test log |
| --- | --- | --- |
| Baseline | 9 passed (8 maintained + scratch) | `catalog=aborted project=doughnut intentSelectedStory=null`. The test reached the path and the behavior was correct. |
| With fault | 8 maintained passed, scratch failed with `Expected: "doughnut" Received: "pygardon"` | `catalog=answered 200 project=pygardon intentSelectedStory=SEED-501#finished-in-pygardon`. The late answer moved the reader from Doughnut to Pygardon and selected that story. |
| Restored | 9 passed | `catalog=aborted project=doughnut intentSelectedStory=null` again |

**Restoration:**
- I copied the source file back from a backup taken before the fault. A shell trap was also set to restore it if a run was interrupted.
- `cmp` showed the restored file identical to the backup.
- After deleting the scratch test, `git status --porcelain` and `git diff` matched the pre-probe captures byte for byte. Only the 6 SKILL.md changes that were already there remain.

## Cost
- **Test runtime (measured, Playwright totals):** baseline 1.3 min, fault 59.6 s, restored 1.2 min, about 3.5 min in total.
- **Human effort:** not measured. No human input was needed during the probe.
- **Agent effort:** not measured, since no token or compute meter was available. My estimate is about 20 tool calls.
- **Start to report (measured):** 440,376 ms (about 7.3 min), from 1794304167022 to 1794304607398 Unix epoch ms. The start is `start_ms` from the run's `meta-start.txt`.