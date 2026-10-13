# DearDough Process Findings

Reviewed 2026-10-12 (Asia/Tokyo). Active shared-process findings only; released
responses under observation live in the [watch list](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/near-term-watch-list.md).
Detailed observations, original releases and qualified inferences are retained
in the linked Open Dough catalog. Unknown execution provenance remains unknown.

- Highest allocated local number: 300. Removed numbers are never reused.
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

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop. Open after verified later recurrence; not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127. An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-157).

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
Observation follow-up remains [queued](.planning/seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation); it does not resolve the general planning lesson.

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
