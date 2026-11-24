---
id: SEED-426
status: active
planted: 2026-11-23
planted_during: Developer decision to replace completion-time ad hoc story creation
trigger_when: selected from the product backlog
scope: one story
---

# SEED-426 — Start ad hoc work under a story

<a id="start-ad-hoc-work-under-a-story"></a>

### Start ad hoc work under a story

**Identity:** SEED-426#start-ad-hoc-work-under-a-story
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/804-start-ad-hoc-work-under-a-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"97a38d9951b8cfba54fcc703008ffbd100ade625697739094d142b21ecee07b1","plan":"8dd3f9f61f00122ffdee616a969977286a2f3ad6c9586baf2d86530e652260c5"}}
```

**Goal.** A developer can start work ad hoc and return to it through the same
story on the Board, in Recently done and in Intent. Every Open Dough project
session has a story identity from startup. Use that single lifecycle to
substantially simplify Distribution and Dashboard code, guidance, and tests.

**Developer decision.** Establish an ordinary story as part of admitting new
ad hoc work directly to **Taken**. Use the existing product backlog admission
for accepted independent work. The story needs no place or priority in the
queued list. A follow-up uses its source story and gets its own session ID.
Use the ordinary story lifecycle and recorded membership for Land, completion,
follow-ups and review, including after checkout retirement and from another
clone. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
keeps the story, backlog and published progress in the project repository.
[SEED-418's published session record work](https://github.com/terryyin/open-dough/commit/3dbaff36c0b21730ff23ba5948b5199522b0f103)
already provides the per-session identity and comparison.

**Scope.**

- Establish and persist the canonical story and its Taken entry before a new
  ad hoc session can proceed. Bind the launch to that identity. Repeated or
  interrupted admission must converge on one story and one Taken entry for
  the same start. A start that cannot establish or resolve its story must
  stop at admission.
- Trace all Open Dough session entry points. Contextual execution already
  admits accepted independent work through startup; a Dashboard ad hoc start
  can begin without an attached story today. Include the default checkout,
  an isolated worktree, blank and attachment-only starts, and the scheduled
  feedback launch through the same admission boundary. Resolve follow-ups
  from a Taken or Done story, including from one of its sessions. A request
  with no resolvable source cannot start as a follow-up.
- Remove the standalone-session paths in Distribution and the Dashboard,
  including their branching, persisted shapes, specialized review and
  completion logic, test fixtures and cases, and guidance. Harden the entry
  points and types so an unassociated project session cannot flow into those
  paths. Use ordinary story membership and session records across startup,
  Land, completion, and review.
- Remove the 21 standalone Done review cases across ten legacy frontend
  specs. In `dashboard/frontend-tests/sessions/`, these are the six
  `recently-done-ad-hoc-*` specs retained at the Done review cutover, the
  `recently-done-sessions-review-cue-{evidence,races}` specs, the standalone
  case in `recently-done-sessions-select`, and the 31-day standalone case in
  `recently-done-story-sessions`. Preserve applicable story-linked coverage.
  [Runner retirement](SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)
  waits until no standalone legacy frontend spec remains on trunk.
- Preserve published story and per-session comparisons through the common
  path. Session selection within Intent, follow-up context
  composition, and open follow-up card cues have their own stories.

**UI.** **Start session** shows admission in progress. On refusal, show the
reason and let the developer retry that start. Use the existing instruction
label as the initial story title. When there is no usable label, use
“Ad hoc work” with the launch date and time, fixed on the first attempt.
A blank start opens the terminal awaiting the developer's first instruction
as soon as the Taken story exists. The Story card carries the Session entry
through the ordinary Board selection and review paths.

**Cutover.** Deliver one switch to story-linked startup, completion and
review. Preserve historical evidence through Git and local archives. Keep
open story-linked sessions and their original identifiers. Convert closed
records with corroborated story membership to the ordinary shape where
needed. Archive closed records with no corroborated story and their linked
attempt and reporting evidence. A former standalone row, a title, or a
shared workspace alone supplies no evidence of story membership.

Read-only production inventory on 2026-11-24 found two open launches, each
story-linked, and one unresolved standalone startup. The startup timed out
with an established isolated checkout, no bound launch, and no unique
commits or edits. Recheck native binding and checkout state before cutover.
If still unbound, let Continue use its existing attempt and checkout to
admit the story before opening a session. Keep the checkout and evidence if
ownership or native state cannot be confirmed. Reinventory before writes
switch, then verify that the delivered Dashboard reads the complete migrated
store before resuming writes. The one-time conversion ships no compatibility
path.

**Key examples.**

- A developer submits a new instruction, or opens a blank terminal. The
  project publishes one ordinary story and its Taken assignment, with queue
  order preserved, before the native session opens. It opens under that
  story and shows its Session entry. A refused admission opens no native
  session. A retry after a lost response reuses the admitted identity.
- A developer follows up a Taken or Done story. A new session opens with its
  own ID under the source story. The source story keeps its status. Land
  verifies the declared branch and records the exact accepted comparison for
  this session. Retry reports the same comparison without a second push.
- Completing newly admitted work and fetching in another clone shows the
  completed story and its session comparisons through Recently done and
  Intent, even after the checkout retires.

**Landing regression.** In v0.3.113, a story-linked follow-up's declared
branch context was refused before Git push because it carried a story
identity. Reproducing prepare against the retained record at `c80f0559a`
returned 409, `This is not the session's authorized branch landing.` The
same record is already Done, with its checkout retired and no prepared or
accepted Dashboard comparison. The rollback was published directly through
Git. Preserve that evidence with the exact `fe21e4639..0bdef6cb2` comparison
in history. Keep the closed context as historical evidence. A capture
receipt requires its own verified publication.

If the delivery inventory finds an affected open context, retain its launch
reference, verify its source story and the declared repository, workspace,
branch, remote, target and revision, and let it complete through the same
branch landing as new follow-ups. Refuse mismatched authority before push.

**Simplification proof.** Use the post-revert product as the baseline. Record
before and after source and shipped guidance size for Distribution and Dashboard,
and count executable cases across Distribution, Dashboard and E2E using the
same discovery commands for both revisions. Both product areas should shrink
and the combined case count should decrease. Keep focused coverage of
startup, retry, membership and ordinary completion and review. Delete obsolete
standalone cases and support.

**Previous approach.** SEED-420#review-standalone-done-work introduced
session-derived Done identities, local and published completion reconciliation,
an association conflict chooser, and specialized grouping and review. Its
[execution merge](https://github.com/terryyin/open-dough/commit/eef6f7234dffe03e7a3fa33e41805533b0dfdacc)
added 3,689 lines and removed 480 across Distribution, Dashboard and E2E.
The developer withdrew that design. Its seed and plan remain recoverable at
[preparation](https://github.com/terryyin/open-dough/commit/985168b9c1bf32c84c45814a83393bc9d17a1c2b).
Version 0.3.113 included the withdrawn behavior. Consider its retained data
when deciding cutover.
