---
id: SEED-390
status: active
planted: 2026-11-16
planted_during: Request to group ad hoc follow-up sessions under their source story and link to it from Taken
trigger_when: selected from the product backlog
scope: story
---

# SEED-390 — Group ad hoc follow-ups with their Done story

<a id="group-ad-hoc-follow-ups-with-their-done-story"></a>

### Group ad hoc follow-ups with their Done story

**Identity:** SEED-390#group-ad-hoc-follow-ups-with-their-done-story

```json dough-story-state
{
  "schemaVersion": 1,
  "refinement": "refined",
  "approach": "planned",
  "plan": "../slice-plans/667-group-ad-hoc-follow-ups-with-their-done-story/PLAN.md",
  "assessment": "ready",
  "reasons": [],
  "basis": {
    "document": "87049103a751ad3a8ea5119b776f5f5efa5029f4b5ab2a89e9cecd4c25ab8bae",
    "plan": "eef9975520035a505975685cf86c5125e676738cc84d9ce20d3a934cdc5eb6f7"
  }
}
```

#### Goal

A developer who starts an ad hoc follow-up from a completed story can find it
with the other follow-ups on that story's **Recently done** card and jump back
to the source story from the follow-up's entry in **Taken**.

[Follow up from Recently done](../../dashboard/LAUNCH-FOLLOW-UP.md) already
records the source story identity when the developer launches from the story
card or from a file or line in that story's review. Today the open follow-up
appears as an ad hoc entry in Taken without showing that relationship.

#### Scope

- A confirmed ad hoc launch whose saved request names a source Done story
  appears with that story's follow-ups on its **Recently done** card. Card,
  whole-file, and line follow-ups use the same source-story relationship;
  their distinct sessions retain their own labels, status, host, and actions.
- An open follow-up also remains an entry in **Taken**, naming its source
  story. Activating the source title reveals the exact Done card, extending
  the displayed range through it when it is beyond the first ten entries.
  Showing the same session in both places creates no second session record.
- Marking the follow-up Done removes its Taken entry and leaves its source
  association intact through reload and the existing local session retention.
  The source story stays Done; local activity establishes no published Take,
  completion, assignment, or dependency.
- Match the configured project and full recorded source identity. Identities
  alone are not unique across projects, so a same-named story in another
  project must not receive the session. File and line anchors distinguish
  launches, not their source-story group.
- Ordinary ad hoc sessions retain their standalone placement. Launches that
  name only a source session retain their existing behavior; this increment
  does not infer a story by traversing session ancestry or parsing context
  text. It adds no manual linking, migration, host workflow, or shared
  cross-machine session history.
- Keep the original story sessions' follow-up context and actions separate
  from the new display association. A follow-up of a source story is not
  evidence that the session executed or completed that story.

Source navigation also reveals a catalogued Done story outside the normal
30-day window, on demand. The default recent list and existing retention
policies stay unchanged. If no source card is currently included, retain
standalone access to a Done follow-up rather than hiding its session.

#### Key examples

- Given a Done story, start a card follow-up and a different file or line
  follow-up → both appear together on its card, each with its own label and
  status, while both open sessions remain in Taken → reload preserves both
  associations. A follow-up of another story does not join this group.
- Given an open follow-up whose source card is the 27th recent entry →
  activate the source title from Taken, including by keyboard on a narrow
  screen → reveal and focus that exact card after reading the needed range.
  Keep a range already longer than 27, the selected story, and Side panel.
- Given an open follow-up of a story completed 31 days ago whose Done record
  is still catalogued → activate its source reference → reveal that exact
  card with its follow-ups without selecting it. Show latest 10 or reload
  restores the default list; source navigation can reveal the card again.
- Given an open follow-up shown in both places → mark that session Done →
  its Taken entry disappears and its source card still holds it as Done;
  reload preserves the result. A project-row ad hoc session remains
  standalone when open or Done.
- Given source details still being read or a failed read → the session stays
  accessible and its recorded source identity remains visible; use the
  existing reading, unavailable, and retry feedback rather than inventing a
  title or an unrecorded Done story.

#### UI and architecture

The developer can approach the same session from a working queue or its
completed source. Its session status must remain explicit beside the Done
story so that grouping cannot imply the follow-up is Done. The source link
uses the title when read and the identity while it is unavailable. Revealing
it follows existing semantic story navigation: useful keyboard focus and a
destination cue, without changing selection or replacing Side panel content.

Derive the relationship from the existing retained launch request and the
published done catalog; do not create another persisted relationship store.
The source relationship and the existing evidence that an ad hoc session
_completed_ a story have different meanings and remain distinct. This follows
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
and the existing [navigation contract](../../docs/dashboard-navigation.md).
No Accepted ADR conflict was found; no new ADR or North Star topic is needed.

#### Direction

Prefer a derived source-story group, borrowing the case-file mechanism: the
completed story is the case, its follow-up sessions are related work items,
and Taken is the working queue's reference to those same items. The analogy
does not make a session a child story, reopen its source, or establish shared
workflow state. A link alone is simpler but misses the grouping example; a
new persisted parent relationship duplicates the launch's recorded source
without adding value for these examples.

The strongest consequential doubt was the age mismatch: open sessions can
remain indefinitely, while their source can leave the normal Board window.
On 2026-11-16 Terry selected the recommended on-demand reveal of an older
catalogued source, keeping the default list unchanged. This settles the
navigation boundary without adding another relationship store or reopening
the source. Local observations and executable proof belong with the slice
plan. No human decision remains open; preparation grants no implementation
authority.
