# Source-only review

**Identity:** SEED-291#select-story-completed-in-ad-hoc-session

**Launch:** Fresh general-purpose reviewer with no conversation inheritance; source text only (Goal, Scope, required behavior, key examples, deferred exclusions, UX/architecture, evidence-rule investigation clause). No plan, product, or proof supplied. Reviewer agent `3e9fc739-0e8c-4d9d-b802-dc7afb8dcc17`.

**Input:** `.planning/seeds/SEED-291-select-story-completed-in-ad-hoc-session.md` section `select-story-completed-in-ad-hoc-session` (Goal through Investigation note).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer returning to a completed ad hoc session can select the story it completed, review the landed changes, and see their impact in Intent after the worktree is gone. | slice 1 | observed: recently-done-sessions-select-ad-hoc.spec.ts + ad-hoc-review: select Done, Review/Intent after retirement |
| 2 | Derive the completed-story association from verifiable retained session and published completion evidence, including existing records such as the Pygardon session. | slice 1 | observed: completedStoryAssociation.ts + completed-story-association.spec.ts Pygardon-shape link |
| 3a | Reuse the existing Done story selection view. | slice 1 | observed: recentlyDoneSelection.ts reuses Selected story path; ad-hoc.spec selects Done card identity |
| 3b | Reuse the existing Review changes view. | slice 1 | observed: ad-hoc-review.spec.ts opens Story review after ad hoc select |
| 3c | Reuse the existing Intent view. | slice 1 | observed: ad-hoc.spec.ts keeps Intent perspective and shows selected story |
| 4 | The association answers which story this session completed. | slice 1 | observed: GET completed-story linked identity; recentlyDoneLink applies association without rewriting request.identity |
| 5a | The association does not change how the session was launched. | slice 1 | observed: Ad hoc tooltip retained; request.workflow stays ad-hoc in association.spec |
| 5b | The association does not make local session state authoritative for story completion. | slice 1 | observed: association derived server-side from claim/landing; no persisted completion on launch record |
| 6 | Select the unique evidenced published Done story from the retained session row. | slice 1 | observed: ad-hoc.spec linked identity; association.spec unique matched link |
| 7a | Selecting that story preserves the current perspective. | slice 1 | observed: ad-hoc.spec Intent choice remains checked |
| 7b | Selecting that story preserves the Side panel. | slice 1 | observed: ad-hoc.spec Final report remains after select; aria-current on report row |
| 8a | In Development, selection reveals the selected Done card. | slice 1 | observed: ad-hoc-development.spec.ts older Done card selected and in view |
| 8b | In Intent, selection shows that selected story. | slice 1 | observed: ad-hoc.spec data-selected-story and story title |
| 9a | Keep the historical story comparison usable after worktree/branch retirement and later trunk changes. | slice 1 | observed: ad-hoc-review.spec historical revisions ≠ trunk; sharadar_vendor Added |
| 9b | Keep available saved proof usable after worktree/branch retirement and later trunk changes. | slice 1 | observed: ad-hoc.spec / ad-hoc-review Intent coverage Range-resume text |
| 10 | Keep the Ad hoc label. | slice 1 | observed: ad-hoc*.spec Ad hoc tooltip title line |
| 11a | Leave a session standalone when the evidence is absent. | slice 1 | observed: association.spec no matching claim → absent; ad-hoc.spec standalone miss keeps story |
| 11b | Leave a session standalone when the evidence does not identify a unique completed story. | slice 1 | observed: association.spec two independently matching candidates → absent |
| 12 | In those standalone cases, preserve the current story selection. | slice 1 | observed: ad-hoc.spec standalone miss preserves data-selected-story |
| 13a | A failed or incomplete evidence read remains unknown, distinguishable from a confirmed miss. | slice 1 | observed: association.spec unreadable revision → unavailable not absent; check.spec fail path |
| 13b | That unknown state uses the existing retry behavior. | slice 1 | observed: ad-hoc-check.spec.ts failed association retries to link |
| 13c | That unknown state uses the existing supersession behavior. | slice 1 | observed: ad-hoc-check.spec unanswered association superseded by another row |
| 14 | The retained-session promise supplies no additional age rejection: the Board’s default recent-story window is a presentation boundary, not evidence that an older retained session completed no story. | slice 1 | observed: ad-hoc-development.spec controlled-clock Done beyond 30-day window still selects |
| 15 | Do not expand routine history or Done-detail reads to all records merely to recover one selection. | slice 1 | observed: ad-hoc.spec done=bodies spy empty during association GET; association iterates claimed identities only |
| 16a | Deferred / out of scope: standalone session review. |  | G1 |
| 16b | Deferred / out of scope: manually attaching stories to sessions. |  | G2 |
| 16c | Deferred / out of scope: interpreting conversation text. |  | G3 |
| 16d | Deferred / out of scope: changing session retention. |  | G4 |
| 16e | No new layout or launch workflow is needed. |  | G5 |
| 17 | Those deferred items are delivery boundaries, not requirements to reject behavior the common evidence rule naturally supports. | slice 1 | observed: common evidence rule admits dual-absent and targeted older reveal without deferred features |
| 18a.1 | Given a retained ad hoc session with evidence linking it to one published Done story, selecting its Recently done sessions row selects that story. | slice 1 | observed: ad-hoc.spec Select links ad hoc row to Story A |
| 18a.2 | In that case, in Development it brings the Done story card into view. | slice 1 | observed: ad-hoc-development.spec Done card in view |
| 18a.3 | In that case, in Intent it keeps the developer in Intent and shows the selected story. | slice 1 | observed: ad-hoc.spec Intent remains checked with selected story |
| 18a.4 | In that case, selection leaves the Side panel as it was, following ADR 0008. | slice 1 | observed: ad-hoc.spec Final report text and aria-current preserved; no Terminal |
| 18b.1 | With the worktree and execution branch retired and trunk advanced, the selected story’s Review changes and Intent use the story’s historical comparison and available proof. | slice 1 | observed: ad-hoc-review.spec after retire+trunk advance historical Review/Intent |
| 18b.2 | In the Pygardon example, the review includes the Sharadar vendor fixture change. | slice 1 | observed: ad-hoc-review.spec sharadar_vendor.py Added |
| 18b.3 | In the Pygardon example, Intent coverage shows the saved Range-resume assessment. | slice 1 | observed: ad-hoc-review / ad-hoc.spec Range-resume assessment text |
| 18b.4 | In that case, the session retains its Ad hoc launch label. | slice 1 | observed: ad-hoc-review.spec Ad hoc tooltip retained |
| 18c.1 | If the evidence is absent or cannot identify a unique completed story, the session remains standalone. | slice 1 | observed: association dual-candidate absent; ad-hoc standalone miss |
| 18c.2 | In that case, selecting its row preserves the current story selection. | slice 1 | observed: ad-hoc.spec miss preserves prior selection |
| 18d.1 | Given a retained row whose uniquely evidenced Done story is older than the Board’s default recent-story window, selecting it still selects the story. | slice 1 | observed: ad-hoc-development.spec older retained Done still selects |
| 18d.2 | In that case, in Development, selection reveals its card. | slice 1 | observed: ad-hoc-development.spec reveals older card |
| 18d.3 | In that case, retention is unchanged. | slice 1 | observed: no retention window change; targeted reveal only |
| 18e.1 | Given an evidence read still checking or unavailable, selecting the row does not replace the current story with a guess. | slice 1 | observed: ad-hoc-check.spec checking does not set selected story |
| 18e.2 | In that case, the existing checking or unknown feedback applies. | slice 1 | observed: ad-hoc-check.spec checking/unknown feedback via choice status path |
| 18e.3 | Selecting again can retry. | slice 1 | observed: ad-hoc-check.spec fail then retry links |
| 18e.4 | A later row, project choice, or explicit Open supersedes the unanswered selection. | slice 1 | observed: ad-hoc-check.spec later row supersedes unanswered |
| 19a | A row selects. | slice 1 | observed: row click selects; aria-pressed true |
| 19b | Its separate Open control opens the session. | slice 1 | observed: Open still opens report (ad-hoc.spec shown.open before select) |
| 20 | Derive a completed-story association separately from the original launch request. | slice 1 | observed: recentlyDoneLink / completedStoryAssociation separate from launchSubject identity |
| 21a | So the user can reach the completed story without changing the meaning of Ad hoc. | slice 1 | observed: Ad hoc label meaning unchanged in tooltips |
| 21b | …without changing the meaning of active assignments. | slice 1 | observed: no rewrite of active assignment identity via launchSubject |
| 21c | …without changing the meaning of terminal/report actions. | slice 1 | observed: Open/report/terminal actions unchanged; select does not attach terminal |
| 22 | Use the page’s existing Selected story and Done-story reading rather than a second ad hoc review path. | slice 1 | observed: reuses page Selected story and Done reading; no second ad hoc review path |
| 23 | A retained row may require a targeted published Done read beyond the Board’s default window; this keeps selection meaningful without widening the overview’s reads. | slice 1 | observed: ad-hoc-development reveal beyond default window without overview widening |
| 24a | Follow ADR 0008 for selection, perspective, and Side panel ownership. | slice 1 | observed: selection/perspective/Side panel follow ADR 0008 in ad-hoc.spec |
| 24b | Follow ADR 0008’s published/local evidence boundary. | slice 1 | observed: server association from published claim/landing; browser does not supply trusted paths |
| 25 | ADR 0001 keeps Session entry and Selected story distinct. | slice 1 | observed: Session entry (Ad hoc row) distinct from Selected story identity |
| 26 | No ADR conflict or exception is needed. | slice 1 | observed: no ADR conflict or exception introduced |
| 27a | ADR 0007 remains Proposed. | slice 1 | observed: ADR 0007 untouched Proposed |
| 27b | ADR 0009 remains Proposed. | slice 1 | observed: ADR 0009 untouched Proposed |
| 28 | Join the exact launch reference to validated published claim/completion evidence and the available accepted landing. | slice 1 | observed: completedStoryAssociation joins Claim-Publisher reference to landing completion |
| 29 | Select only when that evidence establishes one completed story. | slice 1 | observed: linked only when matched.length === 1 and no unread |
| 30a | Title alone cannot establish this association. | slice 1 | observed: association ignores title-only; claim/landing required |
| 30b | Time alone cannot establish this association. | slice 1 | observed: association ignores time-only |
| 30c | Author alone cannot establish this association. | slice 1 | observed: association ignores author-only |
| 30d | An incidental Done file alone cannot establish this association. | slice 1 | observed: Done-at-base alone absent; incidental Done insufficient |
| 31 | A landing can contain other stories, and a published claim can exist without this session completing the story; avoid false attribution. | slice 1 | observed: takeover and dual-candidate cases avoid false attribution |
