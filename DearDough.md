# DearDough Process Findings

Retained material shared-process findings, reviewed 2026-09-30. Only an explicit
queued follow-up is planned work; other entries are open and unqueued. A retained
released response is not proof of effectiveness. Unknown provenance stays unknown.
[Response status](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md).
Full pre-trim evidence: `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`. Older narratives live in Git, not a second archive.

- Highest allocated local number: 190. Removed local codes are never reused.

## ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate

Former local code: DD-089.

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

Follow-up: Open, unqueued.

- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/slice-plans/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d` - Timestamp: 2026-09-21T09:08:13Z - Tool: Cursor - Model: Cursor Grok 4.6 - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27` - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install. - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green. - Inference: Qualified. Distinct from DD-074 (guidance now exists) and the earlier assumed tool unavailability report (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.
- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559` - Timestamp: 2026-09-29T09:03:35+08:00 (native Claude Code `trunk-closure/owned-context`) - Tool: Claude Code (coordinator; hosts Claude, Codex, Cursor) - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `b8946e99`; base 0.3.46 - Evidence: six owned-context runs printed PASS; five ran the creation-record read, while Claude's closure removed the worktree after the containment check alone (no `for-each-ref`, no "Close or retain it" read). Accepted only after `3b1f8619` named the check and one rerun read the record. - Observed effect: the assessor, which observes only the retired outcome, passed a native agent that skipped the ownership gate; caught only by transcript inspection.

## ODF-059 — Delegated refactor pass stalled after editing and before reporting

Former local code: DD-057.

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

Follow-up: Open, unqueued.

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2` - Timestamp: unknown (after the CI repair return, before commit `ff33cb8` at 2026-09-24T17:46:32+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: 0.3.37 - Evidence: the CI-repair refactor agent's only notification said it had stopped with its own background work still running and had not reported; `ps` then showed no `node --test`, and `TaskStop` found no task. The coordinator kept waiting until the developer said "it seems to be staying here for quite some time." - Observed effect: repair `ff33cb8` shipped on the coordinator's own reruns without a refactor report (compare the earlier unreviewed ci repairs report); slice 6's refactor, told to run tests only in the foreground with timeouts, reported normally.
- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, before `809b407d` 13:54:50+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46. - Evidence: the refactor pass on the Story Branch native harness repair left two edits uncommitted and stopped (600 s stream watchdog) while "rerunning the accepted proof"; the coordinator reran that proof and delivered `809b407d`. Slice 3's implementation agent stalled the same way before writing anything and resumed through SendMessage. - Observed effect: two stalls in one execution, each costing a 10-minute wait and a coordinator-side recovery; no work lost.

## ODF-067 — Delegated Git-fixture proof for a "stop" behavior defaults to a tautology

Former local code: DD-054.

A Git refusal test elects not to mutate using fixture-known state rather than attempting and observing the real operation reject.

Follow-up: Open, unqueued.

- Execution: `SEED-008#publish-trunk-mode-from-local-main @ b82bae4` - Timestamp: 2026-09-17T14:54:04+08:00 - Tool: Claude Code - Model: claude-sonnet-5 - Open Dough release: 0.3.24 - Evidence: Slice 2's first returned test computed `const mustStop = !localMainIsOwnedSuffix && !localMainMatchesFetchedRemote; assert.equal(mustStop, true, ...)` from SHAs already known from fixture setup, then simply never called `merge --ff-only` or `push`, and asserted nothing changed. The coordinator's proof-acceptance inspection rejected it and asked for `git -C integration merge --ff-only <candidate>` to be actually attempted and asserted to fail via `assert.rejects` matching Git's real "Not possible to fast-forward" message; the agent complied in one correction round-trip. The very next delegation (Slice 3) needed an explicit pre-emptive warning restating this exact lesson to avoid the same shape of tautology for its own rejected-push assertion. - Observed effect: One extra delegation round-trip (coordinator review, `SendMessage` correction, agent rework) before Slice 2's proof was accepted; Slice 3's delegation prompt grew by a dedicated section to forestall a repeat. - Inference: Delegation prompts asking for Git-fixture proof of a stop/ refusal behavior may need to state up front, not just in general proof guidance, that the specific mutating command the rule would otherwise run must be actually attempted and its real rejection observed — general "don't let setup supply the outcome" wording in `refactor-checks.md`/`wrap-up.md` was not sufficient on its own to prevent the first draft.

## ODF-003 — File-type assumptions skipped affected maintained proof

Former local code: DD-003.

Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.

Follow-up: Open, unqueued.

- Execution: `SEED-028#admission-coherence` / plan 113, first related implementation commit `733fe46` - Timestamp: 2026-09-26T18:42:15+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision 1b66466; base 0.3.41 - Evidence: slice 3 (`9e635ae`) changed the `record-state` CLI; the coordinator told the slice agent not to run Playwright because another agent was using it, and the refactor return judged the dashboard unaffected because it imports only the pure story-state reader. CI run `36236595203` `dashboard` failed in fixtures that shell out to `record-state` (`dashboard/tests/storyReadinessCli.ts`); repair `33fd629`. - Observed effect: one failed CI run, a stash-and-repair cycle. - Inference: Qualified match: the consumer check followed imports, not command-line callers, and a concurrency convenience removed the suite that would have caught it.
- Execution: `SEED-008#same-machine-merge-queue` / plan 140, first related implementation commit `9597bf61` - Timestamp: 2026-09-28T13:21:44+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `2b46e651`; VERSION 0.3.45 - Evidence: slice 3 (`600f5f45`) moved workspace selection onto a new `repository` field and re-wrapped guidance; focused proof globbed `workspace-publication-startup-*`. CI run `36381588951` failed `workspace-publication-race.test.mjs` (still passed only `integration`, so Git ran in the runner's repository) and three `workspace-ownership-lifecycle.test.mjs` phrase regexes; repair `615df2ad`. - Observed effect: one failed CI run, a stash-and-repair cycle with one extra agent. - Inference: Qualified. Consumers were chosen by name pattern and skill directory; later slices that also ran the whole `node --test` suite (698) before return sent no further consumer break to CI.

## ODF-069 — A genuinely failed CI run was reported as merely uncovered, not failed

Former local code: DD-065.

Registered revisions are reported uncovered during discovery and their later real verdicts are missed in the observed execution.

Follow-up: Open, unqueued.

- Execution: `SEED-008#publish-shared-backlog-claims @ 06504a5` - Timestamp: 2026-09-20T11:33:00+08:00 - Tool: Claude Code - Model: claude-sonnet-5 - Open Dough release: 0.3.26 - Evidence: `register-push` for `8e6c41d` (pushed 2026-09-20T11:22:27+08:00) was followed by a `CI_COVERAGE_UNAVAILABLE` hook event ("No CI attempt for pushed revision after 3 discovery polls."). `gh run list` at that moment showed run `35486408307` for that exact SHA already `in_progress`; it later completed `failure`. The observer's final `stop` report (after the next push's real `CI_FAILURE` event triggered manual investigation) still listed `8e6c41d` as `state: "uncovered"`, never as failed. - Observed effect: The coordinator only learned `8e6c41d` had failed CI by independently running `gh run list` while diagnosing a later commit's correctly-delivered `CI_FAILURE` event; without that unrelated investigation, the first failing revision's CI result would have gone unnoticed for the rest of the execution. - Inference: Qualified. Discovery latency between a push and GitHub Actions registering its run is the likely cause of the missed first poll window, not a defect in classifying a found run; whether widening the poll count or window would reliably close this specific gap was not tested here.

## ODF-093 — A delegated agent's `git stash pop` applied another session's stash

Former local code: DD-094.

A failed stash push is followed by an unqualified stash pop, applying another session's shared stash.

Follow-up: Response delivered; verification remains open. No new implementation queued.

- Execution: `slice-plans/088-dough-land/PLAN.md @ 647ff01` - Timestamp: unknown; 2026-09-24 between e2a453e (10:40:49+08:00) and 647ff01 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: 0.3.36 - Evidence: slice 1 implementation report; foreign `stash@{0}` still listed. - Observed effect: four conflicted files restored; a clean pop drops the stash.

## ODF-096 — Native acceptance fixtures' sufficient side was not credible, and each case paid a failed run to learn it

Former local code: DD-096.

Nominally sufficient native acceptance fixtures do not actually satisfy their promises, and the same fault class is rediscovered through paid failing runs.

Follow-up: Response delivered; verification remains open. No new implementation queued.

- Execution: `SEED-028#track-ad-hoc-work` / plan 110, first related implementation commit `4286761` - Timestamp: 2026-09-26T06:13:32Z (first native `admission-investigation` run) - Tool: Claude Code (coordinator; the native host was Codex) - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `bd38782`; base `0.3.40` - Evidence: native results `codex/publication/admission-investigation/20260926T061332-6642` assessed fail; the prompt said not to write outside planning records while the probe writes a marker, so Codex rightly skipped the probe. Prompt fixed; rerun `20260926T063848-77f6` passed. - Observed effect: one paid failed native run to learn that the fixture could not credibly show the promised ordering.
- Execution: `SEED-044#native-premise-acceptance-codex-cursor` / plan 141, first related implementation commit `8373b163`; Timestamp: unknown (2026-09-28–29); Tool: Codex; Open Dough release: 0.3.46 on resume, original coordinator release unknown. - Evidence: `642d0938` records safe admission before edits on the inherited migration fixture; `ae667576` and `a18b3bf7` show inexpensive alias/versioned-rewrite solutions disproving necessary growth. `0ef7767a` replaces it with executable active/archive collision proof; `a38f8257` records the single v0.3.46 native after-edit carry pass. Observed effect: one paid inconclusive case, two cheap feasibility probes and an explicit fixture-choice handoff. Inference: the same fixture-credibility problem affected ordering here; test legitimate small solutions before claiming that a case necessarily grows. No reliability or quantified savings claim.

## ODF-097 — Coordinator published a commit after the formatter failed

Former local code: DD-097.

A formatter failure does not stop a semicolon-separated commit and push sequence.

Follow-up: Open, unqueued.

- Execution: `SEED-004#accept-delivery-evidence-native` / plan 089, first related implementation commit `eff3e76293b4564e25089bdeccbb07767e18f491`; Timestamp: 2026-09-24T12:22:01+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.34 - Evidence: slice 2 command printed `fmt=1` then committed `c33dbea`; CI `lint` failed with SC2016; repair `0662ed2` passed. - Observed effect: one extra commit, push, and failed CI run. - Inference: A one-off coordinator error, not a guidance gap; gate commands with `&&`.
- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002`; Timestamp: 2026-09-29T17:40:19+08:00; Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd` - Evidence: CI repair command printed `FORMAT=1`, then `;` ran the agent commit and delivery of `76e6dce3`. The lint errors were in slice 3's unstaged `agent-launch-records.spec.ts`, not the committed file; CI run 36550678777 passed. Observed effect: none this time. Inference: fourth occurrence of the `;` chain; a whole-repository formatter's exit status also cannot tell a staged commit's findings from another uncommitted change's (compare ODF-128).
- Earlier occurrence details: 2 additional recorded rows in `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`; these are historical evidence, not new occurrences.

## ODF-098 — A slice's proof named a suite only a later slice's behavior keeps green

Former local code: DD-098.

A slice is planned with a required existing suite that cannot pass until a later slice implements its new invariant.

Follow-up: Open, unqueued.

- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2` - Timestamp: unknown (first slice-1 return, before commit `567f9b2` at 2026-09-24T15:43:45+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: 0.3.37 - Evidence: plan at `4479710` (slice 1 Proof lists `workspace-publication-startup-race.test.mjs`; slice 3 Seam); first slice-1 return had 2 of 5 race tests failing; plan Learnings in `567f9b2`. - Observed effect: one extra implementation round and a re-sequencing. - Inference: Qualified. Planning checked that each slice ends CI-safe without tracing which existing suites a new invariant (unique active agent names) would break.

## ODF-100 — A piped lint failure did not stop publication

Former local code: DD-097 (plan 104 occurrence only).

A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

Follow-up: Open, unqueued.

- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f` - Timestamp: 2026-09-25T22:28:16+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `87ffccb` - Evidence: `npm run lint 2>&1 | tail -2 && git commit` hid lint's exit 1; `1e648d9` was published, CI run `36147702793` `lint` failed; repair `decb252`. - Observed effect: one extra commit, push, and failed CI lint job.
- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, first related implementation commit `549e2d5a` - Timestamp: 2026-09-29T14:48:19+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: `npm run -s format 2>&1 | tail -1 && python3 … && git commit … && deliver` printed "Format failed: unresolved findings" yet continued; `ee35dd55` was published, CI run `36533023610` `lint` failed (`unbound-method`, `App.tsx:130`); repair `815844e4`. This repository has no commit hook, so formatting was the only local lint gate. - Observed effect: one extra commit, refactor pass, push, and failed CI lint job; the other CI jobs passed. - Inference: Qualified. The same coordinator had checked exit status correctly in earlier slices of this run; batching format, plan edit, commit, and delivery into one piped chain reintroduced the fault.
- Execution: `SEED-052#start-ad-hoc-project-session` / plan 172, first related implementation commit `689970f7` - Timestamp: 2026-09-30T10:09:44+08:00 (slice 2, amended commit `52932716`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: `npm run format 2>&1 | tail -3; python3 … && git add … && agent-commit` printed "Format failed: unresolved findings or tool failures remain." yet committed `3011c1df`; the `tail` hid `no-misused-spread` (`claudeLaunch.ts:64`), which a rerun of format found before delivery, and the commit was amended into `52932716`. - Observed effect: nothing published (caught before delivery); one amend and one extra format, typecheck and spec run. - Inference: Qualified. Recurrence of the hand-built format-then-commit chain (compare ODF-097); the rule is known and the chain still hid the failure, which one scripted format-then-commit step would stop.

## ODF-154 — Cursor managed delivery lacks its coordinator session identity

Former local code: DD-095 (plan 126 Cursor occurrence only).

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

Follow-up: Open, unqueued.

- Execution: `SEED-046#ci-verdict-correction` / plan 126, first related implementation commit `9fa45de` - Timestamp: unknown (first increment delivery, between commit `9fa45de` at 2026-09-27T12:43:54+08:00 and the observer start minutes later) - Tool: Cursor - Model: kimi-k3 - Open Dough release: modified; revision `ff3534c`; base 0.3.42 - Evidence: `9fa45de` delivery receipt `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); a manual probe then showed `CI_MONITOR_READY`; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-7YVAZ1`; the next managed delivery reported `observation.state: reused`. - Observed effect: first Cursor occurrence; slice 1's increment was unobserved until the manual start, and the finding's `$CLAUDE_CODE_SESSION_ID` recovery does not apply to Cursor's conversation/generation identity.
- Execution: `SEED-053#dashboard-browser-navigation` / plan 136, first related implementation commit `8ca2f7eb` - Timestamp: 2026-09-27T22:11:50+08:00 - Tool: Cursor - Open Dough release: 0.3.43 - Evidence: completion input `pendingCi: unobserved` ("host session identity required for Cursor notification bridge"); retained tip `777b797926acfab373a6cd45766e3066cbd9da95` - Observed effect: managed delivery left the story-branch tip unobserved; no Cursor session identity was available to arm the notification bridge - Inference: Same Cursor host-identity gap as the plan 126 occurrence; Claude-only recovery remains inapplicable

## ODF-132 — A delegated implementation agent handed back before finishing its own required proof

Former local code: DD-111.

An implementer returns normally with required measurements unfinished and asks the coordinator to complete its background proof.

Follow-up: Open, unqueued.

- Execution: `SEED-037#fourfold-local-suite` / plan 107, first related implementation commit `273ae9a` - Timestamp: unknown (between `8da97ee` and `342b939`'s delivery on 2026-09-26) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `f87d34c` - Evidence: reports "measurement incomplete" and "I had to hand back before your remaining steps were finished"; the coordinator stopped it and ran the reruns and 3×3 pairs; later briefs saying "finish all required proof yourself" returned complete. - Observed effect: about an hour of coordinator-driven measurement on slice 2.

## ODF-134 — A Story Branch execution rebased onto trunk, and managed delivery rebased it back

Former local code: DD-115.

A plan calls for integration with landed sibling work during Story Branch execution; manual rebase and managed delivery reconcile to different bases.

Follow-up: Open, unqueued.

- Execution: `SEED-049#native-result-path-diagnosis` / plan 124, first related implementation commit `70386eb` - Timestamp: 2026-09-27T11:46:54+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` - Evidence: rebased `1749032` on `80ba4e4`; `deliver` gave candidate `6781c03` on `d50bd27`, `suffixBase` `d50bd27`; accepted `70386eb`. - Observed effect: one full local suite run proved a base the branch never published; plan proof text was rewritten and re-proved before delivery. - Inference: Qualified. Trunk integration belongs to Story Branch wrap-up; a plan's "integrate onto whichever landed" reads as a mid-execution rebase.

## ODF-074 — A ready plan named a validation command the backlog tool does not have

Former local code: DD-121.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

Follow-up: delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5).

- Execution: SEED-044#verify-planning-premises (plan 115; first implementation commit `2c5ff71f`) - Timestamp: 2026-09-27T14:17:23+08:00 - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `6882aeb3` guidance at planning time - Evidence: plan 115 slice 2 text at `6882aeb3`; `product-backlog.mjs` usage lists add, place, take, complete, refresh, direction, adopt, merge, record-state, read-state - Observed effect: small detour and an equivalent-proof judgment at acceptance; no rework - Inference: same class as the unobserved planning premises this story addresses (catalog ODF-074); plan 115 was written before its own rule

## ODF-138 — A reported guidance gap was accepted without checking its consequence, hiding a data-loss path

Former local code: DD-123.

A returned gap for restore-applied-none is accepted as an untested limitation; delivered guidance then drops the only copy of paused work.

Follow-up: response delivered; verification open, no new implementation queued.

Response: the "Accept proof" section of `src/skills/dough-execute-plan/references/wrap-up.md` now reads named gaps and fixture changes against the story's goal and key examples (b7930baf, release pending after 0.3.47). Limits: Claude Code only; returns reconstructed from retained sentences, one run per case; only ODF-185 failed at baseline and returned afterward, while ODF-139, ODF-196 and ODF-138 already returned at baseline, so attribution is weak for them; Codex and Cursor unclaimed; no successful watch is claimed.

- Execution: `SEED-008#truthful-repair-restore` / plan 115 (truthful-repair-restore), first related implementation commit `8f88364` - Timestamp: unknown (between claim `b11bb98` at 13:46 and commit `8f88364` at 14:02 +08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: the slice 1 return listed "Step 5 gives no specific guidance for `none`" and the coordinator recorded it as an untested limit; the retrospective reproduced a staged change conflicting in the index: `restore` reported `applied: "none"`, `paths: []`, and the guided `drop --record` removed the only copy of the paused work - Observed effect: two refactor passes and slice 2 shipped guidance that finishes every conflict with a drop; follow-up SEED-008#unapplied-restore-kept - Inference: the plan named guidance only for `partial`, so the gap looked like missing polish rather than a safety promise

## ODF-110 — A publisher-seam premise was observed by reading the seam, not the race it had to stop

Former local code: DD-124.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

Follow-up: delivered with a weak replay result, not shown to resolve: Observe a planning premise through the operation that consumes it — SEED-059#observe-premise-consumers (story and plan recoverable at d9137ef5).

- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; between re-bind `e8ce93b9` (2026-09-27T15:50:01+08:00) and slice 2 commit `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 premise table at `e8ce93b9` cites `execution-increment-publication.mjs:143-197`; slice 2 first return reported the merge-driver conflict; corrected premise row and North Star wording in `6f350f28` - Observed effect: one extra implementation round in slice 2 (an added pre-reconciliation fetch, then consolidation into `onFetchedTarget`) and a North Star correction - Inference: Qualified. A race premise is cheap to observe with the existing racing-push fixtures; reading the hook's call sites observed the seam, not the Take-then-replay journey

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
- Earlier occurrence details: 1 additional recorded rows in `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`; these are historical evidence, not new occurrences.

## ODF-106 — Two plans planned concurrently on different checkouts both took number 132

Former local code: DD-155.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

Follow-up: Open, unqueued.

- Execution: `SEED-051#isolate-runner-settings` / plan 132, first related implementation commit `6b2ca78f` - Timestamp: 2026-09-27T18:36:56+08:00 (plan commit `77a8ca0f`; the sibling `132-restate-ci-pause-ownership` was committed at 18:32:11+08:00 in `9060ff71` on the execution branch and reached trunk via merge `54b5f025`) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: `.planning/slice-plans/132-isolate-runner-settings/` and `.planning/slice-plans/132-restate-ci-pause-ownership/` on trunk at `54b5f025` - Observed effect: the executor had to infer the intended plan (the one at the default checkout's HEAD when the session started) and could have Taken the other queued story - Inference: Qualified. Allocation from checkout-visible numbers cannot see another checkout's unpublished plan; the collision went unnoticed at merge because directory names differ

## ODF-160 — Cursor ran story wrap-up after execution although guidance says to leave it

Former local code: DD-165.

A native executor proceeds into story wrap-up despite finish guidance retaining the story, plan and checkout for a separate request.

Follow-up: Open, unqueued.

- Execution: `SEED-008#owned-context-start-and-truthful-refresh` / plan 142, first related implementation commit `7e86f615` - Timestamp: 2026-09-28T19:26:04+08:00 (native Cursor startup-owned-context) - Tool: Cursor - Open Dough release: modified; revision `c0f6dfca`; base `0.3.45` - Evidence: response "Proceeding with story wrap-up for SEED-A#a" after reading `finish-or-stop.md`; it deleted the fixture story, plan, and Taken entry; Claude and Codex stopped at `## PLAN EXECUTION COMPLETE`. - Observed effect: a 27-minute run and a missing workspace source in the assessment.

## ODF-120 — A not-ready reason waiting on another story's landing was not revisited when it landed

Former local code: DD-172.

A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.

Follow-up: Open, unqueued.

- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, before its claim `c3c1ed9b` - Timestamp: 2026-09-29T12:15:38+08:00 (story 2 closure `f7e7e272`; the not-ready record `19c7e82b` is 12:14:42) - Tool: Claude Code; Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: `19c7e82b` story-state reason naming `origin/claude/revisit-dashboard-sessions`; `f7e7e272` closed story 2; the developer's request "see why its not ready. Make it ready if you can"; reassessment `b961dc65` (12:44:09) changed only the plan's "Builds on" note and the assessment. - Observed effect: about 30 minutes of a queued story reading not-ready after its only blocker cleared, and one human prompt to recover it. - Inference: Qualified. Neither story wrap-up nor the backlog view re-reads other stories' not-ready reasons that name the closed work; whether that should be a wrap-up step or a dashboard hint is open.
- Execution: `SEED-052#launch-claude-refinement` / plan 159, claim `7667a007` - Timestamp: 2026-09-29T18:13:11+08:00 (keep-story-session-links closure `45fd5df2`; reassessment `9e176b9f` 18:18:42) - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4` - Evidence: execute-plan first stopped on the not-ready reason; the developer asked to "watch until the condition … is met and then start execution"; a fetch loop saw the closure, and the coordinator announced a preparation, reconciled the plan, recorded ready, and landed it before `execution-start.mjs start`. - Observed effect: third occurrence the same day. Only the developer's watch request revisited the reason; execute-plan has no wait-then-reassess path, so the coordinator inferred keep authority for the reassessment from "start execution".
- Execution: `SEED-052#choose-session-model` / plan 173, claim `cb47022d` - Timestamp: 2026-09-30T11:34:16+08:00 (readiness record `5fc5da56`; ad hoc closure merged `a283b110`) - Tool: Claude Code; Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47, last updated by `d68fcde4` - Evidence: plan 173's recorded not-ready reason named the ad hoc story landing on trunk; `execution-start.mjs start` answered `source-refused: published preparation is not-ready`; the developer's request "the ad hoc one is landed already … if that's the case, proceed to execute"; the coordinator reread the named files, updated the plan's premise row, recorded ready (`5fc5da56`) and published it before the Take. - Observed effect: fourth occurrence in two days. Execute-plan stopped at the start refusal and needed one human prompt before the coordinator did the reassessment; the reassessment itself was a one-row plan edit. - Inference: Qualified. As before, nothing revisits a not-ready reason when its dependency lands; here the plan itself said "re-read those files once it lands, then record ready", which no step ran.
- Earlier occurrence details: 1 additional recorded rows in `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`; these are historical evidence, not new occurrences.

## ODF-163 — A refactor pass removed a guard as behavior-preserving on an unverified helper premise

Former local code: DD-174.

A refactor removes a guard on an untested helper premise; acceptance repeats that premise and publishes a latent crash path.

Follow-up: Open, unqueued.

- Execution: `SEED-008#closure-proof-and-harness-correction` / plan 154, first related implementation commit `d1204cd7`; Timestamp: unknown (refactor before `d1204cd7`, 2026-09-29T15:02:45+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `b37292dd` - Evidence: refactor report cited `retirement-checks.mjs:31` as returning false; `succeeds()` there rethrew non-1 exits; plan learning in `d1204cd7`; slice 2's implementer read the helper, restored the skip, and planted a missing registered SHA in `trunk-closure-rebased-rerun.test.mjs` (`0166f178`). Observed effect: a latent crash path published on the execution branch for one slice; caught before trunk. Inference: qualified; a refactor that deletes a guard needs a test that exercises it, as in DD-124's read-versus-observe class.

## ODF-164 — A mistyped `--repo` bound managed delivery's observer to another repository, and a refused retry left a second observer

Former local code: DD-176.

Delivery accepts a repository argument inconsistent with the pushed remote; a later refused retry establishes an observer without reporting it.

Follow-up: Open, unqueued.

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002` - Timestamp: 2026-09-29T17:17:21+08:00 (delivery of `30bdc002`) - Tool: Claude Code; Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: first receipt `watch-6jw6fP` (stopped `unobserved`); refused retry printed no `CI_OBSERVER` receipt; manual start `watch-fYAmU8`; slice 2's delivery reported `reused` `watch-Hp4kOi`; coordinator re-registered `30bdc002` there and stopped `watch-fYAmU8`. - Observed effect: four extra coordinator steps and two observers briefly covering one branch; no CI event was lost. - Inference: Qualified. `deliver` could derive the repository from the pushed remote, or refuse one that does not match it, and a refused `deliver` should report any observer it established.

## ODF-150 — Slice proof chosen by the changed components missed page-wide invariant specs

Former local code: DD-177.

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario.

Follow-up: Open, unqueued.

- Execution: `SEED-052#keep-story-session-links` / plan 157, first related implementation commit `30bdc002` - Timestamp: 2026-09-29T17:36:06+08:00 (CI run 36550218994 on `08f217af`) - Tool: Claude Code; Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: slice 2 delegation's spec list; the failure at `accessible-overview-keyboard.spec.ts:72` (expected 5, received 6); repair `76e6dce3`. Slice 1's list had included that spec. - Evidence (recurrence in the same execution): slice 3's retention sentence put "done" in Recent sessions' always-shown intro; `published-work.spec.ts:151` forbids completion words anywhere on a page without sessions and failed only in CI run 36551022132 on `32e554d5`; the full dashboard suite (286 tests, 46 s) then passed locally with the repair. - Observed effect: two failed CI runs, two repair commits, and two extra refactor agents. - Inference: Qualified. Selecting proof by the names of changed components misses specs that assert a whole-page property. The whole dashboard suite takes under a minute locally, so running it before delivering a page change costs less than one CI repair.
- Execution: `SEED-052#start-ad-hoc-project-session` / plan 172, first related implementation commit `689970f7` - Timestamp: 2026-09-30T10:29:14+08:00 (slice 5, commit `5c09cc85`; CI run 36660072699) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: slice 5 added an always-rendered `role="status"` line in `StartSession.tsx`; its delegated proof ran only the ad hoc, terminal, sidebar and card specs; CI failed on `getByRole('status')` matching two elements in six page-wide specs (`accessible-overview-keyboard`, `auto-refresh`, `auto-refresh-recovery`, `published-work`, `read-failure`, `refresh`). `aria-live="polite"` also collided with `dashboardPage.ts`'s `notice` locator, so the repair `ed7e1aa1` uses `role="log"`. From slice 6 the whole suite (351 tests, about 1 min) ran before delivery. - Observed effect: one failed CI run, one repair commit, one repair agent, and a stash and restore of slice 6's unfinished work. - Inference: Qualified. The cause recurred in a new execution; slice 4's implementer had run the whole suite once, slice 5's delegation named a spec list instead.

## ODF-144 — A lost-observer notice kept blocking every turn end, even after the observer was stopped

Former local code: DD-185.

The Claude Stop hook repeats an already-recorded lost-worker notice without acknowledgement, blocking every later turn end.

Follow-up: Response delivered; verification remains open. No new implementation queued.

- Execution: `SEED-055#ci-time-budget-from-ci-timings` / plan 162, first related implementation commit `061aa911` - Timestamp: unknown; the loop spanned the shell's 2026-09-29T21:58:40+08:00 and 22:00:36+08:00 readings - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4` - Evidence: mailbox `/tmp/dough-ci-501/watch-nN6cSt`, whose worker died when the disk filled (ENOSPC) during slice 2. Its only revision, `061aa911`, passed CI when checked with `gh run list`. The `stop` result was `status: stopped`, `coverage.state: lost`, `unread: 0`, and the stop hook kept blocking after it. - Observed effect: about twelve coordinator turns spent acknowledging the same notice while a refactor agent ran. It persisted after the next delivery attached observer `watch-Ss12RC`. Cause (read in `ci-host-hook.mjs`): every hook call re-reports each bound mailbox whose worker is lost, with no delivered-once marker. Removing only this mailbox's binding under the coordinator's `owner-*` directory ended the loop.
- Execution: `SEED-052#card-session-residue` / plan 160, first related implementation commit `26099a6a` - Timestamp: unknown; after the disk filled following `f00ced6a`, before repair `75bdc10d` (2026-09-29T22:14:32+08:00) - Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: unknown; installed guidance last updated by `d68fcde4` - Evidence: mailbox `/tmp/dough-ci-501/watch-DONFBb` (worker lost when the disk filled); `stop` returned `coverage.state: "lost"` and the notice kept repeating; source repair `75bdc10d` reports a loss once through `delivery.json` `lossReported` and not after a `stop` marker. - Observed effect: about eight blocked turn ends, two developer questions, and a developer-authorized removal of the stale owner binding, since the running hook is the installed copy, which a source fix reaches only at release.

## ODF-177 — Shared-context edits invalidate sibling readiness

Former local code: DD-120 (isolated later occurrence from the former sibling-readiness record).

A sibling refinement or closure changes seed-level shared context, so another story's ready record becomes stale even when its own section and plan are unchanged.

Follow-up: Open, unqueued.

- Execution: `SEED-052#recent-sessions-residue` / plan 151, before its claim `34ad359b` - Timestamp: unknown; the refusal preceded reassessment commit `b7b3c23d` (2026-09-29T12:43:28+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; repository VERSION 0.3.46 at `b7b3c23d` - Evidence: same refusal after SEED-043#preserve-sibling-readiness closed (`fb345ff5`); `git diff f7e7e272 origin/main` on SEED-052 showed only story 3's refinement, which also edited the seed's shared Agreed Boundaries and Ordering text (done-prefix naming moved into story 3). Recorded basis `e646df35…` vs current `db4fc214…`; plan digest unchanged. - Observed effect: a diagnosis, a hand-rolled preparation worktree, record-state, commit, rebase, push to trunk, and a start retry before the claim. The coordinator published outside Dough Land and removed the local branch with `git branch -D` (its tip was already on trunk). The developer had asked for a reassessment, so no decision was lost. - Inference: Qualified. The fix exempts siblings' own sections, but a sibling refinement that edits shared seed context still invalidates every other story in the seed. Execute-plan names no route from this refusal to the preparation keep path.

## ODF-176 — Closure provenance invalidates ready corrections

Former local code: DD-120 (isolated later occurrence from the former sibling-readiness record).

Wrap-up rewrites a queued correction's own provenance, changing its plan or story basis without reconciling its readiness record.

Follow-up: Open, unqueued.

- Execution: `SEED-052#preparing-card-refinement-journey` / plan 154, before its claim `f9fe3fdc` - Timestamp: unknown; the refusal preceded reassessment commit `3da84888` (2026-09-29, same session) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; repository guidance at `fd077d1d` - Evidence: same refusal. Closure `fd077d1d` of the parent SEED-052#recent-sessions-residue rewrote this correction's own Scope provenance and its plan's Source/Provenance lines (branch refs to merged and closed-history refs) without reassessing; both digests changed. - Observed effect: one diagnosis, one record-state, one direct trunk commit, and a start retry. Inference: any correction a retrospective creates can be invalidated this way by its parent's wrap-up; the sibling-section fix does not cover it.

## DD-190 — Delegated slices skip lint and read-list specs, so CI is the first to catch them

A shared read boundary and a spec file changed under a "no format, no lint" delegation; the coordinator's own format failure was hidden by a piped command chain, so both defects reached remote CI.

Follow-up: Open, unqueued.

- Execution: `SEED-060#odd-e-nerds-agent-collection` / plan 177, first related implementation commit `6befd854` - Timestamp: 2026-09-30T14:10:00+08:00 (CI run 36676898928; repairs `57505b5d`, `f70185e6`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown - Evidence: slice 4 delivery ran `npm run format 2>&1 | tail -2; ...` whose output ended "Format failed: unresolved findings" (no-redundant-type-constituents in the new settings spec) yet the chain committed and published `03d6d10a`. The same push failed dashboard shards because `authenticated-project-overview.spec.ts` (exact pinned-read list, not in the agent's focused set) and fake-origin `git show` stderr in launch specs were never run. - Observed effect: two owned repair commits and two failing CI runs for one slice. - Inference: Qualified. The delegation forbade lint and named a focused set chosen from the reachability grep, so specs that enumerate reads were outside it; the coordinator's masked exit status was a separate slip. Not shown to recur in another execution.
