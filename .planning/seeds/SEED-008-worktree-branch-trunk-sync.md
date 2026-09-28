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

<a id="finish-removing-checkout-coordination"></a>

### Finish removing default-checkout coordination

**Identity:** SEED-008#finish-removing-checkout-coordination
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Decision (2026-09-28):** Terry accepted these recommendations after the
remote-history retrospective.

**Goal:** A developer who explicitly selects their current checkout for an
agent's edit keeps their own staged and committed work private and in place,
with no ownership declaration, while guidance names that checkout consistently.

**Scope:**

- Explicit current-checkout delivery commits only its authorized paths and
  leaves unrelated staged content staged and untouched; it stops only when an
  authorized path itself carries someone else's staged change.
- Before a push-authorized current-checkout delivery, refuse unless the only
  commit over the fetched target is the one this delivery created.
- Remove the declared-owner concept end to end: `--declared-owner` and
  `--requester`, refresh's owner step and its `another-writer` and
  `unclear-ownership` results, and their tests.
- Guidance calls that checkout the default checkout throughout; the
  `--integration` flag keeps its name.
- When refresh eligibility tests change, keep at the installed startup only
  one own-state reuse refusal and the stopped-rebase refusal; the refresh
  boundary tests already prove the other eligibility variations.
- Native acceptance of the changed current-checkout guidance on Codex, Cursor,
  and Claude Code, run manually as the story's final slice.

**Key examples:**

1. The developer has staged an unrelated file and asks an agent to commit one
   authorized file locally → the commit holds only that file, and the staged
   file remains staged with identical bytes.
2. The developer has an unpublished local commit and authorizes publication of
   an agent's edit → delivery refuses before pushing, and the remote and local
   history are unchanged.
3. A default checkout is clean and behind trunk after an accepted publication →
   refresh advances it without any owner or requester argument.

<a id="installed-wrap-up-command"></a>

### Close stories through an installed wrap-up command

**Identity:** SEED-008#installed-wrap-up-command
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Decision (2026-09-28):** Terry accepted this recommendation after the
remote-history retrospective.

**Goal:** Agents closing a story run the same tested wrap-up publication and
cleanup mechanics that the project's tests prove, instead of re-enacting them
from prose, so closure behaves identically across hosts.

**Scope:**

- An installed wrap-up command, invoked from story wrap-up guidance, performs
  before-cleanup and final-closure publication, Story Branch integration, and
  gated resource retirement through the existing shipped closure modules.
- Current-checkout closure uses the same command under its own authority.
- Wrap-up guidance calls the command and keeps its judgment steps
  (assimilation, queue decisions, deletion scope) in prose.
- The shipped retirement gate follows the work-scoped ownership rule in the
  exploration workspace lifecycle instead of its session-named `sessionOwned`
  flag.
- Native evidence identity hashes the retirement and refresh guidance its
  journeys prove (the exploration workspace lifecycle, preparation workspace,
  default-checkout maintenance, and Dough Land), and the identity check covers
  the owned-context evidence writer.
- The Story Branch closure and CI-completion native harnesses stop their
  observer by its recorded root, record Codex node calls, and keep harness
  logs and transcript paths out of the agent's view, as trunk closure does,
  before any paid run.
- Native acceptance of the changed wrap-up guidance, run manually as the
  story's final slice.

**Open scope decision:** where a workspace's "created for this work" fact is
durably recorded, so a later session can retire it under the work-scoped rule
instead of retaining it as ambiguous. Recommendation: a per-worktree Git ref
written when startup or preparation creates the workspace, removed with it.
The leftover "record the workspace as created by this session" wording in
preparation-assignment guidance follows that decision.

**Key examples:**

1. A completed Trunk Mode story → the agent runs the wrap-up command → both
   closure commits are accepted on the remote, the completion receipt gates
   cleanup, and the worktree and branch are retired.
2. A completed Story Branch story → the command integrates the published tip
   into trunk with history preserved, observes trunk CI, then retires resources.
3. A publication conflict → the command stops, preserving the worktree, branch,
   and candidate, and reports the recovery step.

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
