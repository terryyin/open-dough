# Source review — SEED-182#standardize-test-optimization-candidates

**Launch:** fresh general-purpose reviewer, no conversation inheritance; supplied
only the selected story's Goal, Scope, key examples, deferred promises,
exclusions, safe stopping point, and architecture note. Instructed to read no
other project files and change nothing.

**Input:** story section
`.planning/seeds/SEED-182-standardize-test-optimization-candidates.md#standardize-test-optimization-candidates`
(verbatim Goal through Architecture note as in the reviewer prompt).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer or agent running test optimization, resolving its recorded findings, or closing a story that touched them finds, writes, and interprets every finding in one standard project record. | slice 3 | |
| 2 | Accepted slow-test costs and transferred obligations survive plan cleanup, so a later pass consults earlier decisions instead of rediscovering them from a spent plan or a conversation. | slice 3 | |
| 3 | The record is the project's `.planning/TEST-OPTIMIZATION-CANDIDATES.md`, headed exactly `# Test Optimization Candidates`. | slice 1 | observed: src/skills/dough-test-optimization/references/candidate-record.md path and heading |
| 4 | One reference in the optimization skill defines its format and lifecycle; the optimization pass, `--resolve`, and story wrap-up link to that definition instead of restating it. |  | G1 |
| 5 | The record is a problem list with a discharge summary, not a history log. | slice 1 | observed: candidate-record.md opening paragraphs |
| 6.1 | Section `## Latest pass` — the most recent pass only, replaced by the next one | slice 1 | observed: candidate-record.md Sections |
| 6.2 | Section `## Pending candidates` — proposed changes not yet implemented or decided, including those awaiting a named human decision | slice 1 | observed: candidate-record.md Sections |
| 6.3 | Section `## Accepted necessary costs` — cost judged inherent to unique protected behavior | slice 1 | observed: candidate-record.md Sections |
| 6.4 | Section `## Profile-only exclusions` — exclusions actually applied through the project's existing mechanism, naming that mechanism and its scope | slice 1 | observed: candidate-record.md Sections |
| 6.5 | Section `## Transferred obligations` — candidates whose work now lives in a named replacement story or plan | slice 1 | observed: candidate-record.md Sections |
| 7.1 | Latest pass includes command and scope | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.2 | Latest pass includes revision | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.3 | Latest pass includes comparable before/after wall time and executed case counts when available | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.4 | Latest pass outcome stated as measured gain, no demonstrated gain, or incomplete measurement | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.5 | Latest pass includes measurement limits | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.6 | Latest pass includes evidence links | slice 1 | observed: candidate-record.md Latest pass fields + template |
| 7.7 | Raw profiles stay outside the record | slice 1 | observed: candidate-record.md opening + Latest pass |
| 8 | Acceptance under Accepted necessary costs is a decision record only: it filters, skips, or excludes nothing, and normal verification and CI keep running the test. | slice 1 | observed: candidate-record.md Accepted necessary costs + SKILL.md baseline |
| 9 | A transferred-obligation entry stays as a pointer until that work closes; it never claims the replacement was implemented. | slice 1 | observed: candidate-record.md Transferred obligations |
| 10 | Each finding is a `###` entry whose heading is a short kebab-case slug, unique in the record and kept unchanged when the entry moves between sections. | slice 1 | observed: candidate-record.md Entry shape |
| 11.1 | Finding field: test locations and scope | slice 1 | observed: candidate-record.md labeled fields |
| 11.2 | Finding field: observed cost with measurement conditions | slice 1 | observed: candidate-record.md labeled fields |
| 11.3 | Finding field: unique protection | slice 1 | observed: candidate-record.md labeled fields |
| 11.4 | Finding field: alternatives attempted | slice 1 | observed: candidate-record.md labeled fields |
| 11.5 | Finding field: disposition and rationale | slice 1 | observed: candidate-record.md labeled fields |
| 11.6 | Finding field: date | slice 1 | observed: candidate-record.md labeled fields |
| 11.7 | Finding field: needed human decision (when one is pending) | slice 1 | observed: candidate-record.md labeled fields |
| 11.8 | Finding field: links to evidence or follow-up work | slice 1 | observed: candidate-record.md labeled fields |
| 12 | An empty section holds exactly `None.` | slice 1 | observed: candidate-record.md empty-section rule + template |
| 13 | A record with every finding section at `None.` is an explicit empty record. | slice 2 | observed: resolving-candidates.md empty finding sections report |
| 14 | A missing record means no pass has recorded findings in this project. | slice 1 | observed: candidate-record.md Missing file |
| 15 | `--resolve` reports a missing record without creating the file. | slice 2 | observed: resolving-candidates.md missing-file report without create |
| 16 | A pass that records a summary or finding creates the record from the defined format; it needs no pre-existing file. | slice 1 | observed: candidate-record.md Missing file + SKILL.md Verify and close |
| 17 | A record that cannot be read or does not match the format stops the write and is reported; it is never overwritten or guessed at. | slice 1 | observed: candidate-record.md Unreadable or mismatched + SKILL.md writes via reference |
| 18 | Every pass that ends with findings — default or profile-only — writes its latest-pass summary and its candidates to the record, not only to its plan. | slice 1 | observed: SKILL.md profile-only + Verify and close |
| 19 | Later passes and `--resolve` read the record first, preserve recorded decisions, and move an accepted cost back to pending only with new evidence. | slice 2 | observed: resolving-candidates.md read first + preserve decisions; SKILL.md later-pass baseline |
| 20 | `--resolve` moves each resolved entry to its disposition section (accepted cost, applied exclusion, or transferred obligation) or keeps it pending with its human decision. | slice 2 | observed: resolving-candidates.md disposition outcomes |
| 21 | Wrap-up, before deleting a spent plan, moves any optimization finding that exists only in that plan into the record. | slice 3 | |
| 22 | When the closing story or plan is the receiver of a transferred obligation, wrap-up removes that entry once its work is done, or returns any unfinished part to pending candidates. | slice 3 | |
| 23 | The record format and lifecycle have one owner: a reference under the optimization skill. The optimization skill, its `--resolve` reference, and story wrap-up link to it. |  | G1 |
| 24 | The file and guidance are useful on their own (safe stopping point). | slice 1 | observed: candidate-record.md + SKILL.md write/consult path without requiring resolve/wrap-up |
| E1 | New pass, no record → creates record with latest-pass summary, pending finding with labeled fields, `None.` in other finding sections. | slice 1 | observed: behavior-review walk in plan slice 1 proof |
| E2 | Resolve to accepted cost → same slug moves to Accepted necessary costs; test still runs; no Profile-only exclusions without a mechanism. | slice 2 | observed: behavior-review walk in plan slice 2 proof; resolving-candidates.md Accepted necessary cost |
| E3 | Resolve to replacement plan, then clean up → transferred entry links plan; survives wrap-up of original; removed when replacement story wraps with work done. |  | G3 |
| E4 | Later pass consults accepted-cost entry and does not re-propose without new evidence; summary replaces Latest pass. | slice 1 | observed: behavior-review walk in plan slice 1 proof; SKILL.md baseline + Verify and close |
| E5.1 | All finding sections `None.` → `--resolve` reports an empty record. | slice 2 | observed: resolving-candidates.md empty-record report |
| E5.2 | No file → `--resolve` reports that no findings have been recorded. | slice 2 | observed: resolving-candidates.md missing-file report |
| E5.3 | Mismatched heading or sections → stops and reports without editing. | slice 1 | observed: candidate-record.md Unreadable or mismatched; resolving-candidates.md defers stop-without-edits to that reference |
| D1 | Automatic expiry or periodic re-review of accepted costs is deferred. |  | G4 |
| D2 | A history of earlier passes beyond Git history is deferred. |  | G5 |
| D3 | A script that validates or rewrites the record is deferred. |  | G6 |
| D4 | This story does not implement the recorded optimization candidates. |  | G7 |
| D5 | This story does not introduce a new test-runner exclusion mechanism. |  | G8 |
| X1 | Do not inspect, rewrite, relocate, or automatically migrate existing findings or file structures in maintained projects as part of this story or its update rollout. |  | G9 |
