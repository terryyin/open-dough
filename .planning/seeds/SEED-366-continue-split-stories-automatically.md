---
id: SEED-366
status: active
planted: 2026-11-15
planted_during: Terry made the eight-slice plan limit a hard rule that splits an execution at its last delivered slice
trigger_when: selected from the product backlog
scope: two stories
---

# SEED-366 — Continue split stories automatically

<a id="continue-a-ready-split-story-automatically"></a>

### Continue a ready split story automatically after wrap-up

**Identity:** SEED-366#continue-a-ready-split-story-automatically

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/893-continue-a-ready-split-story-automatically/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"673b31e3fd701a389b1f1d048a0f3159cc9d7d0dfd23f98018ba5c7fe747cd85","plan":"e61f5f6dd29bcac071f17064514b593571d7bae8eba38e4042454485a4dc84aa"}}
```

**Goal.** A developer whose execution leaves a follow-on story that needs no
decision from them gets that story executed without starting it by hand. The
follow-on story is the remainder of a split at the
[eight-slice limit](../../Distribution/src/skills/dough-story-decomposition/references/problem-decomposition.md#limit-slices-per-plan)
or the follow-up an execution retrospective planned. Once the remainder starts
on its own, going over the limit costs almost nothing, which counters the risk
that agents merge slices to stay under it: with the limit at eight, about 18 of
240 Claude Code executions in the 30 days to 2026-11-15 would have split, each
needing a manual start after wrap-up.

**Scope.**

*The session names the next story.* An execution session that created a
follow-on story judges, when it closes, whether a developer has anything to
decide about that story. The follow-on is either the remainder from
[split at a delivered slice boundary](../../Distribution/src/skills/dough-resplit-story/SKILL.md#split-at-a-delivered-slice-boundary)
or the retrospective follow-up that
[follow-up disposition](../../Distribution/src/skills/dough-story-wrap-up/references/follow-up-disposition.md)
queued first. When nothing is left to decide (the story is refined, planned,
assessed `ready` and queued, and no open recommendation, missing input or
attention item concerns it), the session names that story's identity as the
next story in its final `completed` dashboard completion report. It names at
most one story, the one first in the backlog. An `unfinished` report, a
session without dashboard reporting context, or a follow-on with an open
decision names none, and the story stays queued as today.

*The dashboard decides and starts.* On accepting a completion report that
names a next story, the dashboard backend evaluates it once. It starts the
named story's execution through the same launch acceptance a developer's
manual start uses, with the choices recorded for the reporting session's own
launch: host, model, effort, options and session policy. The developer's
instruction text for the original story is not carried. The started session
is an ordinary execution session, so it can name a next story in turn and a
chain continues one story at a time.

*What holds an automatic start.* Nothing starts when any of these is observed:

- the story is not queued or is already Taken;
- the story is not start-eligible: not assessed `ready`, a dependency not
  satisfied, or preparation facts unreadable;
- the nearest finished build of the project's trunk is known to have failed.
  A build still running is tolerated: the judgment then rests on the nearest
  finished ancestor, and a trunk with no finished result or an unreadable one
  does not hold. A manual start keeps its existing base CI confirmation;
- the reporting session's launch choices cannot be found;
- the manual start would ask the developer something else first, such as
  existing changes in the default checkout; or
- launch acceptance refuses, or the execution start refuses the story.

Start eligibility keeps its one enforcement, the workflow's start script: the
automatic start reads that refusal from its own launch attempt instead of
deriving eligibility a second time.

A held automatic start is evaluated once and is not retried when the condition
later clears. The story stays queued for a manual start, as today; the
dashboard keeps the hold and its reason with the reporting session's
completion, and
[telling the developer](#tell-the-developer-why-an-automatic-start-was-held) is
the next story.

*Turning it off.* A machine-wide dashboard setting turns automatic
starts off; it is on unless turned off. While off, a named next story
starts nothing and is not a hold.

*Guidance.* The shipped guidance that forbids starting work from a `ready`
record or a quiet completion is replaced by this path: eligibility alone
starts nothing, and a next story named by a closing session and accepted by
the dashboard is the one automatic start.

*Deferred.* Retrying a held automatic start when its condition clears; naming
more than one next story; a per-project setting.

**Key examples.**

- Given a Claude session launched with model M and effort high whose
  execution split at the limit, with remainder R queued first and assessed
  `ready`, and trunk's nearest finished build passed while a newer build
  runs. Its wrap-up reports `completed` naming R → the dashboard starts R's
  execution with Claude, M and high, and the Board shows R Taken with its new
  session.
- Given the same report while trunk's nearest finished build failed at
  revision F → nothing starts and R stays queued; after the build is repaired
  R still waits for a manual start.
- Given a retrospective that planned one bounded follow-up C, queued first by
  wrap-up and assessed `ready`, with nothing left to decide → the report
  names C and C's execution starts.
- Given a retrospective follow-up whose promises need the developer's
  decision → the session reports with its attention message and names no
  next story; nothing starts.
- Given R named while R waits on a dependency that is not satisfied →
  nothing starts.
- Given automatic starts turned off and a report naming R → nothing
  starts.

**UI.** The automatic start setting sits with the dashboard's other
machine settings and says what it turns off. A continued story looks like any
manually started one.

**Architecture.** The *next story* is a session's statement, carried on its
completion report, that one named story may start without the developer; the
dashboard's answer to it is an *automatic start*. The dashboard already uses
"continuation" for resuming a launch attempt, so these names stay apart. It
is a field of the completion report through the reporting script, the
admission schema and the same-content rule, not a second channel; use the
name directly in code, tests and UI
([ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)).

The automatic start calls `AgentLaunches.accept`, as the manual start and
feedback maintenance do, so start eligibility, the kept start, the start
script and the host launch stay in one implementation. The base CI gate in
`unconfirmedStart` gains the automatic start's rule beside the developer's
confirmation: one judgment (`judgeBranchCi` and its `completedAncestor`), two
callers that decide differently on a non-pass. The Take and the published
assignment stay with the workflow's start script; the dashboard only
launches, as
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#observe-workflow-outcomes-without-owning-them)
requires. The evaluation's outcome (started, held with its reason, or off) is
one typed value kept with the completion, which the next story reads.

<a id="tell-the-developer-why-an-automatic-start-was-held"></a>

### Tell the developer why an automatic start was held

**Identity:** SEED-366#tell-the-developer-why-an-automatic-start-was-held
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-366#tell-the-developer-why-an-automatic-start-was-held","dependencies":[{"supplier":{"identity":"SEED-366#continue-a-ready-split-story-automatically","href":"seeds/SEED-366-continue-split-stories-automatically.md#continue-a-ready-split-story-automatically"},"implementation":"Automatic start whose held outcome and reason are kept with the reporting session's completion","rationale":"A developer message is written from a held automatic start; until the dashboard evaluates named next stories there is no hold to report, and a second evaluation would duplicate the start conditions.","condition":"SEED-366#continue-a-ready-split-story-automatically has landed on origin/main: the dashboard evaluates the next story named on a completion report and keeps a held outcome with its reason.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal.** A developer whose named next story could not start learns of it
without watching the dashboard: a persisted message says which story was held
and why, on every frontend, until they mark it read. This is the dashboard's
first message for a developer to read.

**Scope.** Each
[held automatic start](#continue-a-ready-split-story-automatically) writes one
developer message: a persisted, machine-local record naming the project, the
story, what was held and why (with the detail observed, such as the failed
revision and its run, the not-ready reasons or the waiting dependency), and
when. Every frontend of that dashboard shows the same messages and their
unread count. A developer opens the story from a message and marks the
message as read; the read state is shared by all frontends and a read message
stays readable. A new message also raises the dashboard's existing desktop
notification, which opens the story. A next story named while automatic
starts are off writes no message.

*Deferred.* Moving session attention reports and other dashboard notices onto
developer messages; deleting messages; browser or phone push delivery.

**Key examples.**

- Given a report naming R while trunk's nearest finished build failed at
  revision F → a developer message on R says its automatic start was held
  because trunk's build failed at F, with its run. The desktop notification
  appears and opens R; the phone's dashboard shows one unread message.
- Given that unread message, marking it read on the phone → the desktop's
  unread count clears and the message stays in the list as read.
- Given R named while R waits on a dependency that is not satisfied → the
  message names the waiting dependency.
- Given an automatic start that started, or a next story named while the
  setting is off →
  no message is written.

**UI.** The banner carries a Messages control with the unread count. It opens
the list of developer messages, newest first; each shows the story's title,
what happened, the detail and the time, opens its story as the Selected
story, and offers Mark as read while unread. Placement and wording follow the
[Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md).

**Architecture.** A *Developer message* is machine-local operational state
under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
one machine JSON file, like story notes, keyed by project and story, with no
database and no workflow authority. It is written from the automatic
start's held outcome, not from a second evaluation. Desktop notification
reuses the session alerts' notifier and activation. Developer messages are
the first use of a store that session attention reports may later move onto;
build nothing for that move now.
