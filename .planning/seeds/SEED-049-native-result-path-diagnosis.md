---
id: SEED-049
status: active
planted: 2026-09-27
planted_during: Refinement of SEED-046#ci-verdict-round-2
trigger_when: A native-runner check fails without saying why, or another check copies the result-path parse
scope: 1 story
---

# SEED-049: Say why a native-runner check found no result

## Why This Matters

Several shell checks drive the native-agent wrapper and read the attempt
directory it reports on a `result-path:` line. When the wrapper prints no such
line, `tests/support/native-updated-use-adapter-assert.sh`'s `run_selected`
ends in `parse_result_path`, which exits 1 without a message, so
`tests/native-delivery-updated-use-adapters.sh` fails with no explanation.
The updated-use check gained a diagnostic for this during SEED-037; the
adapters check did not. The same `awk` parse is copied into about six
scripts, so each copy can drift. The cost is slow diagnosis, not a false
pass: the check still fails.

## Alternatives and Decision

Give the parse one shared helper that names the command and shows its output
when no result path appears, and use it everywhere. The simpler alternative,
adding the diagnostic to the adapters check alone, leaves the copies to drift
again.

## Stories

<a id="native-result-path-diagnosis"></a>

### Explain a missing native result path in every check that reads one

**Identity:** SEED-049#native-result-path-diagnosis
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A maintainer whose native-runner check fails because the wrapper
reported no result path sees which run produced none and that run's output,
in every check that reads one, instead of a bare failure.

**Scope (to confirm in refinement):** one shared result-path reader for the
checks under `tests/` that parse `result-path:` (among them
`tests/native-result-retention.sh`, `tests/native-run-timeout.sh`,
`tests/native-run-workspace-isolation.sh`,
`tests/native-stream-completeness.sh`, `tests/native-runner-failures.sh`, and
the two `tests/support/native-updated-use-*-assert.sh` helpers); the adapters
check's `run_selected` reports a missing result path like the updated-use
check does.

## When to Surface

Now: queued after SEED-046, split from its leftovers by the maintainer on
2026-09-27.

## Breadcrumbs

- Leftover recorded in SEED-037's correction plan, recoverable at
  `f10d52e:.planning/slice-plans/117-observer-stop-and-test-infrastructure-cleanup/PLAN.md`.
