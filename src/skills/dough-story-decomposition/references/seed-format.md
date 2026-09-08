# Seed format

Read when creating a story home or updating its structure. One seed contains one
parent problem and its candidate stories; each story has one home section. This
is non-executable planning input.

Use the adopter's home ID, filename, metadata fields, and lifecycle vocabulary.
Preserve existing metadata and anchors. The following metadata illustrates the
source format's meanings, not a required GSD dependency: home identity, dormant
status, creation date, creation context, resurfacing trigger, and whole-set
size. Do not invent values; resolve required missing context before writing.

```yaml
---
id: <home ID>
status: <adopter's dormant status>
planted: <creation date>
planted_during: <milestone, phase, or context>
trigger_when: <when this problem should surface>
scope: <whole-set size under adopter conventions>
---
```

```markdown
# <home ID>: <parent problem or desired effect>

## Why This Matters

<beneficiary, current problem, desired effect, evidence>

## Alternatives and Decision

<recommended direction, strongest simpler alternative, assumptions>

## Story Decomposition

### 1. <observable outcome>

- **For / why:** ...
- **Evaluation:** ...
- **Value / learning:** ...
- **Effort hypothesis:** S | M | L — confidence and assumptions
- **Depends on:** none, or a genuine product prerequisite
- **Safe stopping point:** value retained if later stories are cancelled, and
  safety conditions this story must satisfy independently

## Ordering and Scope Reduction

<ordering rationale, safe stopping points, first-to-drop stories>

## Open Decisions

<only decisions that change story selection or order>

## When to Surface

<trigger>

## Breadcrumbs

<supplied requirements or references; no code audit>
```

Use the adopter's stable-anchor convention for new queued stories. Local story
numbering is not global priority. During refinement, expand the selected story
section with Goal, Scope, and Key examples; include UI or Architecture only when
needed. Preserve sibling stories. Link related seeds instead of copying detail.
