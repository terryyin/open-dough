# Source review

Fresh-context general-purpose reviewer `/root/source_review` received only the
[canonical story](../../seeds/SEED-262-faster-dashboard-test-feedback.md#remove-authenticated-read-wall-clock-waits)'s
Goal, Scope, Key examples and Evaluation from the established start. The launch
asked for individual commitments and exclusions without files, plan, proof,
edits, or slice ownership. There were no human amendments.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Developers running the authenticated-read backend specs get reliable feedback. | slice 3 | observed: final two-spec comparison passes 10/10 and changed lifecycle repeat proof passes with default timeouts |
| 2 | When a relevant event occurs, feedback is available as soon as it occurs. | slice 3 | observed: stream journeys wait for an armed pace, server disconnect and clean SSE end; timeout journey observes the real diagnostic and subprocess exit |
| 3 | When developers advance the test clock to the relevant point, feedback is available as soon as they advance it. | slice 3 | observed: two-stream test advances the last millisecond to one fresh listing for both; the cooldown test advances the same owner to one fresh listing |
| 4 | The shutdown checks distinguish correct shutdown from extra GitHub requests. | slice 1 | observed: revision stream spec, two-stream counts before/after each pace and both shutdown zero-firing checks |
| 5 | The shutdown checks distinguish correct shutdown from missing GitHub requests. | slice 1 | observed: revision stream spec, two-stream opening and next-pace matching-refs counts and both SSE answers before shutdown |
| 6 | The listing recovery checks distinguish correct recovery from extra GitHub requests. | slice 2 | observed: shared-listing failures spec, 504 and timeout recovery assertions each require exactly one matching-refs |
| 7 | The listing recovery checks distinguish correct recovery from missing GitHub requests. | slice 2 | observed: shared-listing failures spec, recovery status 200 and exact one matching-refs require a new listing |
| 8 | Replace the fixed shutdown waits in the revision stream spec. | slice 1 | observed: revision stream spec, last-disconnect and boundary-close journeys await observable events then advance the fixture clock |
| 9 | Replace the listing-settlement waits in the shared listing failures spec. | slice 2 | observed: shared-listing failures spec uses dispatch and separate controlled deadlines, real inspect diagnostics and captured subprocess exit in place of the settlement pause |
| 10 | Replace the cooldown waits in the shared listing failures spec. | slice 3 | observed: shared-listing failures spec replaces pause(1100) with the private owner clock and pre/post recovery requests |
| 11 | Keep the real HTTP boundary. | slice 3 | observed: revision-stream and shared-listing failures specs use real HTTP over bound listeners including live SSE and 502/200 responses |
| 12 | Keep the synthetic GitHub request counts. | slice 3 | observed: both specs assert matching-refs and upstream call counts at the opening, recovery, holdback and shutdown boundaries |
| 13 | Observe completion where each operation is owned. | slice 3 | observed: server stream disconnect and close signals, listing diagnostic and subprocess exit, and same request owner before/after cooldown |
| 14 | Control the time used to prove cadence. | slice 1 | observed: revision stream spec, two-stream journey advances to one millisecond before pace then advances the final millisecond |
| 15 | Control the time used to prove cooldown. | slice 3 | observed: listingReuseWithOwnerClock freezes the private owner's Date, then atomically advances 1001 ms |
| 16 | The revision stream spec is in scope. | slice 1 | observed: revision stream spec diff and the seven selected stream tests in the strict affected run |
| 17 | The shared listing failures spec is in scope. | slice 3 | observed: shared-listing failures spec diff and final strict run selection |
| 18 | Fixture changes are in scope where needed to support those two specs. | slice 3 | observed: diff confines code to the specs and support for real HTTP, synthetic GitHub, watched profiles, process ownership and clock |
| 19 | The broader polling story is outside this scope. | slice 3 | observed: aggregate diff confines behavior to the two specs and their fixtures; broader polling paths unchanged |
| 20 | A released GitHub request owner clock seam is outside this scope. | slice 3 | observed: listingReuseWithOwnerClock launches the existing owner entry point with a private preload; no released runtime change |
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
| 34 | The GitHub listing is still unanswered when the HTTP check times out. | slice 2 | observed: fake GitHub receives matching-refs and returns hangs; advancing only the HTTP waiter yields 502 while that same subprocess remains alive |
| 35 | After the listing itself times out, a later check succeeds. | slice 2 | observed: advancing the independent listing bound produces the matching timed-out revision-check at the pin and the captured subprocess exit before the fresh check returns 200 |
| 36 | That later check makes exactly one fresh listing request. | slice 2 | observed: shared-listing failures spec, askedSince afterTimeout equals one matching-refs |
| 37 | A 504 still falls back to the ref. | slice 2 | observed: shared-listing failures spec, fake 504 on matching-refs followed by successful ref-only revision payload |
| 38 | A 504 leaves the next check eligible to request a fresh listing. | slice 2 | observed: shared-listing failures spec, 504 recovery returns 200 and records exactly one fresh matching-refs |
| 39 | GitHub answers the listing with a 429. | slice 3 | observed: shared-listing failures spec, first matching-refs answers synthetic HTTP 429 and the boundary response identifies it |
| 40 | The 429 carries a directed wait. | slice 3 | observed: first 502 includes retryAfterSeconds: 1 from the synthetic Retry-After header |
| 41 | During the wait, another check on the same server is held back. | slice 3 | observed: second check through the same real boundary before clock advance returns held-back 502 with the same one-second wait |
| 42 | That held-back check makes no GitHub request. | slice 3 | observed: askedSince afterLimit equals an empty list for the held-back request after upstream recovery is arranged |
| 43 | Advancing the private owner’s clock past the cooldown allows the next check to succeed. | slice 3 | observed: clocked.advanceOwnerClock advances the same recorded owner by 1001 ms, after which the real HTTP check returns 200 |
| 44 | That next check makes exactly one fresh listing request. | slice 3 | observed: askedSince afterLimit contains exactly one matching-refs after clock advance and the owner PID still matches |
| 45 | The revision stream spec passes through the normal dashboard backend entry point. | slice 1 | observed: Slice 1 accepted proof, strict affected selection through npm run test:dashboard |
| 46 | The shared listing failures spec passes through the normal dashboard backend entry point. | slice 3 | observed: Slice 3 final comparison, strict normal dashboard command includes all shared-listing failures cases |
| 47 | The revision stream spec’s other existing assertions still pass. | slice 1 | observed: Slice 1 accepted proof, original stream header, admission, 504, 429 and production preview gzip assertions passed |
| 48 | The shared listing failures spec’s other existing assertions still pass. | slice 3 | observed: Slice 3 final comparison passes 504 fallback, hung timeout and recovery, active listing shutdown and scope isolation |
| 49 | The before-and-after comparison uses the same two-spec selection. | slice 3 | observed: Slice 3 final comparison uses the baseline Chromium selector for both specs, two workers and the strict reporter |
| 50 | The comparison records elapsed time. | slice 3 | observed: Slice 3 final comparison records shell and Playwright elapsed time and individual changed attempt durations |
| 51 | The comparison records executed cases. | slice 3 | observed: Slice 3 final comparison strict record selects and passes all 10 cases |
| 52 | The comparison records the waits removed. | slice 3 | observed: Slice 3 final comparison lists both shutdown waits, listing settlement pause and cooldown pause removed |
| 53 | Request counts are preserved. | slice 3 | observed: retained exact upstream counts and assertions in both specs for shared listing, fallback, recovery, holdback and no work after shutdown |
| 54 | Verdicts are preserved. | slice 3 | observed: strict comparison 10/10 and affected consumers and lifecycle repeats all pass with existing verdicts |
| 55 | Shutdown uses no elapsed-time sleeps. | slice 1 | observed: revision stream spec, both shutdown journeys use explicit response/disconnect signals and controlled advance |
| 56 | Timeout settlement uses no elapsed-time sleeps. | slice 2 | observed: HTTP waiter and listing bound use a scoped fixture clock; diagnostic and process polling observes the actual settled state |
| 57 | Cooldown uses no elapsed-time sleeps. | slice 3 | observed: shared-listing failures spec, holdback and successful recovery drive a frozen fixture clock without elapsed-time sleep |
| 58 | The work follows `AGENTS.md#test-automation`. | slice 3 | observed: aggregate test diff uses MakeMe agent profiles and event/clock-driven waits, with default timeout and no test.slow() |
| 59 | The work follows `AGENTS.md#failing-and-flaky-tests`. | slice 3 | observed: strict affected and repeat proofs for all three slices, with asynchronous CI registered on each accepted story-branch revision |
