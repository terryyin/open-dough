# Reject malformed self-installation records completely

## Source

Execution retrospective of completed
[Plan 028](../028-prevent-self-installation-drift/PLAN.md), specifically Slice 3's
promise to reject malformed records and Slice 4's use of that result as the
release-finalization gate. Parent:
[SEED-004 Story 5](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#extract-plan-execution-with-ci-monitor).
This is a bounded correction of that outcome, not another execution of Plan 028.

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

## Execution context and decisions

- Status vocabulary: `planned`, `in-progress`, `done`.
- Repository/workflow: `terryyin/open-dough`, branch `main`, workflow `ci.yml` /
  `CI`.
- Focused proof: `bash tests/self-installation-baseline.sh`. Shared-reader
  regression: `bash tests/update-refuses-unverifiable.sh`. Wrap-up: `npm test`
  and `npm run lint` via hooks/CI; selective format `npm run format`.
- CI observer (Cursor mailbox): directory `/tmp/dough-ci-501/watch-JFkVF1`.

## Ordered slices

### 1. Reject extra data anywhere in installed records

Type: Behavior
Status: done
Proof:

```
proof:
  command: bash tests/self-installation-baseline.sh
  covers: checker rejects VERSION/SOURCE trailing data in both native roots with and without final newline; names affected paths; valid matching and source-only cases still pass; no target writes
  result: pass

proof:
  command: bash tests/update-refuses-unverifiable.sh
  covers: ordinary updater refusal/preservation with shared record readers after complete-record inspection
  result: pass
```

Behavior: Given an otherwise matching self-installation with extra record data
after a blank line, when the maintainer runs the checker, it fails with the
affected record path and leaves the target unchanged. The same command remains
the CI and release-finalization gate.

`read_record` and `read_source_record` in
`src/install/open-dough-release-version.sh` now consume any remainder after the
first two lines and reject nonempty trailing content. One implementation per
record rule; no checker-specific parser copy.

## Learnings

- Pre-fix readers accepted a blank second line and discarded later lines, so
  trailing data after a blank line falsely passed the Plan 028 malformed-record
  gate. Shared complete-record inspection closes that gap for checker, updater,
  and release-finalization consumers.
