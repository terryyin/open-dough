# Story review file browser

The [story review](AGENT-LAUNCH-REVIEW.md)'s file browser, whose tree model
and change-kind styles Intent shares, shows the snapshot's changed files under
the folders that hold them, each file by its name, with files at the
repository root at the top level (`src/reviewFileTree.ts`). A chain of
folders that each hold only one folder is one row naming the chain
(`docs/adrs/drafts`). A renamed file
sits once, at its new path; its old folder shows nothing for it. Each folder
is a disclosure button (`aria-expanded`) that collapses and expands by
pointer or keyboard; the browser is not an ARIA tree, which would promise
arrow-key navigation. A collapsed folder hides its files and subfolders, and
its row shows how many changed files it holds at any depth; its control is
named by the folder and that count (`dashboard 3 changed files`). An expanded
folder shows no count, and the heading's total stays that of the comparison
shown. Expanding a folder restores its rows as they were, and collapsing the
folder that holds the selected file keeps the selection and its diff.
Collapsed folders are kept by path: Refresh keeps each one the new snapshot
still has collapsed and shows folders new to it expanded, while every folder
shows expanded each time a review opens. A row shows the file's name alone,
its kind told by the name's style, the change-kind styles Intent shares
(`src/change-kinds.css`): an added name is in the ready color, a modified one
in the accent color, a deleted one struck through in the quiet color, and a
renamed one italic; an unchanged file, which only Intent lists, keeps plain
text. The tree model marks each file's kind and whether each folder contains
changes (`src/reviewFileTree.ts`). The kind's words remain where they are
read: each file's control is named, and titled for hover, by its kind and full
path (`Deleted gone.txt`, `Renamed old/a.ts → new/a.ts`), and the selected
file's diff is headed by the same words. For a Done story's Published
completion or landed run, that heading also offers
[Follow up](LAUNCH-FOLLOW-UP.md) beside the path, which starts a follow-up
about the whole file; a retained workspace snapshot does not. In those same
diffs, each line number is a control that opens a small menu naming the line
(for example “Old line 85”) and offering Follow up for that line and side,
including revealed context lines. The header and line menu also offer
[Add note](STORY-NOTES.md), keeping the shown file or line context. Line numbers stay outside copied code and off the Tab order
(`src/DiffLineNumber.tsx`, `src/StoryReviewDiffLines.tsx`). A diff's code
carries the same syntax styling as Intent's source reading: the file's path
selects among the eleven grammars TypeScript, TSX, JavaScript, Java, Python,
shell, Gherkin, Markdown, JSON, CSS and YAML first (a renamed file by its new
path); when the path names none, an Intent `syntax` hint at the review's
pinned settings revision may supply a known language through the same
`sourceLanguage` mapping Intent source reading uses (`src/diffLineTokens.ts`,
`src/reviewDiffSyntaxHint.ts`, `src/sourceHighlight.ts`). A path outside
Intent or with an unfamiliar hint stays plain text. Removed lines are styled
as they read in the old file's whole text and every other line, revealed
context included, as in the new file's. Markers and backgrounds keep telling
the change kind, and copied and assistive-technology text stays the line's
plain code. Within a removed-then-added block, words that changed are marked
as deletions or insertions (`src/diffWordEmphasis.ts`, composed by
`src/diffLineCode.tsx`): underlined in the line's change colour over its light
tint, including when syntax tokens are present — token spans split at the same
character ranges so colours stay on the emphasized words before and after
styling arrives.
Beside a file's
name its row shows how many lines its diff adds and removes (`+2 −1`), and
its control is described by them in words (`2 lines added, 1 line removed`).
The snapshot reads them with `git diff --numstat -M -z` over the same _from_
tree and tree as each comparison's file list, joined by path
(`server/storyReviewFiles.ts`), so no request reads them per file: counts in
each comparison use its starting tree, and a file that includes trunk's
changes counts from its `includesTrunkFrom`, as its diff does. A file shows counts only when its
diff adds or removes a line: a binary, mode-only, or empty file shows none. A
collapsed folder's count stays the changed files it holds.

Beside the diff, the browser is 16rem wide, border and padding included,
until the reviewer chooses a width with the Files divider between the panes, by dragging it or with its
Left and Right keys, one 1rem step each (`src/StoryReviewWorkarea.tsx`,
`src/reviewFileSidebarWidth.ts`). Neither pane becomes narrower than its
minimum: 12rem for the browser and 18rem for the diff. The chosen width is
kept in this browser's storage (`open-dough.storyReview.filesWidth`) and
serves every review opened afterwards, also after a reload; until one is
chosen nothing is kept, and a kept value that is not a usable width, or a
browser that refuses storage, gives 16rem while the divider still resizes for
the page's lifetime. Where the Side panel leaves less room, the browser is as
wide as the diff's minimum allows and the kept width stays unchanged, so
widening or maximizing the panel brings it back and lets the divider go
further. Where the panes stack, the divider is gone and returns with the kept
width once they sit side by side again.

## Toolbar and review details

Every review (a story's workspace, a landed run, a published completion, an
ad hoc session's landing or its session commits) opens with one toolbar under
the panel header (`src/StoryReviewToolbar.tsx`). While the comparison shown
lists files, an icon button at its far left, named **Hide files** or **Show
files** in its accessible name and tooltip, hides or shows the file browser
from the same place; hiding gives the diff the freed width and showing returns
the browser with the current file selected. The name of the comparison shown
follows once a review answer supplies it: **All changes**, **Commits**,
**Landed runs**, **Published completion** or **Session commits**, never the
selected run; before that answer, and when a bare unavailable or
landing-unavailable reply holds no comparison, the toolbar names none. Beside
it, an eye icon button named **Show review details** or **Hide review
details**, offered only when the details hold a choice, run picker, context or
uncommitted check (`src/StoryReviewDetailsSection.tsx`), states its expanded
state and reveals or hides the review details: one inline section between the
toolbar and the work area holding the Comparison switch (a session's runs of
commits, when it kept more than one), the **Landed run** listbox when a run is
selected, the context of the comparison shown (the workspace context line, the
landed run's facts, the published completion's facts or the session commits'
facts) and **Include uncommitted changes**. Revealing or hiding keeps the
comparison, the selected file and the diff's reading place, and a choice made
in the details updates the toolbar's name, the details and the diff together.
Escape pressed inside the details hides them and returns the keyboard to the
eye.

The details are hidden and the file browser shown on every opening. The
revealed state lasts while the panel stays open, across comparison and run
choices and Refresh. Reading progress, problems, and an empty or unavailable
comparison's explanation stay outside the details, as do Commits' range
heading and commit list. With touch input both toggles keep the shared 44px
control size; revealed details and the status above the work area share one
scrollable height budget — the larger of 30% of the panel height and the
control size plus 1 rem — so the work area keeps the remaining height; and a
narrow panel keeps the files above the diff.
