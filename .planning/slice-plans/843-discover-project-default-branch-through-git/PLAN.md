# Discover a project's default branch through Git

**Identity:** SEED-437#discover-project-default-branch-through-git
**Source:** [Discover a project's default branch through Git](../../seeds/SEED-437-discover-project-default-branch-through-git.md#discover-project-default-branch-through-git)

## Goal and scope

A developer adding a project validates origin access and configures the Board
on the repository's current default branch even when the execution checkout
tracks another branch. After the existing checkout root and origin-match
checks, Add Project uses the same authenticated Git transport as published
project refresh to resolve symbolic `HEAD`. Access refusal or an unusable
default leaves the project unconfigured with retry guidance. Board open,
Refresh, and other published readers stay with their own stories.

## Current decisions

- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps origin authoritative and separates the Review repository from the
  execution checkout. Add Project discovery shares Review's authenticated
  Git transport credentials, not Review's fetch or confirmation lifecycle.
- Proudly Found Elsewhere: change
  [Add Project](../../../dashboard/server/projectAddition.ts). Reuse Review's
  non-interactive credential helper
  (`credential.helper=` then `credential.helper=!gh auth git-credential`,
  `GIT_TERMINAL_PROMPT=0`) and the HTTPS `https://github.com/<owner>/<name>.git`
  URL form from
  [Review repository storage](../../../dashboard/server/reviewRepositoryStorage.ts).
  Do not reuse
  [remoteBranchHead](../../../dashboard/server/gitTargetFetch.ts) as written:
  its `ls-remote --refs` excludes symbolic `HEAD`. Resolve the default with
  `ls-remote --symref` of `HEAD`, parse `ref: refs/heads/<branch>`, and keep
  `check-ref-format --branch`. Discovery stays in Add Project; do not fold it
  into the Review writer.
- Map Git failure (including exit 128) to the githubUrl field with guidance to
  check `gh` access and retry, leaving configuration unchanged. Map a successful
  probe that yields no usable `refs/heads/` symbolic name, or a name
  `check-ref-format` rejects, to the same field with guidance that a usable
  default is unavailable and to retry when the repository has one. Do not call
  `gh api … .default_branch`. Rate-limit-specific wording from the old API path
  is not required on the Git path.
- Follow
  [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and
  [plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Prefer a real local origin routed through
  [fixtureOriginRoute](../../../dashboard/test-support/support/fixtureOriginRoute.ts)
  (`routeOriginThroughHome` / dashboard HOME routing) over extending Fake
  GitHub for default-branch discovery. Keep Playwright for the existing Add
  Project browser journey; keep backend validation on the Playwright backend
  suite until that suite's runner story moves it.

## Decisive premises and baseline

Observed on 2026-11-25 at `2cb391382` in this owned worktree, Node v24.21.0 on
macOS.

| Consuming operation and profile | Observation and consequence |
| --- | --- |
| Shell in this worktree: bare origin on `release+stable`, checkout on `local-only`, `HOME` `.gitconfig` `url.<bare>.insteadOf` `https://github.com/example/sample-app.git`, then `git -c credential.helper= -c credential.helper='!gh auth git-credential' ls-remote --symref https://github.com/example/sample-app.git HEAD` | Printed `ref: refs/heads/release+stable` and the tip SHA. Checkout branch does not affect the advertised default. Empty bare: exit 0 and empty stdout (no usable symbolic name). Missing insteadOf target: exit 128 with `Could not read from remote repository` / access-rights wording. |
| Scratch edit of `projectAddition.ts` forcing empty `ref` before `check-ref-format`, then `npx playwright test --config=dashboard/backend.playwright.config.ts dashboard/backend-tests/configuration/project-add-validation.spec.ts -g 'unreadable\|concurrent'`; reverted with `git checkout -- dashboard/server/projectAddition.ts` | `an unreadable GitHub repository…` failed because `fixture.github.calls` stayed `[]` while still expecting `api … .default_branch`. Those specs, the concurrent addition hold on Fake GitHub, and `e2e/configuration/project-add.spec.ts` assertions on `.default_branch` are consumers of the metadata API path and must move with the Git probe. |

## Outside-in proof

| Promise | Slice and observation |
| --- | --- |
| Add Project configures the branch symbolic `HEAD` advertises even when the execution checkout tracks another branch, and makes no repository metadata API call for the default branch. After add and restart, the Board uses that configured ref. | 1. Backend validation and the Add Project E2E with a routed real origin whose `HEAD` is `release+stable` and a checkout on another branch; assert saved `ref`, Board revision after restart, and absence of `api … .default_branch` for Add. |
| Access refusal or an unusable advertised default leaves the project unconfigured and tells the developer how to retry. | 2. Backend validation: refused remote and successful probe without a usable `refs/heads/` name; assert unchanged configuration file and field guidance. |

## Slices

### 1. Configure the advertised default branch from symbolic HEAD
Type: Behavior
Status: planned
Proof: Backend project-add validation and `e2e/configuration/project-add.spec.ts` with a routed origin whose symbolic `HEAD` is `release+stable` while the checkout is on another branch; saved `ref` is that branch; Board uses it after add and restart; no Add Project `api … .default_branch` call.

Behavior: Given an accessible origin whose symbolic `HEAD` names a usable branch different from the execution checkout's branch → trigger Add Project → the project is saved with that `ref`, later Board reads use it, and discovery used authenticated Git rather than the repository metadata API.

### 2. Leave Add unconfigured when Git access fails or the default is unusable
Type: Behavior
Status: planned
Proof: Backend project-add validation cases for a refused remote and for a successful `ls-remote --symref` without a usable `refs/heads/` name; configuration file unchanged; githubUrl field names retry guidance.

Behavior: Given origin access refused, or an accessible origin that does not advertise a usable default branch → trigger Add Project → nothing is appended to configured projects and the developer is told how to retry.

## Concern evidence

Slice-plan refinement was not needed: two Behavior slices, one cohesive rule
(authenticated Git for Add discovery and recovery), proof mapped, premises
settled, under the eight-slice limit.

Remaining slice-specific concerns: none identified.
