---
id: SEED-356
status: active
planted: 2026-11-14
planted_during: Terry abandoned the SEED-345 resume implementation after its negative token comparison
trigger_when: selected from the product backlog
scope: story
---

# SEED-356 — Reduce total model work during blocked execution

<a id="reduce-total-model-work-during-blocked-execution"></a>

### Reduce total model work during blocked execution

**Identity:** SEED-356#reduce-total-model-work-during-blocked-execution

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/627-reduce-blocked-execution-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"60ca4acff7080f11380fef4338b0a5f7b5b50b9ff497d90d19c1c0f3f745846f","plan":"9274306cb52f147dde32ae102d4ecc63f951131ba4f6c2dfc6ce307d92f59fbf"}}
```

#### Goal

For a developer whose authorized execution waits on a supplier, significantly
reduce complete-task model work while preserving partial work, accepted proof,
correct supplier judgment and one qualifying continuation. Less work and less
retained context are the outcome; added automation alone is not improvement.

#### Scope

Terry's 2026-11-15 second-attempt instruction selects a smaller, simplification-first
increment. Reduce repeated reading, reconstruction or bookkeeping on the existing
blocked continuation path, including its cost after qualification. Select one
reduction from a fresh baseline. Prefer deletion and existing commands; a small
script is justified only when it replaces observed repetitive mechanical work
and removes the corresponding agent procedure. Do not add both paths.

Use the updated **paused-supplier** forced-wake case and **unblocked-supplier**
ordinary-work case. This increment evaluates cheaper handling of the existing
wakes; automatic supplier-event delivery and skipped-wake proof are deferred.
This replaces the earlier event-driven-variant requirement under Terry's explicit
instruction to leave further ideas for later. No daemon, enrollment protocol,
second execution record, general accounting system or broad execution-guidance
rewrite belongs to this increment. Running-verification efficiency and general
phase loading remain with their existing sibling stories.

Preserve the exact supplier agreement, partial work and applicable accepted
proof, execution ownership, authority, publication and CI rules. Publication or
a passing diagnostic alone does not satisfy an unmet agreement. Missing or
changed evidence requires honest reassessment; retained context cannot justify
stale satisfaction or a duplicate writer. General guidance remains shared across
Codex, Cursor and Claude Code; the measured saving is limited to the observed
Codex case, not a cross-host claim.

#### Key examples

- Partial work is blocked and supplier evidence is unchanged → the same session
  wakes → keep the work and block, reusing still-valid context rather than
  rebuilding the execution history.
- The supplier publishes an early implementation but still lacks the agreed
  stability proof → reassess the changed evidence → remain blocked; do not
  reroute the partial work around its supplier.
- Qualifying supplier evidence arrives → continue the authorized slice once →
  integrate once, preserve applicable proof and finish with passing independent
  and execution-owned proof. Count this continuation's cost too.
- The supplier already qualifies at entry → finish the same partial work once →
  no blocked-path setup tax beyond the evaluation allowance.

#### Evaluation and stopping rule

Working acceptance bar, selected during refinement before measurement:
**at least 20% fewer total processed tokens on the blocked case**, no increase
in model requests or developer interventions, and **at most 5% token overhead
on the unblocked case**, with no request/intervention increase there either.
Both arms must satisfy the current case assessors and decisive proof. This is a
bounded keep/stop decision from one stochastic observation per arm, not a
statistical or billing claim, following
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

Freeze current pre-change source as the baseline, keeping current task, events,
assessor, host/version, model/settings and publication authority matched. Capture
fresh baseline evidence; do not compare against the abandoned implementation.
Count coordinator and owned workers from setup through final proof and recovery;
report requests, cached input, uncached input, output and interventions separately.
Unknown usage remains unknown and cannot support a token-saving verdict. The
representative blocked schedule is initial hold plus unchanged, nonqualifying
and qualifying wakes; it makes no claim about production block frequency.

Budget: at most four native journeys (one baseline and candidate per case;
worker effort also counts), including automatic
baseline reacquisition or invalid attempts. Run the blocked comparison first.
Stop before implementation if its fresh baseline exposes no plausible worthwhile
removal. Stop the candidate on failed quality, insufficient usage, a missed bar
or exhausted budget; retain observations and revert only candidate-owned product
changes. Do not expand the design or rerun for a favorable result. A negative or
inconclusive result is learning, not achieved improvement; further work needs a
new decision. Evaluation and implementation effort remain visible costs.

#### Evidence from the abandoned attempt

SEED-345 was abandoned and reverted; revision
`56000581b9b4cd65984e681b8c849b59e23503b2` recovers it, not a starting architecture.
Its [matched comparison](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt)
preserved the outcome after a delegated-proof observer correction, but
[tokens](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-tokens.md)
rose 8,386,947 → 13,434,290 (+60.2%) and requests 80 → 94. All four turns were
forced; no wake was saved. Added guidance, setup and recovery context carried
forward: about 79% of excess tokens occurred after qualification. Causal
allocation is unproved. Known native evaluation alone used at least 29,369,243
tokens. The retained independent observer fix shows
[0% token difference on the same subjects](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-observer-ab.json).
These findings justify removing work and bounding this attempt, not restoring
its runtime or weakening proof.

**Plan:** [627 — Reduce blocked execution work](../slice-plans/627-reduce-blocked-execution-work/PLAN.md).
