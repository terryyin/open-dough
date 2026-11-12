# Slice4 implementation return — proof pending host coordination

Only test-side mechanics changed. No commit, push, slice status, record write, formatting or hook-owned lint. Coordinator-owned PLAN.md and execution-context.md preserved.

## Boundaries

- New support/reviewControls.ts owns Refresh plus the nine existing region/comparison/run/check declarations, moved byte-for-byte with stable storyReviewMark re-exports. Control construction adds no action, pending-read completion or snapshot wait.
- storyReviewMark.refreshReview preserves nextSnapshot-before-press and snapshot schema handling, now carrying the caller's exact option. Commit/uncommitted/comparison/mark/trunk freshness callers reuse it.
- reviewRead.refreshAndRead retains feedback waiting; launchLandingReview retains its HTTP answer parse. storyReviewCommitChoice's pre/post read waits are unchanged.
- Keyboard Refresh/focus/Enter remain explicit. Touch still uses tapWhereShown then expectReviewRead with exact:true. No whole-journey wrapper.
- one-shot-choice-races alone activates existing queuedCodexPreviewReady before origin via a local fixture dependency. Private origins and all three real native launches/captures, held answers/releases and every journey assertion remain in the case.

## Source promises and signals

24: commit-refresh first/virtual endpoints retain first/second/third/fourth commit facts, old/new tree assertions, chosen ends and feedback. Both cases selected by initial cohort; first also passed representative.
25,30: uncommitted-check-refresh retains caller arrays4/5/7/8, on/off/absent state, left-out text, binary baseline/tree request facts; uncommitted-check retains payload/count/mark assertions. All8cases passed initial cohort; representative checked retained-off→absent→on.
26: expected revisions/baseline/run remain scenario variables and explicit assertions. No helper derives expectations.
31–33,36: commit-races passes real range payload, later range choice and original release/delivery order. One-shot races preserve held-run then held-file protocol, later first-run choice and post-release first-run/diff assertions; complete journey proof remains pending G2 repair. No release moved into helpers.
34–35: selected run/file after old answer remains asserted in original race case; its first run timed out later in panel controls, so complete acceptance is pending repaired proof.
Common preservation:308 matcher argument/order entries and every test/step title preserved across11edited specs. Nine relocated declaration texts identical to accepted base. No fixture/domain-data arrangements replaced; no timeout/retry/skip/sleep changes. HTTP/Git/native observations stay at original boundaries.

## Completed proof

Command:
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-review-582-slice4-representatives-proof.json caffeinate -i npm run test:dashboard -- '/dashboard/tests/review/story-review-(refresh|commit-refresh|uncommitted-check-refresh)\.spec\.ts$' --grep 'stays fixed|first Commits default|Refresh keeps the check off' --workers=1

Result:3selected,3passed, retry0,24.246s,09:25:03.942Z–09:25:27.567Z. Actual names: first Commits default uses current snapshot; story review stays fixed until Refresh; Refresh keeps check off/drops/offers on. Boundary:real Git worktree→review HTTP→Chromium display; setup is each named spec's existing storyWorktree/unchangedWorktree + kept launch record. Observations: old/new printedLines/8file/focus/fixed feedback geometry in refresh; selected rows/held diff feedback and anchored head in commit-refresh; old/new committed arrays/check/feedback counts in uncommitted refresh.

Command:
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-review-582-slice4-cohort-proof.json caffeinate -i npm run test:dashboard -- '/dashboard/tests/review/story-review-(refresh|commit-refresh|uncommitted-check.*|commit-races|one-shot-choice-races|comparison|mark|nothing|tree-collapse|trunk-own-flagged|trunk-worktree-ambiguity|trunk-worktree|completed|story-branch-landed|one-shot|one-shot-unavailable|one-shot-choice|one-shot-choice-refresh|trunk-own-older-git|trunk-own-since)\.spec\.ts$' --workers=1

Terminal:exit1,49selected/21specs,47passed,2timedOut,retry0,518.302s,09:27:10–09:35:48Z. All ten initial changed specs were selected. All direct snapshot/feedback/HTTP Refresh consumers and full initial slice4 gate were selected. Pinned freshness04993551b93d144e1ec5378b9ffe75bcb85a754c settled by coordinator before launch. No sleep/wake event in run window. Unaffected47passing boundaries remain identical under local G2 fixture activation and separate touch owner change; do not rerun them merely for process.

Typecheck: npm run typecheck:dashboard passed terminal0 after all code including local G2 activation; latest session10846. git diff --check passed. Inspection script /tmp/seed300-review-582-slice4-final-inspection.mjs/result inspection.json carries assertion and declaration comparison.

## Failures and remaining proof

Project policy applies as written: AGENTS.md#failing-and-flaky-tests.

G2 one-shot-choice-races: timedOut30s during Hide files click. Trace .../dashboard/test-results/2026-11-12T09-27-10.151Z-66114/tests-review-story-review--66943-w-layout-and-panel-controls-chromium/trace.zip. Before Hooks5.808s (origin4.176,dashboard1.267); real legacy+two captures17.089s before page.goto; held protocol reached final narrow HideFiles with~275ms left. This was budget exhaustion, not locator/actionability failure. First codexStart case reaches lazy cold start-origin-codex-queued; local existing worker activation now prepares only immutable keys before test budget. Candidate typechecks; actual cold gain and complete passing journey still unproved. Required next:two isolated cold case runs with artifact trace, compare fixture/preparation and full-case durations, no default timeout change.

Trunk-worktree: timedOut at final snapshot Refresh. Trace .../tests-review-story-review--ded88-iew-without-a-launch-record-chromium/trace.zip. Before Hooks4.448s (origin0.909,dashboard2.900), real start/commit setup9.381s, Board/card settling~5.9s; full retained publish/mark/final-refresh journey exhausted budget. Origin was warm, so G2 cold repair is not its cause or fix. Deliberate recurring CPU-burner groups observed with rising load38.9→48.22; known independent owner context is SEED324 plan599, not owner of this exact defect. No burners, files or tests of that owner were altered. Cause/environment repair and concrete proof remain outstanding pending host coordination; no green-rerun exemption.

Touch: actual import chain from storyReviewTouchContext leads only to story-review-touch.spec.ts, absent from49selection. Replaced only generic Refresh lookup with shared reviewRefresh({exact:true}), preserving tap/wait. Required next:all4touch cases, after coordinator settles actual workload.

Current workload:host awake/lid open on battery,caffeinate-i; one worker/no other proof owned by this agent. Recurring16yes burner groups under the known independent campaign invalidated original no-competing-heavy-proof assumption. Coordinator directed hold before expensive proof. 17:43 battery10%,19min,load36.22/39.65/33.06; no verification remains running. No mandatory proof waived.

## Trace/cost

Initial exact Refresh/control trace: /tmp/seed300-review-582-slice4-consumer-trace.md,149rows,15run/42reuse/92exclude. Final trace includes new local worker activation and coordinator-owned record terms: /tmp/seed300-review-582-slice4-final-consumer-trace.md,662rows,14run/42reuse/606exclude; every row dispositioned, failures/pending touch explicit. Reused strict-passing slice2/3 records apply only to byte-identical relocated queries/scopes/waits and unchanged setup; unrelated generic roles, production vocabulary, fixture-only imports and records excluded by inspected effect. Added worker dependency changes no shared worker fixture implementation.

ADR0010 before/after: /tmp/seed300-review-582-slice4-benefit-cost.md; compared audit7eab3d6ca and preparation47b348b3a. Refresh locators23sites/13files plus one generic touch caller→one selector owner. Existing duplicate snapshot wrapper removed; named Refresh operation replaces mutable nextSnapshot/click/await sequences while expected facts stay in scenarios. Nine controls moved unchanged; new module52lines, storyReviewMark247→220. Owner cost28netlines, ten mechanics specs shrink24; G2 local dependency adds12more lines and must earn its keep through cold proof. No human-time/suite-speed claim.

## Coordinator recovery boundary

Slice4 is planned, not accepted or delivered. G2 and G3 remain returns; slice5
has not started. Source/plan freshness is unchanged at04993551b. Independent
refactoring is still owed after proof acceptance. The initial47passing observations
may be reused where unchanged, but cannot erase the failed required broad verdict:
renew the full49-case gate after repair and a supported workload decision, in
addition to the isolated cold race twice and all4touch cases. Do not rerun the
unchanged overloaded attempt until green, waive either failure, change timeouts,
mark execution complete, invoke retrospective/wrap-up, land, or retire this worktree.

Proof owner on resume is the execution coordinator, delegating the bounded repair
and pending proof under the existing failure policy. Reconsider once adequate
power and a credible workload window are available; preserve unowned burner jobs.
No browser proof is live. The implementation agent returned incomplete/quiescent.
All code/record edits are preserved uncommitted; last remote acceptance remains
`dec6294f22a582e7ec4801749a4e576b380af17a` on the story branch.
