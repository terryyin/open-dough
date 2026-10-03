# Near-term watch list

Reviewed 2026-10-03 against all three project logs. These are released
responses inside their seven-day observation period; none is a claim that the
problem cannot recur. Source mappings and occurrence evidence for each entry:
`99292557:docs/maintainer/finding-names.md`,
`99292557:docs/maintainer/near-term-watch-list.md`, and the pre-trim records at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b`. Codes remain allocated after
removal. A new supported recurrence returns to the active catalog.

Retired on 2026-10-03 after an exercised week with no supported recurrence:
ODF-066, ODF-073, ODF-089, ODF-099.

<a id="odf-092"></a>

## ODF-092 — Missing Claude session identity

Delivery without `--session-json` returned `pendingCi: unobserved` because no guidance named Claude Code's `$CLAUDE_CODE_SESSION_ID`.

- **Response:** `9880cbb`, first released in 0.3.41, resolves the coordinator from CLAUDE_CODE_SESSION_ID at first delivery.
- **Watch start:** 2026-09-27 (date-only, Asia/Singapore); Doughnut plan 009 / `983ac6d18e`, 0.3.41.
- **Review after:** 2026-10-04.
- **Last assessed:** 2026-10-03; all three logs checked. Claude Code deliveries without session JSON attached on 0.3.50–0.3.54 (Open Dough plans 187, 192, 206; Pygardon plan 297; Doughnut plans 006 and 002). No recurrence. Cursor and Codex identity are separate: ODF-154, ODF-202.

<a id="odf-069"></a>
<a id="odf-112"></a>

## ODF-069, ODF-112 — Missing or silent CI verdicts

Registered revisions were reported uncovered although their run existed (ODF-069), and failed story-branch runs delivered no failure (ODF-112).

- **Response:** `d57783c8`, first released in 0.3.29, replaces the fixed discovery-poll bound with a delayed-discovery advisory; `5317499`, first released in 0.3.40, corrects selected-workflow identity.
- **Watch start:** 2026-09-27 (date-only); Doughnut plan 009 / `983ac6d18e`, 0.3.41, attached and reused an observer on the corrected release.
- **Review after:** 2026-10-04.
- **Last assessed:** 2026-10-03; all three logs checked. Every retained report is on 0.3.38 or earlier, or unknown. Observers on 0.3.41–0.3.54 completed with no missing-verdict report; Doughnut plans 058 and 007 (0.3.50) received CI failures and paused the next slice. Limit: the original ODF-112 environment was never recovered, so its cause is inferred. Transport loss (ODF-121) and non-Claude attachment (ODF-154, ODF-202) are separate and active.

<a id="odf-128"></a>
<a id="odf-129"></a>
<a id="odf-130"></a>
<a id="odf-131"></a>

## ODF-128, ODF-129, ODF-130, ODF-131 — Parallel slices interfere in one checkout

Concurrent slices of one plan shared a checkout: whole-checkout formatting judged another slice's files (128), proof read another slice's edits (129), test output directories collided (130), and a foreign staged deletion entered a slice commit (131).

- **Response:** `1d3a26cd`, first released in 0.3.43: finish each slice's delivery before starting the next in plan order.
- **Watch start:** 2026-09-28 (date-only, Asia/Singapore); Doughnut plan 005 / `56505b78dd`, 0.3.44.
- **Review after:** 2026-10-05.
- **Last assessed:** 2026-10-03; all three logs checked. Multi-slice executions on 0.3.50–0.3.54 in all three projects report no same-plan concurrent-writer interference. Limits: delegation launch times are not recorded. Open Dough plan 217 (ODF-204) had an interrupted agent and the coordinator active in one checkout, a different mechanism.

<a id="odf-065"></a>

## ODF-065 — Undetected observer death

After the detached observer died, push registration and the host hook still reported it attached.

- **Response:** `8a7c770`, first released in 0.3.28, reports a dead worker as lost.
- **Watch start:** 2026-09-29T12:19:30Z; Doughnut plan 059 / `946dccd30f`, 0.3.47.
- **Review after:** 2026-10-06T12:19:30Z.
- **Last assessed:** 2026-10-03; all three logs checked. Losses on 0.3.50 (Doughnut plan 006) and 0.3.54 (Open Dough plan 215) were detected and announced. No recurrence.

<a id="odf-144"></a>

## ODF-144 — Lost-worker notice repeatedly blocks turn completion

The Claude Stop hook repeated an already-recorded lost-worker notice at every later turn end.

- **Response:** `75bdc10d` (with `b0b29f71`, `4e0b2420`), first released in 0.3.48, reports a lost observer once and not after its stop.
- **Watch start:** 2026-09-30 (date-only, about 20:24 +08:00); Doughnut plan 006-reify-property, 0.3.50, lost observer `watch-N2C0GM` and reported no repeated blocking.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-03; all three logs checked. All seven reported executions are on 0.3.47 or earlier. Limit: one exercised loss; no Claude Code loss on 0.3.48+ in Open Dough or Pygardon.

<a id="odf-138"></a>
<a id="odf-139"></a>
<a id="odf-185"></a>
<a id="odf-196"></a>

## ODF-138, ODF-139, ODF-185, ODF-196 — Reported gaps accepted without checking the story

A returned gap was accepted as a limitation (138), dismissed as out of scope (139) or filed as a learning (185), and a fixture was reshaped to avoid the real example (196), each against the story's promise.

- **Response:** `b7930baf`, first released in 0.3.48 (SEED-058), adds the gap-and-fixture check to `wrap-up.md` "Accept proof".
- **Watch start:** 2026-09-30 (date-only); Doughnut plan 006-reify-property, 0.3.50, slice acceptances under the released text.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-03; all three logs checked. All retained reports are on 0.3.46 or earlier, or unknown. Slice acceptances on 0.3.50–0.3.54 show no recurrence; Pygardon plan 300 (0.3.54) checked two reported gaps and recorded a correction. Limits: Claude Code only; a deferred gap lost in delegation is active as ODF-156.

<a id="odf-093"></a>
<a id="odf-105"></a>

## ODF-093, ODF-105 — Stash operations touch another writer's work

An unqualified stash pop applied another session's stash (093), and a delivery command stashed another slice's uncommitted files (105).

- **Response:** `f157f0e` and `86e5069`, first released in 0.3.42, isolate the owned stash and require owned-path staging; `8f88364`, first released in 0.3.43, adds restore and drop safety.
- **Watch start:** 2026-09-30 (date-only); Open Dough plan 172, VERSION 0.3.47, used the owned-stash repair protocol.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-03; all three logs checked. Both reports predate 0.3.42. Owned stash and restore ran in Open Dough plans 172, 186, 191 and 216 without touching foreign work. Limit: no execution met a real foreign stash or live second writer, so that boundary is unexercised.

<a id="odf-176"></a>
<a id="odf-177"></a>

## ODF-176, ODF-177 — Provenance and shared-context edits invalidate readiness

A sibling's wrap-up or refinement changed a ready story's recorded basis, and startup refused it as needing reassessment.

- **Response:** `dc1f5e0d`, first released in 0.3.53, keeps the recorded readiness judgment and reports changes since review instead of refusing.
- **Watch start:** 2026-10-02 (date-only); Open Dough plan 214, 0.3.54, start reported "Changed since readiness review" and proceeded.
- **Review after:** 2026-10-09.
- **Last assessed:** 2026-10-03; all three logs checked. All reports are on 0.3.47 or earlier. No refusal in Pygardon's 0.3.54 executions; whether any had a changed basis is not recorded.

<a id="odf-120"></a>

## ODF-120 — Satisfied prerequisites leave stale readiness

A dependency lands but its dependent story keeps a not-ready assessment whose only reason was that dependency.

- **Response:** `8bb73be0` and `186ef150`, first released in 0.3.55, record blocking story dependencies and resolve them from completed suppliers.
- **Watch start:** unknown. No project has run 0.3.55 (Pygardon and Doughnut have 0.3.54 installed).
- **Review after:** not set until a start is established.
- **Last assessed:** 2026-10-03; all three logs checked. Reports are on 0.3.38–0.3.47 or unknown. Limit: whether the response covers a free-text not-ready reason, as opposed to a recorded dependency, is unverified.
