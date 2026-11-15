---
id: SEED-378
status: active
planted: 2026-11-16
planted_during: SEED-374 wrap-up
trigger_when: selected from the product backlog
scope: story
---

# SEED-378 — Restore three-share test budget headroom

<a id="restore-three-share-test-budget-headroom"></a>

### Restore three-share test budget headroom

**Identity:** SEED-378#restore-three-share-test-budget-headroom
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Contributors can land changes with the Distribution suite passing
its existing three-share CI budgets, without losing the behavior its tests
protect. The developer requested a separate optimization after closing the
stale-estimate story with a one-time exception for its aggregate budget failure.

**Outcome:** Find and prove sufficient cost reduction for the maintained CI
proof to pass with three shares, the existing 64-second per-job and 926-second
per-share normalized ceilings, and existing behavioral assertions. Leave budget
enforcement and the CI matrix unchanged. Select the implementation through
fresh measurement; these leads are not an executable plan.

**Starting evidence:** [CI run 43733461911, attempt 1](https://github.com/terryyin/open-dough/actions/runs/43733461911)
at `c4259d055cfe87bdac9361c2e35df8eaf0387900` passed test assertions but failed
two aggregate ceilings: normalized shares 900.05 / 953.19 / 938.40 seconds,
so shares 2 and 3 exceeded 926 by 27.19 / 12.40 seconds. Their combined
2791.64 seconds exceed three-share capacity 2778 by 13.64 seconds even with
perfect balancing. No single dominant cause was established. The refreshed
list predicted only 17.5 / 17.5 / 17.6 seconds of headroom (about 1.9%).
Three tests added by the predecessor contributed 1.6 observed source seconds;
that does not establish them as the cause of the larger overages.

**Protected behavior and retained improvement:** The native-comparison family
exercises real installations, baseline reuse/invalidation and complete payload
identity. The existing release-source materializer reduced its fixture from
6849 to 391 files while preserving all 370 declared paths and source bytes.
All 11 fixture consumers and the complete-payload witness passed. Baseline
misses improved locally 62.58 → 53.22 seconds; CI still exceeded both totals.
Keep that published improvement and its real-installer protection.

**Unfinished analysis transferred here:**

- Installation breadth: a rejected local trial installed two declared paths
  for baseline scenarios while preserving all 370 shipped/frozen source paths;
  full-pair scenarios still installed all 370. Reuse/misses wall time fell
  89.73 → 72.07 seconds, individual jobs 47.2 → 38.7 and 42.4 → 33.3, on
  macOS/AC/Bash 5/one job with uncontrolled caches and load 6.16 → 4.34.
  Its model still put share 2 at 945.53 seconds; other nine consumers were
  not rechecked, so it was restored rather than published. The exact rejected
  trial is [retained as evidence](SEED-378/installation-breadth-trial.patch.gz).
  One declared path alone fails because `write_certified_records()` needs
  `dough-update/SKILL.md`'s installed directory. Further analysis must retain
  real installation and invalidation coverage, not assume this trial is safe.
- Identity hashing: local instrumentation of
  `Distribution/tests/native-harness/native-evidence-identity.sh` and
  `Distribution/tests/git-publication/git-publication-fixture-identity.sh` observed 521 `shasum` calls
  totaling 5.809 seconds across 19.94 seconds of local wall time; CI jobs were
  32.8 / 30.4 seconds. Wrapper overhead was uncalibrated. Thirty empty-input
  launches took 0.30 seconds with `shasum`, 0.05 with available `sha256sum`,
  with matching digests. This is an unimplemented lead, not proof of sufficient
  savings or portability. Preserve batched input hashing and portable fallback.
- Import closure: 90 calls measured about 4.10 local seconds (5.15 including
  startup), insufficient evidence for the remaining share-2 gap. No parser
  change was made. Do not repeat this lead without new dominance evidence.

**Next decision:** Recheck current CI timings, rank a bounded opportunity by
removable cost and unique protection, and select a proof-preserving experiment.
Demonstrate the actual CI result after the change; local models alone do not
establish that the budget passes. The predecessor's exception applies only to
its landing, never to this story or future failures.

Follow the [failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Long local proof uses Bash 5 and `caffeinate -s -i` while awake on AC, under
[machine sleep on macOS](../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
