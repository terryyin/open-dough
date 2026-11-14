# Hold execution until its condition changes

Use this when authorized work cannot advance because its supplier is paused,
with no verification running. A running command keeps its existing owner,
supported continuation and [overdue checks](overdue-delegated-verification.md).
Record the exact required supplier outcome; publication or completion alone
does not establish the [supplier agreement](../../dough-product-backlog/references/supplier-dependencies.md).

Keep one owner and the existing claim, checkout, branch, work and accepted proof.
Do not generate recurring model requests to inspect unchanged blocked state.
A non-model condition observer may check delivered evidence; semantic judgment
and execution authority remain with the original execution.

## Enroll the held execution

The supported automatic binding is a saved Codex thread on its live native
daemon. It needs Node and Git, without a running dashboard or npm install.
Resolve its exact thread ID and `unix:///...` endpoint from the host's retained
continuation. Never select a newest thread or another owner's observer.
Do not override model, policy, permission, workspace or reasoning settings.

Write this execution's context to a private input JSON file. Supply:

- `execution`: `identity`, `owner`, canonical absolute `workspace`, `branch`,
  current full `revision`, `authority.description` with the original authority
  and its limits, `acceptedProof`, `unfinishedWork`, and `outstandingProof` arrays.
  When assignment/authority has a file source, also supply `authority.file` and
  its current SHA-256 as `authority.sha256`; changes withhold continuation.
  The saved native history guards conversation authority against another turn.
- `condition`: `kind: "supplier"`, exact `description`, absolute `signalFile`,
  SHA-256 `observed` when that evidence was last judged, and `check`, an argument
  array for a project-owned read-only command. It must write JSON
  `{ "satisfied": false, "evidence": "what is missing" }` or an evidenced true
  result. Use canonical agreement/evidence sources. A guessed status or an
  arbitrary new SHA is not a satisfaction check. The command must terminate;
  it may not ask a model, mutate the supplier or manufacture proof.
- `continuation`: `host: "codex"`, exact `threadId`, and `endpoint`.
- `nextObservation`: responsible `owner` and exact `recovery` instructions.

Choose a private retained directory outside committed project records. From the
execution checkout, invoke this checkout's installed command:

```sh
node '<installed-execute-plan>/scripts/blocked-execution.mjs' start \
  --input-file '<absolute-input.json>' --directory '<absolute-hold-directory>'
```

Inspect its enrollment receipt before yielding. `held` means one non-model
worker enrolled the file signal before reconciling current evidence. It retains
the next observation owner and a native configuration/history snapshot. A change
between the last judgment and enrollment is therefore reconsidered. File
updates should use an atomic replacement. A non-model periodic reconciliation
also covers missing/coalesced file events; unchanged bytes do not request another
model turn. This observation interval is not a proof deadline. The route lives while that worker,
signal source and native daemon remain available. It promises no delivery after
all of them exit. `attention` is an unavailable route, not successful enrollment;
retain its context and report the exact limitation before yielding.

The original native turn must finish before delivery. The worker waits for its
native completion event, then revalidates the same owner/location/revision,
authority evidence, native history/settings and current condition before one
`turn/start`. No alternative native writer is launched. `accepted` names native
acceptance; `continued` additionally records that turn's actual completed event.
Neither state proves supplier or CI success. On re-entry, reassess the recorded
condition against current canonical evidence and continue only authorized work.

## Insufficient evidence and recovery

When reassessment still cannot prove the condition, preserve the same execution.
Update its input with the exact missing outcome and current signal SHA-256, then
run `rearm` with the same arguments and directory. Inspect its `held` receipt.
The accepted native continuation can hand observation back to its existing live
worker before completing; the worker also enrolls a changed signal location.
No unchanged observation causes another model request. Rearm retains prior
acceptance evidence and rejects a changed owner or native identity.

Use `status --directory ...` to inspect retained state. `submitting` or
`uncertain` never authorizes a resend. Once the recorded worker has ended, use
the retained `attention.recoveryCommand` argument array: it selects this installed
`reconcile` entry from the retained checkout, with its absolute directory, reads
only the exact native thread and matches
the saved unique input. A matching native turn establishes acceptance; absence
remains uncertain. Preserve it and follow its named owner/recovery path. Starting
the same retained directory again does not create another worker or claim.
Use `stop --directory ...` to ask that exact worker to end and inspect its final
record; stopping observation does not cancel or complete the execution.

Keep local proof and outstanding CI requirements intact. This hold never arms,
retargets or manufactures a CI observer or receipt; CI completion/recovery stays
with its [existing owner](ci-completion-recovery.md).

Cursor, Claude Code, missing native handles and unavailable signal sources use
the retained-state/manual continuation fallback unless their actual delivery
binding has been verified. State which facility is missing and who observes or
resumes the saved work. Do not promise a spontaneous alert from an exited host.
