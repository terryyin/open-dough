# Reject malformed self-installation records completely

## Source

Execution retrospective of completed
[Plan 028](../028-prevent-self-installation-drift/PLAN.md), specifically Slice 3's
promise to reject malformed records and Slice 4's use of that result as the
release-finalization gate. Parent:
[SEED-004 Story 5](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor).
This is a bounded correction of that outcome, not another execution of Plan 028.

Original execution-ready revision: `57f3ac2`. Reviewed execution commits:

| Commit | Inclusion evidence |
| --- | --- |
| `c080df5` | Slice 1 source-edit boundary and plan progress |
| `bd9e0e8` | Delivered CI failure repair and execution receipt |
| `517ddee` | Slice 2 read-only payload comparison |
| `e46ef16` | Slice 3 checker, CI integration, portable repair follow-up |
| `69b3731` | Slice 4 release-finalization gate |
| `7bd7fa2` | Completion and observer shutdown evidence |

The selected patches were reviewed together, with product files inspected at
`7bd7fa2`. Interleaved `591814b`, `acea6bd`, `2bf0ee1`, and `275e732` are backlog,
other-story refinement, and Plan 029 work; they are excluded from the product
review. The original plan's five slices remain done.

## Goal and scope

An Open Dough maintainer gets a failed self-installation check when VERSION or
SOURCE contains extra nonempty data after a blank line, so malformed records
cannot silently authorize release finalization.

Included: complete validation of the installed records consumed by the checker,
root/path diagnostics, and read-only rejection proof. Reuse the existing record
readers and preserve the updater's intended refusal and force policies. Any
shared-reader change must retain valid-record compatibility.

Excluded: a new record format, source URL identity policy, payload declaration
redesign, automatic self-update, the maintainer-owned `a8955b3` historical
fixture, process retrospective, and unrelated cleanup. Source release-metadata
parsing is outside this correction unless required by the same implementation.

## Key examples and proof ownership

All examples belong to Slice 1 and run through the checker in an isolated local
repository, with before/after snapshots establishing no target writes.

| Precondition | Trigger | Result |
| --- | --- | --- |
| Matching installed payload and valid records in both roots | Run checker | Exit 0 |
| VERSION contains `0.3.3\n\nextra\n` | Run checker | Nonzero; name affected VERSION path |
| SOURCE contains its valid first line, a blank line, then extra data | Run checker | Nonzero; name affected SOURCE path |
| Same malformed content in the other native root | Run checker | Same rejection contract with that root's path |
| Source-only guidance edit and unchanged valid installations | Run checker | Exit 0 |

Exercise trailing data both with and without a final newline. Do not invent a
stricter whitespace-only policy beyond what is needed to reject extra data.

## Execution context and decisions

- Use the repository's existing shell fixtures, without network access for the
  checker proof. Status vocabulary: `planned`, `in-progress`, `done`.
- Inherit Plan 028's 30-minute slice target and 60-minute hard limit, with only
  a stated focused-test run or external CI wait exception. After two overruns,
  reassess the story before further slice refinement.
- Follow installed `dough-execute-plan` for later execution, refactoring, commit,
  and CI delivery. Recheck checkout ownership and hooks at execution start;
  this retrospective authorizes no implementation, commit, or push.
- Focused proof: `bash tests/self-installation-baseline.sh`. If shared record
  readers change, also run `bash tests/update-refuses-unverifiable.sh` to protect
  the ordinary updater's refusal and preservation behavior. Normal wrap-up uses
  the repository's required `npm test` and `npm run lint` checks.
- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  preserves immutable release identity and source/installation separation.
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) requires
  deterministic error-case and preservation checks. No decision change is needed.

## Ordered slices

### 1. Reject extra data anywhere in installed records

Type: Behavior
Status: planned
Proof: Extend the isolated checker scenarios above; establish failing rejection
assertions before fixing parsing, then green rejection and valid-record cases.

Behavior: Given an otherwise matching self-installation with extra record data
after a blank line, when the maintainer runs the checker, it fails with the
affected record path and leaves the target unchanged. The same command remains
the CI and release-finalization gate.

Inspect `read_record` and `read_source_record` in
`src/install/open-dough-release-version.sh`; make them inspect the complete
record rather than silently discarding the third and subsequent lines. Keep
one implementation per record rule, with no checker-specific parser copy.
Retain existing successful input handling and missing/malformed diagnostics.

Sizing: one parser rejection rule and one outside-in proof loop; expected within
30 minutes, medium confidence. Ready for direct execution; no separate Structure
slice or refinement pass is needed.

## Learnings

On 2026-09-09, a local clone of `7bd7fa2` passed the checker (exit 0) separately
with VERSION `0.3.3\n\nunexpected trailing record data\n` and with a valid SOURCE
first line followed by `\nunexpected trailing source data\n`. Both readers only
read the first two lines and accept an empty second line. The defect predates
Plan 028's parser reuse but is exposed by its new malformed-record gate promise.
It remains present at the current review boundary; unrelated working-tree edits
do not change the readers or checker.

The existing self-installation, compare-payload, and release-finalization-gate
focused tests passed during review. They do not cover this counterexample.
This plan is generated, not executed.
