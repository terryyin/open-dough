# DearDough Process Findings

Reviewed 2026-10-20 (Asia/Tokyo). Active shared-process findings only; released
responses under observation live in the [watch list](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/near-term-watch-list.md).
Detailed observations, original releases and qualified inferences are retained
in the linked Open Dough catalog. Source compaction follows recoverable evidence retention at `dbe36711`; the complete pre-compaction source remains at `327b6fa255b84ba8a2552ca41dba37a46fadf4d9:DearDough.md`. Missing Terry Talks and Lizard records prevent whole-set watch retirement. Unknown execution provenance remains unknown.

- Highest allocated local number: 324. Removed numbers are never reused.
- Earlier cleanup recovery: `c76322764499936acd42328b5ef4f66f4df6bcf8:DearDough.md`.
- Project-owned DD-275/DD-309 and repaired DD-283/DD-290/DD-312 remain in [ProjectFindings.md](ProjectFindings.md). DD-288 retains the general planning lesson below. Occurrence history is partial.

## ODF-087 — Skipped preparation gates <a id="odf-087"></a>

Former local code: DD-089.

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass. [Evidence and current response](docs/maintainer/findings/ODF-087.md).


### Occurrences

- Execution: SEED-010#format-owned-changes / plan 325, first implementation `43ff9dde9762edf400703c2925210383057e8522`
  - Timestamp: unknown (2026-10-20, execution entry and slice 1 proof)
  - Tool: Codex
  - Open Dough release: 0.3.66 (checkout-bound installed guidance, unchanged)
  - Evidence: `5bb581028f16a5307f4bf4104088d19f1b62d0e9:.planning/slice-plans/325-format-owned-changes/PLAN.md`, Execution context; the coordinator reused the preparation's exact-worktree npm-ci note and a passing dashboard typecheck. The first four-suite fixture run then failed because local `node_modules/@eslint/js` was absent; module resolution from the checkout could fall through to the parent repository. Fresh local `npm ci`, unchanged lockfile, local resolution and typecheck preceded the identical passing retry. The later native setup checker also passed.
  - Observed effect: implementation began with incomplete local dependencies; one focused proof run failed before checkout preparation was repaired. Accepted proof and publication used the repaired installation.
  - Inference: qualified recurrence of substitute-green readiness evidence, as in the retained plan-258 occurrence. A historical install note plus an unrelated passing command did not establish the dependencies used by this slice. This does not justify relaxing checkout ownership or inventing a new setup protocol.

## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>

Former local code: DD-057.

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof. [Evidence and current response](docs/maintainer/findings/ODF-059.md).

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231.

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-074 — Unverified planning premises <a id="odf-074"></a>

Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Former local code: DD-307.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked. [Evidence and current response](docs/maintainer/findings/ODF-074.md).

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-074.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

- Execution: SEED-052#cursor-session-model-scope / plan 329, first related commit `230b9018`
  - Timestamp: unknown (2026-10-20, slice 5 native attempt; recorded in `7d110ef8`)
  - Tool: Cursor
  - Open Dough release: unknown (checkout-bound guidance in the execution worktree)
  - Evidence: plan 329 slice 5 proof named a native run "from the dashboard on this machine" without a runner-freshness premise; its Learnings (`7d110ef8`, disposition `08fbe909`) record that the machine's single reused Cursor runner predated slices 2–4 and held 11 unrelated sessions, so spawned clients carried no `CURSOR_CONFIG_DIR`, the chosen model persisted into the shared config (restored afterwards), and the scope was stranded on record deletion (removed manually).
  - Observed effect: the native attempt failed as proof, Terry was asked to decide on restarting the runner over 11 unrelated sessions (first chose restart; the call was interrupted; then skipped native confirmation by decision), and native end-to-end verification closed as the story's explicit limit rather than passed.
  - Inference: qualified. The plan verified the `CURSOR_CONFIG_DIR` hook in slice 1 but never checked that the final native journey would run through current dashboard code; observing the reused runner's provenance at planning or slice 1 would have surfaced the restart decision before the attempt wrote to the shared config.

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop. [Evidence and current response](docs/maintainer/findings/ODF-110.md).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127.

An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive. [Evidence and current response](docs/maintainer/findings/ODF-157.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128.

Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths. [Evidence and current response](docs/maintainer/findings/ODF-158.md).

## ODF-106 — Colliding plan numbers <a id="odf-106"></a>

Former local code: DD-155.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous. [Evidence and current response](docs/maintainer/findings/ODF-106.md).

## ODF-141 — Fixed refactor cost on small accepted slices <a id="odf-141"></a>

Former local code: DD-192.

Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost. [Evidence and current response](docs/maintainer/findings/ODF-141.md).

## ODF-204 — Interrupted delegated agent keeps running and publishes <a id="odf-204"></a>

Former local code: DD-215.

After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout. [Evidence and current response](docs/maintainer/findings/ODF-204.md).

## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>

Former local code: DD-217.

Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own. [Evidence and current response](docs/maintainer/findings/ODF-205.md).

## ODF-152 — File-size gate conflicts with approved intermediate scope <a id="odf-152"></a>

Former local code: DD-219.

An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers. [Evidence and current response](docs/maintainer/findings/ODF-152.md).

### Occurrences

- Execution: SEED-146#gate-local-prerequisites-before-commit-and-delivery / plan 331, first implementation `4a1fb686b9b30c83403172f017a0271879d5eb71`
  - Timestamp: unknown (2026-10-20, slice 2 refactor and CI repair)
  - Tool: Codex
  - Open Dough release: 0.3.66 (installed execution/refactor guidance)
  - Evidence: the slice-2 refactor reported no executable candidate and shortened `wrap-up.md` and `trunk-publication.md` to 250 lines. Commit `8ea3d654` changed the pre-existing accepted-claim sentence to equivalent wording; CI runs `39423276552/1` and `39423628393/1` rejected the unchanged literal assertion at `workspace-ownership-lifecycle.test.mjs:155`. The focused runner reproduced it and passed after restoring the phrase without weakening assertions; proof remains at `60c164841e0ca9178a80702e595d3c0c6b826038:.planning/slice-plans/331-gate-local-delivery-prerequisites/PLAN.md`.
  - Observed effect: one owned failure cause across two published revisions required a repair/refactor/publication cycle; runtime publication behavior was unchanged.
  - Inference: size-only prose cleanup expanded the changed consumer surface, and the neighboring guidance assertion was omitted from focused proof. This is evidence of extra repair work, not a broader file-size policy conclusion or native behavioral failure.

## ODF-209 — Concurrent CI reproduction overloads slice proof <a id="odf-209"></a>

Former local code: DD-221.

Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof. [Evidence and current response](docs/maintainer/findings/ODF-209.md).

## ODF-210 — Removal proof omits an existing user capability <a id="odf-210"></a>

Former local code: DD-234.

A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective. [Evidence and current response](docs/maintainer/findings/ODF-210.md).

## ODF-211 — Admission is ambiguous for an unlanded story correction <a id="odf-211"></a>

Former local code: DD-237.

An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code. [Evidence and current response](docs/maintainer/findings/ODF-211.md).

## ODF-217 — Unverified refactor proof effects <a id="odf-217"></a>

Former local code: DD-239. Former local code: DD-248.

A refactor misclassifies or omits the proof effects of a change, leaving reached consumers unrun; some returns incorrectly call changed behavior identical or type-only. [Evidence and current response](docs/maintainer/findings/ODF-217.md).

## ODF-218 — Formatting invalidates a pre-format size check <a id="odf-218"></a>

Former local code: DD-241.

The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout. [Evidence and current response](docs/maintainer/findings/ODF-218.md).

## ODF-219 — Background coordinator implements outside the local-slice condition <a id="odf-219"></a>

Former local code: DD-245.

Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice. [Evidence and current response](docs/maintainer/findings/ODF-219.md).

## ODF-100 — Masked formatter failure <a id="odf-100"></a>

Former local code: DD-251 (plans 264 and 271 only).

A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure. [Evidence and current response](docs/maintainer/findings/ODF-100.md).

## ODF-097 — Publishing after a failed check <a id="odf-097"></a>

Former local code: DD-251 (plan 273 only).

A failed formatter or verification result is visible but does not gate the next commit or publication step. [Evidence and current response](docs/maintainer/findings/ODF-097.md).

## ODF-222 — Post-commit managed delivery stalls at an unknown stage <a id="odf-222"></a>

Former local code: DD-253 (Cursor plan 273 only).

Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located. [Evidence and current response](docs/maintainer/findings/ODF-222.md).

## ODF-184 — Unbounded Git transport stalls managed delivery <a id="odf-184"></a>

Former local code: DD-253 (Claude Code plan 274 only).

An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished. [Evidence and current response](docs/maintainer/findings/ODF-184.md).

## ODF-220 — Code-level planning findings become stale on trunk <a id="odf-220"></a>

Former local code: DD-254.

Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises. [Evidence and current response](docs/maintainer/findings/ODF-220.md).

## ODF-221 — CI repair misses a sibling with the diagnosed cause <a id="odf-221"></a>

Former local code: DD-255.

A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair. [Evidence and current response](docs/maintainer/findings/ODF-221.md).

## ODF-224 — Native replay changes the retained acceptance checkpoint <a id="odf-224"></a>

Former local code: DD-258.

A native acceptance replay constructs a fresh current-slice checkpoint instead of the historical accepted checkpoint and omits later ownership or preserved constraints, so the paid run exercises a different decision. [Evidence and current response](docs/maintainer/findings/ODF-224.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259.

Proof selection follows edited store areas rather than the changed operation’s whole caller flow, missing a consumer’s failure scenario. [Evidence and current response](docs/maintainer/findings/ODF-150.md).


### Occurrences

- Execution: SEED-145#quiet-land-and-wrap-up / plan 331, first implementation `94c6c3767a9f9048ad8e05c8b5ec6306f6b53dc5`
  - Timestamp: unknown (2026-10-20, CI run 39396964033/1)
  - Tool: Codex
  - Open Dough release: 0.3.66 (checkout-bound installed execution guidance, unchanged)
  - Evidence: plan 331 accepted the two Land guidance suites, closure substitutes and five dashboard journeys; independent refactoring also missed `src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs:102`, which reads the changed shared Markdown and still required literal `no recap`. [CI 39396964033/1](https://github.com/terryyin/open-dough/actions/runs/39396964033) failed `test (2/3)` on that assertion; repair `e939292dd144bf21a6c11dea1efbe7cc06ffcf2a` aligned it with quiet success/minimum native response after a reproducing baseline and 12 passing related checks.
  - Observed effect: one owned CI failure and a fresh repair/refactor cycle before completion; the product rule and operational gates needed no change.
  - Inference: qualified recurrence of proof selection missing a consumer outside the named guidance suites. Searching banners and reminder phrases did not find the old quiet-response regex; tracing every reader of the changed guidance would reach it. No elapsed-time or token cost is measured.

- Execution: SEED-052#cursor-runner-restart-resume / plan 334, first implementation `79a1f1ec`
  - Timestamp: unknown (2026-10-21, CI failure on `79a1f1ec`; repair `614b490e`)
  - Tool: Cursor
  - Open Dough release: unknown
  - Evidence: slice 1 made `exec`/keep require current runner build proof in the address and wire answers. CI on `79a1f1ec` failed through `dashboard/tests/support/cursorRunnerHeldReads.ts`, a stand-in of that same runner contract that presented no build proof: new work rightly treated it as stale, stopped the address pid (the test worker's own pid) and started a bundled runner that leaked. Repair `614b490e` is test-support only: the stand-in presents the proof the serving dashboard expects (bundled versus source identity), and its re-keep posts directly because the current-runner probe is itself a held sessions read.
  - Observed effect: one owned CI failure and repair cycle on slice 1; slice 2's in-progress work was stashed and restored around the repair. No production defect was found in the repair.
  - Inference: qualified recurrence of this finding's stand-in clause. Slice 1's proof built its own stand-in (`cursorRunnerProof.ts`) but did not trace every existing stand-in of the changed address/wire contract before publication. No elapsed-time or token cost is measured.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>

Former local code: DD-260.

Repair quiescence checks only writers, so stashing an interrupted agent’s checkout while read-only tests still observe it invalidates the proof. [Evidence and current response](docs/maintainer/findings/ODF-225.md).

## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>

Former local code: DD-261.

A reported GitHub transport failure ends observation and leaves later revisions without notification coverage. [Evidence and current response](docs/maintainer/findings/ODF-121.md).

## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>

Former local code: DD-262.

A focused proof overrides a configured reporter that owns failure policy, making local passing assertions insufficient evidence for the project’s actual verdict. [Evidence and current response](docs/maintainer/findings/ODF-226.md).

## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>

Former local code: DD-263.

A coordinator explicitly requests a temporary reproduction to delete, so product repairs return without a permanent regression test and require another delegation round. [Evidence and current response](docs/maintainer/findings/ODF-227.md).

## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>

Former local code: DD-264.

A long repeated full-suite probe starts and continues on an overloaded shared host without checking load or swap, consuming hours without completing its planned evidence. [Evidence and current response](docs/maintainer/findings/ODF-228.md).

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265.

An interrupted Cursor implementation Task leaves edits but no agent return; the coordinator must reconstruct proof and acceptance from the checkout. [Evidence and current response](docs/maintainer/findings/ODF-229.md).

## ODF-230 — Planned proof relies on a forbidden shared installation <a id="odf-230"></a>

Former local code: DD-266.

Planning settles proof through a temporary mutable dependency link even though execution setup forbids linking another checkout’s installation. [Evidence and current response](docs/maintainer/findings/ODF-230.md).

## ODF-231 — Setup gate misses the project’s exact runtime pin <a id="odf-231"></a>

Former local code: DD-267.

Readiness resolves package-lock installation and typecheck but omits the project’s runtime pin and authoritative setup checker, allowing all delivery on a different runtime. [Evidence and current response](docs/maintainer/findings/ODF-231.md).

## ODF-187 — Planned observations cannot detect regressions <a id="odf-187"></a>

Former local code: DD-268.

Planning prescribes an observation whose claimed discrimination was reasoned rather than demonstrated; executing the proposed proof can pass on the unfixed behavior or conflict with the project’s proof policy. [Evidence and current response](docs/maintainer/findings/ODF-187.md).

## ODF-232 — Acceptance publishes an explicitly unobserved host fact <a id="odf-232"></a>

Former local code: DD-270.

A return explicitly reports native host behavior unobserved, yet acceptance publishes that behavior as factual guidance and records only pending native evidence. [Evidence and current response](docs/maintainer/findings/ODF-232.md).

## ODF-233 — A plan forbids the representation its promised behavior needs <a id="odf-233"></a>

Former local code: DD-272.

A correction’s boundary forbids new record/schema data while its behavior requires a fact the existing entrypoint or record does not supply, leaving a background coordinator to reinterpret scope. [Evidence and current response](docs/maintainer/findings/ODF-233.md).

## ODF-234 — Journey acceptance omits the next state its own guidance promises <a id="odf-234"></a>

Former local code: DD-273.

Acceptance proves a correction’s first successful rerun but omits subsequent or adjacent states produced by the same journey, including explicitly listed untested record states. [Evidence and current response](docs/maintainer/findings/ODF-234.md).

## ODF-223 — A gap disposition substitutes reasoning for its actual guided path <a id="odf-223"></a>

Former local code: DD-277.

Structured story obligations are marked no user cost or proved from a return’s narrow explanation or a helper’s behavior without tracing/running the paths the published guidance directs into that state. [Evidence and current response](docs/maintainer/findings/ODF-223.md).

## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed <a id="odf-235"></a>

Former local code: DD-281.

A slice changes a rebuildable candidate into irreplaceable hand-resolved work but does not trace existing failure exits that abandon it, dropping that resolution to the reflog. [Evidence and current response](docs/maintainer/findings/ODF-235.md).

## ODF-236 — Refactoring removes a deliberate caller behavior difference <a id="odf-236"></a>

Former local code: DD-286.

A refactor deletes a caller override to unify a rule despite knowing it changes that caller’s preserved edge behavior, reporting the choice after editing instead of preserving it. [Evidence and current response](docs/maintainer/findings/ODF-236.md).

## ODF-237 — Unattached launch planning assumes an incompatible capture contract <a id="odf-237"></a>

Former local code: DD-289.

Planning promises landing context for an unattached launch without observing that the capture schema and admission path require a story identity. [Evidence and current response](docs/maintainer/findings/ODF-237.md).

<a id="dd-288"></a>

## ODF-238 — A planned native proof depends on a future release <a id="odf-238"></a>

Former local code: DD-288.

A story’s final paid native observation requires installed skills available only in a release after that story lands, so its starting state cannot exist within the planned execution. [Evidence and current response](docs/maintainer/findings/ODF-238.md).

## ODF-248 — Refactor reruns unchanged consumer proof <a id="odf-248"></a>

Former local code: DD-292.

A refactor repeated the accepted thirty-spec terminal consumer command although only a subset of its observations moved. Existing guidance requires reusing proof whose boundaries remain unchanged. [Evidence and current response](docs/maintainer/findings/ODF-248.md).

## ODF-249 — Whole-suite proof runs before the refactor that invalidates it <a id="odf-249"></a>

Former local code: DD-293.

An implementation agent ran the changed surface's whole suite before the independent refactor pass, and the refactor then moved the measured code, so the suite had to run again on the final state. [Evidence and current response](docs/maintainer/findings/ODF-249.md).

## ODF-250 — A plan's proof table omits an answer state its story scopes in <a id="odf-250"></a>

Former local code: DD-294.

The story's required behavior named three launch answer states; the plan's proof table and slice proof named two, so the implementation return listed the third untested and the coordinator returned the slice for it. [Evidence and current response](docs/maintainer/findings/ODF-250.md).

## ODF-251 — An open Story Branch execution has no guided path to queue a correction it discovers <a id="odf-251"></a>

Former local code: DD-298.

An execution whose story must stay open found discrepancies that needed bounded corrections queued on trunk before it could finish. Its own records reach trunk only at wrap-up, and the launch's landing context is bound to its own worktree, so the coordinator improvised a second worktree and a direct publication. [Evidence and current response](docs/maintainer/findings/ODF-251.md).

## ODF-252 — A story recorded ready still needs developer choices and fixtures before its first slice <a id="odf-252"></a>

Former local code: DD-299.

The plan left "the developer names the observation project, fixture stories, models and time budget at execution setup" and was assessed ready. No configured project held a usable fixture story, so execution's first turn ended in a question and five fixture stories were authored and published mid-execution. [Evidence and current response](docs/maintainer/findings/ODF-252.md).

## ODF-253 — The start command's guidance names the trunk branch but not its flag <a id="odf-253"></a>

Former local code: DD-300.

A native session following the one-shot start instructions passed `--trunk master`, was refused with `missing target`, searched the installed script for the option name, and retried with `--target`. [Evidence and current response](docs/maintainer/findings/ODF-253.md).

## ODF-254 — Accepted proof let a test setup step perform an action the story requires of the product <a id="odf-254"></a>

Former local code: DD-301.

A slice 3 journey made an unknown-ancestry case pass by running `git fetch origin` in the test before expecting completion. The coordinator accepted it as a covered case, although story key example 2 needs completion without anyone fetching another writer's snapshot. The limitation surfaced only when slice 5 listed it as a gap. That cost a returned slice and rewritten lifecycle cases. [Evidence and current response](docs/maintainer/findings/ODF-254.md).

## ODF-255 — A slice's refactor widens a seam that a later slice of the same plan removes <a id="odf-255"></a>

Former local code: DD-304.

In slice 2, the refactor pass moved a shared rule into the records module and re-exported it through coverage, the module whose records re-export slice 5 was planned to drop. The refactor brief carried only the current slice, so the pass could not see that plan direction. Slice 5 then repointed the added names too, and the plan's slice 5 text had to be revised. [Evidence and current response](docs/maintainer/findings/ODF-255.md).

## ODF-256 — Managed delivery accepts a `--repo` that does not match the workspace's remote <a id="odf-256"></a>

Former local code: DD-305.

The coordinator passed `--repo nerds-odd-e/open-dough` for a checkout whose `origin` is `terryyin/open-dough`. It had inferred the repository from the other project in the same task. `deliver` published to `origin` and attached an observer for the named repository. That observer then reported `CI_MONITOR_UNAVAILABLE` (HTTP 404 on `ci.yml`). Nothing compared the supplied repository with the remote the push used. [Evidence and current response](docs/maintainer/findings/ODF-256.md).

## ODF-169 — Stale replay base includes sibling commits <a id="odf-169"></a>

Former local code: DD-306.

A managed-delivery retry carries the old published base instead of its newly reconciled suffix base and replays sibling commits into conflicts. [Evidence and current response](docs/maintainer/findings/ODF-169.md).

## ODF-139 — Reported defect dismissed without checking the story <a id="odf-139"></a>

Former local code: DD-308.

A named gap contradicts the story goal, but acceptance judges it against the plan's narrower scope and delivers it. [Evidence and current response](docs/maintainer/findings/ODF-139.md).

## ODF-257 — Test runs leave detached product children after timed-out teardowns, and the developer found them first <a id="odf-257"></a>

Former local code: DD-310.

Timed-out journeys whose cleanup was abandoned left the product's detached Cursor runners and fake-host clients idling for hours under deleted temp HOMEs; no step of the execution looked for leftovers after proof runs until the developer reported the machine out of memory. [Evidence and current response](docs/maintainer/findings/ODF-257.md).

## ODF-258 — A re-plan decision flagged by the first slice reached the developer only with the last <a id="odf-258"></a>

Former local code: DD-311.

Slice 1's own threshold said a saving under 30 % means re-planning the measured target with the developer; the coordinator recorded it as a decision for the next checkpoint and delivered eight more slices before presenting it. [Evidence and current response](docs/maintainer/findings/ODF-258.md).

## ODF-259 — The CI observer's budget expires inside a long execution <a id="odf-259"></a>

Former local code: DD-313.

The execution observer ends after its eight-hour budget; an execution running longer loses coverage between the expiry and the next managed delivery, which starts a new observer. [Evidence and current response](docs/maintainer/findings/ODF-259.md).

## ODF-260 — A nine-slice story ran about twenty hours without a split <a id="odf-260"></a>

Former local code: DD-314.

The plan started with eight slices and gained a ninth; execution took about twenty hours of wall time with the developer asleep for most of it, and the plan grew past 1,100 lines, while the resplit guidance triggers only above fifteen slices. [Evidence and current response](docs/maintainer/findings/ODF-260.md).

## ODF-261 — Focused test filter matches the execution checkout path <a id="odf-261"></a>

Former local code: DD-315.

A Playwright file regex intended to select review specs also matched the execution worktree's directory name. A successful-looking invocation therefore started a much broader suite before the collected selection was checked. [Evidence and current response](docs/maintainer/findings/ODF-261.md).

## ODF-262 — Permission-only probes split a human click journey <a id="odf-262"></a>

Former local code: DD-316.

Two read-only permission probes each required a human notification click before separate callback probes exercised the operation consuming that permission. Combining consent with a minimal safe operation may reduce manual rounds when permission inspection resolves no independent risk. [Evidence and current response](docs/maintainer/findings/ODF-262.md).

## ODF-263 — Phase artifact capture overwrites newer recovery evidence <a id="odf-263"></a>

Former local code: DD-317.

A native-proof artifact copy retained the older partial context over the completed recovery context. This is a general evidence-retention lesson; no defect in the combined maintenance wrapper or shared publication helper is established. [Evidence and current response](docs/maintainer/findings/ODF-263.md).

## DD-318 — Native JSON hid an existing source-only reviewer

The retained Codex CLI JSON did not expose child-review calls. Acceptance treated
that visibility gap as missing invocation evidence and paid for a revised run
before recovering the first run's existing native child lineage and commitments.

### Occurrences

- Execution: SEED-010#accept-original-story-promises / plan 322, first implementation `02f53118f1da73de68c78485b559af130aa90b84`
  - Timestamp: unknown (2026-10-20, slice 3 release acceptance)
  - Tool: Codex
  - Model: gpt-6.1-sol (native reviewed child)
  - Open Dough release: modified; execution base `415759fb`, guide candidates `2c38a84f` and `dce47a22`
  - Evidence: plan 322 PROOF.md in `9e6caaae`; release attempts `20261020T013331-3987` and `20261020T014019-61f1`, their `native-source-review-provenance.json` supplements, and obligation G3. Actual fork-none lineage, source-only reading and returned commitments were recovered for both runs; stored task plaintext is encrypted and remains unaudited.
  - Observed effect: one additional paid release replay plus bounded native-history recovery; the first reviewer already existed. No fabricated review or improved spawning is established.
  - Inference: qualified one-off. Recover owned native child evidence, when available, before attributing absent CLI events to missing execution or paying to repeat that boundary. Monetary/token savings are unmeasured; no general host limitation is inferred.

## DD-321 — Coordinator behavior edits after the refactor pass skipped independent review

After a native run, the coordinator diagnosed a misclassification and added an observer field, assessor branch and rejection control to the slice's harness itself, after the independent refactor pass, then committed the slice without another refactor or delegated return. Wrap-up allows the coordinator only mechanical formatting and lint repairs at that point.

### Occurrences
- Execution: SEED-010#schedule-proof-after-refactoring / plan 323, first implementation `788d817296adfc0b23a672489619b3ea8bbaf52a`
  - Timestamp: unknown (2026-10-20, between the first native run's end and 2026-10-20T11:04:50+09:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.66 (installed guidance at Take `c6b37d26`)
  - Evidence: plan 323 slice 1 execution record at `6922dc32:.planning/slice-plans/323-schedule-proof-after-refactoring/PLAN.md` (“Diagnosed and corrected in the observer/assessor (`extraction-in-implementation`)”); commit `788d8172` includes that field; the refactor report predates it.
  - Observed effect: about 30 lines of behavior reached delivery with coordinator-run focused proof but no independent refactor judgment; slice 2's refactor later reviewed the same files.
  - Inference: qualified. Execution guidance names no return path for a harness correction discovered by a slice's own paid observation after refactoring; the coordinator chose speed over returning it to implementation and a fresh refactor pass. One occurrence.

## DD-322 — A new cross-host action's focused proof missed the spec pinning the other hosts' entries

Slice 2 offered a separate Stop from the host `stop` fact alone, which also gave Claude/Codex entries a duplicate Stop beside their stopping Mark as done. The slice's focused proof ran the Cursor stop and existing done specs but not `recently-done-story-sessions.spec.ts`, which pins those entries; CI caught it and a two-file repair (`fa05f9ec`) narrowed the offer to hosts whose Done does not already stop.

### Occurrences

- Execution: SEED-052#safe-cursor-session-stop, plan 327, first implementation `f121d999c5f10c9a0f944263302f0c4454abbeb0`
  - Timestamp: unknown (2026-10-20, slice 2 delivery through the CI repair at `fa05f9ec`)
  - Tool: Cursor
  - Open Dough release: unknown
  - Evidence: CI run 39376174156 failure in `recently-done-story-sessions.spec.ts`; repair commit `fa05f9ec` (`sessionCapabilities.ts`, `sessionRecordActions.tsx`); plan 327 slice 2 proof named existing Claude/Codex done specs as its unchanged-host proof.
  - Observed effect: one owned CI failure and a repair cycle that paused slice 3 work (restored afterward through the CI-repair stash flow) before delivery could continue.
  - Inference: qualified one-off. When a capability fact changes what every host's entry offers, the focused proof set needs the specs that pin the unaffected hosts' entries, not only the changed host's journeys and the shared flow's own specs. No elapsed-time or token cost is measured.

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

Existing shared finding: [meaning and retained evidence](docs/maintainer/findings/ODF-264.md). This execution adds an occurrence under that established code; no new code or mapping is allocated.

### Occurrences

- Execution: SEED-010#format-owned-changes / plan 325, first implementation `43ff9dde9762edf400703c2925210383057e8522`
  - Timestamp: unknown (2026-10-20, startup retrieval)
  - Tool: Codex
  - Open Dough release: 0.3.66 (checkout-bound installed guidance, unchanged)
  - Evidence: coordinator functions.exec startup batches reported truncated outputs of 25,036 and 18,445 original tokens, followed by bounded rereads of CI adapter/runtime, delivery, completion and source context before delegation. Later acceptance retrieval also printed an overlarge pair-comparison object before a scalar-only check.
  - Observed effect: requested authoritative passages were omitted and had to be retrieved again; repeated reads and duplicated output occurred within this one execution.
  - Inference: the existing targeted-retrieval instruction already covered this case. Bound independent batches by response budget and print only needed evidence fields. No elapsed-time or aggregate-token saving is measured, and calls within this execution are not additional occurrences.

- Execution: SEED-010#observe-retrospective-response-effectiveness / plan 328, first implementation `1219b54819763f72d3de87df0a788adcc77682e2`
  - Timestamp: unknown (2026-10-20, execution startup)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed execute-plan guidance)
  - Evidence: coordinator startup batches returned truncated outputs of 28,741 and 17,440 original tokens; subsequent targeted reads recovered delegation, delivery/publication and ADR/refactor context before implementation and delivery. Current coordinator conversation and the plan's execution context identify this run.
  - Observed effect: passages were omitted and retrieved again, adding repeated tool output and reading within this execution. All required context was recovered before its dependent boundary; no dropped obligation is established.
  - Inference: same broad-retrieval mechanism as the retained occurrence. Apply the existing targeted-retrieval instruction at each batch; no new guidance or measured time/token saving is established. Multiple truncated calls remain one occurrence.

- Execution: SEED-145#quiet-land-and-wrap-up / plan 331, first implementation `94c6c3767a9f9048ad8e05c8b5ec6306f6b53dc5`
  - Timestamp: unknown (2026-10-20, startup retrieval)
  - Tool: Codex
  - Open Dough release: 0.3.66 (checkout-bound installed execution guidance, unchanged)
  - Evidence: coordinator startup batches returned truncated outputs of 25,079 and 19,040 original tokens; bounded rereads recovered delegation, CI runtime/adapter, delivery and ADR context before dependent work. Later catalog retrieval was also oversized; current coordinator history identifies the observations.
  - Observed effect: omitted authoritative passages had to be retrieved again, adding repeated output and reading. Required context was recovered before its dependent boundary; no lost obligation is established.
  - Inference: same broad-retrieval mechanism and existing targeted-retrieval remedy. Multiple truncated calls remain one occurrence; no measured time/token saving or new implementation response is claimed.

- Execution: SEED-146#gate-local-prerequisites-before-commit-and-delivery / plan 331, first implementation `4a1fb686b9b30c83403172f017a0271879d5eb71`
  - Timestamp: unknown (2026-10-20, startup retrieval)
  - Tool: Codex
  - Open Dough release: 0.3.66 (checkout-bound installed execution guidance, unchanged)
  - Evidence: coordinator startup batches returned truncated outputs of 20,586 and 17,431 original tokens; bounded rereads recovered delegation, CI/runtime, delivery and ADR context before dependent boundaries. The execution and proof remain recoverable at `60c164841e0ca9178a80702e595d3c0c6b826038:.planning/slice-plans/331-gate-local-delivery-prerequisites/PLAN.md`.
  - Observed effect: omitted authoritative passages were retrieved again, adding repeated output and reading. Required context was recovered; no lost obligation is established.
  - Inference: same broad-retrieval mechanism as ODF-264; existing targeted retrieval applies. One execution, no measured time/token saving or new response claim.

- Execution: SEED-145#continue-execution-into-wrap-up / plan 333, first implementation `c14f425972240b170c8e64037fbf5428c64f278c`
  - Timestamp: unknown (2026-10-20, execution startup)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed execute-plan guidance)
  - Evidence: coordinator startup batches reported truncated outputs of 16,650, 22,919 and 18,283 original tokens; subsequent bounded reads recovered execution, CI, publication and ADR context before dependent work. Current coordinator and delegated implementation/refactor history identify this execution.
  - Observed effect: omitted passages required repeated retrieval and reading; the same execution produced multiple truncated batches. Required context was recovered before delegation/delivery; no lost obligation is established.
  - Inference: this repeats ODF-264's retrieval mechanism; the existing targeted-retrieval instruction applies. No new process response or measured saving is claimed.

## DD-323 — A delegated native probe ended a pending consent prompt and recorded a refusal

An implementation agent probing a new macOS notification identity ended the
sending process while the system's first-use permission prompt was still
waiting. macOS recorded Denied for that identity, so a promised first-use
consent observation became a human recovery round instead.

### Occurrences

- Execution: SEED-144#recognize-opendough-by-its-icon / plan 326, first implementation `80dbc29e94e697a9423c360f6b6398f186256a65`
  - Timestamp: 2026-10-20T13:20+09:00 (approximate, slice 1 native probe)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance at execution base `1ffb8c69`
  - Evidence: slice 1 return ("I killed that waiting process … macOS recorded denied"); screenshots `prompt-1-corner.png` then `after-kill-corner.png` in the job scratch directory; plan 326 slice 1 learnings.
  - Observed effect: the developer had to enable Notifications → Open Dough by hand across three coordinator questions (one accidental dismissal); a per-identity `tccutil` reset failed and a global reset was rightly refused. The natural first-use prompt was not observed again.
  - Inference: delegation authorized the native probe but named no rule that a one-shot system consent must be left to its human answer. Before a native step that can raise a one-shot consent, tell the agent to leave the requesting process running and hand the prompt to the developer. One occurrence; generality unconfirmed.

## DD-324 — Coordinator screen probes competed with the developer's live desktop

To observe system UI, the coordinator repeatedly brought System Settings and a
test browser to the front and resized windows on the developer's own desktop,
while the developer was also working there and answering its questions.

### Occurrences

- Execution: SEED-144#recognize-opendough-by-its-icon / plan 326, first implementation `80dbc29e94e697a9423c360f6b6398f186256a65`
  - Timestamp: 2026-10-20T14:03+09:00 to 14:08+09:00 (slice 2 click and Automation observation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown; installed guidance at execution base `1ffb8c69`
  - Evidence: coordinator `open x-apple.systempreferences…Privacy_Automation` and `set bounds of window 1` calls; screenshots `automation*.png` showing the developer's dashboard and terminal in use; the developer's reply "I will stop. you can takeover now".
  - Observed effect: the developer stopped their own work to yield the screen; the Automation entry name still could not be read (no scrolling without UI scripting), so the recovery wording became name-neutral.
  - Inference: a desktop observation needing the foreground should be batched and announced once (what will pop up, for how long), or replaced by an off-screen route (a headed test browser with its own profile worked for the tab and bookmark check). Qualified one-off.
