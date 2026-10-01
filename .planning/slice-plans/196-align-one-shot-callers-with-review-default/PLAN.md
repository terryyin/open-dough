# Align one-shot callers and starts with the review default

## Source and provenance

- Identity: SEED-066#align-one-shot-callers-with-review-default.
- Story: [bounded correction](../../seeds/SEED-066-composable-lightweight-session-options.md#align-one-shot-callers-with-review-default).
- Reviewed execution: SEED-066#composable-lightweight-session-options through plan 191 (`97096c95:.planning/slice-plans/191-composable-lightweight-session-options/PLAN.md`), commits `ef745cb5..84e2db7f` on branch
  `claude/choose-workspace-and-automatic-landing-independe`.
- Prepared by the execution retrospective's delegated planner in the supplied execution checkout `/Users/terryyin/git/open-dough/.worktrees/choose-workspace-and-automatic-landing-independe` (integration checkout
  `/Users/terryyin/git/open-dough`, remote `origin`, trunk `main`). Planning only: not queued, not Taken, no execution or publication authority.

## Execution context

- Established identity: SEED-066#align-one-shot-callers-with-review-default; publisher `dashboard-mac.lan-open-dough`, assigned agent `mike.li-chan`.
- Mode: story-branch. Owned execution checkout: `/Users/terryyin/git/open-dough/.worktrees/align-one-shot-callers-and-starts-with-the-revie`; branch `codex/align-one-shot-callers-and-starts-with-the-revie`.
- Originating/default integration checkout: `/Users/terryyin/git/open-dough`; it is not the implementation checkout. Remote `origin`, trunk `main`; increments target the recorded remote execution branch.
- Established claim/candidate `2ce1c3b2469e35673b4b3d61e228d9e941466c7b` confirmed on both remote main and execution branch; starting revision `54987db4dc7368dda4f4773e9caa7b9d9d4c92ab`.
- Checkout setup: `PATH=/opt/homebrew/bin:$PATH npm ci` and `PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard` passed on the current locked dependency state. Hook: `.githooks/pre-commit`, check-only staged lint;
  coordinator formatting: `npm run format`.
- No numeric slice budget supplied; no explicit replanning override.
- CI: GitHub Actions `ci.yml` (push workflow selector verified), repository `terryyin/open-dough`, execution branch above. Root coordinator's Codex yielded observer: cell 14, PTY 82933, PID 52346,
  `/tmp/dough-ci-501/watch-JOgwzs`. Claim on trunk remains unobserved by this branch observer; managed increment delivery reuses this observer.

## Goal and scope

One-shot callers, the review report, start refusals, and session-policy rules agree with plan 191's review default. A kept one-shot execution result is landed through the workflow path that applies its ownership recheck
and CI observation. A tracked, admitted, or carried start never treats the repository's main worktree as its owned workspace. The rule "default main and automatic landing need one-shot tracking" and the detection of an
established one-shot context each have one home.

Excluded:

- Any Dough Land change. Editing `src/skills/dough-land/SKILL.md` changes the native evidence identity of every closing journey (`git_publication_closing_input_hash_lines`, `tests/native-evidence-identity.sh`
  `land_inputs`), which this narrow routing gap does not justify. The review report names the guarded landing path instead (slice 1). A Dough Land sentence that defers kept one-shot execution results stays a human
  decision.
- Removing the inline receipt-to-established mapping in `tests/support/git-publication-native-one-shot-established.sh`. Sharing it needs the installed formatter `established-start.mjs` (read by native sessions) to accept
  a start receipt, or the shell harness to import dashboard TypeScript. That changes an installed runtime contract, so it is not a bounded test cleanup.
- New native cases, hosts, refusals for retained-claim resume, and dashboard launch changes beyond the shared policy rule.

## Current findings (rechecked at `84e2db7f`)

1. **Callers still describe automatic publication.** `src/skills/dough-bug-fixing/SKILL.md:222-224` (**Repaired**) says "One-shot delivery reached trunk and ends with its retirement". A one-shot repair now stops with its
verified result kept for review unless landing was requested or `--auto-land` was selected. `src/skills/dough-product-backlog/references/record-preparation.md:199-200` says one-shot execution "starts on fetched remote
trunk without a claim", which is false under `--default-main`. A sweep of the other `src/skills/**/*.md` one-shot mentions found no further stale claims. 2. **A kept result's report does not name its guarded landing
path.** `one-shot.md` "Verify and retain the result" says nothing is pushed "until the developer asks to land the result" but does not say where to ask. Dough Land (`dough-land/SKILL.md`) has no one-shot awareness: it
registers no CI observer ("Nothing is registered with a CI observer") and applies no `--one-shot-identity` check, which "Complete a queued story in the same commit" requires for a queued closure. One-shot refinement
already passes its `preparation-assignment.mjs recheck` to Dough Land (`one-shot-refinement.md:146-151`), so only execution results are exposed. 3. **Starts accept the main worktree as an owned workspace.**
`execution-start-request.mjs` `ownedWorkspaceRequest` refuses only `integration === workspace`, so it accepts any existing `--workspace` when `--integration` is omitted. `execution-start-operation.mjs:78` runs
`parkCarriedEdits` (`reset --hard`, `clean -fdq`) before `selectOwnedWorkspace`, which fast-forwards and reuses an existing workspace. `one-shot.md` "Escalate when the work grows" already says escalation "carries edits
only out of an owned workspace". No code enforces that. 4. **One rule, three copies; one detection, two forms.** The rule that `--default-main`/`--auto-land` need one-shot tracking is written in
`execution-start-request.mjs:57-66`, `preparation-assignment-request.mjs:24-37` and `dashboard/server/launchSessionPolicy.ts:58-65`. `dashboard/src/launchRequest.ts:51-55` hard-codes `defaultSessionPolicy` instead of
deriving it from `sessionPolicy({})`. An established one-shot context is detected as `"tracking" in establishedFacts(...)` (`dashboard/server/startWorkflows.ts:66`) and `!("tracking" in kept.preparation)`
(`dashboard/server/preparationStart.ts:183`), beside a requested policy check `policy.tracking === "one-shot"` (`startWorkflows.ts:55`). 5. **Parallel queued one-shot fixtures.** In
`src/skills/dough-execute-plan/scripts/`, `lightweight-auto-land-test-fixtures.mjs` repeats `one-shot-queued-test-fixtures.mjs`: `startAutoLand` is `startQueuedOneShot` plus `--auto-land`, `autoLandDelivery` is
`queuedDelivery` plus an info/exclude entry, and `deliverFrom` is `deliverQueued` with a session and an optional guard. Consumers: `lightweight-auto-land.test.mjs`, `lightweight-auto-land-default-checkout.test.mjs`,
`one-shot-queued.test.mjs`, `one-shot-queued-races.test.mjs`, `one-shot-escalation-queued.test.mjs`, and `tests/support/git-publication-native-one-shot-fixture.mjs` (native harness fixture, a publication evidence
identity input).

## Preserved promises and constraints

Every plan 191 promise stays as it is:

- isolation + review is the one-shot default, with no advance push authority;
- `--auto-land` is advance publication authority after verification and resolved decisions;
- `--default-main` takes the default checkout as is, with no clean-main gate in skills;
- dashboard existing-change confirmation is independent of landing;
- refinement is one-shot without an assignment;
- the native acceptance recorded in plan 191 slice 8 still holds.

Refusal statuses keep their meaning: execution and preparation use `invalid-request`, the dashboard uses HTTP 400 `RefusedRequest`. Wording may unify. Follow AGENTS.md: edit `src/skills/` only, with no installed copies
and no release identity. ADR 0005 governs native evidence and ADR 0006 governs the runtime audience. The paid-test rule applies: native host runs are manual-only, and the plan records literal commands for them rather
than adding automated cases.

## Decisive premises and observations

| Premise / consumer | Literal observation | Result |
| --- | --- | --- |
| Main-worktree starts are accepted today (slice 2) | Throwaway script `/tmp/probe196/probe2.mjs` on `createQueuedTrunk()` fixtures with `startCliResult(trunk, "trunk", extra, { workspace: trunk.integration, branch: "main", integration: null })`: (a) tracked Take of `SEED-A#a` on a clean main worktree, (b) `--admit --identity SEED-B#b --link seeds/B.md#b --title "Story B" --carry` on the main worktree with a modified tracked file and an untracked file | (a) `published`: origin gained "Take queued work: SEED-A#a" and the main worktree's HEAD moved. (b) `published` with `carried: {restored: true}`: origin gained "Admit accepted work: SEED-B#b". The main worktree was reset, cleaned, then restored. A dirty tracked start without carry stopped `setup-failed` at fast-forward. The gap is real. The carry restored here, but a `carry-conflict` would leave the main worktree reset with the edits only under `refs/dough/carried/main`. |
| No legitimate consumer starts owned work in a main worktree (slice 2) | `rg 'execution-start.mjs\|preparation-assignment.mjs' tests dashboard/server`, then reading `--workspace`/`--integration` in `native-agent-one-shot-escalation.sh`, `git-publication-native-startup-fixture.sh`, `native-agent-admission.sh`, and `dashboard/server/executionStart.ts`; `rg 'integration: null'` in tests | Native harnesses pass separate `--integration` and `--workspace`. The `integration: null` tests (`workspace-publication-admission.test.mjs`, `preparation-assignment-owned-context.test.mjs`) use `ownedWorktreeOnly`, a linked worktree of a bare repository, where git-dir ≠ common-dir. `--default-main` tests use `defaultCheckoutRequest` instead of `selectOwnedWorkspace`. |
| One selector serves all owned starts (slice 2) | `rg 'selectOwnedWorkspace\|selectAtFetchedTrunk' src/skills` | `execution-start-operation.mjs:81`, `execution-start-source.mjs:51`, and preparation's `selectAtFetchedTrunk` (assigned and one-shot) all call `selectOwnedWorkspace`. The carry park at `execution-start-operation.mjs:78` precedes it. |
| Guidance tests forbid "deliver" in the retain section (slice 1) | Read `one-shot-guidance.test.mjs` | `assert.doesNotMatch(retain, /increment publication\|deliver/i)`. The new report wording must name the landing path by link or words without "deliver", or the assertion must change deliberately. |
| Changed guidance and code are native evidence identity inputs (proof decision) | Read `tests/support/git-publication-native-evidence.sh:55-79`, `git-publication-native-shared.sh:85-97`, and `tests/native-evidence-identity.sh:112-118` | `one-shot.md` and the `execution-start.mjs` import closure (including `session-policy.mjs` and `workspace-publication-select.mjs`) belong to the publication identity. `dough-land/SKILL.md` belongs to every closing identity. `dough-bug-fixing/SKILL.md` and `record-preparation.md` belong to none. |
| Browser and TypeScript can share `session-policy.mjs` (slice 3) | Read `dashboard/src/launchRequest.ts:1-12` and `session-policy.test.mjs` ("the module imports nothing, so a browser can share it") | It is already imported by browser code for `sessionPolicyChoices`/`sessionPolicyFlags`. `sessionPolicy()` returns `Object.fromEntries` output, so a JSDoc return type may be needed. `npm run typecheck:dashboard` settles it. |
| Refusal wording consumers (slice 3) | `rg 'applies to one-shot\|apply to one-shot\|apply only to start'` across `src dashboard tests` | `one-shot-start-refusal.test.mjs:60` (`/--auto-land applies to one-shot work/`), `default-checkout-session-refusal.test.mjs` (`/--default-main/`), and `dashboard/tests/agent-launch-session-refusal.spec.ts:90` (exact dashboard sentence). No test pins preparation's wording. |
| Baseline green | `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-execute-plan/scripts/session-policy.test.mjs src/skills/dough-execute-plan/scripts/one-shot-start-refusal.test.mjs src/skills/dough-execute-plan/scripts/default-checkout-session-refusal.test.mjs src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs` | 19 pass at `84e2db7f`. |
| Plan number | `git log --all --format= --name-only -- .planning/slice-plans` (highest 195) and every `git worktree list` checkout | 196 is unused. |

## Promise and proof ownership

| Correction promise | Slice | Observable proof |
| --- | --- | --- |
| Bug fixing reports a one-shot repair as kept for review unless landing was requested or selected | 1 | Guidance assertion on the **Repaired** item |
| Record-preparation names the default checkout as a one-shot start location | 1 | Guidance assertion |
| The review report names the guarded landing request for that workspace | 1 | Guidance assertion in "Verify and retain the result"; behavior walk |
| Tracked, admitted, carried, and isolated one-shot starts refuse the main worktree before any change | 2 | Real-Git CLI test: a start snapshot that stays unchanged, no `refs/dough/carried/*`, unchanged origin refs |
| Linked and bare-repository owned worktrees and `--default-main` keep working | 2 | Existing owned-context, escalation, and default-checkout suites |
| One-shot-only choice rule and default policy have one home; refusal statuses unchanged | 3 | `session-policy.test.mjs` contract plus existing refusal tests and dashboard refusal spec |
| One established one-shot detection | 3 | Existing launch/kept-start specs; `typecheck:dashboard` |
| One queued one-shot start/delivery fixture | 4 | Consumer suites and credential-free native one-shot suite |

## Ordered slices

No numeric slice target or hard limit is supplied. Each slice is independently deliverable and leaves its proof green. Slices 2–4 do not depend on slice 1. Slice 4 is the most optional: drop it if it grows past
test-support consolidation.

### 1. Kept one-shot results name their guarded landing path
Type: Behavior
Status: done
Proof: Extend `src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs` in its existing `markdownSection` style:

- **Bug fixing:** the **Repaired** item in `dough-bug-fixing/SKILL.md` no longer states that one-shot delivery always reached trunk. It names the retained-for-review outcome and reserves retirement for a landed result.
- **Record-preparation:** the one-shot sentence names the default checkout besides fetched remote trunk.
- **Review report:** the "Verify and retain the result" report names the landing request: ask this workflow to land the kept workspace, linking `#land-the-retained-result`. The existing `doesNotMatch(/increment
  publication|deliver/i)` assertion stays satisfied.

Then run, with `PATH=/opt/homebrew/bin:$PATH`: `node --test src/skills/dough-execute-plan/scripts/one-shot-guidance.test.mjs src/skills/dough-story-refinement/scripts/dough-land-guidance.test.mjs
src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`, `bash tests/payload-declaration-links.sh`, `bash
tests/git-publication-native-one-shot.sh`, and `bash tests/native-evidence-identity.sh`. Those last two are credential-free, and `one-shot.md` is a publication identity input.

Behavior: A developer who reaches a kept one-shot execution result (or a bug repair made one-shot) reads a report naming the workspace and how to have it landed through this workflow, which applies the queued story's
`--one-shot-identity` recheck and CI observation. Bug-fixing and record-preparation callers describe the review default and the default-checkout location truthfully.

Walk one representative use under AGENTS.md "Behavior review": a one-shot bug repair on a queued story stops for review, and the report names the landing request. Keep wording in the executing agent's perspective (ADR
0006). Explicit request routing in Dough Land is excluded (see Goal and scope).

### 2. Owned and tracked starts refuse the repository's main worktree
Type: Behavior
Status: planned
Proof: Add a real-Git CLI test, beside `default-checkout-session-refusal.test.mjs` and reusing its `snapshot` and `createQueuedTrunk` fixtures, through `startCliResult(..., { workspace: trunk.integration, branch: "main",
integration: null })`. It covers:

- a tracked queued Take on a clean main worktree;
- `--admit ... --carry` with only uncommitted tracked and untracked edits, which is accepted today per the probe above;
- `--one-shot` without `--default-main`;
- an assigned preparation start through the preparation CLI fixture (`one-shot-refinement-test-fixtures.mjs` `start`).

Each attempt refuses with a stop that names the main worktree and the separate-owned-workspace requirement, before any fetch-dependent mutation. The snapshot stays deep-equal: HEAD, index, status, file bytes, branches,
worktrees, and origin refs. No `refs/dough/carried/*` exists. Write the test before the fix. The execution cases must fail (red) as the probe predicts. The preparation case was not probed, so record whichever result it
gives before the fix. Regression: `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/default-checkout-session*.test.mjs src/skills/dough-execute-plan/scripts/one-shot*.test.mjs
src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment*.test.mjs src/skills/dough-story-refinement/scripts/one-shot-refinement*.test.mjs`
plus credential-free `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native-one-shot.sh`.

Behavior: A start that would claim, admit, carry, or isolate work in an existing checkout whose Git directory is the repository's common directory (its main worktree) stops and leaves it untouched. Linked worktrees,
including those of a bare repository, and `--one-shot --default-main` keep working.

Use one shared predicate (rev-parse `--absolute-git-dir` versus `--git-common-dir`) in `workspace-publication-select.mjs`. Apply it to an existing workspace in `selectOwnedWorkspace`, and in the execution start before
`parkCarriedEdits`, so no reset or clean can run first. Execution reports `invalid-request`, the existing meaning of "queued work requires a separate owned workspace". Preparation keeps its existing selection-stop
mapping. Do not refuse a retained-claim resume (`verifyRetained`): this correction does not touch it.

### 3. One home for one-shot-only choices and one-shot context detection
Type: Structure
Status: planned
Proof: Add a `session-policy.test.mjs` contract test for the new pure helper: standard tracking with `default-checkout` and/or `auto-land` reports exactly those choices, and one-shot or the default policy reports none.
Then run `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/session-policy.test.mjs src/skills/dough-execute-plan/scripts/one-shot-start-refusal.test.mjs
src/skills/dough-execute-plan/scripts/default-checkout-session-refusal.test.mjs src/skills/dough-story-refinement/scripts/*.test.mjs`, `npm run typecheck:dashboard`, and `env -u FORCE_COLOR -u NO_COLOR npx playwright
test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-session-refusal.spec.ts dashboard/tests/agent-launch-session-options.spec.ts dashboard/tests/agent-launch-session-kept-start.spec.ts
dashboard/tests/agent-launch-preparation-start.spec.ts dashboard/tests/agent-launch-preparation-resume.spec.ts --workers=2`. Refusal statuses stay as they are. Update a pinned message only if wording is deliberately
unified.

Correction: Add one pure, browser-importable helper to `src/skills/dough-execute-plan/scripts/session-policy.mjs` that names the non-default choices requiring one-shot tracking. `execution-start-request.mjs`,
`preparation-assignment-request.mjs` (its "apply only to start" check stays workflow-specific), and `dashboard/server/launchSessionPolicy.ts` consume it and phrase it in their own vocabulary: flags via
`sessionPolicyChoices`, dashboard labels via `sessionPolicyWords`. Derive `defaultSessionPolicy` in `dashboard/src/launchRequest.ts` from `sessionPolicy({})`, adding a JSDoc return type if TypeScript needs it. Name one
established one-shot predicate beside `assignedAgent` in `dashboard/src/launchRecord.ts`, and use it in `startWorkflows.ts:66` and `preparationStart.ts:183`. The requested-policy check at `startWorkflows.ts:55` keeps
reading the policy.

This removes a duplicated domain rule that could drift between CLI and dashboard. External behavior stays the same. `session-policy.mjs` is already installed, and no new installed file is added. Run `bash
tests/payload-declaration-links.sh` only if an import changes.

### 4. One queued one-shot start and delivery fixture
Type: Structure
Status: planned
Proof: The consumer suites stay green with unchanged assertions: `node --test --test-timeout=600000 src/skills/dough-execute-plan/scripts/lightweight-auto-land*.test.mjs
src/skills/dough-execute-plan/scripts/one-shot-queued*.test.mjs src/skills/dough-execute-plan/scripts/one-shot-escalation-queued.test.mjs`. Also run credential-free `PATH=/opt/homebrew/bin:$PATH bash
tests/git-publication-native-one-shot.sh` and `bash tests/native-evidence-identity.sh`, because `tests/support/git-publication-native-one-shot-fixture.mjs` imports the queued fixtures.

Correction: Fold `startAutoLand`, `autoLandDelivery`, and `deliverFrom` into the `one-shot-queued-test-fixtures.mjs` helpers, using options for extra start flags, the info/exclude installation, the session, and the
optional guard. Delete the duplicates, or the whole `lightweight-auto-land-test-fixtures.mjs` if `assertTrunkObserved`/`fetchedMergeBase` move with them. This removes parallel test-support paths that already drifted
(host session versus none). Test-only: no product behavior changes.

### 5. Retry the paid native runs that failed in plan 191
Type: Behavior
Status: planned
Proof (manual, developer-authorized paid runs only; never automated): after slices 1–4 are delivered, rerun the two plan 191 slice 8 cases that first failed and were accepted only by re-judging saved results under the
updated landing assessor, never by a fresh run: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case publication/one-shot-auto-land --results-dir <DIR>` and
`PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case publication/one-shot-queued --results-dir <DIR>`. Launch them through one detached script with a log, as the plan 191 batch did.
Record host version, candidate, verdict, and the decisive observations (`ci-observed-shas`, `ci-unobserved-shas`, `report-names-kept`, workspace retention) in this plan.

Behavior: Each case passes FRESH PROOF on the delivered candidate. A kept workspace passes only with its CI unobserved and reported. A failure is diagnosed under failed-proof handling; a host-side failure such as plan
191's Codex spawn error is reported as inconclusive and rerun once only after its stated cause is addressed.

## Native proof decision

Beyond slice 5's developer-requested retry, no paid native rerun is required for this correction. Reuse plan 191 slice 8 evidence (candidates `0d565a9e`/`671b8ff4`) with this justification:

- Slice 1 adds report wording that names an already-accepted landing path. It changes no start, retention, or landing command, so the native assessors' state checks are unaffected. Plan 191's probe already observed
  agents naming the later landing request. The bug-fixing and record-preparation edits belong to no native evidence identity.
- Slices 2–4 change installed runtime in the `execution-start.mjs` import closure, or the native harness's test fixture, which changes the publication evidence identity. They change no behavior a native case exercises:
  no case starts in a main worktree, the policy refactor preserves refusals, and the fixture change is test support covered by credential-free substitutes.

Optional, manual-only confirmation of the slice 1 report wording, at the developer's discretion before release: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case
publication/one-shot-review --results-dir <DIR>` and `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native claude --case publication/one-shot-queued --results-dir <DIR>`. Never add these to an
automated suite.

## Verification and delivery

Local gates are the focused commands above. Hosted CI runs the rest after publication, and its failures stay owned. Execution keeps dough-execute-plan's post-change refactor, commit, publication, and asynchronous CI
repair. Do not change release identity or installed copies.

## Construction review

There are four independent outcomes or corrections, each with one proof loop:

- guidance (1);
- start-safety refusal with real-Git proof (2);
- shared-rule consolidation proved by existing boundaries (3);
- test-fixture consolidation (4).

Slices 3 and 4 are Structure slices that directly own evidenced weaknesses and prepare nothing speculative. Slice 2 extends the existing owned-workspace selection model with one predicate rather than adding per-command
handlers. The decisive premises were observed above, including a reproducing probe for slice 2.

No slice-boundary, proof, architecture, or sizing concern remains in this review. The excluded Dough Land routing remains a human decision, not a blocker. This plan grants no execution or queue authority.

## Accepted execution evidence

- Slice 1: all four literal proof commands above passed (focused Node: 15 tests; payload links, credential-free native one-shot, native evidence identity: exit 0). Inspected guidance assertions observe retained review, conditional retirement, both start locations, and the guarded workflow landing request. Representative queued bug-repair walk reaches that request and its existing ownership/CI path.
- Independent refactor compacted three guidance files to 250 lines without behavioral changes; affected one-shot guidance assertions passed (8 tests), whitespace check passed, and unchanged implementation/harness proof remains reusable. Coordinator formatting passed. Plan prose reflow preserves every promise and proof obligation; readiness was not renewed.
