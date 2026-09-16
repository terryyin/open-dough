---
id: SEED-013
status: active
planted: 2026-09-15
planted_during: Review of Quick 035 CI-watcher experience
trigger_when: Before relying on the CI watcher for another execution
scope: bounded
---

# SEED-013: Minimize and prove AI involvement in CI watching

## Why This Matters

A developer entrusting execution to Open Dough needs actionable CI feedback
without paying unnecessary AI attention and token cost for routine observation.
Quick 035 used script-driven polling but still required a large host wrapper,
configuration interpretation, multiple observer handles, push registration, and
manual teardown bookkeeping. It ended before the first post-push observation,
so it did not demonstrate a real failure reaching the active coordinator.
This is an observation gap, not proof that the delivery bridge is broken.

## Alternatives and Priority

Keep this first as a bounded improvement and learning story supporting the
backlog's near-future direction of coherent lifecycle transitions. It addresses
feedback and recurring AI overhead in ordinary execution. Manual testing is
opt-in; broader architecture review awaits a demonstrated gap. Real Donut
adoption remains a strong alternative if it can expose more consequential
lifecycle problems. Release/adoption and refinement-extraction entries need
current-state assessment before their old descriptions can justify comparison;
this story neither completes nor reprioritizes them.

Keeping the current interface and relying on tests is the strongest smaller
alternative. It avoids changes but leaves the reported AI ceremony and native
feedback gap unresolved. Manual CI inspection bypasses the notification promise.
Prefer targeted simplification of demonstrated mechanics plus one real native
journey. Do not manufacture a redesign merely to reduce the visible command count.

## Story

<a id="minimize-and-prove-ci-watcher-involvement"></a>

### 1. Minimize and prove AI involvement in CI watching

**Status:** Refined on 2026-09-16; slice planning authorized, execution not requested.

**Goal:** A developer gets trustworthy CI failure feedback during active
execution with less avoidable AI ceremony and context/token burden. Reliability
and reduced ceremony are joint values; neither is secondary to the other.

**Scope:** Review actual startup, push registration, notification, repair, and
shutdown interactions. Identify decisions requiring AI judgment and mechanics
that scripts or maintained host code can own. Reduce demonstrated repeated
interpretation, inline code construction, and bookkeeping while retaining safe
identity, revision coverage, and recovery. Assess the before/after burden across
the whole interaction, not just command count. Use available token counts only
when comparable; otherwise report concrete removed work without invented savings.
A justified finding that a particular action is irreducible is acceptable; it
does not waive the search for reductions elsewhere.

The final agent instructions must be extremely concise and effective, with no
substantial growth over the baseline; shorter is preferable. Replace redundant
wording instead of accumulating rules. Assess the full required reading path,
including linked guidance and inline code: moving text elsewhere is not a saving
if the agent still must read it. Justify any small net increase by necessary
behavior, and preserve clarity and safeguards rather than compressing cryptically.

Prove one supported CI check with a real controlled failure delivered through
the native bridge to its owning active coordinator. Start with Codex because
its adapter is the source of the reported ceremony. Follow ordinary repair with
the same observer, establish actual success for the repaired revision, and show
that successful CI produces no actionable notification. One controlled failed
attempt should produce one actionable delivery; distinct attempts or failed jobs
remain actionable under existing identity rules. Mailbox files, direct CI
inspection, and replay tests alone do not prove native context delivery.

At execution completion, stop the owned observer without waiting for CI. The
owner explicitly accepts that the latest push, or several recent pushes, may
still lack CI results. Report those as unobserved; no post-execution watch,
late-result handoff, or completion/merge gate is required. Handle already-delivered
failures under existing repair rules. Native proof deliberately stays active
long enough to observe its controlled case; that is acceptance work, not a new
wait policy for ordinary executions.

**Key examples:**

- Startup needs verified project identity and host capability; the AI uses a
  smaller maintained interaction instead of rebuilding deterministic observer
  machinery. Required scope and recovery identities remain available.
- A controlled failed push finishes while execution is active; the native bridge
  supplies the correct revision, attempt, and bounded actionable evidence at the
  next supported safe boundary without model-driven polling. It need not interrupt
  foreground work or wake an idle session.
- Reobservation of the same attempt does not cause duplicate repair; a distinct
  failure remains actionable. The repair push reuses the observer, its actual CI
  success is established, and successful observation remains quiet.
- Execution concludes with multiple pushed revisions still pending; shutdown
  succeeds without waiting for those runs, and the report preserves unobserved
  coverage rather than asserting that all pushed revisions are green.
- A bridge is unavailable or shutdown cannot be confirmed; report that specific
  limitation. Silence and cell termination alone cannot prove coverage or exit.

**Evaluation:** Compare the attributable AI-owned interactions before and after
simplification; identify work removed and necessary work retained. Trace real
pushed revision → failed CI → native coordinator delivery → repair → actual
successful CI for the repair revision → confirmed observer shutdown. Bind evidence
to the candidate and installed runtime actually used. Retain separate conclusions
for ceremony reduction, native delivery, and intentionally unobserved pending CI.
Include a before/after length comparison of the affected required instructions
and a representative-use review establishing that concision preserved effectiveness.

**Constraints:** Keep deliberate failure isolated from the integration target and
finish the controlled journey green. Preserve exact revision attribution, bounded
untrusted diagnostics, existing repair ownership, deduplication, quiet
non-actionable observation, and exact observer shutdown. Edit distributable sources;
do not hand-synchronize this repository's managed installed skills.

**Deferred:** CI ownership after execution, idle-session wakeup, merge/closure
CI gates, Story Branch Mode redesign, new providers, multi-check aggregation,
deployment monitoring, broad recovery redesign, token telemetry, benchmarks,
release, adoption, and unrelated backlog maintenance. These exclusions do not
require rejection of naturally supported cases.

**Dependencies and architecture:** A permitted real CI target and native bridge
are execution prerequisites. Use existing observer and mailbox responsibilities.
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
supports empirical improvement and reduced future judgment.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) requires relevant
native evidence or justified reuse for affected requirements on each host; Codex
success alone says nothing about Cursor/Claude delivery. Preserve unchanged host
proof where applicable and keep missing evidence explicit.
[ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md) remains Proposed;
this story does not resolve its conflict with ADR 0002 or require that lifecycle.
An isolated acceptance fixture is not a decision to adopt Story Branch Mode.

**Safe stopping point:** Completed changes remain useful without a later observer
redesign; the controlled acceptance target ends green and its observer stops.
Ordinary final CI may remain unobserved, as expressly accepted by the owner.

**Effort hypothesis:** Confidence is limited by native host loading/delivery and
real CI timing. No project S/M/L definitions or numeric slice limits were supplied;
use cohesive proof loops rather than inventing a timing commitment.

## Current Decisions

On 2026-09-16 the owner selected the narrow feedback story, confirmed both
reliability and reduced AI ceremony/token cost as primary values, accepted one
or several pending CI results at execution completion, and authorized refinement,
slice planning, and plan refinement as needed. No product-scope question remains.
Host capability and safe acceptance setup are bounded execution checks, not
requests to reconsider the accepted pending-CI gap.
The owner additionally requires extremely concise, effective final instructions:
no substantial net growth, preferably shorter, measured across required reading.

## Breadcrumbs

- Quick 035 commits: `152a627`, `b4b4363`, `1db5038`; review reported
  `pendingCi: unobserved`, zero delivered events, and unchecked pushed revision.
- Existing behavior: [execute-plan](../../src/skills/dough-execute-plan/SKILL.md)
  and its [CI protocol](../../src/skills/dough-execute-plan/references/ci-monitor.md).
- September 15 direction: combine minimum AI involvement and native failure proof.
- September 16 refinement: joint value, accepted terminal coverage gap, planning only.
