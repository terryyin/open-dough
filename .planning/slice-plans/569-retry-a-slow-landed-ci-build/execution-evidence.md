# Execution evidence and decisions

## Execution context

Established execution `SEED-285#retry-a-slow-landed-ci-build`, publisher
`dashboard-territory.local-open-dough`, agent `viktor-chan`, Story Branch Mode.
Owned/reused execution checkout and originating checkout:
`/Users/terryyin/git/open-dough/.worktrees/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`,
branch `codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`.
Starting revision `5574b930e231e49a6f384aca561a6229d91993e8`;
accepted claim/candidate `85eb42227b7887104aa80b9be39ac0ab27b73d24` on
`origin/main` and the remote execution branch. No second Take is needed.
Increment destination is the remote execution branch; final integration targets
`origin/main`. Integration/default checkout is not selected for implementation.
No numeric slice limit or explicit replanning override; preserve ordinary planning
authority within the understood story. Supplier dependency is canonically
satisfied at accepted integration `79463598346c4f74221711aabc47be51e29246cb`.

Checkout-bound setup on 2026-11-10: Node v24.21.0;
`node scripts/setup-native.mjs npm`, `browser`, `check` passed against this
checkout's lockfile, Chromium 153.0.8010.12. Applicable Playwright list command
from Verification passed (three tests). Check-only pre-commit owns staged lint
and script-triggered dashboard typecheck; selective formatter is `npm run format`.

CI source: GitHub Actions `terryyin/open-dough`, verified `ci.yml` (CI,
workflow 351271804). Observer key
`ci-watch-execution:terryyin/open-dough:codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe:seed285-viktor`;
coordinator `seed285-viktor`, directory `/tmp/dough-ci-501/watch-S6j7xi`, PID
28785, stream session 13677, yielded cell `g1034:11`, bound to this checkout
and the remote execution branch. Claim trunk CI is unobserved by this stream.

Expensive proof decision: this macOS host is awake on AC, load 13.65/15.78/13.09,
47% free memory at setup. Other unrelated sessions are active; no owned proof
runs concurrently. Sequence focused browser/backend checks with one worker and
`PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i`; use focused Node checks.
Implementation/refactor command owners retain terminal-result responsibility.
Reconsider if contention, workload or a failure removes this basis. No real
project enablement or production repeat is authorized or required.

## Accepted execution increments

Slice 1: accepted `8aeda2ade7baf09656cd6823e3031ebbf1a797ce` on
`origin/refs/heads/codex/repeat-a-slow-landed-ci-build-once-and-flag-a-pe`,
suffix base `85eb42227b7887104aa80b9be39ac0ab27b73d24`; no rewrite.
Managed delivery reused this coordinator's observer and registered the exact
accepted revision. This is now the previously published base and candidate.
Formatter/commit hook checks passed. A separate mechanical staging stop caught
and removed a trailing blank line in these coordinator notes before any commit.
No default-checkout maintenance applies to story-branch publication.

Owned CI repair 1: accepted `0fb7f02264c8956c1a7ea68f213ecf115d1a58df` on the
same remote execution branch, suffix base `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`, no rewrite; exact revision registered on the same observer.
This is now the previously published base/candidate. Failed run42800107133/1
has complete inventory: two native identity failures, both repaired and proved
in [CI repair evidence](ci-repair-1.md). The installed stash restore returned
`resumed` for record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-BBQYaF/record.json`, OID `fbf12d01c6a061c0a2e5f715dc4896a07dc3b725`, applied/dropped only that entry. Root metadata returned intact; slice2 explicitly resumed.

Owned CI repair 2: accepted `ca51aa4393535ff5d7131a996a381068f37ec7d7` on the
same remote execution branch, suffix base `0fb7f02264c8956c1a7ea68f213ecf115d1a58df`, no rewrite; exact revision registered on the same observer.
This is now the previously published base/candidate. Failed run42802352676/1
has complete inventory: one retained-reader port failure, repaired/proved in
[CI repair 2](ci-repair-2.md). Installed stash restore returned `resumed` for
record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-MROJ7o/record.json`, OID `395b5a9f0681e2fab19dcf366067d2f4c5b2de2c`, applied/dropped only that entry. All sixteen slice2 files and root metadata returned; same implementation owner explicitly resumed at its pending transport/parser proof. No code overlap invalidated core gate20080.

## Dashboard completion context

Launch `e290a475-370f-4591-a82e-63baec73b213`, project open-dough, host codex.
Final reporting command is `node /Users/terryyin/.open-dough/dashboard/reporting/e290a475-370f-4591-a82e-63baec73b213/dashboard-completion.mjs --origin http://127.0.0.1:4173 --source open-dough --host codex --reference e290a475-370f-4591-a82e-63baec73b213`.
First trunk landing must pass `--landing-context /Users/terryyin/.open-dough/dashboard/reporting/e290a475-370f-4591-a82e-63baec73b213/landing-context.json` to the installed publisher; retain exact landing retry input.
After final operations/wording settle, reporting is the final operation; wait for its matching receipt. Quiet success uses `--outcome completed` without a message file. Attention uses the exact final response in `--message-file` and completed/unfinished as appropriate. Delivery failure retries reporting only.

## Architecture and reuse

Follow [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
and the existing [one-repeat North Star](../../NORTH-STAR.md#one-intent-workspace-with-landed-ci-evidence).
The index and relevant Accepted records agree; no exception or ADR proposal is
needed. Git owns workflow/Done facts; CI owns observed attempt outcomes; the
machine owns configuration, request progress and collected evidence.

PFE found existing owners for production background collection, exact-attempt
lookup, validated proof, the reference calculation, machine file locking and
Done/Intent selection. Extend those owners. The shared GitHub transport is
read-only today and needs one explicit full-rerun capability; do not weaken its
generic read contract, create an arbitrary command endpoint, or route actions
through read caching/coalescing/retry behavior. The adapter contract stays
observation-only. Author shared client-payload changes in `src/skills/`, never
hand-synchronize installed managed copies.

Use one follow-up record and allowance for one project's original landing,
with duplicate receipt references joined to it. Its workflow/run/revision are
immutable request payload, not a workflow-dependent new allowance key;
changing workflow configuration cannot renew a spent landing's allowance.
Keep its frozen decision inputs and separate CI observations. Reuse machine JSON locking, but
change/adapt the storage boundary to refuse action admission on unreadable
allowance evidence; generic recovery from an empty document is unsafe here.
Keep the allowance independent of history-point pruning: forgetting a sample
must not grant another repeat. Retain the fixed comparison and both attempts
for the follow-up's reading lifecycle, rather than relying on today's moving
window. This is operational evidence, not a second backlog or story registry.

The common rule is one immutable decision basis and one consumed allowance,
followed by independently observed CI outcomes. Provider rejection, ambiguous
submission, queued/running CI, complete confirmation and incomplete evidence
are states of that lifecycle, not separate per-example handlers. Existing
launch/start records demonstrate write-ahead discipline but have a different
domain; do not store CI requests in them.

## Decisive premises and observations

Observed in this owned checkout at `7ff9a21f86addd3d3bbe47e0b0007f019dbffaba`
on 2026-11-10 using Node v24.21.0 after successful `npm ci --ignore-scripts`.
No source scratch edit or real CI mutation was made.

| Premise / consuming operation | Observation in the consuming form/profile | Result and remainder |
| --- | --- | --- |
| Current original/rerun normalization is already comparable | Direct Node import of `nearestRevisionBuild` in this checkout; `makeMe.aCiRun.with` gives completed original/repeat with creation `00:00`, start `00:01`, end `00:03` | False: attempt 1 gives 180000 ms/start `00:00`, attempt 2 gives 120000 ms/start `00:01`. Slice 1 owns normalization and retained-basis handling; do not inherit today's metric unchanged. |
| Existing request boundary can already submit the action | Direct `fixedRequest` replay with `args: ['api','repos/owner/repo/actions/runs/71/rerun']`, scope `github.com#fixture`, bound 1000 ms/max buffer 1024; repeat with `--method POST` | Read-shaped input admitted, POST refused. Slice 2 adds an explicit narrow operation; current GET support is not mutation support. |
| Existing storage can coordinate independent writers, but its corruption recovery is safe for allowances | Four independent Node processes import `replaceMachineJson` and update the same isolated temporary JSON store `{count:0}` once; then write malformed bytes and update once more | Counter is 4; malformed state is preserved separately but update starts from empty and yields 1. Cross-process engine behavior observed. Generic reset is unsafe for spent allowances; slice 3 must provide fail-closed admission. Temporary directory removed. This is infrastructure input, not product test data. |
| The actual maintained proof route can load collection/restart and history-reading scenarios | `npm run test:dashboard -- --list backend-tests/intent/landed-ci-history-lifecycle.spec.ts tests/intent/intent-ci-wall-time-history.spec.ts --reporter=list` | Exit 0, three tests selected in two files. Settles runner/spec-import prefix only; no passing behavior or new action proof is claimed. |
| Provider exposes distinct attempt bounds rather than requiring local submission-time approximation | Retained read-only observation in source Investigation, real `terryyin/open-dough` run 42196943419, exact attempts 1/2 and current-run read on 2026-11-10 | Exact attempt 2 start `10:05:19`, end `10:10:38`; current-run creation remains original `09:41:44`. Exact creation is `10:05:20`, so no all-queue claim. Use attempt start, as accepted; this observation does not prove a full rerun or current write authority. |
| Moving-average output is already delivered | Current source/backlog and supplier plan 555 at preparation revision; recorded dependency agreement | False here: supplier is Taken. Wait for its published outcome before execution, then consume its real API/evidence. This is a dependency, not a readiness concern or permission to duplicate the calculation. |

New action, timing migration, automatic lifecycle and reading behavior are owed
by their slices, with failing-first proof through the named boundaries. Current
presence/import observations are not substituted for that future proof. Project
credentials and provider acceptance are runtime outcomes: refusal is supported,
not a prerequisite for preparing or executing isolated automated proof. If a
live provider observation becomes necessary during execution, stop before
that action unless its specific project/revision/cost is authorized; do not
silently turn preparation or a test command into a production repeat.

## Concern review and current decisions

Four slices: three Behavior proof loops and one immediate enabling Structure.
No numeric slice target or hard limit is supplied; judge boundedness by those
loops. Slice 3 deliberately owns admission, crash safety and terminal card
outcomes together: enabling an autonomous action before its cap/recovery exists
would not be a safe stopping point. Slice 4's richer reading is the sole named
interim limitation. No speculative generic provider or distributed coordinator
is introduced.

Slice-plan refinement ran after review found safeguards allocated too late or
not explicitly discriminated. Retain boundaries 1–4: move original-sample
preservation and its proof into slice 3, keep its allowance independent of
workflow changes, and prove corruption refusal survives later writes/restart.
Slice 4 retains the richer reading journey. Four slices remain, with no
consolidation, split, sizing exception or resplit recommendation. No execution
has started or is authorized by this review.

After those corrections, planning review found no remaining boundary,
cumulative-design, sizing or proof-ownership concern. Storage and action risk
have explicit owning proof, one domain rule spans the lifecycle, and the only
external prerequisite is recorded canonically. No pre-Take human
decision remains. The source's 5% calibration is deliberately provisional,
not an unobserved statistical premise required by this deterministic rule.

Record readiness through the installed backlog recorder after reviewing this
plan and source. Readiness neither satisfies the supplier dependency nor
authorizes execution, project enablement or a production rerun.

## Follow-up foundation reuse after slice 2

PFE responsibility: arrange new follow-up/attempt/proof facts through this
project's single MakeMe entry and use machine JSON's existing atomic ownership.
Published trunk `b26709dafe4a51e801ce1a4f34019d7ebeb6fbe3` supplies the accepted
SEED-261 GitHub CI test-data conversion: `ciRunTestData.mjs` owns observed/run
facts and API projection, `ciMakeMe.mjs`/`launchMakeMe.mjs` expose descriptor
getters, and `makeMe.mjs` aggregates them with fresh-builder semantics. Existing
local MakeMe is244lines; reuse the published CI facet before adding follow-up
builders instead of inventing a second split or raw CI construction path.
The accepted machine JSON lock exit correction at8756dd712 makes ownership
publication/removal synchronous and preserves existing write/read boundaries.
It belongs to the same persistence owner that the durable allowance extends.
Choice: at the clean post-slice2 boundary reconcile accepted trunk into this
owned story branch while preserving published histories, then reverify only
affected combined fixture/timing/action/storage paths before slice3. No story
scope, user promise, ADR or source-of-truth change is authorized by this reuse.
