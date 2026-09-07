# Detect native behavior failures instead of rewarding the expected words

Status: planned; refinement recommended for leaves 1 and 6–8. Depends on Story
1's delivered retained-artifact and reassessment interface. No implementation
or native execution is performed by this planning task.

## Source

- [SEED-007 Story 2](../../seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts),
  the second [product backlog](../../PRODUCT-BACKLOG.md) item; E1–E5 bound this plan.
- Owner direction: system/codebase readiness for honest ADR 0005 validation only.
  Refine first and write a slice plan if no open question remains.
- Borrowed Donut's `story-refinement` and `slice-planning`, their `planning.mdc`
  and `problem-decomposition.mdc` rules, and only the `slice-plan-refinement`
  trigger gate. Read from Donut revision
  `c764beb7ce41d41608938f59dbb7e57c7fd9beb8`; referenced files were clean.
  Borrowing means applying the source guidance, not copying, installing, or
  extracting a new Open Dough skill.
- Open Dough inspected at `47e049c42274e444acdbed02f21865fa3df530b9`.
- [Accepted ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  governs neutral prompts, tested assessors, retained evidence, inconclusive
  outcomes, and separate native acceptance. [Accepted ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  preserves human decision ownership. Index and relevant record statuses agree;
  no supersession, conflict, exception, or metadata mismatch affects this plan.
  No release or ADR status change is involved.

## Goal and scope

Let the maintainer demonstrate cheaply that the existing checks distinguish
supported outcomes from misleading or insufficient evidence. Completing this
story establishes tested assessment behavior, not native product acceptance.

Change only `tests/dough-adr-awareness-context.sh`, the three
`tests/dough-adr-awareness-*-delivery-to-use.sh` wrappers, immediately needed
shared support and fixtures, focused cheap tests, and brief test usage guidance.
Use Story 1's selected cases, durable results, stream capture, execution status,
and offline reassessment. Recheck that delivered interface before implementation;
do not duplicate its runner, retention, timeout, or applicability work here.

Keep the five existing cases per host: context clear/conflict and delivery
legacy-refusal/ordinary-update/updated-use. Keep explicit invocation hints and
necessary task inputs such as the existing supplied source URL. No new automatic
activation, edited-equal, forced-update, client, or release scenarios. No source
skill/installer changes, general semantic judge, model-backed grading, review UI,
new test platform, old-plan migration, or native runs. Story 3 owns qualification.

## Execution context and current decisions

The context clear prompt currently announces status agreement and the desired
completion. Its assertions search for Redis and completion/conflict words.
Codex's marker uniqueness check is not an independent activation observation.
Cursor context checks a successful skill read; Claude context checks a `Skill`
request. A request alone does not establish successful activation.

Delivery prompts currently disclose the two-versus-three-file contract,
refusal, release/report facts, and catalog disagreement. Shared
`delivery_assert_use` and transition assertions depend on output patterns;
Claude duplicates refusal logic. Existing exact payload, source, and companion
checks are valuable. Keep and use their observations in assessment, including
other tool roots and the selected update-to-use dependency. Story 1 is planned
to retain streams and state for delivery as well as context.

Implementation choices within this scope:

- One shared assessment path consumes case expectations plus retained events,
  response, execution status, and state. Only event decoding varies by host.
  Normalize the minimum facts needed by these cases, not a universal event API.
  Fresh and offline paths call the same case assessor and report decisive
  evidence references with `pass`, `fail`, or `inconclusive` and a reason.
- Pass requires complete successful execution, supported native activation of
  the identified installed copy, the intended case outcome, and required state
  postconditions. Definite violations fail. Missing/unknown observations remain
  inconclusive unless a definite failure is already established. An execution
  failure from Story 1 can never be promoted by the behavioral assessor.
- Successful native expansion is a valid activation route without a separate
  shell read. Use host evidence that establishes it, tied to the selected
  installation. A skill listing, attempted read/call, prompt text, response
  marker, or unique marker source alone is insufficient. Failed/wrong-source
  activation cannot pass. Unknown host event forms remain inconclusive.
- [Retained Plan 014 evidence](../014-prove-codex-adr-use/EVIDENCE.md) explains
  Codex expansion without shell reads and observed Cursor/Claude forms. It is
  design input, not fresh qualification. Do not invent an expansion-success
  event or claim that a historical summary supplies missing raw evidence.
- Keep prompt wording ordinary: the same session-storage request for both
  context fixtures; an update request for both delivery update/refusal fixtures;
  a telemetry-history assessment for updated use. Do not inject expected status
  values, candidate payload counts, release identities to repeat, conclusions,
  invocation headers, or no-change answer templates. A task boundary such as
  “Do not edit files” is legitimate; reporting unchanged state is not proof of it.
- Expected contract facts stay in assessor fixtures. Assess the actual final
  recommendation/refusal against those facts and observations, not occurrence
  of tokens anywhere in the transcript. Use conservative case-specific checks;
  quotations, negation, contradictory recommendations, and unresolved meaning
  must not produce a pass. Do not attempt unrestricted language understanding.
- Human resolution is an explicit addition to Story 1's evidence trail: attempt,
  assessor, reviewer, decision, reason, and decisive evidence. Preserve the
  automated result. It neither fabricates missing activation/state evidence nor
  overrides failed execution or current applicability requirements. No new
  approval gate, automatic retry, or automatic human-decision simulation.

## Outside-in proof

Drive the real selected-case and offline assessment entry points with substitute
native commands and reviewed recorded/synthetic event-response-state fixtures.
Assert verdict, reason, and decisive evidence, not just process exit status.
Label fixture provenance and expected verdicts; synthetic streams test the
adapter contract and cannot establish that a native runtime emits those events.
Every migrated case has a positive, misleading/failed, and inconclusive example
for each host. Include ordinary paraphrases so exact canned text is not the
only passing output. Where meaning cannot be safely determined, test the
inconclusive route rather than adding another keyword to make it green.

Substitutes record received prompts and invocations. Check that expected answers
are absent from the actual launch prompt and reassessment starts no agents or
version probes. Use the real local installer for update-state proofs; printing
or copying a final success response is insufficient. Test fixtures/helpers must
not become accidental standalone shell tests under `scripts/test.sh`.

| Promise / observable proof | Owning leaves |
| --- | --- |
| E2/E4: successful activation versus self-report, failed/wrong-copy activation, incomplete/unknown events, separate execution failure | 1–3, independently per host |
| E1/E4: neutral context prompts, actual accepted decision versus negated/quoted words, clear and conflicting outcomes | 4–5 |
| E3/E4: uncoached contract refusal and unchanged target/source | 6 |
| E3/E4: ordinary update verified from execution and exact state, protected paths preserved | 7 |
| E3/E4: fresh updated use follows the verified installation and discovers unresolved authority | 8 |
| E5: same fresh/offline verdict, evidence-linked uncertainty/resolution, immutable history and applicability preserved, no native calls/retries | 9; fresh/offline parity also checked with leaves 1–8 |
| Shared assertions, per-host fixtures, unchanged cheap/default paths and internal-only scope | Each owning leaf; completion checks below |
| Native discovery, invocation/application, behavior, affected install/update/coexistence | Pending in Story 3 for each host; matrix below |

## Ordered slices

Each leaf integrates its behavior and focused proof together. No preparatory
framework slice. Existing no-argument deterministic checks remain green at
every stopping point; unmigrated assessments are not advertised as satisfying
this story. Proposed focused test entry point: `tests/native-verdicts.sh`, with
case/host selection for short proof loops and all fixtures by default in CI.
Extend Story 1's tests where they already own the relevant entry point.

### 1. Withhold a Codex verdict when activation is unsupported
Type: Behavior
Status: planned
Proof: The Codex assessment entry point accepts supported installed loading or
expansion with otherwise valid case evidence; self-report, marker-only evidence,
failed/wrong-copy reads, and unknown forms do not pass. Missing terminal evidence
and failed execution remain nonpassing even with a convincing response.

Behavior: Retained Codex attempt → assess activation and prerequisite execution
evidence → report a supported activation or a reasoned nonpass. Introduce only
the shared verdict contract needed here, and wire it into Codex's existing cases
and offline path. Activation alone does not grant behavioral acceptance.

Sizing: low confidence; refinement recommended. The first Story 1 integration
and expansion-evidence boundary could exceed the ten-minute leaf limit. Missing
native evidence stays inconclusive; do not solve it by launching a session.

### 2. Distinguish successful Cursor loading from a requested read
Type: Behavior
Status: planned
Proof: Cursor event fixtures through the same entry point distinguish successful
installed content from failed/request-only reads, another skill root, self-report,
and unknown forms; failed/incomplete execution cannot pass.

Behavior: Retained Cursor attempt → decode its actual event evidence → apply
leaf 1's shared activation requirement with evidence references. Accept supported
native expansion if evidenced; require no redundant read for that route.

Sizing: approximately five minutes, medium confidence; adapt existing context
`readToolCall` handling. Reassess sizing if Story 1's boundary differs.

### 3. Distinguish successful Claude activation from a Skill request
Type: Behavior
Status: planned
Proof: Claude event fixtures distinguish supported successful installed activation
from a bare/failed `Skill` request, wrong copy, self-report, and unknown events;
failed/incomplete execution cannot pass.

Behavior: Retained Claude attempt → decode invocation and its supporting result
evidence → apply the same activation requirement without host-specific semantic
rules or mandatory shell reads.

Sizing: approximately five minutes, medium confidence if the relevant result
shape is available. Otherwise preserve inconclusive behavior and flag the precise
qualification gap in Story 3; never synthesize native proof.

### 4. Assess a clear ADR decision without telling the agent the answer
Type: Behavior
Status: planned
Proof: For each host, the captured clear prompt contains only the task/invocation
and read-only boundary. Reviewed supported recommendations pass; a negated Redis
mention, quoted completion marker, or contradictory recommendation does not.
Unchanged target/source observations remain required.

Behavior: Existing clear fixture → ordinary session-storage request and assessment
→ determine whether the accepted decision was followed without coaching status
agreement, demanding a canned response, or requiring irrelevant context policy.

Sizing: approximately five minutes, medium confidence; use one shared clear-case
assessor and fixture table, with uncertain language classified inconclusive.

### 5. Detect proceeding despite unresolved ADR authority
Type: Behavior
Status: planned
Proof: The conflict case receives the same prompt as leaf 4. Evidence naming
both authorities and their actual values while stopping for human resolution
passes; “no conflict,” quotations, or proceeding while mentioning a stop do not.
A conditional explanation with a real stop remains a valid positive example.

Behavior: Existing conflict fixture → assess the response and unchanged state
→ distinguish a supported stop from a recommendation that ignores the conflict.
Do not infer resolution from the presence of “human” or “Accepted.”

Sizing: approximately five minutes, medium confidence; reuse leaf 4's evidence
path. Keep ambiguous semantics inconclusive instead of broadening a parser.

### 6. Detect a real legacy contract refusal from an ordinary update request
Type: Behavior
Status: planned
Proof: Each delivery wrapper receives an uncoached update request. Fixtures with
supported contract comparison and unchanged target/source pass refusal;
unrelated launch failure, a claim to refuse while replacing files, or quoted
contract words do not. Fresh/offline verdicts agree.

Behavior: Existing legacy installation and candidate → ordinary update attempt
→ assess refusal for the actual contract mismatch, using activation plus observed
state. Replace Claude's divergent wording requirements with shared case facts.

Sizing: low confidence; refinement recommended. Prompt, duplicated refusal logic,
and retained state integration may require narrower green boundaries.

### 7. Verify an ordinary update from its execution and resulting installation
Type: Behavior
Status: planned
Proof: Substitute-driven real local updates pass with exact expected payload and
version plus preserved source, companion, and other roots. A failed required
update followed by a success claim, wrong version/bytes, unexpected protected
changes, or unsupported provenance cannot pass. No expected release/report facts
are supplied in the agent prompt.

Behavior: Existing bootstrapped installation → ordinary newer-release update
→ assess its actual transition and report against fixture expectations. Preserve
deterministic delivery assertions and Story 1's verified dependency record;
keep native report assessment separate from helper-only cheap checks.

Sizing: low confidence; refinement recommended. Retained state/provenance and
current transition assertions cross a boundary not yet implemented by Story 1.

### 8. Assess the improved skill on the installation that was actually updated
Type: Behavior
Status: planned
Proof: Updated-use fixtures show a fresh session activating the updated copy,
identifying both actual status authorities/values, and stopping unchanged. A
stale/different installation, missing verified update dependency, contradictory
advice, or modified adopter fails or stays inconclusive as the evidence warrants.
The captured prompt supplies no disagreement, status values, or answer template.

Behavior: Verified update dependency and fresh use attempt → assess the ordinary
telemetry-history request → establish the existing improved conflict behavior
on that same installation. Reuse leaf 5's conflict checks with this fixture's
authority facts; never pass updated use from a copied payload alone.

Sizing: low confidence; refinement recommended for the dependency-to-activation
link. Reuse Story 1's relationship record rather than reconstructing a workspace.

### 9. Retain an inconclusive assessment and its evidence-linked resolution
Type: Behavior
Status: planned
Proof: Across all three adapters, an ambiguous saved attempt reports inconclusive
with reason/evidence. Supplying an explicit reviewer resolution appends its
identity and rationale while the attempt and automated result remain unchanged.
Missing evidence and stale applicability cannot become an unqualified pass;
sentinel commands prove zero native calls, version probes, or retries.

Behavior: Maintainer assesses uncertain saved evidence and later supplies a
resolution → retain both judgments against the same evidence in Story 1's trail.
Document this existing-result workflow briefly; build no review application.

Sizing: approximately five minutes, medium confidence; use Story 1's append-only
reassessment path. Split if that interface does not yet support explicit review.

## Completion and native evidence ownership

Run each leaf's focused cheap proof and affected default wrappers. At story
completion run `npm test` and `npm run lint` once, preserving the broad cheap
suite and checking shared-helper callers. Record observed per-case/host verdict
coverage here. No `--native` execution or product/guidance installation is part
of this story's acceptance; isolated deterministic fixture installation is.

| Platform | Evidence at planning time | Story 2 functional acceptance | Native acceptance owner |
| --- | --- | --- | --- |
| Codex | Source inspection and historical expansion lesson; no new runtime observation | Pending: activation, all five case verdicts, positive/counterexample/inconclusive fixtures and offline parity | SEED-007 Story 3: discovery, invocation/application, intended behavior, affected install/update/coexistence and changed-assessor qualification |
| Cursor | Source inspection of successful context reads and coached delivery prompts; no new runtime observation | Pending: same coverage through Cursor event adapter | Pending independently in Story 3 for the same claim categories |
| Claude Code | Source inspection of Skill-request assertion and duplicate refusal checks; no new runtime observation | Pending: same coverage through Claude event adapter | Pending independently in Story 3 for the same claim categories |

No prior proof is newly certified. Old coached results stay historical; offline
reassessment cannot recover an independent conclusion from an answer supplied
in the original prompt. Unknown native event semantics and changed inputs stay
pending for Story 3 to resolve on a named candidate. Implementation completion
does not close that story or authorize release of the affected behavior.

## Learnings and readiness

No implementation learning yet. No blocking product questions remain. Story 1
is a real execution prerequisite; its exact result schema/commands are not yet
implemented and must be consumed rather than specified again here.

**Refinement recommended: leaves 1 and 6–8.** Those integration paths have low
sizing confidence and could exceed the borrowed skill's ten-minute limit.
Other leaves target about five minutes including focused verification, assuming
Story 1's interface is available; these are hypotheses, not timing guarantees.
Recheck the trigger gate against the delivered interface before execution.
Refinement remains in this PLAN and must not expand the selected story.
