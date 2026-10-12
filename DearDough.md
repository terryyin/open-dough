# DearDough Process Findings

Reviewed 2026-10-12 (Asia/Tokyo). Active shared-process findings only; released
responses under observation live in the [watch list](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/near-term-watch-list.md).
Detailed observations, original releases and qualified inferences are retained
in the linked Open Dough catalog. Unknown execution provenance remains unknown.

- Highest allocated local number: 291. Removed numbers are never reused.
- Full source recovery before this cleanup: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275 and repaired DD-283/DD-290 remain in [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

<a id="odf-087"></a>

## ODF-087 — Skipped preparation gates

Former local code: DD-089. Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-087).

<a id="odf-059"></a>

## ODF-059 — Interrupted agent handoffs

Former local code: DD-057. A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-059).

<a id="odf-154"></a>

## ODF-154 — Missing Cursor coordinator identity

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration. Released response; watch start unknown. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-154).

<a id="odf-074"></a>

## ODF-074 — Unverified planning premises

Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked. Open after verified later recurrence; not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-074).

<a id="odf-110"></a>

## ODF-110 — Incomplete readiness replays

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop. Open after verified later recurrence; not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

<a id="odf-157"></a>

## ODF-157 — Identifier-only conceptual searches

Former local code: DD-127. An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-157).

<a id="odf-158"></a>

## ODF-158 — Disproportionate required reference reads

Former local code: DD-128. Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-158).

<a id="odf-106"></a>

## ODF-106 — Colliding plan numbers

Former local code: DD-155. Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-106).

<a id="odf-141"></a>

## ODF-141 — Fixed refactor cost on small accepted slices

Former local code: DD-192. Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-141).

<a id="odf-204"></a>

## ODF-204 — Interrupted delegated agent keeps running and publishes

Former local code: DD-215. After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-204).

<a id="odf-205"></a>

## ODF-205 — Execution starts on a red trunk unannounced

Former local code: DD-217. Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-205).

<a id="odf-152"></a>

## ODF-152 — File-size gate conflicts with approved intermediate scope

Former local code: DD-219. An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-152).

<a id="odf-209"></a>

## ODF-209 — Concurrent CI reproduction overloads slice proof

Former local code: DD-221. Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-209).

<a id="odf-210"></a>

## ODF-210 — Removal proof omits an existing user capability

Former local code: DD-234. A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-210).

<a id="odf-211"></a>

## ODF-211 — Admission is ambiguous for an unlanded story correction

Former local code: DD-237. An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-211).

<a id="odf-217"></a>

## ODF-217 — Unverified refactor proof effects

Former local code: DD-239. Former local code: DD-248. A refactor misclassifies or omits the proof effects of a change, leaving reached consumers unrun; some returns incorrectly call changed behavior identical or type-only. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-217).

<a id="odf-218"></a>

## ODF-218 — Formatting invalidates a pre-format size check

Former local code: DD-241. The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-218).

<a id="odf-219"></a>

## ODF-219 — Background coordinator implements outside the local-slice condition

Former local code: DD-245. Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-219).

<a id="odf-100"></a>

## ODF-100 — Masked formatter failure

Former local code: DD-251 (plans 264 and 271 only). A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-100).

<a id="odf-097"></a>

## ODF-097 — Publishing after a failed check

Former local code: DD-251 (plan 273 only). A failed formatter or verification result is visible but does not gate the next commit or publication step. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-097).

<a id="odf-222"></a>

## ODF-222 — Post-commit managed delivery stalls at an unknown stage

Former local code: DD-253 (Cursor plan 273 only). Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-222).

<a id="odf-184"></a>

## ODF-184 — Unbounded Git transport stalls managed delivery

Former local code: DD-253 (Claude Code plan 274 only). An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished. Released response; watch start unknown. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-184).

<a id="odf-220"></a>

## ODF-220 — Code-level planning findings become stale on trunk

Former local code: DD-254. Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-220).

<a id="odf-221"></a>

## ODF-221 — CI repair misses a sibling with the diagnosed cause

Former local code: DD-255. A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-221).

<a id="odf-224"></a>

## ODF-224 — Native replay changes the retained acceptance checkpoint

Former local code: DD-258. A native acceptance replay constructs a fresh current-slice checkpoint instead of the historical accepted checkpoint and omits later ownership or preserved constraints, so the paid run exercises a different decision. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-224).

<a id="odf-150"></a>

## ODF-150 — Implementation proof misses indirect consumers

Former local code: DD-259. Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario. Queued, not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-150).

<a id="odf-225"></a>

## ODF-225 — Repair stash invalidates a still-running proof

Former local code: DD-260. Repair quiescence checks only writers, so stashing an interrupted agent’s checkout while read-only tests still observe it invalidates the proof. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-225).

<a id="odf-121"></a>

## ODF-121 — Transient transport failure ends observation

Former local code: DD-261. A reported GitHub transport failure ends observation and leaves later revisions without notification coverage. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-121).

<a id="odf-226"></a>

## ODF-226 — Proof reporter override weakens the configured verdict

Former local code: DD-262. A focused proof overrides a configured reporter that owns failure policy, making local passing assertions insufficient evidence for the project’s actual verdict. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-226).

<a id="odf-227"></a>

## ODF-227 — Repair delegation deletes the only regression proof

Former local code: DD-263. A coordinator explicitly requests a temporary reproduction to delete, so product repairs return without a permanent regression test and require another delegation round. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-227).

<a id="odf-228"></a>

## ODF-228 — Long proof starts without checking shared-host headroom

Former local code: DD-264. A long repeated full-suite probe starts and continues on an overloaded shared host without checking load or swap, consuming hours without completing its planned evidence. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-228).

<a id="odf-229"></a>

## ODF-229 — Interrupted Cursor implementation loses its proof return

Former local code: DD-265. An interrupted Cursor implementation Task leaves edits but no agent return; the coordinator must reconstruct proof and acceptance from the checkout. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-229).

<a id="odf-230"></a>

## ODF-230 — Planned proof relies on a forbidden shared installation

Former local code: DD-266. Planning settles proof through a temporary mutable dependency link even though execution setup forbids linking another checkout’s installation. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-230).

<a id="odf-231"></a>

## ODF-231 — Setup gate misses the project’s exact runtime pin

Former local code: DD-267. Readiness resolves package-lock installation and typecheck but omits the project’s runtime pin and authoritative setup checker, allowing all delivery on a different runtime. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-231).

<a id="odf-187"></a>

## ODF-187 — Planned observations cannot detect regressions

Former local code: DD-268. Planning prescribes an observation whose claimed discrimination was reasoned rather than demonstrated; executing the proposed proof can pass on the unfixed behavior or conflict with the project’s proof policy. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-187).

<a id="odf-232"></a>

## ODF-232 — Acceptance publishes an explicitly unobserved host fact

Former local code: DD-270. A return explicitly reports native host behavior unobserved, yet acceptance publishes that behavior as factual guidance and records only pending native evidence. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-232).

<a id="odf-233"></a>

## ODF-233 — A plan forbids the representation its promised behavior needs

Former local code: DD-272. A correction’s boundary forbids new record/schema data while its behavior requires a fact the existing entrypoint or record does not supply, leaving a background coordinator to reinterpret scope. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-233).

<a id="odf-234"></a>

## ODF-234 — Journey acceptance omits the next state its own guidance promises

Former local code: DD-273. Acceptance proves a correction’s first successful rerun but omits subsequent or adjacent states produced by the same journey, including explicitly listed untested record states. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-234).

<a id="odf-223"></a>

## ODF-223 — A gap disposition substitutes reasoning for its actual guided path

Former local code: DD-277. Structured story obligations are marked no user cost or proved from a return’s narrow explanation or a helper’s behavior without tracing/running the paths the published guidance directs into that state. Queued, not resolved. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-223).

<a id="odf-235"></a>

## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed

Former local code: DD-281. A slice changes a rebuildable candidate into irreplaceable hand-resolved work but does not trace existing failure exits that abandon it, dropping that resolution to the reflog. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-235).

<a id="odf-236"></a>

## ODF-236 — Refactoring removes a deliberate caller behavior difference

Former local code: DD-286. A refactor deletes a caller override to unify a rule despite knowing it changes that caller’s preserved edge behavior, reporting the choice after editing instead of preserving it. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-236).

<a id="odf-237"></a>

## ODF-237 — Unattached launch planning assumes an incompatible capture contract

Former local code: DD-289. Planning promises landing context for an unattached launch without observing that the capture schema and admission path require a story identity. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-237).

<a id="odf-238"></a>

<a id="dd-288"></a>

## ODF-238 — A planned native proof depends on a future release

Former local code: DD-288. A story’s final paid native observation requires installed skills available only in a release after that story lands, so its starting state cannot exist within the planned execution. Open, unqueued. [Evidence and response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-238).
Observation follow-up remains [queued](.planning/seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation); it does not resolve the general planning lesson.
