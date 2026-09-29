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

<a id="installed-story-branch-integration"></a>

### Integrate Story Branch closures through an installed command

**Identity:** SEED-008#installed-story-branch-integration
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Candidate (2026-09-29):** product advice from plan 146's retrospective,
added to the backlog at Terry's request. Not yet refined.

**Idea:** Story Branch integration is the only closure step agents still
perform from prose and raw Git: closing the execution-branch observer, arming
a trunk observer, the history-preserving merge through the backlog merge
adapter with hand-resolved conflicts, registering the integrated SHA, and one
completion before `retire`. It was plan 146's costliest native journey: every
host's first `story-branch-closure/source-conflict` run failed, and the rerun
still needed transcript judgment for Cursor. An installed entry point would give
agents the tested mechanics and leave conflict resolution as judgment.
`history-preserving-publication.mjs` already ships without a CLI or production
importer, so this story also decides whether it backs that command or leaves
the payload with its tests.

**Open decisions for refinement (from plan 146's retrospective):**

- **D1 — `install.sh` size.** The installer sits at the 250-line refactor
  bound and was line-golfed to fit (`b269991d`); every new script adds a
  `managed_files` line. Decide whether the payload declaration moves to its
  own file (ADR 0004 area) before this story adds another command.
- **D2 — `--created-for-work` wording.** In plan 146's native preparation-land
  run, Cursor passed `--created-for-work` beside `--identity` with no recorded
  basis. It was harmless because the creation record named the work, but
  without a record the flag would retire an unrecorded or host-owned worktree.
  Decide whether Dough Land's "Retire the worktree" says to pass only
  `--identity` when the creation record names the work, or the command reports
  its ownership basis.
- **D3 — one ancestry check and one optional rev-parse.** Land and wrap-up
  import `isAncestor` from `workspace-publication-ownership.mjs`, but
  `publication-resume.mjs`, `maintain-default-checkout.mjs`,
  `history-preserving-publication.mjs`, and `ci-path-applicability.mjs` keep
  their own copies. The same "resolve this revision or nothing" rule appears as
  `commitOf` in `trunk-closure-settlement.mjs` and
  `preparation-assignment-ownership.mjs`, `refSha` in
  `execution-start-carry.mjs`, and `verifies` in
  `maintain-default-checkout.mjs`, with differing error handling. Decide
  whether to consolidate both, for example beside `revParse` in
  `publication-git.mjs`, which crosses skills.

**Acceptance note:** this story's acceptance reuses the Story Branch native
harness, whose recorded native evidence is stale after its response check and
evidence identity changed; that acceptance renews it.

<a id="land-from-default-checkout"></a>

### Land changes made on the default checkout by committing to main and syncing

**Identity:** SEED-008#land-from-default-checkout
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer who made a change directly on the default main
  checkout can say "land" and have it published, instead of Dough Land stopping
  because that checkout is not an owned worktree.
- **Evaluation:** When the change to land sits on the default checkout, Dough
  Land commits it on `main` and syncs with origin (rebasing onto the fetched
  target and pushing without force). The result reports publication as it does
  for a worktree. A change in an owned worktree lands as before.
- **Boundary:** Applies only when the context says the change was made on the
  default main checkout. Retirement does not apply, since no worktree is
  removed. Which changes on the checkout are included, and whether unrelated
  uncommitted files are refused, are open for refinement. Edited in
  `src/skills/dough-land/`, the Open Dough source.
- **Depends on:** None.

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
