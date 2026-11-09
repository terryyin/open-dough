# DearDough Process Findings

Shared occurrence evidence and response history live in the linked
[catalog](docs/maintainer/finding-names.md). [Project findings](ProjectFindings.md)
retain local facets. The full source before this compaction is
`cf1ea1debbd50eac9cfe73a2e6a6782597764fdf:DearDough.md`. Earlier source recovery is in that revision.

## Retention

- Highest allocated local number: 473. Removed numbers are never reused.
- Occurrence history is partial.
## ODF-087 — Skipped preparation gates <a id="odf-087"></a>
Former local code: DD-089. [Evidence and current response](docs/maintainer/findings/ODF-087.md).
## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>
Former local code: DD-057. [Meaning, evidence and response](docs/maintainer/findings/ODF-059.md).
## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>
Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).
## ODF-074 — Unverified planning premises <a id="odf-074"></a>
Former local code: DD-450. Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Former local code: DD-307. Former local code: DD-400. Former local code: DD-393 (`6c354905e`), renumbered in merge `966aad8b1`. DD-400's facet: a decisive premise probe proved the capability, not the story's restriction it settled. [Meaning, evidence and response](docs/maintainer/findings/ODF-074.md).

### Occurrences
- Execution: SEED-268#conclude-fluent-side-panel-pilot (plan 521-conclude-fluent-side-panel-pilot; first related implementation `da1478f7d77f1f72490871891ef219f2f859f32a`)
  - Timestamp: unknown (2026-11-08, before the first slice delegation)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.91 (installed `.agents/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 521 at `ef5c3aca3158eacd1deb4b4a11e96ce4f64a9bd6` was recorded ready with `**Status:** pending`. The first `story-obligations.mjs list --slice 1` refused with `unreadable-slices` and `unknown-slice`.
  - Observed effect: changing only the status word to `planned` let the same listing pass with all 39 allocated source commitments. The selected story and its proof stayed the same.
  - Inference: the preparation and execution status mismatch observed in Plan 519 recurred under 0.3.91.
- Execution: SEED-262#migrate-clean-trunk-fixtures (plan 514-migrate-clean-trunk-fixtures; first related implementation commit `1f6adb33a20fe8eb45f382b7cde3c5141ab41dd2`)
  - Timestamp: unknown (2026-11-08, slice 5 return before `91966e3aa`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 514 (`42717b7da:.planning/slice-plans/514-migrate-clean-trunk-fixtures/PLAN.md`)'s premise row "No native shell fixture loads the family modules" inspected the native shell scripts and the owned-context fixture only. `tests/support/execution-worktree-prep-native-fixture.mjs` loaded the migrated worktree-preparation builders (story obligation G4), and `native-import-closure.mjs` on that journey's three modules lists 10 modules at `db42e79a7` and 49 at `91966e3aa`. The git-publication admission identity (`tests/support/git-publication-native-evidence.sh:39-42`) already hashed three family modules the plan changed.
  - Observed effect: The slice 5 implementer found the native journey's repository changed. A return restored it with verbatim pre-story builders; the retrospective still found MakeMe in that journey's import closure and planned a correction.
  - Inference: The journeys' hashed import closures, not shell sources, list what a native identity depends on; the premise needed that list.

- Execution: SEED-262#migrate-backlog-scratch-repositories (plan 524-migrate-backlog-scratch-repositories; first related implementation commit `6c379369119c4bf540976b951a6d1a9aee88e9d7`)
  - Timestamp: unknown (2026-11-08, slice 1 return and slice 3 acceptance, before `898ef65d6` at 2026-11-08T21:26:21+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 524 at `d9a8bd386`: the premise "No paid run" searched only `*.sh`/`*.bash` for the family's module names, yet the retained `tests/fixtures/native-streams/*/publication/admission-investigation/*/record` files list `tests/support/product-backlog-fixture.mjs` and `repositoryTestData.mjs` as `input-hash` lines. The premise "entries without an identity cannot be rendered" was false: `renderEntry` writes `- [Item A](seeds/A.md#a)` when the identity is the link.
  - Observed effect: Slice 1 took the simpler path the false rendering premise had ruled out; slice 3's coordinator had to confirm that no check compares recorded input hashes with current files before accepting. Neither changed the outcome.
  - Inference: Same facet as plan 514's row: a native identity's hashed import closure, not shell sources, lists what it depends on.
- Execution: SEED-275#story-intent-tabs (plan 531-review-story-intent-tabs; first related implementation commit `4a13bba4f1c4340c5ed1705854dbc0a7e72942c6`)
  - Timestamp: unknown (2026-11-08, slice 1 return and slice 5 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 531 (`c764457107:.planning/slice-plans/531-review-story-intent-tabs/PLAN.md`)'s proof stated "Verify **Review changes** opens the existing comparison for the outside count and returns focus when closed". ADR 0008's Selected story row says closing the Side panel clears the selection, and slice 1 observed focus landing on `BODY`. The story's Visual acceptance required light and dark comparison. The dashboard has no dark theme: only `intent-ci-cues.css` and `intent-location-group.css` react to `prefers-color-scheme`. The decisive premises observed neither condition.
  - Observed effect: slice 1 was returned once for a focus home. Slice 5 could not finish until Terry amended the story and deferred dark comparison to SEED-278#dashboard-dark-theme.
  - Inference: proof rows that promise existing-product behavior or review conditions need the same premise observation as the behavior they change.

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>
Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. [Evidence and current response](docs/maintainer/findings/ODF-110.md).
## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>
Former local code: DD-127. [Evidence and current response](docs/maintainer/findings/ODF-157.md).
## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>
Former local code: DD-128. [Evidence and current response](docs/maintainer/findings/ODF-158.md).
## ODF-106 — Colliding plan numbers <a id="odf-106"></a>
Former local code: DD-155. [Meaning, evidence and response](docs/maintainer/findings/ODF-106.md).
## ODF-141 — Fixed refactor cost on small accepted slices <a id="odf-141"></a>
Former local code: DD-192. [Meaning, evidence and response](docs/maintainer/findings/ODF-141.md).
## ODF-204 — Interrupted delegated agent keeps running and publishes <a id="odf-204"></a>
Former local code: DD-215. [Evidence and current response](docs/maintainer/findings/ODF-204.md).
## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>
Former local code: DD-217. [Evidence and current response](docs/maintainer/findings/ODF-205.md).
## ODF-152 — File-size gate conflicts with approved intermediate scope <a id="odf-152"></a>
Former local code: DD-219. [Evidence and current response](docs/maintainer/findings/ODF-152.md).
## ODF-209 — Concurrent CI reproduction overloads slice proof <a id="odf-209"></a>
Former local code: DD-221. [Meaning, evidence and response](docs/maintainer/findings/ODF-209.md).
## ODF-210 — Removal proof omits an existing user capability <a id="odf-210"></a>
Former local code: DD-234. [Evidence and current response](docs/maintainer/findings/ODF-210.md).
## ODF-211 — Admission is ambiguous for an unlanded story correction <a id="odf-211"></a>
Former local code: DD-237. [Evidence and current response](docs/maintainer/findings/ODF-211.md).
## ODF-217 — Unverified refactor proof effects <a id="odf-217"></a>
Former local code: DD-239. Former local code: DD-248. Former local code: DD-450 (private fixture branch only, `a8cc402fd`). [Evidence and current response](docs/maintainer/findings/ODF-217.md).
## ODF-218 — Formatting invalidates a pre-format size check <a id="odf-218"></a>
Former local code: DD-241. [Evidence and current response](docs/maintainer/findings/ODF-218.md).
## ODF-219 — Background coordinator implements outside the local-slice condition <a id="odf-219"></a>
Former local code: DD-245. [Evidence and current response](docs/maintainer/findings/ODF-219.md).
## ODF-100 — Masked formatter failure <a id="odf-100"></a>
Former local code: DD-251 (plans 264 and 271 only). [Meaning, evidence and response](docs/maintainer/findings/ODF-100.md).
## ODF-097 — Publishing after a failed check <a id="odf-097"></a>
Former local code: DD-251 (plan 273 only). [Evidence and current response](docs/maintainer/findings/ODF-097.md).
## ODF-222 — Post-commit managed delivery stalls at an unknown stage <a id="odf-222"></a>
Former local code: DD-253 (Cursor plan 273 only). [Evidence and current response](docs/maintainer/findings/ODF-222.md).
## ODF-184 — Unbounded Git transport stalls managed delivery <a id="odf-184"></a>
Former local code: DD-253 (Claude Code plan 274 only). [Evidence and current response](docs/maintainer/findings/ODF-184.md).
## ODF-220 — Code-level planning findings become stale on trunk <a id="odf-220"></a>
Former local code: DD-254. [Evidence and current response](docs/maintainer/findings/ODF-220.md).
## ODF-221 — CI repair misses a sibling with the diagnosed cause <a id="odf-221"></a>
Former local code: DD-255. [Evidence and current response](docs/maintainer/findings/ODF-221.md).
## ODF-224 — Native replay changes the retained acceptance checkpoint <a id="odf-224"></a>
Former local code: DD-258. [Evidence and current response](docs/maintainer/findings/ODF-224.md).
## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>
Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences
- Execution: SEED-261#map-published-work-test-data (plan 508-map-published-work-test-data; first related implementation commit `8ea16d198c25169e76fc747377693540c7164b03`)
  - Timestamp: 2026-11-08T02:38:39Z (failed CI job completion)
  - Tool: Codex
  - Open Dough release: 0.3.90 (installed .agents/skills/dough-update/VERSION at the established Take)
  - Evidence: Slice 3's 50-job selection in `e85d59b0:.planning/slice-plans/508-map-published-work-test-data/PLAN.md` did not include `workspace-publication.test.mjs`. [Run 42439000527, test shard 1](https://github.com/terryyin/open-dough/actions/runs/42439000527/job/128603980600) failed because `publishReadyAssessment` still supplied the old digest fields.
  - Observed effect: One published increment failed CI. Slice 4's existing `expectedBasis` repair passed the exact job, and run 42440063442 passed the Node shards.
  - Inference: The old call crossed a skill test case module into the shared Node preparation adapter. The focused selection did not exercise that import chain.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>
Former local code: DD-260. [Evidence and current response](docs/maintainer/findings/ODF-225.md).
## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>
Former local code: DD-261. [Meaning, evidence and response](docs/maintainer/findings/ODF-121.md).
## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>
Former local code: DD-262. [Meaning, evidence and response](docs/maintainer/findings/ODF-226.md).
## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>
Former local code: DD-263. [Evidence and current response](docs/maintainer/findings/ODF-227.md).
## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>
Former local code: DD-264. [Evidence and current response](docs/maintainer/findings/ODF-228.md).
## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>
Former local code: DD-265. [Meaning, evidence and response](docs/maintainer/findings/ODF-229.md).
## ODF-230 — Planned proof relies on a forbidden shared installation <a id="odf-230"></a>
Former local code: DD-266. [Evidence and current response](docs/maintainer/findings/ODF-230.md).
## ODF-231 — Setup gate misses the project’s exact runtime pin <a id="odf-231"></a>
Former local code: DD-267. [Evidence and current response](docs/maintainer/findings/ODF-231.md).
## ODF-187 — Planned observations cannot detect regressions <a id="odf-187"></a>
Former local code: DD-268. [Evidence and current response](docs/maintainer/findings/ODF-187.md).
## ODF-232 — Acceptance publishes an explicitly unobserved host fact <a id="odf-232"></a>
Former local code: DD-270. [Evidence and current response](docs/maintainer/findings/ODF-232.md).
## ODF-233 — A plan forbids the representation its promised behavior needs <a id="odf-233"></a>
Former local code: DD-272. [Evidence and current response](docs/maintainer/findings/ODF-233.md).
## ODF-234 — Journey acceptance omits the next state its own guidance promises <a id="odf-234"></a>
Former local code: DD-273. [Evidence and current response](docs/maintainer/findings/ODF-234.md).
## ODF-223 — A gap disposition substitutes reasoning for its actual guided path <a id="odf-223"></a>
Former local code: DD-277. [Evidence and current response](docs/maintainer/findings/ODF-223.md).
## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed <a id="odf-235"></a>
Former local code: DD-281. [Evidence and current response](docs/maintainer/findings/ODF-235.md).
## ODF-236 — Refactoring removes a deliberate caller behavior difference <a id="odf-236"></a>
Former local code: DD-286. [Evidence and current response](docs/maintainer/findings/ODF-236.md).
## ODF-237 — Unattached launch planning assumes an incompatible capture contract <a id="odf-237"></a>
Former local code: DD-289. [Evidence and current response](docs/maintainer/findings/ODF-237.md).

<a id="dd-288"></a>
## ODF-238 — A planned native proof depends on a future release <a id="odf-238"></a>
Former local code: DD-288. [Meaning, evidence and response](docs/maintainer/findings/ODF-238.md).
## ODF-248 — Refactor reruns unchanged consumer proof <a id="odf-248"></a>
Former local code: DD-292. [Evidence and current response](docs/maintainer/findings/ODF-248.md).
## ODF-249 — Whole-suite proof runs before the refactor that invalidates it <a id="odf-249"></a>
Former local code: DD-293. [Evidence and current response](docs/maintainer/findings/ODF-249.md).
## ODF-250 — A plan's proof table omits an answer state its story scopes in <a id="odf-250"></a>
Former local code: DD-294. [Evidence and current response](docs/maintainer/findings/ODF-250.md).
## ODF-251 — An open Story Branch execution has no guided path to queue a correction it discovers <a id="odf-251"></a>
Former local code: DD-298. [Evidence and current response](docs/maintainer/findings/ODF-251.md).
## ODF-252 — A story recorded ready still needs developer choices and fixtures before its first slice <a id="odf-252"></a>
Former local code: DD-299. [Evidence and current response](docs/maintainer/findings/ODF-252.md).
## ODF-253 — The start command's guidance names the trunk branch but not its flag <a id="odf-253"></a>
Former local code: DD-300. [Evidence and current response](docs/maintainer/findings/ODF-253.md).
## ODF-254 — Accepted proof let a test setup step perform an action the story requires of the product <a id="odf-254"></a>
Former local code: DD-301. [Evidence and current response](docs/maintainer/findings/ODF-254.md).
## ODF-255 — A slice's refactor widens a seam that a later slice of the same plan removes <a id="odf-255"></a>
Former local code: DD-304. [Evidence and current response](docs/maintainer/findings/ODF-255.md).
## ODF-256 — Managed delivery accepts a `--repo` that does not match the workspace's remote <a id="odf-256"></a>
Former local code: DD-305. [Evidence and current response](docs/maintainer/findings/ODF-256.md).
## ODF-169 — Stale replay base includes sibling commits <a id="odf-169"></a>
Former local code: DD-306. [Evidence and current response](docs/maintainer/findings/ODF-169.md).
## ODF-139 — Reported defect dismissed without checking the story <a id="odf-139"></a>
Former local code: DD-308. [Meaning, evidence and response](docs/maintainer/findings/ODF-139.md).
## ODF-257 — Test runs leave detached product children after timed-out teardowns, and the developer found them first <a id="odf-257"></a>
Former local code: DD-310. [Evidence and current response](docs/maintainer/findings/ODF-257.md).
## ODF-258 — A re-plan decision flagged by the first slice reached the developer only with the last <a id="odf-258"></a>
Former local code: DD-311. [Evidence and current response](docs/maintainer/findings/ODF-258.md).
## ODF-259 — The CI observer's budget expires inside a long execution <a id="odf-259"></a>
Former local code: DD-313. [Evidence and current response](docs/maintainer/findings/ODF-259.md).
## ODF-260 — A nine-slice story ran about twenty hours without a split <a id="odf-260"></a>
Former local code: DD-314. [Evidence and current response](docs/maintainer/findings/ODF-260.md).
## ODF-261 — Focused test filter matches the execution checkout path <a id="odf-261"></a>
Former local code: DD-315. [Evidence and current response](docs/maintainer/findings/ODF-261.md).
## ODF-262 — Permission-only probes split a human click journey <a id="odf-262"></a>
Former local code: DD-316. [Evidence and current response](docs/maintainer/findings/ODF-262.md).
## ODF-263 — Phase artifact capture overwrites newer recovery evidence <a id="odf-263"></a>
Former local code: DD-317. [Evidence and current response](docs/maintainer/findings/ODF-263.md).
## ODF-303 — Native JSON hid an existing source-only reviewer <a id="odf-303"></a>
Former local code: DD-318. [Meaning, evidence and response](docs/maintainer/findings/ODF-303.md).
## ODF-304 — Coordinator behavior edits after the refactor pass skipped independent review <a id="odf-304"></a>
Former local code: DD-321. [Meaning, evidence and response](docs/maintainer/findings/ODF-304.md).
## ODF-305 — A new cross-host action's focused proof missed the spec pinning the other hosts' entries <a id="odf-305"></a>
Former local code: DD-322. [Meaning, evidence and response](docs/maintainer/findings/ODF-305.md).
## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>
[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

### Occurrences
- Execution: SEED-010#notice-named-sibling-landings-before-delivery (plan 523, first implementation `2567a7c5f944380a22c6f707dddcf957457bd972`)
  - Timestamp: unknown (execution startup on 2026-11-08)
  - Tool: Codex
  - Open Dough release: 0.3.91 (checkout-bound installed guidance)
  - Evidence: Dashboard launch `003878bc-4c9f-4dde-8085-d287fbd399c1` combined full delegation, execution decisions and related references in one startup read. The tool reported 11,478 original output tokens and truncated the human-judgment passage.
  - Observed effect: The coordinator retrieved that passage separately. The existing boundary and targeted-retrieval guidance already called for scoped reads. No elapsed-time or aggregate-token cost was measured.

## ODF-306 — A delegated native probe ended a pending consent prompt and recorded a refusal <a id="odf-306"></a>
Former local code: DD-323. [Meaning, evidence and response](docs/maintainer/findings/ODF-306.md).
## ODF-307 — Coordinator screen probes competed with the developer's live desktop <a id="odf-307"></a>
Former local code: DD-324. [Meaning, evidence and response](docs/maintainer/findings/ODF-307.md).
## ODF-314 — An implementation return omits delegated proof rows and needs a second round <a id="odf-314"></a>
Former local code: DD-257. [Meaning, evidence and response](docs/maintainer/findings/ODF-314.md).
## ODF-322 — A projected delivery result drops the running command's handle <a id="odf-322"></a>
Former local code: DD-325. The coordinator reduced a guarded delivery call to its output text, dropping the live command's session handle; the terminal receipt was recovered through checkout inspection and an exact-candidate resume. [Evidence and current response](docs/maintainer/findings/ODF-322.md).
## ODF-324 — Native checks keep asking the developer after attribution is established <a id="odf-324"></a>
Former local code: DD-327. Former branch-local code: DD-325 for SEED-144#branded-alert-click-automation only. Native acceptance kept requesting interactive developer rounds after attribution was established, including a full replay for a message-only change, until the developer withdrew. [Evidence and current response](docs/maintainer/findings/ODF-324.md).
## ODF-323 — A caller-written plan-status mutation survives a later delivery refusal <a id="odf-323"></a>
Former local code: DD-328. Former branch-local code: DD-326 for SEED-144#branded-alert-click-automation only. A guarded delivery's caller-written status update stayed applied after a later preparation refusal; its unbounded retry advanced the next slice. Related DD-326 (a failed updater contained before publication) is retained there as counterevidence. [Evidence and current response](docs/maintainer/findings/ODF-323.md).
## ODF-325 — Coordinator launched an empty agent while waiting on delegated work
Former local code: DD-329. Former local code: DD-408. [Meaning, evidence and response](docs/maintainer/findings/ODF-325.md).

### Occurrences
- Execution: SEED-272#prove-recently-done-check-supersession (plan 529-prove-recently-done-check-supersession; first related implementation `705a53c88396264c09c953e54c12ff325b855603`)
  - Timestamp: unknown (2026-11-08, while the source-only reviewer ran before slice 1)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: while awaiting the source-only reviewer the coordinator ran a background `echo waiting` and then launched a Haiku agent asked only to reply "ok"; delegation's "Await delegated results without empty calls" already forbids both.
  - Observed effect: two extra notifications and one extra agent hand-back (about 38.7k subagent tokens) with no evidence gained; the real review arrived independently.
  - Inference: the background-session harness's "say what you're doing" prompts invite an action, and ending the turn while a subagent runs feels like stopping.
## ODF-326 — A second source-only review repeated unchanged inputs
Former local code: DD-331. [Meaning, evidence and response](docs/maintainer/findings/ODF-326.md).
## ODF-327 — Preparation left an evaluation's criteria for execution while the evaluated run was imminent
Former local code: DD-332. [Meaning, evidence and response](docs/maintainer/findings/ODF-327.md).
## ODF-328 — A fresh delivery refused the obligation its own plan update would close
Former local code: DD-333. [Meaning, evidence and response](docs/maintainer/findings/ODF-328.md).
## ODF-329 — Implementation returns failed the delivery formatter's lint
Former local code: DD-334. [Meaning, evidence and response](docs/maintainer/findings/ODF-329.md).

### Occurrences
- Execution: SEED-261#map-published-work-test-data (plan 508-map-published-work-test-data; first related implementation commit `8ea16d198c25169e76fc747377693540c7164b03`)
  - Timestamp: unknown (slice 2, 6, and 7 delivery on 2026-11-08)
  - Tool: Codex
  - Open Dough release: 0.3.90 (installed .agents/skills/dough-update/VERSION at the established Take)
  - Evidence: Guarded delivery on the paths published as `86eb0b883`, `c504c9a15`, and `d577da657` first returned `operation: formatting`. ESLint named unsafe href/writer return values, an unused array callback parameter, and an unsafe `Object.fromEntries` return from non-tuple inference.
  - Observed effect: Three initial formatter gates withheld commit and publication after focused proof and independent refactor. Type annotations or a mechanical callback change cleared them. The affected type-check or Land test passed.
  - Inference: A passing TypeScript build does not cover the ESLint diagnostics observed here. The late placement of the gate was the required handoff.
- Execution: SEED-262#migrate-clean-trunk-fixtures (plan 514-migrate-clean-trunk-fixtures; first related implementation commit `1f6adb33a20fe8eb45f382b7cde3c5141ab41dd2`)
  - Timestamp: unknown (2026-11-08, slice 5 delivery before `91966e3aa` at 2026-11-08T18:42:34+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Guarded fresh delivery of slice 5 returned `operation: formatting` with ESLint `no-unused-vars` on an unused `_` array callback parameter in `src/skills/dough-execute-plan/scripts/default-checkout-test-fixtures.mjs`, after focused proof and a refactor pass that reported no lint run.
  - Observed effect: One withheld delivery; a mechanical `[...Array(count).keys()]` rewrite and a focused rerun cleared it.
  - Inference: Same diagnostic class as the earlier occurrence; the slice 4 implementer, who ran ESLint itself, returned clean.
- Execution: SEED-262#migrate-dashboard-origin-fixtures (plan 512-migrate-dashboard-origin-fixtures; first related implementation commit `0bcf76c3746a941a01ffc0198f5ad120d3446fdb`)
  - Timestamp: unknown (slice 2 delivery on 2026-11-08, before `21bf70ea2`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed .claude/skills/dough-update/VERSION at the established Take `db42e79a7`)
  - Evidence: Slice 2's first guarded fresh delivery returned `operation: formatting` with five `no-unsafe-assignment`/`no-unsafe-call` errors where dashboard callers used the new JSDoc builders `reviewedStorySeed` and `queuedSeedWithDependencies` in `tests/support/queued-repository.mjs`, which lacked `@returns`. The implementation agent's proof included `npm run typecheck:dashboard`; neither it nor the refactor pass ran ESLint.
  - Observed effect: One withheld commit after focused proof and refactor; the coordinator added two `@returns {string}` lines and the retry published `21bf70ea2`. The slice 3 refactor brief asked for an ESLint check of changed files, and its delivery passed first time.

- Execution: SEED-262#migrate-backlog-scratch-repositories (plan 524-migrate-backlog-scratch-repositories; first related implementation commit `6c379369119c4bf540976b951a6d1a9aee88e9d7`)
  - Timestamp: unknown (2026-11-08, slice 3 and slice 5 delivery, before `898ef65d6` at 2026-11-08T21:26:21+08:00 and `c7780d49e` at 2026-11-08T22:07:18+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Guarded fresh delivery returned `operation: formatting` with ESLint `no-unused-vars` on an unused `_` in an `Array.from({ length }, (_, index) => ...)` callback, in `tests/support/product-backlog-identity-evidence-fixture.mjs` (slice 3) and `tests/support/dashboard-later-trunk-fixture.mjs` (slice 5), after focused proof and refactor passes that ran only a read-only Prettier check.
  - Observed effect: Two withheld deliveries; the same `[...Array(n).keys()].map(...)` rewrite and a focused rerun cleared each.
  - Inference: Third execution with this exact diagnostic in one day; implementation briefs that forbid hook-owned lint leave this class to the delivery gate.
- Execution: SEED-261#map-launch-and-session-test-data (plan 534-map-launch-and-session-test-data; first related implementation commit `681a9d6f8a9d16fd03cc5879984bb255abba4bdc`)
  - Timestamp: unknown (slice 1 delivery on 2026-11-08, before `681a9d6f8` at 2026-11-08T23:34:13+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim `e75b693ab`)
  - Evidence: Slice 1's first guarded fresh delivery returned `operation: formatting`: the formatter's ESLint fix removed an unnecessary `as KeptLaunch` assertion in `dashboard/tests/terminals/agent-terminal-avatar.spec.ts`, then `no-unused-vars` failed on the now-unused `type KeptLaunch` import. Implementation and refactor briefs forbade hook-owned lint; both ran typecheck and Prettier only. In slice 4 the refactor pass found Prettier and `no-unnecessary-type-parameters` failures the implementer returned, because that brief allowed `npx eslint` on touched files.
  - Observed effect: One withheld delivery; removing the import cleared it and the retry published `681a9d6f8`. Slices 2–4, whose refactor briefs allowed ESLint on touched files, delivered first time.
  - Inference: Same class as the earlier rows; letting the refactor pass run ESLint read-only on touched files moved the catch before delivery.
## ODF-330 — Hand-built preparation input dropped the plan from ownedPaths
Former local code: DD-335. [Meaning, evidence and response](docs/maintainer/findings/ODF-330.md).

<a id="dd-337--preparation-recorded-measured-allocations-without-their-full-sort-key"></a>
## ODF-355 — Preparation recorded measured allocations without their full sort key
Former local code: DD-337. [Meaning, evidence and response](docs/maintainer/findings/ODF-355.md).

<a id="dd-338--a-direct-formatter-command-in-fresh-delivery-lacked-the-packages-binaries"></a>
## ODF-356 — A direct formatter command in fresh delivery lacked the package's binaries
Former local code: DD-338. [Meaning, evidence and response](docs/maintainer/findings/ODF-356.md).

<a id="dd-340--preparation-observations-recorded-results-their-own-commands-contradict"></a>
## ODF-357 — Preparation observations recorded results their own commands contradict
Former local code: DD-340. [Meaning, evidence and response](docs/maintainer/findings/ODF-357.md).

<a id="dd-341--coordinator-wrote-subagent-completion-notices-in-its-own-turn"></a>
## ODF-358 — Coordinator wrote subagent completion notices in its own turn
Former local code: DD-341. Former local code: DD-337 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision. [Meaning, evidence and response](docs/maintainer/findings/ODF-358.md).

<a id="dd-342--a-developer-run-observation-inside-a-slices-proof-cannot-be-delivered-with-that-slice"></a>
## ODF-359 — A developer-run observation inside a slice's proof cannot be delivered with that slice
Former local code: DD-342. Former local code: DD-338 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision. [Meaning, evidence and response](docs/maintainer/findings/ODF-359.md).

<a id="dd-344--a-new-installed-command-assumed-a-writable-system-temp-directory-that-host-sandboxes-refuse"></a>
## ODF-360 — A new installed command assumed a writable system temp directory that host sandboxes refuse
Former local code: DD-344. [Meaning, evidence and response](docs/maintainer/findings/ODF-360.md).

<a id="dd-348--an-implementation-agent-met-a-file-line-limit-by-joining-wrapped-lines"></a>
## ODF-361 — An implementation agent met a file line limit by joining wrapped lines
Former local code: DD-348. [Meaning, evidence and response](docs/maintainer/findings/ODF-361.md).

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>
## ODF-362 — Post-change refactor compressed PLAN.md Story obligations under the file-size gate
Former local code: DD-349. [Meaning, evidence and response](docs/maintainer/findings/ODF-362.md).
## ODF-377 — Source-only review launched without the full seed examples
Former local code: DD-364. [Meaning, evidence and response](docs/maintainer/findings/ODF-377.md).
## ODF-378 — Story-branch increment publish blocked by trunk-targeted open first-landing expectation
Former local code: DD-366. [Meaning, evidence and response](docs/maintainer/findings/ODF-378.md).
## ODF-379 — Delegated dashboard proof omitted its required sandbox wrapper
Former local code: DD-367. [Meaning, evidence and response](docs/maintainer/findings/ODF-379.md).
## ODF-380 — Bounded CI diagnostics omit earlier failed-test identities
Former local code: DD-368. Former local code: DD-373. [Meaning, evidence and response](docs/maintainer/findings/ODF-380.md).
## ODF-381 — Source-review put obligation IDs in the Slice column
Former local code: DD-369. Former local code: DD-392. [Meaning, evidence and response](docs/maintainer/findings/ODF-381.md).
## ODF-382 — First-pass helper-gone proof used address drift instead of a deleted wire helper
Former local code: DD-372. [Meaning, evidence and response](docs/maintainer/findings/ODF-382.md).
## ODF-383 — A deletion-only story amendment mid-execution forced a full source re-review and re-allocation
Former local code: DD-375. [Meaning, evidence and response](docs/maintainer/findings/ODF-383.md).
### Occurrences
- Execution: SEED-271#compact-intent-sidebar (plan 525-compact-intent-sidebar; first related implementation commit `b0a8970657fbd30272851011ab26973abb7eb835`)
  - Timestamp: unknown (2026-11-08, during slice 3 acceptance before `efce7d0ee`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.91)
  - Evidence: Terry's mid-slice amendment (trunk `9367c5b44`) removed the mode-bar story-title clause and rewrote one deferred promise. `source-freshness.mjs check` returned `amended`; the renewed reviewer used a new id scheme (83 rows `1`–`62` → 90 rows `G1`, `1.1`…, `E1`…, `A1`…). Replacement record: `.planning/slice-plans/525-compact-intent-sidebar/source-review.md` at `efce7d0ee`.
  - Observed effect: one extra reviewer run (about 47k subagent tokens) and a hand-built 90-row table re-citing slices 1–2's observations before slice 3 could be delivered; only the removed title rows (old `29`–`34`) and the rewritten exclusion (old `48`–`52` → `4.7`–`4.9`) needed new judgment.
  - Inference: as in the earlier occurrences, settling the affected rows in the retained review would have sufficed.
## ODF-384 — CI layout repair iterates successive assertions without one full-journey check
Former local code: DD-377. [Meaning, evidence and response](docs/maintainer/findings/ODF-384.md).
## ODF-142 — Abbreviated validated candidate stops delivery as candidate-mismatch
Former local code: DD-385. [Evidence and current response](docs/maintainer/findings/ODF-142.md).
## ODF-398 — Story Branch CI failure already repaired on trunk has no named path
Former local code: DD-386. [Evidence and current response](docs/maintainer/findings/ODF-398.md).
## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>
Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).
## ODF-367 — Source-only review arrived after the first slice was delegated
Former local code: DD-388. Former local code: DD-379 (`6085b6eed`), renumbered in merge `073e95d2d`. [Evidence and current response](docs/maintainer/findings/ODF-367.md).
## ODF-399 — Post-change refactor left a production module empty before delivery
Former local code: DD-389. [Evidence and current response](docs/maintainer/findings/ODF-399.md).
## ODF-337 — Fresh delivery ownedPaths cannot stage a deleted rename source
Former local code: DD-391. [Evidence and current response](docs/maintainer/findings/ODF-337.md).
### Occurrences
- Execution: SEED-271#compact-intent-sidebar (plan 525-compact-intent-sidebar; first related implementation commit `b0a8970657fbd30272851011ab26973abb7eb835`)
  - Timestamp: unknown (2026-11-08, slice 3 delivery before `efce7d0ee`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.91)
  - Evidence: the implementer's `git mv dashboard/src/StoryReviewBrowserToggle.tsx dashboard/src/FileBrowserToggle.tsx` left the old path staged as deleted; `fresh` with both paths in `ownedPaths` returned `preparation-failed`, `operation: staging`, `fatal: pathspec 'dashboard/src/StoryReviewBrowserToggle.tsx' did not match any files`. Moving the old path to `stagedPaths` committed `efce7d0ee`.
  - Observed effect: one refused delivery attempt and a hand-edited preparation file; formatting reran on retry. Confirms the DD-391 mechanism (a path already absent from the working tree fails the literal add).
## ODF-400 — Foreign unpublished commits on an execution tip block story-branch publish
Former local code: DD-398. [Evidence and current response](docs/maintainer/findings/ODF-400.md).
## ODF-401 — Multi-done planning-only slices force temporary Status mutation for ordered delivery
Former local code: DD-399. [Evidence and current response](docs/maintainer/findings/ODF-401.md).
## ODF-402 — Stopping a CI observer mailbox can crash with an unhandled ENOENT
Former local code: DD-402. Former local code: DD-395 (`6c354905e`), renumbered in merge `966aad8b1`. [Evidence and current response](docs/maintainer/findings/ODF-402.md).
## ODF-403 — Absorbed mid-flight plan amendment plus execution evidence reports freshness conflict
Former local code: DD-403. [Evidence and current response](docs/maintainer/findings/ODF-403.md).
## ODF-396 — Planning basenames overwhelm a test-local consumer trace
Former local code: DD-404. [Evidence and current response](docs/maintainer/findings/ODF-396.md).

### Occurrences
- Execution: SEED-261#map-published-work-test-data (plan 508-map-published-work-test-data; first related implementation commit `8ea16d198c25169e76fc747377693540c7164b03`)
  - Timestamp: unknown (slice 1 acceptance before `8ea16d198` on 2026-11-08)
  - Tool: Codex
  - Open Dough release: 0.3.90 (installed .agents/skills/dough-update/VERSION at the established Take)
  - Evidence: Slice 1's consumer trace (plan 508, slice 1 proof) included derived `PLAN.md` and `source-review.md` basenames with test changes. The coordinator's full read reported 920 lines and 54,151 original tokens and truncated. Sampled tail entries were unrelated planning and maintainer records.
  - Observed effect: The coordinator had to inspect bounded ranges and the actual fixture importers separately. This evidence establishes excess trace output, with no missed consumer attributed to that output.
- Execution: SEED-262#migrate-dashboard-origin-fixtures (plan 512-migrate-dashboard-origin-fixtures; first related implementation commit `0bcf76c3746a941a01ffc0198f5ad120d3446fdb`)
  - Timestamp: unknown (slices 1 and 2 on 2026-11-08)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed .claude/skills/dough-update/VERSION at the established Take `db42e79a7`)
  - Evidence: The slice 1 implementation agent reported that `consumer-trace.mjs --base db42e79a7 --term …` was very large and noisy because every changed path's basename (PLAN.md, source-review.md, each spec) became a term, and reran with explicit terms only. The slice 2 agent dropped `--base 0bcf76c37` for the same reason.
  - Observed effect: Two implementation agents each discarded a `--base` trace and reran with explicit `--term` values; the delegation command form names `--base` as the way to run it.
- Execution: SEED-275#align-story-tabs-records (plan 541; first implementation `0d0ac0a1f652ff3938933ff71b72de8d49d69154`)
  - Timestamp: unknown (slice 2 before `0ab4b94e6ae91340b0d769e2afd6083c0b5ccf5d` on 2026-11-09)
  - Tool: Codex
  - Open Dough release: unknown; installed guidance from established Take `82fc915034f4262553561a1c79de876040738677`.
  - Evidence: `/tmp/seed275-slice2-consumer-trace.md` has 628 physical lines and 402 located-consumer rows matching the derived `PLAN.md` term; the slice-2 return explicitly attributes incidental matches to the concurrent coordinator-owned plan edit. The accepted plan at `0ab4b94e6` retains the trace locator and focused proof.
  - Observed effect: a seven-file comment/title correction required repeated exclusions for unrelated planning, history and guidance; no missing consumer was found. Exact retired titles had no external selectors.

## ODF-404 — Concurrent Taken sibling rewrote the active story mid-execution
Former local code: DD-405. [Evidence and current response](docs/maintainer/findings/ODF-404.md).
## ODF-405 — Full local suite wall includes waiting for repository-wide admission
Former local code: DD-406. [Evidence and current response](docs/maintainer/findings/ODF-405.md).

**Responsibility (2026-11-03):** the shared facet stays here: measurement
guidance names no repository admission or queue among wall-time distortions.
This repository's gate and its missing note are the local facet, repaired at
`ad8b1f3af` and kept once in [ProjectFindings.md](ProjectFindings.md#dd-406).
## ODF-406 — A plan's local gate names the hook-owned lint that delivery forbids running
Former local code: DD-407. [Evidence and current response](docs/maintainer/findings/ODF-406.md).
## ODF-407 — An implementation return claimed a bound its own constants contradict
Former local code: DD-409. [Evidence and current response](docs/maintainer/findings/ODF-407.md).
## ODF-408 — An agent-operable evaluation slice was handed to the developer
Former local code: DD-410. [Evidence and current response](docs/maintainer/findings/ODF-408.md).
## ODF-409 — CI diagnostic reports an empty complete inventory for a cancelled job whose suite step failed
Former local code: DD-411. [Evidence and current response](docs/maintainer/findings/ODF-409.md).

**Responsibility (2026-11-03):** the inventory that omits a cancelled job with
a failed step is shared (`ci-failures.mjs`) and stays here. The shard's
deadline breach under slow runner setup is this repository's CI exposure,
kept once as a DD-279 occurrence in
[project test findings](docs/maintainer/project-test-findings.md#dd-279).

DD-412 moved to [the project test findings](docs/maintainer/project-test-findings.md#dd-412).

DD-420, DD-421, DD-428, DD-429 and DD-430 moved to [the project test findings](docs/maintainer/project-test-findings.md#dd-420).

DD-432 (a container run took a live host run's local-suite admission) is recorded in [the project test findings](docs/maintainer/project-test-findings.md#dd-432).

DD-433 (an artifact upload stall cancelled two passing dashboard shards at the job cap) is recorded in [the project test findings](docs/maintainer/project-test-findings.md#dd-433).
## ODF-410 — An implementation agent handed back while its own background work kept running
Former local code: DD-413. [Evidence and current response](docs/maintainer/findings/ODF-410.md).
## ODF-420 — Acceptance observed a class commitment at text listing only its examples
Former local code: DD-415. [Evidence and current response](docs/maintainer/findings/ODF-420.md).
## ODF-421 — A real observation passed only because the producer happened to supply the promised order
Former local code: DD-416. [Evidence and current response](docs/maintainer/findings/ODF-421.md).
## ODF-422 — A subordinate project's publication went unobserved by the owning execution
Former local code: DD-417. [Evidence and current response](docs/maintainer/findings/ODF-422.md).
## ODF-423 — A push the remote refused for permission returned `needs-validation` without its reason
Former local code: DD-418. [Evidence and current response](docs/maintainer/findings/ODF-423.md).

### Occurrences

- Execution: SEED-262#build-explicit-git-fixtures, plan 510, first implementation `6f5d94fe4`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.91
  - Evidence: 2026-11-08 slice 4 delivery of `5e5f11bf`. The receipt reported `needs-validation` with unchanged candidate `5e5f11bf`, remote tip and suffix base `0318e27a`, and one reconciliation. It omitted the remote rejection reason.
  - Observed effect: Focused checks and typecheck took 26.19 s before the unchanged candidate published successfully.
  - Inference: The same rejection handling requested renewed proof even though the candidate and base stayed identical. The remote cause is unknown for this occurrence.

## ODF-424 — Exclusion story-clause recording still needs hand-matched exact substrings
Former local code: DD-422. [Evidence and current response](docs/maintainer/findings/ODF-424.md).
## ODF-425 — A refactor renamed a helper while its verification was running
Former local code: DD-423. [Evidence and current response](docs/maintainer/findings/ODF-425.md).
## ODF-426 — Required fresh refactor blocked by host agent authentication failure
Former local code: DD-424. [Evidence and current response](docs/maintainer/findings/ODF-426.md).
## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script
Former local code: DD-425. [Evidence and current response](docs/maintainer/findings/ODF-427.md).
## ODF-428 — A refactor moved tests after acceptance had cited them, leaving source-review observations stale
Former local code: DD-431. [Evidence and current response](docs/maintainer/findings/ODF-428.md).

### Occurrences
- Execution: SEED-262#reuse-immutable-git-histories (plan 535-reuse-story-columns-git-history; first related implementation commit `08d208fd080d143e60dfe0d011609e3a0060d2ca`)
  - Timestamp: unknown (2026-11-08, about 15:55Z, after the refactor return and before the full-suite run stamped `2026-11-08T16-01-12.478Z`)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: acceptance recorded all 63 source-review observations with `story-obligations.mjs record`, 50 of them citing the four new cases in `tests/support/repository-fixture.test.mjs`; the refactor pass then moved those cases to `repository-snapshot.test.mjs` and `repository-snapshot-isolation.test.mjs` and split the cited materializer into `repository-template.mjs` and `repository-snapshot.mjs`. The refactor return listed the moves; the coordinator rewrote the rows by text substitution before delivery and `check --slice 1` passed.
  - Observed effect: one retargeting round over 50 rows; nothing stale published.
  - Inference: fourth execution with the same shape; recording observations by file path before the refactor pass remains the structural cause.
## ODF-429 — An overlapping sibling story landed on trunk mid-execution and surfaced only at the final done-mark
Former local code: DD-434. [Evidence and current response](docs/maintainer/findings/ODF-429.md).

### Occurrences
- Execution: SEED-261#map-host-continuation-test-data (plan 539-map-host-continuation-test-data; first related implementation commit `2aabbce26bc9ccc42e3726c0c2d955b31f79c404`)
  - Timestamp: unknown (2026-11-08, slice 4 delivery, after the full suites ended at 19:23 UTC)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `654edf0b0`, which contains response `2567a7c5f`)
  - Evidence: The named-sibling check at slice 4 found SEED-261#map-launch-and-session-test-data (`ce96949d8`) and #map-launch-observation-test-data (`94a5456b9`) on fetched trunk `aa559f948`; a trial merge conflicted in 7 files. Slices 1-3 had seen no sibling landing. Reconciled in merge `b630f4a47` before the done mark, with proof rerun; delivered in `ab4e87dfe`.
  - Observed effect: The check held the done mark, commit and push as intended. Concurrent work had already built a second session constructor (`tests/support/launchSessionTestData.mjs`) beside this story's `hostSessionTestData.mjs`, so the merge consolidated them. One coordinator reapplication error (a duplicate import) was caught by the merged-tree typecheck.
  - Inference: The check worked on this release. Reconciliation still cost a merge agent (about 10 minutes) plus reruns. Three overlapping sibling stories that change the same MakeMe files and are prepared to run concurrently are likely to duplicate shared builders again.
- Execution: SEED-261#map-launch-completion-and-landing-test-data (plan 538-map-launch-completion-and-landing-test-data; first related implementation commit `d8961926c19dee65667673596e9f46f61d31869a`)
  - Timestamp: 2026-11-09T03:31:46+08:00 (slice 4 published as `9addc7c44`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: The named siblings SEED-261#map-launch-observation-test-data and #map-launch-and-session-test-data landed at `20ba2317c` (02:12) and `aa559f948` (02:26), after slice 3 and before slice 4 delivery. Source freshness returned `unchanged` (story and plan text). The coordinator ran the fetched-trunk sibling diff in the same shell command as guarded delivery, so slice 4 was marked done and published before the 363-file overlap was seen. A trial merge showed 11 conflicted files, including the shared builders `launchTestData.mjs`, `launchOutcomeTestData.mjs` and `makeMe.mjs`. Reconciled in merge `060cf2020` with a refactor pass and a second full gate (2257 passed).
  - Observed effect: The named-sibling check recognized the landings only after the done mark and publication it should have held. Reconciliation and reproof happened before completion and landing, and other work was not interrupted. The second full gate would have been needed after the merge anyway.
  - Inference: The check exists in the delivery guidance, but nothing stops the coordinator from running it alongside delivery. A structured stop from the freshness or delivery script when a named sibling's done record appears on the fetched trunk would make the hold apply without coordinator ordering.
## ODF-430 — Story integration moved another active agent profile into done
Former local code: DD-436. [Evidence and current response](docs/maintainer/findings/ODF-430.md).

<a id="dd-437"></a><a id="dd-437--near-zero-execute-plan-boundary-row-headroom-forced-structural-packing-on-an-ordinary-guidance-story"></a>
## ODF-446 — Near-zero Execute Plan boundary-row headroom forced structural packing on an ordinary guidance story
Former local code: DD-437. [Evidence and current response](docs/maintainer/findings/ODF-446.md).

<a id="dd-438"></a><a id="dd-438--source-review-commitment-ids-used-en-dash-ranges-the-recorder-refuses"></a>
## ODF-447 — Source-review commitment Ids used en-dash ranges the recorder refuses
Former local code: DD-438. [Evidence and current response](docs/maintainer/findings/ODF-447.md).

<a id="dd-439"></a><a id="dd-439--prepared-plans-empty-story-obligations-prose-failed-the-execution-obligations-reader"></a>
## ODF-292 — Prepared plan's empty Story obligations prose failed the execution obligations reader
Former local code: DD-439. [Evidence and current response](docs/maintainer/findings/ODF-292.md).

<a id="dd-440"></a><a id="dd-440--story-branch-coordinator-started-a-trunk-observer-that-managed-delivery-then-replaced"></a>
## ODF-448 — Story Branch coordinator started a trunk observer that managed delivery then replaced
Former local code: DD-440. [Evidence and current response](docs/maintainer/findings/ODF-448.md).

<a id="dd-441"></a><a id="dd-441--acceptance-credited-a-surface-commitment-through-a-shared-endpoint-the-surface-never-showed"></a>
## ODF-449 — Acceptance credited a surface commitment through a shared endpoint the surface never showed
Former local code: DD-441. [Evidence and current response](docs/maintainer/findings/ODF-449.md).

<a id="dd-442--a-shallow-historical-checkout-still-inherited-the-host-git-object-store"></a> DD-442 — A shallow historical checkout still inherited the host Git object store. [Project evidence](docs/maintainer/project-maintenance-findings.md#dd-442).

<a id="dd-443"></a><a id="dd-443--a-shared-tracking-ref-update-interrupted-confirmation-after-a-successful-push"></a>
## ODF-450 — A shared tracking-ref update interrupted confirmation after a successful push
Former local code: DD-443. [Evidence and current response](docs/maintainer/findings/ODF-450.md).

<a id="dd-444"></a><a id="dd-444--a-siblings-done-catalog-conflict-resolution-moved-an-active-executions-agent-profile-into-the-done-records"></a>
## ODF-451 — A sibling's done-catalog conflict resolution moved an active execution's agent profile into the done records
Former local code: DD-444. [Evidence and current response](docs/maintainer/findings/ODF-451.md).

<a id="dd-445--timeout-headroom-judged-from-one-hosted-run-missed-run-to-run-variance"></a> DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance. [Project evidence](docs/maintainer/project-test-findings.md#dd-445).

<a id="dd-446"></a><a id="dd-446--report-clock-changes-replayed-already-proved-scratch-journeys"></a>
## ODF-452 — Report-clock changes replayed already-proved scratch journeys
Former local code: DD-446. [Evidence and current response](docs/maintainer/findings/ODF-452.md).

<a id="dd-447"></a><a id="dd-447--a-refactor-pass-replaced-a-plan-named-repeated-proof-with-one-run"></a>
## ODF-453 — A refactor pass replaced a plan-named repeated proof with one run
Former local code: DD-447. [Evidence and current response](docs/maintainer/findings/ODF-453.md).

<a id="dd-448"></a><a id="dd-448--the-coordinator-delegated-a-lookup-the-implementation-brief-already-required"></a>
## ODF-454 — The coordinator delegated a lookup the implementation brief already required
Former local code: DD-448. [Evidence and current response](docs/maintainer/findings/ODF-454.md).

<a id="dd-449"></a><a id="dd-449--a-same-ref-cancelled-ci-run-reached-the-coordinator-as-unexplained-incomplete"></a>
## ODF-455 — A same-ref cancelled CI run reached the coordinator as unexplained incomplete
Former local code: DD-449. [Evidence and current response](docs/maintainer/findings/ODF-455.md).

<a id="dd-450"></a><a id="dd-450--a-plans-identical-step-tree-proof-did-not-account-for-a-per-run-random-value"></a> [DD-450 moved to ODF-074](docs/maintainer/findings/ODF-074.md).

<a id="dd-451"></a><a id="dd-451--the-coordinators-source-review-input-cut-the-storys-last-line"></a>
## ODF-339 — The coordinator's source-review input cut the story's last line
Former local code: DD-451. [Evidence and current response](docs/maintainer/findings/ODF-339.md).

<a id="dd-452--a-shell-check-gained-a-browser-its-ci-job-did-not-install"></a> DD-452 — A shell check gained a browser its CI job did not install. [Project evidence](docs/maintainer/project-findings-history.md#dd-452).
## ODF-456 — Ready plan used an unsupported slice status
[Evidence and current response](docs/maintainer/findings/ODF-456.md).

## DD-457 — A refactor pass's scripted spec split dropped a moved test
While moving new tests into separate spec files to stay under the 250-line
limit, the refactor agent's script cut a test out of the old file without
writing it into the new one. The agent noticed and rebuilt it from a diff it
had captured earlier; the focused rerun passed.

### Occurrences
- Execution: SEED-274#declare-intent-test-sources (plan 528-declare-intent-test-sources; first related implementation commit `cedf9c92e0eb414b0c293153b151a7baa0b55e35`)
  - Timestamp: unknown (2026-11-08, slice 2 refactor before commit `8f5ceaeece4e5a735d0f994fb50baf15e717df53`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91
  - Evidence: slice 2 refactor return; `dashboard/tests/intent/intent-ci-proof-sources.spec.ts` test "a published CI summary for a sources location shows its group and file results at their paths"
  - Observed effect: a moved test was briefly lost; it was recovered only because the agent had saved the diff, and the coordinator saw only the agent's own account
  - Inference: a mechanical move of tests can silently drop coverage; a check comparing test titles before and after a move would catch it, but the evidence is a single occurrence

## DD-458 — A reported limitation left without an obligation became a retrospective correction
At slice 1 acceptance the implementation return named a consequential limitation (the resolved follow-up context is unbounded and kept on attempts and records, so it can grow the overview payload). The coordinator treated it as outside the story's promises and recorded no story obligation, although Accept proof requires every reported gap, loss or limitation to get one disposition. The retrospective's outcome review then found the same effect as its top finding, and it needed a correction plan.

### Occurrences
- Execution: SEED-273#follow-up-from-done (plan 526, first implementation commit `c91e02264`)
  - Timestamp: unknown (date 2026-11-08)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91
  - Evidence: slice 1 return "Context size: followUp.context has no upper bound…"; plan 526 Story obligations empty; correction SEED-273#lean-follow-up-listing, plan 529, finding 1.
  - Observed effect: the limitation reached a correction plan instead of being returned to slice 1 or disposed at acceptance.
  - Inference: judging a return's learning by story promises alone, rather than through the obligation record, let a product-cost limitation pass without a decision.

## ODF-434 — Coordinator sends an unsubstituted placeholder to a delegated agent
[Meaning, evidence and response](docs/maintainer/findings/ODF-434.md). This facet: the implementation brief, not the source-only reviewer.

### Occurrences
- Execution: SEED-272#select-recently-done-sessions (plan 527-select-recently-done-sessions; first related implementation `2d8fcf4d79cd013b0895d5a1ede1110af15d2d8d`)
  - Timestamp: unknown (2026-11-08, slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: the slice 1 implementation brief carried a literal `{{COMMITMENTS}}` line and a stray `$(see list below)` where the 50 slice commitments belonged; the list existed only in a job-temporary file.
  - Observed effect: the coordinator sent the full list by a follow-up message after launch; the agent's return mapped all slice 1 ids.
  - Inference: writing a brief before inlining a computed listing recurs across delegation kinds, not only source review.

## DD-459 — Obligations record doubled a supplied `observed:` prefix
`story-obligations.mjs record --observed` prepends `observed: ` to its value. The reference's table cells show the `observed: …` form, so a value written that way became `observed: observed: …` and every check still passed.

### Occurrences
- Execution: SEED-272#select-recently-done-sessions (plan 527-select-recently-done-sessions; first related implementation `2d8fcf4d79cd013b0895d5a1ede1110af15d2d8d`)
  - Timestamp: unknown (2026-11-08, slice 1 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: 50 `record --observed 'observed: …'` calls wrote doubled prefixes into `source-review.md`; `check --slice 1` reported ok before a manual `sed` repair.
  - Observed effect: one extra repair command; no proof or allocation changed.
  - Inference: the CLI could accept or refuse a leading `observed:` instead of silently doubling it.

## DD-460 — A coordinator's prose brief narrowed a key example the attached source review still carried
The implementation brief linked the full source-review commitment table, but its own one-line restatement of a key example dropped one of the example's triggers. The implementer proved the restated form, and the dropped branch came back at acceptance.

### Occurrences
- Execution: SEED-270#highlight-linked-story-card (plan 525-highlight-linked-story-card, recoverable with its seed and source review at `bbcab61e80c618951fd642a7e0805a82572d2191`; first related implementation `24eeb2e210d6816af7d052ce3917dfc5b1b9cfa6`)
  - Timestamp: 2026-11-08 (slice 1 delegation and acceptance; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91
  - Evidence: Seed example 2 reads "follows a link or opens a direct story URL to that same identity again"; source-review ids 4.1, 5, 5.1 and 12 were allocated to slice 1 and the brief named the file. The brief's proof line said "E2 follow again to an already-selected in-view card re-cues", omitting the direct-URL trigger. The first return listed "E2 by direct URL to an already-selected card is not separately proved" as a gap.
  - Observed effect: one extra delegation round (about 5 minutes) added `story-destination-repeat-cue.spec.ts`; no product change was needed.
  - Inference: a restated example in the brief carries more weight with the implementer than a linked commitment table; quoting key examples verbatim, or relying on the table alone, would likely have avoided the round. The ODF-367 response (review before first delegation) held here.

<a id="dd-461"></a>
## DD-461 — A hidden-fact break check missed a helper that writes the fact
A premise check that changes a fixture's hidden facts and reruns consumers finds tests that read those facts and fail. It cannot find a helper that writes to a hidden path, whose meaning changes silently when the path stops being tracked.

### Occurrences
- Execution: SEED-262#migrate-clean-trunk-fixtures (plan 514-migrate-clean-trunk-fixtures; first related implementation commit `1f6adb33a20fe8eb45f382b7cde3c5141ab41dd2`)
  - Timestamp: unknown (2026-11-08, reported in slice 3 before `8f7f8443f` at 2026-11-08T17:07:26+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 514 (`42717b7da:.planning/slice-plans/514-migrate-clean-trunk-fixtures/PLAN.md`)'s scratch premise changed `trunk.txt`, `increment.txt` and both identities and named 26 failing files. `plantHumanEdit` in `src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs` writes `trunk.txt` as "an unstaged change to a tracked file". Slice 1 and 2 descriptions without `trunk.txt` passed, so published `1f6adb33a` and `0b6bdb925` planted an untracked file in three test files (story obligation G1).
  - Observed effect: Coordinator acceptance of slices 1 and 2 did not notice. The slice 3 implementer added a tracked-file guard that failed loudly and declared `trunk.txt` where needed.
  - Inference: Removing a fact under a writer needs a precondition check in the writer, or a break check that also asserts the writer's precondition; passing consumers alone do not show it.

<a id="dd-462"></a>
## DD-462 — The source-only review caught a promise the plan had narrowed
Practice. The isolated source review numbers story commitments independently of the plan, so a plan decision that contradicts a key example surfaces at the slice that owns it.

### Occurrences
- Execution: SEED-262#migrate-clean-trunk-fixtures (plan 514-migrate-clean-trunk-fixtures; first related implementation commit `1f6adb33a20fe8eb45f382b7cde3c5141ab41dd2`)
  - Timestamp: unknown (2026-11-08, before slice 5 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: Plan 514 (`42717b7da:.planning/slice-plans/514-migrate-clean-trunk-fixtures/PLAN.md`) kept `createCleanTrunkFixture` taking a description. Source-review commitment 31, from Key example 6, says "no non-native test calls `createCleanTrunkFixture`". The slice 5 obligations listing carried it, and the delegation stated that the source outranks the plan.
  - Observed effect: Slice 5 deleted the helper; `git grep createCleanTrunkFixture -- ':!.planning'` finds nothing.

## DD-463 — A reverse import-closure selection silently dropped importers
`tests/support/native-import-closure.mjs` exits 1 (ENOENT) on a test file whose string literals contain import-like text. A proof selection that walks every test file through it and skips failures omits those files without notice.

### Occurrences
- Execution: SEED-262#tighten-repository-description-facts (plan 532-tighten-repository-description-facts; first related implementation commit `a271e923b623811f5f13e9a63963b1a234413210`)
  - Timestamp: unknown (2026-11-08, slice 4 implementation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: `node tests/support/native-import-closure.mjs . src/skills/dough-execute-plan/scripts/consumer-trace.test.mjs` exits 1 reading a fixture path from a string. Slice 4's reverse-closure selection missed `consumer-trace.test.mjs` and `consumer-trace-terms.test.mjs`, which import an edited fixture; a `git grep` cross-check found them. Plan 532 premise P5 ("264 files") came from the same walk.
  - Observed effect: The two missed files were added and passed; the whole `npm test` before landing covered any other omission.
  - Inference: The tool hashes native evidence closures and was used off-label for consumer selection; a selection built from it should fail on a crashed file, or be cross-checked with `git grep` on the changed module's basename.

## DD-464 — Sequential before and after timings could not judge a no-slowdown promise
A plan asked for focused times recorded before any edit and again after the
slice, under comparable load. On a machine with fluctuating external load, the
runs taken about half an hour apart differed in load and could not show
whether feedback got slower. Paired back-to-back runs of a base worktree and
the candidate could.

### Occurrences
- Execution: SEED-262#migrate-dashboard-origin-fixtures (plan 512-migrate-dashboard-origin-fixtures; first related implementation commit `0bcf76c3746a941a01ffc0198f5ad120d3446fdb`)
  - Timestamp: unknown (slice 1 on 2026-11-08; slice 3 paired runs before `f78f3e0e6`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.91 (installed .claude/skills/dough-update/VERSION at the established Take `db42e79a7`)
  - Evidence: Slice 1's before runs were at load about 10.5 and its after runs at 14.8–16.3 (startOriginTest consumers 60/68 s before, 73/81 s after); the coordinator recorded obligation G3 in plan 512. Slices 2 and 3 measured base-worktree and candidate runs back to back (51/51 s; 47/46 and 47/45 s; 22/20 and 23/20 s).
  - Observed effect: Slice 1's timing evidence could not close its promise and the comparison was repeated in slice 3 with a temporary base worktree and its setup.
  - Inference: The plan's wording "record before changing anything" invites sequential measurement; naming paired back-to-back runs from the start would likely have avoided the repeat. One execution only.
- Execution: SEED-262#migrate-git-publication-native-fixtures (plan 534-migrate-git-publication-native-fixtures; first related implementation commit `e33993231c9ce45e6ad573321fba472d4778e25f`)
  - Timestamp: 2026-11-09T00:10:00+08:00 (end of the paired runs; before run 2026-11-08T21:38+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `23d29ac79`)
  - Evidence: Plan 534's Local gates again prescribed a before run and a repeat "after the migration". Before 148.49 s at load 16.8→12.8; after 211.10 s at 19.9→19.1, with unchanged jobs slower too. Paired base and candidate scratch worktrees run alternately then gave base 138.84 s and 326.52 s, candidate 261.14 s and 259.69 s, as load swung 11→29 within the pairs. CI test-times artifacts (main `11bd921ed` run 42484078567 versus branch `cd5b0ddb0` run 42493839333) gave the comparison: 231.1 to 176.0 job seconds for the six checks.
  - Observed effect: Neither sequential nor paired local runs could attribute a difference; the slice 5 evaluation rests on CI job seconds, and the paired runs cost about 17 minutes plus two scratch installs.
  - Inference: Paired runs need a stable load window; on this machine the hosted runner's per-job test times were the steadier comparison and were already available for both revisions. Planning could name them as the timing source when the selection runs in CI.

- Execution: SEED-262#declare-fake-github-planning-data (plan 530-declare-fake-github-planning-data; first related implementation commit `673fee7a4967cf5a2ea076b282c21878841a13fa`)
  - Timestamp: unknown (2026-11-08, slices 1, 3 and 4)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `d84195b2a`)
  - Evidence: Plan 530 asked for "two runs each under comparable load" before and after; slice 3's recently done and profile family ran before at load 3.7 and 7.8 (151.8 s, 161.3 s) and after at 21.1 and 14.0 (168.9 s, 156.2 s). Slice 4 repeated both families as alternated runs of a base worktree at `24c881a5a` and the candidate (recently done B/A 0.95, refresh B/A 1.046).
  - Observed effect: Slice 3's timings could not judge the promise; the paired comparison was added to slice 4 with a temporary base worktree and its setup.
  - Inference: Same cause as the first row: the plan, written after DD-464's first occurrence, still named sequential before/after runs.

- Execution: SEED-262#migrate-shell-release-and-native-fixtures (plan 533-migrate-shell-release-and-native-fixtures; first related implementation commit `8d7623b7ddfed3e4e727af5843df54eea741e33b`)
  - Timestamp: unknown (2026-11-08, slice 2, before `75946c1b2` at 2026-11-08T22:36:58+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim `766cfa66f`)
  - Evidence: Plan 533's Local gates said "compare before and after with the same command, back to back". Slice 2's sequential runs gave `story-payload-update.sh` 7.71–7.92 s before and 8.45–9.31 s after at load 10.7–12.6. Interleaved runs against a `git archive HEAD` copy gave 8.68–10.29 s before and 8.62–9.17 s after; the builder alone was 1.17–1.23 s old and 0.88–1.18 s new (plan 533 slice 2 accepted proof, `afb028050:.planning/slice-plans/533-migrate-shell-release-and-native-fixtures/PLAN.md`).
  - Observed effect: The implementer repeated the timing interleaved before it could judge the promise; slices 1, 3 and 4 alternated old and new from the start.
  - Inference: "Back to back" was still read as sequential; naming interleaved runs against a base copy in the plan would likely avoid the repeat.
- Execution: SEED-262#reuse-immutable-git-histories (plan 535-reuse-story-columns-git-history; first related implementation commit `08d208fd080d143e60dfe0d011609e3a0060d2ca`)
  - Timestamp: unknown (2026-11-08, baseline 14:11Z–14:13Z, implementation measurements about 14:30Z–15:10Z)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: the plan's gate read "re-establish a comparable baseline in the execution checkout, then use the same ordinary selection before and after"; the coordinator ran three baseline runs at load 12.9 before delegating, the implementation agent's first after runs fell at load 12.7–15.6 and could not be compared, and it then built a detached clean worktree of the Take (copied `node_modules`) to run nine more before runs beside its after runs; the coordinator's final interleaved lazy/eager pairs on one checkout were decisive (recorded in plan 535's Measurement record).
  - Observed effect: twelve extra selection runs and a temporary base worktree before the comparison could be judged.
  - Inference: second execution in the same seed; the gate wording again invited a sequential baseline, and the paired form had to be rediscovered.

## DD-465 — An empty focused path list ran the whole local suite
`scripts/test.sh` with no path arguments runs the whole serialized local suite. A focused command built from a file list that silently came out empty therefore started a full run instead of failing.

### Occurrences
- Execution: SEED-262#migrate-backlog-scratch-repositories (plan 524-migrate-backlog-scratch-repositories; first related implementation commit `6c379369119c4bf540976b951a6d1a9aee88e9d7`)
  - Timestamp: unknown (2026-11-08, slice 4 baseline, after `898ef65d6` at 2026-11-08T21:26:21+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim)
  - Evidence: The coordinator's `grep -lE ... tests/support/*.test.mjs tests/*.test.mjs | tee s4-files.txt` aborted on zsh's unmatched `tests/*.test.mjs` glob, leaving the list empty; `bash scripts/test.sh $(cat s4-files.txt)` then ran without paths (`scripts/test.sh:24` treats no arguments as the full suite) until the 600 s tool timeout moved it to the background, where it was stopped.
  - Observed effect: About ten minutes of a full-suite run under load 13-17 were spent on a two-run baseline of six files; the baseline was redone with `git grep` and a non-empty check.
  - Inference: A focused-run guard that refuses an empty list would have stopped this at once; later briefs added "never pass an empty list" by hand.

## DD-468 — A plan's consumer inventory came from a narrower search than the story's rule
The story governed "helpers and specs that hand-write published planning
files" and named a dated sample. The plan built its slice lists from a
`# Product backlog` literal search plus a few fact-kind searches, so helpers
that assembled seeds, records and catalogs from encoder calls stayed outside
every slice until acceptance.

### Occurrences
- Execution: SEED-262#declare-fake-github-planning-data (plan 530-declare-fake-github-planning-data; first related implementation commit `673fee7a4967cf5a2ea076b282c21878841a13fa`)
  - Timestamp: unknown (2026-11-08, slices 2 and 3 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `d84195b2a`)
  - Evidence: Plan 530 premise "Consumer set" (48 files from `grep -rlE '# Product backlog|## Backlog list' dashboard/tests`). Slice 2 found 13 `dashboard/backend-tests` specs outside it; slice 3 acceptance found about 20 helpers using `renderDoneRecord`/`withDoneCatalog` outside it (obligation G1). Slice 4 was added and migrated them (`84506544d`).
  - Observed effect: One extra slice (about 45 minutes of agent time) and two plan rewrites during execution; the source review's commitment 10 surfaced the gap at acceptance.
  - Inference: Deriving the inventory from the story's governing rule (the published-file encoders and file paths a fake GitHub serves) rather than from one literal symptom would likely have sized four slices up front.

## DD-469 — A trunk merge's proof selected changed specs, not consumers of the changed contract
After merging trunk into a story branch, the coordinator proved the merge with
the specs trunk had changed. A trunk-added helper called this branch's changed
writer under an old precondition, and its unchanged spec failed in CI.

### Occurrences
- Execution: SEED-262#declare-fake-github-planning-data (plan 530-declare-fake-github-planning-data; first related implementation commit `673fee7a4967cf5a2ea076b282c21878841a13fa`)
  - Timestamp: unknown (2026-11-08, merge `7bec63357`; CI run 42487558040)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `d84195b2a`)
  - Evidence: Merge proof selected `git diff --name-only 54cc27451 origin/main -- 'dashboard/*.spec.ts'` plus sidebar specs (74 files, 165 passed). Trunk's `dashboard/tests/support/sessionsReplayProjects.ts` called `writeRevisionFiles` on a missing directory, which slice 1 had made read first; `agent-launch-sessions-listing.spec.ts` failed in CI with ENOENT. Repaired in `e828b4142`.
  - Observed effect: One failed CI run, a stash-and-repair cycle and a repair commit.
  - Inference: Selecting the importers of every trunk-changed module that calls a contract this branch changed (here `writeRevisionFiles`) would have caught it locally.

## DD-470 — A planned discrimination edit did not discriminate
A plan named the scratch edit that should make a check fail, without observing it. The edit passed both before and after the change, so the planned proof could not show the promise.

### Occurrences
- Execution: SEED-262#migrate-shell-release-and-native-fixtures (plan 533-migrate-shell-release-and-native-fixtures; first related implementation commit `8d7623b7ddfed3e4e727af5843df54eea741e33b`)
  - Timestamp: unknown (2026-11-08, slice 2, before `75946c1b2` at 2026-11-08T22:36:58+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the claim `766cfa66f`)
  - Evidence: Plan 533 (`afb028050:.planning/slice-plans/533-migrate-shell-release-and-native-fixtures/PLAN.md`) slice 2 Proof: "drop the withheld path from `update-adds-new-payload-skill.sh`'s 0.1.1. The check then fails". That edit passed on the candidate and on a `git archive HEAD` copy, because the check installs 0.1.1 by hand without reading its declaration. Dropping `--withhold` in `retrospective-reference-payload.sh` failed at its line 33, and dropping `--remove` in `update-adds-new-payload-skill.sh` failed with `Managed payload mismatch`.
  - Observed effect: The implementer found the discriminating checks itself; acceptance used them. Slice 4's unplanned "queued as taken" edit also passed, showing that the done-catalog proof does not observe list state.
  - Inference: A discrimination claim in a plan is a premise; observing it during planning, or marking it unverified, would have pointed slice 2 at the right check.

## DD-471 — A baseline trace in hand already showed the request timing that made the planned lazy build neutral
The pre-change artifact trace the coordinator recorded before delegation showed
both dashboard workers requesting the run's artifacts within 1 ms of each other.
A single-flight owner build started on the first request therefore had to
serialize both cold workers, which the plan had named as a risk with a stop
condition but left to end-to-end measurement; the slice measured it over seven
runs before an owner-start request restored the gain.

### Occurrences
- Execution: SEED-262#reuse-immutable-git-histories (plan 535-reuse-story-columns-git-history; first related implementation commit `08d208fd080d143e60dfe0d011609e3a0060d2ca`)
  - Timestamp: unknown (2026-11-08; baseline trace at 14:11Z, delegation shortly after, eager variant adopted about 15:20Z)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: `before-run1.trace.jsonl` of the coordinator's baseline recorded `request app` from both workers at 2.863 s and `request server-bundle` at 2.864/2.865 s; plan 535's Options named cold serialization as a measured risk; the implementation agent's `after` and `after2` runs (lazy) matched the baselines and its three-line eager experiment did not; the coordinator's interleaved pairs confirmed eager.
  - Observed effect: the decisive design choice (when the owner starts the build) was made after implementation and about ten measured runs, rather than before delegation from the trace already recorded.
  - Inference: qualified, one execution. When a plan's stop condition depends on a timing structure, the baseline observation taken for it can be read for that structure before the slice is delegated.

## DD-472 — Final full suites ran before the named-sibling check, so a sibling landing forced a second whole run
The plan required whole `npm run test:dashboard` and `npm test` before final
delivery. The coordinator ran them on the unmerged branch, and only then
reached delivery step 5's source-freshness and named-sibling check. That
check found landed siblings that needed a merge, so the whole runs no longer
covered the candidate.

### Occurrences
- Execution: SEED-261#map-host-continuation-test-data (plan 539-map-host-continuation-test-data; first related implementation commit `2aabbce26bc9ccc42e3726c0c2d955b31f79c404`)
  - Timestamp: unknown (2026-11-08, first whole runs 16:45-19:23 UTC; merged-tree runs 19:34-20:18 UTC)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92 (installed `.claude/skills/dough-update/VERSION` at the Take `654edf0b0`)
  - Evidence: Plan 539 "Proof and delivery gates" names the whole runs before final delivery. The coordinator started them after slice 4's refactor return. `deliver-the-change.md` step 5 runs the freshness and named-sibling check after acceptance and refactoring. Trunk `aa559f948` then carried both named siblings, and merge `b630f4a47` changed shared MakeMe support.
  - Observed effect: About 2.6 hours of whole-suite time on the pre-merge tree were superseded; the dashboard suite and `npm test` ran again on the merge (about 45 minutes).
  - Inference: Fetching trunk and running the named-sibling check immediately before starting the plan's final whole-suite gate, rather than only at the done mark, would likely have merged first and needed one whole run.
