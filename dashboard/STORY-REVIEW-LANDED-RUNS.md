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
not landed. An unattached Start session's captured landing is kept with its
launch record under the same capture rules. It names no story, so no story
review lists it; its Recently done entry offers **Review changes** for that
landing.

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
are retired. In the [review details](STORY-REVIEW-FILES.md#toolbar-and-review-details),
the Comparison switch offers **Landed runs** beside the
workspace's All changes and Commits choices. Its bounded native
listbox, labelled **Landed run**, offers every landed refinement or execution run,
newest first by launch time, including older runs without a reporting handoff. The initial run is the
newest captured comparison, or the newest landed run's evidence gap when none
has capture. A readable current workspace remains the opening default, including
an integrated workspace whose retirement is held; otherwise Review changes, or
Refresh of an open workspace review, opens that historical choice. The selector
names workflow, launch time and accepted revision, or missing capture. The
details' context names **Landed run**, its workflow/time, authorized remote target, and
exact captured base and accepted revision. The existing file browser, counts, rename detection, binary
explanation and file moves compare those two commits.

Returning to the workspace restores its comparison and
chosen Commits range. Refresh keeps the chosen run while retained, including when
a new capture appears; when it is deleted or expires, Refresh selects the newest
remaining captured run, or the newest retained evidence gap. A delayed reply for
an earlier run or file cannot replace the later choice. Maximize, resize, Hide/Show
files, narrow layout and Close/focus return use the same panel and browser.
Refresh and restart read the fixed pair even when trunk has advanced or reverted
the result. Historical reads use the original saved common Git repository and
read the captured pair without fetching trunk or writing to the repository.

A valid empty comparison says that this run's delivered comparison is empty;
an ad hoc session's empty landing says this session's delivered comparison is
empty. A landed run without capture explains its evidence gap: its delivered
comparison was not captured and cannot be reconstructed from today's trunk. A
session without a landing says its changes were not captured. A claimed launch
listed because its workspace is gone says that the workspace is gone and no
landing comparison was captured, since such a launch may never have landed.
Missing or unreadable saved repository or objects explain why the comparison is
unavailable.
An ad hoc session in the Default main checkout that holds no landing answers
the commits it made there instead, kept with its launch record at Done
([capture at Done](AGENT-LAUNCH-COMPLETION.md#session-commits-kept-at-done)):
the review names them as session commits with the session's launch and Done
times, and compares a run's first commit's first parent with its last commit.
The toolbar names the comparison **Session commits**, and the details' context,
headed the same, says the commits were made in the
Default main checkout while the session was open, and names the two revisions;
a capture from a shared checkout adds, in its own sentence, that another
session was open in the same checkout during that time, so the comparison may
include that session's work. A session with one kept run shows no Comparison
switch. With several, the Comparison switch lists the runs as its choices,
oldest first, and the review opens on the first; each is named by its commit
count ("1 commit", "2 commits"), its last commit's subject and that commit's
time, separated and formatted as the Landed run selector's entries are.
Choosing a run asks for it by its position and shows its files and two
revisions. Refresh keeps the chosen run and then says how many files changed
in the kept session commits; a delayed reply for another run cannot replace
the choice. A run whose commits leave no difference says so in place of the
file browser. It reads each fixed pair from the saved common Git
repository as a landing's is read, so it stays readable after trunk advances
and after the commits leave every branch, without fetching or writing to the
checkout. A session that holds a landing keeps answering its landing.

None of these states guesses a baseline or lists substitute files from today's
trunk. Requests to the same review/file boundary name either a story (project
and story identity, with the landed run's launch identity) or an ad hoc session
(project, host and session); file reads then name that captured pair and one of
its literal changed paths, including the exact old path for a rename. No request
can supply a repository or workspace path.
