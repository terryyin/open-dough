# Near-term watch list

Reviewed 2026-10-06 against the current Open Dough, Pygardon and Doughnut logs,
in Asia/Tokyo. Released responses remain observations, not guarantees against
recurrence. Earlier source mappings and full occurrence evidence are recoverable
at `99292557:docs/maintainer/finding-names.md`,
`99292557:docs/maintainer/near-term-watch-list.md`, and the pre-trim records at
`9ab3ca6e827da4aed77243ecd89d85908d3b4a4b`. Codes stay allocated after removal.
Unknown starts and unexercised responses stay in the active catalog. A supported
recurrence returns there without inheriting the previous watch’s elapsed time.

<a id="odf-065"></a>

## ODF-065 — Undetected observer death

After the detached observer died, push registration and the host hook still reported it attached.

- **Response:** `8a7c770`, first released in 0.3.28, reports a dead worker as lost.
- **Watch start:** 2026-09-29T12:19:30Z; Doughnut plan 059 / `946dccd30f`, 0.3.47.
- **Review after:** 2026-10-06T12:19:30Z.
- **Last assessed:** 2026-10-06; all three logs checked. Losses on 0.3.50 (Doughnut plan 006) and 0.3.54 (Open Dough plan 215) were detected and announced. No recurrence.

- **Date check:** Assessed on 2026-10-06 in Asia/Tokyo before 2026-10-06T12:19:30Z (21:19:30 Japan time). Seven full days have not yet elapsed; retain until the recorded review time. The new unexplained loss under ODF-208 was announced, so it is not undetected death.

<a id="odf-144"></a>

## ODF-144 — Lost-worker notice repeatedly blocks turn completion

The Claude Stop hook repeated an already-recorded lost-worker notice at every later turn end.

- **Response:** `75bdc10d` (with `b0b29f71`, `4e0b2420`), first released in 0.3.48, reports a lost observer once and not after its stop.
- **Watch start:** 2026-09-30 (date-only, about 20:24 +08:00); Doughnut plan 006-reify-property, 0.3.50, lost observer `watch-N2C0GM` and reported no repeated blocking.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-06; all three logs checked. All seven reported executions are on 0.3.47 or earlier. Limit: one exercised loss; no Claude Code loss on 0.3.48+ in Open Dough or Pygardon.

<a id="odf-138"></a>
<a id="odf-185"></a>
<a id="odf-196"></a>

## ODF-138, ODF-185, ODF-196 — Reported gaps accepted without checking the story

A returned gap was accepted as a limitation (138) or filed as a learning (185), and a fixture was reshaped to avoid the real example (196), each against the story's promise.

- **Response:** `b7930baf`, first released in 0.3.48 (SEED-058), adds the gap-and-fixture check to `wrap-up.md` "Accept proof".
- **Watch start:** 2026-09-30 (date-only); Doughnut plan 006-reify-property, 0.3.50, slice acceptances under the released text.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-06; all three logs checked. All retained reports are on 0.3.46 or earlier, or unknown. Slice acceptances on 0.3.50–0.3.56 show no recurrence; Pygardon plan 300 (0.3.54) checked two reported gaps and recorded a correction. Limits: Claude Code only; a deferred gap lost in delegation is active as ODF-156.

- **Related failed response:** ODF-139 is active again: Pygardon plan 303 / 0.3.56 repeats a false scope judgment after this same 0.3.48 response. The three identities here are distinct; the shared gap check is not proven effective as a whole, and their observations do not retire the recurring ODF-139 mechanism.

<a id="odf-093"></a>
<a id="odf-105"></a>

## ODF-093, ODF-105 — Stash operations touch another writer's work

An unqualified stash pop applied another session's stash (093), and a delivery command stashed another slice's uncommitted files (105).

- **Response:** `f157f0e` and `86e5069`, first released in 0.3.42, isolate the owned stash and require owned-path staging; `8f88364`, first released in 0.3.43, adds restore and drop safety.
- **Watch start:** 2026-09-30 (date-only); Open Dough plan 172, VERSION 0.3.47, used the owned-stash repair protocol.
- **Review after:** 2026-10-07.
- **Last assessed:** 2026-10-06; all three logs checked. Both reports predate 0.3.42. Owned stash and restore ran in Open Dough plans 172, 186, 191 and 216 without touching foreign work. Limit: no execution met a real foreign stash or live second writer, so that boundary is unexercised.

- **Additional use:** Open Dough plan 246 / 0.3.56 used `ci-repair-stash.mjs` entry `97bf6485` to park and restore an interrupted agent’s 17 edited files. No foreign-stash collision is evidenced; that boundary remains unexercised.

<a id="odf-176"></a>
<a id="odf-177"></a>

## ODF-176, ODF-177 — Provenance and shared-context edits invalidate readiness

A sibling's wrap-up or refinement changed a ready story's recorded basis, and startup refused it as needing reassessment.

- **Response:** `dc1f5e0d`, first released in 0.3.53, keeps the recorded readiness judgment and reports changes since review instead of refusing.
- **Watch start:** 2026-10-02 (date-only); Open Dough plan 214, 0.3.54, start reported "Changed since readiness review" and proceeded.
- **Review after:** 2026-10-09.
- **Last assessed:** 2026-10-06; all three logs checked. All reports are on 0.3.47 or earlier. No refusal in Pygardon's 0.3.54 executions; whether any had a changed basis is not recorded.

- **Coverage limit:** Later 0.3.56 starts exist in all three projects, but no new changed-basis refusal is reported and none is manufactured from installation alone.
