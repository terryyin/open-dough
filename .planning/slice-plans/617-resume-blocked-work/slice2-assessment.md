# Slice 2 — retained hold and native delivery

## Outcome and boundary

The new `blocked-execution.mjs` command retains one execution and observes its
supplier without recurring model checks. It enrolls before reconciliation,
guards execution/native identity and authority, persists input before native
submission, and records acceptance separately from completed continuation.
Repeated evidence starts no second writer. Uncertain acceptance is reconciled
from exact native history without resending. An insufficient-evidence
continuation can rearm the same live worker, including a changed signal path.

PFE selected the existing daemon connection responsibility. The dependency-free
`codex-rpc.mjs` / `codex-unix-websocket.mjs` connection is shared by the installed
command and the dashboard's existing lifecycle wrapper. The wrapper still owns
turn observation/refusal handling; installed execution imports no dashboard
TypeScript and needs no npm dependencies. `fakeCodexHistory.ts` exposes the
existing protocol substitute's history/settings answer instead of making a new
substitute. Proposed guidance and declarations changed only in `src/`.

This is command/workflow-entry proof. Full skill invocation/comparison remains
Slice 4. Deadline, CI-observation loss and usage-hold extensions remain Slice 3.
No comparative saving, host-exit recovery or other-host delivery claim is made.

## Observed native command journey

Command: `caffeinate -s -i node tests/blocked-execution-native.mjs --native /private/tmp/seed345-native-command-20261114-1050`

Terminal result: pass, exit 0, one run and no paid retry/rescue. The reusable
small example reconstructs SEED-324's preserved consumer/paused supplier using
synthetic invoice evidence. It copies the candidate's actual Node-only runtime
closure into the isolated project's `.agents/skills` layout and hashes it.
The initial task prompt supplies the invoice assignment and evidence rule, not
the expected hold/resume outcome.

- Native Codex 0.169.0; thread `01a1d7f6-e9b8-7913-92a5-b81f8967af94`.
- Held completed turn `01a1d7f6-eba9-7991-ac09-d3dfba848ea3`; one accepted and
  completed continuation `01a1d7f7-6f5e-7021-a142-e5b1c0d46810`.
- The actual installed `start` command enrolled the observer. Unchanged supplier
  meaning produced no model turn, independently checked by native history.
  Checked rate evidence triggered the real RPC handler. The same checked
  outcome was delivered again while that handler's accepted turn ran; the
  handler recorded the new signal fingerprint without a second native turn.
  Native history finally contains exactly the held turn and that continuation.
- Native workspace, `gpt-6.1-sol`, xhigh, approval `never`, reviewer `user`,
  `dangerFullAccess`, workspace roots and service tier matched before/after.
  No model, permission, policy or reasoning override was supplied.
- Native re-entry independently reread supplier evidence and produced subtotal
  125, tax 10, total 135 SGD with evidence R8. The local verifier passed, and
  accepted consumer/verifier bytes matched their original hashes.
- The controller and worker ended; the existing daemon and saved native thread
  remain. Fixture path above is retained for acceptance. The original source
  revision was `58f1eb1ad8ef04cb59f8eb06a90881335d5ccec6`; `basis.json` pins the
  actual uncommitted candidate runtime content with per-file hashes.

[slice2-native-run/record.json](slice2-native-run/record.json) is now a PUBLIC
compact command/hash index. Eighteen raw artifacts, including stream/history,
enrollment, acceptance/completion, settings, proof and report, were moved outside
Git to its explicit privateDirectory. Original index and compressed/uncompressed
hashes are preserved; `gzip -cd PRIVATE_DIRECTORY/FILE.gz` exposes exact original
bytes. Public source fixtures remain; these are not relabeled filtered logs.

After this run, only two shared RPC error paths changed: abort-before-open now
settles initialization, and malformed refusal fields preserve the old generic
refusal behavior. Focused RPC tests observe them. Native happy-path framing,
submission, settings and observation locations stayed unchanged; that native
result remains applicable and was not rerun for unrelated error cases.

## Proof index

The retained-state fixtures enter through the real CLI. MakeMe constructs only
starting domain values; the existing native protocol substitute supplies wire
responses. Actions, histories, expected values and assertions stay in cases.

| Source promises | Setup → observed result | Observation |
| --- | --- | --- |
| C02, C03, C05, C06, C10–C20 | Existing partial work/proof and authority → identical retained input, same revision/owner/location and preserved bytes, no claim writer | `blocked-execution.test.mjs`, first case's `retained.input`, proof arrays, partial bytes and repeated-start assertions; runtime imports/Git operations are read-only |
| C08 | Running verification supplied to supplier entry → refused before enrollment | `a running verification cannot be enrolled as a supplier hold` |
| C21, C25, C26, C33, C47–C49, Q01–Q04, Q06, Q08, Q10–Q11 | Unchanged/unproved/checked supplier evidence → no turn until checked condition, exact retained thread and authority text, preserved native settings, one accepted/completed continuation | First lifecycle case, unchanged/unproved observation fingerprints, pending input and parameter assertions; native journey above |
| C50/G1, C51 | Accepted continuation plus replay delivered through the live handler → one submission/native writer; repeated completed enrollment also creates none | First lifecycle case's live replay and history assertions; real native accepted/replay/completed records |
| C52–C54 | Lost acknowledgment → saved uncertainty, actual generated recovery argv executed from another cwd, exact history matching without resend; absent matching history remains uncertain | `blocked-execution-races.test.mjs`, lost-ack and absence cases |
| C49 and re-hold path | Native consumer rejects semantic sufficiency → current evidence re-enrolled with the strengthened check, same worker/native identity; repeated rejected outcome stays held | Insufficient-evidence lifecycle case; rearm path/location/key-order case |
| Enrollment and owner races | Change during initial native snapshot; another identity uses directory; authority/settings withdraw; original native turn still running | Race cases and authority/settings children: no lost qualifying change, no false enrollment or competing input |
| Missing/unnamed file event | Host observation substitute omits event or filename; controlled clock advanced for missing event → real retained condition reconciled, one turn and no duplicate | `blocked-execution-observation.test.mjs`; `lastObservationSource`, pending fingerprint and submission assertions |
| Shared native connection consumers | Large/fragmented Unicode, ping, refusal, malformed reply, abort before open → exact response/refusal or settled lost observation | `codex-rpc.test.mjs`; existing Codex backend consumers below |

Passing commands (all terminal exit 0):

- `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/blocked-execution.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-observation.test.mjs src/skills/dough-execute-plan/scripts/codex-rpc.test.mjs src/skills/dough-execute-plan/scripts/execution-completion-recovery.test.mjs tests/payload-declaration-links.sh`
- After RPC error-path edits: `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/codex-rpc.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-observation.test.mjs`
- After generated recovery-argv and malformed-refusal assertions: `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/codex-rpc.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs`
- `npm run typecheck:dashboard`
- `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run test:dashboard -- dashboard/backend-tests/launches/agent-launch-follow-up-codex.spec.ts dashboard/backend-tests/launches/agent-launch-uncertain-continuation.spec.ts dashboard/backend-tests/sessions/agent-launch-codex-observation-status.spec.ts dashboard/backend-tests/terminals/agent-terminal-codex.spec.ts dashboard/backend-tests/launches/agent-launch-options-boundary.spec.ts`
- Actual Codex options/recovery consumers: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm run test:dashboard -- dashboard/backend-tests/launches/agent-launch-codex-options.spec.ts dashboard/backend-tests/launches/agent-launch-start-codex-recovery.spec.ts dashboard/backend-tests/sessions/agent-launch-done-codex.spec.ts dashboard/backend-tests/sessions/final-report-codex.spec.ts`
- `PATH=/opt/homebrew/bin:$PATH npm test -- tests/install-public-payload.sh tests/install-all-tools.sh tests/native-evidence-identity.sh`
- `node --check tests/blocked-execution-native.mjs` and `node --check src/skills/dough-execute-plan/scripts/blocked-execution-worker.mjs`.

Backend observations include exact native request/response and model-catalog
selection, saved first-input recovery, native status/read provenance and failure
isolation, exact-target Done interruption, terminal identity and final-report
reads. The initial dashboard command also selected two Claude-specific broader
files; they passed, but do not substitute for the later actual Codex cases.

## Failed observations and repair

Follow [AGENTS.md's failing/flaky-test policy](../../../AGENTS.md#failing-and-flaky-tests).
No failure was waived or attributed away.

1. Initial test invocation resolved Bash 3.2; the project requires Bash 5. The
   maintained `/opt/homebrew/bin` PATH fixes the environment. The first fixture
   then used `repo.checkout` instead of the repository harness's `integration`;
   corrected before passing initial focused proof.
2. Combined run session 50141 timed out the lifecycle file at 180.3s. Its fixture
   waited for an identical-byte atomic replacement to yield an acknowledgment;
   that observation cannot establish a missed changed-byte event. The fixture
   now changes an irrelevant notice while keeping supplier meaning unchanged.
3. Corrected combined session 65534 timed out both lifecycle/race files at
   180.4s. Retained directories `held-execution-nRrpFP` and
   `held-execution-NNtfrK` under the macOS temporary root still recorded the
   original paused `observed`/`lastSignal` fingerprint while their actual signal
   files contained ready/checked evidence. This establishes a missed changed
   observation; it does not establish whether no callback or an unnamed callback
   caused that particular miss. The repair handles optional filenames and adds
   non-model periodic reconciliation. Independent controlled cases cover each
   cause; the repaired combined run passed. Timeout workers ended and remain
   recorded as attention; no owned process was left running.
4. The new observation test's selector was run immediately after authoring,
   rather than before. It selected MakeMe true/pageObjects false, matching the
   convention already applied through the fixture. This is a process deviation,
   with no convention or proof gap concealed.

## Consumer and cost limits

[Consumer trace](slice2-consumer-trace.md.gz) retains the installed script's
whole-checkout search and every located consumer's disposition. Exact supplied
effect terms: `CodexRpc`, `CodexConnection`, `NativeRefusal`, `blocked-execution`,
`Await delegated results without empty calls`, `thread/resume`. Generic derived
terms produce many incidental paths. Run dispositions name the sufficient
shared-boundary proof, not a claim that every listed test scenario was rerun.
No source/native consumer still lacks proof at the changed contract boundary.

Native admission used this macOS host, sequential workload, load
2.59/5.85/6.50, AC power and about 3.4GB free plus inactive memory. The native
journey used one initial assignment and one automatic continuation. Raw usage
events are retained, without a comparative efficiency claim. Implementation and
evaluation took roughly an hour, including two failed three-minute test runs;
the new connection, watcher/rearm lifecycle and native example carry ongoing
maintenance cost. Slice 4 must judge that cost against the matched result.

## Accepted failed-rearm completion correction

Independent refactoring found that a terminal event was retained but ignored while
rearming; a failed rearm then left the accepted turn unresolved. The implementation
owner's regression emitted completion during the native snapshot and changed
settings to reject rearm. Pre-fix session 53781 failed immediately (accepted versus
continued); repaired session 2121 passed the lifecycle/race suites. The worker
reapplies the retained terminal event after rearm, preserving the original
generation, accepted/outstanding proof and one submission. Successful rearm
removes that accepted slot and keeps its new held generation. The positive native
path is unchanged; no paid rerun was needed. Refactor proof below renews this
regression after the cohesive extraction.

## Independent refactor and renewed proof

The worker keeps serialized observation/terminal ownership. Its cohesive rearm
transition and qualified native-submission transaction moved into
`blocked-execution-rearm.mjs` and `blocked-execution-delivery.mjs`; payload
installation includes both. G4's retained-terminal replay stays in the worker's
`finally` path. The CLI no longer repeats an already-completed identity check.
MakeMe now constructs held executions through named identity/owner/checkout,
authority, proof, condition, continuation and observer operations, returning fresh
canonical input. Scenario facts and independent assertions are unchanged.
The reusable native example separates project preparation from its journey and
uses the existing import-closure reader instead of a second runtime-file list.

Renewed terminal exit-0 commands:

- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- src/skills/dough-execute-plan/scripts/blocked-execution.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-observation.test.mjs src/skills/dough-execute-plan/scripts/codex-rpc.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh tests/install-all-tools.sh tests/native-evidence-identity.sh` (session88794).
- `npm run typecheck:dashboard` (session43571).
- `node --check tests/blocked-execution-native.mjs` and `node --check tests/support/blocked-execution-native-project.mjs`.
- `node .agents/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan .planning/slice-plans/617-resume-blocked-work/PLAN.md --slice 2` (4 obligations/98 commitments).
- `git diff --check`.

The same lifecycle/race/controlled-event assertions renew retention, enrollment,
live replay, uncertainty/reconciliation, signal rebind and the G4 completion race
through the actual CLI with real retained files. RPC tests renew the builder's
native-protocol setup; the dashboard production connection/lifecycle is unchanged,
so its accepted backend and native observations remain applicable. No paid run
was repeated for these moves. A no-model setup smoke additionally called
`prepareHeldNativeProject`, imported its copied installed worker closure, checked
per-file payload hashes (entry/worker/rearm/delivery), and called `heldNativeInput`
to verify revision, accepted-proof revision, observation fingerprint and exact
continuation. It removed only that disposable setup project afterward.

[Refactor consumer trace](slice2-refactor-consumer-trace.md.gz) preserves the
installed whole-checkout search and every located disposition. Actual changed
callers are in its Scope; all relevant observation boundaries are named above.
The original generated Slice1 trace is archived as `consumer-trace.md.gz` with
unchanged decompressed SHA-256 `5b2709f6913e3960e6393759e8e30d94981b057171597615fe1f171d4c8bd081`.
Source-review input is linked verbatim from the retained review; all98 commitment
rows and plan statuses/provenance/obligations/recovery identity are preserved.

Headroom before proof: this macOS host on AC, load10.50/9.22/8.86, about1GB free
plus14GB inactive. Two focused jobs limited peak work; no other proof was owned
by this agent/coordinator and other worktrees remained with their owners. These
observations are stale for later expensive launches and must be reconsidered.

Coordinator delivery freshness: selected source unchanged against pinned trunk
`21421f790125c1165d36e0ef7fd2055f4bf3334f`. Since the accepted `64f15182` basis,
incoming runner/CI-share changes and SEED-347 preparation/Take do not change the
edited execution, native Codex, fixture, payload or guidance seams. SEED-346 has
no new product change affecting this slice. Required integration proof still
uses the final trunk's current groups; no unchanged focused proof is repeated.

Guarded preparation stopped before commit on four formatter-owned lint findings.
The coordinator used explicit skipped event arguments and `Object.assign` for
the existing attention-record mutation, wholly inside the accepted refactor's
paths/trace with no added behavior or helper (`already traced`). Renewed command
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- src/skills/dough-execute-plan/scripts/blocked-execution.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-races.test.mjs src/skills/dough-execute-plan/scripts/blocked-execution-observation.test.mjs`
passed (session5630); native and dashboard observations remain unchanged.

Retention-only update: raw reasoning/session/account content stays private under
the indexed recovery path. All native IDs, commands, accepted proof facts, settings,
completion and live replay observations above remain unchanged. No native/model
call, source change, Git-history rewrite or index mutation accompanied retention.
