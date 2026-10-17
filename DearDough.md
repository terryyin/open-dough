# DearDough Process Findings

Reviewed 2026-10-12 (Asia/Tokyo). Active shared-process findings only; released
responses under observation live in the [watch list](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/near-term-watch-list.md).
Detailed observations, original releases and qualified inferences are retained
in the linked Open Dough catalog. Unknown execution provenance remains unknown.

- Highest allocated local number: 314. Removed numbers are never reused.
- Full source recovery before this cleanup: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275 and repaired DD-283/DD-290 remain in [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

## ODF-087 — Skipped preparation gates <a id="odf-087"></a>

Former local code: DD-089. Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-087).

## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>

Former local code: DD-057. A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-059).

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration. Released response; watch start unknown. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-154).

## ODF-074 — Unverified planning premises <a id="odf-074"></a>

Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked. Open after verified later recurrence; not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-074).

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17 (slice 1 measurement) to 2026-10-18T05:11+09:00 (slice 9 record)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: the story's measured targets (half the baseline: ≤ 380 s local, ≤ 1,244 s hosted) and the plan premise row "Relocation shortens the browserless families: Hypothesis"; slice 1 measured the relocated family at −16 % and the plan's own threshold was 30 %; the hosted report-artifact analysis (plan Learnings, slice 9 Measured) puts the per-test floor over four workers at 1,790–2,045 s and the local floor near 530 s.
  - Observed effect: both time targets unmet at completion (600 s local, 2,519 s hosted on the published revision) while the count target and every behavioral promise were met; the number decision is with the developer.
  - Inference: the targets were set from the baseline before anyone measured where the time went; a one-run profile by family (which the proof record already supports) would have set reachable numbers or a different story shape.

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop. Open after verified later recurrence; not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127. An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-157).

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17 (slices 2 and 3)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310 Learnings: the preparation inventory of browserless specs used a `page` token search (158 files); slice 2 found 14 more by a code-level scan and slice 3 eight more, while two scan hits were page journeys and stayed.
  - Observed effect: two in-execution inventory corrections; no coverage lost; the relocation counts in the plan changed twice.
  - Inference: a token search for a concept (opens a page) under-counts when the token lives only in comments or strings; the scan that strips comments and strings plus a read of each hit was needed and is now the recorded method.

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-158).

### Occurrences
- Execution: `SEED-135#reach-final-report-done-choices-on-short-phone` / plan 303, first implementation `08a5e1b1c377cc6bff62201f119cb1f674cd9f36`
  - Timestamp: unknown (2026-10-14 JST, startup before implementation delegation).
  - Tool: Codex
  - Open Dough release: 0.3.60 (checkout-bound installed `dough-update/VERSION`; guidance unchanged).
  - Evidence: coordinator startup tool outputs report 15,386 and 21,805 tokens with truncation; subsequent targeted reads recover delegation/decisions (6,035 tokens) and Codex runtime/publication (7,398 tokens). An established start already supplied claim/workspace identity; managed delivery later reused the observer and published without reconciliation.
  - Observed effect: broad startup reference batches required additional retrieval before one report-presentation slice could be delegated.
  - Inference: both the required reference surface and this coordinator's oversized batches contributed; existing targeted-retrieval guidance was not applied consistently. These output counts are not total token cost, and this occurrence does not prove the references or independent checks lack value.

## ODF-106 — Colliding plan numbers <a id="odf-106"></a>

Former local code: DD-155. Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-106).

## ODF-141 — Fixed refactor cost on small accepted slices <a id="odf-141"></a>

Former local code: DD-192. Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-141).

### Occurrences
- Execution: `SEED-133#operate-dashboard-from-mobile-browser` / plan306, first implementation `1a843c3efbcd97a068c5c04fe94da007d6a1144e`
  - Timestamp: unknown (2026-10-13, review-reader CI repair before `27fa55b5`).
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed VERSION at established claim `db0dfb07`; installed guidance unchanged throughout execution).
  - Evidence: `refactor_ci_review_reader` returned “none — already clean” and `REFACTOR COMPLETE` for the one-helper redundant-cap repair, reporting approximately five active minutes, no edits and no proof reruns; accepted repair `27fa55b5` retains its proof.
  - Observed effect: one mandatory independent handoff produced no additional changes. Other slice refactors consolidated controls, native input and complete test journeys.
  - Inference: reported handoff cost supports investigating proportionality for established small repairs; it does not establish that independent review lacked value. No token cost or savings is measured.

- Execution: `SEED-135#reach-final-report-done-choices-on-short-phone` / plan 303, first implementation `08a5e1b1c377cc6bff62201f119cb1f674cd9f36`
  - Timestamp: unknown (2026-10-14 JST, between accepted slice proof and first implementation commit).
  - Tool: Codex
  - Open Dough release: 0.3.60 (checkout-bound installed `dough-update/VERSION`; guidance unchanged).
  - Evidence: `report_refactor` returned “none — already clean” and `REFACTOR COMPLETE`, approximately six active minutes, no edits and no verification reruns. It reviewed the local report wrapper/CSS, documentation, browser journeys and supporting fixture/geometry modules; unchanged proof was reused.
  - Observed effect: the required fresh independent handoff produced no further edits for this accepted presentation repair.
  - Inference: the agent's elapsed estimate supports the existing proportionality question; neither measured token cost nor absence of review value is established. Coordinator acceptance had already caught and returned the root-scroll experiment's resize-edge regression.

## ODF-204 — Interrupted delegated agent keeps running and publishes <a id="odf-204"></a>

Former local code: DD-215. After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-204).

## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>

Former local code: DD-217. Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-205).

## ODF-152 — File-size gate conflicts with approved intermediate scope <a id="odf-152"></a>

Former local code: DD-219. An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-152).

### Occurrences

- Execution: `SEED-132#check-gap-dispositions-through-guided-paths` / plan 303, first implementation `f91a8dbf729f0094a54fdceefbc4e86385063d82`. Story/proof recoverable at `74f8d3b9e6b5dd81b65d6253f4fc524cc6cd99fe:.planning/slice-plans/303-check-gap-dispositions-through-guided-paths/PLAN.md`.
  - Timestamp: unknown (2026-10-12, initial refactor handoff before delivery).
  - Tool: Codex.
  - Open Dough release: 0.3.60 (installed `dough-update/VERSION` at established claim `f81dffb2`).
  - Evidence: `refactor_gap_acceptance` found no conceptual candidate, then stopped on `refactor-checks.md`'s 250-line rule: finding catalog 3,411 lines, active plan 377. The human rejected an exception and required conciseness without information loss. Delivered catalog: 169-line index and 72 complete records; plan condensed with its distinct proof/context retained. The inspected comparison preserved every record token/order, 194 external links, seven equivalent relative destinations and 72 CommonMark headings/anchors; all changed files meet the cap.
  - Observed effect: one human decision, resumed refactor, 72 evidence-file extractions and additional preservation checks. Refactor reported about 15 active minutes across both passes; coordinator cost was not measured. Existing runtime proof was reused without reruns.
  - Inference: the numeric gate expanded this guidance change's record structure. The final reorganization was explicitly authorized and preserved information; this observation does not dispute that choice or change the rule.

- Execution: SEED-132#prove-indirect-consumers-before-acceptance / plan 304; first implementation commit `d8184b02bbfd855ff3838de6ffa6a0ed5c2a868b`
  - Timestamp: unknown (2026-10-12 session)
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed refactor-checks at established claim `d3058caf` matches the release blob; installed copies unchanged)
  - Evidence: `refactor_consumer_proof` returned `REFACTOR JIDOKA STOP` for the 3,380-line finding catalog's four-line ODF-150 update after finding the runtime rule coherent; `cfdca05274dc9845b7f9666e35a0ad68ce6ec73b:.planning/slice-plans/304-prove-indirect-consumers/PLAN.md` retains the catalog exception after cleanup. The developer explicitly granted that exception and instructed execution to proceed; the agent then returned `REFACTOR COMPLETE` without another review or test run.
  - Observed effect: delivery paused for human judgment and required a follow-up handoff. The new seed section was shortened from 253 to 250 lines; the canonical catalog stayed intact.
  - Inference: the unconditional size gate reaches intentional evidence collections as well as product modules. No timing precision or broader file-size-policy conclusion is claimed.

- Execution: `SEED-066#cursor-trust-prompt-at-session-start` / plan 305, first implementation `12feacafe168c84fe73faecbea31d0ca9c83f6e3`
  - Timestamp: unknown (2026-10-14, slice 3 records refactor before `22155428`).
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed VERSION at claim `310f729d`; execution/refactor guidance unchanged).
  - Evidence: `22155428:.planning/slice-plans/301-unattached-session-native-observation/PLAN.md` and its three linked evidence files; fresh `refactor3` returned `REFACTOR COMPLETE`, preserving historical observations verbatim and checking 29 relative links.
  - Observed effect: recording one native correction in the already oversized plan required extracting preflight, auto-land and review history into three files; no product or proof changes. Refactor reported approximately eight active minutes.
  - Inference: the unconditional changed-file cap reaches canonical evidence records. Review proportionality for these records; no broader cost or policy change is established.

## ODF-209 — Concurrent CI reproduction overloads slice proof <a id="odf-209"></a>

Former local code: DD-221. Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-209).

### Occurrences

- Execution: `SEED-066#cursor-trust-prompt-at-session-start` / plan 305, first implementation `12feacafe168c84fe73faecbea31d0ca9c83f6e3`
  - Timestamp: 2026-10-13T22:36:59.365Z (failed whole-dashboard proof terminal receipt).
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed VERSION at claim `310f729d`; guidance unchanged).
  - Evidence: `4bd36244a6eb0d9227500b488d19dd58aec202b6:.planning/slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md`, slice 2; clean/controlled strict proof receipts and retained trace `dashboard/test-results/2026-10-13T22-20-12.969Z`; 1,624 passed and unchanged `agent-launch-card-sessions.spec.ts:59` exhausted its 30s body while shell proof overlapped. Host snapshot: 16 logical CPUs, load averages 31.48/42.20/26.84, about 0.2 GiB free memory. Unchanged focused body passed in 10.1s; the one controlled four-worker whole run passed all 1,625, same body 5.876s.
  - Observed effect: a failed 1,006.404s whole run required diagnosis and a further 1,092.290s controlled whole proof; no deadline/helper changes or automatic retries until green.
  - Inference: this occurrence uses concurrent local shell proof, not CI repair, but supports the same shared-host overload mechanism. Causality remains qualified; isolated success alone did not waive failed whole proof. Coordinate heavy verification before starting it.

## ODF-210 — Removal proof omits an existing user capability <a id="odf-210"></a>

Former local code: DD-234. A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-210).

## ODF-211 — Admission is ambiguous for an unlanded story correction <a id="odf-211"></a>

Former local code: DD-237. An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-211).

## ODF-217 — Unverified refactor proof effects <a id="odf-217"></a>

Former local code: DD-239. Former local code: DD-248. A refactor misclassifies or omits the proof effects of a change, leaving reached consumers unrun; some returns incorrectly call changed behavior identical or type-only. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-217).

## ODF-218 — Formatting invalidates a pre-format size check <a id="odf-218"></a>

Former local code: DD-241. The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-218).

### Occurrences

- Execution: `SEED-066#cursor-trust-prompt-at-session-start` / plan 305, first implementation `12feacafe168c84fe73faecbea31d0ca9c83f6e3`
  - Timestamp: unknown (2026-10-14, slice 1 formatter/refactor follow-up before `12feacaf`).
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed VERSION at claim `310f729d`; guidance unchanged).
  - Evidence: coordinator's first `npm run format` normalized braced void callbacks after the independent size check; resumed `refactor1` extracted `LiveTerminalClientOptions` to `dashboard/server/liveTerminalClientOptions.ts` to restore the 250-line bound. The formatter also found an unused type import, which was removed; final format/typecheck passed.
  - Observed effect: one resumed refactor handoff and a formatter repeat before publication; accepted behavior proof remained applicable.
  - Inference: formatted size should be anticipated with headroom before the downstream formatter. The unused-import repair is a separate mechanical finding, not attributed to the size mismatch; no token cost is measured.

## ODF-219 — Background coordinator implements outside the local-slice condition <a id="odf-219"></a>

Former local code: DD-245. Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-219).

## ODF-100 — Masked formatter failure <a id="odf-100"></a>

Former local code: DD-251 (plans 264 and 271 only). A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-100).

## ODF-097 — Publishing after a failed check <a id="odf-097"></a>

Former local code: DD-251 (plan 273 only). A failed formatter or verification result is visible but does not gate the next commit or publication step. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-097).

### Occurrences

- Execution: SEED-132#prove-indirect-consumers-before-acceptance / plan 304; first implementation commit `d8184b02bbfd855ff3838de6ffa6a0ed5c2a868b`
  - Timestamp: unknown (2026-10-12 session)
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed workflow at `d3058caf`; source guidance changed separately)
  - Evidence: the coordinator chained staged-stat, `git diff --cached --check` and agent commit in one shell invocation. The check reported `PROOF.md:90: new blank line at EOF`, but the invocation continued and committed unpublished `3509dd53827797bd3da658a15da002a3def8c193`. The coordinator removed the extra blank line, observed a separately gated passing staged check and amended to `d8184b02` before publication.
  - Observed effect: one avoidable local amend; no failing whitespace candidate reached the remote.
  - Inference: sequential orchestration must check each validation's exit status before committing. This is a local failed-check gate recurrence, not a remote publication defect.

## ODF-222 — Post-commit managed delivery stalls at an unknown stage <a id="odf-222"></a>

Former local code: DD-253 (Cursor plan 273 only). Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-222).

## ODF-184 — Unbounded Git transport stalls managed delivery <a id="odf-184"></a>

Former local code: DD-253 (Claude Code plan 274 only). An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished. Released response; watch start unknown. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-184).

## ODF-220 — Code-level planning findings become stale on trunk <a id="odf-220"></a>

Former local code: DD-254. Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-220).

## ODF-221 — CI repair misses a sibling with the diagnosed cause <a id="odf-221"></a>

Former local code: DD-255. A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-221).

## ODF-224 — Native replay changes the retained acceptance checkpoint <a id="odf-224"></a>

Former local code: DD-258. A native acceptance replay constructs a fresh current-slice checkpoint instead of the historical accepted checkpoint and omits later ownership or preserved constraints, so the paid run exercises a different decision. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-224).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario. Queued, not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-150).

### Occurrences

- Execution: SEED-132#accept-indirect-consumer-proof-natively / plan 306; first implementation commit `ef69d8d588d972ed5321488632e60d5fae1c2784`
  - Timestamp: unknown (2026-10-12)
  - Tool: Codex
  - Open Dough release: unknown; coordinator used the established checkout's installed guidance.
  - Evidence: CI `38212557255`, attempt 1, failed `tests/native-stream-replay.sh` and `tests/native-assessor-counterexample-guard.sh` after the selected `tests/git-publication-native.sh` passed. Both guards scan new native test support. Repair `ccd70eaecdf324b8fb5db71ca01d92ebeed089fe` registered the exact host-shape writer and removed an ignored-input assessor rejection loop; all three suites then passed.
  - Observed effect: slice 2 paused, its unfinished work was saved/restored through the CI repair operation, and one repair publication was required.
  - Inference: proof selection omitted repository-wide test-support guards consuming the new fixture. This is a coordinator execution miss, separate from the candidate guidance's completed native acceptance; it does not restart ODF-150's failed watch.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>

Former local code: DD-260. Repair quiescence checks only writers, so stashing an interrupted agent’s checkout while read-only tests still observe it invalidates the proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-225).

## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>

Former local code: DD-261. A reported GitHub transport failure ends observation and leaves later revisions without notification coverage. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-121).

## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>

Former local code: DD-262. A focused proof overrides a configured reporter that owns failure policy, making local passing assertions insufficient evidence for the project’s actual verdict. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-226).

## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>

Former local code: DD-263. A coordinator explicitly requests a temporary reproduction to delete, so product repairs return without a permanent regression test and require another delegation round. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-227).

## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>

Former local code: DD-264. A long repeated full-suite probe starts and continues on an overloaded shared host without checking load or swap, consuming hours without completing its planned evidence. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-228).

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17T15:16+09:00 to 2026-10-17T19:36+09:00 (four whole-suite attempts)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310, slices 3 and 4 accepted-proof paragraphs and the Learnings entry on load-sensitive tests: whole dashboard runs at eight workers under load averages of 25–257 from other work (1,390–1,485 of 1,516 passed, the rest timeouts in untouched journeys), two by the implementation agent and two by the coordinator, before the coordinator moved local proof to four workers with failed-subset reruns and CI as the suite verdict (plan Current decisions).
  - Observed effect: about four hours of whole-suite time without a green local run; targeted evidence and the twelve-shard CI run carried the acceptance; sixteen idle Cursor runners from the killed runs were found later.
  - Inference: qualified. Neither the execution guidance nor the delegation briefs stated a local-proof policy for a shared host; the coordinator set one only after the loss. A load check before a long proof and a reduced-worker default on shared machines would have saved most of it.

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. An interrupted Cursor implementation Task leaves edits but no agent return; the coordinator must reconstruct proof and acceptance from the checkout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-229).

## ODF-230 — Planned proof relies on a forbidden shared installation <a id="odf-230"></a>

Former local code: DD-266. Planning settles proof through a temporary mutable dependency link even though execution setup forbids linking another checkout’s installation. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-230).

## ODF-231 — Setup gate misses the project’s exact runtime pin <a id="odf-231"></a>

Former local code: DD-267. Readiness resolves package-lock installation and typecheck but omits the project’s runtime pin and authoritative setup checker, allowing all delivery on a different runtime. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-231).

## ODF-187 — Planned observations cannot detect regressions <a id="odf-187"></a>

Former local code: DD-268. Planning prescribes an observation whose claimed discrimination was reasoned rather than demonstrated; executing the proposed proof can pass on the unfixed behavior or conflict with the project’s proof policy. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-187).

## ODF-232 — Acceptance publishes an explicitly unobserved host fact <a id="odf-232"></a>

Former local code: DD-270. A return explicitly reports native host behavior unobserved, yet acceptance publishes that behavior as factual guidance and records only pending native evidence. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-232).

## ODF-233 — A plan forbids the representation its promised behavior needs <a id="odf-233"></a>

Former local code: DD-272. A correction’s boundary forbids new record/schema data while its behavior requires a fact the existing entrypoint or record does not supply, leaving a background coordinator to reinterpret scope. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-233).

## ODF-234 — Journey acceptance omits the next state its own guidance promises <a id="odf-234"></a>

Former local code: DD-273. Acceptance proves a correction’s first successful rerun but omits subsequent or adjacent states produced by the same journey, including explicitly listed untested record states. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-234).

## ODF-223 — A gap disposition substitutes reasoning for its actual guided path <a id="odf-223"></a>

Former local code: DD-277. Structured story obligations are marked no user cost or proved from a return’s narrow explanation or a helper’s behavior without tracing/running the paths the published guidance directs into that state. Queued, not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-223).

## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed <a id="odf-235"></a>

Former local code: DD-281. A slice changes a rebuildable candidate into irreplaceable hand-resolved work but does not trace existing failure exits that abandon it, dropping that resolution to the reflog. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-235).

## ODF-236 — Refactoring removes a deliberate caller behavior difference <a id="odf-236"></a>

Former local code: DD-286. A refactor deletes a caller override to unify a rule despite knowing it changes that caller’s preserved edge behavior, reporting the choice after editing instead of preserving it. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-236).

## ODF-237 — Unattached launch planning assumes an incompatible capture contract <a id="odf-237"></a>

Former local code: DD-289. Planning promises landing context for an unattached launch without observing that the capture schema and admission path require a story identity. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-237).

<a id="odf-238"></a>

## ODF-238 — A planned native proof depends on a future release <a id="dd-288"></a>

Former local code: DD-288. A story’s final paid native observation requires installed skills available only in a release after that story lands, so its starting state cannot exist within the planned execution. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-238).
The observation follow-up completed on 2026-10-14 (`9995c313ad57a9627a1f4bfde9a145adf387cca0:.planning/slice-plans/301-unattached-session-native-observation/PLAN.md`); it does not resolve the general planning lesson.

## DD-292 — Refactor reruns unchanged consumer proof
A refactor repeated the accepted thirty-spec terminal consumer command although only a subset of its observations moved. Existing guidance requires reusing proof whose boundaries remain unchanged.
### Occurrences
- Execution: `SEED-133#operate-dashboard-from-mobile-browser` / plan306, first implementation `1a843c3efbcd97a068c5c04fe94da007d6a1144e`
  - Timestamp: unknown (2026-10-12–13, slice4 refactor before `65a03c49`).
  - Tool: Codex
  - Open Dough release: 0.3.60 (installed VERSION at `db0dfb07`; installed guidance unchanged).
  - Evidence: `866f49cc:.planning/slice-plans/306-mobile-dashboard/PLAN.md`, slice4 independent-refactor paragraph and literal thirty-file command; the retained coordinator record states that the run started before the invalidated selection was narrowed.
  - Observed effect: changed gesture/observation proof passed, but unaffected consumers also ran again. The excess run was recorded as a deviation, not a new acceptance gate.
  - Inference: preserve the accepted command as evidence, and select invalidated consumers before starting verification. Avoidable elapsed time and token cost were not measured; one execution establishes no general rate.

## DD-293 — Whole-suite proof runs before the refactor that invalidates it
An implementation agent ran the changed surface's whole suite before the independent refactor pass, and the refactor then moved the measured code, so the suite had to run again on the final state.
### Occurrences
- Execution: `SEED-135#read-direction-after-phone-session-start` / plan 302, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: unknown (2026-10-13, before the slice commit at 2026-10-13T20:42+09:00).
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.60; installed guidance provenance not checked).
  - Evidence: `dd2e25b59563d02bdbe4f484d98ccd4c113b6339:.planning/slice-plans/302-keep-direction-readable-after-phone-session-start/PLAN.md`, accepted-proof paragraph; implementation return "1607 passed, 0 failed, 13.6 min"; refactor return moving the row rules to `dashboard/src/project-actions.css` for the 250-line check and noting the suite result "predates the stylesheet move"; coordinator rerun 14.4 min.
  - Observed effect: two whole dashboard suite runs, about 28 minutes, for one stylesheet slice. The delegation brief bounded the suite to "a few minutes" and the agent ran it anyway.
  - Inference: qualified. A file-size split is foreseeable from the changed file's length before delegation; running the whole suite once, after refactoring, would have covered both. One execution establishes no rate.

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17 (slices 1–4) and 2026-10-18 (slices 5–7)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: delegation briefs for slices 1–8 asked the implementation agent for the whole dashboard suite before the refactor pass; the coordinator then ran it again on the formatted final state after each pass (plan accepted-proof paragraphs name both runs for slices 1, 2, 5, 6 and 7; slices 3 and 4 add coordinator runs before and after the refactor).
  - Observed effect: at least eight whole-suite runs of 15–25 minutes beyond the one per slice the final state needs, on a machine the developer reported as short of memory.
  - Inference: qualified. Under the load conditions some repeats were needed to get any green, but the brief's pre-refactor whole-suite requirement doubled the quiet-machine cases; one whole run after the refactor, with the implementer's proof targeted, would have sufficed.

## DD-294 — A plan's proof table omits an answer state its story scopes in
The story's required behavior named three launch answer states; the plan's proof table and slice proof named two, so the implementation return listed the third untested and the coordinator returned the slice for it.
### Occurrences
- Execution: `SEED-135#read-direction-after-phone-session-start` / plan 302, first implementation `551947dd5cebd178803f8e414a83c959f0b95113`
  - Timestamp: unknown (2026-10-13, before the slice commit at 2026-10-13T20:42+09:00).
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.60; installed guidance provenance not checked).
  - Evidence: `dd2e25b59563d02bdbe4f484d98ccd4c113b6339:.planning/seeds/SEED-135-mobile-dashboard-observed-discrepancies.md` scope "This covers the success answer, the “Starting a session…” progress answer, and Launch failed or Launch uncertain answers"; the plan's proof table at that revision naming only `launched` and `refused`; story obligations G1 and G2 in that plan.
  - Observed effect: one extra implementation round (a resumed agent, one added test, no product change) before proof acceptance.
  - Inference: qualified. The story's own proof sentence asked only for "at least one problem answer", so the plan followed it; the scope sentence and the proof sentence of one story disagreed on coverage. Cost was small.

## DD-298 — An open Story Branch execution has no guided path to queue a correction it discovers
An execution whose story must stay open found discrepancies that needed bounded corrections queued on trunk before it could finish. Its own records reach trunk only at wrap-up, and the launch's landing context is bound to its own worktree, so the coordinator improvised a second worktree and a direct publication.
### Occurrences
- Execution: `SEED-066#unattached-session-native-observation` / plan 301, claim `8f3ba27c84b7e72939da377bbd84ad201a2cecbc` (no implementation commit; records only)
  - Timestamp: unknown for the refused attempt (2026-10-13, between 12:55Z and 13:10Z); the accepted integration receipt is 2026-10-13T13:22:01Z.
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.60 (installed roots compared byte for byte with the tag that day).
  - Evidence: `eec659c4` (corrections published from worktree `queue-start-session-corrections` through `publishExecutionIncrement`); refusal text "This is not the established launch's workspace candidate and commit comparison."; retained `landing-e6bf3faa-fdb7-453e-a7c3-5ca741c9124a.json` in launch `ecba5760` reporting folder; `8d952334` (story branch integrated with the landing context after the developer asked to try again).
  - Observed effect: one refused publication before any push, one stray retained landing file, one extra developer round trip, and an unfinished story's branch merged to trunk to capture the landing.
  - Inference: qualified. Trunk Mode would not meet this; Story Branch Mode guidance names the correction requirement but not where its story and plan are prepared and landed while the reviewed story stays Taken. Related to ODF-211, which covers the opposite dependency.

## DD-299 — A story recorded ready still needs developer choices and fixtures before its first slice
The plan left "the developer names the observation project, fixture stories, models and time budget at execution setup" and was assessed ready. No configured project held a usable fixture story, so execution's first turn ended in a question and five fixture stories were authored and published mid-execution.
### Occurrences
- Execution: `SEED-066#unattached-session-native-observation` / plan 301, claim `8f3ba27c84b7e72939da377bbd84ad201a2cecbc`
  - Timestamp: unknown (2026-10-13, before the first unfinished report received 2026-10-13T10:44:15Z).
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.60
  - Evidence: `15062e44:.planning/slice-plans/301-unattached-session-native-observation/PLAN.md`, "naming one of them with its fixture stories is execution setup"; backlog listings of the five projects showing no unassigned trivial story; Lizard `0128281` (fixtures published after the developer's choice).
  - Observed effect: a blocking question before slice 1 and unplanned fixture authoring in another repository. No paid run was wasted.
  - Inference: qualified. The readiness criteria accept premises "bounded by a permitted early probe slice"; a missing starting state that only the developer can choose is not such a premise. One execution.

## DD-300 — The start command's guidance names the trunk branch but not its flag
A native session following the one-shot start instructions passed `--trunk master`, was refused with `missing target`, searched the installed script for the option name, and retried with `--target`.
### Occurrences
- Execution: `SEED-066#unattached-session-native-observation` / plan 301, slice 1 native session `8ced2fa3-4c01-41d3-89e4-1fcbc4e3a824` in the Lizard project
  - Timestamp: 2026-10-13T11:46:47Z
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.60
  - Evidence: that session's transcript: first `execution-start.mjs start … --trunk master` answered `{"ok":false,"status":"invalid-request","error":"missing target"}`; two searches; second call with `--target master` answered `prepared`. The slice 4 session on the same release read the usage text first and did not repeat it.
  - Observed effect: one refused call and two lookups, about eight seconds.
  - Inference: qualified. The skill text says "actual remote and trunk branch" and "mode (`trunk` or `story-branch`)", which invites `--trunk`. Small cost, seen once in five native sessions.

## DD-301 — Accepted proof let a test setup step perform an action the story requires of the product
A slice 3 journey made an unknown-ancestry case pass by running `git fetch origin` in the test before expecting completion. The coordinator accepted it as a covered case, although story key example 2 needs completion without anyone fetching another writer's snapshot. The limitation surfaced only when slice 5 listed it as a gap. That cost a returned slice and rewritten lifecycle cases.
### Occurrences
- Execution: `SEED-008#coalesced-ci-validation` / plan 307, first implementation `d1eda2ced0a71b56edb3e6086651ad7403ef45ba`
  - Timestamp: unknown (2026-10-14, slice 3 acceptance; caught at slice 5 acceptance on 2026-10-15)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; revision b9a2c783; base 0.3.62
  - Evidence: `d1eda2ce:src/skills/dough-execute-plan/scripts/ci-integrated-state-journey.test.mjs` "another writer's C with unknown ancestry stays unresolved until the coordinator's checkout can prove B to C" (test runs `git fetch origin`, then expects success). The slice 5 return listed "Unknown ancestry needs a fetch". The coordinator returned the slice, and `d429430a` adds the observer's objects-only fetch and no-external-fetch lifecycle cases.
  - Observed effect: one extra implementation round in slice 5 (about 34 minutes of agent time) and replacement of three lifecycle cases.
  - Inference: qualified. The proof-acceptance rule "setup supplies only the starting precondition" covers this, but the case's name framed the fetch as expected behaviour. Checking each setup action against the story's key examples would have caught it at slice 3. One execution.

## DD-304 — A slice's refactor widens a seam that a later slice of the same plan removes
In slice 2, the refactor pass moved a shared rule into the records module and re-exported it through coverage, the module whose records re-export slice 5 was planned to drop. The refactor brief carried only the current slice, so the pass could not see that plan direction. Slice 5 then repointed the added names too, and the plan's slice 5 text had to be revised.
### Occurrences
- Execution: `SEED-008#integrated-state-correction` / plan 308, first implementation `f603752339df3dc9f4865d2cabc1472b19181ae2`
  - Timestamp: unknown (2026-10-15, slice 2 refactor before the slice 2 commit at 2026-10-15T23:19:21+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout VERSION 0.3.62; installed guidance provenance not checked)
  - Evidence: `1d9239c2` (`ci-mailbox-revision-coverage.mjs` re-exports `effectiveRevisionState` and `revisionVerdicts`); `1d9239c2:.planning/slice-plans/308-integrated-state-correction/PLAN.md` slice 5 bullet "Repoint the new `effectiveRevisionState` and `revisionVerdicts` imports"; `7740842a` (re-export removed).
  - Observed effect: two extra names to repoint and one plan-text revision. No rework of behaviour and no failed proof.
  - Inference: qualified. The cost was small here. A refactor delegation that names later slices touching the same module seam could place new names at their planned home directly. One execution.


## DD-305 — Managed delivery accepts a `--repo` that does not match the workspace's remote
The coordinator passed `--repo nerds-odd-e/open-dough` for a checkout whose `origin` is `terryyin/open-dough`. It had inferred the repository from the other project in the same task. `deliver` published to `origin` and attached an observer for the named repository. That observer then reported `CI_MONITOR_UNAVAILABLE` (HTTP 404 on `ci.yml`). Nothing compared the supplied repository with the remote the push used.
### Occurrences
- Execution: `SEED-008#donut-coalesced-ci-adoption` / plan 309, first related commit `341733adf0bcdf424699232a062c020b3686b122`
  - Timestamp: unknown (2026-10-16 JST, first slice delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63 (installed in this checkout at execution)
  - Evidence: deliver receipt for `341733ad` with observer `watch-IEgYbN`, then `CI_MONITOR_UNAVAILABLE` naming `repos/nerds-odd-e/open-dough/actions/workflows/ci.yml` HTTP 404; `git remote get-url origin` = `git@github.com:terryyin/open-dough.git`.
  - Observed effect: slice 1's publication was unobserved. The coordinator stopped that observer, and later deliveries with the right repo attached normally.
  - Inference: qualified. The coordinator made the error. A remote/repo consistency check in `deliver` would turn it into an immediate refusal instead of lost coverage. Cost here was small, because the commit held plan records only.

## DD-306 — A `needs-validation` rerun names no base, and the original base replays another writer's commits
After another writer pushed C, D and E, `deliver` for the coordinator's T2 rebased onto E and returned `needs-validation`. That receipt carried `previouslyPublishedBase` (the original T) and `suffixBase` (E). The coordinator reran with the original base and `--validated-candidate`. The replay then picked the other writer's C, D and E, stopped with `conflict`, and left an interactive rebase in the workspace. Rerunning with `suffixBase` as the base published at once. Neither the receipt nor the guidance says which base the rerun takes. "Use the latest candidate SHA after a replay" covers only the candidate.
### Occurrences
- Execution: `SEED-008#donut-coalesced-ci-adoption` / plan 309, first related commit `341733adf0bcdf424699232a062c020b3686b122`
  - Timestamp: 2026-10-15T23:19Z (approximately, after E's run ended at 23:18:02Z)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63 (installed in nerds-odd-e/doughnut at `7178e92d04`)
  - Evidence: `f0f40bb0:.planning/slice-plans/309-donut-coalesced-ci-adoption/PLAN.md` Current decisions, the "After a `needs-validation` reconciliation" bullet; T2 candidate `7c90f37f72` on `eeab81f7fa`.
  - Observed effect: one conflicting replay and a manual `git rebase --abort` in a proof-owned worktree. No publication was lost.
  - Inference: the same trap would hit any Story Branch execution whose branch receives another writer's commits. One execution.

## DD-307 — A plan's proof mechanics rested on unchecked Git and runtime properties
Plan 309's preparation observed the provider and the readers, but not the mechanics its own proof steps assumed. Execution disproved three of them:
- A second Donut worktree would lack C's objects. Worktrees share one object store, so a `git clone --shared` replaced it.
- Creating the proof refs from the slice 1 commit would start no run. Any new ref holding that commit starts one, so an empty `[skip ci]` commit opened them instead.
- `complete-revision` could be invoked for B and then for T and T2. It shuts its observer down, so B used the read-only `await-revision`.

Each was caught before a push, at no paid cost. Each still needed an in-execution design decision that a cheap preparation check (a `git worktree` object probe, the GitHub new-branch path rule, the `completeRevision` source) would have settled.
### Occurrences
- Execution: `SEED-008#donut-coalesced-ci-adoption` / plan 309, first related commit `341733adf0bcdf424699232a062c020b3686b122`
  - Timestamp: unknown (2026-10-16 JST, slice 2 setup)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63
  - Evidence: `f0f40bb0:.planning/slice-plans/309-donut-coalesced-ci-adoption/PLAN.md` slice 2 text ("second isolated Donut worktree", "invoke `complete-revision` for B") against its Current decisions for slice 2.
  - Observed effect: three mid-execution adaptations, recorded in that plan. None changed the story's promises.
  - Inference: qualified. Planning for live probes would gain from checking each mechanical step's premise with one local observation, the way the plan already did for provider behavior.

## DD-308 — Slice acceptance follows a plan that narrows a story key example
The plan's design said a record assessed before the change "whose dependency state changed since review keeps `true`", while the story's key example 7 says only a supplier's resolution leaves no "Changed since readiness review". The slice was implemented, tested and accepted against the plan's sentence; the retrospective's outcome review found the contradiction. The same execution closed gap G1 as "no user cost" by citing a plan decision, although the story's "shared wording" clause covers it.
### Occurrences
- Execution: `SEED-138#compute-execution-readiness` / plan 311, first related commit `7aafbcb14dbc82d7bf88fd68570aff381c556dd2`
  - Timestamp: unknown (2026-10-17 JST, slice 3 acceptance before `2f13a3e0`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63
  - Evidence: `2f56bd2a:.planning/slice-plans/311-compute-execution-readiness/PLAN.md` Design "Readiness basis" bullet and slice 3 proof ("`true` once its dependency state changes"); the seed's key example 7; test "a record reviewed over the dependency fence as written stays accurate" in `tests/support/story-dependencies.test.mjs`; story obligation G1.
  - Observed effect: a correction story and plan for legacy records and assessment wording after all four slices were delivered.
  - Inference: qualified. Acceptance compared the return to the plan's proof; rereading each key example the slice owns against the accepted behavior would have caught it before delivery. One execution.

## DD-309 — The per-slice formatter rewrites the whole repository
Slice delivery asks for the project's selective formatting command; this project's `npm run format` (`scripts/lint.mjs --fix`) lists every tracked and untracked file and runs ESLint, Prettier and shell formatting over all of them, so a docs-only slice pays the full cost.
### Occurrences
- Execution: `SEED-138#compute-execution-readiness` / plan 311, first related commit `7aafbcb14dbc82d7bf88fd68570aff381c556dd2`
  - Timestamp: unknown (2026-10-17 JST, each of the four slice deliveries)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.63
  - Evidence: `scripts/lint.mjs` file listing (`git ls-files --cached --others --exclude-standard` unless `--staged`); coordinator format runs exceeded 300 s (slices 1 and 3) and 600 s (slice 4, five Markdown files) at load averages near 100 to 120.
  - Observed effect: roughly 5 to 10 minutes of formatter time per slice, four times, with the coordinator idle.
  - Inference: qualified. Machine load inflated the cost; a changed-files mode, like the hook's `--staged` check, would bound it. Unloaded duration not measured.

## DD-310 — Test runs leave detached product children after timed-out teardowns, and the developer found them first
Timed-out journeys whose cleanup was abandoned left the product's detached Cursor runners and fake-host clients idling for hours under deleted temp HOMEs; no step of the execution looked for leftovers after proof runs until the developer reported the machine out of memory.

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17T22:24+09:00 (developer report; leftovers from runs since about 14:28+09:00)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: the developer's message naming PIDs 225, 1381, 5054, 5666 and 22237 with deleted working directories and 46 of 48 GB in use; the coordinator's earlier removal of sixteen `runnerMain.ts` processes under the worktree; plan 310 slice 5 (added that day as the story's acceptance criterion) and its proof: `support/runProcesses.ts`, the global-teardown sweep that fails a run naming survivors, `publishedMainFixture.cleanup` stopping its runner, `boundary/run-processes.spec.ts`.
  - Observed effect: a sluggish shared machine for hours; one unplanned slice; after it, every whole run ended with nothing of the run surviving (plan slices 5–9).
  - Inference: qualified. Execution guidance has a process-group cleanup contract for the suite but no post-run leftover check in delegation or acceptance; the project now enforces it inside the suite, and the coordinator added a `pgrep` check to every later brief. A general practice: after any long proof on a shared host, list the processes the run owned.

## DD-311 — A re-plan decision flagged by the first slice reached the developer only with the last
Slice 1's own threshold said a saving under 30 % means re-planning the measured target with the developer; the coordinator recorded it as a decision for the next checkpoint and delivered eight more slices before presenting it.

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17T11:5x+09:00 (slice 1 return) to 2026-10-18T05:3x+09:00 (slice 9 record)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310 Learnings, first entry (−16 % against the 30 % threshold, "Decision for Terry at the next checkpoint, not blocking slices 2–7") and Current decisions "Decision for Terry (time targets)" written with slice 9; the developer was present mid-execution (the process-leak messages at 22:24+09:00) and was not asked.
  - Observed effect: the developer learns at completion that both time targets were unreachable by the retained work, when slices 6–8 could have been shaped against revised numbers or the story split.
  - Inference: qualified. "Stop only the affected path" and "deliver safe work first" are right, but a one-line checkpoint message at the first developer contact costs nothing; the coordinator chose to accumulate evidence instead. The hosted floor was only measured at slice 8, so an earlier question would have been partly speculative.

## DD-312 — A worker-scoped fixture declared in a subset of specs split the hosted worker population, invisible to local proof
Adding a worker-scoped fixture to one fixture module while other specs extend only the base made Playwright hash the two populations apart and restart the four workers at every switch on every shard; the slice's local proof and whole runs were green and faster, and the cost showed only in hosted report artifacts.

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-18T0x:xx+09:00 (slice 7 published 1aec32a1 at about 04:1x+09:00; found by the hosted analysis about 04:3x+09:00; fixed in slice 9)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310 slice 9 "Worker restarts" and the Learnings entry on hosted measurement: 68 worker starts per hosted run against 21 before (83 s of restart gaps, 134 s of slot imbalance across twelve shards); the fix moved the fixture to `support/pageTest.ts` and gave the voice files one `launchOptions` object (local experiment 13 → 8 workers).
  - Observed effect: one hosted run's overhead rose while its per-test seconds fell; found only because the coordinator commissioned a per-test comparison of report artifacts.
  - Inference: qualified. A slice that changes test infrastructure has a hosted cost its local proof cannot see; reading the published run's report artifact (worker count, gaps) as part of the next slice's acceptance would catch it in one revision. Playwright's rule is now in the fixture's comment.

## DD-313 — The CI observer's budget expires inside a long execution
The execution observer ends after its eight-hour budget; an execution running longer loses coverage between the expiry and the next managed delivery, which starts a new observer.

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-18T04:3x+09:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: hook context `CI_MONITOR_UNAVAILABLE ... Execution observation budget expired after 28800000 ms` for observer `/tmp/dough-ci-501/watch-07Crdw` (armed 2026-10-17T20:33+09:00 at the CI-repair delivery); the slice 7 run finished green unobserved; the slice 8 delivery attached `watch-XvhGrj`.
  - Observed effect: about one hour without observation, no failure in it; the coordinator read the run result with `gh` by hand.
  - Inference: qualified. For an execution longer than the budget, the delivery path could renew the observer before expiry, or the expiry notice could name the renew command; low cost here, a real gap if a failure lands in it.

## DD-314 — A nine-slice story ran about twenty hours without a split
The plan started with eight slices and gained a ninth; execution took about twenty hours of wall time with the developer asleep for most of it, and the plan grew past 1,100 lines, while the resplit guidance triggers only above fifteen slices.

### Occurrences

- Execution: `SEED-136#unify-and-streamline-dashboard-e2e` / plan 310, first implementation `789b7ca937586690502ecf3fdbf4e1031a0a59d7`
  - Timestamp: 2026-10-17T11:00+09:00 (Take 7d4c704d) to 2026-10-18T06:0x+09:00 (slice 9 published 0bee7fd8)
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.63 (checkout VERSION at claim `7d4c704d`; installed guidance copies of this repository)
  - Evidence: plan 310 (nine slices, two corrections, one CI repair, 1,150 lines at completion); the developer's recorded preference for small stories and mid-execution splits; the natural seam after slice 4 (boundary tier complete and green, serving-mode proof in place) or after slice 5.
  - Observed effect: one long unattended run; the target decision (DD-311) and the process-leak discovery (DD-310) both surfaced late inside it.
  - Inference: qualified. A split at the boundary-tier seam would have landed a reviewable half a day earlier; the readiness procedure measures slice count, not expected wall time or seams between families of work.
