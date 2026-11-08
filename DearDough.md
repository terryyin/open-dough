# DearDough Process Findings

Source maintenance on 2026-10-28 retained collected evidence before shortening at Open Dough `32b5ae0b4414d755bcde4ef6cd822774d7450771:docs/maintainer/findings/`. The complete post-local source is `432ed9ec9c9e9954dd5bff0c9a7324d1d8a991a6:DearDough.md`; linked source records share that revision. Unknown execution releases and local facets remain qualified.

Reviewed 2026-10-28 (Asia/Singapore). Four shared process sources were
reviewed after local maintenance: Open Dough, Doughnut, Pygardon and Lizard.
Terry Talks skips shared collection because process retrospective is off.
Released responses await their specific ordinary-use observations; the
[watch list](docs/maintainer/near-term-watch-list.md) preserves its contrary
evidence. Source and catalog identities do not imply resolution.

- Highest allocated local number: 447. Removed numbers are never reused.
- Shared-feedback compaction recovery (2026-11-07): `626ecc24b28c398eaa4543e19936a415c526c0e9:DearDough.md`; its rows are retained at the linked Open Dough finding owners (`483d3a1e8f0ea24b929675b9a195faca48ac8f47:docs/maintainer/findings/`).
- Shared-feedback compaction recovery (2026-11-03): `325f9de8a1f635a44b0071cf0660a2593a21f6b9:DearDough.md`; its rows are retained at the linked Open Dough finding owners. Terry approved consolidating DD-387 and DD-401 as ODF-333, DD-392 into ODF-381, DD-400 into ODF-074 and DD-408 into ODF-325; their former-code aliases remain and their distinct occurrences stay at the linked owners.
- This compaction recovery: `a47f4814edb00038ef77d45e001cae1db9255cb6:DearDough.md`; distinct new rows are retained at linked finding owners. No finding is retired by compaction.
- Duplicate-note cleanup recovery: `81f6c3916430cee083ce027cdb62c8aa5e5c2225:DearDough.md`.
- Earlier cleanup recovery: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275/DD-309/DD-390, the local facets of DD-406 and DD-411, and repaired DD-283/DD-290/DD-312/DD-420/DD-421/DD-428/DD-429/DD-430 remain linked from [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

Each linked finding owns its evidence and response history. The pre-compaction
source is `19a16c2c6bcbdd0073e1efb10b6531f23b1855fb:DearDough.md`. The former pinned evidence links used the
catalog snapshot at `a29f625255a3368eb721249c01df96e0f98edfd4:docs/maintainer/findings/`.

## ODF-087 — Skipped preparation gates <a id="odf-087"></a>

Former local code: DD-089. [Evidence and current response](docs/maintainer/findings/ODF-087.md).

## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>

Former local code: DD-057. [Meaning, evidence and response](docs/maintainer/findings/ODF-059.md).

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-074 — Unverified planning premises <a id="odf-074"></a>

Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Former local code: DD-307. Former local code: DD-400. Former local code: DD-393 (`6c354905e`), renumbered in merge `966aad8b1`. DD-400's facet: a decisive premise probe proved the capability, not the story's restriction it settled. [Meaning, evidence and response](docs/maintainer/findings/ODF-074.md).

### Occurrences
- Execution: SEED-118#retry-unavailable-ci-comparison-slots (plan 500-retry-unavailable-ci-comparison-slots; first related implementation commit `829d4170678aeeb8a6c48530669d3ebdea5b620f`)
  - Timestamp: unknown (during slice 2 implementation, after slice 1 commit at 2026-11-07T21:48:36+08:00 and before slice 2 commit at 2026-11-07T22:19:36+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: plan 500 (`8cab734f619f3c373e0416944ef4e19ff1438e0d:.planning/slice-plans/500-retry-unavailable-ci-comparison-slots/PLAN.md`) Current decisions stated "Endpoint proofs follow the re-read answer as they already follow a changed answer" with no Premises row; slice 2's implementer found proofs keyed by build subject, so an unchanged final answer never re-read them (promise 3e), and added `checkedAgain` to the proof key
  - Observed effect: the false claim surfaced inside the slice and cost no replanning; the implementer's red check (removing `checkedAgain`) failed two journeys
  - Inference: a behavioral claim placed under Current decisions escapes the premise table's observation requirement

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

Former local code: DD-239. Former local code: DD-248. [Evidence and current response](docs/maintainer/findings/ODF-217.md).

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
- Execution: SEED-260#restore-default-test-timeouts (plan 502-restore-default-test-timeouts; first related implementation commit `6e6d16cef09551a1bd589ba1ec8be6c5cc970f1c`)
  - Timestamp: 2026-11-08T00:23:57+08:00 (commit time of slice 5 revision `8aeb3c1cc`; the refactor pass found it before that commit)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 5 implementation proof ran 38 `dashboard/tests` consumers of `controlReachability.ts` but not `dashboard/frontend-tests/control-reachability-observation.spec.ts`; the refactor pass ran it and it failed at `:37` ("a control revealed by earlier scrolling is still checked")
  - Observed effect: the single-pass reachability check silently dropped controls revealed by scrolling until the refactor agent fixed it before commit
  - Inference: the consumer selection was built from one test root; the coordinator's later briefs added "include frontend-tests and backend-tests consumers"

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
- Execution: SEED-254#use-ancestor-ci-proof-for-skipped-builds (before-cleanup commit `83a71097998b8aee8d486f78eb24027ad148abf8`; first related implementation commit `94a168bef806e6c43a8e7aa3899f5cac49eea263`)
  - Timestamp: 2026-11-07T16:43:34+08:00 (slice 2 delivery before accepted `b7d1abf4f`)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (installed `.agents/skills/dough-update/VERSION`; execution used `.claude/skills`)
  - Evidence: coordinator transcript `a813feec-33b3-4f12-8c74-31a2ede64898` turn 53 "Fixing the lint failure, then retrying delivery"; terminal `636742.txt` `@typescript-eslint/return-await` on `exactSkippedEquivalentSlot` return without `await`; StrReplace added `await` in `dashboard/server/baseCiRevisionLookup.ts` before the successful retry that published `b7d1abf4f`
  - Observed effect: one refused slice-2 delivery preparation; mechanical `await` fix and second guarded delivery succeeded
  - Inference: same pattern as prior ODF-329 rows — authored lint first seen at coordinator format/delivery after a lint-forbidden implementation/refactor brief

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

## ODF-384 — CI layout repair iterates successive assertions without one full-journey check

Former local code: DD-377. [Meaning, evidence and response](docs/maintainer/findings/ODF-384.md).

## ODF-142 — Abbreviated validated candidate stops delivery as candidate-mismatch

Former local code: DD-385.

[Evidence and current response](docs/maintainer/findings/ODF-142.md).

## ODF-398 — Story Branch CI failure already repaired on trunk has no named path

Former local code: DD-386.

[Evidence and current response](docs/maintainer/findings/ODF-398.md).

### Occurrences
- Execution: SEED-254#use-later-ci-proof-for-cancelled-landings (plan 496-use-later-ci-proof-for-cancelled-landings; first related implementation commit `85946790e81e11d70d7ef1235a63d8a8d3aae1d2`)
  - Timestamp: unknown (between trunk repair `84404746f` at 2026-11-07T17:50:10+08:00 and slice 1 commit at 2026-11-07T18:13:39+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.87 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: slice 1's local proof failed `intent-ci-comparison-adapter-gaps.spec.ts:15` and `intent-ci-comparison-skipped.spec.ts:141` at the claim base; trunk `84404746f` (another writer) already repaired both, and hosted run 42360556046 failed them too; trunk had also moved 13 commits, including plan 493's changes to the same spec and Intent doc
  - Observed effect: the implementation agent correctly did not duplicate the repair; the coordinator chose a temporary WIP commit, a rebase onto `origin/main` with two conflicts and a soft reset, before acceptance and the first publication; then 47/47 comparison specs passed
  - Inference: same gap, but at local slice proof before any publication rather than at a CI notification; no reference names incorporating trunk into an unpublished story-branch slice either

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

## ODF-367 — Source-only review arrived after the first slice was delegated

Former local code: DD-388.

Former local code: DD-379 (`6085b6eed`), renumbered in merge `073e95d2d`.

[Evidence and current response](docs/maintainer/findings/ODF-367.md).

### Occurrences
- Execution: SEED-250#hide-client-project-from-dashboard (plan 476-hide-client-project-from-dashboard; first related implementation commit `bbdb50295eccda910464a31d47c7ffcc9aadc390`)
  - Timestamp: unknown (2026-11-07, after established start and before slice 1 delivery `bbdb50295`)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (installed `.agents/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: coordinator delegated slice 1 (`85bcdbe9-6b19-4722-a806-4c3a22200093`) after reading the "Before first implementation delegation" boundary, then read "Before accepting a return" (`wrap-up.md#accept-proof`) and launched the source-only reviewer (`fc0018b5-f90a-42c9-8c9b-63d1c2ae89af`) before accepting slice 1 and delegating slice 2
  - Observed effect: no rework of slice 1; all 62 slice 1 commitments matched the delivered implementation and proof, and the 5 slice 2 commitments were passed into slice 2 delegation
  - Inference: same boundary-table ordering as prior ODF-367 rows — `dough-execute-plan/SKILL.md` lists `wrap-up.md#accept-proof` under "Before accepting a return" rather than before first slice delegation
- Execution: SEED-254#use-ancestor-ci-proof-for-skipped-builds (before-cleanup commit `83a71097998b8aee8d486f78eb24027ad148abf8`; first related implementation commit `94a168bef806e6c43a8e7aa3899f5cac49eea263`)
  - Timestamp: 2026-11-07T16:26:11+08:00 (between first slice-1 delegation and slice-1 delivery `94a168bef`)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (installed `.agents/skills/dough-update/VERSION`; execution used `.claude/skills`, which lacks `obtain-source-review.md`)
  - Evidence: coordinator transcript `a813feec-33b3-4f12-8c74-31a2ede64898`: delegated slice 1 (`Task` "Implement slice 1 status") after reading installed "Before first implementation delegation" (no source-review link), then at acceptance launched source-only reviewer and wrote `source-review.md`; installed `.claude/skills/dough-execute-plan/SKILL.md` still omits `obtain-source-review.md#before-planned-delegation` while unreleased `src/skills/...` already includes it (ODF-367 response; first containing release none yet)
  - Observed effect: one acceptance rework round for Summary `SlotSha` requested-status (commitment 3) before slice 1 published; later slices received allocated commitments in their briefs
  - Inference: recurrence under the still-installed 0.3.87 boundary table; the unreleased source guidance that would have obtained the review before delegation was not what this execution read

## ODF-399 — Post-change refactor left a production module empty before delivery

Former local code: DD-389.

[Evidence and current response](docs/maintainer/findings/ODF-399.md).

## ODF-337 — Fresh delivery ownedPaths cannot stage a deleted rename source

Former local code: DD-391.

[Evidence and current response](docs/maintainer/findings/ODF-337.md).

## ODF-400 — Foreign unpublished commits on an execution tip block story-branch publish

Former local code: DD-398.

[Evidence and current response](docs/maintainer/findings/ODF-400.md).

## ODF-401 — Multi-done planning-only slices force temporary Status mutation for ordered delivery

Former local code: DD-399.

[Evidence and current response](docs/maintainer/findings/ODF-401.md).

## ODF-402 — Stopping a CI observer mailbox can crash with an unhandled ENOENT

Former local code: DD-402.

Former local code: DD-395 (`6c354905e`), renumbered in merge `966aad8b1`.

[Evidence and current response](docs/maintainer/findings/ODF-402.md).

## ODF-403 — Absorbed mid-flight plan amendment plus execution evidence reports freshness conflict

Former local code: DD-403.

[Evidence and current response](docs/maintainer/findings/ODF-403.md).

## ODF-396 — Planning basenames overwhelm a test-local consumer trace

Former local code: DD-404.

[Evidence and current response](docs/maintainer/findings/ODF-396.md).

## ODF-404 — Concurrent Taken sibling rewrote the active story mid-execution

Former local code: DD-405.

[Evidence and current response](docs/maintainer/findings/ODF-404.md).

## ODF-405 — Full local suite wall includes waiting for repository-wide admission

Former local code: DD-406.

[Evidence and current response](docs/maintainer/findings/ODF-405.md).

**Responsibility (2026-11-03):** the shared facet stays here: measurement
guidance names no repository admission or queue among wall-time distortions.
This repository's gate and its missing note are the local facet, repaired at
`ad8b1f3af` and kept once in [ProjectFindings.md](ProjectFindings.md#dd-406).

## ODF-406 — A plan's local gate names the hook-owned lint that delivery forbids running

Former local code: DD-407.

[Evidence and current response](docs/maintainer/findings/ODF-406.md).

## ODF-407 — An implementation return claimed a bound its own constants contradict

Former local code: DD-409.

[Evidence and current response](docs/maintainer/findings/ODF-407.md).

## ODF-408 — An agent-operable evaluation slice was handed to the developer

Former local code: DD-410.

[Evidence and current response](docs/maintainer/findings/ODF-408.md).

## ODF-409 — CI diagnostic reports an empty complete inventory for a cancelled job whose suite step failed

Former local code: DD-411.

[Evidence and current response](docs/maintainer/findings/ODF-409.md).

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

Former local code: DD-413.

[Evidence and current response](docs/maintainer/findings/ODF-410.md).

## DD-414 — Asking for proof of an untested mechanism found a defect in it
A return listed a mechanism the slice's restriction depended on as untested; the coordinator asked for focused proof before acceptance, and writing that proof exposed a defect that also affected the already passing case.

### Occurrences
- Execution: SEED-225#restore-dashboard-responsiveness (plan 456-restore-dashboard-responsiveness; first implementation commit `fc23efe0c5926dfc7a42aacb8de00e8e3b9fb75d`)
  - Timestamp: unknown (2026-11-03, slice 2 acceptance before `1c986e7f`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: slice 2 return listed stall coalescing as "Not tested"; the coordinator resumed the agent for a fold proof (`authenticated-read-incident-record-stalls.spec.ts`), whose first run recorded 1 of 5 stalls: `histogram.reset()` in `dashboard/server/eventLoopWatch.ts` discarded a just-ended stall on Node v24.21.0. The fix measures from count and mean without reset.
  - Observed effect: a production-relevant measurement defect fixed before publication; the earlier lifecycle spec had passed by timing.
  - Inference: practice worth keeping — treat a return's untested mechanism behind a story restriction as missing proof, not a note.

## ODF-420 — Acceptance observed a class commitment at text listing only its examples

Former local code: DD-415.

[Evidence and current response](docs/maintainer/findings/ODF-420.md).

## ODF-421 — A real observation passed only because the producer happened to supply the promised order

Former local code: DD-416.

[Evidence and current response](docs/maintainer/findings/ODF-421.md).

## ODF-422 — A subordinate project's publication went unobserved by the owning execution

Former local code: DD-417.

[Evidence and current response](docs/maintainer/findings/ODF-422.md).

## ODF-423 — A push the remote refused for permission returned `needs-validation` without its reason

Former local code: DD-418.

[Evidence and current response](docs/maintainer/findings/ODF-423.md).

## ODF-424 — Exclusion story-clause recording still needs hand-matched exact substrings

Former local code: DD-422.

[Evidence and current response](docs/maintainer/findings/ODF-424.md).

### Occurrences
- Execution: SEED-254#use-ancestor-ci-proof-for-skipped-builds (before-cleanup commit `83a71097998b8aee8d486f78eb24027ad148abf8`; first related implementation commit `94a168bef806e6c43a8e7aa3899f5cac49eea263`)
  - Timestamp: 2026-11-07T16:26:11+08:00 (slice 1 obligation recording before delivery `94a168bef`)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (installed `.agents/skills/dough-update/VERSION`; execution used `.claude/skills`)
  - Evidence: coordinator transcript `a813feec-33b3-4f12-8c74-31a2ede64898` turn 30 "Fixing obligation quotes to match the seed"; StrReplace expanded G1/G2/G3 Story clause / Disposition strings to the seed's full substrings (including the SEED-257 link path and the `"revisions passed over"` count wording) before `story-obligations.mjs` check/record for slice 1 cleared
  - Observed effect: one planning-record repair pass before slice 1 obligations cleared; no product rework
  - Inference: same exact-substring discovery cost as the DD-422 / ODF-424 source when deferred exclusion titles diverge from Scope wording

## ODF-425 — A refactor renamed a helper while its verification was running

Former local code: DD-423.

[Evidence and current response](docs/maintainer/findings/ODF-425.md).

## ODF-426 — Required fresh refactor blocked by host agent authentication failure

Former local code: DD-424.

[Evidence and current response](docs/maintainer/findings/ODF-426.md).

## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script

Former local code: DD-425.

[Evidence and current response](docs/maintainer/findings/ODF-427.md).

## ODF-428 — A refactor moved tests after acceptance had cited them, leaving source-review observations stale

Former local code: DD-431.

[Evidence and current response](docs/maintainer/findings/ODF-428.md).

### Occurrences
- Execution: SEED-253#review-delivered-merge-changes (plan 491-review-delivered-merge-changes; first related implementation commit `5cdb4f04d6967e7773a6df0913d3b99ccb79339f`)
  - Timestamp: 2026-11-07T14:33:07+08:00 (slice 1 commit; slice 2 recurrence before `f496a5137` at 2026-11-07T15:15:45+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.87)
  - Evidence: slice 1 refactor dropped the file-list and `completion !== later` assertions in `dashboard/backend-tests/review/story-review-completed.spec.ts` that rows G4, 1.3, K3.1 and K3.2 cited; slice 2 refactor renamed fixture text `unattributed resolution` to `integration edit` cited by G2.
  - Observed effect: the coordinator retargeted the rows from the refactor reports before each delivery; no stale citation was published.
  - Inference: recurs whenever refactoring tightens or renames cited assertions, not only when files move.
- Execution: SEED-254#use-later-ci-proof-for-cancelled-landings (plan 496-use-later-ci-proof-for-cancelled-landings; first related implementation commit `85946790e81e11d70d7ef1235a63d8a8d3aae1d2`)
  - Timestamp: unknown (after slice 2 acceptance, before slice 2 commit at 2026-11-07T18:36:47+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.87 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: slice 2's refactor split `intent-ci-comparison-cancelled-landing.spec.ts` into a `-gaps` spec and `dashboard-later-trunk-build.test.mjs` into a `-landed` test for the 250-line rule; source-review rows 2, 2a, X1, 5a–5c, 9a–9c, E4 and E5 cited the old locations
  - Observed effect: the refactor report listed the stale rows; the coordinator re-recorded them with `story-obligations.mjs record` before delivery, and no stale citation was published
- Execution: SEED-118#retry-unavailable-ci-comparison-slots (plan 500-retry-unavailable-ci-comparison-slots; first related implementation commit `829d4170678aeeb8a6c48530669d3ebdea5b620f`)
  - Timestamp: unknown (after slice 2 refactor return, before slice 2 commit `d45eee61319fc36bbd7659d659af2826ebc0d82d` at 2026-11-07T22:19:36+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: slice 2's refactor moved the unrecoverable-history journey from `intent-ci-comparison.spec.ts` into `intent-ci-comparison-retry.spec.ts` to keep both under 250 lines; source-review rows 1d, 3g and E4 (`8cab734f619f3c373e0416944ef4e19ff1438e0d:.planning/slice-plans/500-retry-unavailable-ci-comparison-slots/source-review.md`) cited the old file
  - Observed effect: the coordinator noticed the move in the refactor report and retargeted the three rows before delivery; no stale citation was published

## ODF-429 — An overlapping sibling story landed on trunk mid-execution and surfaced only at the final done-mark

Former local code: DD-434.

[Evidence and current response](docs/maintainer/findings/ODF-429.md).

### Occurrences
- Execution: SEED-255#compare-before-and-after-ci-proof (plan 493-compare-before-and-after-ci-proof; first related implementation commit `f9af445f43bbc4a9a9e0f69e5aa6ae4f840c1158`)
  - Timestamp: 2026-11-07T16:59:35+08:00 (slice 3 source-freshness amended-link absorb before delivery commit `9a31e3c393079a644fd1134c73c997a16b68fed7`)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (`VERSION` in the execution checkout)
  - Evidence: plan 493 Current decisions name SEED-256 / plan 492 as the coordinating timing-measure sibling sharing `IntentCiComparison.tsx` and `storyCiComparisonWording.ts`; SEED-256 closed on trunk (`1aa1ddd47`, done record completedAt 2026-11-07T08:20:21.775Z) while this branch's merge-base stayed at claim `200f5104a`; slice 3 `source-freshness.mjs` reported amended and absorb rewrote only the SEED-256 seed/plan links to blob URLs; `git merge-tree` of `HEAD` vs `origin/main` still shows both files changed in both
  - Observed effect: link amendment absorbed and slice 3 delivered on the pre-SEED-256 shape; product reconciliation of overall timing (wall time vs time without runner waits) and the shared Intent comparison files remains for land onto trunk
  - Inference: same as ODF-429 — source freshness compares story/plan text, so a named coordinating sibling's product land surfaces as a link amendment (or later merge conflict) rather than a per-slice trunk-file check

## ODF-430 — Story integration moved another active agent profile into done

Former local code: DD-436.

[Evidence and current response](docs/maintainer/findings/ODF-430.md).

## DD-437 — Near-zero Execute Plan boundary-row headroom forced structural packing on an ordinary guidance story

Adding the progress-observation sequence to maintained Execute Plan guidance
hit ~52 bytes of delivery-row headroom and zero finish-row headroom in
`read-budget-guidance.test.mjs`, so the story spent turns splitting
`fresh-increment.md` into `#publish` / `#observe-progress-proof` and trimming
pointers for size rather than only naming the observation command.

### Occurrences
- Execution: SEED-010#observe-progress-revision-before-slice-done / plan 490, first implementation `06cb632ae92d5aa6be2330920f2e2d477c2964da`
  - Timestamp: 2026-11-07T13:50:00+08:00
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.87
  - Evidence: plan 490 Learnings; `src/skills/dough-execute-plan/SKILL.md` delivery row now links `fresh-increment.md#publish`; `progress-observation-guidance.test.mjs` and `read-budget-guidance.test.mjs`; implementation agent report of packing against ~52/0 byte headroom
  - Observed effect: Guidance sequence was delivered, but representative edits required a publish/observe heading split and size-neutral finish-row wording to keep the boundary-read budget green
  - Inference: Boundary-row budgets that leave near-zero headroom turn ordinary guidance stories into structure work; distinct from ODF-264 establishing the budgets themselves

## DD-438 — Source-review commitment Ids used en-dash ranges the recorder refuses

A fresh source-review Commitments table named several distinct restrictions under one en-dash range Id (`R5–R8q`, `R9–R12q`). `story-obligations.mjs record` / check treat those range tokens as malformed commitment Ids, so slice acceptance had to split the rows into individual Ids before observations could stick.

### Occurrences
- Execution: SEED-252#extract-dashboard-frontend-tests (plan `488-extract-dashboard-frontend-tests`; first related implementation commit `17f200208066da890623103609ef49441ad3c835`)
  - Timestamp: 2026-11-07T13:23:51+08:00 (approx.; between source-review write and slice-1 acceptance)
  - Tool: Cursor
  - Open Dough release: unknown (source checkout skills; VERSION 0.3.87)
  - Evidence: coordinator transcript `402174d0-70cd-415a-99d4-dc5cddd8b62b` narrative "Malformed commitment IDs are blocking the record"; StrReplace splitting `R5–R8q` / `R9–R12q` into `R5q` / `R12q` (and peers) in before-cleanup commit `80c1456f79fb951f5e8d7ceff55db1244e21796e` path `.planning/slice-plans/488-extract-dashboard-frontend-tests/source-review.md` before re-record / `check --slice 1`
  - Observed effect: one blocked observation pass and a mechanical Id rewrite before slice-1 obligations cleared
  - Inference: Qualified. Distinct from ODF-381 (Slice-column misuse) and ODF-391 (cell-shape malformations); here the Id column itself carried a range. Source-only review guidance that asks to number compound items separately was not followed for these restriction clusters.

## DD-439 — Prepared plan's empty Story obligations prose failed the execution obligations reader

A prepared slice plan included a `## Story obligations` heading followed by placeholder prose (`None at preparation. During planned execution, report gaps here per ...`). At Slice 1 delegation, `story-obligations.mjs list` refused the section with `malformed-obligations-section` because `story-obligation-reader.mjs` rejects any non-`###` line inside `## Story obligations`.

### Occurrences
- Execution: SEED-250#hide-client-project-from-dashboard (plan 476-hide-client-project-from-dashboard; first related implementation commit `bbdb50295eccda910464a31d47c7ffcc9aadc390`)
  - Timestamp: 2026-11-07T12:49+08:00 (before slice 1 delegation)
  - Tool: Cursor
  - Open Dough release: 0.3.87 (installed `.agents/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: prepared plan `b8e75bc2710e4e868c5937f451f893ec4905f670:.planning/slice-plans/476-hide-client-project-from-dashboard/PLAN.md` lines 143–146 contained `## Story obligations` and two lines of "None at preparation..." prose; `node .agents/skills/dough-execute-plan/scripts/story-obligations.mjs list --plan .planning/slice-plans/476-hide-client-project-from-dashboard/PLAN.md --slice 1` exited 1 with two `malformed-obligations-section` problems until the empty placeholder section was removed
  - Observed effect: one extra read and edit of `PLAN.md` before Slice 1 delegation could proceed; no product impact
  - Inference: either `dough-slice-planning` should omit `## Story obligations` when empty at preparation (as `story-obligations.md` notes "Plans without this section have zero obligations") or `story-obligation-reader.mjs` / readiness check should catch or tolerate an empty placeholder section before execution starts

## DD-440 — Story Branch coordinator started a trunk observer that managed delivery then replaced
At execution start the coordinator followed the boundary row "Arming observation on other hosts" and the skill's "Arm from the execution checkout against the authorized target branch", starting a detached observer on trunk. Story Branch increments publish to the execution branch, and managed delivery establishes its own observer for that target, so the trunk observer watched nothing this execution published.

### Occurrences
- Execution: SEED-253#review-delivered-merge-changes (plan 491-review-delivered-merge-changes; first related implementation commit `5cdb4f04d6967e7773a6df0913d3b99ccb79339f`)
  - Timestamp: 2026-11-07T14:13:53+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.87)
  - Evidence: manual `ci-mailbox.mjs start --execution terryyin/open-dough main` created `/tmp/dough-ci-501/watch-Rta0mE`; the slice 1 `fresh` delivery receipt then attached a new observer `/tmp/dough-ci-501/watch-H1MRwW` on `refs/heads/claude/review-a-completed-story-including-its-merge-cha`; the coordinator stopped the first (`pendingCi: unobserved`, nothing recorded).
  - Observed effect: one redundant detached observer for about 20 minutes and three extra tool calls; no lost coverage.
  - Inference: `trunk-publication.md` says managed delivery establishes observation and not to start it separately, but that reference is read only at the delivery boundary, after the start-time arming row has already applied.

## DD-441 — Acceptance credited a surface commitment through a shared endpoint the surface never showed
Slice acceptance recorded an Intent-overlay commitment as observed by citing the backend review proof plus "the overlay reads the same endpoint", while the Intent specs' merge variants never reached a merge-edited file; the execution retrospective's independent outcome review caught it and reopened the plan.

### Occurrences
- Execution: SEED-253#review-delivered-merge-changes (plan 491-review-delivered-merge-changes; first related implementation commit `5cdb4f04d6967e7773a6df0913d3b99ccb79339f`)
  - Timestamp: 2026-11-07T15:15:45+08:00 (slice 2 delivery `f496a5137` carrying the rows)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.87)
  - Evidence: `source-review.md` rows 3.3 and K1.2 cited `intent-summary-story-comparison{,-file}.spec.ts`; the implementer's own return said the merge-edit files lie outside Intent's locations; the retrospective found the merge variants assert the same rows as the plain story; plan slices 3 and 4 and obligation G1 were added.
  - Observed effect: one delivered slice carried an unobserved commitment; correction cost two added slices.
  - Inference: a return's own stated gap ("outside Intent's locations") was folded into an observation instead of becoming an obligation; reading the cited spec's distinguishing assertion would have shown it.

## DD-442 — A shallow historical checkout still inherited the host Git object store

A scratch checkout can show one reachable commit and no remotes while Git can still read a host object alternate. For a bounded historical assessment, verify that the checkpoint can be read from its local object store with inherited alternates cleared and that a known later object is unavailable.

### Occurrences
- Execution: SEED-192#assess-story-intent-protection (plan 472, first report commit `ae07bb07aa1516a7d400cff6496f1c5c1cf0fc8f`)
  - Timestamp: 2026-11-07T08:26:55.778Z (coordinator report during Slice 3 preflight)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.87 (execution checkout's installed guidance)
  - Evidence: Codex session `01a1b509-fd39-79c2-a8b9-5fc768f51ded` at 08:26–08:27Z; `b0ad4c799d4b659ed072591e8dc0e66b4caefc2e:.planning/slice-plans/472-assess-story-intent-protection/PLAN.md` execution context and Slice 3 proof; [trial evidence limits](https://github.com/terryyin/open-dough/blob/b0ad4c799d4b659ed072591e8dc0e66b4caefc2e/docs/intent-coverage-trial/README.md#evidence-limits).
  - Observed effect: The third assessor could not read HEAD with `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset until the coordinator materialized the checkpoint locally. The corrected preflight resolved HEAD, counted one reachable commit and rejected a later object. The first two assessors' standalone Git checks had inherited the alternate. Their Playwright commands cleared it, and both assessors confirmed they used only their scoped inputs.
  - Inference: Ref and remote checks alone cannot establish object isolation. No access to later evidence was observed, and the rework time was not measured.

## DD-443 — A shared tracking-ref update interrupted confirmation after a successful push

Former local code DD-442 on the execution branch at `76565b1c29fa2370a868fbe7c97e46bfbd4d95cf`.

The managed increment pushed its execution branch, then a broad origin fetch
raced another worktree's tracking-ref update for a different branch.

### Occurrences
- Execution: SEED-257#compare-story-ci-through-adapters (plan 495; first implementation `8dcf704f628c57e8a2e52e6ecb4846e815423ec0`)
  - Timestamp: unknown (2026-11-07, slice 1 publication)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.87 (installed checkout guidance)
  - Evidence: `execution-increment-delivery.mjs fresh` returned `delivery-interrupted` after `git fetch origin` could not update `origin/codex/compare-ci-time-without-runner-waits`; its expected old ref had already advanced. The exact remote branch already named `8dcf704f6`. Managed resume classified it `already-published`, reported `pushCount: 0`, and recovered the registered observer.
  - Observed effect: the accepted increment required one remote identity check and managed resume before the next slice could begin.
  - Inference: confirmation that updates unrelated tracking refs adds a concurrency dependency across worktrees. The evidence covers this occurrence.

## DD-444 — A sibling's done-catalog conflict resolution moved an active execution's agent profile into the done records

Another session's Story Branch integration resolved a done-catalog conflict by
renaming this execution's live agent profile into the done-record directory,
where the done reader rejects it.

### Occurrences
- Execution: SEED-254#use-later-ci-proof-for-cancelled-landings (plan 496-use-later-ci-proof-for-cancelled-landings; first related implementation commit `85946790e81e11d70d7ef1235a63d8a8d3aae1d2`)
  - Timestamp: 2026-11-07T17:51:58+08:00 (trunk commit `0b4ba8d1b`, authored by the SEED-255 integration)
  - Tool: Cursor (integrating session `mrsn-chan`, agent profile host `cursor`, model `auto`); found by this Claude Code execution's retrospective
  - Open Dough release: 0.3.87 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: `0b4ba8d1b` renamed `.planning/{agents => done}/bastiaan-chan.json` unchanged ("Keep trunk's bastiaan-chan done record"); `done/.catalog.json` listed it as `unreadable`; `identity-evidence` reported the gap "done record requires a title"
  - Observed effect: this execution moved the profile back to `.planning/agents/` and rebuilt the catalog with `catalog-done`, in its execution-complete commit
  - Inference: the integrator likely matched the file by name across `agents/` and `done/`; a profile is not a done record

## DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance

Overrides were removed when one hosted run showed a case at or under 15s, but
the same unchanged cases ran up to about 2x slower in later hosted runs, so
two removals timed out on CI and a hardening pass followed.

### Occurrences
- Execution: SEED-260#restore-default-test-timeouts (plan 502-restore-default-test-timeouts; first related implementation commit `6e6d16cef09551a1bd589ba1ec8be6c5cc970f1c`)
  - Timestamp: 2026-11-08T01:20:03+08:00 (commit time of slice 8 revision `1f9d12446`; its hosted run 42395811294 timed out afterwards)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.88 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 margin rule used run 42372706379 only; runs 42395811294 (`agent-launch-story-card-sessions`, 25.2s before) and 42399373902 (`production-watcher-failures.spec.ts:84`) hit 30s; comparing 2,122 matched cases, median ratio 1.02 but p90 1.53, and `story-review-one-shot-choice-refresh` 13.8s → 26.5s unchanged
  - Observed effect: two CI repairs (`acfe0ca9e`, `665c28053`) with stash and pause cycles, then a nine-journey hardening pass (`aad804b57`); 13 hosted cases still at 20–25s
  - Inference: hosted shard co-scheduling and CPU contention dominate; a margin judged across several hosted runs, or against a loaded stand-in such as 16–24 traced local workers, would have found these before publication

## DD-446 — A refactor pass replaced a plan-named repeated proof with one run

The refactor edited a spec whose plan proof named `--repeat-each=5` of one
test, then gave a single combined run as the replacement proof. The repeat the
plan required to show stability was not rerun on the refactored file.

### Occurrences
- Execution: SEED-259#correct-scan-intent-ci-summaries (plan 504-correct-scan-intent-ci-summaries; first related implementation commit `850013d247970387910218951efc45b297cc5ee8`)
  - Timestamp: unknown (2026-11-08, slice 4 refactor return before commit `23cf04377`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.89 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 504 slice 4 proof row "passes, and so does `--repeat-each=5` of its listing-count test"; the refactor return listed the repeat as invalidated and offered "14 passed" across three specs instead; the coordinator reran `--repeat-each=5` on `authenticated-read-revision-stream.spec.ts:59` (5 passed)
  - Observed effect: one extra coordinator run before delivery; no wrong result published
  - Inference: the refactor brief said "rerun only what your edits invalidate" without naming that plan-named proof shapes (repeats, filters) carry over to the replacement

## DD-447 — The coordinator delegated a lookup the implementation brief already required

While waiting on the source-only reviewer, the coordinator spawned a read-only
agent to list every evidence label caller. The slice 1 implementation brief
then required the implementer to find the same callers through grep and the
consumer trace.

### Occurrences
- Execution: SEED-259#correct-scan-intent-ci-summaries (plan 504-correct-scan-intent-ci-summaries; first related implementation commit `850013d247970387910218951efc45b297cc5ee8`)
  - Timestamp: unknown (2026-11-08, before slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.89 (installed `.claude/skills/dough-update/VERSION`)
  - Evidence: Explore agent "list every caller of EvidenceLabel objects" (about 30k subagent tokens, 5 tool uses); its result was used only as the coordinator's acceptance cross-check
  - Observed effect: about 30k tokens with no change to delegation or acceptance
  - Inference: waiting on one agent invited parallel work that duplicated the next agent's required discovery; the Agent guidance's "don't delegate a check you could run inline" already covers it
