# Update from the previous release without legacy readers

**Identity:** SEED-423#retire-finished-migrations-and-legacy-formats
**Source:** [Update from the previous release without legacy readers](../../seeds/SEED-423-shrink-the-installed-distribution.md#retire-finished-migrations-and-legacy-formats)

## Goal and scope

A developer who keeps Open Dough current updates directly from the immediately
previous numeric release (`latest` stays a zero-write no-op; an installation
older than the previous release stops cleanly before any managed file changes),
while the installer, product backlog, execution runtime, GitHub request owner,
and Dashboard reporting drop finished migrations and legacy compatibility
readers that no maintained installation or persisted project record uses.

Excluded: unit-less CI proof entries (`LEGACY_UNIT` / `unit: "legacy"`) and
summary `schemaVersion: 1` across the `ci-proof-*` scripts and Dashboard
readers, resplit before readiness to
[Read and collect CI proof only in declared units](../../seeds/SEED-423-shrink-the-installed-distribution.md#require-declared-units-in-ci-proof)
([plan 795](../795-require-declared-units-in-ci-proof/PLAN.md)). Installed
copies under `.agents/skills/` and `.claude/skills/` in maintained repositories
update at the next release rollout.

## Decisions and existing owners

- **Keep the previous-release check in `open-dough-release-resolve.sh` and `open-dough-release-baseline.sh`.**
  `open-dough-release-apply.sh` is 244 lines; `open-dough-release-baseline.sh`
  is 75 lines. Resolve `latest` alongside `previous` (the highest numeric
  release tag strictly older than `latest`, when one exists) in
  `open-dough-release-resolve.sh` and enforce the baseline rule in
  `open-dough-release-baseline.sh`: `installed == latest` verifies against
  `latest`, `installed > latest` keeps its no-downgrade refusal, an installation
  older than `previous` (or older than `latest` when no earlier tag exists)
  refuses before baseline fetch or writes naming `installed`, `previous`,
  `latest`, and `--force`, and an untagged version between `previous` and
  `latest` keeps its missing-tag refusal.
- **Keep `(Distribution\/)?src/install/` in the historical declaration reader across the transition.**
  All six maintained projects are installed at `0.3.112`, whose tagged
  `install.sh` sources `src/install/open-dough-execution-payload.sh`. Moving
  that fragment to `Distribution/src/install/open-dough-execution-payload.sh`
  and deleting `src/install/open-dough-release.sh`,
  `src/install/open-dough-register-hooks.mjs`, and `src/skills` eliminates the
  root `src/` tree; keeping `(Distribution\/)?src/install/` in
  `open-dough-payload-declaration.sh` and `open-dough-release-leftovers.sh`
  ensures updating from `0.3.112` still reads its tagged baseline and release
  history cleanly. If plan 792 lands before Slice 2 executes, `git mv` carries
  its payload-line removals cleanly.
- **Shrinking `product-backlog-story-state.mjs` clears its 250-line overrun.**
  `product-backlog-story-state.mjs` is 270 lines; removing `legacyBasesFor`,
  `scopedLegacy`, and `wholeSeedLegacy` brings it below the 250-line limit in
  place without splitting the module.
- **Pass `suffixBase` from `trunk-closure-settlement.mjs`.**
  `resumeAcceptedClosure` in
  `Distribution/src/skills/dough-story-wrap-up/scripts/trunk-closure-settlement.mjs`
  currently calls `resumeInterruptedPublication` without `suffixBase` for an
  accepted single-commit closure; pass `git rev-parse ${accepted}^` (matching
  `closurePair` in `trunk-closure-session-record.mjs`) when `suffixBase`
  becomes required across `publication-comparison.mjs`,
  `publication-resume.mjs`, and `execution-increment-resume.mjs`.
- Follow [ADR 0003, Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Follow [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) before
  editing test data or builders, and
  [`author-open-dough-skills`](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  before editing `dough-update/SKILL.md` or backlog guidance.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| Maintained installations and persisted records need none of the retired readers | Read-only audit on 2026-11-23 across `/Users/terryyin/git/{open-dough,doughnut,pygardon,terry-talks,lizard,clipboard}` and local worktrees: all 12 `.agents/skills/dough-update/VERSION` and `.claude/skills/dough-update/VERSION` files record `0.3.112`; active backlogs hold `0` shorthand entries and `0` unrecorded canonical homes; `.planning/**/*.md` holds `0` legacy story-state basis matches; `pygardon` is the only repo with historical unnumbered seed paths, both below its `SEED-20261119` counter (`next: SEED-20261120`); running `github-request-owner.mjs` processes are `0.3.112` (`protocol = 2`); and every `.git/.../open-dough/slice-clock` record carries `lastClockCommandAt`. |
| Installer and update gates pass from the baseline layout | In this preparation workspace at `2dea3a847`, `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/bash scripts/test.sh` over `Distribution/tests/installation/{update-refuses-unverifiable,update-skip-verified,update-force-restores-latest,update-removes-dropped-files,payload-declaration-links,install-preserves-open-dough-json}.sh` and `Distribution/evaluation/tests/git-publication/git-publication-fixture-identity.sh` exited `0`. |
| Backlog, request-owner, landing, publication-resume, trunk-closure, and slice-clock suites pass at baseline | In this preparation workspace at `2dea3a847`, `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --test` over the 16 backlog, story-state, request-owner, `dashboard-landing`, `publication-resume*`, `execution-increment-managed-delivery-resume`, and `slice-clock-ended-session*` suites passed 71/71 cases, `trunk-closure.test.mjs` passed 9/9 cases, and `npm run test:dashboard:backend -- --workers 1 '(start-origin-default\|agent-launch-start-session-landing-admission)\.spec\.ts$'` exited `0`. |

## Slices and outside-in proof

### 1. Ordinary update accepts the previous release and latest, and refuses older installations before writes

Type: Behavior
Status: planned

Resolve the immediately previous numeric release tag beside `latest` in
`open-dough-release-resolve.sh` and enforce the moving update baseline in
`open-dough-release-baseline.sh` and `dough-update/SKILL.md`: `installed == latest`
remains a zero-write no-op (repairing missing host hooks without payload
writes), `installed == previous` updates directly to `latest` after tagged
baseline verification, and any older recorded version stops before baseline
fetch or managed-file writes while naming the previous release and `--force`.
Keep `--force` recovery, newer-version refusal without downgrade, untagged
version refusal, and `.planning/open-dough.json` preservation unchanged. Update
the baseline setup in `update-refuses-unverifiable.sh`,
`install-all-tools.sh`, and `install-preserves-open-dough-json.sh` from `0.1.1`
to `0.1.2` (`previous` before `0.1.10`), and add the `0.1.1` older-than-previous
refusal case to `update-refuses-unverifiable.sh`.

**Proof.** `PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/bash scripts/test.sh`
over `Distribution/tests/installation/{update-refuses-unverifiable,update-skip-verified,update-force-restores-latest,update-removes-dropped-files,install-all-tools,install-preserves-open-dough-json}.sh`
passes, proving `0.1.2 -> 0.1.10` updates, `0.1.10` skips without writes,
`0.1.1` refuses without file or mtime changes, and `--force` recovers while
preserving `.planning/open-dough.json`.

### 2. The repository ships no root `src/` forwarder tree while `0.3.112` baselines still update cleanly

Type: Structure
Status: planned

`git mv src/install/open-dough-execution-payload.sh Distribution/src/install/open-dough-execution-payload.sh`
and update `install.sh`. Delete `src/install/open-dough-release.sh`,
`src/install/open-dough-register-hooks.mjs`, the `src/skills` symlink, and
`Distribution/tests/installation/update-from-pre-distribution.sh`. Simplify
`release_source_dir` in `open-dough-platform.sh` and step 5c of
`dough-update/SKILL.md` to `Distribution/src/` only, keeping
`(Distribution\/)?src/install/` in `open-dough-payload-declaration.sh` and
`open-dough-release-leftovers.sh` so a `0.3.112`-shaped previous release still
verifies. Update the 11 test and evaluation helpers (`releaseTestData.mjs`,
`assert-public-payload-install.sh`, `pin-and-inspect.sh`,
`payload-declaration-links.sh`, `dough-update-guidance-payload.sh`,
`release-fixture.bash`, `git-publication-native-fixture-identity.sh`,
`git-publication-fixture-identity.sh`, `native-identity-source.mjs`,
`native-admission-reuse-test-fixtures.mjs`, and
`delivery-evidence-amended.sh`) and prove a previous release whose tag still
holds `src/install/open-dough-execution-payload.sh` updates cleanly to `latest`.

**Proof.** `[ ! -e src ]`, `payload-declaration-links.sh`, `pin-and-inspect.sh`,
`dough-update-guidance-payload.sh`, `update-removes-dropped-files.sh`,
`install-public-payload.sh`, `git-publication-fixture-identity.sh`, and
`delivery-evidence-amended.sh` pass.

### 3. Product backlog drops `adopt --all` and `recordIdentity`

Type: Behavior
Status: planned

Delete `Distribution/src/skills/dough-product-backlog/scripts/product-backlog-adopt.mjs`
and remove its entry from `install.sh`. Remove the `adopt` command from
`product-backlog.mjs` and `product-backlog-usage.mjs`, and remove
`recordIdentity` from `product-backlog-home.mjs` (plus any guidance mention).
Delete `product-backlog-adopt.test.mjs`,
`product-backlog-adopt-refusals.test.mjs`, and
`product-backlog-adoption-fixture.mjs`. Update `product-backlog-identity.test.mjs`,
`product-backlog-merge-identity.test.mjs`, `product-backlog-refresh*.test.mjs`,
`product-backlog-refresh-fixture.mjs`, `repository-fixture.test.mjs`, and
`dashboard/backend-tests/launches/start-origin-default.spec.ts` (replacing its
`adopt --all` check with a supported read-only backlog CLI check).

**Proof.** `product-backlog.mjs adopt --all` exits non-zero as an unknown
operation; `product-backlog-payload-update.sh`, `payload-declaration-links.sh`,
the updated `Distribution/tests/support/product-backlog-*.test.mjs` and
`repository-fixture.test.mjs` suites, and `start-origin-default.spec.ts` pass.

### 4. Story state and identity evidence drop legacy basis and unnumbered-seed readers

Type: Structure
Status: planned

Remove `legacyBasesFor`, `scopedLegacy`, and `wholeSeedLegacy` from
`product-backlog-story-state.mjs` (bringing it below 250 lines), `waitingBody`
and the `dependencyFences` option from `product-backlog-story-state-basis.mjs`,
and `...earlierBases` from `normalizeAssessmentView` in
`product-backlog-story-state-assessment.mjs`. Remove `legacyDocumentHistory`
from `product-backlog-identity-history.mjs`. Update `story-state*.test.mjs`,
`start-eligibility.test.mjs`, and the `identity-evidence` tests so
`changedSinceReview` compares only against the current story-scoped basis and
numbered seed history remains covered.

**Proof.** `story-state.test.mjs`, `story-state-browser-import.test.mjs`,
`start-eligibility.test.mjs`, the `identity-evidence` unit suites, and
`npm run typecheck:dashboard` pass; `wc -l product-backlog-story-state.mjs` is
at most 250 lines.

### 5. Request owner and Dashboard landing reporting drop retired capability probes and text-archive fallbacks

Type: Behavior
Status: planned

Remove `supportsWorkflowRerun` and `workflowRerunSockets` from
`github-request-owner-endpoint-connection.mjs` and
`github-request-owner-link.mjs`, `"archive-as-text"` from
`ci-github-actions.mjs`, and `olderRequestOwnerDetail` from
`dashboard/server/ciProofArtifact.ts`. Remove `acceptsLandingWithoutIdentity`
from `dashboard-landing.mjs` and `acceptsStoryless` from
`dashboard/server/{launchReportingFiles,completionReporting,branchLandingContext}.ts`
so both story and storyless launches prepare `landing-context.json` directly
whenever the landing module is present, and remove `withOlderLandingModule`
and its retired older-module test case from `startSessionLandingContext.ts` and
`agent-launch-start-session-landing-admission.spec.ts`. Update
`dashboard-ci-proof-read.test.mjs` and `dashboard-landing.test.mjs`.

**Proof.** `dashboard-ci-proof-read.test.mjs`, `dashboard-landing.test.mjs`,
the `github-request-owner*` suites, `npm run typecheck:dashboard`, and
`agent-launch-start-session-landing-admission.spec.ts` pass.

### 6. Publication resume requires `suffixBase` and slice clock settles ended sessions from `lastClockCommandAt`

Type: Behavior
Status: planned

Require `suffixBase` in `validateRetainedComparison`
(`publication-comparison.mjs`), `resumeInterruptedPublication`
(`publication-resume.mjs`), and `resumeManagedExecutionIncrement` /
`--suffix-base` (`execution-increment-resume.mjs`), and supply `suffixBase`
(`git rev-parse ${accepted}^`) from `resumeAcceptedClosure` in
`trunk-closure-settlement.mjs`. Simplify `settleEndedSession` in
`slice-clock-slices.mjs` (and its comment in `slice-clock-record.mjs`) to use
`record.lastClockCommandAt` directly without scanning period/command timestamps
or importing `roundsOf`, removing only the two synthetic
`delete legacy.lastClockCommandAt` cases in
`slice-clock-ended-session-compatibility.test.mjs` while keeping the hook,
rename/split, and in-flight run cases.

**Proof.** `publication-resume*.test.mjs`,
`execution-increment-managed-delivery-resume*.test.mjs`,
`trunk-closure.test.mjs`, `slice-clock-ended-session.test.mjs`,
`slice-clock-ended-session-compatibility.test.mjs`, and
`execution-payload-update.sh` pass; missing `suffixBase` stops before fetch or
push.

## Verification and delivery

- Local gate follows the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Start from a fully awake machine: on AC run under `caffeinate -s -i`; on
  battery plug in, or run with the lid open under `caffeinate -i` and inspect
  `pmset -g log`. Follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run each slice's focused gates via `bash scripts/test.sh <paths>` or
  `npm run test:dashboard:backend -- --workers 1 <pattern>`, run
  `npm run typecheck:dashboard` whenever Dashboard TypeScript or shared
  imported modules change, and run the installed
  [consumer trace](../../../.claude/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  against each slice's diff.
- Apply [`dough-post-change-refactor`](../../../.claude/skills/dough-post-change-refactor/SKILL.md)
  before each slice commit.

## Plan review

Resplit CI proof `schemaVersion: 1` and `unit: "legacy"` retirement to plan 795
before readiness because its 12 collector/reader scripts, 15 Dashboard modules,
and 38 test files would push the combined plan to 10–11 slices past the
eight-slice limit. The remaining six slices each own one cohesive retirement or
policy boundary within 15 active minutes, with no sizing exception or remaining
slice-specific concern.
