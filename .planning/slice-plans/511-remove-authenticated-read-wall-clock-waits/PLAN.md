# Remove wall-clock waits from authenticated-read backend specs

**Identity:** SEED-262#remove-authenticated-read-wall-clock-waits

**Source:** [Remove wall-clock waits from authenticated-read backend specs](../../seeds/SEED-262-faster-dashboard-test-feedback.md#remove-authenticated-read-wall-clock-waits)
**Source review:** [Source commitments](source-review.md)

## Goal and boundaries

Developers running the two authenticated-read backend specs get the result
when the relevant event occurs or the test advances time. The specs retain
their real HTTP and synthetic GitHub proof, including the request counts
that detect an extra listing or a missing recovery. This plan covers the two
specs and their fixture support. The broader polling work and a released
request-owner clock seam have
[separate scope](../../seeds/SEED-262-faster-dashboard-test-feedback.md#drive-polls-with-time-and-replies).

## Current decisions

- Reuse the [in-process boundary HTTP harness](../../../dashboard/tests/support/inProcessBoundaryHttp.ts)
  for controlled cadence and plugin shutdown. This lets the authenticated
  middleware end a real SSE response while the HTTP listener and fake
  GitHub stay live. Observe response termination on the client and the last
  disconnect at the server. Use the held-answer fixture to share the
  opening listing and to count the listing triggered at the next pace.
- Control the cadence timer at the fixture boundary. Keep the control
  scoped to the revision stream's timer, with ordinary HTTP, child process,
  and harness timers live. The existing dashboard observation clock measures
  the age of cached answers. The page clock drives browser callbacks.
- Use the existing [diagnostics inspection](../../../dashboard/tests/support/readDiagnostics.ts)
  to observe the listing's own timeout after the HTTP waiter returns 502.
  Warm the private owner and confirm the hung matching-refs call actually
  reached fake GitHub. Observe the hung call end before the fresh check.
- Start the real request owner in a fixture-private endpoint with a
  controllable Date for the cooldown case. Reuse its existing entry point,
  endpoint binding, and owned process cleanup. Advance the same owner's
  clock across the wait. Keep real process timers for startup and teardown.
- Arrange valid domain data through the [shared MakeMe entry](../../../tests/support/makeMe.mjs).
  Reuse its agent-profile builder for the recorded watched branches.
  Keep the actual HTTP requests, supplied failure answers, and expected
  payloads and request counts in the proof.

These controls follow the existing separation between the read boundary and
the request owner's admission of GitHub calls. The evidence comparison follows
[ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Outside-in proof

| Seed example | Owner | Required observation |
| --- | --- | --- |
| 1. Two subscribers share each listing, then the last disconnect stops cadence | Slice 1 | Both opening HTTP streams share one held matching-refs call and receive their distinct SSE answers. The clock just before the next pace triggers no listing. At the pace, one new matching-refs call supplies both answers. After server-side disconnect handling, advance across three more paces. The armed timer has been canceled and the listing count stays unchanged. |
| 2. The boundary closes an open response and stops cadence | Slice 1 | Close the real plugin boundary after the first frame and after the next pace is armed. Observe a clean SSE end with no additional frame. Advance across further paces with HTTP and fake GitHub still live. The canceled timer stays inactive and the listing count stays unchanged. |
| 3. The listing timeout and 504 allow a fresh check | Slice 2 | The held listing is observed at fake GitHub, the HTTP waiter gets its timeout response, and the matching revision-check timeout diagnostic and subprocess exit precede recovery. Recovery returns 200 with exactly one matching-refs call. Preserve the 504 fallback and subsequent fresh listing assertions. |
| 4. The owner holds checks back and then allows a fresh listing | Slice 3 | The same owner reports the 429 and directed wait, returns a held-back 502 without an upstream call before clock advance, then permits exactly one fresh matching-refs call and a 200 after the advance. |
| Both specs retain their other verdicts and no longer wait out shutdown, settlement, or cooldown | Slices 1–3, final comparison in Slice 3 | Run both complete specs through the normal Playwright command. Inspect the changed wait paths, retain the stream admission, 504, limited reply, preview gzip, active-listing shutdown and scope isolation cases, and compare the measured selection with the baseline below. |

## Decisive premises

Observed on 2026-11-08 at `97758676e` in the owned worktree on macOS, AC power,
and Node 24.21.0. The scratch specs used the normal dashboard Playwright
configuration. The scratch files were removed.

| Consuming operation | Observation and result |
| --- | --- |
| The normal backend runner selects and executes the existing cases | The focused two-spec command below returned strict pass with 10 selected and 10 passed. |
| Slice 1 drives the actual stream's pace and shutdown | `caffeinate -s -i npm run test:dashboard -- dashboard/backend-tests/observation/scratch-seed262-stream-clock-probe.spec.ts --workers=1 --reporter=line` passed one case in 4.7 s. The fixture scoped a distinctive cadence timer to HTTP handling with AsyncLocalStorage. One opening event used one listing. Advancing to one millisecond before the next pace fired none. Advancing the last millisecond produced a fresh listing and another event. After the real plugin close hook, the client saw response end, a further HTTP request still got a response, and advancing three paces fired no timer and produced no listing. The two-client and last-client assertions are Slice 1's delivery proof. |
| Slice 2 observes timeout settlement through the running boundary | `caffeinate -s -i npm run test:dashboard -- --project=chromium --workers=1 --repeat-each=3 'dashboard/backend-tests/observation/listing-timeout-preparation-probe\.spec\.ts$' --reporter=dot` passed three cases in 7.0 s. After warming the development fixture, a held matching-refs produced the waiter's 502, the real inspection endpoint reported `revision-check` / `timed-out` for that revision, and the next check returned 200 with exactly one fresh listing. |
| Slice 3 advances the owner used by the bundled development boundary | `caffeinate -s -i npm run test:dashboard -- dashboard/backend-tests/observation/listing-clock-preparation-probe.spec.ts` passed. The real owner, prestarted with a fixture-only Date preload and matching private endpoint, reported a one-second wait and held a second check back. An atomic clock advance of 1,001 ms yielded a 200 with one fresh matching-refs. The owner PID matched throughout. |

## Local gates and comparison

Follow the [test automation rules](../../../AGENTS.md#test-automation) and
the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Run from a fully awake Mac on AC under `caffeinate -s -i`.
On battery follow the lid-open `caffeinate -i` and sleep-log procedure in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

Run each affected spec and the consumers below with the normal strict
reporter. Run `npm run typecheck:dashboard` and `npm run lint` for the
changed TypeScript and fixture code. Repeat the changed lifecycle cases
with `--repeat-each=5` and default per-test timeouts. Review the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for any shared fixture changed. Use these proof groups:

- An SSE client or in-process HTTP harness change reaches the
  [setup-departure](../../../dashboard/backend-tests/observation/authenticated-read-revision-stream-setup-departure.spec.ts)
  and [plugin-hooks](../../../dashboard/backend-tests/observation/authenticated-read-plugin-hooks.spec.ts)
  specs. The former observes live and departing streams and the latter
  observes shutdown of an in-flight read while HTTP remains live.
- A change to shared reads or the private GitHub fixture reaches other
  callers of that helper. Check the matching-refs reuse and waiter paths
  in the [shared-listing](../../../dashboard/backend-tests/observation/authenticated-read-shared-listing.spec.ts)
  and [shared-waiters](../../../dashboard/backend-tests/observation/authenticated-read-shared-waiters.spec.ts)
  specs, and the owner holdback path in the
  [cooldown](../../../dashboard/backend-tests/observation/authenticated-read-cooldown.spec.ts)
  spec. Trace any additional effects if the default fixture startup or
  teardown path changes.

Use the [strict proof record](../../../dashboard/tests/proof-record.md) for
the comparison. Baseline command, with a fresh absolute
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD` path:

```sh
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 'dashboard/backend-tests/observation/authenticated-read-(revision-stream|shared-listing-failures)\.spec\.ts$'
```

The baseline passed all 10 cases in 8.105 s shell elapsed and 7.750 s
Playwright elapsed. Test attempts took 1.035 s for two-stream cadence and
last disconnect, 0.761 s for boundary close, and 3.308 s for the combined
504, timeout and cooldown case. The one-minute load averages were 4.81
before and 5.15 after. Use the same selection, workers and reporter after the
change. Record elapsed time, observed attempts, load and the waits removed.
Distinguish the eliminated waits from any variance in the remaining run.

## Execution context

- Story Branch Mode in the owned `remove-wall-clock-waits-from-authenticated-read` worktree on `codex/remove-wall-clock-waits-from-authenticated-read`. Integration checkout is `/Users/terryyin/git/open-dough`.
- Publisher `dashboard-territory.local-open-dough`, agent `ivan-chan`. Starting revision `b0a6a54caf265b8891d065d295f87024b5ab0766`. Established claim and opening branch revision `91fef53a4ae9023f75d3682baf3dc1515b1e7acb` confirmed on `origin`. Trunk target `main`.
- GitHub Actions `ci.yml` (CI), story-branch observer `ivan-chan-511`, directory `/tmp/dough-ci-501/watch-we0O8F`, PID `87794`, exec cell `g55:9`, shell session `54426`.

## Slices

### 1. Revision streams share one controlled pace and stop at shutdown

Type: Behavior

Status: done

Use the existing in-process boundary and held-answer harnesses for the two
lifecycle cases. Extend the SSE test client to observe real response end
separately from an aborted socket. Wait until the fixture observes server
disconnect handling before advancing time. Assert cancellation of the
armed timer as well as the unchanged matching-refs count so the absence
check cannot pass merely because an asynchronous request has yet to arrive.
Keep production preview for the gzip case. Finish with the stream spec and
affected harness consumers passing.

Accepted implementation proof on macOS AC with Node 24.21.0, two workers,
and the strict reporter. The stream and affected consumer selection passed
61/61 attempts across 16 specs in 44.245 s of Playwright time. Five repeats
of each changed lifecycle case passed 10/10 attempts in 7.931 s with the
default test timeout. `caffeinate -s -i npm run typecheck:dashboard` passed.
The paired streams use recorded profiles for `story/one` and `story/two`,
hold each matching-refs answer until counted, and assert both SSE answers
and the timer's cancellation after the last server disconnect. Boundary
close yields a clean one-frame SSE response, leaves a live HTTP listener,
and cancels the armed pace. The fixture clock only controls the configured
cadence in the stream request context. The MakeMe profile conversion kept
both serialized profile payloads byte-identical.

```sh
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 'dashboard/backend-tests/observation/authenticated-read-(revision-stream|revision-stream-setup-departure|plugin-hooks|shared-listing|shared-listing-failures|shared-waiters|shared-failures|shared|cooldown|cooldown-reach|directed-wait|backoff|diagnostics|resumption|wait-in-turn)\.spec\.ts$' 'dashboard/backend-tests/observation/shared-request-owner\.spec\.ts$'
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 --repeat-each=5 'dashboard/backend-tests/observation/authenticated-read-revision-stream\.spec\.ts$' --grep 'two streams of one source|closing the boundary ends open streams'
```

The independent refactor consolidated the in-process authenticated-read
fixture shared by the stream, setup-departure and plugin-hook specs. It
retained the held-answer and server-side disconnect signals and made fixture
cleanup cover startup and teardown errors. The revised paths passed 12/12
strict attempts, 10/10 lifecycle repeat attempts using the same repeat
command, and typecheck. Other affected-consumer proof remains applicable
because their shared fixture paths were unchanged by this pass.

```sh
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 'dashboard/backend-tests/observation/authenticated-read-(revision-stream|revision-stream-setup-departure|plugin-hooks)\.spec\.ts$'
```

Delivery corrected mechanical callback binding and error-cause lint findings.
The focused selection and typecheck passed after the binding repair. The
selective formatter and commit hook then passed, and the story branch accepted
`583e29298cab6a1b02456ba80d26198d49d960bd` with its CI observer attached.

### 2. A settled listing timeout allows a fresh check

Type: Behavior

Status: done

In the shared-listing failures spec, confirm the hung request was
dispatched and the HTTP waiter timed out. Observe the listing's timeout
diagnostic and the subprocess exit in place of `pause(500)`. Keep the 200
and single fresh listing after recovery, alongside the 504 fallback and
recovery proof. Finish with the listing failures spec and affected
shared-read consumers passing.

The timeout case warms the real private request owner with a ref read.
Fake GitHub holds only the incoming matching-refs request and captures its
subprocess PID. After the HTTP 502 the real diagnostics endpoint reports
`revision-check`, `timed-out` and the expected pin. The captured subprocess
is then observed stopped before the next HTTP 200 with exactly one fresh
matching-refs. The 504 fallback and one fresh matching-refs after that
fallback still pass. The independent refactor needed no edits.

The strict affected selection passed 12/12 attempts in 9.708 s. Five repeats
of the changed case passed 5/5 in 13.214 s with default timeouts. Typecheck
and `git diff --check` passed.

```sh
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 'dashboard/backend-tests/observation/authenticated-read-(shared-listing-failures|shared-listing|shared-waiters|cooldown)\.spec\.ts$'
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 --repeat-each=5 'dashboard/backend-tests/observation/authenticated-read-shared-listing-failures\.spec\.ts$' --grep 'a 504 listing, a timed-out listing, and a rate-limited listing keep nothing'
```

The story branch accepted `cc8bb4a880b790c338cb1283e9e59141854d2825`
with the same observer attached. Its push superseded the prior CI attempt
42439544494/1. That attempt had no failed jobs or failed steps.

### 3. The request owner allows a fresh check when its cooldown expires

Type: Behavior

Status: done

Use the private owner clock for the same-server 429 case in place of
`pause(1_100)`. Assert holdback and zero upstream calls before advancing
the clock, then the 200 and one fresh listing after. Finish with the
listing failures spec and affected owner fixture consumers passing. Run
the two-spec comparison and record the final evidence.

The existing request-owner entry point runs at a private endpoint with a
fixture-only frozen Date and ordinary process timers. The first HTTP 502
reports upstream 429 and a one-second directed wait from one matching-refs
call. With a healthy upstream response available, the same server returns a
held-back 502 with zero calls. An atomic 1,001 ms advance gives a 200 and
exactly one fresh matching-refs. The private owner PID is unchanged at all
three observations. The fixture restores real time before stopping its owner.

The affected strict selection passed 12/12 attempts in 8.828 s and five
repeats of the combined lifecycle case passed 5/5 in 9.842 s. Dashboard
typecheck and `git diff --check` passed. The default listing-reuse fixture
path remains unchanged. The independent refactor needed no edits.

#### Final two-spec comparison

Same Chromium selection, two workers and strict reporter on macOS AC with
Node 24.21.0. Both runs selected and passed all 10 cases. The final command
used a fresh absolute `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` destination.

```sh
caffeinate -s -i npm run --silent test:dashboard -- --project=chromium --workers=2 'dashboard/backend-tests/observation/authenticated-read-(revision-stream|shared-listing-failures)\.spec\.ts$'
```

| Measurement | Baseline | Final |
| --- | ---: | ---: |
| Shell elapsed | 8.105 s | 7.98 s |
| Playwright elapsed | 7.750 s | 7.606 s |
| Two streams, cadence and last disconnect | 1.035 s | 0.496 s |
| Boundary closes an open stream | 0.761 s | 0.189 s |
| Combined 504, timeout and cooldown | 3.308 s | 1.902 s |
| One-minute load, before to after | 4.81 to 5.15 | 8.28 to 8.08 |

The two 240 ms shutdown waits, 500 ms listing-settlement pause and 1,100 ms
cooldown pause are gone. The next cadence is also advanced by the test.
The remaining elapsed time includes actual request, diagnostic and fixture
work. Overall timing is a single comparison under different loads.

## Plan concerns

Slice-plan refinement was unnecessary. The stream cases share one
cadence and shutdown proof loop. The listing timeout and owner cooldown
have independent proof loops and separate stopping points. No slice-specific
readiness concerns remained after the three consuming-path observations.
