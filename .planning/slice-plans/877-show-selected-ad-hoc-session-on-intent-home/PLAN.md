# Show the selected ad hoc session on Intent Home

**Identity:** SEED-418#show-selected-session-in-review-home

**Source:** [Show the selected ad hoc session on Intent Home](../../seeds/SEED-418-review-published-session-changes.md#show-selected-session-in-review-home)

## Goal and scope

Show which ad hoc session is selected and what it was asked to do above the
CI comparison on the story's Intent Home. Cover retained launches, including
those with no instruction, and published sessions without a local launch.
Whole story and other workflow scopes use the usual Home. The picker layout,
new published metadata, review status, and comparison semantics are outside
this story.

## Current decisions

- Consume the session scope Intent's compact **Review scope** dropdown
  selects (`useStorySessionScope`) and the session that
  `storySessions` in `followUpSessions.ts` resolves for its key, with the
  retained launch and published record already joined by UUID. For a
  retained-only session, identify it by its host and session ID. Keep no
  separate Home selection or metadata cache. Keeping the chosen scope when
  the reviewer returns Home is this story's promise, not the supplier's;
  slice 1 proves it.
- Name an ad hoc session without a retained launch "Title unavailable", as
  the Review scope dropdown already does, so Home and the dropdown agree.
- Taken SEED-418#keep-session-review-proof-after-retirement moves the
  story's session list out of Follow up's module and resets the scope on
  reselection; Taken SEED-418#announce-compact-dropdown-choice changes the
  dropdown's accessible value. Before editing, check `git log` on fetched
  trunk for the session list, scope hook and dropdown files, and build on
  whatever has landed.
- Reuse the retained request title and Ad hoc workflow label exposed by
  `launchSubject`. Read `request.instruction` from the same launch, as
  `followUpContext.ts` does for its original request. Render the original
  text as text with line breaks. A blank request gets the unavailable
  message. A published-only session has its workflow and UUID, so show
  those with an explicit unavailable title and instruction. The published
  record reader and contract already supply those facts.
- Use `IntentStoryEvidence`, the story Home owner shared by active and
  completed story views through `IntentPage`. Put the details before the
  evidence in the scrollable CI comparison panel so a long instruction and
  the comparison can be read in the same pane. Derive the details from the
  selection even when comparison results are loading or unavailable.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps the session and comparison in one Intent scope and distinguishes
  machine-local launch evidence from published progress.
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
  calls for Home to keep the comparison and selected session intact.
- Use the existing mounted Intent entry and typed build data under
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Move no published reads or refresh responsibilities.

## Decisive premises

Observed in the owned worktree at `bae6287ee` on 27 November 2026.

| Premise | Consuming operation and observation | Result |
| --- | --- | --- |
| A completed launch listing preserves the original request and title and can be associated with its published record. | Node 24.21.0, `node --input-type=module`. Passed a completed ad hoc launch with a distinctive title, multiline `request.instruction`, different composed `firstInput.instruction`, and reporting reference through the production `sessionListing`, `launchSubject`, and `reportingReferenceOf` functions. Read the matching published record `01a20d2f-9272-7033-a4e5-7af8d6ac517d` via `publishedRecordFromText`. | The listing yielded the exact title and request, the Ad hoc label, and the matching published UUID. The composed input was absent from the listing. The parsed published record carried no title or instruction. |
| Story Home can keep its CI comparison through scope changes. | The mounted Done story in `intent-story-compare-evidence.spec.ts` renders the CI comparison, changes the landed run, checks which builds the pane measures and restores Published completion. Ran the baseline command below. | Both evidence cases passed. The session scope itself is the recorded supplier dependency. |

Baseline command on awake macOS on AC power:

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard:frontend -- dashboard/frontend-tests/intent/intent-story-compare-evidence.spec.ts dashboard/frontend-tests/sessions/recently-done-card-membership-mount.spec.ts
```

Seven cases passed across both files. The Done-card cases also observed a
published and retained follow-up listed once and the existing follow-up
composer's original-request field. The new proof uses the supplier's actual
session selector to observe Home.

Rechecked at `3e6d25262` on 27 November 2026, after the compact dropdown and
ad hoc titles landed: `launchSubject`, `sessionListing` and
`IntentStoryEvidence` are unchanged since `bae6287ee`. The baseline command
with `dashboard/frontend-tests/intent/intent-session-scope-titles.spec.ts`
added passed all nine cases, including a published-only ad hoc session
named "Title unavailable" that still selects its own comparison.

## Ordered slices

### 1. Read the selected ad hoc session on Intent Home

Type: Behavior
Status: planned

Behavior: A story has completed ad hoc sessions → the developer selects one
and opens Home → the title, Ad hoc workflow, session identifier and original
instruction appear ahead of the CI evidence. Selecting another session changes
the details. Opening a file then returning Home keeps the chosen session.
A missing instruction is explicit, including for a published-only selection,
and the CI comparison remains accessible. Whole story or another workflow
returns the usual story Home.

Proof: Use mounted Vitest beside the Intent story comparison specs. Supply
typed retained `LaunchRecord` and `PublishedSessionRecord` inputs at the
existing machine and published-work reads. Stub only the reads needed for
the story, session comparison, and CI evidence. Drive the actual scope
control and Home, with distinct titles and original instructions so showing
another session's data fails the check. Use a multiline instruction distinct
from the composed input. Observe that both the selected session details and
CI evidence are visible in order. Include a published-only ad hoc session,
a retained session with blank or absent instruction, and a different
workflow. Exercise the no-comparison state using the supplier's retained-only
session path. Keep existing whole-story comparison checks passing.

## Proof ownership and local gate

| Promise | Proof in slice 1 |
| --- | --- |
| Correct title, Ad hoc workflow, session ID and original request above CI | Open Home with a chosen follow-up, then switch to a follow-up with different details and verify the old details disappear. Check the original multiline request and the rendered order. |
| Home keeps the chosen scope across file reading | Open a changed file and activate Home. Observe the same session details and CI pane. |
| Unavailable metadata is explicit and CI stays accessible | Select a published-only session with an empty retained history and observe its UUID, unavailable title and instruction, and CI. Select a retained session with a title and a blank or absent request and observe its instruction fallback and the existing evidence state. |
| The usual Home returns outside ad hoc scopes | Choose a different workflow and Whole story. Observe the ordinary CI pane and absence of the ad hoc details. |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the new mounted spec, the supplier's affected scope specs, and the Intent
comparison and Home layout readers reached by the change. Use
`caffeinate -s -i npm run test:dashboard:frontend -- <affected specs>` on
awake macOS on AC power per [AGENTS.md](../../../AGENTS.md), and
`npm run typecheck:dashboard`. Trace the final output through
`IntentStoryEvidence`, the story Home panel and enclosing layout readers.
Keep the existing Home scroll target and file-return behavior observable.
Check changed file sizes against the installed refactor guidance at the
supplier revision; the Home owner is 71 lines at `bae6287ee`.

## Plan review

Slice-plan refinement was unnecessary. The details, their unavailable state,
and removal on scope change are one Home behavior with one proof boundary.
No slice-specific concerns were identified.
