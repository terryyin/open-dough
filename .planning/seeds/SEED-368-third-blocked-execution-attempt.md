---
id: SEED-368
status: active
planted: 2026-11-15
planted_during: Terry closed the second blocked-execution attempt and requested its successor
trigger_when: selected from the product backlog
scope: story
---

# SEED-368 — Reduce model work during prolonged supplier waiting (third try)

<a id="report-a-publication-made-during-supplier-judgment"></a>

### Report a publication made while the supplier is being judged

**Identity:** SEED-368#report-a-publication-made-during-supplier-judgment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/637-report-a-publication-made-during-judgment/PLAN.md"}
```

#### Goal

For a developer whose held execution is watching its paused supplier, a
publication the supplier makes while the coordinator is judging an earlier one
still ends the watch, so a supplier that publishes in a burst is not waited on
in silence until the deadline. This is a bounded correction of the silent
supplier wait found by its execution retrospective.

#### Scope

- After a nonqualifying publication, the continued watch reports every
  publication the coordinator's judgment did not read.
- The watch command's contract, its deadline, the hold, and the stop at the
  deadline keep their delivered behavior.

Plan: [report a publication made during judgment](../slice-plans/637-report-a-publication-made-during-judgment/PLAN.md)
