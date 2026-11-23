# Install only scripts that guidance, hooks or the Dashboard reach

**Identity:** SEED-423#remove-unreached-distribution-code
**Source:** [Install only scripts that guidance, hooks or the Dashboard reach](../../seeds/SEED-423-shrink-the-installed-distribution.md#remove-unreached-distribution-code)

## Goal and scope

Remove confirmed test-only surfaces from fresh installs and tagged updates.
Keep the supported paths and scope limits in the source story.

## Current decisions

- [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires one complete, standalone payload across the native layouts. Keep
  current payload declarations and tagged-baseline verification. Remove paths
  and their declarations together. Keep installer support reached by
  `install.sh`, the documented pre-apply release recheck or the Dashboard.
- [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  supports deterministic installed-route checks for this cleanup. Use both
  installed roots and the Cursor and Codex shared-root entry context where
  the installer fixture already supplies it. Apply the maintainer
  [behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
  to changed guidance.
- Keep one implementation per responsibility. The mailbox already runs
  `watchCiExecution`, the shared test-entry runner already selects MakeMe
  and page-object rules, and the backlog Git adapters already call
  `mergeBacklogs`. Use those owners. Reuse `flagValues`, `isAncestor` or
  `stopped` on touched paths when the inputs and failure semantics match.
  The [North Star's testability direction](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  favors proving the real command with a controlled Git remote, clock or CI
  backend. Reuse existing fixture data and test controls.
- The common removal rule is to trace the shipped entry and each candidate's
  consumers before cutting it. Include indirect imports, dynamic paths, hook
  fragments, generated exports, package lists, Dashboard and maintained
  repository commands. Trace current evaluation assessors separately from
  historical transcripts. Record the active contract for each retained candidate.

## Outside-in proof

| Promise | Owning proof |
| --- | --- |
| Clean install and tagged update omit retired scripts in both native roots, advance the version and preserve local guidance and configuration | Slices 1 and 2 add the retired paths to the existing fresh install and tagged removal checks. Slice 5 owns release inspection and application. |
| Guided start, stream, hook delivery and completion still observe exact CI revisions | Slices 1 and 3 use the installed observer and host commands, including a symlinked invocation and host-owner checks. |
| MakeMe source and changed selection return the same rules and the current calls satisfy native assessors | Slice 2 uses the installed unified selector and the deterministic MakeMe evaluation harnesses. |
| Git reconciles backlog changes and preserves stops using the same policy | Slice 4 drives the real merge hook and clean and conflicted adapter flows. |
| A retained accepted closure registers once on its own live observer without pushing again | Slice 6 runs installed `trunk-closure.mjs finish` and exact-resume checks. |
| Delivery, recovery and the execution tools keep their guided success and stop results | Slices 7 and 8 drive the retained commands with local races and controlled times. |
| No confirmed test-only path, command or export remains in the candidate inventory | Each slice repeats its consumer trace on the resulting change. Slice 8 reconciles all slice dispositions and checks the complete declaration and import graph for removed paths. |

## Observed premises

At `6d83367e9` in the owned preparation checkout on 2026-11-23, the
repository runner with Homebrew Bash 5 and Node 24 passed these focused
baseline checks. Installation and lifecycle fixtures use local tagged
repositories, local remotes and simulated CI. The checked-in source supplies
the installed payload in the fixtures.

| Consuming operation | Observation and result |
| --- | --- |
| Observer startup, host delivery and default GitHub fallback (1, 3) | `ci-mailbox-launch`, `ci-command-adapter-cli`, `ci-host-hook` and `ci-background-handoff` passed. The first runs the mailbox launcher, hook and stop. The second still drives the wrapper and identifies the adapter-discovery and symlink cases to move to the mailbox route. |
| Rules selected from an updated standalone install (2) | `test-entry-rules-installed` passed. The fixture installs and updates without project packages, checks preserved project configuration, and reads the installed selectors for selected sources and changed paths. |
| Git invokes the backlog reconciliation policy (4) | `product-backlog-git-merge-hook`, `product-backlog-git-rebase-clean-accepted` and `product-backlog-git-cherry-pick` passed. They enter Git with a real merge driver or the adapter command, including clean reconciliation. |
| Installed bytes, tagged removal and the inspection recheck (1, 2, 5) | `install-public-payload.sh`, `update-removes-dropped-files.sh`, `install-latest-release.sh` and `pin-and-inspect.sh` passed. They cover native roots, the old declaration's leftovers with project files beside them, latest selection and the `resolve-url` recheck before writes. |
| Recover an accepted final closure through its real owner (6) | `trunk-closure-resume` and `trunk-closure-rebased-rerun` passed. The Codex owner check passed on the baseline. A scratch exception in the already-accepted, missing-receipt registration arm caused that installed `finish` check to fail at its exit assertion and was reverted. `trunk-closure-settlement.mjs` supplies `[accepted]`, with a live observer, to reach that arm. |
| Managed resume lifecycle, contention and guidance CLI routes (6–8) | `execution-increment-managed-delivery-resume-lifecycle`, `publication-racing-suffix`, `wait-for-publication`, `consumer-trace`, `slice-clock`, `story-obligations` and `ci-proof-leads-cli` passed. The final check exercises the repository fallback and its diagnostic when origin supplies no identity. |
| Retained seams for observation and races (1, 7, 8) | A real mailbox start without a budget positional observed a fixture failure and acknowledged stop. Installed delivery and replacement completion passed with a scratch edit dropping the duration and alias at command ingress, equivalent to omitting them at the request boundary. The real publisher with only `beforePush` advanced a local remote at attempts 0 and 1, reported `persistent-contention` and preserved the rival tip. The guided publication wait using a short deadline and the default interval detected a file published after its initial fetch. The clock-controlled completion budget and continued wait baseline checks also passed. |

## Local gate

Run each slice's focused checks with `bash scripts/test.sh <paths>` using
Bash 5 or newer. Run on an awake Mac on AC power with the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
`caffeinate -s -i`. On battery, use the linked awake, lid-open `-i` procedure.
Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and the repository's [test automation rules](../../../AGENTS.md#test-automation).
Keep the [commit hook](../../../.githooks/pre-commit) in force for staged
lint and script-related Dashboard typecheck.

Trace candidate terms before editing and repeat with
`consumer-trace.mjs --checkout "$PWD" --base HEAD` on the diff. Include
unchanged fixtures and indirect callers. Keep dispositions and focused proof
with the slice. Run the Distribution and evaluation suites after all slices
because the payload and evaluation fixtures both change. Target CI owns the
broader repository suite.

## Slices

### 1. Start the installed CI observer without a standalone wrapper

Type: Behavior
Status: planned

When a project starts or streams a mailbox, it uses its configured CI and
keeps the existing owner, stop and completion receipts. Move wrapper-only
test imports to `watch-ci-execution.mjs` and wrapper subprocess tests to
the mailbox CLI. Retire `watch-ci.mjs` and its payload entry. Remove the
mailbox CLI's budget positional once short test deadlines use the existing
controlled observation budget. Retain the guided `--execution` token and
compatibility for persisted request readers. Keep named-operation validation.

**Proof:** Run affected watcher tests, `ci-command-adapter-cli`,
`ci-github-acquisition`, `ci-mailbox-launch` and budget/stop variants. Check
direct and symlink entries, GitHub fallback, configured provider discovery,
exact revision outcome and normal shutdown. Assert that the two installed
roots lack the wrapper after fresh install and update from a declaring tag.

### 2. Select MakeMe rules through the shared installed entry point

Type: Behavior
Status: planned

Given mixed locations and changed test paths, `test-entry-rules --source`
and `--changed` still return the relevant MakeMe and page-object rules.
Retire the two MakeMe CLI wrappers and `selectMakeMeEntries`, keep the shared
matcher and location rules, and regenerate the installed selector bundle
using `scripts/build-test-entry-rules.mjs`. Update each current MakeMe
assessor to recognize the guided command shape.

**Proof:** Run `test-entry-rules-installed`, changed and compatibility checks,
the affected `makeme` suite and the two deterministic MakeMe harness tests.
Check the generated bundle with the builder's `--check` option. Inspect both
native roots and declarations for absence of both wrappers and verify the
matched rules in the installer fixture.

### 3. Keep only used exports at the installed module boundaries

Type: Behavior
Status: planned

When callers deliver CI events, run hooks or attribute a session, the current
entry points still serve those uses with the audit's test-only exports
private or removed. Trace `deliverCiEvents`, `deliverHostBoundary`,
`standaloneSessionWorkflow`, `configureDeclaredAgentAuthorship`, the mailbox
and background hook/handoff re-exports, and module-private declarations.
Trace Git adapter exports with Slice 4. Keep exported helpers with an actual
runtime caller. Group changes by owning module and remove imports serving
only a retired export.

**Proof:** Run the affected CI hook/handoff and mailbox proofs, session record
and authorship tests. Confirm the hook is invoked in the installed layout and
retains its output. Recheck removed names against runtime imports, including
dynamic imports and Dashboard use. Move narrower unit checks to the
remaining owner only where they still prove a distinct contract.

### 4. Reconcile backlog changes through the Git adapters alone

Type: Behavior
Status: planned

Given diverging changes to queued or taken work, real Git still reconciles
them through the driver and adapters. Remove the test-only backlog `merge`
verb, `reportMerge` and unused adapter re-exports. Let `mergeBacklogs` consume
text from the driver, candidate and aggregate callers. Keep Git stage reads,
missing-file meaning and refusal/write boundaries at the adapters.

**Proof:** Run backlog merge policy cases through the text boundary and the
driver lifetime, merge hook, clean/conflicted merge, rebase, cherry-pick and
done-catalog reconciliation journeys through Git. Verify the retired command
does not dispatch and inspect preserved ordering, ownership and conflict
results, including the clean merge path.

### 5. Apply releases through the supported installer commands

Type: Behavior
Status: planned

An inspected same-tag source still goes through `resolve-url`,
`validate-checkout` and installation. The Dashboard keeps `apply`. Remove
the test-only CLI dispatch of `compare`, `destination`, `fetch-release` and
`pin-latest`, and standalone payload `copy`. Keep internal version,
destination and fetch functions needed by release apply, `compare-payload`
and `copy-then-match`. Arrange the inspected checkout as a test precondition.
Preserve release mismatch and byte verification.

**Proof:** Run `pin-and-inspect.sh`, `install-latest-release.sh`,
`install-all-tools.sh`, `compare-payload.sh`, copy-failure and update refusal
checks. Run the Dashboard worktree release apply checks selected by the trace.
Check release selection, installed files, project config and refusal before
writes. Keep comparisons at the shared version function where they need a
direct unit boundary.

### 6. Resume the exact publication and register where the owner needs it

Type: Behavior
Status: planned

On resuming a published candidate, remove the test-driven published identity
list, count and bookkeeping obligation. Observe the exact accepted SHA and
keep its comparison evidence. Keep registration in the caller that owns the
observer. Preserve trunk closure's missing-receipt registration for its
selected live observer, ordinary resume's registration and an accepted
candidate's no-push path. Align the recovery reference with those owners.

**Proof:** Run `publication-resume*`, managed resume lifecycle and owner
checks, session close and installed `trunk-closure-codex-owner`, resume and
rebased rerun checks. Inspect target and push counts alongside the observation
and unchanged foreign or already-covered mailbox. Use an old accepted
candidate with a live observer missing its receipt.

### 7. Deliver and complete without test-only option transport

Type: Behavior
Status: planned

On delivery, resume and completion, use the existing host runtime order and
observation budget. Remove the test-only alias and external duration inputs
across delivery, completion and closure, and publisher callback fields whose
callers are only fixtures. Preserve on-target registration, the exact
candidate, and single retry. Keep the used `beforePush` and ownership/proof
callbacks. Use the existing attempt callback, a transport hook or the
advanced local remote to arrange contention.

**Proof:** Run managed delivery and completion recovery checks with controlled
clock or observer inputs, and run the racing suffix and queued one-shot race
checks. Inspect one retry and the preserved candidate after a second
rejection. Check host fallback, terminal outcomes, coverage gaps and receipt
registration through installed commands.

### 8. Use the guided execution utility options

Type: Behavior
Status: planned

Agents tracing a diff, recording obligations, reading the current slice clock
or waiting for a supplier use the guided forms. Drop `consumer-trace --path`,
`story-obligations record --commitment-field`, `slice-clock status --identity`
and `wait-for-publication --interval-seconds` after moving any distinct proof
to the maintained input. Keep the other verbs' identity and obligation
fields, ref/path watching, continuation and deadline defaults. Close out
the candidate trace and recheck payload import closure.

**Proof:** Run consumer trace, documented/source-review obligation, clock
status/continuation and both publication-wait suites. Observe base-derived
paths and terms, obligation receipts, active/ended clock state and a ref/path
publication versus deadline. Control test timing without adding another
public switch. Check retired arguments against the resulting CLI boundary.

## Readiness review

Plan refinement was unnecessary. The eight slices keep proof with the
surviving command or module contracts and isolate publication registration
from option transport. Existing fixtures exercise the proposed observation
and race boundaries. No slice-specific readiness concern remains.
