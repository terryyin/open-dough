# Reuse CI validation — observations and execution evidence

Source: [plan 306](PLAN.md), `SEED-008#reuse-ci-validation-at-integration`.
This companion retains the plan's judged observations and execution context;
current scope, slice statuses, decisions and story obligations remain in the plan.

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
