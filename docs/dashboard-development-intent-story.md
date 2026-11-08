# Intent for a selected story

Part of [Development and Intent](dashboard-development-intent.md).

With a story selected, Intent shows that story's views: one persistent
header, which never collapses, led by **Project Intent** / Selected story,
names it by its full title and
identity and says briefly while its default Review changes comparison is
reading, unavailable or failed, with **Retry** for a failure, followed by the
revisions that comparison runs between or its full explanation. Below it the
story's views are **CI comparison**, **Changed tests** and **Intent
coverage**, in that order; each new selection, even of a story cleared and
selected again while Intent is hidden, opens **CI comparison**, and the
chosen view, kept with the story's reading place, is otherwise kept.
**Project Intent** in the header visits the project's own evidence, the
trunk's **CI status** and **Optimization Candidates**, without clearing the
selection; there **Back to selected story** shows the story's chosen view
with its reading place as it was, and Project Intent keeps its own. **CI
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
unavailable reason. Intent overlays that comparison's changed files on the
published tree: styled by change kind, added files inserted, deleted files
kept, a rename at its new path where a location selects it else at its old
path. A completed story is named by its done record's title and compared
through its published completion, whose revisions need not be the published
revision Intent describes. Folders containing changes share one background; a
location containing changes keeps its header background and carries a change
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
comparison (All changes, uncommitted included) even for a story with a review
mark. Closing that review clears the selected story, as any Side panel close
does, and the keyboard returns to the chosen tab of Project Intent, which
Intent then shows. A changed file's Purpose is Review changes' diff of
it, and Proof holds that file's comparison when available. A story without a
comparison, and a failed read with retry, each say so while the published tree
stays usable; clearing the selected story removes the header and shows
Project Intent, whose Proof is judged-run evidence. The story is a lens on Intent, not a separate
definition of it, and its changed files are an initial view of its impact:
they do not by themselves establish every affected behavior or the regression
proof it needs.
