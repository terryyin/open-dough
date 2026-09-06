# 0001 — Ubiquitous language

**Status:** Proposed

**Date:** 2026-09-06

**Decision makers:** Terry Yin

**Consulted:**

## Context

Open Dough installs skills, rules, and potentially other documents into other
projects. We need to distinguish those skills from skills used only to develop
Open Dough itself.

## Decision

| Term | Meaning | Skill naming |
| --- | --- | --- |
| Internal skills | Agent skills used only within Open Dough itself | No required prefix |
| Open-Dough skills | Agent skills exposed for installation into other projects | Names must start with `dough-` |

Rule naming remains undecided.

## Consequences

The `dough-` prefix identifies exposed skills without imposing the same naming
constraint on internal skills.
