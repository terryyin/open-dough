# DearDough Process Findings

Source maintenance on 2026-10-28 retained collected evidence before shortening at Open Dough `32b5ae0b4414d755bcde4ef6cd822774d7450771:docs/maintainer/findings/`. The complete post-local source is `432ed9ec9c9e9954dd5bff0c9a7324d1d8a991a6:DearDough.md`; linked source records share that revision. Unknown execution releases and local facets remain qualified.

Reviewed 2026-10-28 (Asia/Singapore). Four shared process sources were
reviewed after local maintenance: Open Dough, Doughnut, Pygardon and Lizard.
Terry Talks skips shared collection because process retrospective is off.
Released responses await their specific ordinary-use observations; the
[watch list](docs/maintainer/near-term-watch-list.md) preserves its contrary
evidence. Source and catalog identities do not imply resolution.

- Highest allocated local number: 423. Removed numbers are never reused.
- Shared-feedback compaction recovery (2026-11-03): `325f9de8a1f635a44b0071cf0660a2593a21f6b9:DearDough.md`; its rows are retained at the linked Open Dough finding owners. Terry approved consolidating DD-387 and DD-401 as ODF-333, DD-392 into ODF-381, DD-400 into ODF-074 and DD-408 into ODF-325; their former-code aliases remain and their distinct occurrences stay at the linked owners.
- This compaction recovery: `a47f4814edb00038ef77d45e001cae1db9255cb6:DearDough.md`; distinct new rows are retained at linked finding owners. No finding is retired by compaction.
- Duplicate-note cleanup recovery: `81f6c3916430cee083ce027cdb62c8aa5e5c2225:DearDough.md`.
- Earlier cleanup recovery: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275/DD-309/DD-390, the local facets of DD-406 and DD-411, and repaired DD-283/DD-290/DD-312 remain linked from [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

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

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. [Evidence and current response](docs/maintainer/findings/ODF-110.md).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127. [Evidence and current response](docs/maintainer/findings/ODF-157.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Evidence and current response](docs/maintainer/findings/ODF-158.md).

## ODF-106 — Colliding plan numbers <a id="odf-106"></a>

Former local code: DD-155. [Meaning, evidence and response](docs/maintainer/findings/ODF-106.md).

### Occurrences
- Execution: SEED-235#see-running-sessions-with-sidebar-closed (plan 470-see-running-sessions-with-sidebar-closed, first related implementation commit `8e53d30171f12c4dc0a111adc558b794f9ca2387`)
  - Timestamp: 2026-11-05T09:35:45+07:00 (SEED-235 plan commit `1e8a779d3`; sibling SEED-236 plan commit `7e65b01f9` at 2026-11-05T09:32:12+07:00)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.84)
  - Evidence: Taken holds both `.planning/slice-plans/470-see-running-sessions-with-sidebar-closed/` and `.planning/slice-plans/470-show-ci-adapter-proof/`; `.planning/PRODUCT-BACKLOG.md` Taken lists both as plan 470 with different slugs
  - Observed effect: number-only “plan 470” is ambiguous between two concurrent Taken stories; this execution used the full plan path and was not misrouted
  - Inference: concurrent planning about three minutes apart reused the same numeric selector while directories differ only by slug; path/slug disambiguation still works, number-only selection does not

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

### Occurrences
- Execution: SEED-229#reduce-remote-sessions-traffic (plan 462-reduce-remote-sessions-traffic, first implementation commit `75e80cff0890d46699f20d877040c6146390b185`)
  - Timestamp: unknown (2026-11-04, between about 14:10 and 14:26 +07:00, during the coordinator's full `npm run test:dashboard` that started at 13:08)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: the coordinator's repair brief for `authenticated-read-incident-record-bounds.spec.ts` asked for repeats "some under extra CPU load" while it also said the full suite might still be running. The repair agent ran 8 `yes` CPU burners at load about 53. In the same window the full suite failed at `story-reference-navigation.spec.ts:106` and `session-terminal-voice-lifecycle.spec.ts:185`, where load reached 45–56. The next repair brief forbade burners while the suite ran.
  - Observed effect: two more repair agents (about 125k and 107k reported tokens) and base-worktree comparisons. Both failures had tight fixed waits that also failed on base, so they were real test defects and were repaired. A 5-repeat comparison at fluctuating load (change 5/5 against base 2/5) suggested a regression that traces then disproved.
  - Inference: qualified. The brief created competing owned heavy work on the shared host that delegation guidance asks the coordinator to name and sequence. The extra load probably exposed the tight waits sooner, but did not cause defects.

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
- Execution: SEED-232#share-published-git-refreshes (plan 468-share-published-git-refreshes, first implementation commit `aa37bdf36d4a5b8596d71a6544156186a22dfc5d`)
  - Timestamp: 2026-11-04T15:51:35Z (CI run 41862069163 attempt 1 on `aa37bdf36`)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: slice 1's plan proof named the new listing/listing-failures specs plus existing revision-check, shared, waiter, `shared-observation`, and `github-requests` cases, and rewrote only the shared-spec "later check asks again" expectation. Giving the listing its own tracked `AbortController` changed disconnect ownership; CI failed `authenticated-read-subprocess-lifecycle.spec.ts` (expected SIGTERM on revision-check abandon) and `auto-refresh-visibility.spec.ts` (expected heads check still conditional on the pre-hide revision). Repair `ec9babc1e` aligned those consumers without product change. Coordinator transcript `73c2f3cf-dcc7-4769-b1b5-b54c5265e809`; repair agent `ce5156b2-a142-4306-a841-80fb98917e9b`.
  - Observed effect: one failed CI run on the slice-1 SHA, one owned repair/refactor/publish cycle before slice 2, and a stash/restore of in-progress work around the repair.
  - Inference: qualified. The lifetime change's consumers still asserted last-waiter abort; focused proof followed the named listing reuse surface and left those contracts for CI.

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

### Occurrences
- Execution: SEED-232#share-published-git-refreshes (plan 468-share-published-git-refreshes, first implementation commit `aa37bdf36d4a5b8596d71a6544156186a22dfc5d`)
  - Timestamp: unknown (2026-11-05, after slice-2 Task start ~05:51 +07:00 and before verification Task ~07:26 +07:00)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator transcript `73c2f3cf-dcc7-4769-b1b5-b54c5265e809` ("interrupted delegation"; "uncommitted work from the interrupted agent"); slice-2 implementer `610fde17-8b6c-4d61-9e69-4648bf617876` left journey/docs edits without a proof return; verification agent `e9a5df51-ec3b-4aca-8d54-6215e73e7d31` re-established focused and full-dashboard proof from the checkout before acceptance; slice 2 later published as `37e16d3fb`.
  - Observed effect: one aborted implementation Task with uncommitted product/test/doc edits; coordinator reconstructed proof from the checkout, then accepted and delivered without a dual-writer publish.
  - Inference: qualified recurrence of interrupted Cursor implementation without return; edits-present case required checkout reconstruction and renewed proof before acceptance. Host termination cause unestablished. Distinct from the later Cursor auth/tool outage that stalled slice-3 delivery after observation was already recorded.

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
- Execution: SEED-192#order-pytest-parameter-rows (plan 464, first implementation commit a0d44f3ca)
  - Timestamp: unknown (before slice 1 commit a0d44f3ca, 2026-11-04T13:44:04+07:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: slice 1 `execution-increment-delivery.mjs fresh` returned `operation: formatting`, `@typescript-eslint/no-misused-spread` at `dashboard/src/pytestCases.ts` 131 (`[...text]` in the refactor's `codePointsOf`; the implementation's `byCodePoint` had spread strings the same way)
  - Observed effect: implementation and refactor returns both passed focused proof and typecheck with the spread; delivery's formatter refused it, the coordinator replaced it with `Array.from(text, …)`, reran the unit test and typecheck, and the second fresh delivery was accepted.
  - Inference: agents barred from hook-owned lint learn its rules only at delivery; naming a known rule in the brief (done for slice 2) avoided a repeat there.

## ODF-330 — Hand-built preparation input dropped the plan from ownedPaths

Former local code: DD-335. [Meaning, evidence and response](docs/maintainer/findings/ODF-330.md).

### Occurrences
- Execution: SEED-225#correct-incident-and-workspace-observation-residue (plan 457, first implementation commit beda7f32d)
  - Timestamp: unknown (between slice 2 commit 7f365a1bf and slice 3 commit 9c27e94c0, 2026-11-04 +07:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: slice 3 `execution-increment-delivery.mjs fresh` returned `preparation-refused`, "the plan must be included in ownedPaths"
  - Observed effect: ownedPaths was built from `git status`; the plan had no edit before delivery, so it was absent. One refused attempt, then a retry with the plan appended was accepted.
  - Inference: deriving ownedPaths from changed files omits a plan that only delivery's own done-marking will change.

<a id="dd-337--preparation-recorded-measured-allocations-without-their-full-sort-key"></a>

## ODF-355 — Preparation recorded measured allocations without their full sort key

Former local code: DD-337. [Meaning, evidence and response](docs/maintainer/findings/ODF-355.md).

<a id="dd-338--a-direct-formatter-command-in-fresh-delivery-lacked-the-packages-binaries"></a>

## ODF-356 — A direct formatter command in fresh delivery lacked the package's binaries

Former local code: DD-338. [Meaning, evidence and response](docs/maintainer/findings/ODF-356.md).

### Occurrences
- Execution: SEED-225#correct-incident-and-workspace-observation-residue (plan 457, first implementation commit beda7f32d)
  - Timestamp: unknown (before slice 1 commit beda7f32d, 2026-11-04T06:22:33+07:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: slice 1 fresh delivery with formatting `["node","scripts/lint.mjs","--fix"]` returned `operation: formatting`, "eslint: not found on PATH"
  - Observed effect: preparation failed before commit; the retry with `["npm","run","--silent","format"]` committed and published.
- Execution: SEED-225#resolve-stuck-attempt-reconciliation (plan 458, first implementation commit 63b37546b)
  - Timestamp: unknown (before slice 1 commit 63b37546b, 2026-11-04)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown
  - Evidence: slice 1 fresh delivery with formatting `["node","scripts/lint.mjs","--fix"]` returned `operation: formatting`, "eslint: not found on PATH"
  - Observed effect: preparation failed before commit; the retry with `["npm","run","--silent","format"]` committed and published.
  - Inference: the coordinator repeated the occurrence a few hours after it was recorded; the recorded finding alone did not reach the next execution's preparation choice.

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

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

## ODF-367 — Source-only review arrived after the first slice was delegated

Former local code: DD-388.

Former local code: DD-379 (`6085b6eed`), renumbered in merge `073e95d2d`.

[Evidence and current response](docs/maintainer/findings/ODF-367.md).

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

## ODF-410 — An implementation agent handed back while its own background work kept running

Former local code: DD-413.

[Evidence and current response](docs/maintainer/findings/ODF-410.md).

## DD-414 — Asking for proof of an untested mechanism found a defect in it
A return listed a mechanism the slice's restriction depended on as untested; the coordinator asked for focused proof before acceptance, and writing that proof exposed a defect that also affected the already passing case.

### Occurrences
- Execution: SEED-232#reduce-running-cursor-session-requests (plan 470-reduce-running-cursor-session-requests; first related implementation commit `18ad9cdc77f74a647b97d789d7656fc50c7fb4ea`)
  - Timestamp: 2026-11-05T05:58:00+07:00
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator transcript `3bb4f177-6d51-4cc1-bc37-960c9aac4537` delegated slice 1 (subagent `88e91963-42fd-4d56-8fa8-1f5d2e11a93f` at 05:54+07:00) before launching the source-only reviewer (`05ed7080-9e96-414a-b209-6162203edfd3` at 05:58+07:00); source-review.md and Story obligations X-D1–X-S8 were written after that return
  - Observed effect: slice 1 brief carried only the plan's proof; source commitments 11–15, 25–26, E4 and E6 were recorded at acceptance after the implementer had already returned. No mid-run product correction was required because those commitments matched the plan's rewrite of the sharing proofs
  - Inference: same ordering as prior ODF-367 rows — the source-only review that acceptance requires still starts after the first Behavior slice is already delegated

- Execution: SEED-225#restore-dashboard-responsiveness (plan 456-restore-dashboard-responsiveness; first implementation commit `fc23efe0c5926dfc7a42aacb8de00e8e3b9fb75d`)
  - Timestamp: unknown (2026-11-03, slice 2 acceptance before `1c986e7f`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: slice 2 return listed stall coalescing as "Not tested"; the coordinator resumed the agent for a fold proof (`authenticated-read-incident-record-stalls.spec.ts`), whose first run recorded 1 of 5 stalls: `histogram.reset()` in `dashboard/server/eventLoopWatch.ts` discarded a just-ended stall on Node v24.21.0. The fix measures from count and mean without reset.
  - Observed effect: a production-relevant measurement defect fixed before publication; the earlier lifecycle spec had passed by timing.
  - Inference: practice worth keeping — treat a return's untested mechanism behind a story restriction as missing proof, not a note.

## DD-415 — Acceptance observed a class commitment at text listing only its examples
A source-review commitment defined a class with examples in parentheses; slice acceptance recorded it `observed:` at product text that kept the examples and dropped the class, although the source-review rules call a narrower result a mismatch. A later slice's replay exposed it and needed a return.

### Occurrences
- Execution: SEED-010#proportionate-refactor-for-records-and-repairs (plan 458-proportionate-refactor-for-records-and-repairs; first implementation commit `451de1e082f90ef8641e0644e6c08a40dcb58d1d`)
  - Timestamp: unknown (2026-11-04, slice 1 acceptance before `451de1e0`; caught at slice 3 acceptance before `5c15a9d0`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: commitment 2.1 ("planning, execution, finding or research records (plans, seeds, …)") was recorded observed at wrap-up step 1 "touches only plans, seeds, backlog, …"; the slice 3 replay then classed proof records, a candidate catalog, research notes and the North Star as fresh-pass; obligation G1 (`return`, proved by slice 3) in plan 458.
  - Observed effect: one extra correction agent (about 79k reported tokens) and one more refactor pass (about 60k); five of seven replay rows changed classification.
  - Inference: the coordinator matched the example list rather than the stated class; a replay against real cases found what phrase-level acceptance missed.

## DD-416 — A real observation passed only because the producer happened to supply the promised order
Acceptance recorded an ordering commitment `observed:` at real data whose order came from the recorder's sort, not from the reader the commitment is about; the reader's own spec pinned the opposite order. The outcome review found it.

### Occurrences
- Execution: SEED-192#read-pytest-proof (plan 459-read-pytest-proof; first related implementation commit `85ce0030a2465bc2a5e1260127f36883e59ff8af`)
  - Timestamp: unknown (2026-11-04, slice 6 acceptance before `5082cb99`; found by the execution retrospective)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: after Terry amended the story ("ordered by parameter id"), source-review rows 4.2.2 and E6.R3 were recorded observed at the dev dashboard on Pygardon `8dc7cad1a`, whose `tests/proof/latest.json` is sorted by the plugin (`sorted(kept, key=_identity_key)`); `dashboard/src/pytestCases.ts` keeps snapshot order and `dashboard/tests/intent-pytest-proof.spec.ts` asserts `up` before `even`. The 4.2.2 cell itself names "snapshot order".
  - Observed effect: an amended promise accepted without reader behavior or proof; one correction story and plan written by the retrospective.
  - Inference: when a promise changes after the product was built, acceptance needs a precondition that would fail without the promised behavior (here an unsorted snapshot), not a real run whose upstream already supplies it.

## DD-417 — A subordinate project's publication went unobserved by the owning execution
An execution that publishes to another project's trunk (a subordinate Doughnut or Pygardon workspace) had CI observation only for its own repository, so the subordinate publication's CI outcome was not owned by that execution and surfaced only through a later manual or retrospective check.

### Occurrences
- Execution: SEED-192#read-vitest-proof (plan 460-read-vitest-proof; first related implementation commit `beadffb0780c952a0d0cacc53755020145abc55a`)
  - Timestamp: 2026-11-04T09:24:10Z (Doughnut CI failure on `5b2f8de6ab`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: the execution's observer (`/tmp/dough-ci-501/watch-l6pc3b`) watched only `terryyin/open-dough`; Doughnut run 41806231388 failed in `pnpm lint:all` ("Unexpected .only modifier", Vitest's CI default under `GITHUB_ACTIONS`); Terry pushed `6e53933393` "Allow the proof reporter's focus fixture to run on CI" at 09:27:24Z; the coordinator found the failure by `gh run list` about 25 minutes after its push, reproduced it, committed the same fix and dropped it as a duplicate when its push met trunk. Pygardon `2a48f97fd` also failed (an unrelated settings race) and was found by a manual adapter `discover`, then repaired in `64a16e0b8`.
  - Observed effect: a human repaired an agent-published CI failure; the agent spent a reproduction and repair on work already done; the Pygardon failure stayed unknown until the agent happened to look.
  - Inference: the subordinate publication route ("commit and push under the project's own rules") carries no CI ownership step for that project's CI, and the recorder's fixture runs were never tried with the CI environment variables set locally.
- Execution: SEED-192#read-node-test-proof (plan 467-read-node-test-proof; first related implementation commit `bc26ca5f29591e3c8993e9b985ac63dbacb407a6`)
  - Timestamp: 2026-11-05T05:15:41Z (Doughnut push of `6c5702cf4d8a29538bc7983ae53a26ad5107c360`)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator transcript `9bd04639-5f5d-4c74-a32d-150a7eacfef4` turns 78–84 push Doughnut then await only Open Dough observer `/tmp/dough-ci-501/watch-wsC3k0` (`terryyin/open-dough`); no `gh run` / Doughnut CI step after the push; this retrospective found Doughnut run 41972920025 `completed`/`success` for that SHA (`pnpm lint:all` green).
  - Observed effect: subordinate CI happened to pass; the owning execution never observed it and would have missed a failure the same way as the Vitest occurrence.
  - Inference: recurrence of the missing subordinate-CI ownership step; green CI does not close the gap.

## DD-418 — A push the remote refused for permission returned `needs-validation` without its reason
Managed delivery treated GitHub's refusal of a workflow-file push (missing OAuth `workflow` scope) as a rejected push, fetched, reconciled onto the unchanged tip and stopped with `needs-validation`; neither the fresh nor the `deliver --validated-candidate` receipt carried the remote's refusal text, so the retry repeated the same stop.

### Occurrences
- Execution: SEED-230#summarize-ci-proof-in-intent (plan 463-summarize-ci-proof-in-intent; first implementation commit `99d0f70e7c503bcafb7cc79d3183277eaec28c96`)
  - Timestamp: unknown (2026-11-04, slice 1 delivery of `99d0f70e7`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: both receipts had `remoteTip` and `suffixBase` `88cf77a06` equal to the published base, `reconciliations: 1`, `status: needs-validation`; `execution-increment-publication.mjs` sends any `rejected` push into `reconcileOnto(..., retry=true)`, whose proof gate never holds on retry; a manual `git push` then printed "refusing to allow an OAuth App to create or update workflow `.github/workflows/ci.yml` without `workflow` scope"; after `gh auth refresh -s workflow` the same `deliver` was accepted.
  - Observed effect: two refused deliveries and about eight diagnostic tool calls before a credential stop for Terry.
  - Inference: qualified. A remote refusal (`[remote rejected]` with a reason) is a credential or policy stop, not contention; reporting its text as its own status would have reached the human decision at the first receipt.

## DD-420 — Lowered revision-stream pace listed origin twice before open answers settled
With `DOUGH_REVISION_STREAM_MS` lowered, `SourceRevisionStream` scheduled its pace timer while the first open demand was still settling, so two streams of one source could each start a `matching-refs` before sharing one listing. Local focused boundary proof had passed; hosted CI failed the one-listing assertion; the fix starts the pace only after the open demand settles.

### Occurrences
- Execution: SEED-232#see-published-changes-over-sse (before-cleanup `1b37ad486dba725c8e08dceed5af56c9e6848da1:.planning/slice-plans/469-see-published-changes-over-sse/PLAN.md`; first implementation commit `fe83d250eb95a2e02edc3e8b02eccb8d01f92f27`)
  - Timestamp: 2026-11-04T16:22:39Z (CI failure on `fe83d250eb`)
  - Tool: Cursor
  - Model: auto
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: observer `/tmp/dough-ci-501/watch-6tNnon` `CI_FAILURE` run 41865901313 (`dashboard (4/12)`); proof fragment `passed:287,failed:1`; report `authenticated-read-revision-stream.spec.ts` expected `matchingRefsSince` 1 received 2 at open; coordinator later called it an open-vs-pace race and fixed it before publishing stream page work (`1e79d44b9` / before-cleanup plan learning (slice 4): pace starts only after first open demand settles); tip coverage `40eb66ce` success / `a5307e4e` not_required.
  - Observed effect: published slice 2 failed hosted CI on the stream's core sharing promise; later slice repaired the race and the applicable tip validated.
  - Inference: a lowered-pace boundary proof that only asserts after both opens can miss a race where the pace timer overlaps the first demand; deferring pace start until open settles made the one-listing rule hold under CI timing.

## DD-421 — Revision-stream rate-limit reopen via page-clock timer stranded under paused clocks
Slice 5 first deferred stream open after a rate-limit wait only through `scheduleOpenAfter` on the page clock. Journey clocks stay paused, so the reopen never fired, focused stream journeys failed, and the page kept the effect-level `limitedUntil` guard that opens at T without relying on that timer alone.

### Occurrences
- Execution: SEED-232#see-published-changes-over-sse (before-cleanup `1b37ad486dba725c8e08dceed5af56c9e6848da1:.planning/slice-plans/469-see-published-changes-over-sse/PLAN.md`; first implementation commit `fe83d250eb95a2e02edc3e8b02eccb8d01f92f27`)
  - Timestamp: unknown (2026-11-05, focused slice 5 proof before `40eb66ce52`)
  - Tool: Cursor
  - Model: auto
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator return: focused proof 40 passed / 2 stream journeys failed; before-cleanup plan learning and slice 5 proof: keep effect-level rate-limit guard; do not defer open via page-clock `scheduleOpenAfter` alone; `revision-stream-lost.spec.ts` rate-limit journey then passed in the 42-focused run; published at `40eb66ce52`.
  - Observed effect: lost-freshness / rate-limit stream work blocked until the open path matched how check journeys pause the page clock.
  - Inference: stream delivery that must reopen while tests pause `page.clock` cannot treat a page-clock timeout as the only gate for a standing limit; wall-clock or effect re-entry is required for those journeys (and matches production when the limit ends without a clock advance).

## DD-422 — Exclusion story-clause recording still needs hand-matched exact substrings
`story-obligations.mjs record` for excluded dispositions refuses paraphrased story clauses with `quote-not-in-story`, so the coordinator must rediscover the seed's exact substring even when the disposition meaning is already clear.

### Occurrences
- Execution: SEED-232#reduce-running-cursor-session-requests (plan 470-reduce-running-cursor-session-requests; first related implementation commit `18ad9cdc77f74a647b97d789d7656fc50c7fb4ea`)
  - Timestamp: unknown (2026-11-05, between source-review write ~05:58+07:00 and slice 1 delivery `18ad9cdc7` at 06:06+07:00)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator transcript `3bb4f177-6d51-4cc1-bc37-960c9aac4537` turns recording X-S2/X-S4/X-S5/X-S7; first exclusion batch used paraphrases such as "no change to how choosing a row opens the terminal" and "no new database"; `record`/`check` refused `quote-not-in-story` until the clauses were shortened to exact Scope substrings ("how choosing a row opens the terminal", "no new daemon, database, or scheduler", "machine-session observation's own 15-second page pace")
  - Observed effect: two repair rounds on planning records before slice 1 obligation check passed; no product rework and no incorrect exclusion published
  - Inference: the observation/exclusion writer removed table hand-edits (ODF-391 response) but still leaves exact-substring discovery to trial and error when Scope wording and the disposition title diverge

## DD-423 — A refactor renamed a helper while its verification was running

The Slice 3 refactor renamed an exported recovery-clock helper after starting the moved-test cohort. The cohort could support the unaffected cases, while the changed recovery consumers needed a final-state run.

### Occurrences

- Execution: SEED-192#recover-failed-intent-reads (before-cleanup `2cd5b5045afda9a64ed876834b8e59ab973b1aa5:.planning/slice-plans/471-recover-failed-intent-reads/PLAN.md`, first implementation `b24ddba9d492298853d08155a6596ec8b8c63530`)
  - Timestamp: unknown (2026-11-05, Slice 3 refactor before `f1af856faa2de128600aecd4c047e63aaffee463`)
  - Tool: Codex
  - Open Dough release: 0.3.84 (checkout-bound `.agents/skills/dough-update/VERSION`)
  - Evidence: launch `b02a9539-0a08-468e-996f-0178426a4472`, `/root/refactor3` handoff explicitly placed the `advanceRecoveryClock` rename after the 24-case cohort launched and before its terminal result. The final proof command selected `intent-read-recovery.spec.ts`, `intent-read-boundary-recovery.spec.ts` and `intent-candidates-read-recovery.spec.ts`.
  - Observed effect: 14 unaffected boundary/state/browse cases retained their proof. Ten recovery cases ran again on the final helper and passed in 12.9 seconds, followed by typecheck. The coordinator accepted only that final proof for those consumers.
  - Inference: completing refactor edits before verification would have avoided this bounded repeat. The agent identified and corrected the proof mismatch before delivery, and published proof covers the final state.

## DD-424 — Required fresh refactor blocked by host agent authentication failure
A required post-change refactor Task (and `agent` CLI fallback) failed to start with host authentication errors, so slice delivery stopped with uncommitted accepted work until a human restored login and authorized a coordinator-local refactor if spawn still failed.

### Occurrences
- Execution: SEED-192#read-node-test-proof (plan 467-read-node-test-proof; first related implementation commit `bc26ca5f29591e3c8993e9b985ac63dbacb407a6`)
  - Timestamp: unknown (2026-11-05, after slice 1 acceptance; developer resume 10:31+07:00; slice 1 published `bc26ca5f2` at 10:37+07:00)
  - Tool: Cursor
  - Open Dough release: unknown (installed skills in source checkout; VERSION 0.3.83)
  - Evidence: coordinator transcript `9bd04639-5f5d-4c74-a32d-150a7eacfef4` turns 34–46: repeated Task refactor spawns and an `agent --print` CLI attempt returned authentication / `agent login` errors; unfinished handoff preserved the worktree; user restored auth and authorized coordinator-local refactor if Task still failed; turn 49 Task then completed `## REFACTOR COMPLETE` (none — already clean) and delivery resumed.
  - Observed effect: delivery stalled with slice 1 implemented and proof-accepted but unpublished until human credential repair; several failed spawn attempts before the stop; no product rework after restore.
  - Inference: distinct from ODF-059 (host-terminated mid-run agents): here fresh agents could not start. A credential stop that preserves the checkout is correct; an authorized coordinator-local refactor fallback unblocks delivery when spawn remains unavailable.
