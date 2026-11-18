# Share one Frontend arrangement of an agent executing Open Dough's Taken story

**Identity:** SEED-334#share-one-executing-agent-roster-arrangement
**Source:** [Shared executing-agent roster arrangement](../../seeds/SEED-334-product-wide-end-to-end-tests.md#share-one-executing-agent-roster-arrangement)
**Source review:** [source-review.md](source-review.md)

## Correction input

- **Provenance:** execution retrospective of
  SEED-334#retire-integrated-ui-test-and-its-documents (plan 688, commits
  `c2f93725c`, `393bcef68`, `06856c8ce`, `6b0aa3eda`). Slice 1 (`c2f93725c`)
  added `publishRosterStory`; its refactor pass and slice 4's both named the
  duplication and left it as a follow-up.
- **Current finding (at `6b0aa3eda`):** `publishRosterStory`
  (`dashboard/tests/support/frontendStoryUrlDestination.ts`) and `openRoster`
  (`dashboard/frontend-tests/stories/agent-roster-collection.spec.ts:33`) each
  build Open Dough's `roster` revision with the Taken story
  `SEED-021#identify-taken-work-owner` ("See who owns Taken work"), one agent
  profile executing it on trunk `origin/main` through Claude, and the
  described revision `"b3".repeat(20)`, published with
  `putFrontendPublished` + `backlogApart`. They differ only in the agent's
  name (Akiho, Yui) and `openRoster`'s optional `.planning/open-dough.json`
  file. Impact: a change to that arrangement needs coordinated edits in two
  places that can silently diverge.
- **Outcome:** one arrangement, parameterized by agent name and optional
  files, serves both journeys.
- **Preserved:** every assertion and step of `story-url-destination.spec.ts`
  "opening the roster…" and of `agent-roster-collection.spec.ts`; each
  journey's agent name and settings variations; no product change.
- **Constraints:** follow the MakeMe and page-object conventions the test-entry
  selector chooses for both specs; no edited code file over 250 lines; default
  timeouts, never `test.slow()`.

## Ordered slices

### 1. Publish the executing-agent roster from one arrangement
Type: Structure
Status: done
Proof: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts stories/agent-roster-collection.spec.ts navigation/story-url-destination.spec.ts --reporter=list --workers=2`,
`npm run lint`, `npm run --silent typecheck:dashboard`; consumer trace of the
moved arrangement. Behavior is unchanged, so no scratch break is needed.

Change: move the shared arrangement into one owner (a MakeMe builder step or
a Frontend support function, whichever the selected convention prefers) and
have both callers use it; delete the duplicate.

Accepted proof: `publishExecutingRoster(services, agent, files?)` in
`dashboard/tests/support/frontendExecutingRoster.ts` (a Frontend support
function, since the arrangement ends in the harness publish) serves both
journeys; `publishRosterStory` deleted. The slice proof command, run with the
group's strict proof record instead of `--reporter=list`, selected 8 cases,
all expected; lint and typecheck passed. Consumer trace: no other consumer of
the moved arrangement; `story-url-destination-unavailable.spec.ts` keeps the
unchanged `answerSharedStoryProjects` (typecheck). Refactor pass: no change.

## Decisive premises and observations

| Premise and consuming operation | Result and remainder |
| --- | --- |
| P1. Both journeys pass before the change (slice 1 baseline). | At `6b0aa3eda`, 2026-11-18: the slice 1 proof command gave 8 passed (3.5 s). |

Refinement: not needed; one Structure slice in two files.

Remaining slice-specific concerns: none identified in this review.

## Execution complete

Product advice: no change. The one owner, `publishExecutingRoster`, serves both journeys; no correction or queue change follows.
