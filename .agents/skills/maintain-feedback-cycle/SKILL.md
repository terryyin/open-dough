---
name: maintain-feedback-cycle
description: >-
  Runs project-local findings maintenance across the maintained project set before
  shared Open Dough feedback collection, priority selection and publication of
  every resulting repository change. Use on explicit invocation to run a combined
  project and shared feedback cycle; reading or authoring the skill does not run
  maintenance. Does not implement selected improvements.
---

# Maintain project and shared feedback in one cycle

You are the Open Dough maintainer. This internal skill composes two maintained
owners: [project findings](../../../src/skills/dough-triage-project-findings/SKILL.md)
and [shared feedback](../collect-client-feedback/SKILL.md). Follow
[maintainer guidance](../../../AGENTS.md) when changing or reviewing it. Keep this
source outside the installer payload; the Claude entry is a discovery pointer.

An explicit invocation authorizes both named maintenance phases and their
ordinary commit, integration and synchronization outcomes for the selected project
set, including Open Dough. Pass that originating instruction to each phase;
no repeated maintenance or publication prompt is needed. Carry narrower current
instructions. Reading or editing this skill grants no maintenance authority.
Do not implement responses, change direction, release/install guidance, schedule
future cycles or change dashboard configuration.

## Establish the cycle and project set

Read shared feedback's [maintained-set and destination discovery](../collect-client-feedback/SKILL.md#resolve-the-maintained-set-and-destinations)
without starting collection. Use its production discovery convention or the
explicitly supplied isolated inventory, include Open Dough once, and resolve its
canonical catalog, finding owners, watch list, direction, seeds and backlog.
Keep its inventory recheck boundaries. Resolve each project's actual root,
canonical local findings and shared log, authorized origin target, instructions,
delivery conventions and initial Git state through the phase owners.

Use the maintained Open Dough source for the two phase contracts. Establish the
selected project as the local phase's project explicitly; its source directory is
not that project. Resolve command placeholders and installed helper dependencies
in that project's installed runtime, according to its guidance (for example,
`.agents/skills/` or `.claude/skills/`). Check the needed backlog and publication
helpers against the maintained contract before dependent writes. A missing or
incompatible helper is that project's affected-phase gap; do not silently use
another repository's runtime, install guidance or require a new release.

Keep the concise run context outside a workspace a child may retire. Carry actual
record locations, saved changes and delivery facts in this context and the real
records/Git history; create no permanent cycle ledger or second finding store.
Retain supplied dashboard reporting context here. The combined owner performs its
one final reporting operation; child maintenance/landing returns defer it.

## Complete the local phase before shared collection

For every selected project, including Open Dough, invoke the maintained
[project-findings skill](../../../src/skills/dough-triage-project-findings/SKILL.md)
with:

- the originating instruction naming this combined cycle and its local phase;
- the selected project root, canonical records and story/backlog conventions,
  actual evidence locations, authorized origin/branch and originating checkout;
- its owned maintenance workspace, branch and starting revision when retained,
  plus saved record changes and accepted or unfinished publication facts; and
- deferred combined reporting, when reporting context was supplied.

That owner decides responsibility, lifecycle, local selection and delivery using
its own rules. Return a local result or explicit gap for each project before
entering shared collection. Preserve local stories and reciprocal links. A failed
or unavailable local pass does not establish that its remaining log is entirely
shared, and cannot supply successful coverage or a passed watch. Retain uncertain
facets and stop only dependent decisions; independent supported work continues.
For consequential attribution, intent or delivery conflicts, follow the owning
skill's stop with evidence and the specific human decision needed.

For each local return, retain canonical and actual saved record paths, ownership
assessment limits, workspace disposition, authorized target, accepted SHA or
retained candidate/base and exact unfinished boundary. Keep publication acceptance
separate from default-checkout refresh and retirement. Do not use a stale default
checkout or a retired path as the next phase's input: resolve the accepted target
through the owner's safe checkout procedure, or carry the retained unfinished
candidate and its saved records explicitly. An unfinished local publication is
still unfinished after shared work succeeds.

## Collect shared feedback from the resulting records

Invoke [collect-client-feedback](../collect-client-feedback/SKILL.md) with the
same originating instruction and shared-phase authority, resolved inventory and
Open Dough destinations, every local result/gap, actual post-local record
locations, owned workspace state and all accepted/unfinished delivery facts.
It owns reconciliation, adoption, retention/watch judgments, supported shared
priorities and cross-repository delivery. Do not copy its ranking or finding rules.

At its discovery recheck, route an added project through the local phase or name
its local gap before consuming its shared evidence. Resolve changed targets before
dependent writes; retain pending delivery for removed or retargeted projects.
The shared owner may place its supported responses first in Open Dough's queue.
Preserve local stories, Taken work and unselected relative order under that rule.

The shared phase can edit a repository already published by the local phase.
Deliver and verify those later edits too, including Open Dough's final records.
Pass the maintained landing source the owned result and retained base/candidate
facts, resolving commands in the target's installed runtime. Reuse the phase
owner's delivery and Dough Land; do not reproduce its Git algorithm. An accepted
first-phase SHA does not establish acceptance of later shared edits.

## Report the settled result

Inspect actual saved records and authorized remote ancestry. Report local and
shared outcomes per project, coverage and consequential limits, local and shared
queue changes, and each changed repository's final accepted SHA/target or exact
unfinished publication boundary. Preserve accepted results and retained candidates
on partial failure. Claim a complete cycle only after both phases and every
required publication are accepted; refresh may remain separately deferred.

On rerun, read this retained context and real records/Git facts and resume the
first unfinished boundary through its owner. Reuse accepted work and existing
findings/stories; unchanged input needs no empty commit or repeated publication.
After all required operations and final wording settle, apply Dough Land's
[completion attention and dashboard reporting](../../../src/skills/dough-land/SKILL.md#completion-attention)
once for the combined result, with supplied reporting context. Child completion
does not report completion of this cycle.
