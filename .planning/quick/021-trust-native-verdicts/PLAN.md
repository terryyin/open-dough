# Assess intended behavior without requiring expected wording

Status: planned.
Order: **20 → 22 → 21**. Start after plan 22's reduced evidence contract is delivered.

## Scope

Deliver [SEED-007 Story 2](../../seeds/SEED-007-cross-tool-validation.md#trust-native-verdicts)
under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).
Repair prompts and assessment in the existing context and delivery checks.
Consume [plan 22](../022-retain-native-evidence-for-verdicts/PLAN.md)'s saved
context and combined update→fresh-use artifacts; do not rebuild its runner.

Define shared behavior expectations once for clear ADR use, unresolved authority,
legacy contract refusal, and a real update followed by fresh use. Test shared
logic once. Test only command/event differences per tool; do not build a
case-by-tool-by-counterexample matrix.

Use small automated checks for supported activation and observable state. For
prose that cannot be judged reliably, report inconclusive and document the case
expectations for review. A reviewer records the result, reason, and evidence in
the acceptance record. Do not build a semantic parser, judge model, offline
reassessment interface, resolution workflow, or new test framework.

No skill/installer changes, new integration mechanisms, native runs, client
adoption, old-plan migration, or releases. Story 3 owns native acceptance.

## Assessment rules

- Use ordinary task prompts. Retain explicit skill invocation and necessary
  inputs, but remove expected decisions, status values, payload counts, release
  facts to repeat, and answer templates.
- Require complete successful execution, supported activation of the installed
  copy, the intended outcome, and required state observations for a pass.
  Execution failure or a definite contract violation cannot pass. Missing or
  ambiguous evidence remains inconclusive unless a definite failure is known.
- Accept evidenced native expansion without requiring a redundant file read.
  A requested read/call, marker, or self-report alone does not prove activation.
  Keep unknown event forms inconclusive; do not invent vendor success events.
- Remove checks tied to incidental instruction sentences. Preserve exact payload
  comparisons and deliberately required output contracts. A completion marker
  can be checked as an output contract but cannot prove activation or correctness.
- Test equivalent prose, negation, quotation, and contradictory recommendations
  wherever automated checks interpret language. If a small check cannot decide,
  preserve uncertainty instead of extending a keyword parser.
- Keep original evidence. Document any later review without overwriting the
  automated result. Do not certify coached historical runs as independent proof.

## Ordered slices

### 1. Gate assessment on execution and installed activation

Type: Behavior
Status: planned

Add one shared prerequisite gate and the minimum host decoding it needs. Wire it
into retained context and combined journey assessment. Report result, reason,
and evidence references. Keep behavioral assessment separate from activation.

Proof: Test shared handling of successful prerequisites, execution failure,
missing evidence, and wrong-copy activation once. For each tool, test a supported
activation form and an unsupported/failed form at the decoder boundary. Use
recorded evidence; if a supported form is unavailable, record that gap for Story
3 and keep the result inconclusive. Do not launch a native session to fill it.

### 2. Replace wording checks in clear and conflicting ADR use

Type: Behavior
Status: planned

Use the same ordinary session-storage request for both fixtures. Define clear
expectations: follow and cite the Accepted decision when authority agrees;
identify the conflicting authorities and stop dependent work when it does not.
Keep read-only state checks. Remove incidental skill-sentence assertions,
including content checks used only as loading evidence.

Proof: Shared examples cover a valid recommendation, a valid stop, a conditional
explanation with a stop, and misleading/ambiguous wording. A prose-dependent
outcome may remain inconclusive for documented review. Rephrasing incidental
skill instructions must not fail a static assertion; response paraphrases must
not fail solely for wording. Test this shared logic once, not once per tool.

### 3. Assess the combined update and fresh use from observed state

Type: Behavior
Status: planned

Remove answer coaching from update and fresh-use prompts. Use plan 22's observed
transition to check installed bytes/version, provenance, unchanged protected
paths, and fresh activation on the same updated target. Reuse leaf 2's conflict
expectations for the existing updated-use fixture.

Proof: A real fixture update has the expected state; wrong bytes/version,
protected writes, stale-target use, and a failed update followed by a success
claim cannot pass. Verify these shared cases once. Adapter routing is already
covered by plan 22; do not repeat the state matrix through every tool.

### 4. Keep legacy refusal as a shared product behavior check

Type: Behavior
Status: planned

Keep existing deterministic refusal/preservation checks. Remove coaching and
duplicate host-specific prose assertions from existing legacy-refusal paths.
Use shared expectations: the actual incompatible contract prevents the update
and target/source remain unchanged. No new selected refusal integration path.

Proof: Shared examples distinguish supported refusal, unrelated execution
failure, and a refusal claim accompanied by writes. Use documented review for
unresolved prose. Update test usage to distinguish automatic checks from review
and explain which representative native evidence Story 3 still needs.

## Completion and native evidence

Run focused cheap checks for each leaf and the affected default wrappers. Run
`npm test` and `npm run lint` once at completion. Record shared behavior coverage
once and adapter evidence separately below. Do not claim native acceptance.

| Platform | Cheap adapter proof | Native acceptance |
| --- | --- | --- |
| Codex | Pending leaf 1; historical expansion evidence is input, not new proof. | Pending Story 3 applicability review and unresolved representative checks. |
| Cursor | Pending leaf 1; distinguish successful installed loading from a request. | Pending Story 3 applicability review and unresolved representative checks. |
| Claude Code | Pending leaf 1; a Skill request alone is insufficient. | Pending Story 3 applicability review and unresolved representative checks. |

Story 3 must record per-tool discovery, invocation/application, intended behavior,
and affected install/update/coexistence evidence or justified reuse. This plan's
completion closes test migration only. Missing vendor observations do not justify
expanding the harness before native qualification.
