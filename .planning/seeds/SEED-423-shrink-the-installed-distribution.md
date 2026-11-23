---
id: SEED-423
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a dead-code and simplification audit of the Distribution scripts
trigger_when: selected from the product backlog
scope: eleven stories
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
leaves the same code installed. The remaining stories each remove a capability
or replace a mechanism, so each needs either a decision about who still uses
it or a measured comparison.

Effort bands are relative. S is one script area with its tests. M crosses
script areas or changes guidance agents follow. L changes a mechanism the
Dashboard and installed scripts share.

## Story decomposition

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
- **Evidence.** The six production Dashboard projects (Open Dough, Doughnut,
  Pygardon, Terry Talks, Lizard and Clipboard) had no tracked caller of the
  recipes in their workflows, scripts or configuration on 2026-11-22.
  Pygardon uses its own CI adapter. This story removes the reuse recipes and
  their examples.
- **Effort hypothesis.** S, high confidence.
- **Depends on.** None.
- **Safe stopping point.** Removing only the custom example and its manual
  keeps GitHub reuse and still drops about 345 lines.

<a id="install-without-the-custom-ci-adapter"></a>

### Call custom CI through a minimal adapter interface

**Identity:** SEED-423#install-without-the-custom-ci-adapter

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer using Pygardon CI can observe and act on its
  results through Open Dough while maintaining provider behavior in Pygardon.
- **Scope.** Pygardon owns provider access, interpretation and operations.
  Open Dough defines the smallest interface its workflow and Dashboard need,
  invokes the configured adapter, and uses its normalized results in shared
  CI behavior. Compare the custom path with the GitHub Actions path for the
  same outcomes. The custom path should be simpler because it delegates
  provider behavior. Follow [ADR 0004, Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md)
  for project-owned configuration.
- **Evaluation.** The watcher and Dashboard use the same documented contract
  and invocation code. Check the candidate with Pygardon's adapter for CI
  status and failure diagnosis, attempt proof and job timing, and rebuild
  where enabled. Existing GitHub Actions workflows retain their behavior.
  Publish the contract and adoption instructions, and keep Pygardon's live
  integration on a compatible release and adapter throughout the handoff.
- **Effort hypothesis.** M, medium confidence. Start from the roughly 1,700
  lines identified across the Distribution and Dashboard and measure how much
  provider-specific code the simpler boundary removes.
- **Depends on.** None. The
  [Pygardon adoption story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261119-adopt-the-simplified-open-dough-ci-adapter.md#adopt-the-simplified-open-dough-ci-adapter)
  follows delivery of this contract.
- **Safe stopping point.** Share one invocation boundary while preserving
  Pygardon's current command contract.

<a id="retire-finished-migrations-and-legacy-formats"></a>

### Update from the previous release without legacy readers

**Identity:** SEED-423#retire-finished-migrations-and-legacy-formats

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer who keeps Open Dough current can update one
  release at a time while the installer and runtime carry less compatibility
  code.
- **Update policy.** All six maintained installations were on `0.3.110`
  on 2026-11-22. Use that as the initial floor. After rollout, the supported
  update baseline moves with each release. The immediately previous numeric
  release can update directly to the latest, the latest is a no-op, and an
  older installation gets a clear stop before writes. Preserve the tagged
  baseline check and project configuration under
  [ADR 0003, Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0004, Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md).
- **Evaluation.** Prove a previous-to-latest update, a latest-to-latest no-op,
  and rejection of an older installation before any managed files change.
  Retire old layout and record readers once the supported baseline and live
  project records no longer need them. Candidates include `adopt --all` and
  `recordIdentity`; `legacyBasesFor`, `waitingBody` and
  `earlierBases`; `legacyDocumentHistory`; the unit-less CI proof entries and
  summary schema 1 across twelve `ci-proof-*` scripts and the Dashboard
  readers; the request owner's `supportsWorkflowRerun` and `archive-as-text`
  fallbacks; `acceptsLandingWithoutIdentity`; the optional `suffixBase`; the
  slice clock's timestamp scan; and the pre-0.3.99 forwarders under
  `src/install/` with `update-from-pre-distribution.sh`. About 700 lines.
  Check persisted project records separately from installed versions and
  migrate any still needed before retiring their readers.
- **Effort hypothesis.** M, medium confidence. Each format is independent.
- **Depends on.** None.
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
- **Prerequisite met.** The four test fixtures have moved out of the
  distribution source.
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

### Reconcile backlog merges and rebases through one Git adapter

**Identity:** SEED-423#reconcile-the-backlog-through-one-git-adapter

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer whose branches both changed the backlog gets the
  same reconciliation from a merge or a rebase, maintained once.
- **Evaluation.** Merge and rebase share one reconciliation implementation
  with thin entry files where scripts spawn them. Retire the backlog
  cherry-pick adapter (about 460 lines), its installed guidance and its
  payload entries. Preserve the merge and rebase results, including clean
  merges that still need reconciliation, and remove the unused
  `--pre-rebase-tip` and `--destination-at-start` overrides.
- **Effort hypothesis.** M, medium confidence. Merge and rebase stops still
  need operation-specific handling.
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
- **Depends on.** None.
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

Start with CI reuse removal, the smaller custom CI interface, retirement of
legacy formats, and payload derivation. The notification, backlog command,
Git adapter and publication stories change mechanisms agents use daily and
carry medium confidence. The leads reader, request owner and coverage
inference are last: largest uncertainty, and the last two could cost
reliability. They are the first to drop.

Not proposed: merging files that the 250-line limit split. It removes no code.
`execution-start*` is ten files for one command and is the clearest case for
a redesign by responsibility when that area is next changed.

## When to surface

Whenever a release adds files to the installation.

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
