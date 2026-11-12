---
id: SEED-324
status: active
planted: 2026-11-12
planted_during: follow-up to SEED-314#speed-up-landed-ci-repeat-checks, whose remaining real journeys and two unowned checks of the same repeat scenario still reach the 30 s default above a load of about 33
trigger_when: Terry asked for this story at the top of the backlog on 2026-11-12
scope: story
---

# SEED-324 — Landed CI repeat checks pass under moderately high load

## Why this matters

SEED-314#speed-up-landed-ci-repeat-checks cut the landed CI repeat family
from 111 s to 35 s at one worker, and it passes at local load 24–26 on two
workers. Above a one-minute load of about 33, the checks that still take a
real receipt-to-admission journey reach the 30 s default case timeout, on the
base as well as on that story's code:

- the three remaining real journeys in
  `dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts`, whose
  saved-request case and the one in
  `dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts` share
  their support;
- `dashboard/tests/intent/recently-done-ci-automatic-repeat.spec.ts`, whose
  phone journey polls the rerun count for 5 s after the receipt and failed
  once at load 27–40;
- `dashboard/tests/intent/intent-ci-follow-up.spec.ts`, whose phone journey
  takes 22–23 s at load 20–25 and reaches 30 s above about 33.

No story names the last two. Other worktrees routinely hold this machine at
that load, so a loaded local run can fail on any of these without a product
defect. The evidence is the SEED-314 occurrence of
[DD-476](../../ProjectFindings.md#dd-476).

On 2026-11-12 Terry asked for a story in which these tests pass safely at a
moderately high CPU load without a customized timeout, which means
simplifying them by a lot so that they are both faster and stable.

SEED-287#fit-dashboard-journeys-in-default-timeout owns the five
`landed-ci-repeat-admission` cases, and
SEED-319#hold-landed-ci-follow-up-observations-under-load owns the
reconciliation, follow-up reading and receipt boundary observations at load
20–30.

<a id="pass-landed-ci-repeat-checks-under-high-load"></a>

### Make landed CI repeat checks pass under moderately high load

**Identity:** SEED-324#pass-landed-ci-repeat-checks-under-high-load
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/599-pass-landed-ci-repeat-checks-under-high-load/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"db728d77ddcd28d7a543a049d3e61d175e3ac49d286b05b72429a63074b60f39","plan":"7a39d4f48193e14c52e50338d107f903a7123f0e99f39fe103b2945d36367e7d"}}
```

#### Goal

Maintainers get a passing verdict from the landed CI repeat and follow-up
checks named above while other work holds the machine at a one-minute load of
30–50, with the default 30 s case timeout, the default 5 s expectations and
wide margin. Each check gets there by doing much less: one case keeps the real
receipt-to-request journey, and every other case starts from the state that
journey leaves on a machine.

#### Scope

- **Load profile.** A one-minute load average of 30–50 before and after a
  run, on two workers. This is the range in which these checks failed, and
  this preparation's reading of "moderately high CPU usage"; Terry named no
  figure.
- **One receipt journey.** Across the four named specs, at most one case
  takes a real receipt through ingestion, collection and admission to the
  provider's rerun request. Five do today. That case keeps what only the
  journey shows: a Done receipt at exactly 105 s against five 100 s prior
  builds leads to exactly one rerun request for run 71, the intent is saved
  before the request is sent, the accepted request is saved after the reply,
  and the request the product wrote is read as a card.
- **Everything else from kept state.** The other cases arrange what a machine
  already keeps (its follow-up ledger, landed CI history and launch records,
  and where a card is read the story's real published completion), then run
  real collection and reading in a real server:
  - the provider's refused and uncertain replies, from an unspent eligible
    receipt the machine keeps, through the real rerun request;
  - what a later collection pass and a restart do with an accepted request
    (in progress, slow, the original kept in history, no second request),
    from a saved accepted request as the saved-request cases already do;
  - the machine setting and the red Done warning with its totals on a phone,
    from a saved request for a published completion;
  - the Intent reading of both attempts and their frozen reference, from a
    settled request and kept history in a server that collects nothing,
    divided so that no single case carries the first render, the proof
    navigation, the reload, the revisit and the Development selection
    together.
- **Coverage kept.** Every promise the seven current cases protect keeps an
  owner among maintained checks. The plan holds a coverage map of those
  promises and one deliberate product fault per promise. An observation
  leaves a journey only after its fault fails the check that takes it over.
  SEED-314's faults F1–F11 keep an owner.
- **Kept state stays the product's.** Kept state is arranged through shared
  MakeMe builders typed by the product's own ledger, history and record
  types, and provider facts through the existing fake GitHub. A saved request
  the product's schema refuses fails its case. The one journey reads the
  request the product itself wrote through to a card, so a difference between
  what the product writes and what the builders arrange still fails a check.
- **Waits name their event.** After a provider fact changes, a case waits for
  the event it depends on: the provider's answer to the read, the request's
  arrival, or the saved request changing. No case keeps a 5 s observation
  whose wait is one collection pass on a machine that keeps a full history.
- **Shared fixtures keep their other consumers.** The admission,
  reconciliation, follow-up reading and receipt boundary specs use
  `prepareRepeatScenario` too. Each of their cases gives the result the base
  gives it in the same load window.

Required restrictions and reasons: keep the default case timeout and the
default expectation timeout; no timeout overrides, `test.slow()`, sleeps,
retries or skips to absorb load, under
[test automation](../../AGENTS.md#test-automation). A flaky check is failing
under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
until it is stable locally and in CI.

Scope limits:

- No product behavior changes. The checks change, with their support modules.
- SEED-287#fit-dashboard-journeys-in-default-timeout owns the five admission
  cases and the preparation a case pays when it runs first in its worker
  (start origin and the shared app build), and is in execution. Its branch
  adds `collectPriors` to `prepareRepeatScenario` and changes the return of
  `prepareRepeatPriors`; this story's edits to those two modules merge with
  that. This story counts first-in-worker preparation in every case's time
  and does not change it.
- SEED-319#hold-landed-ci-follow-up-observations-under-load owns the
  reconciliation, follow-up reading and receipt boundary observations.
- The cost of one fake `gh` call (a Node process per call) stays as it is.
  This story lowers the number of calls a case waits for.
- The repository node suite's follow-up policy, reading and ledger tests stay
  as they are and are credited only where the coverage map names the promise
  they already own.

#### Key examples

1. **The profile passes with margin.** Other work holds the one-minute load
   at 30–50 → the four named specs run on two workers three times in a row →
   every case passes each time; no case takes more than 15 s, or 25 s when it
   runs first in its worker. A run whose load before or after lies outside
   the profile is recorded and not counted.
2. **One journey.** The four specs → count the cases that ingest a receipt →
   one, where the base has five.
3. **A provider reply without a journey.** A machine keeps five measured
   100 s prior builds, a Done landing whose first attempt took 120 s, and
   that landing's unspent eligible receipt; the provider answers the rerun
   request with 403 → a production dashboard starts there → the provider
   receives exactly one rerun request for run 71, and the card reads refused
   beside the 120 s original and the 100 s average. With 503 and a later
   104 s passing repeat, the card stays unverified and shows the 104 s
   repeat.
4. **The warning without a journey.** Story A is published as completed and
   the machine keeps an accepted request for it, 105 s against 100 s; the
   provider's repeat passed in 106 s → the Recently done card is read on a
   phone → a red textual warning shows Original 1 min 45 s, Repeat
   1 min 46 s, Saved average 1 min 40 s and "does not prove a regression or
   its cause", without sideways scroll. No receipt was ingested.
5. **The reading without acquiring CI.** A machine keeps a settled recovered
   request, 120 s then 100 s, with its frozen reference of five prior builds
   used and one 116 s outlier excluded → a dashboard that collects nothing
   opens the card's comparison on a phone → both attempts, their links and
   the reference evidence are read, and the provider receives no CI request
   from first render, reload or revisit.
6. **Each promise still has a check that catches it.** One deliberate product
   fault per promise in the coverage map → the named check runs → it fails at
   an expectation that names the promise.
7. **Kept state the product would refuse.** A saved request that breaks the
   product's schema → its case runs → the case fails.
8. **Much faster.** The base and the candidate run the four specs on one
   worker back to back under the same load, three passing observations each
   → the candidate's median wall time is at most two-thirds of the base's.
9. **Hosted CI.** The same spec paths pass in hosted CI on the published
   revision, with no added timeout, sleep, retry, skip or runner mode.

#### Architecture

The follow-up ledger, the landed CI history and the launch records are the
only state the product carries from one stage of a repeat to the next:
receipt admission writes them, a collection pass spends and observes from
them, and a card reads them against the published completion. Each stage can
therefore be checked from the state the previous one leaves.

- Kept state has one arrangement owner. `saveRepeatRequests` in
  `dashboard/tests/support/ciFollowUpSavedRequests.ts` saves accepted
  requests today, for landings no story published, through
  `makeMe.aCiFollowUpEntry`, `makeMe.aCiRepeatRequest` and
  `repeatLedgerFacts()`. This story generalises that owner to the other
  states a repeat passes through (an unspent eligible receipt with its
  capture, a request for a published completion, a settled request with its
  reference) instead of adding a second arrangement beside it. History and
  launch records come from `makeMe.aLandedCiHistory` and
  `makeMe.aLaunchRecord`.
- Provider facts keep their owner, `providerRepeatRun` in
  `dashboard/tests/support/ciFollowUpRepeatRun.ts`.
- `prepareRepeatScenario` remains the journey's arrangement for the one
  journey here and for the specs SEED-287 and SEED-319 own.
- No product seam is added for tests. Collection, admission and reading run
  as a production dashboard runs them.

[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
applies: key examples 1, 2 and 8 state the comparison and the result worth
keeping before any measured run. No Accepted decision conflicts with this
story.

#### Direction and alternatives

Recommended, and what the scope above records: one end-of-line journey with
stage checks from kept state. The mechanism is borrowed from production-line
testing, where each station is tested with a known-good part and one
end-of-line test runs a unit through the whole line. The stations are
admission, the rerun request, the outcome observation, the card and the page;
the part is the machine's kept state. The analogy breaks at one point: a
known-good part here is built by the test's builders, not by the upstream
station, so a station check cannot notice that the product now writes
something else. The journey's card read and the schema refusal carry that.

Compared against the same goal:

- Thin each of the five journeys in place and keep all five. Each still pays
  the published story, a collecting server and the receipt-to-request wait
  (3.4–8.6 s at load 27–51), so the margin stays narrow.
- Make the shared machinery cheaper (a fake `gh` without a Node process per
  call) and leave the cases alone. It helps every dashboard check, it is a
  lead SEED-287 already holds, and five journeys of about 30 calls each
  would remain.
- Check outcomes below the dashboard boundary with injected provider reads.
  Fastest, but nothing below the boundary reads provider facts into an
  outcome today, so it needs a product seam and gives up real collection.

#### Refinement observations, 2026-11-12

Observed in this preparation's workspace at `7cf81190b` on Node 24.21.0 after
`setup-native`, while other worktrees held the one-minute load at 18–51.
Scratch specs were removed afterwards.

- The four named specs, two workers, traced, load 25.1 → 30.0: 5 of 7 cases
  passed. `intent-ci-follow-up.spec.ts:27` reached 30 s in its keyboard tab
  loop, with the proof navigation, reload, revisit and Development selection
  still ahead; its page first opened 22.2 s into the case.
  `recently-done-ci-automatic-repeat.spec.ts:18` reached 30 s inside its
  progress poll, after its 5 s rerun-count poll had taken 4.9 s and its
  `dashboard` fixture 13.2 s. The lifecycle journey took 29.6 s and the
  refused journey 27.4 s, each first in its worker with 8.9 s of `origin`
  fixture; the uncertain journey 16.7 s; the two saved-request cases 4.8 and
  6.4 s.
- A journey has made 30 fake-`gh` calls by its first outcome: 16 collect the
  five prior builds, 9 lie between the receipt and the rerun request, and 5
  belong to the pass that reads the outcome. On one worker at load 27 → 51
  the prior builds took 3.9–4.9 s, the receipt-to-request wait 3.4–4.2 s
  with the prior builds already kept and 8.6 s without, and the outcome was
  read 4.6–5.3 s after the provider changed, beside the 5 s expectation.
- An unspent eligible receipt admits without ingestion. A real journey's
  accepted request was removed from the ledger file, leaving the eligible
  entry, its capture, the kept history and the records; a second server
  started on that machine sent the rerun request 2.9 s after it started,
  after 5 provider calls, at load 49 → 42, and read the refused card 0.6 s
  later. Not observed: that state arranged through MakeMe instead of a
  journey's own bytes.
- A card needs no journey. Story A published as completed, plus one accepted
  request for its completion arranged through `repeatLedgerFacts()` and
  `makeMe.aCiFollowUpEntry`, read as a slow card through the settings read
  3.5 s after the server started, after 5 provider calls; the case took
  10.0 s at load 40 → 50. A page-fixture server that was already running
  read the same card 0.8 s after the request was saved, at load 18. Not
  observed: that card rendered in the page. Two scratch arrangements that
  published the committed origin before saving the request made no provider
  call in 19 s, and the cause was not found.
