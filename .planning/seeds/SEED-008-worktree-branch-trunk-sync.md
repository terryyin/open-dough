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

<a id="same-machine-merge-queue"></a>

### Run worktree workflows from remote history

**Identity:** SEED-008#same-machine-merge-queue
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/140-remote-history-workflows/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"4731eb082e2ebb5b82a654af62f695090ec7d5d2d390aeaf8eab6c39726f7eaf","plan":"1c414f41e6a2dcd85adea49938c3e9beb3eb806c060f510d7ea6cafa3852e49c"}}
```

**Decision (2026-09-28):** Terry repurposed this first-priority story after
finding insufficient value in coordinating the default checkout. Keep its
recorded identity and anchor. The intended model is bare-like: worktrees pivot
around remote history without requiring a default checkout. This describes
workflow behavior, not a request to convert repositories to bare Git.

**Goal:** Developers can prepare and execute work in owned worktrees and land
completed changes on the authorized remote branch regardless of the presence,
revision, or pending work of a default checkout. This supports parallel story
execution with fewer local coordination obligations.

**Scope:**

- Fresh preparation and execution workspaces use fetched remote trunk as their
  ordinary baseline. Queued execution reads the selected story, plan,
  preparation facts, and claim ownership from published history. Local default
  checkout copies do not supply or veto that source. Existing owned workspaces
  retain their work and resume identity; a fresh remote baseline does not
  authorize resetting them.
- Resolve the project's actual remote and authorized branch. `origin/main`
  names the usual trunk here; Story Branch Mode still publishes progress to
  its authorized remote story branch and integrates through its existing
  authorized trunk boundary. This story does not change mode timing.
- Dough Land and story wrap-up reconcile and publish their owned candidates
  directly to the authorized remote target. Neither requires local `main` to
  contain the result before publication or retirement. Wrap-up includes its
  before-cleanup and final-closure changes in that same remote contract.
- After accepted trunk publication, attempt to fast-forward a supplied default
  checkout only when it is on the expected branch, clean, and equal to or behind
  fetched trunk. Preserve pending edits, staged content, unpublished commits,
  and unexpected or divergent state. With no default checkout, skip this
  optional step. Contention or refresh failure reports an independent local
  outcome and never invalidates remote acceptance or blocks independent work.
- Keep one cohesive solution for remote reconciliation, publication acceptance
  and recovery, optional checkout refresh, and safe worktree retirement. Land
  and wrap-up consume those shared responsibilities. Their different duties
  remain explicit: Land commits the reviewed worktree; wrap-up preserves Git
  recovery, removes spent records, and observes its required CI completion.
  Sharing those responsibilities does not require one combined workflow.
- Explicit developer selection of current-checkout work remains deliberate
  local work under its established authority, with no automated ownership,
  lease, or handoff prerequisite. Preserve unrelated work and publication
  authority. Deliberately supplied unpublished preparation or carried edits
  remain owned inputs under admission and resume; never sweep the default
  checkout's unrelated content into a remote candidate.
- Align affected shared guidance and maintained planning/design context with
  this direction. A default checkout may supply Git repository access when
  present; its working tree is neither a required source nor an integration
  stage. Use an owned repository/worktree context when it is absent.

**Key examples / evaluation:**

1. Remote trunk has a ready story and plan; local `main` is behind and holds
   different staged or unstaged versions of that selected source → start queued
   execution → use the published versions, publish the claim, and prepare the
   owned workspace from remote history; leave all local content intact.
2. A fresh preparation begins from a stale default checkout → select its owned
   workspace → draft against fetched trunk, preserving the developer's local
   files. Continuing an existing preparation retains its owned draft.
3. An owned worktree has repository access and installed guidance, but no
   default checkout is supplied → start execution, land work, or wrap up a
   completed story → use the authorized remote and owned workspace; report
   local refresh as not applicable without demanding another checkout.
4. A reviewed Land candidate or completed wrap-up candidate is ready; local
   `main` is clean and behind → publish → origin contains the accepted result
   before optional local advancement. Both callers use the shared publication
   and refresh behavior, with their own completion duties preserved.
5. Local `main` has a developer edit, unpublished commit, unexpected branch, or
   divergent history → Land or wrap-up publishes from its owned workspace →
   remote acceptance stands, local state is preserved, and refresh is deferred
   or stopped. Cleanup remains governed by remote containment and the caller's
   existing completion gates.
6. Another writer advances the remote or a push response is lost → publish or
   resume through either Land or wrap-up → use the same reconciliation,
   revalidation, and remote-containment rules. Local checkout movement is never
   evidence of acceptance; unresolved conflict preserves the owned candidate.
7. Published preparation is missing or not ready → queued startup → refuse on
   the remote facts, even if a newer ready-looking copy exists locally. An
   explicitly authorized admission remains the route for unpublished owned work.

**Constraints and limits:** The previous cooperative access/merge-queue feature
is abandoned. This story adds no default-checkout lock, owner registry,
takeover policy, scheduler, background catch-up, or second publication engine.
It does not convert repository storage, provision a new bare-repository hosting
mode, change branch protections or force-push policy, or redesign CI. Existing
project setup, owned-workspace preservation, and required CI checks still apply.

**Existing solutions and alignment:**
[Startup](../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work)
already selects workspaces from fetched trunk, but its
[source reader](../../src/skills/dough-execute-plan/scripts/execution-source.mjs)
can refuse because of originating-checkout versions.
[Dough Land](../../src/skills/dough-land/SKILL.md) and
[wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md) already share
[candidate publication](../../src/skills/dough-execute-plan/references/publish-the-candidate.md)
and Land's refresh/retirement guidance. Extend these existing owners where
needed; establish cohesion across their runtime and prose without assuming a
second publisher is needed. The shared preparation workspace/base selection,
[checkout maintenance](../../src/skills/dough-execute-plan/references/maintain-default-checkout.md),
[publication design](../../docs/maintainer/execution-publication-design.md), and
[visibility requirements](../../docs/project-visibility-requirements.md)
still contain local-checkout assumptions to align during delivery. The wording
of Proposed ADRs 0008 and 0009 is aligned in this preparation draft; both retain
their status. Their earlier coordination proposal is not an Accepted constraint
or this story's selected requirement.

**Depends on:** Existing startup, shared publication, and checkout-maintenance
owners; no new prerequisite story is selected.

**Safe stopping point:** Owned-worktree startup and publication work without a
default checkout dependency; an optional local refresh cannot change their
acceptance or cleanup evidence.

**Evidence:** [ODF-119](../../docs/maintainer/finding-names.md#odf-119) records
three stale-checkout incidents, including a startup refusal and repeated refresh
deferral from unignored nested worktrees. This supports removing local-state
dependencies, not introducing mutual exclusion; no contention incident is
claimed. Removing startup's dependence on local copies does not itself clean
the developer's checkout or promise that every deferred refresh will advance.

**Open scope decisions:** None. The linked slice plan defines the planned
approach; preparation does not authorize implementation.

**ADR review (2026-09-28):** No new conflict with the current Accepted ADRs.
ADR 0002 supports shared remote integration, cohesion, and reducing unnecessary
coordination; ADRs 0004, 0005, and 0006 govern standalone delivery, truthful
cross-tool evidence, and one authoritative behavioral source. No Accepted ADR
needs amendment for this outcome. Proposed ADRs 0008 and 0009 have their
default-checkout coordination wording aligned with Terry's decision in this
preparation draft and retain Proposed status. ADR 0007's existing Story Branch
timing tension with ADR 0002 is separate and gains no exception or resolution
from this story.

**Slice plan:** [Run worktree workflows from remote history](../slice-plans/140-remote-history-workflows/PLAN.md).

<a id="reduce-ci-observer-overhead"></a>

### Reduce CI observer overhead across execution and wrap-up

The retired identity `SEED-008#reduce-ci-observer-overhead` is not queued or
reallocated. Its remaining outcomes are the delivered
[completion operation](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion)
and the managed execution delivery of plan 083, released in 0.3.33.

Terry's 2026-09-22 Pygardon report described repeated observer setup and handle
transcription, early provisional coverage notifications, and a separate closure
observer cycle. No raw transcript established the repeated-setup cause. The
full investigation is retained in Git at `1352844` and linked findings
[ODF-069](../../docs/maintainer/finding-names.md#odf-069).
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
