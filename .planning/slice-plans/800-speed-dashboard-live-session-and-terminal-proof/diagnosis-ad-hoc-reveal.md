# Diagnose the ad hoc sidebar reveal fixture

[Failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)

GitHub Actions run 45294386841 attempt 1, job 138110957970
(`dashboard-frontend / shard 2/2`), ran against the published story-branch
revision `dfe54edde322a6c8ddaf362de782d1fcf79ff585`. The migrated
`agent-launch-ad-hoc-sessions.spec.ts` failed its initial offscreen
precondition at line 154 before opening the session. The expected
`false` was `true`. The shard reported 263 other cases passed. The
published slice 5 introduced the failed mounted case. The two-worker
local macOS slice had passed with the 700 × 600 viewport. The job log
is retained in the worktree Git evidence directory. The attempt was
still in progress when the first diagnostic reached this failed job.
The final provider inventory confirmed this was the only failed job.
All other jobs succeeded, and its full log names only this case.

Slice 6's four tracked edits and two new files are parked under the
coordinator's installed CI repair stash receipt. Its first ten input
cases and early probe completed before the stash. The repair checkout
is at the published revision.

Round 1 hypothesis. The near-edge layout permits the Taken entry to
start visible, depending on the browser's font metrics and view. Test
this with a single controlled fixture variation that makes the old
precondition fail locally. Then make the initial position independent
of those dimensions by establishing a visibly offscreen entry in the
actual board and observing it return through the same sidebar click,
covering panel and close. Use a single focused run before broader proof.


Round 1 confirmed the fixture assumption after 1.8 active minutes.
One macOS Chromium height probe at 700 × 840 passed. One bounded
different experiment kept 700 × 600 and selected Taken through its
real Board pager before opening the sidebar. It produced the same
`expected true to be false` precondition failure as Linux without
reaching the session opener. The height and paging run records are
`repair-ad-hoc-reveal-height-probe.log.run.json` and
`repair-ad-hoc-reveal-paging-probe.log.run.json`. The evidence shows
that the old precondition depended on which column the Board showed.
It leaves the exact Linux layout differences open. The temporary
height change and pager click are both removed.

The separate fix preserves 700 × 600 and supplies the existing kept
Taken position with twelve more recent MakeMe ad hoc sessions. This
gives the real Board enough vertical content that the named older
entry starts fully below its scroll viewport. After the genuine
sidebar click and covering terminal Close, the same entry is wholly
in the Board's reading room. All three tests in the ad hoc source
and the existing Board sidebar paging/reveal test passed with two
workers. The terminal run record is
`repair-ad-hoc-reveal-final.log.run.json`.

For the first repair publication, the hypothesis is that explicit
initial Taken placement and sufficient rendered content make the
offscreen precondition independent of the horizontal layout that
triggered the CI failure. Use the first applicable CI verdict as the
stopping point for this hypothesis and diagnose any new failure.

The repaired story-branch candidate `474680898dc75858d220e88db13871bb3c596a6b`
passed the first applicable Linux CI run, 45295856270 attempt 1.
The owned slice 6 files were restored from the retained stash receipt
after repair publication and resumed on the same branch.
