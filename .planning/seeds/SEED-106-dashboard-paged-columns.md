---
id: SEED-106
status: active
planted: 2026-10-06
planted_during: Terry's request to stop the dashboard's main columns wrapping on narrower screens
trigger_when: A developer views the dashboard in a window too narrow to show the Backlog, Taken, and Recent sessions columns side by side
scope: story
---

# SEED-106: Dashboard paged columns

## Why This Matters

The dashboard shows Backlog and Taken as two columns and Recent sessions as a
full-width block below them. In a page narrower than 48rem the two columns
also stack, top to bottom. A developer then scrolls down past a long Backlog
to find Taken or Recent sessions, and never sees the three beside each other.

## Story

<a id="paged-dashboard-columns"></a>

### Dashboard columns page horizontally instead of wrapping in narrower windows

**Identity:** SEED-106#paged-dashboard-columns
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/225-paged-dashboard-columns/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8db3761af94044d01a061b58d65fa2bef5c02458629192ba74ed7ece17c9f94f","plan":"59ee8bdc0e87ce7254b23188b2c8aa47c5e546d89f27f6d5f02dcb48123c5a9b"}}
```

**Beneficiary:** A developer watching a project's dashboard, most of all in a
window, or beside an open Sessions sidebar or side panel, that cannot fit all
three main columns.

**Goal:** Backlog, Taken, and Recent sessions are three columns that always
stay on one horizontal row. Where the page is wide enough, all three show side
by side. Where it is not, the columns that fit share the full page width, and
the developer brings a hidden column into view with a slim edge control that
says what it holds, instead of finding it on a row below.

**Scope:**

- Recent sessions becomes the third column, right of Taken, with the same
  heading and entries it has today. In a wide page this narrows Backlog and
  Taken from a half to a third of the page each.
- The page's own width decides how many columns show, so an open Sessions
  sidebar, an open side panel, and browser zoom count as a narrower window.
  A column needs at least 24rem, the width today's two-column rule already
  implies: three columns from 72rem, two from 48rem, one below that. Only
  whole columns show, they fill the page width, and they never wrap or stack.
- An edge control appears on the left or right only while a column is hidden
  in that direction. It is a slim strip that stays in view while the page
  scrolls down, names the next hidden column in that direction and how many
  entries it holds (for example “Recent sessions 4”), and moves the view by
  one column. With two columns showing, the column the developer was reading
  therefore stays in view after a move. It is slim, yet comfortable to click
  or tap, as the [UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md)
  asks of touch controls, and it is an ordinary button for the keyboard and
  assistive technology, named for the column it shows.
- The name and count on a control follow the hidden column as it changes, so
  a story that is taken, or a new session, shows there without a move.
- The view also moves by itself to show a hidden column when keyboard focus
  or a selection lands in it: tabbing into its content, or choosing from the
  Sessions sidebar a session whose story card is hidden. All three columns
  stay in the reading and tab order whether shown or hidden.
- The first visit shows Backlog leftmost. After that the position is the
  developer's: data refreshes and project switches keep it, and so does a
  page reload in the same browser, as the side panel's width is kept. When
  the page widens or narrows, the leftmost shown column stays where the new
  width allows, and the view never rests on a blank place past Recent
  sessions.
- Moving shows where the columns went: a brief slide, and no motion for a
  developer who asked the system to reduce it.
- While paging, the edge controls take the room of the page's side margins
  and column framing rather than the cards': a card is no narrower than its
  share of the page without controls would make it, and columns stay
  distinct by their headings. A page showing all three keeps today's framing.
- Free horizontal scrolling does not move between columns, and the page as a
  whole never scrolls sideways.

**Deferred:** a trackpad or touch swipe between columns, and a dedicated
keyboard shortcut. Plain Left and Right arrow keys keep switching projects.

**Key examples:**

- Page 108rem wide, nothing else open → Backlog, Taken, and Recent sessions
  show side by side, each about a third of the page, with no edge control.
- The developer opens the side panel, leaving the page 54rem → Backlog and
  Taken fill the page; a right edge control reads “Recent sessions 4”; there
  is no left control. Using it shows Taken and Recent sessions, Taken now on
  the left, and a left control reading “Backlog 12” replaces the right one.
- Page 40rem wide, showing Backlog → one column fills the page; the right
  control names Taken. After one move both controls show, Backlog on the left
  and Recent sessions on the right.
- Backlog and Taken showing, Recent sessions hidden with 4 entries → a
  session started from a Backlog card adds an entry → the right control
  reads “Recent sessions 5” and the view stays where it is.
- Taken and Recent sessions showing → the developer tabs backwards out of
  Taken into the last Backlog card → the view moves to show Backlog with the
  focused card in sight.
- Taken and Recent sessions showing in a narrow window → the developer
  reloads the page, or the dashboard refreshes its data → Taken and Recent
  sessions still show.
- Taken and Recent sessions showing at 54rem → the developer closes the side
  panel and the page becomes 108rem → all three show and both controls go;
  reopening the panel shows Taken and Recent sessions again.
- A developer scrolled far down a long Backlog → the right edge control is
  still in view and usable without scrolling back up.

**Borrowed mechanism:** the two-page spread of a book or musical score,
turned one leaf at a time. Columns are pages and the shown columns are the
open spread; the edge control is the page edge, present only where a page
remains to turn; and its label is the catchword old books print at the foot of
a page, the next page's first word, so the reader knows what a turn brings.
The analogy breaks where it matters: a turned page does not change, while a
hidden column does, and a reader never needs a page they are not looking at.
That is why the control carries a live count and the view follows focus and
selection, neither of which a page turn has.

<a id="paged-columns-reveal-and-count-correction"></a>

### Paged dashboard columns reveal by structure and count only what is read

**Identity:** SEED-106#paged-columns-reveal-and-count-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/258-paged-columns-reveal-and-count-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"eb85a668db886807b805cb5c53b59cf7131ae5b9c4b080a3a8c0e2b87a560068","plan":"8428c5d8297e4faf0910cf2e771302dd0f40a0e9d6e472c8d16ebc0bcceb8558"}}
```

**Goal:** A developer paging the dashboard columns keeps the view they chose
when a launch dialog opens from a shown card, and an edge control never
states a Recent sessions count before the sessions are read. This corrects
the [paged dashboard columns](#paged-dashboard-columns) delivery; it adds no
feature promise.

**Scope:** Focus and `keepInView` reveals move to the column that holds the
element in the page, not to where it appears on screen; the Recent sessions
edge control names the column without a count until the sessions are read;
the column summary has one home with the dashboard columns; the
reduced-motion rule that can no longer apply goes. Every promise of the
paged dashboard columns story is preserved.

**Plan:** [258-paged-columns-reveal-and-count-correction](../slice-plans/258-paged-columns-reveal-and-count-correction/PLAN.md)

<a id="paged-columns-height-follows-shown"></a>

### The page ends where the shown dashboard columns end

**Identity:** SEED-106#paged-columns-height-follows-shown

**Beneficiary:** A developer reading a narrower dashboard page whose shown
columns are short while a hidden column, such as a long Backlog, is tall.

**Goal:** The page scrolls only as far as the shown columns reach. Today the
row is as tall as its tallest column, hidden ones included, so with Taken and
Recent sessions showing and a long Backlog hidden the developer can scroll far
into blank space below them.

**Scope:**

- Showing short columns beside a hidden long one leaves no blank scroll
  below the shown columns; moving to the long column makes its length
  reachable again.
- Hidden columns keep their place in the reading and tab order, focus and a
  selection still reveal them, and stage headings keep sticking to the window.
- Edge controls, the kept position, and a page showing all three columns are
  unchanged.

**Open premise:** the blank space was reasoned from the row's CSS, not seen;
observe it in a live narrow page before refining further.
