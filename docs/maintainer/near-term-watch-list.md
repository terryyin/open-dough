# Near-term watch list

Reviewed 2026-09-30 (Asia/Singapore) against all three project logs. These codes
remain allocated. Retire only after seven days, relevant exercise and no
unresolved recurrence. Historical detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/near-term-watch-list.md`.

## ODF-066 — Unpublished queue claims

- **Source:** Open Dough / DD-064; original execution `d0a9495`, guidance 0.3.26.
- **Response:** `be94345` / `f699e60`, first released in 0.3.27; shared startup `194617b` / `1a63c0c` / `6f5d0ef`, first released in 0.3.33. Native queued-start acceptance is complete in SEED-008.
- **Watch start:** 2026-09-24 (date-only); Doughnut plan 022 / `70b3b67313` used released 0.3.33 startup and recorded its claim receipt. Open Dough plan 092 also records Take `1443c42`, 0.3.38, at 20:27:08+08:00. Evidence remains under [ODF-099](#odf-099).
- **Review after:** 2026-10-01.
- **Last assessed:** 2026-09-30; all three logs rechecked; no supported unpublished-claim recurrence. Startup use does not certify every concurrency/refusal case; oversized receipts have a separate watch below.

<a id="odf-073"></a>

## ODF-073 — Late CI attachment

The coordinator arms the observer only after the first slice push, leaving that publication outside the intended observation sequence.

- **Response / verified use:** Managed delivery 02991a5 / 493187c first released in 0.3.33 establishes observation at delivery. Pygardon plan 185 / c2170df0f, 0.3.37, supplied session input on the first delivery (ODF-092 workaround row).
- **Watch start:** 2026-09-24 (date-only).
- **Review after:** 2026-10-01.
- **Last assessed:** 2026-09-30; all three current logs checked. Ordering exercised; session-input and owner-delivery problems stay under ODF-092 and ODF-103. The historical late-start report had unknown release and added no coverage loss beyond its independent adapter failure.

### Retained evidence

- pygardon: Execution: `.planning/slice-plans/125-stooq-refresh-memory-safety/PLAN.md` at `77dfb2c0c`; Timestamp: 2026-09-17T11:23:10+08:00; Tool: Claude Code; Model: claude-sonnet-5; Open Dough release: unknown.
- **Source snapshot:** pygardon `cc2950b293e80948d5cacfa0bbbf85cda4376a1b:DearDough.md`; DD-057.

<a id="odf-089"></a>

## ODF-089 — Misleading ended observers

After persistent polling errors produce a normal terminal result, later push registration and attachment still look active even though that observer will never poll the new revision.

- **Response / verified use:** ddcabcb, first released in 0.3.33, excludes terminal mailboxes from live reuse. Doughnut plan 034 / 36eb15caaa on 0.3.38 reported monitor-unavailable and later unobserved (Doughnut ODF-121).
- **Watch start:** 2026-09-25 (date-only).
- **Review after:** 2026-10-02.
- **Last assessed:** 2026-09-30; all three current logs checked. This later ended observer was not falsely reported live. Its transient transport termination is separately active as ODF-121; not a success claim for transport resilience.

### Retained evidence

- open-dough: Execution: `.planning/slice-plans/076-path-filter-aware-ci-observation/PLAN.md @ a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865` - Timestamp: 2026-09-22T07:12+00:00 - Tool: Claude Code - Model: claude-sonnet-5 - Open Dough release: modified; revision a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865; base 0.3.28 - Evidence: mailbox `/tmp/dough-ci-501/watch-Q6ZEF0`'s event 3 (`CI_MONITOR_UNAVAILABLE`, TLS timeout) and `result.json` (`finished`) both predate two later `register-push` calls (mtimes ~10/~30 min after); `ps` confirmed the worker pid was gone. - Observed effect: two SHAs registered against an ended observer with no distinguishing signal; the gap surfaced only via a manual `gh` cross-check near execution end. - Inference: Qualified, single occurrence; mechanism is deterministic and the triggering network instability recurred repeatedly this session, so recurrence is plausible. Not tested: a distinct "CI observer ended" hook message, mirroring "lost its worker."
- **Source snapshot:** open-dough `a951fc04a5e8dfcc0f1f55660b00ae0eb9611bc5:DearDough.md`; DD-090.

<a id="odf-099"></a>

## ODF-099 — Oversized startup receipts

Startup serializes full before/after Git index snapshots into its coordinator receipt, hiding necessary fields behind oversized tool output.

- **Response / verified use:** 075e955, first released in 0.3.40, removes index/patch snapshots and returns only decision fields. Pygardon plan 200 reports 0.3.40 and successful Take efd7ed2e1; that commit's installed execution-start-receipt.mjs matches the compact response.
- **Watch start:** 2026-09-26 (date-only).
- **Review after:** 2026-10-03.
- **Last assessed:** 2026-09-30; all three current logs checked. Actual released startup use verified; no supported oversized-output recurrence. Historical later reports still use 0.3.38/0.3.39 or unknown releases. This watch does not close the previously recorded Claude/Codex/Cursor native acceptance gaps or claim a measured size for plan 200.

### Retained evidence

- pygardon: Execution: `.planning/slice-plans/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the start receipt was persisted as an oversized tool result (577.8 KB) and had to be re-read through a filtering script to find `status`, `publishedSha` and the maintenance results. Effect: one extra call and a context-heavy preview. Inference: the index is maintenance evidence the coordinator never needs in the receipt; a digest or omission would do.
- pygardon: Execution: `.planning/slice-plans/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `8d5010ce7` was persisted as an oversized tool result (580.8 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged by the 0.3.38 update.
- pygardon: Execution: `.planning/slice-plans/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `b49624f1b` was persisted as an oversized tool result (580.9 KB); only its preview was usable. Effect: context-heavy preview. Inference: unchanged.
- pygardon: Execution: `.planning/slice-plans/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (claim `1e69bb258` at 2026-09-25T08:20:51+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt was persisted as an oversized tool result (581.2 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged.
- pygardon: Execution: `.planning/slice-plans/193-tests-without-time-waits/PLAN.md` (first implementation commit `ffe4db64e`); Timestamp: unknown (claim `0ef7f2db1`, 2026-09-25); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.39. Evidence: the claim receipt was persisted as an oversized tool result (582.7 KB) with only its preview usable. Effect: context-heavy preview. Inference: unchanged in 0.3.39.
- pygardon: Execution: `.planning/slice-plans/196-tfdc-dead-behavior-removal/PLAN.md` (first implementation commit `b19bd341b`); Timestamp: unknown (claim `ebf14d9f8`, 2026-09-25); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the claim receipt was persisted as an oversized tool result (586.8 KB) with only its preview usable, and `afterMaintenance` had to be grepped out. Effect: one extra call. Inference: unchanged.
- **Source snapshot:** pygardon `cc2950b293e80948d5cacfa0bbbf85cda4376a1b:DearDough.md`; DD-088.
- doughnut: Execution: SEED-035 story 1 / slice-plans/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T11:09+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. - Evidence: startup call output "Output too large (811.3KB)"; preview shows `beforeMaintenance.result: deferred`, `reason: unclear-ownership`, then `index: "100644 … .agents/agent-map.md\n…"`. - Observed effect: the exact receipt the skill requires preserving was not fully visible in context; later fields (for example refresh results after the index) were unread. - Inference: a maintenance diagnostic that lists every tracked file scales with repository size; a count or digest would keep the receipt usable.
- doughnut: Execution: SEED-035 story 3 / slice-plans/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:10+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (814.6KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: the coordinator needed an extra `python3` call to read the receipt's later fields (`afterMaintenance: advanced`, `projectSetupRequired: true`).
- doughnut: Execution: SEED-035 story 14 / slice-plans/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24, ~15:45+08:00 (queued startup, between readiness commit 47df9474c2 and slice 1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (815.7KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 20 / slice-plans/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:28+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (816.5KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 4 / slice-plans/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:17+08:00 (queued startup; Take commit 21:16:55+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 19 / slice-plans/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T09:02+08:00 (queued startup; Take commit 09:01:48+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `node` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 5 / slice-plans/033-move-legacy-note-pictures / 4dad58408f; Timestamp: 2026-09-25, ~14:19+08:00 (queued startup, Take commit 269a569079); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (816.6KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `node` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 17 / slice-plans/034-book-source-as-notebook-file / 36eb15caaa; Timestamp: 2026-09-25, ~15:45+08:00 (queued startup, Take commit 6926d8a1a1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.3KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-039 story 4 / slice-plans/041-faster-frontend-unit-tests / c9347a9ee3; Timestamp: 2026-09-26T08:24+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (819.2KB)"; the coordinator parsed the saved file with a script to read `publishedSha`, `workspace`, and the maintenance results. - Observed effect: one extra call to recover the receipt fields.
- **Source snapshot:** doughnut `0d92ca6c226fc0d755a9b159e2cb3259a68f009f:DearDough.md`; DD-108.

ODF-099 earlier Open Dough evidence remains at `b633e1d:DearDough.md`, `876a0b0:DearDough.md`, `bde06c7:DearDough.md`, `6494de2:DearDough.md` and `e11c09a:DearDough.md`. Plan 100 / 075e955, Claude Code claude-opus-5-5[1m], unknown execution release, reported a 236,870-byte pre-change receipt; real CLI fixtures at 989a34c measured 286 KB–1.1 MB before versus 306–330 bytes after. Those fixture observations do not establish client adoption.

<a id="odf-092"></a>

## ODF-092 — Missing Claude session identity

- **Source mappings:** Open Dough / DD-095 (Claude occurrences), Pygardon / DD-085, Donut / DD-107 (Claude identity occurrences).
- **Response:** `9880cbb`, first released in 0.3.41 (containing tag and ci-host-bridge/execution-increment-observation diff verified). Resolves the coordinator from CLAUDE_CODE_SESSION_ID for first delivery and uses that same owner to bind; explicit session input remains authoritative.
- **Watch start:** 2026-09-27 (date-only, Asia/Singapore). Donut plan 009 / `983ac6d18e`, released 0.3.41: deliver without session JSON attached watch-gBNzg7 and later reused it. That execution commit’s installed VERSION and ci-host-bridge contain the verified response.
- **Review after:** 2026-10-04.
- **Last assessed:** 2026-09-30; all three current logs checked. No supported Claude identity recurrence after the response; unknown releases remain unknown. Cursor plan 126 is separate ODF-154. Argument-shape refusals are separate ODF-142/143, and Pygardon plan 208 was misplaced readiness evidence now under ODF-116. Successful attachment does not prove every notification path.

### Retained source evidence

#### open-dough

Former local code: DD-095.

Delivery without `--session-json` returned `pendingCi: unobserved`; no guidance
names Claude Code's `$CLAUDE_CODE_SESSION_ID`. A retry for the accepted SHA was
refused ("rebase left the pre-rebase SHA") after starting an unreported observer.
Seven older occurrences (plans 089, 092, 096, 097 twice, 099, 100) are pruned; see Retention.

##### Occurrences

- Execution: `slice-plans/088-dough-land/PLAN.md @ 647ff01`
  - Timestamp: 2026-09-24T10:50:57+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: 0.3.36
  - Evidence: retry-created `watch-Vcl3dH` reused at 5650123; plus `watch-ljLxgl`.
  - Observed effect: two observers for one branch until one was stopped.
- Execution: `SEED-042#rename-slice-plan-folder-references` / plan 111, first related implementation commit `e7b7ad1`
  - Timestamp: unknown (first increment delivery, after commit `e7b7ad1` at 2026-09-26T14:11:57+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `e7b7ad1` receipt `unobserved` ("host session identity is required"); no retry; explicit `ci-mailbox.mjs start` + `register-push` attached `watch-1QARos`.
  - Observed effect: no duplicate observer, but recovery again needed a read of `ci-host-bridge.mjs`.

- Execution: `SEED-028#track-ad-hoc-work` / plan 110, first related implementation commit `4286761`
  - Timestamp: unknown (first increment delivery, after commit `4286761` at 2026-09-26T13:30:10+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `4286761` receipt `observation.state: unobserved` ("host session identity is required"); later deliveries passed `--session-json` from `CLAUDE_CODE_SESSION_ID` and attached `watch-KacOun`. Source `trunk-publication.md` already reads that variable; the installed copy did not.
  - Observed effect: slice 1 never observed; no duplicate observer (no retry of the accepted SHA).

- Execution: `SEED-008#preserve-other-executions-work` / plan 114, first related implementation commit `f157f0e`
  - Timestamp: unknown (first increment delivery, after commit `f157f0e` at 2026-09-26T17:09:03+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `f157f0e` receipt `observation.state: unobserved` ("host session identity is required"); no retry; slice 2 delivery with `--session-json` from `CLAUDE_CODE_SESSION_ID` attached `watch-3NF61x`. Installed `trunk-publication.md` lacks the source's env-var sentence.
  - Observed effect: slice 1 never observed individually; recovery needed a read of `ci-host-bridge.mjs`.

- Execution: `SEED-037#fourfold-local-suite` / plan 107, first related implementation commit `273ae9a`
  - Timestamp: unknown (first increment delivery, after commit `273ae9a` at 2026-09-26T11:06:26+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: `273ae9a` receipt `unobserved` ("host session identity is required"); `ci-host-bridge.mjs` read, then manual `start` + `register-push` (`watch-20kX7p`); later deliveries passed `--session-json` from `CLAUDE_CODE_SESSION_ID`.
  - Observed effect: a ninth occurrence; no retry, so no hidden duplicate observer.

#### pygardon

Former local code: DD-085.

Every managed increment returned `pendingCi: unobserved` because bridge verification needs a host session identity the coordinator cannot pass; coverage came only from a manual observer start plus `register-push`.

##### Occurrences

- Execution: `.planning/slice-plans/181-local-production-deployment/PLAN.md` (first implementation commit `f8eed7a92`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: seven `execution-increment-delivery.mjs deliver` receipts (f8eed7a…e5b067e) with reason `host session identity is required to verify the notification bridge`, while `ci-mailbox.mjs probe` and a direct `start` produced `CI_MONITOR_READY` / `CI observer attached`. Effect: the coordinator ran the explicit start/register path the delivery reference says not to use. Inference: the Claude Code adapter's session identity is available to hooks but not to the delivery command's caller.
- Execution: `.planning/slice-plans/182-retire-remote-distribution/PLAN.md` (first implementation commit `1d591046a`); Timestamp: unknown (first delivery after commit 2026-09-24T14:01:15+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `pendingCi: unobserved`; every later delivery passing `--session-json '{"session_id":"<Claude Code session id>"}'`, the id read from the session's tool-results path, returned `observation: attached`. Effect: one increment needed a manual `start` and `register-push`. Inference: the identity is obtainable by the coordinator, so the gap is that the delivery reference does not say where it comes from.
- Execution: `.planning/slice-plans/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: all four `deliver --host claude` calls passed `--session-json` with the session id and transcript path read from the tool-results path; the first returned `observation: attached` (`/tmp/dough-ci-501/watch-dNRLT3`), later ones `reused`. Effect: no manual start or `register-push`. Inference: the workaround holds, but the identity still has to be derived from an incidental path.
- Execution: `.planning/slice-plans/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `pendingCi: unobserved` (`host session identity is required…`) for `132b3e53e`; the coordinator then found the flag by reading `ci-host-bridge.mjs`, and slices 2–4 passing the session id and transcript path returned `attached` (`/tmp/dough-ci-501/watch-Wx0tkI`) then `reused`. Effect: slice 1 left unobserved; two script-reading calls. Inference: recurs in every fresh Claude Code execution until the delivery reference names the identity source.
- Execution: `.planning/slice-plans/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24, ~22:00 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `observation.state: unobserved` (`host session identity is required…`) for `51b7aa206`; re-running with `--session-json '{"session_id":…}'` attached `/tmp/dough-ci-501/watch-PRnDi2`, later deliveries `reused`. Effect: one extra delivery call, which also tripped a replay conflict on concurrent slices' unstaged files. Inference: unchanged; the coordinator still recalls the flag only after the first miss.
- Execution: `.planning/slice-plans/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (first delivery after commit 2026-09-25T08:33:31+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `3f21aa9fe`; re-running with the session id and transcript path attached `/tmp/dough-ci-501/watch-WhrBb9`. Effect: one extra delivery call. Inference: unchanged.
- Execution: `.planning/slice-plans/190-tfdc-trustworthy-results/PLAN.md` at `ca9182e35` (first implementation commit `88824e3a0`); Timestamp: unknown (first delivery after commit 2026-09-25T08:26:33+08:00; observer mailbox created 08:27 +08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: coordinator's execution summary — the first managed delivery returned `observation unobserved` (host session identity required); the coordinator ran the Claude host probe (`/tmp/dough-ci-501/watch-GWpZ9O`) and started the observer by the adapter launcher (`watch-ZTiq1g`), after which deliveries reported `reused`. Effect: one extra probe and manual start. Inference: unchanged; still recurs on the first increment of each fresh Claude Code execution.
- Execution: `.planning/slice-plans/192-forced-stooq-cleanup-reaping/PLAN.md` (first implementation commit `792e8936a`); Timestamp: unknown (first delivery after commit 2026-09-25T14:12:36+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 `deliver --host claude` without `--session-json` (and with an abbreviated `--validated-candidate`) returned `candidate-mismatch` and `unobserved` (`host session identity is required…`); rerunning with the full SHA and `--session-json "{\"session_id\":\"$CLAUDE_CODE_SESSION_ID\"}"` returned `accepted` and attached `/tmp/dough-ci-501/watch-hV2la5`. Effect: one extra delivery call, and two reference/script reads to find the identity source; nothing was left unobserved. Inference: the Claude Code shell exposes the session id as `CLAUDE_CODE_SESSION_ID`, so the delivery reference could name that variable directly instead of leaving it to be derived from the tool-results path.

- Execution: `.planning/slice-plans/183-stooq-retry-control/PLAN.md` at `6e1858f16`; Timestamp: 2026-09-24T11:26:52+08:00; Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. Evidence: slice 1 `execution-increment-delivery.mjs deliver --host claude` without `--session-json` returned `pendingCi: unobserved` ("host session identity is required"); the coordinator then probed, started `watch-mAof9e` and ran `register-push` for `6e1858f16`. Observed effect: first increment unobserved at push; later deliveries passed `--session-json` and attached. Inference: the Claude-host delivery's need for session identity is not stated where the delivery command is taught.
- Execution: `.planning/slice-plans/193-tests-without-time-waits/PLAN.md` (first implementation commit `ffe4db64e`); Timestamp: unknown (first delivery after commit `ffe4db64e`, 2026-09-25); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.39. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `ffe4db64e`; the coordinator ran `ci-mailbox.mjs probe` and `start` (`/tmp/dough-ci-501/watch-Z1sJB7`), and later deliveries reported `reused`. Effect: one probe and one manual start; the first increment was unobserved at push. Inference: unchanged in 0.3.39; `CLAUDE_CODE_SESSION_ID` was set in the shell.
- Execution: `.planning/slice-plans/196-tfdc-dead-behavior-removal/PLAN.md` (first implementation commit `b19bd341b`); Timestamp: unknown (first delivery 2026-09-25, before the observer start); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `b19bd341b`; the coordinator ran `ci-mailbox.mjs probe` and `start` (`/tmp/dough-ci-501/watch-PS2P9e`), and later deliveries passing the session id reported `reused`. Effect: one probe, one manual start and a script read. Inference: unchanged.
- Execution: `.planning/slice-plans/199-e2e-scenario-reset-drain/PLAN.md` (first implementation commit `fb25650c6`); Timestamp: unknown (first delivery 2026-09-26); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `fb25650c6`, although `ci-mailbox.mjs probe` had already returned `CI_MONITOR_READY`; the coordinator read `execution-increment-observation.mjs` and `ci-host-bridge.mjs`, then ran `start` (`/tmp/dough-ci-501/watch-SM5QF6`) and `register-push`; slices 2–3 passing `--session-json` reported `reused`. Effect: first increment unobserved at push; two script reads, one manual start and one registration. Inference: unchanged in 0.3.40; the recorded fix (name `CLAUDE_CODE_SESSION_ID` in the delivery reference) is still absent.
- Execution: `.planning/slice-plans/198-tfdc-shared-verify-calculation/PLAN.md` (first implementation commit `bff1ba87d`); Timestamp: 2026-09-26T02:24:41Z (first delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `observation.state: unobserved` (`host session identity is required…`) for `bff1ba87d`; the coordinator then read the delivery script for the flag, and from slice 2 (`99131d340`) deliveries passing the session id attached `/tmp/dough-ci-501/watch-YrEPFW`. Effect: `bff1ba87d` was never observed on its own; later CI runs covered its content. Inference: unchanged in 0.3.40.
- Execution: `.planning/slice-plans/202-ci-stooq-overlap/PLAN.md` (first implementation commit `ddf5897be`); Timestamp: unknown (first delivery 2026-09-26); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `unobserved` (`host session identity is required…`) for `ddf5897be`, after `ci-mailbox.mjs probe` had returned `CI_MONITOR_READY`; the coordinator read `ci-host-bridge.mjs`, and slices 2–3 passing `--session-json` with the session id attached `/tmp/dough-ci-501/watch-W67UqK` then `reused`. `CLAUDE_CODE_SESSION_ID` was set in the shell. Effect: slice 1 left unobserved at push (no manual start or registration); two script reads. Inference: unchanged; the delivery reference still does not name the identity source.
- Execution: `.planning/slice-plans/200-tfdc-regime-fill-session/PLAN.md` (first implementation commit `86fd25844`); Timestamp: unknown (2026-09-26); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. Evidence: both `deliver --host claude` calls, for `86fd25844` and `9bd079536`, were made without `--session-json` and returned `unobserved` (`host session identity is required…`), although `CLAUDE_CODE_SESSION_ID` was set in the shell. The coordinator neither probed nor started an observer; it recorded the gap and moved on. Effect: neither story-branch increment was observed at push. Inference: unchanged in 0.3.40. Without the identity source named in the delivery reference, a coordinator that skips the adapter probe loses coverage for the whole execution, not only for its first increment.
- Execution: `.planning/slice-plans/205-tfdc-live-stop-matches-verify/PLAN.md` (first implementation commit `18520f138`); Timestamp: 2026-09-26T08:16:26Z (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40. Evidence: slice 1 `deliver --host claude` without `--session-json` returned `observation.state: unobserved` (`host session identity is required…`) for `18520f138`; the coordinator ran `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start` (`/tmp/dough-ci-501/watch-U2ou7v`) and `register-push`, grepped the delivery scripts for the flag, and slice 2 passing `--session-json` reported `reused`. Effect: one probe, one manual start, one registration and one script search; nothing left unobserved. Inference: unchanged in 0.3.40.

#### doughnut

Former local code: DD-107.

`execution-increment-delivery.mjs deliver` returned `pendingCi: unobserved` ("host session identity is required to verify the notification bridge") although the Claude Code hook bridge was ready. The references document `--session-json` only in the usage line; recovery needed a manual probe, observer start, and `register-push`.

##### Occurrences

- Execution: SEED-035 story 15 / slice-plans/020-notebook-lfs-receive / 2dc0ce9478; Timestamp: 2026-09-24T08:49+08:00 (slice 1 delivery; its CI run was created 00:49:45Z); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33.
  - Evidence: slice 1 delivery receipt `observation.reason`; later deliveries passing `--session-json '{"session_id":…}'` (from the session transcript path) reported `observation.state: reused`.
  - Observed effect: slice 1's SHA was registered by hand after its CI run already existed (`CI_DISCOVERY_DELAYED`); no coverage was lost afterwards.
  - Inference: the coordinator must discover its own session id outside guidance; a host without an obvious transcript path could leave every increment unobserved.
- Execution: SEED-035 story 1 / slice-plans/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T11:28+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge"; recovered by `ci-mailbox.mjs probe` (hook added `CI_MONITOR_READY`), `start --execution … story/browse-download-notebook-files`, and `register-push`; slices 2 and 3 then reported `observation.state: reused` without `--session-json`.
  - Observed effect: slice 1's CI run was found late (`CI_DISCOVERY_DELAYED`); three extra coordinator calls; no later coverage loss.
- Execution: SEED-035 story 3 / slice-plans/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:25+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut story/local-image-display`, and `register-push` for f0cc15be6a.
  - Observed effect: same three-call manual recovery; the release update from 0.3.33 to 0.3.37 did not change this.
- Execution: SEED-035 story 14 / slice-plans/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24T15:50+08:00 (slice 1 delivery; its CI run was created 07:50:15Z); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut exec/seed-035-story-14`, and `register-push`; later deliveries reported `observation.state: reused`.
  - Observed effect: the same three-call manual recovery as earlier occurrences.
- Execution: SEED-035 story 20 / slice-plans/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:40+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut main`, and `register-push` for 5c2e95c367 and 5859e6d663; the next ten deliveries reported `observation.state: reused`.
  - Observed effect: the same three-call manual recovery; the claim and slice 1 were registered late (`CI_DISCOVERY_DELAYED`).
- Execution: SEED-035 story 4 / slice-plans/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:22+08:00 (slice 1 delivery; commit 21:21:16+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut main`, and `register-push` for 09a299b665 and 4250de93e1; later deliveries passing `--session-json '{"session_id":…}'` reported `observation.state: reused`.
  - Observed effect: the same manual recovery plus a read of `ci-host-bridge.mjs` to learn the flag's shape; the claim and slice 1 were discovered late (`CI_DISCOVERY_DELAYED`); unchanged in 0.3.38.

- Execution: SEED-035 story 19 / slice-plans/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T09:21+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`) and re-running `deliver` for the accepted SHA with `--session-json '{"session_id":…}'`, which reported `observation.state: attached`.
  - Observed effect: two extra calls; a simpler recovery than `start` plus `register-push`, still discovered only by reading the receipt.
- Execution: SEED-035 story 5 / slice-plans/033-move-legacy-note-pictures / 4dad58408f; Timestamp: 2026-09-25, ~14:23+08:00 (slice 1 delivery; commit 14:23:10+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode, bridge probe already `CI_MONITOR_READY`); a re-run passing the original base was refused ("rebase left the pre-rebase SHA as the candidate"); a re-run with the accepted SHA as base and `--session-json` from `CLAUDE_CODE_SESSION_ID` reported `observation.state: reused`.
  - Observed effect: three extra calls (one refused) plus a `grep` of the delivery scripts to learn the flag's shape; later deliveries passing `--session-json` reported `reused`.

- Execution: SEED-035 story 17 / slice-plans/034-book-source-as-notebook-file / 36eb15caaa; Timestamp: 2026-09-25, ~15:55+08:00 (slice 1 delivery; commit 15:55:12+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: slice 1 and slice 7 (96c756d531) receipts `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode); recovered after slice 1 by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut story/book-source-as-notebook-file`, and `register-push` for 36eb15caaa; slices 2-6 reported `reused`.
  - Observed effect: the same three-call manual recovery; after the observer ended (see DD-115) the slice 7 delivery could not reattach without the session identity and stayed unobserved.

- Execution: SEED-035 story 18 / slice-plans/036-remove-legacy-picture-storage / 89e3f8a67e; Timestamp: 2026-09-25T22:14:43+08:00 (slice 1 delivery receipt); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: coordinator said before delivery "Managed delivery sets up CI observation itself, so no manual observer start is needed"; slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge"; recovered by a `grep` of the delivery scripts for the flag, `ci-mailbox.mjs probe`, a re-run with `--session-json` refused ("rebase left the pre-rebase SHA as the candidate"), `start --execution nerds-odd-e/doughnut story/036-remove-legacy-picture-storage` (observer watch-2ENnNk), and `register-push` for 89e3f8a67e; slices 2-5 passed `--session-json` and reported `reused`.
  - Observed effect: five extra calls (one refused) and a `CI_DISCOVERY_DELAYED` advisory for early revisions; no later coverage loss seen before the completion wait.
  - Inference: the same refused re-run as the story 5 occurrence recurred, so the recovery path is still rediscovered per execution.

- Execution: slice-plans/037-fold-picture-attach-step-into-upload / 1b822a6bf7; Timestamp: 2026-09-25, ~23:30+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: first `deliver` call (no `--session-json`, abbreviated `--validated-candidate 1b822a6bf7`) returned `candidate-mismatch` with `observation.reason` "host session identity is required to verify the notification bridge"; the coordinator then read `execution-increment-observation.mjs` and `ci-host-bridge.mjs` for the flag's shape; a re-run with the full SHA and `--session-json` built from the session transcript path reported `observation.state: attached` (watch-fa5IXa).
  - Observed effect: one refused call and two script reads before the only delivery; no coverage lost, because the refused call published nothing.
  - Inference: the `candidate-mismatch` was likely caused by the abbreviated SHA, which the usage line does not rule out. The coordinator read the ODF-092 occurrences only after delivery, so the logged fix did not reach it beforehand.

- Execution: slice-plans/037-share-backend-test-context / c7ea84e3a7; Timestamp: unknown (first delivery after the plan commit 2026-09-25 23:24:51+08:00; last publication after db643ef844 at 2026-09-26 00:09:04+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: coordinator summary handed to the execution retrospective (no transcript): the first `deliver` returned `candidate-mismatch` because an abbreviated SHA was passed to `--validated-candidate`, and a retry with the full SHA was accepted; every publication (0f8709dfc1, c7ea84e3a7, 7cb7c300b1, 6455811f4d, 5bf185ba0d, db643ef844) reported "host session identity is required to verify the notification bridge".
  - Observed effect: CI on `story/037-share-backend-test-context` was never observed during execution; the retrospective started with CI unknown.
  - Inference: both the abbreviated-SHA refusal and the missing session identity recurred about an hour after the same pair was recorded for `slice-plans/037-fold-picture-attach-step-into-upload` on main, which this execution's base (5c8bb75741) did not contain. Whether a recovery was attempted is not in the summary.
- Execution: SEED-039 story 4 / slice-plans/041-faster-frontend-unit-tests / c9347a9ee3; Timestamp: 2026-09-26T08:50+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38.
  - Evidence: slice 1 receipt `observation.reason: host session identity is required to verify the notification bridge`; a re-run with `--session-json` refused ("rebase left the pre-rebase SHA as the candidate") because nothing new was left to publish; later deliveries with `--session-json` reported `observation.state: reused`.
  - Observed effect: c9347a9ee3 stayed unobserved; the coordinator found `--session-json` again only from the usage line and `ci-host-bridge.mjs`.
- Execution: SEED-035 story 2 / slice-plans/035-delete-notebook-file-on-web / 20968e7810; Timestamp: 2026-09-26, ~10:24+08:00 (slice 1 delivery; commit 10:24:02+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40.
  - Evidence: coordinator summary handed to the execution retrospective (no transcript): the first managed delivery failed because the target ref lacked the `refs/heads/` prefix, then `candidate-mismatch` for an abbreviated SHA and a missing host session identity (`--session-json`); later deliveries succeeded and the observer /tmp/dough-ci-501/watch-HC7nuY covers `refs/heads/story/delete-notebook-file-on-web`.
  - Observed effect: at least two refused delivery calls before slice 1 was published; the release update from 0.3.38 to 0.3.40 did not remove either earlier cause.
  - Inference: the `refs/heads/` requirement is a new third argument-shape refusal on the same first delivery; the three are rediscovered one refusal at a time. The exact call count is not in the summary.
- Execution: SEED-035 story 23 / slice-plans/042-moved-note-keeps-its-picture / 96186af758; Timestamp: 2026-09-26, ~16:30+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40.
  - Evidence: all three slice receipts (96186af758, 5db1d2beb4, e22c4c1c9a on `refs/heads/story/042-moved-note-keeps-its-picture`) reported `observation.state: unobserved`, "host session identity is required to verify the notification bridge"; the coordinator noted the gap after slice 1 and deferred it to completion instead of passing `--session-json` (`CLAUDE_CODE_SESSION_ID` was set) on slices 2 and 3.
  - Observed effect: no increment was observed during execution; the retrospective started with CI unknown for three pushes.
  - Inference: the coordinator read the ODF-092 occurrences only during the retrospective, so the logged recovery again did not reach delivery.
- Execution: SEED-043 story 1 / slice-plans/045-commit-gate-checks-committed-content / 574d61b52c; Timestamp: 2026-09-26, ~16:04+08:00 (slice 1 delivery; commit 16:03:40+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode); recovered by `ci-mailbox.mjs probe` (`CI_MONITOR_READY`), `start --execution nerds-odd-e/doughnut story/045-commit-gate-checks-committed-content`, and `register-push` for 574d61b52c; later deliveries passing `--session-json '{"session_id":…}'` reported `observation.state: reused`.
  - Observed effect: four extra coordinator calls, including a `grep` of `ci-host-bridge.mjs` for the flag's shape; the recovered observer then delivered slice 1's CI failure (DD-126).
- Execution: SEED-035 story 24 / slice-plans/046-moves-to-another-notebook-reach-git / bc9a0ab229; Timestamp: 2026-09-26, ~17:05+08:00 (slice 1 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.40.
  - Evidence: slice 1 receipt `observation.reason` "host session identity is required to verify the notification bridge" (background Claude Code job, Story Branch Mode); the coordinator found the flag's shape by grepping `ci-host-bridge.mjs` and `CLAUDE_CODE_SESSION_ID` via `env`; re-running `deliver` with `--session-json` for the already-pushed SHA was refused ("rebase left the pre-rebase SHA as the candidate"); slices 2 and 3 with `--session-json` reported `observation.state: reused` (`/tmp/dough-ci-501/watch-xFqwGh`).
  - Observed effect: five extra coordinator calls; slice 1 was never registered by hand, and the observer started by the refused call picked up later pushes.
  - Inference: the fix recorded in earlier rows (pass `--session-json` from `CLAUDE_CODE_SESSION_ID` on the first delivery) is still not in the delivery guidance, so each execution rediscovers it.

Historical Open Dough identity evidence removed before this run remains recoverable from the source retention snapshots recorded at `2d2c4cda:DearDough.md`; that partial history is not counted as newly harvested occurrences.

<a id="odf-133"></a>

## ODF-133 — Repairable sizing concern left at preparation handoff

Planning records not-ready for a sizing concern its own refinement can settle, leaving execution to initiate another preparation cycle.

- **Source mapping:** Open Dough / DD-112 (former local code).
- **Source snapshot:** `6c3dfa19016d2646f8ccd6e8ba7402864d02af93:DearDough.md`, ODF-133; active catalog assessment retained below.
- **Assessment (2026-09-27):** One plan 116 execution, release unknown; one owner round trip and publication cycle. The refusal correctly enforced readiness; the actionable gap is the earlier preparation handoff.
- **Response:** [Conditional refinement during slice planning](../../src/skills/dough-slice-planning/SKILL.md#resolve-fixable-plan-concerns) resolves fixable plan concerns before the final report and readiness assessment, retaining scope, human decision, and execution boundaries. Commit `23563ee0`, first released in 0.3.45 (containing tag and slice-planning diff verified).
- **Watch disposition (2026-09-28):** Moved here at Terry Yin's instruction after the bounded source update and verification, before release or relevant use. Not resolved; effectiveness remains unverified.
- **Watch start:** Unknown; pending relevant use of guidance containing this response.
- **Review after:** Pending a verified watch start plus seven calendar days.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked; authoring review covered a sound plan, a fixable split, and an unresolved scope dispute; skill validation and payload-reference checks passed. No relevant fixable-concern handoff exercise is established. SEED-056 concerns a separate reporting decision, not an observed recurrence of the sizing handoff.

### Retained occurrence evidence

Planning recorded `not-ready` for a slice-sizing concern its own refinement could resolve, so execute-plan startup refused and the split needed a separate preparation cycle and an explicit keep before any work started.

- Execution: `SEED-028#plan-link-rule` / plan 116, first related implementation commit `7af15d4`
  - Timestamp: 2026-09-26T20:25:46+08:00 (Preparing announcement `eba94c3` after the refusal)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `1b66466`
  - Evidence: `ee563d5` recorded reason "Slice 1 … sizing is uncertain"; `execution-start.mjs start` → `source-refused`, "published preparation is needs-reassessment"; refinement split slice 1 by its two independent outcomes (`a6e6ef7`).
  - Observed effect: one human round trip plus an announce/land publication cycle before the claim. Qualified inference: the concern named its own remedy (split); refinement at planning time would have recorded ready.

<a id="odf-065"></a>

## ODF-065 — Undetected observer death

- **Response:** `8a7c770`, first released in 0.3.28, reports a dead worker as lost through mailbox selection and the host hook (tag and diff verified).
- **Watch start:** 2026-09-29T12:19:30Z; Doughnut plan 059 / `946dccd30f`, reported 0.3.47; its installed `.agents/skills/dough-update/VERSION` and hook confirm the released detector. The first Stop notice reports the lost worker.
- **Review after:** 2026-10-06T12:19:30Z (20:19:30 Asia/Singapore).
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked. Later worker-loss notices in Doughnut 059/060 and Pygardon 288/289 demonstrate detection rather than false attachment. Repetition after detection remains active under [ODF-144](finding-names.md#odf-144); unknown Open Dough/Pygardon execution releases do not backdate this watch. No supported recurrence of the original undetected-death mechanism.

### Retained source evidence

#### ODF-065 — A CI observer that died mid-execution stayed reported as attached until shutdown

Former local code: DD-063.

The observer is a detached process. After it dies, push registration still
writes a coverage receipt and the host hook still reports the observer as
attached, so lost coverage is first visible when the coordinator stops it.

##### Occurrences

- Execution: `SEED-021#see-published-work @ d0a9495`
  - Timestamp: 2026-09-20T09:40:05+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-1
  - Open Dough release: 0.3.26
  - Evidence: Mailbox `/tmp/dough-ci-501/watch-bx7k1Z`. The worker's last
    receipt writes are all at 2026-09-20T08:40:30+08:00; `c0d0a91` stayed
    `pending` although its GitHub run completed successfully. The data volume
    then filled (ENOSPC stopped slice 4 and the coordinator's own shell).
    Receipts for `e6ad710`, `53f6640`, and `1858a78` were written by
    `register-push` only and stayed `unchecked`. Every hook invocation kept
    adding "CI observer attached to this coordinator". `stop` returned
    `coverage.state: lost` at the timestamp above.
  - Observed effect: Three pushes had no CI observation while the coordinator
    believed they did. All of them passed when checked with `gh run list`, so
    nothing was missed this time.
  - Inference: Qualified. The worker most likely exited when the disk filled;
    the record shows when it stopped writing, not why. Neither `register-push`
    nor the hook checks that the recorded worker is still running.

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower current actionability than DD-185: ODF-065 (former DD-063; a dead observer still reported as attached), since the host hook now reports a dead worker as lost at the next interaction; recovery: `1dfb75ee:DearDough.md`.

<a id="odf-128"></a>

## ODF-128 — Whole-checkout formatting couples parallel slices

Formatting selected by checkout state touches or judges another live slice’s unfinished files, so delivery must wait or use owned-path substitutions.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

### Retained source evidence

#### open-dough

#### ODF-128 — A whole-repository formatter coupled concurrent slices' deliveries

Former local code: DD-117.

Delivery says to run the project's selective formatting command once before
staging, and file-disjoint slices may run concurrently. Here that command
checks every file in the checkout, so one slice's delivery also judged the
other slice's unreviewed, uncommitted work.

##### Occurrences

- Execution: `SEED-048#test-environment-correction` / plan 127, first related implementation commit `23a3a75`
  - Timestamp: unknown; before slice 1's commit at 2026-09-27T13:06:01+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `707f3ac7`
  - Evidence: slice 1's `npm run format` failed on SC2312 at
    `scripts/ci-container.sh:58`, slice 2's file, while slice 2 awaited its
    refactor pass.
  - Observed effect: slice 1's delivery stopped until the coordinator edited
    slice 2's uncommitted code; one extra formatter run.
  - Inference: Qualified; small cost here. Like DD-106, file-disjoint changes
    did not make shared tooling disjoint. Concurrent slices 1 and 2 still
    saved wall time.

#### pygardon

#### ODF-128 — Selective formatting of the whole checkout conflicts with concurrent slices in one execution worktree

Former local code: DD-121.

The project's `pnpm format:changed` selects every changed file in the checkout (unstaged, staged and untracked). With disjoint slices running concurrently in the same execution worktree, running it at one slice's delivery would also rewrite another live agent's in-progress files.

##### Occurrences

- Execution: `.planning/slice-plans/212-tfdc-verify-run-one-dispatch/PLAN.md` (first implementation commit `2e9e0a29a`); Timestamp: unknown (2026-09-27, slices 5, 7, 1 and 3); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.41. Evidence: `scripts/quality_changed.sh` builds its selection from `git diff --name-only`, `git diff --cached --name-only` and `git ls-files --others`; while the slice 1 agent was editing Python, the coordinator delivered slice 5 with `pnpm frontend:format` and slices 7 and 1 with `scripts/python_format.sh <owned files>` (the component steps `format:changed` runs), and used `format:changed` itself only once no other agent was editing. Observed effect: no race or lost edit; a deliberate deviation from "run `format:changed` once" for four deliveries. Inference: either the formatting step should accept the slice's owned paths, or concurrent slices need their own worktrees; otherwise the coordinator must pick between the rule and concurrency.
- Execution: `.planning/slice-plans/214-tfdc-verify-preserved-behavior-proof/PLAN.md` (recoverable at `1fabf2b1b`; first implementation commit `4437451a6`); Timestamp: unknown (2026-09-27, before `4437451a6` at 09:51:13+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.42. Evidence: slices 1 (Python test) and 2 (frontend spec) ran concurrently in one worktree; slice 1's refactor finished first, and the coordinator held its formatting and commit until slice 2's refactor returned, then ran `format:changed` once and made two commits. Observed effect: no race; slice 1's delivery waited for the other slice (about a minute here). Inference: holding delivery keeps the one-format rule at the cost of coupling concurrent slices' delivery; negligible for short slices, larger when one slice runs long.
- Execution: `.planning/slice-plans/215-tfdc-legacy-data-retirement/PLAN.md` (recoverable at `2edaf7864`; first implementation commit `c56908d12`); Timestamp: unknown (2026-09-27, deliveries of `d9c97163b`, `9e776d17e`, `c323aba5a`, `c6955a270`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown (dough skills last changed at `bb4f93165` before this Take `54024044c`). Evidence: slices 3/7, 7/4 and 4/8 ran concurrently in one worktree; the coordinator ran `ruff format --check` on each slice's owned files instead of `pnpm format:changed`, and used `format:changed` only for slices 1, 5, 6 and 9 when no other agent was editing. Observed effect: no race or lost edit; four deliberate deviations from the one-format rule.
- Execution: `.planning/slice-plans/219-atomic-fixture-publication/PLAN.md` (recoverable at `8030fca16`; first implementation commit `f582ac26a`); Timestamp: 2026-09-27T13:12:25+08:00 (slice 1 commit `f582ac26a`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.42. Evidence: slices 1 and 2 ran concurrently in one worktree; while the slice 2 agent was still editing `tests/stooq_reader_startup_tree_support.py`, the coordinator formatted slice 1 with `ruff format tests/ibkr_service_login_command_stop_support.py` instead of `pnpm format:changed`, then ran `format:changed` for slice 2 once nothing else was editing. Observed effect: no race or lost edit; one deliberate deviation from the one-format rule.
- Execution: `.planning/slice-plans/216-tfdc-search-throughput/PLAN.md` (recoverable at `b0b0918a0`; first implementation commit `cb7067227`); Timestamp: unknown (2026-09-27, deliveries of `cb7067227` and `53293b932`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: slices 1 and 2 ran concurrently in one worktree; the coordinator ran `ruff format` on each slice's owned Python files while the other agent was editing, and used `pnpm format:changed` for slices 3 and 3a once nothing else was editing. Observed effect: no race or lost edit; two deliberate deviations from the one-format rule.
- Execution: `.planning/slice-plans/221-responsive-stooq-warehouse/PLAN.md` (recoverable at `846f612fc`; first implementation commit `c2afd83ed`); Timestamp: 2026-09-27T18:38:03+08:00 (slice 1 commit `c2afd83ed`); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.42. Evidence: slices 1 and 3 ran concurrently in one worktree; slice 1's refactor returned first, and the coordinator held its formatting and commit until slice 3's refactor returned, then ran `format:changed` once and made two commits (`c2afd83ed`, `9d7ccd84b`). Observed effect: no race; slice 1's delivery waited about three minutes for the other slice.

<a id="odf-129"></a>

## ODF-129 — Proof reads another live slice’s edits

Whole-suite proof runs against a checkout another slice is changing, producing failures absent from the isolated accepted candidate.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

### Retained source evidence

#### Open Dough recovered source

#### ODF-129 — Full-suite proof in a checkout another agent was editing reported false failures

Former local code: DD-109.

`npm test` in the shared execution checkout, while a parallel slice edited `src/skills`, failed three payload-comparing checks; an isolated worktree with only the finished slice passed.

##### Occurrences

- Execution: `SEED-037#fourfold-local-suite` / plan 107, first related implementation commit `273ae9a`
  - Timestamp: unknown (after `c2e340d`, before `cee3f07` at 2026-09-26T14:09:29+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: unknown; installed guidance last updated by `f87d34c`
  - Evidence: failures in `install-all-tools.sh`, `native-delivery-updated-use{,-adapters}.sh`; isolated rerun at `c2e340d` plus slice 3 passed; slice 5's final candidate passed all three.
  - Observed effect: one wasted full suite and a diagnosis detour; later proof used detached worktrees.

- **Source snapshot:** `32e554d5:DearDough.md`; this recovery adds no new execution.

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower current actionability than DD-176, DD-177, and the DD-172 and ODF-097 recurrences: ODF-130 (concurrent slices sharing Playwright output) and ODF-129 (full-suite proof beside another agent's edits), since slices now run one at a time; recovery: `32e554d5:DearDough.md`.

<a id="odf-130"></a>

## ODF-130 — Parallel test output collisions

File-disjoint concurrent slices share a test output directory, allowing one run to delete artifacts another is writing.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

### Retained source evidence

#### Open Dough recovered source

#### ODF-130 — Concurrent slices in one checkout shared Playwright's output directory

Former local code: DD-106.

Running disjoint slices concurrently in one execution checkout let one agent's
Playwright run delete artifacts another run was writing.

##### Occurrences

- Execution: `SEED-028#admission-coherence` / plan 113, first related implementation commit `733fe46`
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5[1m]
  - Open Dough release: modified; revision 1b66466; base 0.3.41
  - Evidence: coordinator's dashboard consumer run for slice 2 (before
    `c7893ac`, 2026-09-26) failed with `ENOENT` on
    `dashboard/test-results/.playwright-artifacts-2/*.zip` while the flake
    agent ran Playwright; rerun alone passed 4/4.
  - Observed effect: one invalid proof run, repeated after the other agent
    returned.
  - Inference: Concurrent slices were otherwise useful here; file-disjoint
    changes do not make shared test output directories disjoint.

- **Source snapshot:** `32e554d5:DearDough.md`; this recovery adds no new execution.

- **Open Dough source retention history:** Removed on 2026-09-29 for the 1,000-line ceiling, as lower current actionability than DD-176, DD-177, and the DD-172 and ODF-097 recurrences: ODF-130 (concurrent slices sharing Playwright output) and ODF-129 (full-suite proof beside another agent's edits), since slices now run one at a time; recovery: `32e554d5:DearDough.md`.

<a id="odf-131"></a>

## ODF-131 — Foreign staged deletion enters a slice commit

A delegated git rm stages unfinished sibling work; committing the whole index includes it despite staging only the coordinator’s owned paths.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

### Retained source evidence

#### pygardon

#### ODF-131 — A concurrent slice's staged deletion was swept into another slice's commit

Former local code: DD-127.

An implementation agent deleted a test file with `git rm`, which staged the deletion while its slice was still in progress. The coordinator staged only the other slice's paths, but `agent-commit.mjs` commits the whole index, so the foreign deletion entered that slice's commit.

##### Occurrences

- Execution: `.planning/slice-plans/215-tfdc-legacy-data-retirement/PLAN.md` (recoverable at `2edaf7864`; first implementation commit `c56908d12`); Timestamp: unknown (2026-09-27, slice 4 delivery); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown (dough skills last changed at `bb4f93165` before this Take `54024044c`). Evidence: commit `0bdf39f93` stat listed `tests/strategy_catalog/test_live_strategy_catalog_columns.py | 126 -----` (slice 8's file); the coordinator reset that path to the parent in the index, amended to `c323aba5a`, and restored the staged deletion with `git rm --cached`; the slice 8 agent reported the same problem. Observed effect: one amend before publication; nothing wrong was published. Inference: when slices share a worktree, delegation should forbid index changes (plain `rm`, never `git rm`/`git add`), or the coordinator should check `git diff --cached` for foreign entries before committing.
