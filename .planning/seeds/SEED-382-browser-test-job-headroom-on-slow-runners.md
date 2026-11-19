---
id: SEED-382
status: active
planted: 2026-11-16
planted_during: Story wrap-up of SEED-380, after a slow CI runner ended the frontend job at its deadline
trigger_when: selected from the product backlog
scope: story
---

# SEED-382 — Browser test job headroom on slow runners

<a id="type-check-reports-after-a-lint-failure"></a>

### Prove the type-check reports after a lint failure

**Identity:** SEED-382#type-check-reports-after-a-lint-failure
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/661-type-check-reports-after-a-lint-failure/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b7567f0963149e3eb91c46bfee804d2a4aad00ef132933cdd6ea6d353bd10a84","plan":"eb509a1f5f83321850e4dda482ecff993b0216a0197d994e445ce39a1d4302ff"}}
```

**Goal:** Contributors keep CI's promise that a lint failure does not hide
the dashboard type-check's own result: a change that makes the `lint` job's
type-check step depend on lint fails a maintained check.

**Scope:** A maintained check holds the `lint` job's type-check step to its
delivered condition: it runs once dependencies are installed and the run is
not cancelled, whatever the lint steps did. Any other condition fails the
check, whether it names a lint step or skips after an earlier failure some
other way. The workflow's behavior and every other check stay as they are.

**Plan:** [Prove the type-check reports after a lint failure](../slice-plans/661-type-check-reports-after-a-lint-failure/PLAN.md)
