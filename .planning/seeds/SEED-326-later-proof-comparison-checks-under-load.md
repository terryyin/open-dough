---
id: SEED-326
status: active
planted: 2026-11-12
planted_during: follow-up to SEED-315#speed-up-provider-rate-limit-checks, whose execution left the "later proof recovers" Intent comparison case slow and able to reach the 30 s default under load
trigger_when: Terry asked for this story at the top of the backlog on 2026-11-12
scope: story
---

# SEED-326 — Later-proof Intent comparison checks fast and stable under load

## Why this matters

SEED-315#speed-up-provider-rate-limit-checks left one case of
`dashboard/backend-tests/intent/intent-ci-comparison-pending-proof.spec.ts`
slow: "later proof recovers after a malformed artifact listing, even beyond
the landing hour, and final answers reuse proof" (line 31). The file's other
"later" case, "later proof held by a provider-directed wait recovers after
the controlled request-owner clock ends that wait", shares its setup in
`dashboard/tests/support/pendingLandedComparison.ts`, 29 later revisions
included.

The evidence is live candidate `later-comparison-walk-gh-starts` in
[test optimization candidates](../TEST-OPTIMIZATION-CANDIDATES.md):

- the case body took 15.5 s at one worker and host load about 45, and
  25.6–28.8 s alone at loads 70 falling to 43;
- it exceeded the 30 s default once at one worker and load about 70;
- about 10 s of the 15.5 s is the server's sequential later-build walk in
  `dashboard/server/laterTrunkBuild.ts`: 120 fake `gh` calls, 101 of them
  `actions-runs`, each a Node process start of about 100–150 ms at that load;
- moving the 29 setup commits into one Git import saved only 1–2 s;
- CI records about 38 s for the four-case file.

The case reaches the walk's 30-revision limit by building 29 real later
revisions and letting the server start one process per lookup. Its cost grows
with host load, so a loaded local run can fail without a product defect.

On 2026-11-12 Terry asked for a story that optimizes these tests through a
more innovative, different testing approach, so that they run very fast and
pass stably even under moderately high CPU load.

Refinement on 2026-11-12 found the walk-limit rule already proven without
a server or a process start. The six cases of
`dashboard/backend-tests/intent/ci-comparison-finality-unanswered.spec.ts`
arrange a completion plus 30 following revisions as supplied history and
prove, for a malformed listing, a failed request and a provider wait, that
unanswered proof "stays live beyond receipt and walk bounds, then remembers
actual proof". The slow case therefore pays its 29 real revisions and about
100 process starts to repeat a rule another check owns. What only it proves
is the connection: real malformed bytes through the default parsers and the
synthetic `gh`, joined in a real server to the public landed history
(pending gap, then measured point with provenance) and to comparison memory
([proof guide](../../dashboard/tests/intent-ci-comparison-proof.md)).

SEED-324#pass-landed-ci-repeat-checks-under-high-load owns the landed CI
repeat and follow-up checks under the same kind of load.

<a id="pass-later-proof-comparison-checks-under-load"></a>

### Make later-proof Intent comparison checks fast and stable under moderately high load

**Identity:** SEED-326#pass-later-proof-comparison-checks-under-load
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/589-later-proof-comparison-checks-under-load/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bbcae6970d40f2490ffb3985b3764cc8fb55b9b243967f2acc3b3e9f24466151","plan":"fcefdc641f63bbb015fd238591ca5a5b660ca3e0f2bcf91ba10f989c0ac8f7ed"}}
```

#### Goal

Maintainers get a fast passing verdict from the "later" pending-proof
checks of the Intent CI comparison while the machine is under
moderately high CPU load, with the default case timeout and wide margin,
because each promise is proven once at the cheapest boundary that can prove
it and no case pays one load-sensitive process start per walked revision.

#### Scope

- Testing approach: everything past the walk limit is proven by in-process
  rule checks that arrange history as supplied facts, including the judgment
  the landed history collection shares with comparison memory
  (`landedSlotResolution` in `dashboard/server/landedCiResolution.ts`).
  No real-server case builds history past the 30-revision walk. A
  real-server case that then adds nothing a cheaper check lacks is removed,
  not shortened.
- Coverage kept, each promise owned by a named maintained check:
  - unanswered proof keeps a later-provenance landing pending when the end
    is past the walk limit, and after the landing hour has passed;
  - real malformed listing bytes reach that pending state through the
    default parsers;
  - the public landed history shows the pending gap waiting for proof, then
    the measured point with `later` provenance once proof answers;
  - final answers reuse the proof without another `gh` call;
  - a provider-directed wait holds a later-provenance read, repeats ask
    nothing, and the read recovers after the controlled request-owner clock
    ends the wait, under the same owner process.
- Evidence: a coverage map from each promise above to its owning check, and
  one fault control per promise that makes that check fail.
- Promised load profile: a one-minute load average of 30–50 on the
  maintainer's 16-core machine, with the file run on two workers. This is
  the profile proposed for SEED-324; Terry named "moderately high CPU load"
  without a figure.
- Speed target, stated relative to load: in one run of the file, each
  remaining "later" case body takes at most 1.5 times its "equivalent" sibling, which
  builds no later revisions.
- Resolve the live candidate `later-comparison-walk-gh-starts` in
  [test optimization candidates](../TEST-OPTIMIZATION-CANDIDATES.md) with
  the outcome, and bring the
  [proof guide](../../dashboard/tests/intent-ci-comparison-proof.md) in line
  with the changed connection.
- Use shared MakeMe for domain data and existing external-provider fixtures.

Scope limits:

- The product's sequential revision lookups in
  `dashboard/server/laterTrunkBuild.ts` stay as they are. Batching them
  would shorten a real user's cancelled-landing read, and SEED-315's
  execution recommended it; it is a product change no story owns yet.
- A cheaper synthetic `gh` start for the whole suite, and the 2.2 s shared
  landing fixture, are outside this story.
- The "equivalent" cases and the SEED-324 checks change only where the
  shared setup requires it.

Observed on 2026-11-12 at `c680e64e0`, in scratch runs since reverted:

- With no extra later revisions the provider-wait "later" case passes
  unchanged; a held wait never reaches the rest of the walk.
- With no extra later revisions the line-31 "later" case fails: its history
  gap waits for a later build, not for proof of run 201. That join exists
  only past the walk limit.
- Called in process with a completion plus 30 supplied revisions and a
  malformed listing, the shared judgment answers pending, waiting for proof
  of run 201 attempt 1, in 3 ms with 32 in-process lookups. With unanswered
  proof ignored in that judgment, it and all six finality rule cases fail.

Required restrictions and reasons: keep the default case timeout; no timeout
overrides, `test.slow()`, sleeps, retries or skips to absorb load, under
[test automation](../../AGENTS.md#test-automation). The walk limit stays a
product constant with no test-only setting, because a server that reads a
different limit under test no longer proves the shipped rule. A flaky check
is failing under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
until it is stable locally and in CI.

#### Key examples

- One worker, any host load → run the file → each remaining "later" case
  body takes at most 1.5 times its "equivalent" sibling in the same run (the
  line-31 case took 15.5 s at load 45 before this story).
- The file runs → no case's recorded `gh` calls include a lookup per walked
  revision (the line-31 "later" case made 120 calls, 101 of them
  `actions-runs`, against 29 and 12 for its "equivalent" sibling, before
  this story).
- A later-provenance landing with a completion plus 30 following revisions
  and a malformed listing → the in-process judgment check → pending, waiting
  for proof of run 201 attempt 1, with no process start.
- Load average 30–50, two workers → run the file three times in a row →
  every case passes each time and the slowest case body stays under 10 s, a
  third of the 30 s default.
- The change is published → hosted CI passes the file's remaining cases and
  the rule checks with unchanged verdicts, and the file's recorded time
  falls from about 38 s.
- The malformed listing is treated as an answered, final absence → the
  check owning "real malformed bytes reach pending" fails.
- The walk treats an end past the limit as awaiting a later build, or drops
  pending once the landing hour passes → the in-process rule check fails.
- A final read asks GitHub again → the reuse check fails.
- The owner clock's end of a provider wait no longer releases the read, or
  a repeat read during the wait asks again → the provider-wait check fails.
