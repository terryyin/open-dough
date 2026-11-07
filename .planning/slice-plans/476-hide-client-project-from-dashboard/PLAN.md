# Hide a client project from the dashboard while keeping it maintained

**Identity:** SEED-250#hide-client-project-from-dashboard
**Source:** [selected story](../../seeds/SEED-250-hide-client-project-from-dashboard.md#hide-client-project-from-dashboard)
**Source review:** [source review](source-review.md)
**Prepared:** 2026-11-07; preparation only. Execution is not authorized by this plan.

## Goal and boundaries

A maintainer can hide a configured project from dashboard project navigation and
later show it again, without removing it from machine-local configuration or
from release-update and maintenance inventories.

**Included:** Hide and show on each **System settings → Projects** row; clear
hidden state on that row; persistence in that environment's saved list; default
visible when the field is absent; removal from tabs, compact selector, and
Left/Right cycling; Board/Intent not presented for a hidden selected or deep-linked
project; selection fallback when the current or only projects are hidden;
Sessions sidebar may keep open sessions for a hidden project without restoring
selection chrome or Board/Intent; configured file membership and maintainer
inventory readers unchanged by hide/show.

**Excluded:** Maintenance opt-out; changing Add/Remove project beyond sharing the
same settings row; moving configuration out of machine-local
`projects-*.json`; redesigning Sessions sidebar filtering beyond the selection
rule; confirmation before hide; bulk hide/show.

**Failure policy:** [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to execution, verification, delegation, and repair handoffs.

**Local gate:** Focused dashboard Playwright selection for the new or extended
configuration journeys this plan owns, plus `npm run lint` and
`git diff --check` on touched paths. Broader `npm run test:dashboard` only when
a shared fixture or list loader change risks other consumers. For any long run,
follow the maintained
[macOS sleep guard and power condition](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or keep the
lid open under `caffeinate -i` and inspect the sleep log afterwards.

## Existing solutions and direction

- **Change the existing machine-local project configuration.**
  `dashboard/server/projectConfiguration.ts` already owns the per-environment
  saved list, schema, and seed rules. Add an optional visibility field there
  (absent means visible). Do not invent a second store, database, or
  browser-persisted authority.
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  already separates machine-local project configuration from observed
  repository workflow records; this field stays on that local list.
- **Split presentation from inventory without a second source of truth.**
  Today `publishedProjects()` feeds the client list that both
  `ProjectSelect` / keyboard cycling and `SystemSettings` (via `useProjects`)
  consume, while release/update and feedback maintenance skills read the JSON
  file directly. Extend configuration so settings rows (and other System
  settings needs such as feedback-maintenance host lookup) still see every
  configured project with its visibility, while tabs, compact selector,
  cycling, routing, and Board/Intent selection consume only visible projects.
  Prefer extending the existing list/settings endpoints and client helpers over
  a parallel catalog.
- **Reuse Remove project's settings-row and journey patterns.**
  `RemoveProject.tsx`, `project-remove.spec.ts`, and
  `PROJECT-CONFIGURATION.md` own the row layout, confirmation (for remove
  only), selection fallback when the selected row disappears, and persistence
  checks. Hide/show is a lighter adjacent control: reversible, no confirmation,
  same selection-fallback shape.
- **Accepted decisions.** ADR 0008 constrains storage and domain boundaries as
  above. ADR 0004's `.planning/open-dough.json` client configuration is out of
  scope. No exception or new North Star topic is warranted; the story's
  Architecture section already records the presentation-versus-inventory split.

## Decisive premises observed during preparation

Read-only observations in the established preparation workspace on 2026-11-07.

| Premise | Consuming operation | Observation and result | Remainder |
| --- | --- | --- | --- |
| Settings and navigation share one client catalog from `publishedProjects` | Slice 1 must keep settings (and feedback-maintenance host lookup) on the full configured list while filtering selection | `SystemSettings.tsx` and `FeedbackMaintenanceSettings.tsx` call `useProjects()`; `ProjectSelect.tsx` and `projectKeyboardNavigation.ts` do too; `useProjectConfiguration` loads `projectListEndpoint` → `publishedProjects()` in `projectConfigurationBoundary.ts` | Implementation must expose visibility and the full configured set to settings consumers; filtering only selection surfaces |
| Maintainer inventory reads the JSON file, not the filtered presentation API | Slice 1 proof that hide keeps inventory membership | `release-and-update-clients` SKILL.md reads `~/.open-dough/dashboard/projects-production.json` via the same resolver as `projectConfigurationFile` | Assert the saved file still holds the project after hide; no skill rewrite required for membership |
| Existing files without a visibility field remain valid and visible | Slice 1 defaulting and reload example | `projectSchema` in `projectConfiguration.ts` is a closed object of required identity fields only; an optional visibility field with absent = visible preserves current files | Write the optional field in schema and seed docs; no migration file rewrite |
| Configuration Playwright journeys are the outside-in proof home | Both slices' proof commands | `dashboard/tests/configuration/project-remove.spec.ts` already drives settings open, selection fallback, Sessions sidebar, and production file persistence under `npm run test:dashboard -- tests/configuration/…` | New hide/show journeys extend that home; quiet reporter suppresses `--list` titles, so titles are taken from the source files |

## Outside-in proof

| Source promise / examples | Owner and observable result |
| --- | --- |
| Hide/show in settings; clear state; persist; absent field visible (1–2, 7) | Slice 1: settings journey hides and shows a row, sees clear hidden state, reloads or restarts and keeps the choice; a saved project without the field stays selectable |
| Leaves tabs, compact selector, cycling; selection and deep-link rules; all-hidden empty Board with settings usable (1, 3–4, 7) | Slice 1: after hide, project absent from selection chrome and cycling; hiding the selected project selects another visible one; all hidden shows no Board/Intent; URL/prior selection of a hidden project does not present its Board/Intent; show restores navigation |
| Configured membership and maintainer inventory unchanged (6) | Slice 1: after hide, the environment's `projects-*.json` still contains the project with repository, ref, and local path; remove remains distinct |
| Hidden project's open session may stay listed without restoring Board selection (5) | Slice 2: with an open session for a hidden project, the Sessions sidebar can still show it; opening it attaches the session without putting the project back in tabs/compact selector or showing Board/Intent until shown again |

## Slices

### 1. Hide and show from settings with dashboard selection following visibility
Type: Behavior
Status: done
Proof:
- `npm run typecheck:dashboard` (pass)
- `npm run test:dashboard -- tests/configuration/project-hide.spec.ts tests/configuration/project-remove.spec.ts tests/configuration/project-configuration.spec.ts tests/configuration/system-settings.spec.ts tests/configuration/system-settings-look.spec.ts tests/configuration/system-settings-project-management.spec.ts tests/configuration/system-settings-project-management-touch.spec.ts backend-tests/project-configuration-boundary.spec.ts backend-tests/project-remove-boundary.spec.ts backend-tests/project-add-boundary.spec.ts tests/navigation/dashboard-header.spec.ts tests/navigation/dashboard-header-compact.spec.ts` (pass)
- `npm run test:dashboard -- tests/navigation/project-keyboard-navigation.spec.ts` (pass)

Behavior: Several projects are configured in one environment → the maintainer
hides one in **System settings → Projects** → that project leaves tabs, the
compact selector, and Left/Right cycling; its settings row stays with clear
hidden state and show; the saved file still lists it; reload keeps the choice;
entries without the field stay visible; hiding the selected project selects
another visible one; when every project is hidden, no Board or Intent content
is shown and settings remain usable; a URL or prior selection naming a hidden
project does not present its Board or Intent; show restores navigation without
re-adding the project.

Learnings: `PageFrame` already resolves `goToSession` project selection through
`useVisibleProjects()`, so Slice 2 only needs to add and verify the outside-in
Playwright journey for opening a hidden project's session from the Sessions
sidebar.

### 2. Opening a hidden project's session does not restore Board selection
Type: Behavior
Status: done
Proof:
- `npm run typecheck:dashboard` (pass)
- `npm run test:dashboard -- tests/configuration/project-hide.spec.ts tests/configuration/project-hide-sessions.spec.ts tests/navigation/dashboard-header.spec.ts tests/navigation/dashboard-header-compact.spec.ts` (pass)

Behavior: A configured project has an open session and is then hidden → the
session may remain listed in the Sessions sidebar → choosing it opens the
session's terminal or report without restoring the project to selection chrome
or presenting its Board or Intent while it stays hidden.

## Execution complete

Product advice: no change — the machine-local project visibility split between
configured inventory and visible dashboard presentation fulfills `SEED-250`
within ADR 0008 and leaves the current product backlog priorities unchanged.

Refactor disposition: `records-only` (touches only `PLAN.md` and `DearDough.md`).

## Current decisions

- Visibility is an optional field on each machine-local configured project;
  absent means visible. Production and development lists stay separate.
- Presentation filters visible projects; settings and file-backed maintainer
  inventory keep the full configured set. Hide does not equal Remove.
- No confirmation step for hide. No new ADR or North Star topic.

## Concern evidence

- Slice-plan refinement was not needed: two Behavior slices map to separate
  proof loops (settings/navigation versus sessions), share one configuration
  model, and stay inside the refined story outcome without fragmented or
  speculative structure.
- No remaining slice-specific concerns identified in this review.
