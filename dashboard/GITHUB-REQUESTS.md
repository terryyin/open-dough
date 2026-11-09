# Dashboard GitHub requests

What the [story dashboard](README.md) asks GitHub through the launching person's own `gh`, and so
what it costs their GitHub API allowance.

Each load of the dashboard makes one authenticated `gh` request resolving the configured ref, and
one reading its backlog unless a dashboard process on this machine already read it at the resolved
revision, plus one per record not already read at that revision for preparation and detail, and,
once per revision, one listing of the done record directory and one read of its done catalog, plus
one per done record Recently done shows and this dashboard process has not already read (older
entries cost theirs only once shown), one listing of the agent profile directory plus one per
profile listed there, and, for each readable profile, one listing of its history and one request per
commit walked back to its addition (usually one). Opening a Session details costs, at that session's
saved revision, what a first read of that revision's profiles costs, unless the dashboard process
already remembers it. A history listing is remembered at its revision,
and what a commit changed is remembered by commit, so a walk a failure or a rate limit ended asks
again only from the step that failed, and a later revision that must walk a profile's history again
costs only its history listing. Each GitHub account matched to a credited human costs one
unauthenticated read of its avatar image from GitHub's avatar host while the dashboard process runs,
which does not use the `gh` allowance; a failed avatar read is asked again when the avatar is next
shown. Each Taken entry with a counted plan adds one last-commit-time request for its plan, its Take
time coming from its agent profile's addition already read, and each Story Branch Mode entry adds
one branch head request and one plan read on that branch. Opening Intent for a project adds, at
Intent's reading revision, one read of `.planning/open-dough.json` when that file is not already pinned,
plus one recursive Git trees listing per configured intent location and one contents read of
each selected feature file not already pinned; a location or folder summary reads no contents,
a file whose Purpose is the selected story's diff reads no contents, and paths outside those
locations are refused without a contents read. The page asks the boundary for those locations,
files and the Test Optimization Candidates record once per answer per page: reopening a file or
the Test Optimization Candidates record, or leaving Intent and returning at the same revision asks
nothing more, and a read already in flight is joined; a failed, limited or refused read is asked
again. A newer observed revision asks Intent for nothing until **Show latest**, which reads the
locations and, when a file is selected, that file at the latest observed revision, and the Test
Optimization Candidates record once that tab shows. Opening Intent with nothing selected shows CI
status as Intent's homepage and costs the same judgment and proof reads the former **CI status**
tab cost when shown. The homepage and a location or folder Summary share one CI reading, so
selecting, drilling down and returning home by activating the **CI status** tab ask CI nothing
more. Project Intent's trunk reading and a selected story's reading are separate: the trunk
is first read when Project Intent shows, even from a selected story, and then followed while
Intent stays open, including while the story shows. The selected story's reading stays
followed during a visit to Project Intent; going between them reads neither again.
A reading is asked each time Intent opens, each time its judged branch changes with the
selected story, each time a new trunk revision is observed after Project Intent has first
shown, each time the revision check finds a new head of the selected story branch it
already watches for progress, even during a Project Intent visit, and on each **Check again**.
An observed trunk advance refreshes only the trunk reading, and an observed story-branch
advance refreshes only the story reading. The trunk's judgment
costs one listing of the configured ref's commit history (up to 30 commits) and
one listing of the selected workflow's push runs on that ref, plus one lookup of
the workflow; a selected story's branch costs four: its history listing, the push
runs on that branch, the push runs on the configured ref, and the workflow lookup,
and only the history listing when GitHub has no such branch. With a configured
`ciAdapter`, only the history listing is asked, the adapter's discover answering
the runs. A selected story without a branch to judge asks nothing. Each homepage
show also asks the kept form of that CI status read (`kept=1`), which answers
from this dashboard process's last keepable judgment for that repository, judged
branch and CI reading path and asks GitHub nothing; a fresh unread or failed
judgment does not overwrite that kept answer. Per-show GitHub requests for the
fresh judgment stay as above — the kept form does not add any. Once a judgment
names the GitHub Actions run whose result the homepage shows (for a running
result, its completed ancestor's), that run's CI proof costs, for each run
attempt newly shown, one listing of the run's artifacts by that attempt's
summary name and, when the summary is listed and not expired, one download of
its zip. A valid summary is remembered by repository, run and attempt for the
dashboard process's lifetime (the latest 256 read), so showing that attempt
again, or **Check again**, asks nothing more for its proof; an attempt without a
valid summary is asked again each time. A `ciAdapter` project asks GitHub
nothing for its proof: its adapter's `proof` operation answers it, and a valid
summary is remembered by repository and attempt for the process's lifetime the
same way. A result that names no completed run or attempt asks nothing for its
proof.

A selected done or Taken story's **CI timing comparison** (Baseline, Branch, Landed, or
a Taken provisional tip) lists the configured workflow's push runs once per first-parent
revision the endpoint walks (`head_sha=`), within that endpoint's bound (30 first-parent
ancestors for Baseline; the story-start bound for Branch, Trunk Mode Landed, and the
provisional tip). Story Branch Landed is exact at the landing except a confirmed skip,
which lists runs at the landing and at its equivalent-build ancestor only, and a
cancelled landing, which also lists runs once per later first-parent trunk revision it
walks forward (up to 30, stopping at a running build, at the first build with usable
proof, or at the trunk head already fetched). For each timed build a walking endpoint
considers, including each passed or failed later build a cancelled landing's walk
checks (never its cancelled builds), and for a confirmed skip's equivalent build,
the comparison also reads that run attempt's CI proof the same way the homepage does
(artifact listing by summary name; zip when listed and not expired). The walk continues
past a build whose proof is absent, expired, unreadable, invalid or mismatched, so those
failed proof reads are extra requests while selecting a source build. A valid summary is
remembered by repository, run and attempt for the process's lifetime, so the page's
later proof read of the chosen build asks GitHub nothing again; an attempt without a
valid summary is asked again when the page reads it. Opening the comparison, changing
the selected story, a done comparison's **Check again**, or a Taken story's newly observed
tip re-reads the slots; unchanged remembered answers cost no further requests. A done
answer is not remembered while an endpoint is running, a cancelled landing's forward walk
stopped at a running build or the trunk head, or Baseline, Branch or Landed is
unavailable, so each such selection or **Check again** walks and lists every endpoint's
revisions again (proof reads of builds already holding a valid summary still ask
nothing). A whole comparison that is unavailable is not remembered either: each selection
or **Check again** reads the story's published history again, and lists every endpoint
again once that history reads. **Check again** on a final done answer asks GitHub nothing
for the comparison; it also reads the shown endpoints' proofs again, which asks nothing
for a valid remembered summary and asks again for an attempt without one.

A story CI timing comparison also adds one jobs request per 100 jobs for
each newly shown completed GitHub Actions attempt with a readable workflow
file. The dashboard process remembers the latest 256 successful listings by
repository, run and attempt, including Baseline jobs across Taken branch
head changes. A fresh comparison computes the estimate using those rows and
the workflow file at the build's revision from local Git. A failed listing
can be requested again by a fresh comparison. An adapter project's story
comparison makes no GitHub API requests for CI builds or proof. It looks for
endpoint revisions among the attempts `discover` lists for the configured
target and, when known, the story branch. Completed, unambiguous comparison
attempts use the same adapter `proof` read and summary memory as CI status.
The comparison resolves a Taken story's published branch tip through the
project checkout's Git origin.

Only the ref and branch head requests are made
on every load: content and history already read at a resolved revision or branch head by any
dashboard process of this user on this machine are not asked again, so a reload, a return to a
project, a replaced production dashboard, or a second dashboard process at a ref and branches that
are unchanged costs those requests plus one for each record GitHub answered as missing, or failed to
answer, at that revision. Those answers are kept under `~/.open-dough/dashboard/retained-answers/`,
readable only by this user, within 64 MiB: a write that takes them over it removes the answers least
recently written or answered first, and a removed answer is asked again when next needed. Revoking
GitHub access does not remove them; deleting the directory does, and costs only the requests it
saved. These count against the launching person's own GitHub API allowance. Each revision check is
one more `gh` request, whatever the number of branches, or two when the listing fails and `main` is
asked alone (at most four a minute per project on one dashboard process for any number of staggered
visible pages of that project under the same login, none while every page of it is hidden, and none
before a rate limit's wait ends); checks asked from several pages while one listing is outstanding
share it, and a listing this process settled for that project under the same request-owner scope
within the reuse window (`checkReuseMs`, one second under the 15-second pace) answers a later paced
or revealed check without asking GitHub again. A reload or a return to a project still resolves the
configured ref afresh and does not reuse that settled listing. Visible settled pages that hold a
revision stream do not send those recurring checks: while any stream for a project and
request-owner scope is open, the dashboard process asks the same listing once per 15-second pace
for that scope and answers every open stream from it, so two streaming pages of one project cost
one listing per pace rather than one per page. A lost, closed, or silent stream closes itself,
reports lost freshness as a failed check does, and reopens no more often than the pace (recovery
does not multiply listings); a rate-limited stream answer closes and asks nothing until the wait
ends. On a non-multiplexing route at most two pages of one browser stream; the rest keep the check.
GitHub documents an unchanged `304` as not counting against the primary allowance, but that has not
been confirmed here, so count each check or stream listing that reaches GitHub as a request. A newly
published commit then costs, without resolving `main` again, one read of its backlog, which answers
its membership without waiting on anything else; then, for its details, one comparison of it with
the revision at which any dashboard process of this user on this machine last read the backlog, one
read of each commit between them (a commit already asked about is not asked again), and reads of
only the records, done records, and record listings the comparison or those commits changed (a
merge's own change list names only what differs from its first parent, so the comparison's files
name what differs between the two revisions), plus one history listing for each readable profile
they touched and one last-commit-time request for each counted plan they touched. A profile or plan
neither touched keeps its credited human, addition, and last commit time without another request,
however many assignments credit the same human; one removed and re-added, even with identical text,
is walked again and credits the re-adding commit. A commit that changes no planning record reads
none of them. With more than ten commits between, a comparison or commit whose change list GitHub
cuts at 300 files, or a new commit that does not descend from the earlier one, the comparison is not
asked again and the new commit's records, histories, and last commit times are read as before; a
comparison or commit read that fails is asked again with the next read at that commit, which
meanwhile reads as before; one a rate limit refused or held back withholds that read, as the limit
withholds any read, while the new commit's membership stays shown. Reading the backlog directly
costs one more request than reuse when no commit between touched it, and none when one did. A
recorded story branch that moved costs one read of its plan and one of its last commit time at the
new head, and never a comparison.

The [shared request owner](GITHUB-REQUEST-OWNER.md) joins outstanding reads across
pages and processes, bounds concurrency, and retains GitHub-directed rate-limit waits.

A listed story whose latest launch on this machine settled, published at a revision other than the
one shown, and is not yet reconciled on the page costs one comparison of the two commits per newly
shown revision (a page that opens asks one for each such story); an answered comparison is not asked
again by that page, and a failed one is asked again only with the next read.

With [feedback maintenance](FEEDBACK-MAINTENANCE.md) On, the production dashboard server checks once
it listens and then every 15 minutes, whether or not a page is open: each check with no feedback
maintenance session running on this machine costs one request resolving Open Dough's configured ref,
plus one read of `docs/maintainer/near-term-watch-list.md` at a revision no dashboard process of
this user on this machine has read it at -- so at most four ref requests an hour, and one watch list
read per published revision. A check while the setting is Off, or while a feedback maintenance
session is running, asks GitHub nothing. A failed check is asked again at the next one.

Inspecting recent failed reads, the incident record that keeps them across processes, how an output
bound is reported, and what the installed CI diagnostic retains are in [Read
diagnostics](READ-DIAGNOSTICS.md); the diagnostics and the incident record ask GitHub nothing.
