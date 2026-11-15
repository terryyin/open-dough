# Slice 1 scratch-break records

## Moved assertion: failed persistence preserves prior history

- **Starting test:** `usage-persistence` — preserves prior readable history on
  failed persistence and retries once.
- **Surviving test:** `usage-snapshot-failures` — `manifest publication failure
  keeps the previous snapshot readable and retry retains each response once`
  (parameterized; also covers page failure). Setup differs by folding status /
  stderr checks and a second idempotent rerun onto the snapshot-failure case.
- **Product rule broken:** in `dashboard/server/durableJsonReplacement.ts`,
  wrote the replacement bytes to the final `file` path before `rename`, so an
  injected rename failure still left the new snapshot readable.
- **Command:**
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/usage-snapshot-failures.spec.ts -g "manifest publication failure" --reporter=list`
- **Observation:** failed at `expect(readImported(home)).toEqual(before)` —
  history included response `two` / output `3` instead of the prior snapshot.
- **Revert:** restored `durableJsonReplacement.ts` from the pre-scratch copy
  (no lasting product change).
