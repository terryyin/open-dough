# Slice 1 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` source after first-log
recording was enabled. Date: 2026-09-10. These are local, representative records,
not native cross-tool acceptance. Output wording was not used as a pass condition;
the walkthrough inspected file state and the meaning of each recording result.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): events R2, R4, and R6 each reopen the same Quick 034 plan
  path and commit-membership evidence. No token count is present. Stable identity:
  canonical plan `Quick 034` plus first implementation commit `7650585`.
- [Useful practice](records/process-map.md): events P1 through P3 use one compact process map throughout
  Quick 036 Slice 1. It has no implementation commit, so the supplied stable
  execution-record reference is `record:quick-036-slice-1` alongside canonical
  story `SEED-010 Story 1`.
- [Unsupported record](records/unsupported.md): it says only that the review felt slow; it identifies no
  repeated work, observed effect, stable execution evidence, or decisive event.

## First canonical log

The repeated-recovery record was reviewed with process and product enabled in a
disposable project with no existing log and no location override. The recording
result was: created `<project-root>/DearDough.md`; `DD-001`, one occurrence.

Inspection of [`default/DearDough.md`](default/DearDough.md) confirms the
canonical heading, concrete description, stable execution identity, compact
decisive evidence, observed effect, and qualified inference. It has one
occurrence row and no redundant total. The missing token count is not fabricated.

## Explicit location override and product skip

The useful-practice record was reviewed with `--skip-product`. Project convention
explicitly set `<project-root>/feedback/process/DearDough.md`; the root default
did not exist. The recording result was: created the explicit canonical path;
`DD-001`, one occurrence.

[`override/feedback/process/DearDough.md`](override/feedback/process/DearDough.md)
is the captured file. It records the stable record identity and qualifies the
practice's unproven generality. Product skipping did not suppress process review
or recording.

## Refusal boundaries

| Variation | Observed file state | Recording result |
| --- | --- | --- |
| No supported finding | No `DearDough.md` created | `not recorded — no supported process finding` |
| `--skip-process` | [`skip/DearDough.md`](skip/DearDough.md) remained byte-identical and was not read as review context | Process result and destination result omitted |
| Missing identity | No `DearDough.md` created; supported finding stayed in the response | `not recorded — stable execution identity unavailable` |
| Conflicting location | Neither proposed destination was read or written | `not recorded — canonical location is conflicting` |
| Existing log | [`existing/DearDough.md`](existing/DearDough.md) remained byte-identical | `unchanged — existing-log maintenance is not available yet` |
| Failed write | `write-failure/canonical-parent` is a regular file, so its child `DearDough.md` could not be created | `not recorded — write failed`; implementation and product results still returned |

No variation claimed a successful write. No product-only or implementation
finding entered either created log, and unrelated fixture files were unchanged.

## Behavior review

1. **Invocation context.** Frontmatter names process recording; review selection
   gates logging before any location access, and product skip is independent.
2. **Required context.** The skill requires one canonical project location and a
   stable execution identity, defines both fallbacks, and stops only recording
   when either is missing or conflicting.
3. **Useful outcome.** A supported first finding produces readable, countable
   local evidence. Every unsupported, skipped, refused, or unsuccessful path is
   distinguishable from success and preserves the destination.

Slice 2 owns reading and maintaining an existing interpretable log. This slice
therefore refuses that write rather than appending or overwriting uncertain state.
