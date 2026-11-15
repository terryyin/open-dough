---
id: SEED-376
status: active
planted: 2026-11-15
planted_during: Shared retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-376 — See affected consumer proof before accepting a slice

## Why this matters

Developers need to tell whether a slice exercised the consumers affected by
its change before they rely on a passing proof result. The existing consumer
trace has found affected surfaces, yet some remained untested until CI.

## Stories

<a id="show-affected-consumer-proof-at-acceptance"></a>

### See affected consumer proof before accepting a slice

**Identity:** SEED-376#show-affected-consumer-proof-at-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/650-show-affected-consumer-proof-at-acceptance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c6cca17f4e1c34e16d38669fa51c307c2d646c70421da3f2dc5a8910269f6446","plan":"3783665740ae3e7ec4fc6e24a9a5f8931d2de2ea8c6f97c13493da7abb08ceb7"}}
```

**Goal:** A coordinator accepting a slice can identify the affected consumer
and the particular proof still missing before publication, so a green nearby
check does not conceal an unverified effect and cause a later CI repair.

**Scope:**

- Carry the changed effect, reached consumer boundary, relevant proof type,
  and actual observation or outstanding gap through the existing consumer
  trace, implementation/refactor return and acceptance evidence. Follow
  indirect callers and enclosing observations where the effect reaches them.
  Path kinds and a file-level `run` label alone do not establish sufficient proof.
- Distinguish proof of behavior from static checks and enclosing-page or
  contract observations when the change affects those boundaries. Select
  proof from the effect and inspected consumer purpose, rather than requiring
  every proof type for every file. A single sufficient check can cover several
  consumers or equivalent purposes.
- Before accepting dependent delivery, obtain missing affected proof or return
  the slice with the specific consumer, proof type and gap. An exclusion must
  explain why the effect does not reach that boundary; reused proof must still
  apply. Leaving an affected consumer for CI does not settle its gap. Preserve
  independently valid proof and unchanged boundaries. These restrictions
  prevent an unsupported acceptance claim; they add no general full-suite gate.
- Evaluate the retained SEED-331, SEED-364 and SEED-372 misses and the SEED-358
  control below. Compare the checks missed or obtained and the added preparation,
  review and recovery work, retaining unknown costs and the limits of historical
  replay. Keep the full discovery evidence available; the earlier compact-handoff
  trial lost a useful lead and is not an accepted replacement.
- Record the delivered response and bounded evaluation at
  [ODF-150](../../docs/maintainer/findings/ODF-150.md), and its first containing
  release when known. Delivery alone does not resolve effectiveness.

Scope limits: no replacement discovery engine, automatic semantic proof
classifier, new registry/dashboard, universal full-suite requirement, or new
acceptance lifecycle. Release, client rollout and a prospective effectiveness
watch are separate work. This story changes the shared guidance; it does not
reimplement the archived dashboard changes or rerun their entire historical suites.

**Key examples:**

1. **Traced caller, missing static proof:** SEED-331's explicit-endpoint
   `wallTimeReferenceOf` overload narrows an untouched caller's type. When its
   behavior tests pass, acceptance still shows `ciFollowUpDecision.ts`'s
   affected lint boundary as unverified until a sufficient check runs; changed-file
   formatting does not cover it. Retained CI run 43387096022 and repair `45e6965`
   establish the missed boundary.
2. **Indirect contract observers:** SEED-364 changes collected history through
   re-exported readers. When the return claims those readers are unchanged,
   acceptance follows the effect to `landed-ci-scope-*`, reader compatibility
   and Intent status observations. It obtains their relevant proof or leaves
   the named gaps unaccepted, rather than treating the re-export or plan-named
   passing tests as evidence. Retained repairs `4c148b732` and `ea5742187`
   identify the missed observations.
3. **Enclosing-page observation:** SEED-372 adds an empty visually hidden status
   span. When status and header checks pass, acceptance still follows its
   rendered effect to the whole-page layout observation used by
   `agent-launch-story-card-noted-start.spec.ts`. That boundary remains a gap
   until observed; matching the accessible label alone is insufficient. Repair
   `70fb3664d` retains the failed-before/passed-after case.
4. **Known missing proof, then acceptance:** SEED-358's return names five
   affected E2E families but leaves them for hosted CI. Acceptance identifies
   them as outstanding, obtains the existing 9-case run (41.2 seconds in the
   retained observation), then accepts. The same sufficient run may cover the
   five families; no duplicate run or second record is required.
5. **Proof that still applies:** A consumer has a sufficient current observation
   of its affected purpose, or the inspected effect does not reach its boundary.
   Acceptance reuses that observation or retains the supported exclusion while
   returning another consumer's missing proof. Neither a successful runtime
   check nor a newly discovered gap erases an independent static/layout gap
   or invalidates unrelated accepted proof.

**Evidence:** The four executions and their provenance are retained in
[ODF-150's 2026-11-15 observations](../../docs/maintainer/findings/ODF-150-open-dough-evidence.md#retained-source-evidence--open-dough-2026-11-15).
The [earlier assessment](../../docs/maintainer/consumer-tracing-evaluation.md)
and [rejected compact-handoff trial](../../docs/maintainer/consumer-tracing-trial-v2.md)
bound the alternative and its cost claims. They do not establish a benefit
for this response.
