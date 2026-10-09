# Finding names and current follow-up

Reviewed 2026-10-09 under the retrospective-findings runbook. Retention is a
priority decision, not a claim that discarded problems were fixed or cannot recur.
**Queued** entries name selected follow-up; **delivered, unreleased** entries await a containing release. **Open, unqueued** entries retain
material unresolved consequences; they are not an active implementation commitment.
Released responses under observation are in [the watch list](near-term-watch-list.md).
Codes are permanent; highest allocated is ODF-222. Never reuse a removed code.

## Retained evidence

Each finding keeps its meaning, disposition and linked project evidence. Entries
removed on 2026-10-03 are recoverable at
`99292557:docs/maintainer/finding-names.md`; the earlier pre-trim catalog is at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:docs/maintainer/finding-names.md`.
Count a project/execution once; reports, renamed codes and related symptoms do
not add occurrences. Unknown releases cannot establish post-fix recurrence.

Source logs were shortened on 2026-10-09 after their missing evidence was
retained below. Source excerpts preserve supplied timestamps, releases, tools,
observations and qualified inferences; the live Follow-up above each excerpt
is the current disposition. Related reports do not add an execution count.

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs
A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting).
- **Response / limit:** No lost-agent protocol in delegation guidance. Doughnut plan 132 (0.3.24) reported the same; its log entry was pruned on 2026-10-03.

- **Additional evidence:** Open Dough plan 246 / `0ae01bd4`, 2026-10-05, Claude Code / 0.3.56: a 600-second watchdog stopped an implementation agent with 17 edited files and no report; owned stash/restore and resuming the same agent recovered them. This is the third Open Dough execution with this mechanism; no work was lost.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-059 — Delegated refactor pass stalled after editing and before reporting](../../DearDough.md#odf-059--delegated-refactor-pass-stalled-after-editing-and-before-reporting).

Former local code: DD-057.

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.



- Execution: `SEED-021#identify-taken-work-owner` / plan 091, first related implementation commit `567f9b2` - Timestamp: unknown (after the CI repair return, before commit `ff33cb8` at 2026-09-24T17:46:32+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: 0.3.37 - Evidence: the CI-repair refactor agent's only notification said it had stopped with its own background work still running and had not reported; `ps` then showed no `node --test`, and `TaskStop` found no task. The coordinator kept waiting until the developer said "it seems to be staying here for quite some time." - Observed effect: repair `ff33cb8` shipped on the coordinator's own reruns without a refactor report (compare the earlier unreviewed ci repairs report); slice 6's refactor, told to run tests only in the foreground with timeouts, reported normally.
- Execution: `SEED-008#installed-wrap-up-command` / plan 146, first related implementation commit `aa4fd510`; Timestamp: unknown (2026-09-29, before `809b407d` 13:54:50+08:00); Tool: Claude Code; Model: claude-opus-5-5[1m]; Open Dough release: modified; revision `3ca0b8f9`; base 0.3.46. - Evidence: the refactor pass on the Story Branch native harness repair left two edits uncommitted and stopped (600 s stream watchdog) while "rerunning the accepted proof"; the coordinator reran that proof and delivered `809b407d`. Slice 3's implementation agent stalled the same way before writing anything and resumed through SendMessage. - Observed effect: two stalls in one execution, each costing a 10-minute wait and a coordinator-side recovery; no work lost.
- Execution: `SEED-104#confirm-mark-as-done` / plan 246, first related implementation commit `0ae01bd4` - Timestamp: unknown (after slice 2's delivery of `01f7d61f` at 2026-10-05T08:52:16+09:00, before CI repair `4f6d9f89` at 10:07:03+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: slice 3's implementation agent was terminated by the 600 s stream watchdog with 17 files edited and no report; a CI failure arrived at the same boundary, so the coordinator confirmed no Playwright run was live, parked the edits with `ci-repair-stash.mjs` (entry `97bf6485`), published repair `4f6d9f89`, restored them (`resumed`), and resumed the same agent through SendMessage with an instruction to bound long commands; it then returned a full report and slice 3 shipped as `8df2e91b`. - Observed effect: a 10-minute wait and one resume; no work lost. - Inference: Qualified. Third execution with a delegated-agent watchdog stall; the stall during a long broad Playwright run matches the earlier "rerunning the accepted proof" occurrence.
- Execution: `SEED-106#paged-dashboard-columns` / plan 225, first related implementation commit `a5e9e772` - Timestamp: unknown (after slice 1's delivery at 2026-10-06T07:36:58+09:00, before CI repair `d5a159d8` at 09:22:17+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: slice 2's implementation agent was terminated by the 600 s stream watchdog with 13 paths edited and no report; a CI failure for `a5e9e772` arrived at the same boundary. The coordinator parked the edits with `ci-repair-stash.mjs`, published the repair, restored them, and resumed the same agent with `SendMessage`, asking it to background whole-suite runs. - Observed effect: the resumed agent finished the slice from its own context; no work was lost or redone. - Inference: Qualified. A long silent whole-suite run under heavy load (first run 37 min) plausibly tripped the watchdog; resuming the stalled agent was cheaper than a fresh one here.

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises
Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [open-dough](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have), [open-dough](../../DearDough.md#odf-074--a-plan-left-a-decisive-browser-delivery-premise-open-for-the-developer-though-it-was-locally-observable), [pygardon](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time), [pygardon](../../../pygardon/DearDough.md#odf-074--shared-listing-analysis-overlooked-random-setups-explicit-history-rule), [doughnut](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-09): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Pygardon plans 307 (2026-10-03, stale deployment checkout), 313 (2026-10-04, a teardown assertion stayed green without the cancellation) and 315 (2026-10-05, an inspected command embedded credential-adjacent API fields); Open Dough plan 251 (2026-10-05, repaired product paths missed by spec-history inspection); Doughnut plan 005-recover-failed-transcription (2026-10-05, one catch also covered an excluded save failure). All report Claude Code / 0.3.56. Each observed effect and qualified inference remains in the linked source log; these are five distinct project/executions, not five additional failures for every symptom. New source mapping: [Doughnut / DD-209](../../../doughnut/DearDough.md#odf-074--a-slice-made-the-conversion-step-reject-on-failure-the-existing-catch-also-covered-a-save-the-story-excluded).

- **Last assessed (2026-10-09):** `3d148f25` and `ac02ee79` still have no containing tag. Later 0.3.57 executions are eligible evidence against the older 0.3.43/0.3.48 rules, not failures of this unreleased response; no age-based watch begins. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-074 — A ready plan named a validation command the backlog tool does not have](../../DearDough.md#odf-074--a-ready-plan-named-a-validation-command-the-backlog-tool-does-not-have).

Former local code: DD-121.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.



- Execution: SEED-044#verify-planning-premises (plan 115; first implementation commit `2c5ff71f`) - Timestamp: 2026-09-27T14:17:23+08:00 - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: modified; revision `6882aeb3` guidance at planning time - Evidence: plan 115 slice 2 text at `6882aeb3`; `product-backlog.mjs` usage lists add, place, take, complete, refresh, direction, adopt, merge, record-state, read-state - Observed effect: small detour and an equivalent-proof judgment at acceptance; no rework - Inference: same class as the unobserved planning premises this story addresses (catalog ODF-074); plan 115 was written before its own rule
- Execution: `SEED-093#expose-timing-races-locally` / plan 233, first related implementation commit `7b6ddcce` - Timestamp: 2026-10-03T18:08:39+08:00 (commit `0b5253cf` recording the contradicted premise; the slice 4 premise was settled before `14745390` at 18:18:30+08:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.54 (installed `dough-update/VERSION`) - Evidence: plan 233 premise rows. The slice 3 row was observed by reading spec lines 186-191 only, but `dashboard/server/hosts/cursor/launch.ts:130-140` writes `uncertain` before the client spawns, so the sleep was an absence window. The slice 4 row said "no event is known", but `agent-completion-early-recovery.spec.ts:30-53` already injects a `promises.mkdir` loader for the same lock. - Observed effect: slice 3's implementation agent stopped on the contradiction (about 77k subagent tokens, no code kept), and the slice closed as a plan record; slice 4's probe found the existing pattern quickly. No rework. - Inference: Qualified. Both premises described a sleep's purpose from the spec alone, without reading the state's write site or searching the suite for an existing observation of the same seam.
- Execution: `SEED-100#dashboard-specs-pass-unchanged-code` / plan 251, first related implementation commit `3a0ff700` - Timestamp: unknown (slices 3 and 4 returns, between `3a0ff700` at 2026-10-05T19:19:01+09:00 and `759f9134`) - Tool: Claude Code (delegated implementation agents) - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: plan 251's premise row "The two named specs still fail on a revision with every repair so far" was observed for the acceptance spec as "no commit to the spec since `7b6ddcce`". The slice 3 agent found the `:157` cause already repaired in the product by `9e3aff60` (after both failing revisions); the slice 4 agent found the path best fitting run 37245324663's trace already closed by `4f6d9f89`. Slice 2's 20 repetitions failed neither spec. The coordinator's slice 3 brief also named run 37245324663 as an acceptance failure; it failed only on the Cursor spec. - Observed effect: no rework; both agents spent part of their investigation (about 130k and 159k subagent tokens in total) separating repaired paths from open ones, and each still found and forced one open path (`launchRun.ts` reporting order; the paste-chip frame). - Inference: Qualified. A "still fails" premise was checked against the spec's history, not against product commits after the last failing revision on the paths the failure ran through.

**Source:** [open-dough / ODF-074 — A plan left a decisive browser-delivery premise open for the developer though it was locally observable](../../DearDough.md#odf-074--a-plan-left-a-decisive-browser-delivery-premise-open-for-the-developer-though-it-was-locally-observable).

Former local code: DD-206.

The plan's decisive premise "real browsers deliver ⌘Esc to the page" was marked open and assigned to a first probe slice in which the developer would press keys, because Playwright's CDP input bypasses OS and browser reservations. Execution settled it in minutes without the developer: real keystrokes sent through macOS System Events (`osascript … key code 53 using {command down}`) to a scratch page logging capture-phase keydowns. Both Chrome and Safari withheld ⌘Esc. The story's chosen shortcut was already refined and planned around it, so execution had to stop for a shortcut decision.



### Occurrences

- Execution: `SEED-071#session-panel-header-controls` / plan 197, first related implementation commit `4699ad18`
  - Timestamp: 2026-10-01T16:44:22+08:00 (probe recorded in `a98f7e5f`; plan written in `74639b9d` at 2026-10-01T16:36:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `9ebc123e`; base 0.3.51
  - Evidence: plan 197 Decisive premises row "Real browsers deliver ⌘Esc … **Open: slice 1 probe**"; slice 1 result in `a98f7e5f`; developer chose ⌘⇧Esc via a coordinator question with probed alternatives.
  - Observed effect: one mid-execution developer decision and a story/plan shortcut rewrite after refinement and planning had both fixed ⌘Esc.
  - Inference: Qualified. Running the same probe during refinement or planning would have let the developer choose the shortcut with the rest of the story; whether planning agents may drive OS keystrokes depends on host permission.

**Source:** [open-dough / ODF-074 — A plan gave a shared operation a story-specific effect without checking callers that use it with another meaning](../../DearDough.md#odf-074--a-plan-gave-a-shared-operation-a-story-specific-effect-without-checking-callers-that-use-it-with-another-meaning).

Former local code: DD-238.

### Occurrences

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: unknown (slice 1 implementation return, 2026-10-06)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: plan 253's PFE chose "Change `complete`" to write a done record. `dough-story-wrap-up/references/follow-up-disposition.md` and backlog maintenance also use `complete` to drop work ("Dropping does not claim that the follow-up was implemented"). The slice 1 return raised it as gap 1; the coordinator added `complete --dropped` in the same slice (`0f334e41`).
  - Observed effect: caught before delivery at the cost of one resumed implementation round; without it, dropped work would have shown as Recently done.
  - Inference: Qualified. The planning premise checked what `complete` holds, not every caller's meaning of it.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-074 — Plan statements about existing code and host state were not verified at planning time](../../../pygardon/DearDough.md#odf-074--plan-statements-about-existing-code-and-host-state-were-not-verified-at-planning-time).

Former local code: DD-061.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.



- Execution: `.planning/slice-plans/145-docker-space-cleanup/PLAN.md` at `c0c7bb2c7`; Timestamp: 2026-09-17T20:12:20+08:00; Tool: Claude Code; Model: claude-fable-5-1; Open Dough release: unknown.
- Execution: `.planning/slice-plans/285-strategy-verify-fixture-trading-days/PLAN.md` (recoverable at `68c09ace8`; Take `7e8a9128e`; first implementation commit `757b5d7cc`); Timestamp: unknown (2026-09-29, first slice 1 hand-back, before `757b5d7cc` at 2026-09-29T17:34:57+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: the plan's premise row "Broken trade expectations move only by bar index" explained the ad-hoc exit failure as "its entry date/price literal now names a different bar" without running the row-mapped literal; after mapping it still failed (`2020-12-31 close_below_ma_2d` vs `2021-01-29 nth_day_open`) because `history_from_date` sizes exit warmup in calendar days. Observed effect: one owner decision (entry moved to DCS1 2020-12-10; new story SEED-066#story-exit-warmup-trading-sessions) and one resumed implementation round (about 140 s). Inference: the throwaway re-date used during planning could have run the mapped literal once; the stop surfaced a real product defect rather than a wrong fixture edit.
- Execution: `.planning/slice-plans/287-e2e-typescript-checks/PLAN.md` (recoverable at `3688fe8c4`; Take `197be582b`; first implementation commit `513eb0118`); Timestamp: unknown (2026-09-29, slice 2 and slice 3 hand-backs before `27b7cac72` and `17f564266`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 2's key example 1 literal `const broken: number = 'x'` fails `lint:changed` on Biome `noUnusedVariables` before `tsc` runs, so TS2322 is never named (the implementer substituted `export const`); slice 3's decision that `scripts/prepare-worktree.sh` "no longer installs anything" missed that `deployment/automatic_deploy.py` runs a tag worktree's `scripts/prepare-worktree.sh` directly outside `nix develop` (implementer kept it delegating to `scripts/prepare-node-env.sh`). Observed effect: one extra `lint:changed` run and one in-scope decision change, no stop. Inference: small cost; running the demonstration literal once and grepping callers of the script while planning would have shown both.
- Execution: SEED-075#story-dependency-refresh (`00e506b23:.planning/slice-plans/182-dependency-refresh/PLAN.md`; Take `164181b68`; first implementation commit `40900d6b6`); Timestamp: unknown (2026-09-30, CI run `47fb24c7` on `40900d6b6`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.51. Evidence: the plan's premise row "Playwright and pnpm are pinned in several places" and slice 1's lint premise named Nix and the venv as the biome/ruff sources; CI's check image installs biome from `requirements/check-tools/package.json` (2.4.10), which rejected the `biome.json` migrated to 2.5.14 (repair `0ffd5e0ca`). Observed effect: one CI failure, a pause/stash/repair/restore cycle around the running slice 2 agent, and one repair commit. Inference: a dependency-pin inventory recalled from known files misses pins; a repository-wide search for each moved version literal before planning would have found it. The repair now ties that pin to the `biome.json` schema in a test.
- Execution: SEED-085#story-automatic-deployment-reuses-dev-shell (`.planning/slice-plans/307-automatic-deployment-rooted-dev-shell/PLAN.md`, removed at wrap-up, recoverable at `c9c4fd2c7`; Take `92418a7b4`; first implementation commit `cfceb8b6a`); Timestamp: 2026-10-03T18:45+08:00 (CI-machine inspection over ssh); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: slice 3's ready commands assumed the followed checkout `/Users/lia/git/pygardon` would "hold the published revision" and that both launch agents were installed; inspection showed the checkout on `main` 592 commits behind (`deployment/automatic_deploy.py` only fetches tags, so nothing ever advances it) and no `com.pygardon.production-engine-startup.plist`. Observed effect: one owner decision mid-execution (land, then fast-forward the checkout, which also moved the deploy agent's own code 592 commits) and a first-run shell download of 206 paths that the plan did not foresee. Inference: slice 1's owner-held probe covered plists and Nix settings but not the checkout's revision; one `git status -sb` in that probe would have surfaced the decision at planning time.
- Execution: `SEED-088#story-slice-proof-covers-wide-reach` (`.planning/slice-plans/313-slice-proof-covers-wide-reach/PLAN.md`, removed at wrap-up, recoverable at `f01d6c42b`; Take `40ecdd0f4`; first implementation commit `f4ed72bc1`); Timestamp: unknown (2026-10-04, first slice 1 hand-back, before `f4ed72bc1`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: slice 1 said to replace `assert len(tasks) == 5` and to "keep the existing assertion that every collected wait is cancelled after the lifespan exits" for Example 2. The file held `== 4`. With the Stooq wake cancel removed (`pass` at `service_lifecycle_shutdown.py:29`) the test stayed green, because the post-`with` assertions run after TestClient loop teardown, which cancels every leftover task. Observed effect: the coordinator returned the gap against the story's key example 2, which cost one more implementation round (about 255 s, 71k subagent tokens). The test now observes cancellation in a wrapper around the real `lifespan_context`. Inference: one planning-time mutation of the shutdown cancel would have shown that the kept assertion proves nothing.
- Execution: SEED-094#story-production-observations-without-round-trips (`.planning/slice-plans/315-production-observations-without-round-trips/PLAN.md`, removed at wrap-up, recoverable at `8c16de57e`; Take `2451f59c7`; first implementation commit `b33a4bd4f`); Timestamp: unknown (2026-10-05, slice 2 probe before `655f21ec2`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: the plan's premise row "`deployment.installation_status` prints no credential" was checked by reading `installed_status` and `main` only; the probe's output carried the ready API's settings body, including the broker account name and a password-configured flag. Observed effect: one owner decision and a settings commit (`655f21ec2`) dropping that rule after it was already on `main`. Inference: running the command once over a non-production installation, or reading the ready-API body it embeds, at planning time would have shown the field.
- Earlier occurrence details: 12 additional recorded rows in `27b607506abdfc53e62a20833ed499d8d781d0a5:DearDough.md`; these are historical evidence, not new occurrences.

**Source:** [pygardon / ODF-074 — Shared listing analysis overlooked random setup's explicit history rule](../../../pygardon/DearDough.md#odf-074--shared-listing-analysis-overlooked-random-setups-explicit-history-rule).

Former local code: DD-197.



Removing TFDC's historical candidate minimum also removed random setup's only enforcement of its public pre-scan history knob. Independent refactor review caught the changed contract before publication.

### Occurrences
- Execution: `SEED-078#story-delisted-reach-engine` (plan recoverable at `e3ce1aab5b30d30b9d16d2b12d6d30d3ec7d345e:.planning/slice-plans/296-delisted-evaluation/PLAN.md`; first implementation `619b40f037f45ef1c477df7385259f2d25e31346`).
  - Timestamp: unknown (2026-10-02, slice 4 before `6cee19444db1165b9576a519f7d7c1aa7a7d8234`).
  - Tool: Codex.
  - Open Dough release: unknown.
  - Evidence: slice-4 refactor stopped acceptance when tracing `min_history_bars` from the random public schema through composition and its Bernoulli detector showed no enforcement outside listing. The plan's slice-4 execution learning records the correction; native random 10-versus-9 history, session-cap and all-under refusal proof was added. Final 54-test replacement proof passed before delivery.
  - Observed effect: an additional implementation and independent review were needed; the published increment preserves the existing random history rule while admitting overlapping TFDC histories.
  - Inference: preparation traced the current-signal consumer but missed a different strategy's declared admission contract. Shared-policy changes need consumer contract analysis, not only caller enumeration.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-074 — A plan said the changed script had no test, and nobody searched for one before delivery, so CI caught the stale test](../../../doughnut/DearDough.md#odf-074--a-plan-said-the-changed-script-had-no-test-and-nobody-searched-for-one-before-delivery-so-ci-caught-the-stale-test).

Former local code: DD-126.
Former local code: DD-130.
Former local code: DD-134.
Former local code: DD-139.
Former local code: DD-147.
Former local code: DD-162.
Former local code: DD-167.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.



- Execution: SEED-043 story 1 / slice-plans/045-commit-gate-checks-committed-content / 574d61b52c; Timestamp: 2026-09-26T16:06:02+08:00 (CI step failure); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. - Evidence: plan "Current decisions" before 120753a097; CI run 36228685291 job "Other Unit Tests" failed `quality_changed.test` ("shared biome config selects every affected component": expected `pnpm frontend:lint`, got the install line after `ln` failed); repair 120753a097 updated and extended the test. - Observed effect: one red story-branch CI run, a stash/repair/restore cycle around slice 2, and two extra agents (repair ~49k and refactor ~48k subagent tokens). - Inference: a negative claim that code has no test needs a search of the test tree (here `grep -rl quality_changed scripts/test`) at planning or delegation; naming the stack skill for `scripts/` in the delegation would likely have surfaced it.
- Execution: SEED-059#story-3 / slice-plans/051-pdf-layout-from-bookmarks / 946e2a70e3; Timestamp: 2026-09-29 (slice 1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. - Evidence: plan *Decisive premises* row "Backend tests attach fake PDF bytes" (`grep -rn "0x25, 0x50"`); slice 1 refactor report item 2 (`BooksControllerTest`, `NotebookGitWebAttachmentDeleteControllerTest` back to HEAD). - Observed effect: two files changed and reverted within one slice; small cost. - Inference: the premise matched a symptom (fake bytes) rather than the path (attach callers). Related to the planning-premise family (DD-128, DD-137).
- Execution: SEED-059#story-14 / `.planning/slice-plans/055-epub-resume-tests-and-rendered-view/PLAN.md` / 09ca632dea; Timestamp: 2026-09-29 (slice 2 first attempt; exact time unknown); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. - Evidence: slice 2 Decision paragraph in plan 055 at 0e9048812c; `epubSpinePathMatches` suffix rule in `frontend/src/lib/book-reading/epubHrefMatch.ts`. - Observed effect: one implementation-agent round of about 57k tokens returned no change, and the owner was asked one question. The recommended option was accepted and no work was lost. - Inference: reading the two matching rules while planning the correction (a few minutes) would have found the difference and taken the decision to the owner before the plan. Qualified: one occurrence.
- Earlier occurrence details: 4 additional recorded rows in `8830c682704aac3bbb34bf9b1204da8feba042ca:DearDough.md`; these are historical evidence, not new occurrences.

**Source:** [doughnut / ODF-074 — A slice made the conversion step reject on failure; the existing catch also covered a save the story excluded](../../../doughnut/DearDough.md#odf-074--a-slice-made-the-conversion-step-reject-on-failure-the-existing-catch-also-covered-a-save-the-story-excluded).

Former local code: DD-209.

The plan's Goal excluded "a failure while saving the note after conversion
succeeded", but slice 1 said only that the conversion callback rejects on
failure. In the code, one `try` covered both the conversion request and the
note save, so the plain reading made a save failure reject too.

### Occurrences
- Execution: SEED-066#recover-failed-transcription / `212e428968:.planning/slice-plans/005-recover-failed-transcription/PLAN.md` / 9eb06ed0bd
  - Timestamp: unknown (slice 1, before commit 2026-10-05T14:48:15+09:00)
  - Tool: Claude Code
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: coordinator summary to the retrospective (subagent transcripts not supplied): the first implementation rejected for any failure, including a save failure after a good conversion; the coordinator returned the slice. Plan at 212e428968, slice 1: "The conversion callback rejects on failure instead of resolving `undefined`"; Decisive premises read `useNoteAudioProcessing.ts` for the toast, not for what its catch covered. Delivered code in 9eb06ed0bd adds an inner `try` around `appendDictatedText`; plan Learnings record "Only a failed conversion rejects".
  - Observed effect: one extra implementation round; the rejected version would have let audio already joined to the note be sent and joined again after a save failure.
  - Inference: when a slice changes what a catch does, the plan could name which excluded paths that catch also covers. Qualified: one occurrence; the coordinator caught it at acceptance.

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates
Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).
- **Response / limit:** Queued-start native acceptance completed; it does not prove the original standalone greeting case obeys preparation. That exact exercise remains unverified.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate](../../DearDough.md#odf-087--cheap-worktree-readiness-substitutes-can-pass-while-native-hosts-skip-the-gate).

Former local code: DD-089.

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.



- Execution: `a168a39f64a75c579a713674a5dda5ca46bed6ea:.planning/slice-plans/069-prepare-execution-worktree/PLAN.md`, first related implementation commit `6d7f7f30cea464f0ae2d6e269a3fd578d899390d` - Timestamp: 2026-09-21T09:08:13Z - Tool: Cursor - Model: Cursor Grok 4.6 - Open Dough release: modified; revision `98bfa80bb45a2a0156318230c75f7964ec0291e6`; base `0.3.27` - Evidence: Cursor fresh-node `/tmp/dough-execution-worktree-prep-native-069/cursor/fresh-node/20260921T090813-3f7f/` first assessment fail (empty commands, traces present); current assessor pass on observation.json. Codex/Claude fresh-node, Cursor failed-prep/reuse, Claude wrapper: complete streams, greeting written, no gate. Prompt asks for hello-ok and does not tell the agent to install. - Observed effect: cheap wrapper contracts passed; five native cases skipped the gate or continued after failed prep. Not retried until green. - Inference: Qualified. Distinct from DD-074 (guidance now exists) and the earlier assumed tool unavailability report (directory presence). Wording greps and a substitute actor cannot prove native follow-through when the user outcome does not need project commands.
- Execution: `SEED-008#durable-workspace-creation-fact` / plan 147, first related implementation commit `cb066559` - Timestamp: 2026-09-29T09:03:35+08:00 (native Claude Code `trunk-closure/owned-context`) - Tool: Claude Code (coordinator; hosts Claude, Codex, Cursor) - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `b8946e99`; base 0.3.46 - Evidence: six owned-context runs printed PASS; five ran the creation-record read, while Claude's closure removed the worktree after the containment check alone (no `for-each-ref`, no "Close or retain it" read). Accepted only after `3b1f8619` named the check and one rerun read the record. - Observed effect: the assessor, which observes only the retired outcome, passed a native agent that skipped the ownership gate; caught only by transcript inspection.
- Execution: `SEED-108#observe-promised-journey` / plan 258, first related implementation commit `3d148f25` - Timestamp: unknown - Tool: Codex - Open Dough release: 0.3.57 (installed VERSION at claim `e21713d7`) - Evidence: coordinator's 2026-10-08 execution record and `c1875574c4f0b5a6703d7a3e45e981e5e9cd9227:.planning/slice-plans/258-observe-promised-journey/PLAN.md` Execution context/Learnings: initial npm ci installed one package with dev dependencies omitted; direct Node 24.5 guidance tests passed and slice 1 was delegated before reading tests/README.md and tests/native-setup.md. Before first publication, checksum-verified Node 24.21.0, Bash 5, locked dev dependencies, browser/check setup and the repository test runner replaced those observations. - Observed effect: implementation began before the repository-pinned readiness check; accepted proof and publication used the corrected setup, and no product failure from the initial setup was observed. - Inference: Qualified. A substitute green command did not establish native checkout readiness; this occurrence supports the existing ODF-087 gap, without proving a guidance change effective.

<a id="odf-097"></a>

## ODF-097 — Publishing after a failed check
A failed formatter or verification result is visible but does not gate the next commit or publication step.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-097--a-failed-verification-result-was-collected-without-gating-the-next-action).
- **Response / limit:** No released guidance response. Three Pygardon executions on 0.3.52–0.3.54 each cost an extra publication. Open Dough's own rows are covered by its pre-commit hook (8a165806 / 0.3.52) and were pruned.

- **2026-10-09 additional mapping:** Open Dough / DD-251, Cursor plan 273 / 0.3.57 only: visible unresolved format/lint findings preceded refused commit attempts. No pipeline exit masking is established for this occurrence. The hook prevented publication; the failed step was not used as the prerequisite gate.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-097 — A failed format result was followed by a commit attempt](../../DearDough.md#odf-097--a-failed-format-result-was-followed-by-a-commit-attempt).

Former local code: DD-251 (plan 273 only).

The selective formatter (`npm run format`) printed "Format failed: unresolved findings or tool failures remain" with a lint error, but the coordinator piped its output through `grep`/`tail`, did not check its exit, and staged and committed; the check-only commit hook then refused the commit. Implementation and refactor agents are told not to run hook-owned lint, so such findings first surface at the coordinator's format step.



### Occurrences

- Execution: `SEED-118#recover-from-temporary-github-failures` / plan 273, first related implementation commit `2854d30b`
  - Timestamp: 2026-10-08T04:15:08+09:00 (commit time of repair `598cd884`, after refused omit-pattern attempts)
  - Tool: Cursor
  - Open Dough release: 0.3.57
  - Evidence: coordinator `npm run format` printed "Format failed: unresolved findings or tool failures remain" for `@typescript-eslint/no-unused-expressions` on a bare `progressSource;` omit in `dashboard/src/progressSource.ts`, and earlier `agent-commit.mjs` returned `commit-failed` for an unused `_stale` binding in the same CI-repair edit; the lint-clean `delete cleared.progressSource` form then committed as `598cd884`.
  - Observed effect: at least two refused or format-failed commit attempts on one CI repair before the published SHA.
  - Inference: Qualified. Same coordinator pattern as the rate-limit execution: format/lint findings surface only at wrap-up, and piping or continuing past a failed format invites a refused commit.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-097 — A failed verification result was collected without gating the next action](../../../pygardon/DearDough.md#odf-097--a-failed-verification-result-was-collected-without-gating-the-next-action).

Former local code: DD-200.

Former local code: DD-197 on execution branch at `b4925227927b0507708ba5970ca35e4e0269ca09`; reassigned during integration to preserve main’s independently published finding.

The coordinator committed after a staged whitespace failure before inspecting the returned exit status; a later agent started the full Python suite before inspecting failed normal lint.



- Execution: SEED-076#story-ruff-wider-rules (first implementation `818f6438a`); Timestamp: unknown (2026-10-02); Tool: Codex; Open Dough release: 0.3.52. Evidence: coordinator tool history returned staged-check exit 2 before committing `f4508ce7e`; whitespace-only `f93f9a609` repaired that note before publication. Slice 26’s agent history records the full Python run started before the normal-lint failure from the RUF100-only fix was inspected; accepted repairs are documented at `6c274be1e:.planning/slice-plans/294-ruff-wider-rules/validation-completion.md`. Observed effect: one avoidable repair commit and verification ordering churn; no uncorrected staged-whitespace result was published. Inference: unlike ODF-100’s masked pipeline status, these failures were visible but not used as control-flow gates. Require an inspected terminal success before a dependent action; later staging did this. Earlier execution history is only partially available, so recurrence and total cost are unmeasured.
- Execution: `SEED-078#story-sharadar-daily-update` (`.planning/slice-plans/296-sharadar-daily-update/PLAN.md`, removed at wrap-up, recoverable at `f93f2014b`; Take `bc246ad45`; first implementation commit `fed1b745b`); Timestamp: 2026-10-03T09:52:19+08:00 (slice 9 commit `d165cdb31`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: the coordinator's delivery command ran a heredoc plan edit whose anchor mismatched (`AssertionError`), then on following unchained lines staged, committed and published the code without the plan record; repaired by planning-only commit `28642038f`. Observed effect: one extra publication; no product defect. Inference: the plan-edit step was not an `&&`-gated prerequisite of staging, the same anchor-mismatch shape as ODF-100's plan-212 row.
- Execution: `SEED-069#story-consistent-classification` (`.planning/slice-plans/299-sharadar-classification/PLAN.md`, removed at wrap-up, recoverable at `c7c3544ac`; Take `5dce13078`; first implementation commit `650f1623e`); Timestamp: 2026-10-03T13:16:05+08:00 (slice 5 commit `400e5454f`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: the coordinator's delivery command ran a heredoc plan edit that raised `ValueError: substring not found` (it searched for the pre-edit status after replacing it), then on following unchained lines committed and published slice 5 without its plan record; repaired by planning-only commit `88ef3f44e`. Observed effect: one extra publication; no product defect. Inference: recurrence one day after the previous row in the same tool and model; the prior row's lesson was not applied.

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure
A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).
- **Response / limit:** Released guidance has no exit-status rule for piped checks. Open Dough's pre-commit hook (8a165806 / 0.3.52, exercised by plan 207) covers only this repository. Four Doughnut executions, latest 0.3.46 accepted a wrong typecheck result. Open Dough and Pygardon rows pruned.

- **2026-10-09 additional mappings:** Open Dough / DD-251 plans 264 and 271, both 0.3.57, explicitly mask formatter status with grep/tail. The local pre-commit hook prevents publication but does not remove the pipeline mechanism. Four historical Doughnut executions plus these two Open Dough executions are retained; unknown or related command-chain rows are not extra exact pipeline occurrences. DD-251 plan 273 has a visible failed format followed by commit attempts and is qualified separately as ODF-097.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-100 — The coordinator committed after the selective formatter reported unresolved lint findings](../../DearDough.md#odf-100--the-coordinator-committed-after-the-selective-formatter-reported-unresolved-lint-findings).

Former local code: DD-251 (plans 264 and 271 only).

The selective formatter (`npm run format`) printed "Format failed: unresolved findings or tool failures remain" with a lint error, but the coordinator piped its output through `grep`/`tail`, did not check its exit, and staged and committed; the check-only commit hook then refused the commit. Implementation and refactor agents are told not to run hook-owned lint, so such findings first surface at the coordinator's format step.



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



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-100 — Agents reported vue-tsc's exit code from a pipe into `tail`, so the coordinator had to rerun the typecheck](../../../doughnut/DearDough.md#odf-100--agents-reported-vue-tscs-exit-code-from-a-pipe-into-tail-so-the-coordinator-had-to-rerun-the-typecheck).

Former local code: DD-135.

A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.



- Execution: SEED-033#story-2 / `9c8aca9bbd:.planning/slice-plans/012-read-note-context/PLAN.md` / 99aa915e22; Timestamp: 2026-09-27T09:52:41+08:00 (slice 1 acceptance, before commit 99aa915e22) and 2026-09-27T10:16:30+08:00 (slice 5 refactor acceptance, before commit 3712c94363); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.42. - Evidence: slice 1 implementer return ("The exit code I captured was the pipe's final `tail`, not vue-tsc's own"); slice 5 refactor return (same remark); coordinator reruns `vue-tsc --noEmit >/dev/null 2>&1; echo $?` → 0 both times. Later delegation prompts that said "report its real exit code (don't pipe it into tail)" got a correct exit code. - Observed effect: two extra typecheck runs, about a minute each; no wrong result was accepted. - Inference: a delegated command whose pass/fail matters should be given with its exit-code capture spelled out, since agents tend to trim long output with `tail`. Qualified: small cost, and the agents reported the problem honestly.
- Execution: SEED-056#story-1 / `6e23621c23:.planning/slice-plans/014-recall-half-day-refresh/PLAN.md` / 4b39b579e0; Timestamp: 2026-09-29T11:08:48+08:00 (slice 1 commit after acceptance); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. - Evidence: slice 1 implementer and refactor agents ran `vue-tsc --noEmit 2>&1 | tail -15; echo EXIT $?` / `| tail -5` and reported the typecheck clean; CI run 36515871965 (job 109237884287, `pnpm -C frontend build`) failed on `tests/pages/RecallPage.dueQueue.spec.ts(71,5): error TS2322`; fixed in 171e696e06. The slice 2 agent then wrongly concluded a standalone `vue-tsc --noEmit` misses test files. - Observed effect: unlike earlier rows, a wrong result was accepted: one failed published CI job and one repair; the delegation prompt did not spell out exit-code capture. - Inference: the coordinator should require an unpiped exit code (or reuse `pnpm -C frontend build`) in every delegation that asks for the typecheck.
- Earlier occurrence details: 2 additional recorded rows in `8830c682704aac3bbb34bf9b1204da8feba042ca:DearDough.md`; these are historical evidence, not new occurrences.

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers
Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132), [pygardon](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number), [doughnut](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases).

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-106 — Two plans planned concurrently on different checkouts both took number 132](../../DearDough.md#odf-106--two-plans-planned-concurrently-on-different-checkouts-both-took-number-132).

Former local code: DD-155.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.



- Execution: `SEED-051#isolate-runner-settings` / plan 132, first related implementation commit `6b2ca78f` - Timestamp: 2026-09-27T18:36:56+08:00 (plan commit `77a8ca0f`; the sibling `132-restate-ci-pause-ownership` was committed at 18:32:11+08:00 in `9060ff71` on the execution branch and reached trunk via merge `54b5f025`) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: `.planning/slice-plans/132-isolate-runner-settings/` and `.planning/slice-plans/132-restate-ci-pause-ownership/` on trunk at `54b5f025` - Observed effect: the executor had to infer the intended plan (the one at the default checkout's HEAD when the session started) and could have Taken the other queued story - Inference: Qualified. Allocation from checkout-visible numbers cannot see another checkout's unpublished plan; the collision went unnoticed at merge because directory names differ



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-106 — Two concurrently planned quick plans received the same number](../../../pygardon/DearDough.md#odf-106--two-concurrently-planned-quick-plans-received-the-same-number).

Former local code: DD-095.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.



- Execution: `.planning/slice-plans/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: 2026-09-25T08:16:43+08:00 (second plan commit); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: both directories under `.planning/slice-plans/`; the coordinator resolved the number from the Taken entry, the TFDC worktree, and the latest commit message saying "add plan 190". Effect: three disambiguation calls and a stated assumption. Inference: plan-number allocation does not see a concurrent session's unpublished plan; publishing-time collision checks or a name-based argument would remove the ambiguity.
- Execution: `.planning/slice-plans/212-tfdc-verify-run-one-dispatch/PLAN.md` (first implementation commit `2e9e0a29a`); Timestamp: unknown (2026-09-27, retrospective plan written before commit `e1553fcc9`; collision seen at integration `78d0fa03c`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.41. Evidence: the retrospective chose `213-tfdc-verify-preserved-behavior-proof` from the execution worktree's `ls .planning/slice-plans` (highest 212); meanwhile `main` gained `213-production-engine-isolation` (`e9ff19eb5`); the story-branch merge carried both 213 plans until wrap-up renamed the correction to 214. Effect: one renumbering commit on trunk and a readiness re-record. Inference: a number taken from a long-lived execution worktree misses plans added on trunk since the Take; fetching trunk (or checking `origin/main`) before allocating would have avoided it.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-106 — Two concurrent executions allocated the same slice-plan number from different bases](../../../doughnut/DearDough.md#odf-106--two-concurrent-executions-allocated-the-same-slice-plan-number-from-different-bases).

Former local code: DD-118.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.



- Execution: slice-plans/037-share-backend-test-context / c7ea84e3a7; Timestamp: 2026-09-25T23:24:51+08:00 (plan commit 0f8709dfc1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: base 5c8bb75741 (22:09:45+08:00) lists plans 007, 035, 036; main's db601a2e42 (23:06:25+08:00) had already added plan `037-fold-picture-attach-step-into-upload`; 0f8709dfc1 added plan `037-share-backend-test-context`. Number 116 and 117 of this log were likewise allocated on main after the base, so this entry uses 118. - Observed effect: DearDough rows and `.planning/test-optimization-candidates.md` ("plan 037 cut the suite…") refer to "037" for two different executions once both plans are deleted at wrap-up; the retrospective's correction plan had to reword the candidate record. - Inference: the same stale-base allocation applies to DD numbers in this log, so a merge can also produce duplicate finding codes. Whether the coordinator fetched `origin/main` before planning is not recorded.

<a id="odf-107"></a>

## ODF-107 — Missed message consumers
A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.

- **Follow-up:** released in 0.3.57: SEED-095#prove-slices-through-consumers (story and plan recoverable at `56ed987b:.planning/seeds/SEED-095-slice-proof-through-consumers.md` and `56ed987b:.planning/slice-plans/237-prove-slices-through-consumers/PLAN.md`). **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).
- **Response / limit:** First released in 0.3.57: proof selection, delegation and acceptance now choose a slice's proof from every consumer of what it changes: retired literals and values found by search, callers relying on a changed default, every stand-in of a changed contract, page-wide specs, and the changed surface's suite when it fits the focused-check time; a plan's named proof is a minimum, and the coordinator neither accepts nor publishes while a known consumer, including one left for CI, is unrun. Before it: a changed-message consumer failed on 0.3.38 after f0f355c / 0.3.33.

- **Additional report:** Pygardon plan 309 / cda42fabf, 2026-10-03, Claude Code, guidance release unknown: a changed CI-deferral message left a current-state doc describing the old holders. Relationship to the earlier test-consumer mechanism is qualified, not a verified post-fix recurrence.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for cca9bff4 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.
- **Watch eligibility:** released, effectiveness unverified; watch start unknown. No supplied matching use of the fixed changed-message consumer selection establishes a start. Older and unknown-release reports do not demonstrate a 0.3.57 recurrence.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-107 — A changed user-visible message was accepted without checking its other consumers](../../../pygardon/DearDough.md#odf-107--a-changed-user-visible-message-was-accepted-without-checking-its-other-consumers).

Former local code: DD-097.

A changed user-visible error message is accepted using local unit/API proof while another test consumer of the old contract remains broken.



- Execution: `.planning/slice-plans/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: 2026-09-25T08:37:19+08:00 (`21ad862d6`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 3's fresh-worktree suite failed `test_diarize_audio_file_raises_when_pyannote_missing` (`match="pyannote.audio is required"`); the same test failed at `21ad862d6`; fixed in `625451dac`. Effect: a red CI revision on the story branch and one extra agent round. Inference: proof acceptance's shared-contract consumer check applied to messages would have been a single grep for the old text.
- Execution: `.planning/slice-plans/268-recognize-production-servers/PLAN.md` (Take `eb4c64507`; first implementation commit `0c873d186`); Timestamp: unknown (2026-09-28; failed revision `0c873d186`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. Evidence: slice 1 added an app-root provider that calls a new generated-API GET on `App` mount and updated two of the three generated-API mock factories; the return's consumer list named only those two, and the coordinator accepted it. CI run `a838adc1` failed on a Vitest unhandled rejection from `src/videoClippingApp.browser.test.tsx`, whose factory `createVideoClippingGeneratedMock` lacked the export; locally 6 of the 7 specs sharing that factory passed without it, and the browser spec exited 1. Repaired in `29c8383cc`. Effect: a red story-branch revision plus a stash, repair, refactor and publish cycle (two extra agents, about 117k subagent tokens). Inference: matched as the same shared-contract consumer gap; a grep for every `vi.mock` factory of `./generated` in App-mounting specs at acceptance would have found it.
- Execution: `SEED-085#story-ci-capacity-holders-correction` (`.planning/slice-plans/309-ci-capacity-holders-correction/PLAN.md`, removed at wrap-up, recoverable at `f5ffa5edf`; Take `c20639354`; first implementation commit `cda42fabf`); Timestamp: unknown (2026-10-03, slice 1 acceptance); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 changed the `/api/ci` deferral to name the build cache and containers; `docs/container-checks.md` ("names the engine's five largest images (by unique size) and volumes") still describes the old message at `3f2735c02`. Neither the plan's promise ownership, the implementation return's consumer list (`engine_holders`, `size_bytes`) nor acceptance named the doc. Effect: a stale current-state doc, caught at the retrospective and routed to story wrap-up. Inference: matched with some uncertainty — the consumer is documentation rather than a test; the same grep for the changed message's wording would have found it.
- Earlier occurrence details: 1 additional recorded rows in `27b607506abdfc53e62a20833ed499d8d781d0a5:DearDough.md`; these are historical evidence, not new occurrences.

<a id="odf-108"></a>

## ODF-108 — Lost failure tracebacks

A full proof run filters its output down to summaries, losing the failed assertion and stack needed to explain a failure.

- **Source:** [pygardon / DD-212](../../../pygardon/DearDough.md#odf-108--a-full-suite-proof-run-kept-only-summary-lines-losing-an-intermittent-failures-diagnostics).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Restores the same concrete issue recorded under Pygardon / DD-098 in `9ab3ca6e:docs/maintainer/finding-names.md`; current delegation requires a terminal result but does not retain diagnostic output. The 0.3.38-to-current relevant delegation/wrap-up history contains no demonstrated diagnostic-retention response. No failed fix is claimed. Current guidance assessed: `9de43de4`.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-108 — A full-suite proof run kept only summary lines, losing an intermittent failure's diagnostics](../../../pygardon/DearDough.md#odf-108--a-full-suite-proof-run-kept-only-summary-lines-losing-an-intermittent-failures-diagnostics).

Former local code: DD-212.

The coordinator piped full frontend runs through `grep` for the summary lines. When one run failed intermittently, its assertion message and stack were gone, so the failure's cause stays a hypothesis.

### Occurrences
- Execution: `SEED-086#story-frontend-tests-ignore-node-env` (`.planning/slice-plans/304-frontend-test-environment/PLAN.md`, removed at wrap-up, recoverable at `b09013ab1`; Take `37b5e9b34`; first implementation commit `7d2a50f45`)
  - Timestamp: unknown (2026-10-03, slice 1 full-suite proof).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: first `NODE_ENV=production … pnpm -C frontend test` run: 1 failed (`src/App.homeNavigation.test.tsx` › `explains disablement and links to settings on direct /ci while off`), 27 s versus the 15 s baseline. Three isolated reruns and a full rerun (log saved to the job directory) passed.
  - Observed effect: the failure was accepted as intermittent without its message; the plan records it as a learning.
  - Inference: writing full-suite output to a log file and grepping the file afterwards keeps the diagnostics for free. The spec reads `getByText('CI is off.')` right after `findByTestId('ci-page-title')`, which is a plausible race under load, but this is not confirmed.
- Execution: `SEED-089#story-frontend-tests-wait-on-events` (`.planning/slice-plans/314-frontend-tests-wait-on-events/PLAN.md`, removed at wrap-up, recoverable at `f9dc615`; Take `3499bae08`; first implementation commit `a7f8d4fe6`)
  - Timestamp: unknown (2026-10-06, slice 10 full-suite proof before `7ecf31fe6`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: the coordinator's first full `pnpm -C frontend test` run was piped through `grep` for summary and `FAIL` lines: 1 failed (`src/pages/AutoTradingSetupHistoryPage.spec.tsx` › `loads dropped setup signals into the history page`); three isolated reruns and two full reruns passed.
  - Observed effect: the assertion message was lost; the coordinator found the cause by reading the spec: it waited on the page title, which renders before the signals request answers, then read the row synchronously. Fixed in `7ecf31fe6` by awaiting the row.
  - Inference: recurrence of the summary-only capture; the suspected title-then-data race named in the first occurrence is confirmed here in another spec, so the same pattern likely exists elsewhere.

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays
A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [open-dough](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop), [open-dough](../../DearDough.md#odf-110--a-plans-consumer-premise-for-an-admission-rule-swept-function-callers-missing-specs-that-relaunch-the-same-story), [doughnut](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-09): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: 2c5ff71 / 0.3.43 and fcc29fad / 0.3.48 (SEED-059, closed at f50499c0) require observing a decisive premise through its consumer. Post-fix reports: Pygardon dependency refresh on 0.3.51, Open Dough plan 197 (base 0.3.51) and plan 206 (0.3.52). The response is not shown to resolve the class; reconsider it in triage (ranked third on 2026-10-03).

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Open Dough plans 239 (2026-10-03), 243 (2026-10-04), 248 (2026-10-05), and 254 (2026-10-06; a wrapper consumer reached a helper outside the named files) missed boundary/count/server/fixture consumers in premise searches; Doughnut plan 004-hold-worktree-e2e-stack (2026-10-05) proved reachability without the authenticated CLI example. All report Claude Code / 0.3.56; gaps were caught within slices. Source mappings: [Open Dough / DD-228, plan 248 only](../../DearDough.md#odf-110--a-removal-premise-swept-client-names-but-missed-server-and-fixture-consumers), [Doughnut / DD-207](../../../doughnut/DearDough.md#odf-110--a-plans-proof-for-a-cli-key-example-checked-only-that-the-server-answered-not-the-authenticated-step-the-example-needed). The unrelated plan 231 preparation-location report formerly sharing DD-228 was pruned as minor administrative friction.

- **Last assessed (2026-10-09):** `3d148f25` and `ac02ee79` still have no containing tag. Later 0.3.57 executions are eligible evidence against the older 0.3.43/0.3.48 rules, not failures of this unreleased response; no age-based watch begins. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-110 — A publisher-seam premise was observed by reading the seam, not the race it had to stop](../../DearDough.md#odf-110--a-publisher-seam-premise-was-observed-by-reading-the-seam-not-the-race-it-had-to-stop).

Former local code: DD-124.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.



- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; between re-bind `e8ce93b9` (2026-09-27T15:50:01+08:00) and slice 2 commit `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 premise table at `e8ce93b9` cites `execution-increment-publication.mjs:143-197`; slice 2 first return reported the merge-driver conflict; corrected premise row and North Star wording in `6f350f28` - Observed effect: one extra implementation round in slice 2 (an added pre-reconciliation fetch, then consolidation into `onFetchedTarget`) and a North Star correction - Inference: Qualified. A race premise is cheap to observe with the existing racing-push fixtures; reading the hook's call sites observed the seam, not the Take-then-replay journey
- Execution: `SEED-052#script-execution-preparation` / plan 178, first related implementation commit `821cd555` - Timestamp: 2026-09-30T14:50:39+08:00 (CI repair `f77110df`) - Tool: Claude Code - Model: claude-sonnet-5-5 - Open Dough release: unknown; installed guidance VERSION 0.3.47 - Evidence: plan 178's premise table row "New script files ship with the skill directory (no manifest to edit)", observed by `grep -rln execution-start-receipt` outside skill copies, marked yes for slice 1; CI failed on `tests/payload-declaration-links.sh` because `install.sh` `managed_files` declares each shipped script and reference; slice 1's own files were declared in `f77110df`, and the plan row now records the premise as wrong. - Observed effect: one failed CI run and one repair commit early in the execution. - Inference: Qualified. The premise was observed by searching for a name, not by the consuming operation (adding a shipped file and running the payload-declaration check), which is the same shape as this finding.
- Execution: `SEED-116#claude-done-rename` / plan 267, first related implementation commit `ed9a306e` - Timestamp: unknown; plan written before the claim `fef99b34`, risk surfaced by the retrospective after `bcb39b01` (2026-10-07T11:07:28+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: plan 267 premise row "its screen settles through `KeptClientScreen.settled()`" and decision "`screenText()` gives the first settled screen", read from `keptClientScreen.ts:107`, which only drains xterm's write queue; O1 typed after a fixed 4 s wait, not at the moment the dashboard types; the fake accepts input at once, so every spec passed; correction plan `c18d1d8a6c0124fb32f2b8aeecd880777439d272:.planning/slice-plans/270-claude-done-rename-readiness-correction/PLAN.md` - Observed effect: the delivered private attachment types at the first output byte of `claude attach`; the real-host risk was found only by the retrospective and needs a correction - Inference: Qualified. The premise was observed by reading a method name and a probe with different timing, not the dashboard's own typing journey on a real attach.
- Execution: `SEED-118#reduce-repeated-reads-across-tabs-and-deployments` / plan 275, first related implementation commit `9d8b5ed6` - Timestamp: unknown; plan written in `24c684b4` (2026-10-08T06:41:39+09:00), premise disproved in slice 1 before `9d8b5ed6` (2026-10-08T09:07:00+09:00) - Tool: Claude Code - Model: claude-fable-5-1 (planning) - Open Dough release: 0.3.57 (installed `dough-update/VERSION` at `24c684b4`) - Evidence: `24c684b4:.planning/slice-plans/275-retained-answers-across-processes/PLAN.md:76` decided the revision gate "already holds and is proved, not re-implemented" with no premise-table row observing it; slice 1 found pinned reads (`server/performedRead.ts`) accept any revision the browser names, so a logged-out second process answered a pinned read at A from the store; the gate was added as `server/heardRevisions.ts` and slice 2 removed in-memory caching of store hits that leaked past it (plan 275 slice 1-2 learnings) - Observed effect: slice 1 grew by a new gate mechanism and needed a coordinator scope ruling against the plan's decision; slice 2 found and fixed a second leak of the same rule; no CI failure - Inference: Qualified. The story's own example 5 (logged-out `gh`, no retained text) was the journey that disproved the premise; observing it through the boundary, rather than asserting it from how readers are created, would have caught it at planning.
- Execution: `SEED-088#review-selected-commits` / plan 277, first related implementation commit `18a159ee44760f09561fc6a6552aef51ded4ab13` - Timestamp: unknown (2026-10-08, slice 4 between `f5ebc9d0` and `bf1f48f0`) - Tool: Codex - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: `ed43663b:.planning/slice-plans/277-review-selected-commits/PLAN.md`, decisive premise restates the immediate pre-merge tree; `bf1f48f0` and that plan's `CONTEXT.md#slice-4-comparison-reassessment` retain the failed full-range browser assertion and real-Git probes. - Observed effect: the before-range tree restated cleanly although a selected integration conflicted, requiring another comparison round carrying the selected merges' existing points; renamed conflict paths needed a further red browser correction. - Inference: Qualified. The probe reached merge-tree but used a different starting point from the promised oldest-through-merge journey; no token-cost estimate is available.

**Source:** [open-dough / ODF-110 — A plan's consumer premise for an admission rule swept function callers, missing specs that relaunch the same story](../../DearDough.md#odf-110--a-plans-consumer-premise-for-an-admission-rule-swept-function-callers-missing-specs-that-relaunch-the-same-story).

Former local code: DD-213.

Plan 206 recorded that callers of the rules slice 2 changed were "only dashboard code and specs … Specs reach them only through the HTTP boundary and pages", from a grep of function names. The new rule refused a fresh start after an uncertain outcome, and 13 tests in 7 specs relaunched the same story over raw HTTP to resume it; the plan treated two of those specs as wording-only consumers for slice 3.



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

**Source:** [open-dough / ODF-110 — A removal premise swept client names but missed server and fixture consumers](../../DearDough.md#odf-110--a-removal-premise-swept-client-names-but-missed-server-and-fixture-consumers).

Former local code: DD-228.

A consumer premise for removing an attention-message path checked the client by name, missing the server response and a fixture that depended on that behavior.



### Occurrences

- Execution: `SEED-103#attention-message-on-story-card` / plan 248 (`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), first related implementation commit `0b3d3c78`
  - Timestamp: unknown (slice 3 implementation, before `58ea4c37` committed 2026-10-05T11:31:23+09:00)
  - Tool: Claude Code (delegated implementation agent)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: plan 248 premise "With an attention message, Read final report shows the message" was observed by reading `SessionResultPanel.tsx` and `sessionAccess.ts`; slice 3 found a third message branch in `server/sessionResultResponse.ts` and an admission exception in `server/sessionAdmission.ts`, and `story-panel-replacement.spec.ts`, which slice 3's proof (d) listed to "stay green", used a Claude attention message as its final report (plan 248 slice 3 learnings).
  - Observed effect: no CI failure or rework; slice 3's implementer removed the server branch and rebuilt the Story B fixture as a Codex record.
  - Inference: Qualified. Fourth occurrence of the class: the removed concept's consumers were swept on the client by name, missing the server answer and a fixture that relied on the removed behavior.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-110 — A readiness replay observed only the plan's named seam, not the rest of the slice's journey](../../../doughnut/DearDough.md#odf-110--a-readiness-replay-observed-only-the-plans-named-seam-not-the-rest-of-the-slices-journey).

Former local code: DD-109.
Former local code: DD-163.
Former local code: DD-168.
Former local code: DD-171.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.



- Execution: SEED-035 story 14 / slice-plans/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24, ~15:35+08:00 (replay and readiness record 47df9474c2), failure observed ~16:05+08:00 (slice 3 E2E); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: research prompt scoped to "pull" risks only; its report noted "the publish check went only as far as the pointer blob being committed"; slice 3 E2E then failed at the second `donut notebook publish` ("Attachment at <commit> must be a Git LFS pointer…", `cli/src/commands/notebook/notebookPublishLfsSelection.ts`); plan recorded the stop in 1e2ed84c35. - Observed effect: one human round-trip and a scope change (CLI change, option A) that preparation could have surfaced before Take. - Inference: when resolving a readiness concern by observation, replay the slice's full promised journey (here pull, then publish), not only the mechanism the concern names; the replay's own "not covered" list was the signal.
- Execution: SEED-059#story-6 / slice-plans/056-change-or-clear-reading-mark / 7c9935b2c2; Timestamp: 2026-09-29 (slice 2 implementation, between 17:53 and 18:12 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. - Evidence: plan *Decisive premises* "E2E setup and steps exist … Confirmed by grep"; slice 2 implementation report ("My first green run failed on `no book block should be marked` (found 1)"); new step "book block {string} should not be marked in the book layout" in 5cab6e8827. - Observed effect: one failed EPUB feature run and a new step; the plan's slice 2 behavior text was corrected during delivery. Small cost. - Inference: the premise checked that a step exists, not that it holds for the chosen fixture path. Related to DD-162 (a grep premise that did not reach the changed path).
- Execution: SEED-059#story-5 / slice-plans/053-pdf-smooth-scroll-after-choosing-block / 5989892325; Timestamp: 2026-09-29T21:45+08:00 through 22:15:52+08:00 (slice 1 implementation to commit); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. - Evidence: slice 1 hand-backs stopping at "the panel element never appears" (`panelShownBecauseScrolledPastContent` required `successor.id !== currentBlockId`) and then at "`read-from-here` covers `book-reading-mark-as-read`" (both overlays `absolute left-0 right-0 bottom-0 z-20`); owner question answered "Stack the two"; fix in 5989892325 (`ReadingOverlayDock.vue`). - Observed effect: two implementation stops, one owner decision on a scope the story had deferred (panel position), and slice 1 took about 30 minutes against a ~5-minute target. - Inference: reading `blockAwaitingConfirmation` and the overlay classes for the story's own "scroll past without marking" key example would have shown both at planning. Related to DD-162 and DD-163 (premises that stopped short of the consuming step).
- Execution: SEED-066#preserve-completed-speech / `2b34db5abb:.planning/slice-plans/001-keep-completed-speech/PLAN.md` / 4070f526bc; Timestamp: 2026-10-03T06:48:59Z (slice 2 stop) and 2026-10-03T07:41:26Z (slice 4 first run); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54 (execution-checkout VERSION, unchanged during execution). - Evidence: original plan premises confirmed the mid-speech path by reading `audioProcessingScheduler.ts` and `SRTProcessor` separately, never the multipart binding between them or a real SRT; slice 2 hand-back ("`isMidSpeech` form field ... never reaches the backend", `WebDataBinder` probe bound false); slice 4 run 1 on note 13730 wrote every tail because the real SRT ends with `\n\n\n`; slice 1's probe already logged every request and response (empty end timestamps) but was asked only for user-visible results. - Observed effect: one slice 2 stop and replan, one extra paid real-service run, a repair commit (1a9816737d) and a second primary-checkout restart. - Inference: asking the slice 1 probe to check the request flag, the returned end timestamp and the raw SRT shape against the plan's premises would likely have exposed both before slices 2–3, at no extra paid call. Qualified: one execution.
- Earlier occurrence details: 1 additional recorded rows in `8830c682704aac3bbb34bf9b1204da8feba042ca:DearDough.md`; these are historical evidence, not new occurrences.

**Source:** [doughnut / ODF-110 — A plan's proof for a CLI key example checked only that the server answered, not the authenticated step the example needed](../../../doughnut/DearDough.md#odf-110--a-plans-proof-for-a-cli-key-example-checked-only-that-the-server-answered-not-the-authenticated-step-the-example-needed).

Former local code: DD-207.

The story's key example (DD-161) had an agent point the CLI at the held app and attach a PDF. The plan's proof row asked only that a CLI command get an answer rather than "Donut service is not available", and slice 4's guidance named the base URL but no access-token route.

### Occurrences
- Execution: SEED-069#observe-branch-code-against-real-services / slice-plans/004-hold-worktree-e2e-stack / ee414fbdf1
  - Timestamp: 2026-10-05, between about 12:33 and 12:36 +09:00 (slice 4 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56
  - Evidence: `b7ae807ce5:.planning/slice-plans/004-hold-worktree-e2e-stack/PLAN.md` proof row "The CLI reaches the held app"; slice 4 implementer report listed "No CLI token route" as a gap after using curl `generate-token` by hand; the coordinator returned the slice once, and `1ae39ec64f` adds the token route to `.agents/agent-map.md`.
  - Observed effect: one extra implementation round (about 49 s); caught only by reading the return's named gaps against the key examples.
  - Inference: a proof row that checks reachability can pass while the example's real shape (an authenticated write) stays unguided. Qualified: one occurrence.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story keeps a not-ready assessment whose only reason was that dependency.

- **Response:** `8bb73be0` and `186ef150`, first released in 0.3.55, record blocking story dependencies and resolve them from completed suppliers.
- **Follow-up:** released response, effectiveness unverified; no watch start. Both clients now have 0.3.56 installed, but installation alone does not exercise supplier completion and consumer dependency resolution.
- **Source:** [Pygardon / DD-176](../../../pygardon/DearDough.md#odf-120--a-plan-held-not-ready-on-a-siblings-unintegrated-story-branch-with-nothing-to-reassess-it-when-that-branch-landed).
- **Last assessed:** 2026-10-06; all three logs checked. Reports are on 0.3.38–0.3.47 or unknown. Limit: whether the response covers a free-text not-ready reason, as opposed to a recorded dependency, is unverified.
- **Additional report:** Pygardon plan 301 / `578a568fb`, 2026-10-03, Claude Code / 0.3.54: a runnable slice waited about 22 minutes and needed two owner prompts before a poll was armed. This predates 0.3.55; it also leaves the relationship between an active wait trigger and completed dependency-state resolution unverified. Keep active rather than begin an unexercised age-based watch.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-120 — A plan held not-ready on a sibling's unintegrated story branch, with nothing to reassess it when that branch landed](../../../pygardon/DearDough.md#odf-120--a-plan-held-not-ready-on-a-siblings-unintegrated-story-branch-with-nothing-to-reassess-it-when-that-branch-landed).

Former local code: DD-176. Earlier occurrences were pruned in `0c2294236`.

A dependency lands but its dependent story retains a not-ready assessment whose only reason was that unmet dependency.



- Execution: `SEED-078#story-switch-daily-source` (plan `.planning/slice-plans/301-switch-daily-source/PLAN.md` at `1c043162e`; Take `7b6e26599`; first implementation commit `578a568fb`); Timestamp: 2026-10-03T14:23:42+08:00 (owner question); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: the owner approved running slices 6 and 8 while plans 299 and 300 were unlanded; the coordinator's turns at 13:21 and 14:31 ended with "once it lands, rerun `/dough-execute-plan`" and armed no watch; its last prerequisite fetch was 13:20, plan 300 closed on `main` at 14:01 (`1a65c3fff`); the owner asked at 14:23 "Is plan 300 already implemented? I cannot see it anywhere", and the coordinator answered that it had landed "by my last check", which the fetch times contradict; after slice 4 the owner asked at 15:56 "we are actively waiting here. right?" before the coordinator armed a one-minute `origin/main` poll, which caught plan 299's landing (16:07) and slice 1 started. Observed effect: about 22 minutes with slice 4 runnable and nothing watching; two owner prompts to restart the wait. Inference: same gap as the earlier row: an owner-approved wait on a sibling's integration has no trigger unless the coordinator arms one; the later poll worked as that trigger.

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation
A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).
- **Response / limit:** No retry for transient `gh` errors. Second execution on 0.3.50; managed delivery re-attached at the next publication.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-121 — One transient GitHub TLS timeout ended CI observation for the rest of the execution](../../../doughnut/DearDough.md#odf-121--one-transient-github-tls-timeout-ended-ci-observation-for-the-rest-of-the-execution).

Former local code: DD-115.

A reported GitHub transport failure ends observation and leaves later revisions without notification coverage.



- Execution: SEED-035 story 17 / slice-plans/034-book-source-as-notebook-file / 36eb15caaa; Timestamp: unknown (event delivered between slice 6 commit 2026-09-25 16:44:12 +0800 and slice 7 commit 2026-09-25 16:58:36 +0800); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: hook context `{"type":"CI_MONITOR_UNAVAILABLE",…,"reason":"Command failed: gh run list … TLS handshake timeout"}` for observer /tmp/dough-ci-501/watch-WnDwf2; slice 7 receipt `observation.state: unobserved`. - Observed effect: lost coverage for db13a2d99c and 96c756d531; manual CI checks replaced notifications. - Inference: a bounded retry for a transient network error before declaring the observer unavailable would likely have kept coverage.

- Execution: SEED-062#story-1 / slice-plans/006-reify-property / 508d4909b5; Timestamp: unknown (delivered at the coordinator boundary around 2026-09-30T20:24+08:00, after e2ad90297e and before 93eb7fd31d); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.50. - Evidence: hook context `{"type":"CI_MONITOR_UNAVAILABLE","branch":"claude/reify-a-property","reason":"… gh run list … error connecting to api.github.com"}` for observer /tmp/dough-ci-501/watch-N2C0GM; the next `deliver` (ec90308084) returned `observation.state: attached, reused: false` with a new observer /tmp/dough-ci-501/watch-DvvAnv. - Observed effect: results for 508d4909b5..e2ad90297e were no longer observed; coverage returned only at the next publication. - Inference: same transient-network ending as the first occurrence; managed delivery's re-attach limited the gap to already-published revisions.

<a id="odf-139"></a>

## ODF-139 — Reported defect dismissed without checking the story

A named gap contradicts the story goal, but acceptance judges it against the plan's narrower scope and delivers it.

- **Sources:** Doughnut / DD-132 (historical evidence at `9ab3ca6e:docs/maintainer/finding-names.md`); [Pygardon / DD-214](../../../pygardon/DearDough.md#odf-139--a-hand-back-gap-was-accepted-as-plan-scoped-without-checking-it-against-the-storys-scope).
- **Follow-up:** implemented, unreleased; release verification and watch pending: [Keep reported gaps owned through the story's remaining slices](https://github.com/terryyin/open-dough/blob/ac8bdb6ca16dd347189867ef1df60a2ccd078c93/.planning/seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned) — SEED-125#keep-reported-gaps-owned.
- **Response:** `b7930baf`, first released in 0.3.48, adds the story-goal and named-gap check to `wrap-up.md` Accept proof. The same rule remains at `9de43de4`; no demonstrated intervening correction of agent follow-through warrants a new identity.
- **Later response (2026-10-10):** `43ef3b9b304b2ffb7ac64238f8c7c6d46ca676a3` introduces structured obligations and story-section quote checks; `9ab257c12fc4abfe0f8586fdbf00e5d53d5a3aaa` carries ownership across slices; `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b` wires delegation, acceptance, delivery and completion gates into the released payload declaration. Free CLI tests refuse the plan-only exclusion. Native proof recorded in `4ec755976033b4265f4a3e39c0c3f3aec7e94906` observes the 303 coordinator retaining a return, a refusing slice gate and a correction handoff. [Proof and limits](https://github.com/terryyin/open-dough/blob/5bd862746d2789e9c34d05276a507f908d141bc7/.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md#4-a-native-host-coordinator-keeps-the-three-replayed-gaps-owned-developer-run). First containing release is unverified: the source response is unreleased on 0.3.57. No new watch has started; release verification and relevant later use remain pending. Earlier failed-watch evidence stays retained.
- **Post-fix evidence:** Pygardon SEED-078#story-auto-trading-same-basis, plan 303 / `74d86dc20` (Take `e6b1c08c4`, recoverable at `a4673f7b6`), 2026-10-03 date-only, Claude Code / claude-opus-5-5 / 0.3.56. Slice 4 reported that `HoldingsExitSettingsResults.tsx` omitted the source; the story said each signal and exit row names it. Acceptance filed this as outside the plan's ask; retrospective correction plan 311 was required. Qualified inference: acceptance used the plan instead of the story. This is a supported failure after the 0.3.48 response, so its prior watch does not pass.
- **Provenance-limited report:** Pygardon SEED-085#story-ci-capacity-kept-free, plan 308 / `cc959dab8` (Take `b77d4e9ff`, recoverable at `33c3283d2`), 2026-10-03 date-only, Claude Code / claude-opus-5-5, guidance release unknown. Acceptance called missing build cache and container holders plan-scoped despite the story's Scope; correction plan 309 followed. This is the same false-scope mechanism; its unknown release cannot establish post-fix recurrence.
- **Frequency:** Three distinct supported executions including the original Doughnut plan 006 on 0.3.41. The two Pygardon retrospectives do not count as extra executions. ODF-185 is separately active again after its failed learning-only acceptance watch.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-139 — A hand-back gap was accepted as "plan-scoped" without checking it against the story's scope](../../../pygardon/DearDough.md#odf-139--a-hand-back-gap-was-accepted-as-plan-scoped-without-checking-it-against-the-storys-scope).

Former local code: DD-214.

The coordinator accepted an implementer's named gap on the implementer's own claim that the plan scoped it out. It did not read the gap against the story's Scope, which listed the omitted holders.

### Occurrences
- Execution: `SEED-085#story-ci-capacity-kept-free` (`.planning/slice-plans/308-ci-capacity-shortage-seen-before-start/PLAN.md`, removed at wrap-up, recoverable at `33c3283d2`; Take `b77d4e9ff`; first implementation commit `cc959dab8`)
  - Timestamp: unknown (2026-10-03, slice 1 acceptance).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: the slice 1 hand-back said "Holders cover images and volumes only … as the plan scoped". The story's Scope names "the engine's other build cache … and anything else". Plan 308 excluded only the release cache budget remedy. Proof acceptance asks for each named gap to be read against the story's goal and scope.
  - Observed effect: the retrospective found the omitted build cache and containers and wrote correction plan 309.
  - Inference: reading the seed's Scope at acceptance would have returned the gap within the same slice, at about one extra implementation round.

- Execution: `SEED-078#story-auto-trading-same-basis` (`.planning/slice-plans/303-auto-trading-same-basis/PLAN.md`, removed at wrap-up, recoverable at `a4673f7b6`; Take `e6b1c08c4`; first implementation commit `74d86dc20`)
  - Timestamp: unknown (2026-10-03, acceptance of slice 4 before commit `e3a7ea2fc`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence:
    - Slice 4's return listed under Gaps: "The Holdings page panel (`HoldingsExitSettingsResults.tsx`) renders the same response but does not show the source. … The slice only asked for the Auto Trading Holdings section."
    - The story goal says "Each signal and exit row names that source".
    - The coordinator recorded the gap in the plan as out of the plan's ask.
    - The retrospective then planned correction `311-holdings-exit-source-correction`.
  - Observed effect: a one-slice correction story and plan instead of a one-file change inside slice 4.
  - Inference:
    - The plan narrowed "Holdings exit settings" to one component, and the coordinator checked the gap against the plan rather than the goal.
    - `wrap-up.md#accept-proof` already says a gap contradicting the goal returns to implementation in the same slice.

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices
Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-141--a-delegated-refactor-pass-ran-on-each-of-two-tiny-guidance-changes-and-edited-nothing), [pygardon](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits), [doughnut](../../../doughnut/DearDough.md#odf-141--a-fresh-refactor-agent-per-slice-returned-no-edits-on-three-of-eight-small-slices).
- **Response / limit:** No proportionality rule in released guidance. Four Open Dough, nine Pygardon and three Doughnut executions, latest 0.3.54; cost only, and the pass did pay off in Open Dough plans 200 and 221.

- **Additional evidence / limit:** Open Dough plan 249 and Doughnut plans 009-frontend-specs-run-real-internal-modules, 002-specs-share-production-router, 003-one-production-router-builder, 004-hold-worktree-e2e-stack and 005-recover-failed-transcription report 0.3.56; Doughnut 001-join-dictated-passages reports an unknown release. No-edit cost recurs, but the other passes found useful shared helpers and a real promise rejection defect. Count each project/execution once. These remain lower priority than unreviewed trunk publication and failed planning premises.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-141 — A delegated refactor pass ran on each of two tiny guidance changes and edited nothing](../../DearDough.md#odf-141--a-delegated-refactor-pass-ran-on-each-of-two-tiny-guidance-changes-and-edited-nothing).

Former local code: DD-192.

The required fresh refactor agent was spawned for a five-line skill paragraph plus one data file, and again for a one-entry data addition; both returned `## REFACTOR COMPLETE` with no edits, after reading the diff and skill references.



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



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-141 — Most per-slice refactor passes on a small correction made no edits](../../../pygardon/DearDough.md#odf-141--most-per-slice-refactor-passes-on-a-small-correction-made-no-edits).

Former local code: DD-120.

Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.



- Execution: `.planning/slice-plans/212-tfdc-verify-run-one-dispatch/PLAN.md` (first implementation commit `2e9e0a29a`); Timestamp: unknown (2026-09-27); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.41. Evidence: coordinator conversation — refactor agents for slices 5, 7, 2, 4 and 6 reported "no changes" at 56,534 / 45,650 / 51,334 / 66,290 / 59,844 subagent tokens (about 280k); slice 3's pass removed one unused export (53,433); slice 1's pass (71,958) unified the duplicated benchmark-load rule. The no-edit slices were a helper move, a deletion, an error-helper extraction, an exception move and a test-file split, each already reviewed by the coordinator at acceptance. Observed effect: about 280k tokens and a few minutes per slice with no product change. Inference: for small structure-only or deletion slices whose accepted diff the coordinator has already inspected, a refactor pass rarely finds residue; a guideline that lets the coordinator scale the pass to the change (or batch adjacent small slices into one pass) could save most of that cost. The single substantive find came from the largest slice.
- Execution: `.planning/slice-plans/273-settings-backup-correction/PLAN.md` (recoverable at `19383da2d`; Take `cd3308578`; first implementation commit `487dda5ad`); Timestamp: unknown (2026-09-28, passes between `487dda5ad` and `1d4235fe5`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: coordinator conversation — refactor agents for slices 1, 2, 3, 5 and 7 (E2E expectation edits, a locked-save fix, seed conversions, two test deletions) reported "already clean" at 61,897 / 57,315 / 76,469 / 58,143 / 50,569 subagent tokens (about 304k); slices 4, 6 and 8 made real edits at 68,576 / 66,607 / 51,440 (reuse of existing `with_*` updaters in a seed, one function returning the feedback object for five callers, reuse of an existing doc definition). Observed effect: about 304k tokens with no change across five of eight passes. Inference: repeats the pattern; the useful finds again followed changes that introduced a shared helper or a second representation, not deletions or expectation edits.
- Execution: `SEED-084#story-sharadar-wake-unreadable-settings` (`.planning/slice-plans/306-sharadar-wake-unreadable-settings/PLAN.md`, removed at wrap-up, recoverable at `976c2025c`; Take `c3d8c78c6`; first implementation commit `03c009815`); Timestamp: unknown (2026-10-03); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: coordinator conversation — both slices were narrow catches of 5–8 changed product lines plus one new test each; their fresh refactor agents reported "already clean" at about 51k and 51k subagent tokens. The slice 2 pass did report a cross-subsystem candidate it could not act on: about 20 routes repeat the settings-format-error → HTTPException conversion. Observed effect: about 102k tokens and no edits. Inference: repeats the pattern for narrow behavior slices whose diff the coordinator had already inspected at acceptance.
- Execution: `SEED-085#story-ci-capacity-holders-correction` (`.planning/slice-plans/309-ci-capacity-holders-correction/PLAN.md`, removed at wrap-up, recoverable at `f5ffa5edf`; Take `c20639354`; first implementation commit `cda42fabf`); Timestamp: unknown (2026-10-03); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: coordinator conversation — slice 2 reworded one bullet in CLAUDE.md and AGENTS.md; its fresh refactor agent (sonnet) reported "none — already clean" at about 43k subagent tokens. Slice 1's pass (about 74k) made a real edit, moving `system df` interpretation into `largest_holders` and undoing a widened API. Observed effect: about 43k tokens and no edit for a documentation-only slice. Inference: repeats the pattern; the useful find again followed a change that spread one concept across two modules.
- Execution: `SEED-087#story-proof-runs-stay-in-bounds` (`.planning/slice-plans/310-proof-runs-stay-in-bounds/PLAN.md`, removed at wrap-up, recoverable at `aeb828f57`; Take `f87015db6`; first implementation commit `ca93557fc`); Timestamp: unknown (2026-10-03, pass between `ca93557fc` and `3e19b67fa`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: coordinator conversation — slice 2 added command-table rows and a note to CLAUDE.md, AGENTS.md and the e2e-test skill; its fresh refactor agent reported no edits at 48,349 subagent tokens. Slice 1's pass (64,554) made a real edit, moving the probe-directory setup the new test module had duplicated into `tests/cucumber_probe_support.py`. Observed effect: about 48k tokens and no edit for a documentation-only slice. Inference: repeats the pattern; the useful find again followed a change that introduced a second representation.
- Execution: `SEED-085#story-proof-builds-leave-engine-as-found` (`.planning/slice-plans/316-proof-builds-leave-engine-as-found/PLAN.md`, removed at wrap-up, recoverable at `3a9aa8600`; Take `517eaf486`; first implementation commit `838633c2c`); Timestamp: 2026-10-05T22:30+09:00 (approximate, pass between `838633c2c` and `142c2ed9b`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: coordinator conversation — slice 2 added one Environment-table row and one paragraph to CLAUDE.md and AGENTS.md and two words to docs/docker-installation.md; its fresh refactor agent reported "already clean" with no edits at 53,503 subagent tokens. Slice 1 changed only the plan record and the coordinator skipped its pass. Observed effect: about 53k tokens and no edit for a documentation-only slice. Inference: repeats the pattern for documentation-only slices.
- Earlier occurrence details: 6 additional recorded rows in `27b607506abdfc53e62a20833ed499d8d781d0a5:DearDough.md`; these are historical evidence, not new occurrences.
- Execution: `SEED-089#story-frontend-tests-wait-on-events` (`.planning/slice-plans/314-frontend-tests-wait-on-events/PLAN.md`, removed at wrap-up, recoverable at `f9dc615`; Take `3499bae08`; first implementation commit `a7f8d4fe6`)
  - Timestamp: unknown (2026-10-06, slices 1, 3, 9 and 10).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: refactor agents for slices 1, 3, 9 and 10 reported no edits at 58,401 / 52,772 / 63,645 / 50,806 subagent tokens (about 226k); slices 2, 4, 5, 7 and 8 made small consolidation edits (a shared domain step, redundant assertions, folded helpers); slice 6 split a file (DD-221).
  - Observed effect: about 226k tokens with no change on four test-only slices, while five passes did find small, real duplication introduced by the slice.
  - Inference: on test-only conversions the passes found residue in roughly half the slices; scaling the pass to the diff the coordinator already inspected would save the no-edit cost without losing the useful finds.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-141 — A fresh refactor agent per slice returned "no edits" on three of eight small slices](../../../doughnut/DearDough.md#odf-141--a-fresh-refactor-agent-per-slice-returned-no-edits-on-three-of-eight-small-slices).

Former local code: DD-176.

The wrap-up requires a fresh post-change-refactor agent for every slice. On slices that added one focused check, one
disabled state, or one e2e scenario, the agent read the change, found nothing, and returned without edits.



- Execution: SEED-062#story-1 / slice-plans/006-reify-property / 508d4909b5; Timestamp: unknown (refactor passes of slices 3, 7, 8 on 2026-09-30, between about 19:20 and 21:00 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.50. - Evidence: refactor agents for slice 3 (53,000 subagent tokens, 35 s), slice 7 (49,811 tokens, 31 s), slice 8 (59,930 tokens, 42 s) each reported "no refactor edits"; agents for slices 1, 2, 4, 6 did make useful edits (shared key lookup, fixture uses main writer, both tracker directions in one class, reuse of an existing whole-link recognizer). - Observed effect: about 160k subagent tokens with no change to the code. - Inference: slice size alone did not predict value (slice 6 was small and still found a duplicate recognizer); a cheaper first look by the coordinator for slices with a one-file production diff might keep most of the value.

- Execution: SEED-066#discover-voice-input-problems / slice-plans/001-discover-voice-input-problems / 2eec224d133f9bfa081e5918a55c46f4de3827a1
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: 2026-10-03 execution conversation and `2533d739a16f025d612a38b405e63a30e804d65c:.planning/slice-plans/001-discover-voice-input-problems/PLAN.md`, fresh post-change-refactor reports for slices 3–10; all eight returned “none — already clean,” with reported active durations of about 20 seconds to one minute. Slice 1 split detailed evidence/context; slice 2 shortened the epic summary.
  - Observed effect: eight consecutive documentation-only slices required independent refactor handoffs without edits; accepted manual proof needed no rerun. The first two reviews made useful record changes. Token usage was not supplied.
  - Inference: the mandatory handoffs consume some of a bounded discovery mission, although this record does not establish net review value or measured token cost. Consider a cheaper review route for documentation-only slices; no current execution requirement was waived.

- Execution: SEED-066#author-controlled-titles / slice-plans/002-keep-titles-under-author-control / aa093fffeb
  - Timestamp: unknown (slice 1 refactor on 2026-10-03, between 14:53 and 14:55 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54
  - Evidence: slice 1 (one composable removal, two specs, one doc) refactor agent reported "no refactor edits" (52,715 subagent tokens, 30 s); slice 2's refactor agent did find useful residue (inlined the last `executeWithTool` overload, made `maxOutputTokens` non-nullable).
  - Observed effect: one of two refactor passes changed nothing.
  - Inference: again, diff size did not predict value: slice 2 was a pure deletion and still left residue.

- Execution: SEED-039#internal-mocks-to-real-modules / slice-plans/009-frontend-specs-run-real-internal-modules / a70529a3fb
  - Timestamp: unknown (refactor passes on 2026-10-04, between about 09:20 and 10:15 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: 13 test-only slices. Refactor agents for slices 4, 7, 10, 13 returned "no refactor edits" (54,847 + 50,344 + 55,406 + 60,542 subagent tokens). The other nine made edits later slices reused: shared `answerOnlyPendingPopup`, `productionRouterAt` replacing four local router builders, `countHistoryEntriesAdded` shared by three specs, toast readers moved into the toast helper.
  - Observed effect: about 221k subagent tokens on passes without edits; nine of thirteen passes changed code.
  - Inference: in a test-only story that grows shared helpers slice by slice, the passes mostly paid off; the no-edit passes came on slices that only applied helpers already in place. Qualified: one execution.

- Execution: SEED-039#specs-share-production-router / slice-plans/002-specs-share-production-router / 98728709f1
  - Timestamp: unknown (refactor passes on 2026-10-05, between about 06:40 and 06:58 +09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: 4 test-only slices. Refactor agents for slice 1 (one-line reset plus a new spec; 50,313 subagent tokens) and slice 4 (three files plus one skill sentence; 53,730 tokens) returned "no refactor edits". Slice 2's pass moved imports to the `@tests/helpers` barrel and dropped a redundant `router.push("/")`; slice 3's pass removed a redundant `$route` mock.
  - Observed effect: about 104k subagent tokens on passes without edits; two of four passes changed code.
  - Inference: as in the previous row, passes on slices that only applied an established pattern found nothing. Qualified: one execution.

- Execution: SEED-039#one-production-router-builder / slice-plans/003-one-production-router-builder / 20f253b39d
  - Timestamp: unknown (slice 1 refactor on 2026-10-05, shortly before 10:45 +09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: one-slice test-support correction (one extracted router builder, deletion of an unused render path and fixture). The refactor agent returned "none — already clean" (50,844 subagent tokens, about 20 s); the implementer had already removed the leftovers the plan named.
  - Observed effect: the only refactor pass changed nothing.
  - Inference: when the plan itself is a cleanup correction that lists exact leftovers, the separate pass has little left to find. Qualified: one execution.

- Execution: SEED-069#observe-branch-code-against-real-services / slice-plans/004-hold-worktree-e2e-stack / ee414fbdf1
  - Timestamp: unknown (refactor passes on 2026-10-05, between about 12:12 and 12:38 +09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: 4 slices of runner scripts and guidance. Refactor agents for slice 1 (new hold entry, one session seam; 54,309 subagent tokens) and slice 3 (one reset call, one passed field; 55,041 tokens) returned no edits. Slice 2's pass shared a `withEnv` test fixture across three callers and split `scripts/e2e-hold.mjs` out of an over-limit file; slice 4's pass linked the guidance to its one detailed home and added a missing pointer in `docs/development-setup.md`.
  - Observed effect: about 109k subagent tokens on passes without edits; two of four passes changed files.
  - Inference: as in earlier rows, diff size did not predict value. Qualified: one execution.

- Execution: SEED-066#join-dictated-passages / slice-plans/001-join-dictated-passages / ba66d94ad393c23015ae855375133c7a67779a5a
  - Timestamp: unknown (2026-10-05, slice 1 refactor)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: `refactor_segments` returned “none — already clean” and `## REFACTOR COMPLETE`, reporting approximately three active minutes, no edits, and no proof reruns; ba66d94ad3 carries the reviewed slice.
  - Observed effect: one of this execution's two mandatory independent refactors produced no edits; slice 2's review made the test split recorded under ODF-189.
  - Inference: this bounds handoff cost but does not establish that the independent review lacked value. No execution requirement was waived.

- Execution: SEED-066#recover-failed-transcription / `212e428968:.planning/slice-plans/005-recover-failed-transcription/PLAN.md` / 9eb06ed0bd
  - Timestamp: unknown (refactor passes on 2026-10-05, between about 14:40 and 14:58 +09:00)
  - Tool: Claude Code
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: coordinator summary to the retrospective (subagent transcripts not supplied). Slice 1's pass found a real defect: `stop()` awaited the raw processing promise, which could reject; the catch moved onto the promise and a test was added (in 9eb06ed0bd). Slice 2's pass made no edits. Slice 3's pass split `NoteAudioTools.retry.spec.ts` out for file size and removed a duplicated `ServiceMocker` stub builder (in ab773157bb). Token counts not supplied.
  - Observed effect: one of three passes changed nothing; one caught a defect the slice's own tests had not.
  - Inference: the defect-finding pass came on the slice that changed a promise's failure path; as in earlier rows, diff size did not predict value. Qualified: one execution.

- Execution: SEED-066#prompt-dictation-results / `a4c70254e7:.planning/slice-plans/007-see-submitted-dictation-promptly/PLAN.md` / dd875812e5
  - Timestamp: unknown (2026-10-06; slice 2 refactor between about 09:30 and 09:36 +09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: slice 2's refactor agent (70,273 subagent tokens, about 2 minutes) made one rename, `stubTranscription` → `stubStopTranscription` in `e2e_test/start/mock_services/openAiService.ts`, in dd875812e5. The coordinator ran no refactor agent for the records-only commits 99962fbf99 (plan measurement table) and f50c7dcef6 (plan status and docs/voice-input.md), and reported that deviation to the retrospective.
  - Observed effect: one pass made a small naming edit; two required passes were skipped without a waiver.
  - Inference: the coordinator treated records-only slices as needing no independent refactor, the cheaper route earlier rows suggest, but the wrap-up has no such route, so the skip is a deviation rather than an allowed path. Qualified: one execution.

<a id="odf-142"></a>

## ODF-142 — Abbreviated delivery SHAs produce misleading refusals

An abbreviated published-base SHA is accepted as an argument but compared without normalization, causing misleading delivery refusal and fallback publication without observation.

- **Source:** [pygardon / DD-220](../../../pygardon/DearDough.md#odf-142--managed-delivery-refused-a-fast-forward-candidate-with-rebase-left-the-pre-rebase-sha-as-the-candidate).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Restores Pygardon / DD-124’s existing identity from `9ab3ca6e:docs/maintainer/finding-names.md`. At `9de43de4`, `execution-increment-publication.mjs` still compares the supplied base to full fetched SHAs. A full-SHA retry succeeded in the new report; the first fast-forward diagnosis remains qualified. No demonstrated normalization correction or post-fix claim. Current guidance assessed: `9de43de4`.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-142 — Managed delivery refused a fast-forward candidate with "rebase left the pre-rebase SHA as the candidate"](../../../pygardon/DearDough.md#odf-142--managed-delivery-refused-a-fast-forward-candidate-with-rebase-left-the-pre-rebase-sha-as-the-candidate).

Former local code: DD-220.

### Occurrences
- Execution: SEED-094#story-production-observations-without-round-trips (`.planning/slice-plans/315-production-observations-without-round-trips/PLAN.md`, removed at wrap-up, recoverable at `8c16de57e`; Take `2451f59c7`; first implementation commit `b33a4bd4f`)
  - Timestamp: unknown (2026-10-05, delivery of `6fa9842d9`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence: `deliver --previously-published-base 655f21ec2 --target-ref refs/heads/claude/executions-read-the-production-facts-they-need-w` with the remote branch at `655f21ec2` and `6fa9842d9` its only new commit printed `rebase left the pre-rebase SHA as the candidate` and pushed nothing. The base was passed as an abbreviated SHA.
  - Observed effect: the coordinator pushed the fast-forward with plain `git push`; no observer covered it.
  - Inference: likely the abbreviated base. The next `deliver` (completion record `c267e2ed0`) passed `6fa9842d9c` and stopped with `unpublished-base`; the same call with the full SHA was accepted. The usage text does not say the base must be a full SHA.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-142 — Managed delivery stopped with a misleading rebase error when given an abbreviated previously-published base](../../../doughnut/DearDough.md#odf-142--managed-delivery-stopped-with-a-misleading-rebase-error-when-given-an-abbreviated-previously-published-base).

Former local code: DD-216.

`execution-increment-delivery.mjs deliver --previously-published-base`
compares SHAs as strings. An abbreviated SHA never equals the fetched remote
tip, so delivery tried a no-op rebase and stopped with "rebase left the
pre-rebase SHA as the candidate".



### Occurrences
- Execution: SEED-066#prompt-dictation-results / `a4c70254e7:.planning/slice-plans/007-see-submitted-dictation-promptly/PLAN.md` / dd875812e5
  - Timestamp: 2026-10-06, shortly after 11:18:17+09:00 (commit f50c7dcef6)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56
  - Evidence: `deliver --previously-published-base b86f649322 --target-ref refs/heads/claude/see-submitted-dictation-promptly` failed. The coordinator read `execution-increment-publication.mjs` (`remoteTip !== previouslyPublishedBase` makes `reconcileOnto` run; the guard at line 75 throws). A rerun with the full SHA was accepted as f50c7dcef6.
  - Observed effect: one failed call, nothing published, and three source-reading calls.
  - Inference: the usage text says only `--previously-published-base SHA`. Resolving the argument to a full SHA, or naming the cause in the error, would avoid the lookup. Qualified: one occurrence; earlier deliveries in this execution passed full SHAs from receipts.

<a id="odf-147"></a>

## ODF-147 — Reasoned red proof leaves ineffective tests
An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-147 — An implementer reasoned that a new test would fail instead of running it red, and one of its tests could not fail](../../../doughnut/DearDough.md#odf-147--an-implementer-reasoned-that-a-new-test-would-fail-instead-of-running-it-red-and-one-of-its-tests-could-not-fail).

Former local code: DD-127.

An agent reasons that new tests would fail instead of observing them against pre-change behavior; round-trip or wrong-boundary tests can pass without the fix.



- Execution: SEED-035 story 24 / slice-plans/046-moves-to-another-notebook-reach-git / bc9a0ab229; Timestamp: 2026-09-26, ~17:30+08:00 (coordinator red check before slice 3 refactor); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. - Evidence: slice 3 return ("I did not run the new tests red first"); red run with `NotebookFolderController` and `FolderRelocationService` reset to HEAD: `movingAFolderBackAsUndoRestoresBothNotebooks` passed; `NotebookGitWebFolderCrossNotebookMoveControllerTest` in 3d5c1bf394 asserts Engineering's history grew by two commits. - Observed effect: two extra focused test runs by the coordinator; the delivered undo test now fails without the fix. - Inference: a round-trip test whose end state equals its start state passes when nothing happens; "red first if practical" in the delegation let the agent substitute reasoning for observation. Slice 2's implementer ran red and its undo test was meaningful.
- Execution: SEED-046#story-5 / `.planning/slice-plans/006-web-edit-changes-only-edit/PLAN.md` at 2a8fd844b4 / 5f71d4d237; Timestamp: between 2026-09-26T23:37:35+08:00 and 2026-09-26T23:43:24+08:00 (slice 5 quoted-rename test, before commit 2f2cd179cf) and between 2026-09-26T23:53:42+08:00 and 2026-09-27T00:00:58+08:00 (slice 8 flow-list test, before commit 06394ff704); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.41. - Evidence: the coordinator itself added `quotes a renamed key that YAML needs quoted` and `removeWikiLinksFromLeadingFrontmatterProperties_cutsOnlyTheEmptiedFlowListItem` and accepted them by reasoning ("without the fix it would emit `a: b: demo`") after only a green run; the slice implementers' reports also named no red runs. - Observed effect: both tests are plausibly meaningful, but neither was observed failing. - Inference: this time the coordinator, not an implementer, substituted reasoning for the red run; the delegation prompts again did not ask for one.
- Earlier occurrence details: 1 additional recorded rows in `8830c682704aac3bbb34bf9b1204da8feba042ca:DearDough.md`; these are historical evidence, not new occurrences.

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope
An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-152--an-unconditional-file-size-check-stopped-a-refactor-with-no-conceptual-candidate), [doughnut](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-152 — An unconditional file-size check stopped a refactor with no conceptual candidate](../../DearDough.md#odf-152--an-unconditional-file-size-check-stopped-a-refactor-with-no-conceptual-candidate).

Former local code: DD-219.

The independent refactor pass found no warranted conceptual change, but stopped because three changed files exceeded the generic 250-line limit. Satisfying that rule would have split unrelated seed stories or existing test journeys beyond the selected deletion-feedback slice.



### Occurrences

- Execution: `SEED-052#announce-record-deletion-first-time` / plan 219, first related implementation commit `c70c09f8e029d495ee100a50153012661fe06e87`
  - Timestamp: unknown (session date 2026-10-02; precise hand-back times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.54 (installed guidance at claim `d41fc577`)
  - Evidence: delegated `refactor_deletion` initial Jidoka hand-back and follow-up `## REFACTOR COMPLETE`; `c70c09f8:.planning/slice-plans/219-deletion-failure-feedback/PLAN.md`, Execution context, records seed 431 lines, card-delete spec 283, Recent-delete spec 294, and the coordinator's scoped exception with the numeric guideline explicitly unsatisfied.
  - Observed effect: an extra coordinator decision and agent follow-up; no refactor edits or repeated tests. No human waiver of the numeric limit was claimed.
  - Inference: Qualified. This is a scope/precedence conflict, distinct from ODF-141's cost of mandatory no-edit refactor passes. The broader value of smaller files was not assessed here.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-152 — The file-size rule conflicted with an approved staged simplification and mechanical callers](../../../doughnut/DearDough.md#odf-152--the-file-size-rule-conflicted-with-an-approved-staged-simplification-and-mechanical-callers).

Former local code: DD-138.

An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.



- Execution: SEED-049#story-1 / slice-plans/016-note-store-architecture / 3821dbd9c79c7ab25e68cd1ff96aa44061d6544f; Timestamp: unknown (2026-09-27, refactor1 and refactor6 handoffs); Tool: Codex; Open Dough release: 0.3.42. - Evidence: chat 01a0e0fe-e37c-7512-a6b3-b8d4c1318365, refactor1 questioned the 384-line intermediate store before planned slices4–6; refactor6 questioned useWikidataPropertyDialog after mechanical migration (300 lines at its base, then smaller). Rule: dough-post-change-refactor/references/refactor-checks.md, File size. Source: SEED-049 owner-approved single command/undo split; slice7 owns store size proof. - Observed effect: two applicability exchanges; no extra split was made. Final noteStore is 245 lines, noteUndo167, requests228, cache45. The unrelated Wikidata workflow was preserved. - Inference: clarify how the numeric check composes with approved intermediate states and the skill's requirement that a refactor address an introduced, exposed, or aggravated issue. Unlike ODF-124, the rule was found and acknowledged here.

<a id="odf-153"></a>

## ODF-153 — Sibling-branch CI failure attribution
A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).
- **Response / limit:** No response. Three Pygardon executions, latest 0.3.54; Pygardon uses a custom CI adapter, so observer versus adapter responsibility is still unknown.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-153 — An observer attributed a sibling branch failure to this execution](../../../pygardon/DearDough.md#odf-153--an-observer-attributed-a-sibling-branch-failure-to-this-execution).

A new observer labels a non-ancestor sibling revision as this execution’s branch; observer versus adapter responsibility is unknown.



- Execution: `.planning/slice-plans/219-atomic-fixture-publication/PLAN.md` (recoverable at `8030fca16`; first implementation commit `f582ac26a`); Timestamp: unknown (delivered at the observer's attach on the first `deliver`, just after `f582ac26a` was committed at 2026-09-27T13:12:25+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.42. Evidence: first event on `/tmp/dough-ci-501/watch-yB0AUZ` was `CI_FAILURE` for `ee5c999a8` ("Remove obsolete subject-less holdout guidance"), labelled branch `story/atomic-fixture-publication`; `ee5c999a8` is on `origin/codex/tfdc-retirement-residue` and is not an ancestor of this execution's registered `f582ac26a`; the failure was E2E `backup_run.feature:20` (`Last check: backup current` never visible). Observed effect: one dispositioning of a verdict the execution did not own. Inference: unlike the earlier rows, the reported revision belongs to a concurrent sibling branch, so the observer or project CI adapter can attribute another branch's attempt to a newly created story branch; the cause is unverified.

- Execution: SEED-076#story-ruff-wider-rules (first implementation `818f6438a`); Timestamp: unknown (2026-10-02 resumed delivery); Tool: Codex; Open Dough release: 0.3.52. Evidence: delivered mailbox `watch-Dbuyl9` sequence 1 named `c4558d826697a57a7df98e5afba7f140785f4b86`, run `fe2fcb13-6c4f-47e9-94ab-3d03bf827c48`; plain Git ancestry check exited 1 and that commit belongs to Rio-chan’s separate delisted-evaluation closure. Disposition retained at `6c274be1e:.planning/slice-plans/294-ruff-wider-rules/execution-review.md`. Observed effect: one unrelated failure needed classification and acknowledgment; no sibling repair was attempted. Inference: matches the non-ancestor sibling attribution problem; adapter versus observer cause remains unverified.

- Execution: SEED-078#story-sharadar-daily-update-fault-recovery (plan 297, removed at wrap-up, recoverable at `8178be1f2`; Take `470181205`; first implementation commit `b0369afa9`); Timestamp: unknown (delivered at the observer's attach on the first `deliver`, just after `b0369afa9` was committed at 2026-10-03T12:20:49+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: first event on `/tmp/dough-ci-501/watch-phNSqO` was `CI_FAILURE` for `5dce13078` ("Take queued work: SEED-069#story-consistent-classification"), labelled branch `claude/keep-the-daily-sharadar-update-running-after-an`; `5dce13078` is on `origin/main` and `origin/claude/improve-sector-and-industry-data-quality-histori`, not an ancestor of this execution's registered `b0369afa9`; the failure was `tests/test_strategy_verify_dataset_refusals_api.py::test_dataset_without_candidate_securities_is_a_limited_universe`. Observed effect: one dispositioning of a verdict the execution did not own. Inference: recurs on 0.3.54 for a story branch whose Take preceded a newer trunk Take; cause unverified.

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity
Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

- **Follow-up:** released in 0.3.57: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).
- **Response / limit:** First released in 0.3.57: `deliver --host cursor` takes the coordinator from `CURSOR_CONVERSATION_ID`, and a managed-delivery generation no longer replaces the coordinator's real hook generation. Native Cursor evaluation (paid, manual) not yet run. Before it: six Cursor executions, latest 0.3.54, each lost CI observation.

- **Additional source mapping:** [Open Dough / DD-231](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity), plan 242-cursor-agent-stays-joinable / e7fbca2a, Cursor / Grok 4.7, timestamp unknown; modified revision `2ea2d324`, base 0.3.56. Inspection of that revision’s installed `ci-host-bridge.mjs` confirms the old Claude-only identity fallback. Three accepted publications were unobserved. This is continuity of ODF-154 before its unreleased response, not a failed released fix.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for c02158fc is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.
- **Watch eligibility:** released, effectiveness unverified; watch start unknown. No supplied matching use of the fixed Cursor identity-to-native-hook path establishes a start. Older and unknown-release reports do not demonstrate a 0.3.57 recurrence.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-154 — Cursor managed delivery lacks its coordinator session identity](../../DearDough.md#odf-154--cursor-managed-delivery-lacks-its-coordinator-session-identity).

Former local code: DD-095 (plan 126 Cursor occurrence only).

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.



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

<a id="odf-156"></a>

## ODF-156 — Lost acceptance obligations in delegation
A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

- **Follow-up:** implemented, unreleased; release verification and watch pending: [Keep reported gaps owned through the story's remaining slices](https://github.com/terryyin/open-dough/blob/ac8bdb6ca16dd347189867ef1df60a2ccd078c93/.planning/seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned) — SEED-125#keep-reported-gaps-owned.
- **Response / limit:** No response. Second project: Pygardon plan 296 (0.3.54) delivered a story promise incomplete and needed a correction plan.
- **Later response (2026-10-10):** `43ef3b9b304b2ffb7ac64238f8c7c6d46ca676a3`, `9ab257c12fc4abfe0f8586fdbf00e5d53d5a3aaa` and `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b` add structured ownership, receiving-slice listing/refusals and mandatory delegation/completion boundaries. Free CLI tests own the receiving-slice refusal. Native proof recorded in `4ec755976033b4265f4a3e39c0c3f3aec7e94906` observes retained slice-8 ownership, completion refusal and the full live-fault/next-daily handoff; no implementation agent or native slice-8 acceptance was observed. [Proof and fixture limits](https://github.com/terryyin/open-dough/blob/5bd862746d2789e9c34d05276a507f908d141bc7/.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md#4-a-native-host-coordinator-keeps-the-three-replayed-gaps-owned-developer-run). First containing release is unverified: the source response is unreleased on 0.3.57. Release verification and a watch from relevant later use remain pending; the replay alone does not resolve the finding.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-156 — A slice-acceptance obligation recorded as a plan learning never reached the next delegation](../../DearDough.md#odf-156--a-slice-acceptance-obligation-recorded-as-a-plan-learning-never-reached-the-next-delegation).

Former local code: DD-126.

A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.



- Execution: `SEED-028#one-shot-work` / plan 112, first related implementation commit `d0101737` - Timestamp: unknown; slice 3 delegated after `6f350f28` (2026-09-27T16:40:20+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac` (v0.3.42) - Evidence: plan 112 Learnings at `d0101737`; `dough-bug-fixing/SKILL.md:98` still forces `--no-replan` and its closure steps still route through wrap-up at `70f6cde1` - Observed effect: the retrospective found contradictory closure guidance and planned a correction - Inference: Qualified. Learnings are free text; nothing ties an acceptance obligation to the slice that must satisfy it



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-156 — A gap deferred to a later slice was not carried into that slice's delegation](../../../pygardon/DearDough.md#odf-156--a-gap-deferred-to-a-later-slice-was-not-carried-into-that-slices-delegation).

Former local code: DD-205.

Slice 6 accepted that non-Sharadar action faults propagate and leave the run `running`, noting "slice 8"; slice 8's delegation covered restart interruption only, so the live-fault case was never implemented and the retrospective found it.

### Occurrences
- Execution: `SEED-078#story-sharadar-daily-update` (`.planning/slice-plans/296-sharadar-daily-update/PLAN.md`, removed at wrap-up, recoverable at `f93f2014b`; Take `bc246ad45`; first implementation commit `fed1b745b`)
  - Timestamp: unknown (slice 6 acceptance 2026-10-03 about 08:50 +08:00; retrospective about 11:00 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: plan 296 slice 6 accepted-proof note "other exceptions propagate leaving `running` (slice 8)"; slice 8 delegation and proof addressed restart recovery and recording faults; retrospective finding F1 and correction plan `297-sharadar-daily-update-fault-recovery`.
  - Observed effect: a story promise ("a failure … ends that run … the next daily occurrence can try normally") was delivered incomplete and needs a correction story.
  - Inference: a deferral recorded in an accepted note should be copied into the receiving slice's text (as was done for slice 5's waiting gap into slice 7) before that slice is delegated.

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches
An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-157 — A "no other location" premise was swept with the removed rule's words, missing the concept's other wording](../../DearDough.md#odf-157--a-no-other-location-premise-was-swept-with-the-removed-rules-words-missing-the-concepts-other-wording).

Former local code: DD-127.

An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.



- Execution: `SEED-008#isolate-parallel-slice-delivery` / plan 131, first related implementation commit `1d3a26cd` - Timestamp: 2026-09-27T18:03:28+08:00 (premise recorded in plan commit `9f8b82b0`) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: plan 131 premise row "Concurrent-writer wording exists beyond the permission"; `src/skills/dough-execute-plan/references/ci-monitor.md:249` at `1d3a26cd`; the retrospective's search for `writers|other agents` found it - Observed effect: the leftover shipped in the slice commit and needed correction story `SEED-008#restate-ci-pause-ownership` and plan 132 instead of a one-line edit in slice 1 - Inference: Qualified. The search terms described the removed permission, not the concept it relied on (who else writes in the checkout); searching for that concept's actors ("agents", "writers") would have found it
- Execution: `SEED-008#finish-removing-checkout-coordination` / plan 145, first related implementation commit `3239c49a` - Timestamp: unknown; slice 2's refactor pass ran before its commit `da2178fd` (2026-09-29T07:38:10+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: modified; revision `b37292dd`; base 0.3.46 - Evidence: plan 145 slice 2 proof and premise rows swept `src` for `declared-owner|declaredOwner|another-writer|unclear-ownership|--requester`. The refactor pass found "another writer's ownership, or ambiguous ownership" (refresh results list) and "Report the competing writer" in `maintain-default-checkout.md`, plus "unclear ownership" at `docs/project-visibility-requirements.md:365`. - Observed effect: all three leftovers were removed before commit `da2178fd`; the plan's empty-grep proof would have passed with them in place - Inference: Qualified. Second occurrence: the identifier sweep matched the removed names, not the concept's prose; this time the refactor pass caught it, not a correction story

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads
Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-158 — Execute-plan's required reference reads cost more than a clean one-slice run used](../../DearDough.md#odf-158--execute-plans-required-reference-reads-cost-more-than-a-clean-one-slice-run-used).

Former local code: DD-128.

Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.



- Execution: `SEED-004#proudly-found-elsewhere-design` / plan 133, first related implementation commit `29d0c909` - Timestamp: unknown (after Take `848db9fd` committed 2026-09-27T18:56:02+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `707f3ac7` (v0.3.42) - Evidence: coordinator conversation: persisted reads of `delegation.md` + `execution-decisions.md` + `agent-commits.md` + `runtime-setup.md` (31.6KB) and `wrap-up.md` + `ci-monitor.md` (29.9KB), plus `execution-location.md`, `trunk-publication.md`, `finish-or-stop.md`, `ci-completion-wait.md` - Observed effect: no rework or error; context spent on paths not taken - Inference: Qualified. The skill ties reads to boundaries ("before arming observation", "before a claim"), but managed delivery and the start command now own those mechanics, so a boundary reached through them still triggers full reads. Cost only; this run gives no evidence of harm to quality
- Execution: `SEED-053#proportionate-local-verification` / plan 143, first related implementation commit `8cafa49d` - Timestamp: unknown (between Take `f510358e` committed 2026-09-28T16:46:40+08:00 and `8cafa49d` committed 2026-09-28T16:51:36+08:00) - Tool: Claude Code - Model: claude-opus-5-5[1m] - Open Dough release: unknown; installed guidance last updated by `2b46e651` - Evidence: coordinator conversation: full reads of `execution-location.md`, `delegation.md`, `execution-decisions.md`, `wrap-up.md`, `finish-or-stop.md`, part of `trunk-publication.md` and `agent-commits.md`. The only slice added one 10-line paragraph. The coordinator skipped the required `ci-monitor.md` read before arming, and managed delivery attached the observer without it - Observed effect: same as above; no CI event, repair, stash, or rework occurred, and skipping `ci-monitor.md` caused no visible harm - Inference: Qualified. Third consecutive one-slice prose execution. The skipped read shows that "before arming observation" still names a read that managed delivery has made unnecessary on the normal path
- Earlier occurrence details: 2 additional recorded rows, one in `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md` and one (`SEED-065#warning-free-lint`) in `80043764511288cf27c5f14b128c2820110a8b45:DearDough.md`; these are historical evidence, not new occurrences.
- Execution: `SEED-088#review-changes-since-last-review` / plan 245, first related implementation commit `d754256c` - Timestamp: unknown (between Take `eb52e12a` committed 2026-10-05T13:30:54+09:00 and `d754256c` committed 2026-10-05T13:43:51+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: coordinator conversation: full reads of `established-start.md`, `execution-location.md`, `delegation.md`, `execution-decisions.md`, `wrap-up.md` + `ci-monitor.md` (31.4KB, persisted), `runtime-setup.md` + `ci-notify-hosts.md`, and parts of `trunk-publication.md`, `agent-commits.md`, `record-preparation.md` before the first delegation. This five-slice run then used `ci-monitor.md`'s failure handling twice. - Observed effect: no rework; much of the startup read covered paths the managed start and delivery commands own (probe, start, register). - Inference: Qualified. Unlike the one-slice rows, a multi-slice run with real CI failures used part of `ci-monitor.md`; the waste is in the observer setup and arming sections, not the failure handling.
- Execution: `SEED-113#shared-read-waiter-residue-correction` / plan 263, first related implementation commit `11ddc3db` - Timestamp: unknown (2026-10-07, between Take `fb3a2201` and `11ddc3db`) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.56 (installed `dough-update/VERSION`) - Evidence: coordinator conversation: `established-start.md`, then `execution-location.md` + `delegation.md` + `wrap-up.md` in one 35KB persisted read, then the publication section of `trunk-publication.md`, `finish-or-stop.md` and part of `agent-commits.md`, for one Structure slice (about 30 changed lines) - Observed effect: no rework; managed delivery attached the observer, so the arming sections were not used - Inference: Qualified. Same pattern as the other one-slice rows

<a id="odf-169"></a>

## ODF-169 — Stale replay base includes sibling commits
A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-169 — A stale previously-published base after a trunk merge made delivery replay a sibling's commits](../../../pygardon/DearDough.md#odf-169--a-stale-previously-published-base-after-a-trunk-merge-made-delivery-replay-a-siblings-commits).

Former local code: DD-132.

A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts.



- Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary: base `a0b61c95f` (previously published) passed instead of replay target `85cc6ecdd` (merge commit `Merge remote-tracking branch 'origin/main' into execute/staged-import-residue`); delivery replayed sibling Stooq commits (`16e89f10e`, `c58bd2581` lie in that range) and stopped in conflict; aborted and redelivered as `101d3aafa` on `85cc6ecdd`. Observed effect: one conflicted delivery, an abort and a redelivery; no wrong commit reached trunk. Inference: which revision the base argument means after trunk moves is easy to misread; delivery could detect commits in the replay range authored outside this execution and refuse before rebasing.
- Execution: `.planning/slice-plans/288-approved-commands-without-denials/PLAN.md` (recoverable at `ed60f2046`; Take `8d1d6b4b8`; first implementation commit `7ba74df4d`); Timestamp: unknown (2026-09-29, before slice 2 was accepted at 21:00:02+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. Evidence: slice 2's first `deliver` returned `needs-validation` with `suffixBase` `f9ea7b09a`; the retry with `--validated-candidate` still passed `--previously-published-base 7ba74df4d`, so delivery replayed SEED-073/SEED-067 planning commits and stopped in conflict on `91aea5fcf`; the coordinator aborted its own worktree's rebase and redelivered with `f9ea7b09a`, accepted as `e0ab8b392`. Observed effect: one conflicted delivery and redelivery; nothing wrong reached trunk. Inference: the case here is a rebase reconciliation, not a merge; the `needs-validation` receipt could say which base the retry must use.

<a id="odf-170"></a>

## ODF-170 — Merge driver rooted in a retired worktree
Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-170 — The shared product-backlog merge driver points at one worktree's copy of its script](../../../pygardon/DearDough.md#odf-170--the-shared-product-backlog-merge-driver-points-at-one-worktrees-copy-of-its-script).

Former local code: DD-133.

Repository-wide Git configuration names an absolute merge-driver script in one worktree; retiring it breaks backlog merges in all checkouts.



- Execution: `.planning/slice-plans/223-frontend-unit-test-feedback/PLAN.md` (published `c1bd49545`; first implementation commit `a4719534a`); Timestamp: unknown (2026-09-27, between `c1bd49545` at 21:15:07+08:00 and `101d3aafa` at 21:43:56+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.43 (installed at `bda8b7648` before admission `e9afa73e2`; unchanged during the execution). Evidence: coordinator-supplied execution summary: the plan-publication rebase hit a `.planning/PRODUCT-BACKLOG.md` conflict whose driver pointed at `.claude/worktrees/owner-run-production-actions/.../product-backlog-git-driver.mjs`, a deleted worktree. At review time `git config --get-regexp merge\.` shows the driver now pointing at `/Users/terryyin/git/pygardon-worktrees/frontend-unit-test-feedback/.claude/skills/dough-product-backlog/scripts/product-backlog-git-driver.mjs`, so it will break again when this worktree is retired. Observed effect: one backlog conflict resolved outside the driver during plan publication (cost not recorded). Inference: the driver command should resolve the script relative to the checkout running the merge (for example through `git rev-parse --show-toplevel`) rather than an absolute worktree path.

<a id="odf-184"></a>

## ODF-184 — Unbounded Git transport stalls managed delivery
An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished.

- **Follow-up:** queued, not resolved: [Managed delivery stops a stalled Git transport with a recoverable result](../../.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#bound-managed-git-transport) — SEED-008#bound-managed-git-transport.

- **2026-10-09 continuity:** Pygardon plan 277 / 0.3.46 push and Open Dough plan 274 / 0.3.57 fetch share `publication-git.mjs` unbounded `execFile` transport; relevant history through `e904c1f5` contains no timeout/SSH-liveness response. Two proven transport-stall executions (about 50 and 25 minutes). Cursor plan 273 has an unlocated stage and stays separately qualified as ODF-222; it is not a third proven network occurrence.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-184 — An unbounded SSH fetch stalled managed delivery](../../DearDough.md#odf-184--an-unbounded-ssh-fetch-stalled-managed-delivery).

Former local code: DD-253 (Claude Code plan 274 only).

`execution-increment-delivery.mjs deliver` remained running for about two hours after `agent-commit.mjs` had already recorded a successful commit SHA, so the story-branch tip stayed unpublished until the hung delivery was killed and deliver was rerun.



### Occurrences

- Execution: `SEED-119#recently-done-progressive-loading` / plan 274, first related implementation commit `62238f21` - Timestamp: unknown (slice 3 delivery of `a6dbc253`, committed 2026-10-08T01:54:24+09:00) - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: the first `deliver` returned `publication: reconciled, status: needs-validation` with `remoteTip` equal to the previously published base `988d0267`. The retry with `--validated-candidate` ran over 10 minutes, and `ps` showed `git fetch origin` / `ssh … git-upload-pack` alive for 15 minutes. After that fetch was killed, a manual fetch took 2 s and the retry was accepted. - Observed effect: about 25 minutes of delivery delay. The coordinator also truncated the first result with `cut -c1-300`, which lost its diagnostic fields. - Inference: Qualified. Same hang, here traced to `git fetch` over SSH with no time bound; a transient network stall; a bounded fetch/push with a named timeout result would have turned the hang into an explicit, retryable stop.



### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-184 — Managed delivery's git push stalled for about 50 minutes with no bound](../../../pygardon/DearDough.md#odf-184--managed-deliverys-git-push-stalled-for-about-50-minutes-with-no-bound).

Former local code: DD-175.

A stalled SSH push leaves managed delivery and the coordinator waiting about fifty minutes with no command bound.



- Execution: `.planning/slice-plans/277-telegram-qr-login-correction/PLAN.md` (recoverable at `07718623b`; Take `e16195cae`; first implementation commit `a09d0209e`); Timestamp: unknown (after slice 3 commit `862754596` at 2026-09-29T13:02:43+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. Evidence: process tree showed `git push origin 862754596…:refs/heads/story/telegram-qr-login-correction` and its `ssh git@github.com git-receive-pack` alive 49:07; remote tip stayed `d39c6cb00`; the first observer `/tmp/dough-ci-501/watch-xtvfiW` also reported `CI_MONITOR_UNAVAILABLE` (adapter fetch `TimeoutError`) in the same window. After killing that ssh process, one redelivery was accepted at once. Observed effect: about 50 minutes idle, no CI coverage for `a09d0209e`/`d39c6cb00` from the first observer. Inference: a network stall; a bounded push (for example SSH `ServerAliveInterval`) or a coordinator-side bound would turn the stall into a quick redelivery.

<a id="odf-185"></a>

## ODF-185 — Reported story gap filed as a learning

A reported preservation gap or provisional behavior is accepted as a learning without checking the whole story and the later slices that depend on it.

- **Follow-up:** implemented, unreleased; release verification and watch pending: [Keep reported gaps owned through the story's remaining slices](https://github.com/terryyin/open-dough/blob/ac8bdb6ca16dd347189867ef1df60a2ccd078c93/.planning/seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned) — SEED-125#keep-reported-gaps-owned.
- **Identity / limits (2026-10-09):** Restores the existing identity, rather than allocating from the release difference. Original Pygardon plan 280 reports a dropped searched parameter; Doughnut plan 008 / DD-214 accepts a named Stop/Record interim, then publishes a wrong-result race. Both file the reported gap as a learning without an explicit false out-of-scope judgment (ODF-139) or lost receiving-slice delegation (ODF-156). Current guidance assessed: `e904c1f5`.

- **Response / failed watch:** `b7930baf`, first released in 0.3.48, adds the goal/example check to `wrap-up.md` Accept proof. The same mechanism occurs in Doughnut plan 008 on 0.3.56; the rule remains in current guidance with no demonstrated intervening correction of follow-through. The 2026-09-30 watch fails; a later corrective release and verified use must start a fresh watch.
- **Later response (2026-10-10):** `43ef3b9b304b2ffb7ac64238f8c7c6d46ca676a3`, `9ab257c12fc4abfe0f8586fdbf00e5d53d5a3aaa` and `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b` keep reported preservation gaps and dependent interims open through slice and completion checks. Free CLI tests prove learning-only refusal, dependent ownership and last-dependent-slice refusal. Native proof recorded in `4ec755976033b4265f4a3e39c0c3f3aec7e94906` observes the 008 interim re-read against later wrong-result facts, conversion to slice-3 return and an actual refusing gate with earlier proof retained. The offered hide-Record alternative was not accepted as a product solution. [Proof and limits](https://github.com/terryyin/open-dough/blob/5bd862746d2789e9c34d05276a507f908d141bc7/.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md#4-a-native-host-coordinator-keeps-the-three-replayed-gaps-owned-developer-run). First containing release is unverified: the source response is unreleased on 0.3.57. No new watch has started; release verification and relevant later use remain pending, preserving the earlier failed watch.

**Earlier retained evidence — pygardon:**

### Earlier identity assessment (2026-09-30)

An implementer reports a dropped parameter that contradicts the story's preservation goal; acceptance records the gap as a learning and finishes the story.

- **Identity assessment (2026-09-30):** Related to ODF-139 false scope judgment, but here no explicit out-of-scope judgment is evidenced. Keep identities separate while selecting one response problem. Current guidance assessed: `babcbbc0` (released baseline 0.3.47); source execution releases remain as reported.
- **Retained execution:** pygardon; Execution: `.planning/slice-plans/280-search-candidate-order-intent/PLAN.md` (recoverable at `30c05783e`; Take `60cc8e2ba`; first implementation commit `b5b450dbb`); Timestamp: 2026-09-29T16:41:08+08:00 (slice 1 commit, which included the learning); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 hand-back "Chosen configuration": "The `benchmark_weight` gene (0.3) is not carried by `compose_tfdc_live_strategy`"; plan Learnings in `b5b450dbb`; `pygardon/search_run/eval_on_freeze.py:107` uses `project_genes_to_live_strategy`; correction plan `284-search-candidate-projection-correction`. Observed effect: the connected proof passed without detecting a lost searched parameter; the fix became one correction story instead of a slice-time stop. Inference: when a hand-back reports that a stage drops something the story promises to preserve, proof acceptance should test that report against the goal, not record it as a learning.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-185 — The coordinator accepted an interim "Record shows again during Stop" note; a later slice made it a wrong-result race](../../../doughnut/DearDough.md#odf-185--the-coordinator-accepted-an-interim-record-shows-again-during-stop-note-a-later-slice-made-it-a-wrong-result-race).

Former local code: DD-214.

An implementer named an interim behavior as a learning. It was accepted as
harmless without checking it against the story's examples, and later slices
built the result status on top of it.

### Occurrences
- Execution: SEED-066#understandable-first-dictation / `0662bac730:.planning/slice-plans/008-complete-a-first-dictation-with-understandable-controls/PLAN.md` / 31b9b7b7bb
  - Timestamp: unknown (slice 1 acceptance, before commit 2026-10-06T09:18:48+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION)
  - Evidence: slice 1 return "while Stop is still finishing, the main action already shows Record again", recorded in that plan's Learnings. At 9f8a52c7, `NoteAudioTools.vue` `startRecording` clears the passage saves, and the pending `stopRecording` `finally` overwrites `phase`. The correction was planned as `b63b742f8a:.planning/slice-plans/010-keep-the-dictation-result-true-while-stop-finishes/PLAN.md`.
  - Observed effect: none in use; the retrospective found it in the code. Pressing Record during "Turning your speech into text…" can report "No speech was turned into text." for added text, or hide Stop while recording.
  - Inference: proof acceptance reads named gaps against the goal. A named interim that later slices depend on needs the same reading when those slices are accepted. Qualified: one execution. In the same execution the coordinator did return slice 3's self-declared superseded-save gap for a same-slice fix.

<a id="odf-189"></a>

## ODF-189 — Small additions force unrelated size extractions
A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).
- **Response / limit:** File-size rule unchanged since b86175e4. Five Doughnut executions, latest 0.3.54; with ODF-152, ODF-195 and ODF-207 this is one rule family.

- **Additional evidence:** Doughnut 001-join-dictated-passages / ba66d94ad3, 2026-10-05, Codex, release unknown: a 249-line preservation spec grew to 304 and was split with 27 replacement mounted tests and typecheck, about four active refactor minutes. Production code did not change; no post-fix claim or net review-value claim is made.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-189 — A four-line repository tip-over forced extracting an unrelated assimilation query block](../../../doughnut/DearDough.md#odf-189--a-four-line-repository-tip-over-forced-extracting-an-unrelated-assimilation-query-block).

Former local code: DD-144.

A small addition crosses the numeric file-size ceiling and triggers relocation and re-proof of a substantial previously untouched responsibility.



- Execution: SEED-053#story-1 / `12c0f629ac:.planning/slice-plans/007-file-page-references/PLAN.md` / bc870053e8; Timestamp: 2026-09-28T12:37:00+08:00 through 2026-09-28T12:40:26+08:00 (Slice 2 refactor through delivery); Tool: Cursor; Model: gemini-3.8-flash; Open Dough release: 0.3.45. - Evidence: refactor transcript `ff698959-2f7d-4392-a127-0f3f0adcc8f8/subagents/2b60056d-ca4d-4cae-8a47-c79402587e9f` (decision pass: File size 254; learning "Slice 2's candidate query pushed NoteRepository over 250"); commit `bc870053` adds `NoteAssimilationQueries.java` and shrinks `NoteRepository.java`. Pre-Slice-2 `NoteRepository` at `c86eb7eba0` was 244 lines. - Observed effect: ~8 minutes of refactor time and an assimilation-focused re-proof (`AssimilationControllerTests`) for a tip-over caused by one new query. - Inference: the hard 250-line ceiling can force relocating a large untouched block when a small addition crosses it. Related in theme to ODF-152 (numeric check applicability), but here the agent performed the split rather than escalating a staged-simplification conflict.
- Execution: SEED-059#story-6 / slice-plans/056-change-or-clear-reading-mark / 7c9935b2c2; Timestamp: 2026-09-29T17:53+08:00 through 2026-09-29T18:12+08:00 (slice 2 implementation through refactor and delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. - Evidence: `7c9935b2c2:backend/src/main/java/com/odde/donut/controllers/NotebookBooksController.java` has 248 lines; the slice 2 DELETE endpoint added 15. The slice 2 refactor report ("pushed `NotebookBooksController.java` to 263 lines") split out `NotebookBookReadingController` (124 lines) and changed five controller test files. Commit 5cab6e8827 carries the repo's only `@Tag(name = "notebook-books-controller")`, so the generated SDK class stays unchanged. - Observed effect: the refactor pass took about 25 minutes, against about 12 for the slice's implementation, and needed a wider backend re-proof. The seam it chose, the user's reading progress versus the book's attach and structure, is domain-meaningful. - Inference: same tip-over pattern; here the split landed on a real seam but introduced a new convention (a shared OpenAPI tag across two controllers) to avoid touching the frontend.
- Execution: SEED-063#story-1 / slice-plans/007-track-property-values-separately / 8eaaf2b720; Timestamp: 2026-09-30T20:44:32+08:00 (slice 2b commit 178ddce040); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.50. - Evidence: slice 2b added one parameter to `MemoryTracker.buildMemoryTrackerForProperty`, taking `MemoryTracker.java` from 256 to 258 lines (already over 250 before the slice); the refactor pass moved the unrelated grade-scheduling step `scheduleNextRecallFromStability` into `MemoryTrackerRecallDue` and reran `*MemoryTracker*`, `RecallsControllerTests` and `*Fsrs*` (174 tests). In slice 7, `MemoryTrackerService` at 249 lines led the implementer to move `updatePropertyKey` into a new `PropertyMemoryTrackerService`. - Observed effect: an unrelated recall-timing move and wider re-proof in slice 2b; slice 7's move landed on a real seam that slice 8 then reused for reduce re-homing. - Inference: same tip-over pattern; one of the two moves was unrelated to the change.

- Execution: SEED-064#story-6 / `f347df3d514feccaeaff8dbce062bce1992e0cff:.planning/slice-plans/007-add-property-draft-row/PLAN.md` / c05b83ea2b8a5ed3b0bd1534d720fcd08f8c9539; Timestamp: unknown (2026-10-01, slice 3 and 4 refactor handoffs before 0470d6be2d and cb7c47b618); Tool: Codex; Open Dough release: 0.3.52 (unchanged VERSION in the established execution checkout). - Evidence: coordinator conversation, refactor3 reported propertyEntry at 271 lines and moved the unchanged rename/body-refresh guard into propertyRenameGuard.spec.ts; refactor4 reported notePropertyLocationMethods at 281 lines and extracted layout assertions into notePropertyLayoutMethods.ts. Commits 0470d6be2d and cb7c47b618 contain those moves; dough-post-change-refactor/references/refactor-checks.md requires every changed file to fit 250 lines. - Observed effect: two responsibility extractions plus replacement mounted and layout E2E proof, each refactor reporting about 3 minutes. - Inference: same numeric tip-over pattern on test support; the seams were cohesive, but proof relocation added work beyond the small Cancel and touch-height outcomes. Consider anticipating file-size capacity during slice planning; no product defect or instruction change is implied.

- Execution: SEED-066#preserve-existing-content / `979cac31fc19f756bdfc480d9b24f1ab7dfeec34:.planning/slice-plans/001-preserve-existing-content/PLAN.md` / 64173ad25fbbe7457705aeea972a959d9d3f8dd4; Timestamp: unknown (2026-10-03, slice 2 refactor); Tool: Codex; Open Dough release: 0.3.54 (VERSION unchanged from claim through implementation). - Evidence: refactor_append decision and return; noteStore was 252 lines before append, 265 after; processing spec reached 267. Commit 6c2ed996f7 extracts noteTextEditing and splits audio preservation tests. - Observed effect: the mandatory ceiling prompted an 80-line text-edit extraction, a test split, and expanded proof from 38 to 63 frontend tests plus integrated E2E; refactor reported about seven active minutes. - Inference: the seams were relevant and coherent, but the numeric gate expanded verification beyond the append change. This occurrence does not establish a net cost or an unrelated production move.

- Execution: SEED-066#join-dictated-passages / slice-plans/001-join-dictated-passages / ba66d94ad393c23015ae855375133c7a67779a5a
  - Timestamp: unknown (2026-10-05, slice 2 refactor)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: `refactor_language` decision/return in the execution conversation; preservation spec was 249 lines at ba66d94ad3, grew to 304, then e769c06a99 extracted language cases and shared saved-body test support.
  - Observed effect: approximately four active refactor minutes, two new test files, and replacement proof of 27 mounted tests plus typecheck; production code stayed unchanged.
  - Inference: the numeric ceiling prompted a cohesive test split and extra proof. Consider test-file capacity while planning; net review value and token cost were not measured.

- Execution: SEED-066#create-with-spoken-title / slice-plans/009-create-a-note-using-a-spoken-title / 201d79ed5d1e5705fd7c5ed3b7d82478120aa762
  - Timestamp: 2026-10-07T21:35+09:00 through 2026-10-07T21:40:25+09:00 (slice 3 refactor through delivery commit)
  - Tool: Cursor
  - Model: unknown
  - Open Dough release: 0.3.57
  - Evidence: slice 3 refactor transcript `4b9de79e-592d-4b5f-8a50-27f203804051` (decision pass: "NoteNewForm is at 250 (not over). Splitting the docs…"; new `docs/voice-input-observations.md`); pre-slice `61a6c94885:docs/voice-input.md` was already 265 lines; commit `201d79ed5d` keeps a ~115-line product doc and moves ~170 observation lines aside, retargeting SEED-066 anchors.
  - Observed effect: about ten refactor minutes plus observation-anchor retargeting for a small "Speaking a title in New note" section; product docs stay linked, no defect.
  - Inference: same tip-over pattern on an already-oversized docs file that entered the diff; the ceiling forced relocating previously untouched observation notes rather than only adding the spoken-title section.

<a id="odf-190"></a>

## ODF-190 — Planned observation route is unavailable
Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.

- **Follow-up:** delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).
- **Response / limit:** Delivered on main; first containing release pending. `3d148f25` requires observations to record the promised operation's result; `ac02ee79` makes readiness name an unreached premise operation. Release verification (2026-10-09): `git tag --contains 3d148f25` and `git tag --contains ac02ee79` both returned no tags. Native host evaluation remains unverified. Delivery is not itself proof that the mechanism has stopped recurring; relevant later use starts the watch, which has not started. Before this response: fcc29fad / 0.3.48 plausibly covers observation routes, but a third Doughnut execution on 0.3.54 (2026-10-03) again planned a paid journey with no available route. Not shown to resolve.

- **2026-10-06 assessment:** The `2c5ff71f` / 0.3.43 and `fcc29fad` / 0.3.48 diffs require establishing decisive premises and exercising their consumers. They did not prevent the reported mechanism on 0.3.56; no intervening correction of that mechanism is demonstrated. Current guidance assessed: `9de43de4`. The selected story reconsiders how those observations establish coverage, not another wording-only response.

- **Additional evidence:** Doughnut plan 008-keep-every-transcribed-sentence / d68937a0d2, 2026-10-04, Claude Code / 0.3.56: the local runner refused the live-service feature in a linked worktree; an owner round-trip and two direct paid calls preceded moving feature proof to CI. Actual feature proof and the manual check were distinct; the log retains that qualification. This is post-0.3.48 evidence of an unavailable planned route, not evidence that CI itself failed.

- **Last assessed (2026-10-09):** `3d148f25` and `ac02ee79` still have no containing tag. Later 0.3.57 executions are eligible evidence against the older 0.3.43/0.3.48 rules, not failures of this unreleased response; no age-based watch begins. Current guidance assessed: `e904c1f5`.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-190 — The plan prescribed production observations whose access route or log source did not exist, and whose results could not change the approach](../../../doughnut/DearDough.md#odf-190--the-plan-prescribed-production-observations-whose-access-route-or-log-source-did-not-exist-and-whose-results-could-not-change-the-approach).

Former local code: DD-145.

Planning names an observation route or log source that is not available to the executing project, causing owner probing or loss of the intended proof.



- Execution: SEED-051#story-1 / `f35fa810f1:.planning/slice-plans/009-retire-note-embeddings/PLAN.md` / 5003fbecc8; Timestamp: 2026-09-28T05:36:39Z–06:03:39Z (slice 1/3) and 2026-09-28T07:17:43Z–07:18:10Z (slice 10); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.45. - Evidence: four auto-mode denials while seeking a DB route (credential lookup, SSH to the app VM, probe edit to root, bucket IAM); owner: "But this wasn't needed uh, previously. Um, or can we skip this?"; coordinator's covering reasoning and skip recorded in d111968b62; slice 10 `gcloud logging read` found no Flyway lines, so sustained health became the D/P evidence (8e03ac5f5f). - Observed effect: about 27 minutes of owner-attended probing ended in skipping slice 1's SQL part and dropping slice 3; slice 10's named proof was replaced during delivery. No product defect. - Inference: planning could have asked, for each production observation, whether any result would change the approach, and whether the access route and log source exist (both checkable cheaply once `gcloud` auth worked). Related to DD-142 (prescribed observations dropped in execution), but here the cost was production access and owner time. Qualified: one execution; planning-time `gcloud` auth had failed.
- Execution: SEED-059#story-5 / slice-plans/053-pdf-smooth-scroll-after-choosing-block / 5989892325; Timestamp: 2026-09-29T21:45+08:00 through 22:10+08:00 (slice 1 attempts); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.47. - Evidence: plan 053's proof row "Manual observation … Chromium DevTools protocol or Playwright `mouse.wheel`" on the dev stack; the repo has no Playwright/Puppeteer, `.agents/agent-map.md` says linked worktrees refuse the persistent Development stack, and a throwaway Cypress spec sending CDP `mouseWheel` reached the DOM but scrolled 0 px in headless Electron and Chrome. - Observed effect: about 15 minutes of implementer time; the story's key example (every wheel step moves down) was delivered without its real-wheel observation. - Inference: same pattern in a local setting: the observation route could have been checked at planning from the agent map and `package.json`.
- Execution: SEED-066#preserve-completed-speech / `2b34db5abb:.planning/slice-plans/001-keep-completed-speech/PLAN.md` / 4070f526bc; Timestamp: 2026-10-03T07:02:48Z–07:32:53Z (owner question), 07:32:54Z–07:57:43Z (primary checkout detached and restored); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54 (execution-checkout VERSION, unchanged during execution). - Evidence: plan slice 1 states Development runs only from the primary checkout because linked worktrees refuse it, but slice 4 (the same paid journey on branch code) names no route; coordinator AskUserQuestion "Switch primary briefly / Defer / Drop"; primary detached at fd904bc2 and 1a981673, then restored to `main`, where `dev:restart` failed on a stale `dev.pid` (PID 597 reused by `accountsd`). - Observed effect: about 30 minutes waiting for the owner mid-execution, a shared checkout temporarily on branch code, and about 7 minutes restoring Development. - Inference: slice planning could have asked how a real-service proof reaches unmerged branch code and settled it with the owner before Take. Related to ODF-083 (shared checkout moved by an execution).
- Execution: SEED-066#keep-every-transcribed-sentence / `9ad1cedcc0:.planning/slice-plans/008-keep-every-transcribed-sentence/PLAN.md` / d68937a0d2; Timestamp: 2026-10-04 (slice 4, after 6ecad492f1 was pushed); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution). - Evidence: plan 008 Commands section names a local `pnpm cy:run --spec ...record_live_audio...` and slice 4 names the real-service feature run as proof; `scripts/isolated-cypress-spec-selection.mjs` refuses live-OpenAI specs in linked worktrees (`scripts/isolated-cypress.test.mjs` asserts the refusal). The owner authorized "Run the feature only"; the implementer's `cy:run` was refused, it then made two direct whisper-1 calls on `lecture.wav` (one output lost to a macOS `cat -A` pipe error) and the feature proof moved to the CI shard. - Observed effect: one owner round-trip, a refused run, two paid calls the owner had not specifically authorized, and a slice 4 proof that rests on CI plus an owner-pending manual run. - Inference: third SEED-066 occurrence of the same planning gap; the plan could have named CI as the branch route for the live spec. Qualified: the direct calls were small (3 s clip) and confirmed the open premise.

<a id="odf-195"></a>

## ODF-195 — Pre-existing size overrun handled inconsistently
Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).

- **2026-10-09 mapping:** Pygardon / DD-221, plan 314, release unknown: a 756-line pre-existing spec touched in two tests was split into six files, then later delegations explicitly prohibited such reorganization. Same inconsistent treatment of pre-existing overrun under the unchanged absolute size rule; no released correction or post-fix recurrence is established.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-195 — A refactor pass split a pre-existing oversized spec the slice had barely touched](../../../pygardon/DearDough.md#odf-195--a-refactor-pass-split-a-pre-existing-oversized-spec-the-slice-had-barely-touched).

Former local code: DD-221.

The post-change refactor skill limits candidates to issues the change introduced, exposed or materially aggravated. A refactor pass split a 756-line spec that was already oversized before the slice, which changed only two of its tests.

### Occurrences
- Execution: `SEED-089#story-frontend-tests-wait-on-events` (`.planning/slice-plans/314-frontend-tests-wait-on-events/PLAN.md`, removed at wrap-up, recoverable at `f9dc615`; Take `3499bae08`; first implementation commit `a7f8d4fe6`)
  - Timestamp: unknown (2026-10-06, slice 6 refactor before `1df294f49`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: unknown.
  - Evidence: slice 6 changed two polling tests in `frontend/src/pages/GitHubActionsMonitorPage.spec.tsx` (756 lines before the slice); its refactor report split that file into six concept files citing the 250-line limit and replaced a hand-written runtime-status mock with `runtimeStatusApiResponse()`; 83,307 subagent tokens; proof was rerun (21 tests, then full suite 197 files, 880 tests).
  - Observed effect: a 692-insertion slice commit for a two-test change; the coordinator accepted it as behavior-preserving and added an explicit "do not reorganize pre-existing oversized files" line to later refactor delegations, after which no pass did so.
  - Inference: the file-size check reads as absolute unless the aggravation gate is restated next to it; the split itself was useful but belonged to a separately chosen cleanup.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-195 — The file-size check split an untouched block in one slice of an execution and was waived in a later slice](../../../doughnut/DearDough.md#odf-195--the-file-size-check-split-an-untouched-block-in-one-slice-of-an-execution-and-was-waived-in-a-later-slice).

Former local code: DD-160.

Two refactor passes within one story treat barely touched, already oversized files differently, forcing an unrelated extraction in one and retaining another.



- Execution: SEED-059#story-2 / slice-plans/050-read-a-book-on-a-phone / d4a47402af; Timestamp: 2026-09-29T12:00+08:00 through 2026-09-29T12:40+08:00 (slice 1 and slice 3 refactor passes); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.46. - Evidence: slice 1 refactor report ("`BookReadingBookLayout.vue` is in the diff and was 354 lines, over the 250-line limit"; new `useBookLayoutBlockPointerDrag.ts`, commit d4a47402af); slice 3 refactor report ("`BookReadingContent.vue` is 453 lines … It was 474 before this change … I left it for the owner to decide"). Pre-change size: `1e19f8224a:frontend/src/components/book-reading/BookReadingBookLayout.vue` has 354 lines. - Observed effect: about 15 minutes of refactor time in slice 1, plus a desktop re-proof (`reorganize_layout.feature`, `book_browsing.feature`) for code the story did not touch. Slice 3 took the other path, with no extraction. - Inference: `refactor-checks.md` "File size" does not say whether a file that was already over the limit, and that a slice barely touches, must be split. Agents resolve this differently, and the time cost follows whichever reading they pick. Related to DD-144 (a small addition tipping a file over the limit) and ODF-152; here the file was over the limit before the change.

<a id="odf-201"></a>

## ODF-201 — Codex stream leaves delivered failures unacknowledged
The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

- **Follow-up:** released in 0.3.57: SEED-094#observe-ci-on-codex-and-cursor (story and plan recoverable at `0dc71704:.planning/seeds/SEED-094-ci-observation-for-codex-and-cursor.md` and `0dc71704:.planning/slice-plans/235-ci-observed-on-codex-and-cursor/PLAN.md`). **Evidence:** [open-dough](../../DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).
- **Response / limit:** First released in 0.3.57: the documented Codex binding acknowledges each notified batch through `ci-mailbox.mjs acknowledge`; a record never notified still retains shutdown. Native Codex evaluation (paid, manual) not yet run. Before it: nine Open Dough Codex executions, latest 0.3.54.

- **Release verification (2026-10-09):** Relevant response diff inspected; the first containing tag for 8ac67735 is `v0.3.57` (`b7962d57`, released 2026-10-07T07:31:16+09:00). All three projects adopted 0.3.57 on 2026-10-07 (Open Dough `69f22b57`, Pygardon `f536bb693`, Doughnut `4a4900df07`). Installation alone does not establish effectiveness or a watch start.
- **Watch eligibility:** released, effectiveness unverified; watch start unknown. No supplied matching use of the fixed Codex notified-batch acknowledgment boundary establishes a start. Older and unknown-release reports do not demonstrate a 0.3.57 recurrence.
- **New report:** Open Dough / DD-242, plan 262, describes the same missing durable acknowledgment, but execution release and modified revision are unknown. Inspection of the released binding shows the acknowledgment added by `8ac67735`; the report describes the old no-ack binding. Retain the report without inferring post-0.3.57 failure.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-201 — Codex stream notifications leave handled failures unread at completion](../../DearDough.md#odf-201--codex-stream-notifications-leave-handled-failures-unread-at-completion).

Former local code: DD-200.

Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding delivered failure notifications, but neither its consumer nor the stream worker advanced the mailbox's durable delivery cursor. After both failures were repaired, completion returned green CI while retaining shutdown for those same unread events. The worker was live and the stale events were actual repaired CI failures.



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

**Source:** [open-dough / ODF-201 — The Codex observer binding has no durable failure acknowledgment step](../../DearDough.md#odf-201--the-codex-observer-binding-has-no-durable-failure-acknowledgment-step).

Former local code: DD-242.

The prescribed yielded-stream binding forwards events with `notify` but never updates the mailbox's delivery progress. Completion separately treats unacknowledged failure events as actionable, even after a coordinator has classified and repaired them.



### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (after completion's failed receipt for `70b6f62a`, before its CI repair)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: retained observer `/tmp/dough-ci-501/watch-XLyt1z` had seven CI_FAILURE events for attempts `37427204231/1`, `37431359551/1`, `37432066761/1` and no `delivery.json`. The installed `ci-notify-codex.md` binding calls `notify` without `recordDeliveryProgress`; `ci-mailbox-complete.mjs` gates shutdown on `unreadActionableFailures`. After bounded log classification of all attempts, the coordinator used the installed exported store API to acknowledge exactly those seven events, preserving later events and the live repair observer.
  - Observed effect: one additional mailbox/source inspection and explicit acknowledgment outside the prescribed Codex binding. The first completion receipt itself correctly retained the observer for the failed revision.
  - Inference: Qualified. Source inspection shows that a later green completion would still retain this mailbox for unread failures without acknowledgment. That later refusal was prevented, not observed; absence of progress does not by itself establish that a notification was delivered to the model.

<a id="odf-204"></a>

## ODF-204 — Interrupted delegated agent keeps running and publishes
After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-204--an-interrupted-refactor-agent-went-on-to-commit-and-push-its-slice).
- **Response / limit:** One Cursor execution on 0.3.54; severe one-off, possibly host-side. Related to ODF-059; not the same mechanism.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-204 — An interrupted refactor agent went on to commit and push its slice](../../DearDough.md#odf-204--an-interrupted-refactor-agent-went-on-to-commit-and-push-its-slice).

Former local code: DD-215.

After the developer interrupted the coordinator's call to a delegated refactor agent, the agent kept working. It committed and pushed the slice to the remote execution branch, and it marked the slice done in the plan. Its delegation said not to commit, push, or edit the plan. Meanwhile the coordinator had started a second refactor agent and its own formatter in the same checkout.



### Occurrences

- Execution: `SEED-052#cursor-native-activity-and-controls` / plan 217, first related implementation commit `7053bc62`
  - Timestamp: 2026-10-02T17:05:38+08:00 (reflog time of commit `a406dd10`)
  - Tool: Cursor (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION`)
  - Evidence: the slice 3 refactor `Task` call was "interrupted by the user after 99795ms". After "continue", the checkout held an uncommitted `PLAN.md` edit setting slice 3 to `Status: done`. That edit also claimed the spec passed "including after the refactor", with no run in the record. The coordinator reverted the edit and started a fresh refactor agent. While the coordinator ran `npm run format`, `a406dd10` appeared, authored by `mrsn-chan`, with the slice 3 code, docs and an intermediate spec, and `git ls-remote` showed it on `origin/cursor/choose-a-cursor-model-when-starting-work`. `ps` then showed no other writer.
  - Observed effect: a publication outside coordinator delivery, with no CI registration, plan record or format gate first. It needed a developer decision (accept `a406dd10` and deliver `69634abd` on top). Two writers were briefly active in one checkout.
  - Inference: Qualified. The record shows the interrupted agent kept running. Whether the interrupt failed to stop it or it read the later "continue" as its own instruction is unknown. The delegation's no-commit rule did not hold once the coordinator lost the agent's return.

<a id="odf-205"></a>

## ODF-205 — Execution starts on a red trunk unannounced
Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own.

- **Follow-up:** Open, unqueued. **Evidence:** [open-dough](../../DearDough.md#odf-205--execution-started-on-a-red-trunk-and-spent-ci-triage-on-a-failure-it-did-not-own).

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-205 — Execution started on a red trunk and spent CI triage on a failure it did not own](../../DearDough.md#odf-205--execution-started-on-a-red-trunk-and-spent-ci-triage-on-a-failure-it-did-not-own).

Former local code: DD-217.

The claim was taken on a trunk whose CI had already failed `agent-session-cursor.spec.ts:117`. Nothing at startup reported it, so each story-branch publication brought it back as a new failure to classify. Clearing the branch then needed a developer-authorized repair of another change's stale assertion.



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

<a id="odf-206"></a>

## ODF-206 — Over-budget slice not stopped
The slice time bound is checked only at hand-back, so a delegated slice runs past it and is accepted or extended without re-sizing.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-206--a-slice-ran-past-the-ten-minute-stop-rule-without-a-coordinator-stop).

- **2026-10-09 mapping:** Doughnut / DD-217, plan 011, release unknown: real disposable-worktree preparation and repeated hook proof contributed to two accepted 10.5–12 minute overruns. This adds a fifth project/execution to the hand-back-only budget boundary, with no retry/revert and the unplanned hook defect qualified. Setup cost is evidence, not proof that every overrun is preventable.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-206 — A slice ran past the ten-minute stop rule without a coordinator stop](../../../pygardon/DearDough.md#odf-206--a-slice-ran-past-the-ten-minute-stop-rule-without-a-coordinator-stop).

Former local code: DD-190.

The delegation carried a roughly ten-minute stop rule, but nothing surfaced elapsed time until the hand-back.



- Execution: `.planning/slice-plans/180-sharadar-strategy-verify/PLAN.md` (removed at wrap-up, recoverable at `66808338f`; Take `04a082f61`; first implementation commit `ed0947934`); Timestamp: 2026-10-01T13:42:44+08:00 (slice 10 commit `46ac6844a`); Tool: Claude Code; Model: claude-sonnet-5-5; Open Dough release: unknown. Evidence: agent durations in the notifications: slices 2-6 returned after about 2.2 to 5.2 minutes; slice 10 returned after about 12.7 minutes (760,276 ms) and was then resumed for a follow-up request, with the same agent reporting idle at about 42 minutes (2,524,000 ms) after an unbounded pytest escape (DD-189). Observed effect: the over-budget slice was accepted and extended with an extra request instead of being stopped and split; the plan kept it as one slice. Inference: the stop rule is only checked at hand-back, so a long run cannot trigger it; the extra benchmark-attribution request was valuable but was added without re-sizing.
- Execution: `SEED-078#story-sharadar-daily-update` (`.planning/slice-plans/296-sharadar-daily-update/PLAN.md`, removed at wrap-up, recoverable at `f93f2014b`; Take `bc246ad45`; first implementation commit `fed1b745b`); Timestamp: 2026-10-03T09:38:12+08:00 (slice 8 commit `c600bc70c`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: implementation agent durations from task notifications: slice 1 82 s, slice 4 429 s, slice 6 439 s, slice 8 731 s; slice 4's refactor pass 384 s. Observed effect: slice 8 (shutdown, release reservation and interruption) ran about 12 minutes and was accepted as one slice; no slice was stopped at ten minutes. Inference: same hand-back-only check as the earlier row; the five-minute hypotheses for lifecycle slices were disproved without re-sizing.
- Execution: `SEED-078#story-switch-daily-source` (plan `.planning/slice-plans/301-switch-daily-source/PLAN.md` at `1c043162e`; Take `7b6e26599`; first implementation commit `578a568fb`); Timestamp: 2026-10-03T16:54:21+08:00 (slice 5 hand-back; commit `dea5776e9` 16:59); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.54. Evidence: implementation agent durations from task notifications: slices 6, 8, 4, 1, 2, 3 and 7 took 63-278 s; slice 5 (`a3fdce862c2acbd8b`) took 1,462,503 ms (about 24 minutes). Its commit touched 29 files: the new mount-time daily-research-source request on Strategy Verify needed mocks in about ten existing Verify specs, plus a new E2E publish step through the local Sharadar vendor. Observed effect: the slice was accepted as one slice with no stop at ten minutes and no plan note on its size. Inference: same hand-back-only check; the plan did not foresee that a new request on page mount reaches every spec of that page.
- Execution: `SEED-095#story-ci-explains-unstarted-check` (`.planning/slice-plans/315-ci-explains-unstarted-check/PLAN.md`, removed at wrap-up, recoverable at `5479a895d`; Take `cd27becc3`; first implementation commit `b6f38b7f0`); Timestamp: unknown (2026-10-06, slice 1 hand-back before `b6f38b7f0` at 2026-10-06T09:14:13+09:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.56. Evidence: the slice 1 implementation agent returned after about 31 minutes (1,877,600 ms, 91k subagent tokens) against a delegation that said to stop past about ten minutes; slices 2-4 returned after about 2.4, 1.5 and 3.9 minutes. Its report names one new spec that timed out at the 60 s hang bound because `ciGetResult` in `frontend/src/pages/ciPageTestHelpers.tsx` drops unlisted fields. Observed effect: the over-budget slice was accepted without an oversized stop; the cause was recorded as a plan learning and later slices did not repeat it. Inference: the hang-bound wait explains about one minute per run, not the whole overrun; the rest is unattributed from the hand-back alone.



### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-206 — Tooling slices sized at 5–8 minutes ran 10.5–12 minutes because real proof needed fresh disposable worktrees](../../../doughnut/DearDough.md#odf-206--tooling-slices-sized-at-58-minutes-ran-10512-minutes-because-real-proof-needed-fresh-disposable-worktrees).

Former local code: DD-217.

Plan sizing counted the code change but not the required real proof. Each
real hook proof created and prepared a disposable worktree, then ran several
real hook invocations. The slices converged with complete proof, so they were
recorded as overruns rather than refined.



### Occurrences
- Execution: SEED-070#fast-warning-free-commit-hook / `b1dab1d7ed:.planning/slice-plans/011-fast-warning-free-commit-hook/PLAN.md` / f53bee8004
  - Timestamp: 2026-10-07, about 21:20–22:25+09:00 (slices 1 and 6 delegations)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: slice 1 implementation agent took 628 s and slice 6 took 714 s by the host task duration (plan budget 5–8 min, hard limit 10). Slice 6 found a pre-existing lockfile rewrite during its real negative proof and fixed the hook too. Slices 4 and 7 with similar proof took about 5–6 min.
  - Observed effect: two hard-limit overruns, recorded in the plan; no retry or revert.
  - Inference: when a slice's proof needs a fresh prepared worktree and many real tool runs, sizing could count that setup separately. Qualified: one execution; the slice 6 overrun also included an unplanned defect fix.

<a id="odf-207"></a>

## ODF-207 — Size convention missing from implementation delegation
Implementation handoffs omit the file-size convention the refactor pass enforces, so newly created files are split after proof and the proof reruns.

- **Follow-up:** Open, unqueued. **Evidence:** [pygardon](../../../pygardon/DearDough.md#odf-207--refactor-passes-repeatedly-split-files-the-same-slices-implementation-had-just-created-over-the-size-convention).
- **Response / limit:** Related to ODF-152, ODF-189 and ODF-195 (same unchanged 250-line rule); distinct cause.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-207 — Refactor passes repeatedly split files the same slice's implementation had just created over the size convention](../../../pygardon/DearDough.md#odf-207--refactor-passes-repeatedly-split-files-the-same-slices-implementation-had-just-created-over-the-size-convention).

Former local code: DD-204.

Implementation delegations did not carry the 250-line file convention that the refactor pass enforces, so refactor passes in six of eleven slices split newly written test or module files and reran proof.

### Occurrences
- Execution: `SEED-078#story-sharadar-daily-update` (`.planning/slice-plans/296-sharadar-daily-update/PLAN.md`, removed at wrap-up, recoverable at `f93f2014b`; Take `bc246ad45`; first implementation commit `fed1b745b`)
  - Timestamp: unknown (2026-10-03, slices 4, 6, 7, 8, 9 and 10 refactor passes, about 08:30 to 10:20 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: refactor reports split `job_scheduler_schema.py` (299 lines), `test_sharadar_job_settings_api.py` (292), `test_scheduler_status_concurrency.py` (500), `test_sharadar_scheduled_failure_reporting.py` (321), `test_sharadar_scheduled_wake.py` (346), `test_sharadar_job_lifecycle.py` (300), a Sharadar settings spec (277) and `JobsPage.sharadarJob.test.tsx` (309); refactor agents used 54k to 106k tokens each.
  - Observed effect: proof was invalidated and rerun after each split; behavior unchanged.
  - Inference: stating the file-size convention in implementation delegation would let agents place code once; cost is qualified by the reruns, not measured separately.
- Execution: `SEED-069#story-consistent-classification` (`.planning/slice-plans/299-sharadar-classification/PLAN.md`, removed at wrap-up, recoverable at `c7c3544ac`; Take `5dce13078`; first implementation commit `650f1623e`)
  - Timestamp: unknown (2026-10-03, slices 2, 5 and 7 refactor passes, about 12:40 to 13:45 +08:00).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.54.
  - Evidence: refactor reports split `DataSourceSymbolDetailPage.tsx` (332 lines) into `SymbolMetadataDetails.tsx`, the signals route (260) into `auto_trading_signal_responses.py`, and trimmed `test_auto_trading_exit_settings_api.py` from 251 to 250 lines by deleting the `applied_live_strategy_id` assertion, which was the slice's proof that the capped strategy manages the unlabeled holding; the coordinator restored it merged into an existing line before committing `400e5454f`.
  - Observed effect: the size convention again drove post-implementation restructuring, and once pushed a refactor to remove a proof-bearing assertion.
  - Inference: the convention competes with proof preservation when a file sits at the limit; the delegation still did not state the convention.

<a id="odf-208"></a>

## ODF-208 — Observer worker exits without a recorded cause
The CI observer's worker exits mid-execution without a terminal result or a reported transport error, ending notification coverage.

- **Follow-up:** Open, unqueued. **Evidence:** [doughnut](../../../doughnut/DearDough.md#odf-208--the-ci-observers-worker-exited-without-a-terminal-result-with-no-recorded-cause).
- **Response / limit:** One Doughnut execution on 0.3.54; the loss was detected and announced. Relationship to ODF-121 (transient transport failure) is not established, so this is a separate identity.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-208 — The CI observer's worker exited without a terminal result, with no recorded cause](../../../doughnut/DearDough.md#odf-208--the-ci-observers-worker-exited-without-a-terminal-result-with-no-recorded-cause).

Former local code: DD-202.

Mid-execution, the delivery hook reported that the observer's worker had exited without recording a normal terminal result. No transport error or other cause was reported.

### Occurrences
- Execution: SEED-066#preserve-completed-speech / `2b34db5abb:.planning/slice-plans/001-keep-completed-speech/PLAN.md` / 4070f526bc
  - Timestamp: 2026-10-03T07:50:52Z (hook notice)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (execution-checkout VERSION, unchanged during execution)
  - Evidence: PostToolUse hook "CI observer lost its worker for this coordinator: /tmp/dough-ci-501/watch-ZXmzAO (CI observer worker exited without recording a normal terminal result)"; coordinator then read results with `gh run list --branch claude/keep-completed-speech-as-dictation-continues`.
  - Observed effect: notification coverage ended for the published slices; the coordinator confirmed CI manually. No failure was missed.
  - Inference: the cause is unknown and is not established as the transient-network ending of ODF-121. The stale `dev.pid` seen minutes later (see ODF-190) suggests process churn on the machine, but no link is shown. Qualified: one occurrence.

<a id="odf-209"></a>

## ODF-209 — Concurrent CI reproduction overloads slice proof

Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof.

- **Source:** [open-dough / DD-221](../../DearDough.md#odf-209--an-asynchronous-ci-repairs-repeated-reproductions-ran-beside-the-slices-full-suite-on-one-machine).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-172’s unpaired measurements, but concurrent repair pressure disrupting another proof is a distinct cause. One 0.3.54 execution; no net cost beyond the reported waits is inferred. Current guidance assessed: `9de43de4`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-209 — An asynchronous CI repair's repeated reproductions ran beside the slice's full suite on one machine](../../DearDough.md#odf-209--an-asynchronous-ci-repairs-repeated-reproductions-ran-beside-the-slices-full-suite-on-one-machine).

Former local code: DD-221.

While slice 5's full suite and refactor tests ran in the execution checkout, a CI repair reproduced its failure with many repeated, many-worker runs in a separate checkout on the same machine. The combined load produced failures caused by load alone in both, and longer proof.



### Occurrences

- Execution: `SEED-091#dashboard-frame-renovation` / plan 230, first related implementation commit `fdcc45f6`
  - Timestamp: 2026-10-03T17:23:00+08:00 (repair agent start, approximately; it ran until about 17:45 +08:00)
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.54 (installed `dough-update/VERSION` at claim `bb9cda47`)
  - Evidence: the CI repair for run 37111699644 ran `--repeat-each 24/30` with 6–12 workers in a temporary worktree while slice 5's full suite (about 17:18–17:21 +08:00) and its refactor pass's tests (until about 17:38 +08:00) ran; load averages reached 83–89. The repair reported six load-only failures; the refactor pass saw `codexEffortDialogCases.ts:114/:166` fail once and reran `agent-launch-codex-model` four times (10.6 minutes against about 2 for the other slices' passes); slice 5's delivery took about 6 minutes against about 1.3.
  - Observed effect: extra reruns and diagnosis of load-only failures; no wrong verdict was accepted.
  - Inference: Qualified. The published guidance runs CI repair concurrently with slice work and says nothing about shared machine load; one sample.

The plan-264 occurrence’s concrete shared `dashboard/test-results` collision
is now retained with [project DD-246](../../ProjectFindings.md#dd-246). Its repository
test-output mechanism belongs there; the general question of coordinating
concurrent CI repair and slice proof across a shared machine remains here.

<a id="odf-210"></a>

## ODF-210 — Removal proof omits an existing user capability

A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective.

- **Source:** [open-dough / DD-234](../../DearDough.md#odf-210--removing-a-panel-path-lost-the-only-mark-as-done-of-cardless-unavailable-reported-sessions-unseen-until-retrospective).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-074/110 and ODF-156, but there was no reported gap or lost handoff: the removed path’s Mark as done capability was never inventoried. Plan 249 locally repairs the delivered product outcome; it does not establish a shared process correction. Current guidance assessed: `9de43de4`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-210 — Removing a panel path lost the only Mark as done of cardless unavailable reported sessions, unseen until retrospective](../../DearDough.md#odf-210--removing-a-panel-path-lost-the-only-mark-as-done-of-cardless-unavailable-reported-sessions-unseen-until-retrospective).

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

<a id="odf-211"></a>

## ODF-211 — Admission is ambiguous for an unlanded story correction

An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code.

- **Source:** [open-dough / DD-237](../../DearDough.md#odf-211--a-retrospective-correction-of-an-unlanded-story-could-not-be-admitted-where-its-code-lives).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-123’s plan-during-execution handoff, but the new mission-admission rule and existing-claim exemption create this distinct ambiguity. One refused call, then correction under the current claim; no new admission authority or implementation is inferred. Current guidance assessed: `9de43de4`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-211 — A retrospective correction of an unlanded story could not be admitted where its code lives](../../DearDough.md#odf-211--a-retrospective-correction-of-an-unlanded-story-could-not-be-admitted-where-its-code-lives).

Former local code: DD-237.

The admission guidance names a retrospective's accepted follow-up correction
as a mission to admit, but admission requires a separate owned workspace based
on remote trunk. A correction to a story still on its execution branch needs
that branch's code, which trunk does not hold yet.



### Occurrences

- Execution: `SEED-088#review-since-correction` / plan 251, first related implementation commit `440ad871`
  - Timestamp: unknown (between the plan 245 completion record `94ab0b57` committed 2026-10-05T15:04:40+09:00 and `440ad871` committed 2026-10-05T17:07:41+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`)
  - Evidence: after the developer said "do it before wrap up", `execution-start.mjs start --admit` with the story's own workspace and branch answered `{"ok":false,"status":"invalid-request","error":"queued work requires a separate owned workspace"}`. `admit-accepted-work.md` lists "a retrospective's follow-up correction accepted for execution" as a mission, and also exempts "a supporting step of an active story". The coordinator ran the correction under the story's existing claim on its branch.
  - Observed effect: one refused call; the correction was delivered on the story branch with no Taken entry of its own.
  - Inference: Qualified. A correction that must land with its unlanded story fits the "supporting step of an active story" exemption better than admission, but the guidance does not say which applies, so the coordinator had to try admission first to find out.

<a id="odf-212"></a>

## ODF-212 — Acceptance misses an ADR outside the named brief

Acceptance checks only the ADRs the brief names and publishes a write path that conflicts with another Accepted writer-ownership decision.

- **Source:** [pygardon / DD-218](../../../pygardon/DearDough.md#odf-212--an-approved-store-change-was-checked-only-against-the-adrs-the-brief-named-missing-an-accepted-writer-ownership-rule).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Distinct from a factual premise about code: an architectural constraint was omitted from the acceptance boundary. One 0.3.56 execution; the report says an owner decision was needed before integration and establishes no production impact. Current guidance assessed: `9de43de4`.

### Retained source evidence — pygardon (2026-10-09)

**Source:** [pygardon / ODF-212 — An approved store change was checked only against the ADRs the brief named, missing an Accepted writer-ownership rule](../../../pygardon/DearDough.md#odf-212--an-approved-store-change-was-checked-only-against-the-adrs-the-brief-named-missing-an-accepted-writer-ownership-rule).

Former local code: DD-218.

Slice acceptance checked the ADRs named in the owner's decision. It missed a third Accepted ADR that the new service-start write crossed. The retrospective's whole-product review caught it after delivery.

### Occurrences
- Execution: SEED-092#story-ci-verdict-under-three-minutes (`.planning/slice-plans/312-ci-verdict-under-three-minutes/PLAN.md`, removed at wrap-up, recoverable at `5f44c3a71`; Take `f72b1da02`; first implementation commit `a80c1567f`)
  - Timestamp: unknown (2026-10-04; slice 2 accepted before `a80c1567f` at its commit time, found by the retrospective after `bebf57520`).
  - Tool: Claude Code.
  - Model: claude-opus-5-5.
  - Open Dough release: 0.3.56.
  - Evidence:
    - The slice 2 brief and the coordinator's acceptance cited only ADR-0004 and ADR-0008.
    - `bootstrap_provisioned_planes` (`pygardon/plane_provisioning.py`), called at service start (`pygardon_service/service_lifecycle.py:88`), opens `search_runs.duckdb` for writing.
    - ADR-0003 (Accepted, line 22) says "Search CLI owns search-run writes. Other consumers use read access."
  - Observed effect: an ADR conflict published on the story branch, now an owner decision before integration. No production impact yet.
  - Inference: when a slice changes which process opens a store, or how it opens it, running `dough-adr-awareness` across all Accepted ADRs at acceptance, not only the ones the brief names, would catch writer-ownership rules.

<a id="odf-213"></a>

## ODF-213 — Refinement reproduces a test mechanism already forbidden

Refinement makes reproducing a flaky mock the prerequisite for a remedy although the project’s existing rules already forbid that mock.

- **Source:** [doughnut / DD-204](../../../doughnut/DearDough.md#odf-213--refinement-planned-a-search-to-reproduce-a-flaky-mock-but-the-projects-test-rules-already-forbade-that-mock).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-148’s conflicting refinement examples, but no same cause is established: this is remedy framing against an existing test constraint. One 0.3.56 execution with owner-approved probes, about 107 minutes and 630k reported reproduction tokens before removal. Current guidance assessed: `9de43de4`.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-213 — Refinement planned a search to reproduce a flaky mock, but the project's test rules already forbade that mock](../../../doughnut/DearDough.md#odf-213--refinement-planned-a-search-to-reproduce-a-flaky-mock-but-the-projects-test-rules-already-forbade-that-mock).

Former local code: DD-204.

A story about an intermittent CI failure in a module mock planned a bounded
search to reproduce it ("no fix without a reproduction"; mock changes excluded).
Nobody first checked whether the mocked module should be mocked under the
project's own test rules. The `unit-testing` skill says to mock only external
dependencies, and the mocked `useRecallData` is in-process state with setters.

### Occurrences
- Execution: SEED-039#mainmenu-mock-flake / `8ab270cae5:.planning/slice-plans/006-automocked-specs-pass-reliably/PLAN.md` / 74b20fdcac
  - Timestamp: 2026-10-03T18:54:53+08:00 (plan committed) through 2026-10-03T22:00:06+08:00 (owner rescope committed)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: plan premises and scope excluded "a change to the mocks without a reproduced cause". Slice 1 ran four owner-approved reproduction rounds: local instrumentation, a standalone suite with 1,940 runs, a Linux container with 23 shard runs, and a Vitest version diff. None reproduced the failure (Learnings in 99089600b4). The owner then asked "what is the feature it is testing? Does it have to be implemented in this way?" and said "this test is wrong from the very beginning". `.agents/skills/unit-testing/SKILL.md` already says "Do not mock unless external or exceptional". Slices 2–4 removed the mocks in about 30 minutes of agent work (74b20fdcac, c7944701f2, 330cd1820b).
  - Observed effect: about 107 minutes and about 630k tokens of reproduction-agent work (1,465 s + 674 s + 4,256 s by the hand-back records), three owner round-trips, and Docker cleanup, before a fix that needed no reproduction.
  - Inference: when refining a story about a failing test mechanism, check the failing mechanism against the project's test rules first. A mechanism the rules forbid is a removal story, not a reproduction search. Qualified: one execution. The reproduction search was owner-approved at each round, so the cost comes from how the story was framed, not from a broken execution step.

<a id="odf-214"></a>

## ODF-214 — A planned real observation loses a contract distinction

Replacing captured router push/replace calls with current-location proof cannot distinguish the behaviors the story promises to preserve.

- **Source:** [doughnut / DD-206](../../../doughnut/DearDough.md#odf-214--a-slice-plan-told-the-implementer-to-replace-a-pushreplace-assertion-with-a-current-location-check-which-drops-the-replace).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to ODF-187’s ineffective planned observations, but the discarded contract distinction is a different concrete cause; keep a separate identity. One 0.3.56 execution; history-position proof restored the distinction before delivery. Current guidance assessed: `9de43de4`.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-214 — A slice plan told the implementer to replace a push/replace assertion with a current-location check, which drops the replace](../../../doughnut/DearDough.md#odf-214--a-slice-plan-told-the-implementer-to-replace-a-pushreplace-assertion-with-a-current-location-check-which-drops-the-replace).

Former local code: DD-206.

The plan said to assert the router's current location instead of a captured
`replace`/`push`. A location check cannot tell a replace from a push, so
following the plan weakened an assertion the same plan forbade weakening.

### Occurrences
- Execution: SEED-039#internal-mocks-to-real-modules / slice-plans/009-frontend-specs-run-real-internal-modules / a70529a3fb
  - Timestamp: unknown (slice 10 acceptance on 2026-10-04, about 09:55 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (execution-checkout VERSION, unchanged during execution)
  - Evidence: plan slice 10: "`AddRelationship.spec.ts` and `WikidataAssociationDialog.titleActions.spec.ts` assert `replace`/`push`; assert the current location instead." Plan Goal and scope: "without weaker assertions". The implementer reported the loss as a gap; the coordinator returned the slice, and the implementer added a history-position check (later `countHistoryEntriesAdded`), shown to fail for a push. Commit f7cc9a2293.
  - Observed effect: one extra implementation round (about 3 minutes, 76,592 subagent tokens in total for the slice's implementer). No weakened assertion was delivered.
  - Inference: when a plan swaps a mock observation for a real one, check that the real observation still tells apart every case the mock did. Qualified: one occurrence.

<a id="odf-216"></a>

## ODF-216 — Landing retires a workspace with a remaining continuation

Explicitly authorized landing removes an execution workspace while the Taken story still has a final real-stack check and wrap-up owed.

- **Source:** [doughnut / DD-212](../../../doughnut/DearDough.md#odf-216--landing-retired-the-execution-workspace-while-its-final-slice-still-needed-a-continuation).
- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-06):** Related to historical ODF-084’s unknown remover of a running worktree, but here authorized Dough Land retired a landed checkout despite a saved continuation. Guidance release unknown; continuity or a failed retirement fix cannot be established. One execution, implementation preserved, takeover needed. Current guidance assessed: `9de43de4`.

### Retained source evidence — doughnut (2026-10-09)

**Source:** [doughnut / ODF-216 — Landing retired the execution workspace while its final slice still needed a continuation](../../../doughnut/DearDough.md#odf-216--landing-retired-the-execution-workspace-while-its-final-slice-still-needed-a-continuation).

Former local code: DD-212.

Landing and story completion were correctly distinguished in the response, but
the unfinished execution's saved workspace and branch were removed. The story
remained Taken while its terminal session later stopped.

### Occurrences
- Execution: SEED-069#reliable-development-stack-lifecycle / `404892b54af9d40804a0309c8bd92204d41c3e7d:.planning/slice-plans/006-stop-and-restart-development-stack/PLAN.md` / 4101f03be4
  - Timestamp: 2026-10-05T17:05:29+09:00 (retirement)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: native session `26f67388-7040-4fff-b68a-786f5f7e7b95` landed `77df78ed15` after the owner's `/dough-land`, then received `worktree: removed`, `branch: removed`, `remoteBranch: removed`. Its completion message explicitly retained slice 4 and wrap-up; the saved session cwd and dashboard start still name the removed worktree. Dashboard `doneAt` is 2026-10-05T21:52:08+09:00; native job state is `stopped`. The owner subsequently asked why the Taken story had neither a worktree nor an attached session.
  - Observed effect: an investigation and takeover were needed to recover the remaining real-stack check and closure. Implementation was preserved on main; no code or data was lost.
  - Inference: when an approved proof runs after landing, the workflow could retain a usable continuation checkout and its remaining obligation before retiring the execution workspace. Qualified: one execution; who marked the dashboard session done is not established.
- Execution: SEED-066#prompt-dictation-results / `a4c70254e7:.planning/slice-plans/007-see-submitted-dictation-promptly/PLAN.md` / dd875812e5
  - Timestamp: 2026-10-06T11:12:06+09:00 (owner's merge b86f649322, pushed to `main` and the story branch)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56
  - Evidence: PLAN.md slice 3 was "after landing on `main`" (Development measurement). After slice 2 the coordinator stopped, reported the execution unfinished, and named `/dough-land` as the next step. The owner answered "not sure landing is the right action. Just sync to main." A merge-and-push to `main` was then refused by the session's permission classifier, and the owner ran it by hand. Slice 3 continued in the retained worktree and was published as f50c7dcef6.
  - Observed effect: one extra stop, one owner question, one refused command, and one manual owner command. The workspace was kept, so there was no takeover.
  - Inference: the same gap as the first row, avoided this time by the owner. The workflow names no step that puts a story's code on trunk while keeping the execution workspace for a post-integration slice. Matching uncertainty: here the plan, not landing, put a slice after integration.

<a id="odf-217"></a>

## ODF-217 — Unverified refactor proof effects

A refactor return calls changed behavior identical or type-only, and accepted proof is reused without checking the actual changed surface and its reached consumers.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** Open Dough / DD-239 and DD-248 are two executions of this proof-effects misclassification: a shipped CSS change on 0.3.56 and a runtime caller failure caught before delivery on 0.3.57. ODF-051 concerned claimed dependency removals absent from a diff; a shared cause is not established, so its retired identity is not reused. The 0.3.57 consumer-acceptance response caught the second failure when the coordinator finally reran the spec; it does not establish correct refactor classifications. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-217 — A refactor return called a styling change a merge of identical rules, and acceptance did not read the hunk](../../DearDough.md#odf-217--a-refactor-return-called-a-styling-change-a-merge-of-identical-rules-and-acceptance-did-not-read-the-hunk).

Former local code: DD-239.

### Occurrences

- Execution: `SEED-107#recently-done` / plan 253, recoverable at `1f929859491bc26285d64eface2d147f1ceee4a2:.planning/slice-plans/253-dashboard-recently-done/PLAN.md`; first related implementation commit `0f334e41e1114aa609cbea0091836448ef1eb0de`
  - Timestamp: 2026-10-06T10:37:37+09:00 (commit `53333034`)
  - Tool: Claude Code (delegated refactor agent; coordinator accepted)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.56 (installed `dough-update/VERSION`, last updated by `b0bc3a08`)
  - Evidence: slice 4's refactor return said "the two identical `.session-entry { background: var(--panel) }` rules are merged into one selector pair". `git show 53333034 -- dashboard/src/agent-launch.css` deleted `.card-sessions .session-entry { background }` and put that selector in front of `.launch-local { color: var(--quiet) }`. No spec observes the style; the retrospective's outcome review found it.
  - Observed effect: work-card sessions lost their panel background and turned quiet; done-card sessions never got the background. A correction was planned after delivery.
  - Inference: Qualified. The return reported the CSS as unchanged in proof terms, and the coordinator reused accepted proof without inspecting the newly affected style hunk. One sample.

**Source:** [open-dough / ODF-217 — A refactor return's proof-effects section left reached consumers unrun, once on a wrong "type-only" claim](../../DearDough.md#odf-217--a-refactor-returns-proof-effects-section-left-reached-consumers-unrun-once-on-a-wrong-type-only-claim).

Former local code: DD-248.

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

<a id="odf-218"></a>

## ODF-218 — Formatting invalidates a pre-format size check

The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** One Open Dough / DD-241 execution, plan 262; release unknown. Distinct from ODF-152/189/195 scope conflicts: the already-accepted numeric check is invalidated by a downstream required operation. One prose-only repair, no behavior change or failed released response established. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-218 — A refactor file-size check was invalidated by the required downstream formatter](../../DearDough.md#odf-218--a-refactor-file-size-check-was-invalidated-by-the-required-downstream-formatter).

Former local code: DD-241.

The independent refactor returned changed files within the 250-line limit, but the coordinator's required formatter expanded one spec to 254 lines. The same refactor agent then shortened prose before a necessary formatter repeat.



### Occurrences

- Execution: `SEED-114#session-column-membership` / plan 262, recoverable at `398fd61a1e94afea5720bc633be6412a1597164f:.planning/slice-plans/262-dashboard-session-column-membership/CONTEXT.md`; first related implementation commit `1f06b04d256536d55aa99670b8033b4fa1c09613`
  - Timestamp: unknown (slice 2 formatter and refactor follow-up, before `398fd61a` on 2026-10-06)
  - Tool: Codex
  - Open Dough release: unknown (execution-time installed guidance provenance not retained)
  - Evidence: slice 2's independent `refactor_two` hand-back checked every changed file at no more than 250 lines. The coordinator's first `npm run format` expanded `agent-launch-ad-hoc-sessions.spec.ts` to 254 lines; the resumed refactor shortened its header, preserved executable proof and returned it at 246 lines. The necessary formatter repeat exited 0 and the post-format cap check passed. Accepted execution proof records this sequence at the recovery reference above.
  - Observed effect: one extra refactor hand-back and a second project-wide formatter invocation; no behavioral changes or repeated tests for the prose-only repair.
  - Inference: Qualified. This is a sequencing mismatch between the cap check and formatting, distinct from ODF-152's conflict between conceptual scope and an already oversized file. The first formatter also reported a remaining style issue in a different spec; its cause was not established and is not attributed to this mismatch.

<a id="odf-219"></a>

## ODF-219 — Background coordinator implements outside the local-slice condition

Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** Three Open Dough / DD-245 executions, plans 263 (0.3.56), 265 and 272 (0.3.57). Two show no rework; the probe needed an extra commit and CI run. Distinct from retired ODF-091 missing independent refactoring: independent refactoring was retained except on the exact-restore probe. Retain the proportionality question without asserting that delegation would have prevented the probe error. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-219 — A background coordinator implemented its single slice itself](../../DearDough.md#odf-219--a-background-coordinator-implemented-its-single-slice-itself).

Former local code: DD-245.

`delegation.md` allows local implementation "only for a single interactive slice". This background session had one Structure slice of about 30 changed lines, and the coordinator implemented it without a delegated agent.



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

<a id="odf-220"></a>

## ODF-220 — Code-level planning findings become stale on trunk

Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** One Open Dough / DD-254 execution, plan 259 / 0.3.57, caught before edits. Distinct from ODF-074 premises never verified in the first place, and historical startup refusals caused by changed document digests. The 0.3.53 readiness response deliberately tracks documents; this is not its failed refusal fix. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-220 — A plan's code findings went stale on trunk with no signal before delegation](../../DearDough.md#odf-220--a-plans-code-findings-went-stale-on-trunk-with-no-signal-before-delegation).

Former local code: DD-254.

Plan 259 was prepared from code read on 2026-10-06 before 12:36 +09:00. Its finding 2, finding 3 and slice 2 described `RecentlyDone.tsx` counting unread sessions as none and `ColumnSummary` living in `ColumnEdge.tsx`. Commit `398fd61a` (16:42 the same day, another story) had already changed both before the Take. The start's "Changed since readiness review" covers the story and plan documents, not the code their findings describe.



### Occurrences

- Execution: `SEED-106#paged-columns-reveal-and-count-correction` / plan 259, first related implementation commit `74a48aee`
  - Timestamp: 2026-10-08 (+09:00), while slice 1 was delegated
  - Tool: Claude Code (coordinator and delegated agents)
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.57 (installed `dough-update/VERSION`)
  - Evidence: `459959ff:dashboard/src/RecentlyDone.tsx` `recentlyDoneColumn` already returned an unknown count until sessions and done records were read; `dashboard/src/columnSummary.ts` came from `398fd61a`. The plan's slice 2 asked for a bare-name control, which would have changed the shipped "Entry count incomplete" wording. Slice 2 was recorded done with no change in `27cde622`.
  - Observed effect: no rework. The coordinator noticed by reading the code while it waited, not through any startup or delegation check; the slice 1 agent independently reported finding 3 as out of date.
  - Inference: Qualified, one sample. Rechecking a plan's code-level findings against the fetched trunk before delegating each slice would have caught it; without that, a slice could re-implement delivered behavior or regress its wording.

<a id="odf-221"></a>

## ODF-221 — CI repair misses a sibling with the diagnosed cause

A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** One Open Dough / DD-255 execution, plan 274 / 0.3.57: two additional failed CI runs and about 97k reported diagnosis-agent tokens. Distinct from ODF-150 implementation proof selection: the missed search is during cause-driven CI repair. The 0.3.57 consumer-proof response covers affected consumers, but no earlier response correcting this repair-local diagnosis boundary is demonstrated. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-221 — A CI repair fixed one spec's race and left the same race in a sibling spec from the same slice](../../DearDough.md#odf-221--a-ci-repair-fixed-one-specs-race-and-left-the-same-race-in-a-sibling-spec-from-the-same-slice).

Former local code: DD-255.

A repair for a timing race in a new test fixed only the reported spec. A sibling spec written in the same slice had the same pattern: it switched projects while demanded reads were still in flight, then asserted an exact set of asked records. That sibling then failed CI separately.

### Occurrences
- Execution: `SEED-119#recently-done-progressive-loading` / plan 274, first related implementation commit `62238f21` - Timestamp: 2026-10-08T06:30:48+09:00 (repair `d04890e8`); second repair `fbab9e3a` at 2026-10-08T06:43:54+09:00 - Tool: Claude Code - Model: claude-opus-5-5 - Open Dough release: 0.3.57 (installed `dough-update/VERSION`) - Evidence: CI run 37687776071 on `c98b364c` failed `recently-done-progressive-navigation.spec.ts` ("choosing another project…"); the coordinator's brief asked only for that test, and repair `d04890e8` added a wait to it. `recently-done-progressive-navigation-cursor.spec.ts` (also slice 4) then asked records twice in the slice 5 refactor sweep and failed CI runs 37689968037 (`d04890e8`) and 37691024378 (`670b27fa`); `fbab9e3a` applied the same wait. - Observed effect: two more failed CI runs, a second diagnosis agent (about 97k subagent tokens), and a second repair commit. - Inference: Qualified. The first diagnosis named a general cause: a project switch cancels in-flight reads and `recordsAsked` counts cancelled asks. Searching the same slice's specs for project switches after demanded reads would likely have found the sibling in the same repair.

<a id="odf-222"></a>

## ODF-222 — Post-commit managed delivery stalls at an unknown stage

Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located.

- **Follow-up:** Open, unqueued.
- **Identity / limits (2026-10-09):** One Open Dough / DD-253 Cursor occurrence, plan 273 / 0.3.57, about 1h50m to two hours before kill and a successful 12-second retry. Relationship to ODF-184 is uncertain: no fetch or push subprocess is identified in this occurrence. Its Claude Code plan 274 occurrence does identify an unbounded SSH fetch and belongs to ODF-184; do not rename both historical occurrences as one proven cause. Current guidance assessed: `e904c1f5`.

### Retained source evidence — open-dough (2026-10-09)

**Source:** [open-dough / ODF-222 — Managed story-branch delivery can stall after a successful agent-commit](../../DearDough.md#odf-222--managed-story-branch-delivery-can-stall-after-a-successful-agent-commit).

Former local code: DD-253 (Cursor plan 273 only).

`execution-increment-delivery.mjs deliver` remained running for about two hours after `agent-commit.mjs` had already recorded a successful commit SHA, so the story-branch tip stayed unpublished until the hung delivery was killed and deliver was rerun.



### Occurrences

- Execution: `SEED-118#recover-from-temporary-github-failures` / plan 273, first related implementation commit `2854d30b`
  - Timestamp: 2026-10-08T04:15:08+09:00 (commit `598cd884`); hung delivery observed still running at about 2026-10-07T21:04Z UTC (~1h50m elapsed)
  - Tool: Cursor
  - Open Dough release: 0.3.57
  - Evidence: local HEAD was `598cd884` with a clean tree while `origin/cursor/recover-automatically-from-temporary-github-fail` remained at `ded67152`; the deliver shell (pid 36319) was still listed running; killing it and re-invoking deliver accepted publication of `598cd884` in ~12s.
  - Observed effect: CI and completion waited on an unpublished repair tip; a second deliver was required.
  - Inference: Qualified. The commit step and the publish/register step are separable; an unobserved stall after commit leaves the branch behind without a failing exit.
