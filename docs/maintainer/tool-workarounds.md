# Tool workarounds

Keep one entry per active workaround under
[ADR 0005](../adrs/0005-cross-tool-validation-accepted.md#6-recheck-tool-specific-workarounds).
Record the observed tool and revision, Distribution location and introducing
revision, first release tag when known, reproduction, retirement criteria, and
latest review. Each review records its date, tested revisions, evidence,
decision (keep, simplify, retire, or inconclusive), and next review trigger.
Use Git for earlier reviews and retired entries.

## Codex supplier-watch wakes

- **Symptom.** Early returns during a quiet supplier watch prompted excess model
  requests on Codex CLI `0.171.0`, Code Mode enabled, `gpt-6.2-sol` at high effort.
- **Distribution patch.** The [Codex example under Watch a paused supplier](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#watch-a-paused-supplier)
  makes the five-minute waits explicit. Introduced in
  [`5bbbc506a`](https://github.com/terryyin/open-dough/commit/5bbbc506a3a6d9b1b3ef1352df6d122c8c6710d5).
  First release tag pending.
- **Reproduce.** Pin the Distribution payload in an isolated native Codex
  session with a local bare Git remote. Remove the supplier-specific Codex
  example and its wait instructions, restoring the generic long-proof route.
  In one run, wait about nine minutes, push a provisional change, then push the
  qualifying change after the provisional receipt and before the next watch.
  In another, keep the remote unchanged through a deadline just over five
  minutes away. Save the rollout and independent push timestamps. Use the
  [native check procedure](../../Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding)
  and the [SEED-431 comparison](https://github.com/terryyin/open-dough/blob/44c865eeb3a18ae7a91a0d49e08f1f680984e9e4/.planning/slice-plans/809-reduce-codex-wakes-during-supplier-watches/PLAN.md#first-matched-comparison).
- **Retire when.** Each unchanged interval has at most one watch-only model
  request per started five minutes, with at least 90% cached input if there are
  any. Exclude the initial launch and receipt judgment. Treat ambiguous
  attribution that could change the verdict as inconclusive. The provisional
  publication keeps the hold, the retry keeps the same remote, refs, and
  absolute deadline, and the qualifying publication resumes work once. Expiry
  preserves partial work and records the resume condition.
- **Last review.** 2026-11-24, keep. On the profile above, the observed counts
  went from 10 to 1 for publication and from 5 to 1 for expiry. The comparison
  used prepatch `faddac224a` and the revised guidance in `5bbbc506a`.
  Recheck after a Codex release affecting command or cell waits, or in a
  periodic review once a newer Codex build is available.
