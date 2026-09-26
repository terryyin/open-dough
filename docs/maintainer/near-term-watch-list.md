# Near-term watch list

Reviewed 2026-09-26 (Asia/Singapore) against all three project logs. These codes
remain allocated. Retire only after seven days, relevant exercise and no
unresolved recurrence. Historical detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/near-term-watch-list.md`.

<a id="odf-056"></a>

## ODF-056 — Symlink CLI startup

- **Sources:** Open Dough / DD-066 (literal CLI); Doughnut / DD-065.
- **Response:** `eff69eb`, first released in 0.3.27, compares real paths at all three CLI entrypoints.
- **Watch start:** 2026-09-21; Doughnut ownership review `2381cf9e60:DearDough.md` reproduced installed 0.3.26 failure and observed `CI_OBSERVER` through the skill symlink with isolated released 0.3.27.
- **Review after:** 2026-09-28.
- **Last assessed:** 2026-09-26; no supported recurrence. This is isolated boundary exercise, not a verified installation or evidence about missing aliases ([ODF-085](finding-names.md#odf-085)).

<a id="odf-066"></a>

## ODF-066 — Unpublished queue claims

- **Source:** Open Dough / DD-064; original execution `d0a9495`, guidance 0.3.26.
- **Response:** `be94345` / `f699e60`, first released in 0.3.27; shared startup `194617b` / `1a63c0c` / `6f5d0ef`, first released in 0.3.33. Native queued-start acceptance is complete in SEED-008.
- **Watch start:** 2026-09-24 (date-only); Doughnut plan 022 / `70b3b67313` used released 0.3.33 startup and recorded its claim receipt. Open Dough plan 092 also records Take `1443c42`, 0.3.38, at 20:27:08+08:00. Evidence remains under [ODF-099](#odf-099).
- **Review after:** 2026-10-01.
- **Last assessed:** 2026-09-26; no supported unpublished-claim recurrence. Startup use does not certify every concurrency/refusal case; oversized receipts have a separate watch below.

<a id="odf-073"></a>

## ODF-073 — Late CI attachment

The coordinator arms the observer only after the first slice push, leaving that publication outside the intended observation sequence.

- **Response / verified use:** Managed delivery 02991a5 / 493187c first released in 0.3.33 establishes observation at delivery. Pygardon plan 185 / c2170df0f, 0.3.37, supplied session input on the first delivery (ODF-092 workaround row).
- **Watch start:** 2026-09-24 (date-only).
- **Review after:** 2026-10-01.
- **Last assessed:** 2026-09-26; all three current logs checked. Ordering exercised; session-input and owner-delivery problems stay under ODF-092 and ODF-103. The historical late-start report had unknown release and added no coverage loss beyond its independent adapter failure.

### Retained evidence

- pygardon: Execution: `.planning/quick/125-stooq-refresh-memory-safety/PLAN.md` at `77dfb2c0c`; Timestamp: 2026-09-17T11:23:10+08:00; Tool: Claude Code; Model: claude-sonnet-5; Open Dough release: unknown.
- **Source snapshot:** pygardon `cc2950b293e80948d5cacfa0bbbf85cda4376a1b:DearDough.md`; DD-057.

<a id="odf-089"></a>

## ODF-089 — Misleading ended observers

After persistent polling errors produce a normal terminal result, later push registration and attachment still look active even though that observer will never poll the new revision.

- **Response / verified use:** ddcabcb, first released in 0.3.33, excludes terminal mailboxes from live reuse. Doughnut plan 034 / 36eb15caaa on 0.3.38 reported monitor-unavailable and later unobserved (Doughnut ODF-121).
- **Watch start:** 2026-09-25 (date-only).
- **Review after:** 2026-10-02.
- **Last assessed:** 2026-09-26; all three current logs checked. This later ended observer was not falsely reported live. Its transient transport termination is separately active as ODF-121; not a success claim for transport resilience.

### Retained evidence

- open-dough: Execution: `.planning/quick/076-path-filter-aware-ci-observation/PLAN.md @ a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865` - Timestamp: 2026-09-22T07:12+00:00 - Tool: Claude Code - Model: claude-sonnet-5 - Open Dough release: modified; revision a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865; base 0.3.28 - Evidence: mailbox `/tmp/dough-ci-501/watch-Q6ZEF0`'s event 3 (`CI_MONITOR_UNAVAILABLE`, TLS timeout) and `result.json` (`finished`) both predate two later `register-push` calls (mtimes ~10/~30 min after); `ps` confirmed the worker pid was gone. - Observed effect: two SHAs registered against an ended observer with no distinguishing signal; the gap surfaced only via a manual `gh` cross-check near execution end. - Inference: Qualified, single occurrence; mechanism is deterministic and the triggering network instability recurred repeatedly this session, so recurrence is plausible. Not tested: a distinct "CI observer ended" hook message, mirroring "lost its worker."
- **Source snapshot:** open-dough `a951fc04a5e8dfcc0f1f55660b00ae0eb9611bc5:DearDough.md`; DD-090.

<a id="odf-093"></a>

## ODF-093 — Foreign stash restoration

- **Response:** `f157f0e` (CI repair pause through `ci-repair-stash.mjs`, own entry by OID only) and `86e5069` (delegated agents barred from stash, pop, reset, clean, path checkout, and branch switch in a shared checkout); not yet released after 0.3.41.
- **Watch start:** 2026-09-26 (date-only; delivered, unreleased). Exercised only by deterministic tests and a behavior review walk; no real CI repair pause or shared-stack incident observed yet.
- **Review after:** seven days after the first release containing `f157f0e`.
- **Last assessed:** 2026-09-26; a conflicting restore still misreports what it applied and leaves the final drop to the coordinator, owned by the queued correction `SEED-008#truthful-repair-restore`.

<a id="odf-099"></a>

## ODF-099 — Oversized startup receipts

Startup serializes full before/after Git index snapshots into its coordinator receipt, hiding necessary fields behind oversized tool output.

- **Response / verified use:** 075e955, first released in 0.3.40, removes index/patch snapshots and returns only decision fields. Pygardon plan 200 reports 0.3.40 and successful Take efd7ed2e1; that commit's installed execution-start-receipt.mjs matches the compact response.
- **Watch start:** 2026-09-26 (date-only).
- **Review after:** 2026-10-03.
- **Last assessed:** 2026-09-26; all three current logs checked. Actual released startup use verified; no supported oversized-output recurrence. Historical later reports still use 0.3.38/0.3.39 or unknown releases. This watch does not close the previously recorded Claude/Codex/Cursor native acceptance gaps or claim a measured size for plan 200.

### Retained evidence

- pygardon: Execution: `.planning/quick/185-ci-capacity-hold-attention/PLAN.md` (first implementation commit `c2170df0f`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the start receipt was persisted as an oversized tool result (577.8 KB) and had to be re-read through a filtering script to find `status`, `publishedSha` and the maintenance results. Effect: one extra call and a context-heavy preview. Inference: the index is maintenance evidence the coordinator never needs in the receipt; a digest or omission would do.
- pygardon: Execution: `.planning/quick/187-bounded-ci-observation/PLAN.md` (first implementation commit `132b3e53e`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `8d5010ce7` was persisted as an oversized tool result (580.8 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged by the 0.3.38 update.
- pygardon: Execution: `.planning/quick/188-halve-ci-wall-time/PLAN.md` (first implementation commit `51b7aa206`); Timestamp: unknown (2026-09-24); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt for `b49624f1b` was persisted as an oversized tool result (580.9 KB); only its preview was usable. Effect: context-heavy preview. Inference: unchanged.
- pygardon: Execution: `.planning/quick/190-worktree-python-fast-path/PLAN.md` (first implementation commit `3f21aa9fe`); Timestamp: unknown (claim `1e69bb258` at 2026-09-25T08:20:51+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. Evidence: the claim receipt was persisted as an oversized tool result (581.2 KB) and re-read through a filtering script. Effect: one extra call. Inference: unchanged.
- pygardon: Execution: `.planning/quick/193-tests-without-time-waits/PLAN.md` (first implementation commit `ffe4db64e`); Timestamp: unknown (claim `0ef7f2db1`, 2026-09-25); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.39. Evidence: the claim receipt was persisted as an oversized tool result (582.7 KB) with only its preview usable. Effect: context-heavy preview. Inference: unchanged in 0.3.39.
- pygardon: Execution: `.planning/quick/196-tfdc-dead-behavior-removal/PLAN.md` (first implementation commit `b19bd341b`); Timestamp: unknown (claim `ebf14d9f8`, 2026-09-25); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: unknown. Evidence: the claim receipt was persisted as an oversized tool result (586.8 KB) with only its preview usable, and `afterMaintenance` had to be grepped out. Effect: one extra call. Inference: unchanged.
- **Source snapshot:** pygardon `cc2950b293e80948d5cacfa0bbbf85cda4376a1b:DearDough.md`; DD-088.
- doughnut: Execution: SEED-035 story 1 / quick/022-browse-download-notebook-files / 70b3b67313; Timestamp: 2026-09-24T11:09+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.33. - Evidence: startup call output "Output too large (811.3KB)"; preview shows `beforeMaintenance.result: deferred`, `reason: unclear-ownership`, then `index: "100644 … .agents/agent-map.md\n…"`. - Observed effect: the exact receipt the skill requires preserving was not fully visible in context; later fields (for example refresh results after the index) were unread. - Inference: a maintenance diagnostic that lists every tracked file scales with repository size; a count or digest would keep the receipt usable.
- doughnut: Execution: SEED-035 story 3 / quick/024-note-local-picture-file / f0cc15be6a; Timestamp: 2026-09-24T14:10+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (814.6KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: the coordinator needed an extra `python3` call to read the receipt's later fields (`afterMaintenance: advanced`, `projectSetupRequired: true`).
- doughnut: Execution: SEED-035 story 14 / quick/025-convert-raw-notebooks-to-lfs / 071d0e0861; Timestamp: 2026-09-24, ~15:45+08:00 (queued startup, between readiness commit 47df9474c2 and slice 1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (815.7KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 20 / quick/026-test-file-journeys-on-lfs / 5859e6d663; Timestamp: 2026-09-24, ~17:28+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.37. - Evidence: startup call output "Output too large (816.5KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 4 / quick/027-web-uploaded-pictures-as-notebook-files / 4250de93e1; Timestamp: 2026-09-24, ~21:17+08:00 (queued startup; Take commit 21:16:55+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 19 / quick/029-remove-raw-file-storage / 0284ea7f52; Timestamp: 2026-09-25T09:02+08:00 (queued startup; Take commit 09:01:48+08:00); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.8KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `node` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 5 / quick/033-move-legacy-note-pictures / 4dad58408f; Timestamp: 2026-09-25, ~14:19+08:00 (queued startup, Take commit 269a569079); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (816.6KB)"; `beforeMaintenance.index` holds the full index listing. - Observed effect: an extra `node` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-035 story 17 / quick/034-book-source-as-notebook-file / 36eb15caaa; Timestamp: 2026-09-25, ~15:45+08:00 (queued startup, Take commit 6926d8a1a1); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (817.3KB)"; `beforeMaintenance.index` and `afterMaintenance.index` hold the full index listing. - Observed effect: an extra `python3` call was needed to read `afterMaintenance` and `projectSetupRequired`.
- doughnut: Execution: SEED-039 story 4 / quick/041-faster-frontend-unit-tests / c9347a9ee3; Timestamp: 2026-09-26T08:24+08:00 (queued startup); Tool: Claude Code; Model: claude-opus-5-5; Open Dough release: 0.3.38. - Evidence: startup call output "Output too large (819.2KB)"; the coordinator parsed the saved file with a script to read `publishedSha`, `workspace`, and the maintenance results. - Observed effect: one extra call to recover the receipt fields.
- **Source snapshot:** doughnut `0d92ca6c226fc0d755a9b159e2cb3259a68f009f:DearDough.md`; DD-108.

ODF-099 earlier Open Dough evidence remains at `b633e1d:DearDough.md`, `876a0b0:DearDough.md`, `bde06c7:DearDough.md`, `6494de2:DearDough.md` and `e11c09a:DearDough.md`. Plan 100 / 075e955, Claude Code claude-opus-5-5[1m], unknown execution release, reported a 236,870-byte pre-change receipt; real CLI fixtures at 989a34c measured 286 KB–1.1 MB before versus 306–330 bytes after. Those fixture observations do not establish client adoption.

<a id="odf-105"></a>

## ODF-105 — Stashing another writer's work

- **Response:** `86e5069` makes coordinator commits stage owned paths only, never stashing, resetting, or restaging a sibling writer's work; not yet released after 0.3.41.
- **Watch start:** 2026-09-26 (date-only; delivered, unreleased). Plan 114 itself committed two parallel slices from one worktree by owned-path staging with the sibling's files left unstaged.
- **Review after:** seven days after the first release containing `86e5069`.
- **Last assessed:** 2026-09-26; no recurrence.
