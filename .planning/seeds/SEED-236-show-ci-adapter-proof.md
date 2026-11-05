---
id: SEED-236
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to queue the Open Dough supplier for Pygardon CI proof
trigger_when: A developer opens Intent’s CI status tab for a project that uses a CI adapter
scope: story
---

# SEED-236 — Show the CI proof of a CI-adapter attempt

<a id="count-repeated-adapter-attempt-ids"></a>

### Count a repeated adapter attempt ID as ambiguous

**Identity:** SEED-236#count-repeated-adapter-attempt-ids
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/473-count-repeated-adapter-attempt-ids/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b1bda8fb23c3ed41fa68695cef4524f225088e77de591d22ff5b795ee8d28081","plan":"e347e852e5bcc559d15e26f3977a0f9c180a44cbb7aa27fba6edfe6e7b50dbb0"}}
```

**Goal:** A developer opening Intent → CI status for a `ciAdapter` project
whose attempt IDs repeat across runs at one revision sees that the shown
attempt is ambiguous at its revision, with no counts, instead of counts from
a summary that may belong to another run's attempt. This corrects
`SEED-236#show-ci-adapter-proof`, whose ambiguity rule counted only each
check's newest attempt.

**Scope:**

- Required: the ambiguity of the shown adapter attempt counts every attempt
  the adapter's `discover` answered at that revision, before the newest
  attempt per check is kept, so an earlier run's attempt with the same
  `attemptId` and check makes the shown one ambiguous. The adapter is then
  asked no proof.
- Required: the adapter manual and the dashboard development doc state the
  rule as built.
- Preserved: the shown verdict and attempt, the execution observer's and
  CI status judgment's choice of the newest attempt per check, every other
  proof reason, and the GitHub Actions path.

**Plan:** [473-count-repeated-adapter-attempt-ids](../slice-plans/473-count-repeated-adapter-attempt-ids/PLAN.md)
