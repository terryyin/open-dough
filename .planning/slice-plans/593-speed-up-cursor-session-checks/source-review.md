# Source-only review — SEED-313#speed-up-cursor-session-checks

Launch: fresh general-purpose reviewer (`Task` / `generalPurpose`), no
conversation inheritance, no plan or product files. Input: story Goal, Scope,
key examples, and Success measure for
`SEED-313#speed-up-cursor-session-checks` only (from
`.planning/seeds/SEED-313-cursor-session-checks.md#speed-up-cursor-session-checks`).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Dashboard maintainers get substantially faster local feedback on Cursor runner replacement and scoped session continuation. | slice 3 | observed: family real 39.76/35.88/40.39 vs baseline 94.61; scope+revival lean |
| 2 | Ordinary CI continues to catch the same native-process, PTY, refusal, and visible-revival regressions. | target CI | |
| 3.1 | Sessions remain available through a stale runner until a new launch replaces it. | slice 3 | observed: cursor-runner-replacement.spec.ts stale list+join; PID/calls/attaches unchanged |
| 3.2 | Unfinished last-held sessions revive automatically without Recover. | slice 3 | observed: cursor-runner-replacement.spec.ts third-launch auto-revive without Recover |
| 3.3 | Resume, recovery, and cannot-load replacement use the recorded project scope, including a deliberate non-default scope. | slice 2 | observed: cursor-session-scope-continuation.spec.ts scoped + cannot-load cases via openHeldCursorExecutions + expectContinuationThroughScope |
| 3.4 | Default continuations still carry no scope. | slice 2 | observed: cursor-session-scope-continuation.spec.ts Default case expectContinuationWithoutScope after openHeldCursorExecutions without model |
| 3.5 | Missing or unreadable scope refuses Recover and Open terminal with an explanation and spawns nothing against shared Cursor configuration. | slice 2 | observed: cursor-session-scope-continuation.spec.ts missing/unreadable refusal case Recover+Open terminal; spawn nothing |
| 4 | Reduce repeated full launches and incidental setup while observing those promises at the real public-runner, persisted-session, and browser boundaries that catch their faults. | slice 3 | observed: heldCursorExecutions scope setup + one stale PTY join; UI refusal/revival retained |
| 5 | Keep one end-to-end journey for live PTY and visible revival. | slice 3 | observed: one e2e revival journey in cursor-runner-replacement.spec.ts retained |
| 6 | Establish scope and refusal variants at cheaper real boundaries only when those boundaries still discriminate the same faults. | slice 2 | observed: scratch discrimination /tmp/slice2-593/scratch-*.txt; refusal not thinned without public-recover discrimination |
| 7 | Reuse the delivered `heldCursorExecutions` helper and corrected real-lifetime setup. | slice 2 | observed: openHeldCursorExecutions import and setup in all four scope cases |
| 8 | Reconcile accepted SEED-287 Cursor lifetime work instead of duplicating it. | slice 2 | observed: reused heldCursorExecutions; no second lifetime fixture |
| 9 | SEED-287's unfinished other ownership and this story's queue position are not blocking dependencies; this family can improve on its own. | slice 1 | observed: plan Current decisions: SEED-287 unfinished non-Cursor work not blocking; family can improve alone |
| 10 | Include every public-runner, persisted-session, and browser check credited with replacement in the ordinary timed family. | slice 3 | observed: family grep still revival title + cursor-session-scope-continuation.spec.ts |
| 11 | Preserve ordinary CI selection and equivalent behavioral protection. | target CI | |
| 12 | Exclude local-only archived experiments. | slice 3 | observed: timed family uses maintained grep only; no archived experiments |
| 13 | Use shared MakeMe and existing external fixtures. | slice 2 | observed: storyA MakeMe + existing cursor fixtures; no new mocks |
| 14.1 | No new internal mocks (to obtain a saving) | slice 3 | observed: no new internal mocks in slice 3 diff |
| 14.2 | No wall-clock sleeps (to obtain a saving) | slice 3 | observed: no wall-clock sleeps added |
| 14.3 | No retries (to obtain a saving) | slice 3 | observed: no retries added |
| 14.4 | No skips (to obtain a saving) | slice 3 | observed: no skips added |
| 14.5 | No timeout inflation (to obtain a saving) | slice 3 | observed: no timeout inflation |
| 14.6 | No special runner modes (to obtain a saving) | slice 3 | observed: no special runner modes |
| 15 | Follow the failure policy linked from AGENTS.md (failing and flaky tests). | slice 3 | observed: failing policy applied; three green family runs under caffeinate |
| 16 | Existing held sessions remain available through a stale runner until a new launch replaces it. The replacement revives the unfinished last-held sessions without Recover, preserves their identities, timestamps, scope and workspace, and shows them running in the UI. | slice 3 | observed: revival journey preserves IDs/timestamps/scope/workspace and shows running |
| 17 | After a scoped client ends, Recover and a fresh Open terminal both resume through the recorded chosen scope and workspace, leave a deliberate shared Cursor default change untouched, send no model flag, and attach a new process. A cannot-load replacement keeps the same scope on the new session ID. | slice 2 | observed: scoped Recover+Open + cannot-load cases in cursor-session-scope-continuation.spec.ts |
| 18 | Missing or unreadable recorded scope refuses Recover and Open terminal with the saved-configuration explanation and starts neither calls nor attaches; shared Cursor configuration stays unchanged. Default recovery continues to carry no scope exactly as before. | slice 2 | observed: refusal + Default no-scope cases in cursor-session-scope-continuation.spec.ts |
| 19 | Three comparable passing ordinary one-worker runs of this family's maintained selection each finish with the stated saving, including startup, every credited replacement check, and teardown. | slice 3 | observed: three consecutive family runs /tmp/slice3-593/family-{1,2,3}.* all exit 0 |
| 20 | Save at least 10 seconds of whole-command wall time on the same ordinary one-worker Cursor session selection with every replacement, preparation, and teardown paid. | slice 3 | observed: real 39.76/35.88/40.39 each save ≥10s vs 94.61 |
| 21 | The retained corrected baseline's five cases cost 30.691–33.595 summed local case seconds (median 30.691 s). | slice 1 | observed: plan Current decisions retained corrected baseline 30.691–33.595 median 30.691s (SEED-303 lead) |
| 22 | Require a matched family baseline against the current execution base and repeated passing observations. | slice 1 | observed: matched family repair re-run 2026-11-12 exit 0 real 94.61s file times 27.2+57.2=84.4s on base 467ab91; /tmp/slice1-593-family-repair2.* |
| 23 | Keep the live PTY/UI revival and refusal observations that cheaper boundary checks do not exercise. | slice 3 | observed: revival PTY/UI + scope refusal UI observations retained |
