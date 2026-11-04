# Dashboard read diagnostics

What the [story dashboard](README.md) keeps about reads that failed, and how
it reports them, beside what its reads cost in
[Dashboard GitHub requests](GITHUB-REQUESTS.md).

Inspecting recent failed upstream reads through
`GET /__authenticated-read-diagnostics?source=<configured-id>` costs no GitHub
request: the response is answered from this process's newest 100 in-memory
failures (oldest dropped) and this user's incident record under the same local
same-origin admission as other authenticated-read routes, and a refused
diagnostic request never launches `gh`. Unknown sources and disallowed origins
or methods are refused before any GitHub call. Each dashboard process keeps the
failed reads it waited on, one entry for a shared `gh` invocation — not one per
waiter — with time, configured source id, fixed request category, pinned
revision when known, failure classification, elapsed time from when that
invocation started, and, only when GitHub answered, HTTP status, GitHub request
id, and validated rate-limit limit/remaining/reset/resource and Retry-After
values. Each textual metadata field is at most 256 characters; numeric values
are finite nonnegative safe integers. Credentials, request or response bodies,
raw CLI output, arbitrary headers, and caller-supplied command or path text are
never retained or returned. A read held back by admission stays identifiable in
the ordinary limited response and does not invent an upstream diagnostic event;
a local deadline or lost connection records its cause without inventing a
GitHub status or request id. Ordinary waiter departure is not a retryable
failure. A newly started dashboard has an empty in-memory history; its incident
record lists what earlier processes recorded. A request two dashboards shared
is in each one's history.

The incident record ([incidentRecord.ts](server/incidentRecord.ts)) keeps
that evidence after the process that wrote it is replaced. It lives in
`~/.open-dough/dashboard/incidents/`, a folder only this user can open
(`0700`, files `0600`): `entries.jsonl`, one entry appended per line by every
dashboard process of this user, and `record.json`, when the record began and
how many entries it dropped. Each entry carries its wall-clock `at`, the
writing process's `pid`, start, and age, the `serverInstance` within it that
wrote it (a dev server restarted in place, as Vite does when a server file
changes, is a new instance of the same process, with its own entries and
lifecycle), and the dashboard `revision` it ran.
A `failed-read` entry adds the diagnostics fields above and where the read
failed (`failureCategory`: `local` before GitHub could answer, `upstream`
when GitHub refused, `unknown` when the process cannot tell), whether the
request owner had asked GitHub (`dispatched`) and the wait before it did
(`queueWaitMs`), and the owner it was sent to by process, generation, and
the protocol version it reported (`ownerPid`, `ownerGeneration`,
`ownerProtocol`) -- never its caller token or socket path, and
never a body, raw CLI output, or credential. Writes happen after the failed
read has answered, one at a time per process; a request never waits for them.
Pruning keeps the newest 1,000 entries within 512 KiB and adds the rest to the
dropped count.

Each dashboard server also records itself there
([incidentLifecycle.ts](server/incidentLifecycle.ts)): `process-started` when
it mounts its boundaries and, on a clean close (its SIGTERM, as a production
replacement sends), every entry it had queued and then `process-ended`. A
process killed outright (SIGKILL, a crash) writes nothing more, so the entries
it had queued in its last milliseconds are lost and its record ends without
`process-ended`. While it runs, it watches its own event loop
([eventLoopWatch.ts](server/eventLoopWatch.ts)) with the runtime's delay
histogram, which costs the loop nothing, read every 250 ms and never reset
(a reset drops the stall its timer is still timing), and records each
stall of at least 500 ms as a `stall` entry: the measured `delayMs`, the
machine's `loadAverage` (1, 5, 15 minutes), and, like every entry, the
revision and process age; its `at` is when the stall began, so it aligns with
a proxy error logged in the same second. Within each minute the first three
stalls are written as read and the rest are folded into one entry (longest
delay, `stalls` count, the first folded stall's `at`) written when the
minute ends or the process closes, so a sustained stall
cannot push failed reads out of the record.

The diagnostics response keeps `failures`, this server instance's entries
oldest first, and adds `record`: the source's recorded failures and every
recorded stall across processes, this process's included, newest first; the
server instances that wrote it, newest first, each with its `state`
(`current`, `running` for another whose pid still answers, `ended`, or `lost`
for one whose record ends without `process-ended` and that no longer runs,
with `lastAt`, its last entry); and the record's `startedAt` and `dropped`.
Recording and reading it ask GitHub nothing.

An actual subprocess output bound is reported as `output-bound`; its partial
body is discarded, while known upstream status/headers and directed-rate-limit
precedence remain. It supplies no retry or login advice, and diagnostics invent
no upstream status or rate evidence.

The installed [CI diagnostic](../src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs)
retains failed steps and every readable log excerpt when another log is missing.
It scans every failed job's whole log for failure lines in known formats and
reports an `inventory` whose `gaps` name unfinished jobs, missing logs, omitted
lines, or jobs without a recognized failing test or check; excerpts stay bounded
to the first ten jobs.
A held job carries numeric `logWaitSeconds` alongside `logUnavailable`; any held
log makes the command exit 75. Expired HTTP 404/410 logs, output bounds and other
failed requests supply no delay. Other partial diagnostics exit 0; jobs-acquisition
failure exits 1, or 75 when held. Agents classify from available evidence, retain
uncertainty when insufficient, and retry only after numeric directed waits end,
following the shared [CI repair guidance](../src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification).
