---
id: SEED-106
status: active
planted: 2026-10-06
planted_during: Terry's request to stop the dashboard's main columns wrapping on narrower screens
trigger_when: A developer views the dashboard in a window too narrow to show the Backlog, Taken, and Recently done columns side by side
scope: story
---

# SEED-106: Dashboard paged columns

## Why This Matters

Backlog, Taken, and Recently done page horizontally in a page too narrow to
show all three ([dashboard README](../../dashboard/README.md)). The stories
below correct and extend that paging.

## Stories

<a id="paged-columns-reveal-and-count-correction"></a>

### Paged dashboard columns reveal by structure and count only what is read

**Identity:** SEED-106#paged-columns-reveal-and-count-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/259-paged-columns-reveal-and-count-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"eb85a668db886807b805cb5c53b59cf7131ae5b9c4b080a3a8c0e2b87a560068","plan":"8428c5d8297e4faf0910cf2e771302dd0f40a0e9d6e472c8d16ebc0bcceb8558"}}
```

**Goal:** A developer paging the dashboard columns keeps the view they chose
when a launch dialog opens from a shown card, and an edge control never
states a Recently done count before the sessions are read. This corrects
the paged dashboard columns delivery (SEED-106#paged-dashboard-columns,
`be7125e4:.planning/seeds/SEED-106-dashboard-paged-columns.md`); it adds no
feature promise.

**Scope:** Focus and `keepInView` reveals move to the column that holds the
element in the page, not to where it appears on screen; the Recently done
edge control names the column without a count until the sessions are read;
the column summary has one home with the dashboard columns; the
reduced-motion rule that can no longer apply goes. Every promise of the
paged dashboard columns story is preserved.

**Plan:** [259-paged-columns-reveal-and-count-correction](../slice-plans/259-paged-columns-reveal-and-count-correction/PLAN.md)

<a id="paged-columns-height-follows-shown"></a>

### The page ends where the shown dashboard columns end

**Identity:** SEED-106#paged-columns-height-follows-shown
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/271-paged-columns-height-follows-shown/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0b49a0e04242294405c018003b6cf843a89ac76dade48253318532aadebe215e","plan":"528af2d116e7a42a60dbca0f28d66d3fb6bf352fbd51153dde56d16a8f1346a5"}}
```

**Beneficiary:** A developer reading a narrower dashboard page whose shown
columns are short while a hidden column, such as Backlog or Recently done,
is tall.

**Goal:** The developer can finish reading the shown columns at the end of
their content, without scrolling through a blank tail contributed by a hidden
column. Revealing a longer column makes all of its content reachable again.
This keeps the dashboard useful for following work in a narrow window, at
browser zoom, or beside an open sidebar or side panel.

**Scope:**

- With one or two columns shown, the longest shown column determines the
  content's vertical extent. Normal page framing and the existing edge
  controls keep their space; hidden columns contribute no extra blank scroll.
- The extent follows which columns are shown, whether changed by an edge
  control, keyboard focus, a Sessions sidebar selection, or the available
  page width. Every shown column's full content remains reachable as that
  content grows or shrinks, including an opened story inspection.
- Paging preserves the current vertical position while it lies within the
  new scroll range. If shorter shown content makes that position impossible,
  the page stops at its new bottom. Revealing a focused or selected item still
  brings that item into sight. There is no new return-to-top behavior or
  promise of a separate remembered vertical position for each column.
- Hidden columns retain their reading and tab order. Keyboard focus and a
  Sessions sidebar selection still reveal them, focus stays with the item
  reached, and stage headings keep sticking below the window's pinned banner
  where they do today. Content continues to scroll with the page.
- Edge controls retain their names, counts, reachability, focus handoff,
  one-column moves, and motion preference behavior. The browser's kept column
  position, width-dependent paging, and absence of sideways page scrolling
  are preserved. When all three columns fit, their existing presentation and
  page length are preserved.

**Key examples:**

1. Backlog and Taken are shown in a two-column page, while Recently done is
   much longer and hidden → the developer scrolls to the end → the page ends
   after the longer shown column and its normal framing, rather than allowing
   continued scrolling through the hidden column's length. The same rule
   applies with Taken and Recently done shown beside a hidden long Backlog,
   or with only one short or empty column shown.
2. A long shown column is scrolled far down → the developer uses an edge
   control to show shorter columns → the page contracts and the vertical
   position is limited to their new bottom; the edge control pointing back
   remains reachable. Paging back to the long column makes its end reachable
   again without resetting the developer to the top. A move whose new content
   still accommodates the current position keeps that position.
3. Only Taken is shown and Backlog is hidden → the developer tabs backwards
   from Taken's first card to Backlog's last card → Backlog is revealed with
   that card focused and in sight, and its complete length can be scrolled.
   Choosing a session in a hidden column through the Sessions sidebar likewise
   reveals the column and brings the chosen session into sight.
4. A shown card's inspection is closed → the developer opens it, reads to its
   end, then closes it → the opened text is fully reachable and closing it
   removes the extra page length. A hidden column growing does not add a blank
   tail below the shown content.
5. Taken and Recently done are shown beside a hidden long Backlog → the
   developer widens the page until all three fit → Backlog's length becomes
   reachable in the ordinary three-column overview. Narrowing again uses the
   existing kept-column rule and the extent of the columns now shown.

**Observed premise:** On 2026-10-07, the live Open Dough dashboard at
`http://127.0.0.1:4173/`, reporting published work revision `cee52a5`, was
observed in Chromium at an 864 × 700 viewport with reduced motion. Backlog and
Taken were shown and ended at approximately 3,536px and 1,540px from the page
top. Hidden Recently done ended at approximately 96,641px; the document was
96,665px tall. A wheel scroll to 6,000px showed blank space below both shown
columns. Activating the Recently done edge control revealed actual content at
the same depth; activating Backlog to return to the shorter pair left the
blank view and the same document height. This confirms the hidden-column
height premise through scrolling, revealing the long column, and returning;
the example in which Backlog is the long hidden column is another application
of the same rule, rather than a limit on which column can cause the problem.

**Boundary:** The existing reveal and count correction remains a separate
[story](#paged-columns-reveal-and-count-correction). This story preserves
those interactions while changing the page's vertical extent; it adds no
new column navigation, count policy, or per-column scroll memory.

**Plan:** [271-paged-columns-height-follows-shown](../slice-plans/271-paged-columns-height-follows-shown/PLAN.md)
