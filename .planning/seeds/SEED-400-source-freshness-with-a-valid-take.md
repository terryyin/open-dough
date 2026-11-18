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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/696-keep-freshness-with-a-valid-take/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e51ce3c334908140591a24e991c4a1f2ad41c917acbedeb871cbae02d1f81eea","plan":"f1e591cc8e17507606beec9d5d42f020e7c38938184eb79f31638519acd96270"}}
```

**Goal:** A developer or coordinator finishing Taken Story Branch work can
continue through the normal source-freshness check when the authorized target
and branch share several best common bases and only some of them hold the
accepted Take. Today the check takes the single `git merge-base` answer as the
Take and refuses a valid execution `not-taken-at-base` before comparing its
source.

**Scope:**

- The check considers every best common base of fetched trunk and the branch
  (`git merge-base --all`) and compares from one at which the story is Taken.
  The Take is itself a common ancestor, so a valid claim always leaves such a
  base. The report names it as `base`.
- With one best common base, behavior and output stay as they are.
- Refusals stay: `not-taken` when fetched trunk lacks the Taken entry,
  `not-taken-at-base` when no best common base holds it, naming every base it
  examined, and `no-common-base`.
- When several bases hold the Take and their text of a compared record
  differs, the check refuses and names them, because the comparison then has
  no single starting text and choosing one can hide an amendment. Integrating
  fetched trunk into the branch leaves one base. Neither retained graph shows
  this shape.
- Comparison, `from` selection, absorb, exit codes, and inputs are unchanged.
  The check still commits and pushes nothing.
- The script header and the
  [source freshness](../../Distribution/src/skills/dough-execute-plan/references/source-freshness.md)
  reference describe the base as chosen here.

Deferred: matching the claim's `Claim-Publisher` to the running execution. The
check has never read the publisher, so a story released and Taken again by
another execution is told apart no better and no worse than today.

**Key examples:**

- Sibling import (Open Dough, plan 554): the branch `50f4f4f1e` and trunk
  `1c784a6d6` share `db8ca9099`, a sibling commit forked before the Take, and
  the Take `8554eb19e`. The check compares from `8554eb19e` and reports
  `unchanged` for story and plan.
- Contributor merge (Lizard, `SEED-058#process-pr-569`): branch `03695185`
  and trunk `60b2fb59` share the contributor head `91603058`, which holds no
  backlog claim, and `e12c55f8`, which holds it. The check compares from
  `e12c55f8` and reports `unchanged`.
- Genuine amendment: on the sibling-import graph, trunk then adds a promise
  to the story section. The check reports `amended` for the story with its
  `change`, and `absorb` writes it.
- Missing claim: a branch whose every best common base predates the Take,
  such as one at `db8ca9099`, is refused `not-taken-at-base`.
- Disagreeing bases: two best common bases both hold the Take and trunk
  amended the plan between them. The check refuses, naming both.

**Baseline (2026-11-18):** replayed with fetched trunk and branch pushed from
each retained graph into a scratch remote and clone. The current check refuses
both graphs `not-taken-at-base` at `db8ca9099` and `91603058`. A scratch change
choosing the Taken base gave the first four results above. On a constructed
disagreeing-bases graph the same scratch change took the base that already
held the amendment and reported `unchanged` while the branch copy lacked it,
which is why that shape is refused.

**Alternatives considered:** anchoring on the claim commit and its trailers
needs a publisher input at all three call sites, and the existing
`claimProvenance` walks first-parent history, which on trunk `1c784a6d6` does
not contain the Take. Keeping the single base and refusing with advice to
integrate trunk leaves the developer outside the normal check and costs a
merge per occurrence.

**Evaluation:** Replay the retained two-base graphs from [ODF-482](../../docs/maintainer/findings/ODF-482.md).
A valid claim with unchanged source proceeds, a genuine target amendment
still receives the ordinary freshness disposition, and a missing or
ambiguous claim still produces a refusal. Record the actual response and
first containing release at ODF-482.
