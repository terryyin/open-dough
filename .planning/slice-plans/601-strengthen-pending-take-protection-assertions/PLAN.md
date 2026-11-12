# Strengthen pending Take protection assertions

**Identity:** SEED-327#strengthen-pending-take-protection-assertions
**Source:** [Strengthen pending Take protection assertions](../../seeds/SEED-327-strengthen-pending-take-protection-assertions.md#strengthen-pending-take-protection-assertions)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers of the Dashboard's launch protection see a regression that drops
source links or Select story from a protected card after the stale read, on
the Backlog card and on the Taken card alike. In the pending Take
reconciliation check of
`dashboard/tests/launches/responsive-session-reconciliation.spec.ts`, each
protected state after the stale read (failed comparison, unrelated revision,
partly read Taken card) observes the shared `expectProtected` from
`dashboard/tests/responsiveStart.ts`, and the file-local
`expectActionsUnavailable` is deleted.

Product code is unchanged. The overlapped settle waits, single board
preparation, reloads, and exact comparison list that SEED-303 left in this
check stay; its 45-second and busy-ratio measure is not reopened. Pinned
deployment, Taken profile mark reductions, and the SEED-311–315 families are
untouched.

## Architecture and PFE

The solution already exists: `expectProtected` is the one protection
observation the other launch checks share (ten spec and support files import
it). This work reuses it and removes the only thinner duplicate. No ADR,
North Star topic, or new structure is involved. The spec is 245 lines and
shrinks; `responsiveStart.ts` (194 lines) is not edited.

## Outside-in proof ownership

All promises belong to slice 1.

| Promise | Observable proof in slice 1 |
| --- | --- |
| Partly read Taken card shows Inspect story disabled, Select story enabled, and its Canonical-record link | The pending Take check calls `expectProtected(takenStory)` while the seed read is held, and passes. |
| A Taken-only source-link omission fails the check | Scratch fault below, reverted: the check fails inside `expectProtected` at the partly read Taken state. |
| Failed-comparison and unrelated-revision Backlog states keep Select story and the Canonical-record link | The same check calls `expectProtected(story)` in both states and passes. |
| Stale-read observation and exact comparison list are unchanged | Existing assertions in the same check stay and pass; the sibling refinement check in the file passes. |

## Ordered slices

### 1. Observe full protection in every post-stale state of the pending Take check
Type: Structure
Status: done
Proof: The file-level command below passes with both checks; the scratch
fault fails the pending Take check at the partly read Taken state and is
reverted before commit.

Structure: an evidenced test-suite correction. The weakness removed is that
the check stays green when a protected Taken card omits its source links
(Intent Coverage at `3e8a3e7c1e47219d904a68fcadae67fee584911d`, reproduced in
the premises below). Product behavior is preserved and unchanged.

- Replace the three `expectActionsUnavailable` calls (after the failed
  comparison, after the reload that reads the unrelated revision, and on
  `takenStory` while its seed is held) with `expectProtected`.
- Delete `expectActionsUnavailable`, its comment, and the then-unused
  `Locator` type import.
- Change no wait, reload, hold, or request sequencing.
- Scratch fault, never committed: in `dashboard/src/StoryCard.tsx` change
  `{!inspected && starting && (` to
  `{!inspected && starting && offersStart && (`, run the focused command,
  observe the failure at `expectProtected` called for `takenStory`, then
  `git checkout -- dashboard/src/StoryCard.tsx`.

Accepted proof (2026-11-12, load about 23–36, `env -u` prefix): the
file-level command passed both checks (exit 0, 2 passed); typecheck passed;
the scratch fault failed the focused check at `responsiveStart.ts:142`
`toBeVisible` called from spec line 139 `expectProtected(takenStory)`, and
`StoryCard.tsx` was restored with an empty diff. The clean focused check took
8.8 s against the thin form's 8.7–9.2 s. The calls now sit at spec lines 114,
124, and 139. Consumer trace (terms `expectActionsUnavailable`,
`expectProtected`): `expectProtected` importers excluded because its
definition is unchanged; `expectActionsUnavailable` had no code consumer
outside this spec. Refactor pass: no edits.

## Consumer trace and local gates

`expectActionsUnavailable` is declared and used only in this spec; nothing
else observes it. `expectProtected` and product code are not edited, so no
other check's boundary is reached. Keep the consumer-trace record from
execution; an empty record keeps this focused proof.

```sh
npm run --silent test:dashboard -- --workers=1 --reporter=list --grep "responsive-session-reconciliation\.spec\.ts"
npm run typecheck:dashboard
```

Focused single-check form, used for the scratch fault:

```sh
npm run --silent test:dashboard -- --workers=1 --reporter=list --grep "a Take.s older snapshot arriving late"
```

When the harness sets `NO_COLOR` or `GIT_ALTERNATE_OBJECT_DIRECTORIES`,
prefix the dashboard commands with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
Typechecking covers the removed import. The staged lint hook covers the
changed spec. A full local suite is not required: only one spec's assertions
change and no shared helper, fixture, or product file does. Published CI
failures remain owned.

**Local gate:** prepare the execution checkout with
`node scripts/setup-native.mjs npm`, `browser`, then `check`, and run the
commands above there. These runs take well under a minute; for any longer
macOS run start fully awake and on AC wrap it in `caffeinate -s -i`, on
battery plug in or keep the lid open under `caffeinate -i` and inspect sleep
logs, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Never sleep, use `test.slow()`, or add suite, file, group, or hook timeout
overrides; keep the default timeout.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and must accompany every delegation and repair handoff.

## Decisive premises and observations

Observed in this preparation's workspace at
`f54fd4fc474f0315de8619bbde6077aa9b797401` on 2026-11-12, AC power, one
worker, load about 4–6, with the focused single-check command above under
the `env -u` prefix. Every scratch edit was reverted afterwards.

| Premise | Consuming operation and observation | Result |
| --- | --- | --- |
| `expectProtected` passes in all three post-stale states, including the partly read Taken card | Scratch-replaced the three calls with `expectProtected`; ran the focused command | Exit 0, 1 passed, check 9.5 s |
| The strengthened check fails on a Taken-only source-link omission | Same scratch spec plus the `offersStart` scratch fault in `StoryCard.tsx`; ran the focused command | Exit 1: `expect(locator).toBeVisible()` "element(s) not found" at `responsiveStart.ts:142`, called from the spec's `takenStory` call (then line 149) |
| The current thin check misses that fault | Original spec plus the same scratch fault; ran the focused command | Exit 0, 1 passed, check 8.7 s |
| Restoring the assertions adds no material time | Check durations above against SEED-303's retained 9.2 s focused run of the thin form | 9.5 s strengthened against 8.7–9.2 s thin, within run-to-run spread on a loaded host |

No premise remains unverified. The sibling refinement check and typecheck
were not run in preparation; they do not depend on this change beyond the
removed import, which typecheck observes in slice 1.

## Current decisions and preparation review

- All three post-stale states use `expectProtected`, not only the Taken one:
  it removes the duplicate helper, and the observed cost is nil.
- The slice is Structure owning a test-suite correction directly; it adds no
  product promise.
- No blocking dependency or trunk-only action was identified. Execution mode
  and implementation authority remain with the later execution instruction.
- Slice-plan refinement was not needed: one bounded correction in one file
  with one proof loop; no remaining slice-specific concern was identified.

## Story obligations

### G1. Backlog-state detection not scratch-faulted (reported in slice 1 return)
Reported: slice 1 — "no scratch fault was run against the Backlog card's links or Select story. Detection there rests on the assertion executing and passing on the correct product."
Story clause: "Maintainers of the Dashboard's launch protection see a regression that drops source links or Select story from a protected card after the stale read, on the Backlog card and on the Taken card alike."
Disposition: proved by slice 1: spec lines 114 and 124 call `expectProtected(story)` in the failed-comparison and unrelated-revision Backlog states (file-level run, 2 passed); the same `expectProtected` link assertion at `responsiveStart.ts:142` fails with "element(s) not found" when the link is absent (scratch-fault run, failure from spec line 139), and `selectStory(card)` `toBeEnabled` at `:133` with the one-enabled-button count at `:132` run in every state. Inspected path: both Backlog states render through the same protected StoryCard branch the stale-read call at line 102 already observes, so a drop there fails the executed assertion.
