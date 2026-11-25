# Publish to trunk through one loop

**Source:** [SEED-423](../../seeds/SEED-423-shrink-the-installed-distribution.md#publish-to-trunk-through-one-loop)

**Identity:** SEED-423#publish-to-trunk-through-one-loop

## Goal and scope

Use one exact-revision publication loop for delivery, reviewed landing, resume,
execution startup claims and session records. Shrink installed scripts and
their tests. Integrate shorter instructions into existing guidance while
preserving the actions agents take.

Preserve current command and API contracts, caller-specific proof and ownership
checks, and recoverable Git state. Preparation's session close is an existing
consumer. Preparation assignment, separate story-branch creation, release, CI
ownership, and Dashboard feature changes are outside scope.

## Current decisions

- Extend [publication Git](../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs)
  and its bounded transport with one publication loop. Keep fetch, exact-SHA
  push, confirmation and retry sequencing together. Keep suffix replay, merge
  construction, startup claim reselection, and retained-candidate checks with
  their callers. Reuse [backlog reconciliation](../../../Distribution/src/skills/dough-execute-plan/scripts/owned-suffix-reconciliation.mjs)
  and [landing capture](../../../Distribution/src/skills/dough-execute-plan/scripts/dashboard-landing.mjs).
  The Dashboard's Git reader has a separate read-only lifecycle.
- Preserve each caller's acceptance rule. Fresh increment and integration
  confirm the exact target, while interrupted resume and startup can recognize
  containment. Resume sends the retained candidate at most once with rewriting
  disabled. Retry-capable paths stop after the second rejection. Preserve
  timeout stages, the uncertainty of an unanswered push, and the distinct
  facts of remote acceptance, capture, and local maintenance.
- Follow [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  for direct domain mapping and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for remote authority and independent capture and refresh. Follow
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
  [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  and [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for a self-contained payload, one authority per rule and appropriate evidence.
- Follow the North Star's [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [runner boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Exercise the existing commands and APIs with local Git fixture repositories.
  Remove redundant tests and support when a retained test observes the same
  promise. Apply the repository's MakeMe and browser page-object selection
  before editing tests.

## Outside-in proof

Local gate on macOS follows [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
For long runs, start fully awake and use `caffeinate -s -i` on AC power. On
battery, plug in or start fully awake with the lid open under `caffeinate -i`
and read the sleep log afterwards. Apply the shared
[failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use Bash 5 on PATH with `bash scripts/test.sh <focused paths>`. Trace affected
installed CLI and API consumers at each slice. Run reached Distribution and
Dashboard checks, including the loaded CLI and receipt readers. Use existing
hosted CI gates after delivery.

| Promise | Owning slice and observation |
| --- | --- |
| Resume recognizes an accepted ancestor or tries the retained SHA once while preserving the comparison and local commits | 1. `publication-resume{,-comparison,-story-branch}.test.mjs` and `execution-increment-managed-delivery-resume{,-transport}.test.mjs`. Inspect accepted SHA, target, push count, preserved commit identity, timeout stages and the observer receipt. |
| Delivery handles a moved target, conflict, failed proof, second rejection and uncertain acceptance | 2. `publication-racing-suffix{,-replay}.test.mjs`, `execution-increment-publication-{reconciliation,confirmation}.test.mjs` and `execution-increment-managed-delivery-{transport-push,reconciliation-stops}.test.mjs`. Inspect target, rewritten SHA and base, serialized stop fields, preserved state and bounded Git processes. Run the Dashboard capture and recovery readers that receive the retained pair and reporting-only retry. |
| Reviewed landing preserves published history and retries on the new tip | 3. `closure-story-integration.test.mjs` and `history-preserving-landing-expectation.test.mjs`. Inspect both histories, branch restoration, the accepted comparison and zero pushes on rerun. Keep alternate-target and later-publication proof. |
| Claim races preserve ownership, source and provenance | 4. `workspace-publication-startup-race.test.mjs` and reached startup/admission checks through the real command. Inspect Taken entries, winner provenance and losing recovery state. Preserve the separate story-branch publication checks. |
| Session close resumes its outstanding stage after acceptance | 5. `session-record-publication.test.mjs`, `session-close-resume.test.mjs`, `preparation-session-record-land.test.mjs` and `preparation-assignment-landing-retry.test.mjs`. Inspect the work and record commits, original comparison, session identity and no duplicate work push. Retain the rejected record push and byte-conflict cases. |
| Agents can follow shorter guidance and the shipped scripts and tests shrink | 6. Apply the [maintainer behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review) to a fresh increment, a reviewed published prefix and an interrupted candidate. Walk the installed instructions from request through command, result and next action. Run `payload-declaration-links.sh` and the credential-free `git-publication-native-entry.sh` for the installed route. If resolving a consequential risk requires a native session, follow ADR 0005 and the [existing publication evaluation](../../../Distribution/evaluation/acceptance.md). |

### Reduction evidence

Use `git diff --numstat --no-renames <before> <after>` to sum additions minus
deletions across the story. Include new files, helpers and moves and exclude
unrelated trunk changes. Net installed guidance lines must be at or below
zero. Fold shared rules into existing files and remove repeated decisions and
recipes. Script lines and test lines must each decrease. Count executed cases
in the affected publication test family before and after, including deleted,
replacement and renamed suites. Use `OPEN_DOUGH_TEST_CASE_OUTCOMES` for the Node
cases. Show fewer cases and map each retired duplicate to a retained
observation with the same promise.

At `61862a7f3`, the seven publication guidance files inspected have 1,135 lines
and the eleven modules named by the audit, including the delivery adapter,
have 1,829 lines. The tracked Distribution inventory has 14,140 guidance and
configuration lines, 36,922 script lines and 125,590 lines under
`Distribution/tests/`. These are newline counts for the paths from
`git ls-tree -r --name-only`. In `Distribution/src/`, guidance and configuration
use `.md`, `.json`, `.toml`, `.yaml`, `.yml` and `.txt`, and scripts use
`.mjs`, `.sh` and `.bash`. The story diff includes any added format or moved
code when judging shrinkage.

### Preparation evidence

At `61862a7f3`, 70 Node cases in 19 files passed (52 publication, 7 session
close and 11 managed delivery cases). Both shell checks passed. The tests
used shipped modules and local fixture remotes under Node 24.21.0, Git 2.50.1
and Bash 5. Run from the repository root with Bash 5 first on PATH.

```sh
bash scripts/test.sh \
  Distribution/tests/skills/dough-execute-plan/{execution-increment-publication-confirmation,execution-increment-publication-reconciliation,publication-racing-suffix,publication-resume,publication-resume-comparison,publication-resume-story-branch,publication-transport-bound,history-preserving-landing-expectation,workspace-publication-startup-race,execution-increment-delivery-target}.test.mjs \
  Distribution/tests/skills/dough-story-wrap-up/closure-story-integration.test.mjs \
  Distribution/tests/skills/dough-land/session-record-publication.test.mjs \
  Distribution/tests/skills/dough-story-refinement/{preparation-assignment-landing-retry,preparation-session-record-land}.test.mjs
bash scripts/test.sh Distribution/tests/skills/dough-land/session-close-resume.test.mjs
bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/execution-increment-managed-delivery-{resume,resume-transport,transport-push,reconciliation-stops}.test.mjs
bash scripts/test.sh Distribution/tests/installation/payload-declaration-links.sh
OPEN_DOUGH_TEST_DIR=Distribution/evaluation/tests bash scripts/test.sh \
  Distribution/evaluation/tests/git-publication/git-publication-native-entry.sh
```

A scratch no-op in `pushExactRef` made `publication-racing-suffix`,
`publication-resume`, `workspace-publication-startup-race`,
`closure-story-integration` and `session-record-publication` fail. The remote
could no longer confirm the expected increments and reviewed landings. Startup
and session close failed to produce their published outcomes. The edit was
reverted before the preparation record write.

The audited implementation and delivery files are at most 242 lines.
`trunk-publication.md` is 248 lines. Keep the new loop and its caller policies
cohesive under the repository's 250-line check and shorten the shared guidance
through removal of repeated procedure.

## Slices

Execution runs in Story Branch Mode in the owned
`.worktrees/publish-to-trunk-through-one-loop` checkout of
`/Users/terryyin/git/open-dough`. Eimi-chan uses publisher
`dashboard-territory.local-open-dough` on `codex/publish-to-trunk-through-one-loop`.
The starting revision is `5725720cc44c7a46dcb31b8dbf2d8a1b069630dd`.
The Take `a260b60c349ad6db02fc5b1df5b4834fe029f83d` was accepted by
`origin/main` and `origin/codex/publish-to-trunk-through-one-loop`.
The Codex `eimi-chan-seed-423` observer watches the story branch on
`terryyin/open-dough` with GitHub Actions `ci.yml`, cell `g243:11`,
session `71138`, directory `/tmp/dough-ci-501/watch-I57KEb`, and PID `19804`.
Slices 1–3 were accepted there at `ef4a3644109c4bd008db80375ca339fe1b7963a8`,
`50ad2d9858a496d78f09c4bcc83351edaf9aa977` and `e8b93bf32dcb0bbb492952bb3d47d72a929b2aa4`.

### 1. Resume through the exact-candidate loop

Type: Behavior
Status: done
Proof: Resume and retained-comparison cases above.

The 77 reached Distribution cases and Dashboard installed CLI check passed.
Local transport probes also observed one acknowledged push at confirmation
timeout, then recovery with zero additional pushes, and one push on rejection.
A direct-resume probe verified invalid targets are refused before transport.

When reopening a retained candidate, share bounded fetch, exact push and
confirmation with a single-attempt policy. Preserve its base, no-push
acceptance, invalid comparison refusal, and timeout and push facts. This
initial loop serves resume until slice 2 adopts it.

### 2. Deliver a validated increment through the same loop

Type: Behavior
Status: done
Proof: Racing suffix, affected proof, delivery receipt and Dashboard capture cases above.

The matched preparation selection passed 69 cases in 19 files, down from 70.
The managed second-rejection case now observes the exact once-rewritten work
and affected proof previously covered by the duplicate direct case.

When a validated increment meets a moved target, prepare its owned suffix
with the existing reconciliation. Retain the comparison before each push,
confirm the exact target and allow one race retry. Delete the superseded
sequencing and tests for duplicate transport behavior. Forward the publisher
result through delivery while preserving its serialized receipts and defaults.

### 3. Land a published prefix through the same loop

Type: Behavior
Status: done
Proof: History-preserving integration and landing expectation cases above.

The 204 Distribution cases, 16 Dashboard and E2E files, and five probes passed.
The probes verified final-rejection state and exact authorized live-tip confirmation.

When the reviewed tip has published history, use the existing merge strategy
to prepare or recompute the merge on fetched trunk. Preserve ownership and
proof rechecks, conflict recovery, accepted comparison and return to branch.
Delete its separate retry loop.

### 4. Publish an execution claim through the same loop

Type: Behavior
Status: done
Proof: Competing startup and admission checks above.

The 214 Distribution cases and 15 Dashboard and E2E files passed. Two CLI
probes verified live-descendant confirmation and no retry after accepted timeout.

When a startup competes for trunk, let existing claim policy check remote
membership and provenance and reselect or replay as needed. Share the
publication sequence while retaining the claim recovery receipt and source
refusal. Delete the superseded claim loop.

### 5. Close sessions through the shared publication path

Type: Behavior
Status: planned
Proof: Session-close and preparation-landing cases above.

After work is accepted, publish its immutable record with its retained identity
and byte-conflict check. Use the loop's remote observation for record handling
where it supplies the same fact. If publication stops between the work and
record commits, recover the outstanding stage. Remove dead code and duplicate
tests whose last consumer moved.

### 6. Give agents concise publication instructions

Type: Behavior
Status: planned
Proof: Installed guidance review, payload check and final size and case counts above.

After the callers share the loop, fold common rules into the existing guidance.
Keep entry-point choice, authorization, ownership, validation, result-specific
recovery and the landing evidence handoff where agents need them. Remove
repeated rules and obsolete recipes and verify the guidance, script and test
deltas.

## Story obligations

### G1. Invalid retained target reaches Git transport

Reported: slice 1 — "Direct resume currently fetches before rejecting a non-branch target."
Story clause: "receipt and stop contracts."
Disposition: proved by slice 1: `s1-target-refusal-after.log.run.json` in the checkout evidence shows zero transport calls and an unchanged tracking ref through the installed resume API.

## Plan review

Slice-plan refinement was unnecessary. Each boundary migrates one caller's
publication with focused proof, followed by the guidance review. The shared
loop handles only differences those callers require. No remaining slice-specific
concern was identified under the 15-active-minute limit.
