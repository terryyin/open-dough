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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/627-reduce-blocked-execution-work/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a19d3ff24e89627e57aa310b228754e2390e853acc68b79b8f1ed2170c9a2d35","plan":"7811ef062ee68c22217bfdfc91b54ab25283bcdb2184fa9d90dd1822586292d7"}}
```

#### Goal

For a developer whose authorized execution waits on a supplier, significantly
reduce complete-task model work while preserving partial work, accepted proof,
correct supplier judgment and one qualifying continuation. Less work and less
retained context are the outcome; added automation alone is not improvement.

#### Scope

Terry's 2026-11-15 "Go ahead, update the plan and continue" authorizes a
bounded differential investigation after the forced-wake probe found no
worthwhile narrow removal. Compare the original prolonged supplier pause with
the fresh execution, identify the conditions that made the original coordinator
keep requesting model work while the fresh execution held, and reproduce the
missing condition before choosing an optimization. Distinguish evidence that
the problem is already resolved from evidence that the extracted case omitted
its cause. Preserve uncertainty when the available traces cannot settle it.

Keep the existing paused-supplier forced-wake and unblocked-supplier cases as
agreement, preservation and continuation regressions. The forced-wake case does
not establish whether normal waiting creates or suppresses unnecessary model
requests. Any new reproducer must exercise the normal wait/resume path, preserve
the causal condition found in the original trace, and demonstrate the unwanted
baseline behavior before an implementation or further paid comparison.

Then select one evidenced, targeted reduction. Prefer deletion and existing
commands; a small script is justified only when it replaces observed repetitive
mechanical work and removes the corresponding agent procedure. Do not add both
paths. Count cost through qualification and final proof. Investigation does not
authorize a new daemon, enrollment protocol, second execution record, general
accounting system or broad execution-guidance rewrite. Automatic supplier-event
delivery remains deferred; no event-delivery runtime is authorized by this
investigation. Running-verification efficiency and general phase loading remain
with their existing sibling stories.

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

- The original session repeatedly waits while its supplier cannot progress,
  but the fresh fixture holds and ends its turn → compare actual context,
  available handles, instructions and guidance revisions → identify the missing
  trigger or retain an evidenced uncertainty; do not assume either a fix or a
  representative reproduction.
- A proposed reproducer matches that trigger → the unchanged baseline exhibits
  the unwanted repeated model activity through its normal wait/resume path →
  only then consider one targeted optimization. Controlled-host checks establish
  harness behavior; they do not substitute for a native model-behavior result.

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
Unknown usage remains unknown and cannot support a token-saving verdict. The forced-wake schedule remains evidence for initial hold plus unchanged,
nonqualifying and qualifying handling; it makes no claim about production block
frequency or reproduction of the prolonged pause. The differential investigation
owns the new reproduction profile before any further comparison.

Budget: at most six native journeys. Terry's latest 2026-11-15
"approved" raises the earlier five-journey cap by one. Two journeys are consumed
and four remain, reserved for a fresh blocked baseline/candidate pair and an
unblocked baseline/candidate pair. Worker effort, automatic baseline
reacquisition and invalid attempts still count. Run the blocked comparison
first. This extension changes no quality or keep/stop bar.

For the supplier-watch native case only, that approval grants two fixed
180-second observation windows: the first starts with the watch-request turn
and ends with nonqualifying publication; the second ends with qualifying
publication. Releases are independent of model polling. This is a scoped
exception to AGENTS.md's elapsed-time prohibition for these native observations;
cheap checks still advance a controlled clock. Retain actual watch exposure;
insufficient or unknown exposure cannot establish a fix or disprove the hypothesis.
Prefer retained traces and controlled checks first. Before a paid launch, reserve
the journeys needed for its stated learning and required remaining comparisons;
do not start a comparison that cannot finish within the authorized allocation.
Stop before optimization implementation if the baseline does not reproduce the
targeted unwanted behavior or exposes no plausible worthwhile removal. Stop the candidate on failed quality, insufficient usage, a missed bar
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
