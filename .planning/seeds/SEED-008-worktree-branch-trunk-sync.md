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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
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
  Whether the existing adapter is sufficient or requires an extension remains
  to be established during refinement; no new configuration key or protocol
  shape has been selected.
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

#### Candidate direction and remaining uncertainty

The smallest candidate direction is for the project's CI to own equivalence and
execution reuse, while Dough recognizes truthful evidence for the accepted
target SHA and keeps its publication/completion contract. Put that responsibility
in the shared CI policy/evidence solution consumed by both modes, with only the
necessary adaptation in their distinct publication paths. This is a direction
for refinement, not a selected implementation or a readiness claim.

Resolve before executable planning:

- How a project declares reusable checks and equivalent context, including
  branch-dependent behavior, external inputs, and validity of retained evidence.
- Whether provider-owned target success through the existing adapter is enough,
  or the shared contract needs explicit reuse eligibility/provenance and a
  targeted exact-SHA lookup. Decide how native GitHub and custom CI express it.
- How conflicting, newer, or rerun evidence affects eligibility, so an old green
  result cannot silently override an applicable failed or incomplete check.
- How reuse completion preserves the correct observer ownership and shutdown
  gates in both Story Branch and Trunk Mode without requiring a nonexistent
  duplicate target run.
- A representative project's scheduling/reuse capability and real end-to-end
  observation. No particular project's CI scheduler has been inspected, and no
  suppression capability, native-host acceptance, test result, implementation,
  or performance saving is claimed.

Evaluation should observe the key examples through the real publication,
provider, and completion boundaries: exact eligible reuse avoids covered job
execution; a new merge or rejected-push replacement gets validation; missing or
ineligible evidence cannot complete successfully; main-specific obligations and
resource preservation remain visible. Preserve inspectable source run/attempt
identity. Further refinement selects proportionate proof and any affected
cross-tool acceptance under this seed's architectural context. Observe both
mode-specific publication/completion paths against the shared rule, including
ordinary new Trunk Mode increments and a rebase that changes the accepted SHA;
a passing Story Branch journey alone does not prove Trunk Mode coverage.

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
