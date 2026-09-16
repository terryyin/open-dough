# Native Codex CI feedback acceptance

Status: accepted.

## Candidate and mission

- Source revision: `6b999618e327f6ef2cc8f07bb11305991da1c0e4` on
  `quick/050-simplify-and-prove-ci-feedback`.
- Disposable project: `/private/tmp/open-dough-050-native.kvClGX/project`.
- Installed runtime:
  `/private/tmp/open-dough-050-native.kvClGX/project/.agents/skills/dough-execute-plan`.
- Installed tree digest:
  `969420adc3bf91cc5314a6f503aad01c52349603a3b15f1ed6e509ec615f4662`.
- Repository and branch: `terryyin/open-dough`,
  `codex/ci-feedback-proof-20260916T073226Z-6dd953ee`.
- Host/runtime: Codex desktop yielded-cell bridge, Node `v24.5.0`,
  GitHub CLI `2.76.2`, Darwin arm64.
- Acceptance budget: 30 minutes; workflow job timeout: 5 minutes.
- Controlled diagnostic:
  `CI_FEEDBACK_PROOF_ASSERTION_6DD953EE expected green, got red`.

## Observer identity

- Coordinator: `root-acceptance-050-6dd953ee`.
- Yielded cell: `33`; stream session: `99427`.
- Mailbox: `/private/tmp/open-dough-050-native.kvClGX/mailboxes/watch-GqjOiA`.
- Observer PID: `60409`.
- Workflow selector/name: `ci.yml` / `CI`.
- `launch-cell.txt` and `stop-cell.txt` retain the literal substituted native
  cells used for this journey.

## Baseline

- Green revision: `a60b3f32496e8a57f51658ab300842a27cddb838`.
- GitHub Actions run: `35069167007`, attempt 1,
  <https://github.com/terryyin/open-dough/actions/runs/35069167007>.
- Result: success. The revision was pushed and registered through the installed
  candidate before the run was assessed.

## Controlled failure and native delivery

- Failing revision: `d3371e9c07001cd8cc42514ef7eab108126ede2e`.
- GitHub Actions run: `35069263335`, attempt 1,
  <https://github.com/terryyin/open-dough/actions/runs/35069263335>.
- Cell 33 delivered one `CI_FAILURE` to the active coordinator before any
  provider or mailbox inspection. It named the exact revision, branch, run,
  attempt, and `ci-feedback-proof-6dd953ee` job.
- Bounded failed-log inspection then showed the planned diagnostic exactly:
  `CI_FEEDBACK_PROOF_ASSERTION_6DD953EE expected green, got red`.
- No second actionable delivery arrived for this attempt.

## Repair and quiet green

- Repaired revision: `a48461a70a53d6ba06469df7ba3701b5cd040b73`.
- GitHub Actions run: `35069388314`, attempt 1,
  <https://github.com/terryyin/open-dough/actions/runs/35069388314>.
- Result: success. The same observer remained active, and the exact repaired
  revision was pushed and registered through the installed candidate.
- After one bounded observer interval, no actionable success notification was
  delivered. The mailbox coverage record binds this revision to run
  `35069388314`, attempt 1, with state `success`.

## Shutdown and retained evidence

- The documented candidate stop binding cooperatively stopped the exact mailbox.
- PID `60409` was absent after the stop; cell 33 reached its terminal result.
- Terminal status: `stopped`; `pendingCi: unobserved`; one event recorded,
  zero persisted delivery acknowledgements, one unread event. The unread event
  is the already handled controlled failure and remains preserved by design.
- The three coverage records bind the baseline to success, the controlled
  revision to failure, and the repair to success. The copied `mailbox/` JSON is
  the bounded raw evidence for those identities and the terminal result.

## Ceremony and host-impact assessment

- Required Codex adapter guidance changed from 5,979 bytes / 726 words / 135
  lines to 5,218 bytes / 617 words / 104 lines: 761 bytes, 109 words, and 31
  lines fewer overall.
- The launch cell changed from 1,906 bytes / 185 words / 69 lines to 1,680
  bytes / 182 words / 39 lines. The new deterministic stop cell is 904 bytes /
  82 words / 16 lines. Total inline code grew, but the complete required reading
  shrank and the real journey needed only literal substitution, push
  registration, one launch cell, and one stop cell; it did not require rebuilding
  parsing or lifecycle bookkeeping.
- The native journey used the instructions as written and completed the
  baseline, one failure delivery, repair, quiet green observation, and exact
  shutdown without guessed imports, model polling, or rereading for missing
  mechanics.
- Product changes are confined to the Codex notification guidance and its
  deterministic Codex fixtures. Cursor and Claude hook responsibilities and
  shared mailbox/provider logic did not change, so their retained native
  evidence remains applicable under ADR 0005; Codex success is not claimed as
  proof of either host.
