---
id: SEED-395
status: active
planted: 2026-11-17
planted_during: Wrap-up of SEED-390#group-ad-hoc-follow-ups-with-their-done-story deferred promises
trigger_when: selected from the product backlog
scope: story
---

# SEED-395 — Richer Done follow-up card cues

<a id="richer-done-follow-up-card-cues"></a>

### Richer Done follow-up card cues

**Identity:** SEED-395#richer-done-follow-up-card-cues

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Deferred from SEED-390; needs refinement before planning"],"basis":{"document":"e99f6b64c333015a163ae0ae6a7a9788841765ef523f88ca730713a3003ba590"}}
```

#### Goal

A developer reviewing a Done story's Recently done card can see that
follow-ups of that story are still open in Taken, can recognize a
Done follow-up's source when no source card is listed, and can find the
story's earlier follow-ups when continuing the work.

#### Scope

Queued from SEED-390#group-ad-hoc-follow-ups-with-their-done-story wrap-up
as its deferred promises (naturally unsupported there rather than
prevented):

- the source card saying that follow-ups are still open in Taken;
- a standalone Done follow-up naming its source;
- the card's route to earlier follow-ups. The [follow-up context
  story](SEED-415-choose-clear-follow-up-context.md#choose-clear-follow-up-context)
  owns the receiving message and its optional session selection.

Keep the one-home Board rule and source-versus-completion distinction
already delivered for story follow-ups unless a later human decision
changes them.

#### Key examples

- Given open story follow-ups in Taken and their listed Done source card →
  the card shows that those follow-ups are still open without giving them a
  second Board home.
- Given a Done story follow-up whose source card is not listed → its
  standalone Recently done entry names its source.
- Given a Done story with closed follow-ups, the reviewer can identify
  those sessions on the card and open the same story and sessions in Intent.
  Launching a follow-up uses that story as its source.
