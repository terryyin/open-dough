# Replay evidence carried from plan 706

This is the exploratory slice 1 replay of SEED-401#pilot-new-retrospective-findings, published at `d6190e523`. It keeps what this plan still uses: the packet manifest, each reviewer's effort, and both arms' break-check decisions, which G1 reports. Arm A applied the current recording rule and arm B the [trial wording](trial-wording.md).

## Writer effort per reviewer

| Packet and arm | Tokens | Tool calls | Duration (ms) |
| --- | ---: | ---: | ---: |
| 01-A | 59011 | 6 | 72169 |
| 01-B | 58692 | 6 | 79947 |
| 02-A | 66675 | 6 | 63170 |
| 02-B | 66692 | 5 | 60092 |
| 03-A | 56978 | 4 | 66318 |
| 03-B | 57748 | 6 | 63655 |
| 04-A | 54941 | 5 | 52833 |
| 04-B | 54483 | 5 | 56082 |
| 05-A | 43697 | 5 | 30097 |
| 05-B | 43843 | 3 | 34931 |
| 06-A | 43568 | 3 | 36494 |
| 06-B | 43905 | 3 | 39195 |
| 07-A | 43231 | 3 | 34623 |
| 07-B | 43437 | 3 | 32555 |
| 08-A | 56677 | 6 | 28742 |
| 08-B | 51699 | 5 | 35391 |
| 09-A | 49502 | 5 | 45095 |
| 09-B | 50136 | 5 | 50373 |

## Packet manifest


Arm guidance: arms/A-current.md = Distribution source blob 49de76bfe (identical to Doughnut a23441f74 / Pygardon 7da34fc73 installed copy); arms/B-candidate.md = same file with the one admission sentence replaced by trial-wording.md candidate text. Shared instructions: reviewer-instructions.md. Model: same inherited model (claude-opus-5-5) for all 18 general-purpose reviewers, launched without fork/resume.

| Packet | Repo | Admitting commit (stripped) | Starting log | Execution-time evidence | Stripped |
| --- | --- | --- | --- | --- | --- |
| 01-doughnut-stale-bundle | doughnut | 1a852ab455 (added DD-250 to DearDough.md) | 1a852ab455^:DearDough.md | 1a852ab455:.planning/slice-plans/071-agent-note-candidates-and-cited-reads/PLAN.md (execution-complete note is execution-time product advice) | DD-250 entry; retirement 9e98f0874d |
| 02-pygardon-pinned-scripts | pygardon | a47436046 (DD-269 formatter; NOT 23a91623e) | a47436046^:DearDough.md | a47436046:.planning/slice-plans/353-historical-entry-ordering/PLAN.md + neutral notes from DD-269 Evidence/Observed effect lines | DD-269 heading, description, inference; later repairs 53a61a9ac |
| 03-pygardon-wrong-mount | pygardon | d82903415 | d82903415^:DearDough.md | d82903415:.planning/slice-plans/382-production-native-crash-monitoring/REPLACEMENT-INCIDENT.md | any later DD admission; later fixture proof |
| 04-doughnut-break-checks | doughnut | DD-443 entry, arrived as incoming in 9d49aeaea0 (SEED-113 execution, first impl 9868d40b3c) | 9d49aeaea0^:DearDough.md with DD-440..449 sections removed (awk) | neutral notes from DD-443 Evidence/description | DD-443 heading/“useful practice” inference; triage e461c372d9 |
| 05-tt-whitespace | terry-talks | 276b222 (first DD-001) | empty (no log before) | neutral notes from DD-001 Evidence/Observed effect | title, prescriptive description, inference |
| 06-tt-phone-render | terry-talks | 33bb07f (DD-001 reused) | empty (file absent at parent after prior wrap-up) | neutral notes | same |
| 07-tt-exports | terry-talks | fc30efe (DD-001 reused) | empty | neutral notes | same |
| 08-control-quiet | pygardon | 43473e5c2 (completion with no log change; chosen as first of last 200 completion commits on 7da34fc73 lacking a DearDough change whose plan said the retrospective found no new process finding) | 43473e5c2^:DearDough.md | 43473e5c2:.planning/slice-plans/532-guard-component-test-discovery/PLAN.md minus the line “Retrospective found no correction or new process finding.” | that verdict line |
| 09-control-matched | pygardon | a47436046 refactor-skip row (added under existing DD-246 “Fresh-agent refactor pass skipped for records-only slices”, starting-log line 424) | a47436046^:DearDough.md | neutral notes from that row | the row and its placement |

Limits: Terry Talks and 02/04/09 evidence are reconstructed from the admitted entries' observation lines (the only surviving execution-time record), so phrasing is shaped by the original writer. 06/07 starting logs: at 33bb07f^ and fc30efe^ DearDough.md does not exist (each prior wrap-up removed it), so empty is the faithful start.

## Break checks, arm A (current rule)

Decision:
- Implementers ran unrequested break checks (temporarily broke each claimed behavior, saw the new assertion fail, restored source) across slices 1, 2, 4 and 5: new DD-439. Recorded as a practice. It is the observed-red counterpart of ODF-147's reasoned-red problem, not an occurrence of it: ODF-147 records tests reasoned to fail, and here every check was observed.
- Briefs did not require the checks: not recorded separately. It is part of DD-439's description, and no evidence shows that the missing requirement cost anything in this execution.

Proposed log edit:
1. In the header metadata, replace `- Highest allocated local number: 438. Removed numbers are never reused.` with `- Highest allocated local number: 439. Removed numbers are never reused.`
2. Append after the DD-438 section, at the end of the file:

```markdown
## DD-439 — Implementers break each newly claimed behavior to observe its assertion fail, unrequested

Without a brief requiring it, implementers temporarily broke the product behavior each new mounted assertion claimed to observe, confirmed the expected test failed, and restored the source before returning. This observed red is the counterpart of ODF-147's reasoned red. Its value is qualified because no defect escaped either way.

### Occurrences
- Execution: SEED-113#assimilate-notes-with-a-clear-default-and-result (first implementation commit 9868d40b3c)
  - Timestamp: unknown (slices ran 2026-11-09 Asia/Singapore)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92
  - Evidence: slice 1 slot-before-title check (title bottom 526 vs action top 256, failed as intended); slice 2 removing the `watch(noteId)` reset failed exactly the two reset tests; slice 4 four checks (focus return, Escape, close-on-action, row CSS); slice 5 eight checks (sticky, overlay, popover direction, heading size, read-only guard, threshold 720, bar above blocker, no bar).
  - Observed effect: every check failed as intended and the source was restored; a few extra focused test runs per slice; all accepted proof passed; no defect escaped.
  - Inference: this execution does not show whether the checks caught anything that review would have missed. The practice is voluntary and its use may vary between implementers.
```

Decision supported:
- DD-439: whether to make observed break checks a required part of implementation briefs or returns, which would standardize the practice and address ODF-147, or leave them optional. The decision weighs the recorded cost (a few focused runs per slice, up to eight checks in one slice) against later occurrences that show whether a check caught an ineffective test. Any brief change should also cover the restore step so it does not repeat ODF-331's shared-checkout exposure.

Effort: about 5 tool calls. I read the instructions, guidance and packet, listed every log heading, searched the log for break/mutation/red-proof findings (only ODF-147 and ODF-331 are related, and neither matches), and checked the high-water metadata (438).

## Break checks, arm B (trial wording)

Decision:
- Unrequested post-implementation break checks (implementers temporarily broke the observed behavior, saw each new mounted assertion fail, then restored source): new DD-439. Unmatched: ODF-147 is the opposite problem (red proof reasoned rather than observed, leaving ineffective tests); here every check was observed and no ineffective test turned up. It qualifies for first-report admission as a practice with a named use beyond this execution. That use is evidence for or against requiring observed break checks in delegation briefs, which bears on the response to ODF-147.

Proposed log edit:
1. Line 7, change the high-water line to:
   `- Highest allocated local number: 439. Removed numbers are never reused.`
2. Append after the DD-438 section (end of file):

```markdown
## DD-439 — Implementers observed each new assertion fail against temporarily broken behavior without being asked

After implementing each slice, the implementers temporarily broke the product behavior that each new mounted assertion claimed to observe, confirmed that the expected test failed, and restored the source before returning. The briefs did not require this. Every check failed as intended and no ineffective test was found. This is the observed counterpart to ODF-147's reasoned red proof, but this run alone cannot show whether the practice prevents ineffective tests.

### Occurrences
- Execution: SEED-113#assimilate-notes-with-a-clear-default-and-result (first implementation commit 9868d40b3c)
  - Timestamp: unknown (slices ran 2026-11-09 Asia/Singapore)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.92
  - Evidence: slice 1 slot-before-title break (title bottom 526 vs action top 256, assertion failed); slice 2 removing the `watch(noteId)` reset failed exactly the two reset tests; slice 4 four checks (focus return, Escape, close-on-action, row CSS); slice 5 eight checks (sticky, overlay, popover direction, heading size, read-only guard, threshold 720, bar above blocker, no bar).
  - Observed effect: about 14 break checks across four slices, all failing as intended; a few extra focused test runs per slice; all accepted proof passed; no defect escaped.
  - Inference: the cost is small and per-assertion. The value is unmeasured because no check exposed an ineffective test. The practice came from the implementers, not from guidance, so it may not recur without a brief requirement.
```

Decision supported:
- DD-439: whether Open Dough delegation briefs (or the ODF-147 response) should require observed break checks for new mounted assertions. This occurrence gives the per-slice cost (a few focused runs) and a zero catch count over about 14 checks. Later occurrences that do or do not catch an ineffective test would settle whether to require the practice, recommend it, or leave it to implementer discretion.

Effort: about 4 tool calls. I read the instructions, guidance and packet, searched the log headings and related wording (break, mutation, red, temporary), and read ODF-147, ODF-312 and the tail of the log, including DD-347, DD-348 and DD-438 for the format and the high-water mark (438).
