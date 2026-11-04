# Source review: SEED-232#see-published-changes-over-sse

**Launch:** Fresh general-purpose agent, 2026-11-04, no conversation
inheritance; supplied only the story Goal, Scope, key examples, evaluation
basis, deferred promises and scope limits from
`.planning/seeds/SEED-232-reduce-dashboard-refresh-traffic.md#see-published-changes-over-sse`.
No plan, product, proof or current-slice scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer watching the Board sees newly published work as soon as the dashboard process observes it (esp. Tailscale); freshness, credential isolation, rate-limit handling and failure behavior stay; a dropped stream loses freshness visibly and catches up | slice 6 | |
| 2 | While a visible page holds an SSE stream, the page sends no recurring revision-check requests; stream costs fewer bytes than those checks | slice 4 | observed: revision-stream.spec.ts quiet minute: checksAskedWhilePassing 0; no since |
| 3 | Dashboard checks origin at the same 15s pace for each project with an open page stream, and tells every streaming page of that project the answer for that page's own revision and watched branches | slice 4 | observed: revision-stream.spec.ts matching-refs continue over quiet minute; shared listing on publication |
| 4.1 | Visible settled page holds one SSE stream for its project | slice 4 | observed: revisionStreamSchedule.ts EventSource while delivery stream; revision-stream.spec.ts |
| 4.2 | Visible settled page holds one SSE stream for its shown revision | slice 4 | observed: revisionStreamUrl(shownRevision); reopen at R after publication journey |
| 4.3 | Visible settled page holds one SSE stream for its watched story branches; then asks no recurring revision check | slice 4 | observed: watchedHeads into stream URL watch=; branch move journey reads only that entry |
| 5 | First message on every open and reopen is the current answer for that revision and those branches (catch-up without replaying events) | slice 4 | observed: first EventSource message via revisionCheckFromStreamData; catch-up without Last-Event-ID |
| 6 | Dashboard observes origin at 15s pace per project and request-owner scope that has at least one open stream | slice 2 | observed: dashboard/server/sourceRevisionStream.ts SourceRevisionStream + authenticated-read-revision-stream.spec.ts one matching-refs per tick |
| 6.1 | Observation asks GitHub at most as often as one page's checks do today | slice 2 | observed: authenticated-read-revision-stream.spec.ts matchingRefsSince === 1 at open and next pace |
| 6.2 | Observation stops when the last stream for that project and scope closes | slice 2 | observed: authenticated-read-revision-stream.spec.ts after last close matchingRefsSince === 0; closing boundary stops observation |
| 7 | When observation settles, every open stream for that project and scope gets its own answer from the same branch-head listing, in today's revision-check shape | slice 2 | observed: authenticated-read-revision-stream.spec.ts two streams different at/watch; each own answer from one listing via performRevisionCheck |
| 7a | Changed ref leads the page to read exactly the new revision | slice 4 | observed: two pages publication journey reads R with one backlog |
| 7b | Moved watched branch leads the page to read only that entry's plan and last commit time | slice 4 | observed: watched branch move journey: only that plan and commit time |
| 7c | Any other branch moving sends that page nothing that leads to a read | slice 4 | observed: other streaming page reads nothing further on branch move |
| 8 | While stream revision or watched branches differ from origin, each pace repeats that answer; failed new-revision read retries at the pace | slice 4 | observed: stream pace repeats while revision differs; schedule keeps EventSource until reading |
| 9.1 | Page holds no stream when it hides | slice 4 | observed: hiding closes stream; listings stop journey |
| 9.2 | Page holds no stream when it switches project | slice 4 | observed: revisionCheckSchedule/stream effect ends on project change via publishedObservation deps |
| 9.3 | Page holds no stream when it starts a new read | slice 4 | observed: readSettled false closes stream effect before new read |
| 9.4 | Page holds no stream while waiting out GitHub's rate limit; opens again when the condition ends; first message serves as today's check of a page seen again | slice 5 | observed: revision-stream-lost.spec.ts rate-limited: notice, close, wait until T, reopen |
| 10 | After a read changes revision or watched branches, the page reopens its stream with them | slice 4 | observed: after reading publication reopens stream at new revision journey |
| 11 | A healthy stream carries the page's current answer once per pace | slice 2 | observed: authenticated-read-revision-stream.spec.ts first at open then nextEvent at pace; revisionStreamPaceMs |
| 12.1 | Failed/closed/silent stream (longer than pace + 30s wait): snapshot stays with revision and retrieval time | slice 5 | observed: revision-stream-lost.spec.ts SIGSTOP: snapshot R kept with retrieval time |
| 12.2 | Existing problem wording says freshness was lost | slice 5 | observed: revision-stream-lost.spec.ts problem contains freshness was lost |
| 12.3 | Page reopens no more often than the pace | slice 5 | observed: revision-stream-lost.spec.ts reopen gaps >= checkIntervalMs |
| 12.4 | First answer after a reopen clears the problem | slice 5 | observed: revision-stream-lost.spec.ts replaced server: problem clears after R |
| 13 | Failed branch-head listing yields answer naming the ref alone, never removal of a watched branch | slice 5 | observed: revision-stream-lost.spec.ts 504 listing leaves watched branch shown |
| 14 | Failed checks, rate limits and unanswered checks reach the page as today's check answers do; rate-limited answer starts existing limit record and notice | slice 5 | observed: stream answers use revisionCheckFromStreamData / reactToRevisionCheckFailure |
| 15 | Streams never use up the browser's connections to the dashboard | slice 4 | observed: seven-page journey: two stream five check; connections remain usable |
| 16.1 | Non-multiplexing route: at most two pages of one browser hold a stream at once | slice 4 | observed: revisionStreamSlotCap http/1.1=2; seven-page journey two stream |
| 16.2 | Visible page without a stream keeps today's recurring check | slice 4 | observed: pages without slot keep check; seven-page five check at pace |
| 16.3 | It takes a stream when a holder hides or closes | slice 4 | observed: hiding holder lets checking page stream journey |
| 17 | Multiplexing route (e.g. Tailscale HTTPS): every visible page streams | slice 4 | observed: revisionStreamSlotCap h2/h3 uncapped; unit test revision-stream-slot.test.mjs |
| 18 | Required restriction: stream cap on a non-multiplexing route (HTTP/1.1 six-connection observation) | slice 4 | observed: required cap on non-multiplexing; seven-page + slot lock names |
| 19a | No change to what a page shows | slice 6 | |
| 19b | No change to how it reads content at a revision | slice 6 | |
| 19c | No change to the 15-second pace | slice 6 | |
| 19d | No change to reload's fresh resolution of the ref | slice 6 | |
| 19e | No change to the request owner's protocol | slice 6 | |
| 20 | No new daemon, database or scheduler outside the dashboard process | slice 6 | |
| E1 | Quiet over Tailscale: no revision-check request; fewer stream bytes than four checks; no problem | slice 6 | |
| E2 | Publication arrives: two pages told R' from same listing within one pace; each reads R' | slice 4 | observed: two streaming pages publication from one listing one backlog |
| E3 | Each page its own answer; 504 listing leaves watched branch shown | slice 5 | observed: 504 over stream leaves branch; branch-move journey from slice 4 |
| E4 | Dropped across a change: lost freshness within 45s with R kept; reopen catches up to R' | slice 5 | observed: SIGSTOP then replace across R: lost within 45s, catch up to R |
| E5 | Hidden: last stream closing ends listings; reveal answers at once | slice 4 | observed: hiding closes stream listings stop; reveal answers at once |
| E6 | Seven local windows: two stream, five check; hide holder lets checker stream | slice 4 | observed: seven pages two stream five check; hide holder transfers stream |
| E7 | Rate limit: notice, close stream, wait until T, reopen | slice 5 | observed: rate-limited stream journey |
| M1 | Baseline: four revision-check requests a minute plus response bytes | slice 6 | |
| M2 | Target: healthy stream sends no revision-check request in a quiet minute | slice 6 | |
| M3 | Stream bytes (incl. setup) stay below baseline four-check bytes | slice 6 | |
| M4 | Publication-to-display no later than today for any streaming page | slice 6 | |
| M5 | Count requests and bytes; measure publication-to-display | slice 6 | |
| M6 | Measure in loopback harness and once through Tailscale after production deploy | slice 6 | |
| M7 | Disclose host status and agent-launch reads still recur every 15s | slice 6 | |
| D1 | Deferred: one shared stream per browser | | G1 |
| D2 | Deferred: WebSocket delivery | | G2 |
| D3 | Deferred: host status, agent launches or local sessions on the stream | | G3 |
| D4 | Deferred: faster pace, publication-event check, or webhooks | | G4 |
| D5 | Deferred: sharing observations across separately launched dashboard processes | | G5 |
