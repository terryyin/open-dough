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

<a id="installed-wrap-up-command"></a>

### Close stories through an installed wrap-up command

**Identity:** SEED-008#installed-wrap-up-command
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/146-installed-wrap-up-command/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2f6d20f8e377855186cb4541e8143ed2f01e7e51f578e926c006d2964d89e2a6","plan":"207782bafd9f895097afa5e5efd2730dcee951b44e6c9bdebc104c5e798061a3"}}
```

**Decision (2026-09-28):** Terry chose an entry point over removing the
shipped closure modules from the payload (finding F7 of the remote-history
retrospective), then accepted the narrowed goal, scope, and ordering below in
refinement the same day.

**Goal:** Agents closing a story run the closure mechanics that this project's
tests prove, Trunk Mode closure publication and execution-resource retirement,
through installed commands instead of re-enacting them from prose and raw Git.
Wrap-up and Dough Land guidance then keep only judgment steps, and closed work
stops leaving worktrees and branches behind.

**Evidence:** The closure modules under
`src/skills/dough-story-wrap-up/scripts/` ship in the payload with no entry
point and no caller outside tests, so their tests prove code agents never run.
On 2026-09-28 the Story Branch closure of
`SEED-053#proportionate-local-verification` left its worktree, local branch,
and remote branch in place although trunk contained all of them. No closure
has been observed to behave differently across hosts.

**Scope:**

- An installed Trunk Mode closure command publishes the before-cleanup commit,
  then the final-closure commit, runs the CI completion operation once for the
  final accepted SHA, and retires execution resources only on its confirmed
  receipt. A rerun recognizes commits already accepted on the remote.
- Both closure publications stay: delivery rebases unpublished commits when
  trunk advances, and the final closure cites the before-cleanup SHA as a
  recovery locator, so that SHA must be accepted before cleanup cites it.
- One installed retirement command, shared by wrap-up in every mode and by
  Dough Land, replaces the raw-Git retirement procedure. It builds on the
  removal core that plan 142 extracts.
- Wrap-up and Dough Land guidance call these commands and drop the procedure
  prose they replace; assimilation, queue decisions, and deletion scope stay in
  prose.
- That retirement command holds the one ownership gate, following the
  work-scoped lifecycle rule: a clean workspace created for this work, by any
  session, is retired; a reused, host-owned, or unrecorded one is retained. It
  consumes the durable creation fact once
  [the separate decision](#durable-workspace-creation-fact) lands; until then
  it fails safe by retaining.
- No shipped closure module remains without an entry point: each backs a
  command or leaves the payload with its tests.
- Before any paid run, each affected native journey's evidence identity covers
  the guidance and commands it proves, and the closure harnesses observe the
  agent from outside its visible fixture on every host (plan 142's
  retrospective found both gaps).
- Native acceptance of the changed wrap-up and Land guidance on Codex, Cursor,
  and Claude Code, run manually as the story's final slice.

**Deferred promises:** Story Branch integration (history-preserving merge
through the backlog merge adapter, with hand-resolved conflicts) and
current-checkout closure keep their current guidance. The single-commit
closure alternative is not pursued. Direct edits proceeding around the
developer's unrelated staged content stay deferred as well (Terry, 2026-09-29).
Direct edits commit with plain `git commit`, and the owned-path commit
(`commitOwned`) exists only in `current-branch-publication.mjs`, which has no
entry point. So deciding that module's fate here also decides that promise's
runtime commit path.

**Ordering:** Starts after plan 142 (closed at `2a3e0ba2`), which changed the
same retirement module, wording, and native closure acceptance, and after
SEED-008#finish-removing-checkout-coordination (recoverable at `bae283d2`),
which removed the owner arguments the closure modules passed.

**Key examples:**

1. A completed Trunk Mode story → the agent runs the closure command → both
   closure commits are accepted on the remote, one completion receipt covers
   the final SHA, and the worktree and branch are then retired.
2. A Story Branch story whose integrated SHA has an accepted receipt → the
   agent runs the retirement command → the worktree, local branch, and remote
   branch are removed.
3. Trunk advanced and the closure publication conflicts → the command stops,
   preserving the worktree, branch, and closure commits, and reports the
   recovery step.
4. Retirement is asked for a branch whose tip trunk does not contain → the
   command refuses and removes nothing.
5. Retirement is asked for a reused, host-owned, or unrecorded worktree →
   the command retains it and removes nothing; one an earlier session created
   for this same work is retired.

**Slice plan:** [Close stories through an installed wrap-up command](../slice-plans/146-installed-wrap-up-command/PLAN.md).

<a id="durable-workspace-creation-fact"></a>

### Retire a workspace created for the work in any later session

**Identity:** SEED-008#durable-workspace-creation-fact
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer whose story or preparation spans several agent sessions
gets its owned worktree retired when that work lands or closes, instead of
finding it retained as "ambiguous" because the session that created it is gone.

**Context (2026-09-28):** Terry decided that retirement ownership follows the
work, not the session: a worktree an earlier session created for the same
story, preparation, or execution is retired with that work, while reused and
host-owned worktrees stay with their owners. The shared lifecycle
(`src/skills/dough-manual-testing/references/exploration-workspace.md`,
"Close or retain it") now says so, but accepts only two records of creation: a
`created: true` selection result kept in the plan or conversation, or the
caller's statement. Preparation keeps neither across sessions (its assignment
profile records name, story, activity, host, and model; its worktree ref names
only the held assignment, which a host-owned worktree can hold too), and
executions do not write their created-versus-reused fact into the plan's resume
context in practice. A later session therefore usually retains the worktree.
The native preparation-land and trunk-closure journeys pass only because their
prompts state that an earlier session created the worktree for this work.
`src/skills/dough-story-refinement/references/preparation-assignment.md` still
says to record the workspace "as created by this session".

**Open scope decision:** where the durable "created for this work" fact lives.
Options found so far:

1. A per-worktree Git ref (for example beside the preparation assignment ref)
   written by startup or preparation when it creates the workspace and removed
   with the worktree. Git-native, survives sessions and hosts, needs no
   registry; a reused or host-owned worktree never gets it. Recommended.
2. A field in a published record (the preparation assignment profile or the
   execution claim). Visible to other developers, but the profile is released
   before Land retires the worktree, and a claim does not prove creation.
3. Require the fact in the work's own record (the plan's resume context, a
   preparation record). Works only where such a record exists and is kept.

**Relation to queued work:** SEED-008#installed-wrap-up-command makes the
shipped retirement gate follow the work-scoped rule; it can consume this fact
once decided. Until then the rule fails safe by retaining the worktree.

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
