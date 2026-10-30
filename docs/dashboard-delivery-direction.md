# Dashboard delivery direction

Part of the [project visibility requirements](project-visibility-requirements.md).
Their discussion status, scope, and source apply to this page.

## Two stages of the direction

### Stage 1: published Git state across independent machines

Build the initial story perspective using only state published to Git origin:
remote branches and their committed contents and history. Treat developers as
working on separate machines, with no shared local checkout or operational
state available to the dashboard. This is the first stage's working model, not
a requirement to place agents on physically different machines.

All state used to depict progress in this stage must be available from origin.
Unpushed commits, working-tree edits, local branches, locks, and live agent
sessions cannot supply required information. The dashboard may fetch or cache
remote Git data; it must not need access to a developer's clone. Its view shows
published progress, not necessarily the latest work occurring on a machine.

This stage shows concurrent work published from independent clones or local
worktrees. Synchronization uses the common remote Git publication contract;
the dashboard reads its published evidence.

### Stage 2: multiple agents sharing one machine

Extend local visibility to multiple agents working in separate worktrees of the
same repository. Use machine-local evidence to show the default checkout's
freshness and any deferred refresh. Each owned workspace publishes through the
same remote Git contract used across independent machines.

The remote Git view remains independently useful, with local information
supplementing published progress.

These stages describe the intended order of capability development. They do
not commit to building the product intent or structural perspectives, or make the
exploratory mailbox and takeover mechanism prerequisites for Stage 1.

### Initial application constraints

Initially, the observed client project is hardcoded in the Open Dough dashboard
project. For the first story, Terry selected Open Dough's public GitHub `main`,
with local launch and no sign-in or hosted deployment. Authoritative state stays
in the observed repository. There is no
application/server database or separate persistent project-state store;
disposable browser storage for preferences or cache is permitted if useful.

The delivered [story dashboard](../dashboard/README.md) observes Open Dough,
Doughnut, and Pygardon, one selected project at a time. Its project catalog and
access boundary supply published records for the selected project.

The implementation should have very strong typing. The
[dashboard technology recommendation](dashboard-tech-stack.md) proposes the UI,
runtime-validation, and test tooling; it remains a recommendation rather than
an accepted ADR or implemented stack. Playwright was the user's initial
candidate, with alternatives welcome. The living
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md) guides the interface
and evolves as the dashboard is used. Its design hypotheses are revisable.
