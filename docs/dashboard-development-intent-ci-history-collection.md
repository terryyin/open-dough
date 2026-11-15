# Intent CI history collection

Part of [CI status](dashboard-development-intent-ci-status.md).

A production dashboard collects that history in the background
(`dashboard/server/landedCiCollection.ts`) whether or not a page is open. A
pass runs when the dashboard starts, so landings recorded before it started,
or before collection existed, are collected by the same rebuild; when it
records an accepted landing (see
[Landed run records](../dashboard/STORY-REVIEW-LANDED-RUNS.md)); and every
two minutes, so a pending landing is checked again until it is final. Passes
never overlap. A pass walks this machine's recorded landings onto each
configured project's ref, with the landings the history keeps itself, newest
first, until 20 measured builds are held for the project. Each landing not
final yet resolves through the CI timing comparison's Story Branch Landed
rule at its accepted revision, over the project's CI read: the `ciWorkflow`
runs at that revision, or the `ciAdapter`'s discovery. That rule measures a
landing by its landed revision's own build; a confirmed skip by its
equivalent build, the nearest earlier first-parent build, when that build
passed with valid start and completion (usable CI proof is not required for
wall time; missing proof stays a separate gap for proof-dependent figures);
and a cancelled landing by the nearest later trunk build with usable CI
proof. A CI adapter's cancelled landing still has no later-build reuse
without proof, so it stays a gap. A measured build is such a build that
passed, whose attempt has valid start/completion bounds (including equal bounds); its CI wall time
is the comparison's, from the one definition both read (`wallTimeMs` in
`dashboard/src/ciProofTimeWords.ts`). Background collection also asks that
build's CI lookup for **CI time without runner waits** once
(`timeWithoutRunnerWaitsOf`), as the [CI timing comparison](dashboard-development-intent-ci-comparison.md)
calculates it for the attempt, and keeps the answer — a time or the reason
there is none — with the build. Reading the history asks CI nothing.

A landing is pending while that rule's answer may still change: its build is
queued or running; its cancelled build awaits a later trunk build; the CI
could not be read (the pass then leaves that project until the next one);
GitHub has not answered the read of the CI proof of the build that would
stand for it; or the rule found no build that CI may still make. That last
case covers a landing recorded before GitHub created its push's run: with no
run at the landed revision and no confirmed skip, it waits for a run there
until CI moves past it, that is, until a later first-parent trunk revision
(up to the project folder's `origin/<ref>`, within 30 revisions) has a run,
and for at most an hour after the landing was recorded, since GitHub creates
a push's run within moments; and a landing whose skip rests on the nearest
earlier build waits while that build is queued or running. Once CI ran at the landed
revision, built past it without building it, or never ran for it within that
hour, the gap is final. Only GitHub's answer settles the CI proof of the
equivalent or later trunk build that would stand for a landing. While GitHub
leaves that read unanswered (a wait it directed, a request that failed, or
an artifact listing that is not one), the landing is pending as
`CI proof not read yet` and is read again at each pass, however long ago it
was recorded, for as long as it stays in the history's window; unlike CI
that could not be read, it does not stop the pass, which goes on to the
older landings. Once GitHub answers that the proof is missing, expired, or
an archive that cannot be opened or is not that run's usable summary, the
gap is final, since a run attempt's artifact does not change.

Done story comparison memory uses that same judgment on the selected Landed
slot, before comparison projection omits internal proof-read details.
Pending evidence can recover through Check again or story reselection in the
same dashboard process; completed answers and answered artifact gaps retain
final-answer reuse. Collection still owns its background acquisition cycle,
and reading local history itself asks CI nothing.

Comparison uses a locally recorded receipt age only when its project, target,
story and published Landed revision match. The earliest matching capture fixes
the one-hour deadline, including after its launch record disappears and only
retained history names it. History retains the actual target; legacy references
without that target cannot establish matching age. Missing or unreadable local
capture leaves published comparison available, with unknown age. Completion
and commit times never replace the receipt, nor does a fresh read start a new
wait. Later first-parent CI and the existing walk limit remain independent
ways to settle a no-run gap.

The local authenticated `intent=ci-history` response keeps open tabs readable
across dashboard updates: a newer shape is sent only to a reader that names
it. By default newer final reasons read `not-recorded` (“CI wall time not
recorded”); project and Done readers request `gap-reasons=timing-basis` for
that retained-timing reason. Done and scope readers request `history=glance`,
the [slim projection](dashboard-development-intent-ci-reference.md#glance-history-read).
A project read that names `measure=time-without-runner-waits` answers each
point by the build's kept **CI time without runner waits**; a read that does
not keeps today's wall-time point. Neither changes collected observations,
timing calculations or the cohort beyond that named measure.

Each landing is kept by its receipt, with its own reference (revision, when
it was recorded, its story), and each build once by its run and attempt, in
`~/.open-dough/dashboard/landed-ci-history.json`. A final resolution is never
resolved or replaced again; a pending one is replaced by what the landing
resolves to next. So a restart, a repeated landing report, or a second
production dashboard on the machine resumes collection and keeps one
observation per landing and one entry per build, and a pending landing whose
Done record has expired (after 30 days) is still resolved from the history's
own reference. The file keeps only each project's window: its landings,
newest first, up to the one that brings the 20th measured build, with any
older landing one of those builds also measures, and the builds they name.
An older landing, pending or not, is dropped and never asked about again. A
development dashboard collects nothing and reads the same history. The file
is derived local evidence: deleting it loses only the requests to rebuild it
and evidence CI no longer keeps.
