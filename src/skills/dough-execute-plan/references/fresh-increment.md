# Guard a fresh local-only execution commit

Use this after accepting semantic proof and completing the independent refactor
for a fresh increment or owned repair. Keep the recorded execution checkout,
branch, ownership, and project hook contract. This operation performs mechanical
preparation and commit; successful commit does not establish semantic proof.

Resolve the applicable requirements from this project's execution context. Put
their inputs in a temporary JSON file outside the commit's owned paths, and put
the intended commit message in a separate file. Invoke the installed command
directly from the execution checkout:

```sh
node '<installed-execute-plan>/scripts/execution-increment-delivery.mjs' fresh \
  --mode story-branch --workspace '<execution checkout>' --branch '<recorded branch>' \
  --authority local-only --preparation-file '<requirements.json>' \
  --message-file '<commit-message.txt>'
```

Use `trunk` or `current-branch` when that is the established mode. The command
does not create a checkout or switch branches. It checks the recorded branch
before preparation. This local-only entry never fetches, pushes, starts an
observer, or registers a revision.

The preparation JSON supplies these fields; missing required context refuses
the attempt before project commands or staging:

| Field | Required input |
| --- | --- |
| `kind` | `planned` or `quick`, from the execution source. |
| `commit` | `agent` when [agent commits](agent-commits.md) applies; otherwise `git` for the ordinary Git contract, including caller-selected current-branch and one-shot work. |
| `generation` | Triggered generator operation, or an explicit `notRequired` reason when its trigger does not apply or compatible generation is already accepted. |
| `formatting` | This project's selective formatter operation, or an explicit `notRequired` reason when the project requires no formatting. Do not substitute hook-owned lint. |
| `summary` | Required project-summary mutation operation, or an explicit `notRequired` reason. Quick work must not invent an execution record. |
| `plan` | Required only for planned work: workspace-relative `path`, positive integer `slice`, and an executable `update` operation that performs the required plan/status mutation. Quick work omits this field. |
| `staging` | `ownedPaths`: exact workspace-relative files whose entire working contents you own and want staged; `stagedPaths`: exact files whose already-staged changes you own and want committed without restaging their unstaged bytes. Supply both arrays, even when one is empty. |

An operation is an object such as
`{"command":["executable","argument"],"timeoutMs":120000}`. Resolve the actual
executable and each argument for the project. `timeoutMs` is an optional positive
bound for that process. An inapplicable operation is
`{"notRequired":"the concrete applicability reason"}`; it cannot also carry a
command. A required plan mutation cannot use `notRequired`. File existence or
an unconditional caller success flag cannot stand in for its execution.

Each command runs directly with its argument array in the selected checkout,
without an implicit shell. If a compound project script is necessary, its own
terminal result must represent all required work. Do not make an output filter
the final status of a failed prerequisite. The maintained entry builds no such
pipeline and inspects each terminal result before proceeding.

Resolve any ambiguous staged ownership with its owner before invoking the
command. It refuses unrelated staged paths both before preparation and before
its own staging; it never unstages another writer's work. For separable changes
in a shared file, stage only your reviewed changes first and name that file in
`stagedPaths`. Do not name it in `ownedPaths`, which stages its whole working
content. Review the intended staged changes and project commands under the
existing delivery contract; the path lists are ownership declarations, not
semantic review or a sandbox for arbitrary scripts.

The command runs generation and formatting, checks planned obligations before
the plan/status mutation, runs that mutation and the applicable summary, and
checks the changed obligation record again. It then stages owned whole files,
runs real `git diff --cached --check`, and commits through `agentCommit` or
ordinary Git as resolved above. Project hooks remain enabled. Refused agent
identity never falls back to ordinary Git.

A successful result has `ok: true`, `report: committed-pending-publication`,
and `commit.sha`, the exact committed revision. `publication: pending` and
`observation: null` mean local-only work, with no remote acceptance receipt.
Keep that SHA for the later authorized publication boundary.

A failure exits nonzero and names its `operation` or commit `status`, error,
and available terminal exit/signal details. It withholds dependent work and
leaves preparation edits and staged content available for repair. Repair the
named operation, renew proof only where the repair invalidates it, then retry
fresh preparation. Do not undo owned edits or another writer's bytes merely
to clear this failure. An already-committed or accepted candidate instead uses
the existing [interrupted-publication recovery](trunk-publication.md#resume-an-interrupted-publication);
it does not need another fresh commit just to resume publication.
