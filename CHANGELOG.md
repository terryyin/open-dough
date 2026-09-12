## 0.3.12 - 2026-09-12

- Link taken planned stories directly to their slice plans while preserving each story's title, canonical link, and identity. Add missing plan links on resume without duplicating or reordering entries; keep quick stories planless and avoid duplicate links for corrections.
- Simplify story wrap-up guidance for deleting spent history, preserving active follow-up provenance, committing closure, and safely removing integrated worktree resources.
- Resolve wrap-up integration conflicts using the reasoning and evidence behind both sides, verify the resolution, and complete the merge. Preserve unresolved work for a human decision when the evidence cannot justify a coherent resolution.
- Clarify that update baselines follow the prior release's declared installed payload, with local collision protection for newly declared paths. Close completed repository story records while retaining outstanding acceptance work.

Native acceptance for Codex, Cursor, and Claude Code was explicitly skipped at the maintainer's request for `0.3.12`. Acceptance for the changed guidance and previously pending behaviors remains pending and is not reported as passing.

## 0.3.11 - 2026-09-11

- Ship the missing bounded process-log reference required by the execution retrospective.
- Compare installed files against the recorded release's declared payload, allowing ordinary updates to add references that existed in source but were not previously shipped while preserving local collision protection.
- Align native delivery fixtures with the maintained payload inventory and verify reference installation, update, link resolution, and preservation across all three tool entry contexts.

A focused native Codex candidate check verified installed-reference use, preservation of existing log content, and the 500-line warning. Remaining native acceptance checks, including the broader cross-tool lifecycle and bounded-log behaviors tracked by SEED-010 Story 2, proceed under the maintainer's explicit exception for `0.3.11`. They remain pending and are not reported as passing.

## 0.3.10 - 2026-09-11

- Add `dough-pfe` (Proudly Found Elsewhere) and its required planning reference to the installable payload. Find existing solutions across the whole product, assess domain meaning before reuse or modularization, and stop unresolved consequential choices for the developer.
- Integrate existing-solution findings and architectural thinking into slice planning, refinement, execution, and delegation. Carry supported findings forward and revisit them only when new evidence or responsibility changes require it.
- Use brief North Star topics only for warranted temporary architectural direction. Route contrary execution evidence through the coordinator, align direction and the remaining plan before resuming, preserve human ownership of Accepted ADRs, and retire disposable topics during wrap-up only after checking active work and durable decision context.
- Clarify implementation of the simplest supported domain rule: examples do not impose arbitrary rejection limits, deferred behavior needs no machinery now, and an active plan can authorize necessary cross-subsystem structure for the current responsibility.
- Update repository architectural guidance on domain language, development lifecycle, installation and update, and the separation of temporary direction from durable decisions. Complete wrap-up of the active-backlog correction and lightweight PFE story, retaining recovery through Git.

Cross-tool native validation for Codex, Cursor, and Claude Code was explicitly skipped at the maintainer's request for `0.3.10`. Native acceptance for the changed guidance and previously pending behaviors remains pending and is not reported as passing.

## 0.3.9 - 2026-09-11

- Support executing an explicitly selected, understood story as one quick slice without inventing a plan, reviewing planless executions from available context, and converting oversized quick work into ordinary planned execution while preserving attributable work and one active backlog entry.
- Run planned execution in an owned Git worktree by default, claim work before isolation, preserve stable CI-observer behavior, commit closure durably, integrate the completed tip into the recorded target checkout, and remove only verified clean owned worktree resources.
- Let projects configure process-review selection in an optional `open-dough.json` that installation and update preserve. Bound process logs with a warning at 500 lines, refusal above 1,000 lines, and evidence-preserving replacement of lower-priority material when a write would overflow.
- Simplify active-work lifecycle around **Taken** and **Backlog list**. Completed work leaves the active backlog at wrap-up, retired completion-list vocabulary is removed, and Git remains the recovery surface for deleted execution history.
- Add the internal `triage-retrospective-findings` maintainer skill for evidence-backed follow-up recommendations, selected-story or bounded-correction creation, canonical queueing, reciprocal evidence links, and duplicate-safe rereview. It remains outside the installable payload.

Native acceptance remains pending for quick and oversized execution, planless retrospective review, the revised wrap-up and worktree lifecycle, process-review configuration, and bounded process-log behavior across Codex, Cursor, and Claude Code. This release proceeds under an explicit maintainer-approved exception for `0.3.9`; these checks remain pending and are not reported as passing.

## 0.3.8 - 2026-09-10

- Add a persistent **Taken** section to the product backlog so work whose execution has started is distinct from the prioritized queue. Authorized execution moves the existing queued entry first; resume does not duplicate or reorder it, and work absent from both active lists is not fabricated.
- Keep taken work visible through pauses, failures, plan completion, and retrospective. Story wrap-up removes the completed **Taken** entry with its other spent history, while standalone backlog maintenance can remove completed work from either active list when explicitly requested.
- Complete repository wrap-up for the finding-name work by removing its spent Quick 040 plan, evidence, and obsolete process findings while retaining current product guidance and Git recovery.

Native acceptance was explicitly skipped for the new **Taken** transition; existing native evidence does not prove that behavior. Native acceptance also remains pending for retrospective logging and the broader lifecycle-guidance requirements tracked by Story 2. This release proceeds under an explicit maintainer-approved exception for `0.3.8`; these checks remain pending and are not reported as passing.

## 0.3.7 - 2026-09-10

- Support bounded, seedless retrospective corrections throughout planning, execution, backlog prioritization, retrospective review, and wrap-up. A correction plan can remain its canonical active home without an invented feature-story seed.
- Strengthen story wrap-up so it requires recorded retrospective completion, preserves recoverable Git history, assimilates lasting product facts from spent plans, removes empty spent directories, and handles existing follow-up corrections without duplication.
- Record native story-wrap-up acceptance for Codex, Cursor, and Claude Code, covering feature-story and seedless-correction closure, refusal boundaries, product-knowledge preservation, and spent-plan deletion.
- Extend retrospective process logs with the Open Dough guidance release actually used during execution. Preserve adopted `ODF-NNN` identities, allocate non-colliding local `DD-NNN` codes, and keep uncertain, corrected, or reintroduced findings distinct.
- Add the internal `reconcile-finding-names` maintainer skill and finding-name record for evidence-based mapping to stable `ODF-NNN` identities. Keep this maintenance guidance outside the installable client payload.
- Accept same-document payload links during update verification and avoid masking `find` failures in the installer omission check.

Native acceptance remains pending for retrospective logging and the broader lifecycle-guidance requirements tracked by Story 2, including refinement and planning distinctions, cumulative design, refactoring and plan-conflict handoffs, whole-product correction planning, and whole-suite test review. This release proceeds under an explicit maintainer-approved exception for `0.3.7`; those checks remain pending and are not reported as passing.

## 0.3.6 - 2026-09-10

- Add `dough-execution-retrospective` to the installable payload: review implementation, product direction, and process efficiency; maintain process findings in `DearDough.md`; plan bounded corrections and apply authorized backlog changes. Product and process reviews can be skipped independently.
- Add `dough-story-wrap-up` to the installable payload: close completed stories after retrospective, preserve recoverability in Git, assimilate lasting knowledge, remove spent history, and prioritize existing follow-up work. Execution now preserves completed plans and evidence for these later steps.
- Keep slice planning within the triggering instruction's execution authority. Report concrete concerns without choosing the next workflow or certifying readiness, and support bounded retrospective corrections.
- Strengthen cohesive design guidance across slices: distinguish delivery examples from real rejection constraints, assess whole concepts including untouched representations and orchestration, and surface disputed restrictions for human resolution.
- Expand retrospective review to current whole-product architecture and the test suite as behavioral documentation, with bounded correction plans and preservation proof.
- Refuse edited managed hook commands across shell suffix delimiters. Increase CI timeout margin and keep prior-release payload fixtures internally consistent.

Native acceptance remains incomplete for retrospective and wrap-up behavior and for Cursor's project Claude-adapter compatibility invocation. Claude remembered-source update with fresh ADR use and native CI-watch acceptance are now recorded as passing. This release proceeds under an explicit maintainer-approved exception for those remaining native acceptance checks; they remain pending and are not reported as passing.

## 0.3.5 - 2026-09-10

Planning guidance now infers plan numbers and treats numeric timing limits as optional.

## 0.3.4 - 2026-09-09

CI host hooks: install and update portable Cursor and Claude Code observation hooks, merge them safely beside existing settings, repair missing registrations on repeat use, and preserve semantically complete configuration without rewrites.

This release uses a maintainer-approved one-release exception: Cursor's Claude-compatibility invocation and SEED-007's native Claude updated-use check remain explicitly pending rather than being reported as passing.

## 0.3.3 - 2026-09-09

Execution-related skills: add `dough-execute-plan` and `dough-post-change-refactor` to the client payload, including execution references, asynchronous CI observation scripts, and host hook fragments.

## 0.3.2 - 2026-09-08

Publish three story-refinement workflow skills in the installable client payload: `dough-resplit-story`, `dough-slice-planning`, and `dough-slice-plan-refinement`.

## 0.3.1 - 2026-09-08

Add story-related skills: `dough-story-decomposition` and `dough-story-refinement`, including their supporting references, to installation and updates for Codex, Cursor, and Claude Code.

## 0.3.0 - 2026-09-08

Fix update.

## 0.2.5 - 2026-09-08

Promote `dough-product-backlog` into the installable public payload for Codex, Cursor, and Claude Code. Install and update verification now includes the product-backlog skill alongside the updater and ADR-awareness guidance.

## 0.2.4 - 2026-09-08

Codex and Cursor now share the same `.agents/skills/` folder, avoiding a duplicate installed payload while Claude Code continues to use `.claude/skills/`. Installation and updates still serve all three tools together through the two physical skill roots.

## 0.2.3 - 2026-09-08

Install and update Open Dough across Codex, Cursor, and Claude Code together.

## 0.2.2 - 2026-09-08

Standalone installations remember their release source and version. Ordinary updates use that source without a URL and verify the installed baseline before replacement; unverifiable installations refuse without writes, and verified current versions remain unchanged. Explicit force restores the complete latest payload, including a one-time supplied-source bootstrap for legacy installations. Client changes remain reviewable and uncommitted.

Released for maintainer manual trials under an explicit acceptance exception: Cursor's candidate update and fresh-use journey passed; Codex installed-skill loading remains inconclusive, and Claude Code verification remains pending after test-launcher permission failures. Cross-platform native acceptance is not complete.

## 0.2.1 - 2026-09-07

ADR-awareness now requires only context needed for the current request and does not invent disagreement or supersession policies when those situations are absent. dough-update can assess whether installed ADR guidance could replace a local practice, retain required adopter context, and switch callers after authorized replacement. Automatic changelog presentation during install or update remains future work.

## 0.2.0 - 2026-09-06

Safe installation now selects and inspects the pinned latest numeric release. Recorded updates advance older installations, leave equal versions unchanged, and preserve newer versions. The public payload now includes ADR-awareness and its recognition record for Codex, Cursor, and Claude Code. Local-guidance replacement and automatic changelog presentation remain future work.

## 0.1.0 - 2026-09-06

Installer and dough-update install and refresh project-local Open Dough guidance from a supplied repository URL for Codex, Cursor, and Claude Code. Updates clone the default branch and unconditionally reinstall the fetched skill. Maintainers can prepare and tag source releases with the internal release-version skill (canonical .agents/skills/release-version/SKILL.md, plus a thin Claude Code discovery pointer only). The installer does not distribute that internal skill or the repository AGENTS.md acceptance guard. This release does not add version-aware updates or automatic changelog display during install or update.
