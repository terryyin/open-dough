---
status: resolved
trigger: "fix ci"
created: 2026-09-15
updated: 2026-09-15
---

# Debug Session: fix-ci

## Symptoms

- Expected behavior: The GitHub Actions CI workflow passes on `main`.
- Actual behavior: The `test` job fails while `lint` passes.
- Error messages: `ERR_MODULE_NOT_FOUND` for installed `dough-execute-plan/scripts/ci-revisions.mjs`, imported by `ci-mailbox-store.mjs`.
- Timeline: The three most recent `main` runs fail; the preceding run passed.
- Reproduction: Run `npm test`; the first observed failure is `tests/execution-payload-update.sh`.

## Current Focus

- hypothesis: Confirmed: the execution skill imported `ci-revisions.mjs` without declaring it in the released payload.
- test: Install the candidate payload and exercise its relocated mailbox entrypoint.
- expecting: The installed entrypoint resolves every runtime dependency and exits successfully.
- next_action: complete

## Evidence

- timestamp: 2026-09-15
  observation: GitHub Actions run 34947926348 failed with `ERR_MODULE_NOT_FOUND` for installed `ci-revisions.mjs`.
- timestamp: 2026-09-15
  observation: Commit `b4b4363` created and imported the module but did not update the payload inventories.
- timestamp: 2026-09-15
  observation: Focused payload tests, lint, and the complete test suite pass after the payload declarations were corrected.

## Eliminated


## Resolution

- root_cause: `ci-revisions.mjs` was source-only, so installations omitted a transitive runtime dependency.
- fix: Declare and document `ci-revisions.mjs` everywhere the public execution payload is represented.
- verification: `npm run lint`, `npm test`, `tests/execution-payload-update.sh`, and `tests/dough-update-guidance-payload.sh` pass.
- files_changed: Installer and release payload declarations, shared payload fixture, extraction record, and installation documentation.
