# ODF-150 — open-dough execution evidence

[Canonical finding, response and assessment](ODF-150.md#odf-150).

### Additional retained evidence — open-dough (2026-11-01)

**Source:** [DearDough.md](https://github.com/terryyin/open-dough/blob/d042a04e0fb53e3e3f66ddf6d9b34156e5785e2c/DearDough.md).

- Execution: SEED-163#reliably-report-dashboard-wrap-up / plan 367 / first related implementation `938f2f1e9224eb6503654fec1b8a3b033ccdd64e`
  - Timestamp: 2026-10-28T14:19:12Z (CI failure on slice 3 SHA `242e5fe7`) · Tool: Cursor · Model: auto · Open Dough release: 0.3.73
  - Evidence: plan slice 3 accepted proof named `story-branch-landing-capture.spec.ts` / later-publication twin plus unit coverage; CI run 40704491019 job `dashboard (3/12)` failed `story-branch-retained-landing.spec.ts:43` (ZodError requiring `landing` on second integrate). Repair `804e7d7f` asserts `already-accepted` without a landing field after expectation clear. Coordinator transcript `3fc700d8-1e3b-486e-82de-cd7b0c5e26e7` stashed slice 4 for that repair.
  - Observed effect: one owned CI failure and one assertion repair before slice 4 delivery; the sibling retained-landing journey was not in the slice's focused proof.
  - Inference: recurrence of focused-neighbor selection missing an existing consumer of the same second-integrate / no-landing contract after open-expectation clear.

- Execution: SEED-199#mobile-session-screen / plan 425 / first related implementation `eaa0237881d704ee46711d8bc4fb188401b6ec94`
  - Timestamp: 2026-10-31T13:07:38+08:00 (repair commit `a8ff15c2`; CI run 41165181622 attempt 1 on slice-1 SHA `eaa02378`) · Tool: Cursor · Open Dough release: 0.3.78
  - Evidence: plan Decisive premises listed header-UUID consumers (`agent-terminal*`, touch/session-management/sidebar) and slice-1 accepted proof included `final-report-touch*` but not `session-workspace-retirement.spec.ts` or board-paging / stacking look specs. CI failed Final-report UUID asserts and `expectNoSidewaysScrollAndWholeText` ellipsis reads. Repair `a8ff15c2` updated those consumers and added title-toggle negative margin; coordinator transcript `363e0b94-67d5-49d4-b77d-48deec743aed` stashed in-progress slice 2 for the repair, then removed the clipping margin during slice-2 acceptance (`533e9750`).
  - Observed effect: one owned CI repair commit before slice 2 delivery, plus follow-on title-toggle CSS correction after the repair’s margin clipped expanded titles; slice-2 work was stashed and restored around the repair.
  - Inference: recurrence of focused consumer selection missing existing Final-report header and look-spec consumers of the same compact-header contract after local owner proof passed.

- Execution: SEED-204#attach-image-at-launch / plan 427 / first related implementation `59c47d4c2183cbb908d645f649a37bbde063abb0`
  - Timestamp: 2026-10-31T10:45:36Z (CI failure run 41194050673 on slice-2 SHA `59c47d4c`) · Tool: Cursor · Open Dough release: 0.3.79
  - Evidence: slice 2 accepted proof named `agent-launch-ad-hoc-attachments.spec.ts` and `boundary/developer-part.spec.ts`. CI run 41194050673 failed existing launch-dialog layout/model consumers (tab order / sideways scroll) and exact instruction-byte expectations after Attach images changed `LaunchDialog` and `developerPart`. Repair `752504ff` hid the file input from tab order, constrained attachment layout overflow, and restored exact-byte `developerPart`. Coordinator transcript `9b247773-9b4c-456b-9be3-4f21c7043f14` stashed in-progress slice 3 around that repair. Distinct from later unrelated Recently-done WebSocket mock flake repair `305513aa` on slice-3 SHA.
  - Observed effect: one owned CI failure and one dialog/first-input consumer repair before slice 3 delivery; layout and exact-byte consumers were outside the slice's focused attachment proof.
  - Inference: recurrence of focused consumer selection missing existing LaunchDialog layout and `developerPart` byte consumers after local owner proof passed (ODF-150).

- Execution: SEED-198#responsive-project-header / plan 424 / first related implementation `1554cd81d83386549eead40df7abdbc1bf00698b`
  - Timestamp: unknown (2026-10-31 Asia/Singapore; after slice-3 header proof green and during full `npm run test:dashboard`, before publish `c5927db4` 17:29 +08) · Tool: Cursor · Open Dough release: 0.3.78
  - Evidence: coordinator transcript `5220567c-77df-404c-a6d2-7abf6ccb5d69` L90–L94 — focused header/touched proof green; full suite then failed phone-width journeys that still clicked hidden project radios; coordinator fixed callers onto `chooseProject` / `expectProjectChoice` / `shownProjectControl` before delivery. Published with those helpers in `c5927db4`.
  - Observed effect: no owned CI failure from this miss (caught locally by the wider suite before publish); extra repair loop on phone-width selection consumers already in the suite.
  - Inference: qualified recurrence of focused/owning-surface proof missing indirect callers of the changed project-selection contract once the tab radios hide at ≤400px.

- Execution: SEED-205#logo-sidebar-toggle / plan 430 / first related implementation `63c7699e57ce9ec57112e30434df07e944d3eaea`
  - Timestamp: 2026-10-31T23:13:50+08:00 (repair commit `539b192b`; CI run 41212447397 on slice-1 SHA `63c7699e`) · Tool: Cursor · Open Dough release: 0.3.79
  - Evidence: slice 1 accepted proof named banner/Sessions/passive-mark specs (`dashboard-header*`, `frame-sessions-look`, `frame-board-look`, `system-settings-look`, `sessions-sidebar`). CI failed many shards on `expectNoSidewaysScrollAndWholeText` without `compactProjectSelectCut` after designed compact-title truncation, and `source-navigation.spec.ts` treated Sessions' decorative `img.product-mark` (`alt=""`) as injected content. Repair `539b192b`. Later owned CI also failed `preparation-legend.spec.ts` at high zoom against banner geometry (repairs `d470063c`/`5f9ca93c`/`d62f0a66`; separate iterative-repair note DD-377). Coordinator transcript `1bca2eeb-150d-41d1-ab95-a929db66954e` stashed in-progress slice 2 for the truncation repair.
  - Observed effect: one multi-shard owned CI failure and one consumer/locator repair before slice 2 resumed; later banner-geometry consumers of the same one-line banner change failed separately in prep-legend.
  - Inference: recurrence of focused owning-surface proof missing page-wide whole-text and decorative-mark consumers of the changed compact banner contract after local owner proof passed (ODF-150).

- Execution: SEED-192#browse-test-purpose / plan 429 / first related implementation `ab73ddd47574e48447445e385c6fe5d91194fc68`
  - Timestamp: 2026-10-31T15:16:34Z (CI failure run 41214067769 on slice-2 SHA `2b74f403`) · Tool: Cursor · Model: auto · Open Dough release: 0.3.79
  - Evidence: slice 2 accepted proof named `intent-gherkin-browse.spec.ts`, `boundary/authenticated-read-intent-locations.spec.ts`, and frame not-configured consumers; it added `pathContainedInIntentLocations` on `file-at` admission. Existing `boundary/authenticated-read-boundary.spec.ts` committed-last cases still asserted unchanged `ghCalls().length` on unreachable refusals. CI failed that call-count on `2b74f403`, then again on `9c6bf664` and `16e8ffc4` (same cause). Repair `75cf1785` (run 41253114575 green) allows the pinned settings read and extracts `authenticated-read-committed-last.spec.ts`. Coordinator transcript `04bc7742-683e-41b1-995f-2fdbc6947449` L122–L133; repair Task `dd709676-9080-447c-a3db-adcfbeb6cea6`. Same delivery also typechecked a missed `tree` exhaustiveness consumer in `revisionReuseOrigin.ts` before slice-2 publish.
  - Observed effect: three owned CI failures of one admission call-count contract across slices 2–4; one expectation/spec-split repair before slice 5 close; slice-5 plan work stashed and restored around the repair.
  - Inference: recurrence of focused Intent/admission proof missing an existing boundary call-count consumer of the shared `file-at` refusal path after local owner proof passed (ODF-150).

### Retained source evidence — Open Dough (2026-11-04)

- Execution: SEED-225#restore-dashboard-responsiveness (plan 456-restore-dashboard-responsiveness; first implementation commit `fc23efe0c5926dfc7a42aacb8de00e8e3b9fb75d`)
  - Timestamp: unknown (2026-11-03 CI run 41650965339 on `fc23efe0`; 2026-11-04 whole-suite run before `0eec7393`) · Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: (1) slice 1 added `~/.open-dough/dashboard/incidents/`; its consumer trace searched changed symbols, and CI run 41650965339 failed `project-remove.spec.ts:152`, an exact listing of that folder; repair `fb8e6b05` changed five listing specs. (2) slice 9 moved settled attempts to the history answer; its trace and 964-spec family run passed, and the final whole dashboard suite failed `production-watcher-updates.spec.ts:124`, which read `.attempts` from a raw `/__agent-launch` response; fixed before the slice 9 commit.
  - Observed effect: one CI repair cycle (stash, repair agent, refactor agent, publication) and one late test fix; no product rework.
  - Inference: both consumers depended on the changed effect (a folder appearing; an answer field's contents) rather than on a changed symbol, so term-based tracing could not reach them; the whole-suite gate caught the second before publication.

### Retained source evidence — Open Dough (2026-11-07)

**Source:** [Open Dough / DearDough.md](https://github.com/terryyin/open-dough/blob/626ecc24b28c398eaa4543e19936a415c526c0e9/DearDough.md#odf-150).

- Execution: SEED-232#share-published-git-refreshes (plan 468-share-published-git-refreshes, first implementation commit `aa37bdf36d4a5b8596d71a6544156186a22dfc5d`)
  - Timestamp: 2026-11-04T15:51:35Z (CI run 41862069163 attempt 1 on `aa37bdf36`) · Tool: Cursor · Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: slice 1's plan proof named the new listing/listing-failures specs plus existing revision-check, shared, waiter, `shared-observation`, and `github-requests` cases, and rewrote only the shared-spec "later check asks again" expectation. Giving the listing its own tracked `AbortController` changed disconnect ownership; CI failed `authenticated-read-subprocess-lifecycle.spec.ts` (expected SIGTERM on revision-check abandon) and `auto-refresh-visibility.spec.ts` (expected heads check still conditional on the pre-hide revision). Repair `ec9babc1e` aligned those consumers without product change. Coordinator transcript `73c2f3cf-dcc7-4769-b1b5-b54c5265e809`; repair agent `ce5156b2-a142-4306-a841-80fb98917e9b`.
  - Observed effect: one failed CI run on the slice-1 SHA, one owned repair/refactor/publish cycle before slice 2, and a stash/restore of in-progress work around the repair.
  - Inference: qualified. The lifetime change's consumers still asserted last-waiter abort; focused proof followed the named listing reuse surface and left those contracts for CI.

### Retained Open Dough evidence (2026-11-08)

[Source revision](https://github.com/terryyin/open-dough/blob/cf1ea1debbd50eac9cfe73a2e6a6782597764fdf/DearDough.md). The first execution missed a test root and the refactor caught the defect before commit. The second reported its gap and supplied useful contrary evidence about the cost of the rule on a structure-only move.

- Execution: SEED-260#restore-default-test-timeouts (plan 502-restore-default-test-timeouts; first related implementation commit `6e6d16cef09551a1bd589ba1ec8be6c5cc970f1c`)
  - Timestamp: 2026-11-08T00:23:57+08:00 (commit time of slice 5 revision `8aeb3c1cc`; the refactor pass found it before that commit) · Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 5 implementation proof ran 38 `dashboard/tests` consumers of `controlReachability.ts` but not `dashboard/frontend-tests/control-reachability-observation.spec.ts`; the refactor pass ran it and it failed at `:37` ("a control revealed by earlier scrolling is still checked")
  - Observed effect: the single-pass reachability check silently dropped controls revealed by scrolling until the refactor agent fixed it before commit
  - Inference: the consumer selection was built from one test root; the coordinator's later briefs added "include frontend-tests and backend-tests consumers"
- Execution: SEED-269#recover-terminal-insert (plan 519-recover-terminal-insert; first related implementation commit `8bd83312df1f74f40b49ea914d605794dc45d3fe`)
  - Timestamp: unknown (2026-11-08, slice 1 acceptance before its commit at 2026-11-08T12:28:19+08:00) · Tool: Claude Code · Model: claude-opus-5-5 · Open Dough release: 0.3.90 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: slice 1 moved the `codexProtocol` fixture body in `dashboard/tests/support/codexLaunch.ts` into an export; the implementer ran `dashboard/tests/terminals`, `dashboard/tests/sessions` and one launches spec and reported the other `dashboard/tests/launches`, `dashboard/tests/review` and `dashboard/backend-tests` consumers as not run. The coordinator then ran them: 1332 passed, 1 skipped, 16.6 min
  - Observed effect: the gap was reported, not silent, and no defect escaped; acceptance waited 16.6 min on a byte-identical fixture move
  - Inference: differs from earlier rows. The implementer stated the gap honestly, so the brief's consumer rule worked; the cost comes from a structure-only test-support move whose consumers span every root

### Retained source evidence — Open Dough (2026-11-10)

**Source:** [Open Dough / ODF-150 — Implementation proof misses indirect consumers](https://github.com/terryyin/open-dough/blob/220026a4e1b8409ffa81f50cd8e3130945ff8472/DearDough.md).

- Execution: SEED-261#map-published-work-test-data (plan 508-map-published-work-test-data; first related implementation commit `8ea16d198c25169e76fc747377693540c7164b03`)
  - Timestamp: 2026-11-08T02:38:39Z (failed CI job completion)
  - Tool: Codex
  - Open Dough release: 0.3.90 (installed .agents/skills/dough-update/VERSION at the established Take)
  - Evidence: Slice 3's 50-job selection in `e85d59b0:.planning/slice-plans/508-map-published-work-test-data/PLAN.md` did not include `workspace-publication.test.mjs`. [Run 42439000527, test shard 1](https://github.com/terryyin/open-dough/actions/runs/42439000527/job/128603980600) failed because `publishReadyAssessment` still supplied the old digest fields.
  - Observed effect: One published increment failed CI. Slice 4's existing `expectedBasis` repair passed the exact job, and run 42440063442 passed the Node shards.
  - Inference: The old call crossed a skill test case module into the shared Node preparation adapter. The focused selection did not exercise that import chain.
- Execution: SEED-283#keep-done-story-intent-pinned (plan 550-keep-done-story-intent-pinned; first related implementation commit `c5edb96346b68c9397a775fbfc81c9357d40e13e`)
  - Timestamp: unknown (2026-11-09)
  - Tool: Codex
  - Open Dough release: 0.3.92 (installed `.agents/skills/dough-update/VERSION` at established claim `2ee6aa08a70a414caba882a971b77da90d06ac79`)
  - Evidence: Slice 1's local full Intent proof passed, but [CI run 42557683177, dashboard 11/12](https://github.com/terryyin/open-dough/actions/runs/42557683177/job/128966952090) failed `configuration/project-hide-sessions.spec.ts`. Restoring a hidden project retained an uncatalogued selected Done story; the journey still expected current-tree locations failure after Done source selection had stopped using current-tree fallback. The accepted repair and unchanged whole hide/session/selection journey are retained at `fa740edaf:.planning/slice-plans/550-keep-done-story-intent-pinned/source-review.md`, CI repair section.
  - Observed effect: One published increment required an owned CI repair, independent refactor/publication, and exact stash/restore of in-progress slice 2. Repair `fea15e65c` asserts retained identity, historical absence and no current browser; strict focused proof and the later whole Intent gate passed. Final candidate CI was still pending at retrospective.
  - Inference: The dynamic hidden-project restore path consumed the changed Done fallback outside the Intent directory; the initial accepted consumer proof missed that enclosing journey. No product defect is inferred from that obsolete expectation. Separately, the read-only retrospective traced a still-readable catalogued Done workspace through `storyReviewRequest.ts`/`storyReviewSnapshot.ts` to a live snapshot rejected by `useHistoricalIntentLocations.tsx`, despite recoverable published history. Completion fixtures always remove that workspace; `review/story-review-story-branch-landed.spec.ts` explicitly preserves the readable-workspace lifetime. Root retains this original outcome gap for correction before execution completion. This code-path finding is not a fresh browser reproduction.

### Further occurrences — Open Dough (2026-11-13)

[Source log](https://github.com/terryyin/open-dough/blob/07407e12b40115862205041f03e27851b361cfb2/DearDough.md#L28).

- Execution: SEED-298#insert-common-prompts-in-the-dashboard-terminal (plan 574; first implementation `0e258a2f7441b8a253f54860f0b9e56ed56a984d`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.94
  - Evidence: Original delivery added two dashboard specs without the pre-push shard preview required by `dashboard/tests/shards.md`. Final trunk CI run 42807295291, shard 4, hit its suite deadline after 371 passed tests; three cases never started. The maintained preview revealed 102 unrecorded specs. An unpublished refresh candidate used passing main run 42803799326; publication then found `f06b46597` had refreshed from a failed partial source. Reconciliation preserves its product changes and refreshes all 960 current specs from all twelve artifacts of its successful main run 42808747192, with exact-once selection. The two new specs were on shards 8/9, so they are not attributed as the direct failure cause.
  - Observed effect: one owned CI failure and a reconciled timing-record repair before closure; focused terminal proof missed the suite-discovery/allocation consumer. Shard 4 also had a broad 1.740 median slowdown; neither infrastructure nor the refresh as its sole cause was claimed. Final hosted margin remained a required CI gate before closure.

- Execution: SEED-285#retry-a-slow-landed-ci-build (plan 569; first implementation `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance)
  - Evidence: CI run 42800107133/1 at `8aeda2ade` failed native identity from a new shared MakeMe runtime import of the dashboard timing marker. Native fixture roots intentionally copy tests and src. Repair `0fb7f0226` removed that runtime dependency and retained independent test-domain timing facts; plan 569 `ci-repair-1.md` preserves diagnostics and native proof. Later owned runs42832244638/1 and42845502760/1 exposed the enclosing settings touch journey's last-fact/action adjacency assumption after the new follow-up setting; plan569 `ci-repair-3.md` retains the exact failing baseline and seven-case repaired proof with unchanged strict touch checks.
  - Observed effect: an owned published failure required pause, independent repair/proof and restoration of in-flight slice 2. No installation boundary was widened.
  - Inference: shared builders' fixture-materialization consumers belong in the changed import contract's proof; full dashboard timing proof could not expose the absent dashboard tree.

- Execution: SEED-307#apply-shared-page-object-rules-per-entry (plan 590; first implementation `48fd7667f08c15e5121be38593e11fb659f20298`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.95 (checkout-bound installed VERSION at accepted Take `80d20ed9e`)
  - Evidence: Published slice 2 `f31723244` linked delegation to new `test-entry-rules.md` before declaring that reference/runtime closure; CI run43010890708/1 test3/3 failed `tests/payload-declaration-links.sh`. Repair `e2806cc5e` added the complete closure and ran real install/update plus grouped/historical declaration readers. Recover proof at `fd9612e2891d4ca12bfc6bbd83718ec6b51326cb:.planning/slice-plans/590-apply-shared-page-object-rules-per-entry/ci-repair-observations.md`.
  - Observed effect: one owned dependency-closure CI failure, paused next-slice work and an independent repair before resuming. The same run's watcher teardown budget defect had a separate accepted solution; it is not attributed to this omission.
  - Inference: linking promoted runtime prose makes its delivery inventory an immediate consumer; a later installation slice does not postpone that compatibility proof. Matches ODF-150's indirect-consumer omission; no new framework or duplicate finding is needed.

- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: unknown (2026-11-12, about 09:55–10:10+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 changed `dashboard/tests/support/cursorSessionReading.ts` `openTakenCursorSession`. The implementation return listed its consumers as the Cursor session specs of the plan's premises table and ran those; the refactor agent's trace found `support/cursorSessionRecovery.ts` also calls it, reaching nine more specs (`cursor-session-recovery-wait`, `-restart`, `-replacement`, `cursor-runner-replacement`, `-controls`, `cursor-runner-helper-survival`, `cursor-session-scope-continuation`, `-noninterference`, `cursor-session-alerts`). The coordinator computed the transitive importers (22 specs) and ran them before publishing `43782e67d`.
  - Observed effect: one extra 7-minute local run before publication; no failure reached CI from this cause.
  - Inference: the implementer selected proof from the plan's list of failing specs, not from importers of the support module it changed; the consumer-trace output was dominated by plan-file matches.

- Execution: SEED-300#express-board-test-intent-through-page-objects (plan 584; first implementation `7bb1e73355fdb4b9c4d0c729f8df17892dfeb128`)
  - Timestamp: unknown (2026-11-13, slice 9 delivery about 08:30+08:00; CI failure reported about 09:50+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (installed `.claude/skills/dough-update/VERSION` at Take `6d102beae`)
  - Evidence: slice 9 made `dashboard/playwright.config.ts` import the new `tests/support/browserArgs.ts`. Its consumer trace listed `innerPlaywright.ts`, `proofRecordRun.ts` and backend runner specs as out of scope, but did not reach `tests/support/local-test-suite-checkout.mjs`, which copies the config together with a fixed list of its imports. CI run 43349861593 job "test (2/3)" failed `tests/support/local-test-suite.test.mjs:125` with ERR_MODULE_NOT_FOUND for `browserArgs.ts`; repair `974e2b7f` added the path to that list.
  - Observed effect: one failed CI run and one repair publication after the slice was published.
  - Inference: the trace was run from the changed module's importers; a file that reads the config as text and copies its relative imports is not an importer, so path-based tracing missed it.

- Execution: SEED-330#invoke-custom-ci-rebuilds (plan 606; first implementation `5bad29b07b263aa42a777fa8fbc1d24de03b102e`)
  - Timestamp: unknown (2026-11-12 CI event; exact occurrence time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.97 (checkout-bound installed VERSION at established claim `1117582709db72b2c3bc842ef4e388d9e6866a8d`)
  - Evidence: Slice 2 `b2899a8f5` extracted `ci-command-attempt.mjs`, imported by promoted `ci-proof-read.mjs`, without its payload declaration. CI run43235536671/1 failed four native evidence families. The repair reproduced both those omissions and actual installed `ERR_MODULE_NOT_FOUND`; `b51be060e2efde855d8cdb27d51bee0d7cd6667b` added the declaration and installed-reader proof in both roots after fresh install/update and unavailable release source. Plan606 source-review at that repair retains exact commands; 17 focused checks passed.
  - Observed effect: one owned published CI failure paused in-flight slice3, which was preserved and restored around an independent repair. Source transport/proof tests alone had not established installed dependency closure.
  - Inference: Matches the existing indirect-consumer omission: extracting a promoted runtime dependency immediately reaches the assembled payload and native fixture identity, regardless of the later documentation slice. No claim of measured isolated cost or released-user impact.

### Retained source evidence — Open Dough (2026-11-15)

**Source:** [Open Dough / ODF-150](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#odf-150).

- Execution: SEED-331#read-ci-history-at-a-glance (spent plan 609 recoverable at before-cleanup `33eb3f8cd99cb7e9131d072bf06576ef01cf3eaa`; first implementation `147fb83afa7f3e6a517862bb286bdb6e314f79cb`)
  - Timestamp: unknown (2026-11-13, slice 4 published about 16:00+08:00; CI failure reported shortly after)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.98 (checkout-bound installed `VERSION`)
  - Evidence: slice 4 `56dde3c` added `wallTimeReferenceOf` overloads so an explicit endpoint always returns a reference. Its consumer trace listed `server/ciFollowUpDecision.ts` as run through follow-up specs, and delivery formatting linted only changed files. CI run 43387096022 job `lint` failed `no-unnecessary-condition` at `ciFollowUpDecision.ts:29,32`; repair `45e6965` removed the now-dead guards.
  - Observed effect: one owned CI failure and repair publication; behavior proof of the consumer passed, its static check did not run.
  - Inference: a narrowed type reaches untouched callers' lint, which selective formatting skips; running the check-only full lint when a changed signature narrows would have caught it.

- Execution: SEED-358#close-launches-returned-to-the-backlog (spent plan 625; first implementation `fe871dfe5a9366fdedddd33e3794f67bb16130b3`)
  - Timestamp: unknown (2026-11-15, slice 2 acceptance before publication of `55d98f179`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.99 (checkout-bound installed `VERSION`)
  - Evidence: the slice 2 return traced five e2e consumers of the Done reading and moved count wording (`e2e/sessions/agent-launch-attention*`, `sessions-sidebar`, `agent-completion-quiet`, `agent-terminal-done-reopen`, `e2e/review/recently-done-one-shot-review`) and left them unrun with "hosted CI covers them", although the brief required the changed surface's suites within focused time. The coordinator ran them before acceptance: 9 passed in 41.2 s.
  - Observed effect: no CI failure; the acceptance rule refusing a consumer left for CI held, at one extra coordinator run.
  - Inference: the implementer still defers traced consumers to CI under the released response; the coordinator's acceptance guard, not delegation, stopped it here.

- Execution: SEED-364#chart-ci-time-without-runner-waits (plan 629; first implementation `33717676c1a7af5cd9b53f91b6239fd8e86ccc21`)
  - Timestamp: 2026-11-15T09:29:06Z (slice 1 hosted CI failure completed)
  - Tool: Cursor
  - Open Dough release: 0.3.101 (checkout-bound installed `VERSION`)
  - Evidence: slice 1 return ran plan-named measure/compat/collection specs and dispositioned store consumers as unchanged via re-export; coordinator accepted without `landed-ci-scope-*`. CI run 43698671685 failed `landed-ci-scope-proof-lifecycle` (extra `actions-workflow`) and `landed-ci-scope-retained-window` (kept `timeWithoutRunnerWaits`); repair `4c148b732` updated those expectations. Slice 4 `ef78f762a` left `ci-history-reader-compatibility` (`wallTimeMs`→`timeMs`), `intent-ci-status-wall-time` (always-shown measure chart label), and the same scope lifecycle request set for CI; run 43705198875 failed; repair `ea5742187`.
  - Observed effect: two owned CI failures and repair publications; final CI succeeded on `ea5742187`. Intent Coverage Caught key example 1 (no follow-up).
  - Inference: collection and history-contract changes reached scope and Intent status assertion suites outside the focused selection; re-export and plan-named proof did not force those consumers before publish.

- Execution: SEED-372#see-dashboard-connection-status-on-return (first implementation `1fc77eab2eee607e85106a7ecd6942a517aa3c4c`)
  - Timestamp: unknown (2026-11-15 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at established claim `c124365d015aec64b5186160980db9205b11955a`)
  - Evidence: launch `4932fa52-2d2b-4f2a-b439-2a21bf998478`; `1fc77eab2` added an empty one-pixel connection-status span. The accepted trace covered status/live-region, header and Sessions assertions but excluded an indirect frontend layout consumer. CI run `43705938729/1` failed `agent-launch-story-card-noted-start.spec.ts:68` with `not read whole: ["SPAN: "]`; `pageLayout.ts` only exempts hidden elements with nonempty text. Repair `70fb3664d` supplied the existing label as text. The exact frontend case failed before and passed after, and six streaming cases passed after.
  - Observed effect: one CI defect, a pause/stash/restore cycle and an additional repair publication after slice 1 had been accepted.
  - Inference: tracing matched the new accessible status but missed a whole-page layout assertion reached through an unchanged frontend rendering entry. This was an acceptance gap, not infrastructure; repaired before closure.
