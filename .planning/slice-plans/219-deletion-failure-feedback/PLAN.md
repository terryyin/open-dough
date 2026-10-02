# Announce deletion failure in the session entry; keep success quiet

**Identity:** SEED-052#announce-record-deletion-first-time
**Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#announce-record-deletion-first-time).
**Prepared:** 2026-10-02. Terry requested slice planning after selecting
failure announcements only. Planning grants no implementation or publication
authority. The historical identity remains unchanged after the scope decision.

## Goal and scope

When session-record deletion fails, its session entry visibly and politely
reports the failure, retains the record and confirmation, and allows retry or
Keep without losing focus. Successful deletion removes the record's entries,
closes its showing panel when applicable, and returns focus without announcing
"Session record deleted". Preserve the existing known-state refusal and all
other dashboard announcements.

Exclude changes to eligibility, confirmation, failure wording, focus
destinations, backend/native-session behavior, and published story facts. No
shared announcement queue, lifted page announcement state, or sibling session
file decomposition is needed. The sidebar has no deletion action.

## Existing solution and direction

PFE searched deletion outcomes, feedback, live regions, callers, tests, and
documentation across `dashboard/`, `src/`, `tests/`, and `docs/`.
`sessionRecordActions.tsx` already owns entry-local feedback through
`CardActions`, `RecentActions`, and their shared `DeleteRecord` interaction.
Their status elements persist before a failure. `sessionRecordRequests.ts`
interprets boundary errors; `launchRecordActions.ts` removes records only for a
successful outcome; `pageSessionPanel.ts` owns panel closure and focus return.
Reuse these responsibilities. Remove only the success-message state and its
rendering in `TerminalSplit.tsx`; do not route failures into the published-read
region in `App.tsx`.

This follows [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
especially coherent existing solutions and the least complexity needed for
the selected outcome. The ADR index and in-file statuses agree; no relevant
conflict was found. [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md)
keeps feature-local behavior in its maintained feature home.
The [North Star](../../NORTH-STAR.md), "Agent launch as a requested assignment",
keeps local session facts distinct from published story outcomes. The
[accessibility direction](../../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)
supports semantic feedback and focus preservation. This local change needs
no new architectural direction or ADR.

## Observed premises

Observed in the established worktree at
`7d2400e2a6adfc690c03aa4f44e4f9ede25af4b1`; product files are unchanged.
All observations below are consumed by slice 1.

| Premise and consuming operation | Observation and result |
| --- | --- |
| The deletion caller can keep failure feedback while dropping only success speech. | Read `sessionRecordActions.tsx` → `pageSessionPanel.ts` → `launchRecordActions.ts` → `sessionRecordRequests.ts`. Failed outcomes return before panel closure/focus return; success alone sets the deletion text. `TerminalSplit.tsx` is the only consumer of `panel.deleted`. |
| The existing failure/retry journey reaches real storage failure, not a supplied failed result. | The problems spec makes its isolated `.open-dough/dashboard` directory unwritable, clicks the real confirmation, and checks the entry's error/reason, retained record, enabled controls, and focus. Restoring permissions then retrying removes the record. The baseline command below passed. |
| Silent-success assertions must replace current contrary expectations. | Product-wide `rg -n 'Session record deleted\|panel\.deleted\|setDeleted\|notDeleted\|nowKnown' dashboard docs tests scripts` found success text/state only in the panel hook/rendering, two card-delete expectations, and `AGENT-LAUNCH-TERMINALS.md`. The card baseline actually observed the currently promised success status. |
| Removal, focus return, known-state refusal, and terminal detachment have outside-in proof. | Inspected and ran card-delete, card-delete-problems, recent-delete, and terminal-delete specs. They launch through the real local boundary with a synthetic host, exercise the real deletion and stored records, and observe the page and host-call log. All passed. |
| Other page announcements have existing exposed-region and keyboard proof. | Inspected and ran `accessible-overview-keyboard.spec.ts`. It observes read progress/result, failure, unchanged region identity, and focus on the read control; the baseline command below passed. |

Literal successful baseline command, from the worktree:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-card-delete.spec.ts dashboard/tests/agent-launch-card-delete-problems.spec.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/agent-terminal-delete.spec.ts --workers=2
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/accessible-overview-keyboard.spec.ts --workers=2
```

Both exited 0. The first deletion attempt lacked worktree-local `node_modules/.bin/vite` and
could not start preview servers. `npm ci` supplied local dependencies; the
same command then passed. No tracked dependency changes were made. Fixtures
use temporary HOME/project directories, local origins, and a synthetic Claude
Code executable; they do not call paid/native agents or production services.

Browser assertions do not establish actual speech. Slice 1 begins with the
bounded native observation below before assuming that current failure speech
is adequate. No native screen-reader result is claimed during preparation.

## Ordered slices

### 1. Announce failures beside the session and remove success speech

**Type:** Behavior
**Status:** planned

**Behavior:** The developer confirms deletion of an unknown/unavailable
session record. Failure remains visible and audible in that entry with retry
or Keep available; success removes the record and restores focus without a
deletion-success announcement. Known-state refusal retains its own explanation.

Begin with an early probe of the first failed attempt in an isolated fixture
page, using an available screen reader/browser pair. Observe the failure
message being spoken while focus stays on Delete record. Use the existing
unwritable-directory setup and restore permissions afterward. This is a
plan-slice manual observation under `dough-manual-testing`, bounded to that
failure and its successful retry, with a ten-minute observation budget. If
speech cannot be observed, or a failure
is silent, stop dependent acceptance and revisit this same slice; do not claim
that a DOM assertion proves speech. Keep any necessary repair within the
agreed entry-local failure outcome, and escalate a scope/design choice.

Remove `deleted` state, `setDeleted`, and its return field from
`usePageSessionPanel`, together with the conditional success region in
`TerminalSplit`. Preserve the shared deletion operation and its focus/panel
behavior. Retain the existing failure/refusal status regions. Update the
success expectations in the card deletion specs to assert absence of the
success message, including consecutive deletions. Add the same observation
to the existing failure → successful retry journey and Recent deletion
journey; keep their record/focus observations. In the failure journey, mark
the empty entry status before confirming and verify the same exposed element
receives the failure text. Use the entry-local region, not the global
single-region helper. Cover Recent entry failure through its existing shared
interaction if the card proof does not establish that wrapper's exposure.

Update the delete contract in `dashboard/AGENT-LAUNCH-TERMINALS.md` to describe
entry-local failure feedback and success removal/focus return without success
speech. Leave published-read status and locators unchanged unless an actual
affected consumer requires an adjustment.

**Proof ownership:**

| Final promise | Outside-in proof owned by slice 1 |
| --- | --- |
| First failure is visible and offered in an already exposed entry status, with reason, retry/Keep, record retention, and focus preservation | Extend `agent-launch-card-delete-problems.spec.ts`'s real unwritable-file journey with region identity/exposure checks; inspect `RecentActions` and exercise its exposed entry status. The native probe owns actual speech. |
| First success, consecutive successes, and retry success produce no deletion-success announcement | Negative success-message observations in existing card/recent and failure → retry journeys; confirm success region/state are gone. Other focus/read announcements are allowed. |
| Records disappear from all views; showing panel closes; native work is not stopped; focus follows existing destinations | Existing card-delete, recent-delete, and terminal-delete journeys, keeping storage and host-call assertions. |
| Known-state refusal, Keep/Escape, and published-work announcements retain their meanings | Existing refusal/cancellation observations and `accessible-overview-keyboard.spec.ts`; preserve their assertions. |
| Maintained feature description matches the new behavior | Review the deletion paragraph in `AGENT-LAUNCH-TERMINALS.md` against the selected scope and passing journeys. |

Focused verification after edits:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-card-delete.spec.ts dashboard/tests/agent-launch-card-delete-problems.spec.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/agent-terminal-delete.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

The dashboard suite builds production assets itself. Typecheck verifies
removal of the returned hook field and component use. Broaden proof only if
an edit affects another consumer. Under the execution workflow, accept proof,
run independent post-change refactoring, apply the project formatting step,
and let `.githooks/pre-commit` run its check-only staged lint. Do not run all
hosted CI locally solely because it exists. This plan selects no execution
mode or publication action.

**Safe stop:** One complete, green delivery retains entry-local failure
recovery and makes successful deletion quiet. No interim announcer, new shared
state, or unfinished second feature remains.

## Plan review

One cohesive Behavior slice owns the selected rule and proof loop, including
its early native probe and cleanup. A separate Structure slice or preliminary
announcement framework would fragment this small outcome. No numeric slice
target or hard limit was supplied; none is invented. No slice-specific design,
proof-ownership, or sizing concern remains after construction, so a separate
slice-plan refinement pass is not needed. Readiness is assessed against this
plan and the revised story; the native speech premise is bounded by the early
probe and still needs its actual observation during authorized execution.
