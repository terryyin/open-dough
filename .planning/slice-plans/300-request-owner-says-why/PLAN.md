# Request owner says why

**Identity:** SEED-063#request-owner-says-why
**Source:** [correction story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#request-owner-says-why).
**Prepared:** 2026-10-11 by the execution retrospective of
SEED-063#dashboard-owned-ci-monitoring (plan 224, recoverable at
`2d889140cd7bd390f5bbb6e775de1e690e65645b:.planning/slice-plans/224-dashboard-owned-ci-monitoring/PLAN.md`).

## Provenance

Execution uses the established Story Branch start in
`/Users/terryyin/git/open-dough/.worktrees/a-github-request-or-failed-log-that-could-not-be`,
branch `codex/a-github-request-or-failed-log-that-could-not-be`, agent
`mike.li-chan`, publisher `dashboard-territory.local-open-dough`. Starting revision:
`0169516cf002b5774b36a5d917566dc624b594a7`; accepted claim and first delivery base:
`0cacaa7fe1b5917a2b03515a39d80fd23b032ba1` on `origin/main`.
Ordinary increments target the same execution branch on `origin`. The owned
worktree is reused; the default checkout is `/Users/terryyin/git/open-dough`.
Accepted increment: `bbc0b6f2280377363b4c903ff22433ab7334bd83`, suffix base `0cacaa7fe1b5917a2b03515a39d80fd23b032ba1`; observer reused, no reconciliation.
Accepted increment: `e169cd39dfd71fc761d95d626cb6a8a2d030ddbe`, suffix base `bbc0b6f2280377363b4c903ff22433ab7334bd83`; observer reused, no reconciliation.
Accepted repair: `e9a3b2314ee25a2de9b930b3f1d7a561e77c4c29`, suffix base `e169cd39dfd71fc761d95d626cb6a8a2d030ddbe`; observer reused. Installed stash restoration confirmed `resumed`, applied, and dropped only owned OID `ee02bd66f48f8e8223178165da8f77ac362baa52` before slice 3 resumed.
Accepted increment: `e5102464e72cbf2ab796e15ab5cebe50c8a55756`, suffix base `e9a3b2314ee25a2de9b930b3f1d7a561e77c4c29`; observer reused, no reconciliation.
Checkout setup: `npm ci --ignore-scripts`, then `npm run typecheck:dashboard`
passed on 2026-10-12. No numeric slice budget or exception is configured;
existing planned refinement authority is retained.

CI source: GitHub Actions `ci.yml` (push-triggered; selector verified with
`gh run list --repo terryyin/open-dough --workflow ci.yml --branch codex/a-github-request-or-failed-log-that-could-not-be --event push --limit 1 --json workflowName`).
Codex observer: coordinator `request-owner-says-why-0460b695`, directory
`/tmp/dough-ci-501/watch-JUWjb1`, PID `60144`, stream session `95354`, cell `11`.
It observes the execution branch; the startup claim on trunk is unobserved.

Plan 224 delivered shared GitHub request admission in `b5cb2f7b`, `93f43b59`,
`c6c8f9d6`, `deb540bb`, `f9ef7368`, `752f8606`, `51980e45` and `f1345331` on
`claude/monitor-ci-in-the-background-and-wake-execution`. Its story and
obligations G4 and G11 are the original contract. Findings below were read at
`3e2e6138`.

## Goal and scope

A developer reading the dashboard, or an agent diagnosing CI, can distinguish
an unasked request from an upstream failure and a directed wait from missing
log evidence. Preserve this correction's structural and test-proof repairs.
Background session delivery and protocol placement remain with the sibling;
no automatic endpoint repair, new retry policy or feature promise is added.

## Investigation and current findings

Preparation at `887ec1c7475add6d3b782a0ab3042f5eba865ba9` reproduced cause
loss, missing structured log waits, duplicate process/endpoint knowledge and
unbounded turns/hold fault proof. Full observations and the Bash 5 baseline
are recoverable from this plan at the accepted claim revision. Scratch edits
were removed. Slice 5 must establish bounded discrimination before deletions;
no speed comparison or successful mutation proof was established in preparation.

## Key examples and interaction

- Privacy/path validation refuses → a dashboard or CI reader asks → name the
  observed local cause at its existing notice/history or unavailable reason,
  with no upstream call/fallback. Recovery addresses endpoint configuration;
  never print its secret path or recommend login for a known endpoint fault.
- Greeting explicitly refuses protocol/caller → name that refusal. Startup or
  connection silence → bounded unknown/start failure, never inferred version
  mismatch. Preserve the existing waiter abort and timed-out rejection contract.
- One failed attempt has a held log alongside readable/unavailable logs → keep
  all available evidence, name the held job and numeric wait, exit 75. The agent
  retries only as directed; it does not parse a wait from prose.
- A log is expired (404/410), too large, or its request fails without a wait →
  retain steps/other logs and the observed cause, name missing evidence, supply
  no invented delay. Classify from what is available; retain uncertainty when
  insufficient. Partial diagnostics without holds retain exit 0; inability to
  acquire jobs retains exit 1 (75 when held).
- PID is reused, exits or cannot be inspected → both owners use shared facts
  with their existing identity/signaling decisions. No new authority to signal.
- Duplicate proof is removed → a turns/hold/probe fault → its surviving owning
  test fails within a bound, while distinct consumer integration remains green.

The existing notice and diagnostic output suffice; no layout choice is needed.
Fixed causes give useful recovery while preserving secrecy. Numeric holds
support directed waiting; other missing evidence remains uncertainty. These
are consequences of the existing correction, not new scope choices.

## Architecture, reuse and constraints

Reuse `github-request-answer.mjs`'s safe categories, the owner link,
`GitHubAcquisitionHeld`, and dashboard `ghFailure.ts`, `readFailureMessage.ts`,
`readDiagnostics.ts` / sanitization. Extend one cause representation through
those consumers, with an unknown fallback; never forward arbitrary exceptions.
Recognize the output bound at the subprocess/answer boundary where it is known.

Modularize process reading/exit recognition for the two actual owners, exposing
only needed sync/async access. Keep each owner's identity and signaling policy.
Return endpoint knowledge from wire encoding without changing protocol/admission.
This PFE outcome restores existing responsibilities; it adds no supervisor.

Preserve `request(args, signal)` rejection only for waiter abort or timeout;
other unavailable-owner reads settle failed, with no upstream call or private
fallback. Preserve privacy, fixed `api`, single claim, durable hold, login
isolation, child reconciliation and untrusted CI text. Messages, receipts and
retained diagnostics expose no token, credential, raw stderr or secret path.

Follow Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(whole-product correction), [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source/release separation), [0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(complete local dependencies), [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(proof ownership), and [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(single executing-agent guidance home). Index/statuses agree, with no conflict
or exception; 0007–0009 remain Proposed. Follow [AGENTS.md](../../../AGENTS.md)'s
behavior review and author in `src/skills`, never hand-edit installed copies.
The [North Star monitoring topic](../../NORTH-STAR.md#background-ci-monitoring-and-session-delivery)
keeps shared admission and standalone dependencies with the sibling. No new
ADR/topic is needed; its G12 protocol-placement decision remains there.

## Ordered slices

### 1. Explain an unasked request at each reader
Type: Behavior
Status: done

Behavior: endpoint/start/connection/greeting fails → reader asks → safe observed
cause reaches dashboard notice/history, diagnostic and observer unavailable
reason without fallback; endpoint refusals make no upstream call. Preserve unknown and timeout semantics.
Correct `retainedAnswersJourney.ts`'s stale claim that a hold affects no other read.

Accepted: real directory/socket faults establish causes, zero calls and no secrets in endpoint/CLI/observer/browser assertions; ownership uses the focused metadata seam. Silent startup returns unknown after the unchanged 30-second deadline and tears down its owned child. Established connection loss cannot infer upstream activity. Explicit failed answers retain their contract; replacement still observes eight calls and process exit. Refactor found no edits; formatter's comment/JSON-property assertion corrections preserve proof.
All terminal commands passed from this checkout:
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs src/skills/dough-execute-plan/scripts/github-requests-real-gh.test.mjs src/skills/dough-execute-plan/scripts/github-request-login.test.mjs src/skills/dough-execute-plan/scripts/github-request-login-secrecy.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-kept-admissions.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs src/skills/dough-execute-plan/scripts/github-requests.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-failure.test.mjs src/skills/dough-execute-plan/scripts/github-request-answer.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs`
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/github-request-owner-start.test.mjs`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-owner-failures.spec.ts authenticated-read-diagnostics.spec.ts authenticated-read-diagnostics-bounds.spec.ts authenticated-read-subprocess-lifecycle.spec.ts authenticated-read-transient-eligibility.spec.ts --workers=2`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- shared-request-owner.spec.ts authenticated-read-boundary.spec.ts --workers=2`
`PATH=/opt/homebrew/bin:$PATH npm test -- tests/install-public-payload.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/payload-declaration-links.sh`
`npm run typecheck:dashboard`; `git diff --check`; `PATH=/opt/homebrew/bin:$PATH npm run format`.

### 2. Distinguish waiting for a log from missing evidence
Type: Behavior
Status: done

Behavior: held/expired/oversized/failed logs → diagnostic → per-job safe causes,
available steps/excerpts retained, numeric hold and exit 75 for any held log;
other partial diagnostics remain exit 0, with no invented delay. Jobs-acquisition
failure retains its fatal/held exit behavior. Preserve `logUnavailable`'s useful
text and add structured wait information without parsing prose.

Accepted: actual CLI held-only/mixed/404/410/failed/17 MiB cases in `ci-github-diagnostic-logs.test.mjs` observe numeric waits/exit 75, retained steps/excerpts, safe causes and absent invented waits/secrets; answer assertions observe body discard and rate-header precedence. Browser output-bound/history/ref-fallback assertions use actual oversized subprocesses. Mixed evidence is event-gated. Expired/mixed guidance walks retain uncertainty and untrusted-text handling. Refactor shares one fixture release rule; its affected proof passed again. All commands terminal/pass:
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-github-diagnostic.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic-logs.test.mjs src/skills/dough-execute-plan/scripts/github-request-answer.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition-owner.test.mjs src/skills/dough-execute-plan/scripts/watch-ci-execution-hold.test.mjs src/skills/dough-execute-plan/scripts/github-requests.test.mjs`
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-github-diagnostic-logs.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-start.test.mjs src/skills/dough-execute-plan/scripts/github-request-login.test.mjs src/skills/dough-execute-plan/scripts/github-request-login-secrecy.test.mjs src/skills/dough-execute-plan/scripts/github-request-kept-admissions.test.mjs`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-output-bound.spec.ts authenticated-read-diagnostics.spec.ts authenticated-read-diagnostics-bounds.spec.ts authenticated-read-transient-eligibility.spec.ts authenticated-read-boundary.spec.ts --workers=2`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-retained-answers.spec.ts authenticated-read-retained-answers-bounded.spec.ts authenticated-read-retained-answers-reload.spec.ts authenticated-read-retained-answers-moved.spec.ts project-read-recovery.spec.ts transient-read-recovery.spec.ts --workers=2`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-output-bound.spec.ts authenticated-read-revision-check.spec.ts authenticated-read-revision-check-failures.spec.ts authenticated-avatar.spec.ts --workers=2`
`npm run typecheck:dashboard`; `git diff --check`; `PATH=/opt/homebrew/bin:$PATH npm run format`. The browser fixture initially failed before output acquisition; valid oversized JSON corrected the precondition. No runtime dependencies changed.

### 3. Share process facts without sharing signaling policy
Type: Structure
Status: done

CI repair for published slice 2 (`e169cd39`, run 38180782958/1): `ci-custom-guidance.test.mjs` rejected equivalent wrapping/wording. `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-custom-guidance.test.mjs` failed before the test-only repair and passed afterward; actual guidance plus three paraphrases and four missing-safeguard counterexamples were inspected. All eight deterministic guidance consumers passed; runtime guidance is unchanged. Independent refactor required no edits, formatting passed, and slice 3 remains planned with its unfinished work preserved.

Own finding 4's duplicate process-table knowledge. Share reading and exit
recognition while retaining request-call PID/argument/start-window and mailbox/
stream identity, denied-inspection handling and rechecks before signals.
Accepted: `process-table.mjs` owns reads/exit facts only. Both owners retain identity/denial/signaling policy. Inspected live/departed sync/async reads, all four exit forms, PID/argument/start mismatches, unreadable accounting, no-signal and pre-KILL rechecks in owned-calls and mailbox tests; installed delivery/completion/closure owners also pass. G1 is proved. Bootstrap owns setup/invocation after the unchanged inline declaration. Refactor found no edits. Final commands terminal/pass:
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-worker-loss.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-complete.test.mjs src/skills/dough-execute-plan/scripts/ci-observer-stream.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-denied-inspection.test.mjs`
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-kept-admissions.test.mjs src/skills/dough-execute-plan/scripts/github-request-login.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-launch.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox-await.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-completion.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-stop-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-codex-observation-loss-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-host-hook-worker-loss.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-owner.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-codex-owner.test.mjs`
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-story-wrap-up/scripts/trunk-closure-owner.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-gaps.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-codex-owner.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-ended-record.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-owner-ambient-rerun.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-rebased-rerun.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure-below-toplevel.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-observation-gaps.test.mjs src/skills/dough-execute-plan/scripts/ci-mailbox.test.mjs`
`PATH=/opt/homebrew/bin:$PATH npm test -- tests/install-public-payload.sh tests/install-all-tools.sh tests/execution-payload-update.sh` freshly observes final installed bytes/use; prior four-check command's `tests/payload-declaration-links.sh` result remains applicable because declaration/link selection is unchanged. `git diff --check` and `PATH=/opt/homebrew/bin:$PATH npm run format` pass.

### 4. Keep endpoint responsibility with the endpoint
Type: Structure
Status: done

Own finding 4's misplaced endpoint knowledge: return socket ownership,
reachability and scope from wire encoding to cohesive endpoint modules, within
the line limit. Preserve greeting/protocol validation and slice 1's safe causes.
Accepted: direct relocation into `github-request-owner-endpoint-connection.mjs` owns socket ownership/reachability/greeting/scope and the unchanged five-second deadline; wire owns protocol/framing/validation/answer conversion. Inspected unchanged bodies and all owner/link/test imports. Endpoint/refusal/secrecy/zero-call, admission/replacement/login, CLI/observer and browser observations remain current. Refactor found no edits; all commands terminal/pass:
`PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs src/skills/dough-execute-plan/scripts/github-request-login.test.mjs src/skills/dough-execute-plan/scripts/github-request-login-secrecy.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-failure.test.mjs src/skills/dough-execute-plan/scripts/github-request-owner-start.test.mjs src/skills/dough-execute-plan/scripts/github-request-kept-admissions.test.mjs src/skills/dough-execute-plan/scripts/github-request-owned-calls.test.mjs src/skills/dough-execute-plan/scripts/github-requests-real-gh.test.mjs src/skills/dough-execute-plan/scripts/github-requests.test.mjs src/skills/dough-execute-plan/scripts/github-request-answer.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition-owner.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic.test.mjs src/skills/dough-execute-plan/scripts/ci-github-diagnostic-logs.test.mjs`
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-owner-failures.spec.ts shared-request-owner.spec.ts authenticated-read-boundary.spec.ts authenticated-read-diagnostics.spec.ts authenticated-read-diagnostics-bounds.spec.ts authenticated-read-subprocess-lifecycle.spec.ts authenticated-read-transient-eligibility.spec.ts --workers=2`
`PATH=/opt/homebrew/bin:$PATH npm test -- tests/install-public-payload.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/payload-declaration-links.sh`
`npm run typecheck:dashboard`; `git diff --check`; `PATH=/opt/homebrew/bin:$PATH npm run format`.

### 5. Keep discriminating request-rule proofs at their owners
Type: Structure
Status: planned

Own finding 5. First make turns/hold/post-wait-probe observations and teardown
bounded under disabled behavior; preparation showed the existing route can
hang. At the established consumer fixture, pass each rule, disable it (nine
turns, no hold, unrestricted post-wait admission), obtain its expected bounded
failure, restore and pass again. No scratch mutation survives.

Only then remove the fixture-supplied second-server independence case and
redundant generic sharing/hold acquisition cases. Retain request-level failure
attribution, backoff, abort, bound and post-settlement reread distinctions even
when their cases also mention sharing. Each deletion names a surviving owner;
keep any case with distinct value. Move backoff variations only when cheaper
request-rule proof covers them; retain one dashboard integration journey.

Proof: keep `shared-request-owner.spec.ts` for dashboard/CI wiring, login tests
for isolation, `watch-ci-execution-hold.test.mjs` and acquisition's observer-
suspension case for coverage, and dashboard recovery/attribution. Time the
acquisition file immediately before/after under the same runner/concurrency;
report measured time, not presumed speedup. One coverage-consolidation outcome,
not a benchmark framework or permission to weaken proof.

## Proof ownership and local checks

| Promise/finding | Owner / observable boundary |
| --- | --- |
| Safe cause, no call/fallback/secrets | 1: consumer, CLI, observer, browser/history |
| Held versus missing logs, exits/evidence/recovery | 2: CLI and guidance walk |
| Shared facts, unchanged identity/signaling | 3: both process owners and installed use |
| Endpoint cohesion, unchanged admission | 4: endpoint/replacement/login |
| Reduced duplication, preserved discrimination | 5: bounded faults and surviving integrations |

Run script suites with the baseline command above, using full `.test.mjs`
paths. Dashboard: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <specs>`.
`npm ci --ignore-scripts` established this checkout's dependency route. Run
`npm run typecheck:dashboard` for shared type/import changes. Search changed
unions/literals and recovery/retained-answer consumers; include their proof.
Run the entire affected surface suite when it fits focused feedback, including
consumers outside it; hosted CI alone adds no whole-repository local gate.

For changed runtime dependencies/declarations, run
`tests/install-public-payload.sh`, `tests/install-all-tools.sh`,
`tests/execution-payload-update.sh`, `tests/payload-declaration-links.sh` through
`npm test -- <files>` with Bash 5. These verify complete installation across
supported layouts and updates, not merely file presence. Execution retains
its independent post-change refactoring and delivery gates; AGENTS.md owns the
guidance review. No numeric slice target was supplied and no exception is needed.

## Current decisions

The refined five slices separate independent cause/log behavior and process/
endpoint preservation loops. Slice 5 repairs unbounded observations before
removing duplication. G12 and background session delivery stay with the sibling.
Preserve the 250-line rule, safe categories, unknown/timeout semantics and all
original correction promises. No scope/ADR/proof-owner decision remains, no
paid/native/live-GitHub premise is needed, and no exception is authorized.

## Story obligations

### G1. Final synchronous-reader adjustment needs current proof
Reported: slice 3 — "No verification has run since that final reader adjustment."
Story clause: "Keep process-table reading and exit recognition shared while retaining each owner's identity and signaling policy"
Disposition: proved by slice 3: github-request-owned-calls.test.mjs (sync/async live/departed reads and no-signal/recheck assertions), ci-mailbox-complete-exit-cases.mjs, denied-inspection, installed completion/delivery/closure tests; final current commands passed after restoration.
