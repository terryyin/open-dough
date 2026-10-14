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

<a id="reuse-ci-validation-at-integration"></a>

### Avoid duplicate CI when main receives an already validated commit

**Identity:** SEED-008#reuse-ci-validation-at-integration
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/306-reuse-ci-validation-at-integration/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"60376ec9e429a7ba6d3f0db6541611155861c78f84ae300950ec8fbd85a4419d","plan":"122f98a27ada0a0391a2a640014b5e1ba2c742d611673f55d3a55763890be56b"}}
```

**Goal:** Developers using Open Dough with their project's own CI avoid repeating
equivalent validation when either Story Branch Mode or Trunk Mode publishes the
exact already validated commit to main, while still validating a new integration
commit and confirming publication and safe resource cleanup. Reduce CI time,
compute, and wrap-up waiting without weakening the evidence for the integrated
result.

**Origin and priority:** Terry's 2026-10-14 discussion of Story Branch wrap-up,
followed by the explicit request to retain all known details and put this story
first in the product backlog. Terry selected reusable Dough behavior for
projects using their own CI, rather than a change only to Open Dough's GitHub
workflow. The discussion authorized analysis only; this request authorizes
recording and publishing the queued story, not implementation.
In the follow-up discussion, Terry required a cohesive solution covering both
execution modes; this extends the same story rather than creating a separate
Trunk Mode solution.

#### Scope and intended behavior

- Reuse successful CI evidence only when it applies to the **exact SHA accepted
  on the authorized integration target** and equivalent checks and execution
  context. A matching SHA is necessary but not sufficient: branch conditions,
  environments, workflow/check configuration, and external inputs can affect
  what the prior success proves.
- A project explicitly determines which validation is reusable across branches.
  Main-specific checks, including deployments or checks using a different
  environment, retain their own obligations. Reusing common validation must not
  silently waive those checks.
- A new merge SHA requires validation under this story's exact-commit rule,
  including a merge recomputed after main advances and rejects an earlier push.
  A new SHA produced by rebasing an unpublished Trunk Mode increment has the
  same requirement. Tree equality or successful validation of a parent or the
  pre-rebase SHA does not establish an exact-SHA match. Missing, pending,
  incomplete, failed, or ineligible evidence falls back to the ordinary CI path.
- Preserve confirmation that the authorized remote target accepted the actual
  candidate, truthful completion evidence, failure handling, and applicable
  observer shutdown/resource-retirement gates. An earlier story-branch result
  alone does not prove publication to main.
- Avoid duplicate **execution**, not just Dough's wait. The project's CI must
  recognize reusable evidence and avoid executing the covered checks again;
  merely letting Dough finish sooner while another full CI run continues does
  not deliver the intended saving. A provider may still create a lightweight
  target result or workflow record that refers to the earlier validation.
- This is reusable behavior across supported hosts and project CI providers.
  Keep shared policy/evidence semantics with the existing CI contract and the
  provider-specific ability to suppress duplicate work with the project's CI.
  Use the existing target-attempt adapter contract: the provider creates a
  real target decision for the accepted SHA. Its evidence page retains the
  original validation identity and reuse decision; do not relabel a source
  branch attempt or add a second observer-side equivalence policy.
- Apply one shared CI-reuse policy and evidence contract to both modes:
  Story Branch integration and Trunk Mode increment, repair, and closure
  publication. Verify each mode's consuming path; changing only Story Branch
  wrap-up orchestration does not establish Trunk Mode coverage. Keep their
  distinct publication mechanics intact. Trunk Mode normally publishes new
  commits directly to main without prior story-branch CI, so those commits
  still require ordinary CI. Do not add a branch push or branch-validation
  prerequisite just to make Trunk Mode fit the Story Branch journey.

This story does not select a new merge strategy, repeat branch validation until
main stops moving, build a general CI scheduler, change only this repository's
workflow, or introduce a release. It does not take or interrupt existing work.

#### Key examples

| Precondition and trigger | Expected result |
| --- | --- |
| Story commit A has successful validation for the reusable checks; main fast-forwards to exactly A under equivalent conditions | Confirm main accepted A, retain the source validation evidence, and complete without executing the covered checks again |
| Main has diverged; integration creates merge commit M | Validate M; successful validation of story commit A cannot satisfy M |
| Main advances and rejects candidate M; integration recomputes candidate N | Make the reuse/validation decision for the actual accepted N, not the rejected or superseded M; a new merge SHA gets fresh validation |
| The exact accepted SHA has no eligible successful evidence, or the evidence is pending, incomplete, failed, unreadable, or for a different context | Use the ordinary CI path; do not manufacture successful completion |
| A is validated on the story branch, but main adds branch-specific checks or deployment obligations | Reuse only the equivalent validation and fulfill the additional target obligations |
| CI reports an eligible reused success, but remote publication is unconfirmed or required observer shutdown is unconfirmed | Preserve the affected resources and report the unresolved obligation; reuse alone does not authorize cleanup |
| The story tip is green, but wrap-up adds closure changes before integration | Decide from the final accepted SHA and its applicable evidence; do not reuse the earlier implementation SHA merely because its product code looks unchanged |
| Trunk Mode publishes increment A directly to main, and no eligible CI evidence exists for A | Run ordinary CI for A; local proof or CI for its predecessor does not establish reusable CI success for A |
| A Trunk Mode publication has eligible success for its exact accepted SHA under equivalent conditions | Apply the same reuse rule as Story Branch integration, without repeating covered CI execution or weakening publication/completion gates |
| Main advances before a Trunk Mode push and the unpublished increment is rebased from A to B | Validate accepted B unless eligible exact-B evidence exists; do not transfer A's CI success to the new SHA |

#### Confirmed current behavior and corrected assumptions

The read-only analysis covered the installed guidance and shared source. The
relevant integration publication files matched when compared. Source links below
were inspected during the discussion; the recording baseline is
`acc3c6d203ce2a41db044c2154c8390c94899262`.

1. Story Branch wrap-up completes observation for the published final-closure
   tip, establishes observation for the authorized trunk target, fetches the
   latest target, and integrates in the owned workspace. Integration
   fast-forwards when possible, otherwise creates a history-preserving merge.
   It pushes the candidate **directly to the target**. It does not first push
   the integration merge back to the story branch and wait for branch CI.
2. After remote confirmation, wrap-up registers the accepted integrated SHA on
   the trunk observer and waits for its completion receipt. The current policy
   explicitly says a green execution-branch receipt covers only that branch and
   never releases later trunk observation. Successful completion with confirmed
   shutdown gates retirement.
3. A rejected integration push recomputes against the newly fetched target and
   retries once. A second rejection stops as persistent contention. There is no
   loop of branch CI followed by a check that main stayed unchanged.
4. The same-commit fast-forward case can repeat already validated code checks.
   When integration creates a new combined commit, target CI validates a result
   that branch CI has not necessarily checked. Therefore main CI is not always
   redundant.
5. Open Dough's own `ci.yml` triggers on both branch and main pushes, with
   planning/docs-only exclusions, as well as pull requests and manual dispatch.
   A qualifying main push is a separate workflow event even when its tip SHA
   was previously tested on another branch. This illustrates the scheduling
   issue; changing only this workflow is not the selected reusable outcome.
6. Trunk Mode pushes increments and repairs directly to the authorized trunk;
   it does not publish its local execution branch first. Its unpublished suffix
   can be rebased onto newer trunk, producing a new candidate SHA. Wrap-up also
   publishes its before-cleanup and final-closure commits through managed
   delivery. `trunk-closure.mjs finish` uses the shared CI completion operation
   for the final accepted SHA and requires success with confirmed shutdown
   before retirement. Both modes consume shared CI evidence/completion, but
   Story Branch history-preserving integration and Trunk Mode managed delivery
   are distinct orchestration paths. The Trunk Mode comparison was inspected at
   `32bc17acfb3fe917419232071c469bf743c0bb37`; automatic propagation of a change
   confined to one path must not be assumed.

Evidence:

- [Story Branch observation and target transition](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md#observe-story-branch-integration).
- [History-preserving integration and the bounded retry](../../src/skills/dough-execute-plan/references/preserve-published-history.md)
  and [publication implementation](../../src/skills/dough-execute-plan/scripts/history-preserving-publication.mjs).
- [CI workflow triggers](../../.github/workflows/ci.yml) and
  [GitHub's push-event documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#push).
- [Mode-specific publication targets](../../src/skills/dough-execute-plan/references/trunk-publication.md#publish-an-execution-increment-or-repair),
  [unpublished-suffix reconciliation](../../src/skills/dough-execute-plan/references/publish-the-candidate.md#publish-the-candidate),
  and [Trunk Mode closure](../../src/skills/dough-execute-plan/references/wrap-up-closure-publication.md#finish-trunk-mode-closure).
- [Managed delivery](../../src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs)
  and [Trunk Mode closure implementation](../../src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs).

#### Gap analysis and existing extension points

The merge/publication mechanism already identifies the exact accepted candidate
and target. The main gaps are reuse policy, evidence discovery/provenance, and
the external CI execution decision.

| Area | Current evidence | Gap to resolve |
| --- | --- | --- |
| Wrap-up and completion policy | The shared guidance requires observation of the actual publication target and rejects a different target's green receipt | Define an explicit eligible reuse path without weakening target publication, failure, or cleanup guarantees |
| GitHub discovery | `createGitHubActions.listRuns` queries the selected workflow with branch and push-event filters; `matchingCiRuns` also requires the target branch | Find eligible exact-SHA evidence across branches, without broadly admitting unrelated branch failures or assuming the same workflow name proves equivalent checks |
| Custom CI contract | Discovery requests contain `check.repo` and `check.branch`; responses carry run/attempt IDs, exact SHA, outcome, and optional URL/time | State how the provider certifies applicability of reused validation to the requested target and how its source/context remain inspectable |
| Evidence normalization and completion | The command adapter assigns the requested branch to normalized attempts; coverage records retain SHA and run/attempt IDs; completion exposes exact evidence or an ignored-only revision's basis | Distinguish source validation from destination publication and retain reuse provenance instead of relabeling a raw story result as a fresh main run |
| Historical evidence discovery | Startup keeps unfinished attempts and only the newest completed attempt by time, dropping older completed attempts from ordinary polling | Establish how a relevant historical success is retrieved reliably without breaking startup suppression of stale failures |
| CI scheduling | The custom adapter translates the service API and does not trigger, retry, or repair CI; Dough's observer does not suppress jobs | The project's CI must deduplicate covered work or provide a supported reuse decision; changing observer acceptance alone does not avoid the second execution |

Existing solutions to assess before adding another mechanism:

- A project CI service could already deduplicate execution and expose a valid
  successful check applicable to main through the existing adapter. Dough could
  consume that success today. This is an **inference from the adapter contract**,
  not observed provider support or a verified end-to-end reuse journey. Current
  guidance does not expressly describe reuse or retain its provenance; the
  adapter must not simply pass off an unrelated branch result as main proof.
- Exact registered-SHA coverage, run/attempt identities, accepted publication
  receipts, effective-evidence completion, and confirmed shutdown already exist.
  Reuse them where their meaning fits rather than adding a second CI subsystem.
- The existing `not_required` path follows an ignored-only revision to a proved
  ancestor basis. It demonstrates evidence indirection, but its path-filter
  proof is not a cross-branch exact-commit reuse policy.

Evidence:

- [GitHub queries](../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs)
  and [run filtering/startup history](../../src/skills/dough-execute-plan/scripts/ci-runs.mjs).
- [Custom CI manual and protocol](../../src/skills/dough-execute-plan/manuals/custom-ci.md)
  and [adapter normalization](../../src/skills/dough-execute-plan/scripts/ci-command-adapter.mjs).
- [Revision coverage](../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs),
  [run evidence classification](../../src/skills/dough-execute-plan/scripts/ci-revision-applicability-classification.mjs),
  [effective-evidence wait](../../src/skills/dough-execute-plan/scripts/ci-mailbox-await.mjs),
  and [completion/shutdown composition](../../src/skills/dough-execute-plan/scripts/ci-mailbox-complete.mjs).
- [Current completion requirements](../../src/skills/dough-execute-plan/references/ci-monitor.md#await-the-applicable-revision-at-completion).

#### Refined direction: CI owns reuse; Dough observes the target decision

The selected preparation direction keeps equivalence and scheduling together in
the project's CI. A lightweight target run evaluates reusable validation, skips
only the covered work on an eligible hit, performs any target-specific work,
and publishes its real aggregate result. Dough observes that target run through
its existing GitHub or command adapter and retains its existing accepted-SHA,
failure, completion, and shutdown obligations. This is an implementation choice
within the recorded goal, not a change to either execution mode.

Deliver reusable installed guidance and a small callable CI reuse gate, with a
GitHub Actions adoption example and a runnable custom-provider example using the
same eligibility rule. An adopting project explicitly supplies its reusable
validation boundary and context. Installation alone does not modify a project's
CI or enable reuse. Keep the gate with the existing CI capability rather than
introducing another service, scheduler, host-specific skill, or registry.

**Project policy and evidence:**

- Opt in a named validation unit (a check group or workflow) and the trusted
  source repository, workflow/check identity, source events/refs, and target.
  Establish equivalent configuration and execution context for that unit:
  dependency/toolchain inputs, environment, branch-dependent behavior and
  external-input validity. A project may pin inputs or supply an explicit
  context/version and validity bound; unknown equivalence means fresh work.
- Bind a reusable success to the exact SHA and policy/context identity. Retain
  source run and attempt identity, source branch, result URL, and context next
  to the target decision, including why it reused or ran fresh. The target's
  own run/attempt remains its identity in Dough's completion receipt. Its
  evidence page must make the source inspectable; extra adapter JSON fields
  currently discarded by normalization cannot serve as provenance.
- Discover historical evidence for that exact SHA at the CI gate. Read current
  attempts, not just cached successful summaries. A newer relevant pending,
  incomplete, or failed attempt, ambiguous ordering, partial retrieval, expired
  evidence, or an unreadable context prevents reuse. Do not scan only successes
  and hide contradictory evidence. A later successful retry can qualify when
  the provider establishes that it supersedes the earlier attempt; opaque
  custom-provider attempt IDs are not sortable revision numbers.
- Missing or invalid reuse information chooses ordinary execution of the
  covered work. It never marks it successful. Failures of required fresh or
  target-only work prevent the aggregate target success. A skipped job alone
  is not validation evidence. A reuse decision cites direct validation, not
  an unbounded chain of earlier reused results.
- The eligibility decision is made when the target gate runs against the
  currently readable evidence. It does not promise to predict later reruns,
  reserve external inputs, or provide atomicity across two CI executions.
  Changed inputs and explicit fresh-validation requests must invalidate reuse.

#### Alternatives explored and borrowed mechanism

| Candidate | Benefit against the goal | Consequence / disposition |
| --- | --- | --- |
| Keep current CI; shorten Dough's wait or cache dependencies | Smallest change; dependency caching can reduce setup cost | Does not prevent duplicate validation execution; insufficient for the selected goal |
| CI-owned gate plus a lightweight target result | Suppresses actual covered work; keeps target-specific obligations and ordinary target observation together | Recommended and used for planning. Requires project CI adoption and inspectable source evidence; capability is checked before dependent implementation |
| Dough discovers cross-branch success and certifies target coverage | Could finish without a target run | Observation alone cannot suppress already scheduled jobs. Adds scheduling coordination and duplicates the project's equivalence decision; not selected |
| Change branching, validate a merge on a staging ref, then promote it | Can validate an integration candidate before publication | Changes publication mechanics and introduces more coordination; not needed for exact-commit reuse and outside this story |

The borrowed mechanism is **memoization from build systems**: the validation unit
is the computation, the exact commit plus declared configuration/context is the
key, and its successful source attempt is the retained result. The target gate
performs the lookup; a miss executes the unit; target-only checks are separate
computations that still run. The consequential limit is that CI is not inherently
a pure computation: secrets, environments, time, external services and side
effects are not captured by a Git SHA. The project must establish that boundary;
a digest alone cannot prove equivalence. This analogy motivates the candidate,
but does not establish hosted scheduling behavior.

#### Architecture

Reuse policy belongs beside the provider's scheduling decision. The shared gate
owns exact-SHA/context eligibility; provider code supplies facts, skips work and
publishes evidence. Existing Dough acquisition and completion continue to own
observation of the selected target check. No cross-branch success enters the
ordinary observer as a target attempt. This avoids widening branch filters,
reusing the observer's success-preferring attempt selector for eligibility, or
turning its startup-history pruning into a cache lookup. The existing
`not_required` path for ignored-only revisions remains a distinct applicability
rule, not evidence of this story's exact-SHA validation reuse.

[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent representation and proportionate investment;
[ADR 0005 — Cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires evidence at each affected boundary;
[ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
keeps policy shared and instructions grounded in the executing project.
[ADR 0003 — Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [maintainer guidance](../../AGENTS.md) place changes in the shared source and
payload declarations, leaving installed copies to released updates. No release
is included. The existing [North Star](../NORTH-STAR.md#remote-history-and-optional-local-refresh)
already separates publication and CI coverage; no new product-wide boundary is
needed. The ADR index and records agree on Accepted 0000–0006 and Proposed
0007–0009. This design changes no integration timing or merge policy and adds no
conflict with the relevant Accepted decisions; it does not resolve or accept the
pre-existing lifecycle proposals.

#### Evidence and remaining execution probe

At preparation baseline `3a9f6bfbb476edf8a78145f404b343ea537df0bb`, in this story's
owned workspace, the adapter/acquisition/completion checks passed (32 tests),
and publication/reconciliation/Trunk completion checks passed (15 tests).
A temporary exact-SHA corruption in custom adapter normalization caused its
identity test to fail; restoring it passed. No scratch implementation remains.
These observations establish existing consuming boundaries, not reuse behavior.

A read-only GitHub query on 2026-10-14 returned actual workflow run IDs, attempts,
SHAs, branches, status and URLs from this project's `ci.yml`. GitHub documents
[conditional job execution](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions)
and [workflow run discovery](https://docs.github.com/en/rest/actions/workflow-runs).
Those establish available primitives, not a tested reuse journey. The first plan
slice therefore probes actual hosted suppression, target aggregation and source
attribution on isolated authorized refs before dependent implementation.

No hosted suppression, native-host acceptance, or compute saving is claimed
from the local checks. Evaluate savings by observing covered job execution
counts, not only shorter Dough waits. The probe must show both a hit that avoids
execution and a miss that executes; failed target-only work must still fail.
The custom-provider example and both publication modes receive their own
consuming-path proof. Existing host launch/observation mechanisms stay unchanged;
review the guidance under AGENTS.md and record justified reuse per host, without
claiming new native sessions ran.

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
