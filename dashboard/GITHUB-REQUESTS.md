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
at a later revision an unchanged profile costs only its history listing. Each
GitHub account matched to a credited human costs one unauthenticated read of
its avatar image from GitHub's avatar host while the dashboard process runs,
which does not use the `gh` allowance; a failed avatar read is asked again
when the avatar is next shown. Each
Taken entry with a counted plan adds one last-commit-time request for its plan
and one for its agent profile, and each Story Branch Mode entry adds one
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
commit then costs one backlog read plus its records, done records, and one history listing
per readable profile, without resolving `main` again; a recorded story branch
that moved costs one read of its plan and one of its last commit time at the
new head.

Pages served by one dashboard process that need the same GitHub answer while
it is outstanding share one `gh` request for it, whatever was asked: two tabs
opening one project together cost what one costs, resolving the ref once and
reading each record once. A finished ref, branch-head, or check answer is never
reused, so a later load or check asks again; separately launched dashboards
share nothing.

Once GitHub refuses any request with a rate limit that directs a wait, one
dashboard process makes no `gh` request at all until that time, for any page,
project, or project addition: what is asked meanwhile is answered as limited and
costs nothing. A request already at GitHub when the limit was met is still
answered and counted. A separately launched dashboard does not know of the wait
and asks at once.

A listed story whose latest launch on this machine settled, published at a
revision other than the one shown, and is not yet reconciled on the page costs
one comparison of the two commits per newly shown revision (a page that opens
asks one for each such story); an answered comparison is not asked again by
that page, and a failed one is asked again only with the next read.
