# Trim the product backlog command to guided operations

**Identity:** SEED-423#trim-the-product-backlog-command-to-guided-operations
**Source:** [Trim the product backlog command to guided operations](../../seeds/SEED-423-shrink-the-installed-distribution.md#trim-the-product-backlog-command-to-guided-operations)

## Goal and scope

An agent can get from any supported backlog operation to its installed
procedure from the command synopsis and backlog skill. Keep the checked
reference and direction updates available. Reduce the shipped command
surface by removing repeated explanation, placing operation-specific inputs
and receipts with their handlers, and simplifying the shared story-state
implementation. Keep the result simple and cohesive: guidance changes are
concise instructions integrated into existing sections, scripts take the
simplest design that keeps the safeguards, and code, tests, instructions and
guidance the change leaves unreached are removed completely in the same
slice. Preserve published format and interpretation, public
operation forms and receipts outside usage, and existing write safeguards.
Git adapters, publication, installer behavior, backlog policy, and Dashboard
presentation are covered by their own work.

## Current decisions

- Retain `refresh` and `direction`. The former uses the canonical home's
  identity and checks that the old home released it. The latter compares
  the direction read by the caller inside the existing backlog write
  boundary. Reuse those rules, the existing placement and completion
  responsibilities, and the locks in `product-backlog-store.mjs`. A new
  mutation format would have to recover those same safeguards.
- Reuse the actual command dispatch and keep one option grammar. Give each
  operation a task entry in the skill or a linked reference, and keep the
  terminal synopsis to forms and where to get instructions. Derive or
  compare its verb coverage against dispatch without a second dispatcher.
- Reuse the pure reader behind `dashboard/src/storyPreparation.ts`, the
  digest and dependency-agreement code in
  `product-backlog-story-state-basis.mjs`, and the file operations in
  `product-backlog-story-state-home.mjs`. Consolidate shared schema
  validation and leave path and lock handling at the Node boundary. The
  digest, Markdown framing and CLI parsing have distinct responsibilities.
  Judge the reduction over all shipped scripts serving this responsibility,
  including renamed or moved code.
- [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires local guidance and scripts. [ADR 0006, Write skills for
  executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  governs one authoritative procedure and the installed audience.
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps published Git records authoritative and the Dashboard a reader.
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  supports the shared domain interpretation across the adapters.
- Follow the North Star topics [Make production code directly testable
  instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Exercise the maintained CLI and reader directly with existing fixtures.
  Keep the published-record browser proof at E2E and keep any added
  assertions at their owning boundary with the existing runner.
- Simplicity is an acceptance condition of every slice. Edit the existing
  section that owns a topic instead of adding a parallel one, and state each
  instruction once in direct terms. When a slice removes or relocates a
  responsibility, delete what only it reached in the same slice: functions,
  exports, modules, payload entries, tests and test support that only
  exercised them, and guidance or links that described them. Delete removed
  behavior without adding prohibitions about it. A special case that exists
  only to serve a removed path goes with it.

## Baseline and decisive premises

Observed at `85da369f7` in the owned preparation checkout, 25 November 2026,
Node 24.21.0 and Bash 5 on AC power. The root `install.sh --target <scratch>
--source "$PWD" --platform codex` installed the candidate source into a
disposable project. The installed CLI matched the source bytes.
Its `node .agents/skills/dough-product-backlog/scripts/product-backlog.mjs
--help` printed 194 lines. The synopsis lacked `discover-consumers` and
`visit-consumers`, and the installed guidance had no procedure naming
`refresh`, `direction` or `place`. The seven installed story-state
scripts totaled 36,317 bytes. The audit's line estimates are hypotheses for
reduction, with the actual change measured over the shipped files.

Focused runner observations used `env PATH="/opt/homebrew/bin:$PATH"
caffeinate -s -i bash scripts/test.sh <named paths>`. All 15 selected
Distribution jobs passed with 65 Node cases. The E2E command was
`env PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run --silent
test:e2e -- 'stories/story-readiness(-gaps)?\.spec\.ts$' --workers=2`.
All four selected Chromium cases passed.

| Consuming boundary | Observed result and proof consequence |
| --- | --- |
| Real CLI writes in a scratch project | The `product-backlog-refresh*`, `product-backlog-direction*`, `product-backlog-merge-direction`, and `product-backlog-place` checks exercised accepted changes, refused writes and preserved neighbors. Temporarily skipping the released-home check failed the old-home refusal case. Skipping the expected-direction comparison failed the stale expectation case. Both passed again with the original source. |
| CLI and startup read persisted facts | The six `story-state*.test.mjs` files, `story-dependencies-review-and-eligibility.test.mjs` and `workspace-publication-startup-readiness.test.mjs` observed round trips, stale refusal, sibling scoping, version handling, dependency eligibility and startup. Forcing `changedSinceReview` to false failed the CLI case that keeps Ready and reports a content change. Restored source passed. |
| Dashboard reads published CLI-produced records | The readiness and gaps specs exercise Git-revision bytes in Chromium and inspect the Board and story detail. The same scratch assessment change failed at the Board's missing “Changed since readiness review” text. Restoring the source passed all three cases selected in the gaps spec. |
| Installed guidance resolves its links | `Distribution/tests/installation/payload-declaration-links.sh` passed. The installed baseline shows why a representative procedure also needs to be followed to the real command. |

At `6210a17c5`, every non-Git `product-backlog*.mjs` export had a caller
outside tests, and each of the 15 dispatched verbs is named in installed
guidance. Dead code in this area is therefore what the slices themselves
create: the help prose, superseded handler plumbing and duplicate
story-state validation.

The scratch changes were reverted and `git diff --exit-code HEAD --
Distribution/src` passed.

## Slices

Execution uses the existing Story Branch workspace
`codex/trim-the-product-backlog-command-to-guided-opera` and publisher
`dashboard-territory.local-open-dough`. The Take `df44afa65896` is published
on `origin/main` and is the base of the slice publications on the story branch.

At each boundary trace the changed CLI forms, strings and imported symbols
through [consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
The local gate is the named Distribution checks and any reached Dashboard
specs below, post-change refactoring and ordinary commit hooks.
Use the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
with Bash 5 on PATH. Run long checks from an awake machine under
`caffeinate -s -i` on AC power. On battery, keep it awake with the lid open
under `caffeinate -i` and inspect the sleep log afterwards.
Apply the [failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

### 1. Find the checked operation for a backlog change

Type: Behavior
Status: done
Proof: Follow the installed skill from a new disposable project. For an
established canonical move, reach the real `refresh` invocation and observe the
entry's unchanged identity and position. For a developer-requested direction
update, reach the real `direction` invocation with its expected text and
observe the chosen text. Run `product-backlog-{refresh,refresh-refusals,direction,direction-refusals}.test.mjs`
and `payload-declaration-links.sh`. Map every dispatched verb to the
installed skill or a linked procedure, including queue placement and the
dependency discovery and visit pair.

Put move instructions with identity guidance and direction instructions with
the existing direction section. Reuse the current operation flags. Check
the representative use under the [skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
and keep the 249-line entry skill within the 250-line check by replacing
duplicated procedure. Fold the new routes into the existing sections and
delete any text they supersede. Record the guidance line count against the
1,091-line baseline of the skill and its four references. The existing
preparation and supplier references already name their operations. Estimated active effort 8–12 minutes.

Accepted proof: A fresh installation reached all 15 dispatch verbs through
the skill and references. The project compared complete backlog bytes after
a canonical move, direction update and stale refusal. The entry dropped from
249 to 238 lines and total guidance from 1,091 to 1,084. The focused runner
passed the named CLI and installation jobs, including refresh old-home refusal,
direction expectation refusal and explicit queue return coverage.

### 2. Keep the command adapters with the operations they describe

Type: Structure
Status: done
Proof: Compare receipts, exits and resulting bytes through the real CLI.
Run the reached `product-backlog-{place,take,refresh,refresh-refusals,direction,direction-refusals,complete*,done-catalog,write-safety,plan-link}.test.mjs`
and `product-backlog.test.mjs` files under `Distribution/tests/support/`
with the actual files expanded, plus the story-state write checks for a
moved recorder receipt. The current help remains available until slice 3.

Leave dispatch and shared path and option handling in the CLI. Put handlers
with their operation-specific inputs and receipts along the existing placement
and take, completion and catalog, and checked edit responsibilities.
Keep Node adapters outside the browser-shared modules. Keep the shared
placement reader for add and place and the existing write locks. This leaves
the entry point that slice 3 uses for the synopsis with dispatch and common
arguments in one place. Delete forwarding code, exports and tests that the
move leaves without a non-test caller. Estimated active effort 10–15 minutes.

Accepted proof: Compared the real CLI before and after the move using the
same scratch backlog and Git setup. All 20 paths matched exits, receipts
and complete planning files, including unchanged help and refusal text.
All 33 focused CLI, browser import, write safety and installation jobs passed.
The entry point dropped from 226 to 99 lines.

### 3. Get a short synopsis from the terminal

Type: Behavior
Status: done
Proof: On the installed CLI, `--help` succeeds and the synopsis names each
supported form, with a route to installed guidance. An unknown command and
a CLI parse error refuse without writes and show the same compact synopsis.
Check both entry paths and the two dependency forms missing from the baseline
with a focused CLI regression assertion, using the existing scratch fixture if
it already exposes the needed command. Confirm the old multi-paragraph
procedures are gone from terminal output and record the published help size
against the 194-line baseline.

Use one synopsis for both outcomes with enough syntax to identify the
operation. Existing references own the procedural detail. Delete the old
usage prose, the assertions that only checked it, and any guidance that
points readers to the terminal for procedure. Estimated active
effort 6–10 minutes.

Accepted proof: The fresh installed CLI showed a 26-line synopsis, down
from 194, with all 15 dispatched operations and 34 options. Unknown command
and parse-error exits shared the help bytes and preserved the scratch planning
files. All 19 focused jobs passed, and the three synopsis regression cases
passed after the independent test review.

### 4. Ship a smaller story-state implementation with one schema

Type: Behavior
Status: planned
Proof: Compare the total installed bytes for story-state against 36,317,
including relocated code. Run the six `story-state*.test.mjs` files and the
dependency and startup cases in the baseline, plus affected supplier and
Dashboard readers from the consumer trace. Keep the existing readiness E2E
command. The CLI and browser must agree on the recorded judgment and
changes since review, and a stale write must leave the record intact.

An installed recorder and the Dashboard read the same version 1 story-state
record, including distinct plan, planless and canonical-plan cases. A sibling
edit keeps the first story's basis and its own edit changes that basis without
replacing its judgment. Preserve unsupported and missing record outcomes.
Use a single browser-safe schema owner for preparation and assessment
validation and the existing file adapter for loading and writing. Keep the
pure basis and fence helpers where the other readers use them, preserving
their import boundary. Replace the internal filename assertions in
`story-state.test.mjs` if they obstruct consolidation, retaining the
browser-safety and reader contract assertions. Delete each validator,
module and test the single schema supersedes, and check with a search that
no shipped script, Dashboard source or test imports a removed name. Estimated active effort
10–15 minutes.

## Preparation assessment

Slice-plan refinement was unnecessary after checking that each slice has one
observable result or directly enables the following behavior. The command
uses the existing rule owners from guidance through the CLI, and both consumers
of story-state share the same record meaning. Four slices fit the limit,
with no remaining slice-specific concern identified in preparation.
