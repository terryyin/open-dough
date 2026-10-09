---
id: SEED-126
status: active
planted: 2026-10-09
planted_during: Terry's report that dashboard story refreshes flicker while most information stays the same
trigger_when: A dashboard refresh of Git-derived story state or assignments visibly flashes or moves unchanged stories
scope: story
---

# SEED-126: Dashboard refreshes keep unchanged stories steady

## Why This Matters

The dashboard periodically reloads story information derived from Git, mostly
story state and assignment information. During each reload the page flickers
and flashes, and items move while loading, even though most of the reloaded
information is unchanged. The motion makes the board hard to read and to act
on, and it misrepresents a routine refresh as a change.

## Story

<a id="steady-dashboard-refresh"></a>

### Keep unchanged dashboard stories steady while story information reloads

**Identity:** SEED-126#steady-dashboard-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/284-steady-dashboard-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d35422873e3407ad4b5fdefe3ccb9d8356071fe03ae417ef7bca516f3700fe06","plan":"0915064afe283f63a368c7af7d637332605e0def4298ea696850144854f4d737"}}
```

**Beneficiary:** A developer watching or working from the Open Dough dashboard
while it reads a newly published revision of the project's story state and
assignments.

**Goal:** When the dashboard finds that the project's configured ref names a
new commit and reads that revision, every story and assignment it already
shows keeps its content and place until that revision's own answer for it
arrives, and the read under way is said without moving anything. A routine
refresh then looks like what it is: unchanged work stays still, and only what
the new revision changed is seen to change. Under the frequent trunk commits
that agents make, the board stays readable and actionable, and a refresh no
longer presents itself as a change.

**Observed cause (refinement, 2026-10-09):** A quiet 15-second check at an
unchanged revision changes nothing on screen, and the 15-second read of this
machine's sessions re-renders without moving anything. The flashing happens
when the configured ref moves. The page then rebuilds every card from the new
revision's backlog alone, with every detail set back to its reading
placeholder, fills the details back in over several separate waves, and
inserts the "Reading published work…" line into the page flow above the
columns for the length of the read. Observed on the production dashboard when
trunk moved from a4c1913e to 3ca3aaa5, a commit that refined one story and
released its preparation assignment: all thirteen backlog cards showed
"Reading preparation…" for about 3.4 seconds, both Preparing lines and their
portraits were removed and re-added, one Preparing line briefly lost its human
credit, an open inspection would have fallen back to "Reading purpose…", and
the columns moved down and back up. Recently done already keeps the last
revision's list, with its records reused when unchanged, until the new
catalog answers; Backlog and Taken do not.

**Scope:**

- Carry shown facts over by story identity. When a read of a new revision
  begins, each story and assignment already shown keeps what it shows until
  that revision's answer for that part arrives: card content, refinement and
  readiness badges, Preparing and owner lines with their portraits and human
  credit, slice progress and current slice time, dependencies, the agent
  roster, and an open story inspection. Membership and order still follow the
  new revision's backlog as soon as it is read: a new entry appears in its
  recorded place with the reading presentation a first visit gives it, an
  entry no longer listed leaves, and a reordered entry moves. Other cards
  shift only as far as those membership changes require.
- Replace, never blank. A part whose new answer equals what is shown changes
  nothing visible: no placeholder, no re-created portrait or avatar, no height
  change. A part whose answer differs updates in place when it arrives.
  Carry-over does not outlive the read attempt: when that revision's answer
  for a part settles as failed, limited, or missing, the part shows the same
  unavailable or problem presentation it shows today, and the existing
  read-problem notice and recovery schedule are unchanged.
- Say the read without moving the page. The read under way and its result
  stay announced as today, and whatever the page shows for a read under way
  occupies room the page header already reserves, so columns and cards never
  move for it. Keep one wording for this across the status region, the
  source status, and the
  [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md), which
  already asks that an unchanged snapshot settle and that refresh completion
  be announced without moving focus.
- Everything the dashboard does around a read keeps its meaning: the
  same-revision recovery read that already keeps shown facts, moved
  story-branch progress reads, reads after launch reconciliation, rate-limit
  and transient recovery, hidden and revealed pages, project switching (which
  still replaces the whole view), and focus held across a membership change.
  Nothing here adds motion; a card that moves because its recorded order
  changed may use the existing small placement transition, which
  reduced-motion preferences already disable.

**Deferred promises:** Initial loading of a project with no shown snapshot
keeps today's behavior and is not verified here. The notice a failed check,
read, or rate limit adds under the banner keeps taking its room: it is several
sentences with its own controls, a reserved line cannot hold it, and laying it
over the columns would cover cards for as long as a rate limit stands, so its
placement stays as today until a design for it is chosen. Animating a card's
travel between stages, labeling each carried-over part with the revision it
came from, and reducing the 15-second machine-session read are outside this
delivery. Deferral rejects none of them.

**Key examples / evaluation:**

1. Snapshot at revision A is shown: thirteen backlog entries, two Preparing,
   one Taken entry with slice progress and a clock → trunk moves to B, which
   touches no planning record → during and after the read, no card, Preparing
   line, portrait, progress bar, clock, or column changes or moves; the status
   region announces the read and its completion; the source status shows B and
   the new retrieval time. A layout-shift measurement over the read attributes
   none to these parts.
2. Same start → B records one story as refined and ends its preparation
   assignment → that card's refinement badge and Preparing line update when
   B's answer for it arrives; every other card keeps its content and place
   throughout; that card's own height change is the only movement.
3. Same start → B adds a backlog entry at priority 1 → the new card appears
   first with its own reading presentation and fills in; existing cards keep
   their content, their priorities change, and they move down only by the new
   card's height.
4. Same start → B removes a completed entry from the backlog → its card
   leaves, Recently done places it as today, and the remaining cards close
   the gap with no other change.
5. A story inspection is open at A → trunk moves to B → the inspection keeps
   its purpose, assessment, and slice facts, updating only what B changed;
   focus stays where it was.
6. B is found, its backlog is read, and one record's read is not answered
   within the wait bound → the card keeps its shown facts while the read is
   under way; when the bound gives the read up, that card's part shows
   today's gap presentation and the existing notice says what was not read
   and when the page reads it again. No card blanked in between.

**Architecture:**

- Carry-over belongs to the assembly of the new revision's snapshot, not to
  presentation components remembering their last value. The snapshot being
  assembled starts from the shown snapshot's facts for every identity the new
  backlog still lists, and each part is replaced as its answer arrives;
  reading placeholders apply only to parts with no carried fact. Recently
  done's "keep the last catalog until the new one answers" is the precedent;
  generalize it into one carry-over concept for the whole snapshot rather
  than adding a second mechanism beside it.
- The read-under-way indication is a presentation concern: the page header
  reserves its room in both states instead of inserting and removing a line.
- Alternative considered: assemble the whole revision off screen and swap it
  in once, double-buffer style, so that the page only ever shows one coherent
  revision. Not chosen: it would hold newly published cards until every detail
  has been read, contradicting the
  [published observation contract](../../dashboard/PUBLISHED-OBSERVATION.md)
  that cards appear without waiting on anything else, and it still needs a
  partial-failure rule. Per-part carry-over keeps that contract; the status
  region already says that what is shown is still the earlier snapshot while
  the read is under way, which keeps the North Star's honesty about
  previously retrieved evidence without labeling each part.
- Borrowed mechanism: radar track coasting. A display keeps a track's last
  plotted position when a sweep returns no plot for it, instead of blanking
  the track, and drops the track only after enough missed sweeps. Here the
  revision read is the sweep, each story part is a track, a part whose answer
  has not yet arrived is a missed plot, and a part whose read settled as
  failed is a dropped track that shows the failure presentation. The analogy
  breaks on extrapolation: a coasted radar track advances by dead reckoning,
  whereas the dashboard must hold a fact exactly as last read and never
  advance state, progress, or an assignment by expectation.
- Decisions: no Accepted ADR is affected; the derived view stays rebuildable
  from its sources with no new cache or persisted state, consistent with the
  Proposed [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md),
  which binds nothing. The published observation contract's sentence "Each
  read replaces the whole view with one revision" describes the facts, not
  the presentation, after this story; execution updates that contract and the
  tests that assert today's placeholders on unchanged cards.

**Dependencies:** No blocking story prerequisite.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard source](../../dashboard/src/).
- [Published observation contract](../../dashboard/PUBLISHED-OBSERVATION.md).
- [Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md).
