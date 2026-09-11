# Slice 2 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` source after the 500-line
warning and 1,000-line ceiling were added. Date: 2026-09-11. These are local,
representative records, not native cross-tool acceptance. Output wording was not
used as a pass condition. The walkthrough applied
[Record supported process findings](../../../../../src/skills/dough-execution-retrospective/SKILL.md#record-supported-process-findings)
and
[bounded process-log recording](../../../../../src/skills/dough-execution-retrospective/references/bounded-process-log.md)
to disposable fixtures, then inspected fixture bytes with the counting command
below.

Each fixture is treated as a separate established project root. Process review
is default-on unless a skip variant says otherwise. This Open Dough worktree
still has no `.planning/open-dough.json`. Slice 2 does not replace, delete, or
recover content; overflowing candidates are refused.

## Counting command

Every line count below uses this command, which matches the skill: physical
text lines, including blanks and metadata, with a final unterminated line
counted once. It is **not** `wc -l`.

```bash
python3 .planning/quick/041-bound-process-log-and-configure-review/evidence/slice-2/count-physical-lines.py <file>
```

The script counts newline bytes plus one when the file has a non-empty
non-terminated tail. On [`500-existing/DearDough.md`](500-existing/DearDough.md),
`wc -l` reports 499 because the last human-note line has no newline; the
counting command reports 500. That file also contains blank padding lines.

## Recording journey

| Variation | Existing | Candidate / write | Recording result | Bytes |
| --- | --- | --- | --- | --- |
| 499 → 507 | [`499-existing/`](499-existing/) is 499 newline-terminated lines | Distinct matching occurrence from [`records/499-recurrence.md`](records/499-recurrence.md) (8 lines) | Recorded. **No** 500-line warning (existing was below 500 even though the result crosses 500). [`499-after/`](499-after/) measured at **507**. | After SHA-256 `2f02c0fd7b958fb61e65831fc6463c5ae2d6c44cd80f7c1b3365b099ba8a4495` |
| 500+ fits | [`500-existing/`](500-existing/) is 500 lines, blanks, unterminated last line | Distinct matching occurrence from [`records/500-recurrence.md`](records/500-recurrence.md); terminating the last line adds no counted line | **Warn** (existing ≥ 500) and record. [`500-after/`](500-after/) measured at 508. | After SHA-256 `175490895733e468dc06be6f0f7e7104d8e5b2908bca92bf5e1ca762bf64c303` |
| 999 → 1000 | [`999-existing/`](999-existing/) is 999 lines | One-line evidence continuation from [`records/999-fit.md`](records/999-fit.md) on the existing row | **Warn** and record. Candidate is exactly **1,000** and is accepted. [`999-after/`](999-after/) measured at 1000. | After SHA-256 `dbde4a6a60888659271204933deb2d5261cb1708156dbb4d387c1518c004c11a` |
| 1,001 refused | [`1000-existing/`](1000-existing/) is exactly 1000 lines | [`1001-candidate/`](1001-candidate/) measured at **1001** (one added evidence line) | `not recorded` — candidate exceeds the 1,000-line ceiling. [`1000-refused/`](1000-refused/) is byte-identical to existing. | SHA-256 `30bdd2a1aa33cc93b2b077f1b033381df71804b658bf27cc3e004028472f6371` before and after |
| 1,020 existing-violation | [`1020-existing/`](1020-existing/) is 1020 lines (includes blanks) | [`1020-candidate/`](1020-candidate/) measured at 1028; this slice cannot form a bounded candidate | `unchanged` — existing-violation; no write; no repair claimed. [`1020-refused/`](1020-refused/) is byte-identical. | SHA-256 `5a1fb73a6fa0c0ccf3097fe14c7a4266aa0c71c11315a251e92f463f9b90bea9` before and after |
| No findings | Same bytes as 500-existing | Enabled process review, no supported finding | No-op: no size warning, no ceiling check, log unchanged | SHA-256 `ec6fc2795cb5498056b54c7e684910d12e7596bcec5f73e4169ac530962bb0ac` |
| Identical rereview | Same 500-existing log and `record:slice-2-base` | Identical rereview of [`records/base.md`](records/base.md) | No-op: no edit, no size warning | Same SHA-256 as 500-existing |
| Skip config `true` | [`skip-config/`](skip-config/) has `{"skipProcessRetrospective": true}` and the 1020-line log | Ordinary retrospective | Process skipped before log or size inspection. Log unread. | Log SHA-256 unchanged `5a1fb73a6fa0c0ccf3097fe14c7a4266aa0c71c11315a251e92f463f9b90bea9`; config SHA-256 `73f44453acd237914482d4699e74628efd58419a9ea9f8c7d7dfbf81e42fa20a` |
| `--skip-process` | [`skip-flag/`](skip-flag/) has config `false` plus `--skip-process`, 1020-line log | Explicit skip wins | Process skipped before log or size inspection. Log unread. | Log SHA-256 unchanged; config still `false` `6e389c38249771b211b6215cd05e50a1a1c021ad8c943e2630f53e1bdc4d0602` |

Harness checksums for every fixture file are in
[`checksums.fixtures`](checksums.fixtures). Measuring skip-variant logs here is
harness verification of unchanged bytes, not the skill inspecting size.
Skipped selection reuses Slice 1's
[Select reviews](../../../../../src/skills/dough-execution-retrospective/SKILL.md#select-reviews)
rule: no process analysis and no `DearDough.md` resolve/read/write.

## Behavior review

1. **Invocation context.** Description names the 500-line warning and
   1,000-line ceiling beside process recording. The recording section loads the
   size/write reference only for an enabled process write. Skip flags and
   stored process preference still select reviews first.
2. **Required context.** A candidate write needs an interpretable log and a
   complete candidate whose physical line count can be measured, including
   blanks, metadata, and an unterminated last line. Missing or skipped process
   selection still stops before any log or size inspection.
3. **Useful outcome.** 499→507 recorded with no threshold warning. Existing 500
   and 999 warned and recorded within the ceiling, including an accepted
   1,000-line candidate. A 1,001-line candidate and a 1,020-line existing file
   stayed byte-identical with `not recorded`/`unchanged` reasons. No-findings,
   identical rereview, and skipped process did not treat size inspection as a
   write.

ADR 0006: one size/write rule lives in
`src/skills/dough-execution-retrospective/references/bounded-process-log.md`.
Recording links to it instead of repeating counting, warning, and ceiling
steps. Description, heading, and path language address the executing project.
Maintainer terms stay in the recognition record. Slice 3 is not implemented here.
