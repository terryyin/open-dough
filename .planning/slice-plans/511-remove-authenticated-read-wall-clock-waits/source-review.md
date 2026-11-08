# Source review

Fresh-context general-purpose reviewer `/root/source_review` received only the
[canonical story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#remove-authenticated-read-wall-clock-waits)'s
Goal, Scope, Key examples and Evaluation from the established start. The launch
asked for individual commitments and exclusions without files, plan, proof,
edits, or slice ownership. There were no human amendments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers running the authenticated-read backend specs get reliable feedback. | slice 3 |  |
| 2 | When a relevant event occurs, feedback is available as soon as it occurs. | slice 3 |  |
| 3 | When developers advance the test clock to the relevant point, feedback is available as soon as they advance it. | slice 3 |  |
| 4 | The shutdown checks distinguish correct shutdown from extra GitHub requests. | slice 1 | observed: revision stream spec, two-stream counts before/after each pace and both shutdown zero-firing checks |
| 5 | The shutdown checks distinguish correct shutdown from missing GitHub requests. | slice 1 | observed: revision stream spec, two-stream opening and next-pace matching-refs counts and both SSE answers before shutdown |
| 6 | The listing recovery checks distinguish correct recovery from extra GitHub requests. | slice 2 |  |
| 7 | The listing recovery checks distinguish correct recovery from missing GitHub requests. | slice 2 |  |
| 8 | Replace the fixed shutdown waits in the revision stream spec. | slice 1 | observed: revision stream spec, last-disconnect and boundary-close journeys await observable events then advance the fixture clock |
| 9 | Replace the listing-settlement waits in the shared listing failures spec. | slice 2 |  |
| 10 | Replace the cooldown waits in the shared listing failures spec. | slice 3 |  |
| 11 | Keep the real HTTP boundary. | slice 3 |  |
| 12 | Keep the synthetic GitHub request counts. | slice 3 |  |
| 13 | Observe completion where each operation is owned. | slice 3 |  |
| 14 | Control the time used to prove cadence. | slice 1 | observed: revision stream spec, two-stream journey advances to one millisecond before pace then advances the final millisecond |
| 15 | Control the time used to prove cooldown. | slice 3 |  |
| 16 | The revision stream spec is in scope. | slice 1 | observed: revision stream spec diff and the seven selected stream tests in the strict affected run |
| 17 | The shared listing failures spec is in scope. | slice 3 |  |
| 18 | Fixture changes are in scope where needed to support those two specs. | slice 3 |  |
| 19 | The broader polling story is outside this scope. | slice 3 |  |
| 20 | A released GitHub request owner clock seam is outside this scope. | slice 3 |  |
| 21 | Two streams open for the same source. | slice 1 | observed: revision stream spec, two openStream calls use the same default source and real HTTP listener |
| 22 | The streams open at different revisions. | slice 1 | observed: revision stream spec, two openStream calls supply revisionA and revisionB |
| 23 | The streams have different watches. | slice 1 | observed: revision stream spec, two openStream calls watch story/one and story/two, from the warmed MakeMe profile fixtures |
| 24 | Both streams share one opening listing. | slice 1 | observed: revision stream spec, await both headers and held opening listing, then assert exactly one matching-refs before releasing |
| 25 | The first stream receives its respective answer. | slice 1 | observed: revision stream spec, watching.nextEvent equals watchingAnswer |
| 26 | The second stream receives its respective answer. | slice 1 | observed: revision stream spec, moved.nextEvent equals movedAnswer |
| 27 | Advancing to the next pace causes exactly one fresh listing shared by both streams. | slice 1 | observed: revision stream spec, after the final millisecond exactly one fresh matching-refs is held and its release supplies both next events |
| 28 | After the server processes the last disconnect, advancing across further paces causes no new listing. | slice 1 | observed: revision stream spec, await each server disconnect; first retains and last cancels the armed timer; three further paces fire none and total matching-refs remains two |
| 29 | The stream has received its first answer. | slice 1 | observed: revision stream spec, close journey awaits the first event with revisionA and counts one matching-refs |
| 30 | The stream has another pace scheduled. | slice 1 | observed: revision stream spec, close journey waits for an armed pace and asserts one pending |
| 31 | Closing the authenticated-read boundary ends the stream’s HTTP response. | slice 1 | observed: revision stream spec, real closeBoundary hook followed by stream.ended kind ended and one event |
| 32 | The HTTP server can still answer when the stream’s response ends. | slice 1 | observed: revision stream spec, independent raw HTTP request returns 404 from the still-live listener after SSE end |
| 33 | After the boundary closes, advancing across further paces causes no new listing. | slice 1 | observed: revision stream spec, after close there are zero pending timers, three further paces fire none, and the listing count remains one |
| 34 | The GitHub listing is still unanswered when the HTTP check times out. | slice 2 |  |
| 35 | After the listing itself times out, a later check succeeds. | slice 2 |  |
| 36 | That later check makes exactly one fresh listing request. | slice 2 |  |
| 37 | A 504 still falls back to the ref. | slice 2 |  |
| 38 | A 504 leaves the next check eligible to request a fresh listing. | slice 2 |  |
| 39 | GitHub answers the listing with a 429. | slice 3 |  |
| 40 | The 429 carries a directed wait. | slice 3 |  |
| 41 | During the wait, another check on the same server is held back. | slice 3 |  |
| 42 | That held-back check makes no GitHub request. | slice 3 |  |
| 43 | Advancing the private owner’s clock past the cooldown allows the next check to succeed. | slice 3 |  |
| 44 | That next check makes exactly one fresh listing request. | slice 3 |  |
| 45 | The revision stream spec passes through the normal dashboard backend entry point. | slice 1 | observed: Slice 1 accepted proof, strict affected selection through npm run test:dashboard |
| 46 | The shared listing failures spec passes through the normal dashboard backend entry point. | slice 3 |  |
| 47 | The revision stream spec’s other existing assertions still pass. | slice 1 | observed: Slice 1 accepted proof, original stream header, admission, 504, 429 and production preview gzip assertions passed |
| 48 | The shared listing failures spec’s other existing assertions still pass. | slice 3 |  |
| 49 | The before-and-after comparison uses the same two-spec selection. | slice 3 |  |
| 50 | The comparison records elapsed time. | slice 3 |  |
| 51 | The comparison records executed cases. | slice 3 |  |
| 52 | The comparison records the waits removed. | slice 3 |  |
| 53 | Request counts are preserved. | slice 3 |  |
| 54 | Verdicts are preserved. | slice 3 |  |
| 55 | Shutdown uses no elapsed-time sleeps. | slice 1 | observed: revision stream spec, both shutdown journeys use explicit response/disconnect signals and controlled advance |
| 56 | Timeout settlement uses no elapsed-time sleeps. | slice 2 |  |
| 57 | Cooldown uses no elapsed-time sleeps. | slice 3 |  |
| 58 | The work follows `AGENTS.md#test-automation`. | slice 3 |  |
| 59 | The work follows `AGENTS.md#failing-and-flaky-tests`. | slice 3 |  |
