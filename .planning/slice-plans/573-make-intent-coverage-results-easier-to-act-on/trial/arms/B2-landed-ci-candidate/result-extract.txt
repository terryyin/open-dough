# Dough Intent Coverage: SEED-285#see-landed-ci-wall-time-history

**Verdict: Caught.** The existing test fails when a skip that is waiting on CI proof stops the collection walk. The failure comes from the `untilKept` helper while it waits for `older`, the landing past the skip. A separate scratch check confirmed that `older` really is never collected under the fault.

**Next proof action:** None for this promise on the path checked. The existing test already catches this fault.

## Target
- **Story:** `.planning/seeds/SEED-285-landed-ci-timing-history.md#see-landed-ci-wall-time-history`. Collection rule: "waits while CI is queued or running", plus the confirmed-skip reuse rule.
- **Revision:** `9fcff1d9a765df93a6e3f783fcbbfd75b0b17fb6`.
- **Checkout:** I ran everything in the arm's isolated detached scratch worktree, `.planning/slice-plans/573-…/trial/arms/B2-landed-ci-candidate/scratch`, after checking its HEAD.
  - The harness actually started me in the parent branch checkout (`be07058e3`, which has local edits), not in the scratch worktree.
  - The cause is in `run-arm.sh`: it runs `cd "$scratch"` only inside the setup subshell, so `claude --print` keeps the caller's directory.
  - I did not edit the parent checkout.
- **Promise (kept as suggested):** a confirmed skip whose equivalent build's CI proof read goes unanswered stays `pending`/`waitsFor: "proof"`. The same collection walk still keeps and measures the older landings past it.
- **Fault (kept as suggested):** `dashboard/server/landedCiCollection.ts:158`. I changed `if (resolved.kind === "pending" && resolved.waitsFor === "read") return;` to `… && (resolved.waitsFor === "read" || resolved.waitsFor === "proof")) return;`. With this change, a skip waiting on proof ends the walk.
- **Fixture:** the first test, at `dashboard/backend-tests/intent/landed-ci-history-pending-proof.spec.ts:44`. It sets up:
  - `older`, with run 70 still running
  - build `b`, with run 71 passed
  - a newest `skip` resting on `b`, with run 71's proof `unanswered`
- **Command:** `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard -- backend-tests/intent/landed-ci-history-pending-proof.spec.ts --workers=1 --reporter=list`

## Run observations
1. **Starting state:** I recorded `git status --porcelain --untracked-files=all` before any change. The only edits present were the six trial-overlay `SKILL.md` files, and I left them alone.
2. **Baseline:** both tests passed (2 passed, 8.8 s).
3. **Fault run:** test 1 failed and test 2 passed.
   - The failure was `expect(received).toBeDefined()` / `Received: undefined` after a 5000 ms poll at `tests/support/landedCiHistory.ts:196`. That line is inside `untilKept`, which spec line 73 calls.
   - `untilKept` waits for landings newest first. `skip` was kept, so the timeout is on `older`.
   - The later `landedCiHistory` `toEqual` assertions were never reached. The check that catches the fault is `untilKept`'s wait for each landing to be kept, not the history expectations the request suggested.
4. **Separate check of the wrong behavior:** I wrote a throwaway spec using the same fixture. It logged the kept history and the history API over three passes with the clock advanced, and I deleted it afterward.
   - **Original code:** `older` is kept as `pending`/`waitsFor: "build"`. The history lists both `older` (waiting on its build) and `skip` (waiting on proof).
   - **Under the fault:** `older` stays `null` in the kept history on every pass and is not kept within 5 s. The history lists only `skip`, waiting on proof.

   So the fault makes collection stop at the skip and never collect the older landing, on the same path the existing test exercises.
5. **Restoration:** I copied the original file back, with an EXIT trap so it would happen even if the run failed.
   - The file's SHA-1 `fdcc3992d0d08267b1c5e92ce1347695ad16b8f5` matches the value before the fault.
   - `git diff HEAD -- dashboard` is clean and the throwaway spec is removed.
   - `git status` matches the starting snapshot exactly.
6. **After restoring:** the same command passed both tests (2 passed, 11.1 s).

## Notes
- **Prior plans:** no planned repair or earlier decision covers this, and this check makes no new repair decision.
- **Scope:** the result covers only this fixture's path: one skip with unanswered proof and one older landing whose build is still running.
- **Trial harness:** fix the starting-directory problem in `run-arm.sh` before comparing the trial's arm results.

## Cost
- **Test runtime (measured, Playwright-reported wall time per run):**
  - Existing spec: baseline 8.8 s, fault 16.7 s, after restoring 11.1 s.
  - Throwaway spec: original code 7.7 s, under the fault 10.9 s (test time).
  - Total about 55 s.
- **Human effort:** unavailable. No human took part in the run, and no separate measure was supplied.
- **Agent effort:** unavailable. I had no token or turn counter. The stream log `arms/B2-landed-ci-candidate/stream.jsonl` can supply it afterward.
- **Start time used:** the harness's `meta-start.txt` `start_ms=1794306569516`, read from the same host clock as Node `Date.now()`.
- **Invocation-to-report elapsed:** 154664 ms (measured), from 1794306569516 to 1794306724180 in Unix epoch ms. The end time was taken after the report body was written.
