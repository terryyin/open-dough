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

<a id="story-branch-delivery-target"></a>

### Story Branch increments publish only to their execution branch

**Identity:** SEED-008#story-branch-delivery-target
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/256-story-branch-delivery-target/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"79fd86e2f99be4e109d469cd7d6f0d9ebbd7b53863215252632743d24123ca63","plan":"76dce5bf7b33d396b6ac0c58d41e97ccd473100469b3df04db940884833299b4"}}
```

**Beneficiary:** a developer whose agent executes a story in Story Branch Mode.

**Goal:** An increment delivered in Story Branch Mode reaches only its remote
execution branch, never trunk before review and integration, and the
coordinator passes the right `--target-ref` from the established start and
the delivery guidance alone, without reading the delivery script. This keeps
the Story Branch Mode contract of
[ADR 0009](../../docs/adrs/0009-git-branching-and-integration.md) — publish
progress to the story branch, integrate into trunk only at the authorized
integration boundary — true in practice: fifteen ODF-200 occurrences cost
lookups or a refused first call, and the latest one fast-forwarded an
unreviewed increment onto remote `main`.

**Scope:**

Required:

- The coordinator tells `deliver` the execution mode, as the established start
  names it (`mode: story-branch` or `trunk`) and as `execution-start.mjs start
  --mode` already takes it. A Story Branch increment whose `--target-ref` is
  not `refs/heads/<execution branch>` (the `--branch` value) is refused before
  any fetch, rebase, push, or observer establishment, with an error naming the
  required target. Trunk Mode keeps `refs/heads/<trunk>`.
- The `deliver` usage text and the delivery steps a coordinator reads at
  delivery time, [Publish an execution increment or repair](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair)
  and [Publish the candidate](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-the-candidate),
  show the `--target-ref` value for each mode next to the mode argument:
  `refs/heads/<execution branch>` in Story Branch Mode, `refs/heads/<trunk>`
  in Trunk Mode. The bare `REF` placeholder goes.
- ODF-200 is updated at `DearDough.md` and `docs/maintainer/finding-names.md`.

Rejection constraint: the refusal is justified by ADR 0009's Story Branch Mode
row and [trunk publication](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair)
("Story Branch Mode pushes that candidate to the recorded remote execution
branch and does not push it to remote trunk").

Boundary — trunk-targeted publications from a Story Branch workspace that are
not Story Branch increments keep their existing targets and are not refused:
the [one-shot landing](../../src/skills/dough-execute-plan/references/one-shot.md#land-the-retained-result),
which targets remote trunk even in Story Branch Mode, and wrap-up's
[Story Branch integration](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md#observe-story-branch-integration)
and Trunk Mode closure through `trunk-closure.mjs finish`. Planning decides
how each of those callers tells `deliver` it is not a Story Branch increment
(omitting the mode or naming trunk) and confirms which of them run through
managed delivery at all.

Deferred, considered and excluded:

- No refusal for a Trunk Mode increment aimed at a non-trunk branch: no
  occurrence, and `deliver` is not told the trunk's name.
- No new established-start field naming the delivery target: the block's
  `mode` and `branch` plus the guidance are enough to copy the value.
- No reversal of the increment plan 250 already fast-forwarded onto `main`
  (`1be19216`); it is integrated history.
- The existing `refs/heads/` form requirement stays; `origin/<branch>` and bare
  branch names remain refused as today.

**Key examples:**

1. **Trunk target refused in Story Branch Mode.** Established start names
   `mode: story-branch`, `branch: claude/x`, `target: main`; a slice is
   committed. The coordinator runs `deliver --mode story-branch --branch
   claude/x --target-ref refs/heads/main …`. Result: `ok: false`,
   `publication: "refused"`, an error naming `refs/heads/claude/x` as the
   required target; remote `main` and `claude/x` are unchanged, no observer
   was established, nothing was fetched or rebased.
2. **Execution branch accepted in Story Branch Mode.** Same start; the
   coordinator runs `deliver --mode story-branch --branch claude/x
   --target-ref refs/heads/claude/x …`. Result: accepted as today, receipt
   target `refs/heads/claude/x`, observer bound to that branch.
3. **Trunk Mode unchanged.** Established start names `mode: trunk`,
   `target: main`; `deliver --mode trunk --target-ref refs/heads/main …` is
   accepted with receipt target `refs/heads/main`.
4. **No script lookup.** A coordinator at its first delivery reads only the
   delivery step in `trunk-publication.md`, or runs `deliver` with no
   arguments and reads its usage; both state the `--target-ref` value for the
   established start's mode. The lookups and refused first calls ODF-200
   records do not occur.
5. **One-shot landing still reaches trunk.** A one-shot result in Story
   Branch Mode is landed with `--one-shot-identity <identity>` and
   `--target-ref refs/heads/main`; it is accepted as today, because it is a
   trunk publication, not a Story Branch increment.

**Evidence:** [ODF-200](../../DearDough.md#odf-200--story-branch-deliverys---target-ref-value-had-to-be-read-from-the-script)
in `DearDough.md` and the
[catalog entry](../../docs/maintainer/finding-names.md#odf-200). Its latest
occurrence published an unreviewed Story Branch increment to remote `main`.

**Done when:** a Story Branch `deliver` with a trunk target is refused before
any push; the usage and the delivery steps name both forms; one-shot landing
and closure publications are still accepted; and ODF-200 records the actual
response commit and first containing release (or release pending) at
`DearDough.md` and `docs/maintainer/finding-names.md` under
[retained evidence](../../docs/maintainer/finding-names.md#retained-evidence).

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
