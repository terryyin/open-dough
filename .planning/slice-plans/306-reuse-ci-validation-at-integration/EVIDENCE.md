# Reuse CI validation — observations and execution evidence

Source: [plan 306](PLAN.md), `SEED-008#reuse-ci-validation-at-integration`.
This companion retains the plan's judged observations and execution context;
current scope, slice statuses, decisions and story obligations remain in the plan.

[Custom-provider evidence](CUSTOM-CI-EVIDENCE.md) retains slice 3's commands,
observations, representative guidance review and separate host evidence reuse.

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
| Publication owners return the accepted candidate after fast-forward, merge/race and unpublished-suffix reconciliation; Trunk closure retains resources on failed/unresolved completion | `node --test src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-completion-gate.test.mjs` | 15 passed. Actual local bare remotes and publication/closure consumers; completion inputs controlled. New gate-to-completion journeys remain owned by [slices 2–3](PLAN.md#ordered-slices) |
| Hosted run metadata can identify source attempts | `gh api 'repos/terryyin/open-dough/actions/workflows/ci.yml/runs?per_page=3' --jq '.workflow_runs[] | {id,run_attempt,head_sha,head_branch,event,status,conclusion,html_url}'` | Read-only query returned actual push runs, including successful main run 38483668097 at acc3c6d203ce2a41db044c2154c8390c94899262. No suppression inferred |
| A target push can suppress covered jobs, retain source evidence and publish a correctly aggregated target result | GitHub [job conditions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions) and [run API](https://docs.github.com/en/rest/actions/workflow-runs) reviewed; read-only API prefix above reached | Hosted execution remains unobserved. Slice 1 is the permitted early state-changing/credentialed probe; failure stops dependent slices |

No inexpensive local observation can establish GitHub's actual scheduler
outcome. Do not replace the early hosted probe with mocked Actions JSON or claim
local tests prove it. Local proof for the new gate will execute its actual
check command and count executions, rather than pre-seeding a reuse verdict.

## Execution context

Established execution on 2026-10-14: Story Branch Mode, publisher
`dashboard-territory.local-open-dough`, agent `dbs-chan`, workspace
`/Users/terryyin/git/open-dough/.worktrees/avoid-duplicate-ci-when-main-receives-an-already`,
branch `codex/avoid-duplicate-ci-when-main-receives-an-already`. The default
checkout is `/Users/terryyin/git/open-dough`; it is not the execution workspace.
Remote `origin` is `terryyin/open-dough`, integration target `main`.
Claim `dc1a7991acd373f93a33824f24ce22da28153e29` is confirmed on both remote
main and the story branch; starting revision is
`09247d6c0357de3cf432eb032873851a2c38404b`. The first delivery base is the claim.
Ordinary increments publish to the story branch. No trunk integration occurs
in execute-plan. Claim CI on main is unobserved by this execution.

Checkout setup: Node 24.21.0, `node scripts/setup-native.mjs npm`,
`node scripts/setup-native.mjs browser`, and `node scripts/setup-native.mjs check`
passed here with the current lockfile (Chromium 153.0.8010.12).
Replanning permission preserves the existing planning authority; no new scope.
No numeric slice limit or exception was supplied.

Codex observer: GitHub Actions, verified selector `ci.yml`, name `CI`,
repository `terryyin/open-dough`, target
`codex/avoid-duplicate-ci-when-main-receives-an-already`, coordinator
`reuse-ci-7ec402b7`, directory `/tmp/dough-ci-501/watch-5GLWcs`, PID `64377`,
session `26820`, yielded cell `10`. The stream observes story deliveries;
the disposable hosted experiment has separate bounded proof observations.

The current execute-plan instruction authorizes executing slice 1's bounded
disposable source/target refs and inert Actions experiment. Preparation alone
did not authorize it. Preserve main and the existing execution workflow.

## Accepted hosted proof — slice 1

Observed 2026-10-14 on `terryyin/open-dough`, using only the owned refs
`proof/reuse-ci-7ec402b7-20261014010635-a06120-source` and `-target` and an
inert workflow in an isolated Git tree. The execution checkout and main were
unchanged. A is `dd91af0914d336e7bbbd748f1975f8b847d13326`; B is its child
`2a571b4d9e910e79a8bb4cd0da1dad05ae4ea958`. Unit `inert-covered-v1` used
context `hosted-probe-v1` at A and `hosted-probe-v2` at B.

| Observation | Real attempt | Covered / target-only executions | Aggregate / workflow |
| --- | --- | --- | --- |
| Direct source A | [38493939926/1](https://github.com/terryyin/open-dough/actions/runs/38493939926/attempts/1) | 1 / 0 | success / success |
| Exact A target hit | [38494122080/1](https://github.com/terryyin/open-dough/actions/runs/38494122080/attempts/1) | 0 / 1 | success / success |
| Exact A hit with failing target-only | [38494122080/2](https://github.com/terryyin/open-dough/actions/runs/38494122080/attempts/2) | 0 / 1 | failure / failure |
| Fresh B target miss | [38494498699/1](https://github.com/terryyin/open-dough/actions/runs/38494498699/attempts/1) | 1 / 1 | success / success |

The following literal capture commands provided the terminal run, per-attempt
jobs and executed log markers for the four run/attempts above:

```sh
gh api 'repos/terryyin/open-dough/actions/runs/38493939926/attempts/1'
gh api 'repos/terryyin/open-dough/actions/runs/38493939926/attempts/1/jobs?per_page=100'
gh api 'repos/terryyin/open-dough/actions/runs/38493939926/attempts/1/logs'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/1'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/1/jobs?per_page=100'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/1/logs'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/2'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/2/jobs?per_page=100'
gh api 'repos/terryyin/open-dough/actions/runs/38494122080/attempts/2/logs'
gh api 'repos/terryyin/open-dough/actions/runs/38494498699/attempts/1'
gh api 'repos/terryyin/open-dough/actions/runs/38494498699/attempts/1/jobs?per_page=100'
gh api 'repos/terryyin/open-dough/actions/runs/38494498699/attempts/1/logs'
```

Inspected workflow conditions, job steps and `COVERED_COMMAND_EXECUTED`, `TARGET_ONLY_COMMAND_EXECUTED`,
`REUSE_SOURCE` and `AGGREGATE_EVIDENCE` markers establish these counts. Both
hits had a skipped covered job with no steps; gate and aggregate cited source
38493939926/1, exact A, source ref/URL, unit and context. Failure attempt 2
executed the target-only command and aggregate, and both failed. The aggregate
required qualified source or fresh covered success plus target-only success.
Hosted evidence proves suppression/aggregation feasibility; it does not prove
the later shared eligibility rule or either local publication consumer.
Both owned proof refs were deleted after their tips were checked; an exact
`git ls-remote` confirmed their absence. All owned watches reached terminal
results. Hosted run/job evidence remains inspectable; no repository CI workflow
or execution-branch revision changed during this experiment.

## Plan rationale and learnings

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

The existing adapter is sufficient when CI produces a genuine target attempt
and retains source attribution in its evidence. It is insufficient to copy a
source attempt into target discovery: normalization assigns the requested branch
and discards unknown provenance fields. The chosen provider-owned target result
avoids that route. Hosted suppression was initially a probe, not a
claim established by successful baseline checks.

## Delivered revisions

Slice 1: accepted `59f010eb9a429bb05e535dd7df9a466835e9b2a8` on
`origin/refs/heads/codex/avoid-duplicate-ci-when-main-receives-an-already`,
suffix base `dc1a7991acd373f93a33824f24ce22da28153e29`; managed delivery reused
the retained observer.

Slice 2: accepted `500802fba6aebf48015f8ee09fa9a10bf6077c92` on that same
story target, suffix base `59f010eb9a429bb05e535dd7df9a466835e9b2a8`;
managed delivery reused the same observer.

Slice 3: accepted `e96692b0bbe2d2425c4ce58915deae2bd99f2fb6` on the same
story target, suffix base `500802fba6aebf48015f8ee09fa9a10bf6077c92`;
managed delivery reused the retained observer. Implementation is delivered.

## Accepted deterministic proof — slice 2

Both literal commands below reached terminal exit 0 in this checkout, with
Node 24.21.0, Bash 5 and the project runner. New mode fixtures use real Git,
installed commands, actual covered/target-only child exits, target reports and
mailbox completion. Controlled GitHub responses supply the external provider
facts; they do not pre-supply the reuse verdict or successful covered work.

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-policy.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-github.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-github-command.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-resource-journey.test.mjs tests/execution-payload-update.sh tests/payload-declaration-links.sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition-owner.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic-logs.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-reconciliation-stops.test.mjs src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-completion-gate.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs src/skills/dough-execute-plan/scripts/ci-not-required-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs src/skills/dough-execute-plan/scripts/observer-owner-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs tests/native-evidence-identity.sh
```

Inspected setup: `ci-reuse-journey-test-fixtures.mjs` executes the covered
command, reads its direct marker through the installed GitHub reader and
invokes the installed generic gate; `completeTarget` reads the actual target
report and asserts the receipt's distinct opaque target identity. Named tests
in `ci-reuse-story-journey.test.mjs` observe exact-A count 1, accepted fresh
merge M / retry N / closure C, target-only failure and actual retirement only
after success plus confirmed shutdown. `ci-reuse-trunk-journey.test.mjs`
observes exact-A count 1, rebased B, three ordinary increment/repair/closure
pushes only to main, final receipt/retirement, rejected publication, failed
fresh work, incomplete target and retained shutdown. Incomplete target keeps
workspace/branch with no verdict and confirmed shutdown; retained shutdown due
unread failure keeps a live observer. `ci-reuse-resource-journey.test.mjs`
separately observes lost push acknowledgement and literal unconfirmed shutdown,
preserving resources despite real reused target success.

Policy/reader tests observe trust, exact SHA/configuration/context, validity,
fresh override, contradictory/ambiguous current attempts, bounded partial/capped
queries, aborts and marker provenance. The actual GitHub command tests observe
hit/miss/error outputs and source/target summary/report wiring. The guidance
test extracts the actual manual aggregate and rejects a failed gate with partial
reuse output, missing/skipped covered work and failed target-only work.
`installed-ci-reuse-fixture.bash` observes installed gate hit/miss counts and
GitHub command fallback in both physical roots after a real update.

Discriminating mutation in an isolated source copy: disable reuse, then run
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs`.
The exact-A duplicate-execution assertion failed with actual 2, expected 1;
restoring the original policy passed. Active source was never mutated.

One original combined test run failed at ordinary Trunk finish. A bounded
original-setup diagnostic stopped on its first failure after 69.725 seconds:
journey 61,975 ms, final revision undiscovered, observation unavailable, and
`Execution observation budget expired after 60000 ms.` A-only discovery at
1791942945243, A+repair at 1791942975287, A+repair without final at
1791942975802 and final registration at 1791942975803 identify two default
30-second polling gaps exhausting the fixture's 60-second budget. The provider
fixture now uses the established worker-only polling preload capped at 50 ms;
assertions still await real coverage. Final current proof passed; production
observation timing is unchanged. Owned scratch copies/processes were retired.

AGENTS/ADR 0006 review: exact A produces source-attributed reuse while target
obligations and completion remain effective; changed SHA is fresh and failed
target-only work prevents success/retirement. Guidance makes project-owned
equivalence, trust and input/validity decisions explicit. Hosted scheduler proof
is reused from slice 1; no new native-host acceptance is claimed. Custom CI is
the remaining receiving obligation in slice 3.

## Slice 2 post-change refactor proof

Shared worker polling and stopped-worker construction now live in
`ci-worker-poll-test-fixtures.mjs` and `ci-mailbox-stub-worker-test-fixtures.mjs`.
The real covered/target-only child commands moved to
`ci-reuse-check-command-test-fixtures.mjs`; GitHub response construction moved
to `ci-reuse-github-test-fixtures.mjs`. Trunk retention cases moved to
`ci-reuse-trunk-retention-cases.mjs`, imported by the same test entry, with shared
publication/wait construction in `ci-reuse-trunk-test-fixtures.mjs`. Source and
target assertions, counts, child exits and resource observations remain intact.
The unread-failure case now names retained shutdown; literal unconfirmed shutdown
remains independently covered by the resource journey. No observer policy changed.

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-github.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-resource-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-background-handoff.test.mjs src/skills/dough-execute-plan/scripts/ci-background-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs src/skills/dough-execute-plan/scripts/ci-not-required-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-guidance.test.mjs src/skills/dough-execute-plan/scripts/observer-owner-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs tests/execution-payload-update.sh tests/payload-declaration-links.sh tests/retrospective-reference-payload.sh tests/install.sh tests/update-refuses-unverifiable.sh tests/update-force-restores-latest.sh tests/update-removes-dropped-files.sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs
```

The first command reached terminal exit 1: 19 selected jobs passed; only the
supported-host guidance assertion failed after a prose condensation. Its original
lifecycle phrase was restored without changing behavior; the focused second
command reached terminal exit 0. Grouped source declaration extraction matches
Bash's literal array in order, and equivalent legacy extraction matches it too
(`tests/payload-declaration-links.sh`). Actual install/update/refusal/drop checks
consume the grouped canonical declaration; update still uses copied source
`install.sh`, delivering callable reuse commands to both physical skill roots.
Unchanged eligibility, GitHub-command, actual manual aggregate, existing mode
consumers and mutation observations reuse the accepted proof above.

Coordinator formatting repairs kept the same signal/env values, removed unused
callback inputs and the unused wait helper parameter. This affected proof
passed at terminal exit 0 before successful formatting:
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-github.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-resource-journey.test.mjs`.
