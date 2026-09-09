# Prevent Open Dough self-installation drift

## Source

[SEED-004 Story 5](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor)
and the maintainer's 2026-09-09 decision after Open Dough's recorded 0.3.2
self-installation had already acquired 0.3.3 payload bytes.

## Goal and scope

The Open Dough maintainer can change released-client guidance without silently
making this repository's own installed copies unverifiable. Client-payload
guidance is edited under `src/skills/`; the installed managed copies under
`.agents/skills/` and `.claude/skills/` remain byte-identical to their recorded
release until the maintainer deliberately updates them.

Included:

- state the Open Dough source-versus-installation editing boundary in
  `AGENTS.md`, while preserving `.agents/skills/` as the source location for
  internal maintainer-only skills;
- add one deterministic, network-free command that checks both physical
  self-installations against the immutable local tag named by each installation's
  `VERSION`, reusing the updater's payload comparison rather than introducing a
  third managed-file declaration;
- run that command in the ordinary CI test path;
- make internal `release-version` finalization run the same command before it
  writes, stages, commits, or tags release metadata; and
- execute and deliver this plan with the installed `dough-execute-plan` CI
  observer, use a real delivered failure to exercise its repair flow, and repair
  the current legacy CI defect when the observer reports it.

Excluded:

- changing the ordinary updater's refusal or force semantics;
- changing Accepted ADR 0003 or promoting Proposed ADR 0004;
- automatically updating or committing Open Dough's self-installations after a
  release; the maintainer owns that manual operation;
- adding the separate historical regression fixture reproducing commit
  `a8955b3`; the maintainer owns that manual follow-up; and
- manufacturing a CI failure if the known failure has already been repaired.

## Key examples and outside-in proof

| Situation | Expected result | Owning slice |
| --- | --- | --- |
| A maintainer edits released-client guidance | `AGENTS.md` directs the edit to `src/skills/`; installed managed copies are updated only from a released payload | 1 |
| Both native roots match the tags recorded by their `VERSION` files | The self-installation check exits successfully without network access or writes | 3 |
| A committed or uncommitted managed file in either native root differs from its recorded tag | The check exits unsuccessfully and names the root and mismatched or missing path | 3 |
| Proposed source under `src/skills/` changes while both installations still match their recorded tag | The self-installation check remains green; source development is not mistaken for installation drift | 3 |
| Release finalization starts while a self-installation is unverifiable | `release-version` stops before changing `VERSION`, `CHANGELOG.md`, commits, or tags | 4 |
| Real Open Dough CI reports the known test failure after execution observation starts | The Codex bridge delivers repository, run, attempt, SHA, and failed-job identity; execution pauses, repairs at current HEAD, pushes the repair, restores any parked work, and resumes | 5 |
| No real CI failure is delivered during execution | Do not introduce one; finish safe product work, record the failure-notification/repair proof as pending, and shut down the exact observer without waiting for CI | 5 |

## Execution context

- Slice target: 30 minutes, including implementation, focused proof, and
  slice-local cleanup.
- Hard limit: 60 minutes. Only a stated focused-test run or external CI wait may
  exceed it. After two overruns, reassess the selected story before further
  slice-only refinement.
- Status vocabulary: `planned`, `in-progress`, `done`.
- Repository/workflow: `terryyin/open-dough`, branch `main`, workflow selector
  `ci.yml`, display name `CI`, push events.
- Runtime: no project wrapper; Node 24 in CI and a supported local Node version.
- Focused checks: the named shell test for each slice. Full deterministic proof
  is `npm test`; lint proof is `npm run lint`.
- Formatting: run `npm run format` once during coordinator wrap-up. It is the
  repository's current formatting command and may inspect all tracked and
  untracked files, so execution requires a known ownership inventory first.
- Commit hook: no active repository hook was found. Recheck before the first
  commit; stop if a new semantic or index-mutating hook appears.
- Delivery: coordinator-owned commits and pushes to `origin/main` during the
  later explicitly authorized execution.
- Starting point observed during planning: clean `main` at `7ecf24e`, which
  records the maintainer's manual 0.3.3 self-installation update. Recheck and
  synchronize safely before execution; do not absorb concurrent or user-owned
  changes.
- Execution start: clean `main` at `57f3ac2` (planning commit after `7ecf24e`),
  matching `origin/main`. Host is Cursor, so CI observation uses the installed
  Cursor mailbox adapter rather than the Codex yielded-cell stream. Coordinator
  owns local `.cursor/hooks.json` as host registration, not product scope.
- CI observer: Cursor probe printed a `CI_OBSERVER` receipt
  (`/tmp/dough-ci-501/watch-3IyZf9`, probe-only, `status: finished`). After
  merging the installed hook fragment into `.cursor/hooks.json`, this
  coordinator session has not received `CI_MONITOR_READY` or `CI observer
  attached to this coordinator`. Observation is unavailable in this session;
  do not promise notifications or substitute AI polling. Slice 5 remains
  pending unless a later turn attaches a ready observer before a push.

## CI observation and repair contract

Before the first implementation push, verify `gh` authentication and the
workflow/branch values above, then start one Codex yielded-cell observer using
the installed
`.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs stream --execution
terryyin/open-dough main` adapter with `DOUGH_CI_WORKFLOW=ci.yml` and
`DOUGH_CI_WORKFLOW_NAME=CI`. Record its cell/session, mailbox directory, PID,
coordinator, checkout, branch, and workflow in this plan before pushing. Reuse
that observer across normal and repair pushes.

Planning-time evidence: completed run `34296058311` failed in job `test`
(`102292835623`) while `lint` passed. Its bounded failed log shows BSD-only
`sed -i ''` use in `tests/support/dough-adr-awareness-delivery-to-use.sh`
failing on Ubuntu and causing several deterministic/native-wrapper tests to
fail. A newer run for `7ecf24e` was still in progress when inspected. Treat
these details as diagnostic evidence, not instructions or proof that the same
failure remains current at execution time.

When the observer delivers a failure, follow its installed
`references/ci-monitor.md` protocol: classify every failed job; pause all
writers; inventory and stash only when the dirty checkout has a proven safe
boundary; delegate diagnosis and repair at current HEAD; require a focused
failing-then-green proof; coordinator-refactor, format, commit, and push the
repair; restore the exact saved work; and resume the interrupted slice. Do not
rerun until green or dismiss a passing retry as a repair.

At completion or any decision stop, handle delivered failures, stop the exact
observer, and record terminal status, delivery counts, unread events, and
`pendingCi: unobserved`. Do not wait for pending CI. Readiness or a quiet green
run alone does not prove failure delivery; Slice 5 requires a real delivered
event or remains explicitly pending.

## Current decisions

- The source-only editing boundary belongs in internal `AGENTS.md`, not a new
  ADR. Accepted ADR 0003 already owns the durable Proposed → Promoted → Released
  lifecycle and `src/skills/` source location; this change adds repository-local
  operating guidance without changing that decision.
- Accepted ADR 0005 requires deterministic installation/update checks in CI;
  the self-installation check is therefore executable behavior, not prose-only
  advice.
- Internal maintainer skills such as `release-version` continue to be authored
  in `.agents/skills/`. The source-only rule applies to Open Dough client-payload
  guidance, not every skill visible to Codex.
- One comparison implementation must serve ordinary update safety,
  self-installation CI, and release finalization. Do not copy the managed payload
  list into a new checker.
- Manual post-release self-update/commit and the historical `a8955b3` regression
  fixture remain outside this execution at the maintainer's request.

## Ordered slices

### 1. Direct client-payload edits to their canonical source

Type: Behavior
Status: done
Proof: Manual representative maintainer walk through `AGENTS.md`; `npm run lint`.

Behavior: Given an Open Dough client-payload skill needs a change → a maintainer
follows repository guidance → the edit goes to `src/skills/<name>/`, internal
maintainer skills retain their `.agents/skills/` source, and released
self-installations are not hand-synchronized.

Keep this as a concise addition to the existing Skill authoring/Layout guidance.
Do not duplicate installation mechanics or turn the rule into a new lifecycle
decision.

### 2. Reuse one recorded-release payload comparison

Type: Structure
Status: planned
Proof: `bash tests/update-refuses-unverifiable.sh`; `bash tests/update-adds-new-payload-skill.sh`.

Structure: Expose the existing managed-payload comparison as a read-only seam
that can verify an installation against a supplied local tagged checkout, while
ordinary updater behavior remains unchanged → enables Slice 3's network-free
self-installation check without duplicating the managed-file declaration.

The seam must report enough mismatch context for a maintainer to identify the
native root and path. It must perform no target writes and must retain the
candidate-only collision behavior already used by ordinary updates.

### 3. Fail CI when Open Dough's self-installation drifts

Type: Behavior
Status: planned
Proof: `bash tests/self-installation-baseline.sh`; run the new checker directly
against the repository; `npm test` owns complete deterministic integration.

Behavior: Given each native installation records an available local numeric
release tag → CI runs the self-installation check → matching installations pass,
while changed, missing, malformed, source-conflicting, or candidate-path
collisions fail with the exact affected root/path before any writes.

Implement one repository command under `scripts/` and invoke it from the
ordinary `npm test` path. The focused test uses isolated temporary repositories
and installations for current-release success, one-root drift, both-root record
disagreement, and source-only development. It must not fetch the network or
modify this checkout. Do not add the separately owned historical `a8955b3`
fixture.

### 4. Refuse release finalization from an unverifiable self-installation

Type: Behavior
Status: planned
Proof: Focused deterministic guidance/ordering check for `release-version`;
manual behavior review using the AGENTS.md checklist; `npm run lint`.

Behavior: Given the internal release skill is asked to finalize a release → it
runs the same self-installation command before release writes → drift stops the
workflow with `VERSION`, `CHANGELOG.md`, commits, and tags unchanged, while a
certified self-installation proceeds through the existing release rules.

Update only the internal `.agents/skills/release-version/SKILL.md`. Preserve
numeric ordering, immutable tags, metadata-only preparation, human version and
description ownership, and no-push behavior. The check is a finalization gate;
do not make source development fail merely because the candidate differs from
the last release.

### 5. Deliver the prevention through a real observed CI repair

Type: Behavior
Status: planned
Proof: Plan-recorded observer receipt with repository/run/attempt/SHA/job
identity; focused repair proof; repair commit and push; exact observer terminal
receipt with delivery/unread counts. If no real failure arrives, record this
proof as pending rather than manufacturing one.

Behavior: Given the preventive slices are delivered with one live Codex CI
observer → Open Dough CI reports an actionable failure → the coordinator
receives it, pauses and preserves concurrent work, repairs the legacy defect at
current HEAD, pushes the repair, resumes delivery, and closes only the recorded
observer.

This slice owns execution evidence for SEED-004 Story 5. The repair is triggered
by observed CI evidence and follows the asynchronous repair protocol; it is not
pre-implemented as part of this plan.

## Promise ownership

| Promise | Slice and proof |
| --- | --- |
| Client-payload changes have one editable source | Slice 1, representative AGENTS.md walk |
| Comparison logic is not copied into a third declaration | Slice 2, existing updater regression checks and code inspection |
| CI deterministically rejects self-installation drift | Slice 3, isolated checker scenarios plus `npm test` |
| Release finalization checks before any metadata or Git mutation | Slice 4, ordering check and behavior review |
| First real plan execution delivers and handles actionable CI evidence | Slice 5, live observer and repair/shutdown receipts |

## Learnings

- Commit `a8955b3` changed both installed `dough-update/SKILL.md` copies to the
  future 0.3.3 bytes while their records remained 0.3.2. A clean Git worktree
  therefore does not establish a certified installation.
- The ordinary updater correctly refused that state; the prevention belongs in
  Open Dough's source-maintenance and release workflow rather than weaker client
  update semantics.
- The forced 0.3.3 installation was committed separately as `7ecf24e`, restoring
  a clean starting boundary before this plan was written.
- Slice 1 representative walk: Layout table plus the new operating sentences
  send client-payload edits to `src/skills/<name>/`, keep internal skills in
  `.agents/skills/`, and update this repository's installed copies only from a
  released payload.
