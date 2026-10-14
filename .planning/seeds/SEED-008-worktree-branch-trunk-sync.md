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

<a id="donut-coalesced-ci-adoption"></a>

### Prove coalesced CI validation in Donut's actual workflow

**Identity:** SEED-008#donut-coalesced-ci-adoption

**For / why:** Donut's developers get fewer expensive full-validation runs during
continuous publication, and their Open Dough completion reports truthfully which
accepted revision was published and which snapshot was validated. Split from
Coalesce CI validation with truthful completion evidence
(SEED-008#coalesced-ci-validation, recoverable at `165482a2:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation`) on 2026-10-15, after that story delivered the shared runtime and Pygardon's
isolated adoption.

**Goal:** Prove candidate adoption of integrated-state completion in Donut's
actual GitHub Actions workflow in an authorized isolated proof. Do not claim a
normal installed rollout.

#### Scope

- Add a workflow/ref concurrency group with active runs retained to Donut's
  `ci.yml`, and declare `integratedStateCompletion` in Donut's
  `.planning/open-dough.json`. Keep the change reproducible on an unpushed Donut
  branch for the separately authorized release and rollout.
- On disposable proof refs, run the actual workflow and its covered commands:
  A and C run, waiting B does not, and later arrivals still let feedback finish.
  Feed the actual provider evidence through Open Dough's installed completion,
  execution and wrap-up consumers in both delivery modes. Count covered-command
  starts for the observed burst. Do not report a production percentage.
- Keep workflow exclusions, every required job and shard, artifact provenance
  and deployment admission. A C push excluded by docs/planning filters cannot
  silently cancel an admitted required B check. Do not group distinct targets or
  deployment obligations into one waiting slot.
- Inspect release-admission artifact and run identity while an exact artifact
  obligation is unsatisfied. Run no deployment, push nothing to main and push no
  tag.
- Execution must obtain Terry's authority for the proof refs. Donut's full CI
  uses repository secrets, including the OpenAI token, the Discord webhook and
  DockerHub.

Carried obligations from the split story:

- Real provider facts for a docs-only tip must not lose B's unchecked source
  (story clause: "Validation of a selected snapshot must include the unchecked
  changes incorporated since the relevant validated baseline.").
- In a real Donut checkout, the observer must identify the target's remote, so
  that another writer's validated C can prove ancestry without a manual fetch.

The split story's plan, `165482a2:.planning/slice-plans/307-coalesced-ci-validation/PLAN.md`,
records the Donut queue probe (GitHub kept the active run and replaced the
single waiting run; B and D were cancelled with no jobs) and the shared
runtime's accepted proof. Reuse these results; do not repeat them.

<a id="integrated-state-correction"></a>

### Correct integrated-state completion after coalesced CI validation

**Identity:** SEED-008#integrated-state-correction

**Goal:** Coordinators using declared integrated-state completion get the
completion that Coalesce CI validation with truthful completion evidence
(SEED-008#coalesced-ci-validation, recoverable at `165482a2:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation`) already promises, including when GitHub replaced the run their ignored-only
revision depends on. Stopping an observer is not held up by a candidate fetch.
Maintainers get proof of the rule at its domain contract, with fewer spawned
observer journeys.

**Scope:** This is a bounded retrospective correction of that story's completed
execution. It adds no feature promise. Its premise is that an ignored-only
accepted B whose applicable ancestor was replaced in the queue is the case of
that story's key example 2 and the converse in key example 3. The story also
states: "Proven queue replacement explains why B has no run; it is not a
passing verdict." Under a declared policy, such a B therefore completes against
a successful descendant C. Without a policy, it stays unresolved as today.

The correction also:

- fetches a candidate only when the candidate can validate, and stops that
  fetch with the observation;
- replaces most of the ineligibility journeys with unit proof of the rule,
  keeping one GitHub negative journey;
- removes the revision-records module's dependency on the rule, and the
  re-export of records through coverage.

Findings, proof and slices are in the
[correction plan](../slice-plans/308-integrated-state-correction/PLAN.md).

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
