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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/309-donut-coalesced-ci-adoption/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"84b809a7596e6254727e3c8161a33696cff668b0eaf8118dcb5214d7a02564b0","plan":"37becf5ca570b2dfefb90339aa265793d7cadd2b97fd09b53a5723107a326435"}}
```

**For / why:** Donut's developers get fewer expensive full-validation runs during
continuous publication, and their Open Dough completion reports truthfully which
accepted revision was published and which snapshot was validated. Split from
Coalesce CI validation with truthful completion evidence
(SEED-008#coalesced-ci-validation, recoverable at `165482a2:.planning/seeds/SEED-008-worktree-branch-trunk-sync.md#coalesced-ci-validation`) on 2026-10-15, after that story delivered the shared runtime and Pygardon's
isolated adoption.

**Goal:** Prove, in Donut's actual `ci.yml` on disposable proof refs, that
GitHub's workflow/ref concurrency group lets active and latest work run while a
waiting snapshot is replaced, and that Donut's installed Open Dough completes the
replaced revision truthfully from the later validated snapshot through execution
and wrap-up in both delivery modes. The outcome is a reproducible Donut change
plus judged real-provider evidence for the separately authorized rollout. Do not
claim a normal rollout, a production saving, or Donut `main` adoption.

#### Scope

Refined 2026-10-16. The shared runtime, including the docs-only correction
(`SEED-008#integrated-state-correction`), is released in Open Dough 0.3.63, and
Donut's installed guidance is at 0.3.63 (Donut `7178e92d04`). The proof therefore
uses Donut's installed Open Dough, not a candidate payload. Donut's `ci.yml`
(`donut CI`, `push` on every branch, `paths-ignore` `.planning/**` and `docs/**`,
no concurrency group) was read at the same revision.

Required behavior:

- **Reproducible Donut change.** In an isolated Donut worktree on an unpushed
  branch: add a `concurrency` group keyed by workflow and ref with
  `cancel-in-progress: false` to `.github/workflows/ci.yml`, and declare
  `integratedStateCompletion` with `check` `ci.yml` and `context` `push` in
  `.planning/open-dough.json`. Donut's `scripts/ci/ci-workflow.test.mjs` already
  pins the workflow's trigger shape; extend it for the group so the change is
  checked in Donut's own tests. Whether to list `jobs` is a planning decision:
  the workflow conclusion already requires every job and matrix shard, and a
  list must name exact displayed job names. Retain the branch and its revision
  for the rollout; push nothing to `main`.
- **Real burst on proof refs.** On disposable refs in `nerds-odd-e/doughnut`,
  authorized by Terry, push source commits A, B, C so that B waits behind A and
  C arrives while A still runs. The actual `ci.yml` with Donut's repository
  secrets runs for A and C, B's run is cancelled with no jobs, and later
  arrivals D and E while C runs leave C to finish. Record per push: SHA, run id,
  attempt, status transitions, conclusion, and whether jobs started. Report the
  count of `ci.yml` runs that started jobs against the number of source pushes
  in the observed burst, never a production percentage.
- **Truthful completion through installed consumers.** Donut's installed
  observer, bound to the proof target, completes accepted B as
  `integrated_state`: B's own run is reported as superseded, never success; the
  validated snapshot names C's SHA, run, attempt, `ci.yml`/`push`, and URL; the
  ancestry basis B → C is recorded. A completes exactly. The same actual run
  facts reach the execution completion in Story Branch Mode and Trunk Mode and
  the wrap-up closure gate, which retires resources only behind that gate.
- **Docs-only pushes against real provider facts.** A push touching only
  `docs/**` or `.planning/**` creates no `ci.yml` run, so it never enters the
  group and cannot cancel an admitted required run. The observer resolves that
  revision as not required with its source ancestor's run as basis, and when
  that basis run was itself replaced, the docs-only revision completes only from
  a later validated snapshot that contains it. Carried from the split story:
  "Validation of a selected snapshot must include the unchecked changes
  incorporated since the relevant validated baseline."
- **Preserved exclusions and admission.** The whole workflow stays required:
  every job and every matrix shard of a validated run succeeded, the
  `paths-ignore` filters are unchanged, and each run's artifacts
  (`donut-0.0.1-SNAPSHOT.jar`, `frontend-dist`, `cli-dist`) belong to its own
  head SHA. Inspect the replaced B run and the validated C run: B holds no
  release artifacts, and Donut's release admission rule (exact-SHA `ci.yml` run,
  docs-only first-parent walk, non-success conclusion blocks) would block a
  release at B rather than reuse C's artifacts. Observe this through run and
  artifact facts; run no deployment, push no tag, and change none of Donut's
  `scripts/ci/application-release-*.mjs`.
- **Remote identification in a real checkout.** Carried from the split story:
  in the isolated Donut worktree, whose only remote is `origin`, the observer
  identifies the target's remote itself and proves B → C ancestry for a C
  published by another writer without a manual fetch.

Authority and cost: execution obtains Terry's authority before each
state-changing or paid step on `nerds-odd-e/doughnut`, naming the proof refs and
the number of full `ci.yml` runs. Donut's full CI uses `vars.RUNNER`,
`ubuntu-latest`, and repository secrets including the OpenAI token, the Discord
webhook, and DockerHub. Remove only proof-owned refs after judging; completed
runs stay in Donut's Actions history as evidence.

Deferred promises (not built or verified here):

- A production coalescing rate, or adoption on Donut `main`; both wait for the
  separately authorized rollout of the retained branch.
- Deliberately failing or rerunning a Donut run to observe failure, pending
  rerun, or withdrawal dispositions; the released runtime's tests own those and
  the proof records them only if they occur naturally.
- Changes to Donut's release admission, deployment, or other workflows, and
  grouping distinct targets or deployment obligations into one waiting slot.
- Pygardon work and native host acceptance.

A runtime gap that the real provider exposes in installed 0.3.63 is fixed in
Open Dough source within this story when it is bounded, then proved through a
candidate installation in the isolated Donut worktree and labelled candidate;
otherwise it goes to bug fixing and this story reports the proof as blocked.
The split story's plan, `165482a2:.planning/slice-plans/307-coalesced-ci-validation/PLAN.md`,
records the inert Donut queue probe (GitHub kept the active run and replaced
the single waiting run; B and D were cancelled with no jobs; the probe ref was
deleted) and the shared runtime's accepted proof. Reuse these results; do not
repeat them.

#### Key examples

1. **Coalesced burst.** Proof target P in Donut's repository carries the
   concurrency group and the declaration; Donut's installed observer watches P.
   → Source A is pushed, then source B while A's run is in progress, then source
   C (containing B) while A still runs. → A's run finishes `success`; B's run
   goes pending → `cancelled` with no jobs when C arrives; C's run starts after
   A and finishes `success`. Two of three source pushes started `ci.yml` jobs.
   A's completion is exact. B's completion is `integrated_state` with accepted
   B marked superseded, validated C (SHA, run, attempt, `ci.yml`/`push`, URL),
   and the recorded B → C ancestry basis.
2. **Later arrivals do not starve feedback.** C's run is in progress. → D then
   E are pushed to P. → C finishes untouched, D is replaced by E with no jobs,
   E runs after C. B's completion at C is unaffected by D or E pending.
3. **Docs-only push.** Source S has a run in progress on P. → A push T changing
   only `docs/**` arrives. → GitHub creates no run for T and S's run keeps
   going; the observer resolves T as not required with S's run as basis and
   completes T when S succeeds. If instead S's run is replaced by a later
   source U that contains S and T, T completes only once U's run is validated.
4. **Both modes and wrap-up.** The burst's real run facts are available for P.
   → A Story Branch Mode execution and a Trunk Mode execution each complete an
   accepted revision whose own run was replaced, and wrap-up closes one of
   them. → Each completion receipt distinguishes accepted from validated with
   the facts above, and wrap-up retires its worktree and branch only after the
   gate reports that integrated-state evidence.
5. **Release admission stays exact.** B's run was replaced and C's run
   validated. → Inspect both runs' artifacts and conclusions against Donut's
   release admission rule. → B's run lists no `donut-0.0.1-SNAPSHOT.jar`,
   `frontend-dist`, or `cli-dist`; C's run lists all three with C's head SHA;
   the rule would block a release at B on its `cancelled` conclusion instead of
   reusing C's artifacts. No tag is pushed and no deployment runs.
6. **Without the declaration, completion stays exact.** The same burst facts
   exist, but the observer runs from a checkout whose `.planning/open-dough.json`
   lacks `integratedStateCompletion`. → B's completion is awaited. → B stays
   unresolved with its cancelled run; nothing completes B from C.

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
