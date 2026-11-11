# Slice 7 source-recovery acceptance

## Retained implementation return

Identity `SEED-300#express-dashboard-test-intent-through-page-objects`; publisher `dashboard-territory.local-open-dough`; agent `stanly-chan`; story-branch origin/main. Workspace `/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects`, branch `codex/express-intent-test-reading-through-page-objects`, HEAD/published base `cd9ecc5cef7463ca68db41c7eb7f9b606b1a1091` (suffix3f1c22bf). All implementation remains uncommitted and quiescent; root owns records, refactor, formatting/hook lint and delivery.

This handoff follows [AGENTS.md#failing-and-flaky-tests](/Users/terryyin/git/open-dough/.worktrees/express-intent-test-reading-through-page-objects/AGENTS.md#failing-and-flaky-tests) as written. No commit, push, stash, reset, checkout, branch switch, applied formatting, independent lint or observer operation was performed.

## Result, PFE and ownership

26 owned code paths: `/tmp/seed300-slice7-owned-paths.json`. Existing `intentReadRecoveryPage.ts` now owns scoped `readFailure`, `readRetry` and `showLatestRevision` controls, with native Playwright expect (the original dashboardTest/pageTest expect was the same re-export). Failure wording, expected revisions, actions and transport/clock protocols remain in cases. `openCandidates(page, expectedRevision)` has no hidden fixed revision: its three actual integrated/frontend callers explicitly pass `openDough.revision` or `frontendRevision`.

Existing `intentCodeBrowsePage.ts` owns `sourceRevision` beside fileSource. Existing `intentPerspectivePage.ts` owns one-shot `expectReadingOffset` through its existing pane/scroll reader; it preserves the old revision scenario's immediate observation semantics. The candidate file-start check keeps explicit expect.poll at its caller, using the shared measurement. Existing `intentRevisionJourney.ts` exposes sourceLocation for its logger, preserving exact omitted-option `e2e_test/` filtering; the new Python cases explicitly pass `tests/`.

All Show latest callers use the same owner with their original containers: notice/revisionNotice for positives, the whole Intent for the original negative. This repairs G9's initially narrowed negative without a parallel selector. Real product controls are unique within their supplied containers. Locations, candidate, file and revision read controls share mechanics; distinct CI/history/story-comparison actors retain their existing owners. New observations add no framework, fixture tier or runtime state model.

PFE chose these existing owners after inspecting actual IntentFileReading/useIntentFileRead, IntentRevisionNotice, IntentCandidatesPanel, pageIntentReading, canonical MakeMe settings/candidate/source data, and their callers. Existing sourceRevision metadata siblings in Done/story/source-selection/retained landing/workspace and Summary-story-source remain legitimate slice8 migrations; additive exports invalidate neither their current observations nor unchanged proof.

Normal configured Prettier projection (read-only) covers26 files, maximum246, none over250; new target spec191. Four existing owners grow492→514 projected lines (+22). In the owned migrated source excluding the added proof, direct alert-role sites20→2 (one Intent owner plus the distinct published-detail alert), Retry controls11→1, Show latest14→1, reading-pane selectors4→1. Counts/sizes: `/tmp/seed300-slice7-source-gain.json`, `/tmp/seed300-slice7-size-projection.json`. No formatter applied.

## Source promises and actual proof

| Promise / obligation | Starting facts → observed result |
| --- | --- |
| 16,17 | Existing recovery cases retain explicit page-clock increments, held responses, GitHub limits and exact request counts/arrays at their original callers: 15/30/60-second backoff, hidden/reveal, shared published-detail wait, malformed settings, rate-limit, timeout/unreachable and manual candidate Retry. Controls changed, protocols did not. Full selection's unchanged positive results cover them. |
| 18,34,G8 | Existing revision tests keep caller-pinned old/new SHAs and exact browser revision expectations. New target cases independently compare old source metadata against accepted new browser revision while held/failed, and both after replacement. openCandidates receives each expected revision visibly in all3 callers; integrated timeout and frontend2 cases passed in the main selection. |
| 36 | New target cases explicitly focus source before the notice, prove it keeps focus when revision is merely offered, then independently prove the exact file control has focus after applying latest, while held, and through failed read. Held alternative also proves final file focus. No claim of file focus after the failed alternative's final file Retry. Existing revision/outcome focus observations remain intact. |
| 37 | New target cases use independent literal44 through expectSourceTargetLine: unique target, data-line44, current-location, viewport and visible number; also independently check Python case text/file. The line is checked before notice, while replacement is held, through failure and after each recovery. |
| 38,78 | New cases capture a nonzero reading-pane offset before transition and compare it one-shot before/while held, through failed read and after replacement. Existing revision-notice case now shares that same one-shot observation; halfway-scroll setup still establishes a positive measured offset, not a promised literal300. |
| 44,79,80,81 | Shared source/failure/recovery names make the chosen controls readable, while exact paths, old/new content and revisions, expected wording, clocks, request membership/count and hold/fail/release/Retry remain explicit in scenarios. |
| 82,83,84,G7 | `intent-source-target-recovery.spec.ts` declares two independently selected alternatives. MakeMe aRepository describes canonical Pygardon candidate/source at before/after revisions. A line44 source is selected through the real candidate UI. Both offer a notice and hold the actual next file read; one releases it, the other fails then retries it. Each observes the required source/line/revisions/focus/place at its applicable phases. The failure does not combine alternatives into a mandatory journey. |
| G9 | `intent-done-project-refresh.spec.ts` renews the complete original all-Done-tabs journey with the whole-Intent Show latest absence, while Project Intent separately notices its new revision. Positive selectors' original notice containers are restored exactly and retain matching proof. |

Setup and decisive locations: new target spec's named two cases (MakeMe describedRevisions, `beforeRevision`/`afterRevision`, literal targetLine44, explicit `sourceLocation: "tests/"`, real candidate selection); source focus/offset and initial exact3 requests before `origin.moveTrunk`; explicit controlled-clock observation; hold predicate matches exact Python path+afterRevision; browser/source metadata split plus old text/target/offset/file focus while held; failure's exact two revisions/old text/target/offset/file focus before Retry; replacement text/target/source+browser revisions/offset; exact locations-first request, independent candidates+file membership/count, and file-only Retry tail. Expected outcomes never come from product target resolution or actual metadata.

`intent-revision-notice.spec.ts` retains polite notice, coalesced revisions, source/selection/open group, original request order, focus, deletion and independent saved scroll. `intent-revision-update-outcomes.spec.ts` retains failed locations, browsable old files, failed latest text under its own failure/Retry, held request releases and exact final request log. `intent-read-recovery.spec.ts`, boundary recovery, Gherkin unusable/settings and integrated/frontend candidate recovery retain original MakeMe data, causal waits and independent wording/counts. No timeout override, sleep or test.slow added.

## Current proof and failures retained

Current46 distinct cases across25 files (2 frontend,44 integrated) are covered by43 unchanged positive cases from the full selection plus the corrected3 whole journeys. This is a justified union, not a claim that the initially failed46 command passed. `/tmp/seed300-slice7-proof-summary.json` matches renewed identities to the original selection and every current attempt is passed at retry0.

Original full selection (all edited specs plus complete6-file candidate family):

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice7-proof.json npm run test:dashboard -- frontend-tests/intent-candidates-read-recovery.spec.ts tests/intent/intent-candidates-read-recovery.spec.ts tests/intent/intent-ci-comparison-locations.spec.ts tests/intent/intent-ci-status.spec.ts tests/intent/intent-done-project-refresh-proof.spec.ts tests/intent/intent-done-project-refresh-reading.spec.ts tests/intent/intent-done-project-refresh.spec.ts tests/intent/intent-gherkin-settings-problems.spec.ts tests/intent/intent-gherkin-unusable.spec.ts tests/intent/intent-project-visit-ci.spec.ts tests/intent/intent-read-boundary-recovery.spec.ts tests/intent/intent-read-recovery.spec.ts tests/intent/intent-revision-notice.spec.ts tests/intent/intent-revision-planning-only.spec.ts tests/intent/intent-revision-settings-update.spec.ts tests/intent/intent-revision-update-boundaries.spec.ts tests/intent/intent-revision-update-outcomes.spec.ts tests/intent/intent-source-target-recovery.spec.ts tests/intent/intent-story-changes-only.spec.ts tests/intent/intent-test-optimization-candidates-case.spec.ts tests/intent/intent-test-optimization-candidates-live.spec.ts tests/intent/intent-test-optimization-candidates-open.spec.ts tests/intent/intent-test-optimization-candidates-revision.spec.ts tests/intent/intent-test-optimization-candidates-states.spec.ts tests/intent/intent-test-optimization-candidates.spec.ts --workers=1
```

Main `/tmp/seed300-slice7-proof.json`: selected46,44passed/2failed, runner+strict failed, terminal1, run16f85ef0-51b2-48c9-b472-70f6215d2067,113.210s runner. Both new cases stopped at the initial exact request array: the old logger only captured e2e_test/ source paths and omitted the actual Python request despite its rendered source/target. Repair extended the existing logger's explicit location input; old defaults and all other request filters are unchanged. Actual default consumers are the revision/planning/outcomes and home-activation cases; home activation's unchanged locations-only observation reuses slice6 strict44 proof. Same-name local counters in reading-place/read-reuse/navigation are not this API.

First new2 replay after instrumentation repair:

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice7-target-renewal-proof.json npm run test:dashboard -- tests/intent/intent-source-target-recovery.spec.ts --workers=1
```

`/tmp/seed300-slice7-target-renewal-proof.json`: selected2, both failed, runner+strict failed, terminal1, run891dc136-a558-4a73-a138-1374050798bd,25.530s runner. Held case reached replacement then found the additional expected candidate-record read at the accepted revision. Actual IntentCandidatesPanel stays mounted after opening; docs/dashboard-development-intent.md190–193 and existing candidate-revision proof require its refreshed record. Failed case reached source/line/revisions/focus then disproved the new unchanged-screen-y hypothesis: a new failure paragraph shifted y by32px. The maintained contract at docs190–217/pageIntentReading keeps scroll offset and earlier text under the failure, not absolute screen y. Coordinator authorized correcting this new oracle; no old check or source promise was waived.

Corrected complete new2 plus the G9 whole-negative journey:

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice7-corrected-proof.json npm run test:dashboard -- tests/intent/intent-source-target-recovery.spec.ts tests/intent/intent-done-project-refresh.spec.ts --workers=1
```

`/tmp/seed300-slice7-corrected-proof.json`: selected3,3passed, runner+strict passed, terminal0, runf8164b4a-df6f-42f3-8263-317606bd1ae2,32.203s runner. This directly proves the failed-state original offset rather than inferring it from layout. Final request check keeps locations first, exact concurrent candidates+file membership/count without invented ordering, then only file Retry. The old scenarios' original ordering claims are unchanged. Strict receipts, literal command files, console logs and shell timing receipts retain every attempt and cause.

`npm run typecheck:dashboard > /tmp/seed300-slice7-typecheck-final.log 2>&1` terminal0 after final API/oracle/container changes. Preliminary typecheck also passed. Root separately ran the required13-shard new-spec preview; no timing-list change or preview repeat was made here.

## One real-boundary scratch discrimination

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-slice7-scratch-proof.json npm run test:dashboard -- tests/intent/intent-source-target-recovery.spec.ts --grep 'file read is held then released' --workers=1
```

Temporarily changed only useIntentFileRead's outstanding-read retention from `text: was.text` to `text: ""`. Selected exactly1 maintained held alternative; it reached the actual next read and failed at `expect(source).toContainText("assert True")`, receiving blank source (only line number1). Run780c4c4b-170a-467a-a84a-7ed78608122a; runner+strict failed as intended, child terminal1,30.585s runner. This catches loss of kept source, not a helper-only mock. Finally restored exact original bytes; before/restored SHA256 `10a02fe116106a6adf98f024072c0ec50c39360aa5314f5897e7e994d0aa8a53`, independently confirmed HEAD equal and no product diff. Current normal3 proof remains valid; no receipt-only rerun.

`/tmp/seed300-slice7-scratch-receipt.json`, `-scratch-proof.json`, `-scratch-before-useIntentFileRead.ts`, `-scratch-failure-1-trace.zip` retain source/result/actual UI failure. Initial/first-renewal failure traces were also copied under this prefix outside the worktree.

## Consumer closure and resources

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base HEAD --term readFailure --term readRetry --term showLatestRevision --term expectReadingOffset --term sourceRevision --term intentReadRecoveryPage --term intentReadingPane --term intentReadingScroll --term intentPerspectivePage --term openCandidates --term intentReads --term intentRevisionJourney --term 'Show latest' --term 'Retry' --term '.intent-reading' --term 'intent-source-meta' --term IntentSourceLines > /tmp/seed300-slice7-consumer-trace.raw.md
```

Terminal0;1103 located rows all dispositioned in `/tmp/seed300-slice7-consumer-trace.disposition.md` and `-consumer-dispositions.json`. Terms include actual changed logger/API/module call forms and the DOM's source metadata spelling; generic Retry/readFailure/instant hits are separated from their actual source owner. Existing modules' additive exports introduce no initialization effect; old imported operations are unchanged. G8's3 actual callers, all Show latest containers, current affected families, local logger collisions and legitimate slice8 source-context owners were inspected. No relevant affected consumer is deferred to CI.

Local host16CPU/48GiB. Full selection prelaunch: AC charging83/lidopen, load10.56/10.24/11.99, memory58%free; one worker chosen, root reported no heavy owned process, SEED287 work elsewhere preserved. Before repair replay: AC charging88, load4.93; no pressure-related failure. All browser commands used maintained `caffeinate -s -i`. `/tmp/seed300-slice7-sleep-log.json`/`.txt` inspect12:35:12–12:47:31UTC: zero Sleep/Wake/DarkWake entries. No local result makes a remote-CI or performance claim.

No active test/writer/background command remains. Git index was not changed here; root's PLAN/proof-strategy/execution-context edits are preserved. No product/runtime diff remains. No missing slice7 observation, known failing current test, new human decision or uncommitted other-owner code is left in this return. Source8/9, independent refactor, publication and applicable final CI remain coordinator-owned.

## Coordinator acceptance

Freshness is unchanged at pinnedf9ed9f52, basec6. Attributed incoming work since
28e is only preparation/Take/admission records and profiles; no product, test,
dependency file, selected source or selected plan changed. Root inspected all26
code changes, full new scenario, real file-read/source/reading-place components,
original and corrected caller containers, every actual current strict receipt,
logger default equality and the exact product restoration hash.

Current46 identities are independently matched:43 unaffected original positives
plus corrected3, all retry0. The failure/Retry path proves selected-file focus
while held and failed; final focus after Retry is not an added product promise.
The documented scroll-offset contract at dashboard-development-intent.md190–217
supports the new one-shot failed-state observation; absolute screen-y after a
new error paragraph was an incorrect new hypothesis, not a waived old check.
The shared offset API also preserves the original immediate revision assertion.
All3 recovery callers expose expected revision. The original whole-Intent
Show latest absence and positive notice scopes are preserved. G7/G8/G9 are proved.

Root ran the new-spec publication gate from dashboard/tests/shards.md:
`node scripts/test-shares.mjs preview --split-count 13 --spec-dir dashboard`,
terminal0. It discovered991 specs,957 recorded/34 unrecorded (33 already tracked
atHEAD); predicted share totals952.5–962.0 job-seconds. The new target spec is
assigned5/13 with recorded-median9.5s assumption. This is a scheduling preview,
not a local/CI performance claim or new duration measurement.

The independent refactor and guarded delivery boundary follows.

## Independent refactor and final slice acceptance

`/root/refactor7` returned `## REFACTOR COMPLETE`. Its whole-concept pass
consolidated five positive Done/story/Summary metadata lookups through the
existing sourceRevision owner, keeping exact selected paths, expected SHA/text,
request evidence, capture/history facts and native transitions. No new API or
production behavior changed. The five metadata migrations are now complete in7;
slice8 retains its broader story/perspective transitions. This refines allocation
within the same source outcome, without a new promise or human decision.

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-refactor7-proof.json npm run test:dashboard -- tests/intent/intent-story-completed-source.spec.ts tests/intent/intent-summary-story-comparison-source.spec.ts tests/intent/intent-done-retained-landing.spec.ts tests/intent/intent-done-source-selection.spec.ts tests/intent/intent-done-retained-workspace.spec.ts --workers=1
```

Terminal0:9/9 across5 additional files, all retry0, runner+strict passed,
rundfde14a2-7371-4775-a5e9-be8717afeddd,98.885s. Typecheck terminal0.
Root inspected all5 diffs and the original strict receipt; identities are
disjoint from the accepted46. Current complete union is55 cases/30 files,
2 frontend/53 integrated. Existing46 proof, source-retention discrimination and
exact product restoration remain valid. All36 changed files are<=246 under
independent actual/configured projection; whitespace check passed.

Refactor effect trace completed with all40 rows dispositioned; the original1103
trace is supplemented by the new receiving9-case proof. Source metadata now has
one browser owner. Handoff `/tmp/seed300-refactor7-handoff.md` retains literal
commands, full setup/observations, exact5 paths, current resource/sleep evidence
and no active writer. Root independently verified the union and scope/metadata
contracts; final source freshness remains unchanged at pinnedf9ed9f52.
Guarded preparation, hook and publication remain coordinator-owned.
First fresh preparation stopped at an unused callback parameter in the new
test's comment-tail generation. Root replaced Array.from's unused parameter
with the existing keys/map form and independently verified identical60-line
output. This mechanical repair stays inside the accepted refactor's paths/trace,
adds no representation or helper, and invalidates no setup or observation.
