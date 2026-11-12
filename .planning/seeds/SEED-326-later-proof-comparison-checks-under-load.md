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
the landing hour, and final answers reuse proof" (line 31). The two other
"later" cases of that file share its setup in
`dashboard/tests/support/pendingLandedComparison.ts`.

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

SEED-324#pass-landed-ci-repeat-checks-under-high-load owns the landed CI
repeat and follow-up checks under the same kind of load.

<a id="pass-later-proof-comparison-checks-under-load"></a>

### Make later-proof Intent comparison checks fast and stable under moderately high load

**Identity:** SEED-326#pass-later-proof-comparison-checks-under-load
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Maintainers get a fast passing verdict from the "later" Intent CI comparison
checks while the machine is under moderately high CPU load, with the default
case timeout and wide margin, because the checks prove their promises through
a different testing approach whose cost does not grow with about 100
load-sensitive process starts.

#### Scope to refine

- Choose the testing approach. Candidates to weigh, none selected:
  - prove the walk limit and pending-proof rule at the boundary of
    `dashboard/server/laterTrunkBuild.ts` with supplied revision and run
    answers, and keep one thin end-to-end case for the wiring;
  - answer the walk's lookups in process, without a process start each;
  - reach "past the walk" with a controlled walk limit or prepared history
    in place of 29 real later revisions.
- Fix the load profile the story promises. The starting proposal is a
  one-minute load of 30–50 on two workers, the profile proposed in SEED-324;
  Terry named "moderately high CPU load" without a figure.
- Set the speed target. The starting proposal is a few seconds per case at
  one worker, against 15.5 s today.
- Keep behavioral coverage: unanswered proof keeps a landing pending even
  when later revisions put the end past the 30-revision walk; it recovers
  after the observation clock passes the landing hour; final answers reuse
  the proof without asking again. Show this with a coverage map and fault
  controls.
- Decide whether batching the product's revision lookups belongs here. Real
  users pay the same sequential `gh` calls, and SEED-315's execution
  recommended it; this story's goal is the test approach.
- Resolve the live candidate `later-comparison-walk-gh-starts` with the
  outcome.
- Use shared MakeMe for domain data and existing external-provider fixtures.

Required restrictions and reasons: keep the default case timeout; no timeout
overrides, `test.slow()`, sleeps, retries or skips to absorb load, under
[test automation](../../AGENTS.md#test-automation). A flaky check is failing
under the project's
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
until it is stable locally and in CI.

#### Key examples to refine

- At the promised load profile, every "later" case of the file passes in
  three consecutive runs, and its slowest case stays well inside 30 s (the
  margin is a figure to set in refinement).
- At one worker without added load, the line-31 case meets the speed target.
- The same checks pass in hosted CI with unchanged verdicts.
- A fault injected into each promise the changed checks still own makes a
  named check fail.
