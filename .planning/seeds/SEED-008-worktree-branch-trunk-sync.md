---
id: SEED-008
status: active
planted: 2026-09-08
planted_during: unknown
trigger_when: when evaluating or designing branch/worktree workflows for trunk-based development
scope: unknown
---

# SEED-008: Execute stories with continuous trunk integration

## Why This Matters

Developers and agents prepare changes in owned workspaces and share validated
increments through the project's remote trunk. The same publication contract
serves worktrees on one machine and clones on different machines. The default
local checkout is optional and may remain the developer's playground. Automated
work derives its shared baseline and publication evidence from the authorized
remote branch; safe local refresh is a separate convenience.

The selected direction is described in
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Terry authorized this backlog alignment on 2026-09-21. The ADR retains Proposed
status; this seed records desired outcomes for implementation planning. Terry's
2026-09-28 decision below replaces the proposed default-checkout coordination
outcome without changing ADR status or execution authority.

## Stories

<a id="accept-queued-start-native-behavior"></a>

### Queued-start native acceptance completed

The identity `SEED-008#accept-queued-start-native-behavior` is retired: startup
native acceptance is complete on Codex, Cursor, and Claude Code (Terry's
decision of 2026-09-24 to run the last check outside the executing plan 089).
Ordinary startup, refusal, and Codex/Cursor resume were accepted in plan 82,
recoverable from
`820077c3e7fcf16421c97231eb5bc01bb69ea3dc:.planning/slice-plans/082-accept-queued-start-native/PLAN.md`.
The behavior has been released since 0.3.27, so this is retroactive acceptance.

- **Claude resume: fresh pass (2026-09-24).** Claude Code `2.1.281`, candidate
  `7581b2b`, `publication/startup-resume`. The trace shows only an inspecting
  `--help` before a single startup call returning `resumed` with
  `created: false`, then setup and command, then the first feature edit. The
  fixture origin holds base, exactly one pre-created claim, and the independent
  advance; no claim was pushed again. Human and selected-source bytes were
  preserved and the local refresh was deferred. Run output and the fixture were
  deleted after judging.
- **Candidate reconciliation.** Since accepted candidate
  `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`, `publication-resume.mjs` only
  parameterizes the remote name, the Take guidance only relaxes
  default-checkout refresh declarations, and the startup fixture/assessor split
  setup and command markers more strictly. None invalidates the earlier host
  judgments.

<a id="bound-managed-git-transport"></a>

### Managed delivery stops a stalled Git transport with a recoverable result

**Identity:** SEED-008#bound-managed-git-transport
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/285-bound-managed-git-transport/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7c9e03a8aa7cea3288d6a41712ddfff96a1f3a06a53292f6ddcead4bdecb77e2","plan":"fd580c4fc77cf6161991e37170a7ed49af2eccc9ca90ba879bd6fd2fffa024b9"}}
```

**Beneficiary:** A coordinator publishing an increment through managed
delivery, and the developer waiting for that increment's remote visibility and
CI verdict.

**Goal:** When a fetch, push, or remote-tip read inside managed delivery stops
responding, the delivery ends within a known bound with an explicit transport
stop instead of waiting indefinitely. The stop names the stage that stalled,
preserves the committed candidate and the publication facts observed so far,
and leaves the next step safe and unmistakable: run the same delivery again,
and a candidate the remote already accepted is recognized rather than pushed
twice. The two proven stalls cost about 25 and 50 minutes of idle delivery
each and ended only when a person found and killed the hung process. After
this story a stall costs a bounded wait and one retry, with no guessed success
and no duplicate publication.

**Observed basis (refinement, 2026-10-09):** Every managed fetch, push, and
remote-tip read runs through the shared `git()` helper in
`publication-git.mjs` as an unbounded `execFile`. A transport that never
answers never rejects, so `deliver` and `resume` never return. Were the helper
to throw instead, the command-line entry would print the bare message and exit
2 without the structured result that carries the candidate, remote tip, and
base. Ordinary transports in the retained evidence answer in seconds: a manual
fetch in about 2 seconds, a redelivery accepted in about 12 seconds, the
pygardon retry accepted at once. The proven stalls lasted about 15 minutes on
a fetch and about 49 minutes on a push, and in the push case the CI adapter's
own fetch timed out in the same window, so the network was dead rather than
slow. The existing resume classification already answers the post-push
question correctly: after a fetch, a candidate that is an ancestor of the
target is published and must not be pushed again.

**Scope:**

- Bound each remote transport command managed delivery runs, in `deliver` and
  `resume`: every fetch, every push, and every remote-tip read, including the
  fetch after a rejected push and the confirmation fetch and tip read after a
  push. Decision: the bound is 120 seconds per command. That is about ten
  times the slowest ordinary transport in the evidence and well under the
  shortest proven stall, so a dead transport stops in minutes and a slow but
  responsive one still finishes. One environment setting raises it for an
  unusually slow network; nothing else configures it. Ending the command ends
  the whole stalled process tree, including the `ssh` child that Git started:
  a plain child timeout returns on time but leaves that `ssh` orphaned on the
  dead connection (observed during planning), so the bound ends the process
  group.
- Report a transport stop as a structured delivery result, like `conflict` and
  `persistent-contention` today: `publication: stopped` with its own status,
  the stage that stalled (which fetch, which push, or the tip read), the remote
  and target, the bound that elapsed, the candidate SHA, the pre-rebase SHA,
  the previously published base, the suffix base, the last fetched remote tip,
  and whether a push had been issued when the stall happened. The process
  prints that result as JSON and exits with the code other stops use, so a
  coordinator reads the stop from the result rather than from the process
  tree. The stop rewrites nothing: the candidate commit, branch, index, and
  working tree stay as they were when the stalled command started.
- Keep every publication guarantee: no force push, no second publication
  sequence, no rewriting of published revisions, candidate revalidation after
  a reconciliation exactly as today, and registration of the accepted SHA with
  the established observer once acceptance is confirmed.
- Make the retry after a stop safe. A stop before any push is retried by
  running the same `deliver` again. A stop during or after a push leaves
  acceptance unknown: the retry first establishes the actual remote tip by
  fetching and testing ancestry, as resume already does; a candidate the
  remote already holds is reported accepted without another push and is
  registered with its owner; a candidate the remote does not hold follows the
  ordinary publish path, with the one reconciliation retry it has today.
  Across a stall and its retry the candidate is pushed at most once more.
- Tell the coordinator what the stop means. The managed-delivery guidance
  names the transport stop, says the candidate is preserved, and says which
  command retries it; it does not ask the coordinator to inspect processes or
  kill anything.
- The observation step that `deliver` runs before publishing keeps its own
  bounds and is outside this transport bound. An unavailable observer bridge
  still leaves remote acceptance intact, as today.

**Deferred promises:** Other publication commands that call the same shared
helper (preparation start, release, and abandon; Dough Land's landing and
retirement; wrap-up closure; the startup claim) may inherit the bound through
that helper, but this delivery promises no new result shape or guidance for
them. ODF-222's stall at an unlocated stage is not assumed fixed by this
response. No observer transport retry, dashboard change, SSH keepalive
configuration, progress-based inactivity detection, or general shell timeout
framework is built. Deferral rejects none of these.

**Key examples / evaluation:**

Each example runs against an isolated real Git remote whose transport can be
made to stall at a chosen point, so the stop and the retry are observed on
actual fetch and push commands rather than on a stubbed helper.

1. A committed candidate extends the published base; the first fetch in
   `deliver` never answers → within the bound, `deliver` returns the transport
   stop naming that fetch, the candidate SHA, and the base; no push was issued;
   the remote tip is unchanged; the workspace is untouched → the same `deliver`
   is run again on a responsive transport → the candidate is pushed once,
   accepted, and registered with the established owner.
2. Same start; the fetch answers and the push never answers while the remote
   never receives the candidate → the stop names the push with acceptance
   unknown → the retry fetches, finds the candidate absent, pushes it once,
   confirms acceptance, and registers it.
3. Same start; the remote accepts the candidate but the push's answer is lost
   → the stop names the push with acceptance unknown → the retry fetches,
   finds the candidate already an ancestor of the target, pushes nothing, and
   reports acceptance with the candidate registered to its owner; the remote
   history holds the candidate once.
4. The target advanced since the base; the first push is rejected and the
   fetch before the reconciliation stalls → the stop names that fetch and the
   rejected candidate, and the workspace still holds the suffix unrewritten →
   the retry reconciles onto the fetched tip, revalidates, and publishes.
5. A slow but responsive transport that answers well within the bound →
   delivery succeeds exactly as today, with no transport stop in the result.
6. The same stalled fetch under `resume` → the same transport stop with the
   candidate preserved and no push.

**Architecture:** The bound belongs to the shared transport helper in
`publication-git.mjs`, applied only to fetch, push, and remote-tip reads, not
to local Git commands. The structured stop belongs to the publication sequence
in `execution-increment-publication.mjs` and to the resume classification,
which already own the other stops, so the delivery and resume entry points
surface it in their existing result shape. Decisive premise for planning: a
real-Git fixture can stall a fetch, stall a push before acceptance, and lose a
push's answer after acceptance at a chosen point, and ending the bounded
command actually ends the stalled process tree; observe both before building
on them. No new ADR is needed; ADR 0009 stays Proposed and nothing here changes
the publication contract it describes.

**Supporting finding:** [ODF-184](../../docs/maintainer/finding-names.md#odf-184).
The catalog retains the two proven SSH transport executions and separately
qualified ODF-222. No prior transport-bound response is demonstrated.

**Completion criterion:** Delivered transport behavior and focused proof meet
the outcome; record the actual response commits and first containing release
on ODF-184. Keep its effectiveness unverified until matching released use.

**Depends on:** None. Observer ownership is separate queued work and does not
block bounding transport.

**Safe stopping point:** A stalled publication leaves an actionable result and
recoverable candidate even if CI or other delivery improvements are deferred.

## Publication delivery boundaries

**Parent problem:** Developers executing concurrent work need reliable shared
claims and delivery with less routine agent coordination. Preserve authority,
user work, and truthful remote/CI evidence while reducing total instructions.

**Reviewed decomposition (2026-09-23):** The installed startup operation;
ordinary execution publication plus CI attachment, delivered by plan 083
(recoverable at `463c48a:.planning/slice-plans/083-publish-execution-ci/PLAN.md`);
preparation keep; and closure. The previous separate execution-increment candidate
duplicated the CI story's publication boundary and was absorbed there.
Preparation keep and closure adoption are delivered by the
[Dough Land](../../src/skills/dough-land/SKILL.md) skill. No separate
library, command-framework, or testing-only story is required.

**Alternatives and limits:** Another instruction-only reminder repeats a rule
already installed during the incident. The startup and execution-publication
outcomes remain distinct from the combined Dough Land outcome. Each includes only
the runtime, concise guidance, payload delivery, and proof its outcome needs.

**Effort hypothesis:** No project S/M/L definitions were found. Startup carries
the greatest initial runtime/native-adoption uncertainty. The combined CI/delivery
story adds candidate revalidation and existing-observer attachment, not a new
observer lifecycle. Estimates remain unassigned
pending planning evidence.

<a id="publish-execution-increments-through-shared-operation"></a>

### Execution-increment candidate absorbed into CI delivery

The proposed identity `SEED-008#publish-execution-increments-through-shared-operation`
was never queued. Its outcome was absorbed into the managed execution delivery
of plan 083, avoiding two stories that each wire the same publication boundary.
This is a retired navigation reference, not another candidate.

### Priority rationale and scope reduction

The [product backlog](../PRODUCT-BACKLOG.md) is the sole ordered queue.

- Startup addressed the reproduced claim-visibility failure; its remaining
  native acceptance is complete on all three hosts.
- Managed execution delivery and CI observation shipped in 0.3.33. Terry dropped
  its separate native-acceptance story on 2026-09-24: projects use it
  continuously, deterministic tests cover the mechanism, and a missing or false
  CI signal reported from real use goes through bug fixing. No native
  acceptance is claimed for it.
- Published ownership and execution-branch visibility stay next. They directly
  serve the remote-first dashboard direction and retain higher value than
  migrating every occasional publication caller immediately.
- The first queued story now removes default-checkout dependencies from worktree
  workflows. Terry rejected the local coordination feature on 2026-09-28;
  publication and optional refresh retain shared owners.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, retain the first story's complete claim guarantee and
reassess further simplification against actual native use;
no invisible host startup, scheduler, arbitrary-push watcher, or global workflow
registry is selected. No new execution authority or ADR acceptance is implied.

## Existing related stories

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

The retired identity `SEED-008#reduce-ci-observer-overhead` is not queued or
reallocated. Its remaining outcomes are the delivered
[completion operation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
and the managed execution delivery of plan 083, released in 0.3.33.

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844`.
Later source review corrected the claimed production readiness command: it was
a test substitute. Current story scope replaces the earlier idle-expiry
and ref-watching proposals; do not implement those historical mechanisms.

## Architectural Context

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports continuous integration and resolving conflicts through shared intent.
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs behavior and native acceptance evidence.
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires shared behavior written for the executing project, with necessary host
adaptation. Follow the [maintainer guideline](../../AGENTS.md) when authoring.

[ADR 0007 — Software development lifecycles](../../docs/adrs/0007-software-development-lifecycles.md)
owns lifecycle discussion;
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md)
owns the proposed Git contract. Both retain Proposed status. ADR 0007 records
the unresolved relationship between Story Branch Mode's delayed integration and
Accepted ADR 0002; human resolution of that question remains separate from this
Git migration.
