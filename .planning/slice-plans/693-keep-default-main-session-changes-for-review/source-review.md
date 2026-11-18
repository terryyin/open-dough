# Source review

Launch: 2026-11-18, a fresh general-purpose reviewer without conversation
inheritance. Input: only the selected story's Goal, Scope (required behavior,
scope limits, deferred promises) and Key examples, lines 98–172 of
`.planning/seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md` at
`5d4ce67ae`, copied to `source-review-input.md` in the checkout's evidence
location (`git rev-parse --git-path open-dough/evidence`). The reviewer read
no other file and changed nothing.

Unnumbered context returned: the actor and Recently done placement are the
settled baseline; "read from the checkout's local Git log" is a condition of
2a and 2b; uncommitted changes, a separately captured Dough landing and a
combined view of interrupted runs are deferred; "future" sessions only;
"pulled or merged" is one result under 4 and 5, exercised by pulling.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A future ad hoc session working in the Default main checkout, default launches and blank ones included, retains its starting point at launch. | slice 1 | observed: dashboard/backend-tests/launches/agent-launch-ad-hoc-sessions.spec.ts "a default launch {with an instruction, with no instruction} keeps the default checkout and its starting revision": launch answer and kept record hold defaultStart.startingRevision equal to the checkout HEAD and defaultStart.workspace equal to the host cwd |
| 2a | When the session is marked done by the developer, its commits are kept with its launch record: the commits made in that checkout from its launch to Done, read from the checkout's local Git log, and Review changes shows them (key example 1: one commit, plain push → that commit's changes). | slice 2 | |
| 2b | When the session is marked done automatically, the same commits are kept with its launch record. | slice 2 | |
| 3 | A commit that was amended or rebased is kept in its final form (key example 3: two commits, the second amended, both rebased onto pulled trunk → one comparison holding both commits as pushed). | slice 3 | |
| 4 | Trunk work pulled or merged in is left out (key example 2: neither holds the story's changes; key example 3: without the pulled work). | slice 3 | |
| 5 | Pulled or merged trunk work is left out including where it changed another part of a file the session changed. | slice 3 | |
| 6 | Each uninterrupted run of those commits is one retained comparison, from the commit before the run to its last commit; a session whose commits were not interrupted by pulled work opens as one comparison, with no Comparison switch. | slice 7 | |
| 7 | Otherwise the Comparison switch lists the runs, oldest first, and the review opens on the first (key example 2: the first commit's changes, with the Comparison switch offering the second). | slice 7 | |
| 8 | The review's context names the comparison as commits made in the Default main checkout while the session was open, with its exact two revisions. | slice 6 | |
| 9 | When another session was open in the same checkout during that time, the context also says the comparison may include that session's work, and the review shows the commits made while the reviewed session was open (key example 4). | slice 6 | |
| 10 | A session that made no commits there says so, apart from the not-captured explanation, including a blank default launch that edited files and committed nothing (key example 6). | slice 6 | |
| 11 | The comparisons stay readable as trunk advances. | slice 2 | |
| 12 | The comparisons stay readable after the commits leave every branch, for as long as the launch record is kept. | slice 2 | |
| 13 | The retained comparisons are released with the launch record. | slice 8 | |
| 14 | A default launch lands through Dough from the checkout → Review changes → the commits that landing made there (key example 5). | slice 3 | |
| 15 | A session completed before this story keeps the not-captured explanation (key example 7). | slice 4 | |
| 16 | A session whose checkout log cannot be read at Done keeps the not-captured explanation. | slice 4 | |
