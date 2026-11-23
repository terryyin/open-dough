## Dough Intent Coverage

**Caught.** At revision `4773bae1b39a5b479e780ee55c584363f2494f96`, the maintained browser test catches a broken connection between story-reference Retry and the published Done catalog refresh. This checks the catalog recovery promise in `SEED-413#speed-story-changes-notes-and-progress-reading`, Plan 763 Slice 5.

The fixture pauses the page clock, publishes a malformed catalog at revision `c3…`, follows the reference to `SEED-221#done`, then publishes a corrected catalog at `c2…` before clicking Retry. In a scratch checkout I changed only the `StoryReferenceNavigation` prop in `dashboard/src/ConfiguredDashboard.tsx:142`, replacing `retry={readAfresh}` with `retry={() => undefined}`. The fixture and assertions stayed intact.

The faulted browser trace shows the steps for publishing the correction and clicking Retry completing. The browser network trace records a single Done-catalog request at the failed revision before Retry. The captured Board still displays the original catalog failure and Retry button after the click. The maintained focus assertion for the `Completed endpoint` article in Recently done fails because the article is absent. The assertion at `e2e/navigation/story-reference-catalog-retry.spec.ts:146` catches the broken reveal before the later request-ledger assertions. The verdict covers Retry triggering the refresh and revealing its destination.

The same focused command selected exactly one case each time. The baseline and restored runs strictly passed and the faulted run failed at that assertion. Byte comparison and Git status confirmed restoration before the clean scratch worktree and branch were retired.

```sh
OPEN_DOUGH_E2E_PROOF_RECORD=<fresh-receipt> caffeinate -s -i npm run --silent test:e2e -- 'navigation/story-reference-catalog-retry\.spec\.ts' --workers=2
```

**Next proof action.** Keep the maintained built-page Retry check. This result supports the existing Slice 5 decision to retain real catalog-refetch proof. The check warrants no additional proof work for the observed connection. [Run and trace evidence](/tmp/open-dough-763-intent-coverage.39auUo)

- **Test runtime.** 22.762 s total (measured by the runner). Baseline 9.067 s, faulted 9.982 s, restored 3.713 s.
- **Human effort.** Unavailable. The check captured no human-effort measurement.
- **Agent effort.** Unavailable. The check captured no separate active-effort measure.


- **Invocation-to-report elapsed.** 162797 ms (measured), from 1795408304077 to 1795408466874 in Unix epoch ms. The end clock was sampled after writing the prepared report body.

Wrap-up disposition — Checked revision `4773bae1b39a5b479e780ee55c584363f2494f96`. Caught. No follow-up.
