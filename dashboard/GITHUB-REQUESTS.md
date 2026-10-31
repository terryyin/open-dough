# Dashboard GitHub requests

What the [story dashboard](README.md) asks GitHub through the launching
person's own `gh`, and so what it costs their GitHub API allowance.

Each load of the dashboard makes one authenticated `gh` request resolving the
configured ref, and one reading its backlog unless a dashboard process on this machine
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
branch head request and one plan read on that branch. Opening Intent for a
project adds, at the observed revision, one read of `.planning/open-dough.json`
when that file is not already pinned, plus one recursive Git trees listing per
configured intent location, and one contents read of each selected feature file
not already pinned; paths outside those locations are refused without a
contents read. Only the ref and branch
head requests are made on every load: content and history already read at a
resolved revision or branch head by any dashboard process of this user on this
machine are not asked again, so a reload, a return to a project, a replaced
production dashboard, or a second dashboard process at a ref and branches that
are unchanged costs those requests plus one for each record GitHub answered as
missing, or failed to answer, at that revision. Those answers are kept under
`~/.open-dough/dashboard/retained-answers/`, readable only by this user,
within 64 MiB: a write that takes them over it removes the answers least
recently written or answered first, and a removed answer is asked again when
next needed. Revoking GitHub access does not remove them; deleting the
directory does, and costs only the requests it saved. These count against the
launching person's own GitHub API allowance. Each revision check is one more
`gh` request, whatever the number of branches, or two when the listing fails
and `main` is asked alone (at most four a minute per visible page, none while
it is hidden, and none before a rate limit's wait ends); checks asked from
several pages while one listing is outstanding share it. GitHub documents
an unchanged `304` as not counting against the primary allowance, but that has
not been confirmed here, so count each check as a request. A newly published
commit then costs, without resolving `main` again, one read of its backlog,
which answers its membership without waiting on anything else; then, for its
details, one comparison of it with the revision at which any dashboard
process of this user on this machine last read the backlog, one read of each
commit between them (a commit already asked about is not asked again), and
reads of only the records, done records, and record listings the comparison or
those commits changed (a merge's own change list
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

Every `gh` request is made by the one request owner, on this machine, of the
API host and login it is asked with: a process the first dashboard or CI
observer to need GitHub starts, which every dashboard process and CI observer
of this user asking with that host and login then asks through a socket under
`/tmp/dough-github-requests-UID/`, in a directory only this user can enter,
with a token only this user can read. The host is the one `GH_HOST` names,
`github.com` otherwise. The login is the token `gh auth token` prints for the
asking process: read on this machine without a GitHub request, once per
process and again when a `GH_` or `GITHUB_` setting or `gh`'s stored logins
change. A token variable and a stored login holding the same token therefore
share one owner; two tokens of one GitHub account do not. The token names the
owner's directory only through a secret of this user's, and is never written
there or sent to the owner. An owner asks GitHub nothing of its own, accepts
only `gh api` reads asked under its own host and login, and runs `gh` with
the environment of the process that started it. Owners of different hosts or
logins share nothing: no turn, rate-limit wait, or outstanding request. Within
one owner, GitHub's search and GraphQL allowances each have their own turns
and wait, apart from every other route's; no dashboard or CI read uses either.

After `gh auth switch`, a new login, or a changed token, a request still
outstanding under the earlier login is answered to nobody and asked again
under the new one: one more request each. The earlier login's owner then asks
GitHub nothing, and stays only while its rate-limit wait stands, which holds
that login again if it returns. Otherwise an owner ends five seconds after
its last dashboard or observer left, unless a rate limit's wait stands. While
no owner can be reached or started -- or the one standing speaks another
version's protocol -- each read fails without asking GitHub.

An unavailable owner names only its observed local cause: an endpoint that is
not a directory, belongs to another user, is open to others, or has a path too
long for a socket; failed startup or connection; an explicit protocol or caller
refusal; or no usable answer. Silence stays unknown, rather than establishing
a protocol mismatch. Notices and failed-read history keep these safe categories
without endpoint paths, tokens, credentials or raw error text. Recovery addresses
the local endpoint configuration and restarts the reader. No private fallback
asks `gh`. A failure before connection leaves the read unasked; after dispatch,
a lost connection cannot establish whether GitHub was asked. A waiter's abort
and timeout retain their own rejection behavior.

An owner that is killed, or lost in any way it could not prepare for, is
replaced by the next dashboard or observer to need GitHub. Each read waiting
on the lost owner fails then, as a read GitHub failed to answer does, and is
asked again only when its page or observer next asks: one more request each.
The lost owner's `gh` requests still at GitHub -- already counted by GitHub
-- are recorded in its directory by process, exact arguments and start time,
and the replacement ends each before it asks anything, so the eight at once
hold through a replacement: a request that does not end when asked is killed
a second later. A recorded process ID now running anything else is left
alone. One the replacement cannot look at, where it may not read the process
table, takes one of its eight turns until that process is gone. An owner
still running after another replaced it asks nothing more and passes no
answer on.

Request-call and CI-mailbox owners share process-table readings and recognition
of exited processes. Each retains its own identity checks, inspection-denial
policy and rechecks before signaling; shared facts grant no new signaling
authority. Endpoint connections own socket ownership, reachability, greeting
and host/login scope. Wire encoding owns protocol framing, fixed-read validation
and safe answer conversion.

Pages and processes that need the same GitHub answer while it is outstanding
share one `gh` request for it, whatever was asked: two tabs opening one
project together cost what one costs, resolving the ref once and reading each
record once, and so do two dashboards, or five processes asking one question
together: one request. A finished ref, branch-head, or check answer is never
reused, so a later load or check asks again; separately launched dashboards
share outstanding requests, turns, and the rate-limit wait, and the content
and history either already read, but no finished ref, branch-head, or check
answer.

This user's dashboards and CI observers asking with one host and login
together have at most eight `gh` requests under way at GitHub at once, across
every page, project, project addition, and observed run; a shared request
counts once. Two dashboards
reading ten different records between them, one of them from both, while a CI
observer reads its workflow, cost eleven requests, eight of them at GitHub at
a time. Further requests wait their turn in the order they were asked, which
adds waiting but never requests; a request whose page stops waiting before its
turn is never asked, and waiting counts toward the 30-second bound. A page
that stops waiting, or a dashboard that closes, ends a request only when no
other page or process waits for it.

Once GitHub refuses any request with a rate limit, none of them makes a `gh`
request until the wait ends, for any page, project, project addition, or
observed run: what is asked meanwhile -- by the dashboard that met the limit,
another dashboard, a CI observer, or a diagnostic read started afterwards --
is answered as limited and costs nothing. The
wait is the one GitHub directed, or, when it directed none or named a time
already passed, one minute, doubled for each such refusal of the first request
after the wait, up to one hour, and one minute again once a request succeeds. A
request already at GitHub when the limit was met is still answered and counted.
When any wait ends, one request goes first while the others wait their turn:
refused with a new limit, it alone is counted and the others are answered as
limited; ended any other way -- answered, GitHub unreachable, the request gone,
or timed out -- the others proceed up to eight at once. A request waiting its
turn when a wait starts is answered as limited and never asked. The owner
stays while a wait stands, so a dashboard or observer started during it waits
too. Each wait -- its end, the doubling reached, and whether one request
still goes first -- is also stored in the owner's directory, and flushed to
disk, before any read is answered as limited: an owner killed during a wait
is replaced by one that asks nothing until the wait ends and then lets one
request go first, as does an owner started after the wait ended with nobody
asking. While a wait cannot be stored, the read that met the limit and each
read after it fail as unanswered reads do instead of being answered as
limited, and still none is asked before the wait ends. Only a restart of the
machine that clears `/tmp`, or removing the directory, forgets a wait: what is
asked next then reaches GitHub at once.

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

With [feedback maintenance](FEEDBACK-MAINTENANCE.md) On, the production
dashboard server checks once it listens and then every 15 minutes, whether or
not a page is open: each check with no feedback maintenance session running on
this machine costs one request resolving Open Dough's configured ref, plus one
read of `docs/maintainer/near-term-watch-list.md` at a revision no dashboard
process of this user on this machine has read it at -- so at most four ref
requests an hour, and one watch list read per published revision. A check
while the setting is Off, or while a feedback maintenance session is running,
asks GitHub nothing. A failed check is asked again at the next one.

Inspecting recent failed upstream reads through
`GET /__authenticated-read-diagnostics?source=<configured-id>` costs no GitHub
request: the response is answered from this process's in-memory history under
the same local same-origin admission as other authenticated-read routes, and a
refused diagnostic request never launches `gh`. Each dashboard process keeps
the failed reads it waited on, one entry for a request several of its pages
shared; a request two dashboards shared is in each one's history.

An actual subprocess output bound is reported as `output-bound`; its partial
body is discarded, while known upstream status/headers and directed-rate-limit
precedence remain. It supplies no retry or login advice, and diagnostics invent
no upstream status or rate evidence.

The installed [CI diagnostic](../src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs)
retains failed steps and every readable log excerpt when another log is missing.
A held job carries numeric `logWaitSeconds` alongside `logUnavailable`; any held
log makes the command exit 75. Expired HTTP 404/410 logs, output bounds and other
failed requests supply no delay. Other partial diagnostics exit 0; jobs-acquisition
failure exits 1, or 75 when held. Agents classify from available evidence, retain
uncertainty when insufficient, and retry only after numeric directed waits end,
following the shared [CI repair guidance](../src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification).
