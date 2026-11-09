# Source-only amendment review

Selected identity: SEED-285#trace-landed-proof-timing.
Reviewer: `/root/amended_source_review`, fork_turns none.
Restriction: only the amended retention and UX paragraphs; no plan,
implementation, proof, earlier review or project reads. Initial opening was
normalized in the prompt; root corrected it by supplying the exact source
below before accepting the refreshed review. No tests ran.

## Exact authoritative review input

- **Collected evidence.** Extend the landed-build history's background
  collection to retain the measured attempt's validated proof summary, including
  file breakdown when published, or its unavailable reason. Use the existing
  GitHub Actions artifact and CI adapter proof readers and their identity checks.
  Collect independently of Intent being open; resume after restart or repeated
  Done reports without duplicating a measurement. Keep available proof for the
  same bounded retained cohort as the project history: the newest 20 distinct
  measured builds, with intervening/trailing gaps and older landings sharing a
  retained build. This build-count window may span about a day on Open Dough;
  it does not cover every story in the 30-day Done list. Older retained builds
  can acquire proof while it remains available, including builds whose wall-time
  resolution is already final; expired or missed evidence is a gap, not an
  invented reconstruction. Evict proof with its build, without extending the
  window or acquiring evicted evidence during browsing.
The existing Intent frame and scope path remain the journey. Reuse the dated
line and readable evidence list of the
[delivered project history](../../docs/dashboard-development-intent-ci-status.md)
within the scope panels; the average, differences and slowdown follow-up are
outside this story. The spent chart plan's mockups were removed in wrap-up.
No new layout or technology choice is needed.

## Returned commitments

1. Extend existing background collection to retain each measured attempt’s
   validated summary/breakdown or reason; reuse existing artifact/adapter
   readers and identity checks.
2. Collect while Intent is closed; resume after restart/repeatedDone without
   duplicate measurements.
3. Keep newest20distinct measured builds, intervening/trailing gaps and older
   landings sharing retained builds.
4. Acquire still-available proof for older retained builds, including final
   wall-time observations; expired/missed evidence remains a gap.
5. Evict proof with its build; browsing extends no window and acquires no
   evicted evidence.
6. Keep existing Intent frame/scope journey and reuse dated line/evidence list.
7. Exclude average/difference/slowdown follow-up, guaranteed30-dayDone coverage
   and new layout/technology choice.
8. About-a-day span and removed mockups are contextual observations only.

## Root allocation

Append returned1–8 as stable112–119 in source-review.md. Current slice1 owns
112/114/117 through G16. Existing slice3 owns113/115/116/118/119 through G17,
including final-build backfill and bounded-payload recovery proof. This changes
no slice boundary and claims no unobserved new proof. Existing accepted proof
is reused only while boundary/implementation/setup/observations still match.

[Failure policy](../../../AGENTS.md#failing-and-flaky-tests).
