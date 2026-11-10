---
id: SEED-291
status: active
planted: 2026-11-10
scope: story
---

# SEED-291: Select the story completed in an ad hoc session

<a id="select-story-completed-in-ad-hoc-session"></a>

### Select the story completed in an ad hoc session

**Identity:** SEED-291#select-story-completed-in-ad-hoc-session

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer returning to a completed ad hoc session can select the
story it completed, review the landed changes, and see their impact in Intent
after the worktree is gone.

**Current behavior.** Pygardon's ad hoc test optimization session completed
`SEED-20261092#faster-sharadar-test-feedback`. Its published claim `cb4fef787`
names the session's launch reference, and its saved landing `5614e8840` matches
the published story completion. The dashboard treats the session as standalone
because its launch request carried no story. The Done story can be reviewed
separately, but selecting the session does not select it.

**Acceptance examples.**

- Given a retained ad hoc session with evidence linking it to one published
  Done story, selecting its Recently done sessions row selects that story. In
  Development it brings the Done story card into view. In Intent it keeps the
  developer in Intent and shows the selected story. Selection leaves the Side
  panel as it was, following [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts).
- With the worktree and execution branch retired and trunk advanced, the
  selected story's **Review changes** and Intent use the story's historical
  comparison and available proof. In the Pygardon example the review includes
  the Sharadar vendor fixture change, and **Intent coverage** shows the saved
  Range-resume assessment. The session retains its **Ad hoc** launch label.
- If the evidence is absent or cannot identify a unique completed story, the
  session remains standalone. Selecting its row preserves the current story
  selection.

**Scope.** Reuse the existing Done story review and Intent views. The link is
based on verifiable session and published completion evidence, including for
existing records such as the Pygardon session. Standalone session review is
separate work.
