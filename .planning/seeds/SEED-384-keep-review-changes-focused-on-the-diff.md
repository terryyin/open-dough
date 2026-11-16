---
id: SEED-384
status: active
planted: 2026-11-16
planted_during: Request to simplify Review changes and remember the file sidebar width
trigger_when: selected from the product backlog
scope: story
---

# SEED-384 — Keep Review changes focused on the diff

<a id="keep-review-changes-focused-on-the-diff"></a>

### Keep Review changes focused on the diff

**Identity:** SEED-384#keep-review-changes-focused-on-the-diff

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer opens **Review changes** and can start reading the diff right away.
They can reveal which changes they are reviewing, choose another landed run,
and give the file sidebar enough room for the paths they need to read.

#### Approved UI and acceptance examples

- **Compact on open.** The slim toolbar shows a file sidebar icon at the far
  left and the current comparison name beside a small outlined eye icon. Label
  the eye **Show review details**. The comparison choices start collapsed,
  along with the run picker and metadata when the comparison is **Landed runs**.
  The files and selected diff are immediately readable. Revealing or hiding
  details preserves the comparison, selected file, and diff scroll position.
- **Details on demand.** The eye reveals an inline section above the files and
  diff. It shows the available comparisons and, for **Landed runs**, the run
  picker when there is more than one choice. Show the selected run's workflow,
  launch time, target, and captured base and delivered revision. Choosing a run
  updates the details and diff together. An unavailable or empty comparison
  explains itself even while details are collapsed. The control exposes its
  expanded state and changes its accessible name and tooltip to **Hide review
  details**. Escape from inside the details collapses them and returns focus to
  the eye.
- **File sidebar toggle on the left.** The outlined sidebar icon stays in the
  same place when the sidebar is hidden and works with the details collapsed.
  Its tooltip and accessible name say **Hide files** or **Show files**. Hiding
  the sidebar gives the selected diff the freed width. Showing it restores the
  sidebar at the preferred width, with the current file selected. Offer the
  toggle when the comparison has files.
- **Resize and remember.** Drag the divider between the file sidebar and diff
  to change their widths. Keyboard users can focus the divider and resize with
  Left and Right. Keep both panes usable. Reopening **Review changes** for this
  or another story, including after a page reload, restores the preferred width
  in the same browser. Until the reviewer makes a choice, use the current
  default width. In a narrow review panel, put the files above the diff and
  hide the width divider. A temporary layout limit leaves the preferred width
  available for when the panel widens again.

**Temporary design reference.** Keep the [interactive Review changes mockup](../mockups/review-changes.html)
through implementation so reviewers can compare the compact and revealed
layouts and try the sidebar interactions. Remove it during story wrap-up after
the delivered UI is verified.
