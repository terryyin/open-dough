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

Browser assertions establish status exposure and behavior, not actual speech.
The developer clarified during execution on 2026-10-02 that there is no speech
requirement; the initially planned native observation gate is removed. Preserve
the existing polite entry-local status and judge the browser observations below.

## Execution context

Execution began on 2026-10-02 from the caller's established start, without a
second Take. Identity: `SEED-052#announce-record-deletion-first-time`;
publisher: `dashboard-territory.local-open-dough`; agent: `ivan-chan`.
Story Branch Mode uses
`/Users/terryyin/git/open-dough/.worktrees/announce-a-deleted-session-record-to-screen-read`
on `codex/announce-a-deleted-session-record-to-screen-read`, publishing
increments to that branch on `origin`; the eventual integration target is
`origin/main`. No integration checkout was supplied. The established
`startingRevision` is `2e26eda0f02f9730475b9b6a872e99e84f5e5625`; the accepted
claim and initial candidate are
`d41fc57757ba1e87bb7f517ce4deb94d1e19abac`, confirmed on both remote main and the
execution branch. `npm ci` and `npm run typecheck:dashboard` passed in this
checkout without tracked dependency changes. No extra overrun replanning
permission or slice-size limit was supplied.

The early native probe used an isolated dev server with the existing fake
GitHub/Claude controls, a temporary HOME, and the published launch fixture.
Chrome's native accessibility observation of the first confirmation with the
dashboard directory at mode `0500` showed the entry's failure message and
EACCES reason, retained confirmation and record, enabled Delete record/Keep,
and focus on Delete record. After permissions returned to `0700`, retry
removed the entry and its Recent copy and returned focus to Story B. The
unchanged baseline still showed its existing success announcement.

VoiceOver was started through its native welcome dialog with its caption-panel
setting already enabled, but the available native tools did not expose speech
or the caption output. **Actual first-failure speech remains unobserved, not
proved silent.** A developer observation was requested in the conversation. The developer then
clarified that there is no speech requirement; acceptance now rests on the
entry-local status and browser behavior, with no native speech prerequisite. Fixture
permissions were restored, the fixture server/repository and temporary harness
were removed, its browser tab was closed, and VoiceOver was turned off again.

Independent browser proof passed for the uncommitted implementation:

```sh
env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-card-delete.spec.ts dashboard/tests/agent-launch-card-delete-problems.spec.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/agent-terminal-delete.spec.ts dashboard/tests/accessible-overview-keyboard.spec.ts --workers=2
npm run typecheck:dashboard
git diff --check
```

All exited 0. The first command ran the five named specs without additional
name filtering. `agent-launch-card-delete-problems.spec.ts`'s card/Recent
unwritable-directory journeys observe the empty, exposed entry status before
confirmation, its unchanged element marker after the real failed request,
failure/reason, retained storage and controls, confirming-control focus, and
successful retry with quiet success and focus return. `unknownSession` and
the isolated `dashboardTest` server supply only the starting state and fake
host. Card and Recent deletion specs observe first/consecutive quiet successes
alongside storage, membership and focus; terminal deletion and overview
keyboard journeys preserve panel/native and unrelated announcement proof.
The coordinator inspected the removed hook state/rendering, persistent status
wrappers, fixture setup and changed observing assertions. These observations
establish browser behavior and status exposure; they do not establish speech.

Browser proof is accepted under the developer's clarified requirement.
Independent refactor review returned `## REFACTOR COMPLETE` with no edits or
proof invalidation, and `npm run format` exited 0. The coordinator retained
the existing oversized seed (431 lines), card-delete spec (283), and Recent
delete spec (294) under a scoped exception: splitting their unrelated stories
or existing journeys would broaden this slice. The numeric refactor guideline
is unsatisfied; no human file-size waiver is claimed.

CI uses GitHub Actions `ci.yml`, verified as a push-triggered workflow for
`terryyin/open-dough` and the authorized execution branch. The documented
Codex yielded stream was armed before the first increment so managed delivery
can reuse one observer, following the successful startup/reuse evidence in
`DearDough.md` DD-201. Observer: `/tmp/dough-ci-501/watch-TpFNB7`, coordinator
`root`, bound to this execution checkout and branch; cell 14, session 84403,
PID 5648. The earlier trunk claim's CI is unobserved by this execution.

## Ordered slices

### 1. Show failures beside the session and remove the success announcement

**Type:** Behavior
**Status:** done

**Behavior:** The developer confirms deletion of an unknown/unavailable
session record. Failure remains visible in its persistent polite status with retry
or Keep available; success removes the record and restores focus without a
deletion-success announcement. Known-state refusal retains its own explanation.

Verify the first failed attempt through the real isolated unwritable-directory
journey in both entry wrappers. Native screen-reader speech observation is not
required, as clarified by the developer on 2026-10-02.

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
| First failure is visible and offered in an already exposed entry status, with reason, retry/Keep, record retention, and focus preservation | Extend `agent-launch-card-delete-problems.spec.ts`'s real unwritable-file journey with region identity/exposure checks; inspect `RecentActions` and exercise its exposed entry status. |
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

## Execution complete

Product advice: No new product work recommended. Entry-local failure recovery,
quiet successful removal and existing focus/panel behavior form one coherent
contract aligned with the dashboard direction. Process proposals remain
unqueued; unrelated file decomposition is not a product correction for this story.

Automatic retrospective reviewed the original plan at `2e26eda0`, the
developer's no-speech clarification, and delivered implementation
`c70c09f8e029d495ee100a50153012661fe06e87`. The accepted claim `d41fc577` and
planning commit `2e26eda0` are provenance; nearby SEED-041 and SEED-008 work is
unrelated and excluded. The selected implementation patch is the review boundary.
All ordered slices are done. Outcome findings: none. Correction planning: unchanged.

Review checked the shared card/Recent deletion interaction, boundary outcome
interpretation, record removal, page panel/focus responsibilities and published-read
status independently. Removing the only success-state producer/consumer leaves no
obsolete announcement path or new representation. Relevant Accepted ADRs 0000 and
0002 remain satisfied; no architecture conflict or new decision is needed.
Existing E2E journeys were extended with real storage failure and browser observations;
the retained history does not establish a failing-first test cycle. The focused five-spec
proof covers changed outcomes and preserved integration behavior; no supported whole-suite
cleanup or coverage gap was found through focused review. No extra full-suite run was needed.

Process review was enabled by this project's `skipProcessRetrospective: false`.
DD-218 and DD-219 are recorded in `DearDough.md` with one occurrence each.
The log is 949 physical lines, above its 500-line warning threshold and below
its 1,000-line ceiling; no retention replacement was needed.

Managed delivery accepted `c70c09f8e029d495ee100a50153012661fe06e87` on
`refs/heads/codex/announce-a-deleted-session-record-to-screen-read`, with no
reconciliation. CI was pending at retrospective completion; the retained observer
is `/tmp/dough-ci-501/watch-TpFNB7`. This records-only completion publication will
be the applicable revision for the execution's single bounded CI completion operation.
The branch and completed plan are retained for later story wrap-up; no trunk integration
or cleanup is claimed here.

Retrospective result: `## EXECUTION RETROSPECTIVE COMPLETE`.

## Plan review

One cohesive Behavior slice owns the selected rule and proof loop, including
its entry-local failure and successful retry journeys. A separate Structure slice or preliminary
announcement framework would fragment this small outcome. No numeric slice
target or hard limit was supplied; none is invented. No slice-specific design,
proof-ownership, or sizing concern remains after construction, so a separate
slice-plan refinement pass is not needed. Readiness is assessed against this
plan and the revised story. The developer's execution-time clarification removes
the native speech prerequisite without changing the existing polite regions.
