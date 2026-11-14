# Native Codex held-thread feasibility — Slice 1

**Judgment:** successful native continuation through the existing daemon's
Unix-WebSocket `thread/read`, ID-only `thread/resume`, and `turn/start` seam.
This establishes feasibility, not a shipped hold/resume workflow or an observed
comparative improvement. No additional native journey was run.

## Observation basis

One disposable invoice-consumer fixture reconstructs the paused-supplier shape
from SEED-324. It starts with partial consumer work, passing local proof, and
paused/unchecked supplier evidence. It uses no live supplier or real project
publication. Preparation/breadth covered the held boundary and unchanged event;
selective depth covered native identity, configuration and acceptance; the
single diagnostic reserve resolved the native transport/ownership boundary.

- Source: `8f88bf2ca6d4e7fb7aabc704070be4c549397675`; native CLI/daemon 0.169.0.
- Native thread: `01a1d7c7-2fad-7311-9688-df2fb587a0de`.
- Held turn: `01a1d7c7-30fd-7143-8cd1-2024bf6b9e0b` (completed).
- Accepted continuation: `01a1d7cc-253c-7672-92c7-c00305bff265` (completed).
- Workspace: `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-blocked-native-wpEOB7/project`.
  `/var/...` is the same macOS checkout; comparisons require canonical paths.
- Native defaults remained `gpt-6.1-sol`, xhigh, approval `never`, reviewer
  `user`, `dangerFullAccess`, the same workspace roots and default service tier.
  No model/policy/permission override was supplied during continuation.

## Decisive evidence

Artifact names below identify original evidence indexed by
[native-probe-run/record.json](native-probe-run/record.json), a PUBLIC compact
command/hash index. Twenty raw artifacts now reside outside Git at its explicit
privateDirectory, with original index and exact compressed/uncompressed hashes.
Descriptions below remain accepted historical facts, not public filtered logs.
`gzip -cd PRIVATE_DIRECTORY/FILE.gz` recovers compressed original bytes.

1. `held-events.jsonl.gz`, read by the existing
   `tests/support/native-host-stream.mjs`, has a complete native initial turn.
   `held-reader.json.gz` retains its commands, passing `node verify-local.mjs`,
   and the exact blocked response: paused/unchecked evidence with no tax rate.
   No final report existed. Consumer work and its verifier matched the accepted
   SHA-256 values in `accepted-local-proof.json` before and after continuation.
2. `controller.jsonl.gz` records filesystem enrollment, an unchanged supplier
   event with no new submission, and the qualifying synthetic evidence. Repeated
   filesystem notifications did not start another CLI submission, but that CLI
   path was subsequently refused and does not prove replay suppression on the
   successful daemon route. The consumer
   was completed/held with no model process checking unchanged state.
3. The first metadata attempt incorrectly treated `codex app-server proxy` as a
   line-JSON endpoint. It stalled before continuation; the identified owned
   proxy client was terminated. `prior-diagnostic-result.json` retains that
   failure. The shared daemon was never stopped or restarted.
4. The one diagnostic follow-up used the existing Unix-WebSocket contract.
   ID-only metadata resume loaded the thread into the daemon. A subsequent CLI
   resume was explicitly refused as an active-writer conflict
   (`resumed-stderr.txt`, `cli-refusal-result.json`); it accepted no turn.
   `pre-rpc-reconciliation.json.gz` establishes the exact original held thread,
   canonical workspace and sole completed turn before the one RPC submission.
   A path-string guard initially stopped before submission on `/var` versus
   `/private/var`; correcting it to realpath required no model request.
5. `native-acceptance.json` and `resumed-rpc-events.jsonl.gz` retain actual
   native `turn/start` acceptance and matching `turn/completed`, rather than
   an inner callback or fabricated CLI stream. `resumed-native.json.gz` retains
   both completed turns and the consumer's actual commands/result. The native
   agent independently reread the condition, wrote `final-report.json` and
   verified subtotal 125, tax 10, total 135 SGD with evidence R8. Exactly one
   continuation was accepted. The diagnostic controller submitted it without a
   developer-typed resume; it did not start a replacement native conversation.
6. `held-settings.json` and `resumed-settings.json` match. After acceptance,
   the diagnostic reread the unchanged evidence and native history. Its event
   named `replayed-signal` did not drive another signal through a delivery
   handler; `additionalSubmissions: 0` was hardcoded. The reread establishes
   that the same two turns were present at that observation, not that the
   successful daemon route suppresses replay. That behavior remains unproved.
   The raw `result.json` value `result: pass` is accepted only as native
   feasibility evidence, with this assessment limiting its broader wording.

Literal commands are retained in `record.json`. Both native scripts passed
`node --check`. Post-run `node verify-local.mjs` passed from the disposable
project. One assessor invocation from the repository instead of the fixture
failed with ENOENT; correcting its working directory passed, matching the
native agent's independently retained successful invocation.

## Lifetime, limits and next design consequence

The supported result is a live non-model controller delivering into this saved
thread on its existing native daemon. Closing an RPC client detaches that
client; it does not unload the daemon's writer. Once the daemon owns the thread,
use its `turn/start` seam; a separate CLI writer is refused. Keep native identity,
configuration and exact acceptance reconciliation at this boundary. The
prototype's duplicate suppression was observed only on the refused CLI route,
not the successful RPC delivery route. Neither maintained replay suppression,
a crash-safe lifecycle nor exactly-once execution was established.

The accepted turn is a diagnostic completion after the event-triggered CLI
refusal, not an installed workflow's uninterrupted event-to-resume journey.
The retained event and exact history were reconciled before submission. Slice 2
still owes command-level enrollment/races/uncertain-acceptance behavior. Its
replay proof must start through the workflow entry, drive a qualifying event
through the selected RPC delivery handler to a confirmed accepted continuation,
then drive the same event again through that handler and independently observe
no second submission, accepted turn or competing writer. A history reread or
constant count is insufficient. Slice 4 owes the full workflow-native comparison
without diagnostic rescue.
No token-saving or release-readiness claim follows from this probe. There was
one native initial task, one explicitly rejected CLI continuation, and one
accepted RPC continuation; no repeated native runs until green.

No host-exit/quota-reset recovery, Cursor/Claude transport behavior, CI
completion, or supplier prose satisfaction beyond this synthetic task was
observed. The local controller/client processes ended with terminal receipts;
the pre-existing shared daemon and saved native thread remain for inspection.
The fixture and raw evidence are retained until acceptance/wrap-up; nothing is
running in that fixture. The two probe scripts are spent investigation records,
not proposed installed runtime or general comparison tooling.

## Consumer trace

`consumer-trace.md.gz` retains the installed script's trace at the probe boundary.
This slice changes investigation records only. No installed workflow contract,
production caller, test helper, payload declaration or host adapter changed.
Matches to PLAN/source-review basenames and generic local variable names are
incidental record references, not runtime consumers. The active plan's remaining
slices consume the native feasibility and ownership findings above; their
required observations remain unchanged except for the now-observed transport
premise. Existing CI/runtime behavior is unmodified and its prior proof remains
applicable.

Retention update: no native rerun or outcome change. Raw reasoning/session/account
content is private; the public trace/verifier source and compact command/hash
index remain. Git history was not rewritten and the index was not modified.
