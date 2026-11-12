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
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-330#invoke-custom-ci-rebuilds","dependencies":[{"supplier":{"identity":"SEED-330#make-ci-follow-up-automatic","href":"seeds/SEED-330-dashboard-ci-follow-up.md#make-ci-follow-up-automatic"},"implementation":"This story adds a custom CI provider to the follow-up flow and generalises that flow as trunk holds it after the supplier lands.","rationale":"This story's examples follow up a custom project with no setting. Before the supplier lands, follow-up needs a per-project setting that refuses custom providers, so work built around it would be discarded.","condition":"Trunk follows up every newly recorded qualifying receipt on the machine that recorded it, with no per-project follow-up setting or machine designation.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/606-invoke-custom-ci-rebuilds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6abcc7966c267877cc3a22bd313e3cbbaeee2a6f86494112df4cb04417d02b93","plan":"c95d95923a65c1f39c462355983950a9198a56bae4c309766727d338a2d9d0c1"}}
```

#### Goal

A developer whose project uses custom CI gets the same automatic slowdown
check on qualifying landings that GitHub Actions projects get, once the project
declares a rebuild trigger. A slow landing is then repeated once on its custom
CI and judged against the same saved reference, with no manual retry.

#### Scope

Required behavior:

- **Trigger declaration.** A project declares its trigger as `ciRebuild`, a
  string array beside `ciAdapter` in its existing `.planning/open-dough.json`
  (the project-owned configuration location of
  [ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md)).
  It is launched like `ciAdapter`: from the project's checkout, without a
  shell, one JSON request on stdin, one JSON value on stdout, diagnostics on
  stderr, and the same 20-second and 64 KiB bounds. `ciRebuild` takes effect
  only together with `ciAdapter`. It may name the same command as `ciAdapter`.
- **Request.** The production dashboard sends
  `{"operation":"rebuild","check":{"repo","branch"},"attempt":{"runId","attemptId","sha"}}`,
  naming the original landed attempt exactly as `discover` listed it. The
  trigger asks its CI for one full check of that revision as a new attempt,
  even when the branch has moved on.
- **Result.** The trigger answers one of:
  - `{"result":"accepted","attempt":{"runId","attemptId","sha"}}`, naming the
    new attempt this request admitted, with the identity `discover` lists it
    under, including while it is queued;
  - `{"result":"refused","reason":"…"}`, when no new attempt was admitted,
    including when the revision already has queued or running work; or
  - `{"result":"uncertain","reason":"…"}`, when admission could not be
    settled.

  A nonzero exit, timeout, oversized output, or an answer outside this shape
  counts as uncertain.
- **Observation.** The dashboard follows the accepted attempt through the
  existing `discover` and `proof` reads. A **full comparable repeat** is that
  exact attempt: a different `attemptId` from the original, the same `sha`,
  the `check` and `context` the original named, a start after the original
  completed, `success`, both time bounds, and proof as complete as the
  original's.
- **Same follow-up.** Qualifying custom landings use the existing 5% rule,
  saved reference, one-request allowance spent before the trigger runs,
  deduplication, Recently done wording, and review route. The review shows each
  attempt's run and attempt identity, check, revision, bounds, wall time, proof
  completeness and provider link when one was listed.
- **Never resent.** A request is sent at most once per landing. A refusal, an
  uncertain answer, or an interruption leaves an unverified explanation and is
  never retried, because a second request could start a duplicate build that
  cannot be told apart from the first.
- **Contract documentation.** Document the trigger contract in a custom CI
  manual beside the existing adapter manual, and update
  `docs/dashboard-ci-follow-up.md` and `dashboard/PROJECT-CONFIGURATION.md`.

Required restrictions:

- Only the production dashboard runs a trigger, as for GitHub Actions:
  unreleased dashboard code must not act on real CI.
- The execution CI observer never runs `ciRebuild`. Triggering stays outside
  the observer's read-only `ciAdapter` contract, whose manual leaves triggering
  and retrying to the project's delivery process.

Boundaries:

- Builds on [follow-up by default](#make-ci-follow-up-automatic): the machine
  that records a landing receipt follows it up, with no setting. That story is
  in execution on the same code; this story executes against trunk as it
  stands then.
- A custom project without `ciRebuild` keeps its existing CI readings and gets
  no repeat. GitHub Actions keeps its built-in trigger.
- Pygardon is the first integration. Its
  [rebuild trigger story](https://github.com/terryyin/pygardon/blob/main/.planning/seeds/SEED-20261107-dashboard-ci-rebuilds.md#provide-dashboard-ci-rebuilds)
  implements this contract, makes its per-commit proof summary complete, and
  demonstrates the trigger end to end through the released dashboard (Terry's
  decision of 2026-11-12). This story proves the contract with a fixture
  provider.
- The provider owns admission, queueing and the build outcome; the dashboard
  owns the follow-up decision and its evidence, under
  [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
- Configurable thresholds, adaptive repeats, historical backfill and
  cross-machine coordination stay deferred.

#### Key examples

1. **Slow custom landing repeats.** A project declares `ciAdapter` and
   `ciRebuild`; a Done receipt lands with an exact successful attempt at 105 s
   against five prior 100 s builds → the dashboard sends one `rebuild` naming
   that attempt, the trigger answers accepted with a new attempt, Recently done
   shows **CI rerun in progress** once `discover` lists it pending, then
   **Possible CI slowdown** when it succeeds at 106 s with complete proof, or
   **CI timing returned to range** at 98 s. The review shows both attempts
   against the saved reference.
2. **Refused.** The trigger answers refused because CI is not admitting work →
   the allowance stays spent, the card shows the refusal and its reason, and no
   second request is ever sent for that landing.
3. **Uncertain.** The trigger times out → the card explains that acceptance is
   uncertain and the request will not be resent; no later attempt is
   attributed to it.
4. **Not a full comparable repeat.** The accepted attempt finishes with partial
   proof, fails, or `discover` lists it with another revision or check → the
   card shows the matching unverified explanation and no slow or in-range
   verdict.
5. **No trigger.** A custom project declares only `ciAdapter` → a qualifying
   landing gets no request, and its CI readings stay as before.

#### Architecture

Generalise the delivered GitHub Actions follow-up into one repeat flow with a
provider seam, under
[the North Star's one CI repeat across providers](../NORTH-STAR.md#one-ci-repeat-across-providers).

#### Refinement observations

Read-only on 2026-11-12 over this machine's `landed-ci-history.json`: every
Pygardon proof summary declares `e2e_test/packaged/features`, which its
per-commit CI never runs, so no Pygardon build has a comparable wall time and
none can qualify. With that entry left out, its 13 exact landings measure
470–516 s against a 499–505 s reference, and none reach the 5% rule.
