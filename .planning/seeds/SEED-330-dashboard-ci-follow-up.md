---
id: SEED-330
status: active
planted: 2026-11-12
scope: story
---

# Dashboard CI follow-up

<a id="make-ci-follow-up-automatic"></a>

### Run dashboard CI follow-up by default for GitHub Actions projects

**Identity:** SEED-330#make-ci-follow-up-automatic
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer gets the existing automatic slowdown check for new qualifying
GitHub Actions landings in every project on the production dashboard, with
zero setup and regardless of the project's former setting.

#### Scope

- Remove the **Enable automatic CI follow-up on this machine** control and its
  Settings UI, server write path, opt-in and opt-out logic, and stored setting
  and machine designation. Remove the obsolete configuration and its records
  completely, including from existing local state, with no compatibility flag,
  archive, or history of former settings. Update current product guidance.
- Keep automatic follow-up in the production dashboard's background collector.
  A newly recorded, qualifying GitHub Actions landing gets the existing one
  full rerun on the same revision, with the same timing rule and result review.
  Keep the request deduplication and the evidence for actual reruns. Start with
  new landing receipts and avoid replaying earlier landings on upgrade.
- Delete tests and fixtures dedicated to the retired setting. In mixed tests,
  remove the setting steps and assertions and keep the coverage of the rerun
  behavior itself. Add no negative or absence tests for the removed setting.
  Reconcile the scope with the active CI repeat test work so the removed
  setting coverage is retired there too.

The dashboard owns the local operation and presents the result without changing
the published story's state. [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

<a id="invoke-custom-ci-rebuilds"></a>

### Run dashboard CI follow-up through a custom CI rebuild trigger

**Identity:** SEED-330#invoke-custom-ci-rebuilds
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer whose project uses custom CI can get the same automatic follow-up
and timing comparison when the project supplies a compatible rebuild trigger.

#### Scope

- Define the project-owned entry point and request/result contract for the
  dashboard to ask custom CI to repeat the original full check. Identify the
  original attempt and landed revision, distinguish accepted, refused, and
  uncertain requests, and give the dashboard enough identity and evidence to
  observe the exact new attempt and verify a comparable full repeat.
- Invoke the configured entry point from the production dashboard's existing
  follow-up flow. Apply the same timing rule, one-request allowance, and result
  review. A custom provider without a trigger continues to supply its existing
  CI readings. GitHub Actions continues through its built-in trigger.
- Use Pygardon as the first integration. Agree the contract with its CI server
  story and verify that a qualifying successful landing can produce a fresh
  full attempt on the same revision and a reviewable timing result.

Keep the entry point in the existing project-owned configuration location
defined by [ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md).
The dashboard owns follow-up and the provider owns the build outcome under
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Pygardon provides the server behavior and its entry point in
[SEED-20261107](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261107-dashboard-ci-rebuilds.md#provide-dashboard-ci-rebuilds).
