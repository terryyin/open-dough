# Reduce remote Sessions traffic

**Identity:** SEED-229#reduce-remote-sessions-traffic

**Source:** [Selected story](../../seeds/SEED-229-reduce-remote-sessions-traffic.md#reduce-remote-sessions-traffic)
**Source review:** [source-review.md](source-review.md)

**Prepared:** 2026-11-04 in `codex/reduce-remote-sessions-traffic` at
baseline `83af9a833`.

## Outcome and direction

On a limited connection a developer can load Sessions, see changed attention
states, and open retained details using substantially less traffic. The story
defines the byte targets, existing refresh pace, and retained-history examples.
Portraits, terminal traffic, other HTTP endpoints, hosting changes and
partial-update protocols are outside this plan.

The [North Star](../../../docs/dashboard-ux-ui-north-star.md#meaning-and-terminology)
keeps Sessions, attention, and retained history available in the existing
Development workflow. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps machine evidence separate from published story facts. The backlog's
Purpose and Proof direction guides the rest of the queue. This improvement
removes a measured cost of using the dashboard and compares the gain with
the work it adds, as required by
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Existing solution and design

- Completed SEED-225 already split the overview from retained history,
  carries revision tokens, and reuses a shared observation. Keep that
  responsibility in `machineSessionObservation.ts` and
  `machineSessionsFragments.ts`. Compare with the current split rather
  than attributing its savings to compression.
- `launchBoundaryAnswer.ts` identifies admitted Sessions reads and
  `agentLaunchResponse.ts` owns their HTTP representation. Vite dev,
  production preview, and the boundary server mount this same middleware.
  Vite's static asset compression does not cover these already answered
  requests. Use the existing response owner for transport encoding.
- Negotiate gzip for large, successful full Sessions overview and history
  replies when the client accepts it. Use asynchronous Node compression.
  Send the correct `Content-Encoding` and vary negotiated replies by
  `Accept-Encoding`. Support requests without gzip, including
  `gzip;q=0`, with the existing JSON representation. Preserve
  `Cache-Control: no-store`, admission, and the existing JSON and revision
  semantics. Keep unchanged replies small and uncompressed. Follow
  [HTTP Semantics §12.5.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.3)
  for explicit coding preferences.
- Encode each full answer at most once per revision and share the encoded
  bytes between viewers, as the serialized answer is already shared. On
  2026-11-04, level-6 gzip of the projected 2.31 MB overview took about
  60 ms of CPU at a load average of about 16. Every changed revision repeats
  that work, so per-request encoding would add it for each open page.

## Baseline and decisive premises

- The earlier Tailscale trace establishes the user impact on production
  revision `4b5c31481`. The 2.3 MB identity and 0.50 MB gzip figures
  are an offline projection from the same records, not deployed results.
- On 2026-11-04 the local production dashboard, which still served the
  pre-split 9.88 MB answer, compressed to 1.58 MB with level-6 gzip. Its
  records, given the overview's listing projection, compressed from
  2.31 MB to 0.50 MB, a 78% reduction. During a 4-minute window with active
  sessions, 14 polls returned full answers. Five of these changed attempts
  but no records. No poll returned a full answer during the next 3 minutes.
- At `83af9a833` in this preparation checkout, the existing Sessions
  replay passed on Node 24.21.0. Its boundary served 1,005 records and 1,034
  attempts at fixture scale. The identity overview was 2.03 MB, history
  9.88 MB, and an unchanged overview 96 bytes. One changed native state
  advanced the revision and changed one record.
- In the same checkout, all five tests in the three browser journeys below
  passed against the built production preview. They reached the existing
  one-poll attention change, retained history demand and retry, and the
  retained Done listing. The new boundary proof must distinguish compressed
  from identity replies and fail on the current responder.
- The replay's trivial-request p99 was 119 ms during polls and 12 ms when
  idle, with a 1-minute load average of 43.17. This high-load sample verifies
  the measurement path. Compare paired runs at similar load before drawing
  a latency conclusion. Report raw encoded bytes and compare decoded JSON,
  including `revision` and `historyRevision`, on the same observation.

## Ordered slices

### 1. Transfer full Sessions replies using fewer bytes

Type: Behavior
Status: done

Behavior: a gzip-capable browser loads a dashboard with a large retained
history, sees an attention update, or opens retained detail → the admitted
full reply meets the story's byte targets and decodes to the same observation.
An identity caller sees the same JSON. A poll holding an unchanged revision
still gets the small answer, and history still loads on demand and can be
retried after a failure. Admission refusals and unrelated launch replies
keep their response behavior.

Proof owned by this slice:

- Exercise the running boundary with the existing raw HTTP support. Check
  gzip and identity for both audiences, including absent encoding and
  explicit gzip refusal. Compare raw body sizes and decoded JSON for the
  same observation. Check no-store, negotiated response headers, unchanged
  replies, and a same-origin refusal for a disallowed origin. Read the raw
  bytes before decoding rather than measuring a browser's decompressed body.
- Extend the existing opt-in
  [Sessions replay](../../../dashboard/AGENT-LAUNCH-OBSERVATION.md#measuring-the-sessions-answer)
  to measure encoded bytes for the initial and changed overviews, unchanged
  polls, and full history. Show at least 70% reduction for each full reply
  and no more than 650,000 bytes for either full overview on the fixture.
  Compare the same workload before and after, including response times,
  event-loop delay, and the trivial request's latency under concurrent reads.
  Require the existing attention pace and investigate any repeatable
  concurrent-request slowdown beyond the baseline's run-to-run spread.
- Run the browser journeys `agent-launch-session-state-pace.spec.ts`,
  `agent-launch-retained-history.spec.ts`, and
  `agent-launch-done-listing.spec.ts`. Confirm the browser's normal fetch
  decodes the reply and retains attention, history demand and retry, and
  Done listing behavior. Use those journeys' existing isolated production
  preview fixture, which requires neither a private proxy nor real sessions.

Safe stop: either encoding works through the normal dashboard entry point.
The acceptance evidence includes the transport comparison and shows the
same session and history behavior. The product contract records how to
measure transferred bytes and how to interpret the comparison.

Local gates: run the focused boundary proof, opt-in replay, and browser
journeys above using the [native setup](../../../tests/native-setup.md).
Run `npm run typecheck:dashboard` and the selective formatter
`npm run --silent format` before publication. On macOS run the dashboard
checks on AC power with `caffeinate -s -i` as specified in
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Apply the project's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, including delegated work and repair handoffs through applicable
final CI.

Accepted proof (2026-11-04, Node 24.21.0, `caffeinate -s -i`):

- Boundary: `dashboard/tests/boundary/agent-launch-sessions-encoding.spec.ts`
  5/5 against the running boundary over raw HTTP. Gzip-accepting fields
  (including `x-gzip` and `*;q=0.1`) get `Content-Encoding: gzip`, and
  `gunzip(raw)` equals the identity JSON with the same revision. Absent
  encoding, `gzip;q=0`, `identity`, `br, deflate`, `*;q=0` and an invalid
  `gzip;q=2` get the identity JSON. Full replies carry
  `Vary: Accept-Encoding` and no-store. Unchanged replies and the cross-site
  403 stay unencoded. The two full-answer tests fail at `e69e74cf7`.
- Browser journeys: the session-state-pace, retained-history and done-listing
  specs pass 5/5. The retained-history step "expanding Recently done sessions
  reads it once, gzip-encoded" observes the browser's `Content-Encoding: gzip`.
  It fails at `e69e74cf7`.
- Replay (`DOUGH_SESSIONS_REPLAY=1`, 1,005 records, 1,034 attempts):
  - First and changed overviews: 322.3 kB gzip of 2.03 MB, 84% fewer.
  - Full history: 1,251 kB of 9.88 MB, 87% fewer.
  - Unchanged polls: still 96 B.
  - At similar load (about 4–9) across 5 paired runs, trivial-request p99
    and event-loop time are unchanged under 4 concurrent viewers. The first
    viewer of a changed revision waits for its single encoding, about
    +20 ms for the overview and +40–100 ms for the history, off the event
    loop. That wait buys about 1.4 s saved per changed overview at
    10 Mbit/s (ADR 0010).
- Whole `dashboard/tests/boundary` directory: 957 passed.
  `npm run typecheck:dashboard` exits 0.

Full-suite repairs (2026-11-04, load 30–70 from external work): the full
dashboard suite and `npm test` each failed in tests this slice does not
touch. Each failure repeated on `e69e74cf7` and was repaired as a test
environment defect, without weakening its assertions:

- `authenticated-read-incident-record-bounds.spec.ts`: the settle count
  also held between the last append and its prune. A scratch run of the
  product's own append reproduced this deterministically. The poll now
  also waits for the byte bound. It passed 60 runs under extra CPU load.
- `story-reference-navigation.spec.ts` and six sibling start specs: a
  real Take publication took 9–14 s before the host launched, against a
  5 s poll. These polls now use the shared `launchWaitMs`, the server's
  own 30 s bound. They passed at load 50–80.
- `session-terminal-voice-lifecycle.spec.ts` Mark as done: the rename's
  5 s idle wait raced the 5 s expectation. The done path never reads
  Sessions. That test now shortens the rename wait as sibling specs
  already do. It passed 10 of 10, while the base failed 5 of 10.
- `tests/native-setup.sh`: a 250 ms wall deadline expired before launch
  under load. The deadlines are now 2 s, against fixtures that stall for
  30 s.

Learnings:

- Every full answer is negotiated. A minimum-size threshold added a special
  case for no gain on the fixture's small history.
- Serialized answers now set `Content-Length`. Without it Node sends the
  body chunked.

## Concern evidence

Slice-plan refinement was not needed. The shared response path and both
audiences deliver one user outcome with one proof owner and one safe stop.
