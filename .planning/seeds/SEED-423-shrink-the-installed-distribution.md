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

<a id="retire-finished-migrations-and-legacy-formats"></a>

### Update from the previous release without legacy readers

**Identity:** SEED-423#retire-finished-migrations-and-legacy-formats

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/794-update-from-the-previous-release-without-legacy/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ccf1335d73b580d2a9e23124d9a1a319978b83726c32882ead006bf5c93ac7cd","plan":"a0988e77d9f80874a02e309794f41ba71555be399e3c139f941e83bc6e93c1a5"}}
```

**Resplit before readiness** on 2026-11-23 when the combined installer,
backlog, execution/publication, and CI-proof/Dashboard legacy-format scope
required ten slices at 15 active minutes per slice, exceeding the eight-slice
plan limit. Unit-less CI proof entries and summary schema 1 moved to
[Read and collect CI proof only in declared units](#require-declared-units-in-ci-proof)
([plan 795](../slice-plans/795-require-declared-units-in-ci-proof/PLAN.md)).
Plan:
[plan 794](../slice-plans/794-update-from-the-previous-release-without-legacy/PLAN.md).

**Goal.** A developer who keeps Open Dough current updates directly from the
immediately previous numeric release while `latest` stays a zero-write no-op
and older installations stop cleanly before any file changes, and the
installer, product backlog, execution runtime, GitHub request owner, and
Dashboard reporting drop finished migrations and legacy readers that no
maintained installation or persisted project record uses.

**Scope.**

- Enforce the moving previous-release ordinary update policy across
  `open-dough-release-*.sh` and `dough-update/SKILL.md` under
  [ADR 0003, Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [ADR 0004, Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md):
  an unchanged installation at `latest` stays a no-op (still repairing missing
  host hooks without payload writes), an unchanged installation at the
  immediately previous numeric release tag updates directly to `latest` after
  tagged baseline verification, and an installation at an older release tag
  stops before any managed-file write with explicit `--force` recovery
  guidance. Preserve `--force` reinstall recovery, newer-version refusal
  without downgrade, and project-owned `.planning/open-dough.json`.
- Retire the pre-`0.3.99` root `src/` forwarders and checkout fallback: move
  `src/install/open-dough-execution-payload.sh` to
  `Distribution/src/install/open-dough-execution-payload.sh`, remove
  `src/install/open-dough-release.sh`,
  `src/install/open-dough-register-hooks.mjs`, the `src/skills` symlink,
  `Distribution/tests/installation/update-from-pre-distribution.sh`, and
  `release_source_dir`'s `${checkout}/src` fallback, while keeping
  `(Distribution\/)?src/install/` in `open-dough-payload-declaration.sh` and
  `open-dough-release-leftovers.sh` so the `0.3.112` tagged baseline and
  release history verify cleanly across the transition release.
- Retire finished product-backlog migrations and legacy readers:
  `product-backlog.mjs adopt --all`, `product-backlog-adopt.mjs` (and its
  `install.sh` payload entry), `recordIdentity` in `product-backlog-home.mjs`,
  legacy story-state basis digests (`legacyBasesFor`, `waitingBody`,
  `dependencyFences`, `earlierBases`) in `product-backlog-story-state*.mjs`,
  and unnumbered historical seed scanning (`legacyDocumentHistory`) in
  `product-backlog-identity-history.mjs`.
- Retire finished execution, request-owner, landing-reporting,
  publication-resume, and slice-clock shims: `supportsWorkflowRerun` and
  `workflowRerunSockets` in `github-request-owner-endpoint-connection.mjs` and
  `github-request-owner-link.mjs`, `"archive-as-text"` in
  `ci-github-actions.mjs` and `olderRequestOwnerDetail` in
  `dashboard/server/ciProofArtifact.ts`, `acceptsLandingWithoutIdentity` and
  `acceptsStoryless` in `dashboard-landing.mjs` and
  `dashboard/server/{launchReportingFiles,completionReporting,branchLandingContext}.ts`,
  optional `suffixBase` across `publication-comparison.mjs`,
  `publication-resume.mjs`, and `execution-increment-resume.mjs` (passing
  `suffixBase` from `trunk-closure-settlement.mjs`), and the period/command
  timestamp fallback scan in `slice-clock-slices.mjs`.
- Scope limits: unit-less CI proof entries (`LEGACY_UNIT` / `unit: "legacy"`)
  and summary `schemaVersion: 1` across `ci-proof-*` and the Dashboard belong
  to
  [Read and collect CI proof only in declared units](#require-declared-units-in-ci-proof).
  Installed copies under `.agents/skills/` and `.claude/skills/` in maintained
  repositories update on the next release rollout.

**Key examples.**

- Against a release source with `0.1.1`, `0.1.2`, and `0.1.10`, an unchanged
  `0.1.2` installation updates directly to `0.1.10`, an unchanged `0.1.10`
  installation is a zero-write no-op, an installation at `0.1.1` refuses
  before any file or mtime changes while naming the previous release `0.1.2`
  and `--force`, and explicit `--force` replaces `0.1.1` with `0.1.10` while
  leaving `.planning/open-dough.json` untouched.
- An installation recorded at a `0.3.112`-shaped previous release (whose
  tagged `install.sh` sources `src/install/open-dough-execution-payload.sh`)
  updates cleanly to the new release whose repository has no root `src/` tree
  and declares its execution payload under `Distribution/src/install/`.
- `product-backlog.mjs adopt --all` fails as an unknown operation,
  `product-backlog-adopt.mjs` is absent from fresh and updated installations,
  `read-state` evaluates `changedSinceReview` solely against the current
  story-scoped basis, and `identity-evidence` reads numbered seed history
  without scanning unnumbered paths.
- GitHub request-owner links require workflow-rerun support and base64 archive
  replies without text-archive fallbacks, Dashboard launches write
  `landing-context.json` directly for both story and storyless sessions
  without probing `acceptsLandingWithoutIdentity`, publication resume and
  `trunk-closure.mjs finish` require `suffixBase`, and `--after-ended-session`
  settles running periods directly at `lastClockCommandAt`.

**Evidence.** Checked on 2026-11-23 across all six maintained repositories
(Open Dough, Doughnut, Pygardon, Terry Talks, Lizard, and Clipboard): all
twelve physical skill roots record `0.3.112`; active backlogs hold 0 shorthand
entries and 0 unrecorded canonical homes; `.planning/**/*.md` holds 0 legacy
story-state basis matches; Pygardon's two historical unnumbered seeds sit
below `SEED-20261119` (`next: SEED-20261120`); running request-owner processes
are `0.3.112` (`protocol = 2`); and every `.git/.../open-dough/slice-clock`
file carries `lastClockCommandAt`.

- **Effort hypothesis.** M, high confidence (6 slices).
- **Depends on.** None.
- **Safe stopping point.** Any completed slice.

<a id="require-declared-units-in-ci-proof"></a>

### Read and collect CI proof only in declared units

**Identity:** SEED-423#require-declared-units-in-ci-proof

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/795-require-declared-units-in-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"dba30be7228492bb6b357ef3ecd690d149a0c7111418c9bad49ff434541ece98","plan":"1283275234432fdc94ea916201ce494e385d1698893365dc7a9ec7fdf82ab17a"}}
```

**Split from** SEED-423#retire-finished-migrations-and-legacy-formats before
readiness on 2026-11-23. The shared legacy-retirement plan exceeded the
eight-slice limit. See [plan 795](../slice-plans/795-require-declared-units-in-ci-proof/PLAN.md).

**Goal.** Developers and agents who read CI proof in the CLI or Dashboard can
interpret every count and test-execution time in a declared unit. Maintainers
can retire the old proof formats while developers keep the build timing and
provenance already recorded for earlier landings.

**Scope.**

- Collect version 2 summaries from fragments counted as `case` or `file`.
  Outcomes reports require `--unit case|file`, and summary expectations
  require a unit for each entry and part count. A Playwright record already
  defines its observations as test cases. Preserve attempt and revision
  checks, missing and ambiguous parts, and separate evidence by unit.
- Read version 2 summaries whose evidence uses declared units throughout.
  Refuse unsupported proof through the existing invalid-proof paths. A count
  with an unknown unit cannot be attributed safely, and skipping one unit or
  entry within an invalid summary would present partial proof as complete.
- In retained builds, record the invalid proof as an unavailable result
  while preserving the build, measured revision, wall time, and neighbouring
  records. Keep scoped test-execution history explicit about the invalid
  proof. Apply the same rule to a retained build used by the CI follow-up
  ledger so the ledger can still account for its recorded requests.
- Historical conversion, archive backfill, changes to the comparison
  selection or history window, and rollout of the next release to client
  repositories are outside this story.

**Key examples.**

- A job has case and file outcomes for one location. With declarations for
  both, collection writes separate evidence and uses the declared unit even
  for a part whose fragment never arrived. The CLI ranks timing within its unit,
  and the Dashboard compares counts and timing within their units. An omitted unit on an outcomes
  report or expectation fails before output is written. An old fragment
  supplied alongside valid ones is diagnosed and cannot fill a declared part.
- A GitHub artifact or custom adapter reports version 1, or version 2 whose
  evidence omits the unit or includes a retired unit alongside a declared
  unit. Reading this attempt returns invalid proof with a reason and supplies
  no counts or test-execution times from that summary.
- An older retained build with otherwise usable timing holds retired proof,
  and the same store has a newer build with declared proof. Reading the
  history and then writing an ordinary update preserves the build points,
  their wall time, and the newer build's scoped timing. The older build's
  scoped timing is an invalid-proof gap, and the retention reader makes no
  replacement CI request. An old proof in a recorded follow-up likewise
  leaves the request and its allowance accounted for.

**Architecture.** Use the existing summary validator for the proof contract.
  Classify invalid proof at each input boundary before projecting it. The
  retained build decoder serves both machine stores, so a proof failure stays
  within the build's proof field. Revision identity and comparable evidence
  follow [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

- **Effort hypothesis.** L, medium confidence. See the bounded slices in plan 795.
- **Depends on.** None.
- **Safe stopping point.** Any proved slice. Settle retained-store isolation
  before the reader rejects retired summaries.

<a id="derive-the-install-payload-from-the-shipped-directory"></a>

### Derive the install payload from the shipped directory

**Identity:** SEED-423#derive-the-install-payload-from-the-shipped-directory

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/796-derive-the-install-payload-from-the-shipped-directory/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e53ed792abff0fb371a0588d587706d77ecd8879ff563cac89bb02cb31cb9bc4","plan":"74f0a6a55131352b5dac94df0e7174f3429ff37738dc42298fdb2c956929612d"}}
```

**Goal.** A maintainer adds or removes a released client file by changing
`Distribution/src/skills/` once. Developers receive the whole tagged payload
in both native skill roots, including the dependencies used by shipped guidance
and scripts.

**Scope.** Derive the client payload for new releases from the shipped
directory. Remove the hand-maintained file lists from `install.sh` and
`src/install/open-dough-execution-payload.sh`. Keep Proposed additions, test
fixtures, and maintainer material outside the directory. Use maintainer review
to confirm intent and make deterministic checks fail for detectable misplaced
artifacts, unsafe entries, and missing local dependencies the checks can
resolve. Verify a list-era installation using the declaration at its recorded
tag and keep the existing update and dropped-file safeguards. Release tags,
version selection, native layout, and project-owned files follow the existing
installation contract. Publishing a release and rolling it out are separate
work.

**Key examples.**

- A maintainer places a reviewed runtime file in the shipped directory and a
  Proposed skill outside it. Installation from that release includes the new
  file in the shared Codex/Cursor and Claude Code roots, and the Proposed
  skill stays outside both.
- A test fixture is accidentally put in the shipped directory. The payload
  check identifies its path and fails before it can ship.
- An unchanged client of a list-based release runs an ordinary update to a
  directory-based release. The updater verifies the earlier tag's declared
  files, installs the full new payload, removes obsolete managed files as
  before, and preserves unrelated project files. If the client changed a file
  that the ordinary update must verify, it refuses before writing.

**Release policy.** Terry Yin confirmed directory-based promotion with
maintainer review in
[ADR 0003, Release lifecycle and versioning](../../docs/adrs/0003-tagged-release-versioning-accepted.md).
The four test fixtures identified during the audit already live outside the
shipped directory.

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
