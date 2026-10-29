# Trial ledger

Activation supplied by coordinator: 2026-10-29T06:23:43Z.
Recruitment deadline: 2026-11-12T06:23:43Z; final: 2026-11-19T06:23:43Z.
Caps: 120 summed task-minutes, 30 human minutes; reserve eight final minutes.
Calibration plus final scoring combined cap: 20 minutes.

| Screened time | Candidate | Eligibility/reason | Enrolled case | Frozen inputs/order | Result |
| --- | --- | --- | --- | --- | --- |
| 2026-10-29T06:25:39Z | origin/main at 9f5bf344 | Claim/preparation only; no ordinary contract change candidate | none | Coordinator intake provenance | Excluded from prospective outcomes |
| 2026-10-29T06:25:39Z | origin/codex/production-policy-ci-time at 2f8cb0e23717e91c6899dc2a26b65dcc9ffd2425 | Planning-only commit predates activation (14:02:27+08); full trace/handoff unavailable | none | Coordinator intake provenance | Deferred; not yet eligible |
| 2026-10-29T06:25:39Z | origin/codex/proof-claims at 64dcb0bee...; origin/cursor/prevent-a-second-refinement-or-execution-session at 07699db... | Completed historical branches, per coordinator intake | none | Exact ref names supplied by coordinator; SHAs retained abbreviated as observed | Excluded historical work |

No prospective changes enrolled by slice 1; the intake screens above retain coordinator-supplied provenance, not an independent remote inspection. Calibration does not
consume any of the four prospective case slots. No scheduled wakeup created.

## Calibration host probe

Order fixed before dispatch: A then B (known rehearsal only; not a prospective
randomization). Two fresh fork_turns=none tasks, inherited/default model and
settings, no model override; same brief/access/budget, assigned packet only.
Resolved model, queue/blocking time, usage/money and active CPU are unknown unless
host reports them. Same requested configuration does not establish hidden host
implementation identity. Retain returned results without favorable retry.

## Task accounting retained at first delivery

- Calibration leaf dispatch observed in native parent log: 06:25:10.210Z;
  first tool clock 06:25:17Z, final tool clock 06:32:23Z. Charge at least the
  conservative observed 432.79s / 7.2132min dispatch-to-final-clock span; native
  returned-message boundary still needs reconciliation. Nested review intervals
  121s are included once, leaving 311.79s of non-overlapping leaf interval.
- Source-only review: native dispatch 06:24:36.949Z, return06:25:10.271Z,
  33.322s / 0.5554min; separate source-proof controller work, not a case review.
- Independent refactor: dispatch06:34:42.186Z; observed final clock06:35:33Z,
  at least50.814s / 0.8469min. No edits; all six original hashes verified,
  reviewer/assessor scoring separation accepted, REFACTOR COMPLETE returned.
- Coordinator timing lacks a complete active/non-wait decomposition. Use a
  deliberately conservative 17-minute calibration budget charge: it bounds the
  calibration leaf plus the entire coordinator06:25:10–06:34:42 window, even
  though this overcounts waiting. It is a cap-reservation bound, not observed
  cost or mechanism T. No further calibration is allocated; at most three of
  the combined20 minutes remain for final scoring. Keep eight minutes reserved
  under the separate120-minute total cap; stop inconclusive if scoring cannot
  finish within its smaller remaining calibration/scoring cap.
- Whole-trial accounting at06:39:41Z: root activation-to-clock span15.9667min
  plus calibration7.2132, source0.5554 and refactor0.8469 gives a conservative
  upper-bound reservation24.5822min (actual total lower because waiting overlaps).
  Exact non-overlapping coordinator cost, human reading minutes, usage and money
  remain unknown; never use this upper bound as a measured treatment benefit.
  No human decisions were solicited by either reviewer. Admission/landing before
  activation is separate and its complete cost is unknown.

## Next intake observation

At2026-10-29T06:39:41Z, after a freshness fetch, the local remote ref
origin/codex/production-policy-ci-time had advanced to
90ea771039c36761b5973ab728e73ddcbce19935, committed14:34:03+08 after activation.
Subject: Reduce redundant production policy builds while preserving real coverage.
Potential eligible implementation; complete trace/handoff not yet checked. No
case enrolled or results inspected at this boundary. Preserve the earlier
planning-only screen; investigate this first potential case after slice1 delivery.

## First eligible case and stop

- Case01 enrolled: candidate90ea771039c36761b5973ab728e73ddcbce19935;
  first implementation identified06:39:41Z, source/normal-record eligibility
  inspected after slice1 publication. See case-01/RESULT.md for frozen inputs.
- Packet preparation06:43:06–06:46:04.924321Z,178.924321s; original C/I0 and
  full attributed P_A/P_B unknown. All69 common hashes/A/B hashes reverified.
- Independent audit dispatched06:43:33.881Z; deadline06:47:33.881Z; declared
  freeze06:47:46Z exceeded cap. Interrupted06:47:54.995Z,261.114s charge.
  Late audit retained unaccepted; zero arms, zero complete pairs, one incomplete
  enrolled case. Stop recruitment; no replacement or retry and no benefit score.
- Added known reservation packet178.924321s + audit261.114s =440.038321s,
  7.3340 task-minutes, excluding separately counted parent work. Full non-wait
  controller/human cost remains unknown. Neither cap overrun nor missing cost is
  reclassified as free. Final interpretation is inconclusive; source story and
  unfinished slices remain retained for a concrete disposition/revised trial.

Accounting qualification: case-01/RESULT.md also retains native packet dispatch
06:42:59.899Z, at least185.025s to packet completion before return. The178.924s
first-tool span does not establish a180s dispatch-based preparation cap. Original
C/P attribution, exact final scoring time and non-overlapping administrative cost
are unknown. Do not claim complete20-minute calibration/scoring compliance or
zero controller cost. By07:03:58Z root activation-to-clock is40.25min; adding
known child windows gives an upper reservation near60min, with overlap/waiting
explicitly overcounted; exact cost and later administrative time remain unknown.
This is preservation/stop handling, not further recruitment or an experimental retry.
