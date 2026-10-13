# Reuse CI validation at integration

**Identity:** SEED-008#reuse-ci-validation-at-integration
**Source:** [selected story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#reuse-ci-validation-at-integration)

## Goal and scope

Prevent equivalent CI work from executing twice when either delivery mode
publishes the exact already validated commit to its authorized target. Preserve
fresh validation for a new SHA, target-specific obligations, accepted-publication
evidence and the existing completion/shutdown/retirement gates.

The CI provider runs a lightweight target decision, using a shared opt-in reuse
gate and the project's explicit validation/context policy. It either reuses a
qualified direct source success or runs the covered work fresh. It executes any
target-only work and exposes an aggregate target attempt with inspectable source
provenance. Dough observes that real target attempt through its existing adapter.
Ship reusable source/payload guidance, a callable gate, and GitHub and custom-CI
adoption examples. Do not automatically edit an adopting project's CI.

Excluded: another observer-side eligibility policy, cross-branch relabeling,
tree-equivalence reuse, speculative CI scheduling services, changed merge/rebase
strategy, branch validation added to Trunk Mode, global job deduplication, forced
pushes, a release, and automatic migration of project workflows. Dependency
caching and shorter waits alone cannot satisfy this outcome.

## Design and existing solutions

PFE reviewed the shared CI acquisition, path applicability, coverage and
completion code, publication owners in both modes, installed payload declarations,
and the CI workflow. Reuse `ci-command-adapter.mjs`'s target-attempt contract and
`ci-github-actions.mjs`'s selected target workflow observation. Keep publication
with `history-preserving-publication.mjs` and `execution-increment-delivery.mjs`;
keep completion/shutdown with `ci-mailbox-complete.mjs` and Trunk closure with
`trunk-closure.mjs`. Reuse existing fixture owners rather than another runtime
lifecycle. The new gap is provider-side eligibility and job suppression, not
observer ownership. A provider's source-fact reader and job conditions adapt
that gap; one shared eligibility rule must serve both examples.

Do not reuse `preferredAttempt` as a cache selector: it prefers any success.
Do not use startup-history filtering for historical lookup: it intentionally
drops older completed attempts. Query the exact source SHA and current relevant
attempts at the gate; a bounded incomplete query is a miss. Do not repurpose
`not_required` ancestor coverage: it describes ignored paths, not this exact-SHA
reuse claim. The gate's source lookup is separate from ordinary target polling;
no broad cross-branch failures enter the target observer.

A reuse key comprises the exact SHA, validation unit/configuration and the
project's equivalent-context identity. Eligibility also requires trusted origin,
current successful direct evidence, validity, and no unresolved newer relevant
attempt. Unknown or contradictory facts mean fresh validation. Source attempt
IDs stay opaque. Provider-specific ordering must prove supersession, or the
comparison is ambiguous. A current fresh-validation override invalidates reuse.

Keep source run/attempt, source ref, URL, context and decision reason on the
provider's target evidence page. The target's own run/attempt is the observable
Dough result. Success requires reusable or fresh proof for every covered check
and success of target-only obligations; skipped jobs alone establish nothing.
At completion, the decision reflects evidence readable when that gate ran; this
story promises no reservation against future external changes or later reruns.

Follow the existing [North Star](../../NORTH-STAR.md#remote-history-and-optional-local-refresh)
and Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation and bounded investment), [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(boundary-owned proof), [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(shared runtime audience), and [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source and payload lifecycle). Author under `src/skills/`; never hand-update
installed `.agents/skills` or `.claude/skills`. Review changed guidance under
[AGENTS.md](../../../AGENTS.md). No new North Star topic or ADR is warranted.
Proposed ADRs 0007/0009 do not authorize a new publication policy.

## Preparation observations and decisive premises

Preparation checkout:
`/Users/terryyin/git/open-dough/.worktrees/avoid-duplicate-ci-when-main-receives-an-already`,
branch `codex/avoid-duplicate-ci-when-main-receives-an-already`, baseline
`3a9f6bfbb476edf8a78145f404b343ea537df0bb`, observed 2026-10-14.
Execution establishes its own workspace; these observations are baseline evidence,
not evidence that a later implementation works.

| Premise / consuming boundary | Literal observation | Result and limit |
| --- | --- | --- |
| Existing custom acquisition preserves target attempts, exact SHA, opaque identities and URL; completion consumes exact target evidence and confirms shutdown | `node --test src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs` | 32 passed. Real adapter subprocess and mailbox worker boundaries, controlled provider inputs. Does not prove suppression |
| Exact-SHA adapter proof discriminates a wrong normalized SHA | Temporarily replace `headSha: attempt.sha` with a zero SHA, then `node --test --test-name-pattern='command acquisition retains opaque run and attempt identities across polls' src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs`; restore and repeat | Mutant exited 1 with SHA assertion mismatch; restored code passed 1 test. Scratch edit reverted before recording |
| Publication owners return the accepted candidate after fast-forward, merge/race and unpublished-suffix reconciliation; Trunk closure retains resources on failed/unresolved completion | `node --test src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-completion-gate.test.mjs` | 15 passed. Actual local bare remotes and publication/closure consumers; completion inputs controlled. New gate-to-completion journeys remain owned below |
| Hosted run metadata can identify source attempts | `gh api 'repos/terryyin/open-dough/actions/workflows/ci.yml/runs?per_page=3' --jq '.workflow_runs[] | {id,run_attempt,head_sha,head_branch,event,status,conclusion,html_url}'` | Read-only query returned actual push runs, including successful main run 38483668097 at acc3c6d203ce2a41db044c2154c8390c94899262. No suppression inferred |
| A target push can suppress covered jobs, retain source evidence and publish a correctly aggregated target result | GitHub [job conditions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions) and [run API](https://docs.github.com/en/rest/actions/workflow-runs) reviewed; read-only API prefix above reached | Hosted execution remains unobserved. Slice 1 is the permitted early state-changing/credentialed probe; failure stops dependent slices |

No inexpensive local observation can establish GitHub's actual scheduler
outcome. Do not replace the early hosted probe with mocked Actions JSON or claim
local tests prove it. Local proof for the new gate will execute its actual
check command and count executions, rather than pre-seeding a reuse verdict.

## Outside-in proof ownership

| Promise / story examples | Owner and decisive observation |
| --- | --- |
| Exact-A fast-forward and eligible exact-A Trunk publication avoid covered execution | Slice 2: actual mode-specific publication accepts A; gate consumes real retained source evidence; check-command count remains one; target observation completes for A |
| New merge M, rejected M replaced by N, closure-added SHA and Trunk rebase A → B validate the accepted SHA | Slice 2: real Git fixture produces each distinct accepted SHA; covered command executes for that SHA; receipt never points to rejected/earlier SHA |
| Ordinary new Trunk increment, repair and final closure do not require a branch push | Slice 2: target refs show only the authorized direct publications; fresh check count increases, own observer receives the accepted SHA |
| Missing/pending/failed/incomplete/unreadable/expired/mismatched or contradictory source evidence falls back | Slice 2: gate invokes fresh work; failed fresh work cannot become target success; later proven successful superseding attempt can qualify |
| Target-only obligations remain effective and source attribution is inspectable | Slices 1 and 2: covered job is skipped on hit but target-only job executes; its failure fails the aggregate; target page identifies source run, attempt and context |
| Unconfirmed publication or incomplete/failed completion and unconfirmed shutdown preserve resources | Slice 2: real publication/closure consumers retain workspace, branch and observer where required; failed push never obtains a publication receipt |
| Same contract is usable outside GitHub and on all supported hosts | Slice 3: runnable custom-provider scheduler/adapter consumes the same gate, yields target attempt, and completes through both modes; payload install/update proof covers both physical roots; host integration evidence reuse explicitly assessed |

## Ordered slices

### 1. Establish hosted suppression and truthful target evidence
Type: Behavior
Status: planned
Proof: A bounded hosted experiment observes covered-job execution counts,
source attribution, and the actual target workflow conclusion for a hit, miss
and failed target-only check.

Behavior: Given a tiny directly validated commit on an isolated source ref,
push that exact commit to an isolated target ref with a minimal gate workflow;
the target avoids the covered check, still runs target-only work, and records
its source. A fresh SHA or context miss executes the covered check; a failing
target-only obligation fails the target result even on a reuse hit.

Use this repository's authorized execution workspace and a bounded uniquely
named pair of disposable proof refs, with only an inert check command. Before
any hosted mutation, establish that the executing instruction authorizes those
refs and Actions runs; if it does not, stop this probe for that exact authority,
without changing main or creating another repository. No hosted mutation is
authorized by this preparation. Record workflow/run/attempt links, job states,
source/target SHAs, context and command counts. Exercise job dependencies and
the final aggregate condition: GitHub's successful skipped-job state must not
accidentally certify missing validation. Keep external wait separate from
implementation time and bound it by the existing CI observation timeout.

This is a feasibility probe, not a new permanent scheduler or a release.
Clean up only owned experimental resources. If the provider cannot expose a
truthful target result or avoid execution, stop slices 2–3 and return that
finding to this plan; do not silently substitute shorter waits. This unresolved
hosted premise is bounded here under planning's permitted early-probe rule.

### 2. Reuse validation safely through both publication modes
Type: Behavior
Status: planned
Proof: A reusable GitHub gate/recipe plus real local publication-to-completion
journeys count actual covered-command executions and inspect source and target
evidence. Hosted probe evidence covers scheduler semantics; local controlled
API responses cover deterministic eligibility boundaries.

Behavior: With explicit reusable-check/context policy and eligible direct
source success, either mode's exact accepted A gets a lightweight target result
without covered execution. All misses run ordinary validation; new merge,
closure or rebased candidates validate their own SHA. Target-only failures and
unresolved publication/completion/shutdown preserve the existing failure and
resource gates.

Implement the smallest shared eligibility function/command under the existing
CI capability and the provider-specific source lookup/job wiring shown necessary
by slice 1. Retain bounded-query and conservative-miss behavior. Policy belongs
to project CI, not a new required `.planning/open-dough.json` setting. Keep
current adapters and branch filtering unless the consuming proof demonstrates
a specific necessary change; do not create cross-branch observation coverage.
Update the shared CI manual and link it from the existing execution/wrap-up
policy so agents keep waiting for the real target decision and distinguish its
source evidence from publication. The adoption example must leave deployments
and other target obligations outside the reusable unit.

Compose existing `closure-story-integration`/publication fixtures,
`execution-increment-managed-delivery` reconciliation fixtures, mailbox
completion, and `trunk-closure` CLI fixtures with a provider fixture that invokes
the real gate and check command. Do not make `releaseCi` simply fabricate the
success this slice promises. Assert exact accepted SHA, covered-command count,
source identity, aggregate target outcome, observer ownership and actual resource
retention/removal. Cover the table above through shared cases and the distinct
mode consumers; a direct helper test alone cannot discharge either mode.
Source-fact edge cases use focused pure/adapter tests. Disable reuse in a scratch
mutation and require the duplicate-execution assertion to fail, then restore.

Include source/payload declarations and their fixture changes with this usable
increment. Run focused gate and consuming suites; run `bash tests/execution-payload-update.sh`
and `bash tests/payload-declaration-links.sh` because new runtime dependencies
must reach installed projects. Inspect actual installation/use in those fixtures,
not file presence alone. Review instructions with one exact-A hit and one changed
SHA/failed-target case under AGENTS.md. This slice delivers GitHub adoption; custom
provider translation is the remaining obligation owned by slice 3.

### 3. Adopt the same reuse contract with custom CI
Type: Behavior
Status: planned
Proof: A runnable non-GitHub provider example executes a check command, records
direct source validation, conditionally suppresses duplicate execution, emits a
real target attempt and is consumed through the installed `ciAdapter` route in
both mode journeys.

Behavior: A project using its own CI supplies explicit equivalence and source
facts to the same gate. Exact accepted SHA reuse avoids duplicate work and
retains source provenance; missing/contradictory evidence runs fresh validation,
and target-only failure prevents completion. An opaque source attempt is never
relabelled as the requested target's attempt.

Extend the existing custom-CI manual and runnable example with the provider-side
scheduler decision and evidence page/report, leaving the observer protocol
unchanged. Demonstrate project-owned ordering/context validity without sorting
opaque IDs. Reuse slice 2's gate and mode proof; replace only provider fact
acquisition and target-attempt discovery. Test that a legacy adapter/project
without reuse policy continues ordinary CI without new configuration. Expose
source evidence through the target attempt's URL/report rather than unknown
adapter fields. Run custom acquisition and affected completion/mode suites and
the affected payload/update checks; do not add a provider framework or pretend
every external service has been tested.

Document adoption prerequisites, the equivalence boundary, miss/fresh-validation
behavior, and inspectable evidence in the installed manual. Cross-tool behavior
stays in the shared command/manual: Codex, Cursor and Claude Code keep their
existing host launch and observer integration. Record justified reuse of each
host's integration evidence and the representative guidance review; if actual
host interfaces must change, stop that assumption and assign the newly affected
proof under ADR 0005 before claiming it. No new native acceptance is claimed by
these deterministic tests.

## Current decisions and boundedness review

All slices implement one rule, exact SHA plus explicitly equivalent current
validation context, through provider-owned execution and ordinary target
observation. The probe isolates hosted feasibility; slice 2 owns the cohesive
GitHub outcome including both publication consumers, failure cases, instructions
and delivery; slice 3 proves adaptation to the already-supported custom CI
boundary without another policy. Their separation yields usable GitHub adoption
before the custom example and avoids a test-only or layer-only slice.

No numeric slice limit is supplied. The main risk is provider lookup/aggregation
semantics, isolated by slice 1. Stop and replan if it disproves the boundary or
if implementing slice 2 needs a second scheduler/protocol. Do not shrink either
mode or the custom-provider promise to preserve an estimate. No S/M/L estimate
is invented. Slice-plan refinement was not needed: the sequence has one shared
rule, bounded proof owners, and an explicit early probe; review found no other
slice-specific blocking concern.

## Learnings

The existing adapter is sufficient when CI produces a genuine target attempt
and retains source attribution in its evidence. It is insufficient to copy a
source attempt into target discovery: normalization assigns the requested branch
and discards unknown provenance fields. The chosen provider-owned target result
avoids that route. Hosted suppression is deliberately still a probe, not a
claim established by successful baseline checks.
