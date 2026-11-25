---
id: SEED-439
status: active
planted: 2026-11-25
planted_during: Developer split of SEED-432#finish-story-linked-ad-hoc-sessions at its delivered slice 3 boundary
trigger_when: selected from the product backlog
scope: one story
---

# SEED-439 — Complete story-linked ad hoc sessions in the Dashboard

<a id="complete-story-linked-ad-hoc-sessions"></a>

### Complete story-linked ad hoc sessions in the Dashboard

**Identity:** SEED-439#complete-story-linked-ad-hoc-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md","assessment":"not-ready","reasons":["The landing policy after a blank Start still needs a product decision and proof before the coordinated cutover."],"basis":{"document":"a334dce8498777632f1cba1722ecf50afbf74cb4f44b2f6695bc43af00b036c5","plan":"d625a1c07cfb597732070a2f9495b63ac200060989d3d234b5879526d5f8cfbc"}}
```
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-439#complete-story-linked-ad-hoc-sessions","dependencies":[{"supplier":{"identity":"SEED-432#finish-story-linked-ad-hoc-sessions","href":"seeds/SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions"},"implementation":"Isolated Dashboard Starts admit a Taken story through the installed execution start before native dispatch.","rationale":"This story's slices extend SEED-432's isolated admission code, proof seams and plan 813 evidence to default, scheduled and follow-up starts. That code exists only on SEED-432's story branch until its wrap-up integrates it.","condition":"SEED-432's isolated Dashboard admission is integrated on trunk.","state":"satisfied","resolution":{"revision":"03b6dc4abe9f49901a6119f8e2295d04165ef75d","path":".planning/seeds/SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions","summary":"Isolated, non-follow-up Dashboard Starts draft and admit their story through the installed execution start before native dispatch (dashboard/server/isolatedSessionAdmission.ts). The admitted-session retry and refusal cases cover receipt refusal followed by one native start, and a competing claim or origin mismatch with no native start. The isolated E2E covers publication before dispatch, attachment bytes and one Session entry. Branch CI passed at 03b6dc4ab.\nCondition satisfied: SEED-432's isolated Dashboard admission is integrated on trunk.\nAccepted integration: 3edf13a3f186b1da83c4f2e5b670de5cf149c22e on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-442#exercise-board-navigation-on-published-story-fixtures","href":"seeds/SEED-442-exercise-board-navigation-on-published-story-fixtures.md#exercise-board-navigation-on-published-story-fixtures"},"implementation":"Dashboard Board paging, held navigation, and native controls have tests using published story membership.","rationale":"Slice 6 consumer proof still uses standalone destinations in shared fixtures. Two actual failures prevent accepting the candidate and the fixture migration is independently verifiable before the product switch.","condition":"The published-story Board navigation fixtures and their browser proof are integrated on trunk.","state":"satisfied","resolution":{"revision":"73f8f092a64131231bdb43927610432efbfe8db8","path":".planning/seeds/SEED-442-exercise-board-navigation-on-published-story-fixtures.md#exercise-board-navigation-on-published-story-fixtures","summary":"Plan 844 delivers all three fixture slices. Published Done catalogs now supply the paging, held-reveal and refresh destinations. Native Done settles within a published Taken story. Thirty-three selected browser cases passed on the supplier and the parked Board composition, including its exact linked read bounds and native actions. The combined parked Board composition later passed 34 browser and 60 frontend cases plus Dashboard typecheck. Branch CI passed on d311b0a9, the execution-complete basis. The exact integration candidate passed Dashboard typecheck and affected Add Project and held-inventory browser checks. SEED-439 owns the separate inherited collapsed-history keyboard gap.\nCondition satisfied: The published-story Board navigation fixtures and their browser proof are integrated on trunk.\nAccepted integration: 3328db809564f4f41f72f955b6df7025f66f108a on origin/refs/heads/main."}}]}
```

**Goal.** A developer who starts ad hoc work from the Dashboard can return
to the same story on the Board, in Recently done, and in Intent. The
published story and any session comparison remain available after the
session's checkout retires and from another clone.

**Developer decision.** Admit new independent ad hoc work as an ordinary
story directly into **Taken**, using the same product backlog admission as
accepted contextual work. A follow-up uses the source story and gets its own
session ID. The project repository owns membership and published comparisons.
The Dashboard keeps the local launch and recovery evidence. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
defines those responsibilities.

**Scope.**

- A new independent start publishes one canonical story and its Taken
  assignment before opening a native session. Include default checkouts, blank and attachment-only starts, and scheduled feedback.
  Preserve native access and writer checks, the chosen checkout and landing
  policy, and the original first input. Refused admission opens no native
  session. Continue after interruption or a lost reply uses the same attempt
  and admits or recovers the same story.
- Follow up from a Taken or Done story, including through one of its sessions.
  Resolve the source against published membership and preserve its status.
  Refuse a new follow-up whose source cannot be resolved. Continue an already
  admitted follow-up from its retained binding.
- Land checks the bound story and declared Git authority before push. Each
  published session keeps its own accepted comparison and supports reporting
  recovery without another push. Ordinary completion and review use the
  story's membership and published session records. An admitted story with no
  changes can still complete.
- Retire standalone session startup, completion and review across Distribution
  and the Dashboard, including their persisted shapes, branching, tests and
  guidance. Remove the remaining legacy standalone frontend cases and keep
  applicable story-linked selection, review and warning coverage.
  [Runner retirement](SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)
  waits for that removal. Record comparable source and executable case counts
  to show that both production surfaces and their combined proof footprint
  shrink.
- Session selection within Intent, follow-up context composition, open
  follow-up card cues and Review repository adoption have their own stories.
  This story preserves those readers' published comparison contract.

**UI.** **Start session** shows admission in progress. A refusal explains the
reason and offers retry for that attempt. Use the existing instruction label
as the initial story title. With no usable label, use “Ad hoc work” with the
launch date and time, fixed on the first attempt. A blank start opens the
terminal awaiting the developer's first input after admission, subject to the
selected host's native input requirements. The new Session entry appears on
the ordinary Story card.

**Cutover.** Switch production startup, completion and review together.
Preserve open sessions with verified story membership and their original
identifiers. Convert closed records when published evidence corroborates
their story and archive the rest with their linked attempt and reporting
evidence. A former standalone row, title or shared workspace cannot establish
membership. Recheck open records and unresolved starts against native
bindings, workspace ownership and published membership. A verified unbound
start can continue with its original attempt and checkout. Preserve uncertain
evidence and hold the switch while an open record has no safe disposition.
Verify the complete migrated store with the delivered Dashboard reader before
resuming writes. Keep the original store recoverable and retire migration-only
code after acceptance.

**Key examples.**

- A developer submits an instruction or opens a blank terminal in a supported
  host. The remote receives one story and Taken assignment without changing
  queue order. On the Board, the story carries the new Session entry. When
  the admission reply is lost, Continue reuses that identity and opens one
  native session.
- A developer follows up from a Taken or Done story or its session. The new
  session has its own ID and the source keeps its status. Land verifies the
  declared branch, records the accepted pair, and reports the same pair after
  retry. Mismatched authority stops before push.
- A developer completes admitted work, retires its owned checkout, and opens
  the project in a fresh clone with empty launch storage. Recently done opens
  the same story and Intent shows the published session's recorded endpoints
  even after trunk advances.
- When production data includes an open linked session, a verified unbound
  interrupted start and a closed unassociated record, the candidate reader
  still opens the first session with its original ID and retains Continue for
  the second. The third remains recoverable in the archive.

**Split from.** The developer split
SEED-432#finish-story-linked-ad-hoc-sessions after its delivered slice 3.
SEED-432 delivered admission for isolated Dashboard starts and verified the
production cutover inputs. This story inherits the rest of that story's goal
and scope, and the remaining slices of its plan 813 as
[plan 833](../slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md).
Plan 813 remains recoverable in Git history.

**Board fixture prerequisite.** The developer split the remaining
progressive Board fixture migration from slice 6 into
[SEED-442](https://github.com/terryyin/open-dough/blob/73f8f092a64131231bdb43927610432efbfe8db8/.planning/seeds/SEED-442-exercise-board-navigation-on-published-story-fixtures.md#exercise-board-navigation-on-published-story-fixtures).
SEED-439 keeps the five published slices, standalone retirement, landing
policy, retained ranges, and the coordinated production cutover.
