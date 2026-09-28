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

<a id="owned-context-start-and-truthful-refresh"></a>

### Start from owned repository context and refresh truthfully

**Identity:** SEED-008#owned-context-start-and-truthful-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/142-owned-context-start-and-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ddb4c48ec330d303d06b4ff534bdc2cc1cc52785a2cf221b098ed548edcfb5e6","plan":"5c844baf27bd8008cfd3704eea93c822742bc74ac8c1c641b4a9bf2192668c70"}}
```

**Goal:** Developers can start and land owned work from an owned repository
context alone, reuse a clean owned workspace that trunk has moved past, and
receive a truthful, fast-forwarding default-checkout refresh, with the changed
guidance accepted natively on Codex, Cursor, and Claude Code.
This bounded retrospective correction of
Run worktree workflows from remote history (`SEED-008#same-machine-merge-queue`, recoverable at
`199c579f:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md`)
completes that story's example 3 and its "clean and behind → fast-forward"
promise, while retirement mechanics and refresh-result guidance keep one
representation each.

**Scope:**

- Create a new owned workspace at fetched trunk from an existing owned worktree
  or the repository's common Git directory, for queued startup and preparation,
  with local refresh not applicable. Existing refusals remain.
- When startup or preparation reuses an existing clean owned or host worktree
  that has no commits of its own and is strictly behind fetched trunk,
  fast-forward it under the shared refresh eligibility and continue. Local
  commits, divergence, pending edits, or an ongoing Git operation still refuse.
- Recognize an in-progress rebase by Git's rebase state, not a leftover
  `REBASE_HEAD`, in one recognizer shared by refresh and the Land model.
- Refresh-result guidance links its single owner; the Land model retires
  through the shared retirement mechanics.
- Remove the startup and Land test redundancy the review found, and prove that
  a ready-looking local copy cannot override unready remote preparation.
- Native acceptance on Codex, Cursor, and Claude Code of the startup,
  preparation, Land, and wrap-up guidance changed by the original story and by
  this correction, run manually as the final slice.
- Current-checkout coordination and shipped-module payload decisions stay with
  the queued sibling stories below.

**Slice plan:** [Start from owned repository context and refresh truthfully](../slice-plans/142-owned-context-start-and-refresh/PLAN.md).

<a id="finish-removing-checkout-coordination"></a>

### Finish removing default-checkout coordination

**Identity:** SEED-008#finish-removing-checkout-coordination
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/145-finish-removing-checkout-coordination/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1d5c717aaa3073b1c45d50d84625843b55a12db61efebf8df2172fb127c825fb","plan":"ece4fefb68e3b6aceff4a79aa11d8d594a2d1e5af97a304b6b341f097a656ce8"}}
```

**Decision (2026-09-28):** Terry accepted these recommendations after the
remote-history retrospective, then accepted a narrowed refinement: naming
limited to the guidance this story edits, native acceptance as one direct-edit
journey per host, and execution only after
[SEED-008#owned-context-start-and-truthful-refresh](#owned-context-start-and-truthful-refresh)
lands, because both change the same refresh code, guidance, and startup cases.

**Goal:** A developer who explicitly selects their current checkout for an
agent's edit can let the agent commit and publish around their own staged
files, and never has their private unpublished commits pushed to trunk by it.
Removing the unused declared-owner concept leaves fewer instructions. The
current-checkout change already made on trunk, together with this one, becomes
releasable under ADR 0005's native acceptance.

**Scope:**

- Direct-edit guidance proceeds when unrelated content is staged, as the
  runtime already commits only authorized paths; it stops before editing when
  an authorized path already carries the developer's staged change.
- A push-authorized current-checkout delivery, including closure, refuses
  before pushing unless every commit over the fetched target was created by
  this operation. This guard lives in the runtime, not only in guidance.
- Remove the declared-owner concept end to end: `--declared-owner` and
  `--requester`, refresh's owner step and its `another-writer` and
  `unclear-ownership` results, and their tests and guidance.
- Guidance sections this story edits call the developer's checkout the default
  checkout; the `--integration` flag keeps its name.
- Native acceptance, run manually as the final slice, of one direct-edit
  journey per host on Codex, Cursor, and Claude Code, covering both the earlier
  and this story's current-checkout guidance.
- Deferred: product-wide checkout vocabulary unification.

**Key examples:**

1. The developer has staged an unrelated file and asks an agent to commit one
   authorized file → the agent proceeds; the commit holds only that file, and
   the staged file remains staged with identical bytes.
2. The developer has an unpublished local commit and authorizes publication of
   an agent's edit → delivery refuses before pushing, and remote and local
   history are unchanged. A current-checkout closure whose two commits are both
   its own publishes.
3. An authorized path already has the developer's staged change → the agent
   stops before editing, and the index and working tree are unchanged.

**Slice plan:** [Finish removing default-checkout coordination](../slice-plans/145-finish-removing-checkout-coordination/PLAN.md).

<a id="installed-wrap-up-command"></a>

### Close stories through an installed wrap-up command

**Identity:** SEED-008#installed-wrap-up-command
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
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
- No shipped closure module remains without an entry point: each backs a
  command or leaves the payload with its tests.
- Native acceptance of the changed wrap-up and Land guidance on Codex, Cursor,
  and Claude Code, run manually as the story's final slice.

**Deferred promises:** Story Branch integration (history-preserving merge
through the backlog merge adapter, with hand-resolved conflicts) and
current-checkout closure keep their current guidance. The single-commit
closure alternative is not pursued.

**Ordering:** Starts after plan 142, which changes the same retirement module,
wording, and native closure acceptance, and after
[Finish removing default-checkout coordination](#finish-removing-checkout-coordination),
which removes owner arguments the closure modules still pass.

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

<a id="percent-encoded-home-links"></a>

### Start queued work whose backlog link percent-encodes its path

**Identity:** SEED-008#percent-encoded-home-links
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"40b293201cd5edf2a6f28eb3374ba41d19c3c75043be1da803a1d4965d8b6fb8"}}
```

**Goal:** Developers can start queued work in Story Branch or Trunk Mode when
its backlog link percent-encodes characters in the canonical home or plan path,
such as a space written as `%20`, the same way a Markdown renderer and the
product backlog's own Take read that link.

**Scope:**

- Reported against Open Dough 0.3.45 (Claude Code install): a backlog entry
  `[...](../TPS%20and%20AI/seed.md#storyline)` refused startup with
  `source-refused` / "selected canonical home is absent on fetched trunk"
  although `TPS and AI/seed.md` existed on fetched trunk with a ready recorded
  state; `product-backlog.mjs take` with the same identity succeeded.
- Startup resolves the percent-decoded project path for the canonical home and
  for a declared plan. Identities and anchors stay as written.
- Key example: a queued story whose home is `Story Notes/seed.md`, linked as
  `../Story%20Notes/seed.md#story`, starts and publishes its Take.

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
