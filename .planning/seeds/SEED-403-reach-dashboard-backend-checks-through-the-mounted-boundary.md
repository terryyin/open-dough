---
id: SEED-403
status: active
planted: 2026-11-18
planted_during: Terry set the dashboard backend entry at the mounted boundary and asked to queue the migration as one story
trigger_when: selected from the backlog
scope: one story
---

# SEED-403 — Dashboard backend checks reach the mounted boundary

<a id="reach-dashboard-backend-checks-through-the-mounted-boundary"></a>

### Reach dashboard backend checks through the mounted boundary

**Identity:** SEED-403#reach-dashboard-backend-checks-through-the-mounted-boundary
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer changing a dashboard server rule, or waiting for
Dashboard Backend Test, gets the same answer the boundary gives — status,
body, and whether a host was asked — from that boundary installed in the
test process. Request-and-answer cases stop paying for a child process and
the Cursor runner that process starts. Cases whose proof is a separate
process, a live connection, or the server program still start the live
server. A lower function remains only where a boundary case already covers
admission and that function's result is the whole new fact.

The rule is
[which entry a case uses](../../dashboard/backend-tests/README.md#which-entry-a-case-uses).
Judge the gain against the cost of the move under
[ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md):
the same proof, with less time spent starting servers, and the three live-server
proofs kept.

**Scope:**

- Move a Dashboard Backend Test case that asserts a request's status, body,
  files written under the case's machine, or whether a host was asked onto
  the exported install of that boundary, mounted in the test process.
- Leave a case on `startDashboardServer` when its proof is a separate
  process (environment, preload, pid, signal, process group, or a child
  that did or did not start, including a restart that must be a new
  process), a connection the handler does not own (a WebSocket upgrade, a
  stream held open on the socket, or the server closing while that
  connection is up), or the server program (dev, preview, and the boundary
  server mounting the same boundaries, or how that process reports its
  address and closes).
- Leave a lower function in place when a boundary case already covers the
  admission once and that function's result is the whole fact the case
  adds. A status, a body, or "the host was not asked" stays on the boundary.
- Keep each case's product assertion. A browser workflow stays in E2E Test.
  A presentation case stays in Dashboard Frontend Test.
- This is one story until refinement. Refinement may split it. The split
  still follows the entry rule above, and a later story dropped leaves the
  cases already moved on the mounted boundary.

#### Starting evidence

On 2026-11-18 this worktree had about 180 `startDashboardServer` call
expressions under `dashboard/backend-tests/`. Five sequential boundary
starts on this machine, with the shared bundle already built and the
compile cache disabled, took a median 823 ms to start and 113 ms to close.
The same start with the Cursor stand-in took a median 449 ms. The parent
fixture work before the child process was about 10 ms. Authenticated read
already has an in-process mount
(`dashboard/tests/support/inProcessAuthenticatedRead.ts`). The Java intent
read (`dashboard/backend-tests/intent/authenticated-read-intent-java.spec.ts`)
is a request-and-answer case. `fake-gh-in-process-modes.spec.ts`,
`agent-terminal-boundary.spec.ts`, and `serving-modes.spec.ts` are the
three kinds of proof that stay on the live server.

**Key examples:**

- A Java intent read asks which `.java` files a location admits → the
  authenticated-read boundary is installed in the test process → the
  listing, the admitted file text, the 404 for a refused path, the 400 for
  `..`, and the absence of a contents fetch for a refused path match the
  boundary's answer.
- A project-list case asks what the configuration boundary returns → that
  boundary is installed in the test process → the project ids, a foreign
  origin's 403, POST's 405, and `Cache-Control: no-store` match.
- A case watches a server process's preload, pid, or a WebSocket upgrade,
  or compares dev, preview, and the boundary server → it still starts the
  live server → those process and connection facts remain observable.
- A path-selection helper answers whether a path matches a declared
  location → a boundary case already covers admission of that path → the
  helper test adds only that match result.
