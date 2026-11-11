# Cursor revival reaches its subject through real held executions

## Failure and selected existing owner

Combined baseline run 4 failed before revival: the default 30-second case
expired in the second initial launch. Its retained trace records 14.128 seconds
of before hooks, 9.541 seconds awaiting the first input, and approximately
3 seconds for each initial story action click. The final Start button was
present and enabled but had only 350.5 ms left. This is setup exhausting the
case, not evidence that the revival operation failed. The unexplained later
load jump and sleep exclusion remain in [baseline evidence](baseline-evidence.md).
No failure is discarded by attribution.

The selected PFE responsibility is two actual execution/native lifetimes,
one chosen-model scope and one Default, before the stale-runner transition.
Generic ad hoc held sessions do not establish those facts. Reuse the canonical
`dashboard/tests/support/heldCursorExecutions.ts` committed by SEED-287 at
`84afbf850a1ca41f62c599122adf9cc981376a77`. Its Git blob is
`95520703216e4e44ee0aa4a13860bbea7b887a4a`, byte-identical in this checkout.
This imports that one committed helper at its existing canonical path;
no other checkout or its uncommitted work is edited, merged or published.
Its branch evidence was a lead, not this repair's proof.

## Preserved observations

The helper drives `agentLaunchBoundary.launch` through actual HTTP acceptance,
installed execution-start publication and native Cursor sessions. Canonical
`storyA` and `storyB` come from MakeMe's shared backlog builders, and the action
names both session IDs and chosen model explicitly. No records or runner
results are synthesized. It observes launched status, last-held keys, confirmed
first input, saved request identity/workflow, native cwd, saved workspace,
scoped native environment/model, Default's absent scope and unchanged shared
configuration. The board is opened once after both starts settle.

Only the revival case's two initial UI setup calls change. Its stale runner
read/list/join actions still prove no spawn or replacement. The third launch
still uses the real UI, replaces the runner, revives the two original sessions
without Recover, and preserves stored identity, timestamps, scope, workspace
and visible running state. All original assertions on those results remain.

The original first-input text assertion and session-ID observation remain in
this journey. The same `SessionDetails.tsx` confirmed-input paragraph is now
opened on the scoped entry and asserted visible before closing it. The old
`toContainText` observed that paragraph in SessionEntry's hidden detail DOM.
The session ID still selects the actual scoped entry and its terminal is joined.
Deleting that paragraph or losing confirmation therefore still breaks this case.
No other UI check is credited as replacement proof. Initial card/model dialog
actions are precondition construction, now through the public launch boundary;
the existing launch/model specs are unchanged and are not free timed proof.

## Focused strict proof

Each command used the normal strict reporter, one worker and a fresh record:

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_root/proof-$run.json" \
  /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
  dashboard/tests/sessions/cursor-runner-replacement.spec.ts --workers=1
```

`proof_root` is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed303-cursor-repair-349_4r3o`.
All three consecutive commands exited 0 with completed strict-passed records,
two passed cases each, retry 0 and no skips. This includes the unchanged
stale-runner observation case and the complete repaired revival journey.

| Run | Whole command seconds | Runner seconds | Revival case seconds |
| --- | ---: | ---: | ---: |
| 1 | 15.37 | 14.878 | 9.096 |
| 2 | 14.45 | 13.902 | 9.009 |
| 3 | 14.35 | 13.852 | 8.641 |

The macOS host was awake on AC with 44% free memory and load
2.96/5.88/7.68 before launch; no heavy test or pressure process was observed.
Per-run loads were 3.66/5.00/7.01, 4.92/5.21/7.05 and 4.93/5.20/7.01.
One-worker sequential proof under `caffeinate -s -i` was the bounded choice.
No artificial pressure was started. The earlier unexplained pressure condition
was not reproduced; these are focused functional observations, not a claimed
cross-load saving or the missing three comparable combined baselines.

## Consumer trace and remaining gate

The installed `consumer-trace.mjs` searched the whole checkout at base
`17a2f12052f50acf1f844855ea2e16b45377a630`, both changed paths and
`openHeldCursorExecutions`, `startScopedCursorExecution` and
`launchSecondHeldSession`. `/tmp/seed303-cursor-consumer-trace-all.md` retains
all rows with dispositions, including unrelated parent-owned record/repeat
changes. `/tmp/seed303-cursor-consumer-trace.md` repeats the search for only
this repair's paths and effect terms.

The new helper's only caller in this checkout is the changed revival spec.
The old recovery helpers and their six sibling callers remain unchanged;
none imports the new helper or this spec. Their matches do not receive the
changed private setup effect. Scheduling metadata retains the same file name.
The two-case spec is therefore the full affected execution surface, and both
cases passed three times. No production API, fixture option or timeout changes.
During these focused observations the repeat-wait file had SHA256
`5925c9545a0a83ba51d1fed9ba1b6fff43f4c8f6c2bc1b752277341561bb9894`.
Three comparable passing combined baseline runs remain coordinator-owned.
