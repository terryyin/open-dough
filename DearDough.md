# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 635. Removed numbers are never reused.
- Recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md` contains the pre-maintenance log and its earlier recovery chain. The removed ODF-368 effect line remains at `d516ab3ebac31265c991f9b88fb8cf57f125c1e0:DearDough.md`. The removed DD-548 and DD-632 effect lines remain at `80d7a566aee3c2592e88f13a65caad0d2d61affa:DearDough.md`. `bacba5db52673a2d3afa18cdba01c7fe746189a4:DearDough.md` retains the removed catalog-only pointers to ODF-229 and ODF-158. `488645e95fe49110418f94953944bea1beb3afec:DearDough.md` retains the exact removed pointers to ODF-154, ODF-205, ODF-169 and ODF-338.
- [Retired DD-544 and DD-606 occurrences](https://github.com/terryyin/open-dough/blob/88999346d263df2003faae7785af4994e999df14/DearDough.md) are recoverable under their former codes.
- Occurrence history is partial.

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259.

- SEED-418#resume-shared-checkout-closes-as-their-own-session (plan 771; first implementation `cf77a034f`)
- SEED-422#build-claude-reply-fixtures-with-makeme (plan 773; first implementation `209ef6682`)
- SEED-418#disclose-shared-checkout-overlap (plan 766; first implementation `c4b05ec8c`)
- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-150](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-150.md#evidence-2026-11-23-open-dough-odf-150).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

### Occurrences

- Execution: SEED-420#open-review-changes-from-a-story-card (plan 777, first implementation `e8466f474`). Timestamp: 2026-11-23T04:01:10Z (first failed frontend case in run 45108969606, attempt 1). Tool: Codex. Open Dough release: 0.3.110 (installed `.agents/skills/dough-update/VERSION` at Take `0f9df4dcc`). Evidence: Slice 6 migrated the named frame cases and Slice 7 removed the Story card Side panel route. The navigation width fixture `side-panel-width-view.ts` still pressed the old card action and expected a panel. Nine callers across five specs failed on runs 45108969606 and 45111917098. The repair after `d31aee723` reached the actual ad hoc Done entry and preserved all nine frame observations. The single migrated landed-note coverage probe caught a wrong comparison baseline, and verified restoration. Observed effect: two failing branch attempts and a separate repair. Inference: tracing Test Support imports outside the review spec group and reading their actual openers before accepting the route change would have exposed the obsolete fixture.
- Execution: SEED-420#review-standalone-done-work (plan 756, first implementation `7a8697b8a`). Timestamp: 2026-11-23T08:26:39Z (failed lint step in run 45138365896). Tool: Codex. Open Dough release: 0.3.112 (installed dough-update VERSION at Take `7a3a582db`). Evidence: the first Land slice passed focused Distribution proof, but the untouched `e2e/sessions/recently-done-published-sessions.spec.ts` received untyped comparisons; CI found the unsafe access, and `04a44e6ec` restored the typed boundary. Run 45145976785 caught the existing quiet Claude row query matching both the row and its containing article after the Board slice; `fa1ab88e2` scoped it to the session. Observed effect: two failing branch attempts and two separate repairs. Inference: checking the untouched clone consumer and row-query callers before delivery would have exposed both.

## DD-613 — Parity proof answers every read at once <a id="dd-613"></a>

A story promising parity with an existing view proved only settled states; every substituted read answered at once, so in-flight behavior the original view had went unplanned and unproved.

### Occurrences


## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

### Occurrences

- Execution: SEED-345#catch-delegated-lint-before-delivery (plan 786, first implementation `ffed8fb1b`). Timestamp: unknown (startup on 2026-11-23 +08:00). Tool: Codex. Open Dough release: 0.3.111 (installed guidance at Take `67f8d37bf`). Evidence: the initial parallel read of skill-authoring guidance, ODF-329 and execution references returned 28,521 tokens before truncation. Targeted follow-up reads recovered the delegation, source-review and obligation passages. Observed effect: the combined return hid required context and was followed by narrower reads. Inference: retrieving only the relevant finding section and the passages needed at each boundary would reduce that rereading. Token and time savings were unmeasured.

## ODF-329 — Delegation omits read-only lint before coordinator formatting <a id="odf-329"></a>

- SEED-413#speed-intent-timing-history-proof (plan 759; first implementation `40408c07c`)
- SEED-413#speed-intent-timing-history-on-vitest (plan 772; first implementation `4e4e753a2`)
- SEED-413#mount-system-settings-sections-and-usage-charts (plan 749, first implementation `657c7e2a8fd8e2eb284e30f12cae999735e3166f`)
- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)
- SEED-413#repair-refinement-touch-tap-hang (plan 770; first implementation `5aee5b463`)
- SEED-413#speed-intent-scope-timing-history (plan 774; first implementation `e19c1a4c0`)

### Occurrences

- Execution: SEED-420#compare-story-contributions (plan 790, first implementation `b159f51e1`). Timestamp: unknown (2026-11-23 +08:00, delivery of slices 1, 2 and 4). Tool: Codex. Open Dough release: 0.3.112 (installed dough-update VERSION at Take `f3c0fe94a`). Evidence: each slice returned passing focused tests and independent refactor before guarded formatting caught unsafe matcher or fixture types, an unnecessary optional chain, unused parameters or an unbound method. Observed effect: three formatting refusals and three focused reruns after mechanical repairs. Inference: reading lint while the author still holds the fixture context would have exposed these issues before delivery.
- Execution: SEED-424#poll-open-codex-sessions (plan 784, first implementation `b5b4a3ed8`). Timestamp: 2026-11-23T13:19:34+08:00 (initial formatting refusal). Tool: Codex. Open Dough release: 0.3.111 (checkout's installed dough-update VERSION). Evidence: the passing focused test return and independent refactor preceded guarded delivery's errors on require-await and an unused index callback argument in the new Vitest case. The coordinator's first repair also exposed an unsafe spread. An explicit fixture array type cleared it. Observed effect: two preparation refusals before the slice could commit, plus one renewed targeted test. Inference: the existing delegated lint follow-up covers finding the initial errors while the author still has the fixture context.

- Execution: SEED-413#drive-published-observation-through-page-entry (plan 789, first implementation `a99bc3797`). Timestamp: 2026-11-23T16:18:15+08:00 (first Slice 1 format refusal). Tool: Cursor. Open Dough release: 0.3.112 (installed `.agents/skills/dough-update/VERSION` at Take `8a41b269fa`). Evidence: after focused frontend proof, guarded format failed on `@typescript-eslint/no-unused-expressions` and `no-unnecessary-condition` in the new observation fixtures (`slice1-format-retry.log`); repair then delivered `a99bc3797`. Installed `.claude`/`.agents` delegation still banned independent hook-owned lint while Distribution already had SEED-345's scoped-lint edit. Slice 2 repeated it (`slice2-preflight-format.log`). Observed effect: two coordinator format repairs before Slices 1–2 could commit. Inference: installed 0.3.112 still withheld the SEED-345 remedy from implementers.

[Account and evidence at ODF-329](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-329.md#evidence-2026-11-23-open-dough-odf-329).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-519 — Story Branch start reports a reused remote branch published without advancing it

<a id="dd-543"></a>
<a id="dd-543--story-branch-start-reports-a-reused-remote-branch-published-without-advancing-it"></a>
Former local code: DD-543.

- SEED-301#serve-frontend-dashboard-answers-through-makeme (plan 655; first implementation `b03df3cbb`)

[Account and evidence at ODF-519](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-519.md#evidence-2026-11-23-open-dough-dd-543).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-545 — A Behavior slice holding view state, controls, styling, specs and E2E migration overran

Slice 2 planned per-tool reads, a new tool control, union offerings, per-tool
summaries, trace styling, a new frontend spec, every affected Usage spec, three
E2E specs and the contract document in 15 active minutes.

### Occurrences

- Execution: SEED-383#compare-codex-and-claude-code-token-usage (plan 658, slice 2)
  - Timestamp: 2026-11-16T12:37:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `650971b14`; no release inferred from product VERSION)
  - Evidence: implementer returned at about 22 active minutes with E2E migration and contract document undone (E2E tools spec broken); the coordinator retained the slice and continued the same agent (about 8 more minutes); slice 2 "Overrun" note at `488cd602f:.planning/slice-plans/658-compare-codex-and-claude-code-token-usage/PLAN.md`.
  - Observed effect: about 30 active minutes against 15; no work was discarded; delivery stayed CI-green.
  - Inference: the plan named every consumer, but sizing did not count the E2E migrations as work; retained compatible work avoided waste. Cost is the agent's elapsed time only; tokens not measured.

## DD-546 — A plan's size decisions omit a long planning record its removal slice edits

- SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)

[Account and evidence at ODF-516](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-516.md#open-dough--dd-546).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-547 — A sibling story landed first on files this story's seed says it rewrites first

The selected story's seed said SEED-382 "follows" it because both rewrite the
browser jobs' configuration, but SEED-382 was taken and closed on trunk during
this execution.

### Occurrences

- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: unknown (2026-11-16; SEED-382 closed on trunk at `2371b6f58` before slice 6's delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: `.planning/seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md` named this story as its predecessor; trunk changed `.github/workflows/ci.yml`, `browser-test-group.yml` and `dashboard/tests/shards.md`; the branch merged `main` at `d5e8ec4f2` with two conflicts and reran merged-state proof; source freshness absorbed SEED-382's closure amendment to this story's scope limit.
  - Observed effect: one mid-execution merge, two hand-resolved conflicts and a focused merged-state proof run; CI stayed green.
  - Inference: a "follows" note in a seed is not a blocking dependency, so the backlog let the sibling start; recording it as a prerequisite would have serialized them. Cost is modest here.
- Execution: SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ac8d1fc21`)
  - Timestamp: unknown (2026-11-18, slice 8 briefing)
  - Evidence: SEED-382#run-the-integrated-group-as-one-ci-job closed on trunk (`175762614`) before this Take; plan 689 slice 8 still told the slice to set `dashboard-integrated` to one shard in `ci.yml`, `shards.md` and the shard check. The coordinator found them landed while briefing and aligned the plan text.

## DD-548 — Removal and CI-switch slices overran with proof complete

Two slices finished all planned proof but ran past 15 active minutes: the slice
switching every browser configuration and its consumers to the declared shards,
and the slice deleting the deal and correcting about 30 documents and records.

### Occurrences

- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: unknown (2026-11-16)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: slice 4 return "about 20 minutes"; slice 6 return "about 25 minutes, not counting the 37-minute suite run"; both recorded in plan 656 Learnings at `6348334e6`.
  - Inference: like DD-545, sizing counted the core change but not the consumer and document sweep each slice owned; a sweep across many files may deserve its own slice.
- Execution: SEED-388#show-the-effort-a-launch-runs-with (plan 664; first implementation 535898511)
  - Timestamp: 2026-11-16T16:29:00+08:00 (slice 1 return; about 16:08–16:29 local)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.102 (guidance updated at starting revision `3b1479996`)
  - Evidence: plan 664's premise row ran its scratch default only over backend `launches/` (9 failures) and listed those nine consumers. Slice 1 also had to update about 20 more exact-argv or kept-start assertions in backend `sessions/`, shared test support and `e2e/`; a serial-mode spec hid a second failure behind the first. Slice 1 return reports about 21 minutes; plan 664 slice 1 Learning at `535898511`.
  - Observed effect: no discarded work; the slice delivered with accepted proof (374 + 256 + 54 passed).
  - Inference: same sizing gap as above, here seeded by a premise observation scoped to one test directory; a default that changes exact command-line output reaches every suite that pins that output, and serial-mode files undercount failures.

## ODF-521 — Agents' own active-time estimates ran two to five times the measured time

<a id="dd-550"></a>
<a id="dd-550--agents-own-active-time-estimates-ran-two-to-five-times-the-measured-time"></a>
Former local code: DD-550.

- SEED-367#count-slice-active-time-deterministically (plan 667; first implementation `0c454d10b5826b5b9121f8ae7a9bb718579b5269`)
- SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)
- SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)

[Account and evidence at ODF-521](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-521.md#evidence-2026-11-23-open-dough-dd-550).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-551 — A rule over retained history is accepted on fixtures before any real-history comparison

A changed attribution rule passed its fixture specs and full consumer suite and was published, but its first import over this machine's retained history dropped launches to zero. Only an every-record before/after comparison on a copy exposed it, and two more real-data defects followed.

### Occurrences

- Execution: SEED-388#count-claude-code-work-after-a-developer-reply (plan 665; first implementation dcd69ec7b)
  - Timestamp: 2026-11-16T16:55:00+08:00 (approximate; first copy import evaluated)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 7de032b23)
  - Evidence: slice 1 accepted on 5 fixture cases and usage-history 98/98, published dcd69ec7b; slice 2's copy import made 17 of 424 Codex launches 0 (duplicate task on reimport, repaired 5145a57c3); the next run made 11 launches unpriced (turn-start compaction before its turn_context) and kept a `/dough-land` without `<command-args>` in its execution (both repaired 0a58de188). Each real-store import took 9–12.5 min at about 4 GB; a store already written with a defective rule had to be restored from backup because stored task turns only grow.
  - Observed effect: three repair cycles on the story branch, three full imports of real history plus a restore, and slice 2 over its active budget; no trunk impact.
  - Inference: the plan's decisive premises sampled simple shapes; a narrowed import of a few real sessions with a per-record comparison, run before accepting slice 1, would likely have found all three defects earlier. Saving is unmeasured.
- Execution: SEED-379#keep-default-main-session-changes-for-review (plan 693; first implementation 5cdf62a89)
  - Timestamp: unknown (2026-11-18; post-execution review of 5d4ce67ae..27664feb3)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.106 (checkout-bound installation at Take 5d4ce67ae)
  - Evidence: the plan's premise tallied the real checkout's reflog kinds but the capture rule was accepted on planned journeys; after eight accepted slices the independent review, confirmed in scratch repositories, found an amended merge (`commit (amend)`, two parents), a continued cherry-pick (`commit (cherry-pick)`) and an autosquash (`rebase (fixup)`) misread; correction plan 700.
  - Observed effect: a merged run and false "made no commits" answers reached the story branch; a correction story and plan were queued.
  - Inference: same problem with matching uncertainty: the history was surveyed, not compared entry by entry against the rule's output. Running the rule over a real reflog window first would likely have shown the unplaced kinds.

## DD-552 — A slice grows a reference already at the 250-line limit that the plan did not size

- SEED-367#bound-diagnosis-in-evidence-rounds (plan 669; first implementation `cce82241194e3f8f5e58b84342dfcd92c51d63c8`)
- SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
- SEED-353#declare-trunk-review-authorship (plan 711; first implementation `61b3b48a2`)

[Account and evidence at ODF-516](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-516.md#evidence-2026-11-23-open-dough-dd-552).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-522 — A real-history premise is settled at an intermediate stage, not at the total it predicts

<a id="dd-553"></a>
<a id="dd-553--a-real-history-premise-is-settled-at-an-intermediate-stage-not-at-the-total-it-predicts"></a>
Former local code: DD-553.

- SEED-388#count-nested-claude-background-agent-work (plan 670; first implementation 669216b05)

[Account and evidence at ODF-522](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-522.md#evidence-2026-11-23-open-dough-dd-553).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-523 — A real-store prediction is settled on a scratch store that starts empty

<a id="dd-554"></a>
<a id="dd-554--a-real-store-prediction-is-settled-on-a-scratch-store-that-starts-empty"></a>
Former local code: DD-554.

- SEED-388#read-claude-rows-with-unicode-line-separators (plan 667; first implementation a3553a7ad)

[Account and evidence at ODF-523](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-523.md#evidence-2026-11-23-open-dough-dd-554).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-557 — Launch-record delivery listeners planned for the dashboard process miss Cursor's runner process <a id="dd-557"></a>

A plan treated `replaceRecords` as the single confirmation seam and installed a delivery listener only on the dashboard launch boundary. Cursor confirms first input in `runnerMain`, so that write never saw the listener until the same install ran in the runner process.

### Occurrences

- Execution: SEED-348#attach-story-notes-to-follow-ups (plan 672; first implementation `49396e6d2af120da82111917647c1ff678abc49f`)
  - Timestamp: 2026-11-17T15:34:33+08:00 (slice 4 Cursor proof failure context folder)
  - Tool: Cursor
  - Open Dough release: 0.3.103 (checkout-bound installed guidance at Take `522e71f54ec31ae42d4da6558fb36d398524bfeb`)
  - Evidence: plan decisive premises (2026-11-17 at `2a206edf7`) confirmed Cursor `runnerKeep` writes through `replaceRecords` but did not name the runner process. Slice 4 agent `8f8d2082-f47f-4b57-bc6c-3f4b613b044f`: `.tmp/slice-4-proof/delivery.log` and `cursor-debug.log` / `cursor-debug2.log` failed “uncertain Cursor first input…” with `delivered` still `undefined` after `confirmed`; after `installStoryNoteDelivery()` in `hosts/cursor/runnerMain.ts`, `cursor-debug3.log` passed. Publish `b22bc615a` and plan Learnings record dual install + `launchRecordDelivery.ts`.
  - Observed effect: Claude delivery cases passed with boundary-only install; Cursor late confirmation left notes waiting until the runner also installed the listener. Two failed Cursor runs then a fix inside the same slice.
  - Inference: a shared file writer is not one process. Premises that settle “every confirmation reaches replaceRecords” still need which processes call it when side effects register in-process. Cost of the miss is the failed Cursor iterations; unmeasured in tokens.

## ODF-141 — Every slice spawns a fresh refactor agent, even for a one-line test edit it then calls already clean <a id="dd-610"></a>

<a id="dd-610--every-slice-spawns-a-fresh-refactor-agent-even-for-a-one-line-test-edit-it-then-calls-already-clean"></a>
Former local code: DD-610.

- SEED-413#tie-done-capture-cases-to-production (plan 754, `439c23da5`..`b854edc8b`)
- SEED-418#resume-shared-checkout-closes-as-their-own-session (plan 771, `77665435d`..`18b84d427`)

[Account and evidence at ODF-141](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-141.md#evidence-2026-11-23-open-dough-dd-610).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-209 — Delegated repair and refactor agents ran wide proof in parallel and raised the load they then blamed <a id="dd-611"></a>

<a id="dd-611--delegated-repair-and-refactor-agents-ran-wide-proof-in-parallel-and-raised-the-load-they-then-blamed"></a>
Former local code: DD-611.

- SEED-413#tie-done-capture-cases-to-production (plan 754)
- SEED-421#stop-repeating-git-work-in-shared-publication (plan 763, first implementation `6d6cbebcf`)
- SEED-418#resume-shared-checkout-closes-as-their-own-session (plan 771)

- Execution: SEED-423#remove-unreached-distribution-code (plan 779, first implementation `67b66d67c`). Timestamp: 2026-11-23T11:05:54+08:00 (local gate start). Tool: Codex. Open Dough release: 0.3.110 (installed .agents guidance at Take `25e0878ad`). Evidence: `287001929:.planning/slice-plans/779-remove-unreached-distribution-code/PLAN.md` records the clean `e8e1c7f1f` combined Distribution and evaluation run with three local workers at observed load 35 on 16 logical CPUs. It passed 654 of 667 files, with twelve native deadline failures and one supplier-watch assertion. The thirteen passed in two one-worker runs at the same revision, and [CI run 45103865999](https://github.com/terryyin/open-dough/actions/runs/45103865999) passed all 667. Observed effect: two diagnostic gates were needed after the combined run. Inference: local worker fan-out can compound shared host load even when this execution runs one suite at a time.

- Execution: SEED-424#poll-open-codex-sessions (plan 784, first implementation `b5b4a3ed8`). Timestamp: 2026-11-23T05:11:01Z (browser proof start). Tool: Codex. Open Dough release: 0.3.111 (checkout's installed dough-update VERSION). Evidence: `b5b4a3ed8:.planning/slice-plans/784-poll-open-codex-sessions/PLAN.md` records the accepted proof. The first E2E command overlapped backend and typecheck proof, timed out on two review cases at board navigation, and took 200 seconds. At diagnosis the 16-CPU Mac was at load 37 with 18 GB compressed memory. A different, one-worker selection including both cases after those owned commands ended passed in 43 seconds at default timeouts. Observed effect: two trace inspections and one separate focused proof run. Inference: shared workload contributed to the timeouts. The selection and background load changed. A throughput comparison would require equivalent conditions.

[Account and evidence at ODF-209](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-209.md#evidence-2026-11-23-open-dough-dd-611).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-524 — A planned controlled proof cannot fit the CI job deadline, and its cost was never estimated <a id="dd-559"></a>

<a id="dd-559--a-planned-controlled-proof-cannot-fit-the-ci-job-deadline-and-its-cost-was-never-estimated"></a>
Former local code: DD-559.

- SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)

[Account and evidence at ODF-524](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-524.md#evidence-2026-11-23-open-dough-dd-559).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-560 — A consumer trace searched by a removed phrase misses its reworded restatements <a id="dd-560"></a>

An implementer changed a rule sentence and traced it with `--term` for the
removed wording only; two other references restating the same rule in other
words were not listed and kept the old rule until coordinator acceptance.

### Occurrences

- Execution: SEED-393#proof-reaches-unchanged-consumers-of-changed-output
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.103
  - Evidence: 2026-11-17, slice 1 before `7875763cc`; implementer trace `--term 'suite covering the changed surface'` (and other removed phrases) reported no other guidance reader; coordinator `git grep "changed surface"` found execute-plan `delegation.md:95` and `wrap-up.md:77` ("the changed surface's suite"), both then aligned in `7875763cc`.
  - Observed effect: the return claimed no remaining consumer; two restatements of the changed rule would have shipped contradicting it.
  - Inference: literal-phrase terms find quotations, not restatements; a term for the rule's concept (here "changed surface") reached them.

## DD-561 — First return drops required narrow keyboard proof when Side panel hides the Board <a id="dd-561"></a>

Plan and delegation required beyond-ten source reveal by keyboard on a narrow
reduced-motion viewport, keeping selection and Side panel. A covering Side panel
at narrow width makes the Board `aria-hidden`, so destination focus cannot be
observed with that panel open. The first return kept keyboard and panel at
1280×844 and left the narrow keyboard observation unobserved; acceptance
returned the uncommitted slice to split the cases. Matching to ODF-314 is
uncertain: the return disclosed unfinished work and the constraint, and the
correction found no product defect.

### Occurrences

- Execution: SEED-390#group-ad-hoc-follow-ups-with-their-done-story (plan 667; first implementation `7f17a6f0a4a3203918bd6c6139d45e5d65593b62`)
  - Timestamp: 2026-11-17T16:48:00+08:00 (acceptance return)
  - Tool: Cursor
  - Open Dough release: 0.3.104 (Take `e701ff22adecf4600641622ce561926486d5abed` after guidance update `a7a26b4ef`)
  - Evidence: plan 667 slice 2 Proof (“keyboard on a narrow reduced-motion viewport with a selected story and open Side panel kept”); implementer `4940154d-d8f9-4f75-8c74-da8d09fd06de` first return (5 frontend cases at 1280 only; P3 “Met with gap”); coordinator acceptance resume naming missing narrow keyboard; corrected return added 390×844 keyboard case without covering panel and kept 1280 panel case (6 passed). Slice 2 delivered at `1b59dccfe86cef48963b6441ccd4ebadbc80d418`; learning retained in plan Learnings.
  - Observed effect: one acceptance return on the same uncommitted slice before delivery; active time remained about 14 of 15 minutes after correction; no product-behavior change beyond adding the missing narrow observation.
  - Inference: possible kinship to ODF-314 (plan-owned observation missing until acceptance returned it), qualified because the return already named unfinished/gap status and the aria-hidden constraint. Split narrow keyboard from covering-panel preservation on first return when co-observation is impossible.

## ODF-435 — Removing a copied-data assertion also drops the behavior it bundled <a id="dd-563"></a>

<a id="dd-563--removing-a-copied-data-assertion-also-drops-the-behavior-it-bundled"></a>
Former local code: DD-563.

- SEED-396#remove-redundant-evaluation-checks (plan 680; first implementation `f2226ca4b`)

[Account and evidence at ODF-435](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-435.md#evidence-2026-11-23-open-dough-dd-563).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-525 — A compound scratch break is accepted as proof that one guard is protected <a id="dd-566"></a>

<a id="dd-566--a-compound-scratch-break-is-accepted-as-proof-that-one-guard-is-protected"></a>
Former local code: DD-566.

- SEED-334#move-intent-ci-proof-comparison-and-candidate-checks (plan 651; first implementation `e7aac254bbe59f5dc277d473386359dddf56132d`)

[Account and evidence at ODF-525](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-525.md#evidence-2026-11-23-open-dough-dd-566).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-443 — Refactor return reports an oversized module as within the 250-line limit <a id="odf-443"></a>

- SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)
- SEED-413#mount-story-review-changes-panel (plan 748; first implementation `277d5717c67aed5babc1806881797d52a0ec8235`)

[Account and evidence at ODF-443](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-443.md#evidence-2026-11-23-open-dough-odf-443).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-526 — Consumer-trace output is dominated by planning-record matches, so agents fall back to plain search <a id="dd-568"></a>

<a id="dd-568--consumer-trace-output-is-dominated-by-planning-record-matches-so-agents-fall-back-to-plain-search"></a>
Former local code: DD-568.

- SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)
- SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
- SEED-345#recover-decisive-verification-evidence (first implementation `126391de866d4a3a40e0303c3098df318946ae33`)
- SEED-400#keep-freshness-with-a-valid-take (plan 696; first implementation `03b29b34ee3cfdbe109111b86aba327e0691c277`)

[Account and evidence at ODF-526](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-526.md#evidence-2026-11-23-open-dough-dd-568).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-569 — Conversion acceptance takes a named existing owner without reading its assertion <a id="dd-569"></a>

Test-conversion slices map each interim assertion to a new case or to an
existing owner. The coordinator accepted one "owned elsewhere" claim from the
owner's file and test names; that owner asserted a neighbouring rule, so the
observation was lost until the retrospective read the assertion.

### Occurrences

- Execution: SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
  - Timestamp: unknown (2026-11-17, slice 3 acceptance, between `c3249d594` and `e10d6698f`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `161830d70`)
  - Evidence: the interim `board-paging-side-panel` last step (a session arriving on a Backlog card keeps "Recently done 0 entries" and the paged view) was handed to `frontend-tests/sessions/recently-done-active-story-sessions.spec.ts`, which checks an arranged state at 54rem and never a session arriving while paged. Plan 648 slice 3 acceptance note recorded the hand-off (`a96f5dae9:.planning/slice-plans/648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md`); the outcome review found the gap; correction SEED-334#keep-navigation-conversion-proof-whole (plan 687) restores it. Slices 1, 4 and 6 first returns also listed unconverted assertions (revision moves, attach counts and selected file, header read counts) as gaps; the coordinator returned each and all got Frontend homes before acceptance.
  - Observed effect: one lost observation delivered and queued for correction; three first returns needed a second implementer round (about 3–5 slice-clock minutes each).
  - Inference: related to DD-563. Requiring each "owned elsewhere" claim to cite the owner's asserting line, and checking that line at acceptance, would have caught it; the cost is one read per claim.

## ODF-527 — A natural-load acceptance gates completion on machine state no agent controls <a id="dd-572"></a>

<a id="dd-572--a-natural-load-acceptance-gates-completion-on-machine-state-no-agent-controls"></a>
Former local code: DD-572.

- SEED-340#keep-one-time-test-preparation-out-of-case-budgets (plan 685; first implementation 06eccefa7)

- Execution: SEED-341#keep-attention-completion-journey-within-timeout (plan 782, first implementation `4e31faa0f`). Timestamp: 2026-11-23T06:41:38Z (first candidate load sample). Tool: Codex. Open Dough release: 0.3.111 (checkout's installed dough-update VERSION at Take `497eed2c2`). Evidence: `bdf484822:.planning/slice-plans/782-keep-attention-completion-journey-within-timeout/PLAN.md` records three diagnostic runs with 86, 48 and 20 synthetic burners. Nominally matching the original burner count produced load over 100, and reducing the count still yielded timeouts in unchanged controls. A separate three-minute wait for natural load at or below 17 selected no tests. The same five specs at four workers, with no burners, reproduced the original timeout while both split cases and all seven controls passed at overlapping natural load and control timings. Observed effect: roughly six minutes of diagnostic runner time and one readiness wait. Inference: case times from unchanged controls made the contention comparison more informative than burner count or a load threshold alone.

[Account and evidence at ODF-527](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-527.md#evidence-2026-11-23-open-dough-dd-572).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-573 — A refactor pass removes support as dead after searching only the dashboard test folders <a id="dd-573"></a>

A post-change refactor pass judged support unused from a search limited to
`dashboard/tests` and `dashboard/frontend-tests`, removed it, then found
callers under `e2e/` and `dashboard/backend-tests/` and restored the files.

### Occurrences

- Execution: SEED-334#retire-integrated-ui-test-and-its-documents (plan 688; first implementation `c2f93725c`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 3 refactor pass)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `0f5a7964c`)
  - Evidence: slice 3 refactor return: it removed `storyWorktree` and un-exported `openStoryReview` after the deletion of `dashboard/tests/navigation/story-destination-repeat-cue.spec.ts`, then restored both with `git show HEAD:<path> > <path>` once e2e and Backend callers turned up; `git status` clean afterwards. Slice 4's brief then required a whole-checkout grep, and its return complied.
  - Observed effect: no change reached a commit; one wasted edit-and-restore round inside the pass.
  - Inference: the dead-code check names no search scope; a test-folder search looks sufficient for test support but is not. Overlaps DD-568 (agents replace the scripted trace with their own search). Cost not measured.

## DD-574 — A planned scratch break cannot fail at the step's own position <a id="dd-574"></a>

The plan named a scratch break, "a paging reset on session arrival", for a
step that sits on Backlog, the Board's first position, where a reset changes
nothing. Planning settled the step's premise but never checked that the break
could fail there.

### Occurrences

- Execution: SEED-334#keep-navigation-conversion-proof-whole (plan 687; first implementation `41d93d114`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `46aa7f7c0`)
  - Evidence: slice 2 report `s2-report.md` (story-branch evidence dir): runs `s2-break-a` to `s2-break-a10`; a–a3 crashed at startup, a5/a6 watched an attribute the cards lack, a4/a9 forward moves passed, a7 a 300 ms late move passed, only a10 with a fixed 1 s wait failed. Plan 687 slice 2 learning records the limit (`bc928d061:.planning/slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md`); P4 observed only the passing step.
  - Observed effect: ten break runs to establish that the break could not bite; the slice accepted the step with a recorded limitation.
  - Inference: checking a planned break's ability to fail, at the asserted state, while settling premises would have reworded or dropped it before execution. Run time sat outside the slice clock; slice active time was 5.8 min.

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 5)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` slice 5 proof "Releasing the older read before the save in a scratch edit fails the older-read case"; `s5-discrimination` passed, and the implementer explained that a read answered before the save is not older; `s5-discrimination-guard` (removing `sequence <= shown`) failed instead.
  - Observed effect: one wasted scratch run; the substitute discrimination was accepted.

## DD-575 — A plan prescribes a new promise as a step of another behaviour's test <a id="dd-575"></a>

The plan said an existing paging test "gains its final step" for a separate
promise. The implementer followed it and lengthened the test's title; the
refactor checks forbid widening another behaviour's test, so the refactor pass
split it into its own test and renewed its proof.

### Occurrences

- Execution: SEED-334#keep-navigation-conversion-proof-whole (plan 687; first implementation `41d93d114`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 2 refactor pass)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `46aa7f7c0`)
  - Evidence: plan 687 slice 2 Proof ("`board-paging-side-panel.spec.ts` gains its final step", `bc928d061:.planning/slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md`); slice 2 refactor return: new test in `board-paging-side-panel.spec.ts` at `251c507ae`, reruns `s2-refactor-specs` and `s2-refactor-break-b`.
  - Observed effect: one restructure and two renewed proof runs inside the refactor pass, which used its full 15 active minutes.
  - Inference: slice planning applied the interim journey's shape without the test-boundary check the refactor pass later applied. Cost beyond those reruns not measured.

## DD-577 — A conversion map records a narrowed interim negative and slice acceptance takes it <a id="dd-577"></a>

A test-conversion slice wrote, in its assertion map, that an interim "no call of any kind" check became "no Done read"; acceptance compared the map, not the narrowing's reason, and the retrospective found the lost observation.

### Occurrences

- Execution: SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ac8d1fc21`)
  - Timestamp: unknown (2026-11-18, slice 7 acceptance; corrected in `44a097ab` after the outcome review)
  - Evidence: interim `story-reference-done-recovery` asserted `githubFor(page).calls.slice(before)` equals `[]` after expired and unlisted references; the Frontend case counted only `done` reads. The same review found a refactor pass loosening `boundary-server.spec.ts`'s exact launch command.
  - Observed effect: one correction slice before the execution-complete record; no protection shipped lost.
  - Inference: related to DD-569 and DD-563. Requiring a reason for every narrowing in the map, checked at acceptance, would have caught it.

## ODF-368 — A plan's slices sit under a heading the obligations and delivery reader refuses <a id="odf-368"></a>

- SEED-401#pilot-new-retrospective-findings (plan 706; first implementation `d6190e523`)

[Account and evidence at ODF-368](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-368.md#evidence-2026-11-23-open-dough-odf-368).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

### Occurrences

- Execution: SEED-420#compare-story-contributions (plan 790, first implementation `b159f51e1`). Timestamp: unknown (2026-11-23 +08:00, before the slice 1 publication at 16:47). Tool: Codex. Open Dough release: 0.3.112 (installed dough-update VERSION at Take `f3c0fe94a`). Evidence: the Ready plan used `## Slices and outside-in proof` at `f3c0fe94a`. The empty obligation listing passed. Guarded delivery then refused the status mutation. The coordinator verified all four slices through the actual reader, corrected the heading and proof labels and published the same product slice in `b159f51e1`. Observed effect: one refused delivery and a repeated formatter pass. Inference: validating the plan with the status reader when selecting the first slice would have exposed the format before implementation.
- Execution: SEED-413#speed-intent-revision-and-detour-reading (plan 778; first implementation `ea316f671`)
  - Timestamp: 2026-11-23T08:40:41+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `702d1a213`; base 0.3.110
  - Evidence: a Ready plan headed `## Slices and outside-in proof`. The first `story-obligations.mjs list --slice 1` refused `unreadable-slices`; after renaming to `## Slices` in the working plan, guarded fresh delivery refused "slice 7 is done … but not in its committed plan", because the committed heading was still unreadable. Repaired by the separate records commit `f5c5f876c`.
  - Observed effect: one refused listing, one refused delivery and one extra commit before slice 1 published.
  - Inference: the working-tree rename alone does not satisfy delivery, which also reads `HEAD`; planning or readiness rejecting the heading would avoid both stops.
- Execution: SEED-413#speed-intent-scope-timing-reading (plan 777; first implementation `5119da43d`)
  - Timestamp: unknown (2026-11-23 +08:00, before slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111 (trunk guidance update `27c47b235` before Take `419aeed53`)
  - Evidence: the first `story-obligations.mjs list --slice 1` refused `unreadable-slices` and `unknown-slice` for `## Slices and outside-in proof`; renaming it to `## Slices` gave `ok: true`, and the rename was committed with slice 1 (`5119da43d`), so delivery did not refuse.
- Execution: SEED-423#install-without-ci-reuse-recipes (plan 792; first implementation `c1b999037`). Timestamp: unknown (2026-11-23, minutes before the `c1b999037` commit at 16:37:44+08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.112 (installed `.claude/skills/dough-update/VERSION` at Take `7b8eb58e3`). Evidence: a Ready plan headed `## Slices and outside-in proof`; `story-obligations.mjs list --slice 1` returned `ok: true` with no entries, then guarded fresh delivery refused `plan/status mutation`: no `## Ordered slices` or `## Slices` section. Renaming the heading in the working plan let the retried delivery commit and publish slice 1. Observed effect: one refused delivery and a retry; no extra commit. Inference: the obligations listing no longer catches the heading, so delivery is now the first reader to refuse it.
- Execution: SEED-423#require-declared-units-in-ci-proof (plan 795, first implementation `1d78c4b91`). Timestamp: unknown (2026-11-23 +08:00, before slice 1 publication). Tool: Codex. Open Dough release: 0.3.112 at Take `cc18578a6`. Evidence: the Ready plan used lettered slice headings. The empty obligation listing passed, then the first nonempty delivery check returned `unreadable-slices` and `unknown-slice`. Numbering the same seven slices and references allowed the check and publication. Observed effect: one refused precommit check and one plan correction. Inference: readiness validation could use the delivery reader before implementation.

## ODF-528 — A plan puts slices that wait for a week of post-landing ordinary work inside one Story Branch execution <a id="dd-580"></a>

<a id="dd-580--a-plan-puts-slices-that-wait-for-a-week-of-post-landing-ordinary-work-inside-one-story-branch-execution"></a>
Former local code: DD-580.

- SEED-401#pilot-new-retrospective-findings (plan 706; first implementation `d6190e523`)

[Account and evidence at ODF-528](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-528.md#evidence-2026-11-23-open-dough-dd-580).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-529 — Delivery lint checks only changed files, so a narrowed shared type fails CI in unchanged consumers <a id="dd-581"></a>

<a id="dd-581--delivery-lint-checks-only-changed-files-so-a-narrowed-shared-type-fails-ci-in-unchanged-consumers"></a>
Former local code: DD-581.

- SEED-353#declare-intent-comparison-histories (plan 643; first implementation `f52db9a6756441116edf76fd7930b275e12e7b1f`)
- SEED-413#ad-hoc-done-lifecycle (plan 731; first implementation `5be28ff56`)

[Account and evidence at ODF-529](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-529.md#evidence-2026-11-23-open-dough-dd-581).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-582 — A moved case is planned from its arrangement while its journey crosses another service <a id="dd-582"></a>

The plan judged the retained-note case only on whether a fresh mount reads the same note. The case also saves that note from a review diff and asserts the recorded add, which needed a story-review answer the mounted board lacked.

### Occurrences

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 6)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` "Slice 6 refinement" learning; the first port arranged the note and dropped `saveDiffNote` and the recorded add, so coordinator acceptance returned it; the second return stopped; slice 6 was split into a review-rule slice and slice 7 (`a1fa7a1d4`, `e3398ed26`).
  - Observed effect: two returns, a removed attempt and one extra slice; no observation was lost.
  - Inference: listing every service a moved case's journey touches while planning would have sized the review rule up front.
- Execution: SEED-420#test-compare-on-mounted-intent (plan 765; first implementation `1240413986b`)
  - Timestamp: 2026-11-22T09:09:04+08:00 (first stop; second stop 09:29:05+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.110 (installed `.claude/skills/dough-update/VERSION` at Take `404354c56`, unchanged through `578b95e87`)
  - Evidence: plan 765's Decisions moved the done-record read behind `PageReads` only "when a Done case reaches that read" and required no outside fetch. Slice 2's first attempt stopped after 1.4 active minutes with no edits on that read (`s2-report.md`), and the plan was split in execution. Slice 3's first return then failed its four Done cases on two more outside reads, story notes and the CI Done wall-time history glance (`s3-report.md`), which plan 764 already owns.
  - Observed effect: one no-edit stop, one in-execution split and one stopped return that was resumed; no observation was lost.
  - Inference: tracing a selected Done story's mounted reads while planning would have found all three reads and settled the scope boundary with plan 764 before execution.

## DD-583 — A speed goal is sized from a probe that skipped the settling real cases need <a id="dd-583"></a>

The story promised a third of the story-notes time on the strength of phone-board cases at about 0.15 s and a two-case scratch probe. Real notes cases needed act settling across frames to avoid act warnings and a dialog that skipped `showModal`, and then took 0.5–1.5 s each.

### Occurrences

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slices 5 and 8)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` "Observations used for sizing" (scratch probe of 82 ms, phone-board 7 cases) against slice 5 learning (`actSettled`) and the slice 8 comparison (0.80 and 0.86 of baseline); Terry changed the promise and queued `SEED-404#run-the-story-notes-checks-in-a-third-of-their-time`.
  - Observed effect: the goal was missed and a further story is needed.
  - Inference: a probe that holds answers and refreshes reads, as real cases do, would have exposed the settling cost before the third was promised. Close to DD-553 and DD-554 (premises settled on an unrepresentative stage).

- Execution: SEED-413#renovate-remaining-dashboard-frontend-unit-tests (plan 724; first implementation `22cb4e62b`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 5 family finish)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9a78cd913`)
  - Evidence: plan 724 premise "five passes in 2.07 s" from a scratch probe against the family finish: five moved cases summed 6.97–8.00 s mounted against 6.28 s built-app; a profile put 60–75% of each case in browser clicks (~150 ms) and the `actSettled` frame round (~85 ms).
  - Observed effect: a recurrence; the family delivered no case-time gain, and the comparison and a candidate settle change went to the later families' story.

- Execution: SEED-413#reach-eight-second-launch-feedback (plan 787, first related commit `575ab48fd`, no implementation commit). Timestamp: 2026-11-23T14:49:00+08:00 (Slice 1 return). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.111. Evidence: plan 787's premise sized the eight-second goal from case sums ("at least 6.536–6.852 aggregate case-seconds"); Slice 1 (`575ab48fd`) found 2.95 s of non-case overhead, raising the need to about 12.4; Slice 2 (`35aabbb28`) found only 1.0–1.3 s removable; Slice 3 (`67c8d82a7`) found a merged click-bound refinement case cost the same as its predecessors. Observed effect: the maintainer closed the story at the measured gap after three slices with no product change. Inference: a recurrence of sizing a speed goal without its real cost composition; checking the target against shell totals while planning would likely have raised the gap before Take.

## DD-589 — A unit-test approach states a whole machine instead of the input its handler reads <a id="dd-589"></a>

Plan 721's readiness-approved approach had each in-process case state a machine home through MakeMe stored documents and mount the project list through `mountProjectConfiguration`, which the plan called a production function though only test support called it. No planning or readiness check asked whether a case builds only the data its handler reads. The typed input later proposed in its place was again stated from the adapter's reads and named a source nothing under the handler reads.

### Occurrences

- Execution: SEED-413#renovate-dashboard-backend-unit-tests (plan 721; first implementation `42a8f2f96`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 2, between `42a8f2f96` at 21:37:01 and `8cafad2fc` at 23:31:12)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.108 (installed by `f9c22bd89`); the slice 2 refactor checks were modified; revision `d49d119a5`; base 0.3.108
  - Evidence: `42a8f2f96^:.planning/slice-plans/721-prove-ad-hoc-review-reads-in-process/PLAN.md` Approach ("Machine state through MakeMe", `mountProjectConfiguration(environment)`) and proof map ("project list mounted through its production function"); SEED-413#renovate-dashboard-backend-unit-tests amendment ("_Amended 2026-11-19 by Terry during execution_", then "Narrowed the same day to the kept launch records alone … nothing under the session handler reads the published source"); plan 721 Approach "Typed kept state, read only by the adapter" and slice 2 Current decision; redo `8cafad2fc`; trunk `d49d119a5` "Define production code testability in refactoring guidance".
  - Observed effect: slice 2 as planned was returned once by the coordinator (275-line spec; trunk advanced through test-support Git helpers), then stopped by the refactor pass (JIDOKA) on about 60 repeated setup lines per spec. The developer rejected deferral, a test-support exception and a production machine mount, and amended the story to typed handler input. The coordinator proposed "the published source and the kept launch records" without tracing the handler; the next refactor pass found the source unused and stopped for a second amendment. Slice 2 took three implementation attempts, two stopped refactor passes, two amendments and two fresh source reviews.
  - Inference: both the plan's approach and the proposed contract defined test input from what the server or adapter reads, not from what the handler reads. A planning or readiness check that a unit case constructs only its handler's input would likely have caught both. The developer then added "Design production code for testability" to the refactor checks (`d49d119a5`), which apply after implementation, not at planning. Related to ODF-074 (the "production function" premise was unverified); no shared cause established.

- Execution: SEED-413#speed-dashboard-launch-proof (plan 762, first implementation `12435c6ef`). Timestamp: 2026-11-22T03:29:47.795+08:00. Tool: Codex. Open Dough release: unknown. Evidence: `cb5c6fea2:dashboard/frontend-tests/launches/mounted-launch-attempts.ts` accepts the whole machine answer to arrange the launch attempt inputs. `cb5c6fea2:.planning/slice-plans/762-speed-dashboard-launch-proof/remaining-proof.md` maps 81 legacy cases to independent proof owners and records 32.04 s for 72 mounted cases. The maintainer then required each test to depend only on relevant code and data with a 7–8 s target. Observed effect: the migration supplied the all-Vitest baseline and the narrower test design became `SEED-413#make-launch-proof-orthogonal`. Inference: define each unit case's relevant production inputs when mapping behavior. This timing does not isolate the cost of the machine shape itself.

## DD-590 — Acceptance records a "carries only what it reads" commitment from one type while sibling shapes carry more <a id="dd-590"></a>

Slice acceptance recorded source-review commitment 3.1 ("a handler's typed contract carries only the data its responsibility reads") as observed, citing `KeptSessionState = { records }`. The session variants of the typed read shapes still accepted story-only fields. Only the retrospective's independent outcome review found it.

### Occurrences

- Execution: SEED-413#renovate-dashboard-backend-unit-tests (plan 721; first implementation `42a8f2f96`)
  - Timestamp: unknown (slice 4 acceptance, between `e964711a7` at 2026-11-19T23:41:41+08:00 and `1a54cf72c` at 2026-11-20T00:06:35+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.108 (installed by `f9c22bd89`); refactor checks modified; revision `d49d119a5`; base 0.3.108
  - Evidence: plan 721 Current decisions, slice 2 (`KeptSessionState = { records }`) and slice 4 (`ReviewInput<R>`); plan 721 Execution complete ("the session read shapes still accept story-only fields"); correction SEED-413#narrow-ad-hoc-review-handler-contracts (plan 725, item 1: a session review read accepts `reference`, `completed` and `historical`; a session file read accepts `completion`).
  - Observed effect: a commitment was recorded observed while the delivered result was narrower; one correction plan was queued after the execution-complete record. The fresh independent outcome review was the practice that caught it.
  - Inference: the observation covered the kept-state half of the contract, not the read shapes, and the source-review rules treat a narrower result as a mismatch. Related to ODF-420 and ODF-469 (acceptance observing less than the commitment); the shape differs, so no shared cause is established.

## DD-591 — A test-support repair added code the plan's cited North Star topic forbids, and no gate before wrap-up caught it <a id="dd-591"></a>

### Occurrences

- Execution: SEED-413#refuse-story-launch-session-file-reads (plan 726, `39baced58`). Timestamp: 2026-11-20T12:18:00+08:00. Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `e4970798e`). Evidence: the broad gate's load-induced timeouts went to a diagnosis brief. That brief carried the failure policy but not plan 726's cited topic "Make production code directly testable instead of growing test support", which allows test-support changes outside builders and page objects only to remove code. The repair added `claudeSessionBecomes(session, "done-live")` to `markAdHocDone` in `dashboard/test-support/support/adHocReview.ts`. Proof acceptance and the refactor pass ("follows the existing pattern") accepted it. The coordinator noticed only during wrap-up's North Star retirement check, which forced correction `SEED-413#remove-ad-hoc-done-helper` (plan 727, 25 call sites). Inference: briefs for repair and diagnosis work started mid-slice did not inherit the plan's cited direction, and the refactor checks do not test a test-support diff against that topic.
- Execution: SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`). Timestamp: 2026-11-20T22:03:17+08:00 (slice 1 commit) to 22:32:50+08:00 (removal in slice 3). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `10ace0630`). Evidence: the slice 1 and slice 2 refactor passes added `addAdHocWorktree` and `sessionBranchPinnedObjects` to `dashboard/test-support/support/adHocBranchRefs.ts` (in `bdfe9b08d` and `040982b70`); their briefs named the plan but not SEED-413's "test support only shrinks" direction. The coordinator noticed while settling slice 3's C13 gap and had slice 3's refactor pass remove both (`4e8cec828`); later briefs carried the direction and added nothing. Observed effect: two delivered commits violated the cited topic; one extra refactor scope and seven spec rewrites. Inference: caught mid-execution rather than at wrap-up because the coordinator reread the seed's direction for an unrelated gap; briefs still do not inherit the cited topic by default.
- Execution: SEED-413#split-done-mark-decision-from-store (plan 734, `f5e3a956d`..`0d1560004`). Timestamp: 2026-11-21 (slices 4–7 accepted between about 22:55 +08:00 on 11-20 and 00:45 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `fd05ea2d2`). Evidence: every brief carried the cited topic, yet refactor passes added `aDoneSession`, `aDoneBranch`, `keptAsDone`, `keptAsDoneAfterRetirement` and a `pinned` switch to `doneCaptureReview.ts`/`doneBranchObservation.ts`; the coordinator noted the conflict at slice 4 and accepted it as "a later story folds it". Only the retrospective's independent review tied two of them to lost adapter proof (correction SEED-413#restore-done-capture-proof-after-composed-reviews, plan 743). Inference: carrying the topic in the brief is not enough; acceptance needs a check that new test support composes through MakeMe and writes no production state by hand.

## DD-608 — Implementers return a slice partly done with most of its clock left <a id="dd-608"></a>

### Occurrences

## DD-596 — Moves to composed state are accepted on assertion counts while the setup skips the step they proved <a id="dd-596"></a>

### Occurrences

- Execution: SEED-413#split-done-mark-decision-from-store (plan 734, `93cc82cf7`..`0d1560004`). Timestamp: 2026-11-21T01:05+08:00 (retrospective review; slices accepted 2026-11-20 22:55 to 2026-11-21 00:45 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `fd05ea2d2`). Evidence: the plan's proof for "every replaced case keeps its assertions" was before/after `expect(` counts per spec; slices 4–7 passed it. The retrospective's read-only review found five cases whose composed records now supply what the adapter or real capture used to produce (`sessionCommits.shared`, the branch entry's Default main tip, a prepared-receipt guard, a kept delivery, Git's own reflog action text), so their unchanged assertions can no longer fail on that path. Intent Coverage at `6ff2b1d9c` confirmed one: dropping `shared` in `settleSessionCommits` passed every maintained check. Observed effect: correction plan 743 queued first. Inference: a move from action to composed state needs, per moved case, the production step its assertion observed and where that step is now proved, not a count. Related to DD-563 (removed assertions); here the assertions stay and the setup moves.

## DD-594 — Cases moved into Vitest's 5 s default were planned without per-case margin at routine local load <a id="dd-594"></a>

### Occurrences

- Execution: SEED-413#arrange-done-ad-hoc-observation-and-publication (plan 730, `77d845a62`..`fd378d808`). Timestamp: 2026-11-20T17:56:06+08:00 (slice 3 refactor stop) to 19:05:36+08:00 (slice 8 G1). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `3c7d21aaa`). Evidence: `fd378d808:.planning/slice-plans/730-arrange-done-ad-hoc-observation-and-publication/PLAN.md` premise records only a six-spec Playwright sum (11 cases, 20.71 s) without load or per-case times. Slice 1 learning: 1.2–2.2 s per case at load 8–13, one 5.1 s timeout at load 32. The slice 3 refactor pass stopped (JIDOKA) on two timeouts at load 12.4; the coordinator checked the `/usr/bin/git` launcher (no difference) and CI (0.2–0.8 s per case), recorded the exposure as awaiting Terry, and kept delivering slices 4–7. Slice 8's ADR 0010 comparison timed out two or three cases in three of five runs at load 14–16, raised as G1. Terry accepted the timing and queued SEED-413#optimize-done-capture-family-cases. Observed effect: a refactor stop, repeated load classification across five slices, and a late human decision. Inference: measuring the slowest moved case at the machine's routine load during planning would have surfaced the margin before slice 1; the human decision came about 70 minutes after the exposure was first recorded. Related to DD-583 (premise on an unrepresentative stage); the cause differs.
- Execution: SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`). Timestamp: 2026-11-20T22:45:00+08:00 (slice 4 focused proof at load 32–36) to 2026-11-21T00:43:00+08:00 (ADR 0010 runs). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `10ace0630`). Evidence: plan 735 premises record a baseline of 28 cases without load or per-case times. Slice 1 timed out ten 3–5 s cases at load 19–23; slices 4–6 timed out every Git-heavy case, including untouched ones, at load 18–47 from other worktrees. The coordinator waited twice on load (up to 30 minutes) and then published slices 4–6 with `progress: true` so hosted CI proved each revision before done. The final interleaved comparison at load 15–23 showed 0 timeouts against 6 at base, with five cases still at 4.1–4.6 s. Observed effect: about 1 hour of load waits and three progress-then-done publication pairs. Inference: hosted-CI progress proof kept delivery moving without weakening proof; the margin itself stays with SEED-413#optimize-done-capture-family-cases.
- Execution: SEED-413#restore-done-capture-proof-after-composed-reviews (plan 743, first implementation `0d4666c3f`). Timestamp: unknown (slice 5 refactor proof on 2026-11-21 around 09:00 +08). Tool: Codex. Open Dough release: unknown (checkout-bound guidance at Take `44d066285`). Evidence: the newer-Done supersession case took 5.079 s at the unchanged five-second default while one-minute load rose from 24.23 to 27.71 on 16 logical CPUs. `0c95fce81:.planning/slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md` records the repair and the 1.643 s observed pass after moving two Review reads to saved-state assertions with load 20.86 to 20.02. Observed effect: the focused timeout moved that small part of slice 6 into slice 5 and required renewed proof. Inference: fewer full reads leave more headroom. The load difference also affects elapsed time.

## DD-595 — A sibling story's trunk landing on shared test support parks mid-slice work outside Git <a id="dd-595"></a>

### Occurrences

- Execution: SEED-418#disclose-shared-checkout-overlap (plan 766; first implementation `c4b05ec8c`), merge `0b1578c55`. Timestamp: 2026-11-22T14:25:10+08:00 (merge commit). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.110 (installed `.claude/skills/dough-update/VERSION` at Take `bda6fbbeb`). Evidence: sibling SEED-418#expire-published-session-records landed record pruning in `sealed-session-record.mjs`, `session-record-publication.mjs` and the payload list while slice 4 was uncommitted in the same files. With no procedure for integrating trunk into a story branch mid-slice, the coordinator saved slice 4 as a patch in the evidence directory, reverted it with `git apply -R`, cleared intent-to-add index entries that blocked the merge, merged four conflicts, then reapplied with `git apply -3` and threaded trunk's new `now` into the resumed path before renewing proof. Observed effect: slice 4's new files lived only in the evidence directory for minutes; no loss. Inference: recurrence; a WIP commit before the merge would have kept the work in Git.
- Execution: SEED-413#arrange-done-ad-hoc-observation-and-publication (plan 730, merge `46ab47e39`). Timestamp: 2026-11-20T18:49:37+08:00 (park) to 18:56:10+08:00 (reapply). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `3c7d21aaa`). Evidence: sibling SEED-413#ad-hoc-branch-result-handoff landed on trunk changes to `doneCaptureCase.ts` and `ad-hoc-branch-entry-attribution.spec.ts` while slice 7 was uncommitted. The coordinator's trial merge conflicted; it aborted, saved slice 7 as a patch and a copied spec in the job tmp directory, reverted the worktree, delegated the reconciliation, published the merge, then reapplied with `git apply --3way`, resolved a conflict in `declaredPublisherBranch.ts` and repaired imports before rerunning the refactor proof. Observed effect: about 8 minutes of coordinator time plus a reconciliation agent; slice 7's only copy lived outside Git for 7 minutes. Inference: two Takes from one seed edited the same support module with no recorded prerequisite; a temporary WIP commit would have kept the parked work Git-recoverable. Related to DD-547 (sibling landing first on shared files).

## ODF-530 — Acceptance recorded commitments as observed from cases that never asserted them <a id="dd-597"></a>

<a id="dd-597--acceptance-recorded-commitments-as-observed-from-cases-that-never-asserted-them"></a>
Former local code: DD-597.

- SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`)

[Account and evidence at ODF-530](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-530.md#evidence-2026-11-23-open-dough-dd-597).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-598 — A speed promise over every touched file covered renamed files the premises never timed <a id="dd-598"></a>

The plan's premises timed only the files its regex `intent/intent-.*-comparison-mounted` selected, but the 500 ms promise covered every file the rename touched. That left `intent-source-target-recovery-mounted` (583–1017 ms, mount-bound) to fail at the last slice.

### Occurrences

- Execution: SEED-413#reduce-review-diff-reading-to-logic-cases (plan 744; first implementation `f4e5da6e2`)
  - Timestamp: 2026-11-21 (slice 5 returns; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `87f8e8397`)
  - Evidence: plan 744 Premises row "Intent `-mounted` Playwright per-case times"; slice 5 Result; obligation G3; story Amendment; two slice 5 returns and a developer question.
  - Observed effect: the last slice stopped twice, and the developer had to narrow the speed bar to new or changed cases.

## DD-599 — A completing slice finishes code and proof within 15 minutes, then overruns while writing its multi-commitment return report <a id="dd-599"></a>

The final slice carried 12 of the story's 21 source-review commitments, including whole-story commitments allocated to the completing slice. Implementation, the scratch break, consumer trace and all seven `--clock` runs finished at 14.5 active minutes; writing the 161-line return report ran outside `--clock` and triggered `overrun: true` at 16.0–16.8 active minutes with zero unfinished changes, where `oversized-slice.md`'s `reverted and refined` path conflicts with `problem-decomposition.md`'s rule to preserve compatible completed work and proof.

### Occurrences

- Execution: SEED-413#prove-ad-hoc-review-handoffs-with-typed-handlers (plan 742; first implementation `412b2d8fa`)
  - Timestamp: 2026-11-21T01:58:48.298Z (`overrunDetectedAt: 1795224728298` on slice 4; paused at 2026-11-21T01:59:37.656Z)
  - Tool: Cursor
  - Model: gemini-4-carbon
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9889c9925`; no release inferred from product VERSION)
  - Evidence: `144fc9308:.planning/slice-plans/742-prove-ad-hoc-review-handoffs/PLAN.md` slice 4 and `144fc9308:.planning/slice-plans/742-prove-ad-hoc-review-handoffs/source-review.md` (12 commitments `1c`, `4a`–`9b` on slice 4); worktree `open-dough/slice-clock` (`startedAt: 1795223724231`, 7 `--clock` commands ending `1795224639632` at 14.48 active min, `overrunDetectedAt: 1795224728298` on `Write` of `slice-4-report.md`, `endedAt: 1795224777656` at 16.8 active min).
  - Observed effect: `storyOverruns: 1` recorded with all code and proof already green; coordinator preserved the completed work, recorded the elapsed time in `PLAN.md`, and completed refactor, CI (`dd406eb69`) and Intent Coverage (`Caught` on `doneMarks.ts:171`) with zero rework.
  - Inference: distinct from DD-548 (broad multi-file sweeps); allocating whole-story commitments to the completing slice concentrates return-report prose at the end of its active budget, and `oversized-slice.md` names no completed-work overrun path beside `reverted and refined`.

## ODF-531 — Planned slices bundle hidden preparation, so implementers stop four times for in-place splits <a id="dd-600"></a>

<a id="dd-600--planned-slices-bundle-hidden-preparation-so-implementers-stop-four-times-for-in-place-splits"></a>
Former local code: DD-600.

- SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`)
- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-531](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-531.md#evidence-2026-11-23-open-dough-dd-600).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-532 — The coordinator left the slice clock running through a human question and recorded a false overrun <a id="dd-601"></a>

<a id="dd-601--the-coordinator-left-the-slice-clock-running-through-a-human-question-and-recorded-a-false-overrun"></a>
Former local code: DD-601.

- SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`)
- SEED-422#correct-stale-token-totals (plan 764; first implementation `05428907e`)

[Account and evidence at ODF-532](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-532.md#evidence-2026-11-23-open-dough-dd-601).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-533 — A CI repair's refactor pass turned exact read budgets into relative checks, and repair acceptance kept them <a id="dd-602"></a>

<a id="dd-602--a-ci-repairs-refactor-pass-turned-exact-read-budgets-into-relative-checks-and-repair-acceptance-kept-them"></a>
Former local code: DD-602.

- SEED-418#disclose-shared-checkout-overlap (plan 766; first implementation `c4b05ec8c`)
- SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`)

[Account and evidence at ODF-533](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-533.md#evidence-2026-11-23-open-dough-dd-602).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-534 — Publication proof stopped at the producer script, so acceptance kept a Land route no real Land can use <a id="dd-603"></a>

<a id="dd-603--publication-proof-stopped-at-the-producer-script-so-acceptance-kept-a-land-route-no-real-land-can-use"></a>
Former local code: DD-603.

- SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`)
- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-534](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-534.md#evidence-2026-11-23-open-dough-dd-603).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-604 — Static test listings undercount loop-generated cases <a id="dd-604"></a>

The Dashboard backend list reported one declaration for a test loop. Live Vitest collection expanded each row. Case-count audits need live collection for Vitest and the native listing for Playwright.

### Occurrences

- Execution: SEED-413#restore-done-capture-proof-after-composed-reviews (plan 743, first implementation `0d4666c3f`). Timestamp: 2026-11-21T01:53:36.018Z (candidate declaration listing). Tool: Codex. Open Dough release: unknown (checkout-bound guidance at Take `44d066285`). Evidence: the first matched audit at `0747fb0a2` listed 125 and 120 declarations. `vitest list --no-staticParse` with the same roster counted 135 and 133 runtime cases, and each side had four native Chromium cases. The integrated audit in `706285f9e:.planning/slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md` records 148 and 146 actual cases on the shared `be03d5643` basis. Observed effect: treating declaration counts as the denominator initially suggested five fewer cases on the preliminary basis. Live collection narrowed that difference to two. Inference: the static listing serves source navigation. Its total can misstate a proof-cost claim when rows change.

## ODF-535 — Moved-case conversions drop or self-supply distinct assertions on first return despite the brief's preserve rule <a id="dd-605"></a>

<a id="dd-605--moved-case-conversions-drop-or-self-supply-distinct-assertions-on-first-return-despite-the-briefs-preserve-rule"></a>
Former local code: DD-605.

- SEED-413#mount-story-review-changes-panel (plan 748; first implementation `277d5717c67aed5babc1806881797d52a0ec8235`)

[Account and evidence at ODF-535](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-535.md#evidence-2026-11-23-open-dough-dd-605).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

### Occurrences

- Execution: SEED-413#speed-intent-scope-timing-reading (plan 777; first implementation `5119da43d`)
  - Timestamp: unknown (2026-11-23 +08:00, slices 3–8 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111 (trunk guidance update `27c47b235` before Take `419aeed53`)
  - Evidence: slice 3 dropped the scope's own figures row from `expectComparisonScopeRows` (returned, restored in `ebe6c545f`). Slice 4 kept three legacy short-SHA exclusions that could not fail because the answer never held the SHA (returned: one made discriminating, two removed in `6bb025623`). Slice 6 left six drawing checks without a Done owner (story obligation G1, proved by slice 7 in `8d288cd06`). Slice 5 replaced the legacy-only case's no-timing check with a unit-name check, and acceptance took it (`758ca0df1`, `intent-scope-timing-history-units.spec.ts:103`); only the retrospective's independent outcome review found it, now [plan 783](.planning/slice-plans/783-correct-scope-timing-chart-proof-residue/PLAN.md) finding 2.
  - Observed effect: three acceptance returns and one loss shipped on the story branch.
  - Inference: legacy assertions that could not fail were copied as owners, a related failure the brief's preserve rule does not name.

## ODF-537 — Plan-status absorb marks trunk-delivered Behavior done while the story-branch tip still holds the defect <a id="dd-607"></a>

<a id="dd-607--plan-status-absorb-marks-trunk-delivered-behavior-done-while-the-story-branch-tip-still-holds-the-defect"></a>
Former local code: DD-607.

- SEED-418#correct-published-session-review (plan 746; first related `126fabd26`; final candidate `576150249`)

[Account and evidence at ODF-537](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-537.md#evidence-2026-11-23-open-dough-dd-607).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-456 — Ready plan used an unsupported slice status

- SEED-418#name-unavailable-published-session-review (plan 750; first implementation `b363f2c43`)

[Account and evidence at ODF-456](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-456.md#evidence-2026-11-23-open-dough-odf-456).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-538 — Topic-grouped slices in an 8-slice migration exhaust the 10-slice cap and force a mid-execution story split <a id="dd-609"></a>

<a id="dd-609--topic-grouped-slices-in-an-8-slice-migration-exhaust-the-10-slice-cap-and-force-a-mid-execution-story-split"></a>
Former local code: DD-609.

- SEED-413#speed-intent-timing-history-proof (plan 759; first implementation `40408c07c`)
- SEED-413#make-launch-proof-orthogonal (plan 768; first implementation `ea2ec369a`)
- SEED-413#speed-intent-ci-status-frame-and-timing-history (plan 764; first implementation `ed26bbd04`)

[Account and evidence at ODF-538](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-538.md#evidence-2026-11-23-open-dough-dd-609).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-612 — Board proof used the wrong width at layout breakpoints <a id="dd-612"></a>

Mounted Board checks passed locally and twice failed on Linux CI because their width assertions used a different element or ignored a classic scrollbar.

### Occurrences

- Execution: SEED-413#speed-dashboard-board-and-panel-proof (plan 758, first implementation `caffd17ddc119cf38cffb03c4c7ad53e1669290d`). Timestamp: unknown (the two repair records link to the failing attempts). Tool: Codex. Model: gpt-6.2-sol. Open Dough release: unknown (checkout-bound guidance at Take `c2dd0a1ed`). Evidence: `8dbc370a9034c8d35eb744036d059507510b23f9:.planning/slice-plans/758-speed-dashboard-board-and-panel-proof/PLAN.md` slices 2 and 6. A controlled 15 px track reproduced both failures. The 768 px viewport yielded a 753 px Board, and a separate 1185 px query container held a 1137 px Board. Repairs `e9687f54fa` and `3880060c0` observed rendered columns and preserved navigation and panel continuity. Observed effect: Two branch CI repair cycles interrupted subsequent slices. Both narrow reproductions and ordinary focused checks passed after repair. Inference: Exercising layout breakpoints with a consuming scrollbar before publication could expose the same class of assertion error. Time savings are unmeasured.

## ODF-539 — A `slice-clock run` stopped before its end stays open and hides all later slice time <a id="dd-614"></a>

<a id="dd-614--a-slice-clock-run-stopped-before-its-end-stays-open-and-hides-all-later-slice-time"></a>
Former local code: DD-614.

- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-539](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-539.md#evidence-2026-11-23-open-dough-dd-614).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-540 — The coordinator waited overnight on a slice agent whose run had ended, until the developer asked <a id="dd-615"></a>

<a id="dd-615--the-coordinator-waited-overnight-on-a-slice-agent-whose-run-had-ended-until-the-developer-asked"></a>
Former local code: DD-615.

- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-540](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-540.md#evidence-2026-11-23-open-dough-dd-615).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-541 — A decision about queued work was asked without rechecking trunk, after that story had closed <a id="dd-616"></a>

<a id="dd-616--a-decision-about-queued-work-was-asked-without-rechecking-trunk-after-that-story-had-closed"></a>
Former local code: DD-616.

- SEED-418#attribute-every-workflow-session-record (plan 747; first implementation `e8231e9af`)

[Account and evidence at ODF-541](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-541.md#evidence-2026-11-23-open-dough-dd-616).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-542 — A coordinator loosens its plan's no-outside-call decision on a failed premise without asking, and the Decisions text keeps the old rule <a id="dd-619"></a>

<a id="dd-619--a-coordinator-loosens-its-plans-no-outside-call-decision-on-a-failed-premise-without-asking-and-the-decisions-text-keeps-the-old-rule"></a>
Former local code: DD-619.

- SEED-420#test-compare-on-mounted-intent (plan 765; first implementation `1240413986b`)

[Account and evidence at ODF-542](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-542.md#evidence-2026-11-23-open-dough-dd-619).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-543 — A Git-replay premise is settled on scratch files unlike the product's near-identical records <a id="dd-620"></a>

<a id="dd-620--a-git-replay-premise-is-settled-on-scratch-files-unlike-the-products-near-identical-records"></a>
Former local code: DD-620.

- SEED-418#expire-published-session-records (plan 767; first implementation `c86dd3425`)

[Account and evidence at ODF-543](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-543.md#evidence-2026-11-23-open-dough-dd-620).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-544 — A reshaped case dropped the retired case's focus wait, and CI failed on the published slice <a id="dd-622"></a>

<a id="dd-622--a-reshaped-case-dropped-the-retired-cases-focus-wait-and-ci-failed-on-the-published-slice"></a>
Former local code: DD-622.

- SEED-413#make-launch-proof-orthogonal (plan 768; first implementation `ea2ec369a`)
- SEED-413#speed-intent-scope-timing-history (plan 774; first implementation `e19c1a4c0`)

[Account and evidence at ODF-544](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-544.md#evidence-2026-11-23-open-dough-dd-622).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-545 — A coordinator's acceptance brief let passing cases decide that production layout ancestors could be left out of a page mount <a id="dd-623"></a>

<a id="dd-623--a-coordinators-acceptance-brief-let-passing-cases-decide-that-production-layout-ancestors-could-be-left-out-of-a-page-mount"></a>
Former local code: DD-623.

- SEED-413#speed-intent-ci-status-frame-and-timing-history (plan 764; first implementation `ed26bbd04`)

[Account and evidence at ODF-545](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-545.md#evidence-2026-11-23-open-dough-dd-623).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-546 — Refinement assigned legacy specs to a story by file name, and two "CI history" specs tested scope history <a id="dd-624"></a>

<a id="dd-624--refinement-assigned-legacy-specs-to-a-story-by-file-name-and-two-ci-history-specs-tested-scope-history"></a>
Former local code: DD-624.

- SEED-413#speed-intent-timing-history-on-vitest (plan 772; first implementation `4e4e753a2`)
- SEED-413#speed-intent-source-browsing-and-detours (plan 762; first implementation `14f70e8a9`)

[Account and evidence at ODF-546](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-546.md#evidence-2026-11-23-open-dough-dd-624).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## ODF-547 — A refactor pass reintroduced a key that the slice's source commitment ruled out, because the brief carried no commitments <a id="dd-625"></a>

<a id="dd-625--a-refactor-pass-reintroduced-a-key-that-the-slices-source-commitment-ruled-out-because-the-brief-carried-no-commitments"></a>
Former local code: DD-625.

- SEED-413#speed-intent-scope-timing-history (plan 774; first implementation `e19c1a4c0`)
- SEED-413#speed-intent-source-browsing-and-detours (plan 762; first implementation `14f70e8a9`)

[Account and evidence at ODF-547](https://github.com/terryyin/open-dough/blob/9f08e8ffa820d367ac43816d10f7954bb33976b8/docs/maintainer/findings/ODF-547.md#evidence-2026-11-23-open-dough-dd-625).
Source recovery: `f2dc005fa61b97ac1d8f645c0e09a23a9770b475:DearDough.md`.

## DD-626 — A plan carried a built-app URL assertion into an E2E step without checking it could fail there <a id="dd-626"></a>

Plan 778 slice 2 told the implementer to carry the legacy case's `project=open-dough` URL assertion to a keyboard step in an E2E journey. The single-project built page omits `project=`, so the implementer asserted that the URL stays unchanged after arrow keys. The step cannot fail, and the coordinator accepted it.

### Occurrences

- Execution: SEED-413#speed-intent-revision-and-detour-reading (plan 778; first implementation `ea316f671`)
  - Timestamp: 2026-11-23T08:59:02+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `702d1a213`; base 0.3.110
  - Evidence: slice 2 run `s2-e2e-1` failed the carried assertion; `388cde76a` added "arrow keys choosing Project Intent's view keep the page's URL" to `e2e/intent/intent-project-visit-ci.spec.ts`. The retrospective review found the Intent tab is not in the URL and the only real risk is `preventDefault` in `IntentTabs.tsx`. The correction is SEED-413#correct-revision-detour-proof-residue (plan 781).
  - Observed effect: an E2E step that cannot fail ran on every CI run until the correction; the same pattern left the slice 5 Recent stories URL step without a break check.
  - Inference: when a carried assertion fails its premise, acceptance needs a break check of the replacement before accepting it.

## DD-627 — A plan's decision extended a test page composition that its story's shared acceptance forbids <a id="dd-627"></a>

Plan 778's Current decisions and slice 5 directed rendering the production banner and story-reference notice inside the existing `mountIntentCiPage`. That mount recomposes `ConfiguredDashboard`'s shell, which the shared acceptance forbids ("Never build a test copy of a production composition"). The conflict surfaced only at slice 8's measurement and needed a developer decision.

### Occurrences

- Execution: SEED-413#speed-intent-revision-and-detour-reading (plan 778; first implementation `ea316f671`)
  - Timestamp: 2026-11-23T10:17:41+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision `702d1a213`; base 0.3.110
  - Evidence: slice 5 commit `9f8184d42` grew the mount to 13 production imports. The slice 8 report flagged source-review commitment 19. The developer moved the page-shell owner to SEED-413#drive-published-observation-through-page-entry, recorded as obligation G1 in `a96f35847`.
  - Observed effect: one human stop at the last slice and a source-review rerun after the story amendment.
  - Inference: comparing each Current decision with the shared acceptance during readiness would have raised this before execution.

## DD-628 — A story promised a break check on a guard that another guard makes unobservable <a id="dd-628"></a>

Refinement turned an Intent Coverage finding about the hook's abort guard into a key example saying the case fails when the key filter is removed. The plan's premise recorded only the abort-guard finding, so no probe tested the key filter alone before execution.

### Occurrences

- Execution: SEED-413#speed-intent-scope-timing-reading (plan 777; first implementation `5119da43d`)
  - Timestamp: unknown (2026-11-23 +08:00, slice 1)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111 (trunk guidance update `27c47b235` before Take `419aeed53`)
  - Evidence: with only the key filter removed from `useIntentCiEndpointHistory`, the key-isolation case passed because the intact success-branch abort guard drops every late older-key answer. Three probe rounds followed: Project Intent; a Done story with its landing held, which mounts no scope tree; and the retained follow-up route, which `mountIntentCiPage` cannot reach. None exposed the filter alone. The developer then amended Key example 6 to name the abort guard (`5119da43d`), which required a fresh source review.
  - Observed effect: three implementer returns (about 4.5 of slice 1's 7.6 active minutes), one human question and one extra source review.
  - Inference: a premise naming one guard does not settle a promise about a sibling guard; planning could have probed the promise's own break before readiness.

## DD-629 — A ready plan's empty Story obligations section says "None recorded.", which the obligations script refuses <a id="dd-629"></a>

Plan 781 reached execution with `## Story obligations` followed by the line "None recorded.". The first `story-obligations.mjs list` refused it as `malformed-obligations-section`; an empty section passes.

### Occurrences

- Execution: SEED-413#correct-revision-detour-proof-residue (plan 781; first implementation `fd99453f8`)
  - Timestamp: unknown (2026-11-23 +08:00, before slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111
  - Evidence: plan 781 at Take `19a0372b7`; the coordinator removed the line before slice 1's listing, committed in `fd99453f8`.
  - Observed effect: one refused listing and a plan edit before the first delegation.
  - Inference: planning or readiness accepts placeholder text that execution's script refuses; the readiness check does not run the obligations parser.

## DD-630 — An implementer briefed never to check out paths started an interactive `git checkout -p` during a scratch revert <a id="dd-630"></a>

Slice 7's implementer reverted a scratch production break by composing a command that launched `git checkout -p` in the shared execution checkout. It reported stopping the prompt before answering it and reverting with `sed`.

### Occurrences

- Execution: SEED-413#correct-revision-detour-proof-residue (plan 781; first implementation `fd99453f8`)
  - Timestamp: unknown (2026-11-23 +08:00, slice 7 before `09c280eea`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111
  - Evidence: slice 7 return (`s7-report.md` in the execution checkout's evidence directory); coordinator check showed `dashboard/src` unchanged and no live `git checkout -p` process.
  - Observed effect: no loss; a path checkout forbidden by the brief's ownership rule ran in a checkout holding uncommitted owned work.
  - Inference: scratch breaks reverted by Git path commands risk discarding unowned edits; keeping a backup copy or reverse edit, as slice 5 did, avoids the command family.

## DD-631 — A whole-story commitment allocated to the last slice was briefed with that slice's file scope, so its fixes came back as a report <a id="dd-631"></a>

Source-review commitment 1 (each touched Intent test reads at one level) was allocated to slice 8 as the slice completing the story. The coordinator's brief told the implementer to "fix only within this slice's files, report others", so the return listed two mixed-level cases in earlier slices' files instead of fixing them.

### Occurrences

- Execution: SEED-413#correct-revision-detour-proof-residue (plan 781; first implementation `fd99453f8`)
  - Timestamp: 2026-11-23T13:23:29+08:00 (slice 8 delivery `6071ed2f5`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111
  - Evidence: slice 8 brief and first return; the coordinator returned the two cases (`intent-reading-place.spec.ts` reset count, `intent-home-activation-scope.spec.ts` story note) and the second return fixed them through `story.pressedControlCount()` and `ci.notes()`.
  - Observed effect: one extra implementer round and proof run of about 4 minutes.
  - Inference: a brief carrying a story-wide commitment needs the story-wide edit authority that commitment implies.

## DD-632 — A plan prescribed a restored assertion whose premise proved the defect but not the restored check's failure <a id="dd-632"></a>

Plan 783 slice 1 prescribed restoring the legacy `\b` no-timing regex. Its premise showed the case passing with a scratch "0 ms", but nobody probed the restored regex. The page object's joined text runs "0 ms" into the next word, so `\b` still passed.

### Occurrences

- Execution: SEED-413#correct-scope-timing-chart-proof-residue (plan 783; first implementation `4a3358649`)
  - Timestamp: unknown (2026-11-23 +08:00, slice 1)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111
  - Evidence: break run `s1-break-units-3` passed with `\b`; `s1-break-units-4` failed with `(?![a-z])`. The plan text was amended in `4a3358649`.
  - Inference: probing the prescribed check against the premise's scratch fault during planning would have settled the exact form, as DD-628 also suggests.

## DD-633 — A plan's "no consumer" premise searched member names and missed a wrapper's reader <a id="dd-633"></a>

Plan 783 recorded that `historyChart().failed` has no reader. `e2e/intent/intent-ci-wall-time-history-later.spec.ts:135` reads `.failed` through `measureHistoryChart`, which wraps `historyChart`. The dashboard typecheck caught the removal.

### Occurrences

- Execution: SEED-413#correct-scope-timing-chart-proof-residue (plan 783; first implementation `4a3358649`)
  - Timestamp: unknown (2026-11-23 +08:00, slice 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.111
  - Evidence: run `s2-typecheck` failed with TS2339; `.failed` was kept and recorded as obligation G1 in `50d02ebe7`.
  - Observed effect: one failed typecheck and a narrowed scope commitment; nothing was lost.
  - Inference: a typecheck over the removal settles a "spent member" premise more reliably than a name search.

## ODF-470 — Sequential before/after timings cannot judge a no-slowdown promise

[Meaning and earlier paired-run evidence](docs/maintainer/findings/ODF-470.md).

### Occurrences
- Execution: SEED-413#speed-intent-attempt-and-summary-proof (plan 760, first implementation `cc4d0b9fa`). Timestamp: 2026-11-23T09:26:05+00:00 (first fresh pair). Tool: Codex. Open Dough release: 0.3.112 (installed guidance at Take `2c9c98322`). Evidence: `bacba5db52673a2d3afa18cdba01c7fe746189a4:.planning/slice-plans/760-speed-intent-attempt-and-summary-proof/PLAN.md` retains the 37.900 s historical baseline without load, the near-27 s provisional result, and two fresh exact-roster pairs in both run orders that found the candidate slower. Observed effect: four runs accounting for 111.0 s of runner time ruled out the apparent improvement. After reducing repeated fixture activation cost, a load-matched pair measured 23.652 s legacy and 15.386 s mounted. Inference: starting with a fresh paired baseline and inspecting mounted setup cost before the final migration gate would expose smaller or reversed gains sooner.

## DD-634 — Workspace `open-dough/` evidence pollutes consumer-trace discovery <a id="dd-634"></a>

Writing evidence under a workspace `open-dough/` tree instead of `git rev-parse --git-path open-dough/evidence` leaves untracked paths that consumer-trace treats as changed files.

### Occurrences

- Execution: SEED-413#drive-published-observation-through-page-entry (plan 789, first implementation `a99bc3797`)
  - Timestamp: unknown (Slice 8 consumer-trace on 2026-11-23 +08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.112 (installed at Take `8a41b269fa`)
  - Evidence: `slice8-consumer-trace.txt` lists dozens of `open-dough/evidence/*` changed-path hits; wrap-up notes untracked workspace `open-dough/evidence/*` noise; proof-evidence already names the git-path.
  - Observed effect: consumer-trace dispositions had to ignore misplaced evidence noise once.
  - Inference: agents must resolve the git-path before writing evidence; installed `proof-evidence.md` already names that location.

## DD-635 — Native replay preflight misses the test sandbox boundary <a id="dd-635"></a>

The paid probe proved the Codex launch and accounting path. The baseline test command had only been checked outside the native write sandbox.

### Occurrences

- Execution: SEED-345#finish-slices-within-a-bounded-working-context (plan 794, first delivery `91f51dfd6`). Timestamp: 2026-11-23T09:40:40.616Z (first control backend command exit). Tool: Codex. Model: gpt-6.2-sol. Open Dough release: unreleased, pinned revision `417150eba820acdbea22917093414ccde4600d92`. Evidence: plan 794 accepted probe and trial proof, control `slice-1-backend-first.log.run.json` and `slice-1-local-fixture-recovery.md`, candidate `branch-backend-1.log.run.json` and slice 1 implementation receipt. Observed effect: both arms lost initial backend proof to the sandbox blocking the system process observer at teardown and independently verified local replacements. Inference: one representative test through the exact native sandbox could expose this prerequisite before paid replay. The delays attributable to the boundary were not measured.
