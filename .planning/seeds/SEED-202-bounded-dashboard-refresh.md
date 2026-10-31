---
id: SEED-202
status: active
planted: 2026-10-31
planted_during: Terry's dashboard memory investigation and request to prioritize shared request management
trigger_when: Several browsers keep the dashboard open and refresh the same projects or sessions
scope: two stories for bounded shared dashboard refresh work
---

# SEED-202: Keep dashboard refresh work bounded across viewers

## Why This Matters

A developer should be able to leave the dashboard open on several browsers or
devices without multiplying expensive observations, exhausting GitHub request
allowances, or causing memory to grow with repeated refreshes. Terry asked to
start with sharing session observations across browsers and reusing parsed
launch records, and to treat this as a general improvement to request
management, especially GitHub requests. Queue this story first. Refinement
split the GitHub-backed sharing into its own story, queued right after.

## Selected Stories

<a id="bounded-dashboard-refresh"></a>

### Keep dashboard refresh work bounded across viewers

**Identity:** SEED-202#bounded-dashboard-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/426-bounded-dashboard-refresh/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7f095d3a917866880509a8f425c88ed22579f86f217ddb7bae7145cdf2907003","plan":"6aee284d2ed62df1fb2d9825f50c6ffb7db3ffee783c3a62fa7c1e47dd0245eb"}}
```

**Beneficiary:** Developers viewing the same dashboard from several browsers
or devices, and every viewer of a machine whose launch and attempt documents
have grown to several megabytes.

**Goal:** Serve every viewer's machine-session refresh, the Running Cursor
sessions list, and the notification observer from one bounded shared
observation and reusable parsed machine documents, so expensive observation,
parsing, and per-refresh answer bytes stop multiplying with viewer count and
refresh frequency, while session state stays as current and correct as today.

**Scope:**

- **Parsed-document reuse.** Reuse the parsed, validated launch-record and
  launch-attempt documents while each underlying file is unchanged. Re-check
  file identity on every read, so a replacement by another dashboard process
  is observed on the next read. A missing file still holds the empty document;
  an unreadable or schema-invalid replacement is still answered as unreadable
  and never hidden behind an earlier parse. Retention filtering still applies
  at read time. Writes keep their lock, authoritative read, and atomic
  replacement.
- **One shared machine-session observation.** Browser `/sessions` refreshes
  and the notification observer join one running observation. A result that
  settled at most **1 second** earlier serves later demand. Running Cursor
  sessions reads join one running held-session read, with no settled reuse,
  and keep the list's current live cadence.
- **Unchanged answers.** A `/sessions` answer carries the revision of the
  observation it reports. A viewer that sends the revision it already holds
  receives a small unchanged answer instead of the full records and attempts.
  A viewer with no revision, or an older one, receives the full answer.
- **Bounded admission.** At most one running observation exists per kind
  (machine sessions, Cursor held sessions). Retained shared data is one parsed
  copy per machine document plus the latest observation per kind. A waiter
  whose shared observation exceeds the existing read-wait bound receives an
  explicit retryable answer. A departing or hidden viewer stops waiting
  without cancelling the shared observation for other viewers or the
  notification observer, and the next demand after a bound or failure starts
  a fresh observation.
- **Isolation.** The shared observation depends only on machine-local
  evidence: the configured project catalog, the machine documents, and native
  host listings. A project catalog change starts a new observation instead of
  reusing one from the earlier catalog.

**Deferred promises:** Sharing GitHub-backed revision checks across viewers
moves to [Share GitHub revision checks across viewers](#shared-github-revision-checks).
Story-specific session reads (`stateOf`, recorded lookups, launch
verification) may adopt the parsed-document reuse but get no shared-observation
promise here. Terminal-stream flow control, browser-side retention, and other
dashboard memory sources remain separate concerns.

**Resource interpretation:** For a fixed set of projects, sessions, and source
data, extra viewers must not create separate retained observation datasets or
unlimited observation work. Individual connections and full answers still cost
memory; this story bounds the shared work behind them and makes repeated
unchanged answers small. Byte-for-byte constant total process memory for
arbitrarily many simultaneous connections is not the claim.

**Key examples:**

1. *Concurrent viewers share one observation.* Eight viewers and the
   notification observer request machine sessions at the same moment against
   unchanged documents → each receives the same records and attempts; the
   launch and attempt documents are parsed at most once each, and native host
   listings run once, not once per viewer.
2. *Out-of-phase viewers within the freshness window.* Viewer A's refresh
   settles; viewer B asks 400 ms later → B receives A's observation without a
   new one. Viewer C asks 1.5 s after it settled → a fresh observation runs.
3. *Unchanged repeated refresh.* A viewer holds revision *r*; nothing changed
   by its next 15-second refresh → it receives an unchanged answer of a few
   hundred bytes instead of about 9 MB. If a session's state changed, the
   observation's revision differs → it receives the full answer.
4. *Another process replaces a document.* A second dashboard process records a
   launch, atomically replacing the launch-record file → this process's next
   read, at most 1 second plus one observation later, includes the new record.
   A replacement that is not valid JSON or fails the schema → the read answers
   unreadable exactly as today, not the previously parsed document.
5. *Slow observation and departing viewers.* A native host listing stalls past
   the read-wait bound while three viewers wait and one closes its tab → the
   closed viewer's wait ends with no effect on the others; the remaining
   waiters get a retryable answer at the bound; no second observation starts
   while the first still runs; the next refresh after it settles succeeds.
6. *Running Cursor sessions open in several browsers.* Three expanded lists
   poll at their live cadence → overlapping asks share one runner read, and
   each read reuses the parsed launch-record document instead of parsing
   5.4 MB again.
7. *Memory settles.* Repeated refresh cycles at one, three, and eight
   concurrent viewers on this machine's documents show peak heap no higher
   than the one-viewer baseline plus answer serialization, settling back to
   the baseline, with parse and observation counts independent of viewer
   count.

**Baseline (2026-10-31, `a073c2cd`, machine load 22–27, real
`~/.open-dough/dashboard` documents through the real server modules):** The
launch-record document is 5.39 MB with 1,108 records, and the attempt
document is 5.23 MB with 1,090 attempts. One `/sessions` body reads the
launch-record document three times (`savedSessionServices.refresh`,
`machineSessions`, `creations`) and the attempt document once. Serialized, it
carries about 4.8 MB of records and 4.4 MB of attempts. Concurrent bodies
with production projects: ×1 607 ms / 79 MiB peak heap; ×3 1,789 ms /
159 MiB; ×8 6,398 ms / 532 MiB; each settled at about 19 MiB after GC. A held
Cursor-session read parses the launch-record document once: ×1 42 ms /
64 MiB; ×3 112 ms / 87 MiB; ×8 246 ms / 225 MiB. With a 50 ms gap, one
expanded list is about 10 such parses a second. Each visible page polls
`/sessions` every 15 s, and the notification observer polls every 15 s. Timings
are relative under load; the read counts and bytes are load-independent.
Re-measure the same probe on the final state.

**Evidence and starting points:**
[Running Cursor sessions](../../dashboard/src/RunningCursorSessions.tsx),
[the sessions page poll](../../dashboard/src/agentLaunches.ts),
[held-session joins](../../dashboard/server/hosts/cursor/heldSessions.ts),
[machine document reads](../../dashboard/server/machineJsonStore.ts),
[launch-record reads](../../dashboard/server/launchRecordStore.ts),
[attempt reads](../../dashboard/server/launchAttemptStore.ts),
[machine-session observations](../../dashboard/server/agentLaunches.ts),
[notification observer](../../dashboard/server/sessionAlerts.ts), and
[session refresh responses](../../dashboard/server/launchBoundaryAnswer.ts).
Only dashboard server modules write either document, and every write replaces
the file by rename, so file identity changes on each replacement.

**Architecture:** Parsed documents and shared observations are in-memory,
per-server derived state, disposable under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
they never become a store, and each read still consults the file so other
dashboard processes' writes remain authoritative. The machine document's
documented promise that every read sees every write is kept by an identity
check, not a fresh parse. The unchanged answer is a projection of one
observation, not a client cache contract beyond holding its last answer.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) applies:
the improvement is equivalent session state and freshness at lower measured
parse, observation, and byte cost.

<a id="shared-github-revision-checks"></a>

### Share GitHub revision checks across viewers

**Identity:** SEED-202#shared-github-revision-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Keep GitHub requests for published-revision checks bounded as more
browsers keep the same project visible, through the existing shared GitHub
request owner, so dashboard viewers do not multiply the requests this machine
spends under one API host and login.

**Scope to refine:**

- Each visible page currently asks for its project's revision check every
  15 seconds. Matching outstanding calls already share one `gh api` call, and
  the listing is conditional (`304 Not Modified`) per catalog source. Out-of-phase viewers
  each cost one listing. Measure calls per viewer first, then share a settled
  check across viewers within the poll interval if the count justifies it.
- Preserve sharing across dashboard processes and other Open Dough consumers,
  directed rate-limit waits, timeouts, and account isolation. Do not add a
  competing request manager or bypass the owner's admission.
- Keep checks isolated by repository, ref, and login, so different projects,
  revisions, or logins keep their own answers and permissions.

**Premise to observe:** Whether conditional `304` answers still spend a
meaningful share of this machine's request allowance or owner turns at three or
more viewers. If they do not, this story may be dropped.
