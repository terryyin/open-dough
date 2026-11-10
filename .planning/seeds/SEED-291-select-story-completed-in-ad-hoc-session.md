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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/568-select-story-completed-in-ad-hoc-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"71d1f07f51b4fc845ead2f61bc5a8d87c19d88f70b1c519ed22f7232b3d35d78","plan":"acf6a14326e4268c1d7294e06eb33c969ee2c4ba09737597a7aedc7133efae8b"}}
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

**Scope.** Derive the completed-story association from verifiable retained
session and published completion evidence, including existing records such as
the Pygardon session. Reuse the existing Done story selection, Review changes,
and Intent views. The association answers which story this session completed;
it does not change how the session was launched or make local session state
authoritative for story completion.

Required behavior:

- Select the unique evidenced published Done story from the retained session
  row, preserving the current perspective and Side panel. Development reveals
  its selected Done card; Intent shows that selected story.
- Keep the historical story comparison and available saved proof usable after
  worktree/branch retirement and later trunk changes. Keep the **Ad hoc** label.
- Leave a session standalone when the evidence is absent or does not identify
  a unique completed story, preserving the current story selection. A failed
  or incomplete read remains unknown, distinguishable from a confirmed miss,
  with the existing retry and supersession behavior.

The retained-session promise supplies no additional age rejection: the
Board's default recent-story window is a presentation boundary, not evidence
that an older retained session completed no story. Do not expand routine
history or Done-detail reads to all records merely to recover one selection.

Deferred promises: standalone session review, manually attaching stories to
sessions, interpreting conversation text, and changing session retention. No
new layout or launch workflow is needed. These are delivery boundaries, not
requirements to reject behavior the common evidence rule naturally supports.

**Key examples.**

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
- Given a retained row whose uniquely evidenced Done story is older than the
  Board's default recent-story window, selecting it still selects the story
  and, in Development, reveals its card. Retention is unchanged.
- Given an evidence read still checking or unavailable, selecting the row
  does not replace the current story with a guess. The existing checking or
  unknown feedback applies; selecting again can retry. A later row, project
  choice, or explicit Open supersedes the unanswered selection.

**UX and architecture.** A row selects; its separate Open control opens the
session. Derive a completed-story association separately from the original
launch request, so the user can reach the completed story without changing
the meaning of **Ad hoc**, active assignments, or terminal/report actions.
Use the page's existing Selected story and Done-story reading rather than a
second ad hoc review path. A retained row may require a targeted published
Done read beyond the Board's default window; this keeps selection meaningful
without widening the overview's reads.

Follow [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
for selection, perspective, and Side panel ownership, and its
[published/local evidence boundary](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-product-concepts)
keeps Session entry and Selected story distinct. No ADR conflict or exception
is needed. ADRs 0007 and 0009 remain Proposed.

**Investigation and challenge (2026-11-10).** The strongest doubt is false
attribution: a landing can contain other stories, and a published claim can
exist without this session completing the story. Title, time, author, or an
incidental Done file alone cannot establish this association. Join the exact
launch reference to validated published claim/completion evidence and the
available accepted landing; select only when that evidence establishes one
completed story. This preserves the stated goal and smallest scope.

Observed at Open Dough `35644897f47d76f35f22ddd6407a8507844900ac`:

- Pygardon's retained launch `cf7384a1-f783-4d7c-ba40-ee779c4ecb49` is ad hoc
  and has a saved landing `2473613a63597f2d893d7c97beae92c2b06bb839` →
  `5614e88403b00bcd8869724081957c44245fd390`, without an explicit story
  identity. Claim `cb4fef787da3e62e4f77ee4b9d84107164ef581b` names that exact
  launch in `Claim-Publisher` and the expected story in `Claim-Identity`.
- Running the existing `storyCompletionEndpoints` against Pygardon
  `origin/main` at `955b71a546a4dfc4ce01eea2a6c27dfde5ac12af` recovered that
  claim and completion `5614e88403b00bcd8869724081957c44245fd390` in Story
  Branch Mode. The worktree and execution branch were already absent.
- Running `publishedStoryReview` for that completion returned a published
  comparison including `tests/fixtures/sharadar_vendor.py` (+13/−3). The Done
  record retains the Range-resume assessment inline; reading it needs none
  of the temporary files its report mentions.
- Running `launchSubject` on the retained record returned no story identity
  and **Ad hoc**. Running `sessionListing` removed the reporting reference
  and landing from its lightweight Done listing. The retained-history path
  holds those details; their absence from the overview is not missing evidence.

The historical recovery premise is observed, not hypothetical. The missing
association remains implementation work; existing selection fixtures supply
an execution request identity and do not prove ad hoc recovery.
