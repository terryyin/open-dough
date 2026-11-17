# Source review

**Launch:** fresh general-purpose reviewer (Agent tool, no inherited context, no
fork or resume) on 2026-11-17, given only the story's Goal, Scope, scope limits
and key examples from
[SEED-334#move-navigation-checks-and-retire-integrated-ui-test](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-navigation-checks-and-retire-integrated-ui-test),
with instructions to read no files and change nothing.

Unnumbered context (as returned): the 30 of 41 specs and 4,627 lines are
baselines; the source, story-card, notification and story-reference specs and
the group's retirement belong to SEED-334#retire-integrated-ui-test-and-its-documents;
no change to `integratedStateCompletion`, product behavior, groups or tiers,
speed or shard targets, E2E naming or tagged-install proof (exclusions).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | The 30 navigation specs (`accessible-board*`, `board-*`, `side-panel-width*`, `development-intent-frame*`, `dashboard-header*`, `frame-*-look`, `project-*`) are converted; Board, side-panel, frame, header and project navigation protection lives in maintained Frontend, Backend or E2E homes and no longer depends on the Dashboard Integrated UI Test group. | slice 7 |  |
| 2 | Every distinct assertion in those specs keeps a named home at its real boundary, including keyboard/touch, focus, geometry, real browser storage/reload, non-eager read counts and held/failed recovery. | slice 7 |  |
| 3 | Each interim case is removed only after its replacement passes. | slice 7 |  |
| 4 | The interim group stays runnable for its remaining specs; its CI shard declarations and runner examples follow the files that remain ("the interim command no longer lists any of the 30 files while its other specs still run in their declared shards"). | slice 7 |  |
| 5a | `board-kept`: the chosen Board columns stay across a project switch, in a named Frontend case against real browser storage, with the interim file gone. | slice 2 |  |
| 5b | `board-kept`: the chosen Board columns stay across a reload, in a named Frontend case against real browser storage, with the interim file gone. | slice 2 |  |
| 5c | `board-kept`: the chosen Board columns stay in a wide Board, in a named Frontend case against real browser storage, with the interim file gone. | slice 2 |  |
| 5d | `board-kept`: a position kept under the former key is recovered once, in a named Frontend case against real browser storage, with the interim file gone. | slice 2 |  |
| 6 | A divider-chosen side-panel width is recovered after a reload within the room there is now, never replaced by an imposed width or Maximize. | slice 4 |  |
| 7 | The side panel starts at half the room where storage is refused or unusable. | slice 4 |  |
| 8 | The side-panel rules in 6 and 7 keep Frontend homes, with the covering variant's narrow-window and wide-window recovery beside them. | slice 4 |  |
| 9 | Help, editing, other arrow controls and modified arrows leave the selected project unchanged. | slice 7 |  |
| 10 | Focus stays usable across keyboard project switches. | slice 7 |  |
| 11 | A held previous read stays isolated. | slice 7 |  |
| 12 | The project-navigation rules in 9–11 keep homes at their real boundaries. | slice 7 |  |
