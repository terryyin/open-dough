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
about 30 seconds. Only GitHub's own account of what changed lets that read
reuse anything: the dashboard process compares the new commit with the
revision at which it last read the backlog and reads each commit between, and
a backlog, record, or record listing none of those commits touched is answered
from what it already read, as the new commit's own, as are the addition that
credits a profile's human and a plan's last commit time when none of them
touched that profile or plan; identical text never stands in for that, so a
profile removed and re-added credits the re-adding commit. A record a commit between
changed, added, or removed is read at the new commit, and one missing there
stays missing. When the new commit does not descend from the earlier one, more
than ten commits lie between, a commit's change list is not given whole, or
the comparison fails, the new commit is read as a first visit reads it. While the configured ref is unchanged, a story branch that a shown Taken
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
after it asked; the failure is not kept, and the next request asks again.

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
recovers: with a snapshot shown, automatic checks continue (or, after a rate
limit, the problem says when they resume); with nothing shown, reloading the
page reads again. A failed revision check, or a failed read
of a newly found commit's backlog, is reported the same way and keeps that
snapshot. While a snapshot is shown the page keeps checking, but only at the
15-second pace, never at once: a new commit whose backlog could not be read is
found again by the next check and read then. When GitHub answers a check with a
rate limit that says when to ask again (`Retry-After`, or `X-RateLimit-Reset`
once `X-RateLimit-Remaining` is `0`), the page asks nothing more until that time
-- even when the page is seen again -- and the problem says when checks resume.
The boundary passes on only the validated wait, at most one hour. A later check
or read that succeeds lifts any such wait and clears the problem, unless the
problem stands with its snapshot as described below. A record detail that
could not be read stays labeled on its card rather than borrowing an older one;
checks that find the configured ref unchanged never read it again, so reload the page to
read it again at the same revision. When the 30-second bound ends a read after the
new commit's backlog was shown, each detail still unread is shown as such a gap
on that snapshot, and the problem stands with it (a slice clock or credited
human still unread is only its own gap): a check that finds the configured ref unchanged
does not clear it, and only a later read that replaces that snapshot does.
Selecting another project stays available throughout: a failed or still-reading
project never blocks switching to another, and returning to a project starts a
fresh read rather than replaying the failure. Switching projects abandons the
previous project's read, detail reads, and revision check; a late answer from
any of them changes nothing, and only the newly selected project is checked from
then on.

If reading a project fails, the read problem names that project's repository
and what the local `gh` could establish -- for example that it is not logged
in, or GitHub's HTTP status -- never `gh`'s own output, and never that the
repository does not exist, since an inaccessible read is not proof of that.
Check `gh auth status`, then confirm, for example,
`gh api repos/terryyin/pygardon/commits/main` answers from a terminal; once it
does, reload the page (or, with a snapshot shown, let the next check find it).
The dashboard never logs in on its own.
