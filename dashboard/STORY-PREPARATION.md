# Story preparation and progress

Each Taken card with a readable plan also shows its recorded slice progress: a
bar with one segment per slice, filled for each slice recorded complete, and "N
of M slices recorded complete". It counts recorded statuses, not how much of the
story is done. The shared plan reader decides what a plan's slices are (under
`## Ordered slices` or `## Slices`); a missing, unreadable, or uninterpretable
plan is shown as that gap instead of a count. Beside the bar, "Current slice
started N min ago" measures from the later of the plan's last commit and the
Take (the commit that added the entry's agent profile; none found is a gap),
shows once its own reads end, and advances with page time without asking GitHub
again. It is time since the last recorded update, not evidence that an agent is
active. A Taken entry without a profile measures from the plan commit and says
so.

Progress comes from where the story's work is published. A single Trunk Mode
profile reads the plan at the shown revision of the configured ref. A single Story Branch
Mode profile reads the same plan path at the recorded branch's head and labels
the card "From branch <branch> at <short revision>; not in trunk." Without a
profile, or when profiles cannot be read, the card shows trunk's plan labelled
as the trunk copy with the execution branch not recorded or unknown, and reads
no branch. More than one profile naming the story, a recorded branch that is no
longer published, a recorded branch whose name this dashboard cannot use (it
is then never read or watched), and a plan missing or uninterpretable on that
branch are each shown as that gap, never as trunk's count. The detail view
shows the same source. When the plan carries an `## Execution complete` record,
the detail shows "Execution complete" and its `Product advice:` as recorded,
in plain text, or the record's gap when it has no readable advice; the shared
plan reader decides both. The Taken card then says "Execution complete,
awaiting wrap-up" and "Completed N min ago", measured from the plan's last
commit where its progress is read, in place of the current slice clock, or
shows the record's gap. Queued cards show no progress, complete or not.

Each card and expanded detail offers the canonical record and a **Slice plan**
link when its association is recorded in the canonical story-state or explicitly
in the backlog. Story-state paths resolve beside the canonical file; backlog
links resolve beside the backlog file (a leading `/` starts at the repository
root). Repository navigation is pinned to the inspected commit and keeps an
explicit anchor. Agreeing references produce one plan action; conflicting
references are qualified as disputed evidence without choosing a plan.
Navigation does not require readiness or successfully read plan contents.
Readiness retains the last recorded Ready or Not ready judgment and its reasons.
Cards, preparation facts and story details separately show "Changed since
readiness review" when the existing reviewed story/plan basis differs. Changed
Ready keeps its normal Start presentation and can start under existing startup
safeguards; the installed start hands the indication to the executing agent,
including a retained-start retry. A new assessment clears it. Take, resume and
ordinary plan delivery do not automatically renew the judgment or basis.
Canonical and associated plan contents are read at the same revision for
preparation and detail; opening detail requires no additional fetch. Following
a repository file or ordinary external reference opens in a new tab
(`target="_blank"`, `rel="noopener noreferrer"`), leaving the dashboard tab,
selected project, and open detail in place. An `http(s)` address stays an
external reference not tied to the revision. Unsafe schemes, repository escapes,
and unusable targets stay text with the reason; titles and targets stay text.

Keyboard focus follows a work item across a refresh by its identity. When a
derived plan link arrives after the backlog, focus returns to that link only if
the user has not moved focus elsewhere. Reading, the read result, and a work
item that is no longer listed are announced through live regions that stay in
the page; a read problem is announced as an alert. The page reflows to a single
column and needs no sideways scrolling down to a 320 px wide window, which is
also 400% browser zoom.

What the backlog means is decided by the shared backlog reader under
`src/skills/dough-product-backlog/scripts/`; the dashboard holds no Markdown
parsing of its own. The dashboard is not part of the installed Open Dough
guidance.
