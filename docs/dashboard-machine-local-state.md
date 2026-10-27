# Dashboard machine-local state

Part of the [project visibility requirements](project-visibility-requirements.md).
Their discussion status, scope, and source apply to this page.

## Limited machine-local state

Some operational state belongs to a development machine and its local
repository. It need not be committed to Git. Git-ignored files are one possible
representation; the storage mechanism is not selected here.

The first identified example is the default checkout's freshness and any
deferred refresh. The remote trunk is the integration authority under the
direction in [ADR 0009](adrs/0009-git-branching-and-integration.md).
Reconciliation and publication happen in owned workspaces. Preservation checks
protect the default checkout's files and Git state.

### Refreshing the default checkout

A default checkout is optional. After each trunk publication, attempt a
refresh of a supplied one; without one, refresh is not applicable.
A clean checkout that is only behind fetched trunk advances by fast-forward.
Pending edits, unpublished commits, active operations, or a checkout Git
cannot read or refresh preserve their state and produce a visible
deferred-refresh result. Publication success and checkout freshness are
reported separately. Neither a missing checkout nor a deferred refresh undoes
remote acceptance or blocks retiring owned workspaces, which runs from the
repository's own Git directory.

Before using the default checkout's revision as a new task's base, verify it
against freshly fetched trunk. A task can create its owned worktree directly
from the fetched base while checkout maintenance is pending. Including local
unpublished work requires a deliberate ownership and dependency decision.

### Quick edits in the default checkout

Allow short, prepared changes directly in a default checkout the developer
explicitly selects, under that task's established authority. Inspect the
current state, apply the bounded change, verify and commit only the authorized
result, and leave a recoverable state. Preserve other writers' staged and
working-tree content. Publication follows the shared remote publication
contract and its separately established publication authority.

“Quick” describes the operation's shape:

- The intended change is already decided and bounded.
- Required discussion and investigation are complete before the edit starts.
- The change can be verified and committed promptly.

Updating a known backlog field is a representative quick action. Story
refinement and slice planning use owned workspaces started from freshly fetched
remote trunk, whatever the default checkout's state. Reuse a suitable workspace
through related preparation, publish explicitly retained results to remote
trunk, then clean up when publication and session ownership permit it.
The origin-based dashboard observes the published records.

If a direct edit is interrupted or needs further discussion, preserve its work
and report its recoverable state.

### Coexistence with human edits and other tools

Human developers and other tools can change the default checkout at any time.
Inspect its state and revalidate before a mutation where practical. Preserve
unowned edits, staged content, unfinished Git operations, and unexpected branch
or revision changes; report the observed ownership issue and resume after it is
resolved. Re-read current state when resuming and reconcile the owned work with
fresh remote history.

Representative cases include a human's staged edit before refresh, a commit
made between an agent's inspection and its refresh, and an edit made during an
agent's direct edit. Each case preserves the human's work and the agent's prepared
result, with a visible maintenance outcome. Another agent's owned worktree can
continue publishing independently.

Detection of external edits is limited by observable state and races between
inspection and mutation. Refinement owns the precise checks and recovery
interaction.

## Combining the two sources in the dashboard

The dashboard should provide useful project visibility from repository state
alone. When it also has access to a machine's local operational state, it should
use that evidence to provide more detailed information about activity on that
machine, such as default-checkout freshness or a deferred refresh where those
facts are recorded.

| Source | Intended information | Availability |
| --- | --- | --- |
| Git origin | Durable published backlog and execution progress | Without access to a developer's local clone |
| Machine-local state | Default-checkout freshness and deferred refresh | When that machine's state is accessible |

The local layer supplements the repository layer; durable project progress
should not become dependent on the local layer.
