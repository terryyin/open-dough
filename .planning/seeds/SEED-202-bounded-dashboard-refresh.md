---
id: SEED-202
status: active
planted: 2026-10-31
planted_during: Terry's dashboard memory investigation and request to prioritize shared request management
trigger_when: Several browsers keep the dashboard open and refresh the same projects or sessions
scope: one story for bounded shared dashboard refresh work
---

# SEED-202: Keep dashboard refresh work bounded across viewers

## Why This Matters

A developer should be able to leave the dashboard open on several browsers or
devices without multiplying expensive observations, exhausting GitHub request
allowances, or causing memory to grow with repeated refreshes. Terry asked to
start with sharing session observations across browsers and reusing parsed
launch records, and to treat this as a general improvement to request
management, especially GitHub requests. Queue this story first.

## Selected Stories

<a id="bounded-dashboard-refresh"></a>

### Keep dashboard refresh work bounded across viewers

**Identity:** SEED-202#bounded-dashboard-refresh
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** Developers viewing the same dashboard from several browsers
or devices, and developers whose dashboard shares this machine's GitHub
request allowance with other Open Dough work.

**Goal:** Serve additional viewers from bounded shared observations and reusable
parsed records, keeping expensive refresh work, retained shared data, and
pending upstream requests within explicit budgets as viewer count increases,
while preserving useful freshness and correct project and session state.

**Scope:**

- Share eligible session observations across browser requests and existing
  background observers instead of independently reading the same native hosts,
  launch records, and local worktree evidence for each viewer. Begin with the
  machine-session refresh and Running Cursor sessions paths.
- Reuse the parsed and validated launch-record document while its underlying
  file is unchanged. Observe atomic replacements and writes from other
  dashboard processes or workflow commands promptly; preserve unreadable-file
  handling and retention semantics.
- Give refresh demand a bounded owner: share matching outstanding work, bound
  active and pending work and retained bytes, and prevent overlapping page
  polls or abandoned requests from leaving unnecessary work running. A hidden
  or departed viewer releases its demand without cancelling another viewer's
  read or an existing background observer's demand.
- Apply that discipline to GitHub-backed refreshes through the existing shared
  GitHub request owner. Preserve sharing across dashboard processes and other
  Open Dough consumers under the same API host and login, directed rate-limit
  waits, timeouts, and account isolation. Identify remaining duplicated work
  before extending that existing solution; do not add a competing request
  manager or bypass its admission rules.
- Keep observations isolated by their real source, host, query, revision, and
  authentication scope as applicable. Define explicit freshness, invalidation,
  and overload behavior so sharing cannot silently return stale or unrelated
  facts, or turn missing evidence into confirmed absence.

**Resource interpretation:** For a fixed set of projects, sessions, and source
data, extra viewers must not create separate retained observation datasets or
unlimited upstream work. Shared memory and request rates have enforceable
budgets independent of viewer count. Individual connections and responses still
cost memory; bound their active and pending work and give excess demand a
bounded wait or an explicit retryable answer. Byte-for-byte constant total
process memory for arbitrarily many simultaneous connections is not the claim.

**Key examples to establish during refinement:**

1. One viewer and several concurrent viewers request the same unchanged session
   state. They receive equivalent current facts from shared observations and
   parsed records; expensive observation and parse counts do not multiply by
   viewer count. Include demand from the existing notification observer.
2. Another process atomically replaces the launch-record file. Every viewer
   sees the new valid state within the agreed freshness window, and reuse does
   not hide a corrupt or unreadable replacement.
3. Several browsers ask for the same GitHub revision or record while its read
   is outstanding. One eligible upstream operation serves them; a rate limit
   applies coherently. Different projects, revisions, or logins retain their
   own correct answers and permissions.
4. A host or GitHub responds slowly while viewers refresh, hide, disconnect,
   or exceed request capacity. Concurrency, pending demand, and retained bytes
   stay within declared limits; one departing viewer leaves other demand
   intact, and ordinary reads recover when capacity returns.
5. With the same data and terminal activity, repeated refresh cycles at one,
   three, and a larger bounded number of viewers show memory settling rather
   than sustained retained growth. Compare upstream calls, parse counts, peak
   and settled memory, and user-visible freshness against the stated baseline.

**Evidence and starting points:** The 2026-10-31 inspection at `ee5badf2`
found that expanded Running Cursor sessions waits only 50 ms after each
response, and each successful runner read then rereads the complete launch
document. The machine's document was approximately 5.4 MB with 1,107 session
records. An isolated probe of the real store reader observed roughly 108 MiB
peak JavaScript heap with sequential reads and 287 MiB with three concurrent
reads; both settled around 15 MiB after garbage collection. This establishes
temporary allocation pressure, not the earlier shutdown's cause or a complete
browser/server load result. Re-establish the baseline before implementation.

Relevant sources are [Running Cursor sessions](../../dashboard/src/RunningCursorSessions.tsx),
[held-session joins](../../dashboard/server/hosts/cursor/heldSessions.ts),
[machine document reads](../../dashboard/server/machineJsonStore.ts),
[machine-session observations](../../dashboard/server/agentLaunches.ts),
[session refresh responses](../../dashboard/server/launchBoundaryAnswer.ts),
and the [shared GitHub requester](../../src/skills/dough-execute-plan/scripts/github-requests.mjs).
The main project revision poll already waits for reads and pauses while hidden;
matching GitHub calls already share outstanding work. Preserve those protections.

**Constraints and next decisions:** Follow [ADR 0008 — Project dashboard domain
and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
caches and observations remain disposable derived state; published Git and
machine-local evidence keep their existing authority and authentication
boundaries. Apply [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
by comparing equivalent useful freshness and correctness at lower justified
resource cost. Refinement must choose measurable freshness windows, resource
budgets, the admission behavior at capacity, and proportionate proof before
execution planning. Terminal-stream flow control and unrelated browser-history
retention are separate concerns; this story does not promise to resolve every
dashboard memory source.
