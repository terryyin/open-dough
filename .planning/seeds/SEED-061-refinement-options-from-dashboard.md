---
id: SEED-061
status: active
planted: 2026-09-30
planted_during: Maintainer discussion of composable story refinement options
trigger_when: A developer wants to select command options when launching story refinement from the dashboard
scope: story
---

# SEED-061: Select refinement options from the dashboard

## Why This Matters

A developer launching story refinement from the dashboard should be able to
discover and select the command's available options without remembering flags
or reproducing them in the optional instruction field. The options offered by
the launch dialog and their execution meaning must stay aligned as refinement
guidance evolves.

Terry requested one cohesive, authoritative definition of a command's options,
consumed by command execution and its selection dialogue. That definition must
express whether options compose or belong to an exclusive selection. The design
should apply generally to command options, while this delivery implements only
the behavior needed to launch refinement.

## Story

<a id="correct-refinement-options-launch-follow-ups"></a>

### Correct the refinement options launch after its outcome review

**Identity:** SEED-061#correct-refinement-options-launch-follow-ups
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/187-correct-refinement-options-launch/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"20ef6d9fa4e0f894af47cf49c6523220f254dff2db4742239b9c5ca2c038708b","plan":"577b6c6dada42929fd7978814a312624483d7375ae633291bc566c5d9706c501"}}
```

- **Goal:** A developer who launches refinement with options sees in the dialog
  when a kept selection names an option the project no longer offers, reads
  one grammatical reason when options are unavailable, and the agent's skill
  names where its exclusive groups are defined; the launch tests that decide
  pure option rules run without a server. This corrects the delivered story
  Select refinement options when launching from the dashboard
  (reviewed commits `06c65127..77348819`; its story and plan are recoverable
  from `8b7476fd6306f3da875186d7ce7f1d7dd6dc53b9:.planning/seeds/SEED-061-refinement-options-from-dashboard.md` and
  `8b7476fd6306f3da875186d7ce7f1d7dd6dc53b9:.planning/slice-plans/185-select-refinement-options-from-dashboard/PLAN.md`); it adds no feature promise.
- **Scope:** Say in the dialog, once the options are read, which kept flags are
  no longer offered and are not sent; one wording for the unavailable reason in
  the dialog, the boundary refusal and the launch guide; one pointer in the
  refinement skill from "group" to the definition's `groups`; direct tests for
  the pure option rules with end-to-end tests kept for file state, the boundary
  and launch order. Not in scope: the refusal's place on the card, this
  repository's own installed definition, or any change to selection rules.
- **Plan:** [Plan 187](../slice-plans/187-correct-refinement-options-launch/PLAN.md)
  holds the findings, proof and slices.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Refinement options definition](../../src/skills/dough-story-refinement/references/refinement-options.json).
- [Existing dashboard launch behavior](../../dashboard/AGENT-LAUNCH.md).
- [ADR 0002: Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
- [ADR 0006: Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
