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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
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
  can begin without an attached story today. Include starts without an
  initial instruction and follow-ups of both Taken and Done stories.
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

**Cutover.** Switch directly to the story-linked workflow at delivery. Retire
standalone rows and their selection paths at the same time, following
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
During refinement, inventory retained local and published records, identify
work still in flight, and decide which local records need conversion. Keep
published evidence recoverable through Git history. If needed, migrate
production data once on this machine as part of delivery. Verify that the
delivered Dashboard can read the complete local launch store before resuming
writes. Remove all migration code after the migration. The delivered product
uses only the story-linked workflow.

**Key examples.**

- Starting a new ad hoc session immediately shows one new ordinary story in
  Taken with that session attached. The queued backlog keeps its order. A
  lost startup response and a retry use the same story.
- Starting a follow-up of a Taken or Done story opens a new session with the
  same story identity. Land accepts the follow-up's declared branch and saves
  the exact comparison under its own session ID. A retry uses the same
  session and comparison. The source story retains its status.
- Completing the new story and fetching it in a second clone lets a developer
  find its sessions and open the recorded changes through the same Done and
  Intent paths used by other stories.

**Landing regression.** In v0.3.113, declaring a branch from a
story follow-up saved its story identity in the Dashboard landing context.
The Dashboard's retained-landing check refused a declared branch with that
field set, before any Git push. The rollback at `0bdef6cb2` removed the
field from newly created contexts. A retry of a context already saved by
the earlier version still returned `This is not the session's authorized
branch landing.` The rollback itself landed directly through Git, so this
session's Dashboard comparison was never recorded. Its exact Git comparison
is `fe21e4639..0bdef6cb2`.

Include those retained contexts in the cutover inventory. During refinement,
determine how an affected open session can complete under its existing
identity with a verified comparison. Cover both the new follow-up path and
the disposition of any affected retained contexts with the existing landing
proof. Preserve repository, workspace, branch, target, and revision checks.

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
