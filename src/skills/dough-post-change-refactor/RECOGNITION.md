# Recognition: dough-post-change-refactor

Review: ready for maintainer review

## Original clues

`post-change-refactor` at `.agents/skills/post-change-refactor/SKILL.md` in the supplied source checkout.
Provenance does not determine replacement suitability.

## Purpose

Cleans concepts implicated by an uncommitted change before the caller commits.

## Triggers

After a slice and before commit; refactor change, clean up change, tidy current change.

## Distinguishing behavior

Concept-bounded scope may include untouched representations; current/immediate-next-slice justification; cross-subsystem human decision before edits; test only invalidated proof after actual edits; no commits.

## Client project context

Current diff, client subsystem map, domain vocabulary, size policy, environment and focused proof commands; optional active PLAN and implementer proof.

## Differences that rule out replacement

Whole-repository cleanup, strict changed-file-only scope, unconditional tests, generic permission for cross-subsystem refactors, or committing inside refactor are not equivalent.

## Validation needed

Representative invocation-context, required-client-context, and useful-outcome
walkthroughs are recorded in
[the extraction review](../dough-execute-plan/EXTRACTION.md#representative-behavior-review).
Before promotion, review those cases against the selected client, including a
missing-context stop and a human-owned conflict. Native integration and
installation/update/coexistence acceptance remain pending under ADR 0005.
See the same review for dependency disposition, test evidence, and limitations.
Source integrity is recorded in
[SOURCE-CHECKSUMS.json](../dough-execute-plan/SOURCE-CHECKSUMS.json).
