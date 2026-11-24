# Use one managed install layout

**Identity:** SEED-423#use-one-managed-install-layout
**Source:** [Use one managed install layout](../../seeds/SEED-423-shrink-the-installed-distribution.md#use-one-managed-install-layout)

## Goal and scope

Maintainers deliver and verify one installation layout. It has physical
managed skill directories in `.claude/skills/` and `.agents/skills/`. Delete
what exists only for symlinked Open Dough skill directories or for a project
that holds only one root. Collapse the structure that served both layouts.
Keep the restrictions the story names: unsafe-destination and payload-safety
checks, realpath for checkout identity and platform path aliases, coexisting
project-owned skill links, and the `node_modules` link rule.

Exclusions: installed copies in this repository change through the next
release and update. The pinned `doughnut-title-precedence` evaluation case
keeps its revision. Sharing host setup, observation and completion logic is
deferred in the story.

## Current decisions

- Follow [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  the installer always writes the complete native topology.
- Delete removed behavior outright. Add no text that names the removed layout
  or says it is unsupported.
- `isDirectCliEntry` keeps its realpath fallback for platform aliases such as
  `/tmp` and `/private/tmp`. Its comment and the copy in `ci-proof-summary.mjs`
  name only that reason. `ci-direct-entry.test.mjs` and the process-level
  symlink-equivalent entry cases in `ci-mailbox-launch.test.mjs` and
  `ci-host-hook-process.test.mjs` stay: they prove that alias.
- Guidance edits under `Distribution/src/skills/` follow
  [author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md),
  including its behavior review.
- Before authoring or changing tests, apply
  [dough-makeme](../../../.agents/skills/dough-makeme/SKILL.md).

## Decisive premises and baseline

- **Only test fixtures depend on the cross-root fallback.** At `136f66c0c` a
  scratch edit made `resolveCheckoutRuntime` try only the host's root (Claude
  `.claude`, Codex and Cursor `.agents`). It ran with `node --test` over the 23
  test files that reference delivery, resume, completion recovery or
  `ci-checkout-runtime`. 86 of 91 passed. All 5 failures were "CI runtime is
  missing from selected checkout (tried …)". They came from
  `execution-increment-managed-delivery-test-fixtures.mjs`, which deploys only
  `.agents` (`platforms = [".agents"]`) while hosts vary. The failing files
  were `execution-increment-managed-delivery.test.mjs` (2),
  `story-branch-session-record.test.mjs` (2) and
  `trunk-closure-session-record-contributions.test.mjs` (1). Without the
  edit, those three files pass 8/8. The scratch edit was reverted.
- **Client trunks hold both physical roots.** On 2026-11-24, `git ls-tree` of
  each production-dashboard project's fetched trunk showed 22
  `dough*` directories in each root. There were no `120000` entries under
  Open Dough-managed skill paths in Open Dough, Doughnut, Pygardon, Terry
  Talks, Lizard or Clipboard.
- **The symlinked-skill fixture has three plain consumers.**
  `ci-github-test-fixtures.mjs:155` and
  `ci-command-adapter-unavailable.test.mjs:195` use only the real path
  returned by `installLinkedSkills`. `ci-command-adapter-cli.test.mjs` uses the
  linked path only in its symlink-equivalent case. `agent-commit.test.mjs` uses
  it only in its symlinked-directory case.
- **The installer outcome text has one assertion.** "both physical
  installations are current" is printed three times by
  `open-dough-release-apply.sh` and asserted only by
  `update-skip-verified.sh:103`. No evaluation or Dashboard fixture holds it.
  At `136f66c0c`, with the scratch text "both installations", running
  `scripts/test.sh Distribution/tests/installation/update-skip-verified.sh`
  under Homebrew bash failed at line 103 only. The scratch edit was reverted.

## Ordered slices

### 1. Scripts are proven through the installed layout alone

Type: Structure
Status: done
Proof: `scripts/test.sh` over the changed and consumer test files below.

Delete `symlinked-skill-entry.test.mjs` and `symlinked-skill-test-fixtures.mjs`.
Delete the symlinked-directory case in `agent-commit.test.mjs` and the
`entry` parameter in `agent-commit-test-fixtures.mjs` that served it. Delete
the symlink-equivalent case in `ci-command-adapter-cli.test.mjs` and its
`entryPath` parameter. Give `ci-github-test-fixtures.mjs` and
`ci-command-adapter-unavailable.test.mjs` a plain copy of the skills they
need. Reuse an existing deploy helper such as `deploySkill` when it fits.
Reword the two direct-entry comments to name the platform alias only.

Run `agent-commit`, `ci-command-adapter-cli`, `ci-command-adapter-unavailable`,
every consumer of `ci-github-test-fixtures.mjs`, `ci-direct-entry`,
`ci-mailbox-launch` and `ci-host-hook-process`. Finish with
`git grep -n -i 'symlinked skill\|installLinkedSkills\|linkedSkills' -- Distribution`
returning nothing.

Enables slice 2's single-root fixtures with no symlink helper left to update.

### 2. The CI runtime runs from the invoking host's own root

Type: Behavior
Status: done
Proof: managed-delivery and resolution tests, plus the three files the
premise names.

Behavior: a checkout with both roots → a Claude delivery, resume or completion
recovery resolves → it runs from `.claude/skills/dough-execute-plan`. Codex and
Cursor resolve to `.agents/skills/dough-execute-plan`. A checkout without the
host's root → resolution refuses and names the one path it tried.

Replace the root order and cross-root fallback in `ci-checkout-runtime.mjs`
with the host's root. Rename `alias` in the result and in its readers, for
example to `root`. Keep `requireSelectedRuntimeEntrypoint` for checkout
identity. Make the managed-delivery fixture deploy the roots its hosts use.
Update the managed-delivery assertion so Claude resolves to `.claude`. Add the
refusal case at the narrowest resolution entry. Run the 23 files from the
premise and `ci-deployment-layout.test.mjs`.

### 3. Installation text describes the one layout

Type: Behavior
Status: done
Proof: `scripts/test.sh Distribution/tests/installation/update-skip-verified.sh`
plus the Distribution Markdown/link checks the delivery gate runs.

Behavior: an ordinary update that finds both roots current → prints
"Outcome: both installations are current; …". The other two outcome lines
read the same way.

Drop "physical" where it contrasts with a linked root. That covers
`open-dough-release-apply.sh` and its assertion, `dough-update/SKILL.md`,
`docs/installation-and-updates.md`, `README.md`, and the comments in
`install-all-tools.sh`, `install-refuses-unsafe-topology.sh` and
`install-reports-real-copy-failure.sh`. Unrelated uses of the word stay,
such as `fixture-cache.bash` and the retrospective "physical lines". Check
the installation tests that read those outcomes.

## Concern evidence

Refinement was not needed. The three slices are small and independent. The
evidence finds no concern specific to any slice. Slice 2 is the only
behavior change, and the scratch run already shows who consumes it.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for multi-file runs. Keep the default
  timeout and apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run focused proof through `scripts/test.sh <files>` for each slice. This
  change touches shared Distribution test fixtures, so run the full
  Distribution suite once before landing, with Homebrew bash 5. Hosted CI
  remains the final gate.

## Execution resume

Anri-chan started in the linked worktree on
`codex/use-one-managed-install-layout` in Story Branch Mode. The starting
revision was `7697cb8426d39b3776496fad4af64bad730682f3`. The Take
`1317e54a8d0ddc25285ad06b33af4817b0357902` was published to `origin/main` and
the execution branch. The branch accepted slice 1 at
`d83686b7a51da460c16aaff9fd3241bd7baf9da3`.

The slice 1 removal search had zero matches. The
38-path focused run timed out in `github-request-owner-unresponsive.test.mjs`
after the replacement owner appeared, while waiting for both clients' held
requests. Four diagnostic runs passed. The targeted timing experiment showed
that a client still greeting the suspended owner can reach the replacement.
The requested retry ran six isolated instances concurrently with the original
client launch order. All six recorded both requests and two HTTP 200 replies
from the replacement owner. The developer explicitly approved a one-time
exception for the original timeout so slice 1 could be delivered. Its cause
remains unknown. Temporary instrumentation was removed. Resolve the
worktree evidence directory with `git rev-parse --git-path open-dough/evidence`.
Its `slice1-return.md` records the commands, original failure and traces.

Slice 2 landed on the story branch at `534470b8d1f9ebebfd4bbd6ebbe0f561919a9a5e`.
Focused verification covered 75 Distribution files. Two auto-land
files found that their fixture excluded only one installed root from status.
Both passed after the fixture excluded both roots. The other 73 files did
not use that exclusion and retain their passing results. `slice2-return.md`
records the proof and host-specific observations. `slice2-refactor-return.md`
records twelve passing checks after refactoring.

Slice 3's six focused checks and separate no-hook-fragments apply passed.
The refactored output paths passed the update and no-hook-fragments checks
again. See `slice3-return.md` and `slice3-refactor-return.md`.

Codex observes `ci.yml` for the story branch through coordinator
`anri-460afa7c` at `/tmp/dough-ci-501/watch-wRJJiC` (PID 30474). The earlier
observer stopped with zero unread events before this one started.

The implementation tip `8d3306fd9bc98246daa01a0a2e1d496b31ed3ce3` passed
hosted CI in run `45386987704`. The first local full Distribution run passed
647 checks and timed out in three native comparison baseline files at their
180-second safety deadlines. An AC-powered two-job diagnostic on the same
tip passed all three in 44.5 to 98.9 seconds. The full two-job rerun passed
all 650 checks in 31 minutes and 20 seconds on clean revision
`bc4eb59c7229c1dbc105c4a935e7b1d45587a15e`, with Homebrew Bash and the macOS
guard on AC. The three baseline files passed in 60.6 to 109.1 seconds.
The same revision's branch CI passed in run `45393890131`, and its observer
shutdown was confirmed with zero unread events.

Intent coverage restored the missing-Claude cross-root fallback in scratch.
The maintained missing-root assertion caught it. The original bytes and
passing result were restored. No follow-up is needed for that promise.

## Execution complete

Product advice: Keep the existing priorities. The runtime selection and
installation proof support the agreed topology, with no product correction.
