---
id: SEED-072
status: active
planted: 2026-10-01
planted_during: Terry's request for responsive dashboard session startup and reconciled story state
scope: story
---

# SEED-072: Keep the dashboard responsive while session startup settles

## Why This Matters

A developer starting refinement, execution, or an unattached startup session
needs immediate feedback that Start has taken effect, without being able to
cancel work that has already begun. Launch processing should let the developer
continue using the dashboard while protecting the affected story from further
actions until its temporary local state and published state agree.

## Story

<a id="responsive-session-start-reconciliation"></a>

### Keep the dashboard responsive while session startup settles

**Identity:** SEED-072#responsive-session-start-reconciliation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/192-responsive-session-start-reconciliation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a726e4f08e3c3adc7161ea4a8f1979ce7ba95d05b0a2d4f7ab208fbdbbee2584","plan":"808389a2ab3b2886959ce4d0f8577fb441f62fdbc41ac256a65dbb99a67d4ff4"}}
```

- **For / why:** A developer starting refinement, execution, or an unattached
  conversation can continue using the dashboard while knowing which launch is
  in progress and which story is temporarily protected against conflicting actions.
- **Goal:** Give immediate launch feedback, release the modal after safe background
  handoff, and restore the affected story's normal actions only when startup and
  published state reconcile. Settlement concerns startup, not the whole agent session.
- **Scope:**
  - Apply the interaction to both supported hosts and all three launch modes,
    including retained-start continuation. Preserve the selected instruction,
    model, options, and established workspace/assignment on that same launch.
  - Before submission, Cancel and Escape start nothing. On the first accepted
    Start submission, immediately disable Cancel and repeat submission, suppress
    Escape dismissal, and prevent edits from changing the submitted request.
    Explain that startup is underway and can no longer be cancelled here.
  - Close the dialog after safe handoff: the local launch service has accepted
    ownership of the exact request, retained enough evidence to recover it, and
    can continue and expose its outcome independently of the dialog or HTTP caller.
    This does not require workspace establishment, publication, native session
    confirmation, or a remote refresh to have finished. A dispatched browser
    request alone is not safe handoff. A refusal or lost acknowledgment must show
    failure or uncertainty rather than imply accepted ownership.
  - From submission until reconciliation, protect the affected story by project
    and story identity, across workflows, stage moves, and snapshot replacement.
    None of that frame's action buttons can be activated, including alternate
    launch, story inspection, and card session actions. Displayed facts and source
    links remain readable. Unrelated cards, navigation, Refresh, the sessions
    sidebar, and existing terminal controls remain operable.
  - Show a distinct pending treatment and truthful phase text during active
    startup or reconciliation. Keep the last published story facts visible and
    clearly label the temporary indication as local startup progress. Do not move
    the story or invent Preparing, Taken, ownership, readiness, or completion
    from local launch evidence.
  - Settle the launch outcome separately from the published read, then reconcile
    the two using the evidence rules below. An old or out-of-order read cannot
    clear protection. A published assignment alone does not prove a session
    started; native confirmation alone does not prove an assignment was published.
  - On resolved success, refusal, or a concurrent state change, remove the
    temporary treatment and offer only actions valid for the resulting published
    state and retained local recovery evidence. A published assignment followed
    by native refusal must keep its existing continuation path and workspace.
  - If publication, native launch, or refresh is uncertain or unavailable, explain
    what is known and what needs reconciliation. Stop indefinite animation when
    no operation is known to be progressing; retain protection against conflicting
    starts until evidence resolves it. A timeout, vanished dialog, missing running
    phase, or dropped connection never proves that nothing started.
  - Project switching, page reload, and a second page on this machine must recover
    the unresolved launch from local evidence. Server restart must expose retained
    uncertainty and recovery, without silently submitting another start or native
    conversation. An unattached launch gets local project/session feedback and
    duplicate protection for that attempt, with no story frame or story record.
- **Rejection constraints:**
  - A submitted launch cannot be cancelled through this dialog, and no action
    button on its pending story frame can run. These are Terry's explicit startup
    protection requirements recorded in the capture breadcrumb below.
  - Uncertainty cannot justify a fresh duplicate claim, workspace, native
    conversation, or input submission. Preserve the established recovery rules in
    [mechanical start](../../dashboard/LAUNCH-START.md) and
    [agent launch](../../dashboard/AGENT-LAUNCH.md); recovery must verify the
    retained attempt before any allowed continuation.
- **Deferred promises:** Durable lifecycle redesign, new workspace or landing
  selections, session cancellation, terminal-control changes, a cross-machine
  launch queue, and a new generic job platform. SEED-066 owns its evolving
  session options; naturally compatible options use this startup interaction
  without being reimplemented here. No fixed startup-time SLA is selected.

#### Key examples

1. **Cancel before submission:** With a launch dialog open and no Start submitted,
   Cancel or Escape closes it and starts nothing; existing warnings and required
   confirmations remain in effect.
2. **Slow accepted start:** Start refinement or execution while workspace creation,
   publication, or native acknowledgment is slow. Cancel and repeat Start disable
   immediately. Once the service safely owns the attempt, the dialog closes; the
   card says what is progressing, all its action buttons stay unavailable, and
   another story and project navigation work normally.
3. **Old read after publication:** An execution start publishes a Take at revision
   R, but an earlier Backlog snapshot arrives later. Keep the pending protection
   and published/local distinction. A read of R or a descendant establishes the
   current Taken facts; once native outcome also settles, normal Taken actions
   return even while the agent continues working. A refinement announcement
   follows the same rule while the story remains in Backlog.
4. **No repository change expected:** An installed launch without mechanical
   start, or a supported option that creates no assignment, starts its native
   session. After the native outcome settles, a fresh authoritative read confirms
   the resulting story state; reconcile without waiting for a nonexistent
   publication. An unattached launch settles on local/native evidence alone.
5. **Failure with no publication:** The service establishes that no assignment or
   session was made. Show the bounded failure explanation, reconcile a fresh
   published read, and restore eligible actions. A later Start is a new attempt
   only after this evidence establishes it is safe.
6. **Published assignment, native refusal:** Origin confirms the assignment but
   the host refuses to create/start the session. Show the assignment and failure
   distinctly, reconcile the card, and offer its existing retained-start
   continuation with the original workspace and identity, never a second claim.
7. **Interrupted or ambiguous result:** The acknowledgment is lost, publication
   is uncertain, or remote refresh fails. Keep unrelated controls working and
   show known local evidence plus a reconciliation explanation. No fresh start
   becomes eligible solely because a wait expired. On recheck, either reconcile
   the confirmed result or preserve the retained recovery path and explanation.
8. **Concurrent change or navigation:** While startup is pending, another writer
   takes/removes the story or the developer switches projects and reloads.
   Reconcile against current remote evidence and the retained attempt. Protection
   follows the story if it moves; if it disappears, keep the launch explanation
   accessible through project/session feedback rather than leaving an orphaned
   locked frame. No local launch reinstates a removed story.
9. **Unattached session:** Start session with slow native startup. Apply the same
   cancellation cutoff and safe handoff, show progress and recovery for that
   attempt, and keep story cards usable. A blank session uses the existing durable
   conversation/no-input contract rather than an invented empty first turn.
10. **Keyboard and reduced motion:** Submit with the keyboard under reduced
    motion. The cutoff and status remain understandable without animation. Modal
    closure moves focus to a meaningful enabled status or dashboard destination,
    not the disabled launcher. Subsequent settlement does not steal focus from
    the developer's new task.

#### UX/UI

- Keep the pre-launch authorization text. During the brief handoff interval,
  “Starting…” communicates that the request is committed; disabled Cancel must
  have an adjacent explanation of the cancellation cutoff.
- Distinguish a pending frame through a visible treatment plus plain status text,
  not color alone. Use animation only while work is known to be progressing;
  reduced motion receives an equally clear static indicator. The treatment must
  remain distinguishable from “Shown in terminal” and selection marks, without
  implying a published stage or percentage completed.
- Example status wording: “Starting refinement — local startup in progress”,
  “Waiting for published story state”, and “Startup needs reconciliation”. Name
  the affected story/workflow and provide a bounded cause and recovery direction
  for failures. These are semantic examples, not a selected visual layout.
- Announce meaningful status transitions politely to assistive technology; repeated
  polling or animation must not repeat announcements. Make unavailable actions
  and their reason perceivable through keyboard and screen-reader navigation.
- Close the modal at safe handoff without waiting for native completion. Preserve
  existing session presentation/terminal behavior on confirmation, while avoiding
  delayed focus changes that interrupt work begun after handoff.
- Safe recheck and verified continuation are available through local project/session
  feedback outside the protected frame. Normal card actions remain protected
  while the outcome is unresolved.

#### Architecture

This is feature design in the seed, not an ADR proposal. Follow
[Accepted ADR 0000 — Use ADRs](../../docs/adrs/0000-use-adrs-accepted.md)
for that distinction and
[Accepted ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for separate domain facts, one authoritative repository home per fact, and
published derivation of dashboard views. ADRs 0008 and 0009 remain Proposed:
they inform discussion but supply no binding decision or exception.

- **Launch ownership:** Local orchestration owns admission, background lifetime,
  duplicate prevention, recoverable request/outcome evidence, and notification
  to interested pages. Browser state renders that evidence; it cannot be the
  sole owner. Retain transient evidence outside repository story facts, using
  existing machine/start/native recovery responsibilities where possible.
- **Workflow authority:** Installed preparation/execution commands own workspace
  and assignment establishment, publication, conflict resolution, and safe
  continuation. Backgrounding must not duplicate those rules in the dashboard.
  Native adapters own native identity, acceptance, and conservative recovery.
- **Reconciliation evidence:** For an attempt that publishes, observe its accepted
  revision or a later revision containing it, and evaluate the current story
  facts there. An unrelated changed SHA, an older snapshot arriving later, or
  elapsed time is insufficient. If the current state supersedes the assignment,
  reconcile that change rather than wait for the old assignment to reappear.
  For a definitive refusal or a mode with no expected publication, use a fresh
  remote read initiated after the outcome is established. A retained start's
  already accepted publication can satisfy the publication part; it does not
  settle a new native-launch outcome. Uncertain publication needs the installed
  command's remote confirmation/recovery evidence before choosing either path.
- **Observation and protection:** Preserve the unresolved attempt independently
  of a frame's mounting or stage. Protection is story-wide across workflow
  actions on this machine; host-qualified native identity remains intact.
  Pages recovering after restart must not confuse a retained start with a running
  worker. Retained uncertainty is recoverable evidence, not permanent busy state.
- **Outcome boundaries:** Successful handoff, accepted publication, confirmed
  native startup, current published state, and a running agent are distinct facts.
  Failure in one does not undo another. Ordinary terminal/sidebar controls retain
  their existing contracts; disabling a card is temporary presentation protection,
  not a new lifecycle state or permission rule.

#### Recovery decision

Terry selected safe reconciliation outside the protected card on 2026-10-01:
when progress can no longer be confirmed, replace animation with static
“Startup needs reconciliation”, keep normal card actions disabled, and offer
safe recheck or verified continuation through local project/session feedback.
Recheck reads evidence; continuation verifies and resumes the retained attempt
under the existing recovery contract. It never silently creates a replacement.

- **Dependencies:** Existing launch and published-state contracts, with SEED-066
  supplying any independently delivered session choices. No new prerequisite
  or sibling implementation is established.
- **Effort hypothesis:** Unestimated. The story is refined; the associated slice plan
  owns approach, proof, and execution sizing.

<a id="durable-startup-reconciliation"></a>

### Keep reconciled startups settled under one unresolved-attempt rule

**Identity:** SEED-072#durable-startup-reconciliation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/206-durable-startup-reconciliation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cac980658944a10ccf1c151a92c4fbab6e393f9e53d1b7f62c457700ded56d9c","plan":"39c4f5651849f8ceeddb1db6399882b495a8b4166a57ec064c0858fcac1a3390"}}
```

**Goal:** A developer who reopens, reloads, or restarts the dashboard after a
startup reconciled sees that story's normal actions and no stale recovery item,
and both the local launch service and the page refuse or protect exactly the
same unresolved attempts, with recovery wording that reads correctly where it
is shown.

**Scope:** A bounded retrospective correction of
`SEED-072#responsive-session-start-reconciliation`. Keep a reconciled settled
attempt settled across pages, reloads and restarts as machine-local launch
evidence, never a story fact, including after its story leaves the published
snapshot; apply one unresolved-attempt rule to service admission and story
protection; form recovery wording where each answer is formed instead of
rewriting it in the page. Preserve every promise of the original story. No new
feature promise; the native-outcome exit for an uncertain Claude Code launch
stays excluded pending a developer decision.

**Plan:** [bounded correction input and slices](../slice-plans/206-durable-startup-reconciliation/PLAN.md).

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: capture this UX/UI improvement
  first in the product backlog, directly on main, then commit and sync with
  origin. Disable Cancel immediately on launch, move startup to the background,
  show the story as read-only and processing, and recover its actions only after
  temporary dashboard state reconciles with authoritative `origin/main` state.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
- [Composable session options](SEED-066-composable-lightweight-session-options.md).
- [Session panel header controls](SEED-071-session-panel-header-controls.md).
