---
id: SEED-049
status: active
planted: 2026-09-27
planted_during: Maintainer request for a project-wide agent overview in the dashboard
trigger_when: A developer wants to inspect an agent or understand who is commissioned in the selected project
scope: 1 story
---

# SEED-049: See all project agents and their commissions

## Why This Matters

The dashboard's agent roster and each commission's credited human must stay
honest when evidence is slow, odd, or missing. A false "Not commissioned", a
clock held back by a slow attribution read, or a stale avatar would mislead a
developer about who is working on what.

## Story

<a id="roster-evidence-correction"></a>

### Keep roster and human credit honest under slow or odd evidence

**Identity:** SEED-049#roster-evidence-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/125-roster-evidence-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"24e2326ad160bf743adc0356ebb12eeefc1b784960dca4de9b9f3d8d989b1589","plan":"e3b292d196ce772ed8c559f120bc7ec88324b23b2f4bc6db69aa333ce1b0e328"}}
```

**Goal:** A developer reading the agent roster and story cards gets slice
clocks as promptly as before human credit existed, never sees a rotation
name falsely called not commissioned, reads uncertainty rather than a
perpetual "reading" state, and sees the current avatar of the credited
account. The roster's facts and the Take's slice clock follow one allocation
rule, with one vocabulary and a suite free of repeated proof. This corrects
the project agent roster execution (its story and plan are recoverable at
commit `74e2a91` under `.planning/seeds/SEED-049-project-agent-roster.md` and
`.planning/slice-plans/123-agent-roster-overview/PLAN.md`) and adds no
feature promise.

**Scope:** attribution timing within the snapshot read; profile-name
validation shared with the execution scripts; the roster without a readable
snapshot; avatar cache keying; dating the Take from the allocation's
addition; commission wording across cards, roster, code, and the UX North
Star; and consolidation of the roster, attribution, avatar, and boundary
tests. Correction plan:
[125-roster-evidence-correction](../slice-plans/125-roster-evidence-correction/PLAN.md).

## Ordering and When to Surface

The correction is queued first because it fixes defects in the shipped roster.
Planning does not authorize execution.

## Breadcrumbs

- Maintainer request on 2026-09-27: clicking an agent avatar should open a
  client-project overview of all agent thumbnails and commissions, with task,
  human developer, IDE/host tool, model, a Back button, and human name/avatar
  on the current dashboard; obtain and cache a GitHub avatar.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps workflow facts in authoritative repository records and dashboard views
  derived from published evidence.
