# Dough Intent Coverage: SEED-285#see-landed-ci-wall-time-history

**Verdict: Caught.** I broke the collector so it stops at a skip that waits for CI proof. The existing test failed, and a separate log confirmed the older landing was never collected.

**Next proof action:** none needed for this fault. Keep the existing test. It caught the fault in an earlier helper, `untilKept`, not in the spec's final history `toEqual` check. That helper waits until every landing is stored before the history is read, which is how the spec is meant to work.

## Selection
- **Story:** `.planning/seeds/SEED-285-landed-ci-timing-history.md#see-landed-ci-wall-time-history`. The Collection promise says collection waits while CI is queued or running. The collector's code comment adds that a landing whose CI proof read gets no answer waits for that proof alone, and the walk goes on to the older landings. Plan: `.planning/slice-plans/551-see-landed-ci-wall-time-history/PLAN.md`.
- **Revision:** `9fcff1d9a765df93a6e3f783fcbbfd75b0b17fb6`.
- **Checkout:** the session did not start where the request said.
  - It started in the parent worktree (`…/make-intent-coverage-results-easier-to-act-on`), which is at `be07058e3` with uncommitted skill edits, not at the revision.
  - The cause: `run-arm.sh` creates the arm's scratch checkout but does not `cd` into it before launching `claude`.
  - I ran the probe in the arm's isolated detached scratch at `trial/arms/B1-landed-ci-current/scratch` (HEAD `9fcff1d9a…`).
  - I followed the frozen skill installed there, which is identical to `trial/skills-frozen`, not the different copy in the parent worktree.
  - Before the probe, the scratch already had 6 modified skill files from the arm setup (status and diff saved), plus the ignored `node_modules/` and `dashboard/test-results/`.
- **Fault:** in `collect()` at `dashboard/server/landedCiCollection.ts:158`. I changed `if (resolved.kind === "pending" && resolved.waitsFor === "read") return;` so it also returns when `waitsFor === "proof"`. That treats an unanswered CI proof read like unreadable CI. The walk goes newest first, so it stops at the skip and never collects the older landings.
- **Test and assertions:** `dashboard/backend-tests/intent/landed-ci-history-pending-proof.spec.ts:44`.
  - It uses a real bare origin with two landings: `older` (10 minutes ago, receipt `…000000000010`) and `skip` (1 minute ago, receipt `…000000000001`). Proof read 71 never gets an answer.
  - The assertions are `untilKept(home, [older, skip])` at spec line 73 (`tests/support/landedCiHistory.ts:194-196`), then the history `toEqual` checks.
  - I left fixtures and assertions untouched.
- **Test command:** `npm run test:dashboard -- backend-tests/intent/landed-ci-history-pending-proof.spec.ts --workers=1 --reporter=list`. I ran it with Homebrew bash on PATH, `caffeinate -s -i`, and `NO_COLOR`, `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset.

## Runs
1. **Baseline:** 2 passed (12.6 s). Test 1 (line 44) ran and passed.
2. **Fault:** test 1 failed in `untilKept` (`landedCiHistory.ts:196`, called from spec line 73) with `Received: undefined` after a 5000 ms poll. `untilKept` checks the skip first, so the missing entry was the older landing's. Test 2 still passed, as expected: it has only the skip, so there is nothing past it.
3. **Separate wrong-behavior check:** a second faulted run logged each resolution to `/tmp/b1-witness.log`.
   - My first try at this logging did not build because of a parse error, so I discarded that run.
   - In the valid run, test 1 logged 11 collection passes. Each resolved only the skip (`…001`, waiting for proof) and then stopped.
   - The older landing (`…010`) was never resolved, so the promise was broken. The test failed at the same `untilKept` check.
4. **Restoration:** a shell `trap` put the original file back after each faulted run.
   - `landedCiCollection.ts` has the same sha1 before and after: `fdcc3992d0d08267b1c5e92ce1347695ad16b8f5`.
   - `git status` and `git diff` match the pre-probe captures byte for byte, HEAD is unchanged, and the pre-existing skill edits are preserved.
   - New Playwright output went only into the already-ignored `dashboard/test-results/`.
5. **Restored pass:** the same command passed both tests (16.7 s).

## Cost
- **Test runtime (measured, Playwright totals in seconds):** baseline 12.6, fault 15.3, logged fault run 11.9, restored 16.7, about 56.5 in total. The run that failed to build is excluded. npm and bundling overhead are not included.
- **Human effort:** unavailable. This was a non-interactive (`claude --print`) run with no human involvement and no separate measure.
- **Agent effort:** unavailable. The host did not expose token or turn counts during the run; the arm's `stream.jsonl` can supply them afterwards.
- **Invocation-to-report elapsed (measured):** 189,650 ms, from 1794306340493 to 1794306530143 (Unix epoch ms). The finish-report helper sampled the end clock after writing the report body.
