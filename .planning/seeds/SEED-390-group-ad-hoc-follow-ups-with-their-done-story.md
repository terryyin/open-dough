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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/667-group-ad-hoc-follow-ups-with-their-done-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"947b06c709504fadae85271ef9b0a0973bb99ffd438c57d3078d27accdf0b172","plan":"059f8fde24a1a72fc8a3ee9c904b99519c009846252a808c25ab84fc63a74ae3"}}
```

#### Goal

A developer who starts an ad hoc follow-up from a completed story can jump
from the follow-up's entry in **Taken** back to its source story while it is
open, and finds it with that story's other closed follow-ups on the story's
**Recently done** card once it is marked Done.

[Follow up from Recently done](../../dashboard/LAUNCH-FOLLOW-UP.md) already
records the source story identity when the developer launches from the story
card or from a file or line in that story's review. Today the follow-up is an
ad hoc entry in Taken, then a standalone entry in Recently done, and neither
shows that relationship.

#### Scope

- A follow-up has one home at a time, by the rule a Done story's own sessions
  already follow: open, it is an entry in **Taken**; marked Done, it leaves
  Taken and is held by its source story's **Recently done** card; reopened,
  it returns to Taken. Terry chose this on 2026-11-16 over also showing open
  follow-ups on the card, which would be the Board's first session with two
  homes.
- An open follow-up's Taken entry names its source story. Activating the
  source title reveals the exact Done card, extending the displayed range
  through it when it is beyond the first ten entries.
- A Done follow-up sits on its source card with the story's other closed
  sessions, keeping its own label, status, host, and actions through reload
  and the existing local session retention. Card, whole-file, and line
  follow-ups use the same source-story relationship. The source story stays
  Done; local activity establishes no published Take, completion, assignment,
  or dependency.
- Match the configured project and full recorded source identity. Identities
  alone are not unique across projects, so a same-named story in another
  project must not receive the session. File and line anchors distinguish
  launches, not their source story.
- Ordinary ad hoc sessions retain their standalone placement. Launches that
  name only a source session retain their existing behavior; this increment
  does not infer a story by traversing session ancestry or parsing context
  text. It adds no manual linking, migration, host workflow, or shared
  cross-machine session history.
- Keep the story's own sessions, which decide the card's Follow up offer and
  the context a new follow-up receives, separate from the follow-ups the card
  now also holds. A follow-up of a source story is not evidence that the
  session executed or completed that story.

Source navigation also reveals a catalogued Done story outside the normal
30-day window, on demand. The default recent list and existing retention
policies stay unchanged. While no source card is included, a Done follow-up
keeps its standalone entry rather than being hidden.

Deferred promises, naturally unsupported rather than prevented: the source
card saying that follow-ups are still open in Taken; a standalone Done
follow-up naming its source; and a new follow-up's context including the
story's earlier follow-ups.

#### Key examples

- Given a Done story, start a card follow-up and a different file or line
  follow-up → both are entries in Taken, each naming that story, and neither
  is on its card → reload preserves both.
- Given those two open follow-ups → mark one Done → its Taken entry
  disappears and the source card holds it as Done with its own label and
  actions, while the other stays in Taken → mark the other Done → the card
  holds both → reload preserves the result. A Done follow-up of another
  story, or of a same-named story in another project, does not join them.
- Given a Done follow-up on its source card → reopen it → it returns to Taken
  naming its source and leaves the card.
- Given an open follow-up whose source card is the 27th recent entry →
  activate the source title from Taken, including by keyboard on a narrow
  screen → reveal and focus that exact card after reading the needed range.
  Keep a range already longer than 27, the selected story, and Side panel.
- Given an open follow-up of a story completed 31 days ago whose Done record
  is still catalogued → activate its source reference → reveal that exact
  card without selecting it. Show latest 10 or reload restores the default
  list; source navigation can reveal the card again.
- Given a Done follow-up of that 31-day-old story and the default list → it
  is a standalone Recently done entry, as an ordinary Done ad hoc session is.
- Given source details still being read or a failed read → the Taken entry
  stays accessible and its recorded source identity remains visible; use the
  existing reading, unavailable, and retry feedback rather than inventing a
  title or an unrecorded Done story.

#### UI and architecture

The source link uses the title when read and the identity while it is
unavailable. Revealing it follows existing semantic story navigation: useful
keyboard focus and a destination cue, without changing selection or replacing
Side panel content.

Derive the relationship from the existing retained launch request and the
published done catalog; do not create another persisted relationship store.
The source relationship and the existing evidence that an ad hoc session
_completed_ a story have different meanings and remain distinct. This follows
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
and the existing [navigation contract](../../docs/dashboard-navigation.md).
No Accepted ADR conflict was found; no new ADR or North Star topic is needed.

#### Direction

Three ways to show the relationship were compared against the same goal. A
link alone from Taken is simplest but leaves closed follow-ups scattered
through Recently done. Showing each follow-up on the card whatever its state,
borrowed from a case file whose related work items are all filed under the
case, shows running work on the card but gives one session two Board homes,
with their focus, count, and destination rules. The chosen direction borrows
the narrower filing rule the Board already applies to a Done story's own
sessions: work in progress stays in the working queue, carrying a reference
to its case, and is filed under the case when closed. The analogy does not
make a session a child story, reopen its source, or establish shared workflow
state, and it breaks where a case file would list work still in progress: the
card does not.

The strongest doubt about that choice is that the card is silent about a
running follow-up; it is recorded as a deferred promise. The earlier doubt was
the age mismatch: open sessions can remain indefinitely while their source
leaves the normal Board window. On 2026-11-16 Terry selected the recommended
on-demand reveal of an older catalogued source, keeping the default list
unchanged. Local observations and executable proof belong with the slice
plan. No human decision remains open; preparation grants no implementation
authority.
