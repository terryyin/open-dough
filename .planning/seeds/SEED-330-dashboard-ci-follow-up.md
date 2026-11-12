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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/604-make-ci-follow-up-automatic/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1059cdcd7937b7e9dbf852da9acbb596cae111f317bed2b5a0a64196de9d7529","plan":"cff67c582fdcc196c8ceb2899de727d4a267762cc92e60fcf8110410a9c3f9d0"}}
```

#### Goal

A developer gets the existing automatic slowdown check for new qualifying
GitHub Actions landings in every project on the production dashboard, with
zero setup and regardless of the project's former setting. Observing a slow
landing then needs no prior decision to switch the check on, on any project or
machine.

#### Scope

Required behavior:

- **No setting.** Remove the **Enable automatic CI follow-up on this machine**
  control and the whole follow-up part of each **System settings → Projects**
  row: its On/Off state, explanation, production action machine and rule note.
  Remove the server write path, opt-in and opt-out logic, and the stored
  per-project setting and machine designation. The follow-up read keeps
  serving Recently done cards and the retained review route.
- **Authority from the receipt.** The machine that records a landing receipt
  is the one that follows that landing up, through its production dashboard.
  No machine is configured or named for it. Development dashboards still
  request no rerun,
  because unreleased dashboard code must not act on real CI. Projects with a
  custom CI adapter keep their existing CI reading and get no rerun; that
  belongs to [the custom trigger story](#invoke-custom-ci-rebuilds).
- **Same follow-up.** A newly recorded, qualifying GitHub Actions landing gets
  the existing one full rerun on the same revision, with the same 5% rule,
  saved reference, one-request allowance, deduplication, evidence, Recently
  done cards and review route.
- **Upgrade starts with new receipts.** Remove the setting and designation from
  an existing machine's follow-up ledger, with no compatibility flag, archive,
  or history of former settings. Each receipt keeps the admission it was
  recorded with: a receipt recorded while follow-up was off never becomes
  eligible, an admitted receipt not yet requested continues, and a landing with
  no recorded receipt never runs. No historical batch runs.
- **Guidance.** Update `docs/dashboard-ci-follow-up.md` and
  `dashboard/PROJECT-CONFIGURATION.md` to describe follow-up that runs by
  default with no setting.
- **Tests.** Delete tests and fixtures dedicated to the retired setting. In
  mixed tests, remove the setting steps and assertions and keep the coverage of
  the rerun behavior itself. Add no negative or absence tests for the removed
  setting.
- **Reconciliation with the active repeat-check work.**
  [SEED-324](SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load)
  is in Story Branch execution on the same specs and its done slices still hold
  setting coverage (the Settings case, coverage rows C1 and C16, faults F13 and
  F18); its remaining slices touch no setting. This story retires setting
  coverage from those specs as trunk holds them when it executes, including
  SEED-324's reshaped forms once landed. If SEED-324 lands after this story,
  its merge of trunk keeps the removal. Shared files justify no blocking
  dependency.

Scope limits:

- Cross-machine coordination stays out of scope; receipt authority already
  keeps one machine per landing.
- Configurable thresholds, adaptive repeats and historical backfill stay
  deferred, as before.
- Keeping an opt-out with a default of on was considered and is not this
  story: the developer asked for the control's removal.

#### Key examples

1. **Never configured.** A GitHub Actions project has no follow-up setting on
   the production dashboard → a Done receipt lands at 105 s against five 100 s
   prior builds → one full rerun of its run is requested, and Recently done
   shows **CI rerun in progress**, then the slow or returned-to-range result.
   No Settings step happens.
2. **Formerly off.** A project's follow-up was off before the upgrade → a new
   qualifying Done landing after the upgrade gets one rerun; a qualifying
   landing recorded before the upgrade gets none.
3. **Formerly designated elsewhere.** The ledger named another host as the
   project's action machine → after the upgrade, this machine's own new
   qualifying receipts get a rerun.
4. **Settings.** **System settings → Projects** → each row shows the project's
   name, repository, local path, hidden state and Client configuration, and
   nothing about automatic CI follow-up.
5. **Existing ledger.** A ledger holding the three enabled project settings,
   eligible receipts and spent requests → after the upgrade it holds no
   setting or designation, and existing requests remain observable and
   reviewable from their Recently done cards.
6. **Not this dashboard's action, unchanged.** A development dashboard's
   collection meets a qualifying receipt, or a project with a custom CI adapter
   lands a qualifying build → no rerun is requested, through the existing
   collection guards this story leaves as they are.

#### Architecture

Action authority moves from a configured hostname to receipt capture. A
landing is admitted when a dashboard on this machine records its receipt in the
machine's follow-up ledger, and only the production dashboard's collection
spends receipts from that ledger. Another machine never holds that receipt, so it
cannot request a duplicate rerun. Dashboards on one machine already share the
ledger lock. The ledger remains machine-local operational evidence under
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md);
the dashboard owns the local operation and presents the result without
changing the published story's state.

#### Refinement observations

Read-only on 2026-11-12 from this machine's
`~/.open-dough/dashboard/ci-follow-up.json` and `landed-ci-history.json`:

- Follow-up is on for open-dough, doughnut and lizard, all designating this
  host. pygardon (custom CI), terry-talks and clipboard have no setting; the
  last two gain follow-up through this story.
- The ledger holds 851 landing entries, 4 eligible and none requested; the
  eligible ones are pending or matched an equivalent build.
- Across kept history, the 5% rule qualifies 5 of 22 exact open-dough builds
  and none of the 89 exact builds in other projects, so default follow-up adds
  few reruns.

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
