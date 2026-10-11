---
id: SEED-123
status: active
planted: 2026-10-11
planted_during: Authorized launch recovery bug repair
trigger_when: A refinement announcement stops before publication
scope: bounded
---

# SEED-123: Recover an unpublished preparation start

<a id="unpublished-preparation-recovery"></a>

### A refinement launch recovers an interrupted unpublished preparation

**Identity:** SEED-123#unpublished-preparation-recovery
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** A developer can retry refinement after an announcement stops before
publication, using the same workspace, without inventing or releasing another
workspace's assignment.

**Scope:** Repair the retained preparation start and its diagnostic. Preserve
exact allocation verification for published or ambiguous ownership. Reproduce
the failure through the real launch boundary and verify retry and ownership
safeguards. This is the bounded planless repair authorized by the bug-fixing
workflow; it does not execute SEED-088#resolved-integration-survives-reruns.

**Evidence:** That story's saved refinement start has no established receipt;
its workspace has only a staged preparation profile, no announcement commit
or preparation-assignment ref, and no published assignment for the story.
The retry invokes `continue` and refuses; its diagnostic nevertheless says
that a published assignment was kept.

**Expected:** A verified unpublished attempt can recover; a published or
uncertain allocation cannot be duplicated, reassigned, or silently released.

**Uncertainty:** The first announcement's precise failure is not retained.
Recovery must distinguish a prepublication failure from a lost published
result rather than infer nonpublication merely from a missing receipt.
