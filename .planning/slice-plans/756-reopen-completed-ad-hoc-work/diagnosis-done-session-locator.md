# Diagnose the quiet Done session locator

- Revision `95a8bbaa766d361aa936f147558bed184d6f0e3f`, GitHub Actions
  [run 45145976785](https://github.com/terryyin/open-dough/actions/runs/45145976785),
  attempt 1, e2e shard 2 of 6, step 12. The quiet Claude rename journey
  observed a strict locator match on both the Done card and its nested
  session. Other jobs were still running at the first diagnosis.
- Hypothesis for one focused reproduction. The test locates any article
  containing the session ID and the parent card now contains the same
  text. Resolve the native session through the supported Dashboard page
  helper, preserve the pending rename and native control assertions, and
  make one confirmed run of the affected journey and its consumers.
- Slice 4's work is parked and excluded from diagnosis and repair. Apply
  the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Round 1 reproduced the same strict-match failure locally on AC with one
  Chromium worker, without editing the test. The log names the outer Done
  article and the inner entry's host-qualified key. Reproduction records and
  the preserved browser trace are in the worktree's Git evidence directory.
- The repair uses the existing Dashboard session-entry locator with Claude's
  native session key. One post-edit run strictly passed the Claude journey
  and both companion Codex Done cases without retries. Exact commands,
  retained observations, and consumer dispositions are in
  `repair3-report.md` in that evidence directory. No production code
  changed.
- Publish one repaired revision. The existing named assertion should reach
  the exact session and the same CI shard should preserve the native
  receipt, rename and controls. The original attempt's other test groups
  had cleared by the next diagnostic; the summary job was still queued.
