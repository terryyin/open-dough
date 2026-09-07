# Keep Donut's ADR adoption intact during a newer-release update

## Source and readiness

[SEED-006, Story 4](../../seeds/SEED-006-extend-adr-guidance-adoption.md#preserve-donut-adr-adoption-on-update).
Status: conditional follow-up; scope revised 2026-09-07, not executed. Replan
when replacement is complete and a real newer public release is available and
wanted. The former current-or-newer slice list is superseded.

## Intended outcome

Receive a wanted shared-guidance improvement in migrated Donut through the
ordinary updater while preserving retained ADR context, repaired callers,
original/link absence, and unrelated guidance.

## Boundaries for replanning

- Select one actual newer public release with a wanted payload improvement.
  Do not manufacture a release or a version-only fixture bump to run this story.
- Observe an ordinary native update with actual payload/version writes in each
  affected tool. Record old/new release identities, the wanted improvement,
  actual selected-root changes, and preservation of other tools and local work.
- Follow each update with fresh native ADR use to show that the installed
  improvement and adopted guidance work with the current live context.
  Missing host evidence stays pending; one host cannot prove another.
- Verify the retired original/link does not reappear and retained context and
  callers remain valid. Exclude new-match discovery, another cleanup pass,
  rollback machinery, generic migration, and new updater features.
- Reuse earlier no-op and release-contract evidence where unchanged. A
  current-version no-op is valid behavior but cannot complete this story's
  preservation-through-payload-writes promise.
- Preserve the first real adoption and planning-skill work independently;
  waiting for this release must not block their useful outcomes.
