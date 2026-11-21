# Story Note edits sharing a version timestamp

GitHub Actions run 44863417059, attempt 1, job 136721664334 on published
`a9006dc54559cae8f5bf70b9cc2b4050ca327e13` failed in
`dashboard/backend-tests/review/story-notes.spec.ts` at the distinct
`editedAt` assertion for two successful edits. Full diagnostic is in the
checkout's Git evidence directory. The first diagnostic fetched while two
other jobs were still in progress, so it cannot account for their outcomes.

The published chart migration touched none of Story Notes. The current
settings changes are parked by the installed CI stash command at OID
`9d8c1bae315120c27f6d0a495d3c539c5aa09a51`. No other active owner of
this repair is known.

## Round 1

The edit uses the wall-clock timestamp as the version that a follow-up
delivery compares against. Two edits made within the same millisecond
can have identical versions. Fix Date alone at a known instant for the
existing delivered-note case and run that named case once before any
production repair. The changed test must match the CI equal-version
assertion. A confirmed repair must keep the version distinct from the
previous version and the delivered version while preserving the stored
ISO timestamp contract. Prove the selected behavior again, trace
note delivery and UI consumers, and run required affected proof.

Round 1 confirmed the CI assertion in one forced reproduction at the
published story HEAD before changing production. With Date fixed to
`2026-11-17T00:11:00.000Z`, both successful edits returned that same
value. One selected case failed and eight were skipped. The proof is
`ci-note-edit-version-before.log.run.json`. The diagnosis took 1.9 active
minutes and the repair now has its own slice clock.

## Repair proof

The serialized write now advances the note version beyond the saved,
current and delivered timestamps when the wall clock does not.
The fixed-clock check observes distinct timestamps and reads the new note
back as waiting. The real admission, delivery and follow-up checks, mounted
Stories and built-app Attach cases, and dashboard typecheck passed.
See `ci-note-edit-version-repair.md` in the checkout's Git evidence.
The terminal run inventory showed only the one failed backend shard.
