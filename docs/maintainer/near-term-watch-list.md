# Near-term watch list

Reviewed 2026-09-30 against all three project logs. These are exercised released
responses still inside their seven-day observation period; none is retired by
this trim as a successful fix. Full historical mappings and occurrence evidence:
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b:docs/maintainer/near-term-watch-list.md`.
Codes remain allocated after removal. A new supported recurrence returns to the active catalog.

<a id="odf-066"></a>

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
- **Last assessed:** 2026-09-30; all three current logs checked. Ordering exercised; session input is separate under ODF-092. Owner binding was corrected by 50b6d71 / 0.3.38 but is outside this watch. The historical late-start report had unknown release and added no coverage loss beyond its independent adapter failure.

<a id="odf-089"></a>

## ODF-089 — Misleading ended observers

After persistent polling errors produce a normal terminal result, later push registration and attachment still look active even though that observer will never poll the new revision.

- **Response / verified use:** ddcabcb, first released in 0.3.33, excludes terminal mailboxes from live reuse. Doughnut plan 034 / 36eb15caaa on 0.3.38 reported monitor-unavailable and later unobserved (Doughnut ODF-121).
- **Watch start:** 2026-09-25 (date-only).
- **Review after:** 2026-10-02.
- **Last assessed:** 2026-09-30; all three current logs checked. This later ended observer was not falsely reported live. Its transient transport termination is separately active as ODF-121; not a success claim for transport resilience.

<a id="odf-099"></a>

## ODF-099 — Oversized startup receipts

Startup serializes full before/after Git index snapshots into its coordinator receipt, hiding necessary fields behind oversized tool output.

- **Response / verified use:** 075e955, first released in 0.3.40, removes index/patch snapshots and returns only decision fields. Pygardon plan 200 reports 0.3.40 and successful Take efd7ed2e1; that commit's installed execution-start-receipt.mjs matches the compact response.
- **Watch start:** 2026-09-26 (date-only).
- **Review after:** 2026-10-03.
- **Last assessed:** 2026-09-30; all three current logs checked. Actual released startup use verified; no supported oversized-output recurrence. Historical later reports still use 0.3.38/0.3.39 or unknown releases. This watch does not close the previously recorded Claude/Codex/Cursor native acceptance gaps or claim a measured size for plan 200.

<a id="odf-092"></a>

## ODF-092 — Missing Claude session identity

Delivery without `--session-json` returned `pendingCi: unobserved`; no guidance names Claude Code's `$CLAUDE_CODE_SESSION_ID`. A retry for the accepted SHA was refused ("rebase left the pre-rebase SHA") after starting an unreported observer. Seven older occurrences (plans 089, 092, 096, 097 twice, 099, 100) are pruned; see Retention.

- **Source mappings:** Open Dough / DD-095 (Claude occurrences), Pygardon / DD-085, Donut / DD-107 (Claude identity occurrences).
- **Response:** `9880cbb`, first released in 0.3.41 (containing tag and ci-host-bridge/execution-increment-observation diff verified). Resolves the coordinator from CLAUDE_CODE_SESSION_ID for first delivery and uses that same owner to bind; explicit session input remains authoritative.
- **Watch start:** 2026-09-27 (date-only, Asia/Singapore). Donut plan 009 / `983ac6d18e`, released 0.3.41: deliver without session JSON attached watch-gBNzg7 and later reused it. That execution commit’s installed VERSION and ci-host-bridge contain the verified response.
- **Review after:** 2026-10-04.
- **Last assessed:** 2026-09-30; all three current logs checked. No supported Claude identity recurrence after the response; unknown releases remain unknown. Cursor plan 126 is separate ODF-154. Successful attachment does not prove every notification path.

<a id="odf-065"></a>

## ODF-065 — Undetected observer death

The observer is a detached process. After it dies, push registration still writes a coverage receipt and the host hook still reports the observer as attached, so lost coverage is first visible when the coordinator stops it.

- **Response:** `8a7c770`, first released in 0.3.28, reports a dead worker as lost through mailbox selection and the host hook (tag and diff verified).
- **Source mappings:** Open Dough / DD-063.
- **Watch start:** 2026-09-29T12:19:30Z; Doughnut plan 059 / `946dccd30f`, reported 0.3.47; its installed `.agents/skills/dough-update/VERSION` and hook confirm the released detector. The first Stop notice reports the lost worker.
- **Review after:** 2026-10-06T12:19:30Z (20:19:30 Asia/Singapore).
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked. Later worker-loss notices in Doughnut 059/060 and Pygardon 288/289 demonstrate detection rather than false attachment. Repetition after detection remains active under [ODF-144](finding-names.md#odf-144); unknown Open Dough/Pygardon execution releases do not backdate this watch. No supported recurrence of the original undetected-death mechanism.

<a id="odf-128"></a>

## ODF-128 — Whole-checkout formatting couples parallel slices

Formatting selected by checkout state touches or judges another live slice’s unfinished files, so delivery must wait or use owned-path substitutions.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Source mappings:** Open Dough / DD-117; Pygardon / DD-121.
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

<a id="odf-129"></a>

## ODF-129 — Proof reads another live slice’s edits

Whole-suite proof runs against a checkout another slice is changing, producing failures absent from the isolated accepted candidate.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Source mappings:** Open Dough / DD-109.
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

<a id="odf-130"></a>

## ODF-130 — Parallel test output collisions

File-disjoint concurrent slices share a test output directory, allowing one run to delete artifacts another is writing.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Source mappings:** Open Dough / DD-106.
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.

<a id="odf-131"></a>

## ODF-131 — Foreign staged deletion enters a slice commit

A delegated git rm stages unfinished sibling work; committing the whole index includes it despite staging only the coordinator’s owned paths.

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order (containing tag and execute-plan/delegation/wrap-up diffs verified).
- **Source mappings:** Pygardon / DD-127.
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44. That snapshot's installed VERSION and execute-plan contain the response; its source report records slice 1 delivery at 11:16:07+08:00 and slice 3 proof/delivery later at 11:32–11:37+08:00.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-09-30 (Asia/Singapore); all three current logs checked, including later 0.3.45–0.3.47 multi-slice reports. Released multi-slice use is evidenced and no same-plan concurrent-writer interference is reported after it. Coverage limit: delegation launch times are absent, so the records do not certify every slice was serialized or that arbitrary other sessions cannot interfere. Different baseline/cleanup mutations remain active under ODF-155/181/183. Earlier 0.3.41/0.3.42 and unknown reports are not post-fix recurrences; no finding is yet retired on this watch.
