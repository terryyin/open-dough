---
id: SEED-901
status: active
planted: 2026-09-10
planted_during: Quick 039 slice-2 walkthrough (fictional)
trigger_when: When a maintainer selects process-finding follow-up for this fixture seed
scope: small
---

# SEED-901: Host follow-up for execution-integrity process findings

## Goal

Give selected process findings about execution integrity and process-log
usability a canonical story home the maintainer can queue.

## Why This Matters

Selected finding responses need an evaluable story without mixing them into
unrelated product seeds.

## Stories

<a id="tighten-occurrence-row-labels"></a>

### 1. Tighten occurrence-row labels in the process log

**Status:** Taken in this fixture; unrelated to wrap-up overwrite.

**For / why:** The Open Dough maintainer can scan occurrence rows and see the
execution identity without reconstructing it from nearby prose.

**Evaluation:** Each occurrence row in the fixture log names an execution
identity on its own line.

**Safe stopping point:** Label wording can remain as-is; this story does not
authorize wrap-up or queue changes.

<a id="keep-occurrence-notes-readable"></a>

### 2. Keep occurrence notes readable in the process log

**Status:** Queued; unrelated sibling.

**For / why:** The Open Dough maintainer can read a human note next to an
occurrence without losing the observed-effect and inference distinction.

**Evaluation:** A later reader can still tell observation from inference after
the note is present.

**Safe stopping point:** Existing notes remain; no wrap-up behavior is
changed.

<a id="document-a-useful-practice-example"></a>

### 3. Document a useful practice example

**Status:** Queued; unrelated sibling.

**For / why:** The Open Dough maintainer can keep a supported useful-practice
example in the process log without turning it into a defect fix.

**Evaluation:** The example remains in the seed as a candidate story, not as
implemented guidance.

**Safe stopping point:** The example can stay unqueued or unexecuted without
affecting wrap-up follow-up.

<a id="prevent-wrap-up-from-overwriting-reviewed-commits"></a>

### 4. Prevent wrap-up from overwriting a reviewed execution commit

**Status:** Queued follow-up; not refined, not planned, not executed.

**For / why:** The Open Dough maintainer can finish wrap-up without losing the
already-reviewed Taken-work patch set, so later review still has the execution
commit to inspect.

**Evaluation:** After wrap-up, the reviewed execution commit remains reachable
from the branch (or an equivalent preserved locator), and Taken-work patches
are not replaced by an unrelated cleanup snapshot.

**Finding:** `ODF-901` in [findings.md](../findings.md) (heading
`## ODF-901 — Wrap-up overwrote the reviewed execution commit`). This story is
queued follow-up, not a claim that the finding is resolved.

**Safe stopping point:** The queued story remains discoverable from the backlog
and the finding; wrap-up behavior is unchanged until a later authorized
execution.
