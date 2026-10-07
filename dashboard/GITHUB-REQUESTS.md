# Dashboard GitHub requests

What the [story dashboard](README.md) asks GitHub through the launching
person's own `gh`, and so what it costs their GitHub API allowance.

Each load of the dashboard makes one authenticated `gh` request resolving the
configured ref, and one reading its backlog unless this dashboard process
already read it at the resolved revision, plus one per record not already read
at that revision for preparation and detail, and, once per revision, one listing of the done
record directory plus one per done record listed there, one listing of the agent
profile directory plus one per profile listed there, and, for each readable
profile, one listing of its history and one request per commit walked back to
its addition (usually one). What a commit changed is remembered by commit, so
a later revision that must walk a profile's history again costs only its
history listing. Each
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
it is hidden, and none before a rate limit's directed time); checks asked from
several pages while one listing is outstanding share it. GitHub documents
an unchanged `304` as not counting against the primary allowance, but that has
not been confirmed here, so count each check as a request. A newly published
commit then costs, without resolving `main` again, one comparison of it with
the revision at which this dashboard process last read the backlog, one read
of each commit between them (a commit already asked about is not asked
again), and reads of only the backlog, records, done records, and record
listings those commits changed, plus one history listing for each readable
profile those commits touched and one last-commit-time request for each
counted plan they touched. A profile or plan no commit between touched keeps
its credited human, addition, and last commit time without another request,
however many assignments credit the same human; one removed and re-added,
even with identical text, is walked again and credits the re-adding commit. A
commit that changes no planning record reads none of them. With more than
ten commits between, a commit whose change list GitHub cuts at 300 files, or a
new commit that does not descend from the earlier one, the comparison is not
asked again and the new commit's backlog, records, histories, and last commit
times are read as before; a
comparison or commit read that fails is asked again with the next read at that
commit, which meanwhile reads as before. A recorded story branch that moved
costs one read of its plan and one of its last commit time at the new head,
and never a comparison.

Pages served by one dashboard process that need the same GitHub answer while
it is outstanding share one `gh` request for it, whatever was asked: two tabs
opening one project together cost what one costs, resolving the ref once and
reading each record once. A finished ref, branch-head, or check answer is never
reused, so a later load or check asks again; separately launched dashboards
share nothing.

A listed story whose latest launch on this machine settled, published at a
revision other than the one shown, and is not yet reconciled on the page costs
one comparison of the two commits per newly shown revision (a page that opens
asks one for each such story); an answered comparison is not asked again by
that page, and a failed one is asked again only with the next read.
