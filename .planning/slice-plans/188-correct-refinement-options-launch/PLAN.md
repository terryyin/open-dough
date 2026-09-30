# Correct the refinement options launch after its outcome review

## Source and authority

- **Identity:** SEED-061#correct-refinement-options-launch-follow-ups
- **Source:** [correction story](../../seeds/SEED-061-refinement-options-from-dashboard.md#correct-refinement-options-launch-follow-ups),
  a bounded retrospective correction of the completed execution of
  SEED-061#select-refinement-options-from-dashboard
  (plan 185, all 7 slices done, commits `06c65127..77348819` on
  `claude/select-refinement-options-from-dashboard`; its story and plan are
  recoverable from commit `8b7476fd6306f3da875186d7ce7f1d7dd6dc53b9`, at
  `.planning/seeds/SEED-061-refinement-options-from-dashboard.md` and
  `.planning/slice-plans/185-select-refinement-options-from-dashboard/PLAN.md`). That story's contract and
  manifest are provenance; its promises are not changed.
- **Authority:** A parent-agent request for planning only (2026-09-30). This plan
  grants no implementation, Take, queueing, or publication.
- **Preparation:** Owned workspace
  `.worktrees/select-refinement-options-from-dashboard`.

## Goal and scope

One bounded correction outcome: the launch options feature keeps its delivered
promises and fixes four findings of the outcome review, without changing
selection rules.

Excluded (dismissed by the review): refusal shown on the card rather than the
dialog, which is not a promise gap; this repository's own installed refinement
definition lacking `summary`, since installed copies change only from a released
payload (AGENTS.md).

## Preserved promises and constraints

From the delivered story, unchanged: options compose unless in an exclusive
group; nothing is dropped silently; the boundary validates against the installed
definition before any `claude` runs; with no selection the launch is exactly
today's; the shipped definition is checked against the shared schema. Follows
ADR 0002 and ADR 0006 (skill text for the executing agent, no maintainer
vocabulary). No Accepted ADR conflicts; none is proposed.

## Current findings (rechecked 2026-09-30 against current files)

1. **Stale kept selection.** `LaunchDialog.tsx:105-110` seeds `selected` from
   `kept` unfiltered and builds `flags` by filtering the offered options against
   it; `onStart` sends `flags` (`:133`). A kept flag the current offer lacks is
   neither rendered, shown in the command line, nor sent, and the dialog does not
   say so, contrary to "nothing is dropped silently". The existing test
   `agent-launch-options-exclusive.spec.ts` ("a launch the boundary refuses...")
   drops `--c` from the definition after the dialog offered it and reopens, but
   asserts only that `--a` returns.
2. **Test cost.** Pure-rule cases run through HTTP and a synthetic `claude`,
   doubled across dev and preview, in `agent-launch-options-boundary.spec.ts`
   and `agent-launch-options-groups.spec.ts`. Their outcomes are decided by the
   pure `optionsDefinitionSchema`, `selectionProblems`, `inDefinitionOrder` and
   `withChoice` in `dashboard/src/commandOptions.ts` and, for the options list
   shape, `launchOptions` in `dashboard/src/agentLaunch.ts:182-186`.
3. **Skill text.** `src/skills/dough-story-refinement/SKILL.md:57-59` says
   "Options listed in the same group are exclusive" without saying that a group
   is the `groups` field of `references/refinement-options.json`.
4. **Wording.** The dialog line reads "the installed dough-story-refinement skill
   in this project options file is not valid" (and "...options file defines
   another command", "...options file could not be read"): `optionsLine`
   (`StartLaunch.tsx:33-50`) appends the boundary's `why` (`noOptionsFileWhy`,
   `commandOptions.ts:157`; `launchOptions.ts:45-61`) after "in this project".
   The boundary refusal has the same shape ("...in ~/git/open-dough options file
   is not valid"), and `dashboard/AGENT-LAUNCH.md:76-80` documents the same
   strings.

## Decisions

- **Finding 1:** say it, do not silently prune. Once the offer is read, the
  dialog shows one quiet line under the options, "Not offered any more, so not
  sent: --c." naming each kept flag the offer lacks, in the kept order. It
  covers a definition that dropped the option, an empty offer and an unavailable
  definition (all kept flags are then absent). While the offer is still
  "Reading options…", no note. The selection sent is unchanged (only offered
  flags), so the boundary's rules and launch records do not change. Pruning
  alone was rejected: it is today's behavior and gives the developer no word.
- **Finding 4:** the reason becomes a predicate that reads after "skill in
  <place>": "has no options file", "has an options file that could not be read",
  "has an options file that is not valid", "has an options file for another
  command". One wording owner (`commandOptions.ts`, where `noOptionsFileWhy`
  lives) used by the dialog, the boundary and the guide.

## Outside-in proof

Run Playwright from the workspace root:
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/<file>`.
Observed 2026-09-30: `agent-launch-options-exclusive.spec.ts` passes quietly on
the current tree in about 7 s, so the page journeys run locally.

| Promise | Signal |
| --- | --- |
| A kept flag the project no longer offers is said, not dropped silently | Extended `agent-launch-options-exclusive.spec.ts` refusal test: after the refusal, the reopened dialog shows `--a` checked, the line "Not offered any more, so not sent: --c.", the command line without `--c`, and Start launches with `--a` only |
| One grammatical unavailable reason everywhere | Same file's `unavailable` cases assert the dialog line; `agent-launch-options-boundary.spec.ts` and `agent-launch-options-groups.spec.ts` assert the refusal text |
| The skill names where groups live | Behavior review per AGENTS.md: a request naming two flags of one group in a definition with `groups` leads the agent to the `groups` field and the conflict report |
| Pure rules keep their coverage with fewer, cheaper tests | New direct spec passes; the trimmed end-to-end specs pass |

## Decisive premises observed during planning

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| A stale kept flag is currently absent from the page and the launch without a word | Slice 1 | Read `LaunchDialog.tsx:105-110,133-136,147` and `StartLaunch.tsx:98,171-174`; no other reader of `kept` | Confirmed by reading. Slice 1 first extends the test and watches it fail before any change. |
| Dialog and refusal share the `why` text and the tests assert full strings | Slice 2 | `grep "options file"` in `dashboard/src`, `dashboard/server`, `dashboard/AGENT-LAUNCH.md`, `dashboard/tests` | Confirmed: `launchOptions.ts:45-61`, `commandOptions.ts:157`, `AGENT-LAUNCH.md:76-80`, asserted in `exclusive.spec.ts:121-146`, `boundary.spec.ts:198-220`, `groups.spec.ts:166`; every occurrence is in slice 2's touched set. |
| The refinement skill mentions groups only at SKILL.md:57-59 | Slice 3 | `grep exclusive src/skills/dough-story-refinement/SKILL.md` | Confirmed, one hit. |
| Pure option rules are importable without a server and run by the same runner | Slice 4 | `agent-launch-options.spec.ts:43` imports `optionsDefinitionSchema` from `../src/commandOptions.ts` and runs under the dashboard Playwright config; `agent-launch-refusal.spec.ts` imports `../src/agentLaunch.ts` | Confirmed. Pure specs in this repo are plain `.spec.ts` files. |
| `commandOptions.ts` exports `optionsDefinitionSchema`, `selectionProblems`, `inDefinitionOrder`, `withChoice`, `withoutGroup`, `offeredShape` | Slice 4 | `grep "^export" dashboard/src/commandOptions.ts` | Confirmed. |
| `readDefinition` (server) decides missing file, unreadable path, "another command", and not-JSON | Slice 4 | Read `launchOptions.ts:30-62` | Confirmed; the schema decides only shape and its failure maps to one `why`. These stay end-to-end. |
| Whether the request shape `options` (list of one-line strings, max 32) is exported for a direct test | Slice 4 | `agentLaunchRequestSchema` is exported (`agentLaunch.ts:207`); `agent-launch-refusal.spec.ts` already tests it directly | Confirmed. |

## Slices

### 1. Say which kept options are no longer offered

- **Type:** Behavior
- **Status:** done
- **Accepted proof:** `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options-exclusive.spec.ts dashboard/tests/agent-launch-options-kept.spec.ts`
  passes (10). The refusal tests moved to the new
  `agent-launch-options-kept.spec.ts`: the refusal test asserts `--a` checked,
  "Not offered any more, so not sent: --c.", `Sent after ... --a.` and argv
  `... --a`; "a kept selection the project no longer offers at all..." asserts
  "--a, --c." with a removed options file and a default launch. Seen red before
  the change. `notOfferedLine` in `StartLaunch.tsx`; the empty offer takes the
  same path as a dropped option.
- **Proof:** Extend the refusal test in `agent-launch-options-exclusive.spec.ts`
  as in the table above and run it red first (premise 1), then implement: the
  dialog derives the not-offered kept flags (`LaunchDialog.tsx` or
  `StartLaunch.tsx`, where the offer's kind is known) and shows one quiet line
  after the options are read. Add a case for an unavailable definition with a
  kept flag if the extended test does not reach it. Document the line in the
  Options paragraphs of `dashboard/AGENT-LAUNCH.md` (the paragraph ending "drops
  it"). Run: `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options-exclusive.spec.ts`.

### 2. One grammatical wording for unavailable options

- **Type:** Behavior
- **Status:** done
- **Accepted proof:** `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options-exclusive.spec.ts dashboard/tests/agent-launch-options-kept.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options-groups.spec.ts`
  passes (56), red first on the new strings. `unavailableOptionsWhy` in
  `commandOptions.ts` owns the four predicates (typed `UnavailableOptionsWhy` at
  `readDefinition`). The refactor split `agentLaunches.ts` into
  `optionsOffer.ts` (`optionsOfferOf`, the page's no-definition case),
  `launchAttempts.ts` and `launchRecordActions.ts`; all launch, session and
  terminal page specs passed after it (358).
- **Proof:** Change the four `why` values (owner in `commandOptions.ts`,
  consumed by `launchOptions.ts`, `agentLaunches.ts:405`), the dialog line in
  `StartLaunch.tsx` if its sentence needs no change beyond the new predicate,
  `AGENT-LAUNCH.md:76-80`, and the asserted strings in `exclusive.spec.ts`,
  `boundary.spec.ts` and `groups.spec.ts`. Expected dialog line: "Options are
  not offered: the installed dough-story-refinement skill in this project has an
  options file that is not valid." Then grep the whole repository for the old
  phrases. Run the three spec files above by name.

### 3. Point the skill's "group" at the definition

- **Type:** Behavior
- **Status:** done
- **Accepted proof:** Behavior review: a request `--a --b` whose flags share one
  `groups` entry leads the agent from "an entry of that file's `groups` list" to
  stop and report the conflict naming the group's `label` and the flags named.
  No test reads this wording; the payload link check
  (`PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/bash scripts/test.sh tests/payload-declaration-links.sh`)
  passes. The shipped definition has no `groups` yet.
- **Proof:** Edit only `src/skills/dough-story-refinement/SKILL.md`: one short
  clause saying a group is an entry of `groups` in
  `references/refinement-options.json`, in the wording the executing agent needs
  (ADR 0006: no maintainer vocabulary). Do not hand-edit installed copies under
  `.agents/skills/` or `.claude/skills/` (AGENTS.md). Walk one use per AGENTS.md
  Behavior review: a request `--a --b` with a definition whose `groups` hold
  both leads to the conflict report naming the group. Run the drift checks the
  repository already runs for skills if any cover `SKILL.md` edits (none is
  assumed).

### 4. Test pure option rules directly, keep end-to-end for what needs a server

- **Type:** Structure
- **Status:** done
- **Accepted proof:** `npx playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-options-rules.spec.ts dashboard/tests/agent-launch-options-groups.spec.ts dashboard/tests/agent-launch-options-boundary.spec.ts dashboard/tests/agent-launch-options.spec.ts dashboard/tests/agent-launch-options-exclusive.spec.ts dashboard/tests/agent-launch-options-kept.spec.ts dashboard/tests/agent-launch-options-entries.spec.ts`
  passes. `--list` counts: groups 16 to 8, boundary 30 to 24 (dev and
  preview); the new rules spec adds 17 direct tests, each deleted case mapped to
  one. The surviving "not JSON" row keeps the "not valid" refusal end to end.
  `agent-launch-refusal.spec.ts` tested the request schema only over HTTP, not
  directly as the premise said; the rules spec now does.
- **Proof:** Behavior is settled by slices 1-3; the change only moves coverage.
  Add `dashboard/tests/agent-launch-options-rules.spec.ts` (plain
  `@playwright/test`, no server, imports `../src/commandOptions.ts` and
  `../src/agentLaunch.ts`) with direct cases, then delete the listed
  end-to-end cases. Run the new file first, then both trimmed files and
  `agent-launch-options.spec.ts`, `agent-launch-options-exclusive.spec.ts`,
  `agent-launch-options-entries.spec.ts` by name, with the focused literal
  command form above.
  - **Direct cases (new):** `optionsDefinitionSchema` accepts a valid
    definition with and without `groups`/`focuses` and rejects: a duplicate flag,
    an entry without an instruction, a flag in two groups, a group member the
    definition does not define, a non-exclusive `selection`, and a flag in both
    `options` and `focuses` (each rejected alone, and the same selection
    `selectionProblems` would have allowed). `selectionProblems` orders unknown
    flags, as given, before exclusive conflicts; names the group label and its
    selected flags in group order; reports two groups independently; and treats
    an option plus a focus of one group as a conflict. `inDefinitionOrder`
    returns definition order across options and focuses, each once, ignoring the
    request's order. `withChoice` replaces the selected member of an exclusive
    group, clears a flag, and leaves a free flag and other groups alone;
    `withoutGroup` clears only that group. The request schema accepts `options`
    absent, empty and up to the limit and rejects a string, a non-string entry,
    an empty entry, `null`, and too many.
  - **Delete from `agent-launch-options-groups.spec.ts`:** the `kind` loop
    "definition has a flag in two groups / a member the definition does not
    define / an exclusive selection of another kind / a flag in both options and
    focuses" (x2 modes). Meaningful coverage moves to the schema cases above;
    the boundary's mapping of a failed schema to "has an options file that is
    not valid" stays covered by the surviving not-JSON case below.
    **Keep:** launching a free flag beside one flag of the group in definition
    order; one flag or none; refusing two flags of one group naming the group
    and both flags; two groups each honored (these prove exclusive-group
    refusal per mode, argv and record order).
  - **Delete from `agent-launch-options-boundary.spec.ts`:** the `kind` loop
    "a duplicate flag / an entry without an instruction" (schema cases) and the
    "options that are not a list of flags" test (request schema cases). Keep
    "not JSON" (one end-to-end proof that `readDefinition` maps an unusable
    definition to the "not valid" refusal), "another command", the missing file,
    the skill not installed, the unreadable definition, options on an execution
    and on an ad hoc request, the unknown-flag refusals, the definition-order
    launch, no selection, focus beside option, and the assertion that no
    `claude` ran on each refusal (`refused` checks no record and no call).
  - **Kept end-to-end for their own reasons:** file state of `readDefinition`;
    one exclusive-group refusal per mode; unknown flag refusal; refused before
    any `claude` runs; argv and record order.
  - Count the removed tests before and after (`--list`, dev and preview) and
    report both numbers; behavior coverage must not shrink, only its level.

## Learnings

- The page reads the definition again only on its periodic sessions read, so a
  page test that changes the definition after a refusal advances the paused
  clock by `checkIntervalMs` before reopening the dialog.
- Slice 1's refactor split the kept-selection tests into
  `agent-launch-options-kept.spec.ts` and moved the shared grouped fixture to
  `groupedOptions` in `launchCardPage.ts`; slice 4 runs that file too.
- `agent-launch-options-boundary.spec.ts` is 259 lines after slice 2; slice 4's
  planned cuts bring it under the 250-line limit.
