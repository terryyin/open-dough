# Landed run review

The landed run comparison extends the [story review](AGENT-LAUNCH-REVIEW.md).

A landed run is a story launch whose work landed on trunk: a one-shot refinement
or execution, or a claimed Story Branch Mode launch's trunk integration. The
dashboard [captures](AGENT-LAUNCH-COMPLETION.md) its delivered pair at that
publication. The pair is the fetched trunk tip the publication was accepted onto and the accepted
revision, so trunk changes merged into a story branch during execution are no
part of the comparison. Every retained one-shot launch is listed. A claimed
launch is listed once it holds a captured landing, or once its workspace is gone,
then as its evidence gap; a claimed launch with a workspace and no landing has
not landed.

Queued refinement results remain reachable from their active story card. A
completed execution offers the same **Review changes** on its Recently
done card, using the published done identity and title even after the story seed,
plan, workspace and branches are gone. Review reads all kept launches for that
story, independently of the marked-done sessions nested in the card: an open
session with an unfinished attention report can still supply the landed run.
While done details are unread or failed, the catalog identity supplies the card
and review title; reading the record supplies its title for later openings.
Closing the review returns the keyboard to the card's review action and keeps
Recently done's shown range and entry counts.

A landed run can also be reviewed after its workspace and branches
are retired. The Comparison switch offers **Landed runs** beside the
workspace's All changes, Since the review and Commits choices. Its bounded native
listbox, labelled **Landed run**, offers every landed refinement or execution run,
newest first by launch time, including older runs without a reporting handoff. The initial run is the
newest captured comparison, or the newest landed run's evidence gap when none
has capture. A readable current workspace remains the opening default, including
an integrated workspace whose retirement is held; otherwise Review changes, or
Refresh of an open workspace review, opens that historical choice. The selector
names workflow, launch time and accepted revision, or missing capture. The
context names **Landed run**, its workflow/time, authorized remote target, and
exact captured base and accepted revision. The existing file browser, counts, rename detection, binary
explanation and file moves compare those two commits.

Switching to a run hides Mark reviewed and leaves the story's mark and workspace
comparison unchanged. Returning to the workspace restores its comparison and
chosen Commits range. Refresh keeps the chosen run while retained, including when
a new capture appears; when it is deleted or expires, Refresh selects the newest
remaining captured run, or the newest retained evidence gap. A delayed reply for
an earlier run or file cannot replace the later choice. Maximize, resize, Hide/Show
files, narrow layout and Close/focus return use the same panel and browser.
Refresh and restart read the fixed pair even when trunk has advanced or reverted
the result. Historical reads use the original saved common Git repository and
write no ref, index or checkout content; they neither fetch trunk nor replace the
workspace review mark.

A valid empty comparison says that this run's delivered comparison is empty.
A landed run without capture explains its evidence gap: its delivered comparison
was not captured and cannot be reconstructed from today's trunk. Missing or
unreadable saved repository or objects explain why the comparison is unavailable.
None of these states guesses a baseline or lists substitute files from today's
trunk. Requests to the same review/file boundary name the project, story and
landed run's launch identity (the reporting reference or durable host/session key). File reads must name that captured pair and one of its
literal changed paths, including the exact old path for a rename. No request
can supply a repository or workspace path.
