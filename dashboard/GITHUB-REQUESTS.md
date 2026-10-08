# Dashboard GitHub requests

What the [story dashboard](README.md) asks GitHub through the launching
person's own `gh`, and so what it costs their GitHub API allowance.

Each load of the dashboard makes one authenticated `gh` request resolving the
configured ref, and one reading its backlog unless this dashboard process
already read it at the resolved revision, plus one per record not already read
at that revision for preparation and detail, and, once per revision, one listing of the done
record directory and one read of its done catalog, plus one per done record
Recently done shows and this dashboard process has not already read (older
entries cost theirs only once shown), one listing of the agent
profile directory plus one per profile listed there, and, for each readable
profile, one listing of its history and one request per commit walked back to
its addition (usually one). A history listing is remembered at its revision,
and what a commit changed is remembered by commit, so a walk a failure or a
rate limit ended asks again only from the step that failed, and a later
revision that must walk a profile's history again costs only its history
listing. Each
GitHub account matched to a credited human costs one unauthenticated read of
its avatar image from GitHub's avatar host while the dashboard process runs,
which does not use the `gh` allowance; a failed avatar read is asked again
when the avatar is next shown. Each
Taken entry with a counted plan adds one last-commit-time request for its plan,
its Take time coming from its agent profile's addition already read, and each
Story Branch Mode entry adds one
branch head request and one plan read on that branch. Only the ref and branch
head requests are made on every load: content and history already read at a
resolved revision or branch head are not asked again while the dashboard
process runs, so a reload or a return to a project whose ref and branches are
unchanged costs those requests plus one for each record GitHub answered as
missing, or failed to answer, at that revision. These count against the
launching person's own GitHub API allowance. Each revision check is one more
`gh` request, whatever the number of branches, or two when the listing fails
and `main` is asked alone (at most four a minute per visible page, none while
it is hidden, and none before a rate limit's wait ends); checks asked from
several pages while one listing is outstanding share it. GitHub documents
an unchanged `304` as not counting against the primary allowance, but that has
not been confirmed here, so count each check as a request. A newly published
commit then costs, without resolving `main` again, one read of its backlog,
which answers its membership without waiting on anything else; then, for its
details, one comparison of it with the revision at which this dashboard
process last read the backlog, one read of each commit between them (a commit
already asked about is not asked again), and reads of only the records, done
records, and record listings the comparison or those commits changed (a
merge's own change list
names only what differs from its first parent, so the comparison's files
name what differs between the two revisions), plus one history listing for
each readable profile they touched and one last-commit-time request for each
counted plan they touched. A profile or plan neither touched keeps
its credited human, addition, and last commit time without another request,
however many assignments credit the same human; one removed and re-added,
even with identical text, is walked again and credits the re-adding commit. A
commit that changes no planning record reads none of them. With more than
ten commits between, a comparison or commit whose change list GitHub cuts at
300 files, or a new commit that does not descend from the earlier one, the comparison is not
asked again and the new commit's records, histories, and last commit times
are read as before; a
comparison or commit read that fails is asked again with the next read at that
commit, which meanwhile reads as before; one a rate limit refused or held back
withholds that read, as the limit withholds any read, while the new commit's
membership stays shown. Reading the backlog directly costs one more request
than reuse when no commit between touched it, and none when one did. A recorded story branch that moved
costs one read of its plan and one of its last commit time at the new head,
and never a comparison.

Pages served by one dashboard process that need the same GitHub answer while
it is outstanding share one `gh` request for it, whatever was asked: two tabs
opening one project together cost what one costs, resolving the ref once and
reading each record once. A finished ref, branch-head, or check answer is never
reused, so a later load or check asks again; separately launched dashboards
share nothing.

One dashboard process has at most eight `gh` requests under way at GitHub at
once, across every page, project, and project addition; a shared request counts
once. Further requests wait their turn in the order they were asked, which adds
waiting but never requests; a request whose page stops waiting before its turn
is never asked, and waiting counts toward the 30-second bound.

Once GitHub refuses any request with a rate limit, one dashboard process makes
no `gh` request at all until the wait ends, for any page, project, or project
addition: what is asked meanwhile is answered as limited and costs nothing. The
wait is the one GitHub directed, or, when it directed none or named a time
already passed, one minute, doubled for each such refusal of the first request
after the wait, up to one hour, and one minute again once a request succeeds. A
request already at GitHub when the limit was met is still answered and counted.
When any wait ends, one request goes first while the others wait their turn:
refused with a new limit, it alone is counted and the others are answered as
limited; ended any other way -- answered, GitHub unreachable, the request gone,
or timed out -- the others proceed up to eight at once. A request waiting its
turn when a wait starts is answered as limited and never asked. A separately
launched dashboard does not know of the wait and asks at once.

When the wait ends, each visible page asks again on its own, and a page
hidden then asks when it is next seen; nothing waits for a reload. A page
whose snapshot met the limit only in a revision check makes its next check,
one request. A page that showed nothing, or whose snapshot's detail the limit
withheld, reads the configured ref afresh as a reload does: one request for
the ref, one per recorded story branch head, one per request the limit
withheld (a record, a history listing, or the commits walked from the step
the limit refused), and one per record GitHub answered as missing, or failed
to answer, at that revision; content already read is not asked again, so a
credited human and its Take clock withheld at an unchanged trunk revision
cost only their history's unanswered steps. Pages recovering together share
each request outstanding for them all, and the first goes alone as after any
wait.

A listed story whose latest launch on this machine settled, published at a
revision other than the one shown, and is not yet reconciled on the page costs
one comparison of the two commits per newly shown revision (a page that opens
asks one for each such story); an answered comparison is not asked again by
that page, and a failed one is asked again only with the next read.

Inspecting recent failed upstream reads through
`GET /__authenticated-read-diagnostics?source=<configured-id>` costs no GitHub
request: the response is answered from this process's in-memory history under
the same local same-origin admission as other authenticated-read routes, and a
refused diagnostic request never launches `gh`.
