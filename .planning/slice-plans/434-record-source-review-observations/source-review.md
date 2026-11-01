# Source review — SEED-010#record-source-review-observations

**Launch:** fresh general-purpose reviewer; source-only; no plan, return, product, or proof; no conversation inheritance.
**Input:** selected story Goal, Scope, key examples, Evidence, and Evaluation from
`.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#record-source-review-observations`
(no human amendments).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Through one supported operation, retain commitments, slice allocations, and observations for a planned-execution source review. | slice 1 | observed: story-obligations.mjs record CLI + story-obligation-source-review-record.mjs |
| 2 | That operation's authored records are accepted by the existing obligations reader (no reinterpretation required for reader acceptance of valid output). | slice 1 | observed: write.test.mjs check after record; existing source-review*.test.mjs suites |
| 3 | Recording does not require hand-built Markdown cell escaping. | slice 1 | observed: escapeCell + ODF-391 write.test.mjs pipe/quote path |
| 4 | Recording does not reinterpret Slice versus obligation fields. | slice 1 | observed: ODF-381 write.test.mjs empty Slice + G1 in observation cell |
| 5a | Support settling, for an identified commitment, an observation. | slice 1 | observed: record --observed write.test.mjs |
| 5b | Support settling, for an identified commitment, a slice allocation. | slice 1 | observed: record --slice write.test.mjs allocate path |
| 5c | Support settling, for an identified commitment, a linked obligation. | slice 1 | observed: record --obligation + entry fields ODF-381 write.test.mjs |
| 6a | When settling, do not change source commitment text. | slice 1 | observed: renderCommitmentRow keeps current.text; ODF-391 unrelated/source assertions |
| 6b | When settling, do not change commitment IDs. | slice 1 | observed: next.id = current.id; unknown-commitment refuse for missing |
| 6c | When settling, do not change earlier unrelated observations. | slice 1 | observed: correction + ODF-391 tests leave other rows' observed intact |
| 6d | When settling, do not change human decisions. | slice 1 | observed: record updates only named commitment / supplied entry; plan bytes unchanged on observe-only |
| 7 | Accept existing valid records. | slice 1 | observed: list/check suites unchanged; observe-only leaves valid plan Story obligations intact |
| 8 | Refuse ambiguous identities or stale input. | slice 1 | observed: unknown-commitment and stale-input write.test.mjs |
| 9a | On refusal, leave file bytes intact. | slice 1 | observed: byte equality assertions on unknown/stale refuse |
| 9b | On refusal, perform no partial write. | slice 1 | observed: refuse before replaceFiles; dual-file stale leaves both bytes intact |
| 10 | Refuse using the existing refusal vocabulary. | slice 1 | observed: unknown-commitment, stale-input, unlinked-source-review, unreadable-source-review reasons |
| 11a | Reuse current source-review.md Commitments table. | slice 1 | observed: replaceCommitmentLine on Commitments table |
| 11b | Reuse plan Story obligations record. | slice 1 | observed: upsertObligationEntry under ## Story obligations |
| 11c | Reuse readers. | slice 1 | observed: readSourceReview / readStoryObligations validate before/after write |
| 11d | Reuse refusal vocabulary. | slice 1 | observed: same problem reasons as check/list family |
| 12a | Evaluation must replay one retained observation-cell case through the ordinary coordinator-facing recording path, then the unchanged consuming checks. | slice 1 | observed: ODF-391 write.test.mjs record then check; hand-unescaped still malformed-commitment |
| 12b | Evaluation must replay one Slice/Reported case through the ordinary coordinator-facing recording path, then the unchanged consuming checks. | slice 1 | observed: ODF-381 write.test.mjs record then check |
| 13 | Compare required edits/retries with the recorded hand-edit path and retain actual effort and limits. | slice 1 | observed: write.test.mjs single-pass record vs hand-unescaped refusal (effort: one record call; limit: hand path still fails check) |
| 14a | At closure, record at both addressed findings (ODF-391 and ODF-381) the actual response revision. |  | G1 |
| 14b | At closure, record at both addressed findings the first containing release (or explicitly unreleased status). |  | G1 |
| 15 | Later ordinary use remains a separate observation (not conflated with closure evidence under 14). |  | G2 |
