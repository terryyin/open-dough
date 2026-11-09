# Shared GitHub request owner

The dashboard and CI observers share GitHub request ownership. Per-action request
costs are in [Dashboard GitHub requests](GITHUB-REQUESTS.md).

Every `gh` request is made by the one request owner, on this machine, of the API host and login it
is asked with: a process the first dashboard or CI observer to need GitHub starts, which every
dashboard process and CI observer of this user asking with that host and login then asks through a
socket under `/tmp/dough-github-requests-UID/`, in a directory only this user can enter, with a
token only this user can read. The host is the one `GH_HOST` names, `github.com` otherwise. The
login is the token `gh auth token` prints for the asking process: read on this machine without a
GitHub request, once per process and again when a `GH_` or `GITHUB_` setting or `gh`'s stored logins
change. A token variable and a stored login holding the same token therefore share one owner; two
tokens of one GitHub account do not. The token names the owner's directory only through a secret of
this user's, and is never written there or sent to the owner. An owner asks GitHub nothing of its
own, accepts only `gh api` reads asked under its own host and login, and runs `gh` with the
environment of the process that started it. Owners of different hosts or logins share nothing: no
turn, rate-limit wait, or outstanding request. Within one owner, GitHub's search and GraphQL
allowances each have their own turns and wait, apart from every other route's; no dashboard or CI
read uses either.

After `gh auth switch`, a new login, or a changed token, a request still outstanding under the
earlier login is answered to nobody and asked again under the new one: one more request each. The
earlier login's owner then asks GitHub nothing, and stays only while its rate-limit wait stands,
which holds that login again if it returns. Otherwise an owner ends five seconds after its last
dashboard or observer left, unless a rate limit's wait stands. While no owner can be reached or
started -- or the one standing speaks another version's protocol -- each read fails without asking
GitHub.

An unavailable owner names only its observed local cause: an endpoint that is not a directory,
belongs to another user, is open to others, or has a path too long for a socket; failed startup or
connection; a connection lost while the request was outstanding; an explicit protocol or caller
refusal; or no usable answer. Silence stays unknown, rather than establishing a protocol mismatch.
Notices and failed-read history keep these safe categories without endpoint paths, tokens,
credentials or raw error text. Recovery addresses the local endpoint configuration and restarts the
reader; a dashboard read whose connection was lost needs no correction, since its next check asks
through the owner then standing. No private fallback asks `gh`. A failure before connection leaves
the read unasked; after dispatch, a lost connection cannot establish whether GitHub was asked. A
waiter's abort and timeout retain their own rejection behavior.

An owner that is killed, or lost in any way it could not prepare for, is replaced by the next
dashboard or observer to need GitHub. Each read waiting on the lost owner fails then, as a read
GitHub failed to answer does, and is asked again only when its page or observer next asks: one more
request each. The lost owner's `gh` requests still at GitHub -- already counted by GitHub -- are
recorded in its directory by process, exact arguments and start time, and the replacement ends each
before it asks anything, so the eight at once hold through a replacement: a request that does not
end when asked is killed a second later. A recorded process ID now running anything else is left
alone. One the replacement cannot look at, where it may not read the process table, takes one of its
eight turns until that process is gone. An owner still running after another replaced it asks
nothing more and passes no answer on.

Request-call and CI-mailbox owners share process-table readings and recognition of exited processes.
Each retains its own identity checks, inspection-denial policy and rechecks before signaling; shared
facts grant no new signaling authority. Endpoint connections own socket ownership, reachability,
greeting and host/login scope. Wire encoding owns protocol framing, fixed-read validation and safe
answer conversion.

Pages and processes that need the same GitHub answer while it is outstanding share one `gh` request
for it, whatever was asked: two tabs opening one project together cost what one costs, resolving the
ref once and reading each record once, and so do two dashboards, or five processes asking one
question together: one request. Within one dashboard process, a settled branch-head listing also
answers later paced or revealed checks of the same project under the same login for the reuse window
above; a finished ref answer is never reused for a later load or return, which still resolves the
configured ref afresh. Separately launched dashboards share outstanding requests, turns, and the
rate-limit wait, and the content and history either already read, but no settled listing across
processes.

This user's dashboards and CI observers asking with one host and login together have at most eight
`gh` requests under way at GitHub at once, across every page, project, project addition, and
observed run; a shared request counts once. Two dashboards reading ten different records between
them, one of them from both, while a CI observer reads its workflow, cost eleven requests, eight of
them at GitHub at a time. Further requests wait their turn in the order they were asked, which adds
waiting but never requests; a request whose page stops waiting before its turn is never asked, and
waiting counts toward the 30-second bound. A page that stops waiting, or a dashboard that closes,
ends a request only when no other page or process waits for it.

Once GitHub refuses any request with a rate limit, none of them makes a `gh` request until the wait
ends, for any page, project, project addition, or observed run: what is asked meanwhile -- by the
dashboard that met the limit, another dashboard, a CI observer, or a diagnostic read started
afterwards -- is answered as limited and costs nothing. The wait is the one GitHub directed, or,
when it directed none or named a time already passed, one minute, doubled for each such refusal of
the first request after the wait, up to one hour, and one minute again once a request succeeds. A
request already at GitHub when the limit was met is still answered and counted. When any wait ends,
one request goes first while the others wait their turn: refused with a new limit, it alone is
counted and the others are answered as limited; ended any other way -- answered, GitHub unreachable,
the request gone, or timed out -- the others proceed up to eight at once. A request waiting its turn
when a wait starts is answered as limited and never asked. The owner stays while a wait stands, so a
dashboard or observer started during it waits too. Each wait -- its end, the doubling reached, and
whether one request still goes first -- is also stored in the owner's directory, and flushed to
disk, before any read is answered as limited: an owner killed during a wait is replaced by one that
asks nothing until the wait ends and then lets one request go first, as does an owner started after
the wait ended with nobody asking. While a wait cannot be stored, the read that met the limit and
each read after it fail as unanswered reads do instead of being answered as limited, and still none
is asked before the wait ends. Only a restart of the machine that clears `/tmp`, or removing the
directory, forgets a wait: what is asked next then reaches GitHub at once.

When the wait ends, each visible page asks again on its own, and a page hidden then asks when it is
next seen; nothing waits for a reload. A page whose snapshot met the limit only in a revision check
makes its next check, one request. A page that showed nothing, or whose snapshot's detail the limit
withheld, reads the configured ref afresh as a reload does: one request for the ref, one per
recorded story branch head, one per request the limit withheld (a record, a history listing, or the
commits walked from the step the limit refused), and one per record GitHub answered as missing, or
failed to answer, at that revision; content already read is not asked again, so a credited human and
its Take clock withheld at an unchanged trunk revision cost only their history's unanswered steps.
Pages recovering together share each request outstanding for them all, and the first goes alone as
after any wait.
