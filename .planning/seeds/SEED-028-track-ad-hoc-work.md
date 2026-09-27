---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

<a id="one-shot-entry-coherence"></a>

### 3. Make one-shot read the same from every entry workflow

**Identity:** SEED-028#one-shot-entry-coherence
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/130-one-shot-entry-coherence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5955c8781d093c16410685f904764b9b08b3d5dd54e11674b78c5b5d769526e5","plan":"09963ca6d98c795f34af996e05a8f8186ec1ad4bd005963d55328a6de9cc4be4"}}
```

**Goal:** An agent that selects one-shot from bug fixing or test optimization
gets one consistent path: its repair or no-change conclusion finishes through
one-shot delivery and retirement, and a growing attempt becomes visible
tracked work even when continuation is limited, while escalation survives a
trunk push that lands during it.

**Scope:** Correction of one-shot work (story recoverable at
`89836961:.planning/seeds/SEED-028-track-ad-hoc-work.md`) from its execution
retrospective (commits `d0101737`, `6f350f28`, `70f6cde1`). Adapt the
bug-fixing repair and no-change steps and the test-optimization no-change step
for one-shot; under `--no-replan` a growing one-shot attempt escalates through
admission and stops before planning instead of leaving evidence in an
unclaimed workspace. Replace the stale "no claim uses verified current HEAD"
rules with the one-shot start's fetched-trunk base. Make carried escalation use
one fetched trunk for park, reset and workspace selection. Excludes native
acceptance evidence and consolidating backlog-holder readers across skills.

**Plan:** [Make one-shot read the same from every entry workflow](../slice-plans/130-one-shot-entry-coherence/PLAN.md).

<a id="native-one-shot-acceptance"></a>

### 4. Accept one-shot natively on Claude Code, Codex and Cursor

**Identity:** SEED-028#native-one-shot-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** An agent on each supported host that is asked for explicit one-shot
work publishes only its verified result, completes a queued story in one
commit, and escalates a growing attempt through admission without losing edits.

**Why:** [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires native behavior evidence before release; the one-shot guidance has
mechanical proof only. Its planned native cases were never added.

**Cases** (named in plan 112, recoverable at
`36e62435:.planning/slice-plans/112-one-shot-work/PLAN.md`), as manual cases in
`tests/git-publication-native.sh`: `publication/one-shot-result` (explicit flag,
only the result on trunk, workspace retired; ordinary contextual work still
admits), `publication/one-shot-queued` (result and cleanup in one commit, no
intermediate Taken), `publication/one-shot-escalation` (admission before further
edits, restored edits, continuation without an unnecessary approval stop; and
from bug fixing under `--no-replan`, a stop before planning with the edits
restored in the Taken story's workspace).

**Constraints:** Paid native runs are manually triggered only, once per case
per guidance version, after [entry coherence](#one-shot-entry-coherence) lands.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Existing test optimization continuation](SEED-004-extract-and-adopt-project-guidance.md#continue-test-optimization-plans).
