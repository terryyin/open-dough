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
local checkout stays useful for starting tasks and making bounded direct edits,
with its freshness and ownership managed separately from remote publication.

The selected direction is described in
[ADR 0009 — Git branching and integration](../../docs/adrs/0009-git-branching-and-integration.md).
Terry authorized this backlog alignment on 2026-09-21. The ADR retains Proposed
status; this seed records desired outcomes for implementation planning.

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
- Local coordination remains below remote work, matching the existing direction.
  It does not warrant a second publication or observation implementation.
- Planning-format validation and existing process follow-ups retain their relative
  order below this cluster. They are not prerequisites for publication.

If reducing investment, retain the first story's complete claim guarantee and
reassess further simplification against actual native use;
no invisible host startup, scheduler, arbitrary-push watcher, or global workflow
registry is selected. No new execution authority or ADR acceptance is implied.

## Existing related stories

<a id="same-machine-merge-queue"></a>

### Coordinate direct edits and refreshes of the default checkout

**Identity:** SEED-008#same-machine-merge-queue
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"9239143b63c468cdeff76f2fe96856bd52dc8e88f756f995a5785b8239372b64"}}
```

**Status:** Scope bounded on 2026-09-23; refinement and planning pending.

**Goal:** Participating local agents safely share the default checkout for
bounded direct edits and refreshes, preserving pending work while other owned
workspaces continue publishing to remote trunk.

**Scope candidate:** One immediate access attempt covers inspection and any
working-tree, index, commit, or branch mutation through the existing checkout
maintenance owner. Re-read state after acquisition. On contention or unclear
ownership, return deferred with enough recovery context; no waiting queue,
fairness policy, automatic takeover, background catch-up, or remote merge queue.
Direct edits use the shared publisher with established authority. Keep access
through the edit and release it at its existing completion/handoff boundary.

**Key examples / evaluation:**

- One participating agent owns a direct edit → another publishes from its own
  worktree → remote acceptance succeeds and local refresh is deferred promptly.
- Two refresh attempts contend → only the owner mutates → the other reports
  deferred; a later explicit attempt rechecks current state before advancing.
- A human has staged work or a prior owner was interrupted → preserve content
  and ownership evidence → report recovery/handoff needed; never steal access
  based solely on a timeout or a missing process.

**Boundary:** Cooperative access cannot prevent edits by humans or tools that
ignore it. Rechecks and preservation still apply. This story adds no agent
scheduler, continuous liveness monitor, new publication policy, or remote lock.

**Depends on:** The production publisher and checkout-maintenance boundary from
[startup](../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work). It automates access to that
existing owner; startup can safely defer refresh before this story is delivered.

**Safe stopping point:** Participating direct edits and refreshes share bounded
access and recoverable stops; isolated publication stays independent of it.

**Evidence:** [ODF-119](../../docs/maintainer/finding-names.md#odf-119):
execution worktrees kept under an unignored in-checkout `.worktrees/` make every
automatic refresh of the default checkout defer with `pending-edit`, and a stale
published copy left there blocked a later execution startup.

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

<a id="run-guided-commits-through-skill-alias"></a>

### Open Dough scripts run, or fail visibly, through a symlinked skill directory

**Identity:** SEED-008#run-guided-commits-through-skill-alias
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"fccbfcae5b23d40aabe52d74221bf2738aa35604dafd5800a4455fc8427f33cc"}}
```

**Beneficiary:** Agents invoking installed Open Dough scripts through a skill
directory that is a symlink, typically Claude Code in a worktree whose project
links `.claude/skills/<name>` to `.agents/skills/<name>` (Donut's own worktree
setup does this, and our runtime guidance prefers the `.claude/skills` path for
Claude Code).

**Goal:** A script run directly through such a symlinked path behaves exactly as
through its real path: it performs the command or reports a visible refusal.
It never exits 0 silently having done nothing.

**Scope:** The three installed CLI scripts whose direct-entry check still
compares path strings literally — `agent-commit.mjs`, `execution-start.mjs` and
`ci-repair-stash.mjs` — use the existing realpath-aware direct-entry helper that
the other CLI entrypoints already use. One behavioral test runs every Open Dough
CLI entrypoint through a symlinked skill directory and requires a non-silent
result, so a future entrypoint that copies a literal check fails in this
repository rather than in a project. Importing a module stays free of side
effects.

Excluded: projects' own symlink setup; changing which skill path the runtime
guidance prefers; moving to `import.meta.main` (Node 20 remains supported);
native host runs; a source-text lint for the check; CI discovery, session
identity and release automation. Renaming the CI-specific helper module is left
to the refactor pass.

**Evaluation / key examples:**

- In a disposable repository whose `.claude/skills/<name>` links to
  `.agents/skills/<name>`, `agent-commit.mjs` run through the link with staged
  content commits and prints its receipt, exactly as through the real path;
  in a checkout with no assigned agent it prints the same JSON refusal and
  non-zero exit as the real path.
- `execution-start.mjs start` and `ci-repair-stash.mjs` through the link report
  their JSON result or usage error instead of exiting 0 with no output.
- Every CLI entrypoint invoked through a symlinked skill directory produces
  output or a non-zero exit; none is silent with exit 0.
- Importing any of these modules performs no command.

**Findings:** [ODF-127](../../docs/maintainer/finding-names.md#odf-127).
An earlier correction (ODF-056, 0.3.27) fixed three CI entrypoints; `agent-commit.mjs` later reintroduced the literal
check.

**Completion:** Record the actual response, implementation commit and first
containing release on ODF-127 in the catalog; distinguish delivered proof from
later effectiveness.

**Depends on:** Nothing unfinished; reuses the existing direct-entry helper.

**Effort hypothesis:** One slice; approach selected by Terry as planless.

<a id="isolate-parallel-slice-delivery"></a>

### Keep parallel slices from interfering with proof and delivery

**Identity:** SEED-008#isolate-parallel-slice-delivery
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers and coordinators running independent slices concurrently.

**Goal:** Each slice’s proof, formatting and commit applies to its owned candidate while sibling work and test artifacts remain intact.

**Scope candidate:** Bound the response to the shared execution-checkout hazards evidenced here: formatter selection, proof snapshot, test output and staged ownership. Choose the smallest coherent ownership/isolation approach during refinement, consistent with the direction of one owned worktree per agent. Do not add a scheduler, merge queue, default-checkout lock or automatic recovery of foreign work; the existing default-checkout story remains separate.

**Evaluation:** Run two independent slices with one still editing while the other proves, formats and commits. The first’s verdict is attributable to its own candidate, no sibling output or source is changed, and no sibling staged deletion enters its commit. Where safe independence cannot be established, report an explicit bounded wait before mutation. Verify ordinary sequential delivery still works.

**Findings:** [ODF-128](../../docs/maintainer/finding-names.md#odf-128), [ODF-129](../../docs/maintainer/finding-names.md#odf-129), [ODF-130](../../docs/maintainer/finding-names.md#odf-130), [ODF-131](../../docs/maintainer/finding-names.md#odf-131), with related baseline practice [ODF-155](../../docs/maintainer/finding-names.md#odf-155).

**Completion:** Record the actual response, implementation commit and first containing release on each addressed finding in the catalog; distinguish delivered proof from later effectiveness.

**Depends on:** No unfinished product prerequisite identified; reuse existing delivery and CLI entry mechanisms.
