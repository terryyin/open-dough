# Consumer tracing: discovery, acceptance and cost

Exploratory assessment for Terry Yin, 29 October 2026, under
[ADR 0010](../adrs/0010-definition-of-improvement-accepted.md).
Finding owner: [ODF-150](findings/ODF-150.md).

Latest result (2026-10-29): [The timed v2 replay rejected this compact candidate](consumer-tracing-trial-v2.md); current practice is retained, with zero prospective cases and no seven-day exposure.

## Decision

Keep the lexical discovery tool and effect-to-consumer reasoning. Change the
acceptance practice: a completed-looking match table must not substitute for
following a relevant responsibility to its observing proof. Trial a simpler
evidence handoff before changing the published mechanism. This assessment
implements no guidance or tool change and does not resolve ODF-150.

A replacement import-graph engine, removal of tracing, or universal full-suite
testing is not supported by these cases. Existing guidance already requires
complete searches, traversal beyond helper matches, purpose-based proof and
justified exclusions. More restatement alone is not the selected response.

## Basis and limits

The beneficiary is the developer avoiding missed effects and later repair.
The desired gain is better proof choice at worthwhile total cost. Compare the
actual discovery, proof and acceptance sequence with the simpler action the
evidence made available at the time. Distinguish a new discovery from confirmation
of already-known callers, and successful product repair from tracing quality.

The sample is purposive: two executions already known to have misses and one
successful product repair. It has no population denominator, matched untreated
control or measured marginal human/agent cost. This is retrospective and
exploratory; it cannot establish an effectiveness rate or general cost saving.
No new application tests, native sessions or counterfactual replays were run.

## Pygardon plan 411: useful discovery with incomplete follow-through

**Work:** SEED-144#story-live-portfolio-limit-enforcement. Slice 4 used installed
0.3.69; slice 11 used 0.3.71 after a trunk merge. The consumer-trace and term-
derivation script blobs are unchanged between those checkpoints. One execution
has several effects; do not count them as independent trials.

At `2b50430e5182698baccaeba2c43103d24f211876`, fake gateway cancellation began
retaining a row with status `Cancelled`. The initial proof population searched
test files for direct imports of `fake_ibkr_gateway` or `FakeIbkrGateway`:
53 files. The broker-flat test used the fake indirectly through a support module.

Actual implementer history establishes two script invocations. The first used
base `94f06bcc4fc690b644149f21a86187fb6af42e48` and effect terms including
`live_orders`, `Cancelled` and `refresh_managed_broker_orders`, but piped the
output through `head -150`. Its derived `fake_ibkr_gateway` term matched 58
files and was marked too broad. The second invocation omitted `--base`, supplied
narrower terms, and reduced output to file/term columns. It neither resupplied
the fake-contract term nor followed the support helper's consumers.

The hand-back credits tracing with finding orders and protective-stop-adoption
suites outside the import population: four passing cases, including a new
adoption regression. That is evidence of useful discovery, even though the
overall trace remained incomplete.

Acceptance preceded CI attempt `8d21641c`, which found the broker-flat assertion
still expecting the cancelled row to disappear. Repair
`9c7d0dc6856474a9869905ffdd964ed9d4c9d028` changes that assertion to require a
retained `Cancelled` row. This is an avoidable test-compatibility repair, not an
observed escaped product defect. Its containing slice also changed other behavior;
the repair commit's entire footprint is not the cost of this miss.

Slice 11 separately removed a response field. Its refactor search filtered out
`search_run` before `head -60`; another supplied-term-only script invocation
omitted the removed key `history`. The later hand-back blamed truncation, but
the actual command also demonstrates an exclusion. The coordinator's broader
proof found two `KeyError: 'history'` failures before delivery and returned them
for correction. `faddf41ffdd7b95e5f33f092f5bb8c955579d568` repairs those consumers.

**Classification:** discovery supplied useful leads, but narrowed searches,
unexpanded indirect consumers and acceptance of incomplete coverage caused
misses. Script failure under conforming use is not established.

**Recovery:** Pygardon
`753eec2e7:.planning/slice-plans/411-live-capacity-envelope/PLAN.md:330-360,393-401,621-660`;
`2b50430:tests/auto_trading_sync_support.py:17-46`;
`2b50430:tests/test_auto_trading_sync_broker_flat_api.py:169-181`;
the repair commits above. Direct Claude session
`0f12cf9a-952c-4056-9808-b2af147487c9`: implementer
`agent-a9ff4929d7cbfd6cc.jsonl:590-603,643`, coordinator `:1165,4613-4673`,
refactor `agent-a4e67657f829b2fda.jsonl:68,472`.

## Pygardon plan 430: a discovered owner did not reach its tests

**Work:** SEED-145#story-entry-round-reconciliation, installed 0.3.72.
`842118e63efa9890655f8b01fa7ddb5f7c4c672e` imports the entry-round follow-up wake
from `service_lifecycle.py`; that wake imports the later trading-cycle graph.

The slice 4 implementer ran the script three times against base
`658b5c281ee644292fb8b84be8d015ec903f4`, with change-derived lifecycle, app,
shutdown, current-round and loop/window terms. Full output went to `/tmp/ct.md`;
its presentations were filtered. Crucially, it listed
`deployment/qualification_source.py` through app/module-path matches before
publication. The test `test_qualification_source.py` was not directly listed.

The implementer selected 217 test files by lifecycle/startup filename terms,
omitting the qualification test, and supplied no disposition for that discovered
source owner. The refactor used a narrower three-path trace, reported
"Production: none found" and claimed no consumers remained uncovered. Its
later broad selection passed 958 tests; that did not prove startup-scope coverage.

At `c33ab2e9e7e4ed8fc706b47a44131aacb5bdb1bc`, owned CI attempt
`4d85fdb3-956c-4227-8a2c-981c48134a0c` failed
`test_real_startup_scope_covers_bootstrap_dependencies_not_request_calculations`.
The discovered owner walks Python imports from startup scope until dispatch
boundaries. Its observer requires bootstrap dependencies and excludes later
request calculations. Repair `51da834f8526b9513892f1604c65dcac05cac7a4` adds the
wake module to those boundaries: three production lines plus retained plan proof.

**Classification:** an already-discovered responsibility was not followed through
its public operation to its tests. This case does not demonstrate that lexical
search could not expose the relevant owner or that a general graph engine is needed.

**Recovery:** Pygardon `c33ab2e:deployment/qualification_source.py:7-89`,
`c33ab2e:deployment/qualification_inputs.py:108-125`,
`c33ab2e:tests/test_qualification_source.py:8-24`,
`51da834f:.planning/slice-plans/430-entry-round-follow-up/PLAN.md:407-417`.
Direct Claude session `3dd0820a-19dc-4209-8caf-7e6cddf23717`: implementer
`agent-a97f569bcde91c93e.jsonl:697,740,772-783`, especially discovery at `:774`;
coordinator `:1283,1434`; refactor `agent-a8d58d27ee9972189.jsonl:255,266`.

## Open Dough publication repair: successful repair, weak tracing evidence

**Work:** SEED-168#story-branch-publication-with-first-landing. Source and contract
are recoverable at `d0b5f9bfd373d400187b6d3393371a50a4ec7ce9`; implementation is
`0236e739a4075a0e4dd05a906948a2e4ec561ea1`.

Before implementation, the investigator had identified the resolver, all three
callers and a seven-file minimum proof selection. The implementer changed those
four production modules and launched that selection plus the new regression
before the first trace. Tests reproduced the actual mismatch for both trunk names,
then proved intermediate publication, retained expectations and final capture.

The first trace used the claim as `--base` and supplied
`resolvePublicationLandingContext`, `landingContext` and `targetRef`. The retained
initial artifact is Markdown despite its `.json` suffix: 52,765 bytes, 326 lines,
235 candidate rows (82 production, 75 tests, 55 support, 23 guidance). It includes
installed copies, historical transcripts, timing data and incidental string matches.

Later invocations used `resolvePublicationLandingContext` and
`execution-increment-publication`, including resupply of a too-broad import term.
The final report claimed 121 dispositions. Supplied terms and changed test hunks
changed between the initial and final traces; a row-by-row reconciliation of
235 candidates to 121 is unrecovered. The original implementer, reviewing its
retained tool history for this assessment, reports filling the final dispositions
with a Python path/category classifier, with
blanket exclusions for installed copies, guidance, dashboard paths and fixtures.
It does not establish individual inspection of every matched dependency.

Proof broadened to 44 publication/managed-delivery test files, all passing. The
contemporaneous reason was verification of the resolver's consumers; no specific
trace match is recorded as causing that expansion or a new consumer discovery.
The coordinator inspected core callers and observing assertions, and an independent
refactor returned no changes. Neither supplied row-by-row validation of all 121.

**Classification:** the product repair succeeded with real Git/HTTP regressions
and branch/main CI. Incremental discovery benefit from tracing is unestablished;
automatic completion of dispositions did not establish the claimed semantic review.
Absence of an attributed discovery is not proof of zero confirmation benefit.

**Recovery:** Codex chat `01a1859e-d3e3-7c23-8604-f8c32d3210d7`, native record
`~/.codex/sessions/2026/10/29/rollout-2026-10-29T11-05-41-01a1859e-d3e3-7c23-8604-f8c32d3210d7.jsonl`:
`:307` investigator return (03:15:58 UTC, all three callers and minimum proof),
`:361,404,430` implementation messages (reproduction, broad proof and 121 labels),
`:459` refactor return; retrospective implementer account `:987,997`
(05:20:42/05:21:09 UTC, commands, generated labels and timing limits).
`0236e739:src/skills/dough-execute-plan/scripts/` retains publication tests and
resolver/callers. Initial temporary artifact: `/tmp/story-publication-consumer-trace.json`;
its SHA-256 is
`dd3cb4308da4c1f58a76eecd29b67a60a7ef982c4479bf108411fa07ad387a52`.
Clock observations put the first trace by 03:18:28 UTC and completed labels by
03:22:01 UTC; they do not measure active tracing effort. The initial artifact
survived the prior temporary-file cleanup and was inspected for this assessment.

## Cost and confidence

Plan 411's first two trace calls took approximately 2.45 and 1.18 seconds from
tool timestamps, excluding interpretation, dispositions and extra tests. Plan 430
has one extra CI repair increment and focused proof; its 117-second broad run
and reported 15-minute refactor do not isolate tracing. Its separate 32-hour
busy-spin belongs to ODF-369 and must not be charged to tracing.

No case supplies marginal human effort, tokens, money or a comparable untreated
cost. Do not attribute all 44 publication test files to the script. Confidence is
high in these observed sequence failures, moderate in the proposed simpler
handoff, and low in any general net-benefit claim.

## Bounded next response and observation

Trial one compact handoff: changed observable effect → relevant production or
support responsibility → reached observer/test and its assertion → run/reused
proof or explicit unresolved coverage. Preserve the complete candidate search
for inspection; compact known copies/history/noise with an evidenced group reason.
Do not use truncation, narrower replacement populations, filename-only proof
selection or generated path labels to claim complete coverage. The receiving
reviewer follows the relevant owners and exclusions before accepting the claim.

This is a simplification hypothesis, not permission to bypass current tracing
requirements. A later implementation selection must reconcile its recording
contract with this proposal; this investigation changes neither runtime nor policy.
Use already-available sufficient proof and reuse inspected unchanged boundaries.

For the next ordinary shared-contract changes, record new owners/proof decisions
actually added by tracing, relevant leads dropped or left unresolved at acceptance,
later misses/rework, and added interpretation/review effort. Predeclare the smallest
worthwhile gain and acceptable overhead before that trial. Judge whether the
handoff helps; retain, revise or abandon the trial from those outcomes. Keep the
existing ODF-150 occurrences and watch status unchanged by this assessment.
