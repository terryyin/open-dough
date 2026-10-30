# DearDough Process Findings

Source maintenance on 2026-10-28 retained collected evidence before shortening at Open Dough `32b5ae0b4414d755bcde4ef6cd822774d7450771:docs/maintainer/findings/`. The complete post-local source is `432ed9ec9c9e9954dd5bff0c9a7324d1d8a991a6:DearDough.md`; linked source records share that revision. Unknown execution releases and local facets remain qualified.

Reviewed 2026-10-28 (Asia/Singapore). Four shared process sources were
reviewed after local maintenance: Open Dough, Doughnut, Pygardon and Lizard.
Terry Talks skips shared collection because process retrospective is off.
Released responses await their specific ordinary-use observations; the
[watch list](docs/maintainer/near-term-watch-list.md) preserves its contrary
evidence. Source and catalog identities do not imply resolution.

- Highest allocated local number: 369. Removed numbers are never reused.
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

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-074](docs/maintainer/findings/ODF-074.md); rereading adds no occurrence.

- Execution: SEED-010#expose-codex-observer-identity / plan 372, first implementation `eac4f2083efe6c2909d6022a6ca0f5e699c8996b`
  - Timestamp: unknown (2026-10-29, Asia/Singapore; source-review acceptance before slice delivery)
  - Tool: Codex
  - Open Dough release: 0.3.75 (installed guidance at accepted Take `68014eebcf717ecac6330fb813a613b42a4fb947`; the native binding probe separately used modified source)
  - Evidence: coordinator inspected plan 371's `## Slice 1` / `Status: pending` layout, drafted plan 372 likewise and recorded ready/admitted it. Once source-review commitments required the full slice reader, three `story-obligations.mjs check --slice 1` refusals named missing `## Ordered slices`, unsupported `### Slice 1` instead of `### 1. name`, and unsupported `Status: pending` instead of `planned|done`; accepted plan at `eac4f208` contains the corrected layout.
  - Observed effect: three local repair rounds after implementation; the strict delivery check failed closed and no incorrect slice completion was published.
  - Inference: qualified recurrence of an unverified consuming-operation premise: another active plan's layout was treated as a usable template without exercising the reader that later consumes it. Checking that reader before readiness could catch the mismatch earlier; no escaping product defect or measured duration saving is claimed.


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

### Occurrences

- Execution: SEED-162#keep-long-running-dashboard-sessions-responsive; before-cleanup `b0c9d8fc4290d39ce4ee23aff91fed648f915dd7:.planning/slice-plans/366-keep-long-running-dashboard-sessions-responsive/PLAN.md`; first related implementation commit `9bff183a`
  - Timestamp: 2026-10-28T21:34:58+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `526c01b7-1fb2-4f61-9a8a-64275b27fbb6` — six per-slice `dough-post-change-refactor` Task launches; slices 2, 3, and 5 returned “none — already clean”; slices 1, 4, and 6 made useful edits
  - Observed effect: three of six mandatory refactor agents edited nothing after reading the accepted slice diffs
  - Inference: same fixed per-slice refactor cost as ODF-141; mixed payoff on a six-behavior bounded-memory plan


- Execution: SEED-173#dashboard-ci-balance; first implementation `874ef52c0e99857feefde9b4058673c83029d875`, restored result `783d6bda38ab381e686bfb63500b97970dc8817f`
  - Timestamp: unknown (2026-10-29 execution conversation)
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: fresh `/root/refactor_ci_weights` and `/root/refactor_rejected_allocation` returns both report `none — already clean`, no edits/tests, approximately ten and seven active minutes respectively; the latter independently checked all four restored weight files against the baseline. Recoverable plan: `783d6bda38ab381e686bfb63500b97970dc8817f:.planning/slice-plans/375-dashboard-ci-balance/PLAN.md`.
  - Observed effect: two independent refactor handoffs made no changes on one data-only experiment and its explicit rejection; accepted proof remained applicable.
  - Inference: qualified recurrence of fixed review cost on small accepted changes. Durations are agent estimates, not stopwatch/token totals, and confirming restoration and proof boundaries may add confidence; no claim that either review was valueless or that skipping it would produce a measured saving.

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

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-150.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

- Execution: SEED-163#reliably-report-dashboard-wrap-up / plan 367 / first related implementation `938f2f1e9224eb6503654fec1b8a3b033ccdd64e`
  - Timestamp: 2026-10-28T14:19:12Z (CI failure on slice 3 SHA `242e5fe7`)
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.73
  - Evidence: plan slice 3 accepted proof named `story-branch-landing-capture.spec.ts` / later-publication twin plus unit coverage; CI run 40704491019 job `dashboard (3/12)` failed `story-branch-retained-landing.spec.ts:43` (ZodError requiring `landing` on second integrate). Repair `804e7d7f` asserts `already-accepted` without a landing field after expectation clear. Coordinator transcript `3fc700d8-1e3b-486e-82de-cd7b0c5e26e7` stashed slice 4 for that repair.
  - Observed effect: one owned CI failure and one assertion repair before slice 4 delivery; the sibling retained-landing journey was not in the slice's focused proof.
  - Inference: recurrence of focused-neighbor selection missing an existing consumer of the same second-integrate / no-landing contract after open-expectation clear.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>

Former local code: DD-260. Repair quiescence checks only writers, so stashing an interrupted agent’s checkout while read-only tests still observe it invalidates the proof. [Evidence and current response](docs/maintainer/findings/ODF-225.md).

## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>

Former local code: DD-261. A reported GitHub transport failure ends observation and leaves later revisions without notification coverage. [Evidence and current response](docs/maintainer/findings/ODF-121.md).

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-121.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

- Execution: SEED-162#keep-long-running-dashboard-sessions-responsive; before-cleanup `b0c9d8fc4290d39ce4ee23aff91fed648f915dd7:.planning/slice-plans/366-keep-long-running-dashboard-sessions-responsive/PLAN.md`; first related implementation commit `9bff183a`
  - Timestamp: unknown (around slice-5 accept near `c467f720` 2026-10-28T22:07:05+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `526c01b7-1fb2-4f61-9a8a-64275b27fbb6` L56–L57 — `CI_MONITOR_UNAVAILABLE` (GitHub unreachable); continued; later attached `/tmp/dough-ci-501/watch-gFrx9R`
  - Observed effect: lost observation coverage once mid-execution; re-attach restored coverage for later publications including accepted tip `0d1672f7`
  - Inference: same transient-transport ending as ODF-121; managed re-attach limited the gap to already-published revisions

- Execution: SEED-163#reliably-report-dashboard-wrap-up / plan 367 / first related implementation `938f2f1e9224eb6503654fec1b8a3b033ccdd64e`
  - Timestamp: unknown (coordinator noted lost coverage after slice 2 publish `c2aa41dd` at 2026-10-28T22:00:03+08:00 and before slice 3 publish `242e5fe7` at 2026-10-28T22:17:11+08:00)
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `3fc700d8-1e3b-486e-82de-cd7b0c5e26e7` L75 — “Noting lost CI coverage once (GitHub unreachable) and continuing slice 3 acceptance.” Supplied execution limitations name `CI_MONITOR_UNAVAILABLE`. Later mailbox `/tmp/dough-ci-501/watch-UB2SnZ` retains CI_FAILURE for `c2aa41dd` (OVER BUDGET) and `242e5fe7` (retained-landing); the unavailable event payload itself is not in that mailbox.
  - Observed effect: coordinator reported lost coverage once and continued; slice 2’s hosted OVER BUDGET failure was not classified in the same turn; coverage resumed for later publications on a subsequent observer.
  - Inference: qualified recurrence of transport-ending observation loss. Exact `gh`/TLS error text is unrecovered from the dead observer; distinct from eight-hour budget expiry (ODF-259).

- Execution: SEED-174#optimize-dashboard-test-feedback / plan 376 / first related implementation `692d90320ebb6e6d0a96f61a52e0597717a982e4`
  - Timestamp: unknown (2026-10-29 Asia/Singapore; two finished observers left `CI_MONITOR_UNAVAILABLE` event files dated ~18:19 and ~19:11 +08)
  - Tool: Cursor
  - Open Dough release: 0.3.76
  - Evidence: `/tmp/dough-ci-501/watch-dzWNZd/events/000000000001.json` — `CI_MONITOR_UNAVAILABLE` reason “gh did not answer within the request's time limit”; `/tmp/dough-ci-501/watch-lDWSLx/events/000000000001.json` — same type, reason “GitHub is unreachable”; both for branch `cursor/reduce-dashboard-test-feedback-time-with-measure`. Coordinator transcript `5473d3e9-6f21-4fad-9a6f-c38bde1e1b81` noted lost coverage once mid-slice-2 and continued. Later observer `/tmp/dough-ci-501/watch-1xJHW1` retained coverage for tip `f5d22bce` as `not_required` with basis `a1703fdd` `success`.
  - Observed effect: two transport-ended observers on this execution; coordinator continued without claiming CI success; tip observation remains pending/possibly gapped relative to those dead mailboxes.
  - Inference: qualified recurrence of ODF-121 transient-transport ending (gh timeout and unreachable); distinct from eight-hour budget expiry (ODF-259) and from wrong-`--repo` 404 (ODF-256).

## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>

Former local code: DD-262. A focused proof overrides a configured reporter that owns failure policy, making local passing assertions insufficient evidence for the project’s actual verdict. [Evidence and current response](docs/maintainer/findings/ODF-226.md).

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-226.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

- Execution: SEED-163#reliably-report-dashboard-wrap-up / plan 367 / first related implementation `938f2f1e9224eb6503654fec1b8a3b033ccdd64e`
  - Timestamp: 2026-10-28T13:45:25Z (CI failure on slice 1 SHA `938f2f1e`)
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.73
  - Evidence: plan accepted proof for slice 1 used `--reporter=line`; CI run 40698951934 jobs `dashboard (12/12)` and `(6/12)` reported “passed but wrote output” from `plantTrackedClosureRepository`’s bare `git init` printing default-branch advice under configured `quietReporter`. Repair `2ba5950d` switches to `git init -b main`.
  - Observed effect: local focused proof accepted; hosted quietReporter rejected the same green assertions; one fixture repair and stash of in-flight slice 2 work.
  - Inference: recurrence of reporter override hiding the project’s configured output-failure policy; the fixture noise was the proximate print, not a separate finding.

## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>

Former local code: DD-263. A coordinator explicitly requests a temporary reproduction to delete, so product repairs return without a permanent regression test and require another delegation round. [Evidence and current response](docs/maintainer/findings/ODF-227.md).

## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>

Former local code: DD-264. A long repeated full-suite probe starts and continues on an overloaded shared host without checking load or swap, consuming hours without completing its planned evidence. [Evidence and current response](docs/maintainer/findings/ODF-228.md).

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. An interrupted Cursor implementation Task leaves edits but no agent return; the coordinator must reconstruct proof and acceptance from the checkout. [Evidence and current response](docs/maintainer/findings/ODF-229.md).

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-229.md). This execution adds an occurrence under that established code; no new code or mapping is allocated. Matching uncertainty: the interrupted Task left no edits (clean tree), so the original “edits without return” symptom is absent; the decisive interrupted-without-return recovery still applied.

### Occurrences

- Execution: SEED-174#optimize-dashboard-test-feedback / plan 376 / first related implementation `692d90320ebb6e6d0a96f61a52e0597717a982e4`
  - Timestamp: unknown (2026-10-29 Asia/Singapore; after slice-1 delivery `692d9032` 18:15 +08 and before slice-2 delivery `a1703fdd` 18:32 +08)
  - Tool: Cursor
  - Open Dough release: 0.3.76
  - Evidence: coordinator transcript `5473d3e9-6f21-4fad-9a6f-c38bde1e1b81` — first slice-2 Task (“Slice 2 agent-launch optimize”) interrupted with no return; coordinator followed interrupted-delegation recovery, found clean working tree at `692d9032`, then launched fresh Task “Slice 2 optimize retry” which delivered `a1703fdd`.
  - Observed effect: one aborted implementation Task with no product edits; full recovery + fresh agent before acceptance; no work lost or dual-writer conflict.
  - Inference: qualified recurrence of interrupted Cursor implementation without return; empty-tree case made reconstruction cheap but still required a replacement writer. Host termination cause (watchdog vs other) is unestablished here.

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

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-238](docs/maintainer/findings/ODF-238.md); rereading adds no occurrence.

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

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-139](docs/maintainer/findings/ODF-139.md); rereading adds no occurrence.

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

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-326](docs/maintainer/findings/ODF-326.md); rereading adds no occurrence.

## ODF-327 — Preparation left an evaluation's criteria for execution while the evaluated run was imminent

Former local code: DD-332. Preparation schedules evaluation criteria as later execution while the observed event can start first, making the resulting assessment exploratory.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-327.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-327.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-328 — A fresh delivery refused the obligation its own plan update would close

Former local code: DD-333. A coordinator leaves an obligation disposition for a plan update that guarded delivery runs only after its obligation check; the existing gate correctly refuses.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-328.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-328.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

## ODF-329 — Implementation returns failed the delivery formatter's lint

Former local code: DD-334. Delegation forbids the hook-owned lint command without settling a read-only check of authored files, so coordinator formatting first exposes lint defects after refactoring.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-329.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-329.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

Existing shared finding: this execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-329](docs/maintainer/findings/ODF-329.md); rereading adds no occurrence.

## ODF-330 — Hand-built preparation input dropped the plan from ownedPaths

Former local code: DD-335. A hand-built owned-path list trims significant porcelain status spacing and corrupts a path; the input guard contains the mistake before project commands.

[Retained evidence and current response](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/findings/ODF-330.md). Original occurrence provenance and distinct effects are recoverable in Open Dough `ccf309a69459284de3f1d45f2de813e9180c2971:docs/maintainer/findings/ODF-330.md` and this project's source snapshot `f274a3d0c729504bf8ce00614bf3cd236b7e088b:DearDough.md`. Name adoption is not resolution.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-330](docs/maintainer/findings/ODF-330.md); rereading adds no occurrence.

<a id="dd-337--preparation-recorded-measured-allocations-without-their-full-sort-key"></a>

## ODF-355 — Preparation recorded measured allocations without their full sort key

Former local code: DD-337.

Plan 353's story and plan quoted after-run totals from a scratch reconstruction (599.2 / 599.5 / 596.6 and a rename's 621.7 / 591.8 / 581.8) whose order among jobs of equal recorded seconds was never written down; no implementation could reproduce them.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-355](docs/maintainer/findings/ODF-355.md); rereading adds no occurrence.

<a id="dd-338--a-direct-formatter-command-in-fresh-delivery-lacked-the-packages-binaries"></a>

## ODF-356 — A direct formatter command in fresh delivery lacked the package's binaries

Former local code: DD-338.

The guarded fresh delivery runs each preparation operation directly without a shell, so `node scripts/lint.mjs --fix` found neither `eslint` nor `prettier` on PATH and the first delivery attempt of slice 1 failed; the same operation as `npm run format` succeeded.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-356](docs/maintainer/findings/ODF-356.md); rereading adds no occurrence.

<a id="dd-340--preparation-observations-recorded-results-their-own-commands-contradict"></a>

## ODF-357 — Preparation observations recorded results their own commands contradict

Former local code: DD-340.

Plan 354's "Preparation observations" quoted command results that the same commands, rerun at the same revision, do not give: a premise grep's file list, a "differs only in" comparison, and a key example's file count.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-357](docs/maintainer/findings/ODF-357.md); rereading adds no occurrence.

<a id="dd-341--coordinator-wrote-subagent-completion-notices-in-its-own-turn"></a>

## ODF-358 — Coordinator wrote subagent completion notices in its own turn

Former local code: DD-341.
Former local code: DD-337 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.
After launching background agents and saying it would wait, the coordinator emitted text formatted as `<task-notification>` results inside its own assistant turn: once an invented reviewer return and an invented implementer report (claimed files and passing tests), once a premature completion notice for a still-running native round.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-358](docs/maintainer/findings/ODF-358.md); rereading adds no occurrence.

<a id="dd-342--a-developer-run-observation-inside-a-slices-proof-cannot-be-delivered-with-that-slice"></a>

## ODF-359 — A developer-run observation inside a slice's proof cannot be delivered with that slice

Former local code: DD-342.
Former local code: DD-338 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision.
Plan 354 put its paid baseline round in slice 1's proof and made slice 2 depend on its result. Guarded fresh delivery marks the delivered slice `done`, so the credential-free part could be delivered only after the plan moved the round to slice 2 as a pre-change prerequisite.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-359](docs/maintainer/findings/ODF-359.md); rereading adds no occurrence.

<a id="dd-344--a-new-installed-command-assumed-a-writable-system-temp-directory-that-host-sandboxes-refuse"></a>

## ODF-360 — A new installed command assumed a writable system temp directory that host sandboxes refuse

Former local code: DD-344.

A command added for coordinators to run (`source-freshness.mjs`) made its scratch directory with `mkdtemp(os.tmpdir())`. Every credential-free proof ran unsandboxed, so the first paid Codex round found that its workspace-only sandbox refuses the system temp directory and `/tmp`; the round failed and a fix plus a retry followed.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-360](docs/maintainer/findings/ODF-360.md); rereading adds no occurrence.

<a id="dd-348--an-implementation-agent-met-a-file-line-limit-by-joining-wrapped-lines"></a>

## ODF-361 — An implementation agent met a file line limit by joining wrapped lines

Former local code: DD-348.

A slice told to bring two skill files to 250 lines moved some detail but
reached the limit by joining four wrapped paragraphs onto over-long lines; the
project formatter preserves prose wrapping, so nothing would have reflowed them.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-361](docs/maintainer/findings/ODF-361.md); rereading adds no occurrence.

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>

## ODF-362 — Post-change refactor compressed PLAN.md Story obligations under the file-size gate

Former local code: DD-349.

The post-change refactor pass treats the executable plan as an ordinary changed
file subject to the 250-line limit, then rewrites or shortens `## Story
obligations` so structured dispositions no longer match the plan format the
delivery gate expects; the coordinator must restore the section before fresh
delivery.

### Occurrences

Distinct executions, original timestamps/releases/tools, observed effects and qualified inferences are [retained at ODF-362](docs/maintainer/findings/ODF-362.md); rereading adds no occurrence.

## DD-363 — Coordinator source-review hard-breaks fail fresh delivery

Coordinator-authored `source-review.md` used Markdown hard-break trailing spaces
that the fresh-delivery preparation refused; selective `npm run format` does not
cover Markdown, so the defect reached the first guarded delivery.

### Occurrences
- Execution: SEED-157#check-stalled-delegated-verification; plan and source-review recoverable at before-cleanup `e8e841c8e15d23db9f8d9e4d86923d134294992b` (`.planning/slice-plans/363-check-stalled-delegated-verification/`); first related implementation commit `cd30010f9044cf703596a58e98a494e610cc6f2d`
  - Timestamp: unknown (2026-10-28; first fresh-delivery attempt before accepted `cd30010` at 16:19:23+08:00)
  - Tool: Cursor
  - Open Dough release: 0.3.73
  - Evidence: coordinator transcript `3bd97cc2-93e0-4e61-bca4-b477e0d7b5f4` — after writing/updating `source-review.md` and running `npm run format`, first `execution-increment-delivery.mjs fresh` failed; repair removed trailing hard-break spaces on the Launch/Input/Reviewer header lines; retry published `cd30010`. Distinct from ODF-329 (implementer ESLint under a lint-forbidden delegation brief).
  - Observed effect: one refused fresh-delivery attempt and a mechanical coordinator repair before the accepted publish.
  - Inference: qualified one-off. Coordinator Markdown artifacts need a pre-delivery whitespace check or must avoid hard-break trailing spaces; format alone does not cover them.

## DD-364 — Source-only review launched without the full seed examples

A coordinator's first source-only review prompt omitted Key examples 3–4, so
the reviewer returned incomplete commitments and a second complete-seed launch
was required before acceptance.

### Occurrences
- Execution: SEED-158#publish-awaiting-hosted-proof
  - Timestamp: 2026-10-28T16:22:00+08:00
  - Tool: Cursor
  - Model: auto
  - Open Dough release: modified; revision 67fad4e0; base 0.3.73
  - Evidence: before-cleanup `1223cddb7bd75f7f56d4668ebd46930e28326491:.planning/slice-plans/364-publish-awaiting-hosted-proof/source-review.md` Launch note ("first launch's coordinator prompt omitted examples 3–4"); coordinator transcript relaunch; subagents `a0e1094e` (incomplete seed) then `8dd2f633` (complete seed)
  - Observed effect: one discarded source-only review, then a second launch that recovered examples 3–4 before commitment allocation
  - Inference: distinct from ODF-326 (unchanged-input repeat); here the first inputs were incomplete, so the second launch was corrective rather than redundant

## DD-365 — Commit-specific preparation approval repeats after safe reconciliation

Approval named one preparation commit, then a metadata-only rebase changed its
SHA while retaining the reviewed story, plan and backlog link. Automatic
approval review required another human approval before publication.

### Occurrences
- Execution: SEED-164#dashboard-ci-time; first implementation `7eda0986bafe78cbf6088df514bb6b088edf9333`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: execution conversation; approval of preparation `3c5f3ded`, reconciliation onto another chat's metadata as `aeff46decceb5fef150962b5ce72db259d866382`, then explicit approval of preparation-only changes and safe reconciliation. Seed/plan bytes and the sole backlog plan-link edit were checked unchanged before publication.
  - Observed effect: publication paused for a second human approval although the reviewed preparation change was unchanged.
  - Inference: qualified one-off; requesting approval for the concrete change scope plus safe reconciliation can avoid a SHA-only authorization becoming stale. This differs from ODF-262's permission-only UI probes.

## DD-366 — Story-branch increment publish blocked by trunk-targeted open first-landing expectation

A dashboard launch plants an open first-landing expectation whose landing
context targets trunk (`main`). Story-branch increment publication auto-resolves
that expectation and refuses because the publish target is the story branch, not
trunk. Fresh delivery commits then stops; resume without landing context accepts
the story-branch candidate.

### Occurrences
- Execution: SEED-166#handle-stale-worktree-bundles; plan at before-cleanup `d3bfd15b60526de1430ca12da7c3acb1a12447ee:.planning/slice-plans/369-handle-stale-worktree-bundles/PLAN.md`; first related implementation commit `0bb02d31c8e9c6c995bfcc41c0e9685ab387e8ea`
  - Timestamp: unknown (2026-10-29; after slice-1 commit `0bb02d31`, through execution-complete publish)
  - Tool: Cursor
  - Open Dough release: 0.3.74
  - Evidence: coordinator transcript `a56ca4f1-4b16-4f30-a9c3-ee4138c9c1e5` — each `execution-increment-delivery.mjs fresh` commit succeeded then refused with “Publication does not match the supplied landing context”; open first-landing expectation keyed by workspace+branch named landing-context.json targeting `refs/heads/main`; `execution-increment-resume.mjs resume` of the same candidate then accepted on the story branch without supplying `--landing-context`
  - Observed effect: every story-branch fresh publish interrupted on trunk-targeted landing retain; resume without landing context accepted the candidate
  - Inference: distinct from ODF-251 (second worktree for trunk corrections). Planted trunk first-landing expectation and story-branch publish target collide on the same launch workspace; auto-resolve should not apply trunk landing to execution-branch increments

## DD-367 — Delegated dashboard proof omitted its required sandbox wrapper

The coordinator handed off dashboard proof without carrying the established
escalated socket/process-inspection wrapper. Two sandboxed diagnostic runners
hung in teardown when process inspection was denied; precise termination and
cleanup attribution were needed before usable proof could continue.

### Occurrences
- Execution: SEED-167#cheap-isolated-fixtures; first implementation `8c55a30c56d324100cc44cbb105123aa8ebfc823`
  - Timestamp: unknown (2026-10-29, Asia/Singapore; slice-1 diagnostic attempts)
  - Tool: Codex
  - Open Dough release: 0.3.74
  - Evidence: coordinator/implement_origin_preparation conversation; diagnostic runners12117/17810 ended143 after denied ps teardown; slice1-proof.md, slice1-quiescence.json and aborted-owned-paths.json in `/private/tmp/cheap-isolated-fixtures-167`; final escalated guard runs ended0.
  - Observed effect: two attempts supplied no complete pass; owned processes required termination and four generic temporary directories were retained because ownership was uncertain.
  - Inference: carry the known runtime wrapper in each proof handoff before launch; an omitted permission boundary can invalidate teardown evidence even when test bodies run. No duration saving is inferred.

## DD-368 — A CI log excerpt hides an earlier failed test in the same job

The default CI diagnostic keeps lines around GitHub error markers. With the quiet dashboard reporter, the process-exit marker follows only the last test failure; an earlier failure can be omitted without a complete failed-test inventory. This differs from ODF-221's same-cause sibling repair omission: here the first diagnosis did not expose the sibling failure at all.

### Occurrences

- Execution: SEED-169#compact-session-entry; first implementation `c036dbd73a6f58949356b3b7de497085642bd1fc`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown; installed diagnostic at `c036dbd73a6f58949356b3b7de497085642bd1fc:.agents/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs`
  - Evidence: [run 40817756668, dashboard12](https://github.com/terryyin/open-dough/actions/runs/40817756668/job/123262746829), 2026-10-29 UTC logs, has FAIL lines for agent-launch-attention.spec.ts and sessions-sidebar-navigation-cases.spec.ts. The diagnostic excerpt showed only navigation. After its repair `76d61616d6e74866024a3091a2ec7040d2b9791e`, [run 40819519249, dashboard12](https://github.com/terryyin/open-dough/actions/runs/40819519249/job/123268443339) retained only the unchanged attention failure. Full logs were read through the same CI GitHub source to verify both inventories.
  - Observed effect: the coordinator published the navigation-only repair before discovering that readiness comparison had already failed in the first job; another CI cycle repeated that known-but-unseen failure.
  - Inference: bounded per-failure inventory before repair publication could have avoided at least that extra cycle; retain bounded excerpts without treating a tail as the complete failed-test list.

## DD-369 — New Markdown docs with trailing blank EOF fail staged whitespace

Post-change refactor extracted new maintainer timing Markdown files that ended
with an extra blank line. Selective format does not rewrite that Markdown
whitespace, so the first guarded fresh delivery failed at `git diff --check`
(`new blank line at EOF`) after the plan status mutation.

### Occurrences
- Execution: SEED-180#optimize-dashboard-touch-viewport-tests; plan 413; completion commit pending after slice 6; first related implementation `483f66b483a9046e0c790bc12bcc57489aa2a503`
  - Timestamp: 2026-10-30T14:11:00+08:00 (approx.; first slice-6 fresh delivery refused before accepted `2f800b3f`)
  - Tool: Cursor
  - Open Dough release: 0.3.76
  - Evidence: fresh `preparation-failed` / `operation: "staged whitespace"` naming `docs/maintainer/dashboard-installed-start-fixture-timings.md:83` and `docs/maintainer/dashboard-touch-family-timings.md:73`; repair stripped trailing blank EOF; retry published `2f800b3f`. Distinct from DD-363 (hard-break trailing spaces on source-review lines).
  - Observed effect: one refused preparation after status mutation; mechanical EOF fix and second guarded delivery succeeded
  - Inference: new Markdown created under the file-size split needs an EOF whitespace check before staging; format alone does not catch it
