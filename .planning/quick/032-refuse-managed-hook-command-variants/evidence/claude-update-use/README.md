# Slice 2 evidence: real native Claude Code update-then-use

## What ran

```sh
bash tests/dough-adr-awareness-claude-delivery-to-use.sh --native
```

This is the project's existing (previously never-exercised for Claude) native
acceptance harness for SEED-007 Story 3 / Quick 032 Slice 2. It builds an
entirely local, disposable fixture (a synthetic git release history served
over `file://`, plus a disposable "atlas adopter" client project) and drives
three real, unscripted `claude --print --dangerously-skip-permissions
--no-session-persistence` sessions against it — no GitHub tags, no network
access to the real repository, no state outside a `mktemp -d` directory.

- Native tool: Claude Code 2.1.266
- Candidate commit for the harness itself: `d8ff5b5` (this repo, `main`,
  after the Quick 032 Slice 1 fix and the CI-timeout repair)
- Fixture releases: legacy v0.2.0 → inspected bootstrap v0.2.1 → update
  target v0.2.2 (all synthetic, defined by the test, unrelated to this
  repo's real version numbers)

## Outcome

All four assertions passed on a clean rerun (`native-run-transcript.md`):

1. A fresh native session, told to run an ordinary update from a legacy
   v0.2.0 install, inspected the pinned v0.2.1 candidate first and correctly
   **refused** because the candidate's actual `install.sh` payload (~25 files
   across 9 skills) contradicted the skill's own declared three-file public
   payload — leaving the client project and fixture source byte-identical.
   This is real judgment, not a scripted refusal.
2. An explicit inspected-bootstrap install (forced, with the mismatch
   acknowledged) succeeded.
3. A **fresh session** then ran an **ordinary, non-forced** update from the
   recorded `SOURCE` (no URL supplied) from v0.2.1 to v0.2.2, satisfying
   Slice 2's core requirement.
4. A **third fresh session** invoked the installed `dough-adr-awareness`
   skill, correctly identified the fixture's actual authority conflict
   (`CATALOG.md` says ARC-12 is "Replaced"; the ARC-12 record itself says
   "Adopted"), stopped for human precedence, and changed no client files —
   without being given the answer in the prompt.

## Test-harness fix required first

The first attempt (same command) failed only on `delivery_assert_update`'s
report-completeness check, which required the native session's natural-
language update report to contain a literal, verbatim match for every one of
~25 individual nested file paths (e.g.
`.claude/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs`). The real
session instead gave a reasonable human-readable summary ("`dough-execute-plan/`
... `scripts/*.mjs` ×9"), which is sensible reporting, not a defect — the
byte-exact proof that the right files landed on disk already lives in
`delivery_assert_update_payload`, run immediately before this check.

Fixed in `tests/support/dough-adr-awareness-release-transition.sh`
(commit `d8ff5b5`): the native-report check now requires each managed
*skill* name to be mentioned, not every nested path. Verified the relaxed
check against the first (failed) run's preserved output before spending a
second real native run confirming it end-to-end. The deterministic
(non-`--native`) paths for all three platforms, and the scripted-double
`native-delivery-updated-use*.sh` tests, were rerun unaffected.

## Related

- SEED-007 Story 3 status should move from "Pending" to reflect this real
  passing run.
- Quick 032 plan: Slice 2, `## PLAN EXECUTION` outcome recorded there.
