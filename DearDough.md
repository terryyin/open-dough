# DearDough Process Findings

Retained material shared-process findings, reviewed 2026-10-09. Only an explicit
queued follow-up is planned work; other entries are open and unqueued. A retained
released response is not proof of effectiveness. Unknown provenance stays unknown.
[Response status](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md).
Full pre-trim evidence: `9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:DearDough.md`; later trims: `a41f9d577be06030ed6da17a4ddd2139c7f79aea:DearDough.md`, `56e7b8944eabf6e49230b1ee4046be30183e11e2:DearDough.md`. Older narratives live in Git, not a second archive.

- Highest allocated local number: 260. Removed local codes are never reused.

Detailed retained observations are consolidated in the linked Open Dough
record; headings and former local aliases preserve traceability. Review date:
2026-10-09 (Asia/Tokyo).

## ODF-087 — Cheap worktree-readiness substitutes can pass while native hosts skip the gate

Former local code: DD-089.

Native execution can implement the requested outcome without the required checkout preparation and command check, while substitute actors and wording checks pass.

Follow-up: Open, unqueued.

Evidence and response: [ODF-087](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-087).

## ODF-059 — Delegated refactor pass stalled after editing and before reporting

Former local code: DD-057.

A host-terminated refactor agent leaves changes without a report, requiring recovery from the actual diff and unresolved proof.

Follow-up: Open, unqueued.

Evidence and response: [ODF-059](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-059).

## ODF-154 — Cursor managed delivery lacks its coordinator session identity

Former local code: DD-095 (plan 126 Cursor occurrence only).
Former local code: DD-231.

Cursor’s first managed delivery lacks conversation/generation identity, requiring a manual observer start and registration.

Follow-up: released in 0.3.57; effectiveness unverified, watch start unknown.

Evidence and response: [ODF-154](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-154).

## ODF-074 — A ready plan named a validation command the backlog tool does not have

Former local code: DD-121.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-074](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-074).

## ODF-110 — A publisher-seam premise was observed by reading the seam, not the race it had to stop

Former local code: DD-124.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-110](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

## ODF-156 — A slice-acceptance obligation recorded as a plan learning never reached the next delegation

Former local code: DD-126.

A required later-slice check recorded as a plan learning is omitted from that slice's delegation and acceptance.

Follow-up: implemented, unreleased; release verification and watch pending: [Keep reported gaps owned through the story's remaining slices](https://github.com/terryyin/open-dough/blob/ac8bdb6ca16dd347189867ef1df60a2ccd078c93/.planning/seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned) — SEED-125#keep-reported-gaps-owned.

Evidence and response: [ODF-156](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-156).

## ODF-157 — A "no other location" premise was swept with the removed rule's words, missing the concept's other wording

Former local code: DD-127.

An identifier/permission-word sweep misses the same concept expressed in prose, allowing a removal's contradictory guidance to survive.

Follow-up: Open, unqueued.

Evidence and response: [ODF-157](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-157).

## ODF-158 — Execute-plan's required reference reads cost more than a clean one-slice run used

Former local code: DD-128.

Startup boundary instructions require broad references for a small execution whose managed commands already own most of those paths.

Follow-up: Open, unqueued.

Evidence and response: [ODF-158](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-158).

## ODF-106 — Two plans planned concurrently on different checkouts both took number 132

Former local code: DD-155.

Concurrent unpublished plan allocation produces two quick plans with the same numeric selector, making a number-only execution request ambiguous.

Follow-up: Open, unqueued.

Evidence and response: [ODF-106](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-106).

## ODF-141 — A delegated refactor pass ran on each of two tiny guidance changes and edited nothing

Former local code: DD-192.

Every small slice launches a fresh full refactor agent even when the accepted diff needs no further changes, creating substantial repeated cost.

Follow-up: Open, unqueued.

Evidence and response: [ODF-141](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-141).

### Occurrences
- Execution: `SEED-122#running-cursor-sessions-sidebar-panel` / plan 279, first implementation `426c42fb`.
  - Timestamp: unknown (2026-10-10, between 09:43 and 13:31 +09:00).
  - Tool: Claude Code coordinator and delegated agents.
  - Model: `claude-opus-5-5`.
  - Open Dough release: 0.3.57 installed in the execution checkout; provenance otherwise unknown.
  - Evidence: CI repair `f64da99b` changed nine lines of one spec (`published-work.spec.ts`); its delegated refactor pass reported no edits (about 48.6k subagent tokens, 38 s). The second repair's pass (`722a7b36`) did find and remove a duplication, so the pass is not always empty on a small repair.
  - Observed effect: one full refactor delegation with no change.


## ODF-201 — Codex stream notifications leave handled failures unread at completion

Former local code: DD-200.
Former branch-local code: DD-198; moved with this execution’s findings after the concurrent allocation collision.

The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

Follow-up: released in 0.3.57; effectiveness unverified, watch start unknown.

Evidence and response: [ODF-201](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-201).

## ODF-074 — A plan left a decisive browser-delivery premise open for the developer though it was locally observable

Former local code: DD-206.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-074](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-074).

## ODF-110 — A plan's consumer premise for an admission rule swept function callers, missing specs that relaunch the same story

Former local code: DD-213.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-110](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

## ODF-204 — An interrupted refactor agent went on to commit and push its slice

Former local code: DD-215.

After its call is interrupted, a delegated agent continues, commits and pushes its slice despite a no-commit delegation, leaving two writers in one checkout.

Follow-up: Open, unqueued.

Evidence and response: [ODF-204](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-204).

## ODF-205 — Execution started on a red trunk and spent CI triage on a failure it did not own

Former local code: DD-217.

Startup does not report that the target trunk is already failing CI, so each branch publication re-raises a failure the execution does not own.

Follow-up: Open, unqueued.

Evidence and response: [ODF-205](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-205).

## ODF-152 — An unconditional file-size check stopped a refactor with no conceptual candidate

Former local code: DD-219.

An absolute changed-file size check conflicts with an approved staged decomposition and mechanical edits to pre-existing oversized callers.

Follow-up: Open, unqueued.

Evidence and response: [ODF-152](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-152).

## ODF-209 — An asynchronous CI repair's repeated reproductions ran beside the slice's full suite on one machine

Former local code: DD-221.

Asynchronous CI repair runs many-worker repetitions alongside a slice’s full suite on the same machine, producing load-only failures and slower proof.

Follow-up: Open, unqueued.

Evidence and response: [ODF-209](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-209).

## ODF-110 — A removal premise swept client names but missed server and fixture consumers

Former local code: DD-228.

A replay resolves the named readiness seam without exercising the rest of the slice's promised journey, leaving a later operation to force a scope stop.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-110](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-110).

## ODF-210 — Removing a panel path lost the only Mark as done of cardless unavailable reported sessions, unseen until retrospective

Former local code: DD-234.

A removal traces what a path displays but misses what it lets the user do, delivering a capability loss caught only by retrospective.

Follow-up: Open, unqueued.

Evidence and response: [ODF-210](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-210).

## ODF-211 — A retrospective correction of an unlanded story could not be admitted where its code lives

Former local code: DD-237.

An accepted retrospective correction is directed toward admission on remote trunk although it needs its active story branch’s unlanded code.

Follow-up: Open, unqueued.

Evidence and response: [ODF-211](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-211).

## ODF-074 — A plan gave a shared operation a story-specific effect without checking callers that use it with another meaning

Former local code: DD-238.

Concrete only-caller and host-state premises enter a plan without inspection, forcing a changed decision or stopped implementation when checked.

Follow-up: delivered, unreleased: [Observe decisive planning premises through the full promised journey](https://github.com/terryyin/open-dough/blob/c1875574c4f0b5a6703d7a3e45e981e5e9cd9227/.planning/seeds/SEED-108-planning-observations-cover-promised-journeys.md#observe-promised-journey) — SEED-108#observe-promised-journey.

Evidence and response: [ODF-074](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-074).

## ODF-217 — A refactor return called a styling change a merge of identical rules, and acceptance did not read the hunk

Former local code: DD-239.

A refactor return calls changed behavior identical or type-only, and accepted proof is reused without checking the actual changed surface and its reached consumers.

Follow-up: Open, unqueued.

Evidence and response: [ODF-217](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-217).

## ODF-218 — A refactor file-size check was invalidated by the required downstream formatter

Former local code: DD-241.

The mandatory formatter expands a file after its independent size check, requiring a second refactor and formatter pass solely for layout.

Follow-up: Open, unqueued.

Evidence and response: [ODF-218](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-218).

## ODF-201 — The Codex observer binding has no durable failure acknowledgment step

Former local code: DD-242.

The Codex stream binding notifies CI failures without advancing the durable delivery cursor, so completion retains shutdown for failures already repaired.

Follow-up: released in 0.3.57; effectiveness unverified, watch start unknown.

Evidence and response: [ODF-201](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-201).

## ODF-219 — A background coordinator implemented its single slice itself

Former local code: DD-245.

Background coordinators implement tiny Structure or probe slices themselves despite delegation limiting local implementation to a single interactive slice.

Follow-up: Open, unqueued.

Evidence and response: [ODF-219](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-219).

## ODF-217 — A refactor return's proof-effects section left reached consumers unrun, once on a wrong "type-only" claim

Former local code: DD-248.

A refactor return calls changed behavior identical or type-only, and accepted proof is reused without checking the actual changed surface and its reached consumers.

Follow-up: Open, unqueued.

Evidence and response: [ODF-217](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-217).

## ODF-100 — The coordinator committed after the selective formatter reported unresolved lint findings

Former local code: DD-251 (plans 264 and 271 only).

A formatter piped through tail returns the final pipeline stage's success, allowing subsequent delivery steps after formatter failure.

Follow-up: Open, unqueued.

Evidence and response: [ODF-100](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-100).

## ODF-097 — A failed format result was followed by a commit attempt

Former local code: DD-251 (plan 273 only).

A failed formatter or verification result is visible but does not gate the next commit or publication step.

Follow-up: Open, unqueued.

Evidence and response: [ODF-097](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-097).

## ODF-222 — Managed story-branch delivery can stall after a successful agent-commit

Former local code: DD-253 (Cursor plan 273 only).

Managed delivery remains alive after a successful commit while its remote story-branch tip remains behind; the blocking subprocess is not located.

Follow-up: Open, unqueued.

Evidence and response: [ODF-222](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-222).

## ODF-184 — An unbounded SSH fetch stalled managed delivery

Former local code: DD-253 (Claude Code plan 274 only).

An SSH fetch or push has no time bound, leaving managed delivery waiting without a terminal failure while the remote tip remains unpublished.

Follow-up: queued, not resolved: [Managed delivery stops a stalled Git transport with a recoverable result](https://github.com/terryyin/open-dough/blob/main/.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#bound-managed-git-transport) — SEED-008#bound-managed-git-transport.

Evidence and response: [ODF-184](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-184).

## ODF-220 — A plan's code findings went stale on trunk with no signal before delegation

Former local code: DD-254.

Code observations were true during preparation but sibling delivery changes them before execution; document-basis change notices do not identify the stale code premises.

Follow-up: Open, unqueued.

Evidence and response: [ODF-220](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-220).

## ODF-221 — A CI repair fixed one spec's race and left the same race in a sibling spec from the same slice

Former local code: DD-255.

A CI repair fixes only the reported spec although a sibling written by the same slice has the diagnosed race, causing separate later CI failures and a second repair.

Follow-up: Open, unqueued.

Evidence and response: [ODF-221](https://github.com/terryyin/open-dough/blob/main/docs/maintainer/finding-names.md#odf-221).

### Occurrences
- Execution: `SEED-122#running-cursor-sessions-sidebar-panel` / plan 279, first implementation `426c42fb`.
  - Timestamp: 2026-10-10T13:49:58+09:00 (repair commit `722a7b36`).
  - Tool: Claude Code coordinator and delegated agents.
  - Model: `claude-opus-5-5`.
  - Open Dough release: 0.3.57 installed in the execution checkout; provenance otherwise unknown.
  - Evidence: run 38024406264 `dashboard (4/9)` failed `agent-launch-done-prompt.spec.ts:44`; the repair report named four older specs with the same wall-clock rename deadline and wider margins (`agent-launch-done.spec.ts`, `-rename-wait`, `-question`, `agent-completion-quiet-claude.spec.ts`) and left them, as the delegation's scope said.
  - Observed effect: the diagnosed class of race remains in sibling specs; none has failed yet. The siblings predate this execution, unlike the original finding's same-slice sibling.
  - Inference: matching is by cause, with that difference; the retrospective recommended a follow-up story rather than widening the repair.


## DD-258 — Native replay fixtures changed the retained acceptance checkpoint

Slice 4's first receiving-slice and interim fixtures supplied a fresh acceptance
checkpoint with absent product proof, rather than the historical retained
acceptance. They also omitted later ownership and the dictation story's
no-rejection constraint. Both native coordinators kept the gap open as a
current-slice return, leaving the intended later-slice journeys unobserved.

### Occurrences
- Execution: `SEED-125#keep-reported-gaps-owned` / plan 283, first implementation `43ef3b9b`.
  - Timestamp: unknown (2026-10-10, first native replay attempts, before slice 4 delivery).
  - Tool: Codex coordinator; native Claude Code 2.1.296 / `claude-opus-5-5`.
  - Open Dough release: modified; replay payload `ce0aaa3c`, base 0.3.57.
  - Evidence: plan 283 slice 4 accepted proof and limits, recoverable at `5bd862746d2789e9c34d05276a507f908d141bc7:.planning/slice-plans/283-keep-reported-gaps-owned/PLAN.md`; initial native sessions `a9c48f45-a2f1-4d43-a226-a44e7dcc0a27` and `53ee6bf5-8400-4825-b8e1-65cfe4f47160`. Both recorded `return` and observed `open-obligation`; prompts supplied no expected disposition. Diagnosed fixture corrections preceded two fresh sessions with same-session dependent checkpoints. Spent artifacts were deleted after assessment under ADR 0005.
  - Observed effect: two inconclusive paid calls (native CLI reported about $0.72 combined), fixture reconstruction and two replacement sessions; no product guidance change or false passing claim.
  - Inference: qualified to this execution. Review a native fixture against the exact retained checkpoint, independently accepted proof, relevant whole-story constraints and ownership facts before launch. Distinguish archived text from replay construction; keep the expected record out of prompts.

## DD-259 — A slice's consumer search followed selectors and helpers and missed a spec that reads the whole page's text

Slice 1 moved the Sessions sidebar's “Running Cursor sessions” header below the
session list. Its consumer search grepped class names, helper imports and the
section's name, and ran 42 then 51 specs. `published-work.spec.ts` matches none
of those: it checks the whole `body` text, hidden sidebar included, against a
word-boundary pattern, and the reorder put a boundary before “Running”.

### Occurrences
- Execution: `SEED-122#running-cursor-sessions-sidebar-panel` / plan 279, first implementation `426c42fb`.
  - Timestamp: 2026-10-10T09:43:50+09:00 (CI failure; slice commit `426c42fb` at 09:40:36).
  - Tool: Claude Code coordinator and delegated agents.
  - Model: `claude-opus-5-5`.
  - Open Dough release: 0.3.57 installed in the execution checkout; provenance otherwise unknown.
  - Evidence: run 38010086816 `dashboard (3/9)`, `published-work.spec.ts:175`; repair `f64da99b`; plan 279 slice 1 learnings. The plan's verification section says the hosted dashboard checks are not an extra local all-suite gate.
  - Observed effect: one CI failure on a published slice, one stash/repair/refactor/publish cycle while slice 2 was in progress.
  - Inference: qualified to this execution. A change to where text sits in the page reaches assertions over a container's whole text; a search by selector cannot find them. Possibly the same family as ODF-110, whose rows concern plan premises rather than a slice's own search.

## DD-260 — A CI repair stash was taken while a failed agent's test run was still observing the tree

The slice 2 implementation agent stopped on an API error. Before the repair
stash the coordinator checked the checkout's processes, saw only fixture
servers (`vite preview`, the Cursor runner) and no editor, and stashed. The
resumed agent later reported that its first full run overlapped the stash,
took 3.1 hours of wall-clock and showed 24 failures on a mixed tree.

### Occurrences
- Execution: `SEED-122#running-cursor-sessions-sidebar-panel` / plan 279, first implementation `426c42fb`.
  - Timestamp: unknown (2026-10-10, between 09:43 and 13:31 +09:00).
  - Tool: Claude Code coordinator and delegated agents.
  - Model: `claude-opus-5-5`.
  - Open Dough release: 0.3.57 installed in the execution checkout; provenance otherwise unknown.
  - Evidence: coordinator process listing before `ci-repair-stash.mjs save` (pids 40093/40099, 46072/46432, 71730/71948); the slice 2 return's “Invalidated run (not counted)” section; the same three server pairs, started 10:58, 11:47 and 11:52, were still alive after the last delivery at 14:10.
  - Observed effect: no lost work and no false proof — the agent discarded the run and reran all 46 specs (112 passed). One full suite run was wasted, and orphaned fixture servers outlived their runs until the coordinator ended them by pid.
  - Inference: qualified. The pause contract's quiescence check names write-capable commands; a read-only suite is not a writer, yet a stash under it invalidates its result. Live fixture servers were a visible sign of a run in flight. Whether the orphans came from the interrupted run or from fixture teardown is not established.
