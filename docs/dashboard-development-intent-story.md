# Intent for a selected story

Part of [Development and Intent](dashboard-development-intent.md).

Intent uses the same page implementation and arrangement for Project Intent
and a selected story: persistent header, applicable views and reading area.
The project revision notice and **Show latest** belong to Project Intent;
none of a Done story's three views offers them. With a story selected, the
header never collapses. Led by **Project Intent** / Selected story, it names
the story by its full title under
its identity, marked **Done** once completed, and says briefly while its
comparison is reading, unavailable or failed, with **Retry** for
a failure, followed by the revisions that comparison runs between or its full
explanation. Below it the story's views are **CI comparison**, **Changed tests**
and **Intent coverage**, in that order, as underlined tabs with **Hide files** /
**Show files** ending their row (narrow, smaller tabs and the toggle's panel
icon alone, its words kept as its name). Each new selection, even of a story
cleared and selected again while Intent is hidden, opens **CI comparison**;
the chosen view, kept with the story's reading place, is otherwise kept.
With no story selected, the same persistent header says **No story selected**,
and the views are project **CI status** and **Optimization Candidates**.
**Project Intent** in the header visits the project's own evidence, the
trunk's **CI status** and **Optimization Candidates**, without clearing the
selection. That visit explicitly names **Project Intent** in the header;
**Back to selected story** restores the story's chosen view and reading place,
and Project Intent keeps its own file, Purpose/Proof choice, expansion, scroll
and Hide files choice. Going either way moves the keyboard to the control
that comes back. Project Intent always uses published project text and trunk
CI evidence, even while the story remains selected. **CI
comparison** shows the story's CI evidence as [Intent CI
status](dashboard-development-intent-ci-status.md) describes it as soon as CI
answers, whether the locations are still being read, unavailable, or browsed,
and settling the locations reads none of it again. **Changed tests** is the
location tree and reading pane, or the explanation shown in place of the tree;
with nothing selected it asks for a test, folder or location rather than
repeating CI. Every view stays in place while another shows, so returning to
**Changed tests** keeps its selection, Purpose or Proof, open folders,
**Selected story only** and scroll. A file's Proof offers **View story CI
comparison**, which shows that view and focuses its tab. **Intent coverage**
shows a completed story's saved assessment as stored text, or its saved
unavailable reason, from its done record read as Recently done reads it. A
completion whose record was read without an assessment says none was
saved; a record still being read says so, and one that could not be read says
whether an assessment was saved is not known, with **Retry done story** for a
failed read. An active story's view explains that an assessment saved during
feature story wrap-up appears after completion. Missing saved assessment is distinct from a negative
assessment. Intent overlays that comparison's changed files on its source
tree: styled by change kind, added files inserted, deleted files
kept, a rename at its new path where a location selects it else at its old
path. A completed story is named by its done record's title. Its browser uses
the published completion's test-source locations, inventory and unchanged-file
source. A saved execution landing can recover this comparison when that landing
is established as the same completion. Its changed files keep the baseline-to-result diff, even while a
retained workspace has later edits. Its outside-location Review action opens
that same historical comparison; ordinary card Review can still show the live
workspace. Later trunk additions, renames, deletions or settings changes
do not rewrite that history: a later-only test stays outside the tree, and a
location removed from current settings remains available at the story's
result. A project visit and refresh leave that source and comparison, the
story selection, file, Purpose/Proof choice and reading place intact.
Folders containing changes share one background; a location containing changes
keeps its header background and carries a change
mark on its leading edge. The first time Intent has the comparison, those
folders and the first changed location open and everything else collapses.
**Selected story only**, heading the tree and off at first, leaves just the
changed files and the locations and folders holding them, or says no test file
in a location changed; toggling it opens the same folders again and collapses
the rest. Once the comparison and the locations are both known, changed files
no location selects by either path are counted at the end of the header's
title line, in every view, as one compact button: an icon and the number,
whose accessible name and hover text explain it (for example "2 changed files
outside Intent locations — open Review changes"). It is absent when no changed
file is outside the locations. Activating it opens Review changes on Intent's
comparison: the historical result for Done, or All changes with uncommitted
work for an active story, even one with a review mark. Closing that review keeps the selected story, as any Side panel close
does, so Intent keeps the story's tab, file, and reading place, and the
keyboard returns to the control that opened the review. A changed file's
Purpose is Review changes' diff of it, and Proof holds that file's comparison
when available. Location and folder Summary and file Proof share the story's
[CI comparison](dashboard-development-intent-ci-comparison.md): active heading,
observed-build framing, Baseline / Branch / Landed columns, signed changes and
relative marks. Precise drill-down changes stay visible (`340 ms` to `410 ms`
shows `+70 ms`). **Show %** is one preference across these scopes and CI
comparison; each displayed scope uses one scale for its own figures and rows.
For a Done story, a historical comparison or source that cannot be read is
explained in **Changed tests**, with recovery where supported; the current
project tree never stands in for missing history, and an unavailable
comparison does not mean no tests changed. Reading, failed retrieval and
absence remain distinct. CI comparison and saved Intent coverage stay usable
independently of locations or source, and a source read failure offers its
own retry. An active story without a comparison, and a failed read with
retry, each say so while its published project tree stays usable.
Clearing the selected story returns to project **CI status** in the same
arrangement, with **No story selected** in
its header and judged-run evidence in Proof. The story is a lens on Intent,
not a separate definition of it, and its changed files are an initial view of its impact:
they do not by themselves establish every affected behavior or the regression
proof it needs.
