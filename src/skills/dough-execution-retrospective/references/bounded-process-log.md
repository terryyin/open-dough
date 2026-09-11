# Bound process-log recording

Use this after [Select reviews](../SKILL.md#select-reviews) has enabled process
review and the recording rules have produced a supported edit. Do not load it
to skip process review, inspect a skipped or unresolved log, or size-check a
no-op.

## Count physical lines

Count every physical text line in the existing file and in the complete
candidate, including blank lines, headings, descriptions, occurrence rows, human
notes, and any other metadata. A final line that is not newline-terminated
counts once. An empty or missing file is 0 existing lines. Terminating an
unterminated last line does not add a line; new content after that terminator
does. Do not use `wc -l` as the definition; it misses an unterminated last line.

## Candidate-write flow

1. Construct the complete candidate, including blanks, metadata, and the
   intended last line, before touching the file. Keep ordinary maintenance: do
   not delete, reorder, migrate, or merge existing content to make room.
2. Measure the existing file with the same count. If it already exceeds 1,000
   lines, leave it unchanged and report an existing-violation. Do not write,
   and do not claim repair.
3. Measure the complete candidate. A successful write may be at most 1,000
   lines. Exactly 1,000 is allowed; 1,001 is not. If the candidate would exceed
   1,000 lines, refuse it: return the supported finding and leave the file
   unchanged. Do not replace, delete, or recover content to make room.
4. If the existing file is already at least 500 lines and this write is
   accepted, include a 500-line threshold warning in the recording result.
   Below 500, do not emit that warning, even when this write will cross 500.
5. Write the accepted candidate once. Preserve the existing file on failed
   validation or write; do not truncate first and reconstruct afterward.

## Recording result

For an accepted write, report the canonical path, created or updated issue IDs
with occurrence rows, the measured final size, and the 500-line warning when
step 4 applies.

For a refused ceiling, existing-violation, failed validation, or failed write,
report `not recorded` or `unchanged` with the reason. Never describe those cases
as successful writes.
