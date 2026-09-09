# Execution skills: native acceptance before release

Date: 2026-09-09. Candidate: prepared v0.3.3 on source base `00fd383`.
The fixture v0.3.3 tag exists only in an isolated temporary source repository;
it is not an Open Dough release. The user requires native acceptance before release.

## Outcome and scope

The two identified skills, `dough-execute-plan` and `dough-post-change-refactor`,
pass the representative native cases below after correcting the Codex adapter.
The maintainer confirmed the release contains these two skills and authorized
finalizing v0.3.3. No native-acceptance exception is being used.

Use [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for representative native evidence and reuse, [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for shared behavioral ownership, and the terminology explicitly requested from
ADR 0001: a story lives in its seed; an executable plan contains slices.

## Native evidence

All model sessions were fresh native CLI sessions in isolated installed client
fixtures. Codex notification acceptance used the actual desktop yielded-cell
interface. Prompts named the task and supplied client inputs, not expected
answers. Git delivery used only a local bare remote. CI used a controlled `gh`
executable with a randomized job name absent from the prompt.

| Requirement | Native case and decisive evidence | Result |
| --- | --- | --- |
| Cursor hook registration and readiness | Installed fragment; native Shell probe produces receipt; separate hook context establishes readiness | Pass |
| Claude Code hook registration and readiness | Installed fragment; native Bash probe and separate PostToolUse context | Pass |
| Cursor failure delivery and shutdown | Native hook supplies randomized job `acceptance-c94110c543d7d58d`; mailbox `watch-au4eWB` reports stopped, deliveredThrough 1, unread 0 | Pass after correcting fixture PATH |
| Claude Code failure delivery and shutdown | Native Read boundary receives the same job; `watch-Jl3Wtz` reports stopped, deliveredThrough 1, unread 0 | Pass |
| Codex notification and shutdown | Actual `notify` delivers failure while cell 95 runs; mailbox stop lets sole PTY reader return terminal stopped and exit 0; exact PID 42767 absent | Pass after adapter corrections |
| Execution delivery | Claude native implementation agent returns proof; fresh independent refactor agent returns completion; coordinator formats, updates plan/seed, commits and pushes `a18a957` to local origin/main; worktree clean | Pass |
| Refactor with edits | Codex replaces new invoice duplication with existing customerLabel; two public CLI tests pass; no commit or push | Pass |
| Empty refactor | Codex inspects status and both diffs, completes without edits or tests | Pass |
| Clean refactor after implementation | Claude independent agent checks current change and returns completion without redundant tests | Pass |
| Human-owned subsystem stop | Cursor identifies customer/billing policy crossing, explains why partial changes violate context, asks for a decision and emits stop marker; original diff and new invoice file preserved | Pass |

Native runtimes: Codex CLI 0.144.1; Cursor agent 2026.09.08-6caf4ff;
Claude Code 2.1.265; Node v24.5.0. Native sessions used configured model defaults.
See [evidence](evidence/) for native actions/results, prompts, fixture outcomes,
mailbox records, host settings, controlled GitHub substitute and candidate hashes.
Encrypted thinking and unrelated vendor telemetry are omitted from retained
transcripts. Original temporary transcripts remain under
`/private/tmp/dough-native-execution.6KjVjO` for this run.

## Findings and bounded corrections

1. Codex cell 80 delivered a failure, but `store` writes in a running yielded
   cell were not visible from another cell. A separate 15-second visibility
   probe reproduced this. The old adapter could not supply a recoverable
   handle before its first push. The revised adapter prints its receipt and
   session before yielding and makes the active plan the live ownership record.
   The first observer reached its 60-second budget and exited; evidence retained.
2. Cell 90 exposed handles, but simultaneous reader and Ctrl-C `write_stdin`
   calls raced: the control call consumed the terminal output and the reader
   received an unknown-process error. The revised adapter stops through the
   exact mailbox while retaining one terminal reader. Cell 95 verified failure
   delivery and clean stopped completion. All three exact worker PIDs exited.
   Codex streaming conservatively retains unread evidence (deliveredThrough 0)
   although the native notification was received; no durable hook acknowledgment
   is claimed and pending CI is reported unobserved.
3. Cursor's shell sandbox removed the inherited fixture PATH. Its first observer
   (`watch-Xy5C2G`) stopped without a failure. The native session diagnosed the
   environment, explicitly supplied the controlled executable's PATH and used a
   replacement only after confirmed shutdown. Both attempts are retained.

The corrected Codex document was exercised through its real host boundary;
CLI skill behavior used the otherwise unchanged installed candidate. Final
installation/update checks include the revised document. No product behavior
was inferred from script-only replay or model self-report: source edits, proof,
Git state, mailbox ownership/progress, and the unpredictable delivered job name
provide independent evidence.

## Reuse and remaining limits

The shared directory discovery mechanism is unchanged. Actual installed use on
Codex, Cursor and Claude Code above covers it; no separate discovery matrix is
needed per skill. Each changed hook mechanism has its own native proof. Skill
behavior cases are allocated by risk, not repeated on every host. Existing
extraction walkthroughs cover missing execution context, seed-only refusal,
destructive conflicts, sizing escalation, selective proof and pause/stash/repair
reasoning. The 63 deterministic runtime tests cover owner isolation, observer
reuse, recovery, failure selection and shutdown edge cases. Native CI repair
against a live GitHub repository was not run; the controlled acceptance covers
notification integration, while the native story covers actual delivery.

Installation/update/coexistence checks cover both roots, exact runtime bytes,
maintenance-file omission, dependency collisions and local edits, forced restore,
and preservation of existing host settings. The release suite initially found
two stale delivery fixture inventories; they were aligned and all three affected
delivery checks passed on rerun. Other unrestricted suite checks passed. The
new runtime-suite wrapper passes all 63 tests separately. Sandbox-only watcher
EMFILE failures were reproduced and the focused 4-test Codex regression passed
outside that restriction. Lint and the final execution update check pass.
