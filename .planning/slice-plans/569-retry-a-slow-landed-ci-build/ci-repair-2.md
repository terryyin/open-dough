# CI repair 2 — reader restart port ownership

Owned failure: published/current HEAD `0fb7f02264c8956c1a7ea68f213ecf115d1a58df`,
GitHub run `42802352676`, attempt1, job `129782815164` dashboard(9/12).
`landed-ci-scope-proof-lifecycle.spec.ts` reader restart failed with
`listen EADDRINUSE 127.0.0.1:36521`; full log
`/tmp/seed285-ci-job-129782815164.log`, diagnostic
`/tmp/seed285-ci-42802352676-1.json`. Other jobs were still unfinished at that
snapshot; coordinator retains the remaining inventory. This is distinct from
the repaired native import constraint.

Slice2 returned `## PAUSED FOR CI`; core action gate20080 passed, extra
transport/parser cases not yet run. No active commands. Installed stash save
returned `stashed`, record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-MROJ7o/record.json`,
OID `395b5a9f0681e2fab19dcf366067d2f4c5b2de2c`, HEAD0fb7f0226. It preserves
root metadata and all sixteen unfinished slice2 files. Do not hand-apply or
drop it. Publish this repair first, then restore that exact record and resume
the same implementation owner.

Fresh repair owner `/root/repair_ci2` works in the recorded execution checkout
and branch. The same observer `/tmp/dough-ci-501/watch-S6j7xi`, coordinator
`seed285-viktor`, covers repair publication. Selected plan remains slice1done.
No other exact active repair owner is known.

The helper reclaimed the released old port. Its callers include API closures
and seven browser journeys that relied on the old address. The bounded repair
will retain a real stopped/restarted reader and local evidence while moving
those consumers to its newly bound address; strict explicit-port and own-address
startup safeguards remain unchanged. Browser navigation must preserve each
journey's selection and evidence assertions. Deterministic proof must occupy
the released old port with an unrelated owned listener and establish that the
new reader neither fails nor adopts that listener. Acceptance is recorded below.

## Accepted implementation proof

[Inspected full return and literal proof](ci-repair-2-proof.md). Coordinator
inspected all changed API/browser targets, navigation defaults/callbacks, the
real occupied-old-port regression, strict-port fake and unchanged assertions.
Expected: a reader owns its newly bound address and preserves retained evidence
without acquisition. Observed: deterministic failure before correction; same
history/no requests/no unrelated-listener use after it; all reached purposes
pass after the one missed aggregate caller was corrected and fully replayed.
No browser-persistence promise was dropped: these journeys already navigated
anew through their real selection helpers, now at the returned address.
Final CI inventory is complete with exactly this one failure. Source freshness
is unchanged at `b57936969b51e7a27f23a4fbba56c70579bc0553`; newly incoming
work is other guidance/preparation, with no named supplier change affecting
this repair. No open implementation gap or human decision.

## Accepted independent refactor

# CI repair 2 independent refactor return

One refactor edit in `dashboard/tests/support/selectDoneStoryForCiComparison.ts`:
the wrapper passes `undefined` for the title instead of repeating `"Story A"`.
`selectDoneStoryInIntent` remains the sole owner of that incidental default.
The effective title, address, callback, selected card and returned values are
identical. No new helper, public contract, production subsystem, dependency,
configuration, generator, renamed/split/deleted file or speculative code.

The read-only check pass covered all incoming repair representations: reader
startup, captured API read closures, project-cohort assertion, browser opening
and revisit helpers, deterministic occupied-port regression and chosen-port
fake. The many changed callers follow the one returned reader address; they do
not repeat a port-selection policy. Separate test assertions remain useful
behavioral documentation. Optional navigation addresses retain the old `/`
default and callback order. No additional duplication, naming, dead-code,
shotgun-surgery or test-cohesion issue needs an edit. Test-data architecture
continues to exclude dashboard runtime imports from shared builders. Strict
explicit-port and production own-address startup code is untouched.

## Accepted proof and verification

No accepted observation was invalidated by this refactor. The callee still
owns `title = "Story A"`; JavaScript parameter defaulting evaluates the same
string when the wrapper supplies `undefined`. The `beforeIntent` argument is
still undefined, and the address passes through unchanged. All setup and
assertion locations remain unchanged.

- The real `landed-ci-reader-restart.spec.ts` occupied-port regression still
  exercises unchanged close/bind/read/cleanup code, including exact retained
  history, no CI calls and no request to the old listener.
- `ci-repair-2-proof.md` Proof 2's complete 44-test/31-file command remains
  accepted with its strict exit1 and the one corrected retained-window call.
  Proof 3's full `landed-ci-scope-retained-window.spec.ts` replay remains
  sufficient for that repaired journey; the other43 unchanged observations
  remain reusable. The wrapper's Done comparison consumers still select the
  same actual Story A through the same navigation and assertions.
- `npm run typecheck:dashboard`, accepted final session69592 exit0, remains
  valid: the callee signature is unchanged and its defaulted title already
  accepts an omitted/undefined value. No new type or contract was added.
- `git diff --check`: terminal exit0 after the edit.
- Tests: skipped — no refactor behavior, covered boundary, setup, assertion or
  proof selection changed. No broad or focused test was rerun for process.

All changed tracked and new files were checked with `wc -l`; none exceeds250
lines. The edited wrapper remains20 lines before coordinator formatting.
Root's record organization remains within its supplied sizes and untouched.
No generated artifact is involved.

## Consumer trace

Installed command:
`node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe --base HEAD --term restartAsLandedCiReader --term observeRetainedScopeOrder --term openCollectedHistoryStory --term selectDoneStoryForCiComparison --term openProjectCiStatus --term selectDoneStoryInIntent --term listenOnReleasedRunnerPort --term expectProjectHistoryCohort --term openCiStatus --term selectCompletedStoryInIntent --term selectDoneStoryForChangedTests --term selectDoneStoryForSummaryComparison --term 'same port' --term 'returned reader'`

The command reached terminal exit0, session2349. Completed record:
`/tmp/seed285-refactor-ci2-consumer-trace.md`,523 located consumers,12 reused
and511 excluded with boundary reasons. The109 incoming consumer paths retain
their inspected accepted proof or exclusions. The414 additional matches name
only `PLAN.md`, which became changed after the incoming trace; none is a new
semantic consumer. Every row has a disposition. The current wrapper/callee and
summary/completed-story helper call forms were inspected to confirm unchanged
default title, navigation, callbacks and selection conditions. No uncovered
consumer or required observation remains.

## Resources and ownership

No expensive proof was launched, so no new headroom decision or deferred
observation is needed. The incoming finite proof's retained host/concurrency
basis remains as recorded in `ci-repair-2-proof.md`. Only read-only discovery,
trace generation, one-line source refactor and whitespace verification ran.
No command or watch remains active. HEAD remains
`0fb7f02264c8956c1a7ea68f213ecf115d1a58df` on the supplied branch.

No commit, push, amend, formatter, hook-owned lint, status change, stash access,
installed-copy edit or root-record edit. The paused slice2 stash and root
observer were left alone. No open gap, disputed plan restriction, ADR conflict,
North Star conflict, oversized-file decision or human judgment is needed.
Approximate active elapsed time: eight minutes.

## REFACTOR COMPLETE

Delivery freshness unchanged at `e155eb11b71a410f93793a889b3c713aa9691272`;
new incoming terminal work does not change the named comparison supplier or
this retained-reader repair. Accepted proof remains applicable.

Mechanical delivery repair: formatter refused two fixture lint issues before
commit/status/publication. Coordinator explicitly consumes the unused HTTP
request argument and uses if/else for the close callback. Promise settlement,
listener counting and cleanup behavior are unchanged; no representation, helper,
dependency or path was added. Already-traced mechanical repair within the
accepted regression/trace; other proof remains applicable.
`PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-reader-restart.spec.ts --workers=1` passed (session53157), observing real close/occupied port/new reader/equality/no acquisition and cleanup.
Preparation repeats because the mechanical repair invalidated formatting.
The final listener uses the existing request-draining idiom (`request.resume()`);
the same whole regression passed again in session1851 after lint rejected a
no-op argument expression. No assertion or timeout changed.
