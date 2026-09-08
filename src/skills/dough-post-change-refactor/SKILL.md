---
name: dough-post-change-refactor
description: >-
  Refactor concepts implicated by the current uncommitted change before commit.
  Use concept-bounded scope even when completion requires untouched code, but
  Jidoka-stop before unapproved cross-subsystem refactoring. Remove duplication,
  unclear naming, shotgun surgery, dead / test-only / redundant code, and
  oversized files; run related tests only when the refactor edits. Local slice
  wrap-up overlay (dough-execute-plan / gsd-execute-phase). Use after a slice, before
  commit, or on:
  refactor change, clean up change, post-change refactor, before commit cleanup,
  tidy current change.
---

<objective>
Clean concepts implicated by the **current uncommitted change** so they are
cohesive, capability-named, and non-speculative, then return control for commit.

Purpose: Local wrap-up gate required by `dough-execute-plan` / `/gsd-execute-phase`
when the client selects that workflow. Structure-only: no new behavior.

Output: Refactored tree + `## REFACTOR COMPLETE`, or an impact report +
`## REFACTOR JIDOKA STOP`. **Do not commit** — the caller commits after success
(and pushes when closing a slice).
</objective>

<context>
Read the client project's navigation and focused-test guidance. Resolve its
production subsystem boundaries, domain vocabulary, file-size limits and
exemptions, tooling wrapper, whitespace check with generated-file exclusions,
and focused tests for affected areas. Resolve generated-artifact triggers and
regeneration commands only when affected. Missing context blocks the affected
pass: name the gap and do not claim completion. An empty diff needs no stack
configuration.

**Scope is concept-bounded, not file-bounded.** A candidate must be triggered
by an issue introduced, exposed, or materially aggravated by the current change
or highly related code. Such code represents the same concept, duplicates the
same knowledge, or must change to leave it coherent. Dependency adjacency alone
is neither required nor sufficient.

Find the smallest complete set of representations, callers, tests, fixtures,
and configuration needed for coherence, including untouched code when needed.
Every edit must serve that candidate; do not initiate nearby cleanup.

Discover scope:

```bash
git status
git diff
git diff --cached
```

Use the client's whitespace check; never manually repair generated artifacts.
Run tooling in the client environment and Git according to its Git convention.

**Plan justification (decision boundary):**
Keep code justified by the **current change** or the **immediate next**
slice in the active plan
at its client-supplied path.
Anything justified only by a later slice, or by "we might need it later",
is speculative — remove it. No plan → justification comes only from the
current change. The immediate next slice may justify retaining code, but
does not independently trigger unrelated refactoring.

**Subsystem boundary:** Use the client project's production subsystem map.
Tests, fixtures, generated artifacts, and configuration following one production
seam do not alone create a crossing. Existing behavior work spanning subsystems
does not trigger the gate; the refactoring itself must require coordinated
production edits across boundaries.

Optional caller context (when spawned from dough-execute-plan):
- Plan path and current slice text (for the immediate-next-slice justification
  boundary)
- Implementer's compact `proof:` block(s), including each exact focused command
  and the behavior or paths it covers

**Invokers:** `dough-execute-plan` (fresh sub-agent before commit), `bug-fixing`,
`test-optimization`, or on-demand developer request.
</context>

<process>

<preflight_gate name="discover_scope">
Run the git discovery commands above. If there is no uncommitted change,
report empty scope and emit `## REFACTOR COMPLETE` with no edits.
</preflight_gate>

<preflight_gate name="map_concept_impact">
Before editing, read [the refactor checks](references/refactor-checks.md) and
perform a fast read-only pass over every check. For each candidate, record:

1. The triggering issue and its connection to the current change.
2. The minimum concept-bounded edit set needed for coherent completion.
3. The production subsystems that edit set would touch.

Use references as navigation, not automatic scope. Do not inventory general
repository cleanup.
</preflight_gate>

<preflight_gate name="cross_subsystem_jidoka">
If a candidate requires production refactoring in more than one subsystem,
stop before editing unless the human explicitly authorized that named concept
and those subsystems. Generic "clean up" or "refactor" requests do not qualify.

Return the `<output>` Jidoka report; do not enter the edit/test pass or
substitute a partial refactoring. If discovered while editing, stop before the
first cross-subsystem edit and leave no partial candidate: reverse only this
agent's edits for that candidate, never pre-existing user changes.
</preflight_gate>

After the gates, **decide first**: if `map_concept_impact` recorded no edit
candidates (and the cross-subsystem gate did not stop), skip the edit steps
and `confirm_related_tests`; report "none — already clean" and emit
`## REFACTOR COMPLETE`. Do not run related tests as a pre-triage gate.

If there are edit candidates, execute them **in refactor-check order**, then
`confirm_related_tests`. Do not repeat broad discovery. After all checks pass,
return to the caller — **do not commit** from inside this skill.

<step name="confirm_related_tests">
Skip this step when triage recorded no refactor edits.

When the caller provided compact proof, rerun only the handed-off command(s)
whose covered behavior or paths the refactor edits invalidated — not the whole
suite, and not before deciding to edit. If an edit moved the covered boundary
so a handed-off command is no longer the right focused proof, state why and run
a focused replacement. Do not rerun unaffected handed-off proof. Without a
proof handoff, run related focused tests for the files this refactor changed.
Use literal focused commands from the client project. Prefer observable stable
boundaries that exercise real lower layers with crafted data; mock external
services rather than internal collaborators. Do not invent stack-specific commands.

All related tests must pass before returning. If a test breaks because of
the refactor (not the original change), fix it now.
</step>

</process>

<success_criteria>
- Every candidate is triggered by the current change or highly related code
- Edits are the smallest coherent concept-bounded set, including untouched files
- No cross-subsystem refactoring without concept-specific human authorization
- No speculative structure beyond current change / immediate next slice
- Duplication, naming, shotgun, dead-code, and file-size checks applied
  (the client project's limits and exemptions)
- Invalidated handed-off proof (or related focused tests without a handoff)
  green when this skill edited; skipped when triage made no edits
- Successful and Jidoka handoffs report approximate active elapsed time
- No commit created by this skill
- Final output includes `## REFACTOR COMPLETE`
</success_criteria>

<output>
On successful completion, report a short summary to the caller:

1. Which checks led to changes — duplication / naming / shotgun / dead code /
   file size (or "none — already clean").
2. Files renamed, extracted, split, or deleted.
3. Which related tests were run and confirmed passing — or
   `skipped — no refactor edits`.
4. Approximate active elapsed time spent on the refactor pass.

```
## REFACTOR COMPLETE
```

Hand control back. **Do not commit** — the caller commits (and pushes when
closing a slice).

On a cross-subsystem gate, report only decision-relevant facts:

1. Triggering issue and its connection to the current change.
2. Concept requiring refactoring.
3. Affected subsystems and representative files.
4. Why a single-subsystem edit would be partial or misleading.
5. Expected risk and focused validation.
6. Choices: authorize it, defer it, or approve a described narrow exception.
7. Approximate active elapsed time spent before the stop.

End with:

```
## REFACTOR JIDOKA STOP
```

Do not emit `## REFACTOR COMPLETE`. The caller must surface the decision and
must not consider refactoring complete or commit until the human decides.
</output>

<out_of_scope>
- Do not initiate unrelated refactoring discovered during concept tracing.
- Do not apply cross-subsystem refactoring without explicit, concept-specific
  human authorization.
- Do not start a new slice or add new behavior — Structure only.
- Do not run the entire test suite or trigger CI.
- Do not run related tests when triage recorded no refactor edits.
- Regenerate artifacts only when the client-defined trigger changed; use its
  generator and validate affected consumers, never hand-edit generated output.
- Do not commit, push, or amend from inside this skill.
</out_of_scope>
