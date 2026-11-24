---
id: SEED-423
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a dead-code and simplification audit of the Distribution scripts
trigger_when: selected from the product backlog
scope: Distribution simplification stories
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

<a id="check-shipped-script-imports"></a>

### Catch imports missing from the shipped skills

**Identity:** SEED-423#check-shipped-script-imports

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A maintainer moving a module during Distribution cleanup
  learns in CI if a shipped skill would fail to load it in a client checkout.
  The payload inventory and Markdown link checks can pass while a script
  imports a file available only in the Open Dough repository.
- **Evaluation.** The Distribution check passes for relative `.mjs` imports
  whose targets are shipped under `Distribution/src/skills/`. It fails and
  names the importing script and specifier when a literal relative `.mjs`
  import resolves outside that directory or its target is absent. Prove the
  boundary with an import that resolves in the source checkout and fails in
  an installed checkout.
- **Effort hypothesis.** S. The native evaluation tool already walks literal
  relative imports for evidence hashing.

<a id="use-one-managed-install-layout"></a>

### Use one managed install layout

**Identity:** SEED-423#use-one-managed-install-layout

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/812-use-one-managed-install-layout/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7b796c222126b3dd4d49e0a7f361b7da6bdb49493f1d959480da97218bd7d652","plan":"702c4913426dbd1ac66f5663a6f85ede2b35c0de78fbaab9b6720d517393de8a"}}
```

**Goal.** Maintainers deliver and verify one Open Dough installation layout:
physical managed skill directories in the Claude root (`.claude/skills/`) and
the shared Codex/Cursor root (`.agents/skills/`). Code, guidance and tests
that exist only for symlinked Open Dough skill directories, or for a project
holding only one of the two roots, are deleted. The structure that served two
layouts collapses to the one that remains, so the Distribution is smaller and
easier to read.

**Starting state (observed 2026-11-24).** Every production-dashboard client
trunk (Open Dough, Doughnut, Pygardon, Terry Talks, Lizard, Clipboard) holds
both roots as physical directories, and none has a symlink at an Open
Dough-managed skill path. Doughnut reached this in `707637a976`. The installer
already writes both roots and refuses a symlinked skill root or managed
directory as an unsafe destination.

**Scope.**

- Delete the symlinked-skill test layout and every test that runs a script
  through a symlinked skill directory: the entry-point sweep, its fixture, the
  linked-path cases in the guided-commit and CI command adapter tests, and
  the test-only parameters that pass a linked path. Tests that installed
  skills through that fixture install them with a plain copy.
- The checkout-bound CI runtime resolves the invoking host's own root:
  `.claude` for Claude, `.agents` for Codex and Cursor. The ordered fallback
  across roots goes, with names that described a root as an alias.
- Comments, guidance, docs and update outcome text describe the one layout
  directly. Wording that contrasts with a linked layout, such as "both
  physical roots", says "both roots".
- No text records the removed layout or says it is unsupported.

**Required restrictions kept.**

- The installer's unsafe-destination and payload-safety checks, with their
  tests. They protect installed files from being written through a link.
- Realpath handling for checkout and worktree identity, and for platform path
  aliases such as macOS `/tmp` and `/private/tmp`. Scripts invoked through
  such a path still run their command. The realpath-equivalent direct-entry
  check stays for that reason, and its unit and process-level tests stay.
- Project-owned skill links, such as Pygardon's own `.claude/skills/release`,
  keep coexisting with the managed directories.
- Generic handling of symlinks in a project's changed files, and the rule
  against linking `node_modules` from another checkout.

**Scope limits.**

- Installed copies under this repository's `.claude/`, `.agents/` and
  `.cursor/` change through the next release and update, not by hand.
- The pinned Doughnut revision in the `doughnut-title-precedence` evaluation
  case stays. Re-pinning needs a paid native run.
- Deferred: sharing duplicate setup, observation and completion logic across
  the three hosts. It is independent of the install layout and remains a
  candidate for its own story.

**Key examples.**

1. A Claude-hosted delivery in a checkout with both roots runs the CI runtime
   from `.claude/skills/dough-execute-plan`. A Codex or Cursor delivery runs it
   from `.agents/skills/dough-execute-plan`.
2. A checkout without the invoking host's root gets a refusal that names the
   path it tried. It does not run the other root's copy.
3. A guided commit, run as `node <script>` through a macOS `/tmp` path that
   resolves to `/private/tmp`, performs its command.
4. Installing into a project whose `.claude/skills` is a symlink is refused
   as an unsafe destination, as it is today.
5. An ordinary update that finds both roots current reports "Outcome: both
   installations are current; …".
6. Searching `Distribution/` for symlinked skill directories finds no fixture,
   test, comment or guidance.

**Architecture.** Follows [ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md),
which already populates every supported native layout.

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
