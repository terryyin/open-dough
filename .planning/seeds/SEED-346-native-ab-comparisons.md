---
id: SEED-346
status: active
planted: 2026-11-14
planted_during: Terry asked for runnable A/B comparisons using labeled examples from the session-efficiency audit
trigger_when: selected from the product backlog for refinement
scope: story
---

# SEED-346 — Run native A/B comparisons on examples from real work

<a id="run-native-ab-comparisons-on-real-work"></a>

### Run native A/B comparisons on examples from real work

**Identity:** SEED-346#run-native-ab-comparisons-on-real-work
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/618-native-ab-comparisons/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"59878b63aa19949f5a7382edb8defaa2ca2dff51b49b88358865b55adf8a311d","plan":"91c80ff090ec6c8e6ea017efd515e033b647c84d839ad0ed10ced6c2a2113545"}}
```

#### Goal

An Open Dough maintainer can choose a representative example and run a
baseline and a candidate on demand. The comparison shows whether the change
preserves the outcome and its proof, and what it does to agent effort.
Maintainers can reuse the same example for a later change.

#### Scope

- Retain two initial runnable examples in Open Dough maintenance sources:
  the SEED-324 blocked-supplier decision from the
  [session-efficiency audit](../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines).
  Use the [Doughnut SEED-122 verification replay](../../docs/maintainer/intent-coverage-cost-research.md#same-story-waiting-comparison)
  as the calibration case. Each keeps its source session or replay, source
  project/revision, extraction recipe, starting state, neutral agent task,
  setup and separate acceptance check. Runtime setup must recover from these
  retained inputs rather than require the original author's temporary files.
- Keep the smallest runnable context that preserves the original decision
  and its proof. Controlled supplier evidence/events replace an overnight
  wait, while retaining the distinction between a diagnostic pass, a
  publication and satisfaction of the exact supplier requirement. The
  Doughnut case retains the real title/alias resolution seam, maintained
  destination-ID assertion, independent wrong-behavior witness and restored
  proof. Qualify any shortened setup/proof against those observations.
- Qualify each case by showing that it still requires the relevant judgment
  and verification, and that a plausible wrong decision fails its separate
  assessment. Measure preparation and native-run duration before describing
  the case as suitable for repeated runs. Historical times are labeled as
  such; no fixed duration threshold has been agreed.
- Tag each example with the workflow or problem it represents and traits
  that help a maintainer choose it: applicable hosts, environment/prerequisites,
  required decisions/proof and observed or not-yet-qualified duration.
  Refresh examples through ordinary versioned edits. A comparison preserves
  the exact case revision/content and project starting state, so later edits
  do not silently replace the earlier comparison basis.
- Give the maintainer an on-demand way to select a case and run fresh,
  isolated native sessions for baseline and candidate. Declare the factor
  under test, intended gain and quality criteria before running. Match task,
  case/project state, host, model/effort, relevant settings and event sequence;
  record differences and unavailable conditions rather than claim equivalence.
  Independently identify and materialize each payload, separate from the
  project revision. A mutable label such as `candidate` is insufficient.
- Keep expected answers and assessor machinery outside the agent's task and
  workspace. Ordinary product requirements and maintained tests remain
  available. Assessment judges observed state and decisive proof before
  effort; fewer requests cannot hide a missed decision, fault or restored pass.
  Missing/incomplete runs and unknown measurements remain visible. Record
  preparation, recovery and human intervention as part of total effort.
- Retain a compact comparison basis and verdict: case and project inputs,
  payload identities, host/runtime conditions, declared criteria, arm/session
  associations, outcomes, proof references and measurement limits. During
  assessment keep recoverable raw evidence; at wrap-up remove spent run
  artifacts under ADR 0005, preserving reusable cases, findings and the basis
  needed to recover tracked comparison evidence through Git.
- Reuse applicable native fixture and payload setup. The
  [effort comparison story](SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
  owns reusable accounting from retained sessions. This story supplies
  host-qualified coordinator/worker session associations and retained inputs
  to that accounting when available; it does not create another token parser.
  Report available effort evidence and explicitly unavailable fields.

**Scope limits:** no dashboard UI/service, benchmark scheduling, automatic
selection of an improvement, release/rollout, general effort collector, quota
or invoice attribution, or statistical/general savings claim from one pair.
Routine local and CI suites retain deterministic checks; native experiments
remain on demand. These are delivery limits, not rejection rules for naturally
supported cases. Both initial cases must run natively on Codex; Cursor and
Claude Code remain unqualified until their own observations are obtained.

**Required restrictions and reasons:** isolate arm writes from each other and
live projects to prevent contamination; hold assessor expectations outside the
agent context to avoid teaching the answer; identify frozen inputs so refresh
cannot relabel old evidence. Reject invalid/unrecoverable input before a paid
launch, and expose a failed or incomplete arm rather than fabricate a verdict.

#### Key examples

1. **Select and compare.** A maintainer selects the blocked-supplier case by
   workflow/host/environment tags and chooses two payloads → starts a pair →
   both arms receive equivalent consumer work, paused supplier and accepted
   proof in fresh projects; the report identifies all inputs and conditions.
2. **Preserve the real decision.** Supplier diagnostics pass but stability
   proof/the required publication is missing → controlled evidence is
   delivered → the assessor distinguishes waiting with preserved partial
   work from wrongly declaring the requirement satisfied. On a qualifying
   change it observes whether the right work continues once with its proof.
   A baseline's failure remains a comparison result, not a harness failure
   disguised as equivalent success. Then compare effort and empty wakes.
3. **Calibrate proof.** Both arms run the Doughnut case → each assesses the
   title/alias fault → the verdict records the maintained destination-ID
   failure, independent controller witness and restored proof separately.
   An arm missing any decisive result cannot win solely through lower effort.
4. **Refresh without relabeling.** A maintainer changes a case's setup or
   acceptance check → runs it again → the new comparison names the new case
   basis, and the earlier basis remains recoverable rather than inheriting
   the edit. Environment drift can make a rerun unavailable; it cannot alter
   what the original report observed.
5. **Incomplete evidence.** An arm stops or its host lacks a measurement →
   assess the pair → the result names that arm, observed proof and unknowns,
   with no invented token count, equivalence or saving. A stubbed-host run
   can test the runner/assessor but cannot supply native behavior evidence.

#### Exploration, borrowing and challenge

| Candidate | Fit to the same outcome and constraints |
| --- | --- |
| Rerun the original projects and full environment | Closest source fidelity, but live supplier pauses, drift and full preparation dominate repeated runs. Keep this as the qualification reference when extraction loses meaning. |
| Versioned extracted cases with controlled external events | Recommended: preserves the decision/proof while making fresh equivalent runs possible; independently pins the project and each payload. Native qualification must establish fidelity and duration. |
| Reassess retained sessions only | Cheapest existing route for historical effort, but cannot observe a new candidate's effect. The accounting story owns that responsibility. |

Borrow a matched experiment: one case/project basis is the specimen, fresh arm
projects are prepared copies, payloads are treatments, and the separate
assessor measures the outcome under recorded conditions. The analogy does not
make stochastic agents, caches or service timing deterministic, and one pair
does not establish causal or general savings.

The strongest doubt is that extraction could erase the judgment being
measured: a supplier flag could reward resuming on any publication, or a fully
scripted calibration could measure shell packaging without verification
judgment. Qualification must demonstrate the preserved decision and a plausible
wrong decision that the assessor catches. A cheaper run without that
discrimination would meet the cost wording and miss this story's purpose.

#### Investigation evidence

Read-only/source and disposable-setup observations at preparation revision
`bdb4d096eb6c3b3bf955516f4ed13268034bc41e`, 2026-11-14:

- The audit and original SEED-324 handoff at
  `7fb42349225d05cc2231b6ea20a6c4b36786cc5f` distinguish published slices 1–2,
  partial slice 3, accepted isolated proof, missing family/natural-load proof
  and a paused supplier. This is not a running verification to wait out.
- The Doughnut project commit
  `e257b144d1e9120528922da0f5dc045acb6c9d6d` is locally recoverable. Its
  `WikiLinkNoteCandidates.titleOrAlias` and
  `selectsTitleBeforeAliasesAcrossAuthoredLinkForms` retain the title/alias
  decision and six authored forms. Original probe recipes, mutation, witness
  and baseline/fault/restored logs were also recovered from local temporary
  evidence; they must be extracted into durable case inputs before use.
- The published same-story replay reports equivalent caught/restored proof and
  a 6m55s completion wait. That is historical evidence for one matched pair,
  not a qualified duration or saving for the new extracted case. The recovered
  original full-suite probe is a different observation from that waiting replay.
- The existing native family separates fixture, run, observe and assess.
  Disposable `delivery_evidence_create_fixture scheduling` setup under Bash 5,
  with `planned-extraction`, Codex and payload revision
  `9900b8d21922c8cd97ffc9e872e76a0ff59af489`, completed in 1.8s. It installed
  the selected payload in the generated project and kept the assessor outside
  that project. Scratch content was removed; no native session ran. This
  establishes reusable materialization, not either new case's acceptance.
- Local Codex 0.169.0 `exec --help` and `app-server --help` returned successfully.
  The CLI exposes model/configuration selection and JSON events. Existing
  stream helpers do not supply complete session/worker accounting; current
  one-command launch is not evidence for a resumed blocked-turn journey.

**Hypotheses for early execution qualification:** a small controlled supplier
case preserves the decision and actual native continuation; the bounded
Doughnut setup preserves its maintained proof and independent witness; both
have measured preparation/run durations suitable for reuse. Native sessions
and stateful project proof must settle these before dependent implementation.
Preparation made no model request or claim of a successful native comparison.

#### Architecture

Follow the [native-comparison North Star](../NORTH-STAR.md#versioned-native-comparison-cases).
Keep one maintainer-only case catalog with co-located task/setup/assessment
sources and a small on-demand runner. Materialize each case/project basis into
disposable arm directories, install each separately identified payload, drive
the case's events, observe, then assess outside the agent workspace. Keep case,
project, payload and runtime identities separate in one comparison basis.
Ordinary Git case revisions own refresh/recovery; no new registry or database.

PFE found reusable payload installation, stream views, supervision, evidence
identity and retention in `tests/support/` and the native-family conventions in
`tests/native-family-layers.md`. Expose the suitable shared parts rather than
make the comparison inherit delivery-evidence case semantics. Dashboard host
launch code supplies useful identity/uncertain-start semantics, but its launch
records and workflow assignments are not this maintainer experiment's lifecycle.
Keep accounting with its existing story; missing metrics stay unknown.

Current Accepted ADRs
[0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[0004](../../docs/adrs/0004-client-installation-and-update-accepted.md),
[0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) and
[0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) constrain
reuse/cohesion, truthful payload identity, maintenance-only delivery,
deterministic versus native evidence, and outcome-first total-effort judgment.
Index and record statuses agree; no supersession or conflict was found.
ADRs 0007 and 0009 remain Proposed.

#### Selected boundary

Terry selected the recommended Codex-first delivery on 2026-11-14. Both cases
require observed native Codex qualification and comparison. Keep the shared
case/setup/assessment responsibilities independent of host details; adding
Cursor and Claude Code is deferred, with no claim that Codex evidence qualifies
their native behavior. No goal or scope decision remains open.

#### After implementation

The A/B guidance in ADR 0005 is provisional. It draws on the earlier
comparison and anticipates a reusable capability. Review it after the first
end-to-end runs. Use what worked, what proved difficult, and what the evidence
can support to decide whether the ADR needs an update.

#### Priority

Place this after the urgent resume, long-verification and evidence-retention
work and the existing landed CI coverage correction. Place it before the
guidance, context and Cursor handoff trials so those stories can use the
examples. Urgent work can start with its own focused comparison.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs native validation and on-demand experiments.
