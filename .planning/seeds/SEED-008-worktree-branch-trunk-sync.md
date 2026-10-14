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

<a id="coalesced-ci-validation"></a>

### Coalesce CI validation with truthful completion evidence

**Identity:** SEED-008#coalesced-ci-validation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/307-coalesced-ci-validation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3c393c63d1741bd705e90ac83c3c8d13541a917ccd52ef3a42985f68a62d2370","plan":"e04b031bfabf03b758f4c2eae53101f0f24d0bd90dce24f8c9161c7c352e635a"}}
```

**For / why:** Developers and agents using Open Dough in rapidly changing
repositories get trustworthy integration feedback with fewer expensive CI
executions and avoid waiting for intermediate revisions the provider will never
check. Demonstrate the outcome with Donut's GitHub Actions and Pygardon's
self-built CI.

**Goal:** Preserve small, continuously published increments while coalescing
expensive validation onto selected repository snapshots. Execution and wrap-up
report which accepted revision was published, which snapshot was validated, and
what that evidence proves, without inventing a passing result for an unchecked
historical revision or weakening failure and resource-cleanup gates.

**Origin and priority:** Terry's 2026-10-14 discussion of Anthropic's
[source-control article](https://www.anthropic.com/engineering/redesigning-source-control)
and the observed CI load in Donut and Pygardon, followed by the explicit request
to queue this story next after exact-commit validation reuse
(`SEED-008#reuse-ci-validation-at-integration`). That work completed on remote
main while this story was being recorded; coalesced validation remains next in
the queue. Queue order alone establishes no blocking implementation dependency.

#### Scope

Deliver one shared contract for provider-owned coalescing and truthful completion,
with candidate adoption proved in authorized isolated copies of Donut and
Pygardon, through execution and wrap-up in Story Branch Mode and Trunk Mode.
Publication remains continuous. Preserve active validation; replace only waiting
snapshots within the provider's existing
admission and fairness rules. Continued arrivals must not postpone every verdict.

Projects explicitly opt in to integrated-state completion for identified checks
and contexts. Without that policy, exact-revision completion remains unchanged.
For a coordinator's accepted and registered B, a successful selected descendant C
can establish only that the integrated state at C was validated, with inspectable
repository/target, accepted B, validated C, run/attempt, policy/check/context and
ancestry evidence. C need not belong to the same writer, but B's publication and
ownership remain that coordinator's. Do not manufacture an attempt or historical
passing result for B, or infer coverage from a moving tip, timestamp or opaque ID.

Completion requires current, usable evidence for every applicable obligation.
Pending, failed, cancelled, unrelated, stale or context-incompatible descendant
evidence supplies no success. Proven queue replacement explains why B has no run;
it is not a passing verdict. Known failures and incomplete evidence stay
actionable until an evidenced disposition resolves them; a later green result
alone does not erase an earlier failure or transfer repair ownership.

Current evidence is scoped to the selected snapshot and its check/context, not
to the newest published tip. Once eligible C passes, newer D/E awaiting validation
do not by themselves invalidate C's evidence for incorporated B. A newer pending
or failed attempt of C's same check does invalidate its earlier green as current
evidence. This distinction is necessary for completed feedback during continuous
publication; it adds no guarantee that the latest branch tip has passed.

Validation of a selected snapshot must include the unchecked changes incorporated
since the relevant validated baseline. Preserve docs/planning exclusions and
applicable-ancestor evidence. No affected-test selector is required: full-snapshot
validation satisfies this obligation. If selection is used, C's last commit alone
is insufficient when B contributed unchecked source changes.

Release, deployment and other exact-revision or target-only obligations remain
bound to their actual selected artifact and required validation. Integrated-state
evidence cannot waive those obligations, publication acceptance, observer shutdown
or safe retirement. Deliver runtime guidance and its necessary payload changes
under existing shared owners; add neither a Dough scheduler nor another completion
ledger. This preparation authorizes no implementation, project migration or live
CI experiment; execution must establish the authority for each project's changes
and disposable provider experiments.

Terry confirmed on 2026-10-14 that adoption completes at isolated candidate
proof using both projects' actual workflow, adapter and completion consumers.
Retain reproducible project changes and the candidate runtime identity; a
scheduler-only demonstration is insufficient. Normal installed rollout in Donut
and Pygardon follows a separately authorized tagged release and is not claimed
by this story's completion. Use the complete candidate payload in disposable
proof installations through existing delivery fixtures, not hand-edited managed
files or a candidate presented as a released version.

Deferred promises: broader code-review reform, general affected-test selection,
tree-equivalence caching, force-push policy, delayed integration, release-version
work, normal installed rollout in Donut/Pygardon and automatic migration of other
projects. These are not new rejection rules for naturally supported cases.

#### Key examples

1. **Waiting replacement with completed feedback.** A is actively validating;
   eligible B then C enter the same target's waiting slot → the provider finishes
   A and validates C, without executing B's expensive checks. D/E arriving during
   C replace waiting work without cancelling C. Completed feedback continues;
   other admitted branches retain the provider's established turns.
2. **Truthful completion for incorporated work.** Writer 1 published and
   registered B; writer 2 published descendant C on the same authorized target;
   declared policy permits the same checks/context and C's current attempt passes
   → writer 1's completion reports B published and integrated state C validated,
   with ancestry and attempt evidence. It never reports that B itself passed.
   With no policy, it still requires B's applicable exact-revision evidence.
3. **Unresolved evidence stays unresolved.** B was replaced in the queue; C is
   pending, cancelled, failed, on another target, context-incompatible, or has
   unknown ancestry → completion stays pending or returns the existing bounded
   unresolved/failure outcome. A prior green cannot hide a current pending/failed
   rerun. An unread failure or unconfirmed shutdown prevents applicable cleanup.
   Conversely, C's current attempt is green and newer D is merely waiting → B
   can complete against C under the declared policy. D's pending state is not a
   rerun of C. Any known failure still retains its existing disposition gate.
4. **Unchecked source survives a docs-only tip.** A is the validated baseline;
   B changes source; descendant C changes only docs → any C validation/selection
   accounts for the source since A. If Donut's trigger ignores C's push, C is not
   an eligible replacement; the admitted B check remains required. A genuinely
   ignored-only chain retains its existing applicable-ancestor evidence.
5. **Artifact obligations stay separate.** B's integrated-state checks are
   evidenced at C, but a release selects B's artifact or a required target-only
   check is missing/failed → the integrated-state receipt does not certify that
   artifact, release or deployment. Required resources stay until the actual
   obligation and shutdown gates are satisfied.

#### Explored direction and borrowed mechanism

| Candidate | Same-goal comparison |
| --- | --- |
| Keep exact-commit reuse alone | Simplest existing behavior; saves duplicate validation at the same SHA, but does not resolve a coalesced-away B or suppress distinct B/C snapshots. |
| Cancel active work or debounce until publications stop | Can save work, but sustained arrivals can prevent a completed verdict; violates the active-finish and feedback examples. |
| Provider waiting-slot replacement plus an explicit validation position | Recommended: native scheduling avoids redundant pending work; the existing observer interprets evidence without relabelling B or creating a scheduler. |
| Add a central Dough scheduler and completion store | Duplicates provider and observer responsibilities and conflicts with this story's shared-owner boundary; do not pursue this path. |

The third candidate borrows a materialized view's applied position: accepted
commits correspond to durable inputs, the selected CI snapshot to the materialized
state, and validated C to the view's observed position. Each consumer keeps its
own accepted B and can ask whether a validated state incorporates it. Adapt the
position to Git ancestry plus explicit target/check/context evidence, not a
numeric high-water mark. The limit is consequential: Git is a graph, commits can
revert earlier changes, and a descendant passing does not prove B's old tree
passed or settle a known failure. The analogy motivates a candidate, not proof.

#### Investigation and evaluation

Observed on 2026-10-14 after exact-commit reuse landed:

- Donut checkout `6b679854235f9fc6913e46f52bb675f2c2a815c5` still has
  docs/planning exclusions and no CI concurrency group in
  `.github/workflows/ci.yml`. Its deployment workflow downloads artifacts using
  the admitted CI run ID. The
  [GitHub concurrency contract](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
  documents one running/one pending group by default, pending replacement, and
  separate active cancellation. Queue order is not a promise of Git push order.
- Pygardon checkout `6cc3d202b9f2d9402fc3ad03bd162eabc9cfb26a` has branch-keyed
  `PendingRevisionQueue` replacement preserving insertion order and a `CiSession`
  owner. Its real adapter `--check-target terryyin/pygardon main` passed. A local
  HTTP probe through the actual adapter and Dough normalization observed an
  attempt supplied for `feature/other` attributed to requested `main`: discovery
  omits branch evidence. Adoption must expose/filter authoritative target facts;
  current all-branch discovery cannot establish descendant target coverage.
- The landed `ci-reuse-policy.mjs` authorizes only exact-SHA reuse at scheduling.
  Existing Story/Trunk/custom publication-to-completion and shutdown cases pass.
  A disposable local Git/coverage probe proved B is C's ancestor, supplied only
  C's successful attempt, and observed B remain `undiscovered` and its bounded
  applicable wait time out. A new integrated-state evidence path is necessary;
  `not_required` still means ignored paths, not queue supersession.

Unsettled premises are provider execution and complete provenance under real
A/B/C arrivals, and savings through the actual consuming journeys. Cheap local
observations establish neither. Bound the remaining hosted/owner-held
observations as early executable probes; stop dependent work if the provider
cannot retain required target, context, attempt or ancestry facts. No measured
production savings or coalesced completion is claimed by this refinement.

Evaluation follows both real providers from publication/admission through actual
check invocation, observation, completion and applicable retirement. Count
expensive executions and inspect skipped waiting work, completed feedback during
continued arrivals, and accepted/validated SHAs with provenance. Extend actual
mode-specific execution and wrap-up consumers; scheduler-only proof, shorter
waits and synthetic successes cannot satisfy the story. Use bounded inert
experiments first, and the selected projects' real consuming paths for adoption.

Second-pass review retained the provider-owned direction and the materialized-view
analogy. Two findings shape the revised plan: descendant evidence must remain
available independently of completed-notification pruning, and the existing
background handoff/waiter consumes `recordedVerdict` alongside synchronous
completion. The plan records the observed consumer proof and gives those
lifecycles explicit ownership. Newer waiting tips and newer attempts of selected
C have different effects, as example 3 states. No additional scheduler, ledger,
selector or host lifecycle is needed.

#### Architecture

Keep four meanings separate within their existing owners: accepted publication,
provider selection, actual snapshot validation, and Dough completion. Extend
existing coverage/completion evidence with the explicit integrated-state basis;
do not change the meaning of an exact success or an ignored-only ancestor. Keep
exact-commit reuse in its scheduling gate. Acquire provider provenance once and
preserve it through adapters/normalization, rather than inferring it from the
requested target. Ancestry proves incorporation into history, not ownership or
historical test success. Missing evidence remains unknown.

Keep candidate discovery distinct from the notification stream and carry one
effective-evidence rule through synchronous waits, recorded verdicts and their
background callers. Preserve existing exact-revision retention semantics; do not
automatically give the new descendant evidence the same sticky terminal status.
An inspectable historical observation and a claim of current usable evidence
are different facts. Use the executing project's existing configuration home
for the demonstrated opt-in, following Accepted
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md);
do not add a separate policy store or hand-edit installed managed content.

This follows Accepted [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md)
(aligned domain meaning), [ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(continuous integration and one representation),
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source/payload lifecycle), [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
(proof at consuming boundaries), and
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one shared rule written for the executing project). Follow
[AGENTS.md](../../AGENTS.md) when authoring guidance. ADR index and record statuses
agree; ADRs 0007/0008/0009 remain Proposed. This design changes no integration
mode or Accepted decision and needs no ADR proposal or exception.

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
