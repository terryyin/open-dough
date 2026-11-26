# Intent CI follow-up navigation waited on the previous document

Published candidate `2b7802bd0a9f3bb551bccc27d93d19b33afcd0cc`, GitHub
run 45778980880, attempt 1, E2E shard 3/6 job 139769509229.
`intent-ci-follow-up-custom.spec.ts` timed out after 30 s at
`ciFollowUpReadingPage.ts` in `await answer.finished()`. The accepted
diagnostic rollback `91f7d9c2c` passed all jobs in run 45781390123.
The helper and test match fetched trunk `01fa9d50`; these paths are
outside the published launch migration. No other active exact repair
owner was found in the plan, branches or current worktrees.

The hosted archive `ci-45778980880-e2e3.zip` in worktree Git evidence
contains the failed case's test events and Chromium request trace.
The old document's project-wide GET began at 74912 ms. The second
waiter armed at 75228 ms. The only matching headers before the waiter
returned at 75263 ms were from that old GET, around 75249 ms. Its
logged status was 200 with receive time and body size both -1.
The second navigation reached load at 75558 ms, and its own project
GET began at 75714 ms and completed with a 237-byte response body.
The helper matches by URL, so it can select the old request before
navigation detaches its body. Existing UI assertions already wait for
the expected outcome text once navigation is complete.

One disposable Chromium probe will force that ordering with a local
server, the actual imported helper and two documents. Release the
old response headers when navigation starts, then let the new
document load and render its own follow-up. Compare one invocation of
the existing helper with one invocation using navigation and the
rendered follow-up as its commit point. The expected discriminator
is that the old response ends without a body but the new UI appears.
If Chromium settles the old `finished()` promise locally, retain the
hosted timeout as evidence and the focused test as a check of the
replacement boundary. Do not repeat the same experiment for a pass.

Run from this checkout, on awake macOS and AC power with one browser,
under the diagnosis clock. The scratch script and outputs are in
worktree Git evidence. No maintained source changes in this probe.

```sh
evidence=$(git rev-parse --git-path open-dough/evidence)
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/ci-follow-up-old-navigation.log" --exit-file "$evidence/ci-follow-up-old-navigation.exit" -- caffeinate -s -i node --experimental-transform-types --disable-warning=ExperimentalWarning "$evidence/ci-follow-up-navigation-probe.mjs" existing
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/ci-follow-up-visible-navigation.log" --exit-file "$evidence/ci-follow-up-visible-navigation.exit" -- caffeinate -s -i node --experimental-transform-types --disable-warning=ExperimentalWarning "$evidence/ci-follow-up-navigation-probe.mjs" visible
```

Each probe ran once. The imported helper reproduced the failure
with exit 1. The old response never delivered a body, the new
follow-up was visibly rendered, and opening remained pending. The
navigation and visible follow-up variant passed under the same
ordering. In the installed Playwright client, the response body
completion promise resolves on `requestFinished`; the separate
`requestFailed` path does not resolve it. This accounts for why the
stale response could outwait the test despite a successful new read.

Repair the E2E page helper using ordinary Board navigation and the
test's existing assertion on the expected outcome in the new document.
Preserve both custom outcomes and every subsequent comparison
assertion. Repeat the probe on the real helper once after the change
and run the maintained custom follow-up spec once. Check any shared
consumers implicated by the diff. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Repair verification

`openBoardWithCiFollowUp` now awaits the existing `page.goto`. The
scenario's next assertion waits for the new Board card's expected
follow-up text. Its two settled variants, exact attempt and saved
average checks, reload and GitHub request assertions are preserved.

On AC power with one Chromium worker, the exact-helper probe under
the repair clock exited 0. It observed `oldResponseBodyFinished=false`,
`newPageRendered=true` and `opening=completed`. The maintained custom
follow-up spec passed its one selected Chromium case on attempt 0
in 6686 ms. The one case exercises both variants. The logs, run records
and E2E proof JSON are in worktree Git evidence. Dashboard typecheck
also exited 0.

```sh
evidence=$(git rev-parse --path-format=absolute --git-path open-dough/evidence)
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/ci-follow-up-fixed-navigation.log" --exit-file "$evidence/ci-follow-up-fixed-navigation.exit" -- caffeinate -s -i node --experimental-transform-types --disable-warning=ExperimentalWarning "$evidence/ci-follow-up-navigation-probe.mjs" existing
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/ci-follow-up-custom-e2e.log" --exit-file "$evidence/ci-follow-up-custom-e2e.exit" -- caffeinate -s -i env OPEN_DOUGH_E2E_PROOF_RECORD="$evidence/ci-follow-up-custom-e2e.json" npm run test:e2e -- 'e2e/intent/intent-ci-follow-up-custom\.spec\.ts$' --workers=1
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/ci-follow-up-navigation-typecheck.log" --exit-file "$evidence/ci-follow-up-navigation-typecheck.exit" -- caffeinate -s -i npm run typecheck:dashboard
```

`ci-follow-up-navigation-consumers.md` records the whole-checkout
trace. The custom spec is the only caller of the changed helper.
The four other importing specs use unchanged exports.
