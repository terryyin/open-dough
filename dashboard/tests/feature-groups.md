# Dashboard feature groups

Every integrated browser spec belongs to one feature folder: a representative
workflow under the repository's [`e2e/`](../../e2e/README.md) (**E2E Test**), a
detailed UI or mixed check awaiting conversion under this tree. Both use the
folders below. Case-definition modules live with that same feature; reusable
fixtures and support stay outside the groups, in this tree. The sibling `../frontend-tests/` suite is the independent
**Dashboard Frontend Test** entry (flat while it holds ten or fewer files) and
does not add another browser feature group here. The sibling `../backend-tests/`
suite is the independent **Dashboard Backend Test** entry and likewise does not
add a browser feature group.

| Folder | Responsibility |
| --- | --- |
| `configuration/` | Project registration, machine settings, credentials and preferences. |
| `stories/` | Published story facts, preparation, dependencies, assignments and progress. |
| `launches/` | Work initiation, startup choices, reconciliation and automatic triggers. |
| `sessions/` | Session discovery, status, recovery, completion, reports and history. |
| `terminals/` | Interactive attachment, input, dictation, resizing and reconnection. |
| `review/` | Story comparisons, diffs, commit ranges, landed runs and review marks. |
| `intent/` | Purpose browsing, Proof, CI judgments, timing and optimization candidates. |
| `navigation/` | Destinations, selection, history, paging, panels and focus. |
| `observation/` | Published-source consistency, freshness, refresh and read recovery. |
| `runtime/` | Serving, production updates and browser identity. |

Choose the feature whose behavior the test proves, irrespective of an older
filename prefix. For example, marking a session Done belongs to Sessions even
when its filename starts with `agent-terminal`; keyboard input belongs to
Terminals. Shared navigation mechanisms belong to Navigation; a feature's own
form or touch variant stays with that feature.

## Backend feature groups

`../backend-tests/` uses the same domain vocabulary for service behavior, with
eight feature folders and no browser-only `stories/` or `navigation/` groups.
Case-definition modules live with their owning feature. Shared dashboard harness
fixtures stay in this `tests/` tree.

| Folder | Responsibility |
| --- | --- |
| `configuration/` | Project registration, machine settings, credentials and preferences. |
| `launches/` | Work initiation, startup choices, reconciliation and automatic triggers. |
| `sessions/` | Session discovery, status, recovery, completion, reports and history. |
| `terminals/` | Interactive attachment, input, dictation, resizing and reconnection. |
| `review/` | Story comparisons, diffs, commit ranges, landed runs and review marks. |
| `intent/` | Purpose browsing, Proof, CI judgments, timing and optimization candidates. |
| `observation/` | Published-source consistency, freshness, refresh and read recovery. |
| `runtime/` | Serving, production updates and test harness operation. |

All three test roots retain the [shared run and CI schedule](shards.md); feature
folders do not create additional builds, workers, shards or test cases.
