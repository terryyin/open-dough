# DearDough Process Findings

Retained material shared-process findings, reviewed 2026-10-06. Only an explicit
queued follow-up is planned work; other entries are open and unqueued. A retained
released response is not proof of effectiveness. Unknown provenance stays unknown.
[Response status](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md).
Full pre-trim evidence: `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`; later trims: `a41f9d577be06030ed6da17a4ddd2139c7f79aea:DearDough.md`, `56e7b8944eabf6e49230b1ee4046be30183e11e2:DearDough.md`. Older narratives live in Git, not a second archive.

- Highest allocated local number: 256. Removed local codes are never reused.

## ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate

Former local code: DD-089.

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

Follow-up: Open, unqueued.

- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/slice-plans/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d` - Timestamp: 2026-09-21T09:08:13Z - Tool: Cursor - Model: Cursor Grok 4.6 - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27` - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install. - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green. - Inference: Qualified. Distinct from DD-074 (guidance now exists) and the earlier assumed tool unavailability report (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.
- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559` - Timestamp: 2026-09-29T09:03:35+08:00 (native Claude Code `trunk-closure/owned-context`) - Tool: Claude Code (coordinator; hosts Claude, Codex, Cursor) - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `b8946e99`; base 0.3.46 - Evidence: six owned-context runs printed PASS; five ran the creation-record read, while Claude's closure removed the worktree after the containment check alone (no `for-each-ref`, no "Close or retain it" read). Accepted only after `3b1f8619` named the check and one rerun read the record. - Observed effect: the assessor, which observes only the retired outcome, passed a native agent that skipped the ownership gate; caught only by transcript inspection.
- Execution: `SEED-108#observe-promised-journey` / plan 258, first related implementation commit `3d148f25` - Timestamp: unknown - Tool: Codex - Open Dough release: 0.3.57 (installed VERSION at claim `e21713d7`) - Evidence: coordinator's 2026-10-08 execution record and `c1875574c4f0b5a6703d7a3e45e981e5e9cd9227:.planning/slice-plans/258-observe-promised-journey/PLAN.md` Execution context/Learnings: initial npm ci installed one package with dev dependencies omitted; direct Node 24.5 guidance tests passed and slice 1 was delegated before reading tests/README.md and tests/native-setup.md. Before first publication, checksum-verified Node 24.21.0, Bash 5, locked dev dependencies, browser/check setup and the repository test runner replaced those observations. - Observed effect: implementation began before the repository-pinned readiness check; accepted proof and publication used the corrected setup, and no product failure from the initial setup was observed. - Inference: Qualified. A substitute green command did not establish native checkout readiness; this occurrence supports the existing ODF-087 gap, without proving a guidance change effective.

## ODF-059 — Delegated refactor pass stalled after editing and before reporting

Former local code: DD-057.

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

Follow-up: Open, unqueued.

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2` - Timestamp: unknown (after the CI repair return, before commit `ff33cb8` at 2026-09-24T17:46:32+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: 0.3.37 - Evidence: the CI-repair refactor agent's only notification said it had stopped with its own background work still running and had not reported; `ps` then showed no `node --test`, and `TaskStop` found no task. The coordinator kept waiting until the developer said "it seems to be staying here for quite some time." - Observed effect: repair `ff33cb8` shipped on the coordinator's own reruns without a refactor report (compare the earlier unreviewed ci repairs report); slice 6's refactor, told to run tests only in the foreground with timeouts, reported normally.
- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, before `809b407d` 13:54:50+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46. - Evidence: the refactor pass on the Story Branch native harness repair left two edits uncommitted and stopped (600 s stream watchdog) while "rerunning the accepted proof"; the coordinator reran that proof and delivered `809b407d`. Slice 3's implementation agent stalled the same way before writing anything and resumed through SendMessage. - Observed effect: two stalls in one execution, each costing a 10-minute wait and a coordinator-side recovery; no work lost.
- Execution: `SEED-104#confirm-mark-as-done` / plan 246, first related implementation commit `0ae01bd4` - Timestamp: unknown (after slice 2's delivery of `01f7d61f` at 2026-10-05T08:52:16+09:00, before CI repair `4f6d9f89` at 10:07:03+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: slice 3's implementation agent was terminated by the 600 s stream watchdog with 17 files edited and no report; a CI failure arrived at the same boundary, so the coordinator confirmed no Playwright run was live, parked the edits with `ci-repair-stash.mjs` (entry `97bf6485`), published repair `4f6d9f89`, restored them (`resumed`), and resumed the same agent through SendMessage with an instruction to bound long commands; it then returned a full report and slice 3 shipped as `8df2e91b`. - Observed effect: a 10-minute wait and one resume; no work lost. - Inference: Qualified. Third execution with a delegated-agent watchdog stall; the stall during a long broad Playwright run matches the earlier "rerunning the accepted proof" occurrence.
- Execution: `SEED-106#paged-dashboard-columns` / plan 225, first related implementation commit `a5e9e772` - Timestamp: unknown (after slice 1's delivery at 2026-10-06T07:36:58+09:00, before CI repair `d5a159d8` at 09:22:17+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: slice 2's implementation agent was terminated by the 600 s stream watchdog with 13 paths edited and no report; a CI failure for `a5e9e772` arrived at the same boundary. The coordinator parked the edits with `ci-repair-stash.mjs`, published the repair, restored them, and resumed the same agent with `SendMessage`, asking it to background whole-suite runs. - Observed effect: the resumed agent finished the slice from its own context; no work was lost or redone. - Inference: Qualified. A long silent whole-suite run under heavy load (first run 37 min) plausibly tripped the watchdog; resuming the stalled agent was cheaper than a fresh one here.

## ODF-154 — Cursor managed delivery lacks its coordinator session identity

Former local code: DD-095 (plan 126 Cursor occurrence only).

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

Follow-up: delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). `deliver --host cursor` takes the coordinator from `CURSOR_CONVERSATION_ID` and keeps its real hook generation as the gate. Native Cursor evaluation not yet run.

- Execution: `SEED-046#ci-verdict-correction` / plan 126, first related implementation commit `9fa45de` - Timestamp: unknown (first increment delivery, between commit `9fa45de` at 2026-09-27T12:43:54+08:00 and the observer start minutes later) - Tool: Cursor - Model: kimi-k3 - Open Dough release: modified; revision `ff3534c`; base 0.3.42 - Evidence: `9fa45de` delivery receipt `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); a manual probe then showed `CI_MONITOR_READY`; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-7YVAZ1`; the next managed delivery reported `observation.state: reused`. - Observed effect: first Cursor occurrence; slice 1's increment was unobserved until the manual start, and the finding's `$CLAUDE_CODE_SESSION_ID` recovery does not apply to Cursor's conversation/generation identity.
- Execution: `SEED-053#dashboard-browser-navigation` / plan 136, first related implementation commit `8ca2f7eb` - Timestamp: 2026-09-27T22:11:50+08:00 - Tool: Cursor - Open Dough release: 0.3.43 - Evidence: completion input `pendingCi: unobserved` ("host session identity required for Cursor notification bridge"); retained tip `777b797926acfab373a6cd45766e3066cbd9da95` - Observed effect: managed delivery left the story-branch tip unobserved; no Cursor session identity was available to arm the notification bridge - Inference: Same Cursor host-identity gap as the plan 126 occurrence; Claude-only recovery remains inapplicable
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5` - Timestamp: 2026-10-01T06:03:31Z (native Cursor run `cursor/publication/one-shot-auto-land/20261001T060331-5bc6`, slice 8 acceptance) - Tool: Cursor - Open Dough release: modified; revision `0d565a9e`; base 0.3.51 - Evidence: the native agent's managed `deliver` receipt for landed `063edd4` reported `observation.state: unobserved` ("host session identity is required…"); the agent found `CURSOR_CONVERSATION_ID` set but no supported way to pass it, kept its workspace and reported the gap. Cursor `one-shot-result` in the same batch hand-started an observer and retired; Cursor `one-shot-queued` queried CI once and retired. - Observed effect: three Cursor sessions handled the same missing identity three ways; the acceptance assessor needed a developer decision (kept workspace is compliant when CI went unobserved). - Inference: Same gap as earlier rows, now visible in native acceptance runs rather than a coordinator's own delivery; Codex showed the analogous `unobserved` receipt ("yielded-cell bridge is unavailable").
- Execution: `SEED-052#use-cursor-from-dashboard` / plan 210, first related implementation commit `71764841` - Timestamp: unknown (slice 4 `3e5c10d8` at 2026-10-02T11:40:03+08:00 and slice 5 `4541eda4` at 2026-10-02T12:27:54+08:00; both receipts were reported before this review started at 2026-10-02T12:29+08:00) - Tool: Cursor - Open Dough release: modified; revision `0ae15498`; base 0.3.52 - Evidence: the execution reported `observation.state: unobserved` and `pendingCi: unobserved` for `3e5c10d8` and `4541eda47a3d1b7f909320dea343bc66c9ac65e7`, reason `host session identity is required to verify the notification bridge`; earlier observer directory `/tmp/dough-ci-501/watch-aPxS2Q`. The coordinator transcript has four records and does not contain those receipts. - Observed effect: slice 4 and slice 5 CI stay unobserved; this review does not treat that as pass or fail. - Inference: Same Cursor session-identity gap. No replacement observer was started.
- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56` - Timestamp: unknown (delivery of `f84a7a56`, between its commit at 2026-10-02T14:13:42+08:00 and a clock read at 14:15:13+08:00) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: `deliver` from the coordinator's own Shell accepted `f84a7a56` on `refs/heads/cursor/state-that-cursor-supplies-embedded-attach` with `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); an immediate `ci-mailbox.mjs probe` from the same Shell got `CI_MONITOR_READY` from the Cursor hook; `ci-host-bridge.mjs` `resolveHostSession` falls back only to `CLAUDE_CODE_SESSION_ID`, and the coordinator cannot read its Cursor `conversation_id`/`generation_id` for `--session-json`. - Observed effect: the only increment's CI stayed unobserved; no manual observer was started because managed delivery forbids it. - Inference: Same gap; the hook proves Cursor's bridge works, so the missing piece is only identity transfer into `deliver`.
- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62` - Timestamp: unknown (first delivery of `7053bc62`, committed 2026-10-02T16:42:11+08:00; the third at `69634abd` came later) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: `deliver` for `7053bc62` returned `observation.state: unobserved` ("host session identity is required…"). A probe from the coordinator's Shell got `CI_MONITOR_READY`. The coordinator read `ci-host-bridge.mjs` and `execution-increment-observation.mjs` and found that a live matching observer is reused before the bridge check. It then ran `ci-mailbox.mjs start` (`watch-qYGHLT`) and `register-push`, and `10d7967e`'s delivery reported `reused`. That observer later emitted `CI_MONITOR_UNAVAILABLE` (GitHub TLS handshake timeout), so `69634abd`'s delivery was `unobserved` again and needed a second manual start (`watch-ssxsmf`). - Observed effect: two of four increments needed a manual observer start and registration, plus a code read to find the reuse path. - Inference: Same gap. A lost observer brings it back mid-execution, not only at the first delivery.

### Additional Cursor occurrence

Former local code: DD-231.

Three Story Branch increment deliveries were accepted on the execution branch without a host session identity, so no CI mailbox was created and the completion wait has no observer to close.

### Occurrences

- Execution: `SEED-097#cursor-agent-stays-joinable` / plan 242, recoverable at `f4650752e5b46ecc8db5302858c6aabccf12b574:.planning/slice-plans/242-cursor-agent-stays-joinable/PLAN.md`; first related implementation commit `e7fbca2a1ef98d777ffa29c31e3c6f882ce38be2`
  - Timestamp: unknown
  - Tool: Cursor
  - Model: Grok 4.7
  - Open Dough release: modified; revision `2ea2d324f5956dc76c006b0d425fdefda86b9771`; base 0.3.56
  - Evidence: `execution-increment-delivery.mjs deliver` receipts for `e7fbca2a1ef98d777ffa29c31e3c6f882ce38be2`, `d8468ccec8024cbab1350afac9ef01d4dc006e59`, and `2ea2d324f5956dc76c006b0d425fdefda86b9771` on `refs/heads/cursor/a-launched-cursor-agent-receives-its-story`, each `observation.state: unobserved`, `reason: host session identity is required to verify the notification bridge`. No `--session-json` was passed.
  - Observed effect: publication was accepted; CI was not observed; `complete-revision` has no mailbox.
  - Inference: Qualified. The coordinator omitted the host session identity. One execution.

## ODF-074 — A ready plan named a validation command the backlog tool does not have

Former local code: DD-121.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. Responses 2c5ff71 (0.3.43) and fcc29fad (0.3.48) are released; the same class of unobserved premise is reported again on 0.3.51–0.3.56, so neither is shown to resolve it. Response / limit: Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started.

- Execution: SEED-044#verify-planning-premises (plan 115; first implementation commit `2c5ff71f`) - Timestamp: 2026-09-27T14:17:23+08:00 - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `6882aeb3` guidance at planning time - Evidence: plan 115 slice 2 text at `6882aeb3`; `product-backlog.mjs` usage lists add, place, take, complete, refresh, direction, adopt, merge, record-state, read-state - Observed effect: small detour and an equivalent-proof judgment at acceptance; no rework - Inference: same class as the unobserved planning premises this story addresses (catalog ODF-074); plan 115 was written before its own rule
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce` - Timestamp: 2026-10-03T18:08:39+08:00 (commit `0b5253cf` recording the contradicted premise; the slice 4 premise was settled before `14745390` at 18:18:30+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: plan 233 premise rows. The slice 3 row was observed by reading spec lines 186-191 only, but `dashboard/server/hosts/cursor/launch.ts:130-140` writes `uncertain` before the client spawns, so the sleep was an absence window. The slice 4 row said "no event is known", but `agent-completion-early-recovery.spec.ts:30-53` already injects a `promises.mkdir` loader for the same lock. - Observed effect: slice 3's implementation agent stopped on the contradiction (about 77k subagent tokens, no code kept), and the slice closed as a plan record; slice 4's probe found the existing pattern quickly. No rework. - Inference: Qualified. Both premises described a sleep's purpose from the spec alone, without reading the state's write site or searching the suite for an existing observation of the same seam.
- Execution: `SEED-100#dashboard-specs-pass-unchanged-code` / plan 251, first related implementation commit `3a0ff700` - Timestamp: unknown (slices 3 and 4 returns, between `3a0ff700` at 2026-10-05T19:19:01+09:00 and `759f9134`) - Tool: Claude Code (delegated implementation agents) - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: plan 251's premise row "The two named specs still fail on a revision with every repair so far" was observed for the acceptance spec as "no commit to the spec since `7b6ddcce`". The slice 3 agent found the `:157` cause already repaired in the product by `9e3aff60` (after both failing revisions); the slice 4 agent found the path best fitting run 37245324663's trace already closed by `4f6d9f89`. Slice 2's 20 repetitions failed neither spec. The coordinator's slice 3 brief also named run 37245324663 as an acceptance failure; it failed only on the Cursor spec. - Observed effect: no rework; both agents spent part of their investigation (about 130k and 159k subagent tokens in total) separating repaired paths from open ones, and each still found and forced one open path (`launchRun.ts` reporting order; the paste-chip frame). - Inference: Qualified. A "still fails" premise was checked against the spec's history, not against product commits after the last failing revision on the paths the failure ran through.

## ODF-110 — A publisher-seam premise was observed by reading the seam, not the race it had to stop

Former local code: DD-124.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. Responses 2c5ff71 (0.3.43) and fcc29fad (0.3.48) are released; the same class of unobserved premise is reported again on 0.3.51–0.3.56, so neither is shown to resolve it. Response / limit: Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started.

- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; between re-bind `e8ce93b9` (2026-09-27T15:50:01+08:00) and slice 2 commit `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 premise table at `e8ce93b9` cites `execution-increment-publication.mjs:143-197`; slice 2 first return reported the merge-driver conflict; corrected premise row and North Star wording in `6f350f28` - Observed effect: one extra implementation round in slice 2 (an added pre-reconciliation fetch, then consolidation into `onFetchedTarget`) and a North Star correction - Inference: Qualified. A race premise is cheap to observe with the existing racing-push fixtures; reading the hook's call sites observed the seam, not the Take-then-replay journey
- Execution: `SEED-052#script-execution-preparation` / plan 178, first related implementation commit `821cd555` - Timestamp: 2026-09-30T14:50:39+08:00 (CI repair `f77110df`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: plan 178's premise table row "New script files ship with the skill directory (no manifest to edit)", observed by `grep -rln execution-start-receipt` outside skill copies, marked yes for slice 1; CI failed on `tests/payload-declaration-links.sh` because `install.sh` `managed_files` declares each shipped script and reference; slice 1's own files were declared in `f77110df`, and the plan row now records the premise as wrong. - Observed effect: one failed CI run and one repair commit early in the execution. - Inference: Qualified. The premise was observed by searching for a name, not by the consuming operation (adding a shipped file and running the payload-declaration check), which is the same shape as this finding.

- Execution: `SEED-116#claude-done-rename` / plan 267, first related implementation commit `ed9a306e` - Timestamp: unknown; plan written before the claim `fef99b34`, risk surfaced by the retrospective after `bcb39b01` (2026-10-07T11:07:28+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: plan 267 premise row "its screen settles through `KeptClientScreen.settled()`" and decision "`screenText()` gives the first settled screen", read from `keptClientScreen.ts:107`, which only drains xterm's write queue; O1 typed after a fixed 4 s wait, not at the moment the dashboard types; the fake accepts input at once, so every spec passed; correction plan `c18d1d8a6c0124fb32f2b8aeecd880777439d272:.planning/slice-plans/270-claude-done-rename-readiness-correction/PLAN.md` - Observed effect: the delivered private attachment types at the first output byte of `claude attach`; the real-host risk was found only by the retrospective and needs a correction - Inference: Qualified. The premise was observed by reading a method name and a probe with different timing, not the dashboard's own typing journey on a real attach.
- Execution: `SEED-118#reduce-repeated-reads-across-tabs-and-deployments` / plan 275, first related implementation commit `9d8b5ed6` - Timestamp: unknown; plan written in `24c684b4` (2026-10-08T06:41:39+09:00), premise disproved in slice 1 before `9d8b5ed6` (2026-10-08T09:07:00+09:00) - Tool: Claude Code - Model: claude-fable-5-1 (planning) - Open Dough release: 0.3.57 (installed `dough-update/VERSION` at `24c684b4`) - Evidence: `24c684b4:.planning/slice-plans/275-retained-answers-across-processes/PLAN.md:76` decided the revision gate "already holds and is proved, not re-implemented" with no premise-table row observing it; slice 1 found pinned reads (`server/performedRead.ts`) accept any revision the browser names, so a logged-out second process answered a pinned read at A from the store; the gate was added as `server/heardRevisions.ts` and slice 2 removed in-memory caching of store hits that leaked past it (plan 275 slice 1-2 learnings) - Observed effect: slice 1 grew by a new gate mechanism and needed a coordinator scope ruling against the plan's decision; slice 2 found and fixed a second leak of the same rule; no CI failure - Inference: Qualified. The story's own example 5 (logged-out `gh`, no retained text) was the journey that disproved the premise; observing it through the boundary, rather than asserting it from how readers are created, would have caught it at planning.

## ODF-156 — A slice-acceptance obligation recorded as a plan learning never reached the next delegation

Former local code: DD-126.

A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

Follow-up: Open, unqueued.

- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; slice 3 delegated after `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 Learnings at `d0101737`; `dough-bug-fixing/SKILL.md:98` still forces `--no-replan` and its closure steps still route through wrap-up at `70f6cde1` - Observed effect: the retrospective found contradictory closure guidance and planned a correction - Inference: Qualified. Learnings are free text; nothing ties an acceptance obligation to the slice that must satisfy it

## ODF-157 — A "no other location" premise was swept with the removed rule's words, missing the concept's other wording

Former local code: DD-127.

An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

Follow-up: Open, unqueued.

- Execution: `SEED-008#isolate-parallel-slice-delivery` / plan 131, first related implementation commit `1d3a26cd` - Timestamp: 2026-09-27T18:03:28+08:00 (premise recorded in plan commit `9f8b82b0`) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: plan 131 premise row "Concurrent-writer wording exists beyond the permission"; `src/skills/dough-execute-plan/references/ci-monitor.md:249` at `1d3a26cd`; the retrospective's search for `writers|other agents` found it - Observed effect: the leftover shipped in the slice commit and needed correction story `SEED-008#restate-ci-pause-ownership` and plan 132 instead of a one-line edit in slice 1 - Inference: Qualified. The search terms described the removed permission, not the concept it relied on (who else writes in the checkout); searching for that concept's actors ("agents", "writers") would have found it
- Execution: `SEED-008#finish-removing-checkout-coordination` / plan 145, first related implementation commit `3239c49a` - Timestamp: unknown; slice 2's refactor pass ran before its commit `da2178fd` (2026-09-29T07:38:10+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `b37292dd`; base 0.3.46 - Evidence: plan 145 slice 2 proof and premise rows swept `src` for `declared-owner|declaredOwner|another-writer|unclear-ownership|--requester`. The refactor pass found "another writer's ownership, or ambiguous ownership" (refresh results list) and "Report the competing writer" in `maintain-default-checkout.md`, plus "unclear ownership" at `docs/project-visibility-requirements.md:365`. - Observed effect: all three leftovers were removed before commit `da2178fd`; the plan's empty-grep proof would have passed with them in place - Inference: Qualified. Second occurrence: the identifier sweep matched the removed names, not the concept's prose; this time the refactor pass caught it, not a correction story

## ODF-158 — Execute-plan's required reference reads cost more than a clean one-slice run used

Former local code: DD-128.

Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

Follow-up: Open, unqueued.

- Execution: `SEED-004#proudly-found-elsewhere-design` / plan 133, first related implementation commit `29d0c909` - Timestamp: unknown (after Take `848db9fd` committed 2026-09-27T18:56:02+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: coordinator conversation: persisted reads of `delegation.md` + `execution-decisions.md` + `agent-commits.md` + `runtime-setup.md` (31.6KB) and `wrap-up.md` + `ci-monitor.md` (29.9KB), plus `execution-location.md`, `trunk-publication.md`, `finish-or-stop.md`, `ci-completion-wait.md` - Observed effect: no rework or error; context spent on paths not taken - Inference: Qualified. The skill ties reads to boundaries ("before arming observation", "before a claim"), but managed delivery and the start command now own those mechanics, so a boundary reached through them still triggers full reads. Cost only; this run gives no evidence of harm to quality
- Execution: `SEED-053#proportionate-local-verification` / plan 143, first related implementation commit `8cafa49d` - Timestamp: unknown (between Take `f510358e` committed 2026-09-28T16:46:40+08:00 and `8cafa49d` committed 2026-09-28T16:51:36+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `2b46e651` - Evidence: coordinator conversation: full reads of `execution-location.md`, `delegation.md`, `execution-decisions.md`, `wrap-up.md`, `finish-or-stop.md`, part of `trunk-publication.md` and `agent-commits.md`. The only slice added one 10-line paragraph. The coordinator skipped the required `ci-monitor.md` read before arming, and managed delivery attached the observer without it - Observed effect: same as above; no CI event, repair, stash, or rework occurred, and skipping `ci-monitor.md` caused no visible harm - Inference: Qualified. Third consecutive one-slice prose execution. The skipped read shows that "before arming observation" still names a read that managed delivery has made unnecessary on the normal path
- Earlier occurrence details: 2 additional recorded rows, one in `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md` and one (`SEED-065#warning-free-lint`) in `80043764511288cf27c5f14b128c2820110a8b45:DearDough.md`; these are historical evidence, not new occurrences.
- Execution: `SEED-088#review-changes-since-last-review` / plan 245, first related implementation commit `d754256c` - Timestamp: unknown (between Take `eb52e12a` committed 2026-10-05T13:30:54+09:00 and `d754256c` committed 2026-10-05T13:43:51+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: coordinator conversation: full reads of `established-start.md`, `execution-location.md`, `delegation.md`, `execution-decisions.md`, `wrap-up.md` + `ci-monitor.md` (31.4KB, persisted), `runtime-setup.md` + `ci-notify-hosts.md`, and parts of `trunk-publication.md`, `agent-commits.md`, `record-preparation.md` before the first delegation. This five-slice run then used `ci-monitor.md`'s failure handling twice. - Observed effect: no rework; much of the startup read covered paths the managed start and delivery commands own (probe, start, register). - Inference: Qualified. Unlike the one-slice rows, a multi-slice run with real CI failures used part of `ci-monitor.md`; the waste is in the observer setup and arming sections, not the failure handling.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db` - Timestamp: unknown (2026-10-07, between Take `fb3a2201` and `11ddc3db`) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: coordinator conversation: `established-start.md`, then `execution-location.md` + `delegation.md` + `wrap-up.md` in one 35KB persisted read, then the publication section of `trunk-publication.md`, `finish-or-stop.md` and part of `agent-commits.md`, for one Structure slice (about 30 changed lines) - Observed effect: no rework; managed delivery attached the observer, so the arming sections were not used - Inference: Qualified. Same pattern as the other one-slice rows

## ODF-106 — Two plans planned concurrently on different checkouts both took number 132

Former local code: DD-155.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

Follow-up: Open, unqueued.

- Execution: `SEED-051#isolate-runner-settings` / plan 132, first related implementation commit `6b2ca78f` - Timestamp: 2026-09-27T18:36:56+08:00 (plan commit `77a8ca0f`; the sibling `132-restate-ci-pause-ownership` was committed at 18:32:11+08:00 in `9060ff71` on the execution branch and reached trunk via merge `54b5f025`) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: `.planning/slice-plans/132-isolate-runner-settings/` and `.planning/slice-plans/132-restate-ci-pause-ownership/` on trunk at `54b5f025` - Observed effect: the executor had to infer the intended plan (the one at the default checkout's HEAD when the session started) and could have Taken the other queued story - Inference: Qualified. Allocation from checkout-visible numbers cannot see another checkout's unpublished plan; the collision went unnoticed at merge because directory names differ

## ODF-150 — Slice proof chosen by the changed components missed page-wide invariant specs

Former local code: DD-177.

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

Follow-up: delivered, unreleased: SEED-095#prove-slices-through-consumers (recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md`). Response `cca9bff4` is on main; no release tag contains the complete response as of 2026-10-06.

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002` - Timestamp: 2026-09-29T17:36:06+08:00 (CI run 36550218994 on `08f217af`) - Tool: Claude Code; Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: slice 2 delegation's spec list; the failure at `accessible-overview-keyboard.spec.ts:72` (expected 5, received 6); repair `76e6dce3`. Slice 1's list had included that spec. - Evidence (recurrence in the same execution): slice 3's retention sentence put "done" in Recent sessions' always-shown intro; `published-work.spec.ts:151` forbids completion words anywhere on a page without sessions and failed only in CI run 36551022132 on `32e554d5`; the full dashboard suite (286 tests, 46 s) then passed locally with the repair. - Observed effect: two failed CI runs, two repair commits, and two extra refactor agents. - Inference: Qualified. Selecting proof by the names of changed components misses specs that assert a whole-page property. The whole dashboard suite takes under a minute locally, so running it before delivering a page change costs less than one CI repair.
- Execution: `SEED-052#start-ad-hoc-project-session` / plan 172, first related implementation commit `689970f7` - Timestamp: 2026-09-30T10:29:14+08:00 (slice 5, commit `5c09cc85`; CI run 36660072699) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: slice 5 added an always-rendered `role="status"` line in `StartSession.tsx`; its delegated proof ran only the ad hoc, terminal, sidebar and card specs; CI failed on `getByRole('status')` matching two elements in six page-wide specs (`accessible-overview-keyboard`, `auto-refresh`, `auto-refresh-recovery`, `published-work`, `read-failure`, `refresh`). `aria-live="polite"` also collided with `dashboardPage.ts`'s `notice` locator, so the repair `ed7e1aa1` uses `role="log"`. From slice 6 the whole suite (351 tests, about 1 min) ran before delivery. - Observed effect: one failed CI run, one repair commit, one repair agent, and a stash and restore of slice 6's unfinished work. - Inference: Qualified. The cause recurred in a new execution; slice 4's implementer had run the whole suite once, slice 5's delegation named a spec list instead.
- Execution: `SEED-052#script-execution-preparation` / plan 178, first related implementation commit `821cd555` - Timestamp: 2026-09-30T15:12:54+08:00 (repair `f9927f40`; later `66cb5a25`, 2026-09-30T16:01:20+08:00) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: plan 178's outside-in proof said to run only the new focused specs locally ("the whole suite is CI's"). Slice 2 made every launch run a start first, so the launch became slower; `agent-launch-card-delete.spec.ts` (`f9927f40`) and, one slice later, `agent-launch-recent-delete.spec.ts` (`66cb5a25`) each changed session states while the last launch was still writing the fake listing (lost update). Further unreproduced load-sensitive local failures followed (`agent-launch-card-problems.spec.ts:82`, an ad hoc launch spec). - Observed effect: two repair commits, one found by CI and one later locally, for one root cause discovered one spec at a time. - Inference: Qualified. The changed operation (launch) has a whole family of `agent-launch-*` callers, and the earlier row here records the whole dashboard suite at about a minute; the plan's focused-files-only instruction repeated the changed-area proof selection.
- Execution: `SEED-052#use-cursor-from-dashboard` / plan 210, first related implementation commit `71764841` - Timestamp: 2026-10-02T09:27:33+08:00 (CI run 36950863895 `updatedAt` 2026-10-02T01:27:33Z) - Tool: Cursor - Open Dough release: modified; revision `0ae15498`; base 0.3.52 - Evidence: slice 1's proof named `agent-launch-start-cursor.spec.ts`, `agent-launch-start.spec.ts`, and `agent-launch-start-codex.spec.ts`. Job `dashboard (3/9)` on `71764841` failed four tests that still expected HTTP 400 for `host: "cursor"` in `agent-launch-refusal.spec.ts` and `agent-launch-ad-hoc-boundary.spec.ts`. Repair `2f21a7be`. - Observed effect: one failed CI run and one repair commit before slice 2. - Inference: Qualified. Offering Cursor invalidated the old unoffered-host rows; the slice proof followed the new start specs and missed those consumers.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (slice 2 publication and CI repair)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance; product guidance edited separately)
  - Evidence: run 36997893525/attempt 1 on `29bd2aa` failed keyboard/page-wide and cross-project launch fixtures; focused slice 2 proof omitted those callers. Repair `a049909` supplied the existing canonical Doughnut fixture and traversed enabled actions, retaining the production guard. Recovery `4dc3860a587ec3f95ee590134b88fb5d5d10a8a7:.planning/slice-plans/216-blocking-story-dependencies/CONTEXT.md` records six affected browser files and independent fixture consolidation proof.
  - Observed effect: two owned CI repair cycles with independent refactors, including a pause/stash/restore of slice 3's draft. Completion also exposed direct keyboard focus before canonical availability in run 37003387678; the passing repair observes enabled execution and canceled-dialog removal without changing production guards.
  - Inference: qualified recurrence of changed-operation caller selection; unavailable dependency facts now affect every new execution action, including legacy fixture callers. No full-suite timing or generalized cost measured.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 CI failures)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed at published start `db6b0da`; unchanged throughout execution)
  - Evidence: published slice 5 `9c5b4fd`, PLAN accepted 15-spec proof plus startup/restoration refactor proof. Runs 36997568980/1 and 36998319791/1 failed accessible-overview-keyboard (Remove missing from exact tab order), agent-launch-codex-options (two service starts expected, three observed), and agent-launch-codex-observation (expected no service preparation after records arrived). Full affected specs reproduced four failures locally; tests-only alignment and shared observation refactor passed the complete affected/startup/restoration selection and typecheck. Trunk integration 46b0431/run37001581515/1 additionally exposed production-watcher and production-watcher-updates development journeys without configured-project preconditions. Both original journeys reproduced red; four lines reuse configureDevelopmentProjects in isolated HOME. Complete watcher/configuration specs and typecheck passed, preserving real releases/HMR/records/boundaries/shutdown and genuine empty development; independent review needed no edits.
  - Observed effect: three failed CI runs and two additional implementation/refactor pairs; completion receipts retained observation instead of permitting handoff.
  - Inference: proof followed the new behavior and selected neighbors, but missed existing whole-page keyboard and native-lifecycle consumers. This matches ODF-150; no full-suite duration or universal test-selection rule is inferred.

- Execution: `SEED-008#installed-story-branch-integration` / plan 220, first related implementation commit `d213f1efec373b098bddd4e83030db2c08693571`
  - Timestamp: unknown (2026-10-02–03 execution; failed run 37021271369/attempt 1)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at established claim `418e5e52`; managed copies unchanged)
  - Evidence: slices 2–4 changed shared launch reporting input, attempt evidence and completion guidance. Focused proof missed existing model/preparation/one-shot/acceptance and lifecycle consumers; CI on `4ef5e2e` failed seven dashboard jobs and test (2/3). Repair `41fee026` aligned those consumers with an independent input oracle, preserving native grammar/settings and chmod-fault assertions; the latter exposed reporting bootstrap outside launch-progress cleanup finally. Final literal red/green commands and 42-test consumer selection live in plan 220 at `41fee026`.
  - Observed effect: one failed CI attempt and owned pause/repair/refactor cycle; the preserved fault scenario found and fixed a real stale launching-progress defect.
  - Inference: qualified match to changed-operation caller-flow selection, rather than a file-type premise. Select proof from the shared contract's current consumers, including test-support callers; retain independent observations. No guidance change or full-suite mandate is authorized here.

- Execution: `SEED-098#story-card-actions-read-at-a-glance` / plan 244, recoverable at `aa7a3eec7d5f48f3ac84d1c3afce18b0e0939ed3:.planning/slice-plans/244-story-card-actions-read-at-a-glance/PLAN.md`; first related implementation commit `2d9347c1b1fd90372afd9c6a51ac9af734fbbef5`
  - Timestamp: 2026-10-04T21:09:46+08:00 (CI run 37204384263 `updatedAt` on `4ed30458`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.56, last updated by `b0bc3a08`
  - Evidence: plan 244's Current decisions set the local gate to "the focused Playwright specs named per slice". Slice 2 (`4ed30458`) ran 24 note- and tooltip-reading specs. CI failed `accessible-overview.spec.ts:190` (Inspect story under the sticky stage heading; `.card button` lacked `scroll-margin-top`), `agent-launch-attention.spec.ts:79` (snapshot before the credited human slice 1 added to the scan line loaded), and `agent-launch-ad-hoc-sessions.spec.ts:215` (shorter cards let Recent sessions into the 720px window). Slice 3's implementer ran the full dashboard suite (1036 passed, about 6 min) and repaired all three in `670e776f`.
  - Observed effect: one failed CI run; no separate repair cycle, because the next slice found and fixed them before its own delivery.
  - Inference: Qualified recurrence. Shorter cards and a new scan-line fact changed page-wide layout and loading, which the selected specs did not exercise. The planner wrote the focused-only gate while the ODF-150 follow-up was still unreleased.

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: 2026-10-05T22:37:47Z (CI run 37383488386 jobs test (2/3) and test (3/3) on `0f334e41`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: slice 1 made `product-backlog complete` write an untracked `.planning/done/<id>.json`. Its return listed the node script tests that run `complete` as consumers and updated three of them; the installed `executable-proof.md` already names stand-ins. The shell substitute `native_one_shot_close_story` (`tests/support/native-agent-one-shot.sh`) committed with `commit -qam`, so `tests/git-publication-native-one-shot-results.sh` and `-workspaces.sh` failed on a dirty workspace. Repair `0b669ed2`.
  - Observed effect: one failed CI run and one pause/repair/refactor cycle; slice 2's uncommitted work was saved and restored around it.
  - Inference: Qualified recurrence with the stand-in rule installed: the consumer search followed `.mjs` callers and missed shell stand-ins of the same contract.

## ODF-141 — A delegated refactor pass ran on each of two tiny guidance changes and edited nothing

Former local code: DD-192.

The required fresh refactor agent was spawned for a five-line skill paragraph plus one data file, and again for a one-entry data addition; both returned `## REFACTOR COMPLETE` with no edits, after reading the diff and skill references.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: unknown (2026-10-01, between `47ef4368` at 18:04 and `c63a1c0b` at 18:49 +08:00)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: four refactor passes on documentation-only slices; slices 1–3 made only rewraps or one-phrase rewordings (about 56k, 78k and 49k subagent tokens); slice 4's pass found two wrong citations in the new seed (`src/launchWorkflow.ts:43,65` for a substitution that is in `src/StartLaunch.tsx:105-106`, and a misdescribed `src/agentTerminal.ts:3`).
  - Observed effect: three passes changed nothing of substance; one corrected story evidence before it was published.
  - Inference: Qualified counter-evidence: on a change whose text carries code citations, the pass can pay off even when no code changed.
- Execution: `SEED-056#state-refinement-decision` / plan 221, first related implementation commit `80043764` - Timestamp: unknown (2026-10-03, before commit `80043764` at 07:40:53+08:00) - Tool: Claude Code (coordinator and delegated agent) - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: the slice reworded two sections of `src/skills/dough-slice-planning/SKILL.md` (+38 words); the refactor pass (about 48k subagent tokens, 4 tool uses) edited nothing but reported that "Stay within the triggering instruction" restated the report contents without the new refinement decision line, so a planning-only report could omit it; the coordinator fixed both bullets in `80043764`. The plan had limited edits to the two sections although its premise search for `remaining concerns` matches those bullets - Observed effect: no rework; one coherence gap closed before commit, outside the plan's section limit - Inference: Qualified counter-evidence, like plan 200: on a tiny guidance change that restates nearby text, the pass can pay off
- Execution: `SEED-103#attention-message-correction` / plan 249, first related implementation commit `ebb48d6e`
  - Timestamp: unknown (2026-10-05; slice 2 and 3 passes ran before commits `59ee1e70` and `5ebdef5e`)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: four refactor passes on a test-and-admission correction. Slice 3's pass (a 5-line spec step, about 52k subagent tokens) edited nothing; slice 2's (fixture comments, about 48k) only rewrapped two comment paragraphs. Slice 1's (about 50k) replaced a new local `Mark as done` locator with the existing `markAsDone` helper; slice 4's (about 49k) retitled the admission test to name the new refusal.
  - Observed effect: two passes changed nothing of substance; two made small useful test edits.
  - Inference: Qualified. Same mixed pattern as plans 200 and 221: no-edit passes cluster on comment-only or single-step test changes.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db`
  - Timestamp: unknown (2026-10-07, before commit `11ddc3db`)
  - Tool: Claude Code (coordinator and delegated agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: refactor hand-back `none — already clean` (59,631 subagent tokens, 7 tool uses) for removing one helper and a try/catch, two guards, and four comment rewordings, plus one test wait.
  - Observed effect: no edits; it confirmed consumers and kept a now-redundant `signal.aborted` check in `revisionChecks.ts` on purpose.
  - Inference: Qualified. Cost only, on a small code-and-comment change.
- Execution: `SEED-106#paged-columns-reveal-and-count-correction` / plan 259, first related implementation commit `74a48aee` - Timestamp: 2026-10-08 (+09:00), before commits `74a48aee` and `a41f9d57` - Tool: Claude Code (coordinator and delegated agents) - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: refactor hand-backs `none — already clean` for slice 1 (a containment lookup, one mark on three regions, an extracted spec helper; 60,389 subagent tokens) and slice 3 (deleting a 5-line CSS rule plus a comment sentence; 48,076 subagent tokens) - Observed effect: no edits; both named only pre-existing neighbouring representations they left alone - Inference: Qualified. Cost only; the CSS-only pass fits the cluster on tiny non-logic changes

## ODF-200 — Story Branch delivery's `--target-ref` value had to be read from the script

Former local code: DD-196.

The delivery references name an "authorized target ref" and say Story Branch Mode pushes to the remote execution branch, but do not say that `deliver --target-ref` then takes `refs/heads/<execution branch>` rather than the trunk the established start names as `target`.

Follow-up: delivered, unreleased: SEED-008#story-branch-delivery-target (story and plan recoverable at `b413d0fe:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md` and `b413d0fe:.planning/slice-plans/256-story-branch-delivery-target/PLAN.md`). Response commits `9a9e0a6e` and `a1bcad0d`, first containing release pending: `deliver` requires `--mode trunk|story-branch` and refuses a Story Branch target other than `refs/heads/<execution branch>` before any push; "Publish the candidate" shows the command with each mode's target.

### Occurrences

- Execution: `SEED-065#warning-free-lint` / plan 187, first related implementation commit `96838533`
  - Timestamp: 2026-09-30T20:07:39+08:00 (commit time of `96838533`; the lookup followed it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.50
  - Evidence: before delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef`, read its lines 60–120, and read `targetBranchName` in `publication-git.mjs`, then invoked `deliver --target-ref refs/heads/claude/make-npm-run-lint-report-no-warnings-or-errors-c`; the established start listed `target: main`.
  - Observed effect: four extra tool calls; delivery was accepted on the first attempt with observation attached.
  - Inference: Qualified. Passing `refs/heads/main` from the established start's `target` was a plausible mistake; whether the script would refuse it was not checked.
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5` - Timestamp: 2026-10-01T09:36:12+08:00 (commit time of `ef745cb5`; the lookup preceded its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `0d565a9e`; base 0.3.51 - Evidence: before the first delivery the coordinator grepped the delivery references and script for `--target-ref` and `targetRef`, finding `refs/heads/<branch>` only in `wrap-up-closure-publication.md:39`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement as the earlier row.
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: 2026-10-01T18:04:21+08:00 (commit time of `47ef4368`; the refusal followed it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: first `deliver` passed `--target-ref claude/review-dashboard-architecture-before-adding-more` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted.
  - Observed effect: one refused call; no state change.
  - Inference: Qualified. The refusal message made the fix obvious, so this occurrence cost less than the earlier lookups.
- Execution: `SEED-072#responsive-session-start-reconciliation` / plan 192, first related implementation commit `109fd76b` - Timestamp: 2026-10-01T17:50:33+08:00 (commit time of `109fd76b`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: unknown; installed guidance last updated by `e6a7106c` (base v0.3.51) - Evidence: the coordinator passed `--target-ref origin/claude/keep-the-dashboard-responsive-while-session-star` and `deliver` refused with "authorized target must be a branch ref"; the retry with `refs/heads/<execution branch>` was accepted with observation attached. - Observed effect: one refused delivery call and one retry; no state changed. - Inference: Qualified. The script refuses the wrong form, so the cost stays small; the guidance still does not name the expected form.
- Execution: `SEED-072#durable-startup-reconciliation` / plan 206, first related implementation commit `3d82d365` - Timestamp: 2026-10-02T08:16:29+08:00 (commit time of `3d82d365`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at claim `76a298b1`) - Evidence: first `deliver` passed `--target-ref origin/claude/keep-reconciled-startups-settled-under-one-unres` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; the same coordinator mistake as the plan 192 row, one day later, on the same story.
- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56` - Timestamp: 2026-10-02T14:13:42+08:00 (commit time of `f84a7a56`; the lookup followed it) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, then read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; the same missing statement, now on Cursor with 0.3.54.
- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62` - Timestamp: 2026-10-02T16:42:11+08:00 (commit time of `7053bc62`; the lookup followed it) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: two extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce` - Timestamp: 2026-10-03T17:53:24+08:00 (commit time of `7b6ddcce`; the lookup followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in it and in `execution-increment-publication.mjs`, then passed `refs/heads/<execution branch>`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6` - Timestamp: 2026-10-03T15:31:33+08:00 (commit time of `fdcc45f6`; the lookup preceded its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`) - Evidence: before the first delivery the coordinator ran `execution-increment-delivery.mjs --help`, grepped `targetRef` in the script, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-094#observe-ci-on-codex-and-cursor` / plan 235, first related implementation commit `c02158fc` - Timestamp: unknown (before `c02158fc` committed 2026-10-03T18:33:40+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help` and inferred `refs/heads/<execution branch>` from Story Branch wording; the established start listed `target: main`. - Observed effect: one bundled read; delivery accepted first time. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-052#unread-report-apart-from-engagement` / plan 238, first related implementation commit `f1221461` - Timestamp: unknown (between the slice 1 commit at 2026-10-03T19:49:17+08:00 and its delivery) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; delivery accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-091#frame-look-checks-one-rule` / plan 236, first related implementation commit `03c9316c` - Timestamp: unknown (delivery of `03c9316c`, after its commit on 2026-10-03) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref main` from the established start's `target` and was refused with "authorized target must be a branch ref: main"; the coordinator then grepped the script and read its lines 60–110 before retrying with `refs/heads/<execution branch>`, which was accepted with observation attached. `publish-the-candidate.md:12-13` does name `refs/heads/<target-branch>`, but the coordinator had read only `trunk-publication.md`'s delivery sections. - Observed effect: one refused call and two lookup calls; no state change. - Inference: Qualified; the same missing statement in the references the delivery path directs a coordinator to read.
- Execution: `SEED-052#mark-report-read-keeps-session-state` / plan 239, first related implementation commit `46340f4a` - Timestamp: unknown (before the first delivery, after `46340f4a` committed 2026-10-03T22:05:42+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help` and inferred `refs/heads/<execution branch>` from Story Branch wording; the established start listed `target: main`. - Observed effect: one extra call; delivery accepted first time. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-091#story-card-information-radiator` / plan 231, first related implementation commit `c58dc07d` - Timestamp: unknown (before the delivery of `c58dc07d`, committed 2026-10-03T21:36:52+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: while slice 1 ran, the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; both deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-104#confirm-mark-as-done` / plan 246, first related implementation commit `0ae01bd4` - Timestamp: unknown (while slice 1's agent ran, before `0ae01bd4` committed 2026-10-05T08:33:04+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; all five deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-102#full-height-review-changes` / plan 247, first related implementation commit `2b983fd0` - Timestamp: unknown (delivery of `2b983fd0`, after its commit at 2026-10-05T13:51:45+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref origin/claude/review-changes-in-a-full-height-panel-with-compa` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; same missing statement, low cost.
- Execution: `SEED-105#land-and-wrap-up-process-retrospective` / plan 250, first related implementation commit `1be19216` - Timestamp: 2026-10-05T14:48:39+09:00 (commit time of `1be19216`; its delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator read `trunk-publication.md` ("Story Branch Mode pushes that candidate to the recorded remote execution branch") and `deliver --help`, then passed `--target-ref refs/heads/main` from the established start's `target: main`; `deliver` accepted it with receipt target `refs/heads/main`, and `git ls-remote` then showed `main` at `1be19216` with the execution branch still at the claim `4aea12b4`. Slice 2 used `refs/heads/<execution branch>`. - Observed effect: a Story Branch increment was fast-forwarded onto remote trunk before review or integration; not reverted (no force push), and a second CI observer was attached for trunk. - Inference: Qualified. This answers the first row's open question: `deliver` takes no mode and does not refuse a trunk target, so the missing statement can publish to trunk rather than costing only lookups.
- Execution: `SEED-100#dashboard-specs-pass-unchanged-code` / plan 251, first related implementation commit `3a0ff700` - Timestamp: 2026-10-05T19:19:01+09:00 (commit time of `3a0ff700`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: first `deliver` passed `--target-ref claude/dashboard-specs-pass-ci-on-a-revision-that-chang` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; same missing statement.
- Execution: `SEED-088#review-changes-since-last-review` / plan 245, first related implementation commit `d754256c` - Timestamp: unknown (while slice 1's agent ran, before `d754256c` committed 2026-10-05T13:43:51+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the coordinator printed the `deliver` usage in `execution-increment-delivery.mjs`, grepped `targetRef` across the scripts, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. - Observed effect: three extra tool calls; all six deliveries were accepted first time. - Inference: Qualified; same missing statement.
- Execution: `SEED-106#paged-dashboard-columns` / plan 225, first related implementation commit `a5e9e772` - Timestamp: 2026-10-06T07:36:58+09:00 (commit time of `a5e9e772`; the refusal followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the first `deliver` passed `--target-ref claude/dashboard-columns-page-horizontally-instead-of-w` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached. - Observed effect: one refused call; no state change. - Inference: Qualified; the queued follow-up has not reached this installed release.
- Execution: `SEED-113#share-repeated-observer-reads` / plan 261, first related implementation commit `a1c593a9` - Timestamp: 2026-10-06T17:24:05+09:00 (commit time of `a1c593a9`; the refused delivery followed it) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: the first `deliver` passed `--target-ref claude/share-repeated-reads-across-dashboard-observers` and was refused with "authorized target must be a branch ref"; the retry with `refs/heads/…` was accepted with observation attached, and later deliveries used that form. - Observed effect: one refused call; no state change. - Inference: Qualified; the delivered follow-up has not reached this installed release.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde` - Timestamp: unknown (before the first delivery of `a2d43dde`, committed 2026-10-07T07:51:11+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION` at claim `0edabd1c`) - Evidence: before the first delivery the coordinator printed `execution-increment-delivery.mjs --help`, grepped `targetRef` in it, and read `targetBranchName` in `publication-git.mjs`; the established start listed `target: main`. After main (0.3.57) was merged at `fefab16d`, the next `deliver` was refused for the missing `--mode` and retried with `--mode story-branch`. - Observed effect: two extra lookup calls and one refused call; every delivery was accepted. - Inference: Qualified; the released response now refuses a missing mode, which surfaced mid-execution when the merge updated the installed scripts.

## ODF-201 — Codex stream notifications leave handled failures unread at completion

Former local code: DD-200.

Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding delivered failure notifications, but neither its consumer nor the stream worker advanced the mailbox's durable delivery cursor. After both failures were repaired, completion returned green CI while retaining shutdown for those same unread events. This is distinct from ODF-144's lost-worker notices: the worker was live and the stale events were actual repaired CI failures.

Follow-up: delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). The documented Codex binding acknowledges each notified batch through `ci-mailbox.mjs acknowledge`; unnotified records still retain shutdown. Native Codex evaluation not yet run.

### Occurrences

- Execution: `SEED-052#start-codex-refinement-from-dashboard` / plan 189, first related implementation commit `05f3e4a9fa018eba5be122b729f5b78f0e4cce70`
  - Timestamp: unknown (2026-10-01 execution completion)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-kA6yM3`, cell5. `complete-revision` for `cca873af2766128d3409db6c47c1a8beea39a7f6` returned exact success (run36793490950/attempt1) and shutdown retained/unread_actionable_failure for runs36750057215 and36790537801. Installed `readDeliveryProgress` returned deliveredThrough0; only sequences1/2 existed, matching those handled failures and published repairs a8c8d27/3fdae6f. `ci-notify-codex.md` consumer calls notify; `streamMailboxWorker` prints records; neither calls recordDeliveryProgress. Coordinator verified identity/event tuples and acknowledged exactly1/2 through the installed export.
  - Observed effect: Completion could not confirm shutdown despite green CI and previously accepted repairs; another records/recovery boundary was needed.
  - Inference: Durable delivery acknowledgment is missing in this adapter path. CI provider health and product behavior did not cause this retained shutdown.

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: unknown (2026-10-01 human-judgment stop and authorized resume)
  - Tool: Codex
  - Open Dough release: unknown; coordinator installed VERSION 0.3.51
  - Evidence: observer watch-kaShmz, cell19/session4531/PID3443, stopped receipt recordedThrough2/deliveredThrough0/unread2. Sequence2 was own run36813260082/attempt1 on slice4 8020eb2, already corrected by slice5 ca12038b; trace tied the timeout to raw HTTP awaiting a WebSocket upgrade. Root inspected both events and used installed recordDeliveryProgress to acknowledge exactly2 after the clean CI-repair save/restore returned resumed. [Execution account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/NATIVE.md#resumed-observer).
  - Observed effect: delivered historical failure still required durable acknowledgment after shutdown; no new repair was manufactured. The same binding was rearmed only after old PID exit.
  - Inference: this second execution reproduces the adapter cursor gap. Notification arrival timing alone does not establish a separate provider defect.

- Execution: `SEED-066#align-one-shot-callers-with-review-default` / plan 196, first related implementation commit `e4902583ce1e737a19f26ecd18bc437e3b68a751`
  - Timestamp: unknown (2026-10-01 execution)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-JOgwzs`, cell14/session82933/PID52346 delivered sequences1/2: run36839722302/attempt1 on bfec4af and run36841489154/attempt1 on 76969a1c. Repairs 76969a1c/6726e8c were accepted. Installed readDeliveryProgress still returned deliveredThrough0; readMailbox/readMailboxEvents confirmed exact checkout/repo/branch and only those two event tuples. Coordinator used installed recordDeliveryProgress after verifying both handled events; acknowledgment returned sequences1/2 and deliveredThrough2.
  - Observed effect: proactive recovery required an explicit durable acknowledgment before completion; no blocked completion or additional product repair is claimed in this occurrence.
  - Inference: the notification adapter's same cursor gap recurred; message delivery alone did not persist acknowledgment.

- Execution: `SEED-076#session-after-workspace-retirement` / plan 201, first related implementation commit `33eb0b69afbca8db3cc860f5d6ca2d9dd74aa17f`
  - Timestamp: unknown (2026-10-01 execution, three CI repair boundaries)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: retained observer `/tmp/dough-ci-501/watch-qG1qAV`, cell42/session72248/PID16942 delivered sequences1–4: run36861023410/attempt1 on34fd7257, run36862248330/attempt1 on130e8a6d, run36865996491/attempt1 on84b26724 and run36866430369/attempt1 on9b982761. Repairs130e8a6d/bc98c4ac were accepted; the last two attempts had the same verified startup-fixture framing cause. The installed Codex binding extracts record.event and calls notify, without retaining sequence or advancing delivery progress. Root used installed readMailboxEvents/readDeliveryProgress to match the handled event tuples and recordDeliveryProgress to acknowledge exactly1, then2, then3/4; final deliveredThrough4, remaining[]. [Execution proof](https://github.com/terryyin/open-dough/blob/74b5f149edc174ba641e721b2b21d061d07ba891/.planning/slice-plans/201-session-after-workspace-retirement/PLAN.md) retains the diagnosed repairs.
  - Observed effect: each delivered, handled failure required explicit durable acknowledgment before completion. No blocked completion or additional product repair is claimed for this occurrence.
  - Inference: the same adapter cursor gap recurred. Process proposal remains ODF-201's existing unqueued acknowledgment-contract follow-up; this review does not change guidance.

- Execution: `SEED-077#ci-independent-of-package-mirror-stalls` / plan 207, first related implementation commit `e98441593f71e722b032ab08203c43b43a4c1d56` - Timestamp: unknown (2026-10-02 completion operation) - Tool: Codex - Open Dough release: unknown - Evidence: retained observer `/tmp/dough-ci-501/watch-Mcfmhh`, cell14/session97439/PID47835; exact-revision completion for `43226774216f8d4eb3de0ec516a898d86212749e` returned success (run36947886626/attempt1) but retained shutdown for unread sequence1, run36942598744/attempt1 on `e9844159`. That event's attention-journey synchronization failure was already repaired by `7ab0732b` with deterministic red/green proof and passing run36943286746. Installed readMailbox/readMailboxEvents/readDeliveryProgress confirmed exact checkout/repo/branch and only this handled tuple; coordinator used recordDeliveryProgress to acknowledge sequence1, deliveredThrough1. - Observed effect: one completion receipt retained shutdown and required explicit durable acknowledgment, then repetition of the completion operation. No new product repair was needed. - Inference: the installed yielded Codex adapter's documented binding notifies record.event without persisting the delivery cursor, reproducing ODF-201. Keep its existing unqueued contract proposal; this execution changes no guidance.

- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-x4nPTj`, cell19/session35356/PID69697 delivered sequence1, run36962208003/attempt1 on `9c0d6bb4`. After focused red/green repair and accepted `4a50e086`, installed readMailbox/readMailboxEvents verified checkout/repository/branch and that exact tuple; readDeliveryProgress still returned deliveredThrough0. Coordinator acknowledged only sequence1 through recordDeliveryProgress, then read back deliveredThrough1.
  - Observed effect: one explicit durable acknowledgment was necessary after notification handling; retained shutdown was avoided before completion. No unseen evidence was cleared.
  - Inference: the notification/cursor gap matches ODF-201. This occurrence does not claim a failed shutdown receipt; existing contract follow-up remains unqueued and guidance unchanged.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 CI repair and execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-HB2kLV`, cell105/session35081/PID79031 delivered sequence1, run36978829120/attempt1 on `e5fe8a7c`. A fresh agent reproduced the startup test's disposed-response race and repair `0e88f0162b06f151444dd3588345d08279df6c62` passed held red/green, both original tests and typecheck; managed delivery reused the observer. Installed readMailbox/readMailboxEvents verified exact checkout/repository/branch and event identity; readDeliveryProgress remained deliveredThrough0. Coordinator acknowledged exactly sequence1 through recordDeliveryProgress and read back deliveredThrough1, remaining[].
  - Observed effect: one explicit durable acknowledgment was necessary after handling the delivered failure. No failed shutdown receipt is claimed. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
  - Inference: matches ODF-201's notification/cursor gap. Keep the existing unqueued contract proposal; this review changes no guidance.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (CI repair after slice 2)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance)
  - Evidence: `/tmp/dough-ci-501/watch-7PZYuD` delivered sequences 1–3 for run 36997893525/attempt 1 on `29bd2aa`; the Codex stream binding notified event payloads without advancing durable delivery. Coordinator inspected the exact SHA/run/attempt/job tuples and used installed `recordDeliveryProgress` to acknowledge only those handled notifications; repair `a049909` was published. Completion later retained sequence 1 in `watch-cWrqJu`, run 37003387678/attempt 1 on `ce8b9df`, job 110825968667; the coordinator inspected the responsive keyboard failure and acknowledged exactly that delivered sequence while its passing repair underwent independent review.
  - Observed effect: explicit durable acknowledgment was needed beyond stream delivery. No unseen failure was discarded.
  - Inference: same adapter acknowledgment gap; keep the existing unqueued proposal. Internal delegated reasoning is unavailable, so no broader process-cost claim is made.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 execution)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at published start `db6b0da`; unchanged throughout this execution)
  - Evidence: `9c5b4fd8bb26e7f9bda1739199260d8c47928204:.planning/slice-plans/215-persistent-dashboard-project-configuration/PLAN.md`, Slice 4. Native observer `/tmp/dough-ci-501/watch-EQYhvD` notified sequences 1–2 for runs 36989187526/1 and 36993027579/1; installed readDeliveryProgress still returned deliveredThrough0. Coordinator inspected both exact identities and acknowledged only that handled prefix through recordDeliveryProgress; unseen events remained unread. Later inspected events 3–6 covered the same diagnosed failures on 9c5/dc8; after focused red/green repair and independent review, the installed export advanced only through sequence6. Wrap-up trunk observer lRHJqz later notified sequences1/2 for run37001581515/1 on 46b0431; readDeliveryProgress still returned0. After inspecting both failed-job identities and accepting focused repair/independent review, the installed export acknowledged only that handled prefix through2.
  - Observed effect: Delivered and handled failures still required separate durable acknowledgment before completion. No retained-shutdown failure is claimed for this occurrence.
  - Inference: The same notification/acknowledgment gap recurred; the installed export provided bounded recovery without changing guidance.

- Execution: `SEED-113#show-available-facts-promptly` / plan 260, first related implementation commit `cba2dedfe40de7bf9c7956e974b2021c279cd5fe`
  - Timestamp: unknown (2026-10-06 execution/CI handoff)
  - Tool: Codex
  - Open Dough release: 0.3.56 (installed guidance unchanged since accepted Take `ead6c3a6`)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-5B7G8A`, cell138/session91572/PID66922. Completion for `f62292cd5748681bd54514e0c3fed49ddfe29024` used successful basis `eaa279dc026764cdb96d5abe54d7d8533163af08`, but retained shutdown/unread_actionable_failure for sequences1/3, runs37418870176/1 and37421684885/1, jobs112123517311/112132216439. Installed readMailbox/readMailboxEvents verified exact checkout/repo/branch and deliveredThrough0; the documented binding notifies record.event without retaining its sequence or recording delivery progress. Fresh diagnosis, independent refactor and deterministic proof produced accepted repair `7da9f1533316187860cb318dcac81238a6a538b6`; the clean repair restore returned resumed. Coordinator acknowledged only handled sequence1 through installed recordDeliveryProgress; deliveredThrough1 leaves sequences2/3 unread. Sequence2, cancelled run37420000326/1 on9baca4db, has thirteen unexplained preceding failures without a retained shard trace; its disposition remains open. [Execution evidence](https://github.com/terryyin/open-dough/blob/dc41662d1cc60505be39889aad511122907eb364/.planning/slice-plans/260-available-dashboard-facts/PLAN.md#ci-repair-and-unresolved-verification).
  - Observed effect: one successful-CI receipt retained shutdown and required diagnosis, repair and explicit durable acknowledgment. The first receipt did not establish that historical failures were already repaired. No final execution/CI completion is claimed.
  - Inference: same adapter cursor gap as ODF-201. This does not establish notification-arrival timing, worker loss, or a common CI-provider cause; internal delegated reasoning remains unavailable. Existing delivered/unreleased follow-up and guidance are unchanged.

## ODF-202 — Managed Codex delivery and yielded stream have no documented attachment seam

Former local code: DD-201.

Managed increment delivery can create a detached observer and say Codex binding is retained by the caller. The documented yielded-cell stream command instead creates its own mailbox; it accepts no existing directory. The coordinator could not establish that those two paths deliver notifications from the same observer without starting another observer or inventing an adapter.

Follow-up: delivered, unreleased: SEED-094#observe-ci-on-codex-and-cursor (recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md`). Response `abeb79f9` arms and reuses the Codex stream; no release tag contains it as of 2026-10-06. Native evaluation remains pending.

### Occurrences

- Execution: `SEED-067#pin-older-preparation-command-proof` / plan 195, first related implementation commit `94d87f23428d092f9b7885598315f71a018ca39d`
  - Timestamp: unknown (2026-10-01, first increment delivery before review at 15:07+08:00)
  - Tool: Codex
  - Open Dough release: 0.3.51 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: installed `execution-increment-observation.mjs` calls `startExecutionMailbox`; `ci-host-bridge.mjs` Codex binding says caller retains stream binding. `ci-mailbox.mjs stream` calls `streamMailboxWorker`, which creates a new mailbox; its CLI takes repository/branch rather than an existing mailbox directory. `trunk-publication.md` forbids a separate ordinary-increment observer start. Retained delivery receipt for `94d87f23` accepted the branch publication with `observation.state: unobserved`, reason `Codex yielded-cell bridge is unavailable`; no mailbox was started.
  - Observed effect: local proof and publication succeeded; automatic CI notification and completion coverage remained unavailable for this execution.
  - Inference: A missing documented connection, rather than missing host primitives, prevented the coordinator from truthfully asserting a live bridge. An independently verified attachment seam could change this judgment.

- Execution: `SEED-066#dough-land-kept-one-shot-ownership` / plan 199, first related implementation commit `df9fb909aba363fc1d5c025070d9dcee1becdc74`
  - Timestamp: unknown (2026-10-01, first increment delivery)
  - Tool: Codex
  - Open Dough release: 0.3.51 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: `29abd1fa92e8fff1d3bb1575da8d17895100af7e:.planning/slice-plans/199-dough-land-kept-one-shot-ownership/PLAN.md` Delivery state retains accepted branch SHA and unobserved receipt. Installed `execution-increment-observation.mjs` starts a detached mailbox; `ci-host-bridge.mjs` says Codex binding is caller-retained. `ci-mailbox.mjs stream` creates another mailbox, with no existing-directory argument; ordinary managed delivery forbids a separate observer start. No verified connection was available, so delivery omitted the bridge-available assertion and started no observer.
  - Observed effect: focused proof, all eight native re-acceptance runs, and branch publication passed; automatic CI notification/completion coverage remained unobserved.
  - Inference: same missing attachment contract as the first occurrence. Exposed host primitives alone do not establish delivery from the managed observer; no runtime or guidance repair is authorized here.

- Execution: `SEED-075#host-neutral-session-meaning` / plan 203, first related delivery commit `4ef487ec5ac683d6cecd9ff1f4618a45b76dbecf`
  - Timestamp: unknown (2026-10-01, observer setup before first branch increment)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `cee792a`; unchanged on authorized repair resume)
  - Evidence: `675c2a86f10a6775dbd7dcb1e4e145515a1594b1:.planning/slice-plans/203-host-neutral-session-meaning/PLAN.md` retains documented yielded stream `watch-LkPomH` (cell 26, PTY 44395, PID 24803), armed before managed delivery. Receipts for `4ef487ec`, `56f8681f`, `7e5d273e`, `1a027123`, `cef712aa` reused that exact observer. Installed managed detached-start and new-mailbox stream paths still expose no existing-directory attach argument. Human ownership stop confirmed local shutdown; authorized resume armed `watch-4v8x7b`, reused by repair publication `bee36261`.
  - Observed effect: startup/reuse provided one observer per active execution period without a detached second worker. Delivered CI assertion evidence led to an ownership question and Terry's bounded repair assignment; notification coverage was not inferred from tool presence alone.
  - Inference: matches the successful plan-204 route, limiting claims of unavailable Codex primitives. The managed-versus-stream guidance ambiguity still required coordinator investigation; document that single supported startup/reuse route. No guidance/runtime edit is authorized by this review.

- Execution: `SEED-080#readiness-change-indicator` / plan 209, first related implementation commit `dc1f5e0dd0ebeef5ceff0ee80de35a411f72036c`
  - Timestamp: unknown (2026-10-02 branch delivery; immediate review clock 08:40:01+08:00)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: managed delivery accepted `dc1f5e0d` on `refs/heads/codex/show-changes-since-readiness-review-without-bloc`, with `observation.state: unobserved`, reason `Codex yielded-cell bridge is unavailable`, and `startReceipt: null`. Installed `execution-increment-observation.mjs` starts a detached mailbox; `ci-host-bridge.mjs` assumes caller-retained Codex binding; `ci-mailbox.mjs stream` creates a new mailbox rather than attaching the existing one. Ordinary increment guidance forbids a separate observer start.
  - Observed effect: focused CLI, startup and dashboard proof, typecheck, refactoring, formatting and publication passed; CI notifications/completion coverage remained unavailable. No observer was started.
  - Inference: the documented attachment gap recurred despite available host primitives. No runtime or guidance change is authorized by this occurrence.

- Execution: `SEED-072#recheck-verification-fidelity` / plan 212, first related implementation commit `d04999c9a5ceffa00baea867fef7d5f84f46db86`; source/proof recovery: `f4693027055bd262d08f7bbdf60ffee9700a1296:.planning/slice-plans/212-recheck-verification-fidelity/PLAN.md`
  - Timestamp: unknown (2026-10-02 branch deliveries and automatic review)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `4f36666f`; unchanged during execution)
  - Evidence: managed receipts for `d04999c9`, `af244145` and `c6c5a4a0` accepted branch publications with `observation.state: unobserved`, no mailbox. The coordinator inspected the detached-start/new-stream split and omitted the unsupported bridge assertion. Automatic review then read this finding's successful plan-204/205 startup evidence and armed the documented yielded stream `/tmp/dough-ci-501/watch-V5539N` (cell 80, session 48031, PID 43597) before completion publication.
  - Observed effect: all slices passed local proof and publication, including 769 dashboard tests; initial automatic notification coverage was absent. Managed resume registered the prior implementation without another push; the same observer delivered its concurrent-Claude-fixture failure. Repair `6d063776` corrected the proven lost listing update and reused that observer. Final CI/shutdown evidence belongs to the retained plan.
  - Inference: the ambiguity and delayed consultation of existing successful evidence caused another initial coverage gap. This limits the earlier claim that available Codex primitives cannot provide coverage. Keep the existing proposal for one explicit startup/reuse contract; no guidance/runtime change is authorized here.
- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: three accepted managed deliveries (`bcaabd99`, `0a701c84`, `9c0d6bb4`) reported unobserved CI/no mailbox because no yielded binding was armed. Retrospective consulted the earlier successful ODF-202 occurrences, verified `ci.yml` push selection/runtime, and started the documented single yielded stream `watch-x4nPTj` before completion publication. Managed resume accepted `9c0d6bb4` without another push and recovered that owner; repair `4a50e086` reused it.
  - Observed effect: initial notification coverage was absent; recovered observation delivered owned retry-assertion failures and enabled a bounded red/green repair before handoff. Completion CI remains pending at this record write.
  - Inference: the startup/reuse route works with available primitives; the initial interpretation of managed-versus-stream guidance was too restrictive. Document one clear route and consult successful existing evidence before declaring coverage unavailable. No guidance/runtime change is authorized here.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 four slice publications and automatic review)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: managed receipts for `4e076e11`, `0a018138`, `ea031d5b` and `e5fe8a7c` accepted story-branch publication with CI unobserved and no mailbox. Review consulted ODF-202's successful startup/reuse occurrences, verified `ci.yml` push selection/runtime, then execution recovery armed the documented yielded stream `watch-HB2kLV` (cell105/session35081/PID79031). Managed resume recovered that owner, registered `e5fe8a7c` without another push and delivered its existing startup-test teardown failure. Repair `0e88f016` reused the observer.
  - Observed effect: initial notification coverage was absent. Recovered observation enabled a deterministic red/green repair before completion; no runtime or guidance edit was required.
  - Inference: prior successful evidence limits the coordinator's initial conclusion that the attachment seam prevents coverage. The ordinary-increment prohibition and startup/reuse wording remain ambiguous; keep the existing proposal for one explicit supported route. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
- Execution: `SEED-041#deliberate-implementation-dependencies` / plan 216, first related implementation commit `8bb73be064a7778470389bd5a458fb70f5a96962`
  - Timestamp: unknown (slice 3 delivery)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed execution guidance)
  - Evidence: original yielded stream `/tmp/dough-ci-501/watch-7PZYuD` recorded `CI_MONITOR_UNAVAILABLE` for a GitHub TLS handshake timeout and terminal `finished`. Managed delivery of `186ef150` started detached mailbox `/tmp/dough-ci-501/watch-cWrqJu`, reported `attached`, and reused it for `ce8b9df`. Installed Codex binding assumes a caller-retained stream; documented `stream` creates a mailbox rather than attaching this directory.
  - Observed effect: the replacement worker observes registered revisions, but live Codex notifications were reported unavailable; coordinator retained that mailbox for final completion rather than creating another observer.
  - Inference: recurrence of the attachment-seam gap after a valid initial stream ends. The replacement later ended after an API connection failure. Completion returned observation_unavailable and retained an unread owned failure; its diagnosis and repair continued. No CI success or guidance/runtime repair is claimed here.

- Execution: `SEED-083#persistent-dashboard-project-configuration` / plan 215, first related implementation commit `62c03b0083f1e6a65f42a2151c800eaa8923bc9f`
  - Timestamp: unknown (2026-10-02 execution)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at published start `db6b0da`; unchanged throughout this execution)
  - Evidence: `9c5b4fd8bb26e7f9bda1739199260d8c47928204:.planning/slice-plans/215-persistent-dashboard-project-configuration/PLAN.md`, CI observation recovery. CkhcLI finished after provider failure; later Xvrcwc was lost with PID absent. Managed deliveries started detached BIxa8G and qaIDit. The documented Codex stream command creates a mailbox rather than attaching to either directory. Coordinator accounted for their unread evidence, stopped those exact observers, and armed EQYhvD; installed resume then registered ecab73d with zero pushes and later deliveries reused EQYhvD.
  - Observed effect: Recovery required separate observer accounting, stopping, rearming, and managed resume before publication and native notification shared a live observer again.
  - Inference: The missing attachment seam complicated recovery; the cause of Xvrcwc worker loss is unknown. Normal reuse of an already-live yielded observer succeeded.

- Execution: `SEED-008#installed-story-branch-integration` / plan 220, first related implementation commit `d213f1efec373b098bddd4e83030db2c08693571`
  - Timestamp: unknown (2026-10-02–03 initial deliveries and observation recovery)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at established claim `418e5e52`; managed copies unchanged)
  - Evidence: managed deliveries through `4ef5e2e` reported CI unobserved with no yielded binding. During slice 5, the coordinator consulted this finding's successful startup/reuse occurrences, verified `ci.yml`/CI selection and checkout-bound runtime, and armed the documented yielded stream `watch-YbJYkk` (cell116/session1277/PID34317). Managed resume registered `4ef5e2e` without another push, delivered run37021271369/attempt1 failure, and repairs/final slice `41fee026`/`817594d8` reused that exact observer. Sequence1 was durably acknowledged after repair; completion coverage remains pending at this record write.
  - Observed effect: initial notification coverage was absent; supported recovery enabled the owned CI repair before final handoff without a second observer or runtime/guidance edit.
  - Inference: the coordinator's initial interpretation was too restrictive. Existing successful evidence establishes a startup/reuse route with available primitives; keep the existing proposal for one explicit supported contract and consult that evidence before declaring coverage unavailable.

## ODF-074 — A plan left a decisive browser-delivery premise open for the developer though it was locally observable

Former local code: DD-206.

The plan's decisive premise "real browsers deliver ⌘Esc to the page" was marked open and assigned to a first probe slice in which the developer would press keys, because Playwright's CDP input bypasses OS and browser reservations. Execution settled it in minutes without the developer: real keystrokes sent through macOS System Events (`osascript … key code 53 using {command down}`) to a scratch page logging capture-phase keydowns. Both Chrome and Safari withheld ⌘Esc. The story's chosen shortcut was already refined and planned around it, so execution had to stop for a shortcut decision.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. Responses 2c5ff71 (0.3.43) and fcc29fad (0.3.48) are released; the same class of unobserved premise is reported again on 0.3.51–0.3.56, so neither is shown to resolve it. Response / limit: Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started.

### Occurrences

- Execution: `SEED-071#session-panel-header-controls` / plan 197, first related implementation commit `4699ad18`
  - Timestamp: 2026-10-01T16:44:22+08:00 (probe recorded in `a98f7e5f`; plan written in `74639b9d` at 2026-10-01T16:36:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `9ebc123e`; base 0.3.51
  - Evidence: plan 197 Decisive premises row "Real browsers deliver ⌘Esc … **Open: slice 1 probe**"; slice 1 result in `a98f7e5f`; developer chose ⌘⇧Esc via a coordinator question with probed alternatives.
  - Observed effect: one mid-execution developer decision and a story/plan shortcut rewrite after refinement and planning had both fixed ⌘Esc.
  - Inference: Qualified. Running the same probe during refinement or planning would have let the developer choose the shortcut with the rest of the story; whether planning agents may drive OS keystrokes depends on host permission.

## ODF-150 — Shared readiness caller analysis missed queued escalation continuation

Former local code: DD-212.

Changing the shared readiness reader aligned its normal startup consumers but left a queued one-shot escalation test asserting refusal on historical digest mismatch. The implementation report excluded one-shot starts as lacking the assessment fact; that exclusion did not account for the normal continuation invoked after escalation. The focused proof selected startup publication cases, not this reached continuation caller, and the coordinator accepted the exclusion.

Follow-up: delivered, unreleased: SEED-095#prove-slices-through-consumers (recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md`). Response `cca9bff4` is on main; no release tag contains the complete response as of 2026-10-06.

### Occurrences

- Execution: `SEED-080#readiness-change-indicator` / plan 209, first related implementation commit `dc1f5e0dd0ebeef5ceff0ee80de35a411f72036c`
  - Timestamp: 2026-10-02T00:49:32Z (CI failure log)
  - Tool: Codex
  - Open Dough release: 0.3.52
  - Evidence: original implementation return stated admission/one-shot starts lack the assessment fact. CI run `36947799549`, attempt 1, `test (3/3)` at integrated `e0f41806` failed `one-shot-escalation-queued.test.mjs:107`: expected `source-refused`, actual `existing` with `changedSinceReview: true`. The focused runner reproduced that exact failure; updated assertions passed with the queued and startup-refusal suites.
  - Observed effect: trunk CI caught an affected consuming assertion omitted from accepted focused proof. Repair changed only the test; Ready continuation, ownership, genuine Not ready refusal and authorization safeguards stayed intact.
  - Inference: a mode-level exemption hid a reached shared consumer. The green initial startup suites were valid evidence for their boundaries, not for this additional continuation path.

## ODF-110 — A plan's consumer premise for an admission rule swept function callers, missing specs that relaunch the same story

Former local code: DD-213.

Plan 206 recorded that callers of the rules slice 2 changed were "only dashboard code and specs … Specs reach them only through the HTTP boundary and pages", from a grep of function names. The new rule refused a fresh start after an uncertain outcome, and 13 tests in 7 specs relaunched the same story over raw HTTP to resume it; the plan treated two of those specs as wording-only consumers for slice 3.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. Responses 2c5ff71 (0.3.43) and fcc29fad (0.3.48) are released; the same class of unobserved premise is reported again on 0.3.51–0.3.56, so neither is shown to resolve it. Response / limit: Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started.

### Occurrences

- Execution: `SEED-072#durable-startup-reconciliation` / plan 206, first related implementation commit `3d82d365`
  - Timestamp: 2026-10-02T08:43:15+08:00 (commit time of slice 2, `a6fa2461`; the failures were found before it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at claim `76a298b1`)
  - Evidence: plan 206 premise row "Callers of the rules slice 2 changes are only dashboard code and specs"; slice 2's implementer ran the full dashboard suite, saw 13 failures in `agent-launch-boundary`, `-codex-reconciliation`, `-codex-recovery`, `-preparation-codex-recovery`, `-preparation-resume`, `-start-codex-recovery`, `-start-resume`, and converted them to resume through continuation, reporting the premise gap for the coordinator's judgment (plan 206 slice 2 Learning).
  - Observed effect: no CI failure or rework; the slice's implementer made and reported a consumer-alignment decision the plan had not anticipated, and the coordinator accepted it against the plan's own decision.
  - Inference: Qualified. A premise about who an admission rule reaches is a behavior premise: the consumers are tests that exercise the refused sequence, found by searching for repeated launches of one story, not by function names. Running the whole dashboard suite inside the slice (about 4.5 minutes) caught it before publication, consistent with ODF-150's inference.
- Execution: `SEED-052#mark-report-read-keeps-session-state` / plan 239, first related implementation commit `46340f4a`
  - Timestamp: unknown (slice 2 implementation, before `21db0097` committed 2026-10-03T22:26:34+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 239 premise "Existing specs that rely on a report's Mark as done being local-only" came from `grep -n "Mark as done" dashboard/tests/agent-completion-*.spec.ts`; slice 2's consumer run then failed `agent-completion-binding.spec.ts` (4 variants calling the boundary `markDone` and expecting no Claude stop) and `agent-completion-recovery.spec.ts` (counting native controls), neither of which the grep named; the implementer aligned both (plan 239 slice 2 accepted proof).
  - Observed effect: no CI failure or rework; one extra consumer run inside the slice.
  - Inference: Qualified. Same class as the plan 206 row: a premise about which tests rely on a behavior was swept by UI wording, while two specs exercised it through the HTTP boundary and native-call counts.
- Execution: `SEED-088#review-files-as-folder-tree` / plan 243, first related implementation commit `5b9b1b6f`
  - Timestamp: unknown (slice 1 implementation, before `5b9b1b6f` committed 2026-10-04T09:06:31+08:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 243 (`b0e8cf03:.planning/slice-plans/243-review-files-as-folder-tree/PLAN.md`) premise rows grepped for specs that reach file rows by list name, button name, or visible kind text. Slice 1's proof then failed `story-review-nothing.spec.ts`, whose `toHaveCount(7)` on list items counted the new folder item. Slice 3 failed `story-review.spec.ts:76`, which counted the list's buttons. Neither count was named, and both implementers aligned them (plan 243 slices 1 and 3 learnings).
  - Observed effect: no CI failure or rework; one in-slice failure and fix each in slices 1 and 3.
  - Inference: Qualified. Third occurrence of the class: the sweep looked for the words the change kept. It missed specs that depend on the list's structure, such as element counts, which the tree changed.
- Execution: `SEED-100#dashboard-specs-deterministic` / plan 254, first related implementation commit `9d916e86`
  - Timestamp: unknown (slice 1 implementation, before `9d916e86` committed 2026-10-06T07:21:30+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 254 premise "no `expectSettledPage` caller holds the sessions read", from a grep of the 17 files naming the helper; extending the helper then failed `session-sidebar-reading.spec.ts:43`, which reaches it through `openStoryStagesJourney().settled` (`storyStagesPage.ts:37`) while holding the read. The slice took its planned fallback (slice 1 learning and corrected premise row in `c2b6ffba:.planning/slice-plans/254-dashboard-specs-deterministic/PLAN.md`).
  - Observed effect: no CI failure; one helper edit, a failing consumer run, and a revert inside the slice.
  - Inference: Qualified. Fourth occurrence: the sweep named the helper, while the consumer reached it through a wrapper. The plan's written fallback kept the cost to minutes.
- Execution: `SEED-008#story-branch-delivery-target` / plan 256, first related implementation commit `9a9e0a6e`
  - Timestamp: unknown (slice 2 acceptance, before `a1bcad0d` committed 2026-10-06T12:06:05+09:00)
  - Tool: Claude Code (coordinator and delegated implementation agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 256 premise "Managed delivery's production callers are the coordinator CLI and Trunk Mode closure only" came from a grep of `src` and `dashboard` for the function and script names. Slice 1 also had to align the credential-free substitute hosts `tests/support/native-agent-one-shot*.sh` and `deliverQueued`, which run the CLI. Slice 2's guidance told every caller to copy `--mode` from the established start, but caller-selected current-branch and host-owned execution have none. The implementer reported that gap, and the coordinator added `--mode trunk` for those callers (slice 2 decision in `b413d0fe:.planning/slice-plans/256-story-branch-delivery-target/PLAN.md`).
  - Observed effect: no CI failure or rework; extra caller alignment in slice 1 and one added guidance sentence in slice 2.
  - Inference: Qualified. Fifth occurrence: the sweep found code callers by name. It missed that the new required argument is supplied by every guidance path that runs the command, including paths without the established start the plan assumed.
- Execution: `SEED-113#rate-limit-recovery-residue-correction` / plan 272 (`669a3d3b:.planning/slice-plans/272-rate-limit-recovery-residue-correction/PLAN.md`), first related implementation commit `8c6f1c09`
  - Timestamp: unknown (slice 4 delegation, before `40194cfc` committed 2026-10-07T16:54:22+09:00)
  - Tool: Claude Code (coordinator and delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence:
    - Plan 272's premise row said no other caller of `readsBesideChecks` expects a bare `commit`. It was checked with `grep -rn '"commit"'` over the callers that slice 4's proof listed.
    - The slice 4 agent searched every caller and stopped before editing. `reopened-project-reads.spec.ts:158` and `unchanged-records-refresh.spec.ts:159` both assert a bare `"commit"`. `unchanged-records-refresh` was not in the planned list.
    - The coordinator updated both callers within the same outcome (plan 272, slice 4 learning).
  - Observed effect: one extra agent round, with no CI failure or rework.
  - Inference: Qualified. Sixth occurrence. A premise about which tests depend on an output name was swept over a hand-listed caller set rather than over every importer of the function.

## ODF-203 — A wrap-up applied a documentation correction and also queued it as a follow-up story

Former local code: DD-214.

The source story's wrap-up rewrote the paragraph its retrospective had found wrong, and in the same commit queued a correction story and plan whose premise quoted the old wording. The follow-up executed against an already-corrected paragraph and delivered one clause.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56`
  - Timestamp: 2026-10-02T14:05:23+08:00 (commit time of wrap-up `317d0f1c`, which created the overlap)
  - Tool: Cursor
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: `317d0f1c` "Record Cursor launch behavior and queue its host-guide follow-up." replaced `It supplies no attach or stop` in `dashboard/AGENT-LAUNCH-HOSTS.md` with the embedded-terminal, `Add a follow-up` and stop-absent sentences, and added this story to `.planning/PRODUCT-BACKLOG.md`; plan 214's Observed premises (at `4541eda4`, before the wrap-up) still said lines 12–15 claim no attach. The established start reported "Changed since readiness review".
  - Observed effect: a claim, worktree setup, refactor pass, delivery and this review for a change of "Attach is supplied:" plus a rewrap.
  - Inference: Qualified. One sample. Wrap-up assimilating lasting knowledge overlapped with the correction it was queuing; a check at wrap-up that the queued correction's premise still holds after its own edits would have closed or shrunk the story.

## ODF-204 — An interrupted refactor agent went on to commit and push its slice

Former local code: DD-215.

After the developer interrupted the coordinator's call to a delegated refactor agent, the agent kept working. It committed and pushed the slice to the remote execution branch, and it marked the slice done in the plan. Its delegation said not to commit, push, or edit the plan. Meanwhile the coordinator had started a second refactor agent and its own formatter in the same checkout.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: 2026-10-02T17:05:38+08:00 (reflog time of commit `a406dd10`)
  - Tool: Cursor (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: the slice 3 refactor `Task` call was "interrupted by the user after 99795ms". After "continue", the checkout held an uncommitted `PLAN.md` edit setting slice 3 to `Status: done`. That edit also claimed the spec passed "including after the refactor", with no run in the record. The coordinator reverted the edit and started a fresh refactor agent. While the coordinator ran `npm run format`, `a406dd10` appeared, authored by `mrsn-chan`, with the slice 3 code, docs and an intermediate spec, and `git ls-remote` showed it on `origin/cursor/choose-a-cursor-model-when-starting-work`. `ps` then showed no other writer.
  - Observed effect: a publication outside coordinator delivery, with no CI registration, plan record or format gate first. It needed a developer decision (accept `a406dd10` and deliver `69634abd` on top). Two writers were briefly active in one checkout.
  - Inference: Qualified. The record shows the interrupted agent kept running. Whether the interrupt failed to stop it or it read the later "continue" as its own instruction is unknown. The delegation's no-commit rule did not hold once the coordinator lost the agent's return.

## ODF-205 — Execution started on a red trunk and spent CI triage on a failure it did not own

Former local code: DD-217.

The claim was taken on a trunk whose CI had already failed `agent-session-cursor.spec.ts:117`. Nothing at startup reported it, so each story-branch publication brought it back as a new failure to classify. Clearing the branch then needed a developer-authorized repair of another change's stale assertion.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: 2026-10-02T16:43:29+08:00 (first failing log line for `7053bc62`, CI run 36985568841)
  - Tool: Cursor
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: main CI failed the same test on `00800bc2` (run 36972144306) and `cec1f243` (run 36974074034), both before the claim `aa6b795f`; `d04999c9` had added `launchedSessions` to every host's operations. Story-branch runs 36985568841, 36986717632, 36987804713 and 36988089177 each reported it. Classification took four `gh run view --log-failed` reads, a remote-branch and worktree ownership scan, and a scan of 25 failed runs for the intermittent `startup-host-words.spec.ts:24`. The developer then authorized repair `80ced7ef`.
  - Observed effect: repeated triage of the same non-owned failure across three slices, and two developer decisions before completion.
  - Inference: Qualified. One sample. A startup check of the target trunk's latest CI verdict, carried as a known baseline failure, would have let later notifications be matched to it rather than re-diagnosed.
- Execution: `SEED-100#launched-session-development-environment` / plan 255, first related implementation commit `7d652000`
  - Timestamp: 2026-10-08T00:34:25Z (first failing log line for `7d652000`, CI run 37708289068)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: main CI failed the same four tests (`limit-recovery-credit-{history,commit}`, `authenticated-read-resumption:193`, `transient-recovery-lifecycle:155`) on `b5b7de82` (run 37705922884), an ancestor of the claim's base `4be4617f`; main repaired them in `65b4fe05`/`ddc2072c`. Merge `1fa65ab1` brought the repair in.
  - Observed effect: one failed-log read, one run listing and one comparison against main's failed run, then a merge; no developer decision.
  - Inference: Qualified. Second sample, lower cost because main had already repaired it; the same startup baseline check would have shown the inherited red before the first publication.

## ODF-152 — An unconditional file-size check stopped a refactor with no conceptual candidate

Former local code: DD-219.

The independent refactor pass found no warranted conceptual change, but stopped because three changed files exceeded the generic 250-line limit. Satisfying that rule would have split unrelated seed stories or existing test journeys beyond the selected deletion-feedback slice.

Follow-up: Open, unqueued. Proposal: make file-size guidance and the conceptual scope gate's precedence explicit, so a pass can report existing oversized files without requiring unrelated decomposition.

### Occurrences

- Execution: `SEED-052#announce-record-deletion-first-time` / plan 219, first related implementation commit `c70c09f8e029d495ee100a50153012661fe06e87`
  - Timestamp: unknown (session date 2026-10-02; precise hand-back times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at claim `d41fc577`)
  - Evidence: delegated `refactor_deletion` initial Jidoka hand-back and follow-up `## REFACTOR COMPLETE`; `c70c09f8:.planning/slice-plans/219-deletion-failure-feedback/PLAN.md`, Execution context, records seed 431 lines, card-delete spec 283, Recent-delete spec 294, and the coordinator's scoped exception with the numeric guideline explicitly unsatisfied.
  - Observed effect: an extra coordinator decision and agent follow-up; no refactor edits or repeated tests. No human waiver of the numeric limit was claimed.
  - Inference: Qualified. This is a scope/precedence conflict, distinct from ODF-141's cost of mandatory no-edit refactor passes. The broader value of smaller files was not assessed here.

## ODF-209 — An asynchronous CI repair's repeated reproductions ran beside the slice's full suite on one machine

Former local code: DD-221.

While slice 5's full suite and refactor tests ran in the execution checkout, a CI repair reproduced its failure with many repeated, many-worker runs in a separate checkout on the same machine. The combined load produced failures caused by load alone in both, and longer proof.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6`
  - Timestamp: 2026-10-03T17:23:00+08:00 (repair agent start, approximately; it ran until about 17:45 +08:00)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`)
  - Evidence: the CI repair for run 37111699644 ran `--repeat-each 24/30` with 6–12 workers in a temporary worktree while slice 5's full suite (about 17:18–17:21 +08:00) and its refactor pass's tests (until about 17:38 +08:00) ran; load averages reached 83–89. The repair reported six load-only failures; the refactor pass saw `codexEffortDialogCases.ts:114/:166` fail once and reran `agent-launch-codex-model` four times (10.6 minutes against about 2 for the other slices' passes); slice 5's delivery took about 6 minutes against about 1.3.
  - Observed effect: extra reruns and diagnosis of load-only failures; no wrong verdict was accepted.
  - Inference: Qualified. The published guidance runs CI repair concurrently with slice work and says nothing about shared machine load; one sample.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: unknown (2026-10-07, while the refactor pass that preceded `823c1eda`, committed 2026-10-07T09:30:10+09:00, overlapped the CI repair delivered as `9935c040`)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION` after the merge at `fefab16d`)
  - Evidence: the coordinator ran a CI repair (run 37545377335) and a refactor pass concurrently in the same execution checkout. The repair's `--repeat-each=10 --workers=8` Playwright run cleared the shared `dashboard/test-results`, so the refactor pass's `production-watcher-updates` stress failed 8 of 8 with trace `ENOENT`, and its first `shared-observer-reads`/`story-readiness` stress failed 8 of 48 with 30-second timeouts at load about 101. Both passed on rerun, the first with a private `--output`. Later delegations required a private `--output` for every Playwright run.
  - Observed effect: two invalid stress runs and their diagnosis; no wrong verdict was accepted.
  - Inference: Qualified. Same concurrency as the earlier row, plus a shared-output-directory collision that only arises when both run in one checkout.

## ODF-110 — A removal premise swept client names but missed server and fixture consumers

Former local code: DD-228.

A consumer premise for removing an attention-message path checked the client by name, missing the server response and a fixture that depended on that behavior.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. Response / limit: Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-08): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started.

### Occurrences

- Execution: `SEED-103#attention-message-on-story-card` / plan 248 (`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), first related implementation commit `0b3d3c78`
  - Timestamp: unknown (slice 3 implementation, before `58ea4c37` committed 2026-10-05T11:31:23+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 248 premise "With an attention message, Read final report shows the message" was observed by reading `SessionResultPanel.tsx` and `sessionAccess.ts`; slice 3 found a third message branch in `server/sessionResultResponse.ts` and an admission exception in `server/sessionAdmission.ts`, and `story-panel-replacement.spec.ts`, which slice 3's proof (d) listed to "stay green", used a Claude attention message as its final report (plan 248 slice 3 learnings).
  - Observed effect: no CI failure or rework; slice 3's implementer removed the server branch and rebuilt the Story B fixture as a Codex record.
  - Inference: Qualified. Fourth occurrence of the class: the removed concept's consumers were swept on the client by name, missing the server answer and a fixture that relied on the removed behavior.

## ODF-210 — Removing a panel path lost the only Mark as done of cardless unavailable reported sessions, unseen until retrospective

Former local code: DD-234.

Plan 248 slice 3 removed the side panel's attention-message branch. That branch was also how a reported session listed only in Recent sessions, with its conversation unavailable, reached Mark as done; Recent entries offer none, so such a session now ends only by Delete record.

### Occurrences

- Execution: `SEED-103#attention-message-on-story-card` / plan 248 (`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), first related implementation commit `0b3d3c78`
  - Timestamp: unknown (slice 3, before `58ea4c37` committed 2026-10-05T11:31:23+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: `e8a1ef8a:dashboard/src/sessionAccess.ts` returned `"result"` for a record with a message when `!attachOpens(record.sessionState)` or no embedded terminal; `58ea4c37` drops it, and `SessionEntry.tsx` renders `MarkDone` only `onCard`. Plan 248 premise "A session that the side panel cannot open is left alone" covered opening only. The destructive later-outcome check compares later slices, and slice 3 was last. Implementation, refactor, and proof acceptance did not name it; the retrospective's outcome review did.
  - Observed effect: a delivered capability loss awaiting the developer's decision on where Mark as done is offered.
  - Inference: Qualified. A removal premise listed what the removed path showed, not what it let the developer do; a removal's existing capabilities had no check before delivery. One sample.

## ODF-211 — A retrospective correction of an unlanded story could not be admitted where its code lives

Former local code: DD-237.

The admission guidance names a retrospective's accepted follow-up correction
as a mission to admit, but admission requires a separate owned workspace based
on remote trunk. A correction to a story still on its execution branch needs
that branch's code, which trunk does not hold yet.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-088#review-since-correction` / plan 251, first related implementation commit `440ad871`
  - Timestamp: unknown (between the plan 245 completion record `94ab0b57` committed 2026-10-05T15:04:40+09:00 and `440ad871` committed 2026-10-05T17:07:41+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: after the developer said "do it before wrap up", `execution-start.mjs start --admit` with the story's own workspace and branch answered `{"ok":false,"status":"invalid-request","error":"queued work requires a separate owned workspace"}`. `admit-accepted-work.md` lists "a retrospective's follow-up correction accepted for execution" as a mission, and also exempts "a supporting step of an active story". The coordinator ran the correction under the story's existing claim on its branch.
  - Observed effect: one refused call; the correction was delivered on the story branch with no Taken entry of its own.
  - Inference: Qualified. A correction that must land with its unlanded story fits the "supporting step of an active story" exemption better than admission, but the guidance does not say which applies, so the coordinator had to try admission first to find out.

## DD-238 — A plan gave a shared operation a story-specific effect without checking callers that use it with another meaning

### Occurrences

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: unknown (slice 1 implementation return, 2026-10-06)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: plan 253's PFE chose "Change `complete`" to write a done record. `dough-story-wrap-up/references/follow-up-disposition.md` and backlog maintenance also use `complete` to drop work ("Dropping does not claim that the follow-up was implemented"). The slice 1 return raised it as gap 1; the coordinator added `complete --dropped` in the same slice (`0f334e41`).
  - Observed effect: caught before delivery at the cost of one resumed implementation round; without it, dropped work would have shown as Recently done.
  - Inference: Qualified. The planning premise checked what `complete` holds, not every caller's meaning of it.

## DD-239 — A refactor return called a styling change a merge of identical rules, and acceptance did not read the hunk

### Occurrences

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: 2026-10-06T10:37:37+09:00 (commit `53333034`)
  - Tool: Claude Code (delegated refactor agent; coordinator accepted)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: slice 4's refactor return said "the two identical `.session-entry { background: var(--panel) }` rules are merged into one selector pair". `git show 53333034 -- dashboard/src/agent-launch.css` deleted `.card-sessions .session-entry { background }` and put that selector in front of `.launch-local { color: var(--quiet) }`. No spec observes the style; the retrospective's outcome review found it.
  - Observed effect: work-card sessions lost their panel background and turned quiet; done-card sessions never got the background. A correction was planned after delivery.
  - Inference: Qualified. The return reported the CSS as unchanged in proof terms, and the coordinator reused accepted proof without inspecting the newly affected style hunk. One sample.

## DD-240 — An implementation return called a story-contradicting gap "pre-existing" because an earlier slice of the same story introduced it

Slice 3's return listed "Pre-existing, not changed: an edge control that disappears after a keyboard move leaves focus on the page body". Slice 2 of the same story had introduced the edge controls, and the story requires them to be ordinary buttons for the keyboard. The coordinator read the gap against the story at proof acceptance and returned it to the same agent, which fixed it with a focused test that fails without the fix.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-106#paged-dashboard-columns` / plan 225, first related implementation commit `a5e9e772`
  - Timestamp: unknown (slice 3's return, before `9be57f28` committed 2026-10-06T10:59:50+09:00)
  - Tool: Claude Code (delegated implementation agent; the coordinator caught it)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: slice 3 return "Gaps" list; the addendum added "from the keyboard, a control gone after its move hands the keyboard to the other side's control" in `dashboard/tests/dashboard-columns-paging.spec.ts`.
  - Observed effect: one extra resume of the implementation agent and a focused rerun; a keyboard focus loss did not ship.
  - Inference: Qualified. "Pre-existing" was judged against the slice's starting revision, not the story's, so a gap the story owns read as outside it. The wrap-up rule to read every named gap against the story's goal caught it. One sample.

## DD-241 — A refactor file-size check was invalidated by the required downstream formatter

The independent refactor returned changed files within the 250-line limit, but the coordinator's required formatter expanded one spec to 254 lines. The same refactor agent then shortened prose before a necessary formatter repeat.

Follow-up: Open, unqueued. Proposal: assess the file-size limit on formatted output, so the required delivery step cannot invalidate an accepted refactor solely through layout.

### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, recoverable at `398fd61a1e94afea5720bc633be6412a1597164f:.planning/slice-plans/262-dashboard-session-column-membership/CONTEXT.md`; first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (slice 2 formatter and refactor follow-up, before `398fd61a` on 2026-10-06)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: slice 2's independent `refactor_two` hand-back checked every changed file at no more than 250 lines. The coordinator's first `npm run format` expanded `agent-launch-ad-hoc-sessions.spec.ts` to 254 lines; the resumed refactor shortened its header, preserved executable proof and returned it at 246 lines. The necessary formatter repeat exited 0 and the post-format cap check passed. Accepted execution proof records this sequence at the recovery reference above.
  - Observed effect: one extra refactor hand-back and a second project-wide formatter invocation; no behavioral changes or repeated tests for the prose-only repair.
  - Inference: Qualified. This is a sequencing mismatch between the cap check and formatting, distinct from ODF-152's conflict between conceptual scope and an already oversized file. The first formatter also reported a remaining style issue in a different spec; its cause was not established and is not attributed to this mismatch.

## DD-242 — The Codex observer binding has no durable failure acknowledgment step

The prescribed yielded-stream binding forwards events with `notify` but never updates the mailbox's delivery progress. Completion separately treats unacknowledged failure events as actionable, even after a coordinator has classified and repaired them.

Follow-up: Open, unqueued. Proposal: give the Codex binding an explicit supported acknowledgment boundary consistent with completion's unread-failure gate.

### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (after completion's failed receipt for `70b6f62a`, before its CI repair)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-XLyt1z` had seven CI_FAILURE events for attempts `37427204231/1`, `37431359551/1`, `37432066761/1` and no `delivery.json`. The installed `ci-notify-codex.md` binding calls `notify` without `recordDeliveryProgress`; `ci-mailbox-complete.mjs` gates shutdown on `unreadActionableFailures`. After bounded log classification of all attempts, the coordinator used the installed exported store API to acknowledge exactly those seven events, preserving later events and the live repair observer.
  - Observed effect: one additional mailbox/source inspection and explicit acknowledgment outside the prescribed Codex binding. The first completion receipt itself correctly retained the observer for the failed revision.
  - Inference: Qualified. Source inspection shows that a later green completion would still retain this mailbox for unread failures without acknowledgment. That later refusal was prevented, not observed; absence of progress does not by itself establish that a notification was delivered to the model.

## DD-243 — The quiet passing reporter hides how many tests a focused run selected

`npm run test:dashboard` prints nothing on a pass, so a delegated agent cannot see which or how many tests its filtered command selected, which proof acceptance asks it to report. Agents reran passing commands with `--reporter=line`, `--reporter=list`, or `--reporter=dot` to obtain the count.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-113#share-repeated-observer-reads` / plan 261, first related implementation commit `a1c593a9`
  - Timestamp: unknown (slice 3 and slice 4 refactor returns, 2026-10-06, before `74f6904b` and `572faa6f`)
  - Tool: Claude Code (delegated refactor agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: slice 3's refactor return: "The first run of this command without `--reporter=line` cut off its output before the result, so I ran it again"; slice 4's refactor return: "The default reporter printed nothing on a pass, so I added `--reporter=list` to see the counts"; slice 4's implementation reported its whole-suite count from a `--reporter=dot` run.
  - Observed effect: at least two repeated focused runs (seconds to tens of seconds each); counts were reported for acceptance.
  - Inference: Qualified. The silence is the project's chosen contract for passing journeys; the cost is small but recurs per agent. Stating in the delegation which reporter yields a selection count would avoid the rerun.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db`
  - Timestamp: unknown (2026-10-07, before commit `11ddc3db`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: coordinator conversation: the plan's focused command `npm run test:dashboard -- <12 specs> --workers=2`, piped to `tail -8`, showed only the npm header; the coordinator reran it as `npx playwright test ... --reporter=line` to see `53 passed`.
  - Observed effect: one repeated focused run (about 15 seconds).
  - Inference: Qualified. The plan's literal proof command has the same gap as the delegation; naming a counting reporter in the plan's Proof section would avoid it.
- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: unknown (refactor returns of slices 1, 3, 5, and 7, 2026-10-07)
  - Tool: Claude Code (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 at claim `0edabd1c`; 0.3.57 after the merge at `fefab16d`
  - Evidence: slice 1's refactor return: "the default reporter printed no summary", rerun with `--reporter=line`; slices 3, 5, and 7's refactor returns invoked `npx playwright test ... --reporter=line|list` directly "because the default reporter's output did not show".
  - Observed effect: repeated or reshaped focused runs to obtain counts; counts were reported for acceptance.
  - Inference: Qualified; the same recurring cost, unchanged by the release.

## DD-245 — A background coordinator implemented its single slice itself

`delegation.md` allows local implementation "only for a single interactive slice". This background session had one Structure slice of about 30 changed lines, and the coordinator implemented it without a delegated agent.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db`
  - Timestamp: unknown (2026-10-07, before commit `11ddc3db`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: coordinator conversation: edits to `ghRead.ts`, `ghRevision.ts`, `containmentRead.ts` and three comment files by the coordinator's own scripted replacement; focused proof, typecheck and the whole suite were run by the coordinator; the refactor pass was delegated as required.
  - Observed effect: no rework; the independent refactor pass found nothing to change, and proof was accepted from the coordinator's own runs.
  - Inference: Qualified. A deviation from the stated condition. It saved one delegated agent's context, but implementation and proof acceptance were not independent. One sample does not show whether "interactive" should be relaxed for tiny Structure slices.
- Execution: `SEED-115#retain-cancelled-ci-evidence` / plan 265, first related implementation commit `a68d3211`
  - Timestamp: 2026-10-07T09:39:25+09:00 (probe commit `631484ee`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: slice 1 was delegated with an independent refactor pass. For slice 2, the CI probe, the background coordinator wrote the probe spec, the `longest-first` and `ci.yml` edits, the rename commit `2afb6ab1`, and the restore `8958faf1` itself. It ran no refactor pass, because the restore returned the code exactly to `a68d3211`.
  - Observed effect: the probe's ordering mistake (ProjectFindings.md DD-249) was the coordinator's own and was not reviewed independently. It cost one extra probe commit and CI run.
  - Inference: Qualified. The probe slice was mostly commit, push and observation, which only the coordinator can do, so the "single interactive slice" condition fits a probe slice poorly. A delegated agent would not necessarily have known Playwright's file order either.
- Execution: `SEED-113#rate-limit-recovery-residue-correction` / plan 272 (`669a3d3b:.planning/slice-plans/272-rate-limit-recovery-residue-correction/PLAN.md`), first related implementation commit `8c6f1c09`
  - Timestamp: 2026-10-07T16:54:22+09:00 (slice 4 commit `40194cfc`; the edits came shortly before)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence:
    - Slices 1–3 were delegated. In this background four-slice run, the slice 4 agent stopped on a disproved premise.
    - The coordinator then made the test-support edit itself, about 14 changed lines in six test files, with a scripted replacement. It also ran the focused proof itself: 12 specs, 18 tests.
    - The refactor pass was delegated, and it removed one redundant assertion.
  - Observed effect: no rework. Proof acceptance rested on the coordinator's own run, not on an independent return.
  - Inference: Qualified. A third sample of a tiny Structure slice done locally in a background run. It saved re-delegating after a premise stop that the coordinator had already analysed.

## DD-246 — Concurrent Playwright runs in one checkout delete each other's trace output

Two agents ran dashboard Playwright commands in the same execution checkout at
the same time. Both used the default `dashboard/test-results` output folder, and
one run's cleanup removed the other's `.playwright-artifacts-*` trace files, so
passing tests were reported as failed with `ENOENT`. Giving each concurrent run
a private `--output` folder removed the noise.

### Occurrences

- Execution: `SEED-113#reuse-unchanged-records-after-publication` / plan 266, first related implementation commit `945857c9`
  - Timestamp: unknown (slice 3 implementation and the load-flake fix ran together, before `7d8319bc` at 2026-10-07T10:01:13+09:00)
  - Tool: Claude Code (delegated implementation agents)
  - Model: claude-opus-5-5
  - Open Dough release: modified; installed guidance 0.3.56, updated to 0.3.57 by the mid-execution merge `8cc33280`
  - Evidence: slice 3 return: first 42-file run "had 4 failures, all `ENOENT` on `dashboard/test-results/.playwright-artifacts-*` trace files"; flake-fix return: first run "failed both specs, but only with trace ENOENT errors"; both reran with `--output` and passed.
  - Observed effect: one rerun per agent (minutes each); no false acceptance, because both agents read the error kind.
  - Inference: Qualified. The coordinator launched the two agents together without assigning output folders; delegation that runs tests concurrently in one checkout could name a private `--output` per agent.

## DD-247 — Whole-suite runs under routine load reveal default-deadline polls on real process work one run at a time

Whole dashboard suite runs on the developer machine (load average 25–35 from
other work) failed in specs that pass alone. Each cause was a default 5 s
`expect.poll`, or an event-order assumption, over real work whose duration grows
with load: a recursive checkout removal, a page read answered late after a
reload, and a launch of about 85 sequential git subprocesses. Each ~15-minute
whole-suite run exposed a different spec, so the fixes came one run apart.

### Occurrences

- Execution: `SEED-113#reuse-unchanged-records-after-publication` / plan 266, first related implementation commit `945857c9`
  - Timestamp: unknown (whole-suite runs during slices 1 and 2, and after slice 3, before `0b2613f4` at 2026-10-07T10:27:38+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; installed guidance 0.3.56, updated to 0.3.57 by the mid-execution merge `8cc33280`
  - Evidence: slice 1 return (`production-watcher-updates.spec.ts:33`); slice 2 return (that spec again and `agent-launch-attention.spec.ts:80`, 22 expected reads, 21 seen); whole-suite log after slice 3 (four `agent-completion-binding.spec.ts:31` variants and `agent-completion-attention.spec.ts:31`, "Timeout 5000ms"); fixes `7d8319bc` and `0b2613f4`, each reproduced before the fix (delayed answer, slowed git on PATH).
  - Observed effect: three extra diagnosis agents and at least one extra whole-suite run; story delivery was not blocked, because the failing specs did not reach the changed reads.
  - Inference: Qualified. Neighbouring launch journeys already used 30 s bounds; a single audit for default-deadline polls on real-process work would likely find more than one flake per run.
  - Note: the next whole-suite run failed `agent-launch-card-sessions.spec.ts:53` (1 in 6 repeated, 1 in 12 at the pre-story revision `c9e90018`). Its cause was a product defect, not a deadline: a read asked before the page was hidden settled the page's "seen again" state, so the prompt revision check waited 15 s (`pageVisibility.ts`, `publishedObservation.ts`). It was fixed in this execution. The diagnosis also found `expectSettledPage` returning before the agent-profile read lands, which can make call counts taken right after it flaky (`shared-observer-reads.spec.ts:232` failed once in 3 runs; not fixed).

## DD-248 — A refactor return's proof-effects section left reached consumers unrun, once on a wrong "type-only" claim

A refactor return declared accepted proof still valid for consumer specs its edits reached, without rerunning them. Once the claim was wrong.

### Occurrences

- Execution: `SEED-116#claude-done-rename` / plan 267, first related implementation commit `ed9a306e`
  - Timestamp: 2026-10-07T11:07:28+09:00 (slice 3 commit `bcb39b01`, after the return); slice 1's instance before `ed9a306e` (2026-10-07T09:40:18+09:00)
  - Tool: Claude Code (delegated refactor agents; coordinator caught both)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: slice 1's return listed five consumer specs (`agent-completion-binding`, `agent-launch-card-done`, `agent-launch-done-codex-races`, `agent-launch-done-question`, `session-unread-report`) as "not rerun" although they reach the rewritten private-attach path; the coordinator ran them (15 passed). Slice 3's return called making `keepRecord`'s `doneMarks` required "type-only" and did not rerun `agent-completion-binding`. The coordinator reran it only because the commit hook's `require-await` finding forced a fix; four tests failed (`TypeError … reading 'reported'` from out-of-process test callers that pass no owner), and the edit was reverted.
  - Observed effect: two extra coordinator spec runs; one broken change that would otherwise have reached CI.
  - Inference: Qualified. The refactor delegation asks for proof effects but accepts "paths unchanged" judgments. A type change at a call boundary also has callers outside the type checker's view (out-of-process `node -e` imports). Related to DD-239 (a refactor return mischaracterized its change), but here the coordinator's rerun caught it.

## DD-251 — The coordinator committed after the selective formatter reported unresolved lint findings

The selective formatter (`npm run format`) printed "Format failed: unresolved findings or tool failures remain" with a lint error, but the coordinator piped its output through `grep`/`tail`, did not check its exit, and staged and committed; the check-only commit hook then refused the commit. Implementation and refactor agents are told not to run hook-owned lint, so such findings first surface at the coordinator's format step.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-113#recover-consistently-from-rate-limits` / plan 264, first related implementation commit `a2d43dde`
  - Timestamp: 2026-10-07T11:32:58+09:00 (commit time of `7edb4b2b`, after the refused attempt) and before `adc41a56` (2026-10-07T13:14:53+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION` after the merge at `fefab16d`)
  - Evidence: slice 4's format output contained "Format failed: unresolved findings or tool failures remain" and `agent-commit.mjs` then returned `commit-failed` for two `'_' is defined but never used` errors in new specs; slice 7's filtered format output showed "Async arrow function has no 'await' expression" and the commit was refused the same way. Each was fixed, re-proved with the touched spec and the typecheck, and committed.
  - Observed effect: two refused commits and two short fix cycles; no unproved change was published.
  - Inference: Qualified. Wrap-up step 4 already requires formatting success before staging; filtering the formatter's output hid its exit status. Telling delegated agents the hook's lint rules, or checking the formatter's exit before staging, would avoid it.
- Execution: `SEED-106#paged-columns-height-follows-shown` / plan 271, first related implementation commit `c9106b78`
  - Timestamp: unknown (between the refactor return and commit `c9106b78` at 2026-10-07T22:55:17+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: both delegated returns noted only Prettier findings; the coordinator's `npm run format 2>&1 | tail; echo rc=$?` printed `rc=0` beside "Format failed" and three `'_' is defined but never used` errors (`Array.from({ length }, (_, i) => …)` in `columnPaging.ts` and two test files). The coordinator read the text, rewrote them as `[...Array(n).keys()]`, reformatted, and reran seven affected specs plus the typecheck before committing.
  - Observed effect: no refused commit this time; one extra format and proof cycle after the refactor pass.
  - Inference: Qualified. Same rule and pipe masking as the earlier row; reading the text rather than the exit caught it. Recurrence across executions supports telling delegated agents the lint rule or giving them a read-only lint check.
- Execution: `SEED-118#recover-from-temporary-github-failures` / plan 273, first related implementation commit `2854d30b`
  - Timestamp: 2026-10-08T04:15:08+09:00 (commit time of repair `598cd884`, after refused omit-pattern attempts)
  - Tool: Cursor
  - Open Dough release: 0.3.57
  - Evidence: coordinator `npm run format` printed "Format failed: unresolved findings or tool failures remain" for `@typescript-eslint/no-unused-expressions` on a bare `progressSource;` omit in `dashboard/src/progressSource.ts`, and earlier `agent-commit.mjs` returned `commit-failed` for an unused `_stale` binding in the same CI-repair edit; the lint-clean `delete cleared.progressSource` form then committed as `598cd884`.
  - Observed effect: at least two refused or format-failed commit attempts on one CI repair before the published SHA.
  - Inference: Qualified. Same coordinator pattern as the rate-limit execution: format/lint findings surface only at wrap-up, and piping or continuing past a failed format invites a refused commit.

## DD-252 — New page-geometry assertions were accepted on single runs, then failed CI on font metrics and under repetition

### Occurrences

- Execution: `SEED-106#paged-columns-height-follows-shown` / plan 271, first related implementation commit `c9106b78`
  - Timestamp: 2026-10-07T13:57:20Z (CI failure in run 37632417898, `dashboard (5/9)`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: `dashboard-columns-height.spec.ts:216` required the whole last card `toBeInViewport({ ratio: 1 })` in a 480px window; with Linux fonts the card is about 440px (macOS about 360px), ratio 0.989. Repair stress `…:173 --repeat-each=30 --workers=4` at `c9106b78` failed 16 of 30 (clamp read before cards settled). Repair `62b21604` asserts the card's end and waits with `expectSettledPage`.
  - Observed effect: one red CI run, one stash/repair/refactor/publish cycle (repair agent about 130k tokens, 49 minutes under machine load).
  - Inference: Qualified. Both slice acceptance and the refactor pass reran new journeys once; a short `--repeat-each` stress of newly written geometry tests, and asserting a reachable edge rather than a whole element against a small window, would likely have caught both.

## DD-253 — Managed story-branch delivery can stall after a successful agent-commit

`execution-increment-delivery.mjs deliver` remained running for about two hours after `agent-commit.mjs` had already recorded a successful commit SHA, so the story-branch tip stayed unpublished until the hung delivery was killed and deliver was rerun.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-118#recover-from-temporary-github-failures` / plan 273, first related implementation commit `2854d30b`
  - Timestamp: 2026-10-08T04:15:08+09:00 (commit `598cd884`); hung delivery observed still running at about 2026-10-07T21:04Z UTC (~1h50m elapsed)
  - Tool: Cursor
  - Open Dough release: 0.3.57
  - Evidence: local HEAD was `598cd884` with a clean tree while `origin/cursor/recover-automatically-from-temporary-github-fail` remained at `ded67152`; the deliver shell (pid 36319) was still listed running; killing it and re-invoking deliver accepted publication of `598cd884` in ~12s.
  - Observed effect: CI and completion waited on an unpublished repair tip; a second deliver was required.
  - Inference: Qualified. The commit step and the publish/register step are separable; an unobserved stall after commit leaves the branch behind without a failing exit.
- Execution: `SEED-119#recently-done-progressive-loading` / plan 274, first related implementation commit `62238f21` - Timestamp: unknown (slice 3 delivery of `a6dbc253`, committed 2026-10-08T01:54:24+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: the first `deliver` returned `publication: reconciled, status: needs-validation` with `remoteTip` equal to the previously published base `988d0267`. The retry with `--validated-candidate` ran over 10 minutes, and `ps` showed `git fetch origin` / `ssh … git-upload-pack` alive for 15 minutes. After that fetch was killed, a manual fetch took 2 s and the retry was accepted. - Observed effect: about 25 minutes of delivery delay. The coordinator also truncated the first result with `cut -c1-300`, which lost its diagnostic fields. - Inference: Qualified. Same hang, here traced to `git fetch` over SSH with no time bound; a transient network stall; a bounded fetch/push with a named timeout result would have turned the hang into an explicit, retryable stop.

## DD-254 — A plan's code findings went stale on trunk with no signal before delegation

Plan 259 was prepared from code read on 2026-10-06 before 12:36 +09:00. Its finding 2, finding 3 and slice 2 described `RecentlyDone.tsx` counting unread sessions as none and `ColumnSummary` living in `ColumnEdge.tsx`. Commit `398fd61a` (16:42 the same day, another story) had already changed both before the Take. The start's "Changed since readiness review" covers the story and plan documents, not the code their findings describe.

Follow-up: Open, unqueued.

### Occurrences

- Execution: `SEED-106#paged-columns-reveal-and-count-correction` / plan 259, first related implementation commit `74a48aee`
  - Timestamp: 2026-10-08 (+09:00), while slice 1 was delegated
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: `459959ff:dashboard/src/RecentlyDone.tsx` `recentlyDoneColumn` already returned an unknown count until sessions and done records were read; `dashboard/src/columnSummary.ts` came from `398fd61a`. The plan's slice 2 asked for a bare-name control, which would have changed the shipped "Entry count incomplete" wording. Slice 2 was recorded done with no change in `27cde622`.
  - Observed effect: no rework. The coordinator noticed by reading the code while it waited, not through any startup or delegation check; the slice 1 agent independently reported finding 3 as out of date.
  - Inference: Qualified, one sample. Rechecking a plan's code-level findings against the fetched trunk before delegating each slice would have caught it; without that, a slice could re-implement delivered behavior or regress its wording.

## DD-255 — A CI repair fixed one spec's race and left the same race in a sibling spec from the same slice

A repair for a timing race in a new test fixed only the reported spec. A sibling spec written in the same slice had the same pattern: it switched projects while demanded reads were still in flight, then asserted an exact set of asked records. That sibling then failed CI separately.

### Occurrences
- Execution: `SEED-119#recently-done-progressive-loading` / plan 274, first related implementation commit `62238f21` - Timestamp: 2026-10-08T06:30:48+09:00 (repair `d04890e8`); second repair `fbab9e3a` at 2026-10-08T06:43:54+09:00 - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: CI run 37687776071 on `c98b364c` failed `recently-done-progressive-navigation.spec.ts` ("choosing another project…"); the coordinator's brief asked only for that test, and repair `d04890e8` added a wait to it. `recently-done-progressive-navigation-cursor.spec.ts` (also slice 4) then asked records twice in the slice 5 refactor sweep and failed CI runs 37689968037 (`d04890e8`) and 37691024378 (`670b27fa`); `fbab9e3a` applied the same wait. - Observed effect: two more failed CI runs, a second diagnosis agent (about 97k subagent tokens), and a second repair commit. - Inference: Qualified. The first diagnosis named a general cause: a project switch cancels in-flight reads and `recordsAsked` counts cancelled asks. Searching the same slice's specs for project switches after demanded reads would likely have found the sibling in the same repair.
