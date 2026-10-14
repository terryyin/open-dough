# Custom CI reuse — slice 3 evidence

Source: [plan 306](PLAN.md), `SEED-008#reuse-ci-validation-at-integration`.
This record retains accepted custom-provider observations and host evidence reuse.

## Implemented boundary and deterministic observations

The installed runnable provider executes actual covered commands, records pending
source facts before execution, and asserts direct success only after successful
exit. The shared gate decides reuse. Target-only commands always execute; their
failure fails the aggregate target. Serialized journal creation order supplies
ordering independently of opaque run/attempt IDs. Target reports retain distinct
target identity and source run/attempt/ref/URL/context/reason. Missing policy uses
ordinary validation. The existing `ciAdapter` protocol remains unchanged.

`ci-reuse-custom-journey.test.mjs` composes the actual Story integration owner
from `.agents` and managed Trunk publication from `.claude`, real local bare
remotes, installed provider/adapter commands, actual child exits and mailbox
completion. Fixtures replace provider acquisition, not publication or verdicts.
The check-command fixture reads the accepted SHA's actual Git content and counts
executions. Worker-only 50 ms polling setup reuses slice 2's established fixture;
assertions wait for real coverage.

| Promise | Observing assertions |
| --- | --- |
| Both publication modes consume the same provider | Accepted receipt equals remote main; Trunk makes no execution-branch push; completion identifies the target's own opaque run/attempt |
| Exact accepted A avoids duplicate covered work | Both `hit` cases observe covered count 1, target-only count 1, reuse true and source provenance in the report |
| Missing/contradictory evidence validates fresh | Both `missing` cases execute accepted A; both `contradictory` cases assert `contradictory-attempts` and covered count 2 |
| Target-only failure prevents completion/retirement | Both `target failure` cases assert failure, retained shutdown, live observer, preserved workspace and branch |
| Policy-free projects retain ordinary CI | Both `legacy` cases assert `invalid-policy`, covered count 2 and successful ordinary completion |
| Conservative provider facts | `ci-reuse-custom-example.test.mjs` observes child-written `pending observed` before deliberate failure; reverse opaque-ID order, exact `context-mismatch`, expiry, unreadable journal, unknown currentness and malformed facts |
| Source validation never certifies target-only work | Same-ref `main` source-only success is absent from actual adapter discovery; source records remain inspectable in reports |
| Real installed use in both physical roots | `execution-payload-update.sh` invokes `assert_installed_ci_reuse` after actual updates: real source/target execution, hit counts, report provenance, configured adapter acquisition, changed-SHA fresh work and policy-free ordinary work |

## Literal proof and results

The following combined changed-consumer command reached terminal exit 0 in the
established execution checkout, Node 24.21.0, Homebrew Bash first on PATH:

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-command-adapter.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter-cli.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter-failures.test.mjs src/skills/dough-execute-plan/scripts/ci-command-adapter-unavailable.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-resource-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-custom-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs tests/execution-payload-update.sh tests/payload-declaration-links.sh tests/install-preserves-open-dough-json.sh tests/install.sh tests/update-refuses-unverifiable.sh tests/update-force-restores-latest.sh tests/update-removes-dropped-files.sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs
```

The second command also reached terminal exit 0 after strengthening context proof
to require `context-mismatch` against a current direct source. Consumer searches
covered the shared check-command fixture, installed-use helper, custom example,
runnable manual markers and runtime/manual links. No identified changed consumer
was left unrun. Existing acquisition/failure/unavailable, mailbox, GitHub mode and
resource journeys, guidance and install/update/refusal/drop checks passed.

## Current target evidence correction

G3 retains the coordinator's return in the plan. An actual observer/completion
journey reproduced false success: green target A followed by failed fresh A
returned the earlier target's success and attempt identity. The reproduction
command below exited 1; after the correction, both subsequent commands exited 0:

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs tests/execution-payload-update.sh tests/payload-declaration-links.sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs
```

`custom pending then failed fresh rerun replaces earlier green target A in actual
completion evidence` waits for actual green coverage, then uses a durable release
handshake to expose pending fresh work. Pending replaces green; released covered
work executes and fails. Completion names the rerun and returns failure/retained
shutdown; observer/workspace/branch stay intact. The original green report remains
inspectable. Installed-use assertions exercise failed current rerun selection in
both roots. Discovery selects the provider's latest aggregate per SHA by explicit
creation order. Shared source eligibility and observer policy are unchanged.

## Test time budget

This read-only baseline command reached terminal exit 0:

```sh
PATH=/opt/homebrew/bin:$PATH bash scripts/ci-test-times.sh tests/execution-payload-update.sh tests/payload-declaration-links.sh tests/install.sh tests/update-refuses-unverifiable.sh tests/update-force-restores-latest.sh tests/update-removes-dropped-files.sh src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-story-journey.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-trunk-journey.test.mjs
```

The last ten successful main runs reported `wide` for every selected existing
job and all three share totals. New reuse journeys have no recent timing;
their accepted branch CI result settles the budget under `tests/time-budget.md`.
No paired local timing is required and no ceiling changed.

## Separate host integration evidence reuse

Under [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):

- Codex retains `.agents` discovery and the yielded native observer stream;
  reuse this execution's retained stream and managed-delivery evidence.
- Cursor retains `.agents` discovery and the adapter/mailbox/host bridge;
  [SEED-007, Current release inputs](../../seeds/SEED-007-cross-tool-validation.md#current-release-inputs)
  records observed ordinary update and subsequent use of the unchanged mechanism.
- Claude Code retains `.claude` layout, hooks and native asynchronous delivery;
  SEED-007 records `f7ab0e4` plan-032 native update/use. The actual custom-provider
  discover/diagnose same-session wake remains recorded in
  [native acceptance](../../../docs/maintainer/ci-background-delivery.md#native-acceptance),
  with detailed plan-299 evidence recoverable at
  `1b635d451bd7260240413182c4dd857f103a31c3`.

New deterministic tests establish provider behavior and actual installation/use
in both physical roots, not new native-host acceptance. Interfaces, hooks and
launch paths are unchanged; no external-provider service acceptance is claimed.

## Representative guidance review

Under [AGENTS.md](../../../AGENTS.md) and ADR 0006: the executing project selects
equivalent checks and pinned inputs or context/validity policy. Exact A reuses
with attribution, changed SHA/context validates fresh, and failed target-only
work prevents completion/retirement. Required project context is explicit.
The example documents serialized scheduling and retains the ordinary protocol;
it does not introduce concurrent scheduler infrastructure or migrate workflows.

## Independent post-change refactor

Optional provider adoption moved to installed `manuals/custom-reuse-ci.md`;
the adapter manual retains its unchanged protocol/runnable example and links
to adoption. `publishCustomTarget` now owns shared real publication setup.
The current-target replacement case moved to
`ci-reuse-custom-current-target-case.mjs`, imported by the same journey owner.
Its pending handshake, failed rerun identity, failed completion, historical
report and retained-resource observations remain intact. No production rule,
observer protocol, host interface or installed managed copy changed.

Both literal commands reached terminal exit 0 after those edits:

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs src/skills/dough-execute-plan/scripts/ci-reuse-custom-journey.test.mjs tests/execution-payload-update.sh tests/payload-declaration-links.sh
PATH=/opt/homebrew/bin:$PATH npm test -- tests/payload-declaration-links.sh
```

The first command exercises moved observations and actual installed use in both
roots; the second validates final adoption links/declarations. Unchanged source
gate, GitHub/resource journeys and host evidence retain accepted proof above.
All changed files were at most 250 lines; no unresolved gap or ADR conflict.

Coordinator formatting found one parameter-property assignment in the expiry
fixture. Replacing it with `Object.assign` preserves the same expiry value.
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-reuse-custom-example.test.mjs`
reached terminal exit 0; repeated `PATH=/opt/homebrew/bin:$PATH npm run format`
then reached terminal exit 0. Formatted files remain at most 250 lines.
