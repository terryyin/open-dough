---
id: SEED-423
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a dead-code and simplification audit of the Distribution scripts
trigger_when: selected from the product backlog
scope: twelve stories
---

# SEED-423 — Shrink the installed distribution to code that serves a purpose

## Why this matters

A developer who installs or updates Open Dough receives everything under
`Distribution/src/`, and every agent working in that project can find, read
and run it. On 2026-11-22 that was 414 files: 282 `.mjs` scripts, 111 guidance
files, 12 shell files and 9 assets. A script earns its place when guidance, a
hook, the installer, the Dashboard or a maintained repository script reaches
it. Its own unit tests do not count.

The audit built the import graph of all 282 scripts, listed every export with
no caller outside tests, and read each script area against the guidance that
invokes it. The first pass removed the unambiguous cases and left 412 files
and 280 scripts. The findings below are what remains. Line counts are
estimates from that reading at `8a9643c0f`.

## Alternatives and decision

Remove code by purpose, not by file count: merging files to pass a count
leaves the same code installed. The strongest simpler alternative is to stop
after the first story, which removes everything already shown to be unreached
and needs no product decision. The later stories each remove a capability or
replace a mechanism, so each needs either a decision about who still uses it
or a measured comparison.

Effort bands are relative. S is one script area with its tests. M crosses
script areas or changes guidance agents follow. L changes a mechanism the
Dashboard and installed scripts share.

## Story decomposition

<a id="remove-unreached-distribution-code"></a>

### Install only scripts that guidance, hooks or the Dashboard reach

**Identity:** SEED-423#remove-unreached-distribution-code

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer installing Open Dough receives no script,
  command, flag or export that only tests exercise, and maintainers stop
  paying to keep such code passing.
- **Evaluation.** Each item below is gone or moved beside the tests that use
  it, the payload lists name no removed file, and the repository suites pass.
  Rerunning the reachability and unused-export scan finds no installed module
  or export whose only users are tests.
- **Findings to remove or move.**
  - Test and evaluation support living under `dough-execute-plan/scripts/`:
    `execution-worktree-preparation-assessor.mjs`,
    `execution-worktree-preparation-project.mjs` and
    `one-shot-queued-repository.mjs` (506 lines, not shipped), and the
    shipped `execution-worktree-preparation-readiness-gate.mjs`, which no
    guidance or script calls. The one-shot fixture's bytes feed
    `git-publication-fixture-identity.sh`, so moving it changes that recorded
    fixture identity.
  - `watch-ci.mjs`: a command wrapper no guidance invokes. Production calls
    `watchCiExecution` directly. Twelve tests import or spawn the wrapper.
  - Exports only tests use: `deliverCiEvents`, `deliverHostBoundary`,
    `standaloneSessionWorkflow`, `configureDeclaredAgentAuthorship`, the
    seven re-exports of the `ci-mailbox.mjs` barrel, the re-export blocks of
    `ci-background-handoff.mjs`, `ci-background-hook.mjs` and the three
    backlog Git adapter commands, and about fifty `export` keywords on
    symbols used only in their own file.
  - `dough-makeme/scripts/select-makeme.mjs` and `changed-makeme.mjs` with
    `selectMakeMeEntries`: `test-entry-rules.mjs --source` and `--changed`
    replaced them, and no guidance names them. Their tests and the MakeMe
    evaluation cases still assert the old commands. Once they go, no
    installed file imports `intent-location-selection.mjs`,
    `intent-location-settings.mjs`, `repository-path.mjs`,
    `minimatch.bundle.mjs` or `minimatch.LICENSE.md`; the Dashboard and the
    bundle build still use them, so they move out of the installed skill.
  - The `merge` verb of `product-backlog.mjs` with `reportMerge`; only the
    merge test fixture runs it. `mergeBacklogs` then takes text instead of
    paths, which removes the temporary files in `git-candidate.mjs` and
    `git-aggregate.mjs`.
  - Flags and parameters no guidance or caller passes: `--preferred-alias`,
    `--max-duration-ms` on `deliver` and `complete`, `consumer-trace.mjs
    --path`, `story-obligations record --commitment-field`, `slice-clock.mjs
    status --identity`, the `[BUDGET_MS]` positional and the single-valued
    `--execution` mode with its `request.mode` checks, `wait-for-publication
    --interval-seconds`, `ci-proof-leads.mjs --repository`, and the
    `register` and `beforeRetryPush` hooks only tests set.
  - The published-identity obligation in `publication-resume.mjs` and
    `publication-resume-support.mjs`: every caller passes a throwaway list,
    so the `register` branch is unreachable and
    `execution-increment-resume.mjs` registers the SHA itself. Trim the
    matching sentence in `publish-the-candidate.md`.
  - Installer commands only tests call: `open-dough-release.sh compare`,
    `destination`, `resolve-url`, `fetch-release`, `pin-latest`, and the
    `copy` mode of `open-dough-payload-bytes.mjs`.
  - Repeated helpers: the kebab-to-camel argument loop written seven times
    beside `flagValues`; `isAncestor` three times; `stopped` twice;
    `argumentsOf` in `ci-repair-stash.mjs`; `processInfo` in
    `ci-background-session.mjs`. Three `ci-reuse-*` scripts test direct entry
    with the raw `import.meta.url` comparison that `isDirectCliEntry` exists
    to replace, which fails through a symlinked skill directory.
- **Effort hypothesis.** M, high confidence: about 1,500 lines, many small
  removals whose tests move or go with them.
- **Depends on.** None.
- **Safe stopping point.** Each group is independent; any subset leaves a
  working, smaller installation.

<a id="install-without-ci-reuse-recipes"></a>

### Install without the CI reuse recipes

**Identity:** SEED-423#install-without-ci-reuse-recipes

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer installing Open Dough receives no opt-in CI
  recipe that no project runs.
- **Evaluation.** `ci-reuse-custom-example.mjs`, `ci-reuse-github.mjs`,
  `ci-reuse-policy.mjs`, `ci-reuse-github-command.mjs`, `ci-reuse-gate.mjs`
  and the manuals `reuse-ci.md` and `custom-reuse-ci.md` are gone, about 850
  lines, and no guidance links to them.
- **Value / learning.** The only callers are the two manuals; this
  repository's workflows use none of them and the example is a toy provider.
- **Effort hypothesis.** S, high confidence once the decision is made.
- **Depends on.** The open decision on whether any project adopted CI reuse.
- **Safe stopping point.** Removing only the custom example and its manual
  keeps GitHub reuse and still drops about 345 lines.

<a id="install-without-the-custom-ci-adapter"></a>

### Install without the custom CI adapter

**Identity:** SEED-423#install-without-the-custom-ci-adapter

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer whose project uses GitHub Actions installs CI
  observation without a second provider path that nothing configures.
- **Evaluation.** The `ciAdapter` and `ciRebuild` settings, the four
  `ci-command-*` scripts, their branches in `watch-ci-execution.mjs` and
  `ci-project-configuration.mjs`, the `custom-ci*.md` manuals and the
  Dashboard's seven adapter files are gone, about 1,700 lines across the
  distribution and Dashboard. GitHub Actions observation is unchanged.
- **Effort hypothesis.** M, medium confidence.
- **Depends on.** The open decision on whether any project runs non-GitHub
  CI.
- **Safe stopping point.** Independent of the reuse story.

<a id="retire-finished-migrations-and-legacy-formats"></a>

### Read only current record formats and release layouts

**Identity:** SEED-423#retire-finished-migrations-and-legacy-formats

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer on a current release installs no code whose only
  job is reading records or layouts that earlier releases wrote.
- **Evaluation.** With the oldest supported release named, these are gone:
  `adopt --all` and `recordIdentity`; `legacyBasesFor`, `waitingBody` and
  `earlierBases`; `legacyDocumentHistory`; the unit-less CI proof entries and
  summary schema 1 across twelve `ci-proof-*` scripts and the Dashboard
  readers; the request owner's `supportsWorkflowRerun` and `archive-as-text`
  fallbacks; `acceptsLandingWithoutIdentity`; the optional `suffixBase`; the
  slice clock's timestamp scan; and the pre-0.3.99 forwarders under
  `src/install/` with `update-from-pre-distribution.sh`. About 700 lines.
- **Effort hypothesis.** M, medium confidence. Each format is independent.
- **Depends on.** The open decision on the oldest release a project may
  update from. Baseline verification reads the tag a project's `VERSION`
  records, so that release bounds the installer part.
- **Safe stopping point.** Any single format.

<a id="derive-the-install-payload-from-the-shipped-directory"></a>

### Derive the install payload from the shipped directory

**Identity:** SEED-423#derive-the-install-payload-from-the-shipped-directory

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A maintainer adds or removes a shipped file in one place,
  and a developer cannot receive an update that omits a file the scripts
  import.
- **Evaluation.** The installer ships every file under
  `Distribution/src/skills/` without the 393 hand-listed paths in
  `install.sh` and `src/install/open-dough-execution-payload.sh`. A file
  placed there by mistake fails a check. Updates from releases that declare
  their payload by list still verify.
- **Effort hypothesis.** M, medium confidence. The reader for historical
  declarations stays.
- **Depends on.** The first story, which moves the four unshipped files out
  of the directory.
- **Safe stopping point.** A check that the list equals the directory
  already removes the drift risk.

<a id="notify-claude-code-of-ci-through-one-path"></a>

### Notify Claude Code of CI results through one path

**Identity:** SEED-423#notify-claude-code-of-ci-through-one-path

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer running an execution in Claude Code gets CI
  results through the path every host shares, and the installation carries no
  third notification mechanism.
- **Evaluation.** The background handoff scripts (`ci-background-handoff`,
  `-hook`, `-waiter`, `-state`, `-session`, 478 lines), its Stop hook entry
  and `ci-background-handoff.md` are gone. A Claude Code execution still
  learns of a CI failure after its turn ends.
- **Value / learning.** Guidance calls the handoff an explicit alternative
  to `complete-revision`, limited to ten minutes, with delivery reported as
  uncertain.
- **Effort hypothesis.** M, medium confidence. The risk is a Claude Code
  session that ends before CI finishes.
- **Depends on.** None.
- **Safe stopping point.** Complete on its own.

<a id="trim-the-product-backlog-command-to-guided-operations"></a>

### Trim the product backlog command to guided operations

**Identity:** SEED-423#trim-the-product-backlog-command-to-guided-operations

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** An agent maintaining a backlog finds every operation it may
  use in guidance, and the command carries none that guidance never names.
- **Evaluation.** `refresh` and `direction` are either named in the skill or
  removed with their reports, about 300 lines. The usage text gives a
  synopsis and leaves explanation to the references, about 120 lines. The
  seven story-state files read and write the block through one schema module
  and one file module, about 200 lines. Handlers, request readers and
  reporters sit with their operations.
- **Effort hypothesis.** M, medium confidence. The Dashboard shares the
  story-state digest in the browser.
- **Depends on.** None.
- **Safe stopping point.** Each of the three parts.

<a id="reconcile-the-backlog-through-one-git-adapter"></a>

### Reconcile the backlog through one Git adapter

**Identity:** SEED-423#reconcile-the-backlog-through-one-git-adapter

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer whose branches both changed the backlog gets the
  same reconciliation from a merge or a rebase, maintained once.
- **Evaluation.** Ten adapter files of about 1,410 lines become one adapter
  with a table per operation and thin entry files where scripts spawn them.
  The cherry-pick adapter, about 460 lines that no workflow uses, is removed
  with its section of `merge-conflicts.md` unless a use is named. The unused
  `--pre-rebase-tip` and `--destination-at-start` overrides go.
- **Effort hypothesis.** M, medium confidence; 250 lines, or 650 with
  cherry-pick. Git stops differ per operation, such as an empty pick and a
  fast-forward merge.
- **Depends on.** None.
- **Safe stopping point.** Removing cherry-pick alone.

<a id="publish-to-trunk-through-one-loop"></a>

### Publish to trunk through one loop

**Identity:** SEED-423#publish-to-trunk-through-one-loop

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer's delivery, landing, resume, startup claim and
  session-record publication behave alike under a trunk race, because one
  implementation pushes an exact revision.
- **Evaluation.** The five implementations of fetch, already-published
  check, push, single retry, confirmation and timeout staging, about 1,650
  lines across `execution-increment-publication*`,
  `owned-suffix-reconciliation`, `history-preserving-publish*`,
  `publication-resume*`, `workspace-publication-push` and
  `sealed-session-record`, share one loop that takes the way to prepare the
  candidate on the tip. Result fields and stop names agents read are
  unchanged. Delivery spreads the publisher result in place of copying
  twenty fields.
- **Effort hypothesis.** L, medium confidence; 300 to 450 lines. Race
  handling is subtle and the results are an agent-facing contract.
- **Depends on.** None. The first story removes the resume obligation this
  would otherwise carry.
- **Safe stopping point.** Resume expressed as the publisher with rewriting
  disabled.

<a id="read-test-leads-from-a-smaller-reader"></a>

### Read test optimization leads from a smaller reader

**Identity:** SEED-423#read-test-leads-from-a-smaller-reader

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer optimizing tests gets the same ranked leads
  from a reader small enough to maintain.
- **Evaluation.** The eleven scripts behind `ci-proof-leads.mjs`, about
  1,780 lines for one printed table, choose the attempt, read the summary and
  print the slowest entries per unit with a short gap list. Interpretation
  stays in `evidence-and-leads.md`. A test-optimization run on this
  repository reaches the same first leads.
- **Effort hypothesis.** M, low to medium confidence; 600 to 900 lines. The
  audit read `leads`, `gaps` and part of `ranking` only.
- **Depends on.** None.
- **Safe stopping point.** Removing the roll-up and remedy prose.

<a id="ask-github-without-a-shared-request-owner"></a>

### Decide whether GitHub requests need a shared owner process

**Identity:** SEED-423#ask-github-without-a-shared-request-owner

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A maintainer knows, from measured request counts, whether
  the detached request owner earns its 2,730 lines.
- **Evaluation.** A comparison on this repository's Dashboard and one CI
  observation shows GitHub request counts and rate-limit behavior with the
  owner and with each process calling `gh api` itself while sharing only the
  rate-limit hold file. The result is either a removal plan for the socket,
  wire protocol, endpoint and orphan reaping, about 1,400 to 1,600 lines, or
  a recorded reason to keep them.
- **Effort hypothesis.** M for the comparison, L for removal; medium to low
  confidence. Cross-process sharing of identical reads and the machine-wide
  concurrency cap are what removal gives up.
- **Depends on.** None.
- **Safe stopping point.** The recorded comparison.

<a id="report-a-missing-exact-run-without-inferring-coverage"></a>

### Report a missing exact run without inferring coverage

**Identity:** SEED-423#report-a-missing-exact-run-without-inferring-coverage

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer whose revision has no CI run of its own gets a
  plain report in place of an inference built from workflow path rules.
- **Evaluation.** `ci-path-applicability`, the hand-written workflow path
  parser in `ci-workflow-path-policy`,
  `ci-revision-applicability-classification`, `ci-integrated-state*`,
  `ci-mailbox-queue-progress` and most of `ci-mailbox-revision-coverage`,
  about 1,100 lines, shrink to the rule this repository relies on. A
  documentation-only or superseded commit still completes.
- **Effort hypothesis.** L, low confidence; 500 to 800 lines. This
  repository sets `integratedStateCompletion` and the Dashboard imports the
  path policy.
- **Depends on.** None.
- **Safe stopping point.** Keeping only the integrated-state rule.

## Ordering and scope reduction

The first story needs no decision and is first. The two CI option stories,
the legacy formats and the payload derivation follow: the largest removals at
the highest confidence, three of them waiting only on a decision. The
notification, backlog command, Git adapter and publication stories change
mechanisms agents use daily and carry medium confidence. The leads reader,
request owner and coverage inference are last: largest uncertainty, and the
last two could cost reliability. They are the first to drop.

Not proposed: merging files that the 250-line limit split. It removes no code.
`execution-start*` is ten files for one command and is the clearest case for
a redesign by responsibility when that area is next changed.

## Open decisions

- Has any project adopted CI reuse or a custom CI adapter? Recommendation:
  check the projects that run the production Dashboard; if none has, remove
  both.
- What is the oldest release a project may update from? Recommendation: the
  oldest `VERSION` recorded in those projects.
- Does any workflow cherry-pick the backlog? Recommendation: remove the
  adapter; none of the installed workflows does.

## When to surface

When the first story is selected, and again whenever a release adds files to
the installation.

## Breadcrumbs

- Removed in the first pass: `ci-observer-stream.mjs`,
  `dough-bug-fixing/scripts/retained-artifacts.mjs`, the unread `delivered`
  marker check, `request.sha`, and the `origHead` and `headName` fields.
- Checked and live, so not listed: every `dough-story-refinement`,
  `dough-story-wrap-up` and `dough-land` script and flag; both backlog merge
  drivers; the guard hook; the done catalog; and every other
  `product-backlog.mjs`, `ci-mailbox.mjs` and `execution-start.mjs` verb and
  flag that guidance names.
- `ci-mailbox.mjs register-push` has no guidance recipe, and two references
  say not to run it separately; it is used by hand after integration, so it
  stays.
