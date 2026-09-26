# Prove each shared protection in both skill roots, and clear plan 108's residue

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/109-complete-payload-update-owners/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"483da2ff596b9c8fe08c5f354ec32dcf735eccf6773253a435f4bd0766588df8"}}
```

## Source

Execution retrospective of story `SEED-037#fewer-installer-runs-per-promise`,
executed through plan 108 on `claude/108-fewer-installer-runs-per-promise`.
Both are recoverable from before-cleanup commit `43e306c`:
`.planning/quick/108-fewer-installer-runs-per-promise/PLAN.md` and story 4 of
`.planning/seeds/SEED-037-quiet-stable-fast-tests.md`. Reviewed commits
`c7112a5`, `3dc3e85`, `9d0cc88`, `975a27a`, `da8f86a` (claim `1c8e8af`, start
`fa1549a`). Findings were rechecked for this plan at `da8f86a`.

The story promise this correction completes: "Each shared installation and
update protection is proved once by its owner." Plan 108 removed the Cursor-only
edit/remove matrices, which were the only ordinary-update refusal and
`--force` restore proofs in the non-entry root. The named owners prove those at
the entry root only.

## Goal and scope

**Beneficiary and outcome.** Agents and developers relying on the test suite:
every shared protection plan 108 consolidated is proved by its named owner at
the same boundary the removed copies covered, including the sibling skill root,
with no added installer or updater runs; and the checks plan 108 edited carry no
stale lint directives, delivery sequence numbers, ordering data, or declaration
claims.

### Current findings (at `da8f86a`)

- **F1. Sibling-root ordinary-update protection is unproved.** Both cases in
  `tests/update-refuses-unverifiable.sh` (`'edited managed file'` :110,
  `'missing managed file'` :118) change `.agents/skills`, and both
  `tests/update-force-restores-latest.sh` cases (:117, :133) restore
  `.agents/skills`. The removed matrices (plan 108 slice 2, `9d0cc88`) made
  `apply` refuse and `apply --force` restore a changed `.claude/skills` file
  after a Cursor-hinted install. Repeat install already has a sibling-root
  owner (`tests/install.sh`'s removed-file case, `.claude/skills`).
  `all_destinations_for` (`src/install/open-dough-release-apply.sh:145,293`)
  walks every root the same way, so risk is low, but the owner no longer proves
  the promise at that boundary.
- **F2. The repeat-install edited-file owner does not observe "without
  writes".** `tests/install.sh`'s edited-file case asserts the refusal, the
  edited file, `VERSION`, and sentinels, but no whole-target
  `snapshot_path_state`; its new removed-file neighbour does. Plan 108's commit
  `9d0cc88` names `install.sh` as the repeat-install refusal owner.
- **F3. Residue in checks plan 108 edited.**
  - Unneeded `SC2154` disables on line 2 of `tests/execution-payload-update.sh`,
    `tests/product-backlog-payload-update.sh`, and
    `tests/retrospective-reference-payload.sh` (ShellCheck reports no SC2154
    without them; unneeded since before `fa1549a`).
  - `tests/product-backlog-payload-update.sh` header and body name delivery
    sequence numbers ("slices 1-4" :7, "Slice 12" :17, :127) in a header plan
    108 edited.
  - `tests/longest-first` still places the four payload-update checks first
    (positions 1, 2, 3, 7), though paired medians are now 10–17 s each.
  - `.agents/skills/release-version/SKILL.md:13` tells the maintainer to check
    that `install.sh` and `src/install/open-dough-release-version.sh`
    declarations agree; only `install.sh` declares managed files
    (`read_managed_files_declaration`, `src/install/open-dough-release-version.sh:12`).

### Included

- F1: move one existing case in each update owner to the sibling root so each
  owner proves its protection in both roots, with no new installer or updater
  run.
- F2: give the repeat-install edited-file case the same whole-target snapshot
  observation as the removed-file case.
- F3: remove the stale disables and sequence numbers, reorder
  `tests/longest-first` from a fresh timing, and correct the release-version
  skill's declaration sentence.

### Material exclusions

- `docs/adrs/0003-tagged-release-versioning-accepted.md:22` states the same
  stale "matching declaration" claim; Accepted ADR text is a human decision
  and is reported to the maintainer, not edited here.
- `tests/update-adds-new-payload-skill.sh` hand-building its releases and
  re-proving update-time collision refusal; plan 108 excluded checks outside
  the payload-update family, and whether to include it is a product choice
  sent to story wrap-up.
- `tests/install-all-tools.sh`'s partly overlapping repeat-install case (it
  also owns hook non-duplication), adopting `init_fixture_repo` elsewhere,
  sequence numbers outside the files plan 108 edited, and per-platform run
  reduction.
- Any change to installer or updater behavior; retries, skips, or loosened
  assertions.

### Preserved promises

Every assertion the owners make today stays, including entry-root coverage:
each owner keeps one case at `.agents/skills` and moves the other.

## Context and architecture

- Owners (PFE, plan 108): ordinary-update refusal `update-refuses-unverifiable.sh`
  (`assert_ordinary_update_refuses_unwritten`), force restore
  `update-force-restores-latest.sh` (`assert_force_success`), repeat install
  `install.sh` (`assert_repeat_install_refused`), collision
  `story-payload-update.sh`. Reuse their helpers; add no new check file.
- A Cursor-hinted install populates both `.agents/skills` and `.claude/skills`
  (the removed matrices edited `.claude/skills` after
  `install.sh --platform cursor`). Confirm for each moved case that the chosen
  target has both roots before editing.
- ADR 0004 (managed payload, ordinary update stops on changed or missing files,
  `--force` overwrites) is the decision these owners prove; no ADR or North
  Star change.

## Outside-in proof

| Finding | Slice | Observation |
| --- | --- | --- |
| F1 | 1 | `update-refuses-unverifiable.sh` refuses a changed `.claude/skills` file with the snapshot unchanged; `update-force-restores-latest.sh` restores a `.claude/skills` file byte for byte; each keeps its `.agents/skills` case |
| F2 | 1 | `install.sh`'s edited-file case asserts an unchanged whole-target snapshot |
| F3 | 2 | ShellCheck clean without the disables; no `[Ss]lice [0-9]` in the backlog check; `tests/longest-first` matches a fresh `OPEN_DOUGH_TEST_TIMES` order; the release-version skill names `install.sh` as the only declaration |

Run counts in the four payload-update checks and the owners do not rise.

## Current decisions

- Move existing cases rather than add sibling-root cases, so no installer or
  updater run is added.
- ADR 0003's stale sentence goes to the maintainer, not into this correction.

## Ordered slices

### 1. Each shared protection's owner proves it in both skill roots

Type: Behavior
Status: planned
Proof:
- `update-refuses-unverifiable.sh`: one of the two cases changes a file under
  `.claude/skills` and still asserts refusal, the message, an unchanged
  snapshot and mtimes, and no install trace; the other stays at
  `.agents/skills`.
- `update-force-restores-latest.sh`: one case restores a changed or removed
  `.claude/skills` file, observed byte for byte through `assert_force_success`
  or `assert_payload` on that root; the other stays at `.agents/skills`.
- `install.sh`: the edited-file case takes `snapshot_path_state` before the
  refused repeat install and asserts it unchanged after.
- A mutation that skips the sibling root in the updater's changed-file check
  (temporary, reverted) fails `update-refuses-unverifiable.sh`.
- The three owners pass under Bash 5; installer and updater run counts are
  unchanged.

Behavior: a developer edits or removes a managed file in either installed skill
root → ordinary update and repeat install refuse without writes and `--force`
restores it, each observed by its one owner at that root.

### 2. The checks plan 108 edited carry no stale residue

Type: Structure
Status: planned
Proof:
- ShellCheck with the repository `.shellcheckrc` passes on the three payload
  checks without their `SC2154` disables.
- `tests/product-backlog-payload-update.sh` names capabilities, not delivery
  slices, and passes.
- `tests/longest-first` is reordered from a fresh `OPEN_DOUGH_TEST_TIMES` run,
  keeping its 10-second rule.
- `.agents/skills/release-version/SKILL.md` names `install.sh`'s
  `managed_files` as the one payload declaration.
- The complete local suite passes silently.

Structure: removes stale knowledge exposed by plan 108 so the next reader of
these checks and the release procedure is not misled; no behavior changes.

## Promise ownership

- Sibling-root refusal and restore, and the edited-file snapshot: slice 1.
- Residue: slice 2.
- Deferred promises have no slice.

## Preparation review

- Two slices, each one proof loop. Slice 1 changes three existing test files
  and adds no check or run; slice 2 is documentation, directives, and ordering
  data, justified as Structure because plan 108 made each item stale or exposed
  it.
- No slice-specific concerns remain from this review.

## Learnings
