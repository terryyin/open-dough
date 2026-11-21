# Diagnosis: e2e Codex Done page timeout

- **Failure signature:** `e2e/sessions/agent-terminal-done-codex-page.spec.ts:51` "mark completed unattached Codex done, reload, fail reopening then reopen original identity" timed out. It was waiting to click the session's `Mark as done` button in `sendDoneMarkAnyway` (`dashboard/test-support/support/markDone.ts:96`), called from the spec at line 98.
- **CI:** run 44907064093, attempt 1, job 136854807752 (`e2e / shard 2/6`), step "Run the group's browser tests". The failing revision is c8bf873fd on the story branch claude/tie-done-capture-cases-to-the-real-branch-entry. The artifact is under `e2e/test-results/2026-11-21T13-05-30.601Z-2434`. The remaining jobs were still running at classification.
- **Attribution:** the story's changes (slices 1–4) touch only `dashboard/backend-tests/**` and the README. They do not touch e2e, `dashboard/test-support/**` or production code. The three earlier branch revisions (41a73f63b, 465efa3a8, dc5ffe2f5) passed full CI, and the eight latest trunk runs passed. Trunk's last changes to the spec were 8db471fe5 and fb448cfb9.
- **Parked changes:** stash OID e7afbb4b0dcd5998aef801fc742a4933d43ab089, holding the slice 5 spec edit and the plan's slice 4 note. Its record is in the execution evidence `ci-repair-stash-record.json`.
- **Rounds:** none yet.

## Round 1

- **Inventory:** run 44907064093 attempt 1 completed; only `e2e / shard 2/6` failed.
- **Trace evidence** (artifact `e2e-playwright-report-2`, `trace.zip`): at 120.30s the More session actions control read `aria-expanded="false"`, and the test pressed Enter on it. At that moment the Story C card had the class `story-card-starting`, and its `FIELDSET.story-card-frame` was `disabled`. The card's status read "Story C: refinement start settled on this machine; waiting for published story state." The published snapshot was not yet complete: the plan-detail reads (`path=.planning/slice-plans/{A,B}/PLAN.md`) went out at 120.685s. The page then posted `/__agent-launch/reconciled` at 120.83s, about half a second after the press. The Enter press inside the disabled fieldset did nothing, and `disclose` never presses again. Mark as done stayed hidden until the 30s timeout.
- **Hypothesis H1:** `disclose` in `dashboard/test-support/support/sessionEntryDisclosure.ts` presses Enter once. Playwright's `press` does not wait for the control to be enabled. A card whose startup is still reconciling has its frame disabled, so the press is lost. The race is between the test acting and the page finishing its first complete snapshot read. Our story's changes do not touch it.
- **Forced reproduction (temporary instrument):** in the spec, a `page.route` delays the plan-detail reads (`slice-plans`) by 1500 ms. This keeps the frame protected when the press lands. Prediction: before the fix, the unattached case fails with the CI signature. Stopping count: one forced run before the fix and one after. Then run the unmodified spec 3 times; stop at the first failure.
- **Result: H1 confirmed.**
  - Forced reproduction before the fix (load 10.7): the unattached case failed with the CI signature, a timeout waiting for the card session's `Mark as done` at `markDone.ts:96`. Record: evidence `d1-forced-before.log`/`.exit`(1).
  - The same forced reproduction after the fix: exit 0. Record: `d1-forced-after.*` (load 10.2).
  - The instrument has been removed. The unmodified spec then passed 3/3 at load 8.4–8.9 (`d1-plain-{1,2,3}.*`).
- **First fix attempt, reverted:** `disclose` waited `expect(control).toBeEnabled()` before its Enter press. In the consumer run, `session-workspace-retirement-claude-done.spec.ts:47` failed every time. That spec calls `sessionActions` on purpose while the frame is protected, holding the reads, and relies on the press doing nothing. The helper change was therefore wrong and is fully reverted; test-support now matches HEAD.
- **Fix:** the spec calls the journey's own `settled()` after `openStoryColumnsJourney`, before its first press. Journeys in this area follow the same convention: they press only on a settled page, or wait first for the frame to be enabled.
  - Forced reproduction with the fix: exit 0 at load 52 (`d1-forced-after2.*`).
  - The instrument has been removed. The unmodified spec passed 3/3 at load 48–60 (`d1-plain2-{1,2,3}.*`).
- **Attribution:** the defect is in this spec and predates this story. Our backend-only changes do not touch it. CI showed it by timing alone.
- **Unrelated defects:** none found.
- **Temporary diagnostic edits:** the spec instrument was added and then removed; no instrument remains.
- **Round count:** 1; minutes are in the clock status at return.
- **Consumer run under heavy load, against the reverted helper change:** `d1-consumers-{e2e,fe,be}.*` ran 70 e2e, 15 frontend and 2 backend specs. Load rose to 65 because these were our own parallel runs on top of outside work. 36 e2e files failed, and 3 frontend files failed (`d1-rerun-{e2e,fe}.txt`). That tree is no longer the candidate. The final diff touches only this spec, which is its own only consumer. These failures were not rerun on the final tree. The classification is still open for the CI run on the repair.
- **Round 1 closed:** cause confirmed and the fix proven. Diagnosis rounds 1, 4.3 active minutes.
