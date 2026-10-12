# Slice 1 implementation observations (2026-10-12)

The revised shared rule starts with the changed effect, follows enclosing
observations or entry-point scenarios and inspects setup and purpose before
selecting proof. Delegation carries that trace in its existing return;
acceptance checks it and obtains missing affected proof or returns the slice.
This is a representative guidance walkthrough over recovered source and
retained results, not fresh native-agent or old-product runtime execution.

- **Actual baseline:** `git show v0.3.57:src/skills/dough-story-refinement/references/executable-proof.md`
  and that tag's delegation/acceptance instructions already name whole-page
  specs, changed defaults, stand-ins, proportional suites and refusal for known
  unrun consumers. The observed 42/51-spec and three-file selections below
  nevertheless missed effects. The revision adds the discovery operation and
  carries its evidence into acceptance; it does not invent a weaker baseline.
- **Aggregate output:** Begin with
  `git show 426c42fb -- dashboard/src/SessionSidebar.tsx`: the section moves
  after the session list inside an `aside` that can be hidden. Search the
  enclosing page's observation mechanisms with
  `git grep -n -E 'locator\("body"\)|getByRole\("document"\)' 426c42fb -- dashboard/tests`.
  This finds `published-work.spec.ts:172` without naming that spec or a sidebar
  selector. Inspection at `426c42fb:dashboard/tests/published-work.spec.ts`
  shows `membership makes no live or completion claim`: body `textContent`
  minus Recently done is matched against `claimsBeyondMembership`'s word
  boundaries, including `running`. `publishedOrigin.ts:publishOrigin` supplies
  only Git ref/backlog answers; `dashboardTest.ts` uses the built real page,
  which renders the sidebar and membership text. ODF-150 and plan 279 at
  `92bd830f72096b558eca7870dc553b8ef14be951` retain CI `38010086816`'s failure
  after 42 then 51 selected specs passed. Decision: focused sidebar passes
  cannot accept the slice; include the aggregate observation and reconcile its
  legitimate membership purpose with local-session text. `git show f64da99b -- dashboard/tests/published-work.spec.ts`
  records the historical scope repair, not new authority to weaken a promise.
- **Operation preconditions:** Recover the changed effects with
  `gh api repos/terryyin/pygardon/commits/8980468563 --jq '.files[] | select(.filename | contains("exit_settings.py")) | {filename,patch}'`
  and its `live_strategy_daily_source.py` patch. The prior read followed
  `evaluated_dataset_id`; the new `storage.connect(..., read_only=True)` runs
  before resolving every holding. Read-only archive recovery via
  `gh api repos/terryyin/pygardon/tarball/a0f2b270b` into owned temporary files
  allows `rg -n 'compute_auto_trading_exit_settings|exit-settings' pygardon_service`
  to find the HTTP entry point and
  `rg -l 'EXIT_SETTINGS_PATH|exit_settings|auto_trading_holding_live_strategy_http_support' tests`
  to find scenario and support candidates without supplied missing test names.
  Its 28 broad matches include unrelated adhoc paths/support; this is not the
  historical repair's 27-file selection and no count establishes coverage.
  Inspecting the reached source finds
  `tests/live_strategies/test_orphan_live_strategy_refs.py:20` (HTTP 200 with
  the missing-reference error row) and
  `tests/test_auto_trading_exit_settings_named_genome_api.py:36` (direct compute,
  named-genome error, no active stop/instructions). Both setups provision only
  catalog and operations. `pygardon/plane_provisioning.py:_PLANES` confirms
  warehouse owns `data_sources.duckdb`; these scenarios do not supply it.
  ODF-150 retains both CI failures (`FileNotFoundError`, `edd470c2` on
  `a0f2b270b`); `7633dacb1` retains conditional single-read repair and 81 passing
  tests. Decision: three named green files or setup adding the store cannot
  accept the no-store purposes. No Pygardon checkout was touched or test rerun.
- **Control and incomplete return:** The unchanged fixture's
  `lib/statusBadge.mjs:badgeLabel` consumes only its argument, neither the page
  nor storage operation; `tests/status-badge.test.mjs:badge labels status`
  retains the matching three-scenario proof recorded above. Reuse it without a
  new run. In a constructed return with green named proof and a discovered
  no-store caller left for CI, acceptance requires its missing observation or
  returns dependent work; independently valid observations remain accepted.
  Equivalent-purpose evidence may suffice, while missing-reference and
  named-genome semantics require their respective observations. Reassess the
  control if a later effect reaches it; preserve the focused-time suite rule.
- **Costs and limits:** Additional work inspected enclosing body observations,
  the endpoint route, both no-store setups and plane ownership beyond the
  changed names. The successful archive-recovery/search/source-inspection
  command measured 1.554 seconds; an earlier 1.713-second retrieval found the
  endpoint but a guessed filename query exited 2 and supplied no setup proof.
  All owned temporary files were removed. Human reading time was not timed.
  The fixture support and native runner remain unchanged, so the existing
  deterministic fixture results are reused solely for their narrower contract.
  No fresh native behavior is claimed; outstanding acceptance is retained in
  [SEED-132#accept-indirect-consumer-proof-natively](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#accept-indirect-consumer-proof-natively)
  before affected release under ADR 0005. ODF-150's failed watch stays failed.

AGENTS.md behavior review: invocation covers changed observable effects and
proof selection; required context is the established project's change, surface,
caller setup and actual purposes, with unresolved purpose stopped for human
judgment. The examples above reach the intended acceptance decisions rather
than merely producing a consumer list. Runtime prose stays shared and project
addressed; historical product names and evaluation stay in maintainer records.

Focused structural proof: `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh`
passed, terminal exit 0, 3.235 seconds observed command wall time. This checks
runtime reference-link availability; it does not prove native skill judgment.
`git diff --check` passed with no whitespace errors. No support fixture,
runtime wrapper, host adapter, acceptance schema or executable contract changed.
