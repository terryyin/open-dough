# DearDough Process Findings

Shared occurrence evidence and response history live in the linked
[catalog](docs/maintainer/finding-names.md). [Project findings](ProjectFindings.md)
retain local facets. The full source before this compaction is
`cf1ea1debbd50eac9cfe73a2e6a6782597764fdf:DearDough.md`. Earlier source recovery is in that revision.

## Retention

- Highest allocated local number: 460. Removed numbers are never reused.
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
## ODF-429 — An overlapping sibling story landed on trunk mid-execution and surfaced only at the final done-mark
Former local code: DD-434. [Evidence and current response](docs/maintainer/findings/ODF-429.md).
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
