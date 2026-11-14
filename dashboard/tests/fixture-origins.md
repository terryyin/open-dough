# Shared fixture origins

An installed start names the MakeMe repository description its origin starts
with, at the `startOrigin` call or in its origin fixture's option, which a spec
overrides with `test.use`; with none, the origin holds an empty valid backlog.
The harness adds `.gitignore` and the installed skills to the description's
first commit. The runner packs the default and the shared queued description
once per requested layout, Claude or Codex/Cursor, from current working-tree
skills (`support/startOriginPreparation.ts`). A description sharing their
first revision starts from that origin, its checkout pushing the later ones,
each on the parents it names; another is materialized privately on that
installation, once per process.
A worker may also keep the origin one start of a description left
(`keepStartedOrigin`), as it does for the kept published story
(`support/keptPublishedStory.ts`); later starts of that description in the
worker are copies of it and push nothing.
Tests clone private copies with independent objects, refs, config, indexes and
HOME. Nested configurations can inherit the outer runner's artifacts. Without
an owner, a start prepares only its layout and removes that preparation after
initialization. An explicit prepared-origin fixture path takes precedence.

The story-columns journey (`launchJourney.ts`) shares its queued, preparing
and taken revisions the same way: the runner prepares that history once as a
snapshot (`story-columns-prefix`), and the shared materializer copies it into
each worker's own origin and checkout before committing that worker's
completion revision (`Distribution/tests/support/repository-fixture.mjs`). Without an
owner, or for a description with other leading revisions, the worker builds
the whole history itself.
