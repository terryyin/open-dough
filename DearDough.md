# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 512. Removed numbers are never reused.
- Recovery: `f0dd36f7f59b4deb1b09616edc422c012af3dad5:DearDough.md` contains the exact log before the latest retention (including DD-490 and DD-482's SEED-318 occurrence, removed then); `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec:DearDough.md` contains the log before the retention before it (including the three oldest ODF-150 occurrences replaced then) and its recovery link to earlier revisions.
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-150.md).

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. [Meaning, evidence and response](docs/maintainer/findings/ODF-229.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-229.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Meaning, evidence and response](docs/maintainer/findings/ODF-158.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-158.md).

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-264.md).

## ODF-314 — An implementation return omits delegated proof rows and needs a second round <a id="odf-314"></a>

Former local code: DD-257. [Meaning, evidence and response](docs/maintainer/findings/ODF-314.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-314.md).

## ODF-322 — A projected delivery result drops the running command's handle <a id="odf-322"></a>

Former local code: DD-325. The coordinator reduced a guarded delivery call to its output text, dropping the live command's session handle; the terminal receipt was recovered through checkout inspection and an exact-candidate resume. [Evidence and current response](docs/maintainer/findings/ODF-322.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-322.md).

## ODF-329 — Implementation returns failed the delivery formatter's lint

Former local code: DD-334. [Meaning, evidence and response](docs/maintainer/findings/ODF-329.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-329.md).

### Occurrences

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>

- Execution: SEED-310#show-trunk-test-scope-timing-history (plan581; first implementation `2e8d46e0ecfdca9183102690c26c34a075bde715`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take `4f52bca1`; no release marker retained in startup context)
  - Evidence: slice1 guarded fresh formatting refused no-param-reassign on frontendServices.projects and require-await on an immediate rerun callback after passing browser/type proof and independent refactor. `2e8d46e0:.planning/slice-plans/581-show-trunk-test-scope-timing-history/slice-1-proof.md` retains the mechanical Object.assign/Promise.resolve repair and unchanged-proof rationale.
  - Observed effect: commit/publication were correctly withheld until the mechanical repair and preparation retry; authored-file lint feedback arrived at coordinator delivery. Earlier-check savings remain unmeasured.

- Execution: SEED-307#run-makeme-harness-once (plan 594; first implementation `67b8c207b174b90a30b6e2edf217d5b59b31b393`)
  - Timestamp: 2026-11-11T23:48:51+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` at accepted Take `0cc07ac0443d5f9d1c807e4cc533cda165136426`)
  - Evidence: coordinator tool results: after the runner proof and the independent refactor, the first guarded fresh returned `preparation-failed`, `operation: formatting`, ShellCheck SC2249 (no default `*)` case) on the new aggregate-exclusion `case` in `scripts/test-jobs.sh`. Both briefs forbade formatting and hook-owned lint. The coordinator moved `add_job` into a `*)` branch, reran six runner tests and retried.
  - Observed effect: commit and publication were withheld for one mechanical repair, proof and preparation loop of about two minutes before accepted `67b8c207b`.
  - Inference: late authored-file lint feedback recurred under briefs reserving the formatter and hook-owned lint to the coordinator. The saving from an earlier read-only check is unmeasured.

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, minutes before publication of `19442de20`, whose hosted run started 20:58:54+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: launch `1c7a1eb2-5a2b-46f1-b563-577760ee7210`; slice 1's first guarded fresh returned `preparation-failed`, `operation: formatting`, two `no-control-regex` errors in new `dashboard/tests/support/terminalSubstituteApplication.ts` after accepted proof and the independent refactor. Both briefs forbade hook-owned lint. The coordinator rebuilt the two patterns with `new RegExp`, reran the spec and typecheck, and the retry published. The slice 2 and 3 briefs then asked for a read-only `npx prettier --check` / `npx eslint` on owned files; neither slice's guarded fresh refused.
  - Observed effect: one mechanical repair, one 21-second proof rerun and one preparation retry before the first publication; none in the two later slices of the same execution.
  - Inference: within this one execution the read-only check coincided with no late refusal; two slices do not measure the saving.
- Execution: SEED-333#spot-completed-stories-that-need-review (plan 608; first implementation `1d95951e0e7457dcd3620eecf6568067b097a3fc`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.98 (installed `.agents/skills/dough-update/VERSION` at accepted Take `7eae86d553974c1b60bfe997df6c826ed73ac4ef`; installed guidance unchanged)
  - Evidence: 2026-11-13 launch `275cb85a-0cce-40c2-8c58-23ce07cea95e`; `40e6e66c06afe45f7034d89522bb74e5f7a32c83:.planning/slice-plans/608-spot-completed-stories-that-need-review/PLAN.md` slice-2 Refactor paragraph retains the guarded-formatting failure after 56 passing cases and six independent-refactor cases: unbound subscription method, no-param-reassign and unused callback argument. The coordinator's suggested this:void repair then hit no-invalid-void-type; a stable arrow subscription, equivalent element alias and identical index construction settled it.
  - Observed effect: both failed preparation attempts withheld commit/publication; mechanical repairs and retries preceded accepted slice 2. Runtime/observing behavior stayed equivalent and final hook/typecheck passed.
  - Inference: same late authored-file lint feedback and coordinator repair churn as existing ODF-329, including its prior this:void example. Briefs reserved formatter/hook-owned lint to the coordinator; no saving from earlier lint is measured.

## ODF-362 — Post-change refactor compressed PLAN.md Story obligations under the file-size gate

Former local code: DD-349. [Meaning, evidence and response](docs/maintainer/findings/ODF-362.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-362.md).

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-333.md).

## ODF-337 — Fresh delivery ownedPaths cannot stage a deleted rename source

Former local code: DD-391. [Evidence and current response](docs/maintainer/findings/ODF-337.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-337.md).

## ODF-396 — Planning basenames overwhelm a test-local consumer trace

Former local code: DD-404. [Evidence and current response](docs/maintainer/findings/ODF-396.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-396.md).

## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script

Former local code: DD-425. [Evidence and current response](docs/maintainer/findings/ODF-427.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-427.md).

## ODF-428 — A refactor moved tests after acceptance had cited them, leaving source-review observations stale

Former local code: DD-431. [Evidence and current response](docs/maintainer/findings/ODF-428.md).

[Occurrences retained in the catalog](docs/maintainer/findings/ODF-428.md).

<a id="dd-442--a-shallow-historical-checkout-still-inherited-the-host-git-object-store"></a> DD-442 — A shallow historical checkout still inherited the host Git object store. [Project evidence](docs/maintainer/project-maintenance-findings.md#dd-442).

<a id="dd-445--timeout-headroom-judged-from-one-hosted-run-missed-run-to-run-variance"></a> DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance. [Project evidence](docs/maintainer/project-test-findings.md#dd-445).

<a id="dd-450"></a><a id="dd-450--a-plans-identical-step-tree-proof-did-not-account-for-a-per-run-random-value"></a> [DD-450 moved to ODF-074](docs/maintainer/findings/ODF-074.md).

<a id="dd-452--a-shell-check-gained-a-browser-its-ci-job-did-not-install"></a> DD-452 — A shell check gained a browser its CI job did not install. [Project evidence](docs/maintainer/project-findings-history.md#dd-452).

## ODF-434 — Coordinator sends an unsubstituted placeholder to a delegated agent <a id="odf-434"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-434.md). This facet: the implementation brief, not the source-only reviewer.

<a id="dd-463"></a> DD-463 — A reverse import-closure selection silently dropped importers. [Project findings](ProjectFindings.md#dd-463).

<a id="dd-465"></a> DD-465 — An empty focused path list ran the whole local suite. [Project findings](ProjectFindings.md#dd-465).

<a id="dd-481"></a><a id="dd-481--freshness-chooses-a-pre-take-merge-base-despite-another-base-containing-the-accepted-take"></a>

## ODF-482 — Freshness chooses a pre-Take merge base despite another base containing the accepted Take

Former local code: DD-481.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-482.md#odf-482).

<a id="dd-482"></a><a id="dd-482--ready-plan-used-singular--slice-so-obligations-could-not-list-slices"></a>

## ODF-368 — Ready plan used singular `## Slice`, so obligations could not list slices

Former local code: DD-482.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-368.md#odf-368).

<a id="dd-488"></a><a id="dd-488--guarded-slice-delivery-rejects-its-retained-markdown-hard-break"></a>

## ODF-484 — Guarded slice delivery rejects its retained Markdown hard break

Former local code: DD-488.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-484.md#odf-484).

<a id="dd-489"></a><a id="dd-489--generic-wrap-up-publication-prose-contradicts-story-branch-integration"></a>

## ODF-485 — Generic wrap-up publication prose contradicts Story Branch integration

Former local code: DD-489.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-485.md#odf-485).

## DD-491 — A proof limitation accepted at slice acceptance returned as a queued correction after Intent Coverage

At slice acceptance the coordinator returned the proof for the state the story's example names and explicitly let two further states the plan's decision enumerates stand as a named limitation. The wrap-up Intent Coverage check then confirmed that limitation as a missing test path, and closure had to create a correction story, a plan, a premise observation, a readiness record and a queue entry for it.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11; acceptance about 20:50+08:00, Intent Coverage report 23:51+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: plan 591 decision 1 names `vt200`, `drag` and `any`; the coordinator's return of slice 1 asked for the `any` case and said `vt200` and `drag` "may stay as members of the same list without their own page opens"; the plan's slice 1 `Accepted:` text records it. Intent Coverage at `7981c2cce` removed `"vt200"`: maintained spec 2 passed, scratch witness failed. Closure wrote `SEED-316#prove-swipe-under-button-event-tracking` and plan 596 and ran one more scratch witness for `drag`.
  - Observed effect: a second planned work item for two page opens of an existing test, estimated by the returning agent at about four seconds each.
  - Inference: the coordinator weighed test run time and not the closure cost of an evidenced gap. Whether acceptance should hold every state a plan decision enumerates is a judgment this record does not settle.

## DD-492 — A plan promised an existing layout family would stay green without measuring the room a new pinned control needs

The plan's proof named the phone toolbar's measuring specs as preserved consumers and its premises observed selection, copying and scrolling, but no premise measured whether a fourth pinned key fits the narrowest proof viewport. Implementation found it does not, and the trade-off reached the developer only at the completion handoff.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, slice 2 implementation between about 21:15 and 22:30+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: plan 591 slice 2 "Preserved consumers: the `tests/terminals/agent-terminal-touch*` family"; the slice 2 return measured the lane before Enter at 228 pixels before and 172 after at a 390-pixel viewport, and unchanged `agent-terminal-touch-keys.spec.ts` failed "Down is cut by what clips it". The story fixes **Select** beside **Paste**, so the coordinator kept it, the keys spec gained two sideways strokes, and the plan and handoff carry the layout choice.
  - Observed effect: slice 2's implementation took about 77 minutes of agent time, part of it on this diagnosis and on timeouts from other worktrees' load; one existing spec was adapted; one product choice is left with the developer after delivery.
  - Inference: a width measurement in preparation, as cheap as the premises that were observed, would have put the choice before the developer at refinement. The share of the 77 minutes due to this premise is not separable from the load-related share.

<a id="dd-493"></a><a id="dd-493--a-source-only-review-numbers-context-and-proof-method-statements-as-commitments-that-each-need-an-observation"></a>

## ODF-481 — A source-only review numbers context and proof-method statements as commitments that each need an observation

Former local code: DD-493.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-481.md#odf-481).

## DD-494 — A story's "still proves" example named a result the base's checks never asserted

Former branch-local code: DD-490 in `03dff46c0`; renumbered during integration to preserve the unrelated finding already published on trunk.

A test-speed story promised that its faster checks "still" prove a behavior.
The base's journey did not assert all of it, so the plan's rule that cases only
lose work could not satisfy the story's own example.

### Occurrences

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (execution 2026-11-11 20:44 to about 2026-11-12 01:30 +08:00; exact event time not retained)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: the story's key example reads "Rotating to landscape and back keeps the file, the comparison and both reading places"; its source evidence, `.planning/evidence/SEED-303-early-handoff/coverage-map.md` row 37, says "both pane positions"; at base `58442ace8` `keepReviewContextThroughTouch` compared only the code pane's place across rotation, Maximize and Restore. The source-only review's per-clause commitments 14d, 14f and 14g exposed the gap at slice 4 acceptance; the slice was returned and `expectKept` added in `b9d7cb61a`.
  - Observed effect: one returned slice, about an hour of agent time under machine load, and four added assertions the plan had ruled out; the product kept the place in every arrangement, so no defect was found.
  - Inference: refinement took the example's result from a coverage summary without a premise row checking the base assertion. Per-clause source-review ids caught it, but only at the last code slice.

<a id="dd-495"></a><a id="dd-495--a-planned-step-removal-named-no-owner-for-a-fault-the-step-detected-only-in-passing"></a>

## ODF-435 — A planned step removal named no owner for a fault the step detected only in passing

Former local code: DD-495.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-435.md#odf-435).

## DD-496 — An intermittent local failure in a journey the slice changed was attributed to machine load, and hosted CI failed it on a deterministic cause

A changed browser journey failed in some local runs at the 30 s test timeout while other, unchanged journeys timed out from fixture time under external load. Three agents classed it with them and the slice was published; the journey had its own defect.

### Occurrences

- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: 2026-11-12T02:17:28Z (hosted CI run of the failing job; local runs 09:10–10:10+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1's shared step `startedSessionTerminal` first waited for the session's Taken entry. `launches/agent-launch-start-session-touch.spec.ts:32` then failed locally in 2 of 4 implementer runs and both refactor-agent runs, each at that wait, under load averages 31–46; its trace showed fixtures taking 22–23 s. The plan Outcome, the refactor return and the coordinator's acceptance recorded it as load beside `responsive-session-access.spec.ts:44`. Hosted CI run 43139863774 failed only that journey at the same line. Cause: a terminal covering a narrow page sets `aria-hidden` on the page column (`dashboard/src/PageFrame.tsx`), so the role locator finds no entry while the terminal is shown; the wait passed only when the entry rendered first. Repair `b6f325ffb`.
  - Observed effect: one owned CI failure, a stash and restore of slice 2's uncommitted work, and one repair commit.
  - Inference: the failure's line was inside code the slice added, unlike the unchanged journeys that timed out in fixtures or polls; that difference was visible in the first failing log and was not used to separate it. The base-content comparison the coordinator ran for two other specs was not run for this one.

The dashboard test-helper defect and its repair are recorded in [ProjectFindings.md](ProjectFindings.md#dd-496).

## DD-497 — A plan premise that two entry points share a component stood in for observing the second entry point's keyboard outcome

The plan settled "the page rule is one condition for Start session and Follow up alike" by noting that Follow up renders the same component, and promised the keyboard return for both. The second entry point sits inside a list with its own focus rescue.

### Occurrences

- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: unknown (2026-11-12, slice 2 implementation, about 10:15–10:40+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 597's premises table: "The scratch condition typechecked and changed the outcome. `dashboard/src/FollowUp.tsx` renders the same `StartSession`." Its planning scratch run asserted no keyboard position after an instructed Follow up. In slice 2 the implementer's new assertion found the keyboard on the source entry: Recently done's held-entry rescue (`dashboard/src/recentlyDoneFocus.ts`, a layout effect) ran before the launcher's return (`dashboard/src/launchDialogLauncher.ts`, then an effect). The implementer stopped that path; the coordinator kept the story's example and the fix landed in `708ce1ab4`.
  - Observed effect: one implementer stop and resume, and a focus-timing change to every launch dialog that the plan had not sized.
  - Inference: shared rendering settles what is requested, not what surrounds the component; the keyboard promise depended on the surroundings.

<a id="dd-498"></a><a id="dd-498--a-coordinators-timing-loop-filtered-runner-output-so-the-one-failed-run-left-no-evidence"></a>

## ODF-108 — A coordinator's timing loop filtered runner output, so the one failed run left no evidence

Former local code: DD-498.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-108.md#odf-108).

## DD-500 — A story promised an absolute case time at a load profile whose premises were measured only on a quiet host

The story's load example promised a slowest case body under 10 s at one-minute load 30–50. Its premises and baselines were observed at load 4–7, and the one loaded baseline was the case the story removes. The unchanged sibling cases were never timed at the promised load.

### Occurrences

- Execution: SEED-326#pass-later-proof-comparison-checks-under-load (spent plan 589 recoverable at before-cleanup `4368ce5b9d63f1de43040488fd110fe81bd9eeb2`; first implementation `2202c53fb2d3a4e26599b450d8bb00d9311f1ca3`)
  - Timestamp: 2026-11-12T14:19:27+08:00 (end of the diagnostic run)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 589 "Decisive premises" ("one-minute load 4–7") and "Current decisions" ("The load range, the 10 s margin and the 1.5 ratio are refinement's figures"); slice 3's load observation at `3befd9f85`: 14.5 and 14.0 s for the two "equivalent" cases at load 36.8–38.3, with about 6 s in the shared `origin` fixture and 9–11 s in 20–33 `gh` starts, both excluded by the story's scope limits.
  - Observed effect: execution stopped for the developer after two delivered slices; the example was restated to 20 s, the source review was obtained again, and three counted runs then passed with a slowest body of 16.2 s. Two load-raising sessions of 30 helpers ran instead of one.
  - Inference: one loaded run of the unchanged file during refinement, as cheap as the premises that were observed, would have shown the floor before the figure was promised. One occurrence; the related cost in DD-499 came from the same file under load.

<a id="dd-501"></a><a id="dd-501--a-fresh-source-review-after-a-one-clause-amendment-returned-different-ids-for-unchanged-commitments"></a>

## ODF-383 — A fresh source review after a one-clause amendment returned different ids for unchanged commitments

Former local code: DD-501.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-383.md#odf-383).

## DD-502 — Named-sibling reconciliation entered Git before the backlog adapter

Originally DD-500 on the story branch at `3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c`; assigned DD-502 during integration because trunk had independently allocated DD-500 and DD-501.

The coordinator ran a raw no-commit merge that combined the product backlog and done records, although the installed backlog guidance requires its Git adapter from the start. A later semantic check can establish the resulting bytes but cannot retroactively supply the skipped pre-commit gate. The existing adapter guidance is explicit; no defect in its reconciliation algorithm is evidenced here.

### Occurrences

- Execution: SEED-287#fit-dashboard-journeys-in-default-timeout
  - Timestamp: unknown (2026-11-12 reconciliation; exact invocation time not retained separately)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound managed guidance inherited with maincaf48c6)
  - Evidence: coordinator tool history used `git merge --no-commit --no-ff caf48c6fa41b6a45dcdad4eac35cda9a858b2047`; published composition `694e6d91` has parents08d2903c/caf48c6. Post-publication shared `mergeBacklogs(fd164,08d,caf)` produced exactly its backlog (15 entries,13 compatible transitions), `/tmp/seed287-published-backlog-merge-20261112/validation.json`; real catalog-done verified343 records already canonical.
  - Observed effect: the adapter was not the invocation path, despite a clean backlog result; no lost membership, priority, record or catalog is observed. Later integration uses the installed history-preserving publisher/backlog adapter.
  - Inference: the coordinator reached backlog-specific guidance after reconciliation, rather than at that Git boundary. Apply the existing adapter entry point before future combining operations; this one occurrence does not establish a general guidance or tooling defect.

## DD-503 — A load timeout in the checked journey was attributed and profiled before the coordinator looked for the Taken story that already owned it

During wrap-up, Intent Coverage left the restored run unverified after the probed journey hit the 30 s default under host load. The coordinator reran it, compared it against the base under the same load, and traced it. Only after that did it find that a Taken story names this journey and owns its fix under load.

### Occurrences

- Execution: SEED-327#strengthen-pending-take-protection-assertions (spent plan 601 recoverable at before-cleanup `d59553452a5ac800fec0acd60481cf37d0470098`; first implementation `93b411f88ab2d58021fda29e2a1d980d8f362c17`)
  - Timestamp: 2026-11-12T07:06:00Z (approximate; local reruns started 15:06+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: the Intent Coverage report's two restored runs of `responsive-session-reconciliation.spec.ts:44` timed out at 32.1 s and 32.0 s (load about 21–26). The coordinator then ran three reruns (one timeout), set up a base worktree at `aa8ac5f89`, ran six alternating base/exec runs (base 15.0–29.8 s; exec 13.7–31.6 s, one timeout) and one traced run, and only then read trunk's backlog. Taken SEED-287#fit-dashboard-journeys-in-default-timeout (plan 576; agent chaifeng-chan) names `responsive-session-reconciliation` under local load 20–30. Earlier, the slice 1 return had reported this journey at 28.8 s of its 30 s budget (load 36) and blamed a parallel typecheck; acceptance did not look for an owner.
  - Observed effect: about ten focused runs and one scratch worktree setup, roughly 10 minutes. The result was the coordination boundary the failure policy already names: no repair, owner reported.
  - Inference: the base comparison was still needed for attribution. Searching the backlog for the spec name could have found the owner first and saved the profiling. This has happened once.

<a id="dd-504"></a><a id="dd-504--a-plans-whole-suite-gate-named-npm-test-for-dashboard-journeys-it-does-not-run"></a>

## ODF-495 — A plan's whole-suite gate named `npm test` for dashboard journeys it does not run

Former local code: DD-504.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-495.md#odf-495).

## DD-505 — The file-size gate stopped delivery for a one-line link retarget in an already oversized seed

Moving a guide section, as the plan allowed, broke an anchor that an 874-line multi-story seed links to. Retargeting that one link put the seed in the change, and the post-change refactor's 250-line check stopped delivery for a developer exception. Related to ODF-362: in both, the generic line cap reaches a planning record rather than product code.

### Occurrences

- Execution: SEED-329#use-shared-test-guidance (spent plan 603 recoverable at before-cleanup `b7f0a0308ef615307f7865023f534575fec5fe2f`; first implementation `c1800ab36079b671a574b0ed3d18cd517b742695`)
  - Timestamp: 2026-11-12T10:12:46Z (dashboard attention receipt for the stop)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `68c889b37`)
  - Evidence: plan 603 allowed extracting the journey guide's pilot "preserving incoming references" and sized only `AGENTS.md`, the two guides and the configuration. `.planning/seeds/SEED-300-dashboard-test-page-objects.md` line 186 linked `writing-journeys.md#what-the-pilot-earned`; the refactor return ended `## REFACTOR JIDOKA STOP` naming that seed at 874 lines; Terry replied "approve the exception".
  - Observed effect: one developer round trip and a dashboard attention report before the first commit. The refactor pass otherwise made two small de-duplication edits.
  - Inference: the plan could have named the oversized seeds its relocation touches and carried a decision for them, or the size check could treat a forced link retarget in a planning record differently. This record does not settle which.

## DD-506 — A configuration promise proved only by scratch observation became a correction after Intent Coverage

The plan proved that the `tests` Intent entry now selects MakeMe for runner-scheduled Node tests by running the installed selector over all scheduled sources in scratch. It added no maintained check, because "no new automated prose test" was needed for the routing links. The retrospective then flagged the missing guard as product advice, and Intent Coverage confirmed it: reverting the declaration left every maintained check passing. Closure wrote a correction story, plan, premise observation, readiness record and queue entry. Related to DD-491, where acceptance, rather than planning, let a gap stand.

### Occurrences

- Execution: SEED-329#use-shared-test-guidance (spent plan 603 recoverable at before-cleanup `b7f0a0308ef615307f7865023f534575fec5fe2f`; first implementation `c1800ab36079b671a574b0ed3d18cd517b742695`)
  - Timestamp: 2026-11-12T10:30:32Z (Intent Coverage report end clock)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `68c889b37`)
  - Evidence: plan 603 "Selection matrix and local gates" chose existing fixture-based checks and scratch selector runs; Intent Coverage at `c1800ab36` reverted the `tests` entry and the four focused checks still passed; closure queued `SEED-329#guard-scheduled-test-makeme-selection` with plan 605. Its premise run shows the guard over `scripts/test-jobs.sh` costs about 154 ms.
  - Observed effect: a second planned work item for a check about as cheap as the scratch observation that proved the first.
  - Inference: the plan grouped a changed selection behavior with documentation links when it judged automated proof unnecessary. A change to a configuration that a shared mechanism reads may need its own maintained check of the repository's real configuration.

## DD-507 — A resource hold became a quiet-window prerequisite without an established target

After AC was restored, execution context required a quiet or coordinated CPU
window before completing browser proof. The developer clarified that moderate
CPU usage in a moderately busy context must work. Host observations did not
establish an idle-machine acceptance condition.

### Occurrences

- Execution: SEED-300#express-review-test-intent-through-page-objects (plan582; first implementation `14d6f4e9f47ee91fdedadc28856ce0b50c38f777`)
  - Timestamp: unknown (2026-11-12 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take750e9e4f2; no execution-time release marker retained)
  - Evidence: `67bb91d5415c72cdd7c1252c4fcb180c45dcb4c9:.planning/slice-plans/582-review-test-intent/execution-context.md`, Resource stop/AC restoration and Moderate busy-machine target; prior unfinished dashboard reports and developer clarification in launch39024964-857a-4f8a-9668-fb62a939fb7e. The final current cohorts passed under ordinary concurrent work after concrete cold-fixture and accepted lifecycle-supplier changes.
  - Observed effect: Two resource-stop handoffs preceded clarification and resumed proof. The invalid quiet prerequisite was removed; wrap-up retains the supported moderate-busy expectation in tests/local-test-resources.md.
  - Inference: Battery10% and recurring30unowned CPU burners justified investigating resource limits; they do not prove that ordinary moderate concurrency needs an idle window or explain every timeout. Keep host evidence separate from the supported target and diagnose concrete setup/observation costs. This is an agent judgment issue, not an evidenced requirement in the skill.

## DD-509 — Measured figures were fixed before their floor was probed
A story fixed a per-case time and a speed ratio at preparation; only a probe after five delivered slices showed the fixed cost every case pays.

### Occurrences
- Execution: SEED-324#pass-landed-ci-repeat-checks-under-high-load (plan 599; first implementation `5fa058c0db92cd726fdc18c4b1c4c291451cf41f`)
  - Timestamp: unknown (2026-11-12 to 2026-11-13 execution)
  - Tool: Claude Code
  - Model: claude-fable-5-2, then claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `095f2bff9`)
  - Evidence: plan 599 "First measured run", "Slice 6 record" and "Terry's decision, 2026-11-13"; seed amendments of key examples 1 and 8.
  - Observed effect: three developer stops, two scope amendments and a replan from slice 6 to 10.
  - Inference: a promised figure is a decisive premise; probing the fixed per-case cost (server start, fixture preparation, provider calls) first would have set an achievable figure.

<a id="dd-510"></a><a id="dd-510--a-ci-failure-on-a-long-behind-branch-was-repaired-before-checking-trunk"></a>

## ODF-490 — A CI failure on a long-behind branch was repaired before checking trunk

Former local code: DD-510.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-490.md#odf-490).

<a id="dd-511"></a><a id="dd-511--a-coordinator-offered-a-suite-wide-setting-with-an-understated-reach-and-the-human-approved-that-description"></a>

## ODF-491 — A coordinator offered a suite-wide setting with an understated reach, and the human approved that description

Former local code: DD-511.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-491.md#odf-491).

## DD-512 — Sibling stories of one family built parallel owners for the same test controls while running concurrently

Three SEED-300 stories (review, Terminal, Board) landed on trunk while this story ran on its branch, and each built its own owner for shared session and report controls. Source freshness compares only the story and plan records, and the plan named no sibling for coordination, so the overlap surfaced only in the retrospective's whole-product review.

### Occurrences

- Execution: SEED-300#express-session-test-intent-through-page-objects (plan 585; claim `2467be8a5`; first implementation `70c34e8c5`)
  - Timestamp: unknown (2026-11-13, retrospective outcome review before the first trunk merge)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (installed `.claude/skills/dough-update/VERSION` at Take `2467be8a5`)
  - Evidence: trunk `67bb91d54` added `sessionEntryAccess.ts` and `2137dfd0d` `terminalScreenPage.ts` while the branch built `openTerminalOf`/`readFinalReportOf` in `dashboardParts.ts`; merging `68bdc4f10` conflicted in 77 files and the Board landing `4f7214879` in 13; `source-freshness.mjs check` returned `unchanged` at every slice; plan 585 recorded shared code as "no blocking story dependency".
  - Observed effect: a developer decision, two added reconciliation slices (7, 8) with a full dashboard run, and three CI repairs for trunk-introduced test races that the merged revision exposed.
  - Inference: when a family is split into concurrently runnable stories over shared test owners, owner allocation at split time or named-sibling coordination in each plan would surface the overlap per slice; record freshness alone does not.
