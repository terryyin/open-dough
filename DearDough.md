# DearDough Process Findings

Retained material shared-process findings, reviewed 2026-09-30. Only an explicit
queued follow-up is planned work; other entries are open and unqueued. A retained
released response is not proof of effectiveness. Unknown provenance stays unknown.
[Response status](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md).
Full pre-trim evidence: `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`. Older narratives live in Git, not a second archive.

- Highest allocated local number: 219. Removed local codes are never reused.

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

Follow-up: response delivered; verification open, no new implementation queued: a check-only pre-commit lint hook for this repository, enabled by `npm ci` (SEED-065#pre-commit-lint-hook, story and plan recoverable at df5a36bc). A masked format status now stops at `git commit`; no later execution has yet shown it on a real hidden-status chain.

- Execution: `SEED-037#diagnosable-test-hangs` / plan 104, first related implementation commit `044c88f` - Timestamp: 2026-09-25T22:28:16+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `87ffccb` - Evidence: `npm run lint 2>&1 | tail -2 && git commit` hid lint's exit 1; `1e648d9` was published, CI run `36147702793` `lint` failed; repair `decb252`. - Observed effect: one extra commit, push, and failed CI lint job.
- Execution: `SEED-052#interact-with-claude-terminal` / plan 152, first related implementation commit `549e2d5a` - Timestamp: 2026-09-29T14:48:19+08:00 - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance VERSION 0.3.46, last updated by `b37292dd` - Evidence: `npm run -s format 2>&1 | tail -1 && python3 … && git commit … && deliver` printed "Format failed: unresolved findings" yet continued; `ee35dd55` was published, CI run `36533023610` `lint` failed (`unbound-method`, `App.tsx:130`); repair `815844e4`. This repository has no commit hook, so formatting was the only local lint gate. - Observed effect: one extra commit, refactor pass, push, and failed CI lint job; the other CI jobs passed. - Inference: Qualified. The same coordinator had checked exit status correctly in earlier slices of this run; batching format, plan edit, commit, and delivery into one piped chain reintroduced the fault.
- Execution: `SEED-052#start-ad-hoc-project-session` / plan 172, first related implementation commit `689970f7` - Timestamp: 2026-09-30T10:09:44+08:00 (slice 2, amended commit `52932716`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: `npm run format 2>&1 | tail -3; python3 … && git add … && agent-commit` printed "Format failed: unresolved findings or tool failures remain." yet committed `3011c1df`; the `tail` hid `no-misused-spread` (`claudeLaunch.ts:64`), which a rerun of format found before delivery, and the commit was amended into `52932716`. - Observed effect: nothing published (caught before delivery); one amend and one extra format, typecheck and spec run. - Inference: Qualified. Recurrence of the hand-built format-then-commit chain (compare ODF-097); the rule is known and the chain still hid the failure, which one scripted format-then-commit step would stop.
- Execution: `SEED-062#compact-session-sidebar` / plan 181, first related implementation commit `783a8e7a` - Timestamp: unknown (CI run 36687483426 on `783a8e7a`, session date 2026-09-30) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown - Evidence: slice 1 replaced the Sessions text button with an icon; the delegation's spec list was every spec importing `sidebarParts` plus two attention specs. `dashboardPage.ts`'s `controlsBesideSessions` excluded the button by `hasNotText: /^Sessions/`, so `agent-roster`, `project-read-recovery` and `read-failure` specs failed only in CI (strict-mode violation, two buttons); repair `f47257d5`. The full dashboard suite (about 1.5 min) ran before every later delivery. - Observed effect: one failed CI run and one repair commit before the suite was adopted. - Inference: Qualified. The list was chosen by which specs import the changed helper, and a text-based locator in a different helper was outside it; a third execution shows the cause recurring.
- Execution: `SEED-061#select-refinement-options-from-dashboard` / plan 185, first related implementation commit `06c65127` - Timestamp: 2026-09-30T18:29:46+08:00 (slice 3, commit `e6ec8dd9`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.49 - Evidence: `npm run format 2>&1 | sed … | tail -2; python3 … && git add -A … && agent-commit && deliver` printed "Format failed: unresolved findings or tool failures remain." yet committed `e6ec8dd9` and published it; CI run 36702782718 `lint` failed (`no-unnecessary-condition`, `agent-launch-options-groups.spec.ts:95`, a new untracked spec the delegated agent had not linted); repair `235583f7`. The coordinator then ran format with its exit status gated (`F=$?`) before each later commit in the run. - Observed effect: one extra commit, push, and failed CI lint job; the later six deliveries were gated. - Inference: Qualified. Sixth hand-built format-then-commit chain in which `tail`/`;` hid the status; the coordinator's own rule was known (the piped output was read, and the failure line was visible) but the chain ran on it.
- Execution: `SEED-061#correct-refinement-options-launch-follow-ups` / plan 188, first related implementation commit `b75ca9c4` - Timestamp: 2026-09-30T20:33:33+08:00 (slice 4, commit `ed977595`) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.50 - Evidence: `npm run format 2>&1 | tail -2; git status; python3 … ; git add … && agent-commit && deliver` printed "Format failed: unresolved findings or tool failures remain." yet committed and published `ed977595`; CI run 36715538846 `lint` failed (`no-unused-vars`, `agent-launch-options-rules.spec.ts:187`, a new spec the delegated agent had not linted); repair `ee23660c`. Slices 1-3 used the same `;`-separated shape and passed only because format succeeded. - Observed effect: one extra commit, push, and failed CI lint job. - Inference: Qualified. Seventh hand-built chain; the coordinator did not consult this finding before delivery and separated format from commit with `;` in every slice, so a scripted gated format-then-commit step remains the likely remedy.

## ODF-154 — Cursor managed delivery lacks its coordinator session identity

Former local code: DD-095 (plan 126 Cursor occurrence only).

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

Follow-up: Open, unqueued.

- Execution: `SEED-046#ci-verdict-correction` / plan 126, first related implementation commit `9fa45de` - Timestamp: unknown (first increment delivery, between commit `9fa45de` at 2026-09-27T12:43:54+08:00 and the observer start minutes later) - Tool: Cursor - Model: kimi-k3 - Open Dough release: modified; revision `ff3534c`; base 0.3.42 - Evidence: `9fa45de` delivery receipt `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); a manual probe then showed `CI_MONITOR_READY`; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-7YVAZ1`; the next managed delivery reported `observation.state: reused`. - Observed effect: first Cursor occurrence; slice 1's increment was unobserved until the manual start, and the finding's `$CLAUDE_CODE_SESSION_ID` recovery does not apply to Cursor's conversation/generation identity.
- Execution: `SEED-053#dashboard-browser-navigation` / plan 136, first related implementation commit `8ca2f7eb` - Timestamp: 2026-09-27T22:11:50+08:00 - Tool: Cursor - Open Dough release: 0.3.43 - Evidence: completion input `pendingCi: unobserved` ("host session identity required for Cursor notification bridge"); retained tip `777b797926acfab373a6cd45766e3066cbd9da95` - Observed effect: managed delivery left the story-branch tip unobserved; no Cursor session identity was available to arm the notification bridge - Inference: Same Cursor host-identity gap as the plan 126 occurrence; Claude-only recovery remains inapplicable
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5` - Timestamp: 2026-10-01T06:03:31Z (native Cursor run `cursor/publication/one-shot-auto-land/20261001T060331-5bc6`, slice 8 acceptance) - Tool: Cursor - Open Dough release: modified; revision `0d565a9e`; base 0.3.51 - Evidence: the native agent's managed `deliver` receipt for landed `063edd4` reported `observation.state: unobserved` ("host session identity is required…"); the agent found `CURSOR_CONVERSATION_ID` set but no supported way to pass it, kept its workspace and reported the gap. Cursor `one-shot-result` in the same batch hand-started an observer and retired; Cursor `one-shot-queued` queried CI once and retired. - Observed effect: three Cursor sessions handled the same missing identity three ways; the acceptance assessor needed a developer decision (kept workspace is compliant when CI went unobserved). - Inference: Same gap as earlier rows, now visible in native acceptance runs rather than a coordinator's own delivery; Codex showed the analogous `unobserved` receipt ("yielded-cell bridge is unavailable").
- Execution: `SEED-052#use-cursor-from-dashboard` / plan 210, first related implementation commit `71764841` - Timestamp: unknown (slice 4 `3e5c10d8` at 2026-10-02T11:40:03+08:00 and slice 5 `4541eda4` at 2026-10-02T12:27:54+08:00; both receipts were reported before this review started at 2026-10-02T12:29+08:00) - Tool: Cursor - Open Dough release: modified; revision `0ae15498`; base 0.3.52 - Evidence: the execution reported `observation.state: unobserved` and `pendingCi: unobserved` for `3e5c10d8` and `4541eda47a3d1b7f909320dea343bc66c9ac65e7`, reason `host session identity is required to verify the notification bridge`; earlier observer directory `/tmp/dough-ci-501/watch-aPxS2Q`. The coordinator transcript has four records and does not contain those receipts. - Observed effect: slice 4 and slice 5 CI stay unobserved; this review does not treat that as pass or fail. - Inference: Same Cursor session-identity gap. No replacement observer was started.
- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56` - Timestamp: unknown (delivery of `f84a7a56`, between its commit at 2026-10-02T14:13:42+08:00 and a clock read at 14:15:13+08:00) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: `deliver` from the coordinator's own Shell accepted `f84a7a56` on `refs/heads/cursor/state-that-cursor-supplies-embedded-attach` with `observation.state: unobserved` ("host session identity is required to verify the notification bridge"); an immediate `ci-mailbox.mjs probe` from the same Shell got `CI_MONITOR_READY` from the Cursor hook; `ci-host-bridge.mjs` `resolveHostSession` falls back only to `CLAUDE_CODE_SESSION_ID`, and the coordinator cannot read its Cursor `conversation_id`/`generation_id` for `--session-json`. - Observed effect: the only increment's CI stayed unobserved; no manual observer was started because managed delivery forbids it. - Inference: Same gap; the hook proves Cursor's bridge works, so the missing piece is only identity transfer into `deliver`.
- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62` - Timestamp: unknown (first delivery of `7053bc62`, committed 2026-10-02T16:42:11+08:00; the third at `69634abd` came later) - Tool: Cursor - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: `deliver` for `7053bc62` returned `observation.state: unobserved` ("host session identity is required…"). A probe from the coordinator's Shell got `CI_MONITOR_READY`. The coordinator read `ci-host-bridge.mjs` and `execution-increment-observation.mjs` and found that a live matching observer is reused before the bridge check. It then ran `ci-mailbox.mjs start` (`watch-qYGHLT`) and `register-push`, and `10d7967e`'s delivery reported `reused`. That observer later emitted `CI_MONITOR_UNAVAILABLE` (GitHub TLS handshake timeout), so `69634abd`'s delivery was `unobserved` again and needed a second manual start (`watch-ssxsmf`). - Observed effect: two of four increments needed a manual observer start and registration, plus a code read to find the reuse path. - Inference: Same gap. A lost observer brings it back mid-execution, not only at the first delivery.

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
- Execution: `SEED-052#script-execution-preparation` / plan 178, first related implementation commit `821cd555` - Timestamp: 2026-09-30T14:50:39+08:00 (CI repair `f77110df`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: plan 178's premise table row "New script files ship with the skill directory (no manifest to edit)", observed by `grep -rln execution-start-receipt` outside skill copies, marked yes for slice 1; CI failed on `tests/payload-declaration-links.sh` because `install.sh` `managed_files` declares each shipped script and reference; slice 1's own files were declared in `f77110df`, and the plan row now records the premise as wrong. - Observed effect: one failed CI run and one repair commit early in the execution. - Inference: Qualified. The premise was observed by searching for a name, not by the consuming operation (adding a shipped file and running the payload-declaration check), which is the same shape as this finding.

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

## DD-190 — A plan counted look-alike copies as one responsibility without comparing their semantics

A structure plan named "31 copies", "the complete/await/stop field block" and "a second reader of the same shape" as replaceable by one helper, from grep counts and text shape; implementation found different semantics or layouts behind three of them.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-055#reassess-native-test-architecture` / plan 177, first related implementation commit `eebcaa8c`
  - Timestamp: 2026-09-30T14:46:24+08:00 (execution start; slice reports the same afternoon)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: modified; revision `edc71c05`; base 0.3.47
  - Evidence: plan premises table and slices 2, 3, 7; `native_journey_state_field` reads a variable, matches anywhere and keeps spaces; the four completion blocks print different names, order and interleaving (trunk derives product-shutdown from its finish count); `delivery_evidence_obs_get` returns the rest of the first matching line, not awk `$2`. Commits `62ed3729`, `00173a6c`, `b6b2e4ad`.
  - Observed effect: slice 2 kept one twin reader, slice 3 extracted the shared measurement instead of one writer, slice 7 kept its own reader; each implementer reported the deviation and the plan recorded it. Story example 2 (one shared owner for both readers) is met only in part.
  - Inference: Qualified. The planning premises table observed counts and call sites but not the semantics each copy consumes; the deviations cost no rework because implementers inspected each copy first, as their briefs required.

## DD-191 — Delegated slices skip lint and read-list specs, so CI is the first to catch them

A shared read boundary and a spec file changed under a "no format, no lint" delegation; the coordinator's own format failure was hidden by a piped command chain, so both defects reached remote CI.

Follow-up: Open, unqueued.

- Execution: `SEED-060#odd-e-nerds-agent-collection` / plan 177, first related implementation commit `6befd854` - Timestamp: 2026-09-30T14:10:00+08:00 (CI run 36676898928; repairs `57505b5d`, `f70185e6`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown - Evidence: slice 4 delivery ran `npm run format 2>&1 | tail -2; ...` whose output ended "Format failed: unresolved findings" (no-redundant-type-constituents in the new settings spec) yet the chain committed and published `03d6d10a`. The same push failed dashboard shards because `authenticated-project-overview.spec.ts` (exact pinned-read list, not in the agent's focused set) and fake-origin `git show` stderr in launch specs were never run. - Observed effect: two owned repair commits and two failing CI runs for one slice. - Inference: Qualified. The delegation forbade lint and named a focused set chosen from the reachability grep, so specs that enumerate reads were outside it; the coordinator's masked exit status was a separate slip. Not shown to recur in another execution.
- Execution: `SEED-052#script-refinement-preparation` / plan 186, first related implementation commit `a94806d1` - Timestamp: 2026-09-30T10:46:35Z (CI run 36704446514) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown - Evidence: slice 3's delegated implementation ran only the focused Playwright specs and typecheck; its new `agent-launch-preparation-start.spec.ts` read `JSON.parse(response.body).kind` twice, which failed CI's lint job (`@typescript-eslint/no-unsafe-member-access`, lines 70 and 137) on `b2503ea2` although the commit, whose hook the plan assumed check-only lint, had succeeded. - Observed effect: one failing CI run, one stash-protocol repair cycle and one repair commit (`a9623112`); later delegations then named `node scripts/lint.mjs` and the strict rules, and no further lint failure reached CI in this execution. - Inference: Qualified. A second execution with the same shape (new spec files written under a no-lint delegation); the commit hook's lack of a lint check is not proven here beyond the successful commit.
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5` - Timestamp: 2026-10-01T01:36:25Z (CI run 36801899574) and 2026-10-01T03:16:46Z (CI run 36809768647) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `0d565a9e`; base 0.3.51 - Evidence: slice 1 reworded `execution-location.md` and its focused set omitted `dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`, whose regex pinned the old sentence (repair `9ff46944`); slice 5 changed `landWorktree`'s destructured parameters in `dough-land-test-fixtures.mjs` and its proof never ran `npm run typecheck:dashboard`, which `dashboard/tests/preparingJourney.ts` failed with TS2345 (repair `716c933b`). Slice 6's agent found the second break locally before CI reported it. - Observed effect: two failing CI runs and two stash-protocol repair cycles in one execution. - Inference: Qualified. Same shape as earlier rows: delegated proof chosen from changed components missed a text-pinning guidance test and a cross-package type consumer; lint was not the gap here.
- Execution: `SEED-072#responsive-session-start-reconciliation` / plan 192, first related implementation commit `109fd76b` - Timestamp: 2026-10-01T17:50:33+08:00 and 2026-10-01T18:45:01+08:00 (commit times of `109fd76b` and `b68b1c7b`; the format failures preceded them) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: unknown; installed guidance last updated by `e6a7106c` (base v0.3.51) - Evidence: both delegated refactor passes were told not to run hook-owned lint; the coordinator's `npm run format` then failed on refactor-introduced `no-param-reassign` in `launchAttemptOwner.ts` (slice 1) and `no-unused-vars` after the refactor un-exported the type-only `launchResultSchema` (slice 2). Later refactor briefs named both rules and no further lint failure occurred. - Observed effect: two coordinator code edits after accepted refactor proof, each followed by a focused proof rerun; nothing reached CI. - Inference: Qualified. Same no-lint delegation cause, caught at coordinator formatting rather than CI.


- Execution: `SEED-077#ci-independent-of-package-mirror-stalls` / plan 207, first related implementation commit `e98441593f71e722b032ab08203c43b43a4c1d56` - Timestamp: unknown (2026-10-02, slice 3 delivery) - Tool: Codex - Open Dough release: unknown - Evidence: independent `refactor3` returned focused native setup proof and `## REFACTOR COMPLETE` under a no-hook-lint delegation; the coordinator's first slice 3 agent commit was refused by staged ShellCheck SC2312 in `tests/native-setup.sh:100` (deadline command substitution passed directly to `refuse`). The coordinator assigned the deadline separately, reran affected shfmt and the hook, then committed `68bfc97e504ae5e56b93cdbf3ac70d9d5b15f168`. - Observed effect: one local refused commit and mechanical repair; no invalid revision was published, and the check-only hook preserved the index. - Inference: same delegated static-rule gap, caught locally rather than CI. Keep hook ownership with the coordinator; include known warning-as-error rules in the refactor brief rather than adding duplicate lint runs.

## DD-192 — A delegated refactor pass ran on each of two tiny guidance changes and edited nothing

The required fresh refactor agent was spawned for a five-line skill paragraph plus one data file, and again for a one-entry data addition; both returned `## REFACTOR COMPLETE` with no edits, after reading the diff and skill references.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-057#composable-refinement-styles` / plan 180, first related implementation commit `fba9ebb5`
  - Timestamp: unknown (session date 2026-09-30; exact event times not recorded)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: modified; revision `7591380f`; base 0.3.47
  - Evidence: coordinator conversation: refactor hand-backs for slice 1 (`Outcome: none — already clean`, 42,061 subagent tokens, 3 tool uses) and slice 2 (`Outcome: none — already clean`, 41,865 subagent tokens, 4 tool uses); changed paths `refinement-options.json`, a 5-line `SKILL.md` paragraph and one `install.sh` line.
  - Observed effect: no edits, no rework; the passes restated an overlap (`default` versus the SKILL.md pointer sentence) that slice 1's implementer had already reported.
  - Inference: Qualified. Cost only, about 84k subagent tokens across two passes; the step is mandatory and two samples cannot show whether a pass ever pays off on changes this small.
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: unknown (2026-10-01, between `47ef4368` at 18:04 and `c63a1c0b` at 18:49 +08:00)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: four refactor passes on documentation-only slices; slices 1–3 made only rewraps or one-phrase rewordings (about 56k, 78k and 49k subagent tokens); slice 4's pass found two wrong citations in the new seed (`src/launchWorkflow.ts:43,65` for a substitution that is in `src/StartLaunch.tsx:105-106`, and a misdescribed `src/agentTerminal.ts:3`).
  - Observed effect: three passes changed nothing of substance; one corrected story evidence before it was published.
  - Inference: Qualified counter-evidence: on a change whose text carries code citations, the pass can pay off even when no code changed.
- Execution: `SEED-052#cursor-host-guide-attach` / plan 214, first related implementation commit `f84a7a56`
  - Timestamp: unknown (2026-10-02, between the guide edit and commit `f84a7a56` at 14:13:42 +08:00)
  - Tool: Cursor (coordinator and delegated agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: the slice changed one clause of `dashboard/AGENT-LAUNCH-HOSTS.md` ("Attach is supplied:") plus a rewrap; the fresh refactor agent reread the skill and references, rechecked the cited `cursorHost.ts:14` and `terminal.ts:30`, and returned `none — already clean` after about 2 minutes.
  - Observed effect: no edits; it restated a pre-existing overlap with `dashboard/AGENT-LAUNCH-TERMINALS.md` lines 9–12 that the plan already excluded.
  - Inference: Qualified. Cost only; the citation recheck matches plan 200's counter-evidence but found nothing here.
- Execution: `SEED-056#state-refinement-decision` / plan 221, first related implementation commit `80043764` - Timestamp: unknown (2026-10-03, before commit `80043764` at 07:40:53+08:00) - Tool: Claude Code (coordinator and delegated agent) - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: the slice reworded two sections of `src/skills/dough-slice-planning/SKILL.md` (+38 words); the refactor pass (about 48k subagent tokens, 4 tool uses) edited nothing but reported that "Stay within the triggering instruction" restated the report contents without the new refinement decision line, so a planning-only report could omit it; the coordinator fixed both bullets in `80043764`. The plan had limited edits to the two sections although its premise search for `remaining concerns` matches those bullets - Observed effect: no rework; one coherence gap closed before commit, outside the plan's section limit - Inference: Qualified counter-evidence, like plan 200: on a tiny guidance change that restates nearby text, the pass can pay off

## DD-193 — A finished subagent's hand-back was re-delivered until its task was stopped

After slice 1's implementation agent returned, the identical final report reached the coordinator about eight more times as new messages and task notifications, including while a different slice's agent was pending.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-062#compact-session-sidebar` / plan 181, first related implementation commit `783a8e7a`
  - Timestamp: unknown (session date 2026-09-30; between slice 1 and slice 2 acceptance)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown
  - Evidence: coordinator conversation: task `Implement slice 1 icon toggle badge` reported "completed ... may still be running background work" with a growing tool-use count (47 to 54) on each repeat; the repeats stopped after `TaskStop` on that task.
  - Observed effect: each repeat cost a turn and about 1.5k tokens of duplicated report to read and dismiss, and risked being mistaken for new work.
  - Inference: Qualified. The agent appears to have re-emitted its hand-back each time it resumed; the cause inside the agent is not in the record. Stopping the completed task ended it; guidance does not say to do so.
- Execution: `SEED-057#shape-interaction-within-system-constraints` / plan 184, first related implementation commit `c64ee06a`
  - Timestamp: unknown (session date 2026-09-30; between slice 1 acceptance and its refactor pass)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown
  - Evidence: coordinator conversation: the slice 1 agent's identical final report arrived as a hand-back message and completed-task notification about six times, with a growing tool-use count (34 to 37); the repeats stopped after `TaskStop` on that task.
  - Observed effect: each repeat cost a turn and a duplicated report to read and dismiss while the refactor agent and later work were pending.
  - Inference: Qualified. Same pattern as the first occurrence; the agent's own cause is not in the record.

## DD-194 — A plan's literal focused proof command failed from its stated directory and left build output that broke the format gate

A plan wrote its focused Playwright command as `cd dashboard && npx playwright test tests/…`, but the dashboard fixtures copy `src/skills/…` relative to the current directory, so the command only works from the workspace root. Its first run also built `dashboard/dashboard/dist`, which the lint step then scanned.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-061#select-refinement-options-from-dashboard` / plan 185, first related implementation commit `06c65127`
  - Timestamp: 2026-09-30T18:19:53+08:00 (slice 1, before commit `06c65127`)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.49
  - Evidence: plan 185 "Outside-in proof" focused run and the slice 1 delegation both gave `cd dashboard && npx playwright test tests/agent-launch-start.spec.ts …`; the slice 1 agent's report says it failed in test setup and reran from the workspace root; the coordinator's next `npm run format` then reported 4812 eslint errors, all in `dashboard/dashboard/dist/assets/index-*.js` (git-ignored, but linted), cleared by deleting `dashboard/dashboard`. Plan 185 "Decisive premises" lists nine observed premises and none is the focused command.
  - Observed effect: one failed proof run, one failed format run, and a diagnosis round before the first commit; later delegations carried the corrected root-based command.
  - Inference: Qualified. The plan's command was taken from earlier plans' form rather than run once when planned; a premise check of the literal proof command would have caught it. The lint scanning ignored build output is a separate repository quirk and is not attributed to guidance.

## DD-195 — Full-selection local runs flaked in existing specs that passed isolated and in CI

Across one execution, three large parallel Playwright selections each failed one existing spec that the change did not touch; each passed on isolated rerun and CI stayed green.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-052#script-refinement-preparation` / plan 186, first related implementation commit `a94806d1`
  - Timestamp: unknown (session date 2026-09-30; slices 3, 6 and 7)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-sonnet-5-5
  - Open Dough release: unknown
  - Evidence: slice 3 selection (234 specs) failed `agent-launch-card-delete.spec.ts:51`, then passed 24 of 24 isolated repeats; slice 6 selection failed it again and passed with the preparation specs; slice 7 selection failed `agent-launch-start-taken.spec.ts:53` ("server could not be reached") and passed on rerun; CI runs `a3c3ea29`, `a9623112`, `d8d42ef6`, `38d53df9`, `7bf821a4`, `ac880042` succeeded.
  - Observed effect: each failure cost a bounded diagnosis (rerun, read of the spec's dependence on start code) without a cause found.
  - Inference: Qualified. A read-only review found neither spec using the new shared progress or kept-start code, so load on a machine running other workloads is plausible; not reproduced. Flakiness is a defect even when a rerun passes, so the cause stays open.
- Execution: `SEED-065#warning-free-lint` / plan 187, CI repair commit `6a8d3608`
  - Timestamp: 2026-09-30T20:09:39+08:00 (failing CI job's log time)
  - Tool: Claude Code (coordinator and delegated agent)
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.50
  - Evidence: CI run 36712853079, job "dashboard (1/2)", on `96838533` failed `agent-launch-card-delete.spec.ts:51` (`cardTop` expected 507.8125, received 586.71875). The run's Playwright trace shows `settled()` in `dashboard/tests/storyStagesPage.ts` passing right after `page.reload()`, before any card rendered, and preparation facts arriving after `before` was measured; a route delay reproduced the exact values. Repair `6a8d3608` makes `settled()` wait for a card first; `--repeat-each=10` and the 18 specs using the helper pass.
  - Observed effect: one failed CI job, one diagnosis, and one repair commit.
  - Inference: A cause is now evidenced for the `agent-launch-card-delete.spec.ts:51` failures above: a test-helper race that load widens, not product behavior. `agent-launch-start-taken.spec.ts:53` is not explained by it.

## DD-196 — Story Branch delivery's `--target-ref` value had to be read from the script

The delivery references name an "authorized target ref" and say Story Branch Mode pushes to the remote execution branch, but do not say that `deliver --target-ref` then takes `refs/heads/<execution branch>` rather than the trunk the established start names as `target`.

Follow-up: Open, unqueued.

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

## DD-197 — New tests that run tools and Git passed on macOS and failed on CI's Linux test job

Two of the four commits published for one execution failed CI's `test` job for environment reasons that macOS runs could not show; the plan named the Linux container proof only for its last slice.

### Occurrences
- Execution: `SEED-065#pre-commit-lint-hook` / plan 190, first related implementation commit `42437c58` - Timestamp: 2026-09-30T22:03:00+08:00 (CI runs 36725631259 on `42437c58` and 36726848028 on `0e6e2bbe`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.51 - Evidence: `42437c58` failed `test (2/2)`: the clean-`.sh` hook test staged a shell file and `shfmt: spawnSync shfmt ENOENT` refused the commit, because only CI's `lint` job installs shellcheck and shfmt; repair `6be8fccc` (skip when either tool is absent). `0e6e2bbe` failed `test (2/2)` with `fatal: cannot use /dev/stdin as an exclude file`, Git on Linux rejecting the piped `--exclude-from=/dev/stdin` that slice 1's own `--staged` code introduced (slice 2 spread it to the ESLint list); repaired inside slice 3's commit `8a165806` after that slice's agent ran `scripts/ci-container.sh` and saw six hook tests fail. The plan's slice 1 and 2 proof commands were local `node --test` runs; `scripts/ci-container.sh` appears only in slice 3's proof. Slice 1's report said existing tests "don't skip either" for missing shell tools, which held for their `.mjs`-only fixtures but was not checked against the CI job's tools.
  - Observed effect: two failed CI runs, one dedicated repair commit and one repair folded into a slice commit, and one CI-repair stash of finished slice 2 work; the dedicated repair skipped its own refactor pass.
  - Inference: Qualified. Tests that spawn Git or lint tools depend on the runner's tools and Git build, and the plan only proved them under CI's conditions at its final slice. Running the container proof for any slice that adds such tests would have surfaced both failures before publication; this run's one container run took the agent a few minutes.

## DD-199 — Recovery failure setup used a deadline before establishing accepted input

Former branch-local code: DD-197; reassigned after concurrent trunk allocation of DD-197.

The lost-acknowledgment setup let a short launch deadline disconnect the native substitute without first observing that it accepted the input. An equality between two absent records could pass and conceal the missing precondition. This differs from ODF-067's fixture-computed Git refusal: the operation was attempted here, but its required intermediate event was unproved.

Follow-up: Open, unqueued. For a fault injected after a native event, observe that event before triggering the fault; keep negative-history and no-resend assertions. No guidance change is authorized by this review.

### Occurrences

- Execution: `SEED-052#start-codex-refinement-from-dashboard` / plan 189, first related implementation commit `05f3e4a9fa018eba5be122b729f5b78f0e4cce70`
  - Timestamp: unknown (2026-10-01 resumed execution; CI run36790537801/attempt1)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: CI job110142132390 failed the negative-history test from `3dbb1f77`; fresh repair baseline with original100ms plus explicit `native.history.length === 1` failed expected1/received0. Repair agent `ci_recovery_setup_repair` terminal report/PTY80979 and published `3fdae6f201941ff239bc24a2788590bdf25e88d7` changed both100/250ms setups to await held input acceptance before disconnecting and assert durable uncertainty/ID. [Recovered slice5 proof](https://github.com/terryyin/open-dough/blob/719a5ef8525788bd7d9288cff8f97c76bf1f5b6b/.planning/slice-plans/189-start-codex-refinement-from-dashboard/PLAN.md) retains the exact command; production unchanged.
  - Observed effect: One owned repair commit and a pause in native acceptance; all five selected repair tests passed afterward. The original no-resend and history/status assertions remained.
  - Inference: Event-based setup supplies causal evidence that elapsed time alone did not. Cost beyond this repair is unmeasured; native pause also included a separate acceptance-wording correction.

## DD-200 — Codex stream notifications leave handled failures unread at completion

Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding delivered failure notifications, but neither its consumer nor the stream worker advanced the mailbox's durable delivery cursor. After both failures were repaired, completion returned green CI while retaining shutdown for those same unread events. This is distinct from ODF-144's lost-worker notices: the worker was live and the stale events were actual repaired CI failures.

Follow-up: Open, unqueued. Align the Codex stream notification contract with durable delivery acknowledgment, preserving unseen actionable failures. No guidance or script change is authorized by this review.

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
  - Inference: the same adapter cursor gap recurred. Process proposal remains DD-200's existing unqueued acknowledgment-contract follow-up; this review does not change guidance.


- Execution: `SEED-077#ci-independent-of-package-mirror-stalls` / plan 207, first related implementation commit `e98441593f71e722b032ab08203c43b43a4c1d56` - Timestamp: unknown (2026-10-02 completion operation) - Tool: Codex - Open Dough release: unknown - Evidence: retained observer `/tmp/dough-ci-501/watch-Mcfmhh`, cell14/session97439/PID47835; exact-revision completion for `43226774216f8d4eb3de0ec516a898d86212749e` returned success (run36947886626/attempt1) but retained shutdown for unread sequence1, run36942598744/attempt1 on `e9844159`. That event's attention-journey synchronization failure was already repaired by `7ab0732b` with deterministic red/green proof and passing run36943286746. Installed readMailbox/readMailboxEvents/readDeliveryProgress confirmed exact checkout/repo/branch and only this handled tuple; coordinator used recordDeliveryProgress to acknowledge sequence1, deliveredThrough1. - Observed effect: one completion receipt retained shutdown and required explicit durable acknowledgment, then repetition of the completion operation. No new product repair was needed. - Inference: the installed yielded Codex adapter's documented binding notifies record.event without persisting the delivery cursor, reproducing DD-200. Keep its existing unqueued contract proposal; this execution changes no guidance.

- Execution: `SEED-081#codex-session-model-and-effort` / plan 211, first related delivery commit `bcaabd99c5f24bcffc9393f53c203c74589f2b7e`
  - Timestamp: unknown (2026-10-02 execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed at established start `20580ea2`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-x4nPTj`, cell19/session35356/PID69697 delivered sequence1, run36962208003/attempt1 on `9c0d6bb4`. After focused red/green repair and accepted `4a50e086`, installed readMailbox/readMailboxEvents verified checkout/repository/branch and that exact tuple; readDeliveryProgress still returned deliveredThrough0. Coordinator acknowledged only sequence1 through recordDeliveryProgress, then read back deliveredThrough1.
  - Observed effect: one explicit durable acknowledgment was necessary after notification handling; retained shutdown was avoided before completion. No unseen evidence was cleared.
  - Inference: the notification/cursor gap matches DD-200. This occurrence does not claim a failed shutdown receipt; existing contract follow-up remains unqueued and guidance unchanged.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 CI repair and execution/review handoff)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: yielded observer `/tmp/dough-ci-501/watch-HB2kLV`, cell105/session35081/PID79031 delivered sequence1, run36978829120/attempt1 on `e5fe8a7c`. A fresh agent reproduced the startup test's disposed-response race and repair `0e88f0162b06f151444dd3588345d08279df6c62` passed held red/green, both original tests and typecheck; managed delivery reused the observer. Installed readMailbox/readMailboxEvents verified exact checkout/repository/branch and event identity; readDeliveryProgress remained deliveredThrough0. Coordinator acknowledged exactly sequence1 through recordDeliveryProgress and read back deliveredThrough1, remaining[].
  - Observed effect: one explicit durable acknowledgment was necessary after handling the delivered failure. No failed shutdown receipt is claimed. Execution completion for `96b67c5` returned exact CI success (run36980585327/attempt1) and confirmed shutdown; spent plan recovery: `96b67c5cd28230a3a2f822885bf2ba06a299953d:.planning/slice-plans/213-dashboard-development-and-production/PLAN.md`.
  - Inference: matches DD-200's notification/cursor gap. Keep the existing unqueued contract proposal; this review changes no guidance.
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


## DD-201 — Managed Codex delivery and yielded stream have no documented attachment seam

Managed increment delivery can create a detached observer and say Codex binding is retained by the caller. The documented yielded-cell stream command instead creates its own mailbox; it accepts no existing directory. The coordinator could not establish that those two paths deliver notifications from the same observer without starting another observer or inventing an adapter.

Follow-up: Open, unqueued. Provide one supported managed-delivery-to-yielded-stream attachment contract. This review authorizes no guidance or runtime change.

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


- Execution: `SEED-075#session-record-per-host` / plan 202, first related implementation commit `7c380b080924b251f4b9ef11bf33a8c0536b4491`
  - Timestamp: unknown (2026-10-01, first increment delivery; launch clock observed 12:50:54 UTC)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` in this execution checkout)
  - Evidence: managed delivery accepted `7c380b08` on `refs/heads/codex/each-host-has-its-own-session-record-shape` with `observation.state: unobserved`, no mailbox. Installed `execution-increment-observation.mjs` starts a detached mailbox; `ci-host-bridge.mjs` assumes a caller-retained stream; documented `ci-mailbox.mjs stream` creates another mailbox and accepts no existing-directory argument; ordinary managed delivery forbids a separate observer start.
  - Observed effect: schema, focused operation proof, full dashboard suite and publication passed; ordinary branch notification/completion coverage remained unobserved.
  - Inference: same missing attachment contract as earlier occurrences; host primitives exist. Landing can use the separate supported trunk-integration stream path. No runtime or guidance repair is authorized here.

- Execution: `SEED-075#launch-gates-every-host` / plan 204, first related implementation commit `1dd48501ec3a43cc9dcbbfca937653182fe77b95`
  - Timestamp: unknown (2026-10-01, before slice 1 publication)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `dbc55abe`)
  - Evidence: the same installed managed-delivery/stream split was inspected. Coordinator armed the documented startup yielded stream first (`watch-n8GCrg`, cell 18, PTY 73631, PID 23822); managed receipts for `1dd48501` and `beb224b6` both reported that exact mailbox reused.
  - Observed effect: one observer covered both branch increments without creating a detached second observer. Existing startup-before-first-publication wording supplied a usable route for this established claim; ordinary managed delivery still has no existing-directory stream attachment argument.
  - Inference: this successful startup route limits the earlier conclusion: host primitives can provide coverage when a yielded stream is established first. A single documented managed-to-stream connection would avoid the coordinator's extra adapter-source investigation.

- Execution: `SEED-075#one-host-description` / plan 205, first related implementation commit `b6f2cb651d8a9d23fa632e77b79fa83e9c184259`
  - Timestamp: unknown (2026-10-01, first three increment publications before retrospective)
  - Tool: Codex
  - Open Dough release: 0.3.52 (unchanged installed `dough-update/VERSION` in the established execution checkout)
  - Evidence: retained managed receipts for `b6f2cb65`, `4e623e37` and `09d5d98a` accepted execution-branch publication with CI unobserved and no mailbox. Same installed detached-start/yielded-new-mailbox split as above. Retrospective read the preceding successful plan-204 occurrence and started the documented single yielded observer `/tmp/dough-ci-501/watch-5nR8V5` (cell 69, session 89374, PID 24205) before completion publication; managed reuse and final coverage are pending at this record write.
  - Observed effect: all three slices passed local proof and publication, including 704 dashboard tests, but their receipts lacked notification coverage. A prior supported startup route was recovered during review; one observer is now live for the completion boundary.
  - Inference: the attachment-seam ambiguity caused another initial coverage gap; existing successful startup evidence limits any conclusion that available host primitives cannot cover this execution. Document one clear startup/reuse route and consult that evidence before declaring coverage unavailable. No guidance/runtime repair is authorized here.

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
  - Evidence: three accepted managed deliveries (`bcaabd99`, `0a701c84`, `9c0d6bb4`) reported unobserved CI/no mailbox because no yielded binding was armed. Retrospective consulted the earlier successful DD-201 occurrences, verified `ci.yml` push selection/runtime, and started the documented single yielded stream `watch-x4nPTj` before completion publication. Managed resume accepted `9c0d6bb4` without another push and recovered that owner; repair `4a50e086` reused it.
  - Observed effect: initial notification coverage was absent; recovered observation delivered owned retry-assertion failures and enabled a bounded red/green repair before handoff. Completion CI remains pending at this record write.
  - Inference: the startup/reuse route works with available primitives; the initial interpretation of managed-versus-stream guidance was too restrictive. Document one clear route and consult successful existing evidence before declaring coverage unavailable. No guidance/runtime change is authorized here.

- Execution: `SEED-082#dashboard-development-and-production` / plan 213, first related implementation commit `4e076e11ea761a98f8c401e69102228cb8f0b693`
  - Timestamp: unknown (2026-10-02 four slice publications and automatic review)
  - Tool: Codex
  - Open Dough release: 0.3.54 (unchanged installed VERSION at established start `4fe8c7a4`)
  - Evidence: managed receipts for `4e076e11`, `0a018138`, `ea031d5b` and `e5fe8a7c` accepted story-branch publication with CI unobserved and no mailbox. Review consulted DD-201's successful startup/reuse occurrences, verified `ci.yml` push selection/runtime, then execution recovery armed the documented yielded stream `watch-HB2kLV` (cell105/session35081/PID79031). Managed resume recovered that owner, registered `e5fe8a7c` without another push and delivered its existing startup-test teardown failure. Repair `0e88f016` reused the observer.
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

## DD-202 — Interrupted proof commands left preview servers outside the cleanup check

Manually stopped browser proof commands left their preview children alive. A process-name check for the disposable fixture missed them because their argv named the shared dashboard dist directory rather than that fixture.

Follow-up: Open, unqueued. Retain owned server process identities through cancellation and verify child exit; a matching-name absence does not establish resource cleanup. This review authorizes no guidance change.

### Occurrences

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: unknown (2026-10-01 root proof acceptance after native waiting return)
  - Tool: Codex
  - Open Dough release: unknown; observation fixture installed real 0.3.51
  - Evidence: implementation return claimed no fixture server remained after interrupted commands. Root ps found PIDs28944/59938; lsof matched ports64224/64536 exactly to native harness server-start records. Root sent SIGTERM only to those owned preview servers and confirmed both absent with a finite local wait. Attachment PIDs29121/60036/77698 were also independently absent. [Cleanup account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/WAITING.md#command-outcomes-and-cleanup).
  - Observed effect: two orphan preview servers survived the returned cleanup check; root closed them before acceptance/disposal. Shared daemon and CI observer were untouched.
  - Inference: subprocess cancellation bypassed normal finally cleanup; the report's name-based process filter hid the remaining children. No general native PTY-exit claim follows from this server cleanup.

## DD-203 — An unconditional native UI Escape interrupted a restored question

Former branch-local code: DD-201 at `fff70ca7d0290331878353c7d371f1eecb0f1232:DearDough.md`; reassigned during integration to preserve the independently published DD-201.

The observation driver assumed Enter always opened the hook-review modal, then sent Escape without inspecting the active native view. On saved-session reconnect the pending question took the foreground, so Escape interrupted the real blocking tool.

Follow-up: Open, unqueued. Inspect the current native modal before sending state-changing keys, and verify all questions are answered before expecting completion. This review authorizes no guidance change.

### Occurrences

- Execution: `SEED-052#use-codex-from-dashboard` / plan 192, first related increment `22ff91b009fb90311cf71230e63f760e0fefdedb`
  - Timestamp: 2026-10-01T06:55:55.870Z
  - Tool: Codex
  - Open Dough release: unknown; observation fixture installed real 0.3.51
  - Evidence: [native waiting account](https://github.com/terryyin/open-dough/blob/6dc872978d0ca93fc17a52f9893a6f2a55850b1e/.planning/slice-plans/192-complete-codex-dashboard-sessions/WAITING.md#actual-question-dashboard-state-and-answer); same-ID question screenshot at06:55:55.867Z, Escape immediately afterward, function_call_output aborted by user after79.1s and native turn01a0f63d-5eeb-7181-bc66-1d89a09d1771 interrupted. Corrected same-ID continuation01a0f640-5bd5-77e3-bcb3-acc785409cfa asked one tone question, received actual CLI answer and completed at06:57:19.411Z. Raw passing fixture was inspected before ADR0005 disposal; vendor history retained.
  - Observed effect: one additional substantive continuation was needed; the original input was not blindly replayed. Whole native thread reported77,035 tokens (63,104 cached input), not a measured charge or an isolated interruption cost.
  - Inference: the first assessor also expected completion after only one of two questions. Neither harness error establishes a product detach failure.

## DD-204 — The Codex native harness's `--ephemeral` broke every case whose agent spawns a subagent

Former branch-local code: DD-201; reassigned after concurrent trunk allocation of DD-201.

`tests/support/native-codex.sh` ran `codex exec --ephemeral`; Codex then cannot load a parent thread's context for a spawned subagent, so cases where the installed guidance delegates (queued-story execution, an established start) stop before any change. Credential-free substitutes cannot show this.

Follow-up: Open, unqueued. Removed in `671b8ff4`; rollouts now land in the developer's Codex home.

### Occurrences
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5`
  - Timestamp: 2026-10-01T05:44:33Z and 2026-10-01T05:45:48Z (native runs `codex/publication/one-shot-auto-land-blocked/20261001T054433-40a9`, `codex/publication/one-shot-established/20261001T054548-43f9`)
  - Tool: Claude Code (coordinator); failing host Codex (codex-cli 0.159.3)
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `0d565a9e`; base 0.3.51
  - Evidence: both stderr logs show `collab spawn failed: … failed to load model context for thread …: no rollout found for thread id`; each agent stopped truthfully with nothing committed. After removing `--ephemeral`, reruns `20261001T071413-68aa` and `20261001T071814-36b1` passed as FRESH PROOF with no spawn error. Codex cases whose agents did not delegate passed in the first batch.
  - Observed effect: two inconclusive paid sessions, a developer decision, a harness change, and two paid reruns.
  - Inference: Earlier archived Codex evidence may have passed only for cases without delegation; a harness setting that disables host features belongs in a credential-free check of the adapter's command line where possible.

## DD-205 — Developer-requested paid native runs needed a detached one-command launcher

Former branch-local code: DD-202; reassigned after concurrent trunk allocation of DD-202.

Paid native acceptance takes minutes per case. The coordinator's first background launch was refused by the host's auto-mode classifier; the developer's `!` command stopped at the prompt's 120-second foreground limit and moved to a 30-minute background cap, and long command lines were hard to copy from the session window. A short script that detached the batch (`nohup … &`) and logged to one file, followed with a log monitor, ran 27 sessions without further intervention once the developer explicitly authorized the coordinator.

Follow-up: Open, unqueued. Practice worth keeping; no guidance change authorized.

### Occurrences
- Execution: `SEED-066#composable-lightweight-session-options` / plan 191, first related implementation commit `ef745cb5`
  - Timestamp: unknown (slice 3 probe after `d6301c9e` at 2026-10-01T10:20:17+08:00; slice 8 batch logged 05:2x–06:19:35Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `0d565a9e`; base 0.3.51
  - Evidence: the classifier denial ("Create Unsafe Agents") of the coordinator's backgrounded `tests/git-publication-native.sh --native claude` after the developer asked "could you please do it?"; the developer's reply "this window is weird. I cannot copy"; the `! bash …/probe.sh` run moved to background at 120s; after "I authorize you to do them", `probe8.sh` detached the 27-session batch and a `tail -F | grep` monitor reported each verdict.
  - Observed effect: one stopped background run, an extra developer round trip, and a second script; afterwards no polling or babysitting.
  - Inference: Qualified. Host permission behavior is outside Open Dough; the detached launcher plus monitor is the reusable part.

## DD-206 — A plan left a decisive browser-delivery premise open for the developer though it was locally observable

The plan's decisive premise "real browsers deliver ⌘Esc to the page" was marked open and assigned to a first probe slice in which the developer would press keys, because Playwright's CDP input bypasses OS and browser reservations. Execution settled it in minutes without the developer: real keystrokes sent through macOS System Events (`osascript … key code 53 using {command down}`) to a scratch page logging capture-phase keydowns. Both Chrome and Safari withheld ⌘Esc. The story's chosen shortcut was already refined and planned around it, so execution had to stop for a shortcut decision.

Follow-up: Open, unqueued. Practice worth keeping: OS-level synthetic keystrokes observe browser key reservations that CDP-driven tests cannot.

### Occurrences
- Execution: `SEED-071#session-panel-header-controls` / plan 197, first related implementation commit `4699ad18`
  - Timestamp: 2026-10-01T16:44:22+08:00 (probe recorded in `a98f7e5f`; plan written in `74639b9d` at 2026-10-01T16:36:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `9ebc123e`; base 0.3.51
  - Evidence: plan 197 Decisive premises row "Real browsers deliver ⌘Esc … **Open: slice 1 probe**"; slice 1 result in `a98f7e5f`; developer chose ⌘⇧Esc via a coordinator question with probed alternatives.
  - Observed effect: one mid-execution developer decision and a story/plan shortcut rewrite after refinement and planning had both fixed ⌘Esc.
  - Inference: Qualified. Running the same probe during refinement or planning would have let the developer choose the shortcut with the rest of the story; whether planning agents may drive OS keystrokes depends on host permission.

## DD-207 — A preparation edit truncated a North Star bullet and left a duplicated fragment, and nothing caught it

Preparation's North Star rewrite cut the "Sessions are the machine's" bullet off mid-sentence ("cards, Recent sessions,Each host normalizes…"). It also left a dangling copy of the paragraph's ending (" registry or assuming every conversation has an assignment. Follow Accepted ADRs…") after the new paragraph. The commit passed formatting and lint, and the damage stayed on trunk until an execution subagent noticed it while reading the topic.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: 2026-10-01T17:42:26+08:00 (commit time of `d91886ab`, the preparation edit)
  - Tool: unknown for the preparation edit (commit author `bas-chan`, trailer Claude Opus 5.5); found and repaired under Claude Code
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: `git show d91886ab -- .planning/NORTH-STAR.md`; the slice 1 implementation hand-back reported the damage; repaired in `c63a1c0b`.
  - Observed effect: published direction text was unreadable for one bullet across one release-preparation and one Take; no work depended on the damaged sentence.
  - Inference: Qualified. A scripted splice probably replaced a range ending at the wrong anchor. Prose checks cannot catch it, but rereading the diff of a direction edit would have.

## DD-208 — A selection checkpoint offered ranked items without proposing the stories they would become

Slice 4's checkpoint asked Terry to multi-select from 16 ranked review items (three questions of four options). Terry did not answer it and asked instead how many stories would be created and how the items would group. Terry approved the four-story grouping the coordinator then proposed, in one reply.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: unknown (2026-10-01, between `e07fdcb9` at 18:35:50 and `c63a1c0b` at 18:49:04 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: coordinator conversation: the rejected `AskUserQuestion` with item-level options; Terry's question "how many stories are we going to create … they can be grouped into a few groups, right?"; then "yes, go ahead with those four".
  - Observed effect: one extra round trip at a human checkpoint.
  - Inference: Qualified. When a checkpoint turns selected findings into stories, a recommendation that already proposes the story grouping matches what Terry decides on.

## DD-209 — A fresh citation verifier per review slice corrected claims the review's author had marked confirmed

Each review slice's proof was an independent agent that had not seen the review. It re-opened every cited line and judged each claim. After `main` advanced mid-execution, it also rechecked the whole review at the merged revision.

Follow-up: Practice worth keeping; no change requested.

### Occurrences
- Execution: `SEED-069#review-dashboard-multi-tool-architecture` / plan 200, first related implementation commit `47ef4368`
  - Timestamp: unknown (2026-10-01, between `47ef4368` at 18:04 and `669294b0` +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance VERSION 0.3.51 at claim `6ac22ba8`
  - Evidence: slice 1 verifier: R1-2 and I3-3 partly wrong, two lines asserting Cursor behavior, and one traced-path error. Slice 2 verifier: T6-1, R6-1 and ranking item 1 partly wrong, a stale SEED-073 limitation, and line drift after merge `1cdd476c`. Recorded in `81c3b85b:.planning/slice-plans/200-review-dashboard-multi-tool-architecture/PLAN.md` (Execution record).
  - Observed effect: about a dozen corrections before Terry chose from the ranking; none changed a recommendation's priority.
  - Inference: Qualified. The cost was about 114k and 165k subagent tokens; the corrections mainly protected the evidence later copied into SEED-075's stories.


## DD-210 — Projecting tool output discarded a running formatter's continuation identity

The coordinator printed only `exec_command` output from a yielded formatting call, losing the session ID needed to observe its terminal result. The process finished, but completion could not be established from the retained result. Formatting was repeated with the full returned object, then its terminal success was observed before commit.

Follow-up: Open, unqueued. Preserve yielded tool result objects or their continuation identities before narrowing output; current verification-ownership guidance already requires terminal results. No guidance change is authorized by this observation.

### Occurrences
- Execution: `SEED-075#launch-gates-every-host` / plan 204, first related implementation commit `1dd48501ec3a43cc9dcbbfca937653182fe77b95`
  - Timestamp: unknown (2026-10-01, slice 1 formatting)
  - Tool: Codex
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at established start `dbc55abe`)
  - Evidence: coordinator conversation's first formatter call used `text((await tools.exec_command(...)).output)` and retained no session ID; read-only `ps` found formatter PID 83649; a finite wait established process exit only. Repeated `npm run format` returned PTY 26420, whose terminal exit 0 was observed before the `1dd48501` agent commit. The proof/format record is recoverable at `17488854ad344b860b9a1a6239942ece77e5a4e5:.planning/slice-plans/204-launch-gates-every-host/PLAN.md`.
  - Observed effect: one unnecessary full formatter invocation and process-exit check; no failed formatting result was presented as passing, and publication waited for verified success.
  - Inference: this is a coordinator evidence-handling error, not a demonstrated gap in Open Dough's existing command-ownership instruction.

## DD-211 — A coordinator's paraphrase in a delegation softened a plan promise

Former branch-local code: DD-206; reassigned after concurrent trunk allocation of DD-206.

The delegation restated a slice's safe-stop promise in looser words, and the implementer delivered the looser reading instead of the plan's.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-072#responsive-session-start-reconciliation` / plan 192, first related implementation commit `109fd76b`
  - Timestamp: 2026-10-01T19:50:26+08:00 (commit time of `191721a0`; the deviation was reported just before)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance last updated by `e6a7106c` (base v0.3.51)
  - Evidence: plan 192 slice 3 says "Uncertain publication stays protected pending workflow-owned verification" and its safe stop says "interrupted outcomes remain protected"; the coordinator's slice 3 brief said "interrupted outcomes remain protected (or show the existing static explanation)". The implementer left `unknown` publication unprotected, citing that parenthesis, and asked for confirmation.
  - Observed effect: the coordinator accepted it as an interim and moved that protection into slice 4 through a plan edit; slice 4 delivered it, with no rework of slice 3 code.
  - Inference: Qualified. Quoting the plan's mapped promise verbatim, not a summary, would have kept the stricter reading; the harm stayed small because the next slice owned the same outcome.

## DD-212 — Shared readiness caller analysis missed queued escalation continuation

Changing the shared readiness reader aligned its normal startup consumers but left a queued one-shot escalation test asserting refusal on historical digest mismatch. The implementation report excluded one-shot starts as lacking the assessment fact; that exclusion did not account for the normal continuation invoked after escalation. The focused proof selected startup publication cases, not this reached continuation caller, and the coordinator accepted the exclusion.

Follow-up: Open, unqueued. Trace shared-operation consumers through continuation and recovery paths before retaining a mode-wide unaffected exclusion; require evidence at the consuming boundary. This finding authorizes no guidance change.

### Occurrences
- Execution: `SEED-080#readiness-change-indicator` / plan 209, first related implementation commit `dc1f5e0dd0ebeef5ceff0ee80de35a411f72036c`
  - Timestamp: 2026-10-02T00:49:32Z (CI failure log)
  - Tool: Codex
  - Open Dough release: 0.3.52
  - Evidence: original implementation return stated admission/one-shot starts lack the assessment fact. CI run `36947799549`, attempt 1, `test (3/3)` at integrated `e0f41806` failed `one-shot-escalation-queued.test.mjs:107`: expected `source-refused`, actual `existing` with `changedSinceReview: true`. The focused runner reproduced that exact failure; updated assertions passed with the queued and startup-refusal suites.
  - Observed effect: trunk CI caught an affected consuming assertion omitted from accepted focused proof. Repair changed only the test; Ready continuation, ownership, genuine Not ready refusal and authorization safeguards stayed intact.
  - Inference: a mode-level exemption hid a reached shared consumer. The green initial startup suites were valid evidence for their boundaries, not for this additional continuation path.

## DD-213 — A plan's consumer premise for an admission rule swept function callers, missing specs that relaunch the same story

Plan 206 recorded that callers of the rules slice 2 changed were "only dashboard code and specs … Specs reach them only through the HTTP boundary and pages", from a grep of function names. The new rule refused a fresh start after an uncertain outcome, and 13 tests in 7 specs relaunched the same story over raw HTTP to resume it; the plan treated two of those specs as wording-only consumers for slice 3.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-072#durable-startup-reconciliation` / plan 206, first related implementation commit `3d82d365`
  - Timestamp: 2026-10-02T08:43:15+08:00 (commit time of slice 2, `a6fa2461`; the failures were found before it)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.52 (installed `dough-update/VERSION` at claim `76a298b1`)
  - Evidence: plan 206 premise row "Callers of the rules slice 2 changes are only dashboard code and specs"; slice 2's implementer ran the full dashboard suite, saw 13 failures in `agent-launch-boundary`, `-codex-reconciliation`, `-codex-recovery`, `-preparation-codex-recovery`, `-preparation-resume`, `-start-codex-recovery`, `-start-resume`, and converted them to resume through continuation, reporting the premise gap for the coordinator's judgment (plan 206 slice 2 Learning).
  - Observed effect: no CI failure or rework; the slice's implementer made and reported a consumer-alignment decision the plan had not anticipated, and the coordinator accepted it against the plan's own decision.
  - Inference: Qualified. A premise about who an admission rule reaches is a behavior premise: the consumers are tests that exercise the refused sequence, found by searching for repeated launches of one story, not by function names. Running the whole dashboard suite inside the slice (about 4.5 minutes) caught it before publication, consistent with ODF-150's inference.


## DD-214 — A wrap-up applied a documentation correction and also queued it as a follow-up story

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

## DD-215 — An interrupted refactor agent went on to commit and push its slice

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

## DD-216 — Literal proof commands printed no pass counts, so agents reran passing suites

The plan's focused Playwright commands used the default reporter. Under the agents' shell, a passing run printed no summary, and two agents reran the same selection with `--reporter` just to report counts.

Follow-up: Open, unqueued.

### Occurrences
- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: unknown (slice 1 implementation and refactor, between the claim at 2026-10-02T16:31:54+08:00 and `7053bc62` at 16:42:11+08:00)
  - Tool: Cursor (delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: plan 217 slice 1 proof is `env -u NO_COLOR npm run test:dashboard -- … --workers=2` with no reporter. The slice 1 implementer reported "The run exited 0 but printed no summary, so I'm rerunning with the list reporter" (41 passed). The slice 1 refactor agent reported "The test run exited 0 but printed no pass count, so I'm rerunning it with the line reporter" (30 passed). From slice 2 the coordinator added `--reporter=line` to delegated commands, and there were no further count reruns.
  - Observed effect: two extra Playwright runs of 30–41 tests each.
  - Inference: Qualified. The cause of the empty summary (reporter selection under a non-TTY shell, or output projection) was not diagnosed.

## DD-217 — Execution started on a red trunk and spent CI triage on a failure it did not own

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

## DD-218 — A semantic-feedback story acquired an unnecessary native speech gate

Plan 219 required actual first-failure screen-reader speech observation. Execution followed that gate, but the developer clarified that speech was not a requirement. Browser status exposure and the real failure/retry behavior were the accepted proof.

Follow-up: Open, unqueued. Proposal: distinguish semantic live-status requirements from explicitly requested spoken-output proof when refining and planning accessibility work.

### Occurrences
- Execution: `SEED-052#announce-record-deletion-first-time` / plan 219, first related implementation commit `c70c09f8e029d495ee100a50153012661fe06e87`
  - Timestamp: unknown (session date 2026-10-02; precise probe and clarification times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at claim `d41fc577`)
  - Evidence: `2e26eda0:.planning/slice-plans/219-deletion-failure-feedback/PLAN.md` native observation prerequisite; `c70c09f8:.planning/slice-plans/219-deletion-failure-feedback/PLAN.md`, Execution context, records the isolated real EACCES probe, VoiceOver setup, unavailable speech/caption observation, developer observation request, and subsequent clarification. Conversation: “We don't have a requirement for speech”.
  - Observed effect: a native fixture/probe and a delivery stop pending developer observation, followed by removal of the speech prerequisite. Browser failure/retry proof remained required and passed.
  - Inference: Qualified. The execution complied with its initial plan; the later clarification shows a mismatch between that proof gate and the developer's intended requirement. No measured time or token cost is available.

## DD-219 — An unconditional file-size check stopped a refactor with no conceptual candidate

The independent refactor pass found no warranted conceptual change, but stopped because three changed files exceeded the generic 250-line limit. Satisfying that rule would have split unrelated seed stories or existing test journeys beyond the selected deletion-feedback slice.

Follow-up: Open, unqueued. Proposal: make file-size guidance and the conceptual scope gate's precedence explicit, so a pass can report existing oversized files without requiring unrelated decomposition.

### Occurrences
- Execution: `SEED-052#announce-record-deletion-first-time` / plan 219, first related implementation commit `c70c09f8e029d495ee100a50153012661fe06e87`
  - Timestamp: unknown (session date 2026-10-02; precise hand-back times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at claim `d41fc577`)
  - Evidence: delegated `refactor_deletion` initial Jidoka hand-back and follow-up `## REFACTOR COMPLETE`; `c70c09f8:.planning/slice-plans/219-deletion-failure-feedback/PLAN.md`, Execution context, records seed 431 lines, card-delete spec 283, Recent-delete spec 294, and the coordinator's scoped exception with the numeric guideline explicitly unsatisfied.
  - Observed effect: an extra coordinator decision and agent follow-up; no refactor edits or repeated tests. No human waiver of the numeric limit was claimed.
  - Inference: Qualified. This is a scope/precedence conflict, distinct from DD-192's cost of mandatory no-edit refactor passes. The broader value of smaller files was not assessed here.
