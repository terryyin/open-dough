# Dashboard Frontend Test

Frontend-only dashboard specs live here, beside [Dashboard Test Support](../test-support/) and
`../backend-tests/`. They run in Vitest browser mode and mount production
components with typed inputs, without starting `dashboardServer`, `fake-gh`,
`fake-claude`, `fake-codex`, or `FakeGitHub`.

## Placement

Put every spec and every module that registers test cases inside the folder
for the behavior it proves. The `dashboard/frontend-tests/` root is reserved
for this README and generated test output.

Use an existing feature group whenever it covers the behavior. Add a folder
only for a distinct area that none of the existing groups covers.

| Folder           | Behavior                                                      |
| ---------------- | ------------------------------------------------------------- |
| `configuration/` | Project setup, system settings, appearance and usage history. |
| `intent/`        | Intent browsing, Proof, CI comparisons and timing history.    |
| `launches/`      | Launch choices, instructions, startup and launch recovery.    |
| `navigation/`    | Dashboard frame, header, board movement and destinations.     |
| `review/`        | Story review, comparisons and diffs.                          |
| `sessions/`      | Session listings, status, completion and history.             |
| `stories/`       | Story content, notes and execution progress.                  |
| `terminals/`     | Terminal attachment, input, selection and recovery.           |
| `test-harness/`  | Tests of the mount helpers.                                   |

Reusable harness helpers and fixtures live in [Dashboard Test Support](../test-support/).

## Mounted specs

Every spec imports `test` from `vitest` and renders production components
and CSS with typed answers.

The mounted phone-board specs in `navigation/` render the production Board
in its scroll frame with typed published work and session data. They use
Chromium touch and keyboard input and measure the rendered layout.
[`e2e/navigation/phone-board.spec.ts`](../../e2e/navigation/phone-board.spec.ts)
covers the published-project load, board gesture wiring, vertical reading,
the thin indicator's real hit target and a reload's kept column through the
built app.

## Which entry a case uses

Mount the component that owns the behavior, in a Vitest browser-mode spec,
with typed inputs. A component that reads a service through a hook reads it
from the page's typed reads, which the case supplies, such as story notes
through `pageReadsSupplying({ storyNotes })` from
`test-support/component-mount/unreadPageReads.ts`. Use native keyboard or
pointer input only where native input is the behavior. Build domain data with the page-loadable MakeMe entry
(`Distribution/tests/support/pageMakeMe.mjs`).

Mount the component alone through `mountComponent`
([`component-mount/`](../test-support/component-mount/mountComponent.ts)),
which knows no component; a component that cannot stand alone is made to.
Operate it through small page objects beside the specs, one per part of the
component, as the Project Intent revision cases
(`intent/intent-revision-*.spec.ts`) do with
`intent/intent-browser-page.ts` and its siblings.

Act as the reader does, as soon as the page allows it. Render and deliver
input directly, with `IS_REACT_ACT_ENVIRONMENT` unset, and wait only for what
the action changes through retrying assertions (`expect.element`,
`expect.poll`). A synchronous read follows a retrying assertion on the same
render. Locator input such as `userEvent.click` already waits until its
target can take it. The Project Intent revision cases
(`intent/intent-revision-*.spec.ts`) are the example: rendering and
clicking without a settle wait cut their summed time by about a fifth.

Story Notes is the reference family:
`stories/story-notes-dialog.spec.ts` mounts the dialog,
`stories/story-notes-control.spec.ts` mounts the control, and one
step in
[`e2e/terminals/agent-terminal-lifetime.spec.ts`](../../e2e/terminals/agent-terminal-lifetime.spec.ts)
proves notes beside an attached terminal. Its service rules are proved in
`../backend-tests/review/`.

Dashboard Test Support is frozen: new cases add only MakeMe builders to
`../test-support/`.

Give every case a literal title. The runner names and selects cases from
the titles Vitest reads without running the file. Share common steps in a
helper and declare each case with its own title.

A behavior that needs the real page, such as a real page load or reload or
native input the mount cannot deliver, belongs to the representative
workflows in [`../../e2e/`](../../e2e/README.md).

## Running the tests

`npm run test:dashboard:frontend` runs the full group in Vitest Browser Mode.
Vitest launches Chromium through `@vitest/browser-playwright`.
The run reads the group's worker limit and
`OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS` settings. The unfiltered local run takes full-suite admission.
Failed runs keep their output under `test-results/`.

Select by file, `--grep`, or both, for example
`npm run test:dashboard:frontend -- intent/ --grep 'wording'`. Use `--list --reporter=line`
to see the selection.

CI runs this group as its own producer, the `dashboard-frontend` job, and
publishes its cases under the **Dashboard Frontend Test** entry and the frontend test proof
artifact.

`.github/workflows/ci.yml` declares each group's shards.
