# Make the selected story easier to see

<a id="visible-selected-story"></a>

### Make the selected story easier to see

**Identity:** SEED-215#visible-selected-story
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/440-visible-selected-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9b94cd3e028309b60364cf2b79faeb97cd6288d33e776dabc0574e1e9e8dcf33","plan":"654217c0d573bead325d179683322ffb9c6d3914166c05d90f9ae280864d1036"}}
```

**Goal:** Make the dashboard's selected story visually obvious with a tinted background.

**Scope:** Use the existing accent-soft background for inspected story cards and story cards whose session is shown in the side panel. Preserve their existing selection borders, outlines, and startup marks. Change only selection highlighting.

**Key examples:**

- Inspect a story: its card has a pale blue background while neighboring unselected cards retain their ordinary fill; closing detail restores the ordinary fill unless its session is still shown.
- Open a story's session in the side panel: its card has the same pale blue background; choosing another story's session moves that highlight.
- An inspected card that also has its session shown retains its fill until neither selection applies. Startup marks remain distinct and text remains readable.

**Exclusions:** Changes to selection behavior, navigation, layout, badges, or unrelated session styling.
