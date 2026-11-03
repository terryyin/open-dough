---
id: SEED-227
status: active
planted: 2026-11-04
planted_during: Project findings maintenance for DD-412
trigger_when: An Open Dough contributor plans a long local dashboard test run on macOS
scope: story
---

# SEED-227: Protect long local proof from Maintenance Sleep

## Selected Stories

<a id="protect-long-local-proof-from-maintenance-sleep"></a>

### Protect long local proof from Maintenance Sleep

**Identity:** SEED-227#protect-long-local-proof-from-maintenance-sleep

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** An Open Dough contributor can prepare a long local dashboard proof
run on macOS using a documented sleep guard suited to the machine's power
state. If the machine suspends during the run, the contributor can check the
sleep record before attributing scattered failures to the application.

**Scope.** Put the setup and diagnosis in the maintained local proof
instructions. Preserve normal test verdicts and the repository's failing-test
policy. Keep the case bounded to local macOS proof.

**Evaluation.** Walk the instructions for an AC-powered Mac and check that
they lead to the guard verified in plan 454. Check that they state the power
condition for system-sleep prevention and give a concrete way to check the
sleep log when worker timeouts cluster. Record the delivered instructions
and the next relevant ordinary-use result at
[DD-412](../../docs/maintainer/project-test-findings.md#dd-412).
