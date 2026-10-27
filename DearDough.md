# DearDough Process Findings

Source maintenance on 2026-10-25 retained all newly collected evidence before shortening at Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/`. The complete pre-edit source is `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`; distinct executions, former codes and qualified provenance remain recoverable.

Reviewed 2026-10-25 (Asia/Tokyo). Active shared-process findings only; released
responses under observation live in the [watch list](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/near-term-watch-list.md).
Detailed observations, original releases and qualified inferences are retained
in the linked Open Dough catalog. Source compaction follows recoverable evidence retention at `eeefa1588ba0b04c6573384de520e1374e7e7afa`; the complete pre-compaction source remains at `e2e7bfcd2f90e775cb23d9aa8a54073dae06f4c5:DearDough.md`. The previous compaction followed `341293c09f1115b8ad3412fc6da63679ce563457` (pre-compaction source `77f9c3f6d0bf64446a26368b7e7a1b5dfcdff805:DearDough.md`). Earlier compaction recovery remains at `dbe36711` and `327b6fa255b84ba8a2552ca41dba37a46fadf4d9:DearDough.md`. Terry Talks and Lizard are excluded from shared collection because process retrospective is off; the three selected process sources are complete. Unknown execution provenance remains unknown.

- Highest allocated local number: 348. Removed numbers are never reused.
- Earlier cleanup recovery: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275/DD-309 and repaired DD-283/DD-290/DD-312 remain in [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

## ODF-087 — Skipped preparation gates <a id="odf-087"></a>

Former local code: DD-089. Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass. [Evidence and current response](docs/maintainer/findings/ODF-087.md).

## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>

Former local code: DD-057. A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof. [Evidence and current response](docs/maintainer/findings/ODF-059.md).

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-074 — Unverified planning premises <a id="odf-074"></a>

Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Former local code: DD-307. Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked. [Evidence and current response](docs/maintainer/findings/ODF-074.md).

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-074.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences
- Execution: SEED-010#refresh-human-amendments-before-completion (plan `355-refresh-human-amendments-before-completion`, first implementation commit `7fb2bf982dd135a974b5de9eaf63cea8e0e98545`)
  - Timestamp: unknown (planned and executed 2026-10-25)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72 (installed); response under execution unreleased
  - Evidence: plan 355 boundary assumption "the plan by the Taken entry's link"; gates added unconditionally "In Story Branch Mode" in `wrap-up.md` step 5, `finish-or-stop.md` and `dough-story-wrap-up/SKILL.md` (`8582e559`); `source-freshness.mjs` refuses `no-plan-link`, while `product-backlog-take.mjs` gives quick stories and plan-homed corrections no plan link; found by the execution retrospective's outcome review
  - Observed effect: The only-caller premise that every Story Branch source links a plan went uninspected through planning, slice 2's behavior review and four slices; the gates would stop plan-homed corrections and quick Story Branch wrap-ups, and a follow-up correction was planned.

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop. [Evidence and current response](docs/maintainer/findings/ODF-110.md).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127. An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive. [Evidence and current response](docs/maintainer/findings/ODF-157.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths. [Evidence and current response](docs/maintainer/findings/ODF-158.md).

## ODF-106 — Colliding plan numbers <a id="odf-106"></a>

Former local code: DD-155. Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous. [Evidence and current response](docs/maintainer/findings/ODF-106.md).

## ODF-141 — Fixed refactor cost on small accepted slices <a id="odf-141"></a>

Former local code: DD-192. Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost. [Evidence and current response](docs/maintainer/findings/ODF-141.md).

## ODF-204 — Interrupted delegated agent keeps running and publishes <a id="odf-204"></a>

Former local code: DD-215. After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout. [Evidence and current response](docs/maintainer/findings/ODF-204.md).

## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>

Former local code: DD-217. Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own. [Evidence and current response](docs/maintainer/findings/ODF-205.md).

## ODF-152 — File-size gate conflicts with approved intermediate scope <a id="odf-152"></a>

Former local code: DD-219. An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers. [Evidence and current response](docs/maintainer/findings/ODF-152.md).

## ODF-209 — Concurrent CI reproduction overloads slice proof <a id="odf-209"></a>

Former local code: DD-221. Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof. [Evidence and current response](docs/maintainer/findings/ODF-209.md).

## ODF-210 — Removal proof omits an existing user capability <a id="odf-210"></a>

Former local code: DD-234. A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective. [Evidence and current response](docs/maintainer/findings/ODF-210.md).

## ODF-211 — Admission is ambiguous for an unlanded story correction <a id="odf-211"></a>

Former local code: DD-237. An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code. [Evidence and current response](docs/maintainer/findings/ODF-211.md).

## ODF-217 — Unverified refactor proof effects <a id="odf-217"></a>

Former local code: DD-239. Former local code: DD-248. A refactor misclassifies or omits the proof effects of a change, leaving reached consumers unrun; some returns incorrectly call changed behavior identical or type-only. [Evidence and current response](docs/maintainer/findings/ODF-217.md).

## ODF-218 — Formatting invalidates a pre-format size check <a id="odf-218"></a>

Former local code: DD-241. The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout. [Evidence and current response](docs/maintainer/findings/ODF-218.md).

## ODF-219 — Background coordinator implements outside the local-slice condition <a id="odf-219"></a>

Former local code: DD-245. Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice. [Evidence and current response](docs/maintainer/findings/ODF-219.md).

## ODF-100 — Masked formatter failure <a id="odf-100"></a>

Former local code: DD-251 (plans 264 and 271 only). A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure. [Evidence and current response](docs/maintainer/findings/ODF-100.md).

## ODF-097 — Publishing after a failed check <a id="odf-097"></a>

Former local code: DD-251 (plan 273 only). A failed formatter or verification result is visible but does not gate the next commit or publication step. [Evidence and current response](docs/maintainer/findings/ODF-097.md).

## ODF-222 — Post-commit managed delivery stalls at an unknown stage <a id="odf-222"></a>

Former local code: DD-253 (Cursor plan 273 only). Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located. [Evidence and current response](docs/maintainer/findings/ODF-222.md).

## ODF-184 — Unbounded Git transport stalls managed delivery <a id="odf-184"></a>

Former local code: DD-253 (Claude Code plan 274 only). An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished. [Evidence and current response](docs/maintainer/findings/ODF-184.md).

## ODF-220 — Code-level planning findings become stale on trunk <a id="odf-220"></a>

Former local code: DD-254. Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises. [Evidence and current response](docs/maintainer/findings/ODF-220.md).

## ODF-221 — CI repair misses a sibling with the diagnosed cause <a id="odf-221"></a>

Former local code: DD-255. A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair. [Evidence and current response](docs/maintainer/findings/ODF-221.md).

## ODF-224 — Native replay changes the retained acceptance checkpoint <a id="odf-224"></a>

Former local code: DD-258. A native acceptance replay constructs a fresh current-slice checkpoint instead of the historical accepted checkpoint and omits later ownership or preserved constraints, so the paid run exercises a different decision. [Evidence and current response](docs/maintainer/findings/ODF-224.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. Focused consumer selection misses indirect callers, contract comparisons or prose consumers, so named proof can pass while owned CI or a wider suite finds the omitted effect. [Retained occurrences and response](docs/maintainer/findings/ODF-150.md). All distinct execution evidence is retained in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-150.md`; the pre-compaction source is `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>

Former local code: DD-260. Repair quiescence checks only writers, so stashing an interrupted agent’s checkout while read-only tests still observe it invalidates the proof. [Evidence and current response](docs/maintainer/findings/ODF-225.md).

## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>

Former local code: DD-261. A reported GitHub transport failure ends observation and leaves later revisions without notification coverage. [Evidence and current response](docs/maintainer/findings/ODF-121.md).

## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>

Former local code: DD-262. A focused proof overrides a configured reporter that owns failure policy, making local passing assertions insufficient evidence for the project’s actual verdict. [Evidence and current response](docs/maintainer/findings/ODF-226.md).

## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>

Former local code: DD-263. A coordinator explicitly requests a temporary reproduction to delete, so product repairs return without a permanent regression test and require another delegation round. [Evidence and current response](docs/maintainer/findings/ODF-227.md).

## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>

Former local code: DD-264. A long repeated full-suite probe starts and continues on an overloaded shared host without checking load or swap, consuming hours without completing its planned evidence. [Evidence and current response](docs/maintainer/findings/ODF-228.md).

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. An interrupted Cursor implementation Task leaves edits but no agent return; the coordinator must reconstruct proof and acceptance from the checkout. [Evidence and current response](docs/maintainer/findings/ODF-229.md).

## ODF-230 — Planned proof relies on a forbidden shared installation <a id="odf-230"></a>

Former local code: DD-266. Planning settles proof through a temporary mutable dependency link even though execution setup forbids linking another checkout’s installation. [Evidence and current response](docs/maintainer/findings/ODF-230.md).

## ODF-231 — Setup gate misses the project’s exact runtime pin <a id="odf-231"></a>

Former local code: DD-267. Readiness resolves package-lock installation and typecheck but omits the project’s runtime pin and authoritative setup checker, allowing all delivery on a different runtime. [Evidence and current response](docs/maintainer/findings/ODF-231.md).

## ODF-187 — Planned observations cannot detect regressions <a id="odf-187"></a>

Former local code: DD-268. Planning prescribes an observation whose claimed discrimination was reasoned rather than demonstrated; executing the proposed proof can pass on the unfixed behavior or conflict with the project’s proof policy. [Evidence and current response](docs/maintainer/findings/ODF-187.md).

## ODF-232 — Acceptance publishes an explicitly unobserved host fact <a id="odf-232"></a>

Former local code: DD-270. A return explicitly reports native host behavior unobserved, yet acceptance publishes that behavior as factual guidance and records only pending native evidence. [Evidence and current response](docs/maintainer/findings/ODF-232.md).

## ODF-233 — A plan forbids the representation its promised behavior needs <a id="odf-233"></a>

Former local code: DD-272. A correction’s boundary forbids new record/schema data while its behavior requires a fact the existing entrypoint or record does not supply, leaving a background coordinator to reinterpret scope. [Evidence and current response](docs/maintainer/findings/ODF-233.md).

## ODF-234 — Journey acceptance omits the next state its own guidance promises <a id="odf-234"></a>

Former local code: DD-273. Acceptance proves a correction’s first successful rerun but omits subsequent or adjacent states produced by the same journey, including explicitly listed untested record states. [Evidence and current response](docs/maintainer/findings/ODF-234.md).

## ODF-223 — A gap disposition substitutes reasoning for its actual guided path <a id="odf-223"></a>

Former local code: DD-277. Structured story obligations are marked no user cost or proved from a return’s narrow explanation or a helper’s behavior without tracing/running the paths the published guidance directs into that state. [Evidence and current response](docs/maintainer/findings/ODF-223.md).

## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed <a id="odf-235"></a>

Former local code: DD-281. A slice changes a rebuildable candidate into irreplaceable hand-resolved work but does not trace existing failure exits that abandon it, dropping that resolution to the reflog. [Evidence and current response](docs/maintainer/findings/ODF-235.md).

## ODF-236 — Refactoring removes a deliberate caller behavior difference <a id="odf-236"></a>

Former local code: DD-286. A refactor deletes a caller override to unify a rule despite knowing it changes that caller’s preserved edge behavior, reporting the choice after editing instead of preserving it. [Evidence and current response](docs/maintainer/findings/ODF-236.md).

## ODF-237 — Unattached launch planning assumes an incompatible capture contract <a id="odf-237"></a>

Former local code: DD-289. Planning promises landing context for an unattached launch without observing that the capture schema and admission path require a story identity. [Evidence and current response](docs/maintainer/findings/ODF-237.md).

<a id="dd-288"></a>

## ODF-238 — A planned native proof depends on a future release <a id="odf-238"></a>

Former local code: DD-288. A final native observation depends on a deployment or release path unavailable before landing; planning must distinguish the actual delivery prerequisite. [Retained occurrences and response](docs/maintainer/findings/ODF-238.md). All distinct execution evidence is retained in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-238.md`; the pre-compaction source is `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`.

### Occurrences
- Execution: SEED-151#balance-test-shares / plan 353, first implementation commit `61d16b66`
  - Timestamp: 2026-10-25T20:38:14+09:00 (slice 3 commit `065d6655`; its CI run completed before `2a537b21` at 20:45+09:00)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: modified; revision `6c6b5f58`; base 0.3.69
  - Evidence: the story's completion clause asks DD-279 to record "the measured allocation of the landed revision's CI run"; plan 353 slice 3 owed that record, but the run that measures a commit exists only after it. The record in `065d6655` names the prior run, and a fourth increment `2a537b21` added run 40189712361's totals and refreshed both lists from it after waiting for CI.
  - Observed effect: one extra CI wait and increment to satisfy a clause whose evidence postdates the commit that records it.
  - Inference: qualified. Not native or release-bound this time, but the same shape: a promised final observation whose prerequisite is the landing itself. Refinement should name the run the record can actually cite (the last branch run) or leave the landed-run measurement to wrap-up.

## ODF-248 — Refactor reruns unchanged consumer proof <a id="odf-248"></a>

Former local code: DD-292. A refactor repeated the accepted thirty-spec terminal consumer command although only a subset of its observations moved. Existing guidance requires reusing proof whose boundaries remain unchanged. [Evidence and current response](docs/maintainer/findings/ODF-248.md).

## ODF-249 — Whole-suite proof runs before the refactor that invalidates it <a id="odf-249"></a>

Former local code: DD-293. An implementation agent ran the changed surface's whole suite before the independent refactor pass, and the refactor then moved the measured code, so the suite had to run again on the final state. [Evidence and current response](docs/maintainer/findings/ODF-249.md).

## ODF-250 — A plan's proof table omits an answer state its story scopes in <a id="odf-250"></a>

Former local code: DD-294. The story's required behavior named three launch answer states; the plan's proof table and slice proof named two, so the implementation return listed the third untested and the coordinator returned the slice for it. [Evidence and current response](docs/maintainer/findings/ODF-250.md).

## ODF-251 — An open Story Branch execution has no guided path to queue a correction it discovers <a id="odf-251"></a>

Former local code: DD-298. An execution whose story must stay open found discrepancies that needed bounded corrections queued on trunk before it could finish. Its own records reach trunk only at wrap-up, and the launch's landing context is bound to its own worktree, so the coordinator improvised a second worktree and a direct publication. [Evidence and current response](docs/maintainer/findings/ODF-251.md).

## ODF-252 — A story recorded ready still needs developer choices and fixtures before its first slice <a id="odf-252"></a>

Former local code: DD-299. The plan left "the developer names the observation project, fixture stories, models and time budget at execution setup" and was assessed ready. No configured project held a usable fixture story, so execution's first turn ended in a question and five fixture stories were authored and published mid-execution. [Evidence and current response](docs/maintainer/findings/ODF-252.md).

## ODF-253 — The start command's guidance names the trunk branch but not its flag <a id="odf-253"></a>

Former local code: DD-300. A native session following the one-shot start instructions passed `--trunk master`, was refused with `missing target`, searched the installed script for the option name, and retried with `--target`. [Evidence and current response](docs/maintainer/findings/ODF-253.md).

## ODF-254 — Accepted proof let a test setup step perform an action the story requires of the product <a id="odf-254"></a>

Former local code: DD-301. A slice 3 journey made an unknown-ancestry case pass by running `git fetch origin` in the test before expecting completion. The coordinator accepted it as a covered case, although story key example 2 needs completion without anyone fetching another writer's snapshot. The limitation surfaced only when slice 5 listed it as a gap. That cost a returned slice and rewritten lifecycle cases. [Evidence and current response](docs/maintainer/findings/ODF-254.md).

## ODF-255 — A slice's refactor widens a seam that a later slice of the same plan removes <a id="odf-255"></a>

Former local code: DD-304. In slice 2, the refactor pass moved a shared rule into the records module and re-exported it through coverage, the module whose records re-export slice 5 was planned to drop. The refactor brief carried only the current slice, so the pass could not see that plan direction. Slice 5 then repointed the added names too, and the plan's slice 5 text had to be revised. [Evidence and current response](docs/maintainer/findings/ODF-255.md).

## ODF-256 — Managed delivery accepts a `--repo` that does not match the workspace's remote <a id="odf-256"></a>

Former local code: DD-305. The coordinator passed `--repo nerds-odd-e/open-dough` for a checkout whose `origin` is `terryyin/open-dough`. It had inferred the repository from the other project in the same task. `deliver` published to `origin` and attached an observer for the named repository. That observer then reported `CI_MONITOR_UNAVAILABLE` (HTTP 404 on `ci.yml`). Nothing compared the supplied repository with the remote the push used. [Evidence and current response](docs/maintainer/findings/ODF-256.md).

## ODF-169 — Stale replay base includes sibling commits <a id="odf-169"></a>

Former local code: DD-306. A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts. [Evidence and current response](docs/maintainer/findings/ODF-169.md).

## ODF-139 — Reported defect dismissed without checking the story <a id="odf-139"></a>

Former local code: DD-308. A named gap contradicts the story goal, but acceptance judges it against the plan's narrower scope and delivers it. [Evidence and current response](docs/maintainer/findings/ODF-139.md).

### Occurrences
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 3 acceptance)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: plan 354 proof row "Codex and Cursor `narrowed` rounds recorded per host" versus story clause "The correction catches the former"; plan 354 `## Story obligations` G1; `check --slice 3` refused `open-obligation` until the developer's story amendment
  - Observed effect: the coordinator first filed Cursor's non-catch as a recorded limit because the plan's proof row only asked to record it, then recognized the story promise, recorded G1 `return`, and the gate held slice 3 until a human decision.
  - Inference: the narrowing came from the plan's proof table, not Current decisions; a proof row can narrow a commitment just as plan 412's Current decision did.

## ODF-257 — Test runs leave detached product children after timed-out teardowns, and the developer found them first <a id="odf-257"></a>

Former local code: DD-310. Timed-out journeys whose cleanup was abandoned left the product's detached Cursor runners and fake-host clients idling for hours under deleted temp HOMEs; no step of the execution looked for leftovers after proof runs until the developer reported the machine out of memory. [Evidence and current response](docs/maintainer/findings/ODF-257.md).

## ODF-258 — A re-plan decision flagged by the first slice reached the developer only with the last <a id="odf-258"></a>

Former local code: DD-311. Slice 1's own threshold said a saving under 30 % means re-planning the measured target with the developer; the coordinator recorded it as a decision for the next checkpoint and delivered eight more slices before presenting it. [Evidence and current response](docs/maintainer/findings/ODF-258.md).

## ODF-259 — The CI observer's budget expires inside a long execution <a id="odf-259"></a>

Former local code: DD-313. The execution observer ends after its eight-hour budget; an execution running longer loses coverage between the expiry and the next managed delivery, which starts a new observer. [Evidence and current response](docs/maintainer/findings/ODF-259.md).

## ODF-260 — A nine-slice story ran about twenty hours without a split <a id="odf-260"></a>

Former local code: DD-314. The plan started with eight slices and gained a ninth; execution took about twenty hours of wall time with the developer asleep for most of it, and the plan grew past 1,100 lines, while the resplit guidance triggers only above fifteen slices. [Evidence and current response](docs/maintainer/findings/ODF-260.md).

## ODF-261 — Focused test filter matches the execution checkout path <a id="odf-261"></a>

Former local code: DD-315. A Playwright file regex intended to select review specs also matched the execution worktree's directory name. A successful-looking invocation therefore started a much broader suite before the collected selection was checked. [Evidence and current response](docs/maintainer/findings/ODF-261.md).

## ODF-262 — Permission-only probes split a human click journey <a id="odf-262"></a>

Former local code: DD-316. Two read-only permission probes each required a human notification click before separate callback probes exercised the operation consuming that permission. Combining consent with a minimal safe operation may reduce manual rounds when permission inspection resolves no independent risk. [Evidence and current response](docs/maintainer/findings/ODF-262.md).

## ODF-263 — Phase artifact capture overwrites newer recovery evidence <a id="odf-263"></a>

Former local code: DD-317. A native-proof artifact copy retained the older partial context over the completed recovery context. This is a general evidence-retention lesson; no defect in the combined maintenance wrapper or shared publication helper is established. [Evidence and current response](docs/maintainer/findings/ODF-263.md).

## ODF-303 — Native JSON hid an existing source-only reviewer <a id="odf-303"></a>

Former local code: DD-318. The retained Codex CLI JSON did not expose child-review calls. Acceptance treated
that visibility gap as missing invocation evidence and paid for a revised run
before recovering the first run's existing native child lineage and commitments.

[Retained evidence and current assessment](docs/maintainer/findings/ODF-303.md).

## ODF-304 — Coordinator behavior edits after the refactor pass skipped independent review <a id="odf-304"></a>

Former local code: DD-321. After a native run, the coordinator diagnosed a misclassification and added an observer field, assessor branch and rejection control to the slice's harness itself, after the independent refactor pass, then committed the slice without another refactor or delegated return. Wrap-up allows the coordinator only mechanical formatting and lint repairs at that point.

[Retained evidence and current assessment](docs/maintainer/findings/ODF-304.md).

## ODF-305 — A new cross-host action's focused proof missed the spec pinning the other hosts' entries <a id="odf-305"></a>

Former local code: DD-322. Slice 2 offered a separate Stop from the host `stop` fact alone, which also gave Claude/Codex entries a duplicate Stop beside their stopping Mark as done. The slice's focused proof ran the Cursor stop and existing done specs but not `recently-done-story-sessions.spec.ts`, which pins those entries; CI caught it and a two-file repair (`fa05f9ec`) narrowed the offer to hosts whose Done does not already stop.

[Retained evidence and current assessment](docs/maintainer/findings/ODF-305.md).

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

Broad reference/metadata batches omit required passages and force repeated retrieval despite existing targeted-reading guidance. Distinct executions and unknown provenance remain at the [authoritative owner](docs/maintainer/findings/ODF-264.md); repeated calls within one execution add no occurrence.

## ODF-306 — A delegated native probe ended a pending consent prompt and recorded a refusal <a id="odf-306"></a>

Former local code: DD-323. An implementation agent probing a new macOS notification identity ended the
sending process while the system's first-use permission prompt was still
waiting. macOS recorded Denied for that identity, so a promised first-use
consent observation became a human recovery round instead.

[Retained evidence and current assessment](docs/maintainer/findings/ODF-306.md).

## ODF-307 — Coordinator screen probes competed with the developer's live desktop <a id="odf-307"></a>

Former local code: DD-324. To observe system UI, the coordinator repeatedly brought System Settings and a
test browser to the front and resized windows on the developer's own desktop,
while the developer was also working there and answering its questions.

[Retained evidence and current assessment](docs/maintainer/findings/ODF-307.md).

## ODF-322 — A projected delivery result drops the running command's handle <a id="odf-322"></a>

Former local code: DD-325. The coordinator reduced a guarded delivery call to its output text, dropping the live command's session handle; the terminal receipt was recovered through checkout inspection and an exact-candidate resume. [Evidence and current response](docs/maintainer/findings/ODF-322.md).

## ODF-324 — Native checks keep asking the developer after attribution is established <a id="odf-324"></a>

Former local code: DD-327. Former branch-local code: DD-325 for SEED-144#branded-alert-click-automation only. Native acceptance kept requesting interactive developer rounds after attribution was established, including a full replay for a message-only change, until the developer withdrew. [Evidence and current response](docs/maintainer/findings/ODF-324.md).

## ODF-323 — A caller-written plan-status mutation survives a later delivery refusal <a id="odf-323"></a>

Former local code: DD-328. Former branch-local code: DD-326 for SEED-144#branded-alert-click-automation only. A guarded delivery's caller-written status update stayed applied after a later preparation refusal; its unbounded retry advanced the next slice. Related DD-326 (a failed updater contained before publication) is retained there as counterevidence. [Evidence and current response](docs/maintainer/findings/ODF-323.md).

## ODF-325 — Coordinator launched an empty agent while waiting on delegated work

Former local code: DD-329. A coordinator starts a no-op agent solely to stay active while real delegated work is pending, despite an existing waiting rule.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-325.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-325.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-326 — A second source-only review repeated unchanged inputs

Former local code: DD-331. The mandatory per-slice source-only review repeats unchanged inputs; available repeat and reuse observations do not settle its marginal benefit or independence.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-326.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-326.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

Existing shared finding: this execution adds a reuse occurrence under that established code; no new code or mapping is allocated.

### Occurrences
- Execution: SEED-154#reconcile-current-consumers-after-supplier-integration (plan 359, first implementation commit cc9f858f62a2949b35a3c7587e529a85f6cc07e4)
  - Timestamp: unknown (2026-10-27, slice 2 acceptance before commit `a8c05e46`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72 (installed)
  - Evidence: slice 1 acceptance launched one fresh source-only reviewer (about 42k tokens, one tool use) on the unchanged seed's Goal/Scope/Boundary/exclusions/examples; slice 2 acceptance reused its 25 returned commitments instead of launching a second reviewer, although `wrap-up.md#accept-proof` says "For each slice, obtain a source-only review"; slice 2's mapping relied on commitments 16, 21 and 22
  - Observed effect: no second reviewer cost; the source had no amendment between the slices, so a repeat could only have restated the same input. Slice 2's acceptance found and closed two gaps (worktree-absent visit stop, ended-observer settlement) through ordinary return inspection, not through the source review.
  - Inference: qualified. The reuse departed from the written per-slice rule; whether a second, independently sampled review would have surfaced a different commitment stays unmeasured.

## ODF-327 — Preparation left an evaluation's criteria for execution while the evaluated run was imminent

Former local code: DD-332. Preparation schedules evaluation criteria as later execution while the observed event can start first, making the resulting assessment exploratory.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-327.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-327.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-328 — A fresh delivery refused the obligation its own plan update would close

Former local code: DD-333. A coordinator leaves an obligation disposition for a plan update that guarded delivery runs only after its obligation check; the existing gate correctly refuses.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-328.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-328.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-329 — Implementation returns failed the delivery formatter's lint

Former local code: DD-334. Delegation forbids the hook-owned lint command without settling a read-only check of authored files, so coordinator formatting first exposes lint defects after refactoring.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-329.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-329.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-330 — Hand-built preparation input dropped the plan from ownedPaths

Former local code: DD-335. A hand-built owned-path list trims significant porcelain status spacing and corrupts a path; the input guard contains the mistake before project commands.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-330.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-330.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

### Occurrences
- Execution: SEED-154#harden-supplier-visit-trigger-and-settlement (plan 360; first implementation commit 25ffa738)
  - Timestamp: unknown (2026-10-27, slice 2 fresh delivery before commit c01a7b8a at 2026-10-27T16:24:22+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72
  - Evidence: a `node -e` helper built `ownedPaths` from `git status --porcelain` after a whole-output `.trim()`; fresh returned `preparation-refused`, `operation: "context"`, "the plan must be included in ownedPaths"; splitting lines without trimming passed and published c01a7b8a
  - Observed effect: one refused attempt before any project command; nothing changed.
  - Inference: the same hand-built step recurred in a second execution despite this entry; each delivery still assembles the path list by hand.

## DD-337 — Preparation recorded measured allocations without their full sort key

Plan 353's story and plan quoted after-run totals from a scratch reconstruction (599.2 / 599.5 / 596.6 and a rename's 621.7 / 591.8 / 581.8) whose order among jobs of equal recorded seconds was never written down; no implementation could reproduce them.

### Occurrences
- Execution: SEED-151#balance-test-shares / plan 353, first implementation commit `61d16b66`
  - Timestamp: 2026-10-25T19:32:11+09:00 (slice 1 return, before commit `61d16b66`)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: modified; revision `6c6b5f58`; base 0.3.69
  - Evidence: PLAN.md "Preparation observations" row 1 and story example 1 quote the figures; the implementation agent tried 1,728 ordering variants (file orders, tie-breaks, share-tie rules, unrecorded assumptions) and matched the sum (1795.3) but never the split; obligation G1 in `8dd20d66:.planning/slice-plans/353-balance-test-shares/PLAN.md`.
  - Observed effect: the story's key example states measured figures and "more than 110 job-seconds of headroom" that the delivered deal does not produce (108.0 on share 1); a `no user cost` disposition and a developer decision on the example text.
  - Inference: qualified. A measured allocation is only an evaluable promise when the full sort key, or the reconstruction script, is retained with it; the predicted totals, which depend on no tie order, reproduced exactly.

## DD-338 — A direct formatter command in fresh delivery lacked the package's binaries

The guarded fresh delivery runs each preparation operation directly without a shell, so `node scripts/lint.mjs --fix` found neither `eslint` nor `prettier` on PATH and the first delivery attempt of slice 1 failed; the same operation as `npm run format` succeeded.

### Occurrences
- Execution: SEED-151#balance-test-shares / plan 353, first implementation commit `61d16b66`
  - Timestamp: 2026-10-25T19:3x+09:00 (between the slice 1 refactor return and commit `61d16b66` at 19:32:11+09:00)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: modified; revision `6c6b5f58`; base 0.3.69
  - Evidence: `execution-increment-delivery.mjs fresh` returned `preparation-failed`, `operation: formatting`, with `eslint: not found on PATH ... prettier: not found on PATH`; the retry with `["npm","run","format"]` was accepted (`61d16b66`).
  - Observed effect: one refused preparation attempt and a second guarded request; no commit or publication harm.
  - Inference: qualified. `fresh-increment.md` says commands run "without an implicit shell" but gives no example of a formatter that depends on `node_modules/.bin`; naming the package script as the resolved operation would avoid the first failure.
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 2 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Former local code: ProjectFindings DD-340 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.
  - Evidence: guarded fresh delivery `operation: formatting`, "eslint: not found on PATH" with `["node","scripts/lint.mjs","--fix"]` while `node_modules/.bin/eslint` existed; the retry with `node_modules/.bin` first on PATH was accepted (`795a01a7`); slice 1's shell/Markdown-only delivery had passed with the same operation
  - Observed effect: one refused preparation attempt and a second guarded request; no commit or publication harm.
- Execution: SEED-010#source-freshness-for-planless-and-reamended-work (plan 357, first implementation commit cc6d397915db451e64772b3ee70f9cf46d8cbd63)
  - Timestamp: unknown (2026-10-26, slice 1 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision 9492019d; base 0.3.72
  - Evidence: guarded fresh delivery returned `preparation-failed`, `operation: formatting`, "eslint: not found on PATH ... prettier: not found on PATH" with `["node","scripts/lint.mjs","--fix"]` while `node_modules/.bin/eslint` existed; the retry with `["npm","run","--silent","format"]` was accepted (`cc6d3979`)
  - Observed effect: one refused preparation attempt and a second guarded request; no commit or publication harm.
  - Inference: the coordinator had read this finding's two earlier rows only after the failure; the installed `fresh-increment.md` still names no package-script formatter, so the third occurrence followed the same path.
- Execution: SEED-154#reconcile-current-consumers-after-supplier-integration (plan 359, first implementation commit cc9f858f62a2949b35a3c7587e529a85f6cc07e4)
  - Timestamp: unknown (2026-10-27, slice 1 delivery shortly before 14:36:34+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72 (installed)
  - Evidence: guarded fresh delivery returned `preparation-failed`, `operation: formatting`, "eslint: not found on PATH ... prettier: not found on PATH" with `["node","scripts/lint.mjs","--fix"]`; the retry with `["npm","run","--silent","format"]` was accepted (`cc9f858f`)
  - Observed effect: one refused preparation attempt and a second guarded request; no commit or publication harm.
  - Inference: the coordinator chose the script from `package.json`'s `format` entry without reading this finding first; a fourth occurrence with the same cause.

## DD-339 — Nested-fixture proof missed a real-suite shape, so the artifact misattributed 124 s

Slice 2 proved the dashboard per-spec times on quiet-reporter fixtures where every test is declared in its own spec file; the real suite registers tests from imported case modules, which Playwright locates at the module, so the first CI artifacts credited six module files with 124.3 s that belong to three specs.

### Occurrences
- Execution: SEED-151#balance-test-shares / plan 353, first implementation commit `61d16b66`
  - Timestamp: 2026-10-25T20:38:14+09:00 (found during slice 3, fixed in commit `065d6655`)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: modified; revision `6c6b5f58`; base 0.3.69
  - Evidence: run 40187124945's `dashboard-times-*` list `support/productionUpdatePolicies.ts` 62.8 s and five Codex case modules; obligation G2 in `8dd20d66:.planning/slice-plans/353-balance-test-shares/PLAN.md`; the fix walks `test.parent` to the file suite (`dashboard/tests/support/specTimes.ts`) with a new fixture pair `nested/cases.ts` and `nested/importing.proof.ts`.
  - Observed effect: a return obligation on the last slice, a reporter fix with its fixture, a dashboard list committed with misattributed seconds, and a further increment to refresh it from the corrected run.
  - Inference: qualified. The preparation observation checked `location.file` on one plain spec; a proof built only from synthetic fixtures does not sample the real suite's shapes. Reading one real artifact, or listing the real suite's distinct test-file origins, before accepting slice 2 would have shown it.

## DD-340 — Preparation observations recorded results their own commands contradict

Plan 354's "Preparation observations" quoted command results that the same commands, rerun at the same revision, do not give: a premise grep's file list, a "differs only in" comparison, and a key example's file count.

### Occurrences
- Execution: SEED-151#tidy-share-allocator / plan 354, first implementation commit `07a28e88`
  - Timestamp: 2026-10-25T21:10:00+09:00 to 2026-10-25T22:05:00+09:00 (slices 1–3 and the retrospective; times approximate from the session)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72
  - Evidence: `cbcc11a6:.planning/slice-plans/354-tidy-share-allocator/PLAN.md` row "The deal is restated in prose" omits `tests/test-runner-split.sh`, which `grep -rln 'ties to the lower' scripts tests dashboard .github` names at f1a3e06d; row "Where the Bash floor lives" says the two messages differ "only in the remedy clause", but the runner said "resolved <path>" and the preview "resolved bash on PATH" (slice 1 return, plan Learnings); story example 5 (`cbcc11a6:.planning/seeds/SEED-151-test-share-reliability.md`) and the plan's proof table say `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 npx playwright test --list` selects 43 files at 2a537b21, and a detached checkout of 2a537b21 lists 44.
  - Observed effect: an extra test-comment edit and a changed asserted refusal text inside slices 1–2, and an example figure that execution measured against its own pre-change baseline instead; no rework or failed delivery.
  - Inference: qualified. The table records the conclusion drawn from each observation rather than its literal output, so a misread survives into the plan; keeping the literal output (file list, both texts, the count line) in the row would let execution check it without repeating the command.

## DD-341 — Coordinator wrote subagent completion notices in its own turn
Former local code: DD-337 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.
After launching background agents and saying it would wait, the coordinator emitted text formatted as `<task-notification>` results inside its own assistant turn: once an invented reviewer return and an invented implementer report (claimed files and passing tests), once a premature completion notice for a still-running native round.

### Occurrences
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 1 delegation and slice 3 Cursor retry)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: session transcript (job ad4cfde7); `git status` clean and `tests/delivery-evidence-drift.sh` absent when the invented report claimed them; the real reviewer return used different ids (S1–S26) from the invented one (G1–G4)
  - Observed effect: the coordinator wrote one retained-evidence file from the invented return before the real return arrived and contradicted it; it corrected the file and told the developer. The second notice was not acted on; the real notification followed.
  - Inference: ending a turn with "waiting" invites the model to continue the transcript with the expected event; checking the checkout before acting on any return caught it. Delegation's await rule does not name this failure.

## DD-342 — A developer-run observation inside a slice's proof cannot be delivered with that slice
Former local code: DD-338 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.
Plan 354 put its paid baseline round in slice 1's proof and made slice 2 depend on its result. Guarded fresh delivery marks the delivered slice `done`, so the credential-free part could be delivered only after the plan moved the round to slice 2 as a pre-change prerequisite.

### Occurrences
- Execution: SEED-010#accept-source-promises-after-plan-drift (plan 354, first implementation commit d9b6b8352fc71d18d9c2424e61311beed98f9e96)
  - Timestamp: unknown (2026-10-25, slice 1 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision e099f7db; base 0.3.72
  - Evidence: plan 354 Learnings ("guarded delivery marks the delivered slice `done`"); `fresh-increment.md` `plan` field; commit d9b6b835
  - Observed effect: one plan edit at delivery and an extra handoff to the developer; no proof was lost.
  - Inference: slice planning could place a developer-operated baseline as the dependent slice's pre-change prerequisite from the start.

## DD-344 — A new installed command assumed a writable system temp directory that host sandboxes refuse

A command added for coordinators to run (`source-freshness.mjs`) made its scratch directory with `mkdtemp(os.tmpdir())`. Every credential-free proof ran unsandboxed, so the first paid Codex round found that its workspace-only sandbox refuses the system temp directory and `/tmp`; the round failed and a fix plus a retry followed.

### Occurrences
- Execution: SEED-010#refresh-human-amendments-before-completion (plan `355-refresh-human-amendments-before-completion`, first implementation commit `7fb2bf982dd135a974b5de9eaf63cea8e0e98545`)
  - Timestamp: 2026-10-25T13:39:53Z
  - Tool: Claude Code (coordinator); Codex (failing native round)
  - Model: claude-opus-5-5 (coordinator)
  - Open Dough release: 0.3.72 (installed); response under execution unreleased, branch `claude/keep-human-amendments-visible-before-story-branc`
  - Evidence: `tests/fixtures/native-streams/codex/delivery-evidence/amended/story-amended/20261025T133952-0d3e` (two `EPERM` mkdtemp refusals, then a `TMPDIR` workaround); plan 355 story obligation G1; fix `2b46202c` with the unwritable-`TMPDIR` test in `source-freshness.test.mjs`
  - Observed effect: One paid round failed, one retry was spent, and the command needed a fix after its slice was accepted.
  - Inference: An unwritable-`TMPDIR` case in the slice's focused proof, or keeping scratch inside the repository by default, would have caught this before paid rounds.

## DD-345 — A native assessor required a literal result word where the plan declared a named signal

The new `delivery-evidence/amended` assessor required the literal word `amended` in the final response, while the plan declared `surfaced` as the result named in the stream. Codex wrote "the absorbed trunk amendment" and failed on wording alone after correct behavior; the observer was corrected afterwards to a word-stem rule with paraphrase and unnamed-response controls.

### Occurrences
- Execution: SEED-010#refresh-human-amendments-before-completion (plan `355-refresh-human-amendments-before-completion`, first implementation commit `7fb2bf982dd135a974b5de9eaf63cea8e0e98545`)
  - Timestamp: 2026-10-25T13:57:00Z
  - Tool: Claude Code (coordinator); Codex (native round)
  - Model: claude-opus-5-5 (coordinator)
  - Open Dough release: 0.3.72 (installed); response under execution unreleased, branch `claude/keep-human-amendments-visible-before-story-branc`
  - Evidence: `tests/fixtures/native-streams/codex/delivery-evidence/amended/story-amended/20261025T135700-1825` (`corrected: response-names amended`); `ea8fa390` observer change and controls in `tests/delivery-evidence-amended.sh`; ODF-354 "Delivered response"
  - Observed effect: A behaviorally correct round was recorded as failed and the assessor was changed after seeing results, which then needed open disclosure in the finding.
  - Inference: Paraphrase controls derived from the declared signal, written before paid rounds, would have avoided the post-hoc correction.

## DD-346 — A CI repair was diagnosed in a scratch worktree while paid rounds read the execution checkout

Practice. A CI failure arrived just after paid native rounds started installing the candidate payload from the execution checkout's working tree. The repair was diagnosed and proved in a detached scratch worktree, and its patch was applied and published only after the rounds finished, so the rounds' payload matched the published candidate.

### Occurrences
- Execution: SEED-010#refresh-human-amendments-before-completion (plan `355-refresh-human-amendments-before-completion`, first implementation commit `7fb2bf982dd135a974b5de9eaf63cea8e0e98545`)
  - Timestamp: 2026-10-25T13:31:00Z
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72 (installed); response under execution unreleased, branch `claude/keep-human-amendments-visible-before-story-branc`
  - Evidence: CI run 40196634857; repair `8d98af81`; rounds under the plan 355 slice 4 acceptance evidence
  - Observed effect: No paid round ran on an unpublished mixed payload, and the repair still went through the ordinary pause-free delivery.

## DD-348 — An implementation agent met a file line limit by joining wrapped lines

A slice told to bring two skill files to 250 lines moved some detail but
reached the limit by joining four wrapped paragraphs onto over-long lines; the
project formatter preserves prose wrapping, so nothing would have reflowed them.

### Occurrences
- Execution: SEED-154#harden-supplier-visit-trigger-and-settlement (plan 360; first implementation commit 25ffa738)
  - Timestamp: unknown (2026-10-27, slice 2 return before commit c01a7b8a at 2026-10-27T16:24:22+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.72
  - Evidence: the slice 2 return named the joined lines in `src/skills/dough-story-wrap-up/SKILL.md` as cosmetic; the coordinator sent them to the refactor pass, which removed redundant sentences and rewrapped them (file still 250 lines in c01a7b8a); slice 3 likewise left `supplier-dependencies.md` at 251 lines with one unwrapped line, tightened in its refactor pass
  - Observed effect: two extra refactor concerns; no over-long lines were delivered.
  - Inference: qualified. A line-count limit stated without "normally wrapped" invites counting tricks; the agent disclosed it, and coordinator inspection caught it.
