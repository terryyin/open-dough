# Slice 1 calibration receipt — failed scoring feasibility, no prospective case

Known constructed examples only. No independent historical reconstruction and no
prospective enrolment. Source commitments: C7,C15,C16,C17,C18,C19 (coordinator map).
Both arms preserved F1–F6 and common facts; B's three navigation groups only link
those same rows. There are no evidenced noise exclusions or category classifiers.

## Dispatch, returned reports and observed timing

| Arm/task | Clock before dispatch | Clock after observed return | Observed interval | Budget observation |
| --- | --- | --- | --- | --- |
| A /root/trial_calibration/calibration_a | 2026-10-29T06:27:13Z | 2026-10-29T06:28:24Z | 71s / 1.1833min | 60s cap not demonstrated |
| B /root/trial_calibration/calibration_b | 2026-10-29T06:28:24Z | 2026-10-29T06:29:14Z | 50s / 0.8333min | Observed within 60s |

Clock receipts are tool observations surrounding native spawn/return, not native
per-task completion timestamps. A was already delivered at 06:28:15–06:28:24
before the latter clock; completion/queue latency is unavailable. Retain 71s as a
conservative observed charge; do not claim exact active time or silently trim it.
Both fresh tasks used fork_turns=none, no model override, same requested defaults,
access and budget, sequential A then B. Resolved model/configuration, queue load,
token usage and money unknown. Requested sameness is verified; hidden settings are
not. Each reviewer reports one shell read through one orchestration call, no other
lookups/tests/edits/history/delegation, and exactly three allowed inputs inspected.

Exact task prompt template (substitute X=A/B and DISPATCH from table; no other
prompt change):

> Known-example calibration host smoke only; finish within 60 seconds of dispatch, including tools/waits. Working directory /Users/terryyin/git/open-dough/.worktrees/consumer-handoff-trial. Read ONLY .planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md, .planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-X.md (ASSIGNED_PACKET), and its CALIBRATION-COMMON.md. Follow the brief exactly. Do not enumerate siblings or inspect another packet, assessor/reference or reports. No tests, edits, historical retrieval or delegation. Return the requested scored known-case gaps, evidence limits and inspected-input/tool counts. Same requested host/default model/settings; no model override. Dispatch clock observed DISPATCH; no inference of unseen host settings.

The brief at read time is now preserved byte-for-byte as REVIEWER-BRIEF-V1.md.
Full native returned texts: CALIBRATION-A-RESULT.md and CALIBRATION-B-RESULT.md.

## Inspection, limits and disposition

Both reports specifically caught the indirect broker-flat observer, qualification
startup boundary observer and unsupported publication semantic-review claim.
Both rejected complete coverage and attributed no new reviewer U beyond H0.
They preserved unknown publication denominator/cost and did not infer zero benefit.

Scoring calibration failed: v1 requested M/G without supplying their definitions.
A refused numeric G; B called the unsupported claim a third G. Both described two
flagged purposes as M, unlike the frozen criterion that a specifically unresolved
purpose is not missed by that review. Their reports remain unchanged. Neither
received the hidden constructed one-purpose-per-411/430 reference, so their refusal
to invent audited historical denominators was appropriate. The assessor reference
is a constructed expectation, not independent audit; no publication M denominator
is manufactured. Gap detection succeeded; numeric scoring comparability is not
established. No prospective safety/quality or time-saving conclusion follows.

Coordinator explicitly authorized a post-probe brief repair. Revision 2 makes the main brief reusable for prospective eight-minute reviews,
allows frozen candidate git-show inspection, supplies M/G/U definitions and
preserves original calibration v1/digests. Neither packet nor common bundle
changed after dispatch. No third probe or favorable retry run; independent review
and any further feasibility authority remain with coordinator. Slice not marked
done; no slice 2, candidate recruitment, tests, refactor, formatting, lint, commit,
push or observer changes performed here.

Remaining issues: reviewer-facing numeric denominator availability versus hidden
assessor reference needs steward judgment; hidden resolved host identity remains
unknown; A's 60s cap not demonstrated. A malformed prose assessment locator in the
common fixture is retained as original input; authoritative assessment was read by
the steward, but reviewers were deliberately restricted to the frozen fixture.

## Reviewed-input and full-output SHA-256

- REVIEWER-BRIEF-V1.md: `affcee66a1d592c8969466245d96d9aa8a8c48327ea6eb36895d4fcc7c4a385a`
- CALIBRATION-A.md: `881e2d975903efe863228c52873407149b1078909b8a86cf2b273671aa8be2a4`
- CALIBRATION-B.md: `7de3257e2b4dd96ebe488b7bea8b7bbbfd4c15853a3c6fbde19daf669bd65a7c`
- CALIBRATION-COMMON.md: `77ef8de1ac314c6d31dfc2d8fb11e0805914e97f3caa2d604440c4777612c440`
- CALIBRATION-A-RESULT.md: `012f416c545368633088dc8915740e1580b471508c7550a41795bc430c590aa4`
- CALIBRATION-B-RESULT.md: `5426116bed5fc986e3f718b9098eef2f042f8902a92f09cb25cb5700fce4cdee`

## Literal checks and task accounting

- Python owned-file line-count/trailing-whitespace assertions: PASS, each <=250.
- Python fixture table row check: PASS, exactly six F rows.
- git diff --check -- .planning/slice-plans/374-consumer-handoff-trial: exit 0.
  This Git check does not inspect untracked files; Python did inspect owned files.
- Normal installed consumer trace: initial/final owned scope exit 0. See trace
  record for the broader parent-owned --base population left unreconciled.
- Leaf task first observed tool clock: 2026-10-29T06:25:17Z. Final receipt clock
  recorded separately in parent handoff. Nested observed reviewer intervals total
  121s (71s+50s); exclude coordinator waiting on these from double counting.
  Human minutes, token usage, money, queue time and native completion timestamps
  unknown; no human decision solicitation by this leaf. No adoption claim.
