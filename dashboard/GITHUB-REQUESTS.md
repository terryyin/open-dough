# Dashboard GitHub requests

What the [story dashboard](README.md) asks GitHub through the launching
person's own `gh`, and so what it costs their GitHub API allowance.

Each load of the dashboard, and each Refresh, makes two authenticated `gh`
requests for membership, plus one per record not already read at that revision
for preparation and detail, and, once per revision, one listing of the agent
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
branch head request and one plan read on that branch. These count against the
launching person's own GitHub API allowance. Each revision check is one more
`gh` request, whatever the number of branches, or two when the listing fails
and `main` is asked alone (at most four a minute per visible page, none while
it is hidden, and none before a rate limit's directed time). GitHub documents
an unchanged `304` as not counting against the primary allowance, but that has
not been confirmed here, so count each check as a request. A newly published
commit then costs one backlog read plus its records and one history listing
per readable profile, without resolving `main` again; a recorded story branch
that moved costs one read of its plan and one of its last commit time at the
new head.
