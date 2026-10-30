# Collapse redundant dashboard touch viewport matrices

**Source:** [Selected implementation story](../../seeds/SEED-180-optimize-dashboard-touch-viewport-tests.md#optimize-dashboard-touch-viewport-tests)
**Identity:** SEED-180#optimize-dashboard-touch-viewport-tests

## Request and evidence

Completed resolve-only triage of the candidates in
[dashboard test timings](../../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve)
created this replacement plan without profiling or implementing optimizations.
`d6bf4531` recorded dispositions; `03424649` recorded human acceptance and
cleared Remaining candidates. SEED-178's triage source is recoverable at
`0136acf88f0f639d368ad94d54d04279a067de34`,
`.planning/seeds/SEED-178-resolve-dashboard-test-optimization-candidates.md`.
Terry requested triage closure and transfer to a separate implementation story
on 2026-10-30, explicitly without execution.

SEED-176 baseline at `838e533a` (~597.8 s wall, 1753 cases) and its focused
second-server improvement are historical evidence; comparable full-suite
speedup was not established in that pass. SEED-177 subsequently closed at
`221b95d6`, recording its change-wait improvement and 751.0 s to 741.4 s
suite observation. Neither supplies this experiment's comparable before/after
pair. The touch-matrix redundancy and saving remain hypotheses.

## Goal and scope

Shorten ordinary local dashboard test feedback while preserving coverage and
confidence. Classify repeated phone/tablet and landscape touch journeys;
remove only redundant repeats after establishing surviving proof. Measure the
focused family and ordinary `npm run test:dashboard` before and after under
comparable conditions, including replacement proof cost. Retain a credible
worthwhile saving that justifies maintenance cost under
[ADR 0010: Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
A supported no-change result also satisfies the story; undo ineffective or
inconclusive experiment edits.

**Exclusions:** Product behavior changes; non-touch optimization; thinning the
necessary-cost `agent-launch*` poles, `agent-completion-attention`, or
production-watcher chains; invented profile exclusions; speedup claims from
case count or focused timings alone. No profiling or implementation until a
later developer instruction authorizes execution. Queue priority and readiness
do not supply that authority.

## Preserved promises

- Prove layout rules once per genuine CSS/container branch, following
  [dashboard test guidance](../../../dashboard/tests/README.md#where-a-check-goes).
- Retain representative integrated proof of every unique touch state change,
  including rotation preserving drafts, session choices, settings recovery,
  terminal attachment, native input, and fitting.
- Establish replacement boundary proof before narrowing detailed journey proof;
  boundary assertions alone cannot prove native touch or cross-step integration.
- No focus/only markers; no retries, sleeps, or skips to mask flakes.

## Family analysis

**Responsibility:** touch interaction proof across launch/settings/session/
terminal surfaces using `launchTouchViewports`. Each repeated viewport can
repeat a preview-server journey; sharing the helper does not establish that
its coverage is redundant.

**Matrix consumers to classify (under `dashboard/tests/`):**
`agent-launch-dialog-touch.spec.ts`,
`agent-launch-start-session-touch.spec.ts`,
`agent-terminal-touch.spec.ts`,
`session-management-touch.spec.ts`,
`sessions-sidebar-touch.spec.ts`,
`story-review-touch.spec.ts`,
`story-review-mark-touch.spec.ts`,
`system-settings-project-management-touch.spec.ts`,
`system-settings-terminal-touch.spec.ts`,
`system-settings-look.spec.ts`,
`system-settings-openai-recovery.spec.ts`,
`system-settings-terminal-theme.spec.ts`.

The last three are related matrix consumers omitted from the original list.
`agent-launch-start-session-answer-touch.spec.ts` and
`recently-done-sessions-sidebar-touch.spec.ts` already select a phone rather
than looping the matrix; inspect them as possible surviving proof, not removal
targets. Do not narrow the shared `launchTouchViewports` helper globally.

**Hypothesis:** some phone/tablet repeats may exercise the same layout branch
and interaction. Phone widths 390/844 and tablet widths 768/1024 across rotation
can also cross distinct branches; retain those distinctions and every unique
state change. Classification and measurement must settle the hypothesis before
any saving is claimed.

## Ordered slices

Original numbering and completed triage evidence are retained. Slice 1 belongs
to the completed predecessor; all implementation slices (2–4) are unstarted.

### 1. Predecessor triage disposition evidence (SEED-178)
Type: Structure
Status: done
Proof: `d6bf4531` and `03424649`, plus the maintained timing record, establish
all three accepted dispositions with no pending coverage decision. No profile
or baseline command ran during resolve. The touch replacement obligation is
now owned by SEED-180, not by the completed triage mission.

Enables: Later authorized execution of slices 2–4; this is predecessor evidence,
not implementation delivered by SEED-180.

### 2. Touch classification and comparable baselines are recorded
Type: Behavior
Status: planned
Proof: Classify each matrix consumer against actual CSS/container branches and
unique state-changing interactions; record the survivor for every proposed
removal. Record the literal focused-family command covering those consumers,
its wall time/case count, and the baseline for
`env -u NO_COLOR npm run test:dashboard` (or its ordinary proof-record form).
Name revision, workers, filters, load, environment/cache conditions, and raw
proof path outside Git. This is the bounded probe for the redundancy/cost
hypothesis. If no credible worthwhile experiment remains, record the supported
no-change outcome and finish without removing cases. Establish the result worth
keeping before experimentation; repeat doubtful comparisons or record them as
inconclusive. Summed test time and case count are not suite wall time.

Behavior: Pre-condition — later execution authorization and an owned checkout.
Trigger — inspect the family and measure focused and ordinary local baselines.
Postcondition — classification, surviving proof, comparable baseline facts,
and keep criteria are recorded before removal, or a supported no-change result
ends the experiment.

### 3. Evidenced redundant touch viewport repeats are collapsed
Type: Structure
Status: planned
Proof: Apply slice 2's classification; retain one representative per genuine
branch and every unique state-changing interaction. Establish replacement
proof before narrowing a case, naming the surviving sibling journey or boundary
for each removal. Focused family tests pass. If asynchronous/input
synchronization changes, require three consecutive focused passes; repetition
alone proves no speedup. Stop a disputed confidence trade-off for the human
rather than weakening protection.

Enables: Slice 4's measured confirmation.

Behavior: Pre-condition — slice 2 supports a credible bounded experiment.
Trigger — remove or narrow only evidenced redundant viewport repeats.
Postcondition — each removal has surviving proof; unique interactions remain.

### 4. Focused family and ordinary local suite confirm the outcome
Type: Behavior
Status: planned
Proof: Re-run slice 2's focused-family and ordinary local commands under
comparable conditions, including replacement proof cost. Retain only a credible
wall-time gain that justifies maintenance cost. Otherwise undo experiment edits
and record the rejected or inconclusive result. Update
`docs/maintainer/dashboard-test-timings.md` with before/after facts, case counts,
surviving proof, comparison limits, and the actual measured/no-change outcome.
A failed re-profile leaves measurement incomplete; CI or focused timings do not
replace it.

Behavior: Pre-condition — slice 3's experiment has surviving proof.
Trigger — comparable focused and ordinary local remeasurement.
Postcondition — retained change shows worthwhile local improvement with
coverage preserved, or the experiment is undone and its outcome recorded.

## Current decisions

1. **Necessary-cost launch poles (accepted):** retain unique dual-preview page
   protection and immediate terminal-attachment journeys after the prior
   change-wait boundary move. No profile-exclusion mechanism exists; none is
   invented. This disposition does not declare all agent-launch cost inherent.
2. **Long journeys (accepted):** retain unique integrated completion and
   production-watcher protection. Any later removal of redundant variants or
   detail move needs replacement proof and separately authorized scope; unique
   cross-step protection stays. SEED-177 closed without those moves. These
   journeys are outside this touch-only story.
3. **Touch matrices:** this implementation plan owns classification, possible
   replacement/removal, and measurement; redundancy is not yet established.
4. **Ownership and priority:** SEED-178 triage is complete. SEED-180 and this
   plan are first in Backlog list at Terry's request. SEED-177 is completed
   historical context, not an outstanding coordination dependency. Reconcile
   with current tests before measuring; do not reopen that completed claim.
5. **Authority:** no Take, profile, or implementation during this wrap-up;
   later explicit execution authorization is required.
