# Delete the record of a session Claude Code no longer lists

## Source and authority

- **Identity:** SEED-052#delete-unavailable-session-record
- **Source:** [refined story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#delete-unavailable-session-record)
  (Goal, Scope, Key examples; Terry, 2026-09-30).
- **Authority:** planning only. This plan grants no Take or implementation.

## Goal and scope

A developer can remove the dashboard record of a session that reads “Session
unavailable”, as they can for “State unknown”. Included: “Delete record…” on a
card or Recent sessions entry while its session reads State unknown or Session
unavailable; the server's re-read keeps the record (“This session's state is now
known”) when the session then reads anything else, including Done; the North
Star and Agent launch text. Excluded: the Sessions sidebar (no delete), Done
entries, bulk or automatic clean-up, any change to the question, keyboard,
status wording or terminal closing.

## Direction followed

- PFE: the delete already exists end to end (`src/deleteRecord.ts`,
  `server/agentLaunchPlugin.ts` `deleted`, `src/SessionEntry.tsx` `DeleteRecord`,
  `src/pageSessions.ts` `deleteRecord`). Only its one condition widens; reuse all
  of it. The condition is a domain rule that both the page and the server apply,
  so it is named once beside `attachOpens` in `dashboard/src/agentLaunch.ts`
  (shared, no Node import), not spelled twice.
- No consequential architectural choice; no ADR or North Star topic is added.
  UI wording rows change in the [UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md).

## Decisive premises

| Premise | Slice | Observation | Result |
| --- | --- | --- | --- |
| A session reads “Session unavailable” exactly when its state is `unlisted` and it is not marked done; marked done and unlisted reads “Done” | 1, 2 | read `dashboard/src/sessionShown.ts` | yes |
| The server has the record's `doneAt` when it re-reads | 1 | read `deleted` in `server/agentLaunchPlugin.ts`: `launches.stateOf(source, record)` returns a `LaunchWithState` (`doneAt` included, `src/agentLaunch.ts`) | yes |
| A test already drives an unlisted session through the delete boundary and the page | 1, 2 | `dashboard/tests/agent-launch-delete.spec.ts` (`claudeSessionBecomes(id, "forgotten")`, expects `state-known`); `agent-launch-card-delete.spec.ts` “a Working, Needs input, or Session unavailable entry offers no Delete record…”; `agent-launch-recent-delete.spec.ts` “another state offers none” | yes: these three contradict the story and are updated, not duplicated |
| Focused run command | 1, 2 | `npm run test:dashboard -- --grep <title>` (`dashboard/tests/README.md`) | documented |

## Outside-in proof

Dashboard Playwright specs against the page's own server and the synthetic
`claude` (`fixtures/fake-claude`), as the existing delete specs do.

## Slices

### 1. The boundary deletes the record of an unavailable session
Type: Behavior
Status: done
Accepted proof: `npm run test:dashboard -- --grep "deleting a recorded session"`
(7 passed, all of `agent-launch-delete.spec.ts`; `recordDeletable` in
`src/agentLaunch.ts` is the shared condition, used by `deleted`).
Proof: extend `agent-launch-delete.spec.ts`: a launched session that becomes
`forgotten` (unlisted, not marked done) is deleted by the boundary (`kind:
"deleted"`, record gone, no `stop`); a `working` one and an unlisted one marked
done keep their record and answer `state-known`. The existing “forgotten keeps
the record” case moves to the deleted case. Run with `--grep`.

Behavior: a recorded session Claude Code does not list, not marked done →
Delete record request → the record is removed and nothing else is touched.
Introduce the named condition beside `attachOpens` in `src/agentLaunch.ts`
(State unknown, or unlisted and not marked done) and use it in `deleted`.

### 2. The page offers Delete record… on an unavailable entry
Type: Behavior
Status: done
Accepted proof: `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-recent-delete.spec.ts dashboard/tests/agent-launch-card-delete.spec.ts --repeat-each 8`
(40 passed); `--grep delet` 20 passed; `--grep navailable` 14 passed. The page-level
"state is now known" case uses unlisted-and-marked-done (the fake `claude` cannot
re-list a forgotten session); listed-again is proved at the boundary in slice 1.
Learning: a test that reloads right after `launch(...)` must await
`sessionNamedBy` for every launched entry (fixed the flaky
`agent-launch-recent-delete.spec.ts` case).
Proof: update `agent-launch-card-delete.spec.ts` (the Session unavailable entry
now offers “Delete record…”, asks, and on confirm leaves its card, Recent
sessions and the sidebar with the status “Session record deleted”; Working and
Needs input still offer none) and `agent-launch-recent-delete.spec.ts` (a Recent
entry reading Session unavailable offers it; Working and Done still offer none;
the sidebar still offers none). A session that becomes listed after the page
read “Session unavailable”: Delete record keeps the record and says “This
session's state is now known”. Update the North Star row and `AGENT-LAUNCH.md`
“Delete record” paragraph in the same slice. `DeleteRecord` uses the shared
condition in place of its local `unknown` test.

Behavior: an entry reading Session unavailable → Delete record… → confirm →
the entry is gone from every list.

## Execution complete

Product advice: no change. The delivered story removes one more dashboard
record-clutter case; the queued SEED-052 follow-ups (screen-reader announcement
of deletion, session-entry split) are unaffected.
