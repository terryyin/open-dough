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

<a id="install-without-the-custom-ci-adapter"></a>

### Call custom CI through a minimal adapter interface

**Identity:** SEED-423#install-without-the-custom-ci-adapter

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/793-call-custom-ci-through-a-minimal-adapter-interface/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9d97bb01f509e921e9f7c7f12fd0327b452c2bd64e287559736b86a12d70d9a3","plan":"90a9e881d9975830e5ee61cd33c7fb1971d368d8b7bce459d069258549538880"}}
```

**Goal.** A Pygardon developer can follow CI in the Open Dough execution
watcher and Dashboard using a smaller shared adapter interface. Pygardon owns
changes to its CI provider, and Open Dough carries less code and guidance for
turning adapter replies into the same outcomes it shows for GitHub Actions.

**Scope.**

- Use one documented command contract and shared invocation and response
  boundary for `discover`, `diagnose`, `proof`, `jobs`, and the separately
  enabled `rebuild`. Pygardon owns service access, provider interpretation,
  diagnostic selection, and admission. Open Dough owns the meaning of CI
  evidence, its revision and attempt matching, and workflow decisions based
  on that evidence.
- Preserve exact verdicts, bounded failure evidence, queue and integrated-state
  semantics, attempt proof and job timing, and the Dashboard's existing
  one-request rebuild behavior. Preserve the default GitHub Actions path and
  the distinction between missing evidence and an observed verdict.
- Keep Pygardon's current command and project settings usable through the
  first release that carries the simplified contract. Ship the contract and
  adoption instructions with that release. The Pygardon adoption story owns
  its deployment and any downstream changes. The CI reuse recipes and
  changes to GitHub Actions behavior are outside this story.
- Follow [ADR 0004, Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md).
  The commands and their credentials stay under project ownership, and
  ordinary Open Dough use reads the installed contract and code locally.

**Key examples.**

- With Pygardon's adapter configured, a pending attempt becomes passing or
  failing for the observed revision. A failure delivers the selected excerpt
  or the reason it is unavailable. A different revision's green result and
  queue evidence alone cannot certify the observed revision.
- A completed attempt selected in Dashboard Intent supplies its own proof
  and job timings through the same adapter boundary. Ambiguous identity or
  missing evidence leaves the build visible with the reason for the gap.
- A qualifying landed attempt with `ciRebuild` enabled requests one new
  check of its original revision. The Dashboard follows the new exact
  attempt if admitted and reports refusal or uncertain admission without
  another request. The execution watcher remains read-only.
- GitHub Actions projects still observe their configured checks, diagnose
  failures, and read attempt evidence through their existing default path.
  A client update can install the simplified contract and retain Pygardon's
  existing settings and command while adoption is pending.

- **Effort hypothesis.** M, medium confidence. Start from the roughly 1,700
  lines identified across the Distribution and Dashboard and measure how much
  adapter-specific code and guidance the simpler boundary removes. The audit
  estimate describes the area to inspect and sets no reduction quota.
- **Depends on.** None. The
  [Pygardon adoption story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261119-adopt-the-simplified-open-dough-ci-adapter.md#adopt-the-simplified-open-dough-ci-adapter)
  follows delivery of this contract.
- **Safe stopping point.** Share one invocation boundary while preserving
  Pygardon's current command contract.

<a id="require-declared-units-in-ci-proof"></a>

### Read and collect CI proof only in declared units

**Identity:** SEED-423#require-declared-units-in-ci-proof

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/795-require-declared-units-in-ci-proof/PLAN.md","assessment":"not-ready","reasons":["Provisional resplit remainder awaiting story refinement and plan realignment."],"basis":{"document":"9ee66b628730aee17758b3906bfcaba51c4f2794c381fb16177dc03aca8bc492","plan":"8eff96ab4219f8087ab961837d85e26e099819a0df93bd9dea3a4744c9a08f24"}}
```

**Split from** SEED-423#retire-finished-migrations-and-legacy-formats before
readiness on 2026-11-23, when retiring CI proof summary `schemaVersion: 1` and
`unit: "legacy"` alongside the installer, backlog, and execution legacy
readers exceeded the eight-slice plan limit. Its provisional plan is
[plan 795](../slice-plans/795-require-declared-units-in-ci-proof/PLAN.md),
awaiting story refinement.

- **For / why.** A developer or agent reading CI proof in the CLI or Dashboard
  sees every entry counted and compared in declared `case` or `file` units,
  without maintaining parallel `legacy` unit and `schemaVersion: 1` readers
  across twelve `ci-proof-*` scripts and fifteen Dashboard modules.
- **Scope.** Retire `READABLE_SUMMARY_VERSIONS` version `1`,
  `currentSummaryOf`, `LEGACY_UNIT`, unit-less `--expect` / fragment collection
  options, and `unit: "legacy"` / `legacyReason` handling across the twelve
  `ci-proof-*` scripts, `ci-proof-read.mjs`, `references/ci-proof-summary.md`,
  and the Dashboard CI proof, comparison, and landed-history modules. On
  2026-11-23 all six maintained projects' CI workflows already pass explicit
  `case` or `file` units and emit `schemaVersion: 2`, while
  `~/.open-dough/dashboard/landed-ci-history.json` still retains 22 builds
  from 2026-11-05..2026-11-10 (`doughnut`, `terry-talks`, `clipboard`) whose
  stored `proof.summary` carries `unit: "legacy"`; `retainedProofSchema` in
  `dashboard/server/landedCiObservation.ts` must map retired/invalid retained
  summaries to `{ kind: "unavailable", reason: "invalid", detail }` (matching
  live `ciProofArtifact.ts` and `ciAdapterProof.ts`) so the machine store and
  retained wall-time points remain readable without keeping legacy unit code,
  following [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- **Evaluation.** Collecting or reading a `schemaVersion: 1` or unit-less
  summary refuses or surfaces `unavailable` (`invalid`); declared `case` and
  `file` collection, ranking, comparison, and landed scope history work
  unchanged; and a `landed-ci-history.json` cohort holding older v1 or
  `unit: "legacy"` build summaries stays readable across reads and atomic
  writes with wall-time points intact and scoped test-execution readings
  reported as invalid proof gaps.
- **Effort hypothesis.** L, medium-high confidence (~4–5 slices across
  Distribution scripts and Dashboard).
- **Depends on.** None.
- **Safe stopping point.** Collector and CLI scripts retired while Dashboard
  readers follow, or after `retainedProofSchema` normalization is in place.

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
