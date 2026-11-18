---
id: SEED-400
status: active
planted: 2026-11-18
planted_during: Retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# Source freshness with a valid Take

<a id="keep-freshness-with-a-valid-take"></a>

### Keep source-freshness checks usable after a contributor merge

**Identity:** SEED-400#keep-freshness-with-a-valid-take

**Goal:** A developer or coordinator finishing Taken Story Branch work can
continue through the normal source-freshness check when the authorized target
and branch share several best bases and only some of those bases hold the
accepted Take.

**Scope:** Resolve the comparison using attributable Take and source evidence
for that story and target. Preserve refusal for missing or ambiguous ownership
and preserve review of actual story or plan changes. Keep the existing
publication and story-ownership boundaries.

**Evaluation:** Replay the retained two-base graphs from [ODF-482](../../docs/maintainer/findings/ODF-482.md).
A valid claim with unchanged source proceeds, a genuine target amendment
still receives the ordinary freshness disposition, and a missing or
ambiguous claim still produces a refusal. Record the actual response and
first containing release at ODF-482.
