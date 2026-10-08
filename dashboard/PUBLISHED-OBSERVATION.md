# Published dashboard observation

The dashboard reads `.planning/PRODUCT-BACKLOG.md` from the selected project's
saved repository and ref, resolves that ref to one commit, and reads the backlog
at that commit. Every project -- public Open Dough and Doughnut as much as
private Pygardon -- is read the same way: through a small local
authenticated read boundary (`server/authenticatedRead.ts`, reached from the
browser through `src/authenticatedRead.ts`) that resolves the ref and reads
the backlog and the records it names through the local `gh` CLI's own
existing authentication. Each file arrives exactly as origin holds it at that
revision: the boundary asks for GitHub's raw media type, not a JSON-typed one
whose text `gh` would sanitize, rewriting control-character escapes such as a
literal `\u0002`. The browser never reads GitHub directly and never
receives a credential; there is no dashboard sign-in and no token-entry UI.
Reading a project needs only the `gh` access the launching person already
has -- the same access `gh api repos/terryyin/pygardon/commits/main` proves
from a terminal -- and works from the ordinary launch route:
`npm run dev:dashboard`, `npm run watch:dashboard`, or `npm run build:dashboard`
followed by `npm run preview:dashboard`. Development and built preview mount the
same local read boundary from their Vite configuration, so the watcher's
production preview needs no separate authentication setup.

Selecting a project replaces the whole view and reads that project afresh. It
reads once on opening, and reloading the page or returning to the project reads
it again: GitHub is asked anew which commit the configured ref names and which
head each recorded story branch names, while backlog and record text this
dashboard process already read at those commits is not asked again. A record
GitHub answered as missing, or that could not be read, is asked for again. While a snapshot
is shown and the page is visible, it also asks every 15 seconds whether the
project's configured ref still names the shown revision -- one conditional listing of
every published branch head, which GitHub answers with `304 Not Modified` when
no branch moved, so an unchanged ref reads no backlog or record and changes
neither the revision nor the retrieval time. When the configured ref names a new commit,
the page reads exactly that commit, so newly published work appears within
about 30 seconds. Its backlog is read there directly, so its cards appear
without waiting on anything else, while the details that follow may reuse
earlier answers. Only GitHub's own account of what changed lets those details
reuse anything: the dashboard process compares the new commit with the
revision at which it last read the backlog and reads each commit between, and
a record or record listing that neither the comparison's files nor
any of those commits touched is answered from what it already read, as the
new commit's own, as are the addition that credits a profile's human and a
plan's last commit time when none of them touched that profile or plan;
identical text never stands in for that, so a profile removed and re-added
credits the re-adding commit. A record the comparison or a commit between
names as changed, added, removed, or renamed away is read at the new commit,
even when the commit that changed it is a merge whose own change list does
not name it, and one missing there stays missing. When the new commit does
not descend from the earlier one, more than ten commits lie between, the
comparison's or a commit's change list is not given whole (GitHub names at
most 300 files), or the comparison fails other than by a rate limit, the new commit's details are read as a first visit reads them; a rate limit withholds the details it stopped, never the cards already shown. While the configured ref is unchanged, a story branch that a shown Taken
entry's Story Branch Mode profile records and that names a new head (or is no
longer published) has only that entry's plan and its last commit time read
again at the new head; any other branch moving reads nothing. A hidden page (another tab,
a minimized window) asks nothing and abandons a check under way; when it is
seen again it checks once at once, then resumes the 15-second pace. Each read
replaces the whole view with one revision. No local
checkout, unpushed change, or running agent is a source of what it shows:
Taken means recorded as taken, not that anyone is working now.

Pages served by one dashboard process share what they ask GitHub: a request
that needs an answer another request already waits for waits on that same
`gh` request instead of asking again. Two tabs opening one project together
resolve its ref once and read each record once, and revision checks from pages
showing different revisions or watching different branches share one
branch-head listing, each learning its own answer. Each page still shows what
it would have read alone, under its own observation, and a shared resolution
of the ref answers when GitHub was asked. A page that closes, is hidden, or
switches project stops waiting without ending a read another page still waits
for; the last one leaving ends it, as closing the dashboard does. A finished
ref or branch-head answer is never reused: a later open or check asks again.
A shared request that GitHub refuses, or leaves unanswered for the 30-second
bound counted from when it was first asked, fails every page waiting on it
alike, so a page that joined it late can be told so sooner than 30 seconds
after it asked; the failure is not kept, and the next request asks again,
once any rate limit's wait has passed. However many pages and projects ask, one
dashboard process has at most eight reads under way at GitHub at once, a
shared read counting once; further reads wait their turn in the order they
were asked. A read whose page stops waiting before its turn never reaches
GitHub, and time spent waiting counts toward the 30-second bound, so a read
still waiting then fails as unanswered.

The complete backlog is interpreted before its membership appears. Preparation
facts, profile assignments (including queued preparers and the roster), and done
stories then appear as each group finishes, retaining the other groups already
read at that revision. An unfinished group stays pending. Taken slice progress
waits for preparation and profiles to establish its source; clocks also need
their plan and allocation evidence. Credited humans and clocks fill independently
without holding back unrelated facts. Partial display does not complete the
observation: startup reconciliation still waits for the whole read to settle.
Arriving groups, including a group's read gap, retain the selected columns and
open story inspection. When the story and focused control remain present, the
keyboard and visible reading context stay there as the facts enrich the page.

The branch-head listing (`matching-refs/heads/`) is one unpaginated answer, and
the local boundary accepts at most 1 MiB of `gh` output (`maxBuffer` in
`server/ghRead.ts`), about 2,700 branches. When that listing fails for any
reason but a rate limit -- GitHub gives up on it (for example with a `504`), or
it is larger than that -- that check asks only which commit the configured ref names
(`commits/<ref>`) and reports no branch heads: a move of the configured ref is still found,
but no story branch is seen to move until the next listing that succeeds, when
watching branches resumes.

A read that fails, finds a backlog the shared reader refuses, or waits more than
30 seconds for GitHub (`readWaitLimitMs` in `src/authenticatedReadRules.ts`, the
bound the local boundary shares) ends as a read problem, never as an empty or
partial backlog. The snapshot read earlier stays shown with its own revision and
retrieval time -- it is the last successful snapshot, not a claim that the configured ref
still names it -- the problem says what failed and when, and how the page
recovers: an eligible temporary failure -- a wait-bound timeout, a recognized
lost connection, or GitHub's HTTP `408`, `500`, `502`, `503`, or `504` -- of
the empty page or of detail on a shown snapshot is read again on its own 15,
then 30, then 60 seconds after settlement, thereafter at most once a minute,
while the page is visible; at an unchanged revision, successfully shown facts
stay shown and only eligible unanswered questions are asked again; a rate limit
still waits for GitHub's time; access, missing, invalid, or unknown failures
stay until the page is reloaded and are not looped by another detail's
recovery. When GitHub's rate limit stopped
the read, the page reads on its own once the limit's time passes. A failed revision check, or a failed read
of a newly found commit's backlog, is reported the same way and keeps that
snapshot. While a snapshot is shown the page keeps checking, but only at the
15-second pace, never at once: a new commit whose backlog could not be read is
found again by the next check and read then. When GitHub answers any read with a
rate limit that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
once `X-RateLimit-Remaining` is `0`), the dashboard process asks GitHub nothing
more until that time, whichever page or project asks: each read asked meanwhile,
and adding a project, is answered at once as limited, says it was not asked,
and carries the whole seconds left, so it is never taken for a missing record. A
read already at GitHub keeps GitHub's own answer, and a later directed time only
extends the wait. A rate-limit refusal that directs no usable wait, including
one naming a time already passed, holds back reads the same way for one
minute; when the first read after that wait is refused the same way, the wait
doubles, up to one hour, and once a read succeeds the next such refusal waits
one minute again. Its problem says GitHub named no wait and when reading
resumes. When any wait ends, directed or not,
reading resumes with one read: the reads asked with it wait their turn until
it ends, then proceed up to eight at once, whether GitHub answered it, was
unreachable, its request left, or it timed out; if GitHub limits it again,
they are answered as limited with the new resume time and only that read
reached GitHub. A read waiting its turn when a wait starts is answered as
limited at once and never reaches GitHub. An unmarked `403`, a `404`, a timeout,
or an unreachable GitHub holds back nothing. The wait is kept in the process's memory,
so a newly started dashboard asks at once. A page told of such a wait by any of its
reads -- the membership read, a detail, or a revision check -- keeps that time
as its one record of the limit, across project selection, and a later limited
answer only moves it later; until then it asks the local boundary nothing --
no check, even when the page is seen again, and no detail -- answering each
read as limited itself, and one notice says that GitHub limited requests and
when reading resumes, the same way whichever read was limited, and what the
page reads then. Once that time passes on a visible page, or when a page
hidden then is seen again, the page reads on its own what the limit withheld,
without a reload: with no snapshot shown it reads the project; with a
snapshot whose detail the limit withheld it reads the configured ref afresh
beside that snapshot, which stays shown until the new read replaces it, so
GitHub is asked which commit the ref and each recorded story branch name and
for the withheld records, never again for content already read at those
commits; with a snapshot read whole it makes its next revision check at the
usual pace. Its notice clears then. A human or Take whose profile history or
addition commit the limit withheld is read the same way even while trunk
stays at the shown revision: each profile's history listing and each commit
walked back to its addition are remembered once answered, so the walk asks
only from the step the limit refused, once for the human and the clock that
share it.
Each withheld record file, profile set, human, clock, or done record is
labeled one way, never as missing: "GitHub's rate limit withheld" what was
being read, and "Limited until" that time, whether GitHub refused the read,
the process held it back, or the page did not ask; no label names a number of
seconds. A human whose profile history was withheld is unknown on its card,
while its detail and the roster give that label after "Human developer
unknown." Another tab, or the page reloaded, learns the same limit from its
next request, which the process holds back without asking GitHub. The
boundary passes on only the validated wait, or its own when GitHub directed
none, at most one hour. The page's wait ends only at its time: a later check
or read that succeeds clears the problem, unless the problem stands with its
snapshot as described below, but no answer lifts the wait early. A record
detail that could not be read for an access, missing, invalid, or unknown reason stays
labeled on its card rather than borrowing an older one; checks that find the
configured ref unchanged never read it again, and eligible recovery of another
gap does not ask it again for that same pin -- reload the page to try it at the
same revision after access is corrected. A fresh read after a limit asks it
again with the rest, and it stays a gap while GitHub still does not answer it.
When the 30-second bound ends a read after the new commit's backlog was shown,
each detail still unread is shown as such a gap on that snapshot, and the
problem stands with it (a slice clock or credited human still unread is only
its own gap): a check that finds the configured ref unchanged does not clear
it; an eligible unread detail is read again on the page's transient recovery
schedule at that same revision, keeping successfully shown facts. A hidden
page asks no recovery attempt and releases only its own outstanding recovery
wait; another page waiting on the same shared read may finish it. The due time
and backoff step are kept: when the page is seen again it recovers once if
due, or waits for the remaining time, without replaying missed attempts or
resetting the budget by toggling visibility. A standing GitHub rate-limit wait
still takes precedence over a shorter transient backoff and is never shortened;
ordinary transient failures do not start a login-wide cooldown. Launch
reconciliation and periodic checks do not bypass an outstanding recovery wait;
a due recovery still resolves the configured ref afresh and discovers
publication. Switching projects clears that project's local recovery while a
standing login limit remains, abandons the previous project's read, detail
reads, and revision check, and leaves a late answer unable to change what is
shown; only the newly selected project is checked from then on. Selecting
another project stays available throughout: a failed or still-reading project
never blocks switching to another, and returning to a project starts a fresh
read rather than replaying the failure.

If reading a project fails, the read problem names that project's repository
and what the local `gh` could establish -- for example that it is not logged
in, or GitHub's HTTP status -- never `gh`'s own output, and never that the
repository does not exist, since an inaccessible read is not proof of that.
Check `gh auth status`, then confirm, for example,
`gh api repos/terryyin/pygardon/commits/main` answers from a terminal; once it
does, reload the page (or, with a snapshot shown, let the next check find it).
The dashboard never logs in on its own.

On the launching machine, a maintainer can inspect this process's newest failed
upstream reads without a diagnostics screen or persistent storage. Same-origin
loopback `GET /__authenticated-read-diagnostics?source=<configured-id>` returns
that configured source's entries from the newest 100 failures kept in memory
for this dashboard process (oldest dropped), and asks GitHub nothing. Unknown
sources and disallowed origins or methods are refused before any GitHub call,
under the same local-origin protections as the read boundary. Each shared `gh`
invocation that failed contributes one entry, attributed to the admitted reader
that started it — not one per waiter — with time, configured source id, fixed
request category, pinned revision when the request already knew one, failure
classification, elapsed time from when that invocation started, and, only when
GitHub answered, HTTP status, GitHub request id, and validated rate-limit
limit/remaining/reset/resource and Retry-After values. Each textual metadata
field is at most 256 characters; numeric values are finite nonnegative safe
integers. Credentials, request or response bodies, raw CLI output, arbitrary
headers, and caller-supplied command or path text are never retained or
returned. A read held back by admission stays identifiable in the ordinary
limited response and does not invent an upstream diagnostic event; a local
deadline or lost connection records its cause without inventing a GitHub status
or request id. Ordinary waiter departure is not recorded as a retryable
failure. A newly started dashboard has an empty history.
